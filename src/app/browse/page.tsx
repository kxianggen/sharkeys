import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

import { MainNav } from "@/components/main-nav";

const categories = ["Kits", "Switches", "Keycaps", "Stabilizers"] as const;

export default function BrowsePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-surface-secondary text-primary">
      <MainNav active="Browse" />

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

function SimpleFooter() {
  return (
    <footer className="border-t border-border bg-surface-secondary px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-4 text-sm text-secondary">
        <Image
          alt="Sharkeys"
          className="h-7 w-auto object-contain"
          height={28}
          src="/logo.png"
          width={97}
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
