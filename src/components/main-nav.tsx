"use client";

import Image from "next/image";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { CircleUser } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AccountPanel } from "@/components/nav-account";
import type { Database } from "@/lib/types/database";

/**
 * The single shared top navigation. Apple-style thin bar: logo on the far left,
 * links centered, 0.5px bottom hairline, no shadow.
 *
 * The account flyout is built as the *bar itself expanding* (Apple account/bag
 * style): the account trigger toggles a collapsible region that lives inside
 * this same <nav> surface, below the top row and above the hairline, animating
 * its height open/closed — not a detached floating card. The panel content is
 * left-aligned to the nav's content container (same left edge as the logo). The
 * page below is dimmed and blurred by a fixed scrim; the opaque nav (z above the
 * scrim) keeps itself crisp. Escape / backdrop click / icon toggle close it;
 * focus moves into the panel on open and returns to the trigger on close;
 * reduced motion disables the transitions.
 *
 * The trigger is an avatar disc: the signed-in user's first initial, or a
 * person icon when signed out. Identity is read here (once) via the browser
 * Supabase client and passed to the panel, so the bar and the "My Profile"
 * section share a single auth read. A client component because it owns this
 * interaction — still rendered from server pages (client composes under server).
 */
const PLACEHOLDER_URL = "https://your-project.supabase.co";
const PLACEHOLDER_ANON_KEY = "your-supabase-anon-key";

const NAV_LINKS = [
  { label: "Configurator", href: "/configurator" },
  { label: "Browse", href: "/browse" },
  { label: "Community", href: "/community-gallery", ariaLabel: "Community Gallery" },
] as const;

const PANEL_ID = "account-flyout-panel";

export function MainNav({ active }: { active?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Identity for the avatar trigger + the panel's My Profile section (unchanged
  // auth read). Runs on mount so the bar can show the signed-in initial.
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (
      !url ||
      !anonKey ||
      url === PLACEHOLDER_URL ||
      anonKey === PLACEHOLDER_ANON_KEY
    ) {
      // Supabase not configured (offline dev) — stay signed-out (person icon).
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

  const close = useCallback(() => {
    setOpen(false);
    setVisible(false);
    triggerRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Enter transition: mount the region, then flip `visible` next frame so the
  // bar animates its height open. Reduced-motion users get the same states with
  // the transition disabled via `motion-reduce:` utilities.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Escape closes; move focus into the panel on open.
  useEffect(() => {
    if (!open) return;

    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const initial =
    username && username.trim() ? username.trim().charAt(0).toUpperCase() : null;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b-[0.5px] border-border bg-surface">
        <div className="mx-auto flex h-12 w-full max-w-[1024px] items-center justify-center gap-8 px-4 sm:px-6">
          <Link
            className="flex flex-none items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            href="/"
          >
            <Image
              alt="Sharkeys"
              className="h-[18px] w-auto object-contain"
              height={18}
              priority
              src="/logo.png"
              width={62}
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                aria-label={"ariaLabel" in link ? link.ariaLabel : undefined}
                className={`text-[13px] font-medium transition-colors ${
                  link.label === active
                    ? "text-primary"
                    : "text-secondary hover:text-primary"
                }`}
                href={link.href}
                key={link.label}
              >
                {link.label}
              </Link>
            ))}
            <button
              aria-controls={PANEL_ID}
              aria-expanded={open}
              aria-haspopup="dialog"
              aria-label="Account"
              className="flex items-center rounded-full text-secondary transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={toggle}
              ref={triggerRef}
              type="button"
            >
              {initial ? (
                <span
                  aria-hidden
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-on-accent"
                >
                  {initial}
                </span>
              ) : (
                <CircleUser className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {/* The bar's own expanding region — one continuous surface with the top
            row, height-animated via the grid-rows 0fr→1fr trick. */}
        {open ? (
          <div
            className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
              visible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div
                aria-label="Account"
                className="mx-auto w-full max-w-[1024px] px-4 pb-9 pt-5 sm:px-6"
                id={PANEL_ID}
                ref={panelRef}
                role="dialog"
                tabIndex={-1}
              >
                {/* Left-aligned content column, anchored to the nav's left edge. */}
                <div className="w-full max-w-sm">
                  <AccountPanel onNavigate={close} username={username} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      {open ? (
        <div
          aria-hidden
          className={`fixed inset-0 z-40 bg-primary/20 backdrop-blur-md transition-opacity duration-200 motion-reduce:transition-none ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          onClick={close}
        />
      ) : null}
    </>
  );
}
