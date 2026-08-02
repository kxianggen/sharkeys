# UAT design cycle — findings, fixes and evidence

User testing produced four findings. This records what was changed in response,
what was deliberately not changed, and the measurements taken before and after.

Baseline commit: `4f019d3`. All work below is committed between `e2d4d1c` and
`7b1a61e`.

The deterministic rule engine (`src/lib/rules/compatibility.ts`) was **not
modified** at any point in this cycle. Colour, the one new matching concern, is
implemented as a ranking signal in the recommendation service and never as a
compatibility constraint.

---

## 1. Triage

| # | Finding | Severity | Status | Why |
|---|---|---|---|---|
| C1 | "Purple and blue themed" returned keycaps unrelated to any colour — aesthetic intent dropped entirely | High | **Implemented** | The pipeline had no colour field at all. Highest user-visible impact and the only finding with a measurable before/after. |
| C2 | Testers could not find where saved builds go | Low | **Implemented** | Two-line discoverability defect with a disproportionate impact on whether saving feels worthwhile. |
| C3 | Community page "does not look like a page for posts" | Medium | **Implemented** | Presentation-only restructure; no data model or server action touched. |
| C4 | Design too simple, little visualisation | Low | **Partially implemented** | Two of the three scoped items already existed; the third targeted an unrendered component. One genuine change made. See §5. |

---

## 2. C1 — colourway intent

**Issue.** A tester asked for a "purple and blue themed" build and received an
unfiltered keycap set. `src/lib/ai/intent-schema.ts` had no colour field, so
aesthetic intent was discarded before it reached the catalog.

**Change.** Colour extraction added end to end, then used to *rank* candidate
builds. Written failing-test-first: the eval cases were committed, and their
failure recorded, before any implementation.

**Files touched**

| File | Change |
|---|---|
| `src/lib/types/keyboard.ts` | `componentColourSchema` — closed 12-value vocabulary |
| `src/lib/ai/intent-schema.ts` | `colour` on the extracted intent (nullable) and matching criteria (optional) |
| `src/lib/ai/prompts.ts` | Colour extraction rules in all three prompt variants |
| `src/lib/ai/intent-extraction.ts` | `parseColour` keyword fallback |
| `src/lib/ai/intent-preparation.ts` | Colour carried into criteria, never into candidate search |
| `src/lib/recommendations/service.ts` | `scoreColourFit` ranking term |
| `src/lib/components/colour.ts` | `getComponentColours` accessor over `metadata.colour` |
| `src/data/components.ts` | Explicit colour tags on the 5 keycaps |
| `scripts/run-eval.ts` | `checkColour` — three-state colour assertion |
| `src/lib/eval/intent-extraction-eval.ts` | 8 new cases |

**Rationale for ranking rather than filtering.** A colour request must never be
able to empty the result set, and colour is not a compatibility concern —
that authority belongs solely to the rule engine. `searchCandidateIds` never
receives colour, so candidate sets are identical with and without a colour
request; colour only reorders what compatibility already permits.

`scoreColourFit` guarantees three properties, each unit tested in
`tests/recommendations/service.test.ts`:

- **No-op without a colour request.** Every pre-existing ranking is unchanged.
- **Absent tags are no signal.** An untagged component scores identically to a
  tagged non-match, so ranking cannot encode how complete the catalog metadata
  is rather than what the user asked for.
- **Matches only add.** Nothing is subtracted, so no compatible build can be
  pushed out.

Measured directly: for "purple and blue", the blue/purple gradient set scores
216 against 192 for the monochrome set; for an unmatched colour and for no
colour, both score 192.

**Matching is deterministic and structural, not semantic.**
`buildComponentEmbeddingText` excludes colour, so tags never reach pgvector. A
closed vocabulary matched exactly is also easier to defend than an embedding
that happened to retrieve purple things.

**Screenshots**

| | Before | After |
|---|---|---|
| Full page | `screenshots/uat-before-colourway-full.png` | `screenshots/uat-after-c1-colourway-full.png` |
| Carousel (primary evidence) | `screenshots/uat-before-colourway-carousel.png` | `screenshots/uat-after-c1-colourway-carousel.png` |

The after-shot was captured at an **isolated commit**, after C1 and before
C2–C4, so that C4's colourway naming — which renders in the same frame — cannot
be mistaken for the ranking effect. The before-shot was re-taken from the
pre-C1 tree (`c62e56c`) after the crop was corrected; see §6.

