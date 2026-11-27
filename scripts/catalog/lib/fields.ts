/**
 * The importer's working form: one entry per catalogue field, each carrying
 * its value (or "unknown"), how sure we are, where the value came from and
 * the exact text it was read from. "unknown" is a first-class answer: wrong
 * compatibility data is worse than missing data.
 */
import type { ComponentCategory } from "@/lib/types";

export const UNKNOWN = "unknown" as const;
export type Unknown = typeof UNKNOWN;

/**
 * structured = store data · regex = plain-code reading of the text ·
 * ai = model reading, quote-checked · rule = Jayson's agreed rule ·
 * default = implied by another known value · reviewer = Jayson's fix.
 */
export type FieldSource = "structured" | "regex" | "ai" | "rule" | "reviewer" | "default";

export type Field<T> = {
  value: T | Unknown;
  /** 0–1. Structured data ≈ 0.95+, regex 0.6–0.9, AI as reported (capped), reviewer 1. */
  confidence: number;
  source: FieldSource;
  /** Verbatim text the value was read from (empty for "unknown"). */
  snippet: string;
};

export function known<T>(
  value: T,
  confidence: number,
  source: FieldSource,
  snippet: string,
): Field<T> {
  return { value, confidence, source, snippet };
}

export function unknown<T>(): Field<T> {
  return { value: UNKNOWN, confidence: 0, source: "default", snippet: "" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isKnown(field: Field<any> | undefined): boolean {
  return field !== undefined && field.value !== UNKNOWN;
}

/** Candidate categories; "kit" is split into case / pcb / plate / stabilizer later. */
export type CandidateCategory = ComponentCategory | "kit";

/** Every field the importer may fill. Which ones matter depends on the category. */
export type CandidateFields = {
  name: Field<string>;
  brand: Field<string>;
  description: Field<string>;
  price: Field<number>;
  imageUrl: Field<string>;
  layouts: Field<string[]>;
  mountSupport: Field<string[]>;
  switchTechnology: Field<string>;
  switchTechnologySupport: Field<string[]>;
  pinCount: Field<number>;
  actuationForceG: Field<number>;
  hotswap: Field<boolean>;
  connection: Field<string>;
  keycapProfile: Field<string>;
  stabilizerType: Field<string>;
  stabilizerTypeSupport: Field<string[]>;
  stabilizerSizes: Field<string[]>;
  soundProfile: Field<string>;
  beginnerFriendly: Field<boolean>;
  plateMaterial: Field<string>;
};

export type FieldName = keyof CandidateFields;

/** Fields the AI is allowed to fill (the ones that need reading, not parsing). */
export const AI_FIELDS = [
  "mountSupport",
  "switchTechnology",
  "keycapProfile",
  "stabilizerType",
  "soundProfile",
  "beginnerFriendly",
  "plateMaterial",
] as const satisfies readonly FieldName[];

export type AiFieldName = (typeof AI_FIELDS)[number];

/** Which fields each category needs before it can be approved (schema-required). */
export const REQUIRED_FIELDS: Record<CandidateCategory, FieldName[]> = {
  case: ["name", "brand", "beginnerFriendly", "layouts", "mountSupport"],
  pcb: [
    "name",
    "brand",
    "beginnerFriendly",
    "layouts",
    "switchTechnologySupport",
    "mountSupport",
    "stabilizerTypeSupport",
    "connection",
    "hotswap",
  ],
  plate: ["name", "brand", "beginnerFriendly", "layouts", "mountSupport", "switchTechnologySupport"],
  switch: ["name", "brand", "beginnerFriendly", "switchTechnology"],
  keycap: ["name", "brand", "beginnerFriendly", "keycapProfile", "layouts", "switchTechnologySupport"],
  stabilizer: ["name", "brand", "beginnerFriendly", "stabilizerType", "layouts", "stabilizerSizes"],
  kit: [
    "name",
    "brand",
    "beginnerFriendly",
    "layouts",
    "mountSupport",
    "switchTechnologySupport",
    "stabilizerTypeSupport",
    "connection",
    "hotswap",
  ],
};

/** Fields shown to the reviewer for each category (required + useful optional). */
export const REVIEW_FIELDS: Record<CandidateCategory, FieldName[]> = {
  case: [...REQUIRED_FIELDS.case, "price", "soundProfile", "description"],
  pcb: [...REQUIRED_FIELDS.pcb, "price", "description"],
  plate: [...REQUIRED_FIELDS.plate, "plateMaterial", "price", "soundProfile", "description"],
  switch: [...REQUIRED_FIELDS.switch, "pinCount", "actuationForceG", "price", "soundProfile", "description"],
  keycap: [...REQUIRED_FIELDS.keycap, "price", "description"],
  stabilizer: [...REQUIRED_FIELDS.stabilizer, "price", "description"],
  kit: [
    ...REQUIRED_FIELDS.kit,
    "stabilizerType",
    "stabilizerSizes",
    "plateMaterial",
    "price",
    "soundProfile",
    "description",
  ],
};

export type Candidate = {
  /** Stable id for this candidate across steps: `${vendorId}:${handle}`. */
  key: string;
  vendorId: string;
  sourceUrl: string;
  /** Plain text the AI and the reviewer read (cleaned product description). */
  sourceText: string;
  category: Field<CandidateCategory>;
  fields: CandidateFields;
  /** Switch pack size used to turn a pack price into a per-switch price. */
  packSize?: number;
  /** Anything the reviewer should look at. */
  notes: string[];
  /** Raw paid AI answer, kept so re-running discovery re-merges it for free. */
  ai?: { asked: string[]; extraction: unknown; at: string };
};

export function emptyFields(): CandidateFields {
  return {
    name: unknown(),
    brand: unknown(),
    description: unknown(),
    price: unknown(),
    imageUrl: unknown(),
    layouts: unknown(),
    mountSupport: unknown(),
    switchTechnology: unknown(),
    switchTechnologySupport: unknown(),
    pinCount: unknown(),
    actuationForceG: unknown(),
    hotswap: unknown(),
    connection: unknown(),
    keycapProfile: unknown(),
    stabilizerType: unknown(),
    stabilizerTypeSupport: unknown(),
    stabilizerSizes: unknown(),
    soundProfile: unknown(),
    beginnerFriendly: unknown(),
    plateMaterial: unknown(),
  };
}
