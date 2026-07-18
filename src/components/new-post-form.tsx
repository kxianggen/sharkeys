"use client";

import { useActionState } from "react";

import { BuildImageUpload } from "@/components/build-image-upload";
import { BuildPicker, type PartOption } from "@/components/build-picker";
import {
  createBuildPostAction,
  type GalleryActionState,
} from "@/app/community-gallery/actions";
import type { KitOption } from "@/lib/components/kits";

type NewPostFormProps = {
  kitOptions: KitOption[];
  switchOptions: PartOption[];
  keycapOptions: PartOption[];
  // Pre-fill from a saved build (?from=<savedBuildId>): the title, kit, and
  // free choices land as defaults; the user still reviews before publishing
  // through the one shared publish path.
  initialTitle?: string;
  initialKitId?: string;
  initialSwitchId?: string;
  initialKeycapId?: string;
  initialStabilizerId?: string;
};

export function NewPostForm({
  kitOptions,
  switchOptions,
  keycapOptions,
  initialTitle,
  initialKitId,
  initialSwitchId,
  initialKeycapId,
  initialStabilizerId,
}: NewPostFormProps) {
  const [state, formAction, pending] = useActionState<
    GalleryActionState,
    FormData
  >(createBuildPostAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1 text-sm font-bold text-primary">
        Title
        <input
          className="h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          defaultValue={initialTitle ?? ""}
          maxLength={120}
          name="title"
          required
          type="text"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold text-primary">
        Description
        <textarea
          className="min-h-24 rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          maxLength={2000}
          name="description"
          rows={4}
        />
      </label>

      <BuildPicker
        disabled={pending}
        initialKeycapId={initialKeycapId}
        initialKitId={initialKitId}
        initialStabilizerId={initialStabilizerId}
        initialSwitchId={initialSwitchId}
        keycapOptions={keycapOptions}
        kitOptions={kitOptions}
        switchOptions={switchOptions}
      />

      <BuildImageUpload name="image_data" disabled={pending} />

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Publishing…" : "Publish build"}
      </button>
    </form>
  );
}
