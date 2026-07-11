import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The account island reads the cookie session via the Supabase browser client
// and invokes the existing signOutAction. Both are mocked so the test asserts
// the *rendering contract* (logged-out vs logged-in), not Supabase itself.
const { signOutAction, getUser, maybeSingle, onAuthStateChange } = vi.hoisted(
  () => ({
    signOutAction: vi.fn(),
    getUser: vi.fn(),
    maybeSingle: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  }),
);

vi.mock("@/app/(auth)/actions", () => ({ signOutAction }));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: () => ({
    auth: { getUser, onAuthStateChange },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle }) }),
    }),
  }),
}));

import { NavAccount } from "@/components/nav-account";

describe("NavAccount", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://real.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "real-anon-key";
  });

  afterEach(() => {
    cleanup();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    vi.clearAllMocks();
  });

  it("renders the Log in link when signed out", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    render(<NavAccount />);

    // Resolves to the anonymous state: Log in link, no Log out control.
    expect(
      await screen.findByRole("link", { name: "Log in" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Log out" })).toBeNull();
  });

  it("renders the username and a Log out control when signed in", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "meg@example.com" } },
    });
    maybeSingle.mockResolvedValue({ data: { username: "meg_1a2b3c4d" } });

    render(<NavAccount />);

    // Signed-in state renders the identity and the logout control, and drops
    // the Log in link — proving the nav renders differently per auth state.
    expect(await screen.findByText("@meg_1a2b3c4d")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Log out" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
  });

  it("falls back to the email local-part when no profile row exists", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-2", email: "newcomer@example.com" } },
    });
    maybeSingle.mockResolvedValue({ data: null });

    render(<NavAccount />);

    expect(await screen.findByText("@newcomer")).toBeInTheDocument();
  });

  it("stays on the Log in link when Supabase env is unconfigured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-supabase-anon-key";

    render(<NavAccount />);

    expect(
      await screen.findByRole("link", { name: "Log in" }),
    ).toBeInTheDocument();
    // Placeholder env → the browser client is never queried.
    expect(getUser).not.toHaveBeenCalled();
  });
});
