import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DB = ROOT / "program-db" / "database" / "practice-db.json"

CHAPTER = "j5-3-3"
STAGE = "國中"
GRADE = "國三"
TERM = "下學期"
CHAPTER_NAME = "三心與幾何綜合"
DOMAIN = "幾何"

COMMON_MISTAKES = [
    "把外心、內心、重心的定義混在一起；先確認題目問的是等距、角平分線還是中線比例。",
    "重心中線比例是頂點到重心：重心到中點 = 2:1，不是 1:2。",
    "直角三角形外心在斜邊中點；正三角形外心、內心、重心三心合一。",
    "坐標題要先寫出公式，再代入數值，避免把平均坐標與距離公式混用。",
]

practices = [
    ("circumcenter-five-subtypes", "外心角度距離與外接圓七小類綜合", "medium", 6, 7, ["circumcenter-angle", "circumcenter-equal-radius", "right-circumradius", "equilateral-circumradius", "obtuse-circumcenter-angle", "isosceles-circumradius", "circumcircle-area-from-radius"], ["外心", "外接圓"], "外心到三頂點等距；銳角用圓心角 = 2 倍圓周角，鈍角注意較小角是 360° - 2A。"),
    ("circumcenter-angle", "銳角三角形外心角", "medium", 5, 1, [], ["外心角"], "銳角三角形中，同弧圓心角是圓周角的 2 倍。"),
    ("circumcenter-equal-radius", "外心等距計算", "easy", 5, 1, [], ["外心", "等距"], "外心到三個頂點距離相等，皆為外接圓半徑。"),
    ("right-circumradius", "直角三角形外接半徑", "easy", 5, 1, [], ["直角三角形", "外接圓"], "直角三角形外心在斜邊中點，外接半徑等於斜邊一半。"),
    ("equilateral-circumradius", "正三角形外接半徑", "medium", 5, 1, [], ["正三角形", "外接半徑"], "正三角形外心到頂點距離為高的 2/3。"),
    ("obtuse-circumcenter-angle", "鈍角三角形外心角", "medium", 5, 1, [], ["鈍角三角形", "外心角"], "鈍角題常求較小圓心角，使用 360° - 2A。"),
    ("isosceles-circumradius", "等腰三角形外接半徑", "medium", 5, 1, [], ["等腰三角形", "外接半徑"], "先用底邊高拆成直角三角形，再用 R=abc/(4K)。"),
    ("circumcircle-area-from-radius", "由外心半徑求外接圓面積", "easy", 5, 1, [], ["外接圓面積"], "外心到頂點距離就是外接圓半徑。"),
    ("incenter-six-subtypes", "內心角度半徑與面積八小類綜合", "medium", 6, 8, ["incenter-angle", "incenter-angle-inverse", "inradius-from-area-perimeter", "right-triangle-inradius", "incenter-area-ratio", "equilateral-inradius", "incenter-area-from-side-ratio", "axis-triangle-incenter-area"], ["內心", "內切圓", "面積"], "內心角用 90°+A/2；面積用 A=rs；直角三角形用 r=(a+b-c)/2。"),
    ("incenter-angle", "內心角公式換算", "medium", 5, 1, [], ["內心角"], "∠BIC=90°+1/2∠A。"),
    ("incenter-angle-inverse", "由內心角反推頂角", "medium", 5, 1, [], ["內心角", "反推"], "∠A=2(∠BIC-90°)。"),
    ("inradius-from-area-perimeter", "由面積周長求內切半徑", "medium", 5, 1, [], ["內切半徑", "面積"], "A=rs，其中 s 是半周長。"),
    ("right-triangle-inradius", "直角三角形內切半徑", "medium", 5, 1, [], ["直角三角形", "內切半徑"], "直角三角形 r=(a+b-c)/2。"),
    ("incenter-area-ratio", "內心分割面積比", "medium", 5, 1, [], ["內心", "面積比"], "內心到三邊距離相同，所以三個小三角形面積比等於對應邊長比。"),
    ("equilateral-inradius", "正三角形內切半徑", "medium", 5, 1, [], ["正三角形", "內切半徑"], "正三角形內切半徑為高的 1/3。"),
    ("incenter-area-from-side-ratio", "內心面積比反推全圖", "medium", 5, 1, [], ["內心", "面積比"], "內心分割面積比等於邊長比，可用部分面積反推總面積。"),
    ("axis-triangle-incenter-area", "坐標軸直角三角形內心面積", "hard", 5, 1, [], ["坐標", "內心", "面積"], "坐標軸直角三角形的內心為 (r,r)，再代入坐標面積公式。"),
    ("centroid-six-subtypes", "重心長度座標面積十五小類綜合", "medium", 6, 15, ["centroid-median-length", "centroid-median-inverse", "centroid-coordinate", "missing-vertex-from-centroid", "centroid-area-sixth", "centroid-area-third", "centroid-median-equation", "centroid-area-from-one-small", "parallelogram-hidden-centroid-length", "parallelogram-centroid-area", "centroid-quadrilateral-to-total-area", "parallelogram-two-centroids-distance", "parallelogram-midpoint-triangle-area", "parallelogram-centroid-segment-equation", "isosceles-area-from-centroid-distance"], ["重心", "中線", "面積"], "重心分中線為 2:1；三中線分成六等面積，連三頂點分成三等面積。"),
    ("centroid-median-length", "由中線求重心分段", "easy", 5, 1, [], ["重心", "中線"], "AG=2/3 AD，GD=1/3 AD。"),
    ("centroid-median-inverse", "由重心短段求中線", "easy", 5, 1, [], ["重心", "中線"], "若知道短段 GD，則 AD=3GD。"),
    ("centroid-coordinate", "三點求重心坐標", "medium", 5, 1, [], ["重心坐標"], "重心坐標為三頂點坐標平均。"),
    ("missing-vertex-from-centroid", "由重心反推第三頂點", "medium", 5, 1, [], ["重心坐標", "反推"], "把重心平均公式改寫成未知頂點坐標。"),
    ("centroid-area-sixth", "重心六等面積", "medium", 5, 1, [], ["重心", "面積"], "三條中線把三角形分成六個等面積小三角形。"),
    ("centroid-area-third", "重心三等面積", "medium", 5, 1, [], ["重心", "面積"], "重心連三頂點會分成三個等面積三角形。"),
    ("centroid-median-equation", "重心中線比例一次式", "medium", 5, 1, [], ["重心", "一次式"], "利用 BG:GE=2:1 建立一次方程式。"),
    ("centroid-area-from-one-small", "由重心小三角形求全圖面積", "medium", 5, 1, [], ["重心", "面積"], "一個六等分小三角形面積乘以 6，就是全圖面積。"),
    ("parallelogram-hidden-centroid-length", "平行四邊形隱藏重心求長度", "hard", 5, 1, [], ["重心", "平行四邊形"], "對角線中點與邊中點可讓兩條中線相交，產生隱藏重心，常用 OM=BD/6。"),
    ("parallelogram-centroid-area", "平行四邊形隱藏重心求面積", "hard", 5, 1, [], ["重心", "平行四邊形", "面積"], "先看出隱藏重心，再用三角形是平行四邊形一半、重心三等分面積。"),
    ("centroid-quadrilateral-to-total-area", "重心中點四邊形反推全圖面積", "medium", 5, 1, [], ["重心", "面積"], "重心與兩個邊中點形成的四邊形常佔原三角形的 1/3。"),
    ("parallelogram-two-centroids-distance", "平行四邊形兩重心距離", "hard", 5, 1, [], ["重心", "平行四邊形", "距離"], "平行四邊形兩個相關三角形的重心距離常等於對角線的 1/3。"),
    ("parallelogram-midpoint-triangle-area", "平行四邊形中點小三角形面積", "hard", 5, 1, [], ["平行四邊形", "面積比"], "對角線交點與邊中點形成的小三角形常佔平行四邊形面積的 1/12。"),
    ("parallelogram-centroid-segment-equation", "平行四邊形兩重心分段一次式", "medium", 5, 1, [], ["重心", "一次式"], "兩個相關三角形的重心可把對角線分成三段等長，用每段 = 全長/3 建方程式。"),
    ("isosceles-area-from-centroid-distance", "等腰三角形由重心距求面積", "hard", 5, 1, [], ["等腰三角形", "重心", "面積"], "等腰三角形頂點到底邊的高也是中線，AG=2h/3，可先求高再求面積。"),
    ("coordinate-five-subtypes", "座標平面三心八小類綜合", "medium", 6, 8, ["right-triangle-circumcenter-coordinate", "three-point-centroid-coordinate", "axis-triangle-incenter", "right-triangle-og-distance", "circumcenter-point-check", "circumcenter-coordinate-general", "right-triangle-coordinate-og", "euler-line-orthocenter-coordinate"], ["坐標", "外心", "重心", "內心"], "坐標題先定位三心公式：直角外心取斜邊中點、重心取平均、內心常落在 (r,r)。"),
    ("right-triangle-circumcenter-coordinate", "座標直角三角形外心", "medium", 5, 1, [], ["坐標", "外心"], "直角三角形外心是斜邊中點。"),
    ("three-point-centroid-coordinate", "座標三點重心", "medium", 5, 1, [], ["坐標", "重心"], "重心為三點坐標平均。"),
    ("axis-triangle-incenter", "坐標軸直角三角形內心", "hard", 5, 1, [], ["坐標", "內心"], "坐標軸圍成的直角三角形，內心可寫成 (r,r)。"),
    ("right-triangle-og-distance", "直角三角形外心重心距", "medium", 5, 1, [], ["外心", "重心", "距離"], "直角三角形 OG=斜邊/6。"),
    ("circumcenter-point-check", "判斷點是否在外接圓上", "easy", 5, 1, [], ["外接圓", "距離"], "頂點若在外接圓上，該點到圓心距離必等於半徑。"),
    ("circumcenter-coordinate-general", "三點共圓求外心與面積", "medium", 5, 1, [], ["坐標", "外心", "面積"], "檢查三點到同一點距離相等，可判定外心。"),
    ("right-triangle-coordinate-og", "座標直角三角形求外心重心距", "medium", 5, 1, [], ["坐標", "外心", "重心"], "先求斜邊中點與坐標平均，也可直接用 OG=斜邊/6。"),
    ("euler-line-orthocenter-coordinate", "尤拉線由外心重心求垂心", "hard", 5, 1, [], ["尤拉線", "垂心", "坐標"], "尤拉線上 G=(H+2O)/3，所以 H=3G-2O。"),
    ("special-five-subtypes", "正三角形與直角三心十小類綜合", "medium", 6, 10, ["equilateral-radii-ratio", "equilateral-area-from-inradius", "equilateral-area-from-circumradius", "right-triangle-go", "right-triangle-rr-perimeter", "centroid-to-vertex-sum", "right-triangle-hypotenuse-from-og", "right-triangle-perimeter-from-rr", "equilateral-height-from-circumradius", "equilateral-incircle-circumcircle-area-ratio"], ["正三角形", "直角三角形", "三心"], "正三角形三心合一；直角三角形外心在斜邊中點，搭配重心與內切半徑公式。"),
    ("equilateral-radii-ratio", "正三角形內外半徑比", "easy", 5, 1, [], ["正三角形", "半徑比"], "正三角形 R:r=2:1。"),
    ("equilateral-area-from-inradius", "由內切半徑求正三角形面積", "medium", 5, 1, [], ["正三角形", "面積"], "由 a=2√3r 反推邊長再求面積。"),
    ("equilateral-area-from-circumradius", "由外接半徑求正三角形面積", "medium", 5, 1, [], ["正三角形", "面積"], "正三角形 R=a/√3，可反推邊長與面積。"),
    ("right-triangle-go", "直角三角形外心重心距公式", "medium", 5, 1, [], ["直角三角形", "OG"], "直角三角形 OG=斜邊/6。"),
    ("right-triangle-rr-perimeter", "直角三角形內外半徑與周長", "medium", 5, 1, [], ["直角三角形", "內切半徑"], "R=c/2，r=(a+b-c)/2。"),
    ("centroid-to-vertex-sum", "重心到三頂點距離和", "medium", 5, 1, [], ["重心", "中線"], "重心到頂點距離和是三條中線長度和的 2/3。"),
    ("right-triangle-hypotenuse-from-og", "由外心重心距反推斜邊與外接圓", "medium", 5, 1, [], ["直角三角形", "OG", "外接圓"], "直角三角形 OG=斜邊/6，可反推斜邊與外接半徑。"),
    ("right-triangle-perimeter-from-rr", "由內外半徑反推直角三角形周長", "hard", 5, 1, [], ["直角三角形", "半徑", "周長"], "直角三角形周長 P=4R+2r。"),
    ("equilateral-height-from-circumradius", "由外接半徑求正三角形高", "medium", 5, 1, [], ["正三角形", "高"], "正三角形 R=2h/3，所以 h=3R/2。"),
    ("equilateral-incircle-circumcircle-area-ratio", "正三角形內外圓面積比", "medium", 5, 1, [], ["正三角形", "面積比"], "半徑比 1:2，圓面積比為 1:4。"),
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
        "usage": [f"用於 {CHAPTER_NAME} 的三心性質、長度比例、面積比例與座標計算無限練習。"],
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
