"use client";

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
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
  WandSparkles,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import type { CompatibilityResult, KeyboardComponent } from "@/lib/types";
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
  "Quiet keyboard for office",
  "Creamy sound for studying",
  "Beginner-friendly gaming build",
  "Thocky keyboard under RM300",
] as const;

const smokePromptExamples = [
  "creamy 65% beginner keyboard under RM500",
  "optical 60% clacky gaming build",
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

function getLayoutPreviewRows(layout: string | null | undefined) {
  if (layout === "tkl") {
    return [
      ["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7"],
      ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "Del"],
      ["Caps", "A", "S", "D", "F", "G", "H", "J", "Enter"],
      ["Shift", "Z", "X", "C", "V", "B", "N", "M", "Up"],
      ["Ctrl", "Win", "Alt", "Space", "Alt", "Fn", "Left", "Down", "Right"],
    ];
  }

  if (layout === "60") {
    return [
      ["Esc", "1", "2", "3", "4", "5", "6"],
      ["Tab", "Q", "W", "E", "R", "T"],
      ["Caps", "A", "S", "D", "F", "G"],
      ["Shift", "Z", "X", "C", "V"],
      ["Ctrl", "Alt", "Space", "Fn"],
    ];
  }

  return [
    ["Esc", "1", "2", "3", "4", "5", "6", "7"],
    ["Tab", "Q", "W", "E", "R", "T", "Y"],
    ["Caps", "A", "S", "D", "F", "G", "Enter"],
    ["Shift", "Z", "X", "C", "V", "B"],
    ["Ctrl", "Alt", "Space", "Alt", "Fn"],
  ];
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

export function RecommendationDemo() {
  const promptRef = useRef<HTMLTextAreaElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const [message, setMessage] = useState("");
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

    await runRecommendationRequest();
  }

  async function handleQuickPrompt(prompt: string) {
    if (isSubmitting) {
      return;
    }

    setMessage(prompt);
    await runRecommendationRequest(prompt);
  }

  function focusPrompt() {
    promptRef.current?.focus();
    promptRef.current?.scrollIntoView({
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

  function loadSavedBuild(savedBuild: SavedBuild) {
    setManualSelection(savedBuild.componentIds);
    setManualValidation(null);
    setManualError(null);
    setActiveCategory("case");
    setSavedBuildMessage(`${savedBuild.title} loaded into the manual panel.`);
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
    <div className="min-h-screen bg-[#f5faff] text-[#071e29]">
      <LandingNav onStartBuilding={focusPrompt} />

      <section
        className="mx-auto flex w-full max-w-screen-xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-8 lg:px-16 lg:pb-28 lg:pt-20"
        id="configurator"
      >
        <h1 className="max-w-4xl text-[44px] font-bold leading-[1.08] tracking-[-0.02em] text-[#071e29] sm:text-5xl lg:text-[64px] lg:leading-[1.04]">
          Build your dream keyboard in a few words
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-7 text-[#42474e] sm:text-lg">
          Describe your preferred sound, feel, layout, or budget, and let the AI
          guide you toward a compatible custom keyboard build.
        </p>

        <form
          className="sharkeys-soft-shadow mt-12 w-full max-w-3xl rounded-[24px] border border-[#c2c7cf] bg-white p-5 text-left transition focus-within:border-[#00639d] focus-within:ring-4 focus-within:ring-[#43acff]/20"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="keyboard-request">
            Keyboard request
          </label>
          <textarea
            className="min-h-[118px] w-full resize-none border-none bg-transparent p-0 text-base leading-7 text-[#071e29] outline-none placeholder:text-[#42474e]/60 focus:ring-0 sm:text-lg"
            id="keyboard-request"
            maxLength={2000}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Build me a keyboard under RM300 that is quiet and suitable for office..."
            ref={promptRef}
            value={message}
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                aria-label="Voice input is not available yet"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#42474e] transition hover:bg-[#e9f5ff] disabled:cursor-not-allowed disabled:opacity-45"
                disabled
                type="button"
              >
                <Mic className="h-5 w-5" aria-hidden />
              </button>
              <button
                aria-label="Image input is not available yet"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#42474e] transition hover:bg-[#e9f5ff] disabled:cursor-not-allowed disabled:opacity-45"
                disabled
                type="button"
              >
                <ImageIcon className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <button
              aria-label="Find validated builds"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#094067] text-white shadow-sm transition hover:bg-[#002a47] focus:outline-none focus:ring-4 focus:ring-[#43acff]/30 disabled:cursor-not-allowed disabled:bg-[#72777f]"
              disabled={isSubmitDisabled}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Send className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex max-w-4xl flex-wrap justify-center gap-3">
          {quickPrompts.map((prompt) => (
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#c2c7cf] bg-white px-5 py-2 text-sm font-semibold text-[#42474e] transition hover:border-[#094067] hover:text-[#094067] focus:outline-none focus:ring-4 focus:ring-[#43acff]/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={hasMounted && isSubmitting}
              key={prompt}
              onClick={() => void handleQuickPrompt(prompt)}
              type="button"
            >
              <Sparkles className="h-4 w-4 text-[#00639d]" aria-hidden />
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-[#42474e]">
          {smokePromptExamples.map((prompt) => (
            <button
              className="rounded-full px-3 py-1.5 transition hover:bg-[#e9f5ff] hover:text-[#094067] focus:outline-none focus:ring-4 focus:ring-[#43acff]/20"
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

      <section
        className="border-y border-[#c2c7cf]/60 bg-[#e9f5ff] px-4 py-16 sm:px-8 lg:px-16"
        id="results"
        ref={resultsRef}
      >
        <div className="mx-auto w-full max-w-screen-xl">
          <WorkspaceHeader result={result} selected={selectedRecommendation} />

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

              <SavedBuildsGallery
                catalogById={catalogById}
                message={savedBuildMessage}
                onClear={clearSavedBuilds}
                onDelete={deleteSavedBuild}
                onLoad={loadSavedBuild}
                savedBuilds={savedBuilds}
                savedBuildsLoaded={savedBuildsLoaded}
              />
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

              <div className="lg:hidden">
                <KeybotPanel
                  catalogById={catalogById}
                  manualSelection={manualSelection}
                  result={result}
                  selectedRecommendation={selectedRecommendation}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <FeatureBento />
      <FinalCta onStartBuilding={focusPrompt} />
      <SharkeysFooter />

      <div className="hidden lg:block">
        <FloatingKeybot
          catalogById={catalogById}
          manualSelection={manualSelection}
          result={result}
          selectedRecommendation={selectedRecommendation}
        />
      </div>
    </div>
  );
}

function LandingNav({ onStartBuilding }: { onStartBuilding: () => void }) {
  const navLinks = [
    ["Configurator", "#configurator"],
    ["Browse", "#features"],
    ["Community Gallery", "#saved-builds-gallery"],
    ["My Builds", "#saved-builds-gallery"],
  ] as const;

  return (
    <nav className="sticky top-0 z-50 border-b border-[#c2c7cf] bg-[#f5faff]/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-8 lg:px-16">
        <a
          className="flex items-center gap-3 text-[#094067] focus:outline-none focus:ring-4 focus:ring-[#43acff]/30"
          href="#configurator"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ddf1ff] text-[#094067]">
            <Keyboard className="h-6 w-6" aria-hidden />
          </span>
          <span className="text-2xl font-bold tracking-[-0.01em]">
            sharkeys
          </span>
        </a>

        <div className="hidden h-full items-center gap-10 md:flex">
          {navLinks.map(([label, href], index) => (
            <a
              className={`flex h-full items-center border-b-2 text-sm font-semibold transition ${
                index === 0
                  ? "border-[#094067] text-[#094067]"
                  : "border-transparent text-[#42474e] hover:text-[#094067]"
              }`}
              href={href}
              key={label}
            >
              {label}
            </a>
          ))}
        </div>

        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#094067] px-5 text-sm font-bold text-white transition hover:bg-[#002a47] focus:outline-none focus:ring-4 focus:ring-[#43acff]/30"
          onClick={onStartBuilding}
          type="button"
        >
          Start Building
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
  result,
  selectedRecommendation,
}: Omit<KeybotPanelProps, "floating" | "onClose">) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        aria-label="Open Keybot assistant"
        className="sharkeys-soft-shadow fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-[#c2c7cf] bg-[#094067] text-white transition hover:-translate-y-0.5 hover:bg-[#002a47] focus:outline-none focus:ring-4 focus:ring-[#43acff]/30"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Bot className="h-7 w-7" aria-hidden />
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
  const faqs = [
    "What is a thocky keyboard?",
    "Linear vs tactile switches",
    "What is a hot-swappable PCB?",
  ] as const;
  const [messages, setMessages] = useState<KeybotChatMessage[]>([
    {
      id: "keybot-welcome",
      role: "assistant",
      content:
        "Hi, I’m Keybot. Ask about switches, sound, layouts, compatibility, or your current validated build.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            history: nextMessages,
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
            "I could not reach Keybot just now. The main configurator still uses deterministic validation for recommendations.",
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
          ? "fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-3rem)]"
          : "w-full"
      }
    >
      <div className="sharkeys-soft-shadow overflow-hidden rounded-3xl border border-[#c2c7cf] bg-white">
        <div className="flex items-center gap-3 bg-[#002a47] p-5 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#094067]">
            <Bot className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold">Keybot</h2>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Keyboard terms, build help, and FAQs
            </p>
          </div>
          {onClose ? (
            <button
              aria-label="Close Keybot assistant"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="space-y-4 p-5">
          <div
            aria-live="polite"
            className="max-h-80 space-y-3 overflow-y-auto pr-1"
          >
            {messages.map((message) => (
              <div
                className={`rounded-2xl border p-3 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "rounded-tl-md border-[#c2c7cf]/60 bg-[#e9f5ff] text-[#071e29]"
                    : "rounded-tr-md border-[#094067]/20 bg-[#094067] text-white"
                }`}
                key={message.id}
              >
                <p>{message.content}</p>
                {message.source && message.source !== "openai" ? (
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-70">
                    {message.source === "fallback_missing_api_key"
                      ? "Local grounded fallback"
                      : "Safe fallback"}
                  </p>
                ) : null}
                {message.relatedComponentIds &&
                message.relatedComponentIds.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.relatedComponentIds.slice(0, 4).map((id) => {
                      const component = catalogById.get(id);

                      return (
                        <span
                          className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#094067]"
                          key={id}
                        >
                          {component?.name ?? id}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
            {isSending ? (
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-[#c2c7cf]/60 bg-[#e9f5ff] p-3 text-sm font-semibold text-[#094067]">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Keybot is checking grounded catalog facts...
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            {faqs.map((faq) => (
              <button
                className="w-full rounded-2xl border border-[#c2c7cf]/70 bg-[#ddf1ff] p-3 text-left text-sm font-bold text-[#094067] transition hover:border-[#00639d] hover:bg-[#d5ebfb] focus:outline-none focus:ring-4 focus:ring-[#43acff]/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending}
                key={faq}
                onClick={() => void sendKeybotMessage(faq)}
                type="button"
              >
                {faq}
              </button>
            ))}
          </div>
          {error ? (
            <p className="rounded-2xl border border-[#ba1a1a]/20 bg-[#fff5f5] px-3 py-2 text-xs font-semibold text-[#ba1a1a]">
              {error}
            </p>
          ) : null}
        </div>

        <form
          className="flex items-center gap-2 border-t border-[#c2c7cf] p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendKeybotMessage(input);
          }}
        >
          <input
            aria-label="Keybot question"
            className="min-w-0 flex-1 rounded-full border border-transparent bg-transparent px-3 py-2 text-sm text-[#071e29] placeholder:text-[#42474e]/60 focus:border-[#00639d] focus:outline-none focus:ring-4 focus:ring-[#43acff]/20"
            disabled={isSending}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about switches, sound, layouts, or your current build..."
            value={input}
          />
          <button
            aria-label="Send Keybot question"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#43acff] text-[#003e66] transition hover:bg-[#00639d] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#43acff]/30 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSending || input.trim().length === 0}
            type="submit"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
          </button>
        </form>
      </div>
    </section>
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
    conversationHistory: history.slice(-6).map((message) => ({
      role: message.role,
      content: message.content,
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
      body: "Tell us what you want in plain English.",
      icon: MessageCircle,
    },
    {
      title: "Generate",
      body: "Get curated, compatible component lists.",
      icon: WandSparkles,
    },
    {
      title: "Validate",
      body: "Automatic checks ensure everything fits.",
      icon: CheckCircle,
    },
    {
      title: "Preview",
      body: "See the look and review the recommended build before choosing parts.",
      icon: Eye,
    },
  ] as const;

  return (
    <section className="bg-[#e9f5ff] px-4 py-20 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#071e29] sm:text-4xl">
            The intelligent way to build
          </h2>
          <p className="mt-3 text-lg text-[#42474e]">
            From concept to compatibility check, handled by AI.
          </p>
        </div>

        <div className="relative grid gap-6 md:grid-cols-4">
          <div className="absolute left-[10%] right-[10%] top-10 hidden h-px bg-[#c2c7cf] md:block" />
          {steps.map((step, index) => (
            <article
              className="relative z-10 flex flex-col items-center text-center"
              key={step.title}
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#c2c7cf] bg-white shadow-sm">
                <step.icon className="h-8 w-8 text-[#094067]" aria-hidden />
              </div>
              <h3 className="text-2xl font-semibold text-[#071e29]">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-2 text-base leading-6 text-[#42474e]">
                {step.body}
              </p>
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
      className="mx-auto max-w-screen-xl px-4 py-24 sm:px-8 lg:px-16"
      id="features"
    >
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-[-0.01em] text-[#071e29] sm:text-4xl">
          Precision tools, simplified
        </h2>
      </div>

      <div className="grid auto-rows-[minmax(260px,auto)] gap-6 md:grid-cols-3">
        <article className="sharkeys-soft-shadow overflow-hidden rounded-3xl border border-[#c2c7cf] bg-white md:col-span-2 md:row-span-2">
          <div className="p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#ddf1ff] text-[#094067]">
              <Eye className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-2xl font-semibold text-[#071e29]">
              Visual Build Preview
            </h3>
            <p className="mt-3 max-w-xl text-lg leading-7 text-[#42474e]">
              Review the recommended build structure with a clean keyboard
              preview before inspecting individual parts.
            </p>
          </div>
          <BentoKeyboardPreview />
        </article>

        <article className="sharkeys-soft-shadow flex flex-col justify-between rounded-3xl border border-[#c2c7cf] bg-white p-8">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#d0e6f5] text-[#00639d]">
              <Cpu className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-2xl font-semibold text-[#071e29]">
              Smart Compatibility
            </h3>
            <p className="mt-3 text-base leading-6 text-[#42474e]">
              Deterministic checks compare layouts, mounts, switch technology,
              keycaps, and stabilizers before a build is shown.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#c2c7cf]/70 bg-[#ddf1ff] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#094067]">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#071e29]">
                PCB &amp; Switches matched
              </p>
              <p className="text-xs text-[#42474e]">
                Technology and layout verified
              </p>
            </div>
          </div>
        </article>

        <article className="sharkeys-soft-shadow flex flex-col justify-between overflow-hidden rounded-3xl border border-[#c2c7cf] bg-white p-8">
          <div>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#ddf1ff] text-[#094067]">
              <Volume2 className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="text-2xl font-semibold text-[#071e29]">
              Sound Profile Guidance
            </h3>
            <p className="mt-3 text-base leading-6 text-[#42474e]">
              Match preferences like thocky, creamy, clacky, or silent using
              catalog metadata. No simulated audio is claimed yet.
            </p>
          </div>
          <SoundWave />
        </article>
      </div>
    </section>
  );
}

function BentoKeyboardPreview() {
  return (
    <div className="sharkeys-keyboard-preview border-t border-[#c2c7cf] p-8">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-[#c2c7cf] bg-[#d5ebfb] p-5 shadow-sm">
        <div className="grid gap-2">
          {getLayoutPreviewRows("65").map((row, rowIndex) => (
            <div
              className="grid auto-cols-fr grid-flow-col gap-2"
              key={row.join("-")}
              style={{ paddingLeft: `${rowIndex * 0.5}rem` }}
            >
              {row.map((keycap, keyIndex) => (
                <span
                  className="sharkeys-keycap flex h-10 min-w-0 items-center justify-center rounded-lg border border-[#c2c7cf] bg-white px-2 text-[11px] font-semibold text-[#42474e]"
                  key={`${rowIndex}-${keyIndex}-${keycap}`}
                >
                  {keycap}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SoundWave() {
  const heights = [24, 42, 78, 100, 62, 34, 90, 52, 70, 44, 24];

  return (
    <div className="mt-8 flex h-20 items-end gap-1.5">
      {heights.map((height, index) => (
        <span
          className="w-3 rounded-t-full bg-[#094067]/70"
          key={`${height}-${index}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function FinalCta({ onStartBuilding }: { onStartBuilding: () => void }) {
  return (
    <section className="border-y border-[#c2c7cf]/70 bg-[#e9f5ff] px-4 py-24 text-center sm:px-8 lg:px-16">
      <h2 className="text-4xl font-bold tracking-[-0.02em] text-[#071e29] sm:text-5xl">
        Ready to curate your keystrokes?
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-7 text-[#42474e]">
        Stop endlessly researching compatibility. Let sharkeys guide you to the
        perfect build in minutes.
      </p>
      <button
        className="mt-10 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#094067] px-8 text-lg font-bold text-white transition hover:bg-[#002a47] focus:outline-none focus:ring-4 focus:ring-[#43acff]/30"
        onClick={onStartBuilding}
        type="button"
      >
        Start Building Now
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
    </section>
  );
}

function SharkeysFooter() {
  const links = [
    "Design Guide",
    "Switch Library",
    "Keycap Compatibility",
    "Discord Community",
    "Support",
  ];

  return (
    <footer className="border-t border-[#c2c7cf] bg-[#d0e6f5] px-4 py-16 sm:px-8 lg:px-16">
      <div className="mx-auto grid max-w-screen-2xl gap-8 md:grid-cols-[280px_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold text-[#071e29]">
            <Keyboard className="h-6 w-6 text-[#094067]" aria-hidden />
            sharkeys
          </div>
          <p className="mt-4 max-w-xs text-base leading-6 text-[#42474e]">
            Precision-engineered guidance for custom mechanical keyboard builds.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 md:justify-end">
          {links.map((link) => (
            <a
              className="text-base text-[#42474e] transition hover:text-[#094067] hover:underline focus:outline-none focus:ring-4 focus:ring-[#43acff]/20"
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
  const price =
    selected?.estimatedPrice !== null && selected?.estimatedPrice !== undefined
      ? formatMoney(selected.estimatedPrice, selected.estimatedPriceCurrency ?? "MYR")
      : "No estimate";

  return (
    <div className="sharkeys-soft-shadow rounded-3xl border border-[#c2c7cf] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00639d]">
            sharkeys configurator
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.01em] text-[#071e29]">
            Validated keyboard workspace
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#42474e]">
            Review generated builds, inspect catalog parts, save compatible
            builds, or run your own manual validation check.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right sm:grid-cols-3">
          <Metric label="Validated builds" value={`${result?.recommendations.length ?? 0}`} />
          <Metric label="Candidate groups" value={result ? "6" : "0"} />
          <Metric label="Selected total" value={price} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-28 rounded-2xl border border-[#c2c7cf] bg-[#e9f5ff] px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#42474e]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[#071e29]">{value}</p>
    </div>
  );
}

function IntentPanel({ result }: { result: RecommendationResult | null }) {
  if (!result) {
    return (
      <div className="rounded-3xl border border-[#c2c7cf] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-[#071e29]">Extracted preferences</h2>
        <p className="mt-2 text-sm leading-6 text-[#42474e]">
          Submit a request to see extracted build criteria.
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
    <div className="rounded-3xl border border-[#c2c7cf] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-[#071e29]">Extracted preferences</h2>
        <span className="rounded-full border border-[#c2c7cf] bg-[#e9f5ff] px-2.5 py-1 text-xs font-semibold text-[#094067]">
          {result.source.replaceAll("_", " ")}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#42474e]">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[#071e29]">{value}</dd>
          </div>
        ))}
      </dl>
      {result.criteria.maxPrice ? (
        <p className="mt-3 border-t border-[#c2c7cf]/70 pt-3 text-xs text-[#42474e]">
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
    <div className="rounded-3xl border border-[#c2c7cf] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Layers3 className="h-4 w-4 text-[#00639d]" aria-hidden />
        <h2 className="text-sm font-bold text-[#071e29]">Compare builds</h2>
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
                  ? "border-[#00639d] bg-[#ddf1ff]"
                  : "border-[#c2c7cf] bg-white hover:border-[#00639d] hover:bg-[#f5faff]"
              }`}
              key={recommendation.id}
              onClick={() => onSelect(recommendation)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#42474e]">
                    Build {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-5 text-[#071e29]">
                    {recommendation.components.case.name}
                  </p>
                </div>
                <span className="rounded-full border border-[#c2c7cf] bg-white px-2 py-1 text-xs font-semibold text-[#094067]">
                  Valid
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-[#071e29]">{price}</p>
              <p className="mt-1 text-xs text-[#42474e]">
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
  const layout =
    recommendation.validation.selectedComponents.case?.layouts[0] ??
    recommendation.validation.selectedComponents.pcb?.layouts[0] ??
    null;

  return (
    <div className="overflow-hidden rounded-3xl border border-[#c2c7cf] bg-white shadow-sm">
      <div className="border-b border-[#c2c7cf] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#c2c7cf] bg-[#ddf1ff] px-2.5 py-1 text-xs font-semibold text-[#094067]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Rule-engine validated
            </div>
            <h2 className="text-2xl font-bold tracking-[-0.01em] text-[#071e29]">
              {recommendation.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#42474e]">
              {recommendation.explanations[0]}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#42474e]">
              Estimated total
            </p>
            <p className="mt-1 text-3xl font-bold text-[#071e29]">
              {recommendation.estimatedPrice === null
                ? "Unavailable"
                : formatMoney(
                    recommendation.estimatedPrice,
                    recommendation.estimatedPriceCurrency ?? "MYR",
                  )}
            </p>
            <button
              className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#094067] px-4 text-sm font-bold text-white transition hover:bg-[#002a47] focus:outline-none focus:ring-4 focus:ring-[#43acff]/30"
              onClick={() => onSaveRecommendation(recommendation)}
              type="button"
            >
              <BookmarkPlus className="h-4 w-4" aria-hidden />
              Save build
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="border-b border-[#c2c7cf] p-5 lg:border-b-0 lg:border-r">
          <KeyboardPreview layout={layout} />

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {componentCategories.map((category) => {
              const component = recommendation.components[category];
              const active = category === activeCategory;

              return (
                <button
                  className={`rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-[#00639d] bg-[#ddf1ff]"
                      : "border-[#c2c7cf] bg-[#f5faff] hover:border-[#00639d] hover:bg-white"
                  }`}
                  key={category}
                  onClick={() => onActiveCategoryChange(category)}
                  type="button"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#42474e]">
                    {categoryLabels[category]}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-bold text-[#071e29]">
                    {component.name}
                  </p>
                  <p className="mt-1 text-xs text-[#00639d]">{component.brand}</p>
                  <p className="mt-2 text-xs leading-4 text-[#42474e]">
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

function KeyboardPreview({ layout }: { layout: string | null }) {
  const rows = getLayoutPreviewRows(layout);

  return (
    <div className="sharkeys-keyboard-preview rounded-3xl border border-[#c2c7cf] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#071e29]">Layout canvas</p>
          <p className="text-xs text-[#42474e]">{layout ?? "auto"} layout preview</p>
        </div>
        <Keyboard className="h-5 w-5 text-[#094067]" aria-hidden />
      </div>
      <div className="grid gap-1.5">
        {rows.map((row, rowIndex) => (
          <div
            className="grid auto-cols-fr grid-flow-col gap-1.5"
            key={row.join("-")}
            style={{ paddingLeft: `${rowIndex * 0.35}rem` }}
          >
            {row.map((keycap, keyIndex) => (
              <span
                className="sharkeys-keycap flex h-8 min-w-0 items-center justify-center rounded-lg border border-[#c2c7cf] bg-white px-1 text-[11px] font-semibold text-[#42474e]"
                key={`${rowIndex}-${keyIndex}-${keycap}`}
              >
                {keycap}
              </span>
            ))}
          </div>
        ))}
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
        <p className="text-sm text-[#42474e]">No component selected.</p>
      </div>
    );
  }

  const sourceVendor = getMetadataString(component.metadata, "sourceVendor");
  const sourceType = getMetadataString(component.metadata, "sourceType");
  const sourceNote = getMetadataString(component.metadata, "sourceNote");
  const layouts = getComponentLayouts(component);

  return (
    <aside className="p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#42474e]">
        {categoryLabels[category]}
      </p>
      <h3 className="mt-1 text-base font-bold leading-6 text-[#071e29]">
        {component.name}
      </h3>
      <p className="mt-1 text-sm text-[#00639d]">{component.brand}</p>
      <p className="mt-4 text-sm leading-6 text-[#42474e]">
        {component.description}
      </p>

      <dl className="mt-4 grid gap-3 border-y border-[#c2c7cf] py-4">
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
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#42474e]">
          Source
        </p>
        <p className="text-sm font-bold text-[#071e29]">
          {sourceVendor ?? "Vendor metadata unavailable"}
        </p>
        {sourceType ? (
          <p className="text-xs text-[#42474e]">{sourceType.replaceAll("_", " ")}</p>
        ) : null}
        {sourceNote ? <p className="text-xs leading-5 text-[#42474e]">{sourceNote}</p> : null}
        {component.vendorUrl ? (
          <a
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#094067] hover:text-[#002a47] hover:underline"
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
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#42474e]">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[#071e29]">{value}</dd>
    </div>
  );
}

function CompatibilityPanel({
  recommendation,
}: {
  recommendation: RecommendationBuild;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-[#c2c7cf] bg-[#f5faff] p-4">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-[#094067]" aria-hidden />
        <div>
          <p className="text-sm font-bold text-[#071e29]">
            Compatibility status
          </p>
          <p className="mt-1 text-sm text-[#42474e]">
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
        <p className="mt-3 rounded-2xl border border-[#c2c7cf] bg-white px-3 py-2 text-sm text-[#094067]">
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
    <div className="rounded-3xl border border-[#c2c7cf] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-[#00639d]" aria-hidden />
        <h2 className="text-sm font-bold text-[#071e29]">Manual build check</h2>
      </div>

      {catalogError ? (
        <Notice icon={AlertCircle} message={catalogError} tone="red" />
      ) : null}

      <div className="grid gap-3">
        {componentCategories.map((category) => (
          <label className="block" key={category}>
            <span className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#42474e]">
              {categoryLabels[category]}
            </span>
            <select
              className="h-10 w-full rounded-lg border border-[#c2c7cf] bg-white px-3 text-sm text-[#071e29] outline-none transition focus:border-[#00639d] focus:ring-4 focus:ring-[#43acff]/20 disabled:bg-[#e9f5ff]"
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
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#094067] px-4 text-sm font-bold text-white transition hover:bg-[#002a47] disabled:cursor-not-allowed disabled:bg-[#72777f]"
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
              ? "border-[#c2c7cf] bg-[#ddf1ff] text-[#094067]"
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
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#094067] px-3 text-sm font-bold text-white transition hover:bg-[#002a47]"
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
  message,
  onClear,
  onDelete,
  onLoad,
  savedBuilds,
  savedBuildsLoaded,
}: {
  catalogById: Map<string, KeyboardComponent>;
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
      className="rounded-3xl border border-[#c2c7cf] bg-white p-5 shadow-sm"
      id="saved-builds-gallery"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#00639d]">
            Local gallery
          </p>
          <h2 className="mt-1 text-base font-bold text-[#071e29]">
            Saved builds
          </h2>
          <p className="mt-1 text-sm text-[#42474e]">
            Saved in this browser for local prototype review.
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#c2c7cf] bg-white px-3 text-sm font-semibold text-[#42474e] transition hover:bg-[#e9f5ff] disabled:cursor-not-allowed disabled:opacity-50"
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
        <p className="mt-4 rounded-2xl border border-[#c2c7cf] bg-[#f5faff] px-3 py-2 text-sm text-[#42474e]">
          Loading saved builds...
        </p>
      ) : null}

      {savedBuildsLoaded && savedBuilds.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-[#c2c7cf] bg-[#f5faff] px-3 py-4 text-sm text-[#42474e]">
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
  onDelete,
  onLoad,
  savedBuild,
}: {
  catalogById: Map<string, KeyboardComponent>;
  onDelete: (savedBuildId: string) => void;
  onLoad: (savedBuild: SavedBuild) => void;
  savedBuild: SavedBuild;
}) {
  const price =
    savedBuild.estimatedPrice !== null && savedBuild.estimatedPriceCurrency
      ? formatMoney(savedBuild.estimatedPrice, savedBuild.estimatedPriceCurrency)
      : "No estimate";

  return (
    <article className="rounded-2xl border border-[#c2c7cf] bg-[#f5faff] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#c2c7cf] bg-white px-2 py-1 text-xs font-semibold text-[#094067]">
              {savedBuild.validation.isValid ? "Compatible" : "Needs review"}
            </span>
            <span className="rounded-full border border-[#c2c7cf] bg-white px-2 py-1 text-xs font-semibold text-[#42474e]">
              Saved {savedBuild.source}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-bold leading-5 text-[#071e29]">
            {savedBuild.title}
          </h3>
          <p className="mt-1 text-xs text-[#42474e]">
            {new Date(savedBuild.createdAt).toLocaleString("en-MY", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#42474e]">
            Estimated total
          </p>
          <p className="mt-1 text-base font-bold text-[#071e29]">{price}</p>
        </div>
      </div>

      <dl className="mt-3 grid gap-2 border-y border-[#c2c7cf] py-3 sm:grid-cols-2">
        {componentCategories.map((category) => {
          const component = catalogById.get(savedBuild.componentIds[category]);

          return (
            <div key={category}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#42474e]">
                {categoryLabels[category]}
              </dt>
              <dd className="mt-1 text-sm text-[#071e29]">
                {component?.name ?? savedBuild.componentIds[category]}
              </dd>
              {component?.vendorUrl ? (
                <a
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#094067] hover:text-[#002a47] hover:underline"
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
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#094067] px-3 text-sm font-bold text-white transition hover:bg-[#002a47]"
          onClick={() => onLoad(savedBuild)}
          type="button"
        >
          <CopyPlus className="h-4 w-4" aria-hidden />
          Load build
        </button>
        <button
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#c2c7cf] bg-white px-3 text-sm font-semibold text-[#42474e] transition hover:bg-[#e9f5ff]"
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
    <div className="rounded-3xl border border-dashed border-[#c2c7cf] bg-white p-10 text-center shadow-sm">
      <PackageSearch className="mx-auto h-10 w-10 text-[#00639d]" aria-hidden />
      <h2 className="mt-4 text-lg font-bold text-[#071e29]">
        Ready for configuration
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#42474e]">
        Recommendations, component inspection, and manual validation appear here.
      </p>
    </div>
  );
}

function EmptyRecommendationState({ result }: { result: RecommendationResult }) {
  return (
    <div className="rounded-3xl border border-[#c2c7cf] bg-white p-6 text-sm text-[#071e29] shadow-sm">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <AlertCircle className="h-4 w-4 text-[#ba1a1a]" aria-hidden />
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
    sky: "border-[#c2c7cf] bg-[#ddf1ff] text-[#094067]",
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
