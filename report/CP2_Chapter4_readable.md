# Chapter 4: Results and Discussion

This chapter reports what the finished system actually does. Every claim here is
backed by a measurement rather than an opinion, and every measurement can be
repeated by running a script that is committed with the project. Appendix A lists
those commands. Where something is reasoned rather than measured, it is labelled
as such so the reader can tell the difference.

Before the results, two conventions need stating, because the numbers in this
chapter are not all the same kind of number.

| Kind of figure | What it means | How it is quoted here |
|---|---|---|
| **Counting figures** — combinations, pass counts, rejections | The computer counts every case. Run it again and you get the same answer, digit for digit. | Quoted exactly |
| **Timing figures** — how many milliseconds something took | A stopwatch reading. The same code on the same machine varies slightly every run. | Quoted to two significant figures, with the range observed across runs |

The distinction matters. No claim in this chapter depends on a "worst-case"
timing, because at the scale being measured — millionths of a second — a single
housekeeping pause inside the programming language is larger than the thing being
timed. The worst-case figure was observed to swing by a factor of 2.8 between two
runs of *identical* code, so it describes the machine's mood rather than the
software. Typical (median) timings were stable and are what this chapter uses.

## 4.1 The delivered system

Sharkeys is a working web application. It has nine pages that a user can visit
and nine internal endpoints that those pages call for data, built from 110
TypeScript source files and backed by a catalog of 60 real keyboard components.

| Page | What the user does there |
|---|---|
| `/` | Landing page, opening with a prompt box and an animated demonstration of the configurator |
| `/configurator` | The main workspace: describe a keyboard in plain English, or pick parts manually and have them checked |
| `/browse` | Look through the catalog by category |
| `/my-builds` | Saved builds, tied to the user's account |
| `/community-gallery` | Community posts in a discussion feed, with the AI assistant able to reply in context |
| `/login`, `/signup` | Account creation and sign-in |

The catalog holds 60 records — 19 plates, 11 stabilisers, 10 switches, 8 PCBs,
7 cases and 5 keycap sets. Every one was checked as actually purchasable in
Malaysia and priced in ringgit from a real local vendor listing. This matters
later: Section 4.8 shows that the prices in this catalog produce a finding the
proposal did not anticipate.

Code quality is enforced by a single command that runs four checks in sequence —
type checking, linting, the automated tests, and a full production build. If any
one fails, the whole thing fails. At submission it passes, with 37 test files and
215 passing tests. Section 4.10 is honest about what those tests do *not* cover,
and that qualification should be read alongside this number rather than after it.

## 4.2 The compatibility engine

Objective 1 asked for a configurator that stops the user from choosing parts that
cannot physically work together. This section reports whether it does.

The engine is a single 713-line module. Given a complete set of six chosen parts,
it checks them against seven categories of rule: layout, preferred layout, mount
style, kit structural integrity, switch fitment, keycap fitment and stabiliser
fitment. Separately it produces advisory warnings — things that will work but
that the user might not want — which never block a build.

One design detail matters for reading the timings later. **The engine never stops
early.** Even after it has found a problem, it keeps running every remaining
check and collects all the problems together. A rejected build therefore costs
roughly the same time as an accepted one. There is no shortcut for bad builds,
which means the timings in Section 4.6 are not flattered by easy rejections.

This is the knowledge-based recommender approach that Felfernig and Burke (2008)
and Uta et al. (2024) describe: rules written by someone with domain knowledge,
applied deterministically, rather than preferences inferred from statistics. Uta
et al. note that such systems are accurate but expensive to maintain, because a
human has to encode every rule. That trade-off is visible in this project — the
rules were hand-written from the researcher's own market experience — and it is
what Section 5.2.8 identifies as the constraint on growing the catalog.

### 4.2.1 How much of the choice the engine removes

The catalog offers 7 cases, 8 PCBs, 19 plates, 10 switches, 5 keycap sets and
11 stabilisers. Multiplying those together gives every possible way to build a
keyboard from this catalog:

> 7 × 8 × 19 × 10 × 5 × 11 = **585,200 possible combinations**

Every single one of those was run through the real engine. Not a sample — all
585,200, which took 3.1 seconds.

**Only 3,250 of them are valid.** The engine throws away **99.4446%** of the
possibilities. Put another way: of every 180 keyboards you could assemble from
this catalog, 179 would not work, and only one would.

It helps to see the space collapsing rule by rule:

| Rules applied so far | Combinations still standing | % of the original |
|---|---:|---:|
| None — every possibility | 585,200 | 100% |
| + layout compatibility | 45,650 | 7.80% |
| + mount compatibility | 27,500 | 4.70% |
| + kit structural integrity | 11,300 | 1.93% |
| + switch / keycap / stabiliser fitment | **3,250** | **0.5554%** |

