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

_27 Nov 2026, branch `v2-ws0-foundation` (local, not pushed). Items still waiting on an approval are marked **PENDING**._

### What changed, in plain words

| area | what | files |
|---|---|---|
| Branch names | `v2/wsN` can't exist next to a branch called `v2`, so all briefs now say `v2-wsN-name` | `docs/v2/*.md` |
| PR checks | On every PR into `v2` or master: typecheck, lint, tests, build and the offline eval, plus one summary comment. The eval has 2 known failures, so a small gate passes CI unless a **new** failure appears. | `.github/workflows/ci.yml`, `scripts/v2/ci-eval.ts`, `eval/known-failures.json`, `scripts/run-eval.ts` (adds an optional `EVAL_JSON_OUT`; default unchanged) |
| Keep-alive | `/api/health` reads the catalogue from Supabase and returns 503 if it had to fall back (so a paused DB shows as a failure). A daily Action calls it on the live site. | `src/app/api/health/route.ts`, `.github/workflows/keepalive.yml`, test |
| Analytics | A ~100-line PostHog sender instead of the SDK: no autocapture, no recording, no cookies, anonymous per-tab id, allowlisted props only (message text cannot be sent). Does nothing without `NEXT_PUBLIC_POSTHOG_KEY`. Wired: `landing_viewed`, `request_sent`, `build_shown`, `build_saved`. Typed, waiting for their features: `build_shared`, `build_cloned`, `sound_played`, `refine_clicked`. | `src/lib/analytics/index.ts`, `src/components/analytics-page-view.tsx`, `src/app/page.tsx`, 4 one-line calls in `src/components/recommendation-demo.tsx`, test |
| Personas | 15 personas grounded in the 60-part catalogue. **AI-drafted, reviewed by Jayson; no real-customer lines** (Checkpoint A skipped). | `eval/v2/personas.json` |
| Messy set | 120 labelled messages: 100 TEST (8 traps) frozen by hash, 20 DEV (2 traps); 56 search rows (scored on intent), 64 follow-ups with on-screen build context (scored on route). A freeze test and a leakage test run in CI. | `eval/v2/messy-set.jsonl`, `eval/v2/TEST.sha256`, `eval/v2/review-sample.md`, `tests/v2/` |
| Simulator + judge | gpt-4.1-mini plays each persona against the real local app (search box, Meg's chat, photo upload, mirroring the UI) for up to 8 turns. A separate gpt-4.1-mini judge (rubric-v1, temperature 0) grades success, turns, confusion and honesty. **Code** checks invented part IDs (hard fail) and each persona's hard requirements (budget, layout, etc.). Cost guard: estimate first, stop above USD 0.50. | `scripts/v2/simulate.ts`, `scripts/v2/lib/*`, `scripts/v2/judge-agreement.ts` |
| Scorecard | One command writes a dated results file, never overwritten. | `scripts/v2/scorecard.ts`, `eval/v2/results/` |

### (a) Runs, and what changed between them

Run names are run-1/2/3 and simulators simulator-1/2/3, so nothing clashes with the project's "v2". Full detail: `eval/v2/runs/README.md`.

| run | what | simulator | status |
|---|---|---|---|
| smoke | 1 persona, 3 turns | simulator-1 | pipeline check |
| run-1 | pilot, 5 personas × 1 | simulator-1 | measured cost |
| run-2 | 15 × 1 | simulator-2 | superseded |
| **run-3** | 15 × 1 | simulator-3 | **committed baseline** |

- **simulator-1 → 2** (after reading the pilot transcripts): the persona was shown text the real UI doesn't show after a successful search; it didn't see Meg's part chips; it could "accept" with nothing on screen.
- **simulator-2 → 3** (after reading run-2): the screen showed 3 of a build's 6 parts, while the real card shows all 6. One persona was visibly misled (couldn't see the plate).
- The rubric stayed **rubric-v1** in every run.

### (b) Committed baseline

**Run-3 only** → `eval/v2/results/2026-11-27-v2-ws0-foundation.md` (section A = TEST split, offline plus the LLM intent column; section C = run-3). No numbers from run-1 or run-2 are in it. The header says `@ 4a9146a`, the last commit at run time; the simulator-3 code was committed straight after, in this PR.

### Numbers (from the baseline file)

**Messy TEST set** (100 rows: 48 search, 52 follow-up)

