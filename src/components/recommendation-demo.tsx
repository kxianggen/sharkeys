"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { RecommendationsApiResponse } from "@/lib/recommendations/schemas";

type RecommendationResult = RecommendationsApiResponse["data"];
type RecommendationBuild = RecommendationResult["recommendations"][number];
type ComponentCategory = keyof RecommendationResult["candidateComponentIds"];

type ApiErrorResponse = {
  success: false;
  error: {
    message: string;
  };
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

const subscribeToHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function RecommendationDemo() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmitDisabled =
    !hasHydrated || isSubmitting || message.trim().length === 0;

  const intentRows = useMemo(() => {
    if (!result) {
      return [];
    }

    const { intent } = result;

    return [
      ["Layout", intent.layout ?? "Unspecified"],
      ["Sound", intent.soundProfile ?? "Unspecified"],
      ["Switch", intent.switchTechnology ?? "Unspecified"],
      ["Use case", intent.useCase],
      [
        "Budget",
        intent.budget?.amount
          ? `${intent.budget.amount} ${intent.budget.currency ?? ""}`.trim()
          : intent.budget?.label ?? "Unspecified",
      ],
      [
        "Beginner",
        intent.beginnerFriendly === null
          ? "Unspecified"
          : intent.beginnerFriendly
            ? "Yes"
            : "No",
      ],
      [
        "Priorities",
        intent.priorities.length > 0 ? intent.priorities.join(", ") : "None",
      ],
      [
        "Constraints",
        intent.constraints.length > 0 ? intent.constraints.join(", ") : "None",
      ],
    ];
  }, [result]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
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
    } catch (caughtError) {
      setResult(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Recommendation request failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                Request a build
              </h2>
              <p className="text-sm text-zinc-500">
                Intent extraction plus validated recommendations
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
            className="min-h-36 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            id="keyboard-request"
            maxLength={2000}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Creamy 65% beginner build under 250 USD"
            value={message}
          />

          <button
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={isSubmitDisabled}
            type="submit"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden />
            )}
            Validate recommendations
          </button>

          {error ? (
            <div className="mt-4 flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
              <p>{error}</p>
            </div>
          ) : null}
        </form>

        <div className="space-y-4">
          {!result ? (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600">
              Results will appear here after validation.
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-zinc-950">
                    Extracted intent
                  </h2>
                  <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600">
                    {result.source.replaceAll("_", " ")}
                  </span>
                </div>
                {result.source === "fallback_missing_api_key" ? (
                  <div className="mb-4 flex gap-2 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
                    <Info className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
                    <p>
                      OpenAI key is not configured, so this demo is using local
                      keyword extraction.
                    </p>
                  </div>
                ) : null}
                <dl className="grid gap-3 sm:grid-cols-2">
                  {intentRows.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium uppercase tracking-normal text-zinc-500">
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm text-zinc-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {result.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {result.recommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
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
                    <p className="mt-3 font-medium">
                      {result.clarificationPrompt}
                    </p>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function RecommendationCard({
  recommendation,
}: {
  recommendation: RecommendationBuild;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">
            {recommendation.title}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {recommendation.estimatedPrice === null
              ? "Price estimate unavailable"
              : `Estimated ${recommendation.estimatedPrice} USD`}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          Validated
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {componentCategories.map((category) => {
          const component = recommendation.components[category];

          return (
            <div
              className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
              key={category}
            >
              <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">
                {categoryLabels[category]}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-950">
                {component.name}
              </p>
              <p className="text-xs text-zinc-500">{component.brand}</p>
            </div>
          );
        })}
      </div>

      {recommendation.warnings.length > 0 ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {recommendation.warnings.map((warning) => (
            <p key={`${warning.code}-${warning.message}`}>{warning.message}</p>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-600">
          No compatibility warnings from the rule engine.
        </p>
      )}
    </article>
  );
}
