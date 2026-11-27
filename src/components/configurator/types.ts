import type { CompatibilityResult, KeyboardComponent } from "@/lib/types";
import type { RecommendationsApiResponse } from "@/lib/recommendations/schemas";
import type { KeybotApiResponse } from "@/lib/keybot/schemas";

export type RecommendationResult = RecommendationsApiResponse["data"];
export type RecommendationBuild = RecommendationResult["recommendations"][number];
export type ComponentCategory = keyof RecommendationResult["candidateComponentIds"];
export type ManualSelection = Partial<Record<ComponentCategory, string>>;
export type CompleteComponentIdSelection = Record<ComponentCategory, string>;
export type CompleteComponentSelection = RecommendationBuild["components"];
export type SavedBuildSource = "recommendation" | "manual";
export type PriceEstimate = {
  amount: number;
  currency: NonNullable<KeyboardComponent["priceCurrency"]>;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    message: string;
  };
};

export type ComponentsApiResponse = {
  success: true;
  data: {
    components: KeyboardComponent[];
    count: number;
  };
};

export type ValidateBuildApiResponse = {
  success: true;
  data: {
    result: CompatibilityResult;
  };
};

export type KeybotChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isRouteFailure?: boolean;
  relatedComponentIds?: string[];
  source?: KeybotApiResponse["data"]["source"];
};
