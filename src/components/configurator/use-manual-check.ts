"use client";

import { useState } from "react";

import {
  buildSavedBuildTitle,
  resolveCompleteComponents,
  toCompleteComponentIds,
} from "@/components/configurator/build-helpers";
import { componentCategories } from "@/components/configurator/constants";
import type {
  ApiErrorResponse,
  ManualSelection,
  RecommendationBuild,
  RecommendationResult,
  ValidateBuildApiResponse,
} from "@/components/configurator/types";
import type { useSaveBuild } from "@/components/configurator/use-save-build";
import type { CompatibilityResult, KeyboardComponent } from "@/lib/types";

// "Hand-pick manually": a full six-part selection checked by the rule engine.
export function useManualCheck({
  catalogById,
  result,
  saveBuildToAccount,
}: {
  catalogById: Map<string, KeyboardComponent>;
  result: RecommendationResult | null;
  saveBuildToAccount: ReturnType<typeof useSaveBuild>["saveBuildToAccount"];
}) {
  const [manualSelection, setManualSelection] = useState<ManualSelection>({});
  const [manualValidation, setManualValidation] =
    useState<CompatibilityResult | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const [isManualValidating, setIsManualValidating] = useState(false);

  const manualSelectionComplete = componentCategories.every(
    (category) => manualSelection[category],
  );

  async function validateManualSelection() {
    if (isManualValidating) {
      return;
    }

    setManualError(null);
    setManualValidation(null);

    if (!manualSelectionComplete) {
      setManualError("Select one component from every category before validating.");
      return;
    }

    setIsManualValidating(true);

    try {
      const componentIds = Object.fromEntries(
        componentCategories.map((category) => [
          category,
          manualSelection[category] ?? "",
        ]),
      );
      const response = await fetch("/api/builds/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          componentIds,
          preferences: {
            layout: result?.intent.layout ?? undefined,
            soundProfile: result?.intent.soundProfile ?? undefined,
            beginnerFriendly: result?.intent.beginnerFriendly ?? undefined,
            maxPrice: result?.criteria.maxPrice ?? undefined,
          },
        }),
      });
      const body = (await response.json()) as
        | ValidateBuildApiResponse
        | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(
          body.success ? "Build validation failed." : body.error.message,
        );
      }

      setManualValidation(body.data.result);
    } catch (caughtError) {
      setManualError(
        caughtError instanceof Error
          ? caughtError.message
          : "Build validation failed.",
      );
    } finally {
      setIsManualValidating(false);
    }
  }

  function loadRecommendationIntoManualPanel(recommendation: RecommendationBuild) {
    setManualSelection(recommendation.componentIds);
    setManualValidation(null);
    setManualError(null);
  }

  function saveValidatedManualBuild() {
    const componentIds = toCompleteComponentIds(manualSelection);

    if (!componentIds || !manualValidation?.isValid) {
      setManualError(
        "Validate a complete compatible build before saving it.",
      );
      return;
    }

    const components = resolveCompleteComponents(componentIds, catalogById);

    if (!components) {
      setManualError("Saved build components could not be resolved from the catalog.");
      return;
    }

    void saveBuildToAccount({
      title: `Manual build: ${buildSavedBuildTitle(components)}`,
      source: "manual",
      componentIds,
    });
  }

  return {
    isManualValidating,
    loadRecommendationIntoManualPanel,
    manualError,
    manualSelection,
    manualSelectionComplete,
    manualValidation,
    saveValidatedManualBuild,
    setManualError,
    setManualSelection,
    setManualValidation,
    validateManualSelection,
  };
}
