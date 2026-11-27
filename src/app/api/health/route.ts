import { NextResponse } from "next/server";

import { loadCatalogComponents } from "@/lib/components";

// Never cache: the point of this route is to make a real database round trip.
export const dynamic = "force-dynamic";

/**
 * Health check that proves the database is reachable (v2 WS0).
 *
 * Reuses the normal catalogue loader, which quietly falls back to the local
 * seed catalogue when Supabase is unconfigured, paused or erroring. That
 * fallback is right for users but wrong for a health check, so this route
 * returns 503 whenever the catalogue did NOT come from Supabase.
 *
 * The daily GitHub Action (.github/workflows/keepalive.yml) calls this so the
 * free Supabase project sees activity and does not pause itself.
 *
 * Deliberately returns no error text: Supabase error messages can include
 * project details we do not want on a public endpoint.
 */
export async function GET() {
  const result = await loadCatalogComponents();
  const ok = result.source === "supabase";

  return NextResponse.json(
    {
      ok,
      source: result.source,
      count: result.components.length,
      fallbackReason: result.fallbackReason ?? null,
    },
    {
      status: ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
