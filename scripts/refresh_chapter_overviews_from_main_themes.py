from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
TZ = timezone(timedelta(hours=8))
TITLE_PREFIX_PATTERN = re.compile(r"^(?:主要主題|主題)\s*\d+\s*[：:]\s*")
DEFAULT_CHAPTER_CODES = [
    "s1-1-1",
    "s1-1-2",
    "s1-1-3",
    "s1-1-4",
    "s1-1-5",
    "s1-2-1",
    "s1-2-2",
    "s1-2-3",
]


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def sort_key(topic: dict) -> tuple:
    order_index = topic.get("orderIndex")
    return (order_index is None, int(order_index or 0))


def clean_title(value: str) -> str:
    return TITLE_PREFIX_PATTERN.sub("", str(value or "").strip())


def build_children_map(topics: list[dict]) -> dict[str | None, list[dict]]:
    children_map: dict[str | None, list[dict]] = {}
    for topic in topics:
        children_map.setdefault(topic.get("parentId"), []).append(topic)
    for items in children_map.values():
        items.sort(key=sort_key)
    return children_map


def find_root_candidates(topics: list[dict], chapter_code: str) -> list[dict]:
    matches: list[dict] = []
    for topic in topics:
        topic_chapter_code = str(
            topic.get("chapterCode", "") or topic.get("chapter_code", "")
        ).strip()
        if topic_chapter_code != chapter_code:
            continue
        if topic.get("parentId"):
            continue
        matches.append(topic)
    return matches


def is_main_theme(topic: dict) -> bool:
    return "-main-theme-" in str(topic.get("id", ""))


def is_wrapper_child(child: dict, theme_title: str) -> bool:
    child_id = str(child.get("id", ""))
    child_title = clean_title(child.get("title", ""))
    return (
        child_title == theme_title
        or child_id.endswith("-core")
        or child_id.endswith("-guide")
        or child_id.endswith("-overview")
    )


def dedupe_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    output: list[str] = []
    for item in items:
        if not item or item in seen:
            continue
        seen.add(item)
        output.append(item)
    return output


def extract_table_focus_titles(main_topic_entry: dict | None) -> list[str]:
    if not main_topic_entry:
        return []
    for variant in main_topic_entry.get("variants", []):
        if variant.get("id") != "editable":
            continue
        for section in variant.get("sections", []):
            if section.get("type") != "table":
                continue
            titles = []
            for row in section.get("rows", []):
                if not row:
                    continue
                titles.append(clean_title(row[0]))
            return dedupe_preserve_order(titles)
    return []


def extract_branch_titles(
    theme: dict,
    children_map: dict[str | None, list[dict]],
) -> list[str]:
    theme_title = clean_title(theme.get("title", ""))
    direct_children = children_map.get(theme["id"], [])
    collected: list[str] = []

    for child in direct_children:
        if is_wrapper_child(child, theme_title):
            collected.extend(
                clean_title(grandchild.get("title", ""))
                for grandchild in children_map.get(child["id"], [])
            )
        else:
            collected.append(clean_title(child.get("title", "")))

    return dedupe_preserve_order(collected)


def collect_next_layer_titles(
    theme: dict,
    children_map: dict[str | None, list[dict]],
    main_topic_entry: dict | None,
) -> list[str]:
    focus_titles = extract_table_focus_titles(main_topic_entry)
    if focus_titles:
        return focus_titles

    branch_titles = extract_branch_titles(theme, children_map)
    if branch_titles:
        return branch_titles

    return []


def build_reminder_text(
    theme: dict,
    children_map: dict[str | None, list[dict]],
    main_topic_entry: dict | None,
) -> str:
    titles = collect_next_layer_titles(theme, children_map, main_topic_entry)
    if not titles:
        summary = str(theme.get("summary", "")).strip()
        return summary or "主題整理完成後，再往下看分支。"
    if len(titles) == 1:
        return titles[0]
    if len(titles) <= 4:
        return "、".join(titles)
    return "、".join(titles[:4]) + " 等重點"


