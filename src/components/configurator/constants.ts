import type { ComponentCategory } from "@/components/configurator/types";

export const componentCategories: ComponentCategory[] = [
  "case",
  "pcb",
  "plate",
  "switch",
  "keycap",
  "stabilizer",
];

export const categoryLabels: Record<ComponentCategory, string> = {
  case: "Case",
  pcb: "PCB",
  plate: "Plate",
  switch: "Switch",
  keycap: "Keycap",
  stabilizer: "Stabilizer",
};

// Each prompt is verified to resolve to validated, non-empty builds from the
// seed catalog via the local fallback pipeline (see repo eval expectations).
export const quickPrompts = [
  "Thocky 65% build",
  "Budget creamy build",
  "Clacky gaming keyboard",
] as const;

// Apple-style rail sections: bold label + secondary prompt, mapped onto the
// deterministic component categories.
export const configuratorSections: Array<{
  categories: ComponentCategory[];
  prompt: string;
  title: string;
}> = [
  { title: "Case", prompt: "Start with the board.", categories: ["case"] },
  {
    title: "PCB",
    prompt: "The electronics and switch support.",
    categories: ["pcb"],
  },
  {
    // Split out from the old combined "Internals" step: plate material is a
    // real acoustic choice, not an implementation detail of the PCB.
    title: "Plate",
    prompt: "The cheapest change to how it sounds.",
    categories: ["plate"],
  },
  { title: "Switches", prompt: "Pick your feel.", categories: ["switch"] },
  { title: "Keycaps", prompt: "Finish the look.", categories: ["keycap"] },
  {
    title: "Stabilizers",
    prompt: "Keep the big keys steady.",
    categories: ["stabilizer"],
  },
];

export const configuratorQuickPrompts = [
  {
    label: "Thocky",
    prompt: "A deep thocky build for coding in a quiet office",
  },
  {
    label: "Quiet office build",
    prompt: "Quiet office keyboard",
  },
  {
    label: "65% Layout",
    prompt: "Beginner friendly 65% keyboard under RM500",
  },
] as const;

export const estimatedSwitchCount = 70;
