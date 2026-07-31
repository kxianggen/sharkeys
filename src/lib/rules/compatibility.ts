import {
  keyboardBuildSelectionSchema,
  requiredComponentCategories,
  type BuildPreferences,
  type CaseComponent,
  type ComponentCategory,
  type CompatibilityIssue,
  type CompatibilityResult,
  type KeyboardBuildSelection,
  type KeyboardComponent,
  type KeyboardLayout,
  type KeycapComponent,
  type PcbComponent,
  type PlateComponent,
  type SelectedKeyboardComponents,
  type StabilizerComponent,
  type StabilizerSize,
  type SwitchComponent,
} from "@/lib/types";

const categoryLabels: Record<ComponentCategory, string> = {
  case: "case",
  pcb: "PCB",
  plate: "plate",
  switch: "switch",
  keycap: "keycap set",
  stabilizer: "stabilizer kit",
};

const requiredStabilizerSizesByLayout: Record<
  KeyboardLayout,
  readonly StabilizerSize[]
> = {
  "60": ["2u", "6.25u"],
  "65": ["2u", "6.25u"],
  "75": ["2u", "6.25u"],
  tkl: ["2u", "6.25u"],
  full: ["2u", "6.25u"],
};

type StructuralKitCategory = "case" | "pcb" | "plate" | "stabilizer";
type StructuralKitComponent =
  | CaseComponent
  | PcbComponent
  | PlateComponent
  | StabilizerComponent;
type KitLockedStructuralPart = {
  category: StructuralKitCategory;
  component: StructuralKitComponent;
};

export function validateBuildCompatibility(
  selection: KeyboardBuildSelection,
  catalog: readonly KeyboardComponent[],
): CompatibilityResult {
  const parsedSelection = keyboardBuildSelectionSchema.parse(selection);
  const issues: CompatibilityIssue[] = [];
  const selectedComponents = resolveSelectedComponents(
    parsedSelection,
    catalog,
    issues,
  );

  validateLayoutCompatibility(parsedSelection, selectedComponents, issues);
  validateKitStructuralIntegrity(selectedComponents, issues);
  validateMountCompatibility(selectedComponents, issues);
  validateSwitchCompatibility(selectedComponents, issues);
  validateKeycapCompatibility(parsedSelection, selectedComponents, issues);
  validateStabilizerCompatibility(parsedSelection, selectedComponents, issues);
  validatePreferenceWarnings(parsedSelection, selectedComponents, issues);
  annotatePlateCharacter(selectedComponents, issues);

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    issues,
    explanations: buildExplanations(errors, warnings),
    selectedComponents,
  };
}

export { requiredComponentCategories };

/**
 * Which errors would appear if `optionId` were chosen for `category`, given
 * what the user has already selected.
 *
 * This exists so a picker can grey out parts that cannot work — the configurator
 * previously offered every stabilizer regardless of what the selected PCB
 * actually supports, and only complained after the pick.
 *
 * Critically it does NOT re-implement any rule: it runs the real engine on a
 * hypothetical selection and keeps the errors that name this component.
 * `missing_*` errors for not-yet-chosen categories carry no component ids, so
 * they fall out of the filter automatically and a partial build stays valid.
 */
export function getOptionConflicts(
  category: ComponentCategory,
  optionId: string,
  selectedComponentIds: Partial<Record<ComponentCategory, string>>,
  catalog: readonly KeyboardComponent[],
): CompatibilityIssue[] {
  const componentIds: Record<string, string> = {};

  for (const [selectedCategory, selectedId] of Object.entries(
    selectedComponentIds,
  )) {
    if (selectedId && selectedCategory !== category) {
      componentIds[selectedCategory] = selectedId;
    }
  }

  componentIds[category] = optionId;

  const result = validateBuildCompatibility({ componentIds }, catalog);

  return result.errors.filter((error) =>
    error.affectedComponentIds.includes(optionId),
  );
}

