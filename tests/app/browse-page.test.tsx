import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BrowsePage from "@/app/browse/page";
import { BrowseCatalog } from "@/components/browse-catalog";
import { keyboardComponents } from "@/data";

function renderCatalog() {
  return render(<BrowseCatalog components={[...keyboardComponents]} />);
}

describe("browse page", () => {
  it("renders the hero, shared nav, and every category section", async () => {
    render(await BrowsePage());

    expect(screen.getByRole("heading", { name: "Browse" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Configurator" }),
    ).toHaveAttribute("href", "/configurator");
    expect(screen.getByRole("heading", { name: /Kits\./ })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Switches\./ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Keycaps\./ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Stabilizers\./ }),
    ).toBeInTheDocument();
  });

  it("gives every kit card a Configure action preselecting that kit", () => {
    renderCatalog();

    const kitsSection = screen.getByRole("region", { name: /Kits\./ });
    const configureLinks = within(kitsSection).getAllByRole("link", {
      name: "Configure",
    });

    expect(configureLinks.length).toBeGreaterThan(0);
    for (const link of configureLinks) {
      expect(link.getAttribute("href")).toMatch(/^\/configurator\?kit=.+/);
    }

    const gmk67Card = within(kitsSection)
      .getByRole("heading", { name: /^GMK67/ })
      .closest("article");
    expect(gmk67Card).not.toBeNull();
    expect(
      within(gmk67Card as HTMLElement).getByRole("link", { name: "Configure" }),
    ).toHaveAttribute("href", "/configurator?kit=gmk67");
  });

  it("filters kits by layout with the pill row", () => {
    renderCatalog();

    const kitsSection = screen.getByRole("region", { name: /Kits\./ });

    expect(
      within(kitsSection).getByRole("heading", { name: /Zuoya GMK61/ }),
    ).toBeInTheDocument();
    expect(
      within(kitsSection).getByRole("heading", { name: /Lucky65 V3/ }),
    ).toBeInTheDocument();

    fireEvent.click(within(kitsSection).getByRole("button", { name: "60%" }));

    expect(
      within(kitsSection).getByRole("heading", { name: /Zuoya GMK61/ }),
    ).toBeInTheDocument();
    expect(
      within(kitsSection).queryByRole("heading", { name: /Lucky65 V3/ }),
    ).not.toBeInTheDocument();

    fireEvent.click(within(kitsSection).getByRole("button", { name: "All" }));

    expect(
      within(kitsSection).getByRole("heading", { name: /Lucky65 V3/ }),
    ).toBeInTheDocument();
  });

  it("supports arrow-key navigation on the sliding filter selector", () => {
    renderCatalog();

    const kitsSection = screen.getByRole("region", { name: /Kits\./ });
    const allButton = within(kitsSection).getByRole("button", { name: "All" });

    expect(allButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(allButton, { key: "ArrowRight" });

    expect(
      within(kitsSection).getByRole("button", { name: "60%" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(allButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.keyDown(
      within(kitsSection).getByRole("button", { name: "60%" }),
      { key: "ArrowLeft" },
    );

    expect(allButton).toHaveAttribute("aria-pressed", "true");
  });

  it("filters switches by type, including the silent overlap", () => {
    renderCatalog();

    const switchesSection = screen.getByRole("region", { name: /Switches\./ });

    fireEvent.click(
      within(switchesSection).getByRole("button", { name: "Silent" }),
    );

    expect(
      within(switchesSection).getByRole("heading", {
        name: /Outemu Silent Peach V2/,
      }),
    ).toBeInTheDocument();
    expect(
      within(switchesSection).queryByRole("heading", {
        name: /Kailh Box White V2/,
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(switchesSection).getByRole("button", { name: "Clicky" }),
    );

    expect(
      within(switchesSection).getByRole("heading", {
        name: /Kailh Box White V2/,
      }),
    ).toBeInTheDocument();
  });

  it("shows keycap swatch dots on keycap placeholders", () => {
    renderCatalog();

    const keycapsSection = screen.getByRole("region", { name: /Keycaps\./ });

    expect(
      within(keycapsSection).getAllByTestId("keycap-swatch").length,
    ).toBeGreaterThan(0);
  });

  it("opens an info-only detail dialog from a part card", () => {
    renderCatalog();

    const switchesSection = screen.getByRole("region", { name: /Switches\./ });

    fireEvent.click(
      within(switchesSection).getByRole("button", {
        name: /Gateron Oil King/,
      }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName(/Gateron Oil King/);
    expect(
      within(dialog).getByText(/Premium 5-pin linear switch/),
    ).toBeInTheDocument();
    // Info-only: parts never expose a Configure action.
    expect(
      within(dialog).queryByRole("link", { name: /Configure/ }),
    ).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps kit-locked parts off the aftermarket sections", () => {
    renderCatalog();

    const stabilizersSection = screen.getByRole("region", {
      name: /Stabilizers\./,
    });

    // Kit-included stabilizers ship with their kit, not as standalone products.
    expect(
      within(stabilizersSection).queryByRole("heading", {
        name: /GMK67 Kit Plate-Mounted/,
      }),
    ).not.toBeInTheDocument();
    expect(
      within(stabilizersSection).getByRole("heading", {
        name: /C3 Equalz Screw-In Stabilizers V3/,
      }),
    ).toBeInTheDocument();
  });
});
