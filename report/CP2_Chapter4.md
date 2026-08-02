# Chapter 4: Results and Discussion

This chapter reports what the implemented system does, measured rather than asserted. Every figure is reproducible from a named script against a pinned commit, and the reproduction commands are given in Appendix A. Where a claim rests on inference rather than measurement, it is labelled as such.

Two conventions apply throughout. Combinatorial figures are deterministic and reproduce exactly, so they are quoted exactly. Latency figures are stochastic and are quoted to two significant figures with an observed range; no claim in this chapter rests on a tail percentile, because at microsecond scale a single garbage-collection pause dominates the tail and the p95 was observed to vary by a factor of 2.8 between runs of identical code.

## 4.1 The delivered system

The platform comprises nine application routes and nine API endpoints across 110 TypeScript modules, backed by a curated catalog of 60 components.

| Route | Function |
|---|---|
| `/` | Prompt-first landing page with an animated configurator demonstration |
| `/configurator` | AI recommendation flow and manual compatibility checking |
| `/browse` | Catalog browsing by category |
| `/my-builds` | Account-persisted saved builds |
| `/community-gallery` | Threaded community posts with in-context AI replies |
| `/login`, `/signup` | Supabase-backed authentication |

The catalog holds 60 records: 19 plates, 11 stabilisers, 10 switches, 8 PCBs, 7 cases and 5 keycap sets, all verified as purchasable in Malaysia and priced in MYR from local vendor listings.

Quality gates are enforced by a single `verify` script chaining type checking, linting, unit tests and a production build. At submission this passes with 37 test files and 215 passing tests. Section 4.10 qualifies what those tests do and do not cover.

## 4.2 The compatibility engine

Objective 1 required a constraint satisfaction engine preventing physically incompatible selections. The engine is a 622-line module evaluating a complete build across seven validation categories: layout, preferred layout, mount, kit structural integrity, switch, keycap and stabiliser compatibility, plus a separate advisory layer producing non-blocking warnings.

It does not short-circuit. All validators execute unconditionally and accumulate issues, so rejection costs approximately the same as acceptance. This matters for interpreting the timings in Section 4.6: there is no fast path for invalid builds.

### 4.2.1 Selectivity

The catalog admits 7 × 8 × 19 × 10 × 5 × 11 = **585,200** possible component combinations. All were evaluated exhaustively through the real engine in 3.1 seconds — not sampled.

**3,250 combinations are valid.** The engine eliminates **99.4446%** of the decision space; one combination in every 180 survives.

Applying the rules as a sequential cascade shows the space collapsing:

| Rule layer (applied in this order) | Surviving | % of total |
|---|---:|---:|
| All possible combinations | 585,200 | 100% |
| After layout compatibility | 45,650 | 7.80% |
| After mount compatibility | 27,500 | 4.70% |
| After kit structural integrity | 11,300 | 1.93% |
| After switch / keycap / stabiliser fitment | **3,250** | **0.5554%** |

This ordering is analytical, not something the engine performs. Because it does not short-circuit, whichever rule is applied first absorbs every rejection it shares with later rules, and a different ordering redistributes the attribution. Each rule's independent rejection rate against the full space is therefore reported alongside:

| Rule (applied alone) | Rejects | % of 585,200 |
|---|---:|---:|
| Layout compatibility | 539,550 | 92.20% |
| Kit structural integrity | 505,500 | 86.38% |
| Mount compatibility | 339,900 | 58.08% |
| Stabiliser compatibility | 296,700 | 50.70% |
| Switch compatibility | 170,170 | 29.08% |
| Keycap compatibility | 0 | 0.00% |

The independent rates sum to 1,851,820 — 316% of the space — against a combined rejection of 581,950. The difference of 1,269,870 is overlap: most invalid combinations fail several rules simultaneously.

The two views disagree instructively. In the cascade, kit integrity appears a modest third-stage filter reducing 27,500 to 11,300. Applied independently it rejects 86.4%, second only to layout. Its apparent smallness is entirely an artefact of layout and mount having already removed most of what it would have caught. Reporting only the cascade would have understated the kit rule substantially.

