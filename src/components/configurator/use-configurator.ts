"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildSavedBuildTitle,
  getKitDisplayName,
  getMetadataString,
  isKitLockedComponent,
  resolveCompleteComponents,
} from "@/components/configurator/build-helpers";
import { componentCategories } from "@/components/configurator/constants";
import type {
  ApiErrorResponse,
  ComponentCategory,
  ManualSelection,
  RecommendationBuild,
  RecommendationResult,
} from "@/components/configurator/types";
import { useBuildAssembly } from "@/components/configurator/use-build-assembly";
import { useCatalog } from "@/components/configurator/use-catalog";
import { useHasMounted } from "@/components/configurator/use-has-mounted";
import { useManualCheck } from "@/components/configurator/use-manual-check";
import { usePhotoIntent } from "@/components/configurator/use-photo-intent";
import { useSaveBuild } from "@/components/configurator/use-save-build";
import { track } from "@/lib/analytics";
import type { RecommendationsApiResponse } from "@/lib/recommendations/schemas";

// All configurator state and actions. The view components only render what
// this returns; nothing here changes what the rule engine decides.
export function useConfigurator({
  initialKitId,
  initialPrompt,
  isAuthenticated,
}: {
  initialKitId: string | null;
  initialPrompt: string | null;
  isAuthenticated: boolean;
}) {
  const resultsRef = useRef<HTMLElement | null>(null);
  const initialPromptSubmittedRef = useRef(false);
  const initialKitSubmittedRef = useRef(false);
  const [message, setMessage] = useState(initialPrompt ?? "");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasMounted = useHasMounted();

  const selectedRecommendation = useMemo(() => {
    if (!result) {
      return null;
    }

    return (
      result.recommendations.find(
        (recommendation) => recommendation.id === selectedRecommendationId,
      ) ??
      result.recommendations[0] ??
      null
    );
  }, [result, selectedRecommendationId]);

  const catalogState = useCatalog();
  const { catalog, catalogById } = catalogState;
  const save = useSaveBuild(isAuthenticated);
  const { setSavedBuildMessage } = save;
  const manual = useManualCheck({
    catalogById,
    result,
    saveBuildToAccount: save.saveBuildToAccount,
  });
  const photo = usePhotoIntent({ message, setMessage });
  const assembly = useBuildAssembly({
    catalogById,
    result,
    selectedRecommendation,
  });
  const { setAssemblyValidation, setChosenParts } = assembly;

  const shouldDisableSubmit =
    isSubmitting || message.trim().length === 0;
  const isSubmitDisabled = hasMounted && shouldDisableSubmit;

  useEffect(() => {
    const trimmedInitialPrompt = initialPrompt?.trim();

    if (!trimmedInitialPrompt || initialPromptSubmittedRef.current) {
      return;
    }

    initialPromptSubmittedRef.current = true;
    setMessage(trimmedInitialPrompt);
    void runRecommendationRequest(trimmedInitialPrompt);
    // The prompt query is a one-time route handoff into the configurator workspace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  // Browse hands a kit off via ?kit=<kitId>: once the real catalog confirms the
  // kit exists, run one anchored recommendation request. The result flows
  // through the normal progressive assembly, so switches/keycaps start
  // deselected and the engine still validates the final build. An explicit
  // prompt handoff takes precedence over the kit anchor.
  useEffect(() => {
    const trimmedInitialKitId = initialKitId?.trim();

    if (
      !trimmedInitialKitId ||
      initialPrompt?.trim() ||
      initialKitSubmittedRef.current ||
      catalog.length === 0
    ) {
      return;
    }

    const kitCase = catalog.find(
      (component) =>
        component.category === "case" &&
        isKitLockedComponent(component) &&
        getMetadataString(component.metadata, "kitId") === trimmedInitialKitId,
    );

    if (!kitCase) {
      return;
    }

    const kitPrompt = `Start from the ${getKitDisplayName(kitCase)} barebones kit`;
    const timeoutId = window.setTimeout(() => {
      initialKitSubmittedRef.current = true;
      setMessage(kitPrompt);
      void runRecommendationRequest(kitPrompt, trimmedInitialKitId);
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // One-time route handoff; catalog arrival is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKitId, initialPrompt, catalog]);

  async function runRecommendationRequest(
    nextMessage = message,
    anchorKitId?: string,
  ) {
    setError(null);
    manual.setManualError(null);
    setIsSubmitting(true);
    track("request_sent", { entry: anchorKitId ? "kit" : "search" });

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          anchorKitId
            ? { message: nextMessage, kitId: anchorKitId }
            : { message: nextMessage },
        ),
      });
      const body = (await response.json()) as
        | RecommendationsApiResponse
        | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(
          body.success ? "Recommendation request failed." : body.error.message,
        );
      }

      setResult(body.data);
      const firstRecommendation = body.data.recommendations[0];
      if (firstRecommendation) {
        track("build_shown", {
          buildCount: body.data.recommendations.length,
          validCount: body.data.recommendations.filter(
            (recommendation) => recommendation.validation.isValid,
          ).length,
          layout: body.data.intent?.layout ?? undefined,
        });
      }
      setSelectedRecommendationId(firstRecommendation?.id ?? null);
      manual.setManualValidation(null);
      setSavedBuildMessage(null);
      setChosenParts({});
      setAssemblyValidation(null);

      if (firstRecommendation) {
        manual.setManualSelection(firstRecommendation.componentIds);
      } else {
        manual.setManualSelection({});
        manual.setManualValidation(null);
        manual.setManualError(null);
      }

      window.setTimeout(() => {
        if (typeof resultsRef.current?.scrollIntoView === "function") {
          resultsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 0);
    } catch (caughtError) {
      setResult(null);
      setSelectedRecommendationId(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Recommendation request failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (shouldDisableSubmit) {
      return;
    }

    await runRecommendationRequest();
  }

  async function handleQuickPrompt(prompt: string) {
    if (isSubmitting) {
      return;
    }

    setMessage(prompt);
    await runRecommendationRequest(prompt);
  }

  const selectRecommendation = (recommendation: RecommendationBuild) => {
    setSelectedRecommendationId(recommendation.id);
    manual.loadRecommendationIntoManualPanel(recommendation);
    // A new kit anchor restarts the progressive assembly: free choices
    // return to their deselected state.
    setChosenParts({});
    setAssemblyValidation(null);
    setSavedBuildMessage(null);
  };

  const choosePart = (category: ComponentCategory, componentId: string) => {
    setChosenParts((current) => ({ ...current, [category]: componentId }));
    // Stale result must not enable saving while the new combination is
    // re-validated by the engine.
    setAssemblyValidation(null);
    setSavedBuildMessage(null);
  };

  // "Start from a build": adopting a recommendation fills every free-choice
  // section with that build's parts (kit-locked parts follow the case
  // automatically). The completed assembly then re-validates through the
  // same engine effect as a manual assembly — no bypass. Sections stay
  // editable afterwards.
  const adoptRecommendation = (recommendation: RecommendationBuild) => {
    setSelectedRecommendationId(recommendation.id);
    manual.loadRecommendationIntoManualPanel(recommendation);

    const nextChosenParts: ManualSelection = {};

    for (const category of componentCategories) {
      if (
        category !== "case" &&
        !isKitLockedComponent(recommendation.components[category])
      ) {
        nextChosenParts[category] = recommendation.componentIds[category];
      }
    }

    setChosenParts(nextChosenParts);
    setAssemblyValidation(null);
    setSavedBuildMessage(null);
  };

  // Saving requires the full assembly to have passed the deterministic
  // engine (assemblyValidation) — completeness alone is not enough.
  const saveAssembledBuild = () => {
    const { assembledComponentIds, assemblyValidation } = assembly;

    if (!assembledComponentIds || !assemblyValidation?.isValid) {
      setSavedBuildMessage(
        "Choose switches and keycaps to complete the build before saving.",
      );
      return;
    }

    const components = resolveCompleteComponents(
      assembledComponentIds,
      catalogById,
    );

    if (!components) {
      setSavedBuildMessage(
        "Build parts could not be resolved from the catalog.",
      );
      return;
    }

    void save.saveBuildToAccount({
      title: buildSavedBuildTitle(components),
      source: "recommendation",
      componentIds: assembledComponentIds,
    });
  };

  const updateManualSelection = (
    category: ComponentCategory,
    componentId: string,
  ) => {
    manual.setManualSelection((current) => ({
      ...current,
      [category]: componentId || undefined,
    }));
    manual.setManualValidation(null);
    setSavedBuildMessage(null);
  };

  return {
    ...catalogState,
    ...assembly,
    ...manual,
    ...photo,
    ...save,
    adoptRecommendation,
    choosePart,
    error,
    handleQuickPrompt,
    handleSubmit,
    hasMounted,
    isSubmitDisabled,
    isSubmitting,
    message,
    result,
    resultsRef,
    saveAssembledBuild,
    selectRecommendation,
    selectedRecommendation,
    setMessage,
    updateManualSelection,
  };
}

// What the section components receive: everything except the scroll ref,
// which only the results section attaches (keeping a ref inside a plain
// state object makes every read of it look like a ref read during render).
export type ConfiguratorState = Omit<
  ReturnType<typeof useConfigurator>,
  "resultsRef"
>;
