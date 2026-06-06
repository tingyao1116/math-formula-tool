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
        "chapterCode": "j6-1-2",
        "stage": "國中",
        "grade": "國三",
        "term": "下",
        "chapter": "二次函數",
        "domain": "函數",
        "prompt": "",
        "answer": "",
        "tags": ["j6-1-2", "二次函數", "頂點式", *(tags or []), "無限練習"],
        "usage": usage or [],
        "examples": [],
        "tips": tips or [],
        "notes": notes or [],
        "mistakes": [],
    }


payload = json.loads(DB_PATH.read_text(encoding="utf-8-sig"))
practices = payload.setdefault("practices", [])
bindings = payload.setdefault("bindings", [])

vertex_tip = "頂點式 \\(y=a(x-h)^2+k\\) 可直接讀出頂點 \\((h,k)\\) 與對稱軸 \\(x=h\\)；\\(a>0\\) 有最小值 \\(k\\)，\\(a<0\\) 有最大值 \\(k\\)。"
translation_tip = "從 \\(y=ax^2\\) 平移：右 \\(h\\)、上 \\(k\\) 得 \\(y=a(x-h)^2+k\\)；平移只改變頂點位置，不改變 \\(a\\)。"
intersection_tip = "與 \\(x\\) 軸交點可令 \\(y=0\\)；交點個數可用判別式 \\(D=b^2-4ac\\)，也可用頂點位置搭配開口方向判斷。"

vertex_related = [
    "practice-j6-1-2-vertex-form-read",
    "practice-j6-1-2-completing-square-extreme",
    "practice-j6-1-2-function-from-vertex-point",
]
translation_related = [
    "practice-j6-1-2-basic-translation-equation",
    "practice-j6-1-2-vertex-axis-translation",
    "practice-j6-1-2-translation-reverse",
    "practice-j6-1-2-congruence-same-a",
    "practice-j6-1-2-point-after-translation",
]
intersection_related = [
    "practice-j6-1-2-x-intercepts-coordinate",
    "practice-j6-1-2-discriminant-count",
    "practice-j6-1-2-vertex-position-intersection",
]