### 4.2.2 Physical versus commercial pruning

Not all pruning is physics. Kit integrity rejects combinations that would assemble perfectly but cannot be bought: case, PCB, plate and stabilisers sold together as a kit must share a `kitId`, because the parts are not available separately.

With the kit rule disabled and all physical rules applied, 6,130 combinations survive (1.05%). The kit rule removes a further 2,880. **So 47.0% of physically buildable combinations are rejected for commercial rather than physical reasons.**

A reader who takes the whole 99.44% to be physical impossibility is being told something untrue, and the report makes the split explicit. The finding also generalises: constraint-based configuration systems must model how products are sold, not only how they fit. This rule emerged from domain knowledge rather than from any specification, and without it the system generated builds that were technically valid and commercially useless.

### 4.2.3 Verification

The engine's correctness is established three ways, none of which is the unit test suite (Section 4.10 explains why).

**Exhaustive sweep.** Every rule fires against the full combination space with counted rejections, as above. Two rules — `switch_keycap_technology_mismatch` and `keycap_layout_mismatch` — recorded zero occurrences across all 585,200 combinations. The cause is catalog composition: all five keycap sets declare support for all five layouts and both switch technologies present. The rules are correctly implemented but unreachable with this data, which is reported as a limitation in Section 4.10.

**Independent hand-verified sample.** Twenty combinations were selected by deterministic stratified stride. For each, the expected verdict *and its exact error-code set* were derived by hand from raw field values before consulting the engine. Agreement was **20/20** on both verdicts and precise code sets. This is the only genuinely external check available: the sweep uses the engine to define what "incompatible" means, so sweeping and confirming agreement would be circular.

**Pipeline conformance.** Every build emitted by the recommendation service was re-validated and every referenced component ID checked against the catalog. Result: 18 builds emitted across 8 prompts, all valid, all components resolving, reproduced identically across 7 runs on two architectures. This tests the architectural guarantee — that no unvalidated build can reach a user — rather than testing the validator against itself.

## 4.3 The decision-space reduction chain

The choice-overload argument from Chapter 1 is completed only by measuring both stages of reduction. The engine narrows the combinatorial space; ranking narrows the surviving set to what a user actually sees.

Eight fixed prompts spanning the CP1 personas were run in deterministic mode. The system returns a mean of 2.25 builds, range 0–3, against a hard cap of 3. These counts reproduced byte-identically across seven runs on two architectures.

```
585,200   possible combinations
    3,250   pass the rule engine        (99.4446% removed)
        3   presented to the user       (99.91% of the remainder removed)
```

**Overall: 585,200 → 3, a reduction of 99.9995%.**

This is the empirical form of the CP1 problem statement. Scheibehenne, Greifeneder and Todd (2010) establish that choice overload occurs most reliably when a decision is complex and the chooser lacks domain expertise; Chernev (2003) shows the effect is moderated by the availability of a clear ideal point. A novice keyboard buyer has neither expertise nor an ideal point, and 585,200 options is precisely the condition the literature predicts will produce paralysis. The measured reduction is the mechanism by which the system removes that condition, and it is stronger evidence than either stage alone: the engine alone still leaves 3,250 builds, which no person can evaluate.

Two of the eight prompts returned zero builds. Section 4.8 shows this is correct behaviour arising from catalog economics rather than a defect.

## 4.4 The AI layer

Objective 2 required a retrieval-augmented system translating sensory intent into validated specifications. Performance was measured with a purpose-built suite of 50 cases — 30 intent extraction, 10 assistant grounding, 10 retrieval — encoding domain expertise from over 150 completed keyboard sales in the Malaysian market.

Each suite runs in two modes: an offline deterministic baseline using a local keyword extractor with no API key, and a full-stack mode using structured LLM extraction with pgvector retrieval. This isolates the contribution of the AI components.

### 4.4.1 Baseline versus full stack

Measured at commit `4f019d3`, across the original 50 cases:

