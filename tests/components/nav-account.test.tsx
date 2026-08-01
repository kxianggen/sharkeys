import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The account flyout is the shared nav bar expanding. The bar (MainNav) owns
// the open/close interaction AND the single auth read that drives the avatar
// trigger; the panel body (AccountPanel) fetches a saved-builds preview from
// /api/account/builds-preview and invokes the existing signOutAction. The
// Supabase browser client, the preview fetch, and signOutAction are all mocked
// so the tests assert the *rendering contract* (avatar trigger + panel states),
// not the backends themselves.
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

import { MainNav } from "@/components/main-nav";

function mockPreview(loggedIn: boolean, builds: unknown[] = []) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ loggedIn, builds }),
    }),
  );
}

describe("MainNav account flyout", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://real.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "real-anon-key";
    getUser.mockResolvedValue({ data: { user: null } });
    maybeSingle.mockResolvedValue({ data: null });
    mockPreview(false);
  });

  afterEach(() => {
    cleanup();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows four route links + an account trigger, including My Builds", () => {
    render(<MainNav />);

    expect(
      screen.getByRole("link", { name: "Configurator" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Community Gallery" }),
    ).toBeInTheDocument();
    // UAT finding 3: My Builds is back in the bar as a first-class
    // destination. It previously lived only in the account panel, behind an
    // unlabelled avatar trigger, and testers could not find where their saved
    // builds went. This assertion previously required the link to be ABSENT.
    expect(
      screen.getByRole("link", { name: "My Builds" }),
    ).toHaveAttribute("href", "/my-builds");

    const trigger = screen.getByRole("button", { name: "Account" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders a person-icon avatar (no initial) when signed out", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    render(<MainNav />);

    const trigger = screen.getByRole("button", { name: "Account" });
    // Signed out: the icon carries no text; wait a tick to prove no initial appears.
    await waitFor(() => expect(getUser).toHaveBeenCalled());
    expect(trigger).toHaveTextContent("");
    expect(trigger.querySelector("svg")).not.toBeNull();
  });

  it("renders the first initial as the avatar when signed in, and keeps the @username out of the bar", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "meg@example.com" } },
    });
    maybeSingle.mockResolvedValue({ data: { username: "meg_1a2b3c4d" } });
    mockPreview(true, []);

    render(<MainNav />);

    const trigger = screen.getByRole("button", { name: "Account" });
    // The bar shows the initial "M" (from "meg_1a2b3c4d") — not the @username.
    await waitFor(() => expect(trigger).toHaveTextContent("M"));
    expect(screen.queryByText("@meg_1a2b3c4d")).toBeNull();

    fireEvent.click(trigger);

    // Full @username surfaces only inside the opened panel.
    expect(await screen.findByText("@meg_1a2b3c4d")).toBeInTheDocument();
  });

  it("opens a signed-out panel with a Sign in link", async () => {
    mockPreview(false);

    render(<MainNav />);

    const trigger = screen.getByRole("button", { name: "Account" });
    fireEvent.click(trigger);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      await screen.findByRole("link", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();
  });

  it("shows a saved-builds preview and Sign out when signed in with builds", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "meg@example.com" } },
    });
    maybeSingle.mockResolvedValue({ data: { username: "meg_1a2b3c4d" } });
    mockPreview(true, [
      {
        id: "b1",
        title: "Lucky65 with Cabbage Tofu",
        kitId: null,
        kitName: "Lucky65",
        priceLabel: "~RM459",
        openHref: "/configurator?kit=lucky65",
      },
    ]);

    render(<MainNav />);
    fireEvent.click(screen.getByRole("button", { name: "Account" }));

    expect(
      await screen.findByText("Lucky65 with Cabbage Tofu"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/configurator?kit=lucky65",
    );
    expect(screen.getByRole("link", { name: "View all" })).toHaveAttribute(
      "href",
      "/my-builds",
    );
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("shows the empty state when signed in with no saved builds", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-2", email: "newcomer@example.com" } },
    });
    maybeSingle.mockResolvedValue({ data: null });
    mockPreview(true, []);

    render(<MainNav />);
    fireEvent.click(screen.getByRole("button", { name: "Account" }));

    expect(await screen.findByText("Your build is empty.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Configure now" }),
    ).toHaveAttribute("href", "/configurator");
    // Username still shows in the profile section (fallback to email local-part).
    expect(screen.getByText("@newcomer")).toBeInTheDocument();
  });

  it("closes the bar on Escape and returns focus to the trigger", async () => {
    render(<MainNav />);

    const trigger = screen.getByRole("button", { name: "Account" });
    fireEvent.click(trigger);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("does not read the profile when Supabase env is unconfigured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-supabase-anon-key";
    mockPreview(false);

    render(<MainNav />);
    fireEvent.click(screen.getByRole("button", { name: "Account" }));

    // Offline: the panel prompts sign-in and the browser client is never queried.
    expect(
      await screen.findByRole("link", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(getUser).not.toHaveBeenCalled();
  });
});
