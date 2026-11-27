"use client";

import Image from "next/image";
import { AlertCircle, ShieldCheck } from "lucide-react";

import {
  getKeybotTrustLabel,
  isKeybotBlockerMessage,
  keybotBlockerActions,
  splitKeybotParagraphs,
} from "@/components/configurator/keybot/keybot-helpers";
import type { KeybotChatMessage } from "@/components/configurator/types";
import { useKeybotThinkingStage } from "@/components/use-keybot-thinking-stage";
import type { KeyboardComponent } from "@/lib/types";

export function KeybotAvatar({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative flex flex-none items-center justify-center ${
        small ? "h-9 w-9" : "h-12 w-12"
      }`}
    >
      <Image
        alt="Meg"
        className="h-full w-full rounded-full object-cover"
        height={48}
        src="/meg-avatar.png"
        width={48}
      />
    </span>
  );
}

export function KeybotMessageBubble({
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

export function KeybotLoadingState() {
  // Only mounted while a reply is pending, so the stage timer is always active.
  const label = useKeybotThinkingStage(true);

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
