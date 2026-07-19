import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BrowseCatalog } from "@/components/browse-catalog";
import { keyboardComponents } from "@/data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Builder's pick tag", () => {
  it("renders on builder-pick kits and parts in Browse", () => {
    render(<BrowseCatalog components={[...keyboardComponents]} />);

    const tags = screen.getAllByTestId("builder-pick-tag");
    // Lucky65 V3 kit, GMK67 kit, and the MMD Princess switch part.
    expect(tags.length).toBeGreaterThanOrEqual(3);
    for (const tag of tags) {
      expect(tag).toHaveTextContent(/builder's pick/i);
    }
  });

  it("tags the Lucky65 V3 kit card specifically", () => {
    render(<BrowseCatalog components={[...keyboardComponents]} />);

    const luckyCard = screen
      .getByText(/Lucky65/i)
      .closest("[data-testid='kit-card']");
    expect(luckyCard).not.toBeNull();
    expect(
      within(luckyCard as HTMLElement).getByTestId("builder-pick-tag"),
    ).toBeInTheDocument();
  });
});
