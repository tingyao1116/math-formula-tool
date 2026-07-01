import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    {
        "id": "practice-s4-2-1-plane-system-consistency-clean",
        "enabled": True,
        "mode": "generator",
        "title": "三平面方程組共線參數",
        "generatorKey": "s4-2-1-plane-system-consistency-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-2-1",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間中的平面與直線",
        "domain": "平面方程式",
        "prompt": "",
        "answer": "",
        "tags": ["s4-2-1", "三平面", "方程組", "共線", "參數", "無限練習"],
        "usage": ["用前兩平面交線作核心，第三平面若要包含同一直線，方程式需為前兩式的線性組合。"],
        "examples": [],
        "tips": ["法向量做線性組合時，常數項也必須做同樣組合。"],
        "notes": [],
        "mistakes": ["只比較法向量，忘記檢查常數項是否同步。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-2-1-segment-projection-length-clean",
        "enabled": True,
        "mode": "generator",
        "title": "線段在平面上的正射影長",
        "generatorKey": "s4-2-1-segment-projection-length-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-2-1",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間中的平面與直線",
        "domain": "平面投影",
        "prompt": "",
        "answer": "",
        "tags": ["s4-2-1", "線段投影", "平面投影", "法向量", "無限練習"],
        "usage": ["將線段方向分解為平面內分量與法向量分量，投影長只取平面內分量長度。"],
        "examples": [],
        "tips": ["正射影不是把三個坐標各自刪掉，而是沿平面法向量壓到平面上。"],
        "notes": [],
        "mistakes": ["把原線段長誤當成投影長，沒有扣掉垂直平面的分量。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-2-2-two-plane-line-param-clean",
        "enabled": True,
        "mode": "generator",
        "title": "兩平面交線轉參數式",
        "generatorKey": "s4-2-2-two-plane-line-param-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-2-2",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間中的平面與直線",
        "domain": "空間直線",
        "prompt": "",
        "answer": "",
        "tags": ["s4-2-2", "兩平面交線", "參數式", "外積", "無限練習"],
        "usage": ["交線方向取兩平面法向量外積，再找一個共同點寫成直線參數式。"],
        "examples": [],
        "tips": ["交線方向不是兩個法向量相加，而是兩法向量外積。"],
        "notes": [],
        "mistakes": ["只解出一點，忘記還需要方向向量才能寫直線。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-2-2-coplanar-perpendicular-line-clean",
        "enabled": True,
        "mode": "generator",
        "title": "過點作共面垂直直線",
        "generatorKey": "s4-2-2-coplanar-perpendicular-line-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-2-2",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間中的平面與直線",
        "domain": "空間直線",
        "prompt": "",
        "answer": "",
        "tags": ["s4-2-2", "共面", "垂直直線", "垂足", "無限練習"],
        "usage": ["過外點與已知直線決定一平面，在此平面內作垂線，交點就是點到直線的垂足。"],
        "examples": [],
        "tips": ["空間中只說垂直不夠，還要用共面條件排除歪斜。"],
        "notes": [],
        "mistakes": ["把方向向量內積為 0 就當作兩直線一定相交。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-2-2-line-projection-on-plane-clean",
        "enabled": True,
        "mode": "generator",
        "title": "直線投影到平面",
        "generatorKey": "s4-2-2-line-projection-on-plane-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-2-2",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間中的平面與直線",
        "domain": "線面投影",
        "prompt": "",
        "answer": "",
        "tags": ["s4-2-2", "直線投影", "平面投影", "方向向量", "無限練習"],
        "usage": ["投影直線由一個投影點與投影後方向決定；方向向量要扣掉法向量分量。"],
        "examples": [],
        "tips": ["投影後直線的方向必須平行平面，因此要和法向量內積為 0。"],
        "notes": [],
        "mistakes": ["直接把原直線方向向量拿來當投影方向。"],
        "generatorBundle": "s4",
    },
]


def next_order(bindings, chapter_code):
    orders = [
        item.get("order", 0)
        for item in bindings
        if item.get("targetType") == "chapter" and item.get("targetId") == chapter_code
    ]
    return max(orders, default=0) + 1


def main():
    db = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    practices = db.setdefault("practices", [])
    bindings = db.setdefault("bindings", [])
    by_id = {item["id"]: item for item in practices}
    updated = 0

    for practice in NEW_PRACTICES:
        if practice["id"] in by_id:
            by_id[practice["id"]].update(practice)
        else:
            practices.append(practice)
        if not any(item.get("practiceId") == practice["id"] and item.get("targetId") == practice["chapterCode"] for item in bindings):
            bindings.append(
                {
                    "practiceId": practice["id"],
                    "targetType": "chapter",
                    "targetId": practice["chapterCode"],
                    "enabled": True,
                    "order": next_order(bindings, practice["chapterCode"]),
                }
            )
        updated += 1

    meta = db.setdefault("meta", {})
    meta["practiceCount"] = len(practices)
    meta["bindingCount"] = len(bindings)
    meta["totalPractices"] = len(practices)
    meta["totalBindings"] = len(bindings)
    meta["updatedAt"] = datetime.now(timezone.utc).isoformat()

    text = json.dumps(db, ensure_ascii=False, indent=2) + "\n"
    if "?" * 2 in text or "\ufffd" in text:
        raise SystemExit("refuse to write: detected possible mojibake marker")
    DB_PATH.write_text(text, encoding="utf-8")
    print(f"updated {updated} S4-2 Sanmin practices")


if __name__ == "__main__":
    main()
