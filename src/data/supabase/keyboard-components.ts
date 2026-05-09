import { keyboardComponents } from "@/data/components";
import type { Database } from "@/lib/types/database";
import type { Json } from "@/lib/types/database";
import type { KeyboardComponent } from "@/lib/types";

type KeyboardComponentInsert =
  Database["public"]["Tables"]["keyboard_components"]["Insert"];

type ComponentSoundSampleInsert =
  Database["public"]["Tables"]["component_sound_samples"]["Insert"];

export function toSupabaseKeyboardComponentInsert(
  component: KeyboardComponent,
): KeyboardComponentInsert {
  return {
    id: component.id,
    category: component.category,
    name: component.name,
    brand: component.brand,
    description: component.description ?? null,
    beginner_friendly: component.beginnerFriendly,
    layouts: getLayouts(component),
    switch_technology:
      component.category === "switch" ? component.switchTechnology : null,
    switch_technology_support: getSwitchTechnologySupport(component),
    case_mount_support:
      component.category === "case" ? component.caseMountSupport : null,
    pcb_mount_support:
      component.category === "pcb" ? component.pcbMountSupport : null,
    plate_mount_support:
      component.category === "plate" ? component.plateMountSupport : null,
    keycap_profile:
      component.category === "keycap" ? component.keycapProfile : null,
    keycap_layout_support:
      component.category === "keycap" ? component.layoutSupport : null,
    compatible_switch_technologies:
      component.category === "keycap"
        ? component.compatibleSwitchTechnologies
        : null,
    stabilizer_type:
      component.category === "stabilizer" ? component.stabilizerType : null,
    stabilizer_type_support:
      component.category === "pcb" ? component.stabilizerTypeSupport : null,
    supported_layouts:
      component.category === "stabilizer" ? component.supportedLayouts : null,
    supported_stabilizer_sizes:
      component.category === "stabilizer" ? component.supportedSizes : null,
    connection: component.category === "pcb" ? component.connection : null,
    hotswap: component.category === "pcb" ? component.hotswap : null,
    pin_count: component.category === "switch" ? component.pinCount ?? null : null,
    actuation_force_g:
      component.category === "switch"
        ? component.actuationForceG ?? null
        : null,
    sound_profile: component.soundProfile ?? null,
    price: component.price ?? null,
    price_currency: component.priceCurrency ?? null,
    vendor_url: component.vendorUrl ?? null,
    image_url: component.imageUrl ?? null,
    sound_url: component.soundUrl ?? null,
    metadata: (component.metadata ?? {}) as Json,
  };
}

export function toSupabaseSoundSampleInsert(
  component: KeyboardComponent,
): ComponentSoundSampleInsert | undefined {
  if (!component.soundUrl || !component.soundProfile) {
    return undefined;
  }

  return {
    component_id: component.id,
    sound_profile: component.soundProfile,
    sound_url: component.soundUrl,
    source_name: component.brand,
    metadata: {},
  };
}

export const supabaseKeyboardComponentSeed = keyboardComponents.map(
  toSupabaseKeyboardComponentInsert,
);

export const supabaseSoundSampleSeed = keyboardComponents
  .map(toSupabaseSoundSampleInsert)
  .filter((sample): sample is ComponentSoundSampleInsert => sample !== undefined);

function getLayouts(component: KeyboardComponent) {
  switch (component.category) {
    case "case":
    case "pcb":
    case "plate":
      return component.layouts;
    case "keycap":
      return component.layoutSupport;
    case "stabilizer":
      return component.supportedLayouts;
    case "switch":
      return null;
  }
}

function getSwitchTechnologySupport(component: KeyboardComponent) {
  switch (component.category) {
    case "pcb":
    case "plate":
      return component.switchTechnologySupport;
    case "keycap":
      return component.compatibleSwitchTechnologies;
    case "switch":
      return [component.switchTechnology];
    case "case":
    case "stabilizer":
      return null;
  }
}
