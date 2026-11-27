#!/usr/bin/env tsx
/**
 * Prints the sentences of a Shopify store's terms of service that mention
 * automated access (scraping, crawling, robots, bots, data mining), so the
 * vendor shortlist can note them. One request per store.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/catalog/probe-terms.ts mecha.com.my mkb.gg
 */
import { createPoliteFetcher } from "./lib/fetch";
import { htmlToText } from "./lib/text";

async function main() {
  const fetcher = createPoliteFetcher();
  for (const host of process.argv.slice(2)) {
    const page = await fetcher.get(`https://${host}/policies/terms-of-service`);
    // Shopify embeds the policy as JSON-escaped HTML; unescape before stripping.
    const unescaped = page.body.replace(/\\u003c/gi, "<").replace(/\\u003e/gi, ">").replace(/\\u0026/gi, "&").replace(/\\\//g, "/");
    const text = htmlToText(unescaped).replace(/\s+/g, " ");
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => /scrap|crawl|robot|spider|\bbots?\b|data mining|automated|harvest/i.test(s));
    console.log(`=== ${host} (HTTP ${page.status}, ${text.length} chars)`);
    for (const sentence of sentences.slice(0, 8)) {
      const at = sentence.search(/scrap|crawl|robot|spider|\bbots?\b|data mining|automated|harvest/i);
      console.log(`- …${sentence.slice(Math.max(0, at - 120), at + 160)}…`);
    }
    if (sentences.length === 0) console.log("- no sentence about automated access");
  }
}

main();
