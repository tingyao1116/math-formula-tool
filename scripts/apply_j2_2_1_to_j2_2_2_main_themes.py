from __future__ import annotations

import json
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
CHAPTER_OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
SOURCE_PDF = ROOT / "exports" / "j1-second-volume-outline" / "國一下全重點_易讀版分頁版_Word公式版.pdf"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "junior-second-semester-topic-pdfs.json"

TZ = timezone(timedelta(hours=8))
SOURCE_REF = "國一下全重點_易讀版分頁版.docx"


TOPIC_PLAN = [
    {
        "chapterCode": "j2-2-1",
        "groupName": "國中・國一下・座標概念",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "下學期",
            "gradeLabel": "國一下",
            "chapter": "直角座標平面",
            "section": "座標概念",
            "domain": "函數與圖形",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 2,
            "chapterOrder": 4,
        },
        "rootId": "junior-coordinate-concept-main-j221",
        "rootTitle": "座標概念",
        "rootManualOrder": 714,
        "paragraphEditable": (
            "1. 這章正式改以四個主題當主軸：數線與直角座標系、平面座標系與點的座標、象限座標軸與到軸距離、中點座標與座標應用。\n"
            "2. 這章最重要的是把位置轉成座標，再把距離、中點、移動方向都拉回 \\(x\\) 和 \\(y\\) 的變化去理解。\n"
            "3. 看到題目時，先判斷它是在讀座標、在判斷象限，還是在做距離與中點，不要把座標概念和直線圖形混在一起。\n"
            "4. 舊資料裡像三點求面積這類應用題，先掛在中點與座標應用主題下面，之後再視需要細拆。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "number-line-and-coordinate-system",
                "title": "數線與直角座標系",
                "pageStart": 9,
                "pageEnd": 9,
                "mainThemeId": "j2-2-1-main-theme-number-line-and-coordinate-system",
                "wrapperId": "j2-2-1-main-theme-number-line-and-coordinate-system-core",
                "summary": "整理數線三要素、點在數線上的表示，以及直角座標系和原點的基本想法。",
                "rows": [
                    ["數線三要素", "原點、方向、單位長缺一不可。"],
                    ["數線上的點都可用一個數表示", "像點 \\(P\\) 的座標可記成 \\(P(a)\\)。"],
                    ["分數小數負數都能放上數線", "只要依單位長找到位置，就能在數線上表示。"],
                    ["直角座標系可看成兩條垂直數線", "水平的是 \\(x\\) 軸，鉛直的是 \\(y\\) 軸。"],
                    ["原點是平面定位基準", "兩軸交點叫原點，同時也是座標的起點。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 2,
                "slug": "coordinate-plane-and-point-coordinates",
                "title": "平面座標系與點的座標",
                "pageStart": 10,
                "pageEnd": 10,
                "mainThemeId": "j2-2-1-main-theme-coordinate-plane-and-point-coordinates",
                "wrapperId": "j2-2-1-main-theme-coordinate-plane-and-point-coordinates-core",
                "summary": "整理有序數對、原點、軸上點的形式，以及平面上讀點與定點的方法。",
                "rows": [
                    ["平面座標用兩個數表示位置", "第一個看 \\(x\\) 方向，第二個看 \\(y\\) 方向。"],
                    ["原點寫成 \\(O(0,0)\\)", "表示在 \\(x\\) 軸和 \\(y\\) 軸的交點上。"],
                    ["點座標寫成 \\((a,b)\\)", "第一個數 \\(a\\) 是 \\(x\\) 座標，第二個數 \\(b\\) 是 \\(y\\) 座標。"],
                    ["順序不能交換", "\\((2,3)\\) 和 \\((3,2)\\) 是不同的點。"],
                    ["軸上的點有固定形式", "\\(x\\) 軸上的點可寫成 \\((a,0)\\)，\\(y\\) 軸上的點可寫成 \\((0,b)\\)。"],
                ],
                "branchIds": [
                    "j2-2-1-coordinate-main",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "quadrants-axes-and-axis-distance",
                "title": "象限、座標軸與到軸距離",
                "pageStart": 11,
                "pageEnd": 11,
                "mainThemeId": "j2-2-1-main-theme-quadrants-axes-and-axis-distance",
                "wrapperId": "j2-2-1-main-theme-quadrants-axes-and-axis-distance-core",
                "summary": "整理四象限正負號、軸上點的判別，以及點到座標軸的距離。",
                "rows": [
                    ["四個象限看正負號", "第一象限是 \\((+,+)\\)，第二象限是 \\((-,+)\\)，第三象限是 \\((-,-)\\)，第四象限是 \\((+,-)\\)。"],
                    ["軸上的點不屬於任何象限", "只有真正離開座標軸，才會落在某一個象限。"],
                    ["到 \\(x\\) 軸距離是 \\(|b|\\)", "點 \\(P(a,b)\\) 到 \\(x\\) 軸的距離只看上下離開多少。"],
                    ["到 \\(y\\) 軸距離是 \\(|a|\\)", "點 \\(P(a,b)\\) 到 \\(y\\) 軸的距離只看左右離開多少。"],
                    ["距離一律不帶負號", "雖然座標本身可正可負，但距離一定是非負量。"],
                ],
                "branchIds": [
                    "j2-2-1-quadrant-sign-rules",
                    "j2-2-1-axis-distance",
                    "j2-2-1-axis-parallel-distance",
                    "j2-2-1-parameter-quadrant",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "midpoint-and-coordinate-applications",
                "title": "中點座標與座標應用",
                "pageStart": 12,
                "pageEnd": 12,
                "mainThemeId": "j2-2-1-main-theme-midpoint-and-coordinate-applications",
                "wrapperId": "j2-2-1-main-theme-midpoint-and-coordinate-applications-core",
                "summary": "整理數線與平面上的中點公式，以及座標移動、方向應用和簡單面積題。",
                "rows": [
                    ["數線上的中點", "若兩點是 \\(A(a)\\)、\\(B(b)\\)，中點是 \\(\\frac{a+b}{2}\\)。"],
                    ["平面上的中點", "\\(A(x_1,y_1)\\)、\\(B(x_2,y_2)\\) 的中點是 \\(\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)\\)。"],
                    ["左右影響 \\(x\\) 座標", "向東或向右表示 \\(x\\) 增加，向西或向左表示 \\(x\\) 減少。"],
                    ["上下影響 \\(y\\) 座標", "向北或向上表示 \\(y\\) 增加，向南或向下表示 \\(y\\) 減少。"],
                    ["移動題先分清方向", "先判斷改的是左右還是上下，再決定哪一個座標要變。"],
                ],
                "branchIds": [
                    "j2-2-1-midpoint-formula",
                    "j2-2-1-coordinate-transform",
                    "coordinate-area-formula-guest",
                ],
            },
        ],
    },
    {
        "chapterCode": "j2-2-2",
        "groupName": "國中・國一下・二元一次方程式圖形",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "下學期",
            "gradeLabel": "國一下",
            "chapter": "直角座標平面",
            "section": "二元一次方程式圖形",
            "domain": "函數與圖形",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 2,
            "chapterOrder": 5,
        },
        "rootId": "junior-line-graph-main-j222",
        "rootTitle": "二元一次方程式圖形",
        "rootManualOrder": 815,
        "paragraphEditable": (
            "1. 這章正式改以三個主題當主軸：二元一次方程式的解、二元一次方程式的圖形、兩直線與聯立方程式的圖解。\n"
            "2. 這章最重要的是先知道一組解就是一個點，多組解排成一直線，再用兩條直線的交會去理解聯立方程式。\n"
            "3. `二元一次方程式的解` 雖然還帶有代數觀念，但來源主軸已經把它放進圖形單元，所以這裡跟著主軸處理，不拆回前一章。\n"
            "4. 舊資料裡比較延伸的直線表示法、斜率、兩點求一直線，先都掛在 `二元一次方程式的圖形` 主題下面。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "solutions-of-linear-equations-in-two-variables",
                "title": "二元一次方程式的解",
                "pageStart": 13,
                "pageEnd": 13,
                "mainThemeId": "j2-2-2-main-theme-solutions-of-linear-equations-in-two-variables",
                "wrapperId": "j2-2-2-main-theme-solutions-of-linear-equations-in-two-variables-core",
                "summary": "整理二元一次方程式解的判斷、代值檢查，以及多組解形成直線的想法。",
                "rows": [
                    ["一組 \\((x,y)\\) 能讓方程式成立就是一組解", "把 \\(x=m\\)、\\(y=n\\) 代入後，若等號兩邊相等，則 \\((m,n)\\) 是一組解。"],
                    ["通常有無限多組解", "因為只用一個條件限制兩個未知數，所以常常會有很多組解。"],
                    ["常整理成含 \\(y\\) 的形式", "這樣比較容易代值、描點與觀察變化。"],
                    ["把多組解畫在平面上", "會發現它們排成一條直線。"],
                    ["數對是點，點連起來就是圖形", "這是把代數條件轉成圖形最重要的一步。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 2,
                "slug": "graph-of-linear-equation-in-two-variables",
                "title": "二元一次方程式的圖形",
                "pageStart": 14,
                "pageEnd": 14,
                "mainThemeId": "j2-2-2-main-theme-graph-of-linear-equation-in-two-variables",
                "wrapperId": "j2-2-2-main-theme-graph-of-linear-equation-in-two-variables-core",
                "summary": "整理描點作圖、標準式、水平線與鉛直線，以及較延伸的直線表示法。",
                "rows": [
                    ["所有解形成一條直線", "二元一次方程式的所有解畫到平面上，會形成一條直線。"],
                    ["標準式常寫成 \\(ax+by=c\\)", "看到這種形式，就可以開始找解、描點、作圖。"],
                    ["作圖先找兩組解", "描出兩點後連成直線，就能確定整條圖形。"],
                    ["\\(y=k\\) 是水平線", "它平行 \\(x\\) 軸，而 \\(y=0\\) 就是 \\(x\\) 軸。"],
                    ["\\(x=b\\) 是鉛直線", "它平行 \\(y\\) 軸，而 \\(x=0\\) 就是 \\(y\\) 軸。"],
                ],
                "branchIds": [
                    "j2-2-2-line-graph-main",
                    "j2-2-2-intercepts-plotting",
                    "j2-2-2-special-lines",
                    "j2-2-2-graph-validation",
                    "coordinate-line-basic",
                    "two-point-form",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "two-lines-and-system-graph-interpretation",
                "title": "兩直線與聯立方程式的圖解",
                "pageStart": 15,
                "pageEnd": 15,
                "mainThemeId": "j2-2-2-main-theme-two-lines-and-system-graph-interpretation",
                "wrapperId": "j2-2-2-main-theme-two-lines-and-system-graph-interpretation-core",
                "summary": "整理兩條直線的交會、重合、平行，以及聯立方程式解的圖形意義。",
                "rows": [
                    ["每個二元一次方程式都對應一條直線", "所以聯立方程式可以想成兩條直線一起看。"],
                    ["相交於一點就是唯一解", "交點就是聯立方程式唯一的一組解。"],
                    ["整條重合就是無限多解", "兩式其實在描述同一條件，因此會有無限多組共同解。"],
                    ["平行且不重合就是無解", "兩個條件彼此衝突，找不到共同交點。"],
                    ["圖解法先各找兩點作圖", "畫出兩條直線後，再觀察交會情形。"],
                    ["比較係數比例可判斷關係", "整理成 \\(a_1x+b_1y=c_1\\)、\\(a_2x+b_2y=c_2\\) 後，可以判斷相交、重合或平行。"],
                ],
                "branchIds": [
                    "j2-2-2-system-graph-solution",
                    "j2-2-2-line-relations",
                    "j2-2-2-intersection-parameter",
                    "slope-form",
                    "slope-intercept",
                    "axis-parallel-lines",
                    "line-form-guests",
                    "point-slope-form",
                ],
            },
        ],
    },
]


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def find_topic(topics: list[dict], topic_id: str) -> dict:
    for topic in topics:
        if topic.get("id") == topic_id:
            return topic
    raise KeyError(f"Topic not found: {topic_id}")


def maybe_find_topic(topics: list[dict], topic_id: str) -> dict | None:
    for topic in topics:
        if topic.get("id") == topic_id:
            return topic
    return None


def set_chapter_fields(topic: dict, chapter_code: str) -> None:
    topic["chapter_code"] = chapter_code
    topic["chapterCode"] = chapter_code


def chapter_root_template(chapter_plan: dict, updated_at: str) -> dict:
    meta = chapter_plan["meta"]
    chapter_code = chapter_plan["chapterCode"]
    title = chapter_plan["rootTitle"]
    return {
        "id": chapter_plan["rootId"],
        "title": title,
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "定位", "values": [rf"\text{{{title}}}"]},
                {"label": "摘要", "values": [rf"\text{{{meta['section']}}}"]},
            ],
        },
        "stage": meta["stage"],
        "grade": meta["grade"],
        "term": meta["term"],
        "chapter": meta["chapter"],
        "domain": meta["domain"],
        "difficulty": "基礎",
        "chapterRole": "主角",
        "parentId": "",
        "tags": [chapter_code, title],
        "usage": [meta["section"]],
        "examples": [],
        "tips": ["先看主題，再往下展開原本的分支內容。"],
        "notes": ["這一層是章節穩定主軸。"],
        "mistakes": ["不要把舊核心主題直接當成章節 root。"],
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": meta["gradeLabel"],
        "section": meta["section"],
        "domainSub": meta["domainSub"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": chapter_plan.get("rootManualOrder", 0),
        "orderIndex": None,
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
    }


def formula_topic_template(root: dict, chapter_meta: dict, topic_id: str, title: str, parent_id: str, summary: str, updated_at: str, order_index: int) -> dict:
    chapter_code = root.get("chapterCode", root.get("chapter_code", ""))
    return {
        "id": topic_id,
        "title": title,
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "定位", "values": [rf"\text{{{title}}}"]},
                {"label": "摘要", "values": [rf"\text{{{summary}}}"]},
            ],
        },
        "stage": chapter_meta["stage"],
        "grade": chapter_meta["grade"],
        "term": chapter_meta["term"],
        "chapter": chapter_meta["chapter"],
        "domain": chapter_meta["domain"],
        "difficulty": root.get("difficulty", "基礎"),
        "chapterRole": "主題",
        "parentId": parent_id,
        "tags": [chapter_code, "主題", title],
        "usage": [summary],
        "examples": ["先看這一層主題整理，再往下展開原本的分支內容。"],
        "tips": ["如果題目太雜，先判斷它屬於哪個主題，再決定要往哪組分支看。"],
        "notes": ["這一層是固定主軸，之後章節大綱和主題頁都會先看這裡。"],
        "mistakes": ["不要把章節根節點和主題層當成同一層。"],
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": chapter_meta["gradeLabel"],
        "section": chapter_meta["section"],
        "domainSub": chapter_meta["domainSub"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": order_index,
        "orderIndex": order_index,
        "stageOrder": chapter_meta["stageOrder"],
        "gradeOrder": chapter_meta["gradeOrder"],
        "termOrder": chapter_meta["termOrder"],
        "chapterOrder": chapter_meta["chapterOrder"],
    }


