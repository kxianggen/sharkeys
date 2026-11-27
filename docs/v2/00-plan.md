# Sharkeys v2 — HQ plan

Owner: Jayson (orchestrator and approver) · HQ: the Sharkeys v2 chat in the AI Engineer project · Started 27 Nov 2026 · Time box: 2 weeks at most

## Goal

Make Sharkeys noticeably better for users, prove it with before/after numbers, and get hands-on exposure to AI evaluation, automation and fine-tuning along the way. It stays the FYP, presented as a post-submission "v2".

## Roles

| Who | Does | Does not |
|---|---|---|
| Jayson | Approves each session's plan, reads reports, merges, decides anything that costs money or touches the live site | Read every line of code |
| HQ chat (Claude) | Owns this plan and the briefs, reviews each workstream's report, gives the verdict, updates the status board | Write feature code |
| Workstream sessions (Claude Code, one per workstream) | Plan, build, test, measure, report, explain | Merge to master, or change another workstream's area |

## One-time setup (about 20 minutes, before WS0)

1. Work from the GitHub repo's master branch (the October wrap-up version, 84a29a8 or later). The copy in OneDrive/Sunway/FYP is the August submission copy. Do not build on it.
2. Create a branch `v2` from master. Each workstream branches from `v2` (`v2/ws0-foundation`, `v2/ws1-chatbot`, ...). Approved work merges into `v2`; `v2` merges into master only at the end.
3. Copy this folder of briefs into the repo at `docs/v2/`, so every Claude Code session can read them.
4. Check the OpenAI project "sharkeys" has a spending cap. Suggested: USD 10 for the whole of v2. Sessions must ask before going over it.
5. To run sessions in parallel, give each one its own git worktree (a separate checkout of the same repo), so two sessions never edit the same files at once.

## How to start a workstream

Open a new Claude Code session at the repo root and paste the "Paste this to start" block from that workstream's brief. The session plans first and waits for your OK before building.

## Workstreams

| WS | What | Brief | Depends on | Size |
|---|---|---|---|---|
| WS0 | Foundation: test personas, messy test set, simulated users, AI judge, analytics, automatic checks | WS0-foundation.md | Setup | 1 day |
| WS1 | Chatbot understands normal phrasing, plus faster replies | WS1-chatbot.md | WS0 | 1–2 days |
| WS2 | Catalogue importer plus weekly price automation | WS2-catalogue.md | WS0 | 2 days |
| WS3 | Hear it before you buy (sound previews) | WS3-sound.md | WS4 step 1 | 1 day |
| WS4 | Build UX: split the big file, refine chips, compare, share, clone | WS4-build-ux.md | WS0 | 2 days |
| WS5 | LoRA fine-tuning experiment (Colab, side track) | WS5-lora.md | WS0 test set | 1–2 days |

Features 1–7 from the 27 Nov chat map to these as: 1 → WS1, 2 → WS2, 3 → WS3, 4 and 5 → WS4, 6 → WS2, 7 → WS1.

## Schedule

- Day 1: setup, then WS0.
- Days 2–5: WS1, WS2 and WS4 in parallel (three sessions). WS5 runs in Colab whenever you have downtime.
- Days 6–7: WS3, then re-run the WS0 measurement on `v2`.
- Week 2: fixes from reviews, an optional 3-person real-user check, the README "v2 results" section, resume lines.

Area ownership, to avoid clashes between parallel sessions:
- WS1 owns `src/lib/keybot/`, `src/lib/agent/`, `src/lib/ai/`.
- WS2 owns `src/data/`, `src/lib/components/`, `scripts/catalog/`, and the price workflow in `.github/workflows/`.
- WS4 owns `src/components/` and `src/app/configurator/`.
- WS3 starts after WS4 has split the big file, and coordinates through HQ.
- If a session needs a change outside its area, it writes the change as a request in its report and does not make it.

## Status board (HQ keeps this current)

