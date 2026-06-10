import type { ExtractedKeyboardIntent } from "@/lib/ai";
import type { KeyboardLayout, SoundProfile } from "@/lib/types";

export interface RagRetrievalTestCase {
  id: string;
  description: string;
  /** Structured intent passed directly to prepareIntentMatches / retrieval pipeline. */
  intent: ExtractedKeyboardIntent;
  assertions: {
    /** At least one of these switch IDs must appear in candidateComponentIds.switch. */
    switchCandidatesIncludeAny?: string[];
    /** Every switch candidate must have this sound profile. */
    switchCandidatesSoundProfile?: SoundProfile;
    /** Minimum number of switch candidates expected. */
    switchCandidatesMinCount?: number;
    /** All required component categories must have ≥1 candidate. */
    allCategoriesPopulated?: boolean;
    /** No switch candidate's per-unit price (MYR) should exceed this value. */
    switchPriceMaxMYR?: number;
    /** The case/PCB/plate candidates must all be compatible with this layout. */
    layoutCandidatesMatchLayout?: KeyboardLayout;
  };
  /**
   * If true, this test requires vector/semantic search to pass.
   * With keyword-only fallback it will fail — that is the BASELINE GAP we are measuring
   * before Phase 2 (pgvector). The runner marks these as "expected_fail" rather than error.
   */
  semanticOnly?: boolean;
  /**
   * If true, this test depends on catalog entries not yet in the seed data
   * (e.g. MZ Z1, KTT Cabbage Tofu). Marked "pending" until catalog is seeded.
   */
  futureWhenSeeded?: boolean;
}

function makeIntent(
  overrides: Partial<ExtractedKeyboardIntent>,
): ExtractedKeyboardIntent {
  return {
    budget: null,
    layout: null,
    soundProfile: null,
    useCase: "unknown",
    beginnerFriendly: null,
    switchTechnology: null,
    priorities: [],
    constraints: [],
    clarificationNeeded: false,
    clarificationQuestion: null,
    ...overrides,
  };
}

export const ragRetrievalEvalCases: RagRetrievalTestCase[] = [
  // ── Explicit sound-profile retrieval ────────────────────────────────────

  {
    id: "rr-001",
    description: "Thocky TKL intent → thocky switch candidates surface from catalog",
    intent: makeIntent({ soundProfile: "thocky", layout: "tkl", useCase: "gaming" }),
    assertions: {
      switchCandidatesIncludeAny: [
        "switch_gateron_oil_king",
        "switch_mmd_holy_panda_v3",
      ],
      switchCandidatesSoundProfile: "thocky",
      allCategoriesPopulated: true,
    },
  },
  {
    id: "rr-002",
    description: "Creamy 65% gaming intent → creamy switch candidates surface",
    intent: makeIntent({ soundProfile: "creamy", layout: "65", useCase: "gaming" }),
    assertions: {
      switchCandidatesIncludeAny: [
        "switch_gateron_milky_yellow_pro",
        "switch_gateron_seasalt_smoothie",
        "switch_akko_cream_yellow_v3_pro",
        "switch_mmd_princess_linear_v3",
      ],
      switchCandidatesSoundProfile: "creamy",
      allCategoriesPopulated: true,
    },
  },
  {
    id: "rr-003",
    description: "Silent office intent → silent switch candidates surface",
    intent: makeIntent({ soundProfile: "silent", useCase: "office" }),
    assertions: {
      switchCandidatesIncludeAny: [
        "switch_akko_penguin_silent",
        "switch_outemu_peach_silent_v2",
      ],
      switchCandidatesSoundProfile: "silent",
    },
  },

  // ── Layout filtering ─────────────────────────────────────────────────────

  {
    id: "rr-004",
    description: "65% layout constraint → only 65%-compatible PCB candidates returned",
    intent: makeIntent({ layout: "65", soundProfile: "creamy" }),
    assertions: {
      layoutCandidatesMatchLayout: "65",
      allCategoriesPopulated: true,
    },
  },

  // ── Build completeness ───────────────────────────────────────────────────

  {
    id: "rr-005",
    description: "Generic thocky gaming intent → all 6 component categories populated",
    intent: makeIntent({ soundProfile: "thocky", useCase: "gaming" }),
    assertions: {
      allCategoriesPopulated: true,
      switchCandidatesMinCount: 1,
    },
  },

  // ── Budget filtering ─────────────────────────────────────────────────────

  {
    id: "rr-006",
    description: "RM150 budget → switch candidates respect per-unit price cap",
    intent: makeIntent({
      soundProfile: "creamy",
      budget: { amount: 150, currency: "MYR", label: "budget" },
    }),
    assertions: {
      switchPriceMaxMYR: 150,
    },
  },

  // ── Semantic gap (baseline metrics — expected to fail with keyword search) ─

  {
    id: "rr-007",
    description:
      "Semantic gap: 'buttery smooth' does not resolve to creamy without vector search",
    intent: makeIntent({
      soundProfile: null,
      constraints: ["buttery smooth"],
    }),
    assertions: {
      switchCandidatesSoundProfile: "creamy",
    },
    semanticOnly: true,
  },
  {
    id: "rr-008",
    description:
      "Semantic gap: 'deep thud satisfying' does not resolve to thocky without vector search",
    intent: makeIntent({
      soundProfile: null,
      constraints: ["deep thud satisfying"],
    }),
    assertions: {
      switchCandidatesSoundProfile: "thocky",
    },
    semanticOnly: true,
  },

  // ── Future: expert secret-sauce combos (pending catalog seed) ────────────

  {
    id: "rr-009",
    description:
      "Expert combo: MZ Z1 surfaces as thocky budget switch (requires catalog seed)",
    intent: makeIntent({ soundProfile: "thocky" }),
    assertions: {
      switchCandidatesIncludeAny: ["switch_mz_z1"],
    },
    futureWhenSeeded: true,
  },
  {
    id: "rr-010",
    description:
      "Expert combo: KTT Cabbage Tofu surfaces as creamy budget switch (requires catalog seed)",
    intent: makeIntent({ soundProfile: "creamy" }),
    assertions: {
      switchCandidatesIncludeAny: ["switch_ktt_cabbage_tofu"],
    },
    futureWhenSeeded: true,
  },
];