def wrapper_topic_template(root: dict, chapter_meta: dict, wrapper_id: str, title: str, parent_id: str, summary: str, rows: list[list[str]], updated_at: str) -> dict:
    chapter_code = root.get("chapterCode", root.get("chapter_code", ""))
    top_lines = []
    for index, row in enumerate(rows[:3], start=1):
        top_lines.append({"label": f"重點{index}", "values": [row[0]]})
    return {
        "id": wrapper_id,
        "title": title,
        "formula": {"type": "labeled-lines", "lines": top_lines},
        "stage": chapter_meta["stage"],
        "grade": chapter_meta["grade"],
        "term": chapter_meta["term"],
        "chapter": chapter_meta["chapter"],
        "domain": chapter_meta["domain"],
        "difficulty": root.get("difficulty", "基礎"),
        "chapterRole": "主題",
        "parentId": parent_id,
        "contentTypes": ["公式", "定義", "題型", "使用技巧", "注意事項", "常見錯誤"],
        "contentTypesLocked": True,
        "tags": [chapter_code, title, "重點整理"],
        "usage": [summary],
        "examples": [],
        "tips": ["先看主題整理，再往下接既有分支。"],
        "notes": [f"來源：{SOURCE_REF}"],
        "mistakes": ["不要跳過主題整理就直接往下看分支。"],
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": chapter_meta["gradeLabel"],
        "section": chapter_meta["section"],
        "domainSub": chapter_meta["domainSub"],
        "isBranch": True,
        "stageOrder": chapter_meta["stageOrder"],
        "gradeOrder": chapter_meta["gradeOrder"],
        "termOrder": chapter_meta["termOrder"],
        "chapterOrder": chapter_meta["chapterOrder"],
        "manualOrder": 100,
        "orderIndex": 1,
    }


