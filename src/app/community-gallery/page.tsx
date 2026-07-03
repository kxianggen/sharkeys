import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, ShieldAlert } from "lucide-react";

import { MainNav } from "@/components/main-nav";
import { getSessionUser } from "@/lib/auth";
import { listPublishedPosts } from "@/lib/gallery/service";

export default async function CommunityGalleryPage() {
  const [posts, user] = await Promise.all([
    listPublishedPosts(),
    getSessionUser(),
  ]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-surface-secondary text-primary">
      {/* Ambient Deep Ocean glow — soft frosted-blue backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(61,169,252,0.18),transparent_60%)]"
      />

      <MainNav active="Gallery" />

      <section className="relative z-10 mx-auto w-full max-w-screen-xl px-4 py-12 sm:px-8 lg:px-16">
        {/* Hero */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Community
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-[-0.02em] text-primary sm:text-6xl">
              Community Gallery
            </h1>
            <p className="mt-5 text-base leading-7 text-secondary">
              Published builds from the community. Open one and tag{" "}
              <span className="font-bold text-primary">@keybot</span> in a
              comment for grounded advice.
            </p>
          </div>

          {/* Glowing premium CTA */}
          <Link
            className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-accent px-7 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-gradient-to-r before:from-accent before:to-accent before:opacity-0 before:blur-md before:transition-opacity before:duration-300 hover:before:opacity-70"
            href={
              user
                ? "/community-gallery/new"
                : "/login?next=/community-gallery/new"
            }
          >
            <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" aria-hidden />
            Publish a build
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="mt-12 rounded-3xl border border-white/60 bg-white/80 p-10 text-center text-sm text-secondary shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
            No published builds yet. Be the first to share one.
          </p>
        ) : (
          <div className="mt-12 grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => {
              const valid = post.validationSnapshot?.isValid ?? null;
              return (
                <Link
                  className="group flex flex-col rounded-3xl border border-white/50 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
                  href={`/community-gallery/${post.id}`}
                  key={post.id}
                >
                  {/* Card header — username + validation tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-tight text-primary">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-subtle text-[10px] font-black uppercase text-primary">
                        {(post.author?.username ?? "?").charAt(0)}
                      </span>
                      @{post.author?.username ?? "unknown"}
                    </span>
                    {valid === null ? null : valid ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-500/20">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-500/20">
                        <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Check
                      </span>
                    )}
                  </div>

                  {/* Card content */}
                  <h2 className="mt-4 text-lg font-black leading-6 tracking-[-0.01em] text-primary">
                    {post.title}
                  </h2>
                  {post.description ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-secondary">
                      {post.description}
                    </p>
                  ) : null}

                  {/* View Build affordance */}
                  <div className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-bold text-primary">
                    <span className="transition-colors group-hover:text-accent">
                      Explore build
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-accent transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
