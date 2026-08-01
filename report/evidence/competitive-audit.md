# Competitive Audit Re-Run — CP1 Instrument Applied to the Delivered System

**Source instrument:** CP1 §2.6.2, Table 2.1 "Competitive Audit of Existing Market Solutions"
**Date of re-run:** 31 July 2026
**Catalog state:** 60 seed records as committed at `e021130`; working tree unmodified at measurement time
**Method:** The CP1 dimensions and competitor set are reproduced exactly. No dimension has been added, removed or reworded. The value of this section is that it is the *same instrument* applied to the finished product, so any change in the picture is attributable to delivery rather than to a changed measure.

A **Sharkeys (delivered)** column has been added alongside CP1's **Sharkeys (proposed)** column. Every delivered cell cites concrete evidence — a route, a source file, an API endpoint or a test. **A cell with no evidence is scored NOT DELIVERED.**

---

## 1. The updated comparison table

Competitor columns are reproduced from CP1 Table 2.1 unchanged. See §4 for verified changes since CP1.

| Feature | Sharkeys (proposed, CP1) | **Sharkeys (delivered)** | MKB MY / KBDfans | KeebFinder | PC Part Picker |
|---|---|---|---|---|---|
| **Guided Workflow** | Automated Step-by-Step | **DELIVERED** — stepped configurator | Manual Catalogue Browsing | Basic Workflow | Logic-Based Workflow |
| **Compatibility Engine** | Real-Time AI Validation | **DELIVERED (deviates — see note)** — deterministic rule engine | User Responsibility (Manual) | Manual Check | High-Accuracy Logic |
| **Search Method** | AI Natural Language | **DELIVERED** — NL intent + semantic retrieval + vision | Keyword Search Only | Keyword Search Only | Keyword / Parametric |
| **Visual Interface** | Interactive Layered 2D | **PARTIAL** — schematic preview + product photography | Static Product Images | Text & List Based | Text & List Based |
| **Sound Testing** | Integrated Audio Library | **NOT DELIVERED** | None | None | N/A |
| **Community Gallery** | Full Integration | **DELIVERED** — posts, threads, in-context assistant | None | None | Extensive Gallery |
| **Clone Build** | One-Click Replication | **NOT DELIVERED** | None | None | Full Replication |
| **Sharing Method** | Persistent Unique Link | **PARTIAL** — persistent route exists, no share affordance | Cart Sharing Only | Session-Based URL | Persistent Unique Link |
| **Beginner Support** | Contextual Jargon Busters | **PARTIAL** — contextual explainers, no jargon-buster feature | None (Expert-Oriented) | Static Guides | Technical Specifications |
| **Language Support** | Multi (EN, BM, CN) | **NOT DELIVERED** — English only | English Only | Partial (EN / CN) | English Only |

**Tally against the ten CP1 dimensions: 4 delivered, 3 partial, 3 not delivered.**

---

## 2. Per-cell evidence

### 2.1 Guided Workflow — DELIVERED

- Route `/configurator` — `src/app/configurator/page.tsx`
- Stepped section progress track — `src/components/recommendation-demo.tsx` (`progressStepPx`, section pick-steps at lines 153, 269, 612, 2618–2664)
- Orchestrated agent pipeline — `src/lib/agent/graph.ts:38–51`, nodes `classify → extract → retrieve → validate → compose`
- Tests — `tests/app/configurator-page.test.tsx`, `e2e/configurator.spec.ts`

### 2.2 Compatibility Engine — DELIVERED, with a deviation worth stating

- Engine — `src/lib/rules/compatibility.ts:52` `validateBuildCompatibility`
- ID-based wrapper — `src/lib/components/repository.ts:118` `validateBuildSelectionFromIds`
- Endpoint — `POST /api/builds/validate` — `src/app/api/builds/validate/route.ts`
- Tests — `tests/rules/compatibility.test.ts`, `tests/rules/catalog-expansion.test.ts`
- Measured — median 0.0076 ms per validation; eliminates 99.44% of the 585,200-combination space (see `performance.md`)

