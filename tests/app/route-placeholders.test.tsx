import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MyBuildsRoute from "@/app/my-builds/page";

// Browse is no longer a placeholder — it is now an async server component
// over the real catalog (covered by tests/app/browse-page.test.tsx).
// Community Gallery is no longer a static placeholder — it is now an async
// server component backed by Supabase (covered by the gallery service + build).

describe("route placeholders", () => {
  it("renders the My Builds logged-out prompt when no session exists", async () => {
    // No Supabase env in the test runner → getSessionUser resolves null via
    // the offline-dev guard, which is exactly the logged-out rendering path.
    render(await MyBuildsRoute());

    expect(
      screen.getByRole("heading", { name: /My Builds/i }),
    ).toBeInTheDocument();
    // The nav's account slot also renders a "Log in" link; the page CTA is
    // the one carrying the ?next redirect back to /my-builds.
    const loginLinks = screen.getAllByRole("link", { name: "Log in" });
    expect(
      loginLinks.some(
        (link) => link.getAttribute("href") === "/login?next=/my-builds",
      ),
    ).toBe(true);
    expect(
      screen.getByRole("link", { name: /Create account/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/No saved builds yet/i)).toBeNull();
  });
});
