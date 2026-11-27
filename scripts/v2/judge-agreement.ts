#!/usr/bin/env tsx
/**
 * Judge calibration (v2 WS0): how often does the AI judge agree with Jayson?
 *
 * Step 1, export (free): pick N finished sessions from a run, write them as
 * readable markdown WITHOUT the judge's verdict (so the human grades blind),
 * plus a grade sheet to fill in.
 *   npx tsx --tsconfig tsconfig.json scripts/v2/judge-agreement.ts export --run eval/v2/runs/<dir> --count 15
 *
 * Step 2: Jayson fills eval/v2/calibration/grades.json (success true/false,
 * turnsToSuccess, confusion 1-5) by reading eval/v2/calibration/*.md.
 *
 * Step 3, score (free): compare.
 *   npx tsx --tsconfig tsconfig.json scripts/v2/judge-agreement.ts score --run eval/v2/runs/<dir>
 *
 * The headline number is agreement on success (the brief's 80% bar).
 * Confusion within ±1 and exact turn count are reported as secondary.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { renderTranscript } from "./lib/judge";
import { loadPersonas } from "./lib/persona";
import { pct, ratio } from "./lib/stats";
import type { SessionRecord } from "./simulate";

const CAL_DIR = join("eval", "v2", "calibration");
const GRADES_PATH = join(CAL_DIR, "grades.json");

type Grade = {
  key: string;
  success: boolean | null;
  turnsToSuccess: number | null;
  confusion: number | null;
  notes: string;
};

const { positionals, values: args } = parseArgs({
  allowPositionals: true,
  options: {
    run: { type: "string" },
    count: { type: "string", default: "15" },
  },
});

function loadSessions(runDir: string): SessionRecord[] {
  return readFileSync(join(runDir, "sessions.jsonl"), "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => JSON.parse(l) as SessionRecord);
}

const keyOf = (s: SessionRecord) => `${s.personaId}-run${s.run}`;

function exportForGrading(runDir: string, count: number) {
  const personas = new Map(loadPersonas().personas.map((p) => [p.id, p]));
  const sessions = loadSessions(runDir).filter((s) => s.verdict);
  // One per persona first, so the sample covers every kind of user.
  const byPersona = new Map<string, SessionRecord[]>();
  for (const s of sessions) byPersona.set(s.personaId, [...(byPersona.get(s.personaId) ?? []), s]);
  const picked: SessionRecord[] = [];
  for (let i = 0; picked.length < count && picked.length < sessions.length; i++) {
    for (const list of byPersona.values()) if (list[i] && picked.length < count) picked.push(list[i]);
  }

  mkdirSync(CAL_DIR, { recursive: true });
  if (existsSync(GRADES_PATH)) {
    console.error(`${GRADES_PATH} already exists; not overwriting your grades.`);
    process.exit(1);
  }
  const grades: Grade[] = [];
  for (const s of picked) {
    const p = personas.get(s.personaId)!;
    const md = [
      `# ${keyOf(s)}`,
      "",
      `**Customer goal:** ${p.sessionGoal}`,
      `**Satisfied when:** ${p.satisfiedWhen}`,
      `**What the catalogue can honestly offer:** ${p.catalogueFit}. ${p.catalogueNote}`,
      "",
      "Grade in grades.json: success (true/false), turnsToSuccess (turn number or null), confusion (1 clear … 5 unusable).",
      "",
      "```",
      renderTranscript(s.turns, s.endedWith),
      "```",
    ].join("\n");
    writeFileSync(join(CAL_DIR, `${keyOf(s)}.md`), md);
    grades.push({ key: keyOf(s), success: null, turnsToSuccess: null, confusion: null, notes: "" });
  }
  writeFileSync(GRADES_PATH, JSON.stringify(grades, null, 2) + "\n");
  console.log(`Exported ${picked.length} transcripts to ${CAL_DIR}. Fill in ${GRADES_PATH}, then run "score".`);
}

function score(runDir: string) {
  const grades = (JSON.parse(readFileSync(GRADES_PATH, "utf8")) as Grade[]).filter(
    (g) => g.success !== null,
  );
  const sessions = new Map(loadSessions(runDir).map((s) => [keyOf(s), s]));

  let successAgree = 0, confusionClose = 0, confusionN = 0, turnsExact = 0, turnsN = 0;
  const disagreements: string[] = [];
  for (const g of grades) {
    const v = sessions.get(g.key)?.verdict;
    if (!v) continue;
    if (v.success === g.success) successAgree++;
    else disagreements.push(`- ${g.key}: you ${g.success ? "success" : "fail"}, judge ${v.success ? "success" : "fail"} (${v.successReason})${g.notes ? `; your note: ${g.notes}` : ""}`);
    if (g.confusion !== null) {
      confusionN++;
      if (Math.abs(g.confusion - v.confusion) <= 1) confusionClose++;
    }
    if (g.success && v.success && g.turnsToSuccess !== null) {
      turnsN++;
      if (g.turnsToSuccess === v.turnsToSuccess) turnsExact++;
    }
  }
  const agreement = ratio(successAgree, grades.length);
  const report = [
    `# Judge agreement (${new Date().toISOString().slice(0, 10)})`,
    "",
    `Run: \`${runDir}\` · graded transcripts: ${grades.length}`,
    "",
    `| measure | agreement |`,
    `|---|---|`,
    `| **success yes/no** (bar: 80%) | **${pct(agreement)}** (${successAgree}/${grades.length}) |`,
    `| confusion within ±1 | ${pct(ratio(confusionClose, confusionN))} (${confusionClose}/${confusionN}) |`,
    `| turns to success, exact (both said success) | ${pct(ratio(turnsExact, turnsN))} (${turnsExact}/${turnsN}) |`,
    "",
    agreement !== null && agreement < 0.8
      ? "**Below 80%: tighten the rubric (bump RUBRIC_VERSION), re-judge, re-score.**"
      : "Meets the 80% bar.",
    "",
    "## Disagreements",
    "",
    disagreements.length ? disagreements.join("\n") : "None.",
  ].join("\n");
  writeFileSync(join(CAL_DIR, "agreement.md"), report + "\n");
  console.log(report);
}

const runDir = args.run;
if (!runDir) {
  console.error("Pass --run eval/v2/runs/<dir>");
  process.exit(1);
}
if (positionals[0] === "export") exportForGrading(runDir, Number(args.count));
else if (positionals[0] === "score") score(runDir);
else {
  console.error('Usage: judge-agreement.ts export|score --run <dir>');
  process.exit(1);
}
