import type { ExtractedKeyboardIntent } from "@/lib/ai";

export type EvalPersona =
  | "budget_gamer_thocky"
  | "budget_gamer_creamy"
  | "office_thocky"
  | "office_creamy"
  | "office_silent"
  | "aluminum_seeker"
  | "plastic_budget"
  | "wireless_seeker";

export interface IntentExtractionTestCase {
  id: string;
  persona: EvalPersona;
  input: string;
  expectedIntent: Partial<ExtractedKeyboardIntent>;
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
];
