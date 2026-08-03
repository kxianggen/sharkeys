# Chapter 4: Results and Discussion

This chapter reports what the finished system does, measured rather than asserted.
Every figure can be reproduced by running a script committed with the project, and
the commands are listed in Appendix A. Where a claim rests on reasoning rather
than measurement, it is identified as such.

Two kinds of number appear throughout. Counting figures, such as combination
totals and pass counts, come from evaluating every case exhaustively and are
quoted at full precision. Timing figures vary slightly between runs, so they are
quoted as a typical value with the observed range. No claim here depends on a
worst-case timing, because at the scale being measured a single housekeeping pause
inside the programming language exceeds the operation being timed, and the
worst-case figure swung by a factor of 2.8 between two runs of identical code.

## 4.1 The delivered system

Sharkeys is a working web application of nine pages and nine internal data
endpoints, built from 110 TypeScript source files and backed by a catalog of 60
components.

| Page | Function |
|---|---|
| `/` | Landing page with a prompt box and an animated configurator demonstration |
| `/configurator` | Main workspace: describe a keyboard in plain English, or select parts manually and have them validated |
| `/browse` | Catalog browsing by category |
| `/my-builds` | Saved builds, persisted to the user's account |
| `/community-gallery` | Community posts in a discussion feed, with in-context assistant replies |
| `/login`, `/signup` | Account creation and authentication |

Table 4.1: Application routes and their functions

The catalog holds 19 plates, 11 stabilisers, 10 switches, 8 PCBs, 7 cases and 5
keycap sets. Every record was verified as purchasable in Malaysia and priced in
ringgit from a real vendor listing, a curation decision that becomes significant
in Section 4.8.

Code quality is enforced by a single command running type checking, linting, the
automated tests and a production build in sequence, failing the whole process if
any stage fails. At submission this passes with 37 test files and 215 passing
tests. Section 4.10 qualifies what those tests do not cover.

## 4.2 The compatibility engine

Objective 1 required a configurator preventing the selection of parts that cannot
work together. The delivered engine is a 713-line module which checks a complete
set of six chosen parts against seven rule categories: layout, preferred layout,
mount style, kit structural integrity, switch fitment, keycap fitment and
stabiliser fitment. It separately produces advisory warnings, describing
combinations that work but that the user may not want, which never block a build.

The engine never stops early. Even after finding a problem it runs every remaining
check and collects all problems together, so a rejected build costs approximately
the same as an accepted one. There is no shortcut for invalid builds, which means
the timings in Section 4.6 are not flattered by easy rejections.

This is the knowledge-based recommender approach described by Felfernig and Burke
(2008) and Uta et al. (2024), in which rules are written by someone with domain
knowledge and applied deterministically rather than inferred from user behaviour.
Uta et al. note that such systems are accurate but expensive to maintain, since a
human must encode every rule. That trade-off is visible here, as the rules were
hand-written from the researcher's market experience, and Section 5.2 identifies
it as the constraint on growing the catalog.

### 4.2.1 Decision-space reduction

The catalog's 7 cases, 8 PCBs, 19 plates, 10 switches, 5 keycap sets and 11
stabilisers multiply to 585,200 possible keyboards. All were evaluated through the
real engine in 3.1 seconds. This was exhaustive rather than sampled, so the
figures carry no sampling uncertainty.

Only 3,250 combinations are valid. The engine eliminates 99.4446% of the decision
space: of every 180 keyboards a user could assemble, 179 would fail and one would
work.

| Rules applied so far | Combinations remaining | % of total |
|---|---:|---:|
| None — every possibility | 585,200 | 100% |
| After layout compatibility | 45,650 | 7.80% |
| After mount compatibility | 27,500 | 4.70% |
| After kit structural integrity | 11,300 | 1.93% |
| After switch, keycap and stabiliser fitment | 3,250 | 0.5554% |

Table 4.2: Sequential reduction of the decision space by rule layer

That ordering is analytical rather than something the engine performs, since it
applies all rules simultaneously. Because the rules overlap, whichever is listed
first receives credit for every rejection it shares with those below it. Each rule
was therefore also tested independently.

