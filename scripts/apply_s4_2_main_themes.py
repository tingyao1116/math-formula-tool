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
SOURCE_PDF = ROOT / "exports" / "s4-source" / "s4-readable-paged.pdf"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "fourth-volume-topic-pdfs.json"

TZ = timezone(timedelta(hours=8))
SOURCE_REF = "高二下數A全重點_易讀版分頁版.docx"

TOPIC_PLAN = [
    {
        "chapterCode": "s4-2-1",
        "groupName": "空間中的平面方程式",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "空間中的平面與直線",
            "section": "空間中的平面方程式",
            "domain": "空間幾何",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 5,
        },
        "rootId": "senior-plane-equation-main-s421",
        "paragraphEditable": (
            "1. 這章正式改以三個主題當主軸：平面方程式、兩平面的夾角、點到平面的距離。\n"
            "2. 看到平面題時，第一步先找法向量；法向量抓對了，平面式、夾角、距離三條線就會同時清楚。\n"
            "3. 平面束、交線、角平分面這類題型不要急著背結論，先分清楚它是在考法向量關係，還是在考距離相等。\n"
            "4. 章節大綱第三欄先直接取主題整理中的重點，之後再慢慢拆成更細的分支。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的三個主題頁。整理時先抓平面方程式，再往兩平面的夾角與點到平面的距離延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "plane-equation",
                "title": "平面方程式",
                "page": 16,
                "mainThemeId": "s4-2-1-main-theme-plane-equation",
                "wrapperId": "s4-2-1-main-theme-plane-equation-core",
                "summary": "整理平面的法向量、點法向式、一般式、截距式與由幾何條件建立平面方程式。",
                "rows": [
                    ["點法向式", "已知平面過點 \\(P_0(x_0,y_0,z_0)\\)，法向量為 \\((a,b,c)\\)，則方程式可寫成 \\(a(x-x_0)+b(y-y_0)+c(z-z_0)=0\\)。"],
                    ["一般式", "三元一次方程式 \\(ax+by+cz+d=0\\) 代表一個平面，而 \\((a,b,c)\\) 就是它的法向量。"],
                    ["截距式", "若平面和三軸截距分別為 \\(a,b,c\\)，可寫成 \\(\\dfrac{x}{a}+\\dfrac{y}{b}+\\dfrac{z}{c}=1\\)。"],
                    ["特殊平面", "像 \\(x=k\\)、\\(y=k\\)、\\(z=k\\) 這類式子，都代表和某一坐標平面平行的平面。"],
                    ["平行判斷", "兩平面平行，等價於它們的法向量相同或成比例。"],
                    ["建立方程式", "知道三點、一直線和線外一點、兩相交直線、兩平行直線，都能先找法向量再寫平面式。"],
                    ["讀題提醒", "求平面方程式時，最重要的是先找到法向量。"],
                ],
                "branchIds": [
                    "s4-2-1-plane-equation-core",
                    "senior-plane-equation-three-point-form-s421",
                    "senior-plane-intercept-form-s421",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "angle-between-planes",
                "title": "兩平面的夾角",
                "page": 17,
                "mainThemeId": "s4-2-1-main-theme-angle-between-planes",
                "wrapperId": "s4-2-1-main-theme-angle-between-planes-core",
                "summary": "整理兩平面的夾角、平行垂直條件，以及交線與共同交線的判斷。",
                "rows": [
                    ["夾角看法向量", "兩平面的夾角，等於它們法向量夾角或其補角中的銳角。"],
                    ["公式", "若兩平面法向量為 \\(\\vec{n}_1,\\vec{n}_2\\)，則 \\(\\cos\\theta=\\dfrac{|\\vec{n}_1\\cdot\\vec{n}_2|}{|\\vec{n}_1||\\vec{n}_2|}\\)。"],
                    ["平行條件", "兩平面平行，等價於法向量平行。"],
                    ["垂直條件", "兩平面垂直，等價於法向量內積為 0。"],
                    ["交線想法", "若兩平面相交，其交線方向向量會同時垂直於兩個法向量。"],
                    ["共同交線", "平面束題型常以兩平面的線性組合表示，核心仍是抓住共同交線與法向量關係。"],
                    ["讀題提醒", "求平面夾角時，先把法向量抄對，通常就已經完成一半。"],
                ],
                "branchIds": [
                    "senior-plane-equation-intersection-line-s421",
                    "senior-plane-pencil-equation-s421",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "point-to-plane-distance",
                "title": "點到平面的距離",
                "page": 18,
                "mainThemeId": "s4-2-1-main-theme-point-to-plane-distance",
                "wrapperId": "s4-2-1-main-theme-point-to-plane-distance-core",
                "summary": "整理點到平面的距離、垂足、對稱點、平行平面距離與角平分面。",
                "rows": [
                    ["距離公式", "點 \\(P(x_0,y_0,z_0)\\) 到平面 \\(ax+by+cz+d=0\\) 的距離為 \\(\\dfrac{|ax_0+by_0+cz_0+d|}{\\sqrt{a^2+b^2+c^2}}\\)。"],
                    ["垂足求法", "點對平面的垂足可沿法向量方向設參數，再代回平面方程式求出。"],
                    ["對稱點", "先找到垂足，再利用中點關係求出點對平面的鏡射點。"],
                    ["平行平面距離", "若兩平面法向量相同，可直接把常數項差值帶入距離公式。"],
                    ["角平分面", "兩相交平面的角平分面，可由到兩平面的距離相等建立方程式。"],
                    ["讀題提醒", "距離公式分母永遠是法向量長度，不要少掉平方根。"],
                ],
                "branchIds": [
                    "senior-plane-distance-parallel-s421",
                ],
            },
        ],
    },
    {
        "chapterCode": "s4-2-2",
        "groupName": "空間中的直線方程式",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "空間中的平面與直線",
            "section": "空間中的直線方程式",
            "domain": "空間幾何",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 6,
        },
        "rootId": "senior-space-line-equation-main-s422",
        "paragraphEditable": (
            "1. 這章正式改以四個主題當主軸：直線方程式、直線與平面、兩直線的關係、點到直線之距離。\n"
            "2. 空間直線題最重要的是習慣用「一點 + 方向向量」來看；有了方向向量，位置關係和距離才容易整理。\n"
            "3. 看到兩直線、直線和平面時，先判斷是在考平行垂直、相交歪斜，還是在考距離，主題就不會掛錯。\n"
            "4. 點到直線距離這一題型和點到平面距離不能混在一起；一個靠方向向量，一個靠法向量。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的四個主題頁。整理時先抓空間直線方程式，再往直線與平面、兩直線關係與點到直線距離延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "line-equation",
                "title": "直線方程式",
                "page": 20,
                "mainThemeId": "s4-2-2-main-theme-line-equation",
                "wrapperId": "s4-2-2-main-theme-line-equation-core",
                "summary": "整理空間直線的方向向量、參數式、向量式、對稱比例式與兩點建線。",
                "rows": [
                    ["方向向量", "若非零向量和直線平行，就叫做該直線的方向向量。"],
                    ["參數式", "過點 \\(P_0(x_0,y_0,z_0)\\)、方向向量為 \\((l,m,n)\\) 的直線，可寫成 \\(x=x_0+lt\\)、\\(y=y_0+mt\\)、\\(z=z_0+nt\\)。"],
                    ["向量式", "同一條直線也可寫成 \\(\\vec{r}=\\vec{r}_0+t\\vec{v}\\)。"],
                    ["對稱比例式", "當 \\(l,m,n\\) 都不為 0 時，可寫成 \\(\\dfrac{x-x_0}{l}=\\dfrac{y-y_0}{m}=\\dfrac{z-z_0}{n}\\)。"],
                    ["射線與線段", "若參數 \\(t\\) 限制在某個範圍內，就能表達射線或線段。"],
                    ["建線關鍵", "通常需要一點和一個方向向量，或由兩點先做差得到方向向量。"],
                ],
                "branchIds": [
                    "s4-2-2-line-equation-space-core",
                    "senior-space-line-two-point-form-s422",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "line-and-plane",
                "title": "直線與平面",
                "page": 21,
                "mainThemeId": "s4-2-2-main-theme-line-and-plane",
                "wrapperId": "s4-2-2-main-theme-line-and-plane-core",
                "summary": "整理直線和平面的相交、平行、包含關係，與線面夾角。",
                "rows": [
                    ["交於一點", "把直線參數式代入平面方程式，若能解出唯一參數值，就表示交於一點。"],
                    ["平行但不在平面上", "若方向向量和法向量垂直，但代入後無解，則直線和平面平行。"],
                    ["整條線在平面上", "若方向向量與法向量垂直，而且直線上一點也滿足平面方程式，則整條線都在平面內。"],
                    ["夾角公式", "直線和平面的夾角可改成方向向量和法向量的互補角來算。"],
                    ["由條件建平面", "已知一直線和線外一點、兩相交直線、兩平行直線，都能先求法向量再求平面式。"],
                    ["讀題提醒", "代入前先確認方向向量和法向量的關係，常能先判位置種類。"],
                ],
                "branchIds": [
                    "senior-space-line-plane-relationship-s422",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "relationship-between-lines",
                "title": "兩直線的關係",
                "page": 22,
                "mainThemeId": "s4-2-2-main-theme-relationship-between-lines",
                "wrapperId": "s4-2-2-main-theme-relationship-between-lines-core",
                "summary": "整理兩直線的平行、垂直、相交、歪斜與兩線距離。",
                "rows": [
                    ["平行判斷", "兩直線方向向量平行，而且不重合時，就是平行線。"],
                    ["垂直判斷", "若兩直線相交，且方向向量內積為 0，就互相垂直。"],
                    ["相交判斷", "把兩條直線的參數式聯立，若有共同解，就交於一點。"],
                    ["歪斜線判斷", "若方向向量不平行，聯立又無解，則兩線歪斜。"],
                    ["夾角公式", "兩直線的夾角可由方向向量內積求出。"],
                    ["距離想法", "平行線距離可轉成點到直線；歪斜線距離常借助公垂線、外積方向或點到平面的想法。"],
                ],
                "branchIds": [
                    "senior-space-lines-relationship-s422",
                    "senior-skew-lines-common-perpendicular-s422",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "point-to-line-distance",
                "title": "點到直線之距離",
                "page": 23,
                "mainThemeId": "s4-2-2-main-theme-point-to-line-distance",
                "wrapperId": "s4-2-2-main-theme-point-to-line-distance-core",
                "summary": "整理點到空間直線的距離、垂足、投影與對稱點。",
                "rows": [
                    ["幾何觀念", "點到直線距離就是點到其垂足的長度。"],
                    ["向量做法", "可把點和線上一點連成向量，再扣掉它在方向向量上的投影。"],
                    ["公式觀念", "若方向向量為 \\(\\vec{v}\\)，則距離常可寫成 \\(\\dfrac{|\\overrightarrow{AP}\\times\\vec{v}|}{|\\vec{v}|}\\)。"],
                    ["垂足求法", "令垂足在直線上，利用連接向量垂直方向向量建立方程式。"],
                    ["對稱點求法", "先找垂足，再利用垂足是中點的條件求對稱點。"],
                    ["讀題提醒", "點到直線與點到平面雖然都叫距離，但一個靠方向向量，一個靠法向量。"],
                ],
                "branchIds": [
                    "senior-space-point-to-line-distance-s422",
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


def find_topic(topics: list[dict], topic_id: str) -> dict:
    for topic in topics:
        if topic.get("id") == topic_id:
            return topic
    raise KeyError(f"Topic not found: {topic_id}")


def set_chapter_fields(topic: dict, chapter_code: str) -> None:
    topic["chapter_code"] = chapter_code
    topic["chapterCode"] = chapter_code


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
        set_chapter_fields(topic, chapter_code)


def build_main_topic_entry(topic_id: str, title: str, rows: list[list[str]], pdf_file: str, updated_at: str) -> dict:
    return {
        "id": topic_id,
        "title": title,
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "table",
                        "headers": ["重點", "整理"],
                        "rows": rows,
                    }
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "pdf-page",
                        "src": f"data/main-theme-overviews/{pdf_file}",
                        "note": title,
                    }
                ],
            },
        ],
    }


def write_pdf_page(reader: PdfReader, page_number: int, destination: Path) -> None:
    writer = PdfWriter()
    writer.add_page(reader.pages[page_number - 1])
    with destination.open("wb") as handle:
        writer.write(handle)


def reminder_from_rows(rows: list[list[str]]) -> str:
    heads = [row[0] for row in rows[:4]]
    if not heads:
        return ""
    if len(heads) == 1:
        return heads[0]
    return "、".join(heads) + " 等重點"


def ensure_chapter_variant(entry: dict, variant_id: str, label: str, paragraph: str) -> dict:
    variants = entry.setdefault("variants", [])
    for variant in variants:
        if variant.get("id") == variant_id:
            break
    else:
        variant = {"id": variant_id, "label": label, "sections": []}
        variants.append(variant)

    variant["sections"] = [
        {"type": "paragraph", "text": paragraph},
        {"type": "table", "headers": ["主題", "角色", "下一層 / 提醒"], "rows": []},
    ]
    return variant


def update_chapter_overview(chapter_overview_db: dict, chapter_plan: dict, updated_at: str) -> None:
    rows = []
    for topic_plan in chapter_plan["topics"]:
        rows.append([topic_plan["title"], "主題", reminder_from_rows(topic_plan["rows"])])

    overviews = chapter_overview_db.setdefault("overviews", {})
    entry = overviews.setdefault(
        chapter_plan["chapterCode"],
        {
            "groupName": chapter_plan["groupName"],
            "title": "章節重點大綱",
            "variants": [],
        },
    )
    entry["groupName"] = chapter_plan["groupName"]
    entry["title"] = "章節重點大綱"
    entry["updatedAt"] = updated_at

    editable = ensure_chapter_variant(entry, "editable", "可修改版", chapter_plan["paragraphEditable"])
    original = ensure_chapter_variant(entry, "original", "原稿版", chapter_plan["paragraphOriginal"])

    for variant in [editable, original]:
        variant["sections"][1]["rows"] = deepcopy(rows)


def merge_manifest(existing_topics: list[dict], new_topics: list[dict], chapter_codes: set[str]) -> list[dict]:
    merged = [topic for topic in existing_topics if topic.get("chapterCode") not in chapter_codes]
    merged.extend(new_topics)
    return sorted(merged, key=lambda item: (item.get("chapterCode", ""), int(item.get("topicNumber", 0))))


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    chapter_overview_db = load_json(CHAPTER_OVERVIEW_DB)
    topics = formula_db.get("topics", [])
    main_topic_by_id = main_topic_db.setdefault("byId", {})
    ensure_dir(PDF_EXPORT_DIR)
    reader = PdfReader(str(SOURCE_PDF))

    existing_manifest = {"topics": []}
    if PDF_MANIFEST.exists():
        existing_manifest = load_json(PDF_MANIFEST)

    new_manifest_topics: list[dict] = []
    chapter_codes = {plan["chapterCode"] for plan in TOPIC_PLAN}

    for chapter_plan in TOPIC_PLAN:
        chapter_code = chapter_plan["chapterCode"]
        root = find_topic(topics, chapter_plan["rootId"])
        chapter_meta = chapter_plan["meta"]

        for topic_plan in chapter_plan["topics"]:
            topic_number = topic_plan["topicNumber"]
            pdf_file = f"{chapter_code}-topic-{topic_number}-{topic_plan['slug']}.pdf"
            pdf_path = PDF_EXPORT_DIR / pdf_file
            write_pdf_page(reader, topic_plan["page"], pdf_path)

            main_theme_payload = formula_topic_template(
                root,
                chapter_meta,
                topic_plan["mainThemeId"],
                topic_plan["title"],
                chapter_plan["rootId"],
                topic_plan["summary"],
                updated_at,
                topic_number,
            )
            wrapper_payload = wrapper_topic_template(
                root,
                chapter_meta,
                topic_plan["wrapperId"],
                topic_plan["title"],
                topic_plan["mainThemeId"],
                topic_plan["summary"],
                topic_plan["rows"],
                updated_at,
            )
            upsert_topic(topics, main_theme_payload)
            upsert_topic(topics, wrapper_payload)

            for branch_id in topic_plan["branchIds"]:
                reparent_branch(topics, branch_id, topic_plan["wrapperId"], chapter_code)

            main_topic_by_id[topic_plan["mainThemeId"]] = build_main_topic_entry(
                topic_plan["mainThemeId"],
                topic_plan["title"],
                topic_plan["rows"],
                pdf_file,
                updated_at,
            )

            new_manifest_topics.append(
                {
                    "chapterCode": chapter_code,
                    "topicNumber": topic_number,
                    "slug": topic_plan["slug"],
                    "title": topic_plan["title"],
                    "page": topic_plan["page"],
                    "file": pdf_file,
                }
            )

        normalize_chapter_topics(topics, chapter_code, chapter_meta)
        update_chapter_overview(chapter_overview_db, chapter_plan, updated_at)

    formula_db.setdefault("meta", {})
    formula_db["meta"]["count"] = len(topics)
    formula_db["meta"]["updatedAt"] = updated_at
    main_topic_db.setdefault("meta", {})
    main_topic_db["meta"]["count"] = len(main_topic_by_id)
    main_topic_db["meta"]["updatedAt"] = updated_at
    chapter_overview_db.setdefault("meta", {})
    chapter_overview_db["meta"]["count"] = len(chapter_overview_db.get("overviews", {}))
    chapter_overview_db["meta"]["updatedAt"] = updated_at

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(CHAPTER_OVERVIEW_DB, chapter_overview_db)

    merged_topics = merge_manifest(existing_manifest.get("topics", []), new_manifest_topics, chapter_codes)
    PDF_MANIFEST.write_text(
        json.dumps(
            {
                "sourcePdf": str(SOURCE_PDF.resolve()),
                "count": len(merged_topics),
                "topics": merged_topics,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print("Updated chapters:", ", ".join(plan["chapterCode"] for plan in TOPIC_PLAN))
    print("Generated PDFs:", len(new_manifest_topics))


if __name__ == "__main__":
    main()