**An important caution about that table.** The engine does not actually work in
this order — it applies every rule at once. The ordering above was imposed
afterwards to make the collapse readable. And because the rules overlap, whichever
rule is listed first gets credit for every rejection it shares with the rules
below it. Change the order and the credit moves around.

So each rule was also tested *on its own* against the full space, which removes
that distortion:

| Rule, applied alone | Combinations it rejects | % of 585,200 |
|---|---:|---:|
| Layout compatibility | 539,550 | 92.20% |
| Kit structural integrity | 505,500 | 86.38% |
| Mount compatibility | 339,900 | 58.08% |
| Stabiliser compatibility | 296,700 | 50.70% |
| Switch compatibility | 170,170 | 29.08% |
| Keycap compatibility | 0 | 0.00% |

Those individual rejections add up to 1,851,820 — which is 316% of the entire
space, more than three times everything that exists. That is not an error. It
happens because most bad combinations break several rules at the same time and so
get counted more than once. The engine's actual combined rejection is 581,950,
and the difference of 1,269,870 is exactly that double-counting.

**The two tables tell different stories, and the difference is instructive.** In
the first table, the kit rule looks like a minor third-stage filter, trimming
27,500 down to 11,300. Tested on its own it rejects 86.4% of everything — second
only to layout, and by far the most powerful rule after it. It only *looks* small
in the cascade because layout and mount had already removed most of what it would
have caught. Had this report shown only the first table, it would have badly
understated one of the system's most important rules.

### 4.2.2 Not all of this is physics

There is a distinction inside that 99.44% that the reader needs, because it would
be easy to draw a false conclusion from it.

Some combinations are rejected because they genuinely cannot be assembled — the
parts do not fit. But the kit rule rejects combinations for a different reason
entirely. Cases, PCBs, plates and stabilisers that a vendor sells bundled together
as a kit are not sold separately. A build mixing one kit's case with another kit's
PCB might screw together perfectly. You simply cannot buy the parts.

Turning the kit rule off and applying only the physical rules leaves 6,130
combinations standing (1.05%). Adding the kit rule back removes a further 2,880.

> **So 47.0% of the physically buildable combinations are rejected for
> commercial reasons, not physical ones.**

Nearly half. A reader who assumes the whole 99.44% represents physical
impossibility has been misled, which is why the split is stated here explicitly.

This generalises beyond keyboards, and it is one of the more useful findings in
the project: **a configuration system has to model how products are sold, not
only how they fit together.** This rule came from the researcher's own market
knowledge rather than from any specification document. Without it the system
cheerfully produced builds that were technically perfect and impossible to
actually purchase — which would have been worse than useless to a real buyer,
since the failure would only appear at checkout.

### 4.2.3 Proving the engine is right

Objective 1 is only met if the engine is actually correct, so its correctness is
established three separate ways. Notably, **none of them is the unit test suite**
— Section 4.10 explains that uncomfortable point in full.

**1. The exhaustive sweep.** Every rule was fired against all 585,200
combinations and its rejections counted, as reported above.

This sweep also revealed something the project did not go looking for. Two of the
implemented rules — the one preventing a switch technology mismatch with keycaps,
and the one preventing a keycap layout mismatch — fired **zero times** across all
585,200 combinations. They are not broken. The cause is the catalog: all five
keycap sets happen to declare support for all five layouts and both switch
technologies present, so there is no combination in this data that could trigger
them. The rules are correct but unreachable with this catalog, and this is
recorded as a limitation in Section 4.10 rather than quietly ignored.

**2. An independent hand-check.** Twenty combinations were picked by a fixed,
reproducible stride across the catalog. For each one, the expected answer — and
the exact list of error codes it should produce — was worked out **by hand from
the raw component data, before looking at what the engine said.** Only then were
the two compared.

**They agreed 20 out of 20**, on both the accept/reject verdict and the precise
set of error codes.

This is the only genuinely *external* check available, and the reason is worth
understanding. The sweep uses the engine itself to decide what "incompatible"
means. Sweeping every combination and then confirming the engine agrees with the
engine would prove nothing — it would return 100% by definition. The hand-check
is the only test where the correct answer was established without consulting the
thing being tested.

**3. Pipeline conformance.** Every build the recommendation system actually
handed to a user was re-checked through the engine, and every component it named
was looked up in the catalog. Across 8 prompts, 18 builds were produced. All 18
were valid. Every component resolved. This reproduced identically across 7 runs on
two different computer architectures.

