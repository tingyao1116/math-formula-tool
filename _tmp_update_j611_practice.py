import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


def upsert_practice(practices, item):
    for index, existing in enumerate(practices):
        if existing.get("id") == item["id"]:
            practices[index] = {**existing, **item}
            return
    practices.append(item)


def make_practice(
    practice_id,
    title,
    generator_key,
    difficulty="medium",
    question_count=5,
    subtype_count=0,
    related=None,
    tags=None,
    usage=None,
    tips=None,
    notes=None,
):
    return {
        "id": practice_id,
        "enabled": True,
        "mode": "generator",
        "title": title,
        "generatorKey": generator_key,
        "difficulty": difficulty,
        "questionCount": question_count,
        "subtypeCount": subtype_count,
        "relatedPracticeIds": related or [],
        "chapterCode": "j6-1-1",
        "stage": "國中",
        "grade": "國三",
        "term": "下",
        "chapter": "二次函數",
        "domain": "函數",
        "prompt": "",
        "answer": "",
        "tags": ["j6-1-1", "二次函數", "y=ax^2", *(tags or []), "無限練習"],
        "usage": usage or [],
        "examples": [],
        "tips": tips or [],
        "notes": notes or [],
        "mistakes": [],
    }


payload = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
practices = payload.setdefault("practices", [])
bindings = payload.setdefault("bindings", [])

basic_related = [
    "practice-j6-1-1-quadratic-definition",
    "practice-j6-1-1-opening-vertex-axis",
    "practice-j6-1-1-opening-width-order",
    "practice-j6-1-1-find-coefficient-from-point",
    "practice-j6-1-1-yaxis-reflection",
    "practice-j6-1-1-quadrant-location",
]
application_related = [
    "practice-j6-1-1-square-in-parabola",
    "practice-j6-1-1-horizontal-chord-length",
    "practice-j6-1-1-triangle-area-on-parabola",
    "practice-j6-1-1-line-parabola-grid-points",
    "practice-j6-1-1-parabola-modeling",
]

shared_basic_tip = "對 \\(y=ax^2\\) 而言：\\(a>0\\) 開口向上、\\(a<0\\) 開口向下，\\(|a|\\) 越大開口越窄，頂點固定為 \\((0,0)\\)，對稱軸為 \\(x=0\\)。"
shared_application_tip = "遇到圖形應用題，先把交點代入 \\(y=ax^2\\)，再用對稱性、水平距離或面積公式收尾。"

