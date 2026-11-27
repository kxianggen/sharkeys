import { expect, test } from "@playwright/test";

/**
 * Refine chips (WS4): a chip edits the structured request and re-runs
 * recommendations with no AI call. Keyless dev server (deterministic).
 */
test("Quieter chip switches to a silent build and says what changed", async ({
  page,
}) => {
  const aiCalls: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/ai/") || url.includes("/api/keybot")) {
      aiCalls.push(url);
    }
  });

  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Thocky", exact: true }).click();

  const chips = page.getByRole("group", { name: "Refine this build" });
  await expect(chips).toBeVisible({ timeout: 45_000 });
  await expect(chips.getByRole("button")).toHaveCount(6);

  const refineResponse = page.waitForResponse("**/api/recommendations/refine");
  await chips.getByRole("button", { name: "Quieter" }).click();
  expect((await refineResponse).status()).toBe(200);

  const change = page.getByTestId("refine-change");
  await expect(change).toContainText(/Switched to .*Silent/);
  await expect(change).toContainText(/[+−]RM\d+/);

  // The new top build is silent, so Quieter can no longer change anything.
  await expect(chips.getByRole("button", { name: "Quieter" })).toBeDisabled();
  await expect(page.getByTestId("carousel-build-summary")).toContainText(/Silent/i);

  // Chips never route through AI endpoints.
  expect(aiCalls).toEqual([]);
});

test("Smaller chip steps the layout down", async ({ page }) => {
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Thocky", exact: true }).click();

  const chips = page.getByRole("group", { name: "Refine this build" });
  await expect(chips).toBeVisible({ timeout: 45_000 });
  await chips.getByRole("button", { name: "Smaller" }).click();

  await expect(page.getByTestId("refine-change")).toContainText(/75%/);
  await expect(page.locator('section[aria-label="Start from a build"]')).toContainText(
    "75% Layout",
  );
});
