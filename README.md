# sharkeys

sharkeys is an AI-assisted custom mechanical keyboard configuration platform. It will help beginners and enthusiasts select compatible keyboard parts by combining grounded component data, deterministic compatibility rules, and structured AI intent extraction.

This repository is currently in Phase 9C.1: OpenAI-backed recommendation ranking and explanations.

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
OPENAI_MODEL=gpt-4.1-mini
OPENAI_MAX_OUTPUT_TOKENS=800
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are optional for local demo work. When they are missing, the catalog APIs use the checked-in seed data. When they are present, server-side API routes try to read the public catalog tables from Supabase and fall back to seed data if the read fails.

`SUPABASE_SERVICE_ROLE_KEY` is reserved for server-side administrative tasks only. It is not needed for Phase 7 catalog reads and must never be exposed to browser code.

`OPENAI_API_KEY`, `OPENAI_MODEL`, and `OPENAI_MAX_OUTPUT_TOKENS` are used only by server-side intent extraction and explanation generation. The app remains usable without a key through deterministic local keyword extraction. `OPENAI_MODEL` defaults to `gpt-4.1-mini`, and `OPENAI_MAX_OUTPUT_TOKENS` defaults to `800`.

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

The model includes compatibility fields for layout support, switch technology, mounting support, keycap profile, stabilizer type and sizes, connection type, sound profile, price, price currency, vendor URL, image URL, and sound URL.

Representative offline seed data lives in `src/data/components.ts`. It is intentionally small so tests can cover valid builds, invalid layout combinations, invalid switch technology combinations, sound preference warnings, beginner-friendly metadata, and MYR price handling without requiring live Supabase credentials.

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
      "case": "case_keychron_v2_max_65_abs",
      "pcb": "pcb_keychron_v2_max_65_hotswap",
      "plate": "plate_keychron_v2_max_65_pc",
      "switch": "switch_gateron_milky_yellow_pro",
      "keycap": "keycap_unknown_pudding_oem_pbt",
      "stabilizer": "stab_keychron_v2_max_screw_in"
    },
    "preferences": {
      "layout": "65",
      "soundProfile": "creamy"
    }
  }'
```

The validation endpoint calls the deterministic rule engine. Future AI features must use this same validation path before showing any generated build recommendation.

Supabase integration is prepared but not live-wired yet. The migration draft lives in `supabase/migrations`, and seed-to-Supabase transforms live in `src/data/supabase`.

## Phase 7 Supabase Catalog Foundation

Phase 7 wires the catalog read path so API routes can use Supabase-backed keyboard component rows when Supabase public env vars are configured. The implementation keeps the existing seed-backed repository as the deterministic offline fallback, so tests, local builds, and demos still work without live Supabase credentials.

Catalog behavior:

- missing Supabase URL or anon key: use `src/data/components.ts`
- successful Supabase read: use rows from `public.keyboard_components`
- Supabase read error or empty catalog: fall back to seed data so the demo stays usable

The Supabase migration keeps RLS enabled on `public.keyboard_components` and `public.component_sound_samples`, grants read access to `anon` and `authenticated`, and defines read-only `SELECT` policies for the public catalog. No public insert, update, or delete policies are added.

Phase 7 is catalog persistence/readiness only. It does not add authentication, saved-build cloud sync, payments, community gallery storage, or live inventory guarantees. Recommendations still assemble builds from grounded catalog components and must pass the deterministic rule engine before they are returned.

## Phase 7.5 Live Supabase Catalog Setup

Phase 7.5 prepares the live Supabase setup path for the catalog tables. It does not add auth, payments, cloud saved builds, or community gallery storage.

Prerequisites:

- a Supabase project created in the Supabase dashboard
- the Supabase CLI installed locally, or `npx supabase` available
- `.env.local` with real project values, never committed

Recommended setup flow:

```bash
# Optional if the CLI is not already installed globally.
npm install supabase --save-dev

npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

The migration in `supabase/migrations/20260507000000_create_keyboard_components.sql` creates `public.keyboard_components` and `public.component_sound_samples`, enables RLS, grants read access to `anon` and `authenticated`, and adds read-only `SELECT` policies for the public catalog. Do not add public insert, update, or delete policies for these tables.