| WS | Status | Branch | Verdict | Headline number |
|---|---|---|---|---|
| WS0 | Not started | — | — | — |
| WS1 | Not started | — | — | — |
| WS2 | Not started | — | — | — |
| WS3 | Not started | — | — | — |
| WS4 | Not started | — | — | — |
| WS5 | Not started | — | — | — |

## Scorecard

The targets are proposals; WS0 may revise them once the baseline exists.

| Metric | How it's measured | Baseline (WS0) | Target | v2 result |
|---|---|---|---|---|
| Simulated task success | 15 personas × 3 runs, AI-judged | | +20 points | |
| Turns to a build the persona accepts | Same runs | | −30% | |
| Routing accuracy | Messy test set, labelled | | ≥90% | |
| Falls back to "vague question" | Messy test set | | <5% | |
| Intent extraction field accuracy | Messy test set | | baseline +10 points | |
| Invented parts | All runs, checked by code | 0 | 0 (must hold) | |
| Catalogue size | Database count | 60 | 250+ | |
| Importer field accuracy | 30 hand-checked parts | — | ≥90% | |
| Review time per new part | Timed | Time one manual entry in WS2 | <2 min | |
| Prices checked in the last 7 days | Database | 0% | 100% | |
| Switches with a sound clip | Database | 0% | 100% | |
| Reply time p50 / p95 | Benchmark script | ~2.4 s / ? | p50 <1.5 s | |
| Shares and clones | PostHog | not tracked | tracked | |

## Review protocol

1. When a workstream finishes, its session fills in the "Report back" section of its brief.
2. You paste the report and the PR link into HQ.
3. HQ checks that the numbers come from a re-run (not just stated), that tests and evals pass, that the session stayed in scope, and that the explanation is clear.
4. HQ gives one of three verdicts: **APPROVED**; **CHANGES NEEDED** (with a list); or **BLOCKED** (needs your decision).
5. You merge only on APPROVED. HQ then updates the board and the scorecard.

## Sessions must stop and ask you before

- **Spending:** raising the OpenAI cap, any paid tool, Colab Pro.
- **Live site:** deploys, Vercel environment variables, or schema changes on the live Supabase project (do them locally or on a Supabase branch first).
- **Data:** deleting or overwriting catalogue rows, or adding a new vendor to the importer.
- **Merges** into `v2` or master.
- **Anything public**, such as the README or gallery posts.

## Simulated users: what they can and can't prove

**They can:** generate 100+ realistic, messy requests quickly; drive the whole app end to end, again and again; and give consistent before/after comparisons on understanding, success rate, turns, speed and invented parts.

**They can't:** tell you whether real people want the product, trust it, or feel confident buying. AI personas are more articulate and more patient than real people, and they share the model's blind spots.

**So:** call it a "simulated-user evaluation (15 AI personas grounded in my 150+ customer builds)", never a "user study". For an optional realism check, have 3 real people spend 15 minutes each in week 2, and compare their messages with the personas'.

## Automation: what it means in v2

Automation is code that does a chore without you pressing run. A clock triggers it (every Monday at 9am) or an event does (a pull request is opened). v2 has three:

1. **Weekly price check (WS2):** fetch each part's vendor page, compare the price, and propose changes for you to approve.
2. **Daily keep-alive (WS0):** a tiny ping so the free Supabase project stops pausing itself (the open issue from the October wrap-up).
3. **Checks on every PR (WS0):** GitHub runs typecheck, tests and the offline eval, and posts the result on the PR.

All three run on GitHub Actions. It's free for public repos; private repos get a monthly free allowance.

## Wrap-up (end of week 2)

1. Re-run the WS0 measurement on `v2` and fill in the scorecard.
2. Add a "v2" section to the README: what changed, the before/after table, how it was measured, limitations.
3. Write one resume bullet, with real numbers only.
4. Interview prep: go through each brief's Learn card in a single 30-minute run-through in HQ.
