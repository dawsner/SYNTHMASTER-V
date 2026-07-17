"""SeaArt — generate the talking-head avatar clips and the voiceover.

Uses the user's SeaArt account (VIP Master tier: all models unlocked, large
daily stamina). Two things are produced from the EpisodeBrief:
  * avatar clips  — the cold-open and payoff talking-head shots of the host
  * voiceover     — English TTS of the narration, in the host's cloned voice

SeaArt's HTTP API is only available on paid tiers and requires an API key from
the account. Set SEAART_API_KEY. The exact endpoints/model IDs are read from
config at call time so they can be updated without touching this file.

STATUS: interface + request scaffold. The submit/poll flow is implemented
against SeaArt's documented async job pattern (submit -> job id -> poll ->
download); confirm the current endpoint paths and model IDs against your
account's API docs and fill CONFIG below. Until then, running this raises a
clear, actionable error rather than guessing endpoints.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .config import Secrets, episode_dir
from .models import EpisodeBrief

API_BASE = "https://www.seaart.ai/api/v1"  # confirm against your account's API docs

# Fill these from your SeaArt VIP Master API console. Kept here (not hard-coded
# in functions) so updating a model or path is a one-line change.
CONFIG = {
    "avatar_model": "",     # e.g. a talking-avatar / image-to-video model id
    "voice_model": "",      # e.g. the TTS model id
    "voice_id": "",         # your cloned-voice id
    "submit_path": "/generation/submit",
    "status_path": "/generation/status",
}


@dataclass
class SeaArtAssets:
    """Paths to what SeaArt produced for one episode."""

    avatar_clips: list[Path]
    voiceover: Path


def generate_assets(brief: EpisodeBrief, secrets: Secrets | None = None) -> SeaArtAssets:
    """Generate avatar clips + voiceover for the brief and return local paths."""
    secrets = secrets or Secrets.from_env()
    api_key = secrets.require("seaart_api_key", stage="seaart")
    _require_config()

    out = episode_dir(brief.day) / "seaart"
    out.mkdir(parents=True, exist_ok=True)

    client = _Client(API_BASE, api_key)

    # 1) Voiceover from the full narration script.
    voice_path = client.tts(
        text=brief.voiceover_script,
        voice_id=CONFIG["voice_id"],
        model=CONFIG["voice_model"],
        dest=out / "voiceover.mp3",
    )

    # 2) Avatar talking-head clips from each SeaArt prompt (cold open, payoff).
    clips: list[Path] = []
    for i, prompt in enumerate(brief.seaart_prompts):
        clip = client.avatar_video(
            prompt=prompt,
            model=CONFIG["avatar_model"],
            dest=out / f"avatar_{i:02d}.mp4",
        )
        clips.append(clip)

    return SeaArtAssets(avatar_clips=clips, voiceover=voice_path)


def _require_config() -> None:
    missing = [k for k in ("avatar_model", "voice_model", "voice_id") if not CONFIG.get(k)]
    if missing:
        raise RuntimeError(
            "[seaart] CONFIG is incomplete: "
            + ", ".join(missing)
            + ". Fill model/voice ids from your SeaArt VIP Master API console in "
            "src/ityca/seaart.py CONFIG. See docs/SETUP.md."
        )


class _Client:
    """Thin wrapper over SeaArt's async submit/poll job API."""

    def __init__(self, base: str, api_key: str):
        import requests

        self._requests = requests
        self.base = base.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"Authorization": f"Bearer {api_key}"})

    def tts(self, text: str, voice_id: str, model: str, dest: Path) -> Path:
        job = self._submit({"type": "tts", "model": model, "voice_id": voice_id, "text": text})
        return self._await_and_download(job, dest)

    def avatar_video(self, prompt: str, model: str, dest: Path) -> Path:
        job = self._submit({"type": "video", "model": model, "prompt": prompt, "aspect_ratio": "9:16"})
        return self._await_and_download(job, dest)

    def _submit(self, payload: dict) -> str:
        resp = self.session.post(self.base + CONFIG["submit_path"], json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        job_id = data.get("id") or data.get("job_id") or (data.get("data") or {}).get("id")
        if not job_id:
            raise RuntimeError(f"[seaart] unexpected submit response: {data}")
        return job_id

    def _await_and_download(self, job_id: str, dest: Path, timeout_s: int = 600) -> Path:
        import time

        deadline = time.time() + timeout_s
        url = None
        while time.time() < deadline:
            resp = self.session.get(
                self.base + CONFIG["status_path"], params={"id": job_id}, timeout=30
            )
            resp.raise_for_status()
            data = resp.json()
            status = (data.get("status") or (data.get("data") or {}).get("status") or "").lower()
            if status in ("succeeded", "success", "done", "completed"):
                url = data.get("url") or (data.get("data") or {}).get("url")
                break
            if status in ("failed", "error"):
                raise RuntimeError(f"[seaart] job {job_id} failed: {data}")
            time.sleep(5)
        if not url:
            raise RuntimeError(f"[seaart] job {job_id} did not finish in {timeout_s}s")

        blob = self._requests.get(url, timeout=120)
        blob.raise_for_status()
        dest.write_bytes(blob.content)
        return dest
