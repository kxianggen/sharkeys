import { getComponentKitId, getKitDisplayName } from "@/lib/components/kits";
import type { ComponentIdSelection, KeyboardComponent } from "@/lib/types";

// Gallery card/detail summary derived from a post's component selection and
// the real catalog only — missing fields are omitted, never invented.
export type GalleryBuildSummary = {
  kitId: string | null;
  kitName: string | null;
  // "~RM459" — summed selected-part prices, always marked as an estimate.
  priceLabel: string | null;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/**
 * Summarizes a gallery post's build: the kit it is based on (via the
 * kit-locked case component's `metadata.kitId`) and an estimated total price
 * (sum of the selected parts' catalog prices, single-currency only).
 */
export function summarizeGalleryBuild(
  componentIds: ComponentIdSelection,
  catalog: readonly KeyboardComponent[],
): GalleryBuildSummary {
  const byId = new Map(catalog.map((component) => [component.id, component]));
  const selected = Object.values(componentIds)
    .filter((id): id is string => typeof id === "string")
    .map((id) => byId.get(id))
    .filter((component): component is KeyboardComponent => Boolean(component));

  const caseComponent = selected.find(
    (component) => component.category === "case",
  );
  const kitId = caseComponent
    ? (getComponentKitId(caseComponent) ?? null)
    : null;
  const kitName = caseComponent ? getKitDisplayName(caseComponent) : null;

  const prices = selected.map((component) =>
    component.price !== undefined && component.priceCurrency !== undefined
      ? { amount: component.price, currency: component.priceCurrency }
      : null,
  );
  const [firstPrice] = prices;
  const priceLabel =
    selected.length > 0 &&
    firstPrice &&
    prices.every((price) => price && price.currency === firstPrice.currency)
      ? `~${formatMoney(
          Number(
            prices
              .reduce((total, price) => total + (price?.amount ?? 0), 0)
              .toFixed(2),
          ),
          firstPrice.currency,
        )}`
      : null;

  return { kitId, kitName, priceLabel };
}
