# I think you can AI it

A daily AI-explainer video engine. Every day it picks one new AI tool, frames
it around a **real, painful business problem**, records the tool solving that
problem on screen, wraps it with a talking-head host (generated on SeaArt), and
produces a **Short** (60–90s vertical for YouTube Shorts / Reels / TikTok) and
a **Long** (3–6 min for YouTube) — then stops and waits for you to approve
before anything goes live.

Positioning: not a tech-review channel — an *implementer's* channel. One real
problem, one AI, the solution in front of your eyes. Sign-off every episode:
**"I think you can AI it."**

## Quick start (no API keys)

```bash
pip install -e .
python -m ityca scout      # rank today's AI tools from public RSS
python -m ityca brief      # draft episode brief -> episodes/<day>/brief.json
```

## Full daily run (approval-first)

```bash
python -m ityca produce             # scout → brief → screen demo → avatar+voice → render
# review episodes/<day>/render/short.mp4 and long.mp4
python -m ityca publish <day> --yes # only after you approve
```

## How it fits together

| Stage | Does | Needs |
|-------|------|-------|
| **Scout** | picks today's tool + the business pain it solves | — |
| **Writer** | fills the episode template → script + prompts | optional `ANTHROPIC_API_KEY` |
| **Demo** | records the tool solving the problem (Playwright) | — |
| **SeaArt** | host avatar clips + cloned-voice narration | `SEAART_API_KEY` (VIP Master) |
| **Assembler** | stitches Short + Long with captions (ffmpeg) | — |
| **Publisher** | uploads to YouTube / Instagram / TikTok | per-platform tokens |

## Docs

- [`docs/BRAND.md`](docs/BRAND.md) — host character sheet, voice, positioning
- [`docs/EPISODE_FORMAT.md`](docs/EPISODE_FORMAT.md) — the daily template (Short + Long)
- [`docs/PIPELINE.md`](docs/PIPELINE.md) — architecture and stage contracts
- [`docs/SETUP.md`](docs/SETUP.md) — install, accounts, API keys, automation

## Status

Scaffold with the free core (**Scout + Writer**) runnable today. `Demo`,
`SeaArt`, `Assembler`, and `Publisher` have full interfaces and are wired into
the orchestrator; each is completed by adding its one credential/endpoint (see
`docs/SETUP.md`). The daily run degrades gracefully — it always produces a
review package with whatever it could build.
