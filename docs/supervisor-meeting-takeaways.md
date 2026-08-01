# Supervisor Meeting — Takeaways for Report Writing

Handoff notes for the report-writing chat. Compiled from a partial meeting
transcript, so items are marked **[said]** (clearly stated by the supervisor) or
**[unclear]** (asked, but the answer wasn't captured).

---

## Project context (for a fresh chat)

**sharkeys** — an AI-assisted mechanical keyboard configurator for the Malaysian
market (RM pricing, ~42-part seed catalog). Next.js + Supabase + OpenAI.

Core architecture claim: *AI extracts intent and phrases explanations, but a
deterministic rule engine is the sole authority on build compatibility and is
never bypassed.*

Stated theoretical framing: **choice overload** — the app exists to reduce the
burden of choosing compatible parts from an overwhelming option space.

---

## 1. Triangulate: user data + claims + literature  **[said]**

> "See if any of your users or your test data can support your claim, and also
> align that with any literature references."

**What this means for the report:** every claim in Results/Discussion should be
supported from more than one direction:

- **User testing data** — what testers actually said or did
- **System/test data** — eval results, validation counts, measured behaviour
- **Literature** — published work that predicts or explains the result

**Worked example (the supervisor's own framing):** the project addresses choice
overload → testers report the app is easy to use and didn't feel overwhelmed →
choice-overload literature predicts exactly that outcome when the option space is
constrained. All three lines converge on one claim.

**Action:** build a claim → evidence → literature mapping table before writing
Chapter 4/5. Any claim with only one leg is weak.

---

## 2. Implement user-testing fixes in the code, not just the report  **[said]**

> "It's time to implement that in your code… You acknowledge the gap that you
> have in your system based on your user feedback. If you can implement it, if
> it's that small — small things, visual things like that — I would suggest you
> implement it."

**Key point:** small/visual issues surfaced by testers should be **fixed in the
actual system**, then documented as a before/after.

**Framing the supervisor suggested:**

> "Based on your user feedback, these were the changes that were done to the
> system after conducting user testing."

**Action:**

- Triage tester feedback into *implement now* (small, visual, low-risk) vs.
  *acknowledge as future work* (structural, out of scope)
- Fix the first group in code
- Add a report subsection: issue found → change made → rationale
- This demonstrates a genuine iterative design cycle, which is worth marks in
  its own right

---

## 3. No page-count requirement  **[said]**

> Q: "Do you have any numbers in mind regarding how long the report should be?
> Two pages for Chapters 4 and 5?"
> A: **"No, there is no page estimation."**

**What this means:** length is not a target. Write to sufficiency, not to a page
count. Chapters 4 and 5 should be as long as the evidence requires — no padding,
no artificial trimming.

---

## 4. Open question — answer not captured  **[unclear]**

Asked but not clearly answered in the transcript:

> "Am I supposed to stack all these claims together in the Results and
> Discussion?"

i.e. should user affirmations, system data, and literature all be combined in
Results/Discussion, or split (Results = findings only, Discussion =
interpretation + literature)?

**Note:** the conventional split is Results = what was found, Discussion = what
it means + how it relates to literature. But institutional templates vary —
**confirm with the supervisor or check the FYP template before drafting.**

---

## Evidence assets already available

Things that exist and can be cited as data in the report:

| Asset | Location | Use in report |
|---|---|---|
| Eval suite (3 suites) | `src/lib/eval/` — intent extraction, RAG retrieval, Meg grounding | Evidence the AI performs; ground truth is owner's domain expertise (150+ sales) |
| Test suite | `tests/` — 34 files, ~215 tests | Evidence of correctness/regression safety |
| Rule engine tests | `tests/rules/compatibility.test.ts` | Evidence the compatibility authority is verified |
| Deterministic fallbacks | keyword intent extraction, template explanations | Evidence of resilience without AI |
| Similarity threshold (0.36) | `src/lib/ai/intent-preparation.ts` | Empirically tuned — describe tuning method, not a formula |
| Domain-weighted scoring | `scoreRecommendation` (switch sound 28 vs case 4) | Evidence expertise is encoded, not arbitrary |

---

## Still-outstanding deliverables (from earlier supervisor guidance)

- **CP2: AI collaboration declaration** — explicit statement of how Claude /
  Claude Code / OpenAI were used. Academic honesty requirement. Include what was
  personally directed and decided, not just what AI produced.
- **User testing** — ~5–8 defined test cases with real testers, results recorded.
  Feeds directly into items 1 and 2 above.

---

## Suggested next steps for the report chat

1. Confirm the Results vs. Discussion structure against the FYP template (item 4)
2. Draft the claim → evidence → literature mapping table (item 1)
3. Run user testing; triage feedback into implement-now vs. future-work (item 2)
4. Implement the small fixes, then write the before/after subsection
5. Write the CP2 AI declaration
