import { createClient } from "@supabase/supabase-js";

import { readSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/lib/types/database";

export function createSupabaseClient() {
  const { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } =
    readSupabasePublicEnv();

  return createClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
