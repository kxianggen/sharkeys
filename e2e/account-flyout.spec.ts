import { expect, test } from "@playwright/test";

/**
 * Account flyout: clicking the account icon expands the shared nav bar itself
 * (Apple-style) to reveal the panel inside the bar's own surface, and dims +
 * blurs the page behind it. This captures the logged-out state (the only state
 * reachable headless without a seeded Supabase session — see note below), and
 * verifies the open/close contract via Escape.
 *
 * A logged-in-with-builds screenshot requires a real Supabase session cookie
 * and seeded saved_builds rows, which are not available in the offline/headless
 * harness (placeholder env → the panel stays signed out). Left to manual /
 * seeded-environment verification.
 */
test("account flyout expands the nav bar with a blurred backdrop (logged out)", async ({
  page,
}) => {
  await page.goto("/configurator");

  const trigger = page.getByRole("button", { name: "Account" });
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.click();

  const panel = page.getByRole("dialog");
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  // Signed-out panel prompts sign-in.
  await expect(panel.getByRole("link", { name: "Sign in" })).toBeVisible();

  await page.screenshot({
    animations: "disabled",
    path: "screenshots/account-flyout-logged-out.png",
  });

  // Escape closes and focus returns to the trigger.
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});
