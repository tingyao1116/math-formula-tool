import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB = ROOT / "program-db" / "database" / "practice-db.json"

CHAPTER = "j5-1-4"
STAGE = "國中"
GRADE = "國三"
TERM = "上"
CHAPTER_NAME = "相似形應用"
DOMAIN = "幾何"

COMMON_MISTAKES = [
    "測量題要先找出兩個相似三角形，再把高度、影長、距離或像高對應到正確位置。",
    "相似圖形的周長比等於邊長比，但面積比等於邊長比的平方。",
    "三角比符號要對準角度：sin 是對邊比斜邊，cos 是鄰邊比斜邊，tan 是對邊比鄰邊。",
]

practices = [
    (
        "measurement-five-subtypes",
        "簡易測量與投影五小類綜合",
        "medium",
        6,
        5,
        ["shadow-height", "standard-pole-height", "mirror-height", "pinhole-image", "river-width"],
        ["測量", "投影", "相似三角形"],
        "影子、標竿、鏡面、針孔與河寬題都先找相似三角形，再列對應比例式。",
    ),
    ("shadow-height", "影子法測高", "easy", 5, 1, [], ["影子法", "測高"], "同一時間陽光下，物高與影長成正比。"),
    ("standard-pole-height", "標竿視線法測高", "medium", 5, 1, [], ["標竿", "視線", "測高"], "眼睛、標竿頂端與目標頂端共線時，高出眼睛的部分按水平距離成比例。"),
    ("mirror-height", "鏡面反射測高", "medium", 5, 1, [], ["鏡面反射", "測高"], "平面鏡反射利用入射角等於反射角，形成兩個相似直角三角形。"),
    ("pinhole-image", "針孔成像像高", "medium", 5, 1, [], ["針孔成像", "投影"], "像高:物高=屏幕距離:物體距離。"),
    ("river-width", "視線對齊測河寬", "medium", 5, 1, [], ["河寬", "視線對齊"], "岸邊垂線與共線視線可構造兩個相似直角三角形。"),
    (
        "ratio-area-four-subtypes",
        "相似圖形周長與面積比例四小類綜合",
        "medium",
        6,
        4,
        ["perimeter-side", "area-to-length", "parallel-area-split", "scale-area"],
        ["周長比", "面積比", "比例換算"],
        "周長、對應邊、對應中線都跟邊長比相同；面積比要平方。",
    ),
    ("perimeter-side", "由周長比求對應邊", "medium", 5, 1, [], ["周長比", "對應邊"], "相似三角形的周長比等於對應邊長比。"),
    ("area-to-length", "由面積比反推線段長", "medium", 5, 1, [], ["面積比", "線段比"], "若面積比為 a²:b²，對應線段比就是 a:b。"),
    ("parallel-area-split", "平行線分割面積", "medium", 5, 1, [], ["平行線", "面積比"], "DE ∥ BC 時，小大三角形面積比為 AD²:AB²。"),
    ("scale-area", "相似放大面積比", "easy", 5, 1, [], ["相似放大", "面積比"], "相似放大 k 倍時，面積放大 k² 倍。"),
    (
        "right-midpoint-four-subtypes",
        "直角母子相似與中點分割四小類綜合",
        "medium",
        6,
        4,
        ["right-altitude", "right-legs", "midpoint-triangle-area", "midpoint-quadrilateral"],
        ["母子相似", "中點", "面積分割"],
        "直角三角形斜邊高使用 AD²=BD×DC；中點連線常帶出 1:2 的長度比與 1:4 的面積比。",
    ),
    ("right-altitude", "斜邊高平方公式", "medium", 5, 1, [], ["母子相似", "斜邊高"], "直角三角形斜邊上的高滿足 AD²=BD×DC。"),
    ("right-legs", "由斜邊投影求兩股", "medium", 5, 1, [], ["母子相似", "投影段"], "兩股平方公式為 AB²=BD×BC、AC²=DC×BC。"),
    ("midpoint-triangle-area", "中點三角形面積", "easy", 5, 1, [], ["中點三角形", "面積比"], "中點三角形邊長為原三角形一半，面積為原三角形四分之一。"),
    ("midpoint-quadrilateral", "四邊形中點平行四邊形面積", "medium", 5, 1, [], ["四邊形中點", "面積"], "任意四邊形四邊中點依序連接，所得平行四邊形面積為原四邊形一半。"),
    (
        "trig-basic-four-subtypes",
        "基本三角比四小類綜合",
        "medium",
        6,
        4,
        ["trig-from-sides", "side-from-trig", "special-angle", "min-angle-cos"],
        ["三角比", "特殊角", "直角三角形"],
        "先固定觀察角，再辨認對邊、鄰邊、斜邊；特殊角可直接用 30-60-90 與 45-45-90 邊長比。",
    ),
    ("trig-from-sides", "由三邊求 sin、cos、tan", "easy", 5, 1, [], ["sin", "cos", "tan"], "sin=對邊/斜邊，cos=鄰邊/斜邊，tan=對邊/鄰邊。"),
    ("side-from-trig", "由三角比求邊長", "medium", 5, 1, [], ["三角比", "求邊長"], "給定三角比與斜邊或一股，先寫定義式再解未知邊。"),
    ("special-angle", "特殊角邊長比例", "easy", 5, 1, [], ["特殊角", "邊長比"], "30-60-90 邊長比為 1:√3:2，45-45-90 邊長比為 1:1:√2。"),
    ("min-angle-cos", "最小銳角 cos 值", "medium", 5, 1, [], ["最小銳角", "cos"], "最小銳角對最短邊；求 cos 時用鄰邊比斜邊。"),
    (
        "trig-application-four-subtypes",
        "坡度與三角比應用四小類綜合",
        "medium",
        6,
        4,
        ["slope-percent", "ladder-angle", "trig-area", "similar-trig-transfer"],
        ["坡度", "仰角", "三角比應用"],
        "坡度可視為 tan 的生活語言；相似三角形中對應角相等，所以三角比會保留。",
    ),
    ("slope-percent", "坡度百分比換算", "medium", 5, 1, [], ["坡度", "百分比"], "坡度百分比 = 垂直上升 ÷ 水平距離 × 100%。"),
    ("ladder-angle", "梯子仰角求高度", "medium", 5, 1, [], ["仰角", "特殊角"], "梯頂高度是仰角的對邊，可用高度=梯長×sinθ。"),
    ("trig-area", "tan 與直角三角形面積", "medium", 5, 1, [], ["tan", "面積"], "tan A=對邊/鄰邊，先求對邊再算面積。"),
    ("similar-trig-transfer", "相似三角形三角比轉移", "easy", 5, 1, [], ["相似", "三角比"], "三角比只由角度決定，相似三角形的對應角三角比相同。"),
]

big_suffixes = [
    "measurement-five-subtypes",
    "ratio-area-four-subtypes",
    "right-midpoint-four-subtypes",
    "trig-basic-four-subtypes",
    "trig-application-four-subtypes",
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
        "usage": [f"練習 {CHAPTER_NAME} 的相似測量、比例換算、母子相似、中點分割與三角比應用。"],
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
