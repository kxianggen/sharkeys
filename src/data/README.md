# Data

Seed data lives in `components.ts`.

The dataset is intentionally small and representative. It is used for offline rule-engine, API, and recommendation tests and should not be treated as a production product catalog.

Phase 4.5 uses a Malaysia-local prototype catalog with MYR pricing and vendor/source metadata. Kit-derived records split a vendor keyboard kit into case, PCB, plate, and stabilizer entries for compatibility testing only; those entries are marked with `metadata.sourceType = "kit_derived"`.

Prices, stock, and availability are source observations for demo traceability, not live guarantees.
