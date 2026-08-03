# Performance Measurement Against the CP1 Non-Functional Requirements

**Source instrument:** CP1 §3.2.4, Table 3.4 "Non-Functional Requirements Specification"
**Date:** 31 July 2026
**Catalog state:** 60 seed records (case 7, pcb 8, plate 19, switch 10, keycap 5, stabilizer 11); 585,200 possible combinations. **Measured against the catalog as committed at `e021130` ("expand curated catalog from 42 to 60 verified parts"), with `src/data/components.ts` unmodified in the working tree at measurement time.** Five keycap records already carry a `metadata.swatch` array at that commit; no other category does. The concurrent colour-metadata work had not landed when these figures were taken. Every figure below that depends on catalog composition carries this state, and will need re-running if any category gains or loses records.

> **Note on citation.** The brief for this work referred to these requirements as CP1 §6.1. There is no §6.1 in the CP1 document, which ends at §5.0 References. The non-functional requirements are Table 3.4 in §3.2.4, and are cited as such throughout.

**Measurement environments — two, and the distinction matters.**

| Environment | Used for | Notes |
|---|---|---|
| **Linux container**, Node v22.22.3, arm64 | §2 validation latency, §3 scaling, §4.1 sweep, §7.3 economics | Isolated copy of `src/` with its own dependency install; the project's `node_modules` was never modified. Shared container — timings are noisier than target hardware. |
| **macOS arm64** (`jayson.local`), SHA `4f019d3` | §4.2 stage 2, §5.1 AI latency, §5.3 pipeline latency, §6a tests, §6b build | The project's actual development machine. **These are the reportable timings for anything user-facing.** |

Deterministic figures (§4.1, §7.3) are environment-independent and identical in both. Latency figures are not, and each table below states which machine produced it. All offline benchmarks use the seed catalog and require no Supabase or OpenAI credentials; §5.1 required a live `OPENAI_API_KEY` and real API calls.

---

## 1. Summary against CP1 Table 3.4

| # | Category | NFR (CP1 §3.2.4) | Measured | Verdict |
|---|---|---|---|---|
| 1 | Performance | Logic Engine Latency — validation under 200 ms | median 0.0068 ms (observed range 0.0068–0.0091 over 6 runs), n=1000 | **MET** (~29,000× margin) |
| 2 | Performance | AI Response Time — first text token under 2 s | Keybot median 2,410 ms / p95 4,110 ms; intent extraction median 1,596 ms / p95 2,220 ms (n=20 each) | **NOT EVALUABLE AS SPECIFIED — and NOT MET on the user-facing equivalent** (§5.1) |
| 3 | Reliability | Logic Integrity — 100% prevention of incompatible pairs | 18/18 emitted builds re-validated clean; 585,200-combination sweep | **MET, with a caveat on what can be proven** (§4.1) |
| 4 | Reliability | AI Accuracy — all recommendations reference existing DB entries | 18/18 builds, all component IDs resolve to catalog | **MET** (§4.2) |
| — | Reliability | *CP1 §1.6 — fallback mode when the AI service is unavailable* | Fallback correct on all paths; time-to-fallback unbounded by the application (~1 s to ~30 min by failure mode) | **PARTIAL — correct but untimed** (§4.7) |
| 5 | Scalability | Data Flexibility — JSONB for variable attributes | 6 JSONB columns across 3 migrations | **MET** (§4.5) |
| 6 | Usability | Visual Realism — accurate layer rendering | — | **SCOPED OUT BY DESIGN** (§5.2) |
| 7 | Security | Data Protection — bcrypt hashing; server-side API keys | 0 secret references in 18 client components; clean client/admin split | **MET BY DELEGATION** (§4.4) |

**Six of seven requirements resolved: three MET, one MET BY DELEGATION, one SCOPED OUT, one NOT MET.** NFR 2 is the only failure, and it is a real one — see §5.1. The reliability commitment from CP1 §1.6 is PARTIAL (§4.7).

---

## 2. Rule engine latency (P1)

**Requirement:** CP1 §3.2.4 — "Compatibility validation completes in under 200ms."

**Method.** `scripts/bench-validation.ts`. Timing via `process.hrtime.bigint()` (nanosecond monotonic clock). Each scenario is warmed with 200 discarded iterations before 1,000 individually-timed samples, so the JIT has settled and inline caches are populated. Scenario fixtures are *discovered* from the catalog at runtime by deterministic search for a combination producing the target error code — not hand-picked — and the selected component IDs are written to `raw/bench-validation.json` so each fixture is reproducible.

**Results** (n=1000 per scenario). These values are taken from the shipped `raw/bench-validation.json` and match it exactly:

| Scenario | median | p95 † | p99 † | Verdict |
|---|---:|---:|---:|---|
| Valid complete build | 0.0068 | 0.0248 | 0.0753 | MET |
| Layout / mount rejection | 0.0044 | 0.0054 | 0.0140 | MET |
| Kit-integrity rejection | 0.0046 | 0.0051 | 0.0158 | MET |

All figures in milliseconds. **MET with roughly 29,000× headroom at the median.**

**† Run-to-run variability differs sharply by statistic, and the tail columns must not carry a claim.**

| Statistic | Observed range across 6 runs | Spread | Safe to headline? |
|---|---|---:|---|
| median | 0.0068 – 0.0091 ms | ~±15% | **Yes** |
| p95 | 0.0088 – 0.0248 ms | ~2.8× | **No** |
| p99 | 0.0299 – 0.0753 ms | ~2.5× | **No** |
| max | 0.26 – 0.44 ms | ~1.7× | **No** |

The medians are stable. The tail percentiles are not, because at a timescale of microseconds a single garbage-collection pause or container scheduling slice lands entirely in the tail — the shared container is the dominant term in p95, not the code under test. An earlier revision of this document characterised *all* latency as varying "±20% run to run"; that was contradicted by this project's own data, since the p95 moved by +182% between two runs. Variability is therefore reported per statistic.

**Consequences for the report:**

1. **Every headline and every derived comparison uses the median, with its observed range.** p95, p99 and max are retained here and in `raw/bench-validation.json` for completeness, and no claim is built on them.
2. `raw/bench-validation.json` is authoritative for the run it describes; re-running will not reproduce these digits.
3. Latency figures are quoted to **two significant figures**. The combinatorial figures in §4 are deterministic and are quoted exactly.

