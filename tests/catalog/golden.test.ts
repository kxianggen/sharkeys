import { describe, expect, it } from "vitest";

import { mapShopifyProduct } from "../../scripts/catalog/lib/deterministic";
import type { Candidate } from "../../scripts/catalog/lib/fields";
import { goldenRows, pickGolden, readGoldenCsv, scoreGolden, toCsv } from "../../scripts/catalog/lib/golden";

import { keycapProduct, kitProduct, switchProduct, vendorContext } from "./fixtures";

const candidates = [switchProduct, kitProduct, keycapProduct].map((p) => {
  const mapped = mapShopifyProduct(p, vendorContext);
  if (mapped.kind !== "candidate") throw new Error("skipped");
  return mapped.candidate as Candidate;
});

describe("golden sheet", () => {
  it("is pre-filled with the importer's values and round-trips through CSV", () => {
    const rows = goldenRows(candidates);
    expect(rows.every((r) => r.correctValue === r.importerValue)).toBe(true);
    expect(rows.find((r) => r.key.endsWith("weikav-test65") && r.field === "layouts")?.importerValue).toBe("65");
    expect(readGoldenCsv(toCsv(rows))).toEqual(rows);
  });

  it("spreads the picks across categories", () => {
    expect(pickGolden(candidates, 2).map((c) => c.category.value)).toEqual(["switch", "kit"]);
  });

  it("scores correct, wrong, missed and silent cells per field", () => {
    const rows = goldenRows(candidates);
    const pins = rows.find((r) => r.field === "pinCount")!;
    pins.correctValue = "3"; // importer said 5: wrong
    const beginner = rows.find((r) => r.field === "beginnerFriendly")!;
    beginner.correctValue = "true"; // importer said unknown: missed
    const result = scoreGolden(rows);
    const pinScore = result.fields.find((f) => f.field === "pinCount")!;
    expect(pinScore).toMatchObject({ correct: 0, wrong: 1 });
    expect(result.fields.find((f) => f.field === "beginnerFriendly")?.missed).toBe(1);
    expect(result.edited).toBe(2);
    expect(result.wrongRows).toHaveLength(1);
    expect(result.accuracy).toBeGreaterThan(0.8);
    expect(result.accuracy).toBeLessThan(1);
  });

  it("treats list order and separators as equal", () => {
    const rows = goldenRows(candidates);
    const layouts = rows.find((r) => r.key.endsWith("testcaps-purple") && r.field === "layouts")!;
    layouts.correctValue = "tkl, full, 60, 65, 75";
    expect(scoreGolden(rows).wrongRows).toHaveLength(0);
  });
});
