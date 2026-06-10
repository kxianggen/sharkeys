#!/usr/bin/env tsx

/**
 * Sharkeys eval runner — Phase 1B baseline
 *
 * Runs all three eval suites against the deterministic keyword fallback
 * (no OpenAI API key required). Records baseline metrics before Phase 2
 * semantic search improvements.
 *
 * Usage:  npm run eval
 */

// Force keyword fallback for reproducible offline runs
delete process.env.OPENAI_API_KEY;

import {
  intentExtractionEvalCases,
  type IntentExtractionTestCase,
} from "@/lib/eval/intent-extraction-eval";
import {
  keybotGroundingEvalCases,
  type KeybotGroundingTestCase,
} from "@/lib/eval/keybot-grounding-eval";
import {
  ragRetrievalEvalCases,
  type RagRetrievalTestCase,
} from "@/lib/eval/rag-retrieval-eval";
import { extractKeyboardIntent } from "@/lib/ai";
import { prepareIntentMatches } from "@/lib/ai";
import { generateKeybotResponse } from "@/lib/keybot";
import { keyboardComponents } from "@/data";
import { getComponentById } from "@/lib/components";
import type { BudgetIntent, ExtractedKeyboardIntent } from "@/lib/ai";

// ── ANSI colours ─────────────────────────────────────────────────────────────

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

// ── Result types ──────────────────────────────────────────────────────────────

type Status = "pass" | "fail" | "expected_fail" | "pending";

interface CaseResult {
  id: string;
  status: Status;
  notes: string[];
}

// ── Suite 1: Intent Extraction ────────────────────────────────────────────────

async function runIntentExtractionSuite(): Promise<CaseResult[]> {
  const results: CaseResult[] = [];

  for (const tc of intentExtractionEvalCases) {
    const extraction = await extractKeyboardIntent({ message: tc.input });
    const actual = extraction.intent;
    const failures: string[] = [];

    checkIntentField("soundProfile", tc, actual, failures);
    checkIntentField("useCase", tc, actual, failures);
    checkIntentField("layout", tc, actual, failures);
    checkBudget(tc, actual, failures);

    results.push({
      id: tc.id,
      status: failures.length === 0 ? "pass" : "fail",
      notes: failures,
    });
  }

  return results;
}

function checkIntentField(
  field: "soundProfile" | "useCase" | "layout",
  tc: IntentExtractionTestCase,
  actual: ExtractedKeyboardIntent,
  failures: string[],
) {
  const expected = tc.expectedIntent[field];
  if (expected === undefined) return;
  if (actual[field] !== expected) {
    failures.push(`${field}: expected "${expected}", got "${actual[field]}"`);
  }
}

function checkBudget(
  tc: IntentExtractionTestCase,
  actual: ExtractedKeyboardIntent,
  failures: string[],
) {
  const expected = tc.expectedIntent.budget as BudgetIntent | undefined;
  if (!expected) return;

  if (expected.amount !== null && expected.amount !== undefined) {
    if (actual.budget?.amount !== expected.amount) {
      failures.push(
        `budget.amount: expected ${expected.amount}, got ${actual.budget?.amount}`,
      );
    }
  }
  if (expected.currency !== null && expected.currency !== undefined) {
    if (actual.budget?.currency !== expected.currency) {
      failures.push(
        `budget.currency: expected "${expected.currency}", got "${actual.budget?.currency}"`,
      );
    }
  }
}

// ── Suite 2: Keybot Grounding ─────────────────────────────────────────────────

async function runKeybotGroundingSuite(): Promise<CaseResult[]> {
  const results: CaseResult[] = [];

  for (const tc of keybotGroundingEvalCases) {
    const response = await generateKeybotResponse(
      { message: tc.input },
      { catalogComponents: keyboardComponents },
    );
    const answer = response.answer.toLowerCase();
    const failures: string[] = [];

    const anyMatch = tc.mustContainAny.some((term) =>
      answer.includes(term.toLowerCase()),
    );
    if (!anyMatch) {
      failures.push(
        `answer missing all of: ${tc.mustContainAny.map((t) => `"${t}"`).join(", ")}`,
      );
    }

    for (const banned of tc.mustNotContain) {
      if (answer.includes(banned.toLowerCase())) {
        failures.push(`answer contains banned term: "${banned}"`);
      }
    }

    results.push({
      id: tc.id,
      status: failures.length === 0 ? "pass" : "fail",
      notes: failures,
    });
  }

  return results;
}

// ── Suite 3: RAG Retrieval ────────────────────────────────────────────────────

