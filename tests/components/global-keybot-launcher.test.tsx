import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GlobalKeybotLauncher } from "@/components/global-keybot-launcher";
import { RATE_LIMIT_MESSAGE } from "@/lib/api/rate-limit";

// The launcher hides itself on routes that have their own Meg panel.
vi.mock("next/navigation", () => ({
  usePathname: () => "/browse",
}));

describe("GlobalKeybotLauncher", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a friendly slow-down message when Keybot is rate limited", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("Too Many Requests", {
            status: 429,
            headers: { "Content-Type": "text/plain" },
          }),
      ),
    );
    render(<GlobalKeybotLauncher />);

    fireEvent.click(screen.getByRole("button", { name: /Open Meg assistant/i }));
    fireEvent.change(screen.getByLabelText("Ask Meg a question"), {
      target: { value: "Quiet office board under RM500" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send message to Meg/i }));

    expect(await screen.findByText(RATE_LIMIT_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(/could not reach Meg/i)).not.toBeInTheDocument();
  });
});
