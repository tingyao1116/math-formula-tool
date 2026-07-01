import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    ("practice-s4-2-1-common-line-plane-family-clean", "s4-2-1", "通過兩點的平面族共同交集", "s4-2-1-common-line-plane-family-clean", "平面方程式", ["平面族", "共同交集", "直線"]),
    ("practice-s4-2-1-coplanar-parameter-clean", "s4-2-1", "四點共面與參數求值", "s4-2-1-coplanar-parameter-clean", "平面方程式", ["四點共面", "參數", "行列式"]),
    ("practice-s4-2-1-parallel-plane-distance-parameter-clean", "s4-2-1", "平行平面的距離與參數", "s4-2-1-parallel-plane-distance-parameter-clean", "平面方程式", ["平行平面", "距離公式", "參數"]),
    ("practice-s4-2-1-plane-angle-parameter-clean", "s4-2-1", "平面平行垂直的參數判定", "s4-2-1-plane-angle-parameter-clean", "平面方程式", ["平面夾角", "法向量", "參數"]),
    ("practice-s4-2-2-line-relation-classification-clean", "s4-2-2", "兩直線位置關係判定", "s4-2-2-line-relation-classification-clean", "空間直線", ["兩直線關係", "平行", "相交", "歪斜"]),
    ("practice-s4-2-2-line-plane-hit-time-clean", "s4-2-2", "直線動點到達平面的時間", "s4-2-2-line-plane-hit-time-clean", "空間直線", ["直線參數式", "線面交點", "動點"]),
    ("practice-s4-2-2-line-plane-relation-clean", "s4-2-2", "直線與平面關係判斷", "s4-2-2-line-plane-relation-clean", "空間直線", ["線面關係", "方向向量", "法向量"]),
    ("practice-s4-2-2-point-line-reflection-clean", "s4-2-2", "點到直線垂足與對稱點", "s4-2-2-point-line-reflection-clean", "空間直線", ["點線距離", "垂足", "對稱點"]),
]


def make_practice(row):
    practice_id, chapter_code, title, generator_key, chapter, tags = row
    return {
        "id": practice_id,
        "enabled": True,
        "mode": "generator",
        "title": title,
        "generatorKey": generator_key,
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 0,
        "relatedPracticeIds": [],
        "chapterCode": chapter_code,
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": chapter,
        "domain": "空間中的平面與直線",
        "prompt": "",
        "answer": "",
        "tags": [chapter_code, *tags, "無限練習"],
        "usage": [],
        "examples": [],
        "tips": ["此小類以同一解題模型換參數產生題目，避免只重排固定題目。"],
        "notes": [],
        "mistakes": [],
    }


def next_orders_by_chapter(bindings, chapters):
    next_orders = {chapter: 1 for chapter in chapters}
    for row in bindings:
        if str(row.get("targetType", "")).lower() != "chapter":
            continue
        chapter = row.get("targetId")
        if chapter in next_orders:
            next_orders[chapter] = max(next_orders[chapter], int(row.get("order", 0)) + 1)
    return next_orders


def main():
    data = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    practices = data.setdefault("practices", [])
    bindings = data.setdefault("bindings", [])

    new_ids = {row[0] for row in NEW_PRACTICES}
    practices[:] = [row for row in practices if row.get("id") not in new_ids]
    practices.extend(make_practice(row) for row in NEW_PRACTICES)

    binding_keys = {(practice_id, "chapter", chapter_code) for practice_id, chapter_code, *_ in NEW_PRACTICES}
    bindings[:] = [
        row
        for row in bindings
        if (row.get("practiceId"), str(row.get("targetType", "")).lower(), row.get("targetId")) not in binding_keys
    ]

    next_order = next_orders_by_chapter(bindings, {row[1] for row in NEW_PRACTICES})
    for practice_id, chapter_code, *_ in NEW_PRACTICES:
        bindings.append(
            {
                "practiceId": practice_id,
                "targetType": "chapter",
                "targetId": chapter_code,
                "enabled": True,
                "order": next_order[chapter_code],
            }
        )
        next_order[chapter_code] += 1

    meta = data.setdefault("meta", {})
    meta["practiceCount"] = len(practices)
    meta["bindingCount"] = len(bindings)
    meta["totalPractices"] = len(practices)
    meta["totalBindings"] = len(bindings)
    meta["updatedAt"] = datetime.now(timezone.utc).isoformat()

    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if "??" in text or "\ufffd" in text:
        raise SystemExit("refuse to write: detected possible mojibake marker")
    DB_PATH.write_text(text, encoding="utf-8")
    print(f"updated practices={len(practices)} bindings={len(bindings)}")


if __name__ == "__main__":
    main()
