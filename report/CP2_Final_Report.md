# Abstract

The shift from mass production to mass personalisation in e-commerce has created choice overload and decision fatigue in technically complex markets, and the custom mechanical keyboard market is a clear example. Beginners face a semantic gap between the sensory language they use to describe what they want, such as "thocky" or "creamy", and the technical specifications that determine whether a set of components will physically assemble. Conventional filtering systems cannot bridge this gap, while Large Language Models (LLMs) can interpret intent but fabricate technical details. This project designed, developed and evaluated Sharkeys, a web-based AI-assisted keyboard configuration platform built on a hybrid neuro-symbolic architecture in which a deterministic rule engine holds sole authority over compatibility and the AI layer is restricted to interpretation and explanation. Following the Design Science Research (DSR) methodology, the system was implemented as a Next.js and TypeScript application with a Supabase (PostgreSQL) catalog, an OpenAI intent-extraction pipeline, pgvector semantic retrieval and a LangGraph agent, all validated by a 622-line compatibility engine. Evaluation used a purpose-built suite of 52 test cases encoding domain expertise from over 150 real keyboard sales, supported by 182 automated unit and component tests and 19 end-to-end tests. Results show total passing cases rose from 34 at the deterministic baseline to 46 with the full stack, hard failures fell from 12 to 2, and structured prompt engineering raised intent extraction from 92.2% to 100% mean pass rate across three runs. The two documented semantic-gap cases that keyword search could not resolve were both closed by vector retrieval. Critically, no evaluation gain came from relaxing validation; the rule engine rejected every incompatible configuration throughout. The project demonstrates that generative guidance can be safely deployed in a domain requiring strict physical correctness when constrained by deterministic logic, and contributes a reproducible evaluation framework for measuring recommendation quality in sensory-driven product domains.

---

# Chapter 1: Introduction

## 1.1 Background Study

E-commerce has moved from mass production, where manufacturers determine what consumers can buy, towards mass personalisation, where the consumer becomes an active participant in designing the product. This shift is most visible in hobbyist markets built around high-performance equipment, such as custom gaming computers, and it has extended firmly into custom mechanical keyboards. What began as a niche interest has grown into a large international community of students, office workers and creators who treat the keyboard not as a commodity input device but as a personalised peripheral tuned to a specific sound and typing feel.

This freedom carries a cost. A custom keyboard is not a single unit but an assembly of interdependent subsystems. The case determines mounting style and acoustic behaviour, the printed circuit board (PCB) governs electronics and switch support, the plate influences flexibility and typing sound, the switches determine tactile response, and the keycaps affect both appearance and acoustics. Each component imposes constraints on the others, producing a combinatorial space that a newcomer cannot reasonably navigate.

The difficulty is compounded by community vocabulary. Enthusiasts describe sound in abstract sensory terms, calling a deep low-pitched sound "thocky" or a smooth muted sound "creamy". These terms carry real meaning within the community but have no direct representation in a product database, which stores materials, mount types and switch technologies. The resulting disconnection between user intent and machine-readable specification is the semantic gap that this project addresses.

## 1.2 Problem Statement

The central problem is the paradox of choice. A large inventory theoretically maximises personalisation, but in practice exceeds the cognitive capacity of the buyer and produces decision fatigue. The failure affects novice and expert users differently.

Novice users face both financial and psychological risk. They cannot mentally simulate the outcome of their choices, so they cannot predict how a brass plate will differ acoustically from an aluminium one. They also encounter hard technical failures, such as pairing a soldered PCB with a case designed for a hot-swap assembly, which makes the build impossible to complete. Their usual recourse is to search fragmented and often contradictory information across forums and videos, then attempt to reconcile it themselves.

Expert users face a different failure, namely workflow inefficiency. Domain knowledge allows them to validate compatibility, but the process is repetitive and error-prone, requiring cross-referencing of vendor datasheets to confirm tolerances such as whether a stabiliser will foul a particular keycap profile.

From a computing perspective, both failures stem from the same architectural gap. Existing tools are either purely logic-driven systems that cannot interpret sensory language, or generative systems that interpret language fluently but lack domain grounding and fabricate technical details. Neither alone is sufficient, which establishes the need for a hybrid system combining conversational interpretation with deterministic constraint enforcement.

## 1.3 Aim and Objectives

The aim of this project is to design, develop and evaluate an AI-assisted custom keyboard configuration platform that centralises the building process and uses a hybrid architecture to make the domain accessible regardless of prior expertise.

Three objectives support this aim:

**Objective 1.** To engineer a logic-driven product configurator containing a constraint satisfaction engine that prevents physically incompatible component selections across all catalog categories.

**Objective 2.** To architect a retrieval-augmented recommendation system that translates natural-language sensory intent into validated technical specifications, eliminating hallucinated components by grounding all generation in a local product catalog.

