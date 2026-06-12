import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { readOptionalSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Returns the authenticated user, or null when signed out or when Supabase is
 * not configured (offline dev). Never throws on missing env.
 */
export async function getSessionUser(): Promise<User | null> {
  if (!readOptionalSupabasePublicEnv()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Guards a server route/page: redirects to the login page (preserving the
 * intended destination) when there is no session, otherwise returns the user.
 */
export async function requireUser(redirectTo?: string): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    const target = redirectTo
      ? `/login?next=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(target);
  }
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!readOptionalSupabasePublicEnv()) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data ?? null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return getProfile(user.id);
}