| Rule, applied alone | Combinations rejected | % of 585,200 |
|---|---:|---:|
| Layout compatibility | 539,550 | 92.20% |
| Kit structural integrity | 505,500 | 86.38% |
| Mount compatibility | 339,900 | 58.08% |
| Stabiliser compatibility | 296,700 | 50.70% |
| Switch compatibility | 170,170 | 29.08% |
| Keycap compatibility | 0 | 0.00% |

Table 4.3: Independent rejection rate of each rule against the full space

These independent rejections sum to 1,851,820, or 316% of the space. That is
overlap rather than error, since most invalid combinations break several rules at
once and are counted more than once. The engine's combined rejection is 581,950,
and the difference of 1,269,870 is that double-counting.

Reading the two tables together is instructive. Sequentially, kit integrity looks
like a minor third-stage filter reducing 27,500 to 11,300; independently it
rejects 86.38%, second only to layout. It appears small only because layout and
mount have already removed most of what it would have caught. Presenting only the
first table would have substantially understated one of the system's most
important rules.

### 4.2.2 Physical and commercial constraints

An important distinction exists within that 99.4446%. Some combinations are
rejected because the parts genuinely do not fit. The kit integrity rule rejects
for a different reason: cases, PCBs, plates and stabilisers sold bundled as a kit
are not available separately, so a build mixing one kit's case with another's PCB
may assemble perfectly while remaining impossible to purchase.

Disabling the kit rule and applying only physical rules leaves 6,130 combinations,
or 1.05%. Reinstating it removes a further 2,880. This means 47.0% of physically
buildable combinations are rejected for commercial rather than physical reasons,
and a reader who assumes the whole 99.4446% represents physical impossibility has
been misled.

The finding generalises: a constraint-based configuration system must model how
products are sold, not only how they fit. The rule came from the researcher's
market knowledge rather than any specification, and without it the system produced
builds that were technically perfect and impossible to buy, a failure that would
only have surfaced at checkout.

### 4.2.3 Verification of engine correctness

Engine correctness is established three ways, none of which is the unit test suite,
for reasons Section 4.10 explains.

The first is the exhaustive sweep already described. It also revealed something
unsought: two implemented rules, preventing a switch technology mismatch with
keycaps and a keycap layout mismatch, fired zero times across the entire space.
They are not defective. All five keycap sets happen to support all five layouts
and both switch technologies present, so no combination in this data can trigger
them. The rules are correct but unreachable with this catalog, recorded as a
limitation in Section 4.10.

The second is an independent hand-verified sample. Twenty combinations were
selected by a fixed, reproducible stride, and for each the expected verdict and
exact error codes were derived by hand from raw component data before consulting
the engine. Agreement was 20 out of 20 on both verdicts and error codes. This is
the only genuinely external check available, because the sweep uses the engine
itself to define incompatibility; confirming that the engine agrees with the
engine would return complete agreement by construction and prove nothing.

The third is pipeline conformance. Every build handed to a user was re-validated
and every component looked up in the catalog. Across 8 prompts, 18 builds were
produced, all valid, every component resolving, reproduced identically across 7
runs on two architectures. This asks not whether the engine is correct but whether
a build can reach the user without passing through it. It cannot, because
validation sits inside the recommendation path rather than beside it, making the
guarantee structural rather than statistical.

## 4.3 The decision-space reduction chain

Chapter 1 argued that buyers are paralysed by excessive choice. This section
converts that argument into a measurement, which requires both halves of the
system: the engine reduces what is possible, the ranking reduces what is shown.

Eight fixed prompts spanning the CP1 personas were run in deterministic mode,
covering budget-led, sound-led, use-case-led and layout-led requests plus one
deliberately vague enquiry. The system returns an average of 2.25 builds per
prompt, ranging from zero to three against a maximum of three, reproduced
byte-for-byte across seven runs on two architectures.

```
585,200   possible combinations
  3,250   survive the rule engine       (99.4446% removed)
      3   are shown to the user         (99.91% of the remainder removed)
```

The overall reduction is from 585,200 combinations to 3, or 99.9995%. This is the
empirical form of the problem CP1 could only assert, and Chapter 2 explains why it
matters. Scheibehenne, Greifeneder and Todd (2010) found choice overload appears
most reliably when a decision is complex and the chooser lacks domain expertise,
while Chernev (2003) adds that the effect depends on whether the chooser holds a
clear ideal point. A beginner buying a first custom keyboard has neither, and
585,200 options is precisely the condition that literature predicts will end in
paralysis.

