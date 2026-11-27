"use client";

import { ConfiguratorView } from "@/components/configurator/configurator-view";
import { LandingView } from "@/components/configurator/landing-view";

/**
 * Entry point for the landing page (`/`) and the configurator (`/configurator`).
 *
 * WS4 split this from one 4,000-line file into `src/components/configurator/`:
 * hooks own the state (use-configurator, use-build-assembly, use-catalog, ...)
 * and each screen section is its own component (request-panel,
 * recommendation-carousel, build-steps, build-visual-panel, keybot/...).
 */
type RecommendationDemoMode = "configurator" | "landing";

type RecommendationDemoProps = {
  initialKitId?: string | null;
  initialPrompt?: string | null;
  // Server-known session presence: gates saving to the account. Logged-out
  // users get a login prompt instead of a silent localStorage write.
  isAuthenticated?: boolean;
  mode?: RecommendationDemoMode;
};

export function RecommendationDemo({
  initialKitId = null,
  initialPrompt = null,
  isAuthenticated = false,
  mode = "landing",
}: RecommendationDemoProps = {}) {
  if (mode === "configurator") {
    return (
      <ConfiguratorView
        initialKitId={initialKitId}
        initialPrompt={initialPrompt}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return <LandingView />;
}
