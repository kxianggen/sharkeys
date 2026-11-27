"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BookmarkPlus,
  Check,
  ChevronLeft,
  Columns3,
  ChevronRight,
  Keyboard,
} from "lucide-react";

import { BuilderPickTag, isBuilderPick } from "@/components/builder-pick-tag";
import {
  clampPartName,
  coreKeycapName,
  coreSwitchName,
  formatEstimatedTotal,
  formatLayoutChip,
  getKitDisplayName,
  getMetadataString,
} from "@/components/configurator/build-helpers";
import type { CompareControls } from "@/components/configurator/use-compare";
import {
  RefineChips,
  type RefineControls,
} from "@/components/configurator/refine-chips";
import type { RecommendationBuild } from "@/components/configurator/types";
import { getComponentSwatch } from "@/components/part-thumbnail";
import { SwatchDots } from "@/components/swatch-dots";
// Deep import, not the "@/lib/components" barrel: that barrel re-exports
// catalog-source, which pulls the server-side Supabase client into this client
// component. colour.ts is pure (zod + types).
import { getComponentColours } from "@/lib/components/colour";

// One recommendation at a time: full-width card with arrow controls, so the
// short kit name, price, and tags all fit without truncation. Cards remain
// rule-engine-validated builds; selecting one never bypasses the engine.
// Tick a build into (or out of) the compare table. Disabled once three are
// picked, unless this build is one of them.
function CompareToggle({
  build,
  controls,
}: {
  build: RecommendationBuild;
  controls: CompareControls;
}) {
  const checked = controls.isCompared(build);

  return (
    <button
      aria-pressed={checked}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border-[0.5px] px-3 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-45 ${
        checked
          ? "border-accent bg-accent-subtle text-primary"
          : "border-border bg-surface text-secondary hover:border-border-strong hover:text-primary"
      }`}
      disabled={!checked && controls.isFull}
      onClick={() => controls.onToggle(build)}
      title={!checked && controls.isFull ? "Compare up to 3 builds" : undefined}
      type="button"
    >
      {checked ? (
        <Check className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Columns3 className="h-3.5 w-3.5" aria-hidden />
      )}
      Compare
    </button>
  );
}

export function RecommendationCarousel({
  compare,
  onSaveRecommendation,
  onSelect,
  recommendations,
  refine,
  selectedId,
}: {
  compare?: CompareControls;
  onSaveRecommendation: (recommendation: RecommendationBuild) => void;
  onSelect: (recommendation: RecommendationBuild) => void;
  recommendations: RecommendationBuild[];
  refine?: RefineControls;
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
  // UAT finding 4 (and the tail of finding 1): the swatch dots show hex, which
  // is the palette but not its NAME. After the colourway work the build carries
  // semantic colour tags, so the card can say what colour it actually is —
  // which is what the tester asked for in the first place. Case and keycap
  // colours are merged because a board's colour identity is both.
  const buildColours = [
    ...new Set([
      ...getComponentColours(recommendation.components.keycap),
      ...getComponentColours(recommendation.components.case),
    ]),
  ];
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
                {buildColours.length > 0 ? (
                  <span
                    className="flex-none capitalize text-secondary"
                    data-testid="build-colour-summary"
                  >
                    {buildColours.join(", ")}
                  </span>
                ) : null}
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
          {compare ? (
            <CompareToggle build={recommendation} controls={compare} />
          ) : null}
        </div>
      </article>

      {refine ? <RefineChips build={recommendation} controls={refine} /> : null}
    </section>
  );
}

export function CarouselKitThumbnail({ kitId }: { kitId: string | null }) {
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
