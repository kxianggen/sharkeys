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
    candidateComponentIds: ensureStructuralPairing(
      candidateComponentIds,
      components,
    ),
  });
}

/**
 * Guarantees the case pool can actually pair with the PCB and plate pools.
 *
 * Each category is searched independently and then capped, so it is possible
 * for every candidate case to be structurally incompatible with every candidate
 * PCB — yielding zero validated builds from a catalog that definitely contains
 * a working combination.
 *
 * Observed with "clacky/clicky keyboard": the only clacky case is tray-mount and
 * non-kit, which narrowed the case pool to exactly that one, while the PCB pool
 * fell back to catalog order and filled its six slots with gasket-mount kit PCBs
 * before reaching either tray-mount PCB. Every combination then failed
 * `case_pcb_mount_mismatch`.
 *
 * This is the mirror of `excludeIncompleteKitStructures`: that one removes parts
 * that can never validate, this one adds back parts without which nothing can.
 * It is a strict no-op whenever the existing pools can already pair, so it
 * cannot perturb queries that already work.
 */
function ensureStructuralPairing(
  candidateComponentIds: ComponentCandidateIdsByCategory,
  components?: readonly KeyboardComponent[],
): ComponentCandidateIdsByCategory {
  const catalog = components ?? keyboardComponents;
  const byId = new Map(catalog.map((component) => [component.id, component]));

  const caseCandidates = candidateComponentIds.case
    .map((id) => byId.get(id))
    .filter(
      (component): component is Extract<KeyboardComponent, { category: "case" }> =>
        component?.category === "case",
    );

  if (caseCandidates.length === 0) {
    return candidateComponentIds;
  }

  const repaired = { ...candidateComponentIds };

  for (const category of ["pcb", "plate"] as const) {
    const current = candidateComponentIds[category];
    const pairsAlready = current.some((id) => {
      const partner = byId.get(id);

      return (
        partner !== undefined &&
        caseCandidates.some((keyboardCase) =>
          canPairStructurally(keyboardCase, partner),
        )
      );
    });

    if (pairsAlready) {
      continue;
    }

    const rescued = catalog
      .filter(
        (component) =>
          component.category === category &&
          !current.includes(component.id) &&
          caseCandidates.some((keyboardCase) =>
            canPairStructurally(keyboardCase, component),
          ),
      )
      .slice(0, structuralRescueLimit)
      .map((component) => component.id);

    if (rescued.length > 0) {
      repaired[category] = [...rescued, ...current].slice(
        0,
        maxCandidatesPerCategory,
      );
    }
  }

  // Second pass: a PCB that fits the case is not enough — it also has to accept
  // a candidate switch. Observed with "clacky gaming keyboard": the only
  // clacky-tagged case is the tray-mount GH60, and the hall-effect PCB fits it,
  // so the pass above was satisfied. But that PCB takes magnetic switches only,
  // while the clacky switch pool is mechanical, so every build died on switch
  // technology and the MX PCB that would have worked was never pulled in.
  const resolve = (ids: readonly string[]) =>
    ids.map((id) => byId.get(id)).filter((c): c is KeyboardComponent => !!c);

  const switchCandidates = resolve(repaired.switch).filter(
    (c) => c.category === "switch",
  );
  const pcbCandidates = resolve(repaired.pcb).filter((c) => c.category === "pcb");

  const pcbAcceptsASwitch = pcbCandidates.some((pcb) =>
    pcb.category === "pcb" &&
    switchCandidates.some(
      (sw) =>
        sw.category === "switch" &&
        pcb.switchTechnologySupport.includes(sw.switchTechnology),
    ),
  );

  if (!pcbAcceptsASwitch && switchCandidates.length > 0) {
    const rescuedPcbs = catalog
      .filter(
        (component) =>
          component.category === "pcb" &&
          !repaired.pcb.includes(component.id) &&
          caseCandidates.some((keyboardCase) =>
            canPairStructurally(keyboardCase, component),
          ) &&
          switchCandidates.some(
            (sw) =>
              sw.category === "switch" &&
              component.switchTechnologySupport.includes(sw.switchTechnology),
          ),
      )
      .slice(0, structuralRescueLimit)
      .map((component) => component.id);

    if (rescuedPcbs.length > 0) {
      repaired.pcb = [...rescuedPcbs, ...repaired.pcb].slice(
        0,
        maxCandidatesPerCategory,
      );
    }
  }

  // Third pass: the stabilizer pool must contain something a candidate PCB can
  // actually mount, at a layout the PCB supports. Kit stabilizers dominate
  // catalog order, so the aftermarket ones that fit many layouts get capped out.
  const stabilizerFits = resolve(repaired.stabilizer).some(
    (stabilizer) =>
      stabilizer.category === "stabilizer" &&
      resolve(repaired.pcb).some(
        (pcb) =>
          pcb.category === "pcb" &&
          pcb.stabilizerTypeSupport.includes(stabilizer.stabilizerType) &&
          pcb.layouts.some((layout) =>
            stabilizer.supportedLayouts.includes(layout),
          ),
      ),
  );

  if (!stabilizerFits) {
    const pcbs = resolve(repaired.pcb);
    const rescuedStabilizers = catalog
      .filter(
        (component) =>
          component.category === "stabilizer" &&
          !repaired.stabilizer.includes(component.id) &&
          pcbs.some(
            (pcb) =>
              pcb.category === "pcb" &&
              pcb.stabilizerTypeSupport.includes(component.stabilizerType) &&
              pcb.layouts.some((layout) =>
                component.supportedLayouts.includes(layout),
              ),
          ),
      )
      .slice(0, structuralRescueLimit)
      .map((component) => component.id);

    if (rescuedStabilizers.length > 0) {
      repaired.stabilizer = [
        ...rescuedStabilizers,
        ...repaired.stabilizer,
      ].slice(0, maxCandidatesPerCategory);
    }
  }

  return repaired;
}

