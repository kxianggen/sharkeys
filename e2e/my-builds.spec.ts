import { expect, test } from "@playwright/test";

/**
 * Account-backed /my-builds. Headless runs have no Supabase session (and the
 * dev server may run without Supabase env entirely), so only the logged-out
 * prompt is verifiable here. The signed-in list/actions and the localStorage
 * migration are covered by unit tests (tests/app/my-builds-page.test.tsx,
 * tests/components/local-builds-migrator.test.tsx) — full login e2e would
 * need a seeded Supabase test user.
 */
test("my-builds shows the login prompt when signed out", async ({ page }) => {
  await page.goto("/my-builds");

  await expect(page.getByRole("heading", { name: "My Builds" })).toBeVisible();
  await expect(
    page.getByText(/Saved builds live with your account/i),
  ).toBeVisible();

  // The page CTA carries the redirect back to /my-builds after login.
  const cta = page.getByRole("link", { name: "Log in" }).and(
    page.locator('[href="/login?next=/my-builds"]'),
  );
  await expect(cta).toBeVisible();
  await expect(page.getByRole("link", { name: /Create account/i })).toBeVisible();

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "screenshots/my-builds-logged-out.png",
  });
});
