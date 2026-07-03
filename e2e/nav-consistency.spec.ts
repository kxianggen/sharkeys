import { expect, test } from "@playwright/test";

/**
 * Nav-consistency check: every top-level page must render the single shared
 * MainNav — identified by the nav landmark containing the Sharkeys logo link
 * and the full centered link set (Configurator / Browse / Gallery / Builds /
 * Log in). Also captures a full-page screenshot per page for review.
 */
const pages = [
  { name: "configurator", path: "/configurator" },
  { name: "browse", path: "/browse" },
  { name: "gallery", path: "/community-gallery" },
  { name: "builds", path: "/my-builds" },
] as const;

for (const { name, path } of pages) {
  test(`shared nav renders on ${name} (${path})`, async ({ page }) => {
    await page.goto(path);

    const nav = page.getByRole("navigation").first();
    await expect(nav).toBeVisible();

    // Logo link home.
    await expect(nav.getByRole("link", { name: "Sharkeys" })).toBeVisible();

    // Full shared link set with the accessible route names.
    await expect(nav.getByRole("link", { name: "Configurator" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Browse" })).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Community Gallery" }),
    ).toBeVisible();
    await expect(nav.getByRole("link", { name: "My Builds" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Log in" })).toBeVisible();

    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: `screenshots/${name}.png`,
    });
  });
}
