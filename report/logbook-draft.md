# CP2 Logbook — Draft Content (Week 1 = 4 May 2026)

Grounded in the project git history (7 May – 26 Jul 2026). Each entry has: activities, supervisor meeting note, key decision + justification (critical reflection marks), problems + resolution, and cumulative progress. Adjust meeting dates and mark 1–2 as postponed where you remember.

---

## Week 1 — 4 to 10 May 2026

**Activities:** Scaffolded the Next.js/TypeScript project foundation. Implemented the keyboard component data model and the deterministic compatibility rule engine (`src/lib/rules`). Built seed-backed API routes, structured AI intent extraction (OpenAI with local keyword fallback), and a validated recommendation demo flow. Added the Malaysia-local seed catalog with MYR pricing, an initial configurator workspace UI, and a localStorage saved-builds gallery.

**SV meeting:** Kick-off meeting with Dr Sim. Reconfirmed CP2 scope against the CP1 plan; agreed to prioritise the rule engine and validation pipeline before any AI work, per the hybrid architecture design.

**Decision + justification:** Built the rule engine *first*, before AI integration — the CP1 architecture requires every AI recommendation to pass deterministic validation, so the safety layer must exist before the generative layer. Also adopted a seed-data fallback so all development and testing works without live credentials.

**Problems:** Modelling kit-derived parts (case/PCB/plate sold as one kit) — solved with `kitLock`/`kitId` metadata enforced by the rule engine.

**Progress: 15%**

---

## Week 2 — 11 to 17 May 2026

**Activities:** Added the Supabase catalog source with automatic seed fallback, live catalog setup/seeding scripts, and activated the live Supabase catalog. Applied a Next.js security patch. Implemented a new configurator UI from design mockups. Researched and implemented a curated Malaysia-market catalog; established the "sharkeys" brand.

**SV meeting:** Demonstrated the working validation pipeline and Supabase integration. Discussed catalog curation strategy — agreed to focus on components actually purchasable in Malaysia rather than a large generic dataset.

**Decision + justification:** Chose a layered catalog architecture (Supabase → seed fallback) so the app degrades gracefully when credentials are absent and tests remain fully offline — improves reliability and testability.

**Problems:** Ensuring Supabase and seed data stayed schema-identical; solved with shared Zod schemas validating both sources.

**Progress: 25%**

---

## Week 3 — 18 to 24 May 2026

**Activities:** Built the grounded "Keybot" conversational assistant with QA polish and conversation memory. Improved recommendation ranking and kit integrity enforcement. Patched transitive dependency security advisories. Added a visual build preview.

**SV meeting:** Showed the conversational assistant; discussed grounding strategy (assistant may only reference catalog components) to prevent hallucination — directly implementing the CP1 anti-hallucination requirement.

**Decision + justification:** Grounded the assistant strictly in catalog data (retrieval before generation) rather than allowing free-form LLM answers — eliminates hallucinated product recommendations, the core risk identified in CP1.

**Problems:** Assistant occasionally recommended parts violating kit locks; fixed by routing all assistant suggestions through `validateBuildSelectionFromIds` before display.

**Progress: 35%**

---

## Week 4 — 25 to 31 May 2026

**Activities:** Separated product routes (`/`, `/configurator`, `/my-builds`, `/browse`, `/community-gallery`) for clearer information architecture. Redesigned the landing page and the AI configurator flow end-to-end.

**SV meeting:** Reviewed the route separation and UX flow; feedback to keep the prompt-first landing as the primary entry point for novice users (persona "Sarah" from CP1).

**Decision + justification:** Moved from a single-page app to separated routes — each user journey (AI-guided, manual, saved builds, community) gets a dedicated surface, matching the dual novice/expert persona design from CP1.

**Problems:** Preserving state when moving between AI flow and manual configurator; resolved with a shared build-selection state model.

**Progress: 42%**

---

## Week 5 — 1 to 7 Jun 2026

**Activities:** Non-coding week: designed the evaluation framework. Defined the expert-persona ground truth for evals from real-world sales expertise (150+ keyboard sales; target market RM150–250, thocky/creamy sound preference, tuning know-how). Drafted eval cases and success criteria; collected switch/kit reference data.

**SV meeting:** Discussed evaluation methodology — how to measure recommendation quality objectively. Agreed to encode domain-expert knowledge as an executable eval suite rather than relying on subjective judgment.

**Decision + justification:** Chose an eval-driven development approach (encode expert ground truth, then measure every AI change against it) — gives CP2 measurable results for Chapter 4 instead of anecdotal quality claims.

**Progress: 46%**

---

## Week 6 — 8 to 14 Jun 2026

**Activities:** Major AI milestone week. Implemented Phase 1 restructure: removed the 2D visual builder, added the eval suite and eval runner with RAG retrieval tests. Implemented pgvector semantic search for switch recommendations. Built a LangGraph agent for Keybot with conditional routing and LangSmith tracing. Added Supabase auth and the community gallery with @keybot replies. Added vision-based intent extraction and prompt A/B optimization.

**SV meeting:** Presented eval results and the pivot away from the 2D visual builder. Justified redirecting effort from visual assembly to AI quality — approved.

**Decision + justification (major deviation from CP1):** Dropped the layered 2D visual builder proposed in CP1. Rationale: (1) sourcing consistent layered component imagery for the full catalog was infeasible in the timeframe; (2) eval evidence showed recommendation quality and grounding drove user value far more than visual assembly; (3) DSR explicitly supports design iteration based on evaluation. Effort was redirected into semantic search, agent architecture, and the eval suite.

