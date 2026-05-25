import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BrowsePage from "@/app/browse/page";
import CommunityGalleryPage from "@/app/community-gallery/page";
import MyBuildsRoute from "@/app/my-builds/page";
import { keyboardComponents } from "@/data";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navigationMocks.push,
  }),
}));

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 200,
  });
}

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    clear: vi.fn(() => store.clear()),
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    key: vi.fn((index: number) => [...store.keys()][index] ?? null),
    get length() {
      return store.size;
    },
    removeItem: vi.fn((key: string) => store.delete(key)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
  } as Storage;
}

describe("route placeholders", () => {
  beforeEach(() => {
    navigationMocks.push.mockReset();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createLocalStorageMock(),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          success: true,
          data: {
            components: keyboardComponents,
            count: keyboardComponents.length,
          },
        }),
      ),
    );
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("renders the Browse Parts placeholder and route navigation", () => {
    render(<BrowsePage />);

    expect(
      screen.getByRole("heading", { name: /Browse Parts/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Kits")).toBeInTheDocument();
    expect(screen.getByText("Switches")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Configurator/i })).toHaveAttribute(
      "href",
      "/configurator",
    );
  });

  it("renders the Community Gallery placeholder", () => {
    render(<CommunityGalleryPage />);

    expect(
      screen.getByRole("heading", { name: /Community Gallery/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/No auth or sharing is enabled/i)).toHaveLength(3);
    expect(
      screen.getByRole("link", { name: /Create or save a build/i }),
    ).toHaveAttribute("href", "/configurator");
  });

  it("renders the My Builds route empty state", async () => {
    render(<MyBuildsRoute />);

    expect(screen.getByRole("heading", { name: /My Builds/i })).toBeInTheDocument();
    expect(
      await screen.findByText(/No saved builds yet/i),
    ).toBeInTheDocument();
  });
});
