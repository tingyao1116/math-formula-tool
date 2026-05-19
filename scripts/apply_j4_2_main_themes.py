from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "junior-fourth-semester-topic-pdfs.json"
SOURCE_PDF = ROOT / "exports" / "j2-second-volume-outline" / "國二下全重點_易讀版分頁版_Word公式版.pdf"
SOURCE_REF = "國二下全重點_易讀版分頁版.md"
TZ = timezone(timedelta(hours=8))


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def make_formula_lines(title: str, summary: str) -> dict:
    return {
        "type": "labeled-lines",
        "lines": [
            {"label": "定位", "values": [f"\\text{{{title}}}"]},
            {"label": "摘要", "values": [f"\\text{{{summary}}}"]},
        ],
    }


def make_core_formula_lines(rows: list[list[str]]) -> dict:
    return {
        "type": "labeled-lines",
        "lines": [
            {"label": f"重點{idx}", "values": [row[0]]}
            for idx, row in enumerate(rows[:3], start=1)
        ],
    }


def upsert_topic(topic_map: dict[str, dict], topic: dict) -> None:
    existing = topic_map.get(topic["id"], {})
    merged = dict(existing)
    merged.update(topic)
    topic_map[topic["id"]] = merged


def next_original_index(topic_map: dict[str, dict]) -> int:
    return max((int(topic.get("originalIndex", 0) or 0) for topic in topic_map.values()), default=0) + 1


def assign_original_index(topic_map: dict[str, dict], topic: dict, counter: list[int]) -> None:
    existing = topic_map.get(topic["id"])
    if existing and existing.get("originalIndex"):
        topic["originalIndex"] = existing["originalIndex"]
    else:
        topic["originalIndex"] = counter[0]
        counter[0] += 1


def build_root(meta: dict, root_id: str, title: str, manual_order: int) -> dict:
    return {
        "id": root_id,
        "title": title,
        "formula": make_formula_lines(title, title),
        "stage": meta["stage"],
        "grade": meta["grade"],
        "term": meta["term"],
        "chapter": meta["chapter"],
        "section": meta["section"],
        "domain": meta["domain"],
        "domainSub": meta["domainSub"],
        "difficulty": "基礎",
        "chapterRole": "主角",
        "parentId": "",
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "tags": [meta["chapterCode"], title],
        "usage": [title],
        "examples": [],
        "tips": ["先看主題，再往下展開原本的分支內容。"],
        "notes": ["這一層是章節穩定主軸。"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "chapterCode": meta["chapterCode"],
        "isBranch": False,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "manualOrder": manual_order,
    }


def build_main_theme(meta: dict, theme: dict, root_id: str) -> dict:
    return {
        "id": theme["mainThemeId"],
        "title": theme["title"],
        "formula": make_formula_lines(theme["title"], theme["summary"]),
        "stage": meta["stage"],
        "grade": meta["grade"],
        "term": meta["term"],
        "chapter": meta["chapter"],
        "section": meta["section"],
        "domain": meta["domain"],
        "domainSub": meta["domainSub"],
        "difficulty": "基礎",
        "chapterRole": "主題",
        "parentId": root_id,
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "tags": [meta["chapterCode"], "主題", theme["title"]],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": ["如果題目太雜，先判斷它屬於哪個主題，再決定往哪組分支看。"],
        "notes": ["這一層是固定主軸，之後章節大綱和主題頁都會先看這裡。"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "chapterCode": meta["chapterCode"],
        "isBranch": False,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "manualOrder": theme["topicNumber"],
    }


def build_wrapper(meta: dict, theme: dict) -> dict:
    return {
        "id": theme["wrapperId"],
        "title": theme["title"],
        "formula": make_core_formula_lines(theme["rows"]),
        "stage": meta["stage"],
        "grade": meta["grade"],
        "term": meta["term"],
        "chapter": meta["chapter"],
        "section": meta["section"],
        "domain": meta["domain"],
        "domainSub": meta["domainSub"],
        "difficulty": "基礎",
        "chapterRole": "主題",
        "parentId": theme["mainThemeId"],
        "contentTypes": ["公式", "定義", "題型", "使用技巧", "注意事項", "常見錯誤"],
        "tags": [meta["chapterCode"], theme["title"], "重點整理"],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": ["先看主題整理，再往下接既有分支。"],
        "notes": [f"來源：{SOURCE_REF}"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "chapterCode": meta["chapterCode"],
        "isBranch": False,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "manualOrder": theme["topicNumber"] * 100,
    }


def export_topic_pdf(reader: PdfReader, topic: dict) -> str:
    file_name = f"{topic['chapterCode']}-topic-{topic['topicNumber']}-{topic['slug']}.pdf"
    output_path = PDF_EXPORT_DIR / file_name
    writer = PdfWriter()
    for page_number in range(topic["pageStart"] - 1, topic["pageEnd"]):
        writer.add_page(reader.pages[page_number])
    with output_path.open("wb") as fh:
        writer.write(fh)
    return file_name


def upsert_main_topic_entry(store: dict, topic: dict, updated_at: str, pdf_file: str) -> None:
    store[topic["mainThemeId"]] = {
        "id": topic["mainThemeId"],
        "title": topic["title"],
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {"type": "table", "headers": ["重點", "整理"], "rows": topic["rows"]},
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {"type": "pdf-page", "src": f"data/main-theme-overviews/{pdf_file}", "note": topic["title"]},
                ],
            },
        ],
    }


