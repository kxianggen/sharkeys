import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTypewriter } from "@/components/use-typewriter";

// jsdom has no matchMedia; every test installs one so the hook can read the
// reduced-motion preference.
function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Pacing is randomised per character, so tests advance by a generous bound
// rather than asserting exact per-character timings.
const MAX_CHAR_DELAY_MS = 350;

function advanceThroughText(length: number) {
  act(() => {
    vi.advanceTimersByTime(MAX_CHAR_DELAY_MS * (length + 2));
  });
}

describe("useTypewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("reveals characters progressively and completes", () => {
    mockMatchMedia(false);
    const text = "Hello there.";
    const { result } = renderHook(() => useTypewriter(text));

    expect(result.current.visibleLength).toBe(0);
    expect(result.current.isComplete).toBe(false);

    advanceThroughText(text.length);

    expect(result.current.visibleLength).toBe(text.length);
    expect(result.current.isComplete).toBe(true);
  });

  it("removes the cursor after the linger window", () => {
    mockMatchMedia(false);
    const text = "Done";
    const { result } = renderHook(() =>
      useTypewriter(text, { cursorLingerMs: 2500 }),
    );

    advanceThroughText(text.length);
    expect(result.current.cursorVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2600);
    });

    expect(result.current.cursorVisible).toBe(false);
  });

  it("drops the cursor immediately when linger is zero", () => {
    mockMatchMedia(false);
    const text = "Next";
    const { result } = renderHook(() =>
      useTypewriter(text, { cursorLingerMs: 0 }),
    );

    advanceThroughText(text.length);

    expect(result.current.cursorVisible).toBe(false);
  });

  it("reveals everything at once and hides the cursor under reduced motion", () => {
    mockMatchMedia(true);
    const text = "No animation here.";
    const { result } = renderHook(() => useTypewriter(text));

    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.visibleLength).toBe(text.length);
    expect(result.current.isComplete).toBe(true);
    expect(result.current.cursorVisible).toBe(false);
  });

  it("stays at zero while disabled, then types once enabled", () => {
    mockMatchMedia(false);
    const text = "Waiting";
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useTypewriter(text, { enabled }),
      { initialProps: { enabled: false } },
    );

    advanceThroughText(text.length);
    expect(result.current.visibleLength).toBe(0);

    rerender({ enabled: true });
    advanceThroughText(text.length);

    expect(result.current.visibleLength).toBe(text.length);
  });
});
