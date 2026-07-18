import { readOptionalSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CompatibilityResult, ComponentIdSelection } from "@/lib/types";

// Stored validation snapshot omits `selectedComponents` (the full component
// objects are redundant with componentIds and not JSON-serializable cleanly).
export type ValidationSnapshot = Omit<CompatibilityResult, "selectedComponents">;

export type GalleryAuthor = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type GalleryPost = {
  id: string;
  title: string;
  description: string | null;
  componentIds: ComponentIdSelection;
  validationSnapshot: ValidationSnapshot | null;
  // Public URL of the author's uploaded build photo; null falls back to the
  // kit hero image at render time.
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  author: GalleryAuthor | null;
};

export type GalleryComment = {
  id: string;
  body: string;
  isKeybot: boolean;
  createdAt: string;
  author: GalleryAuthor | null;
  // Single-level threading: null = top-level, otherwise the parent comment id.
  parentId: string | null;
};

// A top-level comment plus its (chronological) nested replies. Threading is
// exactly one level deep; replies-to-replies are flattened at write time.
export type GalleryCommentThread = {
  comment: GalleryComment;
  replies: GalleryComment[];
};

/**
 * Groups a flat, chronologically-ordered comment list into one-level threads.
 * A reply whose parent is missing (deleted) or is itself a reply still lands
 * exactly one level deep under the nearest resolvable top-level comment, or is
 * promoted to top-level as a last resort — never dropped, never nested deeper.
 */
export function buildCommentThreads(
  comments: readonly GalleryComment[],
): GalleryCommentThread[] {
  const byId = new Map(comments.map((comment) => [comment.id, comment]));
  const threads: GalleryCommentThread[] = [];
  const threadByCommentId = new Map<string, GalleryCommentThread>();

  for (const comment of comments) {
    // Resolve the top-level ancestor (at most one hop in well-formed data).
    let anchor = comment.parentId ? byId.get(comment.parentId) : undefined;
    while (anchor?.parentId && byId.get(anchor.parentId)) {
      anchor = byId.get(anchor.parentId);
    }

    if (comment.parentId && anchor) {
      const thread = threadByCommentId.get(anchor.id);
      if (thread) {
        thread.replies.push(comment);
        continue;
      }
    }

    const thread: GalleryCommentThread = { comment, replies: [] };
    threads.push(thread);
    threadByCommentId.set(comment.id, thread);
  }

  return threads;
}

// Supabase returns joined `profiles` as an object (or null). Narrow it here.
type AuthorRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
} | null;

function mapAuthor(row: AuthorRow): GalleryAuthor | null {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}

const POST_SELECT =
  "id, title, description, component_ids, validation_snapshot, image_url, is_published, created_at, author:profiles!build_posts_author_id_fkey(id, username, display_name, avatar_url)";

/**
 * Lists published gallery posts (newest first). RLS guarantees only published
 * posts — plus the viewer's own drafts — are returned. Returns [] when Supabase
 * is not configured, so the gallery page renders an empty state offline.
 */
export async function listPublishedPosts(limit = 30): Promise<GalleryPost[]> {
  if (!readOptionalSupabasePublicEnv()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("build_posts")
    .select(POST_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    componentIds: (row.component_ids ?? {}) as ComponentIdSelection,
    validationSnapshot: (row.validation_snapshot as ValidationSnapshot | null) ?? null,
    imageUrl: row.image_url ?? null,
    isPublished: row.is_published,
    createdAt: row.created_at,
    author: mapAuthor(row.author as AuthorRow),
  }));
}

export type GalleryPostDetail = {
  post: GalleryPost;
  comments: GalleryComment[];
};

/**
 * Loads a single post plus its comment thread. Returns null when the post is
 * not visible to the viewer (RLS) or Supabase is unconfigured.
 */
export async function getPostWithComments(
  postId: string,
): Promise<GalleryPostDetail | null> {
  if (!readOptionalSupabasePublicEnv()) return null;

  const supabase = await createSupabaseServerClient();

  const { data: postRow, error: postError } = await supabase
    .from("build_posts")
    .select(POST_SELECT)
    .eq("id", postId)
    .maybeSingle();

  if (postError || !postRow) return null;

  const { data: commentRows } = await supabase
    .from("post_comments")
    .select(
      "id, body, is_keybot, created_at, parent_id, author:profiles!post_comments_author_id_fkey(id, username, display_name, avatar_url)",
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  return {
    post: {
      id: postRow.id,
      title: postRow.title,
      description: postRow.description,
      componentIds: (postRow.component_ids ?? {}) as ComponentIdSelection,
      validationSnapshot:
        (postRow.validation_snapshot as ValidationSnapshot | null) ?? null,
      imageUrl: postRow.image_url ?? null,
      isPublished: postRow.is_published,
      createdAt: postRow.created_at,
      author: mapAuthor(postRow.author as AuthorRow),
    },
    comments: (commentRows ?? []).map((row) => ({
      id: row.id,
      body: row.body,
      isKeybot: row.is_keybot,
      createdAt: row.created_at,
      author: mapAuthor(row.author as AuthorRow),
      parentId: row.parent_id ?? null,
    })),
  };
}
