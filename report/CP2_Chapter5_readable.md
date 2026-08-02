# Chapter 5: Conclusion and Future Work

## 5.1 Conclusion

This project set out to determine whether generative artificial intelligence can
be applied safely in a domain where physical correctness is not optional. Custom
mechanical keyboards were selected as the test case because an incorrect
recommendation there is not merely unhelpful; it produces a set of parts that
cannot be assembled and money that cannot easily be recovered. On the evidence
presented in Chapter 4 the answer is that it can, but only under a specific
architectural condition, and the nature of that condition proved more interesting
than anticipated.

### 5.1.1 Achievement of objectives

Objective 1, a logic-driven configurator with a constraint satisfaction engine,
was achieved. The delivered engine checks a complete build across seven rule
categories and eliminates 99.4446% of the 585,200 combinations this catalog
admits. Its correctness rests on three independent forms of evidence: an
exhaustive sweep of every possible combination, a hand-derived sample of twenty
cases agreeing 20 out of 20 on both verdicts and exact error codes, and
conformance runs confirming that every build the system produces re-validates
cleanly. The most important property, however, is that the guarantee is
structural rather than statistical. Validation does not sit beside the
recommendation path as an optional check; it sits inside it, so an unvalidated
build has no route to the user interface at all.

Objective 2, a retrieval-augmented system translating sensory intent, was
achieved, though the result is more nuanced than anticipated. The two documented
semantic-gap cases, in which a user describes sound using language sharing no
vocabulary with the catalog, were closed by meaning-based retrieval and could not
be closed by keyword matching. Colour extraction, added in response to user
testing, reached 5 out of 5 in both the language-model and the rule-based
implementations, and no invented component appeared in any grounding run under any
condition at any point during the project.

Objective 3, a full-stack application with social commerce features, was
substantially achieved. Accounts, saved builds, publishing and a threaded
community gallery with in-context assistant replies were delivered, while
one-click cloning of another user's build was not, so the social proof mechanism
is present while the frictionless path from inspiration to purchase remains
absent.

### 5.1.2 Principal findings

The most important result is that the two mechanisms proved complementary rather
than competing, and that it is now possible to state precisely where each earns
its place. Every improvement recorded came from better interpretation and
retrieval, and none from relaxing validation. The rule engine rejected every
incompatible configuration under every condition tested, and its behaviour is
identical before and after the AI layer was introduced, because the AI was never
granted authority to loosen a constraint in exchange for accuracy.

More surprising is where the AI's contribution lies. A carefully written keyword
extractor, using no model, API or network, reached parity with the language model
on all thirty intent extraction cases, demonstrating that explicit budgets, layout
sizes, use cases and stated preferences are entirely recoverable by rules. The
gain of the full generative stack over that deterministic floor is four cases,
against one lost to model non-determinism.

Those four divide into two distinct kinds, and the division matters. Two are the
semantic-gap cases, where the user describes sound in words the catalog does not
contain and only meaning-based retrieval can resolve the request. The other two
depend on the builder's own practitioner knowledge, which is supplied to the
language model but never to the deterministic path, so only the generative route
can deliver it. The language model therefore earns its place not by being
generally superior, but by handling two specific classes of input that rules
cannot express: language the catalog has no vocabulary for, and advice no product
specification contains. That is a narrower claim than the project's own framing
would have preferred, and worth more, because it is specific enough to be tested
and survived testing.

Grounding sharpens the point. It did not improve under the full stack, which is
the desired outcome, because it is enforced by retrieval and validation rather
than model capability. Its stability across every condition is direct evidence
that the mechanism rather than the model is doing the work, and the relationship
even inverted, with the rule-based path proving more reliably constraint-compliant
than the model. This is the practical form of the neuro-symbolic argument
developed in Chapter 2 from Huang et al. (2025) and Pradier et al. (2021): the
language model widens the space of requests the system can understand, while the
rule engine narrows the space of answers it may give. Neither alone is sufficient,
since a rule engine cannot interpret "buttery smooth" and a language model cannot
be trusted to guarantee that a build assembles, and the value lies specifically in
the constraint between them.

A second contribution is methodological. Encoding practitioner expertise as an
executable evaluation suite converted a subjective question into a measurable one
and made design decisions defensible with evidence rather than assertion,
including two uncomfortable ones: removing a proposed feature, and reporting an AI
contribution smaller than the project's framing would have liked. The framework
also produced findings the project never sought. It quantified the choice-overload
claim Chapter 1 could only assert; it revealed that no valid build falls within
the stated target market, contradicting a positioning assumption from the
proposal; and it surfaced a defect no test could have caught.

That defect, described in Section 4.5.2, produced the lesson which generalises
furthest. A change passed every unit test, every evaluation case and a direct
functional probe while being completely inert in the running application, because
the tests and the deployed system read different data sources. Every test was
correct, and every test was also testing a system that was not the one running.
The conclusion is that verification is only meaningful in the configuration that
actually runs. For a project whose central claim concerns deterministic
guarantees this is a necessary corrective: a guarantee holds only where the
guaranteeing component can see the data it requires.

### 5.1.3 Methodological reflection

Design Science Research proved appropriate not because the design was correct from
the outset but precisely because it was not. Two complete cycles are documented:
the removal of the proposed 2D visual builder at the project mid-point, decided on
evaluation evidence rather than preference, and the user-testing cycle that
produced four remediated findings.

