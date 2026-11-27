"use client";

import { Loader2, Sparkles } from "lucide-react";

import type { RecommendationBuild } from "@/components/configurator/types";
import {
  refineChipLabels,
  refineChips,
  type RefineChip,
} from "@/lib/recommendations/refine";

export type RefineControls = {
  // Whether a chip would change anything for this build (else disabled).
  isAvailable: (chip: RefineChip, build: RecommendationBuild) => boolean;
  isBusy: boolean;
  // "What changed" line from the last chip click, if any.
  note: string | null;
  onRefine: (chip: RefineChip, build: RecommendationBuild) => void;
  pendingChip: RefineChip | null;
};

// Refine chips under a result card. Each chip edits the structured request
// and re-runs recommendations through the rule engine: no AI call.
export function RefineChips({
  build,
  controls,
}: {
  build: RecommendationBuild;
  controls: RefineControls;
}) {
  return (
    <div className="mt-3 px-1">
      <div
        aria-label="Refine this build"
        className="flex flex-wrap gap-1.5"
        role="group"
      >
        {refineChips.map((chip) => {
          const available = controls.isAvailable(chip, build);
          const pending = controls.pendingChip === chip;

          return (
            <button
              className="inline-flex min-h-8 items-center gap-1.5 rounded-pill border-[0.5px] border-border bg-surface px-3 py-1 text-xs font-medium text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!available || controls.isBusy}
              key={chip}
              onClick={() => controls.onRefine(chip, build)}
              title={available ? undefined : "This build already covers that."}
              type="button"
            >
              {pending ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              ) : null}
              {refineChipLabels[chip]}
            </button>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className="mt-2 flex min-h-5 items-start gap-1.5 text-xs leading-5 text-secondary"
        data-testid="refine-change"
      >
        {controls.note ? (
          <>
            <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
            <span>{controls.note}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
