# Cleanup Review — sharkeys

**Status: EXECUTED 2026-07-26.** Every file in the repo was surveyed; all five
tiers below were approved and removed. Kept as a record of what went and why.

## Outcome

- **~387 MB** reclaimed (`.next/` alone was 379 MB)
- **41 tracked files** deleted — visible in `git status`, not yet committed
- `src/data/hero-demo-build.ts:11` — stale `scripts/probe-hero-demo.ts`
  reference reworded
- **Verified:** `tsc --noEmit` output is byte-identical before and after the
  cleanup. The one pre-existing error (`hero-configurator-demo.tsx:278`,
  `layouts` on a narrowed union) and the pre-existing lint errors
  (`use-typewriter.ts` set-state-in-effect) were confirmed present at `HEAD`
  before anything was touched. **The cleanup introduced zero new errors.**

---

## Tier 1 — Junk artifacts, zero risk (~383 MB)

All gitignored, none tracked, all regenerate on demand.

| Path | Size | Why it's safe |
|---|---|---|
| `.next/` | 379 MB | Next build cache — rebuilt by `npm run build` |
| `.playwright-cli/` | 3.5 MB | 93 stale console logs, May–Jun 2026 |
| `tmp/` | 304 KB | One-off Phase 9B catalog-sync SQL + chunks + extracted PDF text (May) |
| `test-results/` | 4 KB | Playwright `.last-run.json` |
| `tsconfig.tsbuildinfo` | 252 KB | TS incremental cache |
| `src/.DS_Store` | — | macOS junk |
| `public/keycaps/`, `public/stabilizers/`, `public/switch/` | 0 B | Empty dirs, superseded by `public/parts/` |

> `node_modules/` (683 MB) is separate — reinstallable via `npm install`, but
> don't delete it unless you want to sit through a reinstall.

---

## Tier 2 — Dead source code (3 files, tracked)

None of these are imported anywhere in `src/`, `tests/`, or `e2e/`.

| File | Why |
|---|---|
| `src/lib/actions/gallery.ts` | Superseded by `src/app/community-gallery/actions.ts`. All 3 exports (`saveBuildPost`, `getCommunityGallery`, `getUserBuilds`) have zero importers. |
| `src/lib/supabase/browser.ts` | `createSupabaseBrowserClient` has zero importers and isn't re-exported from `src/lib/supabase/index.ts`. Its doc comment claims login/signup/comment-composer use it — they don't. |
| `src/components/status-card.tsx` | `StatusCard` has zero importers. |

I'd run `npm run verify` immediately after removing these.

---

## Tier 3 — Byte-identical duplicates (~3.9 MB, tracked)

Verified by checksum, not by filename.

**`kit-images-inbox/` top-level files are exact copies of files in `variants/`:**

- `gmk104 black.png` = `variants/gmk104-black.png`
- `gmk61 black.png` = `variants/gmk61-black.png`
- `gmk67 black.png` = `variants/gmk67-black.png`
- `leobog hi75 black.png` = `variants/hi75c-black.png`
- `lucky65 v3 black.png` = `variants/lucky65-black.png`
- `weikav star 80 black.png` = `variants/star80-black.png`

**Also:**

- `kit-images-inbox/previous/` — 5 PNGs (1.4 MB), explicitly the superseded generation
- `screenshots/browse-builder-pick.png` = `browse-builder-pick-live.png` (identical)

---

## Tier 4 — Orphan screenshots (~1.7 MB, tracked) — your call

24 of the 41 screenshots are written by an e2e spec and regenerate on
`npx playwright test`. These 17 are not written by any spec — ad-hoc captures
from earlier phases:

```
browse-builder-pick.png            gallery.png
browse.png                         landing-centered.png
builds.png                         landing.png
community-list.png                 meg-thinking-midcycle.png
community-post-collapsed-comment.png   post-image-uploaded-vs-fallback.png
community-post-detail.png          publish-build-optional.png
configurator.png                   publish-form-image-control.png
gallery-text-only-card.png         publish-form-image-preview.png
                                   publish-kit-locked.png
```

**Flag:** these are exactly the kind of figures an FYP report uses. Deleting is
safe for the code, but check them against your write-up first.

Also `e2e/meg-comment-label.png` — a test *output* sitting in the source dir.
Regenerable; it belongs in `screenshots/` or nowhere.

---

## Tier 5 — Markdown

### Keep

| File | Why |
|---|---|
| `CLAUDE.md`, `README.md` | Live project docs |
| `Context.md` | Requirements spec — FYP source of truth |
| `docs/code-understanding-roadmap.md` | Your active study plan |
| `docs/session-2-location-map.md` | Active study aid (untracked — worth committing) |
| `docs/eval-report.md` | Phase 1→5 metrics. This is defence evidence, not scratch. |
| `docs/catalog-research/phase-9b-malaysia-candidates.md` | Catalog sourcing provenance — defensible "where did your data come from" |
| `src/data/README.md`, `part-images-inbox/README.md` | Explain live workflows |

### Remove

| File | Why |
|---|---|
| `walkthrough.md` | Phase 3-only build log. Superseded by `CLAUDE.md` + the roadmap. Purely historical. |

### Your call

| File | Why it's ambiguous |
|---|---|
| `docs/task.md` | Phase 1–5 tracker, mostly ticked, deadline early Aug 2026. Dead weight if you've moved on; still useful if it's your live plan. |

---

## Do NOT delete (checked and cleared)

- **`public/parts/*.webp` and `public/kits/*.webp`** — a filename grep says
  "unreferenced," but they're resolved dynamically as `` `/parts/${component.id}.webp` ``
  in `browse-catalog.tsx`, `kit-image.tsx`, `hero-configurator-demo.tsx`.
  All 24 are live.
- **`scripts/run-prompt-ab.ts`** — not in `package.json`, but it's the runner
  behind the prompt A/B in `docs/eval-report.md` and is cited in
  `src/lib/ai/prompts.ts`. It's evidence for a decision you'll defend. Keep.
- **`kit-images-inbox/variants/` non-black colorways** — unused today, but
  they're the source set for kit colour options.

---

## Not a deletion — one stale reference to fix

`src/data/hero-demo-build.ts:11` cites `scripts/probe-hero-demo.ts`, which no
longer exists. The comment should say the fixture was recorded from a one-off
probe script that has since been removed.
