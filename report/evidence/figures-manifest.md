# Figures Manifest — Handover to the Report Author

Every report-grade number produced by this evidence work, with its value, where it belongs, which script produced it, the catalog state it was measured against, and the caveat that must travel with it.

**Rule for using this document:** if a number is quoted in the report, its caveat column is not optional. Several figures here are correct but easy to misread, and two of them contradict CP1 claims.

**Catalog state for every catalog-dependent figure:** `src/data/components.ts` as committed at **`e021130`** ("expand curated catalog from 42 to 60 verified parts"), working tree unmodified at measurement time. 60 records — case 7, pcb 8, plate 19, switch 10, keycap 5, stabilizer 11.

**Measurement environments — check which one produced a figure before quoting it:**

| Environment | Produced | Note |
|---|---|---|
| Linux container, Node v22.22.3, arm64 | F1–F16, F20b, F30–F34 | Isolated copy of `src/`; project `node_modules` never modified. Noisier than target hardware. |
| **macOS arm64** (`jayson.local`), SHA `4f019d3` | F17–F23, F47–F54 | The development machine. **Reportable for anything user-facing.** |

Deterministic figures are identical in both. Latency figures are not — F20 was ~40% slower on the container. **macOS is primary for every latency figure; the two environments are never merged.** See §0.

**Legend:** 🔒 deterministic, reproduces exactly · 📊 stochastic, quote to 2 s.f. · 🚫 **do not build a claim on this figure** · 🔬 **unmeasured inference — phrase as hypothesis** · ⚠️ contradicts a CP1 claim · ⏳ not measured

---

## 0. Quoting rules

**Deterministic vs stochastic.** Combinatorial figures (585,200 · 3,250 · 99.4446% · all cascade and independent-rejection counts) are exhaustive enumerations. They reproduce bit-for-bit and are quoted **exactly, at full precision**. Latency figures are timings. They are quoted to **two significant figures with an observed range**, never to five digits.

**Tail reliability is scale-dependent — check the benchmark, not the statistic.** The governing rule is *tails are unreliable when environment noise is comparable to the measurement*. That condition holds for one benchmark and not the other, and the split has now been verified on two architectures:

| Benchmark | Scale | Environment | median spread | p95 spread | Tail usable? |
|---|---|---|---:|---:|---|
| `bench-validation` (F1/F1b) | microseconds | container, 6 runs | ~±15% | **~2.8×** | **No** 🚫 — a single GC pause dominates |
| `bench-recommendations` (F20) | hundreds of ms | container, 4 runs | 1.26× | **1.05×** | **Yes**, with range |
| `bench-recommendations` (F20) | hundreds of ms | **macOS, 3 runs** | **1.11×** | **1.05×** | **Yes**, with range |

**The p95 stability reproduces exactly — 1.05× on both architectures.** p99 (1.22× / 1.15×) and max (1.68× / 1.39×) also agree in ordering. A methodological rule verified on two independent environments is materially stronger than one inferred from a single machine, and this cross-check is what licenses treating F20's p95 as reportable while F1b's is not.

So: **medians are always safe to headline; tails must be checked against the table above.** F1b carries 🚫 and no claim may rest on it. F20's p95 does not, and F21's comparison legitimately uses it.

**Never merge environments.** F20's container medians (132–167 ms) and macOS medians (91.6–101.4 ms) are the same code on different hardware, ~40% apart. Averaging them would invent a spread that exists in neither. macOS is primary — it is the development and demonstration machine, and what an examiner running the project would experience. The container run is retained as **independent corroboration of the stability property**, not as a second sample of the same quantity.

Every figure marked 🚫 is retained in the raw JSON and evidence tables for completeness, and **must not appear in a headline, an abstract, or a derived comparison.**

**Stochasticity is not confined to timing.** `F53` (semantic grounding) is stochastic for a different reason — model non-determinism, not machine noise — and swings by three cases out of ten across runs. The same rule applies: quote the range, never a single run. Its offline counterpart `F54` is 🔒 and reproduces exactly across two architectures.

**Iterations are not runs.** `n=200` and `n=1000` count iterations *within* a single execution. A single execution therefore has no run-to-run range, however large its `n`. Any latency figure quoted without a range is either an error or must be explicitly labelled "single run, unranged".

**Figures where five digits would be tempting and wrong:** F1b, F2, F3, F6, F7, F20, F20b, F22, F22b, F50. Quote these as e.g. "≈0.0068 ms (range 0.0068–0.0091)" — not "0.0068 ms".

**One raw file mixes both kinds of quantity.** `raw/bench-recommendations.json` contains stochastic *and* deterministic values side by side, and a reader could reasonably assume they carry the same uncertainty. They do not:

| Path in JSON | Kind | Treatment |
|---|---|---|
| `latency.*` | 📊 Stochastic | Median quoted as a range across 3 macOS runs (F20) |
| `stageTwoReduction.*` | 🔒 **Deterministic** | Byte-identical across **7 runs on two machines**. Quote exactly (F17) |
| `pipelineConformance.*` | 🔒 **Deterministic** | Identical across **7 runs on two machines**. Quote exactly (F18) |

