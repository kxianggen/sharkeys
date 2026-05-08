import { describe, expect, it } from "vitest";

import {
  buildValidatedRecommendations,
  createRecommendationResult,
} from "@/lib/recommendations";
import { extractedKeyboardIntentSchema, prepareIntentMatches } from "@/lib/ai";
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
  case: ["case_neo65_gasket"],
  pcb: ["pcb_neo65_mx_hotswap"],
  plate: ["plate_neo65_fr4"],
  switch: ["switch_mx_linear_creamy"],
  keycap: ["keycap_cherry_ansi_mx"],
  stabilizer: ["stab_durock_v2_screw_in"],
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
        case: ["case_budget60_tray", "case_neo65_gasket"],
      },
      maxRecommendations: 2,
    });

    expect(assembly.rejectedBuildCount).toBeGreaterThan(0);
    expect(assembly.recommendations).toHaveLength(1);
    expect(assembly.recommendations[0].componentIds.case).toBe(
      "case_neo65_gasket",
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
        case: ["case_budget60_tray"],
        pcb: ["pcb_neo65_mx_hotswap"],
        plate: ["plate_tkl_pom"],
        switch: ["switch_mx_linear_creamy"],
        keycap: ["keycap_cherry_ansi_mx"],
        stabilizer: ["stab_durock_v2_screw_in"],
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
        currency: "USD",
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
});
