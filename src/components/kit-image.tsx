"use client";

import Image from "next/image";
import { useState } from "react";
import { Keyboard } from "lucide-react";

/**
 * Kit hero image for gallery cards and post details. Follows the Browse
 * convention: kits resolve to /kits/<kitId>.webp; a missing asset (or missing
 * kit) falls back to an honest placeholder glyph on surface — never a fake
 * product shot. Kit art ships on a 4:3 canvas with wide transparent margins,
 * so the image is zoomed (~1.55×, matching Browse) to fill its tile.
 */
export function KitImage({ alt, kitId }: { alt: string; kitId: string | null }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!kitId || imageFailed) {
    return (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-surface"
        data-testid="kit-image-placeholder"
      >
        <Keyboard className="h-14 w-14 text-secondary/40" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-surface">
      <Image
        alt={alt}
        className="h-full w-full scale-[1.55] object-contain"
        height={240}
        onError={() => setImageFailed(true)}
        src={`/kits/${kitId}.webp`}
        width={320}
      />
    </div>
  );
}
