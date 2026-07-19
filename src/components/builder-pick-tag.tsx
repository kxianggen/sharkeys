import { Sparkles } from "lucide-react";

import type { KeyboardComponent } from "@/lib/types";

// A catalog record is a builder's pick when it carries metadata.builderPick.
// Honest framing: this is the builder's personal recommendation from
// experience — never presented as popularity or sales data.
export function isBuilderPick(component: KeyboardComponent | undefined): boolean {
  return component?.metadata?.builderPick === true;
}

// Understated, design-system-consistent tag. Semantic tokens only.
export function BuilderPickTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border-[0.5px] border-border bg-surface-secondary px-2 py-0.5 text-caption font-medium text-secondary ${className}`}
      data-testid="builder-pick-tag"
    >
      <Sparkles className="h-3 w-3 text-accent" aria-hidden />
      Builder&apos;s pick
    </span>
  );
}
