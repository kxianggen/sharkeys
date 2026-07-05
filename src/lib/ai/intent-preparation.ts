import {
  componentCategorySchema,
  type ComponentCategory,
} from "@/lib/types";
import { keyboardComponents } from "@/data";
import {
  searchComponents,
  type ComponentSearchCriteria,
} from "@/lib/components";
import { normalizeBudgetForCatalogPricing } from "@/lib/pricing";
import type { KeyboardComponent } from "@/lib/types";

import {
  intentMatchingCriteriaSchema,
  intentPreparationSchema,
  type ComponentCandidateIdsByCategory,
  type ExtractedKeyboardIntent,
  type IntentMatchingCriteria,
  type IntentPreparation,
} from "./intent-schema";
import { searchComponentsBySemantic } from "./embeddings";

const maxCandidatesPerCategory = 6;
// Drop semantic results below this cosine similarity — sub-threshold matches
// are off-profile noise that would corrupt the candidate list.
const semanticSimilarityThreshold = 0.36;

export function mapIntentToSearchCriteria(
  intent: ExtractedKeyboardIntent,
): IntentMatchingCriteria {
  const catalogBudget = normalizeBudgetForCatalogPricing(intent.budget);

  return intentMatchingCriteriaSchema.parse({
    layout: intent.layout ?? undefined,
    soundProfile: intent.soundProfile ?? undefined,
    switchTechnology: intent.switchTechnology ?? undefined,
    beginnerFriendly: intent.beginnerFriendly ?? undefined,
    maxPrice: catalogBudget?.amount,
    currency: catalogBudget?.currency,
    query: buildQueryFromIntent(intent),
  });
}

export function prepareIntentMatches(
  intent: ExtractedKeyboardIntent,
  components?: readonly KeyboardComponent[],
) {
  const criteria = mapIntentToSearchCriteria(intent);
  const candidateComponentIds = Object.fromEntries(
    componentCategorySchema.options.map((category) => [
      category,
      searchCandidateIds(category, criteria, components),
    ]),
  ) as ComponentCandidateIdsByCategory;

  return intentPreparationSchema.parse({
    criteria,
    candidateComponentIds,
  });
}

function searchCandidateIds(
  category: ComponentCategory,
  criteria: IntentMatchingCriteria,
  components?: readonly KeyboardComponent[],
) {
  const categoryCriteria: ComponentSearchCriteria = {
    category,
    query: criteria.query,
    layout: criteria.layout,
    switchTechnology: criteria.switchTechnology,
    soundProfile: criteria.soundProfile,
    beginnerFriendly: criteria.beginnerFriendly,
    maxPrice: criteria.maxPrice,
    currency: criteria.currency,
  };

  const strictMatches = searchComponents(categoryCriteria, components);
  const relaxedMatches = searchComponents({
    category,
    layout: criteria.layout,
    switchTechnology: criteria.switchTechnology,
    soundProfile: criteria.soundProfile,
    beginnerFriendly: criteria.beginnerFriendly,
    maxPrice: criteria.maxPrice,
    currency: criteria.currency,
  }, components);
  const coreMatches = searchComponents({
    category,
    layout: criteria.layout,
    switchTechnology: criteria.switchTechnology,
  }, components);

  const matches = strictMatches.length > 0
    ? strictMatches
    : relaxedMatches.length > 0
      ? relaxedMatches
      : coreMatches;

  return excludeIncompleteKitStructures(matches, category, components)
    .slice(0, maxCandidatesPerCategory)
    .map((component) => component.id);
}

// Defense-in-depth: a kit-locked case or plate can only ever validate if its
// kit also ships a PCB (the rule engine requires case/pcb/plate to share one
// kitId). If a kit is missing its PCB — bad or partial catalog data — every
// build using its case/plate is dead on arrival and would crowd complete kits
// out of the capped candidate window, silently yielding zero validated builds.
// Drop those structural parts up front so an incomplete kit cannot poison
// assembly. With a clean catalog this filters nothing.
function excludeIncompleteKitStructures(
  matches: readonly KeyboardComponent[],
  category: ComponentCategory,
  components?: readonly KeyboardComponent[],
) {
  if (category !== "case" && category !== "plate") {
    return matches;
  }

  const catalog = components ?? keyboardComponents;
  const kitIdsWithPcb = new Set<string>();

  for (const component of catalog) {
    if (component.category === "pcb") {
      const kitId = getKitId(component);

      if (kitId) {
        kitIdsWithPcb.add(kitId);
      }
    }
  }

  return matches.filter((component) => {
    const kitId = getKitId(component);

    // Only guard kit-locked structural parts; free (non-kit) parts pass.
    return !kitId || kitIdsWithPcb.has(kitId);
  });
}

function getKitId(component: KeyboardComponent) {
  const kitId = component.metadata?.["kitId"];

  return typeof kitId === "string" ? kitId : undefined;
}

// Async variant: augments switch candidates with semantic (pgvector) search when
// soundProfile is absent but free-text constraints describe sound characteristics.
// Falls back silently to keyword results when Supabase or OpenAI is unavailable,
// preserving offline-dev and eval-runner behaviour.
export async function prepareIntentMatchesAsync(
  intent: ExtractedKeyboardIntent,
  components?: readonly KeyboardComponent[],
): Promise<IntentPreparation> {
  const base = prepareIntentMatches(intent, components);

  const needsSemantic =
    intent.soundProfile === null && intent.constraints.length > 0;

  if (!needsSemantic) return base;

  const semanticQuery = intent.constraints.join(" ");
  const semanticResults = await searchComponentsBySemantic(semanticQuery, {
    filterCategory: "switch",
    matchCount: maxCandidatesPerCategory,
  });

  // Drop low-confidence results before merging — sub-threshold matches are
  // off-profile noise (e.g. clicky switches ranking in a "buttery smooth" query).
  const aboveThreshold = semanticResults.filter(
    (r) => r.similarity >= semanticSimilarityThreshold,
  );

  if (aboveThreshold.length === 0) return base;

  // Trust high-confidence semantic results exclusively; keyword broadening
  // would re-introduce off-profile switches that vector search ranked out.
  const merged = aboveThreshold.map((r) => r.id).slice(0, maxCandidatesPerCategory);

  return intentPreparationSchema.parse({
    ...base,
    candidateComponentIds: {
      ...base.candidateComponentIds,
      switch: merged,
    },
  });
}

function buildQueryFromIntent(intent: ExtractedKeyboardIntent) {
  const terms = [
    intent.useCase !== "unknown" ? intent.useCase : undefined,
    ...intent.constraints,
  ].filter(Boolean);

  return terms.length > 0 ? terms.join(" ") : undefined;
}
