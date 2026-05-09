import type { CurrencyCode } from "@/lib/types";

export const CATALOG_PRICE_CURRENCY = "MYR" as const satisfies CurrencyCode;

// Deterministic prototype conversion for the Malaysia-local demo catalog.
// This is not live FX data and must not be used for production pricing.
export const PROTOTYPE_USD_TO_MYR_RATE = 4.7;

type BudgetForCatalogPricing = {
  amount: number | null;
  currency: CurrencyCode | null;
};

export type NormalizedCatalogBudget = {
  amount: number;
  currency: typeof CATALOG_PRICE_CURRENCY;
  sourceAmount: number;
  sourceCurrency: CurrencyCode | "unspecified";
  conversionRate: number;
};

export function normalizeBudgetForCatalogPricing(
  budget: BudgetForCatalogPricing | null | undefined,
): NormalizedCatalogBudget | null {
  if (budget?.amount === null || budget?.amount === undefined) {
    return null;
  }

  const sourceCurrency = budget.currency ?? CATALOG_PRICE_CURRENCY;

  switch (sourceCurrency) {
    case "MYR":
      return {
        amount: budget.amount,
        currency: CATALOG_PRICE_CURRENCY,
        sourceAmount: budget.amount,
        sourceCurrency: budget.currency ?? "unspecified",
        conversionRate: 1,
      };
    case "USD":
      return {
        amount: Number((budget.amount * PROTOTYPE_USD_TO_MYR_RATE).toFixed(2)),
        currency: CATALOG_PRICE_CURRENCY,
        sourceAmount: budget.amount,
        sourceCurrency,
        conversionRate: PROTOTYPE_USD_TO_MYR_RATE,
      };
    default:
      return throwUnsupportedCurrency(sourceCurrency);
  }
}

function throwUnsupportedCurrency(currency: never): never {
  throw new Error(`Unsupported catalog budget currency: ${currency}`);
}
