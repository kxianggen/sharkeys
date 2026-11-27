#!/usr/bin/env tsx
/**
 * Compares the blind pass (scripts/catalog/blind/<batch>.json) with the
 * importer, field by field. Free: no network, no AI.
 *
 *   --batch mecha-001                 print the comparison
 *   --batch mecha-001 --apply         also write auto-approvals into decisions.json
 *                                     and scripts/catalog/blind/<batch>-spot-check.md
 *   --batch mecha-001 --golden        fill golden-20.csv correct_value from the blind pass
 *
 * Auto-approval (HQ rule, 2026-11-28) only when ALL hold:
 *   (a) the blind pass agrees with the importer on every compared field
 *   (b) every blind value read from the page has a quote that is on the page
 *   (c) the part assembles, has no blocking flag, and the rule engine finds a
 *       valid build (any other flag sends it to Jayson)
 * Everything else stays "pending" for Jayson in review.md. Human decisions
 * already in decisions.json are never overwritten.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { fullCatalog } from "@/data";

import { batchPaths, CATALOG_DIR, parseArgs, readCandidates, readJson, requireArg, writeJson } from "./lib/batch";
import { compareCandidate, loadCachedProducts, type BlindFile } from "./lib/blind";
import { readGoldenCsv, toCsv } from "./lib/golden";
import { evaluateCandidate, mergeDecisions } from "./lib/review";
import { getVendor } from "./vendors";

const BLIND_DIR = join(CATALOG_DIR, "blind");
const SPOT_CHECK_SEED = 20261128;

/** Small seeded PRNG so the spot-check sample is reproducible. */
function seededShuffle<T>(items: T[], seed: number): T[] {
  let s = seed >>> 0;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function main() {
  const args = parseArgs();
  const batchId = requireArg(args, "batch");
  const paths = batchPaths(batchId);
  const file = readCandidates(batchId);
  const vendor = getVendor(file.vendorId);
  const products = loadCachedProducts(new URL(vendor.baseUrl).hostname);
  const blindPath = join(BLIND_DIR, `${batchId}.json`);
  const blind = readJson<BlindFile>(blindPath);
  const context = { vendorName: vendor.name, checkedAt: file.createdAt, batchId };
  // Compare with everything except this batch's own earlier approvals (else a
  // part is a "duplicate" of itself once approved).
  const existingOutsideBatch = fullCatalog.filter((part) => part.metadata?.importBatch !== batchId);

  const results = Object.entries(blind).map(([key, answers]) => {
    const candidate = file.candidates.find((c) => c.key === key);
    if (!candidate) throw new Error(`Blind answer for unknown key ${key}`);
    const comparison = compareCandidate(candidate, answers, products.get(key.split(":")[1]));
    const evaluated = evaluateCandidate(candidate, existingOutsideBatch, context);
    const blocking = evaluated.flags.some((f) => f.severity === "block");
    const assembles = evaluated.missing.length === 0 && evaluated.errors.length === 0;
    const flagged = evaluated.flags.length > 0;
    const reasons = [
      ...(comparison.allAgree ? [] : comparison.rows.filter((r) => !r.agree).map((r) => `${r.field}: importer "${r.importer || "unknown"}" vs blind "${r.blind || "unknown"}"`)),
      ...(comparison.allQuotesOk ? [] : comparison.rows.filter((r) => !r.quoteOk).map((r) => `${r.field}: blind quote not on page`)),
      ...(assembles ? [] : [`missing ${evaluated.missing.join(", ") || "values"}`]),
      ...(blocking ? evaluated.flags.filter((f) => f.severity === "block").map((f) => f.message) : []),
      ...(!blocking && flagged ? evaluated.flags.map((f) => `${f.check}: ${f.message}`) : []),
    ];
    const autoApprove = comparison.allAgree && comparison.allQuotesOk && assembles && !flagged;
    return { key, candidate, comparison, evaluated, autoApprove, reasons };
  });

  // Per-field agreement.
  const byField = new Map<string, { agree: number; total: number; page: number }>();
  for (const r of results) {
    for (const row of r.comparison.rows) {
      const s = byField.get(row.field) ?? { agree: 0, total: 0, page: 0 };
      s.total++;
      if (row.agree) s.agree++;
      if (row.basis === "page") s.page++;
      byField.set(row.field, s);
    }
  }
  const auto = results.filter((r) => r.autoApprove);
  const autoParts = auto.reduce((n, r) => n + r.evaluated.parts.length, 0);
  console.log(`${results.length} products in the blind pass: ${auto.length} meet the auto-approval rule (${autoParts} catalogue parts); ${results.length - auto.length} go to Jayson.`);
  for (const [field, s] of [...byField].sort()) console.log(`  ${field.padEnd(24)} agree ${s.agree}/${s.total}`);
  for (const r of results.filter((x) => !x.autoApprove)) console.log(`  → Jayson: ${r.key}: ${r.reasons.join("; ")}`);

  writeJson(join(BLIND_DIR, `${batchId}-results.json`), results.map((r) => ({ key: r.key, autoApprove: r.autoApprove, reasons: r.reasons, parts: r.evaluated.parts.map((p) => p.id), fields: r.comparison.rows })));

  if (args.apply) {
    const decisions = mergeDecisions(batchId, file.candidates, existsSync(paths.decisions) ? readJson(paths.decisions) : undefined);
    let applied = 0;
    for (const r of auto) {
      const existing = decisions.parts[r.key];
      if (existing.decision !== "pending" && !existing.auto) continue; // a human decision wins
      decisions.parts[r.key] = {
        ...existing,
        decision: "approve",
        auto: true,
        note: `auto-approved (HQ rule): independent in-session pass agreed on all ${r.comparison.rows.length} fields; page quotes verified; rule engine found a valid build`,
      };
      applied++;
    }
    // An earlier auto-approval that no longer meets the rule (e.g. after a
    // rule change) goes back to Jayson. Human decisions are never touched.
    let withdrawn = 0;
    for (const r of results.filter((x) => !x.autoApprove)) {
      const existing = decisions.parts[r.key];
      if (existing?.auto && existing.decision === "approve") {
        decisions.parts[r.key] = { ...existing, decision: "pending", auto: false, note: `auto-approval withdrawn: ${r.reasons.join("; ")}` };
        withdrawn++;
      }
    }
    if (withdrawn) console.log(`Withdrew ${withdrawn} earlier auto-approvals that no longer meet the rule.`);

    // HQ: switches whose page gives no sound profile stay unknown and are
    // listed for HQ research (WS1 is making sure unknowns cannot win ranking).
    const needsSound = auto
      .flatMap((r) => r.evaluated.parts)
      .filter((p) => p.category === "switch" && !p.soundProfile && !decisions.parts[`${file.vendorId}:${(p.metadata?.sourceUrl as string).split("/products/")[1]}`]?.fixes.soundProfile);
    writeFileSync(
      join(BLIND_DIR, `${batchId}-needs-sound.md`),
      [
        `# Approved switches with no sound profile (batch \`${batchId}\`)`,
        "",
        "The product page does not state a sound profile, so it is left unknown. For HQ research: add `fixes.soundProfile` plus `soundSource` in decisions.json, then re-run apply-approved.",
        "",
        ...(needsSound.length ? needsSound.map((p) => `- \`${p.id}\` · [source](${p.metadata?.sourceUrl as string})`) : ["(none)"]),
        "",
      ].join("\n"),
    );
    console.log(`Switches needing a sound profile: ${needsSound.length}`);
    writeJson(paths.decisions, decisions);

    const sample = seededShuffle(auto, SPOT_CHECK_SEED).slice(0, 10);
    const lines = [
      `# Spot-check: 10 auto-approved products (batch \`${batchId}\`)`,
      "",
      `Picked at random from ${auto.length} auto-approved products (seeded shuffle, seed ${SPOT_CHECK_SEED}, reproducible). Open each source page and check the values. If any is wrong, set that product's \`decision\` to \`pending\` or \`reject\` in decisions.json (and add a fix), then tell me: one wrong value means the auto-approval rule needs tightening.`,
      "",
    ];
    for (const r of sample) {
      lines.push(`## ${String(r.candidate.fields.name.value)}`, "", `[source](${r.candidate.sourceUrl}) · becomes ${r.evaluated.parts.map((p) => `\`${p.id}\``).join(", ")}`, "", "| field | value | how | page quote |", "|---|---|---|---|");
      for (const row of r.comparison.rows) lines.push(`| ${row.field} | ${row.importer || "unknown"} | ${row.basis} | ${row.quote.replace(/\|/g, "\\|").slice(0, 140)} |`);
      lines.push("");
    }
    writeFileSync(join(BLIND_DIR, `${batchId}-spot-check.md`), `${lines.join("\n")}\n`);
    console.log(`\nAuto-approved ${applied} products in decisions.json; spot-check list: ${join(BLIND_DIR, `${batchId}-spot-check.md`)}`);
  }

  if (args.golden) {
    const csvPath = join(CATALOG_DIR, "golden", "golden-20.csv");
    const rows = readGoldenCsv(readFileSync(csvPath, "utf8"));
    let filled = 0;
    for (const row of rows) {
      const r = results.find((x) => x.key === row.key);
      const cmp = r?.comparison.rows.find((c) => c.field === row.field);
      if (!cmp) continue;
      row.correctValue = cmp.blind;
      filled++;
    }
    writeFileSync(csvPath, toCsv(rows));
    console.log(`Filled ${filled}/${rows.length} golden cells from the blind pass.`);
  }
}

main();