This tests something different from the other two: not "is the engine right?" but
**"can a build reach the user without passing through the engine?"** The answer
is no, because validation sits inside the recommendation path rather than beside
it. That is a structural guarantee, not a statistical one.

## 4.3 From 585,200 options to 3

Chapter 1 argued that buyers are paralysed by too much choice. That was an
argument. This section turns it into a measurement, and it needs both halves of
the system to do so: the engine cuts down what is *possible*, and the ranking
cuts down what is *shown*.

Eight fixed prompts were run, chosen to span the buyer personas described in CP1
— budget-led, sound-led, use-case-led, layout-led, and one deliberately vague.
The system returns an average of 2.25 builds per prompt, ranging from 0 to 3,
against a hard maximum of 3. These counts reproduced byte-for-byte across seven
runs on two architectures, so they carry no measurement uncertainty at all.

```
585,200   possible combinations
  3,250   survive the rule engine       (99.4446% removed)
      3   are shown to the user         (99.91% of the remainder removed)
```

> **Overall: 585,200 → 3. A reduction of 99.9995%.**

This is the empirical form of the problem CP1 could only assert, and the
literature explains why it matters. Scheibehenne, Greifeneder and Todd (2010)
found that choice overload appears most reliably when a decision is complex *and*
the chooser lacks expertise in the domain. Chernev (2003) adds that the effect
depends on whether the chooser has a clear idea of what they want in the first
place. A beginner buying their first custom keyboard has neither: no expertise,
and no ideal point. 585,200 options is precisely the condition this literature
predicts will end in paralysis or abandonment.

The measured reduction is the mechanism by which the system removes that
condition — and reporting both stages is stronger than reporting either alone.
The engine by itself still leaves 3,250 valid builds, which is far beyond what
any person can meaningfully compare. Only the second stage makes the result
usable. This directly addresses the failure Mandal et al. (2023) describe, where
filtering tools return either nothing or an unmanageable list.

Two of the eight prompts returned zero builds. That looks like a defect and is
not one; Section 4.8 shows exactly why.

## 4.4 The AI layer

Objective 2 asked for a retrieval-augmented system that turns sensory language
into validated technical specifications. Measuring that required building an
evaluation suite, because "did the AI understand the user?" is otherwise a matter
of opinion.

The suite contains 50 test cases in three groups — 30 on intent extraction
(did it correctly understand what the user asked for?), 10 on assistant
grounding (did it stick to facts from the catalog instead of inventing them?),
and 10 on retrieval (did it find the right parts?). The expected answers encode
the researcher's own domain expertise from over 150 completed keyboard sales in
the Malaysian market.

Crucially, every suite runs in **two modes**:

- **Offline mode** — no API key, no internet. Intent is extracted by a local
  keyword-matching program written for the purpose.
- **Semantic mode** — the full system, using the language model for extraction
  and pgvector for meaning-based search.

Running both and comparing them isolates exactly what the AI contributes, which
is the only way to answer Objective 2 honestly rather than by assertion.

### 4.4.1 The comparison

Measured at commit `4f019d3`, across the original 50 cases:

| Suite | Offline (rules only) | Semantic (full AI, 3 runs) |
|---|---|---|
| Intent extraction (30) | 30 pass | 30 / 30 / 30 |
| Assistant grounding (10) | 8 pass, 2 fail | 7 / 8 / 8 |
| Retrieval (10) | 6 pass, 2 expected-fail, 2 pending | 8 / 8 / 8 |
| **Total** | **44** | **45 / 46 / 46** |

An earlier evaluation dated 13 June reported 34 offline and 46 semantic, and
those figures are superseded. The reason is stated plainly rather than buried:
commit `7192a73` substantially improved the keyword fallback between the two
measurements. The two runs measure **different code**, not the same code
performing differently, so comparing them directly would be misleading.

### 4.4.2 The most surprising result

The keyword program matches the language model on **all 30** intent extraction
cases.

That deserves emphasis, because it was not the expected outcome. Budgets, layout
sizes, use cases, stated sound preferences — everything a user says explicitly or
semi-explicitly turns out to be fully recoverable by ordinary rules. The language
model adds nothing on any of them.

This narrows the AI's contribution considerably, and it is stated plainly here
rather than hidden behind a flattering total. **The reproducible gain of the full
AI system over a well-written deterministic fallback is exactly two cases.** Both
are semantic-gap cases.

Reporting a smaller AI contribution than the project's own framing would have
preferred is deliberate. A vague claim that "AI improved the system" would have
been easier to write and impossible to defend. This claim is precise, and it
survives scrutiny.

### 4.4.3 Where the AI genuinely earns its place

