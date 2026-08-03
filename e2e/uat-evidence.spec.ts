import { expect, test } from "@playwright/test";

/**
 * UAT design-cycle evidence capture (Chapter 4).
 *
 * This spec exists purely to produce before/after screenshot pairs for the
 * four findings that came out of user testing. It asserts as little as
 * possible about *correctness* — its job is to reach a given screen state
 * deterministically and photograph it. The assertions that are here exist
 * only to guarantee the page actually reached the state before the shutter
 * fires, so that a "before" and an "after" shot are framed identically.
 *
 * Identical framing is the whole point: the two runs execute the same
 * navigation, the same viewport and the same waits. The ONLY thing that
 * differs between them is the filename prefix, which is driven by UAT_PHASE.
 *
 *   UAT_PHASE=before npx playwright test e2e/uat-evidence.spec.ts
 *   UAT_PHASE=after  npx playwright test e2e/uat-evidence.spec.ts
 *
 * UAT_PHASE is REQUIRED and has no default. Without it every test in this file
 * skips, so a bare `npx playwright test` across e2e/ leaves the captured
 * evidence untouched. An invalid value throws immediately.
 *
 * CAPTURE PROTOCOL — the after-run is SPLIT IN TWO. Read this before running.
 *
 * The C1 claim is about colour *ranking*. C4 adds swatch dots to the very same
 * frame, so a single after-run taken once everything has landed would show
 * ranking and new visualisation together, and a reader could not attribute the
 * improvement to either. With the RAG eval cases dropped, that image is the
 * only end-to-end proof of the ranking claim, so it cannot carry that confound.
 *
 * The C1 test is therefore tagged @c1 and captured at an intermediate commit —
 * after the C1 implementation, before C2/C3/C4:
 *
 *   1. after C1 lands, verify green:
 *      UAT_PHASE=after-c1 npx playwright test e2e/uat-evidence.spec.ts --grep @c1
 *
 *   2. after C2, C3 and C4 land:
 *      UAT_PHASE=after npx playwright test e2e/uat-evidence.spec.ts --grep-invert @c1
 *
 * The isolation does NOT depend on remembering --grep-invert. The two steps
 * write different filename prefixes (uat-after-c1-* vs uat-after-*), so no
 * invocation of any shape can overwrite the isolated C1 image. --grep-invert
 * is a second, redundant guard, and running the full spec at UAT_PHASE=after
 * fails loudly on the @c1 test rather than quietly producing a confounded
 * figure that still looks correct.
 *
 * Record the commit SHA at step 1; evidence/uat-fixes.md cites it, so
 * the C1 after-shot is traceable to the exact tree that produced it, and pairs
 * uat-before-colourway-* with uat-after-c1-colourway-* for finding 1.
 *
 * NOTE ON THE COLOUR TAGS: the running app reads the catalog from Supabase
 * when credentials are configured, NOT from src/data/components.ts. Colour
 * tags must exist in the database or every component reports no colour, the
 * ranking term contributes nothing, and the after-shot is identical to the
 * before-shot for reasons that have nothing to do with the code.
 *
 * The before-run at the start is NOT split — run the whole spec in one go.
 *
 * The other three findings accept conflation: their after-shots reflect the
 * final state of all four fixes. That is stated plainly in uat-fixes.md. It is
 * an acceptable trade there — the C2 delta, for instance, is a link that did
 * not previously exist, which is unambiguous no matter what else changed.
 *
 * Run this on a machine with the dev server AND credentials: findings 2 and 3
 * touch Supabase-backed pages (community gallery, account-backed saves) which
 * cannot render without them.
 *
 * KNOWN LIMITATION — finding 3, authenticated save confirmation:
 * Playwright starts from a clean browser context with no Supabase session, so
 * clicking "Save build" here always resolves to the logged-out branch
 * ("Log in to save builds to your account"). The confirmation that C2 changes
 * is the *authenticated* branch, which this spec cannot reach without a
 * seeded test user. c2-save-confirmation therefore documents the save
 * affordance and the notice region only; the authenticated confirmation needs
 * one manual logged-in capture. This is called out in
 * evidence/uat-fixes.md rather than papered over.
 */
const PHASES = ["before", "after-c1", "after"] as const;

// Deliberately NO default. Defaulting to "before" would mean any bare
// `npx playwright test` over e2e/ — for instance checking the other specs
// still pass after a fix — silently rewrites every uat-before-*.png with
// post-fix imagery under before-* names. The replacements look perfectly
// correct, so every comparison in the chapter would quietly become
// after/after with no visible symptom. The before-shots cannot be re-taken
// once the fixes are in, so this is the one unrecoverable failure in the
// whole evidence chain.
const RAW_PHASE = process.env.UAT_PHASE;

// Allowlist: a typo (UAT_PHASE=aftr) must fail loudly rather than invent a new
// prefix and write a set of screenshots nobody ever looks at again.
if (
  RAW_PHASE !== undefined &&
  !(PHASES as readonly string[]).includes(RAW_PHASE)
) {
  throw new Error(
    `UAT_PHASE must be one of ${PHASES.join(" | ")} — received "${RAW_PHASE}".`,
  );
}

// Skip rather than throw when unset, so a general suite run over e2e/ stays
// green and this spec simply reports itself as skipped with instructions.
test.beforeEach(() => {
  test.skip(
    !RAW_PHASE,
    "evidence capture — set UAT_PHASE=before | after-c1 | after",
  );
});

