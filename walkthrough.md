# Phase 3 Walkthrough — LangGraph Agent + Tracing

## Goal
Replace the brittle 12-branch regex in `classifyKeybotMessage()` with a stateful
LangGraph agent, add LangSmith tracing scaffolding, and preserve the
compatibility invariant + eval baseline.

## What was built

### Dependencies
- Installed `@langchain/langgraph`, `@langchain/openai`, `@langchain/core`,
  `langsmith`. No zod-v4 peer conflict (LangChain v1 supports zod 4). `openai`
  bumped `6.36 → 6.42` (within range).
- Appended LangSmith placeholders to `.env.local`: `LANGCHAIN_TRACING_V2=false`
  (off until a real key is pasted), `LANGCHAIN_API_KEY=`, `LANGSMITH_PROJECT=sharkeys`.

### Agent (`src/lib/agent/`)
- **`state.ts`** — `KeybotAgentState` via `Annotation.Root`. Tracks `request`,
  `classification`, `intent`, `candidateIds`, `validationResult`, plus the full
  response shape (`answer`, `source`, `usedCatalogContext`,
  `usedRecommendationEngine`, `relatedIds`, `clarification`, `error`) so the
  `answer` node emits a schema-valid `KeybotResponse`.
- **`nodes/`**
  - `classify` — hybrid router. Confident regex match wins (it is the curated
    eval ground truth); the LLM router engages only on `vague_question` and only
    when `KEYBOT_LLM_CLASSIFY=true` + an API key is present. Default off ⇒
    deterministic ⇒ baseline matched.
  - `extract` — wraps `extractKeyboardIntent`.
  - `retrieve` — wraps Phase 2 `prepareIntentMatchesAsync` (pgvector semantic).
  - `validate` — builds a top-pick selection and runs
    `validateBuildSelectionFromIds` (the rule engine — sole compatibility
    authority; never bypassed/overridden).
  - `answer` (`compose` node) — delegates to `buildGroundedKeybotResponse`, the
    single grounding authority. OpenAI may only *reformat* grounded facts, never
    author product/price/compat claims.
- **`graph.ts`** — `StateGraph` with conditional routing off `classify`
  (`build_request` → extract → retrieve → validate → compose; everything else →
  compose). `MemorySaver` checkpointer (in-request scratch). Exports
  `invokeKeybotAgent(request, options)`.

### Wiring
- `POST /api/keybot` now calls `invokeKeybotAgent`. Response schema unchanged.
- `generateKeybotResponse` kept as a thin backwards-compatible wrapper over
  `invokeKeybotAgent` (eval runner + `keybot/index` untouched).
- `service.ts` refactored: exported `classifyKeybotMessage` /
  `KeybotClassification`, extracted `buildGroundedKeybotResponse` core.

## Memory decision
In-memory `MemorySaver` does not survive stateless/serverless API requests and
needs a `thread_id` the schema lacks. Cross-turn context is therefore carried
via the existing `request.context` (`conversationHistory`/`recentMessages`);
`MemorySaver` is wired as in-request scratch. A durable Postgres checkpointer +
session id is deferred (Phase 4 territory).

## Verification
- `npm run verify` — typecheck clean, **137 tests pass**, `next build` succeeds,
  lint 0 errors (4 pre-existing warnings).
- `npm run eval` (offline) — **34 / 12 / 2-expected-fail / 2-pending**, identical
  to the legacy pipeline.
- `EVAL_SEMANTIC=true npm run eval` (default routing) — **44 pass / 4 fail /
  2 pending**, matches the pre-Phase-3 semantic baseline exactly; rr-007/008
  still pass (Phase 2 semantic intact). The 4 fails are pre-existing (intent ×2,
  kg-008, kg-010).

## Known tradeoff
Enabling the LLM router (`KEYBOT_LLM_CLASSIFY=true`) regresses **kg-006**: the
LLM reroutes "what switches do you have for gaming?" away from the regex's
`vague_question` bucket whose curated answer the eval asserts on. The flag
defaults off so the documented "match-or-beat baseline" gate holds. Options to
revisit: prompt-tune the router, or relax kg-006's brittle term assertions.

## Remaining (user actions)
- Sign up at smith.langchain.com, paste `LANGCHAIN_API_KEY`, set
  `LANGCHAIN_TRACING_V2=true`, observe traces.
- Decide on the LLM-router default vs the kg-006 tradeoff.
- Rotate the Supabase `service_role` key (carried over from Phase 2).
