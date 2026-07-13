import Link from "next/link";

import { KitImage } from "@/components/kit-image";
import { LocalBuildsMigrator } from "@/components/local-builds-migrator";
import { MainNav } from "@/components/main-nav";
import { getSessionUser } from "@/lib/auth";
import { getCatalogComponents } from "@/lib/components";
import { summarizeGalleryBuild } from "@/lib/gallery/build-summary";
import { listSavedBuilds } from "@/lib/saved-builds/service";

import { deleteSavedBuildAction } from "./actions";

function formatEstimatedPrice(amount: number, currency: string) {
  const formatted = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
  return `~${formatted}`;
}

/**
 * Account-backed saved builds. Logged out: a quiet prompt to sign in. Logged
 * in: the user's saved_builds rows (RLS-scoped), with Open / Publish / Delete
 * per card. The old localStorage flow is migrated once via
 * <LocalBuildsMigrator/> and no longer written to.
 */
export default async function MyBuildsRoute() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-surface-secondary text-primary">
        <MainNav active="Builds" />

        <section className="mx-auto flex w-full max-w-[1024px] flex-col items-center px-4 pb-24 pt-24 text-center sm:px-6">
          <h1 className="text-display">My Builds</h1>
          <p className="mt-4 max-w-md text-base text-secondary">
            Saved builds live with your account, so they follow you across
            devices. Log in to see yours.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-pill bg-accent px-6 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              href="/login?next=/my-builds"
            >
              Log in
            </Link>
            <Link
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              href="/signup?next=/my-builds"
            >
              Create account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const [savedBuilds, catalog] = await Promise.all([
    listSavedBuilds(),
    getCatalogComponents(),
  ]);

  return (
    <main className="min-h-screen bg-surface-secondary text-primary">
      <MainNav active="Builds" />

      <header className="mx-auto flex w-full max-w-[1024px] flex-col gap-6 px-4 pb-4 pt-14 sm:px-6 md:flex-row md:items-end md:justify-between">
        <h1 className="text-display">My Builds</h1>
        <div className="md:text-right">
          <p className="max-w-sm text-h3 font-semibold text-primary">
            Your saved builds.{" "}
            <span className="text-secondary">
              Open one in the configurator or share it with the community.
            </span>
          </p>
          <Link
            className="mt-3 inline-flex h-10 items-center justify-center rounded-pill bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            href="/configurator"
          >
            Design a build
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1024px] px-4 pb-20 pt-8 sm:px-6">
        <LocalBuildsMigrator />

        {savedBuilds.length === 0 ? (
          <div className="border-t-[0.5px] border-border pt-12 text-center">
            <p className="text-h3 font-semibold text-primary">
              No saved builds yet.
            </p>
            <p className="mt-2 text-sm text-secondary">
              Design a build in the configurator and save it here.
            </p>
            <Link
              className="mt-6 inline-flex h-10 items-center justify-center rounded-pill bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              href="/configurator"
            >
              Open the configurator
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {savedBuilds.map((savedBuild) => {
              const summary = summarizeGalleryBuild(
                savedBuild.componentIds,
                catalog,
              );
              const title = savedBuild.title ?? summary.kitName ?? "Saved build";
              const priceLabel =
                savedBuild.estimatedPrice !== null &&
                savedBuild.estimatedPriceCurrency !== null
                  ? formatEstimatedPrice(
                      savedBuild.estimatedPrice,
                      savedBuild.estimatedPriceCurrency,
                    )
                  : summary.priceLabel;
              const summaryLine = [summary.kitName, priceLabel]
                .filter(Boolean)
                .join(" · ");
              const openHref = summary.kitId
                ? `/configurator?kit=${encodeURIComponent(summary.kitId)}`
                : "/configurator";

              return (
                <article
                  className="flex flex-col"
                  data-testid="saved-build-card"
                  key={savedBuild.id}
                >
                  <KitImage alt={`${title} build`} kitId={summary.kitId} />
                  <h2 className="mt-4 text-base font-semibold text-primary">
                    {title}
                  </h2>
                  {summaryLine ? (
                    <p className="mt-1 text-sm text-secondary">{summaryLine}</p>
                  ) : null}

                  <div className="mt-3 flex items-center gap-4 text-[13px] font-medium">
                    <Link
                      className="text-primary transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      href={openHref}
                    >
                      Open
                    </Link>
                    <Link
                      className="text-primary transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      href={`/community-gallery/new?from=${savedBuild.id}`}
                    >
                      Publish to Community
                    </Link>
                    <form action={deleteSavedBuildAction}>
                      <input
                        name="savedBuildId"
                        type="hidden"
                        value={savedBuild.id}
                      />
                      <button
                        className="text-secondary transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                        type="submit"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
