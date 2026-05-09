import { z } from "zod";

import { compatibilityResultSchema } from "@/lib/api/schemas";
import {
  caseComponentSchema,
  compatibilityIssueSchema,
  currencyCodeSchema,
  keycapComponentSchema,
  pcbComponentSchema,
  plateComponentSchema,
  stabilizerComponentSchema,
  switchComponentSchema,
} from "@/lib/types";
import {
  componentCandidateIdsByCategorySchema,
  extractedKeyboardIntentSchema,
  intentExtractionSourceSchema,
  intentMatchingCriteriaSchema,
  userIntentRequestSchema,
} from "@/lib/ai/intent-schema";

const recommendationComponentIdsSchema = z
  .object({
    case: z.string().min(1),
    pcb: z.string().min(1),
    plate: z.string().min(1),
    switch: z.string().min(1),
    keycap: z.string().min(1),
    stabilizer: z.string().min(1),
  })
  .strict();

const recommendationComponentsSchema = z
  .object({
    case: caseComponentSchema,
    pcb: pcbComponentSchema,
    plate: plateComponentSchema,
    switch: switchComponentSchema,
    keycap: keycapComponentSchema,
    stabilizer: stabilizerComponentSchema,
  })
  .strict();

export const validatedRecommendationBuildSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    componentIds: recommendationComponentIdsSchema,
    components: recommendationComponentsSchema,
    estimatedPrice: z.number().nonnegative().nullable(),
    estimatedPriceCurrency: currencyCodeSchema.nullable(),
    validation: compatibilityResultSchema.refine((result) => result.isValid, {
      message: "Recommendation builds must pass deterministic validation.",
    }),
    warnings: z.array(compatibilityIssueSchema),
    explanations: z.array(z.string().min(1)),
  })
  .strict();

export const recommendationResultSchema = z
  .object({
    intent: extractedKeyboardIntentSchema,
    source: intentExtractionSourceSchema,
    criteria: intentMatchingCriteriaSchema,
    candidateComponentIds: componentCandidateIdsByCategorySchema,
    recommendations: z.array(validatedRecommendationBuildSchema),
    warnings: z.array(compatibilityIssueSchema),
    explanations: z.array(z.string().min(1)),
    clarificationPrompt: z.string().min(1).nullable(),
    error: z.string().optional(),
  })
  .strict();

export const recommendationsRequestSchema = userIntentRequestSchema;

export const recommendationsApiResponseSchema = z.object({
  success: z.literal(true),
  data: recommendationResultSchema,
});

export type RecommendationComponentIds = z.infer<
  typeof recommendationComponentIdsSchema
>;
export type RecommendationComponents = z.infer<
  typeof recommendationComponentsSchema
>;
export type ValidatedRecommendationBuild = z.infer<
  typeof validatedRecommendationBuildSchema
>;
export type RecommendationResult = z.infer<typeof recommendationResultSchema>;
export type RecommendationsRequest = z.infer<
  typeof recommendationsRequestSchema
>;
export type RecommendationsApiResponse = z.infer<
  typeof recommendationsApiResponseSchema
>;
