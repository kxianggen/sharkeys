# Evaluation results — final state, 3 August 2026

Covers the two changes made on 3 August: realigning the builder's value picks to
switches actually stocked in the catalog, and adding a prompt rule stopping the
assistant naming products during educational questions.

**Denominator is 58 in every figure below** (30 original intent + 8 colour + 10
grounding + 10 retrieval). There are no pending cases left.

## Headline

| Mode | Result |
|---|---|
| **Offline** (deterministic, no network) | **54 pass / 2 fail / 2 expected-fail** — reproduces exactly |
| **Semantic** (full stack, 6 runs) | **57, 58, 57, 58, 58, 58** — mean 57.67, range 57–58 |

Artefacts: `eval-offline-final.log`, `eval-semantic-final.log` (last three runs in
full). `eval-offline-postpicks.log` and `eval-semantic-postpicks.log` capture the
intermediate state after the pick realignment but before the prompt rule, and are
retained to show the effect of each change separately.

## What changed, and what each change did

| Case | Before 3 Aug | After picks realigned | After prompt rule |
|---|---|---|---|
| `kg-008` best-value switch | fail, both modes | **pass semantic**, fail offline | pass semantic, fail offline |
| `kg-010` stabiliser lube | fail offline, mostly pass semantic | **pass semantic**, fail offline | pass semantic, fail offline |
| `kg-003` thocky vs clacky | passed (guard was toothless) | **fail 3/3** — real defect exposed | **pass 6/6** — fixed |
| `rr-009`, `rr-010` | pending, IDs did not exist | **pass both modes** | pass both modes |
| `kg-001` | flips | flips | flips — failed 2 of 6 |

## The persistent offline failures

`kg-008` and `kg-010` fail offline and pass semantically. This is structural, not
a defect: `getBuilderExpertisePayload()` is attached only to the LLM prompt in
`service.ts`, so the deterministic keyword path never receives the builder's
expertise and cannot reproduce advice that depends on it.

This gives the AI layer a second, distinct contribution beyond closing the
semantic gap: it is the only path capable of delivering curated practitioner
knowledge.

## Contribution of the AI layer, current state

Offline 54 against semantic 57.67 mean.

**Gained by the AI (4 cases):**
- `rr-007`, `rr-008` — semantic-gap cases, closed by vector retrieval
- `kg-008`, `kg-010` — expert knowledge, available only via the LLM payload

**Lost by the AI (variable):**
- `kg-001` — fails in 2 of 6 runs from model non-determinism alone

Net gain is therefore **three to four cases depending on the run**, not the two
previously reported.

## Note on stability

The semantic score is now near-ceiling and varies only between 57 and 58. The
single variable case is `kg-001`, which was already documented as a flipper
before any of these changes. The earlier reported grounding swing of 7–9 across
seven runs no longer describes the current system and must not be quoted from
the superseded logs.
