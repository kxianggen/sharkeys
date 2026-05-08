import { zodTextFormat } from "openai/helpers/zod";
import type OpenAI from "openai";

import { createOpenAIClient } from "@/lib/openai";

import {
  extractedKeyboardIntentSchema,
  intentExtractionResultSchema,
  userIntentRequestSchema,
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

export async function extractKeyboardIntent(
  input: UserIntentRequest,
  options: ExtractKeyboardIntentOptions = {},
): Promise<IntentExtractionResult> {
  const request = userIntentRequestSchema.parse(input);
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

  if (!options.client && !apiKey) {
    return intentExtractionResultSchema.parse({
      intent: parseLocalFallbackIntent(request.message),
      source: "fallback_missing_api_key",
      error:
        "OPENAI_API_KEY is not configured, so intent extraction used deterministic local keyword extraction.",
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
        intent: parseLocalFallbackIntent(request.message),
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
      intent: parseLocalFallbackIntent(request.message),
      source: "fallback_error",
      error:
        error instanceof Error
          ? error.message
          : "Intent extraction failed unexpectedly.",
    });
  }
}

function parseLocalFallbackIntent(message: string) {
  const text = normalizeText(message);
  const budget = parseBudget(text);
  const layout = parseLayout(text);
  const soundProfile = parseSoundProfile(text);
  const switchTechnology = parseSwitchTechnology(text);
  const useCase = parseUseCase(text);
  const beginnerFriendly = parseBeginnerFriendly(text);
  const priorities = dedupe([
    budget ? "budget" : undefined,
    soundProfile ? "sound" : undefined,
    switchTechnology ? "feel" : undefined,
    beginnerFriendly ? "beginner_friendly" : undefined,
    useCase === "gaming" ? "performance" : undefined,
  ]);
  const missingFields = [
    layout ? undefined : "layout",
    budget ? undefined : "budget",
    soundProfile ? undefined : "sound profile",
    beginnerFriendly === null ? "beginner experience" : undefined,
  ].filter((field): field is string => field !== undefined);

  return extractedKeyboardIntentSchema.parse({
    budget,
    layout,
    soundProfile,
    useCase,
    beginnerFriendly,
    switchTechnology,
    priorities,
    constraints: [],
    clarificationNeeded: missingFields.length > 0,
    clarificationQuestion:
      missingFields.length > 0
        ? `Could you clarify your ${missingFields.join(", ")}?`
        : null,
  });
}

function normalizeText(message: string) {
  return message.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
}

function parseBudget(text: string) {
  const budgetMatch =
    text.match(/\$\s*(\d+(?:\.\d{1,2})?)/) ??
    text.match(/\b(?:under|below|less than|max|maximum|budget)\s*\$?\s*(\d+(?:\.\d{1,2})?)\b/) ??
    text.match(/\b(\d+(?:\.\d{1,2})?)\s*(usd|dollars?)\b/);

  if (!budgetMatch) {
    return null;
  }

  const amount = Number(budgetMatch[1]);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return {
    amount,
    currency: "USD",
    label:
      amount <= 150 ? "budget" : amount <= 300 ? "mid_range" : "premium",
  };
}

function parseLayout(text: string) {
  if (/\b60\s*%?\b/.test(text)) {
    return "60";
  }

  if (/\b65\s*%?\b/.test(text)) {
    return "65";
  }

  if (/\b75\s*%?\b/.test(text)) {
    return "75";
  }

  if (/\b(tkl|tenkeyless)\b/.test(text)) {
    return "tkl";
  }

  if (/\b(full size|fullsize|full)\b/.test(text)) {
    return "full";
  }

  return null;
}

function parseSoundProfile(text: string) {
  if (/\b(silent|quiet)\b/.test(text)) {
    return "silent";
  }

  if (/\bcreamy\b/.test(text)) {
    return "creamy";
  }

  if (/\bthocky\b/.test(text)) {
    return "thocky";
  }

  if (/\bclacky\b/.test(text)) {
    return "clacky";
  }

  return null;
}

function parseSwitchTechnology(text: string) {
  if (/\bhall\s*effect\b/.test(text)) {
    return "hall_effect";
  }

  if (/\boptical\b/.test(text)) {
    return "optical";
  }

  if (/\btopre\b/.test(text)) {
    return "topre";
  }

  if (/\b(mechanical|mx)\b/.test(text)) {
    return "mechanical";
  }

  return null;
}

function parseUseCase(text: string) {
  if (/\bgam(e|ing)\b/.test(text)) {
    return "gaming";
  }

  if (/\b(programming|coding|development|developer)\b/.test(text)) {
    return "programming";
  }

  if (/\boffice\b/.test(text)) {
    return "office";
  }

  if (/\btyping\b/.test(text)) {
    return "typing";
  }

  if (/\btravel\b/.test(text)) {
    return "travel";
  }

  return "unknown";
}

function parseBeginnerFriendly(text: string) {
  if (/\b(advanced|expert|experienced)\b/.test(text)) {
    return false;
  }

  if (/\b(beginner|starter|first custom|first build|easy)\b/.test(text)) {
    return true;
  }

  if (/\bbeginner friendly\b/.test(text)) {
    return true;
  }

  return null;
}

function dedupe<T>(items: Array<T | undefined>) {
  return [...new Set(items.filter((item): item is T => item !== undefined))];
}
