/**
 * Vendor shortlist (v2 WS2, subtask 1).
 *
 * `approved` is Jayson's sign-off. The discover and price-check scripts refuse
 * any vendor that is not approved, so adding a vendor here is not enough to
 * start fetching from it (brief: "adding a new vendor to the importer" needs
 * approval).
 */

export type VendorPlatform = "shopify" | "html";

export type Vendor = {
  id: string;
  name: string;
  baseUrl: string;
  platform: VendorPlatform;
  /** Shopify `vendor` values that mean "the store", not the brand. */
  storeNames: string[];
  /** Shopify collection handles to import from (one paged request per 250 products). */
  collections: string[];
  currency: "MYR";
  approved: boolean;
  /** Where the terms / robots notes for this vendor were checked. */
  notes: string;
};

// Checked 2026-11-28 with scripts/catalog/probe-vendor.ts and probe-terms.ts.
// Both MYR Shopify stores use Shopify's standard terms, whose Section 12
// prohibits using the site "to spam, phish, pharm, pretext, spider, crawl, or
// scrape" — even though their robots.txt allows /products/.
//
// Decision (Jayson, 2026-11-28): approve Mecha and MKB.MY for a non-commercial
// learning project WITHOUT asking first, under these safeguards:
//   - slow, identified bot (>= 5 s per request, honest user agent), robots.txt honoured
//   - public product data only (Shopify product JSON); no accounts, carts or checkout
//   - no vendor product photos copied or hot-linked onto the site (imageUrl is
//     not stored for imported parts); each part links back to its shop page
//   - each part credits its vendor (metadata.sourceVendor)
//   - if a vendor asks, remove its data the same day:
//     set approved: false, drop its parts from src/data/imported/approved-parts.json
export const VENDORS: Vendor[] = [
  {
    id: "mecha",
    name: "Mecha Malaysia",
    baseUrl: "https://mecha.com.my",
    platform: "shopify",
    storeNames: ["Mecha", "Mecha Malaysia", "Mecha Store", "Mecha "],
    collections: [],
    currency: "MYR",
    approved: true,
    notes:
      "Shopify, MYR, ~443 products. Physical showroom in Bandar Sunway. robots.txt allows /products/ and /products.json. ToS Section 12 prohibits spidering/crawling/scraping.",
  },
  {
    id: "mkb",
    name: "MKB.MY",
    baseUrl: "https://mkb.gg",
    platform: "shopify",
    storeNames: ["MKB", "MKB.MY", "mkb.gg", "MKB.GG"],
    collections: [],
    currency: "MYR",
    approved: true,
    notes:
      "Shopify, MYR, ~697 products. robots.txt allows /products/ and /collections/. Rate-limits fast clients (429 on first probe), so keep >= 5 s between requests. ToS Section 12 prohibits spidering/crawling/scraping.",
  },
  {
    id: "keebsproject",
    name: "KeebsProject",
    baseUrl: "https://www.keebsproject.com",
    platform: "html",
    storeNames: ["KeebsProject", "Keebs Project"],
    collections: [],
    currency: "MYR",
    approved: false,
    notes:
      "Not Shopify. robots.txt disallows only /cart, /checkout, /account, /my-orders; product pages allowed. Sitemap: /googlesitemap.xml.",
  },
];

export function getVendor(id: string) {
  const vendor = VENDORS.find((v) => v.id === id);
  if (!vendor) throw new Error(`Unknown vendor "${id}". Known: ${VENDORS.map((v) => v.id).join(", ")}`);
  return vendor;
}

export function requireApprovedVendor(id: string) {
  const vendor = getVendor(id);
  if (!vendor.approved) {
    throw new Error(
      `Vendor "${vendor.name}" is not approved yet. Jayson approves the vendor list (scripts/catalog/vendors.ts) before any fetch.`,
    );
  }
  return vendor;
}
