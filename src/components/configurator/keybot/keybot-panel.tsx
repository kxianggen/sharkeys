"use client";

import { useEffect, useRef, useState } from "react";
import { Cpu, Loader2, RotateCcw, Send, X } from "lucide-react";

import {
  buildKeybotRequestContext,
  createKeybotMessageId,
  getKeybotContextSummary,
  KEYBOT_WELCOME_MESSAGE,
  keybotQuickActions,
} from "@/components/configurator/keybot/keybot-helpers";
import {
  KeybotAvatar,
  KeybotLoadingState,
  KeybotMessageBubble,
} from "@/components/configurator/keybot/keybot-message";
import type {
  ApiErrorResponse,
  KeybotChatMessage,
  ManualSelection,
  RecommendationBuild,
  RecommendationResult,
} from "@/components/configurator/types";
import { track } from "@/lib/analytics";
import { isRateLimited, RATE_LIMIT_MESSAGE } from "@/lib/api/rate-limit";
import type { KeybotApiResponse } from "@/lib/keybot/schemas";
import type { KeyboardComponent } from "@/lib/types";

export type KeybotPanelProps = {
  catalogById: Map<string, KeyboardComponent>;
  floating?: boolean;
  manualSelection: ManualSelection;
  onClose?: () => void;
  result: RecommendationResult | null;
  selectedRecommendation: RecommendationBuild | null;
};

export function KeybotPanel({
  catalogById,
  floating = false,
  manualSelection,
  onClose,
  result,
  selectedRecommendation,
}: KeybotPanelProps) {
  const [messages, setMessages] = useState<KeybotChatMessage[]>([
    KEYBOT_WELCOME_MESSAGE,
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const contextSummary = getKeybotContextSummary({
    catalogById,
    manualSelection,
    selectedRecommendation,
  });
  // Onboarding only: the chips disappear for good once the conversation starts.
  const showSuggestions = messages.length <= 1 && !isSending;

  function clearConversation() {
    setMessages([KEYBOT_WELCOME_MESSAGE]);
    setError(null);
    setInput("");
  }

  useEffect(() => {
    if (!floating || !onClose) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [floating, onClose]);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({
        block: "end",
      });
    }
  }, [messages, isSending]);

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
    track("request_sent", { entry: "chat" });

    try {
      const response = await fetch("/api/keybot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
          context: buildKeybotRequestContext({
            history: messages,
            manualSelection,
            result,
            selectedRecommendation,
          }),
        }),
      });

      if (isRateLimited(response)) {
        // No source or route-failure flag, so the bubble carries no badge.
        setMessages((current) => [
          ...current,
          {
            id: createKeybotMessageId("assistant"),
            role: "assistant",
            content: RATE_LIMIT_MESSAGE,
          },
        ]);
        return;
      }

      const body = (await response.json()) as
        | KeybotApiResponse
        | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(
          "error" in body ? body.error.message : "Meg could not answer.",
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
          : "Meg could not answer right now.";

      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: createKeybotMessageId("assistant"),
          role: "assistant",
          content:
            "I could not reach Meg just now. The main configurator still uses deterministic validation.",
          isRouteFailure: true,
          source: "fallback_error",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section
      aria-label="Meg keyboard helper"
      className={
        floating
          ? "fixed inset-x-3 bottom-3 z-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[28rem] sm:max-w-[calc(100vw-3rem)]"
          : "w-full"
      }
    >
      <div
        className={`sharkeys-soft-shadow flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[28px] border border-border bg-surface ${
          floating ? "sm:h-[640px]" : ""
        }`}
      >
        <header className="flex items-center gap-2.5 border-b-[0.5px] border-border bg-surface px-4 py-3">
          <KeybotAvatar small />
          <h2 className="min-w-0 flex-1 text-sm font-semibold text-primary">
            Meg
          </h2>
          <button
            aria-label="Clear conversation"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-xs text-secondary transition hover:bg-surface-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            onClick={clearConversation}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
          {onClose ? (
            <button
              aria-label="Close Meg assistant"
              className="flex h-8 w-8 flex-none items-center justify-center rounded-xs text-secondary transition hover:bg-surface-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </header>

        <div
          aria-live="polite"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-surface-secondary px-4 py-4"
        >
          {contextSummary ? (
            <div className="rounded-md border-[0.5px] border-border bg-surface p-3">
              <p className="inline-flex items-center gap-1.5 text-caption text-secondary">
                <Cpu className="h-3.5 w-3.5" aria-hidden />
                Active build context
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-primary">
                {contextSummary.title}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {contextSummary.parts.map((part) => (
                  <span
                    className="rounded-pill border-[0.5px] border-border bg-surface-secondary px-2.5 py-1 text-caption text-secondary"
                    key={part}
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => (
            <KeybotMessageBubble
              catalogById={catalogById}
              disabled={isSending}
              key={message.id}
              message={message}
              onSuggestion={(suggestion) => void sendKeybotMessage(suggestion)}
            />
          ))}

          {showSuggestions ? (
            <div className="flex flex-wrap gap-2">
              {keybotQuickActions.map((action) => (
                <button
                  className="inline-flex items-center rounded-pill border-[0.5px] border-border bg-surface px-3 py-2 text-caption text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSending}
                  key={action.label}
                  onClick={() => void sendKeybotMessage(action.message)}
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}

          {isSending ? <KeybotLoadingState /> : null}
          <div ref={messagesEndRef} />
        </div>

        {error ? (
          <p className="border-t-[0.5px] border-border bg-surface px-4 py-3 text-caption text-error">
            {error}
          </p>
        ) : null}

        <form
          className="border-t-[0.5px] border-border bg-surface p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendKeybotMessage(input);
          }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-secondary p-1.5 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20">
            <input
              aria-label="Meg question"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-primary placeholder:text-secondary/70 focus:outline-none"
              disabled={isSending}
              onChange={(event) => setInput(event.target.value)}
              placeholder={isSending ? "Thinking..." : "Ask about switches, sound..."}
              value={input}
            />
            <button
              aria-label="Send Meg question"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent text-on-accent transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isSending || input.trim().length === 0}
              type="submit"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
