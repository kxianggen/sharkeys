/**
 * sweep-selectivity.ts — CP2 Chapter 4 evidence generator (B1 / reliability).
 *
 * Exhaustively evaluates every possible component combination in the seed
 * catalog and counts how many the rule engine accepts, reporting the result as
 * a cascade showing how much each rule layer prunes.
 *
 * WHY THIS AND NOT A "LOGIC INTEGRITY" SWEEP
 * -------------------------------------------
 * The obvious test — "sweep all combinations and confirm no incompatible pair
 * is accepted" — is circular. It uses the validator to decide what counts as
 * incompatible and then confirms the validator agrees with itself, returning
 * 100% by construction. This script measures something the validator cannot
 * trivially satisfy: the SIZE OF THE SURVIVING DECISION SPACE. That converts
 * the CP1 claim that the system reduces choice overload from an assertion into
 * a measured reduction.
 *
 * The kit-integrity layer is reported SEPARATELY from the physical layers. It
 * prunes for a commercial reason — kit-derived case/PCB/plate/stabilizer parts
 * are not sold separately, so they must share a kitId — not a physical one. A
 * combination it rejects is not electrically or mechanically impossible; it is
 * merely unpurchasable as separate parts. Conflating the two would overstate
 * how much of the pruning is physics.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/sweep-selectivity.ts
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { keyboardComponents } from "@/data/components";
import { validateBuildCompatibility } from "@/lib/rules/compatibility";

// ---------------------------------------------------------------------------
// Rule layers, keyed on the error codes emitted by src/lib/rules/compatibility.ts
// ---------------------------------------------------------------------------

const LAYOUT_CODES = [
  "case_pcb_plate_layout_mismatch",
  "case_pcb_layout_mismatch",
  "plate_pcb_layout_mismatch",
  "plate_case_layout_mismatch",
] as const;

const MOUNT_CODES = ["case_pcb_mount_mismatch", "case_plate_mount_mismatch"] as const;

const KIT_CODES = ["kit_structural_mismatch"] as const;

const FITMENT_CODES = [
  "switch_pcb_technology_mismatch",
  "switch_plate_technology_mismatch",
  "switch_keycap_technology_mismatch",
  "keycap_layout_mismatch",
  "keycap_preferred_layout_mismatch",
  "stabilizer_pcb_type_mismatch",
  "stabilizer_layout_requirements_mismatch",
] as const;

const layoutSet = new Set<string>(LAYOUT_CODES);
const mountSet = new Set<string>(MOUNT_CODES);
const kitSet = new Set<string>(KIT_CODES);
const fitmentSet = new Set<string>(FITMENT_CODES);

/**
 * Rule groups for the INDEPENDENT rejection view.
 *
 * The sequential cascade above is an ordering imposed by this script for
 * analysis; the engine performs no such sequence and never short-circuits
 * (compatibility.ts lines 64-71 call every validator unconditionally). Applied
 * first, layout therefore absorbs every rejection it shares with mount and kit,
 * and a different ordering would redistribute the attribution.
 *
 * This second view avoids that: each rule is applied ALONE against the full
 * combination space. The independent rates will sum to well over 100%, and the
 * gap between that sum and the combined rejection rate is the overlap.
 */
const INDEPENDENT_RULE_GROUPS: ReadonlyArray<{
  rule: string;
  codes: readonly string[];
}> = [
  { rule: "Layout compatibility", codes: LAYOUT_CODES },
  { rule: "Mount compatibility", codes: MOUNT_CODES },
  { rule: "Kit structural integrity", codes: KIT_CODES },
  {
    rule: "Switch compatibility",
    codes: [
      "switch_pcb_technology_mismatch",
      "switch_plate_technology_mismatch",
      "switch_keycap_technology_mismatch",
    ],
  },
  {
    rule: "Keycap compatibility",
    codes: ["keycap_layout_mismatch", "keycap_preferred_layout_mismatch"],
  },
  {
    rule: "Stabilizer compatibility",
    codes: [
      "stabilizer_pcb_type_mismatch",
      "stabilizer_layout_requirements_mismatch",
    ],
  },
];

