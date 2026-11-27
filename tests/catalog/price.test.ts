import { describe, expect, it } from "vitest";

import type { KeyboardComponent } from "@/lib/types";

import { assertLocalSupabaseUrl, isLocalSupabaseUrl, NotLocalDatabaseError } from "../../scripts/catalog/lib/local-only";
import { comparePrice, mergePriceChecks, priceFromHtml, renderPriceReport } from "../../scripts/catalog/lib/price";

const at = "2026-11-30T01:00:00.000Z";

const switchPart: KeyboardComponent = {
  id: "switch_test",
  category: "switch",
  name: "Test Linear",
  brand: "Test",
  beginnerFriendly: true,
  switchTechnology: "mechanical",
  price: 1.1,
  priceCurrency: "MYR",
  metadata: { sourceUrl: "https://shop.example/products/test", priceBasis: "listed_excl_shipping" },
};

const importedKitCase: KeyboardComponent = {
  id: "case_test_kit",
  category: "case",
  name: "Test Kit 65% Case",
  brand: "Test",
  beginnerFriendly: true,
  layouts: ["65"],
  caseMountSupport: ["gasket_mount"],
  price: 165,
  priceCurrency: "MYR",
  metadata: { kitId: "test_kit", kitLock: true, observedKitPrice: 300, priceBasis: "kit_split_estimate" },
};

const handSplitKitCase: KeyboardComponent = {
  ...importedKitCase,
  id: "case_hand_kit",
  metadata: { kitId: "hand_kit", kitLock: true, observedKitPrice: 300, sourceType: "kit_derived" },
};

describe("price comparison", () => {
  it("reports ok when the price is the same", () => {
    expect(comparePrice(switchPart, { kind: "price", price: 1.1 }, at)).toEqual({
      lastCheckedAt: at,
      status: "ok",
      observedPrice: 1.1,
    });
  });

  it("proposes the new price when it changed", () => {
    expect(comparePrice(switchPart, { kind: "price", price: 1.25 }, at)).toMatchObject({
      status: "changed",
      price: 1.25,
    });
  });

  it("reports a page that has gone, without inventing a price", () => {
    const entry = comparePrice(switchPart, { kind: "gone" }, at);
    expect(entry.status).toBe("gone");
    expect(entry.price).toBeUndefined();
  });

  it("re-splits an importer-made kit's new price", () => {
    expect(comparePrice(importedKitCase, { kind: "price", price: 320 }, at)).toMatchObject({
      status: "changed",
      observedPrice: 320,
      price: 176,
    });
  });

  it("only flags a hand-split kit, leaving its part price for Jayson", () => {
    const entry = comparePrice(handSplitKitCase, { kind: "price", price: 320 }, at);
    expect(entry.status).toBe("changed");
    expect(entry.price).toBeUndefined();
    expect(entry.note).toMatch(/by hand/);
  });

  it("keeps the last good entry when a check errors", () => {
    const previous = { switch_test: { lastCheckedAt: "2026-11-23T01:00:00.000Z", status: "ok" as const, observedPrice: 1.1 } };
    const merged = mergePriceChecks(previous, {
      switch_test: { lastCheckedAt: at, status: "error", note: "HTTP 500" },
    });
    expect(merged.switch_test).toMatchObject({ lastCheckedAt: "2026-11-23T01:00:00.000Z", status: "ok", note: "HTTP 500" });
  });

  it("reads a price from JSON-LD or meta tags", () => {
    const ld = `<script type="application/ld+json">{"@type":"Product","offers":{"@type":"Offer","price":"129.00","priceCurrency":"MYR"}}</script>`;
    expect(priceFromHtml(ld)).toBe(129);
    expect(priceFromHtml(`<meta property="product:price:amount" content="1,299.00">`)).toBe(1299);
    expect(priceFromHtml("<p>no price</p>")).toBeUndefined();
  });

  it("renders a report table with only the changes", () => {
    const report = renderPriceReport(
      { checkedAt: at, totalParts: 3, withSource: 2, checked: 2, ok: 1, changed: 1, gone: 0, errors: 0, requests: 3 },
      [
        { part: switchPart, entry: { lastCheckedAt: at, status: "changed", observedPrice: 1.25, price: 1.25 }, url: "https://shop.example/products/test" },
        { part: importedKitCase, entry: { lastCheckedAt: at, status: "ok" }, url: "https://shop.example/products/kit" },
      ],
    );
    expect(report).toContain("switch_test");
    expect(report).not.toContain("case_test_kit");
    expect(report).toContain("**1 changed**");
  });
});

describe("local-database guard", () => {
  it("accepts only local Supabase URLs", () => {
    expect(isLocalSupabaseUrl("http://127.0.0.1:54321")).toBe(true);
    expect(isLocalSupabaseUrl("http://localhost:54321")).toBe(true);
    expect(isLocalSupabaseUrl("https://abcdefgh.supabase.co")).toBe(false);
    expect(isLocalSupabaseUrl("https://127.0.0.1.evil.example")).toBe(false);
    expect(isLocalSupabaseUrl(undefined)).toBe(false);
    expect(isLocalSupabaseUrl("not a url")).toBe(false);
  });

  it("throws before any write to a non-local project", () => {
    expect(() => assertLocalSupabaseUrl("https://abcdefgh.supabase.co")).toThrow(NotLocalDatabaseError);
    expect(assertLocalSupabaseUrl("http://127.0.0.1:54321")).toBe("http://127.0.0.1:54321");
  });
});