The 2.25 in `stageTwoReduction` is **exact** and is a load-bearing term in the H2 reduction chain. It does not inherit the uncertainty of the ~95 ms sitting a few lines above it in the same file.

**"Deterministic" means repeatable, not invariant.** F17 and F18 reproduce exactly *against the same code and catalog*. They must still be re-run after the colour-scoring change — see §10.

**This does not weaken any verdict.** Even the worst p95 ever observed (0.0248 ms) is ~8,000× under the 200 ms NFR. The tail instability is a presentation problem, not a threat to the finding, and the report should say so explicitly so a reader does not mistake candour about noise for doubt about the result.

---

## 1. Headline figures

The five numbers most worth putting in front of an examiner.

| # | Figure | Value | Where it belongs | Source | Caveat |
|---|---|---|---|---|---|
| H1 | Decision-space reduction, engine only | **99.4446%** (585,200 → 3,250) | Ch.4 results, choice-overload | `sweep-selectivity.ts` 🔒 | Exhaustive, not sampled. ~47% of the final pruning is commercial (kit rule), not physical — see F12. |
| H2 | Full reduction chain | **585,200 → 3,250 → 3** (99.9995%) | Ch.4, headline result | `sweep-selectivity.ts` + `bench-recommendations.ts` 🔒 | **Every term is deterministic** — stage 2 verified byte-identical across **7 runs on two machines**. Quote exactly. **Must still be re-run after the colour-scoring change** — see §10. |
| H3 | Validation latency vs 200 ms NFR | median **0.0068 ms** (range 0.0068–0.0091), ~29,000× headroom | Ch.4, NFR 1 | `bench-validation.ts` 📊 | Median only — never headline p95/p99. Do not present as an achievement — see F4. Verdict insensitive to noise: worst p95 still ~8,000× under. |
| H4 | Target-market coverage | **0 of 3,250** builds in RM150–250 | Ch.4 limitations; Ch.5 future work | `analyse-build-economics.ts` 🔒 ⚠️ | Catalog-sourcing limitation, **not** a software defect. Pricing logic is correct. |
| H5 | **NFR 2 fails** | Keybot median **2,410 ms** vs a 2,000 ms budget | Ch.4 NFR 2; Ch.5 future work | `bench-ai-latency.ts` 📊 ⚠️ | The project's only failed NFR. **The measured claim is the failure itself** (F23). The attractive explanation — that missing streaming causes it — is an unmeasured hypothesis (F23b) and must be phrased as such. |

---

## 2. Performance — CP1 §3.2.4, Table 3.4

| # | Figure | Value | Section | Script | Caveat |
|---|---|---|---|---|---|
| F1 | Valid build — **median** | **0.0068 ms** (range 0.0068–0.0091, ~±15%) | §2 | `bench-validation.ts` 📊 | n=1000. The reportable figure. |
| F1b | Valid build — p95 / p99 / max | 0.0248 / 0.0753 / 0.44 ms | §2 | `bench-validation.ts` 📊 🚫 | **Unstable: p95 ranged 0.0088–0.0248 (2.8×) across runs.** Completeness only — no claim may rest on these. |
| F2 | Layout–mount rejection — median | 0.0044 ms | §2 | `bench-validation.ts` 📊 | Quote to 2 s.f. |
| F3 | Kit rejection — median | 0.0046 ms | §2 | `bench-validation.ts` 📊 | Quote to 2 s.f. |
| F4 | Verdict vs 200 ms | **MET**, ~29,000× margin | §1, §2 | `bench-validation.ts` | **Frame as a requirements-setting observation, not an achievement.** CP1 budgeted 200 ms for the cheapest step in the pipeline. |
| F5 | No short-circuit | All 7 validators run unconditionally | §2 | `compatibility.ts:64–71` 🔒 | Rejection costs ≈ acceptance. Do not describe "early" vs "late" rejection. |
| F5b | Rule engine size | **713 lines** (`src/lib/rules/compatibility.ts`) | Ch.4 §4.2, §4.9 | `wc -l` 🔒 ⚠️ | **A fourth stale number reached the report: Chapter 4 and the abstract say "622-line". The file has been 713 lines since `f59ff0b` (31 Jul), which precedes the `4f019d3` measurement baseline, so 622 was already wrong when written.** 622 appears nowhere in this evidence set — it was carried from the obsolete `report/CP2_Final_Report.md` draft, which is the same stale-documentation contamination that produced the 42-record, 52-case and 182-test errors. Verified at `7b1a61e`. |
| F6 | Scaling — 60 → 5,000 records | 0.0044 → 0.3267 ms median | §3 | `bench-validation.ts` 📊 | Synthetic records vary layout/mount/switch tech; identical clones would give a false flat curve. |
| F7 | Scaling relationship | **Linear**, 83× records → ~74× time | §3 | `bench-validation.ts` 📊 | Ratio ranged 70–74× across runs. Linearity is stable; the multiplier is not. |
| F8 | Cause of linearity | `new Map(catalog.map(...))` per call | §3 | `compatibility.ts:131–133` 🔒 | Entire linear term is **index construction, not validation**. Rules are O(1) in catalog size. |
| F9 | Catalog size to breach 200 ms | ~3.1 million records | §3 | extrapolated from F6 | Extrapolation, not measurement. Label as such. |

