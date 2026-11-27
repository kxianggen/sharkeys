/**
 * Checks before review (v2 WS2, subtask 3). None of these change a value;
 * they only raise flags the reviewer sees next to the part.
 *
 *   1. schema      — the assembled part passes the zod catalogue schema
 *   2. duplicate   — same normalised brand + name, same id, or same source URL
 *   3. sanity      — price inside a plausible MYR band for its category
 *   4. buildable   — the rule engine (src/lib/rules, the only compatibility
 *                    authority) finds at least one valid full build that
 *                    contains the new part(s), using existing catalogue parts
 */
import { getOptionConflicts, validateBuildCompatibility } from "@/lib/rules";
import {
  requiredComponentCategories,
  type ComponentCategory,
  type KeyboardComponent,
} from "@/lib/types";

/** Plausible listed prices in MYR (switch = per switch). Outside = flag, not reject. */
export const PRICE_BANDS_MYR: Record<ComponentCategory, [number, number]> = {
  switch: [0.1, 15],
  keycap: [15, 1500],
  stabilizer: [5, 300],
  case: [30, 3000],
  pcb: [15, 1500],
  plate: [5, 600],
};

export type CheckFlag = {
  check: "schema" | "duplicate" | "sanity" | "buildable";
  severity: "block" | "warn";
  message: string;
};

const NAME_NOISE = /\b(switch(es)?|keycaps?|key ?cap ?set|set|stabili[sz]ers?|stabs?|keyboard|mechanical|kit|pcs|pack|ready ?stock)\b/g;

export function normaliseForDuplicate(brand: string, name: string) {
  const brandKey = brand.toLowerCase().replace(/[^a-z0-9]/g, "");
  const nameKey = name
    .toLowerCase()
    .replace(new RegExp(`^${brand.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`), "")
    .replace(NAME_NOISE, " ")
    .replace(/[^a-z0-9]/g, "");
  return `${brandKey}|${nameKey}`;
}

/**
 * Model codes such as "GMK104", "Q3", "K-Pro": letters + digits. Pure version
 * tokens ("V2") are ignored. Used to catch the same product listed under a
 * differently worded name (missed case: "Zuoya GMK104 100%/Full Size …" vs the
 * frozen "Zuoya GMK104 Full-Size ABS Case").
 */
export function modelCodes(name: string): Set<string> {
  return new Set(
    (name.toLowerCase().match(/\b[a-z]+-?\d+[a-z0-9]*\b/g) ?? [])
      .map((token) => token.replace(/-/g, ""))
      .filter((token) => !/^v\d+$/.test(token) && !/^(r|mk|pcs|x)\d+$/.test(token)),
  );
}

export function findDuplicates(
  part: KeyboardComponent,
  existing: readonly KeyboardComponent[],
): CheckFlag[] {
  const flags: CheckFlag[] = [];
  const key = normaliseForDuplicate(part.brand, part.name);
  const codes = modelCodes(part.name);
  const brandKey = part.brand.toLowerCase().replace(/[^a-z0-9]/g, "");
  const sourceUrl = part.metadata?.sourceUrl;

  for (const other of existing) {
    if (other === part) continue;
    if (other.id === part.id) {
      flags.push({ check: "duplicate", severity: "block", message: `id "${part.id}" already exists` });
      continue;
    }
    if (other.category === part.category && normaliseForDuplicate(other.brand, other.name) === key) {
      flags.push({ check: "duplicate", severity: "block", message: `same brand and name as existing "${other.id}"` });
      continue;
    }
    if (
      other.category === part.category &&
      other.brand.toLowerCase().replace(/[^a-z0-9]/g, "") === brandKey &&
      [...modelCodes(other.name)].some((code) => codes.has(code))
    ) {
      flags.push({ check: "duplicate", severity: "warn", message: `possibly the same product as existing "${other.id}" (same brand and model code)` });
      continue;
    }
    // Kit parts share one source URL with their siblings, so only flag the
    // same URL when it is the same category.
    if (
      sourceUrl &&
      other.category === part.category &&
      (other.metadata?.sourceUrl === sourceUrl || other.vendorUrl === sourceUrl)
    ) {
      flags.push({ check: "duplicate", severity: "warn", message: `same source page as existing "${other.id}"` });
    }
  }
  return flags;
}

