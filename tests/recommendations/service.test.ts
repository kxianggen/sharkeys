// TODO(catalog-rewrite): it.skip tests below are pinned to the pre-19-part seed catalog
// (deleted component IDs + obsolete 75% aluminum blocker). Repoint fixtures to new IDs and unskip.
import { describe, expect, it } from "vitest";

import {
  buildValidatedRecommendations,
  createRecommendationResult,
  generateRecommendationsFromMessage,
  scoreRecommendation,
} from "@/lib/recommendations";
import { extractedKeyboardIntentSchema, prepareIntentMatches } from "@/lib/ai";
import { PROTOTYPE_USD_TO_MYR_RATE } from "@/lib/pricing";
import { keyboardComponents } from "@/data";
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
  case: ["case_lucky65_v3_65_aluminum"],
  pcb: ["pcb_lucky65_v3_65_hotswap"],
  plate: ["plate_lucky65_v3_65_fr4"],
  switch: ["switch_gateron_milky_yellow_pro"],
  keycap: ["keycap_unknown_pudding_oem_pbt"],
  stabilizer: ["stab_lucky65_v3_screw_in"],
};

async function withMissingOpenAiKey<T>(callback: () => Promise<T>) {
  const previousApiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    return await callback();
  } finally {
    if (previousApiKey !== undefined) {
      process.env.OPENAI_API_KEY = previousApiKey;
    }
  }
}