Two retrieval cases were written from the outset as **expected failures** — cases
the system was known to fail, included on purpose because they represent exactly
the semantic gap defined in Chapter 1.

In both, the user describes sound the way real enthusiasts actually describe it:
"buttery smooth", "deep thud". Neither phrase shares a single word with anything
in the catalog, which stores materials, mount types and actuation forces. Keyword
search cannot resolve them — not because the implementation is weak, but by
construction. There is no word to match.

Both moved from failing to passing once pgvector embeddings were generated.
"Buttery smooth" now retrieves creamy linear switches; "deep thud" retrieves
thocky components. Both pass in every semantic run recorded.

**This is the most direct empirical answer to the research question.** It shows
three things at once: that the semantic gap is real and measurable, that it
cannot be closed by word matching, and that meaning-based retrieval closes it —
while the rule engine continues to guarantee that whatever is retrieved actually
forms a buildable keyboard.

The literature anticipates both halves. Mandal, Tunkelang and Wu (2023) identify
semantic equivalence as the central failure of keyword matching in e-commerce
search. Lewis et al. (2020) establish retrieval-augmented generation as the
mechanism for grounding a generative model in external facts. What this project
adds is the measured demonstration that the two mechanisms are **complementary
rather than competing**: retrieval widens the range of requests the system can
understand, in a way keyword matching cannot, and validation narrows the answers
to only correct ones, in a way a generative model cannot be trusted to do.

### 4.4.4 An unexpected inversion

The grounding suite behaves differently from the other two, and that difference is
itself a result.

Offline, it scores a steady 8 out of 10, failing the same two cases every time.
With the full AI stack it scores 7, 8, 8, 9, 8, 9 and 8 across seven runs — a
three-case swing on a ten-case suite, caused purely by the language model's
non-determinism, with two cases flipping back and forth between runs. One case
fails in every run and every mode: it needs curated expert knowledge about budget
recommendations and lubrication technique that simply is not in a product catalog.

Two conclusions follow, and the first is the surprising one.

**The rule-based path is more reliably obedient than the language model.** One
recurring semantic failure is the assistant using a term the grounding rules
explicitly forbid — a violation the keyword path never once commits. The
"dumber" component is the better-behaved one.

**The offline suite is the trustworthy regression signal.** Because semantic
scores wander by up to three cases on their own, movement of one or two cases
between runs means nothing and cannot be attributed to any code change. Only the
deterministic mode can tell you whether you broke something.

Finally, and importantly: **grounding not improving under the full AI stack is
the desired result, not a disappointment.** Grounding is enforced by retrieval and
validation, not by how clever the model is. A better model should not improve it.
That it stays flat across every condition is direct evidence that the *mechanism*
is doing the work rather than the model — which is the central architectural claim
of this entire project, and Section 5.1.2 returns to it.

## 4.5 Design Cycle 2: user testing and what it changed

Design Science Research works through repeated cycles of building and evaluating,
rather than one pass. Two full cycles are documented in this report. Cycle 1 was
the decision to remove the proposed 2D visual builder on evidence, covered in
Section 4.9. Cycle 2 is reported here: real users, real findings, real fixes, and
re-measurement afterwards.

### 4.5.1 What the testers found

Testers were given navigation tasks in the working system. Four findings emerged,
and all four were fixed rather than deferred:

| # | What the tester said | Type of problem |
|---|---|---|
| 1 | Asking for a "purple and blue themed" build returned keycaps of no particular colour | Missing functionality |
| 2 | The community page "does not look like a page for posts" | Wrong visual cues |
| 3 | Saved builds could not be found | Hidden feature |
| 4 | The design is too plain, with little to look at | Presentation |

Finding 4 turned out to be the most significant for this report, and Section 4.9
explains why: raised independently by testers, it confirms that an earlier design
decision carried a genuine cost.

### 4.5.2 Finding 1: the system was ignoring colour entirely

Investigation found the cause immediately. The intent schema extracted budget,
layout, sound profile, use case, switch technology, beginner-friendliness,
priorities and constraints — and had **no colour field at all**. When a user
mentioned colour, that part of their request was silently thrown away before it
reached the catalog. Worse, only keycaps carried any colour data; cases, plates
and PCBs had none.

The fix was written **failing-test-first**: eight evaluation cases were written
and committed *before* any implementation existed, and their failure was recorded
first. That ordering matters, because it makes the improvement impossible to
manufacture after the fact.

The results are reported as **three separate claims**, never as one total,
because the test suite itself changed size between the before and after
measurements:

