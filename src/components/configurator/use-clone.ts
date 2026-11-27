"use client";

import { useEffect, useRef, useState } from "react";

import {
  getKitDisplayName,
  getMetadataString,
  isKitLockedComponent,
} from "@/components/configurator/build-helpers";
import { componentCategories } from "@/components/configurator/constants";
import type {
  ApiErrorResponse,
  ComponentCategory,
  ManualSelection,
  RecommendationResult,
} from "@/components/configurator/types";
import { extractedKeyboardIntentSchema } from "@/lib/ai/intent-schema";
import { track } from "@/lib/analytics";
import { decodeBuildCode } from "@/lib/recommendations/build-code";
import type { RecommendationsApiResponse } from "@/lib/recommendations/schemas";
import type { KeyboardComponent } from "@/lib/types";

export type CloneState =
  | { status: "loading" }
  | { status: "failed"; message: string }
  | {
      status: "ready";
      kitName: string;
      // Parts in the link that today's catalogue no longer has.
      missing: ComponentCategory[];
      // Kit parts the engine resolved differently from the link.
      replaced: Array<{ category: ComponentCategory; name: string }>;
    };

/**
 * Clone ("Use this build", v2 WS4). Opens the configurator pre-filled from a
 * build code. The saved build is NOT trusted: parts are looked up in today's
 * catalogue, the kit is re-assembled by the deterministic engine (refine
 * route, no AI), and the completed assembly is re-validated by the same
 * /api/builds/validate effect as any manual build. The user can then edit it.
 */
export function useClone({
  catalog,
  catalogById,
  code,
  setChosenParts,
  showResult,
}: {
  catalog: KeyboardComponent[];
  catalogById: Map<string, KeyboardComponent>;
  code: string | null;
  setChosenParts: (parts: ManualSelection) => void;
  showResult: (result: RecommendationResult) => void;
}) {
  const startedRef = useRef(false);
  const [clone, setClone] = useState<CloneState | null>(
    code ? { status: "loading" } : null,
  );

  async function runClone(buildCode: string) {
    const ids = decodeBuildCode(buildCode);
    const kitCase = ids ? catalogById.get(ids.case) : undefined;
    const kitId = kitCase ? getMetadataString(kitCase.metadata, "kitId") : undefined;

    if (!ids) {
      setClone({ status: "failed", message: "That build link is not valid." });
      return;
    }

    if (!kitCase || kitCase.category !== "case" || !kitId) {
      setClone({
        status: "failed",
        message:
          "The case in this build is no longer in the catalogue, so it cannot be rebuilt. Describe what you want instead.",
      });
      return;
    }

    try {
      const response = await fetch("/api/recommendations/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: extractedKeyboardIntentSchema.parse({
            budget: null,
            layout: kitCase.layouts[0] ?? null,
            soundProfile: null,
            useCase: "unknown",
            beginnerFriendly: null,
            switchTechnology: null,
            colour: null,
            priorities: [],
            constraints: [],
            clarificationNeeded: false,
            clarificationQuestion: null,
          }),
          // No text was interpreted: the intent is rebuilt from the link.
          // "fallback_error" is the extraction source that carries no
          // "OpenAI key is not configured" banner and no AI claim.
          source: "fallback_error",
          kitId,
        }),
      });
      const body = (await response.json()) as
        | RecommendationsApiResponse
        | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(body.success ? "Could not rebuild this build." : body.error.message);
      }

      const base = body.data.recommendations[0];

      if (!base) {
        throw new Error("No validated build could be assembled on this kit today.");
      }

      const chosen: ManualSelection = {};
      const missing: ComponentCategory[] = [];
      const replaced: Array<{ category: ComponentCategory; name: string }> = [];

      for (const category of componentCategories) {
        if (category === "case") continue;

        const wanted = catalogById.get(ids[category]);
        const isChoice = !isKitLockedComponent(base.components[category]);

        if (!wanted || wanted.category !== category) {
          missing.push(category);
        } else if (isChoice) {
          chosen[category] = wanted.id;
        } else if (base.componentIds[category] !== wanted.id) {
          replaced.push({ category, name: base.components[category].name });
        }
      }

      showResult(body.data);
      setChosenParts(chosen);
      setClone({
        status: "ready",
        kitName: getKitDisplayName(kitCase),
        missing,
        replaced,
      });
      track("build_cloned");
    } catch (caughtError) {
      setClone({
        status: "failed",
        message:
          caughtError instanceof Error ? caughtError.message : "Could not rebuild this build.",
      });
    }
  }

  useEffect(() => {
    if (!code || startedRef.current || catalog.length === 0) {
      return;
    }

    startedRef.current = true;
    void runClone(code);
    // One-time route handoff; catalogue arrival is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, catalog]);

  return { clone, dismissClone: () => setClone(null) };
}
