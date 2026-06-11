import type { GenerateKeybotResponseOptions } from "@/lib/keybot/service";

/**
 * Options threaded through the agent via LangGraph's `configurable`. Extends the
 * legacy grounding options (apiKey/client/catalogComponents/model/...) so tests
 * and the eval runner can inject a stub client or a fixed catalog, plus an
 * optional `threadId` to key the in-request MemorySaver checkpointer.
 */
export type KeybotAgentOptions = GenerateKeybotResponseOptions & {
  threadId?: string;
};
