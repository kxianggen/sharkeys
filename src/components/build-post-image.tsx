"use client";

import Image from "next/image";
import { useState } from "react";

import { KitImage } from "@/components/kit-image";
import { resolvePostImage } from "@/lib/gallery/post-image";

/**
 * Gallery card / post-detail hero. Shows the author's uploaded photo when
 * `imageUrl` is present; otherwise (or if that image fails to load) falls back
 * to the kit hero image exactly as before. Additive over {@link KitImage}.
 */
export function BuildPostImage({
  alt,
  imageUrl,
  kitId,
}: {
  alt: string;
  imageUrl: string | null;
  kitId: string | null;
}) {
  const [uploadedFailed, setUploadedFailed] = useState(false);
  const resolved = resolvePostImage(imageUrl, kitId);

  if (resolved.kind === "kit" || uploadedFailed) {
    return <KitImage alt={alt} kitId={kitId} />;
  }

  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-surface">
      <Image
        alt={alt}
        className="h-full w-full object-cover"
        height={240}
        onError={() => setUploadedFailed(true)}
        src={resolved.src}
        width={320}
      />
    </div>
  );
}