---

## 3. Decision space and reliability

| # | Figure | Value | Section | Script | Caveat |
|---|---|---|---|---|---|
| F10 | Combination space | **585,200** (7×8×19×10×5×11) | §4.1 | `sweep-selectivity.ts` 🔒 | Function of catalog composition. Changes if any category gains/loses records. |
| F11 | Sequential cascade | 585,200 → 45,650 → 27,500 → 11,300 → 3,250 | §4.1 | `sweep-selectivity.ts` 🔒 | **Analytical ordering imposed for presentation, not engine behaviour.** Must be labelled as such — the engine performs no sequence. |
| F12 | Independent rejection rates | layout 92.1992%, kit 86.3807%, mount 58.0827%, stabilizer 50.7006%, switch 29.0789%, keycap 0% | §4.1 | `sweep-selectivity.ts` 🔒 | **Use alongside F11, never instead of it.** In the cascade the kit rule looks minor; independently it is second-largest. |
| F13 | Overlap | sum 1,851,820 (316.44%) vs combined 581,950 (99.4446%) → overlap **1,269,870** | §4.1 | `sweep-selectivity.ts` 🔒 | Explains why F12 sums past 100%: most rejected builds fail several rules at once. |
| F14 | Physical vs commercial pruning | Physical only: 6,130 survive. Kit rule prunes a further **2,880 = 47.0%** | §4.1 | `sweep-selectivity.ts` 🔒 | **Nearly half the final pruning is commercial, not physics.** Quoting 99.44% as "physically impossible" would be untrue. |
| F15 | Dead rules | `switch_keycap_technology_mismatch` and `keycap_layout_mismatch` fire **0 times** in 585,200 | §7.1 | `sweep-selectivity.ts` 🔒 | All 5 keycaps support all 5 layouts and both switch technologies. **The unit tests cannot be covering these branches with seed data.** Report as a limitation, not an action item. |
| F16 | Switch technology coverage | Only `mechanical` (8) and `hall_effect` (2); no `optical` or `topre` | §7.2 | catalog inspection 🔒 | PCB/plate `switchTechnologySupport` breadth largely untested. |
| F17 | Stage 2 — builds returned | mean **2.25**, per-prompt counts `[0,3,3,0,3,3,3,3]`, cap 3 | §4.2 | `bench-recommendations.ts` 🔒 | **DETERMINISTIC — verified byte-identical across 7 runs on two machines, not assumed.** No sampling, no network in deterministic mode. Quote exactly; it carries no measurement uncertainty. Cap is `defaultMaxRecommendations`, `service.ts:69`. **Still requires re-run after colour scoring lands** — determinism guarantees repeatability, not invariance to a code change. |
| F18 | Pipeline conformance | 18/18 builds valid; 18/18 all IDs in catalog | §4.3 | `bench-recommendations.ts` 🔒 | **DETERMINISTIC — identical across 7 runs on two machines.** The **non-circular** integrity evidence. Small sample (8 prompts) — say so. |
| F19 | Independent hand-verified sample | **20/20 agreement**, verdicts and exact error-code sets | §4.6 | manual, `sample2.ts` methodology in §4.6 | Only 1 of 20 is a valid build. Ground truth is **catalog metadata, not vendor spec sheets** — verifies the engine, not the data. |

---

## 4. Latency of the wider pipeline and the AI paths

| # | Figure | Value | Section | Script | Caveat |
|---|---|---|---|---|---|
| F20 | Pipeline latency — **macOS (PRIMARY)** | **median ~95 ms** (3 runs, 91.6–101.4, 1.11×); p95 ~240 ms (237–249, 1.05×) | §5.3 | `bench-recommendations.ts` 📊 | **The reportable figure.** Quote as a range, never a single run — `n` counts iterations within a run. Unlike F1b, p95 IS stable (1.05×). Bimodal by prompt (`cheapestOverBudget` near-miss search). |
| F20b | Pipeline latency — container | median 132–167 ms (4 runs, 1.26×); p95 341–358 ms (1.05×) | §5.3 | `bench-recommendations.ts` 📊 | **Do not merge with F20** — different hardware, ~40% apart. Cite only as corroboration that p95 stability (1.05×) reproduces across architectures. |
| F21 | Validation share of pipeline | 0.0068 ms of ~95 ms ≈ **0.007%** | §5.3 | derived (median ÷ median) | Both terms are medians, so the ratio is stable. |
| F21b | Offline pipeline vs CP1's 200 ms | **median under, p95 over — on both environments** (macOS 95 / 240; container 132–167 / 341–358) | §5.3 | derived | **Frame as "exceeds the budget in its tail, not typically."** A typical request stays inside the budget CP1 assigned to validation alone; one in twenty does not. Rests on a stable statistic (p95 1.05× on both), so the claim is reportable — but do not state it as though the pipeline is routinely over budget. |
| F22 | AI latency — intent extraction | median **1,596 ms**, p95 2,220 ms (n=20, macOS, live API) | §5.1 | `bench-ai-latency.ts` 📊 | Median passes the 2 s budget; **p95 fails**. n=20 is small for a p95 — the median is the robust figure. Per-call, not a full user journey. |
| F22b | AI latency — keybot reply | median **2,410 ms**, p95 4,110 ms (n=20, macOS, live API) | §5.1 | `bench-ai-latency.ts` 📊 ⚠️ | **Fails the 2 s budget at median and p95.** 40 calls total across both paths, zero errors. Dominated by network and provider queueing — characterises one machine, one network, one day. |
| F23 | NFR 2 verdict | **NOT EVALUABLE AS SPECIFIED, and NOT MET on the user-facing equivalent** | §1, §5.1 | derived from F22/F22b ⚠️ | **Two findings.** (1) TTFT does not exist — no streaming in `src/`. (2) Because nothing streams, total latency *is* the user's time-to-first-text, not a proxy for it — and it fails. Both are measured. |
| F23b | *Hypothesis:* the missing streaming design causes the failure, not model speed | **UNMEASURED INFERENCE** | §5.1 | reasoning from F22b 🔬 | **Do not write this as a finding.** Total latency bounds TTFT from above, so a streaming implementation would *plausibly* have passed — but no streaming call was ever made. Phrase as "the evidence is consistent with…", never "the cause is…". Same standard applied to the 115 s residual in F38b. **Cheaply settled:** one streaming call timing the first chunk (sketch in §5.1). Piggyback on a networked run; no dedicated round trip scheduled. |

