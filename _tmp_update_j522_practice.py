import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB = ROOT / "program-db" / "database" / "practice-db.json"

CHAPTER = "j5-2-2"
STAGE = "國中"
GRADE = "國三"
TERM = "上"
CHAPTER_NAME = "圓心角、圓周角及弦切角"
DOMAIN = "幾何"

COMMON_MISTAKES = [
    "圓心角等於所對弧度數；圓周角與弦切角都是所對弧度數的一半。",
    "圓內接四邊形要抓對角互補；一個外角等於其對內角。",
    "圓內角用兩弧和的一半，圓外角用大弧減小弧的一半，不能把公式混用。",
]

practices = [
    (
        "central-arc-sector-four-subtypes",
        "圓心角、弧長與扇形四小類綜合",
        "medium",
        6,
        4,
        ["central-arc-degree", "arc-length-from-angle", "angle-from-arc-length", "sector-area"],
        ["圓心角", "弧長", "扇形"],
        "圓心角與弧度數相等；弧長與扇形面積都按圓心角占 360° 的比例計算。",
    ),
    ("central-arc-degree", "圓心角與弧度數換算", "easy", 5, 1, [], ["圓心角", "弧度數"], "同一圓中，劣弧度數等於所對圓心角度數。"),
    ("arc-length-from-angle", "由半徑與圓心角求弧長", "medium", 5, 1, [], ["弧長", "圓心角"], "弧長 = 2πr × θ/360°。"),
    ("angle-from-arc-length", "由弧長與半徑求圓心角", "medium", 5, 1, [], ["弧長", "反推角度"], "把弧長代入 2πr × θ/360°，即可反推 θ。"),
    ("sector-area", "扇形面積計算", "medium", 5, 1, [], ["扇形面積", "圓心角"], "扇形面積 = πr² × θ/360°。"),
    (
        "inscribed-angle-five-subtypes",
        "圓周角與弦切角五小類綜合",
        "medium",
        6,
        5,
        ["inscribed-angle-from-arc", "arc-from-inscribed-angle", "diameter-inscribed-angle", "tangent-chord-angle", "parallel-chord-angle"],
        ["圓周角", "弦切角", "直徑所對角"],
        "圓周角、弦切角都等於同弧度數的一半；直徑所對圓周角必為 90°。",
    ),
    ("inscribed-angle-from-arc", "由弧度數求圓周角", "easy", 5, 1, [], ["圓周角", "弧"], "圓周角 = 所對弧度數 ÷ 2。"),
    ("arc-from-inscribed-angle", "由圓周角求所對弧", "easy", 5, 1, [], ["圓周角", "弧"], "所對弧度數 = 圓周角 × 2。"),
    ("diameter-inscribed-angle", "直徑所對圓周角", "easy", 5, 1, [], ["直徑", "半圓"], "直徑所對的圓周角是直角。"),
    ("tangent-chord-angle", "弦切角與同弧圓周角", "medium", 5, 1, [], ["弦切角", "切線"], "弦切角等於同弧所對的圓周角。"),
    ("parallel-chord-angle", "平行弦夾弧求角", "medium", 5, 1, [], ["平行弦", "等弧"], "平行弦夾出的兩側弧相等，再用圓周角等於弧的一半。"),
    (
        "cyclic-quadrilateral-four-subtypes",
        "圓內接四邊形四小類綜合",
        "medium",
        6,
        4,
        ["cyclic-opposite-angle", "cyclic-ratio-angles", "cyclic-exterior-angle", "cyclic-linear-equation"],
        ["圓內接四邊形", "對角互補", "外角"],
        "圓內接四邊形的對角互補，外角等於對內角。",
    ),
    ("cyclic-opposite-angle", "圓內接四邊形對角互補", "easy", 5, 1, [], ["圓內接四邊形", "對角互補"], "對角和為 180°。"),
    ("cyclic-ratio-angles", "圓內接四邊形角度比", "medium", 5, 1, [], ["角度比", "對角互補"], "把對角設成比例未知數，再令總和等於 180°。"),
    ("cyclic-exterior-angle", "圓內接四邊形外角", "easy", 5, 1, [], ["外角", "對內角"], "圓內接四邊形的一個外角等於其對內角。"),
    ("cyclic-linear-equation", "圓內接四邊形一次式求角", "medium", 5, 1, [], ["一次式", "對角互補"], "把兩個對角的一次式相加等於 180°。"),
    (
        "interior-exterior-angle-five-subtypes",
        "圓內角與圓外角五小類綜合",
        "medium",
        6,
        5,
        ["interior-angle-two-chords", "arc-from-interior-angle", "exterior-angle-two-secants", "two-tangents-angle", "parameter-exterior-angle"],
        ["圓內角", "圓外角", "割線", "切線"],
        "圓內角看兩弧和的一半；圓外角看大弧減小弧的一半。",
    ),
    ("interior-angle-two-chords", "兩弦圓內角計算", "medium", 5, 1, [], ["圓內角", "兩弦相交"], "圓內角 = 所夾兩弧度數和 ÷ 2。"),
    ("arc-from-interior-angle", "由圓內角反推弧度數", "medium", 5, 1, [], ["反推弧", "圓內角"], "先把圓內角乘以 2，再扣掉已知弧。"),
    ("exterior-angle-two-secants", "兩割線圓外角計算", "medium", 5, 1, [], ["圓外角", "割線"], "圓外角 = (大弧 - 小弧) ÷ 2。"),
    ("two-tangents-angle", "兩切線夾角計算", "medium", 5, 1, [], ["兩切線", "圓外角"], "兩切線夾角 = 180° - 劣弧度數。"),
    ("parameter-exterior-angle", "圓外角一次式求值", "medium", 5, 1, [], ["一次式", "圓外角"], "用圓外角公式列方程式解未知數。"),
    (
        "arc-distribution-five-subtypes",
        "弧度比例與多邊形角度五小類綜合",
        "medium",
        6,
        5,
        ["arc-ratio-angle", "equal-division-angle", "regular-polygon-tangent-angle", "major-minor-inscribed-angle", "central-arc-equation"],
        ["弧度比例", "等分圓", "正多邊形"],
        "先把整圓 360° 按比例或等分換成弧度，再轉成圓周角或弦切角。",
    ),
    ("arc-ratio-angle", "弧長比例分配求圓周角", "medium", 5, 1, [], ["弧度比例", "圓周角"], "整圓為 360°，先求一份弧度，再取所對弧的一半。"),
    ("equal-division-angle", "等分圓周求圓周角", "medium", 5, 1, [], ["等分圓", "圓周角"], "每一等分弧為 360°÷n，圓周角是所對弧的一半。"),
    ("regular-polygon-tangent-angle", "正多邊形弦切角", "medium", 5, 1, [], ["正多邊形", "弦切角"], "正 n 邊形相鄰頂點所對弧為 360°÷n，弦切角再取一半。"),
    ("major-minor-inscribed-angle", "優弧劣弧與圓周角", "medium", 5, 1, [], ["優弧", "劣弧", "圓周角"], "優弧與劣弧合計 360°，先找題目真正所對的那段弧。"),
    ("central-arc-equation", "同弧圓心角圓周角一次式", "medium", 5, 1, [], ["圓心角", "圓周角", "一次式"], "同弧圓心角是圓周角的 2 倍。"),
]

big_suffixes = [
    "central-arc-sector-four-subtypes",
    "inscribed-angle-five-subtypes",
    "cyclic-quadrilateral-four-subtypes",
    "interior-exterior-angle-five-subtypes",
    "arc-distribution-five-subtypes",
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
        "usage": [f"練習 {CHAPTER_NAME} 的圓心角、圓周角、弦切角、圓內角、圓外角與扇形計算。"],
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
