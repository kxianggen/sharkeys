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
