"""Writer — turn a Topic into a full EpisodeBrief.

Two modes:
  * LLM mode (ANTHROPIC_API_KEY set): Claude writes the brief in the host's
    voice from docs/BRAND.md + docs/EPISODE_FORMAT.md. This is the intended
    production path and gives brand-accurate scripts.
  * Draft mode (no key): fills the template deterministically so the pipeline
    is runnable end-to-end offline and the output shape can be inspected.

Either way the output is a validated EpisodeBrief (see models.py) — the same
contract every downstream stage consumes.
"""

from __future__ import annotations

import json

from .config import Secrets, REPO_ROOT
from .models import EpisodeBrief, Topic, DemoStep, PlatformMeta, today_iso

BRAND = (REPO_ROOT / "docs" / "BRAND.md")
FORMAT = (REPO_ROOT / "docs" / "EPISODE_FORMAT.md")

SIGN_OFF = "I think you can AI it."


def write_brief(topic: Topic, day: str | None = None, secrets: Secrets | None = None) -> EpisodeBrief:
    day = day or today_iso()
    secrets = secrets or Secrets.from_env()
    if secrets.anthropic_api_key:
        return _write_with_llm(topic, day, secrets)
    return _write_draft(topic, day)


# --------------------------------------------------------------------------- #
# LLM mode
# --------------------------------------------------------------------------- #

_SYSTEM = """You are the head writer for the daily channel "I think you can AI it".
Write in the host's voice. Read the brand bible and episode format carefully and
follow them exactly. Return ONLY a single JSON object, no prose, matching the
requested schema. Narration is in ENGLISH. Lead with a painful, concrete
business problem; prove the tool by solving that problem on screen; end every
script with the sign-off "I think you can AI it."."""


def _write_with_llm(topic: Topic, day: str, secrets: Secrets) -> EpisodeBrief:
    from anthropic import Anthropic  # imported lazily so no-key runs don't need it

    client = Anthropic(api_key=secrets.anthropic_api_key)
    brand = BRAND.read_text(encoding="utf-8")
    fmt = FORMAT.read_text(encoding="utf-8")

    schema_hint = json.dumps(_draft_shape(topic, day), ensure_ascii=False, indent=2)

    user = f"""BRAND BIBLE:
{brand}

EPISODE FORMAT:
{fmt}

TODAY'S TOPIC (from the Scout):
- tool: {topic.tool_name}
- headline: {topic.headline}
- source: {topic.source}
- url: {topic.url}
- summary: {topic.summary}

Produce the episode brief as JSON with exactly this shape (fill every field;
demo_steps should be 4-7 concrete on-screen actions with narration;
seaart_prompts must embed the host character block from the brand bible):
{schema_hint}"""

    msg = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=4000,
        system=_SYSTEM,
        messages=[{"role": "user", "content": user}],
    )
    text = "".join(block.text for block in msg.content if block.type == "text")
    raw = _extract_json(text)
    raw["day"] = day
    raw["topic"] = topic.as_dict()
    return _coerce_brief(raw)


# --------------------------------------------------------------------------- #
# Draft mode (offline, deterministic)
# --------------------------------------------------------------------------- #

def _write_draft(topic: Topic, day: str) -> EpisodeBrief:
    return _coerce_brief(_draft_shape(topic, day))


def _draft_shape(topic: Topic, day: str) -> dict:
    """A fully-formed placeholder brief. Also doubles as the LLM schema hint."""
    tool = topic.tool_name
    character = (
        "A man in his 50s, shaved head, short salt-and-pepper stubble beard, "
        "black Tom Ford aviator-style glasses, small hoop earrings, black t-shirt "
        "with a small red 福 stamp; retro 1970s NYC-street film look"
    )
    pain = f"the manual, time-eating task that {tool} can take off your plate"
    return {
        "day": day,
        "topic": topic.as_dict(),
        "pain": pain,
        "pain_hook": f"You're still doing {pain} by hand? Watch this.",
        "before": "hours every week",
        "after": "minutes",
        "demo_steps": [
            {"action": f"Open {tool} and show the starting problem", "narration": f"Here's the real task {tool} is going to handle."},
            {"action": f"Give {tool} the real input", "narration": "This is the exact thing your team does by hand today."},
            {"action": f"Run {tool} and watch the result", "narration": "No prompt tricks. Just the tool doing the work."},
            {"action": "Show the finished output side-by-side with the manual way", "narration": "Same result. A fraction of the time."},
        ],
        "seaart_prompts": [
            f"Cold-open talking-head, direct to camera, {character}, speaking confidently in a home studio, 9:16",
            f"Payoff talking-head, {character}, slight nod, warm lighting, 9:16",
        ],
        "voiceover_script": (
            f"You're still doing {pain} by hand? Watch this. "
            f"Today's tool: {tool}. "
            f"Here's the exact task your team wastes {{before}} on. I hand it to {tool}... and it's done. "
            f"{{before}} of manual work, down to {{after}}. "
            f"That's it. Follow — new one every day. {SIGN_OFF}"
        ),
        "captions": f"{tool}: {pain} → done in minutes.",
        "youtube": {
            "title": f"{tool} solves a real business problem in minutes | I think you can AI it",
            "description": f"Every day, one AI tool that kills a real, painful business problem.\n\nToday: {tool}.\nSource: {topic.url}\n\n{SIGN_OFF}",
            "hashtags": ["#AI", "#automation", "#smallbusiness", "#productivity", f"#{_slug(tool)}"],
        },
        "instagram": {
            "title": f"{tool} in 60 seconds",
            "description": f"One real problem. One AI. {SIGN_OFF}",
            "hashtags": ["#AItools", "#businessautomation", "#aiforbusiness"],
        },
        "tiktok": {
            "title": f"{tool} did this in minutes",
            "description": f"One real problem. One AI. {SIGN_OFF}",
            "hashtags": ["#ai", "#aitools", "#business", "#automation"],
        },
    }


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #

def _coerce_brief(raw: dict) -> EpisodeBrief:
    topic = raw["topic"] if isinstance(raw["topic"], Topic) else Topic(**raw["topic"])
    steps = [s if isinstance(s, DemoStep) else DemoStep(**s) for s in raw.get("demo_steps", [])]
    meta = {}
    for k in ("youtube", "instagram", "tiktok"):
        v = raw.get(k)
        meta[k] = v if isinstance(v, PlatformMeta) else PlatformMeta(**(v or {}))
    known = {"topic", "demo_steps", "youtube", "instagram", "tiktok"}
    rest = {k: v for k, v in raw.items() if k not in known}
    return EpisodeBrief(topic=topic, demo_steps=steps, **meta, **rest)


def _extract_json(text: str) -> dict:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"No JSON object found in model output:\n{text[:500]}")
    return json.loads(text[start : end + 1])


def _slug(text: str) -> str:
    return "".join(c for c in text if c.isalnum()) or "AI"
