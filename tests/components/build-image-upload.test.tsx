import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BuildImageUpload } from "@/components/build-image-upload";

describe("BuildImageUpload", () => {
  it("presents the upload as optional and starts with an empty hidden field", () => {
    const { container } = render(<BuildImageUpload name="image_data" />);

    // Optionality is explicit in the label + helper copy.
    expect(screen.getByText(/optional/i)).toBeInTheDocument();
    expect(
      screen.getByText(/your post uses the kit’s hero image/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /drag a photo here/i }),
    ).toBeInTheDocument();

    // No photo chosen → hidden field is empty, so the post falls back to the
    // kit hero image server-side.
    const hidden = container.querySelector<HTMLInputElement>(
      'input[name="image_data"]',
    );
    expect(hidden).not.toBeNull();
    expect(hidden?.value).toBe("");
  });
});