function shot(name: string) {
  if (!RAW_PHASE) {
    // Unreachable: every test is skipped without a phase. Belt and braces, so
    // no future edit can produce a path like "uat-undefined-*.png".
    throw new Error("UAT_PHASE is required to compute a screenshot path.");
  }

  return `screenshots/uat-${RAW_PHASE}-${name}.png`;
}

/** The exact phrasing the tester used. Do not paraphrase — this is evidence. */
const TESTER_PROMPT = "purple and blue themed";

/**
 * Finding 1 — aesthetic/colourway intent is dropped.
 *
 * Driven through the ?prompt= search param rather than by typing into the
 * textarea: the configurator auto-submits an initial prompt on mount, which
 * removes any dependence on hydration timing or on the composer's markup
 * staying put. That keeps the before/after entry path stable even if the
 * prompt composer itself changes.
 */
test("finding 1: colourway intent is dropped from the recommendation @c1", async ({
  page,
}) => {
  // Hard guard on the one invocation that would corrupt the chapter's central
  // figure: capturing C1's after-state once C4's swatch dots share the frame.
  if (RAW_PHASE === "after") {
    throw new Error(
      "The C1 after-shot must be captured in isolation, before C2/C3/C4 land. " +
        "Use UAT_PHASE=after-c1 with --grep @c1, and UAT_PHASE=after with " +
        "--grep-invert @c1 for everything else.",
    );
  }

  await page.goto(
    `/configurator?prompt=${encodeURIComponent(TESTER_PROMPT)}`,
  );

  // Live intent extraction is slow; match the generous window the existing
  // configurator specs already use.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 45_000,
  });
  await expect(page.getByTestId("kit-visual")).toBeVisible();

  // Let lazily-loaded part imagery settle so the two runs photograph the same
  // amount of content rather than differing by whatever had decoded in time.
  await page.waitForLoadState("networkidle");

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: shot("colourway-full"),
  });

  // The money shot: the "Start from a build" carousel.
  //
  // This MUST be the carousel, not #configurator-section-keycaps. scoreColourFit
  // is applied inside scoreRecommendation, which ranks whole assembled builds —
  // exactly what the carousel presents. The keycap picker below it renders a
  // plain catalog listing and is deliberately not colour-ordered, so cropping
  // it would photograph a component the fix does not touch and appear to refute
  // a claim that is true.
  const carousel = page.locator('section[aria-label="Start from a build"]');
  await carousel.scrollIntoViewIfNeeded();
  await expect(carousel).toBeVisible();
  await carousel.screenshot({
    animations: "disabled",
    path: shot("colourway-carousel"),
  });
});

/** Finding 2 — the community page does not read as a page for posts. */
test("finding 2: community gallery index", async ({ page }) => {
  await page.goto("/community-gallery");
  await expect(
    page.getByRole("heading", { name: "Community" }),
  ).toBeVisible();
  await page.waitForLoadState("networkidle");

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: shot("c3-community-index"),
  });
});

/** Finding 3a — saved builds are not discoverable from the main nav. */
test("finding 3a: main nav link set", async ({ page }) => {
  await page.goto("/configurator");

  const nav = page.getByRole("navigation").first();
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Configurator" })).toBeVisible();

  // Crop to the bar itself — a full-page shot buries the point.
  await nav.screenshot({
    animations: "disabled",
    path: shot("c2-nav"),
  });
});

/**
 * Finding 3b — what the user sees after saving.
 *
 * Reaches a complete, validated build via the "Start from a build" adoption
 * path (the same route configurator.spec.ts uses to fill every free-choice
 * section at once), then triggers the save and photographs the resulting
 * notice. See the KNOWN LIMITATION note at the top of this file regarding the
 * logged-out branch.
 */
test("finding 3b: post-save confirmation", async ({ page }) => {
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Thocky", exact: true }).click();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 45_000,
  });

  // Adopting a recommended build populates every free choice in one action.
  await page.getByRole("button", { name: /^Select / }).click();

  const saveButton = page.getByRole("button", {
    name: "Save build",
    exact: true,
  });
  await expect(saveButton).toBeEnabled({ timeout: 15_000 });
  await saveButton.click();

  // The notice renders whichever branch applies (logged-out here).
  await expect(page.getByText(/save builds/i).first()).toBeVisible({
    timeout: 15_000,
  });

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: shot("c2-save-confirmation"),
  });
});

/**
 * Finding 4 — the design is too plain / too little visualisation.
 *
 * A fully assembled build is the densest screen the app produces, so it is
 * the fairest subject for a "visual richness" comparison. Uses the taller
 * viewport the build-summary spec uses, so the sticky left panel and its
 * thumbnails are actually on screen rather than below the fold.
 */
test("finding 4: recommendation output visual density", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1700 });
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "65% Layout", exact: true }).click();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 45_000,
  });
  await page.getByRole("button", { name: /^Select / }).click();

  const summary = page.getByTestId("build-summary");
  await expect(summary).toBeVisible();
  await page.waitForLoadState("networkidle");

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: shot("c4-visual-density-full"),
  });

  await summary.screenshot({
    animations: "disabled",
    path: shot("c4-visual-density-summary"),
  });
});
