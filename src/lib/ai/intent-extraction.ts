import { zodTextFormat } from "openai/helpers/zod";
import type OpenAI from "openai";

import { readOptionalOpenAIConfig } from "@/lib/env";
import { createOpenAIClient } from "@/lib/openai";
import { componentColourSchema } from "@/lib/types";
import type { ComponentColour, CurrencyCode } from "@/lib/types";

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
  // Layout was the weakest field: the model guessed "75" for a photo of a 65%
  // board. Layout is *countable* from the picture, so give it a procedure
  // instead of asking it to infer.
  "LAYOUT — decide by counting rows and clusters, in this order, and do not skip a step:",
  "1. Is there a function row (F1-F12) ABOVE the number row? If NO, the board is 60% or 65% and can never be 75%, TKL, or full.",
  "2. No function row and no arrow keys -> 60%.",
  "3. No function row but arrow keys present (usually with a short right-hand column such as Del/PgUp/PgDn) -> 65%.",
  "4. Function row present, arrows present, compact right-hand column, no numpad -> 75%.",
  "5. Function row present, full navigation cluster (Ins/Home/PgUp block), no numpad -> tkl.",
  "6. A numpad on the right -> full.",
  "A rotary knob is NOT a layout signal — knobs appear on 65%, 75% and TKL boards alike. Ignore it when choosing layout.",
  "If you cannot see the top row clearly, set layout to null and set clarificationNeeded rather than guessing.",
  "Infer sound profile ONLY from switch colour visible through or beside the keycaps; if no switch is visible, leave soundProfile null rather than guessing from the case.",
  "Do NOT infer useCase from appearance — a photo shows what a board looks like, not what it is used for. Leave useCase 'unknown' unless the accompanying text says otherwise.",
  "Infer case material and keycap colour/profile from what is visible.",
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
  const colour = parseColour(text);
  const priorities = dedupe([
    budget ? "budget" : undefined,
    soundProfile ? "sound" : undefined,
    switchTechnology ? "feel" : undefined,
    beginnerFriendly ? "beginner_friendly" : undefined,
    useCase === "gaming" ? "performance" : undefined,
    connectionConstraints.includes("wireless") ? "wireless" : undefined,
    // Naming a colourway is an explicit statement that looks matter.
    colour ? "aesthetics" : undefined,
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
    colour,
    priorities,
    constraints: [...connectionConstraints, ...parseMaterialConstraints(text)],
    clarificationNeeded: clarificationQuestion !== null,
    clarificationQuestion,
  });
}

function normalizeText(message: string) {
  return message.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
}

/**
 * Colourway keywords (UAT finding 1), the offline counterpart to rule 5 of the
 * structured prompt.
 *
 * Every pattern is anchored with word boundaries. Without them "red" matches
 * inside "hundred", "required" and "considered", which would fire on ordinary
 * budget phrasing.
 *
 * Deliberately NOT mapped, each corresponding to an adversarial eval control:
 *
 *   materials — "aluminium"/"aluminum" is not silver and "plastic" is not
 *   white. Inferring colour from material is the single most tempting wrong
 *   answer here, since silver is in the vocabulary (col-005).
 *
 *   appearance terms — "clear", "transparent", "shine-through", "backlit" and
 *   "RGB" describe how a board looks without naming a colour. RGB is the
 *   trap: it is chromatic language, and mapping it to "multi" would be wrong
 *   (col-006, col-007).
 *
 *   "cream" — omitted even though it reads as beige, because "creamy" is a
 *   SOUND profile in this domain and the two would be a step apart. The word
 *   boundary would in fact keep them separate, but the collision is close
 *   enough that the mapping is not worth its risk.
 *
 * Synonyms are included only where they name a colour unambiguously
 * (lavender/lilac/violet are purple; ivory is beige).
 */
const COLOUR_KEYWORDS: ReadonlyArray<readonly [ComponentColour, RegExp]> = [
  ["black", /\bblacks?\b/],
  ["white", /\bwhites?\b/],
  ["grey", /\b(?:greys?|grays?)\b/],
  ["silver", /\bsilver\b/],
  ["purple", /\b(?:purples?|violets?|lilac|lavender)\b/],
  ["blue", /\bblues?\b/],
  ["pink", /\bpinks?\b/],
  ["green", /\bgreens?\b/],
  ["red", /\breds?\b/],
  ["beige", /\b(?:beige|ivory)\b/],
  ["pastel", /\bpastels?\b/],
  ["multi", /\b(?:multi|multicolou?red?|colou?rful|rainbow)\b/],
];

function parseColour(text: string): ComponentColour[] | null {
  // Vocabulary order, not order of appearance, so the same request always
  // produces the same array — the eval compares sorted sets, but the ranking
  // and any stored intent should be reproducible too.
  const matched = COLOUR_KEYWORDS.filter(([, pattern]) => pattern.test(text))
    .map(([colour]) => colour)
    .filter((colour) => componentColourSchema.safeParse(colour).success);

  return matched.length > 0 ? matched : null;
}

