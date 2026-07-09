"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Bot, Minus, Plus, X } from "lucide-react";

import { CommentComposer } from "@/components/comment-composer";
import type { GalleryComment, GalleryCommentThread } from "@/lib/gallery/service";

/**
 * One-level threaded discussion, Reddit-style: comments sit flat on the page
 * background with hairline thread lines for nesting (no card boxes). Each
 * top-level comment has a collapse control that hides its body and replies.
 * Threading data and the @meg reply behaviour are untouched — the server
 * flattens replies-to-replies onto the top-level parent; "Reply" on any
 * comment sets that comment as the composer's parent.
 */
export function CommentThread({
  postId,
  signedIn,
  threads,
}: {
  postId: string;
  signedIn: boolean;
  threads: GalleryCommentThread[];
}) {
  const [replyTo, setReplyTo] = useState<GalleryComment | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);

  const commentCount = threads.reduce(
    (total, thread) => total + 1 + thread.replies.length,
    0,
  );

  function startReply(comment: GalleryComment) {
    setReplyTo(comment);
    composerRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  return (
    <section aria-label="Discussion" className="border-t-[0.5px] border-border pt-5">
      <h2 className="text-base font-semibold text-primary">
        Discussion ·{" "}
        {commentCount === 1 ? "1 reply" : `${commentCount} replies`}
      </h2>
      <p className="mt-0.5 text-sm text-secondary">
        Tag @meg for grounded advice on this build.
      </p>

      <ul className="mt-5 space-y-5">
        {threads.map((thread) => (
          <CollapsibleThread
            key={thread.comment.id}
            onReply={signedIn ? startReply : undefined}
            thread={thread}
          />
        ))}
        {threads.length === 0 ? (
          <li className="py-4 text-sm text-secondary">
            No comments yet. Tag @meg to get grounded advice on this build.
          </li>
        ) : null}
      </ul>

      <div className="mt-7" ref={composerRef}>
        {signedIn ? (
          <CommentComposer
            key={replyTo?.id ?? "top-level"}
            onCancelReply={() => setReplyTo(null)}
            parentId={replyTo?.id ?? null}
            postId={postId}
            replyingTo={
              replyTo
                ? replyTo.isKeybot
                  ? "Meg"
                  : `@${replyTo.author?.username ?? "unknown"}`
                : null
            }
          />
        ) : (
          <p className="border-t-[0.5px] border-border pt-4 text-sm text-secondary">
            <Link
              className="font-semibold text-accent hover:text-accent-hover"
              href={`/login?next=/community-gallery/${postId}`}
            >
              Sign in
            </Link>{" "}
            to join the discussion and tag @meg.
          </p>
        )}
      </div>
    </section>
  );
}

function CollapsibleThread({
  onReply,
  thread,
}: {
  onReply?: (comment: GalleryComment) => void;
  thread: GalleryCommentThread;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { comment, replies } = thread;

  return (
    <li>
      <CommentBlock
        collapsed={collapsed}
        comment={comment}
        hiddenCount={collapsed ? 1 + replies.length : 0}
        onReply={onReply}
        onToggleCollapse={() => setCollapsed((current) => !current)}
      />
      {!collapsed && replies.length > 0 ? (
        <ul className="ml-[7px] mt-3 space-y-4 border-l-[1.5px] border-border pl-5">
          {replies.map((reply) => (
            <li key={reply.id}>
              <CommentBlock comment={reply} onReply={onReply} />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function CommentBlock({
  collapsed = false,
  comment,
  hiddenCount = 0,
  onReply,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  comment: GalleryComment;
  // Number of comments hidden while collapsed (this comment + its replies).
  hiddenCount?: number;
  onReply?: (comment: GalleryComment) => void;
  onToggleCollapse?: () => void;
}) {
  const authorLabel = comment.isKeybot ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
      <Bot className="h-4 w-4 text-accent" aria-hidden /> Meg
      <span className="rounded-pill bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
        Grounded assistant
      </span>
    </span>
  ) : (
    <span className="text-sm font-semibold text-primary">
      @{comment.author?.username ?? "unknown"}
    </span>
  );

  return (
    <article>
      <div className="flex items-center gap-2">
        {onToggleCollapse ? (
          <button
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand comment" : "Collapse comment"}
            className="flex h-4 w-4 flex-none items-center justify-center rounded-full border-[0.5px] border-border text-secondary transition-colors hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={onToggleCollapse}
            type="button"
          >
            {collapsed ? (
              <Plus className="h-3 w-3" aria-hidden />
            ) : (
              <Minus className="h-3 w-3" aria-hidden />
            )}
          </button>
        ) : null}
        {authorLabel}
        {collapsed ? (
          <span className="text-xs text-secondary">
            {hiddenCount === 1 ? "1 comment hidden" : `${hiddenCount} comments hidden`}
          </span>
        ) : null}
      </div>
      {!collapsed ? (
        <>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-primary">
            {comment.body}
          </p>
          {onReply ? (
            <button
              className="mt-1.5 text-xs font-medium text-secondary transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={() => onReply(comment)}
              type="button"
            >
              Reply
            </button>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

export function ReplyBanner({
  onCancel,
  replyingTo,
}: {
  onCancel: () => void;
  replyingTo: string;
}) {
  return (
    <p className="flex w-fit items-center gap-2 rounded-pill bg-accent-subtle px-3 py-1.5 text-xs font-medium text-primary">
      Replying to <span className="font-semibold">{replyingTo}</span>
      <button
        aria-label="Cancel reply"
        className="flex h-4 w-4 items-center justify-center rounded-full text-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        onClick={onCancel}
        type="button"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </p>
  );
}
