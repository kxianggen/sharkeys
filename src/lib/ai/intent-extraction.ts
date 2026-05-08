import { zodTextFormat } from "openai/helpers/zod";
import type OpenAI from "openai";

import { createOpenAIClient } from "@/lib/openai";

import {
  extractedKeyboardIntentSchema,
  intentExtractionResultSchema,
  userIntentRequestSchema,
  type ExtractedKeyboardIntent,
  type IntentExtractionResult,
  type UserIntentRequest,
} from "./intent-schema";

type OpenAIIntentClient = Pick<OpenAI, "responses">;

type ExtractKeyboardIntentOptions = {
  apiKey?: string;
  client?: OpenAIIntentClient;
  model?: string;
};

const defaultIntentModel = "gpt-4o-mini";

const fallbackIntent: ExtractedKeyboardIntent =
  extractedKeyboardIntentSchema.parse({
    budget: null,
    layout: null,
    soundProfile: null,
    useCase: "unknown",
    beginnerFriendly: null,
    switchTechnology: null,
    priorities: [],
    constraints: [],
    clarificationNeeded: true,
    clarificationQuestion:
      "Could you share your preferred layout, budget, sound profile, and whether this is your first custom keyboard?",
  });

export async function extractKeyboardIntent(
  input: UserIntentRequest,
  options: ExtractKeyboardIntentOptions = {},
): Promise<IntentExtractionResult> {
  const request = userIntentRequestSchema.parse(input);
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

  if (!options.client && !apiKey) {
    return intentExtractionResultSchema.parse({
      intent: fallbackIntent,
      source: "fallback_missing_api_key",
      error:
        "OPENAI_API_KEY is not configured, so intent extraction used a safe fallback.",
    });
  }

  try {
    const client = options.client ?? createOpenAIClient(apiKey);
    const response = await client.responses.parse({
      model: options.model ?? defaultIntentModel,
      input: [
        {
          role: "system",
          content: [
            "You extract keyboard build intent into structured criteria.",
            "Do not recommend final products or complete builds.",
            "Do not invent component IDs, products, prices, vendors, or availability.",
            "If the user is vague, set clarificationNeeded and ask one concise question.",
            "Use only the schema fields. Compatibility is decided later by deterministic validation.",
          ].join(" "),
        },
        {
          role: "user",
          content: request.message,
        },
      ],
      text: {
        format: zodTextFormat(
          extractedKeyboardIntentSchema,
          "keyboard_intent",
        ),
      },
    });
    const parsedIntent = response.output_parsed;

    if (!parsedIntent) {
      return intentExtractionResultSchema.parse({
        intent: fallbackIntent,
        source: "fallback_error",
        error: "OpenAI returned no parsed intent.",
      });
    }

    return intentExtractionResultSchema.parse({
      intent: parsedIntent,
      source: "openai",
    });
  } catch (error) {
    return intentExtractionResultSchema.parse({
      intent: fallbackIntent,
      source: "fallback_error",
      error:
        error instanceof Error
          ? error.message
          : "Intent extraction failed unexpectedly.",
    });
  }
}
