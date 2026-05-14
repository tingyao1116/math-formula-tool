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
        "chapterCode": "j2-4-1",
        "groupName": "國中・國一下・解一元一次不等式",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "下學期",
            "gradeLabel": "國一下",
            "chapter": "一元一次不等式",
            "section": "解一元一次不等式",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 2,
            "chapterOrder": 8,
        },
        "rootId": "junior-linear-inequality-main-j241",
        "rootTitle": "解一元一次不等式",
        "rootManualOrder": 1118,
        "paragraphEditable": (
            "1. 這章正式改以六個主題當主軸：不等號與一元一次不等式、正負數減法與大小比較、三一律與遞移律、不等號在數線上的表示、不等式的性質與移項規則、解一元一次不等式。\n"
            "2. 這章最重要的是把不等式看成範圍，不是只解出一個數；每次整理完都要回到數線與區間去理解答案。\n"
            "3. 看到題目時，先判斷它是在考語意轉換、大小比較、數線表示，還是基本解法，不要一看到不等號就只會機械移項。\n"
            "4. 複合不等式、絕對值不等式與應用題，這次改放到 `j2-4-2`，避免把基礎解法章節撐得太雜。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "inequality-symbols-and-linear-inequalities",
                "title": "不等號與一元一次不等式",
                "pageStart": 25,
                "pageEnd": 25,
                "mainThemeId": "j2-4-1-main-theme-inequality-symbols-and-linear-inequalities",
                "wrapperId": "j2-4-1-main-theme-inequality-symbols-and-linear-inequalities-core",
                "summary": "整理常見不等號、一元一次不等式的定義，以及中文語句轉不等式。",
                "rows": [
                    ["常見不等號要分清楚是否含等號", "\\(>\\) 和 \\(<\\) 不含等於；\\(\\ge\\) 和 \\(\\le\\) 則包含等於。"],
                    ["一元一次不等式只含一個未知數", "而且未知數的最高次是一次，例如 \\(2x+3>4x-5\\)。"],
                    ["生活語句要先翻成符號", "像至少、不少於通常用 \\(\\ge\\)；至多、不超過通常用 \\(\\le\\)。"],
                    ["不等式在比範圍不是比單點", "它描述的是哪些數能成立，而不只是找一個答案。"],
                    ["先把字意翻對再開始整理", "題目一開始如果關鍵詞抓錯，後面計算再正確也會整個偏掉。"],
                ],
                "branchIds": [
                    "inequality-language-basic",
                    "j2-4-1-symbol-language",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "sign-subtraction-and-size-comparison",
                "title": "正負數、減法與大小比較",
                "pageStart": 26,
                "pageEnd": 26,
                "mainThemeId": "j2-4-1-main-theme-sign-subtraction-and-size-comparison",
                "wrapperId": "j2-4-1-main-theme-sign-subtraction-and-size-comparison-core",
                "summary": "整理用差的正負判斷大小，先把大小比較和相反數觀念接起來。",
                "rows": [
                    ["看 \\(a-b\\) 的正負可判斷大小", "若 \\(a-b>0\\) 就代表 \\(a>b\\)；若 \\(a-b<0\\) 就代表 \\(a<b\\)。"],
                    ["差為零表示兩數相等", "也就是 \\(a-b=0\\) 時，\\(a=b\\)。"],
                    ["相反數觀念是變號基礎", "正數的相反數是負數，負數的相反數是正數。"],
                    ["比較大小可以先轉成差", "這樣就能用正、零、負去判斷誰大誰小。"],
                    ["有些大小比較會連到次方", "像 \\(a>1\\) 時，次方增大值通常更大；若 \\(0<a<1\\)，情形反過來。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 3,
                "slug": "trichotomy-and-transitive-law",
                "title": "三一律與遞移律",
                "pageStart": 27,
                "pageEnd": 27,
                "mainThemeId": "j2-4-1-main-theme-trichotomy-and-transitive-law",
                "wrapperId": "j2-4-1-main-theme-trichotomy-and-transitive-law-core",
                "summary": "整理大小關係的三一律與遞移律，學會把多個條件串起來。",
                "rows": [
                    ["三一律表示三種情況只會有一種成立", "任意兩數 \\(a\\)、\\(b\\) 之間，\\(a>b\\)、\\(a=b\\)、\\(a<b\\) 恰好只有一種成立。"],
                    ["遞移律能把大小關係接起來", "若 \\(a>b\\) 且 \\(b>c\\)，就可推出 \\(a>c\\)。"],
                    ["小於關係也能遞移", "若 \\(a<b\\) 且 \\(b<c\\)，則 \\(a<c\\)。"],
                    ["\\(\\ge\\) 與 \\(\\le\\) 也能用類似想法", "整理多個條件時，這種串接方式很常用。"],
                    ["先找共同中間量最穩", "遞移律要順利使用，先把條件裡的共同量找出來。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 4,
                "slug": "number-line-representation-of-inequalities",
                "title": "不等號在數線上的表示",
                "pageStart": 28,
                "pageEnd": 28,
                "mainThemeId": "j2-4-1-main-theme-number-line-representation-of-inequalities",
                "wrapperId": "j2-4-1-main-theme-number-line-representation-of-inequalities-core",
                "summary": "整理空心點、實心點與方向，學會把不等式翻成數線圖。",
                "rows": [
                    ["\\(x>2\\) 用空心點往右畫", "表示在 \\(2\\) 的右邊，而且不包含 \\(2\\)。"],
                    ["\\(x\\ge2\\) 用實心點往右畫", "表示在 \\(2\\) 的右邊，而且包含 \\(2\\)。"],
                    ["\\(x<-4\\) 往左畫且不含端點", "所以在 \\(-4\\) 放空心點，再往左延伸。"],
                    ["\\(x\\le-4\\) 往左畫且包含端點", "所以在 \\(-4\\) 放實心點，再往左延伸。"],
                    ["數線很適合檢查答案", "方向和端點一畫出來，就能看出有沒有把包含關係弄錯。"],
                ],
                "branchIds": [
                    "linear-inequality-region",
                    "j2-4-1-number-line-interval",
                ],
            },
            {
                "topicNumber": 5,
                "slug": "inequality-properties-and-transposition-rules",
                "title": "不等式的性質與移項規則",
                "pageStart": 29,
                "pageEnd": 29,
                "mainThemeId": "j2-4-1-main-theme-inequality-properties-and-transposition-rules",
                "wrapperId": "j2-4-1-main-theme-inequality-properties-and-transposition-rules-core",
                "summary": "整理同加同減、同乘同除與翻號規則，建立解不等式的基本操作。",
                "rows": [
                    ["兩邊同加或同減，不等號方向不變", "這和等式的整理方式很像，是最基本的操作。"],
                    ["兩邊同乘或同除正數，方向不變", "只要乘除的是正數，不等號不用翻向。"],
                    ["兩邊同乘或同除負數，方向一定反轉", "這是不等式最容易錯的地方。"],
                    ["移項可以看成同加同減", "所以移項時變號，但方向不會因為單純移項而改變。"],
                    ["最後一步看到負數要特別停一下", "很多錯誤都發生在最後除以負係數時忘記翻號。"],
                ],
                "branchIds": [
                    "j2-4-1-add-sub-property",
                    "j2-4-1-mul-div-sign-flip",
                    "j2-4-1-transpose-collect",
                ],
            },
            {
                "topicNumber": 6,
                "slug": "solving-linear-inequalities",
                "title": "解一元一次不等式",
                "pageStart": 30,
                "pageEnd": 30,
                "mainThemeId": "j2-4-1-main-theme-solving-linear-inequalities",
                "wrapperId": "j2-4-1-main-theme-solving-linear-inequalities-core",
                "summary": "整理一元一次不等式的解題流程，包含化簡、移項、除係數與驗算。",
                "rows": [
                    ["解是一整段成立的範圍", "所以答案常寫成 \\(x>2\\)、\\(x\\le-\\frac{2}{5}\\) 這種形式。"],
                    ["基本流程和方程式相近", "常用去括號、移項、合併同類項、除係數的方式整理。"],
                    ["解完後可挑數代回檢查", "選一個落在答案範圍內的數代回去看原不等式是否成立。"],
                    ["集合記號也是一種寫法", "像 \\(\\{x\\mid x>2\\}\\) 也是在表示同一段範圍。"],
                    ["題目有整數或情境限制時要再收束", "例如最多、最少或只能取整數時，答案要回到題意再整理。"],
                ],
                "branchIds": [
                    "linear-inequality-basic",
                    "j2-4-1-inequality-main",
                ],
            },
        ],
    },
    {
        "chapterCode": "j2-4-2",
        "groupName": "國中・國一下・一元一次不等式應用問題",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "下學期",
            "gradeLabel": "國一下",
            "chapter": "一元一次不等式",
            "section": "一元一次不等式應用問題",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 2,
            "chapterOrder": 9,
        },
        "rootId": "junior-linear-inequality-application-main-j242",
        "rootTitle": "一元一次不等式應用問題",
        "rootManualOrder": 1219,
        "paragraphEditable": (
            "1. 這章正式改以三個主題當主軸：複合不等式與共同範圍、絕對值不等式、不等式應用問題。\n"
            "2. 這章最重要的是把範圍交集、距離觀念和情境限制接在一起，不只會算，還要能判斷答案落在哪一段。\n"
            "3. 看到題目時，先判斷它是在考上下界交集、絕對值距離，還是在考文字應用題；這三種題目雖然都和不等式有關，但切入點不同。\n"
            "4. 這樣切可以把 `j2-4-1` 的基本解法和 `j2-4-2` 的延伸應用分開，章節層次會更清楚。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "compound-inequalities-and-common-range",
                "title": "複合不等式與共同範圍",
                "pageStart": 31,
                "pageEnd": 31,
                "mainThemeId": "j2-4-2-main-theme-compound-inequalities-and-common-range",
                "wrapperId": "j2-4-2-main-theme-compound-inequalities-and-common-range-core",
                "summary": "整理上下界同時成立的情況，學會拆式、作圖與取交集。",
                "rows": [
                    ["複合不等式表示條件要同時成立", "所以最後答案要取共同部分，而不是把兩段都留下。"],
                    ["遇到夾在中間的式子可拆成兩條不等式", "像 \\(2x<3x-5<13\\) 可分成左右兩條分別去解。"],
                    ["解完後放回同一條數線", "把兩邊的解畫在一起，找重疊區域最不容易出錯。"],
                    ["沒有重疊就是無解", "條件若彼此衝突，就找不到共同可行範圍。"],
                    ["數線交集是最穩的檢查方式", "尤其題目一長，用圖形看交集通常比硬記更穩。"],
                ],
                "branchIds": [
                    "j2-4-1-chain-inequality",
                    "j2-4-2-condition-intersection",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "absolute-value-inequalities",
                "title": "絕對值不等式",
                "pageStart": 32,
                "pageEnd": 32,
                "mainThemeId": "j2-4-2-main-theme-absolute-value-inequalities",
                "wrapperId": "j2-4-2-main-theme-absolute-value-inequalities-core",
                "summary": "整理絕對值不等式與距離觀念，分清楚中間一段與兩側外側。",
                "rows": [
                    ["\\(|x|<a\\) 看中間一段", "可改寫成 \\(-a<x<a\\)，表示距離原點小於 \\(a\\)。"],
                    ["\\(|x|\\le a\\) 端點也包含", "所以改寫成 \\(-a\\le x\\le a\\)。"],
                    ["\\(|x|>a\\) 看兩側外圍", "可改寫成 \\(x>a\\) 或 \\(x<-a\\)。"],
                    ["\\(|x|\\ge a\\) 也要把邊界含進去", "因此是 \\(x\\ge a\\) 或 \\(x\\le-a\\)。"],
                    ["\\(|x-h|\\) 要改看離 \\(h\\) 的距離", "中心不一定在原點，先找中心再判斷中間或外側。"],
                ],
                "branchIds": [
                    "j2-4-1-abs-inequality-basic",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "word-problems-with-linear-inequalities",
                "title": "不等式應用問題",
                "pageStart": 33,
                "pageEnd": 33,
                "mainThemeId": "j2-4-2-main-theme-word-problems-with-linear-inequalities",
                "wrapperId": "j2-4-2-main-theme-word-problems-with-linear-inequalities-core",
                "summary": "整理設未知數、語句轉不等號、多條件交集與整數解檢查，建立應用題流程。",
                "rows": [
                    ["先設未知數並寫清楚代表什麼", "未知數如果沒定義清楚，後面列式很容易混亂。"],
                    ["把關鍵語句翻成正確不等號", "像至少用 \\(\\ge\\)，不超過用 \\(\\le\\)，少於用 \\(<\\)，超過用 \\(>\\)。"],
                    ["若有多個限制就列多條不等式", "最後要把各條件的可行範圍取交集。"],
                    ["整數與情境限制要最後再篩一次", "像人數、件數通常要取整數，長度或時間也要符合題意。"],
                    ["答案一定回原題檢查", "應用題不是只把代數解算出來，還要確認是否合理、是否回答了題目。"],
                ],
                "branchIds": [
                    "j2-4-2-word-to-inequality",
                    "j2-4-2-budget-limit",
                    "j2-4-2-distance-time",
                    "j2-4-2-integer-filter",
                    "j2-4-2-answer-check",
                ],
            },
        ],
    },
]

OBSOLETE_FORMULA_TOPIC_IDS = [
    "j2-4-1-main-theme-compound-inequalities-and-common-range",
    "j2-4-1-main-theme-compound-inequalities-and-common-range-core",
    "j2-4-1-main-theme-absolute-value-inequalities",
    "j2-4-1-main-theme-absolute-value-inequalities-core",
]

OBSOLETE_MAIN_TOPIC_OVERVIEW_IDS = [
    "j2-4-1-main-theme-compound-inequalities-and-common-range",
    "j2-4-1-main-theme-absolute-value-inequalities",
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


def remove_obsolete_topics(topics: list[dict]) -> list[dict]:
    obsolete = set(OBSOLETE_FORMULA_TOPIC_IDS)
    return [topic for topic in topics if topic.get("id") not in obsolete]


def remove_obsolete_overviews(main_topic_db: dict) -> None:
    by_id = main_topic_db.setdefault("byId", {})
    for topic_id in OBSOLETE_MAIN_TOPIC_OVERVIEW_IDS:
        by_id.pop(topic_id, None)


def main() -> None:
    updated_at = now_iso()
    ensure_dir(PDF_EXPORT_DIR)

    formula_db = load_json(FORMULA_DB)
    topics = remove_obsolete_topics(formula_db["topics"])
    formula_db["topics"] = topics
    main_topic_db = load_json(MAIN_TOPIC_DB)
    remove_obsolete_overviews(main_topic_db)
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