---

## 5. Remaining NFRs

| # | Figure | Value | Section | Source | Caveat |
|---|---|---|---|---|---|
| F24 | API key exposure | **0** secret references across 18 `"use client"` files | §4.4 | grep 🔒 | — |
| F25 | Client/admin split | 3 factories, correctly scoped; admin imported in 2 server-side places only | §4.4 | `src/lib/supabase/` 🔒 | — |
| F26 | Row-level security | 22 `create policy` / `enable RLS` statements, 5 migrations | §4.4 | `supabase/migrations/` 🔒 | Statement count, not a security audit. |
| F27 | Password hashing | **No bcrypt anywhere** — delegated to Supabase Auth/GoTrue | §4.4 | grep 🔒 | Report as **MET BY DELEGATION**. Do not claim a bcrypt implementation; none exists. |
| F28 | JSONB columns | **6** across 3 migrations | §4.5 | `supabase/migrations/` 🔒 | `keyboard_components.metadata` is load-bearing — carries `kitId`, `kitLock`, `plateMaterial`, all read by the rule engine. |
| F29 | Visual realism NFR | **SCOPED OUT** | §5.2 | CP2 §4.7 | Not a measurement gap. Feature removed with supervisor approval; the NFR went with it. Cross-references `competitive-audit.md` §2.4. |

---

## 6. Build economics ⚠️

| # | Figure | Value | Section | Script | Caveat |
|---|---|---|---|---|---|
| F30 | Cheapest possible valid build | **RM281.00** | §7.3 | `analyse-build-economics.ts` 🔒 ⚠️ | **RM31 above the ceiling of the RM150–250 target band.** |
| F31 | Price distribution | p25 533 · median **600** · p75 667 · p95 1,047 · max 1,228 | §7.3 | `analyse-build-economics.ts` 🔒 | Parts subtotal only — excludes shipping, assembly, lubing, markup. Real cost is a floor on these. |
| F32 | Cumulative counts | ≤RM200: **0** · ≤RM250: **0** · ≤RM300: 4 · ≤RM400: 142 | §7.3 | `analyse-build-economics.ts` 🔒 ⚠️ | — |
| F33 | Target-band coverage | **0 builds (0.00%)** in RM150–250 | §7.3 | `analyse-build-economics.ts` 🔒 ⚠️ | Contradicts the CP1 positioning claim. Catalog-sourcing limitation, not a defect. |
| F34 | Zero-result prompts | 2 of 8 prompts return 0 builds | §4.2, §7.3 | `bench-recommendations.ts` 🔒 | **Not a defect.** Intent parsed correctly; graceful near-miss message returned. Explained by F30–F33. |

> **Pricing provenance.** These figures come from the production estimator (`buildValidatedRecommendations` → `estimateBuildPrice`), which applies `price × estimatedSwitchCount` (70) for switches. An earlier revision of the analysis script re-implemented aggregation, omitted that multiplier, and reported a RM225.80 floor with 14 builds in band. Both were wrong. The script no longer computes a price at all.

---

## 7. Reliability finding ⚠️

