/**
 * Independent blind pass (HQ change, 2026-11-28).
 *
 * A second reading of each product, written WITHOUT looking at the importer's
 * values: blind-view.ts shows only the shop's own data, and the answers go in
 * scripts/catalog/blind/<batch>.json with a quote from the page for every
 * value. This module compares that reading with the importer's, field by field.
 *
 * Honest label: this is an in-session pass by the same assistant that wrote
 * the extraction rules. It is a second reader, not a human check.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CACHE_DIR } from "./batch";
import { REVIEW_FIELDS, UNKNOWN, known, type Candidate, type CandidateFields, type FieldName } from "./fields";
import { formatValue, normaliseGolden } from "./golden";
import { deriveFields } from "./review";
import { parseShopifyProductList, type ShopifyProduct } from "./shopify";
import { snippetAppearsIn } from "./text";

/** One blind answer: value (or "unknown") and the page text it came from. */
export type BlindAnswer = { v: unknown; q: string };
export type BlindFile = Record<string, Partial<Record<FieldName, BlindAnswer>>>;

/** Fields compared: everything the reviewer sees except free text. */
export function comparedFields(candidate: Candidate): FieldName[] {
  const category = candidate.category.value;
  if (category === UNKNOWN) return [];
  return REVIEW_FIELDS[category].filter((f) => f !== "name" && f !== "description");
}

/** Every product the cache holds for a vendor, by handle (no network). */
export function loadCachedProducts(host: string): Map<string, ShopifyProduct> {
  const products = new Map<string, ShopifyProduct>();
  if (!existsSync(CACHE_DIR)) return products;
  for (const file of readdirSync(CACHE_DIR)) {
    const entry = JSON.parse(readFileSync(join(CACHE_DIR, file), "utf8")) as { url: string; status: number; body: string };
    if (entry.status !== 200 || !entry.url.includes(host) || !/products\.json/.test(entry.url)) continue;
    for (const product of parseShopifyProductList(entry.body)) products.set(product.handle, product);
  }
  return products;
}

/** The page data a quote may come from: the cleaned text plus variant prices. */
export function quotableText(candidate: Candidate, product: ShopifyProduct | undefined) {
  const variants = (product?.variants ?? []).map(
    (v) => `${v.title}: ${v.price.toFixed(2)}${v.available === false ? " (sold out)" : ""}`,
  );
  return `${candidate.sourceText}\nVendor field: ${product?.vendor ?? ""}\n${variants.join("\n")}`;
}

/** Builds the blind reading as a candidate, then applies the same agreed rules. */
export function blindCandidate(candidate: Candidate, answers: Partial<Record<FieldName, BlindAnswer>>): Candidate {
  const fields = { ...candidate.fields } as CandidateFields;
  for (const name of comparedFields(candidate)) {
    const answer = answers[name];
    (fields as Record<FieldName, unknown>)[name] =
      answer && answer.v !== UNKNOWN && answer.v !== null && answer.v !== ""
        ? known(answer.v, 1, "reviewer", answer.q)
        : { value: UNKNOWN, confidence: 0, source: "default", snippet: "" };
  }
  return deriveFields({ ...candidate, fields, notes: [] });
}

export type FieldComparison = {
  field: FieldName;
  importer: string;
  blind: string;
  agree: boolean;
  /** "page" = read from the page (quote checked); "rule"/"default" = derived by agreed rules. */
  basis: "page" | "rule" | "default" | "unknown";
  quoteOk: boolean;
  quote: string;
};

export function compareCandidate(
  candidate: Candidate,
  answers: Partial<Record<FieldName, BlindAnswer>>,
  product: ShopifyProduct | undefined,
) {
  const importer = deriveFields(candidate);
  const blind = blindCandidate(candidate, answers);
  const text = quotableText(candidate, product);

  const rows: FieldComparison[] = comparedFields(candidate).map((field) => {
    const answer = answers[field];
    const blindField = blind.fields[field];
    const fromPage = answer !== undefined && answer.v !== UNKNOWN && answer.v !== "" && answer.v !== null;
    const basis: FieldComparison["basis"] = fromPage
      ? "page"
      : blindField.value === UNKNOWN
        ? "unknown"
        : blindField.source === "rule"
          ? "rule"
          : "default";
    const i = normaliseGolden(formatValue(importer.fields[field].value));
    const b = normaliseGolden(formatValue(blindField.value));
    return {
      field,
      importer: i,
      blind: b,
      agree: i === b,
      basis,
      quoteOk: !fromPage || snippetAppearsIn(answer!.q, text),
      quote: fromPage ? answer!.q : "",
    };
  });

  return {
    rows,
    allAgree: rows.every((r) => r.agree),
    allQuotesOk: rows.every((r) => r.quoteOk),
    blind,
  };
}
