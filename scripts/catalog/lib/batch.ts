/**
 * On-disk layout of one import batch (committed, so the review is traceable):
 *
 *   scripts/catalog/batches/<batchId>/
 *     candidates.json   importer output: every field with value, confidence, snippet
 *     skipped.json      products that were not parts (accessories, pre-builts, …)
 *     review.md         what Jayson reads: a table per part
 *     decisions.json    what Jayson edits: approve / reject + field fixes
 *     extract-log.json  paid AI runs: tokens and USD per run
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import type { Candidate, CandidateCategory, FieldName } from "./fields";

export const CATALOG_DIR = resolve(process.cwd(), "scripts/catalog");
export const CACHE_DIR = join(CATALOG_DIR, ".cache");
export const BATCHES_DIR = join(CATALOG_DIR, "batches");
export const APPROVED_PARTS_PATH = resolve(process.cwd(), "src/data/imported/approved-parts.json");
export const PRICE_CHECKS_PATH = resolve(process.cwd(), "src/data/imported/price-checks.json");

export type SkippedProduct = { key: string; title: string; sourceUrl: string; reason: string };

export type Decision = {
  decision: "pending" | "approve" | "reject";
  /** Corrected values, e.g. { "mountSupport": ["gasket_mount"], "beginnerFriendly": true }. */
  fixes: Partial<Record<FieldName, unknown>>;
  /** Optional category fix (e.g. a "case" that is really a "kit"). */
  category?: CandidateCategory;
  note: string;
  /** True when set by the blind-pass auto-approval rule, not by Jayson. */
  auto?: boolean;
  /** Where a sound-profile fix came from, when it is not on the product page. */
  soundSource?: { source: string; confidence: "high" | "medium-high" | "medium" | "medium-low" | "low" };
};

export type DecisionsFile = {
  batchId: string;
  /** ISO time Jayson started / finished reviewing this batch (for review-time per part). */
  reviewStartedAt: string;
  reviewFinishedAt: string;
  parts: Record<string, Decision>;
};

export type CandidatesFile = {
  batchId: string;
  vendorId: string;
  createdAt: string;
  candidates: Candidate[];
};

export function batchDir(batchId: string) {
  if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(batchId)) {
    throw new Error(`Bad batch id "${batchId}": use lowercase letters, digits and dashes.`);
  }
  return join(BATCHES_DIR, batchId);
}

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function writeJson(path: string, value: unknown) {
  const dir = resolve(path, "..");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function batchPaths(batchId: string) {
  const dir = batchDir(batchId);
  return {
    dir,
    candidates: join(dir, "candidates.json"),
    skipped: join(dir, "skipped.json"),
    review: join(dir, "review.md"),
    decisions: join(dir, "decisions.json"),
    extractLog: join(dir, "extract-log.json"),
  };
}

export function readCandidates(batchId: string) {
  return readJson<CandidatesFile>(batchPaths(batchId).candidates);
}

export function readDecisions(batchId: string): DecisionsFile | undefined {
  const path = batchPaths(batchId).decisions;
  return existsSync(path) ? readJson<DecisionsFile>(path) : undefined;
}

/** Minimal `--name value` / `--flag` parser for the catalog scripts. */
export function parseArgs(argv = process.argv.slice(2)) {
  const args: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const name = token.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      args[name] = next;
      i++;
    } else {
      args[name] = true;
    }
  }
  return args;
}

export function requireArg(args: Record<string, string | true>, name: string) {
  const value = args[name];
  if (typeof value !== "string" || !value) {
    console.error(`Missing --${name} <value>`);
    process.exit(1);
  }
  return value;
}
