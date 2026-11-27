#!/usr/bin/env tsx
/**
 * Upserts the full catalogue (frozen 61 + approved imports, price checks
 * applied) into the LOCAL Supabase stack, then prints the row count so it can
 * be compared with /api/health.
 *
 * Never reads .env.local. The URL and key come from `npx supabase status`
 * (the local stack's own, non-secret dev keys) or from LOCAL_SUPABASE_URL /
 * LOCAL_SUPABASE_SERVICE_ROLE_KEY, and the URL must be localhost.
 * Upsert only: no rows are deleted.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/catalog/seed-local.ts
 */
import { spawnSync } from "node:child_process";

import { createClient } from "@supabase/supabase-js";

import { catalogMode, supabaseKeyboardComponentSeed } from "@/data";
import type { Database } from "@/lib/types/database";

import { assertLocalSupabaseUrl } from "./lib/local-only";

export function readLocalSupabaseCredentials() {
  let url = process.env.LOCAL_SUPABASE_URL;
  let serviceRoleKey = process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY;
  let anonKey = process.env.LOCAL_SUPABASE_ANON_KEY;

  if (!url || !serviceRoleKey) {
    const status = spawnSync("npx", ["supabase", "status", "-o", "env"], { encoding: "utf8", shell: true });
    if (status.status !== 0) {
      throw new Error("Local Supabase is not running. Start it with: npx supabase start");
    }
    const env = Object.fromEntries(
      status.stdout
        .split(/\r?\n/)
        .map((line) => /^([A-Z_]+)="?([^"]*)"?$/.exec(line.trim()))
        .filter((m): m is RegExpExecArray => m !== null)
        .map((m) => [m[1], m[2]]),
    );
    url = env.API_URL;
    serviceRoleKey = env.SERVICE_ROLE_KEY;
    anonKey = env.ANON_KEY;
  }
  return { url: assertLocalSupabaseUrl(url), serviceRoleKey: serviceRoleKey!, anonKey };
}

async function main() {
  if (catalogMode !== "full") {
    throw new Error("SHARKEYS_CATALOG=frozen is set; unset it to seed the full catalogue.");
  }
  const { url, serviceRoleKey } = readLocalSupabaseCredentials();
  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase
    .from("keyboard_components")
    .upsert(supabaseKeyboardComponentSeed, { onConflict: "id" });
  if (error) throw new Error(`Upsert failed: ${error.message}`);

  const { count, error: countError } = await supabase
    .from("keyboard_components")
    .select("id", { count: "exact", head: true });
  if (countError) throw new Error(`Count failed: ${countError.message}`);

  console.log(`Upserted ${supabaseKeyboardComponentSeed.length} parts into local Supabase (${new URL(url).host}).`);
  console.log(`keyboard_components rows: ${count}`);
  if (count !== supabaseKeyboardComponentSeed.length) {
    console.log("Note: the row count differs from the catalogue size (rows that are not in the catalogue were left alone).");
  }
}

if (process.argv[1]?.includes("seed-local")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