Reporting both stages is stronger than either alone, since the engine by itself
still leaves 3,250 valid builds, far beyond what any person can compare. This
addresses the failure Mandal, Tunkelang and Wu (2023) identify, in which filtering
tools return either nothing or an unmanageable list. Two of the eight prompts
returned zero builds, which appears to be a defect and is not one; Section 4.8
explains why.

## 4.4 The AI layer

Objective 2 required a retrieval-augmented system translating sensory language
into validated specifications. Measuring this required an evaluation suite,
because whether a recommendation is good is otherwise a matter of opinion.

The suite holds 50 cases in three groups: 30 on intent extraction, assessing
whether the system understood the request; 10 on assistant grounding, assessing
whether it confined itself to catalog facts rather than inventing them; and 10 on
retrieval, assessing whether it found appropriate parts. The expected answers
encode the researcher's expertise from over 150 completed keyboard sales in
Malaysia.

Each suite runs in two modes. Offline mode uses no API key and no network,
extracting intent through a local keyword-matching program. Semantic mode uses the
full system, with the language model performing extraction and pgvector performing
meaning-based search. Comparing the two isolates what the AI contributes, which is
the only way to answer Objective 2 with evidence rather than assertion.

### 4.4.1 Baseline and full-stack comparison

| Suite | Offline (rules only) | Semantic (full stack, 3 runs) |
|---|---|---|
| Intent extraction (30) | 30 pass | 30 / 30 / 30 |
| Assistant grounding (10) | 8 pass, 2 fail | 7 / 8 / 8 |
| Retrieval (10) | 6 pass, 2 expected-fail, 2 pending | 8 / 8 / 8 |
| Total | 44 | 45 / 46 / 46 |

Table 4.4: Evaluation results at commit 4f019d3, across the original 50 cases

An earlier evaluation dated 13 June reported 34 offline and 46 semantic, and is
superseded. Commit 7192a73 substantially improved the keyword fallback between the
two measurements, so those runs measure different code rather than the same code
performing differently.

The most significant result was not the expected one: the keyword program matches
the language model on all 30 intent extraction cases. Budgets, layout sizes, use
cases and stated sound preferences all prove fully recoverable by deterministic
rules, and the language model adds nothing on any of them.

This narrows the AI contribution considerably, and it is stated plainly rather
than concealed behind a more flattering total. At this point in the project the
reproducible gain of the full generative stack over a well-written deterministic
fallback was exactly two cases, both of them semantic-gap cases. That figure
later changed, for reasons Section 4.5.4 documents, but the finding it supports
did not: a vague claim that artificial intelligence improved the system would
have been easier to write and impossible to defend.

### 4.4.2 Semantic gap closure and grounding stability

Two retrieval cases were written from the outset as expected failures, included
deliberately because they represent the semantic gap defined in Chapter 1. In
both, the user describes sound as enthusiasts genuinely do, using phrases such as
"buttery smooth" and "deep thud". Neither shares a word with anything in the
catalog, which stores materials, mount types and actuation forces, so keyword
search cannot resolve them by construction rather than through weak
implementation.

Both moved from failing to passing once pgvector embeddings were generated, with
"buttery smooth" retrieving creamy linear switches and "deep thud" retrieving
thocky components, and both pass in every semantic run recorded. This is the most
direct empirical answer to the research question, showing simultaneously that the
semantic gap is real and measurable, that word matching cannot close it, and that
meaning-based retrieval can, while the rule engine continues to guarantee that
whatever is retrieved forms a valid build. Mandal, Tunkelang and Wu (2023)
identify semantic equivalence as the central failure of keyword matching, and
Lewis et al. (2020) establish retrieval-augmented generation as the mechanism for
grounding a model in external facts. What this project adds is a measured
demonstration that the two are complementary rather than competing: retrieval
widens the range of requests the system understands, while validation narrows the
answers to correct ones in a way a generative model cannot be trusted to do.

The grounding suite behaves differently from the other two, and that difference
is itself a result. Offline it scores a steady 8 out of 10, failing the same two
cases every time. Under the full stack the score varied between runs, and at this
stage of the project two cases failed persistently. Both concerned advice drawn
from the researcher's own commercial experience rather than from product
specifications, and Section 4.5.4 shows that the cause was not the language model
at all.

