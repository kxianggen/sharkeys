import Image from "next/image";
import Link from "next/link";

/**
 * The single shared top navigation. Apple-style thin bar: logo on the far
 * left, links centered in the bar, 0.5px bottom hairline, no shadow.
 *
 * Plain presentational component (no hooks) so it can render from both
 * server pages and client components. Visible labels are short; aria-labels
 * preserve the accessible route names the tests assert on.
 */
const NAV_LINKS = [
  { label: "Configurator", href: "/configurator" },
  { label: "Browse", href: "/browse" },
  { label: "Gallery", href: "/community-gallery", ariaLabel: "Community Gallery" },
  { label: "Builds", href: "/my-builds", ariaLabel: "My Builds" },
  { label: "Log in", href: "/login" },
] as const;

export function MainNav({ active }: { active?: string } = {}) {
  return (
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
        </div>
      </div>
    </nav>
  );
}