function resolveSelectedComponents(
  selection: KeyboardBuildSelection,
  catalog: readonly KeyboardComponent[],
  issues: CompatibilityIssue[],
) {
  const componentsById = new Map(
    catalog.map((component) => [component.id, component]),
  );
  const selectedComponents: SelectedKeyboardComponents = {};

  for (const category of requiredComponentCategories) {
    const componentId = selection.componentIds[category];

    if (!componentId) {
      issues.push({
        code: `missing_${category}`,
        severity: "error",
        message: `Select a ${categoryLabels[category]} before validating compatibility.`,
        affectedCategories: [category],
        affectedComponentIds: [],
      });
      continue;
    }

    const component = componentsById.get(componentId);

    if (!component) {
      issues.push({
        code: `unknown_${category}`,
        severity: "error",
        message: `The selected ${categoryLabels[category]} could not be found in the component catalog.`,
        affectedCategories: [category],
        affectedComponentIds: [componentId],
      });
      continue;
    }

    if (component.category !== category) {
      issues.push({
        code: `wrong_${category}_category`,
        severity: "error",
        message: `${component.name} is a ${categoryLabels[component.category]}, not a ${categoryLabels[category]}.`,
        affectedCategories: [category, component.category],
        affectedComponentIds: [component.id],
      });
      continue;
    }

    assignSelectedComponent(selectedComponents, category, component);
  }

  return selectedComponents;
}

function assignSelectedComponent(
  selectedComponents: SelectedKeyboardComponents,
  category: ComponentCategory,
  component: KeyboardComponent,
) {
  switch (category) {
    case "case":
      selectedComponents.case = component as CaseComponent;
      break;
    case "pcb":
      selectedComponents.pcb = component as PcbComponent;
      break;
    case "plate":
      selectedComponents.plate = component as PlateComponent;
      break;
    case "switch":
      selectedComponents.switch = component as SwitchComponent;
      break;
    case "keycap":
      selectedComponents.keycap = component as KeycapComponent;
      break;
    case "stabilizer":
      selectedComponents.stabilizer = component as StabilizerComponent;
      break;
  }
}

function validateLayoutCompatibility(
  selection: KeyboardBuildSelection,
  selected: SelectedKeyboardComponents,
  issues: CompatibilityIssue[],
) {
  const { case: keyboardCase, pcb, plate } = selected;

  if (keyboardCase && pcb && plate) {
    const sharedLayouts = intersect(
      intersect(keyboardCase.layouts, pcb.layouts),
      plate.layouts,
    );

    if (sharedLayouts.length === 0) {
      issues.push({
        code: "case_pcb_plate_layout_mismatch",
        severity: "error",
        message: `${keyboardCase.name}, ${pcb.name}, and ${plate.name} do not share a common physical layout.`,
        affectedCategories: ["case", "pcb", "plate"],
        affectedComponentIds: [keyboardCase.id, pcb.id, plate.id],
      });
    }
  }

  if (keyboardCase && pcb && !hasOverlap(keyboardCase.layouts, pcb.layouts)) {
    issues.push({
      code: "case_pcb_layout_mismatch",
      severity: "error",
      message: `${keyboardCase.name} does not support any layout offered by ${pcb.name}.`,
      affectedCategories: ["case", "pcb"],
      affectedComponentIds: [keyboardCase.id, pcb.id],
    });
  }

  if (plate && pcb && !hasOverlap(plate.layouts, pcb.layouts)) {
    issues.push({
      code: "plate_pcb_layout_mismatch",
      severity: "error",
      message: `${plate.name} does not match any layout offered by ${pcb.name}.`,
      affectedCategories: ["plate", "pcb"],
      affectedComponentIds: [plate.id, pcb.id],
    });
  }

  if (plate && keyboardCase && !hasOverlap(plate.layouts, keyboardCase.layouts)) {
    issues.push({
      code: "plate_case_layout_mismatch",
      severity: "error",
      message: `${plate.name} does not match any layout supported by ${keyboardCase.name}.`,
      affectedCategories: ["plate", "case"],
      affectedComponentIds: [plate.id, keyboardCase.id],
    });
  }

  validatePreferredLayout(selection.preferences, selected, issues);
}

