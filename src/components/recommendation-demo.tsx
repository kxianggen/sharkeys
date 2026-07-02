"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookmarkPlus,
  Bot,
  CheckCircle2,
  CheckCircle,
  CopyPlus,
  Cpu,
  ExternalLink,
  Eye,
  Info,
  Image as ImageIcon,
  Keyboard,
  Layers3,
  Loader2,
  MessageCircle,
  Mic,
  PackageSearch,
  Send,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
  WandSparkles,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { ImageDrop } from "@/components/image-drop";
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

type SavedBuild = {
  id: string;
  title: string;
  createdAt: string;
  source: SavedBuildSource;
  componentIds: CompleteComponentIdSelection;
  estimatedPrice: number | null;
  estimatedPriceCurrency: KeyboardComponent["priceCurrency"] | null;
  validation: CompatibilityResult;
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

const quickPrompts = [
  "Quiet office keyboard",
  "Creamy 65% under RM500",
  "TKL typing build",
] as const;

const configuratorQuickPrompts = [
  {
    label: "Thocky",
    prompt: "A deep thocky build for coding in a quiet office",
  },
  {
    label: "Quiet Office",
    prompt: "Quiet office keyboard under RM500",
  },
  {
    label: "65% Layout",
    prompt: "Beginner friendly 65% keyboard under RM500",
  },
] as const;

const smokePromptExamples = [
  "creamy 65% beginner keyboard under RM500",
  "optical 60% clacky gaming build",
] as const;

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

const savedBuildsStorageKey = "sharkeys.savedBuilds.v1";
const maxSavedBuilds = 12;
const estimatedSwitchCount = 70;

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
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

function createSavedBuildId(source: SavedBuildSource) {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;

  return `saved_${source}_${suffix}`;
}

function readSavedBuildsFromStorage() {
  try {
    const raw = window.localStorage.getItem(savedBuildsStorageKey);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSavedBuild).slice(0, maxSavedBuilds);
  } catch {
    return [];
  }
}

function persistSavedBuilds(savedBuilds: SavedBuild[]) {
  window.localStorage.setItem(
    savedBuildsStorageKey,
    JSON.stringify(savedBuilds.slice(0, maxSavedBuilds)),
  );
}

function isSavedBuild(value: unknown): value is SavedBuild {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SavedBuild>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.createdAt === "string" &&
    (candidate.source === "recommendation" || candidate.source === "manual") &&
    isCompleteComponentIdSelection(candidate.componentIds) &&
    (typeof candidate.estimatedPrice === "number" ||
      candidate.estimatedPrice === null) &&
    (typeof candidate.estimatedPriceCurrency === "string" ||
      candidate.estimatedPriceCurrency === null) &&
    Boolean(candidate.validation?.isValid)
  );
}

