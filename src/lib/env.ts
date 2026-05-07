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

export function readSupabasePublicEnv(env = process.env) {
  return supabasePublicEnvSchema.parse(env);
}

export function readSupabaseAdminEnv(env = process.env) {
  return supabaseAdminEnvSchema.parse(env);
}

export function readOpenAIEnv(env = process.env) {
  return openAIEnvSchema.parse(env);
}
