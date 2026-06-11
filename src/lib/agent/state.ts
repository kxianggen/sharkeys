import { Annotation } from "@langchain/langgraph";

import type {
  ComponentCandidateIdsByCategory,
  ExtractedKeyboardIntent,
} from "@/lib/ai";
import type { KeybotRequest, KeybotSource } from "@/lib/keybot/schemas";
import type { CompatibilityResult } from "@/lib/types";

/**
 * KeybotAgentState — the shared state threaded through the LangGraph agent.
 *
 * The `request` and `classification` drive routing; `intent`, `candidateIds`
 * and `validationResult` are populated by the extract/retrieve/validate nodes
 * (primarily for observability — they surface node-by-node in LangSmith). The
 * `answer`/`source`/`used*`/`relatedIds`/`clarification` fields mirror the
 * KeybotResponse schema so the `answer` node can emit a schema-valid response
 * without losing any field the frontend depends on.
 *
 * Every channel uses a "last write wins" reducer (the default) — nodes run
 * sequentially and each owns distinct fields, so no merging is required.
 */
export const KeybotAgentState = Annotation.Root({
  // Inputs / routing
  request: Annotation<KeybotRequest>,
  classification: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "vague_question",
  }),

  // Intermediate reasoning (observability + routing)
  intent: Annotation<ExtractedKeyboardIntent | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  candidateIds: Annotation<ComponentCandidateIdsByCategory | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  validationResult: Annotation<CompatibilityResult | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // Final response fields (mirror keybotResponseSchema)
  answer: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
  source: Annotation<KeybotSource>({
    reducer: (_prev, next) => next,
    default: () => "fallback_missing_api_key",
  }),
  usedCatalogContext: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),
  usedRecommendationEngine: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),
  relatedIds: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  clarification: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  error: Annotation<string | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),
});

export type KeybotAgentStateType = typeof KeybotAgentState.State;