def upsert_topic(topics: list[dict], payload: dict) -> None:
    for index, topic in enumerate(topics):
        if topic.get("id") == payload["id"]:
            topics[index] = payload
            return
    topics.append(payload)


def reparent_branch(topics: list[dict], topic_id: str, parent_id: str, chapter_code: str) -> None:
    topic = find_topic(topics, topic_id)
    topic["parentId"] = parent_id
    set_chapter_fields(topic, chapter_code)


def normalize_chapter_topics(topics: list[dict], chapter_code: str, chapter_meta: dict) -> None:
    for topic in topics:
        topic_chapter_code = topic.get("chapterCode", topic.get("chapter_code", ""))
        if topic_chapter_code != chapter_code:
            continue
        topic["stage"] = chapter_meta["stage"]
        topic["grade"] = chapter_meta["grade"]
        topic["term"] = chapter_meta["term"]
        topic["gradeLabel"] = chapter_meta["gradeLabel"]
        topic["chapter"] = chapter_meta["chapter"]
        topic["section"] = chapter_meta["section"]
        topic["domain"] = chapter_meta["domain"]
        topic["domainSub"] = chapter_meta["domainSub"]
        topic["stageOrder"] = chapter_meta["stageOrder"]
        topic["gradeOrder"] = chapter_meta["gradeOrder"]
        topic["termOrder"] = chapter_meta["termOrder"]
        topic["chapterOrder"] = chapter_meta["chapterOrder"]
        if "modifiedAt" not in topic:
            topic["modifiedAt"] = now_iso()


