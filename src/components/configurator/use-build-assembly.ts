"use client";

import { useEffect, useMemo, useState } from "react";

import { isKitLockedComponent } from "@/components/configurator/build-helpers";
import { componentCategories } from "@/components/configurator/constants";
import type {
  ApiErrorResponse,
  CompleteComponentIdSelection,
  ComponentCategory,
  ManualSelection,
  RecommendationBuild,
  RecommendationResult,
  ValidateBuildApiResponse,
} from "@/components/configurator/types";
import type { CompatibilityResult, KeyboardComponent } from "@/lib/types";

// Progressive assembly: switches/keycaps start deselected and are chosen by
// the user; kit-locked parts are auto-included with the case. Every complete
// assembly is re-checked by the rule engine via /api/builds/validate.
export function useBuildAssembly({
  catalogById,
  result,
  selectedRecommendation,
}: {
  catalogById: Map<string, KeyboardComponent>;
  result: RecommendationResult | null;
  selectedRecommendation: RecommendationBuild | null;
}) {
  const [chosenParts, setChosenParts] = useState<ManualSelection>({});
  const [assemblyValidation, setAssemblyValidation] =
    useState<CompatibilityResult | null>(null);
  const [isAssemblyValidating, setIsAssemblyValidating] = useState(false);

  // Free-choice categories are derived from the real catalog: anything not
  // kit-locked (and not the case anchor) is a genuine user pick-step.
  const choiceCategories = useMemo(() => {
    if (!selectedRecommendation) {
      return [] as ComponentCategory[];
    }

    return componentCategories.filter(
      (category) =>
        category !== "case" &&
        !isKitLockedComponent(selectedRecommendation.components[category]),
    );
  }, [selectedRecommendation]);

  // Full component-id set once every free choice is made; null while the
  // assembly is still incomplete.
  // The build so far, including partially-filled selections. `assembledComponentIds`
  // deliberately returns null until every category is chosen, but the option
  // pickers need to know what's already selected in order to grey out parts
  // that conflict with it.
  const partialComponentIds = useMemo(() => {
    if (!selectedRecommendation) {
      return {} as Partial<Record<ComponentCategory, string>>;
    }

    const ids: Partial<Record<ComponentCategory, string>> = {};

    for (const category of componentCategories) {
      const id = choiceCategories.includes(category)
        ? chosenParts[category]
        : selectedRecommendation.componentIds[category];

      if (id) {
        ids[category] = id;
      }
    }

    return ids;
  }, [selectedRecommendation, choiceCategories, chosenParts]);

  const assembledComponentIds = useMemo(() => {
    if (!selectedRecommendation) {
      return null;
    }

    const ids: Partial<Record<ComponentCategory, string>> = {};

    for (const category of componentCategories) {
      const id = choiceCategories.includes(category)
        ? chosenParts[category]
        : selectedRecommendation.componentIds[category];

      if (!id) {
        return null;
      }

      ids[category] = id;
    }

    return ids as CompleteComponentIdSelection;
  }, [selectedRecommendation, choiceCategories, chosenParts]);

  // Parts resolved so far (kit-locked always; choices once selected) — drives
  // the running price estimate.
  const assembledParts = useMemo(() => {
    if (!selectedRecommendation) {
      return null;
    }

    const parts: Partial<Record<ComponentCategory, KeyboardComponent>> = {};

    for (const category of componentCategories) {
      if (choiceCategories.includes(category)) {
        const id = chosenParts[category];
        const component = id ? catalogById.get(id) : undefined;

        if (component?.category === category) {
          parts[category] = component;
        }
      } else {
        parts[category] = selectedRecommendation.components[category];
      }
    }

    return parts;
  }, [selectedRecommendation, choiceCategories, chosenParts, catalogById]);

  // The assembled build must pass the same deterministic engine as every other
  // path before it can be saved — the AI never gets the last word.
  useEffect(() => {
    if (!assembledComponentIds) {
      return;
    }

    const controller = new AbortController();

    async function validateAssembly() {
      setIsAssemblyValidating(true);

      try {
        const response = await fetch("/api/builds/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            componentIds: assembledComponentIds,
            preferences: {
              layout: result?.intent.layout ?? undefined,
              soundProfile: result?.intent.soundProfile ?? undefined,
              beginnerFriendly: result?.intent.beginnerFriendly ?? undefined,
              maxPrice: result?.criteria.maxPrice ?? undefined,
            },
          }),
          signal: controller.signal,
        });
        const body = (await response.json()) as
          | ValidateBuildApiResponse
          | ApiErrorResponse;

        if (!response.ok || !body.success) {
          throw new Error(
            body.success ? "Build validation failed." : body.error.message,
          );
        }

        setAssemblyValidation(body.data.result);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setAssemblyValidation(null);
      } finally {
        setIsAssemblyValidating(false);
      }
    }

    void validateAssembly();

    return () => controller.abort();
    // Intent preferences only refine warnings; the id set is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assembledComponentIds]);

  return {
    assembledComponentIds,
    assembledParts,
    assemblyValidation,
    choiceCategories,
    chosenParts,
    isAssemblyValidating,
    partialComponentIds,
    setAssemblyValidation,
    setChosenParts,
  };
}
