import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const actionMocks = vi.hoisted(() => ({
  migrateLocalSavedBuildsAction: vi.fn(),
}));
const navigationMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("@/app/my-builds/actions", () => ({
  migrateLocalSavedBuildsAction: actionMocks.migrateLocalSavedBuildsAction,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: navigationMocks.refresh }),
}));

import { LocalBuildsMigrator } from "@/components/local-builds-migrator";
import { LEGACY_SAVED_BUILDS_KEY } from "@/lib/saved-builds/legacy-local-storage";

const legacyBuild = {
  id: "saved_recommendation_test",
  title: "Lucky65 V3 with MMD Princess",
  createdAt: "2026-05-25T00:00:00.000Z",
  source: "recommendation",
  componentIds: {
    case: "case_lucky65_v3_65_aluminum",
    pcb: "pcb_lucky65_v3_65_hotswap",
    plate: "plate_lucky65_v3_65_fr4",
    switch: "switch_mmd_princess_linear_v3",
    keycap: "keycap_unknown_pudding_oem_pbt",
    stabilizer: "stab_lucky65_v3_screw_in",
  },
  estimatedPrice: 459,
  estimatedPriceCurrency: "MYR",
  validation: { isValid: true },
};

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  } as Storage;
}

describe("LocalBuildsMigrator", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createLocalStorageMock(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("migrates legacy localStorage builds once, clears the key, and shows a notice", async () => {
    window.localStorage.setItem(
      LEGACY_SAVED_BUILDS_KEY,
      JSON.stringify([legacyBuild]),
    );
    actionMocks.migrateLocalSavedBuildsAction.mockResolvedValue({
      migrated: 1,
      skipped: 0,
    });

    render(<LocalBuildsMigrator />);

    await waitFor(() => {
      expect(actionMocks.migrateLocalSavedBuildsAction).toHaveBeenCalledWith([
        {
          componentIds: legacyBuild.componentIds,
          title: legacyBuild.title,
          source: "recommendation",
        },
      ]);
    });

    // The key is cleared so the migration never repeats…
    await waitFor(() => {
      expect(window.localStorage.getItem(LEGACY_SAVED_BUILDS_KEY)).toBeNull();
    });
    // …the server list is refreshed, and a quiet notice appears.
    expect(navigationMocks.refresh).toHaveBeenCalled();
    expect(
      await screen.findByTestId("local-builds-migration-notice"),
    ).toHaveTextContent(/Restored 1 saved build from this browser/i);
  });

  it("mentions skipped builds when some legacy entries fail re-validation", async () => {
    window.localStorage.setItem(
      LEGACY_SAVED_BUILDS_KEY,
      JSON.stringify([legacyBuild, { ...legacyBuild, id: "saved_other" }]),
    );
    actionMocks.migrateLocalSavedBuildsAction.mockResolvedValue({
      migrated: 1,
      skipped: 1,
    });

    render(<LocalBuildsMigrator />);

    expect(
      await screen.findByTestId("local-builds-migration-notice"),
    ).toHaveTextContent(/1 skipped as incompatible/i);
    expect(window.localStorage.getItem(LEGACY_SAVED_BUILDS_KEY)).toBeNull();
  });

  it("does nothing when no legacy key exists", async () => {
    render(<LocalBuildsMigrator />);

    // Effect runs post-render; give it a tick before asserting the negative.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(actionMocks.migrateLocalSavedBuildsAction).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId("local-builds-migration-notice"),
    ).toBeNull();
  });

  it("clears an unusable legacy key without calling the action", async () => {
    window.localStorage.setItem(LEGACY_SAVED_BUILDS_KEY, "not-json");

    render(<LocalBuildsMigrator />);

    await waitFor(() => {
      expect(window.localStorage.getItem(LEGACY_SAVED_BUILDS_KEY)).toBeNull();
    });
    expect(actionMocks.migrateLocalSavedBuildsAction).not.toHaveBeenCalled();
  });

  it("keeps the legacy key when the migration action fails, so a later visit retries", async () => {
    window.localStorage.setItem(
      LEGACY_SAVED_BUILDS_KEY,
      JSON.stringify([legacyBuild]),
    );
    actionMocks.migrateLocalSavedBuildsAction.mockRejectedValue(
      new Error("network down"),
    );

    render(<LocalBuildsMigrator />);

    await waitFor(() => {
      expect(actionMocks.migrateLocalSavedBuildsAction).toHaveBeenCalled();
    });
    expect(window.localStorage.getItem(LEGACY_SAVED_BUILDS_KEY)).not.toBeNull();
    expect(
      screen.queryByTestId("local-builds-migration-notice"),
    ).toBeNull();
  });
});
