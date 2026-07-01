import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


NEW_PRACTICES = [
    (
        "practice-s4-3-1-complement-conditional",
        "s4-3-1",
        "補事件條件機率 P(A|B^c) 與 P(B|A^c)",
        "s4-3-1-complement-conditional",
        "條件機率與貝氏定理",
        ["條件機率", "補事件", "聯集公式"],
        "利用 P(A|B^c)、P(B|A^c)、P(A^c|B^c) 等形式，把分母換成補事件後重新計算條件機率。",
    ),
    (
        "practice-s4-3-1-total-prob-abstract",
        "s4-3-1",
        "全機率公式抽象樹形",
        "s4-3-1-total-prob-abstract",
        "條件機率與貝氏定理",
        ["全機率公式", "樹狀圖", "貝氏定理"],
        "給定 P(A)、P(B|A)、P(B|A^c) 等資料，練習先用全機率公式求總機率，再視題意反推來源。",
    ),
    (
        "practice-s4-3-2-inverse-bayes",
        "s4-3-2",
        "逆向 Bayes：已知 P(A|B) 求 P(B|A)",
        "s4-3-2-inverse-bayes",
        "獨立事件與重複試驗",
        ["條件機率", "乘法定理", "反向條件"],
        "從 P(A|B)、P(B)、P(A) 或補事件條件資料出發，用乘法定理轉換方向。",
    ),
    (
        "practice-s4-3-2-exam-guessing",
        "s4-3-2",
        "考試猜題 Bayes 模型",
        "s4-3-2-exam-guessing",
        "獨立事件與重複試驗",
        ["貝氏定理", "猜題模型", "條件反推"],
        "以會做必對、不會隨機猜的選擇題情境，練習答對後反推真正會做或猜對的機率。",
    ),
]


def make_practice(row):
    practice_id, chapter_code, title, generator_key, chapter, tags, description = row
    return {
        "id": practice_id,
        "enabled": True,
        "mode": "generator",
        "title": title,
        "generatorKey": generator_key,
        "description": description,
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 0,
        "relatedPracticeIds": [],
        "chapterCode": chapter_code,
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": chapter,
        "domain": "機率",
        "prompt": "",
        "answer": "",
        "tags": [chapter_code, *tags, "無限練習"],
        "usage": [],
        "examples": [],
        "tips": ["此小類以同一解題模型換參數產生題目，避免只重排固定題目。"],
        "notes": [],
        "mistakes": ["常見錯誤是只看題目中的單一百分比，忘記條件機率的分母已經換成已知事件。"],
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
