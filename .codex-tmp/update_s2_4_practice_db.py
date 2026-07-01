from datetime import datetime, timezone
from pathlib import Path
import json
import sys


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


def practice(pid, title, generator_key, chapter_code, tags, usage, tips, mistakes):
    return {
        "id": pid,
        "enabled": True,
        "mode": "generator",
        "title": title,
        "generatorKey": generator_key,
        "difficulty": "medium",
        "questionCount": 5,
        "subtypeCount": 1,
        "relatedPracticeIds": [],
        "chapterCode": chapter_code,
        "stage": "高中",
        "grade": "高二",
        "term": "下學期",
        "chapter": "三角比",
        "domain": "三角比",
        "prompt": "",
        "answer": "",
        "tags": tags + ["無限練習"],
        "usage": usage,
        "examples": [],
        "tips": tips,
        "notes": [],
        "mistakes": mistakes,
        "generatorBundle": "s2",
    }


NEW_PRACTICES = [
    practice(
        "practice-s2-4-1-tangent-ordering-parameterized",
        "正切值象限判斷與大小排列",
        "s2-4-1-tangent-ordering-parameterized",
        "s2-4-1",
        ["s2-4-1", "正切", "象限", "大小比較"],
        ["適合練習先判斷正負號，再比較特殊角正切值大小。"],
        ["正切在第二、第四象限為負，第三象限為正，不能只看角度大小。"],
        ["常見錯誤是把正切值當成隨角度一路增加，忘記不同象限會跨過無定義點。"],
    ),
    practice(
        "practice-s2-4-1-sin-cos-sum-difference-parameterized",
        "正弦餘弦和差反推與乘積",
        "s2-4-1-sin-cos-sum-difference-parameterized",
        "s2-4-1",
        ["s2-4-1", "正弦", "餘弦", "和差平方"],
        ["適合練習用平方恆等式由 sinθ±cosθ 反推 sinθcosθ。"],
        ["先用公式求乘積，再用象限決定 sinθ、cosθ 的正負。"],
        ["常見錯誤是把 (sinθ+cosθ)^2 展開成 1+sinθcosθ，漏掉係數 2。"],
    ),
    practice(
        "practice-s2-4-1-tangent-expression-parameterized",
        "已知正切值化簡正餘弦分式",
        "s2-4-1-tangent-expression-parameterized",
        "s2-4-1",
        ["s2-4-1", "正切", "分式化簡", "象限"],
        ["適合練習把含 sinθ、cosθ 的分式同除以 cosθ，改用 tanθ 計算。"],
        ["若題目只給 tanθ，通常要把式子整理成 tanθ 的有理式。"],
        ["常見錯誤是直接假設 sinθ、cosθ 都是正數，忽略題目給的象限。"],
    ),
    practice(
        "practice-s2-4-2-side-sum-ratio-sine-ratio-parameterized",
        "邊長和比例反推正弦比例",
        "s2-4-2-side-sum-ratio-sine-ratio-parameterized",
        "s2-4-2",
        ["s2-4-2", "正弦定理", "邊長比例", "比例反推"],
        ["適合練習由 (a+b):(b+c):(c+a) 反推出 a:b:c，再套正弦定理。"],
        ["先把三個和相加減還原單邊比例，再用 sinA:sinB:sinC=a:b:c。"],
        ["常見錯誤是直接把邊長和比例當成邊長比例。"],
    ),
    practice(
        "practice-s2-4-2-sas-side-area-parameterized",
        "兩邊夾角求第三邊與面積",
        "s2-4-2-sas-side-area-parameterized",
        "s2-4-2",
        ["s2-4-2", "餘弦定理", "面積公式", "兩邊夾角"],
        ["適合練習同一組條件下同時使用餘弦定理與 K=1/2bc sinA。"],
        ["求第三邊用餘弦定理，求面積用兩邊夾角公式，兩者不要混用。"],
        ["常見錯誤是面積公式忘記乘 1/2，或餘弦定理最後一項符號寫錯。"],
    ),
    practice(
        "practice-s2-4-2-isosceles-circumradius-parameterized",
        "等腰三角形外接圓半徑求底邊與面積",
        "s2-4-2-isosceles-circumradius-parameterized",
        "s2-4-2",
        ["s2-4-2", "正弦定理", "外接圓半徑", "等腰三角形"],
        ["適合練習 a=2R sinA 與等腰三角形的角邊關係。"],
        ["底邊對頂角，腰長對底角；先辨認哪一邊對哪一角。"],
        ["常見錯誤是把外接圓半徑 R 誤當成邊長，漏掉 2R。"],
    ),
    practice(
        "practice-s2-4-3-two-observation-height-parameterized",
        "兩次仰角觀測求高度",
        "s2-4-3-two-observation-height-parameterized",
        "s2-4-3",
        ["s2-4-3", "仰角", "測量", "高度"],
        ["適合練習同一直線上兩次觀測，建立 h=x tanα=(x-d)tanβ。"],
        ["先畫出遠點距離 x，前進後距離變成 x-d，再列等高關係。"],
        ["常見錯誤是把前進距離直接當成建築物底部距離。"],
    ),
    practice(
        "practice-s2-4-3-bearing-cosine-distance-parameterized",
        "方位夾角與餘弦定理求距離",
        "s2-4-3-bearing-cosine-distance-parameterized",
        "s2-4-3",
        ["s2-4-3", "方位", "餘弦定理", "距離"],
        ["適合練習兩個目標與觀測點形成夾角時，用餘弦定理求兩目標距離。"],
        ["把方位或觀測角轉成 ∠AOB，再套 AB²=OA²+OB²-2OA·OB cos∠AOB。"],
        ["常見錯誤是把兩段觀測距離直接相加或相減，沒有使用夾角。"],
    ),
    practice(
        "practice-s2-4-3-height-limit-floors-parameterized",
        "仰角限制求建築樓層上限",
        "s2-4-3-height-limit-floors-parameterized",
        "s2-4-3",
        ["s2-4-3", "仰角", "生活應用", "樓層上限"],
        ["適合練習用高度=水平距離×tanθ，再取不超過限制的整數樓層。"],
        ["注意公里要先換成公尺，最後樓層數要取小於等於的整數。"],
        ["常見錯誤是四捨五入樓層，實際上題目問最多可蓋，必須無條件捨去。"],
    ),
]


