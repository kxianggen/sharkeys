// Decides what a gallery post shows: the author's uploaded photo when present,
// otherwise the kit hero image (the existing behaviour). Pure and additive —
// the kit-image resolution stays the fallback path, never replaced.

export type ResolvedPostImage =
  | { kind: "uploaded"; src: string }
  | { kind: "kit"; kitId: string | null };

export function resolvePostImage(
  imageUrl: string | null | undefined,
  kitId: string | null,
): ResolvedPostImage {
  if (imageUrl) {
    return { kind: "uploaded", src: imageUrl };
  }
  return { kind: "kit", kitId };
}