After linking and applying the migration, configure `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key>
OPENAI_API_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is used only by the local seed script below. It must never be committed and must never be exposed to browser code.

Seed and verify the catalog:

```bash
npm run supabase:seed-catalog
npm run supabase:verify-catalog
```

`npm run supabase:seed-catalog` loads `.env.local`, uses the server-only service role key locally, and upserts the existing TypeScript seed catalog into Supabase. `npm run supabase:verify-catalog` uses only the public anon key and prints catalog counts.

App-level verification:

```bash
npm run dev
curl http://localhost:3000/api/components
curl http://localhost:3000/api/components/category/switch
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"message":"beginner friendly creamy 65% keyboard under RM500"}'
```

If Supabase env vars are missing, blank, or still set to `.env.example` placeholders, the app intentionally falls back to the checked-in seed catalog.

## Phase 3 AI Intent Extraction

Phase 3 adds server-side structured intent extraction in `src/lib/ai` and a thin API route:

- `POST /api/ai/intent`

Example request:

```bash
curl -X POST http://localhost:3000/api/ai/intent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want a beginner friendly 65% keyboard under RM500 that sounds creamy."
  }'
```

The route extracts structured criteria such as budget, layout, sound profile, use case, beginner-friendliness, switch technology, priorities, constraints, and clarification needs. It also prepares matching search criteria and candidate component IDs grouped by category from the offline seed catalog.

Phase 3 does not create final build recommendations. The AI extracts intent only. Any future build recommendation must be assembled from grounded component data and validated through the deterministic rule engine before it is shown as compatible.

If `OPENAI_API_KEY` is not configured, the intent service returns a deterministic local keyword fallback with `clarificationNeeded: true`; tests do not require real OpenAI network calls. The fallback recognizes common Malaysia-local budget formats such as `RM500` and `500 MYR`, plus USD formats.

## Phase 4 Validated Recommendations

Phase 4 adds a recommendation service in `src/lib/recommendations`, a route handler, and a small demo section on the home page.

Available endpoint:

- `POST /api/recommendations`

Example request:

```bash
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want a beginner friendly 65% keyboard under RM500 that sounds creamy."
  }'
