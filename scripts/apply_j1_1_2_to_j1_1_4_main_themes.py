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
SOURCE_PDF = ROOT / "exports" / "junior-source" / "j1-readable-paged.pdf"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "junior-first-semester-topic-pdfs.json"

TZ = timezone(timedelta(hours=8))
SOURCE_REF = "國一上_易讀版分頁版.docx"

TOPIC_PLAN = [
    {
        "chapterCode": "j1-1-2",
        "groupName": "正負數的加減乘除",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "上學期",
            "gradeLabel": "國一上",
            "chapter": "正負數與數線",
            "section": "正負數的加減乘除",
            "domain": "數與量",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 1,
            "chapterOrder": 2,
        },
        "rootId": "junior-signed-operations-main-j112",
        "rootTitle": "正負數的加減乘除",
        "rootManualOrder": 155,
        "paragraphEditable": (
            "1. 這章正式改以一個主題當主軸：正負數的四則運算。\n"
            "2. 這章最重要的是把加減乘除都拉回符號與方向理解，不要只背口訣。\n"
            "3. 來源主軸目前只有一個主題，所以去括號、分配律、奇怪符號題先都當作這個主題底下的分支。\n"
            "4. 前一章的絕對值不要混進來，這章重點是運算規則本身。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的一個主題頁。整理時先抓正負數四則，再往去括號、分配律與應用小題延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "signed-arithmetic",
                "title": "正負數的四則運算",
                "pageStart": 4,
                "pageEnd": 4,
                "mainThemeId": "j1-1-2-main-theme-signed-arithmetic",
                "wrapperId": "j1-1-2-main-theme-signed-arithmetic-core",
                "summary": "整理同異號加減、減法轉加法、乘除符號規則、分數四則與混合運算。",
                "rows": [
                    ["同號相加", "同號數相加，符號不變，再把絕對值相加。"],
                    ["異號相加", "異號數相加，先比絕對值大小，答案取絕對值較大那個數的符號，再把絕對值相減。"],
                    ["減法改加法", "做減法時，可先改寫成加上相反數，例如 \\(8-(-3)=8+3\\)。"],
                    ["乘除符號規則", "同號相乘或相除得正，異號相乘或相除得負。"],
                    ["分數運算", "正負分數做加減乘除時，分數本來的算法不變，只是多了正負號判斷；除以分數等於乘上倒數。"],
                    ["混合運算", "小數、分數混在一起算時，常先統一形式再算，會比較不容易錯。"],
                    ["讀題提醒", "像負負得正這類口訣只能輔助，真正穩的方法還是回到算式改寫與數線方向去理解。"],
                ],
                "branchIds": [
                    "j1-1-2-integer-addition",
                    "j1-1-2-remove-parentheses",
                    "j1-1-2-comm-assoc-distrib",
                    "time-baseline-basic-drill",
                    "opposite-number-equation-drill",
                    "weird-symbol-calc",
                ],
            }
        ],
    },
    {
        "chapterCode": "j1-1-3",
        "groupName": "指數律",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "上學期",
            "gradeLabel": "國一上",
            "chapter": "正負數與數線",
            "section": "指數律",
            "domain": "數與量",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 1,
            "chapterOrder": 3,
        },
        "rootId": "junior-exponent-laws-main-j113",
        "rootTitle": "指數律",
        "rootManualOrder": 248,
        "paragraphEditable": (
            "1. 這章正式改以五個主題當主軸：乘方與指數的意思、指數律基本規則、正負號與括號判別、分數底數與混合指數、指數比大小。\n"
            "2. 先分清楚底數、指數、括號和正負號，再來背指數律，會穩很多。\n"
            "3. 這章有兩個主題是跨頁的：`指數律基本規則` 和 `指數比大小`，原稿版不能硬切成單頁。\n"
            "4. 零次方、負次方和分數底數要和單純的奇偶次方分開看，不要混成同一題型。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的五個主題頁區塊。整理時先抓乘方意義，再往指數律、符號判別、分數底數與比大小延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "meaning-of-powers",
                "title": "乘方與指數的意思",
                "pageStart": 7,
                "pageEnd": 7,
                "mainThemeId": "j1-1-3-main-theme-meaning-of-powers",
                "wrapperId": "j1-1-3-main-theme-meaning-of-powers-core",
                "summary": "整理次方、底數、指數的基本意義與最初的改寫觀念。",
                "rows": [
                    ["連乘改寫", "同一個數連乘很多次，可以改寫成次方。"],
                    ["底數與指數", "在 \\(a^n\\) 裡，\\(a\\) 叫做底數，\\(n\\) 叫做指數。"],
                    ["指數的意思", "指數表示底數一共乘了幾次，不是把底數和指數直接相乘。"],
                    ["分數底數起點", "像 \\(\\frac{2}{3}\\times\\frac{2}{3}\\times\\frac{2}{3}\\) 也可以改寫成 \\(\\left(\\frac{2}{3}\\right)^3\\)。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 2,
                "slug": "basic-exponent-laws",
                "title": "指數律基本規則",
                "pageStart": 8,
                "pageEnd": 9,
                "mainThemeId": "j1-1-3-main-theme-basic-exponent-laws",
                "wrapperId": "j1-1-3-main-theme-basic-exponent-laws-core",
                "summary": "整理同底數乘除、零次方、負次方、冪的冪與積的冪。",
                "rows": [
                    ["同底數相乘", "\\(a^m\\times a^n=a^{m+n}\\)。"],
                    ["同底數相除", "\\(a^m\\div a^n=a^{m-n}\\)，前提是 \\(a\\neq 0\\)。"],
                    ["零次方", "\\(a^0=1\\)，前提是 \\(a\\neq 0\\)。"],
                    ["負次方", "\\(a^{-n}=\\frac{1}{a^n}\\)，前提是 \\(a\\neq 0\\)。"],
                    ["冪的冪", "\\((a^m)^n=a^{mn}\\)。"],
                    ["積的冪", "\\((ab)^n=a^n b^n\\)。"],
                ],
                "branchIds": [
                    "j1-1-3-exponent-laws-main",
                    "j1-1-3-exponent-laws-mul-div",
                    "j1-1-3-exponent-laws-power-rules",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "sign-parity-brackets",
                "title": "正負號、奇偶次方與括號判別",
                "pageStart": 10,
                "pageEnd": 10,
                "mainThemeId": "j1-1-3-main-theme-sign-parity-brackets",
                "wrapperId": "j1-1-3-main-theme-sign-parity-brackets-core",
                "summary": "整理負號是否進括號、奇偶次方與符號判斷。",
                "rows": [
                    ["偶數次方", "若 \\(n\\) 是偶數，則 \\((-a)^n\\) 是正數。"],
                    ["奇數次方", "若 \\(n\\) 是奇數，則 \\((-a)^n\\) 是負數。"],
                    ["括號影響", "\\((-2)^4=16\\)，但 \\(-2^4=-(2^4)=-16\\)。"],
                    ["沒有括號時", "次方只管到底數本身，不會自動把前面的負號一起算進去。"],
                    ["負底數零次方", "只要底數不為 0，就算是負數底數，也有零次方，例如 \\((-5)^0=1\\)。"],
                    ["讀題提醒", "先看負號有沒有被括號包進底數，再看指數是奇數還是偶數。"],
                ],
                "branchIds": [
                    "j1-1-3-exponent-meaning-and-sign",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "fraction-bases-and-mixed-exponents",
                "title": "分數底數與混合指數運算",
                "pageStart": 11,
                "pageEnd": 11,
                "mainThemeId": "j1-1-3-main-theme-fraction-bases-and-mixed-exponents",
                "wrapperId": "j1-1-3-main-theme-fraction-bases-and-mixed-exponents-core",
                "summary": "整理分數做次方、負指數與倒數，以及混合整理順序。",
                "rows": [
                    ["分數做次方", "\\(\\left(\\frac{a}{b}\\right)^n=\\frac{a^n}{b^n}\\)，前提是 \\(b\\neq 0\\)。"],
                    ["分數負次方", "\\(\\left(\\frac{a}{b}\\right)^{-n}=\\left(\\frac{b}{a}\\right)^n\\)。"],
                    ["倒數想法", "看到負指數時，先想到倒數，再處理正次方。"],
                    ["混合順序", "最穩的順序是先括號、再次方、再同底數合併、最後整理。"],
                ],
                "branchIds": [
                    "j1-1-3-zero-and-negative-exponents",
                ],
            },
            {
                "topicNumber": 5,
                "slug": "comparing-exponential-expressions",
                "title": "指數比大小",
                "pageStart": 12,
                "pageEnd": 13,
                "mainThemeId": "j1-1-3-main-theme-comparing-exponential-expressions",
                "wrapperId": "j1-1-3-main-theme-comparing-exponential-expressions-core",
                "summary": "整理改寫成同底數或同次冪比較，以及底數在 0 到 1 之間時的反向關係。",
                "rows": [
                    ["同次冪比較", "若能改寫成同次冪，就比底數。"],
                    ["同底數比較", "若能改寫成同底數，就比指數。"],
                    ["負指數先改寫", "若有負指數，先改成分數或倒數，再比較。"],
                    ["前面有負號", "若整體前面有負號，最後大小關係會反過來。"],
                    ["底數大於 1", "若 \\(1<a\\) 且 \\(m<n\\)，則 \\(a^m<a^n\\)。"],
                    ["底數介於 0 與 1", "若 \\(0<a<1\\) 且 \\(m<n\\)，則 \\(a^n<a^m\\)。"],
                ],
                "branchIds": [
                    "j1-1-3-exponent-mixed-application",
                ],
            },
        ],
    },
    {
        "chapterCode": "j1-1-4",
        "groupName": "科學記號",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "上學期",
            "gradeLabel": "國一上",
            "chapter": "正負數與數線",
            "section": "科學記號",
            "domain": "數與量",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 1,
            "chapterOrder": 4,
        },
        "rootId": "junior-scientific-notation-main-j114",
        "rootTitle": "科學記號",
        "rootManualOrder": 310,
        "paragraphEditable": (
            "1. 這章正式改以兩個主題當主軸：科學記號與常見單位、科學記號的運算。\n"
            "2. 這章先分清楚 `a×10^n` 的格式，再往大數小數、小數點位移和實際單位轉換走。\n"
            "3. `科學記號與常見單位` 這個主題是跨頁的，第 15 頁電腦容量補充也要一起留在這裡。\n"
            "4. 加減法一定要先整理成同一次方，這件事在第二個主題要先看清楚。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的兩個主題區塊。整理時先抓科學記號格式，再往單位、容量與四則運算延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "scientific-notation-and-units",
                "title": "科學記號與常見單位",
                "pageStart": 14,
                "pageEnd": 15,
                "mainThemeId": "j1-1-4-main-theme-scientific-notation-and-units",
                "wrapperId": "j1-1-4-main-theme-scientific-notation-and-units-core",
                "summary": "整理科學記號格式、大數小數位移、常見長度單位與容量估算。",
                "rows": [
                    ["科學記號格式", "科學記號是把一個數寫成 \\(a\\times 10^n\\) 的形式，且必須滿足 \\(1\\le a<10\\)，\\(n\\) 必須是整數。"],
                    ["大數與小數", "大數時小數點往左移幾位，指數就是正幾；小數時小數點往右移幾位，指數就是負幾。"],
                    ["常見例子", "\\(56000000=5.6\\times 10^7\\)，\\(0.00000003=3\\times 10^{-8}\\)。"],
                    ["常見單位", "\\(1\\text{ cm}=10^{-2}\\text{ m}\\)、\\(1\\text{ mm}=10^{-3}\\text{ m}\\)、\\(1\\mu\\text{m}=10^{-6}\\text{ m}\\)。"],
                    ["容量補充", "\\(1\\text{ byte}=8\\text{ bit}\\)，\\(1\\text{ KB}=1024\\text{ byte}\\)，做估算時常把 1024 近似成 \\(10^3\\)。"],
                    ["讀題提醒", "先看是不是已經符合 \\(1\\le a<10\\)；如果沒有，就還不能算是標準科學記號。"],
                ],
                "branchIds": [
                    "j1-1-4-scientific-notation-main",
                    "j1-1-4-convert-between-forms",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "scientific-notation-operations",
                "title": "科學記號的運算",
                "pageStart": 16,
                "pageEnd": 16,
                "mainThemeId": "j1-1-4-main-theme-scientific-notation-operations",
                "wrapperId": "j1-1-4-main-theme-scientific-notation-operations-core",
                "summary": "整理科學記號乘除、加減與先整理同次方再計算的規則。",
                "rows": [
                    ["乘法", "\\((a\\times 10^m)(b\\times 10^n)=ab\\times 10^{m+n}\\)。"],
                    ["除法", "\\((a\\times 10^m)\\div (b\\times 10^n)=\\frac{a}{b}\\times 10^{m-n}\\)。"],
                    ["加減前提", "加減法時，兩個數一定要先改成同一次方，才能直接相加減。"],
                    ["同次方加減", "若兩個數都整理成同樣的 \\(10^n\\)，則 \\((a\\times 10^n)\\pm (b\\times 10^n)=(a\\pm b)\\times 10^n\\)。"],
                    ["讀題提醒", "乘除法先看前面係數，再看 10 的次方；加減法則先整理成同次方。"],
                ],
                "branchIds": [
                    "j1-1-4-scientific-mul-div",
                    "j1-1-4-scientific-add-sub",
                    "j1-1-4-scientific-application",
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
                {"label": "摘要", "values": [rf"\text{{{chapter_plan['groupName']}}}"]},
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
        "usage": [chapter_plan["groupName"]],
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


def write_pdf_range(reader: PdfReader, page_start: int, page_end: int, destination: Path) -> None:
    writer = PdfWriter()
    for page_number in range(page_start, page_end + 1):
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
        root = maybe_find_topic(topics, chapter_plan["rootId"])
        if root is None:
            root = chapter_root_template(chapter_plan, updated_at)
            upsert_topic(topics, root)
        chapter_meta = chapter_plan["meta"]

        for topic_plan in chapter_plan["topics"]:
            topic_number = topic_plan["topicNumber"]
            pdf_file = f"{chapter_code}-topic-{topic_number}-{topic_plan['slug']}.pdf"
            pdf_path = PDF_EXPORT_DIR / pdf_file
            write_pdf_range(reader, topic_plan["pageStart"], topic_plan["pageEnd"], pdf_path)

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
                    "pageStart": topic_plan["pageStart"],
                    "pageEnd": topic_plan["pageEnd"],
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