NEW_BINDINGS = [
    ("practice-s2-4-1-tangent-ordering-parameterized", "s2-4-1", 4),
    ("practice-s2-4-1-sin-cos-sum-difference-parameterized", "s2-4-1", 5),
    ("practice-s2-4-1-tangent-expression-parameterized", "s2-4-1", 6),
    ("practice-s2-4-2-side-sum-ratio-sine-ratio-parameterized", "s2-4-2", 783),
    ("practice-s2-4-2-sas-side-area-parameterized", "s2-4-2", 784),
    ("practice-s2-4-2-isosceles-circumradius-parameterized", "s2-4-2", 785),
    ("practice-s2-4-3-two-observation-height-parameterized", "s2-4-3", 5),
    ("practice-s2-4-3-bearing-cosine-distance-parameterized", "s2-4-3", 6),
    ("practice-s2-4-3-height-limit-floors-parameterized", "s2-4-3", 7),
]


def upsert_practice(practices, item):
    for index, old in enumerate(practices):
        if old.get("id") == item["id"]:
            practices[index] = item
            return "updated"
    practices.append(item)
    return "inserted"


def upsert_binding(bindings, practice_id, target_id, order):
    item = {
        "practiceId": practice_id,
        "targetType": "chapter",
        "targetId": target_id,
        "enabled": True,
        "order": order,
    }
    for index, old in enumerate(bindings):
        if old.get("practiceId") == practice_id and old.get("targetId") == target_id:
            bindings[index] = item
            return "updated"
    bindings.append(item)
    return "inserted"


def main():
    db = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
    practice_results = [upsert_practice(db["practices"], item) for item in NEW_PRACTICES]
    known = {item.get("id") for item in db["practices"] if isinstance(item, dict)}
    missing = [practice_id for practice_id, _, _ in NEW_BINDINGS if practice_id not in known]
    if missing:
        raise SystemExit(f"missing practices: {missing}")
    binding_results = [
        upsert_binding(db["bindings"], practice_id, target_id, order)
        for practice_id, target_id, order in NEW_BINDINGS
    ]
    meta = db.setdefault("meta", {})
    meta["practiceCount"] = len(db.get("practices", []))
    meta["bindingCount"] = len(db.get("bindings", []))
    meta["totalPractices"] = len(db.get("practices", []))
    meta["totalBindings"] = len(db.get("bindings", []))
    meta["updatedAt"] = datetime.now(timezone.utc).isoformat()
    DB_PATH.write_text(json.dumps(db, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("practices", practice_results)
    print("bindings", binding_results)


if __name__ == "__main__":
    main()
