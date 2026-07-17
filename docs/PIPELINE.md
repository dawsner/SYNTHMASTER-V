# Pipeline architecture

One command a day produces a review-ready Short + Long. Publishing is a
separate, human-gated step (approval-first).

```
                  config/sources.yaml
                          │
   ┌──────────┐    ┌──────▼──────┐    ┌───────────────┐
   │  Scout   │───▶│   Writer    │───▶│  EpisodeBrief │  (the contract)
   │  (RSS)   │    │ (LLM/draft) │    │  brief.json   │
   └──────────┘    └─────────────┘    └───────┬───────┘
                                              │
                 ┌────────────────────────────┼───────────────────────────┐
                 ▼                             ▼                           ▼
          ┌─────────────┐             ┌───────────────┐          ┌────────────────┐
          │    Demo     │             │    SeaArt     │          │   (brief has   │
          │ Playwright  │             │ avatar+voice  │          │  all metadata) │
          │ screen rec  │             │ (VIP Master)  │          └────────────────┘
          └──────┬──────┘             └───────┬───────┘
                 │  demo.webm                 │ avatar.mp4 + voiceover.mp3
                 └──────────────┬─────────────┘
                                ▼
                        ┌───────────────┐
                        │   Assembler   │   ffmpeg: concat + voice + captions
                        │ short / long  │
                        └───────┬───────┘
                                ▼
                     episodes/<day>/render/*.mp4
                                │
                        ── human approval ──
                                │
                        ┌───────▼───────┐
                        │   Publisher   │   YouTube / Instagram / TikTok
                        └───────────────┘
```

## Stage contracts

| Stage | Input | Output | Keys |
|-------|-------|--------|------|
| Scout | RSS feeds | ranked `Topic[]` | none |
| Writer | `Topic` | `EpisodeBrief` (`brief.json`) | none (draft) / `ANTHROPIC_API_KEY` (LLM) |
| Demo | `EpisodeBrief` | `demo.webm` | none |
| SeaArt | `EpisodeBrief` | avatar clips + `voiceover.mp3` | `SEAART_API_KEY` |
| Assembler | above media | `short.mp4`, `long.mp4` | none (ffmpeg) |
| Publisher | renders + brief | live posts | per-platform tokens |

## Design principles

- **One contract, many stages.** Everything flows through `EpisodeBrief`
  (`models.py`), so stages are swappable and testable in isolation.
- **Degrade gracefully.** `produce` runs every stage best-effort; a missing key
  or a failing stage is logged and the run still yields a review package with
  whatever it could build.
- **Approval-first by construction.** `produce` cannot publish. Only the
  explicit `publish <day> --yes` command touches a platform.
- **Config over code.** Feeds, keywords, model ids, and secrets live in
  config/env, not in logic — so tuning the channel never means editing stages.
```
