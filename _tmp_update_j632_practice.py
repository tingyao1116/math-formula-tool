import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


CHAPTER_CODE = "j6-3-2"
CHAPTER_TITLE = "資料分析與統計量"


def make_practice(
    key,
    title,
    question_count,
    difficulty,
    tags,
    tip,
    related=None,
    subtype_count=1,
    usage=None,
    notes=None,
):
    return {
        "id": f"practice-{key}",
        "enabled": True,
        "mode": "generator",
        "title": title,
        "generatorKey": key,
        "difficulty": difficulty,
        "questionCount": question_count,
        "subtypeCount": subtype_count,
        "relatedPracticeIds": related or [],
        "chapterCode": CHAPTER_CODE,
        "stage": "國中",
        "grade": "國三",
        "term": "下",
        "chapter": CHAPTER_TITLE,
        "domain": "統計",
        "prompt": "",
        "answer": "",
        "tags": [CHAPTER_CODE, CHAPTER_TITLE, "統計量", "無限練習", *tags],
        "usage": usage or [],
        "examples": [],
        "tips": [tip],
        "notes": notes or [],
        "mistakes": [],
    }


def upsert_practice(practices, practice):
    for index, current in enumerate(practices):
        if current.get("id") == practice["id"]:
            practices[index] = practice
            return
    practices.append(practice)


def upsert_binding(bindings, practice_id, order):
    binding = {
        "practiceId": practice_id,
        "targetType": "chapter",
        "targetId": CHAPTER_CODE,
        "enabled": True,
        "order": order,
    }
    for index, current in enumerate(bindings):
        if current.get("practiceId") == practice_id and current.get("targetId") == CHAPTER_CODE:
            bindings[index] = binding
            return
    bindings.append(binding)


data = json.loads(DB_PATH.read_text(encoding="utf-8"))
practices = data.setdefault("practices", [])
bindings = data.setdefault("bindings", [])

central_related = [
    "practice-j6-3-2-raw-mean-median-mode",
    "practice-j6-3-2-linear-transform-statistics",
    "practice-j6-3-2-weighted-average",
    "practice-j6-3-2-mean-missing-value",
    "practice-j6-3-2-data-correction-effect",
    "practice-j6-3-2-arithmetic-sequence-statistics",
]
quartile_related = [
    "practice-j6-3-2-five-number-range-iqr",
    "practice-j6-3-2-raw-quartile-calculation",
    "practice-j6-3-2-frequency-quartile-position",
    "practice-j6-3-2-boxplot-five-number-summary",
    "practice-j6-3-2-boxplot-comparison",
    "practice-j6-3-2-percentile-rank-conversion",
]

