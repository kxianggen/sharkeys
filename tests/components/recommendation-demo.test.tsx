import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { keyboardComponents } from "@/data";
import { RecommendationDemo } from "@/components/recommendation-demo";
import {
  createRecommendationResult,
  recommendationsApiResponseSchema,
  type RecommendationResult,
} from "@/lib/recommendations";
import { extractedKeyboardIntentSchema } from "@/lib/ai";

const recommendationResult = createRecommendationResult({
  source: "fallback_missing_api_key",
  error:
    "OPENAI_API_KEY is not configured, so intent extraction used deterministic local keyword extraction.",
  intent: extractedKeyboardIntentSchema.parse({
    budget: {
      amount: 500,
      currency: "MYR",
      label: "mid_range",
    },
    layout: "65",
    soundProfile: "creamy",
    useCase: "typing",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    priorities: ["sound", "beginner_friendly"],
    constraints: [],
    clarificationNeeded: false,
    clarificationQuestion: null,
  }),
});

const emptyRecommendationResult = createRecommendationResult({
  source: "fallback_missing_api_key",
  error:
    "OPENAI_API_KEY is not configured, so intent extraction used deterministic local keyword extraction.",
  intent: extractedKeyboardIntentSchema.parse({
    budget: {
      amount: 50,
      currency: "USD",
      label: "budget",
    },
    layout: "65",
    soundProfile: "creamy",
    useCase: "typing",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    priorities: ["budget", "sound", "beginner_friendly"],
    constraints: [],
    clarificationNeeded: false,
    clarificationQuestion: null,
  }),
});

type ApiResponseQueue = RecommendationResult[];

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function mockFetch(recommendationResponses: ApiResponseQueue = [recommendationResult]) {
  const responses = [...recommendationResponses];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();

      if (url === "/api/components") {
        return jsonResponse({
          success: true,
          data: {
            components: keyboardComponents,
            count: keyboardComponents.length,
          },
        });
      }

      if (url === "/api/recommendations") {
        const data = responses.shift() ?? recommendationResponses.at(-1);

        return jsonResponse(
          recommendationsApiResponseSchema.parse({
            success: true,
            data,
          }),
        );
      }

      if (url === "/api/builds/validate") {
        return jsonResponse({
          success: true,
          data: {
            result: recommendationResult.recommendations[0].validation,
          },
        });
      }

      return jsonResponse({
        success: false,
        error: {
          message: `Unhandled test URL: ${url}`,
        },
      });
    }),
  );
}

function getSelect(label: string) {
  return screen.getByLabelText(label) as HTMLSelectElement;
}

