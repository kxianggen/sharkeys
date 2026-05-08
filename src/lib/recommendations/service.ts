import {
  extractKeyboardIntent,
  prepareIntentMatches,
  type ComponentCandidateIdsByCategory,
  type ExtractedKeyboardIntent,
  type IntentExtractionResult,
  type IntentPreparation,
} from "@/lib/ai";
import { getComponentById, validateBuildSelectionFromIds } from "@/lib/components";
import {
  requiredComponentCategories,
  type ComponentCategory,
  type KeyboardBuildSelection,
  type CompatibilityIssue,
} from "@/lib/types";

import {
  recommendationResultSchema,
  type RecommendationComponentIds,
  type RecommendationComponents,
  type RecommendationResult,
  type RecommendationsRequest,
  type ValidatedRecommendationBuild,
} from "./schemas";

type GenerateRecommendationsOptions = {
  extraction?: IntentExtractionResult;
  maxRecommendations?: number;
};

type AssemblyResult = {
  recommendations: ValidatedRecommendationBuild[];
  rejectedBuildCount: number;
  rejectionExplanations: string[];
};

const maxCandidatesPerCategoryForAssembly = 4;
const maxAssemblyAttempts = 300;
const defaultMaxRecommendations = 3;
const estimatedSwitchCount = 70;

export async function generateRecommendationsFromMessage(
  request: RecommendationsRequest,
  options: GenerateRecommendationsOptions = {},
): Promise<RecommendationResult> {
  const extraction =
    options.extraction ?? (await extractKeyboardIntent({ message: request.message }));

  return createRecommendationResult(extraction, {
    maxRecommendations: options.maxRecommendations,
  });
}

export function createRecommendationResult(
  extraction: IntentExtractionResult,
  options: {
    preparation?: IntentPreparation;
    maxRecommendations?: number;
  } = {},
): RecommendationResult {
  const preparation = options.preparation ?? prepareIntentMatches(extraction.intent);
  const assembly = buildValidatedRecommendations({
    intent: extraction.intent,
    candidateComponentIds: preparation.candidateComponentIds,
    maxRecommendations: options.maxRecommendations,
  });
  const clarificationPrompt = buildClarificationPrompt(extraction.intent, assembly);

  return recommendationResultSchema.parse({
    intent: extraction.intent,
    source: extraction.source,
    criteria: preparation.criteria,
    candidateComponentIds: preparation.candidateComponentIds,
    recommendations: assembly.recommendations,
    warnings: collectWarnings(assembly.recommendations),
    explanations: buildResultExplanations(assembly),
    clarificationPrompt,
    error: extraction.error,
  });
}

export function buildValidatedRecommendations({
  intent,
  candidateComponentIds,
  maxRecommendations = defaultMaxRecommendations,
}: {
  intent: ExtractedKeyboardIntent;
  candidateComponentIds: ComponentCandidateIdsByCategory;
  maxRecommendations?: number;
}): AssemblyResult {
  const candidateSets = getCandidateSets(candidateComponentIds);
  const missingCandidateCategories = requiredComponentCategories.filter(
    (category) => candidateSets[category].length === 0,
  );

  if (missingCandidateCategories.length > 0) {
    return {
      recommendations: [],
      rejectedBuildCount: 0,
      rejectionExplanations: [
        `No seed candidates were available for: ${missingCandidateCategories.join(
          ", ",
        )}.`,
      ],
    };
  }

  const recommendations: ValidatedRecommendationBuild[] = [];
  const rejectionReasons = new Set<string>();
  let rejectedBuildCount = 0;
  let attempts = 0;

  for (const componentIds of enumerateBuildSelections(candidateSets)) {
    if (attempts >= maxAssemblyAttempts) {
      break;
    }

    attempts += 1;
    const components = resolveRecommendationComponents(componentIds);

    if (!components) {
      rejectedBuildCount += 1;
      rejectionReasons.add("One or more candidate component IDs could not be resolved.");
      continue;
    }

    const selection = createBuildSelection(componentIds, intent);
    const validation = validateBuildSelectionFromIds(selection);

    if (!validation.isValid) {
      rejectedBuildCount += 1;
      for (const error of validation.errors) {
        rejectionReasons.add(error.message);
      }
      continue;
    }

    const recommendation = createRecommendationBuild({
      componentIds,
      components,
      index: recommendations.length + 1,
      validation,
    });

    if (exceedsExtractedBudget(recommendation, intent)) {
      rejectedBuildCount += 1;
      rejectionReasons.add("Estimated build price exceeds the extracted budget.");
      continue;
    }

    recommendations.push(recommendation);

    if (recommendations.length >= maxRecommendations) {
      break;
    }
  }

  return {
    recommendations: recommendations.sort(compareRecommendations),
    rejectedBuildCount,
    rejectionExplanations: [...rejectionReasons].slice(0, 4),
  };
}

function getCandidateSets(
  candidateComponentIds: ComponentCandidateIdsByCategory,
): Record<ComponentCategory, string[]> {
  return Object.fromEntries(
    requiredComponentCategories.map((category) => [
      category,
      candidateComponentIds[category].slice(0, maxCandidatesPerCategoryForAssembly),
    ]),
  ) as Record<ComponentCategory, string[]>;
}

