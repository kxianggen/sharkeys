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
import { keybotApiResponseSchema, type KeybotApiResponse } from "@/lib/keybot";

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

function mockFetch(
  recommendationResponses: ApiResponseQueue = [recommendationResult],
  options: {
    keybotDelayMs?: number;
    keybotResponse?: KeybotApiResponse["data"];
    keybotShouldFail?: boolean;
  } = {},
) {
  const responses = [...recommendationResponses];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
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

      if (url === "/api/keybot") {
        void init;

        if (options.keybotDelayMs) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, options.keybotDelayMs),
          );
        }

        if (options.keybotShouldFail) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                message: "Keybot is unavailable.",
              },
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }

        return jsonResponse(
          keybotApiResponseSchema.parse({
            success: true,
            data: options.keybotResponse ?? {
              answer:
                "Thocky means a deeper rounded keyboard sound in the current catalog context.",
              source: "fallback_missing_api_key",
              usedCatalogContext: true,
              usedRecommendationEngine: false,
              relatedComponentIds: ["switch_gateron_milky_yellow_pro"],
              clarificationQuestion: null,
            },
          }),
        );
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

function getKeybotRequestBodies() {
  return vi
    .mocked(fetch)
    .mock.calls.filter(([input]) => input.toString() === "/api/keybot")
    .map(([, init]) => {
      if (typeof init?.body !== "string") {
        throw new Error("Expected Keybot request body to be a JSON string.");
      }

      return JSON.parse(init.body) as {
        context?: {
          currentIntent?: Record<string, unknown>;
          currentRecommendationIds?: string[];
          recentMessages?: Array<{
            content: string;
            role: "assistant" | "user";
          }>;
          selectedComponentIds?: Record<string, string>;
        };
        message: string;
      };
    });
}

function getLastKeybotRequestBody() {
  const bodies = getKeybotRequestBodies();
  const body = bodies.at(-1);

  if (!body) {
    throw new Error("Expected at least one Keybot request.");
  }

  return body;
}

function getSelect(label: string) {
  return screen.getByLabelText(label) as HTMLSelectElement;
}

function getSavedGallery() {
  return screen.getByRole("region", { name: /Saved builds gallery/i });
}

