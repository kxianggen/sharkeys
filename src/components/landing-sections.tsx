"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Star } from "lucide-react";

/* ===========================================================================
   Landing-page sections: full-width expanding feature cards, a standalone
   founder quote, a "trusted by customers" review slideshow with real ratings,
   and an FAQ accordion. Semantic tokens only; everything stated is true and
   defensible — real reviews (anonymized, verbatim), real 5.0 marketplace
   ratings, real capabilities, honest answers. All motion respects
   prefers-reduced-motion via motion-reduce.
   =========================================================================== */

/* --- Expanding feature cards ------------------------------------------------
   Full-content-width row; exactly one card is expanded at a time. Collapsed
   cards are thin slats dominated by a giant muted number; the expanded card
   takes the large share and shows its copy at the top. Hover, focus, or click
   expands via animated flex-grow + grid-rows. Real, true capabilities only. */

const FEATURES = [
  {
    title: "AI that speaks your language",
    body: "Describe the sound, layout, and budget you want in plain words — sharkeys turns it into real build intent. No spec sheets required.",
  },
  {
    title: "Every build validated",
    body: "A deterministic rule engine checks every case, PCB, plate, switch, and stabilizer pairing. If sharkeys suggests it, it fits.",
  },
  {
    title: "A real builder behind it",
    body: "Advice and picks grounded in one builder's hands-on experience — honest recommendations, never invented specs or prices.",
  },
  {
    title: "A community of builds",
    body: "Browse builds others have published, share your own, and ask Meg questions right in the comments.",
  },
] as const;

