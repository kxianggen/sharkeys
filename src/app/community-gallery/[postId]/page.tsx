import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { CommentThread } from "@/components/comment-thread";
import { KitImage } from "@/components/kit-image";
import { MainNav } from "@/components/main-nav";
import { getSessionUser } from "@/lib/auth";
import { getCatalogComponents } from "@/lib/components";
import { summarizeGalleryBuild } from "@/lib/gallery/build-summary";
import { buildCommentThreads, getPostWithComments } from "@/lib/gallery/service";
import { requiredComponentCategories } from "@/lib/types";

function formatPostedAt(createdAt: string) {
  const date = new Date(createdAt);

  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en-MY", { dateStyle: "medium" }).format(date);
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  const [detail, user, catalog] = await Promise.all([
    getPostWithComments(postId),
    getSessionUser(),
    getCatalogComponents(),
  ]);

  if (!detail) notFound();

  const { post, comments } = detail;
  const nameById = new Map(catalog.map((c) => [c.id, `${c.brand} — ${c.name}`]));
  const summary = summarizeGalleryBuild(post.componentIds, catalog);
  const postedAt = formatPostedAt(post.createdAt);
  const threads = buildCommentThreads(comments);
  const selectedCategories = requiredComponentCategories.filter(
    (category) => post.componentIds[category],
  );

  return (
    <main className="min-h-screen bg-surface-secondary text-primary">
      <MainNav active="Community" />

      <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <Link
          className="text-sm font-medium text-secondary transition-colors hover:text-primary"
          href="/community-gallery"
        >
          ← Community
        </Link>

        {/* Post reads top-down: title → author/time → description → build */}
        <header className="mt-4">
          <h1 className="text-h3 font-semibold text-primary">{post.title}</h1>
          <p className="mt-1 text-sm text-secondary">
            @{post.author?.username ?? "unknown"}
            {postedAt ? ` · ${postedAt}` : ""}
          </p>
        </header>

        {post.description ? (
          <p className="mt-3 text-base leading-7 text-primary">
            {post.description}
          </p>
        ) : null}

        <div className="mt-4 max-w-md">
          <KitImage alt={`${post.title} build`} kitId={summary.kitId} />
        </div>

        {/* Parts: collapsed disclosure — validation is implicit, never shown */}
        <details className="group mt-4 border-y-[0.5px] border-border py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 [&::-webkit-details-marker]:hidden">
            <span>
              {[summary.kitName, `${selectedCategories.length} parts`]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <ChevronDown
              aria-hidden
              className="h-4 w-4 text-secondary transition-transform group-open:rotate-180"
            />
          </summary>
          <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {selectedCategories.map((category) => {
              const id = post.componentIds[category];
              return (
                <div key={category}>
                  <dt className="text-xs font-medium capitalize text-secondary">
                    {category}
                  </dt>
                  <dd className="text-sm font-medium text-primary">
                    {id ? (nameById.get(id) ?? id) : "—"}
                  </dd>
                </div>
              );
            })}
          </dl>
          {summary.priceLabel ? (
            <p className="mt-3 text-sm text-secondary">
              Estimated total: {summary.priceLabel}
            </p>
          ) : null}
        </details>

        {/* Discussion */}
        <div className="mt-6">
          <CommentThread
            postId={post.id}
            signedIn={Boolean(user)}
            threads={threads}
          />
        </div>
      </section>
    </main>
  );
}
