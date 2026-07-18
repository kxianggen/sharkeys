import { MainNav } from "@/components/main-nav";
import { NewPostForm } from "@/components/new-post-form";
import type { PartOption } from "@/components/build-picker";
import { requireUser } from "@/lib/auth";
import { getCatalogComponents } from "@/lib/components";
import { deriveKitOptions, getComponentKitId } from "@/lib/components/kits";
import { getSavedBuild } from "@/lib/saved-builds/service";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>;
}) {
  await requireUser("/community-gallery/new");

  const catalog = await getCatalogComponents();
  const kitOptions = deriveKitOptions(catalog);

  const toPartOptions = (category: "switch" | "keycap"): PartOption[] =>
    catalog
      .filter((component) => component.category === category)
      .map((component) => ({
        id: component.id,
        name: component.name,
        brand: component.brand,
      }));

  const switchOptions = toPartOptions("switch");
  const keycapOptions = toPartOptions("keycap");

  // ?from=<savedBuildId> pre-fills from one of the user's saved builds. RLS
  // scopes the read to the owner, so a foreign/unknown id falls back to empty.
  const { from } = (searchParams ? await searchParams : {}) as { from?: string };
  const savedBuild = from ? await getSavedBuild(from) : null;

  const byId = new Map(catalog.map((component) => [component.id, component]));
  const savedIds = savedBuild?.componentIds ?? {};
  const caseComponent = savedIds.case ? byId.get(savedIds.case) : undefined;
  const initialKitId = caseComponent
    ? (getComponentKitId(caseComponent) ?? undefined)
    : undefined;

  return (
    <main className="min-h-screen bg-surface-secondary text-primary">
      <MainNav active="Community" />

      <section className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-8">
        <h1 className="text-3xl font-black tracking-[-0.01em] text-primary">
          Publish a build
        </h1>
        <p className="mb-8 mt-2 text-sm text-secondary">
          Share a thought, or attach a build. When you attach one, its
          compatibility is validated server-side and frozen onto your post.
        </p>

        <div className="rounded-[28px] border border-white/80 bg-white/80 p-8 shadow-sm backdrop-blur">
          <NewPostForm
            initialKeycapId={savedIds.keycap ?? undefined}
            initialKitId={initialKitId}
            initialStabilizerId={savedIds.stabilizer ?? undefined}
            initialSwitchId={savedIds.switch ?? undefined}
            initialTitle={savedBuild?.title ?? undefined}
            keycapOptions={keycapOptions}
            kitOptions={kitOptions}
            switchOptions={switchOptions}
          />
        </div>
      </section>
    </main>
  );
}
