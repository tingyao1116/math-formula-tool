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
        "chapterCode": "j1-3-1",
        "groupName": "一元一次式",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "上學期",
            "gradeLabel": "國一上",
            "chapter": "一元一次方程式",
            "section": "一元一次式",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 1,
            "chapterOrder": 8,
        },
        "rootId": "junior-linear-expression-main-j131",
        "rootTitle": "一元一次式",
        "rootManualOrder": 560,
        "paragraphEditable": (
            "1. 這章正式改以四個主題當主軸：用符號表示數與列式；乘法簡記與代值；一元一次式、項與同類項；式子的運算與去括號。\n"
            "2. 這章的核心不是先算，而是先把情境寫成正確的代數式，所以要先分清楚設未知數、列式、代值三件事。\n"
            "3. `合併同類項` 和 `分配律與去括號` 這次前移回 `j1-3-1`，不再留在方程式章混在一起。\n"
            "4. 看題目時先判斷它在問列式整理，還是在問真正解方程式，不要兩章混掉。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的四個主題頁。整理時先抓列式與代值，再往同類項、去括號延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "symbolize-quantity-expression",
                "title": "用符號表示數與列式",
                "pageStart": 30,
                "pageEnd": 30,
                "mainThemeId": "j1-3-1-main-theme-symbolize-quantity-expression",
                "wrapperId": "j1-3-1-main-theme-symbolize-quantity-expression-core",
                "summary": "整理設未知數、連續整數奇偶數與文字轉代數式。",
                "rows": [
                    ["用字母代表數", "常用 \\(x\\)、\\(y\\) 等字母來代表未知數或會改變的數。"],
                    ["列式前先定義", "例如先寫「設哥哥今年 \\(x\\) 歲」，弟弟小 3 歲才寫成 \\(x-3\\)。"],
                    ["連續整數", "若第一個整數設為 \\(x\\)，則連續三個整數可寫成 \\(x\\)、\\(x+1\\)、\\(x+2\\)。"],
                    ["連續奇偶數", "若第一個偶數設為 \\(x\\)，則連續偶數常寫成 \\(x\\)、\\(x+2\\)、\\(x+4\\)⋯。"],
                    ["文字轉代數式", "看到每人多少元、總共幾人、相差幾歲這些描述時，要先把每個量對應成式子。"],
                ],
                "branchIds": [
                    "j1-3-1-expression-main",
                    "j1-3-1-symbolize-quantity",
                    "j1-3-1-consecutive-numbers",
                    "j1-3-1-odd-even-sequences",
                    "j1-3-1-word-to-expression",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "multiplication-shorthand-substitution",
                "title": "乘法簡記與代值",
                "pageStart": 31,
                "pageEnd": 31,
                "mainThemeId": "j1-3-1-main-theme-multiplication-shorthand-substitution",
                "wrapperId": "j1-3-1-main-theme-multiplication-shorthand-substitution-core",
                "summary": "整理乘法簡記、除法改寫與代入求值。",
                "rows": [
                    ["乘法簡記", "因為乘號和字母 \\(x\\) 容易混淆，所以 \\(3\\times x\\) 常寫成 \\(3x\\)。"],
                    ["數字通常在前", "像 \\(5x\\)、\\(12a\\) 這種把係數寫在字母前面，是最常見的寫法。"],
                    ["除法可改分數", "\\(x\\div 3\\) 常改寫成 \\(\\frac{x}{3}\\)。"],
                    ["代值", "代值就是把字母換成已知數字，再依運算順序算出結果。"],
                    ["代入負數要括號", "若 \\(x=-2\\)，則 \\(3x+5=3\\times(-2)+5\\)，不能把負號忽略。"],
                ],
                "branchIds": [
                    "j1-3-1-multiply-divide-notation",
                    "j1-3-1-substitution-value",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "linear-expression-like-terms",
                "title": "一元一次式、項與同類項",
                "pageStart": 32,
                "pageEnd": 32,
                "mainThemeId": "j1-3-1-main-theme-linear-expression-like-terms",
                "wrapperId": "j1-3-1-main-theme-linear-expression-like-terms-core",
                "summary": "整理一元一次式、項、同類項與合併同類項。",
                "rows": [
                    ["一元一次式", "只含一個未知數，而且未知數次方是 1 的式子，叫做一元一次式。"],
                    ["項", "式子中用加號隔開後看到的每一部分，都可以視為一個項。"],
                    ["同類項", "字母相同、次方也相同的項，才叫同類項。"],
                    ["常數項", "像 \\(3\\) 和 \\(-5\\) 這種不含字母的項，也彼此是同類項。"],
                    ["合併原則", "只有同類項才能合併，例如 \\(6x-2x=4x\\)，但 \\(6x+3\\) 不能直接合成 \\(9x\\)。"],
                ],
                "branchIds": [
                    "j1-3-2-combine-like-terms",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "expression-operations-remove-brackets",
                "title": "式子的運算與去括號",
                "pageStart": 33,
                "pageEnd": 33,
                "mainThemeId": "j1-3-1-main-theme-expression-operations-remove-brackets",
                "wrapperId": "j1-3-1-main-theme-expression-operations-remove-brackets-core",
                "summary": "整理分配律、去括號與先化簡再整理的步驟。",
                "rows": [
                    ["運算順序", "通常先處理括號，再做乘除，最後才做加減。"],
                    ["分配律", "\\(a(b+c)=ab+ac\\)，\\(a(b-c)=ab-ac\\)。"],
                    ["正號去括號", "括號前是正號時，去括號通常不變號。"],
                    ["負號去括號", "括號前是負號時，括號裡每一項都要變號。"],
                    ["整理步驟", "先去括號，再合併同類項，整串式子會比較穩。"],
                ],
                "branchIds": [
                    "j1-3-2-distributive-remove-brackets",
                    "linear-remove-parentheses-drill",
                    "linear-multiply-parentheses-drill",
                    "linear-fraction-parentheses-drill",
                ],
            },
        ],
    },
    {
        "chapterCode": "j1-3-2",
        "groupName": "一元一次方程式",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "上學期",
            "gradeLabel": "國一上",
            "chapter": "一元一次方程式",
            "section": "一元一次方程式",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 1,
            "chapterOrder": 9,
        },
        "rootId": "junior-linear-equation-main-j132",
        "rootTitle": "一元一次方程式",
        "rootManualOrder": 620,
        "paragraphEditable": (
            "1. 這章正式改以兩個主題當主軸：等量公理與移項法則；解一元一次方程式。\n"
            "2. 這章的核心是把等式兩邊保持平衡，再逐步把未知數單獨留在一邊。\n"
            "3. `去分母`、`驗算`、`解的型態` 都先收進解方程式主題，不再拆成獨立外層。\n"
            "4. 如果題目只是在整理式子，就回 `j1-3-1`；真正開始解等式時，才看這一章。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的兩個主題頁。整理時先抓等量公理，再往解方程式和驗算延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "equality-axiom-transpose",
                "title": "等量公理與移項法則",
                "pageStart": 34,
                "pageEnd": 34,
                "mainThemeId": "j1-3-2-main-theme-equality-axiom-transpose",
                "wrapperId": "j1-3-2-main-theme-equality-axiom-transpose-core",
                "summary": "整理等量公理、移加變減、移乘變除與等式平衡觀念。",
                "rows": [
                    ["等量公理", "等式兩邊同時加、減、乘、除同一個數，等號仍然成立。"],
                    ["移項本質", "移項只是等量公理的簡寫，本質上仍是等式兩邊做同樣運算。"],
                    ["移加變減", "例如 \\(x+7=25\\) 可改成 \\(x=25-7\\)。"],
                    ["移乘變除", "例如 \\(2x=14\\) 可改成 \\(x=14\\div 2\\)。"],
                    ["天平想法", "左邊做什麼，右邊也要做什麼，才不會破壞等式平衡。"],
                ],
                "branchIds": [
                    "j1-3-2-equation-main",
                    "j1-3-2-equality-axiom-transpose",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "solve-linear-equation",
                "title": "解一元一次方程式",
                "pageStart": 35,
                "pageEnd": 35,
                "mainThemeId": "j1-3-2-main-theme-solve-linear-equation",
                "wrapperId": "j1-3-2-main-theme-solve-linear-equation-core",
                "summary": "整理去分母、移項、解的型態與驗算。",
                "rows": [
                    ["基本順序", "通常先去括號、合併同類項，再把含 \\(x\\) 的移到一邊，常數移到另一邊。"],
                    ["去分母", "含分數方程式常先同乘分母的最小公倍數。"],
                    ["答案可能是負數", "解出 \\(x=-6\\) 也是正常結果，不一定代表算錯。"],
                    ["解的型態", "可能有唯一解、無解，或無限多解。"],
                    ["驗算", "解完把答案代回原方程式，檢查左右兩邊是否真的相等。"],
                ],
                "branchIds": [
                    "linear-equation",
                    "j1-3-2-clear-denominator",
                    "j1-3-2-solution-types",
                    "j1-3-2-check-solution",
                    "linear-move-terms-solve-drill",
                    "linear-expand-move-solve-drill",
                    "linear-cross-expand-move-solve-drill",
                    "linear-lcm-multiply-move-solve-drill",
                ],
            },
        ],
    },
    {
        "chapterCode": "j1-3-3",
        "groupName": "一元一次方程式應用問題",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "上學期",
            "gradeLabel": "國一上",
            "chapter": "一元一次方程式",
            "section": "一元一次方程式應用問題",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 1,
            "chapterOrder": 10,
        },
        "rootId": "junior-linear-word-problem-main-j133",
        "rootTitle": "一元一次方程式應用問題",
        "rootManualOrder": 680,
        "paragraphEditable": (
            "1. 這章正式改以一個主題當主軸：應用題列式與檢查答案。\n"
            "2. 這章的核心不是背題型，而是先設未知數、依題意列式、解方程式、回到情境回答。\n"
            "3. 年齡題、雞兔同籠、行程、混合比例、連續數、金額收支，這次都先掛在同一主題底下。\n"
            "4. `連續數應用題` 雖然會用到 `j1-3-1` 的列式技巧，但主體仍是應用題，先留在這一章。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的應用題主題頁。整理時先抓設未知數與列式，再往各類題型延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "word-problem-modeling",
                "title": "應用題列式與檢查答案",
                "pageStart": 36,
                "pageEnd": 36,
                "mainThemeId": "j1-3-3-main-theme-word-problem-modeling",
                "wrapperId": "j1-3-3-main-theme-word-problem-modeling-core",
                "summary": "整理設未知數、依題意列式、解方程式與回到情境回答。",
                "rows": [
                    ["先設未知數", "先清楚寫出「設某個量為 \\(x\\)」，後面列式才不會漂掉。"],
                    ["依題意列式", "把和、差、倍數、總數、速度、時間、金額等關係翻成等式。"],
                    ["先列式再解", "不要一看到數字就急著算，先把方程式寫對比較重要。"],
                    ["回到情境回答", "題目問的不一定是 \\(x\\) 本身，最後要把答案翻回原題意思。"],
                    ["答案合理性", "像年齡、隻數、房間數不可能是負數或奇怪小數，解完要檢查。"],
                ],
                "branchIds": [
                    "j1-3-3-word-problem-main",
                    "j1-3-3-age-problems",
                    "j1-3-3-chicken-rabbit",
                    "j1-3-3-distance-rate-time",
                    "j1-3-3-mixture-ratio",
                    "j1-3-3-consecutive-number-app",
                    "j1-3-3-profit-budget",
                ],
            },
        ],
    },
]

STRAY_CHAPTER_ASSIGNMENTS = {
    "j1-3-2": [
        "abs-equation-leading-one-drill",
        "abs-equation-leading-not-one-drill",
        "nonnegative-sum-zero-drill",
        "nonnegative-sum-fixed-one-drill",
        "nonnegative-sum-fixed-multix-drill",
        "abs-both-sides-advanced-drill",
        "midpoint-formula",
    ],
}


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


def clear_chapter_fields(topic: dict) -> None:
    topic["chapter_code"] = ""
    topic["chapterCode"] = ""


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

    for chapter_code, stray_ids in STRAY_CHAPTER_ASSIGNMENTS.items():
        for stray_id in stray_ids:
            stray_topic = maybe_find_topic(topics, stray_id)
            if stray_topic is not None:
                clear_chapter_fields(stray_topic)

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

