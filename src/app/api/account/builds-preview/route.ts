import { z } from "zod";

import { jsonOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { getCatalogComponents } from "@/lib/components";
import { summarizeGalleryBuild } from "@/lib/gallery/build-summary";
import { listSavedBuilds } from "@/lib/saved-builds/service";

// The account flyout is a client island; it cannot read the RLS-scoped
// saved_builds table or the catalog directly. This route is the single bridge:
// it reuses the *same* server data source as /my-builds (listSavedBuilds +
// summarizeGalleryBuild over the real catalog) and returns a lean preview.
// Never a new/parallel data source — just a projection of the existing one.
export const dynamic = "force-dynamic";

const PREVIEW_LIMIT = 4;

const buildsPreviewResponseSchema = z.object({
  loggedIn: z.boolean(),
  builds: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      kitId: z.string().nullable(),
      kitName: z.string().nullable(),
      priceLabel: z.string().nullable(),
      openHref: z.string(),
    }),
  ),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return jsonOk(buildsPreviewResponseSchema, { loggedIn: false, builds: [] });
  }

  const [savedBuilds, catalog] = await Promise.all([
    listSavedBuilds(PREVIEW_LIMIT),
    getCatalogComponents(),
  ]);

  const builds = savedBuilds.map((savedBuild) => {
    const summary = summarizeGalleryBuild(savedBuild.componentIds, catalog);
    const priceLabel =
      savedBuild.estimatedPrice !== null &&
      savedBuild.estimatedPriceCurrency !== null
        ? `~${new Intl.NumberFormat("en-MY", {
            style: "currency",
            currency: savedBuild.estimatedPriceCurrency,
            maximumFractionDigits: savedBuild.estimatedPrice % 1 === 0 ? 0 : 2,
          }).format(savedBuild.estimatedPrice)}`
        : summary.priceLabel;

    return {
      id: savedBuild.id,
      title: savedBuild.title ?? summary.kitName ?? "Saved build",
      kitId: summary.kitId,
      kitName: summary.kitName,
      priceLabel,
      // Same preselect flow the /my-builds "Open" uses.
      openHref: summary.kitId
        ? `/configurator?kit=${encodeURIComponent(summary.kitId)}`
        : "/configurator",
    };
  });

  return jsonOk(buildsPreviewResponseSchema, { loggedIn: true, builds });
}
