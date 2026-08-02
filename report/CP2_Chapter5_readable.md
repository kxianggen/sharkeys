# Chapter 5: Conclusion and Future Work

## 5.1 Conclusion

This project set out to answer a specific question: **can generative AI be used
safely in a domain where being physically correct is not optional?** Custom
mechanical keyboards were chosen as the test case, because a wrong recommendation
there is not merely unhelpful — it produces parts that cannot be assembled and
money that cannot be recovered.

The answer, on the evidence in Chapter 4, is yes — but only under a specific
architectural condition, and the shape of that condition turned out to be more
interesting than expected.

### 5.1.1 The objectives

**Objective 1 — a logic-driven configurator with a constraint satisfaction engine
— was achieved.** The delivered engine checks a complete build across seven rule
categories and eliminates 99.4446% of the 585,200 combinations this catalog
allows. Its correctness rests on three independent forms of evidence: an
exhaustive sweep of every possible combination, a hand-derived sample of twenty
cases agreeing 20 out of 20 on both verdicts and exact error codes, and
conformance runs confirming that every build the system produces re-validates
cleanly.

The most important word there is **structural**. Validation does not sit beside
the recommendation path as an optional check; it sits inside it. An unvalidated
build has no route to the user interface at all. That is a guarantee about the
architecture, not a statistic about how often it works.

**Objective 2 — a retrieval-augmented system translating sensory intent — was
achieved**, though the result is more nuanced than anticipated. The two
documented semantic-gap cases, where a user describes sound in language sharing
no vocabulary with the catalog, were closed by meaning-based retrieval and could
not be closed by keyword matching. Colour extraction, added in response to user
testing, reached 5 out of 5 in both the language-model and the rule-based
implementations. No invented component appeared in any grounding run, in any
condition, at any point.

**Objective 3 — a full-stack application with social commerce features — was
substantially achieved.** Accounts, saved builds, publishing and a threaded
community gallery with in-context assistant replies were delivered. One-click
cloning of another user's build was not. The social proof mechanism is present;
the frictionless path from inspiration to purchase is missing.

### 5.1.2 The central finding

The most important result of this project is that the two mechanisms proved
**complementary rather than competing** — and, more usefully, that it is now
possible to say exactly where each one earns its place.

**Every improvement recorded in this project came from better interpretation and
retrieval. None came from relaxing validation.** The rule engine rejected every
incompatible configuration in every condition tested, and its behaviour is
bit-for-bit identical before and after the AI layer was introduced. The AI never
bought accuracy by loosening a constraint, because it was never given the
authority to.

More surprising is where the AI's contribution actually lies. A carefully written
keyword extractor — no model, no API, no network — reached **parity with the
language model on all thirty intent extraction cases.** Explicit budgets, layout
sizes, use cases and stated preferences are entirely recoverable by ordinary
rules.

The reproducible gain of the full generative stack over that deterministic floor
is **exactly two cases**, and both are semantic-gap cases. The language model
earns its place in this architecture **not by being generally better, but by
resolving precisely the class of input that rules cannot express.** That is a far
smaller claim than the project's own framing would have preferred, and it is
worth considerably more, because it is specific enough to be tested and it
survived testing.

The grounding results sharpen the point. Grounding did **not** improve under the
full stack — which is the desired outcome, not a disappointment. Grounding is
enforced by retrieval and validation rather than by model capability, so a better
model should not improve it. Its flatness across every condition is direct
evidence that the *mechanism* rather than the *model* is doing the work.

Indeed the relationship inverted. The rule-based path proved **more** reliably
constraint-compliant than the language model, which intermittently used
terminology the grounding rules explicitly forbid. The component with no
intelligence was the better-behaved one.

This is the practical form of the neuro-symbolic argument developed in Chapter 2
from Huang et al. (2025) and Pradier et al. (2021):

> **The language model widens the space of requests the system can understand.
> The rule engine narrows the space of answers it is permitted to give.**

Neither component alone would be sufficient. A rule engine cannot interpret
"buttery smooth"; a language model cannot be trusted to guarantee a build
assembles. **The value lies specifically in the constraint between them** — and
that constraint is what this project set out to test.

### 5.1.3 A secondary contribution

The second contribution is methodological.

Encoding practitioner expertise as an *executable* evaluation suite turned a
subjective question — "are these recommendations any good?" — into a measurable
one. That change made design decisions defensible with evidence rather than
assertion, including two decisions that were uncomfortable: removing a proposed
feature, and reporting an AI contribution smaller than the project's own framing
would have liked.

The framework also produced findings the project never set out to look for:

- The measured decision-space reduction **quantified** the choice-overload claim
  that Chapter 1 could only assert.
- The build-economics analysis revealed that **no valid build falls within the
  stated target market**, contradicting a positioning assumption carried forward
  from the proposal.
