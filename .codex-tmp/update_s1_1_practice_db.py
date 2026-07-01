from pathlib import Path
from datetime import datetime, timezone
import json
import sys


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"

NEW_PRACTICES = [
    {
        "id": "practice-s1-1-4-exponential-quadratic-extrema",
        "enabled": True,
        "mode": "generator",
        "title": "指數式的最小值",
        "generatorKey": "s1-1-4-exponential-quadratic-extrema",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-1-4",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "指數與指數律",
        "domain": "數與式",
        "prompt": "",
        "answer": "",
        "tags": ["指數", "二次式", "最小值", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
    {
        "id": "practice-s1-1-4-exponential-fraction-range",
        "enabled": True,
        "mode": "generator",
        "title": "指數換元與分式值域",
        "generatorKey": "s1-1-4-exponential-fraction-range",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-1-4",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "指數與指數律",
        "domain": "數與式",
        "prompt": "",
        "answer": "",
        "tags": ["指數", "換元", "值域", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
    {
        "id": "practice-s1-1-4-rational-exponent-ordering",
        "enabled": True,
        "mode": "generator",
        "title": "分數指數與根式三數比較",
        "generatorKey": "s1-1-4-rational-exponent-ordering",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-1-4",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "指數與指數律",
        "domain": "數與式",
        "prompt": "",
        "answer": "",
        "tags": ["分數指數", "根式", "大小比較", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
    {
        "id": "practice-s1-1-4-exponential-growth-model",
        "enabled": True,
        "mode": "generator",
        "title": "指數成長倍率模型",
        "generatorKey": "s1-1-4-exponential-growth-model",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-1-4",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "指數與指數律",
        "domain": "數與式",
        "prompt": "",
        "answer": "",
        "tags": ["指數函數", "成長倍率", "應用題", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
    {
        "id": "practice-s1-1-5-log-difference-estimate",
        "enabled": True,
        "mode": "generator",
        "title": "大數相減的對數估算",
        "generatorKey": "s1-1-5-log-difference-estimate",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": "s1-1-5",
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "常用對數",
        "domain": "數與式",
        "prompt": "",
        "answer": "",
        "tags": ["常用對數", "估算", "科學記號", "無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    },
]

NEW_BINDINGS = [
    ("practice-s1-1-4-exponential-quadratic-extrema", "s1-1-4", 743),
    ("practice-s1-1-4-exponential-fraction-range", "s1-1-4", 744),
    ("practice-s1-1-4-rational-exponent-ordering", "s1-1-4", 745),
    ("practice-s1-1-4-exponential-growth-model", "s1-1-4", 746),
    ("practice-s1-1-5-log-difference-estimate", "s1-1-5", 745),
]


def upsert_by_id(items, item, key="id"):
    for index, old in enumerate(items):
        if old.get(key) == item[key]:
            items[index] = item
            return "updated"
    items.append(item)
    return "inserted"


def upsert_binding(bindings, practice_id, target_id, order):
    item = {
        "practiceId": practice_id,
        "targetType": "chapter",
        "targetId": target_id,
        "enabled": True,
        "order": order,
    }
    for index, old in enumerate(bindings):
        if old.get("practiceId") == practice_id and old.get("targetId") == target_id:
            bindings[index] = item
            return "updated"
    bindings.append(item)
    return "inserted"


def main():
    db = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    practice_results = [upsert_by_id(db["practices"], item) for item in NEW_PRACTICES]
    binding_results = [upsert_binding(db["bindings"], practice_id, target_id, order) for practice_id, target_id, order in NEW_BINDINGS]
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
