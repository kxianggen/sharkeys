import { describe, expect, it } from "vitest";

import { frozenCatalog } from "@/data/catalog";

import { beginnerRule, mapShopifyProduct } from "../../scripts/catalog/lib/deterministic";
import { fieldsToAsk } from "../../scripts/catalog/lib/extract-ai";
import { emptyFields, known, type Candidate, type CandidateFields } from "../../scripts/catalog/lib/fields";
import { deriveFields } from "../../scripts/catalog/lib/review";

import { keycapProduct, kitProduct, switchProduct, vendorContext } from "./fixtures";

function candidateOf(product: Parameters<typeof mapShopifyProduct>[0]): Candidate {
  const mapped = mapShopifyProduct(product, vendorContext);
  if (mapped.kind !== "candidate") throw new Error("skipped");
  return mapped.candidate;
}

describe("beginner-friendly rule", () => {
  it("reproduces every hand-typed switch, keycap and aftermarket stabilizer in the frozen catalogue", () => {
    const parts = frozenCatalog.filter(
      (c) =>
        c.category === "switch" ||
        c.category === "keycap" ||
        // Kit-included stabilisers come in the box, so they were marked by kit, not by type.
        (c.category === "stabilizer" && c.metadata?.kitLock !== true),
    );
    expect(parts.length).toBeGreaterThanOrEqual(20);
    for (const part of parts) {
      const fields: CandidateFields = emptyFields();
      if (part.category === "switch") {
        fields.switchTechnology = known(part.switchTechnology, 1, "structured", "");
        fields.price = known(part.price!, 1, "structured", "");
      }
      if (part.category === "stabilizer") fields.stabilizerType = known(part.stabilizerType, 1, "structured", "");
      const rule = beginnerRule(part.category, fields);
      expect({ id: part.id, value: rule?.value }).toEqual({ id: part.id, value: part.beginnerFriendly });
    }
  });

  it("is filled at review time, labelled as a rule, and not sent to the AI", () => {
    const sw = candidateOf(switchProduct);
    expect(fieldsToAsk(sw)).not.toContain("beginnerFriendly");
    const derived = deriveFields(sw);
    expect(derived.fields.beginnerFriendly).toMatchObject({ value: true, source: "rule", confidence: 0.7 });
    expect(deriveFields(candidateOf(keycapProduct)).fields.beginnerFriendly.value).toBe(true);
  });

  it("does not cover kits, which are still read from the page", () => {
    const kit = candidateOf(kitProduct);
    expect(fieldsToAsk(kit)).toContain("beginnerFriendly");
    expect(deriveFields(kit).fields.beginnerFriendly.value).toBe("unknown");
  });

  it("never overrides a value that is already known", () => {
    const sw = candidateOf(switchProduct);
    sw.fields.beginnerFriendly = known(false, 1, "reviewer", "fixed by reviewer");
    expect(deriveFields(sw).fields.beginnerFriendly).toMatchObject({ value: false, source: "reviewer" });
  });

  it("leaves a switch unknown when its price is unknown", () => {
    const fields = emptyFields();
    fields.switchTechnology = known("mechanical", 1, "structured", "");
    expect(beginnerRule("switch", fields)).toBeUndefined();
  });
});
