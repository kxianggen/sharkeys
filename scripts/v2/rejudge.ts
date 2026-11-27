#!/usr/bin/env tsx
/**
 * Re-judge an existing simulated-user run with the CURRENT rubric (v2 WS0).
 *
 * Only the judge runs again: the transcripts, app calls and code checks are
 * copied unchanged, so the result shows the effect of the rubric alone. The
 * source run is never modified; output goes to a new run folder.
 *
 * Costs money (judge calls only, ~USD 0.0015 per session). Prints an estimate
 * first and stops above --max-cost (default USD 0.10).
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/v2/rejudge.ts --run eval/v2/runs/2026-11-27-baseline --label baseline-rubric-v2
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parseArgs } from "node:util";

import OpenAI from "openai";

import { loadEnvFile } from "../load-env-file";
import { JUDGE_MODEL, judgeTranscript, RUBRIC_VERSION } from "./lib/judge";
import { loadPersonas } from "./lib/persona";
import { costUSD } from "./lib/pricing";
import type { SessionRecord } from "./simulate";

loadEnvFile();

const { values: args } = parseArgs({
  options: {
    run: { type: "string" },
    label: { type: "string" },
    "max-cost": { type: "string", default: "0.10" },
  },
});

async function main() {
  if (!args.run || !args.label) {
    console.error("Usage: rejudge.ts --run <run dir> --label <new label>");
    process.exit(1);
  }
  const sessions = readFileSync(join(args.run, "sessions.jsonl"), "utf8")
    .split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l) as SessionRecord);
  const personas = new Map(loadPersonas().personas.map((p) => [p.id, p]));

  // ~4,500 input tokens (rubric + catalogue + transcript) and ~250 output per session.
  const estimate = sessions.length * costUSD({ inputTokens: 4_500, cachedInputTokens: 0, outputTokens: 250 });
  console.log(`Re-judging ${sessions.length} sessions from ${args.run} with ${RUBRIC_VERSION} (${JUDGE_MODEL}). Estimate: USD ${estimate.toFixed(3)}`);
  if (estimate > Number(args["max-cost"])) {
    console.error(`Stopping: estimate above USD ${args["max-cost"]}.`);
    process.exit(2);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set (expected in .env.local).");
    process.exit(1);
  }

  const date = new Date().toISOString().slice(0, 10);
  const outDir = join("eval", "v2", "runs", `${date}-${args.label}`);
  mkdirSync(outDir, { recursive: true });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60_000, maxRetries: 2 });

  const out: SessionRecord[] = [];
  let spent = 0;
  for (const s of sessions) {
    const persona = personas.get(s.personaId);
    if (!persona || s.endedWith === "error") {
      out.push(s);
      continue;
    }
    const { verdict, usage } = await judgeTranscript({ client, persona, turns: s.turns });
    const judgeCost = costUSD(usage);
    spent += judgeCost;
    out.push({
      ...s,
      rubricVersion: RUBRIC_VERSION,
      verdict,
      usage: { ...s.usage, judge: usage },
      costUSD: { ...s.costUSD, judge: judgeCost },
    });
    console.log(`  ${s.personaId}: ${s.verdict?.success ? "S" : "f"} → ${verdict.success ? "SUCCESS" : "fail"}, confusion ${s.verdict?.confusion} → ${verdict.confusion}, honesty ${s.verdict?.honesty} → ${verdict.honesty}`);
  }

  writeFileSync(join(outDir, "sessions.jsonl"), out.map((s) => JSON.stringify(s)).join("\n") + "\n");
  const sourceRun = JSON.parse(readFileSync(join(args.run, "run.json"), "utf8"));
  writeFileSync(
    join(outDir, "run.json"),
    JSON.stringify(
      {
        ...sourceRun,
        label: args.label,
        rejudgedFrom: basename(args.run),
        rejudgedOn: date,
        rubricVersion: RUBRIC_VERSION,
        note: "Transcripts, app calls and code checks copied unchanged from the source run; only the judge was re-run. Persona and app costs are the source run's.",
        rejudgeSpendUSD: Number(spent.toFixed(4)),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`\nDone. Judge spend USD ${spent.toFixed(4)}. Output: ${outDir} (transcripts: see ${args.run}/transcripts)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
