# Setup

The pipeline runs in layers. The **free, key-less core (Scout + Writer draft
mode) works immediately**. Each further stage needs one credential, added when
you're ready for it. Nothing blocks earlier stages.

## 0. Install

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e .            # core
pip install -r requirements.txt   # + demo/llm/publish extras
python -m playwright install chromium   # only if not pre-provisioned
```

## 1. Try the core right now (no keys)

```bash
python -m ityca scout                 # rank today's AI tools from RSS
python -m ityca brief                 # write a draft episode brief -> episodes/<day>/brief.json
```

## 2. Secrets (environment variables)

Put these in a local `.env` (git-ignored) or your shell. Add only what you need.

| Variable | Stage | What it's for |
|----------|-------|---------------|
| `ANTHROPIC_API_KEY` | Writer (LLM mode) | Brand-accurate scripts instead of draft templates |
| `SEAART_API_KEY` | SeaArt | Avatar clips + cloned-voice TTS (VIP Master account) |
| `YOUTUBE_CLIENT_SECRET_FILE` | Publisher | Path to OAuth client secret JSON |
| `INSTAGRAM_ACCESS_TOKEN` | Publisher | Long-lived Graph API token (Business/Creator acct) |
| `TIKTOK_ACCESS_TOKEN` | Publisher | Content Posting API token |

## 3. One-time account setup (manual — required by platform ToS)

Automated account **creation** violates each platform's ToS and gets you
banned. Open the three accounts by hand once (~10 min each), then connect their
official APIs. After that, publishing is automated.

- **SeaArt**: you already have VIP Master. Open the API/developer console,
  generate an API key, and copy the avatar-video model id, the TTS model id,
  and your cloned-voice id into `src/ityca/seaart.py` `CONFIG`.
- **YouTube**: Google Cloud project → enable *YouTube Data API v3* → OAuth
  client (Desktop) → download the client secret JSON → point
  `YOUTUBE_CLIENT_SECRET_FILE` at it.
- **Instagram**: convert to a Business/Creator account, link a Facebook Page,
  create a Meta app, get a long-lived *Instagram Graph API* token.
- **TikTok**: apply for the *Content Posting API*, complete app review, get an
  access token.

## 4. Daily run (approval-first)

```bash
python -m ityca produce               # scout -> brief -> demo -> seaart -> render
# review episodes/<day>/render/short.mp4 and long.mp4
python -m ityca publish <day> --yes   # only after you approve
```

## 5. Automate the daily trigger

Once you trust the output, schedule `python -m ityca produce` every morning
(cron / Task Scheduler / a Routine) so the review package is waiting for you.
`publish` stays manual (approval-first) until you decide otherwise.
