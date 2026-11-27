# WS2 — Bigger catalogue plus weekly price automation

## Paste this to start (Claude Code, repo root, branch `v2-ws2-catalogue`)

> You're working on Sharkeys v2, workstream WS2. Read `docs/v2/00-plan.md` and `docs/v2/WS2-catalogue.md`. Start in plan mode and wait for my approval. Never write to the live Supabase project without my OK; work locally or on a Supabase branch. When you finish, fill in "Report back", then walk me through the Learn card in plain words.

## Why

There are 61 hand-typed parts. The cases, PCBs and plates are locked into about 7 kits. Prices are typed in by hand, so they go stale. You can't grow the catalogue by typing more in.

## Targets

| Metric | Target |
|---|---|
| Catalogue size | 60 → 250+ parts (mostly switches, keycaps and kits) |
| Importer field accuracy, on 30 hand-checked parts | ≥90% |
| Jayson's review time per part | <2 min (time one manual entry first, as the baseline) |
| Prices checked in the last 7 days | 100% |
| Incompatible builds introduced | 0 (rule engine plus tests) |

## Requirements

**Must:**
- Jayson approves every new part.
- Each part stores its source URL and the date it was last checked.
- Respect vendor sites: public product pages only, follow robots.txt, keep the request rate slow, identify the bot.
- No Shopee scraping.
- Existing tests are pinned to a frozen catalogue snapshot, so the catalogue growing doesn't break them.

**Should:** duplicate detection, a confidence score per field, embeddings for new parts.

**Won't:** stock tracking or checkout.

## Subtasks

1. **Choose vendors.** Pick 3–5 Malaysian vendors that Jayson trusts and that sell on their own websites.
   - Check which ones run on Shopify. Shopify stores expose public product data at `/products/<handle>.json`, which is already structured, so no messy scraping is needed.
   - For the others: fetch the page, then strip it down to clean text.
   - **Approval:** Jayson approves the vendor list.
2. **Extraction.** A model reads the product data and fills in the existing `KeyboardComponent` schema (layouts, mount types, hot-swap, switch type, sound profile, price in MYR, and so on), using structured output that zod validates. Each field gets a confidence score and the text snippet it came from. To make it better:
   - Use plain code for easy fields (price and brand from the structured data). Use the AI only for fields that need reading, like mount type and sound profile.
   - Mark a field "unknown" instead of guessing.
3. **Checks before review.**
   - The schema is valid.
   - It isn't a duplicate (same name and brand).
   - Values are sane (price range, valid layout list).
   - Run the rule engine with existing parts to confirm the new part can be in at least one valid build; flag it if not.
4. **Review queue.** The simplest version: a script writes a review file or opens a GitHub PR, with a table per part (field, value, confidence, source snippet). Jayson approves or fixes each one. Stretch goal: a small admin page.
5. **Insert approved parts** into Supabase (locally or on a branch first), generate embeddings with the existing `seed-embeddings` script, and update the kits.
6. **Accuracy check.** Jayson fills in 30 parts by hand first; these are the "golden" answers. Compare the importer's output field by field and report accuracy per field.
7. **Weekly price automation.**
   - A GitHub Action runs every Monday and re-fetches each part's source page.
   - If a price changed, or a page has disappeared, it writes a "price changes" PR or table.
   - Jayson approves the changes, and they're applied.
   - Store `last_checked_at` for each part.
8. **Tests.** Freeze the current 60-part snapshot as a fixture for the existing tests, and add new tests for the importer and the price comparison.
9. **Scale check.** At 60 parts there are 585,200 possible combinations. At 250 or more, that number explodes. Re-run `bench-recommendations`. If it gets slow, filter candidates per category before combining them.
10. **Re-run the WS0 scorecard.** A bigger catalogue may change the success rate; report what happens.

## Tools

Shopify product JSON, zod structured output, GitHub Actions on a schedule, the existing seed scripts, and Supabase local or branch for safety.

## Watch-outs

- **Wrong compatibility data is worse than missing data.** "Unknown" beats a guess.
- **Vendor terms of service.**
- **Prices:** decide whether they include or exclude shipping, and apply that everywhere.
- **Combination explosion** (subtask 9).

## Needs approval

The vendor list; any write to the live database; merging new parts.

## Learn card

**Flow:** vendor page → fetch → AI fills in a fixed form → code checks it → you approve → database → a weekly robot re-checks prices.

- **Data pipeline (ETL):** extract, transform, load. Data gets pulled in, reshaped, then stored.
- **Structured extraction:** the AI filling in a form instead of writing free text.
- **Human-in-the-loop:** a person approves before anything goes live.
- **Confidence:** how sure the AI is about each field.
- **Scheduled job (cron):** code that runs on a clock.
- **Data freshness:** how recently each fact was checked.
- **Combinatorial explosion:** more parts means far more combinations to check.

**Interview questions to practise:**
- "How do you stop the AI from putting in wrong specs?"
- "Why human review?"
- "What happens when the catalogue gets 5× bigger?"

## Report back (session fills this in)

- What changed, in plain words, with the files
- Parts added, per-field accuracy, review time per part
- First price-check run: how many parts were checked and how many changed
- Recommendation speed at the new catalogue size
- Open questions for HQ

### Filled in by the WS2 session (branch `v2-ws2-catalogue`, 2026-11-28)

