import type { ExtractedKeyboardIntent } from "@/lib/ai";
import type { KeyboardComponent } from "@/lib/types";
import {
  componentCategories,
  estimatedSwitchCount,
} from "@/components/configurator/constants";
import type {
  CompleteComponentIdSelection,
  CompleteComponentSelection,
  ComponentCategory,
  ManualSelection,
  PriceEstimate,
} from "@/components/configurator/types";

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

// A build total is an estimate, not a firm quote: it sums catalog part prices
// and assumes ~70 switches per board. Prefix "~" so it never reads as a
// confirmed price. Exact single-part catalog prices stay unprefixed.
export function formatEstimatedTotal(amount: number, currency: string) {
  return `~${formatMoney(amount, currency)}`;
}

export function formatComponentPrice(component: KeyboardComponent) {
  if (component.price === undefined || component.priceCurrency === undefined) {
    return "Price unavailable";
  }

  const amount =
    component.category === "switch" ? component.price * 70 : component.price;
  const suffix = component.category === "switch" ? " est. 70 switches" : "";

  return `${formatMoney(amount, component.priceCurrency)}${suffix}`;
}

export function getMetadataString(
  metadata: KeyboardComponent["metadata"],
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" ? value : undefined;
}

// Kit-derived structural parts carry metadata.kitLock in the real catalog; the
// rule engine already enforces that they stay with their kit, so the UI treats
// them as auto-included rather than user pick-steps.
export function isKitLockedComponent(component: KeyboardComponent | undefined) {
  return component?.metadata?.kitLock === true;
}

// One-word descriptor for the "Your build" summary rows, drawn straight from
// catalog fields (never generated). Missing field → no descriptor (the row
// just shows the category), so nothing is fabricated.
export function getPartDescriptor(component: KeyboardComponent): string | undefined {
  switch (component.category) {
    case "switch":
      return component.soundProfile;
    case "keycap":
      return component.keycapProfile;
    case "stabilizer":
      return component.stabilizerType.replace(/_/g, " ");
    default:
      return undefined;
  }
}

export function toCompleteComponentIds(
  selection: ManualSelection,
): CompleteComponentIdSelection | null {
  const entries = componentCategories.map((category) => {
    const componentId = selection[category];

    return componentId ? [category, componentId] : null;
  });

  if (entries.some((entry) => entry === null)) {
    return null;
  }

  return Object.fromEntries(
    entries as Array<[ComponentCategory, string]>,
  ) as CompleteComponentIdSelection;
}

export function resolveCompleteComponents(
  componentIds: CompleteComponentIdSelection,
  catalogById: Map<string, KeyboardComponent>,
): CompleteComponentSelection | null {
  const caseComponent = catalogById.get(componentIds.case);
  const pcbComponent = catalogById.get(componentIds.pcb);
  const plateComponent = catalogById.get(componentIds.plate);
  const switchComponent = catalogById.get(componentIds.switch);
  const keycapComponent = catalogById.get(componentIds.keycap);
  const stabilizerComponent = catalogById.get(componentIds.stabilizer);

  if (
    caseComponent?.category !== "case" ||
    pcbComponent?.category !== "pcb" ||
    plateComponent?.category !== "plate" ||
    switchComponent?.category !== "switch" ||
    keycapComponent?.category !== "keycap" ||
    stabilizerComponent?.category !== "stabilizer"
  ) {
    return null;
  }

  return {
    case: caseComponent,
    pcb: pcbComponent,
    plate: plateComponent,
    switch: switchComponent,
    keycap: keycapComponent,
    stabilizer: stabilizerComponent,
  };
}

// Running estimate over whichever parts are resolved so far: kit-locked parts
// from the start, switches/keycaps once chosen. Same estimate semantics as the
// saved-build total (switch price × ~70).
export function estimateAssemblyPrice(
  components: Partial<Record<ComponentCategory, KeyboardComponent>>,
): PriceEstimate | null {
  const prices = componentCategories
    .map((category) => {
      const component = components[category];

      if (
        !component ||
        component.price === undefined ||
        component.priceCurrency === undefined
      ) {
        return undefined;
      }

      return {
        amount:
          category === "switch"
            ? component.price * estimatedSwitchCount
            : component.price,
        currency: component.priceCurrency,
      };
    })
    .filter((price): price is PriceEstimate => price !== undefined);

  const [firstPrice] = prices;

  if (!firstPrice || prices.some((price) => price.currency !== firstPrice.currency)) {
    return null;
  }

  return {
    amount: Number(
      prices.reduce((total, price) => total + price.amount, 0).toFixed(2),
    ),
    currency: firstPrice.currency,
  };
}

export function buildSavedBuildTitle(components: CompleteComponentSelection) {
  return `${components.case.name} with ${components.switch.name}`;
}

// Short display name for a whole build: the kit it is based on, never the
// concatenated component string. Prefers the catalog's observedKitName; when
// absent, the kit-derived case name follows "<Kit> <layout> <material> Case"
// (e.g. "Lucky65 V3 65% CNC Aluminum Case"), so everything from the layout
// token onward is descriptor, not kit name.
export function getKitDisplayName(caseComponent: KeyboardComponent) {
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

export function sectionDomId(title: string) {
  return `configurator-section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function buildConfiguratorPromptHref(prompt: string) {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    return "/configurator";
  }

  const params = new URLSearchParams({ prompt: trimmedPrompt });

  return `/configurator?${params.toString()}`;
}

// Renders an image-derived intent into an editable natural-language prompt.
export function intentToPrompt(intent: ExtractedKeyboardIntent): string {
  const parts: string[] = [];
  if (intent.useCase && intent.useCase !== "unknown") {
    parts.push(`${intent.useCase} use`);
  }
  if (intent.soundProfile) parts.push(`${intent.soundProfile} sound`);
  if (intent.switchTechnology) parts.push(`${intent.switchTechnology} switches`);
  if (intent.layout) parts.push(`${intent.layout} layout`);
  if (intent.budget?.amount) {
    parts.push(`under ${intent.budget.amount} ${intent.budget.currency ?? "MYR"}`);
  }
  if (parts.length === 0) {
    return "A keyboard inspired by the uploaded photo";
  }
  return `A ${parts.join(", ")} keyboard`;
}

// Card summary helpers: reduce real catalog part names to their core so the
// one-line "{switch} · {keycap}" summary stays scannable. Only redundant
// category suffixes are stripped — never invented or reworded.
export function coreSwitchName(name: string) {
  const core = name
    .replace(/\s+(linear|tactile|clicky|silent)?\s*switch(es)?$/i, "")
    .trim();

  return core || name;
}

export function coreKeycapName(name: string) {
  const core = name.replace(/\s+keycaps?(\s+set)?$/i, "").trim();

  return core ? `${core} keycaps` : name;
}

// Clamp a long part name at a word boundary — no mid-word ellipsis.
export function clampPartName(name: string, maxLength = 30) {
  if (name.length <= maxLength) {
    return name;
  }

  const cut = name.slice(0, maxLength + 1);
  const lastSpace = cut.lastIndexOf(" ");

  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}

export function formatLayoutChip(layout: string | undefined) {
  if (!layout) {
    return "Layout";
  }

  return layout === "tkl" ? "TKL Layout" : `${layout}% Layout`;
}
