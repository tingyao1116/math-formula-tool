from datetime import datetime, timezone
from pathlib import Path
import json
import sys


sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


def practice(pid, title, generator_key, chapter_code, chapter, domain, tags, usage, tips, mistakes):
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
        "grade": "高一",
        "term": "下學期",
        "chapter": chapter,
        "domain": domain,
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
        "practice-s2-3-1-geometric-growth-rate-parameterized",
        "平均成長率的幾何平均",
        "s2-3-1-geometric-growth-rate-parameterized",
        "s2-3-1",
        "數據分析",
        "統計",
        ["s2-3-1", "幾何平均", "平均成長率", "百分率"],
        ["用整體倍率的幾何平均處理連續成長率，避免把百分率直接算算術平均。"],
        ["平均成長率要先把每年的成長率改成倍率，再開 n 次方。"],
        ["把 20%、-10%、50% 直接相加除以年數，忽略複利效果。"],
    ),
    practice(
        "practice-s2-3-1-sqrt-score-transform-parameterized",
        "開根號調分反推原始平均",
        "s2-3-1-sqrt-score-transform-parameterized",
        "s2-3-1",
        "數據分析",
        "統計",
        ["s2-3-1", "平均數", "標準差", "非線性變換"],
        ["由 Y=10√X 轉成 X=Y^2/100，再利用 E(Y^2)=變異數+平均數平方。"],
        ["這不是線性變換，不能用平均數直接開平方反推。"],
        ["把原始平均誤算成 (調整後平均/10)^2，漏掉標準差造成的平方平均差異。"],
    ),
    practice(
        "practice-s2-3-1-variance-correction-difference-parameterized",
        "資料更正與變異數差",
        "s2-3-1-variance-correction-difference-parameterized",
        "s2-3-1",
        "數據分析",
        "統計",
        ["s2-3-1", "資料更正", "變異數", "標準差平方"],
        ["平均數不變時，直接比較被更正資料的離均差平方和。"],
        ["題目問 x^2-y^2 就是在問更正前後變異數差，不必先開根號。"],
        ["先算標準差再平方，或忘記除以總人數。"],
    ),
    practice(
        "practice-s2-3-1-equal-size-group-merge-parameterized",
        "等人數兩組合併平均與標準差",
        "s2-3-1-equal-size-group-merge-parameterized",
        "s2-3-1",
        "數據分析",
        "統計",
        ["s2-3-1", "合併資料", "平均數", "標準差"],
        ["等人數兩組合併時，可用組內變異加組間變異理解合併標準差。"],
        ["兩組標準差相同但平均不同，合併後標準差會變大。"],
        ["只把兩組標準差取平均，忽略兩組平均數之間的差距。"],
    ),
    practice(
        "practice-s2-3-2-signed-linear-correlation-parameterized",
        "正負線性變換下的相關係數",
        "s2-3-2-signed-linear-correlation-parameterized",
        "s2-3-2",
        "相關與迴歸",
        "相關與迴歸",
        ["s2-3-2", "相關係數", "線性變換", "符號判斷"],
        ["平移不改變相關係數；乘正數不變號，乘負數變號。"],
        ["兩個變數各自乘上的係數符號相乘，決定相關係數是否改變正負。"],
        ["把加減常數也拿去影響相關係數，或把倍數大小誤當成相關係數倍數。"],
    ),
    practice(
        "practice-s2-3-2-regression-correlation-from-line-parameterized",
        "由迴歸線斜率反推相關係數",
        "s2-3-2-regression-correlation-from-line-parameterized",
        "s2-3-2",
        "相關與迴歸",
        "相關與迴歸",
        ["s2-3-2", "迴歸直線", "相關係數", "標準差"],
        ["利用迴歸線斜率 b=r·σy/σx 反推 r。"],
        ["最適直線必通過平均點，先由兩點求斜率再代入公式。"],
        ["把迴歸線斜率直接當作相關係數，忽略標準差比例。"],
    ),
]


NEW_BINDINGS = [
    ("practice-s2-3-1-quartiles-iqr-parameterized", "s2-3-1", 4),
    ("practice-s2-3-1-grouped-mean-parameterized", "s2-3-1", 5),
    ("practice-s2-3-1-geometric-growth-rate-parameterized", "s2-3-1", 6),
    ("practice-s2-3-1-sqrt-score-transform-parameterized", "s2-3-1", 7),
    ("practice-s2-3-1-variance-correction-difference-parameterized", "s2-3-1", 8),
    ("practice-s2-3-1-equal-size-group-merge-parameterized", "s2-3-1", 9),
    ("practice-s2-3-2-correlation-from-sums-parameterized", "s2-3-2", 3),
    ("practice-s2-3-2-least-squares-small-data-parameterized", "s2-3-2", 4),
    ("practice-s2-3-2-signed-linear-correlation-parameterized", "s2-3-2", 5),
    ("practice-s2-3-2-regression-correlation-from-line-parameterized", "s2-3-2", 6),
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
    binding_results = [upsert_binding(db["bindings"], practice_id, target_id, order) for practice_id, target_id, order in NEW_BINDINGS]
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
