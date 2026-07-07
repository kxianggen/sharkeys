import { expect, test } from "@playwright/test";

/**
 * Configurator redesign checks. The "resolved" test relies on the local
 * keyword fallback (run the dev server without OPENAI_API_KEY), so the
 * resulting build is deterministic seed-catalog data — no live AI call.
 */
async function expectSharedNav(page: import("@playwright/test").Page) {
  const nav = page.getByRole("navigation").first();
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Sharkeys" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Configurator" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Log in" })).toBeVisible();
}

test("configurator empty state renders visual placeholder + rail", async ({
  page,
}) => {
  await page.goto("/configurator");
  await expectSharedNav(page);

  await expect(page.getByRole("heading", { name: "Ask Meg" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Design my build" }),
  ).toBeVisible();

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "screenshots/configurator-empty.png",
  });
});

test("configurator resolves a validated build from a starting point", async ({
  page,
}) => {
  await page.goto("/configurator");
  await expectSharedNav(page);

  await page.getByRole("button", { name: "Thocky", exact: true }).click();

  // (a) Build title (short kit name) renders as the page h1, above the image.
  // Live-key intent extraction can be slow; allow a generous resolve window.
  const buildTitle = page.getByRole("heading", { level: 1 });
  await expect(buildTitle).toBeVisible({ timeout: 45_000 });

  // (b) Short kit name fits on one line — no ellipsis truncation.
  const isTruncated = await buildTitle.evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  );
  expect(isTruncated).toBe(false);

  // Kit visual renders below; when the kit has an image asset, wait for it to
  // decode before the capture (alt: "<name> kit"). Kits without an asset show
  // the calm placeholder instead.
  const kitVisual = page.getByTestId("kit-visual");
  await expect(kitVisual).toBeVisible();
  if ((await kitVisual.locator('img[alt$=" kit"]').count()) > 0) {
    await page.waitForFunction(() => {
      const image = document.querySelector<HTMLImageElement>(
        'img[alt$=" kit"]',
      );

      return Boolean(image && image.complete && image.naturalWidth > 0);
    });
  }

  // (a) Title sits above the product visual.
  const titleBox = await buildTitle.boundingBox();
  const visualBox = await kitVisual.boundingBox();
  expect(titleBox).not.toBeNull();
  expect(visualBox).not.toBeNull();
  expect(titleBox!.y + titleBox!.height).toBeLessThanOrEqual(visualBox!.y);

  // No "Validated" reassurance badges (validation still runs server-side).
  await expect(page.getByText(/Validated/)).toHaveCount(0);

  // Single-card "Start from a build" carousel sits at the top of the rail,
  // above the Case section, with accessible arrow controls.
  await expect(page.getByText("Start from a build")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Previous recommendation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next recommendation" }),
  ).toBeVisible();
  const carousel = page.locator('section[aria-label="Start from a build"]');
  const carouselBox = await carousel.boundingBox();
  const caseBox = await page.locator("#configurator-section-case").boundingBox();
  expect(carouselBox).not.toBeNull();
  expect(caseBox).not.toBeNull();
  expect(carouselBox!.y).toBeLessThan(caseBox!.y);

  // Switch · keycap summary line names the build's defining parts. Flipping
  // moves the counter; the summary may legitimately repeat when the engine
  // resolves the same defining parts for neighbouring builds.
  const buildSummary = page.getByTestId("carousel-build-summary");
  await expect(buildSummary).toBeVisible();
  const firstSummary = (await buildSummary.textContent()) ?? "";
  expect(firstSummary.length).toBeGreaterThan(0);
  // Keycap palette dots render inside the summary line.
  await expect(buildSummary.getByTestId("keycap-swatch")).toBeVisible();
  await expect(carousel.getByText("1 of 3")).toBeVisible();
  await carousel.screenshot({
    animations: "disabled",
    path: "screenshots/configurator-carousel-summary.png",
  });

  await page.getByRole("button", { name: "Next recommendation" }).click();
  await expect(carousel.getByText("2 of 3")).toBeVisible();
  await expect(buildSummary).toBeVisible();
  await carousel.screenshot({
    animations: "disabled",
    path: "screenshots/configurator-carousel-summary-next.png",
  });
  // Return to the first recommendation so the flow below starts unchanged.
  await page.getByRole("button", { name: "Previous recommendation" }).click();

  // (b) Kit-locked internals/stabilizers render as included, not pick-steps.
  await expect(page.getByText("Included with this kit").first()).toBeVisible();

  // Keycap option cards show their stored 3-colour palette swatch.
  const keycapSection = page.locator("#configurator-section-keycaps");
  await expect(
    keycapSection.getByTestId("keycap-swatch").first(),
  ).toBeVisible();
  await keycapSection.screenshot({
    animations: "disabled",
    path: "screenshots/configurator-keycap-swatches.png",
  });

  // (c) Switches and keycaps start deselected — no pressed option cards.
  await expect(
    page.locator('#configurator-section-switches button[aria-pressed="true"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('#configurator-section-keycaps button[aria-pressed="true"]'),
  ).toHaveCount(0);

  // (d) Progress indicator partially filled: kit-locked sections resolve with
  // the case; free-choice dots stay open. Save gated on completeness.
  const progress = page.getByTestId("review-progress");
  await expect(progress).toBeVisible();
  const sectionCount = Number(await progress.getAttribute("aria-valuemax"));
  const resolvedAtStart = Number(await progress.getAttribute("aria-valuenow"));
  expect(resolvedAtStart).toBeGreaterThanOrEqual(1);
  expect(resolvedAtStart).toBeLessThan(sectionCount);
  const saveButton = page.getByRole("button", {
    name: "Save build",
    exact: true,
  });
  await expect(saveButton).toBeDisabled();

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "screenshots/configurator-resolved.png",
  });

  // Complete the build: pick an option in every free-choice section (which
  // sections are free is derived from catalog kit-lock data, so discover them
  // rather than hardcoding).
  const choiceSectionIds = [
    "configurator-section-switches",
    "configurator-section-keycaps",
    "configurator-section-stabilizers",
  ];
  for (const sectionId of choiceSectionIds) {
    const optionButtons = page.locator(`#${sectionId} button[aria-pressed]`);

    if ((await optionButtons.count()) === 0) {
      continue; // section is kit-included, nothing to pick
    }

    await optionButtons.first().click();
    await expect(
      page.locator(`#${sectionId} button[aria-pressed="true"]`),
    ).toHaveCount(1);
  }

  await expect(progress).toHaveAttribute(
    "aria-valuenow",
    String(sectionCount),
  );

  // Save enables only after the assembled build passes the rule engine.
  await expect(saveButton).toBeEnabled({ timeout: 15_000 });

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "screenshots/configurator-assembled.png",
  });
});

