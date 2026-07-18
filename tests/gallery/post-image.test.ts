import { describe, expect, it } from "vitest";

import { resolvePostImage } from "@/lib/gallery/post-image";

describe("resolvePostImage", () => {
  it("uses the uploaded image when image_url is present", () => {
    const result = resolvePostImage(
      "https://proj.supabase.co/storage/v1/object/public/build-post-images/u/abc.webp",
      "lucky65",
    );

    expect(result).toEqual({
      kind: "uploaded",
      src: "https://proj.supabase.co/storage/v1/object/public/build-post-images/u/abc.webp",
    });
  });

  it("falls back to the kit hero image when image_url is null", () => {
    expect(resolvePostImage(null, "lucky65")).toEqual({
      kind: "kit",
      kitId: "lucky65",
    });
  });

  it("falls back to the kit path even when there is no kit id", () => {
    expect(resolvePostImage(null, null)).toEqual({ kind: "kit", kitId: null });
  });

  it("treats an empty string image_url as absent (kit fallback)", () => {
    expect(resolvePostImage("", "mz-z1")).toEqual({
      kind: "kit",
      kitId: "mz-z1",
    });
  });
});
