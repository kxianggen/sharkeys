import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { classifyNode } from "@/lib/agent/nodes/classify";
import type { KeybotAgentStateType } from "@/lib/agent/state";
import { classifyKeybotMessage } from "@/lib/keybot/service";
import { OPENAI_MAX_RETRIES, OPENAI_TIMEOUT_MS } from "@/lib/openai";

const chatOpenAI = vi.hoisted(() => ({
  constructorArgs: [] as unknown[],
  invoke: vi.fn(),
}));

vi.mock("@langchain/openai", () => ({
  ChatOpenAI: class {
    constructor(fields: unknown) {
      chatOpenAI.constructorArgs.push(fields);
    }

    withStructuredOutput() {
      return { invoke: chatOpenAI.invoke };
    }
  },
}));

const openAIKeyEnv = "OPENAI" + "_API_KEY";
const vagueMessage = "hmm";

function stateFor(message: string) {
  return { request: { message } } as KeybotAgentStateType;
}

describe("classifyNode LLM router", () => {
  const previous = {
    [openAIKeyEnv]: process.env[openAIKeyEnv],
    KEYBOT_LLM_CLASSIFY: process.env.KEYBOT_LLM_CLASSIFY,
  };

  beforeEach(() => {
    process.env[openAIKeyEnv] = "test-key";
    process.env.KEYBOT_LLM_CLASSIFY = "true";
    chatOpenAI.constructorArgs.length = 0;
    chatOpenAI.invoke.mockReset();
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("only reaches the LLM for messages the regex leaves vague", () => {
    expect(classifyKeybotMessage(vagueMessage)).toBe("vague_question");
  });

  it("builds ChatOpenAI with the shared timeout and retry limit", async () => {
    chatOpenAI.invoke.mockResolvedValue({ category: "small_talk" });

    const result = await classifyNode(stateFor(vagueMessage));

    expect(result.classification).toBe("small_talk");
    expect(chatOpenAI.constructorArgs).toHaveLength(1);
    expect(chatOpenAI.constructorArgs[0]).toMatchObject({
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: OPENAI_MAX_RETRIES,
    });
  });

  it("falls back to the regex label when the LLM call times out", async () => {
    chatOpenAI.invoke.mockRejectedValue(new Error("Request timed out."));

    const result = await classifyNode(stateFor(vagueMessage));

    expect(result.classification).toBe("vague_question");
  });
});