| Claim | Cases | Offline | Semantic |
|---|---|---|---|
| **Capability** — can it do the new thing? | `col-001`–`004`, `col-008` | 0/5 → **5/5** | 0/5 → **5/5** (3 runs) |
| **Control A** — did it start inventing colours? | `col-005`–`007` | 3/3 → 3/3 | 3/3 → 3/3 |
| **Control B** — did anything else break? | the original 50 | unchanged | unchanged |

**Control A deserves explanation, because a badly chosen control proves nothing.**
These three prompts are deliberately adversarial: they dangle colour-adjacent
language without naming a colour. "Aluminium case, premium feel" is the clearest
— *silver* is in the system's colour vocabulary, and *aluminium* is a material,
so a careless extractor would take the bait. A control earns its place by **not
moving**, and these did not move. No colour hallucination was introduced.

Control B is protected twice over. The test runner skips any case that does not
declare an expected colour, so the original 50 are untouched by design; and
independently, none of those 30 prompts contains a colour word at all, so the new
extraction cannot fire on them even in principle.

Overall suite totals moved from 47 pass / 7 fail to 52 pass / 2 fail offline, and
from 50 to an average of 54.33 (range 54–55) in semantic mode — both against a
denominator of 58, not 50. **The denominator changed because eight cases were
added.** Passes rose by five and failures fell by five for that reason alone, so
the raw totals must not be compared across the change. This is stated explicitly
because "47 became 52" reads like progress and is not the correct reading.

One design decision underpins all of this: **colour ranks, it never filters.**
The candidate search never receives the colour at all, so asking for a purple
keyboard reorders the results but can never empty them. Three properties are
unit-tested to guarantee it: when no colour is requested the ranking is a no-op
and every previous result is bit-identical; an untagged component scores exactly
the same as a tagged non-match, so the ranking reflects what the user asked for
rather than how complete the catalog data happens to be; and a colour match can
only ever add to a score, never subtract. Colour is a preference, not a
compatibility constraint, and the rule engine never sees it.

### 4.5.3 A defect that no test could have caught

This is the most transferable finding in the project, and it very nearly went
unnoticed.

The first "after" screenshot showed **no change whatsoever**. Yet extraction was
passing 5 out of 5, the ranking unit tests passed, and a direct probe confirmed
the scoring function reordered candidates correctly. Every signal said the
feature worked. In the running application it did absolutely nothing.

The cause was configuration, not code. The application reads its catalog from the
Supabase database whenever credentials are present, and only falls back to the
local seed file when they are absent. **The colour tags had been added to the
seed file.** So in the running system every component reported no colour, the
ranking contributed exactly zero, and the output was identical to before — for
reasons that had nothing at all to do with the code that had just been written.

It was fixed by merging the colour data into the five keycap rows in the
database directly, preserving the existing data, and verified afterwards: 60 rows
present, colour on 5, kit data intact on 30.

**The lesson generalises well beyond this project.** A change can pass every unit
test, every evaluation case and a direct functional probe, and still do nothing
in the deployed system, because the tests and the real application may not be
reading the same data.

It was caught only because the design cycle *required* a before-and-after
screenshot rather than permitting a green test result to be trusted. Had the
protocol allowed that shortcut, the feature would have shipped looking perfect
and doing nothing. The screenshot requirement was adopted for evidence-gathering
reasons and turned out to be the only thing standing between this report and a
false claim.

### 4.5.4 Findings 2, 3 and 4

**Finding 3 — saved builds could not be found.** The diagnosis was precise. The
`/my-builds` page existed and worked perfectly; it was simply only reachable
through an unlabelled avatar icon. Worse, the confirmation message after saving
mentioned "the My Builds page" in plain text — telling users where their build
had gone while giving them no way to get there. Both were fixed.

Three existing tests asserted the **opposite** behaviour, requiring the
navigation link to be absent. They were inverted rather than deleted, because
those assertions encoded precisely the behaviour that user testing rejected, and
the change is therefore visible in the test history as well as the source. This
is the classic implemented-but-not-usable result: the feature was finished and the
signpost was missing.

**Finding 2 — the community page.** It was a three-column image grid, which
carries the visual cues of a photo gallery: the image leads, and author,
timestamp and discussion are secondary or absent. It was rebuilt as a
single-column feed using the conventions people already recognise as posts —
byline above the title, title dominant, an excerpt, and a clear invitation into
the discussion. No data model or server code changed.

One requested feature was deliberately **not** implemented: a per-post reply
count. The count is not present in the query that loads the list, and adding it
would mean changing the database query, which was outside the presentational
scope agreed for this fix. The card invites the reader into the thread rather
than displaying a number it cannot actually know.