**Objective 3.** To develop a full-stack web application with account-based persistence and social commerce features that allow users to save, publish and learn from community builds.

## 1.4 Scope and Limitations

The system is scoped as a configurator rather than a retail platform. It handles configuration logic, intent interpretation and guidance through assembly, and deliberately excludes payment processing, inventory management and order fulfilment. The output of a completed configuration is a bill of materials with vendor references rather than a purchase transaction.

The catalog is curated rather than exhaustive. Rather than attempting to index every component available worldwide, the database holds a representative set of parts verified as available in the Malaysian market and priced in Malaysian Ringgit (MYR). This directs development effort towards the compatibility logic, which is the research contribution, rather than towards data collection volume. All pricing is sourced from local vendor listings rather than converted from United States Dollar (USD) reference data, because shipping and import costs materially change what a Malaysian buyer actually pays.

The platform targets desktop browsers. The interface adapts to smaller screens, but the configurator workspace assumes a desktop viewport. The system depends on an external LLM provider, which introduces availability risk; this is mitigated through a deterministic local fallback described in Chapter 3.

The delivered artefact is a functional prototype demonstrating the architecture, not a production system hardened for commercial deployment.

## 1.5 Research Significance

The immediate contribution is practical. The steep learning curve in this domain excludes potential participants, and a system that removes compatibility risk lowers that barrier directly.

For e-commerce more broadly, the project demonstrates a pattern for reducing cart abandonment in technically complex purchases, where hesitation stems from a lack of confidence rather than a lack of interest. Preventing incompatible purchases before checkout also reduces return logistics, which carries a sustainability benefit aligned with Sustainable Development Goal 12 on responsible consumption and production, since returned and discarded incompatible components represent avoidable electronic waste and shipping emissions.

From a computer science perspective, the project contributes to human-computer interaction and applied AI by addressing hallucination in LLMs applied to engineering constraints. By constraining a probabilistic generative model with a deterministic logic engine, the work serves as a case study in deploying generative AI in a domain where physical correctness is non-negotiable. The evaluation framework developed in Chapter 3, which encodes practitioner expertise as executable test cases, is itself transferable to other sensory-driven product domains.

## 1.6 Changes from the CP1 Proposal

Because this report documents implementation against a proposal written in the preceding semester, the deviations are stated here explicitly and are justified in detail in Section 4.7.

| CP1 Proposal | CP2 Outcome | Status |
|---|---|---|
| Interactive 2D layered visual builder | Static component preview with product imagery | Removed |
| Acoustic library with A/B sound comparison | Not implemented | Deferred |
| One-click clone of community builds | Publishing and browsing implemented; clone deferred | Partial |
| Rule engine and RAG recommendation | Implemented and evaluated | Delivered |
| Community repository | Implemented with threaded discussion and AI replies | Delivered |
| — | Evaluation suite of 52 domain-expert test cases | Added |
| — | Vision-based intent extraction from images | Added |
| — | LangGraph agent architecture with tracing | Added |

These changes were made during development, discussed with and approved by the project supervisor, and are consistent with the DSR methodology, which treats design as iterative and revisable in response to evaluation.

---

# Chapter 2: Literature Review

## 2.1 Choice Overload and Decision Fatigue

The foundational tension in mass personalisation is that increased choice does not monotonically increase satisfaction. Huffman and Kahn (1998) framed this as the difference between mass customisation and mass confusion, observing that variety becomes counterproductive when it exceeds the consumer's processing capacity. Chernev (2003) demonstrated that the availability of a clear ideal point moderates this effect, which is precisely what a novice keyboard buyer lacks. Scheibehenne, Greifeneder and Todd (2010) provided a meta-analytic view showing choice overload is real but conditional, occurring most reliably when the decision is complex and the chooser lacks domain expertise. Saltsman et al. (2019) added a motivational dimension, showing that overload is experienced as threat rather than challenge when perceived task demands exceed perceived resources. Simon's (1955) model of bounded rationality underpins all of this, and Inbar, Botti and Hanko (2011) show that decisions made under time pressure produce regret. For this project, the implication is that the system must reduce the number of viable options presented rather than expose the full catalog.

## 2.2 Limitations of Conventional Recommender Systems

Collaborative filtering, the dominant commercial approach, depends on interaction density that a niche market cannot supply. Panteli and Boutsinas (2023) survey the cold-start problem directly, and Sarkar (2025) shows that hybrid content-and-collaborative approaches only partially mitigate it. Constraint-based and knowledge-based recommenders offer a better structural fit. Felfernig and Burke (2008) and Felfernig et al. (2014) establish that configuration problems with hard compatibility constraints are properly handled as constraint satisfaction rather than similarity ranking, and Uta et al. (2024) survey current directions in this area. Geuens, Coussement and De Bock (2018) provide a framework for configuring recommenders to specific contexts. The literature therefore supports a knowledge-based core, but knowledge-based systems require the user to express requirements in system vocabulary, which returns the problem to the semantic gap.

