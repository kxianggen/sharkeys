#!/usr/bin/env tsx
/**
 * CI gate for the offline eval (v2 WS0).
 *
 * `npm run eval` exits 1 whenever any case fails, and two cases are known to
 * fail today, so CI cannot use its exit code directly. This wrapper runs the
 * eval with EVAL_JSON_OUT, then:
 *   - passes if every failure is listed in eval/known-failures.json
 *   - fails if there is any NEW failure
 *   - reports known failures that now pass, so the list can be trimmed
 *
 * It writes a markdown summary to ci-eval-summary.md (and to the GitHub job
 * summary when running in Actions). Needs no API keys: the eval deletes
 * OPENAI_API_KEY in offline mode.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/v2/ci-eval.ts
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

type EvalOutput = {
  totals: { pass: number; fail: number; expectedFail: number; pending: number };
  results: { id: string; status: string; notes: string[] }[];
};

const known = new Set<string>(
  JSON.parse(readFileSync("eval/known-failures.json", "utf8")).knownFailures,
);

const outFile = join(mkdtempSync(join(tmpdir(), "sharkeys-eval-")), "eval.json");
const run = spawnSync("npm", ["run", "eval"], {
  env: {
    ...process.env,
    EVAL_JSON_OUT: outFile,
    EVAL_SEMANTIC: "false",
    // v2 WS2: the known-failures list was recorded on the frozen 61-part
    // catalogue, so the gate runs there unless a caller asks for "full".
    SHARKEYS_CATALOG: process.env.SHARKEYS_CATALOG ?? "frozen",
  },
  stdio: "inherit",
  shell: true,
});

let output: EvalOutput;
try {
  output = JSON.parse(readFileSync(outFile, "utf8"));
} catch {
  console.error(`Eval did not produce results (exit code ${run.status}).`);
  process.exit(1);
}

const failed = output.results.filter((r) => r.status === "fail").map((r) => r.id);
const newFailures = failed.filter((id) => !known.has(id));
const nowPassing = [...known].filter((id) => !failed.includes(id));
const ok = newFailures.length === 0;

const t = output.totals;
const lines = [
  `### Offline eval: ${ok ? "✅ no new failures" : "❌ new failures"}`,
  "",
  `${t.pass} pass · ${t.fail} fail (${t.fail - newFailures.length} known) · ${t.expectedFail} expected-fail · ${t.pending} pending`,
];
if (newFailures.length > 0) {
  lines.push("", "**New failures:**");
  for (const id of newFailures) {
    const notes = output.results.find((r) => r.id === id)?.notes ?? [];
    lines.push(`- \`${id}\`: ${notes.join("; ")}`);
  }
}
if (nowPassing.length > 0) {
  lines.push(
    "",
    `**Known failures now passing** (remove from eval/known-failures.json): ${nowPassing.map((id) => `\`${id}\``).join(", ")}`,
  );
}
const summary = lines.join("\n") + "\n";

writeFileSync("ci-eval-summary.md", summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}
console.log("\n" + summary);
process.exit(ok ? 0 : 1);
