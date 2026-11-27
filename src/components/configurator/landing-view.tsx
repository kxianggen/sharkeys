"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Image as ImageIcon, Mic } from "lucide-react";

import { buildConfiguratorPromptHref } from "@/components/configurator/build-helpers";
import { quickPrompts } from "@/components/configurator/constants";
import { FloatingKeybot } from "@/components/configurator/keybot/floating-keybot";
import { SharkeysFooter } from "@/components/configurator/sharkeys-footer";
import type { ManualSelection } from "@/components/configurator/types";
import { useCatalog } from "@/components/configurator/use-catalog";
import { useHasMounted } from "@/components/configurator/use-has-mounted";
import { useLandingHero } from "@/components/configurator/use-landing-hero";
import { HeroConfiguratorDemo } from "@/components/hero-configurator-demo";
import {
  CustomerReviewsSection,
  FaqSection,
  FeatureCardsSection,
  FounderQuoteSection,
} from "@/components/landing-sections";
import { MainNav } from "@/components/main-nav";

// The landing page never has a manual selection; one shared empty object keeps
// Meg's props stable between renders.
const noManualSelection: ManualSelection = {};

// Kept as its own string literal: Tailwind finds classes by scanning source
// text, and "sm:text-display" glued to a following `${` is not recognised, so
// the class silently went missing from the CSS (caught by the visual test on
// a fresh dev server).
const headlineClassName = "max-w-4xl text-primary text-h1 sm:text-display";

