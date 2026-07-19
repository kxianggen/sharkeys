import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import { PartThumbnail } from "@/components/part-thumbnail";

// Real seed records: an aftermarket stab that ships a part photo, and a
// kit-locked stab that has no photo (so its thumbnail falls back to the glyph).
const photoStab = keyboardComponents.find(
  (component) => component.id === "stab_sp_star_plate_mount",
);
const noPhotoStab = keyboardComponents.find(
  (component) => component.id === "stab_gmk67_plate_mount",
);

describe("PartThumbnail", () => {
  it("shows the real photo after switching from a no-photo part (no stale glyph)", () => {
    if (!photoStab || !noPhotoStab) {
      throw new Error("expected seed stabilizers to exist");
    }

    // Select the no-photo stab first and simulate its image failing to load —
    // this is what sets the fallback (glyph) state.
    const { container, rerender } = render(
      <PartThumbnail component={noPhotoStab} />,
    );
    const firstImg = container.querySelector("img");
    expect(firstImg).not.toBeNull();
    fireEvent.error(firstImg as HTMLImageElement);

    // Fallback glyph is now shown; no image.
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();

    // Switch to the photo-backed stab. The thumbnail must reset its error
    // state and render the real photo — not the stale glyph.
    rerender(<PartThumbnail component={photoStab} />);
    const photoImg = container.querySelector("img");
    expect(photoImg).not.toBeNull();
    expect(photoImg?.getAttribute("src")).toContain(photoStab.id);
  });

  it("shows the glyph when switching from a photo part to a no-photo part", () => {
    if (!photoStab || !noPhotoStab) {
      throw new Error("expected seed stabilizers to exist");
    }

    const { container, rerender } = render(
      <PartThumbnail component={photoStab} />,
    );
    expect(container.querySelector("img")).not.toBeNull();

    rerender(<PartThumbnail component={noPhotoStab} />);
    // New part, fresh state: it attempts to load, then falls back on error.
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    fireEvent.error(img as HTMLImageElement);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
