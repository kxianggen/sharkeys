"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { categoryLabels } from "@/components/configurator/constants";
import type { CloneState } from "@/components/configurator/use-clone";
import type { CompatibilityResult } from "@/lib/types";

// What happened when a shared build was opened with "Use this build": the
// re-check result against today's catalogue and rule engine.
export function CloneNotice({
  assemblyValidation,
  buildPrice,
  clone,
  isBuildComplete,
  isValidating,
}: {
  assemblyValidation: CompatibilityResult | null;
  buildPrice: string | null;
  clone: CloneState | null;
  isBuildComplete: boolean;
  isValidating: boolean;
}) {
  if (!clone) return null;

  if (clone.status === "loading") {
    return (
      <Box tone="info">
        <Loader2 className="mt-0.5 h-4 w-4 flex-none animate-spin" aria-hidden />
        <p>Opening the shared build and re-checking it against today&apos;s catalogue…</p>
      </Box>
    );
  }

  if (clone.status === "failed") {
    return (
      <Box tone="error">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
        <p>{clone.message}</p>
      </Box>
    );
  }

  const notes = [
    ...clone.missing.map(
      (category) =>
        `The ${categoryLabels[category].toLowerCase()} from this build is no longer in the catalogue: pick a replacement below.`,
    ),
    ...clone.replaced.map(
      ({ category, name }) =>
        `The kit's own ${categoryLabels[category].toLowerCase()} (${name}) is used.`,
    ),
  ];
  const checking = isBuildComplete && (isValidating || !assemblyValidation);
  const fits = isBuildComplete && !checking && assemblyValidation?.isValid === true;
  const errors = !checking && assemblyValidation && !assemblyValidation.isValid
    ? assemblyValidation.errors.map((issue) => issue.message)
    : [];

  let headline: string;

  if (!isBuildComplete) {
    headline = `Opened the shared ${clone.kitName} build. Some parts need choosing again.`;
  } else if (checking) {
    headline = `Opened the shared ${clone.kitName} build. Re-checking that every part fits…`;
  } else if (fits) {
    headline = `Opened the shared ${clone.kitName} build. Re-checked today: every part still fits${
      buildPrice ? ` · ${buildPrice} at today's prices` : ""
    }. Change anything below.`;
  } else {
    headline = `Opened the shared ${clone.kitName} build. Re-checked today: it no longer fits as saved. Change the part below.`;
  }

  return (
    <Box tone={fits || checking ? "info" : "error"}>
      {checking ? (
        <Loader2 className="mt-0.5 h-4 w-4 flex-none animate-spin" aria-hidden />
      ) : fits ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
      )}
      <div>
        <p className="font-semibold">{headline}</p>
        {[...notes, ...errors].length > 0 ? (
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {[...new Set([...notes, ...errors])].map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </Box>
  );
}

function Box({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "info" | "error";
}) {
  return (
    <div
      aria-live="polite"
      className={`mt-4 flex items-start gap-2 rounded-lg p-4 text-sm ${
        tone === "info" ? "bg-accent-subtle text-primary" : "bg-error/10 text-error"
      }`}
      data-testid="clone-notice"
    >
      {children}
    </div>
  );
}