| Suite | Offline (deterministic) | Semantic (3 runs) |
|---|---|---|
| Intent Extraction (30) | 30 pass | 30 / 30 / 30 |
| Keybot Grounding (10) | 8 pass, 2 fail | 7 / 8 / 8 |
| RAG Retrieval (10) | 6 pass, 2 expected-fail, 2 pending | 8 / 8 / 8 |
| **Total** | **44** | **45 / 46 / 46** |

An earlier evaluation dated 13 June reported 34 offline and 46 semantic. Those figures are superseded: commit `7192a73` substantially improved the keyword fallback between the two measurements. The comparison is stated explicitly because the two runs measure different code, not different performance of the same code.

### 4.4.2 Deterministic parity on structured extraction

The most surprising result is that the keyword fallback now matches the language model on **all 30** intent extraction cases. Explicit and semi-explicit specifications — budgets, layouts, use cases, stated sound preferences — are fully recoverable by deterministic rules.

This narrows the AI contribution considerably and is worth stating plainly rather than obscuring behind a headline total. The reproducible gain of the full stack over a well-engineered deterministic fallback is **exactly two cases**, and both are semantic-gap cases.

### 4.4.3 Closing the semantic gap

Two retrieval cases were documented as expected failures from the outset, representing precisely the gap defined in Chapter 1. In these, users describe sound in sensory language — "buttery smooth", "deep thud" — with no lexical overlap with the catalog's technical vocabulary. Keyword retrieval cannot resolve them by construction.

Both moved from expected-fail to pass once pgvector embeddings were seeded, with "buttery smooth" retrieving creamy linear switches and "deep thud" retrieving thocky components. Both pass in every semantic run recorded.

This is the most direct empirical answer to the research question. It demonstrates that the semantic gap is measurable, that it is not resolvable by lexical means, and that vector retrieval over component descriptions closes it — while the rule engine continues to guarantee the retrieved components form a physically valid build. Mandal, Tunkelang and Wu (2023) identify semantic equivalence as the core failure of lexical matching in e-commerce queries, and Lewis et al. (2020) establish retrieval-augmented generation as the mechanism for grounding generation externally. The two mechanisms here are complementary rather than competing: retrieval widens the candidate space in a way keyword matching cannot, and validation narrows it in a way generation cannot be trusted to do.

### 4.4.4 Grounding stability, and an inversion

The grounding suite behaves differently from the other two, in a way that is itself a finding.

Its offline score is stable at 8/10, failing the same two cases every run. Its semantic score varies: across seven semantic runs it scored 7, 8, 8, 9, 8, 9 and 8 — a three-case swing on a ten-case suite from model non-determinism alone, with two cases flipping between runs. One case, requiring curated expert knowledge about specific budget recommendations and lubrication technique not present in the catalog, fails in every run and every mode.

Two conclusions follow. First, **the deterministic path is more reliably constraint-compliant than the model**: one recurring semantic failure is the assistant using a term the grounding rules forbid, a violation the keyword path never commits. Second, the offline suite is the reliable regression signal, and any movement of one or two grounding cases in semantic mode falls within observed noise and cannot be attributed to a code change.

That grounding does not improve under the full stack is the expected and desired result. Grounding is enforced by retrieval and validation, not by model capability, so a stronger model should not improve it. Its stability across conditions is evidence that the mechanism, rather than the model, is doing the work — which is the central architectural claim of this project.

## 4.5 Design Cycle 2: user testing and remediation

Design Science Research proceeds through iterative cycles of design and evaluation. Cycle 1 is documented in Section 4.9: the removal of the proposed 2D visual builder on evaluation evidence. Cycle 2 is reported here — user testing, triage, implementation and re-measurement.

### 4.5.1 Findings and triage

Testers were given navigation tasks in the working system. Four findings emerged, all triaged as implement-now rather than deferred:

