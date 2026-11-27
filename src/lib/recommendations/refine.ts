/**
 * Refine chips (v2 WS4): one-click nudges under a result card.
 *
 * Each chip is a pure, deterministic edit of the structured intent the result
 * was built from. The edited intent is sent to /api/recommendations/refine,
 * which re-runs the same matcher and rule engine with no AI call. So a chip
 * is fast, free and predictable: the same build plus the same chip always
 * gives the same request.
 *
 * Pure module (types and zod enums only): imported by the configurator UI,
 * the refine route's tests and the WS0 simulator.
 */
import type { ExtractedKeyboardIntent } from "@/lib/ai/intent-schema";
import { getComponentColours } from "@/lib/components/colour";
import {
  componentColourSchema,
  type ComponentColour,
  type KeyboardComponent,
  type KeyboardLayout,
} from "@/lib/types/keyboard";

import type { ValidatedRecommendationBuild } from "./schemas";

export const refineChips = [
  "quieter",
  "cheaper",
  "premium",
  "colour",
  "wireless",
  "smaller",
] as const;

export type RefineChip = (typeof refineChips)[number];

export const refineChipLabels: Record<RefineChip, string> = {
  quieter: "Quieter",
  cheaper: "Cheaper",
  premium: "More premium",
  colour: "Different colour",
  wireless: "Wireless",
  smaller: "Smaller",
};

// "Cheaper" caps the budget at 80% of the build's price; "More premium" lifts
// the ceiling to 150%. Rounded to whole ringgit so the request stays readable.
const CHEAPER_FACTOR = 0.8;
const PREMIUM_FACTOR = 1.5;

// Smaller means fewer keys: each layout steps down to the next compact one.
const smallerLayout: Record<KeyboardLayout, KeyboardLayout | null> = {
  full: "tkl",
  tkl: "75",
  "75": "65",
  "65": "60",
  "60": null,
};

type BaseBuild = Pick<
  ValidatedRecommendationBuild,
  "components" | "estimatedPrice"
>;

function withPriority(
  intent: ExtractedKeyboardIntent,
  priority: ExtractedKeyboardIntent["priorities"][number],
): ExtractedKeyboardIntent["priorities"] {
  return intent.priorities.includes(priority)
    ? intent.priorities
    : [...intent.priorities, priority];
}

/**
 * Returns the edited intent for a chip, or null when the chip cannot change
 * anything for this build (the UI shows it disabled). The base build is the
 * card the chip sits under: its price, layout and colours anchor the edit.
 */
export function applyRefineChip(
  intent: ExtractedKeyboardIntent,
  chip: RefineChip,
  base: BaseBuild,
  // Colours that at least one catalogue keycap is tagged with. "Different
  // colour" only offers these, so it never asks for a colour nobody stocks.
  availableKeycapColours: readonly ComponentColour[] = componentColourSchema.options,
): ExtractedKeyboardIntent | null {
  // A chip answers the user directly, so any pending clarification is moot.
  const edited = {
    ...intent,
    clarificationNeeded: false,
    clarificationQuestion: null,
  };

  switch (chip) {
    case "quieter": {
      if (base.components.switch.soundProfile === "silent") {
        return null;
      }

      return {
        ...edited,
        soundProfile: "silent",
        priorities: withPriority(intent, "sound"),
      };
    }
    case "cheaper":
    case "premium": {
      if (base.estimatedPrice === null) {
        return null;
      }

      const factor = chip === "cheaper" ? CHEAPER_FACTOR : PREMIUM_FACTOR;

      return {
        ...edited,
        budget: {
          amount: Math.round(base.estimatedPrice * factor),
          currency: "MYR",
          label: chip === "cheaper" ? "budget" : "premium",
        },
        priorities: withPriority(intent, chip === "cheaper" ? "budget" : "feel"),
      };
    }
    case "colour": {
      const current = new Set<ComponentColour>([
        ...getComponentColours(base.components.keycap),
        ...(intent.colour ?? []),
      ]);
      // Fixed catalogue order, so the same build always gets the same colour.
      const next = componentColourSchema.options.find(
        (colour) =>
          availableKeycapColours.includes(colour) &&
          !current.has(colour) &&
          colour !== "multi",
      );

      if (!next) {
        return null;
      }

      return {
        ...edited,
        colour: [next],
        priorities: withPriority(intent, "aesthetics"),
      };
    }
    case "wireless": {
      const connection = base.components.pcb.connection;

      if (connection === "wireless" || connection === "both") {
        return null;
      }

      return { ...edited, priorities: withPriority(intent, "wireless") };
    }
    case "smaller": {
      const layout = intent.layout ?? base.components.case.layouts[0];
      const next = layout ? smallerLayout[layout] : null;

      if (!next) {
        return null;
      }

      return { ...edited, layout: next };
    }
  }
}

/** Every colour that at least one keycap in the catalogue is tagged with. */
export function getKeycapColours(
  catalog: readonly KeyboardComponent[],
): ComponentColour[] {
  const colours = new Set<ComponentColour>();

  for (const component of catalog) {
    if (component.category === "keycap") {
      for (const colour of getComponentColours(component)) colours.add(colour);
    }
  }

  return componentColourSchema.options.filter((colour) => colours.has(colour));
}

const changeCategories = ["switch", "keycap", "case"] as const;

function formatRinggit(amount: number) {
  return `RM${Math.round(Math.abs(amount))}`;
}

/**
 * One line saying what a refine changed, e.g. "switched to Gateron Silent,
 * −RM40". Compares the card the chip was clicked on with the new top build.
 */
export function describeBuildChange(
  before: BaseBuild,
  after: BaseBuild | null,
): string {
  if (!after) {
    return "No validated build matches that change — kept your build.";
  }

  const parts: string[] = [];
  const switchedTo = changeCategories
    .filter((category) => category !== "case")
    .filter(
      (category) => before.components[category].id !== after.components[category].id,
    )
    .map((category) => after.components[category].name);

  if (switchedTo.length > 0) {
    parts.push(`switched to ${switchedTo.join(" and ")}`);
  }

  if (before.components.case.id !== after.components.case.id) {
    parts.push(`moved to the ${after.components.case.name}`);
  }

  if (before.estimatedPrice !== null && after.estimatedPrice !== null) {
    const difference = after.estimatedPrice - before.estimatedPrice;

    if (Math.round(difference) !== 0) {
      parts.push(`${difference < 0 ? "−" : "+"}${formatRinggit(difference)}`);
    }
  }

  if (parts.length === 0) {
    return "Already the best match for that — no change.";
  }

  const sentence = parts.join(", ");

  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
