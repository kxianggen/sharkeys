# Sharkeys

Sharkeys is an AI-assisted custom mechanical keyboard configuration platform. It will help beginners and enthusiasts select compatible keyboard parts by combining grounded component data, deterministic compatibility rules, and structured AI intent extraction.

This repository is currently in Phase 0: project foundation only.

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

## Development Phases

Phase 0 establishes the project foundation, folder structure, environment contract, quality tooling, and minimal integration placeholders.

Phase 1 will add the Supabase schema, seed component data, and the deterministic TypeScript compatibility rule engine.

Phase 2 will add structured OpenAI intent extraction that converts vague user preferences into technical criteria.

Phase 3 will build the 2D configurator, sound comparison workflow, and recommendation screens.

Phase 4 will add community gallery save, share, and clone flows.

## Architecture Rule

AI recommendations must never bypass deterministic validation. OpenAI output can suggest or explain, but final compatibility decisions must come from the TypeScript rule engine backed by Supabase component data.
