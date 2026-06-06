import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB = ROOT / "program-db" / "database" / "practice-db.json"

CHAPTER = "j5-2-1"
STAGE = "國中"
GRADE = "九年級"
TERM = "上"
CHAPTER_NAME = "圓的基本性質與長度計算"
DOMAIN = "幾何"

COMMON_MISTAKES = [
    "點與圓、直線與圓都要先比較距離與半徑，不能只憑圖形直覺判斷。",
    "弦長題要先取半弦長；半徑、弦心距、半弦長會構成直角三角形。",
    "兩圓位置要同時比較 d、r1+r2 與 |r1-r2|；外公切線用半徑差，內公切線用半徑和。",
]

practices = [
    (
        "point-line-circle-three-subtypes",
        "點、直線與圓位置三小類綜合",
        "medium",
        6,
        3,
        ["point-circle-position", "line-circle-position", "tangent-length-from-point"],
        ["點與圓", "直線與圓", "切線長"],
        "判斷位置關係時，先找距離，再與半徑比較；圓外點切線長用直角三角形。",
    ),
    ("point-circle-position", "點與圓的位置判定", "easy", 5, 1, [], ["點與圓", "位置關係"], "比較 OP 與 r：OP<r 在圓內，OP=r 在圓上，OP>r 在圓外。"),
    ("line-circle-position", "直線與圓的位置判定", "easy", 5, 1, [], ["直線與圓", "切線", "割線"], "比較圓心到直線距離 d 與 r：d<r 為割線，d=r 為切線，d>r 不相交。"),
    ("tangent-length-from-point", "圓外點切線段長", "medium", 5, 1, [], ["切線長", "畢氏定理"], "半徑垂直切線，所以 OP、r、切線段形成直角三角形。"),
    (
        "chord-distance-four-subtypes",
        "弦、弦心距與半徑四小類綜合",
        "medium",
        6,
        4,
        ["chord-center-distance", "chord-length", "radius-from-chord", "concentric-annulus"],
        ["弦", "弦心距", "半徑", "同心圓"],
        "弦心距題的核心是 r、d、半弦長構成直角三角形。",
    ),
    ("chord-center-distance", "由半徑與弦長求弦心距", "medium", 5, 1, [], ["弦心距", "畢氏定理"], "先把弦長除以 2，再用 d²+(半弦長)²=r²。"),
    ("chord-length", "由半徑與弦心距求弦長", "medium", 5, 1, [], ["弦長", "畢氏定理"], "半弦長 = √(r²-d²)，完整弦長要再乘以 2。"),
    ("radius-from-chord", "由弦長與弦心距求半徑", "medium", 5, 1, [], ["半徑", "弦心距"], "半徑是直角三角形斜邊，r²=d²+(半弦長)²。"),
    ("concentric-annulus", "同心圓環形區域面積", "medium", 5, 1, [], ["同心圓", "環形面積"], "同心圓間環形面積為 π(R²-r²)，也可由半徑差平方結構判斷。"),
    (
        "two-circle-tangent-four-subtypes",
        "兩圓位置與公切線四小類綜合",
        "medium",
        6,
        4,
        ["two-circle-position", "radii-from-tangencies", "external-common-tangent", "internal-common-tangent"],
        ["兩圓位置", "外公切線", "內公切線"],
        "兩圓先比較連心距與半徑和、半徑差；公切線長再用畢氏定理。",
    ),
    ("two-circle-position", "兩圓位置關係判定", "easy", 5, 1, [], ["兩圓", "位置關係"], "比較 d 與 r1+r2、|r1-r2|，即可判斷外離、外切、相交、內切或內離。"),
    ("radii-from-tangencies", "由外切內切求兩圓半徑", "medium", 5, 1, [], ["外切", "內切", "半徑"], "同一對圓的外切連心距是半徑和，內切連心距是半徑差。"),
    ("external-common-tangent", "外公切線長度", "medium", 5, 1, [], ["外公切線", "畢氏定理"], "外公切線長 = √(d²-(r1-r2)²)。"),
    ("internal-common-tangent", "內公切線長度", "medium", 5, 1, [], ["內公切線", "畢氏定理"], "內公切線長 = √(d²-(r1+r2)²)。"),
    (
        "tangent-polygon-three-subtypes",
        "切線段與圓外切四邊形三小類綜合",
        "medium",
        6,
        3,
        ["tangent-segments", "circumscribed-quadrilateral", "tangent-quad-perimeter"],
        ["切線段", "圓外切四邊形", "周長"],
        "同一圓外一點所作兩切線段等長；圓外切四邊形的兩組對邊和相等。",
    ),
    ("tangent-segments", "同一外點兩切線段等長", "easy", 5, 1, [], ["切線段", "等長"], "從同一外點引圓的兩條切線，兩切線段長相等。"),
    ("circumscribed-quadrilateral", "圓外切四邊形缺邊", "medium", 5, 1, [], ["圓外切四邊形", "對邊和"], "圓外切四邊形滿足 AB+CD=BC+DA。"),
    ("tangent-quad-perimeter", "圓外切四邊形周長", "easy", 5, 1, [], ["圓外切四邊形", "周長"], "若已知一組對邊，周長 = 2×該組對邊和。"),
    (
        "coordinate-circle-five-subtypes",
        "坐標平面上的圓五小類綜合",
        "medium",
        6,
        5,
        ["diameter-endpoint-circle", "axis-line-circle-relation", "coordinate-point-position", "coordinate-tangent-radius", "point-distance-to-circle"],
        ["坐標平面", "圓心", "半徑", "切線"],
        "坐標題仍回到距離公式、半徑比較與切線垂直半徑。",
    ),
    ("diameter-endpoint-circle", "直徑端點求圓心半徑", "easy", 5, 1, [], ["直徑", "中點", "半徑"], "圓心是直徑端點中點，半徑是直徑長的一半。"),
    ("axis-line-circle-relation", "坐標直線與圓位置", "easy", 5, 1, [], ["坐標", "直線與圓"], "圓心在原點且直線為 x=k 時，圓心到直線距離為 |k|。"),
    ("coordinate-point-position", "坐標點與圓位置", "easy", 5, 1, [], ["坐標", "點與圓"], "先用距離公式求 OP，再比較 OP 與半徑 r。"),
    ("coordinate-tangent-radius", "坐標圓外點切線長", "medium", 5, 1, [], ["坐標", "切線長"], "切點半徑垂直切線，因此可用 PT²=OP²-r²。"),
    ("point-distance-to-circle", "點到圓周最短與最長距離", "medium", 5, 1, [], ["點與圓", "最短距離", "最長距離"], "圓外點到圓周最短為 OA-r，最長為 OA+r。"),
]

big_suffixes = [
    "point-line-circle-three-subtypes",
    "chord-distance-four-subtypes",
    "two-circle-tangent-four-subtypes",
    "tangent-polygon-three-subtypes",
    "coordinate-circle-five-subtypes",
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
        "usage": [f"練習 {CHAPTER_NAME} 的位置判定、弦長計算、兩圓關係、公切線與坐標圓題型。"],
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