def retarget(topic: dict, meta: dict, parent_id: str) -> None:
    topic["parentId"] = parent_id
    topic["stage"] = meta["stage"]
    topic["grade"] = meta["grade"]
    topic["term"] = meta["term"]
    topic["gradeLabel"] = meta["gradeLabel"]
    topic["chapter"] = meta["chapter"]
    topic["section"] = meta["section"]
    topic["domain"] = meta["domain"]
    topic["domainSub"] = meta["domainSub"]
    topic["chapterCode"] = meta["chapterCode"]
    topic["chapter_code"] = meta["chapterCode"]
    topic["chapterOrder"] = meta["chapterOrder"]
    topic["stageOrder"] = meta["stageOrder"]
    topic["gradeOrder"] = meta["gradeOrder"]
    topic["termOrder"] = meta["termOrder"]
    topic["chapterRole"] = "分支"
    topic["isBranch"] = True
    topic["modifiedAt"] = meta["updatedAt"]


PLAN = {
    "chapterCode": "j4-2",
    "meta": {
        "stage": "國中",
        "grade": "國二",
        "term": "下學期",
        "gradeLabel": "國二下",
        "chapter": "線型函數",
        "section": "線型函數",
        "domain": "函數與圖形",
        "domainSub": "代數",
        "stageOrder": 1,
        "gradeOrder": 2,
        "termOrder": 2,
        "chapterOrder": 4,
    },
    "rootId": "junior-linear-function-main-j42",
    "rootTitle": "線型函數",
    "rootManualOrder": 1420,
    "topics": [
        {
            "topicNumber": 1,
            "slug": "function-meaning-and-correspondence",
            "title": "函數的意義與對應關係",
            "summary": "先抓住「一個輸入只對一個輸出」，再判斷題目是不是在描述函數關係。",
            "pageStart": 11,
            "pageEnd": 11,
            "mainThemeId": "j4-2-main-theme-function-meaning-and-correspondence",
            "wrapperId": "j4-2-main-theme-function-meaning-and-correspondence-core",
            "rows": [
                ["函數的基本條件", "若每一個 \\(x\\) 都只對應到唯一一個 \\(y\\)，就稱 \\(y\\) 是 \\(x\\) 的函數。"],
                ["函數是在描述對應規則", "像時間和路程、單價和總價，都可以用函數表示。"],
                ["同一個輸入不能對多個輸出", "若同一個 \\(x\\) 對應到兩個不同的 \\(y\\)，就不是函數。"],
                ["先判斷誰先決定", "題目裡要先找哪個量先決定，哪個量跟著改變。"],
                ["函數不只用公式表示", "表格、圖形、文字規則也都可以表示函數。"],
            ],
            "branchIds": ["j4-2-function-definition"],
        },
        {
            "topicNumber": 2,
            "slug": "variables-and-domain",
            "title": "自變數、應變數與定義域",
            "summary": "先分清楚 \\(x\\) 和 \\(y\\) 扮演的角色，再看哪些值根本不能代進去。",
            "pageStart": 12,
            "pageEnd": 12,
            "mainThemeId": "j4-2-main-theme-variables-and-domain",
            "wrapperId": "j4-2-main-theme-variables-and-domain-core",
            "rows": [
                ["自變數與應變數", "通常把先選定的量記為自變數 \\(x\\)，跟著改變的量記為應變數 \\(y\\)。"],
                ["不是每個數都能代", "像分母不能為 \\(0\\)、根號內不能為負，都會限制自變數的範圍。"],
                ["定義域觀念", "所有可以代入的 \\(x\\) 值集合，就是這個函數的定義域。"],
                ["先看能不能代，再看怎麼算", "做函數題時，先檢查值是否合法，比較不容易出錯。"],
                ["值域先用直觀理解", "雖然國中不一定強調名稱，但也要知道輸出值會跟著限制改變。"],
            ],
            "branchIds": ["j4-2-domain-range"],
        },
        {
            "topicNumber": 3,
            "slug": "tables-relations-and-formulas",
            "title": "用表格、對應表與關係式表示函數",
            "summary": "先把每一組 \\((x,y)\\) 對應看清楚，再從表格猜規律、寫關係式。",
            "pageStart": 13,
            "pageEnd": 13,
            "mainThemeId": "j4-2-main-theme-tables-relations-and-formulas",
            "wrapperId": "j4-2-main-theme-tables-relations-and-formulas-core",
            "rows": [
                ["表格看對應最清楚", "表格能清楚整理每個 \\(x\\) 對應哪個 \\(y\\)。"],
                ["關係式是在寫規則", "例如 \\(y=2x+3\\) 表示先乘 \\(2\\) 再加 \\(3\\)。"],
                ["讀表格要一組一組看", "不要把不同列的值混在一起。"],
                ["由表格找關係式", "可以先看增加規律，再猜算式是否一致。"],
                ["由關係式做表格", "要逐一代入題目指定的 \\(x\\) 值，不能跳步。"],
            ],
            "branchIds": [],
        },
        {
            "topicNumber": 4,
            "slug": "function-values-and-substitution",
            "title": "函數值與代入計算",
            "summary": "看到函數值先代入，再檢查式子的結構、符號和最後答案是否合理。",
            "pageStart": 14,
            "pageEnd": 14,
            "mainThemeId": "j4-2-main-theme-function-values-and-substitution",
            "wrapperId": "j4-2-main-theme-function-values-and-substitution-core",
            "rows": [
                ["函數值的意思", "把指定的 \\(x\\) 代入關係式後算出的結果，就是對應的函數值。"],
                ["先看整個式子的結構", "括號、分數、次方都要先看清楚再代。"],
                ["反過來給 \\(y\\) 是在解方程式", "若題目反過來給 \\(y\\) 要求 \\(x\\)，就不是單純代入。"],
                ["常和表格、圖形一起出題", "函數值題常和表格題、圖形題連在一起。"],
                ["算完要回頭檢查", "避免代錯符號或抄錯位置。"],
            ],
            "branchIds": ["j4-2-function-evaluation"],
        },
        {
            "topicNumber": 5,
            "slug": "graphs-and-coordinate-meaning",
            "title": "函數圖形與座標上的意義",
            "summary": "先把圖上的點看成 \\((x,y)\\) 對應，再用圖形讀值、看趨勢、判斷是不是函數。",
            "pageStart": 15,
            "pageEnd": 15,
            "mainThemeId": "j4-2-main-theme-graphs-and-coordinate-meaning",
            "wrapperId": "j4-2-main-theme-graphs-and-coordinate-meaning-core",
            "rows": [
                ["圖上的點代表對應值", "函數圖形上的每一個點都代表一組 \\((x,y)\\)。"],
                ["從表格畫圖", "要先把每一組 \\((x,y)\\) 標在座標平面上，再看形成什麼規律。"],
                ["讀圖先看橫再看縱", "看圖讀值時，要先看點的橫坐標，再看縱坐標。"],
                ["同一個 \\(x\\) 對兩點就不是函數", "這是用圖形判斷函數的方法。"],
                ["圖形能看出趨勢和交點", "它不只是畫好看，也能幫助判讀。"],
            ],
            "branchIds": ["j4-2-graph-reading"],
        },
        {
            "topicNumber": 6,
            "slug": "direct-proportion-and-y-equals-ax",
            "title": "正比函數與 \\(y=ax\\)",
            "summary": "抓住比例常數 \\(a\\) 的正負與大小，才能看懂正比函數的圖形方向和陡峭程度。",
            "pageStart": 16,
            "pageEnd": 16,
            "mainThemeId": "j4-2-main-theme-direct-proportion-and-y-equals-ax",
            "wrapperId": "j4-2-main-theme-direct-proportion-and-y-equals-ax-core",
            "rows": [
                ["正比函數的形式", "若兩個量成正比，關係式可寫成 \\(y=ax\\)。"],
                ["圖形通過原點", "當 \\(x=0\\) 時，\\(y\\) 也會是 \\(0\\)，所以圖形會通過 \\((0,0)\\)。"],
                ["\\(a\\) 的正負影響方向", "\\(a>0\\) 時往右上升，\\(a<0\\) 時往右下降。"],
                ["\\(|a|\\) 影響陡峭程度", "\\(|a|\\) 愈大，圖形通常愈陡。"],
                ["固定比例的情境常寫成正比", "像單價固定、速度固定、比例固定等。"],
            ],
            "branchIds": ["j4-2-slope-change"],
        },
        {
            "topicNumber": 7,
            "slug": "linear-function-and-y-equals-ax-plus-b",
            "title": "一次函數與 \\(y=ax+b\\)",
            "summary": "把斜率、截距、兩點求式子和兩直線交點都放回同一條一次函數主線來看。",
            "pageStart": 17,
            "pageEnd": 17,
            "mainThemeId": "j4-2-main-theme-linear-function-and-y-equals-ax-plus-b",
            "wrapperId": "j4-2-main-theme-linear-function-and-y-equals-ax-plus-b-core",
            "rows": [
                ["一次函數的形式", "一次函數常寫成 \\(y=ax+b\\)，其中 \\(a\\ne 0\\)。"],
                ["\\(a\\) 是變化率", "\\(a\\) 代表每增加 \\(1\\) 單位的 \\(x\\)，\\(y\\) 會改變多少。"],
                ["\\(b\\) 是截距", "\\(b\\) 代表當 \\(x=0\\) 時的值，也就是和 \\(y\\) 軸相交的位置。"],
                ["正比是一次函數的特例", "當 \\(b=0\\) 時，就會變成 \\(y=ax\\)。"],
                ["比較圖形要同看 \\(a\\) 和 \\(b\\)", "一個影響傾斜程度，一個影響上下位置。"],
            ],
            "branchIds": [
                "j4-2-linear-form",
                "j4-2-intercepts",
                "j4-2-two-point-line",
                "j4-2-line-intersection",
            ],
        },
        {
            "topicNumber": 8,
            "slug": "applications-and-interpretation",
            "title": "函數的實際應用與判讀",
            "summary": "把文字題翻成表格、圖形或關係式，再回頭讀懂交點、費率和答案的情境意思。",
            "pageStart": 18,
            "pageEnd": 18,
            "mainThemeId": "j4-2-main-theme-applications-and-interpretation",
            "wrapperId": "j4-2-main-theme-applications-and-interpretation-core",
            "rows": [
                ["先找固定規則", "讀文字題時，要先找固定不變的規則，再決定是否能寫成函數。"],
                ["基本費加單價常是一函數型", "若總費用 = 基本費 + 單價 × 數量，就常能寫成一次函數。"],
                ["幾組資料也能先做表格", "先整理成表格，再檢查是否符合固定變化規律。"],
                ["交點表示兩方案相同", "看到圖形交點時，通常表示兩種方案在那一點的結果相同。"],
                ["最後要回到情境解讀", "不要只停在算出一個數，還要回頭回答題目真正問的量。"],
            ],
            "branchIds": ["j4-2-word-model-linear"],
        },
    ],
}


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    topic_map = {topic["id"]: topic for topic in formula_db.get("topics", [])}
    original_index_counter = [next_original_index(topic_map)]
    reader = PdfReader(str(SOURCE_PDF))

    manifest = {"sourcePdf": str(SOURCE_PDF), "count": 0, "topics": []}
    if PDF_MANIFEST.exists():
        manifest = load_json(PDF_MANIFEST)
        manifest["sourcePdf"] = str(SOURCE_PDF)
    manifest_topics = [item for item in manifest.get("topics", []) if item.get("chapterCode") != PLAN["chapterCode"]]

    meta = dict(PLAN["meta"])
    meta["chapterCode"] = PLAN["chapterCode"]
    meta["updatedAt"] = updated_at

    root = build_root(meta, PLAN["rootId"], PLAN["rootTitle"], PLAN["rootManualOrder"])
    assign_original_index(topic_map, root, original_index_counter)
    upsert_topic(topic_map, root)

    for theme in PLAN["topics"]:
        theme_entry = build_main_theme(meta, theme, PLAN["rootId"])
        assign_original_index(topic_map, theme_entry, original_index_counter)
        upsert_topic(topic_map, theme_entry)

        wrapper = build_wrapper(meta, theme)
        assign_original_index(topic_map, wrapper, original_index_counter)
        upsert_topic(topic_map, wrapper)

        pdf_file = export_topic_pdf(reader, {"chapterCode": PLAN["chapterCode"], **theme})
        manifest_topics.append(
            {
                "chapterCode": PLAN["chapterCode"],
                "topicNumber": theme["topicNumber"],
                "slug": theme["slug"],
                "title": theme["title"],
                "pageStart": theme["pageStart"],
                "pageEnd": theme["pageEnd"],
                "file": pdf_file,
            }
        )
        upsert_main_topic_entry(main_topic_db.setdefault("byId", {}), theme, updated_at, pdf_file)

        for branch_id in theme["branchIds"]:
            branch = topic_map.get(branch_id)
            if branch:
                retarget(branch, meta, theme["wrapperId"])

    formula_db["topics"] = sorted(
        topic_map.values(),
        key=lambda topic: (
            int(topic.get("stageOrder", 999) or 999),
            int(topic.get("gradeOrder", 999) or 999),
            int(topic.get("termOrder", 999) or 999),
            int(topic.get("chapterOrder", 999) or 999),
            str(topic.get("chapterCode", topic.get("chapter_code", ""))),
            int(topic.get("manualOrder", 99999) or 99999),
            int(topic.get("originalIndex", 999999) or 999999),
            topic["id"],
        ),
    )
    formula_db.setdefault("meta", {})
    formula_db["meta"]["updatedAt"] = updated_at

    main_topic_db.setdefault("meta", {})
    main_topic_db["meta"]["count"] = len(main_topic_db.get("byId", {}))
    main_topic_db["meta"]["updatedAt"] = updated_at
    main_topic_db["meta"]["source"] = "data/main-theme-overviews"

    manifest_topics.sort(key=lambda item: (item["chapterCode"], int(item["topicNumber"]), item["slug"]))
    manifest["topics"] = manifest_topics
    manifest["count"] = len(manifest_topics)

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(PDF_MANIFEST, manifest)
    print("Applied main themes for j4-2")


if __name__ == "__main__":
    main()

