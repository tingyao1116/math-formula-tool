import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB = ROOT / "program-db" / "database" / "practice-db.json"

CHAPTER = "j5-3-1"
STAGE = "國中"
GRADE = "國三"
TERM = "上"
CHAPTER_NAME = "證明的基本想法"
DOMAIN = "幾何"

COMMON_MISTAKES = [
    "證明整除時要把數寫成可看出因數的形式，例如偶數寫成 2k，奇數寫成 2k+1。",
    "餘數題先寫成「被除數 = 除數 × 商 + 餘數」，再只追蹤餘數變化。",
    "不等式乘負數會換向；比較平方或倒數時要先確認正負條件。",
]

practices = [
    ("parity-five-subtypes", "奇偶性質證明五小類綜合", "easy", 6, 5, ["parity-sum", "odd-product", "square-parity", "linear-parity", "odd-squares-sum"], ["奇偶", "證明"], "偶數寫 2k，奇數寫 2k+1，再整理成 2N 或 2N+1。"),
    ("parity-sum", "偶數加奇數證明", "easy", 5, 1, [], ["奇偶", "和"], "偶數加奇數會變成 2N+1。"),
    ("odd-product", "奇數乘奇數證明", "easy", 5, 1, [], ["奇偶", "乘積"], "兩個 2k+1 相乘後仍可整理成 2N+1。"),
    ("square-parity", "平方保留奇偶性", "easy", 5, 1, [], ["平方", "奇偶"], "奇數平方仍奇，偶數平方仍偶。"),
    ("linear-parity", "偶數加常數奇偶判斷", "easy", 5, 1, [], ["奇偶", "常數"], "偶數加上的常數決定最後奇偶。"),
    ("odd-squares-sum", "兩奇數平方和奇偶證明", "medium", 5, 1, [], ["奇數平方", "模 4"], "奇數平方除以 4 餘 1，所以兩個奇數平方和除以 4 餘 2。"),
    ("divisibility-five-subtypes", "整除與因式證明五小類綜合", "medium", 6, 5, ["consecutive-product-divisible", "difference-squares-divisible", "shifted-square-multiple", "quadratic-completion-multiple", "factor-substitution-multiple"], ["整除", "因式分解"], "整除證明的核心是提出指定因數。"),
    ("consecutive-product-divisible", "連續整數乘積整除", "medium", 5, 1, [], ["連續整數", "整除"], "連續整數中必含特定倍數。"),
    ("difference-squares-divisible", "平方差因式整除", "medium", 5, 1, [], ["平方差", "整除"], "a²-b²=(a-b)(a+b)。"),
    ("shifted-square-multiple", "平移平方差整除", "medium", 5, 1, [], ["平方差", "倍數"], "(k+c)²-k²=c(2k+c)。"),
    ("quadratic-completion-multiple", "配方後判斷倍數", "medium", 5, 1, [], ["配方", "倍數"], "先把二次式配成完全平方，再看因數。"),
    ("factor-substitution-multiple", "代入倍數關係證明", "medium", 5, 1, [], ["代入", "倍數"], "已知 a=mb 時，把 a 全部換成 mb。"),
    ("remainder-five-subtypes", "除法餘數推理五小類綜合", "medium", 6, 5, ["square-remainder", "remainder-parity", "expression-remainder", "age-squares-remainder", "not-divisible-claim"], ["餘數", "推理"], "餘數題可用 n=dq+r，只追蹤 r 的運算結果。"),
    ("square-remainder", "平方的餘數推理", "medium", 5, 1, [], ["餘數", "平方"], "n≡r 時，n²≡r²。"),
    ("remainder-parity", "由餘數判斷奇偶", "easy", 5, 1, [], ["餘數", "奇偶"], "偶數除數的奇餘數會讓原數為奇數。"),
    ("expression-remainder", "代數式餘數運算", "medium", 5, 1, [], ["餘數", "代數式"], "先把 n 換成餘數再代入式子。"),
    ("age-squares-remainder", "生活情境平方餘數", "medium", 5, 1, [], ["生活題", "餘數"], "生活情境本質仍是餘數平方和。"),
    ("not-divisible-claim", "反例型整除判斷", "medium", 5, 1, [], ["反例", "整除判斷"], "若餘數代入後不是 0，就能否定必為倍數。"),
    ("consecutive-five-subtypes", "連續整數性質證明五小類綜合", "medium", 6, 5, ["three-consecutive-product-six", "consecutive-sum-multiple", "consecutive-odd-squares-eight", "two-consecutive-even-product", "consecutive-weighted-sum-four"], ["連續整數", "證明"], "連續整數可用 n、n+1、n+2 表示，再觀察因數或配對。"),
    ("three-consecutive-product-six", "三連續整數乘積為六倍數", "easy", 5, 1, [], ["連續整數", "6倍數"], "三連續整數必含 2 的倍數與 3 的倍數。"),
    ("consecutive-sum-multiple", "奇數個連續整數和", "medium", 5, 1, [], ["連續整數", "總和"], "奇數個連續整數的和等於個數乘以中間數。"),
    ("consecutive-odd-squares-eight", "連續奇數平方差", "medium", 5, 1, [], ["連續奇數", "平方差"], "兩連續奇數可設為 2k+1、2k+3。"),
    ("two-consecutive-even-product", "連續偶數乘積整除", "medium", 5, 1, [], ["連續偶數", "整除"], "連續偶數乘積含 4，再由 k(k+1) 補一個 2。"),
    ("consecutive-weighted-sum-four", "三連續整數加權和", "medium", 5, 1, [], ["連續整數", "加權和"], "設 n、n+1、n+2 後直接整理成 4 的倍數。"),
    ("inequality-eight-subtypes", "代數不等式證明八小類綜合", "medium", 6, 8, ["positive-square-order", "negative-square-reverse", "positive-reciprocal-reverse", "negative-reciprocal-reverse", "multiply-by-negative", "am-gm-two-numbers", "radical-order", "same-sign-product-inequality"], ["不等式", "大小比較"], "不等式證明常用差值正負、平方非負與正負號判斷。"),
    ("positive-square-order", "正數平方保序", "easy", 5, 1, [], ["平方", "不等式"], "a²-b²=(a-b)(a+b)，兩因數皆正。"),
    ("negative-square-reverse", "負數平方倒向比較", "medium", 5, 1, [], ["負數", "平方"], "負數越小，絕對值越大，平方越大。"),
    ("positive-reciprocal-reverse", "正數倒數倒向", "medium", 5, 1, [], ["倒數", "正數"], "正數越大，倒數越小。"),
    ("negative-reciprocal-reverse", "負數倒數比較", "medium", 5, 1, [], ["倒數", "負數"], "用差值比較比直接記口訣更穩。"),
    ("multiply-by-negative", "乘負數不等號換向", "easy", 5, 1, [], ["負數", "不等式"], "乘以負數時不等號方向改變。"),
    ("am-gm-two-numbers", "算術幾何平均不等式", "medium", 5, 1, [], ["均值不等式", "平方非負"], "由 (√a-√b)²≥0 推出 AM-GM。"),
    ("radical-order", "根號與原數大小", "medium", 5, 1, [], ["根號", "大小比較"], "0<a<1 時，開根號會變大。"),
    ("same-sign-product-inequality", "符號連鎖與乘積正負", "medium", 5, 1, [], ["正負號", "乘積"], "用相同號、相異號逐步推符號。"),
]