function validatePreferredLayout(
  preferences: BuildPreferences | undefined,
  selected: SelectedKeyboardComponents,
  issues: CompatibilityIssue[],
) {
  if (!preferences?.layout) {
    return;
  }

  const preferredLayout = preferences.layout;
  const layoutChecks = [
    {
      component: selected.case,
      layouts: selected.case?.layouts,
      category: "case",
    },
    {
      component: selected.pcb,
      layouts: selected.pcb?.layouts,
      category: "pcb",
    },
    {
      component: selected.plate,
      layouts: selected.plate?.layouts,
      category: "plate",
    },
  ] as const;

  for (const check of layoutChecks) {
    if (check.component && !check.layouts?.includes(preferredLayout)) {
      issues.push({
        code: `${check.category}_preferred_layout_mismatch`,
        severity: "error",
        message: `${check.component.name} does not support the preferred ${preferredLayout.toUpperCase()} layout.`,
        affectedCategories: [check.category],
        affectedComponentIds: [check.component.id],
      });
    }
  }
}

function validateMountCompatibility(
  selected: SelectedKeyboardComponents,
  issues: CompatibilityIssue[],
) {
  const { case: keyboardCase, pcb, plate } = selected;

  if (
    keyboardCase &&
    pcb &&
    !hasOverlap(keyboardCase.caseMountSupport, pcb.pcbMountSupport)
  ) {
    issues.push({
      code: "case_pcb_mount_mismatch",
      severity: "error",
      message: `${keyboardCase.name} and ${pcb.name} do not share a supported mounting style.`,
      affectedCategories: ["case", "pcb"],
      affectedComponentIds: [keyboardCase.id, pcb.id],
    });
  }

  if (
    keyboardCase &&
    plate &&
    !hasOverlap(keyboardCase.caseMountSupport, plate.plateMountSupport)
  ) {
    issues.push({
      code: "case_plate_mount_mismatch",
      severity: "error",
      message: `${keyboardCase.name} and ${plate.name} do not share a supported mounting style.`,
      affectedCategories: ["case", "plate"],
      affectedComponentIds: [keyboardCase.id, plate.id],
    });
  }
}

function validateKitStructuralIntegrity(
  selected: SelectedKeyboardComponents,
  issues: CompatibilityIssue[],
) {
  const kitLockedStructuralParts = getKitLockedStructuralParts(selected);

  if (kitLockedStructuralParts.length === 0) {
    return;
  }

  const kitIds = new Set(
    kitLockedStructuralParts.map(({ component }) =>
      getMetadataString(component.metadata, "kitId"),
    ),
  );

  if (kitIds.size === 1 && !kitIds.has(undefined)) {
    return;
  }

  issues.push({
    code: "kit_structural_mismatch",
    severity: "error",
    message:
      "Kit-derived structural parts must come from the same barebones kit. The selected case, PCB, plate, or included stabilizer are from different kits.",
    affectedCategories: kitLockedStructuralParts.map(({ category }) => category),
    affectedComponentIds: kitLockedStructuralParts.map(
      ({ component }) => component.id,
    ),
  });
}

function getKitLockedStructuralParts(selected: SelectedKeyboardComponents) {
  const structuralParts: KitLockedStructuralPart[] = [];

  if (selected.case) {
    structuralParts.push({ category: "case", component: selected.case });
  }

  if (selected.pcb) {
    structuralParts.push({ category: "pcb", component: selected.pcb });
  }

  if (selected.plate) {
    structuralParts.push({ category: "plate", component: selected.plate });
  }

  if (selected.stabilizer) {
    structuralParts.push({
      category: "stabilizer",
      component: selected.stabilizer,
    });
  }

  return structuralParts.filter((part) =>
    isKitLockedStructuralComponent(part.category, part.component),
  );
}

function isKitLockedStructuralComponent(
  category: StructuralKitCategory,
  component: StructuralKitComponent,
) {
  if (category === "stabilizer") {
    return (
      getMetadataBoolean(component.metadata, "kitLock") ||
      getMetadataString(component.metadata, "sourceType") === "kit_derived"
    );
  }

  return getMetadataBoolean(component.metadata, "kitLock");
}