One methodological conclusion follows regardless of that cause. Because the score
in AI mode can move without any change being made to the system, a difference of
one or two cases between runs carries no meaning on its own. Only the
deterministic mode, which reproduces exactly, gives a trustworthy signal that
something has genuinely improved or broken. Every AI-mode figure in this chapter
is therefore reported as a mean with the range observed across several runs,
never as a single result.

Grounding not improving under the full stack is the desired outcome rather than a
disappointment. It is enforced by the retrieval step and the rule engine rather
than by how capable the AI model is, so a better model should not change it, and
its steadiness across conditions is direct evidence that the system's design
rather than the AI is doing the work. This is the central claim of the project,
and Section 5.1.2 returns to it.

## 4.5 User acceptance testing and remediation

Design Science Research proceeds through repeated cycles of building and
evaluating. Two are documented in this report: the removal of the proposed 2D
visual builder on evaluation evidence, covered in Section 4.9, and the cycle
reported here. Testers were given navigation tasks in the working system, and four
findings emerged, all fixed rather than deferred.

| # | Tester observation | Nature of problem |
|---|---|---|
| 1 | A request for a "purple and blue themed" build returned keycaps of no particular colour | Missing functionality |
| 2 | The community page "does not look like a page for posts" | Incorrect visual cues |
| 3 | Saved builds could not be located | Hidden feature |
| 4 | The design is too plain, with little visualisation | Presentation |

Table 4.5: Findings from user acceptance testing

Finding 4 proved the most significant, because raised independently by testers it
confirms that an earlier design decision carried a genuine cost, as Section 4.9
discusses.

### 4.5.1 Colourway intent extraction

The cause of Finding 1 was immediate. The intent schema extracted budget, layout,
sound profile, use case, switch technology, beginner-friendliness, priorities and
constraints, and contained no colour field at all, so any mention of colour was
silently discarded before reaching the catalog. Only keycaps carried colour data;
cases, plates and PCBs carried none.

The fix was implemented failing-test-first. Eight evaluation cases were written and
committed before any implementation existed and their failure recorded, an ordering
that makes the subsequent improvement impossible to manufacture after the fact.
The results are reported as three separate claims rather than one total, because
the suite itself changed size between measurements.

| Claim | Cases | Offline | Semantic |
|---|---|---|---|
| Capability — can it do the new thing? | col-001 to col-004, col-008 | 0/5 to 5/5 | 0/5 to 5/5 (3 runs) |
| Control A — did it begin inventing colours? | col-005 to col-007 | 3/3 to 3/3 | 3/3 to 3/3 |
| Control B — did anything else break? | the original 50 | unchanged | unchanged |

Table 4.6: Colour extraction reported as three independent claims

Control A requires explanation, since a poorly chosen control proves nothing.
These prompts are deliberately adversarial, offering colour-adjacent language
without naming a colour. The clearest is "aluminium case, premium feel", where
silver appears in the system's colour vocabulary and aluminium is a material, so a
careless extractor would take the bait. A control earns its place by not moving,
and these did not. Control B is protected twice over, since the runner skips any
case not declaring an expected colour, and independently none of the 30 original
prompts contains a colour word.

Suite totals moved from 47 pass and 7 fail to 52 pass and 2 fail offline, and from
50 to an average of 54.33 with a range of 54 to 55 semantically, both against a
denominator of 58 rather than 50. The denominator changed because eight cases were
added, so passes rose by five and failures fell by five for that reason alone and
the totals are not comparable across the change. The movement from 47 to 52 reads
as progress and is not the correct interpretation.

One design decision underpins the feature: colour ranks but never filters. The
candidate search never receives colour, so requesting a purple keyboard reorders
results and can never empty them. Three properties are unit tested. When no colour
is requested the ranking is inert and every previous result is unchanged; an
untagged component scores the same as a tagged non-match, so ranking reflects the
request rather than how complete the catalog data happens to be; and a match can
only add to a score, never subtract. Colour is a preference rather than a
compatibility constraint, and the rule engine never sees it.

### 4.5.2 A configuration-dependent defect

