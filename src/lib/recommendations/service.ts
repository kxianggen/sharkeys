import { zodTextFormat } from "openai/helpers/zod";
import type OpenAI from "openai";
import { z } from "zod";

import {
  extractKeyboardIntent,
  prepareIntentMatches,
  prepareIntentMatchesAsync,
  type ComponentCandidateIdsByCategory,
  type ExtractedKeyboardIntent,
  type IntentExtractionResult,
  type IntentPreparation,
} from "@/lib/ai";
import {
  getCatalogComponents,
  getComponentById,
  validateBuildSelectionFromIds,
} from "@/lib/components";
import { readOptionalOpenAIConfig } from "@/lib/env";
import { createOpenAIClient } from "@/lib/openai";
import {
  requiredComponentCategories,
  type ComponentCategory,
  type CurrencyCode,
  type KeyboardComponent,
  type KeyboardBuildSelection,
  type CompatibilityIssue,
  type SoundProfile,
} from "@/lib/types";
import { normalizeBudgetForCatalogPricing } from "@/lib/pricing";

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
  catalogComponents?: readonly KeyboardComponent[];
  maxRecommendations?: number;
  explanationClient?: OpenAIRecommendationClient;
  explanationModel?: string;
  explanationMaxOutputTokens?: number;
};

type OpenAIRecommendationClient = Pick<OpenAI, "responses">;

type AssemblyResult = {
  recommendations: ValidatedRecommendationBuild[];
  rejectedBuildCount: number;
  rejectionExplanations: string[];
};

// Assembly must be able to enumerate the full prepared candidate space
// (intent preparation already caps each category at 6): a tighter slice can
// drop a kit's own PCB while keeping its case, making that kit — and with few
// enough survivors, every build — unassemblable. 6^6 bounds the worst case;
// each attempt is a cheap in-memory rule-engine validation.
const maxCandidatesPerCategoryForAssembly = 6;
const maxAssemblyAttempts = 6 ** 6;
const defaultMaxRecommendations = 3;
const estimatedSwitchCount = 70;

type PriceEstimate = {
  amount: number;
  currency: CurrencyCode;
};

const recommendationExplanationSchema = z
  .object({
    recommendations: z
      .array(
        z
          .object({
            id: z.string().min(1),
            explanations: z.array(z.string().min(1)).min(1).max(4),
          })
          .strict(),
      )
      .max(defaultMaxRecommendations),
    overallExplanations: z.array(z.string().min(1)).max(3),
    clarificationPrompt: z.string().min(1).nullable(),
  })
  .strict();

export async function generateRecommendationsFromMessage(
  request: RecommendationsRequest,
  options: GenerateRecommendationsOptions = {},
): Promise<RecommendationResult> {
  const extraction =
    options.extraction ?? (await extractKeyboardIntent({ message: request.message }));
  const catalogComponents =
    options.catalogComponents ?? (await getCatalogComponents());

  // Use async path so semantic search can augment switch candidates when
  // soundProfile is absent but constraints contain descriptive language.
  const preparation = await prepareIntentMatchesAsync(
    extraction.intent,
    catalogComponents,
  );

  const deterministicResult = createRecommendationResult(extraction, {
    catalogComponents,
    preparation,
    maxRecommendations: options.maxRecommendations,
  });

  return enhanceRecommendationResultWithOpenAI(deterministicResult, {
    client: options.explanationClient,
    model: options.explanationModel,
    maxOutputTokens: options.explanationMaxOutputTokens,
  });
}

export function createRecommendationResult(
  extraction: IntentExtractionResult,
  options: {
    catalogComponents?: readonly KeyboardComponent[];
    preparation?: IntentPreparation;
    maxRecommendations?: number;
  } = {},
): RecommendationResult {
  const catalogComponents = options.catalogComponents;
  const preparation =
    options.preparation ??
    prepareIntentMatches(extraction.intent, catalogComponents);
  const assembly = buildValidatedRecommendations({
    intent: extraction.intent,
    candidateComponentIds: preparation.candidateComponentIds,
    catalogComponents,
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
    explanations: buildResultExplanations(assembly, extraction.intent),
    clarificationPrompt,
    error: extraction.error,
  });
}

