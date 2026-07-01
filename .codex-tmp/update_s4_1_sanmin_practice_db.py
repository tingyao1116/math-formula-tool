import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    {
        "id": "practice-s4-1-1-cube-face-center-octahedron-volume-clean",
        "enabled": True,
        "mode": "generator",
        "title": "立方體面心正八面體體積",
        "generatorKey": "s4-1-1-cube-face-center-octahedron-volume-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-1-1",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間向量",
        "domain": "空間幾何",
        "prompt": "",
        "answer": "",
        "tags": ["s4-1-1", "立方體", "正八面體", "體積", "無限練習"],
        "usage": ["正立方體六個面心形成的正八面體體積為立方體體積的六分之一。"],
        "examples": [],
        "tips": ["不要把面心正八面體的邊長誤當成立方體邊長。"],
        "notes": [],
        "mistakes": ["只看圖形相似，沒有先確認兩者體積倍率。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-1-2-axis-equidistant-point-clean",
        "enabled": True,
        "mode": "generator",
        "title": "坐標軸上等距點",
        "generatorKey": "s4-1-2-axis-equidistant-point-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-1-2",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間向量",
        "domain": "空間坐標",
        "prompt": "",
        "answer": "",
        "tags": ["s4-1-2", "坐標軸", "等距離", "距離公式", "無限練習"],
        "usage": ["將軸上動點設為單一參數，再用距離平方相等解一次方程。"],
        "examples": [],
        "tips": ["用距離平方即可，通常不必開根號。"],
        "notes": [],
        "mistakes": ["把 P 在 z 軸上誤設為 (x,y,z)，導致多出不必要未知數。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-1-2-centroid-plane-projection-clean",
        "enabled": True,
        "mode": "generator",
        "title": "重心投影到坐標平面",
        "generatorKey": "s4-1-2-centroid-plane-projection-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-1-2",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間向量",
        "domain": "空間坐標",
        "prompt": "",
        "answer": "",
        "tags": ["s4-1-2", "重心", "坐標平面投影", "三點平均", "無限練習"],
        "usage": ["先求原三角形重心，再將此點投影到三個坐標平面並取新重心。"],
        "examples": [],
        "tips": ["投影到坐標平面就是把垂直該平面的坐標改成 0。"],
        "notes": [],
        "mistakes": ["直接把原三角形重心當成投影三角形的重心。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-1-3-angle-bisector-coefficient-clean",
        "enabled": True,
        "mode": "generator",
        "title": "角平分向量係數反推",
        "generatorKey": "s4-1-3-angle-bisector-coefficient-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-1-3",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間向量",
        "domain": "內積與夾角",
        "prompt": "",
        "answer": "",
        "tags": ["s4-1-3", "角平分", "單位向量", "係數", "無限練習"],
        "usage": ["角平分方向為兩個單位方向向量和，係數比由兩向量長度比決定。"],
        "examples": [],
        "tips": ["角平分不能直接用 OA+OB，除非兩向量長度相同。"],
        "notes": [],
        "mistakes": ["忘記先單位化，直接把原向量相加。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-1-3-linear-over-norm-extrema-clean",
        "enabled": True,
        "mode": "generator",
        "title": "一次式除以向量長度的最大最小",
        "generatorKey": "s4-1-3-linear-over-norm-extrema-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-1-3",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間向量",
        "domain": "內積與柯西不等式",
        "prompt": "",
        "answer": "",
        "tags": ["s4-1-3", "柯西不等式", "最大值", "最小值", "無限練習"],
        "usage": ["把分子視為固定向量與 (x,y,z) 的內積，再除以 |(x,y,z)|。"],
        "examples": [],
        "tips": ["最大值是係數向量長度，不是係數和。"],
        "notes": [],
        "mistakes": ["把分母誤當成 x+y+z，或忘記最小值是負的同長度。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-1-3-pairwise-orthogonal-parameter-clean",
        "enabled": True,
        "mode": "generator",
        "title": "三向量兩兩垂直參數",
        "generatorKey": "s4-1-3-pairwise-orthogonal-parameter-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-1-3",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "空間向量",
        "domain": "內積與垂直",
        "prompt": "",
        "answer": "",
        "tags": ["s4-1-3", "兩兩垂直", "內積", "參數", "無限練習"],
        "usage": ["三向量兩兩垂直代表三個內積同時為 0，找共同參數解。"],
        "examples": [],
        "tips": ["至少要檢查三組內積，不是只檢查其中一組。"],
        "notes": [],
        "mistakes": ["只解出一個內積為 0 的 k，就誤以為三向量已兩兩垂直。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-1-4-consecutive-row-determinant-clean",
        "enabled": True,
        "mode": "generator",
        "title": "連續型三階行列式化簡",
        "generatorKey": "s4-1-4-consecutive-row-determinant-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-1-4",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "外積與行列式",
        "domain": "空間向量",
        "prompt": "",
        "answer": "",
        "tags": ["s4-1-4", "三階行列式", "列運算", "無限練習"],
        "usage": ["連續型行列式先做列差，可把大數化成小數再計算。"],
        "examples": [],
        "tips": ["看到連續數字，不要急著展開，先做列運算。"],
        "notes": [],
        "mistakes": ["直接展開大數行列式，容易算錯且看不出結構。"],
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
    db = json.loads(DB_PATH.read_text(encoding="utf-8"))
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

    DB_PATH.write_text(json.dumps(db, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"updated {updated} practices")


if __name__ == "__main__":
    main()
