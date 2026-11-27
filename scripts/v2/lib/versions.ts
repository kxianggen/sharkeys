/**
 * Frozen measurement versions for the rest of v2 (HQ decision, 27 Nov 2026).
 *
 * Every later run (repeat baselines, WS1 "after", WS4 "after") uses
 * simulator-3 + rubric-v3, so before/after numbers are comparable.
 * tests/v2/frozen-eval.test.ts fails if these, or the files that implement
 * them, change. Changing them needs HQ approval and a new baseline.
 *
 * Simulator history:
 *  simulator-1: smoke test and pilot.
 *  simulator-2: search reply mirrors the UI (build cards only, or the
 *    empty-state text), Meg's part chips are shown, accept needs an
 *    on-screen build. The persona is deliberately NOT told that chat can't
 *    change the builds panel: a real user isn't told either.
 *  simulator-3: the screen lists all six parts of each build, like the card.
 * (The first runs recorded these as "sim-v2"/"sim-v3"; see eval/v2/runs/README.md.)
 */
export const SIM_VERSION = "simulator-3";

/** Must equal RUBRIC_VERSION in ./judge.ts (checked by the freeze test). */
export const FROZEN_RUBRIC_VERSION = "rubric-v3";
