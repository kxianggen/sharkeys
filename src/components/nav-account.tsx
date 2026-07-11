"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

import { signOutAction } from "@/app/(auth)/actions";
import type { Database } from "@/lib/types/database";

/**
 * Auth-aware account slot for the shared nav. A small client island so it works
 * identically whether MainNav is rendered from a server page or from inside a
 * client component (the configurator/my-builds tree) — no session prop needs to
 * be threaded through either parent.
 *
 * Reads the cookie session with the browser Supabase client. Env vars are read
 * as *literal* `process.env.NEXT_PUBLIC_*` references (the only form Next.js
 * inlines into the browser bundle); the shared `createSupabaseBrowserClient`
 * factory reads them indirectly, which resolves to undefined client-side, so we
 * construct the client here. No auth logic, actions, or config are changed.
 *
 * Resting state is the "Log in" link, so signed-out users (and the offline-dev
 * / placeholder-env case) see exactly the previous behaviour.
 */

const PLACEHOLDER_URL = "https://your-project.supabase.co";
const PLACEHOLDER_ANON_KEY = "your-supabase-anon-key";

// Quiet nav-link styling, matched to the other centered links.
const quietLinkClass =
  "text-[13px] font-medium text-secondary transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export function NavAccount() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (
      !url ||
      !anonKey ||
      url === PLACEHOLDER_URL ||
      anonKey === PLACEHOLDER_ANON_KEY
    ) {
      // Supabase not configured (offline dev) — stay on the "Log in" link.
      return;
    }

    const supabase = createBrowserClient<Database>(url, anonKey);
    let active = true;

    async function resolve(userId?: string, email?: string | null) {
      if (!userId) {
        if (active) setUsername(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      setUsername(data?.username ?? email?.split("@")[0] ?? "account");
    }

    void supabase.auth
      .getUser()
      .then(({ data }) => resolve(data.user?.id, data.user?.email));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void resolve(session?.user?.id, session?.user?.email);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!username) {
    return (
      <Link className={quietLinkClass} href="/login">
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] font-medium text-primary">@{username}</span>
      <form action={signOutAction}>
        <button className={quietLinkClass} type="submit">
          Log out
        </button>
      </form>
    </div>
  );
}
