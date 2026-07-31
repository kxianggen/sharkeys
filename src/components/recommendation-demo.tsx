"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BookmarkPlus,
  Bot,
  CheckCircle2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ExternalLink,
  Heart,
  Info,
  Image as ImageIcon,
  Keyboard,
  Layers3,
  Loader2,
  MessageCircle,
  Mic,
  PackageSearch,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { saveBuildAction } from "@/app/my-builds/actions";
import { BuilderPickTag, isBuilderPick } from "@/components/builder-pick-tag";
import { HeroConfiguratorDemo } from "@/components/hero-configurator-demo";
import {
  getComponentSwatch,
  PartThumbnail,
} from "@/components/part-thumbnail";
import { ImageDrop } from "@/components/image-drop";
import {
  CustomerReviewsSection,
  FaqSection,
  FeatureCardsSection,
  FounderQuoteSection,
} from "@/components/landing-sections";
import { MainNav } from "@/components/main-nav";
import { SwatchDots } from "@/components/swatch-dots";
import { useKeybotThinkingStage } from "@/components/use-keybot-thinking-stage";
import { getOptionConflicts } from "@/lib/rules";
import type { CompatibilityResult, KeyboardComponent } from "@/lib/types";
import type {
  AiIntentApiResponse,
  ExtractedKeyboardIntent,
} from "@/lib/ai";
import type { RecommendationsApiResponse } from "@/lib/recommendations/schemas";
import type { KeybotApiResponse } from "@/lib/keybot/schemas";

type RecommendationResult = RecommendationsApiResponse["data"];
type RecommendationBuild = RecommendationResult["recommendations"][number];
type ComponentCategory = keyof RecommendationResult["candidateComponentIds"];
type ManualSelection = Partial<Record<ComponentCategory, string>>;
type CompleteComponentIdSelection = Record<ComponentCategory, string>;
type CompleteComponentSelection = RecommendationBuild["components"];
type SavedBuildSource = "recommendation" | "manual";
type PriceEstimate = {
  amount: number;
  currency: NonNullable<KeyboardComponent["priceCurrency"]>;
};

type ApiErrorResponse = {
  success: false;
  error: {
    message: string;
  };
};

type ComponentsApiResponse = {
  success: true;
  data: {
    components: KeyboardComponent[];
    count: number;
  };
};

type ValidateBuildApiResponse = {
  success: true;
  data: {
    result: CompatibilityResult;
  };
};

type KeybotChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isRouteFailure?: boolean;
  relatedComponentIds?: string[];
  source?: KeybotApiResponse["data"]["source"];
};

const componentCategories: ComponentCategory[] = [
  "case",
  "pcb",
  "plate",
  "switch",
  "keycap",
  "stabilizer",
];

const categoryLabels: Record<ComponentCategory, string> = {
  case: "Case",
  pcb: "PCB",
  plate: "Plate",
  switch: "Switch",
  keycap: "Keycap",
  stabilizer: "Stabilizer",
};

const categorySummaries: Record<ComponentCategory, string> = {
  case: "Layout shell and mounting style",
  pcb: "Electronics, hotswap, and switch support",
  plate: "Layout fit and acoustic behavior",
  switch: "Feel, technology, and sound profile",
  keycap: "Profile and layout coverage",
  stabilizer: "Large-key support and PCB fit",
};

// Each prompt is verified to resolve to validated, non-empty builds from the
// seed catalog via the local fallback pipeline (see repo eval expectations).
const quickPrompts = [
  "Thocky 65% build",
  "Budget creamy build",
  "Clacky gaming keyboard",
] as const;

// Apple-style rail sections: bold label + secondary prompt, mapped onto the
// deterministic component categories.
const configuratorSections: Array<{
  categories: ComponentCategory[];
  prompt: string;
  title: string;
}> = [
  { title: "Case", prompt: "Start with the board.", categories: ["case"] },
  {
    title: "PCB",
    prompt: "The electronics and switch support.",
    categories: ["pcb"],
  },
  {
    // Split out from the old combined "Internals" step: plate material is a
    // real acoustic choice, not an implementation detail of the PCB.
    title: "Plate",
    prompt: "The cheapest change to how it sounds.",
    categories: ["plate"],
  },
  { title: "Switches", prompt: "Pick your feel.", categories: ["switch"] },
  { title: "Keycaps", prompt: "Finish the look.", categories: ["keycap"] },
  {
    title: "Stabilizers",
    prompt: "Keep the big keys steady.",
    categories: ["stabilizer"],
  },
];

const configuratorQuickPrompts = [
  {
    label: "Thocky",
    prompt: "A deep thocky build for coding in a quiet office",
  },
  {
    label: "Quiet office build",
    prompt: "Quiet office keyboard",
  },
  {
    label: "65% Layout",
    prompt: "Beginner friendly 65% keyboard under RM500",
  },
] as const;


const KEYBOT_WELCOME_MESSAGE: KeybotChatMessage = {
  id: "keybot-welcome",
  role: "assistant",
  content:
    "Hi, I’m Meg. Ask about switches, sound, layouts, compatibility, or your current build.",
};

const keybotQuickActions = [
  {
    label: "What is thocky?",
    message: "What is thocky?",
  },
  {
    label: "Why this switch?",
    message: "Why did you choose this switch?",
  },
  {
    label: "Can I make it cheaper?",
    message: "Can I make it cheaper?",
  },
  {
    label: "Check compatibility",
    message: "Check compatibility for my current build",
  },
] as const;

const keybotBlockerActions = [
  {
    label: "Try 65%",
    message: "Try a 65% layout instead",
  },
  {
    label: "Try TKL",
    message: "Try a TKL layout instead",
  },
  {
    label: "Relax budget",
    message: "Relax the budget and suggest a validated build",
  },
  {
    label: "Explain why",
    message: "Explain why that build is blocked",
  },
] as const;

const estimatedSwitchCount = 70;

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

// A build total is an estimate, not a firm quote: it sums catalog part prices
// and assumes ~70 switches per board. Prefix "~" so it never reads as a
// confirmed price. Exact single-part catalog prices stay unprefixed.
function formatEstimatedTotal(amount: number, currency: string) {
  return `~${formatMoney(amount, currency)}`;
}

function formatComponentPrice(component: KeyboardComponent) {
  if (component.price === undefined || component.priceCurrency === undefined) {
    return "Price unavailable";
  }

  const amount =
    component.category === "switch" ? component.price * 70 : component.price;
  const suffix = component.category === "switch" ? " est. 70 switches" : "";

  return `${formatMoney(amount, component.priceCurrency)}${suffix}`;
}

function getMetadataString(
  metadata: KeyboardComponent["metadata"],
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" ? value : undefined;
}

// Kit-derived structural parts carry metadata.kitLock in the real catalog; the
// rule engine already enforces that they stay with their kit, so the UI treats
// them as auto-included rather than user pick-steps.
function isKitLockedComponent(component: KeyboardComponent | undefined) {
  return component?.metadata?.kitLock === true;
}

// One-word descriptor for the "Your build" summary rows, drawn straight from
// catalog fields (never generated). Missing field → no descriptor (the row
// just shows the category), so nothing is fabricated.
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

function getComponentLayouts(component: KeyboardComponent) {
  switch (component.category) {
    case "case":
    case "pcb":
    case "plate":
      return component.layouts;
    case "keycap":
      return component.layoutSupport;
    case "stabilizer":
      return component.supportedLayouts;
    case "switch":
      return [];
  }
}

function getComponentTechnology(component: KeyboardComponent) {
  switch (component.category) {
    case "pcb":
    case "plate":
      return component.switchTechnologySupport.join(", ");
    case "switch":
      return component.switchTechnology;
    case "keycap":
      return component.compatibleSwitchTechnologies.join(", ");
    case "case":
    case "stabilizer":
      return "Any supported build";
  }
}

function getMountSummary(component: KeyboardComponent) {
  switch (component.category) {
    case "case":
      return component.caseMountSupport.join(", ");
    case "pcb":
      return component.pcbMountSupport.join(", ");
    case "plate":
      return component.plateMountSupport.join(", ");
    case "stabilizer":
      return component.stabilizerType;
    case "switch":
      return component.pinCount ? `${component.pinCount}-pin` : "Switch";
    case "keycap":
      return component.keycapProfile;
  }
}

function toCompleteComponentIds(
  selection: ManualSelection,
): CompleteComponentIdSelection | null {
  const entries = componentCategories.map((category) => {
    const componentId = selection[category];

    return componentId ? [category, componentId] : null;
  });

  if (entries.some((entry) => entry === null)) {
    return null;
  }

  return Object.fromEntries(
    entries as Array<[ComponentCategory, string]>,
  ) as CompleteComponentIdSelection;
}

function resolveCompleteComponents(
  componentIds: CompleteComponentIdSelection,
  catalogById: Map<string, KeyboardComponent>,
): CompleteComponentSelection | null {
  const caseComponent = catalogById.get(componentIds.case);
  const pcbComponent = catalogById.get(componentIds.pcb);
  const plateComponent = catalogById.get(componentIds.plate);
  const switchComponent = catalogById.get(componentIds.switch);
  const keycapComponent = catalogById.get(componentIds.keycap);
  const stabilizerComponent = catalogById.get(componentIds.stabilizer);

  if (
    caseComponent?.category !== "case" ||
    pcbComponent?.category !== "pcb" ||
    plateComponent?.category !== "plate" ||
    switchComponent?.category !== "switch" ||
    keycapComponent?.category !== "keycap" ||
    stabilizerComponent?.category !== "stabilizer"
  ) {
    return null;
  }

  return {
    case: caseComponent,
    pcb: pcbComponent,
    plate: plateComponent,
    switch: switchComponent,
    keycap: keycapComponent,
    stabilizer: stabilizerComponent,
  };
}

// Running estimate over whichever parts are resolved so far: kit-locked parts
// from the start, switches/keycaps once chosen. Same estimate semantics as the
// saved-build total (switch price × ~70).
function estimateAssemblyPrice(
  components: Partial<Record<ComponentCategory, KeyboardComponent>>,
): PriceEstimate | null {
  const prices = componentCategories
    .map((category) => {
      const component = components[category];

      if (
        !component ||
        component.price === undefined ||
        component.priceCurrency === undefined
      ) {
        return undefined;
      }

      return {
        amount:
          category === "switch"
            ? component.price * estimatedSwitchCount
            : component.price,
        currency: component.priceCurrency,
      };
    })
    .filter((price): price is PriceEstimate => price !== undefined);

  const [firstPrice] = prices;

  if (!firstPrice || prices.some((price) => price.currency !== firstPrice.currency)) {
    return null;
  }

  return {
    amount: Number(
      prices.reduce((total, price) => total + price.amount, 0).toFixed(2),
    ),
    currency: firstPrice.currency,
  };
}

function buildSavedBuildTitle(components: CompleteComponentSelection) {
  return `${components.case.name} with ${components.switch.name}`;
}

