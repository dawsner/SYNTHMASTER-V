# Episode Format

Two deliverables are produced every day from the **same** research + script:

1. **Short** — 60–90s vertical (9:16). Publishes to YouTube Shorts, Instagram
   Reels, TikTok. This is the daily core.
2. **Long** — 3–6 min horizontal (16:9) for YouTube. A deeper cut of the same
   topic. The Short is essentially a trailer for it.

Because both come from one topic + one screen recording, the marginal cost of
the Long is mostly editing, not new research.

## The template (fillable slots)

The whole point of a fixed template is that the agent fills the same slots
every day. Slots are written as `{{like_this}}` and populated by the Writer.

### Short (60–90s, 9:16)

| Time | Beat | Content | Source |
|------|------|---------|--------|
| 0–6s | **Cold open** | Host to camera names a specific, painful problem. *"{{pain_hook}}"* | avatar + voice |
| 6–12s | **The tool** | *"Today's tool: {{tool_name}}."* | avatar + voice |
| 12–70s | **Live demo** | Screen recording solving `{{pain}}` with `{{tool_name}}`, host voiceover | screen rec + voice |
| 70–85s | **The payoff** | Before/after with a real number. *"{{before}} → {{after}}"* | avatar + voice |
| 85–90s | **CTA** | *"Follow — new one every day. I think you can AI it."* | avatar + voice |

### Long (3–6 min, 16:9)

Same spine, expanded:

1. **Cold open** (0–15s) — the pain, plus who has it and what it costs.
2. **Tool intro** (15–45s) — what `{{tool_name}}` is, in one honest paragraph.
3. **Live walkthrough** (45s–4m) — the full screen demo, step by step, host
   narrating each decision. This is the meat.
4. **Limitations** (30s) — where it breaks / what it can't do yet. Builds trust.
5. **Payoff + who it's for** (30s) — the number, and the exact business it fits.
6. **CTA** (10s) — sign-off.

## The daily "episode brief" (Writer output)

The Writer produces one JSON object per day that fills every slot above, plus:

- `topic` — today's AI tool and why it matters now
- `pain` / `pain_hook` — the business problem it kills
- `demo_steps[]` — ordered steps the Demo stage will perform/record
- `seaart_prompts[]` — exact prompts to paste into SeaArt (avatar shots + b-roll)
- `voiceover_script` — full narration text (English) for TTS
- `captions` — burned-in caption text
- `titles` / `description` / `hashtags` — per platform

This object is the contract between stages. See `src/ityca/models.py`.

## Approval-first flow

Publishing is **approval-first** (chosen setup). The daily run stops after
producing a review package (rendered Short + Long + all metadata) and waits
for a human OK before the Publisher touches any platform. Nothing goes live
without a tap.
