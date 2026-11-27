import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as refineRoute } from "@/app/api/recommendations/refine/route";
import { keyboardComponents } from "@/data";
import { extractedKeyboardIntentSchema } from "@/lib/ai";
import { generateRecommendationsFromIntent } from "@/lib/recommendations";
import { getKeycapColours } from "@/lib/recommendations/refine";

import { emptyAppState, sendRefine, type AppState } from "../../scripts/v2/lib/app-client";
import { personaActionSchema } from "../../scripts/v2/lib/persona";

// The simulator's HTTP calls go straight to the real route handler: no dev
// server, no network, no AI (the refine route never calls OpenAI).
const calls: string[] = [];

beforeEach(() => {
  calls.length = 0;
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    calls.push(new URL(url).pathname);
    return refineRoute(new Request(url, init));
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function thockyScreen(): Promise<AppState> {
  const state = emptyAppState();
  state.result = await generateRecommendationsFromIntent(
    {
      intent: extractedKeyboardIntentSchema.parse({
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
      }),
      source: "fallback_missing_api_key",
    },
    { catalogComponents: keyboardComponents },
  );
  return state;
}

describe("persona action schema", () => {
  it("accepts a refine click with a chip, and chip null otherwise", () => {
    expect(
      personaActionSchema.parse({
        action: "refine",
        message: "",
        chip: "quieter",
        acceptBuild: null,
        privateThought: "too loud",
      }).chip,
    ).toBe("quieter");
    expect(
      personaActionSchema.parse({
        action: "search",
        message: "quiet board",
        chip: null,
        acceptBuild: null,
        privateThought: "",
      }).chip,
    ).toBeNull();
    expect(() =>
      personaActionSchema.parse({
        action: "refine",
        message: "",
        chip: "louder",
        acceptBuild: null,
        privateThought: "",
      }),
    ).toThrow();
  });
});

describe("sendRefine (simulator chip click)", () => {
  it("calls only the refine route and puts the new build on screen", async () => {
    const state = await thockyScreen();
    const before = state.result!.recommendations[0];

    const reply = await sendRefine(
      "http://localhost",
      state,
      "quieter",
      getKeycapColours(keyboardComponents),
    );

    expect(calls).toEqual(["/api/recommendations/refine"]);
    expect(reply.buildsChanged).toBe(true);
    expect(reply.text).toMatch(/^Quieter: Switched to /);
    expect(state.result!.recommendations[0].components.switch.soundProfile).toBe("silent");
    expect(state.result!.recommendations[0].componentIds).not.toEqual(before.componentIds);
    expect(state.selectedIndex).toBe(0);
  });

  it("a greyed-out chip makes no call and changes nothing", async () => {
    const state = await thockyScreen();
    const base = state.result!.recommendations[0];
    state.result!.recommendations[0] = {
      ...base,
      components: {
        ...base.components,
        pcb: { ...base.components.pcb, connection: "both" },
      },
    };

    const reply = await sendRefine("http://localhost", state, "wireless");

    expect(calls).toEqual([]);
    expect(reply.buildsChanged).toBe(false);
    expect(reply.text).toMatch(/greyed out/);
  });

  it("with nothing on screen there is nothing to click", async () => {
    const reply = await sendRefine("http://localhost", emptyAppState(), "cheaper");

    expect(calls).toEqual([]);
    expect(reply.text).toMatch(/no builds on screen/);
  });
});
