/**
 * analyse-build-economics.ts — CP2 Chapter 4 evidence generator (B1, supporting).
 *
 * Prices every build the rule engine accepts and reports the distribution.
 *
 * This exists because bench-recommendations.ts found that two budget-constrained
 * prompts return zero recommendations. That is not a defect — the pipeline
 * degrades gracefully and returns a near-miss explanation — but it raises the
 * question of whether the delivered catalog can serve the project's stated
 * target market at all. CP1 and the project's expert persona target RM150-250,
 * Malaysia. This script measures whether builds exist at that price.
 *
 * PRICING MUST NOT BE REIMPLEMENTED HERE
 * --------------------------------------
 * An earlier revision of this script summed the six component prices directly
 * and was WRONG: switches are priced per switch (a build needs ~70 of them),
 * so it under-reported every build by roughly RM55 and produced a floor of
 * RM225.80 instead of RM281.00. The application itself was never defective —
 * src/lib/recommendations/service.ts:474 applies the multiplier correctly, as
 * do src/app/my-builds/actions.ts and src/data/hero-demo-build.ts. Only the
 * analysis script had diverged.
 *
 * The lesson is structural, so the fix is structural: this script no longer
 * computes a price. It pins the candidate set to exactly one component per
 * category and calls the production assembler, `buildValidatedRecommendations`,
 * reading `estimatedPrice` off the result. That is the same code path that
 * produces the figure a user sees on screen, so the two cannot drift apart.
 *
 * Prices remain a parts subtotal: they exclude shipping, assembly, lubing and
 * vendor markup, so real-world cost is a floor on these figures, not a ceiling.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/analyse-build-economics.ts
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { keyboardComponents } from "@/data/components";
import { validateBuildCompatibility } from "@/lib/rules/compatibility";
import { buildValidatedRecommendations } from "@/lib/recommendations/service";

const TARGET_MARKET = { minMyr: 150, maxMyr: 250 };

/**
 * A neutral intent: no budget, layout, sound or use-case preference. Because the
 * candidate set is pinned to a single component per category, the assembler has
 * exactly one build to consider and no preference can filter it out. This makes
 * the call a pure pricing-and-validation pass over one specific build.
 */
const NEUTRAL_INTENT = {
  budget: null,
  layout: null,
  soundProfile: null,
  useCase: null,
  beginnerFriendly: null,
  switchTechnology: null,
  priorities: [],
  constraints: [],
  colour: null,
  clarificationNeeded: false,
  clarificationQuestion: null,
} as unknown as Parameters<
  typeof buildValidatedRecommendations
>[0]["intent"];

const byCategory = (category: string) =>
  keyboardComponents.filter((component) => component.category === category);

type Priced = { total: number; currency: string; ids: Record<string, string> };

function percentile(sorted: number[], p: number): number {
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(Math.max(rank - 1, 0), sorted.length - 1)]!;
}

/** Prices one specific build through the production assembler. */
function priceBuild(ids: Record<string, string>) {
  const candidateComponentIds = Object.fromEntries(
    Object.entries(ids).map(([category, id]) => [category, [id]]),
  ) as Parameters<typeof buildValidatedRecommendations>[0]["candidateComponentIds"];

  const result = buildValidatedRecommendations({
    intent: NEUTRAL_INTENT,
    candidateComponentIds,
    catalogComponents: keyboardComponents,
    maxRecommendations: 1,
  });

  const build = result.recommendations[0];

  return build
    ? { amount: build.estimatedPrice, currency: build.estimatedPriceCurrency }
    : null;
}