The second cycle produced an uncomfortable result, in that testers independently
identified reduced visual richness as their most common criticism, directly
corroborating that the first cycle's decision carried a genuine cost. Both cycles
were correct on the evidence available at the time, and they point in opposite
directions. Reporting this as a limitation rather than a vindication is the more
honest reading, and it is exactly the kind of finding a single-pass development
process would never have produced, because there would have been no second
measurement to contradict the first.

## 5.2 Future work

Each item below is stated against the specific limitation in Section 4.10 that
motivates it, ordered by value to the project's stated aims rather than by ease of
implementation. The three highest-priority items are expanded following the table.

| # | Item | Limitation addressed | Nature of work |
|---|---|---|---|
| 1 | Acoustic library | Sensory feedback is the one CP1 gap left unclosed | Data collection |
| 2 | Resolving the target-market contradiction | No valid build exists below RM281 against a RM150–250 target | Vendor survey |
| 3 | Restoring unit test coverage | 42 of 257 tests skipped; three rule categories untested | Fixture rewriting |
| 4 | Streamed responses | The only failed non-functional requirement | Implementation |
| 5 | Extending colour coverage | Zero of seven cases carry colour tags | Data curation |
| 6 | Expert knowledge on the deterministic path | Practitioner advice reaches the language model only, so offline answers cannot use it | Architecture |
| 7 | Independent evaluation | Ground truth authored by the researcher | External review |
| 8 | Catalog scale experiments | Sixty components may not generalise | Measurement |
| 9 | Constant-time validation | Validation scales linearly with catalog size | Optimisation |
| 10 | Completing the community loop | One-click cloning not delivered | Implementation |

Table 5.1: Future work, ordered by value to the project's stated aims

Items 4 to 10 are fully specified by the table above and are not expanded further,
save for two clarifications. Regarding item 4, whether streaming alone would
satisfy the two-second budget is untested and is not claimed; measuring
first-chunk latency against the same model and prompts is a very small piece of
work that would convert an open question into an answer and should precede any
implementation decision. Regarding item 6, the builder's practitioner knowledge
is attached only to the language model's prompt, so when the AI service is
unavailable the system falls back to a path that cannot give opinionated advice
at all. Making that knowledge available to the deterministic path would close the
two cases that currently fail offline and would make the fallback mode
substantially more useful, which matters because Section 4.6 identifies graceful
degradation as a stated requirement.

### 5.2.1 Sensory verification through an acoustic library

This is the highest-priority item and the most significant proposed feature not
delivered. The data model already anticipates it, since a sound-samples table and
a per-component sound URL field both exist in the schema entirely unpopulated, so
the outstanding work is data collection rather than architecture. Implementation
requires switch samples recorded under controlled and consistent conditions, which
is precisely the constraint that deferred it, together with a side-by-side
comparison interface.

The competitive audit in Section 4.7 shows this dimension is unaddressed by every
competitor reviewed, so closing it would restore the differentiation CP1 claimed
while addressing the need for pre-purchase sensory verification identified by
Zheng and Bensebaa (2022).

### 5.2.2 Resolving the target-market contradiction

Two explanations fit the evidence and cannot currently be distinguished: either
the catalog under-samples the budget segment, or a complete build assembled from
separately purchased components genuinely does not exist below approximately
RM280 in this market. The first is a curation problem with an obvious remedy,
while the second invalidates an assumption carried forward from the proposal and
would require the target band to be restated.

Distinguishing between them requires a vendor survey of the sub-RM280 segment,
checking whether cheaper cases, PCBs and plates exist from Malaysian vendors and
were simply not curated in. This should be undertaken before the catalog is
expanded for any other reason, because the answer determines whether expansion
constitutes a genuine fix or merely reproduces the same problem at greater scale.

### 5.2.3 Restoring unit test coverage

The skipped tests are verified in substance by the exhaustive sweep, the
independent hand-check and the conformance runs, so the system is not unverified.
The unit suite nevertheless does not cover what its headline figure implies, and
that gap should not persist into any future work on this codebase.

The tests were disabled when the catalog was replaced and are pinned to component
identifiers that no longer exist, so restoration is mechanical rather than
conceptual: valid component identifiers for every scenario already exist in the
benchmark output committed with this project. This also interacts with item 8,
since the maintenance cost of hand-written rules identified by Uta et al. (2024)
grows with every component category added.

## 5.3 Closing remarks

The system delivered is a functional prototype rather than a production platform,
and this report has been explicit throughout about what it does not do. It does
not address sensory verification, it does not currently serve the price segment it
was designed for, and its test suite covers less than its headline figure
suggests.

What it does demonstrate, through measurement rather than assertion, is that a
generative model can be deployed safely in a domain where physical correctness is
non-negotiable, provided its output is constrained by a deterministic authority
the model cannot influence. Three measured results support that claim together:
the decision-space reduction from 585,200 combinations to the three a user is
shown; the closure of the semantic gap by retrieval, in exactly the two cases
keyword matching provably cannot resolve; and the invariance of the compatibility
guarantee across every condition tested, before and after the AI layer existed.

The evaluation framework built to test these claims, and the single defect it
failed to catch, are offered as contributions in their own right: the first
because it made the claims falsifiable, and the second because it demonstrated the
limits of drawing conclusions from tests alone.