// Short display name for a whole build: the kit it is based on, never the
// concatenated component string. Prefers the catalog's observedKitName; when
// absent, the kit-derived case name follows "<Kit> <layout> <material> Case"
// (e.g. "Lucky65 V3 65% CNC Aluminum Case"), so everything from the layout
// token onward is descriptor, not kit name.
function getKitDisplayName(caseComponent: KeyboardComponent) {
  const observedKitName = getMetadataString(
    caseComponent.metadata,
    "observedKitName",
  );

  if (observedKitName) {
    return observedKitName;
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

function sectionDomId(title: string) {
  return `configurator-section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

type RecommendationDemoMode = "configurator" | "landing";

type RecommendationDemoProps = {
  initialKitId?: string | null;
  initialPrompt?: string | null;
  // Server-known session presence: gates saving to the account. Logged-out
  // users get a login prompt instead of a silent localStorage write.
  isAuthenticated?: boolean;
  mode?: RecommendationDemoMode;
};


function buildConfiguratorPromptHref(prompt: string) {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    return "/configurator";
  }

  const params = new URLSearchParams({ prompt: trimmedPrompt });

  return `/configurator?${params.toString()}`;
}

// Renders an image-derived intent into an editable natural-language prompt.
function intentToPrompt(intent: ExtractedKeyboardIntent): string {
  const parts: string[] = [];
  if (intent.useCase && intent.useCase !== "unknown") {
    parts.push(`${intent.useCase} use`);
  }
  if (intent.soundProfile) parts.push(`${intent.soundProfile} sound`);
  if (intent.switchTechnology) parts.push(`${intent.switchTechnology} switches`);
  if (intent.layout) parts.push(`${intent.layout} layout`);
  if (intent.budget?.amount) {
    parts.push(`under ${intent.budget.amount} ${intent.budget.currency ?? "MYR"}`);
  }
  if (parts.length === 0) {
    return "A keyboard inspired by the uploaded photo";
  }
  return `A ${parts.join(", ")} keyboard`;
}

// Landing hero entrance: one shared fade-up applied to the headline, subtitle,
// prompt box, and quick chips with a small per-element stagger, so the whole
// hero arrives as a single motion (the standard, quiet pattern for hero copy —
// opacity 0→1 with an 8px rise, ~700ms ease-out). Replaced the earlier
// typewriter headline: the demo panel below types its prompt character by
// character, and two typewriter effects on one screen read as a gimmick rather
// than a choice. Reduced motion renders everything immediately.
type HeroEntranceState = "pending" | "in" | "instant";

export function RecommendationDemo({
  initialKitId = null,
  initialPrompt = null,
  isAuthenticated = false,
  mode = "landing",
}: RecommendationDemoProps = {}) {
  const router = useRouter();
  const promptRef = useRef<HTMLTextAreaElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  // Scroll-linked hero handoff targets (landing only): the runway that gives
  // the pinned stage its scroll distance, the copy block that fades away, and
  // the demo-panel wrapper that travels up into the copy's place.
  const heroRunwayRef = useRef<HTMLDivElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const heroPanelLiftRef = useRef<HTMLDivElement | null>(null);
  const initialPromptSubmittedRef = useRef(false);
  const initialKitSubmittedRef = useRef(false);
  const isLanding = mode === "landing";
  const isConfigurator = mode === "configurator";
  const [message, setMessage] = useState(initialPrompt ?? "");
  const [isManualCheckOpen, setIsManualCheckOpen] = useState(false);
  const [isImagePanelOpen, setIsImagePanelOpen] = useState(false);
  const [keybotOpenSignal, setKeybotOpenSignal] = useState(0);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<
    string | null
  >(null);
  const [activeCategory, setActiveCategory] =
    useState<ComponentCategory>("case");
  const [catalog, setCatalog] = useState<KeyboardComponent[]>([]);
  const [manualSelection, setManualSelection] = useState<ManualSelection>({});
  const [manualValidation, setManualValidation] =
    useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const [savedBuildMessage, setSavedBuildMessage] = useState<string | null>(
    null,
  );
  const [saveRequiresLogin, setSaveRequiresLogin] = useState(false);
  const [isSavingBuild, setIsSavingBuild] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [heroEntrance, setHeroEntrance] =
    useState<HeroEntranceState>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionNote, setVisionNote] = useState<string | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isManualValidating, setIsManualValidating] = useState(false);
  // Progressive assembly: switches/keycaps start deselected and are chosen by
  // the user; kit-locked parts are auto-included with the case.
  const [chosenParts, setChosenParts] = useState<ManualSelection>({});
  const [assemblyValidation, setAssemblyValidation] =
    useState<CompatibilityResult | null>(null);
  const [isAssemblyValidating, setIsAssemblyValidating] = useState(false);

  const selectedRecommendation = useMemo(() => {
    if (!result) {
      return null;
    }

    return (
      result.recommendations.find(
        (recommendation) => recommendation.id === selectedRecommendationId,
      ) ??
      result.recommendations[0] ??
      null
    );
  }, [result, selectedRecommendationId]);

  const selectedComponent = selectedRecommendation?.components[activeCategory];

  const catalogByCategory = useMemo(() => {
    return Object.fromEntries(
      componentCategories.map((category) => [
        category,
        catalog.filter((component) => component.category === category),
      ]),
    ) as Record<ComponentCategory, KeyboardComponent[]>;
  }, [catalog]);

  const catalogById = useMemo(() => {
    return new Map(catalog.map((component) => [component.id, component]));
  }, [catalog]);

  const manualSelectionComplete = componentCategories.every(
    (category) => manualSelection[category],
  );

  // Free-choice categories are derived from the real catalog: anything not
  // kit-locked (and not the case anchor) is a genuine user pick-step.
  const choiceCategories = useMemo(() => {
    if (!selectedRecommendation) {
      return [] as ComponentCategory[];
    }

    return componentCategories.filter(
      (category) =>
        category !== "case" &&
        !isKitLockedComponent(selectedRecommendation.components[category]),
    );
  }, [selectedRecommendation]);

  // Full component-id set once every free choice is made; null while the
  // assembly is still incomplete.
  // The build so far, including partially-filled selections. `assembledComponentIds`
  // deliberately returns null until every category is chosen, but the option
  // pickers need to know what's already selected in order to grey out parts
  // that conflict with it.
  const partialComponentIds = useMemo(() => {
    if (!selectedRecommendation) {
      return {} as Partial<Record<ComponentCategory, string>>;
    }

    const ids: Partial<Record<ComponentCategory, string>> = {};

    for (const category of componentCategories) {
      const id = choiceCategories.includes(category)
        ? chosenParts[category]
        : selectedRecommendation.componentIds[category];

      if (id) {
        ids[category] = id;
      }
    }

    return ids;
  }, [selectedRecommendation, choiceCategories, chosenParts]);

  const assembledComponentIds = useMemo(() => {
    if (!selectedRecommendation) {
      return null;
    }

    const ids: Partial<Record<ComponentCategory, string>> = {};

    for (const category of componentCategories) {
      const id = choiceCategories.includes(category)
        ? chosenParts[category]
        : selectedRecommendation.componentIds[category];

      if (!id) {
        return null;
      }

      ids[category] = id;
    }

    return ids as CompleteComponentIdSelection;
  }, [selectedRecommendation, choiceCategories, chosenParts]);

  // Parts resolved so far (kit-locked always; choices once selected) — drives
  // the running price estimate.
  const assembledParts = useMemo(() => {
    if (!selectedRecommendation) {
      return null;
    }

    const parts: Partial<Record<ComponentCategory, KeyboardComponent>> = {};

    for (const category of componentCategories) {
      if (choiceCategories.includes(category)) {
        const id = chosenParts[category];
        const component = id ? catalogById.get(id) : undefined;

        if (component?.category === category) {
          parts[category] = component;
        }
      } else {
        parts[category] = selectedRecommendation.components[category];
      }
    }

    return parts;
  }, [selectedRecommendation, choiceCategories, chosenParts, catalogById]);

  // The assembled build must pass the same deterministic engine as every other
  // path before it can be saved — the AI never gets the last word.
  useEffect(() => {
    if (!isConfigurator || !assembledComponentIds) {
      return;
    }

    const controller = new AbortController();

    async function validateAssembly() {
      setIsAssemblyValidating(true);

      try {
        const response = await fetch("/api/builds/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            componentIds: assembledComponentIds,
            preferences: {
              layout: result?.intent.layout ?? undefined,
              soundProfile: result?.intent.soundProfile ?? undefined,
              beginnerFriendly: result?.intent.beginnerFriendly ?? undefined,
              maxPrice: result?.criteria.maxPrice ?? undefined,
            },
          }),
          signal: controller.signal,
        });
        const body = (await response.json()) as
          | ValidateBuildApiResponse
          | ApiErrorResponse;

        if (!response.ok || !body.success) {
          throw new Error(
            body.success ? "Build validation failed." : body.error.message,
          );
        }

        setAssemblyValidation(body.data.result);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setAssemblyValidation(null);
      } finally {
        setIsAssemblyValidating(false);
      }
    }

    void validateAssembly();

    return () => controller.abort();
    // Intent preferences only refine warnings; the id set is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigurator, assembledComponentIds]);

  const shouldDisableSubmit =
    isSubmitting || message.trim().length === 0;
  const isSubmitDisabled = hasMounted && shouldDisableSubmit;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHasMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // Hero entrance trigger: fires once shortly after mount so the staggered
  // fade-up lands just after first paint. Landing-only; reduced motion shows
  // everything immediately.
  useEffect(() => {
    if (!isLanding) {
      return;
    }

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setHeroEntrance("instant");
      return;
    }

    const timeoutId = window.setTimeout(() => setHeroEntrance("in"), 100);

    return () => window.clearTimeout(timeoutId);
  }, [isLanding]);

  // Scroll-linked hero handoff (landing only, Attio-style pinned stage): the
  // hero section is `sticky` inside a taller "runway" div, so while the user
  // scrolls through the runway the stage holds still on screen. Progress
  // through the runway drives the sequence: the demo panel physically travels
  // up from its resting spot into the headline's space while the copy fades
  // out beneath it — the panel replaces the copy, not just "scrolls past" it.
  // Styles are written straight to the DOM inside a rAF frame so this large
  // component tree never re-renders during scroll. On viewports where the
  // runway has no spare height (the pinning classes are lg-only) and under
  // reduced motion, everything stays static.
  useEffect(() => {
    if (!isLanding) {
      return;
    }

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
  }, [isLanding]);

  // Per-element entrance classes; the delay class staggers elements into one
  // continuous motion. Returns nothing outside the landing hero so the
  // configurator workspace (and non-animated states) are untouched.
  const heroFade = (delayClass = "") =>
    !isLanding || heroEntrance === "instant"
      ? ""
      : ` transition-all duration-700 ease-out ${delayClass} ${
          heroEntrance === "in"
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        }`;

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        setCatalogError(null);
        const response = await fetch("/api/components", {
          signal: controller.signal,
        });
        const body = (await response.json()) as
          | ComponentsApiResponse
          | ApiErrorResponse;

        if (!response.ok || !body.success) {
          throw new Error(
            body.success ? "Component catalog failed to load." : body.error.message,
          );
        }

        setCatalog(body.data.components);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setCatalogError(
          caughtError instanceof Error
            ? caughtError.message
            : "Component catalog failed to load.",
        );
      } finally {
        setIsCatalogLoading(false);
      }
    }

    void loadCatalog();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const trimmedInitialPrompt = initialPrompt?.trim();

    if (
      !isConfigurator ||
      !trimmedInitialPrompt ||
      initialPromptSubmittedRef.current
    ) {
      return;
    }

    initialPromptSubmittedRef.current = true;
    setMessage(trimmedInitialPrompt);
    void runRecommendationRequest(trimmedInitialPrompt);
    // The prompt query is a one-time route handoff into the configurator workspace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, isConfigurator]);

  // Browse hands a kit off via ?kit=<kitId>: once the real catalog confirms the
  // kit exists, run one anchored recommendation request. The result flows
  // through the normal progressive assembly, so switches/keycaps start
  // deselected and the engine still validates the final build. An explicit
  // prompt handoff takes precedence over the kit anchor.
  useEffect(() => {
    const trimmedInitialKitId = initialKitId?.trim();

    if (
      !isConfigurator ||
      !trimmedInitialKitId ||
      initialPrompt?.trim() ||
      initialKitSubmittedRef.current ||
      catalog.length === 0
    ) {
      return;
    }

    const kitCase = catalog.find(
      (component) =>
        component.category === "case" &&
        isKitLockedComponent(component) &&
        getMetadataString(component.metadata, "kitId") === trimmedInitialKitId,
    );

    if (!kitCase) {
      return;
    }

    const kitPrompt = `Start from the ${getKitDisplayName(kitCase)} barebones kit`;
    const timeoutId = window.setTimeout(() => {
      initialKitSubmittedRef.current = true;
      setMessage(kitPrompt);
      void runRecommendationRequest(kitPrompt, trimmedInitialKitId);
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // One-time route handoff; catalog arrival is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKitId, initialPrompt, isConfigurator, catalog]);

  async function runRecommendationRequest(
    nextMessage = message,
    anchorKitId?: string,
  ) {
    setError(null);
    setManualError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          anchorKitId
            ? { message: nextMessage, kitId: anchorKitId }
            : { message: nextMessage },
        ),
      });
      const body = (await response.json()) as
        | RecommendationsApiResponse
        | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(
          body.success ? "Recommendation request failed." : body.error.message,
        );
      }

      setResult(body.data);
      const firstRecommendation = body.data.recommendations[0];
      setSelectedRecommendationId(firstRecommendation?.id ?? null);
      setActiveCategory("case");
      setManualValidation(null);
      setSavedBuildMessage(null);
      setChosenParts({});
      setAssemblyValidation(null);

      if (firstRecommendation) {
        setManualSelection(firstRecommendation.componentIds);
      } else {
        setManualSelection({});
        setManualValidation(null);
        setManualError(null);
      }

      window.setTimeout(() => {
        if (typeof resultsRef.current?.scrollIntoView === "function") {
          resultsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 0);
    } catch (caughtError) {
      setResult(null);
      setSelectedRecommendationId(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Recommendation request failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (shouldDisableSubmit) {
      return;
    }

    if (isLanding) {
      router.push(buildConfiguratorPromptHref(message));
      return;
    }

    await runRecommendationRequest();
  }

  async function handleQuickPrompt(prompt: string) {
    if (isSubmitting) {
      return;
    }

    if (isLanding) {
      router.push(buildConfiguratorPromptHref(prompt));
      return;
    }

    setMessage(prompt);
    await runRecommendationRequest(prompt);
  }

  // Phase 5: turn an uploaded inspiration photo (fused with any typed text) into
  // a prompt the user can edit, then run through the normal recommendation flow.
  async function handleImageChange(dataUrl: string | null) {
    setImageDataUrl(dataUrl);
    setVisionNote(null);
    if (!dataUrl) return;

    setVisionLoading(true);
    try {
      const response = await fetch("/api/ai/vision-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          message: message.trim() || undefined,
        }),
      });
      const body = (await response.json()) as
        | AiIntentApiResponse
        | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(
          body.success ? "Image request failed." : body.error.message,
        );
      }

      setMessage(intentToPrompt(body.data.intent));
      setVisionNote(
        body.data.source === "openai"
          ? "Filled from your image — edit the prompt or press Start."
          : "OpenAI key is not configured, so the image could not be read. Type your request instead.",
      );
    } catch (caughtError) {
      setVisionNote(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not read the image.",
      );
    } finally {
      setVisionLoading(false);
    }
  }

  async function validateManualSelection() {
    if (isManualValidating) {
      return;
    }

    setManualError(null);
    setManualValidation(null);

    if (!manualSelectionComplete) {
      setManualError("Select one component from every category before validating.");
      return;
    }

    setIsManualValidating(true);

    try {
      const componentIds = Object.fromEntries(
        componentCategories.map((category) => [
          category,
          manualSelection[category] ?? "",
        ]),
      );
      const response = await fetch("/api/builds/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          componentIds,
          preferences: {
            layout: result?.intent.layout ?? undefined,
            soundProfile: result?.intent.soundProfile ?? undefined,
            beginnerFriendly: result?.intent.beginnerFriendly ?? undefined,
            maxPrice: result?.criteria.maxPrice ?? undefined,
          },
        }),
      });
      const body = (await response.json()) as
        | ValidateBuildApiResponse
        | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(
          body.success ? "Build validation failed." : body.error.message,
        );
      }

      setManualValidation(body.data.result);
    } catch (caughtError) {
      setManualError(
        caughtError instanceof Error
          ? caughtError.message
          : "Build validation failed.",
      );
    } finally {
      setIsManualValidating(false);
    }
  }

  function loadRecommendationIntoManualPanel(recommendation: RecommendationBuild) {
    setManualSelection(recommendation.componentIds);
    setManualValidation(null);
    setManualError(null);
  }

  // Account-backed save. Client-side validity checks above are UX only — the
  // server action recomputes validation from the catalog before inserting
  // (the rule engine stays the only authority). Logged-out users are prompted
  // to log in; nothing is written to localStorage anymore.
  async function saveBuildToAccount(input: {
    title: string;
    source: SavedBuildSource;
    componentIds: CompleteComponentIdSelection;
  }) {
    if (!isAuthenticated) {
      setSaveRequiresLogin(true);
      setSavedBuildMessage("Log in to save builds to your account.");
      return;
    }

    setSaveRequiresLogin(false);
    setIsSavingBuild(true);
    try {
      const saveResult = await saveBuildAction(input);
      setSavedBuildMessage(
        saveResult.ok ? `${input.title} saved to your builds.` : saveResult.error,
      );
    } catch {
      setSavedBuildMessage("Could not save the build. Please try again.");
    } finally {
      setIsSavingBuild(false);
    }
  }

  function saveRecommendationBuild(recommendation: RecommendationBuild) {
    if (!recommendation.validation.isValid) {
      setSavedBuildMessage(
        "Only builds that pass deterministic validation can be saved.",
      );
      return;
    }

    void saveBuildToAccount({
      title: recommendation.title,
      source: "recommendation",
      componentIds: recommendation.componentIds,
    });
  }

  function saveValidatedManualBuild() {
    const componentIds = toCompleteComponentIds(manualSelection);

    if (!componentIds || !manualValidation?.isValid) {
      setManualError(
        "Validate a complete compatible build before saving it.",
      );
      return;
    }

    const components = resolveCompleteComponents(componentIds, catalogById);

    if (!components) {
      setManualError("Saved build components could not be resolved from the catalog.");
      return;
    }

    void saveBuildToAccount({
      title: `Manual build: ${buildSavedBuildTitle(components)}`,
      source: "manual",
      componentIds,
    });
  }

  if (isConfigurator) {
    const activeBuild = selectedRecommendation;
    const buildValid = activeBuild?.validation.isValid ?? null;
    const buildErrorCount = activeBuild?.validation.errors.length ?? 0;
    // Running total: kit-locked parts from the start, choices as they land.
    const runningPriceEstimate = assembledParts
      ? estimateAssemblyPrice(assembledParts)
      : null;
    const buildPrice = runningPriceEstimate
      ? formatEstimatedTotal(
          runningPriceEstimate.amount,
          runningPriceEstimate.currency,
        )
      : null;
    const isDesigning = isSubmitting || visionLoading;
    const activeKitId = activeBuild
      ? getMetadataString(activeBuild.components.case.metadata, "kitId") ?? null
      : null;
    const buildDisplayName = activeBuild
      ? getKitDisplayName(activeBuild.components.case)
      : null;
    const isBuildComplete = assembledComponentIds !== null;
    const canSaveAssembly =
      isBuildComplete &&
      !isAssemblyValidating &&
      !isSavingBuild &&
      Boolean(assemblyValidation?.isValid);
    // A section is resolved when none of its categories still awaits a user
    // choice — kit-locked sections resolve as soon as the case is set.
    const reviewSections = activeBuild
      ? configuratorSections
          .filter((section) =>
            section.categories.some(
              (category) => activeBuild.components[category],
            ),
          )
          .map((section) => ({
            id: sectionDomId(section.title),
            title: section.title,
            resolved: section.categories.every(
              (category) =>
                !choiceCategories.includes(category) ||
                Boolean(chosenParts[category]),
            ),
          }))
      : [];

    // Alternatives are drawn only from rule-engine-validated recommendations;
    // choosing one selects that validated build (never bypasses the engine).
    const getCategoryOptions = (category: ComponentCategory) => {
      if (!result) {
        return [];
      }

      const seen = new Set<string>();
      const options: Array<{
        component: KeyboardComponent;
        recommendation: RecommendationBuild;
      }> = [];

      for (const recommendation of result.recommendations) {
        const component = recommendation.components[category];

        if (!seen.has(component.id)) {
          seen.add(component.id);
          options.push({ component, recommendation });
        }
      }

      return options;
    };

    // Options for free-choice sections: engine-validated recommendation parts
    // lead (the AI's picks), then the remaining pipeline candidates from the
    // real catalog. Whatever the user assembles still goes through
    // /api/builds/validate before it can be saved — never an engine bypass.
    //
    // Kit ownership rule (data-driven, not a product allow-list): a part that
    // is kit-locked to a DIFFERENT kit ships only with that kit, so it is
    // never offered on this build. The active kit's own kit-locked part is
    // always offered (it comes in the box), listed first; aftermarket parts
    // follow as upgrades sorted by price low→high.
    const getChoiceOptions = (category: ComponentCategory) => {
      if (!result) {
        return [];
      }

      const seen = new Set<string>();
      const options: KeyboardComponent[] = [];

      const pushOption = (component: KeyboardComponent | undefined) => {
        if (
          component &&
          component.category === category &&
          !seen.has(component.id)
        ) {
          seen.add(component.id);
          options.push(component);
        }
      };

      const kitIdOf = (component: KeyboardComponent) =>
        getMetadataString(component.metadata, "kitId");

      // The kit's own part for this category always leads the list.
      if (activeKitId) {
        for (const component of catalog) {
          if (
            component.category === category &&
            isKitLockedComponent(component) &&
            kitIdOf(component) === activeKitId
          ) {
            pushOption(component);
          }
        }
      }

      for (const recommendation of result.recommendations) {
        pushOption(recommendation.components[category]);
      }

      for (const componentId of result.candidateComponentIds[category] ?? []) {
        pushOption(catalogById.get(componentId));
      }

      // Manual configuration is not limited to the AI's shortlist. Offer every
      // catalog part in this category — the rule-engine gate at render time
      // hides whatever cannot work with the current selection. Without this,
      // choosing the hall-effect PCB left zero switches to pick from, because
      // the shortlist had been built for a clacky (mechanical) query.
      for (const component of catalog) {
        if (component.category === category) {
          pushOption(component);
        }
      }

      // Never offer a part locked to another kit.
      const offerable = options.filter(
        (component) =>
          !isKitLockedComponent(component) ||
          kitIdOf(component) === activeKitId,
      );

      const ownKitParts = offerable.filter(isKitLockedComponent);

      if (ownKitParts.length === 0) {
        return offerable;
      }

      const aftermarketParts = offerable
        .filter((component) => !isKitLockedComponent(component))
        .sort(
          (a, b) =>
            (a.price ?? Number.POSITIVE_INFINITY) -
            (b.price ?? Number.POSITIVE_INFINITY),
        );

      return [...ownKitParts, ...aftermarketParts];
    };

    const selectRecommendation = (recommendation: RecommendationBuild) => {
      setSelectedRecommendationId(recommendation.id);
      loadRecommendationIntoManualPanel(recommendation);
      // A new kit anchor restarts the progressive assembly: free choices
      // return to their deselected state.
      setChosenParts({});
      setAssemblyValidation(null);
      setSavedBuildMessage(null);
    };

    const choosePart = (category: ComponentCategory, componentId: string) => {
      setChosenParts((current) => ({ ...current, [category]: componentId }));
      // Stale result must not enable saving while the new combination is
      // re-validated by the engine.
      setAssemblyValidation(null);
      setSavedBuildMessage(null);
    };

    // "Start from a build": adopting a recommendation fills every free-choice
    // section with that build's parts (kit-locked parts follow the case
    // automatically). The completed assembly then re-validates through the
    // same engine effect as a manual assembly — no bypass. Sections stay
    // editable afterwards.
    const adoptRecommendation = (recommendation: RecommendationBuild) => {
      setSelectedRecommendationId(recommendation.id);
      loadRecommendationIntoManualPanel(recommendation);

      const nextChosenParts: ManualSelection = {};

      for (const category of componentCategories) {
        if (
          category !== "case" &&
          !isKitLockedComponent(recommendation.components[category])
        ) {
          nextChosenParts[category] = recommendation.componentIds[category];
        }
      }

      setChosenParts(nextChosenParts);
      setAssemblyValidation(null);
      setSavedBuildMessage(null);
    };

    // Saving requires the full assembly to have passed the deterministic
    // engine (assemblyValidation) — completeness alone is not enough.
    const saveAssembledBuild = () => {
      if (!assembledComponentIds || !assemblyValidation?.isValid) {
        setSavedBuildMessage(
          "Choose switches and keycaps to complete the build before saving.",
        );
        return;
      }

      const components = resolveCompleteComponents(
        assembledComponentIds,
        catalogById,
      );

      if (!components) {
        setSavedBuildMessage(
          "Build parts could not be resolved from the catalog.",
        );
        return;
      }

      void saveBuildToAccount({
        title: buildSavedBuildTitle(components),
        source: "recommendation",
        componentIds: assembledComponentIds,
      });
    };

    return (
      <div className="min-h-screen bg-surface text-primary">
        <MainNav active="Configurator" />

        <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:py-10">
          {/* LEFT — product visual */}
          <section
            aria-label="Build visual"
            className="min-w-0 lg:sticky lg:top-16 lg:self-start"
          >
            {activeBuild ? (
              <div className="mb-6 min-w-0">
                <h1 className="text-h1 text-primary">{buildDisplayName}</h1>
                {buildPrice ? (
                  <p className="mt-2 text-base text-secondary">
                    From {buildPrice}
                  </p>
                ) : null}
                {buildValid === false ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-error/10 px-3 py-1.5 text-xs font-semibold text-error">
                    <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
                    {buildErrorCount > 0
                      ? `${buildErrorCount} blocker${buildErrorCount > 1 ? "s" : ""}`
                      : "Blocked"}
                  </span>
                ) : null}
              </div>
            ) : null}

            <KitVisual
              key={activeKitId ?? "empty"}
              kitId={activeKitId}
              kitName={buildDisplayName ?? "Keyboard build"}
            />

            {activeBuild ? (
              <BuildSummary
                catalogById={catalogById}
                choiceCategories={choiceCategories}
                chosenParts={chosenParts}
              />
            ) : (
              <p className="mt-5 text-sm leading-6 text-secondary">
                Ask Meg to resolve a validated build — it appears here with the
                kit it is based on.
              </p>
            )}
          </section>

          {/* RIGHT — configuration rail */}
          <section className="flex min-w-0 flex-col">
            <header className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-full bg-accent-subtle"
              >
                <Image
                  alt="Meg"
                  className="h-full w-full rounded-full object-cover"
                  height={40}
                  src="/meg-avatar.png"
                  width={40}
                />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-primary">
                  Ask Meg
                </h2>
                <p className="text-xs text-secondary">AI build control</p>
              </div>
              <button
                aria-label="Open Meg chat"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-secondary transition hover:bg-accent-subtle hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
                onClick={() => setKeybotOpenSignal((current) => current + 1)}
                type="button"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
              </button>
            </header>

            <form
              aria-label="AI keyboard prompt form"
              className="mt-4 flex items-center gap-1.5 rounded-pill border-[0.5px] border-border bg-surface py-1.5 pl-2 pr-1.5 transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15"
              onSubmit={handleSubmit}
            >
              <button
                aria-expanded={isImagePanelOpen}
                aria-label="Add an inspiration photo"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-secondary transition hover:bg-accent-subtle hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
                onClick={() => setIsImagePanelOpen((current) => !current)}
                type="button"
              >
                <ImageIcon className="h-4 w-4" aria-hidden />
              </button>
              <button
                aria-label="Voice input is not available yet"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-secondary transition disabled:cursor-not-allowed disabled:opacity-55"
                disabled
                type="button"
              >
                <Mic className="h-4 w-4" aria-hidden />
              </button>

              <label className="sr-only" htmlFor="keyboard-request">
                Keyboard request
              </label>
              <textarea
                className="h-10 min-w-0 flex-1 resize-none border-none bg-transparent px-1 py-2 text-sm leading-6 text-primary outline-none placeholder:text-secondary/70 focus:ring-0"
                id="keyboard-request"
                maxLength={2000}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="A deep thocky build for a quiet office..."
                ref={promptRef}
                rows={1}
                value={message}
              />

              <button
                className="inline-flex h-10 flex-none items-center justify-center gap-2 rounded-pill bg-accent px-4 text-sm font-bold text-white transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={isSubmitDisabled}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    <span>Designing…</span>
                  </>
                ) : (
                  <>
                    <span>Design my build</span>
                    <Sparkles className="h-4 w-4" aria-hidden />
                  </>
                )}
              </button>
            </form>

            {isImagePanelOpen || imageDataUrl ? (
              <div className="mt-3">
                <ImageDrop
                  disabled={isSubmitting || visionLoading}
                  onChange={(value) => void handleImageChange(value)}
                  value={imageDataUrl}
                />
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {configuratorQuickPrompts.map((prompt) => (
                <button
                  className="inline-flex min-h-9 items-center rounded-pill border-[0.5px] border-border bg-surface px-4 py-1.5 text-sm font-medium text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={hasMounted && isSubmitting}
                  key={prompt.label}
                  onClick={() => void handleQuickPrompt(prompt.prompt)}
                  type="button"
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {isDesigning ? (
                <div className="inline-flex w-full items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-bold text-white">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {visionLoading
                    ? "Reading your image…"
                    : "Meg is designing your build…"}
                </div>
              ) : null}

              {visionNote ? (
                <p className="rounded-lg bg-accent-subtle px-4 py-3 text-sm font-medium text-primary">
                  {visionNote}
                </p>
              ) : null}

              {error ? (
                <Notice icon={AlertCircle} message={error} tone="red" />
              ) : null}

              {savedBuildMessage ? (
                <Notice
                  icon={Info}
                  message={
                    saveRequiresLogin ? (
                      <>
                        {savedBuildMessage}{" "}
                        <Link
                          className="font-semibold text-primary underline"
                          href="/login?next=/configurator"
                        >
                          Log in
                        </Link>
                      </>
                    ) : (
                      `${savedBuildMessage} View saved builds on the My Builds page.`
                    )
                  }
                  tone="sky"
                />
              ) : null}

              {result?.source === "fallback_missing_api_key" ? (
                <Notice
                  icon={Info}
                  message="OpenAI key is not configured, so this demo is using local keyword extraction."
                  tone="sky"
                />
              ) : null}
            </div>

            <section
              aria-label="Resolved build configuration"
              className="mt-6 flex-1 space-y-8"
              id="results"
              ref={resultsRef}
            >
              {activeBuild ? (
                <>
                  {result && result.recommendations.length > 0 ? (
                    <RecommendationCarousel
                      onSaveRecommendation={saveRecommendationBuild}
                      onSelect={adoptRecommendation}
                      recommendations={result.recommendations}
                      selectedId={selectedRecommendation?.id ?? null}
                    />
                  ) : null}

                  {configuratorSections.map((section) => (
                    <section id={sectionDomId(section.title)} key={section.title}>
                      <h3 className="text-h2 text-primary">
                        {section.title}.{" "}
                        <span className="text-secondary">
                          {section.prompt}
                        </span>
                      </h3>

                      <div className="mt-4 space-y-2.5">
                        {section.categories.flatMap((category) => {
                          const recommendedPart =
                            activeBuild.components[category];

                          // Kit-locked parts (and the case anchor's siblings)
                          // are resolved by the kit, not picked: render them
                          // as included, without a pick affordance.
                          if (
                            category !== "case" &&
                            !choiceCategories.includes(category)
                          ) {
                            return [
                              <div
                                className="flex w-full items-center justify-between gap-4 rounded-lg border-[0.5px] border-border bg-surface-secondary/60 p-4"
                                key={`${category}-${recommendedPart.id}`}
                              >
                                <div className="min-w-0">
                                  <p className="text-base font-semibold text-primary">
                                    {recommendedPart.name}
                                  </p>
                                  <p className="mt-0.5 line-clamp-1 text-sm leading-6 text-secondary">
                                    {recommendedPart.description}
                                  </p>
                                  <p className="mt-2 inline-flex items-center rounded-pill bg-accent-subtle px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    Included with this kit
                                  </p>
                                </div>
                                <span className="flex-none text-sm font-semibold text-primary">
                                  {formatComponentPrice(recommendedPart)}
                                </span>
                              </div>,
                            ];
                          }

                          const isChoice = category !== "case";
                          const chosenId = chosenParts[category] ?? null;
                          // AI's pick leads the list but is never pre-selected
                          // for free-choice categories. Choice sections also
                          // surface the wider candidate pool from the catalog.
                          const choiceOptions = isChoice
                            ? getChoiceOptions(category).map((component) => ({
                                component,
                                recommendation: null,
                              }))
                            : getCategoryOptions(category);
                          // When the kit's own part leads the list its order
                          // is already Apple-style (included first, upgrades
                          // by price); otherwise float the AI's pick to top.
                          const hasOwnKitOption =
                            isChoice &&
                            choiceOptions.some(({ component }) =>
                              isKitLockedComponent(component),
                            );
                          const options = hasOwnKitOption
                            ? choiceOptions
                            : [...choiceOptions].sort(
                                (a, b) =>
                                  Number(b.component.id === recommendedPart.id) -
                                  Number(a.component.id === recommendedPart.id),
                              );

                          // Ask the rule engine, don't re-derive the rules
                          // here: whatever it would reject after the pick is
                          // what gets hidden before it.
                          const optionsWithConflicts = options.map((option) => ({
                            ...option,
                            conflicts: isChoice
                              ? getOptionConflicts(
                                  category,
                                  option.component.id,
                                  partialComponentIds,
                                  catalog,
                                )
                              : [],
                          }));
                          const compatibleOptions = optionsWithConflicts.filter(
                            (option) =>
                              option.conflicts.length === 0 ||
                              option.component.id === chosenId,
                          );
                          // Safeguard: if nothing is compatible, show the full
                          // list with reasons rather than an empty step. An
                          // empty section is more confusing than a struck-out
                          // one, and it hides *why* the build is stuck.
                          const visibleOptions =
                            compatibleOptions.length > 0
                              ? compatibleOptions
                              : optionsWithConflicts;

                          return visibleOptions.map(
                            ({ component, recommendation, conflicts }) => {
                            const selected = isChoice
                              ? component.id === chosenId
                              : component.id === recommendedPart.id;
                            const isOwnKitPart =
                              isChoice && isKitLockedComponent(component);
                            const swatch = getComponentSwatch(component);
                            const blocked = conflicts.length > 0 && !selected;

                            return (
                              <button
                                aria-pressed={selected}
                                className={`flex w-full items-center justify-between gap-4 rounded-lg p-4 text-left transition ${
                                  selected
                                    ? "border-[1.5px] border-accent bg-accent-subtle/50"
                                    : blocked
                                      ? "cursor-not-allowed border-[0.5px] border-border bg-surface-secondary/40 opacity-55"
                                      : "border-[0.5px] border-border hover:border-border-strong"
                                }`}
                                disabled={blocked}
                                key={`${category}-${component.id}`}
                                onClick={() => {
                                  if (blocked) {
                                    return;
                                  }

                                  if (isChoice) {
                                    choosePart(category, component.id);
                                  } else if (recommendation) {
                                    selectRecommendation(recommendation);
                                  }
                                }}
                                title={blocked ? conflicts[0]?.message : undefined}
                                type="button"
                              >
                                <span className="min-w-0">
                                  <span className="flex min-w-0 items-center gap-2">
                                    {swatch ? <SwatchDots colors={swatch} /> : null}
                                    <span className="block text-base font-semibold text-primary">
                                      {component.name}
                                    </span>
                                  </span>
                                  <span className="mt-0.5 line-clamp-1 block text-sm leading-6 text-secondary">
                                    {component.description}
                                  </span>
                                  {isOwnKitPart ? (
                                    <span className="mt-2 inline-flex items-center rounded-pill bg-accent-subtle px-2.5 py-0.5 text-xs font-semibold text-primary">
                                      Included with this kit
                                    </span>
                                  ) : null}
                                  {blocked ? (
                                    <span className="mt-2 block text-xs font-semibold leading-5 text-secondary">
                                      Not compatible — {conflicts[0]?.message}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="flex-none text-sm font-semibold text-primary">
                                  {formatComponentPrice(component)}
                                </span>
                              </button>
                            );
                          });
                        })}
                      </div>
                    </section>
                  ))}
                </>
              ) : result && result.recommendations.length === 0 ? (
                <EmptyRecommendationState result={result} />
              ) : null}

              {/* Manual compatibility check — quiet secondary path */}
              <div className="border-t-[0.5px] border-border pt-4">
                <button
                  aria-expanded={isManualCheckOpen}
                  aria-label={
                    isManualCheckOpen ? "Hide manual check" : "Open manual check"
                  }
                  className="text-sm font-medium text-secondary underline-offset-4 transition hover:text-primary hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
                  onClick={() => setIsManualCheckOpen((current) => !current)}
                  type="button"
                >
                  {isManualCheckOpen ? "Hide manual picker" : "Hand-pick manually"}
                </button>

                {isManualCheckOpen ? (
                  <div className="mt-4">
                    <ManualSelectionPanel
                      catalogByCategory={catalogByCategory}
                      catalogError={catalogError}
                      hasMounted={hasMounted}
                      isCatalogLoading={isCatalogLoading}
                      isManualValidating={isManualValidating}
                      manualError={manualError}
                      manualSelection={manualSelection}
                      manualSelectionComplete={manualSelectionComplete}
                      manualValidation={manualValidation}
                      onSelect={(category, componentId) => {
                        setManualSelection((current) => ({
                          ...current,
                          [category]: componentId || undefined,
                        }));
                        setManualValidation(null);
                        setSavedBuildMessage(null);
                      }}
                      onSaveValidatedManualBuild={saveValidatedManualBuild}
                      onValidate={() => void validateManualSelection()}
                    />
                  </div>
                ) : null}
              </div>
            </section>

            {activeBuild ? (
              <div className="sticky bottom-0 mt-8 border-t-[0.5px] border-border bg-surface/95 py-4 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary">
                      {buildDisplayName}
                    </p>
                    {buildPrice ? (
                      <p className="text-sm text-secondary">From {buildPrice}</p>
                    ) : null}
                    {!isBuildComplete ? (
                      <p className="text-xs text-secondary">
                        Choose{" "}
                        {choiceCategories
                          .filter((category) => !chosenParts[category])
                          .map((category) =>
                            categoryLabels[category].toLowerCase(),
                          )
                          .join(", ")}{" "}
                        to finish
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-none items-center gap-2">
                    <button
                      aria-label="Save to favourites"
                      className="flex h-10 w-10 items-center justify-center rounded-full border-[0.5px] border-border text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={!canSaveAssembly}
                      onClick={saveAssembledBuild}
                      type="button"
                    >
                      <Heart className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      className="inline-flex h-10 items-center justify-center rounded-pill bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={!canSaveAssembly}
                      onClick={saveAssembledBuild}
                      type="button"
                    >
                      Save build
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        {activeBuild && reviewSections.length > 1 ? (
          <ResolutionProgress sections={reviewSections} />
        ) : null}

        <FloatingKeybot
          catalogById={catalogById}
          manualSelection={manualSelection}
          openSignal={keybotOpenSignal}
          result={result}
          selectedRecommendation={selectedRecommendation}
        />
      </div>
    );
  }

  return (
    <div
      // overflow-x-CLIP, not -hidden: hidden overflow on an ancestor silently
      // disables position:sticky for everything inside it (the ancestor
      // becomes the sticking context but never scrolls). clip guards against
      // horizontal scrollbars identically while leaving the sticky nav and
      // the pinned hero stage working.
      className={`min-h-screen overflow-x-clip text-primary ${
        isLanding ? "bg-surface" : "bg-surface-secondary"
      }`}
    >
      <MainNav />

      {/* Full-bleed hero wrapper: hosts the backdrop (gradient + grid) so it
          spans the whole viewport width while the content section stays at its
          max-width. The backdrop ends exactly where this wrapper ends — the
          sections below it stay plain. */}
      <div className="relative">
        {isLanding ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Soft wash: white at the top, the design system's subtle accent
                fill at the bottom, strongest around the demo panel. */}
            <div
              className="absolute inset-0"
              style={{
                // A clearly visible wash of the system accent: ~16% accent
                // mixed into white at the bottom (accent-subtle alone is too
                // faint to read as a gradient at all).
                background:
                  "linear-gradient(to bottom, var(--surface) 0%, var(--surface) 10%, color-mix(in srgb, var(--accent) 22%, white) 100%)",
              }}
            />
            {/* Fine vertical hairline grid, Attio-style: tight 12px columns
                with LOW-contrast 1px lines — the quality read comes from the
                lines being felt rather than seen. Tiled background-size keeps
                each line crisply 1px (repeating-gradients can smear across
                device pixels). Revealed progressively over the tinted area. */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "12px 100%",
                maskImage:
                  "linear-gradient(to bottom, transparent 18%, black 65%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 18%, black 65%)",
              }}
            />
          </div>
        ) : null}

      {/* Runway: taller than the viewport at lg so the sticky stage inside it
          pins while the handoff plays. Inert (plain div) below lg and on the
          configurator route. */}
      <div
        className={isLanding ? "lg:h-[180vh]" : undefined}
        ref={heroRunwayRef}
      >
      <section
        className={`relative mx-auto flex w-full flex-col items-center px-4 text-center sm:px-8 ${
          isLanding
            ? "max-w-[920px] pb-20 pt-20 lg:sticky lg:top-12 lg:h-[calc(100vh-3rem)] lg:overflow-hidden lg:pb-0 lg:pt-16"
            : "max-w-screen-xl pb-10 pt-12 lg:pb-14 lg:pt-16"
        }`}
        id="configurator"
      >
        {/* Copy block: fades and rises away as the scroll handoff plays. */}
        <div
          className="flex w-full flex-col items-center will-change-transform"
          ref={heroCopyRef}
        >
        <h1
          className={`max-w-4xl text-primary ${
            isLanding
              ? "text-h1 sm:text-display"
              : "text-4xl font-black leading-[1.08] tracking-[-0.01em] sm:text-5xl"
          }${heroFade()}`}
        >
          {isLanding
            ? "Build your dream keyboard in words."
            : "Configurator workspace"}
        </h1>
        <p
          className={`mt-6 max-w-xl text-base leading-7 text-secondary${heroFade("delay-150")}`}
        >
          {isLanding
            ? "Describe your sound, layout, and budget — sharkeys turns it into compatible builds."
            : "Generate validated recommendations, compare builds, and inspect grounded catalog parts."}
        </p>

        {/* The form animates via a wrapper: the form element's own `transition`
            class serves its focus ring, and inheriting a 700ms duration there
            would make focus feedback sluggish. */}
        <div
          className={`flex w-full flex-col items-center${heroFade("delay-300")}`}
        >
        <form
          aria-label="AI keyboard prompt form"
          className="mt-10 flex w-full max-w-2xl items-center gap-2 rounded-pill border-[0.5px] border-border bg-surface py-1.5 pl-2 pr-1.5 text-left transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-none gap-1 text-secondary">
            <button
              aria-label="Voice input is not available yet"
              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-accent-subtle disabled:cursor-not-allowed disabled:opacity-55"
              disabled
              type="button"
            >
              <Mic className="h-4 w-4" aria-hidden />
            </button>
            <button
              aria-label="Image input is not available yet"
              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-accent-subtle disabled:cursor-not-allowed disabled:opacity-55"
              disabled
              type="button"
            >
              <ImageIcon className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <label className="sr-only" htmlFor="keyboard-request">
            Keyboard request
          </label>
          <textarea
            className="h-10 min-w-0 flex-1 resize-none border-none bg-transparent px-1 py-2 text-sm leading-6 text-primary outline-none placeholder:text-secondary/70 focus:ring-0"
            id="keyboard-request"
            maxLength={2000}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Quiet office board under RM300..."
            ref={promptRef}
            rows={1}
            value={message}
          />

          <button
            className="inline-flex h-10 flex-none items-center justify-center gap-2 rounded-pill bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={isSubmitDisabled}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span>Starting...</span>
              </>
            ) : (
              <span>Start Building</span>
            )}
          </button>
        </form>
        </div>

        <div
          className={`mt-5 flex max-w-4xl flex-wrap justify-center gap-3${heroFade("delay-[450ms]")}`}
        >
          {quickPrompts.map((prompt) => (
            <button
              className="inline-flex min-h-9 items-center rounded-pill border-[0.5px] border-border bg-surface px-5 py-2 text-sm font-medium text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={hasMounted && isSubmitting}
              key={prompt}
              onClick={() => void handleQuickPrompt(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        {error ? (
          <Notice
            className="mt-6 max-w-3xl"
            icon={AlertCircle}
            message={error}
            tone="red"
          />
        ) : null}
        </div>

        {/* Attio-style demo panel: sits at the bottom of the hero so its top
            slice is visible on first paint and scrolling reveals the full
            mock window. The lift wrapper is the scroll-handoff target that
            pulls it up over the fading copy. Decorative replay of a recorded
            pipeline run — the form above stays the only real entry point. */}
        {isLanding ? (
          <div className="w-full will-change-transform" ref={heroPanelLiftRef}>
            <HeroConfiguratorDemo />
          </div>
        ) : null}
      </section>
      </div>

      {/* Run-out: tinted breathing room between the hero and the next
          section — the backdrop (gradient + grid) fills it, so the hero
          exhales before the plain-white sections begin. */}
      {isLanding ? <div aria-hidden className="h-20 lg:h-32" /> : null}
      </div>

      {isLanding ? (
        <>
          <FeatureCardsSection />
          <FounderQuoteSection />
          <CustomerReviewsSection />
          <FaqSection />
        </>
      ) : null}

      {isConfigurator ? (
        <section
          className="px-4 py-12 sm:px-8 lg:px-16"
          id="results"
          ref={resultsRef}
        >
        <div className="mx-auto w-full max-w-screen-xl">
          <WorkspaceHeader result={result} selected={selectedRecommendation} />

          {savedBuildMessage ? (
            <Notice
              className="mt-5"
              icon={Info}
              message={
                saveRequiresLogin ? (
                  <>
                    {savedBuildMessage}{" "}
                    <Link
                      className="font-semibold text-primary underline"
                      href="/login?next=/"
                    >
                      Log in
                    </Link>
                  </>
                ) : (
                  `${savedBuildMessage} View saved builds on the My Builds page.`
                )
              }
              tone="sky"
            />
          ) : null}

          {result?.source === "fallback_missing_api_key" ? (
            <Notice
              className="mt-5"
              icon={Info}
              message="OpenAI key is not configured, so this demo is using local keyword extraction."
              tone="sky"
            />
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              {result && result.recommendations.length === 0 ? (
                <EmptyRecommendationState result={result} />
              ) : null}

              {result && result.recommendations.length > 0 ? (
                <div className="grid gap-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
                  <RecommendationList
                    onSelect={(recommendation) => {
                      setSelectedRecommendationId(recommendation.id);
                      loadRecommendationIntoManualPanel(recommendation);
                    }}
                    recommendations={result.recommendations}
                    selectedId={selectedRecommendation?.id ?? null}
                  />

                  {selectedRecommendation ? (
                    <RecommendationInspector
                      activeCategory={activeCategory}
                      onActiveCategoryChange={setActiveCategory}
                      onSaveRecommendation={saveRecommendationBuild}
                      recommendation={selectedRecommendation}
                      selectedComponent={selectedComponent}
                    />
                  ) : null}
                </div>
              ) : null}

              {!result ? <EmptyWorkspace /> : null}
            </div>

            <aside className="space-y-6">
              <IntentPanel result={result} />

              <ManualSelectionPanel
                catalogByCategory={catalogByCategory}
                catalogError={catalogError}
                hasMounted={hasMounted}
                isCatalogLoading={isCatalogLoading}
                isManualValidating={isManualValidating}
                manualError={manualError}
                manualSelection={manualSelection}
                manualSelectionComplete={manualSelectionComplete}
                manualValidation={manualValidation}
                onSelect={(category, componentId) => {
                  setManualSelection((current) => ({
                    ...current,
                    [category]: componentId || undefined,
                  }));
                  setManualValidation(null);
                  setSavedBuildMessage(null);
                }}
                onSaveValidatedManualBuild={saveValidatedManualBuild}
                onValidate={() => void validateManualSelection()}
              />
            </aside>
          </div>
        </div>
        </section>
      ) : null}

      <SharkeysFooter />

      <FloatingKeybot
        catalogById={catalogById}
        manualSelection={manualSelection}
        result={result}
        selectedRecommendation={selectedRecommendation}
      />
    </div>
  );
}

function ConfiguratorSidebar({ onAskKeybot }: { onAskKeybot: () => void }) {
  const menuItems = [
    {
      icon: Bot,
      label: "AI Assistant",
      state: "active",
    },
    {
      icon: SlidersHorizontal,
      label: "Custom Studio",
      state: "future",
    },
    {
      icon: CheckCircle,
      label: "Compatibility",
      state: "future",
    },
    {
      icon: Cpu,
      label: "Specs",
      state: "future",
    },
    {
      icon: Info,
      label: "Help",
      state: "future",
    },
  ] as const;

  return (
    <aside className="border-b border-border bg-surface-secondary px-4 py-6 lg:min-h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3">
        <KeybotAvatar small />
        <div>
          <h2 className="text-xl font-black lowercase text-primary">
            meg
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-secondary">
            AI keyboard expert
          </p>
        </div>
      </div>

      <nav aria-label="Configurator modes" className="mt-9 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.state === "active";

          return (
            <button
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition ${
                active
                  ? "bg-accent-subtle text-primary"
                  : "text-secondary opacity-80"
              }`}
              disabled={!active}
              key={item.label}
              type="button"
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-9 rounded-xl border border-border bg-white p-3 shadow-sm">
        <p className="text-xs leading-5 text-secondary">
          Ask Meg about sound profiles, layouts, compatibility, or why a
          selected build fits your prompt.
        </p>
        <button
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 text-xs font-bold text-white transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30"
          onClick={onAskKeybot}
          type="button"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Ask Meg
        </button>
      </div>
    </aside>
  );
}

