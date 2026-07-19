import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroConfiguratorDemo } from "@/components/hero-configurator-demo";
import {
  HERO_DEMO_COMPONENT_IDS,
  HERO_DEMO_PROMPT,
} from "@/data/hero-demo-build";
import { getComponentById } from "@/lib/components";
import { requiredComponentCategories } from "@/lib/types";

describe("HeroConfiguratorDemo", () => {
  it("renders the recorded prompt and the resolved build from the catalog", () => {
    render(<HeroConfiguratorDemo />);

    const panel = screen.getByTestId("hero-configurator-demo");

    // The prompt in the mock input is the frozen fixture prompt, verbatim.
    expect(within(panel).getByText(HERO_DEMO_PROMPT)).toBeInTheDocument();

    // Every part name resolves from the live catalog via the frozen IDs — the
    // rail shows all six (kit-locked parts as included, choices as selected).
    for (const category of requiredComponentCategories) {
      const component = getComponentById(HERO_DEMO_COMPONENT_IDS[category]);

      expect(component).toBeDefined();
      expect(
        within(panel).getAllByText(component!.name, { exact: false }).length,
      ).toBeGreaterThan(0);
    }

    // Kit title on the left column and the estimated total (recomputed from
    // catalog prices, "~" prefix) both render.
    expect(within(panel).getAllByText("GMK67 65%").length).toBeGreaterThan(0);
    expect(within(panel).getAllByText(/~RM\s?381/).length).toBeGreaterThan(0);
  });

  it("marks the fixture's choice parts as selected in the rail", () => {
    render(<HeroConfiguratorDemo />);

    const panel = screen.getByTestId("hero-configurator-demo");
    const selectedCards = panel.querySelectorAll('[data-selected="true"]');

    // Exactly one selected card per free-choice section.
    expect(selectedCards).toHaveLength(3);

    const selectedText = Array.from(selectedCards)
      .map((card) => card.textContent ?? "")
      .join(" ");

    for (const category of ["switch", "keycap", "stabilizer"] as const) {
      const component = getComponentById(HERO_DEMO_COMPONENT_IDS[category]);

      expect(selectedText).toContain(component!.name);
    }
  });

  it("is decorative: exposes no interactive controls", () => {
    render(<HeroConfiguratorDemo />);

    const panel = screen.getByTestId("hero-configurator-demo");

    // The mock input, chips, and buttons must not be real controls — the
    // genuine prompt form above the panel is the only entry point.
    expect(within(panel).queryByRole("button")).not.toBeInTheDocument();
    expect(within(panel).queryByRole("textbox")).not.toBeInTheDocument();
    expect(within(panel).queryByRole("link")).not.toBeInTheDocument();
  });
});
