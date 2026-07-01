from datetime import datetime, timezone
from pathlib import Path
import json
import sys


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"

NEW_PRACTICES = [
    {
        "id": "practice-s1-2-1-line-form-facts",
        "enabled": True,
        "mode": "generator",
        "title": "直線斜率與截距",
        "generatorKey": "s1-2-1-line-form-facts",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-2-1",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "直線與圓",
        "domain": "解析幾何",
        "prompt": "",
        "answer": "",
        "tags": ["直線", "斜率", "截距", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
    {
        "id": "practice-s1-2-1-linear-fractional-region-extrema",
        "enabled": True,
        "mode": "generator",
        "title": "線性分式在區域上的極值",
        "generatorKey": "s1-2-1-linear-fractional-region-extrema",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-2-1",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "直線與圓",
        "domain": "解析幾何",
        "prompt": "",
        "answer": "",
        "tags": ["直線", "線性規劃", "極值", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
    {
        "id": "practice-s1-2-2-two-circle-common-tangents",
        "enabled": True,
        "mode": "generator",
        "title": "兩圓公切線數判斷",
        "generatorKey": "s1-2-2-two-circle-common-tangents",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-2-2",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "圓方程式",
        "domain": "解析幾何",
        "prompt": "",
        "answer": "",
        "tags": ["圓", "公切線", "兩圓位置關係", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
    {
        "id": "practice-s1-2-3-circle-line-distance-point-count",
        "enabled": True,
        "mode": "generator",
        "title": "圓上到直線定距的點數",
        "generatorKey": "s1-2-3-circle-line-distance-point-count",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-2-3",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "直線與圓的關係",
        "domain": "解析幾何",
        "prompt": "",
        "answer": "",
        "tags": ["圓", "直線距離", "點數判斷", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
]


def reject_bad_text(item):
    text = json.dumps(item, ensure_ascii=False)
    if "??" in text or "\ufffd" in text:
        raise ValueError(f"bad text in {item.get('id')}")


def upsert_by_id(items, item, key="id"):
    for index, old in enumerate(items):
        if old.get(key) == item[key]:
            items[index] = item
            return "updated"
    items.append(item)
    return "inserted"


def next_order(bindings, chapter_code):
    orders = [
        int(binding.get("order", 0))
        for binding in bindings
        if binding.get("targetType") == "chapter" and binding.get("targetId") == chapter_code
    ]
    return (max(orders) if orders else 0) + 1


def upsert_binding(bindings, practice_id, target_id):
    order = next_order(
        [binding for binding in bindings if binding.get("practiceId") != practice_id],
        target_id,
    )
    item = {
        "practiceId": practice_id,
        "targetType": "chapter",
        "targetId": target_id,
        "enabled": True,
        "order": order,
    }
    for index, old in enumerate(bindings):
        if old.get("practiceId") == practice_id and old.get("targetId") == target_id:
            item["order"] = old.get("order", order)
            bindings[index] = item
            return "updated"
    bindings.append(item)
    return "inserted"


def main():
    for item in NEW_PRACTICES:
        reject_bad_text(item)

    db = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    practice_results = [upsert_by_id(db["practices"], item) for item in NEW_PRACTICES]
    binding_results = [
        upsert_binding(db["bindings"], item["id"], item["chapterCode"])
        for item in NEW_PRACTICES
    ]

    meta = db.setdefault("meta", {})
    meta["practiceCount"] = len(db.get("practices", []))
    meta["bindingCount"] = len(db.get("bindings", []))
    meta["totalPractices"] = len(db.get("practices", []))
    meta["totalBindings"] = len(db.get("bindings", []))
    meta["updatedAt"] = datetime.now(timezone.utc).isoformat()

    DB_PATH.write_text(json.dumps(db, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("practices", practice_results)
    print("bindings", binding_results)


if __name__ == "__main__":
    main()
