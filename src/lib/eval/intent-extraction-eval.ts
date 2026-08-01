import type { ExtractedKeyboardIntent } from "@/lib/ai";
import type { ComponentColour } from "@/lib/types";

export type EvalPersona =
  | "budget_gamer_thocky"
  | "budget_gamer_creamy"
  | "office_thocky"
  | "office_creamy"
  | "office_silent"
  | "aluminum_seeker"
  | "plastic_budget"
  | "wireless_seeker"
  | "colourway_seeker";

export interface IntentExtractionTestCase {
  id: string;
  persona: EvalPersona;
  input: string;
  expectedIntent: Partial<ExtractedKeyboardIntent>;

  /**
   * Colour expectation, deliberately OUTSIDE expectedIntent.
   *
   * Kept separate because these cases were written BEFORE
   * extractedKeyboardIntentSchema had a colour field, and had to run and fail
   * against a schema that did not know about colour. Retained in this shape
   * now the field exists, so the three-state distinction below stays explicit
   * rather than being folded into Partial<ExtractedKeyboardIntent>, where
   * "key absent" and "declared null" would be indistinguishable.
   *
   * Three states, and the distinction matters:
   *   undefined  — not declared. Skipped entirely, which is what keeps the
   *                original 50 cases untouched by construction rather than by
   *                good intentions.
   *   null       — declared as "no colour expected". Asserts the extractor
   *                returned nothing. These are the hallucination controls.
   *   array      — asserted per colourMatch below.
   */
  expectedColour?: ComponentColour[] | null;

  /**
   * "contains" (default) passes if every expected colour is present, ignoring
   * extras. That tests recall but not precision — an extractor returning all
   * twelve colours for every prompt would score 100%.
   *
   * "exact" asserts set equality, and is used where the correct answer is
   * unambiguous ("all black keyboard" means exactly black). It is stricter
   * than a forbidden-colour list, since it rejects any extra tag rather than
   * enumerated ones. Reserve "contains" for genuinely vague or multi-colour
   * prompts, where an exhaustive expected set could not be justified.
   */
  colourMatch?: "exact" | "contains";

  tags: string[];
}