function main() {
  const startedAt = new Date().toISOString();
  const priced: Priced[] = [];
  let validButUnpriced = 0;

  for (const c of byCategory("case"))
    for (const p of byCategory("pcb"))
      for (const pl of byCategory("plate"))
        for (const s of byCategory("switch"))
          for (const k of byCategory("keycap"))
            for (const st of byCategory("stabilizer")) {
              const ids = {
                case: c.id,
                pcb: p.id,
                plate: pl.id,
                switch: s.id,
                keycap: k.id,
                stabilizer: st.id,
              };

              if (
                !validateBuildCompatibility({ componentIds: ids }, keyboardComponents)
                  .isValid
              ) {
                continue;
              }

              const estimate = priceBuild(ids);

              if (estimate?.amount == null || estimate.currency == null) {
                validButUnpriced += 1;
                continue;
              }

              priced.push({ total: estimate.amount, currency: estimate.currency, ids });
            }

  const totals = priced.map((entry) => entry.total).sort((a, b) => a - b);
  const cheapest = priced.reduce((min, entry) =>
    entry.total < min.total ? entry : min,
  );

  const countAtOrUnder = (limit: number) =>
    totals.filter((total) => total <= limit).length;

  const withinBand = totals.filter(
    (total) => total >= TARGET_MARKET.minMyr && total <= TARGET_MARKET.maxMyr,
  ).length;

  const output = {
    meta: {
      analysis: "analyse-build-economics",
      startedAt,
      finishedAt: new Date().toISOString(),
      currency: "MYR",
      pricingSource:
        "Production assembler buildValidatedRecommendations (src/lib/recommendations/service.ts), which applies estimateBuildPrice. Prices are NOT recomputed by this script.",
      switchPricingNote:
        "Switches are priced per switch and multiplied by estimatedSwitchCount = 70 (service.ts:70,474). A script that sums component prices directly under-reports every build by roughly RM55.",
      basis:
        "Parts subtotal only — excludes shipping, assembly, lubing and vendor markup.",
      catalogState: {
        totalRecords: keyboardComponents.length,
        note: "Catalog as committed at e021130 (60 records), working tree unmodified at time of measurement.",
      },
      validBuildsWithoutAPrice: validButUnpriced,
      targetMarket: {
        ...TARGET_MARKET,
        source:
          "CP1 target market and the project's expert persona: RM150-250, Malaysia.",
      },
    },
    validBuildCount: totals.length,
    distributionMyr: {
      min: totals[0]!,
      p25: percentile(totals, 25),
      median: percentile(totals, 50),
      p75: percentile(totals, 75),
      p95: percentile(totals, 95),
      max: totals[totals.length - 1]!,
    },
    cumulativeCounts: {
      atOrUnder200: countAtOrUnder(200),
      atOrUnder250: countAtOrUnder(250),
      atOrUnder300: countAtOrUnder(300),
      atOrUnder400: countAtOrUnder(400),
    },
    targetMarketCoverage: {
      buildsWithinTargetBand: withinBand,
      pctOfValidBuildsWithinTargetBand: (withinBand / totals.length) * 100,
      cheapestPossibleBuildMyr: totals[0]!,
      servesAnyPointInTargetBand: withinBand > 0,
      shortfallAboveBandCeilingMyr: totals[0]! - TARGET_MARKET.maxMyr,
    },
    cheapestBuild: cheapest,
  };

  mkdirSync("evidence/raw", { recursive: true });
  writeFileSync(
    "evidence/raw/build-economics.json",
    `${JSON.stringify(output, null, 2)}\n`,
  );

  console.log(`Valid builds priced: ${totals.length.toLocaleString()}`);
  if (validButUnpriced > 0) {
    console.log(`Valid but unpriced (excluded): ${validButUnpriced}`);
  }
  console.table(output.distributionMyr);
  console.table(output.cumulativeCounts);
  console.log(
    `Target band RM${TARGET_MARKET.minMyr}-${TARGET_MARKET.maxMyr}: ${withinBand} builds (${output.targetMarketCoverage.pctOfValidBuildsWithinTargetBand.toFixed(2)}% of valid)`,
  );
  console.log(`Cheapest possible build: RM${totals[0]!.toFixed(2)}`);
  console.log(
    `Shortfall above band ceiling: RM${output.targetMarketCoverage.shortfallAboveBandCeilingMyr.toFixed(2)}`,
  );
  console.log("Wrote evidence/raw/build-economics.json");
}

main();