function getLastKeybotPanel() {
  const panels = screen.getAllByRole("region", {
    name: /Keybot keyboard helper/i,
  });

  return panels[panels.length - 1];
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
    expect(screen.getAllByText("sharkeys").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sharkeys")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Open Keybot assistant/i }),
    ).toHaveTextContent(/Ask Keybot/i);
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
    expect(openButton).toHaveTextContent(/Ask Keybot/i);
    expect(
      screen.queryByRole("region", { name: /Keybot keyboard helper/i }),
    ).not.toBeInTheDocument();
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

  it("sends quick action chips as real Keybot messages", async () => {
    mockFetch([recommendationResult], { keybotDelayMs: 20 });
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Open Keybot assistant/i,
      }),
    );

    const panel = getLastKeybotPanel();

    fireEvent.click(within(panel).getByRole("button", { name: /What is thocky/i }));

    expect(await within(panel).findAllByText("What is thocky?")).toHaveLength(2);
    expect(
      await within(panel).findByText(/deeper rounded keyboard sound/i),
    ).toBeInTheDocument();
    expect(getLastKeybotRequestBody().message).toBe("What is thocky?");
  });

  it("sends Keybot questions and renders grounded assistant responses", async () => {
    mockFetch([recommendationResult], { keybotDelayMs: 20 });
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Open Keybot assistant/i,
      }),
    );

    const panel = getLastKeybotPanel();

    fireEvent.change(within(panel).getByLabelText("Keybot question"), {
      target: { value: "What is a thocky keyboard?" },
    });
    fireEvent.click(
      within(panel).getByRole("button", {
        name: /Send Keybot question/i,
      }),
    );

    expect(
      await within(panel).findByText(/Checking catalog facts/i),
    ).toBeInTheDocument();
    expect(
      await within(panel).findByText(/deeper rounded keyboard sound/i),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText(/Using local grounded fallback/i),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText(/Gateron Milky Yellow Pro/i),
    ).toBeInTheDocument();
  });

  it("sends recent Keybot messages after a chat turn", async () => {
    mockFetch([recommendationResult], { keybotDelayMs: 20 });
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Open Keybot assistant/i,
      }),
    );

    const panel = getLastKeybotPanel();

    fireEvent.change(within(panel).getByLabelText("Keybot question"), {
      target: { value: "What is thocky?" },
    });
    fireEvent.click(
      within(panel).getByRole("button", {
        name: /Send Keybot question/i,
      }),
    );

    await within(panel).findByText(/deeper rounded keyboard sound/i);

    fireEvent.change(within(panel).getByLabelText("Keybot question"), {
      target: { value: "why that one?" },
    });
    fireEvent.click(
      within(panel).getByRole("button", {
        name: /Send Keybot question/i,
      }),
    );

    await waitFor(() => {
      expect(getKeybotRequestBodies()).toHaveLength(2);
    });

    const requestBody = getLastKeybotRequestBody();

    expect(requestBody.message).toBe("why that one?");
    expect(requestBody.context?.recentMessages?.length).toBeGreaterThanOrEqual(
      3,
    );
    expect(requestBody.context?.recentMessages?.at(-2)?.content).toBe(
      "What is thocky?",
    );
    expect(requestBody.context?.recentMessages?.at(-1)?.content).toContain(
      "Thocky means",
    );
  });

  it("highlights no-build blocker responses with suggested next actions", async () => {
    mockFetch([recommendationResult], {
      keybotResponse: {
        answer:
          "I could not find a validated build for that request in the current catalog. The catalog does not yet have a verified 75% PCB and stabilizer compatibility path.",
        clarificationQuestion: "Try allowing TKL or 65% instead.",
        relatedComponentIds: [],
        source: "fallback_missing_api_key",
        usedCatalogContext: true,
        usedRecommendationEngine: true,
      },
    });
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Open Keybot assistant/i,
      }),
    );

    const panel = getLastKeybotPanel();

    fireEvent.change(within(panel).getByLabelText("Keybot question"), {
      target: { value: "Why no 75% aluminum build?" },
    });
    fireEvent.click(
      within(panel).getByRole("button", {
        name: /Send Keybot question/i,
      }),
    );

    expect(await within(panel).findByText(/Build blocker/i)).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Try 65%/i })).toBeEnabled();
    expect(within(panel).getByRole("button", { name: /Try TKL/i })).toBeEnabled();
    expect(
      within(panel).getByText(/Using local grounded fallback/i),
    ).toBeInTheDocument();
  });

  it("shows a Keybot error fallback when the assistant route fails", async () => {
    mockFetch([recommendationResult], { keybotShouldFail: true });
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Open Keybot assistant/i,
      }),
    );

    const panel = getLastKeybotPanel();

    fireEvent.change(within(panel).getByLabelText("Keybot question"), {
      target: { value: "Can you explain this build?" },
    });
    fireEvent.click(
      within(panel).getByRole("button", {
        name: /Send Keybot question/i,
      }),
    );

    expect(
      await within(panel).findByText(/Keybot is unavailable/i),
    ).toBeInTheDocument();
    expect(
      within(panel).getByText(/could not reach Keybot just now/i),
    ).toBeInTheDocument();
    expect(within(panel).getByText(/Route unavailable/i)).toBeInTheDocument();
  });

  it("passes selected recommendation context to Keybot", async () => {
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
    fireEvent.click(
      screen.getByRole("button", {
        name: /Open Keybot assistant/i,
      }),
    );

    const panel = getLastKeybotPanel();

    expect(within(panel).getByText(/Active build context/i)).toBeInTheDocument();
    fireEvent.change(within(panel).getByLabelText("Keybot question"), {
      target: { value: "Why did you choose this switch?" },
    });
    fireEvent.click(
      within(panel).getByRole("button", {
        name: /Send Keybot question/i,
      }),
    );

    await within(panel).findByText(/deeper rounded keyboard sound/i);

    const requestBody = getLastKeybotRequestBody();

    expect(requestBody.message).toBe("Why did you choose this switch?");
    expect(requestBody.context?.currentRecommendationIds).toContain(
      recommendationResult.recommendations[0].id,
    );
    expect(requestBody.context?.currentIntent?.soundProfile).toBe("creamy");
    expect(requestBody.context?.selectedComponentIds?.switch).toBe(
      "switch_gateron_seasalt_smoothie",
    );
  });

  it("sends follow-up payload with selected recommendation and recent context", async () => {
    mockFetch([recommendationResult], { keybotDelayMs: 20 });
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Creamy sound for studying/i,
      }),
    );

    expect(
      await screen.findByText("Rule-engine validated"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: /Open Keybot assistant/i,
      }),
    );

    const panel = getLastKeybotPanel();

    fireEvent.change(within(panel).getByLabelText("Keybot question"), {
      target: { value: "why that one?" },
    });
    fireEvent.click(
      within(panel).getByRole("button", {
        name: /Send Keybot question/i,
      }),
    );

    await within(panel).findByText(/deeper rounded keyboard sound/i);

    const requestBody = getLastKeybotRequestBody();

    expect(requestBody.message).toBe("why that one?");
    expect(requestBody.context?.recentMessages?.[0]?.content).toContain(
      "Hi, I’m Keybot",
    );
    expect(requestBody.context?.currentRecommendationIds).toContain(
      recommendationResult.recommendations[0].id,
    );
    expect(requestBody.context?.selectedComponentIds?.case).toBe(
      "case_keychron_v2_max_65_abs",
    );
  });

  it("passes manual selection context to Keybot before recommendations exist", async () => {
    mockFetch();
    render(<RecommendationDemo />);

    await waitFor(() => {
      expect(getSelect("Case")).toBeEnabled();
    });
    fireEvent.change(getSelect("Case"), {
      target: { value: "case_keychron_v2_max_65_abs" },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: /Open Keybot assistant/i,
      }),
    );

    const panel = getLastKeybotPanel();

    expect(within(panel).getByText(/Manual selection/i)).toBeInTheDocument();
    fireEvent.click(
      within(panel).getByRole("button", {
        name: /Check compatibility/i,
      }),
    );

    await within(panel).findByText(/deeper rounded keyboard sound/i);

    const requestBody = getLastKeybotRequestBody();

    expect(requestBody.message).toBe("Check compatibility for my current build");
    expect(requestBody.context?.selectedComponentIds?.case).toBe(
      "case_keychron_v2_max_65_abs",
    );
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
    expect(getSelect("Case").value).toBe("case_keychron_v2_max_65_abs");
    expect(getSelect("PCB").value).toBe("pcb_keychron_v2_max_65_hotswap");
    expect(getSelect("Plate").value).toBe("plate_keychron_v2_max_65_pc");
    expect(getSelect("Switch").value).toBe("switch_gateron_seasalt_smoothie");
    expect(getSelect("Keycap").value).toBe("keycap_unknown_pudding_oem_pbt");
    expect(getSelect("Stabilizer").value).toBe("stab_keychron_v2_max_screw_in");
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
    expect(getSelect("Case").value).toBe("case_keychron_v2_max_65_abs");

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
    expect(screen.getAllByText(/Keychron V2 Max/i).length).toBeGreaterThan(0);
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
    expect(within(gallery).getByText(/RM\s*455/i)).toBeInTheDocument();
    expect(within(gallery).getAllByText("Vendor").length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(
        window.localStorage.getItem("sharkeys.savedBuilds.v1"),
      ).toContain("Keychron V2 Max");
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

    expect(getSelect("Case").value).toBe("case_keychron_v2_max_65_abs");
    expect(getSelect("PCB").value).toBe("pcb_keychron_v2_max_65_hotswap");
    expect(getSelect("Plate").value).toBe("plate_keychron_v2_max_65_pc");
    expect(getSelect("Switch").value).toBe("switch_gateron_seasalt_smoothie");
    expect(getSelect("Keycap").value).toBe("keycap_unknown_pudding_oem_pbt");
    expect(getSelect("Stabilizer").value).toBe("stab_keychron_v2_max_screw_in");

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
      within(gallery).getAllByText(/Manual build: Keychron V2 Max/i).length,
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
