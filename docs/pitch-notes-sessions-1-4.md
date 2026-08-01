# sharkeys — Pitch Notes (Sessions 1–4)

Walkthrough notes for defending the codebase. Written in pitch order: open the
file, show the code, say the explanation. Line numbers verified against the
current code — if they drift, **trust the function name, not the number**.

---

## THE ANCHOR — say this first, and return to it

> **The AI suggests and phrases, but the deterministic rule engine is the sole
> authority on compatibility, and it is never bypassed.**

Architecture in one line: **AI at the edges, deterministic authority at the core.**

A recurring theme worth naming out loud, because it appears four times:
**the cheap deterministic path runs by default; AI is only engaged for the
ambiguous tail.** (Intent extraction, candidate search, agent routing, and the
explanation layer all follow this shape.)

---

## THE MAP — the whole journey on one screen

```
BROWSER                          │ SERVER
recommendation-demo.tsx          │
  message state                  │
  handleSubmit                   │
  fetch POST ───────────────────►│ api/recommendations/route.ts   POST (13)
                                 │   request.json()   → deserialize
                                 │   schema.parse()   → validate
                                 │       ↓
                                 │ recommendations/service.ts
                                 │   generateRecommendationsFromMessage (90)
                                 │       ↓
                                 │   BOX 1  extractKeyboardIntent      → intent
                                 │   BOX 2  prepareIntentMatchesAsync  → candidates
                                 │   BOX 3  buildValidatedRecommendations → VALIDATED
                                 │   BOX 4  scoreRecommendation + .sort → ranked
                                 │   BOX 5  enhance…WithOpenAI          → explained
                                 │       ↓
  ◄──────────────────────────────│   jsonOk() → validated JSON response
```

Parallel entry point (Session 4): **Meg / the agent** re-enters boxes 1–3 through
`agent/graph.ts`. Two doorways, one engine room.

---

# SESSION 1 — Front-end → Back-end Wiring

**The framing sentence:** "My app is two separate programs with separate memory —
the browser and the server. They can only exchange text over HTTP. Here is the
exact line where one ends and the other begins."

### 1.1 — State holds the prompt

**Open:** `src/components/recommendation-demo.tsx`

```tsx
const [message, setMessage] = useState(initialPrompt ?? "");

<textarea
  value={message}
  onChange={(event) => setMessage(event.target.value)}
/>
```

**Say:** "The prompt input is a *controlled component*. `useState` holds the text
in React state; `value={message}` displays state; `onChange` fires on every
keystroke and calls the setter, which triggers a re-render. State is the single
source of truth — the textarea is only a display of it. That's why the submit
handler can read `message` directly and never query the DOM."

**If asked what breaks without `onChange`:** "`message` never updates, so the box
appears frozen and submitting would send an empty string. There's no second copy
of the truth."

### 1.2 — The boundary

**Same file:** `runRecommendationRequest` (~line 961)

```tsx
if (isLanding) {
  router.push(buildConfiguratorPromptHref(message));
  return;                                    // landing page: NO api call
}

const response = await fetch("/api/recommendations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: nextMessage }),
});
```

**Say:** "This `fetch` is the front-end/back-end boundary — the last thing that
runs on the user's machine. `POST` because I'm sending a body, not requesting by
URL. `JSON.stringify` **serializes** the live JavaScript object into text,
because HTTP carries text, not objects. `Content-Type` labels the body so the
server knows to parse it as JSON."

**Volunteer this detail:** "On the landing page there's no API call at all — it
routes to the configurator with the prompt in the URL, and the request happens
there."

### 1.3 — The server door

**Open:** `src/app/api/recommendations/route.ts` — `POST`, **line 13**

```ts
export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();              // deserialize
  } catch {
    return jsonError({ code: "invalid_json", ..., status: 400 });
  }

  try {
    const parsedRequest = recommendationsRequestSchema.parse(payload);   // validate
    const result = await generateRecommendationsFromMessage(parsedRequest);
    return jsonOk(recommendationsApiResponseSchema, { success: true, data: result });
  } catch (error) {
    if (isZodError(error)) return jsonZodError(error, "Invalid recommendation request.");
    throw error;
  }
}
```

