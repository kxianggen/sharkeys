import { expect, test } from "@playwright/test";

/**
 * Browse catalogue e2e: full-page render, a kits layout filter, and the
 * kit-card "Configure" handoff into the configurator with the kit preselected
 * (via /configurator?kit=<kitId>). Screenshots land in screenshots/.
 */

test("browse renders shared nav and all category sections", async ({ page }) => {
  await page.goto("/browse");

  const nav = page.getByRole("navigation").first();
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Sharkeys" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Configurator" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Browse" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Kits\./ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Switches\./ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Keycaps\./ })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Stabilizers\./ }),
  ).toBeVisible();

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "screenshots/browse-full.png",
  });
});

test("part rows render enlarged images, including the 3 imported switches", async ({
  page,
}) => {
  await page.goto("/browse");
  await page.waitForLoadState("networkidle");

  // The three switches reported as "missing" earlier: their files exist and
  // their filenames match the componentIds, so on a fresh server they load.
  const importedSwitchIds = [
    "switch_gateron_milky_yellow_pro",
    "switch_mmd_princess_linear_v3",
    "switch_gateron_oil_king",
  ];

  for (const id of importedSwitchIds) {
    const img = page.locator(`img[src*="${id}.webp"]`).first();
    await expect(img).toBeVisible();
    // The optimizer actually returned a decodable image (not a null/404).
    await expect
      .poll(async () =>
        img.evaluate(
          (element) =>
            (element as HTMLImageElement).complete &&
            (element as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
  }

  // Capture each part row so the enlarged framing is reviewable.
  for (const [heading, file] of [
    [/Switches\./, "screenshots/browse-switches-row.png"],
    [/Keycaps\./, "screenshots/browse-keycaps-row.png"],
    [/Stabilizers\./, "screenshots/browse-stabilizers-row.png"],
  ] as const) {
    const section = page.getByRole("region", { name: heading });
    await section.scrollIntoViewIfNeeded();
    await section.getByTestId("product-row").screenshot({
      animations: "disabled",
      path: file,
    });
  }
});

test("kits layout filter narrows the kit row without shifting the left edge", async ({
  page,
}) => {
  await page.goto("/browse");

  const kitsSection = page.getByRole("region", { name: /Kits\./ });
  await expect(
    kitsSection.getByRole("heading", { name: /Lucky65 V3/ }),
  ).toBeVisible();

  // The row is a full-bleed track: it spans the viewport so trailing cards
  // bleed past the right edge instead of clipping inside the page column.
  const rowBox = await kitsSection.getByTestId("product-row").boundingBox();
  expect(rowBox).not.toBeNull();
  expect(rowBox!.width).toBeGreaterThanOrEqual(1279);

  const firstCardAll = await kitsSection
    .getByTestId("kit-card")
    .first()
    .boundingBox();

  await kitsSection.getByTestId("filter-selector").screenshot({
    animations: "disabled",
    path: "screenshots/browse-filter-selector.png",
  });

  const sectionBoxAll = await kitsSection.boundingBox();
  await page.screenshot({
    animations: "disabled",
    clip: {
      x: 0,
      y: sectionBoxAll!.y,
      width: 1280,
      height: Math.min(sectionBoxAll!.height, 800),
    },
    path: "screenshots/browse-kits-all.png",
  });

  await kitsSection.getByRole("button", { name: "60%" }).click();

  await expect(
    kitsSection.getByRole("heading", { name: /Zuoya GMK61/ }),
  ).toBeVisible();
  await expect(
    kitsSection.getByRole("heading", { name: /Lucky65 V3/ }),
  ).toBeHidden();

  // Left-flush alignment must not move when the filter changes card count.
  const firstCardFiltered = await kitsSection
    .getByTestId("kit-card")
    .first()
    .boundingBox();
  expect(firstCardFiltered).not.toBeNull();
  expect(Math.abs(firstCardFiltered!.x - firstCardAll!.x)).toBeLessThan(1);

  const sectionBoxFiltered = await kitsSection.boundingBox();
  await page.screenshot({
    animations: "disabled",
    clip: {
      x: 0,
      y: sectionBoxFiltered!.y,
      width: 1280,
      height: Math.min(sectionBoxFiltered!.height, 800),
    },
    path: "screenshots/browse-kits-filter-60.png",
  });
});

test("kit Configure preselects the kit in the configurator", async ({
  page,
}) => {
  // The anchored request may hit a real OpenAI key for intent/explanations;
  // allow for that latency on top of the default budget.
  test.setTimeout(120_000);
  await page.goto("/browse");

  const kitsSection = page.getByRole("region", { name: /Kits\./ });
  const gmk67Card = kitsSection
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: /^GMK67/ }) });

  await gmk67Card.getByRole("link", { name: "Configure" }).click();

  await expect(page).toHaveURL(/\/configurator\?kit=gmk67/);

  // The anchored recommendation resolves the kit as the build headline;
  // switches/keycaps remain user choices in the progressive assembly.
  await expect(
    page.getByRole("heading", { level: 1, name: /GMK67/ }),
  ).toBeVisible({ timeout: 90_000 });

  const nav = page.getByRole("navigation").first();
  await expect(nav.getByRole("link", { name: "Browse" })).toBeVisible();

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "screenshots/browse-configure-preselect.png",
  });
});
