from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"

NEW_PRACTICES = [
    {
        "id": "practice-s2-1-1-arithmetic-common-terms",
        "title": "兩等差數列的共同項",
        "generatorKey": "s2-1-1-arithmetic-common-terms",
        "chapterCode": "s2-1-1",
        "tags": ["等差數列", "共同項", "最小公倍數", "無限練習"],
    },
    {
        "id": "practice-s2-1-1-geometric-product-symmetry",
        "title": "等比數列的對稱乘積",
        "generatorKey": "s2-1-1-geometric-product-symmetry",
        "chapterCode": "s2-1-1",
        "tags": ["等比數列", "對稱乘積", "中項", "無限練習"],
    },
    {
        "id": "practice-s2-1-1-arithmetic-geometric-bridge",
        "title": "等差等比混合條件反推",
        "generatorKey": "s2-1-1-arithmetic-geometric-bridge",
        "chapterCode": "s2-1-1",
        "tags": ["等差數列", "等比數列", "聯立條件", "無限練習"],
    },
    {
        "id": "practice-s2-1-1-prefix-product-terms",
        "title": "前綴乘積反求數列項",
        "generatorKey": "s2-1-1-prefix-product-terms",
        "chapterCode": "s2-1-1",
        "tags": ["遞迴", "前綴乘積", "一般項", "無限練習"],
    },
    {
        "id": "practice-s2-1-2-arithmetic-end-block-count",
        "title": "等差級數前後端項和反推",
        "generatorKey": "s2-1-2-arithmetic-end-block-count",
        "chapterCode": "s2-1-2",
        "tags": ["等差級數", "端項配對", "反推項數", "無限練習"],
    },
    {
        "id": "practice-s2-1-3-periodic-remainder-sequence",
        "title": "週期餘數與整除循環",
        "generatorKey": "s2-1-3-periodic-remainder-sequence",
        "chapterCode": "s2-1-3",
        "tags": ["週期", "餘數", "整除", "無限練習"],
    },
]

DEFAULT_META = {
    "s2-1-3": {
        "stage": "高中",
        "grade": "高一",
        "term": "下學期",
        "chapter": "數學歸納法",
        "domain": "代數",
    }
}


def reject_bad_text(item: dict) -> None:
    text = json.dumps(item, ensure_ascii=False)
    if "??" in text or "\ufffd" in text:
        raise ValueError(f"bad text in {item.get('id')}")


def main() -> None:
    data = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    chapter_meta: dict[str, dict[str, str]] = dict(DEFAULT_META)
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
    print(f"updated {len(NEW_PRACTICES)} s2-1 sanmin practices")


if __name__ == "__main__":
    main()
