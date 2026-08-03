# Chapter 5: Conclusion and Future Work

## 5.1 Conclusion

This project set out to determine whether generative AI can be applied safely in
a domain where physical correctness is not optional. Custom mechanical keyboards
were chosen as the test case because a wrong recommendation there leaves the
buyer with parts that cannot be assembled. On the evidence in Chapter 4 the
answer is yes, but only under a specific architectural condition.

### 5.1.1 Achievement of objectives

Objective 1, a logic-driven configurator with a constraint satisfaction engine,
was achieved. The engine checks a complete build across seven rule categories and
eliminates 99.4446% of the 585,200 combinations the catalog allows. Its
correctness rests on three independent forms of evidence: an exhaustive sweep of
every combination, a hand-derived sample agreeing 20 out of 20 on both verdicts
and exact error codes, and conformance runs confirming that every emitted build
re-validates cleanly. The guarantee is structural rather than statistical, since
validation sits inside the recommendation path rather than beside it, so an
unvalidated build has no route to the interface.

Objective 2, a retrieval-augmented system translating sensory intent into
validated specifications, was achieved. The two documented semantic-gap cases,
where the user describes sound in language sharing no vocabulary with the
catalog, were closed by vector retrieval and could not be closed by lexical
means. Colour extraction, added in response to user testing, reached 5 out of 5
in both implementations, and no hallucinated component appeared in any run.

Objective 3, a full-stack application with social commerce features, was
substantially achieved. Accounts, saved builds, publishing and a threaded
community gallery with in-context assistant replies were delivered. One-click
cloning was not, so the social proof mechanism is present while the frictionless
path from inspiration to purchase is absent.

### 5.1.2 Principal findings

The two mechanisms proved complementary rather than competing, and it is now
possible to state precisely where each earns its place. Every improvement
recorded came from better interpretation and retrieval, and none from relaxing
validation. The rule engine rejected every incompatible configuration under every
condition tested, and its behaviour is identical before and after the AI layer
was introduced, because the AI was never granted authority to loosen a constraint
in exchange for accuracy.

More surprising is where the AI's contribution lies. A deterministic keyword
extractor, using no model, API or network, reached parity with the language model
on all thirty intent extraction cases. The gain of the full generative stack over
that floor is four cases against one lost to non-determinism, and those four
divide into two kinds. Two are semantic-gap cases. The other two depend on
practitioner knowledge supplied to the language model but never to the
deterministic path. The language model therefore earns its place not by being
generally superior, but by handling two classes of input that rules cannot
express: language the catalog has no vocabulary for, and advice no product
specification contains.

Grounding sharpens the point. It did not improve under the full stack, which is
the desired outcome, because it is enforced by retrieval and validation rather
than by model capability. Its stability across conditions is direct evidence that
the mechanism rather than the model is doing the work, and the relationship even
inverted, with the deterministic path proving more reliably constraint-compliant
than the model. This is the practical form of the neuro-symbolic argument
developed in Chapter 2 from Huang et al. (2025) and Pradier et al. (2021): the
language model widens the space of requests the system can understand, while the
rule engine narrows the space of answers it may give. Neither alone is
sufficient, and the value lies in the constraint between them.

A second contribution is methodological. Encoding practitioner expertise as an
executable evaluation suite converted a subjective question into a measurable one
and made design decisions defensible with evidence rather than assertion,
including the decision to remove a proposed feature and the decision to report an
AI contribution smaller than the project's framing would have preferred. It also
quantified the choice-overload claim Chapter 1 could only assert, and revealed
that no valid build falls within the stated target market.

The framework's most instructive moment, however, was a failure it did not catch.
The colour defect described in Section 4.5.2 passed every unit test, every
evaluation case and a direct functional probe while being inert in the running
application, because the tests and the deployed system read different data
sources. Verification is therefore only meaningful in the configuration that
actually runs. For a project whose central claim concerns deterministic
guarantees, this is a necessary corrective: a guarantee holds only where the
guaranteeing component can see the data it requires.

