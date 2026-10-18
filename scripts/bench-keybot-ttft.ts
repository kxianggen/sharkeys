/**
 * bench-keybot-ttft.ts — Keybot time to first token (wrap-up item 5, minimal).
 *
 * Measures how soon Meg's first answer text COULD appear if the compose call
 * were streamed, against the current non-streaming call, in the same run.
 *
 * For each run it builds the grounded facts once, then sends the identical
 * compose request (buildKeybotComposeRequest, shared with the live path) twice:
 *   - responses.parse  — current behaviour; the user sees nothing until the
 *                        whole reply arrives, so total = time to first text.
 *   - responses.stream — records the first text delta (raw JSON, e.g.
 *                        `{"answer":"`), the first visible answer text, and
 *                        the stream's total.
 * The order alternates per run so neither call systematically benefits from a
 * warm connection.
 *
 * WHAT THIS DOES NOT SHOW
 * -----------------------
 * The product does not stream. A streamed first-answer-text figure under
 * 2,000 ms shows that streaming WOULD meet CP1 §3.2.4 on this machine; it does
 * not show that the shipped product meets it. OpenAI timings start at the
 * compose call; fact building (local catalog / recommendation engine) is
 * reported separately as factsMs and is identical for both calls.
 *
 * Environment matters: figures characterise THIS machine and network only.
 *
 * Requires OPENAI_API_KEY in .env.local. Makes real, billable API calls
 * (RUNS × 2 compose calls).
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/bench-keybot-ttft.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { hostname } from "node:os";

import { loadEnvFile } from "./load-env-file";
import { hasAnswerText } from "./ttft-answer-text";

loadEnvFile();

const RUNS = 20;
const OUTPUT_PATH = "evidence/raw/bench-keybot-ttft.json";

// Same prompts as bench-ai-latency.ts so the two reports are comparable.
const KEYBOT_PROMPTS = [
  "What is a gasket mount?",
  "Why does plate material change the sound?",
  "Is a 65% layout good for gaming?",
  "What does lubing stabilizers actually do?",
] as const;

const METRICS = [
  "factsMs",
  "parseTotalMs",
  "streamFirstDeltaMs",
  "streamFirstAnswerTextMs",
  "streamTotalMs",
] as const;

type Metric = (typeof METRICS)[number];

type Stats = {
  n: number;
  meanMs: number;
  medianMs: number;
  p95Ms: number;
  minMs: number;
  maxMs: number;
};

function percentile(sorted: number[], p: number): number {
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(Math.max(rank - 1, 0), sorted.length - 1)]!;
}

function summarise(samplesMs: number[]): Stats | null {
  if (samplesMs.length === 0) return null;

  const sorted = [...samplesMs].sort((a, b) => a - b);
  const n = sorted.length;

  return {
    n,
    meanMs: sorted.reduce((sum, v) => sum + v, 0) / n,
    medianMs: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    minMs: sorted[0]!,
    maxMs: sorted[n - 1]!,
  };
}

function elapsedMs(start: bigint) {
  return Number(process.hrtime.bigint() - start) / 1_000_000;
}

function writeNotMeasured(startedAt: string, reason: string) {
  const output = {
    meta: {
      benchmark: "bench-keybot-ttft",
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "NOT MEASURED",
      host: hostname(),
      platform: `${process.platform}/${process.arch}`,
    },
    reason,
    results: [],
  };
  mkdirSync("evidence/raw", { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`NOT MEASURED — ${reason}`);
}

async function main() {
  const startedAt = new Date().toISOString();

  if (!process.env.OPENAI_API_KEY) {
    writeNotMeasured(
      startedAt,
      "OPENAI_API_KEY is not set. Time to first token cannot be measured without live API access.",
    );
    return;
  }

  // Preflight, as in bench-ai-latency.ts: fail fast on a host with no egress.
  const reachable = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    signal: AbortSignal.timeout(10_000),
  })
    .then(() => ({ ok: true as const }))
    .catch((error: unknown) => ({
      ok: false as const,
      error: error instanceof Error ? error.message : String(error),
    }));

  if (!reachable.ok) {
    writeNotMeasured(
      startedAt,
      `api.openai.com is unreachable from this host (${reachable.error}).`,
    );
    return;
  }

  const { createOpenAIClient } = await import("@/lib/openai");
  const {
    buildKeybotComposeRequest,
    classifyKeybotMessage,
    prepareKeybotFacts,
  } = await import("@/lib/keybot/service");

  const client = createOpenAIClient();
  const samples: Record<Metric, number[]> = {
    factsMs: [],
    parseTotalMs: [],
    streamFirstDeltaMs: [],
    streamFirstAnswerTextMs: [],
    streamTotalMs: [],
  };
  const errors: string[] = [];

  async function timeParse(request: ReturnType<typeof buildKeybotComposeRequest>) {
    const start = process.hrtime.bigint();
    const response = await client.responses.parse(request);

    if (!response.output_parsed) {
      throw new Error("parse: no output_parsed");
    }

    samples.parseTotalMs.push(elapsedMs(start));
  }

  async function timeStream(request: ReturnType<typeof buildKeybotComposeRequest>) {
    const start = process.hrtime.bigint();
    const stream = client.responses.stream(request);
    let streamed = "";
    let firstDeltaMs: number | null = null;
    let firstAnswerTextMs: number | null = null;

    for await (const event of stream) {
      if (event.type !== "response.output_text.delta") continue;

      firstDeltaMs ??= elapsedMs(start);
      streamed += event.delta;

      if (firstAnswerTextMs === null && hasAnswerText(streamed)) {
        firstAnswerTextMs = elapsedMs(start);
      }
    }

    const response = await stream.finalResponse();
    const totalMs = elapsedMs(start);

    if (!response.output_parsed || firstDeltaMs === null || firstAnswerTextMs === null) {
      throw new Error("stream: no parsed output or no answer text");
    }

    samples.streamFirstDeltaMs.push(firstDeltaMs);
    samples.streamFirstAnswerTextMs.push(firstAnswerTextMs);
    samples.streamTotalMs.push(totalMs);
  }

  for (let i = 0; i < RUNS; i += 1) {
    const message = KEYBOT_PROMPTS[i % KEYBOT_PROMPTS.length]!;
    const factsStart = process.hrtime.bigint();
    const facts = await prepareKeybotFacts(
      { message },
      classifyKeybotMessage(message),
    );
    samples.factsMs.push(elapsedMs(factsStart));

    const request = buildKeybotComposeRequest(facts);
    const calls =
      i % 2 === 0
        ? [() => timeParse(request), () => timeStream(request)]
        : [() => timeStream(request), () => timeParse(request)];

    for (const call of calls) {
      try {
        await call();
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    console.log(`run ${i + 1}/${RUNS} done`);
  }

  const results = METRICS.map((metric) => ({
    metric,
    stats: summarise(samples[metric]),
  }));

  const output = {
    meta: {
      benchmark: "bench-keybot-ttft",
      startedAt,
      finishedAt: new Date().toISOString(),
      nodeVersion: process.version,
      platform: `${process.platform}/${process.arch}`,
      host: hostname(),
      model: process.env.OPENAI_MODEL ?? "(default)",
      runs: RUNS,
      prompts: KEYBOT_PROMPTS,
      measures:
        "Per run, the same compose request via responses.parse (non-streaming total = time to first text today) and responses.stream (first delta, first visible answer text, total). OpenAI timings start at the compose call; factsMs is reported separately.",
      doesNotShow:
        "That the product meets CP1 §3.2.4. The product does not stream; this shows whether streaming would bring first answer text under 2,000 ms on this machine.",
      environmentCaveat:
        "Latency is dominated by network round-trip and provider queueing. These figures characterise THIS machine and network only.",
    },
    errorCount: errors.length,
    errors,
    results,
  };

  mkdirSync("evidence/raw", { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

  console.table(
    results.map(({ metric, stats }) => ({
      metric,
      n: stats?.n ?? 0,
      median: stats ? stats.medianMs.toFixed(0) : "—",
      p95: stats ? stats.p95Ms.toFixed(0) : "—",
      min: stats ? stats.minMs.toFixed(0) : "—",
      max: stats ? stats.maxMs.toFixed(0) : "—",
    })),
  );
  console.log(`errors: ${errors.length}`);
  console.log(`Wrote ${OUTPUT_PATH}`);
}

void main();
