# eval/v2: Sharkeys v2 measurement (WS0)

Everything here is produced or read by the scripts in `scripts/v2/`. Don't hand-edit numbers.

| file | what | who edits |
|---|---|---|
| `personas.json` | 15 simulated customers: **AI-drafted, reviewed by Jayson** (no real-customer lines added) | Jayson |
| `messy-set.jsonl` | ~120 labelled single messages (100 TEST, 20 DEV, incl. 10 traps) | labels: drafted by Claude, reviewed by Jayson |
| `TEST.sha256` | hash of the TEST rows; a unit test fails if any TEST row changes | written once, at freeze |
| `runs/<date>-<label>/` | simulated sessions: `sessions.jsonl`, readable `transcripts/`, `run.json` | `scripts/v2/simulate.ts` |
| `calibration/` | blind transcripts + `grades.json` + `agreement.md` | Jayson grades; `scripts/v2/judge-agreement.ts` scores |
| `results/<date>-<branch>.md` | scorecards, one file per run, never overwritten | `scripts/v2/scorecard.ts` |

## Rules

1. **The TEST split is frozen.** Never use TEST messages as prompt examples, few-shot examples, fine-tuning data or anything else a model learns from (WS1, WS5, anyone). The freeze test and a leakage test (`tests/v2/messy-set-freeze.test.ts`) run in CI. WS1 may tune on **DEV** rows only.
2. **Routing is scored on follow-up rows only, intent on search rows only.** Follow-up rows carry `context`, a short summary of the build on screen.
3. **Invented parts are checked by code.** An unknown component ID is a hard fail. Text mentions of brands or models not in the catalogue are only "possible" flags, listed in the scorecard for hand review.
4. **Same machine, same day, same script** for any before/after comparison.
6. **Frozen for the rest of v2 (HQ, 27 Nov): simulator-3 + rubric-v3.** Every later run (repeat baselines, WS1 "after", WS4 "after") uses them, and is compared with the canonical baseline `results/2026-11-27-v2-ws0-foundation-2.md`. `tests/v2/frozen-eval.test.ts` fails CI if the judge, simulator, invented-parts check or personas change. **Known judge weakness, deliberately not fixed:** it can call a session a success while also rating it dishonest (p15 in run-3). Read success and honesty together.
5. **Paid runs** (`simulate.ts`, `scorecard.ts --llm-intent`) print a cost estimate first and stop above USD 0.50 unless `--confirm-cost` is passed (only after Jayson approves).

## Commands

```bash
# free
npx tsx --tsconfig tsconfig.json scripts/v2/scorecard.ts                       # offline messy-set metrics
npx tsx --tsconfig tsconfig.json scripts/v2/simulate.ts --label pilot --limit 5 --dry-run   # cost estimate only

# paid (needs npm run dev running with .env.local)
npx tsx --tsconfig tsconfig.json scripts/v2/simulate.ts --label pilot --limit 5
npx tsx --tsconfig tsconfig.json scripts/v2/scorecard.ts --run eval/v2/runs/<dir>

# judge calibration (free)
npx tsx --tsconfig tsconfig.json scripts/v2/judge-agreement.ts export --run eval/v2/runs/<dir> --count 15
npx tsx --tsconfig tsconfig.json scripts/v2/judge-agreement.ts score  --run eval/v2/runs/<dir>
```
