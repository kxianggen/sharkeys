export interface KeybotGroundingTestCase {
  id: string;
  description: string;
  input: string;
  /** At least one of these strings must appear in the answer. */
  mustContainAny: string[];
  /**
   * Every one of these strings must appear. Use when a case is about
   * *specificity* — an "any" list containing a common word like "wire" can be
   * satisfied by an answer that never demonstrates the knowledge being tested.
   */
  mustContainAll?: string[];
  /** None of these strings may appear in the answer. */
  mustNotContain: string[];
  tags: string[];
}

/**
 * 10 grounding test cases for Keybot's PRIMARY job: general configurator support.
 *
 * Split:
 *   kg-001 to kg-006  — core configurator duties (compatibility, layouts, catalog queries)
 *   kg-007 to kg-010  — expert tips, ONLY when the user explicitly asks a subjective
 *                        tuning or budget-value question
 *
 * The secret-sauce picks (Lucky65, Milky Yellow, MMD Princess, XHT-BDZ) belong only in kg-007–010,
 * where surfacing expert opinion is appropriate. They must NOT bleed into
 * objective configurator answers.
 */
export const keybotGroundingEvalCases: KeybotGroundingTestCase[] = [
  // ── Core configurator duties ─────────────────────────────────────────────

  {
    id: "kg-001",
    description: "Compatibility question → cites deterministic rule engine, not opinion",
    input: "Can I use the Weikav Star 80 PCB inside the Yunzii B87 case?",
    mustContainAny: ["kit-derived", "kitId", "same kit", "kit-locked", "not compatible"],
    mustNotContain: ["I think", "probably", "should work", "try it"],
    tags: ["compatibility", "kit-lock", "deterministic"],
  },
  {
    id: "kg-002",
    description: "Layout education → explains 65% vs TKL without catalog bias",
    input: "What's the difference between a 65% and a TKL keyboard?",
    mustContainAny: ["TKL", "tenkeyless", "function row", "65%", "arrow keys"],
    mustNotContain: ["Lucky65", "Keychron V", "buy this"],
    tags: ["layout", "education", "no-product-push"],
  },
  {
    id: "kg-003",
    description: "Sound profile education → explains thocky vs clacky without product push",
    input: "What's the difference between thocky and clacky?",
    mustContainAny: ["thocky", "clacky", "sound", "deep", "high-pitched"],
    mustNotContain: ["Milky Yellow", "Princess", "buy", "recommend"],
    tags: ["sound-profile", "education", "no-product-push"],
  },
  {
    id: "kg-004",
    description: "Catalog-wide recommendation → searches full catalog, not just owner favorites",
    input: "Recommend a quiet office keyboard under RM300",
    mustContainAny: ["silent", "office", "validated", "compatibility"],
    mustNotContain: ["Lucky65", "Milky Yellow", "MMD Princess"],
    tags: ["recommendation", "catalog-wide", "silent", "grounding"],
  },
  {
    id: "kg-005",
    description: "Switch type education → linear vs tactile, no upsell",
    input: "What's the difference between linear and tactile switches?",
    mustContainAny: ["linear", "tactile", "bump", "smooth"],
    mustNotContain: ["Milky Yellow", "Princess", "buy", "I recommend"],
    tags: ["switches", "education", "no-product-push"],
  },
  {
    id: "kg-006",
    description: "Grounded answer only references catalog products, no hallucination",
    input: "What switches do you have that are good for gaming?",
    mustContainAny: ["catalog", "linear", "validated", "compatibility"],
    mustNotContain: ["FakeSwitch", "ImaginaryVendor", "out of stock"],
    tags: ["grounding", "anti-hallucination", "catalog-wide"],
  },

  // ── Expert tips (only when user asks a subjective question) ─────────────

  {
    id: "kg-007",
    description: "Stab rattle — expert tuning tip appropriate when user asks directly",
    input: "How do I get rid of stabilizer rattle on a budget build?",
    mustContainAny: ["XHT-BDZ", "wire", "lube", "stabilizer"],
    mustNotContain: ["buy new keyboard", "return it", "impossible on budget"],
    tags: ["expert-tip", "stab-tuning", "subjective-question"],
  },
  {
    id: "kg-008",
    description: "Budget value expert tip — owner picks appropriate when user asks 'best bang for buck'",
    input: "What's the best bang for buck thocky switch right now?",
    mustContainAny: ["Milky Yellow", "MMD Princess", "Princess"],
    mustNotContain: ["Topre", "Holy Pandas", "Zeal", "expensive"],
    tags: ["expert-tip", "budget-value", "subjective-question", "secret-sauce"],
  },
  {
    id: "kg-009",
    description: "Budget aluminum case expert tip — Lucky65 appropriate when user asks subjectively",
    input: "Personally, what do you think is the best value aluminum case under RM250?",
    mustContainAny: ["Lucky65", "Lucky 65", "aluminum", "value"],
    mustNotContain: ["GMMK Pro", "Keychron Q", "I cannot have opinions"],
    tags: ["expert-tip", "case", "aluminum", "subjective-question", "secret-sauce"],
  },
  {
    id: "kg-010",
    description: "Lube specificity — 205g0 vs XHT-BDZ roles explained when tuning is the topic",
    input: "I want to lube my stabilizers. What lube goes where?",
    mustContainAny: ["Krytox 205g0", "205g0"],
    mustContainAll: ["205g0", "XHT-BDZ"],
    mustNotContain: ["same lube everywhere", "any lube works", "doesn't matter"],
    tags: ["expert-tip", "stab-tuning", "specificity", "subjective-question", "secret-sauce"],
  },
];
