from datetime import datetime, timezone
from pathlib import Path
import json
import sys


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"

NEW_PRACTICES = [
    {
        "id": "practice-s1-1-1-power-remainder-cycle",
        "enabled": True,
        "mode": "generator",
        "title": "乘方餘數循環",
        "generatorKey": "s1-1-1-power-remainder-cycle",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-1-1",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "數與式",
        "domain": "數與式",
        "prompt": "",
        "answer": "",
        "tags": ["數與式", "整數運算", "餘數循環", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
    {
        "id": "practice-s1-1-1-divisibility-missing-digit",
        "enabled": True,
        "mode": "generator",
        "title": "缺位數整除判斷",
        "generatorKey": "s1-1-1-divisibility-missing-digit",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-1-1",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "數與式",
        "domain": "數與式",
        "prompt": "",
        "answer": "",
        "tags": ["數與式", "整除性", "缺位數", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
    {
        "id": "practice-s1-1-2-quotient-interval-range",
        "enabled": True,
        "mode": "generator",
        "title": "區間商的範圍",
        "generatorKey": "s1-1-2-quotient-interval-range",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-1-2",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "數與式",
        "domain": "數與式",
        "prompt": "",
        "answer": "",
        "tags": ["數與式", "不等式", "範圍", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
    {
        "id": "practice-s1-1-4-exponential-parameter-relation",
        "enabled": True,
        "mode": "generator",
        "title": "指數參數關係式",
        "generatorKey": "s1-1-4-exponential-parameter-relation",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 4,
        "relatedPracticeIds": [],
        "chapterCode": "s1-1-4",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "指數與指數律",
        "domain": "數與式",
        "prompt": "",
        "answer": "",
        "tags": ["指數", "指數律", "參數表示", "無限練習"],
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
