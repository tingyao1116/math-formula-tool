import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


CHAPTER_CODE = "j6-2-3"
CHAPTER_TITLE = "柱體與錐體"


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
        "stage": "國中",
        "grade": "國三",
        "term": "下",
        "chapter": CHAPTER_TITLE,
        "domain": "幾何",
        "prompt": "",
        "answer": "",
        "tags": [CHAPTER_CODE, CHAPTER_TITLE, "球", "圓錐", "角錐", "無限練習", *tags],
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

sphere_related = [
    "practice-j6-2-3-sphere-section-radius-distance",
    "practice-j6-2-3-sphere-section-circle-measure",
    "practice-j6-2-3-sphere-section-reverse",
    "practice-j6-2-3-sphere-great-circle",
]
cone_related = [
    "practice-j6-2-3-cone-sector-angle-arc",
    "practice-j6-2-3-cone-pythagorean",
    "practice-j6-2-3-cone-surface-area",
    "practice-j6-2-3-cone-area-ratio",
]
pyramid_related = [
    "practice-j6-2-3-pyramid-counting",
    "practice-j6-2-3-pyramid-euler",
    "practice-j6-2-3-pyramid-reverse",
]

practice_items = [
    make_practice(
        "j6-2-3-sphere-section-four-subtypes",
        "球截面半徑、面積與大圓綜合",
        6,
        "medium",
        ["球截面", "截圓", "大圓", "畢氏定理"],
        "球半徑 R、截圓半徑 r、球心到截平面距離 h 滿足 R² = r² + h²；通過球心時截面最大。",
        related=sphere_related,
        subtype_count=4,
        usage=["適合練習球被平面截出的直角三角形關係，以及由截圓面積或周長反推半徑。"],
    ),
    make_practice(
        "j6-2-3-sphere-section-radius-distance",
        "球截面半徑與球心距離",
        5,
        "medium",
        ["球截面", "半徑", "距離"],
        "把球心、截圓圓心與截圓上一點連成直角三角形，再用 R² = r² + h²。",
    ),
    make_practice(
        "j6-2-3-sphere-section-circle-measure",
        "截圓面積與周長計算",
        5,
        "medium",
        ["截圓", "面積", "周長"],
        "先求截圓半徑，再代入面積 πr² 或周長 2πr。",
    ),
    make_practice(
        "j6-2-3-sphere-section-reverse",
        "由截圓資訊反求球半徑",
        5,
        "medium",
        ["反推", "球半徑", "截圓"],
        "由截圓面積或周長先還原截圓半徑，再和球心距離組成直角三角形。",
    ),
    make_practice(
        "j6-2-3-sphere-great-circle",
        "大圓與最大截面判定",
        5,
        "easy",
        ["大圓", "最大截面", "球"],
        "平面通過球心時，截圓半徑等於球半徑，截面面積最大。",
    ),
    make_practice(
        "j6-2-3-cone-surface-four-subtypes",
        "圓錐展開、母線與表面積綜合",
        6,
        "medium",
        ["圓錐", "母線", "扇形", "表面積"],
        "圓錐側面展開是扇形；弧長等於底面周長，且母線、底面半徑、高形成直角三角形。",
        related=cone_related,
        subtype_count=4,
        usage=["適合把圓錐展開圖、勾股定理、側面積與表面積放在同一章節練習。"],
    ),
    make_practice(
        "j6-2-3-cone-sector-angle-arc",
        "圓錐展開扇形圓心角",
        5,
        "medium",
        ["圓錐展開", "扇形", "圓心角"],
        "扇形圓心角 θ = 360° × 底面半徑 ÷ 母線長。",
    ),
    make_practice(
        "j6-2-3-cone-pythagorean",
        "圓錐高、半徑與母線",
        5,
        "medium",
        ["圓錐", "母線", "勾股定理"],
        "圓錐的高、底面半徑與母線長形成直角三角形。",
    ),
    make_practice(
        "j6-2-3-cone-surface-area",
        "圓錐側面積與表面積",
        5,
        "medium",
        ["圓錐", "側面積", "表面積"],
        "圓錐側面積為 πrR，表面積為 πr² + πrR。",
    ),
    make_practice(
        "j6-2-3-cone-area-ratio",
        "圓錐側面積與底面積比",
        5,
        "medium",
        ["圓錐", "面積比", "母線"],
        "側面積與底面積的比為 (πrR):(πr²)=R:r。",
    ),
    make_practice(
        "j6-2-3-pyramid-counting-three-subtypes",
        "角錐數量規律與尤拉公式綜合",
        6,
        "medium",
        ["角錐", "頂點", "邊", "面", "尤拉公式"],
        "n 角錐有 V=n+1、F=n+1、E=2n；一般凸多面體仍滿足 V−E+F=2。",
        related=pyramid_related,
        subtype_count=3,
        notes=["截圖中單純問『有哪些公式』或只有大方向描述的題目沒有直接使用；保留可由數量關係或尤拉公式完整求解的題型。"],
    ),
    make_practice(
        "j6-2-3-pyramid-counting",
        "n 角錐頂點邊面數量規律",
        5,
        "easy",
        ["角錐", "數量規律"],
        "n 角錐的底面是 n 邊形，加上一個錐頂，因此 V=n+1、F=n+1、E=2n。",
    ),
    make_practice(
        "j6-2-3-pyramid-euler",
        "尤拉公式與多面體反推",
        5,
        "medium",
        ["尤拉公式", "多面體"],
        "凸多面體滿足 V−E+F=2，可由其中兩個量反推第三個量。",
    ),
    make_practice(
        "j6-2-3-pyramid-reverse",
        "角錐 n 值反向推算",
        5,
        "medium",
        ["角錐", "反推", "n 值"],
        "先把頂點、邊、面都寫成 n 的式子，再由題目給的總和或差建立方程式。",
    ),
]

for item in practice_items:
    upsert_practice(practices, item)

for order, key in enumerate(
    [
        "j6-2-3-sphere-section-four-subtypes",
        "j6-2-3-cone-surface-four-subtypes",
        "j6-2-3-pyramid-counting-three-subtypes",
    ],
    start=1,
):
    upsert_binding(bindings, f"practice-{key}", order)

data["updatedAt"] = datetime.now(timezone.utc).isoformat()
DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