| # | Figure | Value | Section | Source | Caveat |
|---|---|---|---|---|---|
| F35 | OpenAI client configuration | No `timeout`, no `maxRetries`; zero abort/timeout constructs in the AI paths | §4.7 | `src/lib/openai/client.ts` 🔒 | — |
| F36 | SDK defaults in force | timeout 600,000 ms; maxRetries 2; retries connection errors and timeouts | §4.7 | `openai@6.42.0` source 🔒 | Verified in installed package, not assumed from docs. |
| F37 | Time to fallback — **range by failure mode** | 401/400: ~1 round trip · DNS/refused: **~1.5–2 s** · 429/5xx: ~2–10 s · packet-drop: **~30 min (theoretical ceiling)** | §4.7 | derived from F36 ⚠️ | **Report the range, never the bare maximum.** The 10-min timeout binds only when a connection is accepted then never answered. A bare "30 minutes" is attackable by anyone who knows connection-refused fails in milliseconds. |
| F38 | Fallback correctness | Correct on all paths — never throws | §4.7 | `intent-extraction.ts:127` 🔒 | CP1 §1.6 met in **correctness**, not in **responsiveness**. |
| F38b | Observed hang — the one empirical datum | **115 s** across 40 intended calls | §4.7 | `bench-ai-latency.ts` run under no-egress | Belongs to the **fast-fail** mode, not packet-drop: a direct probe rejected in 27 ms. Per-call arithmetic predicts ~64 s; the residual is unexplained and stated as such. Its real value is negative evidence — under packet-drop the first call alone would have taken 10 min. |
| F39 | Recommended remedy | `timeout: 15_000, maxRetries: 1` → ceiling ~30 s | §4.7 | recommendation only | **Not applied.** `src/` is the implementation agent's territory. Collapses a four-order-of-magnitude spread into one predictable bound — that matters more than the 60× headline. |

---

## 8. Competitive audit — CP1 §2.6.2, Table 2.1

| # | Figure | Value | Source | Caveat |
|---|---|---|---|---|
| F40 | Delivery against 10 CP1 dimensions | **4 delivered, 3 partial, 3 not delivered** | `competitive-audit.md` §1 | Same instrument as CP1, dimensions unchanged. |
| F41 | Not delivered | Sound Testing, Clone Build, Language Support | §2.5, §2.7, §2.10 | Sound testing confirmed absent at 3 levels: no audio files, no populated `soundUrl`, no `<audio>`. |
| F42 | CP1 module gaps closed | **2 of 4 closed, 1 partial, 1 not closed** | §3 | CP1's contribution claim was integrating all four. On the evidence that claim is **not fully supported**. |
| F43 | Sensory feedback gap | **NOT CLOSED** | §2.5, §3 | The barrier CP1 argued hardest about is the one still open. First item of future work per CP2 §4.7. |
| F44 | Competitor change since CP1 | KeebFinder added a 6-question no-jargon quiz; 4,000+ products | §4 | **Narrows CP1's claimed differentiation** on Guided Workflow and Beginner Support. Most examiner-relevant change. |
| F45 | Behind a competitor | Language Support: Sharkeys English-only vs KeebFinder EN/CN | §2.10 | The one dimension where the delivered system is behind a direct competitor. |
| F46 | Compatibility engine deviation | CP1 said "Real-Time AI Validation"; delivered engine is deterministic, no AI | §2.2 | Stronger than proposed, but **not what CP1 wrote**. State the inversion. |

---

## 8a. Test suite and build (P4 / P5)

Measured on macOS arm64, SHA `4f019d3`.

| # | Figure | Value | Section | Source | Caveat |
|---|---|---|---|---|---|
| F47 | Test files | **37 passed / 37** | §6a | `npm run test` 🔒 | — |
| F48 | Tests passed | **215** (was 211 at `4f019d3`) | §6a | `npm run test` 🔒 | **Re-measured at `7b1a61e`: 215 passed / 42 skipped / 257 total, 37 files.** The four added tests are the UAT work (three inverted nav assertions plus colour ranking). Matches the static `it(`/`test(` count exactly. **Never cite without F49b** — see the attribution limit. |
| F49 | Tests **skipped** | **42 of 257 (16.3%)** — all one cause: pinned to the pre-19-part seed catalog, `TODO(catalog-rewrite)` | §6a, §7.1 | `npm run test` + skip audit 🔒 ⚠️ | **Must accompany F48 wherever it appears.** Skip count is unchanged by the UAT work; only the denominator moved. None is credential-conditional. Audited — see F49b for the attribution limit, which is the real finding. |
| F49b | **Coverage attribution limit** | Kit integrity, stabilizer compatibility and the warning/error split have **NO active unit test**; layout only partial | §6a | skip audit 🔒 ⚠️ | **"211 tests passed" must NEVER be cited as evidence for:** kit integrity · stabilizer compatibility · warning/error split · grounding · anti-hallucination · budget enforcement · graceful degradation on OpenAI failure. **The properties are still verified — by F10–F14 (exhaustive sweep), F19 (independent 20-sample) and F18 (conformance), which are exhaustive rather than exemplary and arguably stronger.** This is a limitation of what the *test suite* can be credited with, not of the system's verification. Compounds with F15. |
| F49c | Disabled tests in the rule engine's own suite | **10**, including the happy path, kit integrity and stabilizer rules | §6a | skip audit 🔒 | Restoring these against the 60-part catalog is well-defined future work; the valid component IDs already exist in `raw/bench-validation.json`. Not attempted — rewriting fixtures is implementation work and would change the artefact being measured. |
| F50 | Suite duration | **8.73 s** | §6a | `npm run test` 📊 | Single run, unranged, macOS. Quote as "under 9 seconds". The `7b1a61e` re-measurement on Windows took 25.5 s — a different machine, not a regression. Do not merge (§0). |
| F51 | Build | **Succeeded**; 18 routes (9 API, 8 pages, 1 auth callback, + middleware) | §6b | `npm run build` 🔒 | Only `/browse` prerenders — expected, since other pages depend on session state or live data. Not a defect. |
| F52 | E2E — executed | `uat-evidence.spec.ts`: **5 tests, 5 passed, 36.2 s** (macOS) | §6a | `npx playwright test` 🔒 | Produced all 7 before-shots. |
| F52b | E2E — **not executed** | **7 of 8 specs**: account-flyout, browse, configurator, landing-sections, meg-comment-label, my-builds, nav-consistency | §6a | ⏳ | Not "Playwright wasn't run" — 1 of 8 ran. A bare `npx playwright test` closes it **and** demonstrates the `UAT_PHASE` skip guard firing in practice rather than only by design. |
| F51b | Bundle sizes | **NOT YET CAPTURED** | §6b | ⏳ | **A capture error, not a measurement gap** — build output was piped through `tail -25`, truncating the size table. The data existed. Re-run and capture in full. |

