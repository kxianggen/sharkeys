import type { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

const BUCKET = "build-post-images";
const CONTENT_TYPE = "image/webp";
// Owner-only-write RLS keys off the first path segment being the caller's uid:
// build-post-images/<user_id>/<uuid>.webp.
const DATA_URL_PREFIX = "data:image/webp;base64,";

/**
 * Uploads a client-compressed WebP data URL to the public build-post-images
 * bucket under `<userId>/<uuid>.webp` and returns its public URL.
 *
 * Uses the caller's cookie-aware (RLS-bound) client — never the service role.
 * Returns null on any failure so the caller can publish the post without an
 * image rather than losing it; malformed input is rejected the same way.
 */
export async function uploadBuildPostImage(
  supabase: SupabaseServerClient,
  userId: string,
  dataUrl: string,
): Promise<string | null> {
  if (!dataUrl.startsWith(DATA_URL_PREFIX)) return null;

  const base64 = dataUrl.slice(DATA_URL_PREFIX.length);
  let bytes: Buffer;
  try {
    bytes = Buffer.from(base64, "base64");
  } catch {
    return null;
  }
  if (bytes.byteLength === 0) return null;

  const path = `${userId}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: CONTENT_TYPE,
    upsert: false,
  });
  if (error) return null;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? null;
}
