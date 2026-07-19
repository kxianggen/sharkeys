import { useEffect, useState } from "react";

/**
 * Character-by-character reveal with human-feeling pacing.
 *
 * Extracted from the landing headline so the hero demo panel and the headline
 * share one implementation rather than drifting apart. The pacing rules are the
 * ones tuned for the headline:
 *
 *   - base cadence is randomised per character (not a fixed interval), because a
 *     constant tick reads as machine output rather than typing;
 *   - spaces get an extra beat (the spacebar pause);
 *   - sentence punctuation gets a longer one (the breath at the end of a
 *     thought).
 *
 * The cursor keeps blinking for a moment after the last character so the reader
 * can finish the line, then is removed entirely rather than left pulsing as a
 * permanent distraction.
 *
 * Reduced motion short-circuits everything: the full text is revealed
 * immediately and no cursor is shown.
 *
 * Note this hook only tracks *how many* characters are visible. Callers own the
 * markup, which matters for layout stability — the headline renders every
 * character upfront and toggles `visible`/`invisible` so the browser computes
 * final line wrapping before the animation starts, and nothing reflows mid-type.
 * Slicing the string instead would reintroduce that jump.
 */

const BASE_DELAY_MIN_MS = 30;
const BASE_DELAY_JITTER_MS = 40;
const SPACE_DELAY_MIN_MS = 50;
const SPACE_DELAY_JITTER_MS = 30;
const PUNCTUATION_DELAY_MIN_MS = 150;
const PUNCTUATION_DELAY_JITTER_MS = 100;
const START_DELAY_MS = 150;
const CURSOR_LINGER_MS = 2500;

const PUNCTUATION = [".", ",", "!", "?"];

// jsdom (and any non-browser render) has no matchMedia, so probe defensively
// rather than assuming it exists — same guard as readReducedMotion() in
// use-keybot-thinking-stage.ts. Treat "can't ask" as "no preference set".
function readReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type UseTypewriterOptions = {
  /**
   * Set false to hold the animation before it starts. Used by the hero demo so
   * a panel below the fold does not type itself out to an empty screen — the
   * sequence begins when it scrolls into view. Defaults to true.
   */
  enabled?: boolean;
  /** Delay before the first character. Defaults to 150ms. */
  startDelayMs?: number;
  /**
   * How long the cursor keeps blinking after the last character before being
   * removed. Defaults to 2500ms. Pass 0 to drop it immediately — used when
   * another block is about to start typing and two cursors would show at once.
   */
  cursorLingerMs?: number;
};

export type UseTypewriterResult = {
  /** Number of characters revealed so far. */
  visibleLength: number;
  /** Whether the cursor should currently render. */
  cursorVisible: boolean;
  /** True once every character has been revealed. */
  isComplete: boolean;
  /**
   * False during SSR and the first client render. Callers gate cursor and
   * reduced-motion rendering on this to avoid a hydration mismatch.
   */
  mounted: boolean;
  /** Whether the user has asked for reduced motion. */
  prefersReducedMotion: boolean;
};

export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {},
): UseTypewriterResult {
  const {
    enabled = true,
    startDelayMs = START_DELAY_MS,
    cursorLingerMs = CURSOR_LINGER_MS,
  } = options;

  const [visibleLength, setVisibleLength] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setMounted(true);

    const reducedMotion = readReducedMotion();
    setPrefersReducedMotion(reducedMotion);

    if (reducedMotion) {
      setVisibleLength(text.length);
      setCursorVisible(false);
      return;
    }

    if (!enabled) {
      // Held before the trigger fires: reset to the start so the sequence can
      // play from empty once enabled, rather than resuming mid-word.
      setVisibleLength(0);
      setCursorVisible(true);
      return;
    }

    let currentLength = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const typeNextChar = () => {
      if (isCancelled) return;

      if (currentLength >= text.length) {
        if (cursorLingerMs <= 0) {
          setCursorVisible(false);
          return;
        }

        timeoutId = setTimeout(() => {
          if (!isCancelled) setCursorVisible(false);
        }, cursorLingerMs);
        return;
      }

      const nextChar = text[currentLength];
      currentLength += 1;
      setVisibleLength(currentLength);

      let delay = BASE_DELAY_MIN_MS + Math.random() * BASE_DELAY_JITTER_MS;

      if (nextChar === " ") {
        delay += SPACE_DELAY_MIN_MS + Math.random() * SPACE_DELAY_JITTER_MS;
      } else if (PUNCTUATION.includes(nextChar)) {
        delay +=
          PUNCTUATION_DELAY_MIN_MS + Math.random() * PUNCTUATION_DELAY_JITTER_MS;
      }

      timeoutId = setTimeout(typeNextChar, delay);
    };

    timeoutId = setTimeout(typeNextChar, startDelayMs);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [text, enabled, startDelayMs, cursorLingerMs]);

  return {
    visibleLength,
    cursorVisible,
    isComplete: visibleLength >= text.length,
    mounted,
    prefersReducedMotion,
  };
}
