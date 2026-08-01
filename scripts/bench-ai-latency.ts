/**
 * bench-ai-latency.ts — CP2 Chapter 4 evidence generator (B1 / P3).
 *
 * Measures TOTAL end-to-end latency of the three AI-inclusive paths:
 * intent extraction, keybot reply, and vision intent.
 *
 * WHAT THIS DOES NOT MEASURE
 * --------------------------
 * CP1 §3.2.4 specifies "AI Response Time: first text token generates in under
 * 2 seconds". That requirement is NOT EVALUABLE against this implementation.
 * Streaming was never implemented — no `stream: true`, `ReadableStream` or
 * `streamText` exists anywhere in src/ — so responses are assembled server-side
 * and returned whole. There is no first token to time.
 *
 * This script therefore measures TOTAL response latency, which is a different
 * quantity. It must not be presented as satisfying the CP1 wording.
 *
 * ENVIRONMENT MATTERS, AND MUST BE REPORTED
 * ------------------------------------------
 * These figures are dominated by network round-trip and third-party provider
 * queueing, not by project code. A number measured on a laptop in Malaysia, in
 * a container, and on a deployed host will differ substantially. The machine
 * and network are recorded in the JSON output, and any figure quoted in the
 * report must carry that context or it is unfalsifiable.
 *
 * Requires OPENAI_API_KEY in .env.local. Makes real, billable API calls.
 * If the key is absent or the API is unreachable, the affected path is recorded
 * as NOT MEASURED with the reason, and the script continues.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/bench-ai-latency.ts
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { hostname } from "node:os";
import { loadEnvFile } from "./load-env-file";

loadEnvFile();

const RUNS_PER_PATH = 20;

const INTENT_PROMPTS = [
  "I want a thocky keyboard under RM250 for office work",
  "creamy sounding 65% keyboard for gaming",
  "quiet board for a shared office",
  "something premium and deep sounding",
] as const;

const KEYBOT_PROMPTS = [
  "What is a gasket mount?",
  "Why does plate material change the sound?",
  "Is a 65% layout good for gaming?",
  "What does lubing stabilizers actually do?",
] as const;

type Stats = {
  n: number;
  meanMs: number;
  medianMs: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
  stdDevMs: number;
};

function percentile(sorted: number[], p: number): number {
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(Math.max(rank - 1, 0), sorted.length - 1)]!;
}

function summarise(samplesMs: number[]): Stats | null {
  if (samplesMs.length === 0) return null;

  const sorted = [...samplesMs].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((sum, v) => sum + v, 0) / n;
  const variance = sorted.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;

  return {
    n,
    meanMs: mean,
    medianMs: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    minMs: sorted[0]!,
    maxMs: sorted[n - 1]!,
    stdDevMs: Math.sqrt(variance),
  };
}

type PathResult = {
  path: string;
  status: "MEASURED" | "NOT MEASURED";
  reason?: string;
  stats: Stats | null;
  errorCount: number;
};

async function timePath(
  path: string,
  runs: number,
  run: (index: number) => Promise<unknown>,
): Promise<PathResult> {
  const samplesMs: number[] = [];
  let errorCount = 0;
  let firstError: string | undefined;

  for (let i = 0; i < runs; i += 1) {
    const start = process.hrtime.bigint();
    try {
      await run(i);
      samplesMs.push(Number(process.hrtime.bigint() - start) / 1_000_000);
    } catch (error) {
      errorCount += 1;
      firstError ??= error instanceof Error ? error.message : String(error);
    }
  }

  if (samplesMs.length === 0) {
    return {
      path,
      status: "NOT MEASURED",
      reason: firstError ?? "all runs failed",
      stats: null,
      errorCount,
    };
  }

  return { path, status: "MEASURED", stats: summarise(samplesMs), errorCount };
}

async function main() {
  const startedAt = new Date().toISOString();

  if (!process.env.OPENAI_API_KEY) {
    const output = {
      meta: { benchmark: "bench-ai-latency", startedAt, status: "NOT MEASURED" },
      reason:
        "OPENAI_API_KEY is not set. P3 cannot be measured without live API access.",
      results: [],
    };
    mkdirSync("report/evidence/raw", { recursive: true });
    writeFileSync(
      "report/evidence/raw/bench-ai-latency.json",
      `${JSON.stringify(output, null, 2)}\n`,
    );
    console.log("NOT MEASURED — OPENAI_API_KEY absent.");
    return;
  }

  // Preflight reachability check.
  //
  // Without this the script does not degrade as documented: on a host with no
  // outbound network the OpenAI SDK retries each call with exponential backoff,
  // so 40 runs hang for minutes and never reach the NOT MEASURED path. A single
  // short-timeout probe turns that into an immediate, accurate result.
  const reachable = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    signal: AbortSignal.timeout(10_000),
  })
    .then((response) => ({ ok: true as const, status: response.status }))
    .catch((error: unknown) => ({
      ok: false as const,
      error: error instanceof Error ? error.message : String(error),
    }));

  if (!reachable.ok) {
    const output = {
      meta: {
        benchmark: "bench-ai-latency",
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "NOT MEASURED",
        host: hostname(),
        platform: `${process.platform}/${process.arch}`,
      },
      reason: `api.openai.com is unreachable from this host (${reachable.error}). OPENAI_API_KEY was present and loaded, so this is a network/environment limitation rather than a configuration fault. Run this script from a host with outbound internet access.`,
      results: [],
    };
    mkdirSync("report/evidence/raw", { recursive: true });
    writeFileSync(
      "report/evidence/raw/bench-ai-latency.json",
      `${JSON.stringify(output, null, 2)}\n`,
    );
    console.log(`NOT MEASURED — ${output.reason}`);
    return;
  }

  const { extractKeyboardIntent } = await import("@/lib/ai");
  const { generateKeybotResponse } = await import("@/lib/keybot");

  const results: PathResult[] = [];

  results.push(
    await timePath("intent_extraction", RUNS_PER_PATH, (i) =>
      extractKeyboardIntent({
        message: INTENT_PROMPTS[i % INTENT_PROMPTS.length]!,
      }),
    ),
  );

  results.push(
    await timePath("keybot_reply", RUNS_PER_PATH, (i) =>
      generateKeybotResponse({
        message: KEYBOT_PROMPTS[i % KEYBOT_PROMPTS.length]!,
      }),
    ),
  );

  // Vision intent needs an image. Skipped rather than faked if none is provided.
  results.push({
    path: "vision_intent",
    status: "NOT MEASURED",
    reason:
      "Requires a representative inspiration image as input. No fixture image is committed to the repository, and generating a synthetic one would not represent real usage.",
    stats: null,
    errorCount: 0,
  });

  const output = {
    meta: {
      benchmark: "bench-ai-latency",
      startedAt,
      finishedAt: new Date().toISOString(),
      nodeVersion: process.version,
      platform: `${process.platform}/${process.arch}`,
      host: hostname(),
      model: process.env.OPENAI_MODEL ?? "(default)",
      runsPerPath: RUNS_PER_PATH,
      measures: "TOTAL end-to-end response latency",
      doesNotMeasure:
        "Time to first token. Streaming is not implemented (no stream:true, ReadableStream or streamText in src/), so CP1 §3.2.4 'first text token under 2 seconds' is NOT EVALUABLE against this implementation.",
      environmentCaveat:
        "Latency is dominated by network round-trip and third-party provider queueing, not by project code. These figures characterise THIS machine and network only, and are not portable to a laptop, a different region, or a deployed host.",
    },
    results,
  };

  mkdirSync("report/evidence/raw", { recursive: true });
  writeFileSync(
    "report/evidence/raw/bench-ai-latency.json",
    `${JSON.stringify(output, null, 2)}\n`,
  );

  console.table(
    results.map((result) => ({
      path: result.path,
      status: result.status,
      n: result.stats?.n ?? 0,
      mean: result.stats ? result.stats.meanMs.toFixed(0) : "—",
      median: result.stats ? result.stats.medianMs.toFixed(0) : "—",
      p95: result.stats ? result.stats.p95Ms.toFixed(0) : "—",
      errors: result.errorCount,
      reason: result.reason ?? "",
    })),
  );
  console.log("Wrote report/evidence/raw/bench-ai-latency.json");
}

void main();
