import { describe, expect, it, vi } from "vitest";

import { keyboardComponents, supabaseKeyboardComponentSeed } from "@/data";
import {
  fetchSupabaseCatalogComponents,
  loadCatalogComponents,
  type SupabaseCatalogClient,
} from "@/lib/components";
import type { Database } from "@/lib/types/database";

type KeyboardComponentRow =
  Database["public"]["Tables"]["keyboard_components"]["Row"];

const realLookingSupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.prototype-demo-key",
};

const placeholderSupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://your-project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "your-supabase-anon-key",
};

describe("Supabase catalog source", () => {
  it("uses the seed catalog when Supabase is not configured", async () => {
    const result = await loadCatalogComponents({ env: {} });

    expect(result.source).toBe("seed");
    expect(result.fallbackReason).toBe("supabase_unconfigured");
    expect(result.components).toHaveLength(keyboardComponents.length);
  });

  it("uses the seed catalog for .env.example-style Supabase placeholders", async () => {
    const { client, from } = createMockSupabaseClient({
      data: supabaseKeyboardComponentSeed.slice(0, 2).map(toKeyboardComponentRow),
      error: null,
    });

    const result = await loadCatalogComponents({
      env: placeholderSupabaseEnv,
      supabaseClient: client,
    });

    expect(result.source).toBe("seed");
    expect(result.fallbackReason).toBe("supabase_unconfigured");
    expect(result.components).toHaveLength(keyboardComponents.length);
    expect(from).not.toHaveBeenCalled();
  });

  it("reads keyboard components from Supabase rows when available", async () => {
    const { client } = createMockSupabaseClient({
      data: supabaseKeyboardComponentSeed.map(toKeyboardComponentRow),
      error: null,
    });

    const components = await fetchSupabaseCatalogComponents(client);

    expect(components).toHaveLength(keyboardComponents.length);
    expect(components[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        category: expect.any(String),
      }),
    );
  });

  it("reports Supabase as the active source when configured reads succeed", async () => {
    const { client } = createMockSupabaseClient({
      data: supabaseKeyboardComponentSeed.slice(0, 2).map(toKeyboardComponentRow),
      error: null,
    });

    const result = await loadCatalogComponents({
      env: realLookingSupabaseEnv,
      supabaseClient: client,
    });

    expect(result.source).toBe("supabase");
    expect(result.fallbackReason).toBeUndefined();
    expect(result.components).toHaveLength(2);
  });

  it("falls back to seed data when Supabase returns an error", async () => {
    const { client } = createMockSupabaseClient({
      data: null,
      error: { message: "permission denied for table keyboard_components" },
    });

    const result = await loadCatalogComponents({
      env: realLookingSupabaseEnv,
      supabaseClient: client,
    });

    expect(result.source).toBe("seed");
    expect(result.fallbackReason).toBe("supabase_error");
    expect(result.error).toContain("permission denied");
    expect(result.components).toHaveLength(keyboardComponents.length);
  });
});

function createMockSupabaseClient(result: {
  data: KeyboardComponentRow[] | null;
  error: { message: string } | null;
}) {
  const order = vi.fn(async () => result);
  const select = vi.fn(() => ({ order }));
  const from = vi.fn(() => ({ select }));

  return {
    client: { from } as unknown as SupabaseCatalogClient,
    from,
    select,
    order,
  };
}

function toKeyboardComponentRow(
  insert: (typeof supabaseKeyboardComponentSeed)[number],
): KeyboardComponentRow {
  return {
    id: insert.id,
    category: insert.category,
    name: insert.name,
    brand: insert.brand,
    description: insert.description ?? null,
    beginner_friendly: insert.beginner_friendly ?? false,
    layouts: insert.layouts ?? null,
    switch_technology: insert.switch_technology ?? null,
    switch_technology_support: insert.switch_technology_support ?? null,
    case_mount_support: insert.case_mount_support ?? null,
    pcb_mount_support: insert.pcb_mount_support ?? null,
    plate_mount_support: insert.plate_mount_support ?? null,
    keycap_profile: insert.keycap_profile ?? null,
    keycap_layout_support: insert.keycap_layout_support ?? null,
    compatible_switch_technologies:
      insert.compatible_switch_technologies ?? null,
    stabilizer_type: insert.stabilizer_type ?? null,
    stabilizer_type_support: insert.stabilizer_type_support ?? null,
    supported_layouts: insert.supported_layouts ?? null,
    supported_stabilizer_sizes: insert.supported_stabilizer_sizes ?? null,
    connection: insert.connection ?? null,
    hotswap: insert.hotswap ?? null,
    pin_count: insert.pin_count ?? null,
    actuation_force_g: insert.actuation_force_g ?? null,
    sound_profile: insert.sound_profile ?? null,
    price: insert.price ?? null,
    price_currency: insert.price_currency ?? null,
    vendor_url: insert.vendor_url ?? null,
    image_url: insert.image_url ?? null,
    sound_url: insert.sound_url ?? null,
    metadata: insert.metadata ?? {},
    created_at: "2026-05-15T00:00:00.000Z",
    updated_at: "2026-05-15T00:00:00.000Z",
  };
}
