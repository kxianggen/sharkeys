"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { signOutAction } from "@/app/(auth)/actions";
import { KitImage } from "@/components/kit-image";

/**
 * Body of the account flyout. This is the content revealed when the shared nav
 * bar expands (see MainNav); it is NOT a standalone floating card and owns no
 * open/close state — MainNav drives that and only mounts this when the bar is
 * open, so the builds read below fires lazily on open, never on every page load.
 *
 * The signed-in `username` is passed in from MainNav (which owns the single
 * auth read that also drives the avatar trigger), and is shown here under
 * "My Profile" — never in the bar as text. The saved-builds preview comes from
 * GET /api/account/builds-preview, which reuses the SAME server source as
 * /my-builds (listSavedBuilds + summarizeGalleryBuild over the real catalog);
 * its `loggedIn` flag is the authoritative signal for which sections render.
 *
 * Presentation/interaction only: auth logic, signOutAction, the builds-preview
 * API, the saved_builds data/actions, and the rule engine are untouched.
 */

type BuildPreview = {
  id: string;
  title: string;
  kitId: string | null;
  kitName: string | null;
  priceLabel: string | null;
  openHref: string;
};

type PreviewState =
  | { status: "loading" }
  | { status: "ready"; loggedIn: boolean; builds: BuildPreview[] };

const quietLinkClass =
  "text-[13px] font-medium text-secondary transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export function AccountPanel({
  onNavigate,
  username,
}: {
  onNavigate: () => void;
  username: string | null;
}) {
  const [preview, setPreview] = useState<PreviewState>({ status: "loading" });

  // Saved-builds preview + server-authoritative auth state. Fires on mount,
  // i.e. when the bar opens (MainNav mounts this only then).
  useEffect(() => {
    let active = true;
    void fetch("/api/account/builds-preview")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { loggedIn?: boolean; builds?: BuildPreview[] } | null) => {
        if (!active) return;
        setPreview({
          status: "ready",
          loggedIn: Boolean(data?.loggedIn),
          builds: data?.builds ?? [],
        });
      })
      .catch(() => {
        if (active) {
          setPreview({ status: "ready", loggedIn: false, builds: [] });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (preview.status !== "ready") {
    return <p className="text-[13px] text-secondary">Loading your account…</p>;
  }

  const { loggedIn, builds } = preview;

  return (
    <div>
      <YourBuildsSection
        builds={builds}
        loggedIn={loggedIn}
        onNavigate={onNavigate}
      />

      <div className="mt-7 border-t-[0.5px] border-border pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
          My Profile
        </p>
        {loggedIn ? (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[13px] font-medium text-primary">
              @{username ?? "account"}
            </span>
            <form action={signOutAction}>
              <button className={quietLinkClass} type="submit">
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            className="mt-3 inline-flex text-[13px] font-medium text-primary transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            href="/login"
            onClick={onNavigate}
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}

function YourBuildsSection({
  builds,
  loggedIn,
  onNavigate,
}: {
  builds: BuildPreview[];
  loggedIn: boolean;
  onNavigate: () => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
          Your builds
        </p>
        {loggedIn ? (
          <Link
            className="text-[13px] font-medium text-accent transition-colors hover:text-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            href="/my-builds"
            onClick={onNavigate}
          >
            View all
          </Link>
        ) : null}
      </div>

      {!loggedIn ? (
        <p className="mt-3 text-[13px] text-secondary">
          Sign in to save builds and see them here.
        </p>
      ) : builds.length === 0 ? (
        <div className="mt-3">
          <p className="text-[13px] font-medium text-primary">
            Your build is empty.
          </p>
          <Link
            className="mt-2 inline-flex text-[13px] font-medium text-accent transition-colors hover:text-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            href="/configurator"
            onClick={onNavigate}
          >
            Configure now
          </Link>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {builds.map((build) => (
            <li className="flex items-center gap-3" key={build.id}>
              <div className="w-14 shrink-0">
                <KitImage alt={`${build.title} build`} kitId={build.kitId} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-primary">
                  {build.title}
                </p>
                {build.priceLabel ? (
                  <p className="truncate text-[12px] text-secondary">
                    {build.priceLabel}
                  </p>
                ) : null}
              </div>
              <Link
                className="shrink-0 text-[13px] font-medium text-primary transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                href={build.openHref}
                onClick={onNavigate}
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
