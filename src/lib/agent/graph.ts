import { randomUUID } from "node:crypto";

import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph";

import {
  keybotRequestSchema,
  keybotResponseSchema,
  type KeybotRequest,
  type KeybotResponse,
} from "@/lib/keybot/schemas";

import type { KeybotAgentOptions } from "./options";
import {
  answerNode,
  classifyNode,
  extractNode,
  retrieveNode,
  validateNode,
} from "./nodes";
import { KeybotAgentState, type KeybotAgentStateType } from "./state";

// Classifications that warrant the full build pipeline (extract → retrieve →
// validate). Everything else routes straight to the grounded answer node, which
// already handles concept/compatibility/small-talk replies deterministically.
const BUILD_ROUTE = "build_request";

function routeAfterClassify(
  state: KeybotAgentStateType,
): "extract" | "compose" {
  return state.classification === BUILD_ROUTE ? "extract" : "compose";
}

// Build + compile once at module load. MemorySaver persists state within the
// process for a given thread_id; cross-turn conversational context is carried
// explicitly via request.context (conversationHistory/recentMessages), which
// survives across stateless API requests where in-memory checkpoints do not.
const workflow = new StateGraph(KeybotAgentState)
  .addNode("classify", classifyNode)
  .addNode("extract", extractNode)
  .addNode("retrieve", retrieveNode)
  .addNode("validate", validateNode)
  .addNode("compose", answerNode)
  .addEdge(START, "classify")
  .addConditionalEdges("classify", routeAfterClassify, {
    extract: "extract",
    compose: "compose",
  })
  .addEdge("extract", "retrieve")
  .addEdge("retrieve", "validate")
  .addEdge("validate", "compose")
  .addEdge("compose", END);

const checkpointer = new MemorySaver();
const compiledGraph = workflow.compile({ checkpointer });

export { compiledGraph as keybotAgentGraph };

/**
 * invokeKeybotAgent — public entry point for the LangGraph Keybot agent.
 *
 * Parses + validates the request, runs the graph (classify → conditional route
 * → grounded answer), and reassembles a schema-valid KeybotResponse. Falls back
 * to a deterministic grounded answer whenever no OpenAI key is present, so the
 * eval runner and offline dev keep working unchanged.
 */
export async function invokeKeybotAgent(
  input: KeybotRequest,
  options: KeybotAgentOptions = {},
): Promise<KeybotResponse> {
  const request = keybotRequestSchema.parse(input);
  const threadId = options.threadId ?? randomUUID();

  const finalState = await compiledGraph.invoke(
    { request },
    { configurable: { thread_id: threadId, keybotOptions: options } },
  );

  return keybotResponseSchema.parse({
    answer: finalState.answer,
    source: finalState.source,
    usedCatalogContext: finalState.usedCatalogContext,
    usedRecommendationEngine: finalState.usedRecommendationEngine,
    relatedComponentIds: finalState.relatedIds,
    clarificationQuestion: finalState.clarification,
    error: finalState.error,
  });
}