practice_items = [
    make_practice(
        "j6-3-2-central-tendency-six-subtypes",
        "平均數、中位數、眾數與加權平均綜合",
        6,
        "medium",
        ["平均數", "中位數", "眾數", "加權平均"],
        "平均數看總和，中位數看排序中間，眾數看出現最多；合併平均必須用人數加權。",
        related=central_related,
        subtype_count=6,
        usage=["適合集中練習未分組資料的集中趨勢、線性變換、資料修正與加權平均。"],
        notes=["只有大方向或缺少完整數值條件的題目未直接使用，已改成可重生且可完整計算的文字題。"],
    ),
    make_practice(
        "j6-3-2-raw-mean-median-mode",
        "未分組資料的平均數、中位數與眾數",
        5,
        "easy",
        ["平均數", "中位數", "眾數"],
        "先排序，再用總和除以筆數；中位數看中間位置，眾數看出現最多次的數。",
    ),
    make_practice(
        "j6-3-2-linear-transform-statistics",
        "統計量的加減與倍數變換",
        5,
        "medium",
        ["線性變換", "全距", "四分位距"],
        "每筆資料加同一常數時，平均數、中位數、眾數會平移；全距與四分位距不變。乘正數時位置與距離統計量都同倍放大。",
    ),
    make_practice(
        "j6-3-2-weighted-average",
        "混合組別的加權平均",
        5,
        "medium",
        ["加權平均", "總平均"],
        "總平均不是兩個平均數直接平均，而是用各組人數當權重計算。",
    ),
    make_practice(
        "j6-3-2-mean-missing-value",
        "已知平均數反求未知數",
        5,
        "medium",
        ["平均數", "未知數"],
        "先用「總和 = 平均數 × 個數」找出應有總和，再扣掉已知資料和。",
    ),
    make_practice(
        "j6-3-2-data-correction-effect",
        "資料修正對平均數的影響",
        5,
        "medium",
        ["資料修正", "平均數"],
        "修正一筆資料時，只需要把總和補上「正確值 − 錯誤值」，再除以總筆數。",
    ),
    make_practice(
        "j6-3-2-arithmetic-sequence-statistics",
        "等差資料的統計量規律",
        5,
        "medium",
        ["等差數列", "四分位數", "全距"],
        "等差資料排序後位置很規律，中位數與四分位數都可直接看對應位置。",
    ),
    make_practice(
        "j6-3-2-quartile-boxplot-six-subtypes",
        "四分位數、盒狀圖與百分位數綜合",
        6,
        "medium",
        ["四分位數", "盒狀圖", "百分位數"],
        "五數為最小值、Q1、Q2、Q3、最大值；全距 = 最大值 − 最小值，四分位距 = Q3 − Q1。",
        related=quartile_related,
        subtype_count=6,
        usage=["適合練習四分位數定位、五數摘要、盒狀圖判讀與百分位數逆推。"],
        notes=["需要實際盒狀圖圖片才能判讀的題目未直接使用，已改成五數摘要或文字條件完整的題型。"],
    ),
    make_practice(
        "j6-3-2-five-number-range-iqr",
        "五數摘要的全距與四分位距",
        5,
        "easy",
        ["五數摘要", "全距", "四分位距"],
        "全距看最大到最小的距離；四分位距只看中間 50% 的寬度。",
    ),
    make_practice(
        "j6-3-2-raw-quartile-calculation",
        "未分組資料的四分位數計算",
        5,
        "medium",
        ["四分位數", "未分組資料"],
        "先找中位數 Q2，再將資料分成上下半部，各自取中位數得到 Q1 與 Q3。",
    ),
    make_practice(
        "j6-3-2-frequency-quartile-position",
        "次數分配表中的四分位數定位",
        5,
        "medium",
        ["次數分配", "四分位數"],
        "先找第 25%、50%、75% 的位置，再用累積次數判斷落在哪一組。",
    ),
    make_practice(
        "j6-3-2-boxplot-five-number-summary",
        "盒狀圖五數摘要與集中程度",
        5,
        "medium",
        ["盒狀圖", "集中程度"],
        "盒狀圖相鄰五數之間距離越短，表示同樣 25% 的資料越集中。",
    ),
    make_practice(
        "j6-3-2-boxplot-comparison",
        "盒狀圖比較與邏輯判讀",
        5,
        "medium",
        ["盒狀圖", "比較"],
        "比較全距看整體分散；比較四分位距看中間 50% 是否集中。",
    ),
    make_practice(
        "j6-3-2-percentile-rank-conversion",
        "百分位數與名次逆向推算",
        5,
        "medium",
        ["百分位數", "百分等級", "名次"],
        "百分等級 PRp 可粗略理解為約有 p% 的人不高於該成績。",
    ),
]

for item in practice_items:
    upsert_practice(practices, item)

for order, key in enumerate(
    [
        "j6-3-2-central-tendency-six-subtypes",
        "j6-3-2-quartile-boxplot-six-subtypes",
    ],
    start=1,
):
    upsert_binding(bindings, f"practice-{key}", order)

data["updatedAt"] = datetime.now(timezone.utc).isoformat()
DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
