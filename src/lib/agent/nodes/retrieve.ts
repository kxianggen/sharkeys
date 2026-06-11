import { prepareIntentMatchesAsync } from "@/lib/ai";
import { getCatalogComponents } from "@/lib/components";
import type { KeyboardComponent } from "@/lib/types";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";

import type { KeybotAgentOptions } from "../options";
import type { KeybotAgentStateType } from "../state";

/**
 * retrieve node — wraps Phase 2 semantic search via `prepareIntentMatchesAsync`,
 * which augments switch candidates with pgvector results when soundProfile is
 * absent but constraints describe sound, and otherwise falls back to keyword
 * matching. The resulting candidate ids are recorded for the validate node and
 * for LangSmith observability.
 */
export async function retrieveNode(
  state: KeybotAgentStateType,
  config?: LangGraphRunnableConfig,
): Promise<Partial<KeybotAgentStateType>> {
  if (!state.intent) return { candidateIds: null };

  const options = config?.configurable?.keybotOptions as
    | KeybotAgentOptions
    | undefined;

  try {
    const catalog: readonly KeyboardComponent[] =
      options?.catalogComponents ?? (await getCatalogComponents());
    const preparation = await prepareIntentMatchesAsync(state.intent, catalog);
    return { candidateIds: preparation.candidateComponentIds };
  } catch {
    return { candidateIds: null };
  }
}
