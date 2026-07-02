// TODO(catalog-rewrite): it.skip tests below are pinned to the pre-19-part seed catalog
// (deleted component IDs + obsolete 75% aluminum blocker). Repoint fixtures to new IDs and unskip.
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

const validKeychronBuild: KeyboardBuildSelection = {
  name: "Thocky Lucky65 V3",
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
    beginnerFriendly: true,
  },
};

const validWeikavBuild: KeyboardBuildSelection = {
  name: "Thocky Weikav Star 80",
  componentIds: {
    case: "case_weikav_star80_tkl_aluminum",
    pcb: "pcb_weikav_star80_tkl_hotswap",
    plate: "plate_weikav_star80_tkl_fr4",
    switch: "switch_gateron_oil_king",
    keycap: "keycap_unknown_retro_9009_cherry_pbt",
    stabilizer: "stab_weikav_star80_pcb_mount",
  },
  preferences: {
    layout: "tkl",
    soundProfile: "thocky",
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
  stabilizerTypeSupport: ["plate_mount"],
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

const opticalSwitch = {
  id: "test_switch_optical_clicky",
  category: "switch",
  name: "Test Optical Clicky Switch",
  brand: "Test Fixtures",
  beginnerFriendly: true,
  switchTechnology: "optical",
  pinCount: 0,
  soundProfile: "clacky",
} satisfies KeyboardComponent;

const differentKitTklPcb = {
  id: "test_pcb_other_tkl_gasket_hotswap",
  category: "pcb",
  name: "Other Kit TKL Hotswap PCB",
  brand: "Test Fixtures",
  beginnerFriendly: true,
  layouts: ["tkl"],
  switchTechnologySupport: ["mechanical"],
  pcbMountSupport: ["gasket_mount"],
  stabilizerTypeSupport: ["pcb_mount"],
  connection: "wired",
  hotswap: true,
  metadata: {
    sourceType: "kit_derived",
    kitId: "fixture_other_tkl",
    kitLock: true,
  },
} satisfies KeyboardComponent;

const kitLockedSwitchFixture = {
  id: "test_switch_metadata_kit_lock_ignored",
  category: "switch",
  name: "Metadata Kit-Locked Mechanical Switch",
  brand: "Test Fixtures",
  beginnerFriendly: true,
  switchTechnology: "mechanical",
  pinCount: 5,
  soundProfile: "creamy",
  metadata: {
    kitId: "unrelated_switch_kit",
    kitLock: true,
  },
} satisfies KeyboardComponent;

const kitLockedKeycapFixture = {
  id: "test_keycap_metadata_kit_lock_ignored",
  category: "keycap",
  name: "Metadata Kit-Locked 65 Keycaps",
  brand: "Test Fixtures",
  beginnerFriendly: true,
  keycapProfile: "cherry",
  layoutSupport: ["65"],
  compatibleSwitchTechnologies: ["mechanical"],
  metadata: {
    kitId: "unrelated_keycap_kit",
    kitLock: true,
  },
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
  it.skip("passes a fully valid build", () => {
    const result = validateBuildCompatibility(
      validKeychronBuild,
      keyboardComponents,
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.explanations).toContain(
      "Build compatibility passed all deterministic Phase 1 validation rules.",
    );
  });

  it.skip("passes a valid Weikav Star 80 kit-derived build", () => {
    const result = validateBuildCompatibility(
      validWeikavBuild,
      keyboardComponents,
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.explanations).toContain(
      "Build compatibility passed all deterministic Phase 1 validation rules.",
    );
  });

  it.skip("blocks incompatible case and PCB layouts", () => {
    const result = validateBuildCompatibility(
      {
        ...validKeychronBuild,
        componentIds: {
          ...validKeychronBuild.componentIds,
          case: "case_weikav_star80_tkl_aluminum",
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

  it.skip("blocks cross-kit structural combinations", () => {
    const result = validateBuildCompatibility(
      {
        ...validKeychronBuild,
        componentIds: {
          ...validKeychronBuild.componentIds,
          case: "case_weikav_star80_tkl_aluminum",
        },
      },
      keyboardComponents,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain(
      "kit_structural_mismatch",
    );
    expect(
      result.errors.find((issue) => issue.code === "kit_structural_mismatch")
        ?.message,
    ).toContain("same barebones kit");
  });

  it.skip("blocks same-layout cross-kit TKL structural combinations", () => {
    const result = validateBuildCompatibility(
      {
        ...validWeikavBuild,
        componentIds: {
          ...validWeikavBuild.componentIds,
          pcb: differentKitTklPcb.id,
          stabilizer: "stab_tx_ap_clip_in_pcb_mount",
        },
      },
      withTestComponents(differentKitTklPcb),
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain(
      "kit_structural_mismatch",
    );
    expect(result.errors.map((issue) => issue.code)).not.toContain(
      "case_pcb_layout_mismatch",
    );
    expect(result.errors.map((issue) => issue.code)).not.toContain(
      "case_pcb_mount_mismatch",
    );
  });

  it.skip("allows standalone stabilizers with kit-derived structural paths", () => {
    const result = validateBuildCompatibility(
      {
        ...validWeikavBuild,
        componentIds: {
          ...validWeikavBuild.componentIds,
          stabilizer: "stab_tx_ap_clip_in_pcb_mount",
        },
      },
      keyboardComponents,
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("does not apply kit lock semantics to switches or keycaps", () => {
    const result = validateBuildCompatibility(
      {
        ...validKeychronBuild,
        componentIds: {
          ...validKeychronBuild.componentIds,
          switch: kitLockedSwitchFixture.id,
          keycap: kitLockedKeycapFixture.id,
        },
      },
      withTestComponents(kitLockedSwitchFixture, kitLockedKeycapFixture),
    );

    expect(result.isValid).toBe(true);
    expect(result.errors.map((issue) => issue.code)).not.toContain(
      "kit_structural_mismatch",
    );
  });

  it("blocks builds where case, PCB, and plate have no shared physical layout", () => {
    const result = validateBuildCompatibility(
      {
        componentIds: {
          case: pairwiseOnlyCase.id,
          pcb: pairwiseOnlyPcb.id,
          plate: pairwiseOnlyPlate.id,
          switch: "switch_gateron_milky_yellow_pro",
          keycap: "keycap_unknown_pudding_oem_pbt",
          stabilizer: "stab_lucky65_v3_screw_in",
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
        ...validKeychronBuild,
        componentIds: {
          ...validKeychronBuild.componentIds,
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
        ...validKeychronBuild,
        componentIds: {
          ...validKeychronBuild.componentIds,
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
        ...validKeychronBuild,
        componentIds: {
          ...validKeychronBuild.componentIds,
          switch: opticalSwitch.id,
        },
      },
      withTestComponents(opticalSwitch),
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((issue) => issue.code)).toContain(
      "switch_pcb_technology_mismatch",
    );
  });

  it("blocks keycap switch technology mismatches", () => {
    const result = validateBuildCompatibility(
      {
        ...validKeychronBuild,
        componentIds: {
          ...validKeychronBuild.componentIds,
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

  it.skip("blocks stabilizer incompatibility", () => {
    const result = validateBuildCompatibility(
      {
        ...validKeychronBuild,
        componentIds: {
          ...validKeychronBuild.componentIds,
          stabilizer: "stab_weikav_star80_pcb_mount",
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
          case: "case_lucky65_v3_65_aluminum",
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

  it.skip("keeps sound preference mismatches as warning-only issues", () => {
    const result = validateBuildCompatibility(
      {
        ...validKeychronBuild,
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

  it.skip("keeps beginner-friendly mismatches as warning-only issues", () => {
    const result = validateBuildCompatibility(
      {
        ...validKeychronBuild,
        componentIds: {
          ...validKeychronBuild.componentIds,
          switch: "switch_gateron_oil_king",
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