### 5.1.3 Methodological reflection

Design Science Research proved appropriate not because the design was correct
from the outset but because it was not. Three cycles are documented: removing the
2D visual builder on evaluation evidence at the mid-point, the user-testing cycle
that produced four remediated findings, and the realignment of the builder's
recommendations to the stocked catalog. The second produced an uncomfortable
result, in that testers independently identified reduced visual richness as their
most common criticism, corroborating that the first cycle's decision carried a
genuine cost. Both were correct on the evidence available at the time, and they
point in opposite directions. Reporting that as a limitation rather than a
vindication is the more honest reading, and it is the kind of finding a
single-pass process would not have produced.

## 5.2 Future work

Each item below is stated against the specific limitation in Section 4.10 that
motivates it, ordered by value to the project's stated aims rather than by ease
of implementation.

| # | Item | Limitation addressed | Nature of work |
|---|---|---|---|
| 1 | Acoustic library | Sensory feedback is the one CP1 gap left unclosed | Data collection |
| 2 | Resolving the target-market contradiction | No valid build exists below RM281 against a RM150–250 target | Vendor survey |
| 3 | Restoring unit test coverage | 42 of 257 tests skipped; three rule categories untested | Fixture rewriting |
| 4 | Streamed responses | The only failed non-functional requirement; whether streaming alone would meet the budget is untested and not claimed | Implementation |
| 5 | Extending colour coverage | Zero of seven cases carry colour tags | Data curation |
| 6 | Expert knowledge on the deterministic path | Practitioner advice reaches the language model only, so the fallback path cannot give advice when the AI service is unavailable | Architecture |
| 7 | Independent evaluation | Ground truth authored by the researcher | External review |
| 8 | Catalog scale experiments | Sixty components may not generalise | Measurement |
| 9 | Constant-time validation | Validation scales linearly with catalog size | Optimisation |
| 10 | Completing the community loop | One-click cloning not delivered | Implementation |

Table 5.1: Future work, ordered by value to the project's stated aims

### 5.2.1 Sensory verification through an acoustic library

This is the highest-priority item and the most significant proposed feature not
delivered. The data model already anticipates it, with a sound-samples table and
a per-component sound URL field both present and unpopulated, so the outstanding
work is data collection rather than architecture. Implementation requires switch
samples recorded under controlled, consistent conditions, which is the constraint
that deferred it, plus a comparison interface. The competitive audit in Section
4.7 shows this dimension is unaddressed by every competitor reviewed, so closing
it would restore the differentiation CP1 claimed and address the need for
pre-purchase sensory verification identified by Zheng and Bensebaa (2022).

### 5.2.2 Resolving the target-market contradiction

Two explanations fit the evidence and cannot be distinguished: either the catalog
under-samples the budget segment, which has an obvious remedy, or a complete
build from separately purchased components does not exist below approximately
RM280 in this market, which would invalidate an assumption carried from the
proposal. Distinguishing them requires a vendor survey of the sub-RM280 segment,
checking whether cheaper cases, PCBs and plates exist from Malaysian vendors and
were simply not curated in. This should precede any expansion of the catalog,
because the answer determines whether expansion is a genuine fix or the same
problem at greater scale.

## 5.3 Closing remarks

The system delivered is a functional prototype rather than a production platform,
and this report has been explicit about what it does not do. It does not address
sensory verification, it does not serve the price segment it was designed for,
and its test suite covers less than its headline figure suggests.

What it does demonstrate, through measurement rather than assertion, is that a
generative model can be deployed safely in a domain where physical correctness is
non-negotiable, provided its output is constrained by a deterministic authority
the model cannot influence. Three measured results support that claim: the
reduction from 585,200 combinations to the three a user is shown, the closure of
the semantic gap by retrieval in exactly the cases lexical matching provably
cannot resolve, and the invariance of the compatibility guarantee across every
condition tested. The evaluation framework built to test these claims, and the
defect it failed to catch, are offered as contributions in their own right.
