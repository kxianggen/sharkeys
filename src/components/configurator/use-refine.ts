"use client";

import { useMemo, useState } from "react";

import type { RefineControls } from "@/components/configurator/refine-chips";
import type {
  ApiErrorResponse,
  RecommendationBuild,
  RecommendationResult,
} from "@/components/configurator/types";
import { track } from "@/lib/analytics";
import {
  applyRefineChip,
  describeBuildChange,
  getKeycapColours,
  type RefineChip,
} from "@/lib/recommendations/refine";
import type { RecommendationsApiResponse } from "@/lib/recommendations/schemas";
import type { KeyboardComponent } from "@/lib/types";

/**
 * Refine chips (v2 WS4). A chip edits the structured intent of the current
 * result and re-runs recommendations through /api/recommendations/refine:
 * same matcher, same rule engine, no AI call. If the edit matches no
 * validated build, the current result stays and the note says so.
 */
export function useRefine({
  catalog,
  isSubmitting,
  onError,
  result,
  showResult,
}: {
  catalog: KeyboardComponent[];
  isSubmitting: boolean;
  onError: (message: string | null) => void;
  result: RecommendationResult | null;
  showResult: (result: RecommendationResult) => void;
}) {
  const [note, setNote] = useState<string | null>(null);
  const [pendingChip, setPendingChip] = useState<RefineChip | null>(null);
  // Bumped on every refine that swaps the result, so the carousel returns to
  // card 1: the new top build, which is what the note describes.
  const [refineVersion, setRefineVersion] = useState(0);
  const keycapColours = useMemo(() => getKeycapColours(catalog), [catalog]);

  function editedIntent(chip: RefineChip, build: RecommendationBuild) {
    return result
      ? applyRefineChip(result.intent, chip, build, keycapColours)
      : null;
  }

  async function onRefine(chip: RefineChip, build: RecommendationBuild) {
    const intent = editedIntent(chip, build);

    if (!result || !intent || pendingChip) {
      return;
    }

    track("refine_clicked", { chip });
    setPendingChip(chip);
    onError(null);

    try {
      const response = await fetch("/api/recommendations/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, source: result.source, chip }),
      });
      const body = (await response.json()) as
        | RecommendationsApiResponse
        | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(
          body.success ? "Could not refine the build." : body.error.message,
        );
      }

      const top = body.data.recommendations[0] ?? null;

      setNote(describeBuildChange(build, top));

      if (top) {
        showResult(body.data);
        setRefineVersion((current) => current + 1);
      }
    } catch (caughtError) {
      onError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not refine the build.",
      );
    } finally {
      setPendingChip(null);
    }
  }

  const controls: RefineControls = {
    isAvailable: (chip, build) => editedIntent(chip, build) !== null,
    isBusy: isSubmitting || pendingChip !== null,
    note,
    onRefine: (chip, build) => void onRefine(chip, build),
    pendingChip,
  };

  return {
    clearRefineNote: () => setNote(null),
    controls,
    refineVersion,
  };
}
