import { describe, expect, it } from "vitest";

import { POST as intentPOST } from "@/app/api/ai/intent/route";
import { aiIntentApiResponseSchema } from "@/lib/ai";
import { apiErrorResponseSchema } from "@/lib/api";

describe("AI intent API route", () => {
  it("rejects malformed requests", async () => {
    const response = await intentPOST(
      new Request("http://localhost/api/ai/intent", {
        method: "POST",
        body: JSON.stringify({ message: "" }),
      }),
    );
    const body = await response.json();
    const parsed = apiErrorResponseSchema.parse(body);

    expect(response.status).toBe(400);
    expect(parsed.error.code).toBe("invalid_request");
  });

  it("returns fallback intent and candidates when no API key is configured", async () => {
    const previousApiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const response = await intentPOST(
        new Request("http://localhost/api/ai/intent", {
          method: "POST",
          body: JSON.stringify({
            message: "I want a beginner friendly creamy keyboard.",
          }),
        }),
      );
      const body = await response.json();
      const parsed = aiIntentApiResponseSchema.parse(body);

      expect(response.status).toBe(200);
      expect(parsed.data.source).toBe("fallback_missing_api_key");
      expect(parsed.data.intent.beginnerFriendly).toBe(true);
      expect(parsed.data.intent.soundProfile).toBe("creamy");
      expect(parsed.data.intent.clarificationNeeded).toBe(true);
      expect(parsed.data.candidateComponentIds.case).toContain(
        "case_zuoya_gmk67_v2_kit_case",
      );
      expect(parsed.data.error).toContain("OPENAI_API_KEY");
    } finally {
      if (previousApiKey !== undefined) {
        process.env.OPENAI_API_KEY = previousApiKey;
      }
    }
  });
});