```

The endpoint calls the existing intent extraction flow, maps the extracted intent into seed-backed candidate searches, assembles possible builds from known component IDs, and validates every assembled build with `validateBuildSelectionFromIds`. Only builds that pass deterministic validation are returned in `recommendations`; invalid candidate combinations are filtered out before the response.

If no valid build can be assembled, the route returns explanations and a clarification prompt instead of an unvalidated recommendation. The UI follows the same rule: it displays extracted intent and validated build cards only.

## Phase 4.5 Malaysia-Local Seed Data

Phase 4.5 replaced the fictional prototype catalog with a small curated Malaysia-focused dataset using MYR pricing and vendor/source metadata.

The catalog is still a prototype dataset, not a scraper or live inventory feed. Prices and availability are not guaranteed. Vendor URLs and metadata are included for traceability, and kit-derived compatibility records are explicitly marked with `metadata.sourceType = "kit_derived"` and a source note.

The recommendation flow now formats estimated build prices in the recommendation currency, and the local fallback parser can understand prompts such as:

- `beginner friendly creamy 65% keyboard under RM500`
- `quiet office keyboard under RM250`
- `optical 60% build with clacky sound`
- `thocky TKL typing keyboard`

Because the prototype catalog is MYR-priced, recommendation search and budget filtering normalize USD budgets into MYR with the fixed `PROTOTYPE_USD_TO_MYR_RATE` constant in `src/lib/pricing`. This is deterministic demo logic for local testing only, not live foreign-exchange data. The extracted intent still preserves the user's original currency, while candidate search and final budget checks use the normalized MYR amount so currency mismatches cannot bypass budget filtering.

## Phase 5 Configurator UI

Phase 5 turns the homepage into a fuller configuration workspace. The UI now provides:

- natural-language build requests through `POST /api/recommendations`
- multiple validated recommendations for comparison
- category-by-category inspection for case, PCB, plate, switch, keycap, and stabilizer
- MYR estimated totals and component-level price details
- vendor/source metadata and outbound vendor links where available
- compatibility status, warnings, and explanations from the deterministic rule engine
- a manual component-selection panel that loads `GET /api/components` and validates selections with `POST /api/builds/validate`

This phase does not add auth, payments, live Supabase reads, community gallery, or production deployment. The configurator still relies on offline seed data and existing API/service paths.

## Phase 6 Saved Builds Gallery

Phase 6 adds a local saved-builds foundation to the configurator workspace. Users can now:

- save the selected validated recommendation
- save a manually validated compatible build
- inspect saved builds in a local gallery panel
- review estimated MYR totals, component lists, validation status, and vendor links
- load or clone a saved build back into the manual component panel
- delete individual saved builds or clear the local gallery

Saved builds are persisted with browser `localStorage` under `sharkeys.savedBuilds.v1`. This is intentionally local/offline prototype storage. It is not authentication-backed, synced across devices, or connected to live Supabase tables yet.

The save buttons are only exposed after deterministic validation has succeeded. Recommendation saves use recommendations already validated by `src/lib/recommendations`, while manual saves require a successful `POST /api/builds/validate` result first. Loading a saved build places its component IDs into the manual panel so it can be revalidated before further use.

## Phase 8 Stitch UI

Phase 8 rebuilds the main user-facing experience using the Stitch design sources in:

- `/Users/fluffyunicorn/Downloads/stitch_ai_keyboard_configurator/sharkeys/DESIGN.md`
- `/Users/fluffyunicorn/Downloads/stitch_ai_keyboard_configurator/sharkeys_landing_page_with_keybot/code.html`

The UI now follows the light sharkeys design system: pale blue surfaces, white rounded cards, Satoshi typography, deep-blue primary actions, strong whitespace, and a prompt-first configurator flow. The landing page includes a sticky navigation bar, the functional recommendation prompt, quick prompt chips, a Keybot helper panel, validated recommendation results, manual validation, saved builds, a four-step “The intelligent way to build” section, a bento feature section, final CTA, and footer.

This phase is frontend-only. Existing API routes, deterministic compatibility validation, live Supabase catalog reads, MYR pricing, vendor links, and localStorage saved builds are preserved.

## Phase 9B.2 Curated Malaysia Catalog

Phase 9B.2 replaces the earlier weak/prototype seed catalog with higher-confidence Malaysia-accessible catalog records from the Phase 9B research document. The offline seed catalog now contains 42 records: 5 cases, 2 PCBs, 5 plates, 13 switches, 10 keycap sets, and 7 stabilizer records.

Fully buildable kit-derived anchors include Keychron V2 Max and Weikav Star 80. AL75 V2, Yunzii B87, and Yunzii QL75 remain represented only where deterministic fields are defensible; their PCB records are held until stabilizer compatibility can be verified. Standalone component records include Gateron, Akko, MMD, KTT, Outemu, Everglide, TX, C3 Equalz, Owlab, SP-Star, and FLCMMK items sourced from MKB.MY and KeebsProject. Retailers remain provenance only in metadata; ambiguous clone-style keycap sets use `brand: "Unknown"` until manufacturer/authenticity is verified.

Kit-derived structural records include `metadata.kitId` and `metadata.kitLock: true`. The deterministic rule engine requires selected kit-derived case, PCB, plate, and included stabilizer records to come from the same barebones kit. This prevents unrealistic recommendations that mix structural parts from separate local kit listings, while standalone stabilizers and future standalone ecosystem parts can still be mixed through normal compatibility rules when their metadata supports it.

This phase updates the offline catalog and Supabase seed-transform input only. It does not apply migrations, seed the live Supabase project, change API contracts, or change recommendation architecture. The deterministic rule engine remains the final compatibility gate.

## Phase 9C.1 Recommendation Quality

Phase 9C.1 improves recommendation quality while preserving the core safety architecture. OpenAI may interpret intent and phrase explanation text, but it still cannot invent products, compatibility facts, prices, vendors, or availability. Candidate builds are assembled from the catalog, validated by `validateBuildSelectionFromIds`, then ranked only after deterministic validation succeeds.

Validated builds are ranked with a deterministic scoring layer that considers layout match, switch technology match, sound profile, use case, beginner-friendliness, normalized budget fit, warning count, and Malaysia catalog provenance. The ranking logic is testable and does not depend on an LLM call.

Recommendation explanations now describe why the selected case, PCB, plate, switch, keycap, and stabilizer fit the prompt using selected component fields and validation output. Deterministic explanations remain the authoritative user-facing technical facts. When OpenAI is configured, it may process the already validated payload, but free-form model text is not appended to individual recommendation explanations; the service adds only a safe high-level notice. If OpenAI is missing, invalid, rate-limited, or unavailable, the service returns the deterministic fallback explanations instead.

No-build responses are more specific. For example, 75% aluminum prompts currently explain that the curated catalog does not yet have a verified 75% PCB and stabilizer compatibility path instead of fabricating a build. Very vague prompts keep returning one clarification question so the user can narrow layout, sound, use case, or budget.

## Phase 9D.1 Grounded Keybot Assistant

Phase 9D.1 turns Keybot from a static FAQ panel into a functional conversational helper through `POST /api/keybot`.

Keybot can answer keyboard concept questions, explain layouts and switch terms, summarize selected validated builds, explain no-build outcomes, and call the existing recommendation service when the user asks for a build suggestion. It uses the current catalog and deterministic validation output as grounding context. If OpenAI is configured, Keybot may reword grounded facts into a concise answer; if the server-side OpenAI key is missing or OpenAI fails, it falls back to deterministic local responses.

Keybot does not invent products, prices, vendors, availability, stock, or compatibility facts. It does not mutate Supabase, apply migrations, perform purchases, or bypass `validateBuildSelectionFromIds`. Build suggestions remain validated recommendation results only, and kit-derived structural parts continue to obey `metadata.kitId` / `metadata.kitLock` compatibility rules.

## Phase 9D.2 Keybot QA Polish

Phase 9D.2 polishes the Keybot UI into a floating desktop assistant and mobile bottom sheet inspired by the Stitch references. It adds the rounded “Ask Keybot” launcher, grounded trust/context states, quick action chips, calmer local fallback messaging, clearer no-build/blocker presentation, refined loading/error states, and bounded conversational routing for greetings, help, and cheaper-build prompts.

This phase is UI/UX-focused. It does not change the recommendation architecture, deterministic validation gate, Supabase schema, migrations, live data, or OpenAI grounding rules.

## Development Phases

Phase 0 establishes the project foundation, folder structure, environment contract, quality tooling, and minimal integration placeholders.

Phase 1 adds the Supabase schema draft, seed component data, Zod domain schemas, and the deterministic TypeScript compatibility rule engine.

Phase 2 adds seed-backed data access helpers, API route handlers, API validation schemas, and Supabase-ready seed transforms.

Phase 3 adds structured OpenAI intent extraction that converts vague user preferences into technical criteria.

Phase 4 adds validated recommendation assembly, `POST /api/recommendations`, and the first usable demo UI for natural-language build requests.

Phase 4.5 localizes the prototype catalog around Malaysia vendors, adds MYR currency handling, and keeps all recommendations validated by the deterministic rule engine.

Phase 5 expands the configurator UI and recommendation review experience with validated build comparison, component inspection, vendor provenance, and manual validation.

Phase 6 adds local saved-build persistence, a gallery panel, and clone/load flows without auth or live Supabase integration.

Phase 7 adds Supabase-backed catalog reads with a seed fallback, keeping the app usable offline while preparing the catalog for hosted persistence.

Phase 7.5 adds local scripts and documentation for applying, seeding, and verifying the live Supabase catalog setup.

Phase 7.6 activates and verifies the live Supabase catalog while keeping public access read-only and secrets out of version control.

Phase 8 rebuilds the front-facing UI from the Stitch design references while preserving the existing recommendation, validation, manual builder, saved builds, Supabase, and API behavior.

Phase 9B.1 researches Malaysia-local catalog candidates without changing app code or live data.

Phase 9B.2 implements the curated offline catalog records from the research shortlist while holding uncertain products until specs or stock can be confirmed.

Phase 9C.1 adds deterministic ranking, grounded recommendation explanations, configurable OpenAI model settings, and safer OpenAI failure fallbacks without changing the validation gate.

Phase 9D.1 adds a grounded Keybot conversational assistant backed by `POST /api/keybot`, catalog context, deterministic validation, and safe OpenAI/fallback behavior.

Phase 9D.2 polishes the Keybot floating assistant, grounded trust states, no-build/fallback presentation, and mobile bottom-sheet behavior without backend architecture changes.

## Architecture Rule

AI recommendations must never bypass deterministic validation. OpenAI output can suggest or explain, but final compatibility decisions must come from the TypeScript rule engine backed by grounded catalog data.
