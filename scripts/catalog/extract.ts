#!/usr/bin/env tsx
/**
 * Step 2 of an import batch: AI extraction for the fields plain code could
 * not read (costs money; gpt-4.1-mini).
 *
 * Without --yes it is a dry run: prints the token and USD estimate and calls
 * nothing. With --yes it calls the model for at most --limit candidates and
 * stops before the running cost would pass --max-usd (default 0.10). Every
 * paid run is logged with its real token usage in extract-log.json.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/catalog/extract.ts --batch mkb-001 --limit 10            (estimate)
 *   npx tsx --tsconfig tsconfig.json scripts/catalog/extract.ts --batch mkb-001 --limit 10 --yes      (paid)
 */
import { existsSync } from "node:fs";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { loadEnvFile } from "../load-env-file";
import { addUsage, costUSD, usageFromResponse, zeroUsage, PRICES_PER_MTOK } from "../v2/lib/pricing";

import { batchPaths, parseArgs, readCandidates, readJson, requireArg, writeJson } from "./lib/batch";
import {
  aiExtractionSchema,
  buildUserPrompt,
  estimateTokens,
  EXTRACTION_MODEL,
  fieldsToAsk,
  mergeAiExtraction,
  SYSTEM_PROMPT,
} from "./lib/extract-ai";
import { pickGolden } from "./lib/golden";

type LogEntry = { at: string; model: string; candidates: number; inputTokens: number; outputTokens: number; usd: number };

async function main() {
  const args = parseArgs();
  const batchId = requireArg(args, "batch");
  const limit = typeof args.limit === "string" ? Number(args.limit) : 10;
  const maxUsd = typeof args["max-usd"] === "string" ? Number(args["max-usd"]) : 0.1;
  const paid = args.yes === true;
  // --required-only: ask only for fields the part cannot be approved without (cheaper).
  const requiredOnly = args["required-only"] === true;

  const paths = batchPaths(batchId);
  const file = readCandidates(batchId);
  // Same order as the golden sheet (spread across categories), so the first
  // paid batches are also the golden parts.
  const order = new Map(pickGolden(file.candidates, file.candidates.length).map((c, i) => [c.key, i]));
  const todo = file.candidates
    .map((candidate, index) => ({ candidate, index, asked: fieldsToAsk(candidate, requiredOnly) }))
    .sort((a, b) => (order.get(a.candidate.key) ?? 0) - (order.get(b.candidate.key) ?? 0))
    .filter((item) => item.asked.length > 0 && !item.candidate.notes.includes("ai: done"))
    .slice(0, limit);

  const price = PRICES_PER_MTOK[EXTRACTION_MODEL];
  const estimate = todo.reduce(
    (sum, item) => {
      const t = estimateTokens(item.candidate, item.asked);
      return { input: sum.input + t.input, output: sum.output + t.output };
    },
    { input: 0, output: 0 },
  );
  const estimateUsd = (estimate.input * price.input + estimate.output * price.output) / 1_000_000;
  const skippedNoNeed = file.candidates.filter((c) => fieldsToAsk(c, requiredOnly).length === 0).length;

  console.log(`Batch ${batchId}: ${todo.length} candidates need AI fields (${skippedNoNeed} need none).`);
  console.log(`Estimate: ~${estimate.input} input + ~${estimate.output} output tokens on ${EXTRACTION_MODEL} ≈ USD ${estimateUsd.toFixed(4)} (cap USD ${maxUsd}).`);
  if (!paid) {
    console.log("Dry run: nothing was sent. Add --yes to run it.");
    return;
  }
  if (estimateUsd > maxUsd) {
    console.error(`Estimate is over the cap; lower --limit or raise --max-usd.`);
    process.exit(1);
  }

  // OPENAI_API_KEY only. A worktree has no .env.local, so SHARKEYS_ENV_FILE may
  // point at the main checkout's file; the script reads it, nothing prints it.
  loadEnvFile(process.env.SHARKEYS_ENV_FILE ?? ".env.local");
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set. Set it in the shell, or set SHARKEYS_ENV_FILE to the main checkout's .env.local.");
    process.exit(1);
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30_000, maxRetries: 1 });

  let usage = zeroUsage();
  let done = 0;
  for (const item of todo) {
    const next = estimateTokens(item.candidate, item.asked);
    const nextUsd = (next.input * price.input + next.output * price.output) / 1_000_000;
    if (costUSD(usage) + nextUsd > maxUsd) {
      console.log(`Stopping: the next call would pass the USD ${maxUsd} cap.`);
      break;
    }
    try {
      const response = await client.responses.parse({
        model: EXTRACTION_MODEL,
        temperature: 0,
        max_output_tokens: 600,
        input: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(item.candidate, item.asked) },
        ],
        text: { format: zodTextFormat(aiExtractionSchema, "part_fields") },
      });
      usage = addUsage(usage, usageFromResponse(response));
      if (!response.output_parsed) throw new Error("no parsed output");
      const merged = mergeAiExtraction(item.candidate, item.asked, response.output_parsed);
      file.candidates[item.index] = {
        ...merged,
        notes: [...merged.notes, "ai: done"],
        ai: { asked: item.asked, extraction: response.output_parsed, at: new Date().toISOString() },
      };
      done++;
      console.log(`  ✓ ${item.candidate.key} (${item.asked.join(", ")})`);
    } catch (error) {
      console.error(`  ✗ ${item.candidate.key}: ${error instanceof Error ? error.message : error}`);
    }
  }

  writeJson(paths.candidates, file);
  const usd = costUSD(usage);
  const log: LogEntry[] = existsSync(paths.extractLog) ? readJson<LogEntry[]>(paths.extractLog) : [];
  log.push({ at: new Date().toISOString(), model: EXTRACTION_MODEL, candidates: done, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, usd });
  writeJson(paths.extractLog, log);
  console.log(`\nDone: ${done} candidates, ${usage.inputTokens} input + ${usage.outputTokens} output tokens = USD ${usd.toFixed(4)} (real usage).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
