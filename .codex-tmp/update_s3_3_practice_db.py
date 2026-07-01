import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    ("practice-s3-3-1-barycentric-interior-clean", "s3-3-1", "三角形內部的向量係數條件", "s3-3-1-barycentric-interior-clean", "平面向量", ["向量線性組合", "三角形內部", "係數條件"]),
    ("practice-s3-3-1-area-ratio-coefficient-clean", "s3-3-1", "由向量係數求三角形面積比", "s3-3-1-area-ratio-coefficient-clean", "平面向量", ["向量係數", "面積比", "三角形"]),
    ("practice-s3-3-1-segment-section-clean", "s3-3-1", "線段內分點的向量表示", "s3-3-1-segment-section-clean", "平面向量", ["內分點", "向量表示", "線段比"]),
    ("practice-s3-3-2-projection-equality-clean", "s3-3-2", "正射影相等求參數", "s3-3-2-projection-equality-clean", "座標向量", ["正射影", "內積", "參數"]),
    ("practice-s3-3-2-parametric-min-length-clean", "s3-3-2", "參數向量長度最小值", "s3-3-2-parametric-min-length-clean", "座標向量", ["參數向量", "最小長度", "垂直"]),
    ("practice-s3-3-2-region-area-clean", "s3-3-2", "座標向量係數區域面積", "s3-3-2-region-area-clean", "座標向量", ["係數區域", "行列式面積", "座標向量"]),
    ("practice-s3-3-3-triangle-side-dot-clean", "s3-3-3", "由三邊長求向量內積", "s3-3-3-triangle-side-dot-clean", "向量內積", ["餘弦定理", "內積", "三角形"]),
    ("practice-s3-3-3-projection-vector-clean", "s3-3-3", "座標向量的正射影向量", "s3-3-3-projection-vector-clean", "向量內積", ["正射影向量", "內積", "座標"]),
    ("practice-s3-3-3-norm-relation-angle-clean", "s3-3-3", "由長度關係求夾角餘弦", "s3-3-3-norm-relation-angle-clean", "向量內積", ["長度平方", "夾角餘弦", "內積"]),
    ("practice-s3-3-4-determinant-operation-clean", "s3-3-4", "二階行列式列運算性質", "s3-3-4-determinant-operation-clean", "行列式與方程組", ["行列式", "列運算", "性質"]),
    ("practice-s3-3-4-cramer-parameter-clean", "s3-3-4", "參數方程組的無限多解與無解", "s3-3-4-cramer-parameter-clean", "行列式與方程組", ["聯立方程組", "參數", "無限多解", "無解"]),
    ("practice-s3-3-4-area-scale-clean", "s3-3-4", "線性變換的面積倍率", "s3-3-4-area-scale-clean", "行列式與方程組", ["行列式面積", "線性變換", "倍率"]),
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
        "grade": "高三",
        "term": "上學期",
        "chapter": chapter,
        "domain": "向量",
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

    chapters = {row[1] for row in NEW_PRACTICES}
    binding_keys = {(practice_id, "chapter", chapter_code) for practice_id, chapter_code, *_ in NEW_PRACTICES}
    bindings[:] = [
        row
        for row in bindings
        if (row.get("practiceId"), str(row.get("targetType", "")).lower(), row.get("targetId")) not in binding_keys
    ]

    next_order = next_orders_by_chapter(bindings, chapters)
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