practice_items = [
    make_practice(
        "j6-1-2-vertex-form-extrema-three-subtypes",
        "頂點式、配方法與極值判定綜合",
        question_count=6,
        subtype_count=3,
        related=vertex_related,
        tags=["配方法", "極值", "對稱軸"],
        usage=["適合放在頂點式教完後，集中練習從式子讀圖形特徵、由一般式配方，以及由頂點與通過點反求函數。"],
        tips=[vertex_tip],
        notes=["截圖中的「頂點式讀取」與「配方法求極值」保留為小類；反求函數式補成完整可參數化題型。"],
    ),
    make_practice(
        "j6-1-2-vertex-form-read",
        "頂點式參數的直覺讀取",
        "easy",
        tags=["頂點式", "極值"],
        tips=[vertex_tip],
    ),
    make_practice(
        "j6-1-2-completing-square-extreme",
        "配方法轉換與極值判定",
        tags=["配方法", "頂點", "對稱軸"],
        tips=["一般式可先配方成頂點式，再讀頂點、對稱軸與最大或最小值。"],
    ),
    make_practice(
        "j6-1-2-function-from-vertex-point",
        "給定頂點與通過點反求函數式",
        tags=["反求函數", "代入法"],
        tips=["先設 \\(y=a(x-h)^2+k\\)，再把通過點代入求 \\(a\\)。"],
    ),
    make_practice(
        "j6-1-2-translation-graph-five-subtypes",
        "平移變換與圖形重合綜合",
        question_count=5,
        subtype_count=5,
        related=translation_related,
        tags=["平移", "圖形重合", "頂點變化"],
        usage=["適合訓練學生不用畫圖，也能由頂點位移、式子中的 \\(h,k\\) 與 \\(a\\) 值判斷圖形變化。"],
        tips=[translation_tip],
        notes=["截圖中的平移關係、圖形重合與特定點坐標變化已合併在同一個大類；只保留能換參數重生的完整題型。"],
    ),
    make_practice(
        "j6-1-2-basic-translation-equation",
        "基礎平移寫出新函數式",
        tags=["平移", "函數式"],
        tips=[translation_tip],
    ),
    make_practice(
        "j6-1-2-vertex-axis-translation",
        "頂點坐標與對稱軸的位移追蹤",
        tags=["頂點", "對稱軸", "平移"],
        tips=["頂點跟著平移，對稱軸永遠是新頂點的 \\(x\\) 坐標。"],
    ),
    make_practice(
        "j6-1-2-translation-reverse",
        "平移關係判定與反求位移",
        tags=["反推平移", "頂點比較"],
        tips=["比較新舊頂點：\\((h_2-h_1,k_2-k_1)\\) 就是平移位移。"],
    ),
    make_practice(
        "j6-1-2-congruence-same-a",
        "圖形重合判定與相同 a 值",
        tags=["圖形重合", "開口大小"],
        tips=["只靠平移能重合的拋物線，必須開口方向與開口大小都相同，也就是 \\(a\\) 相同。"],
    ),
    make_practice(
        "j6-1-2-point-after-translation",
        "圖形上特定點的坐標變化",
        tags=["點坐標", "平移"],
        tips=["整張圖形平移時，每一個點都加上相同位移量。"],
    ),
    make_practice(
        "j6-1-2-x-axis-intersection-three-subtypes",
        "與 x 軸交點與判別式綜合",
        question_count=6,
        subtype_count=3,
        related=intersection_related,
        tags=["x軸交點", "判別式", "頂點位置"],
        usage=["適合在講完頂點式與一般式後，統整交點坐標、判別式與開口方向的判斷。"],
        tips=[intersection_tip],
        notes=["截圖中的「用判別式」與「用頂點位置」判斷交點個數容易重複，這裡拆成兩個小類，但共同附掛在同一大類。"],
    ),
    make_practice(
        "j6-1-2-x-intercepts-coordinate",
        "計算二次函數與 x 軸交點坐標",
        tags=["交點坐標", "解方程"],
        tips=["令 \\(y=0\\) 後解二次方程式，交點寫成 \\((x,0)\\)。"],
    ),
    make_practice(
        "j6-1-2-discriminant-count",
        "用判別式判斷與 x 軸交點個數",
        tags=["判別式", "交點個數"],
        tips=["\\(D>0\\) 有兩個交點，\\(D=0\\) 有一個交點，\\(D<0\\) 沒有交點。"],
    ),
    make_practice(
        "j6-1-2-vertex-position-intersection",
        "結合頂點位置與開口判斷交點個數",
        tags=["頂點位置", "開口方向", "交點個數"],
        tips=["開口向上看最低點，開口向下看最高點；頂點相對於 \\(x\\) 軸的位置決定是否穿越。"],
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
        and row.get("targetId") == "j6-1-2"
        and row.get("practiceId") in practice_ids
    )
]

for order, practice_id in enumerate(
    [
        "practice-j6-1-2-vertex-form-extrema-three-subtypes",
        "practice-j6-1-2-translation-graph-five-subtypes",
        "practice-j6-1-2-x-axis-intersection-three-subtypes",
    ],
    start=1,
):
    bindings.append(
        {
            "practiceId": practice_id,
            "targetType": "chapter",
            "targetId": "j6-1-2",
            "enabled": True,
            "order": order,
        }
    )

meta = payload.setdefault("meta", {})
meta["practiceCount"] = len(practices)
meta["bindingCount"] = len(bindings)
meta["updatedAt"] = datetime.now(timezone.utc).isoformat()

DB_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"updated {len(practice_items)} j6-1-2 practices and 3 chapter bindings")
