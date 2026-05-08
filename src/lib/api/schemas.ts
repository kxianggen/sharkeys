import { z } from "zod";

import {
  buildPreferencesSchema,
  caseComponentSchema,
  componentCategorySchema,
  componentIdSelectionSchema,
  compatibilityIssueSchema,
  keyboardBuildSelectionSchema,
  keyboardComponentSchema,
  keyboardLayoutSchema,
  keycapComponentSchema,
  pcbComponentSchema,
  plateComponentSchema,
  soundProfileSchema,
  stabilizerComponentSchema,
  switchComponentSchema,
  switchTechnologySchema,
} from "@/lib/types";

const booleanQuerySchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const optionalNumberQuerySchema = z.coerce.number().nonnegative();

const selectedComponentsSchema = z
  .object({
    case: caseComponentSchema.optional(),
    pcb: pcbComponentSchema.optional(),
    plate: plateComponentSchema.optional(),
    switch: switchComponentSchema.optional(),
    keycap: keycapComponentSchema.optional(),
    stabilizer: stabilizerComponentSchema.optional(),
  })
  .partial();

export const compatibilityResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(compatibilityIssueSchema),
  warnings: z.array(compatibilityIssueSchema),
  issues: z.array(compatibilityIssueSchema),
  explanations: z.array(z.string()),
  selectedComponents: selectedComponentsSchema,
});

export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.unknown().optional(),
  }),
});

export const componentsQuerySchema = z
  .object({
    category: componentCategorySchema.optional(),
    q: z.string().trim().min(1).optional(),
    layout: keyboardLayoutSchema.optional(),
    switchTechnology: switchTechnologySchema.optional(),
    soundProfile: soundProfileSchema.optional(),
    beginnerFriendly: booleanQuerySchema.optional(),
    maxPrice: optionalNumberQuerySchema.optional(),
  })
  .strict();

export const componentsListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    components: z.array(keyboardComponentSchema),
    count: z.number().int().nonnegative(),
  }),
});

export const componentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    component: keyboardComponentSchema,
  }),
});

export const categoryComponentsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    category: componentCategorySchema,
    components: z.array(keyboardComponentSchema),
    count: z.number().int().nonnegative(),
  }),
});

export const validateBuildRequestSchema = keyboardBuildSelectionSchema;

export const validateBuildResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    result: compatibilityResultSchema,
  }),
});

export const componentSearchCriteriaSchema = componentsQuerySchema;

export { buildPreferencesSchema, componentIdSelectionSchema };
