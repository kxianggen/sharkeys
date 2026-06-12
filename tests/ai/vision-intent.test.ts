import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { extractIntentFromImage, imageIntentRequestSchema } from "@/lib/ai";

const TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAed";

describe("imageIntentRequestSchema", () => {
  it("accepts a base64 image data URL", () => {
    expect(
      imageIntentRequestSchema.safeParse({ imageDataUrl: TINY_PNG }).success,
    ).toBe(true);
  });

  it("rejects non-data-URL and non-image data", () => {
    expect(
      imageIntentRequestSchema.safeParse({
        imageDataUrl: "https://example.com/photo.png",
      }).success,
    ).toBe(false);
    expect(
      imageIntentRequestSchema.safeParse({
        imageDataUrl: "data:text/plain;base64,aGVsbG8=",
      }).success,
    ).toBe(false);
  });

  it("rejects an oversized payload", () => {
    const huge = `data:image/png;base64,${"A".repeat(6_000_001)}`;
    expect(imageIntentRequestSchema.safeParse({ imageDataUrl: huge }).success).toBe(
      false,
    );
  });
});

describe("extractIntentFromImage fallback (no API key)", () => {
  let previousKey: string | undefined;

  beforeEach(() => {
    previousKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (previousKey) process.env.OPENAI_API_KEY = previousKey;
  });

  it("falls back to deterministic text parsing without throwing", async () => {
    const result = await extractIntentFromImage({
      imageDataUrl: TINY_PNG,
      message: "quiet office board under RM300",
    });

    expect(result.source).toBe("fallback_missing_api_key");
    // The accompanying text is still parsed deterministically.
    expect(result.intent.budget?.amount).toBe(300);
    expect(result.intent.budget?.currency).toBe("MYR");
  });
});
