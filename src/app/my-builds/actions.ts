"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import {
  getCatalogComponents,
  validateBuildSelectionFromIds,
} from "@/lib/components";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  requiredComponentCategories,
  type CompatibilityResult,
  type ComponentIdSelection,
} from "@/lib/types";

// Assumes ~70 switches per board — same estimate semantics as the
// configurator's running total, so saved prices match what the user saw.
const ESTIMATED_SWITCH_COUNT = 70;

const savedBuildInputSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  source: z.enum(["recommendation", "manual"]),
  componentIds: z.record(z.string(), z.string().trim().min(1)),
});

export type SaveBuildInput = z.infer<typeof savedBuildInputSchema>;

export type SaveBuildResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

type PreparedSavedBuild = {
  componentIds: ComponentIdSelection;
  title: string;
  validationSnapshot: Omit<CompatibilityResult, "selectedComponents">;
  estimatedPrice: number | null;
  estimatedPriceCurrency: string | null;
};

type PriceEstimate = { amount: number; currency: string };

function estimatePrice(validation: CompatibilityResult): PriceEstimate | null {
  const prices: PriceEstimate[] = [];
  for (const category of requiredComponentCategories) {
    const component = validation.selectedComponents[category];
    if (
      !component ||
      component.price === undefined ||
      component.priceCurrency === undefined
    ) {
      continue;
    }
    prices.push({
      amount:
        category === "switch"
          ? component.price * ESTIMATED_SWITCH_COUNT
          : component.price,
      currency: component.priceCurrency,
    });
  }

  const [firstPrice] = prices;
  if (
    !firstPrice ||
    prices.some((price) => price.currency !== firstPrice.currency)
  ) {
    return null;
  }

  return {
    amount: Number(
      prices.reduce((total, price) => total + price.amount, 0).toFixed(2),
    ),
    currency: firstPrice.currency,
  };
}

/**
 * Validates a candidate saved build server-side against the real catalog.
 * Invariant: the validation snapshot (and the compatible/incompatible verdict)
 * is always computed here from the catalog — never trusted from the client.
 * Returns null when the selection is incomplete or fails the rule engine.
 */
async function prepareSavedBuild(
  input: SaveBuildInput,
): Promise<PreparedSavedBuild | null> {
  const componentIds: ComponentIdSelection = {};
  for (const category of requiredComponentCategories) {
    const value = input.componentIds[category];
    if (typeof value !== "string" || !value.trim()) return null;
    componentIds[category] = value.trim();
  }

  const catalog = await getCatalogComponents();
  const validation = validateBuildSelectionFromIds({ componentIds }, catalog);
  if (!validation.isValid) return null;

  const caseName = validation.selectedComponents.case?.name;
  const switchName = validation.selectedComponents.switch?.name;
  const fallbackTitle =
    caseName && switchName ? `${caseName} with ${switchName}` : "Saved build";
  const price = estimatePrice(validation);

  return {
    componentIds,
    title: input.title ?? fallbackTitle,
    // Lean, JSON-serializable snapshot (drop the heavy component objects).
    validationSnapshot: {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      issues: validation.issues,
      explanations: validation.explanations,
    },
    estimatedPrice: price?.amount ?? null,
    estimatedPriceCurrency: price?.currency ?? null,
  };
}

/**
 * Saves a validated build to the signed-in user's account. Ownership is
 * enforced twice: `requireUser` (redirects to login without a session) and the
 * saved_builds RLS insert policy (`auth.uid() = user_id`).
 */
export async function saveBuildAction(
  rawInput: SaveBuildInput,
): Promise<SaveBuildResult> {
  const user = await requireUser("/configurator");

  const parsed = savedBuildInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Invalid build payload." };
  }

  const prepared = await prepareSavedBuild(parsed.data);
  if (!prepared) {
    return {
      ok: false,
      error: "Only complete builds that pass compatibility validation can be saved.",
    };
  }

  const result = await insertSavedBuildWithSource(
    user.id,
    prepared,
    parsed.data.source,
  );
  if (result.ok) revalidatePath("/my-builds");
  return result;
}

async function insertSavedBuildWithSource(
  userId: string,
  prepared: PreparedSavedBuild,
  source: "recommendation" | "manual",
): Promise<SaveBuildResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("saved_builds")
    .insert({
      user_id: userId,
      title: prepared.title,
      component_ids: prepared.componentIds,
      validation_snapshot: prepared.validationSnapshot,
      estimated_price: prepared.estimatedPrice,
      estimated_price_currency: prepared.estimatedPriceCurrency,
      source,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not save the build." };
  }

  return { ok: true, id: data.id };
}

/** Deletes one of the signed-in user's saved builds (form action). */
export async function deleteSavedBuildAction(formData: FormData): Promise<void> {
  const user = await requireUser("/my-builds");

  const savedBuildId = formData.get("savedBuildId");
  if (typeof savedBuildId !== "string" || !savedBuildId) return;

  const supabase = await createSupabaseServerClient();
  // RLS already scopes deletes to the owner; the explicit user_id filter keeps
  // the intent obvious and is a no-op safety net.
  await supabase
    .from("saved_builds")
    .delete()
    .eq("id", savedBuildId)
    .eq("user_id", user.id);

  revalidatePath("/my-builds");
}

export type MigrateLocalBuildsResult = {
  migrated: number;
  skipped: number;
};

const MAX_MIGRATED_BUILDS = 12; // the old localStorage cap

/**
 * One-time import of legacy localStorage builds into the account. Each
 * candidate is re-validated server-side from the catalog; invalid or
 * incomplete ones are skipped (counted), never failing the whole migration.
 */
export async function migrateLocalSavedBuildsAction(
  rawCandidates: SaveBuildInput[],
): Promise<MigrateLocalBuildsResult> {
  const user = await requireUser("/my-builds");

  const candidates = Array.isArray(rawCandidates)
    ? rawCandidates.slice(0, MAX_MIGRATED_BUILDS)
    : [];

  let migrated = 0;
  let skipped = 0;

  for (const rawCandidate of candidates) {
    const parsed = savedBuildInputSchema.safeParse(rawCandidate);
    if (!parsed.success) {
      skipped += 1;
      continue;
    }

    const prepared = await prepareSavedBuild(parsed.data);
    if (!prepared) {
      skipped += 1;
      continue;
    }

    const result = await insertSavedBuildWithSource(
      user.id,
      prepared,
      parsed.data.source,
    );
    if (result.ok) {
      migrated += 1;
    } else {
      skipped += 1;
    }
  }

  if (migrated > 0) revalidatePath("/my-builds");

  return { migrated, skipped };
}
