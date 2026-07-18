import { validateBuildCompatibility } from "@/lib/rules";
import type { ComponentIdSelection, KeyboardComponent } from "@/lib/types";

// Catalog-only kit derivation, shared by the configurator's kit-lock rule and
// the community publish picker. A "kit" is anchored by a kit-locked `case`
// component (metadata.kitLock === true) carrying a metadata.kitId; the PCB,
// plate, and included stabilizer that share that kitId are locked to it. The
// rule engine (validateBuildCompatibility) stays the sole authority on
// compatibility — this module only mirrors its kit-lock data model to build
// the UI's option lists.

function getMetadataString(
  metadata: KeyboardComponent["metadata"],
  key: string,
): string | undefined {
  const value = metadata?.[key];
  return typeof value === "string" ? value : undefined;
}

export function isKitLockedComponent(
  component: KeyboardComponent | undefined,
): boolean {
  return component?.metadata?.kitLock === true;
}

export function getComponentKitId(
  component: KeyboardComponent | undefined,
): string | undefined {
  return component ? getMetadataString(component.metadata, "kitId") : undefined;
}

/**
 * Display name for a kit, from its kit-locked case component. Prefers the
 * catalog's observedKitName; otherwise strips the layout token / case
 * descriptors — the same rule Browse and the configurator use.
 */
export function getKitDisplayName(caseComponent: KeyboardComponent): string {
  const observedKitName = getMetadataString(
    caseComponent.metadata,
    "observedKitName",
  );
  if (observedKitName) return observedKitName;

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

export type KitPart = { id: string; name: string };

export type KitStabilizerOption = {
  id: string;
  name: string;
  stabilizerType: string;
  // True for the stabilizer that ships in the kit's box (offered first,
  // selected by default); false for compatible aftermarket upgrades.
  included: boolean;
};

export type KitOption = {
  kitId: string;
  kitName: string;
  case: KitPart;
  pcb: KitPart | null;
  plate: KitPart | null;
  includedStabilizerId: string | null;
  stabilizerOptions: KitStabilizerOption[];
};

const STABILIZER_ERROR_CODES = new Set([
  "stabilizer_pcb_type_mismatch",
  "stabilizer_layout_requirements_mismatch",
]);

/**
 * Whether a (non-kit-locked) stabilizer is compatible with a kit, decided by
 * the rule engine — not a reimplemented predicate. Runs the kit's structural
 * parts plus the candidate stabilizer through validateBuildCompatibility and
 * rejects only on stabilizer-specific errors (missing switch/keycap etc. are
 * irrelevant here).
 */
export function isStabilizerCompatibleWithKit(
  catalog: readonly KeyboardComponent[],
  kit: Pick<KitOption, "case" | "pcb" | "plate">,
  stabilizerId: string,
): boolean {
  const componentIds: ComponentIdSelection = {
    case: kit.case.id,
    stabilizer: stabilizerId,
  };
  if (kit.pcb) componentIds.pcb = kit.pcb.id;
  if (kit.plate) componentIds.plate = kit.plate.id;

  const result = validateBuildCompatibility({ componentIds }, catalog);
  return !result.errors.some((error) => STABILIZER_ERROR_CODES.has(error.code));
}

function findKitLockedPart(
  catalog: readonly KeyboardComponent[],
  category: KeyboardComponent["category"],
  kitId: string,
): KeyboardComponent | undefined {
  return catalog.find(
    (component) =>
      component.category === category &&
      isKitLockedComponent(component) &&
      getComponentKitId(component) === kitId,
  );
}

/**
 * Derives every kit from the catalog with its locked case/PCB/plate, its
 * included stabilizer, and the full stabilizer option list (included first,
 * then compatible aftermarket). Kits are sorted by display name.
 */
export function deriveKitOptions(
  catalog: readonly KeyboardComponent[],
): KitOption[] {
  const kits: KitOption[] = [];

  for (const caseComponent of catalog) {
    if (
      caseComponent.category !== "case" ||
      !isKitLockedComponent(caseComponent)
    ) {
      continue;
    }
    const kitId = getComponentKitId(caseComponent);
    if (!kitId) continue;

    const pcb = findKitLockedPart(catalog, "pcb", kitId);
    const plate = findKitLockedPart(catalog, "plate", kitId);
    const includedStabilizer = findKitLockedPart(catalog, "stabilizer", kitId);

    const kitParts = {
      case: { id: caseComponent.id, name: caseComponent.name },
      pcb: pcb ? { id: pcb.id, name: pcb.name } : null,
      plate: plate ? { id: plate.id, name: plate.name } : null,
    };

    const stabilizerOptions: KitStabilizerOption[] = [];
    if (includedStabilizer && includedStabilizer.category === "stabilizer") {
      stabilizerOptions.push({
        id: includedStabilizer.id,
        name: includedStabilizer.name,
        stabilizerType: includedStabilizer.stabilizerType,
        included: true,
      });
    }
    for (const component of catalog) {
      if (
        component.category === "stabilizer" &&
        !isKitLockedComponent(component) &&
        isStabilizerCompatibleWithKit(catalog, kitParts, component.id)
      ) {
        stabilizerOptions.push({
          id: component.id,
          name: component.name,
          stabilizerType: component.stabilizerType,
          included: false,
        });
      }
    }

    kits.push({
      kitId,
      kitName: getKitDisplayName(caseComponent),
      ...kitParts,
      includedStabilizerId: includedStabilizer?.id ?? null,
      stabilizerOptions,
    });
  }

  return kits.sort((a, b) => a.kitName.localeCompare(b.kitName));
}
