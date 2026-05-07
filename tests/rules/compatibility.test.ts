import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import {
  requiredComponentCategories,
  validateBuildCompatibility,
} from "@/lib/rules";
import {
  keyboardComponentCatalogSchema,
  type KeyboardBuildSelection,
  type KeyboardComponent,
} from "@/lib/types";

const validNeo65Build: KeyboardBuildSelection = {
  name: "Creamy Neo 65",
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
    beginnerFriendly: true,
  },
};

const pairwiseOnlyCase = {
  id: "test_case_pairwise_60_65",
  category: "case",
  name: "Pairwise 60/65 Case",
  brand: "Test Fixtures",
  beginnerFriendly: true,
  layouts: ["60", "65"],
  caseMountSupport: ["gasket_mount"],
} satisfies KeyboardComponent;

const pairwiseOnlyPcb = {
  id: "test_pcb_pairwise_65_75",
  category: "pcb",
  name: "Pairwise 65/75 PCB",
  brand: "Test Fixtures",
  beginnerFriendly: true,
  layouts: ["65", "75"],
  switchTechnologySupport: ["mechanical"],
  pcbMountSupport: ["gasket_mount"],
  stabilizerTypeSupport: ["screw_in"],
  connection: "wired",
  hotswap: true,
} satisfies KeyboardComponent;

const pairwiseOnlyPlate = {
  id: "test_plate_pairwise_60_75",
  category: "plate",
  name: "Pairwise 60/75 Plate",
  brand: "Test Fixtures",
  beginnerFriendly: true,
  layouts: ["60", "75"],
  plateMountSupport: ["gasket_mount"],
  switchTechnologySupport: ["mechanical"],
} satisfies KeyboardComponent;

const layoutMismatchPlate = {
  id: "test_plate_75_mechanical_gasket",
  category: "plate",
  name: "75 Mechanical Gasket Plate",
  brand: "Test Fixtures",
  beginnerFriendly: true,
  layouts: ["75"],
  plateMountSupport: ["gasket_mount"],
  switchTechnologySupport: ["mechanical", "hall_effect"],
} satisfies KeyboardComponent;

const trayOnly65Case = {
  id: "test_case_65_tray_only",
  category: "case",
  name: "65 Tray Only Case",
  brand: "Test Fixtures",
  beginnerFriendly: true,
  layouts: ["65"],
  caseMountSupport: ["tray_mount"],
} satisfies KeyboardComponent;

const topReOnly65Keycap = {
  id: "test_keycap_65_topre_only",
  category: "keycap",
  name: "65 Topre Only Keycaps",
  brand: "Test Fixtures",
  beginnerFriendly: true,
  keycapProfile: "topre",
  layoutSupport: ["65"],
  compatibleSwitchTechnologies: ["topre"],
} satisfies KeyboardComponent;

function withTestComponents(...components: KeyboardComponent[]) {
  return [...keyboardComponents, ...components];
}

describe("keyboard component seed data", () => {
  it("passes the reusable Zod catalog schema", () => {
    expect(() =>
      keyboardComponentCatalogSchema.parse(keyboardComponents),
    ).not.toThrow();
  });
});

