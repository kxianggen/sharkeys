import { expect, test } from "@playwright/test";

/**
 * Compare view (WS4): tick builds on the result cards, see them side by side
 * with differing rows highlighted and a deterministic "Pick this if" line.
 * Keyless dev server (deterministic).
 */
test("compares a build with its Quieter refinement", async ({ page }) => {
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Thocky", exact: true }).click();

  const carousel = page.locator('section[aria-label="Start from a build"]');
  const compareToggle = carousel.getByRole("button", { name: "Compare" });
  await expect(compareToggle).toBeVisible({ timeout: 45_000 });

  await compareToggle.click();
  await expect(compareToggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("compare-hint")).toBeVisible();

  // Refine, then tick the new (silent) top build too.
  await page
    .getByRole("group", { name: "Refine this build" })
    .getByRole("button", { name: "Quieter" })
    .click();
  await expect(page.getByTestId("refine-change")).toContainText(/Silent/);
  await carousel.getByRole("button", { name: "Compare" }).click();

  const table = page.getByRole("region", { name: "Compare builds" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveCount(3);

  // Sound and price differ; the board layout does not.
  await expect(page.getByTestId("compare-row-sound")).toHaveAttribute("data-differs", "true");
  await expect(page.getByTestId("compare-row-price")).toHaveAttribute("data-differs", "true");
  await expect(page.getByTestId("compare-row-layout")).toHaveAttribute("data-differs", "false");

  const verdicts = page.getByTestId("compare-row-pick").getByRole("cell");
  await expect(verdicts).toHaveCount(2);
  await expect(verdicts.nth(0)).toHaveText("Pick this if you want the lowest price.");
  await expect(verdicts.nth(1)).toHaveText("Pick this if you want it quiet.");

  // Removing a build drops back to the one-build hint.
  await table.getByRole("button", { name: /^Remove / }).first().click();
  await expect(page.getByTestId("compare-hint")).toBeVisible();
});