| # | Finding | Nature |
|---|---|---|
| 1 | A request for a "purple and blue themed" build returned keycaps unrelated to any colour | Functional gap |
| 2 | The community page "does not look like a page for posts" | Affordance |
| 3 | Saved builds could not be located | Discoverability |
| 4 | The design is too plain, with little visualisation | Presentation |

Finding 4 is the most consequential for this report and is discussed in Section 4.9, because it independently corroborates the cost of a Cycle 1 decision.

### 4.5.2 Finding 1: colourway intent

Investigation showed the intent schema extracted budget, layout, sound profile, use case, switch technology, beginner-friendliness, priorities and constraints — and **no colour field at all**. Aesthetic intent was discarded silently during extraction. Further, only keycaps carried any colour data; cases, plates and PCBs carried none.

The fix was implemented failing-test-first. Eight evaluation cases were written and committed *before* any implementation, and the failing baseline recorded. The cases are reported as three separate claims, because the instrument changed between baseline and after-state and a single total would invite a false inference:

| Claim | Cases | Offline | Semantic |
|---|---|---|---|
| Capability | `col-001`–`004`, `col-008` | 0/5 → **5/5** | 0/5 → **5/5** (3 runs) |
| Control A | `col-005`–`007` | 3/3 → 3/3 | 3/3 → 3/3 |
| Control B | the original 50 | unchanged | unchanged |

Control A is a set of adversarial guards — prompts baiting a colour tag without naming one, such as "aluminium case, premium feel", where *silver* is in the controlled vocabulary and *aluminium* is a material. A control earns its place by not moving, and these did not move: no colour hallucination was introduced.

Control B is protected twice over. The runner skips any case not declaring an expected colour, so the original assertions are untouched by construction; and independently, none of the 30 original prompts contains a vocabulary colour word, so extraction cannot fire on them at all.

Suite totals moved from 47 pass / 7 fail to 52 pass / 2 fail offline, and from 50 to a mean of 54.33 (range 54–55) semantic, both against a denominator of 58. The denominator changed from 50 because eight cases were added; passes rose by five and failures fell by five for that reason, and the totals are not comparable across the change.

Colour ranks; it never filters. Candidate selection never receives colour, so a colour preference reorders results and can never empty them. Three properties are unit tested: the ranking is a no-op when no colour is requested, so every pre-existing ranking is bit-identical to before the feature existed; an untagged component scores the same as a tagged non-match, so ranking cannot encode catalog curation completeness; and matches only ever add. Colour is not a compatibility concern and the rule engine never reads it.

### 4.5.3 A defect found by screenshot, not by evaluation

The first after-screenshot showed no change whatsoever. Extraction was passing 5/5, the ranking unit tests passed, and a direct probe confirmed the scoring function reordered candidates correctly. The feature was nonetheless completely inert in the running application.

The cause was configuration, not code. The application reads its catalog from Supabase whenever credentials are present, falling back to the seed file only when they are absent. The colour tags had been added to the seed file. Every component in the running system therefore reported no colour, the ranking term contributed zero, and output was identical to before for reasons entirely unconnected to the implementation.

Resolution was a targeted merge of `metadata.colour` into the five keycap rows, preserving existing keys, verified afterwards as 60 rows with colour on 5 and `kitId`/`kitLock` intact on 30 each.

**This is the most transferable finding in the project.** A change can pass every unit test, every evaluation case and a direct functional probe, and still do nothing in the deployed configuration, because tests and production may not read the same data source. It was caught only because the design cycle required a before-and-after screenshot rather than trusting a green evaluation — which retroactively justifies the screenshot protocol, since without it the fix would have shipped green and broken.

### 4.5.4 Findings 2, 3 and 4

**Finding 3** was diagnosed precisely: `/my-builds` existed and worked, but was reachable only through an unlabelled avatar trigger, and the post-save confirmation named "the My Builds page" in plain text — telling users where the build had gone without giving them any way to get there. Both were corrected. Three existing tests asserted the *opposite* behaviour and were inverted rather than deleted, since those assertions encoded exactly what user testing rejected. This is the classic implemented-but-not-usable result: the feature was complete and the affordance absent.

