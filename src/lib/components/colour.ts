import { componentColourSchema } from "@/lib/types";
import type { ComponentColour, KeyboardComponent } from "@/lib/types";

/**
 * Colour tags for a catalog component (UAT finding 1).
 *
 * Stored in metadata.colour, matching the existing metadata.swatch convention
 * rather than adding a top-level schema field. Two reasons: it keeps the
 * component schemas — which validate the Supabase catalog — unchanged, and the
 * rule engine reads metadata only by explicit key (kitId, kitLock, sourceType,
 * plateMaterial), never by iteration, so a colour tag provably cannot reach
 * compatibility validation.
 *
 * Tags are stored EXPLICITLY on each record rather than derived at runtime from
 * metadata.swatch. Deriving colour names from hex at request time would make
 * every recommendation depend on a classifier whose edge cases (is #7C9082 sage
 * green or grey? is #DFD6C2 beige or pastel?) nobody can audit. Stored tags are
 * reviewable data.
 *
 * ABSENT IS A FIRST-CLASS STATE. A record with no colour tag returns an empty
 * array, and callers must treat that as "no signal" — never as a mismatch. Some
 * catalog records genuinely have no colour data (no colour in the product name,
 * no vendor colourway recorded), and an untagged record must not be ranked
 * below a tagged one for lacking curation. Otherwise the ranking would encode
 * how complete our metadata is rather than what the user asked for.
 */
export function getComponentColours(
  component: KeyboardComponent | undefined,
): readonly ComponentColour[] {
  const value = component?.metadata?.colour;

  if (!Array.isArray(value)) return [];

  // Parsed against the vocabulary rather than cast: metadata is
  // Record<string, unknown>, and the Supabase catalog can carry values this
  // build does not know about. Unknown entries are dropped, not trusted.
  return value.flatMap((entry) => {
    const parsed = componentColourSchema.safeParse(entry);

    return parsed.success ? [parsed.data] : [];
  });
}