**Say (routing):** "Next.js maps folders to URLs — the folder `api/recommendations`
*is* the path `/api/recommendations`, and `route.ts` is the reserved filename for
a request handler. The exported function name declares the HTTP verb, so `POST`
handles POST requests. (Contrast: `api/components/route.ts` exports `GET`,
because listing the catalog is a read and its data comes from URL query params,
not a body.)"

**Say (trust):** "`payload: unknown` is deliberate — this data arrived over the
network and hasn't earned trust yet. `request.json()` deserializes the text back
into an object; if the body isn't valid JSON it throws and the first `catch`
returns a 400."

**Say (validation):** "Then Zod validates the shape at *runtime*. TypeScript is
erased at compile time and can't defend against a request written by a stranger
with curl. This is where untrusted data becomes trusted."

### 1.4 — The schema

**Open:** `src/lib/ai/intent-schema.ts` (~39) and `src/lib/recommendations/schemas.ts` (~77)

```ts
export const userIntentRequestSchema = z
  .object({ message: z.string().trim().min(1).max(2000) })
  .strict();

export const recommendationsRequestSchema = userIntentRequestSchema
  .extend({ kitId: z.string().trim().min(1).max(120).optional() })
  .strict();
```

**Say:** "The route *triggers* validation; the schema *defines* what valid means.
`.strict()` rejects unknown fields entirely — if someone POSTs an extra
`isAdmin: true`, it's a loud 400 rather than a silent drop. Failing loudly on
unexpected input beats succeeding quietly."

**The duplicate-limit question** (front-end `maxLength={2000}` AND server
`.max(2000)`): "Not redundant. The front-end limit is UX for honest users; it
lives in a browser I don't control and can be bypassed entirely with curl. The
server check is the only real enforcement. **Never trust the client.**"

---

# SESSION 2 — The Prompt Flow (the five boxes)

**Open:** `src/lib/recommendations/service.ts` — `generateRecommendationsFromMessage`, **line 90**

```ts
export async function generateRecommendationsFromMessage(
  request: RecommendationsRequest,
  options: GenerateRecommendationsOptions = {},
): Promise<RecommendationResult> {
  const extraction = options.extraction
    ?? (await extractKeyboardIntent({ message: request.message }));      // BOX 1
  const catalogComponents = options.catalogComponents ?? (await getCatalogComponents());

  const preparation = await prepareIntentMatchesAsync(                    // BOX 2
    extraction.intent, catalogComponents,
  );

  const anchoredPreparation = request.kitId
    ? anchorPreparationToKit(preparation, request.kitId, catalogComponents)
    : preparation;

  const deterministicResult = createRecommendationResult(extraction, {    // BOX 3 + 4
    catalogComponents, preparation: anchoredPreparation, ...
  });

  return enhanceRecommendationResultWithOpenAI(deterministicResult, {...});  // BOX 5
}
```

**Say:** "This is the orchestrator — the spine of the product in about ten lines.
It doesn't do the work itself; it calls five specialists in order. This file is
the *caller*; the work is *defined* in other files. That separation is why each
piece is independently testable."

**On `options`:** "Every field is optional and it defaults to `{}`. In production
it's empty. It exists for dependency injection in tests — I inject a fixed
intent so the suite never calls OpenAI. Three reasons: cost per call, speed (the
suite runs in ~7s), and determinism — an LLM's output varies, and a test that
asserts a fixed result can't depend on a probabilistic input."

**On `request` vs `parsedRequest`:** "Same data. The route named it
`parsedRequest`; this function's parameter is named `request`. A parameter name
is just a local label for whatever was passed in."

### BOX 1 — Understand

**Open:** `src/lib/ai/intent-extraction.ts` — `extractKeyboardIntent`, **line 57**

```ts
if (!options.client && !apiKey) {
  return intentExtractionResultSchema.parse({
    intent: parseLocalFallbackIntent(request.message),     // ← "dumb" road
    source: "fallback_missing_api_key",
  });
}

const client = options.client ?? createOpenAIClient(apiKey);
const response = await client.responses.parse({            // ← "smart" road
  model,
  input: [
    { role: "system", content: intentSystemPrompt },       // instructions
    { role: "user",   content: request.message },           // the user's text
  ],
  text: { format: zodTextFormat(extractedKeyboardIntentSchema, "keyboard_intent") },
});
```

**Say:** "Box 1 is a translator: it turns a sentence — 'quiet office board under
RM300' — into structured fields the rule engine can use. This `if` is the
smart/dumb fork: if there's no OpenAI client available *by any route* — none
injected and no key — it falls back to deterministic keyword extraction. The app
never hard-fails without AI; it degrades."

