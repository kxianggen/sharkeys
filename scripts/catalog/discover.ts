#!/usr/bin/env tsx
/**
 * Step 1 of an import batch: list a vendor's products and map each one with
 * plain code (no AI, no cost). Writes candidates.json and skipped.json.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/catalog/discover.ts \
 *     --vendor mkb --batch mkb-001 [--categories switch,keycap,kit] [--limit 40] [--max-pages 4]
 */
import { existsSync } from "node:fs";

import { createPoliteFetcher } from "./lib/fetch";
import { batchPaths, CACHE_DIR, parseArgs, readCandidates, requireArg, writeJson, type CandidatesFile, type SkippedProduct } from "./lib/batch";
import { mapShopifyProduct } from "./lib/deterministic";
import { aiExtractionSchema, mergeAiExtraction } from "./lib/extract-ai";
import { AI_FIELDS, type AiFieldName, type Candidate } from "./lib/fields";
import { parseShopifyProductList, shopifyListUrl } from "./lib/shopify";
import { requireApprovedVendor } from "./vendors";

/**
 * Re-merges a stored AI answer into a freshly mapped candidate, with the same
 * safeguards. Older candidates without the raw answer carry over only fields
 * the AI filled that plain code still leaves unknown.
 */
function carryOverAi(fresh: Candidate, old: Candidate): Candidate {
  const aiNotes = (c: Candidate) => c.notes.filter((n) => n.startsWith("AI"));
  if (old.ai) {
    const extraction = aiExtractionSchema.parse(old.ai.extraction);
    const asked = old.ai.asked.filter((name): name is AiFieldName => (AI_FIELDS as readonly string[]).includes(name));
    const merged = mergeAiExtraction(fresh, asked, extraction);
    return { ...merged, ai: old.ai, notes: [...merged.notes, "ai: done"] };
  }
  const fields = { ...fresh.fields };
  for (const name of AI_FIELDS) {
    if (old.fields[name].source === "ai" && fresh.fields[name].value === "unknown") {
      (fields as Record<string, unknown>)[name] = old.fields[name];
    }
  }
  return { ...fresh, fields, notes: [...fresh.notes, ...aiNotes(old), "ai: done"] };
}

async function main() {
  const args = parseArgs();
  const vendor = requireApprovedVendor(requireArg(args, "vendor"));
  const batchId = requireArg(args, "batch");
  const limit = typeof args.limit === "string" ? Number(args.limit) : Infinity;
  const maxPages = typeof args["max-pages"] === "string" ? Number(args["max-pages"]) : 4;
  const categories = typeof args.categories === "string" ? new Set(args.categories.split(",")) : undefined;

  const paths = batchPaths(batchId);
  if (existsSync(paths.candidates) && !args.force) {
    console.error(`${paths.candidates} exists. Use a new --batch id, or --force to overwrite it.`);
    process.exit(1);
  }
  if (vendor.platform !== "shopify") {
    console.error(`Vendor ${vendor.name} is "${vendor.platform}"; discovery for it is not built yet.`);
    process.exit(1);
  }

  const fetcher = createPoliteFetcher({ cacheDir: CACHE_DIR, log: console.log });
  const context = { vendorId: vendor.id, storeNames: vendor.storeNames, baseUrl: vendor.baseUrl };
  const collections = vendor.collections.length > 0 ? vendor.collections : [undefined];

  const candidates: Candidate[] = [];
  const skipped: SkippedProduct[] = [];
  const seen = new Set<string>();

  outer: for (const collection of collections) {
    for (let page = 1; page <= maxPages; page++) {
      const url = shopifyListUrl(vendor.baseUrl, collection, page);
      const response = await fetcher.get(url);
      console.log(`${response.fromCache ? "cache" : "fetch"} ${response.status} ${url}`);
      if (response.status !== 200) break;
      const products = parseShopifyProductList(response.body);
      if (products.length === 0) break;

      for (const product of products) {
        if (seen.has(product.handle)) continue;
        seen.add(product.handle);
        const mapped = mapShopifyProduct(product, context);
        if (mapped.kind === "skipped") {
          skipped.push({ key: mapped.key, title: mapped.title, sourceUrl: mapped.sourceUrl, reason: mapped.reason });
          continue;
        }
        const category = mapped.candidate.category.value;
        if (categories && !categories.has(String(category))) {
          skipped.push({ key: mapped.candidate.key, title: product.title, sourceUrl: mapped.candidate.sourceUrl, reason: `category ${String(category)} not in this batch` });
          continue;
        }
        candidates.push(mapped.candidate);
        if (candidates.length >= limit) break outer;
      }
      if (products.length < 250) break;
    }
  }

  // Re-running a batch (e.g. after a rule fix) keeps the paid AI answers.
  if (existsSync(paths.candidates)) {
    const previous = new Map(readCandidates(batchId).candidates.map((c) => [c.key, c]));
    let kept = 0;
    for (let i = 0; i < candidates.length; i++) {
      const old = previous.get(candidates[i].key);
      if (!old?.notes.includes("ai: done")) continue;
      candidates[i] = carryOverAi(candidates[i], old);
      kept++;
    }
    if (kept) console.log(`Kept earlier AI answers for ${kept} candidates (no new cost).`);
  }

  const file: CandidatesFile = { batchId, vendorId: vendor.id, createdAt: new Date().toISOString(), candidates };
  writeJson(paths.candidates, file);
  writeJson(paths.skipped, skipped);

  const byCategory = candidates.reduce<Record<string, number>>((acc, c) => {
    const key = String(c.category.value);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\n${candidates.length} candidates ${JSON.stringify(byCategory)}, ${skipped.length} skipped, ${fetcher.requestCount} network requests.`);
  console.log(`Wrote ${paths.candidates}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
