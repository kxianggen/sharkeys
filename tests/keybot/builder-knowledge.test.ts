import { describe, expect, it } from "vitest";

import {
  buildOpenAIPromptPayload,
  composeKeybotSystemPrompt,
  type KeybotFacts,
} from "@/lib/keybot/service";
import {
  builderExpertiseGuidanceRules,
  builderKnowledge,
} from "@/lib/keybot/builder-knowledge";
import { getComponentById } from "@/lib/components";
import { keyboardComponents } from "@/data";

const emptyFacts: KeybotFacts = {
  request: { message: "recommend a first keyboard" },
  classification: "build_request",
  relevantComponents: [],
  selectedComponents: [],
  selectedValidation: null,
  recommendationResult: null,
  deterministicAnswer: "placeholder",
  clarificationQuestion: null,
};

describe("builder knowledge module", () => {
  it("covers the core expertise topics", () => {
    const topics = builderKnowledge.map((entry) => entry.topic);

    expect(topics).toEqual(
      expect.arrayContaining([
        "layout_and_use_case",
        "switch_advice",
        "budget_wisdom",
        "hotswap_vs_soldered",
        "premium_feel",
      ]),
    );
    expect(builderKnowledge.length).toBeGreaterThanOrEqual(10);
    for (const entry of builderKnowledge) {
      expect(entry.guidance.length).toBeGreaterThan(20);
    }
  });

  it("frames picks as recommendations, never as statistics", () => {
    const joined = builderExpertiseGuidanceRules.join(" ");

    expect(joined).toMatch(/never as statistics/i);
    expect(joined).toMatch(/most popular/i);
    // Grounding must still bind — expertise supplements, never overrides.
    expect(joined).toMatch(/never invent parts, prices/i);
  });
});

describe("Meg grounding wiring", () => {
  it("includes the builder expertise guidance in the system prompt", () => {
    const prompt = composeKeybotSystemPrompt(false);

    // Base never-invent rule is still present (grounding intact).
    expect(prompt).toMatch(/Do not invent products, prices/i);
    // Builder expertise guidance is appended on the non-image (base) surface.
    expect(prompt).toContain(builderExpertiseGuidanceRules[0]);
    expect(prompt).toMatch(/builderExpertise/);
  });

  it("keeps the guidance on the image (community photo) surface too", () => {
    const prompt = composeKeybotSystemPrompt(true);

    expect(prompt).toContain(builderExpertiseGuidanceRules[0]);
    // Image honesty rules layer on without dropping the expertise.
    expect(prompt).toMatch(/hedged/i);
  });

  it("carries the builder expertise into the OpenAI prompt payload", () => {
    const payload = buildOpenAIPromptPayload(emptyFacts);

    expect(payload.builderExpertise).toEqual(builderKnowledge);
    expect(payload.builderExpertise.length).toBeGreaterThan(0);
  });

  it("exposes builderPick on component facts so Meg can cite it", () => {
    const luckyCase = getComponentById(
      "case_lucky65_v3_65_aluminum",
      keyboardComponents,
    );
    expect(luckyCase).toBeDefined();

    const payload = buildOpenAIPromptPayload({
      ...emptyFacts,
      relevantComponents: luckyCase ? [luckyCase] : [],
    });

    expect(payload.relevantComponents[0]?.metadata.builderPick).toBe(true);
    expect(payload.relevantComponents[0]?.metadata.builderPickNote).toMatch(
      /top pick/i,
    );
  });
});
