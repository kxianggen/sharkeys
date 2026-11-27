"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, Keyboard } from "lucide-react";

import { categoryLabels } from "@/components/configurator/constants";
import { getPartDescriptor } from "@/components/configurator/build-helpers";
import type {
  ComponentCategory,
  ManualSelection,
} from "@/components/configurator/types";
import { PartThumbnail } from "@/components/part-thumbnail";
import type { KeyboardComponent } from "@/lib/types";

// Large product visual for the configurator: the resolved build's kit image
// on surface-secondary, falling back to a calm keyboard mark when the kit has
// no image (or none is resolved yet). Parent passes key={kitId} so the error
// state resets when the kit changes.
export function KitVisual({
  kitId,
  kitName,
}: {
  kitId: string | null;
  kitName: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!kitId || imageFailed) {
    return (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-surface-secondary"
        data-testid="kit-visual"
      >
        <Keyboard className="h-24 w-24 text-secondary/50" aria-hidden />
      </div>
    );
  }

  return (
    // Kit art ships on a 4:3 canvas with wide transparent margins, so the
    // contained image is zoomed to bring the board to ~80% of the tile; only
    // transparent canvas is clipped, never the product.
    <div
      className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-surface-secondary"
      data-testid="kit-visual"
    >
      <Image
        alt={`${kitName} kit`}
        className="h-full w-full scale-[1.55] object-contain"
        height={480}
        onError={() => setImageFailed(true)}
        priority
        src={`/kits/${kitId}.webp`}
        width={640}
      />
    </div>
  );
}

// "Your build": a quiet, display-only list of the user's free choices below
// the stable kit hero. It renders one row per free-choice category present on
// the build (derived from choiceCategories — kit-locked case/internals are
// implied by the hero and get no row). It reflects existing selection state
// only; it never mutates selection, validation, or the resolved build.
export function BuildSummary({
  catalogById,
  choiceCategories,
  chosenParts,
}: {
  catalogById: Map<string, KeyboardComponent>;
  choiceCategories: ComponentCategory[];
  chosenParts: ManualSelection;
}) {
  if (choiceCategories.length === 0) {
    return null;
  }

  return (
    <div className="mt-6" data-testid="build-summary">
      <h2 className="text-sm font-semibold text-primary">Your build</h2>
      <ul className="mt-3 flex flex-col gap-1.5">
        {choiceCategories.map((category) => {
          const chosenId = chosenParts[category];
          const chosen = chosenId ? catalogById.get(chosenId) : undefined;
          const component =
            chosen?.category === category ? chosen : undefined;

          if (!component) {
            return (
              <li
                className="flex items-center gap-3 rounded-xl px-1 py-1.5"
                data-testid={`build-summary-row-${category}`}
                key={category}
              >
                <span
                  aria-hidden
                  className="h-11 w-11 flex-none rounded-lg border border-dashed border-border-strong"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">
                    {categoryLabels[category]}
                  </p>
                  <p className="text-xs text-muted">Not selected yet</p>
                </div>
              </li>
            );
          }

          const descriptor = getPartDescriptor(component);

          return (
            <li
              className="flex items-center gap-3 rounded-xl px-1 py-1.5"
              data-testid={`build-summary-row-${category}`}
              key={category}
            >
              <PartThumbnail component={component} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">
                  {component.name}
                </p>
                <p className="text-xs capitalize text-secondary">
                  {descriptor
                    ? `${categoryLabels[category]} · ${descriptor}`
                    : categoryLabels[category]}
                </p>
              </div>
              <CheckCircle2
                aria-hidden
                className="h-4 w-4 flex-none text-success"
              />
              <span className="sr-only">selected</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
