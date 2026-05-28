"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, ShieldCheck, X } from "lucide-react";

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

export function GlobalKeybotLauncher() {
  const pathname = usePathname();
  const hidden = routeHasLocalKeybot.some((route) =>
    route === "/" ? pathname === route : pathname?.startsWith(route),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<FloatingMessage[]>([
    {
      id: "global-keybot-welcome",
      role: "assistant",
      content:
        "Hi, I’m Keybot. Ask about switches, sound, layouts, compatibility, or your current build.",
    },
  ]);
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
          "error" in body ? body.error.message : "Keybot could not answer.",
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
          : "Keybot could not answer right now.",
      );
      setMessages((current) => [
        ...current,
        {
          id: createMessageId("assistant"),
          role: "assistant",
          content:
            "I could not reach Keybot just now. The main configurator still uses deterministic validation.",
          source: "fallback_error",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        aria-label="Open Keybot assistant"
        className="fixed bottom-4 right-4 z-40 inline-flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-[#c2c7cf] bg-white px-4 py-3 text-left text-[#071e29] shadow-[0_16px_40px_rgba(9,60,93,0.16)] transition hover:-translate-y-0.5 hover:border-[#3DA9FC] hover:bg-[#f5faff] focus:outline-none focus:ring-4 focus:ring-[#3DA9FC]/30 sm:bottom-6 sm:right-6"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <KeybotMark />
        <span className="min-w-0">
          <span className="block text-sm font-bold leading-4">Ask Keybot</span>
          <span className="mt-0.5 hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5F6C7B] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2F8F46]" />
            Grounded
          </span>
        </span>
      </button>
    );
  }

  return (
    <section
      aria-label="Keybot keyboard helper"
      className="fixed inset-x-3 bottom-3 z-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[28rem] sm:max-w-[calc(100vw-3rem)]"
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[28px] border border-[#c2c7cf] bg-white shadow-[0_16px_40px_rgba(9,60,93,0.16)] sm:h-[600px]">
        <div className="border-b border-[#c2c7cf]/70 p-4">
          <div className="flex items-center gap-3">
            <KeybotMark />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold leading-5 text-[#071e29]">
                Keybot
              </h2>
              <p className="text-xs font-semibold text-[#5F6C7B]">
                Grounded assistant
              </p>
            </div>
            <button
              aria-label="Close Keybot assistant"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[#5F6C7B] transition hover:bg-[#D8EEFE] hover:text-[#094067] focus:outline-none focus:ring-4 focus:ring-[#3DA9FC]/25"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#c2c7cf]/80 bg-[#f5faff] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#094067]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Grounded in catalog + rules
          </div>
        </div>

        <div
          aria-live="polite"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f8fbff] px-4 py-4"
        >
          {messages.map((message) => (
            <div
              className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              key={message.id}
            >
              <div
                className={`max-w-[86%] rounded-3xl border px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.role === "assistant"
                    ? "rounded-tl-md border-[#c2c7cf]/70 bg-white text-[#071e29]"
                    : "rounded-tr-md border-[#b9ddf7] bg-[#D8EEFE] text-[#071e29]"
                }`}
              >
                {message.content}
                {message.role === "assistant" && message.source ? (
                  <div className="mt-3 border-t border-[#c2c7cf]/50 pt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#5F6C7B]">
                    {message.source === "fallback_missing_api_key" ||
                    message.source === "fallback_error"
                      ? "Using local grounded fallback"
                      : "Catalog verified"}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {isSending ? (
            <div className="inline-flex items-center gap-2 rounded-3xl rounded-tl-md border border-[#c2c7cf]/70 bg-white px-4 py-3 text-sm font-bold text-[#094067] shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Checking catalog facts...
            </div>
          ) : null}
          <div ref={endRef} />
        </div>

        {error ? (
          <p className="border-t border-[#ba1a1a]/20 bg-[#fff5f5] px-4 py-2 text-xs font-semibold text-[#ba1a1a]">
            {error}
          </p>
        ) : null}

        <form
          className="border-t border-[#c2c7cf]/70 bg-white p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-[#c2c7cf] bg-[#f5faff] p-1.5 focus-within:border-[#3DA9FC] focus-within:ring-4 focus-within:ring-[#3DA9FC]/20">
            <input
              aria-label="Keybot question"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-[#071e29] placeholder:text-[#5F6C7B]/70 focus:outline-none"
              disabled={isSending}
              onChange={(event) => setInput(event.target.value)}
              placeholder={isSending ? "Thinking..." : "Ask about switches, sound..."}
              value={input}
            />
            <button
              aria-label="Send Keybot question"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#3DA9FC] text-[#003e66] transition hover:bg-[#094067] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#3DA9FC]/30 disabled:cursor-not-allowed disabled:bg-[#c2c7cf] disabled:text-white"
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

function KeybotMark() {
  return (
    <span
      aria-hidden
      className="relative flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[#c2c7cf]/80 bg-[#D8EEFE] text-[#094067]"
    >
      <Bot className="h-5 w-5" />
      <span className="absolute -right-0.5 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#3DA9FC]" />
    </span>
  );
}

function createMessageId(prefix: "assistant" | "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
