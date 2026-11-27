import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Any OpenAI client creation on the refine path is a bug: chips must not call
// AI. The mock records calls so the test below can assert there were none.
const { createOpenAIClient } = vi.hoisted(() => ({
  createOpenAIClient: vi.fn(() => {
    throw new Error("refine path must not create an OpenAI client");
  }),
}));
vi.mock("@/lib/openai", () => ({ createOpenAIClient }));

import { POST } from "@/app/api/recommendations/refine/route";
import { keyboardComponents } from "@/data";
import {
  extractedKeyboardIntentSchema,
  extractKeyboardIntent,
  type ExtractedKeyboardIntent,
} from "@/lib/ai";
import {
  generateRecommendationsFromMessage,
  generateRecommendationsFromIntent,
  scoreRecommendation,
  type ValidatedRecommendationBuild,
} from "@/lib/recommendations";
import {
  applyRefineChip,
  describeBuildChange,
  getKeycapColours,
  refineChips,
} from "@/lib/recommendations/refine";

function makeIntent(
  overrides: Partial<ExtractedKeyboardIntent> = {},
): ExtractedKeyboardIntent {
  return extractedKeyboardIntentSchema.parse({
    budget: null,
    layout: "tkl",
    soundProfile: "thocky",
    useCase: "typing",
    beginnerFriendly: null,
    switchTechnology: null,
    priorities: ["sound"],
    constraints: [],
    colour: null,
    clarificationNeeded: false,
    clarificationQuestion: null,
    ...overrides,
  });
}

async function topBuild(
  intent: ExtractedKeyboardIntent,
  chip?: (typeof refineChips)[number],
): Promise<ValidatedRecommendationBuild | null> {
  const result = await generateRecommendationsFromIntent(
    { intent, source: "fallback_missing_api_key", chip },
    { catalogComponents: keyboardComponents },
  );

  return result.recommendations[0] ?? null;
}

async function baseBuild() {
  const build = await topBuild(makeIntent());

  if (!build) throw new Error("fixture: thocky TKL intent must resolve a build");
  return build;
}

describe("applyRefineChip", () => {
  it("quieter asks for silent switches", async () => {
    const edited = applyRefineChip(makeIntent(), "quieter", await baseBuild());

    expect(edited?.soundProfile).toBe("silent");
    expect(edited?.priorities).toContain("sound");
  });

  it("cheaper caps the budget at RM1 under the build price", async () => {
    const base = await baseBuild();
    const edited = applyRefineChip(makeIntent(), "cheaper", base);

    expect(edited?.budget).toEqual({
      amount: Number(((base.estimatedPrice ?? 0) - 1).toFixed(2)),
      currency: "MYR",
      label: "budget",
    });
  });

  it("premium lifts the ceiling to 150% of the build price", async () => {
    const base = await baseBuild();
    const edited = applyRefineChip(makeIntent(), "premium", base);

    expect(edited?.budget?.amount).toBe(Math.round((base.estimatedPrice ?? 0) * 1.5));
    expect(edited?.budget?.label).toBe("premium");
  });

  it("different colour picks a stocked colour the keycaps do not have", async () => {
    const base = await baseBuild();
    const stocked = getKeycapColours(keyboardComponents);
    const edited = applyRefineChip(makeIntent(), "colour", base, stocked);

    expect(edited?.colour).toHaveLength(1);
    expect(stocked).toContain(edited?.colour?.[0]);
  });

  it("smaller steps the layout down one size", async () => {
    const edited = applyRefineChip(makeIntent(), "smaller", await baseBuild());

    expect(edited?.layout).toBe("75");
  });

  it("returns null when a chip cannot change anything", async () => {
    const base = await baseBuild();
    const silent = {
      ...base,
      components: {
        ...base.components,
        switch: { ...base.components.switch, soundProfile: "silent" as const },
      },
    };
    const wireless = {
      ...base,
      components: {
        ...base.components,
        pcb: { ...base.components.pcb, connection: "both" as const },
      },
    };

    expect(applyRefineChip(makeIntent(), "quieter", silent)).toBeNull();
    expect(applyRefineChip(makeIntent(), "wireless", wireless)).toBeNull();
    expect(applyRefineChip(makeIntent({ layout: "60" }), "smaller", base)).toBeNull();
    expect(
      applyRefineChip(makeIntent(), "cheaper", { ...base, estimatedPrice: null }),
    ).toBeNull();
  });

  it("is deterministic: same input, same output", async () => {
    const base = await baseBuild();

    for (const chip of refineChips) {
      expect(applyRefineChip(makeIntent(), chip, base)).toEqual(
        applyRefineChip(makeIntent(), chip, base),
      );
    }
  });
});

