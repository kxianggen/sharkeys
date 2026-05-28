import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ConfiguratorPage from "@/app/configurator/page";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navigationMocks.push,
  }),
}));

describe("ConfiguratorPage", () => {
  it("renders the dedicated recommendation workspace", async () => {
    render(await ConfiguratorPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("heading", { name: /What's your dream sound/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("form", { name: /AI keyboard prompt form/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thocky/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Quiet Office/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /65% Layout/i })).toBeInTheDocument();
    expect(screen.queryByText("Manual build check")).not.toBeInTheDocument();
    expect(screen.queryByText("Request summary")).not.toBeInTheDocument();
    expect(screen.queryByText("How it works")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /Saved builds gallery/i }),
    ).not.toBeInTheDocument();
  });

  it("hydrates prompt query text into the workspace input", async () => {
    render(
      await ConfiguratorPage({
        searchParams: Promise.resolve({
          prompt: "quiet office keyboard under RM500",
        }),
      }),
    );

    expect(screen.getByLabelText("Keyboard request")).toHaveValue(
      "quiet office keyboard under RM500",
    );
  });
});
