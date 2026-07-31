import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import { getOptionConflicts, validateBuildCompatibility } from "@/lib/rules";
import type { KeyboardBuildSelection } from "@/lib/types";

/**
 * Guards for the GH60 open-ecosystem and 65% alternate-plate records.
 *
 * The point of these additions is *mixing*: a user should be able to change
 * plate material without changing kit, and should be stopped when they cross a
 * boundary that is real (kit-specific plates, magnetic vs MX switches). None of
 * that needed new rule code — these tests pin the behaviour the existing rules
 * already produce, so a later rules change can't silently break it.
 */

const gh60Build = (
  overrides: Partial<KeyboardBuildSelection["componentIds"]> = {},
): KeyboardBuildSelection => ({
  name: "GH60 test build",
  componentIds: {
    case: "case_gh60_universal_aluminum",
    pcb: "pcb_gh60_universal_mx_hotswap",
    plate: "plate_gh60_brass",
    switch: "switch_gateron_oil_king",
    keycap: "keycap_unknown_pudding_oem_pbt",
    stabilizer: "stab_c3_equalz_v3_screw_in",
    ...overrides,
  },
});

describe("GH60 ecosystem", () => {
  it("validates a complete universal GH60 build", () => {
    const result = validateBuildCompatibility(gh60Build(), keyboardComponents);

    expect(result.errors).toEqual([]);
    expect(result.isValid).toBe(true);
  });

  it("accepts every GH60 plate material against the same case and PCB", () => {
    const gh60PlateIds = keyboardComponents
      .filter(
        (component) =>
          component.category === "plate" &&
          component.metadata?.formFactor === "gh60",
      )
      .map((component) => component.id);

    // All seven materials should be swappable without touching anything else.
    expect(gh60PlateIds).toHaveLength(7);

    for (const plate of gh60PlateIds) {
      const result = validateBuildCompatibility(
        gh60Build({ plate }),
        keyboardComponents,
      );

      expect(result.isValid, `${plate} should be a valid GH60 plate`).toBe(true);
    }
  });

  it("covers thocky, neutral and clacky through plate material alone", () => {
    const profiles = new Set(
      keyboardComponents
        .filter(
          (component) =>
            component.category === "plate" &&
            component.metadata?.formFactor === "gh60",
        )
        .map((component) => component.soundProfile),
    );

    expect(profiles).toContain("thocky");
    expect(profiles).toContain("neutral");
    expect(profiles).toContain("clacky");
  });

  it("blocks a GH60 tray-mount plate in a gasket-mount kit", () => {
    const result = validateBuildCompatibility(
      {
        name: "Tray plate in a gasket kit",
        componentIds: {
          case: "case_gmk61_60_abs",
          pcb: "pcb_gmk61_60_hotswap",
          plate: "plate_gh60_brass",
          switch: "switch_gateron_milky_yellow_pro",
          keycap: "keycap_unknown_pudding_oem_pbt",
          stabilizer: "stab_gmk61_plate_mount",
        },
      },
      keyboardComponents,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((error) => error.code)).toContain(
      "case_plate_mount_mismatch",
    );
  });
});

describe("hall-effect / magnetic switches", () => {
  it("validates a magnetic switch on the hall-effect PCB", () => {
    const result = validateBuildCompatibility(
      gh60Build({
        pcb: "pcb_gh60_hall_effect_magnetic",
        switch: "switch_gateron_ks37b_magnetic_jade",
      }),
      keyboardComponents,
    );

    expect(result.errors).toEqual([]);
    expect(result.isValid).toBe(true);
  });

  it("blocks an MX mechanical switch on the hall-effect PCB", () => {
    const result = validateBuildCompatibility(
      gh60Build({ pcb: "pcb_gh60_hall_effect_magnetic" }),
      keyboardComponents,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((error) => error.code)).toContain(
      "switch_pcb_technology_mismatch",
    );
  });

  it("blocks a magnetic switch on an MX hotswap PCB", () => {
    const result = validateBuildCompatibility(
      gh60Build({ switch: "switch_gateron_ks37b_magnetic_jade" }),
      keyboardComponents,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((error) => error.code)).toContain(
      "switch_pcb_technology_mismatch",
    );
  });
});

describe("65% alternate plates", () => {
  it("allows a material swap inside the same kit", () => {
    for (const plate of [
      "plate_lucky65_v3_65_brass",
      "plate_lucky65_v3_65_aluminum",
      "plate_lucky65_v3_65_pom",
    ]) {
      const result = validateBuildCompatibility(
        {
          name: "Lucky65 V3 replate",
          componentIds: {
            case: "case_lucky65_v3_65_aluminum",
            pcb: "pcb_lucky65_v3_65_hotswap",
            plate,
            switch: "switch_gateron_milky_yellow_pro",
            keycap: "keycap_unknown_pudding_oem_pbt",
            stabilizer: "stab_lucky65_v3_screw_in",
          },
        },
        keyboardComponents,
      );

      expect(result.errors, `${plate} should fit its own kit`).toEqual([]);
    }
  });

  it("blocks a Lucky65 plate in a GMK67 build", () => {
    const result = validateBuildCompatibility(
      {
        name: "Cross-kit plate",
        componentIds: {
          case: "case_gmk67_65_plastic",
          pcb: "pcb_gmk67_65_hotswap",
          plate: "plate_lucky65_v3_65_brass",
          switch: "switch_gateron_milky_yellow_pro",
          keycap: "keycap_unknown_pudding_oem_pbt",
          stabilizer: "stab_gmk67_plate_mount",
        },
      },
      keyboardComponents,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.map((error) => error.code)).toContain(
      "kit_structural_mismatch",
    );
  });
});

