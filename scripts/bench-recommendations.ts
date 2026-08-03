/**
 * bench-recommendations.ts — CP2 Chapter 4 evidence generator (B1 / P2).
 *
 * Two measurements over the recommendation pipeline in DETERMINISTIC MODE:
 *
 *   P2a — end-to-end latency of the project's own logic. OPENAI_API_KEY and the
 *         Supabase variables are deleted from the environment before any module
 *         reads them, so intent extraction uses the local keyword fallback and
 *         the catalog resolves to seed data. This isolates the latency the
 *         project is responsible for from third-party provider latency, which
 *         is measured separately in bench-ai-latency.ts.
 *
 *   P2b — STAGE 2 OF THE CHOICE REDUCTION. sweep-selectivity.ts measures stage
 *         one: the rule engine reduces 585,200 possible combinations to the set
 *         it will accept. That surviving set is still far too large for a person
 *         to choose between, so it does not on its own evidence the CP1 choice-
 *         overload claim. This script measures what the user actually receives:
 *         how many builds /api/recommendations returns per prompt. Together the
 *         two stages complete the chain from combinatorial space to presented
 *         options.
 *
 * Both figures are a function of catalog composition. The catalog state used is
 * recorded in the JSON output.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/bench-recommendations.ts
 */

// Deleted BEFORE importing anything that reads them.
delete process.env.OPENAI_API_KEY;
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

import { writeFileSync, mkdirSync } from "node:fs";
import { keyboardComponents } from "@/data/components";
import { generateRecommendationsFromMessage } from "@/lib/recommendations/service";
import { validateBuildSelectionFromIds } from "@/lib/components/repository";

const WARMUP_ITERATIONS = 20;
const TIMED_ITERATIONS = 200;

/**
 * Representative prompts spanning the personas and price points in the CP1
 * problem statement: budget-led, sound-led, use-case-led, layout-led, and
 * deliberately vague (the novice case). Fixed list so the run is reproducible.
 */
const PROMPTS = [
  "I want a thocky keyboard under RM250 for office work",
  "creamy sounding 65% keyboard for gaming",
  "budget mechanical keyboard for a beginner",
  "quiet keyboard for a shared office under RM200",
  "I want something that sounds deep and premium",
  "75% layout, hot swappable, wireless if possible",
  "best value build for typing all day",
  "I don't really know what I want, something nice",
] as const;

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

function percentile(sortedMs: number[], p: number): number {
  const rank = Math.ceil((p / 100) * sortedMs.length);
  return sortedMs[Math.min(Math.max(rank - 1, 0), sortedMs.length - 1)]!;
}

