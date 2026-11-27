import { describe, expect, it } from "vitest";

import { frozenCatalog } from "@/data/catalog";
import type { KeyboardComponent } from "@/lib/types";

import { assembleCandidate } from "../../scripts/catalog/lib/assemble";
import { checkSanity, findDuplicates, findValidBuild, modelCodes, runChecks } from "../../scripts/catalog/lib/checks";
import { mapShopifyProduct, parsePackSize } from "../../scripts/catalog/lib/deterministic";
import { known, type Candidate } from "../../scripts/catalog/lib/fields";
import { fieldsToAsk } from "../../scripts/catalog/lib/extract-ai";
import { applyDecision, mergeDecisions } from "../../scripts/catalog/lib/review";
import { handleFromProductUrl, parseShopifyProductList } from "../../scripts/catalog/lib/shopify";
import { htmlToText, snippetAppearsIn } from "../../scripts/catalog/lib/text";

import {
  deskMat,
  keycapProduct,
  kitProduct,
  switchNoPackSize,
  switchProduct,
  unsupportedLayoutKit,
  vendorContext,
} from "./fixtures";

const context = { vendorName: "TestShop", checkedAt: "2026-11-28T02:00:00.000Z", batchId: "test-001" };

function candidateOf(product: Parameters<typeof mapShopifyProduct>[0]): Candidate {
  const mapped = mapShopifyProduct(product, vendorContext);
  if (mapped.kind !== "candidate") throw new Error(`skipped: ${mapped.reason}`);
  return mapped.candidate;
}