function isCompleteComponentIdSelection(
  value: unknown,
): value is CompleteComponentIdSelection {
  if (!value || typeof value !== "object") {
    return false;
  }

  const selection = value as Partial<Record<ComponentCategory, unknown>>;

  return componentCategories.every(
    (category) => typeof selection[category] === "string",
  );
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

function estimateSavedBuildPrice(
  components: CompleteComponentSelection,
): PriceEstimate | null {
  const prices = componentCategories
    .map((category) => {
      const component = components[category];

      if (
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

type RecommendationDemoMode = "configurator" | "landing";

type RecommendationDemoProps = {
  initialPrompt?: string | null;
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

export function RecommendationDemo({
  initialPrompt = null,
  mode = "landing",
}: RecommendationDemoProps = {}) {
  const router = useRouter();
  const promptRef = useRef<HTMLTextAreaElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const initialPromptSubmittedRef = useRef(false);
  const isLanding = mode === "landing";
  const isConfigurator = mode === "configurator";
  const [message, setMessage] = useState(initialPrompt ?? "");
  const [isManualCheckOpen, setIsManualCheckOpen] = useState(false);
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
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [savedBuildsLoaded, setSavedBuildsLoaded] = useState(false);
  const [savedBuildMessage, setSavedBuildMessage] = useState<string | null>(
    null,
  );
  const [hasMounted, setHasMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionNote, setVisionNote] = useState<string | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isManualValidating, setIsManualValidating] = useState(false);

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

  const shouldDisableSubmit =
    isSubmitting || message.trim().length === 0;
  const isSubmitDisabled = hasMounted && shouldDisableSubmit;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHasMounted(true);
      setSavedBuilds(readSavedBuildsFromStorage());
      setSavedBuildsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!hasMounted || !savedBuildsLoaded) {
      return;
    }

    try {
      persistSavedBuilds(savedBuilds);
    } catch {
      // Local persistence is a prototype convenience; saving should not break validation.
    }
  }, [hasMounted, savedBuilds, savedBuildsLoaded]);

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

  async function runRecommendationRequest(nextMessage = message) {
    setError(null);
    setManualError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: nextMessage }),
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

  function focusPrompt() {
    if (isLanding) {
      router.push(buildConfiguratorPromptHref(message));
      return;
    }

    promptRef.current?.focus();
    promptRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "center",
    });
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

  function prependSavedBuild(savedBuild: SavedBuild) {
    setSavedBuilds((current) => [
      savedBuild,
      ...current.filter((build) => build.id !== savedBuild.id),
    ].slice(0, maxSavedBuilds));
    setSavedBuildMessage(`${savedBuild.title} saved locally.`);
  }

  function saveRecommendationBuild(recommendation: RecommendationBuild) {
    if (!recommendation.validation.isValid) {
      setSavedBuildMessage(
        "Only builds that pass deterministic validation can be saved.",
      );
      return;
    }

    prependSavedBuild({
      id: createSavedBuildId("recommendation"),
      title: recommendation.title,
      createdAt: new Date().toISOString(),
      source: "recommendation",
      componentIds: recommendation.componentIds,
      estimatedPrice: recommendation.estimatedPrice,
      estimatedPriceCurrency: recommendation.estimatedPriceCurrency,
      validation: recommendation.validation,
    });
  }

  function saveValidatedManualBuild() {
    const componentIds = toCompleteComponentIds(manualSelection);

    if (!componentIds || !manualValidation?.isValid) {
      setManualError(
        "Validate a complete compatible build before saving it locally.",
      );
      return;
    }

    const components = resolveCompleteComponents(componentIds, catalogById);

    if (!components) {
      setManualError("Saved build components could not be resolved from the catalog.");
      return;
    }

    const priceEstimate = estimateSavedBuildPrice(components);

    prependSavedBuild({
      id: createSavedBuildId("manual"),
      title: `Manual build: ${buildSavedBuildTitle(components)}`,
      createdAt: new Date().toISOString(),
      source: "manual",
      componentIds,
      estimatedPrice: priceEstimate?.amount ?? null,
      estimatedPriceCurrency: priceEstimate?.currency ?? null,
      validation: manualValidation,
    });
  }

  if (isConfigurator) {
    const activeBuild = selectedRecommendation;
    const buildValid = activeBuild?.validation.isValid ?? null;
    const buildErrorCount = activeBuild?.validation.errors.length ?? 0;
    const buildPrice =
      activeBuild && activeBuild.estimatedPrice !== null
        ? formatMoney(
            activeBuild.estimatedPrice,
            activeBuild.estimatedPriceCurrency ?? "MYR",
          )
        : null;
    const isDesigning = isSubmitting || visionLoading;

    return (
      <div className="flex h-screen flex-col overflow-hidden bg-surface-secondary text-primary">
        <LandingNav onStartBuilding={focusPrompt} />

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
          {/* LEFT PANE — Ask Meg control center */}
          <aside className="flex min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl lg:w-[34%] lg:max-w-md">
            <header className="flex items-center gap-3 border-b border-accent/10 px-5 py-4">
              <span
                aria-hidden
                className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-2xl bg-accent text-white shadow-sm"
              >
                <Image
                  alt="Meg"
                  className="h-full w-full rounded-2xl object-cover"
                  height={44}
                  src="/meg-avatar.png"
                  width={44}
                />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-black tracking-[-0.01em] text-primary">
                  Ask Meg
                </h2>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                  AI build control
                </p>
              </div>
              <button
                aria-label="Open Meg assistant"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-primary transition hover:bg-accent-subtle hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
                onClick={() => setKeybotOpenSignal((current) => current + 1)}
                type="button"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <p className="text-sm leading-6 text-secondary">
                Describe the sound, feel, budget, or layout you want. Meg returns
                compatible builds from the grounded catalog — every result is
                validated by the deterministic rule engine.
              </p>

              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-primary">
                  Try a starting point
                </p>
                <div className="flex flex-col gap-2">
                  {configuratorQuickPrompts.map((prompt) => (
                    <button
                      className="group inline-flex items-center justify-between gap-2 rounded-2xl border border-border bg-white px-4 py-2.5 text-left text-sm font-bold text-secondary shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={hasMounted && isSubmitting}
                      key={prompt.label}
                      onClick={() => void handleQuickPrompt(prompt.prompt)}
                      type="button"
                    >
                      {prompt.label}
                      <ArrowRight
                        className="h-4 w-4 flex-none text-accent transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </button>
                  ))}
                </div>
              </div>

              {visionNote ? (
                <p className="rounded-2xl bg-accent-subtle px-4 py-3 text-sm font-medium text-primary">
                  {visionNote}
                </p>
              ) : null}
            </div>

            {/* Loaders / error sit directly above the premium input */}
            <div className="space-y-3 border-t border-accent/10 p-4">
              {isDesigning ? (
                <div className="inline-flex w-full items-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-white">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {visionLoading
                    ? "Reading your image…"
                    : "Meg is designing your build…"}
                </div>
              ) : null}

              {error ? (
                <Notice icon={AlertCircle} message={error} tone="red" />
              ) : null}

              <form
                aria-label="AI keyboard prompt form"
                className="space-y-3"
                onSubmit={handleSubmit}
              >
                <ImageDrop
                  disabled={isSubmitting || visionLoading}
                  onChange={(value) => void handleImageChange(value)}
                  value={imageDataUrl}
                />

                <div className="rounded-2xl border border-border bg-white p-2 shadow-sm transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20">
                  <label className="sr-only" htmlFor="keyboard-request">
                    Keyboard request
                  </label>
                  <textarea
                    className="min-h-[64px] w-full resize-none border-none bg-transparent px-2 py-1.5 text-sm leading-6 text-primary outline-none placeholder:text-secondary/70 focus:ring-0"
                    id="keyboard-request"
                    maxLength={2000}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="e.g., 'A deep thocky build for coding in a quiet office'"
                    ref={promptRef}
                    value={message}
                  />
                  <button
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-black text-white shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 disabled:cursor-not-allowed disabled:bg-border-strong"
                    disabled={isSubmitDisabled}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        <span>Designing…</span>
                      </>
                    ) : (
                      <>
                        <span>Design my build</span>
                        <Sparkles className="h-4 w-4" aria-hidden />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </aside>

          {/* RIGHT PANE — Active build / garage */}
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-2xl backdrop-blur-xl">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-accent/10 px-6 py-5">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">
                  Active build
                </p>
                <h1 className="mt-1 truncate text-xl font-black tracking-[-0.01em] text-primary sm:text-2xl">
                  {activeBuild?.title ?? "Your build appears here"}
                </h1>
                {buildPrice ? (
                  <p className="mt-1 text-sm font-bold text-secondary">
                    Est. total{" "}
                    <span className="text-primary">{buildPrice}</span>
                  </p>
                ) : null}
              </div>

              {buildValid === null ? null : buildValid ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-sm font-bold text-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-inset ring-emerald-500/30">
                  <ShieldCheck className="h-4 w-4" aria-hidden /> Compatible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3.5 py-1.5 text-sm font-bold text-rose-700 shadow-[0_0_20px_rgba(244,63,94,0.2)] ring-1 ring-inset ring-rose-500/30">
                  <ShieldAlert className="h-4 w-4" aria-hidden />
                  {buildErrorCount > 0
                    ? `${buildErrorCount} blocker${buildErrorCount > 1 ? "s" : ""}`
                    : "Blocked"}
                </span>
              )}
            </header>

            <section
              className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6"
              id="results"
              ref={resultsRef}
            >
              {savedBuildMessage ? (
                <Notice
                  icon={Info}
                  message={`${savedBuildMessage} View saved builds on the My Builds page.`}
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

              {activeBuild ? (
                <>
                  {/* Component tabs — active category pops navy */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {componentCategories.map((category) => {
                      const component = activeBuild.components[category];
                      const isActive = activeCategory === category;
                      return (
                        <button
                          className={`flex flex-col rounded-2xl border p-3 text-left transition ${
                            isActive
                              ? "border-accent bg-accent text-white shadow-lg"
                              : "border-border bg-white text-primary shadow-sm hover:-translate-y-0.5 hover:border-accent"
                          }`}
                          key={category}
                          onClick={() => setActiveCategory(category)}
                          type="button"
                        >
                          <span
                            className={`text-[11px] font-black uppercase tracking-[0.1em] ${
                              isActive ? "text-white/70" : "text-primary"
                            }`}
                          >
                            {categoryLabels[category]}
                          </span>
                          <span className="mt-1 line-clamp-2 text-sm font-bold leading-5">
                            {component?.name ?? "—"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active component detail */}
                  {selectedComponent ? (
                    <div className="rounded-2xl border border-border bg-white/70 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">
                        {categoryLabels[activeCategory]}
                      </p>
                      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                        <h2 className="text-lg font-black tracking-[-0.01em] text-primary">
                          {selectedComponent.name}
                        </h2>
                        <span className="text-sm font-bold text-secondary">
                          {formatComponentPrice(selectedComponent)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-secondary">
                        {categorySummaries[activeCategory]}
                      </p>
                    </div>
                  ) : null}

                  {/* Alternate build paths */}
                  {result && result.recommendations.length > 0 ? (
                    <div>
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-primary">
                        Build paths
                      </p>
                      <CompactRecommendationGrid
                        onSaveRecommendation={saveRecommendationBuild}
                        onSelect={(recommendation) => {
                          setSelectedRecommendationId(recommendation.id);
                          loadRecommendationIntoManualPanel(recommendation);
                        }}
                        recommendations={result.recommendations}
                        selectedId={selectedRecommendation?.id ?? null}
                      />
                    </div>
                  ) : null}

                </>
              ) : result && result.recommendations.length === 0 ? (
                <EmptyRecommendationState result={result} />
              ) : (
                <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/50 px-6 py-12 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle text-primary">
                    <Keyboard className="h-7 w-7" aria-hidden />
                  </span>
                  <h2 className="mt-4 text-lg font-black tracking-[-0.01em] text-primary">
                    No build yet
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-secondary">
                    Ask Meg on the left — describe your dream sound and she will
                    assemble a validated build here.
                  </p>
                </div>
              )}

              {/* Manual compatibility check — always available */}
              <section className="rounded-2xl border border-dashed border-border bg-white/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-primary">
                      Manual check
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-secondary">
                      Hand-pick components and validate them against the rule
                      engine.
                    </p>
                  </div>
                  <button
                    aria-expanded={isManualCheckOpen}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-bold text-primary transition hover:border-accent hover:bg-surface-secondary focus:outline-none focus:ring-4 focus:ring-accent/20"
                    onClick={() => setIsManualCheckOpen((current) => !current)}
                    type="button"
                  >
                    {isManualCheckOpen
                      ? "Hide manual check"
                      : "Open manual check"}
                  </button>
                </div>

                {isManualCheckOpen ? (
                  <div className="mt-5">
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
              </section>
            </section>
          </section>
        </div>

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
    <div className="min-h-screen overflow-x-hidden bg-surface-secondary text-primary">
      <LandingNav onStartBuilding={focusPrompt} />

      <section
        className={`mx-auto flex w-full flex-col items-center px-4 text-center sm:px-8 ${
          isLanding
            ? "max-w-[920px] pb-20 pt-20 lg:pb-24 lg:pt-28"
            : "max-w-screen-xl pb-10 pt-12 lg:pb-14 lg:pt-16"
        }`}
        id="configurator"
      >
        <h1
          className={`max-w-4xl font-black leading-[1.08] tracking-[-0.01em] text-primary ${
            isLanding
              ? "text-[42px] sm:text-5xl lg:text-[64px] lg:leading-[1.08]"
              : "text-4xl sm:text-5xl"
          }`}
        >
          {isLanding
            ? "Build your dream keyboard in words"
            : "Configurator workspace"}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-primary/70 sm:text-lg">
          {isLanding
            ? "Tell sharkeys your sound, layout, budget, and use case. We’ll turn it into compatible keyboard build options."
            : "Generate validated recommendations, compare builds, and inspect grounded catalog parts."}
        </p>

        <form
          aria-label="AI keyboard prompt form"
          className="sharkeys-soft-shadow mt-10 w-full max-w-3xl rounded-[28px] border border-white/80 bg-white/80 p-4 text-left backdrop-blur transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20 sm:p-5"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="keyboard-request">
            Keyboard request
          </label>
          <textarea
            className="min-h-[84px] w-full resize-none border-none bg-transparent p-0 text-base leading-7 text-primary outline-none placeholder:text-primary/45 focus:ring-0 sm:min-h-[88px]"
            id="keyboard-request"
            maxLength={2000}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Build me a keyboard under 300 ringgit that is quiet and suitable for office..."
            ref={promptRef}
            value={message}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 text-primary/65">
              <button
                aria-label="Voice input is not available yet"
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-accent-subtle disabled:cursor-not-allowed disabled:opacity-55"
                disabled
                type="button"
              >
                <Mic className="h-5 w-5" aria-hidden />
              </button>
              <button
                aria-label="Image input is not available yet"
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-accent-subtle disabled:cursor-not-allowed disabled:opacity-55"
                disabled
                type="button"
              >
                <ImageIcon className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-border-strong sm:px-7"
              disabled={isSubmitDisabled}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <span>Start Building</span>
                  <Sparkles className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 flex max-w-4xl flex-wrap justify-center gap-3">
          {quickPrompts.map((prompt) => (
            <button
              className="inline-flex min-h-9 items-center rounded-full border border-white/90 bg-white/70 px-5 py-2 text-sm font-bold text-primary shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={hasMounted && isSubmitting}
              key={prompt}
              onClick={() => void handleQuickPrompt(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-secondary">
          {smokePromptExamples.map((prompt) => (
            <button
              className="rounded-full px-3 py-1.5 transition hover:bg-accent-subtle hover:text-primary focus:outline-none focus:ring-4 focus:ring-accent/20"
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
      </section>

      {isLanding ? (
        <>
          <HowItWorksSection />
          <FeatureBento />
          <FinalCta onStartBuilding={focusPrompt} />
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
              message={`${savedBuildMessage} View saved builds on the My Builds page.`}
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

export function MyBuildsPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<KeyboardComponent[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);
  const [savedBuildsLoaded, setSavedBuildsLoaded] = useState(false);
  const [savedBuildMessage, setSavedBuildMessage] = useState<string | null>(
    null,
  );

  const catalogById = useMemo(() => {
    return new Map(catalog.map((component) => [component.id, component]));
  }, [catalog]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSavedBuilds(readSavedBuildsFromStorage());
      setSavedBuildsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!savedBuildsLoaded) {
      return;
    }

    try {
      persistSavedBuilds(savedBuilds);
    } catch {
      // Local persistence is a prototype convenience; saved-build browsing should stay usable.
    }
  }, [savedBuilds, savedBuildsLoaded]);

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
      }
    }

    void loadCatalog();

    return () => controller.abort();
  }, []);

  function loadSavedBuild(savedBuild: SavedBuild) {
    const params = new URLSearchParams();
    for (const category of componentCategories) {
      if (savedBuild.componentIds[category]) {
        params.set(category, savedBuild.componentIds[category]);
      }
    }
    router.push(`/configurator?${params.toString()}`);
  }

  function deleteSavedBuild(savedBuildId: string) {
    const deletedBuild = savedBuilds.find((build) => build.id === savedBuildId);

    setSavedBuilds((current) =>
      current.filter((build) => build.id !== savedBuildId),
    );
    setSavedBuildMessage(
      deletedBuild ? `${deletedBuild.title} removed from saved builds.` : null,
    );
  }

  function clearSavedBuilds() {
    setSavedBuilds([]);
    setSavedBuildMessage("Saved builds cleared.");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-secondary text-primary">
      <LandingNav onStartBuilding={() => router.push("/configurator")} />

      <main className="mx-auto w-full max-w-screen-xl px-4 py-12 sm:px-8 lg:px-16">
        <div className="rounded-[32px] border border-white/80 bg-white/70 p-8 shadow-sm backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
            Local builds
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.01em] text-primary sm:text-5xl">
            My Builds
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-secondary">
            Saved recommendations and compatible manual builds live in this
            browser. Remove old drafts or load them to the manual selection panel.
          </p>
        </div>

        {catalogError ? (
          <Notice
            className="mt-6"
            icon={AlertCircle}
            message={catalogError}
            tone="red"
          />
        ) : null}

        <div className="mt-8">
          <SavedBuildsGallery
            catalogById={catalogById}
            loadLabel="Load build"
            message={savedBuildMessage}
            onClear={clearSavedBuilds}
            onDelete={deleteSavedBuild}
            onLoad={loadSavedBuild}
            savedBuilds={savedBuilds}
            savedBuildsLoaded={savedBuildsLoaded}
          />
        </div>
      </main>

      <SharkeysFooter />
      <FloatingKeybot
        catalogById={catalogById}
        manualSelection={{}}
        result={null}
        selectedRecommendation={null}
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
            keybot
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
          Ask Keybot about sound profiles, layouts, compatibility, or why a
          selected build fits your prompt.
        </p>
        <button
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 text-xs font-bold text-white transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30"
          onClick={onAskKeybot}
          type="button"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Ask Keybot
        </button>
      </div>
    </aside>
  );
}

function getCompactBuildName(
  recommendation: RecommendationBuild,
  index: number,
) {
  const layout = recommendation.components.case.layouts[0];
  const soundProfile = recommendation.components.switch.soundProfile;

  if (soundProfile === "silent") {
    return ["The Quiet Desk", "The Office Calm", "The Soft Focus"][index % 3];
  }

  if (soundProfile === "thocky") {
    return ["The Midnight Typer", "The Deep Studio", "The Warm Board"][
      index % 3
    ];
  }

  if (soundProfile === "creamy") {
    return ["The Smooth Studio", "The Creamy Coder", "The Soft Linear"][
      index % 3
    ];
  }

  if (soundProfile === "clacky") {
    return ["The Crisp Writer", "The Bright Desk", "The Sharp Typist"][
      index % 3
    ];
  }

  if (layout?.toLowerCase() === "tkl") {
    return ["The TKL Typist", "The Studio TKL", "The Workhorse"][
      index % 3
    ];
  }

  return ["The Daily Driver", "The Alpine Studio", "The Focus Board"][
    index % 3
  ];
}

function shortenCaseName(name: string) {
  return name
    .replace(/\bCNC\b/gi, "")
    .replace(/\bAluminum\b/gi, "")
    .replace(/\bABS\b/gi, "")
    .replace(/\bPlastic\b/gi, "")
    .replace(/\bCase\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shortenSwitchName(name: string) {
  return name
    .replace(/\b(Gateron|Akko|MMD|HMX|Outemu)\b/gi, "")
    .replace(/\b(Linear|Tactile|Clicky|Silent)\b/gi, "")
    .replace(/\bSwitch(?:es)?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function CompactRecommendationGrid({
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
  return (
    <section aria-label="Recommended builds" className="mx-auto w-full max-w-3xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl font-black text-primary">
            Recommended for you
          </h2>
        </div>
        <div className="hidden gap-2 text-secondary sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-sm">
            ‹
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-sm">
            ›
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {recommendations.slice(0, 3).map((recommendation, index) => {
          const selected = recommendation.id === selectedId;
          const layout = recommendation.components.case.layouts[0];
          const soundProfile =
            recommendation.components.switch.soundProfile ?? "neutral";
          const displayName = getCompactBuildName(recommendation, index);
          const summary = `${shortenCaseName(
            recommendation.components.case.name,
          )} • ${shortenSwitchName(recommendation.components.switch.name)}`;
          const price =
            recommendation.estimatedPrice === null
              ? "Estimate unavailable"
              : formatMoney(
                  recommendation.estimatedPrice,
                  recommendation.estimatedPriceCurrency ?? "MYR",
                );

          return (
            <article
              className={`rounded-lg border bg-white p-2 shadow-sm transition ${
                selected
                  ? "border-accent ring-4 ring-accent/20"
                  : "border-border hover:border-border"
              }`}
              key={recommendation.id}
            >
              <button
                aria-label={`Select Build ${index + 1}: ${displayName}`}
                className="flex w-full items-center gap-3 text-left"
                onClick={() => onSelect(recommendation)}
                type="button"
              >
                <CompactBuildThumbnail index={index} selected={selected} />

                <span className="min-w-0 flex-1 py-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate pr-2 text-sm font-black leading-5 text-primary">
                        {displayName}
                      </span>
                      <span className="mt-1 block truncate text-[11px] leading-4 text-secondary">
                        {summary}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-black text-primary">
                      {price}
                    </span>
                  </span>

                  <span className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded border border-border bg-surface px-2 py-0.5 text-[10px] font-bold text-secondary">
                      {formatLayoutChip(layout)}
                    </span>
                    <span className="rounded border border-border bg-surface px-2 py-0.5 text-[10px] font-bold capitalize text-secondary">
                      {soundProfile}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded border border-accent/60 bg-surface-secondary px-2 py-0.5 text-[10px] font-bold text-primary">
                      <CheckCircle2 className="h-3 w-3" aria-hidden />
                      Validated
                    </span>
                  </span>
                </span>
              </button>

              <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
                <button
                  aria-label="Save build"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-primary transition hover:border-accent hover:bg-surface-secondary focus:outline-none focus:ring-4 focus:ring-accent/20"
                  onClick={() => onSaveRecommendation(recommendation)}
                  type="button"
                >
                  <BookmarkPlus className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CompactBuildThumbnail({
  index,
  selected,
}: {
  index: number;
  selected: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`relative block h-24 w-24 flex-none overflow-hidden rounded-md border ${
        selected ? "border-accent" : "border-border"
      } bg-surface-secondary`}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(9,60,93,0.14)_1px,transparent_0)] [background-size:14px_14px]" />
      <span
        className={`absolute inset-x-3 bottom-4 rounded-lg p-2.5 shadow-sm ${
          index % 2 === 0 ? "bg-accent-subtle" : "bg-surface"
        }`}
      >
        <span className="mb-2 grid grid-cols-[1fr_1fr_1fr_2fr] gap-1">
          <span className="h-3.5 rounded bg-white/80" />
          <span className="h-3.5 rounded bg-white/80" />
          <span className="h-3.5 rounded bg-white/80" />
          <span className="h-3.5 rounded bg-white/80" />
        </span>
        <span className="grid grid-cols-[1.4fr_3fr_1.4fr] gap-1">
          <span className="h-3.5 rounded bg-white/80" />
          <span className="h-3.5 rounded bg-white/80" />
          <span className="h-3.5 rounded bg-white/80" />
        </span>
      </span>
    </span>
  );
}

function formatLayoutChip(layout: string | undefined) {
  if (!layout) {
    return "Layout";
  }

  return layout === "tkl" ? "TKL Layout" : `${layout}% Layout`;
}

function LandingNav({ onStartBuilding }: { onStartBuilding: () => void }) {
  const navLinks = [
    ["Configurator", "/configurator"],
    ["Browse", "/browse"],
    ["Community Gallery", "/community-gallery"],
    ["My Builds", "/my-builds"],
  ] as const;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface-secondary/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          className="flex items-center gap-3 text-primary focus:outline-none focus:ring-4 focus:ring-accent/30"
          href="/"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-subtle text-primary">
            <Keyboard className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-base font-black tracking-[-0.01em]">
            sharkeys.
          </span>
        </Link>

        <div className="hidden min-h-16 items-center gap-7 md:flex lg:gap-9">
          {navLinks.map(([label, href], index) => (
            <Link
              className={`flex min-h-16 items-center border-b-2 text-xs font-bold transition lg:text-sm ${
                index === 0
                  ? "border-accent text-primary"
                  : "border-transparent text-secondary hover:text-primary"
              }`}
              href={href}
              key={label}
            >
              {label}
            </Link>
          ))}
        </div>

        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 sm:px-6"
          onClick={onStartBuilding}
          type="button"
        >
          Get Started
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
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
        aria-label="Open Keybot assistant"
        className="sharkeys-soft-shadow fixed bottom-4 right-4 z-40 inline-flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-border bg-surface px-4 py-3 text-left text-primary transition hover:-translate-y-0.5 hover:border-accent hover:bg-surface-secondary focus:outline-none focus:ring-4 focus:ring-accent/30 sm:bottom-6 sm:right-6"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <KeybotAvatar />
        <span className="min-w-0">
          <span className="block text-sm font-bold leading-4">Ask Keybot</span>
          <span className="mt-0.5 hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2F8F46]" />
            Grounded
          </span>
        </span>
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
    {
      id: "keybot-welcome",
      role: "assistant",
      content:
        "Hi, I’m Keybot. Ask about switches, sound, layouts, compatibility, or your current build.",
    },
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
  const loadingLabel = contextSummary
    ? "Validating build context..."
    : "Checking catalog facts...";

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
          "error" in body ? body.error.message : "Keybot could not answer.",
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
          : "Keybot could not answer right now.";

      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: createKeybotMessageId("assistant"),
          role: "assistant",
          content:
            "I could not reach Keybot just now. The main configurator still uses deterministic validation.",
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
      aria-label="Keybot keyboard helper"
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
        <div className="border-b border-border/70 p-4">
          <div className="flex items-center gap-3">
            <KeybotAvatar />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold leading-5 text-primary">
                Keybot
              </h2>
              <p className="text-xs font-semibold text-secondary">
                Grounded assistant
              </p>
            </div>
            {onClose ? (
              <button
                aria-label="Close Keybot assistant"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-secondary transition hover:bg-accent-subtle hover:text-primary focus:outline-none focus:ring-4 focus:ring-accent/25"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Grounded in catalog + rules
            </span>
            {contextSummary ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-subtle px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
                <Cpu className="h-3.5 w-3.5" aria-hidden />
                Active build context
              </span>
            ) : null}
          </div>

          {contextSummary ? (
            <div className="mt-3 rounded-2xl border border-border/70 bg-surface-secondary p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-secondary">
                {contextSummary.label}
              </p>
              <p className="mt-1 truncate text-sm font-bold text-primary">
                {contextSummary.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {contextSummary.parts.map((part) => (
                  <span
                    className="rounded-full border border-border/70 bg-surface px-2.5 py-1 text-[11px] font-semibold text-secondary"
                    key={part}
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-b border-border/70 px-4 py-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-secondary">
            Suggested queries
          </p>
          <div className="flex flex-wrap gap-2">
            {keybotQuickActions.map((action) => (
              <button
                className="inline-flex items-center rounded-full border border-border/80 bg-surface px-3 py-2 text-xs font-bold text-secondary transition hover:border-accent hover:bg-accent-subtle hover:text-primary focus:outline-none focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending}
                key={action.label}
                onClick={() => void sendKeybotMessage(action.message)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div
          aria-live="polite"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-surface-secondary px-4 py-4"
        >
          {messages.map((message) => (
            <KeybotMessageBubble
              catalogById={catalogById}
              disabled={isSending}
              key={message.id}
              message={message}
              onSuggestion={(suggestion) => void sendKeybotMessage(suggestion)}
            />
          ))}
          {isSending ? <KeybotLoadingState label={loadingLabel} /> : null}
          <div ref={messagesEndRef} />
        </div>

        {error ? (
          <p className="border-t border-error/20 bg-error px-4 py-2 text-xs font-semibold text-error">
            {error}
          </p>
        ) : null}

        <form
          className="border-t border-border/70 bg-surface p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendKeybotMessage(input);
          }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-secondary p-1.5 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20">
            <input
              aria-label="Keybot question"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-primary placeholder:text-secondary/70 focus:outline-none"
              disabled={isSending}
              onChange={(event) => setInput(event.target.value)}
              placeholder={isSending ? "Thinking..." : "Ask about switches, sound..."}
              value={input}
            />
            <button
              aria-label="Send Keybot question"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent text-primary transition hover:bg-accent-hover hover:text-white focus:outline-none focus:ring-4 focus:ring-accent/30 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-white"
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
      className={`relative flex flex-none items-center justify-center rounded-full border border-border/80 bg-accent-subtle text-primary ${
        small ? "h-8 w-8" : "h-11 w-11"
      }`}
    >
      <Image
        alt="Meg"
        className="h-full w-full rounded-full object-cover"
        height={44}
        src="/meg-avatar.png"
        width={44}
      />
      <span className="absolute -right-0.5 top-1 h-2.5 w-2.5 rounded-full border-2 border-border bg-accent" />
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

function KeybotLoadingState({ label }: { label: string }) {
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

  if (message.source === "openai") {
    return "Catalog verified";
  }

  return "Catalog + rules";
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

function HowItWorksSection() {
  const steps = [
    {
      title: "Describe",
      body: "Type your requirements just like you’re talking to a friend.",
      icon: MessageCircle,
    },
    {
      title: "Generate",
      body: "Our AI curates specific builds tailored to your prompt.",
      icon: WandSparkles,
    },
    {
      title: "Validate",
      body: "Keybot checks every switch, plate, and PCB for compatibility.",
      icon: CheckCircle,
    },
    {
      title: "Preview",
      body: "See a high-fidelity visual of your build before you buy.",
      icon: Eye,
    },
  ] as const;

  return (
    <section className="px-4 py-20 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-[-0.01em] text-primary sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-base leading-7 text-primary/70">
            Your journey from thought to thock in four simple steps.
          </p>
        </div>

        <div className="relative mx-auto max-w-2xl pl-12">
          <div className="absolute bottom-8 left-[31px] top-8 w-0.5 rounded-full bg-gradient-to-b from-accent via-[#5DF8D8] to-accent/20" />
          {steps.map((step, index) => (
            <article
              className="relative z-10 mb-10 pl-8 last:mb-0"
              key={step.title}
            >
              <div
                className={`absolute left-[-24px] top-0 flex h-14 w-14 items-center justify-center rounded-full border-4 bg-white text-lg font-black text-primary shadow-lg ${
                  index % 2 === 0 ? "border-accent" : "border-[#5DF8D8]"
                }`}
              >
                {index + 1}
              </div>
              <div className="rounded-[24px] border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
                <div className="mb-2 flex items-center gap-2">
                  <step.icon
                    className={`h-4 w-4 ${
                      index % 2 === 0 ? "text-accent" : "text-[#12bfae]"
                    }`}
                    aria-hidden
                  />
                  <h3 className="text-lg font-bold text-primary">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm leading-6 text-primary/70">
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureBento() {
  return (
    <section
      className="mx-auto max-w-[1280px] px-4 py-20 sm:px-8 lg:px-6"
      id="features"
    >
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-[-0.01em] text-primary sm:text-4xl">
          Engineered for precision
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-primary/70">
          High-end tools to visualize, test, and perfect your custom build
          before ordering.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="flex min-h-[220px] flex-col justify-between rounded-[24px] border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur md:col-span-2">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-primary">
              <Cpu className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-lg font-bold text-primary">
              AI Part Compatibility
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-primary/70">
              Real-time validation ensures your chosen switches, PCB, and
              keycaps fit perfectly. No more costly mismatch errors.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-xl border border-white/70 bg-white/45 p-3">
            <span className="text-xs font-bold text-primary/80">
              Compatibility Status
            </span>
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-primary/60">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Live check
            </span>
          </div>
        </article>

        <article className="flex min-h-[220px] flex-col rounded-[24px] border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-primary">
              <Eye className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-lg font-bold text-primary">
              Visual Preview
            </h3>
            <p className="mt-2 text-sm leading-6 text-primary/70">
              See exactly how your components look together before you buy.
            </p>
          </div>
          <FeatureKeyboardMini />
        </article>

        <article className="flex min-h-[200px] flex-col rounded-[24px] border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-primary">
              <Volume2 className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-lg font-bold text-primary">
              Typing Sound Preview
            </h3>
            <p className="mt-2 text-sm leading-6 text-primary/70">
              Estimate acoustic profiles from switch, plate, and case metadata.
            </p>
          </div>
          <SoundWave />
        </article>

        <article className="flex min-h-[200px] flex-col rounded-[24px] border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-primary">
              <Bot className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-lg font-bold text-primary">
              Knowledge Assistant
            </h3>
            <p className="mt-2 text-sm leading-6 text-primary/70">
              Ask Keybot anything from switch feel to layout tradeoffs.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/70 bg-white/45 p-2">
            <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-accent text-white">
              <Image
                alt="Meg"
                className="h-full w-full rounded-full object-cover"
                height={24}
                src="/meg-avatar.png"
                width={24}
              />
            </span>
            <span className="text-xs font-bold text-primary/60">
              “What’s a thock?”
            </span>
          </div>
        </article>

        <article className="flex min-h-[200px] flex-col rounded-[24px] border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-primary">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-lg font-bold text-primary">
              Community Builds
            </h3>
            <p className="mt-2 text-sm leading-6 text-primary/70">
              Explore shared builds and remix ideas in future phases.
            </p>
          </div>
          <div className="mt-5 flex items-center -space-x-2">
            {["A", "B", "C"].map((label, index) => (
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-black text-primary ${
                  index === 0
                    ? "bg-accent/30"
                    : index === 1
                      ? "bg-[#5DF8D8]/30"
                      : "bg-accent/15"
                }`}
                key={label}
              >
                {label}
              </span>
            ))}
            <span className="pl-4 text-xs font-bold text-primary/45">
              +1k
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}

function FeatureKeyboardMini() {
  return (
    <div className="mt-auto flex h-16 items-center justify-center rounded-xl border border-white/70 bg-white/45">
      <Keyboard className="h-7 w-7 text-primary/25" aria-hidden />
    </div>
  );
}

function SoundWave() {
  const heights = [30, 58, 100, 44, 24, 82];

  return (
    <div className="mt-5 flex h-10 items-end justify-center gap-1.5">
      {heights.map((height, index) => (
        <span
          className="w-3 rounded-t-sm bg-accent/70"
          key={`${height}-${index}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function FinalCta({ onStartBuilding }: { onStartBuilding: () => void }) {
  return (
    <section className="px-4 py-24 text-center sm:px-8 lg:px-6">
      <div className="mx-auto max-w-[1280px] rounded-[40px] border border-accent/30 bg-white/55 px-6 py-16 shadow-sm backdrop-blur sm:px-10 lg:py-20">
        <h2 className="text-4xl font-black tracking-[-0.01em] text-primary sm:text-5xl">
          Ready to hear the perfect click?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-primary/70">
          Start your journey with sharkeys today and join thousands of
          enthusiasts building better boards.
        </p>
        <button
          className="mt-9 inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-8 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 sm:px-12"
          onClick={onStartBuilding}
          type="button"
        >
          Create your keyboard now
        </button>
      </div>
    </section>
  );
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
            width={140}
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
              : formatMoney(
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
              : formatMoney(
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
                : formatMoney(
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
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-border-strong"
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

function SavedBuildsGallery({
  catalogById,
  loadLabel = "Load build",
  message,
  onClear,
  onDelete,
  onLoad,
  savedBuilds,
  savedBuildsLoaded,
}: {
  catalogById: Map<string, KeyboardComponent>;
  loadLabel?: string;
  message: string | null;
  onClear: () => void;
  onDelete: (savedBuildId: string) => void;
  onLoad: (savedBuild: SavedBuild) => void;
  savedBuilds: SavedBuild[];
  savedBuildsLoaded: boolean;
}) {
  return (
    <section
      aria-label="Saved builds gallery"
      className="rounded-3xl border border-border bg-white p-5 shadow-sm"
      id="saved-builds-gallery"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Local gallery
          </p>
          <h2 className="mt-1 text-base font-bold text-primary">
            Saved builds
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Saved in this browser for local prototype review.
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-secondary transition hover:bg-accent-subtle disabled:cursor-not-allowed disabled:opacity-50"
          disabled={savedBuildsLoaded && savedBuilds.length === 0}
          onClick={onClear}
          type="button"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Clear all
        </button>
      </div>

      {message ? (
        <Notice
          className="mt-4"
          icon={Info}
          message={message}
          tone="sky"
        />
      ) : null}

      {!savedBuildsLoaded ? (
        <p className="mt-4 rounded-2xl border border-border bg-surface-secondary px-3 py-2 text-sm text-secondary">
          Loading saved builds...
        </p>
      ) : null}

      {savedBuildsLoaded && savedBuilds.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border bg-surface-secondary px-3 py-4 text-sm text-secondary">
          No saved builds yet. Save a validated recommendation or a compatible
          manual build to keep it here.
        </p>
      ) : null}

      {savedBuilds.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {savedBuilds.map((savedBuild) => (
            <SavedBuildCard
              catalogById={catalogById}
              key={savedBuild.id}
              loadLabel={loadLabel}
              onDelete={onDelete}
              onLoad={onLoad}
              savedBuild={savedBuild}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SavedBuildCard({
  catalogById,
  loadLabel,
  onDelete,
  onLoad,
  savedBuild,
}: {
  catalogById: Map<string, KeyboardComponent>;
  loadLabel: string;
  onDelete: (savedBuildId: string) => void;
  onLoad: (savedBuild: SavedBuild) => void;
  savedBuild: SavedBuild;
}) {
  const price =
    savedBuild.estimatedPrice !== null && savedBuild.estimatedPriceCurrency
      ? formatMoney(savedBuild.estimatedPrice, savedBuild.estimatedPriceCurrency)
      : "No estimate";

  return (
    <article className="rounded-2xl border border-border bg-surface-secondary p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-white px-2 py-1 text-xs font-semibold text-primary">
              {savedBuild.validation.isValid ? "Compatible" : "Needs review"}
            </span>
            <span className="rounded-full border border-border bg-white px-2 py-1 text-xs font-semibold text-secondary">
              Saved {savedBuild.source}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-bold leading-5 text-primary">
            {savedBuild.title}
          </h3>
          <p className="mt-1 text-xs text-secondary">
            {new Date(savedBuild.createdAt).toLocaleString("en-MY", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
            Estimated total
          </p>
          <p className="mt-1 text-base font-bold text-primary">{price}</p>
        </div>
      </div>

      <dl className="mt-3 grid gap-2 border-y border-border py-3 sm:grid-cols-2">
        {componentCategories.map((category) => {
          const component = catalogById.get(savedBuild.componentIds[category]);

          return (
            <div key={category}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
                {categoryLabels[category]}
              </dt>
              <dd className="mt-1 text-sm text-primary">
                {component?.name ?? savedBuild.componentIds[category]}
              </dd>
              {component?.vendorUrl ? (
                <a
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary hover:underline"
                  href={component.vendorUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Vendor
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : null}
            </div>
          );
        })}
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm font-bold text-white transition hover:bg-accent-hover"
          onClick={() => onLoad(savedBuild)}
          type="button"
        >
          <CopyPlus className="h-4 w-4" aria-hidden />
          {loadLabel}
        </button>
        <button
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-secondary transition hover:bg-accent-subtle"
          onClick={() => onDelete(savedBuild.id)}
          type="button"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete
        </button>
      </div>
    </article>
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
  message: string;
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
