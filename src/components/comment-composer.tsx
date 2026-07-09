"use client";

import { useActionState } from "react";

import {
  addCommentAction,
  type GalleryActionState,
} from "@/app/community-gallery/actions";
import { ReplyBanner } from "@/components/comment-thread";

export function CommentComposer({
  onCancelReply,
  parentId = null,
  postId,
  replyingTo = null,
}: {
  onCancelReply?: () => void;
  parentId?: string | null;
  postId: string;
  // Display label ("@username" or "Meg") for the comment being replied to.
  replyingTo?: string | null;
}) {
  const [state, formAction, pending] = useActionState<
    GalleryActionState,
    FormData
  >(addCommentAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="postId" type="hidden" value={postId} />
      {parentId ? <input name="parentId" type="hidden" value={parentId} /> : null}
      {replyingTo && onCancelReply ? (
        <ReplyBanner onCancel={onCancelReply} replyingTo={replyingTo} />
      ) : null}
      <textarea
        className="min-h-20 rounded-xl border-[0.5px] border-border bg-surface px-3 py-2 text-sm text-primary placeholder:text-secondary/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        maxLength={1200}
        name="body"
        placeholder={
          replyingTo
            ? `Reply to ${replyingTo}…`
            : "Add a comment… tag @meg for grounded advice."
        }
        required
        rows={3}
      />
      {state?.error ? (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm font-medium text-error">
          {state.error}
        </p>
      ) : null}
      <button
        className="inline-flex h-10 w-fit items-center justify-center rounded-pill bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Posting…" : replyingTo ? "Post reply" : "Post comment"}
      </button>
    </form>
  );
}
