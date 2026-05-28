import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import VisualBuilderPage from "@/app/visual-builder/page";

describe("VisualBuilderPage", () => {
  it("renders the dedicated visual builder layout with grounded default parts", async () => {
    render(await VisualBuilderPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "keybot" })).toBeInTheDocument();
    expect(screen.getByText("Preview placeholder")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Acoustic Profile" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Build Summary" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Compatibility Engine" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Ask Keybot...")).not.toBeInTheDocument();
    expect(screen.getByText("Fully Compatible")).toBeInTheDocument();
    expect(screen.getAllByText("Keychron V2 Max 65% ABS Case").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText("Gateron Sea Salt Smoothie Linear Switch").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("6 Parts")).toBeInTheDocument();
    expect(screen.queryByText(/Aero-75|GMK Minimal/i)).not.toBeInTheDocument();
  });

  it("uses catalog component query params for the visual builder state", async () => {
    render(
      await VisualBuilderPage({
        searchParams: Promise.resolve({
          case: "case_weikav_star80_tkl_aluminum",
          keycap: "keycap_unknown_standard_white_jp_cherry",
          pcb: "pcb_weikav_star80_tkl_hotswap",
          plate: "plate_weikav_star80_tkl_fr4",
          stabilizer: "stab_weikav_star80_pcb_mount",
          switch: "switch_mmd_holy_panda_v3",
        }),
      }),
    );

    expect(
      screen.getAllByText("Weikav Star 80 CNC Aluminum TKL Case").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("MMD Holy Panda V3 Tactile Switch").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/TKL layout match/i)).toBeInTheDocument();
    expect(screen.queryByText(/Aero-75|GMK Minimal/i)).not.toBeInTheDocument();
  });

  it("falls back safely when query params are invalid", async () => {
    render(
      await VisualBuilderPage({
        searchParams: Promise.resolve({
          case: "missing_case",
          switch: "not_a_switch",
        }),
      }),
    );

    expect(screen.getAllByText("Keychron V2 Max 65% ABS Case").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText("Gateron Sea Salt Smoothie Linear Switch").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Aero-75|GMK Minimal/i)).not.toBeInTheDocument();
  });
});
