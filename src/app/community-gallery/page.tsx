import Link from "next/link";
import { Sparkles, ShieldCheck, ShieldAlert } from "lucide-react";

import { SiteNav } from "@/components/site-nav";
import { getSessionUser } from "@/lib/auth";
import { listPublishedPosts } from "@/lib/gallery/service";

export default async function CommunityGalleryPage() {
  const [posts, user] = await Promise.all([
    listPublishedPosts(),
    getSessionUser(),
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f8fb] text-[#071e29]">
      <SiteNav active="Community Gallery" />

      <section className="mx-auto w-full max-w-screen-xl px-4 py-12 sm:px-8 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#3B7597]">
              Community
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.01em] text-[#001d32] sm:text-5xl">
              Community Gallery
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#42474e]">
              Published builds from the community. Open one and tag{" "}
              <span className="font-bold">@keybot</span> in a comment for
              grounded advice.
            </p>
          </div>

          <Link
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#093C5D] px-6 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#00263e]"
            href={
              user
                ? "/community-gallery/new"
                : "/login?next=/community-gallery/new"
            }
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Publish a build
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="mt-12 rounded-3xl border border-[#c2c7cf] bg-white p-8 text-center text-sm text-[#42474e]">
            No published builds yet. Be the first to share one.
          </p>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const valid = post.validationSnapshot?.isValid ?? null;
              return (
                <Link
                  className="flex flex-col rounded-3xl border border-[#c2c7cf] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  href={`/community-gallery/${post.id}`}
                  key={post.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#3B7597]">
                      @{post.author?.username ?? "unknown"}
                    </span>
                    {valid === null ? null : valid ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                        <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Check
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-lg font-black text-[#071e29]">
                    {post.title}
                  </h2>
                  {post.description ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#42474e]">
                      {post.description}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
