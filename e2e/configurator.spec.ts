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

  await expect(page.getByText("Validated · every part compatible")).toBeVisible(
    { timeout: 20_000 },
  );
  await expect(page.getByText("Recommended for you")).toBeVisible();

  // Kit visual must actually decode before the capture (alt: "<name> kit").
  await expect(page.getByAltText(/ kit$/)).toBeVisible();
  await page.waitForFunction(() => {
    const image = document.querySelector<HTMLImageElement>('img[alt$=" kit"]');

    return Boolean(image && image.complete && image.naturalWidth > 0);
  });

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "screenshots/configurator-resolved.png",
  });
});
