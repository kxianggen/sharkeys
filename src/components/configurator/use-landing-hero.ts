"use client";

import { useEffect, useRef, useState } from "react";

// Landing hero entrance: one shared fade-up applied to the headline, subtitle,
// prompt box, and quick chips with a small per-element stagger, so the whole
// hero arrives as a single motion (the standard, quiet pattern for hero copy —
// opacity 0→1 with an 8px rise, ~700ms ease-out). Replaced the earlier
// typewriter headline: the demo panel below types its prompt character by
// character, and two typewriter effects on one screen read as a gimmick rather
// than a choice. Reduced motion renders everything immediately.
type HeroEntranceState = "pending" | "in" | "instant";

export function useLandingHero() {
  // Scroll-linked hero handoff targets (landing only): the runway that gives
  // the pinned stage its scroll distance, the copy block that fades away, and
  // the demo-panel wrapper that travels up into the copy's place.
  const heroRunwayRef = useRef<HTMLDivElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const heroPanelLiftRef = useRef<HTMLDivElement | null>(null);
  const [heroEntrance, setHeroEntrance] =
    useState<HeroEntranceState>("pending");

  // Hero entrance trigger: fires once shortly after mount so the staggered
  // fade-up lands just after first paint. Reduced motion shows everything
  // immediately.
  useEffect(() => {
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setHeroEntrance("instant");
      return;
    }

    const timeoutId = window.setTimeout(() => setHeroEntrance("in"), 100);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // Scroll-linked hero handoff (Attio-style pinned stage): the hero section is
  // `sticky` inside a taller "runway" div, so while the user scrolls through
  // the runway the stage holds still on screen. Progress through the runway
  // drives the sequence: the demo panel physically travels up from its
  // resting spot into the headline's space while the copy fades out beneath
  // it — the panel replaces the copy, not just "scrolls past" it. Styles are
  // written straight to the DOM inside a rAF frame so this large component
  // tree never re-renders during scroll. On viewports where the runway has no
  // spare height (the pinning classes are lg-only) and under reduced motion,
  // everything stays static.
  useEffect(() => {
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const NAV_HEIGHT = 48; // matches MainNav h-12 / stage top-12
    let frame = 0;

    const resetStyles = (copy: HTMLElement, panel: HTMLElement) => {
      copy.style.opacity = "";
      copy.style.transform = "";
      copy.style.pointerEvents = "";
      panel.style.transform = "";
    };

    const apply = () => {
      const runway = heroRunwayRef.current;
      const copy = heroCopyRef.current;
      const panel = heroPanelLiftRef.current;

      if (!runway || !copy || !panel) {
        return;
      }

      const stageHeight = window.innerHeight - NAV_HEIGHT;
      const runwaySpare = runway.offsetHeight - stageHeight;

      // No spare runway (small screens — pinning classes are lg-only): plain
      // static hero, and any styles from a previous viewport size come off.
      if (runwaySpare <= 40) {
        resetStyles(copy, panel);
        return;
      }

      const runwayTop = runway.getBoundingClientRect().top;
      const progress = Math.min(
        1,
        Math.max(0, (NAV_HEIGHT - runwayTop) / runwaySpare),
      );

      copy.style.opacity = String(1 - progress);
      copy.style.transform = `translateY(${-32 * progress}px)`;
      // The real prompt form must not intercept clicks once it has faded.
      copy.style.pointerEvents = progress > 0.5 ? "none" : "";

      // Travel distance: from the panel's natural spot in the stage up to
      // its final CENTERED position in the pinned viewport — measured live so
      // it adapts to viewport and content size. Panels taller than the stage
      // rest just under the top instead (centering would crop their header).
      const finalTop = Math.max(
        12,
        (stageHeight - panel.offsetHeight) / 2,
      );
      const lift = Math.max(0, panel.offsetTop - finalTop);
      panel.style.transform = `translateY(${-lift * progress}px)`;
    };

    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // Per-element entrance classes; the delay class staggers elements into one
  // continuous motion.
  const heroFade = (delayClass = "") =>
    heroEntrance === "instant"
      ? ""
      : ` transition-all duration-700 ease-out ${delayClass} ${
          heroEntrance === "in"
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        }`;

  return { heroCopyRef, heroFade, heroPanelLiftRef, heroRunwayRef };
}
