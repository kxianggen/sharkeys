"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  KeybotPanel,
  type KeybotPanelProps,
} from "@/components/configurator/keybot/keybot-panel";

export function FloatingKeybot({
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
