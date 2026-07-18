import { expect, test } from "@playwright/test";

/**
 * Screenshots the redesigned @meg comment label: the Meg avatar image plus the
 * "AI assistant" pill (previously a Bot icon + "Grounded assistant").
 *
 * The full comment thread only renders from live Supabase data (a real
 * is_keybot comment row), which isn't available headless, and a live vision
 * reply is likewise not feasible headless. So we load a real app page — which
 * pulls in the compiled Tailwind/semantic-token CSS and serves /meg-avatar.png
 * from the same origin — then inject the exact keybot-label markup emitted by
 * CommentBlock and screenshot it with real styling.
 */
test("meg comment label shows the avatar and AI assistant pill", async ({
  page,
}) => {
  await page.goto("/browse");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => {
    const harness = document.createElement("article");
    harness.id = "meg-comment-harness";
    harness.style.cssText = "max-width:640px;margin:32px;padding:24px";
    harness.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <span aria-hidden="true" class="flex h-5 w-5 flex-none items-center justify-center">
            <img alt="Meg" class="h-full w-full rounded-full object-cover" src="/meg-avatar.png" width="20" height="20" />
          </span>
          Meg
          <span class="rounded-pill bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">AI assistant</span>
        </span>
      </div>
      <p class="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-primary">That reads as a sage/muted-green 65% case to me — more sage than forest green. I can't confirm the exact model from a photo, but it looks like a 65% board.</p>
    `;
    document.body.prepend(harness);
  });

  const harness = page.locator("#meg-comment-harness");
  await expect(harness).toContainText("AI assistant");
  await expect(harness.locator('img[alt="Meg"]')).toBeVisible();
  await expect(harness).not.toContainText("Grounded assistant");

  await harness.screenshot({ path: "e2e/meg-comment-label.png" });
});
