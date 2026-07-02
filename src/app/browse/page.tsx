import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

const categories = ["Kits", "Switches", "Keycaps", "Stabilizers"] as const;

export default function BrowsePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-surface-secondary text-primary">
      <SimpleNav active="Browse" />

      <section className="mx-auto w-full max-w-screen-xl px-4 py-12 sm:px-8 lg:px-16">
        <div className="rounded-[32px] border border-white/80 bg-white/70 p-8 shadow-sm backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
            Catalog
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.01em] text-primary sm:text-5xl">
            Browse Parts
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">
            A full catalog browser is coming later. For now, build generation
            and validation remain in the configurator workspace.
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-white p-4">
            <label className="sr-only" htmlFor="parts-search">
              Search catalog parts
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-secondary px-4 py-3 text-secondary">
              <Search className="h-5 w-5 text-primary" aria-hidden />
              <input
                aria-disabled="true"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-secondary"
                disabled
                id="parts-search"
                placeholder="Search is coming soon"
                type="search"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <span
                className="rounded-full border border-white/90 bg-white/80 px-5 py-2 text-sm font-bold text-primary shadow-sm"
                key={category}
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      <SimpleFooter />
    </main>
  );
}

function SimpleNav({ active }: { active: string }) {
  const links = [
    ["Configurator", "/configurator"],
    ["Browse", "/browse"],
    ["Community Gallery", "/community-gallery"],
    ["My Builds", "/my-builds"],
  ] as const;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface-secondary/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-3 text-primary focus:outline-none focus:ring-4 focus:ring-accent/30"
          href="/"
        >
          <Image
            alt="Sharkeys"
            className="h-8 w-auto object-contain sm:h-10"
            height={40}
            priority
            src="/logo.png"
            width={150}
          />
        </Link>

        <div className="hidden min-h-16 items-center gap-7 md:flex lg:gap-9">
          {links.map(([label, href]) => (
            <Link
              className={`flex min-h-16 items-center border-b-2 text-xs font-bold transition lg:text-sm ${
                label === active
                  ? "border-accent text-primary"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
              href={href}
              key={label}
            >
              {label}
            </Link>
          ))}
        </div>

        <Link
          className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 sm:px-6"
          href="/configurator"
        >
          Start Building
        </Link>
      </div>
    </nav>
  );
}

function SimpleFooter() {
  return (
    <footer className="border-t border-border bg-surface-secondary px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-4 text-sm text-secondary">
        <Image
          alt="Sharkeys"
          className="h-7 w-auto object-contain"
          height={28}
          src="/logo.png"
          width={130}
        />
        <div className="flex gap-5">
          <Link href="/">About</Link>
          <Link href="/">Privacy</Link>
          <Link href="/">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
