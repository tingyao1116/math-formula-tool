from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"


CORE_HINTS = ("-main", "-core", "主角", "核心")


def is_top_level(topic: dict) -> bool:
    return not (topic.get("parentId") or "").strip()


def is_core_like(topic: dict) -> bool:
    haystack = " ".join(
        [
            topic.get("id", ""),
            topic.get("title", ""),
            topic.get("chapterRole", ""),
        ]
    )
    return any(hint in haystack for hint in CORE_HINTS)


def load_topics() -> list[dict]:
    data = json.loads(FORMULA_DB.read_text(encoding="utf-8"))
    return data["topics"]


def build_report(topics: list[dict]) -> list[dict]:
    by_chapter: dict[str, list[dict]] = defaultdict(list)
    for topic in topics:
        chapter_code = topic.get("chapterCode", "")
        if chapter_code:
            by_chapter[chapter_code].append(topic)

    report = []
    for chapter_code, chapter_topics in sorted(by_chapter.items()):
        top_levels = [topic for topic in chapter_topics if is_top_level(topic)]
        core_like = [topic for topic in top_levels if is_core_like(topic)]
        title_counts = Counter((topic.get("title") or "").strip() for topic in top_levels)
        duplicate_titles = {
            title: count for title, count in title_counts.items() if title and count > 1
        }
        report.append(
            {
                "chapterCode": chapter_code,
                "topicCount": len(chapter_topics),
                "topLevelCount": len(top_levels),
                "topLevelIds": [topic.get("id", "") for topic in top_levels],
                "topLevelTitles": [topic.get("title", "") for topic in top_levels],
                "topLevelRoles": Counter(
                    (topic.get("chapterRole") or "").strip() or "(empty)"
                    for topic in top_levels
                ),
                "coreLikeIds": [topic.get("id", "") for topic in core_like],
                "duplicateTopLevelTitles": duplicate_titles,
                "flags": build_flags(top_levels, core_like, duplicate_titles),
            }
        )
    return report


def build_flags(
    top_levels: list[dict], core_like: list[dict], duplicate_titles: dict[str, int]
) -> list[str]:
    flags: list[str] = []
    if not top_levels:
        flags.append("missing_top_level")
    if len(core_like) == 0:
        flags.append("no_core_like_top_level")
    if len(core_like) > 1:
        flags.append("multiple_core_like_top_levels")
    if duplicate_titles:
        flags.append("duplicate_top_level_titles")
    return flags


def main() -> None:
    report = build_report(load_topics())
    flagged = [row for row in report if row["flags"]]

    print(f"chapters={len(report)}")
    print(f"flagged={len(flagged)}")
    print()

    for row in flagged:
        print(
            f"{row['chapterCode']} | top={row['topLevelCount']} | "
            f"core_like={len(row['coreLikeIds'])} | flags={','.join(row['flags'])}"
        )
        if row["duplicateTopLevelTitles"]:
            print(f"  duplicate_titles={row['duplicateTopLevelTitles']}")
        print(f"  core_like_ids={'; '.join(row['coreLikeIds']) or '(none)'}")
        print(f"  top_level_ids={'; '.join(row['topLevelIds'])}")
        print()


if __name__ == "__main__":
    main()
