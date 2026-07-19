import { expect, test } from "@playwright/test";

/**
 * Landing-page sections (full-width feature cards, founder quote, customer
 * reviews with real 5.0 ratings, FAQ) + the check that builder-pick tags
 * render from the live Supabase catalog. Screenshots land in screenshots/.
 */

test("feature cards expand one at a time", async ({ page }) => {
  await page.goto("/");

  const section = page.getByTestId("feature-cards-section");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toBeVisible();

  const cards = page.getByTestId("feature-card");
  await expect(cards).toHaveCount(4);
  await expect(cards.nth(0)).toHaveAttribute("aria-expanded", "true");

  // Hover the third card: it expands, the first collapses.
  await cards.nth(2).hover();
  await expect(cards.nth(2)).toHaveAttribute("aria-expanded", "true");
  await expect(cards.nth(0)).toHaveAttribute("aria-expanded", "false");

  await section.screenshot({
    animations: "disabled",
    path: "screenshots/landing-feature-cards.png",
  });
});

test("founder quote stands alone with attribution and shop link", async ({
  page,
}) => {
  await page.goto("/");

  const section = page.getByTestId("founder-quote-section");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toContainText("I build keyboards");
  await expect(section).toContainText("Jayson");
  await expect(section).toContainText("Builder @ sharkeys.");
  await expect(
    section.getByRole("link", { name: "See my shop" }),
  ).toBeVisible();

  await section.screenshot({
    animations: "disabled",
    path: "screenshots/landing-founder-quote.png",
  });
});

test("customer reviews section shows the slideshow and real 5.0 ratings", async ({
  page,
}) => {
  await page.goto("/");

  const section = page.getByTestId("customer-reviews-section");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toContainText(
    "Trusted by 500+ customers across Malaysia",
  );

  const carousel = page.getByTestId("review-carousel");
  // Hover pauses auto-advance so the interactions below are deterministic.
  await carousel.hover();
  await expect(carousel).toContainText("Wei L.");
  await expect(carousel).toContainText("via Carousell");
  // The "1 of 3" counter is gone.
  await expect(carousel).not.toContainText("1 of 3");

  // Arrows wrap: Next moves to the second review.
  await carousel.getByRole("button", { name: "Next review" }).click();
  await expect(
    carousel.locator('figure[aria-hidden="false"]'),
  ).toContainText("Aiman R.");

  // Real ratings: genuinely 5.0 on both marketplaces.
  const ratings = page.getByTestId("marketplace-ratings");
  await expect(ratings.getByText("5.0")).toHaveCount(2);
  await expect(ratings).toContainText("Carousell");
  await expect(ratings).toContainText("Shopee");

  await section.screenshot({
    animations: "disabled",
    path: "screenshots/landing-reviews-trusted.png",
  });
});

test("FAQ accordion opens one answer at a time", async ({ page }) => {
  await page.goto("/");

  const section = page.getByTestId("faq-section");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toBeVisible();

  const first = section.getByRole("button", { name: /What is sharkeys\?/ });
  await expect(first).toHaveAttribute("aria-expanded", "true");

  const grounding = section.getByRole("button", {
    name: /Is the AI making things up\?/,
  });
  await grounding.click();
  await expect(grounding).toHaveAttribute("aria-expanded", "true");
  await expect(first).toHaveAttribute("aria-expanded", "false");

  await section.screenshot({
    animations: "disabled",
    path: "screenshots/landing-faq.png",
  });
});

test("landing page is free of the removed sections, top to bottom", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // The three retired sections are fully gone.
  await expect(page.getByText("How it works")).toHaveCount(0);
  await expect(page.getByText("Engineered for precision")).toHaveCount(0);
  await expect(page.getByText("Ready to hear the perfect click?")).toHaveCount(0);

  // The page still closes cleanly: FAQ then the footer.
  await expect(page.getByTestId("faq-section")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();

  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "screenshots/landing-full-page.png",
  });
});

test("builder-pick tag renders from the live Supabase catalog", async ({
  page,
}) => {
  await page.goto("/browse");
  await page.waitForLoadState("networkidle");

  const luckyCard = page.getByTestId("kit-card").filter({ hasText: "Lucky65" });
  await luckyCard.scrollIntoViewIfNeeded();
  await expect(luckyCard.getByTestId("builder-pick-tag")).toBeVisible();

  await luckyCard.screenshot({
    animations: "disabled",
    path: "screenshots/browse-builder-pick-live.png",
  });
});
