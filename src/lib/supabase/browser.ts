import { createBrowserClient } from "@supabase/ssr";

import { readSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Cookie-aware Supabase client for Client Components (login/signup forms, the
 * comment composer). Shares the auth session cookie with the server client so
 * sign-in performed in the browser is visible to Server Components on the next
 * request.
 */
export function createSupabaseBrowserClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } =
    readSupabasePublicEnv();

  return createBrowserClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