describe("plain-code mapping (deterministic fields)", () => {
  it("reads a switch: name, brand from title, pins, force, per-switch price", () => {
    const c = candidateOf(switchProduct);
    expect(c.category.value).toBe("switch");
    expect(c.fields.name.value).toBe("Gateron Test Yellow Linear Switches");
    expect(c.fields.brand).toMatchObject({ value: "Gateron", source: "regex" });
    expect(c.fields.pinCount.value).toBe(5);
    expect(c.fields.actuationForceG.value).toBe(50);
    expect(c.fields.switchTechnology.value).toBe("mechanical");
    // Biggest *available* pack: 35 pcs at RM38.50 → RM1.10 per switch (70 pcs is sold out).
    expect(c.fields.price.value).toBe(1.1);
    expect(c.packSize).toBe(35);
    expect(c.sourceUrl).toBe("https://shop.example/products/gateron-test-yellow");
  });

  it("leaves a switch price unknown when the pack size cannot be read", () => {
    const c = candidateOf(switchNoPackSize);
    expect(c.fields.price.value).toBe("unknown");
    expect(c.notes.join(" ")).toMatch(/pack size/);
    expect(c.fields.soundProfile.value).toBe("silent");
  });

  it("reads a kit: layout, gasket mount, tri-mode, hot-swap, stabilizer type and sizes", () => {
    const c = candidateOf(kitProduct);
    expect(c.category.value).toBe("kit");
    expect(c.fields.brand).toMatchObject({ value: "Weikav", source: "structured" });
    expect(c.fields.layouts.value).toEqual(["65"]);
    expect(c.fields.mountSupport.value).toEqual(["gasket_mount"]);
    expect(c.fields.connection.value).toBe("both");
    expect(c.fields.hotswap.value).toBe(true);
    expect(c.fields.switchTechnologySupport.value).toEqual(["mechanical"]);
    expect(c.fields.stabilizerType.value).toBe("plate_mount");
    expect(c.fields.stabilizerSizes.value).toEqual(["2u", "6.25u"]);
    expect(c.fields.price.value).toBe(300);
    // Beginner-friendliness needs judgement, so plain code never guesses it.
    expect(c.fields.beginnerFriendly.value).toBe("unknown");
  });

  it("reads a keycap set's profile and layouts", () => {
    const c = candidateOf(keycapProduct);
    expect(c.category.value).toBe("keycap");
    expect(c.fields.keycapProfile.value).toBe("cherry");
    expect(c.fields.layouts.value).toEqual(["60", "65", "75", "tkl", "full"]);
    expect(c.fields.switchTechnologySupport.value).toEqual(["mechanical"]);
  });

  it("reads a single-switch listing as a per-switch price", () => {
    const single = { ...switchNoPackSize, handle: "single", product_type: "Switch", variants: [{ id: 1, title: "Default Title", price: 1.5, available: true }] };
    const c = candidateOf(single);
    expect(c.fields.price.value).toBe(1.5);
    expect(c.packSize).toBe(1);
  });

  it("trusts the store's product type, and skips artisans and services", () => {
    const base = { ...keycapProduct, handle: "x" };
    expect(candidateOf({ ...base, title: "GMK Botanical R2 Base Kit", product_type: "Keycaps" }).category.value).toBe("keycap");
    expect(mapShopifyProduct({ ...base, title: "Drakon Artisans", product_type: "Artisan Keycaps" }, vendorContext).kind).toBe("skipped");
    expect(mapShopifyProduct({ ...base, title: "Stabilizer Tuning Service", product_type: "Service" }, vendorContext).kind).toBe("skipped");
  });

  it("does not read gasket material or the case material as mount / plate (real false positives)", () => {
    const c = candidateOf({
      ...kitProduct,
      handle: "plus84",
      body_html:
        "<p>Specifications: - Case: Aluminum/Clear PC - Layout: WK and WKL</p><p>Includes Poron Gasket for Isolated Top Mount x12, hot-swap PCB, tri-mode.</p>",
    });
    expect(c.fields.mountSupport.value).toEqual(["top_mount"]);
    expect(c.fields.plateMaterial.value).toBe("unknown");
  });

  it("reads plate material from 'Default plate: Polycarbonate'", () => {
    const c = candidateOf({ ...kitProduct, handle: "gmk68", body_html: "<p>Kit. Mounting: Tray Mounted - Default plate: Polycarbonate</p>" });
    expect(c.fields.plateMaterial.value).toBe("polycarbonate");
    expect(c.fields.mountSupport.value).toEqual(["tray_mount"]);
  });

  it("trusts a store sound tag over description words", () => {
    const c = candidateOf({ ...switchProduct, handle: "tagged", tags: ["sound_Creamy"], body_html: "<p>Deep thocky linear, 5-pin.</p>" });
    expect(c.fields.soundProfile).toMatchObject({ value: "creamy", source: "structured" });
  });

  it("pre-fills brand from the title, the shop's own line, or (flagged) the vendor field", () => {
    const base = { ...keycapProduct, vendor: "TestShop", product_type: "Keycaps" };
    expect(candidateOf({ ...base, handle: "a", title: "K.TECHS S1 Linear Keycaps" }).fields.brand.value).toBe("K.TECHS");
    expect(candidateOf({ ...base, handle: "b", title: "TestShop Capybara MAO Keycaps" }).fields.brand).toMatchObject({ value: "TestShop", confidence: 0.85 });
    expect(candidateOf({ ...base, handle: "c", title: "Cupid MOA Profile Keycap Set" }).fields.brand).toMatchObject({ value: "TestShop", confidence: 0.6 });
  });

  describe("several options means unknown (HQ rule)", () => {
    it("leaves plate material unknown when several plates are offered", () => {
      const prose = candidateOf({ ...kitProduct, handle: "o1", body_html: "<p>Barebones kit, hot-swap. – Aluminum and polycarbonate plates; Gasket Mount</p>" });
      expect(prose.fields.plateMaterial.value).toBe("unknown");
      expect(prose.notes.join(" ")).toMatch(/several options.*plateMaterial/);
      const variants = candidateOf({
        ...kitProduct,
        handle: "o2",
        body_html: "<p>Barebones kit.</p>",
        variants: [
          { id: 1, title: "Black / Alu Plate", price: 700, available: true },
          { id: 2, title: "Black / PP Plate", price: 700, available: true },
        ],
      });
      expect(variants.fields.plateMaterial.value).toBe("unknown");
    });

    it("leaves hot-swap unknown when hot-swap and solder PCBs are both offered", () => {
      const c = candidateOf({ ...kitProduct, handle: "o3", body_html: "<p>Kit. PCB options: Tri-mode Hotswap PCB, Wired Solder PCB.</p>" });
      expect(c.fields.hotswap.value).toBe("unknown");
    });

    it("does not let the AI fill a several-options field", () => {
      const c = candidateOf({ ...kitProduct, handle: "o4", body_html: "<p>Barebones kit, hot-swap. Aluminum and polycarbonate plates.</p>" });
      expect(fieldsToAsk(c)).not.toContain("plateMaterial");
    });
  });

  describe("golden-20 regressions", () => {
    it("does not take 'Cherry' from 'Cherry Profile' as the brand", () => {
      const c = candidateOf({ ...keycapProduct, handle: "g1", vendor: "TestShop", title: "Two Tone Grey Cherry Profile Keycap Set" });
      expect(c.fields.brand.value).not.toBe("Cherry");
    });

    it("does not read magnetic pogo pins as Hall-effect", () => {
      const c = candidateOf({ ...kitProduct, handle: "g2", body_html: "<p>Barebones kit, hot-swap. Magnetic pogo pins and magnetic connectors.</p>" });
      expect(c.fields.switchTechnologySupport.value).toEqual(["mechanical"]);
      const he = candidateOf({ ...kitProduct, handle: "g2b", title: "Venom 60 HE Gaming Keyboard Kit", body_html: "<p>Kit</p>" });
      expect(he.fields.switchTechnologySupport.value).toEqual(["hall_effect"]);
    });

    it("reads 40 from 'Operation Force | 40±10 gf' and 45 from 'Actuation: 45g'", () => {
      const table = candidateOf({ ...switchProduct, handle: "g3", body_html: "<table><tr><td>Operation Force</td><td>40±10 gf</td></tr></table>" });
      expect(table.fields.actuationForceG.value).toBe(40);
      const plain = candidateOf({ ...switchProduct, handle: "g3b", body_html: "<p>- Actuation: 45g</p><p>- Bottom: 68g</p>" });
      expect(plain.fields.actuationForceG.value).toBe(45);
    });

    it("reads keycap layouts from 'ANSI 100/80/75/60 supported'", () => {
      const c = candidateOf({ ...keycapProduct, handle: "g4", body_html: "<p>Cherry Profile</p><p>Compatiblity</p><p>ANSI 100/80/75/60 supported</p>" });
      expect(c.fields.layouts.value).toEqual(["full", "tkl", "75", "60"]);
    });

    it("leaves price unknown when only add-on variants are in stock", () => {
      const c = candidateOf({
        ...kitProduct,
        handle: "g5",
        variants: [
          { id: 1, title: "Black / Alu Plate", price: 700, available: false },
          { id: 2, title: "PP Plate", price: 95, available: true },
        ],
      });
      expect(c.fields.price.value).toBe("unknown");
    });
  });

  it("skips accessories", () => {
    const mapped = mapShopifyProduct(deskMat, vendorContext);
    expect(mapped.kind).toBe("skipped");
  });

  it("marks a layout the schema does not have as unknown, with a note", () => {
    const c = candidateOf(unsupportedLayoutKit);
    expect(c.fields.layouts.value).toBe("unknown");
    expect(c.notes.join(" ")).toMatch(/98/);
  });

  it("every regex snippet really appears in the source text", () => {
    for (const product of [switchProduct, kitProduct, keycapProduct]) {
      const c = candidateOf(product);
      for (const field of Object.values(c.fields)) {
        if (field.source === "regex") expect(snippetAppearsIn(field.snippet, c.sourceText)).toBe(true);
      }
    }
  });

  it("parses pack sizes", () => {
    expect(parsePackSize("35 pcs")).toBe(35);
    expect(parsePackSize("x10")).toBe(10);
    expect(parsePackSize("Pack of 70")).toBe(70);
    expect(parsePackSize("Default Title")).toBeUndefined();
  });

  it("parses Shopify list JSON and product URLs", () => {
    const list = parseShopifyProductList(JSON.stringify({ products: [{ ...switchProduct, tags: "a, b" }] }));
    expect(list[0].tags).toEqual(["a", "b"]);
    expect(handleFromProductUrl("https://shop.example/products/foo-bar")).toBe("foo-bar");
    expect(handleFromProductUrl("https://shop.example/products/foo-bar.json")).toBe("foo-bar");
  });

  it("strips HTML to text", () => {
    const text = htmlToText("<p>A&amp;B</p><script>x()</script><ul><li>one</li></ul>");
    expect(text).toMatch(/^A&B\n+- one$/);
    expect(text).not.toContain("x()");
  });
});

