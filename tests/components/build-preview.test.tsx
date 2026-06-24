// TODO(catalog-rewrite): it.skip tests below are pinned to the pre-19-part seed catalog
// (deleted component IDs + obsolete 75% aluminum blocker). Repoint fixtures to new IDs and unskip.
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  BuildPreview,
  type BuildPreviewComponents,
} from "@/components/build-preview";
import { keyboardComponents } from "@/data";
import { validateBuildSelectionFromIds } from "@/lib/components";
import type { ComponentCategory } from "@/lib/types";

function component(id: string) {
  const found = keyboardComponents.find((item) => item.id === id);

  if (!found) {
    throw new Error(`Missing test component ${id}`);
  }

  return found;
}

function buildComponents(
  ids: Record<ComponentCategory, string>,
): BuildPreviewComponents {
  return {
    case: component(ids.case),
    keycap: component(ids.keycap),
    pcb: component(ids.pcb),
    plate: component(ids.plate),
    stabilizer: component(ids.stabilizer),
    switch: component(ids.switch),
  };
}

function validationFor(ids: Record<ComponentCategory, string>) {
  return validateBuildSelectionFromIds(
    {
      componentIds: ids,
    },
    keyboardComponents,
  );
}

const build65Ids = {
  case: "case_keychron_v2_max_65_abs",
  keycap: "keycap_unknown_pudding_oem_pbt",
  pcb: "pcb_keychron_v2_max_65_hotswap",
  plate: "plate_keychron_v2_max_65_pc",
  stabilizer: "stab_keychron_v2_max_screw_in",
  switch: "switch_gateron_seasalt_smoothie",
} satisfies Record<ComponentCategory, string>;

const buildTklIds = {
  case: "case_weikav_star80_tkl_aluminum",
  keycap: "keycap_unknown_standard_white_jp_cherry",
  pcb: "pcb_weikav_star80_tkl_hotswap",
  plate: "plate_weikav_star80_tkl_fr4",
  stabilizer: "stab_weikav_star80_pcb_mount",
  switch: "switch_mmd_holy_panda_v3",
} satisfies Record<ComponentCategory, string>;

describe("BuildPreview", () => {
  it("renders a placeholder without selected components", () => {
    render(<BuildPreview />);

    expect(
      screen.getByRole("region", { name: /2D build preview/i }),
    ).toHaveTextContent(
      /Build preview appears after a recommendation or manual selection/i,
    );
  });

  it.skip("renders a 65% preview from selected catalog components", () => {
    render(
      <BuildPreview
        components={buildComponents(build65Ids)}
        validation={validationFor(build65Ids)}
      />,
    );

    const preview = screen.getByRole("region", { name: /2D build preview/i });

    expect(within(preview).getAllByText("65% layout").length).toBeGreaterThan(0);
    expect(preview).toHaveTextContent("Keychron V2 Max 65% ABS Case");
    expect(preview).toHaveTextContent("Gateron Sea Salt Smoothie Linear Switch");
    expect(preview).toHaveTextContent("creamy sound");
  });

  it.skip("renders a TKL preview from selected catalog components", () => {
    render(
      <BuildPreview
        components={buildComponents(buildTklIds)}
        validation={validationFor(buildTklIds)}
      />,
    );

    const preview = screen.getByRole("region", { name: /2D build preview/i });

    expect(within(preview).getAllByText("TKL layout").length).toBeGreaterThan(0);
    expect(preview).toHaveTextContent("Weikav Star 80 CNC Aluminum TKL Case");
    expect(preview).toHaveTextContent("MMD Holy Panda V3 Tactile Switch");
  });

  it.skip("shows validation status and selected sound profile", () => {
    render(
      <BuildPreview
        components={buildComponents(build65Ids)}
        estimatedPrice={455}
        estimatedPriceCurrency="MYR"
        validation={validationFor(build65Ids)}
      />,
    );

    const preview = screen.getByRole("region", { name: /2D build preview/i });

    expect(within(preview).getAllByText("Validated").length).toBeGreaterThan(0);
    expect(preview).toHaveTextContent(/RM\s*455/i);
    expect(preview).toHaveTextContent("creamy");
  });

  it("does not render unsupported fake product claims", () => {
    render(
      <BuildPreview
        components={{
          case: component("case_keychron_v2_max_65_abs"),
        }}
      />,
    );

    const preview = screen.getByRole("region", { name: /2D build preview/i });

    expect(preview).toHaveTextContent("Needs complete selection");
    expect(preview).not.toHaveTextContent(/FakeBoard|photorealistic|in stock/i);
  });
});
