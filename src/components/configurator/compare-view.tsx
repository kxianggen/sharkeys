"use client";

import { X } from "lucide-react";

import {
  coreSwitchName,
  getKitDisplayName,
} from "@/components/configurator/build-helpers";
import type { CompareControls } from "@/components/configurator/use-compare";
import { compareBuilds, pickThisIf } from "@/lib/recommendations/compare";

// Side-by-side table of the builds ticked for comparison. Rows where the
// builds differ are highlighted; the last row says when to pick each one.
export function CompareView({ controls }: { controls: CompareControls }) {
  const { compared } = controls;

  if (compared.length === 0) {
    return null;
  }

  if (compared.length === 1) {
    return (
      <p
        className="rounded-lg border-[0.5px] border-dashed border-border px-4 py-3 text-sm text-secondary"
        data-testid="compare-hint"
      >
        1 build ready to compare. Tick <span className="font-semibold">Compare</span>{" "}
        on another card (a chip result counts too).
      </p>
    );
  }

  const rows = compareBuilds(compared);
  const reasons = pickThisIf(compared);
  const names = compared.map((build) => getKitDisplayName(build.components.case));

  return (
    <section aria-label="Compare builds" className="w-full">
      <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
        <h2 className="text-h2 text-primary">
          Compare. <span className="text-secondary">Spot the difference.</span>
        </h2>
        <button
          className="text-sm font-medium text-secondary underline-offset-4 hover:text-primary hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
          onClick={controls.onClear}
          type="button"
        >
          Clear
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border-[0.5px] border-border">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-[0.5px] border-border bg-surface-secondary/60">
              <th className="w-28 px-3 py-2.5 text-xs font-semibold text-secondary" scope="col">
                <span className="sr-only">Detail</span>
              </th>
              {compared.map((build, index) => (
                <th className="px-3 py-2.5 align-top" key={`${names[index]}-${index}`} scope="col">
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block font-black text-primary">{names[index]}</span>
                      {/* Same kit twice (e.g. before/after a chip) still reads
                          apart: the switch is what usually changes. */}
                      <span className="block text-xs font-medium text-secondary">
                        {coreSwitchName(build.components.switch.name)}
                      </span>
                    </span>
                    <button
                      aria-label={`Remove ${names[index]} from comparison`}
                      className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-secondary hover:bg-surface hover:text-primary focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
                      onClick={() => controls.onToggle(build)}
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className={`border-b-[0.5px] border-border ${row.differs ? "bg-accent-subtle/40" : ""}`}
                data-differs={row.differs}
                data-testid={`compare-row-${row.key}`}
                key={row.key}
              >
                <th className="px-3 py-2.5 text-xs font-semibold text-secondary" scope="row">
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td
                    className={`px-3 py-2.5 align-top ${
                      row.differs ? "font-semibold text-primary" : "text-secondary"
                    }`}
                    key={`${row.key}-${index}`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
            <tr data-testid="compare-row-pick">
              <th className="px-3 py-2.5 text-xs font-semibold text-secondary" scope="row">
                Verdict
              </th>
              {reasons.map((reason, index) => (
                <td className="px-3 py-2.5 align-top text-sm text-primary" key={`pick-${index}`}>
                  {reason}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 px-1 text-xs text-secondary">
        Highlighted rows are where these builds differ. Every build here passed
        the compatibility check.
      </p>
    </section>
  );
}
