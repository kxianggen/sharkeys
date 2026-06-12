"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import {
  getCatalogComponents,
  validateBuildSelectionFromIds,
} from "@/lib/components";
import { maybeReplyWithKeybot } from "@/lib/gallery/keybot-reply";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  requiredComponentCategories,
  type ComponentIdSelection,
} from "@/lib/types";

export type GalleryActionState = { error?: string } | null;

const newPostSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120),
  description: z.string().trim().max(2000).optional(),
});

export async function createBuildPostAction(
  _prev: GalleryActionState,
  formData: FormData,
): Promise<GalleryActionState> {
  const user = await requireUser("/community-gallery/new");

  const parsed = newPostSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid post." };
  }

  // Collect a component id per category from the form.
  const componentIds: ComponentIdSelection = {};
  for (const category of requiredComponentCategories) {
    const value = formData.get(category);
    if (typeof value === "string" && value.trim()) {
      componentIds[category] = value.trim();
    }
  }

  const missing = requiredComponentCategories.filter(
    (category) => !componentIds[category],
  );
  if (missing.length > 0) {
    return { error: `Select a component for: ${missing.join(", ")}.` };
  }

  // Invariant: validation is computed server-side from the catalog, never
  // trusted from the client. The snapshot is frozen onto the post.
  const catalog = await getCatalogComponents();
  const validation = validateBuildSelectionFromIds({ componentIds }, catalog);
  // Store a lean, JSON-serializable snapshot (drop the heavy component objects).
  const validationSnapshot = {
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    issues: validation.issues,
    explanations: validation.explanations,
  };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("build_posts")
    .insert({
      author_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      component_ids: componentIds,
      validation_snapshot: validationSnapshot,
      is_published: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not publish the build." };
  }

  revalidatePath("/community-gallery");
  redirect(`/community-gallery/${data.id}`);
}

const commentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().trim().min(1, "Comment cannot be empty.").max(1200),
});

export async function addCommentAction(
  _prev: GalleryActionState,
  formData: FormData,
): Promise<GalleryActionState> {
  const user = await requireUser();

  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment." };
  }

  const { postId, body } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("post_comments").insert({
    post_id: postId,
    author_id: user.id,
    body,
    is_keybot: false,
  });
  if (error) {
    return { error: error.message };
  }

  // If the comment tags @keybot, generate a grounded reply server-side.
  await maybeReplyWithKeybot({ postId, commentBody: body });

  revalidatePath(`/community-gallery/${postId}`);
  return null;
}