export function checkSanity(part: KeyboardComponent): CheckFlag[] {
  const flags: CheckFlag[] = [];
  const [min, max] = PRICE_BANDS_MYR[part.category];
  if (part.price === undefined) {
    flags.push({ check: "sanity", severity: "warn", message: "no price" });
  } else if (part.price < min || part.price > max) {
    flags.push({
      check: "sanity",
      severity: "warn",
      message: `price RM${part.price} is outside the usual RM${min}–RM${max} for a ${part.category}${part.category === "switch" ? " (per switch)" : ""}`,
    });
  }
  if (part.priceCurrency && part.priceCurrency !== "MYR") {
    flags.push({ check: "sanity", severity: "block", message: `currency ${part.priceCurrency}, expected MYR` });
  }
  return flags;
}

export type BuildSearchResult =
  | { found: true; componentIds: Record<ComponentCategory, string>; explored: number }
  | { found: false; explored: number; exhausted: boolean };

/**
 * Depth-first search for one valid build containing every part in `fixed`.
 * Each step keeps only options the rule engine reports no conflicts for (its
 * own getOptionConflicts), and the final candidate is confirmed with
 * validateBuildCompatibility. Nothing here re-implements a rule.
 */
export function findValidBuild(
  fixed: readonly KeyboardComponent[],
  catalog: readonly KeyboardComponent[],
  maxExplored = 20_000,
): BuildSearchResult {
  const selection: Partial<Record<ComponentCategory, string>> = {};
  for (const part of fixed) selection[part.category] = part.id;

  const open = requiredComponentCategories.filter((category) => !selection[category]);
  const byCategory = new Map<ComponentCategory, KeyboardComponent[]>();
  for (const category of open) {
    byCategory.set(category, catalog.filter((c) => c.category === category));
  }

  let explored = 0;
  let exhausted = true;

  const search = (index: number): Record<ComponentCategory, string> | undefined => {
    if (explored >= maxExplored) {
      exhausted = false;
      return undefined;
    }
    if (index === open.length) {
      explored++;
      const result = validateBuildCompatibility({ componentIds: { ...selection } }, catalog);
      return result.isValid ? ({ ...selection } as Record<ComponentCategory, string>) : undefined;
    }
    const category = open[index];
    for (const option of byCategory.get(category) ?? []) {
      explored++;
      const conflicts = getOptionConflicts(category, option.id, selection, catalog).filter(
        (issue) => issue.severity === "error",
      );
      if (conflicts.length > 0) continue;
      selection[category] = option.id;
      const found = search(index + 1);
      if (found) return found;
      delete selection[category];
      if (explored >= maxExplored) break;
    }
    return undefined;
  };

  // Check the fixed parts are compatible with each other first.
  const fixedConflicts = fixed.flatMap((part) =>
    getOptionConflicts(part.category, part.id, selection, catalog).filter((i) => i.severity === "error"),
  );
  if (fixedConflicts.length > 0) return { found: false, explored: 0, exhausted: true };

  const componentIds = search(0);
  return componentIds ? { found: true, componentIds, explored } : { found: false, explored, exhausted };
}

export function checkBuildable(
  parts: readonly KeyboardComponent[],
  existing: readonly KeyboardComponent[],
): { flags: CheckFlag[]; exampleBuild?: Record<ComponentCategory, string> } {
  const catalog = [...existing.filter((e) => !parts.some((p) => p.id === e.id)), ...parts];
  const result = findValidBuild(parts, catalog);
  if (result.found) return { flags: [], exampleBuild: result.componentIds };
  return {
    flags: [
      {
        check: "buildable",
        severity: "warn",
        message: result.exhausted
          ? "the rule engine found no valid build with this part and the current catalogue"
          : `no valid build found in the first ${result.explored} tries (search capped)`,
      },
    ],
  };
}

export function runChecks(
  parts: readonly KeyboardComponent[],
  existing: readonly KeyboardComponent[],
) {
  const flags = parts.flatMap((part) => [...findDuplicates(part, existing), ...checkSanity(part)]);
  const buildable = checkBuildable(parts, existing);
  return { flags: [...flags, ...buildable.flags], exampleBuild: buildable.exampleBuild };
}
