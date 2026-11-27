/**
 * Weekly price comparison (v2 WS2, subtask 7). Pure logic: given what a part's
 * source page shows now, decide ok / changed / gone and what to propose.
 *
 * - Parts priced from their own listing (imported, vendor_listed): propose
 *   the new price.
 * - Kit parts: the page shows the whole kit's price. Importer-made kits are
 *   re-split with the same KIT_PRICE_SPLIT; hand-split kits from the frozen
 *   catalogue are only flagged (never re-split automatically).
 * - Parts with no source URL (modelled estimates) cannot be checked.
 */
import type { PriceCheckEntry, PriceChecks } from "@/data/catalog";
import type { KeyboardComponent } from "@/lib/types";

import { KIT_PRICE_SPLIT } from "./assemble";
import { decodeEntities } from "./text";

export type PageObservation =
  | { kind: "price"; price: number }
  | { kind: "gone" }
  | { kind: "error"; message: string };

export function sourceUrlOf(part: KeyboardComponent): string | undefined {
  const fromMeta = part.metadata?.sourceUrl;
  if (typeof fromMeta === "string" && fromMeta.startsWith("https://")) return fromMeta;
  return part.vendorUrl;
}

export function isKitPart(part: KeyboardComponent) {
  return part.metadata?.kitLock === true && typeof part.metadata?.observedKitPrice === "number";
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function comparePrice(
  part: KeyboardComponent,
  observation: PageObservation,
  checkedAt: string,
): PriceCheckEntry {
  if (observation.kind === "gone") return { lastCheckedAt: checkedAt, status: "gone", note: "source page is gone (404/410)" };
  if (observation.kind === "error") return { lastCheckedAt: checkedAt, status: "error", note: observation.message };

  const observed = round2(observation.price);

  if (isKitPart(part)) {
    const kitPrice = part.metadata!.observedKitPrice as number;
    if (Math.abs(kitPrice - observed) < 0.01) return { lastCheckedAt: checkedAt, status: "ok", observedPrice: observed };
    if (part.metadata?.priceBasis === "kit_split_estimate") {
      const share = KIT_PRICE_SPLIT[part.category as keyof typeof KIT_PRICE_SPLIT];
      return {
        lastCheckedAt: checkedAt,
        status: "changed",
        observedPrice: observed,
        ...(share ? { price: round2(observed * share) } : {}),
        note: `kit price RM${kitPrice} → RM${observed}`,
      };
    }
    return {
      lastCheckedAt: checkedAt,
      status: "changed",
      observedPrice: observed,
      note: `kit price RM${kitPrice} → RM${observed}; this kit's split was chosen by hand, so the part price is left for Jayson`,
    };
  }

  if (part.price !== undefined && Math.abs(part.price - observed) < 0.01) {
    return { lastCheckedAt: checkedAt, status: "ok", observedPrice: observed };
  }
  return { lastCheckedAt: checkedAt, status: "changed", observedPrice: observed, price: observed };
}

/** Price shown on a non-Shopify product page: JSON-LD offers, then meta tags. */
export function priceFromHtml(html: string): number | undefined {
  for (const match of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(decodeEntities(match[1].trim())) as unknown;
      const price = findOfferPrice(data);
      if (price !== undefined) return price;
    } catch {
      // ignore malformed JSON-LD
    }
  }
  const meta =
    /<meta[^>]+(?:property|itemprop|name)=["'](?:product:price:amount|og:price:amount|price)["'][^>]+content=["']([\d.,]+)["']/i.exec(html) ??
    /<meta[^>]+content=["']([\d.,]+)["'][^>]+(?:property|itemprop|name)=["'](?:product:price:amount|og:price:amount|price)["']/i.exec(html);
  if (meta) {
    const value = Number(meta[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value > 0) return value;
  }
  return undefined;
}

function findOfferPrice(node: unknown): number | undefined {
  if (Array.isArray(node)) {
    for (const item of node) {
      const price = findOfferPrice(item);
      if (price !== undefined) return price;
    }
    return undefined;
  }
  if (!node || typeof node !== "object") return undefined;
  const record = node as Record<string, unknown>;
  if (record["@graph"]) return findOfferPrice(record["@graph"]);
  const offers = record.offers;
  if (offers) {
    const list = Array.isArray(offers) ? offers : [offers];
    const prices = list.flatMap((offer) => {
      const o = offer as Record<string, unknown>;
      const raw = o.price ?? o.lowPrice;
      const value = Number(String(raw ?? "").replace(/,/g, ""));
      return Number.isFinite(value) && value > 0 ? [value] : [];
    });
    if (prices.length) return Math.min(...prices);
  }
  return undefined;
}

export type PriceRunSummary = {
  checkedAt: string;
  totalParts: number;
  withSource: number;
  checked: number;
  ok: number;
  changed: number;
  gone: number;
  errors: number;
  requests: number;
};

export function renderPriceReport(
  summary: PriceRunSummary,
  rows: { part: KeyboardComponent; entry: PriceCheckEntry; url: string }[],
): string {
  const lines = [
    `## Weekly price check · ${summary.checkedAt.slice(0, 10)}`,
    "",
    `Checked ${summary.checked} of ${summary.withSource} parts that have a source page (${summary.totalParts} parts in the catalogue; the rest are modelled estimates with no page). ${summary.ok} unchanged · **${summary.changed} changed** · ${summary.gone} gone · ${summary.errors} errors · ${summary.requests} network requests.`,
    "",
    "Prices are the listed MYR price excluding shipping (switches per switch). Merging this PR approves the new prices in `src/data/imported/price-checks.json`; loading them into Supabase is a separate step.",
    "",
  ];
  const interesting = rows.filter((r) => r.entry.status !== "ok");
  if (interesting.length === 0) {
    lines.push("No price changes and no missing pages.");
  } else {
    lines.push("| part | status | catalogue | page now | proposed | note |", "|---|---|---|---|---|---|");
    for (const { part, entry, url } of interesting) {
      lines.push(
        `| [${part.name}](${url}) \`${part.id}\` | ${entry.status} | ${part.price !== undefined ? `RM${part.price}` : "–"} | ${entry.observedPrice !== undefined ? `RM${entry.observedPrice}` : "–"} | ${entry.price !== undefined ? `RM${entry.price}` : "–"} | ${(entry.note ?? "").replace(/\|/g, "\\|")} |`,
      );
    }
  }
  return `${lines.join("\n")}\n`;
}

export function mergePriceChecks(previous: PriceChecks, next: PriceChecks): PriceChecks {
  const merged: PriceChecks = { ...previous };
  for (const [id, entry] of Object.entries(next)) {
    // An error keeps the last good price; it only records that we tried.
    if (entry.status === "error" && previous[id]) {
      merged[id] = { ...previous[id], note: entry.note };
      continue;
    }
    merged[id] = entry;
  }
  return Object.fromEntries(Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)));
}