## 2.3 The Semantic Gap and Language Models

Mandal, Tunkelang and Wu (2023) analyse semantic equivalence in e-commerce queries, showing that lexical matching fails when buyers and catalogs use different vocabularies. LLMs address this, and Lewis et al. (2020) established retrieval-augmented generation (RAG) as the mechanism for grounding generation in an external corpus. Chen et al. (2023) and Xu et al. (2025) extend RAG into e-commerce search specifically, the latter addressing noisy retrieval. Jannach et al. (2021) and Sun and Zhang (2018) survey conversational recommenders, while Wang et al. (2023) argue that evaluation methods for such systems must be rethought in the LLM era, a point that directly motivated this project's evaluation design. The counterweight is hallucination: Yaprak (2024) documents fabrication as a material commercial risk. Huang et al. (2025) explore recommender AI agents, and Pradier et al. (2021) demonstrate architectures that defer to human expertise where it is available. The synthesis is that language models should interpret and explain, but must not be trusted to assert technical facts.

## 2.4 Human-Computer Interaction and Social Commerce

Rathee and Rajain (2019) and Zheng and Bensebaa (2022) establish need for touch (NFT) as a barrier in online purchasing of sensory goods, with Zheng and Bensebaa showing emotional state moderates the effect. Jiang, Luo and Zheng (2024) examine tactile compensation, and Algharabat (2010), Geelhaar and Rausch (2014) and Ya and Xing (2021) compare 2D and 3D product visualisation, generally finding that added dimensionality yields diminishing returns relative to its computational cost. On social commerce, Wang and Yu (2017) model observational learning and word of mouth in purchase decisions, Lu et al. (2021) confirm the effect of online observational learning, Lin, Wang and Hajli (2019) connect social features to satisfaction and sales, and Park and McCallister (2022) examine social proof as a nudge. Ferraro et al. (2024) note the paradoxes accompanying these tactics. Collectively this literature justifies treating a community gallery as a functional decision-support component rather than a cosmetic addition.

## 2.5 Research Gap

The reviewed literature treats these areas largely in isolation. Constraint-based configuration is well developed for functional engineering products, and conversational recommendation is well developed for general retail, but there is little work combining strict engineering validation with sensory intent interpretation. Existing studies address either functional products, where correctness matters but sensory preference does not, or aesthetic products, where preference matters but physical compatibility is trivial. Custom keyboards sit at the intersection, requiring both.

No existing platform unifies AI guidance, compatibility logic and community social proof in a single system; users currently fragment their process across forums for advice, videos for sound evaluation and separate vendors for parts. This project addresses that gap, and additionally contributes an evaluation methodology for measuring recommendation quality in a domain where correctness is partly subjective.

---

# Chapter 3: Methodology

## 3.1 Research and Development Paradigm

The project follows Design Science Research (DSR), which is appropriate because the output is a designed artefact evaluated against defined criteria rather than an empirical study of an existing phenomenon. DSR proceeds through cycles of problem identification, design, demonstration and evaluation, with each evaluation informing the next design iteration. This property proved material in practice: the removal of the 2D visual builder described in Section 4.7 was an evaluation-driven design revision of exactly the kind DSR anticipates.

Development followed an incremental, phase-based approach with each phase implemented on a separate version control branch and validated before merging. Fourteen numbered development phases were completed across the semester, progressing from data modelling through the rule engine, API layer, catalog, AI integration, evaluation and interface work.

## 3.2 Requirements

**Functional requirements.** The system shall accept natural-language descriptions of desired keyboards and translate them into structured requirements; retrieve candidate components from a curated catalog; validate every proposed configuration against physical compatibility rules before presentation; allow manual component selection with live validation; support user accounts with persistent saved builds; and allow builds to be published to and browsed within a community gallery.

**Non-functional requirements.** Compatibility validation shall be deterministic and reproducible, returning identical results for identical inputs. The system shall degrade gracefully when external services are unavailable. No recommendation shall reference a component absent from the catalog. Prices shall be expressed in MYR and reflect local vendor listings.

## 3.3 System Architecture

The application is a Next.js 16 project using the App Router with React 19 and TypeScript throughout, providing end-to-end type safety. Persistence uses Supabase (PostgreSQL) with the pgvector extension for embedding storage. Zod supplies runtime schema validation at every boundary where untrusted data enters the system, including both external API responses and LLM output. Styling uses Tailwind CSS with a shared design token system.

The request pipeline is deliberately linear and is the structural expression of the project's central claim:

```
User prompt
  → /api/recommendations
  → src/lib/ai            (intent extraction: OpenAI, or local keyword fallback)
  → src/lib/recommendations  (assemble candidate builds from catalog)
  → src/lib/rules            (validateBuildSelectionFromIds)
  → deterministic ranking → optional AI explanation
```

