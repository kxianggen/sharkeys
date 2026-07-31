import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { extractKeyboardIntent } from "@/lib/ai";

// Force the deterministic path. Without this, a machine with a real key in the
// environment would call OpenAI and these would stop testing the fallback.
let previousApiKey: string | undefined;

beforeAll(() => {
  previousApiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
});

afterAll(() => {
  if (previousApiKey !== undefined) {
    process.env.OPENAI_API_KEY = previousApiKey;
  }
});

/**
 * Regression tests for the deterministic keyword fallback.
 *
 * Every case here corresponds to a real failure in `npm run eval`'s offline
 * baseline. They are pinned as unit tests so the fixes can't silently rot: the
 * eval tells you the score, these tell you which behaviour broke.
 *
 * These run without an API key, which is exactly the path under test — the
 * fallback is what the app uses when OPENAI_API_KEY is absent.
 */

const intentFor = async (message: string) => {
  const result = await extractKeyboardIntent({ message });
  return result.intent;
};

describe("budget parsing", () => {
  it("takes the upper bound of a stated range", async () => {
    for (const [message, expected] of [
      ["Gaming keyboard heavy thock, budget RM200 to RM250", 250],
      ["Looking for thocky keyboard for WFH, budget RM200-250", 250],
      ["Lucky65 setup thocky RM200-250 boleh recommend?", 250],
      ["Very budget keyboard thocky, around RM100 to RM150, student", 150],
    ] as const) {
      const intent = await intentFor(message);
      expect(intent.budget?.amount, message).toBe(expected);
    }
  });

  it("does not read a layout percentage as a budget", async () => {
    // Regression: "budget 65%" previously matched the budget regex and reported
    // a RM65 budget, silently overriding the real RM200.
    const intent = await intentFor(
      "Sound test dulu boleh? Looking for thocky gaming keyboard RM200 budget 65%",
    );

    expect(intent.budget?.amount).toBe(200);
    expect(intent.layout).toBe("65");
  });

  it("still handles the plain single-amount phrasings", async () => {
    for (const [message, expected] of [
      ["Gaming keyboard thocky sound RM250 max", 250],
      ["Apa keyboard best untuk gaming under RM200 yang thocky?", 200],
      ["Wireless thocky keyboard RM250 budget, 65% layout", 250],
      ["Keyboard gaming creamy feel, budget RM180", 180],
      ["Best creamy 65% for gaming under RM250", 250],
    ] as const) {
      const intent = await intentFor(message);
      expect(intent.budget?.amount, message).toBe(expected);
    }
  });
});

describe("sound profile parsing", () => {
  it("matches thock without the -y suffix", async () => {
    for (const message of [
      "Need keyboard for FPS games, want that deep thock sound, budget around RM200",
      "Gaming keyboard heavy thock, budget RM200 to RM250",
    ]) {
      const intent = await intentFor(message);
      expect(intent.soundProfile, message).toBe("thocky");
    }
  });

  it("reads 'buttery smooth' as creamy", async () => {
    const intent = await intentFor(
      "Keyboard yang buttery smooth for gaming, RM200 ada tak?",
    );

    expect(intent.soundProfile).toBe("creamy");
  });

  it("keeps an explicit profile ahead of an ambient one", async () => {
    // "quiet" must not override a stated thocky preference.
    const intent = await intentFor(
      "Office keyboard thocky but not too loud, RM200",
    );

    expect(intent.soundProfile).toBe("thocky");
  });
});

describe("switch technology parsing", () => {
  it("recognises the words buyers actually use for hall-effect", async () => {
    for (const message of [
      "Hall effect 60% keyboard for gaming",
      "I want magnetic switches for Valorant",
      "Looking for a rapid trigger board",
      "Something like the Wooting 60HE",
      "Lekker switches please",
    ]) {
      const intent = await intentFor(message);
      expect(intent.switchTechnology, message).toBe("hall_effect");
    }
  });

  it("does not mistake ordinary mechanical prompts for magnetic", async () => {
    for (const message of [
      "Thocky mechanical keyboard RM200",
      "Best creamy 65% for gaming under RM250",
      "Quiet keyboard for office, RM200",
    ]) {
      const intent = await intentFor(message);
      expect(intent.switchTechnology, message).not.toBe("hall_effect");
    }
  });
});

describe("use case parsing", () => {
  it("recognises game titles and the plural 'games'", async () => {
    for (const message of [
      "Bro, got RM200 budget, want thocky aluminum for Valorant",
      "Need keyboard for FPS games, want that deep thock sound, budget around RM200",
      "I play Valorant and CSGO, want thocky keyboard, got RM200",
    ]) {
      const intent = await intentFor(message);
      expect(intent.useCase, message).toBe("gaming");
    }
  });

  it("treats work context as office", async () => {
    for (const message of [
      "Looking for thocky keyboard for WFH, budget RM200-250",
      "Suggest me a good thocky keyboard for typing at work, RM250 max",
    ]) {
      const intent = await intentFor(message);
      expect(intent.useCase, message).toBe("office");
    }
  });
});