test("'Your build' summary shows enlarged part photos without swapping the hero", async ({
  page,
}) => {
  // Tall viewport so the sticky left panel (hero + summary) fits on screen —
  // otherwise the lazy-loaded thumbnails stay below the fold and never decode.
  await page.setViewportSize({ width: 1280, height: 1700 });
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");
  // The 65% chip resolves a build whose switch, keycap AND stabilizer are all
  // free choices (aftermarket, not kit-locked), so every part-type gets a row.
  await page.getByRole("button", { name: "65% Layout", exact: true }).click();

  // Wait for the build (and its stable kit hero) to resolve.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 45_000,
  });
  const kitVisual = page.getByTestId("kit-visual");
  await expect(kitVisual).toBeVisible();

  // Record the hero image (kit art) so we can prove it never swaps to a part.
  const heroImg = kitVisual.locator("img");
  const hasHeroImage = (await heroImg.count()) > 0;
  const heroSrcBefore = hasHeroImage
    ? await heroImg.getAttribute("src")
    : null;

  const summary = page.getByTestId("build-summary");
  await expect(summary).toBeVisible();

  // Before any pick, the free-choice rows read as pending.
  await expect(summary.getByText("Not selected yet").first()).toBeVisible();

  // Pick the first option for switch + keycap (both resolve to parts with
  // imported photos). For the stabilizer, pick SP-Star specifically — an
  // aftermarket stab with an imported photo (the kit's own plate-mount stab
  // has no photo, so it would fall back to the glyph).
  for (const sectionId of [
    "configurator-section-switches",
    "configurator-section-keycaps",
  ]) {
    const options = page.locator(`#${sectionId} button[aria-pressed]`);
    if ((await options.count()) === 0) continue;
    await options.first().click();
    await expect(
      page.locator(`#${sectionId} button[aria-pressed="true"]`),
    ).toHaveCount(1);
  }

  const stabOption = page
    .locator("#configurator-section-stabilizers button[aria-pressed]")
    .filter({ hasText: /SP-Star/ });
  await stabOption.first().click();
  await expect(
    page.locator(
      '#configurator-section-stabilizers button[aria-pressed="true"]',
    ),
  ).toHaveCount(1);

  // Each selected row's thumbnail shows its real photo, decoded and enlarged.
  // The 3 expected part ids for this build (switch/keycap/stabilizer). Waiting
  // in-browser on the specific <img> by src avoids locator re-resolution flake
  // while the summary re-renders.
  const expectedPartIds = {
    switch: "switch_mmd_princess_linear_v3",
    keycap: "keycap_unknown_pudding_oem_pbt",
    stabilizer: "stab_sp_star_plate_mount",
  } as const;

  for (const [category, id] of Object.entries(expectedPartIds)) {
    const row = page.getByTestId(`build-summary-row-${category}`);
    await expect(row).toBeVisible();
    await expect(row.locator("img")).toHaveAttribute("src", new RegExp(id));
    await page.waitForFunction(
      (partId) => {
        const image = [
          ...document.querySelectorAll<HTMLImageElement>("img"),
        ].find((element) => element.src.includes(partId));

        return Boolean(image && image.complete && image.naturalWidth > 0);
      },
      id,
      { timeout: 20_000 },
    );
  }

  // Keycap row: photo present → NO swatch dots (the photo conveys the colours).
  await expect(
    page
      .getByTestId("build-summary-row-keycap")
      .getByTestId("keycap-swatch"),
  ).toHaveCount(0);

  // The hero image must NOT change when parts are selected.
  if (hasHeroImage) {
    await expect(heroImg).toHaveAttribute("src", heroSrcBefore ?? "");
  }

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "screenshots/configurator-build-summary.png",
  });
});

