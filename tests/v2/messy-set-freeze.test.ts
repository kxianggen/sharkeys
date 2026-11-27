/**
 * Guards for the frozen TEST set (v2 WS0).
 *  1. Freeze: the TEST rows must hash to eval/v2/TEST.sha256. Any edit to a
 *     TEST row fails CI. (DEV rows may change freely.)
 *  2. Leakage: no TEST message may appear in src/ or scripts/, where it could
 *     end up as a prompt example. Messages under 16 characters ("cheaper?")
 *     are skipped: they are too generic to prove leakage.
 * Both skip until the messy set exists.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  hashTestRows,
  loadMessySet,
  MESSY_SET_PATH,
  TEST_HASH_PATH,
} from "../../scripts/v2/lib/messy-set";

const hasSet = existsSync(MESSY_SET_PATH);

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx|js|mjs|json|md)$/.test(name)) yield p;
  }
}

describe.skipIf(!hasSet)("messy set (frozen TEST split)", () => {
  const rows = hasSet ? loadMessySet() : [];

  it("parses, with unique ids and the planned split sizes", () => {
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(rows.filter((r) => r.split === "test")).toHaveLength(100);
    expect(rows.filter((r) => r.split === "dev")).toHaveLength(20);
  });

  it.skipIf(!existsSync(TEST_HASH_PATH))("TEST rows match the frozen hash", () => {
    const frozen = readFileSync(TEST_HASH_PATH, "utf8").trim();
    expect(hashTestRows(rows)).toBe(frozen);
  });

  it("no TEST message appears in src/ or scripts/", () => {
    const texts = rows
      .filter((r) => r.split === "test" && r.text.length >= 16)
      .map((r) => r.text.toLowerCase());
    const leaks: string[] = [];
    for (const root of ["src", "scripts"]) {
      for (const file of walk(root)) {
        const body = readFileSync(file, "utf8").toLowerCase();
        for (const t of texts) if (body.includes(t)) leaks.push(`${file}: "${t}"`);
      }
    }
    expect(leaks).toEqual([]);
  });
});
