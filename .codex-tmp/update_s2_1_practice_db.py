from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"

NEW_PRACTICES = [
    {
        "id": "practice-s2-1-1-sequence-transformation-classification",
        "title": "數列轉換後的等差等比判定",
        "generatorKey": "s2-1-1-sequence-transformation-classification",
        "chapterCode": "s2-1-1",
        "tags": ["等差數列", "等比數列", "數列轉換", "無限練習"],
    },
    {
        "id": "practice-s2-1-1-repeated-block-sequence",
        "title": "重複分組數列的項與部分和",
        "generatorKey": "s2-1-1-repeated-block-sequence",
        "chapterCode": "s2-1-1",
        "tags": ["分組數列", "三角數", "部分和", "無限練習"],
    },
    {
        "id": "practice-s2-1-2-consecutive-cube-range-sum",
        "title": "連續立方和的區間計算",
        "generatorKey": "s2-1-2-consecutive-cube-range-sum",
        "chapterCode": "s2-1-2",
        "tags": ["立方和", "區間求和", "級數", "無限練習"],
    },
    {
        "id": "practice-s2-1-2-geometric-partial-sum-extension",
        "title": "等比級數分段和反推延伸",
        "generatorKey": "s2-1-2-geometric-partial-sum-extension",
        "chapterCode": "s2-1-2",
        "tags": ["等比級數", "分段和", "反推", "無限練習"],
    },
    {
        "id": "practice-s2-1-3-induction-sum-step",
        "title": "數學歸納法的級數公式推導",
        "generatorKey": "s2-1-3-induction-sum-step",
        "chapterCode": "s2-1-3",
        "tags": ["數學歸納法", "級數公式", "k到k+1", "無限練習"],
    },
    {
        "id": "practice-s2-1-3-induction-divisibility-step",
        "title": "數學歸納法的整除證明",
        "generatorKey": "s2-1-3-induction-divisibility-step",
        "chapterCode": "s2-1-3",
        "tags": ["數學歸納法", "整除", "倍數", "無限練習"],
    },
    {
        "id": "practice-s2-1-3-induction-recurrence-conjecture",
        "title": "遞迴一般項的歸納驗證",
        "generatorKey": "s2-1-3-induction-recurrence-conjecture",
        "chapterCode": "s2-1-3",
        "tags": ["數學歸納法", "遞迴", "一般項", "無限練習"],
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


def main() -> None:
    data = json.loads(DB_PATH.read_text(encoding="utf-8"))
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