describe("assembling catalogue parts", () => {
  it("refuses a part while a required field is unknown", () => {
    const result = assembleCandidate(candidateOf(kitProduct), context);
    expect(result).toMatchObject({ ok: false, missing: ["beginnerFriendly"] });
  });

  it("splits a kit into case, PCB, plate and stabilizer linked by kitId", () => {
    const c = candidateOf(kitProduct);
    c.fields.beginnerFriendly = known(true, 1, "reviewer", "fixed by reviewer");
    const result = assembleCandidate(c, context);
    if (!result.ok) throw new Error(JSON.stringify(result));
    expect(result.components.map((p) => p.category)).toEqual(["case", "pcb", "plate", "stabilizer"]);
    const kitIds = new Set(result.components.map((p) => p.metadata?.kitId));
    expect(kitIds.size).toBe(1);
    expect(result.components.every((p) => p.metadata?.kitLock === true)).toBe(true);
    expect(result.components.every((p) => p.metadata?.sourceUrl === c.sourceUrl)).toBe(true);
    expect(result.components.every((p) => p.metadata?.lastCheckedAt === context.checkedAt)).toBe(true);
    const total = result.components.reduce((sum, p) => sum + (p.price ?? 0), 0);
    expect(total).toBeCloseTo(300, 5);
  });

  it("does not invent kit stabilizers when their sizes are unknown", () => {
    const c = candidateOf(kitProduct);
    c.fields.beginnerFriendly = known(true, 1, "reviewer", "fixed by reviewer");
    c.fields.stabilizerSizes = { value: "unknown", confidence: 0, source: "default", snippet: "" };
    const result = assembleCandidate(c, context);
    if (!result.ok) throw new Error(JSON.stringify(result));
    expect(result.components.map((p) => p.category)).toEqual(["case", "pcb", "plate"]);
  });

  it("stores source URL, check date and price basis on every imported part", () => {
    const c = candidateOf(switchProduct);
    c.fields.beginnerFriendly = known(true, 1, "reviewer", "fixed by reviewer");
    const result = assembleCandidate(c, context);
    if (!result.ok) throw new Error(JSON.stringify(result));
    expect(result.components[0]).toMatchObject({
      id: "switch_gateron_test_yellow_linear_switches",
      price: 1.1,
      priceCurrency: "MYR",
      vendorUrl: c.sourceUrl,
      metadata: {
        sourceType: "imported",
        sourceUrl: c.sourceUrl,
        lastCheckedAt: context.checkedAt,
        priceBasis: "listed_excl_shipping",
        observedPackSize: 35,
      },
    });
    // Safeguard: no vendor photo is carried onto the site.
    expect(result.components[0].imageUrl).toBeUndefined();
  });
});

