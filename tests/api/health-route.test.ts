import { afterEach, describe, expect, it, vi } from "vitest";

const loadCatalogComponents = vi.fn();

vi.mock("@/lib/components", () => ({
  loadCatalogComponents: () => loadCatalogComponents(),
}));

const { GET } = await import("@/app/api/health/route");

afterEach(() => {
  loadCatalogComponents.mockReset();
});

describe("GET /api/health", () => {
  it("returns 200 when the catalogue came from Supabase", async () => {
    loadCatalogComponents.mockResolvedValue({
      components: [{ id: "a" }, { id: "b" }],
      source: "supabase",
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      source: "supabase",
      count: 2,
      fallbackReason: null,
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns 503 when the loader fell back to the seed catalogue", async () => {
    loadCatalogComponents.mockResolvedValue({
      components: [{ id: "a" }],
      source: "seed",
      fallbackReason: "supabase_error",
      error: "project xyz is paused",
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.fallbackReason).toBe("supabase_error");
    // Error text must never be exposed on a public endpoint.
    expect(JSON.stringify(body)).not.toContain("paused");
  });
});
