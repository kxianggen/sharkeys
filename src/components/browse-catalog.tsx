"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleDot, Keyboard, LayoutGrid, Wrench, X } from "lucide-react";

import { BuilderPickTag, isBuilderPick } from "@/components/builder-pick-tag";
import { SwatchDots } from "@/components/swatch-dots";
import type { ComponentCategory, KeyboardComponent } from "@/lib/types";

/* ===========================================================================
   Data derivation — everything below reads real catalog records only.
   Missing fields are omitted, never invented.
   =========================================================================== */

type KitProduct = {
  kitId: string;
  name: string;
  layout: string | undefined;
  caseComponent: KeyboardComponent;
  pcbComponent: KeyboardComponent | undefined;
  parts: KeyboardComponent[];
  // `isEstimate` marks a summed-parts total; vendor-observed kit prices are exact.
  price: { amount: number; currency: string; isEstimate: boolean } | null;
};

export type BrowseItem =
  | { type: "kit"; kit: KitProduct }
  | { type: "part"; component: KeyboardComponent };

function getMetadataString(
  metadata: KeyboardComponent["metadata"],
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" ? value : undefined;
}

function getMetadataNumber(
  metadata: KeyboardComponent["metadata"],
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "number" ? value : undefined;
}

function getMetadataStringArray(
  metadata: KeyboardComponent["metadata"],
  key: string,
) {
  const value = metadata?.[key];

  return Array.isArray(value) &&
    value.every((entry): entry is string => typeof entry === "string")
    ? value
    : undefined;
}

function isKitLockedComponent(component: KeyboardComponent | undefined) {
  return component?.metadata?.kitLock === true;
}