// Card summary helpers: reduce real catalog part names to their core so the
// one-line "{switch} · {keycap}" summary stays scannable. Only redundant
// category suffixes are stripped — never invented or reworded.
function coreSwitchName(name: string) {
  const core = name
    .replace(/\s+(linear|tactile|clicky|silent)?\s*switch(es)?$/i, "")
    .trim();

  return core || name;
}

function coreKeycapName(name: string) {
  const core = name.replace(/\s+keycaps?(\s+set)?$/i, "").trim();

  return core ? `${core} keycaps` : name;
}

// Clamp a long part name at a word boundary — no mid-word ellipsis.
function clampPartName(name: string, maxLength = 30) {
  if (name.length <= maxLength) {
    return name;
  }

  const cut = name.slice(0, maxLength + 1);
  const lastSpace = cut.lastIndexOf(" ");

  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}

// One recommendation at a time: full-width card with arrow controls, so the
// short kit name, price, and tags all fit without truncation. Cards remain
// rule-engine-validated builds; selecting one never bypasses the engine.
function RecommendationCarousel({
  onSaveRecommendation,
  onSelect,
  recommendations,
  selectedId,
}: {
  onSaveRecommendation: (recommendation: RecommendationBuild) => void;
  onSelect: (recommendation: RecommendationBuild) => void;
  recommendations: RecommendationBuild[];
  selectedId: string | null;
}) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const index = Math.min(carouselIndex, recommendations.length - 1);
  const recommendation = recommendations[index];

  if (!recommendation) {
    return null;
  }

  const selected = recommendation.id === selectedId;
  const kitName = getKitDisplayName(recommendation.components.case);
  const kitId =
    getMetadataString(recommendation.components.case.metadata, "kitId") ?? null;
  const layout = recommendation.components.case.layouts[0];
  const soundProfile =
    recommendation.components.switch.soundProfile ?? "neutral";
  // Defining parts straight from the build's resolved components — the pieces
  // that make builds on the same kit feel different.
  const partSummary = [
    recommendation.components.switch
      ? clampPartName(coreSwitchName(recommendation.components.switch.name))
      : null,
    recommendation.components.keycap
      ? clampPartName(coreKeycapName(recommendation.components.keycap.name))
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const keycapSwatch = getComponentSwatch(recommendation.components.keycap);
  const price =
    recommendation.estimatedPrice === null
      ? "Estimate unavailable"
      : formatEstimatedTotal(
          recommendation.estimatedPrice,
          recommendation.estimatedPriceCurrency ?? "MYR",
        );

  return (
    <section aria-label="Start from a build" className="w-full">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 px-1">
        <h2 className="text-h2 text-primary">
          Start from a build.{" "}
          <span className="text-secondary">Pick one, then make it yours.</span>
        </h2>
        <div className="flex items-center gap-2">
          <p aria-live="polite" className="text-sm text-secondary">
            {index + 1} of {recommendations.length}
          </p>
          <button
            aria-label="Previous recommendation"
            className="flex h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-border text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={index === 0}
            onClick={() => setCarouselIndex(Math.max(0, index - 1))}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            aria-label="Next recommendation"
            className="flex h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-border text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={index === recommendations.length - 1}
            onClick={() =>
              setCarouselIndex(Math.min(recommendations.length - 1, index + 1))
            }
            type="button"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <article
        className={`rounded-lg border bg-surface shadow-sm transition ${
          selected
            ? "border-accent ring-4 ring-accent/15"
            : "border-border hover:border-border-strong"
        }`}
      >
        <button
          aria-label={`Select ${kitName}`}
          aria-pressed={selected}
          className="flex w-full items-center gap-5 p-4 text-left"
          onClick={() => onSelect(recommendation)}
          type="button"
        >
          <CarouselKitThumbnail key={kitId ?? recommendation.id} kitId={kitId} />

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="flex items-center gap-2">
                <span className="text-lg font-black leading-6 text-primary">
                  {kitName}
                </span>
                {isBuilderPick(recommendation.components.case) ? (
                  <BuilderPickTag />
                ) : null}
              </span>
              <span className="text-sm font-black text-primary">{price}</span>
            </span>

            {partSummary ? (
              <span
                className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-secondary"
                data-testid="carousel-build-summary"
              >
                <span className="truncate">{partSummary}</span>
                {keycapSwatch ? <SwatchDots colors={keycapSwatch} /> : null}
              </span>
            ) : null}

            <span className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded border border-border bg-surface px-2 py-0.5 text-[11px] font-bold text-secondary">
                {formatLayoutChip(layout)}
              </span>
              <span className="rounded border border-border bg-surface px-2 py-0.5 text-[11px] font-bold capitalize text-secondary">
                {soundProfile}
              </span>
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2 border-t-[0.5px] border-border px-4 py-2.5">
          <button
            aria-label="Save recommended build"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-[0.5px] border-border bg-surface text-primary transition hover:border-accent hover:bg-surface-secondary focus:outline-none focus:ring-4 focus:ring-accent/20"
            onClick={() => onSaveRecommendation(recommendation)}
            type="button"
          >
            <BookmarkPlus className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </article>
    </section>
  );
}

