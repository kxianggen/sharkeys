/** Review queue (v2 WS2, subtask 4): render review.md and apply Jayson's decisions. */
import type { ComponentCategory, KeyboardComponent } from "@/lib/types";

import { assembleCandidate, missingRequired, type AssembleContext } from "./assemble";
import type { Decision, DecisionsFile } from "./batch";
import { runChecks, type CheckFlag } from "./checks";
import { beginnerRule } from "./deterministic";
import {
  REQUIRED_FIELDS,
  REVIEW_FIELDS,
  UNKNOWN,
  known,
  type Candidate,
  type CandidateFields,
  type FieldName,
} from "./fields";

export const LOW_CONFIDENCE = 0.7;

export function emptyDecision(): Decision {
  return { decision: "pending", fixes: {}, note: "" };
}

/** Jayson's fixes win over everything: source "reviewer", confidence 1. */
export function applyDecision(candidate: Candidate, decision: Decision | undefined): Candidate {
  if (!decision) return candidate;
  const fields = { ...candidate.fields } as CandidateFields;
  for (const [name, fix] of Object.entries(decision.fixes) as [FieldName, unknown][]) {
    if (!(name in fields) || fix === undefined || fix === null || fix === "") continue;
    (fields as Record<FieldName, unknown>)[name] = known(fix, 1, "reviewer", "fixed by reviewer");
  }
  return {
    ...candidate,
    category: decision.category ? known(decision.category, 1, "reviewer", "fixed by reviewer") : candidate.category,
    fields,
  };
}

export type ReviewedCandidate = {
  candidate: Candidate;
  parts: KeyboardComponent[];
  missing: FieldName[];
  errors: string[];
  flags: CheckFlag[];
  exampleBuild?: Record<ComponentCategory, string>;
};

/**
 * Values that follow logically from other known values (never from nothing).
 * Applied after the reviewer's fixes, so a fix to the source value flows through.
 */
export function deriveFields(candidate: Candidate): Candidate {
  const category = candidate.category.value;
  const f = { ...candidate.fields };
  if (category === "kit" && f.stabilizerTypeSupport.value === UNKNOWN && f.stabilizerType.value !== UNKNOWN) {
    // The kit ships with this stabiliser, so its PCB supports that type.
    f.stabilizerTypeSupport = known([f.stabilizerType.value as string], Math.min(f.stabilizerType.confidence, 0.8), "default", `kit ships with ${String(f.stabilizerType.value)} stabilizers: ${f.stabilizerType.snippet}`);
  }
  if (
    category === "keycap" &&
    f.switchTechnologySupport.value === UNKNOWN &&
    ["cherry", "oem", "xda", "moa", "sa"].includes(String(f.keycapProfile.value))
  ) {
    // These profiles only exist with the MX cross stem, so the profile implies
    // MX-style (mechanical) switches. Low-profile and Topre do not.
    f.switchTechnologySupport = known(["mechanical"], 0.7, "default", `implied by ${String(f.keycapProfile.value)} profile (MX stem): ${f.keycapProfile.snippet}`);
  }
  if (category !== UNKNOWN && f.beginnerFriendly.value === UNKNOWN) {
    const rule = beginnerRule(category, f);
    if (rule) f.beginnerFriendly = rule;
  }
  return { ...candidate, fields: f };
}

export function evaluateCandidate(
  rawCandidate: Candidate,
  existing: readonly KeyboardComponent[],
  context: AssembleContext,
): ReviewedCandidate {
  const candidate = deriveFields(rawCandidate);
  const assembled = assembleCandidate(candidate, context);
  if (!assembled.ok) {
    return {
      candidate,
      parts: [],
      missing: assembled.missing.length ? assembled.missing : missingRequired(candidate),
      errors: assembled.errors,
      flags: [],
    };
  }
  const checks = runChecks(assembled.components, existing);
  return { candidate, parts: assembled.components, missing: [], errors: [], ...checks };
}

function formatValue(value: unknown) {
  if (value === UNKNOWN) return "**unknown**";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return String(value);
  return String(value);
}

function cell(text: string) {
  return text.replace(/\|/g, "\\|").replace(/\s+/g, " ").slice(0, 160);
}