// Same display-name rule the configurator uses: prefer the catalog's
// observedKitName; otherwise the kit-derived case name reads
// "<Kit> <layout> <material> Case", so everything from the layout token
// onward is descriptor, not kit name.
function getKitDisplayName(caseComponent: KeyboardComponent) {
  const observedKitName = getMetadataString(
    caseComponent.metadata,
    "observedKitName",
  );

  if (observedKitName) {
    return observedKitName;
  }

  const name = caseComponent.name;
  const layoutToken = name.match(/\s+(\d{2,3}%|Full[- ]Size|TKL|1800)\b/i);

  if (layoutToken?.index) {
    return name.slice(0, layoutToken.index).trim();
  }

  const stripped = name
    .replace(
      /\b(CNC|Aluminum|Aluminium|ABS|Plastic|Polycarbonate|Acrylic|Case)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();

  return stripped || name;
}

function deriveKitPrice(
  caseComponent: KeyboardComponent,
  parts: KeyboardComponent[],
): KitProduct["price"] {
  const observedPrice = getMetadataNumber(
    caseComponent.metadata,
    "observedKitPrice",
  );
  const observedCurrency = getMetadataString(
    caseComponent.metadata,
    "observedCurrency",
  );

  if (observedPrice !== undefined && observedCurrency) {
    return { amount: observedPrice, currency: observedCurrency, isEstimate: false };
  }

  const prices = parts.map((part) =>
    part.price !== undefined && part.priceCurrency !== undefined
      ? { amount: part.price, currency: part.priceCurrency }
      : null,
  );
  const [firstPrice] = prices;

  if (
    !firstPrice ||
    prices.some((price) => !price || price.currency !== firstPrice.currency)
  ) {
    return null;
  }

  return {
    amount: Number(
      prices.reduce((total, price) => total + (price?.amount ?? 0), 0).toFixed(2),
    ),
    currency: firstPrice.currency,
    isEstimate: true,
  };
}

// Kits are groupings of kit-locked structural parts sharing a kitId. A kit
// needs its case record to exist (the anchor the configurator starts from).
export function deriveKits(
  components: readonly KeyboardComponent[],
): KitProduct[] {
  const partsByKit = new Map<string, KeyboardComponent[]>();

  for (const component of components) {
    const kitId = getMetadataString(component.metadata, "kitId");

    if (!isKitLockedComponent(component) || !kitId) {
      continue;
    }

    const parts = partsByKit.get(kitId) ?? [];
    parts.push(component);
    partsByKit.set(kitId, parts);
  }

  const kits: KitProduct[] = [];

  for (const [kitId, parts] of partsByKit) {
    const caseComponent = parts.find((part) => part.category === "case");

    if (!caseComponent || caseComponent.category !== "case") {
      continue;
    }

    kits.push({
      kitId,
      name: getKitDisplayName(caseComponent),
      layout: caseComponent.layouts[0],
      caseComponent,
      pcbComponent: parts.find((part) => part.category === "pcb"),
      parts,
      price: deriveKitPrice(caseComponent, parts),
    });
  }

  return kits.sort((a, b) => a.name.localeCompare(b.name));
}

/* ===========================================================================
   Formatting — real fields only; anything missing is dropped from the line.
   =========================================================================== */

const layoutLabels: Record<string, string> = {
  "60": "60%",
  "65": "65%",
  "75": "75%",
  tkl: "TKL",
  full: "Full-size",
  "1800": "1800",
};

const keycapProfileLabels: Record<string, string> = {
  cherry: "Cherry",
  oem: "OEM",
  xda: "XDA",
  sa: "SA",
  dsa: "DSA",
};

const stabilizerTypeLabels: Record<string, string> = {
  plate_mount: "Plate mount",
  screw_in: "Screw-in",
  pcb_mount: "PCB mount",
};

const connectionLabels: Record<string, string> = {
  wired: "Wired",
  wireless: "Wireless",
  both: "Wired + wireless",
};

function layoutLabel(layout: string | undefined) {
  return layout ? layoutLabels[layout] ?? layout : undefined;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

// "~" marks estimates (summed kit parts); exact catalog prices stay bare.
function kitPriceLabel(kit: KitProduct) {
  if (!kit.price) {
    return null;
  }

  const money = formatMoney(kit.price.amount, kit.price.currency);

  return kit.price.isEstimate ? `~${money}` : money;
}

function partPriceLabel(component: KeyboardComponent) {
  if (component.price === undefined || component.priceCurrency === undefined) {
    return null;
  }

  const money = formatMoney(component.price, component.priceCurrency);

  return component.category === "switch" ? `${money} / switch` : money;
}

// Linear/Tactile/Clicky is stated in every catalog switch name; parsing the
// name is reading real data, not inferring specs.
function getSwitchType(component: KeyboardComponent) {
  if (/\bclicky\b/i.test(component.name)) return "Clicky";
  if (/\btactile\b/i.test(component.name)) return "Tactile";
  if (/\blinear\b/i.test(component.name)) return "Linear";
  return undefined;
}

function kitSpecLine(kit: KitProduct) {
  return [
    layoutLabel(kit.layout),
    kit.pcbComponent?.category === "pcb" && kit.pcbComponent.hotswap
      ? "Hot-swap"
      : undefined,
    kit.pcbComponent?.category === "pcb"
      ? connectionLabels[kit.pcbComponent.connection ?? ""]
      : undefined,
  ]
    .filter(Boolean)
    .join(" · ");
}

function partSpecLine(component: KeyboardComponent) {
  switch (component.category) {
    case "switch":
      return [
        getSwitchType(component),
        component.soundProfile ? capitalize(component.soundProfile) : undefined,
        component.actuationForceG !== undefined
          ? `${component.actuationForceG}g`
          : undefined,
        component.pinCount !== undefined
          ? `${component.pinCount}-pin`
          : undefined,
      ]
        .filter(Boolean)
        .join(" · ");
    case "keycap":
      return [
        `${
          keycapProfileLabels[component.keycapProfile] ??
          capitalize(component.keycapProfile)
        } profile`,
        component.layoutSupport.length > 0
          ? `${component.layoutSupport.length} layouts`
          : undefined,
      ]
        .filter(Boolean)
        .join(" · ");
    case "stabilizer":
      return [
        stabilizerTypeLabels[component.stabilizerType] ??
          component.stabilizerType,
        component.supportedSizes.join(", "),
      ]
        .filter(Boolean)
        .join(" · ");
    default:
      return "";
  }
}

/* ===========================================================================
   Section config — data-driven so new categories (cases, PCBs...) are one
   more entry, not a page restructure.
   =========================================================================== */

type BrowseCatalogData = {
  kits: KitProduct[];
  componentsByCategory: Partial<Record<ComponentCategory, KeyboardComponent[]>>;
};

type FilterOption = {
  id: string;
  label: string;
  matches: (item: BrowseItem) => boolean;
};

type BrowseSectionConfig = {
  id: string;
  heading: string;
  tagline: string;
  icon: typeof Keyboard;
  getItems: (data: BrowseCatalogData) => BrowseItem[];
  // Only options that match at least one loaded product are returned; a
  // section with fewer than two options renders no pill row at all.
  getFilterOptions: (items: BrowseItem[]) => FilterOption[];
};

// Parts sections list aftermarket components only — kit-locked parts ship
// inside their kit and surface on the kit card / kit details instead.
function aftermarketParts(
  data: BrowseCatalogData,
  category: ComponentCategory,
): BrowseItem[] {
  return (data.componentsByCategory[category] ?? [])
    .filter((component) => !isKitLockedComponent(component))
    .map((component) => ({ type: "part", component }));
}

function presentOptions(
  items: BrowseItem[],
  options: FilterOption[],
): FilterOption[] {
  return options.filter((option) => items.some(option.matches));
}

export const browseSections: BrowseSectionConfig[] = [
  {
    id: "kits",
    heading: "Kits.",
    tagline: "Start with a barebones.",
    icon: Keyboard,
    getItems: (data) => data.kits.map((kit) => ({ type: "kit", kit })),
    getFilterOptions: (items) =>
      presentOptions(
        items,
        Object.entries(layoutLabels).map(([layout, label]) => ({
          id: `layout-${layout}`,
          label,
          matches: (item) => item.type === "kit" && item.kit.layout === layout,
        })),
      ),
  },
  {
    id: "switches",
    heading: "Switches.",
    tagline: "The feel and the sound.",
    icon: CircleDot,
    getItems: (data) => aftermarketParts(data, "switch"),
    getFilterOptions: (items) =>
      presentOptions(items, [
        ...["Linear", "Tactile", "Clicky"].map((type) => ({
          id: `type-${type.toLowerCase()}`,
          label: type,
          matches: (item: BrowseItem) =>
            item.type === "part" && getSwitchType(item.component) === type,
        })),
        {
          id: "type-silent",
          label: "Silent",
          matches: (item) =>
            item.type === "part" &&
            item.component.category === "switch" &&
            item.component.soundProfile === "silent",
        },
      ]),
  },
  {
    id: "keycaps",
    heading: "Keycaps.",
    tagline: "Make it yours.",
    icon: LayoutGrid,
    getItems: (data) => aftermarketParts(data, "keycap"),
    getFilterOptions: (items) =>
      presentOptions(
        items,
        Object.entries(keycapProfileLabels).map(([profile, label]) => ({
          id: `profile-${profile}`,
          label,
          matches: (item) =>
            item.type === "part" &&
            item.component.category === "keycap" &&
            item.component.keycapProfile === profile,
        })),
      ),
  },
  {
    id: "stabilizers",
    heading: "Stabilizers.",
    tagline: "Steady the big keys.",
    icon: Wrench,
    getItems: (data) => aftermarketParts(data, "stabilizer"),
    getFilterOptions: (items) =>
      presentOptions(
        items,
        Object.entries(stabilizerTypeLabels).map(([type, label]) => ({
          id: `mount-${type}`,
          label,
          matches: (item) =>
            item.type === "part" &&
            item.component.category === "stabilizer" &&
            item.component.stabilizerType === type,
        })),
      ),
  },
];

/* ===========================================================================
   UI
   =========================================================================== */

export function BrowseCatalog({
  components,
}: {
  components: KeyboardComponent[];
}) {
  const data = useMemo<BrowseCatalogData>(() => {
    const componentsByCategory: BrowseCatalogData["componentsByCategory"] = {};

    for (const component of components) {
      const list = componentsByCategory[component.category] ?? [];
      list.push(component);
      componentsByCategory[component.category] = list;
    }

    return { kits: deriveKits(components), componentsByCategory };
  }, [components]);

  const [detailItem, setDetailItem] = useState<BrowseItem | null>(null);

  return (
    <div className="mx-auto w-full max-w-[1024px] px-4 pb-20 sm:px-6">
      {/* Category shortcut row (Apple Store thumbnail rail, adapted). */}
      <nav
        aria-label="Catalog categories"
        className="flex gap-8 overflow-x-auto border-b-[0.5px] border-border py-8"
      >
        {browseSections.map((section) => (
          <a
            className="flex flex-none flex-col items-center gap-2 text-caption font-medium text-secondary transition-colors hover:text-primary"
            href={`#${section.id}`}
            key={section.id}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
              <section.icon className="h-6 w-6 text-primary" aria-hidden />
            </span>
            {section.heading.replace(/\.$/, "")}
          </a>
        ))}
      </nav>

      {browseSections.map((section) => (
        <BrowseSection
          key={section.id}
          config={section}
          data={data}
          onShowDetails={setDetailItem}
        />
      ))}

      {detailItem ? (
        <DetailDialog item={detailItem} onClose={() => setDetailItem(null)} />
      ) : null}
    </div>
  );
}

function BrowseSection({
  config,
  data,
  onShowDetails,
}: {
  config: BrowseSectionConfig;
  data: BrowseCatalogData;
  onShowDetails: (item: BrowseItem) => void;
}) {
  const items = useMemo(() => config.getItems(data), [config, data]);
  const filterOptions = useMemo(
    () => config.getFilterOptions(items),
    [config, items],
  );
  const [activeFilterId, setActiveFilterId] = useState("all");
  const activeFilter = filterOptions.find(
    (option) => option.id === activeFilterId,
  );
  const visibleItems = activeFilter ? items.filter(activeFilter.matches) : items;
  const scrollRowRef = useRef<HTMLDivElement | null>(null);

  // A retained scroll offset would shift the first card when the filter
  // changes; the row always restarts flush at the fixed left edge.
  useEffect(() => {
    const row = scrollRowRef.current;

    if (row) {
      row.scrollLeft = 0;
    }
  }, [activeFilterId]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={`${config.id}-heading`} className="scroll-mt-16 pt-14" id={config.id}>
      <h2 className="text-h2" id={`${config.id}-heading`}>
        {config.heading}{" "}
        <span className="text-secondary">{config.tagline}</span>
      </h2>

      {filterOptions.length >= 2 ? (
        <FilterSelector
          activeId={activeFilterId}
          label={`Filter ${config.heading.replace(/\.$/, "").toLowerCase()}`}
          onChange={setActiveFilterId}
          options={[{ id: "all", label: "All" }, ...filterOptions]}
        />
      ) : null}

      {visibleItems.length === 0 ? (
        <div className="mt-6 flex flex-col items-start gap-3 py-6">
          <p className="text-sm text-secondary">
            Nothing here for this filter yet.
          </p>
          <button
            className="text-sm font-medium text-accent hover:text-accent-hover"
            onClick={() => setActiveFilterId("all")}
            type="button"
          >
            Show all
          </button>
        </div>
      ) : (
        // Full-bleed track: negative margins stretch the scroll container to
        // the viewport edges while the computed padding re-aligns the first
        // card with the page column, so trailing cards bleed past the right
        // edge instead of clipping inside the column. Left-aligned always —
        // never re-centered by card count.
        <div
          className="mx-[calc(50%_-_50vw)] mt-6 flex gap-5 overflow-x-auto px-[max(1rem,50vw_-_512px_+_1rem)] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-[max(1.5rem,50vw_-_512px_+_1.5rem)]"
          data-testid="product-row"
          ref={scrollRowRef}
        >
          {visibleItems.map((item) => (
            <ProductCard
              item={item}
              key={item.type === "kit" ? item.kit.kitId : item.component.id}
              onShowDetails={onShowDetails}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* --- Sliding filter selector ------------------------------------------------
   Apple-style segmented control: one pill track, one dark indicator that
   slides (left/width transition) to the active option. Buttons keep
   aria-pressed state; roving tabindex + arrow keys give keyboard access, and
   motion-reduce disables the slide. */

function FilterSelector({
  activeId,
  label,
  onChange,
  options,
}: {
  activeId: string;
  label: string;
  onChange: (id: string) => void;
  options: Array<{ id: string; label: string }>;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  const measure = useCallback(() => {
    const active = trackRef.current?.querySelector<HTMLButtonElement>(
      `[data-option-id="${activeId}"]`,
    );

    if (active) {
      setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    }
  }, [activeId]);

  useEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = options.findIndex((option) => option.id === activeId);
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % options.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + options.length) % options.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = options.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = options[nextIndex];
    onChange(next.id);
    trackRef.current
      ?.querySelector<HTMLButtonElement>(`[data-option-id="${next.id}"]`)
      ?.focus();
  }

  return (
    <div
      aria-label={label}
      className="relative mt-5 inline-flex max-w-full overflow-x-auto rounded-pill bg-surface p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      data-testid="filter-selector"
      onKeyDown={handleKeyDown}
      ref={trackRef}
      role="group"
    >
      {indicator ? (
        <span
          aria-hidden
          className="absolute inset-y-1 rounded-pill bg-primary transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
          style={{ left: indicator.left, width: indicator.width }}
        />
      ) : null}
      {options.map((option) => {
        const isActive = option.id === activeId;

        return (
          <button
            aria-pressed={isActive}
            className={`relative z-10 flex-none rounded-pill px-4 py-1.5 text-sm font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 motion-reduce:transition-none ${
              isActive && indicator ? "text-surface" : "text-primary"
            }`}
            data-option-id={option.id}
            key={option.id}
            onClick={() => onChange(option.id)}
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* --- Cards ---------------------------------------------------------------- */

// Image resolution convention: kits use /kits/<kitId>.webp, parts use
// /parts/<componentId>.webp. A photo dropped into public/ under that name
// appears automatically; until then the slot shows an honest placeholder
// glyph on surface-secondary (never a fake product shot). Keycap placeholders
// carry the set's real swatch palette for visual identity.
// Kit art and part photos both ship on a 4:3 canvas with wide transparent
// margins, so each is zoomed to bring the product to ~80% of its tile (only
// transparent canvas is ever clipped, never product pixels). The exact zoom is
// per-product-type because framing differs — kits, switches, keycaps and
// stabilizers each sit in the frame differently. Values are measured against
// the real assets' non-transparent bounding boxes; see PART_ZOOM_CLASS.
// Zoom classes are written as literal strings so the Tailwind JIT can see them.
const KIT_ZOOM_CLASS = "scale-[1.55]";

// switch photos are the smallest in-frame; their zoom is capped by the
// off-centre Gateron Oil King asset (clip-safe ceiling ≈2.2×). keycaps and
// stabilizers are framed larger, so ~1.65× already reaches the ~82% target.
const PART_ZOOM_CLASS: Record<ComponentCategory, string> = {
  switch: "scale-[2.1]",
  keycap: "scale-[1.65]",
  stabilizer: "scale-[1.65]",
  case: "scale-[1.55]",
  pcb: "scale-[1.55]",
  plate: "scale-[1.55]",
};

function ProductImage({
  alt,
  icon: Icon,
  src,
  zoomClassName,
}: {
  alt: string;
  icon: typeof Keyboard;
  src: string | null;
  // Tailwind scale utility (literal string) applied to the contained image.
  // Omitted → no zoom and a comfortable inner padding.
  zoomClassName?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const zoomed = Boolean(zoomClassName);

  if (!src || imageFailed) {
    return (
      <div
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-lg bg-surface"
        data-testid="product-image-placeholder"
      >
        <Icon
          className={`${zoomed ? "h-14 w-14" : "h-10 w-10"} text-secondary/40`}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className={`flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-surface ${
        zoomed ? "" : "p-4"
      }`}
    >
      <Image
        alt={alt}
        className={`h-full w-full object-contain ${zoomClassName ?? ""}`}
        height={240}
        onError={() => setImageFailed(true)}
        src={src}
        width={320}
      />
    </div>
  );
}

function ProductCard({
  item,
  onShowDetails,
}: {
  item: BrowseItem;
  onShowDetails: (item: BrowseItem) => void;
}) {
  if (item.type === "kit") {
    const { kit } = item;
    const price = kitPriceLabel(kit);

    return (
      <article className="flex w-72 flex-none flex-col" data-testid="kit-card">
        <ProductImage
          alt={`${kit.name} kit`}
          icon={Keyboard}
          src={`/kits/${kit.kitId}.webp`}
          zoomClassName={KIT_ZOOM_CLASS}
        />
        <div className="mt-4 flex items-center gap-2">
          <h3 className="text-base font-semibold text-primary">{kit.name}</h3>
          {isBuilderPick(kit.caseComponent) ? <BuilderPickTag /> : null}
        </div>
        <p className="mt-1 text-sm text-secondary">{kitSpecLine(kit)}</p>
        {price ? (
          <p className="mt-2 text-sm font-medium text-primary">{price}</p>
        ) : null}
        <div className="mt-3 flex items-center gap-4">
          <button
            aria-haspopup="dialog"
            className="rounded-pill border-[0.5px] border-border px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={() => onShowDetails(item)}
            type="button"
          >
            View
          </button>
          <Link
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            href={`/configurator?kit=${encodeURIComponent(kit.kitId)}`}
          >
            Configure
            <span aria-hidden>→</span>
          </Link>
        </div>
      </article>
    );
  }

  const { component } = item;
  const price = partPriceLabel(component);
  const swatch =
    component.category === "keycap"
      ? getMetadataStringArray(component.metadata, "swatch")
      : undefined;
  const icon =
    component.category === "switch"
      ? CircleDot
      : component.category === "keycap"
        ? LayoutGrid
        : Wrench;

  return (
    <article className="w-72 flex-none" data-testid="part-card">
      <button
        aria-haspopup="dialog"
        className="flex w-full flex-col rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        onClick={() => onShowDetails(item)}
        type="button"
      >
        <ProductImage
          alt={component.name}
          icon={icon}
          src={`/parts/${component.id}.webp`}
          zoomClassName={PART_ZOOM_CLASS[component.category]}
        />
        <div className="mt-4 flex items-center gap-2">
          <h3 className="text-base font-semibold text-primary">
            {component.name}
          </h3>
          {isBuilderPick(component) ? <BuilderPickTag /> : null}
        </div>
        <p className="mt-1 flex items-center gap-2 text-sm text-secondary">
          {partSpecLine(component)}
          {swatch ? <SwatchDots colors={swatch} /> : null}
        </p>
        {price ? (
          <p className="mt-2 text-sm font-medium text-primary">{price}</p>
        ) : null}
      </button>
    </article>
  );
}

/* --- Detail dialog ---------------------------------------------------------
   Info-only view of one product's full catalog record. Every row comes from
   a real field; absent fields simply do not get a row. */

function detailRows(component: KeyboardComponent): Array<[string, string]> {
  const rows: Array<[string, string]> = [["Brand", component.brand]];

  switch (component.category) {
    case "switch": {
      const type = getSwitchType(component);
      if (type) rows.push(["Type", type]);
      if (component.soundProfile)
        rows.push(["Sound profile", capitalize(component.soundProfile)]);
      if (component.actuationForceG !== undefined)
        rows.push(["Actuation force", `${component.actuationForceG}g`]);
      if (component.pinCount !== undefined)
        rows.push(["Pins", `${component.pinCount}-pin`]);
      rows.push(["Technology", capitalize(component.switchTechnology)]);
      break;
    }
    case "keycap":
      rows.push([
        "Profile",
        keycapProfileLabels[component.keycapProfile] ??
          capitalize(component.keycapProfile),
      ]);
      if (component.layoutSupport.length > 0)
        rows.push([
          "Layout support",
          component.layoutSupport
            .map((layout) => layoutLabel(layout) ?? layout)
            .join(", "),
        ]);
      break;
    case "stabilizer":
      rows.push([
        "Mount",
        stabilizerTypeLabels[component.stabilizerType] ??
          component.stabilizerType,
      ]);
      if (component.supportedLayouts.length > 0)
        rows.push([
          "Supported layouts",
          component.supportedLayouts
            .map((layout) => layoutLabel(layout) ?? layout)
            .join(", "),
        ]);
      if (component.supportedSizes.length > 0)
        rows.push(["Sizes", component.supportedSizes.join(", ")]);
      break;
    default:
      break;
  }

  const price = partPriceLabel(component);
  if (price) rows.push(["Price", price]);

  return rows;
}

function DetailDialog({
  item,
  onClose,
}: {
  item: BrowseItem;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const title = item.type === "kit" ? item.kit.name : item.component.name;
  const vendorUrl =
    item.type === "kit" ? item.kit.caseComponent.vendorUrl : item.component.vendorUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close details"
        className="absolute inset-0 bg-primary/40"
        onClick={onClose}
        type="button"
      />
      <div
        aria-label={title}
        aria-modal="true"
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-surface p-6 [box-shadow:var(--shadow-overlay)]"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-h3 text-primary">{title}</h3>
          <button
            aria-label="Close"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-surface-secondary text-secondary transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {item.type === "kit" ? (
          <>
            <p className="mt-3 text-sm leading-6 text-secondary">
              {item.kit.caseComponent.description}
            </p>
            <h4 className="mt-5 text-sm font-semibold text-primary">
              What&apos;s in the kit
            </h4>
            <ul className="mt-2 divide-y divide-border/60">
              {item.kit.parts.map((part) => (
                <li
                  className="flex items-baseline justify-between gap-4 py-2 text-sm"
                  key={part.id}
                >
                  <span className="text-primary">{part.name}</span>
                  <span className="flex-none text-secondary">
                    {part.price === 0
                      ? "Included"
                      : partPriceLabel(part) ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
            {kitPriceLabel(item.kit) ? (
              <p className="mt-4 text-sm font-medium text-primary">
                {item.kit.price?.isEstimate ? "Estimated kit total: " : "Kit price: "}
                {kitPriceLabel(item.kit)}
              </p>
            ) : null}
            <Link
              className="mt-5 inline-block rounded-pill bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
              href={`/configurator?kit=${encodeURIComponent(item.kit.kitId)}`}
            >
              Configure this kit
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-secondary">
              {item.component.description}
            </p>
            <dl className="mt-5 divide-y divide-border/60">
              {detailRows(item.component).map(([label, value]) => (
                <div
                  className="flex items-baseline justify-between gap-4 py-2 text-sm"
                  key={label}
                >
                  <dt className="text-secondary">{label}</dt>
                  <dd className="text-right font-medium text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}

        {vendorUrl ? (
          <a
            className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover"
            href={vendorUrl}
            rel="noreferrer"
            target="_blank"
          >
            View vendor listing ↗
          </a>
        ) : null}
      </div>
    </div>
  );
}
