import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB = ROOT / "program-db" / "database" / "practice-db.json"

CHAPTER = "j5-3-2"
STAGE = "國中"
GRADE = "九年級"
TERM = "上"
CHAPTER_NAME = "幾何證明的常用工具"
DOMAIN = "幾何"

COMMON_MISTAKES = [
    "證明題要先說明使用哪個定義或定理，例如外心、內心、重心、垂直平分線或角平分線。",
    "全等與相似不要只看圖，要明確列出對應邊、對應角或平行造成的角相等。",
    "圓的證明要先判斷是同弧、弦切角、圓內接四邊形，還是切線垂直半徑。",
]

practices = [
    ("centers-five-subtypes", "三心基本性質證明五小類綜合", "medium", 6, 5, ["circumcenter-equal-distance", "incenter-equal-distance", "centroid-median-ratio", "right-triangle-circumcenter", "isosceles-centers-line"], ["三心", "外心", "內心", "重心"], "外心看頂點等距，內心看三邊等距，重心看中線 2:1。"),
    ("circumcenter-equal-distance", "外心到三頂點等距", "easy", 5, 1, [], ["外心", "垂直平分線"], "外心是三邊垂直平分線交點。"),
    ("incenter-equal-distance", "內心到三邊等距", "easy", 5, 1, [], ["內心", "角平分線"], "內心是角平分線交點，到三邊距離相等。"),
    ("centroid-median-ratio", "重心分中線比例", "easy", 5, 1, [], ["重心", "中線"], "重心把中線分成 2:1。"),
    ("right-triangle-circumcenter", "直角三角形外心", "medium", 5, 1, [], ["直角三角形", "外心"], "直角三角形外心是斜邊中點。"),
    ("isosceles-centers-line", "等腰三角形三心共線", "medium", 5, 1, [], ["等腰三角形", "三心"], "等腰三角形三心落在對稱軸上。"),
    ("congruence-five-subtypes", "全等性質證明五小類綜合", "medium", 6, 5, ["isosceles-altitude-bisects", "perpendicular-bisector-point", "angle-bisector-symmetry", "square-shared-vertex", "equilateral-shared-vertex"], ["全等", "SSS", "SAS", "RHS"], "先列出能全等的兩個三角形，再推出對應邊角相等。"),
    ("isosceles-altitude-bisects", "等腰三角形高平分頂角", "medium", 5, 1, [], ["等腰", "RHS"], "等腰三角形底邊高可用全等證明也是角平分線。"),
    ("perpendicular-bisector-point", "垂直平分線等距", "easy", 5, 1, [], ["垂直平分線", "等距"], "垂直平分線上的點到兩端點等距。"),
    ("angle-bisector-symmetry", "角平分線到兩邊等距", "medium", 5, 1, [], ["角平分線", "距離"], "角平分線上的點到角兩邊距離相等。"),
    ("square-shared-vertex", "共頂點正方形全等", "medium", 5, 1, [], ["正方形", "旋轉全等"], "正方形常用邊相等與 90° 旋轉建立 SAS。"),
    ("equilateral-shared-vertex", "共頂點正三角形全等", "medium", 5, 1, [], ["正三角形", "旋轉全等"], "正三角形常用邊相等與 60° 旋轉建立 SAS。"),
    ("similarity-five-subtypes", "相似與比例證明五小類綜合", "medium", 6, 5, ["parallel-line-similarity", "right-altitude-geometric-mean", "butterfly-similarity", "angle-bisector-ratio", "altitude-circumcircle-product"], ["相似", "比例", "母子相似"], "先找 AA 相似，再把對應邊比例交叉相乘。"),
    ("parallel-line-similarity", "平行線截比例相似", "easy", 5, 1, [], ["平行線", "相似"], "平行線造成對應角相等。"),
    ("right-altitude-geometric-mean", "斜邊高平方公式證明", "medium", 5, 1, [], ["母子相似", "斜邊高"], "直角三角形斜邊高形成三個相似三角形。"),
    ("butterfly-similarity", "蝴蝶相似乘積關係", "medium", 5, 1, [], ["蝴蝶相似", "比例"], "平行線與對頂角可建立蝴蝶相似。"),
    ("angle-bisector-ratio", "內角平分線比例", "medium", 5, 1, [], ["角平分線", "比例"], "角平分線把對邊分成兩鄰邊的比例。"),
    ("altitude-circumcircle-product", "高與外接圓直徑乘積", "hard", 5, 1, [], ["外接圓", "相似"], "外接圓直徑與高常用相似三角形推出乘積式。"),
    ("circle-proof-five-subtypes", "圓與角度證明五小類綜合", "medium", 6, 5, ["parallel-chords-equal-arcs", "tangent-segments-equal", "cyclic-opposite-angles", "tangent-chord-similarity", "same-arc-angle-equal"], ["圓", "弦切角", "同弧"], "圓證明先辨認同弧、切線、平行弦或內接四邊形。"),
    ("parallel-chords-equal-arcs", "平行弦夾等弧", "medium", 5, 1, [], ["平行弦", "等弧"], "平行弦可推出夾弧相等。"),
    ("tangent-segments-equal", "同外點兩切線相等", "easy", 5, 1, [], ["切線", "全等"], "半徑垂直切線，再用 RHS 全等。"),
    ("cyclic-opposite-angles", "圓內接四邊形對角互補", "medium", 5, 1, [], ["圓內接四邊形", "對角互補"], "對角所對兩弧合為整圓。"),
    ("tangent-chord-similarity", "切割線相似證明", "medium", 5, 1, [], ["弦切角", "相似"], "弦切角等於同弧圓周角。"),
    ("same-arc-angle-equal", "同弧圓周角與弦切角", "medium", 5, 1, [], ["同弧", "弦切角"], "同弧所對圓周角相等，弦切角也等於同弧圓周角。"),
    ("centroid-area-five-subtypes", "重心與面積比例五小類綜合", "medium", 6, 5, ["centroid-three-triangles-area", "median-six-equal-areas", "centroid-midpoint-area-ratio", "parallelogram-centroid-point", "centroid-median-length"], ["重心", "面積比", "中線"], "中線平分面積，三條中線分成六個等面積小三角形。"),
    ("centroid-three-triangles-area", "重心連三頂點面積相等", "medium", 5, 1, [], ["重心", "面積"], "重心連三頂點會形成三個等面積三角形。"),
    ("median-six-equal-areas", "三中線六等面積", "medium", 5, 1, [], ["中線", "六等分"], "三條中線把三角形分成六個等面積小三角形。"),
    ("centroid-midpoint-area-ratio", "重心小三角形面積", "medium", 5, 1, [], ["重心", "面積計算"], "重心旁的小三角形常是全三角形的 1/6。"),
    ("parallelogram-centroid-point", "平行四邊形中的重心", "medium", 5, 1, [], ["平行四邊形", "重心"], "把平行四邊形對角線交點視為三角形邊中點。"),
    ("centroid-median-length", "重心中線長度計算", "easy", 5, 1, [], ["重心", "中線長"], "若 GD 已知，整條中線 AD=3GD。"),
]

big_suffixes = [
    "centers-five-subtypes",
    "congruence-five-subtypes",
    "similarity-five-subtypes",
    "circle-proof-five-subtypes",
    "centroid-area-five-subtypes",
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
        "usage": [f"練習 {CHAPTER_NAME} 的三心、全等、相似、圓角度與重心面積證明。"],
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