function validateSwitchCompatibility(
  selected: SelectedKeyboardComponents,
  issues: CompatibilityIssue[],
) {
  const { keycap, pcb, plate, switch: selectedSwitch } = selected;

  if (
    selectedSwitch &&
    pcb &&
    !pcb.switchTechnologySupport.includes(selectedSwitch.switchTechnology)
  ) {
    issues.push({
      code: "switch_pcb_technology_mismatch",
      severity: "error",
      message: `${selectedSwitch.name} uses ${selectedSwitch.switchTechnology}, but ${pcb.name} does not support that switch technology.`,
      affectedCategories: ["switch", "pcb"],
      affectedComponentIds: [selectedSwitch.id, pcb.id],
    });
  }

  if (
    selectedSwitch &&
    plate &&
    !plate.switchTechnologySupport.includes(selectedSwitch.switchTechnology)
  ) {
    issues.push({
      code: "switch_plate_technology_mismatch",
      severity: "error",
      message: `${selectedSwitch.name} is not compatible with the switch cutouts for ${plate.name}.`,
      affectedCategories: ["switch", "plate"],
      affectedComponentIds: [selectedSwitch.id, plate.id],
    });
  }

  if (
    selectedSwitch &&
    keycap &&
    !keycap.compatibleSwitchTechnologies.includes(
      selectedSwitch.switchTechnology,
    )
  ) {
    issues.push({
      code: "switch_keycap_technology_mismatch",
      severity: "error",
      message: `${keycap.name} is not compatible with ${selectedSwitch.switchTechnology} switches.`,
      affectedCategories: ["switch", "keycap"],
      affectedComponentIds: [selectedSwitch.id, keycap.id],
    });
  }
}

function validateKeycapCompatibility(
  selection: KeyboardBuildSelection,
  selected: SelectedKeyboardComponents,
  issues: CompatibilityIssue[],
) {
  const { keycap } = selected;

  if (!keycap) {
    return;
  }

  const preferredLayout = selection.preferences?.layout;

  if (preferredLayout && !keycap.layoutSupport.includes(preferredLayout)) {
    issues.push({
      code: "keycap_preferred_layout_mismatch",
      severity: "error",
      message: `${keycap.name} does not include keycaps for the preferred ${preferredLayout.toUpperCase()} layout.`,
      affectedCategories: ["keycap"],
      affectedComponentIds: [keycap.id],
    });
    return;
  }

  const physicalLayouts = getPhysicalCandidateLayouts(selection, selected);

  if (physicalLayouts.length > 0 && !hasOverlap(keycap.layoutSupport, physicalLayouts)) {
    issues.push({
      code: "keycap_layout_mismatch",
      severity: "error",
      message: `${keycap.name} does not support the selected build layout.`,
      affectedCategories: ["keycap"],
      affectedComponentIds: [keycap.id],
    });
  }
}

function validateStabilizerCompatibility(
  selection: KeyboardBuildSelection,
  selected: SelectedKeyboardComponents,
  issues: CompatibilityIssue[],
) {
  const { pcb, stabilizer } = selected;

  if (!stabilizer) {
    return;
  }

  if (pcb && !pcb.stabilizerTypeSupport.includes(stabilizer.stabilizerType)) {
    issues.push({
      code: "stabilizer_pcb_type_mismatch",
      severity: "error",
      message: `${stabilizer.name} uses ${stabilizer.stabilizerType}, but ${pcb.name} does not support that stabilizer type.`,
      affectedCategories: ["stabilizer", "pcb"],
      affectedComponentIds: [stabilizer.id, pcb.id],
    });
  }

  const physicalLayouts = getPhysicalCandidateLayouts(selection, selected);

  if (physicalLayouts.length === 0) {
    return;
  }

  const satisfiableLayouts = physicalLayouts.filter((layout) => {
    const requiredSizes = requiredStabilizerSizesByLayout[layout];

    return (
      stabilizer.supportedLayouts.includes(layout) &&
      requiredSizes.every((size) => stabilizer.supportedSizes.includes(size))
    );
  });

  if (satisfiableLayouts.length === 0) {
    issues.push({
      code: "stabilizer_layout_requirements_mismatch",
      severity: "error",
      message: `${stabilizer.name} does not satisfy the stabilizer size requirements for the selected layout.`,
      affectedCategories: ["stabilizer"],
      affectedComponentIds: [stabilizer.id],
    });
  }
}

