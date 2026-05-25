import Link from "next/link";
import { Keyboard, Sparkles, Users } from "lucide-react";

export default function CommunityGalleryPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f8fb] text-[#071e29]">
      <SimpleNav active="Community Gallery" />

      <section className="mx-auto w-full max-w-screen-xl px-4 py-12 sm:px-8 lg:px-16">
        <div className="rounded-[32px] border border-white/80 bg-white/70 p-8 shadow-[0_12px_40px_rgba(9,60,93,0.05)] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#3B7597]">
            Community
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.01em] text-[#001d32] sm:text-5xl">
            Community Gallery
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#42474e]">
            Shared builds will arrive in a later phase. For now, save local
            builds in your browser and open them from My Builds.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              "Featured quiet office builds",
              "Creator sound-profile boards",
              "Budget-friendly starter kits",
            ].map((title) => (
              <article
                className="rounded-3xl border border-[#c2c7cf] bg-white p-5 shadow-sm"
                key={title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f7fb] text-[#093C5D]">
                  <Users className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="mt-4 text-lg font-black text-[#071e29]">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#42474e]">
                  Future community posting placeholder. No auth or sharing is
                  enabled in this phase.
                </p>
              </article>
            ))}
          </div>

          <Link
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#093C5D] px-6 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#00263e] focus:outline-none focus:ring-4 focus:ring-[#6FD1D7]/30"
            href="/configurator"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Create or save a build
          </Link>
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
    <nav className="sticky top-0 z-50 border-b border-[#dbe5ec] bg-[#f4f9fc]/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-3 text-[#093C5D] focus:outline-none focus:ring-4 focus:ring-[#6FD1D7]/30"
          href="/"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e1f3fe] text-[#093C5D]">
            <Keyboard className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-base font-black tracking-[-0.01em]">
            sharkeys.
          </span>
        </Link>

        <div className="hidden min-h-16 items-center gap-7 md:flex lg:gap-9">
          {links.map(([label, href]) => (
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

        <Link
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#093C5D] px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#00263e] focus:outline-none focus:ring-4 focus:ring-[#6FD1D7]/30 sm:px-6"
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
    <footer className="border-t border-[#dbe5ec] bg-[#f8fcff] px-4 py-10 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-4 text-sm text-[#42474e]">
        <p className="font-black text-[#071e29]">sharkeys.</p>
        <div className="flex gap-5">
          <Link href="/">About</Link>
          <Link href="/">Privacy</Link>
          <Link href="/">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
