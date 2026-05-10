"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookmarkPlus,
  CheckCircle2,
  CopyPlus,
  ExternalLink,
  Info,
  Keyboard,
  Layers3,
  Loader2,
  PackageSearch,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";

import type { CompatibilityResult, KeyboardComponent } from "@/lib/types";
import type { RecommendationsApiResponse } from "@/lib/recommendations/schemas";

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
  "beginner friendly creamy 65% keyboard under RM500",
  "quiet office keyboard under RM800",
  "optical 60% build with clacky sound",
  "thocky TKL typing keyboard",
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
    <section className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <div className="space-y-4">
          <form
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50 text-emerald-700">
                <Sparkles className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-950">
                  Build request
                </h2>
                <p className="text-sm text-zinc-500">
                  Grounded catalog search with rule validation
                </p>
              </div>
            </div>

            <label
              className="mb-2 block text-sm font-medium text-zinc-700"
              htmlFor="keyboard-request"
            >
              Keyboard request
            </label>
            <textarea
              className="min-h-32 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              id="keyboard-request"
              maxLength={2000}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Creamy 65% beginner build under RM500"
              value={message}
            />

            <button
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              disabled={isSubmitDisabled}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="h-4 w-4" aria-hidden />
              )}
              Find validated builds
            </button>

            <div className="mt-4 grid gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={hasMounted && isSubmitting}
                  key={prompt}
                  onClick={() => void handleQuickPrompt(prompt)}
                  type="button"
                >
                  <span>{prompt}</span>
                  <ArrowRight className="h-3.5 w-3.5 flex-none" aria-hidden />
                </button>
              ))}
            </div>

            {error ? (
              <Notice
                className="mt-4"
                icon={AlertCircle}
                message={error}
                tone="red"
              />
            ) : null}
          </form>

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
        </div>

        <div className="space-y-4">
          <WorkspaceHeader result={result} selected={selectedRecommendation} />

          {result?.source === "fallback_missing_api_key" ? (
            <Notice
              icon={Info}
              message="OpenAI key is not configured, so this demo is using local keyword extraction."
              tone="sky"
            />
          ) : null}

          {result && result.recommendations.length === 0 ? (
            <EmptyRecommendationState result={result} />
          ) : null}

          {result && result.recommendations.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
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
      </div>
    </section>
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
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
            Sharkeys Configurator
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-zinc-950">
            Validated keyboard workspace
          </h1>
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
    <div className="min-w-28 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-normal text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function IntentPanel({ result }: { result: RecommendationResult | null }) {
  if (!result) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-950">Intent</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
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
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-zinc-950">Intent</h2>
        <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">
          {result.source.replaceAll("_", " ")}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] font-medium uppercase tracking-normal text-zinc-500">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-900">{value}</dd>
          </div>
        ))}
      </dl>
      {result.criteria.maxPrice ? (
        <p className="mt-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
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
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Layers3 className="h-4 w-4 text-zinc-500" aria-hidden />
        <h2 className="text-sm font-semibold text-zinc-950">Compare builds</h2>
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
              className={`w-full rounded-md border p-3 text-left transition ${
                selected
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
              }`}
              key={recommendation.id}
              onClick={() => onSelect(recommendation)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
                    Build {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-zinc-950">
                    {recommendation.components.case.name}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-xs font-medium text-emerald-700">
                  Valid
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-zinc-800">{price}</p>
              <p className="mt-1 text-xs text-zinc-500">
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
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Rule-engine validated
            </div>
            <h2 className="text-xl font-semibold tracking-normal text-zinc-950">
              {recommendation.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              {recommendation.explanations[0]}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
              Estimated total
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-950">
              {recommendation.estimatedPrice === null
                ? "Unavailable"
                : formatMoney(
                    recommendation.estimatedPrice,
                    recommendation.estimatedPriceCurrency ?? "MYR",
                  )}
            </p>
            <button
              className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-medium text-white transition hover:bg-zinc-800"
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
        <div className="border-b border-zinc-200 p-4 lg:border-b-0 lg:border-r">
          <KeyboardPreview layout={layout} />

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {componentCategories.map((category) => {
              const component = recommendation.components[category];
              const active = category === activeCategory;

              return (
                <button
                  className={`rounded-md border p-3 text-left transition ${
                    active
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-white"
                  }`}
                  key={category}
                  onClick={() => onActiveCategoryChange(category)}
                  type="button"
                >
                  <p className="text-[11px] font-medium uppercase tracking-normal text-zinc-500">
                    {categoryLabels[category]}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-950">
                    {component.name}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{component.brand}</p>
                  <p className="mt-2 text-xs leading-4 text-zinc-500">
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
    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Layout canvas</p>
          <p className="text-xs text-zinc-400">{layout ?? "auto"} layout preview</p>
        </div>
        <Keyboard className="h-5 w-5 text-zinc-400" aria-hidden />
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
                className="flex h-8 min-w-0 items-center justify-center rounded-[4px] border border-zinc-600 bg-zinc-700 px-1 text-[11px] font-medium text-zinc-100 shadow-sm"
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
        <p className="text-sm text-zinc-600">No component selected.</p>
      </div>
    );
  }

  const sourceVendor = getMetadataString(component.metadata, "sourceVendor");
  const sourceType = getMetadataString(component.metadata, "sourceType");
  const sourceNote = getMetadataString(component.metadata, "sourceNote");
  const layouts = getComponentLayouts(component);

  return (
    <aside className="p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
        {categoryLabels[category]}
      </p>
      <h3 className="mt-1 text-base font-semibold leading-6 text-zinc-950">
        {component.name}
      </h3>
      <p className="mt-1 text-sm text-zinc-500">{component.brand}</p>
      <p className="mt-4 text-sm leading-6 text-zinc-700">
        {component.description}
      </p>

      <dl className="mt-4 grid gap-3 border-y border-zinc-200 py-4">
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
        <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
          Source
        </p>
        <p className="text-sm font-medium text-zinc-900">
          {sourceVendor ?? "Vendor metadata unavailable"}
        </p>
        {sourceType ? (
          <p className="text-xs text-zinc-500">{sourceType.replaceAll("_", " ")}</p>
        ) : null}
        {sourceNote ? <p className="text-xs leading-5 text-zinc-500">{sourceNote}</p> : null}
        {component.vendorUrl ? (
          <a
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
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
      <dt className="text-[11px] font-medium uppercase tracking-normal text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-zinc-900">{value}</dd>
    </div>
  );
}

function CompatibilityPanel({
  recommendation,
}: {
  recommendation: RecommendationBuild;
}) {
  return (
    <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-emerald-700" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-zinc-950">
            Compatibility status
          </p>
          <p className="mt-1 text-sm text-zinc-600">
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
        <p className="mt-3 rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-800">
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
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-zinc-500" aria-hidden />
        <h2 className="text-sm font-semibold text-zinc-950">Manual build check</h2>
      </div>

      {catalogError ? (
        <Notice icon={AlertCircle} message={catalogError} tone="red" />
      ) : null}

      <div className="grid gap-3">
        {componentCategories.map((category) => (
          <label className="block" key={category}>
            <span className="mb-1 flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-normal text-zinc-500">
              {categoryLabels[category]}
            </span>
            <select
              className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-zinc-100"
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
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
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
          className={`mt-3 rounded-md border p-3 text-sm ${
            manualValidation.isValid
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
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
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-medium text-white transition hover:bg-emerald-800"
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
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
            Local gallery
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-950">
            Saved builds
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Saved in this browser for local prototype review.
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={savedBuilds.length === 0}
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
        <p className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          Loading saved builds...
        </p>
      ) : null}

      {savedBuildsLoaded && savedBuilds.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-sm text-zinc-600">
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
    <article className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-xs font-medium text-emerald-700">
              {savedBuild.validation.isValid ? "Compatible" : "Needs review"}
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600">
              Saved {savedBuild.source}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-semibold leading-5 text-zinc-950">
            {savedBuild.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {new Date(savedBuild.createdAt).toLocaleString("en-MY", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
            Estimated total
          </p>
          <p className="mt-1 text-base font-semibold text-zinc-950">{price}</p>
        </div>
      </div>

      <dl className="mt-3 grid gap-2 border-y border-zinc-200 py-3 sm:grid-cols-2">
        {componentCategories.map((category) => {
          const component = catalogById.get(savedBuild.componentIds[category]);

          return (
            <div key={category}>
              <dt className="text-[11px] font-medium uppercase tracking-normal text-zinc-500">
                {categoryLabels[category]}
              </dt>
              <dd className="mt-1 text-sm text-zinc-900">
                {component?.name ?? savedBuild.componentIds[category]}
              </dd>
              {component?.vendorUrl ? (
                <a
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
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
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          onClick={() => onLoad(savedBuild)}
          type="button"
        >
          <CopyPlus className="h-4 w-4" aria-hidden />
          Load build
        </button>
        <button
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
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
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
      <PackageSearch className="mx-auto h-9 w-9 text-zinc-400" aria-hidden />
      <h2 className="mt-3 text-base font-semibold text-zinc-950">
        Ready for configuration
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
        Recommendations, component inspection, and manual validation appear here.
      </p>
    </div>
  );
}

function EmptyRecommendationState({ result }: { result: RecommendationResult }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <AlertCircle className="h-4 w-4" aria-hidden />
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
    sky: "border-sky-200 bg-sky-50 text-sky-900",
  };

  return (
    <div
      className={`flex gap-2 rounded-md border p-3 text-sm ${toneClasses[tone]} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