---

## 8b. Superseded figures — do not cite ⛔

| Source | Stale value | Status |
|---|---|---|
| `docs/eval-report.md` (13 June) | 34 pass / 12 fail of 50 offline; 46/50 semantic | **SUPERSEDED** by the 1 Aug run (`c62e56c`, 58 cases). Fully reconciled in **F55** — the change has two named causes and no unexplained gap. Do not cite the 13 June figures; do cite F55 if asked why the numbers moved. |
| Container run of `bench-recommendations` | median 132–167 ms | **SUPERSEDED as a quantity** by F20 (macOS, ~95 ms) — but **retained as F20b**, which corroborates the p95 stability property on a second architecture. Do not cite the median; do cite the 1.05× agreement. |
| Earlier revision of `analyse-build-economics` | RM225.80 floor, 14 builds in band | **WRONG** — omitted the per-switch multiplier. See F30–F33. |

**No figure in this manifest derives from `docs/eval-report.md`.** The only eval reference in the evidence set is the *case count* (50: 30 intent / 10 grounding / 10 retrieval) in `competitive-audit.md` §3, which is structural rather than a score and is unaffected. If the report cites eval *scores*, they must come from the implementation agent's current run, not the 13 June document.

---

## 8c. Evaluation suite

| # | Figure | Value | Source | Caveat |
|---|---|---|---|---|
| F53 | Semantic grounding — **stochastic** | **7 / 8 / 8 / 9** passing across 4 runs (10-case suite) | eval suite, macOS 📊 ⚠️ | **A three-case swing on a ten-case suite from model non-determinism alone — a 30-point range on a percentage score.** No single-run grounding figure may be quoted without this range. Reporting "80% grounding" from one run would be indefensible; report the range, or the median with the range. |
| F54 | Offline suites — **deterministic across architectures** | **47 pass / 7 fail / 2 expected-fail / 2 pending — of 58 cases** (1 Aug, `c62e56c`), reproduced **exactly, suite by suite**, on macOS/arm64 and Linux/arm64 | eval suite 🔒 | **Exact cross-architecture reproduction.** After the stage-2 chain (F17), this is the strongest determinism evidence in the set: not merely repeatable on one machine, but identical on two. **Always state the denominator — it is 58, not 50** (see F55). |

### F55 — Reconciliation of the three offline figures ✅ RESOLVED

Three offline totals appeared during this work. They are not in conflict; they are three different runs against two different instruments, and the bridges are exact.

| Figure | Date | Commit | Cases | Cause of change |
|---|---|---|---:|---|
| 34 pass / 12 fail / 2 EF / 2 pending | 13 Jun | pre-`7192a73` | **50** | Old pipeline; keyword fallback scoring 20/30 on intent |
| 44 pass / 2 fail / 2 EF / 2 pending | 31 Jul | `4f019d3` | **50** | **Code change** — `7192a73` lifted the fallback to 30/30 on intent |
| 47 pass / 7 fail / 2 EF / 2 pending | 1 Aug | `c62e56c` | **58** | **Instrument change** — 8 colour cases added |

Round-B suite breakdown, totalling 58: intent 33 pass / 5 fail (38 cases) · grounding 8 pass / 2 fail (10) · RAG 6 pass / 2 expected-fail / 2 pending (10).

**Bridge 44 → 47 is exact:** +3 colour controls pass (`col-005/006/007`), +5 colour capability cases fail (`col-001`–`004`, `col-008`). 44 + 3 = 47; 2 + 5 = 7. Verified suite by suite — **no pre-existing case changed state.** Semantic reconciles identically: 46/50 → 45–46/50 → 50/58.

**Two distinct causes, and only one of them is progress:**

- **34 → 44 is a genuine improvement.** Same 50-case instrument, ten more passes, driven by a real code change at `7192a73`.
- **44 → 47 is NOT an improvement.** The instrument grew from 50 to 58 cases. The pass count rose because 3 new controls pass; the failure count rose *further* because 5 new capability cases fail. **A reader who sees "47 > 44" and infers progress has been misled** — the correct reading is that a larger instrument exposed five capability gaps that the smaller one could not see.

