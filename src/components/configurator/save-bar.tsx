"use client";

import { Heart } from "lucide-react";

import { categoryLabels } from "@/components/configurator/constants";
import type {
  ComponentCategory,
  ManualSelection,
  RecommendationBuild,
} from "@/components/configurator/types";

// Sticky bar under the rail: build name, running price, what is left to
// choose, and the save buttons (enabled only after the engine passes it).
export function SaveBar({
  activeBuild,
  buildDisplayName,
  buildPrice,
  canSaveAssembly,
  choiceCategories,
  chosenParts,
  isBuildComplete,
  saveAssembledBuild,
}: {
  activeBuild: RecommendationBuild | null;
  buildDisplayName: string | null;
  buildPrice: string | null;
  canSaveAssembly: boolean;
  choiceCategories: ComponentCategory[];
  chosenParts: ManualSelection;
  isBuildComplete: boolean;
  saveAssembledBuild: () => void;
}) {
  return (
    <>
            {activeBuild ? (
              <div className="sticky bottom-0 mt-8 border-t-[0.5px] border-border bg-surface/95 py-4 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary">
                      {buildDisplayName}
                    </p>
                    {buildPrice ? (
                      <p className="text-sm text-secondary">From {buildPrice}</p>
                    ) : null}
                    {!isBuildComplete ? (
                      <p className="text-xs text-secondary">
                        Choose{" "}
                        {choiceCategories
                          .filter((category) => !chosenParts[category])
                          .map((category) =>
                            categoryLabels[category].toLowerCase(),
                          )
                          .join(", ")}{" "}
                        to finish
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-none items-center gap-2">
                    <button
                      aria-label="Save to favourites"
                      className="flex h-10 w-10 items-center justify-center rounded-full border-[0.5px] border-border text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={!canSaveAssembly}
                      onClick={saveAssembledBuild}
                      type="button"
                    >
                      <Heart className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      className="inline-flex h-10 items-center justify-center rounded-pill bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={!canSaveAssembly}
                      onClick={saveAssembledBuild}
                      type="button"
                    >
                      Save build
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
    </>
  );
}
