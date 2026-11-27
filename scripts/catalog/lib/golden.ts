/**
 * Golden set (v2 WS2, subtask 6; HQ note: 20 parts, pre-filled).
 *
 * The sheet is one row per (part, field), pre-filled with the importer's
 * value so Jayson only corrects. "unknown" is pre-filled as an empty cell:
 * leave it empty if the product page really does not say, or type the value.
 *
 * Accuracy compares the importer's snapshot (taken when the sheet was made)
 * with Jayson's corrected sheet:
 *   - correct  — importer value equals the golden value
 *   - wrong    — importer gave a value and it differs (the dangerous case)
 *   - missed   — importer said unknown, but the golden sheet has a value
 *   - unknown-ok — both empty / unknown (page does not say)
 * accuracy = correct / (correct + wrong): how often a value it DID give was right.
 * coverage = (correct + wrong) / rows where the golden sheet has a value.
 */
import { REVIEW_FIELDS, UNKNOWN, type Candidate, type FieldName } from "./fields";

export type GoldenRow = {
  key: string;
  category: string;
  sourceUrl: string;
  field: FieldName;
  importerValue: string;
  confidence: string;
  correctValue: string;
};

export const GOLDEN_HEADER = ["key", "category", "source_url", "field", "importer_value", "confidence", "correct_value"];

/** Fields that matter for accuracy: compatibility and spec fields, not free text. */
const SCORED_EXCLUDE = new Set<FieldName>(["description", "name"]);

export function formatValue(value: unknown): string {
  if (value === UNKNOWN || value === undefined || value === null) return "";
  if (Array.isArray(value)) return [...value].map(String).sort().join(";");
  return String(value);
}

export function normaliseGolden(text: string): string {
  return text
    .split(/[;,]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join(";");
}

/** Round-robin across categories so the 20 are spread out. */
export function pickGolden(candidates: Candidate[], count: number): Candidate[] {
  const byCategory = new Map<string, Candidate[]>();
  for (const c of candidates) {
    const key = String(c.category.value);
    byCategory.set(key, [...(byCategory.get(key) ?? []), c]);
  }
  const queues = [...byCategory.values()];
  const picked: Candidate[] = [];
  while (picked.length < count && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && picked.length < count) picked.push(next);
    }
  }
  return picked;
}

export function goldenRows(candidates: Candidate[]): GoldenRow[] {
  return candidates.flatMap((c) => {
    const category = c.category.value;
    if (category === UNKNOWN) return [];
    return REVIEW_FIELDS[category]
      .filter((field) => !SCORED_EXCLUDE.has(field))
      .map((field) => {
        const f = c.fields[field];
        const importerValue = formatValue(f.value);
        return {
          key: c.key,
          category: String(category),
          sourceUrl: c.sourceUrl,
          field,
          importerValue,
          confidence: f.value === UNKNOWN ? "" : f.confidence.toFixed(2),
          correctValue: importerValue,
        };
      });
  });
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(rows: GoldenRow[]): string {
  const lines = [GOLDEN_HEADER.join(",")];
  for (const r of rows) {
    lines.push([r.key, r.category, r.sourceUrl, r.field, r.importerValue, r.confidence, r.correctValue].map(csvCell).join(","));
  }
  return `${lines.join("\n")}\n`;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c !== "")) rows.push(row);
  return rows;
}

export function readGoldenCsv(text: string): GoldenRow[] {
  const [header, ...rows] = parseCsv(text);
  const index = (name: string) => header.indexOf(name);
  return rows.map((r) => ({
    key: r[index("key")],
    category: r[index("category")],
    sourceUrl: r[index("source_url")],
    field: r[index("field")] as FieldName,
    importerValue: r[index("importer_value")] ?? "",
    confidence: r[index("confidence")] ?? "",
    correctValue: r[index("correct_value")] ?? "",
  }));
}

export type FieldScore = { field: string; correct: number; wrong: number; missed: number; unknownOk: number };

export function scoreGolden(rows: GoldenRow[]) {
  const byField = new Map<string, FieldScore>();
  const wrongRows: GoldenRow[] = [];
  let edited = 0;
  for (const row of rows) {
    const score = byField.get(row.field) ?? { field: row.field, correct: 0, wrong: 0, missed: 0, unknownOk: 0 };
    const importer = normaliseGolden(row.importerValue);
    const golden = normaliseGolden(row.correctValue);
    if (importer !== golden) edited++;
    if (!importer && !golden) score.unknownOk++;
    else if (!importer) score.missed++;
    else if (importer === golden) score.correct++;
    else {
      score.wrong++;
      wrongRows.push(row);
    }
    byField.set(row.field, score);
  }
  const fields = [...byField.values()].sort((a, b) => a.field.localeCompare(b.field));
  const total = fields.reduce(
    (t, f) => ({ correct: t.correct + f.correct, wrong: t.wrong + f.wrong, missed: t.missed + f.missed, unknownOk: t.unknownOk + f.unknownOk }),
    { correct: 0, wrong: 0, missed: 0, unknownOk: 0 },
  );
  const accuracy = total.correct + total.wrong > 0 ? total.correct / (total.correct + total.wrong) : 0;
  const goldenWithValue = total.correct + total.wrong + total.missed;
  const coverage = goldenWithValue > 0 ? (total.correct + total.wrong) / goldenWithValue : 0;
  return { fields, total, accuracy, coverage, edited, wrongRows };
}