function CarouselKitThumbnail({ kitId }: { kitId: string | null }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!kitId || imageFailed) {
    return (
      <span
        aria-hidden
        className="flex h-24 w-32 flex-none items-center justify-center rounded-lg bg-surface-secondary"
      >
        <Keyboard className="h-8 w-8 text-secondary/50" aria-hidden />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-24 w-32 flex-none items-center justify-center overflow-hidden rounded-lg bg-surface-secondary"
    >
      <Image
        alt=""
        className="h-full w-full scale-[1.55] object-contain"
        height={120}
        onError={() => setImageFailed(true)}
        src={`/kits/${kitId}.webp`}
        width={160}
      />
    </span>
  );
}

// Height of one section's step cell on the vertical progress track.
const progressStepPx = 30;

// Apple-style resolution progress: ONE continuous vertical track. The filled
// portion is a single solid ink bar with rounded caps whose height maps to
// resolved/total sections — not per-section dot+connector pairs, so there are
// no seams. Pending sections read as faint dots sitting on the remaining
// length of the same axis; the fill grows over them as sections resolve
// (kit-locked sections with the case, free choices on selection). Purely
// visual — it never gates saving beyond the completeness rule and never
// alters the resolved build.
function ResolutionProgress({
  sections,
}: {
  sections: Array<{ id: string; title: string; resolved: boolean }>;
}) {
  const resolvedCount = sections.filter((section) => section.resolved).length;

  if (sections.length <= 1) {
    return null;
  }

  const trackHeight = sections.length * progressStepPx;
  const filledHeight = Math.round(
    (resolvedCount / sections.length) * trackHeight,
  );

  return (
    <div
      aria-label="Build sections complete"
      aria-valuemax={sections.length}
      aria-valuemin={0}
      aria-valuenow={resolvedCount}
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:right-7"
      data-testid="review-progress"
      role="progressbar"
    >
      <div className="relative w-1.5" style={{ height: trackHeight }}>
        {/* Pending steps: faint dots on the track axis. Dots inside the filled
            region fade out so the fill reads as one unbroken bar. */}
        {sections.map((section, sectionIndex) => (
          <span
            className={`absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border transition-opacity duration-300 ${
              sectionIndex < resolvedCount ? "opacity-0" : "opacity-100"
            }`}
            key={section.id}
            style={{ top: (sectionIndex + 0.5) * progressStepPx }}
            title={section.title}
          />
        ))}

        {/* The single filled segment: one solid bar, rounded caps. */}
        <span
          className="absolute inset-x-0 top-0 rounded-full bg-primary transition-all duration-500"
          style={{ height: filledHeight }}
        />
      </div>
      <span className="sr-only">
        {resolvedCount} of {sections.length} complete
      </span>
    </div>
  );
}

