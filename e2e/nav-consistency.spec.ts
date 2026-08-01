import { expect, test } from "@playwright/test";

/**
 * Nav-consistency check: every top-level page must render the single shared
 * MainNav — identified by the nav landmark containing the Sharkeys logo link,
 * the centered route-link set (Configurator / Browse / Community), and the
 * account flyout trigger. Builds now lives inside the account panel, not the
 * top nav. Also captures a full-page screenshot per page for review.
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
    // UAT finding 3: My Builds is now a first-class destination in the shared
    // bar. It previously lived only inside the account flyout, and testers
    // could not find where their saved builds went. This assertion is the
    // inverse of what it used to be — it asserted the link was absent.
    const myBuilds = nav.getByRole("link", { name: "My Builds" });
    await expect(myBuilds).toBeVisible();
    await expect(myBuilds).toHaveAttribute("href", "/my-builds");
    // The account flyout trigger remains; the panel keeps its own "View all"
    // link, so the two do not collide on accessible name.
    await expect(nav.getByRole("button", { name: "Account" })).toBeVisible();

    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: `screenshots/${name}.png`,
    });
  });
}
