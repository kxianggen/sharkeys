/**
 * Local-database guard (v2 WS2). Every script that writes catalogue rows or
 * embeddings calls this first. It refuses anything that is not a Supabase
 * stack running on this machine, so a live project URL picked up from
 * .env.local can never be written to by mistake.
 */

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]", "::1", "host.docker.internal"]);

export class NotLocalDatabaseError extends Error {
  constructor(url: string | undefined) {
    super(
      `Refusing to write: ${hostOf(url)} is not a local Supabase. ` +
        "WS2 writes only to the local stack (npx supabase start). Live writes need Jayson's OK and are not done by these scripts.",
    );
    this.name = "NotLocalDatabaseError";
  }
}

function hostOf(url: string | undefined) {
  if (!url) return "no URL";
  try {
    return new URL(url).host;
  } catch {
    return "an invalid URL";
  }
}

export function isLocalSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && LOCAL_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function assertLocalSupabaseUrl(url: string | undefined): string {
  if (!isLocalSupabaseUrl(url)) throw new NotLocalDatabaseError(url);
  return url!;
}
