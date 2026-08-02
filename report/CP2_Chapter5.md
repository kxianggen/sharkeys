# Chapter 5: Conclusion and Future Work

## 5.1 Conclusion

This project set out to determine whether generative artificial intelligence could be applied safely to a product configuration domain in which physical correctness is non-negotiable, and to build and evaluate a system demonstrating that architecture in the custom mechanical keyboard market.

### 5.1.1 The objectives

**Objective 1 — a logic-driven configurator with a constraint satisfaction engine — was achieved.** The delivered engine evaluates a complete build across seven validation categories and eliminates 99.4446% of the 585,200 combinations the catalog admits. Its correctness rests on three independent forms of evidence: an exhaustive sweep of every possible combination, a hand-derived sample of twenty cases agreeing 20/20 on both verdicts and exact error codes, and conformance runs confirming that every build the recommendation service emits re-validates cleanly. Critically, the guarantee is structural rather than statistical: validation sits inside the recommendation path, so an unvalidated build has no route to the interface.

**Objective 2 — a retrieval-augmented system translating sensory intent — was achieved**, though the result is more nuanced than anticipated. The two documented semantic-gap cases, where users describe sound in language sharing no vocabulary with the catalog, were closed by vector retrieval and could not be closed by lexical means. Colour extraction, added in response to user testing, reached 5/5 in both the language-model and deterministic implementations. No hallucinated component appeared in any grounding run in any condition.

**Objective 3 — a full-stack application with social commerce features — was substantially achieved.** Accounts, persistent saved builds, publishing and a threaded community gallery with in-context assistant replies were delivered. One-click cloning of another user's build was not, so the social proof mechanism is present while the frictionless adoption path is absent.

### 5.1.2 The central finding

The most important result is that the two mechanisms proved complementary rather than competing, and that the measured gains came from a specific and identifiable place.

Every improvement recorded in this project came from better interpretation and retrieval. **None came from relaxing validation.** The rule engine rejected every incompatible configuration in every condition tested, and its behaviour is bit-identical before and after the introduction of the AI layer.

More surprising is where the AI's contribution actually lies. A well-engineered deterministic keyword extractor reached parity with the language model on all thirty intent extraction cases — explicit budgets, layouts, use cases and stated preferences are fully recoverable by rules. The reproducible gain from the full generative stack over that deterministic floor is exactly two cases, and both are semantic-gap cases. The language model earns its place in this architecture not by being generally better, but by resolving precisely the class of input that rules cannot express.

The grounding results sharpen the point further. Grounding did not improve under the full stack, which is the desired outcome: it is enforced by retrieval and validation rather than by model capability, so a stronger model should not improve it. Its stability across conditions is evidence that the mechanism, not the model, is doing the work. Indeed the deterministic path proved *more* reliably constraint-compliant than the language model, which intermittently used terminology the grounding rules forbid.

This is the practical form of the neuro-symbolic argument developed in Chapter 2. The language model widens the space of requests the system can understand; the rule engine narrows the space of answers it is permitted to give. Neither component alone would be sufficient, and the value lies specifically in the constraint between them.

### 5.1.3 A secondary contribution

A second contribution is methodological. Encoding practitioner expertise as an executable evaluation suite converted a subjective quality question into a measurable one, and made design decisions defensible with evidence rather than assertion — including the decision to remove a proposed feature, and the decision to report an AI contribution smaller than the project's own framing would have preferred.

That framework also produced findings the project did not set out to look for. The measured decision-space reduction quantified the choice-overload claim that Chapter 1 could only assert. The build-economics analysis revealed that no valid build falls within the stated target market, contradicting a positioning assumption carried forward from the proposal. And the design cycle surfaced a defect that no test could have caught, discussed below.

### 5.1.4 The lesson that generalises furthest

During remediation of a user-testing finding, a change passed every unit test, every evaluation case and a direct functional probe — and was completely inert in the running application. The cause was not the code. The application reads its catalog from the database whenever credentials are configured, while the tests read a seed file; the data the fix depended on existed only in the latter.

It was caught because the design cycle required a before-and-after screenshot rather than trusting a green evaluation. Had the protocol permitted trusting the test result, the feature would have shipped passing and broken.

The generalisable lesson is that verification is only meaningful in the configuration that actually runs, and that a test suite reading different data from production verifies a system that does not exist. For a project whose central claim is about deterministic guarantees, this is a useful corrective: the guarantee holds only where the guaranteeing component can see the data it needs.

### 5.1.5 Reflection on the methodology

Design Science Research proved appropriate not because the design was correct from the outset but because it was not. Two complete cycles are documented: the removal of the proposed two-dimensional visual builder on evaluation evidence at the mid-point, and the user-testing cycle that produced four remediated findings. The second cycle also produced the uncomfortable result that testers independently identified reduced visual richness as their most common criticism — directly corroborating that the first cycle's decision carried a real cost.

Reporting that as a limitation rather than a vindication is, in the author's view, the more honest reading, and it is the kind of finding a single-pass development process would not have produced.

## 5.2 Future Work

Each item below is stated against the specific limitation in Section 4.10 that motivates it, in descending order of value to the project's stated aims.

### 5.2.1 The acoustic library

**Limitation addressed:** the sensory dimension is the one CP1 gap the delivered system does not close, and Chapter 2 establishes sensory verification as a genuine market barrier.