function parseBudget(text: string) {
  // A stated range means "I can stretch to the top of this" — take the upper
  // bound, not the first number seen. Requires a currency marker on one side so
  // that layout talk ("60-65%") can never be read as money.
  // The separator allows bare whitespace because `normalizeText` has already
  // rewritten "-" to a space by the time we get here: "RM200-250" arrives as
  // "rm200 250". Without the `\s+` branch the hyphen form silently fell through
  // to the single-amount rule and reported the lower bound.
  const rangeMatch = text.match(
    /\b(?:(rm|myr|usd|\$)\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(rm|myr|usd))(?:\s*(?:-|–|—|to|hingga|sampai)\s*|\s+)(rm|myr|usd|\$)?\s*(\d+(?:\.\d{1,2})?)\b(?!\s*%)/,
  );

  if (rangeMatch) {
    const upperBound = Number(rangeMatch[6]);
    const currency =
      parseCurrency(rangeMatch[5] ?? rangeMatch[1] ?? rangeMatch[4]) ?? "MYR";

    if (Number.isFinite(upperBound)) {
      return createBudgetIntent(upperBound, currency);
    }
  }

  // `\b(?!\s*%)` is load-bearing: without it "RM200 budget 65%" matched
  // "budget 65" and reported a RM65 budget. The word boundary also blocks the
  // engine from backtracking to a shorter number ("6" out of "65%").
  const constrainedBudgetMatch = text.match(
    /\b(?:under|below|less than|max|maximum|budget|bajet|around|about|sekitar|bawah|dalam)\s*(rm|myr|usd|\$)?\s*(\d+(?:\.\d{1,2})?)\b(?!\s*%)(?:\s*(usd|dollars?|myr|rm))?/,
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
    /\b(\d+(?:\.\d{1,2})?)\s*(usd|dollars?|myr|rm|ringgit)\b/,
  );

  if (suffixedCurrencyMatch) {
    return createBudgetIntent(
      Number(suffixedCurrencyMatch[1]),
      parseCurrency(suffixedCurrencyMatch[2]) ?? "MYR",
    );
  }

  return null;
}

// Material words were being dropped on the floor: intent.constraints only ever
// held wired/wireless, so "thocky 65% aluminium build" reached the ranker with
// no idea aluminium had been asked for, and answered with a plastic case.
function parseMaterialConstraints(text: string) {
  const matches = text.match(
    /\b(aluminium|aluminum|brass|steel|plastic|abs|polycarbonate|pom|fr4|carbon fibre|carbon fiber|wood)\b/g,
  );

  return matches ? [...new Set(matches)] : [];
}

function parseCurrency(value: string | undefined): CurrencyCode | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "$" || value === "usd" || value.startsWith("dollar")) {
    return "USD";
  }

  if (value === "rm" || value === "myr" || value === "ringgit") {
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

  // "full" alone is an adjective far more often than a layout ("deep and full
  // sound"), so it only counts next to a size/board word or as 100%.
  if (
    /\bfull[\s]?sized?\b|\bfullsize\b|\b100\s*%|\bfull(?=\s+(?:layout|keyboard|board|kb))\b/.test(
      text,
    )
  ) {
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

  // Buyers say "thock", "thocc" and "thocky" interchangeably, and usually with a
  // modifier in front ("deep thock", "heavy thock"). Matching only the -y form
  // dropped the profile entirely on the most common phrasing there is.
  if (/\bthoc[ck]+(?:y|ey)?\b/.test(text)) {
    return "thocky";
  }

  if (/\b(clacky|clicky|clack)\b/.test(text)) {
    return "clacky";
  }

  if (/\bsilent\b/.test(text)) {
    return "silent";
  }

  // Implied descriptors, checked only after every explicit one has missed.
  // "buttery smooth" is the single most common way a Malaysian buyer describes
  // a creamy linear without ever using the word "creamy".
  if (/\b(buttery|marshmallow)\b/.test(text)) {
    return "creamy";
  }

  // "quiet" only implies silent when no other descriptor is present, which is
  // why it sits down here rather than beside "silent".
  if (/\bquiet\b|\bsenyap\b|\btak\s+bising\b/.test(text)) {
    return "silent";
  }

  return null;
}

function parseSwitchTechnology(text: string) {
  // Nobody shopping for these says "hall effect" — they say "magnetic
  // switches", "rapid trigger", or they name Wooting. Matching only the
  // textbook term made the entire hall-effect catalog unreachable by prompt.
  if (
    /\bhall\s*effect\b|\bmagnetic\b|\brapid\s*trigger\b|\banalog(?:ue)?\s+(?:switch|keyboard|input)\b|\bwooting\b|\blekker\b|\bhe\s+(?:switch|keyboard|board|pcb)\b/.test(
      text,
    )
  ) {
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
  // "games" (plural) previously failed the word boundary, and buyers name the
  // title far more often than they say "gaming" — Valorant and CS are the two
  // that dominate the Malaysian market this catalog targets.
  if (
    /\bgam(?:e|es|ing|er|ers)\b/.test(text) ||
    /\b(fps|valorant|csgo|cs:?go|cs2|counter[\s-]?strike|dota|apex|overwatch|pubg|fortnite|mobile legends|esports?)\b/.test(
      text,
    )
  ) {
    return "gaming";
  }

  if (/\b(programming|coding|development|developer)\b/.test(text)) {
    return "programming";
  }

  // Work context implies office even when the word "office" never appears —
  // "for typing at work" is an office build, not a generic typing build.
  if (/\b(office|wfh|work from home|workplace|at work|for work)\b/.test(text)) {
    return "office";
  }

  if (/\b(typing|studying|study|menaip)\b|\bi type\b/.test(text)) {
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
