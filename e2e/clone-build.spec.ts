import { expect, test } from "@playwright/test";

/**
 * Clone (WS4): "Use this build" opens the configurator pre-filled from the
 * link, re-checked against today's catalogue. Keyless dev server.
 */
const ids = [
  "case_lucky65_v3_65_aluminum",
  "pcb_lucky65_v3_65_hotswap",
  "plate_lucky65_v3_65_fr4",
  "switch_gateron_milky_yellow_pro",
  "keycap_unknown_pudding_oem_pbt",
  "stab_lucky65_v3_screw_in",
];
const code = `v1.${ids.join(".")}`;

test("Use this build pre-fills the configurator and re-checks it", async ({ page }) => {
  await page.goto(`/configurator/b/${code}`);
  await page.getByRole("link", { name: "Use this build" }).click();

  await expect(page.getByTestId("clone-notice")).toContainText(
    "every part still fits",
    { timeout: 45_000 },
  );
  await expect(
    page.locator('#configurator-section-switches button[aria-pressed="true"]'),
  ).toContainText("Gateron Milky Yellow Pro");
  await expect(
    page.getByRole("button", { name: "Save build", exact: true }),
  ).toBeEnabled({ timeout: 15_000 });
});

test("a retired part is left for the user to replace", async ({ page }) => {
  await page.goto(`/configurator?build=${code.replace(ids[3], "switch_retired_example")}`);

  await expect(page.getByTestId("clone-notice")).toContainText(
    "no longer in the catalogue",
    { timeout: 45_000 },
  );
  await expect(
    page.locator('#configurator-section-switches button[aria-pressed="true"]'),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save build", exact: true })).toBeDisabled();
});