def split_topic_pdf(reader: PdfReader, page_start: int, page_end: int, target_path: Path) -> None:
    writer = PdfWriter()
    for page_index in range(page_start - 1, page_end):
        writer.add_page(reader.pages[page_index])
    with target_path.open("wb") as handle:
        writer.write(handle)


def topic_overview_entry(topic: dict, updated_at: str) -> dict:
    return {
        "id": topic["mainThemeId"],
        "title": topic["title"],
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "table",
                        "headers": ["重點", "整理"],
                        "rows": deepcopy(topic["rows"]),
                    }
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "pdf-page",
                        "src": f"data/main-theme-overviews/{topic['file']}",
                        "note": topic["title"],
                    }
                ],
            },
        ],
    }


def overview_summary(rows: list[list[str]], limit: int = 4) -> str:
    labels = [row[0] for row in rows[:limit] if row and row[0]]
    if not labels:
        return "待補主題重點"
    tail = "等重點" if len(rows) > limit else "重點"
    return "、".join(labels) + tail


def chapter_overview_entry(chapter_plan: dict, updated_at: str) -> dict:
    rows = []
    for topic in chapter_plan["topics"]:
        rows.append([
            topic["title"],
            "主題",
            overview_summary(topic["rows"]),
        ])
    return {
        "groupName": chapter_plan["groupName"],
        "title": "章節重點大綱",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": chapter_plan["paragraphEditable"],
                    },
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": rows,
                    },
                ],
            }
        ],
    }


