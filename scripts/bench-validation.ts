/**
 * bench-validation.ts — CP2 Chapter 4 evidence generator (B1 / P1 + P1b).
 *
 * Measures the deterministic compatibility engine against CP1 §3.2.4 (Table 3.4),
 * "Performance / Logic Engine Latency: compatibility validation completes in
 * under 200ms".
 *
 * Two measurements:
 *   P1  — per-call latency across three scenarios (valid / layout-mount
 *         rejection / kit-integrity rejection) at the real catalog size.
 *   P1b — the same valid-build call re-measured against synthetic catalogs of
 *         100 / 500 / 1000 / 5000 records, to characterise how validation cost
 *         scales with catalog size.
 *
 * Method notes that matter for the write-up:
 *  - Timing uses process.hrtime.bigint() (nanosecond monotonic clock).
 *  - Every scenario is warmed up with >=200 discarded iterations so the JIT has
 *    settled and inline caches are populated before any sample is kept.
 *  - Scenario fixtures are DISCOVERED from the catalog at runtime by searching
 *    for a combination that produces the target error code, not hand-picked.
 *    The chosen component ids are written to the JSON output so the exact
 *    fixture is reproducible.
 *  - Synthetic scaling records VARY layout, mount style and switch technology.
 *    Cloning one record N times would let the engine short-circuit on identical
 *    data and produce a flattering, wrong curve.
 *
 * Adds no dependency on Supabase or OpenAI: the seed catalog is used directly.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/bench-validation.ts
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { keyboardComponents } from "@/data/components";
import { validateBuildCompatibility } from "@/lib/rules/compatibility";
import type {
  KeyboardBuildSelection,
  KeyboardComponent,
  KeyboardLayout,
  MountStyle,
  SwitchTechnology,
} from "@/lib/types";

const WARMUP_ITERATIONS = 200;
const TIMED_ITERATIONS = 1000;
const SCALING_SIZES = [100, 500, 1000, 5000] as const;

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

type Stats = {
  n: number;
  meanMs: number;
  medianMs: number;
  p95Ms: number;
  p99Ms: number;
  minMs: number;
  maxMs: number;
  stdDevMs: number;
};

/** Nearest-rank percentile on an already-sorted ascending array. */
function percentile(sortedMs: number[], p: number): number {
  const rank = Math.ceil((p / 100) * sortedMs.length);
  const index = Math.min(Math.max(rank - 1, 0), sortedMs.length - 1);
  return sortedMs[index]!;
}

function summarise(samplesMs: number[]): Stats {
  const sorted = [...samplesMs].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((sum, value) => sum + value, 0) / n;
  const variance =
    sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n;

  return {
    n,
    meanMs: mean,
    medianMs: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    p99Ms: percentile(sorted, 99),
    minMs: sorted[0]!,
    maxMs: sorted[n - 1]!,
    stdDevMs: Math.sqrt(variance),
  };
}

/** Warm up, then take TIMED_ITERATIONS individually-timed samples. */
function measure(run: () => void, timedIterations = TIMED_ITERATIONS): Stats {
  for (let i = 0; i < WARMUP_ITERATIONS; i += 1) run();

  const samplesMs: number[] = [];
  for (let i = 0; i < timedIterations; i += 1) {
    const start = process.hrtime.bigint();
    run();
    const end = process.hrtime.bigint();
    samplesMs.push(Number(end - start) / 1_000_000);
  }

  return summarise(samplesMs);
}

// ---------------------------------------------------------------------------
// Fixture discovery
// ---------------------------------------------------------------------------

const byCategory = (category: string) =>
  keyboardComponents.filter((component) => component.category === category);

const cases = byCategory("case");
const pcbs = byCategory("pcb");
const plates = byCategory("plate");
const switches = byCategory("switch");
const keycaps = byCategory("keycap");
const stabilizers = byCategory("stabilizer");

function selectionOf(
  keyboardCase: KeyboardComponent,
  pcb: KeyboardComponent,
  plate: KeyboardComponent,
  switchComponent: KeyboardComponent,
  keycap: KeyboardComponent,
  stabilizer: KeyboardComponent,
): KeyboardBuildSelection {
  return {
    componentIds: {
      case: keyboardCase.id,
      pcb: pcb.id,
      plate: plate.id,
      switch: switchComponent.id,
      keycap: keycap.id,
      stabilizer: stabilizer.id,
    },
  };
}

const LAYOUT_MOUNT_CODES = new Set([
  "case_pcb_plate_layout_mismatch",
  "case_pcb_layout_mismatch",
  "plate_pcb_layout_mismatch",
  "plate_case_layout_mismatch",
  "case_pcb_mount_mismatch",
  "case_plate_mount_mismatch",
]);

