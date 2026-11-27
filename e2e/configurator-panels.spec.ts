import { expect, test } from "@playwright/test";

/**
 * Configurator side panels: photo drop, Meg chat and the manual check. Added
 * before the WS4 split so the refactor has coverage beyond the main flow.
 * Keyless dev server (deterministic fallback); no Meg message is sent.
 */

test("photo panel toggles open and closed", async ({ page }) => {
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");

  const toggle = page.getByRole("button", { name: "Add an inspiration photo" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator('input[type="file"]')).toHaveCount(1);
  await toggle.click();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
});

test("Meg panel opens from the header and closes again", async ({ page }) => {
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Open Meg chat" }).click();
  const panel = page.getByRole("region", { name: "Meg keyboard helper" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("textbox", { name: "Meg question" })).toBeVisible();
  await expect(
    panel.getByRole("button", { name: "Send Meg question" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Close Meg assistant" }).click();
  await expect(panel).toHaveCount(0);
});

test("manual check validates a hand-picked build", async ({ page }) => {
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Thocky", exact: true }).click();
  await expect(page.getByTestId("review-progress")).toBeVisible({
    timeout: 45_000,
  });

  await page.getByRole("button", { name: "Open manual check" }).click();
  const validate = page.getByRole("button", { name: "Validate manual build" });
  await expect(validate).toBeVisible();
  await expect(page.getByRole("button", { name: "Hide manual check" })).toBeVisible();
});
