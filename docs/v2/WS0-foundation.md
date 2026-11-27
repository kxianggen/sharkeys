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

_27 Nov 2026. PR [kxianggen/sharkeys#5](https://github.com/kxianggen/sharkeys/pull/5) (`v2-ws0-foundation` → `v2`) is merged; the freeze follow-up is on `v2-ws0-freeze`. HQ verdict: APPROVED, with the changes below applied. Items waiting for the v2 wrap-up are marked **LATER**._

### What changed, in plain words

| area | what | files |
|---|---|---|
| Branch names | `v2/wsN` can't exist next to a branch called `v2`, so all briefs now say `v2-wsN-name` | `docs/v2/*.md` |
| PR checks | On every PR into `v2` or master: typecheck, lint, tests, build and the offline eval, plus one summary comment. The eval has 2 known failures, so a small gate passes CI unless a **new** failure appears. | `.github/workflows/ci.yml`, `scripts/v2/ci-eval.ts`, `eval/known-failures.json`, `scripts/run-eval.ts` (adds an optional `EVAL_JSON_OUT`; default unchanged) |
| Keep-alive | `/api/health` reads the catalogue from Supabase and returns 503 if it had to fall back (so a paused DB shows as a failure). A daily Action calls it on the live site. | `src/app/api/health/route.ts`, `.github/workflows/keepalive.yml`, test |
| Analytics | A ~100-line PostHog sender instead of the SDK: no autocapture, no recording, no cookies, anonymous per-tab id, allowlisted props only (message text cannot be sent). Does nothing without `NEXT_PUBLIC_POSTHOG_KEY`. Wired: `landing_viewed`, `request_sent`, `build_shown`, `build_saved`. Typed, waiting for their features: `build_shared`, `build_cloned`, `sound_played`, `refine_clicked`. | `src/lib/analytics/index.ts`, `src/components/analytics-page-view.tsx`, `src/app/page.tsx`, 4 one-line calls in `src/components/recommendation-demo.tsx`, test |
| Personas | 15 personas grounded in the 60-part catalogue. **AI-drafted, reviewed by Jayson; no real-customer lines** (Checkpoint A skipped). | `eval/v2/personas.json` |
| Messy set | 120 labelled messages: 100 TEST (8 traps) frozen by hash, 20 DEV (2 traps); 56 search rows (scored on intent), 64 follow-ups with on-screen build context (scored on route). A freeze test and a leakage test run in CI. | `eval/v2/messy-set.jsonl`, `eval/v2/TEST.sha256`, `eval/v2/review-sample.md`, `tests/v2/` |
| Simulator + judge | gpt-4.1-mini plays each persona against the real local app (search box, Meg's chat, photo upload, mirroring the UI) for up to 8 turns. A separate gpt-4.1-mini judge (**rubric-v3**, temperature 0) grades success from the builds on screen, plus turns, confusion and honesty. **Code** checks invented part IDs (hard fail) and each persona's hard requirements. `rejudge.ts` re-grades an existing run with the current rubric. Cost guard: estimate first, stop above the cap. | `scripts/v2/simulate.ts`, `scripts/v2/rejudge.ts`, `scripts/v2/lib/*`, `scripts/v2/judge-agreement.ts` |
| Scorecard | One command writes a dated results file, never overwritten. | `scripts/v2/scorecard.ts`, `eval/v2/results/` |
| WS1 work list | HQ's findings from the 15 calibration chats, in priority order | `docs/v2/ws0-baseline-findings.md` |

### (a) Runs, simulators and rubrics

Names are run-N, simulator-N and rubric-vN, so nothing clashes with the project's "v2". Detail: `eval/v2/runs/README.md`, `eval/v2/results/README.md`.

| run | what | simulator | status |
|---|---|---|---|
| smoke | 1 persona, 3 turns | simulator-1 | pipeline check |
| run-1 | pilot, 5 personas × 1 | simulator-1 | measured cost |
| run-2 | 15 × 1 | simulator-2 | superseded |
| **run-3** | 15 × 1 | simulator-3 | **the baseline run** |

- **simulator-1 → 2** (after the pilot): the persona was shown text the real UI doesn't show after a successful search; it didn't see Meg's part chips; it could "accept" with nothing on screen.
- **simulator-2 → 3** (after reading run-2): the screen showed 3 of a build's 6 parts, while the real card shows all 6. One persona was visibly misled.

Run-3's transcripts were judged three times; only the judge changed, never the transcripts:

| rubric | change | agreement with confirmed grades (success) | confusion ±1 |
|---|---|---|---|
| rubric-v1 | success = fitting build AND the customer accepted it | 80.0% (12/15) | 53.3% |
| rubric-v2 (HQ-approved) | success only from the builds on screen; accept/give-up hidden from the judge; anchored confusion examples; stricter honesty, checked against a catalogue list | **66.7% (10/15): below the bar** | 53.3% |
| **rubric-v3** | v2 plus general fixes for v2's misses: compatibility fields in the judge's catalogue list (it had wrongly said screw-in stabs fit the GMK67 PCB); the judge is told what the uploaded photo shows; explicit budget tolerance (≤5% over for "about"/flexible); only the "satisfied when" rule counts, not extra wishes from chat; a later false claim cancels an earlier honest answer | **80.0% (12/15)** | **80.0%** |

- **Why rubric-v3 and not v2 is canonical.** HQ approved v2 as the canonical rubric, but v2 fell below the 80% bar. The brief says to tighten and re-check, so I made v3. **HQ accepted rubric-v3 as canonical and froze it, with simulator-3, for the rest of v2** (see "HQ decisions").
- **Caveat.** Both v2 and v3 were adjusted after seeing the same 15 graded transcripts they are scored on. That makes the agreement number optimistic; the next unseen runs are the real test. The v3 fixes are general (missing facts, explicit tolerances), with nothing written for a specific persona.
- **Remaining v3 disagreements** (3):
  - p03: the judge says success. It misses that Meg later claimed hall-effect fits under RM800.
  - p10: borderline. The judge says fail; the confirmed grade says success.
  - p15: the judge says success but also marks the session dishonest with confusion 4, so it contradicts itself. **Known judge weakness, not fixed (HQ decision).** Read success and honesty together.

### (b) The canonical baseline

**`eval/v2/results/2026-11-27-v2-ws0-foundation-2.md`**
- **Section C:** run-3 only, re-judged with rubric-v3.
- **Section A:** the messy TEST set. It is identical in every results file, because the rubric only affects section C.
- **Kept as history:** `2026-11-27-v2-ws0-foundation.md` (run-3 with rubric-v1). It is also the only file with the LLM intent column; I didn't pay to re-run that column, since the rubric doesn't affect it.

No numbers from run-1 or run-2 are in either file. **Compare later runs with rubric-v3 and simulator-3.**

### Numbers

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
| **task success, confirmed grades** (HQ-graded, Jayson-confirmed) | **40.0% (6/15)** |
| task success, judge (rubric-v3) | 46.7% (7/15); agrees with the confirmed grades on 12/15 |
| task success, judge AND code check of hard requirements | 46.7% (7/15) |
| turns until a fitting build is first on screen (judge-successful sessions) | mean 1.7, median 1 |
| confusion (1 clear … 5 unusable), judge | 2.60 |
| **invented parts: unknown component IDs** | **0** |
| invented parts: possible text flags | 3 (Keychron / HHKB / Topre, echoed from the user while saying "not stocked") |
| honesty, judge | 86.7% honest (p14 and p15 marked dishonest) |
| reply time per app call, p50 / p95 | 3.5 s / **16.4 s** |
| cost per session | USD 0.0048 persona+judge (measured) + ~0.011 app (estimated) |

The two success numbers are separate measurements: 6/15 is the confirmed grades, 7/15 is the judge's. Use **40% (6/15)** as the headline.

### (c) Checkpoints

- **A (real-customer lines): skipped** by Jayson's decision. Personas are labelled "AI-drafted, reviewed by Jayson". Don't use the HQ plan's wording "grounded in my 150+ customer builds".
- **B (label review): done.** 30-row sample, **0 of 30 changed**; appendix of 10 label-vs-engine disagreements accepted. TEST frozen after the review.
- **C (judge calibration): done.**
  - The 15 run-3 transcripts were **graded by HQ (Claude) from the full transcripts and confirmed by Jayson** (all 15, including the borderline p02 and p10). They were not human-graded from scratch, so this is agreement between two AI graders, one of them checked by a human.
  - Confirmed result: **6/15 successes**.
  - **Judge agreement (rubric-v3): 80.0% on success, 80.0% on confusion ±1.** Files: `eval/v2/calibration/grades.json` and `agreement-rubric-v1.md`, `-v2.md`, `-v3.md`.
- **Judge vs persona acceptance.** Personas accepted a build in 9 sessions, and **5 of those 9 did not meet the rule** (p02, p03, p07, p14, p15). Under rubric-v1, all 3 judge disagreements followed the persona's accept/give-up. Rubric-v2 and v3 hide accept/give-up from the judge. Under v3, the judge still calls 2 of those 5 a success (p03, p15), from its own reading of the screen this time, as described in (a).

### Cost of one full simulation run (15 × 1)

About **USD 0.25**: persona + judge USD 0.062 (measured from tokens) plus the app's own 84 calls at about USD 0.0022 each. Re-judging a 15-session run costs about USD 0.03.

### (d) Total WS0 spend and balance

- **USD 0.70** spent up to the USD 1.03 reading (USD 1.73 at the start). That figure comes from the OpenAI usage page, so it includes any live-site traffic.
- After that reading, the rubric-v2 and v3 re-judges cost **USD 0.057**, measured from tokens.
- **Total WS0 spend ≈ USD 0.76, so about USD 0.97 is left** (estimate; please confirm on the usage page).
- Breakdown:
  - persona + judge: USD 0.20 (measured);
  - the app's own OpenAI calls: about USD 0.55, for 200 simulation calls and 48 LLM intent calls, about USD 0.0022 each.
- Every run stayed under its cap, and the balance never went below USD 0.50.

### Surprises and things that look broken

HQ turned these into WS1's work list: `docs/v2/ws0-baseline-findings.md`.

1. **Live bug: recommendations depend on catalogue row order.** The same 60 Supabase rows in Supabase order give "no build under RM350, closest RM474"; put in seed order, they give RM281–331 builds. This hides the cheapest builds on the live site, and is the main reason the budget personas failed. The offline eval can't see it because it uses the seed order. **HQ decision: not fixed in WS0; it stays in the baseline and WS1 fixes it.**
2. **Routing on short follow-ups is weak** (WS1): 13.5% correct, 57.7% fall to `vague_question`.
3. **No honest "no"** (WS1): ordinary builds come back for things the catalogue doesn't have (61.5% of those rows). "Wireless 75%" gets **wired** builds, because the intent schema has no connection field.
4. **Meg claims actions she can't take** (WS1 honesty, WS4 UX): "I swapped out one build… on screen", when chat can't change the builds panel.
5. **Wrong facts in free text** (WS1): compatibility (p15), price ("nothing under RM450", p09), colour (no purple keycaps; Gradient exists), and vision (p14 read a 65% photo as 75%).
6. **Slow tail** (WS1): p95 16.4 s against p50 3.5 s. That fits one 7-second timeout plus a retry in `src/lib/openai/client.ts`.
7. **Judge limits**: see (a). It was tuned on the same 15 transcripts, the p15 self-contradiction remains, and it caught fewer of Meg's errors than the confirmed grades list.
8. "Full keyboard" (meaning a full set) is read as full-size layout.
9. Use case is the weakest intent field for both extractors (63.6%).
10. PostHog's 4 remaining events need one `track(...)` line each when WS3/WS4 build share, clone, sound and refine. Heads-up for WS4: 4 one-line `track` calls were added to `recommendation-demo.tsx`.
11. `npm audit`: 24 vulnerabilities (1 critical). Out of scope, noted.
12. Visibility: the repo is public, so `docs/v2/` and the eval transcripts are public since the push. They contain no secrets or personal data.

### HQ decisions recorded (27 Nov)

1. The confirmed grades are 6/15 (40%); the judge's number is reported separately. Done.
2. The rubric was changed and run-3 re-judged into a new results file. v2 fell below the bar, so v3 is canonical (see (a)); v1 is kept as history.
3. `docs/v2/ws0-baseline-findings.md` is committed.
4. The row-order bug stays in the baseline; WS1 fixes it.
5. **LATER:** after Jayson's top-up, run 2 more baseline runs on this branch's code (simulator-3, rubric-v3) before WS1 merges. Expected cost about USD 0.50.
6. **LATER, at the v2 wrap-up:** `LIVE_SITE_URL`, the PostHog key on Vercel, and the deploy.
7. **Frozen (follow-up decision):** rubric-v3 is canonical, and simulator-3 + rubric-v3 are frozen for the rest of v2. Every later run (repeat baselines, WS1 "after", WS4 "after") uses them. `tests/v2/frozen-eval.test.ts` fails CI if the judge, simulator, invented-parts check or personas change. The catalogue is not frozen, so the judge's catalogue facts follow WS2's catalogue. The p15 self-contradiction stays as a known judge weakness.

### Done-when status

| item | status |
|---|---|
| Personas and messy set committed, Jayson's review done | done (A skipped, B done) |
| Simulation runs end to end with one command | done |
| Judge agrees with the grades ≥ 80% | done: 80.0% with rubric-v3 (HQ-graded, Jayson-confirmed) |
| Baseline scorecard committed | done (canonical: `2026-11-27-v2-ws0-foundation-2.md`) |
| PRs show the automatic checks | done: CI green on PR #5 with the summary comment |
| PostHog events in the dashboard | **LATER** (v2 wrap-up) |
| Keep-alive has run once | **LATER** (v2 wrap-up: needs the deploy and `LIVE_SITE_URL`) |
