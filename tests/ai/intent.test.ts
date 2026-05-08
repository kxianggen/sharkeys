import { describe, expect, it } from "vitest";

import {
  extractKeyboardIntent,
  extractedKeyboardIntentSchema,
  mapIntentToSearchCriteria,
  prepareIntentMatches,
  userIntentRequestSchema,
} from "@/lib/ai";

describe("AI intent schemas", () => {
  it("parses valid user text input", () => {
    const parsed = userIntentRequestSchema.parse({
      message: "I want a creamy 65% keyboard for coding under 200 USD.",
    });

    expect(parsed.message).toContain("creamy");
  });

  it("parses structured keyboard intent output", () => {
    const parsed = extractedKeyboardIntentSchema.parse({
      budget: {
        amount: 200,
        currency: "USD",
        label: "mid_range",
      },
      layout: "65",
      soundProfile: "creamy",
      useCase: "programming",
      beginnerFriendly: true,
      switchTechnology: "mechanical",
      priorities: ["sound", "beginner_friendly"],
      constraints: ["coding"],
      clarificationNeeded: false,
      clarificationQuestion: null,
    });

    expect(parsed.layout).toBe("65");
    expect(parsed.soundProfile).toBe("creamy");
  });
});

describe("extractKeyboardIntent", () => {
  it("returns a safe fallback when OPENAI_API_KEY is missing", async () => {
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await extractKeyboardIntent({
        message: "Something quiet and beginner friendly.",
      });

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.intent.soundProfile).toBe("silent");
      expect(result.intent.beginnerFriendly).toBe(true);
      expect(result.intent.clarificationNeeded).toBe(true);
      expect(result.error).toContain("OPENAI_API_KEY");
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("extracts optical 60% clacky intent with local keyword fallback", async () => {
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await extractKeyboardIntent({
        message: "optical 60% build with clacky sound",
      });

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.intent.layout).toBe("60");
      expect(result.intent.switchTechnology).toBe("optical");
      expect(result.intent.soundProfile).toBe("clacky");
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("extracts quiet office budget intent with local keyword fallback", async () => {
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await extractKeyboardIntent({
        message: "quiet office keyboard under 250 USD",
      });

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.intent.useCase).toBe("office");
      expect(result.intent.soundProfile).toBe("silent");
      expect(result.intent.budget).toMatchObject({
        amount: 250,
        currency: "USD",
      });
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("extracts beginner creamy 65% intent with local keyword fallback", async () => {
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await extractKeyboardIntent({
        message: "beginner friendly creamy 65%",
      });

      expect(result.source).toBe("fallback_missing_api_key");
      expect(result.intent.beginnerFriendly).toBe(true);
      expect(result.intent.soundProfile).toBe("creamy");
      expect(result.intent.layout).toBe("65");
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("uses a provided client without requiring a real OpenAI network call", async () => {
    const result = await extractKeyboardIntent(
      {
        message: "I want a thocky TKL build.",
      },
      {
        client: {
          responses: {
            parse: async () => ({
              output_parsed: {
                budget: {
                  amount: null,
                  currency: null,
                  label: "unknown",
                },
                layout: "tkl",
                soundProfile: "thocky",
                useCase: "typing",
                beginnerFriendly: false,
                switchTechnology: "mechanical",
                priorities: ["sound", "feel"],
                constraints: ["TKL"],
                clarificationNeeded: false,
                clarificationQuestion: null,
              },
            }),
          },
        } as never,
      },
    );

    expect(result.error).toBeUndefined();
    expect(result.source).toBe("openai");
    expect(result.intent.layout).toBe("tkl");
  });
});

describe("intent preparation", () => {
  it("maps extracted intent into search criteria", () => {
    const criteria = mapIntentToSearchCriteria({
      budget: {
        amount: 150,
        currency: "USD",
        label: "mid_range",
      },
      layout: "65",
      soundProfile: "creamy",
      useCase: "programming",
      beginnerFriendly: true,
      switchTechnology: "mechanical",
      priorities: ["sound"],
      constraints: ["quiet office"],
      clarificationNeeded: false,
      clarificationQuestion: null,
    });

    expect(criteria).toMatchObject({
      layout: "65",
      soundProfile: "creamy",
      switchTechnology: "mechanical",
      beginnerFriendly: true,
      maxPrice: 150,
    });
  });

  it("prepares candidate IDs grouped by component category", () => {
    const preparation = prepareIntentMatches({
      budget: null,
      layout: "65",
      soundProfile: "creamy",
      useCase: "programming",
      beginnerFriendly: true,
      switchTechnology: "mechanical",
      priorities: ["sound"],
      constraints: [],
      clarificationNeeded: false,
      clarificationQuestion: null,
    });

    expect(preparation.candidateComponentIds.case).toContain(
      "case_neo65_gasket",
    );
    expect(preparation.candidateComponentIds.pcb).toContain(
      "pcb_neo65_mx_hotswap",
    );
    expect(preparation.candidateComponentIds.switch).toContain(
      "switch_mx_linear_creamy",
    );
  });

  it("uses query terms from use case and constraints in strict candidate matching", () => {
    const preparation = prepareIntentMatches({
      budget: null,
      layout: "tkl",
      soundProfile: "thocky",
      useCase: "typing",
      beginnerFriendly: false,
      switchTechnology: "mechanical",
      priorities: ["sound"],
      constraints: ["POM"],
      clarificationNeeded: false,
      clarificationQuestion: null,
    });

    expect(preparation.criteria.query).toBe("typing POM");
    expect(preparation.candidateComponentIds.plate).toEqual(["plate_tkl_pom"]);
  });

  it("drops query terms in relaxed fallback when strict candidate matching is too narrow", () => {
    const preparation = prepareIntentMatches({
      budget: null,
      layout: "65",
      soundProfile: "creamy",
      useCase: "programming",
      beginnerFriendly: true,
      switchTechnology: "mechanical",
      priorities: ["sound"],
      constraints: ["nonexistent unicorn foam"],
      clarificationNeeded: false,
      clarificationQuestion: null,
    });

    expect(preparation.criteria.query).toBe(
      "programming nonexistent unicorn foam",
    );
    expect(preparation.candidateComponentIds.pcb).toContain(
      "pcb_neo65_mx_hotswap",
    );
  });
});
