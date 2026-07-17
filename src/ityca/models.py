"""Data contracts shared between pipeline stages.

Everything a day produces flows through these dataclasses, so each stage has a
stable, typed input/output and stages can be developed and tested in isolation.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict
from datetime import date
from typing import Optional


@dataclass
class Topic:
    """A candidate AI tool/news item the Scout surfaced."""

    tool_name: str
    headline: str
    url: str
    source: str
    summary: str = ""
    published: str = ""          # ISO date string, best-effort
    score: float = 0.0           # relevance score assigned by the Scout

    def as_dict(self) -> dict:
        return asdict(self)


@dataclass
class DemoStep:
    """One ordered action the Demo stage performs and narrates."""

    action: str                  # human-readable step, e.g. "Open the app and paste the email"
    narration: str = ""          # what the host says over this step
    url: Optional[str] = None     # page to be on for this step, if relevant


@dataclass
class PlatformMeta:
    """Per-platform publishing metadata."""

    title: str = ""
    description: str = ""
    hashtags: list[str] = field(default_factory=list)


@dataclass
class EpisodeBrief:
    """The full contract for one day's episode — the Writer's output.

    Every downstream stage (demo, seaart, assembler, publisher) reads from here.
    """

    day: str                     # ISO date, e.g. "2026-07-17"
    topic: Topic

    # Narrative slots (see docs/EPISODE_FORMAT.md)
    pain: str = ""               # the business problem, one sentence
    pain_hook: str = ""          # the spoken cold-open line
    before: str = ""             # e.g. "6 hours a week"
    after: str = ""              # e.g. "4 minutes"

    demo_steps: list[DemoStep] = field(default_factory=list)
    seaart_prompts: list[str] = field(default_factory=list)
    voiceover_script: str = ""   # full English narration for TTS
    captions: str = ""           # burned-in caption text

    # Per-platform metadata
    youtube: PlatformMeta = field(default_factory=PlatformMeta)
    instagram: PlatformMeta = field(default_factory=PlatformMeta)
    tiktok: PlatformMeta = field(default_factory=PlatformMeta)

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(_deep_asdict(self), ensure_ascii=False, indent=indent)

    @staticmethod
    def load(path: str) -> "EpisodeBrief":
        with open(path, "r", encoding="utf-8") as fh:
            raw = json.load(fh)
        return _brief_from_dict(raw)


def _deep_asdict(obj) -> dict:
    return asdict(obj)


def _brief_from_dict(raw: dict) -> EpisodeBrief:
    topic = Topic(**raw["topic"])
    steps = [DemoStep(**s) for s in raw.get("demo_steps", [])]
    meta = {k: PlatformMeta(**raw[k]) for k in ("youtube", "instagram", "tiktok") if raw.get(k)}
    known = {"topic", "demo_steps", "youtube", "instagram", "tiktok"}
    rest = {k: v for k, v in raw.items() if k not in known}
    return EpisodeBrief(topic=topic, demo_steps=steps, **meta, **rest)


def today_iso() -> str:
    return date.today().isoformat()