describe("checks before review", () => {
  const existingSwitch = frozenCatalog.find((c) => c.category === "switch")!;

  it("flags a duplicate of an existing part (same brand and name)", () => {
    const copy = { ...existingSwitch, id: "switch_copy" } as KeyboardComponent;
    expect(findDuplicates(copy, frozenCatalog)).toEqual([
      expect.objectContaining({ check: "duplicate", severity: "block" }),
    ]);
  });

  it("warns on the same brand and model code under a different name (GMK104 case)", () => {
    const frozenGmk104 = frozenCatalog.find((c) => c.id === "case_gmk104_full_abs")!;
    const imported = { ...frozenGmk104, id: "case_zuoya_gmk104_100_full_size_custom", name: "Zuoya GMK104 100%/Full Size Custom Case" } as KeyboardComponent;
    expect(findDuplicates(imported, frozenCatalog)).toEqual([
      expect.objectContaining({ check: "duplicate", severity: "warn" }),
    ]);
    expect([...modelCodes("Keychron K Pro V2 Red")]).toEqual([]);
  });

  it("flags implausible prices", () => {
    const pricey = { ...existingSwitch, price: 40 } as KeyboardComponent;
    expect(checkSanity(pricey)[0]).toMatchObject({ check: "sanity", severity: "warn" });
    expect(checkSanity(existingSwitch)).toEqual([]);
  });

  it("finds a valid build for a new switch using the rule engine", () => {
    const newSwitch = { ...existingSwitch, id: "switch_new_test", name: "New Test Linear" } as KeyboardComponent;
    const result = findValidBuild([newSwitch], [...frozenCatalog, newSwitch]);
    expect(result.found).toBe(true);
    if (result.found) expect(result.componentIds.switch).toBe("switch_new_test");
  });

  it("finds a valid build for a whole imported kit", () => {
    const c = candidateOf(kitProduct);
    c.fields.beginnerFriendly = known(true, 1, "reviewer", "fixed by reviewer");
    const result = assembleCandidate(c, context);
    if (!result.ok) throw new Error("kit did not assemble");
    const checks = runChecks(result.components, frozenCatalog);
    expect(checks.flags.filter((f) => f.check === "buildable")).toEqual([]);
    expect(checks.exampleBuild?.case).toBe(result.components[0].id);
  });

  it("flags a part that cannot be in any valid build", () => {
    const orphanPcb: KeyboardComponent = {
      id: "pcb_orphan_test",
      category: "pcb",
      name: "Orphan O-Ring 60% PCB",
      brand: "Test",
      beginnerFriendly: false,
      layouts: ["60"],
      switchTechnologySupport: ["mechanical"],
      pcbMountSupport: ["o_ring_mount"],
      stabilizerTypeSupport: ["pcb_mount"],
      connection: "wired",
      hotswap: true,
    };
    const checks = runChecks([orphanPcb], frozenCatalog);
    expect(checks.flags.filter((f) => f.check === "buildable")).toHaveLength(1);
    expect(checks.exampleBuild).toBeUndefined();
  });
});

describe("review decisions", () => {
  it("applies the reviewer's fixes over the importer's values", () => {
    const c = candidateOf(kitProduct);
    const fixed = applyDecision(c, {
      decision: "approve",
      fixes: { beginnerFriendly: false, mountSupport: ["top_mount"] },
      note: "",
    });
    expect(fixed.fields.beginnerFriendly).toMatchObject({ value: false, source: "reviewer", confidence: 1 });
    expect(fixed.fields.mountSupport.value).toEqual(["top_mount"]);
    expect(c.fields.mountSupport.value).toEqual(["gasket_mount"]);
  });

  it("keeps existing decisions when the review is regenerated", () => {
    const c = candidateOf(switchProduct);
    const first = mergeDecisions("b", [c], undefined);
    first.parts[c.key] = { decision: "approve", fixes: { beginnerFriendly: true }, note: "ok" };
    first.reviewStartedAt = "2026-11-28T10:00:00+08:00";
    const again = mergeDecisions("b", [c, candidateOf(keycapProduct)], first);
    expect(again.parts[c.key].decision).toBe("approve");
    expect(again.reviewStartedAt).toBe(first.reviewStartedAt);
    expect(Object.keys(again.parts)).toHaveLength(2);
  });
});
