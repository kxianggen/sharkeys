import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET as validateCategoryGET } from "@/app/api/components/category/[category]/route";
import { GET as componentGET } from "@/app/api/components/[id]/route";
import { GET as componentsGET } from "@/app/api/components/route";
import { POST as validateBuildPOST } from "@/app/api/builds/validate/route";
import {
  apiErrorResponseSchema,
  categoryComponentsResponseSchema,
  componentResponseSchema,
  componentsListResponseSchema,
  validateBuildResponseSchema,
} from "@/lib/api";

const validBuildPayload = {
  componentIds: {
    case: "case_zuoya_gmk67_v2_kit_case",
    pcb: "pcb_zuoya_gmk67_v2_hotswap",
    plate: "plate_zuoya_gmk67_v2_pc",
    switch: "switch_gateron_milky_yellow_pro",
    keycap: "keycap_mecha_bow_cherry_pbt",
    stabilizer: "stab_zuoya_gmk67_plate_mount",
  },
  preferences: {
    layout: "65",
    soundProfile: "creamy",
  },
};

describe("component API routes", () => {
  it("returns filtered components with a validated response shape", async () => {
    const response = await componentsGET(
      new NextRequest("http://localhost/api/components?category=switch"),
    );
    const body = await response.json();
    const parsed = componentsListResponseSchema.parse(body);

    expect(response.status).toBe(200);
    expect(parsed.data.count).toBe(5);
    expect(
      parsed.data.components.every((component) => component.category === "switch"),
    ).toBe(true);
  });

  it("returns a component by ID", async () => {
    const response = await componentGET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "case_zuoya_gmk67_v2_kit_case" }),
    });
    const body = await response.json();
    const parsed = componentResponseSchema.parse(body);

    expect(response.status).toBe(200);
    expect(parsed.data.component.name).toBe("Zuoya GMK67 V2 65% Kit Case");
  });

  it("returns a useful error when a component ID is unknown", async () => {
    const response = await componentGET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "missing_component" }),
    });
    const body = await response.json();
    const parsed = apiErrorResponseSchema.parse(body);

    expect(response.status).toBe(404);
    expect(parsed.error.code).toBe("component_not_found");
  });

  it("returns components by valid category", async () => {
    const response = await validateCategoryGET(new Request("http://localhost"), {
      params: Promise.resolve({ category: "pcb" }),
    });
    const body = await response.json();
    const parsed = categoryComponentsResponseSchema.parse(body);

    expect(response.status).toBe(200);
    expect(parsed.data.category).toBe("pcb");
    expect(parsed.data.components).toHaveLength(3);
  });

  it("rejects invalid category routes", async () => {
    const response = await validateCategoryGET(new Request("http://localhost"), {
      params: Promise.resolve({ category: "invalid" }),
    });
    const body = await response.json();
    const parsed = apiErrorResponseSchema.parse(body);

    expect(response.status).toBe(400);
    expect(parsed.error.code).toBe("invalid_request");
  });
});

describe("build validation API route", () => {
  it("validates a build through the deterministic rule engine", async () => {
    const response = await validateBuildPOST(
      new Request("http://localhost/api/builds/validate", {
        method: "POST",
        body: JSON.stringify(validBuildPayload),
      }),
    );
    const body = await response.json();
    const parsed = validateBuildResponseSchema.parse(body);

    expect(response.status).toBe(200);
    expect(parsed.data.result.isValid).toBe(true);
    expect(parsed.data.result.errors).toEqual([]);
  });

  it("returns validation errors for malformed build requests", async () => {
    const response = await validateBuildPOST(
      new Request("http://localhost/api/builds/validate", {
        method: "POST",
        body: JSON.stringify({ componentIds: { case: "" } }),
      }),
    );
    const body = await response.json();
    const parsed = apiErrorResponseSchema.parse(body);

    expect(response.status).toBe(400);
    expect(parsed.error.code).toBe("invalid_request");
  });
});
