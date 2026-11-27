#!/usr/bin/env tsx
/**
 * Step 3 of an import batch: run the checks and write the review queue
 * (review.md to read, decisions.json to edit). Free: no network, no AI.
 * Safe to re-run: Jayson's existing decisions and fixes are kept.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/catalog/review.ts --batch mkb-001
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { fullCatalog } from "@/data";

import { batchPaths, CATALOG_DIR, parseArgs, readCandidates, readDecisions, readJson, requireArg, writeJson, type SkippedProduct } from "./lib/batch";
import { applyDecision, evaluateCandidate, mergeDecisions, renderReviewMarkdown } from "./lib/review";
import { getVendor } from "./vendors";

function main() {
  const args = parseArgs();
  const batchId = requireArg(args, "batch");
  const paths = batchPaths(batchId);
  const file = readCandidates(batchId);
  const vendor = getVendor(file.vendorId);
  const decisions = mergeDecisions(batchId, file.candidates, readDecisions(batchId));
  const skipped = existsSync(paths.skipped) ? readJson<SkippedProduct[]>(paths.skipped) : [];

  // Check against the current catalogue plus the other candidates in this
  // batch, so two near-identical products in one batch are caught too.
  const reviewed = file.candidates.map((candidate) =>
    applyDecision(candidate, decisions.parts[candidate.key]),
  );
  const context = { vendorName: vendor.name, checkedAt: file.createdAt, batchId };
  // Compare with everything except this batch's own earlier approvals (else a
  // part is a "duplicate" of itself once approved).
  const existingOutsideBatch = fullCatalog.filter((part) => part.metadata?.importBatch !== batchId);
  const results = reviewed.map((candidate) => evaluateCandidate(candidate, existingOutsideBatch, context));

  // Duplicates inside the batch.
  const seen = new Map<string, string>();
  for (const result of results) {
    for (const part of result.parts) {
      const other = seen.get(part.id);
      if (other && other !== result.candidate.key) {
        result.flags.push({ check: "duplicate", severity: "block", message: `same id as ${other} in this batch` });
      }
      seen.set(part.id, result.candidate.key);
    }
  }

  // Blind-pass findings (scripts/catalog/blind-check.ts), when present.
  const autoApproved = new Set(
    Object.entries(decisions.parts).filter(([, d]) => d.auto && d.decision === "approve").map(([key]) => key),
  );
  const blindResultsPath = join(CATALOG_DIR, "blind", `${batchId}-results.json`);
  const blindReasons = new Map<string, string[]>(
    existsSync(blindResultsPath)
      ? readJson<{ key: string; autoApprove: boolean; reasons: string[] }[]>(blindResultsPath)
          .filter((r) => !r.autoApprove)
          .map((r) => [r.key, r.reasons])
      : [],
  );

  writeFileSync(paths.review, renderReviewMarkdown(batchId, results, skipped.length, autoApproved, blindReasons));
  writeJson(paths.decisions, decisions);

  const ready = results.filter((r) => r.missing.length === 0 && r.errors.length === 0).length;
  const flagged = results.filter((r) => r.flags.length > 0).length;
  console.log(`${results.length} candidates: ${ready} complete, ${results.length - ready} need values, ${flagged} with flags.`);
  console.log(`Read ${paths.review}\nEdit ${paths.decisions}`);
}

main();