| metric | keyword baseline (offline) | LLM extractor (gpt-4o-mini) |
|---|---|---|
| routing accuracy (follow-up rows) | **13.5%** | not measured (WS1) |
| falls back to `vague_question` | **57.7%** | not measured (WS1) |
| intent accuracy on stated fields (68 fields) | **86.8%** | **94.1%** |
| use case (stated) | 63.6% | 63.6% |
| something added to an unstated field | 1.4% | 2.7% |
| search rows with every field right | 79.2% | 81.3% |
| build returned when one should exist (offline, seed catalogue) | 97.1% | — |
| build returned when **none** should exist | **61.5%** | — |

Routing is the production default (regex). The LLM router behind `KEYBOT_LLM_CLASSIFY` exists but is off by default and was not measured (WS1 will).

**Simulated users, run-3** (15 personas × **1 run, spread unknown**)

| metric | value |
|---|---|
| task success (judge) | 46.7% (7/15) |
| task success (judge AND code check of hard requirements) | 46.7% (7/15) |
| task success (confirmed grades: HQ-graded, Jayson-confirmed) | 46.7% (7/15), but not the same 7 sessions: judge agreement is 12/15 |
| turns to an accepted build (successful sessions) | mean 3.0, median 3 |
| confusion (1 clear … 5 unusable) | 1.93 |
| **invented parts: unknown component IDs** | **0** |
| invented parts: possible text flags | 3 (all Keychron / HHKB / Topre, echoed from the user while saying "not stocked") |
| honesty where something unavailable was asked | 100% as judged (see surprise 7) |
| reply time per app call, p50 / p95 | 3.5 s / **16.4 s** |
| cost per session | USD 0.0041 persona+judge (measured) + ~0.012 app (estimated) |

### (c) Checkpoints

- **A (real-customer lines): skipped** by Jayson's decision. Personas are labelled "AI-drafted, reviewed by Jayson". Don't use the HQ plan's wording "grounded in my 150+ customer builds".
- **B (label review): done.** 30-row sample, **0 of 30 changed**, appendix of 10 label-vs-engine disagreements accepted. TEST frozen after the review.
- **C (judge calibration): done.**
  - The 15 run-3 transcripts were **graded by HQ (Claude) from the full transcripts and confirmed by Jayson** (all 15, including the borderline p02 and p10). They were not human-graded from scratch.
  - So this measures agreement between two AI graders, one of them checked by a human. It is not the judge against independent human judgement.
  - Grades: `eval/v2/calibration/grades.json`. Score: `eval/v2/calibration/agreement.md`.

| measure | agreement |
|---|---|
| **success yes/no** (bar 80%) | **80.0% (12/15)**: meets the bar, with no margin |
| confusion within ±1 | 53.3% (8/15); the judge rated confusion lower than HQ in 11 of 15 |
| turns to success, exact (both said success) | 40.0% (2/5) |

**Judge vs persona acceptance.** Personas sometimes accept builds that don't meet their own goal. The judge must grade the builds on screen against the "satisfied when" rule, never the persona's acceptance.
- Personas accepted a build in 9 sessions. **5 of those 9 builds did not meet the rule** (p02, p03, p07, p14, p15, per the confirmed grades).
- The judge called **2 of those 5 a success anyway** (p03, p14).
- The third disagreement, p10, goes the other way: the persona gave up while the build on screen met the rule, and the judge said fail.
- So **all 3 judge disagreements follow the persona's ending** (accept → success, give up → fail) instead of the screen.
- The cause is in rubric-v1, which defines success as "a fitting build AND the customer accepted it". The code check of hard requirements didn't rescue these cases: judge AND code check also agrees 12/15.
- Proposed fix (rubric-v2, not applied, see open question 3): grade success only from the builds on screen against the rule; strip "accepts build N" and "gave up" from the transcript the judge sees; give anchored examples for confusion. Re-judging run-3 costs about USD 0.02 (judge only, no app calls) and would go into a new results file.

### Cost of one full simulation run (15 × 1)

About **USD 0.25**: persona + judge USD 0.062 (measured from tokens) plus the app's own 84 calls at about USD 0.0022 each (derived from the balance drop below).

### (d) Total WS0 spend and balance

