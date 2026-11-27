#!/usr/bin/env tsx
/**
 * Step 4 of an import batch: move the parts Jayson approved into
 * src/data/imported/approved-parts.json. Free, local file only: it does not
 * touch any database (scripts/catalog/seed-local.ts does that, locally).
 *
 * A part is applied only if: decision is "approve", every required field is
 * known (after Jayson's fixes), it passes the schema, and no blocking check
 * (duplicate id/name, non-MYR currency) fires. Re-running is safe.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/catalog/apply-approved.ts --batch mkb-001
 */
import { frozenCatalog } from "@/data";
import { keyboardComponentCatalogSchema, type KeyboardComponent } from "@/lib/types";

import { APPROVED_PARTS_PATH, parseArgs, readCandidates, readDecisions, readJson, requireArg, writeJson } from "./lib/batch";
import { applyDecision, evaluateCandidate } from "./lib/review";
import { getVendor } from "./vendors";

type ApprovedFile = { _note: string; parts: KeyboardComponent[] };

function main() {
  const args = parseArgs();
  const batchId = requireArg(args, "batch");
  const file = readCandidates(batchId);
  const decisions = readDecisions(batchId);
  if (!decisions) {
    console.error("No decisions.json yet: run scripts/catalog/review.ts first.");
    process.exit(1);
  }
  const vendor = getVendor(file.vendorId);
  const approvedFile = readJson<ApprovedFile>(APPROVED_PARTS_PATH);

  // Parts from this batch are replaced on re-run; other batches are kept.
  const kept = approvedFile.parts.filter((part) => part.metadata?.importBatch !== batchId);
  const existing = [...frozenCatalog, ...kept];
  const context = { vendorName: vendor.name, checkedAt: file.createdAt, batchId };

  const added: KeyboardComponent[] = [];
  const problems: string[] = [];
  let approvedCount = 0;
  let rejectedCount = 0;
  let pendingCount = 0;

  for (const candidate of file.candidates) {
    const decision = decisions.parts[candidate.key];
    if (!decision || decision.decision === "pending") {
      pendingCount++;
      continue;
    }
    if (decision.decision === "reject") {
      rejectedCount++;
      continue;
    }
    approvedCount++;
    const result = evaluateCandidate(applyDecision(candidate, decision), [...existing, ...added], context);
    const blocking = result.flags.filter((flag) => flag.severity === "block");
    if (result.missing.length || result.errors.length || blocking.length) {
      problems.push(
        `${candidate.key}: ${[
          result.missing.length ? `missing ${result.missing.join(", ")}` : "",
          ...result.errors,
          ...blocking.map((flag) => flag.message),
        ].filter(Boolean).join("; ")}`,
      );
      continue;
    }
    added.push(
      ...result.parts.map((part) => ({
        ...part,
        metadata: {
          ...part.metadata,
          // Honest provenance: an auto-approval is not a human review.
          reviewedBy: decision.auto ? "auto (HQ rule: independent blind pass agreed)" : "Jayson",
          ...(decision.note ? { reviewNote: decision.note } : {}),
          ...(decision.soundSource && part.soundProfile
            ? { soundSource: decision.soundSource.source, soundConfidence: decision.soundSource.confidence }
            : {}),
        },
      })),
    );
  }

  const parts = keyboardComponentCatalogSchema.parse([...kept, ...added]);
  writeJson(APPROVED_PARTS_PATH, { ...approvedFile, parts });

  console.log(`Batch ${batchId}: ${approvedCount} approved, ${rejectedCount} rejected, ${pendingCount} still pending.`);
  console.log(`Added ${added.length} catalogue parts (kits count as several). Imported total: ${parts.length}. Full catalogue: ${frozenCatalog.length + parts.length}.`);

  if (decisions.reviewStartedAt && decisions.reviewFinishedAt) {
    const minutes = (Date.parse(decisions.reviewFinishedAt) - Date.parse(decisions.reviewStartedAt)) / 60_000;
    const reviewed = approvedCount + rejectedCount;
    if (Number.isFinite(minutes) && reviewed > 0) {
      console.log(`Review time: ${minutes.toFixed(1)} min for ${reviewed} products = ${(minutes / reviewed).toFixed(2)} min per product.`);
    }
  }
  if (problems.length) {
    console.log(`\nNot applied (fix in decisions.json, then re-run):`);
    for (const problem of problems) console.log(`  - ${problem}`);
    process.exitCode = 1;
  }
}

main();
