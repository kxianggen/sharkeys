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
  getComponentColours,
  validateBuildSelectionFromIds,
} from "@/lib/components";
import { readOptionalOpenAIConfig } from "@/lib/env";
import { createOpenAIClient } from "@/lib/openai";
import {
  requiredComponentCategories,
  type ComponentCategory,
  type ComponentColour,
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
  // Cheapest build that passed every compatibility rule and was rejected ONLY
  // for price. "No build found" is unhelpful when the honest answer is "your
  // budget is RM39 short".
  cheapestOverBudget: PriceEstimate | null;
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

  // A kit anchor narrows the candidate space before assembly; it never touches
  // validation, so anchored builds pass the same rule engine as any other.
  const anchoredPreparation = request.kitId
    ? anchorPreparationToKit(preparation, request.kitId, catalogComponents)
    : preparation;

  const deterministicResult = createRecommendationResult(extraction, {
    catalogComponents,
    preparation: anchoredPreparation,
    maxRecommendations: options.maxRecommendations,
  });

  return enhanceRecommendationResultWithOpenAI(deterministicResult, {
    client: options.explanationClient,
    model: options.explanationModel,
    maxOutputTokens: options.explanationMaxOutputTokens,
  });
}

// Categories that structurally belong to a kit (metadata.kitLock). Switches
// and keycaps stay intent-driven — the anchor only pins the kit itself.
const kitAnchoredCategories: readonly ComponentCategory[] = [
  "case",
  "pcb",
  "plate",
  "stabilizer",
];