Validation sits inside the recommendation path rather than alongside it. An unvalidated build has no route to the user interface, so the guarantee is enforced by architecture rather than by developer discipline.

## 3.4 Compatibility Rule Engine

The rule engine (`src/lib/rules/compatibility.ts`, 622 lines) is the sole authority on compatibility. It evaluates a complete build rather than checking components pairwise, because several failure modes only appear at the level of the whole assembly. It performs seven categories of validation:

1. **Layout compatibility** — case, PCB and plate must share a common physical layout.
2. **Preferred layout** — the assembled build must satisfy any layout the user explicitly requested.
3. **Mount compatibility** — case and PCB, and case and plate, must share a supported mounting style.
4. **Kit structural integrity** — components derived from a single kit must all originate from the same kit.
5. **Switch compatibility** — switch technology must be supported by the PCB and the plate cutouts.
6. **Keycap compatibility** — keycaps must support the build layout and the selected switch technology.
7. **Stabiliser compatibility** — stabiliser type must be supported by the PCB and sized for the layout.

A separate advisory layer produces non-blocking warnings, for example when a component's sound profile diverges from the user's stated preference. The distinction matters: hard incompatibilities block the build, while preference mismatches inform the user without overriding their judgment.

Rule 4 deserves particular note as it emerged from the domain rather than from physics. Many keyboards are sold as kits containing case, PCB, plate and stabilisers together. Two such components may be physically compatible yet cannot be purchased separately, so recommending that combination would be technically valid and practically useless. Kit-derived parts therefore carry `kitLock` and `kitId` metadata that the engine enforces.

## 3.5 AI Pipeline

Intent extraction converts a sentence such as "quiet keyboard for the office, budget RM250" into structured fields. The LLM output is validated against a strict Zod schema and rejected if it does not conform, rather than being passed through and failing later. When no API key is configured, a deterministic keyword extractor supplies a reduced but functional result, satisfying the graceful degradation requirement and allowing the entire test suite to run offline.

Retrieval uses pgvector similarity search over component description embeddings, which allows sensory phrasing to reach appropriate components without exact lexical matching. This directly targets the semantic gap identified in Section 2.3.

The conversational assistant is implemented as a LangGraph agent with an explicit state graph of classify → extract → retrieve → validate → compose, with the rule engine wired in as the `validate` node. LangSmith tracing records each step, making the reasoning path inspectable. The graph structure was chosen over a linear pipeline because it makes the validation step a mandatory, visible node rather than an optional call.

## 3.6 Data and Catalog Design

The catalog holds 42 component records across six categories: cases (6), PCBs (6), plates (6), switches (8), keycaps (5) and stabilisers (11). Each record carries technical specification fields required by the rule engine and descriptive fields, including sound profile, used by retrieval.

Catalog loading is layered. `loadCatalogComponents()` returns Supabase data when credentials are configured and valid, and otherwise falls back to an identical seed dataset. Both sources are validated against the same schema, so divergence fails immediately rather than silently. This design makes the entire test suite runnable without credentials or network access.

## 3.7 Evaluation Strategy

Because recommendation quality in this domain is partly subjective, evaluation required an explicit ground truth. This was constructed from the researcher's own domain expertise, derived from over 150 completed keyboard sales in the Malaysian market, encoding the RM150–250 target range, the sound profiles buyers most commonly request, and component combinations known to perform well in practice.

Three evaluation suites were built, comprising 52 cases in total:

- **Intent Extraction (30 cases)** — does the system correctly parse budget, layout, use case and sound preference from natural language?
- **Keybot Grounding (10 cases)** — does the assistant answer only from catalog data without fabricating components?
- **RAG Retrieval (10 cases)** — does semantic retrieval return appropriate components for sensory phrasing?

Each suite runs in two modes: an offline deterministic baseline using keyword fallback only, and a full-stack mode using the complete AI pipeline. This yields a controlled comparison isolating the contribution of each AI component.

Automated testing supplements this with 182 unit and component tests across nine areas and 19 Playwright end-to-end tests covering the main user journeys.

**User acceptance testing** was designed as a structured questionnaire administered to participants representing the two target personas. The instrument and results are reported in Section 4.6.

## 3.8 Computing Factors and Constraints

**Performance.** Rule validation is synchronous, in-memory and deterministic, avoiding network round-trips in the validation path. Candidate builds are filtered by budget and category before validation to bound the number of configurations evaluated.

**Security.** The Supabase service role key is confined to server-side seeding scripts and never exposed to client code. Authentication uses Supabase Auth with server-side session handling. Uploaded images for vision intent are processed in memory and not persisted.

**Ethics.** All catalog data is drawn from public vendor listings. No personal data beyond account credentials and user-authored build content is collected. AI-generated explanations are presented as suggestions accompanying validated builds rather than as authoritative technical claims.

