# Chapter 5: Conclusion and Future Work

## 5.1 Conclusion

This project set out to answer one main question. Can generative AI be used
safely in a situation where being physically correct is not optional? Custom
mechanical keyboards were chosen as the test case for a specific reason. A wrong
recommendation here is not simply unhelpful, as it leaves the buyer with a set of
parts that cannot be assembled and money that is difficult to recover. Based on
the evidence presented in Chapter 4, the answer is yes, but only when a specific
architecture is followed. The nature of that architecture turned out to be more
interesting than expected.

### 5.1.1 Achievement of objectives

The first objective was to build a configurator driven by logic that prevents
users from selecting parts which cannot work together. This objective was
achieved. The rule engine checks a complete build across seven categories and
removes 99.4446% of the 585,200 possible combinations that the catalog allows.
Its correctness was established in three separate ways, which were the exhaustive
sweep, the hand-checked sample that agreed 20 out of 20, and the conformance runs
confirming that every build reaching a user passes validation again. The most
important point here is that this guarantee is structural rather than
statistical. Validation sits inside the recommendation process rather than beside
it, which means there is simply no route for an unchecked build to reach the
user.

The second objective was to build a recommendation system that translates the way
people naturally describe sound into technical specifications that actually work.
This objective was also achieved, although the result was more nuanced than
expected. The two documented cases where a user describes sound using words that
do not appear anywhere in the catalog were both solved by meaning-based
retrieval, and neither could be solved by keyword matching. Colour extraction,
which was added in response to user testing, reached 5 out of 5 in both the AI
and the rule-based versions. Throughout every test run, the system never invented
a component that does not exist.

The third objective was to develop a full web application with social commerce
features. This objective was substantially achieved. Accounts, saved builds,
publishing and a community gallery with AI replies were all delivered
successfully. The ability to copy another user's build in a single click was not
delivered, which means the social proof mechanism is present but the easy path
from seeing a build to owning one is still missing.

### 5.1.2 Principal findings

The most important result of this project is that the two mechanisms turned out
to work together rather than compete with each other. It is now also possible to
state exactly where each one earns its place. Every improvement recorded during
this project came from better interpretation and retrieval, and none of it came
from relaxing the validation rules. The rule engine rejected every incompatible
configuration in every condition tested, and its behaviour is identical before
and after the AI layer was introduced. This is because the AI was never given the
authority to loosen a rule in exchange for a better result.

What was more surprising is where the contribution of the AI actually lies. A
carefully written keyword program, which uses no AI model and no internet
connection at all, matched the language model on all thirty intent extraction
cases. This shows that budgets, keyboard sizes, intended uses and stated
preferences can all be identified using ordinary rules. The genuine gain from the
full AI system is four cases, against one lost to the AI answering differently
between runs. Those four cases fall into two different groups. Two of them are
cases where the user describes sound in words the catalog does not contain. The
other two depend on the builder's own selling experience, which is supplied to
the AI model but never to the rule-based path. In other words, the language model
earns its place not by being better in general, but by handling two specific
kinds of request that rules cannot express, which are language the catalog has no
vocabulary for and advice that no product specification contains.

The grounding results make this point even clearer. Grounding did not improve
when the AI was switched on, and this is the outcome that was wanted rather than
a disappointment. Grounding is enforced by the retrieval step and by the rule
engine, not by how capable the AI model is, so a stronger model should not change
it. The fact that it stays steady in every condition is direct evidence that the
design of the system is doing the work rather than the AI. The relationship even
reversed at one point, as the rule-based path followed the rules more reliably
than the AI model did. This is the practical form of the neuro-symbolic argument
developed in Chapter 2 from Huang et al. (2025) and Pradier et al. (2021). The
language model widens the range of requests the system is able to understand,
while the rule engine narrows the range of answers it is allowed to give. Neither
component would be sufficient on its own, and the real value lies in the
constraint between them.

A second contribution of this project is methodological. Writing the builder's
expertise into an evaluation suite that can actually be run converted a
subjective question into a measurable one. It also made design decisions
defensible with evidence instead of opinion, including two decisions that were
uncomfortable to report. The first was removing a feature that had been promised,
and the second was reporting an AI contribution smaller than the project would
have preferred. The same framework also produced findings that were never
planned, as it measured the choice overload problem that Chapter 1 could only
describe, and revealed that no valid build falls inside the stated target market.

However, the most useful moment came from a failure the framework did not catch.
A change passed every unit test, every evaluation case and a direct functional
check, and yet did absolutely nothing in the running application. The reason was
that the tests and the live system were reading from two different data sources.
Every test was correct, and every test was also checking a system that was not
the one actually running. What this means is that verification only carries
meaning in the configuration that genuinely runs. For a project whose central
claim is about deterministic guarantees, this is an important correction, because
a guarantee only holds where the component providing it can actually see the data
it needs.