The first screenshot taken after implementing colour showed no change at all,
despite extraction passing 5 out of 5, the ranking unit tests passing, and a
direct probe confirming the scoring function reordered candidates correctly.
Every signal said the feature worked. In the running application it did nothing.

The cause was configuration rather than code. The application reads its catalog
from the Supabase database whenever credentials are present, falling back to the
local seed file only when they are absent, and the colour tags had been added to
the seed file. Every component therefore reported no colour and the ranking
contributed zero. It was resolved by merging the colour data directly into the
five keycap rows in the database.

This is the most transferable finding in the project. A change can pass every
unit test, every evaluation case and a direct functional probe while doing
nothing in the deployed system, because the tests and the running application may
not read the same data. It was caught only because the design cycle required a
before-and-after screenshot rather than permitting a passing test to be trusted.

### 4.5.3 Remaining findings

The other three findings were smaller. Finding 3 was a signposting problem rather
than a missing feature: the saved builds page existed and worked, but was
reachable only through an unlabelled icon, and the confirmation after saving
named the page without linking to it. Both were corrected, and three existing
tests that had required the navigation link to be absent were inverted rather
than deleted, since they encoded exactly the behaviour user testing rejected.
Finding 2 was presentational, the community gallery being rebuilt from an image
grid into a single-column feed using the conventions readers recognise as posts,
with no change to the data model. Finding 4 was timeboxed, and an audit found two
of its three scoped items already implemented and the third targeting a component
nothing renders, so the scope was reduced to one substantive change: the
recommendation card now names the build's colourway in words. Section 4.9 returns
to Finding 4, which proved the most consequential of the four.

### 4.5.4 Realigning expert recommendations

A later check found that the assistant never mentioned the switches the builder's
own guidance recommends, even when asked directly which switch offered the best
value for money. The cause was not the AI. The guidance recommended two switches
that are not stocked, and the grounding rules forbid naming any part the system
cannot verify, so the assistant correctly declined to mention them. The
recommendations were realigned to switches actually carried, and both cases now
pass.

Correcting this exposed two further problems. Three grounding checks meant to
confirm the assistant does not push products during educational questions had
been guarding against the names of the unstocked switches, so they were passing
without testing anything. Once corrected, one failed immediately: asked to
explain the difference between thocky and clacky, the assistant answered by
naming a product. This was resolved by adding a rule that conceptual questions
receive an explanation only.

| Evaluation state | Offline | AI mode |
|---|---|---|
| Original suite, 50 cases | 44 pass | 45 / 46 / 46 |
| After colour extraction, 58 cases | 52 pass, 2 fail | mean 54.33 (range 54–55) |
| After realignment, 58 cases | 54 pass, 2 fail | mean 57.67 (range 57–58), 6 runs |

Table 4.7: Evaluation results across the three design cycles

Offline mode still fails the two cases depending on the builder's expertise, and
this is structural rather than a defect: that expertise is supplied only to the
language model, so the deterministic path cannot reproduce advice depending on
it. This gives the AI layer a second contribution beyond closing the semantic
gap, since it is the only route capable of delivering curated practitioner
knowledge. Taking both modes together, the AI gains four cases rather than the two
reported in Section 4.4.1, while losing one to model non-determinism. As in
Section 4.5.2, both problems were found by examining why a result occurred rather
than accepting the result itself.

## 4.6 Evaluation against non-functional requirements

CP1 Section 3.2.4, Table 3.4 specified seven non-functional requirements, being
measurable qualities the system had to meet rather than features it had to
provide. All are evaluated below, including the one that failed.

| # | Requirement | Measured result | Verdict |
|---|---|---|---|
| 1 | Validation under 200 ms | median 0.0068 ms (range 0.0068–0.0091), 1,000 samples | MET, by roughly 29,000× |
| 2 | First text visible under 2 s | assistant median 2,410 ms; slowest 5% above 4,110 ms | NOT MET |
| 3 | 100% prevention of incompatible pairs | 18/18 builds valid across 7 runs; 20/20 hand-check agreement | MET |
| 4 | All recommendations name real catalog entries | 18/18, every component resolves | MET |
| 5 | JSONB for variable product attributes | 6 columns across 3 migrations | MET |
| 6 | Accurate layered visual rendering | — | SCOPED OUT (Section 4.9) |
| 7 | Password hashing; server-side API keys | 0 of 18 browser-side files reference secrets; 22 access-control policies | MET BY DELEGATION |

