/**
 * WS4 probe: what does each refine chip do on the real catalogue?
 *
 * Free and deterministic: run against a KEYLESS dev server, so the base search
 * uses keyword extraction and the refine route makes no AI call at all.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/v2/probe-refine.ts [baseUrl]
 */
import {
  applyRefineChip,
  describeBuildChange,
  getKeycapColours,
  refineChips,
} from "@/lib/recommendations/refine";
import type { RecommendationsApiResponse } from "@/lib/recommendations/schemas";
import type { KeyboardComponent } from "@/lib/types";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const prompts = [
  "A deep thocky build for coding in a quiet office",
  "Quiet office keyboard",
  "Beginner friendly 65% keyboard under RM500",
];

async function post(path: string, body: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as RecommendationsApiResponse;

  if (!json.success) throw new Error(`${path} failed: ${JSON.stringify(json)}`);
  return json.data;
}

async function main() {
  const catalogResponse = (await (
    await fetch(`${baseUrl}/api/components`)
  ).json()) as { data: { components: KeyboardComponent[] } };
  const keycapColours = getKeycapColours(catalogResponse.data.components);
  console.log(`keycap colours in catalogue: ${keycapColours.join(", ")}`);

  for (const message of prompts) {
    const result = await post("/api/recommendations", { message });
    const base = result.recommendations[0];

    console.log(`\n# "${message}"`);
    if (!base) {
      console.log("  (no build)");
      continue;
    }
    console.log(`  base: ${base.title} · RM${base.estimatedPrice}`);

    for (const chip of refineChips) {
      const intent = applyRefineChip(result.intent, chip, base, keycapColours);

      if (!intent) {
        console.log(`  ${chip.padEnd(9)} (disabled: no-op for this build)`);
        continue;
      }

      const started = performance.now();
      const refined = await post("/api/recommendations/refine", {
        intent,
        source: result.source,
        chip,
      });
      const ms = Math.round(performance.now() - started);
      const top = refined.recommendations[0] ?? null;

      console.log(
        `  ${chip.padEnd(9)} ${ms}ms  ${describeBuildChange(base, top)}` +
          (top
            ? `  [${top.components.switch.soundProfile ?? "-"}, ${top.components.pcb.connection}, ${top.components.case.layouts.join("/")}]`
            : ""),
      );
    }
  }
}

void main();
