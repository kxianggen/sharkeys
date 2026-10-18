// TODO(catalog-rewrite): it.skip tests below are pinned to the pre-19-part seed catalog
// (deleted component IDs + obsolete 75% aluminum blocker). Repoint fixtures to new IDs and unskip.
import { describe, expect, it } from "vitest";

import { POST as keybotPOST } from "@/app/api/keybot/route";
import { apiErrorResponseSchema } from "@/lib/api";
import { keybotApiResponseSchema } from "@/lib/keybot";

const openAIKeyEnv = "OPENAI" + "_API_KEY";

async function withFallbackEnv<T>(callback: () => Promise<T>) {
  const previous = {
    [openAIKeyEnv]: process.env[openAIKeyEnv],
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  delete process.env[openAIKeyEnv];
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    return await callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

describe("Keybot API route", () => {
  it("rejects malformed requests", async () => {
    const response = await keybotPOST(
      new Request("http://localhost/api/keybot", {
        method: "POST",
        body: JSON.stringify({ message: "" }),
      }),
    );
    const body = await response.json();
    const parsed = apiErrorResponseSchema.parse(body);

    expect(response.status).toBe(400);
    expect(parsed.error.code).toBe("invalid_request");
  });

  it("returns deterministic fallback help without an OpenAI API key", async () => {
    await withFallbackEnv(async () => {
      const response = await keybotPOST(
        new Request("http://localhost/api/keybot", {
          method: "POST",
          body: JSON.stringify({ message: "What is a thocky keyboard?" }),
        }),
      );
      const body = await response.json();
      const parsed = keybotApiResponseSchema.parse(body);

      expect(response.status).toBe(200);
      expect(parsed.data.source).toBe("fallback_missing_api_key");
      expect(parsed.data.answer).toContain("deeper");
      expect(parsed.data.usedRecommendationEngine).toBe(false);
    });
  });

  it("accepts bounded recent messages", async () => {
    await withFallbackEnv(async () => {
      const response = await keybotPOST(
        new Request("http://localhost/api/keybot", {
          method: "POST",
          body: JSON.stringify({
            message: "why that one?",
            context: {
              recentMessages: [
                {
                  role: "user",
                  content: "Recommend a quiet office keyboard under RM800",
                },
                {
                  role: "assistant",
                  content: "I found a validated build.",
                },
              ],
            },
          }),
        }),
      );
      const body = await response.json();
      const parsed = keybotApiResponseSchema.parse(body);

      expect(response.status).toBe(200);
      expect(parsed.data.answer).toContain("generate or select a build");
    });
  });

  it("rejects oversized recent messages", async () => {
    const response = await keybotPOST(
      new Request("http://localhost/api/keybot", {
        method: "POST",
        body: JSON.stringify({
          message: "why that one?",
          context: {
            recentMessages: Array.from({ length: 7 }, (_, index) => ({
              role: index % 2 === 0 ? "user" : "assistant",
              content: `message ${index}`,
            })),
          },
        }),
      }),
    );
    const body = await response.json();
    const parsed = apiErrorResponseSchema.parse(body);

    expect(response.status).toBe(400);
    expect(parsed.error.code).toBe("invalid_request");
  });

  it("rejects a message longer than 2000 characters", async () => {
    const response = await keybotPOST(
      new Request("http://localhost/api/keybot", {
        method: "POST",
        body: JSON.stringify({ message: "a".repeat(2001) }),
      }),
    );
    const body = await response.json();
    const parsed = apiErrorResponseSchema.parse(body);

    expect(response.status).toBe(400);
    expect(parsed.error.code).toBe("invalid_request");
  });

  it("accepts a message of exactly 2000 characters", async () => {
    await withFallbackEnv(async () => {
      const response = await keybotPOST(
        new Request("http://localhost/api/keybot", {
          method: "POST",
          body: JSON.stringify({ message: "a".repeat(2000) }),
        }),
      );

      expect(response.status).toBe(200);
    });
  });

  it("uses the recommendation engine for build questions without an OpenAI API key", async () => {
    await withFallbackEnv(async () => {
      const response = await keybotPOST(
        new Request("http://localhost/api/keybot", {
          method: "POST",
          body: JSON.stringify({
            message: "Recommend a quiet office keyboard under RM800",
          }),
        }),
      );
      const body = await response.json();
      const parsed = keybotApiResponseSchema.parse(body);

      expect(response.status).toBe(200);
      expect(parsed.data.source).toBe("fallback_missing_api_key");
      expect(parsed.data.usedRecommendationEngine).toBe(true);
      expect(parsed.data.answer).toContain("validated build");
    });
  });

  it.skip("explains no-build blockers for 75% aluminum requests", async () => {
    await withFallbackEnv(async () => {
      const response = await keybotPOST(
        new Request("http://localhost/api/keybot", {
          method: "POST",
          body: JSON.stringify({ message: "75% aluminum keyboard" }),
        }),
      );
      const body = await response.json();
      const parsed = keybotApiResponseSchema.parse(body);

      expect(response.status).toBe(200);
      expect(parsed.data.usedRecommendationEngine).toBe(true);
      expect(parsed.data.answer).toContain("could not find");
      expect(parsed.data.answer).toContain("75% PCB");
    });
  });
});
