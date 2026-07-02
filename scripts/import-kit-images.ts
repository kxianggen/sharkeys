/**
 * scripts/import-kit-images.ts
 * ---------------------------------------------------------------------------
 * Turns raw, inconsistent kit photos into a clean, uniform lineup of image
 * assets stored at:  public/kits/<kitId>.webp
 *
 * WHY IT'S SAFE:
 *   - It reads the REAL kit list from your catalog (metadata.kitId), so it can
 *     only place an image for a kit that actually exists. Unknown or ambiguous
 *     files are reported and skipped — never guessed into place. This keeps the
 *     "never fabricate a product" principle intact down at the asset layer.
 *   - Every output is forced to the SAME canvas, aspect ratio, and format, so
 *     your lineup stays visually consistent (the thing that makes it read as
 *     "Apple") even if your source photos are all over the place.
 *
 * WHAT IT DOES NOT DO:
 *   - It does not remove/replace backgrounds (that's an ML task). Paste images
 *     that already sit on clean/consistent backgrounds for the best result.
 *
 * USAGE:
 *   1. Create a folder ./kit-images-inbox/ at the repo root.
 *   2. Drop your photos in. Name each file loosely after the kit, e.g.
 *        "keychron v2 max.png", "weikav star 80.jpg", "yunzii b87.webp"
 *      (fuzzy-matched — exact spelling not required).
 *   3. Preview the plan (writes nothing):
 *        npx tsx scripts/import-kit-images.ts
 *   4. Commit the assets:
 *        npx tsx scripts/import-kit-images.ts --commit
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

const INBOX_DIR = path.resolve("kit-images-inbox");
const OUTPUT_DIR = path.resolve("public/kits");

// 4:3 landscape at 2x retina (renders crisp at 800x600 CSS px). Every asset is
// forced to this, so the lineup can never end up with mismatched framing.
const CANVAS = { width: 1600, height: 1200 };

const OUTPUT_FORMAT = "webp" as const;
const WEBP_QUALITY = 90;

// Transparent padding so the asset composits onto any card surface. Swap alpha
// to 1 and set r/g/b for a uniform solid background instead.
const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 0 };

// Minimum filename<->kit similarity (0..1) required to auto-accept a match.
const MATCH_THRESHOLD = 0.45;

const SUPPORTED_INPUT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".tiff",
  ".avif",
]);

// --- Catalog: the single source of truth for valid kits ---------------------

type KnownKit = { kitId: string; displayName: string };

function getKnownKits(): KnownKit[] {
  const map = new Map<string, string>();

  type CatalogRecord = {
    name?: string;
    metadata?: { kitId?: string; observedKitName?: string };
  };

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
    kitId,
    displayName,
  }));
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

function bestMatch(filename: string, kits: KnownKit[]) {
  let best: { kit: KnownKit | null; score: number } = { kit: null, score: 0 };

  for (const kit of kits) {
    const score = Math.max(
      similarity(filename, kit.displayName),
      similarity(filename, kit.kitId.replace(/_/g, " ")),
    );
    if (score > best.score) best = { kit, score };
  }

  return best;
}

// --- Image processing -------------------------------------------------------

async function processImage(inputPath: string, kitId: string): Promise<string> {
  const outputPath = path.join(OUTPUT_DIR, `${kitId}.${OUTPUT_FORMAT}`);

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

  const kits = getKnownKits();
  if (kits.length === 0) {
    console.error(
      "No kit-derived records found in the catalog (metadata.kitId). Nothing to match against.",
    );
    process.exit(1);
  }

  let inboxEntries: string[];
  try {
    inboxEntries = await fs.readdir(INBOX_DIR);
  } catch {
    console.error(
      `Inbox folder not found. Create it and drop your images in:\n  ${INBOX_DIR}`,
    );
    process.exit(1);
  }

  const files = inboxEntries.filter((name) =>
    SUPPORTED_INPUT.has(path.extname(name).toLowerCase()),
  );

  if (files.length === 0) {
    console.log(`No supported images in ${INBOX_DIR}. Supported: ${[
      ...SUPPORTED_INPUT,
    ].join(", ")}`);
    return;
  }

  // Resolve each file to a kit (or not).
  type Plan = {
    file: string;
    kit: KnownKit | null;
    score: number;
    status: "match" | "low-confidence" | "conflict";
  };

  const plans: Plan[] = files.map((file) => {
    const { kit, score } = bestMatch(file, kits);
    return {
      file,
      kit,
      score,
      status: score >= MATCH_THRESHOLD ? "match" : "low-confidence",
    };
  });

  // Flag two files targeting the same kit — resolve manually rather than guess.
  const targetCounts = new Map<string, number>();
  for (const plan of plans) {
    if (plan.status === "match" && plan.kit) {
      targetCounts.set(plan.kit.kitId, (targetCounts.get(plan.kit.kitId) ?? 0) + 1);
    }
  }
  for (const plan of plans) {
    if (plan.kit && (targetCounts.get(plan.kit.kitId) ?? 0) > 1) {
      plan.status = "conflict";
    }
  }

  // Report the plan.
  console.log(`\nPlan (${commit ? "COMMIT" : "dry run"}):\n`);
  for (const plan of plans) {
    const pct = `${Math.round(plan.score * 100)}%`.padStart(4);
    if (plan.status === "match" && plan.kit) {
      console.log(`  ✓ ${plan.file}  →  ${plan.kit.kitId}.webp  (${pct})`);
    } else if (plan.status === "conflict" && plan.kit) {
      console.log(
        `  ! ${plan.file}  →  ${plan.kit.kitId}  (CONFLICT: multiple files match this kit — rename to disambiguate)`,
      );
    } else {
      const guess = plan.kit ? ` (closest: ${plan.kit.kitId} ${pct})` : "";
      console.log(`  ? ${plan.file}  →  no confident match${guess} — skipped`);
    }
  }

  // Coverage: which real kits still have no image?
  const matchedKitIds = new Set(
    plans.filter((p) => p.status === "match" && p.kit).map((p) => p.kit!.kitId),
  );
  const missing = kits.filter((k) => !matchedKitIds.has(k.kitId));
  if (missing.length > 0) {
    console.log(`\nKits still without an image this run:`);
    for (const kit of missing) {
      console.log(`  · ${kit.kitId}  (${kit.displayName})`);
    }
  }

  if (!commit) {
    console.log(
      `\nDry run only. Re-run with --commit to write files (add --overwrite to replace existing).\n`,
    );
    return;
  }

  // Commit.
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  let written = 0;
  let skipped = 0;

  for (const plan of plans) {
    if (plan.status !== "match" || !plan.kit) continue;

    const outputPath = path.join(OUTPUT_DIR, `${plan.kit.kitId}.${OUTPUT_FORMAT}`);
    const exists = await fs
      .access(outputPath)
      .then(() => true)
      .catch(() => false);

    if (exists && !overwrite) {
      console.log(`  ↷ ${plan.kit.kitId}.webp exists — skipped (use --overwrite)`);
      skipped += 1;
      continue;
    }

    await processImage(path.join(INBOX_DIR, plan.file), plan.kit.kitId);
    written += 1;
  }

  console.log(`\nDone. ${written} written, ${skipped} skipped.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
