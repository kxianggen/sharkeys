# WS4 — Build UX: split, refine, compare, share, clone

## Paste this to start (Claude Code, repo root, branch `v2-ws4-build-ux`)

> You're working on Sharkeys v2, workstream WS4. Read `docs/v2/00-plan.md` and `docs/v2/WS4-build-ux.md`. Start in plan mode and wait for my approval. Step 1 is a pure refactor: behaviour and screenshots must not change. When you finish, fill in "Report back", then walk me through the Learn card in plain words.

## Why

- The configurator is a single 4,048-line file (`src/components/recommendation-demo.tsx`), so every change is slow and risky.
- Users can't easily nudge a result.
- Compare, share and clone are missing. Your audit scored clone NOT DELIVERED and called it the most consequential competitive gap; share was scored PARTIAL.

## Targets

| Metric | Target |
|---|---|
| Turns to a build the persona accepts (simulation) | −30% |
| Share and clone events | Tracked |
| recommendation-demo | Split into components of under ~400 lines each, with e2e tests still passing |

## Subtasks

1. **Split the big file. This is a refactor only: no behaviour change.**
   - First, add or confirm Playwright tests covering the main flow.
   - Split by section: request input, result cards, build steps, preview, KeyBot panel.
   - The tests must pass before and after, and before/after screenshots must match.
   - Merge this step on its own first, because WS3 waits for it.
2. **Refine chips under each result:** Quieter · Cheaper · More premium · Different colour · Wireless · Smaller.
   - Each chip edits the structured requirements directly and re-runs recommendations. There's no AI call, so it's fast, free and predictable.
   - Show what changed, e.g. "switched to Gateron Silent, −RM40".
3. **Compare view.** Pick 2–3 builds and see them side by side: price, sound, layout, connection, with the key differences highlighted and a one-line "pick this if…".
4. **Share.**
   - A copy-link button.
   - A good link preview on WhatsApp and Instagram: an Open Graph image generated per build.
   - Shared links work without logging in.
5. **Clone.**
   - Add "Use this build" on gallery posts and shared links. It opens the configurator pre-filled.
   - The rule engine re-validates the build, because prices or parts may have changed since it was saved.
   - The user can then edit it.
6. **Simulation support.** Extend the WS0 runner so personas can "click" chips (send the chip action). This is how you measure the turns saved.
7. **Analytics:** add the `refine_clicked`, `build_shared` and `build_cloned` events.

## Tools

Playwright (already installed), Next.js Open Graph images (`ImageResponse` from `next/og`), and the existing validate API.

## Watch-outs

- Don't mix the refactor with new features in one PR.
- Keep the URL as the source of truth for a shared build, so links never break.

## Learn card

**Flow:** result → chip edits the requirements → recommendations re-run → see the difference → compare → share link (with preview image) → someone clones it → re-validated → edited.

- **Refactoring with a safety net:** tests first, then reshape the code, then the tests prove nothing broke.
- **Deterministic actions vs. AI calls:** buttons that don't need AI are cheaper, faster and predictable.
- **Open Graph:** the image and title apps show when a link is pasted.
- **State in the URL:** the link itself carries the build.
- **Re-validation:** never trust an old build without re-checking it.

**Interview questions to practise:**
- "Why aren't the chips AI?"
- "How did you refactor 4,000 lines safely?"
- "Why re-validate a cloned build?"

## Report back (session fills this in)

Branch `v2-ws4-build-ux`, branched from `v2-ws0-foundation` at `a9119a3`. Not pushed, not merged. All numbers below come from runs in this session, on the same machine and day, against a keyless dev server (deterministic keyword path). No paid OpenAI call was made.

### (a) Commits, oldest first

