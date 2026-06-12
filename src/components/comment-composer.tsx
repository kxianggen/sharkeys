"use client";

import { useActionState } from "react";

import {
  addCommentAction,
  type GalleryActionState,
} from "@/app/community-gallery/actions";

export function CommentComposer({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState<
    GalleryActionState,
    FormData
  >(addCommentAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="postId" type="hidden" value={postId} />
      <textarea
        className="min-h-20 rounded-xl border border-[#c2c7cf] bg-white px-3 py-2 text-sm font-medium focus:border-[#093C5D] focus:outline-none focus:ring-2 focus:ring-[#6FD1D7]/30"
        maxLength={1200}
        name="body"
        placeholder="Add a comment… tag @keybot for grounded advice."
        required
        rows={3}
      />
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-[#093C5D] px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#00263e] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
