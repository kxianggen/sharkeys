# Measurements That Must Be Run Locally

Three items in `performance.md` are recorded as NOT MEASURED because they cannot be run from the evidence-gathering environment. They are not estimated and must not be estimated — a documented gap is defensible in a viva, an invented figure is not.

Run each command from the project root on your own machine, then paste the output into the matching section below. Once filled in, hand the file back and the figures will be folded into `performance.md`.

---

## Why these could not be measured here

| Item | Blocker |
|---|---|
| **P3** — AI-inclusive latency | The sandbox has no outbound network from application code. A connectivity test failed in 27 ms against `api.openai.com`, and equally against `registry.npmjs.org`, confirming a general egress restriction rather than a provider block. The `OPENAI_API_KEY` was present and loaded correctly, so this is an environment limitation, not a configuration fault. |
| **P4** — test suite | `node_modules` contains macOS-native binaries. Running `vitest` from the Linux sandbox fails, and reinstalling in place would overwrite those binaries and break your local dev environment. |
| **P5** — build statistics | Same constraint as P4. |

---

## P3 — AI-inclusive latency

Makes real, billable OpenAI calls: 20 intent-extraction runs plus 20 keybot runs, on `gpt-4.1-mini` by default. Expect a few cents.

```bash
npx tsx --tsconfig tsconfig.json scripts/bench-ai-latency.ts
```

This writes `report/evidence/raw/bench-ai-latency.json` directly, so pasting output below is optional — but please note **where you ran it** (home wifi, campus network, tethered) since latency figures are meaningless without that context.

```
Network / location:

<paste output here>
```

**Reminder for the write-up:** this measures TOTAL response latency. It does **not** measure time-to-first-token, and must not be presented as satisfying CP1 §3.2.4's "first text token under 2 seconds" — streaming is not implemented, so that quantity does not exist. See `performance.md` §5.1.

---

## P4 — Test suite

```bash
npm run test 2>&1 | tail -40
```

Then the full gate (typecheck + lint + test + build):

```bash
npm run verify 2>&1 | tail -60
```

Record the **pass/fail counts, the number of test files, and the wall-clock duration** that vitest reports.

```
<paste `npm run test` output here>
```

```
<paste `npm run verify` output here>
```

Playwright end-to-end tests are separate and need a dev server:

```bash
npx playwright test --reporter=list 2>&1 | tail -30
```

```
<paste playwright output here>
```

> **Static counts, for comparison against what the runners report.** The repository contains **37 unit/component test files** holding **211** `it(` / `test(` blocks, and **8 Playwright spec files** holding **24** blocks. These were counted by static grep, so they will differ from the runtime totals wherever tests are generated in loops or `describe.each` blocks — treat them as a sanity check, not as the answer.
>
> The brief anticipated 182 unit tests and 19 e2e tests. The static counts are *higher* (211 and 24), which is consistent with tests having been added since that figure was recorded. Please report what vitest and Playwright actually print, and flag any discrepancy rather than reconciling it silently.

---

## P5 — Build and bundle statistics

```bash
npm run build 2>&1 | tail -60
```

Record the **per-route JS size**, **First Load JS** shared bundle, and **total build duration**.

```
<paste build output here>
```

---

## P6 — Lighthouse (optional)

Only if time allows. Note that this maps to **no surviving CP1 non-functional requirement**: the usability NFR concerned layered visual rendering, and that feature was removed from scope (CP2 §4.7). Any Lighthouse figure is supplementary colour, not NFR evidence — see `performance.md` §5.2.

```bash
npm run build && npm run start
# then, in a second terminal:
npx lighthouse http://localhost:3000 --only-categories=performance --quiet --chrome-flags="--headless"
npx lighthouse http://localhost:3000/configurator --only-categories=performance --quiet --chrome-flags="--headless"
```

```
<paste LCP and CLS here>
```

---

## Do not run

`npm install`, `npm ci` or `npm update` were deliberately never run against this project folder from the sandbox. All benchmark work used an isolated copy under `/tmp` with its own dependency install. Your `node_modules` is untouched.
