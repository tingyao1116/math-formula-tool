import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    ("practice-s4-1-1-equidistant-plane-locus-clean", "s4-1-1", "等距點在坐標平面上的軌跡", "s4-1-1-equidistant-plane-locus-clean", "空間概念", ["等距點", "垂直平分平面", "坐標平面"]),
    ("practice-s4-1-1-moving-point-distance-clean", "s4-1-1", "空間等速動點距離極值", "s4-1-1-moving-point-distance-clean", "空間概念", ["等速動點", "距離平方", "極值"]),
    ("practice-s4-1-2-unit-direction-sum-clean", "s4-1-2", "同方向單位向量與坐標和", "s4-1-2-unit-direction-sum-clean", "空間坐標與向量", ["單位向量", "方向向量", "坐標和"]),
    ("practice-s4-1-2-parametric-vector-min-clean", "s4-1-2", "參數空間向量長度最小值", "s4-1-2-parametric-vector-min-clean", "空間坐標與向量", ["參數向量", "長度最小", "垂直條件"]),
    ("practice-s4-1-2-line-projection-point-clean", "s4-1-2", "點到空間直線的正射影點", "s4-1-2-line-projection-point-clean", "空間坐標與向量", ["正射影點", "空間直線", "垂足"]),
    ("practice-s4-1-3-projection-scalar-clean", "s4-1-3", "帶正負正射影長判讀", "s4-1-3-projection-scalar-clean", "空間向量的內積", ["正射影長", "內積", "夾角"]),
    ("practice-s4-1-3-sphere-linear-extrema-clean", "s4-1-3", "球面上一次式最大最小值", "s4-1-3-sphere-linear-extrema-clean", "空間向量的內積", ["球面", "一次式極值", "柯西不等式"]),
    ("practice-s4-1-3-plane-distance-minimum-clean", "s4-1-3", "平面限制下的平方距離最小值", "s4-1-3-plane-distance-minimum-clean", "空間向量的內積", ["點到平面距離", "平方距離", "最小值"]),
    ("practice-s4-1-4-triangle-height-clean", "s4-1-4", "外積求空間三角形的高", "s4-1-4-triangle-height-clean", "外積與行列式", ["外積", "三角形面積", "高"]),
    ("practice-s4-1-4-volume-linear-combination-clean", "s4-1-4", "向量線性組合下的體積倍率", "s4-1-4-volume-linear-combination-clean", "外積與行列式", ["三階行列式", "體積倍率", "線性組合"]),
    ("practice-s4-1-4-vandermonde-parameter-clean", "s4-1-4", "范德蒙行列式參數方程", "s4-1-4-vandermonde-parameter-clean", "外積與行列式", ["范德蒙行列式", "參數方程", "行列式"]),
    ("practice-s4-1-4-determinant-operation-clean", "s4-1-4", "三階行列式欄運算性質", "s4-1-4-determinant-operation-clean", "外積與行列式", ["行列式性質", "欄運算", "交錯性"]),
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
        "domain": "空間向量",
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