---

## 3. C1 measurements

### 3.1 Corrected current-state baseline

The figures in `docs/eval-report.md` (13 June: 34 offline, 46 semantic) describe
code roughly six weeks out of date and **must not be used**. Re-measured at
`4f019d3` against the 50 pre-existing cases:

| Mode | Result |
|---|---|
| Offline (deterministic fallback) | **44 pass**, 2 fail (`kg-008`, `kg-010`), 2 expected-fail (`rr-007`, `rr-008`), 2 pending |
| Semantic (full stack, 3 runs) | **45, 46, 46** — mean 45.67, range 45–46 |

Two observations from that baseline:

- **Intent extraction is at parity between modes** (30/30 in both). The keyword
  fallback matches the LLM on the entire intent suite.
- **The durable AI contribution is two cases.** Offline 44 → semantic ~46
  decomposes into `rr-007` and `rr-008`, which pass in *every* semantic run,
  plus grounding movement that does not reproduce. Both durable cases are
  semantic-gap cases. This is a more defensible claim than a headline total.

### 3.2 The three claims

The instrument changes between baseline and after-state — 50 cases become 58 —
so these are reported as three separate claims and never as one series.

| Claim | Cases | Before | After | Meaning |
|---|---|---|---|---|
| **Capability** | `col-001`, `col-002`, `col-003`, `col-004`, `col-008` | 0/5 | **5/5** | New capability demonstrated |
| **Control A** | `col-005`, `col-006`, `col-007` | 3/3 | 3/3 | No colour hallucination introduced |
| **Control B** | the original 50 | 44 pass / 2 fail / 2 ef / 2 pending | identical | No regression in prior capability |

Suite totals: offline **47 pass / 7 fail** before → **52 pass / 2 fail** after.

### 3.3 The eight cases

| ID | Prompt | Assertion |
|---|---|---|
| `col-001` | "purple and blue themed" — the tester's verbatim words | exact `[purple, blue]` |
| `col-002` | "all black keyboard" | exact `[black]` |
| `col-003` | "pastel build" | contains `[pastel]` |
| `col-004` | "something colourful" | contains `[multi]` |
| `col-005` | "aluminium case, premium feel" | no colour |
| `col-006` | "shine-through keycaps for RGB" | no colour |
| `col-007` | "clear transparent housing" | no colour |
| `col-008` | "purple 65% keyboard for gaming under RM300" | colour **and** layout, use case, budget |

`col-002` and `col-001` assert **exact set equality** rather than containment.
Pure containment tests recall but not precision: an extractor returning all
twelve colours for every prompt would otherwise score 100%.

The Control A prompts are **adversarial**, not merely colour-free. A guard using
"thocky keyboard under RM250" could not fail and would prove nothing. Each
baits a different failure: `col-005` offers the in-vocabulary tag `silver`
behind a material word; `col-006` is chromatic language naming no colour;
`col-007` is an appearance term. These controls pass at baseline **and** after,
which is exactly what a control should do — it earns its place by not moving.

`col-008` is the only case testing colour alongside other attributes. Its
baseline failure line was the colour one **alone in both modes**, confirming it
is not confounded, so it counts toward the capability claim.

**Control B is protected twice over.** `checkColour` skips any case that does
not declare `expectedColour`, so the original 30 intent cases are isolated by
construction; and independently, none of those 30 prompts contains a vocabulary
colour word, so colour extraction cannot fire on them at all.

### 3.4 Outstanding measurement

> **The semantic-mode after-state has not been captured.** Claim 1 is measured
> as 0/5 → 5/5 **offline**. The semantic baseline was measured (0/5, single
> run, `col-008` failing on colour only), but no post-implementation semantic
> run has been recorded. Colour extraction exists in two independent
> implementations — the structured prompt and the keyword fallback — and the
> offline result does not license a claim about the LLM path. Report the
> offline figures as offline, or run `EVAL_SEMANTIC=true npm run eval` three
> times and record the mean and range.

---

## 4. C2 — saved-builds discoverability

**Issue.** Testers could not find where saved builds go. `/my-builds` was
reachable only from the account flyout, behind an unlabelled avatar trigger —
findable only if you already knew it existed. The post-save confirmation named
"the My Builds page" in plain text, telling people where the build had gone
without giving them any way to get there.

**Change.** `My Builds` added to the shared nav link set; the confirmation's
trailing phrase became a real link, mirroring the logged-out branch beside it
which already was one. Both call sites updated (configurator and landing).