type Fixture = {
  label: string;
  selection: KeyboardBuildSelection;
  errorCodes: string[];
  isValid: boolean;
};

/**
 * Walks the full combination space in a fixed order and returns the first
 * selection satisfying `predicate`. Deterministic, so the fixture is stable
 * across runs and can be cited in the report.
 */
function findFixture(
  label: string,
  predicate: (codes: string[], isValid: boolean) => boolean,
): Fixture | undefined {
  for (const keyboardCase of cases)
    for (const pcb of pcbs)
      for (const plate of plates)
        for (const switchComponent of switches)
          for (const keycap of keycaps)
            for (const stabilizer of stabilizers) {
              const selection = selectionOf(
                keyboardCase,
                pcb,
                plate,
                switchComponent,
                keycap,
                stabilizer,
              );
              const result = validateBuildCompatibility(
                selection,
                keyboardComponents,
              );
              const codes = result.errors.map((error) => error.code);

              if (predicate(codes, result.isValid)) {
                return { label, selection, errorCodes: codes, isValid: result.isValid };
              }
            }

  return undefined;
}

// ---------------------------------------------------------------------------
// Synthetic catalogs for the scaling test
// ---------------------------------------------------------------------------

const LAYOUTS: KeyboardLayout[] = ["60", "65", "75", "tkl", "full"];
const MOUNTS: MountStyle[] = [
  "tray_mount",
  "top_mount",
  "gasket_mount",
  "o_ring_mount",
];
const SWITCH_TECHNOLOGIES: SwitchTechnology[] = [
  "mechanical",
  "optical",
  "hall_effect",
  "topre",
];

/**
 * Grows the catalog to `size` records while keeping the real fixture components
 * intact and resolvable.
 *
 * Padding records are cloned from real ones but have their layout, mount style
 * and switch technology rotated through the full enum vocabularies, so the
 * padded catalog is heterogeneous. This matters: a catalog of N identical
 * records would let array scans and `includes` checks hit on the first element
 * every time, understating the true cost of a larger catalog.
 *
 * The fixture components are appended LAST so that the id lookup for the build
 * under test has to traverse the whole padded set — a deliberately pessimistic
 * placement.
 */
