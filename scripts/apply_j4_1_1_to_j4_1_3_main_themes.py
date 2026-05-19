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
    lines = []
    for idx, row in enumerate(rows[:3], start=1):
        lines.append({"label": f"重點{idx}", "values": [row[0]]})
    return {"type": "labeled-lines", "lines": lines}


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
        return
    topic["originalIndex"] = counter[0]
    counter[0] += 1


def build_root(meta: dict, root_id: str, root_title: str, manual_order: int) -> dict:
    return {
        "id": root_id,
        "title": root_title,
        "formula": make_formula_lines(root_title, root_title),
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
        "tags": [meta["chapterCode"], root_title],
        "usage": [root_title],
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


def build_main_theme_core(meta: dict, theme: dict) -> dict:
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
                    {
                        "type": "table",
                        "headers": ["重點", "整理"],
                        "rows": topic["rows"],
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
                        "note": topic["title"],
                    }
                ],
            },
        ],
    }


def retarget_existing_topic(topic: dict, meta: dict, parent_id: str) -> None:
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


PLAN = [
    {
        "chapterCode": "j4-1-1",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "下學期",
            "gradeLabel": "國二下",
            "chapter": "數列與級數",
            "section": "等差數列",
            "domain": "數與量",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 2,
            "chapterOrder": 1,
        },
        "rootId": "junior-arithmetic-sequence-main-j411",
        "rootTitle": "等差數列",
        "rootManualOrder": 1411,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "pattern-and-sequence-language",
                "title": "規律與數列的基本語言",
                "summary": "先分清楚規律、數列、第 \\(n\\) 項和前 \\(n\\) 項和在問什麼，避免把 \\(a_n\\) 和 \\(S_n\\) 混在一起。",
                "pageStart": 2,
                "pageEnd": 2,
                "mainThemeId": "j4-1-1-main-theme-pattern-and-sequence-language",
                "wrapperId": "j4-1-1-main-theme-pattern-and-sequence-language-core",
                "rows": [
                    ["規律題先看變化方式", "先判斷每次是固定加、固定乘，還是圖形固定增加某些邊或格子。"],
                    ["數列重視順序", "同樣幾個數換了位置，就可能是不同的數列。"],
                    ["第 \\(1\\) 項到第 \\(n\\) 項的記號", "第 \\(1\\) 項記為 \\(a_1\\)，第 \\(2\\) 項記為 \\(a_2\\)，第 \\(n\\) 項記為 \\(a_n\\)。"],
                    ["級數是在看總和", "把數列各項加起來後，前 \\(n\\) 項和通常記為 \\(S_n\\)。"],
                    ["先分清楚問 \\(a_n\\) 還是 \\(S_n\\)", "一個是在問單一項，一個是在問總和，不能混著算。"],
                ],
                "branchIds": [
                    "j4-1-1-arithmetic-definition",
                    "arithmetic-sequence-identify-common-difference",
                    "arithmetic-sequence-first-terms",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "arithmetic-sequence-and-nth-term",
                "title": "等差數列與第 \\(n\\) 項",
                "summary": "掌握公差 \\(d\\) 和通項公式 \\(a_n=a_1+(n-1)d\\)，才能穩定求首項、公差、項數和末項。",
                "pageStart": 3,
                "pageEnd": 3,
                "mainThemeId": "j4-1-1-main-theme-arithmetic-sequence-and-nth-term",
                "wrapperId": "j4-1-1-main-theme-arithmetic-sequence-and-nth-term-core",
                "rows": [
                    ["公差固定就是等差", "相鄰兩項的差固定不變，就是等差數列，這個固定的差記為 \\(d\\)。"],
                    ["公差要用後項減前項", "例如 \\(d=a_2-a_1\\)，不要把順序寫反。"],
                    ["第 \\(n\\) 項公式", "等差數列第 \\(n\\) 項公式是 \\(a_n=a_1+(n-1)d\\)。"],
                    ["公差可以為正、負、分數或 \\(0\\)", "所以等差數列不一定會愈來愈大，也可能持平或往下。"],
                    ["求項數和末項要代公式", "已知首項和公差時，最穩的方法是直接代入，不要只靠心算往後推。"],
                ],
                "branchIds": [
                    "arithmetic-sequence-junior",
                    "j4-1-1-an-formula",
                    "j4-1-1-find-a1-d",
                    "arithmetic-sequence-nth-term",
                    "arithmetic-sequence-find-first-or-index",
                    "arithmetic-sequence-index-positive-negative",
                    "arithmetic-sequence-properties",
                    "arithmetic-common-terms",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "arithmetic-mean-and-fill-blanks",
                "title": "等差中項與補空格",
                "summary": "看到三項等差時，先用等差中項和平均數觀念整理，再處理補空格或分數型題目。",
                "pageStart": 4,
                "pageEnd": 4,
                "mainThemeId": "j4-1-1-main-theme-arithmetic-mean-and-fill-blanks",
                "wrapperId": "j4-1-1-main-theme-arithmetic-mean-and-fill-blanks-core",
                "rows": [
                    ["三項等差的差相等", "若 \\(a,b,c\\) 成等差數列，則 \\(b-a=c-b\\)。"],
                    ["等價寫法", "也可以寫成 \\(a+c=2b\\)，所以 \\(b=\\dfrac{a+c}{2}\\)。"],
                    ["中項就是平均數", "三項等差時，中項就是左右兩項的平均數。"],
                    ["補空格先找公差", "項數較多時，先找出公差，再往前往後補，不要只憑局部猜答案。"],
                    ["分數題先整理數值", "遇到分數型等差題，先把數值整理乾淨再算，比較不容易錯。"],
                ],
                "branchIds": [
                    "j4-1-1-arithmetic-mean",
                    "arithmetic-mean-basic",
                    "arithmetic-three-numbers",
                ],
            },
        ],
    },
    {
        "chapterCode": "j4-1-2",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "下學期",
            "gradeLabel": "國二下",
            "chapter": "數列與級數",
            "section": "等比數列",
            "domain": "數與量",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 2,
            "chapterOrder": 2,
        },
        "rootId": "junior-geometric-sequence-main-j412",
        "rootTitle": "等比數列",
        "rootManualOrder": 1412,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "geometric-sequence-and-nth-term",
                "title": "等比數列與第 \\(n\\) 項",
                "summary": "先看公比 \\(r\\) 是不是固定，再用 \\(a_n=a_1r^{n-1}\\) 去找第 \\(n\\) 項。",
                "pageStart": 6,
                "pageEnd": 6,
                "mainThemeId": "j4-1-2-main-theme-geometric-sequence-and-nth-term",
                "wrapperId": "j4-1-2-main-theme-geometric-sequence-and-nth-term-core",
                "rows": [
                    ["公比固定就是等比", "相鄰兩項的比固定不變，就是等比數列，這個固定的比記為 \\(r\\)。"],
                    ["公比通常用後項除以前項", "例如 \\(r=\\dfrac{a_2}{a_1}\\)。"],
                    ["第 \\(n\\) 項公式", "等比數列第 \\(n\\) 項公式是 \\(a_n=a_1r^{n-1}\\)。"],
                    ["公比可能是正、負或分數", "若公比為負，項的正負常會交替出現。"],
                    ["固定乘不是固定加", "看到數列時要先分類，不要把等比誤判成等差。"],
                ],
                "branchIds": [
                    "geometric-sequence-junior",
                    "j4-1-2-geometric-definition",
                    "j4-1-2-an-formula",
                    "j4-1-2-find-a1-r",
                    "geometric-sequence-identify-ratio",
                    "geometric-sequence-first-terms",
                    "geometric-sequence-nth-term",
                    "geometric-sequence-find-first-ratio-index",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "geometric-mean-and-geometric-series",
                "title": "等比中項與等比級數",
                "summary": "先理解等比中項，再接上等比級數求和與成長衰減模型。",
                "pageStart": 7,
                "pageEnd": 7,
                "mainThemeId": "j4-1-2-main-theme-geometric-mean-and-geometric-series",
                "wrapperId": "j4-1-2-main-theme-geometric-mean-and-geometric-series-core",
                "rows": [
                    ["三項等比的關係", "若 \\(a,b,c\\) 成等比數列，則 \\(\\dfrac{b}{a}=\\dfrac{c}{b}\\)，也可寫成 \\(b^2=ac\\)。"],
                    ["等比中項", "常寫成 \\(b=\\pm\\sqrt{ac}\\)，最後要依題目情境決定正負。"],
                    ["公比為 \\(1\\) 時的總和", "若 \\(r=1\\)，則每一項都相同，所以 \\(S_n=na_1\\)。"],
                    ["公比不為 \\(1\\) 時的總和", "可用 \\(S_n=\\dfrac{a_1(1-r^n)}{1-r}\\)，也能寫成 \\(\\dfrac{a_1(r^n-1)}{r-1}\\)。"],
                    ["公式來自消去法", "等比級數和公式是從 \\(S_n-rS_n\\) 的相減消去法推來的。"],
                ],
                "branchIds": [
                    "j4-1-2-geometric-mean",
                    "j4-1-2-geometric-series-sum",
                    "j4-1-2-growth-decay-model",
                    "geometric-mean-basic",
                    "geometric-three-numbers",
                    "geometric-sequence-applications",
                ],
            },
        ],
    },
    {
        "chapterCode": "j4-1-3",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "下學期",
            "gradeLabel": "國二下",
            "chapter": "數列與級數",
            "section": "等差級數",
            "domain": "數與量",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 2,
            "chapterOrder": 3,
        },
        "rootId": "junior-arithmetic-series-main-j413",
        "rootTitle": "等差級數",
        "rootManualOrder": 1413,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "arithmetic-series-and-sum",
                "title": "等差級數與前 \\(n\\) 項和",
                "summary": "先看頭尾配對的求和觀念，再選對等差級數公式，避免把總和和末項混在一起。",
                "pageStart": 5,
                "pageEnd": 5,
                "mainThemeId": "j4-1-3-main-theme-arithmetic-series-and-sum",
                "wrapperId": "j4-1-3-main-theme-arithmetic-series-and-sum-core",
                "rows": [
                    ["等差級數是在把等差數列相加", "重點不是只會背公式，而是知道它來自頭尾配對。"],
                    ["已知首項、末項與項數", "可用 \\(S_n=\\dfrac{n(a_1+a_n)}{2}\\)。"],
                    ["已知首項、公差與項數", "可用 \\(S_n=\\dfrac{n[2a_1+(n-1)d]}{2}\\)。"],
                    ["項數是奇數時的看法", "也可以想成 \\(S_n=\\text{項數}\\times\\text{中央項}\\)。"],
                    ["先分清楚問總和還是問末項", "做題前要先確認題目是在問 \\(S_n\\) 還是 \\(a_n\\)。"],
                ],
                "branchIds": [
                    "arithmetic-series-junior",
                    "j4-1-1-arithmetic-series-sum",
                    "arithmetic-series-basic-sum",
                    "arithmetic-series-find-term-count-first",
                    "arithmetic-series-insert-middle-sum",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "sigma-and-an-sn-relation",
                "title": "\\(\\sum\\) 符號與 \\(a_n\\)、\\(S_n\\) 的關係",
                "summary": "看到 \\(\\sum\\) 時先翻回加法式，再利用 \\(a_n=S_n-S_{n-1}\\) 反推單項。",
                "pageStart": 8,
                "pageEnd": 8,
                "mainThemeId": "j4-1-3-main-theme-sigma-and-an-sn-relation",
                "wrapperId": "j4-1-3-main-theme-sigma-and-an-sn-relation-core",
                "rows": [
                    ["\\(\\sum\\) 是加法縮寫", "例如 \\(\\sum_{i=1}^{10} i\\) 表示 \\(1+2+\\cdots+10\\)。"],
                    ["看清楚上下標", "下標表示從哪裡開始，上標表示加到哪裡，看錯起點終點整題就會錯。"],
                    ["由部分和反推單項", "若已知部分和，可用 \\(a_n=S_n-S_{n-1}\\) 反推出第 \\(n\\) 項。"],
                    ["連續整數和常用大減小", "例如從 \\(10\\) 加到 \\(100\\)，可用前 \\(100\\) 項和減前 \\(9\\) 項和。"],
                    ["先翻成自己看得懂的式子", "看到 \\(\\sum\\) 題時，先展開加法，再決定要用哪個公式。"],
                ],
                "branchIds": [
                    "arithmetic-series-partial-sum-difference",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "pattern-applications",
                "title": "圖形規律與應用題",
                "summary": "先判斷是固定加還是固定乘，再回到題目真正問的是第幾項、總數還是總面積。",
                "pageStart": 9,
                "pageEnd": 9,
                "mainThemeId": "j4-1-3-main-theme-pattern-applications",
                "wrapperId": "j4-1-3-main-theme-pattern-applications-core",
                "rows": [
                    ["圖形規律先看怎麼增加", "要看每次新增多少邊、多少格，或多少重疊部分，不要只看外觀。"],
                    ["固定增加通常是等差型", "像棉花棒、方格周長常屬於這一類。"],
                    ["固定倍增通常是等比型", "像細菌倍增、分裂、重複放大常屬於這一類。"],
                    ["最後回答題目真正問的量", "有時不是問 \\(n\\)，而是問第幾項、總數或圖形總面積。"],
                    ["答案還要回頭檢查", "項數通常要是正整數，角度與數量也要符合情境。"],
                ],
                "branchIds": [
                    "j4-1-1-word-model",
                    "arithmetic-series-applications",
                    "arithmetic-series-residue-multiples",
                    "arithmetic-series-square-difference",
                ],
            },
        ],
    },
]


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
    manifest_topics = [
        item
        for item in manifest.get("topics", [])
        if item.get("chapterCode") not in {"j4-1-1", "j4-1-2", "j4-1-3"}
    ]

    for chapter in PLAN:
        meta = dict(chapter["meta"])
        meta["chapterCode"] = chapter["chapterCode"]
        meta["updatedAt"] = updated_at

        root = build_root(meta, chapter["rootId"], chapter["rootTitle"], chapter["rootManualOrder"])
        assign_original_index(topic_map, root, original_index_counter)
        upsert_topic(topic_map, root)

        for theme in chapter["topics"]:
            theme_entry = build_main_theme(meta, theme, chapter["rootId"])
            assign_original_index(topic_map, theme_entry, original_index_counter)
            upsert_topic(topic_map, theme_entry)

            core_entry = build_main_theme_core(meta, theme)
            assign_original_index(topic_map, core_entry, original_index_counter)
            upsert_topic(topic_map, core_entry)

            pdf_file = export_topic_pdf(reader, {"chapterCode": chapter["chapterCode"], **theme})
            manifest_topics.append(
                {
                    "chapterCode": chapter["chapterCode"],
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
                if not branch:
                    continue
                retarget_existing_topic(branch, meta, theme["wrapperId"])

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
    print("Applied main themes for j4-1-1 ~ j4-1-3")


if __name__ == "__main__":
    main()

