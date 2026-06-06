import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB = ROOT / "program-db" / "database" / "practice-db.json"

CHAPTER = "j5-2-3"
STAGE = "國中"
GRADE = "九年級"
TERM = "上"
CHAPTER_NAME = "乘冪與圓的綜合應用"
DOMAIN = "幾何"

COMMON_MISTAKES = [
    "兩弦相交在圓內用 PA×PB=PC×PD；兩割線相交在圓外也用外部段乘全長。",
    "切割線定理是 PT²=PA×PB，PB 是整條割線全長，不是只取圓內那一段。",
    "遇到半徑與圓心距時，先判斷圓冪值是 r²-d² 還是 d²-r²，再轉成線段乘積。",
]

practices = [
    (
        "power-basic-four-subtypes",
        "圓內外乘冪基本四小類綜合",
        "medium",
        6,
        4,
        ["intersecting-chords-segment", "external-secants-segment", "tangent-secant-tangent", "tangent-secant-segment"],
        ["乘冪定理", "兩弦", "兩割線", "切割線"],
        "先判斷圖形是圓內兩弦、圓外兩割線或切割線，再套對應乘積式。",
    ),
    ("intersecting-chords-segment", "圓內兩弦相交求線段", "medium", 5, 1, [], ["兩弦相交", "乘冪"], "圓內兩弦相交：PA×PB=PC×PD。"),
    ("external-secants-segment", "圓外兩割線求線段", "medium", 5, 1, [], ["兩割線", "圓外點"], "圓外兩割線：外部段×全長彼此相等。"),
    ("tangent-secant-tangent", "切割線定理求切線長", "medium", 5, 1, [], ["切線", "割線"], "切割線定理：PT²=PA×PB。"),
    ("tangent-secant-segment", "切割線定理求割線段", "medium", 5, 1, [], ["切線", "割線段"], "先由 PT²=PA×PB 求 PB，再用 AB=PB-PA。"),
    (
        "algebra-five-subtypes",
        "乘冪定理代數式五小類綜合",
        "medium",
        6,
        5,
        ["algebra-intersecting-chords", "algebra-tangent-secant", "algebra-external-secants", "ratio-intersecting-chords", "ratio-tangent-secant"],
        ["代數式", "比例", "乘冪定理"],
        "把題目文字轉成乘積相等，再解正值或所求線段。",
    ),
    ("algebra-intersecting-chords", "兩弦乘冪一次式求值", "medium", 5, 1, [], ["兩弦", "一次式"], "用 PA×PB=PC×PD 建立方程式。"),
    ("algebra-tangent-secant", "切割線乘冪一次式求值", "medium", 5, 1, [], ["切割線", "一次式"], "用 PT²=PA×PB 解未知數，長度取正值。"),
    ("algebra-external-secants", "兩割線乘冪一次式求值", "medium", 5, 1, [], ["兩割線", "一次式"], "外部段乘全長相等，不要把全長誤看成圓內弦長。"),
    ("ratio-intersecting-chords", "兩弦比例分段求全長", "medium", 5, 1, [], ["比例分段", "兩弦"], "把比例設成 mk、nk，再代入乘冪式。"),
    ("ratio-tangent-secant", "切割線比例求乘冪值", "medium", 5, 1, [], ["比例", "切割線"], "先由比例補出 PB，再求 PT² 或切線長。"),
    (
        "radius-power-five-subtypes",
        "圓心距與圓冪值五小類綜合",
        "medium",
        6,
        5,
        ["inside-power-product", "tangent-from-distance", "radius-from-tangent-distance", "shortest-chord-through-point", "diameter-secant-product"],
        ["圓冪值", "圓心距", "半徑"],
        "圓內點用 r²-OP²，圓外點切線長用 OP²-r²。",
    ),
    ("inside-power-product", "圓內點圓冪乘積", "medium", 5, 1, [], ["圓內點", "圓冪值"], "圓內點任意弦兩段乘積為 r²-OP²。"),
    ("tangent-from-distance", "由圓心距與半徑求切線長", "medium", 5, 1, [], ["切線長", "圓心距"], "切線長 PT=√(OP²-r²)。"),
    ("radius-from-tangent-distance", "由切線長與圓心距求半徑", "medium", 5, 1, [], ["半徑", "切線長"], "由 OP²=PT²+r² 反推半徑。"),
    ("shortest-chord-through-point", "圓內點最短弦長", "medium", 5, 1, [], ["最短弦", "弦心距"], "過圓內點最短弦會垂直 OP，半弦長用畢氏定理。"),
    ("diameter-secant-product", "通過圓心割線乘積", "medium", 5, 1, [], ["直徑", "圓冪值"], "通過圓心時兩段為 r-OP 與 r+OP，乘積為 r²-OP²。"),
    (
        "chord-distance-four-subtypes",
        "弦心距與乘冪轉換四小類綜合",
        "medium",
        6,
        4,
        ["chord-distance-power-transfer", "midpoint-chord-product", "parallel-chord-product", "perpendicular-chord-length"],
        ["弦心距", "垂徑定理", "乘冪"],
        "先用垂徑定理或畢氏定理求半弦長，再把半弦長平方轉成乘冪值。",
    ),
    ("chord-distance-power-transfer", "弦心距轉乘冪求段長", "medium", 5, 1, [], ["弦心距", "乘冪"], "半弦長平方就是中點對該圓的乘冪乘積。"),
    ("midpoint-chord-product", "中點弦乘冪求弦長", "medium", 5, 1, [], ["中點", "兩弦相交"], "若 M 為弦中點，則 AM×MB=k²。"),
    ("parallel-chord-product", "平行弦延長兩割線", "medium", 5, 1, [], ["平行弦", "兩割線"], "延長交於圓外點後，仍套外部段×全長相等。"),
    ("perpendicular-chord-length", "垂徑定理求弦長", "medium", 5, 1, [], ["垂徑定理", "弦長"], "半徑垂直弦會平分弦，半弦長用直角三角形求。"),
    (
        "ratio-composite-five-subtypes",
        "比例關係與乘冪綜合五小類",
        "medium",
        6,
        5,
        ["ratio-internal-chord-total", "ratio-external-secant-length", "two-secants-same-point-ratio", "two-tangent-equal-power", "common-tangent-power"],
        ["比例", "切線", "割線", "乘冪"],
        "比例題先把分段換成實際長度，再代入乘冪定理。",
    ),
    ("ratio-internal-chord-total", "圓內弦比例分段求全長", "medium", 5, 1, [], ["比例分段", "圓內兩弦"], "設比例為 mk、nk，再求全長。"),
    ("ratio-external-secant-length", "圓外割線比例求全長", "easy", 5, 1, [], ["外部段", "全長"], "全長 PB=外部段 PA+圓內段 AB。"),
    ("two-secants-same-point-ratio", "同外點兩割線乘積相等", "medium", 5, 1, [], ["同外點", "兩割線"], "同一外點作兩割線，兩個外部段×全長相等。"),
    ("two-tangent-equal-power", "同外點兩切線與乘冪", "easy", 5, 1, [], ["兩切線", "乘冪值"], "同一外點兩切線等長，乘冪值為切線長平方。"),
    ("common-tangent-power", "切線乘冪轉割線全長", "medium", 5, 1, [], ["切線", "割線"], "已知切線長時，可直接把 PT² 當作割線乘積。"),
]

big_suffixes = [
    "power-basic-four-subtypes",
    "algebra-five-subtypes",
    "radius-power-five-subtypes",
    "chord-distance-four-subtypes",
    "ratio-composite-five-subtypes",
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
        "usage": [f"練習 {CHAPTER_NAME} 的兩弦、兩割線、切割線、圓冪值與比例代數轉換。"],
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
