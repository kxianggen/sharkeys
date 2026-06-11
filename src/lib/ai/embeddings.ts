import { readOptionalOpenAIConfig, readOptionalSupabasePublicEnv } from "@/lib/env";
import { createOpenAIClient } from "@/lib/openai";
import { createSupabaseClient } from "@/lib/supabase";
import type { ComponentCategory, KeyboardComponent } from "@/lib/types";

export interface SemanticSearchResult {
  id: string;
  similarity: number;
}

export interface SemanticSearchOptions {
  matchCount?: number;
  filterCategory?: ComponentCategory;
}

// Natural-language synonyms expand embedding coverage for colloquial queries
// ("buttery smooth" → creamy, "deep thud" → thocky, etc.)
const SOUND_SYNONYMS: Record<string, string> = {
  thocky: "deep thocky satisfying low-pitched muted thud heavy bottom-out",
  creamy: "smooth creamy buttery linear silky soft subtle muted",
  clacky: "clacky clicky bright sharp high-pitched tactile snappy",
  silent: "silent quiet muted whisper noise-free library office discreet",
  neutral: "neutral balanced flat moderate",
};

export function buildComponentEmbeddingText(component: KeyboardComponent): string {
  const parts: string[] = [
    `${component.category}: ${component.name} by ${component.brand}`,
  ];

  if (component.description) {
    parts.push(component.description);
  }

  if (component.soundProfile) {
    parts.push(`sound profile: ${component.soundProfile}`);
    const synonyms = SOUND_SYNONYMS[component.soundProfile];
    if (synonyms) parts.push(synonyms);
  }

  if (component.category === "switch") {
    parts.push(`switch technology: ${component.switchTechnology}`);
    if (component.actuationForceG) {
      parts.push(`actuation force ${component.actuationForceG}g`);
    }
    if (component.pinCount) {
      parts.push(`${component.pinCount}-pin`);
    }
  }

  if ("layouts" in component && component.layouts) {
    parts.push(`compatible layouts: ${component.layouts.join(", ")}`);
  }

  if (component.price && component.priceCurrency) {
    parts.push(`price ${component.price} ${component.priceCurrency}`);
  }

  if (component.beginnerFriendly) {
    parts.push("beginner friendly easy starter recommended");
  }

  return parts.join(". ");
}

export async function getEmbedding(text: string): Promise<number[]> {
  const config = readOptionalOpenAIConfig();
  if (!config.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY required for embedding generation");
  }
  const client = createOpenAIClient(config.OPENAI_API_KEY);
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 512,
  });
  return response.data[0].embedding;
}

// Silent fallback contract: returns [] when Supabase or OpenAI is unavailable.
// Callers must always fall back to keyword results when this returns [].
export async function searchComponentsBySemantic(
  query: string,
  options: SemanticSearchOptions = {},
): Promise<SemanticSearchResult[]> {
  const supabaseEnv = readOptionalSupabasePublicEnv();
  if (!supabaseEnv) return [];

  const config = readOptionalOpenAIConfig();
  if (!config.OPENAI_API_KEY) return [];

  try {
    const queryEmbedding = await getEmbedding(query);
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.rpc("match_components", {
      query_embedding: queryEmbedding,
      match_count: options.matchCount ?? 10,
      filter_category: options.filterCategory ?? null,
    });

    if (error) throw error;

    return (data as SemanticSearchResult[]) ?? [];
  } catch {
    return [];
  }
}
