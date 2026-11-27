"use client";

import Image from "next/image";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import {
  AlertCircle,
  Image as ImageIcon,
  Info,
  Loader2,
  MessageCircle,
  Mic,
  Sparkles,
} from "lucide-react";

import { configuratorQuickPrompts } from "@/components/configurator/constants";
import { Notice } from "@/components/configurator/notices";
import type { ConfiguratorState } from "@/components/configurator/use-configurator";
import { ImageDrop } from "@/components/image-drop";

// Request input: "Ask Meg" header, prompt form, photo drop, quick prompts and
// the status notices under them.
export function RequestPanel({
  isDesigning,
  isImagePanelOpen,
  setIsImagePanelOpen,
  setKeybotOpenSignal,
  state,
}: {
  isDesigning: boolean;
  isImagePanelOpen: boolean;
  setIsImagePanelOpen: Dispatch<SetStateAction<boolean>>;
  setKeybotOpenSignal: Dispatch<SetStateAction<number>>;
  state: ConfiguratorState;
}) {
  const {
    error,
    handleImageChange,
    handleQuickPrompt,
    handleSubmit,
    hasMounted,
    imageDataUrl,
    isSubmitDisabled,
    isSubmitting,
    message,
    result,
    savedBuildMessage,
    saveRequiresLogin,
    setMessage,
    visionLoading,
    visionNote,
  } = state;

  return (
    <>
            <header className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-full bg-accent-subtle"
              >
                <Image
                  alt="Meg"
                  className="h-full w-full rounded-full object-cover"
                  height={40}
                  src="/meg-avatar.png"
                  width={40}
                />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-primary">
                  Ask Meg
                </h2>
                <p className="text-xs text-secondary">AI build control</p>
              </div>
              <button
                aria-label="Open Meg chat"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-secondary transition hover:bg-accent-subtle hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
                onClick={() => setKeybotOpenSignal((current) => current + 1)}
                type="button"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
              </button>
            </header>

            <form
              aria-label="AI keyboard prompt form"
              className="mt-4 flex items-center gap-1.5 rounded-pill border-[0.5px] border-border bg-surface py-1.5 pl-2 pr-1.5 transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15"
              onSubmit={handleSubmit}
            >
              <button
                aria-expanded={isImagePanelOpen}
                aria-label="Add an inspiration photo"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-secondary transition hover:bg-accent-subtle hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
                onClick={() => setIsImagePanelOpen((current) => !current)}
                type="button"
              >
                <ImageIcon className="h-4 w-4" aria-hidden />
              </button>
              <button
                aria-label="Voice input is not available yet"
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-secondary transition disabled:cursor-not-allowed disabled:opacity-55"
                disabled
                type="button"
              >
                <Mic className="h-4 w-4" aria-hidden />
              </button>

              <label className="sr-only" htmlFor="keyboard-request">
                Keyboard request
              </label>
              <textarea
                className="h-10 min-w-0 flex-1 resize-none border-none bg-transparent px-1 py-2 text-sm leading-6 text-primary outline-none placeholder:text-secondary/70 focus:ring-0"
                id="keyboard-request"
                maxLength={2000}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="A deep thocky build for a quiet office..."
                rows={1}
                value={message}
              />

              <button
                className="inline-flex h-10 flex-none items-center justify-center gap-2 rounded-pill bg-accent px-4 text-sm font-bold text-white transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={isSubmitDisabled}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    <span>Designing…</span>
                  </>
                ) : (
                  <>
                    <span>Design my build</span>
                    <Sparkles className="h-4 w-4" aria-hidden />
                  </>
                )}
              </button>
            </form>

            {isImagePanelOpen || imageDataUrl ? (
              <div className="mt-3">
                <ImageDrop
                  disabled={isSubmitting || visionLoading}
                  onChange={(value) => void handleImageChange(value)}
                  value={imageDataUrl}
                />
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {configuratorQuickPrompts.map((prompt) => (
                <button
                  className="inline-flex min-h-9 items-center rounded-pill border-[0.5px] border-border bg-surface px-4 py-1.5 text-sm font-medium text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={hasMounted && isSubmitting}
                  key={prompt.label}
                  onClick={() => void handleQuickPrompt(prompt.prompt)}
                  type="button"
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {isDesigning ? (
                <div className="inline-flex w-full items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-bold text-white">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {visionLoading
                    ? "Reading your image…"
                    : "Meg is designing your build…"}
                </div>
              ) : null}

              {visionNote ? (
                <p className="rounded-lg bg-accent-subtle px-4 py-3 text-sm font-medium text-primary">
                  {visionNote}
                </p>
              ) : null}

              {error ? (
                <Notice icon={AlertCircle} message={error} tone="red" />
              ) : null}

              {savedBuildMessage ? (
                <Notice
                  icon={Info}
                  message={
                    saveRequiresLogin ? (
                      <>
                        {savedBuildMessage}{" "}
                        <Link
                          className="font-semibold text-primary underline"
                          href="/login?next=/configurator"
                        >
                          Log in
                        </Link>
                      </>
                    ) : (
                      // UAT finding 3: this previously named the My Builds page
                      // in plain text, so the confirmation told people where the
                      // build had gone without giving them any way to get there.
                      // Mirrors the logged-out branch above, which was already a
                      // real link.
                      <>
                        {savedBuildMessage} View them on{" "}
                        <Link
                          className="font-semibold text-primary underline"
                          href="/my-builds"
                        >
                          My Builds
                        </Link>
                        .
                      </>
                    )
                  }
                  tone="sky"
                />
              ) : null}

              {result?.source === "fallback_missing_api_key" ? (
                <Notice
                  icon={Info}
                  message="OpenAI key is not configured, so this demo is using local keyword extraction."
                  tone="sky"
                />
              ) : null}
            </div>
    </>
  );
}
