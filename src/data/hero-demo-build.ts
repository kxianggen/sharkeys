import type { ComponentCategory } from "@/lib/types";

/**
 * The build shown by the animated hero demo on the landing page.
 *
 * This is a RECORDING, not a live request. Running the real pipeline on every
 * landing-page view would mean an OpenAI call per visitor for a decorative
 * animation — slow, costly, and non-deterministic for something meant to replay
 * identically. So the result of one real run is frozen here.
 *
 * How it was produced (2026-07, via a one-off probe script since removed):
 *   prompt  → "Build me an office keyboard"
 *   source  → openai (the real extraction path, not the keyword fallback)
 *   result  → 3 validated builds; this is the top-ranked one
 *   valid   → true, 0 errors
 *
 * Why this prompt won out over the alternatives probed alongside it: it is the
 * only candidate whose explanation set is internally consistent. Adding "quiet"
 * to the prompt produces a build whose own explanations then argue with
 * themselves ("...is tagged silent, which matches" alongside "...sounds creamy,
 * which may not match"), which is honest engine output but reads as incoherent
 * in a hero. "quiet thocky ... under RM400" resolves to zero builds — quiet and
 * thocky pull against each other. The plain prompt is both the most natural
 * marketing copy and the cleanest result.
 *
 * IMPORTANT — only component IDs are stored, never names or descriptions.
 * Everything displayed is resolved from the live catalog at render time, so the
 * hero cannot drift out of sync with the real parts. The prices, names, and
 * swatches a visitor sees are the same ones the configurator would show.
 *
 * `tests/data/hero-demo-build.test.ts` re-runs these IDs through the rule
 * engine on every test run. If a catalog edit ever makes this build
 * incompatible, the suite fails rather than the landing page quietly
 * advertising a build that no longer works.
 */

export const HERO_DEMO_PROMPT = "Build me an office keyboard";

export const HERO_DEMO_COMPONENT_IDS: Record<ComponentCategory, string> = {
  case: "case_gmk67_65_plastic",
  pcb: "pcb_gmk67_65_hotswap",
  plate: "plate_gmk67_65_pc",
  switch: "switch_akko_penguin_silent",
  keycap: "keycap_unknown_pudding_oem_pbt",
  stabilizer: "stab_sp_star_plate_mount",
};

/**
 * Estimated total from the recorded run, in MYR. Kept only so the guard test
 * can detect catalog price drift — the UI recomputes from the live catalog
 * rather than displaying this number directly.
 *
 * Follows the same estimate semantics as the rest of the app: switch price is
 * multiplied by ~70 (a full board's worth), everything else counted once.
 */
export const HERO_DEMO_RECORDED_PRICE_MYR = 381;

/**
 * Switches assumed per board when estimating a total. Mirrors
 * `estimatedSwitchCount` in the recommendation service and the configurator.
 */
export const HERO_DEMO_SWITCH_COUNT = 70;

/**
 * Explanation lines exactly as the engine produced them for this build.
 *
 * These are verbatim output, not marketing copy — the hero's answer content is
 * real reasoning from the validation pipeline. The panel shows a subset; the
 * full set is kept so the source of what's displayed is auditable.
 */
export const HERO_DEMO_EXPLANATIONS = [
  "This build passed deterministic compatibility validation before being recommended.",
  "GMK67 65% Plastic Case, GMK67 65% Tri-Mode Hotswap PCB, and GMK67 65% Polycarbonate Plate share a compatible physical layout and mount path.",
  "Akko Penguin Silent Tactile Switch is an MX mechanical switch supported by GMK67 65% Tri-Mode Hotswap PCB; Pudding OEM PBT Keycaps and SP-Star Plate-Mounted Stabilizers match the validated layout requirements.",
  "Estimated total is MYR 381.00.",
  "Build compatibility passed all deterministic Phase 1 validation rules.",
] as const;