function buildSyntheticCatalog(
  size: number,
  keepIds: readonly string[],
): KeyboardComponent[] {
  const kept = keyboardComponents.filter((component) =>
    keepIds.includes(component.id),
  );
  const padTarget = Math.max(size - kept.length, 0);
  const padding: KeyboardComponent[] = [];

  for (let i = 0; i < padTarget; i += 1) {
    const template = keyboardComponents[i % keyboardComponents.length]!;
    const layout = LAYOUTS[i % LAYOUTS.length]!;
    const mount = MOUNTS[i % MOUNTS.length]!;
    const technology = SWITCH_TECHNOLOGIES[i % SWITCH_TECHNOLOGIES.length]!;

    const clone = {
      ...structuredClone(template),
      id: `synthetic_${template.category}_${i}`,
      name: `${template.name} (synthetic ${i})`,
    } as Record<string, unknown>;

    // Rotate every array field the rule engine actually reads.
    if (Array.isArray(clone.layouts)) clone.layouts = [layout];
    if (Array.isArray(clone.layoutSupport)) clone.layoutSupport = [layout];
    if (Array.isArray(clone.supportedLayouts)) clone.supportedLayouts = [layout];
    if (Array.isArray(clone.caseMountSupport)) clone.caseMountSupport = [mount];
    if (Array.isArray(clone.pcbMountSupport)) clone.pcbMountSupport = [mount];
    if (Array.isArray(clone.plateMountSupport)) clone.plateMountSupport = [mount];
    if (Array.isArray(clone.switchTechnologySupport))
      clone.switchTechnologySupport = [technology];
    if (Array.isArray(clone.compatibleSwitchTechnologies))
      clone.compatibleSwitchTechnologies = [technology];
    if (typeof clone.switchTechnology === "string")
      clone.switchTechnology = technology;

    padding.push(clone as unknown as KeyboardComponent);
  }

  return [...padding, ...kept];
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

function main() {
  const startedAt = new Date().toISOString();

  const catalogByCategory = keyboardComponents.reduce<Record<string, number>>(
    (acc, component) => {
      acc[component.category] = (acc[component.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  // -- Scenario fixtures ----------------------------------------------------
  const validFixture = findFixture(
    "valid_complete_build",
    (_codes, isValid) => isValid,
  );

  const layoutMountFixture = findFixture(
    "layout_or_mount_rejection",
    (codes) =>
      codes.some((code) => LAYOUT_MOUNT_CODES.has(code)) &&
      !codes.includes("kit_structural_mismatch"),
  );

  const kitFixture = findFixture(
    "kit_integrity_rejection",
    (codes) =>
      codes.includes("kit_structural_mismatch") &&
      !codes.some((code) => LAYOUT_MOUNT_CODES.has(code)),
  );

  const scenarios = [validFixture, layoutMountFixture, kitFixture].filter(
    (fixture): fixture is Fixture => fixture !== undefined,
  );

  const missingScenarios = [
    validFixture ? null : "valid_complete_build",
    layoutMountFixture ? null : "layout_or_mount_rejection",
    kitFixture ? null : "kit_integrity_rejection",
  ].filter((label): label is string => label !== null);

  // -- P1: per-scenario latency at real catalog size ------------------------
  const scenarioResults = scenarios.map((fixture) => {
    const stats = measure(() =>
      validateBuildCompatibility(fixture.selection, keyboardComponents),
    );

    return {
      scenario: fixture.label,
      componentIds: fixture.selection.componentIds,
      isValid: fixture.isValid,
      errorCodes: fixture.errorCodes,
      catalogSize: keyboardComponents.length,
      stats,
    };
  });

  // -- P1b: scaling ---------------------------------------------------------
  const scalingBase = validFixture;
  const scalingResults = scalingBase
    ? [keyboardComponents.length, ...SCALING_SIZES].map((size) => {
        const catalog =
          size === keyboardComponents.length
            ? [...keyboardComponents]
            : buildSyntheticCatalog(
                size,
                Object.values(scalingBase.selection.componentIds).filter(
                  (id): id is string => typeof id === "string",
                ),
              );

        const stats = measure(() =>
          validateBuildCompatibility(scalingBase.selection, catalog),
        );

        return { catalogSize: catalog.length, requestedSize: size, stats };
      })
    : [];

  const output = {
    meta: {
      benchmark: "bench-validation",
      startedAt,
      finishedAt: new Date().toISOString(),
      nodeVersion: process.version,
      platform: `${process.platform}/${process.arch}`,
      environment:
        "Linux sandbox (containerised). Offline: seed catalog, no Supabase or OpenAI credentials required.",
      warmupIterations: WARMUP_ITERATIONS,
      timedIterations: TIMED_ITERATIONS,
      nfr: {
        source: "CP1 §3.2.4, Table 3.4 — Performance / Logic Engine Latency",
        requirement: "Compatibility validation completes in under 200ms",
        thresholdMs: 200,
      },
      catalog: {
        totalRecords: keyboardComponents.length,
        byCategory: catalogByCategory,
        uniqueIds: new Set(keyboardComponents.map((c) => c.id)).size,
        state:
          "Catalog as committed at e021130 (60 records), working tree unmodified at time of measurement.",
      },
      missingScenarios,
    },
    scenarios: scenarioResults,
    scaling: scalingResults,
  };

  mkdirSync("evidence/raw", { recursive: true });
  writeFileSync(
    "evidence/raw/bench-validation.json",
    `${JSON.stringify(output, null, 2)}\n`,
  );

  // -- Console summary ------------------------------------------------------
  const fmt = (value: number) => value.toFixed(4);
  console.log(`Catalog: ${keyboardComponents.length} records`, catalogByCategory);
  console.log("");
  console.log("P1 — per-scenario latency (ms)");
  console.table(
    scenarioResults.map((result) => ({
      scenario: result.scenario,
      n: result.stats.n,
      mean: fmt(result.stats.meanMs),
      median: fmt(result.stats.medianMs),
      p95: fmt(result.stats.p95Ms),
      p99: fmt(result.stats.p99Ms),
      min: fmt(result.stats.minMs),
      max: fmt(result.stats.maxMs),
      stdDev: fmt(result.stats.stdDevMs),
      verdict: result.stats.p99Ms < 200 ? "MET" : "NOT MET",
    })),
  );

  console.log("P1b — scaling (valid build, varied synthetic records)");
  console.table(
    scalingResults.map((result) => ({
      catalogSize: result.catalogSize,
      mean: fmt(result.stats.meanMs),
      median: fmt(result.stats.medianMs),
      p95: fmt(result.stats.p95Ms),
      p99: fmt(result.stats.p99Ms),
      stdDev: fmt(result.stats.stdDevMs),
    })),
  );

  if (missingScenarios.length > 0) {
    console.log(`NOT MEASURED scenarios: ${missingScenarios.join(", ")}`);
  }

  console.log("Wrote evidence/raw/bench-validation.json");
}

main();