export const intentExtractionEvalCases: IntentExtractionTestCase[] = [
  // ── Budget Gamer + Thocky (~40% of real buyers) ──────────────────────────
  {
    id: "bgt-001",
    persona: "budget_gamer_thocky",
    input: "Bro, got RM200 budget, want thocky aluminum for Valorant",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "gaming",
    },
    tags: ["malay-slang", "thocky", "gaming", "myr", "aluminum"],
  },
  {
    id: "bgt-002",
    persona: "budget_gamer_thocky",
    input: "Gaming keyboard thocky sound RM250 max",
    expectedIntent: {
      budget: { amount: 250, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "gaming",
    },
    tags: ["thocky", "gaming", "myr"],
  },
  {
    id: "bgt-003",
    persona: "budget_gamer_thocky",
    input: "Need keyboard for FPS games, want that deep thock sound, budget around RM200",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "gaming",
    },
    tags: ["fps", "thocky", "gaming", "myr"],
  },
  {
    id: "bgt-004",
    persona: "budget_gamer_thocky",
    input: "Apa keyboard best untuk gaming under RM200 yang thocky?",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "gaming",
    },
    tags: ["malay", "thocky", "gaming", "myr"],
  },
  {
    id: "bgt-005",
    persona: "budget_gamer_thocky",
    input: "Bro recommend keyboard gaming thocky RM150 boleh?",
    expectedIntent: {
      budget: { amount: 150, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "gaming",
    },
    tags: ["malay-slang", "thocky", "gaming", "budget-plastic-tier"],
  },
  {
    id: "bgt-006",
    persona: "budget_gamer_thocky",
    input: "I play Valorant and CSGO, want thocky keyboard, got RM200",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "gaming",
    },
    tags: ["game-title", "thocky", "gaming", "myr"],
  },
  {
    id: "bgt-007",
    persona: "budget_gamer_thocky",
    input: "Gaming keyboard heavy thock, budget RM200 to RM250",
    expectedIntent: {
      budget: { amount: 250, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "gaming",
    },
    tags: ["range-budget", "thocky", "gaming"],
  },

  // ── Budget Gamer + Creamy (~25% of real buyers) ──────────────────────────
  {
    id: "bgc-001",
    persona: "budget_gamer_creamy",
    input: "Looking for creamy linear keyboard for gaming, around RM200",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "creamy",
      useCase: "gaming",
    },
    tags: ["creamy", "linear", "gaming", "myr"],
  },
  {
    id: "bgc-002",
    persona: "budget_gamer_creamy",
    input: "Want smooth creamy switches for gaming bro, RM200 budget",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "creamy",
      useCase: "gaming",
    },
    tags: ["malay-slang", "creamy", "gaming", "myr"],
  },
  {
    id: "bgc-003",
    persona: "budget_gamer_creamy",
    input: "Keyboard gaming creamy feel, budget RM180",
    expectedIntent: {
      budget: { amount: 180, currency: "MYR", label: "budget" },
      soundProfile: "creamy",
      useCase: "gaming",
    },
    tags: ["creamy", "gaming", "myr"],
  },
  {
    id: "bgc-004",
    persona: "budget_gamer_creamy",
    input: "Best creamy 65% for gaming under RM250",
    expectedIntent: {
      budget: { amount: 250, currency: "MYR", label: "budget" },
      soundProfile: "creamy",
      useCase: "gaming",
      layout: "65",
    },
    tags: ["creamy", "gaming", "65pct", "myr"],
  },
  {
    id: "bgc-005",
    persona: "budget_gamer_creamy",
    input: "Keyboard yang buttery smooth for gaming, RM200 ada tak?",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "creamy",
      useCase: "gaming",
    },
    tags: ["malay", "creamy", "gaming", "semantic-gap"],
  },

  // ── Office + Thocky (~20% of real buyers) ────────────────────────────────
  {
    id: "ot-001",
    persona: "office_thocky",
    input: "Office keyboard thocky but not too loud, RM200",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "office",
    },
    tags: ["office", "thocky", "myr"],
  },
  {
    id: "ot-002",
    persona: "office_thocky",
    input: "Looking for thocky keyboard for WFH, budget RM200-250",
    expectedIntent: {
      budget: { amount: 250, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "office",
    },
    tags: ["wfh", "thocky", "office", "myr"],
  },
  {
    id: "ot-003",
    persona: "office_thocky",
    input: "Want keyboard that sounds thocky for office use, around RM200",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "office",
    },
    tags: ["office", "thocky", "myr"],
  },
  {
    id: "ot-004",
    persona: "office_thocky",
    input: "Suggest me a good thocky keyboard for typing at work, RM250 max",
    expectedIntent: {
      budget: { amount: 250, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "office",
    },
    tags: ["office", "thocky", "typing", "myr"],
  },

  // ── Office + Creamy (~15% of real buyers) ────────────────────────────────
  {
    id: "oc-001",
    persona: "office_creamy",
    input: "Creamy typing keyboard for office, budget RM200",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "creamy",
      useCase: "office",
    },
    tags: ["office", "creamy", "typing", "myr"],
  },
  {
    id: "oc-002",
    persona: "office_creamy",
    input: "Hi looking for creamy office board, RM200 budget",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "creamy",
      useCase: "office",
    },
    tags: ["office", "creamy", "myr"],
  },
  {
    id: "oc-003",
    persona: "office_creamy",
    input: "Something creamy and smooth for office typing, under RM250",
    expectedIntent: {
      budget: { amount: 250, currency: "MYR", label: "budget" },
      soundProfile: "creamy",
      useCase: "office",
    },
    tags: ["office", "creamy", "myr"],
  },

  // ── Quiet / Silent (~10% of real buyers) ─────────────────────────────────
  {
    id: "s-001",
    persona: "office_silent",
    input: "Quiet keyboard for office, boss keeps complaining about noise, RM200",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "silent",
      useCase: "office",
    },
    tags: ["office", "silent", "myr"],
  },
  {
    id: "s-002",
    persona: "office_silent",
    input: "Need silent keyboard RM200 budget, work in open office",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "silent",
      useCase: "office",
    },
    tags: ["office", "silent", "myr"],
  },
  {
    id: "s-003",
    persona: "office_silent",
    input: "Paling quiet keyboard ada, budget RM150",
    expectedIntent: {
      budget: { amount: 150, currency: "MYR", label: "budget" },
      soundProfile: "silent",
    },
    tags: ["malay", "silent", "budget-plastic-tier"],
  },
  {
    id: "s-004",
    persona: "office_silent",
    input: "Silent switches keyboard for library use, RM200",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "silent",
    },
    tags: ["silent", "myr"],
  },

  // ── Aluminum / Lucky65 seeker ─────────────────────────────────────────────
  {
    id: "al-001",
    persona: "aluminum_seeker",
    input: "Bro I heard Lucky65 is good, got RM250 budget for thocky aluminum",
    expectedIntent: {
      budget: { amount: 250, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
    },
    tags: ["lucky65", "aluminum", "thocky", "myr", "product-aware"],
  },
  {
    id: "al-002",
    persona: "aluminum_seeker",
    input: "Want aluminum case keyboard, thocky sound, budget RM250",
    expectedIntent: {
      budget: { amount: 250, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
    },
    tags: ["aluminum", "thocky", "myr"],
  },
  {
    id: "al-003",
    persona: "aluminum_seeker",
    input: "Lucky65 setup thocky RM200-250 boleh recommend?",
    expectedIntent: {
      budget: { amount: 250, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
    },
    tags: ["lucky65", "malay", "aluminum", "thocky"],
  },

  // ── Plastic budget tier (RM100–150) ───────────────────────────────────────
  {
    id: "pb-001",
    persona: "plastic_budget",
    input: "Very budget keyboard thocky, around RM100 to RM150, student",
    expectedIntent: {
      budget: { amount: 150, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
    },
    tags: ["budget-plastic-tier", "thocky", "student", "myr"],
  },
  {
    id: "pb-002",
    persona: "plastic_budget",
    input: "Cheapest thocky keyboard under RM150, anything good?",
    expectedIntent: {
      budget: { amount: 150, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
    },
    tags: ["budget-plastic-tier", "thocky", "myr"],
  },

  // ── Wireless / layout-specific ────────────────────────────────────────────
  {
    id: "ws-001",
    persona: "wireless_seeker",
    input: "Wireless thocky keyboard RM250 budget, 65% layout",
    expectedIntent: {
      budget: { amount: 250, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      layout: "65",
    },
    tags: ["wireless", "thocky", "65pct", "myr"],
  },

  // ── Sound-test closer (the conversion pattern) ────────────────────────────
  {
    id: "nt-001",
    persona: "budget_gamer_thocky",
    input: "Sound test dulu boleh? Looking for thocky gaming keyboard RM200 budget 65%",
    expectedIntent: {
      budget: { amount: 200, currency: "MYR", label: "budget" },
      soundProfile: "thocky",
      useCase: "gaming",
      layout: "65",
    },
    tags: ["sound-test-closer", "malay-slang", "gaming", "65pct", "myr"],
  },

  // ══ UAT finding 1: colourway intent ═════════════════════════════════════
  //
  // A tester asked for a "purple and blue themed" build and received keycaps
  // unrelated to any colour. Aesthetic intent was dropped entirely — there was
  // no colour field anywhere in the pipeline.
  //
  // These cases are added BEFORE the fix, and fail on purpose. They are
  // reported as three separate claims, never as one series, because the
  // instrument changes between the baseline and the after-state:
  //
  //   Capability  col-001..004, col-008   0/5 -> 5/5
  //   Control A   col-005..007            3/3 -> 3/3   (no hallucination)
  //   Control B   the original 50 cases   unchanged    (no regression)
  //
  // Control A cases pass at baseline, and that is correct: with no colour
  // field in the schema, nothing can be hallucinated yet. A control earns its
  // place by NOT moving.

  // ── Capability: colour is stated explicitly ───────────────────────────────
  {
    // The tester's exact phrasing. Do not paraphrase — this is the finding.
    id: "col-001",
    persona: "colourway_seeker",
    input: "purple and blue themed",
    expectedIntent: {},
    expectedColour: ["purple", "blue"],
    colourMatch: "exact",
    tags: ["uat-finding-1", "colour", "tester-verbatim", "multi-colour"],
  },
  {
    id: "col-002",
    persona: "colourway_seeker",
    input: "all black keyboard",
    expectedIntent: {},
    expectedColour: ["black"],
    // "all black" admits exactly one answer, so extras are a precision failure.
    colourMatch: "exact",
    tags: ["uat-finding-1", "colour", "single-colour", "precision"],
  },
  {
    id: "col-003",
    persona: "colourway_seeker",
    input: "pastel build",
    expectedIntent: {},
    // Vague: a pastel request may legitimately also surface pink or beige, so
    // an exhaustive expected set could not be defended. Containment only.
    expectedColour: ["pastel"],
    colourMatch: "contains",
    tags: ["uat-finding-1", "colour", "vague", "family-term"],
  },
  {
    id: "col-004",
    persona: "colourway_seeker",
    input: "something colourful",
    expectedIntent: {},
    expectedColour: ["multi"],
    colourMatch: "contains",
    tags: ["uat-finding-1", "colour", "vague", "british-spelling"],
  },

  // ── Control A: adversarial hallucination guards ───────────────────────────
  //
  // Colour-free prompts that BAIT a colour tag. A guard using a plainly
  // colour-free prompt ("thocky keyboard under RM250") could not fail and
  // would prove nothing. Each of these targets a different way the keyword
  // fallback could wrongly fire.
  {
    id: "col-005",
    persona: "aluminum_seeker",
    // "silver" is in the vocabulary and aluminium is a material, not a colour.
    // Forces the fallback to exclude material words rather than substring its
    // way into a colour tag. The strongest guard in the set.
    input: "aluminium case, premium feel",
    expectedIntent: {},
    expectedColour: null,
    tags: ["uat-finding-1", "colour-control", "material-not-colour"],
  },
  {
    id: "col-006",
    persona: "colourway_seeker",
    // Chromatic language naming no specific colour. "multi" is in the
    // vocabulary, so this is the guard most likely to trip.
    input: "shine-through keycaps for RGB",
    expectedIntent: {},
    expectedColour: null,
    tags: ["uat-finding-1", "colour-control", "chromatic-but-colourless"],
  },
  {
    id: "col-007",
    persona: "colourway_seeker",
    // Appearance terms with no vocabulary entry; should fall out as no colour.
    input: "clear transparent housing",
    expectedIntent: {},
    expectedColour: null,
    tags: ["uat-finding-1", "colour-control", "appearance-not-colour"],
  },

  // ── Capability: colour alongside other attributes ─────────────────────────
  {
    // The only case testing colour WITH layout, use case and budget. This is
    // the realistic user phrasing and the place interference would appear: if
    // colour extraction degrades budget or layout parsing, this catches it.
    //
    // At baseline it must fail on colour ONLY. If its baseline notes show any
    // other field failing, it is removed from the capability count (which then
    // reads 0/4 -> 4/4) and reported separately as an integration observation
    // with the unrelated failure named. A contaminated case inside a headline
    // number is worse than no case at all.
    id: "col-008",
    persona: "colourway_seeker",
    input: "purple 65% keyboard for gaming under RM300",
    expectedIntent: {
      budget: { amount: 300, currency: "MYR", label: "budget" },
      layout: "65",
      useCase: "gaming",
    },
    expectedColour: ["purple"],
    colourMatch: "contains",
    tags: ["uat-finding-1", "colour", "integration", "65pct", "gaming", "myr"],
  },
];