This is the highest-priority item and the most significant proposed feature not delivered. The data model already anticipates it — a sound-sample table and a per-component sound URL field both exist in the schema, entirely unpopulated — so the outstanding work is data collection rather than architecture. Implementation requires recording switch samples under controlled and consistent conditions, which is the constraint that deferred it, and an A/B comparison interface. The competitive audit shows this dimension is unaddressed by every competitor reviewed, so closing it would restore the differentiation CP1 claimed.

### 5.2.2 Resolving the target-market contradiction

**Limitation addressed:** no valid build exists below RM281, while the stated target market is RM150–250. Zero of 3,250 valid builds fall within the band.

Two explanations are consistent with the evidence and cannot currently be distinguished: either the catalog under-samples the budget segment, or a complete build from separately purchased components does not exist below approximately RM280 in this market. The first is a curation problem with an obvious remedy; the second invalidates an assumption carried from the proposal and would require the target band to be restated.

Distinguishing them requires a vendor survey of the sub-RM280 segment — checking whether cheaper cases, PCBs and plates exist from Malaysian vendors and were simply not curated. This should be undertaken before the catalog is expanded for any other reason, because the answer determines whether expansion is a fix or merely more of the same.

### 5.2.3 Restoring the disabled test fixtures

**Limitation addressed:** 42 of 257 tests are skipped, including all unit coverage of kit integrity, stabiliser compatibility and the warning-versus-error distinction, plus tests asserting anti-hallucination, grounding and graceful degradation.

Those properties are verified by the exhaustive sweep, the independent sample and the conformance runs, so the system is not unverified — but the unit suite does not cover what its headline figure implies, and that gap should not persist. The tests were disabled when the catalog was replaced and pinned to component identifiers that no longer exist. Restoration is mechanical rather than conceptual: valid component identifiers for every scenario already exist in the benchmark output committed with this project.

### 5.2.4 Streaming, and the failed non-functional requirement

**Limitation addressed:** the AI response requirement is the project's only failed NFR, failing both as specified and on the closest measurable quantity.

No streaming exists in the implementation, so time-to-first-token is not a quantity the system produces, and because nothing streams the user sees nothing until the entire payload arrives. Implementing streamed responses would address the requirement directly and is the single change most likely to alter perceived responsiveness, since the underlying model latency is unlikely to fall.

Whether streaming alone would satisfy the two-second budget is untested and is not claimed. Measuring first-chunk latency against the same model and prompts is a small piece of work that would convert that open question into an answer, and should precede any implementation decision.

### 5.2.5 Extending colour coverage

**Limitation addressed:** five of five keycap sets carry colour tags; zero of seven cases do.

The case records contain no colour information in any product name, description or vendor URL, and values were deliberately not fabricated. Consequently a case cannot rank up for its colour, and a request for a themed build can only be satisfied at the keycap level — a partial answer to the user finding that motivated the feature. The work is data curation from vendor listings rather than development, and would complete a fix that is currently only half-effective.

### 5.2.6 An expert knowledge grounding layer

**Limitation addressed:** one grounding case fails in every run and every mode, requiring practitioner knowledge that catalog specifications do not contain.

The failing case concerns specific budget recommendations and lubrication technique — knowledge the domain expert possesses but which has no representation in a product catalog. A separate knowledge layer, distinct from the catalog and retrievable by the assistant, would close it and extend the system from specification matching toward genuine advice. This is arguably the most interesting extension, because it tests whether the grounding architecture generalises beyond structured product data.

### 5.2.7 Independent evaluation

**Limitation addressed:** the evaluation ground truth was authored by the researcher, who is also the domain expert.

Having the test cases reviewed, or independently authored, by domain experts other than the researcher would address the principal validity threat in this study. The current suite is grounded in commercial experience, but nothing prevents it encoding the same assumptions as the system it evaluates.

### 5.2.8 Catalog scale and retrieval behaviour

**Limitation addressed:** sixty components may not generalise; semantic retrieval faces more competing candidates as a catalog grows.

Expansion should be treated as an experiment rather than a data-entry exercise, with the evaluation suite re-run at each scale increment to detect where retrieval precision begins to degrade. The reduction ratios reported in Chapter 4 are specific to this catalog's composition and would need re-measuring.

### 5.2.9 Constant-time validation

**Limitation addressed:** validation scales linearly with catalog size because the lookup index is rebuilt on every call.

The compatibility rules themselves inspect only the six selected components and are constant-time; the entire linear term is index construction. Hoisting the index out of the per-call path would make validation effectively constant-time. At present the catalog would need roughly 3.1 million records to breach the latency requirement, so this is not urgent — but it is a well-characterised inefficiency supported by measurement rather than intuition, and it interacts directly with Section 5.2.8.

### 5.2.10 Completing the community loop

**Limitation addressed:** one-click cloning was not delivered, so the mechanism CP1 identified as closing the gap between inspiration and purchase is absent.

Chapter 2 establishes observational learning and social proof as genuine decision supports, and the gallery delivers the inspiration half. Cloning a community build into a personal workspace is a small piece of work relative to its effect on the social commerce objective, and would complete the third objective in full.

## 5.3 Closing remarks

The system delivered is a functional prototype rather than a production platform, and this report has been explicit about what it does not do. It does not address sensory verification, it does not currently serve the price segment it was designed for, and its test suite covers less than its headline figure suggests.

What it does demonstrate, with measurement rather than assertion, is that a generative model can be deployed safely in a domain where physical correctness is non-negotiable, provided its output is constrained by a deterministic authority that the model cannot influence. The measured decision-space reduction, the closure of the semantic gap by retrieval, and the invariance of the compatibility guarantee across every condition tested together support that claim. The evaluation framework built to test it, and the defect it failed to catch, are offered as contributions in their own right.