**The verdict is insensitive to all of this.** Even the *worst* p95 observed across any run — 0.0248 ms — sits roughly **8,000× under the 200 ms requirement**, and the worst single sample ever recorded (0.44 ms) is still over 450× under it. The tail instability is a presentation problem, not a threat to the finding. Candour about the noise should not be mistaken for doubt about the result: there is no plausible run in which this NFR fails.

**The engine does not short-circuit.** `validateBuildCompatibility` calls all seven `validate*` functions unconditionally (`src/lib/rules/compatibility.ts:64–71`) and accumulates issues rather than returning on first failure. Rejection therefore costs approximately the same as acceptance; the small differences above are fixture-level, not algorithmic. Any framing of these scenarios as "early" versus "late" rejection would misdescribe the implementation.

### 2.1 Interpretation — what this result actually says

A 29,000× pass is not an interesting engineering result, and the report should not present it as an achievement. The interesting observation is about requirements-setting.

CP1 set a 200 ms budget for compatibility validation, which implies an expectation that validation would be a meaningful share of the user-perceived latency. It is not: at a median of 0.0068 ms, validation consumes roughly three thousandths of one percent (0.0034%) of the allowance. Meanwhile the latency the user actually experiences is dominated by the third-party AI call — which is the one requirement in Table 3.4 that **cannot be measured as written** (§5.1). The requirement that was easy to satisfy was specified precisely; the requirement that governs the real experience was specified in terms the implementation cannot evidence. That is a reflection on how the NFRs were framed at proposal stage, and it belongs in the Chapter 4 discussion rather than being reported as a clean pass.

---

## 3. Catalog scaling (P1b)

**Method.** The valid-build fixture re-measured against synthetic catalogs. Padding records are cloned from real components but have layout, mount style and switch technology rotated through the full enum vocabularies, so the padded catalog is heterogeneous — cloning one record N times would let array scans hit on the first element every time and produce a flattering, invalid curve. Fixture components are appended **last**, so ID lookup must traverse the whole padded set (deliberately pessimistic).

| Catalog size | median (ms) |
|---:|---:|
| 60 (real) | 0.0044 |
| 100 | 0.0093 |
| 500 | 0.0223 |
| 1,000 | 0.0434 |
| 5,000 | 0.3267 |

**The relationship is linear, not flat.** 83× the records (60 → 5,000) costs approximately 74× the median time (0.0044 ms → 0.3267 ms). The ratio has ranged 70–74× across runs; the linearity itself is stable, the exact multiplier is not.

**Cause, from the code.** `resolveSelectedComponents` rebuilds a lookup map over the entire catalog on *every* call — `new Map(catalog.map(...))` at `src/lib/rules/compatibility.ts:131–133`. That is O(n) in catalog size. The compatibility rules themselves only ever inspect the six selected components and are O(1) with respect to catalog size. **The entire linear term is index construction, not validation.**

**Consequence.** Extrapolating the median, the catalog would need roughly 3.1 million records before validation breached the 200 ms NFR. The linearity is therefore an architectural observation, not a risk. Hoisting the map out of the per-call path — building it once per catalog load — would make validation effectively constant-time. That is a defensible future-work item because it is supported by a measurement rather than by intuition.

---

## 4. Decision-space reduction, reliability, security and scalability

The remaining four CP1 requirements — Logic Integrity, AI Accuracy, Data Protection and Data Flexibility — are evidenced here, together with the decision-space measurement that underpins the CP1 choice-overload argument.

§4.1 and §4.2 convert that argument from an assertion into a number, in two stages: the rule engine reduces the combinatorial space, then ranking reduces the surviving set to what a user is actually shown. §4.3 and §4.6 provide the integrity evidence. §4.4 and §4.5 close the security and scalability requirements.

### 4.1 Stage 1 — rule engine selectivity

**Method.** `scripts/sweep-selectivity.ts`. **Exhaustive, not sampled** — all 585,200 combinations evaluated through the real engine in 3.1 s.

**Sequential cascade.** *This is an analytical ordering imposed for presentation, not a sequence the engine performs.* Because the engine does not short-circuit, whichever rule is applied first absorbs every rejection it shares with later rules. Under a different ordering the attribution would redistribute.

| Rule layer (applied in this order) | Surviving | % of total |
|---|---:|---:|
| All possible combinations | 585,200 | 100% |
| After layout compatibility | 45,650 | 7.8008% |
| After mount compatibility | 27,500 | 4.6992% |
| After kit structural integrity | 11,300 | 1.9310% |
| After switch / keycap / stabilizer fitment | **3,250** | **0.5554%** |

**The engine eliminates 99.44% of the decision space — 581,950 of 585,200 combinations. One in every 180 survives.**

**Independent rejection rates.** Each rule applied *alone* against the full space, which removes the ordering artefact above:

| Rule (applied alone) | Rejects | % of 585,200 |
|---|---:|---:|
| Layout compatibility | 539,550 | 92.1992% |
| Kit structural integrity | 505,500 | 86.3807% |
| Mount compatibility | 339,900 | 58.0827% |
| Stabilizer compatibility | 296,700 | 50.7006% |
| Switch compatibility | 170,170 | 29.0789% |
| Keycap compatibility | 0 | 0.0000% |

Sum of independent rejections: 1,851,820 (316.44% of the space). Combined rejection by the engine: 581,950 (99.44%). **The difference — 1,269,870 — is the overlap:** most rejected combinations fail several rules simultaneously.

The two views disagree in an instructive way. In the sequential cascade, kit integrity appears to be a modest third-stage filter (27,500 → 11,300). Applied independently it rejects 86.4% of the space, second only to layout. Its apparent smallness in the cascade is entirely an artefact of layout and mount having already removed most of what it would have caught. **Reporting only the cascade would have understated the kit rule by a wide margin**, which is why both tables are given.

**Physical versus commercial pruning.** Kit integrity prunes for a commercial reason — kit-derived case, PCB, plate and stabilizer parts are not sold separately, so they must share a `kitId` — not a physical one. With the kit rule disabled and all physical rules applied, 6,130 combinations survive (1.0475%). The kit rule removes a further 2,880. **So 47.0% of physically buildable combinations are rejected because they cannot be purchased as separate parts, not because they would fail to work.** A reader who takes the whole 99.44% to be physics is being told something untrue, and the report should make the split explicit.

