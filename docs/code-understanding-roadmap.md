# sharkeys — Code Understanding Roadmap

A self-study plan to understand your own codebase well enough to defend it to
your supervisor and examiners. Built around the concerns your supervisor raised
in your last meeting.

*Revision 2 — Session 3 corrected against the actual code (the distance
calculation is not where the previous version said it was), and a new session
added on evaluation & testing.*

---

## The one thing your supervisor is really testing

His core worry, in his words, was that you might **conflate the conceptual AI
flow with your program's actual process flow** — i.e. that you can explain how
RAG or embeddings work *in theory*, but not how *your specific code* does it,
file by file.

So the goal of everything below is not "learn how AI works." It's:

> For each important feature, be able to point at the real files and functions
> and explain what happens, in order, in plain language — and defend *why* it
> was built that way.

Your updated data flow diagrams (prompt flow, auth, community, saved builds)
are the target picture. This plan is about being able to defend every box in
them from the actual code.

---

## What you're being graded on (from the meeting)

1. **Front-end → back-end wiring** — how a user action in the UI actually
   reaches the backend and starts the prompt. He asked for this twice. Your
   biggest admitted gap.
2. **The vector / semantic search internals** — the distance calculation, the
   0.36 threshold, the 512-dimension embeddings.
3. **Design trade-off justifications** — especially "accuracy vs. resources,"
   and why you chose certain structures (e.g. seed file + Supabase vs. direct
   DB reads). The "defend your decisions" layer.
4. **AI collaboration declaration** — you must explicitly declare AI
   collaboration in CP2. Academic honesty. Not code.
5. **User testing** — run real users through the app with defined test cases,
   record usability results. A separate deliverable.

Jargon decoded (the transcript mistranscribed these):

- "rack" = **RAG** (retrieval-augmented generation / vector search)
- "LandGraph" / "lamp graph" = **LangGraph** (your agent framework)
- "dump search" = **"dumb" search** (rule-based / keyword tier)
- "smart search" = vector / semantic tier
- "CP2" = your next checkpoint submission

---

## A note on the front-end

Your supervisor advised that front-end/design work is not where the marks are,
and that's reflected here: there is no session on the landing page, the hero
animation, or component styling. Session 1 covers the front-end only as far as
the **boundary** — where a click becomes an HTTP request — because that's the
wiring question he asked twice.

Two caveats, both small:

- **CP2 still needs an honest declaration.** "AI wrote the front-end" is fine
  and true, but be ready to say what *you* decided: the configurator-mirroring
  demo over a generic chat mock, the design-system constraints, what you
  rejected and why. That's product ownership and it's defensible.
- **One front-end file is worth a sentence, not a session.**
  `tests/data/hero-demo-build.test.ts` re-runs the landing page's demo build
  through `validateBuildSelectionFromIds` on every test run, so even a
  marketing surface can't advertise an incompatible build. It's a neat
  one-line illustration that your core invariant holds *everywhere*.

---

## How to study (the method that actually works)

You vibe-coded this, so reading it cold won't stick. Use this loop every session:

1. **Trace, don't read.** Pick one flow. Follow it through the actual files in
   order — start file, next file, next function — like following a parcel.
2. **Use Claude Code as a tutor, not a builder.** Ask it to walk the real path
   through *your* code, name each file and function, explain in plain language,
   then quiz you.
3. **Write it in your own words.** After each session, write a short paragraph
   explaining the flow as if to an examiner. If you can't write it, you don't
   own it yet.
4. **Do a mock Q&A.** End each session with 3 examiner questions.

Rule of thumb: you understand something when you can explain it *without* the
code open.

---

## The sequence (why this order)

**Outside-in, following a real request**: start where the user clicks, follow
the data to the answer, then circle back to the supporting systems — then
finish with how you *prove* it all works.

---

### Session 1 — Front-end → back-end wiring  (2–3 hrs)  ← START HERE

**Why first:** your supervisor's #1 repeated ask, and your biggest admitted gap.

**What you'll trace:** what happens between a user typing a prompt / clicking
"Start building" and a request actually leaving the browser.

- `src/components/recommendation-demo.tsx` — the component owning the prompt input
- `handleSubmit` → `runRecommendationRequest` → the `fetch()` call
- How the request body is shaped, and which route it hits

**Done when you can say:** "When the user submits, *this* component calls *this*
handler, which sends a POST to `/api/recommendations` with the message in the
body. That's the front-end-to-back-end boundary."

---

### Session 2 — The prompt flow end-to-end  (2–3 hrs)

