# Sharkeys

Sharkeys is an AI-assisted custom mechanical keyboard configuration platform. It will help beginners and enthusiasts select compatible keyboard parts by combining grounded component data, deterministic compatibility rules, and structured AI intent extraction.

This repository is currently in Phase 3: structured OpenAI intent extraction.

## Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI API
- Zod
- Vitest
- Playwright planned for browser flows in a later phase

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` from `.env.example` and fill values locally. Do not commit real secrets.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is reserved for server-side administrative tasks only. It must never be exposed to browser code.

## Quality Commands

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
```

## Phase 1 Domain Model

Keyboard components are modeled with reusable Zod schemas and TypeScript types in `src/lib/types`. The current component categories are:

- case
- PCB
- plate
- switch
- keycap
- stabilizer

The model includes compatibility fields for layout support, switch technology, mounting support, keycap profile, stabilizer type and sizes, connection type, sound profile, price, vendor URL, image URL, and sound URL.

Representative offline seed data lives in `src/data/components.ts`. It is intentionally small so tests can cover valid builds, invalid layout combinations, invalid switch technology combinations, sound preference warnings, and beginner-friendly metadata without requiring live Supabase credentials.

## Rule Engine

The deterministic compatibility engine lives in `src/lib/rules`. It accepts a partial or complete component selection plus a component catalog, then returns:

- `isValid`
- blocking `errors`
- non-blocking `warnings`
- combined `issues`
- human-readable `explanations`
- resolved selected components

Implemented Phase 1 rules check layout compatibility between case, PCB, and plate; switch technology support across PCB, plate, and keycaps; keycap layout support; stabilizer type and size requirements; mounting-style compatibility; missing required categories; and warning-only sound or beginner-friendliness preference mismatches.

AI recommendations must call this validation before presenting a build as compatible. The LLM can translate preferences or explain trade-offs, but the rule engine remains the source of truth.

## Phase 2 API Foundation

Phase 2 adds a seed-backed data access layer in `src/lib/components` and thin Next.js route handlers in `src/app/api`. The routes currently use offline TypeScript seed data, not live Supabase queries, so local tests and builds do not require Supabase credentials.

Available endpoints:

- `GET /api/components`
- `GET /api/components?category=switch&layout=65`
- `GET /api/components/[id]`
- `GET /api/components/category/[category]`
- `POST /api/builds/validate`

Example build validation request:

```bash
curl -X POST http://localhost:3000/api/builds/validate \
  -H "Content-Type: application/json" \
  -d '{
    "componentIds": {
      "case": "case_neo65_gasket",
      "pcb": "pcb_neo65_mx_hotswap",
      "plate": "plate_neo65_fr4",
      "switch": "switch_mx_linear_creamy",
      "keycap": "keycap_cherry_ansi_mx",
      "stabilizer": "stab_durock_v2_screw_in"
    },
    "preferences": {
      "layout": "65",
      "soundProfile": "creamy"
    }
  }'
```

The validation endpoint calls the deterministic rule engine. Future AI features must use this same validation path before showing any generated build recommendation.

Supabase integration is prepared but not live-wired yet. The migration draft lives in `supabase/migrations`, and seed-to-Supabase transforms live in `src/data/supabase`.

## Phase 3 AI Intent Extraction

Phase 3 adds server-side structured intent extraction in `src/lib/ai` and a thin API route:

- `POST /api/ai/intent`

Example request:

```bash
curl -X POST http://localhost:3000/api/ai/intent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want a beginner friendly 65% keyboard under 200 USD that sounds creamy."
  }'
```

The route extracts structured criteria such as budget, layout, sound profile, use case, beginner-friendliness, switch technology, priorities, constraints, and clarification needs. It also prepares matching search criteria and candidate component IDs grouped by category from the offline seed catalog.

Phase 3 does not create final build recommendations. The AI extracts intent only. Any future build recommendation must be assembled from grounded component data and validated through the deterministic rule engine before it is shown as compatible.

If `OPENAI_API_KEY` is not configured, the intent service returns a safe fallback with `clarificationNeeded: true`; tests do not require real OpenAI network calls.

## Development Phases

Phase 0 establishes the project foundation, folder structure, environment contract, quality tooling, and minimal integration placeholders.

Phase 1 adds the Supabase schema draft, seed component data, Zod domain schemas, and the deterministic TypeScript compatibility rule engine.

Phase 2 adds seed-backed data access helpers, API route handlers, API validation schemas, and Supabase-ready seed transforms.

Phase 3 adds structured OpenAI intent extraction that converts vague user preferences into technical criteria.

Phase 4 will build the 2D configurator, sound comparison workflow, and recommendation screens.

Phase 5 will add community gallery save, share, and clone flows.

## Architecture Rule

AI recommendations must never bypass deterministic validation. OpenAI output can suggest or explain, but final compatibility decisions must come from the TypeScript rule engine backed by Supabase component data.
