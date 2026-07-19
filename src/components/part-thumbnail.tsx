"use client";

import Image from "next/image";
import { useState } from "react";
import { Keyboard } from "lucide-react";

import { SwatchDots } from "@/components/swatch-dots";
import type { ComponentCategory, KeyboardComponent } from "@/lib/types";

// Extracted from recommendation-demo.tsx so the hero demo panel can share it
// without importing the whole configurator (which would be a circular import:
// the landing surface renders the hero panel). Behavior is unchanged.

// Interim keycap visual: the set's real 3-colour palette stored as
// metadata.swatch on the catalog record. No colours are generated or
// invented at runtime — no swatch data, no swatch.
export function getComponentSwatch(component: KeyboardComponent | undefined) {
  const value = component?.metadata?.swatch;

  return Array.isArray(value) &&
    value.every((entry): entry is string => typeof entry === "string")
    ? value
    : undefined;
}

// Per-category zoom for the "Your build" thumbnails. Part photos ship on a
// 4:3 canvas with wide transparent margins, and the subjects are framed
// differently (switches sit small; stabilizer wires are sparse), so each is
// zoomed to bring the product to ~82% of the square thumbnail. Values are
// measured against the real assets' non-transparent bounding boxes and stay
// below each category's clip ceiling in this square frame (switch 4.06,
// keycap 1.97, stab 2.39), so only transparent canvas is ever cropped.
// Written as literal strings so the Tailwind JIT can see them.
const THUMB_ZOOM_CLASS: Partial<Record<ComponentCategory, string>> = {
  switch: "scale-[3.4]",
  keycap: "scale-[1.65]",
  stabilizer: "scale-[1.95]",
};

// Small square thumbnail for one selected part. Resolves the real part photo
// at public/parts/<componentId>.webp. When the photo loads it is shown
// enlarged and alone — the photo conveys the colours. Only when no photo
// exists does the fallback kick in: a keycap with a real metadata.swatch
// palette shows its SwatchDots (honest colour identity), any other part shows
// a neutral glyph. Photo and dots are never doubled up.
export function PartThumbnail({ component }: { component: KeyboardComponent }) {
  const [imageFailed, setImageFailed] = useState(false);
  // Reset the load-error fallback whenever the selected part changes. Without
  // this, selecting a no-photo part (glyph fallback) first would leave
  // imageFailed=true, so a subsequently-selected part with a real photo would
  // keep showing the stale glyph instead of its image. React's render-phase
  // "adjust state on prop change" pattern — no effect, resets before paint.
  const [renderedId, setRenderedId] = useState(component.id);
  if (renderedId !== component.id) {
    setRenderedId(component.id);
    setImageFailed(false);
  }
  const swatch =
    component.category === "keycap" ? getComponentSwatch(component) : undefined;
  const zoomClassName = THUMB_ZOOM_CLASS[component.category] ?? "";

  return (
    <span className="relative flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-lg bg-surface-secondary">
      {imageFailed ? (
        swatch ? (
          <SwatchDots colors={swatch} />
        ) : (
          <Keyboard className="h-5 w-5 text-secondary/50" aria-hidden />
        )
      ) : (
        <Image
          alt=""
          aria-hidden
          className={`h-full w-full object-contain ${zoomClassName}`}
          height={44}
          onError={() => setImageFailed(true)}
          src={`/parts/${component.id}.webp`}
          width={44}
        />
      )}
    </span>
  );
}