function expectValidatedRecommendations(
  result: Awaited<ReturnType<typeof generateRecommendationsFromMessage>>,
) {
  expect(result.recommendations.length).toBeGreaterThan(0);
  expect(
    result.recommendations.every(
      (recommendation) => recommendation.validation.isValid,
    ),
  ).toBe(true);
}

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

  it.skip("filters invalid candidate combinations before returning recommendations", () => {
    const assembly = buildValidatedRecommendations({
      intent: makeIntent(),
      candidateComponentIds: {
        ...validCandidateIds,
        case: [
          "case_weikav_star80_tkl_aluminum",
          "case_lucky65_v3_65_aluminum",
        ],
      },
      maxRecommendations: 2,
    });

    expect(assembly.rejectedBuildCount).toBeGreaterThan(0);
    expect(assembly.recommendations).toHaveLength(1);
    expect(assembly.recommendations[0].componentIds.case).toBe(
      "case_lucky65_v3_65_aluminum",
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
        case: ["case_weikav_star80_tkl_aluminum"],
        pcb: ["pcb_lucky65_v3_65_hotswap"],
        plate: ["plate_weikav_star80_tkl_fr4"],
        switch: ["switch_gateron_milky_yellow_pro"],
        keycap: ["keycap_unknown_pudding_oem_pbt"],
        stabilizer: ["stab_lucky65_v3_screw_in"],
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
      "Try adding a layout, sound profile, use case, or budget so sharkeys can narrow the validated catalog paths.",
    );
  });

  it.skip("does not return builds above the extracted total budget", () => {
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

  it.skip("ranks closer sound and use-case matches above looser valid builds", () => {
    const intent = makeIntent({
      budget: {
        amount: 800,
        currency: "MYR",
        label: "premium",
      },
      soundProfile: "silent",
      useCase: "office",
      priorities: ["sound"],
    });
    const assembly = buildValidatedRecommendations({
      intent,
      candidateComponentIds: {
        ...validCandidateIds,
        switch: [
          "switch_gateron_milky_yellow_pro",
          "switch_akko_penguin_silent",
        ],
      },
      maxRecommendations: 2,
    });

    expect(assembly.recommendations).toHaveLength(2);
    expect(assembly.recommendations[0].components.switch.id).toBe(
      "switch_akko_penguin_silent",
    );
    expect(
      scoreRecommendation(assembly.recommendations[0], intent),
    ).toBeGreaterThan(scoreRecommendation(assembly.recommendations[1], intent));
  });

  it.skip("returns MYR price estimates for Malaysia seed recommendations", () => {
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

  it.skip("can generate recommendations against an injected catalog component set", async () => {
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const catalogComponents = keyboardComponents.filter((component) =>
        Object.values(validCandidateIds).flat().includes(component.id),
      );
      const result = await generateRecommendationsFromMessage(
        {
          message: "beginner friendly creamy 65% keyboard under RM500",
        },
        {
          catalogComponents,
          maxRecommendations: 1,
        },
      );

      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].validation.isValid).toBe(true);
      expect(Object.values(result.recommendations[0].componentIds)).toEqual(
        expect.arrayContaining(Object.values(validCandidateIds).flat()),
      );
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
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
    await withMissingOpenAiKey(async () => {
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
    });
  });

  it("returns a validated beginner-friendly 65% recommendation under RM500", async () => {
    await withMissingOpenAiKey(async () => {
      const result = await generateRecommendationsFromMessage({
        message: "beginner friendly 65% keyboard under RM500",
      });

      expect(result.intent.layout).toBe("65");
      expect(result.intent.budget).toMatchObject({
        amount: 500,
        currency: "MYR",
      });
      expectValidatedRecommendations(result);
      expect(result.recommendations[0].estimatedPrice).toBeLessThanOrEqual(500);
    });
  });

  it("returns a validated quiet office recommendation under RM800", async () => {
    await withMissingOpenAiKey(async () => {
      const result = await generateRecommendationsFromMessage({
        message: "quiet office keyboard under RM800",
      });

      expect(result.intent.useCase).toBe("office");
      expect(result.intent.soundProfile).toBe("silent");
      expectValidatedRecommendations(result);
      expect(result.recommendations[0].estimatedPrice).toBeLessThanOrEqual(800);
    });
  });

  it.skip("holds 75% aluminum recommendations until PCB stabilizer support is verified", async () => {
    await withMissingOpenAiKey(async () => {
      const result = await generateRecommendationsFromMessage({
        message: "75% aluminum keyboard",
      });

      expect(result.intent.layout).toBe("75");
      expect(result.recommendations).toEqual([]);
      expect(result.explanations).toContain(
        "The current curated catalog does not yet have a verified 75% PCB and stabilizer compatibility path.",
      );
      expect(result.explanations).toContain(
        "No catalog candidates were available for: pcb.",
      );
      expect(result.clarificationPrompt).toContain("Try allowing TKL or 65%");
    });
  });

  it("anchors every recommendation to the requested kit", async () => {
    await withMissingOpenAiKey(async () => {
      const result = await generateRecommendationsFromMessage({
        message: "Start from the GMK67 barebones kit",
        kitId: "gmk67",
      });

      expectValidatedRecommendations(result);
      expect(result.recommendations.length).toBeGreaterThan(0);
      for (const recommendation of result.recommendations) {
        expect(recommendation.components.case.metadata?.kitId).toBe("gmk67");
      }
    });
  });

  it("ignores an unknown kit anchor instead of failing", async () => {
    await withMissingOpenAiKey(async () => {
      const result = await generateRecommendationsFromMessage({
        message: "beginner friendly 65% keyboard",
        kitId: "does_not_exist",
      });

      expectValidatedRecommendations(result);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  it("returns a validated 60% typing recommendation path", async () => {
    await withMissingOpenAiKey(async () => {
      const result = await generateRecommendationsFromMessage({
        message: "60% typing keyboard",
      });

      expect(result.intent.layout).toBe("60");
      expect(result.intent.useCase).toBe("typing");
      expectValidatedRecommendations(result);
    });
  });

  it("does not recommend cross-kit structural combinations", async () => {
    await withMissingOpenAiKey(async () => {
      const result = await generateRecommendationsFromMessage({
        message: "60% typing keyboard",
      });

      expectValidatedRecommendations(result);

      for (const recommendation of result.recommendations) {
        const structuralKitIds = [
          recommendation.components.case,
          recommendation.components.pcb,
          recommendation.components.plate,
          recommendation.components.stabilizer,
        ]
          .filter(isKitLockedStructuralComponent)
          .map((component) => getMetadataString(component.metadata, "kitId"));

        expect(new Set(structuralKitIds).size).toBeLessThanOrEqual(1);
      }
    });
  });

  it("returns a validated clacky/clicky recommendation path", async () => {
    await withMissingOpenAiKey(async () => {
      const result = await generateRecommendationsFromMessage({
        message: "clacky/clicky keyboard",
      });

      expect(result.intent.soundProfile).toBe("clacky");
      expectValidatedRecommendations(result);
      expect(result.recommendations[0].components.switch.soundProfile).toBe(
        "clacky",
      );
    });
  });

  it.skip("uses OpenAI explanation calls only for a safe overall notice", async () => {
    const result = await generateRecommendationsFromMessage(
      {
        message: "beginner friendly creamy 65% keyboard under RM500",
      },
      {
        extraction: {
          intent: makeIntent({
            budget: {
              amount: 500,
              currency: "MYR",
              label: "mid_range",
            },
          }),
          source: "openai",
        },
        catalogComponents: keyboardComponents.filter((component) =>
          Object.values(validCandidateIds).flat().includes(component.id),
        ),
        maxRecommendations: 1,
        explanationClient: {
          responses: {
            parse: async () => ({
              output_parsed: {
                recommendations: [
                  {
                    id: "validated_build_1",
                    explanations: [
                      "Keychron V2 Max and Gateron Milky Yellow Pro fit the validated 65% creamy brief.",
                    ],
                  },
                ],
                overallExplanations: [
                  "AI wording was generated only from selected component facts.",
                ],
                clarificationPrompt: null,
              },
            }),
          },
        } as never,
      },
    );

    expectValidatedRecommendations(result);
    expect(result.explanations).toContain(
      "AI wording was generated from already validated recommendation facts; technical recommendation explanations remain deterministic.",
    );
    expect(result.recommendations[0].explanations).not.toContain(
      "Keychron V2 Max and Gateron Milky Yellow Pro fit the validated 65% creamy brief.",
    );
  });

  it.skip("does not include hallucinated OpenAI recommendation claims", async () => {
    const hallucinatedClaim =
      "The unselected Glorious GMMK Pro aluminum optical PCB from FakeVendor costs MYR 199 and is fully compatible.";
    const result = await generateRecommendationsFromMessage(
      {
        message: "beginner friendly creamy 65% keyboard under RM500",
      },
      {
        extraction: {
          intent: makeIntent({
            budget: {
              amount: 500,
              currency: "MYR",
              label: "mid_range",
            },
          }),
          source: "openai",
        },
        catalogComponents: keyboardComponents.filter((component) =>
          Object.values(validCandidateIds).flat().includes(component.id),
        ),
        maxRecommendations: 1,
        explanationClient: {
          responses: {
            parse: async () => ({
              output_parsed: {
                recommendations: [
                  {
                    id: "validated_build_1",
                    explanations: [hallucinatedClaim],
                  },
                ],
                overallExplanations: [hallucinatedClaim],
                clarificationPrompt: "Buy the fake optical build instead.",
              },
            }),
          },
        } as never,
      },
    );
    const allRecommendationText =
      result.recommendations[0].explanations.join(" ");

    expectValidatedRecommendations(result);
    expect(allRecommendationText).not.toContain("Glorious GMMK Pro");
    expect(allRecommendationText).not.toContain("FakeVendor");
    expect(allRecommendationText).not.toContain("optical PCB");
    expect(allRecommendationText).not.toContain("MYR 199");
    expect(result.explanations).not.toContain(hallucinatedClaim);
    expect(result.clarificationPrompt).toBeNull();
    expect(result.explanations).toContain(
      "AI wording was generated from already validated recommendation facts; technical recommendation explanations remain deterministic.",
    );
  });

  it.skip("keeps deterministic recommendations when OpenAI explanation generation fails", async () => {
    const result = await generateRecommendationsFromMessage(
      {
        message: "beginner friendly creamy 65% keyboard under RM500",
      },
      {
        extraction: {
          intent: makeIntent({
            budget: {
              amount: 500,
              currency: "MYR",
              label: "mid_range",
            },
          }),
          source: "openai",
        },
        catalogComponents: keyboardComponents.filter((component) =>
          Object.values(validCandidateIds).flat().includes(component.id),
        ),
        maxRecommendations: 1,
        explanationClient: {
          responses: {
            parse: async () => {
              throw { status: 429 };
            },
          },
        } as never,
      },
    );

    expectValidatedRecommendations(result);
    expect(result.error).toContain(
      "OpenAI explanation generation failed; deterministic explanations were used.",
    );
  });

  it.skip("keeps recommendation explanations grounded in selected component data", () => {
    const result = createRecommendationResult(
      {
        intent: makeIntent(),
        source: "openai",
      },
      {
        preparation: {
          criteria: {
            layout: "65",
            soundProfile: "creamy",
            currency: "MYR",
          },
          candidateComponentIds: validCandidateIds,
        },
        maxRecommendations: 1,
      },
    );
    const recommendation = result.recommendations[0];
    const explanationText = recommendation.explanations.join(" ");

    expect(explanationText).toContain(recommendation.components.case.name);
    expect(explanationText).toContain(recommendation.components.switch.name);
    expect(explanationText).toContain(recommendation.components.keycap.name);
    expect(explanationText).toContain(
      recommendation.components.stabilizer.name,
    );
    expect(explanationText).toContain("deterministic compatibility validation");
  });
});

function isKitLockedStructuralComponent(component: {
  metadata?: Record<string, unknown>;
}) {
  return (
    component.metadata?.kitLock === true ||
    component.metadata?.sourceType === "kit_derived"
  );
}

function getMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" ? value : undefined;
}
