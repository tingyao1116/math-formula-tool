from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    {
        "id": "practice-s1-3-1-odd-even-value-relation",
        "title": "多項式奇偶結構的函數值互推",
        "generatorKey": "s1-3-1-odd-even-value-relation",
        "chapterCode": "s1-3-1",
        "tags": ["奇函數", "偶函數", "函數值", "無限練習"],
    },
    {
        "id": "practice-s1-3-1-shifted-basis-coefficients",
        "title": "位移基底下的多項式係數反推",
        "generatorKey": "s1-3-1-shifted-basis-coefficients",
        "chapterCode": "s1-3-1",
        "tags": ["位移基底", "係數反推", "多項式展開", "無限練習"],
    },
    {
        "id": "practice-s1-3-2-parabola-symmetry-point",
        "title": "拋物線對稱點坐標判定",
        "generatorKey": "s1-3-2-parabola-symmetry-point",
        "chapterCode": "s1-3-2",
        "tags": ["拋物線", "對稱軸", "對稱點", "無限練習"],
    },
    {
        "id": "practice-s1-3-2-quadratic-axis-two-points",
        "title": "對稱軸與兩點反求二次函數",
        "generatorKey": "s1-3-2-quadratic-axis-two-points",
        "chapterCode": "s1-3-2",
        "tags": ["對稱軸", "二次函數", "兩點條件", "無限練習"],
    },
    {
        "id": "practice-s1-3-2-cubic-center-standard-form",
        "title": "三次函數中心式改寫與對稱中心",
        "generatorKey": "s1-3-2-cubic-center-standard-form",
        "chapterCode": "s1-3-2",
        "tags": ["三次函數", "對稱中心", "中心式", "無限練習"],
    },
    {
        "id": "practice-s1-3-3-quadratic-inequality-from-solution",
        "title": "由二次不等式解集合反推係數",
        "generatorKey": "s1-3-3-quadratic-inequality-from-solution",
        "chapterCode": "s1-3-3",
        "tags": ["二次不等式", "解集合", "反推係數", "無限練習"],
    },
]


def main() -> None:
    data = json.loads(DB_PATH.read_text(encoding="utf-8"))
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

    data["meta"]["practiceCount"] = len(data["practices"])
    data["meta"]["bindingCount"] = len(data["bindings"])
    data["meta"]["totalPractices"] = len(data["practices"])
    data["meta"]["totalBindings"] = len(data["bindings"])
    data["meta"]["updatedAt"] = datetime.now(timezone.utc).isoformat()

    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"updated {len(NEW_PRACTICES)} practices")


if __name__ == "__main__":
    main()