big_suffixes = [
    "parity-five-subtypes",
    "divisibility-five-subtypes",
    "remainder-five-subtypes",
    "consecutive-five-subtypes",
    "inequality-eight-subtypes",
]

payload = json.loads(DB.read_text(encoding="utf-8"))
existing = {row["id"]: row for row in payload["practices"] if isinstance(row, dict) and row.get("id")}

for suffix, title, difficulty, qcount, subtype_count, related, tags, tip in practices:
    practice_id = f"practice-{CHAPTER}-{suffix}"
    entry = {
        "id": practice_id,
        "enabled": True,
        "mode": "generator",
        "title": title,
        "generatorKey": f"{CHAPTER}-{suffix}",
        "difficulty": difficulty,
        "questionCount": qcount,
        "subtypeCount": subtype_count,
        "relatedPracticeIds": [f"practice-{CHAPTER}-{item}" for item in related],
        "chapterCode": CHAPTER,
        "stage": STAGE,
        "grade": GRADE,
        "term": TERM,
        "chapter": CHAPTER_NAME,
        "domain": DOMAIN,
        "prompt": "",
        "answer": "",
        "tags": [CHAPTER, CHAPTER_NAME, *tags],
        "usage": [f"練習 {CHAPTER_NAME} 的奇偶、整除、餘數、連續整數與不等式證明。"],
        "examples": [],
        "tips": [tip],
        "notes": [],
        "mistakes": COMMON_MISTAKES,
    }
    if practice_id in existing:
        existing[practice_id].update(entry)
    else:
        payload["practices"].append(entry)

payload["bindings"] = [
    row
    for row in payload["bindings"]
    if not (
        isinstance(row, dict)
        and row.get("targetId") == CHAPTER
        and str(row.get("practiceId", "")).startswith(f"practice-{CHAPTER}-")
    )
]

for order, suffix in enumerate(big_suffixes, 1):
    payload["bindings"].append(
        {
            "practiceId": f"practice-{CHAPTER}-{suffix}",
            "targetType": "chapter",
            "targetId": CHAPTER,
            "enabled": True,
            "order": order,
        }
    )

payload["updatedAt"] = datetime.now(timezone.utc).isoformat()
DB.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"updated practice-db for {CHAPTER} with {len(practices)} practices")
