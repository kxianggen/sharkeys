import type { SupabaseClient } from "@supabase/supabase-js";

import { keyboardComponents } from "@/data";
import { readOptionalSupabasePublicEnv } from "@/lib/env";
import { createSupabaseClient } from "@/lib/supabase";
import {
  keyboardComponentCatalogSchema,
  keyboardComponentSchema,
  type KeyboardComponent,
} from "@/lib/types";
import type { Database } from "@/lib/types/database";

import {
  getComponentById,
  groupComponentsByCategory,
  listComponentsByCategory,
  searchComponents,
  validateBuildSelectionFromIds,
  type ComponentSearchCriteria,
} from "./repository";

type KeyboardComponentRow =
  Database["public"]["Tables"]["keyboard_components"]["Row"];

export type SupabaseCatalogClient = Pick<
  SupabaseClient<Database>,
  "from"
>;

export type CatalogSource = "seed" | "supabase";

export type CatalogFallbackReason =
  | "supabase_unconfigured"
  | "supabase_error"
  | "supabase_empty";

export type CatalogLoadResult = {
  components: KeyboardComponent[];
  source: CatalogSource;
  fallbackReason?: CatalogFallbackReason;
  error?: string;
};

type CatalogLoadOptions = {
  env?: Record<string, string | undefined>;
  supabaseClient?: SupabaseCatalogClient;
};

export async function loadCatalogComponents(
  options: CatalogLoadOptions = {},
): Promise<CatalogLoadResult> {
  const env = readOptionalSupabasePublicEnv(options.env);

  if (!env) {
    return seedCatalogResult("supabase_unconfigured");
  }

  try {
    const components = await fetchSupabaseCatalogComponents(
      options.supabaseClient ?? createSupabaseClient(),
    );

    if (components.length === 0) {
      return seedCatalogResult("supabase_empty");
    }

    return {
      components,
      source: "supabase",
    };
  } catch (error) {
    return seedCatalogResult(
      "supabase_error",
      error instanceof Error ? error.message : "Unknown Supabase catalog error.",
    );
  }
}

export async function getCatalogComponents(options?: CatalogLoadOptions) {
  const result = await loadCatalogComponents(options);

  return result.components;
}

export async function listCatalogComponents(options?: CatalogLoadOptions) {
  return [...(await getCatalogComponents(options))];
}

export async function listCatalogComponentsByCategory(
  category: Parameters<typeof listComponentsByCategory>[0],
  options?: CatalogLoadOptions,
) {
  const components = await getCatalogComponents(options);

  return listComponentsByCategory(category, components);
}

export async function getCatalogComponentById(
  id: string,
  options?: CatalogLoadOptions,
) {
  const components = await getCatalogComponents(options);

  return getComponentById(id, components);
}

export async function searchCatalogComponents(
  criteria: ComponentSearchCriteria = {},
  options?: CatalogLoadOptions,
) {
  const components = await getCatalogComponents(options);

  return searchComponents(criteria, components);
}

export async function groupCatalogComponentsByCategory(
  options?: CatalogLoadOptions,
) {
  const components = await getCatalogComponents(options);

  return groupComponentsByCategory(components);
}

export async function validateCatalogBuildSelectionFromIds(
  selection: Parameters<typeof validateBuildSelectionFromIds>[0],
  options?: CatalogLoadOptions,
) {
  const components = await getCatalogComponents(options);

  return validateBuildSelectionFromIds(selection, components);
}

export async function fetchSupabaseCatalogComponents(
  client: SupabaseCatalogClient,
) {
  const { data, error } = await client
    .from("keyboard_components")
    .select("*")
    .order("category", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return keyboardComponentCatalogSchema.parse(
    (data ?? []).map(mapSupabaseKeyboardComponentRow),
  );
}

export function mapSupabaseKeyboardComponentRow(
  row: KeyboardComponentRow,
): KeyboardComponent {
  const base = {
    id: row.id,
    category: row.category,
    name: row.name,
    brand: row.brand,
    description: optionalString(row.description),
    beginnerFriendly: row.beginner_friendly,
    price: optionalNumber(row.price),
    priceCurrency: optionalString(row.price_currency),
    vendorUrl: optionalString(row.vendor_url),
    imageUrl: optionalString(row.image_url),
    soundUrl: optionalString(row.sound_url),
    soundProfile: optionalString(row.sound_profile),
    metadata: isRecord(row.metadata) ? row.metadata : {},
  };

  switch (row.category) {
    case "case":
      return keyboardComponentSchema.parse({
        ...base,
        category: "case",
        layouts: requiredArray(row.layouts),
        caseMountSupport: requiredArray(row.case_mount_support),
      });
    case "pcb":
      return keyboardComponentSchema.parse({
        ...base,
        category: "pcb",
        layouts: requiredArray(row.layouts),
        switchTechnologySupport: requiredArray(row.switch_technology_support),
        pcbMountSupport: requiredArray(row.pcb_mount_support),
        stabilizerTypeSupport: requiredArray(row.stabilizer_type_support),
        connection: row.connection,
        hotswap: row.hotswap,
      });
    case "plate":
      return keyboardComponentSchema.parse({
        ...base,
        category: "plate",
        layouts: requiredArray(row.layouts),
        plateMountSupport: requiredArray(row.plate_mount_support),
        switchTechnologySupport: requiredArray(row.switch_technology_support),
      });
    case "switch":
      return keyboardComponentSchema.parse({
        ...base,
        category: "switch",
        switchTechnology: row.switch_technology,
        pinCount: optionalNumber(row.pin_count),
        actuationForceG: optionalNumber(row.actuation_force_g),
      });
    case "keycap":
      return keyboardComponentSchema.parse({
        ...base,
        category: "keycap",
        keycapProfile: row.keycap_profile,
        layoutSupport: requiredArray(row.keycap_layout_support),
        compatibleSwitchTechnologies: requiredArray(
          row.compatible_switch_technologies,
        ),
      });
    case "stabilizer":
      return keyboardComponentSchema.parse({
        ...base,
        category: "stabilizer",
        stabilizerType: row.stabilizer_type,
        supportedLayouts: requiredArray(row.supported_layouts),
        supportedSizes: requiredArray(row.supported_stabilizer_sizes),
      });
    default:
      return keyboardComponentSchema.parse(base);
  }
}

function seedCatalogResult(
  fallbackReason: CatalogFallbackReason,
  error?: string,
): CatalogLoadResult {
  return {
    components: [...keyboardComponents],
    source: "seed",
    fallbackReason,
    error,
  };
}

function optionalString(value: string | null) {
  return value ?? undefined;
}

function optionalNumber(value: number | string | null) {
  if (value === null) {
    return undefined;
  }

  return typeof value === "number" ? value : Number(value);
}

function requiredArray(value: string[] | null) {
  return value ?? [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
