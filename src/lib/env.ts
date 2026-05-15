import { z } from "zod";

const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const supabaseAdminEnvSchema = supabasePublicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const openAIEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
});

type EnvironmentMap = Record<string, string | undefined>;

const supabasePlaceholderValues = new Set([
  "https://your-project.supabase.co",
  "your-supabase-anon-key",
]);

export function readSupabasePublicEnv(env: EnvironmentMap = process.env) {
  return supabasePublicEnvSchema.parse(env);
}

export function readOptionalSupabasePublicEnv(env: EnvironmentMap = process.env) {
  const parsed = supabasePublicEnvSchema.safeParse(env);

  if (!parsed.success || hasSupabasePlaceholderValue(parsed.data)) {
    return null;
  }

  return parsed.data;
}

export function readSupabaseAdminEnv(env: EnvironmentMap = process.env) {
  return supabaseAdminEnvSchema.parse(env);
}

export function readOpenAIEnv(env: EnvironmentMap = process.env) {
  return openAIEnvSchema.parse(env);
}

function hasSupabasePlaceholderValue(
  env: z.infer<typeof supabasePublicEnvSchema>,
) {
  return (
    isSupabasePlaceholderValue(env.NEXT_PUBLIC_SUPABASE_URL) ||
    isSupabasePlaceholderValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

function isSupabasePlaceholderValue(value: string) {
  return supabasePlaceholderValues.has(value.trim().toLowerCase());
}
