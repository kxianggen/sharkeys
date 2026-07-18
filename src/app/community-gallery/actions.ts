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
import type { ValidationSnapshot } from "@/lib/gallery/service";
import { uploadBuildPostImage } from "@/lib/gallery/upload-image";
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

  // Buildless post: title + optional description/photo, no components. An empty
  // component_ids ('{}') is a valid "no build"; validation is skipped entirely,
  // so a buildless post can never fail for "missing parts".
  const hasBuild = requiredComponentCategories.some(
    (category) => componentIds[category],
  );

  let validationSnapshot: ValidationSnapshot | null = null;

  if (hasBuild) {
    // A partial build is not a build: require every category before validating.
    const missing = requiredComponentCategories.filter(
      (category) => !componentIds[category],
    );
    if (missing.length > 0) {
      return { error: `Select a component for: ${missing.join(", ")}.` };
    }

    // Invariant: validation is computed server-side from the catalog, never
    // trusted from the client — this is the backstop that rejects impossible
    // (e.g. cross-kit or incompatible-stabilizer) builds. The snapshot is
    // frozen onto the post.
    const catalog = await getCatalogComponents();
    const validation = validateBuildSelectionFromIds({ componentIds }, catalog);
    if (!validation.isValid) {
      return {
        error:
          validation.errors[0]?.message ??
          "That build isn't compatible. Adjust your parts and try again.",
      };
    }
    // Store a lean, JSON-serializable snapshot (drop the heavy component objects).
    validationSnapshot = {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      issues: validation.issues,
      explanations: validation.explanations,
    };
  }

  const supabase = await createSupabaseServerClient();

  // Optional build photo (client-compressed WebP data URL). Upload before the
  // insert; on failure we publish without the image rather than lose the post,
  // and the post falls back to the kit hero image (image_url stays null).
  const imageData = formData.get("image_data");
  const imageUrl =
    typeof imageData === "string" && imageData.length > 0
      ? await uploadBuildPostImage(supabase, user.id, imageData)
      : null;

  const { data, error } = await supabase
    .from("build_posts")
    .insert({
      author_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      component_ids: componentIds,
      validation_snapshot: validationSnapshot,
      image_url: imageUrl,
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
  parentId: z.string().uuid().optional(),
});

export async function addCommentAction(
  _prev: GalleryActionState,
  formData: FormData,
): Promise<GalleryActionState> {
  const user = await requireUser();

  const parentIdValue = formData.get("parentId");
  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    body: formData.get("body"),
    parentId:
      typeof parentIdValue === "string" && parentIdValue ? parentIdValue : undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment." };
  }

  const { postId, body } = parsed.data;
  const supabase = await createSupabaseServerClient();

  // Threading is a single level deep: replying to a reply flattens onto the
  // reply's own top-level parent at write time. The parent must belong to the
  // same post (never trust the client-supplied id blindly).
  let parentId: string | null = null;
  if (parsed.data.parentId) {
    const { data: parent } = await supabase
      .from("post_comments")
      .select("id, post_id, parent_id")
      .eq("id", parsed.data.parentId)
      .maybeSingle();
    if (!parent || parent.post_id !== postId) {
      return { error: "The comment you replied to no longer exists." };
    }
    parentId = parent.parent_id ?? parent.id;
  }

  const { data: inserted, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      body,
      is_keybot: false,
      parent_id: parentId,
    })
    .select("id")
    .single();
  if (error || !inserted) {
    return { error: error?.message ?? "Could not post the comment." };
  }

  // If the comment tags @meg, generate a grounded reply server-side. The reply
  // nests under the tagging comment: a top-level tag becomes the reply's
  // parent; a nested tag keeps Meg in the same one-level thread.
  await maybeReplyWithKeybot({
    postId,
    commentBody: body,
    parentId: parentId ?? inserted.id,
  });

  revalidatePath(`/community-gallery/${postId}`);
  return null;
}
