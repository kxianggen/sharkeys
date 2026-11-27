import { describe, expect, it } from "vitest";

import { mapShopifyProduct } from "../../scripts/catalog/lib/deterministic";
import {
  AI_CONFIDENCE_CAP,
  aiExtractionSchema,
  estimateTokens,
  fieldsToAsk,
  mergeAiExtraction,
  type AiExtraction,
} from "../../scripts/catalog/lib/extract-ai";
import type { Candidate } from "../../scripts/catalog/lib/fields";

import { kitProduct, switchProduct, vendorContext } from "./fixtures";

function candidateOf(product: Parameters<typeof mapShopifyProduct>[0]): Candidate {
  const mapped = mapShopifyProduct(product, vendorContext);
  if (mapped.kind !== "candidate") throw new Error("skipped");
  return mapped.candidate;
}

const none = { value: "unknown", confidence: 0, evidence: "" };

function extraction(overrides: Partial<AiExtraction>): AiExtraction {
  return aiExtractionSchema.parse({
    mountSupport: { values: [], confidence: 0, evidence: "" },
    switchTechnology: none,
    keycapProfile: none,
    stabilizerType: none,
    soundProfile: none,
    beginnerFriendly: none,
    plateMaterial: none,
    ...overrides,
  });
}

describe("AI extraction safeguards", () => {
  it("only asks for fields plain code could not read confidently", () => {
    const kit = candidateOf(kitProduct);
    const asked = fieldsToAsk(kit);
    expect(asked).toContain("beginnerFriendly");
    expect(asked).toContain("mountSupport"); // regex 0.75 < 0.8, so the AI confirms it
    expect(asked).not.toContain("keycapProfile"); // not a kit field
    expect(asked).not.toContain("stabilizerType"); // regex already 0.85
  });

  it("accepts a value whose quote is in the product text, capped in confidence", () => {
    const kit = candidateOf(kitProduct);
    const merged = mergeAiExtraction(kit, ["beginnerFriendly"], extraction({
      beginnerFriendly: { value: "yes", confidence: 0.99, evidence: "5-pin hot-swap PCB" },
    }));
    expect(merged.fields.beginnerFriendly).toMatchObject({ value: true, source: "ai", confidence: AI_CONFIDENCE_CAP });
  });

  it("drops a value whose quote is not in the product text", () => {
    const kit = candidateOf(kitProduct);
    const merged = mergeAiExtraction(kit, ["soundProfile"], extraction({
      soundProfile: { value: "thocky", confidence: 0.9, evidence: "deep thocky sound" },
    }));
    expect(merged.fields.soundProfile.value).toBe("unknown");
    expect(merged.notes.join(" ")).toMatch(/quote is not in the product text/);
  });

  it("turns a disagreement with plain code into unknown", () => {
    const kit = candidateOf(kitProduct);
    const merged = mergeAiExtraction(kit, ["mountSupport"], extraction({
      mountSupport: { values: ["top_mount"], confidence: 0.8, evidence: "Gasket mount structure" },
    }));
    expect(merged.fields.mountSupport.value).toBe("unknown");
    expect(merged.notes.join(" ")).toMatch(/disagree/);
  });

  it("keeps plain-code evidence when the AI agrees", () => {
    const kit = candidateOf(kitProduct);
    const merged = mergeAiExtraction(kit, ["mountSupport"], extraction({
      mountSupport: { values: ["gasket_mount"], confidence: 0.9, evidence: "Gasket mount structure" },
    }));
    expect(merged.fields.mountSupport).toMatchObject({ value: ["gasket_mount"], source: "regex", confidence: 0.85 });
  });

  it("estimates a small cost per part", () => {
    const sw = candidateOf(switchProduct);
    const { input, output } = estimateTokens(sw, fieldsToAsk(sw));
    const usd = (input * 0.4 + output * 1.6) / 1_000_000;
    expect(usd).toBeLessThan(0.005);
  });
});