practice_items = [
    make_practice(
        "practice-j6-1-1-parabola-ax2-four-subtypes",
        "二次函數 y=ax^2 基本圖形判讀綜合",
        "j6-1-1-parabola-ax2-four-subtypes",
        question_count=6,
        subtype_count=6,
        related=basic_related,
        tags=["基本圖形", "定義判別", "開口方向", "對稱軸"],
        usage=["整合定義判別、開口方向、開口大小、通過點求係數、對稱點與象限判定。"],
        tips=[shared_basic_tip],
        notes=["由截圖中的基本題型合併成一個大類；每題會重新抽係數、點或比較對象，不是固定題目輪播。"],
    ),
    make_practice("practice-j6-1-1-quadratic-definition", "二次函數的定義判別", "j6-1-1-quadratic-definition", "easy", tags=["定義判別"], tips=["最高次必須是二次，且二次項係數不能為 0；變數在分母或絕對值中不算標準二次函數。"]),
    make_practice("practice-j6-1-1-opening-vertex-axis", "開口方向與頂點特徵快問快答", "j6-1-1-opening-vertex-axis", "easy", tags=["開口方向", "頂點", "對稱軸"], tips=[shared_basic_tip]),
    make_practice("practice-j6-1-1-opening-width-order", "開口大小的排序練習", "j6-1-1-opening-width-order", "medium", tags=["開口大小", "係數比較"], tips=["比較胖瘦看 \\(|a|\\)：\\(|a|\\) 越大，圖形越窄；\\(|a|\\) 越小，圖形越寬。"]),
    make_practice("practice-j6-1-1-find-coefficient-from-point", "通過特定點反求係數 a", "j6-1-1-find-coefficient-from-point", "medium", tags=["代點求係數"], tips=["已知點 \\((p,q)\\) 在 \\(y=ax^2\\) 上，就代入得到 \\(q=ap^2\\)，所以 \\(a=\\dfrac{q}{p^2}\\)。"]),
    make_practice("practice-j6-1-1-yaxis-reflection", "圖形對稱點的坐標推算", "j6-1-1-yaxis-reflection", "easy", tags=["對稱性", "坐標推算"], tips=["\\(y=ax^2\\) 關於 \\(y\\) 軸對稱，因此 \\((p,q)\\) 在圖形上時，\\((-p,q)\\) 也在圖形上。"]),
    make_practice("practice-j6-1-1-quadrant-location", "圖形所在象限判定", "j6-1-1-quadrant-location", "easy", tags=["象限判定"], tips=["除原點外，\\(a>0\\) 時圖形在第一、二象限；\\(a<0\\) 時圖形在第三、四象限。"]),
    make_practice(
        "practice-j6-1-1-parabola-applications-five-subtypes",
        "二次函數圖形的坐標幾何與建模綜合",
        "j6-1-1-parabola-applications-five-subtypes",
        question_count=5,
        subtype_count=5,
        related=application_related,
        tags=["坐標幾何", "面積", "水平弦", "建模"],
        usage=["整合拋物線內嵌正方形、水平弦長、三角形面積、格子點判讀與河道建模。"],
        tips=[shared_application_tip],
        notes=["截圖中缺圖或只寫大方向的題目沒有直接照搬；改寫成條件完整、可參數化的題型。"],
    ),
    make_practice("practice-j6-1-1-square-in-parabola", "拋物線內嵌正方形", "j6-1-1-square-in-parabola", "medium", tags=["正方形", "面積", "周長"], tips=["若正方形關於 \\(y\\) 軸對稱且上頂點在 \\(y=ax^2\\) 上，設邊長 \\(s\\)，可用 \\((s/2,s)\\) 代入。"]),
    make_practice("practice-j6-1-1-horizontal-chord-length", "水平弦長與距離計算", "j6-1-1-horizontal-chord-length", "medium", tags=["水平弦", "交點距離"], tips=["水平線 \\(y=k\\) 與 \\(y=ax^2\\) 相交時，先解 \\(k=ax^2\\)，兩交點的水平距離就是兩個 \\(x\\) 坐標相減。"]),
    make_practice("practice-j6-1-1-triangle-area-on-parabola", "拋物線上的三角形面積", "j6-1-1-triangle-area-on-parabola", "medium", tags=["三角形面積", "水平線"], tips=["若 \\(AB\\parallel x\\) 軸，\\(\\triangle AOB\\) 的底為 \\(AB\\)，高就是水平線到原點的距離。"]),
    make_practice("practice-j6-1-1-line-parabola-grid-points", "多個函數的格子點判讀", "j6-1-1-line-parabola-grid-points", "medium", tags=["格子點", "區域判讀"], tips=["先由 \\(ax^2\\le k\\) 找出可能的整數 \\(x\\)，再逐一計算可搭配的整數 \\(y\\) 個數。"]),
    make_practice("practice-j6-1-1-parabola-modeling", "二次函數的實際建模", "j6-1-1-parabola-modeling", "medium", tags=["建模", "河道", "拋物線"], tips=["把頂點設為原點後，利用已知寬度的一半與深度代入 \\(y=ax^2\\)，先求出 \\(a\\)。"]),
]

for item in practice_items:
    upsert_practice(practices, item)

bindings[:] = [
    row
    for row in bindings
    if not (
        isinstance(row, dict)
        and row.get("targetType") == "chapter"
        and row.get("targetId") == "j6-1-1"
        and row.get("practiceId") in {
            "practice-j6-1-1-parabola-ax2-four-subtypes",
            "practice-j6-1-1-parabola-applications-five-subtypes",
        }
    )
]
bindings.extend(
    [
        {
            "practiceId": "practice-j6-1-1-parabola-ax2-four-subtypes",
            "targetType": "chapter",
            "targetId": "j6-1-1",
            "enabled": True,
            "order": 1,
        },
        {
            "practiceId": "practice-j6-1-1-parabola-applications-five-subtypes",
            "targetType": "chapter",
            "targetId": "j6-1-1",
            "enabled": True,
            "order": 2,
        },
    ]
)

meta = payload.setdefault("meta", {})
meta["practiceCount"] = len(practices)
meta["bindingCount"] = len(bindings)
meta["updatedAt"] = datetime.now(timezone.utc).isoformat()

DB_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"updated {len(practice_items)} j6-1-1 practices")