**Reliability.** Every external dependency has a defined failure mode: absent Supabase credentials fall back to seed data, and an absent API key falls back to keyword extraction. Neither failure prevents the core configurator from functioning.

---

# Chapter 4: Results and Discussion

## 4.1 Delivered System

The implemented platform comprises nine application routes and nine API endpoints, built from 110 TypeScript source modules.

| Route | Function |
|---|---|
| `/` | Prompt-first landing page with animated configurator demonstration |
| `/configurator` | AI recommendation flow and manual compatibility checking |
| `/browse` | Catalog browsing by category with filtering |
| `/my-builds` | Account-persisted saved builds |
| `/community-gallery` | Threaded community builds with AI assistant replies |
| `/login`, `/signup` | Authentication |

The AI assistant is presented to users as "Meg", a named persona chosen to make the guided experience approachable for the novice persona identified in CP1.

## 4.2 Rule Engine Results

The rule engine met Objective 1. Across all evaluation runs, in both baseline and full-stack modes, no incompatible configuration was returned to the user. This result is structural rather than statistical: because `validateBuildSelectionFromIds` sits inside the recommendation path, an invalid build cannot reach the interface. The 8 dedicated compatibility tests in `tests/rules/` cover both valid builds and each category of expected rejection, including the whole-build failure modes described in Section 3.4.

The kit integrity rule proved the most consequential in practice. Before its introduction, the system generated builds that were physically valid but commercially unobtainable, mixing structural components from different kits. This is a case where correctness required domain knowledge beyond the physical specification, and it is a finding relevant to constraint-based configuration generally: the constraint set must model how products are sold, not only how they fit.

## 4.3 Evaluation Suite Results

The headline comparison between the deterministic baseline and the full AI stack is shown below.

| Metric | Phase 1B baseline | Phase 5 final | Change |
|---|---|---|---|
| Total cases passing | 34 | 46 | +12 |
| Hard failures | 12 | 2 | −10 |
| Expected failures (semantic gap) | 2 | 0 | −2 (closed) |
| Pending (catalog seed) | 2 | 2 | — |

Per suite:

| Suite | Baseline | Final |
|---|---|---|
| Intent Extraction (30) | 20 pass / 10 fail | 30 pass / 0 fail |
| Keybot Grounding (10) | 8 pass / 2 fail | 8 pass / 2 fail |
| RAG Retrieval (10) | 6 pass / 2 expected-fail / 2 pending | 8 pass / 0 expected-fail / 2 pending |

The largest gain is in intent extraction, which moved from 20 to 30 of 30. This is consistent with the theoretical position developed in Chapter 2: the deterministic keyword extractor handles explicit specifications adequately but cannot resolve indirect phrasing, which is precisely the semantic gap that language models address.

The Keybot Grounding suite is notable for showing no change. This is the expected and desired result. Grounding is enforced by retrieval and validation rather than by model capability, so a stronger model should not improve it, and the stability of this score across the two conditions is evidence that the grounding mechanism, not the model, is doing the work. The two persistent failures (kg-008, kg-010) require curated expert knowledge on specific budget recommendations and lubrication technique that is not present in the catalog grounding layer, and were deliberately deferred.

## 4.4 Prompt Engineering Results

A controlled A/B comparison of three prompt variants was run across three repetitions of all 30 intent cases.

| Variant | Mean pass rate | Field accuracy |
|---|---|---|
| Baseline | 92.2% | 98.0% |
| **Structured (adopted)** | **100.0%** | **100.0%** |
| Conversational | 96.7% | 99.1% |

The structured variant encodes explicit mapping rules for the failure patterns observed in the baseline: game titles map to the gaming use case, "working from home" maps to office use, budget ranges resolve to the maximum value, descriptive sound terms map to catalog sound profiles, and — a specific trap in this domain — "65%" is recognised as a layout specification rather than a budget figure. This variant was adopted as the system default.

The result supports a practical conclusion. The performance difference between variants was achieved without changing the model, the catalog or the retrieval mechanism. In a constrained domain, encoding domain-specific disambiguation rules into the prompt is a more efficient intervention than model substitution.

## 4.5 Semantic Retrieval and the Research Question

Two evaluation cases (rr-007, rr-008) were documented from the outset as expected failures, representing exactly the semantic gap defined in Section 1.1. In these cases users describe a desired sound in sensory language — "buttery smooth", "deep thud" — with no lexical overlap with the catalog's technical vocabulary. Keyword retrieval could not resolve them by construction.

Both cases moved from expected-fail to pass once pgvector embeddings were seeded, with "buttery smooth" correctly retrieving creamy linear switches and "deep thud" retrieving thocky components.

This is the most direct empirical answer to the project's research question. It demonstrates the semantic gap is measurable, that it is not resolvable by lexical means, and that vector retrieval over component descriptions closes it — while the rule engine continues to guarantee that the retrieved components form a physically valid build. The two mechanisms are complementary rather than competing: retrieval widens the candidate space in a way keyword matching cannot, and validation narrows it in a way generation cannot be trusted to do.

