import { describe, expect, it } from "vitest";

import { keyboardComponents } from "@/data";
import {
  buildSharePath,
  decodeBuildCode,
  encodeBuildCode,
} from "@/lib/recommendations/build-code";

const ids = {
  case: "case_lucky65_v3_65_aluminum",
  pcb: "pcb_lucky65_v3_65_hotswap",
  plate: "plate_lucky65_v3_65_fr4",
  switch: "switch_gateron_milky_yellow_pro",
  keycap: "keycap_unknown_pudding_oem_pbt",
  stabilizer: "stab_lucky65_v3_screw_in",
};

describe("build codes", () => {
  it("round-trips the six part ids", () => {
    const code = encodeBuildCode(ids);

    expect(code).toBe(
      "v1.case_lucky65_v3_65_aluminum.pcb_lucky65_v3_65_hotswap.plate_lucky65_v3_65_fr4.switch_gateron_milky_yellow_pro.keycap_unknown_pudding_oem_pbt.stab_lucky65_v3_screw_in",
    );
    expect(decodeBuildCode(code)).toEqual(ids);
    expect(buildSharePath(ids)).toBe(`/configurator/b/${code}`);
  });

  it("rejects anything that is not a whole v1 code", () => {
    const code = encodeBuildCode(ids);

    expect(decodeBuildCode(null)).toBeNull();
    expect(decodeBuildCode("")).toBeNull();
    expect(decodeBuildCode(code.replace("v1.", "v2."))).toBeNull();
    expect(decodeBuildCode(code.split(".").slice(0, 6).join("."))).toBeNull();
    expect(decodeBuildCode(`${code}.extra`)).toBeNull();
    expect(decodeBuildCode(code.replace("pcb_", "PCB_"))).toBeNull();
    expect(decodeBuildCode(code.replace("pcb_", "<script>"))).toBeNull();
    expect(decodeBuildCode("v1.%E0%A4%A")).toBeNull();
  });

  it("refuses to encode an id the URL format cannot carry", () => {
    expect(() => encodeBuildCode({ ...ids, switch: "switch.with.dots" })).toThrow();
  });

  it("can encode every id in the current catalogue", () => {
    for (const component of keyboardComponents) {
      expect(component.id).toMatch(/^[a-z0-9_-]{1,120}$/);
    }
  });
});
