#!/usr/bin/env tsx
/**
 * Simulated-user runner (v2 WS0).
 *
 * For each persona, gpt-4.1-mini plays the customer against the REAL app on
 * the local dev server (npm run dev) for up to 8 turns. Every session is then
 * graded by the judge (lib/judge.ts), and checked by code for invented parts
 * and for the persona's hard requirements.
 *
 * COSTS MONEY: persona + judge calls, plus the app's own OpenAI calls.
 * It prints an estimate first and refuses to run above --max-cost (default
 * USD 0.50) unless --confirm-cost is passed.
 *
 * Usage:
 *   npx tsx --tsconfig tsconfig.json scripts/v2/simulate.ts --label pilot --limit 5 --dry-run
 *   npx tsx --tsconfig tsconfig.json scripts/v2/simulate.ts --label pilot --limit 5
 *   npx tsx --tsconfig tsconfig.json scripts/v2/simulate.ts --label baseline --runs 1
 * Options:
 *   --personas p01-budget-student,p03-gamer   only these personas
 *   --limit N        first N personas (pilot)
 *   --runs N         repeats per persona (default 1)
 *   --max-turns N    default 8
 *   --base-url URL   default http://localhost:3000
 *   --app-cost-per-turn USD   estimate of the app's own OpenAI cost per turn
 *                    (default 0.003; replace with the pilot's measured value)
 *   --max-cost USD   default 0.50
 *   --confirm-cost   allow a run estimated above --max-cost
 *   --dry-run        print the estimate and exit
 */
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { execSync } from "node:child_process";

import OpenAI from "openai";

import { keyboardComponents } from "@/data";
import { getKeycapColours } from "@/lib/recommendations/refine";

import { loadEnvFile } from "../load-env-file";
import {
  buildFacts,
  checkHardRequirements,
  describeScreen,
  emptyAppState,
  sendChat,
  sendPhoto,
  sendRefine,
  sendSearch,
  type AppCallRecord,
  type AppReply,
  type BuildFacts,
} from "./lib/app-client";
import { checkInventedParts, type PossibleFlag } from "./lib/invented-parts";
import {
  judgeTranscript,
  renderTranscript,
  RUBRIC_VERSION,
  type JudgeVerdict,
  type TranscriptTurn,
} from "./lib/judge";
import {
  loadPersonas,
  nextPersonaAction,
  personaSystemPrompt,
  SIM_MODEL,
  type Persona,
} from "./lib/persona";
import { addUsage, costUSD, zeroUsage, type TokenUsage } from "./lib/pricing";

loadEnvFile();

