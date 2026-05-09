import {
  componentCategorySchema,
  type ComponentCategory,
} from "@/lib/types";
import {
  searchComponents,
  type ComponentSearchCriteria,
} from "@/lib/components";
import { normalizeBudgetForCatalogPricing } from "@/lib/pricing";

import {
  intentMatchingCriteriaSchema,
  intentPreparationSchema,
  type ComponentCandidateIdsByCategory,
  type ExtractedKeyboardIntent,
  type IntentMatchingCriteria,
} from "./intent-schema";

const maxCandidatesPerCategory = 6;

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

export function prepareIntentMatches(intent: ExtractedKeyboardIntent) {
  const criteria = mapIntentToSearchCriteria(intent);
  const candidateComponentIds = Object.fromEntries(
    componentCategorySchema.options.map((category) => [
      category,
      searchCandidateIds(category, criteria),
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

  const strictMatches = searchComponents(categoryCriteria);
  const relaxedMatches = searchComponents({
    category,
    layout: criteria.layout,
    switchTechnology: criteria.switchTechnology,
    soundProfile: criteria.soundProfile,
    beginnerFriendly: criteria.beginnerFriendly,
    maxPrice: criteria.maxPrice,
    currency: criteria.currency,
  });
  const coreMatches = searchComponents({
    category,
    layout: criteria.layout,
    switchTechnology: criteria.switchTechnology,
  });

  return (strictMatches.length > 0
    ? strictMatches
    : relaxedMatches.length > 0
      ? relaxedMatches
      : coreMatches)
    .slice(0, maxCandidatesPerCategory)
    .map((component) => component.id);
}

function buildQueryFromIntent(intent: ExtractedKeyboardIntent) {
  const terms = [
    intent.useCase !== "unknown" ? intent.useCase : undefined,
    ...intent.constraints,
  ].filter(Boolean);

  return terms.length > 0 ? terms.join(" ") : undefined;
}