- The design cycle surfaced a defect that **no test could have caught**, discussed
  next.

A measurement framework that only confirms what you expected is not doing much
work. This one repeatedly returned answers the project would not have chosen.

### 5.1.4 The lesson that generalises furthest

While fixing a user-testing finding, a change passed every unit test, every
evaluation case and a direct functional probe — and was **completely inert in the
running application.**

The cause was not the code. The application reads its catalog from the database
whenever credentials are configured, while the tests read a local seed file. The
data the fix depended on existed only in the seed file. Every test was correct.
Every test was also testing a system that was not the one running.

It was caught only because the design cycle required a before-and-after
screenshot rather than permitting a green evaluation to be trusted. Had the
protocol allowed that shortcut, the feature would have shipped passing and
broken.

> **Verification is only meaningful in the configuration that actually runs. A
> test suite reading different data from production verifies a system that does
> not exist.**

For a project whose central claim is about deterministic guarantees, this is a
necessary corrective. **A guarantee holds only where the guaranteeing component
can actually see the data it needs.** The rule engine's authority over
compatibility is real — but it is real because the compatibility data reaches it,
and that is a property of deployment, not of design.

### 5.1.5 Reflection on the methodology

Design Science Research proved appropriate not because the design was right from
the start, but precisely because it was not.

Two complete cycles are documented. The first was the removal of the proposed 2D
visual builder at the project mid-point, decided on evaluation evidence rather
than preference. The second was the user-testing cycle that produced four
remediated findings.

The second cycle also produced an uncomfortable result: testers independently
identified reduced visual richness as their most common criticism, directly
corroborating that the first cycle's decision carried a genuine cost. Both cycles
were correct on their own evidence, and they point in opposite directions.

Reporting that as a limitation rather than a vindication is the more honest
reading, and it is exactly the kind of finding a single-pass development process
would never have produced — because there would have been no second measurement
to contradict the first.

## 5.2 Future Work

Each item below is stated against the specific limitation in Section 4.10 that
motivates it, ordered by value to the project's stated aims rather than by ease.

### 5.2.1 The acoustic library

**Limitation addressed:** sensory feedback is the one CP1 gap the delivered
system does not close, and Chapter 2 establishes sensory verification as a
genuine market barrier.

This is the highest-priority item and the most significant proposed feature not
delivered. The data model already anticipates it — a sound-samples table and a
per-component sound URL field both exist in the schema, entirely unpopulated — so
the outstanding work is **data collection rather than architecture.**
Implementation needs switch samples recorded under controlled, consistent
conditions, which is exactly the constraint that deferred it, plus a side-by-side
comparison interface.

The competitive audit in Section 4.7 shows this dimension is unaddressed by every
competitor reviewed, so closing it would restore the differentiation CP1 claimed
and address the need for pre-purchase sensory verification that Zheng and
Bensebaa (2022) identify.

### 5.2.2 Resolving the target-market contradiction

**Limitation addressed:** no valid build exists below RM281, while the stated
target market is RM150–250. Zero of 3,250 valid builds fall within the band.

Two explanations fit the evidence and cannot currently be told apart: either the
catalog under-samples the budget segment, or a complete build from separately
purchased components genuinely does not exist below about RM280 in this market.
The first is a curation problem with an obvious remedy. The second invalidates an
assumption carried from the proposal and would require the target band to be
restated.

Distinguishing them requires a vendor survey of the sub-RM280 segment — checking
whether cheaper cases, PCBs and plates exist from Malaysian vendors and were
simply not curated in.

**This should be done before the catalog is expanded for any other reason,**
because the answer determines whether expansion is a genuine fix or merely more
of the same problem at greater scale.

### 5.2.3 Restoring the disabled test fixtures

**Limitation addressed:** 42 of 257 tests are skipped, including all unit
coverage of kit integrity, stabiliser compatibility and the warning-versus-error
distinction, plus tests asserting anti-hallucination, grounding and graceful
degradation during an outage.

Those properties are verified by the exhaustive sweep, the independent hand-check
and the conformance runs, so the system is **not** unverified. But the unit suite
does not cover what its headline figure implies, and that gap should not persist
into any future work on this codebase.

The tests were disabled when the catalog was replaced and are pinned to component
identifiers that no longer exist. Restoration is **mechanical rather than
conceptual**: valid component identifiers for every scenario already exist in the
benchmark output committed with this project.

### 5.2.4 Streaming, and the failed non-functional requirement

**Limitation addressed:** the AI response requirement is the project's only
failed NFR, failing both as specified and on the closest measurable equivalent.

