import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import {
  generateKeybotResponse,
  type GenerateKeybotResponseOptions,
} from "@/lib/keybot";

const openAIKeyEnv = "OPENAI" + "_API_KEY";
const openAIModelEnv = "OPENAI" + "_MODEL";
const openAIMaxOutputTokensEnv = "OPENAI" + "_MAX_OUTPUT_TOKENS";

async function withOpenAIEnv<T>(
  env: Record<string, string | undefined>,
  callback: () => Promise<T>,
) {
  const previousValues = Object.fromEntries(
    Object.keys(env).map((key) => [key, process.env[key]]),
  );

  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return await callback();
  } finally {
    for (const [key, value] of Object.entries(previousValues)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function generateWithCatalog(
  message: string,
  options: GenerateKeybotResponseOptions = {},
) {
  return generateKeybotResponse(
    {
      message,
    },
    {
      catalogComponents: keyboardComponents,
      ...options,
    },
  );
}

describe("Keybot service", () => {
  it("answers concept questions with deterministic fallback when the OpenAI key is missing", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateWithCatalog("What is a thocky keyboard?");

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.answer).toContain("deeper");
      expect(result.usedRecommendationEngine).toBe(false);
    });
  });

  it("summarizes a validated recommendation through deterministic fallback", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateWithCatalog(
        "Recommend a quiet office keyboard under RM800",
      );

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.usedRecommendationEngine).toBe(true);
      expect(result.answer).toContain("validated build");
      expect(result.answer).toContain("deterministic compatibility");
      expect(result.relatedComponentIds?.length).toBeGreaterThan(0);
    });
  });

  it("explains no-build blockers for unsupported 75% aluminum requests", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateWithCatalog("75% aluminum keyboard");

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.usedRecommendationEngine).toBe(true);
      expect(result.answer).toContain("could not find");
      expect(result.answer).toContain("75% PCB");
      expect(result.clarificationQuestion).toContain("Try allowing TKL or 65%");
    });
  });

  it("uses mocked OpenAI output when available and keeps related IDs grounded", async () => {
    await withOpenAIEnv(
      {
        [openAIKeyEnv]: "test-openai-key",
        [openAIModelEnv]: "gpt-keybot-test-model",
        [openAIMaxOutputTokensEnv]: "222",
      },
      async () => {
        let capturedModel: string | undefined;
        let capturedMaxOutputTokens: number | undefined;
        const result = await generateWithCatalog("What is a thocky keyboard?", {
          client: {
            responses: {
              parse: async (input: {
                model?: string;
                max_output_tokens?: number;
              }) => {
                capturedModel = input.model;
                capturedMaxOutputTokens = input.max_output_tokens;

                return {
                  output_parsed: {
                    answer:
                      "Thocky means a deeper rounded sound in the provided catalog facts.",
                    relatedComponentIds: [
                      "switch_gateron_milky_yellow_pro",
                      "fake_component_id",
                    ],
                    clarificationQuestion: null,
                  },
                };
              },
            },
          } as unknown as GenerateKeybotResponseOptions["client"],
        });

        expect(capturedModel).toBe("gpt-keybot-test-model");
        expect(capturedMaxOutputTokens).toBe(222);
        expect(result.source).toBe("openai");
        expect(result.answer).toContain("deeper, rounded sound");
        expect(result.answer).toContain(
          "OpenAI helped format this response from grounded sharkeys facts.",
        );
        expect(result.relatedComponentIds).toContain(
          "switch_gateron_milky_yellow_pro",
        );
        expect(result.relatedComponentIds).not.toContain("fake_component_id");
      },
    );
  });

  it("does not expose hallucinated OpenAI answer claims", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: "test-openai-key" }, async () => {
      const result = await generateWithCatalog("What is a thocky keyboard?", {
        client: {
          responses: {
            parse: async () => ({
              output_parsed: {
                answer:
                  "Buy the FakeBoard X from ImaginaryVendor for MYR 99. It is in stock and fully compatible with every optical PCB.",
                relatedComponentIds: [
                  "switch_gateron_milky_yellow_pro",
                  "fake_component_id",
                ],
                clarificationQuestion:
                  "Do you want the FakeBoard X in red or blue?",
              },
            }),
          },
        } as unknown as GenerateKeybotResponseOptions["client"],
      });

      expect(result.source).toBe("openai");
      expect(result.answer).not.toContain("FakeBoard X");
      expect(result.answer).not.toContain("ImaginaryVendor");
      expect(result.answer).not.toContain("MYR 99");
      expect(result.answer).not.toContain("in stock");
      expect(result.answer).not.toContain("fully compatible with every optical PCB");
      expect(result.answer).toContain("deeper, rounded sound");
      expect(result.answer).toContain(
        "OpenAI helped format this response from grounded sharkeys facts.",
      );
      expect(result.relatedComponentIds).toContain(
        "switch_gateron_milky_yellow_pro",
      );
      expect(result.relatedComponentIds).not.toContain("fake_component_id");
      expect(result.clarificationQuestion).toBeNull();
    });
  });

  it("falls back safely when OpenAI fails", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: "test-openai-key" }, async () => {
      const result = await generateWithCatalog("Linear vs tactile switches", {
        client: {
          responses: {
            parse: async () => {
              throw { status: 429 };
            },
          },
        } as unknown as GenerateKeybotResponseOptions["client"],
      });

      expect(result.source).toBe("fallback_error");
      expect(result.answer).toContain("Linear switches");
      expect(result.error).toContain("status 429");
    });
  });

  it("ignores secret-looking tokens from mocked OpenAI output", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: "test-openai-key" }, async () => {
      const secretLookingToken = "s" + "k-test-secret";
      const secondSecretLookingToken = "s" + "k-another-secret";
      const result = await generateWithCatalog("What is a thocky keyboard?", {
        client: {
          responses: {
            parse: async () => ({
              output_parsed: {
                answer: `The key is ${secretLookingToken} and OpenAI key=${secondSecretLookingToken}.`,
                relatedComponentIds: [],
                clarificationQuestion: null,
              },
            }),
          },
        } as unknown as GenerateKeybotResponseOptions["client"],
      });

      expect(result.source).toBe("openai");
      expect(result.answer).not.toContain(secretLookingToken);
      expect(result.answer).not.toContain(secondSecretLookingToken);
      expect(result.answer).toContain("deeper, rounded sound");
    });
  });
});
