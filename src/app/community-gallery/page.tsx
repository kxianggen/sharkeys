import Link from "next/link";
import { MessageSquare, PenSquare } from "lucide-react";

import { BuildPostImage } from "@/components/build-post-image";
import { MainNav } from "@/components/main-nav";
import { getSessionUser } from "@/lib/auth";
import { getCatalogComponents } from "@/lib/components";
import { summarizeGalleryBuild } from "@/lib/gallery/build-summary";
import { listPublishedPosts } from "@/lib/gallery/service";

/**
 * UAT finding 2: testers said this "does not look like a page for posts".
 *
 * It was a three-column image grid — the affordances of a photo gallery, where
 * the image leads and the author, the time and the discussion are absent or
 * secondary. Restructured into a single-column feed carrying the conventions
 * people already read as "posts": author and timestamp above the title, title
 * as the dominant element, a body excerpt, and a discussion affordance.
 *
 * Presentation only. No data model or server action changed — the same
 * listPublishedPosts payload drives all of it, using the createdAt and author
 * fields the grid already received but never displayed.
 */
export default async function CommunityGalleryPage() {
  const [posts, user, catalog] = await Promise.all([
    listPublishedPosts(),
    getSessionUser(),
    getCatalogComponents(),
  ]);

  const composeHref = user
    ? "/community-gallery/new"
    : "/login?next=/community-gallery/new";

  return (
    <main className="min-h-screen bg-surface-secondary text-primary">
      <MainNav active="Community" />

      <header className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-4 pb-6 pt-14 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <h1 className="text-display">Community</h1>
          <p className="mt-2 max-w-md text-sm text-secondary">
            Builds, questions and sound tests from the community. Tag @meg on
            any post for grounded advice.
          </p>
        </div>

        {/* The primary action, and the only accent-filled control on the page,
            so it reads as primary rather than as one button among several. */}
        <Link
          className="inline-flex h-10 flex-none items-center justify-center gap-2 rounded-pill bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          href={composeHref}
        >
          <PenSquare className="h-4 w-4" aria-hidden />
          New post
        </Link>
      </header>

      <section className="mx-auto w-full max-w-[720px] px-4 pb-20 sm:px-6">
        {posts.length === 0 ? (
          <EmptyState composeHref={composeHref} />
        ) : (
          <ul className="flex flex-col gap-4">
            {posts.map((post) => {
              const summary = summarizeGalleryBuild(post.componentIds, catalog);
              const hasBuild = Object.keys(post.componentIds).length > 0;
              // A buildless post with no photo stays text-only rather than
              // rendering an empty image tile.
              const showVisual = Boolean(post.imageUrl) || hasBuild;
              const handle = post.author?.username ?? "unknown";

              return (
                <li key={post.id}>
                  <Link
                    className="group flex flex-col gap-3 rounded-lg border-[0.5px] border-border bg-surface p-5 transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    href={`/community-gallery/${post.id}`}
                  >
                    {/* Byline first: who and when — the two things the grid
                        received in its payload but never showed. */}
                    <div className="flex items-center gap-2 text-[13px] text-secondary">
                      <span
                        aria-hidden
                        className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-subtle text-[11px] font-semibold text-primary"
                      >
                        {handle.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium text-primary">@{handle}</span>
                      <span aria-hidden>·</span>
                      <time dateTime={post.createdAt}>
                        {formatPostedAt(post.createdAt)}
                      </time>
                    </div>

                    <div className="flex gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-h3 font-semibold leading-snug text-primary group-hover:text-accent">
                          {post.title}
                        </h2>

                        {post.description ? (
                          <p className="mt-1.5 line-clamp-2 text-sm text-secondary">
                            {post.description}
                          </p>
                        ) : null}

                        {summary.kitName ? (
                          <p className="mt-2 inline-flex rounded-pill bg-surface-secondary px-2.5 py-1 text-[12px] font-medium text-secondary">
                            {summary.kitName}
                          </p>
                        ) : null}
                      </div>

                      {showVisual ? (
                        <div className="w-28 flex-none sm:w-36">
                          <BuildPostImage
                            alt={`${post.title} build`}
                            imageUrl={post.imageUrl}
                            kitId={summary.kitId}
                          />
                        </div>
                      ) : null}
                    </div>

                    {/* Discussion affordance. The reply count is not in the
                        list payload, so this invites the thread rather than
                        asserting a number the page cannot know. */}
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-secondary group-hover:text-accent">
                      <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                      Join the discussion
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function EmptyState({ composeHref }: { composeHref: string }) {
  return (
    <div className="rounded-lg border-[0.5px] border-dashed border-border bg-surface px-6 py-14 text-center">
      <h2 className="text-h3 font-semibold text-primary">No posts yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-secondary">
        Share a build, ask what makes a board sound thocky, or post a sound
        test. Tag @meg on any post for grounded advice.
      </p>
      <Link
        className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        href={composeHref}
      >
        <PenSquare className="h-4 w-4" aria-hidden />
        Write the first post
      </Link>
    </div>
  );
}

/**
 * Relative age for recent posts, absolute date once that stops being useful.
 * Hand-rolled deliberately: no formatting dependency is worth adding for one
 * line, and Intl.RelativeTimeFormat would still need the same bucketing.
 */
function formatPostedAt(iso: string) {
  const posted = new Date(iso);
  const minutes = Math.floor((Date.now() - posted.getTime()) / 60_000);

  if (!Number.isFinite(minutes) || minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return posted.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year:
      posted.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}
