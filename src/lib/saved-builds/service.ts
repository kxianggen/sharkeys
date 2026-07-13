import { readOptionalSupabasePublicEnv } from "@/lib/env";
import type { ValidationSnapshot } from "@/lib/gallery/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ComponentIdSelection } from "@/lib/types";

export type SavedBuildSource = "recommendation" | "manual";

export type SavedBuildRecord = {
  id: string;
  title: string | null;
  componentIds: ComponentIdSelection;
  validationSnapshot: ValidationSnapshot | null;
  estimatedPrice: number | null;
  estimatedPriceCurrency: string | null;
  source: SavedBuildSource;
  createdAt: string;
};

const SAVED_BUILD_SELECT =
  "id, title, component_ids, validation_snapshot, estimated_price, estimated_price_currency, source, created_at";

type SavedBuildRow = {
  id: string;
  title: string | null;
  component_ids: unknown;
  validation_snapshot: unknown;
  estimated_price: number | null;
  estimated_price_currency: string | null;
  source: string;
  created_at: string;
};

function mapSavedBuild(row: SavedBuildRow): SavedBuildRecord {
  return {
    id: row.id,
    title: row.title,
    componentIds: (row.component_ids ?? {}) as ComponentIdSelection,
    validationSnapshot:
      (row.validation_snapshot as ValidationSnapshot | null) ?? null,
    estimatedPrice: row.estimated_price,
    estimatedPriceCurrency: row.estimated_price_currency,
    source: row.source === "recommendation" ? "recommendation" : "manual",
    createdAt: row.created_at,
  };
}

/**
 * Lists the current user's saved builds, newest first. RLS scopes rows to
 * `auth.uid() = user_id`, so no explicit user filter is needed. Returns []
 * when Supabase is unconfigured (offline dev) or on any read error, so the
 * page always renders.
 */
export async function listSavedBuilds(limit = 30): Promise<SavedBuildRecord[]> {
  if (!readOptionalSupabasePublicEnv()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("saved_builds")
    .select(SAVED_BUILD_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map(mapSavedBuild);
}

/**
 * Loads one saved build by id. RLS guarantees only the owner sees it; returns
 * null for other users' builds, unknown ids, or unconfigured Supabase.
 */
export async function getSavedBuild(
  savedBuildId: string,
): Promise<SavedBuildRecord | null> {
  if (!readOptionalSupabasePublicEnv()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("saved_builds")
    .select(SAVED_BUILD_SELECT)
    .eq("id", savedBuildId)
    .maybeSingle();

  if (error || !data) return null;

  return mapSavedBuild(data);
}
