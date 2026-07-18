import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// createBuildPostAction is exercised with the real seed catalog + real rule
// engine; only the auth/storage/DB boundaries are mocked.
const authMocks = vi.hoisted(() => ({ requireUser: vi.fn() }));
const supaMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  insert: vi.fn(),
}));
const navMocks = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("@/lib/auth", () => ({ requireUser: authMocks.requireUser }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: supaMocks.createClient,
}));
vi.mock("@/lib/gallery/upload-image", () => ({
  uploadBuildPostImage: vi.fn().mockResolvedValue(null),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: navMocks.redirect }));

import { createBuildPostAction } from "@/app/community-gallery/actions";

function makeFormData(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

function lastInsertArg() {
  return supaMocks.insert.mock.calls.at(-1)?.[0] as Record<string, unknown>;
}

describe("createBuildPostAction", () => {
  beforeEach(() => {
    authMocks.requireUser.mockResolvedValue({ id: "user-1" });
    const single = vi
      .fn()
      .mockResolvedValue({ data: { id: "post-1" }, error: null });
    const select = vi.fn(() => ({ single }));
    supaMocks.insert.mockReturnValue({ select });
    supaMocks.createClient.mockResolvedValue({
      from: vi.fn(() => ({ insert: supaMocks.insert })),
    });
  });

  afterEach(() => vi.clearAllMocks());

  it("publishes a buildless post (title only) with empty components and no validation snapshot", async () => {
    const result = await createBuildPostAction(
      null,
      makeFormData({ title: "Just sharing a thought" }),
    );

    // No error returned; a buildless post must never fail for "missing parts".
    expect(result).toBeUndefined();
    const inserted = lastInsertArg();
    expect(inserted.component_ids).toEqual({});
    expect(inserted.validation_snapshot).toBeNull();
    expect(navMocks.redirect).toHaveBeenCalledWith("/community-gallery/post-1");
  });

  it("publishes a valid full build with a frozen validation snapshot", async () => {
    const result = await createBuildPostAction(
      null,
      makeFormData({
        title: "Creamy gmk67",
        case: "case_gmk67_65_plastic",
        pcb: "pcb_gmk67_65_hotswap",
        plate: "plate_gmk67_65_pc",
        switch: "switch_gateron_milky_yellow_pro",
        keycap: "keycap_unknown_pudding_oem_pbt",
        stabilizer: "stab_gmk67_plate_mount",
      }),
    );

    expect(result).toBeUndefined();
    const inserted = lastInsertArg();
    expect(inserted.validation_snapshot).not.toBeNull();
    expect(navMocks.redirect).toHaveBeenCalled();
  });

  it("rejects an incompatible stabilizer server-side and does not insert", async () => {
    // gmk67 PCB is plate_mount only; a screw-in stabilizer is impossible.
    const result = await createBuildPostAction(
      null,
      makeFormData({
        title: "Impossible build",
        case: "case_gmk67_65_plastic",
        pcb: "pcb_gmk67_65_hotswap",
        plate: "plate_gmk67_65_pc",
        switch: "switch_gateron_milky_yellow_pro",
        keycap: "keycap_unknown_pudding_oem_pbt",
        stabilizer: "stab_c3_equalz_v3_screw_in",
      }),
    );

    expect(result?.error).toBeTruthy();
    expect(supaMocks.insert).not.toHaveBeenCalled();
    expect(navMocks.redirect).not.toHaveBeenCalled();
  });
});
