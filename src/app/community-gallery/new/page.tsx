import { MainNav } from "@/components/main-nav";
import { NewPostForm } from "@/components/new-post-form";
import { requireUser } from "@/lib/auth";
import { getCatalogComponents } from "@/lib/components";
import { requiredComponentCategories } from "@/lib/types";

export default async function NewPostPage() {
  await requireUser("/community-gallery/new");

  const catalog = await getCatalogComponents();
  const optionsByCategory: Record<
    string,
    { id: string; name: string; brand: string }[]
  > = {};
  for (const category of requiredComponentCategories) {
    optionsByCategory[category] = catalog
      .filter((component) => component.category === category)
      .map((component) => ({
        id: component.id,
        name: component.name,
        brand: component.brand,
      }));
  }

  return (
    <main className="min-h-screen bg-surface-secondary text-primary">
      <MainNav active="Community" />

      <section className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-8">
        <h1 className="text-3xl font-black tracking-[-0.01em] text-primary">
          Publish a build
        </h1>
        <p className="mb-8 mt-2 text-sm text-secondary">
          Pick a component for each category. Compatibility is validated
          server-side and frozen onto your post.
        </p>

        <div className="rounded-[28px] border border-white/80 bg-white/80 p-8 shadow-sm backdrop-blur">
          <NewPostForm
            categories={requiredComponentCategories}
            optionsByCategory={optionsByCategory}
          />
        </div>
      </section>
    </main>
  );
}