**Finding 2** was addressed presentationally. The gallery was a three-column image grid, carrying photo-gallery affordances where the image leads and author, timestamp and discussion are secondary or absent. It was restructured as a single-column feed using the conventions readers recognise as posts. No data model or server action changed. One requested affordance — a per-post reply count — was deliberately not implemented, because the count is not present in the list query and adding it would exceed the presentational scope; the card invites the thread rather than asserting a number it cannot know.

**Finding 4** was timeboxed, and an audit found two of its three scoped items already implemented before user testing, while the third targeted a component that nothing in the product renders. Rather than perform work that either already existed or would be invisible, the scope was reduced to one change with real substance: the recommendation card now names the build's colourway semantically rather than only showing hex swatches. Reporting this honestly matters — quietly "completing" the original three items would have placed claims in this report that were either untrue or pre-existing.

## 4.6 Non-functional requirements

CP1 §3.2.4, Table 3.4 specified seven non-functional requirements. All are evaluated.

| # | Requirement | Measured | Verdict |
|---|---|---|---|
| 1 | Validation under 200 ms | median 0.0068 ms (range 0.0068–0.0091), n=1000 | **MET**, ~29,000× margin |
| 2 | First text token under 2 s | assistant median 2,410 ms, p95 4,110 ms | **NOT MET** |
| 3 | 100% prevention of incompatible pairs | 18/18 emitted builds valid across 7 runs; 20/20 independent agreement | **MET** |
| 4 | All recommendations reference existing entries | 18/18, all IDs resolve | **MET** |
| 5 | JSONB for variable attributes | 6 columns across 3 migrations | **MET** |
| 6 | Accurate layered rendering | — | **SCOPED OUT** (§4.9) |
| 7 | bcrypt hashing; server-side API keys | 0 of 18 client components reference secrets; 22 RLS policies | **MET BY DELEGATION** |

Three results merit discussion.

**Requirement 1 is an overwhelming pass, and that is the interesting part.** CP1 allocated a 200 ms budget to compatibility validation, implying an expectation that validation would be a meaningful share of user-perceived latency. It is not: validation costs roughly four thousandths of one percent of its allowance. Meanwhile the project's own offline pipeline — with zero network calls — has a median of about 95 ms and a p95 of about 240 ms, so the p95 of the surrounding logic *exceeds* the budget assigned to validation alone. The requirement was placed on the cheapest component of the pipeline. This is a reflection on requirements-setting at proposal stage rather than an engineering result.

Validation scales linearly with catalog size, not flatly. The cause is identifiable in code: the lookup index is rebuilt on every call, which is O(n) in catalog size, while the compatibility rules themselves inspect only the six selected components and are O(1). The entire linear term is index construction. Extrapolating, the catalog would need roughly 3.1 million records to breach the 200 ms requirement, so this is an architectural observation rather than a risk — but hoisting the index would make validation effectively constant-time, and that is a future-work item supported by measurement rather than intuition.

**Requirement 2 is the project's only failed NFR, and the failure is threefold.** First, it cannot be evaluated as written: time-to-first-token presupposes streaming, and no streaming exists anywhere in the implementation. Second, on the closest measurable quantity it fails outright — the assistant's median total response is 2,410 ms against a 2,000 ms budget, and intent extraction, while passing at the median, exceeds the budget at p95. Third — and this is inference rather than measurement — because nothing streams, the user sees nothing until the entire payload arrives, so total latency *is* the user's time to first text. It is not a proxy for the requirement; it is the same quantity the requirement was written to constrain. Whether a streaming implementation would have delivered a first token inside two seconds is plausible but untested, and is not claimed here.

**Requirement 7 is met differently from how it was specified.** No bcrypt implementation exists anywhere in the codebase, because password hashing is delegated entirely to Supabase Auth and the application never handles a raw password. The security property is satisfied; the named mechanism is absent. Both facts are reported.

## 4.7 The competitive audit, re-run