function summarise(samplesMs: number[]): Stats {
  const sorted = [...samplesMs].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((sum, v) => sum + v, 0) / n;
  const variance = sorted.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;

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

async function main() {
  const startedAt = new Date().toISOString();

  // -- P2b: how many builds does each prompt actually return? ---------------
  const perPrompt: {
    prompt: string;
    recommendationCount: number;
    clarificationNeeded: boolean;
    clarificationPrompt: string | null;
    allBuildsValid: boolean;
    allComponentsInCatalog: boolean;
  }[] = [];

  const catalogIds = new Set(keyboardComponents.map((c) => c.id));

  for (const prompt of PROMPTS) {
    const result = await generateRecommendationsFromMessage({ message: prompt });
    const builds = result.recommendations ?? [];

    // Pipeline conformance: every emitted build must pass the rule engine, and
    // every referenced component must exist in the catalog (CP1 §3.2.4
    // Reliability / AI Accuracy).
    let allValid = true;
    let allInCatalog = true;

    for (const build of builds) {
      const ids = build.componentIds as Record<string, string>;
      const validation = validateBuildSelectionFromIds(
        { componentIds: ids },
        keyboardComponents,
      );
      if (!validation.isValid) allValid = false;
      for (const id of Object.values(ids)) {
        if (!catalogIds.has(id)) allInCatalog = false;
      }
    }

    // clarificationNeeded lives on the extracted intent, not on the result
    // envelope. Reading it off the envelope reports false for every prompt.
    const intent = (result as { intent?: { clarificationNeeded?: boolean } })
      .intent;

    perPrompt.push({
      prompt,
      recommendationCount: builds.length,
      clarificationNeeded: Boolean(intent?.clarificationNeeded),
      clarificationPrompt:
        (result as { clarificationPrompt?: string | null }).clarificationPrompt ??
        null,
      allBuildsValid: allValid,
      allComponentsInCatalog: allInCatalog,
    });
  }

  const counts = perPrompt.map((entry) => entry.recommendationCount);
  const countMean = counts.reduce((sum, v) => sum + v, 0) / counts.length;

  // -- P2a: latency --------------------------------------------------------
  const rotate = (i: number) => PROMPTS[i % PROMPTS.length]!;

  for (let i = 0; i < WARMUP_ITERATIONS; i += 1) {
    await generateRecommendationsFromMessage({ message: rotate(i) });
  }

  const samplesMs: number[] = [];
  for (let i = 0; i < TIMED_ITERATIONS; i += 1) {
    const start = process.hrtime.bigint();
    await generateRecommendationsFromMessage({ message: rotate(i) });
    samplesMs.push(Number(process.hrtime.bigint() - start) / 1_000_000);
  }

  const stats = summarise(samplesMs);

  const output = {
    meta: {
      benchmark: "bench-recommendations",
      startedAt,
      finishedAt: new Date().toISOString(),
      nodeVersion: process.version,
      platform: `${process.platform}/${process.arch}`,
      environment:
        "Linux sandbox. DETERMINISTIC MODE: OPENAI_API_KEY and Supabase vars deleted before module load, so the local keyword fallback and seed catalog are used. No network calls.",
      warmupIterations: WARMUP_ITERATIONS,
      timedIterations: TIMED_ITERATIONS,
      promptCount: PROMPTS.length,
      catalogState: {
        totalRecords: keyboardComponents.length,
        note: "Catalog as committed at e021130 (60 records), working tree unmodified at time of measurement.",
      },
    },
    latency: stats,
    stageTwoReduction: {
      description:
        "Stage 2 of the choice reduction. Stage 1 (sweep-selectivity.ts) reduces the combinatorial space to the accepted set; this is how many builds a user is actually shown.",
      perPrompt,
      meanRecommendationsReturned: countMean,
      minRecommendationsReturned: Math.min(...counts),
      maxRecommendationsReturned: Math.max(...counts),
      hardCap: 3,
      hardCapSource: "defaultMaxRecommendations, src/lib/recommendations/service.ts:69",
    },
    pipelineConformance: {
      description:
        "Non-circular integrity check: every build emitted by the recommendation service is re-validated through the rule engine, and every referenced component id is checked against the catalog. This tests the architectural guarantee that no unvalidated build can reach a user (CP1 §3.2.4 Reliability).",
      promptsChecked: perPrompt.length,
      buildsChecked: counts.reduce((sum, v) => sum + v, 0),
      allBuildsValid: perPrompt.every((entry) => entry.allBuildsValid),
      allComponentsInCatalog: perPrompt.every(
        (entry) => entry.allComponentsInCatalog,
      ),
    },
  };

  mkdirSync("evidence/raw", { recursive: true });
  writeFileSync(
    "evidence/raw/bench-recommendations.json",
    `${JSON.stringify(output, null, 2)}\n`,
  );

  const fmt = (v: number) => v.toFixed(3);
  console.log("P2a — deterministic pipeline latency (ms)");
  console.table([
    {
      n: stats.n,
      mean: fmt(stats.meanMs),
      median: fmt(stats.medianMs),
      p95: fmt(stats.p95Ms),
      p99: fmt(stats.p99Ms),
      min: fmt(stats.minMs),
      max: fmt(stats.maxMs),
      stdDev: fmt(stats.stdDevMs),
    },
  ]);

  console.log("P2b — builds returned per prompt (stage 2)");
  console.table(
    perPrompt.map((entry) => ({
      prompt: `${entry.prompt.slice(0, 44)}…`,
      returned: entry.recommendationCount,
      clarification: entry.clarificationNeeded,
      allValid: entry.allBuildsValid,
      inCatalog: entry.allComponentsInCatalog,
    })),
  );
  console.log(
    `mean returned: ${countMean.toFixed(2)}  range: ${Math.min(...counts)}-${Math.max(...counts)}  cap: 3`,
  );
  console.log(
    `Pipeline conformance: allBuildsValid=${output.pipelineConformance.allBuildsValid} allComponentsInCatalog=${output.pipelineConformance.allComponentsInCatalog} (${output.pipelineConformance.buildsChecked} builds)`,
  );
  console.log("Wrote evidence/raw/bench-recommendations.json");
}

void main();