export function buildValidatedRecommendations({
  intent,
  candidateComponentIds,
  catalogComponents,
  maxRecommendations = defaultMaxRecommendations,
}: {
  intent: ExtractedKeyboardIntent;
  candidateComponentIds: ComponentCandidateIdsByCategory;
  catalogComponents?: readonly KeyboardComponent[];
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
        `No catalog candidates were available for: ${missingCandidateCategories.join(
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
    const components = resolveRecommendationComponents(
      componentIds,
      catalogComponents,
    );

    if (!components) {
      rejectedBuildCount += 1;
      rejectionReasons.add("One or more candidate component IDs could not be resolved.");
      continue;
    }

    const selection = createBuildSelection(componentIds, intent);
    const validation = validateBuildSelectionFromIds(
      selection,
      catalogComponents,
    );

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
      intent,
      validation,
    });

    if (exceedsExtractedBudget(recommendation, intent)) {
      rejectedBuildCount += 1;
      rejectionReasons.add("Estimated build price exceeds the extracted budget.");
      continue;
    }

    recommendations.push(recommendation);
  }

  return {
    recommendations: recommendations
      .sort((left, right) => compareRecommendations(left, right, intent))
      .slice(0, maxRecommendations),
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
  catalogComponents?: readonly KeyboardComponent[],
): RecommendationComponents | undefined {
  const caseComponent = getComponentById(componentIds.case, catalogComponents);
  const pcbComponent = getComponentById(componentIds.pcb, catalogComponents);
  const plateComponent = getComponentById(componentIds.plate, catalogComponents);
  const switchComponent = getComponentById(
    componentIds.switch,
    catalogComponents,
  );
  const keycapComponent = getComponentById(
    componentIds.keycap,
    catalogComponents,
  );
  const stabilizerComponent = getComponentById(
    componentIds.stabilizer,
    catalogComponents,
  );

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
  const catalogBudget = normalizeBudgetForCatalogPricing(intent.budget);

  return {
    componentIds,
    preferences: {
      layout: intent.layout ?? undefined,
      soundProfile: intent.soundProfile ?? undefined,
      beginnerFriendly: intent.beginnerFriendly ?? undefined,
      maxPrice: catalogBudget?.amount,
    },
  };
}

function createRecommendationBuild({
  componentIds,
  components,
  index,
  intent,
  validation,
}: {
  componentIds: RecommendationComponentIds;
  components: RecommendationComponents;
  index: number;
  intent: ExtractedKeyboardIntent;
  validation: ReturnType<typeof validateBuildSelectionFromIds>;
}): ValidatedRecommendationBuild {
  const priceEstimate = estimateBuildPrice(components);

  return {
    id: `validated_build_${index}`,
    title: `${components.case.name} with ${components.switch.name}`,
    componentIds,
    components,
    estimatedPrice: priceEstimate?.amount ?? null,
    estimatedPriceCurrency: priceEstimate?.currency ?? null,
    validation,
    warnings: validation.warnings,
    explanations: buildRecommendationExplanations({
      components,
      validation,
      priceEstimate,
      intent,
    }),
  };
}

function estimateBuildPrice(components: RecommendationComponents): PriceEstimate | null {
  const prices = requiredComponentCategories
    .map((category) => {
      const price = components[category].price;
      const currency = components[category].priceCurrency;

      if (price === undefined || currency === undefined) {
        return undefined;
      }

      return {
        amount: category === "switch" ? price * estimatedSwitchCount : price,
        currency,
      };
    })
    .filter((price): price is PriceEstimate => price !== undefined);

  if (prices.length === 0) {
    return null;
  }

  const [currency] = prices;

  if (!currency || prices.some((price) => price.currency !== currency.currency)) {
    return null;
  }

  return {
    amount: Number(
      prices.reduce((total, price) => total + price.amount, 0).toFixed(2),
    ),
    currency: currency.currency,
  };
}

function exceedsExtractedBudget(
  recommendation: ValidatedRecommendationBuild,
  intent: ExtractedKeyboardIntent,
) {
  const catalogBudget = normalizeBudgetForCatalogPricing(intent.budget);

  if (!catalogBudget) {
    return false;
  }

  if (
    recommendation.estimatedPrice === null ||
    recommendation.estimatedPriceCurrency !== catalogBudget.currency
  ) {
    return true;
  }

  return recommendation.estimatedPrice > catalogBudget.amount;
}

function compareRecommendations(
  left: ValidatedRecommendationBuild,
  right: ValidatedRecommendationBuild,
  intent: ExtractedKeyboardIntent,
) {
  const scoreDifference =
    scoreRecommendation(right, intent) - scoreRecommendation(left, intent);

  if (scoreDifference !== 0) {
    return scoreDifference;
  }

  if (left.warnings.length !== right.warnings.length) {
    return left.warnings.length - right.warnings.length;
  }

  return (left.estimatedPrice ?? Number.POSITIVE_INFINITY) -
    (right.estimatedPrice ?? Number.POSITIVE_INFINITY);
}

export function scoreRecommendation(
  recommendation: ValidatedRecommendationBuild,
  intent: ExtractedKeyboardIntent,
) {
  const { components } = recommendation;
  let score = 100;

  if (intent.layout) {
    score += components.case.layouts.includes(intent.layout) ? 16 : -24;
    score += components.pcb.layouts.includes(intent.layout) ? 16 : -24;
    score += components.plate.layouts.includes(intent.layout) ? 12 : -20;
    score += components.keycap.layoutSupport.includes(intent.layout) ? 8 : -12;
    score += components.stabilizer.supportedLayouts.includes(intent.layout)
      ? 8
      : -12;
  }

  if (intent.switchTechnology) {
    score +=
      components.switch.switchTechnology === intent.switchTechnology ? 10 : -20;
    score += components.pcb.switchTechnologySupport.includes(
      intent.switchTechnology,
    )
      ? 8
      : -18;
  }

  if (intent.soundProfile) {
    score += scoreSoundProfile(components.switch.soundProfile, intent.soundProfile, 28);
    score += scoreSoundProfile(components.case.soundProfile, intent.soundProfile, 4);
    score += scoreSoundProfile(components.plate.soundProfile, intent.soundProfile, 4);
  }

  score += scoreUseCaseFit(recommendation, intent);
  score += scoreBeginnerFit(recommendation, intent);
  score += scoreBudgetFit(recommendation, intent);
  score += scoreConnectionFit(recommendation, intent);
  score += scoreCatalogConfidence(recommendation);

  score -= recommendation.warnings.length * 10;

  return score;
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

function buildResultExplanations(
  assembly: AssemblyResult,
  intent: ExtractedKeyboardIntent,
) {
  if (assembly.recommendations.length > 0) {
    return [
      "All returned recommendations passed deterministic compatibility validation.",
      "Validated builds were ranked by layout, sound, use case, budget fit, warning count, and Malaysia catalog provenance.",
      `${assembly.rejectedBuildCount} candidate build(s) were filtered out before response.`,
    ];
  }

  return [
    "No valid build could be assembled from the current Malaysia catalog after deterministic validation.",
    ...buildNoBuildBlockers(intent, assembly.rejectionExplanations),
    ...assembly.rejectionExplanations,
    buildNoBuildSuggestion(intent, assembly.rejectionExplanations),
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
    buildNoBuildSuggestion(intent, assembly.rejectionExplanations) ??
    intent.clarificationQuestion
  );
}

function buildRecommendationExplanations({
  components,
  validation,
  priceEstimate,
  intent,
}: {
  components: RecommendationComponents;
  validation: ReturnType<typeof validateBuildSelectionFromIds>;
  priceEstimate: PriceEstimate | null;
  intent: ExtractedKeyboardIntent;
}) {
  const explanations = [
    "This build passed deterministic compatibility validation before being recommended.",
    `${components.case.name}, ${components.pcb.name}, and ${components.plate.name} share a compatible physical layout and mount path.`,
    `${components.switch.name} is an MX mechanical switch supported by ${components.pcb.name}; ${components.keycap.name} and ${components.stabilizer.name} match the validated layout requirements.`,
  ];

  if (intent.soundProfile && components.switch.soundProfile) {
    explanations.push(
      `${components.switch.name} is tagged ${components.switch.soundProfile}, which ${components.switch.soundProfile === intent.soundProfile ? "matches" : "is the closest validated option for"} the requested ${intent.soundProfile} sound profile.`,
    );
  }

  const catalogBudget = normalizeBudgetForCatalogPricing(intent.budget);

  if (catalogBudget && priceEstimate?.currency === catalogBudget.currency) {
    explanations.push(
      `Estimated total is ${formatPrice(priceEstimate)} against the normalized ${formatPrice(catalogBudget)} budget.`,
    );
  } else if (priceEstimate) {
    explanations.push(`Estimated total is ${formatPrice(priceEstimate)}.`);
  }

  const provenanceNotes = buildProvenanceNotes(components);

  if (provenanceNotes.length > 0) {
    explanations.push(provenanceNotes.join(" "));
  }

  return [...explanations, ...validation.explanations].slice(0, 8);
}

function scoreSoundProfile(
  actual: SoundProfile | undefined,
  requested: SoundProfile,
  weight: number,
) {
  if (!actual) {
    return 0;
  }

  if (actual === requested) {
    return weight;
  }

  const relatedProfiles: Record<SoundProfile, SoundProfile[]> = {
    creamy: ["thocky", "neutral"],
    thocky: ["creamy", "neutral"],
    clacky: ["neutral"],
    silent: ["neutral"],
    neutral: ["creamy", "thocky", "silent", "clacky"],
  };

  return relatedProfiles[requested].includes(actual)
    ? Math.round(weight * 0.35)
    : -Math.round(weight * 0.45);
}

function scoreUseCaseFit(
  recommendation: ValidatedRecommendationBuild,
  intent: ExtractedKeyboardIntent,
) {
  const switchSound = recommendation.components.switch.soundProfile;
  const switchDescription = recommendation.components.switch.description ?? "";
  const connection = recommendation.components.pcb.connection;

  if (intent.useCase === "office") {
    return (
      (switchSound === "silent" ? 24 : switchSound === "neutral" ? 8 : -10) +
      (recommendation.components.switch.beginnerFriendly ? 4 : 0)
    );
  }

  if (intent.useCase === "gaming") {
    return (
      (switchDescription.toLowerCase().includes("linear") ? 12 : 0) +
      (switchSound === "clacky" ? 8 : 0) +
      (connection === "both" || connection === "wireless" ? 4 : 0)
    );
  }

  if (intent.useCase === "typing" || intent.useCase === "programming") {
    return ["thocky", "creamy", "neutral"].includes(switchSound ?? "")
      ? 12
      : 0;
  }

  if (intent.useCase === "travel") {
    return recommendation.components.pcb.connection === "both" ? 10 : 0;
  }

  return 0;
}

function scoreBeginnerFit(
  recommendation: ValidatedRecommendationBuild,
  intent: ExtractedKeyboardIntent,
) {
  if (intent.beginnerFriendly === null) {
    return 0;
  }

  const beginnerCount = requiredComponentCategories.filter(
    (category) => recommendation.components[category].beginnerFriendly,
  ).length;

  return intent.beginnerFriendly
    ? beginnerCount * 3
    : (requiredComponentCategories.length - beginnerCount) * 2;
}

function scoreBudgetFit(
  recommendation: ValidatedRecommendationBuild,
  intent: ExtractedKeyboardIntent,
) {
  const catalogBudget = normalizeBudgetForCatalogPricing(intent.budget);

  if (!catalogBudget) {
    return 0;
  }

  if (
    recommendation.estimatedPrice === null ||
    recommendation.estimatedPriceCurrency !== catalogBudget.currency
  ) {
    return -25;
  }

  const remainingBudget = catalogBudget.amount - recommendation.estimatedPrice;

  if (remainingBudget < 0) {
    return -60;
  }

  const efficiency = remainingBudget / Math.max(catalogBudget.amount, 1);

  return 20 + Math.round(Math.min(efficiency, 0.5) * 20);
}

function scoreConnectionFit(
  recommendation: ValidatedRecommendationBuild,
  intent: ExtractedKeyboardIntent,
) {
  const text = [...intent.constraints, ...intent.priorities].join(" ");

  if (/\b(wireless|tri.?mode|bluetooth)\b/i.test(text)) {
    return recommendation.components.pcb.connection === "both" ||
      recommendation.components.pcb.connection === "wireless"
      ? 10
      : -10;
  }

  if (/\bwired\b/i.test(text)) {
    return recommendation.components.pcb.connection === "wired" ||
      recommendation.components.pcb.connection === "both"
      ? 8
      : -8;
  }

  return 0;
}

function scoreCatalogConfidence(recommendation: ValidatedRecommendationBuild) {
  let score = 0;

  for (const category of requiredComponentCategories) {
    const component = recommendation.components[category];
    const sourceVendor = getMetadataString(component.metadata, "sourceVendor");
    const notes = getMetadataStringArray(component.metadata, "notes").join(" ");

    if (sourceVendor === "MKB.MY" || sourceVendor === "KeebsProject") {
      score += 2;
    }

    if (/needs verification/i.test(notes)) {
      score -= 3;
    }
  }

  return score;
}

function buildNoBuildBlockers(
  intent: ExtractedKeyboardIntent,
  rejectionExplanations: string[],
) {
  const blockers: string[] = [];
  const rejectionText = rejectionExplanations.join(" ");

  if (intent.layout === "75" && /No catalog candidates were available for: pcb/.test(rejectionText)) {
    blockers.push(
      "The current curated catalog does not yet have a verified 75% PCB and stabilizer compatibility path.",
    );
  }

  if (/Estimated build price exceeds/.test(rejectionText)) {
    blockers.push(
      "The validated component combinations found by the engine exceed the extracted budget.",
    );
  }

  if (
    intent.switchTechnology &&
    /No catalog candidates were available for: switch|switch technology/i.test(
      rejectionText,
    )
  ) {
    blockers.push(
      `The current catalog does not have enough validated ${intent.switchTechnology} switch technology coverage for this request.`,
    );
  }

  if (blockers.length === 0) {
    blockers.push(
      "The requested combination is not covered by the currently verified Malaysia catalog records.",
    );
  }

  return blockers;
}

function buildNoBuildSuggestion(
  intent: ExtractedKeyboardIntent,
  rejectionExplanations: string[],
) {
  const rejectionText = rejectionExplanations.join(" ");

  if (intent.layout === "75") {
    return "Try allowing TKL or 65% for now, or wait until the held AL75/Yunzii 75% PCB stabilizer specs are verified.";
  }

  if (/Estimated build price exceeds/.test(rejectionText)) {
    return "Try increasing the budget or relaxing the requested layout, sound profile, or premium-material constraint.";
  }

  if (intent.switchTechnology && intent.switchTechnology !== "mechanical") {
    return "Try an MX mechanical build first; optical, Hall effect, and Topre paths need compatible boards in the catalog before they can be recommended.";
  }

  return "Try adding a layout, sound profile, use case, or budget so sharkeys can narrow the validated catalog paths.";
}

async function enhanceRecommendationResultWithOpenAI(
  result: RecommendationResult,
  options: {
    client?: OpenAIRecommendationClient;
    model?: string;
    maxOutputTokens?: number;
  },
) {
  if (result.source !== "openai" || result.recommendations.length === 0) {
    return result;
  }

  const config = readOptionalOpenAIConfig();
  const apiKey = config.OPENAI_API_KEY;

  if (!options.client && !apiKey) {
    return result;
  }

  try {
    const client = options.client ?? createOpenAIClient(apiKey);
    const response = await client.responses.parse({
      model: options.model ?? config.OPENAI_MODEL,
      max_output_tokens:
        options.maxOutputTokens ?? config.OPENAI_MAX_OUTPUT_TOKENS,
      input: [
        {
          role: "system",
          content: [
            "You write concise keyboard recommendation explanations.",
            "Use only the provided component facts and deterministic validation facts.",
            "Do not invent products, specs, prices, vendors, availability, or compatibility.",
            "Do not claim a build is compatible unless the provided validation says it is valid.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify(buildExplanationPromptPayload(result)),
        },
      ],
      text: {
        format: zodTextFormat(
          recommendationExplanationSchema,
          "recommendation_explanations",
        ),
      },
    });
    const parsed = response.output_parsed;

    if (!parsed) {
      return result;
    }

    return recommendationResultSchema.parse({
      ...result,
      recommendations: result.recommendations,
      explanations: [
        ...result.explanations,
        "AI wording was generated from already validated recommendation facts; technical recommendation explanations remain deterministic.",
      ].slice(0, 6),
      clarificationPrompt: result.clarificationPrompt,
    });
  } catch {
    return recommendationResultSchema.parse({
      ...result,
      error: [
        result.error,
        "OpenAI explanation generation failed; deterministic explanations were used.",
      ]
        .filter(Boolean)
        .join(" "),
    });
  }
}

function buildExplanationPromptPayload(result: RecommendationResult) {
  return {
    intent: result.intent,
    criteria: result.criteria,
    rules: [
      "All recommendations in this payload already passed deterministic validation.",
      "Only explain selected component facts.",
      "Mention uncertainty only when it is present in metadata.",
    ],
    recommendations: result.recommendations.map((recommendation) => ({
      id: recommendation.id,
      estimatedPrice: recommendation.estimatedPrice,
      estimatedPriceCurrency: recommendation.estimatedPriceCurrency,
      warnings: recommendation.warnings,
      deterministicExplanations: recommendation.explanations,
      components: requiredComponentCategories.map((category) => {
        const component = recommendation.components[category];

        return {
          category,
          id: component.id,
          name: component.name,
          brand: component.brand,
          price: component.price,
          priceCurrency: component.priceCurrency,
          vendorUrl: component.vendorUrl,
          soundProfile: component.soundProfile,
          beginnerFriendly: component.beginnerFriendly,
          description: component.description,
          metadata: component.metadata,
        };
      }),
    })),
  };
}

function buildProvenanceNotes(components: RecommendationComponents) {
  const kitDerivedComponents = requiredComponentCategories.filter(
    (category) =>
      getMetadataString(components[category].metadata, "sourceType") ===
      "kit_derived",
  );
  const needsVerification = requiredComponentCategories.some((category) =>
    /needs verification/i.test(
      getMetadataStringArray(components[category].metadata, "notes").join(" "),
    ),
  );
  const notes: string[] = [];

  if (kitDerivedComponents.length > 0) {
    notes.push(
      "Some structural parts are kit-derived prototype records, so vendor/source metadata should be checked before purchase.",
    );
  }

  if (needsVerification) {
    notes.push("One or more source notes still needs manual spec verification.");
  }

  return notes;
}

function formatPrice(price: PriceEstimate) {
  return `${price.currency} ${price.amount.toFixed(2)}`;
}

function getMetadataString(
  metadata: KeyboardComponent["metadata"],
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" ? value : undefined;
}

function getMetadataStringArray(
  metadata: KeyboardComponent["metadata"],
  key: string,
) {
  const value = metadata?.[key];

  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}