function formatLayoutChip(layout: string | undefined) {
  if (!layout) {
    return "Layout";
  }

  return layout === "tkl" ? "TKL Layout" : `${layout}% Layout`;
}

// Large product visual for the configurator: the resolved build's kit image
// on surface-secondary, falling back to a calm keyboard mark when the kit has
// no image (or none is resolved yet). Parent passes key={kitId} so the error
// state resets when the kit changes.
function KitVisual({
  kitId,
  kitName,
}: {
  kitId: string | null;
  kitName: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!kitId || imageFailed) {
    return (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-surface-secondary"
        data-testid="kit-visual"
      >
        <Keyboard className="h-24 w-24 text-secondary/50" aria-hidden />
      </div>
    );
  }

  return (
    // Kit art ships on a 4:3 canvas with wide transparent margins, so the
    // contained image is zoomed to bring the board to ~80% of the tile; only
    // transparent canvas is clipped, never the product.
    <div
      className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-surface-secondary"
      data-testid="kit-visual"
    >
      <Image
        alt={`${kitName} kit`}
        className="h-full w-full scale-[1.55] object-contain"
        height={480}
        onError={() => setImageFailed(true)}
        priority
        src={`/kits/${kitId}.webp`}
        width={640}
      />
    </div>
  );
}

// "Your build": a quiet, display-only list of the user's free choices below
// the stable kit hero. It renders one row per free-choice category present on
// the build (derived from choiceCategories — kit-locked case/internals are
// implied by the hero and get no row). It reflects existing selection state
// only; it never mutates selection, validation, or the resolved build.
function BuildSummary({
  catalogById,
  choiceCategories,
  chosenParts,
}: {
  catalogById: Map<string, KeyboardComponent>;
  choiceCategories: ComponentCategory[];
  chosenParts: ManualSelection;
}) {
  if (choiceCategories.length === 0) {
    return null;
  }

  return (
    <div className="mt-6" data-testid="build-summary">
      <h2 className="text-sm font-semibold text-primary">Your build</h2>
      <ul className="mt-3 flex flex-col gap-1.5">
        {choiceCategories.map((category) => {
          const chosenId = chosenParts[category];
          const chosen = chosenId ? catalogById.get(chosenId) : undefined;
          const component =
            chosen?.category === category ? chosen : undefined;

          if (!component) {
            return (
              <li
                className="flex items-center gap-3 rounded-xl px-1 py-1.5"
                data-testid={`build-summary-row-${category}`}
                key={category}
              >
                <span
                  aria-hidden
                  className="h-11 w-11 flex-none rounded-lg border border-dashed border-border-strong"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">
                    {categoryLabels[category]}
                  </p>
                  <p className="text-xs text-muted">Not selected yet</p>
                </div>
              </li>
            );
          }

          const descriptor = getPartDescriptor(component);

          return (
            <li
              className="flex items-center gap-3 rounded-xl px-1 py-1.5"
              data-testid={`build-summary-row-${category}`}
              key={category}
            >
              <PartThumbnail component={component} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">
                  {component.name}
                </p>
                <p className="text-xs capitalize text-secondary">
                  {descriptor
                    ? `${categoryLabels[category]} · ${descriptor}`
                    : categoryLabels[category]}
                </p>
              </div>
              <CheckCircle2
                aria-hidden
                className="h-4 w-4 flex-none text-success"
              />
              <span className="sr-only">selected</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type KeybotPanelProps = {
  catalogById: Map<string, KeyboardComponent>;
  floating?: boolean;
  manualSelection: ManualSelection;
  onClose?: () => void;
  result: RecommendationResult | null;
  selectedRecommendation: RecommendationBuild | null;
};

function FloatingKeybot({
  catalogById,
  manualSelection,
  openSignal = 0,
  result,
  selectedRecommendation,
}: Omit<KeybotPanelProps, "floating" | "onClose"> & { openSignal?: number }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (openSignal > 0) {
      const timeoutId = window.setTimeout(() => setIsOpen(true), 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [openSignal]);

  if (!isOpen) {
    return (
      <button
        aria-label="Open Meg assistant"
        className="group fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-xl outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-accent/40 sm:bottom-6 sm:right-6"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span aria-hidden className="absolute inset-0 rounded-full bg-accent/40 motion-safe:animate-ping" />
        <span aria-hidden className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
        <Image
          alt="Meg"
          className="relative h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
          height={64}
          src="/meg-avatar.png"
          width={64}
        />
        <span className="sr-only">Ask Meg</span>
      </button>
    );
  }

  return (
    <KeybotPanel
      catalogById={catalogById}
      floating
      manualSelection={manualSelection}
      onClose={() => setIsOpen(false)}
      result={result}
      selectedRecommendation={selectedRecommendation}
    />
  );
}

function KeybotPanel({
  catalogById,
  floating = false,
  manualSelection,
  onClose,
  result,
  selectedRecommendation,
}: KeybotPanelProps) {
  const [messages, setMessages] = useState<KeybotChatMessage[]>([
    KEYBOT_WELCOME_MESSAGE,
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const contextSummary = getKeybotContextSummary({
    catalogById,
    manualSelection,
    selectedRecommendation,
  });
  // Onboarding only: the chips disappear for good once the conversation starts.
  const showSuggestions = messages.length <= 1 && !isSending;

  function clearConversation() {
    setMessages([KEYBOT_WELCOME_MESSAGE]);
    setError(null);
    setInput("");
  }

  useEffect(() => {
    if (!floating || !onClose) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [floating, onClose]);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({
        block: "end",
      });
    }
  }, [messages, isSending]);

  async function sendKeybotMessage(messageText: string) {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const userMessage: KeybotChatMessage = {
      id: createKeybotMessageId("user"),
      role: "user",
      content: trimmedMessage,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/keybot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          context: buildKeybotRequestContext({
            history: messages,
            manualSelection,
            result,
            selectedRecommendation,
          }),
        }),
      });
      const body = (await response.json()) as
        | KeybotApiResponse
        | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(
          "error" in body ? body.error.message : "Meg could not answer.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: createKeybotMessageId("assistant"),
          role: "assistant",
          content: body.data.answer,
          relatedComponentIds: body.data.relatedComponentIds,
          source: body.data.source,
        },
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Meg could not answer right now.";

      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: createKeybotMessageId("assistant"),
          role: "assistant",
          content:
            "I could not reach Meg just now. The main configurator still uses deterministic validation.",
          isRouteFailure: true,
          source: "fallback_error",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section
      aria-label="Meg keyboard helper"
      className={
        floating
          ? "fixed inset-x-3 bottom-3 z-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[28rem] sm:max-w-[calc(100vw-3rem)]"
          : "w-full"
      }
    >
      <div
        className={`sharkeys-soft-shadow flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[28px] border border-border bg-surface ${
          floating ? "sm:h-[640px]" : ""
        }`}
      >
        <header className="flex items-center gap-2.5 border-b-[0.5px] border-border bg-surface px-4 py-3">
          <KeybotAvatar small />
          <h2 className="min-w-0 flex-1 text-sm font-semibold text-primary">
            Meg
          </h2>
          <button
            aria-label="Clear conversation"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-xs text-secondary transition hover:bg-surface-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            onClick={clearConversation}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
          {onClose ? (
            <button
              aria-label="Close Meg assistant"
              className="flex h-8 w-8 flex-none items-center justify-center rounded-xs text-secondary transition hover:bg-surface-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </header>

        <div
          aria-live="polite"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-surface-secondary px-4 py-4"
        >
          {contextSummary ? (
            <div className="rounded-md border-[0.5px] border-border bg-surface p-3">
              <p className="inline-flex items-center gap-1.5 text-caption text-secondary">
                <Cpu className="h-3.5 w-3.5" aria-hidden />
                Active build context
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-primary">
                {contextSummary.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {contextSummary.parts.map((part) => (
                  <span
                    className="rounded-pill border-[0.5px] border-border bg-surface-secondary px-2.5 py-1 text-caption text-secondary"
                    key={part}
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => (
            <KeybotMessageBubble
              catalogById={catalogById}
              disabled={isSending}
              key={message.id}
              message={message}
              onSuggestion={(suggestion) => void sendKeybotMessage(suggestion)}
            />
          ))}

          {showSuggestions ? (
            <div className="flex flex-wrap gap-2">
              {keybotQuickActions.map((action) => (
                <button
                  className="inline-flex items-center rounded-pill border-[0.5px] border-border bg-surface px-3 py-2 text-caption text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSending}
                  key={action.label}
                  onClick={() => void sendKeybotMessage(action.message)}
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}

          {isSending ? <KeybotLoadingState /> : null}
          <div ref={messagesEndRef} />
        </div>

        {error ? (
          <p className="border-t-[0.5px] border-border bg-surface px-4 py-3 text-caption text-error">
            {error}
          </p>
        ) : null}

        <form
          className="border-t-[0.5px] border-border bg-surface p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendKeybotMessage(input);
          }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-secondary p-1.5 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20">
            <input
              aria-label="Meg question"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-primary placeholder:text-secondary/70 focus:outline-none"
              disabled={isSending}
              onChange={(event) => setInput(event.target.value)}
              placeholder={isSending ? "Thinking..." : "Ask about switches, sound..."}
              value={input}
            />
            <button
              aria-label="Send Meg question"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent text-on-accent transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isSending || input.trim().length === 0}
              type="submit"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

type KeybotContextSummary = {
  label: string;
  parts: string[];
  title: string;
};

function KeybotAvatar({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative flex flex-none items-center justify-center ${
        small ? "h-9 w-9" : "h-12 w-12"
      }`}
    >
      <Image
        alt="Meg"
        className="h-full w-full rounded-full object-cover"
        height={48}
        src="/meg-avatar.png"
        width={48}
      />
    </span>
  );
}

function KeybotMessageBubble({
  catalogById,
  disabled,
  message,
  onSuggestion,
}: {
  catalogById: Map<string, KeyboardComponent>;
  disabled: boolean;
  message: KeybotChatMessage;
  onSuggestion: (message: string) => void;
}) {
  const isAssistant = message.role === "assistant";
  const isBlocker =
    isAssistant &&
    !message.isRouteFailure &&
    isKeybotBlockerMessage(message.content);
  const trustLabel = isAssistant ? getKeybotTrustLabel(message) : null;

  return (
    <div
      className={`flex gap-2.5 ${
        isAssistant ? "items-start justify-start" : "justify-end"
      }`}
    >
      {isAssistant ? <KeybotAvatar small /> : null}
      <div
        className={`max-w-[86%] ${
          isAssistant ? "sm:max-w-[82%]" : "sm:max-w-[76%]"
        }`}
      >
        <div
          className={`rounded-3xl border px-4 py-3 text-sm leading-6 shadow-sm ${
            isAssistant
              ? isBlocker
                ? "rounded-tl-md border-accent/35 bg-surface text-primary"
                : "rounded-tl-md border-border/70 bg-surface text-primary"
              : "rounded-tr-md border-border bg-accent-subtle text-primary"
          }`}
        >
          {isBlocker ? (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent-subtle px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden />
              Build blocker
            </div>
          ) : null}

          <div className="space-y-2">
            {splitKeybotParagraphs(message.content).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {trustLabel ? (
            <div className="mt-3 flex items-center gap-1.5 border-t border-border/50 pt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-secondary">
              {message.isRouteFailure ? (
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              )}
              {trustLabel}
            </div>
          ) : null}

          {message.relatedComponentIds &&
          message.relatedComponentIds.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.relatedComponentIds.slice(0, 4).map((id) => {
                const component = catalogById.get(id);

                return (
                  <span
                    className="inline-flex items-center rounded-full border border-border/70 bg-accent-subtle/70 px-2.5 py-1 text-[11px] font-semibold text-primary"
                    key={id}
                  >
                    {component?.name ?? id}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>

        {isBlocker ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {keybotBlockerActions.map((action) => (
              <button
                className="rounded-full border border-border/80 bg-surface px-3 py-1.5 text-xs font-bold text-secondary transition hover:border-accent hover:bg-accent-subtle hover:text-primary focus:outline-none focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={disabled}
                key={action.label}
                onClick={() => onSuggestion(action.message)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function KeybotLoadingState() {
  // Only mounted while a reply is pending, so the stage timer is always active.
  const label = useKeybotThinkingStage(true);

  return (
    <div className="flex items-start gap-2.5">
      <KeybotAvatar small />
      <div className="inline-flex min-h-12 items-center gap-2 rounded-3xl rounded-tl-md border border-border/70 bg-surface px-4 py-3 text-sm font-bold text-primary shadow-sm">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
        </span>
        {label}
      </div>
    </div>
  );
}

function getKeybotContextSummary({
  catalogById,
  manualSelection,
  selectedRecommendation,
}: {
  catalogById: Map<string, KeyboardComponent>;
  manualSelection: ManualSelection;
  selectedRecommendation: RecommendationBuild | null;
}): KeybotContextSummary | null {
  if (selectedRecommendation) {
    return {
      label: "Current build",
      title: selectedRecommendation.title,
      parts: ["case", "switch", "pcb"]
        .map((category) => {
          const component =
            selectedRecommendation.components[category as ComponentCategory];

          return component ? `${categoryLabels[component.category]}: ${component.name}` : null;
        })
        .filter((part): part is string => part !== null),
    };
  }

  const manualParts = componentCategories
    .map((category) => {
      const componentId = manualSelection[category];
      const component = componentId ? catalogById.get(componentId) : undefined;

      return component ? `${categoryLabels[category]}: ${component.name}` : null;
    })
    .filter((part): part is string => part !== null)
    .slice(0, 3);

  if (manualParts.length === 0) {
    return null;
  }

  return {
    label: "Current build",
    title: "Manual selection",
    parts: manualParts,
  };
}

function splitKeybotParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

// Grounding is implicit: successful replies carry no badge. Only degraded
// answer quality (fallback, route failure) is surfaced to the user.
function getKeybotTrustLabel(message: KeybotChatMessage) {
  if (message.isRouteFailure) {
    return "Route unavailable";
  }

  if (
    message.source === "fallback_missing_api_key" ||
    message.source === "fallback_error"
  ) {
    return "Using local grounded fallback";
  }

  return null;
}

function isKeybotBlockerMessage(content: string) {
  return /\b(could not find|no validated build|not compatible|not currently compatible|build is blocked|blocked by|unless a future|kit-derived structural parts|locked to their original)\b/i.test(
    content,
  );
}

function createKeybotMessageId(prefix: "assistant" | "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function buildKeybotRequestContext({
  history,
  manualSelection,
  result,
  selectedRecommendation,
}: {
  history: KeybotChatMessage[];
  manualSelection: ManualSelection;
  result: RecommendationResult | null;
  selectedRecommendation: RecommendationBuild | null;
}) {
  const selectedComponentIds =
    selectedRecommendation?.componentIds ??
    (Object.values(manualSelection).some(Boolean) ? manualSelection : undefined);

  return {
    recentMessages: history.slice(-6).map((message) => ({
      role: message.role,
      content: message.content.slice(0, 1200),
    })),
    currentIntent: result?.intent,
    currentRecommendationIds: result?.recommendations
      .map((recommendation) => recommendation.id)
      .slice(0, 6),
    selectedComponentIds,
  };
}

function SharkeysFooter() {
  const links = ["About", "Privacy", "Terms"];

  return (
    <footer className="border-t border-white/60 bg-white/40 px-4 py-12 backdrop-blur sm:px-8 lg:px-6">
      <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 md:flex-row md:items-center">
        <div>
          <Image
            alt="Sharkeys"
            className="h-8 w-auto object-contain"
            height={32}
            src="/logo.png"
            width={111}
          />
          <p className="mt-3 text-sm text-primary/60">
            © 2024 sharkeys. build your sound.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 md:justify-end">
          {links.map((link) => (
            <a
              className="text-sm font-bold text-primary/70 transition hover:text-primary hover:underline focus:outline-none focus:ring-4 focus:ring-accent/20"
              href="#configurator"
              key={link}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function WorkspaceHeader({
  result,
  selected,
}: {
  result: RecommendationResult | null;
  selected: RecommendationBuild | null;
}) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
            Build output
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.01em] text-primary">
            {result ? "Your validated build options" : "Your build results appear here"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
            {result
              ? "Review recommendations, inspect grounded catalog parts, or save compatible builds."
              : "Submit a prompt above and sharkeys will show the validated recommendations in this lower workspace."}
          </p>
        </div>
        {selected ? (
          <div className="rounded-full border border-accent/40 bg-surface-secondary px-4 py-2 text-sm font-bold text-primary">
            {selected.estimatedPrice === null
              ? "Estimate unavailable"
              : formatEstimatedTotal(
                  selected.estimatedPrice,
                  selected.estimatedPriceCurrency ?? "MYR",
                )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function IntentPanel({ result }: { result: RecommendationResult | null }) {
  if (!result) {
    return (
      <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-primary">Request summary</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">
          Submit a request to see grounded build criteria.
        </p>
      </div>
    );
  }

  const rows = [
    ["Layout", result.intent.layout ?? "Unspecified"],
    ["Sound", result.intent.soundProfile ?? "Unspecified"],
    ["Switch", result.intent.switchTechnology ?? "Unspecified"],
    ["Use case", result.intent.useCase],
    [
      "Budget",
      result.intent.budget?.amount
        ? formatMoney(result.intent.budget.amount, result.intent.budget.currency ?? "MYR")
        : result.intent.budget?.label ?? "Unspecified",
    ],
    [
      "Beginner",
      result.intent.beginnerFriendly === null
        ? "Unspecified"
        : result.intent.beginnerFriendly
          ? "Yes"
          : "No",
    ],
  ];

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-primary">Request summary</h2>
        <span className="rounded-full border border-border bg-accent-subtle px-2.5 py-1 text-xs font-semibold text-primary">
          {result.source.replaceAll("_", " ")}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-primary">{value}</dd>
          </div>
        ))}
      </dl>
      {result.criteria.maxPrice ? (
        <p className="mt-3 border-t border-border/70 pt-3 text-xs text-secondary">
          Catalog budget: {formatMoney(result.criteria.maxPrice, result.criteria.currency ?? "MYR")}
        </p>
      ) : null}
    </div>
  );
}

function RecommendationList({
  onSelect,
  recommendations,
  selectedId,
}: {
  onSelect: (recommendation: RecommendationBuild) => void;
  recommendations: RecommendationBuild[];
  selectedId: string | null;
}) {
  return (
    <div className="rounded-3xl border border-border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Layers3 className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-bold text-primary">Compare builds</h2>
      </div>
      <div className="space-y-2">
        {recommendations.map((recommendation, index) => {
          const selected = recommendation.id === selectedId;
          const price =
            recommendation.estimatedPrice === null
              ? "No estimate"
              : formatEstimatedTotal(
                  recommendation.estimatedPrice,
                  recommendation.estimatedPriceCurrency ?? "MYR",
                );

          return (
            <button
              className={`w-full rounded-2xl border p-3 text-left transition ${
                selected
                  ? "border-accent bg-accent-subtle"
                  : "border-border bg-white hover:border-accent hover:bg-surface-secondary"
              }`}
              key={recommendation.id}
              onClick={() => onSelect(recommendation)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
                    Build {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-5 text-primary">
                    {recommendation.components.case.name}
                  </p>
                </div>
                <span className="rounded-full border border-border bg-white px-2 py-1 text-xs font-semibold text-primary">
                  Valid
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-primary">{price}</p>
              <p className="mt-1 text-xs text-secondary">
                {recommendation.components.switch.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecommendationInspector({
  activeCategory,
  onActiveCategoryChange,
  onSaveRecommendation,
  recommendation,
  selectedComponent,
}: {
  activeCategory: ComponentCategory;
  onActiveCategoryChange: (category: ComponentCategory) => void;
  onSaveRecommendation: (recommendation: RecommendationBuild) => void;
  recommendation: RecommendationBuild;
  selectedComponent: KeyboardComponent | undefined;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
      <div className="border-b border-border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-accent-subtle px-2.5 py-1 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Rule-engine validated
            </div>
            <h2 className="text-2xl font-bold tracking-[-0.01em] text-primary">
              {recommendation.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-secondary">
              {recommendation.explanations[0]}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
              Estimated total
            </p>
            <p className="mt-1 text-3xl font-bold text-primary">
              {recommendation.estimatedPrice === null
                ? "Unavailable"
                : formatEstimatedTotal(
                    recommendation.estimatedPrice,
                    recommendation.estimatedPriceCurrency ?? "MYR",
                  )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {componentCategories.map((category) => {
              const component = recommendation.components[category];
              const active = category === activeCategory;

              return (
                <button
                  className={`rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-accent bg-accent-subtle"
                      : "border-border bg-surface-secondary hover:border-accent hover:bg-white"
                  }`}
                  key={category}
                  onClick={() => onActiveCategoryChange(category)}
                  type="button"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
                    {categoryLabels[category]}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-bold text-primary">
                    {component.name}
                  </p>
                  <p className="mt-1 text-xs text-primary">{component.brand}</p>
                  <p className="mt-2 text-xs leading-4 text-secondary">
                    {categorySummaries[category]}
                  </p>
                </button>
              );
            })}
          </div>

          <CompatibilityPanel recommendation={recommendation} />
        </div>

        <ComponentDetails
          category={activeCategory}
          component={selectedComponent}
        />
      </div>
    </div>
  );
}

function ComponentDetails({
  category,
  component,
}: {
  category: ComponentCategory;
  component: KeyboardComponent | undefined;
}) {
  if (!component) {
    return (
      <div className="p-4">
        <p className="text-sm text-secondary">No component selected.</p>
      </div>
    );
  }

  const sourceVendor = getMetadataString(component.metadata, "sourceVendor");
  const sourceType = getMetadataString(component.metadata, "sourceType");
  const sourceNote = getMetadataString(component.metadata, "sourceNote");
  const layouts = getComponentLayouts(component);

  return (
    <aside className="p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
        {categoryLabels[category]}
      </p>
      <h3 className="mt-1 text-base font-bold leading-6 text-primary">
        {component.name}
      </h3>
      <p className="mt-1 text-sm text-primary">{component.brand}</p>
      <p className="mt-4 text-sm leading-6 text-secondary">
        {component.description}
      </p>

      <dl className="mt-4 grid gap-3 border-y border-border py-4">
        <DetailRow label="Price" value={formatComponentPrice(component)} />
        <DetailRow
          label="Layouts"
          value={layouts.length > 0 ? layouts.join(", ") : "Layout agnostic"}
        />
        <DetailRow label="Technology" value={getComponentTechnology(component)} />
        <DetailRow label="Mount/profile" value={getMountSummary(component)} />
        <DetailRow
          label="Sound"
          value={component.soundProfile ?? "Not specified"}
        />
        <DetailRow
          label="Beginner"
          value={component.beginnerFriendly ? "Friendly" : "Advanced"}
        />
      </dl>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
          Source
        </p>
        <p className="text-sm font-bold text-primary">
          {sourceVendor ?? "Vendor metadata unavailable"}
        </p>
        {sourceType ? (
          <p className="text-xs text-secondary">{sourceType.replaceAll("_", " ")}</p>
        ) : null}
        {sourceNote ? <p className="text-xs leading-5 text-secondary">{sourceNote}</p> : null}
        {component.vendorUrl ? (
          <a
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary hover:underline"
            href={component.vendorUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open vendor page
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : null}
      </div>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-primary">{value}</dd>
    </div>
  );
}

function CompatibilityPanel({
  recommendation,
}: {
  recommendation: RecommendationBuild;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface-secondary p-4">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-primary" aria-hidden />
        <div>
          <p className="text-sm font-bold text-primary">
            Compatibility status
          </p>
          <p className="mt-1 text-sm text-secondary">
            {recommendation.validation.explanations[0]}
          </p>
        </div>
      </div>

      {recommendation.warnings.length > 0 ? (
        <div className="mt-3 space-y-2">
          {recommendation.warnings.map((warning) => (
            <Notice
              icon={AlertCircle}
              key={`${warning.code}-${warning.message}`}
              message={warning.message}
              tone="amber"
            />
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-2xl border border-border bg-white px-3 py-2 text-sm text-primary">
          No compatibility warnings from the rule engine.
        </p>
      )}
    </div>
  );
}

function ManualSelectionPanel({
  catalogByCategory,
  catalogError,
  hasMounted,
  isCatalogLoading,
  isManualValidating,
  manualError,
  manualSelection,
  manualSelectionComplete,
  manualValidation,
  onSelect,
  onSaveValidatedManualBuild,
  onValidate,
}: {
  catalogByCategory: Record<ComponentCategory, KeyboardComponent[]>;
  catalogError: string | null;
  hasMounted: boolean;
  isCatalogLoading: boolean;
  isManualValidating: boolean;
  manualError: string | null;
  manualSelection: ManualSelection;
  manualSelectionComplete: boolean;
  manualValidation: CompatibilityResult | null;
  onSelect: (category: ComponentCategory, componentId: string) => void;
  onSaveValidatedManualBuild: () => void;
  onValidate: () => void;
}) {
  const shouldDisableCatalogControls =
    isCatalogLoading || Boolean(catalogError);
  const shouldDisableManualValidation =
    isCatalogLoading || isManualValidating || !manualSelectionComplete;

  return (
    <div className="rounded-3xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-bold text-primary">Manual build check</h2>
      </div>

      {catalogError ? (
        <Notice icon={AlertCircle} message={catalogError} tone="red" />
      ) : null}

      <div className="grid gap-3">
        {componentCategories.map((category) => (
          <label className="block" key={category}>
            <span className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
              {categoryLabels[category]}
            </span>
            <select
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 disabled:bg-accent-subtle"
              disabled={hasMounted && shouldDisableCatalogControls}
              onChange={(event) => onSelect(category, event.target.value)}
              value={manualSelection[category] ?? ""}
            >
              <option value="">
                {isCatalogLoading ? "Loading catalog..." : `Select ${categoryLabels[category]}`}
              </option>
              {catalogByCategory[category].map((component) => (
                <option key={component.id} value={component.id}>
                  {component.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <button
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-45"
        disabled={hasMounted && shouldDisableManualValidation}
        onClick={onValidate}
        type="button"
      >
        {isManualValidating ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <ShieldCheck className="h-4 w-4" aria-hidden />
        )}
        Validate manual build
      </button>



      {manualError ? (
        <Notice
          className="mt-3"
          icon={AlertCircle}
          message={manualError}
          tone="red"
        />
      ) : null}

      {manualValidation ? (
        <div
          className={`mt-3 rounded-2xl border p-3 text-sm ${
            manualValidation.isValid
              ? "border-border bg-accent-subtle text-primary"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {manualValidation.isValid ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden />
            ) : (
              <AlertCircle className="h-4 w-4" aria-hidden />
            )}
            {manualValidation.isValid ? "Compatible build" : "Compatibility issues"}
          </div>
          <ul className="mt-2 space-y-1">
            {(manualValidation.issues.length > 0
              ? manualValidation.issues
              : manualValidation.explanations.map((message) => ({
                  code: message,
                  message,
                }))
            ).map((issue) => (
              <li key={issue.code}>{issue.message}</li>
            ))}
          </ul>
          {manualValidation.isValid ? (
            <button
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-bold text-white transition hover:bg-accent-hover"
              onClick={onSaveValidatedManualBuild}
              type="button"
            >
              <BookmarkPlus className="h-4 w-4" aria-hidden />
              Save compatible build
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function EmptyWorkspace() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-white p-10 text-center shadow-sm">
      <PackageSearch className="mx-auto h-10 w-10 text-primary" aria-hidden />
      <h2 className="mt-4 text-lg font-bold text-primary">
        Ready for configuration
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-secondary">
        Recommendations, component inspection, and manual validation appear here.
      </p>
    </div>
  );
}

function EmptyRecommendationState({ result }: { result: RecommendationResult }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 text-sm text-primary shadow-sm">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <AlertCircle className="h-4 w-4 text-error" aria-hidden />
        No validated build found
      </div>
      <ul className="space-y-1">
        {result.explanations.map((explanation) => (
          <li key={explanation}>{explanation}</li>
        ))}
      </ul>
      {result.clarificationPrompt ? (
        <p className="mt-3 font-medium">{result.clarificationPrompt}</p>
      ) : null}
    </div>
  );
}

function Notice({
  className = "",
  icon: Icon,
  message,
  tone,
}: {
  className?: string;
  icon: typeof AlertCircle;
  message: ReactNode;
  tone: "amber" | "red" | "sky";
}) {
  const toneClasses = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-800",
    sky: "border-border bg-accent-subtle text-primary",
  };

  return (
    <div
      className={`flex gap-2 rounded-2xl border p-3 text-sm ${toneClasses[tone]} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
