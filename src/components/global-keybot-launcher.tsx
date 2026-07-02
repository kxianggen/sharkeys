"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Send, Sparkles, X } from "lucide-react";

import type { KeybotApiResponse } from "@/lib/keybot/schemas";

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
        className="group fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-xl outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-accent/40 sm:bottom-6 sm:right-6"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        {/* Living, pulsing halo */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-accent/40 motion-safe:animate-ping"
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20"
        />
        <Sparkles className="relative h-6 w-6 transition-transform duration-300 group-hover:scale-110" aria-hidden />
        <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-accent bg-accent" />
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
      <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/85 shadow-2xl backdrop-blur-2xl sm:h-[600px]">
        {/* Deep Navy Mac-style header */}
        <header className="flex items-center gap-3 bg-accent px-4 py-4 text-white">
          <span
            aria-hidden
            className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20"
          >
            <Image
              alt="Meg"
              className="h-full w-full rounded-2xl object-cover"
              height={44}
              src="/meg-avatar.png"
              width={44}
            />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold leading-5 tracking-tight">
              Ask Meg
            </h2>
            <p className="flex items-center gap-1.5 text-xs font-medium text-on-accent/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7CE7AC]" />
              Grounded Assistant
            </p>
          </div>
          <button
            aria-label="Clear conversation"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
            onClick={clearConversation}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
          <button
            aria-label="Close Meg assistant"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div
          aria-live="polite"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-surface-secondary to-white px-4 py-4"
        >
          {messages.map((message) => (
            <div
              className={`flex items-end gap-2 ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
              key={message.id}
            >
              {message.role === "assistant" ? (
                <span
                  aria-hidden
                  className="mb-1 flex h-7 w-7 flex-none items-center justify-center overflow-hidden rounded-full bg-accent text-white shadow-sm"
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
                className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm transition ${
                  message.role === "assistant"
                    ? "rounded-bl-md bg-white text-primary ring-1 ring-accent/5"
                    : "rounded-br-md bg-accent-subtle text-primary"
                }`}
              >
                {message.content}
                {message.role === "assistant" && message.source ? (
                  <div className="mt-3 border-t border-accent/10 pt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-secondary">
                    {message.source === "fallback_missing_api_key" ||
                    message.source === "fallback_error"
                      ? "Using local grounded fallback"
                      : "Catalog verified"}
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {showSuggestions ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTED_QUERIES.map((query) => (
                <button
                  className="rounded-full border border-accent/15 bg-white px-3.5 py-2 text-xs font-medium tracking-tight text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent-subtle focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
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
            <div className="flex items-end gap-2">
              <span
                aria-hidden
                className="mb-1 flex h-7 w-7 flex-none items-center justify-center overflow-hidden rounded-full bg-accent text-white shadow-sm"
              >
                <Image
                  alt="Meg"
                  className="h-full w-full rounded-full object-cover"
                  height={28}
                  src="/meg-avatar.png"
                  width={28}
                />
              </span>
              <div className="inline-flex items-center gap-2 rounded-3xl rounded-bl-md bg-white px-4 py-3 text-sm font-medium text-primary shadow-sm ring-1 ring-accent/5">
                <span className="flex items-center gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-bounce" />
                </span>
                Meg is pondering...
              </div>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>

        {error ? (
          <p className="border-t border-error/20 bg-error px-4 py-2 text-xs font-semibold text-error">
            {error}
          </p>
        ) : null}

        <form
          className="border-t border-accent/10 bg-white/70 p-3 backdrop-blur"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-accent/15 bg-surface-secondary p-1.5 transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/20">
            <input
              aria-label="Ask Meg a question"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-primary placeholder:text-secondary/70 focus:outline-none disabled:cursor-not-allowed"
              disabled={isSending}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                isSending ? "Meg is pondering..." : "Describe your dream board..."
              }
              value={input}
            />
            <button
              aria-label="Send message to Meg"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-hover hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:bg-surface-secondary"
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
