/**
 * Server-side loader for a shared build link (v2 WS4).
 *
 * The code only names parts. Price, availability and fit are recomputed from
 * TODAY's catalogue, and the rule engine re-validates the build, because a
 * link may be weeks old: prices change and parts get retired.
 */
import { cache } from "react";

import {
  estimateAssemblyPrice,
  getKitDisplayName,
  getMetadataString,
} from "@/components/configurator/build-helpers";
import {
  getCatalogComponents,
  validateBuildSelectionFromIds,
} from "@/lib/components";
import type { CompatibilityResult, KeyboardComponent } from "@/lib/types";

import { decodeBuildCode } from "./build-code";
import type { RecommendationComponentIds } from "./schemas";

type Category = keyof RecommendationComponentIds;

export type SharedBuild = {
  code: string;
  componentIds: RecommendationComponentIds;
  parts: Partial<Record<Category, KeyboardComponent>>;
  // Parts named in the link that today's catalogue no longer has.
  missing: Category[];
  validation: CompatibilityResult;
  price: number | null;
  kitName: string;
  kitId: string | null;
};

const categories: Category[] = ["case", "pcb", "plate", "switch", "keycap", "stabilizer"];

// cache(): the page, its metadata and the OG image share one load per request.
export const loadSharedBuild = cache(
  async (code: string): Promise<SharedBuild | null> => {
    const componentIds = decodeBuildCode(code);

    if (!componentIds) return null;

    const catalog = await getCatalogComponents();
    const byId = new Map(catalog.map((component) => [component.id, component]));
    const parts: SharedBuild["parts"] = {};
    const missing: Category[] = [];

    for (const category of categories) {
      const component = byId.get(componentIds[category]);

      if (component?.category === category) {
        parts[category] = component;
      } else {
        missing.push(category);
      }
    }

    const validation = validateBuildSelectionFromIds({ componentIds }, catalog);
    const estimate = missing.length === 0 ? estimateAssemblyPrice(parts) : null;

    return {
      code,
      componentIds,
      parts,
      missing,
      validation,
      price: estimate?.amount ?? null,
      kitName: parts.case ? getKitDisplayName(parts.case) : "Keyboard build",
      kitId: parts.case ? getMetadataString(parts.case.metadata, "kitId") ?? null : null,
    };
  },
);

export function sharedBuildFits(build: SharedBuild) {
  return build.missing.length === 0 && build.validation.isValid;
}