Table 4.8: Evaluation against the CP1 non-functional requirements

Two merit discussion. Requirement 1 passed so overwhelmingly that the pass is its
least interesting aspect. CP1 allocated 200 ms to validation, implying an
expectation that it would account for a meaningful share of user waiting time. It
uses roughly four thousandths of one percent of that allowance, while the
surrounding pipeline, performing no network calls at all, takes about 95 ms
typically and about 240 ms in its slowest 5%. The surrounding logic can therefore
exceed the entire budget assigned to validation alone. The requirement was placed
on the cheapest step in the process, which reflects on how requirements were set
at proposal stage rather than constituting an engineering achievement.

Requirement 2 is the project's only failure, and it fails two ways. It cannot be
evaluated as written, because time to first token presupposes streaming and no
streaming exists in the implementation. On the closest measurable equivalent it
fails outright, at 2,410 ms against a 2,000 ms budget. Because nothing streams,
the user sees nothing until the entire response arrives, so total response time
is not a substitute for what the requirement asked but the same quantity. Whether
streaming would have delivered first text within two seconds is plausible,
untested, and explicitly not claimed. Requirement 7 is also worth noting as met
by a different mechanism from the one CP1 named, since password hashing is
delegated entirely to Supabase Auth and no bcrypt implementation exists in the
codebase.

## 4.7 Competitive position of the delivered system

CP1 Section 2.6.2 compared existing market solutions across ten dimensions and
concluded that no single tool combined AI guidance, compatibility logic, sensory
feedback and community. Applying the same instrument to the delivered system, and
scoring any claim without concrete supporting evidence as not delivered, gives
four dimensions delivered, three partial and three not delivered.

| CP1 module | Status | Supporting evidence |
|---|---|---|
| AI guidance | Closed | Natural-language intent, semantic retrieval, agent pipeline, image-based intent |
| Compatibility checks | Closed | Deterministic engine; 99.4446% reduction measured |
| Community | Partially closed | Gallery, threads and in-context assistant delivered; one-click cloning absent |
| Sensory feedback | Not closed | No audio files, sound data or playback anywhere in the codebase |

Table 4.9: The four CP1 module gaps, re-assessed against the delivered system

CP1's stated contribution was integrating all four, and on this evidence that
claim is not fully supported. The sensory dimension, which CP1 argued most
strongly was unaddressed by the market drawing on Zheng and Bensebaa (2022) and
Rathee and Rajain (2019), is the one this system also leaves unaddressed. The
compatibility engine also deviates from CP1's specification of real-time AI
validation, being entirely deterministic and containing no AI. This is an
architectural inversion rather than a shortfall, since validation that cannot
hallucinate is a stronger guarantee than validation by a model that can, which is
the risk Huang et al. (2025) and Yaprak (2024) identify, but it is not what the
proposal described.

## 4.8 Target-market economics

Pricing every valid build through the estimator the application itself uses
produced a result the proposal did not anticipate.

| Statistic | MYR |
|---|---:|
| Cheapest valid build | 281.00 |
| Median build | 600.00 |
| Builds at or under RM250 | 0 |

Table 4.10: Price distribution across all 3,250 valid builds

CP1 targets the RM150–250 segment of the Malaysian market, and no valid build
exists below RM281, which is RM31 above the ceiling of that band. Not one of the
3,250 valid builds falls within the stated target market, and the median costs
roughly 2.4 times the top of the range.

This explains the two zero-result prompts noted in Section 4.3 and confirms they
are not defects. Intent extraction parsed both correctly, the engine genuinely
found no build within budget, and the system degraded gracefully with a message
inviting the user to raise the budget or relax a preference. The economics rather
than the software constitute the finding. Two explanations fit the evidence and
cannot be distinguished without vendor survey work not undertaken here: either
the catalog under-samples the budget segment, which has an obvious remedy, or a
complete build from separately purchased parts genuinely does not exist below
approximately RM280 in this market, which would invalidate an assumption carried
forward from the proposal.

## 4.9 Achievement of objectives and deviations from the proposal

