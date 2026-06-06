import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "program-db" / "database" / "practice-db.json"


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
        "chapterCode": "j6-2-1",
        "stage": "國中",
        "grade": "國三",
        "term": "下",
        "chapter": "空間圖形",
        "domain": "幾何",
        "prompt": "",
        "answer": "",
        "tags": ["j6-2-1", "空間圖形", "無限練習", *tags],
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
        "targetId": "j6-2-1",
        "enabled": True,
        "order": order,
    }
    for index, current in enumerate(bindings):
        if current.get("practiceId") == practice_id and current.get("targetId") == "j6-2-1":
            bindings[index] = binding
            return
    bindings.append(binding)


data = json.loads(DB_PATH.read_text(encoding="utf-8"))
practices = data.setdefault("practices", [])
bindings = data.setdefault("bindings", [])

distance_related = [
    "practice-j6-2-1-cuboid-space-diagonal",
    "practice-j6-2-1-line-plane-distance",
    "practice-j6-2-1-three-perpendicular-distance",
    "practice-j6-2-1-cube-face-center-distance",
]
logic_related = [
    "practice-j6-2-1-line-plane-perpendicular-logic",
    "practice-j6-2-1-parallel-perpendicular-relations",
]
volume_related = [
    "practice-j6-2-1-solid-scaling-ratio",
    "practice-j6-2-1-cylinder-volume-model",
    "practice-j6-2-1-composite-solid-volume",
]

practice_items = [
    make_practice(
        "j6-2-1-spatial-distance-four-subtypes",
        "空間距離與垂直性質綜合",
        6,
        "medium",
        ["空間距離", "三維畢氏", "三垂線"],
        "空間距離常把互相垂直的線段拆開，用三維畢氏定理 \\(d^2=a^2+b^2+c^2\\) 或兩次畢氏定理計算。",
        related=distance_related,
        subtype_count=4,
        usage=["適合放在空間圖形距離計算後，集中訓練長方體、線面垂直與三垂線配置。"],
        notes=["截圖中的長方體、線垂直平面、三垂線與正方體面心距離題合併成此大類。"],
    ),
    make_practice(
        "j6-2-1-cuboid-space-diagonal",
        "長方體體對角線與三維畢氏",
        5,
        "medium",
        ["長方體", "體對角線", "畢氏定理"],
        "長方體體對角線可視為三個互相垂直方向合成，公式為 \\(d=\\sqrt{a^2+b^2+c^2}\\)。",
    ),
    make_practice(
        "j6-2-1-line-plane-distance",
        "直線垂直平面形成的距離計算",
        5,
        "medium",
        ["線垂直平面", "直角三角形", "距離"],
        "若 \\(AB\\perp\\) 平面且 \\(C\\) 在平面上，則 \\(AB\\perp BC\\)，可在 \\(\\triangle ABC\\) 中用畢氏定理。",
    ),
    make_practice(
        "j6-2-1-three-perpendicular-distance",
        "三垂線配置中的空間距離",
        5,
        "medium",
        ["三垂線", "空間距離", "畢氏定理"],
        "三垂線題通常先算平面內距離，再把垂直於平面的高度接上，等於連續使用兩次畢氏定理。",
    ),
    make_practice(
        "j6-2-1-cube-face-center-distance",
        "正方體相鄰面中心距離",
        5,
        "medium",
        ["正方體", "面中心", "等腰直角三角形"],
        "相鄰面中心的連線可轉成邊長一半與邊長一半形成的等腰直角三角形。",
    ),
    make_practice(
        "j6-2-1-spatial-logic-two-subtypes",
        "空間線面關係與邏輯判定",
        6,
        "easy",
        ["線面關係", "垂直", "平行", "邏輯判定"],
        "線垂直平面表示垂直於平面內所有過垂足的直線；但平行、垂直關係不能任意用平面直覺延伸。",
        related=logic_related,
        subtype_count=2,
        usage=["適合當作空間關係的口頭快問快答，也可用來抓學生最常見的錯誤推論。"],
        notes=["原截圖的純文字敘述題保留為完整條件判斷題；沒有只保留大方向說法。"],
    ),
    make_practice(
        "j6-2-1-line-plane-perpendicular-logic",
        "線垂直平面的性質判斷",
        5,
        "easy",
        ["線垂直平面", "垂足", "空間邏輯"],
        "判斷線垂直平面時，關鍵是該直線會垂直平面內所有通過垂足的直線。",
    ),
    make_practice(
        "j6-2-1-parallel-perpendicular-relations",
        "平行與垂直關係的反例判斷",
        5,
        "easy",
        ["平行", "垂直", "反例"],
        "空間中「都垂直」或「都平行」不一定能推出兩物件彼此平行；要回到定義檢查。",
    ),
    make_practice(
        "j6-2-1-solid-volume-ratio-three-subtypes",
        "立體體積比例與旋轉建模綜合",
        6,
        "medium",
        ["體積", "比例", "圓柱", "複合立體"],
        "相似立體長度放大 \\(k\\) 倍，面積放大 \\(k^2\\) 倍，體積放大 \\(k^3\\) 倍；圓柱體積為 \\(V=\\pi r^2h\\)。",
        related=volume_related,
        subtype_count=3,
        usage=["適合把比例、圓柱體積、挖孔與旋轉成體串成同一組建模練習。"],
        notes=["截圖中的比例變化、圓柱體積比、挖孔與紙片旋轉合併成此大類。"],
    ),
    make_practice(
        "j6-2-1-solid-scaling-ratio",
        "相似立體與圓柱體積倍率",
        5,
        "medium",
        ["相似立體", "倍率", "體積比"],
        "長度、面積、體積的倍率分別是 \\(k\\)、\\(k^2\\)、\\(k^3\\)；圓柱半徑要平方後才乘高。",
    ),
    make_practice(
        "j6-2-1-cylinder-volume-model",
        "圓柱體積與體積比計算",
        5,
        "medium",
        ["圓柱", "體積", "體積比"],
        "圓柱體積比較時，只要比較 \\(r^2h\\)，共同的 \\(\\pi\\) 會約掉。",
    ),
    make_practice(
        "j6-2-1-composite-solid-volume",
        "挖孔與旋轉形成的複合體積",
        5,
        "medium",
        ["挖孔", "旋轉體", "複合體積"],
        "複合體積先判斷是加法還是減法；長方形繞邊旋轉一周通常形成圓柱。",
        notes=["需要圖形才能判斷的題目已改寫成文字完整條件；未使用缺圖才可理解的題型。"],
    ),
]

for item in practice_items:
    upsert_practice(practices, item)

upsert_binding(bindings, "practice-j6-2-1-spatial-logic-two-subtypes", 1)
upsert_binding(bindings, "practice-j6-2-1-spatial-distance-four-subtypes", 2)
upsert_binding(bindings, "practice-j6-2-1-solid-volume-ratio-three-subtypes", 3)

data["meta"]["practiceCount"] = len(practices)
data["meta"]["bindingCount"] = len(bindings)
data["meta"]["updatedAt"] = datetime.now(timezone.utc).isoformat()

DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
