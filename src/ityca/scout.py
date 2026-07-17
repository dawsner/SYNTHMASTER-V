"""Scout — pick today's AI tool and the business pain it solves.

Scans the public RSS feeds in config/sources.yaml, scores every recent item
for "a tool a business could actually use tomorrow", and returns the best
Topic. Runs with zero API keys.

The scoring is deliberately simple and transparent (keyword boosts/penalties +
recency). It is meant to shortlist; the Writer (optionally LLM-backed) makes
the final editorial framing.
"""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

import requests

from .config import load_sources
from .models import Topic

# Namespaces seen in Atom / Dublin Core feeds.
_ATOM = "{http://www.w3.org/2005/Atom}"
_DC = "{http://purl.org/dc/elements/1.1/}"

_USER_AGENT = "ityca-scout/0.1 (+https://github.com/)"


class _Entry:
    """Normalized feed item, parsed from RSS 2.0 or Atom with the stdlib."""

    __slots__ = ("title", "summary", "link", "when")

    def __init__(self, title: str, summary: str, link: str, when: datetime | None):
        self.title = title
        self.summary = summary
        self.link = link
        self.when = when


def _text(el) -> str:
    return (el.text or "").strip() if el is not None else ""


def _parse_date(raw: str) -> datetime | None:
    raw = (raw or "").strip()
    if not raw:
        return None
    # RSS uses RFC-822 dates; Atom uses ISO-8601.
    try:
        dt = parsedate_to_datetime(raw)
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError):
        pass
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def _fetch_entries(url: str) -> list[_Entry]:
    """Fetch and parse one RSS/Atom feed using only the standard library."""
    resp = requests.get(url, timeout=20, headers={"User-Agent": _USER_AGENT})
    resp.raise_for_status()
    root = ET.fromstring(resp.content)

    entries: list[_Entry] = []
    # RSS 2.0: <rss><channel><item>...
    for item in root.iter("item"):
        title = _text(item.find("title"))
        summary = _text(item.find("description"))
        link = _text(item.find("link"))
        raw_date = _text(item.find("pubDate")) or _text(item.find(f"{_DC}date"))
        entries.append(_Entry(title, summary, link, _parse_date(raw_date)))

    # Atom: <feed><entry>...
    for entry in root.iter(f"{_ATOM}entry"):
        title = _text(entry.find(f"{_ATOM}title"))
        summary = _text(entry.find(f"{_ATOM}summary")) or _text(entry.find(f"{_ATOM}content"))
        link_el = entry.find(f"{_ATOM}link")
        link = link_el.get("href", "") if link_el is not None else ""
        raw_date = _text(entry.find(f"{_ATOM}updated")) or _text(entry.find(f"{_ATOM}published"))
        entries.append(_Entry(title, summary, link, _parse_date(raw_date)))

    return entries


def score_entry(title: str, summary: str, boosts: list[str], penalties: list[str]) -> float:
    """Transparent keyword score. Positive = more likely to be a usable tool."""
    text = f"{title} {summary}".lower()
    score = 0.0
    for kw in boosts:
        if kw.lower() in text:
            score += 1.0
    for kw in penalties:
        if kw.lower() in text:
            score -= 1.5
    # Prefer items that clearly name a product ("X launches", "introducing X").
    if re.search(r"\b(introducing|meet|launch(?:es|ing)?|now available)\b", text):
        score += 1.0
    return score


def scout(max_age_hours: int = 48, top_n: int = 5) -> list[Topic]:
    """Return the top_n candidate Topics, best first.

    Only items published within max_age_hours are considered so the channel
    stays genuinely daily/fresh.
    """
    cfg = load_sources()
    boosts = cfg.get("boost_keywords", [])
    penalties = cfg.get("penalty_keywords", [])
    cutoff = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)

    candidates: list[Topic] = []
    for feed in cfg.get("feeds", []):
        try:
            entries = _fetch_entries(feed["url"])
        except Exception as e:  # one bad/unreachable feed must not sink the run
            print(f"[scout] skipping feed '{feed.get('name', feed['url'])}': {e}")
            continue

        for entry in entries:
            title, summary, when = entry.title, entry.summary, entry.when
            if when and when < cutoff:
                continue

            base = score_entry(title, summary, boosts, penalties)
            # Small recency bonus (newer within the window ranks higher).
            if when:
                age_h = (datetime.now(timezone.utc) - when).total_seconds() / 3600
                base += max(0.0, (max_age_hours - age_h) / max_age_hours)

            candidates.append(
                Topic(
                    tool_name=_guess_tool_name(title),
                    headline=title,
                    url=entry.link or "",
                    source=feed.get("name", ""),
                    summary=_strip_html(summary)[:500],
                    published=when.date().isoformat() if when else "",
                    score=round(base, 3),
                )
            )

    candidates.sort(key=lambda t: t.score, reverse=True)
    return candidates[:top_n]


def _guess_tool_name(title: str) -> str:
    """Best-effort product name from a headline; the Writer can override."""
    # "Introducing Acme: ..." / "Acme launches ..." heuristics (case-insensitive).
    m = re.match(r"(?:introducing|meet)\s+([\w\.\-]+(?:\s[\w\.\-]+)?)", title, re.IGNORECASE)
    if m:
        return m.group(1).strip(" :-")
    m = re.match(
        r"([A-Z][\w\.\-]+(?:\s[A-Z][\w\.\-]+)?)\s+(?:launches|releases|unveils|introduces)",
        title,
    )
    if m:
        return m.group(1).strip()
    # Fall back to the text before the first ':' or ' - ', capped.
    head = re.split(r"[:\-–]", title, maxsplit=1)[0].strip()
    return (head or title)[:40]


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


if __name__ == "__main__":  # quick manual check: python -m ityca.scout
    for i, t in enumerate(scout(), 1):
        print(f"{i:>2}. [{t.score:>5}] {t.tool_name}  —  {t.headline}")
        print(f"      {t.source} | {t.url}")