| Objective | Supporting evidence | Status |
|---|---|---|
| 1. Logic-driven configurator with a constraint engine | 713-line engine, 7 rule categories, 99.4446% reduction, 20/20 hand-check agreement, no invalid build ever emitted | Achieved |
| 2. Retrieval-augmented translation of sensory intent | Both semantic-gap cases closed and reproducible; no invented component in any run; colour extraction 5/5 in both implementations | Achieved |
| 3. Full-stack application with social features | Accounts, saved builds, publishing and threaded gallery with AI replies delivered; one-click cloning not delivered | Substantially achieved |

Table 4.11: Achievement against the three CP1 objectives

Three commitments changed during implementation. The 2D visual builder and the
acoustic library appear in CP1 Section 1.4 as proposed modules rather than among
the three formal objectives, but they were promised and are accounted for here.

The 2D layered visual builder was removed on two grounds. Feasibility: the
approach requires photographically consistent layered images for every component
in every category, which was unachievable in the time available. More importantly
evidence: the measured weakness at the mid-point was recommendation accuracy
rather than visual feedback, and Chapter 2 offers only qualified support for rich
visualisation, with Geelhaar and Rausch (2014) noting the cost of high-fidelity
assets and Ya and Xing (2021) reporting diminishing returns against that cost.
The freed capacity went into semantic retrieval, the agent architecture and the
evaluation suite, producing the gains reported in Section 4.4.

User testing then demonstrated the decision carried a real cost. Finding 4 was
raised independently and unprompted, corroborating the visual-compensation
literature from Chapter 2, particularly Jiang et al. (2024) on sensory
substitution, from the opposite direction: removing the visual channel produced
exactly the dissatisfaction that literature predicts. This is reported as a
limitation rather than a vindication, since the trade-off carried a measurable
cost on both sides, which is a genuine Design Science Research finding rather
than a defence of the original decision.

The acoustic library was not implemented, for the same capacity reasons
compounded by its dependence on recording consistent audio samples under
controlled conditions. The data model anticipates it, with a sound URL field and
a sound-samples table both present and unpopulated, and its absence is the first
item of future work. Community cloning was partially delivered: publishing,
browsing and threaded discussion were implemented but one-click cloning was not,
so following Wang and Yu (2017) on observational learning the gallery delivers
the inspiration half of the social proof mechanism while the path from
inspiration to ownership remains absent.

## 4.10 Threats to validity

Every study has limits, and stating them precisely is more useful than stating
them apologetically.

| Threat | Nature and consequence | Addressed in |
|---|---|---|
| Researcher-authored ground truth | Evaluation cases written by the researcher, who is also the domain expert. Grounded in commercial experience, but may encode the same assumptions as the system. | Section 5.2 |
| Test suite coverage | Of 257 tests, 42 are skipped, all pinned to a superseded catalog. Kit integrity, stabiliser compatibility and the preference-warning layer have no active unit test. | Section 5.2 |
| Unreachable rules | Two implemented rules never fire against this catalog, compounding the coverage gap above. | Section 4.2.3 |
| Catalog scale | Sixty components may not generalise; retrieval faces more competing candidates as a catalog grows, and the reduction ratios are specific to this composition. | Section 5.2 |
| Partial colour coverage | All five keycap sets carry colour tags; none of the seven cases do, as that data does not exist in vendor sources and was not fabricated. | Section 5.2 |
| Model non-determinism | AI-mode output varies between runs without any change to the system, currently by one case across six runs. All AI-mode figures are reported as averages with ranges. | Section 4.4.2 |
| Ineffective evaluation checks | Three grounding checks were found to be testing nothing, guarding against product names the system could no longer produce. Corrected in Section 4.5.4. | Section 4.5.4 |
| Environment-specific timings | Figures were taken on the development machine and a containerised Linux environment. Neither represents a production deployment. | Section 4.6 |

Table 4.12: Threats to the validity of the reported results

The second warrants expansion, because it qualifies a headline figure. The 42
skipped tests were all disabled for one reason, having been pinned to an older
catalog, and the disabled set includes ten tests in the rule engine's own suite.
Those properties are nonetheless verified by the exhaustive sweep, the
independent hand-check and the conformance runs described in Section 4.2.3, which
are arguably stronger because they are exhaustive rather than exemplary: a unit
test asserts one case, whereas the sweep tests every case the catalog admits. The
figure of 215 passing tests must not, however, be read as covering them, and this
report does not use it that way.
