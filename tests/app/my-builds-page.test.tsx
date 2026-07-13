import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SavedBuildRecord } from "@/lib/saved-builds/service";

const authMocks = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
}));
const serviceMocks = vi.hoisted(() => ({
  listSavedBuilds: vi.fn(),
  getSavedBuild: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSessionUser: authMocks.getSessionUser,
}));
vi.mock("@/lib/saved-builds/service", () => ({
  listSavedBuilds: serviceMocks.listSavedBuilds,
  getSavedBuild: serviceMocks.getSavedBuild,
}));
// The migrator island touches server actions + router; its behaviour has its
// own test file. Stub it here so the page test stays a pure rendering check.
vi.mock("@/components/local-builds-migrator", () => ({
  LocalBuildsMigrator: () => null,
}));

import MyBuildsRoute from "@/app/my-builds/page";

// Real seed-catalog build (Lucky65 V3 kit) so the summary/kit-image logic runs
// against real data, mirroring the gallery pages.
const savedBuild: SavedBuildRecord = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Thocky office board",
  componentIds: {
    case: "case_lucky65_v3_65_aluminum",
    pcb: "pcb_lucky65_v3_65_hotswap",
    plate: "plate_lucky65_v3_65_fr4",
    switch: "switch_mmd_princess_linear_v3",
    keycap: "keycap_unknown_pudding_oem_pbt",
    stabilizer: "stab_sp_star_plate_mount",
  },
  validationSnapshot: null,
  estimatedPrice: 459,
  estimatedPriceCurrency: "MYR",
  source: "recommendation",
  createdAt: "2026-07-11T00:00:00.000Z",
};

describe("MyBuildsRoute (signed in)", () => {
  beforeEach(() => {
    authMocks.getSessionUser.mockResolvedValue({ id: "user-1" });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("lists saved builds with Open / Publish / Delete actions", async () => {
    serviceMocks.listSavedBuilds.mockResolvedValue([savedBuild]);

    render(await MyBuildsRoute());

    const card = screen.getByTestId("saved-build-card");
    expect(
      within(card).getByRole("heading", { name: "Thocky office board" }),
    ).toBeInTheDocument();

    // Open loads the build into the configurator via the existing ?kit= flow.
    expect(within(card).getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      expect.stringContaining("/configurator?kit="),
    );
    // Publish reuses the existing community publish form, pre-filled.
    expect(
      within(card).getByRole("link", { name: /Publish to Community/i }),
    ).toHaveAttribute("href", `/community-gallery/new?from=${savedBuild.id}`);
    // Delete posts the saved-build id to the delete server action.
    const deleteButton = within(card).getByRole("button", { name: /Delete/i });
    expect(deleteButton.closest("form")).not.toBeNull();
    expect(
      within(card).getByDisplayValue(savedBuild.id),
    ).toBeInTheDocument();
  });

  it("renders the empty state inviting the user to the configurator", async () => {
    serviceMocks.listSavedBuilds.mockResolvedValue([]);

    render(await MyBuildsRoute());

    expect(screen.getByText(/No saved builds yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open the configurator/i }),
    ).toHaveAttribute("href", "/configurator");
    expect(screen.queryByTestId("saved-build-card")).toBeNull();
  });
});