export function renderReviewMarkdown(
  batchId: string,
  reviewed: ReviewedCandidate[],
  skippedCount: number,
  /** Keys auto-approved by the blind-pass rule: listed briefly, not shown for review. */
  autoApproved: Set<string> = new Set(),
  /** Why the blind pass sent a product to Jayson (disagreements), by key. */
  blindReasons: Map<string, string[]> = new Map(),
): string {
  const autoItems = reviewed.filter((r) => autoApproved.has(r.candidate.key));
  reviewed = reviewed.filter((r) => !autoApproved.has(r.candidate.key));
  // Products the blind pass looked at first: they come with its findings.
  reviewed = [...reviewed].sort((a, b) => Number(blindReasons.has(b.candidate.key)) - Number(blindReasons.has(a.candidate.key)));
  const ready = reviewed.filter((r) => r.missing.length === 0 && r.errors.length === 0);
  const lines: string[] = [
    `# Review batch \`${batchId}\``,
    "",
    `${reviewed.length} candidates for you · ${ready.length} complete · ${reviewed.length - ready.length} need a value from you · ${autoItems.length} auto-approved (listed at the end; spot-check list in scripts/catalog/blind/) · ${skippedCount} skipped (not parts, see skipped.json)`,
    "",
    `The first ${[...blindReasons.keys()].filter((k) => !autoApproved.has(k)).length} were also read by the independent blind pass; where it disagreed with the importer, the disagreement is listed under the part. Neither side is assumed right: check the source page.`,
    "",
    "## How to review",
    "",
    "1. Put the time in `reviewStartedAt` in `decisions.json` (any ISO time, e.g. `2026-11-28T10:00:00+08:00`).",
    "2. For each part below, open the source link if anything looks off. In `decisions.json` set `decision` to `approve` or `reject`.",
    "3. Fix a wrong or **unknown** value under `fixes`, e.g. `\"mountSupport\": [\"gasket_mount\"]` or `\"beginnerFriendly\": true`. A fix always wins.",
    "4. Put the time in `reviewFinishedAt`, then run `npm run catalog:apply -- --batch " + batchId + "`.",
    "",
    "⚠ marks a required value that is unknown, or a value under " + LOW_CONFIDENCE + " confidence. Prices are the listed MYR price, excluding shipping (switches: per switch).",
    "",
    "Allowed values: layouts `60 65 75 tkl full` · mounts `gasket_mount top_mount tray_mount o_ring_mount` · switch tech `mechanical optical hall_effect topre` · keycap profile `cherry oem xda moa sa low_profile topre` · stabilizer `plate_mount pcb_mount screw_in` · sizes `2u 6.25u 7u` · connection `wired wireless both` · sound `thocky creamy clacky silent neutral`.",
    "",
  ];

  for (const item of reviewed) {
    const c = item.candidate;
    const category = c.category.value;
    const status =
      item.errors.length > 0 ? "❌ invalid" : item.missing.length > 0 ? "⚠ needs values" : item.flags.some((f) => f.severity === "block") ? "⛔ blocked" : item.flags.length ? "⚠ check flags" : "✅ ready";
    lines.push(`## ${status} · ${c.fields.name.value === UNKNOWN ? c.key : String(c.fields.name.value)}`, "");
    lines.push(`- key: \`${c.key}\` · category: **${String(category)}** · [source](${c.sourceUrl})`);
    if (item.parts.length) lines.push(`- becomes: ${item.parts.map((p) => `\`${p.id}\``).join(", ")}`);
    if (item.missing.length) lines.push(`- **missing required:** ${item.missing.join(", ")}`);
    for (const reason of blindReasons.get(c.key) ?? []) lines.push(`- 🔍 blind pass: ${reason}`);
    for (const error of item.errors) lines.push(`- schema error: ${error}`);
    for (const flag of item.flags) lines.push(`- ${flag.severity === "block" ? "⛔" : "⚠"} ${flag.check}: ${flag.message}`);
    if (item.exampleBuild) {
      lines.push(`- fits a valid build, e.g. ${Object.values(item.exampleBuild).map((id) => `\`${id}\``).join(" + ")}`);
    }
    for (const note of c.notes) if (note !== "ai: done") lines.push(`- note: ${note}`);
    lines.push("", "| field | value | confidence | from | source text |", "|---|---|---|---|---|");

    const names = category === UNKNOWN ? [] : REVIEW_FIELDS[category];
    const required = new Set(category === UNKNOWN ? [] : REQUIRED_FIELDS[category]);
    for (const name of names) {
      const field = c.fields[name];
      const warn = (required.has(name) && field.value === UNKNOWN) || (field.value !== UNKNOWN && field.confidence < LOW_CONFIDENCE);
      lines.push(
        `| ${warn ? "⚠ " : ""}${name}${required.has(name) ? "*" : ""} | ${cell(formatValue(field.value))} | ${field.value === UNKNOWN ? "–" : field.confidence.toFixed(2)} | ${field.source} | ${cell(field.snippet)} |`,
      );
    }
    lines.push("");
  }
  if (autoItems.length > 0) {
    lines.push(
      "## Auto-approved (HQ rule)",
      "",
      "The independent blind pass agreed with the importer on every field, every page quote was verified, and the rule engine found a valid build. To undo one, set its `decision` back to `pending` in decisions.json.",
      "",
      ...autoItems.map((r) => `- ${String(r.candidate.fields.name.value)} → ${r.parts.map((p) => `\`${p.id}\``).join(", ")} · [source](${r.candidate.sourceUrl})`),
      "",
    );
  }
  return `${lines.join("\n")}\n`;
}

/** Keeps Jayson's existing decisions; adds pending entries for new candidates. */
export function mergeDecisions(
  batchId: string,
  candidates: Candidate[],
  existing: DecisionsFile | undefined,
): DecisionsFile {
  const parts: Record<string, Decision> = {};
  for (const candidate of candidates) {
    parts[candidate.key] = existing?.parts[candidate.key] ?? emptyDecision();
  }
  return {
    batchId,
    reviewStartedAt: existing?.reviewStartedAt ?? "",
    reviewFinishedAt: existing?.reviewFinishedAt ?? "",
    parts,
  };
}
