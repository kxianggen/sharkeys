"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

import {
  getComponentSwatch,
  PartThumbnail,
} from "@/components/part-thumbnail";
import { SwatchDots } from "@/components/swatch-dots";
import { useKeybotThinkingStage } from "@/components/use-keybot-thinking-stage";
import { useTypewriter } from "@/components/use-typewriter";
import {
  HERO_DEMO_COMPONENT_IDS,
  HERO_DEMO_PROMPT,
  HERO_DEMO_SWITCH_COUNT,
} from "@/data/hero-demo-build";
import { getComponentById } from "@/lib/components";
import { requiredComponentCategories } from "@/lib/types";
import type {
  ComponentCategory,
  KeyboardComponent,
  SelectedKeyboardComponents,
} from "@/lib/types";

/**
 * Attio-style animated hero panel: a mock of the REAL configurator workspace
 * (left kit visual + "Your build", right Ask Meg rail with the section-by-
 * section part picker), replaying a recorded run of the real pipeline.
 *
 * Sequence: prompt types into the pill → Meg's real thinking stages cycle →
 * the resolved build appears → the rail auto-scrolls through each section,
 * selecting the recorded parts, while the left checklist ticks up → holds on
 * the completed, validated build. Starts when scrolled into view, holds the
 * saved state for a few seconds, then loops — restarts are parked while the
 * panel is off screen so no timers churn unwatched. Decorative only — the
 * genuine prompt form above this panel is the only real entry point.
 *
 * Content honesty rules (mirrors the rest of the codebase):
 *   - The selected build is the frozen fixture in src/data/hero-demo-build.ts —
 *     a real, rule-engine-validated pipeline result, re-validated on every test
 *     run by tests/data/hero-demo-build.test.ts.
 *   - Only component IDs are frozen. Names, prices, swatches, and descriptors
 *     resolve from the live seed catalog at render time.
 *   - The alternative options shown alongside each selected part are real
 *     catalog parts that the recorded pipeline runs actually surfaced as
 *     candidates; the GMK67 kit stabilizer is the kit's own included part.
 *   - The thinking labels come from useKeybotThinkingStage — the same honest
 *     pipeline-stage labels the real assistant shows.
 *
 * Fallbacks: prefers-reduced-motion, missing IntersectionObserver (jsdom,
 * old browsers), and SSR all render the completed final state with no
 * animation.
 */

const MEG_REPLY_CHIPS = ["Thocky", "Quiet office build", "65% Layout"] as const;

// Rail sections mirror configuratorSections in the real workspace, including
// the exact heading copy.
const RAIL_SECTIONS: Array<{
  title: string;
  prompt: string;
  categories: ComponentCategory[];
}> = [
  { title: "Case", prompt: "Start with the board.", categories: ["case"] },
  { title: "Internals", prompt: "PCB and plate, matched by the kit.", categories: ["pcb", "plate"] },
  { title: "Switches", prompt: "Pick your feel.", categories: ["switch"] },
  { title: "Keycaps", prompt: "Finish the look.", categories: ["keycap"] },
  { title: "Stabilizers", prompt: "Keep the big keys steady.", categories: ["stabilizer"] },
];

// One real catalog alternative per free-choice category, shown unselected under
// the fixture's pick — sourced from the same recorded probe runs (see header).
const ALTERNATIVE_IDS: Partial<Record<ComponentCategory, string[]>> = {
  switch: ["switch_outemu_silent_peach_v2"],
  keycap: ["keycap_unknown_seasonic_xda_pbt"],
  stabilizer: ["stab_gmk67_plate_mount"],
};

// Categories the user picks in the real flow; kit-locked parts are included
// with the kit and rendered as such.
const CHOICE_CATEGORIES: ComponentCategory[] = ["switch", "keycap", "stabilizer"];

const categoryLabels: Record<ComponentCategory, string> = {
  case: "Case",
  pcb: "PCB",
  plate: "Plate",
  switch: "Switch",
  keycap: "Keycap",
  stabilizer: "Stabilizer",
};

