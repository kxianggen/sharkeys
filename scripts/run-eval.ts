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

// Load .env.local so EVAL_SEMANTIC=true can reach the live OpenAI + Supabase
// credentials. Guarded: process.loadEnvFile throws if the file is absent
// (e.g. CI), in which case we silently continue on the existing environment.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local — rely on the ambient environment (offline baseline / CI).
}

// EVAL_SEMANTIC=true  → keep the API key, enabling semantic (pgvector) search.
//                       rr-007 and rr-008 will pass when Supabase + OpenAI are live.
// EVAL_SEMANTIC=false → delete the key for a reproducible offline baseline.
const SEMANTIC_MODE = process.env.EVAL_SEMANTIC === "true";
if (!SEMANTIC_MODE) {
  delete process.env.OPENAI_API_KEY;
}

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
import { extractKeyboardIntent, prepareIntentMatchesAsync } from "@/lib/ai";
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
    checkColour(tc, actual, failures);

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

/**
 * Colour check (UAT finding 1).
 *
 * Additive by design: it reads tc.expectedColour, which none of the original
 * 30 intent cases declare, so their assertions are untouched — isolation by
 * construction rather than by convention.
 *
 * The temporary accessor this function used at Step 1 has been removed now
 * that extractedKeyboardIntentSchema carries colour: actual.colour is read
 * directly and type-checked.
 */
function checkColour(
  tc: IntentExtractionTestCase,
  actual: ExtractedKeyboardIntent,
  failures: string[],
) {
  // Not declared — skip. This is what isolates the pre-existing cases.
  if (tc.expectedColour === undefined) return;

  const found: readonly string[] = [...(actual.colour ?? [])].sort();

  // Declared null: a hallucination control. Absent, null and [] all count as
  // "no colour", since before the schema change the field does not exist at
  // all and afterwards an empty array is the honest representation.
  if (tc.expectedColour === null) {
    if (found.length > 0) {
      failures.push(
        `colour: expected none, got [${found.join(", ")}] — hallucinated on a colour-free prompt`,
      );
    }
    return;
  }

  // Widened to string[]: `found` is whatever the extractor returned, which is
  // not yet constrained to the vocabulary, so both sides must compare as
  // plain strings.
  const expected: readonly string[] = [...tc.expectedColour].sort();
  const missing = expected.filter((colour) => !found.includes(colour));

  if (missing.length > 0) {
    failures.push(
      `colour: missing [${missing.join(", ")}] — expected [${expected.join(", ")}], got ${
        found.length > 0 ? `[${found.join(", ")}]` : "none"
      }`,
    );
  }

  // Precision, asserted only where the correct answer is unambiguous.
  if ((tc.colourMatch ?? "contains") === "exact") {
    const extra = found.filter((colour) => !expected.includes(colour));

    if (extra.length > 0) {
      failures.push(
        `colour: unexpected [${extra.join(", ")}] — "${tc.input}" admits exactly [${expected.join(", ")}]`,
      );
    }
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

    for (const required of tc.mustContainAll ?? []) {
      if (!answer.includes(required.toLowerCase())) {
        failures.push(`answer missing required term: "${required}"`);
      }
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

async function runRagRetrievalSuite(): Promise<CaseResult[]> {
  const results: CaseResult[] = [];

  for (const tc of ragRetrievalEvalCases) {
    if (tc.futureWhenSeeded) {
      results.push({ id: tc.id, status: "pending", notes: ["requires catalog seed"] });
      continue;
    }

    const preparation = await prepareIntentMatchesAsync(tc.intent, keyboardComponents);
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
        console.log(`  ${C.yellow}~${C.reset} ${r.id} ${C.dim}(expected — semantic gap; run with EVAL_SEMANTIC=true after seeding)${C.reset}`);
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
  const modeLabel = SEMANTIC_MODE
    ? `${C.cyan}semantic mode${C.reset} (pgvector + OpenAI enabled)`
    : `${C.dim}offline baseline${C.reset} (keyword-fallback, no API key)`;

  console.log(`\n${C.bold}Sharkeys Eval Runner${C.reset} — ${modeLabel}`);

  const [intentResults, keybotResults, ragResults] = await Promise.all([
    runIntentExtractionSuite(),
    runKeybotGroundingSuite(),
    runRagRetrievalSuite(),
  ]);

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
