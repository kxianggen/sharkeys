// TODO(catalog-rewrite): it.skip tests below are pinned to the pre-19-part seed catalog
// (deleted component IDs + obsolete 75% aluminum blocker). Repoint fixtures to new IDs and unskip.
import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import {
  generateKeybotResponse,
  type GenerateKeybotResponseOptions,
  type KeybotRequest,
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

function generateRequestWithCatalog(
  request: KeybotRequest,
  options: GenerateKeybotResponseOptions = {},
) {
  return generateKeybotResponse(request, {
    catalogComponents: keyboardComponents,
    ...options,
  });
}

describe("Keybot service", () => {
  it("answers small talk without unrelated catalog suggestions", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateWithCatalog("Hi, how are you?");

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.answer).toContain("Hey, I'm Keybot");
      expect(result.answer).toContain("switches");
      expect(result.answer).toContain("compatibility");
      expect(result.answer).not.toContain("Gateron");
      expect(result.answer).not.toContain("Keychron");
      expect(result.answer).not.toContain("Yunzii");
      expect(result.relatedComponentIds).toEqual([]);
      expect(result.usedCatalogContext).toBe(false);
      expect(result.usedRecommendationEngine).toBe(false);
    });
  });

  it("answers capability help without listing catalog products", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateWithCatalog("What can you do?");

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.answer).toContain("explain keyboard terms");
      expect(result.answer).toContain("recommend builds");
      expect(result.answer).toContain("deterministic validation");
      expect(result.answer).not.toContain("Gateron");
      expect(result.relatedComponentIds).toEqual([]);
      expect(result.usedRecommendationEngine).toBe(false);
    });
  });

  it("asks for build context before offering cheaper directions", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateWithCatalog("Can I make this cheaper?");

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.answer).toContain("after you generate or select a build");
      expect(result.answer).toContain("quiet office keyboard under RM500");
      expect(result.answer).not.toContain("Gateron");
      expect(result.relatedComponentIds).toEqual([]);
      expect(result.usedCatalogContext).toBe(false);
      expect(result.usedRecommendationEngine).toBe(false);
    });
  });

  it.skip("uses selected build context for grounded cheaper guidance", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateRequestWithCatalog({
        message: "Can I make this cheaper?",
        context: {
          selectedComponentIds: {
            case: "case_keychron_v2_max_65_abs",
            pcb: "pcb_keychron_v2_max_65_hotswap",
            plate: "plate_keychron_v2_max_65_pc",
            switch: "switch_akko_penguin_silent",
            keycap: "keycap_unknown_standard_white_jp_cherry",
            stabilizer: "stab_keychron_v2_max_screw_in",
          },
        },
      });

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.answer).toContain("current build context");
      expect(result.answer).toContain("Keychron V2 Max 65% ABS Case");
      expect(result.answer).toContain("Akko Penguin Silent Tactile Switch");
      expect(result.answer).toContain("lower budget");
      expect(result.answer).toContain("kit-locked structural parts");
      expect(result.answer).toContain("will not invent lower-priced products");
      expect(result.relatedComponentIds).toContain(
        "switch_akko_penguin_silent",
      );
      expect(result.usedCatalogContext).toBe(true);
      expect(result.usedRecommendationEngine).toBe(false);
    });
  });

  it.skip("explains why that selected build was chosen using grounded context", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateRequestWithCatalog({
        message: "why that one?",
        context: {
          selectedComponentIds: {
            case: "case_keychron_v2_max_65_abs",
            pcb: "pcb_keychron_v2_max_65_hotswap",
            plate: "plate_keychron_v2_max_65_pc",
            switch: "switch_akko_penguin_silent",
            keycap: "keycap_unknown_standard_white_jp_cherry",
            stabilizer: "stab_keychron_v2_max_screw_in",
          },
        },
      });

      expect(result.answer).toContain("deterministic compatibility");
      expect(result.answer).toContain("Keychron V2 Max 65% ABS Case");
      expect(result.answer).toContain("Akko Penguin Silent Tactile Switch");
      expect(result.answer).not.toContain("FakeBoard");
      expect(result.usedCatalogContext).toBe(true);
      expect(result.usedRecommendationEngine).toBe(false);
    });
  });

  it.skip("explains the selected switch when a selected build exists", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateRequestWithCatalog({
        message: "why did you choose this switch?",
        context: {
          selectedComponentIds: {
            case: "case_keychron_v2_max_65_abs",
            pcb: "pcb_keychron_v2_max_65_hotswap",
            plate: "plate_keychron_v2_max_65_pc",
            switch: "switch_akko_penguin_silent",
            keycap: "keycap_unknown_standard_white_jp_cherry",
            stabilizer: "stab_keychron_v2_max_screw_in",
          },
        },
      });

      expect(result.answer).toContain("Akko Penguin Silent Tactile Switch");
      expect(result.answer).toContain("selected switch");
      expect(result.answer).toContain("sound profile is silent");
      expect(result.answer).toContain("deterministic validation");
      expect(result.relatedComponentIds).toContain(
        "switch_akko_penguin_silent",
      );
    });
  });

  it("asks for selected context before explaining a switch follow-up", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateWithCatalog(
        "why did you choose this switch?",
      );

      expect(result.answer).toContain("trusted selected switch ID");
      expect(result.relatedComponentIds).toEqual([]);
      expect(result.usedCatalogContext).toBe(false);
      expect(result.usedRecommendationEngine).toBe(false);
    });
  });

  it.skip("checks selected compatibility with deterministic validation for follow-ups", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateRequestWithCatalog({
        message: "is this compatible?",
        context: {
          selectedComponentIds: {
            case: "case_keychron_v2_max_65_abs",
            pcb: "pcb_keychron_v2_max_65_hotswap",
            plate: "plate_keychron_v2_max_65_pc",
            switch: "switch_akko_penguin_silent",
            keycap: "keycap_unknown_standard_white_jp_cherry",
            stabilizer: "stab_keychron_v2_max_screw_in",
          },
        },
      });

      expect(result.answer).toContain("compatible");
      expect(result.answer).toContain("deterministic rule engine");
      expect(result.usedCatalogContext).toBe(true);
    });
  });

  it("treats quieter follow-ups as refinement requests instead of random products", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateRequestWithCatalog({
        message: "what about quieter?",
        context: {
          selectedComponentIds: {
            case: "case_keychron_v2_max_65_abs",
            pcb: "pcb_keychron_v2_max_65_hotswap",
            plate: "plate_keychron_v2_max_65_pc",
            switch: "switch_gateron_seasalt_smoothie",
            keycap: "keycap_unknown_standard_white_jp_cherry",
            stabilizer: "stab_keychron_v2_max_screw_in",
          },
        },
      });

      expect(result.answer).toContain("new preference");
      expect(result.answer).toContain("quieter or silent direction");
      expect(result.answer).toContain("new validated recommendation search");
      expect(result.answer).not.toContain("random");
      expect(result.usedRecommendationEngine).toBe(false);
    });
  });

  it("does not trust recent messages as product facts", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateRequestWithCatalog({
        message: "why that one?",
        context: {
          recentMessages: [
            {
              role: "assistant",
              content:
                "The FakeBoard X uses ImaginaryVendor switches and costs MYR 99.",
            },
          ],
        },
      });

      expect(result.answer).toContain("selected catalog component IDs");
      expect(result.answer).not.toContain("FakeBoard X");
      expect(result.answer).not.toContain("ImaginaryVendor");
      expect(result.answer).not.toContain("MYR 99");
      expect(result.relatedComponentIds).toEqual([]);
    });
  });

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

  it.skip("explains no-build blockers for unsupported 75% aluminum requests", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateWithCatalog("75% aluminum keyboard");

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.usedRecommendationEngine).toBe(true);
      expect(result.answer).toContain("could not find");
      expect(result.answer).toContain("75% PCB");
      expect(result.clarificationQuestion).toContain("Try allowing TKL or 65%");
    });
  });

  it("explains kit-locked structural part mismatches", async () => {
    await withOpenAIEnv({ [openAIKeyEnv]: undefined }, async () => {
      const result = await generateWithCatalog(
        "Can I use Star 80 PCB in Yunzii B87 case?",
      );

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.answer).toContain("kit-derived structural parts");
      expect(result.answer).toContain("same kitId");
      expect(result.answer).toContain("Weikav Star 80 PCB");
      expect(result.answer).toContain("Yunzii B87 case");
      expect(result.usedRecommendationEngine).toBe(false);
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
