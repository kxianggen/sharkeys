import { describe, expect, it } from "vitest";

import {
  buildValidatedRecommendations,
  createRecommendationResult,
  generateRecommendationsFromMessage,
} from "@/lib/recommendations";
import { extractedKeyboardIntentSchema, prepareIntentMatches } from "@/lib/ai";
import { PROTOTYPE_USD_TO_MYR_RATE } from "@/lib/pricing";
import type {
  ComponentCandidateIdsByCategory,
  ExtractedKeyboardIntent,
  IntentPreparation,
} from "@/lib/ai";

function makeIntent(
  overrides: Partial<ExtractedKeyboardIntent> = {},
): ExtractedKeyboardIntent {
  return extractedKeyboardIntentSchema.parse({
    budget: null,
    layout: "65",
    soundProfile: "creamy",
    useCase: "typing",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    priorities: ["sound", "beginner_friendly"],
    constraints: [],
    clarificationNeeded: false,
    clarificationQuestion: null,
    ...overrides,
  });
}

const validCandidateIds: ComponentCandidateIdsByCategory = {
  case: ["case_zuoya_gmk67_v2_kit_case"],
  pcb: ["pcb_zuoya_gmk67_v2_hotswap"],
  plate: ["plate_zuoya_gmk67_v2_pc"],
  switch: ["switch_gateron_milky_yellow_pro"],
  keycap: ["keycap_mecha_bow_cherry_pbt"],
  stabilizer: ["stab_zuoya_gmk67_plate_mount"],
};

describe("recommendation service", () => {
  it("returns only builds that passed deterministic validation", () => {
    const intent = makeIntent();
    const result = createRecommendationResult(
      {
        intent,
        source: "openai",
      },
      {
        preparation: prepareIntentMatches(intent),
        maxRecommendations: 2,
      },
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(
      result.recommendations.every(
        (recommendation) => recommendation.validation.isValid,
      ),
    ).toBe(true);
    expect(result.explanations[0]).toContain("passed deterministic");
  });

  it("filters invalid candidate combinations before returning recommendations", () => {
    const assembly = buildValidatedRecommendations({
      intent: makeIntent(),
      candidateComponentIds: {
        ...validCandidateIds,
        case: [
          "case_razer_huntsman_mini_60_case",
          "case_zuoya_gmk67_v2_kit_case",
        ],
      },
      maxRecommendations: 2,
    });

    expect(assembly.rejectedBuildCount).toBeGreaterThan(0);
    expect(assembly.recommendations).toHaveLength(1);
    expect(assembly.recommendations[0].componentIds.case).toBe(
      "case_zuoya_gmk67_v2_kit_case",
    );
    expect(assembly.recommendations[0].validation.isValid).toBe(true);
  });

  it("returns a clarification prompt when no valid build can be assembled", () => {
    const intent = makeIntent({
      clarificationNeeded: true,
      clarificationQuestion: "Would you prefer a 60% or 65% layout?",
    });
    const preparation: IntentPreparation = {
      criteria: {
        layout: "65",
        switchTechnology: "mechanical",
      },
      candidateComponentIds: {
        case: ["case_razer_huntsman_mini_60_case"],
        pcb: ["pcb_zuoya_gmk67_v2_hotswap"],
        plate: ["plate_mkb_siren_vk87_pc"],
        switch: ["switch_gateron_milky_yellow_pro"],
        keycap: ["keycap_mecha_bow_cherry_pbt"],
        stabilizer: ["stab_zuoya_gmk67_plate_mount"],
      },
    };
    const result = createRecommendationResult(
      {
        intent,
        source: "openai",
      },
      {
        preparation,
      },
    );

    expect(result.recommendations).toEqual([]);
    expect(result.explanations[0]).toContain("No valid build");
    expect(result.clarificationPrompt).toBe(
      "Would you prefer a 60% or 65% layout?",
    );
  });

  it("does not return builds above the extracted total budget", () => {
    const intent = makeIntent({
      budget: {
        amount: 300,
        currency: "MYR",
        label: "mid_range",
      },
    });
    const result = createRecommendationResult(
      {
        intent,
        source: "openai",
      },
      {
        preparation: {
          criteria: {
            layout: "65",
            maxPrice: 300,
            currency: "MYR",
          },
          candidateComponentIds: validCandidateIds,
        },
      },
    );

    expect(result.recommendations).toEqual([]);
    expect(result.explanations).toContain(
      "Estimated build price exceeds the extracted budget.",
    );
  });

  it("returns MYR price estimates for Malaysia seed recommendations", () => {
    const result = createRecommendationResult(
      {
        intent: makeIntent({
          budget: {
            amount: 500,
            currency: "MYR",
            label: "mid_range",
          },
        }),
        source: "openai",
      },
      {
        preparation: {
          criteria: {
            layout: "65",
            maxPrice: 500,
            currency: "MYR",
          },
          candidateComponentIds: validCandidateIds,
        },
      },
    );

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].estimatedPriceCurrency).toBe("MYR");
    expect(result.recommendations[0].estimatedPrice).toBeGreaterThan(0);
    expect(result.recommendations[0].estimatedPrice).toBeLessThanOrEqual(500);
  });

  it("keeps RM500 prompt results within the MYR catalog budget", async () => {
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await generateRecommendationsFromMessage({
        message: "beginner friendly creamy 65% keyboard under RM500",
      });

      expect(result.intent.budget).toMatchObject({
        amount: 500,
        currency: "MYR",
      });
      expect(result.criteria).toMatchObject({
        maxPrice: 500,
        currency: "MYR",
      });
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(
        result.recommendations.every(
          (recommendation) =>
            recommendation.validation.isValid &&
            recommendation.estimatedPriceCurrency === "MYR" &&
            recommendation.estimatedPrice !== null &&
            recommendation.estimatedPrice <= 500,
        ),
      ).toBe(true);
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("filters USD budgets through deterministic MYR conversion", async () => {
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await generateRecommendationsFromMessage({
        message: "beginner friendly creamy 65% keyboard under $50",
      });

      expect(result.intent.budget).toMatchObject({
        amount: 50,
        currency: "USD",
      });
      expect(result.criteria.currency).toBe("MYR");
      expect(result.criteria.maxPrice).toBeCloseTo(
        50 * PROTOTYPE_USD_TO_MYR_RATE,
      );
      expect(result.recommendations).toEqual([]);
      expect(result.explanations).toContain(
        "Estimated build price exceeds the extracted budget.",
      );
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("does not silently return unfiltered MYR builds for low USD office budgets", async () => {
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await generateRecommendationsFromMessage({
        message: "quiet office keyboard under $50",
      });

      expect(result.intent.useCase).toBe("office");
      expect(result.intent.soundProfile).toBe("silent");
      expect(result.intent.budget).toMatchObject({
        amount: 50,
        currency: "USD",
      });
      expect(result.criteria.currency).toBe("MYR");
      expect(result.criteria.maxPrice).toBeCloseTo(
        50 * PROTOTYPE_USD_TO_MYR_RATE,
      );
      expect(result.recommendations).toEqual([]);
      expect(result.explanations).toContain(
        "Estimated build price exceeds the extracted budget.",
      );
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });
});
