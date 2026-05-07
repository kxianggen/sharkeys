import OpenAI from "openai";

import { readOpenAIEnv } from "@/lib/env";

export function createOpenAIClient(apiKey?: string) {
  const resolvedApiKey = apiKey ?? readOpenAIEnv().OPENAI_API_KEY;

  return new OpenAI({
    apiKey: resolvedApiKey,
  });
}
