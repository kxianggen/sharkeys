/**
 * Talks to the REAL app over HTTP, the same way the browser UI does (v2 WS0).
 *
 *   search → POST /api/recommendations         (the main prompt box)
 *   chat   → POST /api/keybot with UI context  (Meg's chat panel)
 *   photo  → POST /api/ai/vision-intent, then the prompt it fills in goes to
 *            /api/recommendations              (the image drop)
 *   refine → POST /api/recommendations/refine  (the chips under a build;
 *            uses the UI's own applyRefineChip, so it cannot drift)
 *
 * The context and the photo prompt mirror buildKeybotRequestContext
 * (src/components/configurator/keybot/keybot-helpers.ts) and intentToPrompt
 * (src/components/configurator/build-helpers.ts). If the UI changes those,
 * update this file too (WS4 owns the configurator components).
 */
import { readFileSync } from "node:fs";
import { extname } from "node:path";

import type { ExtractedKeyboardIntent } from "@/lib/ai";
import type { KeybotResponse } from "@/lib/keybot/schemas";
import {
  applyRefineChip,
  describeBuildChange,
  refineChipLabels,
  type RefineChip,
} from "@/lib/recommendations/refine";
import type { ComponentColour } from "@/lib/types";
import type {
  RecommendationResult,
  ValidatedRecommendationBuild,
} from "@/lib/recommendations/schemas";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AppState = {
  result: RecommendationResult | null;
  selectedIndex: number;
  chatHistory: ChatTurn[];
};

export type AppCallRecord = {
  endpoint:
    | "/api/recommendations"
    | "/api/recommendations/refine"
    | "/api/keybot"
    | "/api/ai/vision-intent";
  ms: number;
  status: number;
  source?: string;
};

export type AppReply = {
  /** What the user sees as the reply text. */
  text: string;
  calls: AppCallRecord[];
  /** IDs the app returned this turn (builds + related parts), for the invented-parts check. */
  returnedIds: string[];
  buildsChanged: boolean;
};

export const emptyAppState = (): AppState => ({
  result: null,
  selectedIndex: 0,
  chatHistory: [],
});

async function postJson<T>(
  baseUrl: string,
  endpoint: AppCallRecord["endpoint"],
  body: unknown,
): Promise<{ data: T | null; record: AppCallRecord; errorMessage?: string }> {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const ms = Math.round(performance.now() - started);
  const json = (await response.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; error: { message: string } }
    | null;

  if (!response.ok || !json || !json.success) {
    return {
      data: null,
      record: { endpoint, ms, status: response.status },
      errorMessage:
        json && !json.success ? json.error.message : `HTTP ${response.status}`,
    };
  }

  const source = (json.data as { source?: string }).source;
  return { data: json.data, record: { endpoint, ms, status: response.status, source } };
}

function buildIds(result: RecommendationResult): string[] {
  return result.recommendations.flatMap((r) => Object.values(r.componentIds));
}

/** Mirrors buildKeybotRequestContext in recommendation-demo.tsx. */
export function buildKeybotContext(state: AppState) {
  const selected = state.result?.recommendations[state.selectedIndex];
  return {
    recentMessages: state.chatHistory.slice(-6).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 1200),
    })),
    currentIntent: state.result?.intent,
    currentRecommendationIds: state.result?.recommendations
      .map((r) => r.id)
      .slice(0, 6),
    selectedComponentIds: selected?.componentIds,
  };
}

/** Mirrors intentToPrompt in recommendation-demo.tsx. */
export function intentToPrompt(intent: ExtractedKeyboardIntent): string {
  const parts: string[] = [];
  if (intent.useCase && intent.useCase !== "unknown") parts.push(`${intent.useCase} use`);
  if (intent.soundProfile) parts.push(`${intent.soundProfile} sound`);
  if (intent.switchTechnology) parts.push(`${intent.switchTechnology} switches`);
  if (intent.layout) parts.push(`${intent.layout} layout`);
  if (intent.budget?.amount) {
    parts.push(`under ${intent.budget.amount} ${intent.budget.currency ?? "MYR"}`);
  }
  if (parts.length === 0) return "A keyboard inspired by the uploaded photo";
  return `A ${parts.join(", ")} keyboard`;
}