// Pin recommendation assembly to one kit: the kit's own case becomes the only
// case candidate, the kit's other locked parts lead their categories, and
// parts locked to a DIFFERENT kit are dropped (the rule engine would reject
// them anyway). Unknown kit ids leave the preparation untouched.
function anchorPreparationToKit(
  preparation: IntentPreparation,
  kitId: string,
  catalogComponents: readonly KeyboardComponent[],
): IntentPreparation {
  const kitIdOf = (component: KeyboardComponent | undefined) => {
    const value = component?.metadata?.kitId;

    return typeof value === "string" ? value : undefined;
  };
  const isKitLocked = (component: KeyboardComponent | undefined) =>
    component?.metadata?.kitLock === true;

  const componentsById = new Map(
    catalogComponents.map((component) => [component.id, component]),
  );
  const kitPartIdsByCategory = new Map<ComponentCategory, string[]>();

  for (const component of catalogComponents) {
    if (isKitLocked(component) && kitIdOf(component) === kitId) {
      const ids = kitPartIdsByCategory.get(component.category) ?? [];
      ids.push(component.id);
      kitPartIdsByCategory.set(component.category, ids);
    }
  }

  if (!kitPartIdsByCategory.has("case")) {
    return preparation;
  }

  const candidateComponentIds = { ...preparation.candidateComponentIds };

  for (const category of kitAnchoredCategories) {
    const ownPartIds = kitPartIdsByCategory.get(category) ?? [];

    if (category === "case") {
      candidateComponentIds.case = ownPartIds;
      continue;
    }

    const remainingIds = (candidateComponentIds[category] ?? []).filter(
      (candidateId) => {
        const candidate = componentsById.get(candidateId);

        return (
          !ownPartIds.includes(candidateId) &&
          (!isKitLocked(candidate) || kitIdOf(candidate) === kitId)
        );
      },
    );

    candidateComponentIds[category] = [...ownPartIds, ...remainingIds];
  }

  return { ...preparation, candidateComponentIds };
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
      cheapestOverBudget: null,
    };
  }

  const recommendations: ValidatedRecommendationBuild[] = [];
  const rejectionReasons = new Set<string>();
  let rejectedBuildCount = 0;
  let attempts = 0;
  let cheapestOverBudget: PriceEstimate | null = null;

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

      if (
        recommendation.estimatedPrice !== null &&
        recommendation.estimatedPriceCurrency !== null &&
        (cheapestOverBudget === null ||
          recommendation.estimatedPrice < cheapestOverBudget.amount)
      ) {
        cheapestOverBudget = {
          amount: recommendation.estimatedPrice,
          currency: recommendation.estimatedPriceCurrency,
        };
      }

      continue;
    }

    recommendations.push(recommendation);
  }

  return {
    recommendations: diversifyByCase(
      recommendations.sort((left, right) =>
        compareRecommendations(left, right, intent),
      ),
      maxRecommendations,
    ),
    rejectedBuildCount,
    rejectionExplanations: [...rejectionReasons].slice(0, 4),
    cheapestOverBudget,
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

/**
 * Colourway ranking (UAT finding 1).
 *
 * A tester asked for a "purple and blue themed" build and got keycaps
 * unrelated to any colour. Colour now reorders candidates — it never filters
 * them, and it is never a compatibility concern. Three properties this
 * function is built to guarantee:
 *
 *   NO-OP WITHOUT A COLOUR REQUEST. Returns 0 when intent.colour is null or
 *   empty, so every ranking for a colour-free prompt is bit-identical to
 *   before this feature existed. That is what protects the pre-existing tests,
 *   and the before/after screenshots taken with colour-free prompts.
 *
 *   ABSENT TAGS ARE NO SIGNAL. An untagged component scores 0 — the same as a
 *   tagged component that does not match. Some catalog records genuinely have
 *   no recorded colourway, and ranking them below tagged records would encode
 *   how complete the metadata is rather than what the user asked for. It would
 *   also undermine the claim the after-shot makes: a case must rank up because
 *   it IS that colour, never because its rivals were penalised for lacking
 *   data.
 *
 *   MATCHES ONLY EVER ADD. Nothing is subtracted, so a colour request can
 *   never push a compatible build out of the result set. Compatibility remains
 *   the rule engine's sole authority; this only decides presentation order.
 *
 * Keycaps carry more weight than the case because they are the dominant
 * visible colour of a built board, and because keycaps are a free choice while
 * a case is usually kit-locked — reordering keycaps is the more actionable
 * response to an aesthetic request.
 */
const COLOUR_WEIGHT_KEYCAP = 24;
const COLOUR_WEIGHT_CASE = 12;

function scoreColourFit(
  recommendation: ValidatedRecommendationBuild,
  intent: ExtractedKeyboardIntent,
) {
  const requested = intent.colour;

  if (!requested || requested.length === 0) return 0;

  const { components } = recommendation;

  return (
    scoreComponentColour(components.keycap, requested, COLOUR_WEIGHT_KEYCAP) +
    scoreComponentColour(components.case, requested, COLOUR_WEIGHT_CASE)
  );
}

function scoreComponentColour(
  component: KeyboardComponent,
  requested: readonly ComponentColour[],
  weight: number,
) {
  const tags = getComponentColours(component);

  // Untagged, or tagged but unrelated: no signal either way.
  if (tags.length === 0) return 0;

  const matched = requested.filter((colour) => tags.includes(colour)).length;

  if (matched === 0) return 0;

  // Proportional, so "purple and blue" ranks a purple-and-blue set above one
  // that is merely purple, rather than treating any single hit as a full match.
  return Math.round((matched / requested.length) * weight);
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

  score += scoreColourFit(recommendation, intent);
  score += scoreConstraintFit(recommendation, intent);
  score += scoreUseCaseFit(recommendation, intent);
  score += scoreBeginnerFit(recommendation, intent);
  score += scoreBudgetFit(recommendation, intent);
  score += scoreConnectionFit(recommendation, intent);
  score += scoreCatalogConfidence(recommendation);

  score -= recommendation.warnings.length * 10;

  return score;
}

/**
 * Three results that differ only by switch read as one recommendation, not
 * three. Take the best build per case first (so the ranking still decides which
 * build represents each case), then backfill from what is left if the catalog
 * cannot offer enough distinct cases.
 */
function diversifyByCase(
  ranked: ValidatedRecommendationBuild[],
  limit: number,
) {
  const picked: ValidatedRecommendationBuild[] = [];
  const usedCaseIds = new Set<string>();

  for (const recommendation of ranked) {
    if (picked.length >= limit) break;

    const caseId = recommendation.components.case.id;

    if (!usedCaseIds.has(caseId)) {
      usedCaseIds.add(caseId);
      picked.push(recommendation);
    }
  }

  for (const recommendation of ranked) {
    if (picked.length >= limit) break;
    if (!picked.includes(recommendation)) picked.push(recommendation);
  }

  return picked;
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

  // Deliberately short and plain. The raw per-combination rejection strings
  // ("X uses plate_mount, but Y does not support that stabilizer type") are
  // engine diagnostics — accurate, but they read as a wall of internal jargon to
  // someone who just typed a sentence. They stay available on the result for
  // debugging; what surfaces here is one reason and one next step.
  //
  // The suggestion is intentionally NOT included: the UI renders it separately,
  // and returning it here printed it twice.
  const nearMiss = buildBudgetNearMiss(intent, assembly.cheapestOverBudget);

  if (nearMiss) {
    return ["We couldn't find a build inside that budget.", nearMiss];
  }

  return [
    "We couldn't put together a complete build for that from the current catalog.",
    ...buildNoBuildBlockers(intent, assembly.rejectionExplanations).slice(0, 1),
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

/**
 * Honour material and descriptive words the user actually typed ("aluminium",
 * "brass", "plastic"). These live in intent.constraints and previously reached
 * nothing: cases are exempt from the free-text candidate filter, so an aluminium
 * request could be answered with a plastic case and lose no points for it.
 * Scoring — not filtering — keeps the pool wide while making the match matter.
 */
function scoreConstraintFit(
  recommendation: ValidatedRecommendationBuild,
  intent: ExtractedKeyboardIntent,
) {
  if (intent.constraints.length === 0) {
    return 0;
  }

  const materialWords = intent.constraints
    .join(" ")
    .toLowerCase()
    .match(
      /\b(aluminium|aluminum|brass|steel|plastic|abs|polycarbonate|pom|fr4|carbon fibre|carbon fiber|wood)\b/g,
    );

  if (!materialWords || materialWords.length === 0) {
    return 0;
  }

  const describes = (component: KeyboardComponent) =>
    `${component.name} ${component.description ?? ""}`.toLowerCase();

  const caseText = describes(recommendation.components.case);
  const plateText = describes(recommendation.components.plate);

  let score = 0;

  for (const word of new Set(materialWords)) {
    // "aluminium" and "aluminum" both have to hit the same catalog spelling.
    const needles = word.startsWith("alumin")
      ? ["aluminium", "aluminum"]
      : [word];

    if (needles.some((needle) => caseText.includes(needle))) score += 18;
    else if (needles.some((needle) => plateText.includes(needle))) score += 8;
    else score -= 12;
  }

  return score;
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
    // Hall-effect/magnetic is the default competitive-gaming answer: adjustable
    // actuation and rapid trigger are why it exists. Weighted at 30 so that with
    // no budget stated it outranks a mechanical gaming build, while a stated
    // budget still decides — an over-budget build takes -60 from scoreBudgetFit,
    // so under roughly RM300 a mechanical build correctly wins on price. An
    // explicit sound request also still wins, since switch sound is worth 28.
    const isMagnetic =
      recommendation.components.switch.switchTechnology === "hall_effect" &&
      recommendation.components.pcb.switchTechnologySupport.includes(
        "hall_effect",
      );

    return (
      (isMagnetic ? 30 : 0) +
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

/**
 * When every candidate build passed compatibility and failed only on price, say
 * so with the actual numbers. "No validated build found" hides the fact that the
 * catalog *does* have an answer and the budget is a little short.
 */
function buildBudgetNearMiss(
  intent: ExtractedKeyboardIntent,
  cheapestOverBudget: PriceEstimate | null,
) {
  const catalogBudget = normalizeBudgetForCatalogPricing(intent.budget);

  if (
    !cheapestOverBudget ||
    !catalogBudget ||
    cheapestOverBudget.currency !== catalogBudget.currency
  ) {
    return null;
  }

  const shortfall = Math.ceil(cheapestOverBudget.amount - catalogBudget.amount);

  if (shortfall <= 0) {
    return null;
  }

  return `The closest complete build comes to ${formatPrice(cheapestOverBudget)} — about ${formatPrice(
    { amount: shortfall, currency: cheapestOverBudget.currency },
  )} over your budget. Raising the budget to around ${formatPrice({
    amount: Math.ceil(cheapestOverBudget.amount),
    currency: cheapestOverBudget.currency,
  })} would let it through.`;
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
      "The builds that would work come out above your budget.",
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
      "Nothing in the catalog currently matches that combination of preferences.",
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
    return "Everything that fits comes out over budget. Try raising the budget, or relaxing the layout or sound preference.";
  }

  if (intent.switchTechnology && intent.switchTechnology !== "mechanical") {
    return "Try an MX mechanical build first; optical, Hall effect, and Topre paths need compatible boards in the catalog before they can be recommended.";
  }

  return "Try adding a detail or two — a layout, a budget, or how it should sound — and I'll look again.";
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
