"""Publisher — upload the finished videos to YouTube, Instagram, TikTok.

Approval-first: the orchestrator NEVER calls this automatically. It runs only
after a human approves the day's review package (see orchestrator.py and
`ityca publish <day>`), and only for the platforms whose credentials are set.

Each platform uses its official API — the one-time account + credential setup
is documented in docs/SETUP.md:
  * YouTube   — YouTube Data API v3 (OAuth client secret file)
  * Instagram — Instagram Graph API (long-lived access token, Business/Creator)
  * TikTok    — TikTok Content Posting API (access token)

STATUS: interface + guards. Each uploader validates inputs and credentials and
raises a clear error until wired to the platform SDK/HTTP call. This keeps the
publish surface explicit and prevents accidental posting during bring-up.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .config import Secrets
from .models import EpisodeBrief, PlatformMeta


@dataclass
class PublishResult:
    platform: str
    ok: bool
    detail: str


def publish_all(
    brief: EpisodeBrief,
    short: Path,
    long: Path,
    secrets: Secrets | None = None,
    platforms: tuple[str, ...] = ("youtube", "instagram", "tiktok"),
) -> list[PublishResult]:
    """Publish to each requested platform for which credentials exist."""
    secrets = secrets or Secrets.from_env()
    results: list[PublishResult] = []

    if "youtube" in platforms:
        results.append(_publish_youtube(brief, long, brief.youtube, secrets))
    if "instagram" in platforms:
        results.append(_publish_instagram(brief, short, brief.instagram, secrets))
    if "tiktok" in platforms:
        results.append(_publish_tiktok(brief, short, brief.tiktok, secrets))
    return results


def _publish_youtube(brief: EpisodeBrief, video: Path, meta: PlatformMeta, secrets: Secrets) -> PublishResult:
    if not secrets.youtube_client_secret_file:
        return PublishResult("youtube", False, "skipped: YOUTUBE_CLIENT_SECRET_FILE not set")
    _check_file(video)
    # TODO: googleapiclient videos.insert (snippet+status), resumable upload.
    raise NotImplementedError(
        "[youtube] wire YouTube Data API v3 videos.insert here (see docs/SETUP.md)"
    )


def _publish_instagram(brief: EpisodeBrief, video: Path, meta: PlatformMeta, secrets: Secrets) -> PublishResult:
    if not secrets.instagram_access_token:
        return PublishResult("instagram", False, "skipped: INSTAGRAM_ACCESS_TOKEN not set")
    _check_file(video)
    # TODO: Graph API /media (media_type=REELS, video_url) -> /media_publish.
    raise NotImplementedError(
        "[instagram] wire Instagram Graph API Reels publish here (see docs/SETUP.md)"
    )


def _publish_tiktok(brief: EpisodeBrief, video: Path, meta: PlatformMeta, secrets: Secrets) -> PublishResult:
    if not secrets.tiktok_access_token:
        return PublishResult("tiktok", False, "skipped: TIKTOK_ACCESS_TOKEN not set")
    _check_file(video)
    # TODO: TikTok Content Posting API /post/publish/video/init/ + upload.
    raise NotImplementedError(
        "[tiktok] wire TikTok Content Posting API here (see docs/SETUP.md)"
    )


def _check_file(path: Path) -> None:
    if not path or not Path(path).exists():
        raise FileNotFoundError(f"video to publish not found: {path}")
