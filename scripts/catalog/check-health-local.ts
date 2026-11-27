#!/usr/bin/env tsx
/**
 * Calls the real /api/health route handler against the LOCAL Supabase stack
 * and checks its count equals the catalogue size (HQ note 3). No dev server
 * and no live project: the URL and anon key come from `npx supabase status`,
 * and the URL must be localhost.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/catalog/check-health-local.ts
 */
import { readLocalSupabaseCredentials } from "./seed-local";

async function main() {
  const { url, anonKey } = readLocalSupabaseCredentials();
  if (!anonKey) throw new Error("No local anon key from `supabase status`.");
  // Set before the route's modules read process.env.
  process.env.NEXT_PUBLIC_SUPABASE_URL = url;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  const { fullCatalog } = await import("@/data");
  const { GET } = await import("@/app/api/health/route");
  const response = await GET();
  const body = (await response.json()) as { ok: boolean; source: string; count: number };

  console.log(`GET /api/health → ${response.status} ${JSON.stringify(body)}`);
  console.log(`catalogue size: ${fullCatalog.length}`);
  const pass = response.status === 200 && body.source === "supabase" && body.count === fullCatalog.length;
  console.log(pass ? "PASS: health count matches the catalogue" : "FAIL: health count does not match");
  process.exit(pass ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
