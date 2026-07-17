"""Assembler — stitch clips + voiceover + captions into the Short and Long.

Inputs: the screen-demo video (demo.py), the avatar clips + voiceover
(seaart.py), and the EpisodeBrief. Outputs: two mp4s per day —
`short.mp4` (9:16) and `long.mp4` (16:9) — in the episode's `render/` dir.

Rendering is done with ffmpeg (must be on PATH). The assembly here is a
straightforward, dependency-light concat + audio-overlay + subtitle burn. It
runs as soon as real input files exist; with only some inputs present it
assembles what it can and logs what was missing, so the pipeline degrades
gracefully during bring-up.
"""

from __future__ import annotations

import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

from .config import episode_dir
from .models import EpisodeBrief


@dataclass
class RenderResult:
    short: Path | None
    long: Path | None
    notes: list[str]


def assemble(
    brief: EpisodeBrief,
    demo_video: Path | None,
    avatar_clips: list[Path] | None,
    voiceover: Path | None,
) -> RenderResult:
    _require_ffmpeg()
    render = episode_dir(brief.day) / "render"
    render.mkdir(parents=True, exist_ok=True)
    notes: list[str] = []

    avatar_clips = avatar_clips or []
    if not demo_video:
        notes.append("no screen-demo video: Short/Long will be avatar-only")
    if not avatar_clips:
        notes.append("no avatar clips: cold-open/payoff missing")
    if not voiceover:
        notes.append("no voiceover: video will be silent")

    # Build the visual spine: [cold-open avatar] + [demo] + [payoff avatar].
    segments: list[Path] = []
    if avatar_clips:
        segments.append(avatar_clips[0])
    if demo_video:
        segments.append(demo_video)
    if len(avatar_clips) > 1:
        segments.append(avatar_clips[-1])

    if not segments:
        notes.append("no video segments at all: nothing to render")
        return RenderResult(short=None, long=None, notes=notes)

    subtitles = _write_srt(brief, render)

    short = _render_variant(segments, voiceover, subtitles, render / "short.mp4", aspect="9:16")
    long = _render_variant(segments, voiceover, subtitles, render / "long.mp4", aspect="16:9")
    return RenderResult(short=short, long=long, notes=notes)


def _render_variant(
    segments: list[Path], voiceover: Path | None, subtitles: Path, dest: Path, aspect: str
) -> Path:
    """Concat segments, overlay voiceover, burn subtitles, scale to aspect."""
    w, h = (1080, 1920) if aspect == "9:16" else (1920, 1080)

    concat_file = dest.with_suffix(".concat.txt")
    concat_file.write_text(
        "".join(f"file '{seg.resolve()}'\n" for seg in segments), encoding="utf-8"
    )

    # scale+pad to target frame, then burn subtitles.
    vf = (
        f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
        f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2,"
        f"subtitles='{subtitles.resolve()}'"
    )

    cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_file)]
    if voiceover:
        cmd += ["-i", str(voiceover), "-map", "0:v", "-map", "1:a", "-shortest"]
    cmd += ["-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", str(dest)]

    subprocess.run(cmd, check=True, capture_output=True)
    concat_file.unlink(missing_ok=True)
    return dest


def _write_srt(brief: EpisodeBrief, render: Path) -> Path:
    """Minimal single-cue subtitle file from the caption line.

    A word-timed SRT (from the TTS timestamps) replaces this once seaart.py
    returns alignment data; the burn step is already wired for it.
    """
    srt = render / "captions.srt"
    text = brief.captions or brief.voiceover_script[:120]
    srt.write_text(
        f"1\n00:00:00,000 --> 00:00:10,000\n{text}\n", encoding="utf-8"
    )
    return srt


def _require_ffmpeg() -> None:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg not found on PATH. Install ffmpeg. See docs/SETUP.md.")
