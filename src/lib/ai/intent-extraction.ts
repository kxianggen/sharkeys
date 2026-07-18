import { zodTextFormat } from "openai/helpers/zod";
import type OpenAI from "openai";

import { readOptionalOpenAIConfig } from "@/lib/env";
import { createOpenAIClient } from "@/lib/openai";
import type { CurrencyCode } from "@/lib/types";

import {
  defaultIntentPromptVariant,
  intentPromptVariants,
} from "./prompts";

import {
  extractedKeyboardIntentSchema,
  imageIntentRequestSchema,
  intentExtractionResultSchema,
  userIntentRequestSchema,
  type ImageIntentRequest,
  type IntentExtractionResult,
  type UserIntentRequest,
} from "./intent-schema";

type OpenAIIntentClient = Pick<OpenAI, "responses">;

// Vision model for image intent (Phase 5, decision D7). Text-only intent keeps
// using the configured OPENAI_MODEL. Exported so the @meg comment path can
// reuse the same vision model when a post has an attached build photo.
export const defaultVisionModel = "gpt-4o-mini";

type ExtractKeyboardIntentOptions = {
  apiKey?: string;
  client?: OpenAIIntentClient;
  model?: string;
  maxOutputTokens?: number;
  // Override the system prompt (Phase 5 A/B harness injects variants here).
  systemPrompt?: string;
};

type ExtractIntentFromImageOptions = ExtractKeyboardIntentOptions & {
  visionModel?: string;
};

const intentSystemPrompt =
  intentPromptVariants[defaultIntentPromptVariant];

const visionIntentSystemPrompt = [
  "You extract keyboard build intent into structured criteria from an image and optional text.",
  "Infer layout size, sound profile, switch feel, and aesthetic cues from visible case material, keycap colors/profile, and switch colors.",
  "When text accompanies the image, let the text OVERRIDE conflicting image cues (e.g. 'like this, but silent').",
  "Do not recommend final products or complete builds.",
  "Do not invent component IDs, products, prices, vendors, or availability.",
  "Use MYR or USD when a budget is present; default Malaysia-local RM budgets to MYR.",
  "If the image is ambiguous, set clarificationNeeded and ask one concise question.",
  "Use only the schema fields. Compatibility is decided later by deterministic validation.",
].join(" ");

export async function extractKeyboardIntent(
  input: UserIntentRequest,
  options: ExtractKeyboardIntentOptions = {},
): Promise<IntentExtractionResult> {
  const request = userIntentRequestSchema.parse(input);
  const config = readOptionalOpenAIConfig();
  const apiKey = options.apiKey ?? config.OPENAI_API_KEY;
  const model = options.model ?? config.OPENAI_MODEL;
  const maxOutputTokens =
    options.maxOutputTokens ?? config.OPENAI_MAX_OUTPUT_TOKENS;

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
      model,
      input: [
        {
          role: "system",
          content: options.systemPrompt ?? intentSystemPrompt,
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
      max_output_tokens: maxOutputTokens,
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
      error: formatOpenAIError(error, "Intent extraction"),
    });
  }
}

/**
 * Extracts keyboard build intent from an uploaded image, optionally fused with a
 * text message ("like this, but silent"). Uses the gpt-4o-mini vision model and
 * the same ExtractedKeyboardIntent structured output, so the result flows into
 * the existing prepare → recommend pipeline unchanged.
 *
 * Fallback contract mirrors extractKeyboardIntent: with no API key (or on any
 * error) it returns a deterministic intent parsed from the accompanying text
 * (or a neutral clarification-needed intent), never throwing. The image is held
 * in memory only and never persisted (decision D8).
 */
