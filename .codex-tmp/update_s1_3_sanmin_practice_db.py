from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"

NEW_PRACTICES = [
    {
        "id": "practice-s1-3-1-factor-check-special-polynomial",
        "title": "特殊多項式的因式判定",
        "generatorKey": "s1-3-1-factor-check-special-polynomial",
        "chapterCode": "s1-3-1",
        "tags": ["多項式", "因式定理", "特殊因式", "無限練習"],
    },
    {
        "id": "practice-s1-3-1-nearby-roots-value",
        "title": "已知相鄰根的函數值互推",
        "generatorKey": "s1-3-1-nearby-roots-value",
        "chapterCode": "s1-3-1",
        "tags": ["多項式", "根", "函數值", "無限練習"],
    },
    {
        "id": "practice-s1-3-2-cubic-center-form-evaluation",
        "title": "三次函數中心式代值與估算",
        "generatorKey": "s1-3-2-cubic-center-form-evaluation",
        "chapterCode": "s1-3-2",
        "tags": ["三次函數", "中心式", "代值", "無限練習"],
    },
    {
        "id": "practice-s1-3-3-same-solution-transform",
        "title": "不等式同解轉換與陷阱判定",
        "generatorKey": "s1-3-3-same-solution-transform",
        "chapterCode": "s1-3-3",
        "tags": ["不等式", "同解轉換", "平方因式", "分式不等式", "無限練習"],
    },
]


def reject_bad_text(item: dict) -> None:
    text = json.dumps(item, ensure_ascii=False)
    if "??" in text or "\ufffd" in text:
        raise ValueError(f"bad text in {item.get('id')}")


def main() -> None:
    data = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    chapter_meta: dict[str, dict[str, str]] = {}
    for practice in data["practices"]:
        code = practice.get("chapterCode")
        if code and code not in chapter_meta:
            chapter_meta[code] = {
                "stage": practice.get("stage", ""),
                "grade": practice.get("grade", ""),
                "term": practice.get("term", ""),
                "chapter": practice.get("chapter", ""),
                "domain": practice.get("domain", ""),
            }

    by_id = {practice["id"]: practice for practice in data["practices"]}
    for spec in NEW_PRACTICES:
        reject_bad_text(spec)
        meta = chapter_meta[spec["chapterCode"]]
        by_id[spec["id"]] = {
            "id": spec["id"],
            "enabled": True,
            "mode": "generator",
            "title": spec["title"],
            "generatorKey": spec["generatorKey"],
            "difficulty": "medium",
            "questionCount": 5,
            "subtypeCount": 5,
            "relatedPracticeIds": [],
            "chapterCode": spec["chapterCode"],
            "stage": meta["stage"],
            "grade": meta["grade"],
            "term": meta["term"],
            "chapter": meta["chapter"],
            "domain": meta["domain"],
            "prompt": "",
            "answer": "",
            "tags": spec["tags"],
            "usage": [],
            "examples": [],
            "tips": [],
            "notes": [],
            "mistakes": [],
        }
    data["practices"] = sorted(by_id.values(), key=lambda item: item["id"])

    binding_key = lambda item: (item["practiceId"], item["targetType"], item["targetId"])
    bindings = {binding_key(binding): binding for binding in data["bindings"]}
    max_order_by_chapter: dict[str, int] = {}
    for binding in data["bindings"]:
        if binding.get("targetType") != "chapter":
            continue
        target = binding.get("targetId")
        max_order_by_chapter[target] = max(max_order_by_chapter.get(target, 0), int(binding.get("order", 0)))

    for spec in NEW_PRACTICES:
        chapter = spec["chapterCode"]
        key = (spec["id"], "chapter", chapter)
        if key not in bindings:
            max_order_by_chapter[chapter] = max_order_by_chapter.get(chapter, 0) + 1
            bindings[key] = {
                "practiceId": spec["id"],
                "targetType": "chapter",
                "targetId": chapter,
                "enabled": True,
                "order": max_order_by_chapter[chapter],
            }

    data["bindings"] = sorted(
        bindings.values(),
        key=lambda item: (item["targetType"], item["targetId"], int(item.get("order", 0)), item["practiceId"]),
    )

    meta = data.setdefault("meta", {})
    meta["practiceCount"] = len(data["practices"])
    meta["bindingCount"] = len(data["bindings"])
    meta["totalPractices"] = len(data["practices"])
    meta["totalBindings"] = len(data["bindings"])
    meta["updatedAt"] = datetime.now(timezone.utc).isoformat()

    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"updated {len(NEW_PRACTICES)} s1-3 sanmin practices")


if __name__ == "__main__":
    main()
