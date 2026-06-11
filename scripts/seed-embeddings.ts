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
 * Usage:  npm run seed:embeddings
 */

import { keyboardComponents } from "@/data";
import { buildComponentEmbeddingText, getEmbedding } from "@/lib/ai/embeddings";
import { createSupabaseAdminClient } from "@/lib/supabase";

const BATCH_SIZE = 10; // stay well under OpenAI embeddings rate limits

async function main() {
  console.log("\nSharkeys — Embedding Seeder");
  console.log(`Components : ${keyboardComponents.length}`);
  console.log("Model      : text-embedding-3-small  (512 dimensions)\n");

  const supabase = createSupabaseAdminClient();
  const components = [...keyboardComponents];
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