> **Standing rule:** quote eval figures from **one named, dated, commit-pinned run**, never from a thread summary — including this table. Always state the denominator, since it changed from 50 to 58. The 13 June figures are superseded (§8b).

**Earlier arithmetic in this manifest was wrong.** A previous revision computed the round-B denominator as 47 + 7 = 54, omitting the 2 expected-fail and 2 pending cases. The correct denominator is **58**. Expected-fail and pending cases are part of the suite and must be counted in it.

### F56 — Semantic-mode after-state for the colour work ⚠️ TRANSCRIBED, NOT ARTEFACT-BACKED

`uat-fixes.md` §3.4 recorded the semantic after-state as **not captured**. It was in fact run three times after the colour work landed, but the log was never copied into `raw/` and is not present on this machine. **The figures below are transcribed from the author's record, not from a committed artefact.** They are the least citable numbers in the evidence set and must carry this label wherever they appear.

| Run | Intent (38) | Grounding (10) | RAG (10) | Total |
|---|---|---|---|---|
| 1 | 38 pass | 8 pass, 2 fail (`kg-003`, `kg-008`) | 8 pass, 2 pending | **54 pass, 2 fail** |
| 2 | 38 pass | 9 pass, 1 fail (`kg-008`) | 8 pass, 2 pending | **55 pass, 1 fail** |
| 3 | 38 pass | 8 pass, 2 fail (`kg-001`, `kg-008`) | 8 pass, 2 pending | **54 pass, 2 fail** |

**Mean 54.33, range 54–55, denominator 58 in every run.** All eight `col-*` cases passed in all three runs, so **Claim 1 (Capability) is 0/5 → 5/5 in both modes** and the Chapter 4 table cell stands as written. This closes the outstanding measurement flagged in `uat-fixes.md` §3.4 — but on transcription, not on an artefact.

**Three independent cross-checks support the transcription:**

1. **Arithmetic closes in every run.** 54 + 2 fail + 2 pending = 58; 55 + 1 + 2 = 58. The denominator is 58 throughout, as F54 requires.
2. **The grounding sequence decomposes exactly.** Chapter 4 §4.4.4 reports seven semantic grounding runs scoring 7, 8, 8, 9, 8, 9, 8. The four logged baseline runs in `raw/` scored 7, 8, 8, 9 (F53); these three scored 8, 9, 8. The two sets concatenate to precisely the reported sequence, which would be an unlikely coincidence had the runs not occurred.
3. **The failure pattern matches F53 independently.** F53 records `kg-008` failing every run with `kg-001` and `kg-003` flipping. These three runs show exactly that: `kg-008` fails all three, `kg-003` fails run 1, `kg-001` fails run 3. The variation sits inside the established 7–9 noise band and is attributable to model non-determinism, not to the colour work.

**Standing caveat.** Report these as semantic-mode figures with the range, never a single run, and do not present them as artefact-backed. If a networked run happens for any other reason, `EVAL_SEMANTIC=true npm run eval` with the output committed to `raw/` would convert F56 from transcription into evidence at no analytical cost.

### Provenance gap — the one weak point in the evidence set

Every other figure here has a regenerable artefact in `raw/`. The eval figures do not: they exist only as terminal output, which makes them the least citable numbers in the set. `sharkeys-batch.log` and `sharkeys-roundB.log` are being moved into `report/evidence/raw/` and committed, after which every eval figure has a dated source carrying its own commit SHA. **Cite those logs once they land**; until then F53–F55 rest on transcription rather than on an artefact.

---

## 9. Not measured ⏳

| Item | Status | Blocker | Owner |
|---|---|---|---|
| P3 — AI latency | **MEASURED** (F22/F22b) | — | Done, macOS |
| P3 — vision intent | NOT MEASURED | No fixture image committed | — |
| P4 — test pass/fail + duration | **MEASURED** (F47–F50) | — | Done, macOS |
| P5 — build succeeded, route composition | **MEASURED** (F51) | — | Done, macOS |
| P5 — per-route JS size, First Load JS, build duration | **NOT YET CAPTURED** | Build output truncated by `tail -25` — a capture error, not a measurement gap (F51b) | Re-run and capture full output |
| E2E — 7 of 8 specs | **NOT EXECUTED** | Only `uat-evidence.spec.ts` has run (F52) | `npx playwright test` — also demonstrates the skip guard (F52b) |
| P6 — Lighthouse LCP/CLS | OPTIONAL | Maps to no surviving CP1 NFR | Supplementary only |
| Catalog vs vendor listings | NOT VERIFIED | Outside timebox | Unverified assumption underlying F19 |
| Time-to-first-chunk under streaming | **NOT MEASURED** | No streaming call has ever been made | Would convert F23b from inference to measurement. ~1 API call — piggyback on a networked run, no dedicated trip scheduled |
| Restored rule-engine test fixtures | **NOT ATTEMPTED** | Implementation work; would change the artefact being measured | Future work (F49c). Valid IDs already in `raw/bench-validation.json` |

