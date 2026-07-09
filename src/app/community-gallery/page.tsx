import Link from "next/link";

import { KitImage } from "@/components/kit-image";
import { MainNav } from "@/components/main-nav";
import { getSessionUser } from "@/lib/auth";
import { getCatalogComponents } from "@/lib/components";
import { summarizeGalleryBuild } from "@/lib/gallery/build-summary";
import { listPublishedPosts } from "@/lib/gallery/service";

export default async function CommunityGalleryPage() {
  const [posts, user, catalog] = await Promise.all([
    listPublishedPosts(),
    getSessionUser(),
    getCatalogComponents(),
  ]);

  return (
    <main className="min-h-screen bg-surface-secondary text-primary">
      <MainNav active="Community" />

      <header className="mx-auto flex w-full max-w-[1024px] flex-col gap-6 px-4 pb-4 pt-14 sm:px-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-display">Community</h1>
        <div className="md:text-right">
          <p className="max-w-sm text-h3 font-semibold text-primary">
            Builds from the community.{" "}
            <span className="text-secondary">
              Tag @meg on any post for grounded advice.
            </span>
          </p>
          <Link
            className="mt-3 inline-flex h-10 items-center justify-center rounded-pill bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            href={
              user
                ? "/community-gallery/new"
                : "/login?next=/community-gallery/new"
            }
          >
            Publish a build
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1024px] px-4 pb-20 pt-8 sm:px-6">
        {posts.length === 0 ? (
          <div className="border-t-[0.5px] border-border pt-12 text-center">
            <p className="text-h3 font-semibold text-primary">
              No published builds yet.
            </p>
            <p className="mt-2 text-sm text-secondary">
              Be the first to share one with the community.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const summary = summarizeGalleryBuild(post.componentIds, catalog);
              const summaryLine = [
                `@${post.author?.username ?? "unknown"}`,
                summary.kitName,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <Link
                  className="group flex flex-col rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  href={`/community-gallery/${post.id}`}
                  key={post.id}
                >
                  <KitImage alt={`${post.title} build`} kitId={summary.kitId} />
                  <h2 className="mt-4 text-base font-semibold text-primary group-hover:text-accent">
                    {post.title}
                  </h2>
                  <p className="mt-1 text-sm text-secondary">{summaryLine}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
