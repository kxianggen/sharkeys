# WS0 baseline: what the 15 calibration chats show (HQ, 27 Nov 2026)

**Source:** eval/v2/calibration (run-3, one run per persona). Graded by HQ (Claude) from the full transcripts and confirmed by Jayson.

**Result: 6 of 15 (40%) succeeded.**
- Wins: p06 gift buyer, p08 wireless/Mac, p09 small desk, p10 code-mixer (borderline), p11 out-of-catalogue, p12 mind-changer.
- The rubric-v1 judge said 7/15, and agreed with these grades on 12 of 15. Its 3 disagreements (p03, p14, p10) all follow the persona's accept/give-up instead of the screen.

This matches Jayson's read: on easy requests the app is fine, but once a request stretches past the obvious it is generic and stubborn, and ignores what the user asked for.

## Root causes, in priority order (this is WS1's work list)

1. **False "no build in budget".** In p01, p09, p10 and p13 the bot says nothing fits (closest RM474–481), yet GMK67 builds at RM281–331 exist.
   - **Cause (found by WS0): recommendations depend on catalogue row order.** The live Supabase order hides the cheapest builds; the seed order shows them. The offline eval uses the seed order, so it never saw the bug.
   - Fix it in `src/lib/recommendations/` so the result is order-independent, with a test that shuffles the catalogue.
   - The no-build message must also name the real blocking constraint.
2. **Named parts, exclusions and colour are ignored by search.**
   - p04: "Oil King/Boba", "no milky yellow"
   - p10: "Lucky65 aluminium"
   - p07: "purple" matched the switch *name*, not the keycap colour
   - p01: "full keyboard" (meaning a complete set) was read as full-size layout
   - "Wireless 75%" returns wired builds, because there's no connection field.
   - Fix: hard constraints. When one can't be met, say which one and why.
3. **No honest "no".** For items not in the catalogue, ordinary builds come back on 61.5% of the TEST rows where none should exist.
4. **Over-budget builds shown silently.** p02 (RM551 vs 500), p05 (RM551 vs 400).
   - Fix: label "over your budget by RMx", or show the closest under-budget build first.
5. **Follow-up routing.** 13.5% correct; 57.7% fall to `vague_question`.
   - "Cheaper / why so expensive" gets the canned "every part is compatible" reply (p01, p05).
   - Measure the existing LLM router behind `KEYBOT_LLM_CLASSIFY` first.
6. **Chat loses the builds on screen.** p02 turn 3, p05 turn 2: "I don't see specifics"; "build 1 vs 3" isn't resolved.
7. **Chat claims builds or actions that never appear.** p04, p07, p14: "here's a build with X", but the cards don't change.
   - Fix: Meg returns a structured action (re-search with constraints), and the UI applies it with WS4's refine route.
8. **Wrong facts in free text.**
   - p15: screw-in stabs "fit" the GMK67 PCB (the rule engine says no); Akko Lavender/Penguin called magnetic
   - p03: hall-effect "under 800"
   - p14: "exactly the case in the photo"
   - Meg said there are no purple keycaps, but Gradient exists.
   - Fix: compatibility answers come from the rule engine. Price claims come from computed totals.
9. **Vision misreads layout.** p14 read a 65% board as 75%.
10. **Questions typed in the search box return unrelated builds** (p15). Detect a question and answer it instead.
11. **Slow tail.** p95 16.4 s against p50 3.5 s, which fits a 7-second timeout plus a retry.

## Simulator and judge caveats

- Personas sometimes accept builds that don't meet their goal (5 of 9 acceptances), and they sometimes drift (p01).
- Rubric-v2 fixes this by grading success only from the builds on screen. Before and after must use the same rubric.
