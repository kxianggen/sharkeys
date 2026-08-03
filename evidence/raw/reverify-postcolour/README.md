# Post-colour re-verification — H2 confirmed unchanged

`figures-manifest.md` §10 required F17, F18 and H2 to be re-run after the colour
work landed, because `scoreColourFit` adds a term to `service.ts` and even a
colour-free prompt could shift a tie-break. The requirement was outstanding: every
artefact in `raw/` was written at `37505f5`, which precedes the colour commit
`46ea4e1`.

This directory holds that re-run, executed against the working tree at `7b1a61e`.

## Result — no figure moved

| Figure | Before (`e021130`) | After (`7b1a61e`) | Verdict |
|---|---|---|---|
| F10 combination space | 585,200 | 585,200 | unchanged |
| F11 cascade | 585,200 → 45,650 → 27,500 → 11,300 → 3,250 | identical | unchanged |
| F12 independent rates | layout 92.1992% … keycap 0% | identical | unchanged |
| F13 overlap | 1,269,870 | 1,269,870 | unchanged |
| F14 physical-only / kit prune | 6,130 / 2,880 | identical | unchanged |
| **F17 stage-2 counts** | `[0,3,3,0,3,3,3,3]`, mean 2.25 | **identical** | **unchanged** |
| **F18 conformance** | 18/18 valid, 18/18 in catalog | **identical** | **unchanged** |
| F30–F33 economics | RM281 floor, median 600, 0 in band | identical | unchanged |

Every substantive value in all three JSON files matches the pre-colour artefacts
exactly, field by field, with only `meta` and `latency` excluded from the
comparison. **H2 (585,200 → 3,250 → 3, 99.9995%) is confirmed against the
delivered code and needs no change in Chapter 4.**

This is the expected outcome — `scoreColourFit` is unit-tested as a no-op when no
colour is requested, and none of the eight benchmark prompts contains a colour
word — but it is now measured rather than assumed.

## Why these files are here and not in `raw/`

They were produced on **Windows (win32/x64)**, a third environment. `raw/` holds
the macOS and Linux-container artefacts that F10–F34 are quoted from, and the
manifest's standing rule is that environments are never merged. Overwriting
`raw/bench-recommendations.json` would have replaced the macOS latency data that
F20 is cited against, so the originals were restored and this run kept separately.

**Cite `raw/` for every figure. Cite this directory only for the fact that the
re-verification was performed and nothing moved.**

## The one figure that is environment-specific

Deterministic pipeline latency (F20) is not comparable across these runs:

| Environment | median | p95 |
|---|---:|---:|
| macOS arm64 — **F20, reportable** | 91.6 ms | 239.9 ms |
| Linux container — F20b | 132–167 ms | 341–358 ms |
| Windows x64 — this run, **not reportable** | 217.2 ms | 537.4 ms |

The Windows machine is slower again, which is unsurprising given the repository
sits inside a synchronised OneDrive folder. **This is not evidence that the colour
work slowed the pipeline** — it is a different machine, and the deterministic
counts measured in the same run are bit-identical. No latency claim in the report
should be revised on the basis of this figure, and F20 remains the macOS number.

## Reproduction

```bash
npx tsx --tsconfig tsconfig.json scripts/bench-recommendations.ts
npx tsx --tsconfig tsconfig.json scripts/sweep-selectivity.ts
npx tsx --tsconfig tsconfig.json scripts/analyse-build-economics.ts
```
