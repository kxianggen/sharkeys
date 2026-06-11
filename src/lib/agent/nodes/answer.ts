import {
  buildGroundedKeybotResponse,
  type KeybotClassification,
} from "@/lib/keybot/service";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";

import type { KeybotAgentOptions } from "../options";
import type { KeybotAgentStateType } from "../state";

/**
 * answer node — compiles the final, schema-valid KeybotResponse.
 *
 * Delegates to `buildGroundedKeybotResponse`, the single grounding authority:
 * it assembles deterministic facts and lets OpenAI only *reformat* them (never
 * author product/price/compatibility claims). This keeps the "never invent"
 * invariant intact and the response identical in shape to the legacy pipeline,
 * so the frontend schema does not break.
 */
export async function answerNode(
  state: KeybotAgentStateType,
  config?: LangGraphRunnableConfig,
): Promise<Partial<KeybotAgentStateType>> {
  const options = config?.configurable?.keybotOptions as
    | KeybotAgentOptions
    | undefined;

  const response = await buildGroundedKeybotResponse(
    state.request,
    state.classification as KeybotClassification,
    options ?? {},
  );

  return {
    answer: response.answer,
    source: response.source,
    usedCatalogContext: response.usedCatalogContext,
    usedRecommendationEngine: response.usedRecommendationEngine,
    relatedIds: response.relatedComponentIds ?? [],
    clarification: response.clarificationQuestion ?? null,
    error: response.error,
  };
}
