import { z } from "zod";

import {
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
    currency: z.string().trim().min(3).max(3).nullable(),
    label: z.enum(["budget", "mid_range", "premium", "unknown"]).nullable(),
  })
  .strict();

export const userIntentRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(2000),
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
