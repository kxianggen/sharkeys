import Image from "next/image";
import Link from "next/link";

import { BrowseCatalog } from "@/components/browse-catalog";
import { MainNav } from "@/components/main-nav";
import { getCatalogComponents } from "@/lib/components";

// Server component: the full catalog (Supabase when configured, seed
// otherwise) loads once here and the client handles filtering only.
export default async function BrowsePage() {
  const components = await getCatalogComponents();

  return (
    // overflow-x-clip: the category rows intentionally bleed to the viewport
    // edges; clip keeps that from creating a page-level horizontal scrollbar.
    <main className="min-h-screen overflow-x-clip bg-surface-secondary text-primary">
      <MainNav active="Browse" />

      <header className="mx-auto flex w-full max-w-[1024px] flex-col gap-6 px-4 pb-4 pt-14 sm:px-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-display">Browse</h1>
        <div className="md:text-right">
          <p className="max-w-sm text-h3 font-semibold text-primary">
            Every kit and part in the catalog.
          </p>
          <Link
            className="mt-2 inline-block text-sm font-medium text-accent hover:text-accent-hover"
            href="/configurator"
          >
            Not sure where to start? Ask the configurator ↗
          </Link>
        </div>
      </header>

      <BrowseCatalog components={[...components]} />

      <SimpleFooter />
    </main>
  );
}

function SimpleFooter() {
  return (
    <footer className="border-t-[0.5px] border-border bg-surface-secondary px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-[1024px] flex-wrap items-center justify-between gap-4 text-sm text-secondary">
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
