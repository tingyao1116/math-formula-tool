import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


CHAPTER_CODE = "j6-2-2"
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
        "tags": [CHAPTER_CODE, CHAPTER_TITLE, "無限練習", *tags],
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

basic_related = [
    "practice-j6-2-2-triangular-prism-volume",
    "practice-j6-2-2-rect-prism-surface-volume",
    "practice-j6-2-2-cylinder-surface-volume",
]
composite_related = [
    "practice-j6-2-2-hollow-cylinder-volume",
    "practice-j6-2-2-prism-cylinder-composite",
    "practice-j6-2-2-solid-scaling-ratio",
]
shortest_related = [
    "practice-j6-2-2-cuboid-surface-shortest-path",
    "practice-j6-2-2-cylinder-surface-shortest-path",
]
euler_related = [
    "practice-j6-2-2-prism-counting",
    "practice-j6-2-2-euler-formula",
]
water_related = [
    "practice-j6-2-2-water-displacement",
    "practice-j6-2-2-water-pipe-volume",
]

practice_items = [
    make_practice(
        "j6-2-2-basic-surface-volume-three-subtypes",
        "柱體表面積與體積基本計算",
        6,
        "medium",
        ["柱體體積", "表面積", "三角柱", "長方體", "圓柱"],
        "柱體體積 = 底面積 × 高；表面積 = 兩個底面積 + 側面積總和。",
        related=basic_related,
        subtype_count=3,
        usage=["適合先練三角柱、長方體、圓柱的基本公式代入，再進入複合題。"],
    ),
    make_practice(
        "j6-2-2-triangular-prism-volume",
        "三角柱體積計算",
        5,
        "medium",
        ["三角柱", "體積", "底面積"],
        "先算三角形底面積，再乘以柱高。",
    ),
    make_practice(
        "j6-2-2-rect-prism-surface-volume",
        "長方體表面積與體積",
        5,
        "medium",
        ["長方體", "表面積", "體積"],
        "長方體體積為長 × 寬 × 高，表面積為 2(lw+lh+wh)。",
    ),
    make_practice(
        "j6-2-2-cylinder-surface-volume",
        "圓柱體積與表面積",
        5,
        "medium",
        ["圓柱", "表面積", "體積", "π"],
        "圓柱體積為 πr²h，表面積為 2πr²+2πrh。",
    ),
    make_practice(
        "j6-2-2-composite-scaling-three-subtypes",
        "複合體積與比例變化綜合",
        6,
        "medium",
        ["複合立體", "挖孔", "比例變化"],
        "複合體積先判斷加法或減法；長度倍率 k 對應面積 k²、體積 k³。",
        related=composite_related,
        subtype_count=3,
        notes=["截圖中的傾倒水箱、房子模型等題目若缺少明確幾何假設容易不完整，因此改成文字條件足夠的挖孔、空心圓柱與倍率題。"],
    ),
    make_practice(
        "j6-2-2-hollow-cylinder-volume",
        "空心圓柱材料體積",
        5,
        "medium",
        ["空心圓柱", "材料體積", "圓柱"],
        "空心圓柱材料體積 = 外圓柱體積 − 內圓柱體積。",
    ),
    make_practice(
        "j6-2-2-prism-cylinder-composite",
        "挖孔與組合柱體體積",
        5,
        "medium",
        ["挖孔", "組合立體", "體積"],
        "先算原本立體體積，再扣掉被挖去或加入的柱體體積。",
    ),
    make_practice(
        "j6-2-2-solid-scaling-ratio",
        "立體比例變化與倍率",
        5,
        "medium",
        ["相似立體", "倍率", "表面積", "體積"],
        "長度變為 k 倍，面積變為 k² 倍，體積變為 k³ 倍。",
    ),
    make_practice(
        "j6-2-2-surface-shortest-path-two-subtypes",
        "立體展開圖與表面最短路徑",
        6,
        "medium",
        ["展開圖", "最短路徑", "長方體", "圓柱"],
        "把立體表面展開成平面，最短路徑就是展開圖上的直線距離。",
        related=shortest_related,
        subtype_count=2,
        notes=["需要圖片才能唯一理解的螞蟻繞行題，改為長方體尺寸或圓柱半徑、高度皆明確的展開圖題型。"],
    ),
    make_practice(
        "j6-2-2-cuboid-surface-shortest-path",
        "長方體表面最短路徑",
        5,
        "medium",
        ["長方體", "展開圖", "最短路徑"],
        "長方體跨面最短路徑常把兩個相鄰面展開成一個長方形，再用畢氏定理。",
    ),
    make_practice(
        "j6-2-2-cylinder-surface-shortest-path",
        "圓柱側面展開最短路徑",
        5,
        "medium",
        ["圓柱", "側面展開", "最短路徑"],
        "圓柱側面展開後是長方形，寬等於底面圓周長，高等於柱高。",
    ),
    make_practice(
        "j6-2-2-prism-euler-two-subtypes",
        "角柱數量規律與尤拉公式",
        6,
        "easy",
        ["角柱", "尤拉公式", "頂點", "邊", "面"],
        "角柱可用 V=2n、E=3n、F=n+2；一般凸多面體用 V−E+F=2。",
        related=euler_related,
        subtype_count=2,
    ),
    make_practice(
        "j6-2-2-prism-counting",
        "角柱頂點邊面數量規律",
        5,
        "easy",
        ["角柱", "頂點", "邊", "面"],
        "n 角柱有 2n 個頂點、3n 條邊、n+2 個面。",
    ),
    make_practice(
        "j6-2-2-euler-formula",
        "尤拉公式的應用與反推",
        5,
        "medium",
        ["尤拉公式", "多面體", "反推"],
        "凸多面體滿足 V−E+F=2，可用來由兩個量反推第三個量。",
    ),
    make_practice(
        "j6-2-2-container-water-two-subtypes",
        "容器水位與水管體積應用",
        6,
        "medium",
        ["水位變化", "排水體積", "水管容積"],
        "水位變化的體積 = 底面積 × 高度變化；水管容積就是圓柱體積。",
        related=water_related,
        subtype_count=2,
        notes=["保留可由體積守恆解出的水位、石塊、水管題；需要複雜圖形或未指定容器形狀的題目未直接使用。"],
    ),
    make_practice(
        "j6-2-2-water-displacement",
        "水位上升與排水體積",
        5,
        "medium",
        ["水位", "體積守恆", "石塊"],
        "完全浸入水中的物體體積，等於水面上升造成的新增水體積。",
    ),
    make_practice(
        "j6-2-2-water-pipe-volume",
        "圓柱水管容積計算",
        5,
        "medium",
        ["水管", "圓柱", "容積"],
        "圓柱形水管內部容積 = πr²h，注意直徑要先除以 2 得半徑。",
    ),
]

for item in practice_items:
    upsert_practice(practices, item)

for order, key in enumerate(
    [
        "j6-2-2-basic-surface-volume-three-subtypes",
        "j6-2-2-composite-scaling-three-subtypes",
        "j6-2-2-surface-shortest-path-two-subtypes",
        "j6-2-2-prism-euler-two-subtypes",
        "j6-2-2-container-water-two-subtypes",
    ],
    start=1,
):
    upsert_binding(bindings, f"practice-{key}", order)

data["updatedAt"] = datetime.now(timezone.utc).isoformat()
DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
