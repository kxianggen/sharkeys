import {
  categoryLabels,
  componentCategories,
} from "@/components/configurator/constants";
import type {
  ComponentCategory,
  KeybotChatMessage,
  ManualSelection,
  RecommendationBuild,
  RecommendationResult,
} from "@/components/configurator/types";
import type { KeyboardComponent } from "@/lib/types";

export const KEYBOT_WELCOME_MESSAGE: KeybotChatMessage = {
  id: "keybot-welcome",
  role: "assistant",
  content:
    "Hi, I’m Meg. Ask about switches, sound, layouts, compatibility, or your current build.",
};

export const keybotQuickActions = [
  {
    label: "What is thocky?",
    message: "What is thocky?",
  },
  {
    label: "Why this switch?",
    message: "Why did you choose this switch?",
  },
  {
    label: "Can I make it cheaper?",
    message: "Can I make it cheaper?",
  },
  {
    label: "Check compatibility",
    message: "Check compatibility for my current build",
  },
] as const;

export const keybotBlockerActions = [
  {
    label: "Try 65%",
    message: "Try a 65% layout instead",
  },
  {
    label: "Try TKL",
    message: "Try a TKL layout instead",
  },
  {
    label: "Relax budget",
    message: "Relax the budget and suggest a validated build",
  },
  {
    label: "Explain why",
    message: "Explain why that build is blocked",
  },
] as const;

export type KeybotContextSummary = {
  label: string;
  parts: string[];
  title: string;
};

export function getKeybotContextSummary({
  catalogById,
  manualSelection,
  selectedRecommendation,
}: {
  catalogById: Map<string, KeyboardComponent>;
  manualSelection: ManualSelection;
  selectedRecommendation: RecommendationBuild | null;
}): KeybotContextSummary | null {
  if (selectedRecommendation) {
    return {
      label: "Current build",
      title: selectedRecommendation.title,
      parts: ["case", "switch", "pcb"]
        .map((category) => {
          const component =
            selectedRecommendation.components[category as ComponentCategory];

          return component ? `${categoryLabels[component.category]}: ${component.name}` : null;
        })
        .filter((part): part is string => part !== null),
    };
  }

  const manualParts = componentCategories
    .map((category) => {
      const componentId = manualSelection[category];
      const component = componentId ? catalogById.get(componentId) : undefined;

      return component ? `${categoryLabels[category]}: ${component.name}` : null;
    })
    .filter((part): part is string => part !== null)
    .slice(0, 3);

  if (manualParts.length === 0) {
    return null;
  }

  return {
    label: "Current build",
    title: "Manual selection",
    parts: manualParts,
  };
}

export function splitKeybotParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

// Grounding is implicit: successful replies carry no badge. Only degraded
// answer quality (fallback, route failure) is surfaced to the user.
export function getKeybotTrustLabel(message: KeybotChatMessage) {
  if (message.isRouteFailure) {
    return "Route unavailable";
  }

  if (
    message.source === "fallback_missing_api_key" ||
    message.source === "fallback_error"
  ) {
    return "Using local grounded fallback";
  }

  return null;
}

export function isKeybotBlockerMessage(content: string) {
  return /\b(could not find|no validated build|not compatible|not currently compatible|build is blocked|blocked by|unless a future|kit-derived structural parts|locked to their original)\b/i.test(
    content,
  );
}

export function createKeybotMessageId(prefix: "assistant" | "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function buildKeybotRequestContext({
  history,
  manualSelection,
  result,
  selectedRecommendation,
}: {
  history: KeybotChatMessage[];
  manualSelection: ManualSelection;
  result: RecommendationResult | null;
  selectedRecommendation: RecommendationBuild | null;
}) {
  const selectedComponentIds =
    selectedRecommendation?.componentIds ??
    (Object.values(manualSelection).some(Boolean) ? manualSelection : undefined);

  return {
    recentMessages: history.slice(-6).map((message) => ({
      role: message.role,
      content: message.content.slice(0, 1200),
    })),
    currentIntent: result?.intent,
    currentRecommendationIds: result?.recommendations
      .map((recommendation) => recommendation.id)
      .slice(0, 6),
    selectedComponentIds,
  };
}
