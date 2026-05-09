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
    case: "case_zuoya_gmk67_v2_kit_case",
    pcb: "pcb_zuoya_gmk67_v2_hotswap",
    plate: "plate_zuoya_gmk67_v2_pc",
    switch: "switch_gateron_milky_yellow_pro",
    keycap: "keycap_mecha_bow_cherry_pbt",
    stabilizer: "stab_zuoya_gmk67_plate_mount",
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
    const component = getComponentById("pcb_zuoya_gmk67_v2_hotswap");

    expect(component?.category).toBe("pcb");
    expect(component?.name).toBe("Zuoya GMK67 V2 Hotswap PCB");
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

  it("groups components by category", () => {
    const grouped = groupComponentsByCategory();

    expect(grouped.case).toHaveLength(3);
    expect(grouped.pcb).toHaveLength(3);
    expect(grouped.switch).toHaveLength(5);
  });

  it("searches components by simple criteria", () => {
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
        "switch_akko_v3_cream_yellow_pro",
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

  it("validates a build selection from component IDs", () => {
    const result = validateBuildSelectionFromIds(validBuildSelection);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
