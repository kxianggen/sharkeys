import { describe, expect, it } from "vitest";

import {
  requiredBuildSlots,
  validateBuildCompatibility,
} from "@/lib/rules";
import type { KeyboardBuildDraft } from "@/lib/types";

describe("validateBuildCompatibility", () => {
  it("flags a draft with missing required component slots", () => {
    const result = validateBuildCompatibility({ components: {} });

    expect(result.isValid).toBe(false);
    expect(result.issues).toHaveLength(requiredBuildSlots.length);
    expect(result.issues.map((issue) => issue.code)).toContain("missing_pcb");
  });

  it("passes the Phase 0 baseline when required slots are present", () => {
    const draft: KeyboardBuildDraft = {
      components: Object.fromEntries(
        requiredBuildSlots.map((slot) => [
          slot,
          {
            id: `${slot}-component`,
            slot,
          },
        ]),
      ) as KeyboardBuildDraft["components"],
    };

    const result = validateBuildCompatibility(draft);

    expect(result.isValid).toBe(true);
    expect(result.issues).toEqual([]);
  });
});
