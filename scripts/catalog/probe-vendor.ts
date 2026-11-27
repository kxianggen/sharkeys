#!/usr/bin/env tsx
/**
 * Vendor check for the shortlist (v2 WS2, subtask 1). For each site: what
 * robots.txt allows, and whether it is Shopify (public /products.json). At
 * most 3 small requests per site, through the polite fetcher.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/catalog/probe-vendor.ts mecha.com.my rebultkeyboards.com
 */
import { createPoliteFetcher } from "./lib/fetch";
import { isPathAllowed, parseRobots } from "./lib/robots";

async function probe(host: string, fetcher: ReturnType<typeof createPoliteFetcher>) {
  const base = `https://${host}`;
  const result: Record<string, unknown> = { host };
  try {
    const robots = await fetcher.get(`${base}/robots.txt`);
    result.robotsStatus = robots.status;
    const rules = robots.status === 200 ? parseRobots(robots.body, "SharkeysCatalogBot") : { allow: [], disallow: [] };
    result.productsAllowed = isPathAllowed(rules, "/products/example");
    result.productsJsonAllowed = isPathAllowed(rules, "/products.json?limit=1");
    result.crawlDelay = rules.crawlDelaySeconds ?? null;
    result.shopifyHint = /shopify/i.test(robots.body);

    if (result.productsJsonAllowed) {
      const list = await fetcher.get(`${base}/products.json?limit=1`);
      result.productsJsonStatus = list.status;
      try {
        const json = JSON.parse(list.body) as { products?: { title?: string; variants?: { price?: string }[] }[] };
        result.shopify = Array.isArray(json.products);
        result.sample = json.products?.[0]?.title ?? null;
      } catch {
        result.shopify = false;
      }
    }
    if (result.shopify) {
      const meta = await fetcher.get(`${base}/meta.json`);
      try {
        const json = JSON.parse(meta.body) as { currency?: string; name?: string; published_products_count?: number };
        result.currency = json.currency ?? null;
        result.storeName = json.name ?? null;
        result.productCount = json.published_products_count ?? null;
      } catch {
        result.currency = null;
      }
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }
  return result;
}

async function main() {
  const hosts = process.argv.slice(2);
  const fetcher = createPoliteFetcher({ log: console.log });
  for (const host of hosts) console.log(JSON.stringify(await probe(host, fetcher)));
  console.log(`${fetcher.requestCount} requests`);
}

main();