function validatePreferenceWarnings(
  selection: KeyboardBuildSelection,
  selected: SelectedKeyboardComponents,
  issues: CompatibilityIssue[],
) {
  const preferredSound = selection.preferences?.soundProfile;

  if (preferredSound) {
    for (const component of getSoundRelevantComponents(selected)) {
      if (
        component.soundProfile &&
        component.soundProfile !== "neutral" &&
        component.soundProfile !== preferredSound
      ) {
        issues.push({
          code: "sound_profile_mismatch",
          severity: "warning",
          message: `${component.name} sounds ${component.soundProfile}, which may not match the requested ${preferredSound} sound profile.`,
          affectedCategories: [component.category],
          affectedComponentIds: [component.id],
        });
      }
    }
  }

  if (selection.preferences?.beginnerFriendly) {
    for (const component of Object.values(selected)) {
      if (component && !component.beginnerFriendly) {
        issues.push({
          code: "beginner_friendliness_mismatch",
          severity: "warning",
          message: `${component.name} may be less beginner-friendly than requested.`,
          affectedCategories: [component.category],
          affectedComponentIds: [component.id],
        });
      }
    }
  }
}

function getPhysicalCandidateLayouts(
  selection: KeyboardBuildSelection,
  selected: SelectedKeyboardComponents,
) {
  let layouts: KeyboardLayout[] | undefined = selection.preferences?.layout
    ? [selection.preferences.layout]
    : undefined;

  for (const candidate of [
    selected.case?.layouts,
    selected.pcb?.layouts,
    selected.plate?.layouts,
  ]) {
    if (!candidate) {
      continue;
    }

    layouts = layouts ? intersect(layouts, candidate) : [...candidate];
  }

  return layouts ?? [];
}

function getSoundRelevantComponents(selected: SelectedKeyboardComponents) {
  return [
    selected.case,
    selected.plate,
    selected.switch,
    selected.keycap,
  ].filter(isDefined);
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Plate material is the cheapest lever a builder has on how a board sounds, but
 * a bare part name doesn't communicate that — swapping polycarbonate for steel
 * looks like a no-op in the UI until something says otherwise.
 *
 * This is an `info` annotation, deliberately: it never affects `isValid`, never
 * appears in errors or warnings, and the rule engine remains the sole authority
 * on compatibility. It only describes a part the user already chose. The copy is
 * a fixed table keyed on catalog metadata, not generated text, so nothing here
 * can hallucinate a claim about a plate.
 */
const plateMaterialCharacter: Record<string, string> = {
  brass:
    "Brass is the densest plate here: a stiff typing feel and a bright, resonant tone. Expect a noticeably higher pitch than polycarbonate or POM.",
  steel:
    "Steel is stiff with very little flex, giving a sharper and more pronounced sound than FR4 or POM.",
  aluminum:
    "Aluminum is stiff enough to reflect energy back into the switch rather than absorb it, which sharpens the attack of each keypress.",
  carbon_fiber:
    "Carbon fibre is light but very stiff — clacky, with a drier character than brass.",
  fr4: "FR4 is the neutral middle ground: firmer than POM or polycarbonate, but with enough flex to stay forgiving.",
  pom: "POM flexes softly and rounds off the high frequencies, giving the deepest, thockiest tone of the common plate materials.",
  polycarbonate:
    "Polycarbonate flexes the most, cushioning the typing feel and muting the highs that a metal plate would emphasise.",
};

function annotatePlateCharacter(
  selected: SelectedKeyboardComponents,
  issues: CompatibilityIssue[],
) {
  const { plate } = selected;

  if (!plate) {
    return;
  }

  const material = getMetadataString(plate.metadata, "plateMaterial");
  const character = material ? plateMaterialCharacter[material] : undefined;

  if (!character) {
    return;
  }

  issues.push({
    code: "plate_material_character",
    severity: "info",
    message: `${plate.name}: ${character}`,
    affectedCategories: ["plate"],
    affectedComponentIds: [plate.id],
  });
}

function buildExplanations(
  errors: CompatibilityIssue[],
  warnings: CompatibilityIssue[],
) {
  if (errors.length === 0 && warnings.length === 0) {
    return [
      "Build compatibility passed all deterministic Phase 1 validation rules.",
    ];
  }

  return [...errors, ...warnings].map((issue) => issue.message);
}

function hasOverlap<T>(left: readonly T[], right: readonly T[]) {
  return left.some((item) => right.includes(item));
}

function intersect<T>(left: readonly T[], right: readonly T[]) {
  return left.filter((item) => right.includes(item));
}

function getMetadataString(
  metadata: KeyboardComponent["metadata"],
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" ? value : undefined;
}

function getMetadataBoolean(
  metadata: KeyboardComponent["metadata"],
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "boolean" ? value : false;
}
