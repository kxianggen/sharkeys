import { keyboardComponents } from "@/data";
import { validateBuildCompatibility } from "@/lib/rules";
import {
  componentCategorySchema,
  type ComponentCategory,
  type CurrencyCode,
  type KeyboardBuildSelection,
  type KeyboardComponent,
  type KeyboardLayout,
  type SoundProfile,
  type SwitchTechnology,
} from "@/lib/types";

export type ComponentSearchCriteria = {
  category?: ComponentCategory;
  query?: string;
  layout?: KeyboardLayout;
  switchTechnology?: SwitchTechnology;
  soundProfile?: SoundProfile;
  beginnerFriendly?: boolean;
  maxPrice?: number;
  currency?: CurrencyCode;
};

export type ComponentsByCategory = Record<
  ComponentCategory,
  KeyboardComponent[]
>;

export function listComponents() {
  return [...keyboardComponents];
}

export function listComponentsByCategory(category: ComponentCategory) {
  componentCategorySchema.parse(category);

  return keyboardComponents.filter((component) => component.category === category);
}

export function getComponentById(id: string) {
  return keyboardComponents.find((component) => component.id === id);
}

export function groupComponentsByCategory(
  components: readonly KeyboardComponent[] = keyboardComponents,
): ComponentsByCategory {
  const grouped = Object.fromEntries(
    componentCategorySchema.options.map((category) => [category, []]),
  ) as unknown as ComponentsByCategory;

  for (const component of components) {
    grouped[component.category].push(component);
  }

  return grouped;
}

export function searchComponents(criteria: ComponentSearchCriteria = {}) {
  const normalizedQuery = criteria.query?.trim().toLowerCase();

  return keyboardComponents.filter((component) => {
    if (criteria.category && component.category !== criteria.category) {
      return false;
    }

    if (normalizedQuery && !matchesTextQuery(component, normalizedQuery)) {
      return false;
    }

    if (criteria.layout && !supportsLayout(component, criteria.layout)) {
      return false;
    }

    if (
      criteria.switchTechnology &&
      !supportsSwitchTechnology(component, criteria.switchTechnology)
    ) {
      return false;
    }

    if (
      criteria.soundProfile &&
      component.soundProfile &&
      component.soundProfile !== criteria.soundProfile
    ) {
      return false;
    }

    if (
      criteria.beginnerFriendly !== undefined &&
      component.beginnerFriendly !== criteria.beginnerFriendly
    ) {
      return false;
    }

    if (
      criteria.maxPrice !== undefined &&
      component.price !== undefined &&
      (!criteria.currency || component.priceCurrency === criteria.currency) &&
      component.price > criteria.maxPrice
    ) {
      return false;
    }

    return true;
  });
}

export function validateBuildSelectionFromIds(
  selection: KeyboardBuildSelection,
) {
  return validateBuildCompatibility(selection, keyboardComponents);
}

function matchesTextQuery(component: KeyboardComponent, query: string) {
  return [component.name, component.brand, component.description]
    .filter(isString)
    .some((value) => value.toLowerCase().includes(query));
}

function isString(value: string | undefined): value is string {
  return value !== undefined;
}

function supportsLayout(component: KeyboardComponent, layout: KeyboardLayout) {
  switch (component.category) {
    case "case":
    case "pcb":
    case "plate":
      return component.layouts.includes(layout);
    case "keycap":
      return component.layoutSupport.includes(layout);
    case "stabilizer":
      return component.supportedLayouts.includes(layout);
    case "switch":
      return true;
  }
}

function supportsSwitchTechnology(
  component: KeyboardComponent,
  switchTechnology: SwitchTechnology,
) {
  switch (component.category) {
    case "pcb":
    case "plate":
      return component.switchTechnologySupport.includes(switchTechnology);
    case "switch":
      return component.switchTechnology === switchTechnology;
    case "keycap":
      return component.compatibleSwitchTechnologies.includes(switchTechnology);
    case "case":
    case "stabilizer":
      return true;
  }
}