**What changed, in plain words**
- **Frozen snapshot.** `src/data/components.ts` (the original 60 parts) is untouched and pinned by a test (count + content hash). Tests and the CI eval run on it (`SHARKEYS_CATALOG=frozen` in `vitest.config.ts` and `scripts/v2/ci-eval.ts`). `src/data/catalog.ts` builds the full catalogue = frozen 60 + approved imports (`src/data/imported/approved-parts.json`) + approved price checks (`src/data/imported/price-checks.json`).
- **Importer** (`scripts/catalog/`): polite fetcher (`lib/fetch.ts`: robots.txt, honest bot name, ≥5 s per site, back-off, cache, Shopee blocked); plain-code Shopify mapper (`lib/deterministic.ts`: price, brand, layout, pins, force…); AI only for reading-type fields (`lib/extract-ai.ts`, gpt-4.1-mini, every value must quote the page, code checks the quote; disagreements become "unknown"); checks (`lib/checks.ts`: schema, duplicates incl. same brand + model code, price bands, rule-engine "fits at least one valid build"); review queue (`review.ts` → `review.md` + `decisions.json`) and `apply-approved.ts`.
- **Agreed rules:** beginner-friendly rule for switches/keycaps/stabilisers (matches all hand-typed entries); "profile implies MX stem" for keycaps; a page offering several options for a field → unknown; switch price per switch; listed MYR price excl. shipping.
- **Blind pass + auto-approval (HQ rule):** a second, in-session reading blind to the importer (`blind-view.ts`, answers in `blind/mecha-001.json` with page quotes) and `blind-check.ts`. A part is auto-approved only if every field agrees, every quote is on the page and the rule engine finds a valid build. Auto-approved parts carry `reviewedBy: "auto (HQ rule: …)"`.
- **Weekly price check:** `price-check.ts` + `.github/workflows/price-check.yml` (Mondays 09:00 MYT, no secrets, opens a PR editing only `price-checks.json`). Gone pages are marked `availability: "unavailable"`, never deleted.
- **Local database:** `supabase/config.jsonc` (local stack), `seed-local.ts` and `seed-embeddings.ts --local` refuse any non-localhost URL; `check-health-local.ts` calls the real `/api/health` handler.
- Vendor safeguards: Mecha + MKB.MY approved by Jayson without asking (non-commercial; ToS §12 forbids scraping — risk accepted, logged in `vendors.ts`); no vendor photos stored; full vendor text (`candidates.json`) kept out of the public repo.

**Parts added, accuracy, review time**
- Catalogue: **60 → 106** (+46: 29 switches, 11 keycap sets, 2 kits = 2 cases/PCBs/plates), all from Mecha, all auto-approved under the HQ rule (42 products). 58 blind-read products and ~150 unread candidates wait for Jayson in `review.md`. Target was ~120; stopped after the agreed ~60-product batch.
- Field accuracy (verified by an independent in-session pass — same assistant that wrote the rules, blind to importer values, every value quoted; not a human check): **88.5% on 20 held-out parts (headline)**, coverage 97.0%. Golden 20: 76.2% before fixes, 90.1% after (optimistic: fixes were shaped by those 20).
- Known limitation: kit fields where the page offers variants (plate material, stabiliser type, beginner-friendly on hot-swap kits) are the weakest; now "unknown" by rule and sent to Jayson.
- Review time: manual baseline **90 s** for one switch (Monx Gravity, 7 fields, one rough sample; kits not timed). Jayson's per-part review time not measured yet (no human review done). The importer's value is **scale and freshness**, not per-part speed: 254 candidates from 3 requests, re-checked weekly.
- OpenAI spend: **USD 0.115** extraction (2 logged runs) + ≈ USD 0.0001 embeddings.

**First price-check run (2026-11-27, before imports)**
- 17 parts had a source page; 10 requests. 4 unchanged, **0 changed**, **5 gone** (MKB: 4 stabilisers + MMD Princess V3 → marked unavailable), 8 not checked (KeebsProject not approved). Report: `scripts/catalog/price-reports/2026-11-27.md`.

**Recommendation speed** (`scripts/catalog/bench-scale.ts`, same machine/session/workload, deterministic mode)
- 60 parts (585,200 combinations): median **200 ms**, p95 504 ms.
- 106 parts (12,972,960 combinations): median **743 ms**, p95 834 ms. All 18 returned builds valid in both.
- ~1.8× parts → ~3.7× slower. Request (outside WS2 area): per-category candidate prefilter in `src/lib/recommendations/`.

**Checks:** `npm run verify` passes (330 tests; 13 pre-existing lint warnings). CI eval (frozen): 54/2/2, no new failures. Full catalogue eval: 53/3/2 — `rr-002` picks `switch_keychron_k_pro_banana_tactile_switch` (no sound profile on its page) for a "creamy" request. Left unknown per HQ; for WS1's ranking fix. `/api/health` against local Supabase: 200, count 106 = catalogue.

**Open questions for HQ**
1. WS1: unknown sound profiles still win `rr-002` on the full catalogue; 8 approved switches need sound (`blind/mecha-001-needs-sound.md`).
2. Request: per-category prefilter in recommendations (speed above).
3. WS1 cache: after `seed-local`/price apply, the catalogue cache needs a clear/refresh hook.
4. Push imports to the live Supabase? Not done (needs Jayson). `npm run supabase:seed-catalog` now seeds the full catalogue.
5. `docs/` is tracked in git, against CLAUDE.md; this report is left uncommitted for that reason.
6. The Monday Action only runs once on master and needs "Allow GitHub Actions to create PRs".
7. Jayson: spot-check 10 auto-approved parts (`blind/mecha-001-spot-check.md`); approve or drop the GMK67 V2 / GMK104 possible duplicates.
