import { z } from "zod";

import { readOptionalOpenAIConfig } from "@/lib/env";
import { classifyKeybotMessage } from "@/lib/keybot/service";
import { OPENAI_MAX_RETRIES, OPENAI_TIMEOUT_MS } from "@/lib/openai";
import type { KeybotAgentStateType } from "../state";

// The routing categories the agent understands — identical to the legacy
// classifier's union so downstream grounding logic is unchanged.
const KEYBOT_CATEGORIES = [
  "build_request",
  "capability_help",
  "compatibility_question",
  "component_question",
  "concept_question",
  "comparison_followup",
  "cost_reduction",
  "followup_compatibility",
  "followup_explanation",
  "refinement_request",
  "small_talk",
  "switch_explanation",
  "vague_question",
] as const;

const classificationSchema = z.object({
  category: z.enum(KEYBOT_CATEGORIES),
});

const CLASSIFY_SYSTEM = [
  "You are the router for Keybot, a mechanical-keyboard assistant.",
  "Classify the user's latest message into exactly one category.",
  "Categories:",
  "- build_request: wants a keyboard recommendation/build (budget, use case, sound).",
  "- compatibility_question: asks whether parts fit together.",
  "- component_question: asks about a specific product/brand/part.",
  "- concept_question: asks to define/explain a concept (e.g. what is a 65%).",
  "- switch_explanation: asks how switches sound/feel in general.",
  "- cost_reduction: wants to make an existing build cheaper.",
  "- comparison_followup: compares two prior options.",
  "- followup_compatibility: follow-up about compatibility of a prior build.",
  "- followup_explanation: follow-up asking why/explain a prior answer.",
  "- refinement_request: tweak/adjust a prior recommendation.",
  "- capability_help: asks what Keybot can do.",
  "- small_talk: greetings/thanks/off-topic chit-chat.",
  "- vague_question: on-topic but too vague to route elsewhere.",
].join("\n");

/**
 * classify node — routes the user message to one of the Keybot categories.
 *
 * Strategy (hybrid): the deterministic regex classifier encodes the owner's
 * curated routing and is the eval ground truth, so a *confident* regex match
 * wins. The LLM router engages only where the regex gives up
 * (`vague_question`) — exactly the brittle tail the regex can't handle — adding
 * multi-turn reasoning without regressing the curated baseline.
 *
 * Offline / no-key behaviour: returns the regex result directly. Any LLM error
 * also falls back to the regex label — the agent never hard-fails on routing.
 */
export async function classifyNode(
  state: KeybotAgentStateType,
): Promise<Partial<KeybotAgentStateType>> {
  const message = state.request.message;
  const regexClassification = classifyKeybotMessage(message);

  const config = readOptionalOpenAIConfig();

  // The LLM router is opt-in (KEYBOT_LLM_CLASSIFY=true). Default off so routing
  // stays deterministic and matches the curated eval baseline exactly; enable
  // it to add LLM reasoning (and LangSmith traces) on ambiguous messages.
  const llmRouterEnabled = process.env.KEYBOT_LLM_CLASSIFY === "true";

  // Confident regex match, router disabled, or no API key → deterministic label.
  if (
    regexClassification !== "vague_question" ||
    !llmRouterEnabled ||
    !config.OPENAI_API_KEY
  ) {
    return { classification: regexClassification };
  }

  // Regex was unsure — let the LLM reason about the ambiguous message.
  try {
    const { ChatOpenAI } = await import("@langchain/openai");
    const model = new ChatOpenAI({
      model: config.OPENAI_MODEL,
      apiKey: config.OPENAI_API_KEY,
      temperature: 0,
      // Same bound as the shared OpenAI client. ChatOpenAI retries itself
      // (default 6), so maxRetries must be set here too.
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: OPENAI_MAX_RETRIES,
    });

    const result = await model
      .withStructuredOutput(classificationSchema, { name: "classification" })
      .invoke([
        { role: "system", content: CLASSIFY_SYSTEM },
        { role: "user", content: message },
      ]);

    return { classification: result.category };
  } catch {
    // LLM unavailable / malformed — fall back to the deterministic label.
    return { classification: regexClassification };
  }
}
