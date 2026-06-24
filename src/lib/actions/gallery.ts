"use server";

import {
  getCatalogComponents,
  validateBuildSelectionFromIds,
} from "@/lib/components";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ComponentIdSelection } from "@/lib/types";
import type { Database, Json } from "@/lib/types/database";

type BuildPostRow = Database["public"]["Tables"]["build_posts"]["Row"];

export type SaveBuildPostResult =
  | { success: true; post: BuildPostRow }
  | { success: false; error: string };

/**
 * Persist an AI-generated build to `public.build_posts`.
 *
 * The client is never trusted: the selected component IDs are re-validated
 * server-side against the live catalog through the deterministic rule engine
 * before anything is written. The validation result is stored alongside the
 * build as an auditable snapshot.
 */
export async function saveBuildPost(
  title: string,
  description: string | null,
  componentIds: ComponentIdSelection,
  isPublished: boolean,
): Promise<SaveBuildPostResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: you must be signed in to save a build.");
  }

  // CRITICAL: re-validate server-side. Never trust client-supplied IDs.
  const catalog = await getCatalogComponents();
  const validation = validateBuildSelectionFromIds({ componentIds }, catalog);

  if (!validation.isValid) {
    const reason =
      validation.errors.map((issue) => issue.message).join(" ") ||
      "The selected build failed server-side compatibility validation.";
    throw new Error(`Invalid build: ${reason}`);
  }

  try {
    const { data, error } = await supabase
      .from("build_posts")
      .insert({
        author_id: user.id,
        title,
        description,
        component_ids: componentIds as unknown as Json,
        validation_snapshot: validation as unknown as Json,
        is_published: isPublished,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, post: data };
  } catch (cause) {
    return {
      success: false,
      error:
        cause instanceof Error
          ? cause.message
          : "Unexpected error while saving the build.",
    };
  }
}

/**
 * Fetch the public community gallery: published builds, newest first.
 * Returns an empty array on any read failure so callers can render safely.
 */
export async function getCommunityGallery(): Promise<BuildPostRow[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("build_posts")
      .select()
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch the signed-in user's private garage, including unpublished drafts,
 * newest first. Returns an empty array when unauthenticated or on failure.
 */
export async function getUserBuilds(): Promise<BuildPostRow[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("build_posts")
      .select()
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return data ?? [];
  } catch {
    return [];
  }
}