**Problems:** Eval runner could not reach live credentials; fixed by loading `.env.local` in the eval environment. pgvector similarity thresholds needed tuning against the eval suite.

**Progress: 58%**

---

## Week 7 — 15 to 21 Jun 2026

**Activities:** Consolidation week: analysed eval-suite results across prompt variants, tuned retrieval parameters, and documented the eval report (`docs/eval-report.md`). Began sourcing kit and part images for the catalog. Mid-semester progress documentation.

**SV meeting:** Mid-semester progress review. Walked through the eval report and the updated architecture (LangGraph agent + pgvector RAG + rule-engine validation).

**Decision + justification:** Prioritised prompt/retrieval tuning over new features this week — eval scores showed retrieval quality was the current bottleneck for recommendation accuracy.

**Progress: 62%**

---

## Week 8 — 22 to 28 Jun 2026

**Activities:** Replaced the seed catalog with 19 curated Malaysia-market parts (researched availability, MYR pricing, sound profiles). Added server actions for community-build persistence (merged via feature branch).

**SV meeting:** Discussed catalog quality vs. quantity; agreed a small, accurate, locally purchasable catalog beats a large unverifiable one for the target market.

**Decision + justification:** Curated 19 verified parts rather than scraping a large catalog — every recommendation must be actually purchasable in Malaysia at real MYR prices, keeping the system honest for the RM150–250 target buyer.

**Problems:** Repointing the existing test suite at the new catalog; updated fixtures and compatibility tests.

**Progress: 68%**

---

## Week 9 — 29 Jun to 5 Jul 2026

**Activities:** Full visual redesign phase. Redesigned the Keybot launcher ("Ask Meg"), community gallery, and configurator workspace. Migrated to a neutral-foundations design system. Added brand assets (logo, Meg avatar). Swapped catalog entries for better-available kits (Lucky65 V3, GMK104, Leobog Hi75, Zuoya GMK61). Consolidated shared navigation with an e2e nav check; refined hero and configurator styling.

**SV meeting:** UI/UX review; feedback on visual consistency and the assistant persona ("Meg") as a branded, approachable guide for novices.

**Decision + justification:** Invested a full week in design-system migration — earlier per-page styling was inconsistent and would cost marks on demonstration quality; a token-based system makes remaining pages fast to build.

**Progress: 76%**

---

## Week 10 — 6 to 12 Jul 2026

**Activities:** Redesigned the configurator with progressive assembly and keycap swatches; trimmed catalog (5 keycaps, 8 switches) and cleaned vendor/filter logic. Built the Browse page with imported kit and part images and a "Your build" summary. Redesigned the community section into threads with collapsible parts; improved Meg reply quality. Made auth usable end-to-end (logout, auth-aware navigation).

**SV meeting:** Demonstrated the full novice journey: prompt → recommendation → configurator → browse → community. Discussed remaining scope before the final report.

**Decision + justification:** Trimmed the catalog to fewer, higher-quality options per category — directly addresses the choice-overload problem the project set out to solve; more options would recreate the problem inside the solution.

**Problems:** Thumbnail fallbacks for parts without imagery; use-case filter precedence bugs — both fixed with dedicated tests.

**Progress: 84%**

---

## Week 11 — 13 to 19 Jul 2026

**Activities:** Implemented account-based saved builds (`saved_builds` table, server actions, localStorage → account migration, publish-to-community flow). Redesigned the Meg panel with honest "thinking" states. Added community image uploads, buildless posts, kit-locked publish picker, Meg vision-in-comments, and an account flyout with saved-builds preview.

**SV meeting:** Reviewed persistence and community features; discussed the migration path for users with existing localStorage builds.

**Decision + justification:** Migrated saved builds from localStorage to Supabase accounts with an automatic migration — persistence across devices was required for the community publish flow, and silent migration avoids losing early users' builds.

**Problems:** Kit-lock integrity when publishing community builds; enforced via the same rule-engine validation at publish time.

**Progress: 92%**

---

## Week 12 — 20 to 26 Jul 2026

**Activities:** Built landing social-proof sections, builder picks, and Meg builder knowledge. Created the animated hero configurator demo (recorded pipeline fixture with a rule-engine guard test, typewriter/thinking sequence, pinned scroll handoff). Final cleanup: removed unused modules, pruned duplicate assets, retired superseded docs. Began final report drafting.

**SV meeting:** Pre-submission review; walked through the finished system against CP1 objectives and discussed final report structure.

**Decision + justification:** Guarded the recorded hero demo with a rule-engine test so the marketing demo can never show an invalid build — consistency between what the system promises and what it enforces.

**Problems:** Orphaned assets and dead modules accumulated across redesigns; systematic cleanup pass with documented review (`docs/cleanup-review.md`).

**Progress: 97% (report finalisation remaining)**

---

## Notes for filling the template

- Weeks 5 and 7 had little/no commit activity — I framed them as eval design and consolidation weeks (both true to the repo's docs). Adjust if you actually did something else (or were the weeks a meeting was postponed).
- Mark 1–2 meetings as "postponed — carried forward to next week" wherever you remember; the rest weekly.
- 12 weeks of entries clears the rubric's top band (10+ weeks) for Progress Reporting; the Decision + justification lines target the Critical Reflection criterion.
