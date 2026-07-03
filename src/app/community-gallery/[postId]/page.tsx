import Link from "next/link";
import { notFound } from "next/navigation";
import { Bot, ShieldCheck, ShieldAlert } from "lucide-react";

import { CommentComposer } from "@/components/comment-composer";
import { MainNav } from "@/components/main-nav";
import { getSessionUser } from "@/lib/auth";
import { getCatalogComponents } from "@/lib/components";
import { getPostWithComments } from "@/lib/gallery/service";
import { requiredComponentCategories } from "@/lib/types";

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
  const valid = post.validationSnapshot?.isValid ?? null;

  return (
    <main className="min-h-screen bg-surface-secondary text-primary">
      <MainNav active="Gallery" />

      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8">
        <Link
          className="text-sm font-bold text-primary hover:underline"
          href="/community-gallery"
        >
          ← Back to gallery
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-[-0.01em] text-primary">
              {post.title}
            </h1>
            <p className="mt-1 text-sm font-bold text-primary">
              @{post.author?.username ?? "unknown"}
            </p>
          </div>
          {valid === null ? null : valid ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Validated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              <ShieldAlert className="h-4 w-4" aria-hidden /> Has issues
            </span>
          )}
        </div>

        {post.description ? (
          <p className="mt-4 text-base leading-7 text-secondary">
            {post.description}
          </p>
        ) : null}

        {/* Bill of materials */}
        <div className="mt-8 rounded-3xl border border-border bg-white p-6">
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-primary">
            Build
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {requiredComponentCategories.map((category) => {
              const id = post.componentIds[category];
              return (
                <div key={category}>
                  <dt className="text-xs font-bold uppercase capitalize text-secondary">
                    {category}
                  </dt>
                  <dd className="text-sm font-medium text-primary">
                    {id ? (nameById.get(id) ?? id) : "—"}
                  </dd>
                </div>
              );
            })}
          </dl>

          {post.validationSnapshot?.explanations?.length ? (
            <ul className="mt-5 space-y-1 border-t border-border pt-4 text-sm text-secondary">
              {post.validationSnapshot.explanations.map((line, i) => (
                <li key={i}>• {line}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Comments */}
        <div className="mt-10">
          <h2 className="text-lg font-black text-primary">
            Comments ({comments.length})
          </h2>

          <ul className="mt-5 space-y-4">
            {comments.map((comment) => (
              <li
                className={`rounded-2xl border p-4 ${
                  comment.isKeybot
                    ? "border-accent/50 bg-accent-subtle"
                    : "border-border bg-white"
                }`}
                key={comment.id}
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  {comment.isKeybot ? (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Bot className="h-4 w-4" aria-hidden /> Keybot
                    </span>
                  ) : (
                    <span className="text-primary">
                      @{comment.author?.username ?? "unknown"}
                    </span>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-primary">
                  {comment.body}
                </p>
              </li>
            ))}
            {comments.length === 0 ? (
              <li className="text-sm text-secondary">
                No comments yet. Tag @keybot to get grounded advice on this build.
              </li>
            ) : null}
          </ul>

          <div className="mt-6">
            {user ? (
              <CommentComposer postId={post.id} />
            ) : (
              <p className="rounded-2xl border border-border bg-white p-4 text-sm text-secondary">
                <Link
                  className="font-bold text-primary underline"
                  href={`/login?next=/community-gallery/${post.id}`}
                >
                  Sign in
                </Link>{" "}
                to comment and tag @keybot.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
