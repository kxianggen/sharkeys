#!/usr/bin/env tsx
/**
 * Golden set tools (v2 WS2, subtask 6). Free: no network, no AI.
 *
 *   make:     npx tsx --tsconfig tsconfig.json scripts/catalog/golden.ts make --batch mkb-001 [--count 20]
 *             → scripts/catalog/golden/golden-20.csv (pre-filled; Jayson edits correct_value)
 *   accuracy: npx tsx --tsconfig tsconfig.json scripts/catalog/golden.ts accuracy
 *             → per-field accuracy table, also written to golden/accuracy.md
 *
 * Make the sheet from the importer output BEFORE review fixes, so the score
 * measures the importer, not the reviewer.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { CATALOG_DIR, parseArgs, readCandidates, requireArg } from "./lib/batch";
import { goldenRows, pickGolden, readGoldenCsv, scoreGolden, toCsv } from "./lib/golden";
import { deriveFields } from "./lib/review";

const GOLDEN_DIR = join(CATALOG_DIR, "golden");

function make(args: Record<string, string | true>) {
  const batchId = requireArg(args, "batch");
  const count = typeof args.count === "string" ? Number(args.count) : 20;
  const path = join(GOLDEN_DIR, `golden-${count}.csv`);
  if (existsSync(path) && !args.force) {
    console.error(`${path} exists (it may hold your corrections). Use --force to overwrite.`);
    process.exit(1);
  }
  mkdirSync(GOLDEN_DIR, { recursive: true });
  // Score what would go into the catalogue: importer + AI + agreed rules, before review fixes.
  // Keep the set blind: skip products whose importer values were already seen.
  const seenPath = join(GOLDEN_DIR, "seen-in-session.json");
  const seen = new Set(existsSync(seenPath) ? (JSON.parse(readFileSync(seenPath, "utf8")) as { keys: string[] }).keys : []);
  const pool = readCandidates(batchId).candidates.filter((c) => !seen.has(c.key));
  const picked = pickGolden(pool, count).map(deriveFields);
  const rows = goldenRows(picked);
  // HQ change: correct_value starts EMPTY (pre-filling it would anchor the
  // checker and make the accuracy fake). It is filled by the blind pass.
  for (const row of rows) row.correctValue = "";
  writeFileSync(path, toCsv(rows));
  console.log(`Wrote ${rows.length} rows for ${picked.length} parts to ${path}`);
  console.log("Open it in a spreadsheet and correct correct_value from each source page. Empty = the page does not say.");
}

function accuracy(args: Record<string, string | true>) {
  const count = typeof args.count === "string" ? Number(args.count) : 20;
  const path = join(GOLDEN_DIR, `golden-${count}.csv`);
  const result = scoreGolden(readGoldenCsv(readFileSync(path, "utf8")));
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const lines = [
    `# Importer accuracy on the golden set (${path.split(/[\\/]/).pop()})`,
    "",
    `Accuracy (values it gave that were right): **${pct(result.accuracy)}** · coverage (golden values it found): ${pct(result.coverage)} · cells you corrected: ${result.edited}`,
    "",
    "| field | correct | wrong | missed (said unknown) | unknown & page silent | accuracy |",
    "|---|---|---|---|---|---|",
    ...result.fields.map((f) => `| ${f.field} | ${f.correct} | ${f.wrong} | ${f.missed} | ${f.unknownOk} | ${f.correct + f.wrong ? pct(f.correct / (f.correct + f.wrong)) : "–"} |`),
    `| **all** | ${result.total.correct} | ${result.total.wrong} | ${result.total.missed} | ${result.total.unknownOk} | **${pct(result.accuracy)}** |`,
    "",
    result.wrongRows.length ? "## Wrong values (the dangerous ones)" : "No wrong values.",
    ...result.wrongRows.map((r) => `- \`${r.key}\` ${r.field}: importer "${r.importerValue}", correct "${r.correctValue}"`),
    "",
  ];
  const report = lines.join("\n");
  writeFileSync(join(GOLDEN_DIR, "accuracy.md"), report);
  console.log(report);
}

const [command] = process.argv.slice(2);
const args = parseArgs(process.argv.slice(3));
if (command === "make") make(args);
else if (command === "accuracy") accuracy(args);
else {
  console.error("Usage: golden.ts make --batch <id> [--count 20] | golden.ts accuracy [--count 20]");
  process.exit(1);
}