- **Total WS0 spend: USD 0.70** (USD 1.73 at the start, **USD 1.03 now**). This was read from the OpenAI usage page, so it includes any live-site traffic in the same period.
- Breakdown:
  - persona + judge (measured from tokens): USD 0.146 across the smoke test, run-1, run-2 and run-3;
  - the app's own OpenAI calls: about USD 0.55, from 200 calls in the simulations plus 48 for the LLM intent column, so about USD 0.0022 per call.
- Every single run stayed under the USD 0.50 cap, and the balance never went below USD 0.50.

### Surprises and things that look broken (for other workstreams)

1. **Live bug: recommendations depend on catalogue row order.** (WS2 owns `src/lib/components/`; `src/lib/recommendations/` has no owner.) The same 60 Supabase rows in Supabase order give "no build under RM350, closest RM474"; put in seed order, they give RM281–331 builds. `fetchSupabaseCatalogComponents` orders by category only. This hides the cheapest builds on the live site, and is the main reason all 4 budget personas failed. The offline eval can't see it because it uses the seed order.
2. **Routing on short follow-ups is weak** (WS1): 13.5% correct, 57.7% fall to `vague_question` ("still ex bro, got cheaper?", "can change the keycaps to white?").
3. **No honest "no"** (WS1): for things the catalogue doesn't have (Keychron Q1, split, 40%, pink keycaps), the offline app returns ordinary builds (61.5% of such rows). "Wireless 75%" gets **wired** 75% builds, because the intent schema has no connection field.
4. **Meg claims actions she can't take** (WS1 honesty, WS4 UX): "I swapped out one build… on screen", when chat can't change the builds panel. Users ask Meg for changes and nothing happens on screen. WS4's refine chips or "apply Meg's suggestion" would close this.
5. **Grounding miss** (WS1): Meg said the catalogue has no purple keycaps; the Gradient set (blue/purple) exists.
6. **Slow tail** (WS1): p95 16.4 s against p50 3.5 s. That fits one 7-second timeout plus a retry in `src/lib/openai/client.ts`.
7. **The judge follows the persona, and is lenient**: all 3 success disagreements follow the persona's accept/give-up (see (c)). It rated confusion lower than HQ in 11/15 sessions, and rated every session "honest", never using "not applicable", including sessions where Meg was wrong about stock or prices. The confirmed grades also list more Meg errors than the judge caught: wrong compatibility answers (p15: "screw-in stabs fit the GMK67 PCB"), vision reading a 65% photo as 75% (p14), and false price claims ("nothing under RM450", p09).
8. "Full keyboard" (meaning a full set) is read as full-size layout, and the cheapest full-size build is about RM420.
9. Use case is the weakest intent field for both extractors (63.6%).
10. PostHog's 4 remaining events need one `track(...)` line each when WS3/WS4 build share, clone, sound and refine.
11. Heads-up for WS4: the analytics change adds 4 one-line `track` calls to `recommendation-demo.tsx`.
12. `npm audit`: 24 vulnerabilities (1 critical). Out of scope, noted.

### Open questions for HQ

1. **Fix the row-order bug before WS1 measures?** If it's fixed during WS1, WS1's before/after numbers on budget personas will include the fix. Suggest: fix first (with an order-independence test), re-run the baseline as run-4 (about USD 0.24), and give WS1 that as its "before".
2. Repeat runs (3 per persona) wait for a top-up: about USD 0.50 for two more runs of 15. With USD 1.03 left, they fit, but would leave about USD 0.53, close to the USD 0.50 floor.
3. **Rubric-v2?** Success graded only from the builds on screen (acceptance and give-up hidden from the judge), anchored confusion examples, and stricter honesty. Re-judge run-3 (about USD 0.02) into a new results file and re-score agreement. Until then, read "task success" as judge AND HQ-confirmed: 7/15 on both, but not the same 7 sessions.
4. Approvals still needed: push and open the PR (so the CI checks run), the `LIVE_SITE_URL` repository variable, the PostHog key on Vercel, and a deploy (for `/api/health`, the keep-alive and the analytics).

### Done-when status

| item | status |
|---|---|
| Personas and messy set committed, Jayson's review done | done (A skipped, B done) |
| Simulation runs end to end with one command | done |
| Judge agrees with the grades ≥ 80% | done: **80.0%** (HQ-graded, Jayson-confirmed); rubric-v2 proposed |
| Baseline scorecard committed | done (`d8fba83`, run-3) |
| PostHog events in the dashboard | **PENDING** (key + deploy approval) |
| PRs show the checks; keep-alive ran once | **PENDING** (push + deploy approval) |
