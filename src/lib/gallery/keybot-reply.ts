import { invokeKeybotAgent } from "@/lib/agent";
import { readOptionalSupabasePublicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ComponentIdSelection } from "@/lib/types";

const KEYBOT_MENTION = /@keybot\b/i;
const MAX_HISTORY = 6;
const MAX_CONTENT = 1200;

export function mentionsKeybot(body: string): boolean {
  return KEYBOT_MENTION.test(body);
}

// Removes the @keybot mention to form the agent prompt; falls back to a neutral
// question when nothing meaningful remains.
export function stripKeybotMention(body: string): string {
  return body.replace(KEYBOT_MENTION, "").trim() || "What do you think of this build?";
}

/**
 * If a freshly-posted comment tags @keybot, generate a grounded reply through
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
}: {
  postId: string;
  commentBody: string;
}): Promise<void> {
  if (!mentionsKeybot(commentBody)) return;
  if (!readOptionalSupabasePublicEnv()) return;

  try {
    const supabase = createSupabaseAdminClient();

    // Load the build context for this post.
    const { data: post } = await supabase
      .from("build_posts")
      .select("component_ids")
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

    // Strip the mention; fall back to a neutral prompt if nothing remains.
    const message = stripKeybotMention(commentBody);

    const response = await invokeKeybotAgent({
      message,
      context: {
        selectedComponentIds,
        conversationHistory,
      },
    });

    await supabase.from("post_comments").insert({
      post_id: postId,
      author_id: null,
      body: response.answer,
      is_keybot: true,
    });
  } catch {
    // Swallow — a failed keybot reply must not fail the user's comment.
  }
}