**Deviation.** CP1 specified "Real-Time AI Validation". The delivered engine is deterministic and contains no AI. This is a deliberate architectural inversion, not a shortfall: the project's key invariant is that AI may suggest and explain but the rule engine is the sole authority on compatibility. Validation that cannot hallucinate is a stronger guarantee than the one CP1 described, but the CP1 wording is not what was built, and the table above should be read with that in mind.

### 2.3 Search Method — DELIVERED

- Natural-language intent extraction — `POST /api/ai/intent`, `src/lib/ai/`
- Recommendation entry point — `POST /api/recommendations`, `src/lib/recommendations/service.ts:94`
- Semantic retrieval — `src/lib/agent/nodes/retrieve.ts`; pgvector embeddings seeded via `scripts/seed-embeddings.ts`
- **Beyond proposal:** image-based intent — `POST /api/ai/vision-intent`, `tests/ai/vision-intent.test.ts`
- Tests — `tests/ai/intent.test.ts`, `tests/api/ai-intent-route.test.ts`, `tests/api/recommendations-route.test.ts`

### 2.4 Visual Interface — PARTIAL

- Delivered — `src/components/build-preview.tsx` renders a schematic key grid (`PreviewLayout` `"65" | "tkl" | "compact"`, `KeySpec`); `src/components/part-thumbnail.tsx` renders product photography per part
- Not delivered — no layered z-index compositing and no canvas. A repo-wide search for `z-index`, `layered` and `canvas` in the preview components returns only an image-framing comment (`part-thumbnail.tsx:27–32`)
- Documented — CP2 §4.7 records the removal of the 2D layered builder, with supervisor approval, on feasibility and evaluation-priority grounds

**Cross-reference.** This is the same scoped-out decision that makes the CP1 §3.2.4 usability NFR ("accurate layer rendering — keycaps visually cover switches") non-evaluable. The two sections corroborate each other: the NFR was not missed, it was removed along with the feature it described. See `performance.md` §NFR summary.

### 2.5 Sound Testing — NOT DELIVERED

Confirmed absent at three independent levels:

1. **No audio assets.** Repo-wide search for `.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac`, `.aac` (excluding `node_modules` and `.next`) returns zero files.
2. **No data.** Zero occurrences of `soundUrl` carrying a value in `src/data/components.ts` — no seed component references a sound sample.
3. **No playback.** No `<audio>` element and no `Audio()` constructor anywhere in `src/`.

**Schema provision exists but is unpopulated:** `soundUrl` is defined in `src/lib/types/keyboard.ts:71`, and `src/lib/types/database.ts` declares both a `sound_url` column and a dedicated `component_sound_samples` table. The data model anticipates the feature; nothing implements it.

This is scored NOT DELIVERED, and it is the honest limitation the report is built around. CP1 §2.4 and §2.6.3 establish sensory verification as a genuine market barrier — it is the barrier CP1 argued no competitor addresses — and the delivered system does not address it either. CP2 §4.7 records it as the first item of future work.

### 2.6 Community Gallery — DELIVERED

- Routes — `/community-gallery`, `/community-gallery/[postId]`, `/community-gallery/new`
- Service — `src/lib/gallery/service.ts` (`listPublishedPosts`, `getPostWithComments`, `buildCommentThreads`)
- In-context assistant replies on posts — `src/lib/gallery/keybot-reply.ts`
- Validation snapshot persisted with each post — `validation_snapshot` column, `src/lib/types/database.ts`
- Tests — `tests/gallery/comment-threads.test.ts`, `tests/gallery/keybot-reply.test.ts`, `tests/gallery/post-image.test.ts`, `tests/app/community-gallery-card.test.tsx`

### 2.7 Clone Build — NOT DELIVERED

Zero occurrences of `clone`, `duplicate`, `remix`, `fork this`, `use this build` or `copy build` anywhere in `src/` (case-insensitive).

