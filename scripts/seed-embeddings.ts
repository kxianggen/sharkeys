#!/usr/bin/env tsx

/**
 * Embeds all seed catalog components using text-embedding-3-small (512 dims)
 * and writes the vectors into the Supabase keyboard_components table.
 *
 * Prerequisites:
 *   1. SUPABASE_SERVICE_ROLE_KEY set in .env.local  (not the placeholder)
 *   2. OPENAI_API_KEY set in .env.local
 *   3. Catalog rows present:  npm run supabase:seed-catalog
 *   4. Migration applied:     supabase/migrations/20260611_add_component_embeddings.sql
 *
 * Usage:  npm run seed:embeddings -- --local [--only-missing]   (local Supabase stack)
 *         npm run seed:embeddings -- --live  [--only-missing]   (the project in .env.local)
 *
 * v2 WS2: one of --local / --live is required, so the live project is never
 * written to by accident. --local takes the URL and key from `npx supabase
 * status` and refuses any non-localhost URL. --only-missing embeds only rows
 * whose embedding is still null (new imported parts), to keep the cost down.
 */

import { loadEnvFile } from "./load-env-file";
import { assertLocalSupabaseUrl } from "./catalog/lib/local-only";
import { readLocalSupabaseCredentials } from "./catalog/seed-local";

import { keyboardComponents } from "@/data";
import { buildComponentEmbeddingText, getEmbedding } from "@/lib/ai/embeddings";
import { createSupabaseAdminClient } from "@/lib/supabase";

const BATCH_SIZE = 10; // stay well under OpenAI embeddings rate limits

async function main() {
  const argv = process.argv.slice(2);
  const local = argv.includes("--local");
  const live = argv.includes("--live");
  const onlyMissing = argv.includes("--only-missing");
  if (local === live) {
    console.error("Pass exactly one of --local (local Supabase stack) or --live (the project in .env.local).");
    process.exit(1);
  }

  if (local) {
    // Set before loadEnvFile: existing process.env values win over .env.local.
    const credentials = readLocalSupabaseCredentials();
    process.env.NEXT_PUBLIC_SUPABASE_URL = credentials.url;
    process.env.SUPABASE_SERVICE_ROLE_KEY = credentials.serviceRoleKey;
    if (credentials.anonKey) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = credentials.anonKey;
  }

  // Must run before any client factory reads process.env.
  // A worktree has no .env.local; SHARKEYS_ENV_FILE may point at the main
  // checkout's file (read by the script, never printed). Values already set
  // above (the local Supabase URL and key) win over the file.
  loadEnvFile(process.env.SHARKEYS_ENV_FILE ?? ".env.local");
  if (local) assertLocalSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const supabase = createSupabaseAdminClient();
  let components = [...keyboardComponents];

  if (onlyMissing) {
    const { data, error } = await supabase
      .from("keyboard_components")
      .select("id")
      .is("embedding", null);
    if (error) throw error;
    const missing = new Set((data ?? []).map((row) => row.id));
    components = components.filter((component) => missing.has(component.id));
  }

  console.log("\nSharkeys — Embedding Seeder");
  console.log(`Target     : ${local ? "local Supabase" : "LIVE project (.env.local)"}`);
  console.log(`Components : ${components.length}${onlyMissing ? " (missing embeddings only)" : ""}`);
  console.log("Model      : text-embedding-3-small  (512 dimensions)\n");
  const totalBatches = Math.ceil(components.length / BATCH_SIZE);

  let seeded = 0;
  let failed = 0;

  for (let i = 0; i < components.length; i += BATCH_SIZE) {
    const batch = components.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`Batch ${batchNum}/${totalBatches}:`);

    await Promise.all(
      batch.map(async (component) => {
        try {
          const text = buildComponentEmbeddingText(component);
          const embedding = await getEmbedding(text);

          const { error } = await supabase
            .from("keyboard_components")
            .update({ embedding })
            .eq("id", component.id);

          if (error) throw error;

          console.log(`  ✓  ${component.id}`);
          seeded++;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error(`  ✗  ${component.id}: ${message}`);
          failed++;
        }
      }),
    );
  }

  console.log(`\nDone — ${seeded} seeded, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
