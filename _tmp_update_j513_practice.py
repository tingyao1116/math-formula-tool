import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB = ROOT / "program-db" / "database" / "practice-db.json"

CHAPTER = "j5-1-3"
STAGE = "國中"
GRADE = "九年級"
TERM = "上"
CHAPTER_NAME = "相似三角形"
DOMAIN = "幾何"

COMMON_MISTAKES = [
    "相似判別不能只看一組邊或一組角；必須同時滿足對應角相等與對應邊成比例的條件。",
    "面積比不是邊長比；相似圖形的面積比等於對應邊長比的平方。",
    "比例式一定要先對準對應邊、對應高、對應中線或對應角平分線，不能只看數字大小硬配。",
]

practices = [
    (
        "similarity-criteria-five-subtypes",
        "相似判別與基本比例五小類綜合",
        "medium",
        6,
        5,
        [
            "aa-criterion",
            "sss-criterion",
            "sas-criterion",
            "parallel-basic-length",
            "butterfly-parallel-length",
        ],
        ["相似判別", "AA", "SSS", "SAS", "平行線"],
        "先判斷是哪一種相似來源：AA 看兩角、SSS 看三邊同比、SAS 看夾角相等且夾角兩邊同比。",
    ),
    (
        "aa-criterion",
        "AA 相似判別",
        "easy",
        5,
        1,
        [],
        ["AA", "角度", "相似判別"],
        "兩組對應角相等即可判定兩三角形相似；第三角會自動相等。",
    ),
    (
        "sss-criterion",
        "SSS 相似判別",
        "easy",
        5,
        1,
        [],
        ["SSS", "邊長比", "相似判別"],
        "三組對應邊都要成同一比例，少一組或比例不同就不能判定相似。",
    ),
    (
        "sas-criterion",
        "SAS 相似判別",
        "medium",
        5,
        1,
        [],
        ["SAS", "夾角", "邊長比"],
        "SAS 相似必須是夾角相等，且夾角兩邊成比例；SSA 不是穩定的相似判別法。",
    ),
    (
        "parallel-basic-length",
        "平行線小大三角形求長",
        "medium",
        5,
        1,
        [],
        ["平行線", "小大三角形", "比例式"],
        "若 DE ∥ BC，則 △ADE ∼ △ABC，常用比例為 DE:BC=AD:AB。",
    ),
    (
        "butterfly-parallel-length",
        "蝴蝶形平行線比例",
        "medium",
        5,
        1,
        [],
        ["蝴蝶形", "平行線", "相似"],
        "若 AB ∥ CD 且兩斜線交於 O，則 △OAB ∼ △ODC，可用 OA:OD=AB:CD。",
    ),
    (
        "ratio-area-four-subtypes",
        "相似三角形線段、周長與面積比綜合",
        "medium",
        6,
        4,
        [
            "corresponding-elements",
            "area-to-side-perimeter",
            "area-from-side-ratio",
            "scale-area-change",
        ],
        ["對應線段", "周長比", "面積比", "縮放"],
        "相似圖形中，對應高、對應中線、對應角平分線與周長比都等於邊長比；面積比是邊長比平方。",
    ),
    (
        "corresponding-elements",
        "對應高、中線、角平分線長度比",
        "medium",
        5,
        1,
        [],
        ["對應線段", "高", "中線", "角平分線"],
        "相似三角形的對應高、對應中線、對應角平分線之比，都等於對應邊長比。",
    ),
    (
        "area-to-side-perimeter",
        "由面積比反推邊長與周長比",
        "medium",
        5,
        1,
        [],
        ["面積比", "周長比", "平方比"],
        "若面積比為 a²:b²，邊長比與周長比就是 a:b。",
    ),
    (
        "area-from-side-ratio",
        "由邊長比求面積比與面積",
        "medium",
        5,
        1,
        [],
        ["邊長比", "面積比"],
        "邊長比 a:b 會推出面積比 a²:b²。",
    ),
    (
        "scale-area-change",
        "縮放後面積倍率",
        "medium",
        5,
        1,
        [],
        ["縮放", "面積倍率"],
        "面積倍率由兩個方向的長度倍率相乘得到；若是相似縮放 k 倍，面積倍率為 k²。",
    ),
    (
        "right-altitude-three-subtypes",
        "直角三角形母子相似三小類綜合",
        "medium",
        6,
        3,
        [
            "right-altitude",
            "right-legs-from-projections",
            "right-projection-unknown",
        ],
        ["直角三角形", "母子相似", "斜邊高"],
        "直角三角形斜邊上的高會形成三個相似三角形，核心公式是 AD²=BD×DC、AB²=BD×BC、AC²=DC×BC。",
    ),
    (
        "right-altitude",
        "斜邊高平方公式",
        "medium",
        5,
        1,
        [],
        ["斜邊高", "母子相似"],
        "斜邊上的高滿足 AD²=BD×DC。",
    ),
    (
        "right-legs-from-projections",
        "由斜邊投影求兩股",
        "medium",
        5,
        1,
        [],
        ["股長平方", "斜邊投影"],
        "兩股平方公式為 AB²=BD×BC、AC²=DC×BC。",
    ),
    (
        "right-projection-unknown",
        "斜邊高與投影段求未知數",
        "medium",
        5,
        1,
        [],
        ["斜邊高", "代數求值"],
        "先用 AD²=BD×DC 求出 AD，再回到題目中的一次式解未知數。",
    ),
    (
        "angle-bisector-three-subtypes",
        "角平分線與綜合比例三小類綜合",
        "medium",
        6,
        3,
        [
            "angle-bisector-segments",
            "angle-bisector-unknown",
            "bisector-parallel-composite",
        ],
        ["角平分線", "內分比", "綜合比例"],
        "三角形內角平分線會把對邊分成兩段，其比等於夾該角兩邊的長度比。",
    ),
    (
        "angle-bisector-segments",
        "內分比定理求分段",
        "medium",
        5,
        1,
        [],
        ["角平分線", "分段長"],
        "若 AD 平分 ∠A，則 BD:DC=AB:AC。",
    ),
    (
        "angle-bisector-unknown",
        "內分比定理解未知數",
        "medium",
        5,
        1,
        [],
        ["角平分線", "未知數"],
        "先把 AB:AC=BD:DC 寫成比例式，再交叉相乘解未知數。",
    ),
    (
        "bisector-parallel-composite",
        "角平分線搭配平行線",
        "hard",
        5,
        1,
        [],
        ["角平分線", "平行線", "相似綜合"],
        "先用角平分線求對邊分段，再用平行線建立小大三角形相似。",
    ),
    (
        "measurement-four-subtypes",
        "相似測量與投影四小類綜合",
        "medium",
        6,
        4,
        [
            "shadow-measurement",
            "mirror-measurement",
            "pinhole-projection",
            "river-width-measurement",
        ],
        ["測量", "影子法", "鏡面反射", "針孔成像", "河寬"],
        "生活測量題先找出兩個相似三角形，再把物高、影長、距離或像高對應成比例式。",
    ),
    (
        "shadow-measurement",
        "影子法測高",
        "easy",
        5,
        1,
        [],
        ["影子法", "測高"],
        "同一時間陽光照射下，物高與影長成正比。",
    ),
    (
        "mirror-measurement",
        "鏡面反射測高",
        "medium",
        5,
        1,
        [],
        ["鏡面反射", "測高"],
        "平面鏡測高利用入射角等於反射角，形成兩個相似直角三角形。",
    ),
    (
        "pinhole-projection",
        "針孔成像比例",
        "medium",
        5,
        1,
        [],
        ["針孔成像", "投影"],
        "針孔成像中，像高:物高=屏幕距離:物體距離。",
    ),
    (
        "river-width-measurement",
        "河寬測量相似三角形",
        "medium",
        5,
        1,
        [],
        ["河寬", "相似測量"],
        "河寬題常用岸邊垂線與共線視線建立兩個相似直角三角形。",
    ),
]

big_suffixes = [
    "similarity-criteria-five-subtypes",
    "ratio-area-four-subtypes",
    "right-altitude-three-subtypes",
    "angle-bisector-three-subtypes",
    "measurement-four-subtypes",
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
        "usage": [f"練習 {CHAPTER_NAME} 的相似判別、比例求長、面積周長換算、母子相似與測量應用。"],
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
