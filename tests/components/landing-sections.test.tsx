import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  FaqSection,
  FeatureCardsSection,
} from "@/components/landing-sections";

describe("FeatureCardsSection", () => {
  it("renders four cards with the first expanded by default", () => {
    render(<FeatureCardsSection />);

    const cards = screen.getAllByTestId("feature-card");
    expect(cards).toHaveLength(4);
    expect(cards[0]).toHaveAttribute("aria-expanded", "true");
    for (const card of cards.slice(1)) {
      expect(card).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("expands a card on focus and collapses the previous one", () => {
    render(<FeatureCardsSection />);

    const cards = screen.getAllByTestId("feature-card");
    fireEvent.focus(cards[2]);

    expect(cards[2]).toHaveAttribute("aria-expanded", "true");
    expect(cards[0]).toHaveAttribute("aria-expanded", "false");
    // Still exactly one open.
    expect(
      cards.filter((card) => card.getAttribute("aria-expanded") === "true"),
    ).toHaveLength(1);
  });

  it("expands on hover too", () => {
    render(<FeatureCardsSection />);

    const cards = screen.getAllByTestId("feature-card");
    fireEvent.mouseEnter(cards[1]);

    expect(cards[1]).toHaveAttribute("aria-expanded", "true");
    expect(cards[0]).toHaveAttribute("aria-expanded", "false");
  });
});

describe("FaqSection", () => {
  it("renders the questions with the first open by default", () => {
    render(<FaqSection />);

    const section = screen.getByTestId("faq-section");
    expect(section).toHaveTextContent("What is sharkeys?");
    expect(section).toHaveTextContent("How does it know what's compatible?");
    expect(section).toHaveTextContent("Who built this?");

    const firstQuestion = within(section).getByRole("button", {
      name: /What is sharkeys\?/,
    });
    expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  });

  it("opens one question at a time and toggles closed on re-click", () => {
    render(<FaqSection />);

    const section = screen.getByTestId("faq-section");
    const first = within(section).getByRole("button", {
      name: /What is sharkeys\?/,
    });
    const grounding = within(section).getByRole("button", {
      name: /Is the AI making things up\?/,
    });

    fireEvent.click(grounding);
    expect(grounding).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");

    // Re-click closes it (none open).
    fireEvent.click(grounding);
    expect(grounding).toHaveAttribute("aria-expanded", "false");
  });

  it("answers stay honest about what the product does", () => {
    render(<FaqSection />);

    const section = screen.getByTestId("faq-section");
    // The buy question answers honestly: design/validate only, no checkout.
    expect(section).toHaveTextContent(/Not yet/);
    // Grounding claim mentions the rule engine authority.
    expect(section).toHaveTextContent(/final authority/i);
  });
});