**On the OpenAI call:** "`role: system` is the standing instruction; `role: user`
is the actual prompt. `zodTextFormat` forces the AI to answer in the exact shape
my schema demands — even the model's output is shape-validated."

### BOX 2 — Gather candidates

**Open:** `src/lib/ai/intent-preparation.ts` — `prepareIntentMatchesAsync`, **line 163**

```ts
const base = prepareIntentMatches(intent, components);         // cheap keyword pass

const needsSemantic =
  intent.soundProfile === null && intent.constraints.length > 0;   // line 169

if (!needsSemantic) return base;

const semanticResults = await searchComponentsBySemantic(semanticQuery, {
  filterCategory: "switch",
  matchCount: maxCandidatesPerCategory,
});

const aboveThreshold = semanticResults.filter(
  (r) => r.similarity >= semanticSimilarityThreshold,          // 0.36, line 26
);
if (aboveThreshold.length === 0) return base;
```

**Say:** "Box 2 narrows the catalog to plausible candidates. It always runs the
cheap keyword pass first. Semantic search only engages in one specific case: no
clear sound profile was extracted, *but* the user did describe something — i.e.
they used words that aren't in my catalog's vocabulary. Otherwise it returns
early. Same theme: cheap path by default, expensive path only when it earns its
place."

**On the threshold:** "0.36 is a quality floor applied *after* the database
returns results — details in Session 3."

### BOX 3 — Assemble + validate ★ THE HEART

**Open:** `src/lib/recommendations/service.ts` — `buildValidatedRecommendations`, **line 228**

```ts
for (const componentIds of enumerateBuildSelections(candidateSets)) {

  const components = resolveRecommendationComponents(componentIds, catalogComponents);
  if (!components) { rejectedBuildCount += 1; continue; }          // check 1: parts exist

  const selection = createBuildSelection(componentIds, intent);
  const validation = validateBuildSelectionFromIds(selection, catalogComponents);

  if (!validation.isValid) {                                       // ← LINE 284
    rejectedBuildCount += 1;
    for (const error of validation.errors) rejectionReasons.add(error.message);
    continue;                                        // ← THE VETO. Build discarded.
  }

  if (exceedsExtractedBudget(recommendation, intent)) { ... continue; }  // check 3: budget

  recommendations.push(recommendation);              // survived all three
}
```

**Say — this is the money moment of the whole pitch:**

> "This is where the architecture lives. Boxes 1 and 2 were AI-driven — the AI
> *suggested* these parts. Here, every proposed combination is put on trial. Line
> 284: if the rule engine says invalid, `continue` — the build is discarded and
> the user never sees it. There is no path around this line. That is what 'never
> bypassed' means, literally."

**Also point out:** "It collects the rejection *reasons*, so when everything
fails the app can honestly explain why rather than inventing an answer."

**The three-layer trace — walk it in this order:**

**Layer 2 — the door.** `src/lib/components/repository.ts`, **line 118**

```ts
export function validateBuildSelectionFromIds(
  selection: KeyboardBuildSelection,
  components: readonly KeyboardComponent[] = keyboardComponents,   // default catalog
) {
  return validateBuildCompatibility(selection, components);
}
```

**Say:** "A thin wrapper — the single public entry point to the rule engine. Two
jobs: it supplies the default catalog so callers don't repeat it, and it's one
front door, so if the engine's internals change I fix one line instead of five
call sites. Five features validate through here: the recommendations API, the
configurator's live check, saving a build, publishing to community, and the
landing page's demo-build guard test."

**Layer 3 — the judge.** `src/lib/rules/compatibility.ts`, **line 52**

```ts
const issues: CompatibilityIssue[] = [];

validateLayoutCompatibility(parsedSelection, selectedComponents, issues);
validateKitStructuralIntegrity(selectedComponents, issues);
validateMountCompatibility(selectedComponents, issues);
validateSwitchCompatibility(selectedComponents, issues);
validateKeycapCompatibility(parsedSelection, selectedComponents, issues);
validateStabilizerCompatibility(parsedSelection, selectedComponents, issues);
validatePreferenceWarnings(parsedSelection, selectedComponents, issues);

const errors = issues.filter((issue) => issue.severity === "error");
const warnings = issues.filter((issue) => issue.severity === "warning");

return {
  isValid: errors.length === 0,        // ← THE VERDICT, line 76
  errors, warnings, issues, ...
};
```

