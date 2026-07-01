import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    {
        "id": "practice-s4-3-1-drawer-paradox-clean",
        "enabled": True,
        "mode": "generator",
        "title": "抽屜與雙面卡片的條件樣本空間",
        "generatorKey": "s4-3-1-drawer-paradox-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-3-1",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "條件機率與貝氏定理",
        "domain": "條件機率",
        "prompt": "",
        "answer": "",
        "tags": ["s4-3-1", "條件樣本空間", "抽屜問題", "雙面卡片", "無限練習"],
        "usage": ["已知看到某結果後，樣本空間應改成可能被看到的面或抽屜，而不是原物件數。"],
        "examples": [],
        "tips": ["雙金桌有兩個可被看到的金抽屜，不能只算一張桌子。"],
        "notes": [],
        "mistakes": ["把條件樣本空間誤當成桌子或卡片本身，忽略可觀察面的倍數。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-3-1-lost-card-bayes-clean",
        "enabled": True,
        "mode": "generator",
        "title": "遺失牌與觀察結果的貝氏反推",
        "generatorKey": "s4-3-1-lost-card-bayes-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-3-1",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "條件機率與貝氏定理",
        "domain": "貝氏定理",
        "prompt": "",
        "answer": "",
        "tags": ["s4-3-1", "遺失牌", "貝氏定理", "組合數", "無限練習"],
        "usage": ["比較遺失目標牌與遺失非目標牌兩種來源造成同一觀察結果的權重。"],
        "examples": [],
        "tips": ["觀察到抽出的牌都是指定點數，不代表遺失牌較可能也是指定點數。"],
        "notes": [],
        "mistakes": ["只看剩餘牌中指定點數的張數，沒有乘上遺失牌來源的先驗數量。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-3-1-truth-report-color-clean",
        "enabled": True,
        "mode": "generator",
        "title": "證詞可靠度與球色反推",
        "generatorKey": "s4-3-1-truth-report-color-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-3-1",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "條件機率與貝氏定理",
        "domain": "貝氏定理",
        "prompt": "",
        "answer": "",
        "tags": ["s4-3-1", "說實話", "說謊", "球色", "貝氏定理", "無限練習"],
        "usage": ["將證詞視為觀察結果，分別計算真實顏色造成此證詞的權重。"],
        "examples": [],
        "tips": ["說謊機率若已給，先換成說實話機率或說錯機率，再列式。"],
        "notes": [],
        "mistakes": ["只用箱中球的比例，沒有乘上兩個人的證詞可靠度。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-3-1-signal-channel-bayes-clean",
        "enabled": True,
        "mode": "generator",
        "title": "通訊誤碼與原訊號反推",
        "generatorKey": "s4-3-1-signal-channel-bayes-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-3-1",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "條件機率與貝氏定理",
        "domain": "全機率與貝氏定理",
        "prompt": "",
        "answer": "",
        "tags": ["s4-3-1", "通訊誤碼", "全機率", "貝氏定理", "無限練習"],
        "usage": ["收到同一符號可能來自多個原訊號，先用全機率加總，再反推來源。"],
        "examples": [],
        "tips": ["收到星號或錯碼仍然是有資訊的條件事件。"],
        "notes": [],
        "mistakes": ["看到收到 0 就直接判定原訊號為 0，忽略 1 誤收為 0 的來源。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-3-2-conditioned-success-position-clean",
        "enabled": True,
        "mode": "generator",
        "title": "已知成功總數下的位置機率",
        "generatorKey": "s4-3-2-conditioned-success-position-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-3-2",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "條件機率與貝氏定理",
        "domain": "獨立試驗",
        "prompt": "",
        "answer": "",
        "tags": ["s4-3-2", "條件機率", "位置對稱", "成功總數", "無限練習"],
        "usage": ["在已知成功總數後，各位置對稱，指定位置成功的機率為成功數除以總次數。"],
        "examples": [],
        "tips": ["條件固定總成功數後，不需要回頭重算每一種原始機率。"],
        "notes": [],
        "mistakes": ["仍用單次成功率作答，忘記題目已經給定總成功數。"],
        "generatorBundle": "s4",
    },
    {
        "id": "practice-s4-3-2-traffic-light-counts-clean",
        "enabled": True,
        "mode": "generator",
        "title": "紅綠燈獨立事件與恰遇次數",
        "generatorKey": "s4-3-2-traffic-light-counts-clean",
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": "s4-3-2",
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "條件機率與貝氏定理",
        "domain": "獨立事件",
        "prompt": "",
        "answer": "",
        "tags": ["s4-3-2", "紅綠燈", "獨立事件", "恰好次數", "無限練習"],
        "usage": ["三個獨立事件成功率不同時，恰好幾次需列所有位置組合相加。"],
        "examples": [],
        "tips": ["各紅綠燈秒數不同時，不要直接套同一成功率的二項公式。"],
        "notes": [],
        "mistakes": ["把三處紅綠燈誤當成相同機率，導致組合數乘單一項。"],
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
    print(f"updated {updated} S4-3 Sanmin practices")


if __name__ == "__main__":
    main()
