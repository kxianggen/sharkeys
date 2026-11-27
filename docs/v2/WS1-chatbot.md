# WS1 — A chatbot that understands normal people (plus faster replies)

## Paste this to start (Claude Code, repo root, branch `v2/ws1-chatbot`)

> You're working on Sharkeys v2, workstream WS1. Read `docs/v2/00-plan.md`, `docs/v2/WS1-chatbot.md`, and the WS0 baseline in `eval/v2/results/`. Start in plan mode and wait for my approval. You may only use the DEV set for examples and tuning; never look at TEST messages while tuning. When you finish, fill in "Report back", then walk me through the Learn card in plain words.

## Why

- **The routing problem.** KeyBot sends each message down a route using about 15 hand-written keyword patterns (`classifyKeybotMessage` in `src/lib/keybot/service.ts`). Anything worded differently falls through to `vague_question`. For example, "I type at night and my roommate sleeps" contains no "quiet" or "silent" keyword, so it misses.
- **The speed problem.** Replies take about 2.4 s. October's benchmark showed that about 1.2 s of that is spent building facts (most likely fetching the catalogue) before the model is even called.

## Targets

| Metric | Target |
|---|---|
| Routing accuracy on the TEST set | ≥90% |
| Fallback to `vague_question` | <5% |
| Intent field accuracy | +10 points over baseline |
| Simulated task success | Up |
| Invented parts | Stays 0 |
| p50 reply time | <1.5 s |
| Extra cost per message | Reported |

## Requirements

**Must:**
- an AI router, with the current rules kept as a safety net
- the same route labels, so the answer code downstream keeps working
- timeouts and a fallback
- catalogue caching
- no regression on the existing 58-case eval

**Should:**
- better intent extraction on messy text (Manglish, "rm2xx", "below 3 hundred")
- a clarifying question when a message is truly unclear, instead of a guess

**Won't:** change the rule engine or the UI.

## Subtasks

1. **Measure the current router on its own** against the TEST set, and build a confusion table (which routes get mixed up with which). This shows where to focus.
2. **AI router.** One fast model call returns `{route, confidence, reason}`, checked against a zod enum (this is structured output). The prompt holds the route definitions plus about 10 examples from the DEV set only. To make it better:
   - If confidence is low, ask a clarifying question instead of guessing.
   - If the model takes longer than 1.5 s or errors, fall back to the current keyword router.
   - Keep the instant keyword path for obvious small talk and help messages, which saves cost and time.
3. **Context for follow-ups.** Pass the current build and the last 2 turns, so "make it quieter" and "why that one?" route correctly.
4. **Intent extraction on messy input.**
   - Add a clean-up step for currency, ranges and slang.
   - Add few-shot examples from DEV.
   - Measure accuracy field by field.
5. **Speed.**
   - Cache the catalogue in memory, refreshing about every 10 minutes or after an import.
   - Run independent fact-building steps in parallel. Consider starting the classification and the catalogue fetch at the same time.
   - Re-run `bench-ai-latency` and report p50 and p95.
6. **Guardrail check.** Run the trap messages and confirm there are no invented parts and that injection attempts are refused.
7. **Re-run the WS0 scorecard** and compare it with the baseline. Write a short "where AI helped vs. where rules were enough" table, keeping the honest framing from the FYP.

## Tools

- **The existing LangGraph pipeline.** There's already a classify node in `src/lib/agent/nodes/classify.ts`. Check whether the KeyBot and agent paths route messages twice in different ways, and unify them if that's cheap.
- **zod structured outputs.**
- **LangSmith tracing** (already installed), to see each step's time and output.

## Done when

- The targets are met, or the miss is explained.
- The 58-case eval is no worse.
- `npm run verify` passes.
- The new scorecard is committed.

## Watch-outs

- **Tuning on TEST is forbidden.** Use DEV only.
- **Latency creep:** an extra model call adds time, so budget for it.
- **Two routers drifting apart** (the KeyBot one and the agent one).

## Learn card

**Flow:** message → instant rules for the obvious ones → AI router picks a route with a confidence score → if confidence is low, ask the user → otherwise fetch facts (from the cached catalogue) → rule engine checks the build → answer.

- **Classification:** sorting a message into one of a fixed set of boxes.
- **Structured output:** the AI must answer in a fixed shape that code can check.
- **Few-shot:** showing the model a few worked examples in the prompt.
- **Fallback:** a plan B for when the AI is slow or wrong.
- **Cache and TTL:** keep a copy nearby, and refresh it after a set time (the "time to live").
- **Latency budget:** how many milliseconds each step is allowed to take.
- **Confusion matrix:** a table of what got mistaken for what.

**Interview questions to practise:**
- "Why not let the LLM do everything?"
- "What happens when OpenAI is slow?"
- "How did you pick examples without cheating?"

## Report back (session fills this in)

- What changed, in plain words, with the files
- Before/after numbers (scorecard plus the confusion table)
- p50 / p95 reply time, and the extra cost per message
- Requests for other workstreams
- Open questions for HQ
