import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    {
        "id": "practice-s2-3-1-mean-median-missing-score-parameterized",
        "enabled": True,
        "mode": "generator",
        "title": "平均數等於中位數反推缺值",
        "generatorKey": "s2-3-1-mean-median-missing-score-parameterized",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s2-3-1",
        "stage": "高中",
        "grade": "高一",
        "term": "下學期",
        "chapter": "數據分析",
        "domain": "統計",
        "prompt": "",
        "answer": "",
        "tags": ["s2-3-1", "平均數", "中位數", "缺值", "無限練習"],
        "usage": ["先利用題目條件固定中位數位置，再令平均數等於中位數建立方程式。"],
        "examples": [],
        "tips": ["平均數會受每一筆資料影響；中位數要先看排序位置。"],
        "notes": [],
        "mistakes": ["未先判斷 x 的排序位置，就直接把已知資料的中間數當中位數。"],
        "generatorBundle": "s2",
    },
    {
        "id": "practice-s2-3-1-bounded-variance-max-parameterized",
        "enabled": True,
        "mode": "generator",
        "title": "範圍限制下的最大變異數",
        "generatorKey": "s2-3-1-bounded-variance-max-parameterized",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s2-3-1",
        "stage": "高中",
        "grade": "高一",
        "term": "下學期",
        "chapter": "數據分析",
        "domain": "統計",
        "prompt": "",
        "answer": "",
        "tags": ["s2-3-1", "變異數", "最大值", "資料分散", "無限練習"],
        "usage": ["固定平均且有上下界時，變異數最大發生在資料盡量集中到兩端。"],
        "examples": [],
        "tips": ["當平均數是上下界中點，兩端各放一半資料最分散。"],
        "notes": [],
        "mistakes": ["把最大變異數誤認為出現在資料平均分布於整段範圍。"],
        "generatorBundle": "s2",
    },
    {
        "id": "practice-s2-3-1-delete-equal-high-values-parameterized",
        "enabled": True,
        "mode": "generator",
        "title": "刪除兩筆資料後重算平均與標準差",
        "generatorKey": "s2-3-1-delete-equal-high-values-parameterized",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s2-3-1",
        "stage": "高中",
        "grade": "高一",
        "term": "下學期",
        "chapter": "數據分析",
        "domain": "統計",
        "prompt": "",
        "answer": "",
        "tags": ["s2-3-1", "平均數", "標準差", "刪除資料", "無限練習"],
        "usage": ["由原平均與標準差先還原總和與平方和，再扣掉刪除資料。"],
        "examples": [],
        "tips": ["標準差題常要先轉成平方和，刪資料後再重新除以新的筆數。"],
        "notes": [],
        "mistakes": ["只把平均數重新計算，忘記標準差也要用新的平方和與新的平均數。"],
        "generatorBundle": "s2",
    },
    {
        "id": "practice-s2-3-2-perfect-line-correlation-parameterized",
        "enabled": True,
        "mode": "generator",
        "title": "完全線性相關的相關係數判定",
        "generatorKey": "s2-3-2-perfect-line-correlation-parameterized",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s2-3-2",
        "stage": "高中",
        "grade": "高一",
        "term": "下學期",
        "chapter": "數據分析",
        "domain": "相關與迴歸",
        "prompt": "",
        "answer": "",
        "tags": ["s2-3-2", "相關係數", "完全相關", "散布圖", "無限練習"],
        "usage": ["資料點完全落在非水平直線上時，只看斜率正負決定 r=1 或 r=-1。"],
        "examples": [],
        "tips": ["相關係數不是迴歸線斜率；完全共線時相關係數只能是 1 或 -1。"],
        "notes": [],
        "mistakes": ["把直線斜率直接當成相關係數。"],
        "generatorBundle": "s2",
    },
    {
        "id": "practice-s2-3-2-regression-line-prediction-parameterized",
        "enabled": True,
        "mode": "generator",
        "title": "由迴歸直線預測與解讀斜率",
        "generatorKey": "s2-3-2-regression-line-prediction-parameterized",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s2-3-2",
        "stage": "高中",
        "grade": "高一",
        "term": "下學期",
        "chapter": "數據分析",
        "domain": "相關與迴歸",
        "prompt": "",
        "answer": "",
        "tags": ["s2-3-2", "迴歸直線", "預測", "斜率", "無限練習"],
        "usage": ["代入 x 得預測值，並用斜率說明 x 每增加 1 單位時 y 的預測改變量。"],
        "examples": [],
        "tips": ["迴歸線上的值是預測值，不是每一筆資料的真實值。"],
        "notes": [],
        "mistakes": ["把迴歸線預測值誤解成必然實測值。"],
        "generatorBundle": "s2",
    },
    {
        "id": "practice-s2-3-2-standardized-regression-parameterized",
        "enabled": True,
        "mode": "generator",
        "title": "標準化後的迴歸直線",
        "generatorKey": "s2-3-2-standardized-regression-parameterized",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s2-3-2",
        "stage": "高中",
        "grade": "高一",
        "term": "下學期",
        "chapter": "數據分析",
        "domain": "相關與迴歸",
        "prompt": "",
        "answer": "",
        "tags": ["s2-3-2", "標準化", "迴歸直線", "相關係數", "無限練習"],
        "usage": ["標準化後平均為 0、標準差為 1，因此迴歸線為 Y'=rX'。"],
        "examples": [],
        "tips": ["標準化不改變相關係數，但會把迴歸線斜率化成 r。"],
        "notes": [],
        "mistakes": ["仍用原本的標準差比例去算標準化後的斜率。"],
        "generatorBundle": "s2",
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