**Say:** "Seven independent rule functions, each writing findings into one shared
`issues` list. Errors block; warnings inform — a build can be valid-but-warned,
e.g. compatible but the sound may not match what was asked for. The verdict is
`isValid: errors.length === 0` — valid if and only if there are zero
error-severity issues. These are hardcoded deterministic functions, so the same
input always gives the same verdict. That predictability is *why* it's the
authority."

**Close the loop:** "That boolean travels back up to line 284, where `continue`
throws the build away. Seven rules ultimately decide what the user sees."

### BOX 4 — Rank

**Open:** `src/lib/recommendations/service.ts` — `scoreRecommendation`, **line 515**

```ts
let score = 100;

if (intent.layout) {
  score += components.case.layouts.includes(intent.layout) ? 16 : -24;
  ...
}
if (intent.soundProfile) {
  score += scoreSoundProfile(components.switch.soundProfile, intent.soundProfile, 28);
  score += scoreSoundProfile(components.case.soundProfile,   intent.soundProfile, 4);
}
score -= recommendation.warnings.length * 10;
```

**Say:** "Every build starts at 100, then gains points for matching intent and
loses more for mismatching — the penalty is deliberately larger than the reward,
because being wrong should cost more than being right gains. Ranking itself is
the `.sort()` at the end of the assembly loop."

**The weights question — this is a strength, claim it:** "The switch's sound is
weighted 28 while the case's is 4. That's not arbitrary: the switch dominates how
a board sounds and the case barely shifts it. These weights encode domain
knowledge from selling 150+ keyboards. I can justify every one."

**Warnings link:** "Each warning costs 10 points — so a valid-but-warned build
ranks below a clean one. Warnings don't block (box 3's job); they demote."

### BOX 5 — Explain

**Open:** `src/lib/recommendations/service.ts` — `enhanceRecommendationResultWithOpenAI`, **line 860**

```ts
input: [
  {
    role: "system",
    content: [
      "You write concise keyboard recommendation explanations.",
      "Use only the provided component facts and deterministic validation facts.",
      "Do not invent products, specs, prices, vendors, availability, or compatibility.",
      "Do not claim a build is compatible unless the provided validation says it is valid.",
    ].join(" "),
  },
  { role: "user", content: JSON.stringify(buildExplanationPromptPayload(result)) },
],
```

**Say:** "The builds are already chosen, validated and ranked before this runs.
The AI writes explanations for decisions already made — it's handed the finished
result and asked to phrase it. The system prompt explicitly forbids inventing
prices, availability, or compatibility claims. If there's no key, deterministic
template text is used instead."

