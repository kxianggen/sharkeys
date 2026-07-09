import { describe, expect, it } from "vitest";

import {
  buildCommentThreads,
  type GalleryComment,
} from "@/lib/gallery/service";

function comment(
  id: string,
  parentId: string | null = null,
  isKeybot = false,
): GalleryComment {
  return {
    id,
    body: `body ${id}`,
    isKeybot,
    createdAt: `2026-07-0${id.length}T00:00:00Z`,
    author: isKeybot
      ? null
      : {
          id: `author-${id}`,
          username: `user-${id}`,
          displayName: null,
          avatarUrl: null,
        },
    parentId,
  };
}

describe("buildCommentThreads", () => {
  it("groups replies one level under their top-level parent", () => {
    const threads = buildCommentThreads([
      comment("a"),
      comment("b"),
      comment("a1", "a"),
      comment("b1", "b", true),
    ]);

    expect(threads.map((t) => t.comment.id)).toEqual(["a", "b"]);
    expect(threads[0].replies.map((r) => r.id)).toEqual(["a1"]);
    expect(threads[1].replies.map((r) => r.id)).toEqual(["b1"]);
  });

  it("keeps a reply-to-a-reply at the same single nested level", () => {
    const threads = buildCommentThreads([
      comment("a"),
      comment("a1", "a"),
      comment("a2", "a1"),
    ]);

    expect(threads).toHaveLength(1);
    expect(threads[0].replies.map((r) => r.id)).toEqual(["a1", "a2"]);
  });

  it("promotes a reply with a missing parent to top-level instead of dropping it", () => {
    const threads = buildCommentThreads([comment("orphan", "deleted")]);

    expect(threads.map((t) => t.comment.id)).toEqual(["orphan"]);
    expect(threads[0].replies).toEqual([]);
  });

  it("returns flat top-level threads when nothing is nested", () => {
    const threads = buildCommentThreads([comment("a"), comment("b")]);

    expect(threads.map((t) => t.comment.id)).toEqual(["a", "b"]);
    expect(threads.every((t) => t.replies.length === 0)).toBe(true);
  });
});
