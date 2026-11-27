/**
 * Candidate (fields + confidence) → catalogue parts (KeyboardComponent).
 *
 * A required field that is still "unknown" blocks the part: it is reported as
 * missing and never filled with a default. Optional fields that are unknown
 * are simply left out. A kit becomes case + PCB + plate (+ stabiliser when the
 * kit's stabiliser type is known), linked with kitId / kitLock exactly like the
 * hand-made kits in src/data/components.ts.
 */
import { keyboardComponentSchema, type KeyboardComponent } from "@/lib/types";

import {
  REQUIRED_FIELDS,
  UNKNOWN,
  isKnown,
  type Candidate,
  type CandidateFields,
  type FieldName,
} from "./fields";
import { slugify } from "./text";

/** Kit price split, from the hand-made kits (GMK67: 100 / 60 / 20 of RM180). */
export const KIT_PRICE_SPLIT = { case: 0.55, pcb: 0.3, plate: 0.1, stabilizer: 0.05 } as const;

export type AssembleContext = {
  vendorName: string;
  checkedAt: string;
  batchId: string;
};

export type AssembleResult =
  | { ok: true; components: KeyboardComponent[] }
  | { ok: false; missing: FieldName[]; errors: string[] };

function value<K extends FieldName>(fields: CandidateFields, name: K) {
  const field = fields[name];
  return isKnown(field) ? (field.value as Exclude<CandidateFields[K]["value"], typeof UNKNOWN>) : undefined;
}

function stripBrand(name: string, brand: string) {
  const pattern = new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
  return name.replace(pattern, "");
}