No streaming exists in the implementation, so time-to-first-token is not a
quantity the system produces at all. Because nothing streams, the user sees
nothing until the entire response arrives. Implementing streamed responses would
address the requirement directly, and it is the single change most likely to
alter perceived responsiveness, since the underlying model latency is unlikely to
fall on its own.

Whether streaming alone would satisfy the two-second budget is **untested and is
not claimed.** Measuring first-chunk latency against the same model and the same
prompts is a very small piece of work — one API call — that would convert an open
question into an answer, and it should precede any implementation decision rather
than follow it.

### 5.2.5 Extending colour coverage

**Limitation addressed:** all five keycap sets carry colour tags; none of the
seven cases do.

The case records contain no colour information in any product name, description
or vendor URL, and values were deliberately **not** fabricated — inventing them
would have placed unverifiable data underneath one of the report's user-facing
claims. Consequently a case cannot rank up for its colour, and a request for a
themed build can only be satisfied at the keycap level, which is a partial answer
to the very user finding that motivated the feature.

The work is data curation from vendor listings rather than software development,
and it would complete a fix that is currently only half-effective.

### 5.2.6 An expert knowledge grounding layer

**Limitation addressed:** one grounding case fails in every run and every mode,
because it requires practitioner knowledge that catalog specifications do not
contain.

The failing case concerns specific budget recommendations and lubrication
technique — knowledge the domain expert holds but which has no representation in
a product catalog, because it is not a property of any single product. A separate
knowledge layer, distinct from the catalog and retrievable by the assistant,
would close it and extend the system from **specification matching toward genuine
advice.**

This is arguably the most interesting extension, because it tests whether the
grounding architecture generalises beyond structured product data — that is,
whether the central claim of this project holds for knowledge that cannot be put
in a database row.

### 5.2.7 Independent evaluation

**Limitation addressed:** the evaluation ground truth was authored by the
researcher, who is also the domain expert.

Having the test cases reviewed, or independently authored, by domain experts
other than the researcher would address the principal validity threat in this
study. The current suite is grounded in real commercial experience, which is a
genuine strength — but nothing structurally prevents it from encoding the same
assumptions as the system it evaluates, and only an outside author can rule that
out.

### 5.2.8 Catalog scale and retrieval behaviour

**Limitation addressed:** sixty components may not generalise, and semantic
retrieval faces more competing candidates as a catalog grows.

Expansion should be treated as an **experiment rather than a data-entry
exercise**, with the evaluation suite re-run at each increment in scale to detect
the point where retrieval precision begins to degrade. The reduction ratios
reported in Chapter 4 are specific to this catalog's composition and would need
re-measuring at every step.

This also intersects with the maintenance cost Uta et al. (2024) identify in
knowledge-based systems: every new component category risks new rules, and the
rules were hand-written.

### 5.2.9 Constant-time validation

**Limitation addressed:** validation time grows linearly with catalog size,
because the lookup index is rebuilt on every call.

The compatibility rules themselves examine only the six selected components and
are constant-time. The entire linear growth term is index construction. Building
the index once per catalog load, rather than once per validation call, would make
validation effectively constant-time.

At present the catalog would need roughly 3.1 million records before this
breached the latency requirement, so it is **not urgent** — but it is a
well-characterised inefficiency identified by measurement rather than intuition,
and it interacts directly with Section 5.2.8, since scale is exactly what would
make it matter.

### 5.2.10 Completing the community loop

**Limitation addressed:** one-click cloning was not delivered, so the mechanism
CP1 identified as closing the gap between inspiration and purchase is absent.

Chapter 2 establishes observational learning (Wang & Yu, 2017) and social proof
(Al-Adwan et al., 2022) as genuine decision supports, particularly for expensive
purchases where the buyer cannot assess quality in advance. The gallery delivers
the inspiration half of that mechanism.

Cloning a community build into a personal workspace is a small piece of work
relative to its effect on the third objective, and would complete that objective
in full.

## 5.3 Closing remarks

The system delivered is a functional prototype rather than a production platform,
and this report has been explicit throughout about what it does not do. It does
not address sensory verification. It does not currently serve the price segment
it was designed for. Its test suite covers less than its headline figure
suggests.

What it does demonstrate, with measurement rather than assertion, is that **a
generative model can be deployed safely in a domain where physical correctness is
non-negotiable — provided its output is constrained by a deterministic authority
the model cannot influence.**

Three measured results support that claim together:

- the decision-space reduction, from 585,200 combinations to the 3 a user sees;
- the closure of the semantic gap by retrieval, in exactly the two cases keyword
  matching provably cannot resolve;
- and the invariance of the compatibility guarantee across every condition
  tested, before and after the AI layer existed.

The evaluation framework built to test all of this, and the one defect it failed
to catch, are offered as contributions in their own right — the first because it
made the claims falsifiable, and the second because it showed the limits of
making claims from tests alone.
