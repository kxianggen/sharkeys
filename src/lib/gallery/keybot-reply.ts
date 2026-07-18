import { invokeKeybotAgent } from "@/lib/agent";
import { readOptionalSupabasePublicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ComponentIdSelection } from "@/lib/types";

// The assistant's user-facing name is Meg; internal identifiers keep the
// keybot naming (API route, is_keybot column, function names).
const KEYBOT_MENTION = /@meg\b/i;
const MAX_HISTORY = 6;
const MAX_CONTENT = 1200;

export function mentionsKeybot(body: string): boolean {
  return KEYBOT_MENTION.test(body);
}

// Removes the @meg mention to form the agent prompt; falls back to a neutral
// question when nothing meaningful remains. On a buildless post the caller
// passes a build-agnostic fallback so Meg is never prompted about a build that
// doesn't exist.
export function stripKeybotMention(
  body: string,
  fallback = "What do you think of this build?",
): string {
  return body.replace(KEYBOT_MENTION, "").trim() || fallback;
}

/**
 * If a freshly-posted comment tags @meg, generate a grounded reply through
 * the LangGraph agent and persist it as a keybot comment.
 *
 * The post is the context: its component selection + frozen validation snapshot
 * are passed to the agent as `selectedComponentIds`, and the recent thread as
 * `conversationHistory`. The reply is inserted with the SERVICE ROLE because RLS
 * forbids users from creating `is_keybot=true` rows — this server-only path is
 * the only place keybot replies are written, and only after grounding.
 *
 * Failures never bubble up: the human comment must still succeed even if the
 * agent or insert fails.
 */
export async function maybeReplyWithKeybot({
  postId,
  commentBody,
  parentId = null,
}: {
  postId: string;
  commentBody: string;
  // Thread parent for the reply: the tagging comment's id when it is
  // top-level, or its parent's id when the tag came from a nested reply
  // (threading is a single level deep).
  parentId?: string | null;
}): Promise<void> {
  if (!mentionsKeybot(commentBody)) return;
  if (!readOptionalSupabasePublicEnv()) return;

  try {
    const supabase = createSupabaseAdminClient();

    // Load the build context for this post, including any attached photo so Meg
    // can answer from what the image shows (not just the catalog).
    const { data: post } = await supabase
      .from("build_posts")
      .select("component_ids, image_url")
      .eq("id", postId)
      .maybeSingle();
    if (!post) return;

    // Load recent thread for multi-turn context (oldest → newest).
    const { data: history } = await supabase
      .from("post_comments")
      .select("body, is_keybot, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(MAX_HISTORY + 1);

    const conversationHistory = (history ?? [])
      .reverse()
      .map((row) => ({
        role: row.is_keybot ? ("assistant" as const) : ("user" as const),
        content: row.body.slice(0, MAX_CONTENT),
      }))
      .filter((turn) => turn.content.trim().length > 0)
      .slice(-MAX_HISTORY);

    const selectedComponentIds = (post.component_ids ??
      {}) as ComponentIdSelection;
    const hasBuild = Object.keys(selectedComponentIds).length > 0;

    // Strip the mention; fall back to a neutral prompt if nothing remains. A
    // buildless post has no build to ground against, so the fallback is a
    // general keyboard-advice prompt — Meg must not invent a build.
    const message = stripKeybotMention(
      commentBody,
      hasBuild
        ? "What do you think of this build?"
        : "Can you share some general keyboard advice?",
    );

    // When the post has a photo, fetch it from its public Storage URL and pass
    // it to the vision model as image input. A failed/absent fetch just falls
    // back to the text-only grounded path — the reply must not depend on it.
    const postImageDataUrl = post.image_url
      ? await fetchImageAsDataUrl(post.image_url)
      : undefined;

    const response = await invokeKeybotAgent(
      {
        message,
        context: {
          selectedComponentIds,
          conversationHistory,
        },
      },
      postImageDataUrl ? { postImageDataUrl } : {},
    );

    await supabase.from("post_comments").insert({
      post_id: postId,
      author_id: null,
      body: response.answer,
      is_keybot: true,
      parent_id: parentId,
    });
  } catch {
    // Swallow — a failed keybot reply must not fail the user's comment.
  }
}

/**
 * Fetches an image from its public URL and returns it as a base64 data URL
 * suitable for the vision model's `input_image` block. Returns null on any
 * failure (network error, non-OK response, empty body) so the caller can fall
 * back to the text-only grounded path rather than dropping the reply.
 */
export async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "image/webp";
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength === 0) return null;

    return `data:${contentType};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}