export function buildPartId(category: string, brand: string, name: string) {
  return `${category}_${slugify(brand)}_${slugify(stripBrand(name, brand))}`.slice(0, 80).replace(/_+$/, "");
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function missingRequired(candidate: Candidate): FieldName[] {
  const category = candidate.category.value;
  if (category === UNKNOWN) return ["name"];
  return REQUIRED_FIELDS[category].filter((name) => !isKnown(candidate.fields[name]));
}

export function assembleCandidate(candidate: Candidate, context: AssembleContext): AssembleResult {
  const category = candidate.category.value;
  if (category === UNKNOWN) return { ok: false, missing: [], errors: ["category is unknown"] };

  const missing = missingRequired(candidate);
  if (missing.length > 0) return { ok: false, missing, errors: [] };

  const f = candidate.fields;
  const name = value(f, "name")!;
  const brand = value(f, "brand")!;
  const price = value(f, "price");
  const soundProfile = value(f, "soundProfile");
  const description = value(f, "description");
  const plateMaterial = value(f, "plateMaterial");

  const metadata: Record<string, unknown> = {
    sourceType: "imported",
    sourceUrl: candidate.sourceUrl,
    sourceVendor: context.vendorName,
    observedAt: context.checkedAt.slice(0, 10),
    lastCheckedAt: context.checkedAt,
    priceBasis: "listed_excl_shipping",
    observedCurrency: "MYR",
    importBatch: context.batchId,
    ...(price !== undefined ? { observedPrice: price } : {}),
    ...(candidate.packSize ? { observedPackSize: candidate.packSize } : {}),
  };

  const base = {
    name,
    brand,
    beginnerFriendly: value(f, "beginnerFriendly")!,
    ...(description ? { description } : {}),
    ...(price !== undefined ? { price, priceCurrency: "MYR" as const } : {}),
    // Links back to the shop. No imageUrl: vendor product photos are not
    // copied or hot-linked onto the site (Jayson's safeguard, 2026-11-28).
    vendorUrl: candidate.sourceUrl,
    ...(soundProfile ? { soundProfile } : {}),
  };

  const raw: unknown[] = [];

  switch (category) {
    case "case":
      raw.push({ ...base, id: buildPartId("case", brand, name), category, layouts: value(f, "layouts"), caseMountSupport: value(f, "mountSupport"), metadata });
      break;
    case "pcb":
      raw.push({
        ...base,
        id: buildPartId("pcb", brand, name),
        category,
        layouts: value(f, "layouts"),
        switchTechnologySupport: value(f, "switchTechnologySupport"),
        pcbMountSupport: value(f, "mountSupport"),
        stabilizerTypeSupport: value(f, "stabilizerTypeSupport"),
        connection: value(f, "connection"),
        hotswap: value(f, "hotswap"),
        metadata,
      });
      break;
    case "plate":
      raw.push({
        ...base,
        id: buildPartId("plate", brand, name),
        category,
        layouts: value(f, "layouts"),
        plateMountSupport: value(f, "mountSupport"),
        switchTechnologySupport: value(f, "switchTechnologySupport"),
        metadata: { ...metadata, ...(plateMaterial ? { plateMaterial } : {}) },
      });
      break;
    case "switch":
      raw.push({
        ...base,
        id: buildPartId("switch", brand, name),
        category,
        switchTechnology: value(f, "switchTechnology"),
        ...(value(f, "pinCount") !== undefined ? { pinCount: value(f, "pinCount") } : {}),
        ...(value(f, "actuationForceG") !== undefined ? { actuationForceG: value(f, "actuationForceG") } : {}),
        metadata,
      });
      break;
    case "keycap":
      raw.push({
        ...base,
        id: buildPartId("keycap", brand, name),
        category,
        keycapProfile: value(f, "keycapProfile"),
        layoutSupport: value(f, "layouts"),
        compatibleSwitchTechnologies: value(f, "switchTechnologySupport"),
        metadata,
      });
      break;
    case "stabilizer":
      raw.push({
        ...base,
        id: buildPartId("stab", brand, name),
        category,
        stabilizerType: value(f, "stabilizerType"),
        supportedLayouts: value(f, "layouts"),
        supportedSizes: value(f, "stabilizerSizes"),
        metadata,
      });
      break;
    case "kit": {
      const kitName = stripBrand(name, brand).replace(/\b(keyboard|mechanical|diy|barebones?|kit)\b/gi, "").replace(/\s{2,}/g, " ").trim() || name;
      const kitId = `${slugify(brand)}_${slugify(kitName)}`.slice(0, 60);
      const layouts = value(f, "layouts")!;
      const layoutLabel = layouts[0] === "tkl" ? "TKL" : layouts[0] === "full" ? "Full-Size" : `${layouts[0]}%`;
      const stabType = value(f, "stabilizerType");
      const split = (share: number) => (price !== undefined ? { price: round2(price * share), priceCurrency: "MYR" as const } : {});
      const kitMeta = {
        ...metadata,
        kitId,
        kitLock: true,
        observedKitName: `${brand} ${kitName}`.trim(),
        ...(price !== undefined ? { observedKitPrice: price } : {}),
        priceBasis: "kit_split_estimate",
      };
      delete (kitMeta as Record<string, unknown>).observedPrice;
      const partBase = { ...base };
      delete (partBase as Record<string, unknown>).price;
      delete (partBase as Record<string, unknown>).priceCurrency;

      raw.push({
        ...partBase,
        ...split(KIT_PRICE_SPLIT.case),
        id: `case_${kitId}`,
        category: "case",
        name: `${brand} ${kitName} ${layoutLabel} Case`,
        layouts,
        caseMountSupport: value(f, "mountSupport"),
        metadata: kitMeta,
      });
      raw.push({
        ...partBase,
        ...split(KIT_PRICE_SPLIT.pcb),
        id: `pcb_${kitId}`,
        category: "pcb",
        name: `${brand} ${kitName} ${layoutLabel} PCB`,
        layouts,
        switchTechnologySupport: value(f, "switchTechnologySupport"),
        pcbMountSupport: value(f, "mountSupport"),
        stabilizerTypeSupport: value(f, "stabilizerTypeSupport"),
        connection: value(f, "connection"),
        hotswap: value(f, "hotswap"),
        soundProfile: undefined,
        metadata: kitMeta,
      });
      raw.push({
        ...partBase,
        ...split(KIT_PRICE_SPLIT.plate),
        id: `plate_${kitId}`,
        category: "plate",
        name: `${brand} ${kitName} ${layoutLabel} ${plateMaterial ? `${plateMaterial.toUpperCase()} ` : ""}Plate`.replace("POLYCARBONATE", "Polycarbonate").replace("ALUMINUM", "Aluminum"),
        layouts,
        plateMountSupport: value(f, "mountSupport"),
        switchTechnologySupport: value(f, "switchTechnologySupport"),
        metadata: { ...kitMeta, ...(plateMaterial ? { plateMaterial } : {}) },
      });
      // The kit's own stabiliser is added only when both its type and its
      // sizes were read (or filled in by the reviewer); never assumed.
      const stabSizes = value(f, "stabilizerSizes");
      if (stabType && stabSizes) {
        raw.push({
          ...partBase,
          ...split(KIT_PRICE_SPLIT.stabilizer),
          id: `stab_${kitId}`,
          category: "stabilizer",
          name: `${brand} ${kitName} ${stabType.replace("_", "-").replace("pcb", "PCB").replace("plate", "Plate").replace("screw-in", "Screw-In")} Stabilizers`,
          stabilizerType: stabType,
          supportedLayouts: layouts,
          supportedSizes: stabSizes,
          soundProfile: undefined,
          metadata: kitMeta,
        });
      }
      break;
    }
  }

  const components: KeyboardComponent[] = [];
  const errors: string[] = [];
  for (const part of raw) {
    const parsed = keyboardComponentSchema.safeParse(part);
    if (parsed.success) components.push(parsed.data);
    else errors.push(...parsed.error.issues.map((issue) => `${issue.path.join(".") || "part"}: ${issue.message}`));
  }
  return errors.length > 0 ? { ok: false, missing: [], errors } : { ok: true, components };
}