def ensure_variant(entry: dict, variant_id: str, label: str, default_paragraph: str) -> dict:
    variants = entry.setdefault("variants", [])
    for variant in variants:
        if variant.get("id") == variant_id:
            break
    else:
        variant = {
            "id": variant_id,
            "label": label,
            "sections": [
                {"type": "paragraph", "text": default_paragraph},
                {"type": "table", "headers": ["主題", "角色", "下一層 / 提醒"], "rows": []},
            ],
        }
        variants.append(variant)

    sections = variant.setdefault("sections", [])
    if not any(section.get("type") == "paragraph" for section in sections):
        sections.insert(0, {"type": "paragraph", "text": default_paragraph})
    if not any(section.get("type") == "table" for section in sections):
        sections.append({"type": "table", "headers": ["主題", "角色", "下一層 / 提醒"], "rows": []})
    return variant


def update_table_section(variant: dict, rows: list[list[str]]) -> None:
    for section in variant.get("sections", []):
        if section.get("type") == "table":
            section["headers"] = ["主題", "角色", "下一層 / 提醒"]
            section["rows"] = rows
            return


def refresh_chapter_overview(
    chapter_code: str,
    topics: list[dict],
    overview_db: dict,
    children_map: dict[str | None, list[dict]],
    main_topic_db: dict,
    updated_at: str,
) -> None:
    root_candidates = find_root_candidates(topics, chapter_code)
    root = next(
        (
            candidate
            for candidate in root_candidates
            if any(is_main_theme(child) for child in children_map.get(candidate["id"], []))
        ),
        None,
    )
    if root is None:
        root = next(
            (
                candidate
                for candidate in root_candidates
                if not str(candidate.get("id", "")).endswith("-core")
            ),
            None,
        )
    if root is None and root_candidates:
        root = root_candidates[0]
    if not root:
        return

    main_themes = [
        topic
        for topic in children_map.get(root["id"], [])
        if is_main_theme(topic)
    ]
    if not main_themes:
        return

    rows = []
    main_topics_by_id = main_topic_db.get("byId", {})
    for theme in main_themes:
        main_topic_entry = main_topics_by_id.get(theme["id"])
        rows.append(
            [
                clean_title(theme.get("title", "")),
                "主題",
                build_reminder_text(theme, children_map, main_topic_entry),
            ]
        )

    overviews = overview_db.setdefault("overviews", {})
    entry = overviews.setdefault(
        chapter_code,
        {
            "groupName": "章節大綱與最重要的幾句話",
            "title": "章節大綱與最重要的幾句話",
            "variants": [],
        },
    )
    entry["updatedAt"] = updated_at

    editable_variant = ensure_variant(
        entry,
        "editable",
        "可修改版",
        "這一章先看主題主軸，再往下展開對應分支。",
    )
    original_variant = ensure_variant(
        entry,
        "original",
        "原稿版",
        "這一章的原稿版也依照主題主軸整理，先對照主題，再往下看分支。",
    )
    update_table_section(editable_variant, rows)
    update_table_section(original_variant, rows)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Refresh chapter overview tables from main themes.")
    parser.add_argument(
        "--chapter-code",
        action="append",
        dest="chapter_codes",
        help="Target chapter code. Repeatable.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    chapter_codes = args.chapter_codes or DEFAULT_CHAPTER_CODES
    formula_db = load_json(FORMULA_DB)
    overview_db = load_json(OVERVIEW_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    topics = formula_db.get("topics", [])
    children_map = build_children_map(topics)
    updated_at = now_iso()

    for chapter_code in chapter_codes:
        refresh_chapter_overview(
            chapter_code,
            topics,
            overview_db,
            children_map,
            main_topic_db,
            updated_at,
        )

    overview_db.setdefault("meta", {})
    overview_db["meta"]["updatedAt"] = updated_at
    save_json(OVERVIEW_DB, overview_db)
    print("Updated chapter overviews:", ", ".join(chapter_codes))


if __name__ == "__main__":
    main()