function searchReplyText(result: RecommendationResult): string {
  if (result.recommendations.length === 0) {
    return result.clarificationPrompt ?? result.explanations[0] ?? "No builds found.";
  }
  const lines = [
    ...(result.clarificationPrompt ? [result.clarificationPrompt] : []),
    ...result.explanations.slice(0, 3),
  ];
  return lines.join("\n") || `${result.recommendations.length} builds shown.`;
}

export async function sendSearch(
  baseUrl: string,
  state: AppState,
  message: string,
): Promise<AppReply> {
  const { data, record, errorMessage } = await postJson<RecommendationResult>(
    baseUrl,
    "/api/recommendations",
    { message },
  );
  if (!data) {
    return { text: `[error: ${errorMessage}]`, calls: [record], returnedIds: [], buildsChanged: false };
  }
  state.result = data;
  state.selectedIndex = 0;
  return {
    text: searchReplyText(data),
    calls: [record],
    returnedIds: buildIds(data),
    buildsChanged: true,
  };
}

/**
 * A refine chip click (v2 WS4), exactly as the UI does it: the chip edits the
 * structured intent of the current result (applyRefineChip, shared with the
 * UI), and /api/recommendations/refine re-runs the engine. No AI call. A chip
 * that cannot change the selected build is greyed out in the UI, so it makes
 * no call here either.
 */
export async function sendRefine(
  baseUrl: string,
  state: AppState,
  chip: RefineChip,
  keycapColours?: readonly ComponentColour[],
): Promise<AppReply> {
  const base = state.result?.recommendations[state.selectedIndex];

  if (!state.result || !base) {
    return {
      text: "(There are no builds on screen yet, so there are no buttons to click.)",
      calls: [],
      returnedIds: [],
      buildsChanged: false,
    };
  }

  const intent = applyRefineChip(state.result.intent, chip, base, keycapColours);

  if (!intent) {
    return {
      text: `(The ${refineChipLabels[chip]} button is greyed out: this build already covers it.)`,
      calls: [],
      returnedIds: [],
      buildsChanged: false,
    };
  }

  const { data, record, errorMessage } = await postJson<RecommendationResult>(
    baseUrl,
    "/api/recommendations/refine",
    { intent, source: state.result.source, chip },
  );
  if (!data) {
    return { text: `[error: ${errorMessage}]`, calls: [record], returnedIds: [], buildsChanged: false };
  }

  const top = data.recommendations[0] ?? null;
  const text = `${refineChipLabels[chip]}: ${describeBuildChange(base, top)}`;

  // Same as the UI: no matching build keeps the current result on screen.
  if (!top) {
    return { text, calls: [record], returnedIds: [], buildsChanged: false };
  }

  state.result = data;
  state.selectedIndex = 0;
  return { text, calls: [record], returnedIds: buildIds(data), buildsChanged: true };
}

export async function sendChat(
  baseUrl: string,
  state: AppState,
  message: string,
): Promise<AppReply> {
  const { data, record, errorMessage } = await postJson<KeybotResponse>(
    baseUrl,
    "/api/keybot",
    { message, context: buildKeybotContext(state) },
  );
  state.chatHistory.push({ role: "user", content: message });
  if (!data) {
    return { text: `[error: ${errorMessage}]`, calls: [record], returnedIds: [], buildsChanged: false };
  }
  state.chatHistory.push({ role: "assistant", content: data.answer });
  return {
    text: data.answer,
    calls: [record],
    returnedIds: data.relatedComponentIds ?? [],
    buildsChanged: false,
  };
}

export async function sendPhoto(
  baseUrl: string,
  state: AppState,
  photoPath: string,
  message: string,
): Promise<AppReply & { filledPrompt: string }> {
  const ext = extname(photoPath).slice(1).replace("jpg", "jpeg");
  const dataUrl = `data:image/${ext};base64,${readFileSync(photoPath).toString("base64")}`;
  const vision = await postJson<{ intent: ExtractedKeyboardIntent; source: string }>(
    baseUrl,
    "/api/ai/vision-intent",
    { imageDataUrl: dataUrl, message: message.trim() || undefined },
  );
  if (!vision.data) {
    return {
      text: `[error: ${vision.errorMessage}]`,
      calls: [vision.record],
      returnedIds: [],
      buildsChanged: false,
      filledPrompt: "",
    };
  }
  const filledPrompt = intentToPrompt(vision.data.intent);
  const search = await sendSearch(baseUrl, state, filledPrompt);
  return {
    ...search,
    text: `(Photo read. Prompt box filled with: "${filledPrompt}")\n${search.text}`,
    calls: [vision.record, ...search.calls],
    filledPrompt,
  };
}

