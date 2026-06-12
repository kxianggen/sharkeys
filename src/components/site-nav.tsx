import Link from "next/link";
import { Keyboard } from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";
import { getCurrentProfile } from "@/lib/auth";

const LINKS = [
  ["Configurator", "/configurator"],
  ["Browse", "/browse"],
  ["Community Gallery", "/community-gallery"],
  ["My Builds", "/my-builds"],
] as const;

/**
 * Shared top navigation with auth state. Server component: reads the current
 * profile and renders either the username + sign-out, or a sign-in link.
 */
export async function SiteNav({ active }: { active?: string }) {
  const profile = await getCurrentProfile();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#dbe5ec] bg-[#f4f9fc]/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 text-[#093C5D]" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e1f3fe] text-[#093C5D]">
            <Keyboard className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-base font-black tracking-[-0.01em]">
            sharkeys.
          </span>
        </Link>

        <div className="hidden min-h-16 items-center gap-7 md:flex lg:gap-9">
          {LINKS.map(([label, href]) => (
            <Link
              className={`flex min-h-16 items-center border-b-2 text-xs font-bold transition lg:text-sm ${
                label === active
                  ? "border-[#093C5D] text-[#093C5D]"
                  : "border-transparent text-[#42474e] hover:text-[#093C5D]"
              }`}
              href={href}
              key={label}
            >
              {label}
            </Link>
          ))}
        </div>

        {profile ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-bold text-[#093C5D] sm:inline">
              @{profile.username}
            </span>
            <form action={signOutAction}>
              <button
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#093C5D] px-4 text-sm font-bold text-[#093C5D] transition hover:bg-[#093C5D] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#6FD1D7]/30"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#093C5D] px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#00263e] focus:outline-none focus:ring-4 focus:ring-[#6FD1D7]/30 sm:px-6"
            href="/login"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