function* enumerateBuildSelections(
  candidateSets: Record<ComponentCategory, string[]>,
  categoryIndex = 0,
  partialSelection: Partial<RecommendationComponentIds> = {},
): Generator<RecommendationComponentIds> {
  const category = requiredComponentCategories[categoryIndex];

  if (!category) {
    yield partialSelection as RecommendationComponentIds;
    return;
  }

  for (const id of candidateSets[category]) {
    yield* enumerateBuildSelections(candidateSets, categoryIndex + 1, {
      ...partialSelection,
      [category]: id,
    });
  }
}

function resolveRecommendationComponents(
  componentIds: RecommendationComponentIds,
): RecommendationComponents | undefined {
  const caseComponent = getComponentById(componentIds.case);
  const pcbComponent = getComponentById(componentIds.pcb);
  const plateComponent = getComponentById(componentIds.plate);
  const switchComponent = getComponentById(componentIds.switch);
  const keycapComponent = getComponentById(componentIds.keycap);
  const stabilizerComponent = getComponentById(componentIds.stabilizer);

  if (
    caseComponent?.category !== "case" ||
    pcbComponent?.category !== "pcb" ||
    plateComponent?.category !== "plate" ||
    switchComponent?.category !== "switch" ||
    keycapComponent?.category !== "keycap" ||
    stabilizerComponent?.category !== "stabilizer"
  ) {
    return undefined;
  }

  return {
    case: caseComponent,
    pcb: pcbComponent,
    plate: plateComponent,
    switch: switchComponent,
    keycap: keycapComponent,
    stabilizer: stabilizerComponent,
  };
}

function createBuildSelection(
  componentIds: RecommendationComponentIds,
  intent: ExtractedKeyboardIntent,
): KeyboardBuildSelection {
  return {
    componentIds,
    preferences: {
      layout: intent.layout ?? undefined,
      soundProfile: intent.soundProfile ?? undefined,
      beginnerFriendly: intent.beginnerFriendly ?? undefined,
      maxPrice: intent.budget?.amount ?? undefined,
    },
  };
}

function createRecommendationBuild({
  componentIds,
  components,
  index,
  validation,
}: {
  componentIds: RecommendationComponentIds;
  components: RecommendationComponents;
  index: number;
  validation: ReturnType<typeof validateBuildSelectionFromIds>;
}): ValidatedRecommendationBuild {
  return {
    id: `validated_build_${index}`,
    title: `${components.case.name} with ${components.switch.name}`,
    componentIds,
    components,
    estimatedPrice: estimateBuildPrice(components),
    validation,
    warnings: validation.warnings,
    explanations: [
      "This build passed deterministic compatibility validation.",
      ...validation.explanations,
    ],
  };
}

function estimateBuildPrice(components: RecommendationComponents) {
  const prices = requiredComponentCategories
    .map((category) => {
      const price = components[category].price;

      if (price === undefined) {
        return undefined;
      }

      return category === "switch" ? price * estimatedSwitchCount : price;
    })
    .filter((price): price is number => price !== undefined);

  if (prices.length === 0) {
    return null;
  }

  return Number(
    prices.reduce((total, price) => total + price, 0).toFixed(2),
  );
}

function exceedsExtractedBudget(
  recommendation: ValidatedRecommendationBuild,
  intent: ExtractedKeyboardIntent,
) {
  const budgetAmount = intent.budget?.amount;

  return (
    budgetAmount !== null &&
    budgetAmount !== undefined &&
    recommendation.estimatedPrice !== null &&
    recommendation.estimatedPrice > budgetAmount
  );
}

function compareRecommendations(
  left: ValidatedRecommendationBuild,
  right: ValidatedRecommendationBuild,
) {
  if (left.warnings.length !== right.warnings.length) {
    return left.warnings.length - right.warnings.length;
  }

  return (left.estimatedPrice ?? Number.POSITIVE_INFINITY) -
    (right.estimatedPrice ?? Number.POSITIVE_INFINITY);
}

function collectWarnings(recommendations: ValidatedRecommendationBuild[]) {
  const warningsByKey = new Map<string, CompatibilityIssue>();

  for (const recommendation of recommendations) {
    for (const warning of recommendation.warnings) {
      warningsByKey.set(
        `${warning.code}:${warning.affectedComponentIds.join(",")}`,
        warning,
      );
    }
  }

  return [...warningsByKey.values()];
}

function buildResultExplanations(assembly: AssemblyResult) {
  if (assembly.recommendations.length > 0) {
    return [
      "All returned recommendations passed deterministic compatibility validation.",
      `${assembly.rejectedBuildCount} candidate build(s) were filtered out before response.`,
    ];
  }

  return [
    "No valid build could be assembled from the current seed candidates after deterministic validation.",
    ...assembly.rejectionExplanations,
  ];
}

function buildClarificationPrompt(
  intent: ExtractedKeyboardIntent,
  assembly: AssemblyResult,
) {
  if (assembly.recommendations.length > 0) {
    return intent.clarificationNeeded ? intent.clarificationQuestion : null;
  }

  return (
    intent.clarificationQuestion ??
    "Try relaxing the layout, switch technology, sound profile, or budget constraints."
  );
}
