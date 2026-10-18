import OpenAI from "openai";

import { readOpenAIEnv } from "@/lib/env";

// Bounds every OpenAI call so a hung request falls back instead of waiting on
// the SDK defaults (10 min per attempt, 2 retries). Both values apply per
// attempt: worst case ≈ 2 × 7 s + retry backoff ≈ 15 s. 7 s sits ~1.7× above
// the measured Keybot p95 (4,110 ms, evidence/performance.md §5.1).
export const OPENAI_TIMEOUT_MS = 7_000;
export const OPENAI_MAX_RETRIES = 1;

export function createOpenAIClient(apiKey?: string) {
  const resolvedApiKey = apiKey ?? readOpenAIEnv().OPENAI_API_KEY;

  return new OpenAI({
    apiKey: resolvedApiKey,
    timeout: OPENAI_TIMEOUT_MS,
    maxRetries: OPENAI_MAX_RETRIES,
  });
}
