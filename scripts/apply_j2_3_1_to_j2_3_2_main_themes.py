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
        "chapterCode": "j2-3-1",
        "groupName": "國中・國一下・比例式",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "下學期",
            "gradeLabel": "國一下",
            "chapter": "比例",
            "section": "比例式",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 2,
            "chapterOrder": 6,
        },
        "rootId": "junior-proportion-main-j231",
        "rootTitle": "比例式",
        "rootManualOrder": 916,
        "paragraphEditable": (
            "1. 這章正式改以四個主題當主軸：比與比值、相等的比與比的化簡、比例式與求未知數、比的應用：分配、合併與速度。\n"
            "2. 這章最重要的是先分清楚比較的順序、對應量與總份數，再決定是做化簡、列比例式，還是做應用分配。\n"
            "3. 看到題目時，先判斷它是在考比值、相等的比、交叉相乘，還是在考按比分配與速度，不要把所有比例題混成同一種做法。\n"
            "4. 舊資料裡跟比例有關的 root 和分支比較雜，這次已重新分到四個主題下面；之後若要細拆，再從主題重點往下長分支。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "ratio-and-ratio-value",
                "title": "比與比值",
                "pageStart": 17,
                "pageEnd": 17,
                "mainThemeId": "j2-3-1-main-theme-ratio-and-ratio-value",
                "wrapperId": "j2-3-1-main-theme-ratio-and-ratio-value-core",
                "summary": "整理比、前項後項、比值與連比的基本語言，先把比較關係看清楚。",
                "rows": [
                    ["比要先看順序", "像 \\(a:b\\) 表示前項是 \\(a\\)、後項是 \\(b\\)，\\(a:b\\) 和 \\(b:a\\) 不是同一件事。"],
                    ["比值就是前項除以後項", "\\(a:b\\) 的比值是 \\(\\frac{a}{b}\\)，所以後項 \\(b\\) 不能是 \\(0\\)。"],
                    ["比是一種比較關係", "比值是一個數，兩者意思接近，但表達形式不同。"],
                    ["三個量也能寫連比", "像 \\(100:10:70\\) 可同除 \\(10\\) 化成 \\(10:1:7\\)。"],
                    ["先看量的對應再下手", "比題最怕把前後項放反，所以一開始就要先把比較方向看清楚。"],
                ],
                "branchIds": [
                    "j2-3-1-ratio-main",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "equal-ratios-and-simplification",
                "title": "相等的比與比的化簡",
                "pageStart": 18,
                "pageEnd": 18,
                "mainThemeId": "j2-3-1-main-theme-equal-ratios-and-simplification",
                "wrapperId": "j2-3-1-main-theme-equal-ratios-and-simplification-core",
                "summary": "整理相等的比、最簡整數比，以及分數比、小數比和不同單位的化簡。",
                "rows": [
                    ["相等的比看比值是否相同", "若 \\(a:b=c:d\\)，本質上就是 \\(\\frac{a}{b}=\\frac{c}{d}\\)。"],
                    ["同乘同除同一個非零數，比值不變", "所以化簡比時可以同除公因數，也能同乘把分數或小數整數化。"],
                    ["遇到分數比先乘共同分母", "這樣可以先把分數清掉，再整理成整數比。"],
                    ["遇到小數比先乘 \\(10\\) 的倍數", "把每一項都變成整數後，再約成最簡整數比。"],
                    ["單位不同一定先統一", "像公分和公尺不能直接相比，先換成同單位再化簡。"],
                ],
                "branchIds": [
                    "j2-3-1-simplify-integer-ratio",
                    "j2-3-1-equal-ratio-judge",
                    "j2-3-1-compound-ratio",
                    "j2-3-1-minimal-compound-ratio",
                    "proportion-scale-expand",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "proportion-equations-and-solving-unknowns",
                "title": "比例式與求未知數",
                "pageStart": 19,
                "pageEnd": 19,
                "mainThemeId": "j2-3-1-main-theme-proportion-equations-and-solving-unknowns",
                "wrapperId": "j2-3-1-main-theme-proportion-equations-and-solving-unknowns-core",
                "summary": "整理比例式的寫法、外項內項關係，以及用交叉相乘解未知數。",
                "rows": [
                    ["比例式就是兩個比相等", "可以寫成 \\(a:b=c:d\\)，也可以寫成 \\(\\frac{a}{b}=\\frac{c}{d}\\)。"],
                    ["最基本的性質是外項積等於內項積", "也就是 \\(ad=bc\\)，這是解未知數最常用的起點。"],
                    ["解未知數前先確認位置有沒有放反", "如果前後項對錯了，後面的交叉相乘就會整個偏掉。"],
                    ["比例式變形要兩邊一起守規則", "像 \\(x:y=a:b\\) 時，可以順著乘上係數去改寫，但不能只改一邊。"],
                    ["交叉相乘後常會變成一元一次方程式", "整理符號、移項與驗算的習慣都要跟上。"],
                ],
                "branchIds": [
                    "ratio-proportion",
                    "j2-3-1-proportion-main",
                    "proportion-cross-product",
                    "proportion-constant-r",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "ratio-applications-distribution-combination-speed",
                "title": "比的應用：分配、合併與速度",
                "pageStart": 20,
                "pageEnd": 20,
                "mainThemeId": "j2-3-1-main-theme-ratio-applications-distribution-combination-speed",
                "wrapperId": "j2-3-1-main-theme-ratio-applications-distribution-combination-speed-core",
                "summary": "整理按比分配、合併比例與速度應用，先抓固定量與總份數。",
                "rows": [
                    ["按比分配先求總份數", "若總量已知，就先用總量除以總份數，找出每一份是多少。"],
                    ["只知道其中一部分時先回推一份", "找到一份後，其他各部分就能跟著算出來。"],
                    ["合併比例先對齊共同項", "把共同項調成同一個量後，才能順利接成連比。"],
                    ["速度題要回到 \\(\\text{速度}=\\frac{\\text{距離}}{\\text{時間}}\\)", "不要只比距離，也不要只比時間。"],
                    ["應用題別急著算", "先把總量、份數、對應量排好，再動手計算通常最穩。"],
                ],
                "branchIds": [
                    "j2-3-1-ratio-distribution",
                    "proportion-distribution",
                    "cost-list-sale-price",
                    "discount-price-difference",
                    "distance-time-speed-basic",
                    "concentration-solution-basic",
                ],
            },
        ],
    },
    {
        "chapterCode": "j2-3-2",
        "groupName": "國中・國一下・正比反比",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "下學期",
            "gradeLabel": "國一下",
            "chapter": "比例",
            "section": "正比反比",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 2,
            "chapterOrder": 7,
        },
        "rootId": "junior-direct-inverse-main-j232",
        "rootTitle": "正比反比",
        "rootManualOrder": 1017,
        "paragraphEditable": (
            "1. 這章正式改以三個主題當主軸：正比、反比、正比與反比的綜合判斷。\n"
            "2. 這章最重要的是先找固定量，再去檢查 \\(\\frac{y}{x}\\) 是否固定，或 \\(xy\\) 是否固定，不要只憑感覺看兩個量一起增減。\n"
            "3. 看到題目時，先判斷它是在考正比、反比，還是在考應用情境裡的模型判斷，例如密度、壓力或工程問題。\n"
            "4. 舊資料裡 `正比反比核心觀念` 這類 root 比較寬，這次已重新拆回三個主題；之後若要加細分支，也以這三條主線往下長。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "direct-proportion",
                "title": "正比",
                "pageStart": 21,
                "pageEnd": 21,
                "mainThemeId": "j2-3-2-main-theme-direct-proportion",
                "wrapperId": "j2-3-2-main-theme-direct-proportion-core",
                "summary": "整理正比關係、正比常數與正比圖形，先抓住 \\(y=kx\\) 這條主線。",
                "rows": [
                    ["正比看 \\(\\frac{y}{x}\\) 是否固定", "若 \\(\\frac{y}{x}=k\\)，就表示 \\(y\\) 與 \\(x\\) 成正比。"],
                    ["正比常寫成 \\(y=kx\\)", "\\(k\\) 叫正比常數，表示每一單位 \\(x\\) 對應多少 \\(y\\)。"],
                    ["表格可用商固定來判斷", "每一列的 \\(\\frac{y}{x}\\) 若都相同，通常就是正比。"],
                    ["正比圖形是通過原點的直線", "因為當 \\(x=0\\) 時，\\(y\\) 也會是 \\(0\\)。"],
                    ["不是所有直線都是正比", "像 \\(y=x+3\\) 雖然是直線，但不通過原點，所以不是正比。"],
                ],
                "branchIds": [
                    "j2-3-2-direct-proportion",
                    "j2-3-2-direct-graph",
                    "direct-proportion-basic",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "inverse-proportion",
                "title": "反比",
                "pageStart": 22,
                "pageEnd": 22,
                "mainThemeId": "j2-3-2-main-theme-inverse-proportion",
                "wrapperId": "j2-3-2-main-theme-inverse-proportion-core",
                "summary": "整理反比關係、反比常數與反比圖形，先抓住 \\(xy=k\\) 與 \\(y=\\frac{k}{x}\\)。",
                "rows": [
                    ["反比看 \\(xy\\) 是否固定", "若 \\(xy=k\\)，就表示 \\(y\\) 與 \\(x\\) 成反比。"],
                    ["反比常寫成 \\(y=\\frac{k}{x}\\)", "\\(k\\) 叫反比常數，代表兩個量的乘積固定。"],
                    ["表格可用乘積固定來判斷", "每一列的 \\(x\\times y\\) 若都相同，通常就是反比。"],
                    ["反比圖形是彎曲的曲線", "它不會通過原點，也不會長得像正比的直線。"],
                    ["反比不是一起變小", "真正的反比是其中一個量變大時，另一個量按倍數縮小。"],
                ],
                "branchIds": [
                    "j2-3-2-inverse-proportion",
                    "j2-3-2-inverse-graph",
                    "inverse-proportion-graph",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "judging-direct-and-inverse-proportion",
                "title": "正比與反比的綜合判斷",
                "pageStart": 23,
                "pageEnd": 23,
                "mainThemeId": "j2-3-2-main-theme-judging-direct-and-inverse-proportion",
                "wrapperId": "j2-3-2-main-theme-judging-direct-and-inverse-proportion-core",
                "summary": "整理密度、壓力、工程等情境中的正反比判斷，先找固定量再選模型。",
                "rows": [
                    ["先找固定量再判斷", "若能整理成 \\(\\frac{y}{x}=k\\) 就是正比；若能整理成 \\(xy=k\\) 就是反比。"],
                    ["密度公式 \\(D=\\frac{M}{V}\\)", "體積固定時，密度與質量成正比；質量固定時，密度與體積成反比。"],
                    ["壓力公式 \\(P=\\frac{F}{A}\\)", "力量固定時，壓力與受力面積成反比。"],
                    ["工程問題常看工作量是否固定", "若工作量固定，則人數與天數通常成反比。"],
                    ["別把平方關係誤看成正比", "像自由落體常是距離與時間平方成正比，不是與時間直接成正比。"],
                ],
                "branchIds": [
                    "direct-inverse-proportion",
                    "j2-3-2-direct-inverse-main",
                    "j2-3-2-direct-inverse-application",
                    "j2-3-2-judgement-and-validation",
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


def formula_topic_template(
    root: dict,
    chapter_meta: dict,
    topic_id: str,
    title: str,
    parent_id: str,
    summary: str,
    updated_at: str,
    order_index: int,
) -> dict:
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


def wrapper_topic_template(
    root: dict,
    chapter_meta: dict,
    wrapper_id: str,
    title: str,
    parent_id: str,
    summary: str,
    rows: list[list[str]],
    updated_at: str,
) -> dict:
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
                        "src": f"exports/main-theme-overviews/{topic['file']}",
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
        rows.append([topic["title"], "主題", overview_summary(topic["rows"])])
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
