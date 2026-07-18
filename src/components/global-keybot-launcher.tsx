"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Send, X } from "lucide-react";

import type { KeybotApiResponse } from "@/lib/keybot/schemas";
import { useKeybotThinkingStage } from "@/components/use-keybot-thinking-stage";

type ApiErrorResponse = {
  success: false;
  error: {
    message: string;
  };
};

type FloatingMessage = {
  content: string;
  id: string;
  role: "assistant" | "user";
  source?: string;
};

const routeHasLocalKeybot = ["/", "/configurator", "/my-builds"] as const;

const WELCOME_MESSAGE: FloatingMessage = {
  id: "global-keybot-welcome",
  role: "assistant",
  content:
    "Hi! I'm Meg. I can design the perfect mechanical keyboard based on your vibe, budget, or layout. What are you looking for?",
};

const SUGGESTED_QUERIES = [
  "Quiet office board under RM500",
  "Loud clicky gaming setup",
  "Deep creamy thock",
] as const;

export function GlobalKeybotLauncher() {
  const pathname = usePathname();
  const hidden = routeHasLocalKeybot.some((route) =>
    route === "/" ? pathname === route : pathname?.startsWith(route),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<FloatingMessage[]>([WELCOME_MESSAGE]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const thinkingLabel = useKeybotThinkingStage(isSending);

  useEffect(() => {
    if (hidden) {
      const timeoutId = window.setTimeout(() => setIsOpen(false), 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [hidden]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages, isSending]);

  if (hidden) {
    return null;
  }

  async function sendMessage(message: string) {
    const trimmed = message.trim();

    if (!trimmed || isSending) {
      return;
    }

    const userMessage: FloatingMessage = {
      id: createMessageId("user"),
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/keybot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          context: {
            recentMessages: messages.slice(-6).map((item) => ({
              role: item.role,
              content: item.content.slice(0, 1200),
            })),
          },
        }),
      });
      const body = (await response.json()) as KeybotApiResponse | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(
          "error" in body ? body.error.message : "Meg could not answer.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId("assistant"),
          role: "assistant",
          content: body.data.answer,
          source: body.data.source,
        },
      ]);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Meg could not answer right now.",
      );
      setMessages((current) => [
        ...current,
        {
          id: createMessageId("assistant"),
          role: "assistant",
          content:
            "I could not reach Meg just now. The main configurator still uses deterministic validation.",
          source: "fallback_error",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function clearConversation() {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    setInput("");
  }

  if (!isOpen) {
    return (
      <button
        aria-label="Open Meg assistant"
        className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border-[0.5px] border-border bg-surface shadow-[var(--shadow-overlay)] outline-none transition duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-accent/30 sm:bottom-6 sm:right-6"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Image
          alt=""
          className="h-full w-full rounded-full object-cover"
          height={56}
          src="/meg-avatar.png"
          width={56}
        />
      </button>
    );
  }

  const showSuggestions = messages.length <= 1 && !isSending;

  return (
    <section
      aria-label="Meg keyboard assistant"
      className="fixed inset-x-3 bottom-3 z-50 origin-bottom-right motion-safe:[animation:meg-pop_0.3s_cubic-bezier(0.22,1,0.36,1)_both] sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[28rem] sm:max-w-[calc(100vw-3rem)]"
    >
      {/* Scoped entrance keyframe — keeps the file self-contained (Tailwind v4, no animate plugin). */}
      <style>{
        "@keyframes meg-pop{from{opacity:0;transform:translateY(16px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}"
      }</style>
      <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-lg border-[0.5px] border-border bg-surface shadow-[var(--shadow-overlay)] sm:h-[600px]">
        <header className="flex items-center gap-3 border-b-[0.5px] border-border bg-surface px-5 py-4">
          <span
            aria-hidden
            className="flex h-9 w-9 flex-none items-center justify-center"
          >
            <Image
              alt="Meg"
              className="h-full w-full rounded-full object-cover"
              height={36}
              src="/meg-avatar.png"
              width={36}
            />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-primary">Ask Meg</h2>
          </div>
          <button
            aria-label="Clear conversation"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-xs text-secondary transition hover:bg-surface-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            onClick={clearConversation}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
          <button
            aria-label="Close Meg assistant"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-xs text-secondary transition hover:bg-surface-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div
          aria-live="polite"
          className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-surface-secondary px-5 py-5"
        >
          {messages.map((message) => (
            <div
              className={`flex items-start gap-2.5 ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
              key={message.id}
            >
              {message.role === "assistant" ? (
                <span
                  aria-hidden
                  className="flex h-7 w-7 flex-none items-center justify-center"
                >
                  <Image
                    alt="Meg"
                    className="h-full w-full rounded-full object-cover"
                    height={28}
                    src="/meg-avatar.png"
                    width={28}
                  />
                </span>
              ) : null}
              <div
                className={`max-w-[82%] rounded-md px-4 py-3 text-sm leading-6 text-primary ${
                  message.role === "assistant"
                    ? "border-[0.5px] border-border bg-surface"
                    : "bg-accent-subtle"
                }`}
              >
                {message.content}
                {message.role === "assistant" &&
                (message.source === "fallback_missing_api_key" ||
                  message.source === "fallback_error") ? (
                  <p className="mt-2 text-caption text-secondary">
                    Using local grounded fallback
                  </p>
                ) : null}
              </div>
            </div>
          ))}

          {showSuggestions ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTED_QUERIES.map((query) => (
                <button
                  className="rounded-pill border-[0.5px] border-border bg-surface px-3.5 py-2 text-caption text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                  key={query}
                  onClick={() => {
                    setInput(query);
                    void sendMessage(query);
                  }}
                  type="button"
                >
                  {query}
                </button>
              ))}
            </div>
          ) : null}

          {isSending ? (
            <div className="flex items-start gap-2.5">
              <span
                aria-hidden
                className="flex h-7 w-7 flex-none items-center justify-center"
              >
                <Image
                  alt="Meg"
                  className="h-full w-full rounded-full object-cover"
                  height={28}
                  src="/meg-avatar.png"
                  width={28}
                />
              </span>
              <div className="inline-flex items-center gap-2 rounded-md border-[0.5px] border-border bg-surface px-4 py-3 text-sm leading-6 text-secondary">
                <span className="flex items-center gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted motion-safe:animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted motion-safe:animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted motion-safe:animate-bounce" />
                </span>
                {thinkingLabel}
              </div>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>

        {error ? (
          <p className="border-t-[0.5px] border-border bg-surface px-5 py-3 text-caption text-error">
            {error}
          </p>
        ) : null}

        <form
          className="border-t-[0.5px] border-border bg-surface p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          <div className="flex items-center gap-2 rounded-pill border-[0.5px] border-border bg-surface p-1.5 transition focus-within:border-accent">
            <input
              aria-label="Ask Meg a question"
              className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-sm text-primary placeholder:text-secondary focus:outline-none disabled:cursor-not-allowed"
              disabled={isSending}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                isSending ? "Meg is pondering..." : "Describe your dream board..."
              }
              value={input}
            />
            <button
              aria-label="Send message to Meg"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent text-on-accent transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isSending || input.trim().length === 0}
              type="submit"
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function createMessageId(prefix: "assistant" | "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
