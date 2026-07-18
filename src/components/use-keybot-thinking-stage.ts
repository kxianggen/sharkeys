import { useEffect, useState } from "react";

// Meg's backend is a LangGraph agent with real nodes: classify → extract →
// retrieve → validate → compose. It does not stream progress, so we cycle
// through labels that honestly map to those stages on a client-side timer
// while a reply is pending. These are NOT invented "thoughts" — each maps to
// a real pipeline stage:
//   "Understanding your question…" → classify + extract
//   "Searching the catalog…"       → retrieve
//   "Checking compatibility…"      → validate (rule engine)
//   "Writing a reply…"             → compose
export const KEYBOT_THINKING_STAGES = [
  "Understanding your question…",
  "Searching the catalog…",
  "Checking compatibility…",
  "Writing a reply…",
] as const;

// Steady label shown when the user prefers reduced motion (no cycling).
export const KEYBOT_THINKING_STEADY_LABEL = "Working on your reply…";

const STAGE_INTERVAL_MS = 1000;

/**
 * Returns the current thinking-stage label while a Meg reply is pending.
 *
 * Advances through {@link KEYBOT_THINKING_STAGES} on a timer, then holds on the
 * final stage ("Writing a reply…") until the reply arrives — it never loops
 * back to the first stage, which would read as fake. When the user prefers
 * reduced motion, a single steady label is returned instead of cycling.
 */
function readReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useKeybotThinkingStage(active: boolean): string {
  const [stageIndex, setStageIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(readReducedMotion);

  // Reset to the first stage each time a new reply starts (render-phase state
  // adjustment on the active transition — cheaper and cleaner than an effect).
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) {
      setStageIndex(0);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!active || reducedMotion) {
      return;
    }

    // Hold on the last stage — don't schedule past it.
    if (stageIndex >= KEYBOT_THINKING_STAGES.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setStageIndex((current) => current + 1);
    }, STAGE_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [active, reducedMotion, stageIndex]);

  if (reducedMotion) {
    return KEYBOT_THINKING_STEADY_LABEL;
  }

  return KEYBOT_THINKING_STAGES[stageIndex];
}