Two further cases (rr-009, rr-010) remain pending because they require catalog records not yet seeded, and are reported as pending rather than failing since they test data coverage rather than system logic.

## 4.6 User Acceptance Testing

*[This section is to be completed following the user testing scheduled for Weeks 13–14. The structure below is prepared for the collected data.]*

### 4.6.1 Participants

| Participant group | Description | Target n |
|---|---|---|
| Novice | No prior custom keyboard experience | |
| Intermediate | Owns a pre-built or entry custom keyboard | |
| Expert | Has assembled one or more custom keyboards | |

### 4.6.2 Instrument

A structured questionnaire administered after a guided task in which each participant configures a keyboard within a stated budget using the AI flow, then repeats the task manually.

| # | Construct | Item | Scale |
|---|---|---|---|
| 1 | Perceived ease of use | The system was easy to use | 1–5 Likert |
| 2 | Decision confidence | I am confident the recommended build would work | 1–5 Likert |
| 3 | Semantic translation | The system understood what I meant by my description | 1–5 Likert |
| 4 | Choice overload | I felt overwhelmed by the number of options | 1–5 Likert (reverse) |
| 5 | Trust in AI guidance | I trusted the assistant's recommendations | 1–5 Likert |
| 6 | Community value | Seeing other users' builds helped my decision | 1–5 Likert |
| 7 | Task completion | Completed within budget without assistance | Binary |
| 8 | Open response | What confused you most? | Free text |

### 4.6.3 Results

*[Response table to be inserted.]*

### 4.6.4 Discussion of UAT Findings

*[Analysis to be inserted, with particular attention to whether novice and expert participants diverge on items 1, 4 and 5, which would test the dual-persona design assumption from CP1.]*

## 4.7 Discussion of Deviations from the CP1 Proposal

Three proposed features were changed during implementation. Each is addressed below with justification, as required for an honest account of a DSR process.

**The 2D layered visual builder was removed.** The CP1 proposal specified an interactive canvas stacking layered component images by z-index to render the assembling keyboard in real time. Two factors drove its removal. First, feasibility: the approach requires photographically consistent layered assets for every component in every category, and sourcing or producing these to a usable standard was not achievable within the timeframe. Second, and more importantly, evaluation evidence indicated the effort was better directed elsewhere. The measured weakness of the system at the mid-point was recommendation accuracy, not visual feedback, and the literature reviewed in Section 2.4 offers only qualified support for rich visualisation, with Ya and Xing (2021) and Geelhaar and Rausch (2014) both reporting diminishing returns relative to implementation cost. The development capacity was redirected into semantic retrieval, the agent architecture and the evaluation suite, which produced the measurable gains reported in Sections 4.3 to 4.5. A static component preview with product photography was retained to provide basic visual confirmation. This decision was reviewed and approved by the project supervisor.

**The acoustic library was not implemented.** CP1 proposed a switch sound library with A/B comparison to address need for touch. This was deferred for the same capacity reasons and because it depends on recording or licensing consistent audio samples per switch under controlled conditions, which is a data collection problem of comparable scale to the visual asset problem. Its absence is a genuine limitation, since Section 2.4 establishes sensory verification as a real barrier, and it is accordingly the first item of future work.

**Community clone was partially delivered.** Publishing builds to the gallery, browsing them and threaded discussion with AI assistant replies were implemented. One-click cloning of another user's build into a personal workspace was not. The social proof mechanism identified in Section 2.4 is therefore present, but the frictionless adoption path is not.

Two capabilities were delivered beyond the original proposal. The evaluation suite described in Section 3.7 was not part of the CP1 plan and became the project's principal source of evidence. Vision-based intent extraction, allowing a user to upload an inspiration image that is interpreted into the same structured intent, extends the semantic translation objective into a modality not originally considered.

## 4.8 Achievement Against Objectives

| Objective | Evidence | Status |
|---|---|---|
| 1. Logic-driven configurator with constraint engine | 622-line engine, 7 validation categories, no invalid build returned in any run | Achieved |
| 2. RAG recommendation translating sensory intent | Intent extraction 20→30 of 30; both semantic-gap cases closed; no hallucinated components in grounding suite | Achieved |
| 3. Full-stack application with social features | Accounts, persistent builds, publishing, threaded gallery delivered; clone deferred | Substantially achieved |

## 4.9 Threats to Validity

Three limitations qualify these results. First, the evaluation ground truth was authored by the researcher, who is also the domain expert; while grounded in commercial sales experience, this introduces a risk that the test cases encode the same assumptions as the system. Independent expert review would strengthen the evaluation. Second, the catalog of 42 components is small, so retrieval performance may not generalise to a catalog an order of magnitude larger, where semantic similarity would face more competing candidates. Third, LLM outputs are non-deterministic; the prompt A/B used three repetitions per variant, which establishes a trend but is insufficient for statistical confidence intervals.

