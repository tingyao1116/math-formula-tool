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
SOURCE_PDF = ROOT / "exports" / "s3-source" / "s3-readable-paged.pdf"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "third-volume-topic-pdfs.json"

TZ = timezone(timedelta(hours=8))
SOURCE_REF = "高二上數A全重點_易讀版分頁版.docx（主題整理匯入）"

TOPIC_PLAN = [
    {
        "chapterCode": "s3-2-1",
        "groupName": "高中・高二上・指數函數",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "上學期",
            "gradeLabel": "高二上",
            "chapter": "指數函數",
            "section": "指數函數",
            "domain": "函數圖形",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 1,
            "chapterOrder": 5,
        },
        "rootId": "senior-exponential-function-main-s321",
        "paragraphEditable": (
            "1. 這章正式改成三個主題主軸：指數函數的圖形、指數方程式、指數不等式。\n\n"
            "2. 看到題目時，先判斷是在看圖形與單調性、在解方程式，還是在整理不等式範圍。\n\n"
            "3. 這章建議先把圖形和底數大小帶來的單調性看穩，再往後接方程式代換與不等式方向。\n\n"
            "4. 這章最容易錯的是把 \\(a>1\\) 和 \\(0<a<1\\) 的方向混掉，或代換後忘了 \\(t>0\\)、\\(t\\ge 2\\) 這些限制。"
        ),
        "paragraphOriginal": "先把圖形和單調性看穩，再往下接指數方程式與不等式，整章會順很多。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "exponential-function-graph",
                "title": "指數函數的圖形",
                "page": 2,
                "mainThemeId": "s3-2-1-main-theme-exponential-function-graph",
                "wrapperId": "s3-2-1-exponential-function-graph-core",
                "summary": "整理指數函數的定義、圖形、單調性、對稱與平移，先把底數不同造成的變化看清楚。",
                "rows": [
                    ["指數函數的定義", "設 \\(a>0\\)、\\(a\\neq 1\\)，稱 \\(f(x)=a^x\\) 為以 \\(a\\) 為底的指數函數。"],
                    ["通過固定點與漸近線", "圖形都經過 \\((0,1)\\)，且 \\(x\\) 軸是漸近線。"],
                    ["圖形永遠在 \\(x\\) 軸上方", "任意實數 \\(x\\) 都有 \\(a^x>0\\)，所以圖形不會碰到 \\(x\\) 軸。"],
                    ["單調性看底數", "\\(a>1\\) 時嚴格遞增，\\(0<a<1\\) 時嚴格遞減。"],
                    ["水平線法", "每一條 \\(x\\) 軸上方的水平線都只和圖形交一次，所以 \\(a^\\alpha=a^\\beta\\Rightarrow\\alpha=\\beta\\)。"],
                    ["圖形對稱與平移", "\\(y=(1/a)^x=a^{-x}\\) 與 \\(y=a^x\\) 對稱於 \\(y\\) 軸，平移看 \\(f(x-h)\\)、\\(f(x)+k\\)。"],
                    ["解題提醒", "先分清楚底數在 \\(a>1\\) 還是 \\(0<a<1\\)，後面的比較大小和不等式方向才不會反。"],
                ],
                "branchIds": [
                    "s3-2-1-exponential-function-core",
                    "senior-exponential-graph-properties-s321",
                    "senior-exponent-laws-overview-s321",
                    "senior-exponential-growth-decay-model-s321",
                    "senior-compound-interest-exponential-s321",
                    "senior-exponential-horizontal-line-test-s321",
                    "senior-exponential-ratio-growth-interpretation-s321",
                    "senior-exponential-linearization-s321",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "exponential-equation",
                "title": "指數方程式",
                "page": 3,
                "mainThemeId": "s3-2-1-main-theme-exponential-equation",
                "wrapperId": "s3-2-1-exponential-equation-core",
                "summary": "整理指數方程式的同底化、代換法與根數判斷，先把 \\(t=a^x\\) 類型看熟。",
                "rows": [
                    ["同底化先比指數", "若 \\(a^x=a^y\\) 且 \\(a>0,a\\neq1\\)，則 \\(x=y\\)。"],
                    ["二次型代換", "遇到 \\(pa^{2x}+qa^x+r=0\\) 時，先令 \\(t=a^x\\) 且 \\(t>0\\)。"],
                    ["先解 \\(t\\) 再回代", "先把方程式化成二次式求 \\(t\\)，再回到 \\(a^x=t\\) 解 \\(x\\)。"],
                    ["對稱型代換", "若出現 \\(a^x+a^{-x}\\)，可令 \\(t=a^x+a^{-x}\\)，且 \\(t\\ge 2\\)。"],
                    ["圖形也能看根數", "若題目在問實根個數，可改看兩個函數圖形的交點數。"],
                    ["驗條件不能省", "代換後記得保留 \\(t>0\\) 或 \\(t\\ge2\\) 的限制，不要把不合條件的解帶回來。"],
                ],
                "branchIds": [
                    "senior-exponential-equations-inequalities-s321",
                    "senior-exponential-substitution-techniques-s321",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "exponential-inequality",
                "title": "指數不等式",
                "page": 4,
                "mainThemeId": "s3-2-1-main-theme-exponential-inequality",
                "wrapperId": "s3-2-1-exponential-inequality-core",
                "summary": "整理指數不等式的方向判斷、代換法與極值思路，重點是區間和條件一起看。",
                "rows": [
                    ["單調性決定方向", "\\(a>1\\) 時指數函數遞增，\\(0<a<1\\) 時遞減，所以換成同底後不等號方向不同。"],
                    ["二次型不等式代換", "\\(pa^{2x}+qa^x+r>0\\) 先令 \\(t=a^x>0\\)，再在 \\(t\\) 上解不等式。"],
                    ["先解 \\(t\\) 範圍再回代", "先求 \\(t\\) 的區間，再利用指數函數的單調性還原成 \\(x\\) 的區間。"],
                    ["極值常先改成二次函數", "\\(f(x)=pa^{2x}+qa^x+r\\) 常令 \\(t=a^x>0\\) 轉成 \\(g(t)\\) 來求極值。"],
                    ["對稱型極值看 \\(t\\ge2\\)", "若題目出現 \\(a^x+a^{-x}\\)，可令 \\(t=a^x+a^{-x}\\ge2\\) 再處理。"],
                    ["解題提醒", "指數不等式不是只求一個數，最後一定要把答案寫成區間並回頭檢查條件。"],
                ],
                "branchIds": [
                    "senior-exponential-base-comparison-s321",
                ],
            },
        ],
    },
    {
        "chapterCode": "s3-2-2",
        "groupName": "高中・高二上・對數",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "上學期",
            "gradeLabel": "高二上",
            "chapter": "對數",
            "section": "對數",
            "domain": "函數圖形",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 1,
            "chapterOrder": 6,
        },
        "rootId": "senior-logarithm-main-s322",
        "paragraphEditable": (
            "1. 這章正式改成一個主題主軸：對數律。\n\n"
            "2. 看到題目時，先想能不能先換成同底、同形式，再決定要化簡、估位數，還是回到指數形式。\n\n"
            "3. 這章建議先把定義、真數條件和四則公式看穩，再往下接換底、連鎖和應用。\n\n"
            "4. 這章最容易錯的是底數條件沒檢查，或把 \\(\\log(ab)\\) 誤寫成 \\(\\log a\\log b\\)。"
        ),
        "paragraphOriginal": "先把對數和指數互換、真數條件與運算律整理清楚，後面的換底和應用才會穩。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "logarithm-laws",
                "title": "對數律",
                "page": 6,
                "mainThemeId": "s3-2-2-main-theme-logarithm-laws",
                "wrapperId": "s3-2-2-logarithm-laws-core",
                "summary": "整理對數的定義、基本值、運算律、換底與常見應用，先把指數與對數互換看熟。",
                "rows": [
                    ["對數的定義", "\\(a>0,a\\neq1,b>0\\) 且 \\(a^x=b\\) 時，記 \\(\\log_a b=x\\)。"],
                    ["指數與對數互換", "\\(a^x=b\\iff \\log_a b=x\\)，兩種寫法描述的是同一個關係。"],
                    ["基本值", "\\(\\log_a 1=0\\)、\\(\\log_a a=1\\)、\\(\\log_a a^x=x\\)、\\(a^{\\log_a b}=b\\)。"],
                    ["乘法與除法", "\\(\\log_a(rs)=\\log_a r+\\log_a s\\)、\\(\\log_a(r/s)=\\log_a r-\\log_a s\\)。"],
                    ["次方與換底", "\\(\\log_a(r^n)=n\\log_a r\\)、\\(\\log_a r=\\frac{\\log_b r}{\\log_b a}\\)。"],
                    ["互換與連鎖", "\\(\\log_a b\\log_b a=1\\)、\\(\\log_a b\\log_b c\\log_c d=\\log_a d\\)。"],
                    ["解題提醒", "每次動筆前先檢查底數和真數條件，不要把 \\(\\log(ab)\\) 誤寫成 \\(\\log a\\log b\\)。"],
                ],
                "branchIds": [
                    "s3-2-2-logarithm-core",
                ],
            },
        ],
    },
    {
        "chapterCode": "s3-2-3",
        "groupName": "高中・高二上・對數函數",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "上學期",
            "gradeLabel": "高二上",
            "chapter": "對數函數",
            "section": "對數函數",
            "domain": "函數圖形",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 1,
            "chapterOrder": 7,
        },
        "rootId": "senior-logarithmic-function-main-s323",
        "paragraphEditable": (
            "1. 這章正式改成四個主題主軸：對數函數及其圖形、對數方程式、對數不等式、反函數。\n\n"
            "2. 看到題目時，先判斷是在看圖形與反函數、在解方程式，還是在整理不等式條件。\n\n"
            "3. 這章建議先把圖形、單調性與定義域看穩，再往後接方程式與不等式，最後補反函數。\n\n"
            "4. 這章最容易錯的是真數條件沒檢查、底數大小造成方向相反，或解完後忘了驗算。"
        ),
        "paragraphOriginal": "先把對數函數圖形和定義域看穩，再往下接方程式、不等式和反函數，整章會比較清楚。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "logarithmic-function-graph",
                "title": "對數函數及其圖形",
                "page": 8,
                "mainThemeId": "s3-2-3-main-theme-logarithmic-function-graph",
                "wrapperId": "s3-2-3-logarithmic-function-graph-core",
                "summary": "整理對數函數的定義、圖形、單調性與變換，先把圖形和指數函數的對稱關係看懂。",
                "rows": [
                    ["對數函數的定義", "\\(a>0,a\\neq1,x>0\\) 時，\\(f(x)=\\log_a x\\)。"],
                    ["定義域和值域", "定義域是 \\(x>0\\)，圖形都在 \\(y\\) 軸右側，值域是全部實數。"],
                    ["通過固定點與漸近線", "圖形通過 \\((1,0)\\)，且 \\(y\\) 軸是漸近線。"],
                    ["單調性看底數", "\\(a>1\\) 時嚴格遞增，\\(0<a<1\\) 時嚴格遞減。"],
                    ["和指數函數互為反函數", "\\(y=\\log_a x\\) 與 \\(y=a^x\\) 對稱於 \\(y=x\\)。"],
                    ["圖形變換", "看 \\(f(-x)\\)、\\(-f(x)\\)、\\(f(x-h)\\)、\\(f(x)+k\\) 來判斷對稱和平移。"],
                    ["解題提醒", "先看真數是否大於 0，再談圖形、方程式或不等式。"],
                ],
                "branchIds": [
                    "s3-2-3-log-function-graph-core",
                    "senior-logarithmic-function-graph-properties-s323",
                    "senior-logarithmic-function-domain-range-s323",
                    "senior-logarithmic-function-transformations-s323",
                    "senior-logarithmic-function-comparison-s323",
                    "senior-logarithmic-function-applications-s323",
                    "senior-logarithmic-function-compound-transform-s323",
                    "senior-logarithmic-function-concavity-mean-inequality-s323",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "logarithmic-equation",
                "title": "對數方程式",
                "page": 9,
                "mainThemeId": "s3-2-3-main-theme-logarithmic-equation",
                "wrapperId": "s3-2-3-logarithmic-equation-core",
                "summary": "整理對數方程式的同底化、代換法與驗真數，先把 \\(\\log_a f(x)=\\log_a g(x)\\) 這類型看熟。",
                "rows": [
                    ["同底對數可直接去對數符號", "\\(\\log_a f(x)=\\log_a g(x)\\) 時，先化成 \\(f(x)=g(x)\\)。"],
                    ["真數都要大於 0", "求出代數解後，要再驗所有真數都為正。"],
                    ["二次型代換", "遇到 \\(p(\\log_a x)^2+q\\log_a x+r=0\\) 時，先令 \\(t=\\log_a x\\)。"],
                    ["先解 \\(t\\) 再回代 \\(x\\)", "由 \\(\\log_a x=t\\) 得 \\(x=a^t\\)，再回到原題檢查。"],
                    ["圖形交點也能看根數", "若題目在問實根個數，可改看對數圖形和另一個函數的交點數。"],
                    ["解題提醒", "對數方程最常錯在忘記驗真數條件。"],
                ],
                "branchIds": [
                    "senior-logarithmic-equations-inequalities-s323",
                    "senior-logarithmic-function-intersection-root-count-s323",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "logarithmic-inequality",
                "title": "對數不等式",
                "page": 10,
                "mainThemeId": "s3-2-3-main-theme-logarithmic-inequality",
                "wrapperId": "s3-2-3-logarithmic-inequality-core",
                "summary": "整理對數不等式的方向判斷、真數條件與代換法，重點是把區間和條件一起寫完整。",
                "rows": [
                    ["底數大小先判斷", "\\(a>1\\) 時 \\(\\log_a f(x)>\\log_a g(x)\\) 等價於 \\(f(x)>g(x)\\)；\\(0<a<1\\) 時方向相反。"],
                    ["真數條件先立好", "不論哪一種底數，都要先保留 \\(f(x)>0\\)、\\(g(x)>0\\)。"],
                    ["二次型不等式可代換", "\\(p(\\log_a x)^2+q\\log_a x+r>0\\) 可令 \\(t=\\log_a x\\) 再求範圍。"],
                    ["先解 \\(t\\) 區間再回到 \\(x\\)", "先在 \\(t\\) 上解不等式，再用 \\(\\log_a x=t\\) 還原成 \\(x\\) 的區間。"],
                    ["圖解法可以幫忙判斷範圍", "對數函數的不等式常可改看圖形高低，再和真數條件取交集。"],
                    ["解題提醒", "對數不等式不是只有方向，真數條件和區間交集一定要一起寫。"],
                ],
                "branchIds": [
                    "senior-logarithmic-function-inequality-graph-s323",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "inverse-function",
                "title": "反函數",
                "page": 11,
                "mainThemeId": "s3-2-3-main-theme-inverse-function",
                "wrapperId": "s3-2-3-inverse-function-core",
                "summary": "整理反函數的定義、圖形對稱與求法，先把定義域和值域交換的觀念看清楚。",
                "rows": [
                    ["反函數的意思", "若 \\(g(f(x))=x\\) 且 \\(f(g(y))=y\\)，則 \\(f\\) 與 \\(g\\) 互為反函數。"],
                    ["記號", "\\(f\\) 的反函數記作 \\(f^{-1}(x)\\)。"],
                    ["定義域和值域會交換", "原函數的定義域是反函數的值域，原函數的值域是反函數的定義域。"],
                    ["圖形對稱於 \\(y=x\\)", "這是所有反函數最重要的圖形特徵。"],
                    ["求反函數步驟", "先令 \\(y=f(x)\\)，交換 \\(x,y\\)，再整理成 \\(y=\\) 某式。"],
                    ["不是每個函數都有反函數", "要先是一對一函數，才能反推出唯一的輸入值。"],
                    ["解題提醒", "最後要把反函數的新定義域寫清楚，因為它來自原函數的值域。"],
                ],
                "branchIds": [
                    "senior-logarithmic-function-reflection-map-s323",
                    "senior-logarithmic-function-inverse-domain-s323",
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
        "tags": [root.get("chapterCode", root.get("chapter_code", "")), "主題", title],
        "usage": [summary],
        "examples": ["先看這一層主題整理，再往下展開原本的分支內容。"],
        "tips": ["如果題目太雜，先判斷它屬於哪個主題，再決定往哪組分支看。"],
        "notes": ["這一層是固定主軸，之後章節大綱和主題頁都會先看這裡。"],
        "mistakes": ["不要把章節根節點和主題層當成同一層。"],
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "chapter_code": root.get("chapterCode", root.get("chapter_code", "")),
        "chapterCode": root.get("chapterCode", root.get("chapter_code", "")),
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
        "tags": [root.get("chapterCode", root.get("chapter_code", "")), title, "重點整理"],
        "usage": [summary],
        "examples": [],
        "tips": ["先看主題整理，再往下接既有分支。"],
        "notes": [f"來源：{SOURCE_REF}"],
        "mistakes": ["不要跳過主題整理就直接往下看分支。"],
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "chapter_code": root.get("chapterCode", root.get("chapter_code", "")),
        "chapterCode": root.get("chapterCode", root.get("chapter_code", "")),
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


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    chapter_overview_db = load_json(CHAPTER_OVERVIEW_DB)
    topics = formula_db.get("topics", [])
    main_topic_by_id = main_topic_db.setdefault("byId", {})
    ensure_dir(PDF_EXPORT_DIR)
    reader = PdfReader(str(SOURCE_PDF))

    manifest_topics: list[dict] = []

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

            manifest_topics.append(
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

    PDF_MANIFEST.write_text(
        json.dumps(
            {
                "sourcePdf": str(SOURCE_PDF.resolve()),
                "count": len(manifest_topics),
                "topics": manifest_topics,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print("Updated chapters:", ", ".join(plan["chapterCode"] for plan in TOPIC_PLAN))
    print("Generated PDFs:", len(manifest_topics))


if __name__ == "__main__":
    main()