| Commit | What | Notes |
|---|---|---|
| `ef0533f` | test: safety net for the split | Playwright port option, opt-in screenshot baselines, panel tests, stale nav check fixed. No app code. |
| `319a6fc` | **refactor: the split** | **Its own commit, refactor only.** 29 files: `recommendation-demo.tsx` → `src/components/configurator/` + the one dead-code unit test removed. Nothing outside `src/components/` and that test file. |
| `3a867df` | feat: refine chips | |
| `b97e4e2` | feat: compare view | |
| `4389293` | **fix: landing headline size lost in the split** | **Merge together with `319a6fc`.** See "Split bug" below. |
| `db3d5e5` | feat: share links + link preview | |
| `1e97298` | feat: clone ("Use this build") | |
| `8b189b0` | feat: simulator `refine` action | |
| (next) | fix: Cheaper is the next step down | After HQ's verdict; last change in `src/lib/recommendations/`. |
| (next) | docs: this report | |

For WS3, which waits for the split, merge `ef0533f` + `319a6fc` + `4389293`.

**Split bug (found after the split commit, fixed in `4389293`).** In the split I wrote the landing headline class as `sm:text-display${heroFade()}`. Tailwind finds classes by scanning source text and does not recognise one glued to `${`, so on any fresh build the headline fell back to the smaller size. The split's screenshot check passed only because the long-running dev server still had the old file's CSS. It was caught when the dev server restarted. After the fix, the landing screenshot matches the pre-split baseline exactly and the production CSS contains the rule. Lesson for the screenshot check: run it on a freshly started server.

### (b) Files touched outside `src/components/` and `src/app/configurator/`

Compared with the branch point `a9119a3`; WS0 has moved on since, see open questions.