---

# Chapter 5: Conclusion and Future Work

## 5.1 Conclusion

This project set out to determine whether generative AI could be safely applied to a product configuration domain in which physical correctness is non-negotiable, and to build a system demonstrating that architecture in the custom mechanical keyboard market.

The three objectives were substantially met. The compatibility rule engine enforced correctness across all evaluation conditions, returning no invalid configuration in any run, and its architectural placement inside the recommendation path makes this a structural guarantee rather than a statistical observation. The retrieval-augmented recommendation layer improved intent extraction from 20 to 30 of 30 cases and closed both documented semantic-gap cases, providing direct evidence that vector retrieval bridges sensory language to technical specification where lexical matching cannot. The full-stack application delivered accounts, persistent builds and a community gallery, with clone functionality deferred.

The central finding is that the two mechanisms are complementary rather than in tension. Every measured improvement came from better interpretation and retrieval, and none from relaxing validation. This is the practical form of the neuro-symbolic argument developed in Chapter 2: the language model widens the space of requests the system can understand, while the rule engine narrows the space of answers it is permitted to give. Neither component alone would be sufficient, and the value lies specifically in the constraint between them.

A secondary contribution is methodological. Encoding practitioner expertise as an executable evaluation suite converted a subjective quality question into a measurable one, and made design decisions — including the removal of a proposed feature — defensible with evidence rather than assertion.

## 5.2 Future Work

**Acoustic library.** The highest-priority item, as it addresses a barrier the literature establishes as material and was the most significant proposed feature not delivered. Implementation requires controlled recording of switch samples and an A/B comparison interface.

**Catalog expansion with retrieval re-evaluation.** Expanding beyond 42 components would test whether semantic retrieval performance holds at scale, addressing the second validity threat in Section 4.9. This should be treated as an experiment rather than a data entry task, with the evaluation suite re-run at each scale increment.

**Expert knowledge grounding layer.** The two persistent Keybot failures require curated practitioner knowledge — specific budget recommendations and tuning technique — that catalog specifications do not contain. A separate knowledge layer, distinct from the product catalog and retrievable by the agent, would close these cases and extend the assistant from specification matching towards genuine advice.

**Independent evaluation.** Having the test cases reviewed or authored by domain experts other than the researcher would address the principal validity threat.

**Build cloning and vendor integration.** Completing the clone flow would deliver the social proof mechanism fully. Live vendor price integration would keep the MYR pricing current rather than fixed at the time of catalog curation.

---

# References

Algharabat, R. S. (2010). *Modelling 3D product visualisation for the online retailer* [Doctoral dissertation].

Chen, Z., Choi, J., Fetahu, B., Rokhlenko, O., & Malmasi, S. (2023). Generate-then-retrieve: Intent-aware FAQ retrieval in product search. *Proceedings of the 61st Annual Meeting of the Association for Computational Linguistics*.

Chernev, A. (2003). When more is less and less is more: The role of ideal point availability and assortment in consumer choice. *Journal of Consumer Research, 30*(2), 170–183. https://doi.org/10.1086/376808

Felfernig, A., & Burke, R. (2008). Constraint-based recommender systems: Technologies and research issues. *Proceedings of the 10th International Conference on Electronic Commerce*. https://doi.org/10.1145/1409540.1409544

Felfernig, A., Hotz, L., Bagley, C., & Tiihonen, J. (2014). *Knowledge-based configuration: From research to business cases*. Morgan Kaufmann.

Ferraro, C., Demsar, V., Sands, S., Restrepo, M., & Campbell, C. (2024). The paradoxes of generative AI-enabled customer service. *Journal of Business Research*.

Geelhaar, J., & Rausch, G. (2014). 3D web applications in e-commerce – A secondary study. *Proceedings of the International Conference on Web Information Systems and Technologies*.

Geuens, S., Coussement, K., & De Bock, K. W. (2018). A framework for configuring collaborative filtering-based recommendations derived from purchase data. *European Journal of Operational Research, 265*(1), 208–218. https://doi.org/10.1016/j.ejor.2017.07.005

Huang, X., Lian, J., Lei, Y., Yao, J., Lian, D., & Xie, X. (2025). Recommender AI agent: Integrating large language models for interactive recommendations. *ACM Transactions on Information Systems*.

Huffman, C., & Kahn, B. E. (1998). Variety for sale: Mass customization or mass confusion? *Journal of Retailing, 74*(4), 491–513. https://doi.org/10.1016/S0022-4359(99)80105-5

Inbar, Y., Botti, S., & Hanko, K. (2011). Decision speed and choice regret: When haste feels like waste. *Journal of Experimental Social Psychology, 47*(3), 533–540. https://doi.org/10.1016/j.jesp.2011.01.011

