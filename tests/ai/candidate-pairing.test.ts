import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import { extractedKeyboardIntentSchema, prepareIntentMatches } from "@/lib/ai";
import { generateRecommendationsFromMessage } from "@/lib/recommendations";

/**
 * Regression: candidate pools are searched per category and then capped, so it
 * was possible for every candidate case to be structurally incompatible with
 * every candidate PCB — zero validated builds from a catalog that contains a
 * working combination.
 */

const intentFor = (soundProfile: "clacky" | "thocky" | "creamy") =>
  extractedKeyboardIntentSchema.parse({
    budget: null,
    layout: null,
    soundProfile,
    useCase: "unknown",
    switchTechnology: null,
    beginnerFriendly: null,
    priorities: [],
    constraints: [],
    clarificationNeeded: false,
    clarificationQuestion: null,
  });

const byId = new Map(keyboardComponents.map((c) => [c.id, c]));

function pairs(caseIds: string[], partnerIds: string[]) {
  return caseIds.some((caseId) => {
    const keyboardCase = byId.get(caseId);

    if (keyboardCase?.category !== "case") {
      return false;
    }

    return partnerIds.some((partnerId) => {
      const partner = byId.get(partnerId);

      if (partner?.category !== "pcb" && partner?.category !== "plate") {
        return false;
      }

      const mounts =
        partner.category === "pcb"
          ? partner.pcbMountSupport
          : partner.plateMountSupport;

      return (
        mounts.some((mount) => keyboardCase.caseMountSupport.includes(mount)) &&
        partner.layouts.some((layout) => keyboardCase.layouts.includes(layout))
      );
    });
  });
}

describe("candidate structural pairing", () => {
  it("always offers a PCB and plate that can pair with a candidate case", () => {
    // "clacky" is the trigger case: the only clacky case is tray-mount and
    // non-kit, while the PCB pool fell back to catalog order and filled up with
    // gasket-mount kit PCBs before reaching either tray-mount PCB.
    for (const profile of ["clacky", "thocky", "creamy"] as const) {
      const { candidateComponentIds } = prepareIntentMatches(
        intentFor(profile),
      );

      expect(
        pairs(candidateComponentIds.case, candidateComponentIds.pcb),
        `${profile}: no candidate case can pair with any candidate PCB`,
      ).toBe(true);
      expect(
        pairs(candidateComponentIds.case, candidateComponentIds.plate),
        `${profile}: no candidate case can pair with any candidate plate`,
      ).toBe(true);
    }
  });

  it("assembles a build for the quick prompts shown in the UI", async () => {
    // "Clacky gaming keyboard" is one of the configurator's own quick prompts and
    // it returned "No validated build found": the clacky case pool was the
    // tray-mount GH60, the hall-effect PCB satisfied the case pairing check, and
    // then rejected every mechanical switch — including the Kailh Box White that
    // is the catalog's only clacky switch.
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      for (const message of [
        "Clacky gaming keyboard",
        "Thocky 65% build",
        "Budget creamy build",
      ]) {
        const result = await generateRecommendationsFromMessage({ message });

        expect(result.recommendations.length, message).toBeGreaterThan(0);
        expect(
          result.recommendations.every((r) => r.validation.isValid),
          message,
        ).toBe(true);
      }
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });

  it("stays within the candidate cap after rescuing parts", () => {
    const { candidateComponentIds } = prepareIntentMatches(intentFor("clacky"));

    for (const ids of Object.values(candidateComponentIds)) {
      expect(ids.length).toBeLessThanOrEqual(6);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
