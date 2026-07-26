# Session 2 — Location Map (the prompt flow)

Where every part of the prompt→builds flow lives. Line numbers current as of
this session; trust the **function name** over the number if they drift.

## The one-line entry point

Everything in Session 2 starts here:

- `src/lib/recommendations/service.ts` → `generateRecommendationsFromMessage` — **line 90**

That function calls the five boxes in order.

## The five boxes

| Box | Concept | File | Function (line) |
|---|---|---|---|
| 1 | Understand → intent | `src/lib/ai/intent-extraction.ts` | `extractKeyboardIntent` (57) |
| 1 | smart vs dumb decision | `src/lib/ai/intent-extraction.ts` | `if (!options.client && !apiKey)` check (~68) |
| 1 | dumb keyword fallback | `src/lib/ai/intent-extraction.ts` | `parseLocalFallbackIntent` (211) |
| 2 | Gather candidates | `src/lib/ai/intent-preparation.ts` | `prepareIntentMatchesAsync` (163) |
| 3 | Assemble + check (the heart) | `src/lib/recommendations/service.ts` | `buildValidatedRecommendations` (228) |
| 3 | **the veto (the spine)** | `src/lib/recommendations/service.ts` | `if (!validation.isValid) continue;` (284) |
| 3 | rule engine entry | `src/lib/components/repository.ts` | `validateBuildSelectionFromIds` (118) |
| 3 | the actual rules | `src/lib/rules/compatibility.ts` | `validateBuildCompatibility` (52) |
| 4 | Rank | `src/lib/recommendations/service.ts` | `scoreRecommendation` (515) |
| 5 | Explain | `src/lib/recommendations/service.ts` | `enhanceRecommendationResultWithOpenAI` (860) |

## Folder logic (why things live where they do)

```
src/
├── app/api/recommendations/route.ts   ← the "door": HTTP request handling only
├── components/recommendation-demo.tsx  ← UI only
└── lib/                                ← ALL business logic, split by job
    ├── recommendations/service.ts      ← conductor: orchestrator + boxes 3,4,5
    ├── ai/intent-extraction.ts         ← box 1 (understand)
    ├── ai/intent-preparation.ts        ← box 2 (gather)
    ├── components/repository.ts        ← rule-engine entry point
    └── rules/compatibility.ts          ← the actual compatibility rules
```

**Defensible design point:** logic lives in `lib/`, isolated from the web layer
(`app/`) and the UI (`components/`). That separation is why the logic can be
tested on its own, with seed data, no server or browser needed.

## The one file to know best

`src/lib/recommendations/service.ts` — it's the conductor. The ten-line spine
(`generateRecommendationsFromMessage`, line 90) plus boxes 3, 4, and 5 all live
here. Open this file first.

## The spine sentence, and its exact line

> The AI suggests and phrases, but the deterministic rule engine is the sole
> authority on compatibility, and it is never bypassed.

"Never bypassed" = `if (!validation.isValid) continue;` at
`src/lib/recommendations/service.ts` line 284. There is no path around it.
