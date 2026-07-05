// TODO(catalog-rewrite): it.skip tests below are pinned to the pre-19-part seed catalog
// (deleted component IDs + obsolete 75% aluminum blocker). Repoint fixtures to new IDs and unskip.
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { keyboardComponents } from "@/data";
import { MyBuildsPage, RecommendationDemo } from "@/components/recommendation-demo";
import {
  createRecommendationResult,
  recommendationsApiResponseSchema,
  type RecommendationResult,
} from "@/lib/recommendations";
import { extractedKeyboardIntentSchema } from "@/lib/ai";
import { keybotApiResponseSchema, type KeybotApiResponse } from "@/lib/keybot";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navigationMocks.push,
  }),
}));

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

const tklRecommendationResult = createRecommendationResult({
  source: "fallback_missing_api_key",
  error:
    "OPENAI" +
    "_API_KEY is not configured, so intent extraction used deterministic local keyword extraction.",
  intent: extractedKeyboardIntentSchema.parse({
    budget: {
      amount: 800,
      currency: "MYR",
      label: "mid_range",
    },
    layout: "tkl",
    soundProfile: null,
    useCase: "typing",
    beginnerFriendly: null,
    switchTechnology: "mechanical",
    priorities: ["sound"],
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

function getRecommendationRequestBodies() {
  return vi
    .mocked(fetch)
    .mock.calls.filter(([input]) => input.toString() === "/api/recommendations")
    .map(([, init]) => {
      if (typeof init?.body !== "string") {
        throw new Error("Expected recommendation request body to be JSON.");
      }

      return JSON.parse(init.body) as { message: string };
    });
}

function getSelect(label: string) {
  return screen.getByLabelText(label) as HTMLSelectElement;
}

function getPromptSubmitButton() {
  return within(
    screen.getByRole("form", { name: /AI keyboard prompt form/i }),
  ).getByRole("button", { name: /Design my build|Start Building/i });
}

function getSavedGallery() {
  return screen.getByRole("region", { name: /Saved builds gallery/i });
}

function openManualCheck() {
  const button = screen.queryByRole("button", { name: /Open manual check/i });

  if (button) {
    fireEvent.click(button);
  }
}

function submitConfiguratorPrompt(prompt: string) {
  fireEvent.change(screen.getByLabelText("Keyboard request"), {
    target: { value: prompt },
  });
  fireEvent.click(getPromptSubmitButton());
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
    navigationMocks.push.mockReset();
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
    container.innerHTML = renderToString(<RecommendationDemo mode="configurator" />);
    document.body.appendChild(container);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, <RecommendationDemo mode="configurator" />);
      });

      await waitFor(() => {
        expect(within(container).getByLabelText("Keyboard request")).toBeEnabled();
      });

      const consoleErrors = consoleErrorSpy.mock.calls
        .flat()
        .map(String)
        .join("\n");

      expect(consoleErrors).not.toContain("hydration");
      expect(consoleErrors).not.toContain("did not match");
      expect(consoleErrors).not.toContain("A tree hydrated");
    } finally {
      await act(async () => {
        root?.unmount();
      });
      consoleErrorSpy.mockRestore();
      container.remove();
    }
  });

  it("renders the landing route without workspace clutter", async () => {
    mockFetch();
    render(<RecommendationDemo />);

    expect(
      screen.getByRole("heading", {
        name: /Build your dream keyboard in words/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/sharkeys\./i).length).toBeGreaterThan(0);
    expect(screen.queryByText("Sharkeys")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Open Keybot assistant/i }),
    ).toHaveTextContent(/Ask Keybot/i);
    expect(screen.getByText(/How it works/i)).toBeInTheDocument();
    expect(screen.getByText(/Engineered for precision/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Configurator/i })).toHaveAttribute(
      "href",
      "/configurator",
    );
    expect(screen.getByRole("link", { name: /Browse/i })).toHaveAttribute(
      "href",
      "/browse",
    );
    expect(screen.getByRole("link", { name: /Community Gallery/i })).toHaveAttribute(
      "href",
      "/community-gallery",
    );
    expect(screen.getByRole("link", { name: /My Builds/i })).toHaveAttribute(
      "href",
      "/my-builds",
    );
    expect(screen.queryByText(/Validated keyboard workspace/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Candidate groups/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Extracted preferences/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Manual build check")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /Saved builds gallery/i }),
    ).not.toBeInTheDocument();
    const submitButton = getPromptSubmitButton();

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    expect(
      screen.getByRole("button", {
        name: /Budget creamy build/i,
      }),
    ).toBeEnabled();

    fireEvent.change(screen.getByLabelText("Keyboard request"), {
      target: { value: "Budget creamy build" },
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });

  it("navigates from landing prompt and final CTA to configurator", () => {
    mockFetch();
    render(<RecommendationDemo />);

    fireEvent.change(screen.getByLabelText("Keyboard request"), {
      target: { value: "quiet office keyboard under RM500" },
    });
    fireEvent.click(getPromptSubmitButton());

    expect(navigationMocks.push).toHaveBeenCalledWith(
      "/configurator?prompt=quiet+office+keyboard+under+RM500",
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Create your keyboard now/i }),
    );

    expect(navigationMocks.push).toHaveBeenLastCalledWith(
      "/configurator?prompt=quiet+office+keyboard+under+RM500",
    );
  });

  it("navigates landing prompt chips to configurator with prompt context", () => {
    mockFetch();
    render(<RecommendationDemo />);

    fireEvent.click(
      screen.getByRole("button", { name: /Thocky 65% build/i }),
    );

    expect(navigationMocks.push).toHaveBeenCalledWith(
      "/configurator?prompt=Thocky+65%25+build",
    );
    expect(getRecommendationRequestBodies()).toHaveLength(0);
  });

  it("renders the configurator workspace with manual validation controls", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

    expect(
      screen.getByRole("heading", { name: /Ask Meg/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("AI build control")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Open Meg assistant/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thocky/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Quiet office build/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /65% Layout/i })).toBeInTheDocument();
    expect(screen.queryByText("Manual build check")).not.toBeInTheDocument();
    expect(screen.queryByText("Request summary")).not.toBeInTheDocument();
    expect(screen.queryByText(/How it works/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /Saved builds gallery/i }),
    ).not.toBeInTheDocument();

    openManualCheck();

    await waitFor(() => {
      expect(getSelect("Case")).toBeEnabled();
    });
  });

  it("submits typed prompts through the recommendations API", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

    fireEvent.change(screen.getByLabelText("Keyboard request"), {
      target: { value: "quiet office keyboard under RM500" },
    });
    fireEvent.click(getPromptSubmitButton());

    expect(await screen.findByText("Recommended for you")).toBeInTheDocument();
    expect(getRecommendationRequestBodies().at(-1)?.message).toBe(
      "quiet office keyboard under RM500",
    );
  });

  it("submits prompt chips through the same recommendation flow", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

    fireEvent.click(
      screen.getByRole("button", { name: /Quiet office build/i }),
    );

    expect(
      await screen.findByText("Recommended for you"),
    ).toBeInTheDocument();
    expect(getRecommendationRequestBodies().at(-1)?.message).toBe(
      "Quiet office keyboard",
    );
  });

  it("opens and closes the floating Keybot assistant", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

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
    render(<RecommendationDemo mode="configurator" />);

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
    render(<RecommendationDemo mode="configurator" />);

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
    render(<RecommendationDemo mode="configurator" />);

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
    render(<RecommendationDemo mode="configurator" />);

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
    render(<RecommendationDemo mode="configurator" />);

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

  it.skip("passes selected recommendation context to Keybot", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

    submitConfiguratorPrompt("Creamy 65% under RM500");

    expect(await screen.findByText("Recommended for you")).toBeInTheDocument();
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

  it.skip("sends follow-up payload with selected recommendation and recent context", async () => {
    mockFetch([recommendationResult], { keybotDelayMs: 20 });
    render(<RecommendationDemo mode="configurator" />);

    submitConfiguratorPrompt("Creamy 65% under RM500");

    expect(await screen.findByText("Recommended for you")).toBeInTheDocument();
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
      "case_lucky65_v3_65_aluminum",
    );
  });

  it("passes manual selection context to Keybot before recommendations exist", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

    openManualCheck();

    await waitFor(() => {
      expect(getSelect("Case")).toBeEnabled();
    });
    fireEvent.change(getSelect("Case"), {
      target: { value: "case_lucky65_v3_65_aluminum" },
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
      "case_lucky65_v3_65_aluminum",
    );
  });

  it.skip("loads recommendation component IDs into the manual panel", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

    submitConfiguratorPrompt("Creamy 65% under RM500");

    expect(await screen.findByText("Recommended for you")).toBeInTheDocument();
    openManualCheck();

    expect(getSelect("Case").value).toBe("case_lucky65_v3_65_aluminum");
    expect(getSelect("PCB").value).toBe("pcb_lucky65_v3_65_hotswap");
    expect(getSelect("Plate").value).toBe("plate_lucky65_v3_65_fr4");
    expect(getSelect("Switch").value).toBe("switch_gateron_seasalt_smoothie");
    expect(getSelect("Keycap").value).toBe("keycap_unknown_pudding_oem_pbt");
    expect(getSelect("Stabilizer").value).toBe("stab_lucky65_v3_screw_in");
    expect(
      screen.getByRole("button", { name: /Validate manual build/i }),
    ).toBeEnabled();
  });

  it.skip("clears manual selections after a subsequent zero-recommendation response", async () => {
    mockFetch([recommendationResult, emptyRecommendationResult]);
    render(<RecommendationDemo mode="configurator" />);

    submitConfiguratorPrompt("Creamy 65% under RM500");

    expect(await screen.findByText("Recommended for you")).toBeInTheDocument();
    openManualCheck();

    expect(getSelect("Case").value).toBe("case_lucky65_v3_65_aluminum");

    fireEvent.change(screen.getByLabelText("Keyboard request"), {
      target: { value: "beginner friendly creamy 65% keyboard under $50" },
    });
    fireEvent.click(getPromptSubmitButton());

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

  it.skip("shows validated recommendation details and vendor-link behavior", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

    submitConfiguratorPrompt("Creamy 65% under RM500");

    expect(await screen.findByText("Recommended for you")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Technical details"));

    expect(screen.getByText(/Estimated total/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lucky65 V3/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Open vendor page")).toBeInTheDocument();
  });



  it.skip("shows compatible validation status for manual selection", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

    openManualCheck();

    await waitFor(() => {
      expect(getSelect("Case")).toBeEnabled();
    });
    fireEvent.change(getSelect("Case"), {
      target: { value: "case_lucky65_v3_65_aluminum" },
    });

    fireEvent.change(getSelect("PCB"), {
      target: { value: "pcb_lucky65_v3_65_hotswap" },
    });
    fireEvent.change(getSelect("Plate"), {
      target: { value: "plate_lucky65_v3_65_fr4" },
    });
    fireEvent.change(getSelect("Switch"), {
      target: { value: "switch_gateron_seasalt_smoothie" },
    });
    fireEvent.change(getSelect("Keycap"), {
      target: { value: "keycap_unknown_pudding_oem_pbt" },
    });
    fireEvent.change(getSelect("Stabilizer"), {
      target: { value: "stab_lucky65_v3_screw_in" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Validate manual build/i }));

    expect(await screen.findByText("Compatible build")).toBeInTheDocument();
  });

  it("does not show a fake selected preview for no-build responses", async () => {
    mockFetch([emptyRecommendationResult]);
    render(<RecommendationDemo mode="configurator" />);

    fireEvent.change(screen.getByLabelText("Keyboard request"), {
      target: { value: "75% aluminum keyboard" },
    });
    fireEvent.click(getPromptSubmitButton());

    expect(
      await screen.findByText("No validated build found"),
    ).toBeInTheDocument();
  });

  it.skip("saves the selected validated recommendation to local storage", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

    submitConfiguratorPrompt("Creamy 65% under RM500");

    expect(await screen.findByText("Recommended for you")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /^Save build$/i })[0]);

    expect(
      await screen.findByText(/saved locally/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/My Builds page/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        window.localStorage.getItem("sharkeys.savedBuilds.v1"),
      ).toContain("Lucky65 V3");
    });
  });

  it("renders the My Builds empty state", async () => {
    mockFetch();
    render(<MyBuildsPage />);

    expect(
      await screen.findByText(/No saved builds yet/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /My Builds/i })).toBeInTheDocument();
  });

  it.skip("loads a saved build from My Builds into manual selection", async () => {
    mockFetch();
    const recommendation = recommendationResult.recommendations[0];

    window.localStorage.setItem(
      "sharkeys.savedBuilds.v1",
      JSON.stringify([
        {
          id: "saved_recommendation_test",
          title: recommendation.title,
          createdAt: "2026-05-25T00:00:00.000Z",
          source: "recommendation",
          componentIds: recommendation.componentIds,
          estimatedPrice: recommendation.estimatedPrice,
          estimatedPriceCurrency: recommendation.estimatedPriceCurrency,
          validation: recommendation.validation,
        },
      ]),
    );

    render(<MyBuildsPage />);

    const gallery = getSavedGallery();

    expect(
      await within(gallery).findByText(recommendation.title),
    ).toBeInTheDocument();
    fireEvent.click(
      within(gallery).getByRole("button", { name: /Load build/i }),
    );

    expect(navigationMocks.push).toHaveBeenCalledWith(
      expect.stringContaining("/configurator?case=case_lucky65_v3_65_aluminum"),
    );
  });

  it.skip("saves a manually validated compatible build to local storage", async () => {
    mockFetch();
    render(<RecommendationDemo mode="configurator" />);

    submitConfiguratorPrompt("Creamy 65% under RM500");
    expect(await screen.findByText("Recommended for you")).toBeInTheDocument();
    openManualCheck();

    fireEvent.click(screen.getByRole("button", { name: /Validate manual build/i }));
    expect(await screen.findByText("Compatible build")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Save compatible build/i }),
    );

    expect(
      await screen.findByText(/Manual build: Lucky65 V3/i),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem("sharkeys.savedBuilds.v1")).toContain(
      "Manual build: Lucky65 V3",
    );
  });

  it("deletes saved builds from My Builds", async () => {
    mockFetch();
    const recommendation = recommendationResult.recommendations[0];

    window.localStorage.setItem(
      "sharkeys.savedBuilds.v1",
      JSON.stringify([
        {
          id: "saved_recommendation_test",
          title: recommendation.title,
          createdAt: "2026-05-25T00:00:00.000Z",
          source: "recommendation",
          componentIds: recommendation.componentIds,
          estimatedPrice: recommendation.estimatedPrice,
          estimatedPriceCurrency: recommendation.estimatedPriceCurrency,
          validation: recommendation.validation,
        },
      ]),
    );

    render(<MyBuildsPage />);

    const gallery = getSavedGallery();

    expect(
      await within(gallery).findByText(recommendation.title),
    ).toBeInTheDocument();
    fireEvent.click(within(gallery).getByRole("button", { name: /Delete/i }));

    await waitFor(() => {
      expect(within(gallery).queryByText(/Saved recommendation/i)).toBeNull();
    });
    expect(within(gallery).getByText(/No saved builds yet/i)).toBeInTheDocument();
    expect(window.localStorage.getItem("sharkeys.savedBuilds.v1")).toBe("[]");
  });
});
