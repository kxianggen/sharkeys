#!/usr/bin/env tsx
/**
 * Weekly price check (v2 WS2, subtask 7). Run by .github/workflows/price-check.yml
 * every Monday, or by hand. Needs no secrets and touches no database.
 *
 * Re-fetches each part's source page once (kit parts share one page), compares
 * the price, writes src/data/imported/price-checks.json and a report
 * (scripts/catalog/price-reports/<date>.md, also used as the PR body).
 *
 * Only pages from approved vendors are fetched. Requests are slow (>= 5 s per
 * host) and identify the bot; nothing is cached for longer than 6 hours.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/catalog/price-check.ts [--limit 20] [--dry-run]
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { fullCatalog, priceChecks, type PriceChecks } from "@/data";
import type { KeyboardComponent } from "@/lib/types";

import { CACHE_DIR, CATALOG_DIR, PRICE_CHECKS_PATH, parseArgs, readJson, writeJson } from "./lib/batch";
import { detectPrice, parsePackSize } from "./lib/deterministic";
import { createPoliteFetcher, RobotsDisallowedError } from "./lib/fetch";
import {
  comparePrice,
  mergePriceChecks,
  priceFromHtml,
  renderPriceReport,
  sourceUrlOf,
  type PageObservation,
} from "./lib/price";
import { handleFromProductUrl, parseShopifyProduct, shopifyProductJsonUrl, type ShopifyProduct } from "./lib/shopify";
import { VENDORS, type Vendor } from "./vendors";

function vendorFor(url: string): Vendor | undefined {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return VENDORS.find((v) => new URL(v.baseUrl).hostname.replace(/^www\./, "") === host);
}

/** Per-switch price at the pack size recorded on import, else the importer's rule. */
function shopifyPrice(product: ShopifyProduct, part: KeyboardComponent): number | undefined {
  if (part.category === "switch") {
    const pack = part.metadata?.observedPackSize;
    if (typeof pack === "number") {
      const variant = product.variants.find(
        (v) => parsePackSize([v.title, v.option1, v.option2, v.option3].filter(Boolean).join(" ")) === pack,
      );
      if (variant) return Math.round((variant.price / pack) * 100) / 100;
    }
  }
  const kit = part.metadata?.kitLock === true && typeof part.metadata?.observedKitPrice === "number";
  const detected = detectPrice(product, kit ? "kit" : part.category);
  return typeof detected.price.value === "number" ? detected.price.value : undefined;
}

async function main() {
  const args = parseArgs();
  const limit = typeof args.limit === "string" ? Number(args.limit) : Infinity;
  const checkedAt = new Date().toISOString();
  const fetcher = createPoliteFetcher({ cacheDir: CACHE_DIR, maxCacheAgeMs: 6 * 60 * 60 * 1000, log: console.log });

  const withSource = fullCatalog.filter((part) => sourceUrlOf(part));
  const byUrl = new Map<string, KeyboardComponent[]>();
  for (const part of withSource) {
    const url = sourceUrlOf(part)!;
    byUrl.set(url, [...(byUrl.get(url) ?? []), part]);
  }

  const next: PriceChecks = {};
  const rows: { part: KeyboardComponent; entry: PriceChecks[string]; url: string }[] = [];
  let pages = 0;

  for (const [url, parts] of byUrl) {
    if (pages >= limit) break;
    const vendor = vendorFor(url);
    if (!vendor?.approved) {
      for (const part of parts) {
        const entry = { lastCheckedAt: checkedAt, status: "error" as const, note: `vendor for ${new URL(url).host} is not approved for fetching` };
        next[part.id] = entry;
        rows.push({ part, entry, url });
      }
      continue;
    }
    pages++;

    let product: ShopifyProduct | undefined;
    let html: string | undefined;
    let failure: PageObservation | undefined;
    try {
      if (vendor.platform === "shopify") {
        const handle = handleFromProductUrl(url);
        if (!handle) throw new Error("no product handle in URL");
        const response = await fetcher.get(shopifyProductJsonUrl(vendor.baseUrl, handle));
        if (response.status === 404 || response.status === 410) failure = { kind: "gone" };
        else if (response.status !== 200) failure = { kind: "error", message: `HTTP ${response.status}` };
        else product = parseShopifyProduct(response.body);
      } else {
        const response = await fetcher.get(url);
        if (response.status === 404 || response.status === 410) failure = { kind: "gone" };
        else if (response.status !== 200) failure = { kind: "error", message: `HTTP ${response.status}` };
        else html = response.body;
      }
    } catch (error) {
      failure = {
        kind: "error",
        message: error instanceof RobotsDisallowedError ? "robots.txt now disallows this page" : error instanceof Error ? error.message : String(error),
      };
    }

    for (const part of parts) {
      let observation: PageObservation;
      if (failure) observation = failure;
      else {
        const price = product ? shopifyPrice(product, part) : priceFromHtml(html ?? "");
        observation = price !== undefined ? { kind: "price", price } : { kind: "error", message: "price not found on the page" };
      }
      // Compare kits against the last observed kit price, not the import-time one.
      const previous = priceChecks[part.id];
      const baseline =
        previous?.observedPrice !== undefined && part.metadata?.observedKitPrice !== undefined
          ? { ...part, metadata: { ...part.metadata, observedKitPrice: previous.observedPrice } }
          : part;
      const entry = comparePrice(baseline, observation, checkedAt);
      next[part.id] = entry;
      rows.push({ part, entry, url });
    }
    console.log(`${parts.length > 1 ? `${parts.length} parts` : parts[0].id}: ${next[parts[0].id].status}`);
  }

  const summary = {
    checkedAt,
    totalParts: fullCatalog.length,
    withSource: withSource.length,
    checked: rows.filter((r) => r.entry.status !== "error").length,
    ok: rows.filter((r) => r.entry.status === "ok").length,
    changed: rows.filter((r) => r.entry.status === "changed").length,
    gone: rows.filter((r) => r.entry.status === "gone").length,
    errors: rows.filter((r) => r.entry.status === "error").length,
    requests: fetcher.requestCount,
  };
  const report = renderPriceReport(summary, rows);
  const reportPath = join(CATALOG_DIR, "price-reports", `${checkedAt.slice(0, 10)}.md`);

  if (args["dry-run"]) {
    console.log(`\n${report}\n(dry run: nothing written)`);
    return;
  }

  const file = readJson<{ _note: string; checks: PriceChecks }>(PRICE_CHECKS_PATH);
  writeJson(PRICE_CHECKS_PATH, { ...file, checks: mergePriceChecks(file.checks, next) });
  writeJson(reportPath.replace(/\.md$/, ".json"), summary);
  writeFileSync(reportPath, report);
  console.log(`\n${report}`);
  console.log(`Wrote ${PRICE_CHECKS_PATH} and ${reportPath}`);
  if (process.env.GITHUB_OUTPUT) {
    writeFileSync(process.env.GITHUB_OUTPUT, `report=${reportPath}\nchanged=${summary.changed + summary.gone}\n`, { flag: "a" });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
