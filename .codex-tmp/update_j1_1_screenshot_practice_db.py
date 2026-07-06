import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


PRACTICES = [
    (
        "practice-j1-1-1-coordinate-scale-origin-inference-clean",
        "j1-1-1",
        "已知新舊坐標反推原點與固定點",
        "j1-1-1-coordinate-scale-origin-inference-clean",
        "數線與絕對值",
        "數與量",
        ["數線", "坐標變換", "新原點", "單位長"],
        "由新舊坐標與單位長倍率反推新原點、原坐標，並判斷轉換前後坐標不變的點。",
        "常見錯誤是把新坐標直接加減原點，忘記還要乘上新單位長倍率。",
    ),
    (
        "practice-j1-1-1-absolute-interval-simplify-clean",
        "j1-1-1",
        "給定範圍的絕對值化簡",
        "j1-1-1-absolute-interval-simplify-clean",
        "數線與絕對值",
        "數與量",
        ["絕對值", "範圍判斷", "化簡"],
        "先利用變數所在範圍判斷絕對值內部正負，再進行化簡或代入求值。",
        "常見錯誤是看到絕對值就直接把符號拿掉，沒有先判斷內部式子的正負。",
    ),
    (
        "practice-j1-1-1-absolute-equation-count-clean",
        "j1-1-1",
        "絕對值方程與整數解個數",
        "j1-1-1-absolute-equation-count-clean",
        "數線與絕對值",
        "數與量",
        ["絕對值方程", "距離", "整數解"],
        "用距離觀點處理絕對值方程，包含兩解、無解與線段內整數解個數。",
        "常見錯誤是忽略絕對值不可能等於負數，或漏掉左右兩側的解。",
    ),
    (
        "practice-j1-1-1-midpoint-ratio-nested-clean",
        "j1-1-1",
        "連續中點與比例點反推",
        "j1-1-1-midpoint-ratio-nested-clean",
        "數線與絕對值",
        "數與量",
        ["中點", "比例點", "距離"],
        "把中點、連續中點、比例點與平移後中點放在同一條數線思路中練習。",
        "常見錯誤是把比例 AC=2CB 當成 C 是中點，沒有注意左右兩段長度不同。",
    ),
    (
        "practice-j1-1-3-common-base-conversion-clean",
        "j1-1-3",
        "不同底數先轉同底數",
        "j1-1-3-common-base-conversion-clean",
        "指數律",
        "數與量",
        ["指數律", "同底數", "底數轉換"],
        "把 4、8、9、27 等先改寫成共同底數，再做指數加減或大小比較。",
        "常見錯誤是沒有先轉底數，就直接把不同底數的指數相加減。",
    ),
    (
        "practice-j1-1-3-common-base-equation-clean",
        "j1-1-3",
        "轉同底數解指數方程",
        "j1-1-3-common-base-equation-clean",
        "指數律",
        "數與量",
        ["指數方程", "同底數", "指數律"],
        "把等式兩邊轉成同底數，利用同底數同值時指數相等來解未知數。",
        "常見錯誤是只把底數改寫，卻忘記次方也要乘進去。",
    ),
    (
        "practice-j1-1-4-scientific-trap-compare-clean",
        "j1-1-4",
        "科學記號加減比較陷阱",
        "j1-1-4-scientific-trap-compare-clean",
        "科學記號",
        "數與量",
        ["科學記號", "加減", "比較"],
        "先統一 10 的次方再合併係數，處理科學記號加減、比較與倍數關係。",
        "常見錯誤是加減時只看係數，沒有先把 10 的次方調成相同。",
    ),
    (
        "practice-j1-1-4-scientific-unit-stack-clean",
        "j1-1-4",
        "科學記號單位換算堆疊題",
        "j1-1-4-scientific-unit-stack-clean",
        "科學記號",
        "數與量",
        ["科學記號", "單位換算", "乘法"],
        "把厚度、片數等情境量相乘後，再做毫米與公分等單位換算。",
        "常見錯誤是忘記最後單位換算要再除以 10，或把指數加減方向弄反。",
    ),
]


def make_practice(row):
    practice_id, chapter_code, title, generator_key, chapter, domain, tags, description, mistake = row
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
        "stage": "國中",
        "grade": "七年級",
        "term": "上學期",
        "chapter": chapter,
        "domain": domain,
        "prompt": "",
        "answer": "",
        "tags": [chapter_code, *tags, "無限練習"],
        "usage": [],
        "examples": [],
        "tips": ["此小類會更換數線位置、倍率、指數或科學記號參數，核心方法固定但題目不是只重排。"],
        "notes": [],
        "mistakes": [mistake],
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

    ids = {row[0] for row in PRACTICES}
    practices[:] = [row for row in practices if row.get("id") not in ids]
    practices.extend(make_practice(row) for row in PRACTICES)

    binding_keys = {(practice_id, "chapter", chapter_code) for practice_id, chapter_code, *_ in PRACTICES}
    bindings[:] = [
        row
        for row in bindings
        if (row.get("practiceId"), str(row.get("targetType", "")).lower(), row.get("targetId")) not in binding_keys
    ]

    next_order = next_orders_by_chapter(bindings, {row[1] for row in PRACTICES})
    for practice_id, chapter_code, *_ in PRACTICES:
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
    if ("?" * 2) in text or "\ufffd" in text:
        raise SystemExit("refuse to write: detected possible mojibake marker")
    DB_PATH.write_text(text, encoding="utf-8")
    print(f"updated practices={len(practices)} bindings={len(bindings)}")


if __name__ == "__main__":
    main()
