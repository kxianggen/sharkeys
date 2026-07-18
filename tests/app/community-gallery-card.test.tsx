import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { GalleryPost } from "@/lib/gallery/service";

const authMocks = vi.hoisted(() => ({ getSessionUser: vi.fn() }));
const serviceMocks = vi.hoisted(() => ({ listPublishedPosts: vi.fn() }));

vi.mock("@/lib/auth", () => ({ getSessionUser: authMocks.getSessionUser }));
vi.mock("@/lib/gallery/service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/gallery/service")>()),
  listPublishedPosts: serviceMocks.listPublishedPosts,
}));

import CommunityGalleryPage from "@/app/community-gallery/page";

const author = {
  id: "a1",
  username: "meg_fan",
  displayName: null,
  avatarUrl: null,
};

const buildlessPost: GalleryPost = {
  id: "buildless-1",
  title: "What makes a board sound thocky?",
  description: "Curious about the physics behind that deep poppy sound.",
  componentIds: {},
  validationSnapshot: null,
  imageUrl: null,
  isPublished: true,
  createdAt: "2026-07-17T00:00:00.000Z",
  author,
};

describe("Community gallery — buildless card", () => {
  beforeEach(() => {
    authMocks.getSessionUser.mockResolvedValue(null);
    serviceMocks.listPublishedPosts.mockResolvedValue([buildlessPost]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders a text-only card (title + description, no image tile) for a buildless post with no photo", async () => {
    render(await CommunityGalleryPage());

    const card = screen.getByRole("link", {
      name: /What makes a board sound thocky/i,
    });

    // Description preview shows; no broken/empty image tile is rendered.
    expect(
      within(card).getByText(/deep poppy sound/i),
    ).toBeInTheDocument();
    expect(
      within(card).queryByTestId("kit-image-placeholder"),
    ).not.toBeInTheDocument();
    expect(within(card).queryByRole("img")).not.toBeInTheDocument();
  });
});
