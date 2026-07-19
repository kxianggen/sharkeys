import { describe, expect, it } from "vitest";

import {
  HERO_DEMO_COMPONENT_IDS,
  HERO_DEMO_EXPLANATIONS,
  HERO_DEMO_PROMPT,
  HERO_DEMO_RECORDED_PRICE_MYR,
  HERO_DEMO_SWITCH_COUNT,
} from "@/data/hero-demo-build";
import {
  getComponentById,
  listComponents,
  validateBuildSelectionFromIds,
} from "@/lib/components";
import { requiredComponentCategories } from "@/lib/rules";

/**
 * The landing hero replays a recorded pipeline run rather than calling the API
 * on every visit (see src/data/hero-demo-build.ts). A recording can silently go
 * stale: rename a part, retire a kit, or change a compatibility rule, and the
 * hero would keep advertising a build that no longer resolves or no longer
 * validates.
 *
 * These tests are the guard. They re-run the frozen selection through the same
 * deterministic engine that governs every other build path, so catalog drift
 * fails the suite instead of reaching the landing page. This is what keeps the
 * hero subject to the project's core invariant — the rule engine is the only
 * authority on compatibility, including for marketing surfaces.
 */
describe("hero demo build fixture", () => {
  it("resolves every recorded component ID against the catalog", () => {
    for (const category of requiredComponentCategories) {
      const componentId = HERO_DEMO_COMPONENT_IDS[category];
      const component = getComponentById(componentId);

      expect(
        component,
        `hero demo ${category} "${componentId}" is not in the catalog`,
      ).toBeDefined();
      expect(component?.category).toBe(category);
    }
  });

  it("still passes deterministic compatibility validation", () => {
    const result = validateBuildSelectionFromIds({
      componentIds: HERO_DEMO_COMPONENT_IDS,
    });

    expect(
      result.errors,
      `hero demo build no longer validates: ${result.errors
        .map((error) => error.message)
        .join("; ")}`,
    ).toHaveLength(0);
    expect(result.isValid).toBe(true);
  });

  it("still estimates the recorded price", () => {
    // Mirrors estimateBuildPrice() in the recommendation service: switches are
    // counted at ~70 per board, every other part once. A mismatch means catalog
    // prices moved and the recorded figure needs re-recording.
    const total = requiredComponentCategories.reduce((sum, category) => {
      const component = getComponentById(HERO_DEMO_COMPONENT_IDS[category]);
      const price = component?.price ?? 0;

      return sum + (category === "switch" ? price * HERO_DEMO_SWITCH_COUNT : price);
    }, 0);

    expect(Number(total.toFixed(2))).toBe(HERO_DEMO_RECORDED_PRICE_MYR);
  });

  it("prices every part in a single currency", () => {
    // The hero shows one total. Mixed currencies would make that total
    // meaningless, and the service returns null rather than summing them.
    const currencies = new Set(
      requiredComponentCategories.map(
        (category) => getComponentById(HERO_DEMO_COMPONENT_IDS[category])?.priceCurrency,
      ),
    );

    expect(currencies.size).toBe(1);
    expect(currencies.has("MYR")).toBe(true);
  });

  it("keeps recorded explanations consistent with the catalog", () => {
    // Explanations are verbatim engine output naming specific parts. If a part
    // is renamed, the recorded prose silently becomes wrong — this catches that
    // by requiring each build part's name to appear somewhere in the set.
    const explanationText = HERO_DEMO_EXPLANATIONS.join(" ");
    const namedCategories = ["case", "pcb", "plate", "switch", "keycap"] as const;

    for (const category of namedCategories) {
      const component = getComponentById(HERO_DEMO_COMPONENT_IDS[category]);

      expect(
        component && explanationText.includes(component.name),
        `recorded explanations no longer mention the ${category} "${component?.name}" — re-record the fixture`,
      ).toBe(true);
    }
  });

  it("keeps the recorded prompt non-empty and catalog-backed", () => {
    expect(HERO_DEMO_PROMPT.trim().length).toBeGreaterThan(0);
    // Sanity check that the catalog itself loaded; an empty catalog would make
    // every assertion above vacuously pass.
    expect(listComponents().length).toBeGreaterThan(0);
  });
});