CP1 §2.6.2 audited existing market solutions across ten dimensions and concluded that no single tool integrates AI guidance, compatibility logic, sensory feedback and community. Applying the same instrument to the delivered system, with a `Sharkeys (delivered)` column added beside CP1's `Sharkeys (proposed)`, and scoring any cell without concrete evidence — a route, file, endpoint or test — as not delivered:

**Four dimensions delivered, three partial, three not delivered.**

| CP1 module | Status | Basis |
|---|---|---|
| AI guidance | **Closed** | Natural-language intent, semantic retrieval, agent pipeline, vision intent |
| Compatibility checks | **Closed** | Deterministic engine; 99.44% decision-space reduction measured |
| Community | **Partially closed** | Gallery, threads and in-context assistant delivered; one-click cloning absent |
| Sensory feedback | **Not closed** | No audio assets, no data, no playback anywhere in the repository |

The delivered system closes two of the four gaps, partially closes a third, and does not close the fourth. CP1's stated contribution was the integration of all four, and on this evidence that integration claim is not fully supported. The sensory dimension — which CP1 argued most strongly was the unaddressed market barrier — is the one the delivered system also leaves unaddressed.

Two further observations qualify the picture. The compatibility engine deviates from CP1's specification of "real-time AI validation": the delivered engine is deterministic and contains no AI whatsoever. This is an architectural inversion rather than a shortfall, and validation that cannot hallucinate is a stronger guarantee than the one specified — but it is not what CP1 described. And a light re-verification found that one competitor has since added a guided, explicitly jargon-free quiz, narrowing the differentiation CP1 claimed on two dimensions. The core distinction holds, since that competitor remains a discovery tool over finished boards rather than a component-level configurator, but the margin is smaller than the proposal asserted.

Two capabilities were delivered *beyond* the CP1 instrument and are therefore invisible in its table: vision-based intent extraction, and the evaluation suite itself. The audit understates the project to that extent.

## 4.8 Target-market economics

Pricing every valid build through the production price estimator produces a result that contradicts a CP1 positioning claim.

| Statistic | MYR |
|---|---:|
| Cheapest valid build | 281.00 |
| Median | 600.00 |
| Builds at or under RM250 | **0** |

CP1 targets the RM150–250 segment of the Malaysian market. **No valid build exists below RM281 — RM31 above the ceiling of the target band, and RM131 above its floor.** Not one of the 3,250 valid builds falls anywhere within the stated target market, and the median build costs roughly 2.4 times the top of the range.

This explains the two zero-result prompts in Section 4.3 and confirms they are not defects. Intent extraction parsed both correctly, the engine found no build meeting the constraints within budget, and the system degraded gracefully with an accurate near-miss message inviting the user to raise the budget or relax a preference. The behaviour is correct; the economics are the finding.

Two explanations are consistent with the data and cannot be distinguished without vendor survey work not undertaken here. Either the catalog under-samples the budget segment and cheaper components exist that were not curated in; or a complete build from separately purchased components genuinely does not exist below approximately RM280 in this market, and CP1's target band was set without testing feasibility. The first is a curation limitation with an obvious remedy; the second invalidates a CP1 assumption. Distinguishing them is listed as future work.

## 4.9 Achievement against the objectives, and deviations

| Objective | Evidence | Status |
|---|---|---|
| 1. Logic-driven configurator with constraint engine | 622-line engine, 7 categories, 99.44% space reduction, 20/20 independent agreement, no invalid build emitted in any run | **Achieved** |
| 2. RAG recommendation translating sensory intent | Both semantic-gap cases closed and reproducible; no hallucinated component in any grounding run; colour extraction 5/5 in both implementations | **Achieved** |
| 3. Full-stack application with social features | Accounts, persistent builds, publishing, threaded gallery with AI replies delivered; one-click cloning not delivered | **Substantially achieved** |

Three proposed outcomes changed during implementation. It is worth noting at the outset that the 2D visual builder and the acoustic library appear in CP1 §1.4 as proposed *modules*, not among the three formal objectives in §1.3 — but they were promised, and are accounted for here.

