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
SOURCE_PDF = ROOT / "exports" / "j2-first-volume-outline" / "國二上全重點_易讀版分頁版_Word公式版.pdf"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "junior-third-semester-topic-pdfs.json"

TZ = timezone(timedelta(hours=8))
SOURCE_REF = "國二上全重點_易讀版分頁版_Word公式版.docx"


TOPIC_PLAN = [
    {
        "chapterCode": "j3-1-1",
        "groupName": "國中・國二上・乘法公式",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二上",
            "chapter": "乘法公式與多項式",
            "section": "乘法公式",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 1,
        },
        "rootId": "junior-multiplication-formulas-main-j311",
        "rootTitle": "乘法公式",
        "rootManualOrder": 1311,
        "paragraphEditable": (
            "1. 這章正式改以七個主題當主軸：運算律與分配律、二項式相乘與交叉項、完全平方公式、平方差公式與數值速算、三項完全平方與公式整理、立方和與立方差、完全立方與巴斯卡三角形。\n"
            "2. 這章最重要的是先把分配律真的看懂，再去理解各種乘法公式是怎麼展開來的，不要只靠背誦。\n"
            "3. 看到題目時，先判斷它是在考展開、辨認公式、反向配型，還是在考速算或符號檢查。\n"
            "4. 舊資料裡 `和平方`、`差平方`、`平方差`、`立方公式` 這些內容比較分散，這次已重新掛回七個主題下面。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "laws-and-distributive-property",
                "title": "運算律與分配律",
                "pageStart": 2,
                "pageEnd": 2,
                "mainThemeId": "j3-1-1-main-theme-laws-and-distributive-property",
                "wrapperId": "j3-1-1-main-theme-laws-and-distributive-property-core",
                "summary": "整理交換律、結合律與分配律，先把後面所有公式的起點看懂。",
                "rows": [
                    ["交換律與結合律是整理式子的基本工具", "像 \\(a+b=b+a\\)、\\(ab=ba\\)、\\((ab)c=a(bc)\\) 都是在幫你換順序。"],
                    ["分配律是所有乘法公式的起點", "最基本的形式是 \\(a(b+c)=ab+ac\\)。"],
                    ["兩個二項式相乘，本質上也是分配律", "像 \\((a+b)(c+d)=ac+ad+bc+bd\\)。"],
                    ["括號裡有負項時要整項分配", "例如 \\((a-b)(c+d)=ac+ad-bc-bd\\)。"],
                    ["先看懂分配律，再背公式", "之後遇到變形題、拆項題或因式分解才不容易亂。"],
                ],
                "branchIds": [
                    "multiplication-identities-junior",
                    "distributive-law-multiplication-formula",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "binomial-products-and-cross-terms",
                "title": "二項式相乘與交叉項",
                "pageStart": 3,
                "pageEnd": 3,
                "mainThemeId": "j3-1-1-main-theme-binomial-products-and-cross-terms",
                "wrapperId": "j3-1-1-main-theme-binomial-products-and-cross-terms-core",
                "summary": "整理二項式相乘的四個來源與交叉項，先把展開過程看熟。",
                "rows": [
                    ["二項式只有兩項", "像 \\(x+2\\)、\\(3x-y\\) 這種式子都屬於二項式。"],
                    ["\\((a+b)(c+d)\\) 展開後有四個來源", "分別是 \\(ac\\)、\\(ad\\)、\\(bc\\)、\\(bd\\)。"],
                    ["中間項常要再合併同類項", "例如 \\((x+2)(x+3)=x^2+3x+2x+6=x^2+5x+6\\)。"],
                    ["某一項前面有負號時，要把整項當負項", "不能只改一半符號。"],
                    ["橫式、格子法、直式本質相同", "核心都是每一項都要乘到。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 3,
                "slug": "perfect-square-formulas",
                "title": "完全平方公式",
                "pageStart": 4,
                "pageEnd": 4,
                "mainThemeId": "j3-1-1-main-theme-perfect-square-formulas",
                "wrapperId": "j3-1-1-main-theme-perfect-square-formulas-core",
                "summary": "整理和平方與差平方公式，先把中間項和最後一項看穩。",
                "rows": [
                    ["完全平方和公式", "\\((a+b)^2=a^2+2ab+b^2\\)。"],
                    ["完全平方差公式", "\\((a-b)^2=a^2-2ab+b^2\\)。"],
                    ["最後一項一定是 \\(b^2\\)", "差的平方也不是 \\(-b^2\\)。"],
                    ["中間項符號由括號中的加減決定", "加法是 \\(+2ab\\)，減法是 \\(-2ab\\)。"],
                    ["有係數時整項看成一個單位", "例如在 \\((2x+3y)^2\\) 中，可把 \\(a=2x\\)、\\(b=3y\\)。"],
                ],
                "branchIds": [
                    "sum-square-identity",
                    "difference-square-identity",
                    "j3-1-1-square-formulas",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "difference-of-squares-and-mental-arithmetic",
                "title": "平方差公式與數值速算",
                "pageStart": 5,
                "pageEnd": 5,
                "mainThemeId": "j3-1-1-main-theme-difference-of-squares-and-mental-arithmetic",
                "wrapperId": "j3-1-1-main-theme-difference-of-squares-and-mental-arithmetic-core",
                "summary": "整理平方差公式、反向辨認與數值速算應用。",
                "rows": [
                    ["平方差公式", "\\((a+b)(a-b)=a^2-b^2\\)。"],
                    ["關鍵特徵是前一項相同、後一項互為相反數", "符合這個形狀時才可以直接套平方差。"],
                    ["反過來也要會看", "\\(a^2-b^2\\) 可以拆成 \\((a+b)(a-b)\\)。"],
                    ["數值速算常用平方差", "像 \\(117^2-17^2=(117+17)(117-17)\\)。"],
                    ["求值題常把公式反向接回去", "先辨認結構，再決定要展開還是要配回公式。"],
                ],
                "branchIds": [
                    "square-difference-identity",
                    "identity-value-evaluation",
                    "j3-1-1-sum-diff-product",
                    "j3-1-1-mental-arithmetic",
                ],
            },
            {
                "topicNumber": 5,
                "slug": "three-term-square-and-formula-organization",
                "title": "三項完全平方與公式整理",
                "pageStart": 6,
                "pageEnd": 6,
                "mainThemeId": "j3-1-1-main-theme-three-term-square-and-formula-organization",
                "wrapperId": "j3-1-1-main-theme-three-term-square-and-formula-organization-core",
                "summary": "整理三項完全平方、公式辨認與反推技巧。",
                "rows": [
                    ["三項完全平方公式", "\\((a+b+c)^2=a^2+b^2+c^2+2ab+2ac+2bc\\)。"],
                    ["理解方式是先各自平方，再把任兩項相乘後乘 \\(2\\)", "不要只靠死背公式。"],
                    ["有負項時整項帶進去", "像 \\((a+2b-3c)^2\\) 中，\\(-3c\\) 要整項帶入。"],
                    ["完全平方和、完全平方差、平方差、三項平方外形不同", "辨認時要先看結構，不要混套。"],
                    ["條件題常用公式反推", "已知 \\(a+b\\) 與 \\(ab\\) 時，可用 \\((a+b)^2\\) 去求 \\(a^2+b^2\\)。"],
                ],
                "branchIds": [
                    "three-sum-square-guest",
                    "j3-1-1-formula-reverse",
                    "j3-1-1-sign-check",
                ],
            },
            {
                "topicNumber": 6,
                "slug": "sum-and-difference-of-cubes",
                "title": "立方和與立方差",
                "pageStart": 7,
                "pageEnd": 7,
                "mainThemeId": "j3-1-1-main-theme-sum-and-difference-of-cubes",
                "wrapperId": "j3-1-1-main-theme-sum-and-difference-of-cubes-core",
                "summary": "整理立方和、立方差公式，先分清楚中間項的正負號。",
                "rows": [
                    ["立方和公式", "\\((a+b)(a^2-ab+b^2)=a^3+b^3\\)。"],
                    ["立方差公式", "\\((a-b)(a^2+ab+b^2)=a^3-b^3\\)。"],
                    ["中間項符號最容易混", "立方和配的是 \\(-ab\\)，立方差配的是 \\(+ab\\)。"],
                    ["這兩個公式可以正向展開，也可以反向因式分解", "後面因式分解章節會一直用到。"],
                    ["遇到複合項時先整項看成 \\(a\\) 或 \\(b\\)", "不要拆散後再硬套公式。"],
                ],
                "branchIds": [
                    "cube-identities-guest",
                ],
            },
            {
                "topicNumber": 7,
                "slug": "perfect-cubes-and-pascals-triangle",
                "title": "完全立方與巴斯卡三角形",
                "pageStart": 8,
                "pageEnd": 8,
                "mainThemeId": "j3-1-1-main-theme-perfect-cubes-and-pascals-triangle",
                "wrapperId": "j3-1-1-main-theme-perfect-cubes-and-pascals-triangle-core",
                "summary": "整理完全立方公式與巴斯卡三角形的係數規律。",
                "rows": [
                    ["完全立方和公式", "\\((a+b)^3=a^3+3a^2b+3ab^2+b^3\\)。"],
                    ["完全立方差公式", "\\((a-b)^3=a^3-3a^2b+3ab^2-b^3\\)。"],
                    ["係數 \\(1,3,3,1\\) 可以從巴斯卡三角形讀出", "這能幫助理解展開係數從哪裡來。"],
                    ["更高次展開也能觀察係數規律", "例如 \\((a+b)^4\\) 的係數是 \\(1,4,6,4,1\\)。"],
                    ["差的高次展開可把 \\(b\\) 看成 \\(-b\\)", "這樣符號交錯會自然出現。"],
                ],
                "branchIds": [
                    "j3-1-1-cubic-formulas",
                ],
            },
        ],
    },
    {
        "chapterCode": "j3-1-2",
        "groupName": "國中・國二上・多項式的加減",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二上",
            "chapter": "乘法公式與多項式",
            "section": "多項式的加減",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 2,
        },
        "rootId": "junior-polynomial-add-subtract-main-j312",
        "rootTitle": "多項式的加減",
        "rootManualOrder": 1312,
        "paragraphEditable": (
            "1. 這章正式改以兩個主題當主軸：多項式的基本名詞、升冪降冪與同類項合併。\n"
            "2. 這章最重要的是先分清楚項、次數、同類項，再處理去括號與多項式加減，不要看到多項式就急著算。\n"
            "3. 看到題目時，先判斷它是在考名詞定義、排列方式，還是在考同類項合併與直式加減。\n"
            "4. 舊資料裡 `多項式加減` 那棵 root 比較寬，這次先把它掛回第二個主題下面。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "polynomial-terminology",
                "title": "多項式的基本名詞",
                "pageStart": 9,
                "pageEnd": 9,
                "mainThemeId": "j3-1-2-main-theme-polynomial-terminology",
                "wrapperId": "j3-1-2-main-theme-polynomial-terminology-core",
                "summary": "整理項、常數項、一元與多元多項式，以及次數的基本語言。",
                "rows": [
                    ["被加減號分開的每一塊都叫做項", "而且要連同前面的正負號一起看。"],
                    ["只含數字、不含文字的項叫常數項", "像 \\(-5\\)、\\(12\\) 都是常數項。"],
                    ["一元多項式只含一種文字", "多元多項式則含兩種以上文字。"],
                    ["一元多項式的次數看最高指數", "例如 \\(3x^4-2x+1\\) 的次數是 \\(4\\)。"],
                    ["多元多項式某一項的次數看指數總和", "整個多項式的次數再取最高者。"],
                ],
                "branchIds": [
                    "polynomial-terminology-junior",
                    "constant-vs-zero-degree-polynomial",
                    "zero-polynomial-definition",
                    "j3-1-2-poly-terms-degree",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "standard-form-and-like-terms",
                "title": "升冪、降冪與同類項合併",
                "pageStart": 10,
                "pageEnd": 10,
                "mainThemeId": "j3-1-2-main-theme-standard-form-and-like-terms",
                "wrapperId": "j3-1-2-main-theme-standard-form-and-like-terms-core",
                "summary": "整理升冪降冪、同類項條件，以及多項式加減時的去括號與直式。",
                "rows": [
                    ["升冪排列依次數由小到大排", "常數項通常放前面；降冪則相反。"],
                    ["同類項要文字部分和次數都完全相同", "像 \\(3x^2\\) 和 \\(5x^2\\) 才能合併。"],
                    ["常數項彼此也算同類項", "所以也可以互相合併。"],
                    ["多項式加減只能合併同類項", "不同類項不能硬湊在一起。"],
                    ["去括號和直式加減都要先對齊同類項", "這樣符號比較不容易掉。"],
                ],
                "branchIds": [
                    "polynomial-add-subtract-junior",
                    "like-terms-combine-junior",
                    "polynomial-subtraction-sign-distribution",
                    "polynomial-add-subtract-vertical-alignment",
                    "polynomial-example-3a2b-4b2c",
                    "j3-1-2-like-terms",
                    "j3-1-2-remove-parentheses",
                    "j3-1-2-add-sub-vertical",
                    "j3-1-2-standard-form",
                ],
            },
        ],
    },
    {
        "chapterCode": "j3-1-3",
        "groupName": "國中・國二上・多項式的乘除",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二上",
            "chapter": "乘法公式與多項式",
            "section": "多項式的乘除",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 3,
        },
        "rootId": "junior-polynomial-mul-div-main-j313",
        "rootTitle": "多項式的乘除",
        "rootManualOrder": 1313,
        "paragraphEditable": (
            "1. 這章正式改以兩個主題當主軸：多項式乘法、多項式除法與驗算。\n"
            "2. 這章最重要的是把分配律、同類項整理、降冪排式與缺項補 \\(0\\) 連在一起看，不要把乘法和除法當成毫不相干的兩塊。\n"
            "3. 看到題目時，先判斷它是在考展開乘法，還是在考長除法與驗算，流程會清楚很多。\n"
            "4. 舊資料裡 `多項式乘除法` root 內容混合，這次已把乘法和除法分開掛到兩個主題下。"
        ),
        "topics": [
            {
                "topicNumber": 1,
                "slug": "polynomial-multiplication",
                "title": "多項式乘法",
                "pageStart": 11,
                "pageEnd": 11,
                "mainThemeId": "j3-1-3-main-theme-polynomial-multiplication",
                "wrapperId": "j3-1-3-main-theme-polynomial-multiplication-core",
                "summary": "整理單項式乘多項式、多項式乘多項式與直式乘法。",
                "rows": [
                    ["單項式乘多項式其實就是分配律", "單項式要乘到多項式中的每一項。"],
                    ["多項式乘多項式時每一項都要乘到", "不能漏項，乘完還要合併同類項。"],
                    ["乘完通常要依次數排序", "這樣結果比較清楚，也方便後續檢查。"],
                    ["直式乘法適合項數較多的題目", "但同類項是否對齊仍然很重要。"],
                    ["分離係數法只是省略寫法", "如果缺項，就要補上 \\(0\\) 的位置。"],
                ],
                "branchIds": [
                    "polynomial-operation-junior",
                    "quadratic-times-quadratic-main",
                    "distributive-like-terms-mul",
                    "j3-1-3-distributive-mul",
                    "j3-1-3-vertical-mul",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "polynomial-division-and-checking",
                "title": "多項式除法與驗算",
                "pageStart": 12,
                "pageEnd": 12,
                "mainThemeId": "j3-1-3-main-theme-polynomial-division-and-checking",
                "wrapperId": "j3-1-3-main-theme-polynomial-division-and-checking-core",
                "summary": "整理多項式除法、餘式條件與驗算流程。",
                "rows": [
                    ["多項式除法和整數除法的結構一樣", "也就是被除式 \\(=\\) 除式 \\(\\times\\) 商式 \\(+\\) 餘式。"],
                    ["餘式的次數一定小於除式的次數", "這是判斷有沒有除對的重要條件。"],
                    ["做長除法前要先排成降冪", "若缺項，要先補 \\(0\\) 再開始算。"],
                    ["算完最好做驗算", "把除式、商式、餘式乘加回去，看是否回到原式。"],
                    ["除法題最常錯在缺項與符號", "所以每一步都要對齊次數與正負號。"],
                ],
                "branchIds": [
                    "polynomial-mul-div-junior",
                    "monomial-divide-monomial",
                    "polynomial-divide-monomial",
                    "cubic-divide-linear",
                    "cubic-divide-quadratic",
                    "j3-1-3-long-division",
                    "j3-1-3-division-check",
                    "j3-1-3-mixed-operation",
                    "j3-1-3-sign-missing-term",
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