export function FeatureCardsSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      aria-labelledby="feature-cards-heading"
      className="px-4 py-20 sm:px-8 lg:px-16"
      data-testid="feature-cards-section"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-h2 text-primary" id="feature-cards-heading">
          Why sharkeys.{" "}
          <span className="text-secondary">Built to be trusted.</span>
        </h2>

        <div className="mt-10 flex flex-col gap-3 md:h-[420px] md:flex-row">
          {FEATURES.map((feature, index) => {
            const open = index === openIndex;

            return (
              <button
                aria-expanded={open}
                className={`group relative flex flex-col overflow-hidden rounded-xl p-7 text-left transition-all duration-500 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/30 motion-reduce:transition-none md:p-9 ${
                  open
                    ? "bg-primary md:flex-[3]"
                    : "bg-surface-secondary md:flex-1"
                }`}
                data-testid="feature-card"
                key={feature.title}
                onClick={() => setOpenIndex(index)}
                onFocus={() => setOpenIndex(index)}
                onMouseEnter={() => setOpenIndex(index)}
                type="button"
              >
                {/* Giant number — the dominant visual on collapsed desktop
                    slats, bleeding off the bottom edge like a poster digit. */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 hidden items-end justify-center overflow-hidden transition-opacity duration-500 motion-reduce:transition-none md:flex ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <span className="translate-y-[0.18em] text-[9rem] font-bold leading-none tracking-tight text-secondary/25">
                    0{index + 1}
                  </span>
                </span>

                {/* Copy block sits at the top of the card. Kept in the DOM
                    (visually faded on collapsed desktop slats) for a11y. */}
                <span
                  className={`relative z-10 flex flex-col transition-opacity duration-300 motion-reduce:transition-none ${
                    open ? "opacity-100" : "md:opacity-0"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      open ? "text-surface/50" : "text-secondary"
                    }`}
                  >
                    0{index + 1}
                  </span>
                  <span
                    className={`mt-5 text-2xl font-semibold tracking-[-0.015em] md:text-3xl ${
                      open ? "text-surface" : "text-primary"
                    }`}
                  >
                    {feature.title}
                  </span>
                  <span
                    className={`grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <span className="overflow-hidden">
                      <span
                        className={`block max-w-md pt-5 text-base leading-7 transition-opacity duration-300 motion-reduce:transition-none ${
                          open ? "text-surface/80 opacity-100" : "opacity-0"
                        }`}
                      >
                        {feature.body}
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --- Founder quote ----------------------------------------------------------
   Standalone big centered quote — the founder statement on its own, separate
   from customer reviews. The quote text is the truthful founder line; key
   phrase italicized for emphasis only. No photo. */

// TODO(owner): replace with the real marketplace shop URL (Carousell/Shopee).
const FOUNDER_SHOP_URL = "#";

export function FounderQuoteSection() {
  return (
    <section
      aria-labelledby="founder-quote-heading"
      className="border-t-[0.5px] border-border px-4 py-24 sm:px-8"
      data-testid="founder-quote-section"
    >
      <h2 className="sr-only" id="founder-quote-heading">
        From the builder
      </h2>
      <figure className="mx-auto max-w-3xl text-center">
        <blockquote className="text-h2 text-primary">
          &ldquo;I build keyboards. I got tired of watching people struggle to
          figure out what actually fits and what they&apos;d enjoy — so I built{" "}
          <em>the tool I wish I&apos;d had</em>
          {" when I started.”"}
        </blockquote>
        <figcaption className="mt-9">
          <p className="text-base font-semibold text-primary">Jayson</p>
          <p className="mt-1 text-sm text-secondary">Builder @ sharkeys.</p>
        </figcaption>
        <a
          className="mt-9 inline-block rounded-pill bg-primary px-6 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
          href={FOUNDER_SHOP_URL}
        >
          See my shop
        </a>
      </figure>
    </section>
  );
}

/* --- Customer reviews: "trusted by" slideshow + real ratings -----------------
   One real review at a time as a large centered statement, arrow navigation,
   then the real marketplace ratings (both genuinely 5.0 — do not lower or
   invent). "500+" is a real, confirmed customer count. Review wording is
   verbatim; only names are anonymized. */

const CUSTOMER_REVIEWS = [
  {
    quote:
      "First time using a lubed keyboard — a whole new experience, way smoother to type on and the sound is just crisp. If you've got any kind of keyboard in mind, you can tell him or even show him a picture, and he'll find a similar or same one for you. Good and friendly seller, tip-top service. Very recommended!",
    name: "Wei L.",
    source: "via Carousell",
  },
  {
    quote:
      "Superb seller! Gave recommendations as this is my first custom keeb, kept my order updated, and very friendly. Really satisfied with my keyboard and will always come back.",
    name: "Aiman R.",
    source: "via Carousell",
  },
  {
    quote:
      "Very accommodating, patient and helpful with my questions and requests. Everything was resolved quickly and the item arrived in perfect condition. 10/10 would come back again.",
    name: "Jia H.",
    source: "via Carousell",
  },
] as const;

// Real marketplace ratings — genuinely 5.0 on both platforms.
const MARKETPLACE_RATINGS = [
  { rating: "5.0", label: "Carousell" },
  { rating: "5.0", label: "Shopee" },
] as const;

// Auto-advance cadence for the review slideshow.
const REVIEW_AUTO_ADVANCE_MS = 3000;

export function CustomerReviewsSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // prefers-reduced-motion: no auto-advance at all — manual arrows only.
  // Initial value is read lazily; the effect only tracks later changes.
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const count = CUSTOMER_REVIEWS.length;

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }, []);

  // Auto-advance, looping back to the first review after the last. Paused
  // while the slideshow is hovered or holds focus so readers can finish.
  useEffect(() => {
    if (paused || reducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, REVIEW_AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [paused, reducedMotion, count]);

  return (
    <section
      aria-labelledby="customer-reviews-heading"
      className="border-t-[0.5px] border-border bg-surface-secondary px-4 py-24 sm:px-8 lg:px-16"
      data-testid="customer-reviews-section"
    >
      <h2
        className="text-center text-h3 font-semibold text-primary"
        id="customer-reviews-heading"
      >
        Trusted by 500+ customers across Malaysia.
      </h2>

      <div
        className="relative mx-auto mt-14 max-w-4xl"
        data-testid="review-carousel"
        onBlur={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          aria-label="Previous review"
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-[0.5px] border-border bg-surface text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
          onClick={() => setIndex((index - 1 + count) % count)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className="px-14">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {CUSTOMER_REVIEWS.map((review, reviewIndex) => (
                <figure
                  aria-hidden={reviewIndex !== index}
                  className="flex w-full flex-none flex-col items-center px-1 text-center"
                  key={review.name}
                >
                  <blockquote className="max-w-2xl text-xl font-semibold leading-snug tracking-[-0.01em] text-primary sm:text-2xl">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-secondary">
                    <span className="font-semibold text-primary">
                      {review.name}
                    </span>
                    <span>{review.source}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>

        <button
          aria-label="Next review"
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-[0.5px] border-border bg-surface text-secondary transition hover:border-border-strong hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
          onClick={() => setIndex((index + 1) % count)}
          type="button"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Real ratings — both marketplaces are genuinely 5.0. */}
      <div
        className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
        data-testid="marketplace-ratings"
      >
        {MARKETPLACE_RATINGS.map((entry) => (
          <div className="flex items-center gap-3" key={entry.label}>
            <span className="text-h3 font-semibold text-primary">
              {entry.rating}
            </span>
            <span className="flex flex-col">
              <span aria-hidden className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }, (_, starIndex) => (
                  <Star
                    className="h-3 w-3 fill-current"
                    key={starIndex}
                    aria-hidden
                  />
                ))}
              </span>
              <span className="mt-0.5 text-caption text-secondary">
                {entry.label}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --- FAQ accordion ----------------------------------------------------------
   Apple-style one-at-a-time disclosure. Every answer is true to the current
   product: design/validate only (no checkout), rule engine is the authority,
   Meg never invents facts. */

const FAQS = [
  {
    question: "What is sharkeys?",
    answer:
      "An AI keyboard configurator. Describe the keyboard you want in plain language — sound, budget, layout, use — and sharkeys turns it into a complete custom build with parts that actually fit together.",
  },
  {
    question: "How does it know what's compatible?",
    answer:
      "A deterministic rule engine checks every pairing — case, PCB, plate, switches, keycaps, stabilizers. The AI suggests and explains, but the rules are the final authority on what fits. Nothing reaches you unvalidated.",
  },
  {
    question: "Do I need to know anything about keyboards?",
    answer:
      "No. Tell it what you care about — how it should sound, what you'll use it for, what you want to spend — and it guides you from there, explaining the jargon along the way.",
  },
  {
    question: "Is the AI making things up?",
    answer:
      "No. Meg answers only from the real parts catalog, the compatibility engine, and a real builder's experience. It won't invent parts, prices, or compatibility claims — and it tells you when it doesn't know.",
  },
  {
    question: "Can I buy a keyboard here?",
    answer:
      "Not yet — sharkeys helps you design and validate the build. Catalog parts link to real vendor listings where available, so you can source everything yourself.",
  },
  {
    question: "Who built this?",
    answer:
      "A keyboard builder who has shipped hundreds of custom boards, and wanted a tool that makes figuring out what fits — and what you'll enjoy — easier for everyone starting out.",
  },
] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      aria-labelledby="faq-heading"
      className="border-t-[0.5px] border-border px-4 py-20 sm:px-8 lg:px-16"
      data-testid="faq-section"
    >
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_2fr]">
        <h2 className="text-h2 text-primary" id="faq-heading">
          FAQ
        </h2>

        <div>
          {FAQS.map((faq, index) => {
            const open = index === openIndex;
            const panelId = `faq-panel-${index}`;

            return (
              <div
                className="border-t-[0.5px] border-border first:border-t-0"
                key={faq.question}
              >
                <button
                  aria-controls={panelId}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  onClick={() => setOpenIndex(open ? null : index)}
                  type="button"
                >
                  <span className="text-lg font-semibold text-primary">
                    {faq.question}
                  </span>
                  <Plus
                    aria-hidden
                    className={`h-4 w-4 flex-none text-secondary transition-transform duration-300 motion-reduce:transition-none ${
                      open ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                  id={panelId}
                  role="region"
                >
                  <div className="overflow-hidden">
                    <p className="max-w-xl pb-5 text-sm leading-6 text-secondary">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
