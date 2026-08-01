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

**The before-shot was taken in Zen (Firefox-based), not Chrome.** The after-shot
must use the same browser, so the shortcuts below are the Firefox ones. Chrome's
do not apply.

| Setting | Value | Why |
|---|---|---|
| Browser | **Zen** (Firefox-based), one window | Must match the before-shot — font rendering and form controls differ between engines |
| Zoom | 100% (`Cmd+0`) | Zoom silently changes layout breakpoints |
| Viewport | 2560 x 1600, i.e. 1280 x 800 at DPR 2 | Logically matches `playwright.config.ts`, so this shot sits alongside the automated ones |
| Capture | `:screenshot` in the Console tab | Captures the viewport independent of window size and OS chrome |
| Theme | Whatever the app defaults to — do not toggle | Must match between runs |

Firefox shortcuts:

| Action | Shortcut |
|---|---|
| DevTools | `Cmd+Option+I` |
| Responsive design mode | `Cmd+Option+M` |
| Screenshot | type `:screenshot` in the Console tab |

`Cmd+Shift+M` is Chrome's responsive toggle and does something else here.
**`Cmd+Shift+P` opens a private window in Firefox — do not use it**; it is
Chrome's command palette, not Firefox's.

Set the viewport with `Cmd+Option+M`, choose **Responsive**, and enter the
dimensions above.

## Steps

1. Start the dev server: `npm run dev`.
2. Open Zen, apply the fixed conditions above.
3. Go to `http://localhost:3000/login` and sign in. **Use the same account both
   times** — the confirmation renders a build title, and a different account
   could resolve a different build.
4. Go to `http://localhost:3000/configurator`.
5. Click the **Thocky** prompt chip. Wait for the build to resolve (the `h1`
   build title and the kit visual appear). Live intent extraction can take
   several seconds.
6. **Pin the build identity first.** The before-shot's notice names
   *GMK67 65% Plastic Case with Gateron Milky Yellow Pro Linear Switch*. C1
   adds a colour scoring term to `service.ts`, so if the Thocky chip ever
   resolves to a different kit, the pair would differ by build as well as by
   the link, and the comparison would be worthless.

   If the first carousel card is not **GMK67 65%**, use the `<` / `>` arrows
   to reach it before selecting.

   (By design this should not happen: the colour term contributes nothing when
   no colour is requested, and "Thocky" names no colour. Treat the check as
   insurance, not as an expected correction — and if the card *has* changed,
   that is itself a finding worth reporting, because it means colour scoring
   altered a colour-free ranking.)

7. Adopt the build by clicking the **build card** under *Start from a build* —
   the whole card (thumbnail + kit name) is the button. Its accessible name is
   "Select &lt;kit&gt;", but **no visible text says "Select"**, so do not go
   looking for a labelled button. The card gains an accent border and ring
   once selected.

   This populates every free-choice section in one action, which is what makes
   the run repeatable — do not pick parts by hand.
8. Wait for **Save build** in the sticky footer to become enabled, then click
   it.

9. Wait for the confirmation notice to appear.

10. **Do not scroll.** The before-shot was taken without any scroll
    adjustment, with the notice sitting roughly **one third down the frame**.
    That is the reference framing and the after-shot must match it.

    An earlier draft of this procedure told you to centre the notice with a
    `scrollIntoView` console snippet. It was not used, so running it now would
    move the notice to a different position than the before-shot and break the
    comparison. It has been removed deliberately — do not reintroduce it.

    If the notice is not visible at all without scrolling, stop: something has
    changed in the layout, and that needs reporting rather than working around.

11. Capture: open the **Console** tab and type `:screenshot`.

12. Save as:
    - before: `screenshots/uat-before-c2-save-confirmation-authed.png` (done)
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