**The 2D layered visual builder was removed.** Two factors drove this. Feasibility: the approach requires photographically consistent layered assets for every component in every category, which was not achievable in the timeframe. More importantly, evaluation evidence indicated the effort was better directed elsewhere — the measured weakness at the mid-point was recommendation accuracy, not visual feedback, and the literature reviewed in Chapter 2 offers only qualified support for rich visualisation, with several studies reporting diminishing returns relative to implementation cost. The capacity was redirected into semantic retrieval, the agent architecture and the evaluation suite, which produced the gains reported in Section 4.4.

**User testing subsequently confirmed this decision carried a real cost.** Finding 4 — that the design is too plain with little visualisation — was raised independently and unprompted by testers, and directly corroborates the need-for-touch and visualisation literature from Chapter 2. This is reported as a limitation rather than a vindication: the trade-off had a measurable cost on both sides, which is a genuine Design Science Research finding rather than a defence of the decision.

**The acoustic library was not implemented**, for the same capacity reasons and because it depends on recording or licensing consistent audio samples under controlled conditions — a data-collection problem of comparable scale to the visual asset problem. The data model anticipates it: a sound URL field and a dedicated sound-samples table both exist in the schema, entirely unpopulated. Its absence is a genuine limitation, since Chapter 2 establishes sensory verification as a real barrier, and it is accordingly the first item of future work.

**Community cloning was partially delivered.** Publishing, browsing and threaded discussion with in-context AI replies were implemented; one-click cloning of another user's build was not. The social proof mechanism is present, but the frictionless adoption path CP1 identified as closing the gap between inspiration and purchase is absent.

## 4.10 Threats to validity

**The evaluation ground truth was authored by the researcher, who is also the domain expert.** While grounded in commercial sales experience, this risks the test cases encoding the same assumptions as the system. Independent expert review would strengthen the evaluation and is listed as future work.

**The unit test suite does not cover what its headline figure implies.** Of 257 tests, 42 are skipped — all disabled for a single reason, having been pinned to a superseded catalog and never restored. The disabled set includes ten tests in the rule engine's own suite, among them the basic valid-build case, both kit-integrity tests, the stabiliser rule and both warning-versus-error tests. Of the seven validation categories, kit integrity, stabiliser compatibility and the preference-warning layer have **no active unit test**. Also disabled elsewhere are tests asserting that recommendations contain no hallucinated claims, that explanations stay grounded in component data, that deterministic recommendations survive an OpenAI failure, and that budgets are enforced.

Those properties are nonetheless verified — by the exhaustive sweep, the independent sample and the conformance runs, which are arguably stronger evidence because they are exhaustive rather than exemplary. But "215 tests passed" must not be read as covering them. Restoring the fixtures against the current catalog is future work; the valid component identifiers needed already exist in the benchmark output.

**Two implemented rules are unreachable with the current catalog**, as reported in Section 4.2.3, compounding the coverage gap above.

**Catalog scale is small.** Sixty components may not generalise: semantic retrieval faces more competing candidates as a catalog grows, and the reduction ratios in Section 4.3 are specific to this catalog's composition.

**Colour coverage is partial.** Five of five keycap sets carry colour tags; zero of seven cases do, because the required data does not exist in any product name, description or vendor URL and was not fabricated. A case therefore cannot currently rank up for its colour, though the system behaves correctly with tags absent.

**Language model outputs are non-deterministic**, quantified in Section 4.4.4 as a three-case swing on a ten-case suite. All semantic figures are reported as means with observed ranges across three or more runs.

**Latency measurements are environment-specific.** Figures were taken on the development machine and a containerised Linux environment; both are reported where they differ, and neither represents a production deployment.

Finally, one methodological note. Cross-checking independent measurements against each other was used deliberately as an error-detection method during this work, and it caught two real faults: a pricing calculation that disagreed with the recommendation service's own output, and a set of latency figures that had drifted from the raw data they were derived from. Where two measurements of the same system disagree, the disagreement was treated as a defect in the measurement before being treated as a finding.
