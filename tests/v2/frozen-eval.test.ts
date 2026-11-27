/**
 * Freeze of the v2 measurement setup (HQ decision, 27 Nov 2026).
 *
 * Every later run (repeat baselines, WS1 "after", WS4 "after") must use
 * simulator-3 + rubric-v3, or its numbers can't be compared with the
 * canonical baseline (eval/v2/results/2026-11-27-v2-ws0-foundation-2.md).
 * This test fails if the judge, the simulator, the invented-parts check or
 * the personas change in any way, comments included.
 *
 * If it fails: do not update the hashes to make it pass. A change here needs
 * HQ approval, a new rubric/simulator version, and a new baseline run.
 *
 * Not frozen on purpose: the catalogue (src/data). The judge's catalogue facts
 * come from it, so WS2's catalogue growth reaches the judge automatically.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { RUBRIC_VERSION } from "../../scripts/v2/lib/judge";
import { FROZEN_RUBRIC_VERSION, SIM_VERSION } from "../../scripts/v2/lib/versions";

const FROZEN_FILES: Record<string, string> = {
  "scripts/v2/lib/judge.ts": "fe848b637ac9a09300bb651efbfddc2a714e759da03964af206246a26aa9e044",
  "scripts/v2/lib/persona.ts": "f55a1b915d5b17f3db61574588b71300ac72df76078ef66b77b70925c885092a",
  "scripts/v2/lib/app-client.ts": "b49db958d89faec6adab415c44d1b3333379974bd2ca7776e81d57fcb6dfb1ae",
  "scripts/v2/lib/invented-parts.ts": "bd1f61d90227be77e6f511fdada049bfbdc40ce2eb503fce714b361008ad723f",
  "scripts/v2/lib/versions.ts": "821621e7f8004db57cc97e50bc756ae7cde9d78e7845c4bbe1ce40a51b9c10f3",
  "scripts/v2/simulate.ts": "1b9fa4dad75e8b5432653e9ce452e65dc11aeba6eb1e5c147a251e258c8f9fc3",
  "eval/v2/personas.json": "37a504b5d8d4cac263961ff536e36d873fae718b649b70ea3d7a4de5a297a0a1",
};

// Line endings are normalised so Windows checkouts (CRLF) and CI (LF) agree.
function fingerprint(path: string): string {
  const text = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  return createHash("sha256").update(text).digest("hex");
}

describe("frozen v2 measurement setup (simulator-3 + rubric-v3)", () => {
  it("uses simulator-3 and rubric-v3", () => {
    expect(SIM_VERSION).toBe("simulator-3");
    expect(RUBRIC_VERSION).toBe("rubric-v3");
    expect(FROZEN_RUBRIC_VERSION).toBe(RUBRIC_VERSION);
  });

  it.each(Object.entries(FROZEN_FILES))("%s is unchanged", (path, hash) => {
    expect(
      fingerprint(path),
      `${path} changed. The v2 judge/simulator are frozen (HQ, 27 Nov); changes need HQ approval and a new baseline.`,
    ).toBe(hash);
  });
});