**Why second:** the heart of the product. Picks up where Session 1 ends.

**What you'll trace:** `/api/recommendations` → intent extraction (OpenAI or
local fallback) → candidate assembly from catalog → rule engine validation →
ranking → response.

Key files: `src/app/api/recommendations/`, `src/lib/ai/` (intent),
`src/lib/recommendations/service.ts` (`generateRecommendationsFromMessage`),
`src/lib/rules/compatibility.ts`.

**Done when you can say the full sentence:** "prompt → API route → intent →
assemble candidates → **rule engine validates (sole authority)** → rank →
return only validated builds." Your single most important talking point.

---

### Session 3 — The vector / semantic search (RAG)  (3 hrs)  ← the hard one

**Why here:** he pressed hardest on this, and it sits *inside* the flow you now
understand from Sessions 1–2.

> **IMPORTANT — correction to the previous roadmap.** The earlier version told
> you to find "the distance calculation function" in your TypeScript. It is not
> there, and hunting for it will waste a session. **The distance is computed in
> SQL, inside Postgres.** See below.

**The actual retrieval path, file by file:**

1. **Embedding text is built** — `buildComponentEmbeddingText()` in
   `src/lib/ai/embeddings.ts` (line ~26). Decides what text represents a
   component.
2. **Embeddings are created** — `getEmbedding()` (line ~66), OpenAI
   `text-embedding-3-small` with **`dimensions: 512`** (line ~75). This is
   where your 512 lives.
3. **Components are embedded ahead of time** — `scripts/seed-embeddings.ts`,
   run once, storing vectors in Supabase (not computed per request).
4. **Search is dispatched** — `searchComponentsBySemantic()` (line ~82) calls
   `supabase.rpc("match_components", …)`. Your TypeScript **calls** the search;
   it does not perform it.
5. **← THE DISTANCE CALCULATION LIVES HERE** —
   `supabase/migrations/20260611_add_component_embeddings.sql`, the
   `match_components` function:
   - `kc.embedding <=> query_embedding` — pgvector's **cosine distance operator**
   - `(1 - (kc.embedding <=> query_embedding))` — converts distance to
     similarity in [0, 1], higher = more similar
   - `order by kc.embedding <=> query_embedding limit match_count` — ranking
   - The column is `vector(512)`, indexed with
     `ivfflat (embedding vector_cosine_ops)`
6. **The 0.36 threshold is applied afterwards, separately** —
   `src/lib/ai/intent-preparation.ts` line ~26
   (`semanticSimilarityThreshold = 0.36`), used around line ~180 to drop weak
   matches *after* they come back from the database.
7. **Smart vs. dumb search** — `prepareIntentMatches()` (keyword/enum tier) vs.
   `prepareIntentMatchesAsync()` (adds semantic search when the user's wording
   isn't in the enums). Compare these two functions directly; the difference
   *is* the two-tier design.

**Answers to his exact questions:**

- *"Are the vectors images or text embeddings?"* → Text, of switch descriptors.
- *"Where's the distance calculated?"* → In Postgres, in the `match_components`
  SQL function, using pgvector's `<=>` cosine-distance operator — not in the
  application code.
- *"What does 0.36 do?"* → Post-filter in `intent-preparation.ts` that discards
  matches the DB returned but which are too weak to trust.

**The trade-off to volunteer (this turns your weakest topic into a strong one):**
distance is computed in the database because the IVFFlat index lives there —
ranking happens next to the data instead of pulling every embedding into Node.
512 dimensions instead of the full 1536 cuts storage and comparison cost for a
small catalog where the extra precision isn't needed. The migration even
documents why `lists = 1` is correct under ~1,000 rows and when to rebuild.
That's textbook **accuracy vs. resources** — the exact phrase he named.

---

### Session 4 — The LangGraph agent + Meg  (2 hrs)

**What you'll trace:** `src/lib/agent/graph.ts` and the nodes in
`src/lib/agent/nodes/` — `classify.ts` → `extract.ts` → `retrieve.ts` →
`validate.ts` → `answer.ts`. How `classifyNode()` decides "is this a build
request," and how Meg's grounded reply is assembled.

**The anti-hallucination guard is worth finding:** `sanitizeOpenAIAnswer()` in
`src/lib/keybot/service.ts` (~line 1153) rejects LLM output containing prices or
claims not present in the grounded facts, falling back to the deterministic
answer. That's a concrete, code-level answer to "how do you stop it inventing
things?"

**Done when you can say:** how a chat query routes through the graph, and why
Meg can't hallucinate a part.

---

### Session 5 — Auth, data layer & design trade-offs  (2–3 hrs)

**What you'll trace + defend:**

- **Auth:** credentials → Supabase Auth → session cookie → `getSessionUser` →
  RLS. Security enforced at the database, not just the UI.
- **Data layer:** `src/lib/components/catalog-source.ts` —
  `loadCatalogComponents()` returns seed data when Supabase env vars are
  missing/placeholder, reads Supabase when configured, falls back to seed on
  error. *Why:* offline dev, version-controlled, testable. This answers his
  "document/table vs. direct DB reads" challenge.
- **The rule engine as code, not a DB query** — *why:* speed, testability,
  rules rarely change.
- **Server-only secrets:** `SUPABASE_SERVICE_ROLE_KEY` never reaches browser code.

**Done when you can defend a choice**, not just describe it.

---

### Session 6 — How you know it works: evals & tests  (2–3 hrs)  ← NEW

**Why this exists:** "How did you evaluate whether your AI actually performs?"
is a standard examiner question that most student projects cannot answer. You
can, and it's backed by real domain expertise. Leaving this out was the biggest
gap in the previous roadmap.

**Two different kinds of proof — know the difference, it's the whole point:**

**a) Evals — is the AI any good?** (probabilistic, judgement-based)
`src/lib/eval/`, run with `npm run eval`:

- `intent-extraction-eval.ts` — does it understand what users mean?
- `rag-retrieval-eval.ts` — does semantic search return the right components?
- `keybot-grounding-eval.ts` — does Meg stay grounded in real facts?

The ground truth is **your own expertise** — 150+ five-star keyboard sales,
encoded as test cases (target market RM150–250, thocky/creamy preferences,
which combos actually work). That's a legitimate, defensible methodology:
domain-expert-labelled evaluation data. Runner: `scripts/run-eval.ts`.

**b) Tests — did I break anything?** (deterministic, pass/fail)
34 test files, ~215 tests in `tests/`, mirroring `src/`. They use seed data, so
they need no network or API key — deterministic and fast. `npm run verify`
gates typecheck + lint + tests + build together.

**Worth being able to name one example of each:**
`tests/rules/compatibility.test.ts` (the rule engine — your authority layer,
directly tested) and any eval case where the expected answer comes from your
sales experience.

**Done when you can answer:** "How do you know the AI works?" → evals, with
expert-labelled ground truth. "How do you know you haven't broken it?" → the
deterministic test suite and the verify gate. Two different questions, two
different mechanisms.

---

### Session 7 — Consolidate + mock defense  (2 hrs)

- Redraw the **full updated DFD** from your own notes (not mine).
- Have Claude Code play examiner and grill you across all flows.
- Fill any gaps the mock exposes.

**Done when:** you can walk any flow cold, and answer "why" for each major
decision.

---

## Two deliverables that are NOT code study

- **CP2: declare AI collaboration explicitly.** How you used Claude, Claude
  Code, and OpenAI. Include what *you* directed and decided — see the
  front-end note above. Low effort, high importance.
- **User testing.** ~5–8 test cases ("build a quiet 65% board," "publish a
  build," "log in and save"), a handful of real testers, recorded results.
  Budget a day.

---

## Time summary

| Session | Focus | Time |
|---|---|---|
| 1 | Front-end → back-end wiring | 2–3 hrs |
| 2 | Prompt flow end-to-end | 2–3 hrs |
| 3 | Vector / semantic search (RAG) | 3 hrs |
| 4 | LangGraph agent + Meg | 2 hrs |
| 5 | Auth, data layer, trade-offs | 2–3 hrs |
| 6 | Evals & tests (how you know it works) | 2–3 hrs |
| 7 | Consolidate + mock defense | 2 hrs |
| **Code study total** | | **~15–19 hrs** |
| CP2 AI declaration | (writing) | 1–2 hrs |
| User testing | (planning + testers + write-up) | ~1 day |

**Realistic calendar:** spread the 7 sessions over ~2 weeks (one every 2–3
days). Run user testing in parallel once Sessions 1–2 make you confident the
app works as intended. Write the CP2 declaration anytime.

---

## The one sentence to anchor everything

> **The AI suggests and phrases, but the deterministic rule engine is the sole
> authority on compatibility, and it is never bypassed.**

Everything else is detail hanging off that sentence — including, as of this
revision, the landing page's demo build, which is re-validated through that
same engine on every test run.

---

*When you're ready to begin a session, ask for the tutor prompt for that
session. Do them in order — each builds on the last.*