describe("plate material character", () => {
  it("annotates the chosen plate without affecting validity", () => {
    const result = validateBuildCompatibility(
      gh60Build({ plate: "plate_gh60_steel" }),
      keyboardComponents,
    );

    const annotation = result.issues.find(
      (issue) => issue.code === "plate_material_character",
    );

    expect(annotation?.severity).toBe("info");
    expect(annotation?.message).toContain("Steel");
    // An info annotation must never change the verdict or leak into errors.
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("describes stock kit plates too, so a swap reads as a change", () => {
    const stock = validateBuildCompatibility(
      {
        name: "GMK61 stock",
        componentIds: {
          case: "case_gmk61_60_abs",
          pcb: "pcb_gmk61_60_hotswap",
          plate: "plate_gmk61_60_pc",
          switch: "switch_gateron_milky_yellow_pro",
          keycap: "keycap_unknown_pudding_oem_pbt",
          stabilizer: "stab_gmk61_plate_mount",
        },
      },
      keyboardComponents,
    );

    const stockNote = stock.issues.find(
      (issue) => issue.code === "plate_material_character",
    );
    const steelNote = validateBuildCompatibility(
      gh60Build({ plate: "plate_gh60_steel" }),
      keyboardComponents,
    ).issues.find((issue) => issue.code === "plate_material_character");

    expect(stockNote?.message).toContain("Polycarbonate");
    expect(steelNote?.message).not.toEqual(stockNote?.message);
  });
});

describe("option conflicts (picker gating)", () => {
  it("rejects plate-mount stabilizers against a PCB that doesn't support them", () => {
    // The GH60 hall-effect PCB supports pcb_mount and screw_in only. The
    // configurator was offering all five stabilizers regardless.
    const selected = { pcb: "pcb_gh60_hall_effect_magnetic" };

    const plateMount = getOptionConflicts(
      "stabilizer",
      "stab_sp_star_plate_mount",
      selected,
      keyboardComponents,
    );
    const screwIn = getOptionConflicts(
      "stabilizer",
      "stab_c3_equalz_v3_screw_in",
      selected,
      keyboardComponents,
    );

    expect(plateMount.map((issue) => issue.code)).toContain(
      "stabilizer_pcb_type_mismatch",
    );
    expect(screwIn).toEqual([]);
  });

  it("treats an empty selection as unconstrained", () => {
    // Nothing chosen yet means nothing to conflict with — missing_* errors
    // carry no component ids, so they must not leak in and disable everything.
    for (const id of [
      "stab_sp_star_plate_mount",
      "stab_c3_equalz_v3_screw_in",
      "stab_tx_ap_clip_in_pcb_mount",
    ]) {
      expect(getOptionConflicts("stabilizer", id, {}, keyboardComponents)).toEqual(
        [],
      );
    }
  });

  it("blocks a cross-kit plate but allows the kit's own alternates", () => {
    const selected = {
      case: "case_lucky65_v3_65_aluminum",
      pcb: "pcb_lucky65_v3_65_hotswap",
    };

    expect(
      getOptionConflicts(
        "plate",
        "plate_gmk67_65_brass",
        selected,
        keyboardComponents,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      getOptionConflicts(
        "plate",
        "plate_lucky65_v3_65_brass",
        selected,
        keyboardComponents,
      ),
    ).toEqual([]);
  });

  it("blocks mechanical switches once the hall-effect PCB is chosen", () => {
    const selected = { pcb: "pcb_gh60_hall_effect_magnetic" };

    expect(
      getOptionConflicts(
        "switch",
        "switch_gateron_oil_king",
        selected,
        keyboardComponents,
      ).map((issue) => issue.code),
    ).toContain("switch_pcb_technology_mismatch");
    expect(
      getOptionConflicts(
        "switch",
        "switch_gateron_ks37b_magnetic_jade",
        selected,
        keyboardComponents,
      ),
    ).toEqual([]);
  });
});

describe("catalog provenance", () => {
  it("marks every estimated price as an estimate, never as an observed one", () => {
    const estimated = keyboardComponents.filter(
      (component) => component.metadata?.sourceType === "modelled_estimate",
    );

    expect(estimated.length).toBeGreaterThan(0);

    for (const component of estimated) {
      expect(component.metadata?.priceBasis).toBe("estimated");
      // Estimated records must not carry vendor provenance fields, so they can
      // never be mistaken for the MKB/KeebsProject observed listings.
      expect(component.metadata?.observedPrice).toBeUndefined();
      expect(component.vendorUrl).toBeUndefined();
    }
  });
});