**`src/lib/recommendations/` (now WS1's area): please read before changing budget or part-matching code.**

| File | Change | Commit |
|---|---|---|
| `service.ts` | **New** `generateRecommendationsFromIntent(request, options)`: re-runs recommendations from a given structured intent. Sync `prepareIntentMatches` (no semantic search) → optional `anchorPreparationToKit` → existing `createRecommendationResult`. No OpenAI call of any kind; validation unchanged. | `3a867df`, kit anchor `1e97298` |
| `service.ts` | **New ranking options** `RankingOptions { preferHigherSpend, nextStepDown }`, threaded through `createRecommendationResult` → `buildValidatedRecommendations` → `compareRecommendations` → `scoreRecommendation` (optional 3rd argument). `preferHigherSpend` ("More premium" only): `scorePremiumSpend` replaces `scoreBudgetFit`, rewarding builds that use more of the ceiling. `nextStepDown` ("Cheaper" only): `compareRecommendations` orders by price, priciest first, and the normal score only breaks exact ties. **Only the refine route sets either option.** Every default keeps the old ranking; offline eval unchanged at 54/2/2. | `3a867df`, Cheaper fix (final commit) |
| `schemas.ts` | **New** `refineRecommendationsRequestSchema` `{ intent, source, chip?, kitId? }` (strict, structured intent only, no free text) and its type. | `3a867df`, `1e97298` |
| `index.ts` | Exports the two above. | `3a867df` |
| `refine.ts` (new) | Pure chip logic: `applyRefineChip`, `describeBuildChange`, `getKeycapColours`, chip list and labels. Used by the UI, the route and the simulator. | `3a867df` |
| `compare.ts` (new) | Pure compare rows and "Pick this if…" rules. | `b97e4e2` |
| `build-code.ts` (new) | Share/clone link format `v1.<six part ids>`, encode/decode. | `db3d5e5` |
| `shared-build.ts` (new) | Server loader for a shared link: today's catalogue + rule-engine re-validation. | `db3d5e5` |

Things WS1 should know: `refine.ts` and `scorePremiumSpend` read `intent.budget` and price exactly like the rest of `service.ts`, so a budget fix there flows into the chips. The chips send a ready-made intent, so they skip intent extraction entirely.

**New API route:** `src/app/api/recommendations/refine/route.ts`, `POST`. Body: `refineRecommendationsRequestSchema`. Response: the same shape as `/api/recommendations`. Used by the chips and by clone. Never calls OpenAI (a unit test fails if an OpenAI client is even created).

**Other files outside WS4's area**

| File | Why |
|---|---|
| `src/app/community-gallery/[postId]/page.tsx` | Adds the "Use this build" link, shown only for complete six-part builds. The brief asks for it. |
| `scripts/v2/lib/app-client.ts`, `scripts/v2/lib/persona.ts`, `scripts/v2/simulate.ts` | The simulator `refine` action (WS0's runner), plus app-client's header comment updated to the post-split file paths. |
| `scripts/v2/probe-refine.ts` (new) | Free per-chip probe against a dev server. (The one-off GMK67 probe used for (c) was deleted; its finding is now a unit test.) |
| `playwright.config.ts` | `PLAYWRIGHT_PORT` (default 3000, so no change for others). |
| `.gitignore` | Ignores local screenshot baselines (`e2e/*-snapshots/`). |
| `tests/components/recommendation-demo.test.tsx` | Removed one already-skipped test for the deleted dead UI. |
| `e2e/*`, `tests/recommendations/*`, `tests/v2/simulate-refine.test.ts` | New and updated tests. |

Not touched: `src/lib/rules/`, `src/data/`, `src/lib/components/`, `src/lib/keybot|agent|ai`, `src/lib/analytics/`.

### (c) Offline check: from a GMK67 build, does "Cheaper" find the ~RM299 build?

Checked with a throwaway in-process script (free: no server, no key). It was deleted afterwards; the finding is now a unit test.

- **Ground truth.** The catalogue has 480 valid GMK67 builds. The cheapest are RM281.00 (Outemu Silent Peach V2), RM288.00, RM290.80 and RM298.50, all with Pudding keycaps and the kit stabilizers. The steps just under RM313.80 are RM311.00 (Milky Yellow Pro + SP-Star stabilizers), RM304.00, RM298.50 and RM290.80.
- **Base build.** The search "Beginner friendly 65% keyboard under RM500" gives a GMK67 build at RM313.80 (MMD Princess V3).
- **Cheaper from there (as first shipped): no.** The chip capped the budget at 80% of the build, which is RM251. That is below every GMK67 build, so the engine returns nothing. It even says so: "closest complete build comes to MYR 281.00". The UI then shows "No validated build matches that change — kept your build." The user never sees the RM281–298.50 builds that are cheaper than RM313.80.
- **The search itself is fine on this path.** With the same intent and caps of RM299, RM300 or RM305, the engine returns 3 builds each time, including GMK67 at RM281.00, RM290.80 and RM298.50. The cheap parts are in the candidate lists. So WS0's "says nothing fits" bug did **not** reproduce on the structured-intent path the chips use. It may live in extraction or in the message path, which this check did not exercise.
- **Conclusion.** The miss was caused by WS4's chip rule (a fixed −20% step), not by the WS0 bug.

**Fixed after HQ's verdict.** Cheaper now caps the budget at the current total − RM1, and the refine route orders the builds under that cap by price, priciest first (`nextStepDown`). So one click is the next step down.
- From the RM313.80 GMK67 build, the first click returns **RM311.00**, not RM298.50. RM311.00 is a valid build and is the true next step: HQ's expected RM298.50 came from my earlier list, which showed only the four cheapest builds.
- Clicking again walks down **RM304.00 → RM298.50**. The unit test pins all three steps: 311.00, then 304.00, then 298.50.
- I first tried a score nudge instead of a strict price order. It skipped RM304.00, because close prices round to the same points. That's why the order is strict.
- The cap only reaches builds in the engine's candidate lists (up to 6 per part type, picked from the intent). On this catalogue that list includes the true next step.

### What changed, in plain words

- **Split.** One 4,084-line file became a 47-line entry point plus 34 files in `src/components/configurator/` (27 from the split, 7 added by the features), the largest being `use-configurator.ts` at 389 lines. The hooks hold the state; each screen section is its own component. About 600 lines of code that could never run were deleted.
- **Refine chips.** Quieter · Cheaper · More premium · Different colour · Wireless · Smaller sit under each result card. Each edits the structured request and re-runs the engine with no AI call, then shows a line such as "Switched to Akko Penguin Silent Tactile Switch, +RM70". A chip is greyed out when it can't change anything.
- **Compare.** Tick 2–3 builds, including a build from before a chip, to see price, sound, switch, layout, connection and keycaps side by side. Rows that differ are highlighted, and each build gets a fixed-rule "Pick this if…".
- **Share.** The link is the build. A public page needs no login and re-checks price and fit against today's catalogue. Each build gets its own link-preview image (1200×630 PNG, about 81 KB). The Share button opens the phone's share sheet, or copies the link on desktop.
- **Clone.** "Use this build" on the share page and on gallery posts opens the configurator pre-filled. The build is re-checked by the rule engine; retired parts are left for the user to replace, with Save disabled until they do.
- **Simulator.** Personas can click chips (`refine` action), using the same code as the UI.
- **Analytics.** `refine_clicked {chip}`, `build_shared {channel}` and `build_cloned` are now sent. WS0's existing events are kept through the split.

### Sizes and test results

| | Before the split (`a9119a3` + safety net) | After the split | Final (with the Cheaper fix) |
|---|---|---|---|
| `recommendation-demo.tsx` | 4,084 lines | 42 | 47 |
| Largest configurator file | 4,084 | 354 | 389 (`use-configurator.ts`) |
| Unit tests (vitest) | 250 passed / 45 skipped | 250 / 44 (dead-code test removed) | 281 / 44 |
| e2e (Playwright) | 24 passed, 1 failed | 24 passed, 1 failed | 33 passed, 1 failed |
| Screenshot baselines (9 screens) | recorded | 9/9 identical, 0 pixels (see split bug) | each feature's diff checked by eye, then re-recorded |
| `npm run verify` | pass, 13 lint warnings | pass | pass, 11 lint warnings, 0 errors |
| Offline eval | 54 / 2 / 2 | 54 / 2 / 2 | 54 / 2 / 2 |

The one e2e failure, `browse.spec.ts` "part rows render enlarged images", fails before and after on a page WS4 doesn't touch. It is pre-existing. The 24 "before" passes count the fixed nav check; the first run on WS0 was 21 passed, 4 failed.

### Turns-to-build, before/after (simulation)

- **Before:** WS0's baseline (`eval/v2/results/2026-11-27-v2-ws0-foundation.md`) is 3.0 turns mean, 3 median, over the 7 of 15 sessions that succeeded. That is WS0's number, not re-run here.
- **After: not measured.** It needs a paid simulation run on the merged code (persona + judge, estimated about USD 0.015 per session), with your OK. The −30% target means about 2.1 turns.

### Open questions for HQ

1. **Merge conflict to expect.** WS0 added 4 commits after I branched. A test merge shows one conflict, in `scripts/v2/lib/persona.ts`: WS0 rewrote the "accept" line, and I added the chip sentence to the "screen has" line next to it. Keep both. `app-client.ts` and `simulate.ts` merge cleanly.
2. ~~The "Cheaper" step size~~: decided by HQ and fixed (next step down, see (c)). Note: the first click from RM313.80 gives RM311.00, not RM298.50 (the true next step); the unit test pins 311.00 → 304.00 → 298.50.
3. **Clone's `source` value.** Cloned results are labelled `"fallback_error"` because no text was interpreted. It is the only existing value with no missing-key banner and no AI claim. A proper new value such as `"structured"` would need a change to WS1's intent schema.
4. **Compare has no analytics event.** Adding `compare_opened` means changing WS0's `src/lib/analytics/`.
5. **For WS2:** catalogue ids must stay lowercase slugs (`[a-z0-9_-]`), or old share links stop decoding. A unit test checks the current catalogue.
6. **Link previews** use absolute URLs. Vercel fills in the site address automatically; anywhere else needs `metadataBase`.
7. ~~`docs/v2/` tracked in git~~: HQ decided `docs/v2/` stays tracked (the local-only rule doesn't cover it). This report is committed.
8. Not changed, but noticed: My Builds "Open" uses `?kit=` and loses the chosen parts (it could use `?build=` now). The gallery price in `build-summary.ts` doesn't multiply the switch price by 70, unlike the configurator.
