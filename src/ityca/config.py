"""Configuration loading.

Two layers:
  * config/sources.yaml  — non-secret Scout tuning (feeds, keywords), committed.
  * environment / .env   — secrets (API keys, tokens), never committed.

Nothing here fails hard on a missing secret; stages that need a given secret
check for it at call time and raise a clear error. This lets the free,
key-less parts of the pipeline (Scout, Writer) run out of the box.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
CONFIG_DIR = REPO_ROOT / "config"
EPISODES_DIR = REPO_ROOT / "episodes"


@dataclass
class Secrets:
    """Secrets pulled from the environment. All optional at load time."""

    seaart_api_key: str | None = None
    anthropic_api_key: str | None = None
    youtube_client_secret_file: str | None = None
    instagram_access_token: str | None = None
    tiktok_access_token: str | None = None

    @staticmethod
    def from_env() -> "Secrets":
        return Secrets(
            seaart_api_key=os.environ.get("SEAART_API_KEY"),
            anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY"),
            youtube_client_secret_file=os.environ.get("YOUTUBE_CLIENT_SECRET_FILE"),
            instagram_access_token=os.environ.get("INSTAGRAM_ACCESS_TOKEN"),
            tiktok_access_token=os.environ.get("TIKTOK_ACCESS_TOKEN"),
        )

    def require(self, attr: str, stage: str) -> str:
        val = getattr(self, attr, None)
        if not val:
            env_name = {
                "seaart_api_key": "SEAART_API_KEY",
                "anthropic_api_key": "ANTHROPIC_API_KEY",
                "youtube_client_secret_file": "YOUTUBE_CLIENT_SECRET_FILE",
                "instagram_access_token": "INSTAGRAM_ACCESS_TOKEN",
                "tiktok_access_token": "TIKTOK_ACCESS_TOKEN",
            }.get(attr, attr.upper())
            raise RuntimeError(
                f"[{stage}] missing secret: set the {env_name} environment variable. "
                f"See docs/SETUP.md."
            )
        return val


def load_sources() -> dict:
    """Load config/sources.yaml (Scout feeds + keyword tuning)."""
    path = CONFIG_DIR / "sources.yaml"
    with open(path, "r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def episode_dir(day: str) -> Path:
    """Directory for a given day's artifacts, created on demand."""
    d = EPISODES_DIR / day
    d.mkdir(parents=True, exist_ok=True)
    return d
