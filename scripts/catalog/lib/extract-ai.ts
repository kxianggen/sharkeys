/**
 * AI extraction (v2 WS2, subtask 2), for the fields that need reading rather
 * than parsing: mount type, switch technology, keycap profile, stabiliser
 * type, sound profile, beginner-friendliness and plate material.
 *
 * Safeguards against wrong specs:
 *   - only fields plain code could not read confidently are asked for
 *   - "unknown" is always an allowed answer, and the prompt asks for it
 *   - every value must quote its evidence; code checks the quote really is in
 *     the product text, and drops the value if not
 *   - if the AI contradicts a plain-code reading, the field becomes unknown
 *     (with a note) instead of either side winning
 *   - AI confidence is capped at 0.85, so the reviewer still sees it as AI
 */
import { z } from "zod";

import {
  AI_FIELDS,
  REQUIRED_FIELDS,
  REVIEW_FIELDS,
  UNKNOWN,
  known,
  unknown,
  type AiFieldName,
  type Candidate,
  type Field,
} from "./fields";
import { severalOptionsNote } from "./deterministic";
import { snippetAppearsIn } from "./text";

export const EXTRACTION_MODEL = "gpt-4.1-mini" as const;
export const AI_CONFIDENCE_CAP = 0.85;
/** Plain-code readings at or above this are not sent to the AI. */
export const ASK_BELOW_CONFIDENCE = 0.8;
export const MAX_SOURCE_CHARS = 6_000;

const evidence = z.string().describe("Exact words copied from the product text that prove the value. Empty string when unknown.");
const confidence = z.number().min(0).max(1).describe("How sure you are, 0 to 1.");

function enumField<T extends readonly [string, ...string[]]>(values: T) {
  return z.object({ value: z.enum([...values, "unknown"] as [string, ...string[]]), confidence, evidence });
}

const mountValues = ["gasket_mount", "top_mount", "tray_mount", "o_ring_mount"] as const;

export const aiExtractionSchema = z.object({
  mountSupport: z.object({
    values: z.array(z.enum(mountValues)).describe("Every mounting style the text states. Empty array when the text does not say."),
    confidence,
    evidence,
  }),
  switchTechnology: enumField(["mechanical", "optical", "hall_effect", "topre"] as const),
  keycapProfile: enumField(["cherry", "oem", "xda", "moa", "sa", "low_profile", "topre"] as const),
  stabilizerType: enumField(["plate_mount", "pcb_mount", "screw_in"] as const),
  soundProfile: enumField(["thocky", "creamy", "clacky", "silent", "neutral"] as const),
  beginnerFriendly: enumField(["yes", "no"] as const),
  plateMaterial: enumField(["polycarbonate", "fr4", "pom", "aluminum", "brass", "carbon_fiber", "pp"] as const),
});

export type AiExtraction = z.infer<typeof aiExtractionSchema>;

export const SYSTEM_PROMPT = `You fill in a fixed form about one mechanical-keyboard product for a parts catalogue, reading ONLY the product text given.

Rules:
- Answer "unknown" (or an empty array) unless the product text clearly states the value. Never guess from the brand, the price or general knowledge. A wrong value is much worse than "unknown".
- "evidence" must be words copied exactly from the product text. If you cannot quote it, the answer is "unknown".
- Only answer the fields listed under "Fields to fill"; put "unknown" for every other field.
- beginnerFriendly: "yes" only if the text says it is easy, beginner-friendly, plug-and-play or hot-swap with no soldering; "no" only if it says soldering, advanced or similar; otherwise "unknown".
- soundProfile: only when the text describes the sound (e.g. "thocky", "creamy", "clacky", "silent", "quiet"). "neutral" only if the text says balanced/neutral sound.
- switchTechnology: "hall_effect" for magnetic/Hall-effect, "optical" for optical, "mechanical" for normal MX-style linear/tactile/clicky switches.`;

export function fieldsToAsk(candidate: Candidate, requiredOnly = false): AiFieldName[] {
  const category = candidate.category.value;
  if (category === UNKNOWN) return [];
  const relevant = new Set<string>(requiredOnly ? REQUIRED_FIELDS[category] : REVIEW_FIELDS[category]);
  // Beginner-friendliness of switches, keycaps and stabilisers follows
  // Jayson's rule (deterministic.ts beginnerRule), so the AI is not asked.
  const ruled = category === "switch" || category === "keycap" || category === "stabilizer";
  return AI_FIELDS.filter((name) => {
    if (!relevant.has(name)) return false;
    if (name === "beginnerFriendly" && ruled) return false;
    if (candidate.notes.includes(severalOptionsNote(name))) return false;
    const field = candidate.fields[name];
    return field.value === UNKNOWN || field.confidence < ASK_BELOW_CONFIDENCE;
  });
}

export function buildUserPrompt(candidate: Candidate, fields: AiFieldName[]) {
  return `Part category: ${String(candidate.category.value)}
Fields to fill: ${fields.join(", ")}

Product text:
"""
${candidate.sourceText.slice(0, MAX_SOURCE_CHARS)}
"""`;
}

/** Rough pre-call estimate (≈4 characters per token), used for the dry run and the cost cap. */
export function estimateTokens(candidate: Candidate, fields: AiFieldName[]) {
  const input = Math.ceil((SYSTEM_PROMPT.length + buildUserPrompt(candidate, fields).length) / 4) + 450; // + schema
  const output = 260;
  return { input, output };
}

function sameValue(a: unknown, b: unknown) {
  if (Array.isArray(a) && Array.isArray(b)) return [...a].sort().join() === [...b].sort().join();
  return a === b;
}

/**
 * Merges the AI's answers into the candidate. Returns a new candidate; the
 * notes explain every answer that was dropped.
 */
export function mergeAiExtraction(candidate: Candidate, asked: AiFieldName[], extraction: AiExtraction): Candidate {
  const fields = { ...candidate.fields };
  const notes = [...candidate.notes];

  for (const name of asked) {
    // HQ rule: a field the page offers several options for stays unknown.
    if (candidate.notes.includes(severalOptionsNote(name))) continue;
    let value: unknown;
    let conf: number;
    let quote: string;
    if (name === "mountSupport") {
      const answer = extraction.mountSupport;
      value = answer.values.length ? [...new Set(answer.values)] : UNKNOWN;
      conf = answer.confidence;
      quote = answer.evidence;
    } else {
      const answer = extraction[name];
      value = answer.value;
      conf = answer.confidence;
      quote = answer.evidence;
      if (name === "beginnerFriendly" && value !== UNKNOWN) value = value === "yes";
    }

    if (value === UNKNOWN) continue;
    if (!snippetAppearsIn(quote, candidate.sourceText)) {
      notes.push(`AI said ${name} = ${JSON.stringify(value)} but its quote is not in the product text; left unknown`);
      continue;
    }
    const previous = candidate.fields[name] as Field<unknown>;
    if (previous.value !== UNKNOWN && !sameValue(previous.value, value)) {
      notes.push(`AI (${JSON.stringify(value)}) and plain code (${JSON.stringify(previous.value)}) disagree on ${name}; left unknown for you`);
      (fields as Record<string, Field<unknown>>)[name] = unknown();
      continue;
    }
    const capped = Math.min(conf, AI_CONFIDENCE_CAP);
    const merged =
      previous.value !== UNKNOWN
        ? known(value, Math.max(previous.confidence, capped), previous.source, previous.snippet) // agreement: keep the regex evidence
        : known(value, capped, "ai", quote);
    (fields as Record<string, Field<unknown>>)[name] = merged;
  }
  return { ...candidate, fields, notes };
}
