import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import { extractedKeyboardIntentSchema } from "@/lib/ai";
import { generateRecommendationsFromIntent } from "@/lib/recommendations";
import {
  buildKey,
  compareBuilds,
  pickThisIf,
  type ComparableBuild,
} from "@/lib/recommendations/compare";

async function threeBuilds(): Promise<ComparableBuild[]> {
  const result = await generateRecommendationsFromIntent(
    {
      intent: extractedKeyboardIntentSchema.parse({
        budget: null,
        layout: null,
        soundProfile: "thocky",
        useCase: "typing",
        beginnerFriendly: null,
        switchTechnology: null,
        priorities: [],
        constraints: [],
        colour: null,
        clarificationNeeded: false,
        clarificationQuestion: null,
      }),
      source: "fallback_missing_api_key",
    },
    { catalogComponents: keyboardComponents },
  );

  if (result.recommendations.length < 3) {
    throw new Error("fixture: thocky intent must resolve 3 builds");
  }

  return result.recommendations;
}

function withPrice(build: ComparableBuild, estimatedPrice: number): ComparableBuild {
  return { ...build, estimatedPrice };
}

describe("compareBuilds", () => {
  it("returns the six rows with one value per build", async () => {
    const builds = await threeBuilds();
    const rows = compareBuilds(builds);

    expect(rows.map((row) => row.key)).toEqual([
      "price",
      "sound",
      "switch",
      "layout",
      "connection",
      "keycaps",
    ]);
    for (const row of rows) expect(row.values).toHaveLength(3);
  });

  it("flags only the rows whose values differ", async () => {
    const [first] = await threeBuilds();
    const rows = compareBuilds([withPrice(first, 400), withPrice(first, 450)]);

    expect(rows.find((row) => row.key === "price")?.differs).toBe(true);
    expect(rows.filter((row) => row.key !== "price").every((row) => !row.differs)).toBe(
      true,
    );
  });
});

describe("pickThisIf", () => {
  it("gives the cheapest build the price reason and every build a line", async () => {
    const [a, b, c] = await threeBuilds();
    const lines = pickThisIf([withPrice(a, 500), withPrice(b, 300), withPrice(c, 700)]);

    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe("Pick this if you want the lowest price.");
    for (const line of lines) expect(line).toMatch(/^Pick this if .+\.$/);
  });

  it("never gives two builds the same reason", async () => {
    const lines = pickThisIf(await threeBuilds());

    expect(new Set(lines).size).toBe(lines.length);
  });

  it("is deterministic", async () => {
    const builds = await threeBuilds();

    expect(pickThisIf(builds)).toEqual(pickThisIf(builds));
  });
});

describe("buildKey", () => {
  it("identifies a build by its parts, not its per-response id", async () => {
    const [first] = await threeBuilds();

    expect(buildKey(first)).toBe(buildKey({ componentIds: { ...first.componentIds } }));
  });
});