const { values: args } = parseArgs({
  options: {
    label: { type: "string", default: "run" },
    personas: { type: "string" },
    limit: { type: "string" },
    runs: { type: "string", default: "1" },
    "max-turns": { type: "string", default: "8" },
    "base-url": { type: "string", default: "http://localhost:3000" },
    "app-cost-per-turn": { type: "string", default: "0.003" },
    "max-cost": { type: "string", default: "0.50" },
    "confirm-cost": { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
  },
});

const MAX_TURNS = Number(args["max-turns"]);
const RUNS = Number(args.runs);
const BASE_URL = args["base-url"]!.replace(/\/$/, "");
const APP_COST_PER_TURN = Number(args["app-cost-per-turn"]);
const MAX_COST = Number(args["max-cost"]);

// Per-session token estimate for persona + judge, worst case (all 8 turns).
// Replace with measured numbers after the pilot (see summary.json).
const EST_PERSONA_TOKENS_PER_TURN = { inputTokens: 2_400, cachedInputTokens: 0, outputTokens: 110 };
const EST_JUDGE_TOKENS = { inputTokens: 5_000, cachedInputTokens: 0, outputTokens: 300 };

export type SessionRecord = {
  personaId: string;
  run: number;
  rubricVersion: string;
  turns: (TranscriptTurn & {
    calls: AppCallRecord[];
    personaThought: string;
    returnedIds: string[];
  })[];
  endedWith: "accept" | "give_up" | "max_turns" | "error";
  acceptedBuild: BuildFacts | null;
  hardRequirements: { pass: boolean; failures: string[] };
  invented: { unknownIds: string[]; possible: (PossibleFlag & { turn: number })[] };
  verdict: JudgeVerdict | null;
  usage: { persona: TokenUsage; judge: TokenUsage };
  costUSD: { persona: number; judge: number; appEstimate: number };
  appSources: string[];
  error?: string;
};

function selectPersonas(all: Persona[]): Persona[] {
  let chosen = all;
  if (args.personas) {
    const wanted = new Set(args.personas.split(",").map((s) => s.trim()));
    chosen = all.filter((p) => wanted.has(p.id));
  }
  if (args.limit) chosen = chosen.slice(0, Number(args.limit));
  return chosen;
}

function estimate(sessions: number) {
  const personaPerSession = costUSD({
    inputTokens: EST_PERSONA_TOKENS_PER_TURN.inputTokens * MAX_TURNS,
    cachedInputTokens: 0,
    outputTokens: EST_PERSONA_TOKENS_PER_TURN.outputTokens * MAX_TURNS,
  });
  const judgePerSession = costUSD(EST_JUDGE_TOKENS);
  const appPerSession = APP_COST_PER_TURN * MAX_TURNS;
  const perSession = personaPerSession + judgePerSession + appPerSession;
  return { personaPerSession, judgePerSession, appPerSession, perSession, total: perSession * sessions };
}

async function checkServer() {
  try {
    const r = await fetch(`${BASE_URL}/api/components?category=case`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
  } catch (error) {
    throw new Error(
      `Dev server not reachable at ${BASE_URL} (${(error as Error).message}). Start it with npm run dev.`,
    );
  }
}

const catalogue = keyboardComponents.map((c) => ({ id: c.id, name: c.name, brand: c.brand }));
// "Different colour" only offers colours some keycap actually has (as in the UI).
const keycapColours = getKeycapColours(keyboardComponents);

async function runSession(
  client: OpenAI,
  persona: Persona,
  rules: string[],
  run: number,
): Promise<SessionRecord> {
  const system = personaSystemPrompt(persona, rules, MAX_TURNS);
  const state = emptyAppState();
  const history: { role: "user" | "assistant"; content: string }[] = [];
  const turns: SessionRecord["turns"] = [];
  const possible: SessionRecord["invented"]["possible"] = [];
  const unknownIds = new Set<string>();
  let personaUsage = zeroUsage();
  let endedWith: SessionRecord["endedWith"] = "max_turns";
  let acceptedBuild: BuildFacts | null = null;
  let error: string | undefined;
  const userTexts: string[] = [];

  let screenNote =
    "You just opened the Sharkeys configurator. Nothing on screen yet." +
    (persona.startsWith === "photo" ? " You have your saved photo ready to upload." : "");

  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    history.push({ role: "user", content: `[Turn ${turn} of ${MAX_TURNS}]\n${screenNote}` });

    let action;
    try {
      const next = await nextPersonaAction({ client, system, history });
      action = next.action;
      personaUsage = addUsage(personaUsage, next.usage);
    } catch (e) {
      endedWith = "error";
      error = `persona: ${(e as Error).message}`;
      break;
    }
    history.push({ role: "assistant", content: JSON.stringify({ action: action.action, message: action.message }) });

    if (action.action === "accept") {
      const idx = Math.max(1, action.acceptBuild ?? 1) - 1;
      const build = state.result?.recommendations[idx];
      acceptedBuild = build ? buildFacts(build) : null;
      endedWith = "accept";
      turns.push({ turn, action: "accept", userMessage: `accepts build ${idx + 1}`, appReply: "-", screen: describeScreen(state), calls: [], personaThought: action.privateThought, returnedIds: [] });
      break;
    }
    if (action.action === "give_up") {
      endedWith = "give_up";
      turns.push({ turn, action: "give_up", userMessage: action.message || "(leaves)", appReply: "-", screen: describeScreen(state), calls: [], personaThought: action.privateThought, returnedIds: [] });
      break;
    }

    userTexts.push(action.message);
    let reply: AppReply;
    try {
      if (action.action === "photo" && persona.photo) {
        reply = await sendPhoto(BASE_URL, state, persona.photo, action.message);
      } else if (action.action === "refine") {
        // v2 WS4 chip click: no typing, no AI call on the app side.
        reply = action.chip
          ? await sendRefine(BASE_URL, state, action.chip, keycapColours)
          : { text: "(No button was clicked.)", calls: [], returnedIds: [], buildsChanged: false };
      } else if (action.action === "chat") {
        // Meg's panel also works before any search, exactly like the UI.
        reply = await sendChat(BASE_URL, state, action.message);
      } else {
        reply = await sendSearch(BASE_URL, state, action.message);
      }
    } catch (e) {
      endedWith = "error";
      error = `app: ${(e as Error).message}`;
      break;
    }

    const check = checkInventedParts({
      catalogue,
      returnedIds: reply.returnedIds,
      replyText: reply.text,
      userText: userTexts.join("\n"),
    });
    check.unknownIds.forEach((id) => unknownIds.add(id));
    check.possible.forEach((f) => possible.push({ ...f, turn }));

    const screen = describeScreen(state);
    turns.push({
      turn,
      action: action.action,
      userMessage:
        action.action === "refine" ? `clicks ${action.chip ?? "nothing"}` : action.message,
      appReply: reply.text,
      screen,
      calls: reply.calls,
      personaThought: action.privateThought,
      returnedIds: reply.returnedIds,
    });
    screenNote = `APP REPLY:\n${reply.text}\n\nBUILDS ON SCREEN:\n${screen}`;
  }

  const transcript = renderTranscript(turns, endedWith);
  let verdict: JudgeVerdict | null = null;
  let judgeUsage = zeroUsage();
  if (endedWith !== "error") {
    try {
      const judged = await judgeTranscript({ client, persona, transcript });
      verdict = judged.verdict;
      judgeUsage = judged.usage;
    } catch (e) {
      error = `judge: ${(e as Error).message}`;
    }
  }

  const appTurns = turns.filter((t) => t.calls.length > 0).length;
  return {
    personaId: persona.id,
    run,
    rubricVersion: RUBRIC_VERSION,
    turns,
    endedWith,
    acceptedBuild,
    hardRequirements: checkHardRequirements(persona.hardRequirements, acceptedBuild),
    invented: { unknownIds: [...unknownIds], possible },
    verdict,
    usage: { persona: personaUsage, judge: judgeUsage },
    costUSD: {
      persona: costUSD(personaUsage),
      judge: costUSD(judgeUsage),
      appEstimate: appTurns * APP_COST_PER_TURN,
    },
    appSources: [...new Set(turns.flatMap((t) => t.calls.map((c) => c.source ?? "?")))],
    error,
  };
}

function transcriptMarkdown(s: SessionRecord, persona: Persona): string {
  return [
    `# ${persona.id} · run ${s.run}`,
    "",
    `**Goal:** ${persona.sessionGoal}`,
    `**Satisfied when:** ${persona.satisfiedWhen}`,
    "",
    ...s.turns.flatMap((t) => [
      `## Turn ${t.turn} · ${t.action}`,
      "",
      `**Customer:** ${t.userMessage || "(no text)"}`,
      "",
      `**App:** ${t.appReply.replace(/\n/g, "  \n")}`,
      "",
      `**Screen:**  \n${t.screen.replace(/\n/g, "  \n")}`,
      "",
      `_persona thought: ${t.personaThought}_ · ${t.calls.map((c) => `${c.endpoint} ${c.ms} ms (${c.source ?? "?"})`).join(", ") || "no app call"}`,
      "",
    ]),
    `**Ended with:** ${s.endedWith}`,
  ].join("\n");
}

async function main() {
  const file = loadPersonas();
  const personas = selectPersonas(file.personas);
  const sessions = personas.length * RUNS;
  const est = estimate(sessions);

  console.log(`\nSimulated-user run "${args.label}": ${personas.length} personas × ${RUNS} run(s) = ${sessions} sessions, up to ${MAX_TURNS} turns each.`);
  console.log(`Models: persona + judge = ${SIM_MODEL}; app = whatever .env.local configures.`);
  console.log(
    `Estimated cost (worst case, every session uses all turns): USD ${est.total.toFixed(3)}` +
      `  [per session: persona ${est.personaPerSession.toFixed(4)} + judge ${est.judgePerSession.toFixed(4)} + app ~${est.appPerSession.toFixed(4)}]`,
  );

  if (args["dry-run"]) return;
  if (est.total > MAX_COST && !args["confirm-cost"]) {
    console.error(`\nStopping: the estimate is above USD ${MAX_COST.toFixed(2)}. Ask Jayson, then re-run with --confirm-cost.`);
    process.exit(2);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set (expected in .env.local).");
    process.exit(1);
  }
  await checkServer();

  const date = new Date().toISOString().slice(0, 10);
  const outDir = join("eval", "v2", "runs", `${date}-${args.label}`);
  mkdirSync(join(outDir, "transcripts"), { recursive: true });
  const sessionsPath = join(outDir, "sessions.jsonl");
  writeFileSync(sessionsPath, "");

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60_000, maxRetries: 2 });
  let spent = 0;

  for (const persona of personas) {
    for (let run = 1; run <= RUNS; run++) {
      process.stdout.write(`  ${persona.id} run ${run} … `);
      const s = await runSession(client, persona, file.globalStyleRules, run);
      appendFileSync(sessionsPath, JSON.stringify(s) + "\n");
      writeFileSync(join(outDir, "transcripts", `${persona.id}-run${run}.md`), transcriptMarkdown(s, persona));
      const c = s.costUSD.persona + s.costUSD.judge + s.costUSD.appEstimate;
      spent += c;
      console.log(
        `${s.endedWith}, ${s.turns.length} turns, judge ${s.verdict ? (s.verdict.success ? "SUCCESS" : "fail") : "n/a"}, code-check ${s.hardRequirements.pass ? "pass" : "fail"}, unknown IDs ${s.invented.unknownIds.length}, ~USD ${c.toFixed(4)}${s.error ? `  ERROR ${s.error}` : ""}`,
      );
      if (spent > MAX_COST && !args["confirm-cost"]) {
        console.error(`\nStopping early: running cost ~USD ${spent.toFixed(3)} passed the USD ${MAX_COST.toFixed(2)} cap.`);
        break;
      }
    }
  }

  let gitSha = "unknown";
  try {
    gitSha = execSync("git rev-parse --short HEAD").toString().trim();
  } catch {}
  writeFileSync(
    join(outDir, "run.json"),
    JSON.stringify(
      {
        label: args.label,
        date,
        gitSha,
        personas: personas.map((p) => p.id),
        runs: RUNS,
        maxTurns: MAX_TURNS,
        rubricVersion: RUBRIC_VERSION,
        simModel: SIM_MODEL,
        appCostPerTurnAssumed: APP_COST_PER_TURN,
        estimatedSpendUSD: Number(spent.toFixed(4)),
      },
      null,
      2,
    ),
  );
  console.log(`\nDone. ~USD ${spent.toFixed(3)} (persona + judge measured; app side estimated). Output: ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