function runRagRetrievalSuite(): CaseResult[] {
  const results: CaseResult[] = [];

  for (const tc of ragRetrievalEvalCases) {
    if (tc.futureWhenSeeded) {
      results.push({ id: tc.id, status: "pending", notes: ["requires catalog seed"] });
      continue;
    }

    const preparation = prepareIntentMatches(tc.intent, keyboardComponents);
    const switchIds = preparation.candidateComponentIds.switch;
    const failures: string[] = [];
    const a = tc.assertions;

    if (a.switchCandidatesIncludeAny) {
      const found = a.switchCandidatesIncludeAny.some((id) => switchIds.includes(id));
      if (!found) {
        failures.push(
          `switch candidates missing all of: [${a.switchCandidatesIncludeAny.join(", ")}]` +
            ` — got [${switchIds.join(", ")}]`,
        );
      }
    }

    if (a.switchCandidatesSoundProfile) {
      const badSwitch = switchIds.find((id) => {
        const comp = getComponentById(id);
        return comp?.soundProfile !== a.switchCandidatesSoundProfile;
      });
      if (badSwitch) {
        const comp = getComponentById(badSwitch);
        failures.push(
          `switch "${badSwitch}" has soundProfile "${comp?.soundProfile}", expected "${a.switchCandidatesSoundProfile}"`,
        );
      }
      if (switchIds.length === 0) {
        failures.push(
          `no switch candidates returned for soundProfile "${a.switchCandidatesSoundProfile}"`,
        );
      }
    }

    if (a.switchCandidatesMinCount !== undefined) {
      if (switchIds.length < a.switchCandidatesMinCount) {
        failures.push(
          `switch candidates: expected ≥${a.switchCandidatesMinCount}, got ${switchIds.length}`,
        );
      }
    }

    if (a.allCategoriesPopulated) {
      const required = ["case", "pcb", "plate", "switch", "keycap", "stabilizer"] as const;
      for (const cat of required) {
        const ids = preparation.candidateComponentIds[cat];
        if (!ids || ids.length === 0) {
          failures.push(`category "${cat}" has no candidates`);
        }
      }
    }

    if (a.switchPriceMaxMYR !== undefined) {
      for (const id of switchIds) {
        const comp = getComponentById(id);
        if (comp?.price !== undefined && comp.price > a.switchPriceMaxMYR) {
          failures.push(
            `switch "${id}" price ${comp.price} MYR exceeds cap ${a.switchPriceMaxMYR}`,
          );
        }
      }
    }

    if (a.layoutCandidatesMatchLayout) {
      const targetLayout = a.layoutCandidatesMatchLayout;
      for (const cat of ["case", "pcb", "plate"] as const) {
        const ids = preparation.candidateComponentIds[cat];
        for (const id of ids) {
          const comp = getComponentById(id);
          const layouts = comp && "layouts" in comp
            ? (comp as { layouts?: string[] }).layouts
            : undefined;
          if (layouts && !layouts.includes(targetLayout)) {
            failures.push(
              `${cat} "${id}" layouts [${layouts.join(",")}] don't include "${targetLayout}"`,
            );
          }
        }
      }
    }

    const isExpectedFail = tc.semanticOnly === true;
    if (failures.length === 0) {
      results.push({ id: tc.id, status: "pass", notes: [] });
    } else if (isExpectedFail) {
      results.push({
        id: tc.id,
        status: "expected_fail",
        notes: failures,
      });
    } else {
      results.push({ id: tc.id, status: "fail", notes: failures });
    }
  }

  return results;
}

// ── Reporting ─────────────────────────────────────────────────────────────────

function printSuiteResults(title: string, results: CaseResult[]) {
  console.log(`\n${C.bold}${C.cyan}── ${title} ──${C.reset}`);

  let pass = 0, fail = 0, expectedFail = 0, pending = 0;

  for (const r of results) {
    switch (r.status) {
      case "pass":
        console.log(`  ${C.green}✓${C.reset} ${r.id}`);
        pass++;
        break;
      case "fail":
        console.log(`  ${C.red}✗${C.reset} ${r.id}`);
        for (const note of r.notes) {
          console.log(`      ${C.dim}${note}${C.reset}`);
        }
        fail++;
        break;
      case "expected_fail":
        console.log(`  ${C.yellow}~${C.reset} ${r.id} ${C.dim}(expected — semantic gap, needs Phase 2)${C.reset}`);
        for (const note of r.notes) {
          console.log(`      ${C.dim}${note}${C.reset}`);
        }
        expectedFail++;
        break;
      case "pending":
        console.log(`  ${C.dim}○ ${r.id} (pending — ${r.notes[0]})${C.reset}`);
        pending++;
        break;
    }
  }

  console.log(
    `\n  ${C.bold}${C.green}${pass} passed${C.reset}` +
    (fail > 0 ? `  ${C.bold}${C.red}${fail} failed${C.reset}` : "") +
    (expectedFail > 0 ? `  ${C.yellow}${expectedFail} expected-fail${C.reset}` : "") +
    (pending > 0 ? `  ${C.dim}${pending} pending${C.reset}` : ""),
  );

  return { pass, fail, expectedFail, pending };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${C.bold}Sharkeys Eval Runner — keyword-fallback baseline${C.reset}`);
  console.log(`${C.dim}OPENAI_API_KEY absent → deterministic fallback mode${C.reset}`);

  const [intentResults, keybotResults] = await Promise.all([
    runIntentExtractionSuite(),
    runKeybotGroundingSuite(),
  ]);
  const ragResults = runRagRetrievalSuite();

  const intentSummary = printSuiteResults(
    `Intent Extraction (${intentExtractionEvalCases.length} cases)`,
    intentResults,
  );
  const keybotSummary = printSuiteResults(
    `Keybot Grounding (${keybotGroundingEvalCases.length} cases)`,
    keybotResults,
  );
  const ragSummary = printSuiteResults(
    `RAG Retrieval (${ragRetrievalEvalCases.length} cases)`,
    ragResults,
  );

  const totalFail = intentSummary.fail + keybotSummary.fail + ragSummary.fail;
  const totalPass =
    intentSummary.pass + keybotSummary.pass + ragSummary.pass;
  const totalExpectedFail =
    intentSummary.expectedFail +
    keybotSummary.expectedFail +
    ragSummary.expectedFail;
  const totalPending =
    intentSummary.pending + keybotSummary.pending + ragSummary.pending;

  console.log(
    `\n${C.bold}Total: ${C.green}${totalPass} pass${C.reset}` +
    (totalFail > 0 ? `  ${C.bold}${C.red}${totalFail} fail${C.reset}` : "") +
    `  ${C.yellow}${totalExpectedFail} expected-fail${C.reset}` +
    `  ${C.dim}${totalPending} pending${C.reset}\n`,
  );

  if (totalFail > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
