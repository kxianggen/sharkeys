import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  buildFullCatalog,
  catalogMode,
  frozenCatalog,
  keyboardComponents,
  readCatalogMode,
} from "@/data/catalog";
import type { KeyboardComponent } from "@/lib/types";

// The frozen v1 catalogue (src/data/components.ts) that every pre-v2 test and
// the CI eval's known-failures list were recorded against. If this test fails,
// the frozen file was edited; new parts belong in src/data/imported/ instead.
// Re-pin only on purpose: scripts/catalog/print-frozen-hash.ts.
const FROZEN_COUNT = 60;
const FROZEN_SHA256 =
  "30acdbd44087712c27bb4a81b5c71f52d5d58c4a15c6a6a28b9bbb624fcf17cb";

describe("frozen catalogue snapshot", () => {
  it("is pinned by size and content hash", () => {
    expect(frozenCatalog).toHaveLength(FROZEN_COUNT);
    expect(
      createHash("sha256").update(JSON.stringify(frozenCatalog)).digest("hex"),
    ).toBe(FROZEN_SHA256);
  });

  it("is what the tests run against", () => {
    expect(catalogMode).toBe("frozen");
    expect(keyboardComponents).toBe(frozenCatalog);
  });
});

describe("catalogue mode", () => {
  it("is frozen only when asked for", () => {
    expect(readCatalogMode("frozen")).toBe("frozen");
    expect(readCatalogMode("")).toBe("full");
    expect(readCatalogMode("full")).toBe("full");
    expect(readCatalogMode("anything")).toBe("full");
  });
});

describe("buildFullCatalog", () => {
  const imported: KeyboardComponent = {
    id: "switch_test_imported",
    category: "switch",
    name: "Test Linear",
    brand: "Test",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    price: 1.5,
    priceCurrency: "MYR",
    metadata: { sourceType: "imported" },
  };

  it("appends imported parts after the frozen ones", () => {
    const full = buildFullCatalog(frozenCatalog, [imported], {});
    expect(full).toHaveLength(FROZEN_COUNT + 1);
    expect(full.at(-1)?.id).toBe(imported.id);
  });

  it("refuses an imported id that collides with a frozen id", () => {
    expect(() =>
      buildFullCatalog(frozenCatalog, [{ ...imported, id: frozenCatalog[0].id }], {}),
    ).toThrow(/collides/);
  });

  it("applies approved price checks and records when each part was checked", () => {
    const full = buildFullCatalog(frozenCatalog, [imported], {
      [imported.id]: {
        lastCheckedAt: "2026-11-30T01:00:00.000Z",
        status: "changed",
        price: 1.8,
      },
    });
    const part = full.find((c) => c.id === imported.id);
    expect(part?.price).toBe(1.8);
    expect(part?.metadata?.lastCheckedAt).toBe("2026-11-30T01:00:00.000Z");
    expect(part?.metadata?.priceCheckStatus).toBe("changed");
  });

  it("marks a part whose source page is gone as unavailable, without removing it", () => {
    const full = buildFullCatalog(frozenCatalog, [imported], {
      [imported.id]: { lastCheckedAt: "2026-11-30T01:00:00.000Z", status: "gone" },
    });
    const part = full.find((c) => c.id === imported.id);
    expect(part?.metadata?.availability).toBe("unavailable");
    expect(part?.price).toBe(1.5);
  });

  it("keeps the catalogue price when a check carries no price", () => {
    const full = buildFullCatalog(frozenCatalog, [imported], {
      [imported.id]: { lastCheckedAt: "2026-11-30T01:00:00.000Z", status: "ok" },
    });
    expect(full.find((c) => c.id === imported.id)?.price).toBe(1.5);
  });
});
