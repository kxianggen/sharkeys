import { getCatalogComponents, validateBuildSelectionFromIds } from "@/lib/components";
import {
  requiredComponentCategories,
  type ComponentIdSelection,
  type KeyboardComponent,
} from "@/lib/types";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";

import type { KeybotAgentOptions } from "../options";
import type { KeybotAgentStateType } from "../state";

/**
 * validate node — the compatibility invariant.
 *
 * Constructs a candidate selection (top id per category) from the retrieve
 * node's results and runs it through `validateBuildSelectionFromIds`, the rule
 * engine that is the SOLE authority on compatibility. The agent records the
 * result for observability; it never overrides or bypasses the engine, and the
 * answer node only surfaces builds the engine has validated.
 */
export async function validateNode(
  state: KeybotAgentStateType,
  config?: LangGraphRunnableConfig,
): Promise<Partial<KeybotAgentStateType>> {
  const candidates = state.candidateIds;
  if (!candidates) return { validationResult: null };

  // Build a single-pick selection from the top candidate of each category.
  const componentIds: ComponentIdSelection = {};
  for (const category of requiredComponentCategories) {
    const top = candidates[category]?.[0];
    if (top) componentIds[category] = top;
  }

  // Only validate a complete selection — partial picks aren't a build yet.
  const hasAllRequired = requiredComponentCategories.every(
    (category) => componentIds[category],
  );
  if (!hasAllRequired) return { validationResult: null };

  const options = config?.configurable?.keybotOptions as
    | KeybotAgentOptions
    | undefined;

  try {
    const catalog: readonly KeyboardComponent[] =
      options?.catalogComponents ?? (await getCatalogComponents());
    const result = validateBuildSelectionFromIds({ componentIds }, catalog);
    return { validationResult: result };
  } catch {
    return { validationResult: null };
  }
}
