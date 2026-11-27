/** Small statistics helpers for the v2 scorecard. Pure functions, unit-tested. */

/** Nearest-rank percentile (p in 0..100). Returns null for an empty list. */
export function percentile(values: readonly number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(sorted.length, Math.max(1, rank)) - 1];
}

export function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Sample standard deviation; null when fewer than 2 values (spread unknown). */
export function stdev(values: readonly number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values)!;
  const variance =
    values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** correct / total as a 0..1 ratio; null when total is 0. */
export function ratio(correct: number, total: number): number | null {
  return total === 0 ? null : correct / total;
}

export function pct(value: number | null, digits = 1): string {
  return value === null ? "n/a" : `${(value * 100).toFixed(digits)}%`;
}

export function fmt(value: number | null, digits = 0, unit = ""): string {
  return value === null ? "n/a" : `${value.toFixed(digits)}${unit}`;
}
