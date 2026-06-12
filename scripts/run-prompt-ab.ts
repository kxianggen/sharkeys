/**
 * Prompt A/B harness (Phase 5, Workstream C).
 *
 * Runs each intent system-prompt variant against the 30 intent-extraction eval
 * cases, N times each (to average out minor LLM nondeterminism), and declares a
 * winner by case pass-rate (decision D9). Field-level accuracy is the tie-break.
 *
 * Requires a real OPENAI_API_KEY (variants only matter with the LLM on).
 * Run: node_modules/.bin/tsx --env-file=.env.local --tsconfig tsconfig.json \
 *        scripts/run-prompt-ab.ts
 */

// Load .env.local so the API key is present (mirrors run-eval.ts).
try {
  process.loadEnvFile(".env.local");
} catch {
  // Fall through to ambient env.
}

import { extractKeyboardIntent } from "@/lib/ai";
import {
  intentPromptVariants,
  type IntentPromptVariant,
} from "@/lib/ai/prompts";
import {
  intentExtractionEvalCases,
  type IntentExtractionTestCase,
} from "@/lib/eval/intent-extraction-eval";

const RUNS = 3;
const CONCURRENCY = 6;

type FieldResult = { checked: number; correct: number };

function scoreCase(
  tc: IntentExtractionTestCase,
  actual: Awaited<ReturnType<typeof extractKeyboardIntent>>["intent"],
): { passed: boolean; field: FieldResult } {
  let checked = 0;
  let correct = 0;
  let failed = false;

  const simpleFields = ["soundProfile", "useCase", "layout"] as const;
  for (const field of simpleFields) {
    const expected = tc.expectedIntent[field];
    if (expected === undefined) continue;
    checked++;
    if (actual[field] === expected) correct++;
    else failed = true;
  }

  const expectedBudget = tc.expectedIntent.budget;
  if (expectedBudget?.amount !== undefined && expectedBudget.amount !== null) {
    checked++;
    if (actual.budget?.amount === expectedBudget.amount) correct++;
    else failed = true;
  }
  if (expectedBudget?.currency !== undefined && expectedBudget.currency !== null) {
    checked++;
    if (actual.budget?.currency === expectedBudget.currency) correct++;
    else failed = true;
  }

  return { passed: !failed, field: { checked, correct } };
}

async function runBatched<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...(await Promise.all(batch.map(fn))));
  }
  return results;
}

type VariantScore = {
  variant: IntentPromptVariant;
  passRatePerRun: number[];
  meanPassRate: number;
  fieldAccuracy: number;
};

async function scoreVariant(
  variant: IntentPromptVariant,
): Promise<VariantScore> {
  const systemPrompt = intentPromptVariants[variant];
  const total = intentExtractionEvalCases.length;
  const passRatePerRun: number[] = [];
  let totalChecked = 0;
  let totalCorrect = 0;

  for (let run = 0; run < RUNS; run++) {
    const caseResults = await runBatched(
      intentExtractionEvalCases,
      CONCURRENCY,
      async (tc) => {
        const extraction = await extractKeyboardIntent(
          { message: tc.input },
          { systemPrompt },
        );
        return scoreCase(tc, extraction.intent);
      },
    );
    const passed = caseResults.filter((r) => r.passed).length;
    passRatePerRun.push(passed / total);
    for (const r of caseResults) {
      totalChecked += r.field.checked;
      totalCorrect += r.field.correct;
    }
    process.stdout.write(
      `  ${variant} run ${run + 1}/${RUNS}: ${passed}/${total} passed\n`,
    );
  }

  return {
    variant,
    passRatePerRun,
    meanPassRate:
      passRatePerRun.reduce((a, b) => a + b, 0) / passRatePerRun.length,
    fieldAccuracy: totalChecked > 0 ? totalCorrect / totalChecked : 0,
  };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is required for the A/B harness.");
    process.exit(1);
  }

  const variants = Object.keys(intentPromptVariants) as IntentPromptVariant[];
  console.log(
    `\nPrompt A/B — ${variants.length} variants × ${RUNS} runs × ${intentExtractionEvalCases.length} cases\n`,
  );

  const scores: VariantScore[] = [];
  for (const variant of variants) {
    scores.push(await scoreVariant(variant));
  }

  console.log("\n── Results ─────────────────────────────────────────");
  console.log("variant         mean pass-rate   runs            field-acc");
  for (const s of scores) {
    const runs = s.passRatePerRun.map((r) => `${(r * 100).toFixed(0)}%`).join(" ");
    console.log(
      `${s.variant.padEnd(15)} ${(s.meanPassRate * 100).toFixed(1).padStart(6)}%        ${runs.padEnd(14)}  ${(s.fieldAccuracy * 100).toFixed(1)}%`,
    );
  }

  // Winner: highest mean pass-rate, tie-break by field accuracy.
  const winner = [...scores].sort(
    (a, b) =>
      b.meanPassRate - a.meanPassRate || b.fieldAccuracy - a.fieldAccuracy,
  )[0];

  console.log(
    `\n🏆 Winner: \x1b[1m${winner.variant}\x1b[0m — ${(winner.meanPassRate * 100).toFixed(1)}% mean pass-rate, ${(winner.fieldAccuracy * 100).toFixed(1)}% field accuracy\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
