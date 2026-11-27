import { expect, test, type Page } from "@playwright/test";

/**
 * Visual safety net for the WS4 refactor of recommendation-demo.tsx.
 *
 * Opt-in: run with VISUAL=1. Baselines are OS/font specific, so they stay
 * local (gitignored) and are only compared on the same machine: record them
 * on the pre-refactor code (`--update-snapshots`), then re-run after the
 * refactor and expect zero diffs. Needs a keyless dev server so results come
 * from the deterministic keyword fallback.
 */
test.skip(!process.env.VISUAL, "visual baseline runs only with VISUAL=1");

test.describe.configure({ mode: "serial" });

const shot = { animations: "disabled", fullPage: true, maxDiffPixels: 0 } as const;

async function waitForImages(page: Page) {
  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLImageElement>("img")]
      .filter((image) => image.loading !== "lazy" || image.getBoundingClientRect().top < window.innerHeight)
      .every((image) => image.complete),
  );
}

async function openConfigurator(page: Page) {
  await page.goto("/configurator");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: "Ask Meg" })).toBeVisible();
}

async function resolveChip(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).click();
  await expect(page.getByTestId("review-progress")).toBeVisible({ timeout: 45_000 });
  await page.waitForLoadState("networkidle");
  await waitForImages(page);
}

test("landing", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // The hero has a timed entrance; let it settle before capturing.
  await page.waitForTimeout(2_500);
  await waitForImages(page);
  await expect(page).toHaveScreenshot("landing.png", {
    animations: "disabled",
    maxDiffPixels: 0,
  });
});

test("configurator empty", async ({ page }) => {
  await openConfigurator(page);
  await expect(page).toHaveScreenshot("configurator-empty.png", shot);
});

test("configurator photo panel open", async ({ page }) => {
  await openConfigurator(page);
  await page.getByRole("button", { name: "Add an inspiration photo" }).click();
  await expect(page).toHaveScreenshot("configurator-photo-open.png", shot);
});

test("configurator thocky resolved", async ({ page }) => {
  await openConfigurator(page);
  await resolveChip(page, "Thocky");
  await expect(page).toHaveScreenshot("configurator-thocky.png", shot);
});

test("configurator thocky next card", async ({ page }) => {
  await openConfigurator(page);
  await resolveChip(page, "Thocky");
  await page.getByRole("button", { name: "Next recommendation" }).click();
  await waitForImages(page);
  await expect(page).toHaveScreenshot("configurator-thocky-next.png", shot);
});

test("configurator start from a build", async ({ page }) => {
  await openConfigurator(page);
  await resolveChip(page, "Thocky");
  await page.getByRole("button", { name: /^Select / }).click();
  await expect(
    page.getByRole("button", { name: "Save build", exact: true }),
  ).toBeEnabled({ timeout: 15_000 });
  await waitForImages(page);
  await expect(page).toHaveScreenshot("configurator-selected.png", shot);
});

test("configurator 65 layout", async ({ page }) => {
  await openConfigurator(page);
  await resolveChip(page, "65% Layout");
  await expect(page).toHaveScreenshot("configurator-65.png", shot);
});

test("configurator manual check open", async ({ page }) => {
  await openConfigurator(page);
  await resolveChip(page, "Thocky");
  await page.getByRole("button", { name: "Open manual check" }).click();
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("configurator-manual.png", shot);
});

test("configurator meg panel open", async ({ page }) => {
  await openConfigurator(page);
  await page.getByRole("button", { name: "Open Meg chat" }).click();
  await expect(page.getByRole("region", { name: "Meg keyboard helper" })).toBeVisible();
  await page.waitForTimeout(500);
  await expect(page).toHaveScreenshot("configurator-meg.png", {
    animations: "disabled",
    maxDiffPixels: 0,
  });
});