test("stabilizer thumbnail updates from glyph to photo after a no-photo → photo switch", async ({
  page,
}) => {
  // Regression: selecting a no-photo stab first (kit's own plate-mount stab →
  // glyph fallback) then a photo-backed one (SP-Star) used to leave the
  // thumbnail stuck on the stale glyph, because the image-load-error state
  // never reset when the selected part changed.
  await page.setViewportSize({ width: 1280, height: 1700 });
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "65% Layout", exact: true }).click();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 45_000,
  });

  const stabSection = page.locator("#configurator-section-stabilizers");
  const stabOptions = stabSection.locator("button[aria-pressed]");
  await expect(stabOptions.first()).toBeVisible();

  const stabRow = page.getByTestId("build-summary-row-stabilizer");

  // Step 1: pick the kit's own stab (leads the list) — it has no part photo,
  // so its thumbnail falls back to the glyph (an <svg>, not an <img>).
  await stabOptions.first().click();
  await expect(
    stabSection.locator('button[aria-pressed="true"]'),
  ).toHaveCount(1);
  await expect(stabRow).toBeVisible();
  await expect(stabRow.locator("img")).toHaveCount(0);
  await expect(stabRow.locator("svg")).not.toHaveCount(0);

  // Step 2: switch to SP-Star (photo-backed). The thumbnail must now show the
  // real photo, decoded — not the stale glyph.
  const spStar = stabOptions.filter({ hasText: /SP-Star/ });
  await spStar.first().click();
  await expect(
    stabSection.locator('button[aria-pressed="true"]'),
  ).toHaveCount(1);

  const stabId = "stab_sp_star_plate_mount";
  await expect(stabRow.locator("img")).toHaveAttribute(
    "src",
    new RegExp(stabId),
  );
  await page.waitForFunction(
    (partId) => {
      const image = [
        ...document.querySelectorAll<HTMLImageElement>("img"),
      ].find((element) => element.src.includes(partId));

      return Boolean(image && image.complete && image.naturalWidth > 0);
    },
    stabId,
    { timeout: 20_000 },
  );

  await stabRow.screenshot({
    animations: "disabled",
    path: "screenshots/configurator-stabilizer-photo-after-switch.png",
  });
});

test("start-from-a-build populates sections and fills the progress track", async ({
  page,
}) => {
  await page.goto("/configurator");
  await expectSharedNav(page);
  // Wait for hydration before driving the prompt chip.
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Thocky", exact: true }).click();

  const progress = page.getByTestId("review-progress");
  // Live-key intent extraction can be slow; allow a generous resolve window.
  await expect(progress).toBeVisible({ timeout: 45_000 });
  const sectionCount = Number(await progress.getAttribute("aria-valuemax"));
  expect(Number(await progress.getAttribute("aria-valuenow"))).toBeLessThan(
    sectionCount,
  );

  // Free-choice sections start deselected.
  await expect(
    page.locator('#configurator-section-switches button[aria-pressed="true"]'),
  ).toHaveCount(0);

  // Adopting a recommended build populates every free choice below…
  await page.getByRole("button", { name: /^Select / }).click();

  await expect(
    page.locator('#configurator-section-switches button[aria-pressed="true"]'),
  ).toHaveCount(1);
  await expect(
    page.locator('#configurator-section-keycaps button[aria-pressed="true"]'),
  ).toHaveCount(1);

  // …advances the track to fully filled…
  await expect(progress).toHaveAttribute(
    "aria-valuenow",
    String(sectionCount),
  );

  // …and save enables only after the engine re-validates the assembly.
  await expect(
    page.getByRole("button", { name: "Save build", exact: true }),
  ).toBeEnabled({ timeout: 15_000 });

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "screenshots/configurator-start-from-build.png",
  });
});
