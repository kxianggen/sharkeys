"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { track } from "@/lib/analytics";
import { buildSharePath } from "@/lib/recommendations/build-code";
import type { RecommendationComponentIds } from "@/lib/recommendations/schemas";

// Phones get the system share sheet (WhatsApp, Instagram, ...); everywhere
// else the link is copied. The link itself is the build: nothing is saved.
export function ShareButton({
  className = "",
  componentIds,
  label = "Share",
  title,
}: {
  className?: string;
  componentIds: RecommendationComponentIds;
  label?: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${buildSharePath(componentIds)}`;
    const isTouch = window.matchMedia?.("(pointer: coarse)").matches ?? false;

    if (isTouch && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        track("build_shared", { channel: "native" });
      } catch {
        // Closing the share sheet is not an error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      track("build_shared", { channel: "link" });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: fall back to showing the link so it can be copied.
      window.prompt("Copy this link", url);
    }
  }

  return (
    <button
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border-[0.5px] border-border bg-surface px-3 text-xs font-semibold text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus:ring-4 focus:ring-accent/20 ${className}`}
      onClick={() => void share()}
      title={`Share a link to ${title}`}
      type="button"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Share2 className="h-3.5 w-3.5" aria-hidden />
      )}
      <span aria-live="polite">{copied ? "Link copied" : label}</span>
    </button>
  );
}