const independentRuleSets = INDEPENDENT_RULE_GROUPS.map((group) => ({
  rule: group.rule,
  codes: group.codes,
  set: new Set<string>(group.codes),
  rejects: 0,
}));

const byCategory = (category: string) =>
  keyboardComponents.filter((component) => component.category === category);

const cases = byCategory("case");
const pcbs = byCategory("pcb");
const plates = byCategory("plate");
const switches = byCategory("switch");
const keycaps = byCategory("keycap");
const stabilizers = byCategory("stabilizer");

function main() {
  const startedAt = new Date().toISOString();
  const startNs = process.hrtime.bigint();

  const total =
    cases.length *
    pcbs.length *
    plates.length *
    switches.length *
    keycaps.length *
    stabilizers.length;

  let survivingLayout = 0;
  let survivingLayoutMount = 0;
  let survivingLayoutMountKit = 0;
  let accepted = 0;

  // Counterfactual: all PHYSICAL rules applied, kit integrity ignored.
  let survivingPhysicalOnly = 0;

  const codeFrequency = new Map<string, number>();
  const acceptedExamples: Record<string, string>[] = [];

  for (const keyboardCase of cases)
    for (const pcb of pcbs)
      for (const plate of plates)
        for (const switchComponent of switches)
          for (const keycap of keycaps)
            for (const stabilizer of stabilizers) {
              const componentIds = {
                case: keyboardCase.id,
                pcb: pcb.id,
                plate: plate.id,
                switch: switchComponent.id,
                keycap: keycap.id,
                stabilizer: stabilizer.id,
              };

              const result = validateBuildCompatibility(
                { componentIds },
                keyboardComponents,
              );

              const codes = result.errors.map((error) => error.code);
              for (const code of codes) {
                codeFrequency.set(code, (codeFrequency.get(code) ?? 0) + 1);
              }

              const hasLayout = codes.some((code) => layoutSet.has(code));
              const hasMount = codes.some((code) => mountSet.has(code));
              const hasKit = codes.some((code) => kitSet.has(code));
              const hasFitment = codes.some((code) => fitmentSet.has(code));

              for (const group of independentRuleSets) {
                if (codes.some((code) => group.set.has(code))) group.rejects += 1;
              }

              if (!hasLayout) survivingLayout += 1;
              if (!hasLayout && !hasMount) survivingLayoutMount += 1;
              if (!hasLayout && !hasMount && !hasKit) survivingLayoutMountKit += 1;
              if (!hasLayout && !hasMount && !hasFitment) survivingPhysicalOnly += 1;

              if (result.isValid) {
                accepted += 1;
                if (acceptedExamples.length < 10) acceptedExamples.push(componentIds);
              }
            }

  const elapsedMs = Number(process.hrtime.bigint() - startNs) / 1_000_000;

  const pct = (value: number) => (value / total) * 100;

  const cascade = [
    { layer: "All possible combinations", surviving: total, pctOfTotal: 100 },
    {
      layer: "After layout compatibility",
      surviving: survivingLayout,
      pctOfTotal: pct(survivingLayout),
    },
    {
      layer: "After mount compatibility",
      surviving: survivingLayoutMount,
      pctOfTotal: pct(survivingLayoutMount),
    },
    {
      layer: "After kit structural integrity",
      surviving: survivingLayoutMountKit,
      pctOfTotal: pct(survivingLayoutMountKit),
    },
    {
      layer: "After switch / keycap / stabilizer fitment",
      surviving: accepted,
      pctOfTotal: pct(accepted),
    },
  ];

  const independentRejection = independentRuleSets.map((group) => ({
    rule: group.rule,
    codes: [...group.codes],
    rejects: group.rejects,
    pctOfTotal: pct(group.rejects),
  }));

  const independentSum = independentRejection.reduce(
    (sum, group) => sum + group.rejects,
    0,
  );
  const combinedRejected = total - accepted;

  const output = {
    meta: {
      benchmark: "sweep-selectivity",
      startedAt,
      finishedAt: new Date().toISOString(),
      nodeVersion: process.version,
      platform: `${process.platform}/${process.arch}`,
      elapsedMs,
      exhaustive: true,
      samplingMethod: "none — every combination evaluated",
      catalog: {
        totalRecords: keyboardComponents.length,
        byCategory: {
          case: cases.length,
          pcb: pcbs.length,
          plate: plates.length,
          switch: switches.length,
          keycap: keycaps.length,
          stabilizer: stabilizers.length,
        },
      },
      combinationSpace: total,
      note: "Catalog as committed at e021130 (60 records); working tree unmodified at measurement time. 5 keycap records already carry metadata.swatch. The combination space is a function of catalog composition and will change if categories gain or lose records.",
    },
    cascade,
    cascadeNote:
      "ANALYTICAL ORDERING, not engine behaviour. The engine does not short-circuit; every validator runs on every call. Applied first, layout absorbs rejections it shares with mount and kit. See independentRejection for an order-free view.",
    independentRejection,
    overlap: {
      description:
        "Each rule applied alone against the full space. The sum exceeds the combined rejection count because a single combination is commonly rejected by several rules at once; the difference is the overlap.",
      sumOfIndependentRejections: independentSum,
      combinedRejected,
      overlapCount: independentSum - combinedRejected,
      sumPctOfTotal: pct(independentSum),
      combinedRejectedPctOfTotal: pct(combinedRejected),
    },
    accepted: { count: accepted, pctOfTotal: pct(accepted) },
    kitIntegrityIsolation: {
      description:
        "Physical rules only (layout, mount, switch/keycap/stabilizer fitment), kit integrity NOT applied.",
      survivingPhysicalOnly,
      pctOfTotal: pct(survivingPhysicalOnly),
      prunedByKitIntegrityAlone: survivingPhysicalOnly - accepted,
      pctPrunedByKitIntegrityAlone: pct(survivingPhysicalOnly - accepted),
    },
    errorCodeFrequency: Object.fromEntries(
      [...codeFrequency.entries()].sort((a, b) => b[1] - a[1]),
    ),
    acceptedExamples,
  };

  mkdirSync("report/evidence/raw", { recursive: true });
  writeFileSync(
    "report/evidence/raw/sweep-selectivity.json",
    `${JSON.stringify(output, null, 2)}\n`,
  );

  console.log(`Combination space: ${total.toLocaleString()}`);
  console.log(`Swept in ${(elapsedMs / 1000).toFixed(1)}s\n`);
  console.table(
    cascade.map((row) => ({
      "Rule layer": row.layer,
      Surviving: row.surviving.toLocaleString(),
      "% of total": `${row.pctOfTotal.toFixed(4)}%`,
    })),
  );
  console.log("\nIndependent rejection rate (each rule applied ALONE):");
  console.table(
    independentRejection.map((group) => ({
      "Rule (applied alone)": group.rule,
      Rejects: group.rejects.toLocaleString(),
      "% of 585,200": `${group.pctOfTotal.toFixed(4)}%`,
    })),
  );
  console.log(
    `Sum of independent rejections: ${independentSum.toLocaleString()} (${pct(independentSum).toFixed(2)}% of total)`,
  );
  console.log(
    `Combined rejected (engine):    ${combinedRejected.toLocaleString()} (${pct(combinedRejected).toFixed(4)}% of total)`,
  );
  console.log(
    `Overlap:                       ${(independentSum - combinedRejected).toLocaleString()}\n`,
  );

  console.log(
    `Physical rules only (kit integrity ignored): ${survivingPhysicalOnly.toLocaleString()} (${pct(survivingPhysicalOnly).toFixed(4)}%)`,
  );
  console.log(
    `Pruned by kit integrity alone: ${(survivingPhysicalOnly - accepted).toLocaleString()}`,
  );
  console.log("\nError code frequency:");
  console.table(output.errorCodeFrequency);
  console.log("Wrote report/evidence/raw/sweep-selectivity.json");
}

main();
