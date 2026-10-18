# Sharkeys — notes for Claude Code

AI-assisted configurator for custom mechanical keyboards (my FYP, BSc CS, Sunway University).
Next.js 16 + TypeScript, Supabase Postgres + pgvector, LangGraph, OpenAI, Vitest, Playwright.
Users describe a keyboard in plain language; the app returns complete builds where every part fits.

## The one architectural rule
The deterministic rule engine (`src/lib/rules/compatibility.ts`) is the ONLY authority on
compatibility. The AI layer interprets requests and explains; it never approves a build.
Validation sits inside the recommendation path. Never add a path that skips validation, and do
not modify the rule engine or the catalog (`src/data/components.ts`) unless I explicitly ask.

## How we work
I'm a new graduate; my weak spot is writing code, not reading it.
- You may write the code. I own the decisions: ask before anything that changes behaviour.
- Start non-trivial work in plan mode. Prefer small, reviewable changes on a branch.
- Before I accept a change, explain in plain language what changed and why, file by file.
- Never commit or push without my OK.
- Measure before and after any change that claims an improvement: same machine, same day,
  same script. Never compare a new number with an old number from a different run.

## Secrets — hard rules
- Never read, print or copy `.env.local` (OpenAI key, Supabase keys). `.env*` is gitignored; keep it that way.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only: never in client components, never `NEXT_PUBLIC_`.
- No secrets in code, commits, logs or screenshots.
- `docs/` and `report/` are local-only folders: never add them to git.

## Commands
- `npm run dev` → http://localhost:3000 (works with no keys: local catalog + keyword intent)
- `npm run verify` = typecheck + lint + test + build. Must pass before anything is called done.
- `npm run test` (Vitest), `npx playwright test` (browser tests in e2e/)
- `npm run eval` = offline eval, free and deterministic (expected 54 pass / 2 fail / 2 expected-fail of 58)
- `EVAL_SEMANTIC=true npm run eval` calls OpenAI (costs money): only when I ask.
- Benchmarks: `npx tsx --tsconfig tsconfig.json scripts/<name>.ts`;
  `scripts/bench-ai-latency.ts` calls OpenAI (costs money): only when I ask.

## Where things are
- `src/lib/rules/` rule engine · `src/lib/ai/` intent extraction · `src/lib/recommendations/` build assembly
- `src/lib/agent/graph.ts` Keybot LangGraph: classify → extract → retrieve → validate → compose
- `src/lib/keybot/service.ts` the compose call (OpenAI Responses API, structured output via zod)
- `src/app/api/` routes: `keybot`, `ai/intent`, `ai/vision-intent`, `builds/validate`, `components`, `recommendations`
- `evidence/` FYP measurement trail; every number there was produced by a script in `scripts/`.
  Don't hand-edit numbers; re-run the script.

## Wrap-up scope (Oct 2026) — only these five items
1. Live demo on Vercel (Hobby), first with no AI keys.
2. README: live link, screenshot, results table, limitations.
3. Mark `evidence/` as the raw FYP measurement trail; README is the main document.
4. Before AI goes public: per-IP rate limit on the AI routes, OpenAI request timeouts, max input length.
5. Stream Keybot replies; measure time to first token before and after (FYP baseline: median 2,410 ms
   total reply, no streaming; requirement: first text under 2,000 ms).
