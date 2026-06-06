import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB = ROOT / "program-db" / "database" / "practice-db.json"

CHAPTER = "j5-3-3"
STAGE = "國中"
GRADE = "九年級"
TERM = "上"
CHAPTER_NAME = "外心、內心、重心"
DOMAIN = "幾何"

COMMON_MISTAKES = [
    "外心看三頂點等距，內心看三邊等距，重心看中線 2:1；三心性質不要混用。",
    "直角三角形外心在斜邊中點，正三角形三心合一，這兩種特殊情形要先辨認。",
    "座標三心題先分清公式：重心是平均值，外心要到三點等距，內心在坐標軸直角三角形常為 (r,r)。",
]

practices = [
    ("circumcenter-five-subtypes", "外心角度距離五小類綜合", "medium", 6, 5, ["circumcenter-angle", "circumcenter-equal-radius", "right-circumradius", "equilateral-circumradius", "obtuse-circumcenter-angle"], ["外心", "外接圓", "圓心角"], "外心到三頂點等距；銳角看 2A，鈍角求較小角時用 360°-2A。"),
    ("circumcenter-angle", "銳角三角形外心角", "medium", 5, 1, [], ["外心角", "銳角三角形"], "銳角三角形中，∠BOC=2∠A。"),
    ("circumcenter-equal-radius", "外心等距計算", "easy", 5, 1, [], ["外心", "等距"], "外心到三頂點距離都等於外接圓半徑。"),
    ("right-circumradius", "直角三角形外接半徑", "easy", 5, 1, [], ["直角三角形", "外接半徑"], "直角三角形外接圓半徑是斜邊的一半。"),
    ("equilateral-circumradius", "正三角形外接半徑", "medium", 5, 1, [], ["正三角形", "外接半徑"], "正三角形外接半徑為高的 2/3。"),
    ("obtuse-circumcenter-angle", "鈍角三角形外心角", "medium", 5, 1, [], ["鈍角三角形", "外心角"], "鈍角時較小外心角常用 360°-2A。"),
    ("incenter-six-subtypes", "內心角度半徑六小類綜合", "medium", 6, 6, ["incenter-angle", "incenter-angle-inverse", "inradius-from-area-perimeter", "right-triangle-inradius", "incenter-area-ratio", "equilateral-inradius"], ["內心", "內切圓", "面積"], "內心角用 90°+A/2；面積用 A=rs；直角三角形 r=(a+b-c)/2。"),
    ("incenter-angle", "內心角公式換算", "medium", 5, 1, [], ["內心角", "角度"], "∠BIC=90°+1/2∠A。"),
    ("incenter-angle-inverse", "由內心角反推頂角", "medium", 5, 1, [], ["內心角", "反推"], "由 ∠A=2(∠BIC-90°) 反推。"),
    ("inradius-from-area-perimeter", "由面積周長求內切半徑", "medium", 5, 1, [], ["內切半徑", "面積"], "A=rs，其中 s 為半周長。"),
    ("right-triangle-inradius", "直角三角形內切半徑", "medium", 5, 1, [], ["直角三角形", "內切半徑"], "直角三角形 r=(a+b-c)/2。"),
    ("incenter-area-ratio", "內心分割面積比", "medium", 5, 1, [], ["內心", "面積比"], "內心到三邊距離相等，所以小三角形面積比等於邊長比。"),
    ("equilateral-inradius", "正三角形內切半徑", "medium", 5, 1, [], ["正三角形", "內切半徑"], "正三角形內切半徑為高的 1/3。"),
    ("centroid-six-subtypes", "重心長度座標面積六小類綜合", "medium", 6, 6, ["centroid-median-length", "centroid-median-inverse", "centroid-coordinate", "missing-vertex-from-centroid", "centroid-area-sixth", "centroid-area-third"], ["重心", "中線", "面積"], "重心分中線 2:1，坐標是三頂點平均，三中線分六等面積。"),
    ("centroid-median-length", "由中線求重心分段", "easy", 5, 1, [], ["重心", "中線"], "AG=2/3 AD，GD=1/3 AD。"),
    ("centroid-median-inverse", "由重心短段求中線", "easy", 5, 1, [], ["重心", "中線"], "若 GD 已知，AD=3GD。"),
    ("centroid-coordinate", "三點求重心坐標", "medium", 5, 1, [], ["重心坐標", "平均"], "重心坐標為三頂點坐標平均。"),
    ("missing-vertex-from-centroid", "由重心反推第三頂點", "medium", 5, 1, [], ["重心坐標", "反推頂點"], "用平均公式列式反推未知頂點。"),
    ("centroid-area-sixth", "重心六等面積", "medium", 5, 1, [], ["重心", "六等面積"], "三條中線把三角形分成六個等面積小三角形。"),
    ("centroid-area-third", "重心三等面積", "medium", 5, 1, [], ["重心", "三等面積"], "重心連三頂點形成三個等面積三角形。"),
    ("coordinate-five-subtypes", "座標平面三心五小類綜合", "medium", 6, 5, ["right-triangle-circumcenter-coordinate", "three-point-centroid-coordinate", "axis-triangle-incenter", "right-triangle-og-distance", "circumcenter-point-check"], ["坐標", "外心", "重心", "內心"], "座標題先辨認特殊直角三角形，再套外心、重心或內心公式。"),
    ("right-triangle-circumcenter-coordinate", "座標直角三角形外心", "medium", 5, 1, [], ["座標", "外心"], "直角三角形外心是斜邊中點。"),
    ("three-point-centroid-coordinate", "座標三點重心", "medium", 5, 1, [], ["座標", "重心"], "重心為三點坐標平均。"),
    ("axis-triangle-incenter", "坐標軸直角三角形內心", "hard", 5, 1, [], ["座標", "內心"], "坐標軸圍成的直角三角形內心常為 (r,r)。"),
    ("right-triangle-og-distance", "直角三角形外心重心距", "medium", 5, 1, [], ["外心", "重心", "距離"], "直角三角形 OG=斜邊/6。"),
    ("circumcenter-point-check", "判斷點是否在外接圓上", "easy", 5, 1, [], ["外接圓", "距離"], "三角形頂點必在外接圓上，檢查 OP 是否等於半徑。"),
    ("special-five-subtypes", "正三角形與直角三心五小類綜合", "medium", 6, 5, ["equilateral-radii-ratio", "equilateral-area-from-inradius", "right-triangle-go", "right-triangle-rr-perimeter", "centroid-to-vertex-sum"], ["正三角形", "直角三角形", "三心"], "正三角形三心合一；直角三角形外心在斜邊中點。"),
    ("equilateral-radii-ratio", "正三角形內外半徑比", "easy", 5, 1, [], ["正三角形", "半徑比"], "正三角形 R:r=2:1。"),
    ("equilateral-area-from-inradius", "由內切半徑求正三角形面積", "medium", 5, 1, [], ["正三角形", "面積"], "邊長 a=2√3r，再代入面積公式。"),
    ("right-triangle-go", "直角三角形外心重心距公式", "medium", 5, 1, [], ["直角三角形", "OG"], "直角三角形 OG=斜邊/6。"),
    ("right-triangle-rr-perimeter", "直角三角形內外半徑與周長", "medium", 5, 1, [], ["直角三角形", "內外半徑"], "R=c/2，r=(a+b-c)/2。"),
    ("centroid-to-vertex-sum", "重心到三頂點距離和", "medium", 5, 1, [], ["重心", "中線"], "重心到頂點距離和為三條中線和的 2/3。"),
]

big_suffixes = [
    "circumcenter-five-subtypes",
    "incenter-six-subtypes",
    "centroid-six-subtypes",
    "coordinate-five-subtypes",
    "special-five-subtypes",
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
        "usage": [f"練習 {CHAPTER_NAME} 的外心、內心、重心、座標三心與特殊三角形半徑面積計算。"],
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
