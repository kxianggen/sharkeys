/**
 * Messy test set: row schema and loader (v2 WS0).
 *
 * eval/v2/messy-set.jsonl holds one labelled message per line. Rows with
 * split "test" are FROZEN: never use them as prompt examples, few-shot
 * examples or training data (WS1, WS5, anyone). Only "dev" rows may be tuned on.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

import { z } from "zod";

export const MESSY_SET_PATH = "eval/v2/messy-set.jsonl";
export const TEST_HASH_PATH = "eval/v2/TEST.sha256";

const route = z.enum([
  "build_request",
  "capability_help",
  "compatibility_question",
  "component_question",
  "concept_question",
  "comparison_followup",
  "cost_reduction",
  "followup_compatibility",
  "followup_explanation",
  "refinement_request",
  "small_talk",
  "switch_explanation",
  "vague_question",
]);

export const messyRowSchema = z
  .object({
    id: z.string().regex(/^m\d{3}$/),
    personaId: z.string().min(1),
    split: z.enum(["test", "dev"]),
    entryPoint: z.enum(["search", "followup"]),
    /** Follow-up rows only: a short summary of the build on screen. */
    context: z.string().min(1).nullable(),
    text: z.string().min(1).max(2000),
    /** Scored on follow-up rows only (HQ decision). */
    expectedRoute: route.nullable(),
    /** Scored on search rows only. null = the message doesn't say. */
    expectedIntent: z
      .object({
        layout: z.enum(["60", "65", "75", "tkl", "full"]).nullable(),
        budgetRM: z.number().nonnegative().nullable(),
        soundProfile: z.enum(["thocky", "creamy", "clacky", "silent", "neutral"]).nullable(),
        colour: z.array(z.string()).nullable(),
        useCase: z.enum(["gaming", "typing", "office", "programming", "travel", "mixed", "unknown"]),
        connection: z.enum(["wired", "wireless"]).nullable(),
      })
      .strict()
      .nullable(),
    buildShouldExist: z.boolean().nullable(),
    isTrap: z.boolean(),
    trapKind: z.enum(["not_in_catalogue", "impossible_combo", "prompt_injection"]).nullable(),
    notes: z.string(),
  })
  .strict()
  .superRefine((row, ctx) => {
    if (row.entryPoint === "followup" && (!row.context || !row.expectedRoute)) {
      ctx.addIssue({ code: "custom", message: `${row.id}: follow-up rows need context and expectedRoute` });
    }
    if (row.entryPoint === "search" && !row.expectedIntent) {
      ctx.addIssue({ code: "custom", message: `${row.id}: search rows need expectedIntent` });
    }
    if (row.isTrap !== (row.trapKind !== null)) {
      ctx.addIssue({ code: "custom", message: `${row.id}: isTrap and trapKind disagree` });
    }
  });

export type MessyRow = z.infer<typeof messyRowSchema>;

export function loadMessySet(path = MESSY_SET_PATH): MessyRow[] {
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, i) => {
      try {
        return messyRowSchema.parse(JSON.parse(line));
      } catch (error) {
        throw new Error(`messy-set line ${i + 1}: ${(error as Error).message}`);
      }
    });
}

/** Stable hash of the TEST rows only, so DEV can change without unfreezing TEST. */
export function hashTestRows(rows: readonly MessyRow[]): string {
  const canonical = rows
    .filter((r) => r.split === "test")
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((r) => JSON.stringify(r))
    .join("\n");
  return createHash("sha256").update(canonical).digest("hex");
}
