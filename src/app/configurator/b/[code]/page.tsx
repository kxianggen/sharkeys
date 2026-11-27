import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { formatComponentPrice, formatEstimatedTotal } from "@/components/configurator/build-helpers";
import { categoryLabels } from "@/components/configurator/constants";
import { KitVisual } from "@/components/configurator/build-visual";
import { ShareButton } from "@/components/configurator/share-button";
import { MainNav } from "@/components/main-nav";
import { loadSharedBuild, sharedBuildFits } from "@/lib/recommendations/shared-build";

type Props = { params: Promise<{ code: string }> };

const categories = ["case", "pcb", "plate", "switch", "keycap", "stabilizer"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const build = await loadSharedBuild((await params).code);

  if (!build) return { title: "Build not found · sharkeys" };

  const switchName = build.parts.switch?.name;
  const price = build.price === null ? null : formatEstimatedTotal(build.price, "MYR");
  const title = `${build.kitName}${switchName ? ` with ${switchName}` : ""}`;
  const description = [
    price,
    sharedBuildFits(build) ? "every part checked to fit" : "needs a part swap",
    "Open it on sharkeys and make it yours.",
  ]
    .filter(Boolean)
    .join(" · ");

  // The image comes from ./opengraph-image.tsx in this folder.
  return {
    title: `${title} · sharkeys`,
    description,
    openGraph: { title, description, type: "website", siteName: "sharkeys" },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Public page for a shared build. No login: anyone with the link can see it.
// Everything shown is recomputed from today's catalogue and re-checked by the
// rule engine, so an old link never shows a stale price or a stale "fits".
export default async function SharedBuildPage({ params }: Props) {
  const build = await loadSharedBuild((await params).code);

  if (!build) notFound();

  const fits = sharedBuildFits(build);
  // The rule engine's own messages (it also reports parts it cannot find).
  const problems = [...new Set(build.validation.errors.map((issue) => issue.message))];

  return (
    <div className="min-h-screen bg-surface text-primary">
      <MainNav />

      <main className="mx-auto grid w-full max-w-[1100px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:py-12">
        <section aria-label="Build visual" className="min-w-0">
          <p className="text-sm font-semibold text-secondary">Shared build</p>
          <h1 className="mt-1 text-h1 text-primary">{build.kitName}</h1>
          {build.price !== null ? (
            <p className="mt-2 text-base text-secondary">
              From {formatEstimatedTotal(build.price, "MYR")}{" "}
              at today&apos;s prices
            </p>
          ) : null}

          <div className="mt-6">
            <KitVisual kitId={build.kitId} kitName={build.kitName} />
          </div>
        </section>

        <section aria-label="Build parts" className="min-w-0">
          <div
            className={`flex items-start gap-2 rounded-lg p-4 text-sm ${
              fits ? "bg-accent-subtle text-primary" : "bg-error/10 text-error"
            }`}
            data-testid="shared-build-status"
          >
            {fits ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
            )}
            <div>
              <p className="font-semibold">
                {fits
                  ? "Re-checked just now: every part still fits."
                  : "Re-checked just now: this build needs a change."}
              </p>
              {problems.length > 0 ? (
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {problems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <ul className="mt-5 divide-y-[0.5px] divide-border rounded-lg border-[0.5px] border-border">
            {categories.map((category) => {
              const part = build.parts[category];

              return (
                <li className="flex items-center justify-between gap-4 p-4" key={category}>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
                      {categoryLabels[category]}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-primary">
                      {part?.name ?? "No longer available"}
                    </p>
                  </div>
                  {part ? (
                    <span className="flex-none text-sm font-semibold text-primary">
                      {formatComponentPrice(part)}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <ShareButton
              componentIds={build.componentIds}
              label="Copy link"
              title={build.kitName}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