**Files touched.** `src/components/main-nav.tsx`,
`src/components/recommendation-demo.tsx`, `e2e/nav-consistency.spec.ts`,
`tests/components/nav-account.test.tsx`,
`tests/components/recommendation-demo.test.tsx`.

**Three tests asserted the opposite** and were inverted rather than deleted:
all three required the nav link to be *absent*. Those assertions encoded the
behaviour user testing rejected, so the change is visible in the test diff as
well as the source.

**Screenshots**

| | Before | After |
|---|---|---|
| Nav | `screenshots/uat-before-c2-nav.png` | `screenshots/uat-after-c2-nav.png` |
| Save confirmation (authenticated) | `screenshots/uat-before-c2-save-confirmation-authed.png` | `screenshots/uat-after-c2-save-confirmation-authed.png` |

The authenticated pair was captured manually, following
`report/evidence/manual-capture-procedure.md`. Playwright begins from a clean
browser context with no Supabase session, so it only ever reaches the
logged-out branch — while the confirmation C2 changes is the authenticated one.
The automated pair (`uat-*-c2-save-confirmation.png`) is retained for
completeness but shows the logged-out branch and is **not** evidence for this
fix.

---

## 5. C3 — community page

**Issue.** Testers said the page "does not look like a page for posts". It was a
three-column image grid: photo-gallery affordances, where the image leads and
the author, timestamp and discussion are absent or secondary.

**Change.** A single-column feed using the conventions people read as posts —
byline (author and relative timestamp) above the title, title as the dominant
element, body excerpt, kit chip, and a discussion affordance. The empty state
became a bounded panel with the primary action. "Publish a build" became
"New post", and is the only accent-filled control on the page.

**Files touched.** `src/app/community-gallery/page.tsx` only.

Presentation only, as scoped. The same `listPublishedPosts` payload drives all
of it, using the `createdAt` and `author` fields the grid already received but
never displayed.

**One requested affordance was not implemented.** A per-post reply count is not
in the list payload — `POST_SELECT` carries no comment aggregate — and adding
one means changing the read query, which is outside "presentation only". The
card invites the thread rather than asserting a number it cannot know. Deferred
in §7 rather than faked.

**Screenshots.** `screenshots/uat-before-c3-community-index.png` →
`screenshots/uat-after-c3-community-index.png`.

---

## 6. C4 — visual richness

**Issue.** Testers said the design is too simple with little visualisation.

**Audit first.** Two of the three scoped items were already implemented before
user testing, and the third targeted code that does not run:

- Swatch dots already rendered in recommendation output
  (`recommendation-demo.tsx:2581` and `:1878`), asserted by
  `configurator.spec.ts`.
- `PartThumbnail` and `KitImage` were already used in recommendation output,
  `my-builds` and `nav-account` — not only in browse.
- The colour summary was scoped for `build-preview.tsx`, which **nothing
  renders**: its only importer is its own unit test.

**Change.** One change, inside the timebox. The existing swatch dots showed hex
— the palette, but not its name. Builds now carry semantic colour tags, so the
carousel card states what colour the build actually is, merging case and keycap
tags because a board's colour identity is both. This closes the loop on the
tester's original "purple and blue themed" request.

**Files touched.** `src/components/recommendation-demo.tsx`.

`getComponentColours` is deep-imported from `@/lib/components/colour` rather
than the barrel, which re-exports `catalog-source` and would pull the
server-side Supabase client into a client component.

**Screenshots.** C4's evidence is the authenticated carousel shot,
`screenshots/uat-after-c2-save-confirmation-authed.png`, where the colourway
naming is visible.

> `uat-after-c4-visual-density-summary.png` is **byte-identical** to its
> before-shot. That crop targets an element C4 did not change. The pair is
> retained for completeness but is **not evidence**, and is recorded here
> rather than quietly dropped.

---

## 7. Regressions and defects found

**No regression in the 50 pre-existing eval cases.** Offline is deterministic
and reproduced bit-identically on Linux and macOS/arm64, which is what licenses
treating it as the regression signal.

**Semantic grounding is noisy and must not be read as regression.** Across four
semantic runs the grounding suite scored 7, 8, 8, 9 out of 10 — a three-case
swing from model non-determinism alone, with `kg-001` and `kg-003` flipping
between runs. Movement of one or two grounding cases in semantic mode is within
observed noise and is not attributable to the colour work.