**This is the most consequential competitive gap.** PC Part Picker scores Full Replication on this dimension, and CP1 §2.6.3 identifies precisely this mechanism as the fix for the social-approach failure it describes — the user who finds a build on Reddit and must manually reassemble the parts list across retail sites. CP1 argued the contribution was to close the gap "between looking for inspirations and buying the product". The gallery delivers the inspiration half; the one-click mechanism that closes the gap is absent.

### 2.8 Sharing Method — PARTIAL

- Delivered — `/community-gallery/[postId]` is a persistent, addressable per-build route; builds persist server-side via `src/app/my-builds/actions.ts` (Supabase-backed, with a one-time `localStorage` migration at `src/components/local-builds-migrator.tsx`)
- Not delivered — no share or copy-link affordance in the UI; no `navigator.clipboard` usage anywhere in `src/`

The persistent unique link exists as a URL. Nothing in the interface invites the user to share it.

### 2.9 Beginner Support — PARTIAL

**Evidence for:**

- Contextual plate-material explainers — `src/lib/rules/compatibility.ts:635–674`. A fixed lookup table keyed on catalog metadata emits plain-language `info` annotations ("POM flexes softly and rounds off the high frequencies…"). Deliberately non-generative, so it cannot hallucinate a claim about a part, and it never affects `isValid`.
- Conversational assistant — `POST /api/keybot`, `src/lib/keybot/`, surfaced globally via `src/components/global-keybot-launcher.tsx`. Tests: `tests/keybot/service.test.ts`, `tests/keybot/builder-knowledge.test.ts`.
- Deliberately de-jargoned rejection messages — `src/lib/recommendations/service.ts:642–650` documents the choice to surface one plain reason and one next step rather than raw engine diagnostics.

**Evidence against:**

- No dedicated jargon-buster or glossary component exists. CP1 specified automatic detection and definition of technical terms; no term-detection feature is present.
- `src/components/landing-sections.tsx:369` tells users the system explains "the jargon along the way". That is a marketing claim in FAQ copy, not a discrete delivered feature.

Scored PARTIAL. The system is genuinely more approachable than CP1's competitors, but it does not implement the mechanism CP1 named.

### 2.10 Language Support — NOT DELIVERED

- No internationalisation dependency in `package.json` (no `next-intl`, `react-i18next`, `formatjs`)
- No translation, locale or message catalogue files anywhere in the repo
- The only `locale` matches in `src/` are `localeCompare` sort calls — `src/components/browse-catalog.tsx:186`, `src/lib/components/kits.ts:186`

English only. CP1 proposed EN / BM / CN. Notably KeebFinder scores Partial (EN / CN) on this dimension, so the delivered system is **behind a direct competitor** here — the only dimension where that is true.

---

## 3. Gaps closed and gaps remaining

CP1 §2.6.2 concluded: *"there is no single tool that integrates these four important modules which are AI guidance, compatibility checks, sensory feedback, and a community."* The integration of all four was the stated contribution. Measured against that claim:

| CP1 module | Status | Basis |
|---|---|---|
| AI guidance | **CLOSED** | NL intent, semantic retrieval, agent pipeline, vision intent |
| Compatibility checks | **CLOSED** | Deterministic engine; 99.44% decision-space reduction measured |
| Community | **PARTIALLY CLOSED** | Gallery, threads and in-context assistant delivered; clone/replication absent, so the inspiration→purchase gap CP1 named in §2.6.3 remains open |
| Sensory feedback | **NOT CLOSED** | No audio assets, no data, no playback |

**Plainly stated: the delivered system closes two of the four gaps, partially closes a third, and does not close the fourth.** The CP1 thesis was that integrating all four constitutes the contribution. On the evidence, that integration claim is not fully supported, and the sensory dimension — which CP1 argued most strongly was the unaddressed market barrier — is the one the delivered system also leaves unaddressed.

Two capabilities were delivered *beyond* the CP1 instrument and are therefore invisible in Table 2.1: vision-based intent extraction (`/api/ai/vision-intent`) and the evaluation suite (`src/lib/eval/`, 50 cases across intent, grounding and retrieval). The audit understates the project to that extent, and the report should say so rather than leaving the table to speak alone.