**What this does and does not prove.** It does *not* prove logic integrity in the sense of CP1's "100% prevention of incompatible pairs". Sweeping every combination through the validator and confirming no incompatible pair is accepted would be circular: it uses the validator to define "incompatible" and then confirms the validator agrees with itself, returning 100% by construction. The non-circular integrity evidence is §4.3.

### 4.2 Stage 2 — what the user is actually shown

99.44% reduction still leaves 3,250 builds, which is far too many for a person to choose between. The choice-overload claim is only completed by the second stage.

**Method.** `scripts/bench-recommendations.ts`, deterministic mode. Eight fixed prompts spanning the CP1 personas (budget-led, sound-led, use-case-led, layout-led, and deliberately vague).

| Prompt | Builds returned |
|---|---:|
| "I want a thocky keyboard under RM250 for office work" | 0 |
| "creamy sounding 65% keyboard for gaming" | 3 |
| "budget mechanical keyboard for a beginner" | 3 |
| "quiet keyboard for a shared office under RM200" | 0 |
| "I want something that sounds deep and premium" | 3 |
| "75% layout, hot swappable, wireless if possible" | 3 |
| "best value build for typing all day" | 3 |
| "I don't really know what I want, something nice" | 3 |

Mean 2.25 builds returned, range 0–3, hard cap 3 (`defaultMaxRecommendations`, `src/lib/recommendations/service.ts:69`).

**These counts are deterministic, and that was verified rather than assumed.** Across 4 independent runs the per-prompt counts were byte-identical every time — `[0, 3, 3, 0, 3, 3, 3, 3]` — as were the conformance results in §4.3. In deterministic mode the pipeline uses the local keyword fallback with no sampling and no network, so the same prompt yields the same builds. **The 2.25 and the 585,200 → 3,250 → 3 chain therefore carry no measurement uncertainty**, unlike the latency figures produced by the same script and stored in the same JSON file. The two kinds of quantity must not be conflated: `raw/bench-recommendations.json` contains both.

**The complete reduction chain:**

```
585,200  possible combinations
  3,250  pass the rule engine        (99.4446% removed)
      3  presented to the user       (99.91% of the remainder removed)
```

**Overall: 585,200 → 3. A reduction of 99.9995%.** This is the figure that directly evidences the CP1 problem statement, and it is stronger than either stage alone.

### 4.3 Pipeline conformance — the non-circular integrity check

**Method.** Every build emitted by `generateRecommendationsFromMessage` is re-validated through the rule engine, and every component ID it references is checked against the catalog. This tests the *architectural guarantee* — that no unvalidated build can reach a user — rather than testing the validator against itself.

**Result:** 18 builds emitted across 8 prompts. `allBuildsValid = true`. `allComponentsInCatalog = true`. No exceptions.

This is the evidence for CP1 NFR 3 (Logic Integrity) and NFR 4 (AI Accuracy / RAG grounding). It is a small sample and is stated as such; §4.6 provides the independent check.

### 4.4 Security — Data Protection

**CP1 §3.2.4 requires:** "Bcrypt hashing for passwords; server-side storage for API keys."

**API keys — MET.** Of the 18 client components in `src/` (files carrying `"use client"`), **zero** reference `OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY`. Every `OPENAI_API_KEY` reference sits in a server-only module: `src/lib/ai/intent-extraction.ts`, `src/lib/ai/embeddings.ts`, `src/lib/keybot/service.ts`, `src/lib/recommendations/service.ts`, `src/lib/agent/nodes/classify.ts`, `src/lib/openai/client.ts` and `src/lib/env.ts`.

**Client / admin separation — MET.** Three distinct Supabase factories with correctly scoped credentials:

