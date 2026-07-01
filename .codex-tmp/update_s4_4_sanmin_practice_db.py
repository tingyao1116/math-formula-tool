import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


PRACTICES = [
    (
        "practice-s4-4-1-matrix-entry-double-sum-clean",
        "s4-4-1",
        "矩陣元素公式與二重和計算",
        "s4-4-1-matrix-entry-double-sum-clean",
        "矩陣與線性方程組",
        "矩陣",
        ["矩陣元素", "二重和", "矩陣記號"],
        "由 a_ij 的公式代入指定位置或拆開二重和，訓練矩陣元素記號與求和結構。",
        "常見錯誤是把 i、j 的範圍混在一起，或忘記常數項會出現 m×n 次。",
    ),
    (
        "practice-s4-4-2-commutator-parameter-clean",
        "s4-4-2",
        "矩陣平方公式與可交換參數",
        "s4-4-2-commutator-parameter-clean",
        "矩陣的運算",
        "矩陣",
        ["矩陣乘法", "可交換", "參數"],
        "利用 (A+B)^2=A^2+2AB+B^2 等價於 AB=BA，從指定元素比較求參數。",
        "常見錯誤是直接套用數的平方公式，忽略矩陣乘法通常不可交換。",
    ),
    (
        "practice-s4-4-2-rank-one-power-sum-clean",
        "s4-4-2",
        "秩一矩陣高次方與等比和",
        "s4-4-2-rank-one-power-sum-clean",
        "矩陣的運算",
        "矩陣",
        ["矩陣高次方", "秩一矩陣", "等比級數"],
        "把 A 寫成欄向量乘列向量，利用 A^2=λA 推出高次方與連加和。",
        "常見錯誤是每次都硬乘矩陣，沒有先抓到 A^2 是 A 的倍數。",
    ),
    (
        "practice-s4-4-3-power-recovery-clean",
        "s4-4-3",
        "由矩陣高次方反推低次方",
        "s4-4-3-power-recovery-clean",
        "反矩陣與轉移矩陣",
        "矩陣",
        ["矩陣次方", "反矩陣", "對角矩陣"],
        "由 A^m、A^n 的資訊，使用 A^n(A^m)^{-1} 或對角元素次方關係反推低次方。",
        "常見錯誤是把矩陣次方相除寫成一般除法，沒有改用反矩陣。",
    ),
    (
        "practice-s4-4-3-matrix-code-decode-clean",
        "s4-4-3",
        "反矩陣應用：矩陣編碼解碼",
        "s4-4-3-matrix-code-decode-clean",
        "反矩陣與轉移矩陣",
        "矩陣",
        ["反矩陣", "矩陣方程", "編碼解碼"],
        "把密文 C=KP 還原成 P=K^{-1}C，練習反矩陣在編碼解碼中的應用。",
        "常見錯誤是左右乘順序顛倒，或把 C=KP 誤移成 P=CK^{-1}。",
    ),
    (
        "practice-s4-4-4-coordinate-rotation-clean",
        "s4-4-4",
        "坐標軸旋轉與新舊坐標換算",
        "s4-4-4-coordinate-rotation-clean",
        "平面上的線性變換",
        "矩陣與幾何",
        ["坐標軸旋轉", "新舊坐標", "線性變換"],
        "處理坐標軸旋轉 45 度的新舊坐標換算，特別區分旋轉坐標軸與旋轉點。",
        "常見錯誤是把坐標軸旋轉當成點本身旋轉，導致正負號相反。",
    ),
    (
        "practice-s4-4-4-line-stretch-parameter-clean",
        "s4-4-4",
        "伸縮推移下的直線像方程",
        "s4-4-4-line-stretch-parameter-clean",
        "平面上的線性變換",
        "矩陣與幾何",
        ["直線像方程", "伸縮", "推移"],
        "用反代入法求直線經對角伸縮或剪切推移後的像方程。",
        "常見錯誤是把新坐標直接代成舊坐標，沒有先寫出反向關係。",
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
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": chapter,
        "domain": domain,
        "prompt": "",
        "answer": "",
        "tags": [chapter_code, *tags, "無限練習"],
        "usage": [],
        "examples": [],
        "tips": ["此小類會更換矩陣元素、參數或變換資料，核心計算方法固定但題目不只是重排。"],
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
