import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


PRACTICES = [
    (
        "practice-s4-4-1-reciprocal-substitution",
        "s4-4-1",
        "倒數代換解三元方程組",
        "s4-4-1-reciprocal-substitution",
        "三元一次方程組與高斯消去法",
        "矩陣與方程組",
        ["倒數代換", "三元一次方程組", "高斯消去"],
        "將 1/x、1/y、1/z 設為新未知數，先解三元一次方程組，再取倒數回到原變數。",
    ),
    (
        "practice-s4-4-1-gaussian-basic",
        "s4-4-1",
        "高斯消去法與矩陣列運算",
        "s4-4-1-gaussian-basic",
        "三元一次方程組與高斯消去法",
        "矩陣與方程組",
        ["高斯消去", "增廣矩陣", "回代"],
        "用增廣矩陣與列運算解三元一次方程組，練習由列階梯形回代。",
    ),
    (
        "practice-s4-4-1-parameter-solutions",
        "s4-4-1",
        "含參數方程組的解數討論",
        "s4-4-1-parameter-solutions",
        "三元一次方程組與高斯消去法",
        "矩陣與方程組",
        ["參數", "解數討論", "方程組"],
        "判斷含參數三元方程組何時唯一解、無解或無限多解。",
    ),
    (
        "practice-s4-4-1-matrix-back-substitution",
        "s4-4-1",
        "增廣矩陣係數還原與回代",
        "s4-4-1-matrix-back-substitution",
        "三元一次方程組與高斯消去法",
        "矩陣與方程組",
        ["增廣矩陣", "回代", "係數還原"],
        "從列階梯形、常數欄或已知解反推矩陣中的未知量。",
    ),
    (
        "practice-s4-4-2-elementary-row-operations",
        "s4-4-2",
        "基本矩陣與列運算表示",
        "s4-4-2-elementary-row-operations",
        "矩陣的運算",
        "矩陣",
        ["基本矩陣", "列運算", "矩陣乘法"],
        "用左乘基本矩陣表示交換列、列倍加等列運算，並計算列運算後的矩陣。",
    ),
    (
        "practice-s4-4-2-algebraic-properties",
        "s4-4-2",
        "矩陣乘法運算性質驗證",
        "s4-4-2-algebraic-properties",
        "矩陣的運算",
        "矩陣",
        ["矩陣乘法", "不可交換", "消去律"],
        "用具體矩陣反例辨認矩陣乘法不可交換、零因子與不可任意消去。",
    ),
    (
        "practice-s4-4-2-det-properties",
        "s4-4-2",
        "行列式性質：純量倍、乘積與反矩陣",
        "s4-4-2-det-properties",
        "矩陣的運算",
        "矩陣",
        ["行列式", "純量倍", "乘積"],
        "練習 det(kA)、det(AB)、det(A^{-1}B) 等常用行列式性質。",
    ),
    (
        "practice-s4-4-2-similar-matrix",
        "s4-4-2",
        "相似矩陣 BAB^{-1} 的計算與性質",
        "s4-4-2-similar-matrix",
        "矩陣的運算",
        "矩陣",
        ["相似矩陣", "反矩陣", "行列式"],
        "計算 BAB^{-1}，並觀察相似矩陣的跡數與行列式不變。",
    ),
    (
        "practice-s4-4-3-inverse-existence",
        "s4-4-3",
        "反矩陣存在性與參數判定",
        "s4-4-3-inverse-existence",
        "反矩陣與轉移矩陣",
        "矩陣",
        ["反矩陣", "行列式", "參數"],
        "以行列式是否為 0 判斷二階矩陣反矩陣是否存在。",
    ),
    (
        "practice-s4-4-3-inverse-formula",
        "s4-4-3",
        "二階反矩陣公式計算",
        "s4-4-3-inverse-formula",
        "反矩陣與轉移矩陣",
        "矩陣",
        ["反矩陣公式", "二階矩陣"],
        "套用二階反矩陣公式，並處理對角矩陣、旋轉矩陣等特殊型。",
    ),
    (
        "practice-s4-4-3-inverse-polynomial",
        "s4-4-3",
        "反矩陣多項式降階表示",
        "s4-4-3-inverse-polynomial",
        "反矩陣與轉移矩陣",
        "矩陣",
        ["反矩陣", "矩陣多項式", "降階"],
        "由 A 滿足的二次關係式，把 A^{-1} 表示成 A 與 I 的線性組合。",
    ),
    (
        "practice-s4-4-3-transition-properties",
        "s4-4-3",
        "轉移矩陣的欄和與性質判定",
        "s4-4-3-transition-properties",
        "反矩陣與轉移矩陣",
        "矩陣",
        ["轉移矩陣", "欄和", "性質判定"],
        "判斷矩陣是否為轉移矩陣，並練習轉移矩陣乘積仍為轉移矩陣的模型。",
    ),
    (
        "practice-s4-4-4-line-transform",
        "s4-4-4",
        "直線在線性變換下的像方程",
        "s4-4-4-line-transform",
        "平面上的線性變換",
        "矩陣與幾何",
        ["線性變換", "直線方程", "反代入"],
        "用反變換代回原方程，求直線經伸縮、推移或旋轉後的新方程式。",
    ),
    (
        "practice-s4-4-4-matrix-solving",
        "s4-4-4",
        "由像點求變換矩陣",
        "s4-4-4-matrix-solving",
        "平面上的線性變換",
        "矩陣與幾何",
        ["線性變換", "像點", "矩陣求解"],
        "由兩個基準點或像點資料，反推二階線性變換矩陣或原像座標。",
    ),
    (
        "practice-s4-4-4-rotation-reflection",
        "s4-4-4",
        "旋轉與鏡射的基本矩陣",
        "s4-4-4-rotation-reflection",
        "平面上的線性變換",
        "矩陣與幾何",
        ["旋轉", "鏡射", "座標變換"],
        "練習 90 度旋轉、對 y=x 鏡射與標準旋轉矩陣的座標效果。",
    ),
    (
        "practice-s4-4-4-area-scaling",
        "s4-4-4",
        "面積倍率與行列式",
        "s4-4-4-area-scaling",
        "平面上的線性變換",
        "矩陣與幾何",
        ["面積倍率", "行列式", "線性變換"],
        "用 |det(A)| 判斷線性變換後圖形面積的放大倍數。",
    ),
]


def make_practice(row):
    practice_id, chapter_code, title, generator_key, chapter, domain, tags, description = row
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
        "tips": ["此小類以同一解題模型換參數產生題目，避免只重排固定題目。"],
        "notes": [],
        "mistakes": ["常見錯誤是把數字運算規則直接套到矩陣上，或忘記矩陣乘法有左右順序。"],
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
    if "??" in text or "\ufffd" in text:
        raise SystemExit("refuse to write: detected possible mojibake marker")
    DB_PATH.write_text(text, encoding="utf-8")
    print(f"updated practices={len(practices)} bindings={len(bindings)}")


if __name__ == "__main__":
    main()