describe("validateBuildCompatibility", () => {
  it("passes a fully valid build", () => {
    const result = validateBuildCompatibility(
      validNeo65Build,
      keyboardComponents,
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.explanations).toContain(
      "Build compatibility passed all deterministic Phase 1 validation rules.",
    );
  });

  it("blocks incompatible case and PCB layouts", () => {
    const result = validateBuildCompatibility(
      {
        ...validNeo65Build,
        componentIds: {
          ...validNeo65Build.componentIds,
          case: "case_budget60_tray",
        },
      },
      keyboardComponents,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain(
      "case_pcb_layout_mismatch",
    );
    expect(result.errors[0]?.affectedCategories).toContain("case");
  });

  it("blocks builds where case, PCB, and plate have no shared physical layout", () => {
    const result = validateBuildCompatibility(
      {
        componentIds: {
          case: pairwiseOnlyCase.id,
          pcb: pairwiseOnlyPcb.id,
          plate: pairwiseOnlyPlate.id,
          switch: "switch_mx_linear_creamy",
          keycap: "keycap_cherry_ansi_mx",
          stabilizer: "stab_durock_v2_screw_in",
        },
      },
      withTestComponents(pairwiseOnlyCase, pairwiseOnlyPcb, pairwiseOnlyPlate),
    );

    const errorCodes = result.errors.map((issue) => issue.code);

    expect(result.isValid).toBe(false);
    expect(errorCodes).toContain("case_pcb_plate_layout_mismatch");
    expect(errorCodes).not.toContain("case_pcb_layout_mismatch");
    expect(errorCodes).not.toContain("plate_pcb_layout_mismatch");
    expect(errorCodes).not.toContain("plate_case_layout_mismatch");
  });

  it("blocks plate layout mismatches", () => {
    const result = validateBuildCompatibility(
      {
        ...validNeo65Build,
        componentIds: {
          ...validNeo65Build.componentIds,
          plate: layoutMismatchPlate.id,
        },
      },
      withTestComponents(layoutMismatchPlate),
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "case_pcb_plate_layout_mismatch",
        "plate_pcb_layout_mismatch",
        "plate_case_layout_mismatch",
      ]),
    );
  });

  it("blocks mount compatibility mismatches", () => {
    const result = validateBuildCompatibility(
      {
        ...validNeo65Build,
        componentIds: {
          ...validNeo65Build.componentIds,
          case: trayOnly65Case.id,
        },
      },
      withTestComponents(trayOnly65Case),
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "case_pcb_mount_mismatch",
        "case_plate_mount_mismatch",
      ]),
    );
  });

  it("blocks incompatible switch and PCB technology", () => {
    const result = validateBuildCompatibility(
      {
        ...validNeo65Build,
        componentIds: {
          ...validNeo65Build.componentIds,
          switch: "switch_optical_clicky",
        },
      },
      keyboardComponents,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain(
      "switch_pcb_technology_mismatch",
    );
  });

  it("blocks keycap switch technology mismatches", () => {
    const result = validateBuildCompatibility(
      {
        ...validNeo65Build,
        componentIds: {
          ...validNeo65Build.componentIds,
          keycap: topReOnly65Keycap.id,
        },
      },
      withTestComponents(topReOnly65Keycap),
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain(
      "switch_keycap_technology_mismatch",
    );
  });

  it("blocks stabilizer incompatibility", () => {
    const result = validateBuildCompatibility(
      {
        ...validNeo65Build,
        componentIds: {
          ...validNeo65Build.componentIds,
          stabilizer: "stab_clip_in_plate",
        },
      },
      keyboardComponents,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain(
      "stabilizer_pcb_type_mismatch",
    );
  });

  it("reports missing required components clearly", () => {
    const result = validateBuildCompatibility(
      {
        componentIds: {
          case: "case_neo65_gasket",
        },
      },
      keyboardComponents,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(requiredComponentCategories.length - 1);
    expect(result.errors.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "missing_pcb",
        "missing_plate",
        "missing_switch",
        "missing_keycap",
        "missing_stabilizer",
      ]),
    );
  });

  it("keeps sound preference mismatches as warning-only issues", () => {
    const result = validateBuildCompatibility(
      {
        ...validNeo65Build,
        preferences: {
          layout: "65",
          soundProfile: "silent",
        },
      },
      keyboardComponents,
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings.map((issue) => issue.code)).toContain(
      "sound_profile_mismatch",
    );
  });

  it("keeps beginner-friendly mismatches as warning-only issues", () => {
    const result = validateBuildCompatibility(
      {
        ...validNeo65Build,
        componentIds: {
          ...validNeo65Build.componentIds,
          switch: "switch_hall_silent",
        },
        preferences: {
          layout: "65",
          beginnerFriendly: true,
        },
      },
      keyboardComponents,
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings.map((issue) => issue.code)).toContain(
      "beginner_friendliness_mismatch",
    );
  });
});