describe("describeBuildChange", () => {
  it("names the swapped parts and the price difference", async () => {
    const base = await baseBuild();
    const cheaper = {
      ...base,
      estimatedPrice: (base.estimatedPrice ?? 0) - 40,
      components: {
        ...base.components,
        switch: { ...base.components.switch, id: "switch_other", name: "Gateron Silent" },
      },
    };

    expect(describeBuildChange(base, cheaper)).toBe(
      "Switched to Gateron Silent, −RM40",
    );
  });

  it("says so when nothing changed or nothing matched", async () => {
    const base = await baseBuild();

    expect(describeBuildChange(base, base)).toMatch(/no change/);
    expect(describeBuildChange(base, null)).toMatch(/No validated build/);
  });
});

describe("generateRecommendationsFromIntent (refine path)", () => {
  const previousKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    // A key is present, so any AI call would be attempted if the path made one.
    process.env.OPENAI_API_KEY = "sk-test-not-a-real-key";
    createOpenAIClient.mockClear();
  });

  afterEach(() => {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  });

  it("makes no OpenAI call, even when a key is set", async () => {
    const result = await generateRecommendationsFromIntent(
      { intent: makeIntent({ soundProfile: "silent" }), source: "openai" },
      { catalogComponents: keyboardComponents },
    );

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(createOpenAIClient).not.toHaveBeenCalled();
  });

  it("returns only builds the rule engine validated", async () => {
    const result = await generateRecommendationsFromIntent(
      { intent: makeIntent(), source: "fallback_missing_api_key" },
      { catalogComponents: keyboardComponents },
    );

    for (const build of result.recommendations) {
      expect(build.validation.isValid).toBe(true);
    }
  });

  it("cheaper never returns a build over the new ceiling", async () => {
    const base = await baseBuild();
    const edited = applyRefineChip(makeIntent(), "cheaper", base)!;
    const result = await generateRecommendationsFromIntent(
      { intent: edited, source: "fallback_missing_api_key", chip: "cheaper" },
      { catalogComponents: keyboardComponents },
    );

    for (const build of result.recommendations) {
      expect(build.estimatedPrice ?? Infinity).toBeLessThanOrEqual(edited.budget!.amount!);
    }
  });

  it("premium prefers a pricier build than the same intent without the chip", async () => {
    const base = await baseBuild();
    const edited = applyRefineChip(makeIntent(), "premium", base)!;
    const withChip = await topBuild(edited, "premium");
    const withoutChip = await topBuild(edited);

    expect(withChip?.estimatedPrice ?? 0).toBeGreaterThan(base.estimatedPrice ?? 0);
    expect(withChip?.estimatedPrice ?? 0).toBeGreaterThanOrEqual(
      withoutChip?.estimatedPrice ?? 0,
    );
  });

  it("leaves default ranking unchanged when no ranking option is given", async () => {
    const base = await baseBuild();
    const intent = makeIntent({
      budget: { amount: 900, currency: "MYR", label: "premium" },
    });

    expect(scoreRecommendation(base, intent)).toBe(
      scoreRecommendation(base, intent, {}),
    );
  });
});

describe("Cheaper is the next step down (HQ fix)", () => {
  const previousKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    delete process.env.OPENAI_API_KEY; // keyword extraction, like the keyless demo
  });

  afterEach(() => {
    if (previousKey !== undefined) process.env.OPENAI_API_KEY = previousKey;
  });

  it("from the RM313.80 GMK67 build: RM311.00, then RM304.00, then RM298.50", async () => {
    // Valid GMK67 builds just under RM313.80 (brute-forced over the whole
    // catalogue with the rule engine): 311.00, 304.00, 298.50, 290.80, ...
    const message = "Beginner friendly 65% keyboard under RM500";
    const search = await generateRecommendationsFromMessage(
      { message },
      {
        extraction: await extractKeyboardIntent({ message }),
        catalogComponents: keyboardComponents,
      },
    );
    let build = search.recommendations.find(
      (r) => r.components.case.metadata?.kitId === "gmk67",
    );
    expect(build?.estimatedPrice).toBe(313.8);

    const steps: number[] = [];
    let intent = search.intent;

    for (let click = 0; click < 3; click += 1) {
      intent = applyRefineChip(intent, "cheaper", build!)!;
      const refined = await generateRecommendationsFromIntent(
        { intent, source: search.source, chip: "cheaper" },
        { catalogComponents: keyboardComponents },
      );
      build = refined.recommendations[0];
      steps.push(build.estimatedPrice ?? Number.NaN);
      expect(build.validation.isValid).toBe(true);
    }

    expect(steps).toEqual([311, 304, 298.5]);
  });
});

describe("POST /api/recommendations/refine", () => {
  it("rejects free text: the body must be a structured intent", async () => {
    const response = await POST(
      new Request("http://localhost/api/recommendations/refine", {
        method: "POST",
        body: JSON.stringify({ message: "make it quieter" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns validated builds for a chip-edited intent", async () => {
    const response = await POST(
      new Request("http://localhost/api/recommendations/refine", {
        method: "POST",
        body: JSON.stringify({
          intent: makeIntent({ soundProfile: "silent" }),
          source: "fallback_missing_api_key",
          chip: "quieter",
        }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.recommendations[0].components.switch.soundProfile).toBe("silent");
  });
});
