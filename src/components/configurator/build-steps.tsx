"use client";

import { getComponentSwatch } from "@/components/part-thumbnail";
import {
  formatComponentPrice,
  getMetadataString,
  isKitLockedComponent,
  sectionDomId,
} from "@/components/configurator/build-helpers";
import { configuratorSections } from "@/components/configurator/constants";
import type {
  ComponentCategory,
  ManualSelection,
  RecommendationBuild,
  RecommendationResult,
} from "@/components/configurator/types";
import { SwatchDots } from "@/components/swatch-dots";
import { getOptionConflicts } from "@/lib/rules";
import type { KeyboardComponent } from "@/lib/types";

// Build steps: one section per part type (case, PCB, plate, switches,
// keycaps, stabilizers). Kit parts show as included; free choices list
// options the rule engine says still fit the current selection.
export function BuildSteps({
  activeBuild,
  activeKitId,
  catalog,
  catalogById,
  choiceCategories,
  choosePart,
  chosenParts,
  partialComponentIds,
  result,
  selectRecommendation,
}: {
  activeBuild: RecommendationBuild;
  activeKitId: string | null;
  catalog: KeyboardComponent[];
  catalogById: Map<string, KeyboardComponent>;
  choiceCategories: ComponentCategory[];
  choosePart: (category: ComponentCategory, componentId: string) => void;
  chosenParts: ManualSelection;
  partialComponentIds: Partial<Record<ComponentCategory, string>>;
  result: RecommendationResult | null;
  selectRecommendation: (recommendation: RecommendationBuild) => void;
}) {
    // Alternatives are drawn only from rule-engine-validated recommendations;
    // choosing one selects that validated build (never bypasses the engine).
    const getCategoryOptions = (category: ComponentCategory) => {
      if (!result) {
        return [];
      }

      const seen = new Set<string>();
      const options: Array<{
        component: KeyboardComponent;
        recommendation: RecommendationBuild;
      }> = [];

      for (const recommendation of result.recommendations) {
        const component = recommendation.components[category];

        if (!seen.has(component.id)) {
          seen.add(component.id);
          options.push({ component, recommendation });
        }
      }

      return options;
    };

    // Options for free-choice sections: engine-validated recommendation parts
    // lead (the AI's picks), then the remaining pipeline candidates from the
    // real catalog. Whatever the user assembles still goes through
    // /api/builds/validate before it can be saved — never an engine bypass.
    //
    // Kit ownership rule (data-driven, not a product allow-list): a part that
    // is kit-locked to a DIFFERENT kit ships only with that kit, so it is
    // never offered on this build. The active kit's own kit-locked part is
    // always offered (it comes in the box), listed first; aftermarket parts
    // follow as upgrades sorted by price low→high.
    const getChoiceOptions = (category: ComponentCategory) => {
      if (!result) {
        return [];
      }

      const seen = new Set<string>();
      const options: KeyboardComponent[] = [];

      const pushOption = (component: KeyboardComponent | undefined) => {
        if (
          component &&
          component.category === category &&
          !seen.has(component.id)
        ) {
          seen.add(component.id);
          options.push(component);
        }
      };

      const kitIdOf = (component: KeyboardComponent) =>
        getMetadataString(component.metadata, "kitId");

      // The kit's own part for this category always leads the list.
      if (activeKitId) {
        for (const component of catalog) {
          if (
            component.category === category &&
            isKitLockedComponent(component) &&
            kitIdOf(component) === activeKitId
          ) {
            pushOption(component);
          }
        }
      }

      for (const recommendation of result.recommendations) {
        pushOption(recommendation.components[category]);
      }

      for (const componentId of result.candidateComponentIds[category] ?? []) {
        pushOption(catalogById.get(componentId));
      }

      // Manual configuration is not limited to the AI's shortlist. Offer every
      // catalog part in this category — the rule-engine gate at render time
      // hides whatever cannot work with the current selection. Without this,
      // choosing the hall-effect PCB left zero switches to pick from, because
      // the shortlist had been built for a clacky (mechanical) query.
      for (const component of catalog) {
        if (component.category === category) {
          pushOption(component);
        }
      }

      // Never offer a part locked to another kit.
      const offerable = options.filter(
        (component) =>
          !isKitLockedComponent(component) ||
          kitIdOf(component) === activeKitId,
      );

      const ownKitParts = offerable.filter(isKitLockedComponent);

      if (ownKitParts.length === 0) {
        return offerable;
      }

      const aftermarketParts = offerable
        .filter((component) => !isKitLockedComponent(component))
        .sort(
          (a, b) =>
            (a.price ?? Number.POSITIVE_INFINITY) -
            (b.price ?? Number.POSITIVE_INFINITY),
        );

      return [...ownKitParts, ...aftermarketParts];
    };

  return (
    <>
                  {configuratorSections.map((section) => (
                    <section id={sectionDomId(section.title)} key={section.title}>
                      <h3 className="text-h2 text-primary">
                        {section.title}.{" "}
                        <span className="text-secondary">
                          {section.prompt}
                        </span>
                      </h3>

                      <div className="mt-4 space-y-2.5">
                        {section.categories.flatMap((category) => {
                          const recommendedPart =
                            activeBuild.components[category];

                          // Kit-locked parts (and the case anchor's siblings)
                          // are resolved by the kit, not picked: render them
                          // as included, without a pick affordance.
                          if (
                            category !== "case" &&
                            !choiceCategories.includes(category)
                          ) {
                            return [
                              <div
                                className="flex w-full items-center justify-between gap-4 rounded-lg border-[0.5px] border-border bg-surface-secondary/60 p-4"
                                key={`${category}-${recommendedPart.id}`}
                              >
                                <div className="min-w-0">
                                  <p className="text-base font-semibold text-primary">
                                    {recommendedPart.name}
                                  </p>
                                  <p className="mt-0.5 line-clamp-1 text-sm leading-6 text-secondary">
                                    {recommendedPart.description}
                                  </p>
                                  <p className="mt-2 inline-flex items-center rounded-pill bg-accent-subtle px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    Included with this kit
                                  </p>
                                </div>
                                <span className="flex-none text-sm font-semibold text-primary">
                                  {formatComponentPrice(recommendedPart)}
                                </span>
                              </div>,
                            ];
                          }

                          const isChoice = category !== "case";
                          const chosenId = chosenParts[category] ?? null;
                          // AI's pick leads the list but is never pre-selected
                          // for free-choice categories. Choice sections also
                          // surface the wider candidate pool from the catalog.
                          const choiceOptions = isChoice
                            ? getChoiceOptions(category).map((component) => ({
                                component,
                                recommendation: null,
                              }))
                            : getCategoryOptions(category);
                          // When the kit's own part leads the list its order
                          // is already Apple-style (included first, upgrades
                          // by price); otherwise float the AI's pick to top.
                          const hasOwnKitOption =
                            isChoice &&
                            choiceOptions.some(({ component }) =>
                              isKitLockedComponent(component),
                            );
                          const options = hasOwnKitOption
                            ? choiceOptions
                            : [...choiceOptions].sort(
                                (a, b) =>
                                  Number(b.component.id === recommendedPart.id) -
                                  Number(a.component.id === recommendedPart.id),
                              );

                          // Ask the rule engine, don't re-derive the rules
                          // here: whatever it would reject after the pick is
                          // what gets hidden before it.
                          const optionsWithConflicts = options.map((option) => ({
                            ...option,
                            conflicts: isChoice
                              ? getOptionConflicts(
                                  category,
                                  option.component.id,
                                  partialComponentIds,
                                  catalog,
                                )
                              : [],
                          }));
                          const compatibleOptions = optionsWithConflicts.filter(
                            (option) =>
                              option.conflicts.length === 0 ||
                              option.component.id === chosenId,
                          );
                          // Safeguard: if nothing is compatible, show the full
                          // list with reasons rather than an empty step. An
                          // empty section is more confusing than a struck-out
                          // one, and it hides *why* the build is stuck.
                          const visibleOptions =
                            compatibleOptions.length > 0
                              ? compatibleOptions
                              : optionsWithConflicts;

                          return visibleOptions.map(
                            ({ component, recommendation, conflicts }) => {
                            const selected = isChoice
                              ? component.id === chosenId
                              : component.id === recommendedPart.id;
                            const isOwnKitPart =
                              isChoice && isKitLockedComponent(component);
                            const swatch = getComponentSwatch(component);
                            const blocked = conflicts.length > 0 && !selected;

                            return (
                              <button
                                aria-pressed={selected}
                                className={`flex w-full items-center justify-between gap-4 rounded-lg p-4 text-left transition ${
                                  selected
                                    ? "border-[1.5px] border-accent bg-accent-subtle/50"
                                    : blocked
                                      ? "cursor-not-allowed border-[0.5px] border-border bg-surface-secondary/40 opacity-55"
                                      : "border-[0.5px] border-border hover:border-border-strong"
                                }`}
                                disabled={blocked}
                                key={`${category}-${component.id}`}
                                onClick={() => {
                                  if (blocked) {
                                    return;
                                  }

                                  if (isChoice) {
                                    choosePart(category, component.id);
                                  } else if (recommendation) {
                                    selectRecommendation(recommendation);
                                  }
                                }}
                                title={blocked ? conflicts[0]?.message : undefined}
                                type="button"
                              >
                                <span className="min-w-0">
                                  <span className="flex min-w-0 items-center gap-2">
                                    {swatch ? <SwatchDots colors={swatch} /> : null}
                                    <span className="block text-base font-semibold text-primary">
                                      {component.name}
                                    </span>
                                  </span>
                                  <span className="mt-0.5 line-clamp-1 block text-sm leading-6 text-secondary">
                                    {component.description}
                                  </span>
                                  {isOwnKitPart ? (
                                    <span className="mt-2 inline-flex items-center rounded-pill bg-accent-subtle px-2.5 py-0.5 text-xs font-semibold text-primary">
                                      Included with this kit
                                    </span>
                                  ) : null}
                                  {blocked ? (
                                    <span className="mt-2 block text-xs font-semibold leading-5 text-secondary">
                                      Not compatible — {conflicts[0]?.message}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="flex-none text-sm font-semibold text-primary">
                                  {formatComponentPrice(component)}
                                </span>
                              </button>
                            );
                          });
                        })}
                      </div>
                    </section>
                  ))}
    </>
  );
}