const structuralRescueLimit = 2;

function canPairStructurally(
  keyboardCase: Extract<KeyboardComponent, { category: "case" }>,
  partner: KeyboardComponent,
) {
  const partnerMounts =
    partner.category === "pcb"
      ? partner.pcbMountSupport
      : partner.category === "plate"
        ? partner.plateMountSupport
        : undefined;

  if (!partnerMounts || partner.category === "switch") {
    return false;
  }

  const partnerLayouts = "layouts" in partner ? partner.layouts : undefined;

  if (!partnerLayouts) {
    return false;
  }

  const sharesMount = partnerMounts.some((mount) =>
    keyboardCase.caseMountSupport.includes(mount),
  );
  const sharesLayout = partnerLayouts.some((layout) =>
    keyboardCase.layouts.includes(layout),
  );

  if (!sharesMount || !sharesLayout) {
    return false;
  }

  // Kit-locked parts must belong to the same kit; a free part pairs with anything
  // it physically fits. This mirrors the rule engine's kit_structural_mismatch.
  const caseKitId = getKitId(keyboardCase);
  const partnerKitId = getKitId(partner);

  return !caseKitId || !partnerKitId || caseKitId === partnerKitId;
}

// Aesthetic categories are exempt from the free-text strict tier: use-case
// words like "office" or "gaming" describe how the keyboard is used, not what
// a keycap set or case is called, so a description that happens to contain the
// word would otherwise collapse the candidate pool to near-one (observed with
// keycaps). Structured criteria (layout, sound, budget) still apply, and the
// rule engine remains the only compatibility authority downstream.
const textQueryExemptCategories: ReadonlySet<ComponentCategory> = new Set([
  "keycap",
  "case",
]);

// Sound is decided by the SWITCH. A case tagged "creamy" still sounds clacky if
// you put clacky switches in it, so filtering cases and plates by sound profile
// throws away whole kits for no physical reason — "clacky gaming keyboard"
// removed every kit case from the pool and left only the one clacky-tagged case,
// making GMK67 + Kailh Box White unreachable even though it is a valid build.
// Ranking still prefers a matching case/plate (scoreRecommendation weights them),
// so this only changes what is *available*, never what is preferred.
const soundFilteredCategories: ReadonlySet<ComponentCategory> = new Set([
  "switch",
]);

function searchCandidateIds(
  category: ComponentCategory,
  criteria: IntentMatchingCriteria,
  components?: readonly KeyboardComponent[],
) {
  const soundProfile = soundFilteredCategories.has(category)
    ? criteria.soundProfile
    : undefined;
  const categoryCriteria: ComponentSearchCriteria = {
    category,
    query: textQueryExemptCategories.has(category) ? undefined : criteria.query,
    layout: criteria.layout,
    switchTechnology: criteria.switchTechnology,
    soundProfile,
    beginnerFriendly: criteria.beginnerFriendly,
    maxPrice: criteria.maxPrice,
    currency: criteria.currency,
  };

  const strictMatches = searchComponents(categoryCriteria, components);
  const relaxedMatches = searchComponents({
    category,
    layout: criteria.layout,
    switchTechnology: criteria.switchTechnology,
    soundProfile,
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

  // Re-run the pairing guard: replacing the switch pool wholesale can leave a
  // set of switches that no candidate PCB accepts (e.g. semantic search returns
  // only mechanical switches while the pool holds a hall-effect PCB), which is
  // exactly the coherence the guard exists to protect.
  return intentPreparationSchema.parse({
    ...base,
    candidateComponentIds: ensureStructuralPairing(
      {
        ...base.candidateComponentIds,
        switch: merged,
      },
      components,
    ),
  });
}

function buildQueryFromIntent(intent: ExtractedKeyboardIntent) {
  const terms = [
    intent.useCase !== "unknown" ? intent.useCase : undefined,
    ...intent.constraints,
  ].filter(Boolean);

  return terms.length > 0 ? terms.join(" ") : undefined;
}