**Finding 4 — the design is too plain.** This was timeboxed, and an audit before
starting found something awkward: two of the three items scoped for improvement
had **already been implemented** before user testing, and the third targeted a
component that nothing in the product actually renders.

Rather than perform work that was either already done or would be invisible, the
scope was cut to a single change with real substance: the recommendation card now
names the build's colourway in words rather than only showing colour swatches,
which closes the loop on the tester's original "purple and blue themed" request.

Reporting this honestly matters. Quietly claiming to have "completed" all three
original items would have put statements in this report that were either untrue
or describing work that predated the finding.

## 4.6 The non-functional requirements

CP1 §3.2.4, Table 3.4 set seven non-functional requirements — measurable
qualities the system had to meet, as distinct from features it had to have. All
seven are evaluated here, including the one that failed.

| # | Requirement | What was measured | Verdict |
|---|---|---|---|
| 1 | Validation under 200 ms | median 0.0068 ms (range 0.0068–0.0091), 1,000 samples | **MET**, by roughly 29,000× |
| 2 | First text visible under 2 s | assistant median 2,410 ms; worst 5% above 4,110 ms | **NOT MET** |
| 3 | 100% prevention of incompatible pairs | 18/18 builds valid across 7 runs; 20/20 hand-check agreement | **MET** |
| 4 | All recommendations name real catalog entries | 18/18, every component resolves | **MET** |
| 5 | JSONB for variable product attributes | 6 columns across 3 migrations | **MET** |
| 6 | Accurate layered visual rendering | — | **SCOPED OUT** (§4.9) |
| 7 | Password hashing; server-side API keys | 0 of 18 browser-side files reference secrets; 22 access-control policies | **MET BY DELEGATION** |

Three of these deserve discussion.

**Requirement 1 passed so overwhelmingly that the pass is the least interesting
part.** CP1 gave compatibility validation a 200 ms budget, which implies an
expectation that validation would account for a meaningful share of the time a
user waits. It does not. Validation uses about four thousandths of one percent of
its allowance.

Meanwhile the project's own offline pipeline — doing no network calls at all —
takes about 95 ms typically and about 240 ms in its slowest 5%. In other words,
**the surrounding logic can on its own exceed the entire budget that was assigned
to validation.** The requirement was placed on the cheapest step in the process.
That is a comment on how requirements were set at proposal stage, not an
engineering achievement, and it is more useful to the reader stated that way.

There is a related architectural finding. Validation time grows **linearly** with
catalog size rather than staying flat, and the cause is identifiable in the code:
a lookup index is rebuilt from scratch on every single call. The compatibility
rules themselves only ever examine the six chosen components and are unaffected
by catalog size. The entire growth term is index-building, not rule-checking.
Extrapolating, the catalog would need roughly 3.1 million records before
validation breached 200 ms, so this is an observation rather than a risk — but
building the index once instead of every call would make validation effectively
constant-time. Section 5.2.9 lists it as future work, supported by a measurement
rather than a hunch.

**Requirement 2 is the project's only failure, and it fails in three distinct
ways.**

*First, it cannot be evaluated as written.* "Time to first token" assumes the
response streams in progressively, word by word. No streaming exists anywhere in
the implementation. There is no first token distinct from the last one; there is
one complete response.

*Second, on the closest measurable equivalent it fails outright.* The assistant's
median total response is 2,410 ms against a 2,000 ms budget. Intent extraction
passes at the median but exceeds the budget in its slowest 5%.

*Third — and this is the part that matters —* because nothing streams, the user
sees nothing at all until the whole response arrives. Total response time is not
a substitute measure for what the requirement was asking about. **It is the same
quantity.** The requirement wanted to bound how long a user stares at nothing,
and that is exactly what was measured, and it is over budget.

Whether a streaming implementation would have delivered first text inside two
seconds is plausible but was never tested, and is explicitly **not** claimed here.
Section 5.2.4 sets out the small experiment that would settle it.

**Requirement 7 is met, but not by the mechanism CP1 named.** There is no bcrypt
implementation anywhere in the codebase. Password hashing is delegated entirely
to Supabase Auth, and the application never handles a raw password at any point.
The security property CP1 wanted is satisfied — arguably more safely than a
hand-rolled implementation would have been — but the specific mechanism it named
is absent. Both facts are reported rather than the convenient one.

## 4.7 The competitive audit, re-run

CP1 §2.6.2 compared existing market solutions across ten dimensions and concluded
that no single tool combined AI guidance, compatibility logic, sensory feedback
and community. Applying that same instrument to the delivered system — with a
"Sharkeys (delivered)" column set beside CP1's "Sharkeys (proposed)", and scoring
any claim without concrete evidence behind it as *not delivered* — gives:

