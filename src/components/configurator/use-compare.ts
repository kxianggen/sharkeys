"use client";

import { useState } from "react";

import type { RecommendationBuild } from "@/components/configurator/types";
import { buildKey, maxComparedBuilds } from "@/lib/recommendations/compare";

export type CompareControls = {
  compared: RecommendationBuild[];
  isCompared: (build: RecommendationBuild) => boolean;
  isFull: boolean;
  onClear: () => void;
  onToggle: (build: RecommendationBuild) => void;
};

/**
 * Builds picked for side-by-side comparison. Snapshots, not ids: result ids
 * are per response, and keeping the whole build lets a pre-refine build be
 * compared with the one a chip produced.
 */
export function useCompare(): CompareControls {
  const [compared, setCompared] = useState<RecommendationBuild[]>([]);

  const isCompared = (build: RecommendationBuild) =>
    compared.some((item) => buildKey(item) === buildKey(build));

  const onToggle = (build: RecommendationBuild) => {
    setCompared((current) => {
      const key = buildKey(build);

      if (current.some((item) => buildKey(item) === key)) {
        return current.filter((item) => buildKey(item) !== key);
      }

      return current.length >= maxComparedBuilds ? current : [...current, build];
    });
  };

  return {
    compared,
    isCompared,
    isFull: compared.length >= maxComparedBuilds,
    onClear: () => setCompared([]),
    onToggle,
  };
}