// ---------------------------------------------------------------------------
// Animation state machine. Linear: each phase advances to the next after its
// dwell time (typing advances when the typewriter completes instead).
// ---------------------------------------------------------------------------

const PHASES = [
  "idle",
  "typing",
  "thinking",
  "reveal",
  "case",
  "internals",
  "switch",
  "keycap",
  "stabilizer",
  "save",
  "complete",
] as const;

type Phase = (typeof PHASES)[number];

// Dwell before advancing OUT of the phase. "typing" is completion-driven.
// Choice phases fit: scroll settles (~500ms) → cursor glides to the card
// (~650ms) → click pulse → selection lands → beat.
const PHASE_DWELL_MS: Partial<Record<Phase, number>> = {
  thinking: 4200, // 4 real stages × 1s + a beat on "Writing a reply…"
  reveal: 1100,
  case: 1250,
  internals: 1250,
  switch: 1750,
  keycap: 1750,
  stabilizer: 1750,
  save: 1500,
};

// Which rail section each phase scrolls to.
const PHASE_SCROLL_TARGET: Partial<Record<Phase, string>> = {
  case: "Case",
  internals: "Internals",
  switch: "Switches",
  keycap: "Keycaps",
  stabilizer: "Stabilizers",
};

function phaseIndex(phase: Phase) {
  return PHASES.indexOf(phase);
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ---------------------------------------------------------------------------
// Catalog resolution
// ---------------------------------------------------------------------------

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

// Same price semantics as the real workspace: switches priced per ~70, "~"
// prefix on totals because they are estimates, exact part prices unprefixed.
function formatPartPrice(component: KeyboardComponent) {
  if (component.price === undefined || component.priceCurrency === undefined) {
    return "Price unavailable";
  }

  if (component.category === "switch") {
    const amount = component.price * HERO_DEMO_SWITCH_COUNT;

    return `${formatMoney(amount, component.priceCurrency)} est. ${HERO_DEMO_SWITCH_COUNT} switches`;
  }

  return formatMoney(component.price, component.priceCurrency);
}

function getPartDescriptor(component: KeyboardComponent): string | undefined {
  switch (component.category) {
    case "switch":
      return component.soundProfile;
    case "keycap":
      return component.keycapProfile;
    case "stabilizer":
      return component.stabilizerType.replace(/_/g, " ");
    default:
      return undefined;
  }
}

// Kit display name derived from the case record — full port of the
// configurator's getKitDisplayName, including the material-stripping fallback
// ("GMK67 65% Plastic Case" → "GMK67 65%"). The layout-token branch never
// matches names like "… 65% …" because % is a non-word character (no \b), so
// the stripped branch is the one that actually fires for these names — same
// behavior as the real workspace title.
function getKitDisplayName(caseComponent: KeyboardComponent) {
  const observed = caseComponent.metadata?.observedKitName;

  if (typeof observed === "string" && observed) {
    return observed;
  }

  const name = caseComponent.name;
  const layoutToken = name.match(/\s+(\d{2,3}%|Full[- ]Size|TKL|1800)\b/i);

  if (layoutToken?.index) {
    return name.slice(0, layoutToken.index).trim();
  }

  const stripped = name
    .replace(
      /\b(CNC|Aluminum|Aluminium|ABS|Plastic|Polycarbonate|Acrylic|Case)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();

  return stripped || name;
}

type ResolvedDemo = {
  // Per-category component types, not the bare KeyboardComponent union: the
  // demo reads case-only fields (layouts) and switch-only fields
  // (soundProfile), which the union cannot expose. Required<> because
  // resolveDemo returns null unless every category resolved.
  parts: Required<SelectedKeyboardComponents>;
  alternatives: Partial<Record<ComponentCategory, KeyboardComponent[]>>;
  kitTitle: string;
  kitId: string | null;
  kitBasePriceLabel: string;
  totalPriceLabel: string;
  layoutChip: string;
  soundChip: string;
};

function resolveDemo(): ResolvedDemo | null {
  const entries = requiredComponentCategories.map((category) => {
    const component = getComponentById(HERO_DEMO_COMPONENT_IDS[category]);

    return component?.category === category
      ? ([category, component] as const)
      : null;
  });

  if (entries.some((entry) => entry === null)) {
    // The guard test makes this unreachable in practice; render nothing rather
    // than a broken window if the fixture and catalog ever disagree at runtime.
    return null;
  }

  // The assertion is what Object.fromEntries always costs — it cannot express
  // "this key maps to that value type". It is sound here because the guard
  // above discards the result unless every entry satisfied
  // `component.category === category`.
  const parts = Object.fromEntries(
    entries as ReadonlyArray<readonly [ComponentCategory, KeyboardComponent]>,
  ) as Required<SelectedKeyboardComponents>;

  const alternatives: Partial<Record<ComponentCategory, KeyboardComponent[]>> =
    {};
  for (const [category, ids] of Object.entries(ALTERNATIVE_IDS)) {
    const resolved = (ids ?? [])
      .map((id) => getComponentById(id))
      .filter((component): component is KeyboardComponent =>
        Boolean(component),
      );

    if (resolved.length > 0) {
      alternatives[category as ComponentCategory] = resolved;
    }
  }

  const currency = parts.case.priceCurrency ?? "MYR";

  // Kit base = the kit-locked structural parts, matching the workspace's
  // "From ~RM 180" running-start figure.
  const kitBase = (["case", "pcb", "plate"] as const).reduce(
    (sum, category) => sum + (parts[category].price ?? 0),
    0,
  );

  const total = requiredComponentCategories.reduce((sum, category) => {
    const price = parts[category].price ?? 0;

    return (
      sum + (category === "switch" ? price * HERO_DEMO_SWITCH_COUNT : price)
    );
  }, 0);

  const layout = parts.case.layouts[0];

  return {
    parts,
    alternatives,
    kitTitle: getKitDisplayName(parts.case),
    kitId:
      typeof parts.case.metadata?.kitId === "string"
        ? parts.case.metadata.kitId
        : null,
    kitBasePriceLabel: `From ~${formatMoney(kitBase, currency)}`,
    totalPriceLabel: `~${formatMoney(total, currency)}`,
    layoutChip: layout === "tkl" ? "TKL Layout" : `${layout}% Layout`,
    soundChip: parts.switch.soundProfile ?? "neutral",
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HeroConfiguratorDemo() {
  const demo = useMemo(() => resolveDemo(), []);
  const [phase, setPhase] = useState<Phase>("idle");
  const rootRef = useRef<HTMLElement | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef(new Map<string, HTMLDivElement>());
  const selectedCardRefs = useRef(new Map<ComponentCategory, HTMLDivElement>());
  const designBtnRef = useRef<HTMLSpanElement | null>(null);
  const saveBtnRef = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);
  // True only when the animation actually plays (observer path). The skip
  // paths (reduced motion, no observer) jump to the final state and get
  // neither the fake cursor nor the "saved" toast — and never loop.
  const playedRef = useRef(false);
  // Loop gating: the observer keeps watching after start; a finished run only
  // replays while the panel is actually on screen. If the hold expires while
  // scrolled away, the restart is parked until the panel returns to view.
  const inViewRef = useRef(false);
  const pendingRestartRef = useRef(false);

  // Fake macOS-style pointer, positioned relative to the window div. Movement
  // animates via a CSS transform transition; "pressed" is the click pulse.
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const [cursorPressed, setCursorPressed] = useState(false);
  // Set mid-phase, after the cursor's click lands: the moment a choice phase's
  // selection visuals (ring, thumbnail, tick) flip on — so state change and
  // pointer click read as cause and effect.
  const [stepClicked, setStepClicked] = useState(false);

  const at = phaseIndex(phase);
  const isComplete = phase === "complete";
  const revealed = at >= phaseIndex("reveal");

  const moveCursorTo = (
    element: Element | null | undefined,
    offsetX = 6,
    offsetY = 4,
  ) => {
    const windowElement = windowRef.current;

    if (!windowElement || !element) {
      return;
    }

    const target = element.getBoundingClientRect();
    const frame = windowElement.getBoundingClientRect();

    setCursor({
      x: target.left - frame.left + target.width / 2 + offsetX,
      y: target.top - frame.top + target.height / 2 + offsetY,
      visible: true,
    });
  };

  // Typing keeps its final text once done (enabled stays true after the typing
  // phase so the hook never resets); zero linger avoids a stale cursor while
  // the thinking banner takes over.
  const typewriter = useTypewriter(HERO_DEMO_PROMPT, {
    enabled: at >= phaseIndex("typing"),
    cursorLingerMs: 0,
  });

  const thinkingLabel = useKeybotThinkingStage(phase === "thinking");

  // Start trigger: first scroll into view, once per page load. Environments
  // without IntersectionObserver (SSR pass, jsdom, old browsers) and users
  // preferring reduced motion get the finished state immediately.
  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    if (readReducedMotion() || typeof IntersectionObserver === "undefined") {
      startedRef.current = true;
      setPhase("complete");
      return;
    }

    const root = rootRef.current;

    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (observedEntries) => {
        const intersecting = observedEntries.some(
          (entry) => entry.isIntersecting,
        );

        inViewRef.current = intersecting;

        if (!intersecting) {
          return;
        }

        if (!startedRef.current) {
          // First sight: start the run.
          startedRef.current = true;
          playedRef.current = true;
          window.setTimeout(() => setPhase("typing"), 450);
        } else if (pendingRestartRef.current) {
          // A finished run was waiting for the panel to come back on screen.
          pendingRestartRef.current = false;
          setPhase("idle");
        }
      },
      // Low threshold: the panel is tall, so a fraction-of-panel threshold
      // like 0.35 can be unreachable on short laptop viewports (35% of a
      // ~1100px panel never fits). 15% visible is enough intent to start.
      { threshold: 0.15 },
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  // Loop: hold the completed, saved state for a beat, then replay — but only
  // while the panel is on screen. Off-screen restarts are parked for the
  // observer to release. Skip paths (playedRef false) never loop.
  useEffect(() => {
    if (phase !== "complete" || !playedRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (inViewRef.current) {
        setPhase("idle");
      } else {
        pendingRestartRef.current = true;
      }
    }, 5200);

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  // Re-arm after a loop reset: "idle" with a previous run behind it means the
  // exit transitions are playing — scroll the rail home, give them a moment,
  // then type again. (Initial mount is also "idle", but startedRef is false
  // there, so this never fires before the first observer-triggered run.)
  useEffect(() => {
    if (phase !== "idle" || !startedRef.current) {
      return;
    }

    const rail = railRef.current;

    if (rail) {
      if (typeof rail.scrollTo === "function") {
        rail.scrollTo({ top: 0, behavior: "auto" });
      } else {
        rail.scrollTop = 0;
      }
    }

    const timeoutId = window.setTimeout(() => setPhase("typing"), 700);

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  // typing → thinking: completion-driven rather than timed. The prompt is
  // done, so the cursor glides onto "Design my build", clicks, and only then
  // does the thinking banner appear — click first, consequence second.
  useEffect(() => {
    if (phase !== "typing" || !typewriter.isComplete) {
      return;
    }

    moveCursorTo(designBtnRef.current, 4, 2);
    const timers = [
      window.setTimeout(() => setCursorPressed(true), 700),
      window.setTimeout(() => setCursorPressed(false), 870),
      window.setTimeout(() => setPhase("thinking"), 950),
    ];

    return () => timers.forEach((timerId) => window.clearTimeout(timerId));
    // moveCursorTo reads refs only; recreating it must not rerun the timers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, typewriter.isComplete]);

  // Cursor choreography per phase (only when the animation really plays).
  useEffect(() => {
    setStepClicked(false);

    if (!playedRef.current) {
      return;
    }

    const timers: number[] = [];

    if (phase === "typing") {
      // Appear just below the Design button while the prompt types.
      timers.push(
        window.setTimeout(() => moveCursorTo(designBtnRef.current, 42, 66), 150),
      );
    } else if (
      phase === "switch" ||
      phase === "keycap" ||
      phase === "stabilizer"
    ) {
      // Wait for the rail's smooth scroll to settle, glide to the card,
      // click, then let the selection visuals land.
      timers.push(
        window.setTimeout(
          () => moveCursorTo(selectedCardRefs.current.get(phase), 30, 8),
          500,
        ),
        window.setTimeout(() => setCursorPressed(true), 1150),
        window.setTimeout(() => {
          setCursorPressed(false);
          setStepClicked(true);
        }, 1320),
      );
    } else if (phase === "save") {
      timers.push(
        window.setTimeout(() => moveCursorTo(saveBtnRef.current, 2, 2), 150),
        window.setTimeout(() => setCursorPressed(true), 900),
        window.setTimeout(() => setCursorPressed(false), 1070),
      );
    } else if (phase === "complete") {
      setCursor((current) => ({ ...current, visible: false }));
    }

    return () => timers.forEach((timerId) => window.clearTimeout(timerId));
    // moveCursorTo reads refs only; phase is the real trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Timed advancement for every phase with a dwell.
  useEffect(() => {
    const dwell = PHASE_DWELL_MS[phase];

    if (dwell === undefined) {
      return;
    }

    const next = PHASES[phaseIndex(phase) + 1];
    const timeoutId = window.setTimeout(() => setPhase(next), dwell);

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  // Auto-scroll the rail to the section belonging to the current phase.
  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    if (phase === "complete") {
      const top = rail.scrollHeight;

      if (typeof rail.scrollTo === "function") {
        rail.scrollTo({ top, behavior: startedRef.current ? "smooth" : "auto" });
      } else {
        rail.scrollTop = top;
      }
      return;
    }

    const targetTitle = PHASE_SCROLL_TARGET[phase];
    const target = targetTitle
      ? sectionRefs.current.get(targetTitle)
      : undefined;

    if (!target) {
      return;
    }

    const top = target.offsetTop - 4;

    if (typeof rail.scrollTo === "function") {
      rail.scrollTo({ top, behavior: "smooth" });
    } else {
      rail.scrollTop = top;
    }
  }, [phase]);

  if (!demo) {
    return null;
  }

  // A choice category is "selected" once its phase's cursor click has landed
  // (or the animation has moved past it / was skipped to the end).
  const isChosen = (category: ComponentCategory) => {
    const categoryIndex = phaseIndex(category as Phase);

    return at > categoryIndex || (at === categoryIndex && stepClicked);
  };

  const buildComplete = at >= phaseIndex("save");
  // Known: reads a ref during render, so showToast is non-reactive and may be
  // stale. Flagged by react-hooks/refs. Converting playedRef to state would
  // alter re-render timing in this choreographed sequence; deferred rather
  // than restructured late in the project.
  const showToast = isComplete && playedRef.current;

  return (
    <section
      aria-label="Demo of Meg resolving a keyboard build in the configurator"
      className="mx-auto mt-16 w-full max-w-5xl text-left"
      data-phase={phase}
      data-testid="hero-configurator-demo"
      ref={rootRef}
    >
      <div
        className="relative overflow-hidden rounded-2xl border-[0.5px] border-border bg-surface shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)]"
        ref={windowRef}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b-[0.5px] border-border bg-surface-secondary/60 px-4 py-2.5">
          <span aria-hidden className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="ml-2 text-xs font-medium text-secondary">
            sharkeys — Configurator
          </span>
        </div>

        {/* Workspace body: left product visual, right Ask Meg rail */}
        <div className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
          {/* LEFT — kit visual + Your build. Final content is always mounted
              (invisible pre-reveal) so the panel's height never jumps
              mid-animation; a placeholder message sits on top until then. */}
          <div className="relative min-w-0">
            <div
              aria-hidden={!revealed}
              className={`transition-opacity duration-500 ${
                revealed ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="text-2xl font-black leading-tight text-primary">
                {demo.kitTitle}
              </p>
              <p className="mt-1 text-sm text-secondary">
                {demo.kitBasePriceLabel}
              </p>

              <HeroKitVisual kitId={demo.kitId} />

              <div className="mt-5">
                <p className="text-sm font-semibold text-primary">Your build</p>
                <ul className="mt-2 flex flex-col gap-1">
                  {CHOICE_CATEGORIES.map((category) => {
                    const component = demo.parts[category];
                    const descriptor = getPartDescriptor(component);
                    const chosen = isChosen(category);

                    return (
                      <li
                        className="flex items-center gap-3 rounded-xl px-1 py-1"
                        key={category}
                      >
                        {chosen ? (
                          <PartThumbnail component={component} />
                        ) : (
                          <span
                            aria-hidden
                            className="h-11 w-11 flex-none rounded-lg border border-dashed border-border-strong"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-primary">
                            {chosen ? component.name : categoryLabels[category]}
                          </p>
                          <p className="text-xs capitalize text-secondary">
                            {chosen
                              ? descriptor
                                ? `${categoryLabels[category]} · ${descriptor}`
                                : categoryLabels[category]
                              : "Not selected yet"}
                          </p>
                        </div>
                        <CheckCircle2
                          aria-hidden
                          className={`h-4 w-4 flex-none text-success transition-opacity duration-300 ${
                            chosen ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {!revealed ? (
              <p className="absolute inset-x-0 top-24 mx-auto max-w-xs text-center text-sm leading-6 text-secondary">
                Ask Meg to resolve a validated build — it appears here with the
                kit it is based on.
              </p>
            ) : null}
          </div>

          {/* RIGHT — Ask Meg rail. Fixed height + clipped; the animation
              auto-scrolls it section by section. */}
          <div
            className="relative h-[430px] min-w-0 overflow-hidden sm:h-[470px]"
            data-testid="hero-demo-rail"
            ref={railRef}
            // Inline fallback: if the arbitrary-value Tailwind classes ever
            // fail to generate, an uncapped rail balloons the whole panel.
            style={{ maxHeight: 470 }}
          >
            <div className="space-y-6">
              {/* Ask Meg header */}
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-full bg-accent-subtle"
                >
                  <Image
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                    height={36}
                    src="/meg-avatar.png"
                    width={36}
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">Ask Meg</p>
                  <p className="text-xs text-secondary">AI build control</p>
                </div>
              </div>

              {/* Prompt pill: types the recorded prompt character by character.
                  When the animation is skipped (reduced motion, no observer),
                  the full prompt renders immediately — the typewriter state is
                  only trusted while a real run is in progress. */}
              <div className="flex items-center gap-2 rounded-pill border-[0.5px] border-border bg-surface py-1.5 pl-4 pr-1.5">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {isComplete || typewriter.visibleLength > 0 ? (
                    <span className="text-primary">
                      {isComplete
                        ? HERO_DEMO_PROMPT
                        : HERO_DEMO_PROMPT.slice(0, typewriter.visibleLength)}
                      {!isComplete &&
                      !typewriter.isComplete &&
                      typewriter.cursorVisible ? (
                        <span
                          aria-hidden
                          className="ml-[1px] inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-primary"
                        />
                      ) : null}
                    </span>
                  ) : (
                    <span className="text-secondary/70">
                      A deep thocky build for a quiet office...
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className="inline-flex h-9 flex-none items-center gap-1.5 rounded-pill bg-accent px-4 text-xs font-bold text-white"
                  ref={designBtnRef}
                >
                  Design my build
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {MEG_REPLY_CHIPS.map((chip) => (
                  <span
                    className="inline-flex items-center rounded-pill border-[0.5px] border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-secondary"
                    key={chip}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/* Thinking banner — same honest stage labels as the real app */}
              {phase === "thinking" ? (
                <div className="inline-flex w-full items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-bold text-white">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {thinkingLabel}
                </div>
              ) : null}

              {/* Resolved content: carousel + sections. Mounted from the start
                  for stable scroll geometry; fades in at reveal. */}
              <div
                aria-hidden={!revealed}
                className={`space-y-6 transition-opacity duration-500 ${
                  revealed ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Start from a build */}
                <div>
                  <p className="text-lg font-black text-primary">
                    Start from a build.{" "}
                    <span className="text-secondary">
                      Pick one, then make it yours.
                    </span>
                  </p>
                  <div className="mt-3 rounded-lg border border-accent bg-surface p-3.5 shadow-sm ring-4 ring-accent/15">
                    <div className="flex items-center gap-4">
                      <HeroKitThumbnail kitId={demo.kitId} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <span className="text-base font-black leading-6 text-primary">
                            {demo.kitTitle}
                          </span>
                          <span className="text-sm font-black text-primary">
                            {demo.totalPriceLabel}
                          </span>
                        </div>
                        <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-secondary">
                          <span className="truncate">
                            {demo.parts.switch.name.replace(/ Switch$/, "")} ·{" "}
                            {demo.parts.keycap.name.replace(/ Keycaps$/, "")}
                          </span>
                          {getComponentSwatch(demo.parts.keycap) ? (
                            <SwatchDots
                              colors={getComponentSwatch(demo.parts.keycap)!}
                            />
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded border border-border bg-surface px-2 py-0.5 text-[11px] font-bold text-secondary">
                            {demo.layoutChip}
                          </span>
                          <span className="rounded border border-border bg-surface px-2 py-0.5 text-[11px] font-bold capitalize text-secondary">
                            {demo.soundChip}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Part sections — exact copy of the workspace's rail structure */}
                {RAIL_SECTIONS.map((section) => (
                  <div
                    key={section.title}
                    ref={(element) => {
                      if (element) {
                        sectionRefs.current.set(section.title, element);
                      } else {
                        sectionRefs.current.delete(section.title);
                      }
                    }}
                  >
                    <p className="text-lg font-black text-primary">
                      {section.title}.{" "}
                      <span className="text-secondary">{section.prompt}</span>
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {section.categories.flatMap((category) => {
                        const selected = demo.parts[category];
                        const isChoice = CHOICE_CATEGORIES.includes(category);
                        const options = isChoice
                          ? [selected, ...(demo.alternatives[category] ?? [])]
                          : [selected];

                        return options.map((component) => {
                          const isSelected =
                            component.id === selected.id &&
                            (!isChoice || isChosen(category));
                          const isKitIncluded =
                            component.metadata?.kitLock === true;

                          return (
                            <div
                              className={`rounded-lg border p-3.5 transition-all duration-300 ${
                                isChoice && isSelected
                                  ? "border-accent bg-accent-subtle/40 ring-4 ring-accent/10"
                                  : "border-[0.5px] border-border bg-surface-secondary/60"
                              }`}
                              data-selected={
                                isChoice && isSelected ? "true" : undefined
                              }
                              key={component.id}
                              ref={(element) => {
                                // The cursor needs the card it will "click":
                                // the fixture's pick in each choice section.
                                if (!isChoice || component.id !== selected.id) {
                                  return;
                                }
                                if (element) {
                                  selectedCardRefs.current.set(category, element);
                                } else {
                                  selectedCardRefs.current.delete(category);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                                    {component.category === "keycap" &&
                                    getComponentSwatch(component) ? (
                                      <SwatchDots
                                        colors={getComponentSwatch(component)!}
                                      />
                                    ) : null}
                                    <span className="truncate">
                                      {component.name}
                                    </span>
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-secondary">
                                    {component.description}
                                  </p>
                                  {isKitIncluded ? (
                                    <span className="mt-2 inline-flex rounded-pill bg-accent-subtle px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                                      Included with this kit
                                    </span>
                                  ) : null}
                                </div>
                                <span className="flex-none text-xs font-bold text-primary">
                                  {formatPartPrice(component)}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom summary bar — mirrors the workspace's sticky save bar */}
        <div className="flex items-center justify-between gap-4 border-t-[0.5px] border-border px-5 py-3 sm:px-8">
          <div className="min-w-0">
            <p className="text-sm font-bold text-primary">
              {revealed ? demo.kitTitle : "sharkeys"}
            </p>
            <p className="text-xs text-secondary">
              {buildComplete
                ? `${demo.totalPriceLabel} estimated · Validated build`
                : revealed
                  ? `${demo.kitBasePriceLabel} · Choose switch, keycap, stabilizer to finish`
                  : "Describe your dream keyboard to start"}
            </p>
          </div>
          <span
            aria-hidden
            className={`inline-flex h-9 flex-none items-center rounded-pill bg-accent px-4 text-sm font-bold text-white transition-opacity duration-300 ${
              buildComplete ? "opacity-100" : "opacity-40"
            }`}
            ref={saveBtnRef}
          >
            Save build
          </span>
        </div>

        {/* Completion notice — quiet frosted card, centered over the panel */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-all duration-500 ${
            showToast ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 rounded-2xl border-[0.5px] border-border bg-surface/85 px-5 py-4 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <CheckCircle2 className="h-6 w-6 flex-none text-success" aria-hidden />
            <div>
              <p className="text-sm font-bold text-primary">Build saved</p>
              <p className="text-xs text-secondary">
                {demo.kitTitle} · {demo.totalPriceLabel} · Validated
              </p>
            </div>
          </div>
        </div>

        {/* Fake pointer: movement via transform transition; click = brief
            scale-down. pointer-events-none — purely decorative. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20"
          style={{
            transform: `translate(${cursor.x}px, ${cursor.y}px)`,
            opacity: cursor.visible ? 1 : 0,
            transition:
              "transform 650ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 300ms ease",
          }}
        >
          <svg
            className={`drop-shadow-md transition-transform duration-150 ${
              cursorPressed ? "scale-75" : "scale-100"
            }`}
            fill="none"
            height="22"
            viewBox="0 0 24 24"
            width="22"
          >
            <path
              d="M5 3v16l4.2-3.4L11.6 21l3-1.3-2.4-5.3 5.8-.7L5 3z"
              fill="#111"
              stroke="#fff"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

// Large kit visual for the left column, mirroring KitVisual's presentation.
function HeroKitVisual({ kitId }: { kitId: string | null }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      aria-hidden
      className="mt-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-secondary"
    >
      {!kitId || imageFailed ? null : (
        <Image
          alt=""
          className="h-full w-full scale-[1.35] object-contain"
          height={360}
          onError={() => setImageFailed(true)}
          src={`/kits/${kitId}.webp`}
          width={480}
        />
      )}
    </div>
  );
}

// Small kit thumbnail for the carousel card.
function HeroKitThumbnail({ kitId }: { kitId: string | null }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!kitId || imageFailed) {
    return (
      <span
        aria-hidden
        className="h-16 w-24 flex-none rounded-lg bg-surface-secondary"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-16 w-24 flex-none items-center justify-center overflow-hidden rounded-lg bg-surface-secondary"
    >
      <Image
        alt=""
        className="h-full w-full scale-[1.55] object-contain"
        height={80}
        onError={() => setImageFailed(true)}
        src={`/kits/${kitId}.webp`}
        width={120}
      />
    </span>
  );
}
