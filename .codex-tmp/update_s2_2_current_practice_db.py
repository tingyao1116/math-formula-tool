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
        "practice-s2-2-1-handshake-couples-parameterized",
        "夫妻握手計數",
        "s2-2-1-handshake-couples-parameterized",
        "s2-2-1",
        "集合與計數原理",
        "排列組合",
        ["s2-2-1", "乘法原理", "握手問題", "分類計數"],
        ["將握手分成先生與先生、先生與太太兩類，避免把太太之間也算進去。"],
        ["夫妻題常見陷阱是把每個人可握手人數直接相乘，會重複計數。"],
        ["忘記排除先生與自己太太握手，或把每次握手算成兩次。"],
    ),
    practice(
        "practice-s2-2-1-fixed-end-no-repeat-schedule-parameterized",
        "固定首尾且相鄰不同的安排",
        "s2-2-1-fixed-end-no-repeat-schedule-parameterized",
        "s2-2-1",
        "集合與計數原理",
        "排列組合",
        ["s2-2-1", "乘法原理", "狀態轉移", "相鄰不同"],
        ["用是否回到固定選項分成兩個狀態，練習有首尾限制的逐步計數。"],
        ["首尾都固定時不能只算每一天有幾種選擇，最後一天必須落回指定選項。"],
        ["把中間每天都當成固定有 m-1 種，忽略最後一天回到 A 的限制。"],
    ),
    practice(
        "practice-s2-2-1-ambidextrous-pairing-parameterized",
        "左右手皆可的配對計數",
        "s2-2-1-ambidextrous-pairing-parameterized",
        "s2-2-1",
        "集合與計數原理",
        "排列組合",
        ["s2-2-1", "分類計數", "配對", "組合"],
        ["把可行配對分成右專配左專、皆可配專長、兩位皆可三種情況。"],
        ["左右手皆可者不是兩個人，不能把角色分配數直接當選人數。"],
        ["把一位左右手皆可的人同時當成右手與左手，造成重複或不合法計數。"],
    ),
    practice(
        "practice-s2-2-2-specified-non-adjacent-parameterized",
        "指定對象兩兩不相鄰排列",
        "s2-2-2-specified-non-adjacent-parameterized",
        "s2-2-2",
        "排列",
        "排列組合",
        ["s2-2-2", "排列", "不相鄰", "插空法"],
        ["先排非指定對象，再把指定對象插入空位，建立標準插空法。"],
        ["指定對象兩兩不相鄰時，要從空位中選位置，並排列指定對象本身。"],
        ["只選空位而忘記指定對象也可以交換順序。"],
    ),
    practice(
        "practice-s2-2-3-binomial-adjacent-ratio-parameterized",
        "連續組合數比值求 n 與 r",
        "s2-2-3-binomial-adjacent-ratio-parameterized",
        "s2-2-3",
        "組合與二項式定理",
        "組合與二項式定理",
        ["s2-2-3", "組合數", "二項式係數", "相鄰比值"],
        ["由相鄰組合數比值建立兩個方程，反推 n 與 r。"],
        ["連續三項的比值應先化成相鄰比，不要直接把比例當作 n、r。"],
        ["把 C(n,r+1)/C(n,r) 的分子分母寫反。"],
    ),
    practice(
        "practice-s2-2-4-grid-comparison-probability-parameterized",
        "方格大小比較機率",
        "s2-2-4-grid-comparison-probability-parameterized",
        "s2-2-4",
        "機率",
        "機率",
        ["s2-2-4", "古典機率", "大小比較", "獨立事件"],
        ["先計算一組有序數對滿足大於關係的數量，再利用兩組獨立相乘。"],
        ["可重複填入時樣本空間是 m^2，不是 C(m,2)。"],
        ["把 A>B 當成抽兩個不同數，忘記 A=B 也在樣本空間中但不利。"],
    ),
    practice(
        "practice-s2-2-4-overlap-days-off-probability-parameterized",
        "休假日重疊機率",
        "s2-2-4-overlap-days-off-probability-parameterized",
        "s2-2-4",
        "機率",
        "機率",
        ["s2-2-4", "組合機率", "對立事件", "至少一個"],
        ["固定甲的休假日後，用對立事件計算乙完全不重疊，再從 1 扣掉。"],
        ["至少同休一天通常用對立事件最乾淨。"],
        ["直接把重疊一天、兩天分開加，容易漏算或重複算。"],
    ),
]


NEW_BINDINGS = [
    ("practice-s2-2-1-handshake-couples-parameterized", "s2-2-1", 8),
    ("practice-s2-2-1-fixed-end-no-repeat-schedule-parameterized", "s2-2-1", 9),
    ("practice-s2-2-1-ambidextrous-pairing-parameterized", "s2-2-1", 10),
    ("practice-s2-2-2-specified-non-adjacent-parameterized", "s2-2-2", 11),
    ("practice-s2-2-3-binomial-adjacent-ratio-parameterized", "s2-2-3", 8),
    ("practice-s2-2-4-grid-comparison-probability-parameterized", "s2-2-4", 11),
    ("practice-s2-2-4-overlap-days-off-probability-parameterized", "s2-2-4", 12),
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
