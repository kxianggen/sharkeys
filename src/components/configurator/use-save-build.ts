"use client";

import { useState } from "react";

import { saveBuildAction } from "@/app/my-builds/actions";
import type {
  CompleteComponentIdSelection,
  RecommendationBuild,
  SavedBuildSource,
} from "@/components/configurator/types";
import { track } from "@/lib/analytics";

export function useSaveBuild(isAuthenticated: boolean) {
  const [savedBuildMessage, setSavedBuildMessage] = useState<string | null>(
    null,
  );
  const [saveRequiresLogin, setSaveRequiresLogin] = useState(false);
  const [isSavingBuild, setIsSavingBuild] = useState(false);

  // Account-backed save. Client-side validity checks above are UX only — the
  // server action recomputes validation from the catalog before inserting
  // (the rule engine stays the only authority). Logged-out users are prompted
  // to log in; nothing is written to localStorage anymore.
  async function saveBuildToAccount(input: {
    title: string;
    source: SavedBuildSource;
    componentIds: CompleteComponentIdSelection;
  }) {
    if (!isAuthenticated) {
      setSaveRequiresLogin(true);
      setSavedBuildMessage("Log in to save builds to your account.");
      return;
    }

    setSaveRequiresLogin(false);
    setIsSavingBuild(true);
    try {
      const saveResult = await saveBuildAction(input);
      if (saveResult.ok) {
        track("build_saved", { source: input.source, signedIn: true });
      }
      setSavedBuildMessage(
        saveResult.ok ? `${input.title} saved to your builds.` : saveResult.error,
      );
    } catch {
      setSavedBuildMessage("Could not save the build. Please try again.");
    } finally {
      setIsSavingBuild(false);
    }
  }

  function saveRecommendationBuild(recommendation: RecommendationBuild) {
    if (!recommendation.validation.isValid) {
      setSavedBuildMessage(
        "Only builds that pass deterministic validation can be saved.",
      );
      return;
    }

    void saveBuildToAccount({
      title: recommendation.title,
      source: "recommendation",
      componentIds: recommendation.componentIds,
    });
  }

  return {
    isSavingBuild,
    saveBuildToAccount,
    saveRecommendationBuild,
    savedBuildMessage,
    saveRequiresLogin,
    setSavedBuildMessage,
  };
}
