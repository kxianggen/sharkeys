#!/usr/bin/env tsx
/**
 * Scale check (v2 WS2, subtask 9): does recommendation speed hold up as the
 * catalogue grows? Runs the SAME workload as scripts/bench-recommendations.ts
 * (same 8 prompts, same warm-up/timed loop, deterministic mode, no network)
 * once on the frozen catalogue and once on the full one, in the same session,
 * on the same machine — so the two numbers are comparable.
 *
 * It does not touch evidence/ (the FYP measurement trail); results go to
 * scripts/catalog/bench/scale-<date>.json.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/catalog/bench-scale.ts
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WARMUP_ITERATIONS = 20;
const TIMED_ITERATIONS = 200;

/** Copied verbatim from scripts/bench-recommendations.ts so the workload is identical. */
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

function percentile(sorted: number[], p: number) {
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(Math.max(rank - 1, 0), sorted.length - 1)]!;
}

async function runOne() {
  // Deterministic mode, as in bench-recommendations.ts: removed before the
  // app modules read them.
  delete process.env.OPENAI_API_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  const { keyboardComponents, catalogMode } = await import("@/data");
  const { generateRecommendationsFromMessage } = await import("@/lib/recommendations/service");
  const { validateBuildSelectionFromIds } = await import("@/lib/components/repository");

  const counts: Record<string, number> = {};
  for (const c of keyboardComponents) counts[c.category] = (counts[c.category] ?? 0) + 1;
  const rawCombinations = ["case", "pcb", "plate", "switch", "keycap", "stabilizer"].reduce((n, k) => n * (counts[k] ?? 0), 1);

  let builds = 0;
  let allValid = true;
  const returned: number[] = [];
  for (const prompt of PROMPTS) {
    const result = await generateRecommendationsFromMessage({ message: prompt });
    const recs = result.recommendations ?? [];
    returned.push(recs.length);
    for (const build of recs) {
      builds++;
      const v = validateBuildSelectionFromIds({ componentIds: build.componentIds as Record<string, string> }, keyboardComponents);
      if (!v.isValid) allValid = false;
    }
  }

  const rotate = (i: number) => PROMPTS[i % PROMPTS.length]!;
  for (let i = 0; i < WARMUP_ITERATIONS; i++) await generateRecommendationsFromMessage({ message: rotate(i) });
  const samples: number[] = [];
  for (let i = 0; i < TIMED_ITERATIONS; i++) {
    const start = process.hrtime.bigint();
    await generateRecommendationsFromMessage({ message: rotate(i) });
    samples.push(Number(process.hrtime.bigint() - start) / 1_000_000);
  }
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    catalogMode,
    parts: keyboardComponents.length,
    partsByCategory: counts,
    rawCombinations,
    latencyMs: {
      n: sorted.length,
      median: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      max: sorted.at(-1),
      mean: sorted.reduce((s, v) => s + v, 0) / sorted.length,
    },
    buildsReturnedPerPrompt: returned,
    buildsChecked: builds,
    allBuildsValid: allValid,
  };
}

async function main() {
  if (process.argv.includes("--child")) {
    console.log(JSON.stringify(await runOne()));
    return;
  }
  // Each catalogue in its own child process: the catalogue mode is chosen when
  // the data module loads, and a fresh process keeps the two runs independent.
  const results = ["frozen", "full"].map((mode) => {
    const run = spawnSync("npx", ["tsx", "--tsconfig", "tsconfig.json", "scripts/catalog/bench-scale.ts", "--child"], {
      env: { ...process.env, SHARKEYS_CATALOG: mode },
      encoding: "utf8",
      shell: true,
      maxBuffer: 10 * 1024 * 1024,
    });
    const line = run.stdout.trim().split(/\r?\n/).filter((l) => l.startsWith("{")).at(-1);
    if (!line) throw new Error(`run for ${mode} failed:\n${run.stderr}`);
    return JSON.parse(line) as Awaited<ReturnType<typeof runOne>>;
  });

  const out = {
    meta: {
      benchmark: "catalog bench-scale",
      at: new Date().toISOString(),
      node: process.version,
      platform: `${process.platform}/${process.arch}`,
      workload: "scripts/bench-recommendations.ts prompts, 20 warm-up + 200 timed calls, deterministic mode, no network",
    },
    results,
  };
  const dir = join("scripts", "catalog", "bench");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `scale-${out.meta.at.slice(0, 10)}.json`);
  writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`);
  console.table(
    results.map((r) => ({
      catalogue: r.catalogMode,
      parts: r.parts,
      combinations: r.rawCombinations.toLocaleString("en"),
      medianMs: r.latencyMs.median.toFixed(2),
      p95Ms: r.latencyMs.p95.toFixed(2),
      maxMs: r.latencyMs.max?.toFixed(2),
      builds: r.buildsChecked,
      allValid: r.allBuildsValid,
    })),
  );
  console.log(`Wrote ${path}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