// The home page: hero with the prompt box (which hands off to /configurator),
// the decorative demo panel, the landing sections, footer and Meg.
export function LandingView() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const hasMounted = useHasMounted();
  const { catalogById } = useCatalog();
  const { heroCopyRef, heroFade, heroPanelLiftRef, heroRunwayRef } =
    useLandingHero();

  const shouldDisableSubmit = message.trim().length === 0;
  const isSubmitDisabled = hasMounted && shouldDisableSubmit;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (shouldDisableSubmit) {
      return;
    }

    router.push(buildConfiguratorPromptHref(message));
  }

  function handleQuickPrompt(prompt: string) {
    router.push(buildConfiguratorPromptHref(prompt));
  }

  return (
    <div
      // overflow-x-CLIP, not -hidden: hidden overflow on an ancestor silently
      // disables position:sticky for everything inside it (the ancestor
      // becomes the sticking context but never scrolls). clip guards against
      // horizontal scrollbars identically while leaving the sticky nav and
      // the pinned hero stage working.
      className="min-h-screen overflow-x-clip text-primary bg-surface"
    >
      <MainNav />

      {/* Full-bleed hero wrapper: hosts the backdrop (gradient + grid) so it
          spans the whole viewport width while the content section stays at its
          max-width. The backdrop ends exactly where this wrapper ends — the
          sections below it stay plain. */}
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Soft wash: white at the top, the design system's subtle accent
              fill at the bottom, strongest around the demo panel. */}
          <div
            className="absolute inset-0"
            style={{
              // A clearly visible wash of the system accent: ~16% accent
              // mixed into white at the bottom (accent-subtle alone is too
              // faint to read as a gradient at all).
              background:
                "linear-gradient(to bottom, var(--surface) 0%, var(--surface) 10%, color-mix(in srgb, var(--accent) 22%, white) 100%)",
            }}
          />
          {/* Fine vertical hairline grid, Attio-style: tight 12px columns
              with LOW-contrast 1px lines — the quality read comes from the
              lines being felt rather than seen. Tiled background-size keeps
              each line crisply 1px (repeating-gradients can smear across
              device pixels). Revealed progressively over the tinted area. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "12px 100%",
              maskImage:
                "linear-gradient(to bottom, transparent 18%, black 65%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 18%, black 65%)",
            }}
          />
        </div>

        {/* Runway: taller than the viewport at lg so the sticky stage inside it
            pins while the handoff plays. Inert (plain div) below lg. */}
        <div className="lg:h-[180vh]" ref={heroRunwayRef}>
          <section
            className="relative mx-auto flex w-full flex-col items-center px-4 text-center sm:px-8 max-w-[920px] pb-20 pt-20 lg:sticky lg:top-12 lg:h-[calc(100vh-3rem)] lg:overflow-hidden lg:pb-0 lg:pt-16"
            id="configurator"
          >
            {/* Copy block: fades and rises away as the scroll handoff plays. */}
            <div
              className="flex w-full flex-col items-center will-change-transform"
              ref={heroCopyRef}
            >
              <h1 className={`${headlineClassName}${heroFade()}`}>
                Build your dream keyboard in words.
              </h1>
              <p
                className={`mt-6 max-w-xl text-base leading-7 text-secondary${heroFade("delay-150")}`}
              >
                Describe your sound, layout, and budget — sharkeys turns it into compatible builds.
              </p>

              {/* The form animates via a wrapper: the form element's own
                  `transition` class serves its focus ring, and inheriting a
                  700ms duration there would make focus feedback sluggish. */}
              <div
                className={`flex w-full flex-col items-center${heroFade("delay-300")}`}
              >
                <form
                  aria-label="AI keyboard prompt form"
                  className="mt-10 flex w-full max-w-2xl items-center gap-2 rounded-pill border-[0.5px] border-border bg-surface py-1.5 pl-2 pr-1.5 text-left transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15"
                  onSubmit={handleSubmit}
                >
                  <div className="flex flex-none gap-1 text-secondary">
                    <button
                      aria-label="Voice input is not available yet"
                      className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-accent-subtle disabled:cursor-not-allowed disabled:opacity-55"
                      disabled
                      type="button"
                    >
                      <Mic className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      aria-label="Image input is not available yet"
                      className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-accent-subtle disabled:cursor-not-allowed disabled:opacity-55"
                      disabled
                      type="button"
                    >
                      <ImageIcon className="h-4 w-4" aria-hidden />
                    </button>
                  </div>

                  <label className="sr-only" htmlFor="keyboard-request">
                    Keyboard request
                  </label>
                  <textarea
                    className="h-10 min-w-0 flex-1 resize-none border-none bg-transparent px-1 py-2 text-sm leading-6 text-primary outline-none placeholder:text-secondary/70 focus:ring-0"
                    id="keyboard-request"
                    maxLength={2000}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Quiet office board under RM300..."
                    rows={1}
                    value={message}
                  />

                  <button
                    className="inline-flex h-10 flex-none items-center justify-center gap-2 rounded-pill bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={isSubmitDisabled}
                    type="submit"
                  >
                    <span>Start Building</span>
                  </button>
                </form>
              </div>

              <div
                className={`mt-5 flex max-w-4xl flex-wrap justify-center gap-3${heroFade("delay-[450ms]")}`}
              >
                {quickPrompts.map((prompt) => (
                  <button
                    className="inline-flex min-h-9 items-center rounded-pill border-[0.5px] border-border bg-surface px-5 py-2 text-sm font-medium text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    type="button"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Attio-style demo panel: sits at the bottom of the hero so its top
                slice is visible on first paint and scrolling reveals the full
                mock window. The lift wrapper is the scroll-handoff target that
                pulls it up over the fading copy. Decorative replay of a
                recorded pipeline run — the form above stays the only real entry
                point. */}
            <div className="w-full will-change-transform" ref={heroPanelLiftRef}>
              <HeroConfiguratorDemo />
            </div>
          </section>
        </div>

        {/* Run-out: tinted breathing room between the hero and the next
            section — the backdrop (gradient + grid) fills it, so the hero
            exhales before the plain-white sections begin. */}
        <div aria-hidden className="h-20 lg:h-32" />
      </div>

      <FeatureCardsSection />
      <FounderQuoteSection />
      <CustomerReviewsSection />
      <FaqSection />

      <SharkeysFooter />

      <FloatingKeybot
        catalogById={catalogById}
        manualSelection={noManualSelection}
        result={null}
        selectedRecommendation={null}
      />
    </div>
  );
}