### 5.1.3 Methodological reflection

Design Science Research proved to be the right choice for this project, not
because the design was correct from the start, but precisely because it was not.
Three cycles are documented in this report. The first was removing the proposed
2D visual builder based on evaluation evidence at the midpoint. The second was
the user testing cycle that produced four findings and their fixes. The third was
realigning the builder's recommendations to the parts actually stocked in the
catalog.

The second cycle produced an uncomfortable result, as the testers independently
identified reduced visual richness as their most common criticism. This directly
confirmed that the decision made in the first cycle carried a genuine cost. Both
cycles were correct based on the evidence available at the time, yet they point
in opposite directions. Reporting this as a limitation rather than as a
justification is the more honest reading, and it is exactly the kind of finding
that a single-pass development process would never have produced.

## 5.2 Future work

Each item below is stated against the specific limitation in Section 4.10 that
motivates it. They are ordered by how much value they would add to the project's
stated aims rather than by how easy they would be to implement.

| # | Item | Limitation it addresses | Type of work |
|---|---|---|---|
| 1 | Acoustic library | Sensory feedback is the one CP1 gap left unclosed | Data collection |
| 2 | Resolving the target market contradiction | No valid build exists below RM281 against a RM150–250 target | Vendor survey |
| 3 | Restoring unit test coverage | 42 of 257 tests are switched off and three rule categories are untested | Rewriting tests |
| 4 | Displaying answers gradually | The only failed non-functional requirement | Implementation |
| 5 | Extending colour coverage | None of the seven cases carry colour tags | Data curation |
| 6 | Expert knowledge on the rule-based path | Practitioner advice reaches the AI model only, so offline answers cannot use it | Architecture |
| 7 | Independent evaluation | The test cases were written by the researcher | External review |
| 8 | Catalog scale experiments | Sixty components may not represent a larger catalog | Measurement |
| 9 | Constant-time validation | Validation slows down as the catalog grows | Optimisation |
| 10 | Completing the community loop | One-click copying was not delivered | Implementation |

Table 5.1: Future work, ordered by value to the project's stated aims

The first two items are the most important and are explained below. Two of the
remaining items are worth a brief note. Item 4 concerns whether displaying the
answer gradually would bring the response under two seconds, which is likely but
was never tested and is therefore not claimed here. Item 6 concerns the builder's
expertise, which is currently attached only to the AI prompt. This means that
when the AI service is unavailable, the system falls back to a path that cannot
give opinionated advice at all, which matters because Section 4.6 identifies
graceful degradation as a stated requirement.

### 5.2.1 Sensory verification through an acoustic library

This is the highest priority item and the most significant proposed feature that
was not delivered. The database already anticipates it, as a sound samples table
and a sound URL field both exist and are simply left empty, so the outstanding
work is data collection rather than architecture. Implementing it would require
recording switch samples under controlled and consistent conditions, which is
exactly the constraint that caused it to be deferred, together with an interface
for comparing sounds side by side. The competitive audit in Section 4.7 shows
that no competitor reviewed addresses this dimension either. Closing it would
therefore restore the differentiation claimed in CP1, while addressing the need
for sensory verification before purchase that Zheng and Bensebaa (2022) identify.

### 5.2.2 Resolving the target market contradiction

Two explanations both fit the evidence and cannot currently be told apart. The
first is that the catalog does not include enough cheap components, which would
be a curation problem with a straightforward fix. The second is that a complete
build made from separately purchased parts genuinely cannot be assembled below
approximately RM280 in this market, which would mean an assumption carried
forward from the proposal was wrong from the start.

Telling them apart requires a survey of vendors selling below RM280, checking
whether cheaper cases, PCBs and plates exist in Malaysia and were simply not
included in the catalog. This should be carried out before the catalog is
expanded for any other reason, because the answer determines whether expanding it
is a genuine fix or simply the same problem at a larger scale.

## 5.3 Closing remarks

The system delivered by this project is a working prototype rather than a
production platform, and this report has been explicit about what it does not do.
It does not address sensory verification, it does not currently serve the price
segment it was designed for, and its test suite covers less than the headline
figure suggests.

What it does demonstrate, through measurement rather than assertion, is that a
generative model can be deployed safely in a domain where physical correctness is
not negotiable. The condition for this is that its output must be constrained by
a deterministic authority that the model cannot influence. Three measured results
support this claim together. The first is the reduction of the decision space
from 585,200 combinations down to the three shown to a user. The second is the
closure of the semantic gap by retrieval, in exactly the cases that keyword
matching provably cannot solve. The third is that the compatibility guarantee
remained unchanged in every condition tested, both before and after the AI layer
existed. Finally, the evaluation framework built to test these claims, along with
the defect it failed to catch, are offered as contributions in their own right.
