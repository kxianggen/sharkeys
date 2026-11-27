# WS3 — Hear it before you buy

## Paste this to start (Claude Code, repo root, branch `v2/ws3-sound`, after WS4 step 1 is merged)

> You're working on Sharkeys v2, workstream WS3. Read `docs/v2/00-plan.md` and `docs/v2/WS3-sound.md`. Start in plan mode and wait for my approval. When you finish, fill in "Report back", then walk me through the Learn card in plain words.

## Why

Your own competitive audit scored sound testing NOT DELIVERED. It's the barrier you argued no competitor addresses. The database is already set up for it: a `soundUrl` field and a `component_sound_samples` table both exist, unused.

## Targets

| Metric | Target |
|---|---|
| Switches and kits with at least one sound clip | 100% |
| Clip plays per build viewed (PostHog) | Tracked |
| "How confident would you feel buying?" (1–5, with vs. without clips) | Optional: from the 3-person real check, since simulation can't measure confidence |

## Requirements

**Must:**
- **Embed, don't download.** Use YouTube's embed player, starting at the timestamp where the typing begins, and credit the channel.
- One clip per switch and per kit.
- A short explainer of what "creamy", "thocky" and "clacky" mean, with one reference clip each.
- An honest label: sound depends on the whole board, so each clip states which board it was recorded on.

**Should:** play two switches side by side; sound tags described in plain words.

**Optional stretch:** record your own clips on boards you've built. You'd own the audio, which makes for a stronger story.

## Subtasks

1. **Curate the clips.** Claude prepares a sheet listing each switch with suggested search queries. Jayson picks the video and the start time. Store each one in `component_sound_samples`: video ID, start second, channel, and the board used in the video.
2. **UI.** Add a play button on part cards, on build results and in the configurator. Load YouTube's player only when someone clicks play, so pages stay fast.
3. **Sound glossary.** 5–6 sound words, each with a plain description and a clip. Link to it whenever KeyBot uses a sound word.
4. **KeyBot.** When someone asks "what does it sound like?", answer and attach the clip. This touches WS1's area, so request it through HQ if WS1 is still running.
5. **Analytics:** add the `sound_played` event.

## Learn card

**Flow:** sound data stored per part → play button loads the player only on click → the glossary links sound words to clips.

- **Embedding vs. hosting:** with an embed, the video stays on YouTube, which avoids copyright problems and storage costs.
- **Lazy loading:** load something heavy only when it's needed.
- **Reusing the data model:** the table was already designed for this.
- **Proxy metric:** confidence is hard to measure, so you measure plays and coverage instead, and say so.

**Interview questions to practise:**
- "Why embed instead of hosting the audio?"
- "How do you know it helped?"

## Report back (session fills this in)

- What changed, in plain words, with the files
- Coverage %, and the number of clips
- Effect on page speed
- Open questions for HQ
