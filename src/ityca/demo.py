"""Demo — record a screen demo of the tool with Playwright.

Records a video of a real browser session performing the EpisodeBrief's
demo_steps, producing the b-roll the host narrates over. Chromium is
pre-provisioned in this environment (PLAYWRIGHT_BROWSERS_PATH is set), so no
`playwright install` is needed.

This is a scaffold: the generic recorder below works today for "open a URL and
capture the page", and `record_demo` walks the brief's steps. Per-tool
interactions (clicking specific buttons, typing inputs) are added as small,
per-episode step handlers — kept out of the core so the pipeline stays generic.
"""

from __future__ import annotations

from pathlib import Path

from .config import episode_dir
from .models import EpisodeBrief


def record_demo(brief: EpisodeBrief, viewport=(1080, 1920)) -> Path:
    """Record the demo and return the path to the captured video (webm).

    9:16 viewport by default so the Short needs no reframing. The Long crop
    is derived later by the Assembler.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as e:  # pragma: no cover
        raise RuntimeError(
            "playwright is not installed. Run: pip install -r requirements.txt"
        ) from e

    out_dir = episode_dir(brief.day) / "demo"
    out_dir.mkdir(parents=True, exist_ok=True)

    w, h = viewport
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": w, "height": h},
            record_video_dir=str(out_dir),
            record_video_size={"width": w, "height": h},
        )
        page = context.new_page()

        # Land on the tool's page as the opening shot.
        landing = brief.topic.url or "about:blank"
        try:
            page.goto(landing, wait_until="domcontentloaded", timeout=30000)
        except Exception:
            pass
        page.wait_for_timeout(2500)

        # Walk the scripted steps. Each step currently just holds on the page
        # long enough to narrate; real interactions are attached per-episode.
        for step in brief.demo_steps:
            if step.url:
                try:
                    page.goto(step.url, wait_until="domcontentloaded", timeout=30000)
                except Exception:
                    pass
            page.wait_for_timeout(3000)  # dwell so narration has footage to sit on

        context.close()  # flushes the video file
        browser.close()

    videos = sorted(out_dir.glob("*.webm"))
    if not videos:
        raise RuntimeError("Playwright produced no video; check the demo steps.")
    return videos[-1]
