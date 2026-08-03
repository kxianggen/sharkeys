# Sharkeys

An AI-assisted configurator for custom mechanical keyboards. You describe the
keyboard you want in ordinary language — "a quiet office board under RM300" —
and it returns complete builds where every part is guaranteed to fit.

Final year project, BSc (Hons) Computer Science, Sunway University.

## The problem

A custom mechanical keyboard is not one product. It is six parts bought
separately — a case, a circuit board, a mounting plate, switches, keycaps and
stabilisers — and they have to be compatible with each other. Pick a case built
for one size and a circuit board built for another and the parts simply will not
go together. Buyers usually find this out after the money is spent.

There is a second problem on top of that. People describe keyboards by how they
sound and feel. They ask for something "thocky" or "creamy". Those words mean
real things to enthusiasts, but they appear nowhere in a product database, which
stores materials, mounting styles and actuation forces. So a normal search box
cannot answer the question people actually want to ask.

Sharkeys handles both. It reads the request in plain language, and it refuses to
suggest anything that cannot physically be assembled.

## How it works

The system deliberately splits responsibility between two components.

**A rule engine decides what is possible.** It checks a complete build against
seven categories of rule and it is the only thing allowed to judge
compatibility. It is ordinary code with no AI in it, so it cannot invent or
misjudge anything. Against the current catalog it rejects 99.44% of the possible
part combinations.

**An AI layer decides what the user meant.** It turns a sentence into structured
requirements, and searches by meaning rather than by keyword so that "buttery
smooth" can find the right switches even though that phrase is in no product
description.

The important rule is that the AI can suggest and explain, but never approves.
Every build passes through the rule engine before a user sees it, and validation
sits inside the recommendation path rather than beside it, so there is no way
around it.

## Running it locally

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

**It works with no configuration.** Without any API keys the app falls back to a
local catalog and a keyword-based intent reader, which is enough to browse,
configure and see recommendations. Add credentials to `.env.local` only if you
want the live database and the AI features:

| Variable | What it enables | Required |
|---|---|---|
| `OPENAI_API_KEY` | AI intent reading and the assistant | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Live catalog and user accounts | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Live catalog and user accounts | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Seeding the database (server only) | No |

## Commands

```bash
npm run dev          # start the development server
npm run test         # unit and component tests
npm run eval         # score the AI against the evaluation suite
npm run verify       # typecheck, lint, test and production build
```

`npm run verify` is the gate used before any change is committed. If any stage
fails, the whole command fails.

## What is in the project

```
src/app/                  pages and API endpoints
src/lib/rules/            the compatibility engine, the only authority on what fits
src/lib/ai/               reading a plain-language request into structured requirements
src/lib/recommendations/  assembling, validating and ranking builds
src/lib/keybot/           the conversational assistant
src/lib/eval/             the evaluation suite used to measure recommendation quality
src/data/                 the component catalog used when no database is configured
supabase/                 database schema
tests/                    unit and component tests
e2e/                      browser tests
scripts/                  benchmarks and the evaluation runner
evidence/                 raw measurement output and evidence documents
```

## Evidence and measurements

Every figure quoted in the project report is produced by a script in `scripts/`
rather than recorded by hand, and the raw output is committed alongside it.

- `evidence/figures-manifest.md` — every reported number, what produced it
  and the caveat that belongs with it
- `evidence/performance.md` — the system measured against its stated
  requirements
- `evidence/uat-fixes.md` — user testing, what was changed in response,
  and before-and-after evidence
- `evidence/raw/` — unedited output from every benchmark and evaluation run

To reproduce the main figures, with no credentials needed:

```bash
npx tsx --tsconfig tsconfig.json scripts/sweep-selectivity.ts       # decision-space reduction
npx tsx --tsconfig tsconfig.json scripts/bench-validation.ts        # rule engine speed
npx tsx --tsconfig tsconfig.json scripts/bench-recommendations.ts   # end-to-end pipeline
npx tsx --tsconfig tsconfig.json scripts/analyse-build-economics.ts # build prices
```

## Built with

Next.js and TypeScript, Supabase (PostgreSQL) with pgvector for meaning-based
search, OpenAI for language understanding, LangGraph for the assistant, Vitest
for unit tests and Playwright for browser tests.

## Scope

This is a working prototype rather than a shop. It does not take payments or
track stock. The catalog holds 60 components, each checked as genuinely
purchasable in Malaysia and priced in ringgit from a real vendor listing.