function getSavedGallery() {
  return screen.getByRole("region", { name: /Saved builds gallery/i });
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

describe("RecommendationDemo", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createLocalStorageMock(),
    });
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("hydrates without disabled-control mismatch warnings", async () => {
    mockFetch();
    const container = document.createElement("div");
    container.innerHTML = renderToString(<RecommendationDemo />);
    document.body.appendChild(container);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    let root: ReturnType<typeof hydrateRoot> | undefined;

    await act(async () => {
      root = hydrateRoot(container, <RecommendationDemo />);
    });

    await waitFor(() => {
      expect(within(container).getByLabelText("Case")).toBeEnabled();
    });

    const consoleErrors = consoleErrorSpy.mock.calls
      .flat()
      .map(String)
      .join("\n");

    expect(consoleErrors).not.toContain("hydration");
    expect(consoleErrors).not.toContain("did not match");
    expect(consoleErrors).not.toContain("A tree hydrated");

    await act(async () => {
      root?.unmount();
    });
    consoleErrorSpy.mockRestore();
    container.remove();
  });

  it("renders controls without hydration-sensitive disabled gating", async () => {
    mockFetch();
    render(<RecommendationDemo />);

    expect(
      screen.getByRole("heading", {
        name: /Build your dream keyboard in a few words/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Keybot").length).toBeGreaterThan(0);
    expect(screen.getByText(/The intelligent way to build/i)).toBeInTheDocument();
    expect(screen.getByText("Manual build check")).toBeInTheDocument();
    const submitButton = screen.getByRole("button", {
      name: /Find validated builds/i,
    });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    expect(
      screen.getByRole("button", {
        name: /Creamy sound for studying/i,
      }),
    ).toBeEnabled();

    fireEvent.change(screen.getByLabelText("Keyboard request"), {
      target: { value: "Creamy sound for studying" },
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await waitFor(() => {
      expect(getSelect("Case")).toBeEnabled();
    });
  });

  it("opens and closes the floating Keybot assistant", async () => {
    mockFetch();
    render(<RecommendationDemo />);

    const openButton = screen.getByRole("button", {
      name: /Open Keybot assistant/i,
    });

    expect(openButton).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Close Keybot assistant/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(openButton);

    const closeButton = screen.getByRole("button", {
      name: /Close Keybot assistant/i,
    });

    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    expect(
      screen.getByRole("button", { name: /Open Keybot assistant/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Close Keybot assistant/i }),
    ).not.toBeInTheDocument();
  });

  it("loads recommendation component IDs into the manual panel", async () => {
    mockFetch();
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Creamy sound for studying/i,
      }),
    );

    expect(
      await screen.findByText("Rule-engine validated"),
    ).toBeInTheDocument();
    expect(getSelect("Case").value).toBe("case_zuoya_gmk67_v2_kit_case");
    expect(getSelect("PCB").value).toBe("pcb_zuoya_gmk67_v2_hotswap");
    expect(getSelect("Plate").value).toBe("plate_zuoya_gmk67_v2_pc");
    expect(getSelect("Switch").value).toBe("switch_gateron_milky_yellow_pro");
    expect(getSelect("Keycap").value).toBe("keycap_mecha_bow_cherry_pbt");
    expect(getSelect("Stabilizer").value).toBe("stab_zuoya_gmk67_plate_mount");
    expect(
      screen.getByRole("button", { name: /Validate manual build/i }),
    ).toBeEnabled();
  });

  it("clears manual selections after a subsequent zero-recommendation response", async () => {
    mockFetch([recommendationResult, emptyRecommendationResult]);
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Creamy sound for studying/i,
      }),
    );

    expect(
      await screen.findByText("Rule-engine validated"),
    ).toBeInTheDocument();
    expect(getSelect("Case").value).toBe("case_zuoya_gmk67_v2_kit_case");

    fireEvent.change(screen.getByLabelText("Keyboard request"), {
      target: { value: "beginner friendly creamy 65% keyboard under $50" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Find validated builds/i }));

    expect(
      await screen.findByText("No validated build found"),
    ).toBeInTheDocument();
    expect(getSelect("Case").value).toBe("");
    expect(getSelect("PCB").value).toBe("");
    expect(getSelect("Plate").value).toBe("");
    expect(getSelect("Switch").value).toBe("");
    expect(getSelect("Keycap").value).toBe("");
    expect(getSelect("Stabilizer").value).toBe("");
    expect(
      screen.getByRole("button", { name: /Validate manual build/i }),
    ).toBeDisabled();
  });

  it("shows validated recommendation details and vendor-link behavior", async () => {
    mockFetch();
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Creamy sound for studying/i,
      }),
    );

    expect(
      await screen.findByText("Rule-engine validated"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Estimated total/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Zuoya GMK67/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Open vendor page")).toBeInTheDocument();
  });

  it("saves the selected validated recommendation to the local gallery", async () => {
    mockFetch();
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Creamy sound for studying/i,
      }),
    );

    expect(
      await screen.findByText("Rule-engine validated"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Save build$/i }));

    const gallery = getSavedGallery();

    expect(
      await within(gallery).findByText(/Saved recommendation/i),
    ).toBeInTheDocument();
    expect(within(gallery).getByText(/RM 390.10/i)).toBeInTheDocument();
    expect(within(gallery).getAllByText("Vendor").length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(
        window.localStorage.getItem("sharkeys.savedBuilds.v1"),
      ).toContain("Zuoya GMK67");
    });
  });

  it("loads a saved build into the manual panel and validates it", async () => {
    mockFetch([recommendationResult, emptyRecommendationResult]);
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Creamy sound for studying/i,
      }),
    );
    expect(
      await screen.findByText("Rule-engine validated"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Save build$/i }));
    expect(
      await within(getSavedGallery()).findByText(/Saved recommendation/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Keyboard request"), {
      target: { value: "beginner friendly creamy 65% keyboard under $50" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Find validated builds/i }));
    expect(
      await screen.findByText("No validated build found"),
    ).toBeInTheDocument();
    expect(getSelect("Case").value).toBe("");

    fireEvent.click(within(getSavedGallery()).getByRole("button", {
      name: /Load build/i,
    }));

    expect(getSelect("Case").value).toBe("case_zuoya_gmk67_v2_kit_case");
    expect(getSelect("PCB").value).toBe("pcb_zuoya_gmk67_v2_hotswap");
    expect(getSelect("Plate").value).toBe("plate_zuoya_gmk67_v2_pc");
    expect(getSelect("Switch").value).toBe("switch_gateron_milky_yellow_pro");
    expect(getSelect("Keycap").value).toBe("keycap_mecha_bow_cherry_pbt");
    expect(getSelect("Stabilizer").value).toBe("stab_zuoya_gmk67_plate_mount");

    fireEvent.click(screen.getByRole("button", { name: /Validate manual build/i }));
    expect(await screen.findByText("Compatible build")).toBeInTheDocument();
  });

  it("saves a manually validated compatible build", async () => {
    mockFetch();
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Creamy sound for studying/i,
      }),
    );
    expect(
      await screen.findByText("Rule-engine validated"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Validate manual build/i }));
    expect(await screen.findByText("Compatible build")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Save compatible build/i }),
    );

    const gallery = getSavedGallery();

    expect(
      await within(gallery).findByText(/Saved manual/i),
    ).toBeInTheDocument();
    expect(
      within(gallery).getAllByText(/Manual build: Zuoya GMK67/i).length,
    ).toBeGreaterThan(0);
  });

  it("deletes saved builds from the local gallery", async () => {
    mockFetch();
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Creamy sound for studying/i,
      }),
    );
    expect(
      await screen.findByText("Rule-engine validated"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Save build$/i }));

    const gallery = getSavedGallery();

    expect(
      await within(gallery).findByText(/Saved recommendation/i),
    ).toBeInTheDocument();
    fireEvent.click(within(gallery).getByRole("button", { name: /Delete/i }));

    await waitFor(() => {
      expect(within(gallery).queryByText(/Saved recommendation/i)).toBeNull();
    });
    expect(within(gallery).getByText(/No saved builds yet/i)).toBeInTheDocument();
    expect(window.localStorage.getItem("sharkeys.savedBuilds.v1")).toBe("[]");
  });
});