Jannach, D., Manzoor, A., Cai, W., & Chen, L. (2021). A survey on conversational recommender systems. *ACM Computing Surveys, 54*(5), 1–36. https://doi.org/10.1145/3453154

Jiang, K., Luo, S., & Zheng, J. (2024). Seeing as feeling? The impact of tactile compensation on online consumer behaviour. *Journal of Retailing and Consumer Services*.

Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W., Rocktäschel, T., Riedel, S., & Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. *Advances in Neural Information Processing Systems, 33*, 9459–9474.

Lin, X., Wang, X., & Hajli, N. (2019). Building e-commerce satisfaction and boosting sales: The role of social commerce trust and its antecedents. *International Journal of Electronic Commerce, 23*(3), 328–363. https://doi.org/10.1080/10864415.2019.1619907

Lu, J., Su, X., Diao, Y., Wang, N., & Zhou, B. (2021). Does online observational learning matter? *Journal of Retailing and Consumer Services, 60*, 102478.

Mandal, A., Tunkelang, D., & Wu, Z. (2023). Semantic equivalence of e-commerce queries. *arXiv*. https://doi.org/10.48550/arXiv.2308.07546

Panteli, A., & Boutsinas, B. (2023). Addressing the cold-start problem in recommender systems based on frequent patterns. *Algorithms, 16*(4), 182. https://doi.org/10.3390/a16040182

Park, S., & McCallister, J. (2022). The effects of social proof marketing tactics on nudging consumer purchase intention. *Journal of Marketing Communications*.

Pradier, M. F., Zazo, J., Parbhoo, S., Perlis, R. H., Zazzi, M., & Doshi-Velez, F. (2021). Preferential mixture-of-experts: Interpretable models that rely on human expertise as much as possible. *AMIA Summits on Translational Science Proceedings, 2021*, 525. https://doi.org/10.48550/arXiv.2101.05360

Rathee, R., & Rajain, P. (2019). Online shopping environments and consumer's need for touch. *Journal of Advances in Management Research, 16*(2), 814–826. https://doi.org/10.1108/JAMR-12-2018-0116

Saltsman, T. L., Seery, M. D., Kondrak, C. L., Lamarche, V. M., & Streamer, L. (2019). Too many fish in the sea: A motivational examination of the choice overload experience. *Biological Psychology, 145*, 17–30. https://doi.org/10.1016/j.biopsycho.2019.03.010

Sarkar, S. (2025). Development of a hybrid recommendation system using collaborative filtering and content-based filtering techniques. *IRE Journals, 8*(11), 2284–2292.

Scheibehenne, B., Greifeneder, R., & Todd, P. M. (2010). Can there ever be too many options? A meta-analytic review of choice overload. *Journal of Consumer Research, 37*(3), 409–425. https://doi.org/10.1086/651235

Simon, H. A. (1955). A behavioral model of rational choice. *The Quarterly Journal of Economics, 69*(1), 99–118. https://doi.org/10.2307/1884852

Sun, Y., & Zhang, Y. (2018). Conversational recommender system. *The 41st International ACM SIGIR Conference on Research & Development in Information Retrieval*, 235–244. https://doi.org/10.1145/3209978.3210002

Uta, M., Felfernig, A., Le, V.-M., Tran, T. N. T., Garber, D., Lubos, S., & Burgstaller, T. (2024). Knowledge-based recommender systems: Overview and research directions. *Frontiers in Big Data, 7*, 1304439.

Wang, X., Tang, X., Zhao, W. X., Wang, J., & Wen, J.-R. (2023). Rethinking the evaluation for conversational recommendation in the era of large language models. *Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing*, 10052–10065. https://doi.org/10.48550/arXiv.2305.13112

Wang, Y., & Yu, C. (2017). Social interaction-based consumer decision-making model in social commerce: The role of word of mouth and observational learning. *International Journal of Information Management, 37*(3), 179–189. https://doi.org/10.1016/j.ijinfomgt.2015.11.005

Xu, T., Yao, S., Dong, C., Jin, Y., Huang, Z., Ou, D., & Tang, H. (2025). DyKnow-RAG: Dynamic knowledge utilization reinforcement framework for noisy retrieval-augmented generation in e-commerce search. *arXiv*. https://doi.org/10.48550/arXiv.2510.11122

Ya, W., & Xing, Y. (2021). *3D product display in eCommerce websites: Study on the impact of 3D product display for the online user experience.*

Yaprak, B. (2024). Generative artificial intelligence in marketing: The invisible danger of AI hallucinations. *Ekonomi İşletme ve Yönetim Dergisi, 8*(2), 133–158. https://doi.org/10.7596/jebm.1588897

Zheng, L., & Bensebaa, F. (2022). Need for touch and online consumer decision making: The moderating role of emotional states. *International Journal of Retail & Distribution Management, 50*(1), 55–75. https://doi.org/10.1108/IJRDM-04-2020-0158