// ── What the user sees, and code checks on a build ───────────────────────────

export type BuildFacts = {
  title: string;
  totalRM: number | null;
  layout: string | null;
  connection: string | null;
  switchName: string;
  switchSound: string | null;
  switchTechnology: string | null;
  keycapName: string;
  keycapColours: string[];
  caseName: string;
};

export function buildFacts(build: ValidatedRecommendationBuild): BuildFacts {
  const c = build.components as Record<string, Record<string, unknown> | undefined>;
  const meta = (c.keycap?.metadata ?? {}) as { colour?: string[] };
  return {
    title: build.title,
    totalRM: build.estimatedPriceCurrency === "MYR" ? build.estimatedPrice : null,
    layout: ((c.case?.layouts as string[] | undefined) ?? [])[0] ?? null,
    connection: (c.pcb?.connection as string | undefined) ?? null,
    switchName: String(c.switch?.name ?? "?"),
    switchSound: (c.switch?.soundProfile as string | undefined) ?? null,
    switchTechnology: (c.switch?.switchTechnology as string | undefined) ?? null,
    keycapName: String(c.keycap?.name ?? "?"),
    keycapColours: meta.colour ?? [],
    caseName: String(c.case?.name ?? "?"),
  };
}

/** The builds panel as the persona "sees" it (top 3, like the screen). */
export function describeScreen(state: AppState): string {
  const builds = state.result?.recommendations ?? [];
  if (builds.length === 0) return "No builds on screen.";
  return builds
    .slice(0, 3)
    .map((b, i) => {
      const f = buildFacts(b);
      return `Build ${i + 1}${i === state.selectedIndex ? " (selected)" : ""}: ${f.title}, total ${
        f.totalRM === null ? "?" : `RM${Math.round(f.totalRM)}`
      }. Case ${f.caseName}; switches ${f.switchName}; keycaps ${f.keycapName}.`;
    })
    .join("\n");
}

export type HardRequirements = {
  maxTotalRM?: number;
  layout?: string;
  layoutAny?: string[];
  soundProfile?: string;
  connection?: string;
  keycapColourAny?: string[];
  mustNotRecommendProducts?: string[];
};

/** Code check of a persona's hardRequirements against the accepted build. */
export function checkHardRequirements(
  req: HardRequirements,
  facts: BuildFacts | null,
): { pass: boolean; failures: string[] } {
  const failures: string[] = [];
  const keys = Object.keys(req).filter((k) => k !== "mustNotRecommendProducts");
  if (keys.length === 0) return { pass: true, failures };
  if (!facts) return { pass: false, failures: ["no build accepted"] };

  if (req.maxTotalRM !== undefined && (facts.totalRM === null || facts.totalRM > req.maxTotalRM)) {
    failures.push(`total RM${facts.totalRM} > RM${req.maxTotalRM}`);
  }
  if (req.layout && facts.layout !== req.layout) failures.push(`layout ${facts.layout} ≠ ${req.layout}`);
  if (req.layoutAny && !req.layoutAny.includes(facts.layout ?? "")) {
    failures.push(`layout ${facts.layout} not in [${req.layoutAny.join(", ")}]`);
  }
  if (req.soundProfile && facts.switchSound !== req.soundProfile) {
    failures.push(`switch sound ${facts.switchSound} ≠ ${req.soundProfile}`);
  }
  if (req.connection && facts.connection !== req.connection) {
    failures.push(`connection ${facts.connection} ≠ ${req.connection}`);
  }
  if (req.keycapColourAny && !req.keycapColourAny.some((c) => facts.keycapColours.includes(c))) {
    failures.push(`keycap colours [${facts.keycapColours.join(", ")}] miss [${req.keycapColourAny.join(", ")}]`);
  }
  return { pass: failures.length === 0, failures };
}