---

## 4. Competitor changes since CP1

Light verification only, as scoped. All three CP1 competitors still exist and trade.

**KeebFinder — MATERIALLY CHANGED.** Now offers a six-question, explicitly no-jargon quiz that matches a user to three to five boards, over a catalogue of 4,000+ categorised products. CP1 scored KeebFinder "Basic Workflow" on Guided Workflow and "Static Guides" on Beginner Support. That quiz is a guided, beginner-oriented workflow, so **the differentiation CP1 claimed on those two dimensions has narrowed since the proposal was written.** It remains a discovery tool over finished boards rather than a component-level compatibility configurator, so the core distinction holds — but the report should acknowledge the narrowing rather than restate CP1's original margin. This is the single most examiner-relevant change in this section.

**MKB — CHANGED, NOT MATERIALLY FOR THE TABLE.** Primary domain has moved from `mkb.my` to `mkb.gg`. Now operates six physical retail locations in Malaysia (SS15 Subang Jaya, Sunway Velocity, IOI City Mall, Mid Valley Megamall, Mid Valley Southkey JB, Sunway Pyramid), offering in-store build, test and cleaning. Its scoring on the CP1 dimensions is unchanged, since those measure the online platform.

There is an uncomfortable observation here worth making explicitly: MKB's physical stores deliver, in person, exactly the sensory verification that Sharkeys does not deliver digitally. For the Malaysian target market specifically, the sensory gap CP1 identified is partly served by a competitor's retail expansion — which weakens the "no tool addresses this" framing in the local market, though not the online-only argument.

**KBDfans — NO MATERIAL CHANGE.** Still a catalogue-model store at `kbdfans.com` selling DIY kits, barebones and assembled boards. CP1 scoring stands.

**PC Part Picker — NO MATERIAL CHANGE.** Still the reference implementation for automated compatibility checking, with the same documented limitation CP1 noted: it covers electrical and dimensional fit, not sensory qualities. CP1 scoring stands.

---

## 5. Reproduction

Code evidence in §2 was gathered with repo-wide searches from the project root:

```bash
# 2.5 Sound testing — audio assets (expect zero results)
find . -type f \( -iname "*.mp3" -o -iname "*.wav" -o -iname "*.ogg" \
  -o -iname "*.m4a" -o -iname "*.flac" -o -iname "*.aac" \) \
  -not -path "./node_modules/*" -not -path "./.next/*"

# 2.5 Sound testing — playback and data (expect no <audio>, no populated soundUrl)
grep -rn "soundUrl\|<audio\|Audio(" src/

# 2.7 Clone build (expect zero results)
grep -rni "clone\|duplicate\|remix\|fork this\|use this build\|copy build" src/

# 2.8 Sharing affordance (expect zero results)
grep -rn "navigator.clipboard" src/

# 2.10 Language support (expect only localeCompare matches)
grep -rn "i18n\|next-intl\|useTranslation\|locale" src/

# 2.1–2.3, 2.6 Routes and endpoints
find src/app -name "page.tsx" | sort
find src/app/api -name "route.ts" | sort
```

Competitor verification was by web search on 31 July 2026 against `keeb-finder.com`, `mkb.gg`, `kbdfans.com` and `pcpartpicker.com`.

---

## Sources

- [KeebFinder](https://keeb-finder.com/)
- [MKB — Custom Keyboards, Keycaps & Switches, Malaysia](https://mkb.gg/)
- [KBDfans Mechanical Keyboards Store](https://kbdfans.com/)
- [PCPartPicker](https://pcpartpicker.com/)
- [PCPartPicker — Wikipedia](https://en.wikipedia.org/wiki/PCPartPicker)
- [MKB.MY, SS15 mechanical keyboard store — Vulcan Post](https://vulcanpost.com/816971/mkb-my-ss15-mechanical-keyboard-store-switches-keycaps/)
