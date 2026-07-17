"""Orchestrator + CLI — run a day and stop at an approval package.

Commands (see `python -m ityca --help`):
  scout                 print today's ranked candidate topics
  brief   [--pick N]    write the EpisodeBrief for the top (or Nth) topic
  produce [--pick N]    full run: scout -> brief -> demo -> seaart -> assemble
  publish DAY           publish an already-approved day (approval-first gate)

`produce` writes everything under episodes/<day>/ and, because the setup is
approval-first, STOPS after rendering. It prints a review summary and never
publishes. Publishing is a separate, explicit `publish` command a human runs
after watching the render.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .config import Secrets, episode_dir
from .models import EpisodeBrief, today_iso
from . import scout as scout_mod
from . import writer as writer_mod


def cmd_scout(args) -> int:
    topics = scout_mod.scout()
    if not topics:
        print("No fresh candidate topics found in the configured window.")
        return 1
    for i, t in enumerate(topics):
        print(f"[{i}] {t.score:>5}  {t.tool_name}")
        print(f"      {t.headline}")
        print(f"      {t.source} | {t.url}\n")
    return 0


def cmd_brief(args) -> int:
    topics = scout_mod.scout()
    if not topics:
        print("No topics to write a brief for.")
        return 1
    topic = topics[min(args.pick, len(topics) - 1)]
    brief = writer_mod.write_brief(topic, day=args.day)
    path = episode_dir(brief.day) / "brief.json"
    path.write_text(brief.to_json(), encoding="utf-8")
    print(f"Wrote brief for '{topic.tool_name}' -> {path}")
    print(f"(writer mode: {'LLM' if Secrets.from_env().anthropic_api_key else 'draft'})")
    return 0


def cmd_produce(args) -> int:
    from . import demo as demo_mod
    from . import seaart as seaart_mod
    from . import assembler as asm_mod

    secrets = Secrets.from_env()
    day = args.day or today_iso()

    # 1) topic + 2) brief
    topics = scout_mod.scout()
    if not topics:
        print("No topics found; aborting.")
        return 1
    topic = topics[min(args.pick, len(topics) - 1)]
    brief = writer_mod.write_brief(topic, day=day, secrets=secrets)
    (episode_dir(day) / "brief.json").write_text(brief.to_json(), encoding="utf-8")
    print(f"[1/4] topic: {topic.tool_name}")
    print(f"[2/4] brief written ({'LLM' if secrets.anthropic_api_key else 'draft'} mode)")

    # 3) screen demo (best-effort — never blocks the run)
    demo_video = _try("demo", lambda: demo_mod.record_demo(brief))

    # 4) SeaArt avatar + voice (best-effort)
    assets = _try("seaart", lambda: seaart_mod.generate_assets(brief, secrets))
    avatar_clips = assets.avatar_clips if assets else None
    voiceover = assets.voiceover if assets else None

    # 5) assemble Short + Long
    result = _try(
        "assemble",
        lambda: asm_mod.assemble(brief, demo_video, avatar_clips, voiceover),
    )

    _print_review(brief, day, demo_video, avatar_clips, voiceover, result)
    return 0


def cmd_publish(args) -> int:
    from . import assembler  # noqa: F401  (ensures package import path)
    from . import publisher as pub_mod

    day = args.day
    d = episode_dir(day)
    brief_path = d / "brief.json"
    if not brief_path.exists():
        print(f"No brief at {brief_path}; run `produce` first.")
        return 1
    brief = EpisodeBrief.load(str(brief_path))
    short = d / "render" / "short.mp4"
    long = d / "render" / "long.mp4"

    if not args.yes:
        print("Approval-first: re-run with --yes to actually publish.")
        print(f"  short: {short}  ({'exists' if short.exists() else 'MISSING'})")
        print(f"  long:  {long}  ({'exists' if long.exists() else 'MISSING'})")
        return 0

    results = pub_mod.publish_all(brief, short, long)
    for r in results:
        print(f"  {r.platform:<10} {'OK' if r.ok else '—'}  {r.detail}")
    return 0


def _try(stage: str, fn):
    try:
        return fn()
    except Exception as e:  # bring-up: log and continue so the run still yields a package
        print(f"[{stage}] skipped: {e}")
        return None


def _print_review(brief, day, demo_video, avatar_clips, voiceover, result) -> None:
    print("\n" + "=" * 60)
    print(f"REVIEW PACKAGE — {day} — {brief.topic.tool_name}")
    print("=" * 60)
    print(f"pain:   {brief.pain}")
    print(f"hook:   {brief.pain_hook}")
    print(f"demo:   {'ok' if demo_video else 'missing'}")
    print(f"avatar: {len(avatar_clips) if avatar_clips else 0} clip(s)")
    print(f"voice:  {'ok' if voiceover else 'missing'}")
    if result:
        print(f"short:  {result.short}")
        print(f"long:   {result.long}")
        for n in result.notes:
            print(f"  note: {n}")
    print(f"\nBrief: {episode_dir(day) / 'brief.json'}")
    print("Approval-first: review the renders, then `python -m ityca publish "
          f"{day} --yes` to go live.")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="ityca", description="I think you can AI it — daily pipeline")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("scout", help="rank today's candidate AI tools")
    s.set_defaults(func=cmd_scout)

    b = sub.add_parser("brief", help="write the episode brief")
    b.add_argument("--pick", type=int, default=0, help="which ranked topic (0=top)")
    b.add_argument("--day", default=None, help="ISO date override")
    b.set_defaults(func=cmd_brief)

    pr = sub.add_parser("produce", help="full run, stops at approval package")
    pr.add_argument("--pick", type=int, default=0)
    pr.add_argument("--day", default=None)
    pr.set_defaults(func=cmd_produce)

    pub = sub.add_parser("publish", help="publish an approved day")
    pub.add_argument("day", help="ISO date, e.g. 2026-07-17")
    pub.add_argument("--yes", action="store_true", help="actually publish (else dry-run)")
    pub.set_defaults(func=cmd_publish)
    return p


def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
