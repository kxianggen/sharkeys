import { z } from "zod";

import {
  componentColourSchema,
  currencyCodeSchema,
  keyboardLayoutSchema,
  soundProfileSchema,
  switchTechnologySchema,
} from "@/lib/types";

export const keyboardUseCaseSchema = z.enum([
  "gaming",
  "typing",
  "office",
  "programming",
  "travel",
  "mixed",
  "unknown",
]);

export const intentPrioritySchema = z.enum([
  "budget",
  "sound",
  "feel",
  "aesthetics",
  "wireless",
  "beginner_friendly",
  "availability",
  "performance",
]);

export const budgetIntentSchema = z
  .object({
    amount: z.number().nonnegative().nullable(),
    currency: currencyCodeSchema.nullable(),
    label: z.enum(["budget", "mid_range", "premium", "unknown"]).nullable(),
  })
  .strict();

export const userIntentRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(2000),
  })
  .strict();

// Image-based intent (Phase 5). `imageDataUrl` is a base64 image data URL kept
// in memory only (never persisted). `message` is optional so a user can fuse a
// picture with text ("like this, but silent"). The ~6M char cap bounds the
// request payload (base64 inflates ~1.33x, so ≈4.5MB of image bytes).
export const imageIntentRequestSchema = z
  .object({
    imageDataUrl: z
      .string()
      .regex(
        /^data:image\/(png|jpe?g|webp|gif);base64,/,
        "Must be a base64 image data URL.",
      )
      .max(6_000_000, "Image is too large (max ~4MB)."),
    message: z.string().trim().max(2000).optional(),
  })
  .strict();

export const extractedKeyboardIntentSchema = z
  .object({
    budget: budgetIntentSchema.nullable(),
    layout: keyboardLayoutSchema.nullable(),
    soundProfile: soundProfileSchema.nullable(),
    useCase: keyboardUseCaseSchema,
    beginnerFriendly: z.boolean().nullable(),
    switchTechnology: switchTechnologySchema.nullable(),
    // Colourway intent (UAT finding 1). Nullable rather than optional: this
    // schema drives OpenAI structured output, where every key must be present.
    // null means "no colour requested", which is distinct from an empty array
    // and is what the hallucination-control eval cases assert.
    colour: z.array(componentColourSchema).nullable(),
    priorities: z.array(intentPrioritySchema),
    constraints: z.array(z.string().min(1)),
    clarificationNeeded: z.boolean(),
    clarificationQuestion: z.string().min(1).nullable(),
  })
  .strict();

export const intentExtractionSourceSchema = z.enum([
  "openai",
  "fallback_missing_api_key",
  "fallback_error",
]);

export const componentCandidateIdsByCategorySchema = z
  .object({
    case: z.array(z.string()),
    pcb: z.array(z.string()),
    plate: z.array(z.string()),
    switch: z.array(z.string()),
    keycap: z.array(z.string()),
    stabilizer: z.array(z.string()),
  })
  .strict();

export const intentMatchingCriteriaSchema = z
  .object({
    layout: keyboardLayoutSchema.optional(),
    soundProfile: soundProfileSchema.optional(),
    switchTechnology: switchTechnologySchema.optional(),
    beginnerFriendly: z.boolean().optional(),
    maxPrice: z.number().nonnegative().optional(),
    currency: currencyCodeSchema.optional(),
    // Carried through to ranking only. Candidate search never filters on
    // colour: a colour request must never be able to empty the result set,
    // and colour is not a compatibility constraint.
    colour: z.array(componentColourSchema).optional(),
    query: z.string().min(1).optional(),
  })
  .strict();

export const intentPreparationSchema = z
  .object({
    criteria: intentMatchingCriteriaSchema,
    candidateComponentIds: componentCandidateIdsByCategorySchema,
  })
  .strict();

export const intentExtractionResultSchema = z
  .object({
    intent: extractedKeyboardIntentSchema,
    source: intentExtractionSourceSchema,
    error: z.string().optional(),
  })
  .strict();

export const aiIntentApiResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    intent: extractedKeyboardIntentSchema,
    source: intentExtractionSourceSchema,
    criteria: intentMatchingCriteriaSchema,
    candidateComponentIds: componentCandidateIdsByCategorySchema,
    error: z.string().optional(),
  }),
});

export type KeyboardUseCase = z.infer<typeof keyboardUseCaseSchema>;
export type IntentPriority = z.infer<typeof intentPrioritySchema>;
export type BudgetIntent = z.infer<typeof budgetIntentSchema>;
export type UserIntentRequest = z.infer<typeof userIntentRequestSchema>;
export type ImageIntentRequest = z.infer<typeof imageIntentRequestSchema>;
export type ExtractedKeyboardIntent = z.infer<
  typeof extractedKeyboardIntentSchema
>;
export type IntentExtractionSource = z.infer<typeof intentExtractionSourceSchema>;
export type ComponentCandidateIdsByCategory = z.infer<
  typeof componentCandidateIdsByCategorySchema
>;
export type IntentMatchingCriteria = z.infer<typeof intentMatchingCriteriaSchema>;
export type IntentPreparation = z.infer<typeof intentPreparationSchema>;
export type IntentExtractionResult = z.infer<typeof intentExtractionResultSchema>;
export type AiIntentApiResponse = z.infer<typeof aiIntentApiResponseSchema>;