**Four dimensions delivered, three partial, three not delivered.**

Against the four modules CP1 identified as the gap it would close:

| CP1 module | Status | Evidence |
|---|---|---|
| AI guidance | **Closed** | Natural-language intent, semantic retrieval, agent pipeline, image-based intent |
| Compatibility checks | **Closed** | Deterministic engine; 99.44% reduction measured |
| Community | **Partially closed** | Gallery, threads and in-context assistant delivered; one-click cloning absent |
| Sensory feedback | **Not closed** | No audio files, no sound data, no playback anywhere in the codebase |

So the delivered system closes two of the four gaps, partially closes a third,
and does not close the fourth. **CP1's stated contribution was integrating all
four, and on this evidence that claim is not fully supported.** The sensory
dimension — the barrier CP1 argued most strongly was unaddressed by the market,
drawing on Zheng and Bensebaa (2022) and Rathee and Rajain (2019) on the need for
physical contact before purchase — is the one this system also leaves
unaddressed.

Two further observations qualify the picture in opposite directions.

The compatibility engine **deviates from CP1's own specification.** CP1 described
"real-time AI validation". The delivered engine is entirely deterministic and
contains no AI whatsoever. This is an architectural inversion rather than a
shortfall — validation that *cannot* hallucinate is a stronger guarantee than
validation performed by a model that can, which is precisely the risk Huang et al.
(2025) and Yaprak (2024) identify — but it is not what the proposal described, and
the deviation is stated rather than glossed.

And a re-check of competitors found that one has since added a guided,
deliberately jargon-free quiz, which narrows the differentiation CP1 claimed on
two dimensions. The core distinction still holds, because that competitor
recommends finished keyboards rather than configuring components, but the margin
is smaller than the proposal asserted.

Finally, two capabilities were delivered *beyond* what CP1's instrument measures
and are therefore invisible in its table: image-based intent extraction, and the
evaluation suite itself. To that extent the audit understates the project.

## 4.8 Target-market economics

Running every valid build through the same price estimator the application itself
uses produced a result the proposal did not anticipate.

| Statistic | MYR |
|---|---:|
| Cheapest valid build | 281.00 |
| Median build | 600.00 |
| Builds at or under RM250 | **0** |

CP1 targets the RM150–250 segment of the Malaysian market.

> **No valid build exists below RM281** — RM31 above the *ceiling* of the target
> band, and RM131 above its floor. Not one of the 3,250 valid builds falls
> anywhere inside the stated target market, and the median build costs roughly
> 2.4 times the top of the range.

This also explains the two zero-result prompts from Section 4.3, and confirms
they are **not defects**. Intent extraction parsed both prompts correctly. The
engine searched and genuinely found no build meeting the constraints within
budget. The system then degraded gracefully, returning an accurate message
inviting the user to raise the budget or relax a preference. Every component
behaved exactly as designed. The economics are the finding, not the software.

Two explanations fit the evidence, and they cannot be told apart without vendor
survey work that was not undertaken here:

1. **The catalog under-samples the budget segment.** Cheaper components exist in
   the Malaysian market and simply were not curated into the 60. This is a data
   limitation with an obvious fix.
2. **A complete build from separately purchased parts genuinely does not exist
   below about RM280 in this market**, and CP1's target band was set without
   testing whether it was achievable. This would invalidate an assumption carried
   forward from the proposal.

Distinguishing between them is listed as future work in Section 5.2.2, and it
matters more than it might appear: the answer determines whether expanding the
catalog is a fix or simply more of the same.

## 4.9 Achievement against the objectives, and what changed

| Objective | Evidence | Status |
|---|---|---|
| 1. Logic-driven configurator with a constraint engine | 713-line engine, 7 rule categories, 99.44% reduction, 20/20 hand-check agreement, no invalid build ever emitted | **Achieved** |
| 2. Retrieval-augmented translation of sensory intent | Both semantic-gap cases closed and reproducible; no invented component in any run; colour extraction 5/5 in both implementations | **Achieved** |
| 3. Full-stack application with social features | Accounts, saved builds, publishing and a threaded gallery with AI replies delivered; one-click cloning not delivered | **Substantially achieved** |

Three things promised in CP1 changed during implementation. Before detailing
them, one point of accuracy: the 2D visual builder and the acoustic library
appear in CP1 §1.4 as proposed *modules*, not among the three formal objectives
in §1.3. They were nonetheless promised, and are accounted for here rather than
allowed to disappear on a technicality.

