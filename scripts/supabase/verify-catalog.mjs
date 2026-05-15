import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!isRealSupabaseUrl(supabaseUrl) || !isRealAnonKey(anonKey)) {
  console.error(
    "Supabase catalog verification requires real NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY values.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const componentCountResult = await supabase
  .from("keyboard_components")
  .select("id", { count: "exact", head: true });

if (componentCountResult.error) {
  fail(`Failed to read keyboard_components: ${componentCountResult.error.message}`);
}

const switchResult = await supabase
  .from("keyboard_components")
  .select("id,name", { count: "exact" })
  .eq("category", "switch")
  .limit(5);

if (switchResult.error) {
  fail(`Failed to read switch components: ${switchResult.error.message}`);
}

console.log(`keyboard_components count: ${componentCountResult.count ?? "unknown"}`);
console.log(`switch component count: ${switchResult.count ?? "unknown"}`);
console.log(
  `sample switch ids: ${
    switchResult.data?.map((component) => component.id).join(", ") || "none"
  }`,
);

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

function unquoteEnvValue(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function isRealSupabaseUrl(value) {
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

function isRealAnonKey(value) {
  return Boolean(value && !isPlaceholderValue(value));
}

function isPlaceholderValue(value) {
  const normalized = value.trim().toLowerCase();

  return (
    normalized === "https://your-project.supabase.co" ||
    normalized === "your-supabase-anon-key" ||
    normalized === "your-server-only-service-role-key" ||
    normalized.startsWith("your-")
  );
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
