# Manual capture procedure — authenticated save confirmation

Covers the one screenshot pair `e2e/uat-evidence.spec.ts` cannot produce.
Playwright starts from a clean browser context with no Supabase session, so
clicking **Save build** there always resolves to the logged-out branch. The
confirmation C2 changes is the **authenticated** one
(`src/components/recommendation-demo.tsx:1694` and `:2234`).

Run this **twice**: once before the C2 fix, once after. The steps are identical
both times — only the output filename changes. Do not improvise between runs;
if you deviate on the second pass, the pair stops being a comparison.

## Fixed conditions

| Setting | Value | Why |
|---|---|---|
| Browser | Chrome, one window, no extensions bar visible | Consistent chrome and font rendering |
| Zoom | 100% (`Cmd+0`) | Zoom silently changes layout breakpoints |
| Viewport | 1280 x 800 via DevTools device toolbar | Matches `playwright.config.ts`, so this shot sits alongside the automated ones |
| Capture | DevTools **Capture screenshot** command | Captures exactly the viewport, independent of window size and OS chrome |
| Theme | Whatever the app defaults to — do not toggle | Must match between runs |

Set the viewport with `Cmd+Shift+M` (device toolbar), choose **Responsive**,
type `1280` x `800`. Leave DPR at default.

## Steps

1. Start the dev server: `npm run dev`.
2. Open Chrome, apply the fixed conditions above.
3. Go to `http://localhost:3000/login` and sign in. **Use the same account both
   times** — the confirmation renders a build title, and a different account
   could resolve a different build.
4. Go to `http://localhost:3000/configurator`.
5. Click the **Thocky** prompt chip. Wait for the build to resolve (the `h1`
   build title and the kit visual appear). Live intent extraction can take
   several seconds.
6. Click the **Select …** button in the *Start from a build* carousel. This
   populates every free-choice section in one action, which is what makes the
   run repeatable — do not pick parts by hand.
7. Wait for **Save build** in the sticky footer to become enabled, then click
   it.
8. Wait for the confirmation notice to appear.
9. Put the notice in frame deterministically. In the DevTools console:

   ```js
   [...document.querySelectorAll("p, div")]
     .find((el) => /saved to your builds/i.test(el.textContent ?? ""))
     ?.scrollIntoView({ block: "center", behavior: "instant" });
   ```

   This same selector matches both states: before the fix the sentence reads
   "… saved to your builds. View saved builds on the My Builds page."; after
   the fix the trailing phrase becomes a link.

10. `Cmd+Shift+P` → type `screenshot` → **Capture screenshot**.
11. Save as:
    - before: `screenshots/uat-before-c2-save-confirmation-authed.png`
    - after: `screenshots/uat-after-c2-save-confirmation-authed.png`

## What must be in frame

- The full confirmation sentence, not clipped at either end. This is the whole
  point of the shot: before, "the My Builds page" is plain text; after, it is a
  link to `/my-builds`.
- Enough surrounding page to establish it is the configurator — the sticky
  footer with the build name and the **Save build** button should be visible.
- The main nav, if it fits without shrinking the notice. In the after-shot it
  also carries the new **My Builds** link, which is the other half of C2.

## If the run goes wrong

If **Save build** never enables, the build did not fully resolve — reload
`/configurator` and start from step 5 rather than clicking parts manually.

If you are logged out, the notice reads "Log in to save builds to your
account." That is the wrong branch; this procedure needs the authenticated one.
