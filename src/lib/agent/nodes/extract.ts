import { extractKeyboardIntent } from "@/lib/ai";
import type { KeybotAgentStateType } from "../state";

/**
 * extract node — wraps `extractKeyboardIntent` to populate structured intent.
 *
 * Runs only on build-shaped routes. The extracted intent is recorded on agent
 * state for observability/routing; the authoritative grounding still happens in
 * the answer node. `extractKeyboardIntent` already falls back to a local
 * keyword parse when no API key is present, so this never throws offline.
 */
export async function extractNode(
  state: KeybotAgentStateType,
): Promise<Partial<KeybotAgentStateType>> {
  try {
    const result = await extractKeyboardIntent({ message: state.request.message });
    return { intent: result.intent };
  } catch {
    return { intent: null };
  }
}
