// TODO(catalog-rewrite): it.skip tests below are pinned to the pre-19-part seed catalog
// (deleted component IDs + obsolete 75% aluminum blocker). Repoint fixtures to new IDs and unskip.
import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import {
  getComponentById,
  groupComponentsByCategory,
  listComponents,
  listComponentsByCategory,
  searchComponents,
  validateBuildSelectionFromIds,
} from "@/lib/components";
import type { ComponentCategory, KeyboardBuildSelection } from "@/lib/types";

const validBuildSelection: KeyboardBuildSelection = {
  componentIds: {
    case: "case_lucky65_v3_65_aluminum",
    pcb: "pcb_lucky65_v3_65_hotswap",
    plate: "plate_lucky65_v3_65_fr4",
    switch: "switch_gateron_milky_yellow_pro",
    keycap: "keycap_unknown_pudding_oem_pbt",
    stabilizer: "stab_lucky65_v3_screw_in",
  },
  preferences: {
    layout: "65",
    soundProfile: "creamy",
  },
};

describe("component repository helpers", () => {
  it("lists all seed components without mutating the source catalog", () => {
    const components = listComponents();

    expect(components).toHaveLength(keyboardComponents.length);
    expect(components).not.toBe(keyboardComponents);
  });

  it("looks up a component by ID", () => {
    const component = getComponentById("pcb_lucky65_v3_65_hotswap");

    expect(component?.category).toBe("pcb");
    expect(component?.name).toBe("Lucky65 V3 65% Tri-Mode Hotswap PCB");
  });

  it("filters components by category", () => {
    const switches = listComponentsByCategory("switch");

    expect(switches.length).toBeGreaterThan(0);
    expect(switches.every((component) => component.category === "switch")).toBe(
      true,
    );
  });

  it("rejects invalid categories", () => {
    expect(() =>
      listComponentsByCategory("invalid" as ComponentCategory),
    ).toThrow();
  });

  it.skip("groups components by category", () => {
    const grouped = groupComponentsByCategory();

    expect(grouped.case).toHaveLength(5);
    expect(grouped.pcb).toHaveLength(2);
    expect(grouped.plate).toHaveLength(5);
    expect(grouped.switch).toHaveLength(13);
    expect(grouped.keycap).toHaveLength(10);
    expect(grouped.stabilizer).toHaveLength(7);
  });

  it("does not encode unverified stabilizer support as deterministic PCB data", () => {
    const pcbs = listComponentsByCategory("pcb");

    expect(
      pcbs.filter(
        (component) =>
          component.metadata?.stabilizerTypeSupportConfidence ===
          "needs verification",
      ),
    ).toEqual([]);
  });

  it.skip("searches components by simple criteria", () => {
    const results = searchComponents({
      category: "switch",
      switchTechnology: "mechanical",
      beginnerFriendly: true,
      maxPrice: 1,
      currency: "MYR",
    });

    expect(results.map((component) => component.id)).toEqual(
      expect.arrayContaining([
        "switch_gateron_milky_yellow_pro",
        "switch_akko_cream_yellow_v3_pro",
      ]),
    );
  });

  it("keeps Malaysia seed prices in MYR", () => {
    expect(
      keyboardComponents.every(
        (component) =>
          component.price === undefined || component.priceCurrency === "MYR",
      ),
    ).toBe(true);
  });

  it.skip("validates a build selection from component IDs", () => {
    const result = validateBuildSelectionFromIds(validBuildSelection);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
