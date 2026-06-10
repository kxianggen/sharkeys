# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server at localhost:3000
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest run (all tests, no watch)
npm run test:watch   # vitest (watch mode)
npm run verify       # typecheck + lint + test + build (full gate)

# run a single test file
npx vitest run tests/rules/compatibility.test.ts

# Supabase catalog (requires .env.local with real credentials)
npm run eval                     # run all eval suites (no API key needed)
npm run supabase:seed-catalog    # upsert seed data into Supabase
npm run supabase:verify-catalog  # verify catalog counts via anon key
```

## Architecture

**sharkeys** is an AI-assisted keyboard configurator. Current phase: 10B.2A (route separation).

### Key invariant

AI output (OpenAI) can suggest and explain, but `validateBuildCompatibility` / `validateBuildSelectionFromIds` in `src/lib/rules/` is the only authority on compatibility. Every recommendation path must call validation before returning results. Never bypass.

### Routes

| Route | Purpose |
|---|---|
| `/` | Prompt-first landing page |
| `/configurator` | AI recommendation flow + manual compatibility check |
| `/my-builds` | localStorage saved builds |
| `/browse`, `/community-gallery` | Placeholders |

API routes live in `src/app/api/`: `components/*`, `builds/validate`, `ai/intent`, `recommendations`, `keybot`.

### Data flow

```
User prompt
  → POST /api/recommendations
  → src/lib/ai  (intent extraction, OpenAI or local keyword fallback)
  → src/lib/recommendations/service  (assemble candidate builds from catalog)
  → src/lib/rules  (validateBuildSelectionFromIds — only validated builds returned)
  → deterministic ranking + optional OpenAI explanation enrichment
```

### Catalog loading (`src/lib/components/catalog-source.ts`)

All API routes call `loadCatalogComponents()`, which:
1. Returns seed data if Supabase env vars are missing or placeholder values
2. Reads `public.keyboard_components` from Supabase if configured
3. Falls back to seed on error or empty result

`src/lib/components/repository.ts` provides synchronous helpers over a `readonly KeyboardComponent[]` array. `catalog-source.ts` wraps them with the async Supabase/seed selection layer.

### Seed catalog (`src/data/components.ts`)

42 records, MYR-priced, Malaysia-focused. Used by all tests — no Supabase credentials needed. Kit-derived structural parts (case/PCB/plate/included stabilizer) carry `metadata.kitLock: true` and `metadata.kitId`; the rule engine enforces that these must share the same `kitId`.

### Expert Persona (Eval Ground Truth)

The eval suite in `src/lib/eval/` encodes the owner's real-world expertise from 150+ 5-star keyboard sales on Carousell/Shopee:

- **Target market:** RM150–250, Malaysia; 90% thocky/creamy buyers; gamers + office workers
- **Secret sauce combos:** Lucky65 v1/v2 (aluminum case), MZ Z1 (budget thock), KTT Cabbage Tofu (creamy)
- **Tuning differentiator:** Krytox 205g0 on stab stems + XHT-BDZ on stab wires → removes rattle, makes cheap board sound premium
- **Conversion pattern:** Sound test is the ultimate closer — buyers decide on sound, not specs

Any AI code change must be validated against `scripts/run-eval.ts` (Phase 1B) before merging.

### lib layout

| Path | Responsibility |
|---|---|
| `src/lib/rules/` | Deterministic compatibility engine |
| `src/lib/types/` | Zod schemas + TypeScript types for all domain objects |
| `src/lib/ai/` | OpenAI structured intent extraction + local keyword fallback |
| `src/lib/recommendations/` | Build assembly, validation, and ranking |
| `src/lib/keybot/` | Keybot conversational assistant service |
| `src/lib/pricing/` | MYR budget normalization (`PROTOTYPE_USD_TO_MYR_RATE`) |
| `src/lib/components/` | Repository (sync) + catalog-source (async Supabase/seed) |
| `src/lib/supabase/` | Supabase client factory (public + admin) |
| `src/lib/openai/` | OpenAI client factory |
| `src/lib/api/` | Shared Next.js response helpers and request schemas |
| `src/lib/env.ts` | Zod-parsed env access; `readOptionalSupabasePublicEnv` detects placeholder values |

### Environment

Copy `.env.example` to `.env.local`. All vars are optional for local work:
- Missing/placeholder Supabase vars → seed catalog used automatically
- Missing `OPENAI_API_KEY` → deterministic local fallback with `clarificationNeeded: true`
- `OPENAI_MODEL` defaults to `gpt-4.1-mini`; `OPENAI_MAX_OUTPUT_TOKENS` defaults to `800`

`SUPABASE_SERVICE_ROLE_KEY` is server-only and used only by `supabase:seed-catalog`. Never expose to browser code.

Phase 3+ adds LangSmith observability:
- `LANGCHAIN_TRACING_V2=true` — enables LangSmith tracing
- `LANGCHAIN_API_KEY` — from [smith.langchain.com](https://smith.langchain.com) (sign up required)
- `LANGSMITH_PROJECT` — dashboard project name (optional, defaults to `"sharkeys"`)

### Testing

Tests live in `tests/` mirroring `src/`. `vitest.config.ts` aliases `@` → `src/`. Tests use seed data directly; no network calls required. `tests/setup.ts` loads `@testing-library/jest-dom`.
