/**
 * Token prices for cost estimates (USD per 1M tokens).
 * gpt-4.1-mini list price: $0.40 input, $0.10 cached input, $1.60 output.
 * Check https://openai.com/api/pricing before trusting these for a big run.
 */
export const PRICES_PER_MTOK = {
  "gpt-4.1-mini": { input: 0.4, cachedInput: 0.1, output: 1.6 },
} as const;

export type PricedModel = keyof typeof PRICES_PER_MTOK;

export type TokenUsage = { inputTokens: number; cachedInputTokens: number; outputTokens: number };

export const zeroUsage = (): TokenUsage => ({
  inputTokens: 0,
  cachedInputTokens: 0,
  outputTokens: 0,
});

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    cachedInputTokens: a.cachedInputTokens + b.cachedInputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
  };
}

export function costUSD(usage: TokenUsage, model: PricedModel = "gpt-4.1-mini"): number {
  const p = PRICES_PER_MTOK[model];
  const uncached = Math.max(0, usage.inputTokens - usage.cachedInputTokens);
  return (
    (uncached * p.input + usage.cachedInputTokens * p.cachedInput + usage.outputTokens * p.output) /
    1_000_000
  );
}

/** Reads the usage block of an OpenAI Responses API result. */
export function usageFromResponse(response: {
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    input_tokens_details?: { cached_tokens?: number };
  } | null;
}): TokenUsage {
  return {
    inputTokens: response.usage?.input_tokens ?? 0,
    cachedInputTokens: response.usage?.input_tokens_details?.cached_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}