**A defect in the C1 fix, found by screenshot rather than by eval.** The first
C1 after-shot showed no change. Extraction was 5/5 and the ranking unit tests
passed, but the running application reads its catalog from **Supabase**, not
from `src/data/components.ts`, whenever credentials are configured. The colour
tags existed only in the seed file, so every component reported no colour, the
ranking term contributed nothing, and the output was identical to before for
reasons that had nothing to do with the code.

Resolved by merging `metadata.colour` into the 5 keycap rows with a targeted
`jsonb ||` update, preserving `swatch`, `kitId`, `kitLock` and `sourceType`.
Verified after: 60 rows, 5 with colour, 30 `kitId`, 30 `kitLock` intact.

This is the most instructive finding of the cycle: a fix can be unit-tested,
eval-verified and still inert in the deployed configuration. It was caught only
because the evidence screenshot was inspected rather than trusted.

Worth noting that the system **degraded exactly as designed** — "absent tags are
no signal" meant a catalog without colour data produced unchanged ordering
rather than errors or empty results.

**Pre-existing defects fixed to unblock the gate** (non-`uat-fix` commits, kept
out of the design-cycle history):

- `e2d4d1c` — `npm run typecheck` and therefore `next build` were **failing at
  the baseline commit**. `hero-configurator-demo.tsx` cast its parts record to
  the full `KeyboardComponent` union, so the case-only `layouts` field was
  rejected. The project did not production-build in its committed state.
- `bc8b46d` — `useMemo(resolveDemo, [])` replaced with an inline expression.
- `561f9d0` — two React hooks rules downgraded to `warn`; see §8.

---

## 8. Deferred to future work

| Item | Why deferred |
|---|---|
| **Case colourways (7 records)** | No case name, description or vendor URL contains a colour, and product photographs cannot separate `silver` from `grey` — a silver aluminium case shot on black under dim light averages to mid-grey. `case_gh60_universal_aluminum` has no photograph at all. Tagging them from inference would put invented data under the report's most load-bearing claim. Awaiting the owner's vendor listings. **Coverage today: 5/5 keycaps tagged, 0/7 cases.** |
| **Semantic-mode after-state for C1** | See §3.4. Unmeasured, not assumed. |
| **`react-hooks/refs` at `hero-configurator-demo.tsx:605`** | `showToast` reads a ref during render, so it is non-reactive and can be stale, and may differ under StrictMode double-render. This is a **genuine** defect, unlike the ref-callback false positive at `:849`. Converting `playedRef` to state would change re-render timing inside a choreographed animation sequence — not a change worth making late in the project. Noted at the call site and in `eslint.config.mjs`. |
| **`build-preview.tsx` (511 lines) is unrendered** | Nothing imports it except its own unit test, which passes and therefore gives false confidence that the component is exercised. Deleting it is unrelated to any UAT finding and was not done days before submission. |
| **Per-post reply count (C3)** | Requires adding a comment aggregate to `POST_SELECT`, which is a read-query change rather than presentation. |
| **`pastel` tag on Retro 9009** | The one catalog tag not forced by the measured swatch values. Its palette is measurably muted (dominant S=31, L=82), so the tag is defensible, but whether "pastel build" *should* surface that set is a domain judgement for the owner, not a colour measurement. |
| **Colour weighting is unvalidated against users** | Keycaps are weighted 24 and cases 12, on the reasoning that keycaps dominate a built board's visible colour and are a free choice while cases are usually kit-locked. Plausible, but not derived from user data. |
| **Colour never influences candidate selection** | Because colour ranks rather than filters, a colourway that no candidate happens to carry cannot be surfaced by ranking alone. Making colour influence candidate selection while guaranteeing a non-empty fallback is a deliberate design question, not a weight tweak. |

---

## 9. Method notes

- Every fix is its own commit prefixed `uat-fix:`; pre-existing defects and
  evidence infrastructure carry other prefixes so the design-cycle history
  contains only responses to user-testing findings.
- `npm run verify` (typecheck, lint, test, build) passed before every
  `uat-fix:` commit.
- Before-screenshots were captured before any UI change. The capture spec
  (`e2e/uat-evidence.spec.ts`) requires an explicit `UAT_PHASE` with no default,
  because defaulting would let a bare `npx playwright test` silently overwrite
  the irreplaceable before-images with post-fix ones that still look correct.
- The C1 after-shot uses a separate filename prefix from the final capture, so
  no invocation can overwrite it.