**The 2D layered visual builder was removed.** Two factors drove this. The first
was feasibility: the approach needs photographically consistent layered images for
every component in every category, which was not achievable in the time
available. The second, and more important, was evidence. The measured weakness at
the project mid-point was recommendation accuracy, not visual feedback, and the
literature reviewed in Chapter 2 gives only qualified support for rich
visualisation — Geelhaar and Rausch (2014) note the cost of high-fidelity visual
assets, and Ya and Xing (2021) report diminishing returns relative to that cost.
The freed capacity went into semantic retrieval, the agent architecture and the
evaluation suite, which produced the gains reported in Section 4.4.

**User testing then showed the decision carried a real cost.** Finding 4 — the
design is too plain, with little visualisation — was raised independently and
unprompted by testers. It corroborates the need-for-touch and visual-compensation
literature from Chapter 2, particularly Jiang et al. (2024) on sensory
substitution, from the opposite direction: removing the visual channel produced
exactly the dissatisfaction that literature predicts.

**This is reported as a limitation, not a vindication.** The trade-off had a
measurable cost on both sides — a gain in recommendation quality, a loss in
perceived richness — and saying so is a genuine Design Science Research finding
rather than a defence of the original decision.

**The acoustic library was not implemented.** The same capacity constraints
applied, compounded by its dependence on recording or licensing consistent audio
samples under controlled conditions — a data-collection problem of similar scale
to the visual asset problem. The data model anticipates it: a sound URL field and
a dedicated sound-samples table both exist in the schema, entirely unpopulated.
Its absence is a genuine limitation, because Chapter 2 establishes sensory
verification as a real market barrier, and it is accordingly the first item of
future work.

**Community cloning was partially delivered.** Publishing, browsing and threaded
discussion with in-context AI replies were built. One-click cloning of another
user's build was not. Following Wang and Yu (2017) on observational learning, the
gallery delivers the inspiration half of the social proof mechanism, but the
frictionless path from seeing a build to owning it is missing.

## 4.10 Threats to validity

Every study has limits. Stating them precisely is more useful than stating them
apologetically.

**The evaluation ground truth was written by the researcher, who is also the
domain expert.** It is grounded in real commercial sales experience, which is a
genuine strength, but it carries an obvious risk: the test cases may encode the
same assumptions as the system they evaluate. Independent expert review would
address this and is listed in Section 5.2.7.

**The test suite does not cover what its headline number implies.** Of 257 tests,
42 are skipped — all for the same single reason, having been pinned to an older
catalog and never restored after it was replaced. The disabled set includes ten
tests in the rule engine's own suite, among them the basic valid-build case, both
kit-integrity tests, the stabiliser rule, and both tests distinguishing warnings
from errors. Of the seven validation categories, **kit integrity, stabiliser
compatibility and the preference-warning layer have no active unit test at all.**
Also disabled are tests asserting that recommendations contain no invented
claims, that explanations stay grounded in real component data, that
recommendations survive an OpenAI outage, and that budgets are enforced.

Those properties **are** verified — by the exhaustive sweep, the independent
hand-check and the conformance runs, which are arguably stronger evidence because
they are exhaustive rather than exemplary. A unit test asserts one case; the
sweep tests every case the catalog admits. But **"215 tests passed" must not be
read as covering them**, and this report does not use it that way. Restoring the
fixtures is future work, and the component identifiers needed already exist in
the committed benchmark output.

**Two implemented rules are unreachable with this catalog**, as reported in
Section 4.2.3. This compounds the coverage gap above rather than sitting beside
it.

**The catalog is small.** Sixty components may not generalise. Semantic retrieval
faces more competing candidates as a catalog grows, and the reduction ratios in
Section 4.3 are specific to this catalog's exact composition.

**Colour coverage is partial.** All five keycap sets carry colour tags; none of
the seven cases do, because that information does not exist in any product name,
description or vendor URL, and it was not invented. A case therefore cannot
currently rank up for its colour — though the system behaves correctly with tags
absent, which was one of the three unit-tested properties in Section 4.5.2.

**Language model output is non-deterministic**, quantified in Section 4.4.4 as a
three-case swing on a ten-case suite. Every semantic figure in this chapter is
reported as an average with the observed range across three or more runs, never
as a single run.

**Latency measurements are environment-specific.** Figures were taken on the
development machine and in a containerised Linux environment. Both are reported
where they differ, and neither represents a production deployment.

Finally, a methodological note. Cross-checking independent measurements against
each other was used deliberately as an error-detection technique, and it caught
two real faults: a pricing calculation that disagreed with the recommendation
service's own output, and a set of latency figures that had drifted from the raw
data they came from. The working rule was that **when two measurements of the
same system disagree, the disagreement is a defect in the measurement until
proven otherwise** — never a finding.
