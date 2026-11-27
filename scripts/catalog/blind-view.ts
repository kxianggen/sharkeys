#!/usr/bin/env tsx
/**
 * Prints products for the blind pass: ONLY the shop's own data (title, type,
 * tags, variants with prices, description) and the list of fields to fill.
 * It never prints an importer value. Reads the cache: no network.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/catalog/blind-view.ts --batch mecha-001 --keys mecha:a,mecha:b
 *   npx tsx --tsconfig tsconfig.json scripts/catalog/blind-view.ts --batch mecha-001 --golden
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CATALOG_DIR, parseArgs, readCandidates, requireArg } from "./lib/batch";
import { comparedFields, loadCachedProducts } from "./lib/blind";
import { pickGolden, readGoldenCsv } from "./lib/golden";
import { htmlToText } from "./lib/text";
import { getVendor } from "./vendors";

const MAX_BODY = 4_500;

function main() {
  const args = parseArgs();
  const batchId = requireArg(args, "batch");
  const file = readCandidates(batchId);
  const vendor = getVendor(file.vendorId);
  const products = loadCachedProducts(new URL(vendor.baseUrl).hostname);

  let keys: string[];
  if (args.golden) {
    const csv = join(CATALOG_DIR, "golden", "golden-20.csv");
    if (!existsSync(csv)) throw new Error("No golden-20.csv yet.");
    keys = [...new Set(readGoldenCsv(readFileSync(csv, "utf8")).map((r) => r.key))];
  } else if (typeof args.next === "string") {
    // Next N products nobody has looked at yet: not seen in-session, not
    // already in the blind pass; spread across categories.
    const seenPath = join(CATALOG_DIR, "golden", "seen-in-session.json");
    const blindPath = join(CATALOG_DIR, "blind", `${batchId}.json`);
    const excluded = new Set<string>([
      ...(existsSync(seenPath) ? (JSON.parse(readFileSync(seenPath, "utf8")) as { keys: string[] }).keys : []),
      ...(existsSync(blindPath) ? Object.keys(JSON.parse(readFileSync(blindPath, "utf8")) as object) : []),
    ]);
    const only = typeof args.categories === "string" ? new Set(args.categories.split(",")) : undefined;
    keys = pickGolden(
      file.candidates.filter((c) => !excluded.has(c.key) && (!only || only.has(String(c.category.value)))),
      Number(args.next),
    ).map((c) => c.key);
    if (args["keys-only"]) {
      console.log(keys.join(","));
      return;
    }
  } else {
    keys = requireArg(args, "keys").split(",").map((k) => k.trim());
  }

  for (const key of keys) {
    const candidate = file.candidates.find((c) => c.key === key);
    const product = products.get(key.split(":")[1]);
    if (!candidate || !product) {
      console.log(`\n=== ${key}: not found`);
      continue;
    }
    console.log(`\n=== ${key}`);
    console.log(`fill: ${comparedFields(candidate).join(", ")}`);
    console.log(`Title: ${product.title}`);
    console.log(`Type: ${product.product_type} | Vendor field: ${product.vendor}`);
    if (product.tags.length) console.log(`Tags: ${product.tags.join(", ")}`);
    console.log(
      `Variants: ${product.variants
        .slice(0, 15)
        .map((v) => `${v.title}: ${v.price.toFixed(2)}${v.available === false ? " (sold out)" : ""}`)
        .join(" | ")}`,
    );
    const body = htmlToText(product.body_html ?? "").replace(/\n{2,}/g, "\n");
    console.log(body.length > MAX_BODY ? `${body.slice(0, MAX_BODY)} …[cut]` : body);
  }
}

main();
