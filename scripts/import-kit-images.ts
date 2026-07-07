/**
 * scripts/import-kit-images.ts
 * ---------------------------------------------------------------------------
 * Turns raw, inconsistent product photos into a clean, uniform lineup of image
 * assets. Two modes:
 *
 *   KITS  (default):  ./kit-images-inbox/   →  public/kits/<kitId>.webp
 *   PARTS (--parts):  ./part-images-inbox/  →  public/parts/<componentId>.webp
 *
 * WHY IT'S SAFE:
 *   - It reads the REAL catalog. Kits mode matches against metadata.kitId;
 *     parts mode matches against switch/keycap/stabilizer component ids AND
 *     names. It can only place an image for a kit or component that actually
 *     exists. Unknown or ambiguous files are reported and skipped — never
 *     guessed into place. This keeps the "never fabricate a product" principle
 *     intact down at the asset layer.
 *   - Every output is forced to the SAME canvas, aspect ratio, and format, so
 *     your lineup stays visually consistent (the thing that makes it read as
 *     "Apple") even if your source photos are all over the place.
 *
 * WHAT IT DOES NOT DO:
 *   - It does not remove/replace backgrounds (that's an ML task). Paste images
 *     that already sit on clean/consistent backgrounds for the best result.
 *
 * USAGE — KITS:
 *   1. Create ./kit-images-inbox/ at the repo root and drop your photos in.
 *      Name each file loosely after the kit, e.g. "weikav star 80.png".
 *   2. Preview (writes nothing):   npx tsx scripts/import-kit-images.ts
 *   3. Commit:                     npx tsx scripts/import-kit-images.ts --commit
 *      Add --overwrite to replace images that already exist.
 *
 * USAGE — PARTS:
 *   1. Create ./part-images-inbox/ at the repo root and drop your photos in.
 *      Name each file loosely after the switch/keycap/stabilizer, e.g.
 *      "gateron oil king.png", "pudding pbt.png", "c3 equalz screw-in.png".
 *   2. Preview:  npx tsx scripts/import-kit-images.ts --parts
 *   3. Commit:   npx tsx scripts/import-kit-images.ts --parts --commit
 *      Add --overwrite to replace images that already exist.
 *
 * ONE-TIME SETUP:
 *   npm install --save-dev sharp
 *
 * ADJUST IF NEEDED:
 *   The import below assumes `keyboardComponents` is exported from ../src/data
 *   (matches `import { keyboardComponents } from "@/data"` used in your tests).
 *   Change the path if your export lives elsewhere.
 * ---------------------------------------------------------------------------
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import sharp from "sharp";

import { keyboardComponents } from "@/data";

// --- Config -----------------------------------------------------------------

// 4:3 landscape at 2x retina (renders crisp at 800x600 CSS px). Every asset is
// forced to this, so the lineup can never end up with mismatched framing.
const CANVAS = { width: 1600, height: 1200 };

const OUTPUT_FORMAT = "webp" as const;
const WEBP_QUALITY = 90;

// Transparent padding so the asset composits onto any card surface. Swap alpha
// to 1 and set r/g/b for a uniform solid background instead.
const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 0 };

// Minimum filename<->target similarity (0..1) required to auto-accept a match.
const MATCH_THRESHOLD = 0.45;

// Component categories treated as "parts" (aftermarket-selectable pieces that
// render at public/parts/<componentId>.webp). Structural kit pieces
// (case/pcb/plate) are represented by the kit hero image instead.
const PART_CATEGORIES = new Set(["switch", "keycap", "stabilizer"]);

const SUPPORTED_INPUT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".tiff",
  ".avif",
]);

// --- Mode: kits vs parts ----------------------------------------------------

// A match target: a real, existing id plus the strings we fuzzy-match against.
type Target = { id: string; displayName: string; matchStrings: string[] };

type ModeConfig = {
  noun: string; // singular, for messages ("kit" / "part")
  inboxDir: string;
  outputDir: string;
  targets: Target[];
};

type CatalogRecord = {
  id?: string;
  name?: string;
  category?: string;
  metadata?: { kitId?: string; observedKitName?: string };
};

// Kits: one target per distinct metadata.kitId. Matched against the kit's
// display name and the kitId itself.
function getKitTargets(): Target[] {
  const map = new Map<string, string>();

  for (const component of keyboardComponents as ReadonlyArray<CatalogRecord>) {
    const kitId = component?.metadata?.kitId;
    if (!kitId) continue;

    const displayName =
      component?.metadata?.observedKitName ?? component?.name ?? kitId;

    if (!map.has(kitId)) {
      map.set(kitId, String(displayName));
    }
  }

  return [...map.entries()].map(([kitId, displayName]) => ({
    id: kitId,
    displayName,
    matchStrings: [displayName, kitId.replace(/_/g, " ")],
  }));
}

// Parts: one target per switch/keycap/stabilizer component. Matched against
// the component name and the component id.
function getPartTargets(): Target[] {
  const targets: Target[] = [];

  for (const component of keyboardComponents as ReadonlyArray<CatalogRecord>) {
    const id = component?.id;
    const category = component?.category;
    if (!id || !category || !PART_CATEGORIES.has(category)) continue;

    const displayName = component?.name ?? id;

    targets.push({
      id,
      displayName: String(displayName),
      matchStrings: [String(displayName), id.replace(/_/g, " ")],
    });
  }

  return targets;
}

function resolveMode(isParts: boolean): ModeConfig {
  if (isParts) {
    return {
      noun: "part",
      inboxDir: path.resolve("part-images-inbox"),
      outputDir: path.resolve("public/parts"),
      targets: getPartTargets(),
    };
  }

  return {
    noun: "kit",
    inboxDir: path.resolve("kit-images-inbox"),
    outputDir: path.resolve("public/kits"),
    targets: getKitTargets(),
  };
}

// --- Fuzzy filename matching (dependency-free) ------------------------------

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/\.[^.]+$/, "") // strip extension
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function bigrams(input: string): Set<string> {
  const cleaned = input.replace(/\s+/g, "");
  const grams = new Set<string>();
  for (let i = 0; i < cleaned.length - 1; i += 1) {
    grams.add(cleaned.slice(i, i + 2));
  }
  return grams;
}

// Sørensen–Dice coefficient over character bigrams.
function similarity(a: string, b: string): number {
  const setA = bigrams(normalize(a));
  const setB = bigrams(normalize(b));
  if (setA.size === 0 || setB.size === 0) return 0;

  let overlap = 0;
  for (const gram of setA) {
    if (setB.has(gram)) overlap += 1;
  }
  return (2 * overlap) / (setA.size + setB.size);
}

function bestMatch(filename: string, targets: Target[]) {
  let best: { target: Target | null; score: number } = {
    target: null,
    score: 0,
  };

  for (const target of targets) {
    const score = Math.max(
      ...target.matchStrings.map((candidate) => similarity(filename, candidate)),
    );
    if (score > best.score) best = { target, score };
  }

  return best;
}

// --- Image processing -------------------------------------------------------

async function processImage(
  inputPath: string,
  outputDir: string,
  id: string,
): Promise<string> {
  const outputPath = path.join(outputDir, `${id}.${OUTPUT_FORMAT}`);

  await sharp(inputPath)
    .resize(CANVAS.width, CANVAS.height, {
      fit: "contain", // never crop the product; pad instead
      background: BACKGROUND,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);

  return outputPath;
}

// --- Main -------------------------------------------------------------------

async function main() {
  const args = new Set(process.argv.slice(2));
  const commit = args.has("--commit");
  const overwrite = args.has("--overwrite");
  const isParts = args.has("--parts");

  const mode = resolveMode(isParts);

  if (mode.targets.length === 0) {
    console.error(
      isParts
        ? "No switch/keycap/stabilizer components found in the catalog. Nothing to match against."
        : "No kit-derived records found in the catalog (metadata.kitId). Nothing to match against.",
    );
    process.exit(1);
  }

  let inboxEntries: string[];
  try {
    inboxEntries = await fs.readdir(mode.inboxDir);
  } catch {
    console.error(
      `Inbox folder not found. Create it and drop your ${mode.noun} images in:\n  ${mode.inboxDir}`,
    );
    process.exit(1);
  }

  const files = inboxEntries.filter((name) =>
    SUPPORTED_INPUT.has(path.extname(name).toLowerCase()),
  );

  if (files.length === 0) {
    console.log(`No supported images in ${mode.inboxDir}. Supported: ${[
      ...SUPPORTED_INPUT,
    ].join(", ")}`);
    return;
  }

  // Resolve each file to a target (or not).
  type Plan = {
    file: string;
    target: Target | null;
    score: number;
    status: "match" | "low-confidence" | "conflict";
  };

  const plans: Plan[] = files.map((file) => {
    const { target, score } = bestMatch(file, mode.targets);
    return {
      file,
      target,
      score,
      status: score >= MATCH_THRESHOLD ? "match" : "low-confidence",
    };
  });

  // Flag two files targeting the same id — resolve manually rather than guess.
  const targetCounts = new Map<string, number>();
  for (const plan of plans) {
    if (plan.status === "match" && plan.target) {
      targetCounts.set(
        plan.target.id,
        (targetCounts.get(plan.target.id) ?? 0) + 1,
      );
    }
  }
  for (const plan of plans) {
    if (plan.target && (targetCounts.get(plan.target.id) ?? 0) > 1) {
      plan.status = "conflict";
    }
  }

  // Report the plan.
  console.log(`\nPlan (${mode.noun}s, ${commit ? "COMMIT" : "dry run"}):\n`);
  for (const plan of plans) {
    const pct = `${Math.round(plan.score * 100)}%`.padStart(4);
    if (plan.status === "match" && plan.target) {
      console.log(`  ✓ ${plan.file}  →  ${plan.target.id}.webp  (${pct})`);
    } else if (plan.status === "conflict" && plan.target) {
      console.log(
        `  ! ${plan.file}  →  ${plan.target.id}  (CONFLICT: multiple files match this ${mode.noun} — rename to disambiguate)`,
      );
    } else {
      const guess = plan.target
        ? ` (closest: ${plan.target.id} ${pct})`
        : "";
      console.log(`  ? ${plan.file}  →  no confident match${guess} — skipped`);
    }
  }

  // Coverage: which real targets still have no image? (Kits: list them all.
  // Parts: only summarise a count — the full component list is long.)
  const matchedIds = new Set(
    plans.filter((p) => p.status === "match" && p.target).map((p) => p.target!.id),
  );
  const missing = mode.targets.filter((t) => !matchedIds.has(t.id));
  if (missing.length > 0) {
    if (isParts) {
      console.log(
        `\n${missing.length} of ${mode.targets.length} parts still have no image (they fall back to a neutral glyph until one is imported).`,
      );
    } else {
      console.log(`\nKits still without an image this run:`);
      for (const target of missing) {
        console.log(`  · ${target.id}  (${target.displayName})`);
      }
    }
  }

  if (!commit) {
    console.log(
      `\nDry run only. Re-run with --commit to write files (add --overwrite to replace existing).\n`,
    );
    return;
  }

  // Commit.
  await fs.mkdir(mode.outputDir, { recursive: true });
  let written = 0;
  let skipped = 0;

  for (const plan of plans) {
    if (plan.status !== "match" || !plan.target) continue;

    const outputPath = path.join(
      mode.outputDir,
      `${plan.target.id}.${OUTPUT_FORMAT}`,
    );
    const exists = await fs
      .access(outputPath)
      .then(() => true)
      .catch(() => false);

    if (exists && !overwrite) {
      console.log(
        `  ↷ ${plan.target.id}.webp exists — skipped (use --overwrite)`,
      );
      skipped += 1;
      continue;
    }

    await processImage(
      path.join(mode.inboxDir, plan.file),
      mode.outputDir,
      plan.target.id,
    );
    written += 1;
  }

  console.log(`\nDone. ${written} written, ${skipped} skipped.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
