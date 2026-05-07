# Sharkeys

Sharkeys is an AI-assisted custom mechanical keyboard configuration platform. It will help beginners and enthusiasts select compatible keyboard parts by combining grounded component data, deterministic compatibility rules, and structured AI intent extraction.

This repository is currently in Phase 1: data foundation and deterministic compatibility validation.

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

## Development Phases

Phase 0 establishes the project foundation, folder structure, environment contract, quality tooling, and minimal integration placeholders.

Phase 1 adds the Supabase schema draft, seed component data, Zod domain schemas, and the deterministic TypeScript compatibility rule engine.

Phase 2 will add structured OpenAI intent extraction that converts vague user preferences into technical criteria.

Phase 3 will build the 2D configurator, sound comparison workflow, and recommendation screens.

Phase 4 will add community gallery save, share, and clone flows.

## Architecture Rule

AI recommendations must never bypass deterministic validation. OpenAI output can suggest or explain, but final compatibility decisions must come from the TypeScript rule engine backed by Supabase component data.
