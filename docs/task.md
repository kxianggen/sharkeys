# Sharkeys — Project Task Tracker

> Deadline: early August 2026 (~8-9 weeks from June 2026)
> Stack: LangGraph.js (TypeScript), Supabase + pgvector, OpenAI, LangSmith

---

## Phase 1: Cleanup + Evaluation Suite (~1.5 weeks)

**Goal:** Remove dead features. Establish eval baseline *before* touching any AI code.

### 1A. Remove Visual Builder

- [x] Delete `src/app/visual-builder/page.tsx`
- [x] Delete `tests/app/visual-builder-page.test.tsx`
- [x] Remove `/visual-builder` nav links from remaining components
- [x] Commit cleanup

### 1B. Evaluation Suite

- [x] Create `src/lib/eval/intent-extraction-eval.ts` (30 synthetic buyer test cases)
- [x] Create `src/lib/eval/keybot-grounding-eval.ts` (10 secret-sauce grounding tests)
- [ ] Create `src/lib/eval/rag-retrieval-eval.ts` (verify expert combos surface from catalog)
- [ ] Create `scripts/run-eval.ts` (CLI runner — executes all evals, prints pass/fail metrics)

### Phase 1 Checkpoints (explain before moving to Phase 2)

- What does `extractKeyboardIntent()` do? Walk through the local fallback path line by line.
- Why does "buttery smooth" fail with keyword search? What regex patterns does the current system check?
- What is `classifyKeybotMessage()` doing with its 12 regex branches? Why is this brittle?

---

## Phase 2: RAG with pgvector (~1.5 weeks)

**Goal:** Replace keyword-based component search with semantic embedding search so "buttery smooth" finds creamy linear switches.

- [ ] Supabase migration: enable `pgvector`, add `embedding vector(512)` column, create `match_components` RPC
- [ ] Create `buildComponentEmbeddingText(component)` — rich text for embedding
- [ ] Script `scripts/seed-embeddings.ts` — embed all 42 catalog components
- [ ] Implement `searchComponentsBySemantic(query, options)` calling Supabase RPC
- [ ] Integrate semantic search into intent preparation + Keybot fallback
- [ ] Run eval suite — confirm retrieval recall improvement vs. baseline

### Phase 2 Checkpoints

- What is an embedding? Why does `text-embedding-3-small` with 512 dimensions work here?
- What is cosine similarity?
- Show before/after retrieval recall numbers from eval suite.

---

## Phase 3: LangGraph.js Agent + Observability (~1.5 weeks)

**Goal:** Replace the hardcoded regex classifier and linear pipeline with a stateful LangGraph agent. Add LangSmith tracing.

- [ ] Install `@langchain/langgraph`, `langsmith` packages
- [ ] Define agent state in `src/lib/agent/state.ts`
- [ ] Create nodes: `classify`, `retrieve`, `extract`, `validate`, `answer`
- [ ] Compile graph with conditional routing
- [ ] Wire `POST /api/keybot` to invoke agent
- [ ] Implement short-lived memory using LangGraph checkpointers
- [ ] Sign up at [smith.langchain.com](https://smith.langchain.com) for LangSmith account
- [ ] Configure `LANGCHAIN_TRACING_V2=true` and `LANGCHAIN_API_KEY` in `.env.local`
- [ ] Observe traces: analyze latency, token usage, node routing
- [ ] Run eval suite — verify agent matches or beats baseline

### Phase 3 Checkpoints

- Draw the graph nodes and edges on a whiteboard.
- Walk through a LangSmith trace of a multi-turn conversation.
- Explain the difference between stateful agent memory and passing a simple `messages` array.

---

## Phase 4: Supabase Auth + Community Gallery (~1.5 weeks)

**Goal:** User authentication + community gallery where users post builds and tag @keybot in comments for AI-grounded answers.

- [ ] Set up `public.profiles`, Supabase Auth helpers, Login/Signup pages
- [ ] Create Supabase tables: `build_posts`, `post_comments`
- [ ] Build gallery UI and post detail pages
- [ ] Implement @keybot comment detection → load build context → invoke LangGraph agent → post AI reply

### Phase 4 Checkpoints

- How does Supabase Auth + RLS work?
- Trace the flow: comment creation → AI response.
- How does Keybot know which build is being discussed?

---

## Phase 5: Multi-Modal Vision + Polish (~1.5 weeks)

**Goal:** Image-based intent extraction. Systematic prompt optimization. Final eval report.

- [ ] Add `extractIntentFromImage()` using GPT-4.1-mini vision
- [ ] Image upload UI
- [ ] A/B test 3-5 prompt variants using eval suite — adopt winning prompt
- [ ] Generate final markdown report: baseline vs. final metrics across all eval categories

### Phase 5 Checkpoints

- Why did you pick the winning prompt variant?
- Walk through the entire AI pipeline from user input → response.
