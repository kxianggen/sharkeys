import {
  keyboardComponentCatalogSchema,
  type KeyboardComponent,
} from "@/lib/types";

import { keyboardComponents as seedComponents } from "./components";
import approvedPartsJson from "./imported/approved-parts.json";
import priceChecksJson from "./imported/price-checks.json";

/**
 * Catalogue assembly (v2 WS2).
 *
 * - `frozenCatalog` is the original hand-typed 61 parts in components.ts.
 *   That file is never edited: it is the pinned snapshot the tests and the
 *   CI eval run against.
 * - `fullCatalog` is the frozen 61 plus every part Jayson approved through the
 *   importer review (imported/approved-parts.json), with the latest approved
 *   price checks (imported/price-checks.json) applied on top.
 *
 * `keyboardComponents` is the full catalogue, unless SHARKEYS_CATALOG=frozen
 * is set (vitest and the CI eval set it), in which case it is the frozen 61.
 */

export type PriceCheckStatus = "ok" | "changed" | "gone" | "error";

export type PriceCheckEntry = {
  /** ISO date-time of the last time the source page was fetched. */
  lastCheckedAt: string;
  status: PriceCheckStatus;
  /** Approved current price (MYR, listed, excl. shipping). Absent = keep catalogue price. */
  price?: number;
  /** What the source page showed (per switch for switches, whole kit for kit parts). */
  observedPrice?: number;
  /** Why a change was flagged but not priced, e.g. a hand-split kit price. */
  note?: string;
};

export type PriceChecks = Record<string, PriceCheckEntry>;

export const frozenCatalog: KeyboardComponent[] = seedComponents;

export const approvedImportedParts: KeyboardComponent[] =
  keyboardComponentCatalogSchema.parse(approvedPartsJson.parts);

export const priceChecks: PriceChecks = priceChecksJson.checks as PriceChecks;

export function applyPriceChecks(
  components: readonly KeyboardComponent[],
  checks: PriceChecks,
): KeyboardComponent[] {
  return components.map((component) => {
    const check = checks[component.id];
    if (!check) return component;

    return {
      ...component,
      ...(check.price !== undefined ? { price: check.price } : {}),
      metadata: {
        ...component.metadata,
        lastCheckedAt: check.lastCheckedAt,
        priceCheckStatus: check.status,
        // The source page is gone: keep the part, mark it unavailable.
        ...(check.status === "gone" ? { availability: "unavailable" } : {}),
      },
    };
  });
}

export function buildFullCatalog(
  frozen: readonly KeyboardComponent[],
  imported: readonly KeyboardComponent[],
  checks: PriceChecks,
): KeyboardComponent[] {
  const frozenIds = new Set(frozen.map((component) => component.id));
  const duplicate = imported.find((component) => frozenIds.has(component.id));
  if (duplicate) {
    throw new Error(
      `Imported part id "${duplicate.id}" collides with a frozen catalogue id.`,
    );
  }

  return applyPriceChecks([...frozen, ...imported], checks);
}

export const fullCatalog: KeyboardComponent[] = buildFullCatalog(
  frozenCatalog,
  approvedImportedParts,
  priceChecks,
);

export type CatalogMode = "frozen" | "full";

export function readCatalogMode(
  value: string | undefined = typeof process === "undefined"
    ? undefined
    : process.env.SHARKEYS_CATALOG,
): CatalogMode {
  return value === "frozen" ? "frozen" : "full";
}

export const catalogMode: CatalogMode = readCatalogMode();

export const keyboardComponents: KeyboardComponent[] =
  catalogMode === "frozen" ? frozenCatalog : fullCatalog;

export function getComponentById(id: string) {
  return keyboardComponents.find((component) => component.id === id);
}
