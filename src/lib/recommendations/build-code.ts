/**
 * Build codes (v2 WS4 share and clone): the URL carries the whole build.
 *
 *   /configurator/b/v1.<case>.<pcb>.<plate>.<switch>.<keycap>.<stabilizer>
 *
 * Nothing is stored server-side, so a shared link can never point at a
 * deleted row. The code says WHICH parts; it never says whether they fit or
 * what they cost. Every page that opens a code re-checks it against today's
 * catalogue with the rule engine.
 *
 * Catalogue ids are lowercase slugs ([a-z0-9_-]); "." is the separator, so it
 * can never appear inside an id. "v1" lets the format change later without
 * breaking old links.
 */
import type { RecommendationComponentIds } from "./schemas";

const VERSION = "v1";
const categories = [
  "case",
  "pcb",
  "plate",
  "switch",
  "keycap",
  "stabilizer",
] as const satisfies readonly (keyof RecommendationComponentIds)[];
const ID_PATTERN = /^[a-z0-9_-]{1,120}$/;

export function encodeBuildCode(componentIds: RecommendationComponentIds): string {
  for (const category of categories) {
    if (!ID_PATTERN.test(componentIds[category])) {
      throw new Error(`Cannot encode ${category} id "${componentIds[category]}".`);
    }
  }

  return [VERSION, ...categories.map((category) => componentIds[category])].join(".");
}

/** Returns the six ids, or null for anything that is not a valid v1 code. */
export function decodeBuildCode(
  code: string | null | undefined,
): RecommendationComponentIds | null {
  if (!code) return null;

  let decoded: string;

  try {
    decoded = decodeURIComponent(code);
  } catch {
    return null; // malformed %-escape: not a code we made
  }

  const [version, ...ids] = decoded.trim().split(".");

  if (version !== VERSION || ids.length !== categories.length) return null;
  if (!ids.every((id) => ID_PATTERN.test(id))) return null;

  return Object.fromEntries(
    categories.map((category, index) => [category, ids[index]]),
  ) as RecommendationComponentIds;
}

export function buildSharePath(componentIds: RecommendationComponentIds): string {
  return `/configurator/b/${encodeBuildCode(componentIds)}`;
}
