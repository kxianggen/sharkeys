"use client";

import { useState } from "react";

import {
  estimateAssemblyPrice,
  formatEstimatedTotal,
  getKitDisplayName,
  getMetadataString,
  sectionDomId,
} from "@/components/configurator/build-helpers";
import { BuildSteps } from "@/components/configurator/build-steps";
import { BuildVisualPanel } from "@/components/configurator/build-visual-panel";
import { CloneNotice } from "@/components/configurator/clone-notice";
import { CompareView } from "@/components/configurator/compare-view";
import { configuratorSections } from "@/components/configurator/constants";
import { useCompare } from "@/components/configurator/use-compare";
import { FloatingKeybot } from "@/components/configurator/keybot/floating-keybot";
import { ManualSelectionPanel } from "@/components/configurator/manual-selection-panel";
import { EmptyRecommendationState } from "@/components/configurator/notices";
import { RecommendationCarousel } from "@/components/configurator/recommendation-carousel";
import { RequestPanel } from "@/components/configurator/request-panel";
import { ResolutionProgress } from "@/components/configurator/resolution-progress";
import { SaveBar } from "@/components/configurator/save-bar";
import { useConfigurator } from "@/components/configurator/use-configurator";
import { MainNav } from "@/components/main-nav";

// The /configurator page: preview on the left, the request input, result
// cards, build steps and save bar on the right, Meg floating on top.
export function ConfiguratorView({
  initialBuildCode,
  initialKitId,
  initialPrompt,
  isAuthenticated,
}: {
  initialBuildCode: string | null;
  initialKitId: string | null;
  initialPrompt: string | null;
  isAuthenticated: boolean;
}) {
  const { resultsRef, ...state } = useConfigurator({
    initialBuildCode,
    initialKitId,
    initialPrompt,
    isAuthenticated,
  });
  const [isManualCheckOpen, setIsManualCheckOpen] = useState(false);
  const [isImagePanelOpen, setIsImagePanelOpen] = useState(false);
  const [keybotOpenSignal, setKeybotOpenSignal] = useState(0);
  const compare = useCompare();
  const {
    assembledComponentIds,
    assembledParts,
    assemblyValidation,
    choiceCategories,
    chosenParts,
    isAssemblyValidating,
    isSavingBuild,
    result,
    selectedRecommendation,
  } = state;

  const activeBuild = selectedRecommendation;
  const buildValid = activeBuild?.validation.isValid ?? null;
  const buildErrorCount = activeBuild?.validation.errors.length ?? 0;
  // Running total: kit-locked parts from the start, choices as they land.
  const runningPriceEstimate = assembledParts
    ? estimateAssemblyPrice(assembledParts)
    : null;
  const buildPrice = runningPriceEstimate
    ? formatEstimatedTotal(
        runningPriceEstimate.amount,
        runningPriceEstimate.currency,
      )
    : null;
  const isDesigning = state.isSubmitting || state.visionLoading;
  const activeKitId = activeBuild
    ? getMetadataString(activeBuild.components.case.metadata, "kitId") ?? null
    : null;
  const buildDisplayName = activeBuild
    ? getKitDisplayName(activeBuild.components.case)
    : null;
  const isBuildComplete = assembledComponentIds !== null;
  const canSaveAssembly =
    isBuildComplete &&
    !isAssemblyValidating &&
    !isSavingBuild &&
    Boolean(assemblyValidation?.isValid);
  // A section is resolved when none of its categories still awaits a user
  // choice — kit-locked sections resolve as soon as the case is set.
  const reviewSections = activeBuild
    ? configuratorSections
        .filter((section) =>
          section.categories.some(
            (category) => activeBuild.components[category],
          ),
        )
        .map((section) => ({
          id: sectionDomId(section.title),
          title: section.title,
          resolved: section.categories.every(
            (category) =>
              !choiceCategories.includes(category) ||
              Boolean(chosenParts[category]),
          ),
        }))
    : [];

  return (
    <div className="min-h-screen bg-surface text-primary">
      <MainNav active="Configurator" />

      <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:py-10">
        {/* LEFT — product visual */}
        <BuildVisualPanel
          activeBuild={activeBuild}
          activeKitId={activeKitId}
          buildDisplayName={buildDisplayName}
          buildErrorCount={buildErrorCount}
          buildPrice={buildPrice}
          buildValid={buildValid}
          catalogById={state.catalogById}
          choiceCategories={choiceCategories}
          chosenParts={chosenParts}
        />

        {/* RIGHT — configuration rail */}
        <section className="flex min-w-0 flex-col">
          <RequestPanel
            isDesigning={isDesigning}
            isImagePanelOpen={isImagePanelOpen}
            setIsImagePanelOpen={setIsImagePanelOpen}
            setKeybotOpenSignal={setKeybotOpenSignal}
            state={state}
          />

          <CloneNotice
            assemblyValidation={assemblyValidation}
            buildPrice={buildPrice}
            clone={state.clone}
            isBuildComplete={isBuildComplete}
            isValidating={isAssemblyValidating}
          />

          <section
            aria-label="Resolved build configuration"
            className="mt-6 flex-1 space-y-8"
            id="results"
            ref={resultsRef}
          >
            {activeBuild ? (
              <>
                {result && result.recommendations.length > 0 ? (
                  <RecommendationCarousel
                    compare={compare}
                    key={state.refineVersion}
                    onSaveRecommendation={state.saveRecommendationBuild}
                    onSelect={state.adoptRecommendation}
                    recommendations={result.recommendations}
                    refine={state.refine}
                    selectedId={selectedRecommendation?.id ?? null}
                  />
                ) : null}

                <CompareView controls={compare} />

                <BuildSteps
                  activeBuild={activeBuild}
                  activeKitId={activeKitId}
                  catalog={state.catalog}
                  catalogById={state.catalogById}
                  choiceCategories={choiceCategories}
                  choosePart={state.choosePart}
                  chosenParts={chosenParts}
                  partialComponentIds={state.partialComponentIds}
                  result={result}
                  selectRecommendation={state.selectRecommendation}
                />
              </>
            ) : result && result.recommendations.length === 0 ? (
              <EmptyRecommendationState result={result} />
            ) : null}

            {/* Manual compatibility check — quiet secondary path */}
            <div className="border-t-[0.5px] border-border pt-4">
              <button
                aria-expanded={isManualCheckOpen}
                aria-label={
                  isManualCheckOpen ? "Hide manual check" : "Open manual check"
                }
                className="text-sm font-medium text-secondary underline-offset-4 transition hover:text-primary hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
                onClick={() => setIsManualCheckOpen((current) => !current)}
                type="button"
              >
                {isManualCheckOpen ? "Hide manual picker" : "Hand-pick manually"}
              </button>

              {isManualCheckOpen ? (
                <div className="mt-4">
                  <ManualSelectionPanel
                    catalogByCategory={state.catalogByCategory}
                    catalogError={state.catalogError}
                    hasMounted={state.hasMounted}
                    isCatalogLoading={state.isCatalogLoading}
                    isManualValidating={state.isManualValidating}
                    manualError={state.manualError}
                    manualSelection={state.manualSelection}
                    manualSelectionComplete={state.manualSelectionComplete}
                    manualValidation={state.manualValidation}
                    onSelect={state.updateManualSelection}
                    onSaveValidatedManualBuild={state.saveValidatedManualBuild}
                    onValidate={() => void state.validateManualSelection()}
                  />
                </div>
              ) : null}
            </div>
          </section>

          <SaveBar
            activeBuild={activeBuild}
            buildDisplayName={buildDisplayName}
            buildPrice={buildPrice}
            canSaveAssembly={canSaveAssembly}
            choiceCategories={choiceCategories}
            chosenParts={chosenParts}
            isBuildComplete={isBuildComplete}
            saveAssembledBuild={state.saveAssembledBuild}
            shareIds={
              assembledComponentIds && assemblyValidation?.isValid
                ? assembledComponentIds
                : null
            }
          />
        </section>
      </div>

      {activeBuild && reviewSections.length > 1 ? (
        <ResolutionProgress sections={reviewSections} />
      ) : null}

      <FloatingKeybot
        catalogById={state.catalogById}
        manualSelection={state.manualSelection}
        openSignal={keybotOpenSignal}
        result={result}
        selectedRecommendation={selectedRecommendation}
      />
    </div>
  );
}
