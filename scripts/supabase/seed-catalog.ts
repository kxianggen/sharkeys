import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

import {
  supabaseKeyboardComponentSeed,
  supabaseSoundSampleSeed,
} from "../../src/data/supabase/keyboard-components";
import type { Database } from "../../src/lib/types/database";

async function main() {
  loadEnvFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isRealSupabaseUrl(supabaseUrl)) {
    fail("NEXT_PUBLIC_SUPABASE_URL must be set to a real Supabase project URL.");
  }

  if (!serviceRoleKey || isPlaceholderValue(serviceRoleKey)) {
    fail("SUPABASE_SERVICE_ROLE_KEY must be set locally to seed catalog data.");
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const componentIds = supabaseKeyboardComponentSeed.map(
    (component) => component.id,
  );

  const { error: deleteSoundSamplesError } = await supabase
    .from("component_sound_samples")
    .delete()
    .in("component_id", componentIds);

  if (deleteSoundSamplesError) {
    fail(`Failed to clear old sound samples: ${deleteSoundSamplesError.message}`);
  }

  const { error: upsertComponentsError } = await supabase
    .from("keyboard_components")
    .upsert(supabaseKeyboardComponentSeed, { onConflict: "id" });

  if (upsertComponentsError) {
    fail(`Failed to upsert keyboard components: ${upsertComponentsError.message}`);
  }

  if (supabaseSoundSampleSeed.length > 0) {
    const { error: insertSoundSamplesError } = await supabase
      .from("component_sound_samples")
      .insert(supabaseSoundSampleSeed);

    if (insertSoundSamplesError) {
      fail(`Failed to insert sound samples: ${insertSoundSamplesError.message}`);
    }
  }

  const { count: componentCount, error: componentCountError } = await supabase
    .from("keyboard_components")
    .select("id", { count: "exact", head: true });

  if (componentCountError) {
    fail(
      `Catalog was seeded, but count verification failed: ${componentCountError.message}`,
    );
  }

  console.log(
    `Seeded ${supabaseKeyboardComponentSeed.length} keyboard components and ${supabaseSoundSampleSeed.length} sound samples.`,
  );
  console.log(`Live keyboard_components count: ${componentCount ?? "unknown"}`);
}

function loadEnvFile(fileName = ".env.local") {
  const envPath = resolve(process.cwd(), fileName);

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key] === undefined) {
      process.env[key] = unquoteEnvValue(rawValue);
    }
  }
}

function unquoteEnvValue(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function isRealSupabaseUrl(value: string | undefined): value is string {
  if (!value || isPlaceholderValue(value)) {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function isPlaceholderValue(value: string) {
  const normalized = value.trim().toLowerCase();

  return (
    normalized === "https://your-project.supabase.co" ||
    normalized === "your-supabase-anon-key" ||
    normalized === "your-server-only-service-role-key" ||
    normalized.startsWith("your-")
  );
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? `Failed to seed Supabase catalog: ${error.message}`
      : "Failed to seed Supabase catalog.",
  );
  process.exit(1);
});
