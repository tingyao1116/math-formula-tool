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
    generator_key,
    title,
    difficulty="medium",
    question_count=5,
    subtype_count=1,
    related=None,
    tags=None,
    usage=None,
    tips=None,
    notes=None,
):
    return {
        "id": f"practice-{generator_key}",
        "enabled": True,
        "mode": "generator",
        "title": title,
        "generatorKey": generator_key,
        "difficulty": difficulty,
        "questionCount": question_count,
        "subtypeCount": subtype_count,
        "relatedPracticeIds": related or [],
        "chapterCode": "j6-1-3",
        "stage": "國中",
        "grade": "國三",
        "term": "下",
        "chapter": "二次函數",
        "domain": "函數",
        "prompt": "",
        "answer": "",
        "tags": ["j6-1-3", "二次函數應用", "極值", *(tags or []), "無限練習"],
        "usage": usage or [],
        "examples": [],
        "tips": tips or [],
        "notes": notes or [],
        "mistakes": [],
    }


payload = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
practices = payload.setdefault("practices", [])
bindings = payload.setdefault("bindings", [])

algebra_tip = "解應用題時先設變數，將目標量寫成二次函數，再用頂點或配方判斷最大值、最小值。"
geometry_tip = "固定周長求最大面積通常落在「越接近正方形越大」；拋物線通行題要先建立坐標系，再代入指定寬度或高度。"
business_tip = "收入或利潤常寫成「單價變動」乘以「數量變動」，形成開口向下的二次函數，最大值在頂點附近。"

algebra_related = [
    "practice-j6-1-3-number-sum-square-extrema",
    "practice-j6-1-3-line-distance-square",
    "practice-j6-1-3-linear-constraint-extrema",
]
geometry_related = [
    "practice-j6-1-3-rectangle-perimeter-area",
    "practice-j6-1-3-split-squares-minimum",
    "practice-j6-1-3-parabola-clearance",
    "practice-j6-1-3-water-channel-width",
]
business_related = [
    "practice-j6-1-3-ticket-revenue",
    "practice-j6-1-3-price-profit",
    "practice-j6-1-3-orchard-yield",
]

practice_items = [
    make_practice(
        "j6-1-3-algebra-extrema-three-subtypes",
        "代數限制與距離平方極值綜合",
        question_count=6,
        subtype_count=3,
        related=algebra_related,
        tags=["平方和", "數線", "代數約束"],
        usage=["適合先練習純代數模型，讓學生熟悉「設變數→列式→配方或找頂點」的基本流程。"],
        tips=[algebra_tip],
        notes=["截圖中的數字極值、數線距離平方和、代數約束題合併為同一大類；只保留可完整換參數的題型。"],
    ),
    make_practice(
        "j6-1-3-number-sum-square-extrema",
        "數字與平方和極值問題",
        tags=["兩數和", "平方和", "乘積"],
        tips=["兩數和固定時，平方和在兩數最接近時最小，乘積在兩數最接近時最大。"],
    ),
    make_practice(
        "j6-1-3-line-distance-square",
        "數線上的距離平方和極值",
        tags=["數線", "距離平方和"],
        tips=["到兩個定點的距離平方和最小點在中點；到多個定點時，最小點在坐標平均值。"],
    ),
    make_practice(
        "j6-1-3-linear-constraint-extrema",
        "代數約束下的極值計算",
        tags=["代入法", "線性限制", "極值"],
        tips=["先用限制式把其中一個變數表示成另一個變數，再把目標式化成一元二次函數。"],
    ),
    make_practice(
        "j6-1-3-geometry-modeling-four-subtypes",
        "幾何面積、通行限制與拋物線建模綜合",
        question_count=6,
        subtype_count=4,
        related=geometry_related,
        tags=["面積", "周長", "拋物線建模", "通行高度"],
        usage=["適合連結圖形與二次函數：先把長度、寬度或高度設成變數，再用頂點判斷最佳值。"],
        tips=[geometry_tip],
        notes=["截圖中靠圖才懂的題目已改成文字完整描述；河道、隧道、鐵絲分段都改成可參數化的完整題型。"],
    ),
    make_practice(
        "j6-1-3-rectangle-perimeter-area",
        "幾何圖形面積與周長極值",
        tags=["矩形面積", "固定周長"],
        tips=["周長固定時，矩形面積在長寬相等時最大。"],
    ),
    make_practice(
        "j6-1-3-split-squares-minimum",
        "鐵絲分段圍正方形的面積最小",
        tags=["分段", "平方和最小"],
        tips=["兩段長度固定總和時，兩個平方量的和在兩段相等時最小。"],
    ),
    make_practice(
        "j6-1-3-parabola-clearance",
        "拋物線建模與通行高度判定",
        tags=["隧道", "拋物線", "通行限制"],
        tips=["以中心線建立坐標系，車寬的一半就是要代入拋物線的 \\(x\\) 值。"],
    ),
    make_practice(
        "j6-1-3-water-channel-width",
        "拋物線河道與水面寬度變化",
        tags=["河道", "水面寬", "拋物線模型"],
        tips=["水深對應 \\(y\\)，水面半寬對應 \\(|x|\\)，最後寬度要乘以 2。"],
    ),
    make_practice(
        "j6-1-3-business-production-three-subtypes",
        "利潤策略、票價收入與產量決策綜合",
        question_count=6,
        subtype_count=3,
        related=business_related,
        tags=["收入", "利潤", "產量"],
        usage=["適合練習生活情境建模：單價或數量改變後，總收入、利潤或產量通常形成二次函數。"],
        tips=[business_tip],
        notes=["截圖中的票價、商品定價與果園產量類型合併為商業產量大類；避免只留下大方向說明，全部改成完整可計算題。"],
    ),
    make_practice(
        "j6-1-3-ticket-revenue",
        "票價調整與最高收入",
        tags=["票價", "最高收入"],
        tips=["設降價次數為 \\(x\\)，收入等於新票價乘以新人數。"],
    ),
    make_practice(
        "j6-1-3-price-profit",
        "商品定價與最大利潤",
        tags=["定價", "最大利潤"],
        tips=["利潤等於每件利潤乘以銷售量，通常是開口向下的二次函數。"],
    ),
    make_practice(
        "j6-1-3-orchard-yield",
        "果園產量與植樹密度問題",
        tags=["產量", "植樹密度"],
        tips=["總產量等於棵數乘以每棵產量；加種後一升一降，常形成二次函數。"],
    ),
]

for item in practice_items:
    upsert_practice(practices, item)

practice_ids = {item["id"] for item in practice_items}
bindings[:] = [
    row
    for row in bindings
    if not (
        isinstance(row, dict)
        and row.get("targetType") == "chapter"
        and row.get("targetId") == "j6-1-3"
        and row.get("practiceId") in practice_ids
    )
]

for order, practice_id in enumerate(
    [
        "practice-j6-1-3-algebra-extrema-three-subtypes",
        "practice-j6-1-3-geometry-modeling-four-subtypes",
        "practice-j6-1-3-business-production-three-subtypes",
    ],
    start=1,
):
    bindings.append(
        {
            "practiceId": practice_id,
            "targetType": "chapter",
            "targetId": "j6-1-3",
            "enabled": True,
            "order": order,
        }
    )

meta = payload.setdefault("meta", {})
meta["practiceCount"] = len(practices)
meta["bindingCount"] = len(bindings)
meta["updatedAt"] = datetime.now(timezone.utc).isoformat()

DB_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"updated {len(practice_items)} j6-1-3 practices and 3 chapter bindings")
