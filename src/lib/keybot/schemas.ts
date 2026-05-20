import { z } from "zod";

import { extractedKeyboardIntentSchema } from "@/lib/ai";
import { componentIdSelectionSchema } from "@/lib/types";

export const keybotChatRoleSchema = z.enum(["user", "assistant"]);

export const keybotConversationTurnSchema = z
  .object({
    role: keybotChatRoleSchema,
    content: z.string().trim().min(1).max(1200),
  })
  .strict();

export const keybotContextSchema = z
  .object({
    currentRecommendationIds: z.array(z.string().min(1)).max(6).optional(),
    currentIntent: extractedKeyboardIntentSchema.optional(),
    selectedComponentIds: componentIdSelectionSchema.optional(),
    recentMessages: z.array(keybotConversationTurnSchema).max(6).optional(),
    conversationHistory: z.array(keybotConversationTurnSchema).max(6).optional(),
  })
  .strict();

export const keybotRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(2000),
    context: keybotContextSchema.optional(),
  })
  .strict();

export const keybotSourceSchema = z.enum([
  "openai",
  "fallback_missing_api_key",
  "fallback_error",
]);

export const keybotResponseSchema = z
  .object({
    answer: z.string().min(1),
    source: keybotSourceSchema,
    usedCatalogContext: z.boolean(),
    usedRecommendationEngine: z.boolean(),
    relatedComponentIds: z.array(z.string().min(1)).optional(),
    clarificationQuestion: z.string().min(1).nullable().optional(),
    error: z.string().optional(),
  })
  .strict();

export const keybotApiResponseSchema = z.object({
  success: z.literal(true),
  data: keybotResponseSchema,
});

export type KeybotConversationTurn = z.infer<
  typeof keybotConversationTurnSchema
>;
export type KeybotContext = z.infer<typeof keybotContextSchema>;
export type KeybotRequest = z.infer<typeof keybotRequestSchema>;
export type KeybotSource = z.infer<typeof keybotSourceSchema>;
export type KeybotResponse = z.infer<typeof keybotResponseSchema>;
export type KeybotApiResponse = z.infer<typeof keybotApiResponseSchema>;