export async function extractIntentFromImage(
  input: ImageIntentRequest,
  options: ExtractIntentFromImageOptions = {},
): Promise<IntentExtractionResult> {
  const request = imageIntentRequestSchema.parse(input);
  const config = readOptionalOpenAIConfig();
  const apiKey = options.apiKey ?? config.OPENAI_API_KEY;
  const model = options.visionModel ?? defaultVisionModel;
  const maxOutputTokens =
    options.maxOutputTokens ?? config.OPENAI_MAX_OUTPUT_TOKENS;

  if (!options.client && !apiKey) {
    return intentExtractionResultSchema.parse({
      intent: parseLocalFallbackIntent(request.message ?? ""),
      source: "fallback_missing_api_key",
      error:
        "OPENAI_API_KEY is not configured, so image intent extraction is unavailable; used deterministic text fallback.",
    });
  }

  try {
    const client = options.client ?? createOpenAIClient(apiKey);
    const userText = [
      "Infer keyboard build intent from this image.",
      request.message
        ? `The user also said: "${request.message}". Fuse the image and the text; the text overrides conflicting image cues.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    const response = await client.responses.parse({
      model,
      input: [
        {
          role: "system",
          content: options.systemPrompt ?? visionIntentSystemPrompt,
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: userText },
            {
              type: "input_image",
              image_url: request.imageDataUrl,
              detail: "auto",
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(extractedKeyboardIntentSchema, "keyboard_intent"),
      },
      max_output_tokens: maxOutputTokens,
    });
    const parsedIntent = response.output_parsed;

    if (!parsedIntent) {
      return intentExtractionResultSchema.parse({
        intent: parseLocalFallbackIntent(request.message ?? ""),
        source: "fallback_error",
        error: "OpenAI returned no parsed intent from the image.",
      });
    }

    return intentExtractionResultSchema.parse({
      intent: parsedIntent,
      source: "openai",
    });
  } catch (error) {
    return intentExtractionResultSchema.parse({
      intent: parseLocalFallbackIntent(request.message ?? ""),
      source: "fallback_error",
      error: formatOpenAIError(error, "Image intent extraction"),
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
  const connectionConstraints = parseConnectionConstraints(text);
  const priorities = dedupe([
    budget ? "budget" : undefined,
    soundProfile ? "sound" : undefined,
    switchTechnology ? "feel" : undefined,
    beginnerFriendly ? "beginner_friendly" : undefined,
    useCase === "gaming" ? "performance" : undefined,
    connectionConstraints.includes("wireless") ? "wireless" : undefined,
  ]);
  const clarificationQuestion = buildFallbackClarificationQuestion({
    layout,
    budget,
    soundProfile,
    useCase,
    beginnerFriendly,
  });

  return extractedKeyboardIntentSchema.parse({
    budget,
    layout,
    soundProfile,
    useCase,
    beginnerFriendly,
    switchTechnology,
    priorities,
    constraints: connectionConstraints,
    clarificationNeeded: clarificationQuestion !== null,
    clarificationQuestion,
  });
}

function normalizeText(message: string) {
  return message.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
}

function parseBudget(text: string) {
  const constrainedBudgetMatch = text.match(
    /\b(?:under|below|less than|max|maximum|budget)\s*(rm|myr|usd|\$)?\s*(\d+(?:\.\d{1,2})?)(?:\s*(usd|dollars?|myr|rm))?\b/,
  );

  if (constrainedBudgetMatch) {
    return createBudgetIntent(
      Number(constrainedBudgetMatch[2]),
      parseCurrency(constrainedBudgetMatch[1] ?? constrainedBudgetMatch[3]) ??
        "MYR",
    );
  }

  const prefixedCurrencyMatch = text.match(
    /\b(rm|myr|usd)\s*(\d+(?:\.\d{1,2})?)\b/,
  );

  if (prefixedCurrencyMatch) {
    return createBudgetIntent(
      Number(prefixedCurrencyMatch[2]),
      parseCurrency(prefixedCurrencyMatch[1]) ?? "MYR",
    );
  }

  const dollarMatch = text.match(/\$\s*(\d+(?:\.\d{1,2})?)/);

  if (dollarMatch) {
    return createBudgetIntent(Number(dollarMatch[1]), "USD");
  }

  const suffixedCurrencyMatch = text.match(
    /\b(\d+(?:\.\d{1,2})?)\s*(usd|dollars?|myr|rm)\b/,
  );

  if (suffixedCurrencyMatch) {
    return createBudgetIntent(
      Number(suffixedCurrencyMatch[1]),
      parseCurrency(suffixedCurrencyMatch[2]) ?? "MYR",
    );
  }

  return null;
}

function parseCurrency(value: string | undefined): CurrencyCode | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "$" || value === "usd" || value.startsWith("dollar")) {
    return "USD";
  }

  if (value === "rm" || value === "myr") {
    return "MYR";
  }

  return undefined;
}

function createBudgetIntent(amount: number, currency: CurrencyCode) {
  if (!Number.isFinite(amount)) {
    return null;
  }

  return {
    amount,
    currency,
    label: classifyBudget(amount, currency),
  };
}

function classifyBudget(amount: number, currency: CurrencyCode) {
  const budgetThreshold = currency === "MYR" ? 300 : 150;
  const midRangeThreshold = currency === "MYR" ? 700 : 300;

  if (amount <= budgetThreshold) {
    return "budget";
  }

  return amount <= midRangeThreshold ? "mid_range" : "premium";
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
  // Explicit sound descriptors win first. Ambient/context words like "quiet"
  // or "office" must not override a stated profile — "a deep thocky build for
  // a quiet office" is thocky, not silent.
  if (/\bcreamy\b/.test(text)) {
    return "creamy";
  }

  if (/\bthocky\b/.test(text)) {
    return "thocky";
  }

  if (/\b(clacky|clicky)\b/.test(text)) {
    return "clacky";
  }

  // "silent" is itself an explicit profile; "quiet" only implies it when no
  // other descriptor is present.
  if (/\b(silent|quiet)\b/.test(text)) {
    return "silent";
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

  if (/\b(typing|studying|study)\b/.test(text)) {
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

function parseConnectionConstraints(text: string) {
  if (/\b(tri.?mode|wireless|bluetooth)\b/.test(text)) {
    return ["wireless"];
  }

  if (/\bwired\b/.test(text)) {
    return ["wired"];
  }

  return [];
}

function dedupe<T>(items: Array<T | undefined>) {
  return [...new Set(items.filter((item): item is T => item !== undefined))];
}

function buildFallbackClarificationQuestion({
  layout,
  budget,
  soundProfile,
  useCase,
  beginnerFriendly,
}: {
  layout: string | null;
  budget: ReturnType<typeof parseBudget>;
  soundProfile: string | null;
  useCase: string;
  beginnerFriendly: boolean | null;
}) {
  if (!soundProfile && useCase === "unknown") {
    return "Do you prefer quiet office typing, creamy study sound, or clacky gaming feedback?";
  }

  if (!layout) {
    return "Do you want a compact 65%, 75%, or TKL layout?";
  }

  if (!budget) {
    return "What budget range should sharkeys stay within?";
  }

  if (beginnerFriendly === null) {
    return "Should this be beginner-friendly or are you comfortable with enthusiast parts?";
  }

  return null;
}

function formatOpenAIError(error: unknown, action: string) {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : undefined;

  if (status === 401 || status === 403) {
    return `${action} failed because the OpenAI API key was rejected. Deterministic local fallback was used.`;
  }

  if (status === 408 || status === 429) {
    return `${action} hit an OpenAI rate limit or quota issue. Deterministic local fallback was used.`;
  }

  if (status !== undefined && status >= 500) {
    return `${action} failed because OpenAI was unavailable. Deterministic local fallback was used.`;
  }

  return `${action} failed unexpectedly. Deterministic local fallback was used.`;
}