**Static counts now confirmed against the runner:** at `4f019d3`, 37 test files / 211 blocks matched vitest exactly; **re-confirmed at `7b1a61e` as 37 files / 215 blocks / 215 passing.** The 8 Playwright specs / 24 blocks remain static-only — Playwright was not run.

---

## 10. Re-verification after the colour-metadata commit ✅ DONE — nothing moved

**Status: performed at `7b1a61e`. Every figure held. H2 is confirmed against the delivered code.**

The requirement below was outstanding until this run: every artefact in `raw/` was written at `37505f5`, which precedes the colour commit `46ea4e1` by about fifteen hours, so the re-run had never been done.

| Figure | Before | After | Verdict |
|---|---|---|---|
| F10–F16 (space, cascade, independent rates, overlap, dead rules) | as tabled in §3 | identical | unchanged |
| **F17 stage-2 counts** | `[0,3,3,0,3,3,3,3]`, mean 2.25 | **identical** | **unchanged** |
| **F18 pipeline conformance** | 18/18 valid, 18/18 in catalog | **identical** | **unchanged** |
| F30–F34 build economics | RM281 floor, median 600, 0 in band | identical | unchanged |

Compared field by field with `meta` and `latency` excluded: **every substantive value matches exactly.** **H2 (585,200 → 3,250 → 3, 99.9995%) stands as written and Chapter 4 needs no change.** This is the expected result — `scoreColourFit` is unit-tested as a no-op when no colour is requested, and none of the eight benchmark prompts contains a colour word — but it is now measured rather than assumed.

**F20 was not re-measured by this run and must not be revised from it.** The re-run executed on Windows x64, a third environment, giving a median of 217.2 ms against macOS's 91.6 ms. Environments are never merged (§0), so the original macOS artefacts were restored to `raw/` and the re-run kept separately in **`raw/reverify-postcolour/`** with its own README. Cite `raw/` for every figure; cite `reverify-postcolour/` only for the fact that re-verification was performed and nothing moved. The Windows figure is **not** evidence that the colour work slowed the pipeline — the deterministic counts from that same run are bit-identical.

<details>
<summary>Original requirement, retained for the record</summary>

All figures above are pinned to `e021130`. After the implementation agent commits the colour work:

**Expected to hold — but confirm, do not assume:**

- First confirm the **record count is still 60 and the per-category split is unchanged** (7/8/19/10/5/11). If any category gains or loses a record, F10 changes and *every* figure in §3 and §6 must be re-run.
- F10–F16 (combination space, cascade, independent rates, overlap, dead rules) — colour is not a compatibility rule, so the engine's accept/reject behaviour should be unaffected.
- F30–F34 (build economics) — colour metadata does not affect price.
- F1–F9 (validation latency and scaling) — unaffected by metadata content.

**Must be re-run:**

- **F17 (stage-2 counts) and therefore H2 (the 585,200 → 3,250 → 3 chain).** The colour work adds a scoring term to `service.ts`. Even for colour-free prompts a new term can shift tie-breaks and defaults, and F17 is stochastic. **H2 is the single strongest result in the project and must not be carried across a scoring change on assumption.**
- F20 (deterministic pipeline latency) — a new scoring term adds work to the measured path.
- F18 (pipeline conformance) — cheap to re-run and should be re-confirmed alongside F17.

**Re-run command set:**

```bash
npx tsx --tsconfig tsconfig.json scripts/bench-recommendations.ts   # F17, F18, F20
npx tsx --tsconfig tsconfig.json scripts/sweep-selectivity.ts       # confirm F10-F16 unchanged
npx tsx --tsconfig tsconfig.json scripts/analyse-build-economics.ts # confirm F30-F34 unchanged
```

Then update the catalog commit reference in the header of `performance.md`, `competitive-audit.md` and this manifest, and re-check that §4.2 and §7.3 still agree with each other — that internal cross-check is what caught the pricing error.

</details>

**The §4.2 / §7.3 cross-check still agrees.** The re-run returned 0 builds for both the RM250 and RM200 prompts, and build economics independently returned 0 builds at or under RM250. That is the same internal consistency check that caught the pricing error, and it passes.

---

## 11. Provenance

| Script | Produces | Raw output |
|---|---|---|
| `scripts/bench-validation.ts` | F1–F9 | `raw/bench-validation.json` |
| `scripts/sweep-selectivity.ts` | F10–F16 | `raw/sweep-selectivity.json` |
| `scripts/bench-recommendations.ts` | F17, F18, F20, F34 | `raw/bench-recommendations.json` |
| `scripts/analyse-build-economics.ts` | F30–F33 | `raw/build-economics.json` |
| `scripts/bench-ai-latency.ts` | F22, F22b, F23 | `raw/bench-ai-latency.json` (macOS run, measured) |

| `npm run test` | F47–F50 | console output, §6a |
| `npm run build` | F51 | console output, §6b |

All scripts pass `npx tsc --noEmit`. They live inside the project's typecheck scope, so they are part of the `npm run verify` gate — confirmed by the successful `npm run build` in F51.
