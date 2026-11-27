# WS4 — Build UX: split, refine, compare, share, clone

## Paste this to start (Claude Code, repo root, branch `v2-ws4-build-ux`)

> You're working on Sharkeys v2, workstream WS4. Read `docs/v2/00-plan.md` and `docs/v2/WS4-build-ux.md`. Start in plan mode and wait for my approval. Step 1 is a pure refactor: behaviour and screenshots must not change. When you finish, fill in "Report back", then walk me through the Learn card in plain words.

## Why

- The configurator is a single 4,048-line file (`src/components/recommendation-demo.tsx`), so every change is slow and risky.
- Users can't easily nudge a result.
- Compare, share and clone are missing. Your audit scored clone NOT DELIVERED and called it the most consequential competitive gap; share was scored PARTIAL.

## Targets

| Metric | Target |
|---|---|
| Turns to a build the persona accepts (simulation) | −30% |
| Share and clone events | Tracked |
| recommendation-demo | Split into components of under ~400 lines each, with e2e tests still passing |

## Subtasks

1. **Split the big file. This is a refactor only: no behaviour change.**
   - First, add or confirm Playwright tests covering the main flow.
   - Split by section: request input, result cards, build steps, preview, KeyBot panel.
   - The tests must pass before and after, and before/after screenshots must match.
   - Merge this step on its own first, because WS3 waits for it.
2. **Refine chips under each result:** Quieter · Cheaper · More premium · Different colour · Wireless · Smaller.
   - Each chip edits the structured requirements directly and re-runs recommendations. There's no AI call, so it's fast, free and predictable.
   - Show what changed, e.g. "switched to Gateron Silent, −RM40".
3. **Compare view.** Pick 2–3 builds and see them side by side: price, sound, layout, connection, with the key differences highlighted and a one-line "pick this if…".
4. **Share.**
   - A copy-link button.
   - A good link preview on WhatsApp and Instagram: an Open Graph image generated per build.
   - Shared links work without logging in.
5. **Clone.**
   - Add "Use this build" on gallery posts and shared links. It opens the configurator pre-filled.
   - The rule engine re-validates the build, because prices or parts may have changed since it was saved.
   - The user can then edit it.
6. **Simulation support.** Extend the WS0 runner so personas can "click" chips (send the chip action). This is how you measure the turns saved.
7. **Analytics:** add the `refine_clicked`, `build_shared` and `build_cloned` events.

## Tools

Playwright (already installed), Next.js Open Graph images (`ImageResponse` from `next/og`), and the existing validate API.

## Watch-outs

- Don't mix the refactor with new features in one PR.
- Keep the URL as the source of truth for a shared build, so links never break.

## Learn card

**Flow:** result → chip edits the requirements → recommendations re-run → see the difference → compare → share link (with preview image) → someone clones it → re-validated → edited.

- **Refactoring with a safety net:** tests first, then reshape the code, then the tests prove nothing broke.
- **Deterministic actions vs. AI calls:** buttons that don't need AI are cheaper, faster and predictable.
- **Open Graph:** the image and title apps show when a link is pasted.
- **State in the URL:** the link itself carries the build.
- **Re-validation:** never trust an old build without re-checking it.

**Interview questions to practise:**
- "Why aren't the chips AI?"
- "How did you refactor 4,000 lines safely?"
- "Why re-validate a cloned build?"

## Report back (session fills this in)

- What changed, in plain words, with the files
- New component sizes, and test results before/after
- Turns-to-build, before/after (simulation)
- Open questions for HQ
