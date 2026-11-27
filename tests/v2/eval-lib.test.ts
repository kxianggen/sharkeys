import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";

import { checkHardRequirements, type BuildFacts } from "../../scripts/v2/lib/app-client";
import { checkInventedParts } from "../../scripts/v2/lib/invented-parts";
import { costUSD } from "../../scripts/v2/lib/pricing";
import { mean, percentile, ratio, stdev } from "../../scripts/v2/lib/stats";

const catalogue = keyboardComponents.map((c) => ({ id: c.id, name: c.name, brand: c.brand }));

describe("stats", () => {
  it("computes nearest-rank percentiles", () => {
    const v = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    expect(percentile(v, 50)).toBe(500);
    expect(percentile(v, 95)).toBe(1000);
    expect(percentile([], 50)).toBeNull();
  });

  it("reports spread as unknown with a single run", () => {
    expect(stdev([0.6])).toBeNull();
    expect(stdev([0.5, 0.7])).toBeCloseTo(0.1414, 3);
    expect(mean([1, 2, 3])).toBe(2);
    expect(ratio(1, 0)).toBeNull();
  });
});

describe("pricing", () => {
  it("prices gpt-4.1-mini tokens", () => {
    // 1M input = $0.40, 1M output = $1.60
    expect(costUSD({ inputTokens: 1_000_000, cachedInputTokens: 0, outputTokens: 1_000_000 })).toBeCloseTo(2.0);
  });
});

describe("invented-parts check", () => {
  it("hard-fails component IDs that are not in the catalogue", () => {
    const r = checkInventedParts({
      catalogue,
      returnedIds: ["switch_gateron_oil_king", "switch_made_up_ghost"],
      replyText: "",
    });
    expect(r.unknownIds).toEqual(["switch_made_up_ghost"]);
  });

  it("does not flag catalogue parts or generic terms", () => {
    const r = checkInventedParts({
      catalogue,
      returnedIds: [],
      replyText:
        "Try the Gateron Oil King with a POM plate in a gasket case, PBT keycaps, Cherry MX-style stems. Akko switches are also fine.",
    });
    expect(r.possible).toEqual([]);
  });

  it("flags non-catalogue brands and models as possible, noting echoes", () => {
    const r = checkInventedParts({
      catalogue,
      returnedIds: [],
      replyText: "We don't stock the Keychron Q1. The Gateron Yellow is similar.",
      userText: "do you have keychron q1",
    });
    expect(r.possible).toEqual(
      expect.arrayContaining([
        { term: "keychron", reason: "brand_not_in_catalogue", echoedFromUser: true },
        { term: "gateron yellow", reason: "model_not_in_catalogue", echoedFromUser: false },
      ]),
    );
  });
});

describe("hard requirements code check", () => {
  const facts: BuildFacts = {
    title: "t", totalRM: 290, layout: "65", connection: "both",
    switchName: "s", switchSound: "silent", switchTechnology: "mechanical",
    keycapName: "k", keycapColours: ["black", "white"], caseName: "c",
  };

  it("passes when every requirement holds", () => {
    expect(checkHardRequirements({ maxTotalRM: 300, layout: "65", connection: "both" }, facts).pass).toBe(true);
  });

  it("fails over budget or wrong colour, and with no build", () => {
    expect(checkHardRequirements({ maxTotalRM: 250 }, facts).pass).toBe(false);
    expect(checkHardRequirements({ keycapColourAny: ["purple"] }, facts).pass).toBe(false);
    expect(checkHardRequirements({ maxTotalRM: 300 }, null).pass).toBe(false);
  });

  it("passes trivially when there are no checkable requirements", () => {
    expect(checkHardRequirements({ mustNotRecommendProducts: ["HHKB"] }, null).pass).toBe(true);
  });
});