| Factory | Credential | Scope |
|---|---|---|
| `src/lib/supabase/admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` | Server-only |
| `src/lib/supabase/client.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe |
| `src/lib/supabase/server.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` (via `@supabase/ssr`, cookie-bound) | Server, user-scoped |

The service-role client is imported in exactly two places — `src/lib/gallery/keybot-reply.ts` (a server module) and `scripts/seed-embeddings.ts` (a CLI script). Neither is a client component. Defence in depth is provided by row-level security: 22 `create policy` / `enable row level security` statements across five migrations.

**Bcrypt — MET BY DELEGATION, not as specified.** There is no `bcrypt`, `argon2` or `scrypt` dependency in the project, and no hashing code in `src/`. Authentication is delegated entirely to Supabase Auth (GoTrue) via `src/lib/auth/index.ts` and `supabase.auth.getUser()`; GoTrue performs password hashing internally, server-side, and the application never handles a raw password. The security property CP1 asked for is satisfied; the implementation mechanism CP1 named is not present because the responsibility was moved out of the application. This is a stronger position than implementing hashing in application code, but the report should describe it accurately rather than claiming a bcrypt implementation that does not exist.

### 4.5 Scalability — Data Flexibility (JSONB) — MET

**CP1 §3.2.4 requires:** "Implementation of JSONB for handling variable product attributes."

Six JSONB columns across three migrations:

| Migration | Column |
|---|---|
| `20260507000000_create_keyboard_components.sql` | `keyboard_components.metadata jsonb not null default '{}'` |
| `20260507000000_create_keyboard_components.sql` | `component_sound_samples.metadata jsonb not null default '{}'` |
| `20260612000002_create_build_posts.sql` | `build_posts.component_ids jsonb not null default '{}'` |
| `20260612000002_create_build_posts.sql` | `build_posts.validation_snapshot jsonb` |
| `20260711000001_create_saved_builds.sql` | `saved_builds.component_ids jsonb not null default '{}'` |
| `20260711000001_create_saved_builds.sql` | `saved_builds.validation_snapshot jsonb` |

`keyboard_components.metadata` is load-bearing rather than decorative: it carries `kitId`, `kitLock`, `sourceType` and `plateMaterial`, all of which the rule engine reads at validation time (`src/lib/rules/compatibility.ts`). The variable-attribute requirement is met in the sense CP1 intended.

### 4.6 Independent hand-verified sample

**Method.** Twenty combinations selected by deterministic stratified stride across the six categories (coprime steps, so the sample is reproducible and spreads across kits, layouts and mount styles). For each, the relevant raw component fields were extracted, and the expected verdict — including the exact set of error codes — was derived **by hand from the field values and the documented rule semantics, without consulting the engine's output.** The hand verdict was then compared against the engine's.

**Result: 20 of 20 agree. Zero disagreements**, on both the accept/reject verdict and the precise set of error codes emitted.

Several cases exercise non-obvious behaviour and are worth citing individually:

- **#17** has two kit-locked parts sharing `kitId: gmk67` and correctly emits **no** `kit_structural_mismatch`, while still emitting seven other codes. The kit rule fires on divergence, not on presence.
- **#4** emits three of the four layout codes but not `plate_case_layout_mismatch`, because case and plate both offer `full` and genuinely do overlap — the engine discriminates pairwise rather than failing all four together.
- **#7** is the only sample to reach `stabilizer_layout_requirements_mismatch`: the stabilizer supports only `full` while the physical build resolves to `60`.
- **#6** and **#11** show correct suppression of the stabilizer layout check when the physical candidate layout set is empty, which is the documented behaviour of `getPhysicalCandidateLayouts`.

**Limitations of this check, stated plainly:**

1. **Only 1 of the 20 sampled combinations is valid.** This is expected — just 0.55% of the space is valid, so a stride-based sample is overwhelmingly rejections. The sample therefore tests rejection reasoning thoroughly and acceptance reasoning only once.
2. **The ground truth is the catalog metadata, not vendor specification sheets.** This verifies that the engine reasons correctly *from its data*; it does not verify that the data matches what the vendors actually sell. Auditing 60 catalog records against live vendor listings was outside the timebox and remains unverified. If a catalog record is wrong, this check would not detect it.

It is therefore an *independent check of the engine*, not an independent check of the system as a whole, and should be described that way in the report.

### 4.7 Reliability finding — the AI fallback is correct but unbounded in time

**CP1 §1.6 commits to** error handling that keeps the configurator usable in fallback mode when the AI service is unavailable.

**The fallback logic is correct.** `extractKeyboardIntent` (`src/lib/ai/intent-extraction.ts:71–134`) wraps the provider call in `try`/`catch` and, on *any* throw, returns a deterministic keyword-derived intent tagged `source: "fallback_error"`. It never propagates an exception. `generateKeybotResponse` (`src/lib/keybot/service.ts:274`) and the agent's `classify` node (`src/lib/agent/nodes/classify.ts:99`) follow the same pattern. Functionally, the commitment is honoured.

**What is not bounded is how long the user waits before it engages.** The OpenAI client is constructed with no timeout and no retry limit:

```ts
// src/lib/openai/client.ts
return new OpenAI({ apiKey: resolvedApiKey });
```

A repo-wide search for `AbortController`, `AbortSignal`, `timeout` and `maxRetries` across `src/lib/ai/`, `src/lib/openai/`, `src/lib/agent/` and `src/lib/keybot/` returns **zero matches**. The SDK defaults therefore apply in full.

**SDK defaults, verified against the installed `openai@6.42.0`:**

| Default | Value | Source |
|---|---|---|
| `timeout` | 600,000 ms (10 minutes) | `OpenAI.DEFAULT_TIMEOUT`, `node_modules/openai/client.js:695` |
| `maxRetries` | 2 (3 attempts total) | `client.d.ts:174` |
| Retry backoff | 0.5 s, then 1 s (exponential, capped at 8 s, up to 25% jitter) | `calculateDefaultRetryTimeoutMillis`, `client.js:568–577` |
| Retried on | 408, 409, 429, ≥500, **and connection errors/timeouts** | `shouldRetry` `client.js:516–537`; connection branch `client.js:383` |
| Not retried | 400, 401, 403, 404 | same |

**Time to fallback depends entirely on the failure mode, and the spread is four orders of magnitude.** Quoting a single worst-case figure would overstate the typical case, so the distribution is given in full:

| Failure mode | Mechanism | Time to fallback | Retried? |
|---|---|---|---|
| Invalid key, malformed request (401/400/403/404) | Fast HTTP response, `shouldRetry` returns false | **~1 round trip** | No |
| DNS failure, connection refused | Connection rejected immediately; retried, so cost is backoff not network | **~1.5–2 s** | Yes |
| Rate limit or server error (429/5xx) | Fast HTTP response, then backoff before each retry | **~2–10 s** | Yes |
| Packet drop / black-holed network — connection accepted, never answered | Each attempt runs the full 600 s timeout | **~30 min (theoretical worst case)** | Yes |

The 10-minute timeout only binds in the last row: a connection that is *accepted and then never answered*. In every other mode the failure surfaces quickly and the retry backoff (0.5 s, then 1 s) dominates. The SDK's own documentation refers to this last case (`client.d.ts:81–82`): *"request timeouts are retried by default, so in a worst-case scenario you may wait much longer than this timeout."*

**The one observed datum: 115 seconds.** Under the sandbox's no-egress condition, `scripts/bench-ai-latency.ts` produced no output for over 115 seconds across 40 intended calls before it was terminated.

That observation belongs to the **fast-fail** row, not the packet-drop row. A direct `fetch` probe to `api.openai.com` from the same environment rejected in **27 ms**, which is connection-refused/DNS-failure behaviour — the sandbox rejects connections rather than black-holing them. Per-call arithmetic for that mode gives 3 attempts × ~27 ms + ~1.5 s backoff ≈ 1.6 s, so 40 calls ≈ 64 s. The observed 115 s exceeds that; the excess is not accounted for precisely and is most plausibly module-load time for the LangGraph dependency chain plus container scheduling, but this was not isolated and the residual is stated rather than explained.

The useful inference is negative and it is solid: **had the environment been black-holing packets, the first call alone would have taken 10 minutes and the run would not have completed in 115 seconds at all.** The observation therefore confirms the fast-fail mode and says nothing about the 30-minute case, which remains theoretical.

**Report the range, not the maximum.** The defensible claim is that time-to-fallback is *unbounded by the application* and spans ~1 second to ~30 minutes depending on how the provider fails, with only the fast-fail end empirically observed. A reader who knows that connection-refused fails in milliseconds would rightly attack a bare "30 minutes".

No route-level cap mitigates any of it. A search across every file in `src/app/api/` for `maxDuration` returns nothing, so under `npm run start` nothing in the application bounds the request. On a serverless host the platform cap would truncate it, but no such configuration is committed to this repository.

**The bounded / unbounded distinction, stated plainly:**

| Failure mode | Fallback correct? | Time to fall back | Verified |
|---|---|---|---|
| No API key configured | Yes | Immediate — the key check at `intent-extraction.ts:82` short-circuits before any network call | **Yes**, measured: this is the path all §4.2/§5.3 deterministic benchmarks exercise, median ~95 ms end-to-end |
| Provider configured but unreachable, timing out, rate-limited or 5xx | Yes | **Unbounded by the application — ~1 s to ~30 min depending on failure mode** | **Partially** — only the fast-fail end observed (115 s datum) |

The configuration-absent path is the one that is verified working, and it is the *less* realistic failure. The realistic outage — a configured provider that stops responding — is the one with no time bound. CP1's error-handling commitment is therefore met in correctness but not in responsiveness.

**Empirical corroboration.** This was found by accident rather than by design. `scripts/bench-ai-latency.ts` was written to record NOT MEASURED and continue if the API were unreachable. Run under the no-egress condition it instead produced no output for over 115 seconds across 40 intended calls, because each call was retrying with backoff. A 10-second preflight probe was added to the script, which made it resolve in 0.36 s. **The script's defect and the application's are the same defect**; only the script was fixed, because `src/` is out of scope for this work.

**Recommended remedy — for the implementation agent, not applied here.** Set an explicit timeout and retry budget at the single point of client construction:

```ts
// src/lib/openai/client.ts — NOT APPLIED, recommendation only
return new OpenAI({
  apiKey: resolvedApiKey,
  timeout: 15_000,   // vs 600_000 default
  maxRetries: 1,     // vs 2 default
});
```

That changes the theoretical worst case from **~30 minutes to ~30 seconds**, a roughly 60× reduction, at one call site and without touching any fallback logic. It also collapses the four-order-of-magnitude spread in the table above into a single predictable bound, which matters more for user experience than the headline maximum does. The exact numbers are a product decision — 15 s is a starting point, not a measured optimum — but any explicit bound is a large improvement on the default.

**A caveat on this finding.** A live outage test was not performed, as it would require network access the measurement environment does not have. Every figure in the failure-mode table except the 115-second datum is **derived from the installed SDK's source-verified defaults, not observed end to end.** The 30-minute figure in particular is a theoretical ceiling for one specific failure mode and has not been reproduced. Report this as an analysis of the configuration, corroborated at the fast-fail end by one observation, rather than as a measurement.

---

## 5. AI response time, scoped-out requirements, and pipeline latency

### 5.1 AI Response Time — NOT EVALUABLE AS SPECIFIED, and NOT MET on the user-facing equivalent

**CP1 §3.2.4 requires:** "First text token generates in under 2 seconds."

**Streaming is not implemented.** No `stream: true`, `ReadableStream`, `streamText` or equivalent construct exists anywhere in `src/`. Every AI response is assembled server-side and returned as a complete payload.

**So the literal requirement has no referent.** There is no first token distinct from the last one; there is one response. The NFR as written assumes a streaming design that was not carried into implementation, and no measurement of "time to first token" is possible.

**But that is not the end of the analysis, and stopping there would let the system off.** The requirement exists to bound *how long a user waits before seeing any text*. In a streaming design that quantity is time-to-first-token. **In a non-streaming design it is the total response latency** — the user sees nothing at all until the whole payload arrives. That quantity is measurable, and it was measured.

**Measured on macOS arm64, `gpt-4.1-mini`, n=20 per path, 40 live API calls, zero errors** (`scripts/bench-ai-latency.ts`, `raw/bench-ai-latency.json`):

| Path | median | p95 | mean | min | max | σ | vs 2,000 ms |
|---|---:|---:|---:|---:|---:|---:|---|
| Intent extraction | 1,596 | 2,220 | 1,673 | 1,241 | 3,177 | 436 | median passes, **p95 fails** |
| Keybot reply | 2,410 | 4,110 | 2,731 | 1,524 | 5,457 | 934 | **fails at median and p95** |
| Vision intent | — | — | — | — | — | — | NOT MEASURED (§6) |

All figures in milliseconds.

**Verdict: NOT MET.** The keybot path exceeds the 2-second budget at the median and by more than double at p95. Intent extraction passes at the median but fails one request in twenty. Since neither path streams, these totals *are* the user's time-to-first-text.

**Three things must be said together, and the third is the interesting one:**

1. The requirement **cannot be evaluated as specified** — TTFT does not exist in this implementation.
2. The nearest measurable quantity, and the one the requirement was actually trying to constrain, **fails**.
3. **INFERENCE, NOT MEASUREMENT — label it as such in the report.** It is *plausible* that the failure is caused by the missing streaming design rather than by slow models: total latency is an upper bound on time-to-first-token, and the bulk of a 2.4-second response is token generation after the first, so a streaming implementation would very likely have delivered a first token inside 2 seconds. On that reading the requirement was achievable and the architectural decision not to stream is what converts a satisfiable requirement into a failed one.

**But this has not been measured, and it must not be written as though it has.** It is an unmeasured mechanism attribution of exactly the kind refused in §4.7 for the 115-second residual, and the same standard applies here. The counterfactual is untested: no streaming call was ever made against this model with these prompts.

Points 1 and 2 are findings. Point 3 is a hypothesis, and it should appear in the report as "the evidence is consistent with…" rather than "the cause is…".

**It is cheaply testable, and worth doing if a networked run happens for another reason.** One streaming call to the same model with the same prompt, timing the arrival of the first chunk, would settle it:

```ts
// Not committed — sketch only. ~1 API call.
const stream = await client.responses.create({ model, input, stream: true });
const t0 = process.hrtime.bigint();
for await (const _ of stream) { break; }              // first chunk only
console.log(Number(process.hrtime.bigint() - t0) / 1e6, "ms to first chunk");
```

If time-to-first-chunk lands well under 2,000 ms, point 3 becomes a measurement and NFR 2 becomes a clean design finding: *the requirement was satisfiable and the implementation choice is what failed it.* If it does not, the honest conclusion changes to the model simply being too slow for the budget CP1 set. **A dedicated round trip is not scheduled** — this should be piggybacked on a networked run that is happening anyway.

**Two caveats on the numbers.** These are *per-call* latencies for a single AI operation, not complete user journeys — a recommendation request incurs intent extraction *plus* the pipeline work in §5.3 plus explanation enrichment, so the real user wait is **longer** than any figure above. And latency is dominated by network round-trip and provider queueing: these characterise one machine on one network on one day, and n=20 is small for a p95. The median failure on the keybot path is robust; the precise p95 figures are not.

### 5.2 Visual Realism — SCOPED OUT BY DESIGN

**CP1 §3.2.4 requires:** "Accurate layer rendering (e.g. keycaps visually cover switches)."

This requirement describes the interactive layered 2D visualiser, which **was removed from scope** — a decision documented in CP2 §4.7 on feasibility and evaluation-priority grounds, reviewed and approved by the project supervisor. The delivered interface provides a schematic key-grid preview and per-part product photography (`src/components/build-preview.tsx`, `src/components/part-thumbnail.tsx`) with no z-index compositing.

**This is a scoped-out requirement, not a measurement gap.** The NFR was not missed; the feature it describes was deliberately removed, and the NFR went with it. See `competitive-audit.md` §2.4, which reaches the same conclusion from the competitive-dimension side — the two sections corroborate each other.

Because no layout-shift or layered-rendering claim survives in scope, Lighthouse CLS is **not** evidence for any CP1 requirement. If run at all it is supplementary, not NFR evidence.

### 5.3 Deterministic pipeline latency — measured, but maps to no CP1 NFR

**Method.** `scripts/bench-recommendations.ts`. `OPENAI_API_KEY` and the Supabase variables are deleted before module load, so intent extraction uses the local keyword fallback and the catalog resolves to seed data. **No network calls.** 20 warm-up, 200 timed iterations rotating through the eight prompts.

**Measured on macOS arm64 across 3 independent runs** (n=200 iterations within each). Reporting a single run would repeat the error §2 warns against: `n` counts iterations *within* a run, not runs, so one execution carries no run-to-run range at all.

| Statistic | Shipped run | Across 3 macOS runs | Spread | Reportable? |
|---|---:|---|---:|---|
| **median** | 91.6 | 91.6 – 101.4 | **1.11×** | **Yes — quote as ~95 ms** |
| mean | 118.9 | 117.2 – 122.8 | 1.05× | Yes |
| p95 | 239.9 | 236.6 – 248.6 | **1.05×** | Yes, with range |
| p99 | 241.6 | 237.9 – 274.4 | 1.15× | With range only |
| max | 244.8 | 244.3 – 338.8 | 1.39× | No |
| σ | 86.8 | 85.7 – 90.6 | 1.06× | — |

All figures in milliseconds; the "shipped run" column matches `raw/bench-recommendations.json` exactly.

**The macOS figures are primary; the container figures are not merged into them.** The same code on the container gave medians of 132–167 ms — roughly 40% slower. These are two measurements of *different hardware*, not two samples of one quantity, and combining them would invent a spread that exists in neither environment. macOS is the development and demonstration machine, and is what an examiner running this project would experience, so **~95 ms is the reportable figure**.

**The container run instead serves a different and more valuable purpose: it independently corroborates the stability property on a second architecture.** Run-to-run spread by statistic, measured on both:

| Statistic | Linux container (arm64, 4 runs) | macOS (arm64, 3 runs) | Agreement |
|---|---:|---:|---|
| median | 1.26× | **1.11×** | Both stable; macOS tighter |
| **p95** | **1.05×** | **1.05×** | **Identical** |
| p99 | 1.22× | 1.15× | Both stable |
| max | 1.68× | 1.39× | Both loosest, as expected |

**The p95 stability reproduces exactly — 1.05× on both.** A methodological rule verified on two independent environments is materially stronger than one inferred from a single machine, and this is what licenses treating p95 as reportable here while §2's p95 is not.

**The tail-instability rule from §2 therefore does not transfer to §5.3, and now we know why with evidence rather than by argument.** Validation's p95 swung 2.8× because at *microsecond* scale a single GC pause dominates the tail. At hundreds of milliseconds the same pause is negligible. The governing rule is **"tails are unreliable when environment noise is comparable to the measurement"** — true for §2, false for §5.3, and confirmed on two architectures.

**This distribution is strongly bimodal** (min 2.0 ms, max 244.8 ms, σ 86.8 ms — comparable to the mean). Diagnostic runs show the split is prompt-dependent: budget-constrained prompts cost 135–250 ms while unconstrained prompts cost ~20 ms. The expensive path is the over-budget near-miss search (`buildBudgetNearMiss` / `cheapestOverBudget`), which runs only when a budget constraint fails to be satisfied. The bimodality is why σ is comparable to the mean, and it is real structure rather than measurement noise.

**Worth stating plainly, and carefully.** With zero network calls, the project's own logic consumes a median of ~95 ms on the development machine. Validation — the thing CP1 gave a 200 ms budget — accounts for 0.0068 ms of that, about **0.007% of the median**. The remainder is intent extraction, candidate preparation, assembly, ranking and the near-miss search.

**The offline pipeline exceeds CP1's 200 ms validation budget in its tail, but not typically.** The distinction matters and the honest framing is the second half of that sentence:

| Environment | median vs 200 ms | p95 vs 200 ms |
|---|---|---|
| macOS (primary) | ~95 ms — **comfortably under** | 237–249 ms — **over** |
| Linux container | 132–167 ms — under | 341–358 ms — over |

So a typical request stays inside the budget CP1 assigned to validation alone, while one request in twenty does not — on both environments. Because p95 is classified stable here (1.05× on both architectures), that claim rests on a reportable statistic rather than on noise. It reinforces §2.1 without overstating: **the NFR was placed on the cheapest component of the pipeline, and the rest of the pipeline can exceed the whole budget on a slow request.**

---

## 6. Not measured

Every gap, with its reason. No figure in this document is estimated.

| Item | Status | Reason |
|---|---|---|
| AI Response Time (TTFT) | **NOT EVALUABLE** | Streaming not implemented; the quantity does not exist (§5.1) |
| Visual Realism | **SCOPED OUT** | Feature removed from scope, CP2 §4.7 (§5.2) |
| P3 — AI-inclusive total latency | **MEASURED** (§5.1) | Run on macOS arm64 with live API access. 40 calls, zero errors. Could not be run in the container, which has no outbound network from application code — a probe failed in 27 ms against `api.openai.com` and equally against `registry.npmjs.org`, confirming a general egress restriction. |
| P3 — vision intent latency | **NOT MEASURED** | Requires a representative inspiration image. No fixture image is committed to the repository, and a synthetic one would not represent real usage. The only remaining gap in P3. |
| P4 — test suite pass/fail counts and duration | **MEASURED** (§8) | Run locally on macOS. |
| P5 — build and bundle statistics | **PARTIALLY MEASURED** (§9) | Build succeeded and route composition captured. Per-route JS sizes and First Load JS were not recorded from the output and remain unmeasured. |
| P6 — Lighthouse LCP / CLS | **OPTIONAL** | Maps to no surviving CP1 NFR (§5.2); supplementary only |
| Catalog accuracy against vendor listings | **NOT VERIFIED** | Outside timebox. §4.6 verifies the engine reasons correctly from its data, not that the data is correct (§4.6, limitation 2). |

---

## 6a. Test suite (P4)

**Measured on macOS arm64, SHA `4f019d3`**, via `npm run test`.

| Metric | Value |
|---|---:|
| Test files | **37 passed / 37** |
| Tests passed | **211** |
| Tests skipped | **42** |
| Total tests | **253** |
| Failures | **0** |
| Wall-clock duration | **8.73 s** |

The 211 figure matches the static count of `it(`/`test(` blocks exactly, which is a useful cross-check that no tests are generated dynamically.

### The 42 skips — audited, and the finding is about attribution

**All 42 skips share one cause.** None is conditional on credentials, environment or platform. Every one carries the same header:

```
// TODO(catalog-rewrite): it.skip tests below are pinned to the
//                        pre-19-part seed catalog
```

They were disabled when the catalog was expanded and never restored. This is a single piece of deferred maintenance, not 42 independent judgements.

**Distribution:**

| File | Skips |
|---|---:|
| `tests/recommendations/service.test.ts` | 11 |
| `tests/rules/compatibility.test.ts` | 10 |
| `tests/components/recommendation-demo.test.tsx` | 7 |
| `tests/keybot/service.test.ts` | 6 |
| `tests/components/repository.test.ts` | 4 |
| `tests/components/build-preview.test.tsx` | 4 |
| `tests/api/routes.test.ts` | 4 |
| `tests/ai/intent.test.ts` | 3 |
| `tests/api/keybot-route.test.ts` | 2 |

**Ten of them are in the rule engine's own suite,** including the happy path and both rules the report leans on hardest:

- "passes a fully valid build" — *the happy path*
- "passes a valid Weikav Star 80 kit-derived build"
- "blocks incompatible case and PCB layouts"
- "blocks cross-kit structural combinations" — ***kit integrity***
- "blocks same-layout cross-kit TKL structural combinations"
- "allows standalone stabilizers with kit-derived structural paths"
- "blocks stabilizer incompatibility" — ***stabilizer rule***
- "keeps sound preference mismatches as warning-only" — *warning/error split*
- "keeps beginner-friendly mismatches as warning-only"

**Active unit-test coverage of the seven validation categories:**

| Category | Active unit test? |
|---|---|
| Layout compatibility | **Partial** |
| Mount compatibility | Yes |
| Switch compatibility | Yes |
| Keycap compatibility | Yes |
| **Kit structural integrity** | **None** |
| **Stabilizer compatibility** | **None** |
| **Preference warnings (warning/error split)** | **None** |

**Disabled elsewhere — each one a property this report makes a claim about:**

- "does not include hallucinated OpenAI recommendation claims"
- "keeps recommendation explanations grounded in selected component data"
- "keeps deterministic recommendations when OpenAI explanation generation fails"
- "validates a build selection from component IDs"
- "does not return builds above the extracted total budget"

### What this does and does not mean

**It does not mean the rule engine is unverified.** Those properties are verified — just not by the unit suite:

| Property | Verified by | Strength |
|---|---|---|
| Kit integrity | Exhaustive sweep (§4.1) — 505,500 independent rejections counted across all 585,200 combinations | Exhaustive |
| Stabilizer compatibility | Same sweep — 296,700 independent rejections | Exhaustive |
| Every rule's accept/reject behaviour | Independent 20-sample check (§4.6) — 20/20 agreement on verdicts **and exact error-code sets**, derived by hand before consulting the engine | External |
| Grounding / no hallucinated components | Pipeline conformance (§4.3) — 18/18 builds, all IDs resolve, reproduced across 7 runs on two architectures | Repeated |
| Warning/error split | Sweep counts errors and warnings separately; `isValid` depends only on errors | Exhaustive |

That evidence is arguably **stronger** than the disabled tests would have been, because it is exhaustive rather than exemplary: the sweep tests every combination the catalog admits, where a unit test asserts one case.

**What it does mean is an attribution limit, and it is strict:**

> **"211 tests passed" must never be cited as evidence for kit integrity, stabilizer compatibility, the warning/error split, grounding, anti-hallucination, budget enforcement, or graceful degradation when OpenAI fails.** Those properties rest entirely on the exhaustive sweep (§4.1), the independent sample (§4.6), the conformance check (§4.3) and the eval suite — not on the unit suite.

**This compounds with §7.1.** Two rule branches are unreachable by catalog composition *and* the kit and stabilizer tests are disabled. Any coverage claim over the rule engine must carry both qualifications.

**Future work, deliberately not attempted here.** Restoring these fixtures against the 60-part catalog is a well-defined and worthwhile task, and the valid component IDs needed to rebuild them already exist in `raw/bench-validation.json`. It was not attempted during this evidence pass: rewriting test fixtures is implementation work, and doing it now would change the artefact being measured.

**Playwright: 1 of 8 specs executed.** `e2e/uat-evidence.spec.ts` ran on macOS — **5 tests, 5 passed, 36.2 s** — and produced all 7 before-shots. The remaining **7 specs are unexecuted**: `account-flyout`, `browse`, `configurator`, `landing-sections`, `meg-comment-label`, `my-builds`, `nav-consistency`.

A bare `npx playwright test` closes this in one command and yields a second result at no extra cost: with `UAT_PHASE` unset, the implementation agent's guard skips `uat-evidence` while the other 7 run. That **demonstrates the skip guard working in practice rather than only by design** — a behavioural check on the guard, not a documentation claim about it. Worth capturing when the run happens.

---

## 6b. Build (P5)

**Measured on macOS arm64, SHA `4f019d3`**, via `npm run build`. **Build succeeded.**

| Metric | Value |
|---|---:|
| Total routes | **18** |
| API routes | 9 |
| Pages | 8 |
| Auth callback | 1 |
| Middleware | present |
| Statically prerendered | **1** (`/browse`) |
| Dynamic | all others |

That only `/browse` prerenders is expected rather than a defect: every other page depends on per-user session state, `localStorage` migration, or live catalog data, and the API routes are dynamic by definition.

**Bundle sizes: a capture error, not a measurement gap.** Per-route JS, First Load JS and build duration are absent because the build output was piped through `tail -25`, which truncated the size table before it was read. The data existed; it was discarded in transit. Re-running `npm run build` and capturing the full output recovers it. Recorded as **NOT YET CAPTURED** rather than NOT MEASURABLE, and no estimate is offered in the meantime.

---

## 7. Limitations of the evidence

**7.1 Two implemented rules are never exercised by the seed catalog.** Across all 585,200 combinations, `switch_keycap_technology_mismatch` and `keycap_layout_mismatch` recorded **zero** occurrences. The cause is catalog composition: all five keycap sets declare support for all five layouts and for both switch technologies present. The rules are correctly implemented but unreachable with this data.

**A direct consequence: the unit test suite cannot be exercising those two branches using seed data.** Any coverage claim over the rule engine should be qualified accordingly — and read alongside §6a, where the kit-integrity and stabilizer tests are *disabled* and 42 of 253 tests (16.6%) are skipped outright. **The two qualifications compound: two branches unreachable by catalog composition, and two more rules with no active unit test at all.** Both properties are nonetheless verified by the exhaustive sweep and the independent sample — see §6a for the attribution limit. This is recorded as a limitation of catalog composition and test coverage, not as an action item — correcting it would invalidate the 585,200 baseline and every cascade figure in §4.1.

**7.2 Only two of four switch technologies appear in the catalog.** The catalog contains `mechanical` (8) and `hall_effect` (2). No `optical` or `topre` components exist, so the breadth of `switchTechnologySupport` on PCBs and plates is largely untested by the sweep.

**7.3 The delivered catalog cannot serve the project's stated target market at any price point.**

*Catalog state: 60 seed records as committed at `e021130`; working tree unmodified at measurement time.*

**Method.** `scripts/analyse-build-economics.ts` prices every accepted build. It does **not** compute prices itself: it pins the candidate set to one component per category and calls the production assembler `buildValidatedRecommendations` (`src/lib/recommendations/service.ts`), reading `estimatedPrice` from the result. This is the same code path that produces the figure shown to a user, so the analysis cannot drift from the product. Figures are a parts subtotal — they exclude shipping, assembly, lubing and vendor markup, so real-world cost is a floor on these numbers, not a ceiling.

Switches are priced *per switch* and multiplied by `estimatedSwitchCount = 70` (`service.ts:70,474`); the same multiplier is applied consistently at `src/app/my-builds/actions.ts` and `src/data/hero-demo-build.ts`.

| Statistic | MYR |
|---|---:|
| Cheapest possible valid build | **281.00** |
| 25th percentile | 533.00 |
| Median | 600.00 |
| 75th percentile | 667.00 |
| 95th percentile | 1,047.00 |
| Most expensive | 1,228.00 |

| Price ceiling | Valid builds at or under |
|---|---:|
| RM200 | **0** |
| RM250 | **0** |
| RM300 | 4 |
| RM400 | 142 |

The project's target market is RM150–250, Malaysia. **Zero of the 3,250 valid builds fall within that band.** The cheapest build the system can assemble costs RM281.00 — RM31 above the *ceiling* of the target range, and RM131 above its floor. The median valid build, at RM600, costs 2.4× the top of the range.

This explains the two zero-result prompts in §4.2 and confirms they are **not a defect**. Intent extraction parsed both correctly (budget RM250, `soundProfile: thocky`, `useCase: office`), the engine found no build meeting the constraints within budget, and the system degraded gracefully with an accurate near-miss message: *"Everything that fits comes out over budget. Try raising the budget, or relaxing the layout or sound preference."* The behaviour is correct; the catalog economics are the finding.

**This contradicts a CP1 positioning claim.** The proposal is built on serving budget-conscious Malaysian buyers in the RM150–250 band, and the delivered catalog cannot produce a single build at any point in that band. It is a catalog-sourcing limitation rather than a software defect — the pricing logic is correct throughout the application — and it is more valuable in the report stated plainly than smoothed over.

> **Correction notice.** An earlier revision of this section reported a floor of RM225.80 and 14 builds within the target band. That was wrong. The analysis script had reimplemented price aggregation and omitted the per-switch multiplier, under-reporting every build by roughly RM55. The application was never affected. The error was detectable from the evidence itself: §4.2 showed the RM250 prompt returning zero builds while §7.3 claimed 14 builds fit that budget, and those two statements cannot both be true. The script now calls the production estimator rather than duplicating it, which removes the class of error rather than the instance.

---

## 8. Reproduction

From the project root. All commands below are offline and need no credentials.

```bash
# §2, §3 — rule engine latency and catalog scaling
npx tsx --tsconfig tsconfig.json scripts/bench-validation.ts

# §4.1 — selectivity cascade and independent rejection rates (exhaustive sweep)
npx tsx --tsconfig tsconfig.json scripts/sweep-selectivity.ts

# §4.2, §4.3, §5.3 — pipeline latency, stage-2 counts, conformance
npx tsx --tsconfig tsconfig.json scripts/bench-recommendations.ts

# §7.3 — build price distribution (prices via the production estimator)
npx tsx --tsconfig tsconfig.json scripts/analyse-build-economics.ts
```

Requires network access and a live `OPENAI_API_KEY` (makes real, billable calls):

```bash
# §5.1 / P3 — AI-inclusive total latency
npx tsx --tsconfig tsconfig.json scripts/bench-ai-latency.ts
```

Evidence in §4.4 (security) and §4.5 (JSONB) was gathered with:

```bash
# No secret referenced by any client component (expect no output)
for f in $(grep -rl '"use client"' src/); do \
  grep -qE "OPENAI_API_KEY|SERVICE_ROLE" "$f" && echo "LEAK: $f"; done

# Supabase client/admin credential split
grep -n "SERVICE_ROLE\|ANON_KEY" src/lib/supabase/*.ts

# Password hashing (expect no output — delegated to Supabase Auth)
grep -rn "bcrypt\|argon2\|scrypt" src/ package.json

# JSONB columns
grep -rn -i "jsonb" supabase/
```

Raw figures, including per-scenario fixture component IDs and full metadata:

- `evidence/raw/bench-validation.json`
- `evidence/raw/sweep-selectivity.json`
- `evidence/raw/bench-recommendations.json`
- `evidence/raw/build-economics.json`
