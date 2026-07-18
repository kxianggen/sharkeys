import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data/components";
import {
  deriveKitOptions,
  isStabilizerCompatibleWithKit,
} from "@/lib/components/kits";

const catalog = keyboardComponents;

describe("deriveKitOptions (kit-locking)", () => {
  it("locks case/PCB/plate together under one kit id", () => {
    const kits = deriveKitOptions(catalog);
    const gmk67 = kits.find((kit) => kit.kitId === "gmk67");

    expect(gmk67).toBeDefined();
    // Case, PCB, and plate all come from the same kit — not free dropdowns.
    expect(gmk67?.case.id).toBe("case_gmk67_65_plastic");
    expect(gmk67?.pcb?.id).toBe("pcb_gmk67_65_hotswap");
    expect(gmk67?.plate?.id).toBe("plate_gmk67_65_pc");
  });

  it("offers the kit's included stabilizer first, then compatible aftermarket", () => {
    const kits = deriveKitOptions(catalog);
    const gmk67 = kits.find((kit) => kit.kitId === "gmk67");
    const options = gmk67?.stabilizerOptions ?? [];
    const ids = options.map((option) => option.id);

    // Included stabilizer leads and is flagged.
    expect(options[0]?.id).toBe("stab_gmk67_plate_mount");
    expect(options[0]?.included).toBe(true);

    // gmk67's PCB supports plate_mount → a plate-mount aftermarket is offered,
    // a screw-in aftermarket is not.
    expect(ids).toContain("stab_flcmmk_fulin_v3_plate_mount");
    expect(ids).not.toContain("stab_c3_equalz_v3_screw_in");

    // Never offer another kit's kit-locked stabilizer.
    expect(ids).not.toContain("stab_lucky65_v3_screw_in");
  });
});

describe("isStabilizerCompatibleWithKit (rule-engine backed)", () => {
  const gmk67 = deriveKitOptions(catalog).find((kit) => kit.kitId === "gmk67")!;

  it("accepts a stabilizer whose type the kit PCB supports", () => {
    expect(
      isStabilizerCompatibleWithKit(
        catalog,
        gmk67,
        "stab_flcmmk_fulin_v3_plate_mount",
      ),
    ).toBe(true);
  });

  it("rejects a stabilizer whose type the kit PCB does not support", () => {
    // gmk67 PCB is plate_mount only; a screw-in stabilizer is incompatible.
    expect(
      isStabilizerCompatibleWithKit(
        catalog,
        gmk67,
        "stab_c3_equalz_v3_screw_in",
      ),
    ).toBe(false);
  });
});
