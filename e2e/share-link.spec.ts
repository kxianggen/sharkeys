import { expect, test } from "@playwright/test";

/**
 * Share links (WS4): the URL carries the build, the page works logged out,
 * re-checks the build against today's catalogue, and has a per-build link
 * preview image. Keyless dev server.
 */
const ids = [
  "case_lucky65_v3_65_aluminum",
  "pcb_lucky65_v3_65_hotswap",
  "plate_lucky65_v3_65_fr4",
  "switch_gateron_milky_yellow_pro",
  "keycap_unknown_pudding_oem_pbt",
  "stab_lucky65_v3_screw_in",
];
const sharePath = `/configurator/b/v1.${ids.join(".")}`;

test("Share on a result card copies a link that opens logged out", async ({
  browser,
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Thocky", exact: true }).click();

  const carousel = page.locator('section[aria-label="Start from a build"]');
  const share = carousel.getByRole("button", { name: "Share" });
  await expect(share).toBeVisible({ timeout: 45_000 });
  await share.click();
  await expect(carousel.getByRole("button", { name: "Link copied" })).toBeVisible();

  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(/\/configurator\/b\/v1\.[a-z0-9_.-]+$/);

  // A brand-new browser context: no cookies, no session.
  const stranger = await browser.newContext();
  const strangerPage = await stranger.newPage();
  await strangerPage.goto(link);
  await expect(strangerPage.getByText("Shared build")).toBeVisible();
  await expect(strangerPage.getByTestId("shared-build-status")).toContainText(
    "every part still fits",
  );
  await stranger.close();
});

test("shared page has link-preview tags and a PNG preview image", async ({
  page,
  request,
}) => {
  await page.goto(sharePath);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lucky65 V3 65%");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Lucky65 V3 65% with Gateron Milky Yellow Pro/,
  );

  const imageUrl = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(imageUrl).toContain(`${sharePath}/opengraph-image`);

  const image = await request.get(new URL(imageUrl!).pathname + new URL(imageUrl!).search);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");
});

test("a link to a retired part says the build needs a change", async ({ page }) => {
  await page.goto(sharePath.replace(ids[3], "switch_retired_example"));

  await expect(page.getByTestId("shared-build-status")).toContainText(
    "needs a change",
  );
  await expect(page.getByText("No longer available")).toBeVisible();
});

test("a malformed link is a 404", async ({ page }) => {
  const response = await page.goto("/configurator/b/not-a-build");

  expect(response?.status()).toBe(404);
});
