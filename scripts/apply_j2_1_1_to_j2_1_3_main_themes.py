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
        "chapterCode": "j2-1-1",
        "groupName": "國中・國一下・二元一次方程式",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "下學期",
            "gradeLabel": "國一下",
            "chapter": "二元一次聯立方程式",
            "section": "二元一次方程式",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 2,
            "chapterOrder": 1,
        },
        "rootId": "junior-two-variable-equation-main-j211",
        "rootTitle": "二元一次方程式",
        "rootManualOrder": 411,
        "paragraphEditable": (
            "1. 這章正式改以四個主題當主軸：用兩個符號表示數與列式、二元一次式與二元一次方程式、二元一次式的運算與同類項、二元一次方程式的解與限制條件。\n"
            "2. 這章的核心不是急著移項，而是先看兩個未知量怎麼被題目條件描述，再分清楚式子、方程式、同類項和數對解的意義。\n"
            "3. 看到題目時，先判斷它是在列式、在整理式子，還是在判斷某一組 \\((x,y)\\) 能不能成立，不要把不同層次混在一起。\n"
            "4. 這章的大綱第三欄先直接取主題整理中的重點，之後再慢慢把它們拆成真正分支。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "two-symbols-and-modeling",
                "title": "用兩個符號表示數與列式",
                "pageStart": 2,
                "pageEnd": 2,
                "mainThemeId": "j2-1-1-main-theme-two-symbols-and-modeling",
                "wrapperId": "j2-1-1-main-theme-two-symbols-and-modeling-core",
                "summary": "整理兩個未知量的表示方式、字母定義、列式觀念與生活情境的條件翻譯。",
                "rows": [
                    ["兩個未知量常用兩個字母表示", "當題目同時有兩個未知量時，常用 \\(x\\)、\\(y\\) 分別表示，例如花束枝數、速度或數量。"],
                    ["先定義字母，再列式", "先講清楚 \\(x\\)、\\(y\\) 各自代表什麼，再依題意把總價、位移、頭數、腳數翻成代數式。"],
                    ["不同量可以同時出現在同一個式子裡", "像總價可寫成 \\(5x+15y+80\\)，表示兩種商品再加上一個固定費用。"],
                    ["列式關鍵是看關係", "看到單價、數量、總價、頭數、腳數、倍數關係時，要先抓數量之間的關係，不要只看文字長短。"],
                    ["一個條件通常先得到一個式子", "若題目只給一個條件，往往只能先列出一個二元一次式或方程式，還不一定能唯一決定 \\(x\\)、\\(y\\)。"],
                    ["生活情境常要兩個條件", "像雞兔同籠只知道頭數不夠，還要再知道腳數，才有機會把答案鎖定。"],
                ],
                "branchIds": [
                    "j2-1-1-context-to-equation",
                    "j2-1-1-parameter-substitution",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "two-variable-expression-and-equation",
                "title": "二元一次式與二元一次方程式",
                "pageStart": 3,
                "pageEnd": 3,
                "mainThemeId": "j2-1-1-main-theme-two-variable-expression-and-equation",
                "wrapperId": "j2-1-1-main-theme-two-variable-expression-and-equation-core",
                "summary": "整理二元一次式、二元一次方程式的定義、常見寫法與判斷方式。",
                "rows": [
                    ["二元一次式的定義", "只含兩個未知數，且每個未知數的次方都是 \\(1\\) 的式子，叫做二元一次式。"],
                    ["常見形式", "二元一次式常寫成 \\(ax+by+c\\)，二元一次方程式常寫成 \\(ax+by=c\\)。"],
                    ["係數與常數項", "在 \\(ax+by+c\\) 中，\\(a\\)、\\(b\\) 是係數，\\(c\\) 是常數項。"],
                    ["什麼不算二元一次式", "像 \\(x^2+y\\)、\\(xy+3\\) 都不是，因為前者有二次，後者有兩個字母相乘。"],
                    ["方程式比式子多一個等號", "像 \\(8x+15y+80=140\\) 是方程式；若沒有等號，就只是表示數量關係的式子。"],
                    ["名稱要分清楚", "式子是用來表示關係，方程式是用來表達左右相等的條件。"],
                ],
                "branchIds": [
                    "j2-1-1-two-variable-equation-main",
                    "j2-1-1-equivalent-transform",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "expression-operations-and-like-terms",
                "title": "二元一次式的運算與同類項",
                "pageStart": 4,
                "pageEnd": 4,
                "mainThemeId": "j2-1-1-main-theme-expression-operations-and-like-terms",
                "wrapperId": "j2-1-1-main-theme-expression-operations-and-like-terms-core",
                "summary": "整理同類項、去括號、分配律與二元一次式的加減乘整理。",
                "rows": [
                    ["同類項的整理", "含 \\(x\\) 的和含 \\(x\\) 的合併，含 \\(y\\) 的和含 \\(y\\) 的合併，常數和常數合併。"],
                    ["不同字母不能亂合併", "\\(3x+2y\\) 不能變成 \\(5xy\\)，也不能直接變成 \\(5x\\)。"],
                    ["加減法整理方式", "先去括號，再把 \\(x\\) 項、\\(y\\) 項、常數項分開整理。"],
                    ["乘法常用分配律", "例如 \\(2(-3x+4y-5)=-6x+8y-10\\)。"],
                    ["負號進括號要整體變號", "例如 \\(-(4x-2y+3)=-4x+2y-3\\)。"],
                    ["運算順序不變", "還是先括號，再乘除，最後加減。"],
                ],
                "branchIds": [
                    "j2-1-1-expression-simplify",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "solution-and-constraints",
                "title": "二元一次方程式的解與限制條件",
                "pageStart": 5,
                "pageEnd": 5,
                "mainThemeId": "j2-1-1-main-theme-solution-and-constraints",
                "wrapperId": "j2-1-1-main-theme-solution-and-constraints-core",
                "summary": "整理數對解的意思、多組解、列表找解與情境限制條件。",
                "rows": [
                    ["解要寫成有順序的數對", "例如 \\((x,y)=(2,3)\\)；順序不能隨便交換。"],
                    ["代回去真的成立才算解", "把 \\((x,y)\\) 代回原方程式後，等號左右相等，這組數對才算一組解。"],
                    ["一個方程式通常有很多組解", "因為兩個未知數只被一個條件限制，通常還留有很多自由度。"],
                    ["加上限制後解會變少", "若題目要求 \\(x\\)、\\(y\\) 是正整數或非負整數，可接受的解會立刻變少。"],
                    ["表格列值是一種找解方法", "固定一些 \\(x\\) 的值，再去算對應的 \\(y\\)，可以快速找出符合條件的數對。"],
                    ["情境決定答案能不能接受", "像張數、瓶數、數量通常不能是負數，也常不能是分數。"],
                ],
                "branchIds": [
                    "j2-1-1-ordered-pair-check",
                    "j2-1-1-integer-constraint",
                ],
            },
        ],
    },
    {
        "chapterCode": "j2-1-2",
        "groupName": "國中・國一下・二元一次聯立方程式",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "下學期",
            "gradeLabel": "國一下",
            "chapter": "二元一次聯立方程式",
            "section": "二元一次聯立方程式",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 2,
            "chapterOrder": 2,
        },
        "rootId": "junior-linear-system-main-j212",
        "rootTitle": "二元一次聯立方程式",
        "rootManualOrder": 512,
        "paragraphEditable": (
            "1. 這章正式改以兩個主題當主軸：二元一次聯立方程式與解的意義、解聯立方程式的主要方法。\n"
            "2. 這章最重要的是看懂兩個條件怎麼一起限制同一組 \\((x,y)\\)，再判斷該用代入消去還是加減消去。\n"
            "3. 來源 PDF 的第 7 頁把解聯立與應用題列式放在同一頁，網站這裡先保留「解聯立」主線；應用題主線會另外放到 `j2-1-3`。\n"
            "4. 高斯消去法先當成解聯立主線下的進階分支，不另外硬拆成獨立章節。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "system-meaning-and-solution-cases",
                "title": "二元一次聯立方程式與解的意義",
                "pageStart": 6,
                "pageEnd": 6,
                "mainThemeId": "j2-1-2-main-theme-system-meaning-and-solution-cases",
                "wrapperId": "j2-1-2-main-theme-system-meaning-and-solution-cases-core",
                "summary": "整理聯立方程式的意義、解的條件，以及一組解、無解、無限多解三種情況。",
                "rows": [
                    ["聯立方程式的意思", "把兩個二元一次方程式一起並列，表示同一個情境中的兩個條件。"],
                    ["聯立方程式的解", "一組 \\((x,y)\\) 必須同時滿足兩個方程式，少滿足一個都不算解。"],
                    ["唯一解", "兩個條件剛好交會在同一組 \\((x,y)\\)，就只有一組解。"],
                    ["無解", "兩個條件彼此衝突，找不到同時成立的數對。"],
                    ["無限多解", "兩個方程式其實在描述同一條件，所以會有無限多組共同解。"],
                    ["圖形理解", "可以把它想成兩條直線的關係：相交、平行不交、整條重合。"],
                ],
                "branchIds": [
                    "system-linear-equations",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "substitution-and-elimination-methods",
                "title": "解聯立方程式：代入消去法與加減消去法",
                "pageStart": 7,
                "pageEnd": 7,
                "mainThemeId": "j2-1-2-main-theme-substitution-and-elimination-methods",
                "wrapperId": "j2-1-2-main-theme-substitution-and-elimination-methods-core",
                "summary": "整理聯立解法的核心想法、代入消去、加減消去與高斯消去的入門觀念。",
                "rows": [
                    ["核心想法", "先消去一個未知數，把聯立方程式變成熟悉的一元一次方程式。"],
                    ["代入消去法", "先從其中一式解出一個未知數，再代回另一式。"],
                    ["代入法適合情況", "若某一式已很接近 \\(x=\\cdots\\) 或 \\(y=\\cdots\\)，或某個係數剛好是 \\(1\\)，通常先想代入。"],
                    ["加減消去法", "先把兩式調整成某個未知數係數相同或相反，再相加或相減把它消掉。"],
                    ["加減法適合情況", "若兩式係數好配，只要乘上適當倍數就能消去某個未知數，通常先想加減消去。"],
                    ["求出第一個未知數後要代回", "先找到一個未知數之後，還要代回其中一式，才能把另一個未知數也求出來。"],
                    ["高斯消去法入門", "高斯消去只是把係數整理成增廣矩陣後做消去，本質仍然是把兩個未知數消成一個。"],
                ],
                "branchIds": [
                    "substitution-elimination",
                    "addition-subtraction-elimination",
                    "symmetric-system",
                    "nonnegative-system",
                    "abc-equal-system",
                    "variable-substitution-system",
                    "express-number-with-variable",
                    "two-variables-to-one",
                    "positive-integer-solution-discussion",
                    "j2-1-2-system-main",
                ],
            },
        ],
    },
    {
        "chapterCode": "j2-1-3",
        "groupName": "國中・國一下・二元一次方程式應用問題",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "下學期",
            "gradeLabel": "國一下",
            "chapter": "二元一次聯立方程式",
            "section": "二元一次方程式應用問題",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 2,
            "chapterOrder": 3,
        },
        "rootId": "junior-word-problem-main-j213",
        "rootTitle": "二元一次方程式應用問題",
        "rootManualOrder": 613,
        "paragraphEditable": (
            "1. 這章正式改以一個主題當主軸：應用題列式與建模流程。\n"
            "2. 這章最重要的不是算得快，而是先把題目中的數量、單價、頭腳、位值、速率等條件翻成兩個方程式。\n"
            "3. 來源 PDF 的第 7 頁把解聯立和應用題列式放在同一頁，網站這裡先把應用題主線獨立出來，方便後面附掛價格、雞兔、年齡、數字、速率等分支。\n"
            "4. 求出 \\(x\\)、\\(y\\) 之後，不要停在代數答案，還要翻回原題並檢查情境是否合理。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "word-problem-modeling-and-checking",
                "title": "應用題列式與建模流程",
                "pageStart": 7,
                "pageEnd": 7,
                "mainThemeId": "j2-1-3-main-theme-word-problem-modeling-and-checking",
                "wrapperId": "j2-1-3-main-theme-word-problem-modeling-and-checking-core",
                "summary": "整理應用題設未知數、列兩式、解聯立、回題檢查的完整流程。",
                "rows": [
                    ["應用題通常先列兩個條件", "像總數、總價、總腳數、倍數關係等，常常剛好可以整理成兩個方程式。"],
                    ["解題步驟固定", "先設 \\(x\\)、\\(y\\)，再依題意列兩式，接著解聯立方程式，最後把答案翻回原題。"],
                    ["建模要先看量之間的關係", "要先分清楚誰是數量、誰是單價、誰是速率、誰是位值，才能列出正確方程式。"],
                    ["常見模型很多但流程相同", "價格數量、雞兔同籠、年齡收支、數字位值、速率距離，最後都要回到設未知數與列式。"],
                    ["答案合理性檢查", "商品數量不能是負數，單價通常不會是奇怪分數，求出的 \\(x\\)、\\(y\\) 一定要再檢查情境。"],
                    ["回題作答", "算到 \\(x\\)、\\(y\\) 只是中間步驟，最後一定要用題目原本的語言回答。"],
                ],
                "branchIds": [
                    "j2-1-3-word-problem-main",
                ],
                "originalNote": "來源 PDF 第 7 頁同時包含解聯立與應用題列式，網站先共用這頁原稿版。"
            }
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
    note = topic.get("originalNote", topic["title"])
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
                        "note": note,
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


def main() -> None:
    updated_at = now_iso()
    ensure_dir(PDF_EXPORT_DIR)

    formula_db = load_json(FORMULA_DB)
    topics = formula_db["topics"]
    main_topic_db = load_json(MAIN_TOPIC_DB)
    chapter_overview_db = load_json(CHAPTER_OVERVIEW_DB)

    reader = PdfReader(str(SOURCE_PDF))

    manifest_topics: list[dict] = []

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

    manifest_payload = {
        "sourcePdf": str(SOURCE_PDF),
        "count": len(manifest_topics),
        "topics": manifest_topics,
    }

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(CHAPTER_OVERVIEW_DB, chapter_overview_db)
    save_json(PDF_MANIFEST, manifest_payload)

    print(f"Updated chapters: {', '.join(plan['chapterCode'] for plan in TOPIC_PLAN)}")
    print(f"Generated topic PDFs: {len(manifest_topics)}")


if __name__ == "__main__":
    main()

