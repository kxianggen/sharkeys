import type {
  BuildComponentSlot,
  CompatibilityIssue,
  CompatibilityResult,
  KeyboardBuildDraft,
} from "@/lib/types";

export const requiredBuildSlots = [
  "case",
  "pcb",
  "plate",
  "switches",
  "keycaps",
  "stabilizers",
] as const satisfies readonly BuildComponentSlot[];

const slotLabels: Record<BuildComponentSlot, string> = {
  case: "case",
  pcb: "PCB",
  plate: "plate",
  switches: "switches",
  keycaps: "keycaps",
  stabilizers: "stabilizers",
};

export function validateBuildCompatibility(
  build: KeyboardBuildDraft,
): CompatibilityResult {
  const issues: CompatibilityIssue[] = [];

  for (const slot of requiredBuildSlots) {
    if (!build.components[slot]) {
      issues.push({
        code: `missing_${slot}`,
        message: `Select ${slotLabels[slot]} before validating compatibility.`,
        severity: "error",
        slot,
      });
    }
  }

  return {
    isValid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}
