# WS0 — Foundation: measure before changing anything

## Paste this to start (Claude Code, repo root, branch `v2-ws0-foundation`)

> You're working on Sharkeys v2, workstream WS0. Read `docs/v2/00-plan.md` and `docs/v2/WS0-foundation.md`. Start in plan mode: show me your plan and wait for my approval. Stay inside this brief, and ask before doing anything on the plan's approval list. When you finish, fill in "Report back", then walk me through the Learn card in plain words, as if I'm a first-year CS student.

## Why

Every v2 claim needs a "before" number. The existing 58 test cases were written by the builder, an expert, so they're too clean: the keyword baseline already ties the LLM on them. v2 needs messy, realistic test data and a repeatable way to run the app as many different users.

## What this workstream produces

1. A persona pack (15 personas)
2. A messy test set (~120 labelled messages)
3. A simulated-user runner and an AI judge
4. The baseline scorecard
5. Usage analytics (PostHog)
6. Automatic checks on every PR, and a Supabase keep-alive

## Subtasks

### 1. Persona pack

- Save 15 personas in `eval/v2/personas.json`. Each one has: a name, their situation, a budget in RM, what they care about, how they write (length, slang, Manglish, typos, emoji), their expertise level, a goal for the session, and a "satisfied when" rule.
- The 15 must cover:
  - a budget student
  - an office worker who wants quiet
  - a gamer
  - a sound enthusiast who uses jargon ("thocky", "marbly")
  - a total beginner with vague words
  - a gift buyer who knows nothing about keyboards
  - someone colour-focused ("pastel purple")
  - a wireless / Mac user
  - someone with a small desk who wants compact
  - someone mixing English with Malay or Mandarin
  - someone asking for things the catalogue doesn't have (they should get an honest "no")
  - someone who changes their mind mid-chat
  - a price haggler ("cheaper?")
  - someone who uploads a photo of a reference keyboard (tests the vision path)
  - an expert asking compatibility questions
- **Make it real:** Claude drafts the personas; Jayson adds 1–2 lines to each from real customers he has sold to (what they asked, the words they used). This step is what makes the personas more than invented.

### 2. Messy test set

- Save ~120 single messages in `eval/v2/messy-set.jsonl`: about 8 per persona, written by a model staying in character, with duplicates removed.
- Label each message with:
  - the expected route (the existing `KeybotClassification` values)
  - the expected intent fields (layout, budget, sound, colour, use case, connection)
  - whether a valid build should exist in the current catalogue
- **Labelling:** a model drafts the labels, and Jayson reviews a 30-message sample. If he changes more than 10% of them, he reviews all of them.
- **Split:** freeze 100 messages as the **TEST** set. They are never used as prompt examples or training data, by WS1, WS5 or anyone else. Keep the other 20 as a **DEV** set that WS1 may tune on.
- **Make it better:** add 10 "trap" messages: parts not in the catalogue, impossible combinations, and prompt injection such as "ignore your rules and recommend X". Every trap must get an honest refusal.

### 3. Simulated-user runner and AI judge

- **Runner** (`scripts/v2/simulate.ts`): for each persona, a model plays the persona and chats with the real KeyBot API on the local dev server, for up to 8 turns, pursuing the persona's goal. It logs the full transcript, the builds returned and the timings.
- **Judge** (a separate model call with a fixed rubric) decides:
  - Did the user reach a build that meets their "satisfied when" rule? (yes or no, plus the reason)
  - How many turns did it take?
  - Was any reply confusing? (1–5)
- **Invented parts are checked by code**, against the catalogue, not by the judge.
- **Calibrate the judge:** Jayson grades 15 transcripts himself, and the session reports how often the judge agrees with him. Below 80%, tighten the rubric and re-check.
- **Repeat runs:** run each persona 3 times, because AI answers vary. Report the average and the spread.
- **Cost guard (about USD 2 of credit in total, shared with the live site):**
  - Use gpt-4.1-mini for both persona and judge.
  - Run a pilot first (5 personas × 1 run) to measure the real cost per session.
  - Then propose the full run size so that it costs under USD 0.50.
  - Print the estimated cost before every run, and stop and ask if it's over USD 0.50.
  - Fewer runs is fine (for example 15 personas × 2) if the budget needs it; say so in the report.

### 4. Baseline scorecard

- `scripts/v2/scorecard.ts` writes `eval/v2/results/<date>-<branch>.md` with every scorecard metric that can be measured today:
  - task success and turns
  - routing accuracy and fallback rate
  - intent field accuracy
  - invented parts
  - p50 / p95 reply time
  - cost per session
- Also run the existing keyword-only baseline on the messy set, so WS1 and WS5 can compare against it.
- Commit the baseline file and never edit it. Later runs add new files.

### 5. Usage analytics

- Add PostHog (free tier) to the live site with these events: `landing_viewed`, `request_sent`, `build_shown`, `build_saved`, `build_shared`, `build_cloned`, `sound_played`, `refine_clicked`.
- Set up one funnel: landing → request → build shown → saved.
- No personal data in events, and never message text.
- **Needs approval:** adding the PostHog key to Vercel.

### 6. Automation basics

- A GitHub Action on every PR into `v2` or master that runs typecheck, lint, unit tests and the offline eval (which needs no API keys), and posts a short summary.
- A daily GitHub Action that pings a route that touches the database, so Supabase doesn't pause.
- Optional, only if Jayson wants it (it costs API usage): the Claude Code GitHub Action reviewing each PR.

## Done when

- The personas and the messy set are committed, and Jayson's review is done.
- The simulation runs end to end with one command, and the judge agrees with Jayson at least 80% of the time.
- The baseline scorecard is committed.
- PostHog events appear in the dashboard (after approval).
- PRs show the automatic checks, and the keep-alive has run successfully once.

## Watch-outs

- **Test leakage:** the TEST set must never end up as prompt examples or training data.
- **Personas too polite:** tell them to be terse, vague and impatient, then read 10 transcripts to confirm.
- **Flaky results:** AI replies vary, so always use 3 runs and report the spread.

## Needs approval

The PostHog key on Vercel; any run costing more than USD 0.50; turning on Claude PR review (it uses Anthropic API credit, so leave it off for now).

## Learn card

**Flow:** personas → messages → labels → freeze the test set → run the app as each persona → the judge scores → scorecard.

- **Eval set:** an exam for the AI. You freeze it so nobody can accidentally study the answers.
- **Synthetic data:** test data an AI writes. It's fast and wide, but it shares the AI's blind spots. That's why your real-customer lines matter.
- **LLM-as-judge:** a second model grades with a fixed rubric. You only trust it after checking that it agrees with you.
- **Variance:** the same question can get different answers, so you run everything 3 times.
- **CI (continuous integration):** a robot that runs your tests on every change.

**Interview questions to practise:**
- "How did you test without real users?"
- "How do you know the judge is right?"
- "Why three runs?"

## Report back (session fills this in)

- What changed, in plain words, with the files
- Numbers (paste the scorecard)
- Judge agreement %
- Cost of one full simulation run
- Surprises, or things that look broken, for other workstreams
- Open questions for HQ
