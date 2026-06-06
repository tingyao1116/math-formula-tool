import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


CHAPTER_CODE = "j6-2-3"
CHAPTER_TITLE = "機率的基本計算"
STAGE = "國中"
GRADE = "國三"
TERM = "下"
DOMAIN = "機率"


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
        "stage": STAGE,
        "grade": GRADE,
        "term": TERM,
        "chapter": CHAPTER_TITLE,
        "domain": DOMAIN,
        "prompt": "",
        "answer": "",
        "tags": [CHAPTER_CODE, CHAPTER_TITLE, DOMAIN, "古典機率", "無限練習", *tags],
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

single_related = [
    "practice-j6-2-3-single-trial-probability",
    "practice-j6-2-3-coin-tree-probability",
    "practice-j6-2-3-dice-sum-product",
    "practice-j6-2-3-number-arrangement-probability",
]
compound_related = [
    "practice-j6-2-3-sampling-with-without-replacement",
    "practice-j6-2-3-two-bag-combination",
    "practice-j6-2-3-algebra-condition-probability",
]
game_related = [
    "practice-j6-2-3-rock-paper-scissors",
    "practice-j6-2-3-coin-tree-probability",
    "practice-j6-2-3-dice-sum-product",
]

notes = [
    "依照截圖整理為可重生的文字題；只有大方向、缺少明確條件或需要額外圖形才能判讀的題目未直接收錄。",
    "重複題型已合併：單次抽取、硬幣樹狀圖、骰子表格、放回與不放回抽樣各自集中成小類。",
]

practice_items = [
    make_practice(
        "j6-2-3-probability-single-mixed",
        "單一試驗與古典機率綜合",
        6,
        "easy",
        ["單一試驗", "骰子", "抽球", "撲克牌", "排列"],
        "古典機率先數「全部等可能結果」，再數「符合條件的結果」：機率＝符合結果數÷全部結果數。",
        related=single_related,
        subtype_count=4,
        usage=["適合放在單一事件與基本樣本空間的總複習，先讓學生練會分母與分子的來源。"],
        notes=notes,
    ),
    make_practice(
        "j6-2-3-single-trial-probability",
        "單一隨機試驗的機率",
        5,
        "easy",
        ["單一試驗", "基本機率"],
        "先確認每個結果是否等可能；若等可能，直接用符合條件的個數除以總個數。",
        notes=notes,
    ),
    make_practice(
        "j6-2-3-coin-tree-probability",
        "硬幣與性別樹狀圖機率",
        5,
        "easy",
        ["硬幣", "樹狀圖", "性別"],
        "每次只有兩種等可能結果時，連續 n 次共有 2^n 種結果；「至少」題常用反面事件較快。",
        notes=notes,
    ),
    make_practice(
        "j6-2-3-dice-sum-product",
        "兩顆骰子的點數運算機率",
        5,
        "medium",
        ["兩顆骰子", "表格法", "點數和"],
        "兩顆骰子要把結果視為有序對 (a,b)，共有 36 種；用 6×6 表格最不容易漏算。",
        notes=notes,
    ),
    make_practice(
        "j6-2-3-number-arrangement-probability",
        "數字排列與倍數條件機率",
        5,
        "medium",
        ["排列", "倍數", "首位不可為零"],
        "排數字時先處理首位不可為 0，再判斷偶數、3 的倍數或大小限制。",
        notes=notes,
    ),
    make_practice(
        "j6-2-3-probability-compound-mixed",
        "兩步試驗與抽樣機率綜合",
        6,
        "medium",
        ["放回", "不放回", "兩袋抽取", "代數條件"],
        "複合試驗先判斷是否放回；放回通常分母不變，不放回第二次的總數會減少。",
        related=compound_related,
        subtype_count=3,
        usage=["適合在學生已會單一事件後，用來區分獨立與相依情況。"],
        notes=notes,
    ),
    make_practice(
        "j6-2-3-sampling-with-without-replacement",
        "放回與不放回抽球機率",
        5,
        "medium",
        ["抽球", "放回", "不放回"],
        "不放回時，第二次抽取的分母與可能的分子都要隨前一次結果改變。",
        notes=notes,
    ),
    make_practice(
        "j6-2-3-two-bag-combination",
        "兩袋各取一球的組合機率",
        5,
        "medium",
        ["兩袋抽取", "組合機率"],
        "兩袋各取一球時，樣本空間是兩袋選項數相乘，再依條件數出符合的有序配對。",
        notes=notes,
    ),
    make_practice(
        "j6-2-3-algebra-condition-probability",
        "骰子點數與代數條件機率",
        5,
        "medium",
        ["骰子", "代數條件", "有序對"],
        "把兩顆骰子的點數記為 (a,b)，再將題目條件轉成不等式或方程式來數點。",
        notes=notes,
    ),
    make_practice(
        "j6-2-3-probability-game-mixed",
        "猜拳、骰子與遊戲機率綜合",
        6,
        "medium",
        ["猜拳", "骰子", "遊戲機率"],
        "遊戲題不要先憑直覺猜；先列出樣本空間，再把勝、負、平手或達成條件的情形標出來。",
        related=game_related,
        subtype_count=3,
        usage=["適合做單元末綜合題，訓練學生把生活情境翻譯成可數的結果。"],
        notes=notes,
    ),
    make_practice(
        "j6-2-3-rock-paper-scissors",
        "猜拳樣本空間與勝負機率",
        5,
        "medium",
        ["猜拳", "樣本空間", "勝負判定"],
        "兩人猜拳共有 3×3 種結果；三人猜拳要分清楚全同、全不同與恰有兩人相同。",
        notes=notes,
    ),
]

for item in practice_items:
    upsert_practice(practices, item)

for order, key in enumerate(
    [
        "j6-2-3-probability-single-mixed",
        "j6-2-3-probability-compound-mixed",
        "j6-2-3-probability-game-mixed",
    ],
    start=4,
):
    upsert_binding(bindings, f"practice-{key}", order)

data["updatedAt"] = datetime.now(timezone.utc).isoformat()
DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

