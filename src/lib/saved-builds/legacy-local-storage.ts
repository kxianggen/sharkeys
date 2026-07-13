import type { SaveBuildInput } from "@/app/my-builds/actions";

/**
 * Legacy localStorage saved builds (pre-account era). Read once on /my-builds
 * for the one-time account migration, then the key is cleared. Client-only.
 */
export const LEGACY_SAVED_BUILDS_KEY = "sharkeys.savedBuilds.v1";

/**
 * Reads legacy builds leniently: only what the migration needs (component ids,
 * title, source) is extracted; everything else — including the old client-side
 * validation snapshot — is ignored, because the server re-validates each
 * candidate from the catalog. Returns null when the key is absent (nothing to
 * migrate) and [] when it exists but holds nothing usable (clear it anyway).
 */
export function readLegacySavedBuilds(): SaveBuildInput[] | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(LEGACY_SAVED_BUILDS_KEY);
  } catch {
    return null;
  }

  if (raw === null) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const candidates: SaveBuildInput[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;

      const componentIdsValue = record.componentIds;
      if (!componentIdsValue || typeof componentIdsValue !== "object") continue;
      const componentIds: Record<string, string> = {};
      for (const [category, id] of Object.entries(
        componentIdsValue as Record<string, unknown>,
      )) {
        if (typeof id === "string" && id.trim()) {
          componentIds[category] = id.trim();
        }
      }
      if (Object.keys(componentIds).length === 0) continue;

      candidates.push({
        componentIds,
        title:
          typeof record.title === "string" && record.title.trim()
            ? record.title.trim().slice(0, 120)
            : undefined,
        source: record.source === "manual" ? "manual" : "recommendation",
      });
    }

    return candidates;
  } catch {
    return [];
  }
}
