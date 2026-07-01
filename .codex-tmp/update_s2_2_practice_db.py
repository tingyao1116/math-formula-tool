from datetime import datetime, timezone
from pathlib import Path
import json
import sys


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


def practice(pid, title, generator_key, chapter_code, chapter, tags):
    return {
        "id": pid,
        "enabled": True,
        "mode": "generator",
        "title": title,
        "generatorKey": generator_key,
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 5,
        "relatedPracticeIds": [],
        "chapterCode": chapter_code,
        "stage": "高中",
        "grade": "高二",
        "term": "上學期",
        "chapter": chapter,
        "domain": "排列組合與機率",
        "prompt": "",
        "answer": "",
        "tags": tags + ["無限練習"],
        "usage": [],
        "examples": [],
        "tips": [],
        "notes": [],
        "mistakes": [],
    }


NEW_PRACTICES = [
    practice(
        "practice-s2-2-1-license-plate-restrictions-parameterized",
        "車牌號碼限制計數",
        "s2-2-1-license-plate-restrictions-parameterized",
        "s2-2-1",
        "集合與計數原理",
        ["乘法原理", "車牌", "限制計數"],
    ),
    practice(
        "practice-s2-2-1-distinct-distribution-at-least-parameterized",
        "相異物分配與至少限制",
        "s2-2-1-distinct-distribution-at-least-parameterized",
        "s2-2-1",
        "集合與計數原理",
        ["取捨原理", "相異物分配", "至少限制"],
    ),
    practice(
        "practice-s2-2-1-ferry-capacity-assignment-parameterized",
        "渡船容量限制分配",
        "s2-2-1-ferry-capacity-assignment-parameterized",
        "s2-2-1",
        "集合與計數原理",
        ["乘法原理", "容量限制", "分類計數"],
    ),
    practice(
        "practice-s2-2-2-adjacent-pair-end-restriction-parameterized",
        "相鄰成組與端點限制",
        "s2-2-2-adjacent-pair-end-restriction-parameterized",
        "s2-2-2",
        "排列",
        ["排列", "相鄰", "端點限制"],
    ),
    practice(
        "practice-s2-2-2-same-type-nonadjacent-programs-parameterized",
        "同類節目不相鄰排列",
        "s2-2-2-same-type-nonadjacent-programs-parameterized",
        "s2-2-2",
        "排列",
        ["排列", "不相鄰", "插空法"],
    ),
    practice(
        "practice-s2-2-2-repeated-digit-leading-zero-parameterized",
        "重複數字與首位不可為零",
        "s2-2-2-repeated-digit-leading-zero-parameterized",
        "s2-2-2",
        "排列",
        ["不盡相異物排列", "首位限制", "數字排列"],
    ),
    practice(
        "practice-s2-2-2-ordered-blocks-internal-permutation-parameterized",
        "固定區塊順序的內部排列",
        "s2-2-2-ordered-blocks-internal-permutation-parameterized",
        "s2-2-2",
        "排列",
        ["分組排列", "相同類別", "區塊法"],
    ),
]

NEW_BINDINGS = [
    ("practice-s2-2-1-license-plate-restrictions-parameterized", "s2-2-1", 5),
    ("practice-s2-2-1-distinct-distribution-at-least-parameterized", "s2-2-1", 6),
    ("practice-s2-2-1-ferry-capacity-assignment-parameterized", "s2-2-1", 7),
    ("practice-s2-2-2-same-group-together-parameterized", "s2-2-2", 5),
    ("practice-s2-2-2-gender-non-adjacent-parameterized", "s2-2-2", 6),
    ("practice-s2-2-2-adjacent-pair-end-restriction-parameterized", "s2-2-2", 7),
    ("practice-s2-2-2-same-type-nonadjacent-programs-parameterized", "s2-2-2", 8),
    ("practice-s2-2-2-repeated-digit-leading-zero-parameterized", "s2-2-2", 9),
    ("practice-s2-2-2-ordered-blocks-internal-permutation-parameterized", "s2-2-2", 10),
    ("practice-s2-2-4-three-set-union-parameterized", "s2-2-4", 6),
    ("practice-s2-2-4-complement-independent-parameterized", "s2-2-4", 7),
    ("practice-s2-2-4-biased-binomial-at-least-parameterized", "s2-2-4", 8),
    ("practice-s2-2-4-total-probability-parameterized", "s2-2-4", 9),
    ("practice-s2-2-4-hypergeometric-expected-value-parameterized", "s2-2-4", 10),
]


def upsert_practice(practices, item):
    for index, old in enumerate(practices):
        if old.get("id") == item["id"]:
            practices[index] = item
            return "updated"
    practices.append(item)
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
    practice_results = [upsert_practice(db["practices"], item) for item in NEW_PRACTICES]
    existing_ids = {p["id"] for p in db["practices"]}
    missing = [practice_id for practice_id, _, _ in NEW_BINDINGS if practice_id not in existing_ids]
    if missing:
        raise SystemExit(f"missing practices: {missing}")
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