def merge_manifest(existing: dict, new_topics: list[dict], chapter_codes: set[str]) -> dict:
    old_topics = existing.get("topics", []) if isinstance(existing.get("topics", []), list) else []
    kept = [row for row in old_topics if row.get("chapterCode") not in chapter_codes]
    merged = kept + new_topics
    return {
        "sourcePdf": str(SOURCE_PDF),
        "count": len(merged),
        "topics": merged,
    }


def main() -> None:
    updated_at = now_iso()
    ensure_dir(PDF_EXPORT_DIR)

    formula_db = load_json(FORMULA_DB)
    topics = formula_db["topics"]
    main_topic_db = load_json(MAIN_TOPIC_DB)
    chapter_overview_db = load_json(CHAPTER_OVERVIEW_DB)
    manifest = load_json(PDF_MANIFEST) if PDF_MANIFEST.exists() else {"topics": []}

    reader = PdfReader(str(SOURCE_PDF))

    manifest_topics: list[dict] = []
    chapter_codes = {plan["chapterCode"] for plan in TOPIC_PLAN}

    for chapter_plan in TOPIC_PLAN:
        chapter_code = chapter_plan["chapterCode"]
        chapter_meta = chapter_plan["meta"]

        normalize_chapter_topics(topics, chapter_code, chapter_meta)

        root_payload = chapter_root_template(chapter_plan, updated_at)
        upsert_topic(topics, root_payload)

        for order_index, topic in enumerate(chapter_plan["topics"], start=1):
            topic["file"] = f"{chapter_code}-topic-{topic['topicNumber']}-{topic['slug']}.pdf"
            target_pdf = PDF_EXPORT_DIR / topic["file"]
            split_topic_pdf(reader, topic["pageStart"], topic["pageEnd"], target_pdf)

            manifest_topics.append(
                {
                    "chapterCode": chapter_code,
                    "topicNumber": topic["topicNumber"],
                    "slug": topic["slug"],
                    "title": topic["title"],
                    "pageStart": topic["pageStart"],
                    "pageEnd": topic["pageEnd"],
                    "file": topic["file"],
                }
            )

            main_topic_payload = formula_topic_template(
                root_payload,
                chapter_meta,
                topic["mainThemeId"],
                topic["title"],
                chapter_plan["rootId"],
                topic["summary"],
                updated_at,
                order_index,
            )
            wrapper_payload = wrapper_topic_template(
                root_payload,
                chapter_meta,
                topic["wrapperId"],
                topic["title"],
                topic["mainThemeId"],
                topic["summary"],
                topic["rows"],
                updated_at,
            )

            upsert_topic(topics, main_topic_payload)
            upsert_topic(topics, wrapper_payload)

            for branch_id in topic.get("branchIds", []):
                if maybe_find_topic(topics, branch_id):
                    reparent_branch(topics, branch_id, topic["wrapperId"], chapter_code)

            main_topic_db.setdefault("byId", {})[topic["mainThemeId"]] = topic_overview_entry(topic, updated_at)

        chapter_overview_db.setdefault("overviews", {})[chapter_code] = chapter_overview_entry(chapter_plan, updated_at)

    formula_db.setdefault("meta", {})["updatedAt"] = updated_at
    formula_db["meta"]["count"] = len(topics)
    main_topic_db.setdefault("meta", {})["updatedAt"] = updated_at
    main_topic_db["meta"]["count"] = len(main_topic_db.get("byId", {}))
    chapter_overview_db.setdefault("meta", {})["updatedAt"] = updated_at
    chapter_overview_db["meta"]["count"] = len(chapter_overview_db.get("overviews", {}))

    manifest_payload = merge_manifest(manifest, manifest_topics, chapter_codes)

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(CHAPTER_OVERVIEW_DB, chapter_overview_db)
    save_json(PDF_MANIFEST, manifest_payload)

    print(f"Updated chapters: {', '.join(plan['chapterCode'] for plan in TOPIC_PLAN)}")
    print(f"Generated topic PDFs: {len(manifest_topics)}")


if __name__ == "__main__":
    main()

