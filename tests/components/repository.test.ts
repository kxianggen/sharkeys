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
    case: "case_neo65_gasket",
    pcb: "pcb_neo65_mx_hotswap",
    plate: "plate_neo65_fr4",
    switch: "switch_mx_linear_creamy",
    keycap: "keycap_cherry_ansi_mx",
    stabilizer: "stab_durock_v2_screw_in",
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
    const component = getComponentById("pcb_neo65_mx_hotswap");

    expect(component?.category).toBe("pcb");
    expect(component?.name).toBe("Neo 65 MX Hotswap PCB");
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
    expect(grouped.switch).toHaveLength(4);
  });

  it("searches components by simple criteria", () => {
    const results = searchComponents({
      category: "switch",
      switchTechnology: "mechanical",
      beginnerFriendly: true,
      maxPrice: 0.7,
    });

    expect(results.map((component) => component.id)).toEqual(
      expect.arrayContaining([
        "switch_mx_linear_creamy",
        "switch_mx_tactile_thocky",
      ]),
    );
  });

  it("validates a build selection from component IDs", () => {
    const result = validateBuildSelectionFromIds(validBuildSelection);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
