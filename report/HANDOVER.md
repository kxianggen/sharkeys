# Handover brief — Sharkeys CP2 final report

Paste everything below into the first message of the new session, and connect the project folder.

---

## Context

I'm a final-year Computer Science student at Sunway University finishing **Capstone Project 2**. The project is **Sharkeys**, an AI-assisted custom mechanical keyboard configurator. CP1 was a written proposal; CP2 is implementation plus a final report.

Deliverables and weightings: **Logbook 10%, Final Report 50%, Presentation 40%** (presentation is ~3 weeks away, not urgent). The report deadline is imminent.

The code is complete and committed. The evidence gathering is complete. **Chapters 4 and 5 are written and already merged into the report document.** What remains is a short list of Word-level finishing tasks.

## Current state

**`report/CP2_Final_Report_22018733.docx`** — 82 pages. This is the live document. It contains:

- Chapters 1–3 carried over from CP1, unchanged
- **4.0 Results and Discussion** — newly written, 5,180 words, sections 4.1–4.10
- **5.0 Conclusion and Future Work** — newly written, 2,187 words, sections 5.1–5.3
- **6.0 References** — renumbered from 5.0
- CP1's old "4.0 Work Plan and Timeline" chapter was deleted entirely

Formatting throughout: Times New Roman 12pt, 1.5 line spacing (`w:line="360"`), justified body, `TableGridLight` tables at 8993 dxa. Any new content must match this.

**`report/LG2_22018733.docx`** — the logbook, 12 weekly entries, complete.

**`report/evidence/`** — the measurement evidence set:

| File | Contents |
|---|---|
| `figures-manifest.md` | **The authoritative source for every number.** ~55 figures with value, report section, generating script, catalog commit and mandatory caveat |
| `performance.md` | All seven CP1 non-functional requirements evaluated |
| `competitive-audit.md` | CP1 §2.6.2 instrument re-applied to the delivered system |
| `uat-fixes.md` | The user-testing design cycle: four findings, fixes, before/after evidence |
| `raw/` | JSON output from every benchmark, plus the batch logs |

## What still needs doing — in priority order

**1. Update the table of contents.** Click it in Word, press F9, choose "update entire table". It still lists the deleted Work Plan chapter and has stale page numbers.

**2. Replace the cover page.** It currently reads "CAPSTONE PROJECT 1 / Proposal". `report/CP2_Cover_Page.docx` is already filled in with the correct details.

**3. Rewrite the abstract** (worth 2.5 marks). The current one is in proposal tense with no results. Chapter 4 now contains the findings it should summarise. The headline results are in `figures-manifest.md` as H1–H5.

**4. Resolve the "Appendix A" reference.** Chapter 4's opening paragraph cites it for reproduction commands. Either build it from the reproduction sections in `figures-manifest.md`, or delete the half-sentence.

**5. Fix §3.3.4 in Chapter 3.** It states the Vercel AI SDK was selected and LangChain rejected. The delivered system uses LangGraph. The justification is in CP1's own comparison table, which lists "less flexible for building complex background agents" as the Vercel SDK's weakness — exactly why the agent architecture forced the change. Two or three sentences will do. An examiner reading Chapter 3 then Chapter 4 would catch this.

**Optional if time allows:** logbook weeks 13–14 (user testing and wrap-up); merging the `feat/configurator-progressive-assembly` branch into `master`.

## Rules that must be followed

**Never quote a number from a summary or from `CLAUDE.md`.** Take every figure from `figures-manifest.md` or verify it at runtime. Three wrong numbers reached an earlier draft because they were taken from stale documentation — the catalog is 60 records not 42, the eval suite has 50 base cases not 52, and the test suite has 215 passing not 182.

**Deterministic versus stochastic figures.** Combinatorial figures (585,200 / 3,250 / 99.4446%) reproduce exactly and are quoted exactly. Latency figures are stochastic, quoted to two significant figures with an observed range. No claim rests on a tail percentile — the p95 was observed to vary by 2.8× between runs of identical code.

**Evaluation results are three separate claims, never one total.** Capability (the colour cases, 0/5 → 5/5), Control A (adversarial guards, 3/3 → 3/3), Control B (the original 50 cases, unchanged). The denominator changed from 50 to 58 when eight cases were added, so raw totals are not comparable across that change.

**NEVER regenerate the whole docx from markdown.** `CP2_Chapter4.md` and `CP2_Chapter5.md` are source for Chapters 4 and 5 **ONLY**. The abstract, §3.3.4 and Appendix A exist solely in the docx and would be lost. Re-syncing Chapters 4 and 5 in place is safe; a full rebuild is not.

There is no markdown source for the abstract, for Chapters 1–3, or for Appendix A. Chapter 4's opening paragraph refers the reader to Appendix A for reproduction commands; that reference resolves in the document but **not** in the markdown alone, so `CP2_Chapter4.md` is not a standalone artefact and must not be read as one.

Before editing chapter content, change the markdown first and re-sync the docx section in place — not the other way round. The 622-line engine figure was corrected in the docx alone and the two files diverged until it was caught; that is the failure mode this rule exists to prevent.

**Don't re-derive the evidence.** Everything is measured, verified and committed. The remaining work is document editing, not analysis.

## The five headline results, for the abstract

- **H1** — the rule engine eliminates 99.4446% of the decision space (585,200 → 3,250 combinations)
- **H2** — full reduction chain 585,200 → 3,250 → 3, a 99.9995% reduction
- **H3** — validation latency median 0.0068 ms against a 200 ms requirement, ~29,000× margin
- **H4** — zero of 3,250 valid builds fall within the RM150–250 target market; the cheapest is RM281
- **H5** — the AI response requirement is the project's only failed NFR (assistant median 2,410 ms against a 2,000 ms budget)

## Files to attach in the new session

1. `report/CP2_Final_Report_22018733.docx` — the live document
2. `report/evidence/figures-manifest.md` — authoritative numbers
3. This handover file
4. Connect the project folder at `~/Documents/New project` so the agent can read the code and evidence directly

Attach `performance.md`, `competitive-audit.md` and `uat-fixes.md` only if a task actually needs them — they are long, and the manifest indexes what's in them.
