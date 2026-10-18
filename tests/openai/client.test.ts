// @vitest-environment node
import { APIConnectionTimeoutError } from "openai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createOpenAIClient,
  OPENAI_MAX_RETRIES,
  OPENAI_TIMEOUT_MS,
} from "@/lib/openai";

// A fetch that never answers: it only settles when the SDK aborts it.
function hangingFetch(_url: unknown, init?: RequestInit) {
  return new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => {
      reject(new DOMException("The operation was aborted.", "AbortError"));
    });
  });
}

describe("createOpenAIClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("sets an explicit timeout and retry limit", () => {
    const client = createOpenAIClient("test-key");

    expect(client.timeout).toBe(OPENAI_TIMEOUT_MS);
    expect(client.maxRetries).toBe(OPENAI_MAX_RETRIES);
    // Worst case (every attempt times out) must stay within ~15 s.
    expect(OPENAI_TIMEOUT_MS * (OPENAI_MAX_RETRIES + 1)).toBeLessThanOrEqual(
      15_000,
    );
  });

  it("gives up on a hung request within ~15 s instead of waiting indefinitely", async () => {
    const fetchMock = vi.fn(hangingFetch);
    vi.stubGlobal("fetch", fetchMock);
    const client = createOpenAIClient("test-key");

    const request = client.embeddings.create({
      model: "text-embedding-3-small",
      input: "hung request",
    });
    const outcome = expect(request).rejects.toBeInstanceOf(
      APIConnectionTimeoutError,
    );

    // Still waiting on the first attempt just before the timeout.
    await vi.advanceTimersByTimeAsync(OPENAI_TIMEOUT_MS - 1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Timeout + one retry (≤ 0.5 s backoff) + second timeout fits in 15 s.
    await vi.advanceTimersByTimeAsync(15_000 - (OPENAI_TIMEOUT_MS - 1));
    await outcome;
    expect(fetchMock).toHaveBeenCalledTimes(OPENAI_MAX_RETRIES + 1);
  });
});
