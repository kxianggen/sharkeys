# Simulated-user runs (WS0)

Run names are run-1/2/3 so they never clash with the project's "v2". Each run folder holds `sessions.jsonl`, readable `transcripts/` and `run.json`. Don't edit run output; re-run instead.

| run | folder | personas × runs | simulator | rubric | status |
|---|---|---|---|---|---|
| smoke | `2026-11-27-smoke` | 1 × 1 (3 turns) | simulator-1 | rubric-v1 | pipeline check only |
| run-1 | `2026-11-27-pilot` | 5 × 1 | simulator-1 | rubric-v1 | pilot, used to measure cost |
| run-2 | `2026-11-27-baseline-simv2` | 15 × 1 | simulator-2 (recorded as `sim-v2`) | rubric-v1 | superseded, kept for the record |
| **run-3** | `2026-11-27-baseline` | 15 × 1 | simulator-3 (recorded as `sim-v3`) | rubric-v1 | **committed baseline** → `eval/v2/results/2026-11-27-v2-ws0-foundation.md` |

The `run.json` files of run-2 and run-3 say `sim-v2` / `sim-v3`: they were written before the labels were renamed to simulator-2 / simulator-3. Their `gitSha` (4a9146a) is the last commit at run time; the simulator-2/3 changes were still uncommitted then and were committed right after.

## What changed between simulators, and why

- **simulator-1 → simulator-2** (after the pilot), so the persona sees what a real user sees:
  - After a search that finds builds, the reply is just the build cards, each with its first explanation line. Before, the persona was shown result-level text (e.g. "38400 candidate builds were filtered out") that the UI only displays when no build is found.
  - Meg's related parts are shown as the up-to-4 name chips the UI renders under her reply.
  - A persona can only accept a build that is on screen. In run-1, one persona "accepted" with nothing on screen.
  - Invented-part flags: dropped the generic word "mode" from the brand list; one flag per term per session.
  - Not changed, on purpose: the persona is not told that Meg's chat can't change the builds panel, because a real user isn't told either.
- **simulator-2 → simulator-3** (after reading run-2's transcripts): the screen summary lists all six parts of each build (case, PCB, plate, switches, keycaps, stabilizers), as the build card does. Run-2 showed only case, switches and keycaps, which misled at least one persona (p02 couldn't see the plate).
