"use client";

import { useActionState } from "react";

import {
  createBuildPostAction,
  type GalleryActionState,
} from "@/app/community-gallery/actions";

type Option = { id: string; name: string; brand: string };

type NewPostFormProps = {
  categories: readonly string[];
  optionsByCategory: Record<string, Option[]>;
};

export function NewPostForm({
  categories,
  optionsByCategory,
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

      <fieldset className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <label
            className="flex flex-col gap-1 text-sm font-bold capitalize text-primary"
            key={category}
          >
            {category}
            <select
              className="h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              defaultValue=""
              name={category}
              required
            >
              <option disabled value="">
                Select a {category}…
              </option>
              {(optionsByCategory[category] ?? []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.brand} — {option.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </fieldset>

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
