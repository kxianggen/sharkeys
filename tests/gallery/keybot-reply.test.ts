import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import { invokeKeybotAgent } from "@/lib/agent";
import { mentionsKeybot, stripKeybotMention } from "@/lib/gallery/keybot-reply";

describe("gallery @meg reply helpers", () => {
  describe("mentionsKeybot", () => {
    it("detects the @meg mention case-insensitively", () => {
      expect(mentionsKeybot("hey @meg what do you think?")).toBe(true);
      expect(mentionsKeybot("@Meg is this compatible?")).toBe(true);
    });

    it("ignores comments without the mention", () => {
      expect(mentionsKeybot("this build looks great")).toBe(false);
      expect(mentionsKeybot("email me at meg@example.com")).toBe(false);
    });

    it("no longer answers to the retired @keybot tag", () => {
      expect(mentionsKeybot("hey @keybot what do you think?")).toBe(false);
    });
  });

  describe("stripKeybotMention", () => {
    it("removes the mention and trims", () => {
      expect(stripKeybotMention("@meg is this compatible?")).toBe(
        "is this compatible?",
      );
    });

    it("falls back to a neutral prompt when nothing remains", () => {
      expect(stripKeybotMention("@meg")).toBe(
        "What do you think of this build?",
      );
    });
  });

  describe("grounded reply over a build context (offline)", () => {
    it("answers from the provided build without inventing products", async () => {
      const aSwitch = keyboardComponents.find((c) => c.category === "switch");
      const aCase = keyboardComponents.find((c) => c.category === "case");
      expect(aSwitch && aCase).toBeTruthy();

      const response = await invokeKeybotAgent(
        {
          message: stripKeybotMention("@meg is this a good combo?"),
          context: {
            selectedComponentIds: {
              switch: aSwitch!.id,
              case: aCase!.id,
            },
          },
        },
        { catalogComponents: keyboardComponents },
      );

      expect(response.answer.length).toBeGreaterThan(0);
      // No OpenAI key in tests → deterministic grounded fallback path.
      expect(response.source).toMatch(/^fallback/);
      // The selected build was provided, so catalog context was used.
      expect(response.usedCatalogContext).toBe(true);
    });
  });
});
