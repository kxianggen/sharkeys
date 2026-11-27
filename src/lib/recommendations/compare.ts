/**
 * Compare view (v2 WS4): pure, deterministic side-by-side of 2–3 validated
 * builds. Rows hold display values plus whether they differ; "pick this if"
 * lines come from fixed rules over catalogue fields, never generated text.
 */
import { getComponentColours } from "@/lib/components/colour";
import type { KeyboardLayout } from "@/lib/types/keyboard";

import type { ValidatedRecommendationBuild } from "./schemas";

export type ComparableBuild = Pick<
  ValidatedRecommendationBuild,
  "components" | "componentIds" | "estimatedPrice" | "estimatedPriceCurrency"
>;

export const maxComparedBuilds = 3;

export type CompareRow = {
  key: "price" | "sound" | "switch" | "layout" | "connection" | "keycaps";
  label: string;
  values: string[];
  differs: boolean;
};

const layoutOrder: KeyboardLayout[] = ["60", "65", "75", "tkl", "full"];

const connectionLabels = {
  wired: "Wired",
  wireless: "Wireless",
  both: "Wired + wireless",
} as const;

/** Stable identity for a build: its six part ids. Result ids are per-response. */
export function buildKey(build: Pick<ComparableBuild, "componentIds">) {
  const ids = build.componentIds;

  return [ids.case, ids.pcb, ids.plate, ids.switch, ids.keycap, ids.stabilizer].join(
    "|",
  );
}

function formatLayout(layout: KeyboardLayout | undefined) {
  if (!layout) return "Unknown";
  if (layout === "tkl") return "TKL";
  if (layout === "full") return "Full size";
  return `${layout}%`;
}

function formatPrice(build: ComparableBuild) {
  return build.estimatedPrice === null
    ? "Estimate unavailable"
    : `~RM ${Math.round(build.estimatedPrice)}`;
}

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function keycapSummary(build: ComparableBuild) {
  const colours = getComponentColours(build.components.keycap);

  return colours.length > 0
    ? `${build.components.keycap.name} (${colours.join(", ")})`
    : build.components.keycap.name;
}

export function compareBuilds(builds: readonly ComparableBuild[]): CompareRow[] {
  const row = (
    key: CompareRow["key"],
    label: string,
    value: (build: ComparableBuild) => string,
  ): CompareRow => {
    const values = builds.map(value);

    return { key, label, values, differs: new Set(values).size > 1 };
  };

  return [
    row("price", "Price", formatPrice),
    row("sound", "Sound", (build) =>
      capitalise(build.components.switch.soundProfile ?? "neutral"),
    ),
    row("switch", "Switch", (build) => build.components.switch.name),
    row("layout", "Layout", (build) => formatLayout(build.components.case.layouts[0])),
    row("connection", "Connection", (build) => connectionLabels[build.components.pcb.connection]),
    row("keycaps", "Keycaps", keycapSummary),
  ];
}

type PickRule = {
  // Score per build; the rule picks the single build with the best score.
  score: (build: ComparableBuild) => number | null;
  reason: (build: ComparableBuild) => string;
};

const isWireless = (build: ComparableBuild) =>
  build.components.pcb.connection !== "wired";

// Order matters: each build gets the first rule it wins outright. A rule only
// fires when exactly one build is best, so no two builds share a reason.
const pickRules: PickRule[] = [
  {
    score: (build) => (build.estimatedPrice === null ? null : -build.estimatedPrice),
    reason: () => "you want the lowest price",
  },
  {
    score: (build) => (build.components.switch.soundProfile === "silent" ? 1 : 0),
    reason: () => "you want it quiet",
  },
  {
    score: (build) => (build.components.switch.soundProfile === "thocky" ? 1 : 0),
    reason: () => "you want a deep, thocky sound",
  },
  {
    score: (build) => (isWireless(build) ? 1 : 0),
    reason: () => "you want to go wireless",
  },
  {
    score: (build) => {
      const index = layoutOrder.indexOf(build.components.case.layouts[0]);
      return index === -1 ? null : -index;
    },
    reason: (build) =>
      `you want a smaller ${formatLayout(build.components.case.layouts[0])} board`,
  },
  {
    score: (build) => build.estimatedPrice,
    reason: () => "you want the more premium parts",
  },
];

function uniqueBest(builds: readonly ComparableBuild[], rule: PickRule) {
  const scores = builds.map(rule.score);
  const valid = scores.filter((score): score is number => score !== null);

  if (valid.length < 2) return null;

  const best = Math.max(...valid);
  const winners = scores
    .map((score, index) => (score === best ? index : -1))
    .filter((index) => index !== -1);

  return winners.length === 1 ? winners[0] : null;
}

/** One "Pick this if …" line per build, in the same order as the input. */
export function pickThisIf(builds: readonly ComparableBuild[]): string[] {
  const reasons: (string | null)[] = builds.map(() => null);

  for (const rule of pickRules) {
    const winner = uniqueBest(builds, rule);

    if (winner !== null && reasons[winner] === null) {
      reasons[winner] = rule.reason(builds[winner]);
    }
  }

  return reasons.map(
    (reason, index) =>
      `Pick this if ${reason ?? `you like the ${builds[index].components.case.name}`}.`,
  );
}
