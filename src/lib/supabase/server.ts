import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { readSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Cookie-aware Supabase client for Server Components, route handlers, and server
 * actions. Reads/writes the Next.js cookie store so the auth session is bound to
 * the request. Used exclusively for the Phase 4 auth/gallery features — public
 * catalog reads keep using the plain anon client in `client.ts` (decision D2).
 *
 * Assumes Supabase env is configured; callers that must tolerate placeholder
 * env (middleware, public pages) should guard with `readOptionalSupabasePublicEnv`.
 */
export async function createSupabaseServerClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    readSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component where cookies are read-only.
            // Middleware refreshes the session cookies instead — safe to ignore.
          }
        },
      },
    },
  );
}