**Precision that impresses (don't overclaim):** "The compatibility *decision* is
impossible for the AI to affect — that happened in box 3 before this ran. The
explanation *wording* is guarded by instruction plus structured output. Hard
guarantee where it matters; instruction-guard on the cosmetics. For Meg's chat
answers there's an additional hard programmatic guard — Session 4."

---

# SESSION 3 — Vector Search / RAG

**The framing:** "A user asks for 'buttery smooth' switches. My catalog never
uses that word, so keyword search finds nothing. Vector search matches on
*meaning* instead of exact words."

**The core idea:** "Text is converted into a list of numbers — an embedding —
that represents its meaning. Similar meanings produce nearby numbers, so
'how similar are these?' becomes arithmetic on distance."

**Two phases, at different times:**

```
PHASE A (once, at seed time)   catalog part → embedding text → 512 numbers → stored in DB
PHASE B (live, per search)     user query   → 512 numbers → find nearest stored vectors
```

### Phase A — embedding the catalog

**Open:** `src/lib/ai/embeddings.ts` — `buildComponentEmbeddingText`, **line 26**

```ts
const SOUND_SYNONYMS: Record<string, string> = {
  thocky: "deep thocky satisfying low-pitched muted thud heavy bottom-out",
  creamy: "smooth creamy buttery linear silky soft subtle muted",
  ...
};

if (component.soundProfile) {
  parts.push(`sound profile: ${component.soundProfile}`);
  const synonyms = SOUND_SYNONYMS[component.soundProfile];
  if (synonyms) parts.push(synonyms);
}
```

**Say:** "Before embedding a part I build a rich text description, and I
deliberately enrich it with colloquial synonyms. A creamy switch gets 'buttery'
and 'silky' baked into its embedding text, so a user searching 'buttery' lands
near it in vector space. I'm seeding the vocabulary bridge by hand."

**`getEmbedding`, line 66:**

```ts
const response = await client.embeddings.create({
  model: "text-embedding-3-small",
  input: text,
  dimensions: 512,          // ← line 75
});
```

**Say:** "This calls OpenAI's *embedding* model — different from the chat model —
and I **request 512 dimensions**, not the default 1536."

**The accuracy-vs-resources answer:** "More dimensions give finer discrimination
between shades of similarity, but cost more storage and slower comparison. For a
42-part catalog, 512 is ample resolution at a third of the cost. I traded
precision I don't need for efficiency I do." *(Say "request 512", not
"truncate" — there's no truncation code.)*

**Seeding:** `scripts/seed-embeddings.ts` runs this once per part and stores the
vectors in Supabase — not per request.

### Phase B — searching

**`searchComponentsBySemantic`, line 82:**

```ts
const supabaseEnv = readOptionalSupabasePublicEnv();
if (!supabaseEnv) return [];                       // silent fallback contract
const config = readOptionalOpenAIConfig();
if (!config.OPENAI_API_KEY) return [];

const queryEmbedding = await getEmbedding(query);   // SAME function as Phase A

const { data, error } = await supabase.rpc("match_components", {
  query_embedding: queryEmbedding,
  match_count: options.matchCount ?? 10,
  filter_category: options.filterCategory ?? null,
});
```

**Say:** "The query goes through the *same* `getEmbedding` function that embedded
the catalog — same model, same 512 dimensions. That symmetry is essential: two
embeddings are only comparable if produced the same way, in the same space."

**On `rpc`:** "RPC is a Remote Procedure Call — my code asking the database to run
a function that lives *inside* the database. Note what my TypeScript does here:
it embeds the query and delegates. **It does not calculate any distance.**"

**On the guards:** "No Supabase or no key returns an empty array, and callers
fall back to keyword results. Semantic search is an enhancement, never a hard
dependency."

### ★ THE DISTANCE CALCULATION — the question he already caught me on

**Open:** `supabase/migrations/20260611_add_component_embeddings.sql`

```sql
create or replace function public.match_components(
  query_embedding  vector(512),
  match_count      int  default 10,
  filter_category  text default null
)
returns table (id text, similarity float)
...
  select
    kc.id,
    (1 - (kc.embedding <=> query_embedding))::float as similarity
  from public.keyboard_components kc
  where kc.embedding is not null
    and (filter_category is null or kc.category = filter_category)
  order by kc.embedding <=> query_embedding
  limit match_count;
```

**Say — memorize this answer:**

> "The distance is calculated **in the database, not in my application code**. My
> TypeScript `searchComponentsBySemantic` embeds the query and calls
> `supabase.rpc("match_components", …)`. The math lives in this SQL function,
> defined in `supabase/migrations/20260611_add_component_embeddings.sql`, and it
> uses **pgvector's `<=>` cosine-distance operator**: `kc.embedding <=>
> query_embedding`. It runs there because the vectors and the `ivfflat` index
> both live in the database — ranking happens next to the data instead of pulling
> every embedding into Node."

**Line by line if pressed:**
- `<=>` — cosine distance between the stored vector and the query vector
- `1 - (…)` — converts distance to **similarity**, 0–1, **1 = identical**
- `order by … <=>` — nearest first
- `where kc.embedding is not null` — skip parts that were never seeded
- `filter_category is null or kc.category = filter_category` — apply the
  category filter only if one was passed (box 2 passes `"switch"`)
- `ivfflat` index — like a book's index: lets the DB jump near the right vectors
  instead of scanning all. Set to `lists = 1` deliberately — for a catalog under
  ~1,000 rows that's equivalent to an exact scan, and the migration documents
  rebuilding it larger as the catalog grows.

### The 0.36 threshold

**Back in** `src/lib/ai/intent-preparation.ts`, **line 26 / used ~line 182**

```ts
const semanticSimilarityThreshold = 0.36;

const aboveThreshold = semanticResults.filter(
  (r) => r.similarity >= semanticSimilarityThreshold,
);
if (aboveThreshold.length === 0) return base;
```

**Say:** "The database always returns *a* nearest match — but 'closest' isn't
'good enough'. If a user wants something niche, the nearest thing might still be
wrong: a clicky switch topping a 'buttery smooth' query. 0.36 is the quality
floor that discards it, and if nothing clears the bar I fall back to keyword
results."

**Provenance — answer honestly, it's a strength:** "It isn't from a formula or an
industry standard. It's empirically tuned: I ran representative queries, observed
where genuine matches scored versus off-profile noise, and set the cutoff between
them. My eval suite (`rag-retrieval-eval.ts`) verifies retrieval quality, so if I
re-tuned it I could confirm nothing broke."

### Why switches only

**Say (strong pitch line):** "Cases, PCBs and plates are described by hard specs —
layout, mount, material — which map cleanly to catalog fields, so keyword
matching is correct and cheap. Switch *sound* is subjective with unbounded
vocabulary: thocky, buttery, poppy, creamy, marbly all point at overlapping
feels, and no finite label set captures them. So I applied the expensive tool
only where language is genuinely ambiguous. The `filterCategory` parameter means
extending it to another category is a one-line change if one ever needs it."

*(Do not say "because it's only a student project" — the technical reason is
stronger and it's the real one.)*

---

# SESSION 4 — The LangGraph Agent + Meg

**The framing:** "The recommendations API only ever receives one kind of request,
so a fixed pipeline suffices. Meg is a chat box — she receives build requests,
definition questions, greetings, follow-ups. Different messages deserve different
amounts of work, so the agent has to *route*. Running the full build pipeline on
'Hi' would be nonsensical, slow, and would spend an API call for nothing."

### The graph

**Open:** `src/lib/agent/graph.ts`, lines 37–51

```ts
const workflow = new StateGraph(KeybotAgentState)
  .addNode("classify", classifyNode)
  .addNode("extract", extractNode)
  .addNode("retrieve", retrieveNode)
  .addNode("validate", validateNode)
  .addNode("compose", answerNode)
  .addEdge(START, "classify")
  .addConditionalEdges("classify", routeAfterClassify, {   // ← the fork
    extract: "extract",
    compose: "compose",
  })
  .addEdge("extract", "retrieve")
  .addEdge("retrieve", "validate")
  .addEdge("validate", "compose")
  .addEdge("compose", END);
```

```
START → classify ─┬─► compose → END                      (short: answer directly)
                  └─► extract → retrieve → validate → compose → END   (long: full build)
```

**The routing function, line 27:**

```ts
const BUILD_ROUTE = "build_request";

function routeAfterClassify(state): "extract" | "compose" {
  return state.classification === BUILD_ROUTE ? "extract" : "compose";
}
```

**Say:** "Nodes are steps, edges are paths. Everything starts at classify, and one
conditional edge decides the route: a build request takes the long path; anything
else goes straight to composing an answer. Both paths end at `compose`, so every
message produces a reply."

### The classify node — the theme again

**Open:** `src/lib/agent/nodes/classify.ts` — `classifyNode`, **line 60**

```ts
const regexClassification = classifyKeybotMessage(message);       // cheap, deterministic
const llmRouterEnabled = process.env.KEYBOT_LLM_CLASSIFY === "true";

if (
  regexClassification !== "vague_question" ||    // regex was confident
  !llmRouterEnabled ||
  !config.OPENAI_API_KEY
) {
  return { classification: regexClassification };
}

// only when regex gave up:
const model = new ChatOpenAI({ model: config.OPENAI_MODEL, temperature: 0 });
```

**Say:** "A deterministic regex classifier handles routing and is the eval ground
truth. The LLM engages *only* when the regex returns `vague_question` — i.e. it
admits it can't tell. That's the same pattern as intent extraction and semantic
search: deterministic by default, AI for the ambiguous tail. `temperature: 0`
because classification should be reproducible — the same message must always
route the same way. And the LLM router is off by default via env flag, so the
baseline stays deterministic and matches my eval expectations exactly."

### State — how nodes share work

**Open:** `src/lib/agent/state.ts`

```ts
export const KeybotAgentState = Annotation.Root({
  request: Annotation<KeybotRequest>,
  classification: Annotation<string>({ ..., default: () => "vague_question" }),
  intent: Annotation<ExtractedKeyboardIntent | null>({ ... }),
  candidateIds: ...,
  validationResult: ...,
  answer: ..., source: ..., relatedIds: ..., clarification: ...,
});
```

**Say:** "State is a shared clipboard passed node to node. Each node reads what it
needs and writes only its own fields — classify writes `classification`, extract
writes `intent`, and so on. Nodes run sequentially and own distinct fields, so
'last write wins' is safe. The intermediate fields also exist for observability:
they surface node-by-node in LangSmith traces, which is how I debug the agent."

### The long path reuses everything

**Say — important point:** "The long path is `extract → retrieve → validate`,
which maps onto boxes 1, 2 and 3. Meg has **no compatibility rules of her own** —
her validate node calls the same `validateBuildSelectionFromIds` entry point. Two
doorways, one engine room."

**Why that matters for the anchor:** "That's what makes 'sole authority' literally
true rather than a slogan. If Meg had her own rules there'd be two authorities;
they could drift and give contradictory verdicts on the same build, and every
rule change would need applying twice. There's exactly one implementation."

### ★ `sanitizeOpenAIAnswer` — the hard anti-hallucination guard

**Open:** `src/lib/keybot/service.ts` — **line 1153**

```ts
function sanitizeOpenAIAnswer(answer: string, facts: KeybotFacts): string | null {
  const trimmed = answer.trim();
  if (!trimmed) return null;

  // 1. availability claims I have no data for
  if (/\b(?:in|out of)[\s-]?stock\b|\bships?\s+(?:today|tomorrow|now)\b/i.test(trimmed))
    return null;

  // 2. anything resembling a leaked key/secret
  if (/\bsk-[A-Za-z0-9_-]{4,}|\b(?:api[\s_-]?key|secret|token)\s*[=:]\s*\S/i.test(trimmed))
    return null;

  // 3. every price in the answer must exist in the grounded facts
  const groundedAmounts = collectGroundedAmounts(facts);
  for (const match of trimmed.matchAll(/(?:MYR|RM|USD|\$)\s*([\d,]+(?:\.\d{1,2})?)/gi)) {
    const value = Number(match[1].replaceAll(",", ""));
    if (!Number.isFinite(value) || !groundedAmounts.has(String(Math.round(value * 100))))
      return null;                        // ← invented price → reject WHOLE answer
  }

  return trimmed;
}
```

**Used at ~line 263:**

```ts
sanitizeOpenAIAnswer(parsed.answer, facts) ?? facts.deterministicAnswer
```

**Say — this is the best hallucination answer in the project:**

> "For Meg I don't only *instruct* the AI not to invent prices — I *verify* it.
> This function extracts every monetary amount from the model's reply with a regex
> and checks each against the grounded catalog figures. If any price isn't real,
> the entire answer is rejected. It also rejects stock and shipping claims,
> because I hold no availability data. When it returns null, the `??` falls back
> to the deterministic answer — so a hallucinating model produces *no* reply
> rather than a wrong one. This is a hard programmatic guard, not a soft
> instruction: the model cannot talk its way past a regex."

---

# THE 90-SECOND WALKTHROUGH (rehearse this)

> "A user types a prompt into a controlled React input, so the text lives in
> component state. On submit, `runRecommendationRequest` calls `fetch` with a POST
> to `/api/recommendations`, serializing the object to JSON — that's the
> front-end/back-end boundary. The route handler deserializes it as `unknown`,
> validates it with a strict Zod schema, and calls
> `generateRecommendationsFromMessage`.
>
> That orchestrator runs five steps. Intent extraction turns the sentence into
> structured fields — OpenAI if a key exists, keyword fallback if not. Candidate
> preparation filters the catalog, escalating to vector search only when the user
> described something my catalog's vocabulary doesn't cover. Then assembly
> enumerates combinations and runs every one through the deterministic rule
> engine — invalid builds hit `continue` and never reach the user. Survivors are
> scored against intent and sorted, and finally OpenAI writes explanations for
> builds that were already chosen and validated.
>
> Meg, the chat agent, is a second doorway into the same machinery: a LangGraph
> that classifies the message, routes build requests through the identical
> extract-retrieve-validate path, and validates her replies against grounded facts
> before showing them.
>
> Throughout, the same principle holds: deterministic logic by default, AI only
> for the ambiguous tail — and the rule engine is the sole authority on
> compatibility, never bypassed."

---

# QUICK-REFERENCE — file, function, line

| Concept | File | Function / line |
|---|---|---|
| prompt state + submit | `src/components/recommendation-demo.tsx` | `runRecommendationRequest` (~961) |
| **the boundary** | same | the `fetch(...)` call |
| API door | `src/app/api/recommendations/route.ts` | `POST` (13) |
| request schema | `src/lib/ai/intent-schema.ts` · `…/recommendations/schemas.ts` | ~39 · ~77 |
| **orchestrator (the spine)** | `src/lib/recommendations/service.ts` | `generateRecommendationsFromMessage` (90) |
| box 1 understand | `src/lib/ai/intent-extraction.ts` | `extractKeyboardIntent` (57) |
| box 1 smart/dumb fork | same | `if (!options.client && !apiKey)` (~68) |
| box 2 gather | `src/lib/ai/intent-preparation.ts` | `prepareIntentMatchesAsync` (163) |
| semantic trigger | same | `needsSemantic` (169) |
| **0.36 threshold** | same | line 26, applied ~182 |
| box 3 assembly | `src/lib/recommendations/service.ts` | `buildValidatedRecommendations` (228) |
| **THE VETO** | same | `if (!validation.isValid) continue` (284) |
| engine front door | `src/lib/components/repository.ts` | `validateBuildSelectionFromIds` (118) |
| engine (7 rules) | `src/lib/rules/compatibility.ts` | `validateBuildCompatibility` (52) |
| **THE VERDICT** | same | `isValid: errors.length === 0` (76) |
| box 4 rank | `src/lib/recommendations/service.ts` | `scoreRecommendation` (515) |
| box 5 explain | same | `enhanceRecommendationResultWithOpenAI` (860) |
| embedding text + synonyms | `src/lib/ai/embeddings.ts` | `buildComponentEmbeddingText` (26) |
| **512 dimensions** | same | `getEmbedding` (66), `dimensions: 512` (75) |
| RPC call (no math here) | same | `searchComponentsBySemantic` (82) |
| **★ DISTANCE `<=>`** | `supabase/migrations/20260611_add_component_embeddings.sql` | `match_components` |
| agent graph + fork | `src/lib/agent/graph.ts` | lines 27–51, `invokeKeybotAgent` (66) |
| classify (regex→LLM) | `src/lib/agent/nodes/classify.ts` | `classifyNode` (60) |
| agent state | `src/lib/agent/state.ts` | `KeybotAgentState` |
| **★ anti-hallucination** | `src/lib/keybot/service.ts` | `sanitizeOpenAIAnswer` (1153) |

---

# LIKELY QUESTIONS — one-line answers

**"Where does front-end meet back-end?"** The `fetch` in `runRecommendationRequest`.

**"Why Zod when you have TypeScript?"** TypeScript protects me from myself at
compile time and is erased at runtime; Zod protects the app from strangers at
runtime.

**"maxLength is already 2000 on the input — why check again?"** The front-end
limit lives in a browser I don't control and is bypassable with curl. The server
is the only real enforcement. Never trust the client.

**"Where is the distance calculated?"** In Postgres, in the `match_components` SQL
function, using pgvector's `<=>` cosine-distance operator. My TypeScript only
calls it via `supabase.rpc`.

**"What does 0.36 do and where did it come from?"** Similarity floor in
`intent-preparation.ts`; empirically tuned by observing real query scores, not
from a formula. Eval suite verifies retrieval.

**"Why 512 dimensions?"** Accuracy vs. resources — 512 is ample resolution for a
42-part catalog at a third the storage and comparison cost of 1536.

**"What stops the AI hallucinating a price?"** For builds: the AI never chooses
them — box 3 did, before the AI ran. For Meg's text: `sanitizeOpenAIAnswer`
verifies every price against grounded facts and rejects the whole answer
otherwise. Verification, not instruction.

**"How do you know a build is valid?"** Seven rule functions write issues into a
shared list; `isValid` is `errors.length === 0`; the assembly loop discards
anything invalid at line 284.

**"Why are the scoring weights those numbers?"** They encode domain knowledge —
the switch dominates sound (28), the case barely affects it (4). Justifiable from
150+ real sales, not arbitrary.

**"Why does Meg need a graph instead of a pipeline?"** A chat box receives many
kinds of message; a greeting shouldn't trigger build assembly. Branching matches
work to intent.
