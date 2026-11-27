"use client";

import { ShieldAlert } from "lucide-react";

import { BuildSummary, KitVisual } from "@/components/configurator/build-visual";
import type {
  ComponentCategory,
  ManualSelection,
  RecommendationBuild,
} from "@/components/configurator/types";
import type { KeyboardComponent } from "@/lib/types";

// Preview: the left column with the build name, running price, any blocker
// badge, the kit image and the "Your build" summary.
export function BuildVisualPanel({
  activeBuild,
  activeKitId,
  buildDisplayName,
  buildErrorCount,
  buildPrice,
  buildValid,
  catalogById,
  choiceCategories,
  chosenParts,
}: {
  activeBuild: RecommendationBuild | null;
  activeKitId: string | null;
  buildDisplayName: string | null;
  buildErrorCount: number;
  buildPrice: string | null;
  buildValid: boolean | null;
  catalogById: Map<string, KeyboardComponent>;
  choiceCategories: ComponentCategory[];
  chosenParts: ManualSelection;
}) {
  return (
          <section
            aria-label="Build visual"
            className="min-w-0 lg:sticky lg:top-16 lg:self-start"
          >
            {activeBuild ? (
              <div className="mb-6 min-w-0">
                <h1 className="text-h1 text-primary">{buildDisplayName}</h1>
                {buildPrice ? (
                  <p className="mt-2 text-base text-secondary">
                    From {buildPrice}
                  </p>
                ) : null}
                {buildValid === false ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-error/10 px-3 py-1.5 text-xs font-semibold text-error">
                    <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                    {buildErrorCount > 0
                      ? `${buildErrorCount} blocker${buildErrorCount > 1 ? "s" : ""}`
                      : "Blocked"}
                  </span>
                ) : null}
              </div>
            ) : null}

            <KitVisual
              key={activeKitId ?? "empty"}
              kitId={activeKitId}
              kitName={buildDisplayName ?? "Keyboard build"}
            />

            {activeBuild ? (
              <BuildSummary
                catalogById={catalogById}
                choiceCategories={choiceCategories}
                chosenParts={chosenParts}
              />
            ) : (
              <p className="mt-5 text-sm leading-6 text-secondary">
                Ask Meg to resolve a validated build — it appears here with the
                kit it is based on.
              </p>
            )}
          </section>
  );
}
