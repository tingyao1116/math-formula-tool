import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


CHAPTER_CODE = "j6-3-1"
CHAPTER_TITLE = "資料的整理與統計圖表"


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
        "tags": [CHAPTER_CODE, CHAPTER_TITLE, "次數分配", "圓餅圖", "無限練習", *tags],
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

frequency_related = [
    "practice-j6-3-1-relative-frequency",
    "practice-j6-3-1-cumulative-frequency",
    "practice-j6-3-1-class-interval-rule",
    "practice-j6-3-1-mark-recapture-estimation",
    "practice-j6-3-1-data-sorting-count",
    "practice-j6-3-1-missing-frequency",
]
pie_related = [
    "practice-j6-3-1-pie-angle-percent",
    "practice-j6-3-1-pie-partial-quantity",
    "practice-j6-3-1-pie-compare-difference",
    "practice-j6-3-1-pie-missing-allocation",
    "practice-j6-3-1-pie-percentile-position",
]

practice_items = [
    make_practice(
        "j6-3-1-frequency-distribution-six-subtypes",
        "次數分配、累積次數與分組判讀綜合",
        6,
        "medium",
        ["相對次數", "累積次數", "組距", "抽樣估計"],
        "相對次數 = 該組次數 ÷ 總次數；累積次數要由小到大逐組相加。",
        related=frequency_related,
        subtype_count=6,
        usage=["適合練習從表格、文字資料或簡短數列中讀出次數、相對次數與累積次數。"],
        notes=["截圖中只有大方向、未給足數值或需讀圖才能唯一判斷的題目沒有直接使用；改保留可由文字條件完整計算的題型。"],
    ),
    make_practice(
        "j6-3-1-relative-frequency",
        "相對次數與總次數互換",
        5,
        "easy",
        ["相對次數", "百分比", "總次數"],
        "相對次數 = 該組次數 ÷ 總次數 × 100%；反推總次數時改用除法。",
    ),
    make_practice(
        "j6-3-1-cumulative-frequency",
        "累積次數與原始次數推算",
        5,
        "medium",
        ["累積次數", "次數分配"],
        "某組原始次數 = 該組累積次數 − 前一組累積次數。",
    ),
    make_practice(
        "j6-3-1-class-interval-rule",
        "組距範圍與組中點判定",
        5,
        "easy",
        ["組距", "組中點", "分組資料"],
        "常用分組規則是含下限、不含上限；組中點 = (下限 + 上限) ÷ 2。",
    ),
    make_practice(
        "j6-3-1-mark-recapture-estimation",
        "抽樣調查與母體數估計",
        5,
        "medium",
        ["抽樣", "估計", "標記再捕"],
        "標記總數 ÷ 母體總數 ≈ 樣本中標記數 ÷ 樣本數。",
    ),
    make_practice(
        "j6-3-1-data-sorting-count",
        "資料排序與區間計數",
        5,
        "easy",
        ["資料排序", "區間計數", "次數"],
        "不畫表也能直接逐筆檢查：符合下限 ≤ x < 上限的資料才算入該組。",
    ),
    make_practice(
        "j6-3-1-missing-frequency",
        "缺漏次數與累積次數補齊",
        5,
        "medium",
        ["缺漏次數", "累積次數", "總次數"],
        "缺漏組次數可由總次數扣掉已知組，或由相鄰累積次數相減求得。",
    ),
    make_practice(
        "j6-3-1-pie-chart-five-subtypes",
        "圓餅圖百分比、圓心角與人數綜合",
        6,
        "medium",
        ["圓餅圖", "百分比", "圓心角", "人數"],
        "圓心角 = 360° × 百分比；人數 = 總數 × 百分比。",
        related=pie_related,
        subtype_count=5,
        usage=["適合把百分比、圓心角、人數差、缺失項目與百分位數定位放在一起練。"],
    ),
    make_practice(
        "j6-3-1-pie-angle-percent",
        "圓餅圖百分比與圓心角互換",
        5,
        "easy",
        ["圓餅圖", "圓心角", "百分比"],
        "百分比乘以 360° 得圓心角；圓心角除以 360° 得百分比。",
    ),
    make_practice(
        "j6-3-1-pie-partial-quantity",
        "圓餅圖部分人數與總數推算",
        5,
        "medium",
        ["部分量", "總量", "百分比"],
        "部分量 = 總量 × 百分比；若知道部分量與百分比，總量 = 部分量 ÷ 百分比。",
    ),
    make_practice(
        "j6-3-1-pie-compare-difference",
        "圓餅圖類別人數差距比較",
        5,
        "medium",
        ["人數差", "比例比較", "圓餅圖"],
        "兩類人數差 = 總人數 × 兩類百分比差。",
    ),
    make_practice(
        "j6-3-1-pie-missing-allocation",
        "圓餅圖缺失項目補齊",
        5,
        "medium",
        ["缺失項目", "總百分比", "總圓心角"],
        "圓餅圖的總百分比為 100%，總圓心角為 360°。",
    ),
    make_practice(
        "j6-3-1-pie-percentile-position",
        "百分位數與圓餅圖分組定位",
        5,
        "medium",
        ["百分位數", "圓餅圖", "位置"],
        "第 p 百分位數以前約占 p%，在圓餅圖上對應 360° × p%。",
    ),
]

for item in practice_items:
    upsert_practice(practices, item)

for order, key in enumerate(
    [
        "j6-3-1-frequency-distribution-six-subtypes",
        "j6-3-1-pie-chart-five-subtypes",
    ],
    start=1,
):
    upsert_binding(bindings, f"practice-{key}", order)

data["updatedAt"] = datetime.now(timezone.utc).isoformat()
DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
