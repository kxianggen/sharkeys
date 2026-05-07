export type BuildComponentSlot =
  | "case"
  | "pcb"
  | "plate"
  | "switches"
  | "keycaps"
  | "stabilizers";

export type CompatibilitySeverity = "error" | "warning" | "info";

export type KeyboardComponentRef = {
  id: string;
  slot: BuildComponentSlot;
  name?: string;
};

export type KeyboardBuildDraft = {
  name?: string;
  components: Partial<Record<BuildComponentSlot, KeyboardComponentRef>>;
};

export type CompatibilityIssue = {
  code: string;
  message: string;
  severity: CompatibilitySeverity;
  slot?: BuildComponentSlot;
};

export type CompatibilityResult = {
  isValid: boolean;
  issues: CompatibilityIssue[];
};
