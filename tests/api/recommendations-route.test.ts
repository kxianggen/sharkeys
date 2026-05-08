import { describe, expect, it } from "vitest";

import { POST as recommendationsPOST } from "@/app/api/recommendations/route";
import { apiErrorResponseSchema } from "@/lib/api";
import { recommendationsApiResponseSchema } from "@/lib/recommendations";

describe("recommendations API route", () => {
  it("rejects malformed requests", async () => {
    const response = await recommendationsPOST(
      new Request("http://localhost/api/recommendations", {
        method: "POST",
        body: JSON.stringify({ message: "" }),
      }),
    );
    const body = await response.json();
    const parsed = apiErrorResponseSchema.parse(body);

    expect(response.status).toBe(400);
    expect(parsed.error.code).toBe("invalid_request");
  });

  it("returns validated recommendations through fallback intent without an API key", async () => {
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const response = await recommendationsPOST(
        new Request("http://localhost/api/recommendations", {
          method: "POST",
          body: JSON.stringify({
            message: "I want a beginner friendly creamy keyboard.",
          }),
        }),
      );
      const body = await response.json();
      const parsed = recommendationsApiResponseSchema.parse(body);

      expect(response.status).toBe(200);
      expect(parsed.data.source).toBe("fallback_missing_api_key");
      expect(parsed.data.recommendations.length).toBeGreaterThan(0);
      expect(
        parsed.data.recommendations.every(
          (recommendation) => recommendation.validation.isValid,
        ),
      ).toBe(true);
      expect(parsed.data.error).toContain("OPENAI_API_KEY");
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });
});
