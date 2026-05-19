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
        "chapterCode": "j1-2-1",
        "groupName": "質因數分解、因數、倍數",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "上學期",
            "gradeLabel": "國一上",
            "chapter": "因數倍數",
            "section": "質因數分解、因數、倍數",
            "domain": "數與量",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 1,
            "chapterOrder": 5,
        },
        "rootId": "junior-factor-multiple-main-j121",
        "rootTitle": "質因數分解、因數、倍數",
        "rootManualOrder": 370,
        "paragraphEditable": (
            "1. 這章正式改以四個主題當主軸：因數、倍數、質數與合數；因數與倍數的生活應用；質因數、整除判別與標準分解式；標準分解式的應用。\n"
            "2. 這章要先把因數、倍數、質數、質因數這些基本詞分清楚，再往後看整除規則和分解式。\n"
            "3. `因數與倍數的生活應用` 先照來源單獨保留，不因為舊分支不足就亂塞到別的章。\n"
            "4. `3、9、11 倍數判斷法` 這個舊 root 這次直接掛回整除判別主題。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的四個主題頁。整理時先抓因數倍數，再往生活應用、整除判別與標準分解式延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "factor-multiple-prime-composite",
                "title": "因數、倍數、質數與合數",
                "pageStart": 18,
                "pageEnd": 18,
                "mainThemeId": "j1-2-1-main-theme-factor-multiple-prime-composite",
                "wrapperId": "j1-2-1-main-theme-factor-multiple-prime-composite-core",
                "summary": "整理因數、倍數、質數、合數與 1 的判斷。",
                "rows": [
                    ["因數與倍數", "若 \\(c=a\\times b\\)，那麼 \\(a\\) 和 \\(b\\) 是 \\(c\\) 的因數，\\(c\\) 是 \\(a\\) 和 \\(b\\) 的倍數。"],
                    ["質數", "質數是大於 1 的整數，而且正因數只有 1 和自己。"],
                    ["合數", "合數是大於 1 的整數，而且除了 1 和自己之外，還有別的正因數。"],
                    ["1 的角色", "1 不是質數，也不是合數。"],
                    ["基本判斷", "判斷一個數是不是質數，本質上就是看它除了 1 和自己以外，還能不能再被別的整數整除。"],
                ],
                "branchIds": [
                    "j1-2-1-factor-multiple-main",
                    "j1-2-1-prime-composite",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "factor-multiple-applications",
                "title": "因數與倍數的生活應用",
                "pageStart": 19,
                "pageEnd": 19,
                "mainThemeId": "j1-2-1-main-theme-factor-multiple-applications",
                "wrapperId": "j1-2-1-main-theme-factor-multiple-applications-core",
                "summary": "整理面積配對、分組、固定間隔與因數倍數的生活情境。",
                "rows": [
                    ["面積問題", "面積固定、長寬都是整數時，就可以用因數配對來找可能的長和寬。"],
                    ["分組或買法", "先找範圍，再數有幾個整數解。"],
                    ["排列問題", "若兩端都有放，則間隔數 = 點數減 1。"],
                    ["讀題提醒", "固定每隔幾公尺放一個物件時，要先分清楚題目在問總長還是個數。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 3,
                "slug": "prime-factorization-divisibility-standard-form",
                "title": "質因數、整除判別與標準分解式",
                "pageStart": 20,
                "pageEnd": 20,
                "mainThemeId": "j1-2-1-main-theme-prime-factorization-divisibility-standard-form",
                "wrapperId": "j1-2-1-main-theme-prime-factorization-divisibility-standard-form-core",
                "summary": "整理質因數、整除判別法、質因數分解與標準分解式。",
                "rows": [
                    ["質因數", "一個整數的因數如果本身是質數，就叫做這個整數的質因數。"],
                    ["質因數分解", "把一個整數拆成只有質數相乘的形式。"],
                    ["標準分解式", "把相同的質因數寫成次方，並依大小順序排好。"],
                    ["整除判別", "像 2、3、5、4、8、9、11 都有各自快速判斷規則。"],
                    ["讀題提醒", "先用整除規則縮小範圍，再決定是否真的去除。"],
                ],
                "branchIds": [
                    "divisibility-rules",
                    "j1-2-1-divisibility-basic",
                    "j1-2-1-divisibility-advanced",
                    "j1-2-1-prime-factorization",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "standard-form-divisor-count-sum",
                "title": "標準分解式的應用：正因數個數與總和",
                "pageStart": 21,
                "pageEnd": 21,
                "mainThemeId": "j1-2-1-main-theme-standard-form-divisor-count-sum",
                "wrapperId": "j1-2-1-main-theme-standard-form-divisor-count-sum-core",
                "summary": "整理用標準分解式求正因數個數與正因數總和。",
                "rows": [
                    ["正因數個數", "若 \\(N=p^a q^b r^c\\)，則正因數個數為 \\((a+1)(b+1)(c+1)\\)。"],
                    ["原因", "每個質因數的次方都可以從 0 一路選到最高次方，選法相乘就是總個數。"],
                    ["正因數總和", "可寫成各質因數等比和的乘積，例如 \\((1+p+p^2+\\cdots+p^a)(1+q+\\cdots+q^b)\\cdots\\)。"],
                    ["讀題提醒", "先把標準分解式寫對，再談個數與總和，不然後面會整串錯。"],
                ],
                "branchIds": [
                    "j1-2-1-divisor-count-sum",
                ],
            },
        ],
    },
    {
        "chapterCode": "j1-2-2",
        "groupName": "公因數、公倍數",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "上學期",
            "gradeLabel": "國一上",
            "chapter": "因數倍數",
            "section": "公因數、公倍數",
            "domain": "數與量",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 1,
            "chapterOrder": 6,
        },
        "rootId": "junior-gcd-lcm-main-j122",
        "rootTitle": "公因數、公倍數",
        "rootManualOrder": 430,
        "paragraphEditable": (
            "1. 這章正式改以四個主題當主軸：公因數與互質、最大公因數的求法與應用、公倍數與最小公倍數、最小公倍數的求法與應用。\n"
            "2. 題目如果在問最多分幾組、最大邊長、最大正方形，先往最大公因數想；如果在問多久同時發生一次，先往最小公倍數想。\n"
            "3. `因數倍數應用題` 這串舊資料這次會以 gcd / lcm 題型為主重新附掛，不再照舊名字硬留在外層。\n"
            "4. 跑環狀跑道這類週期重合題，優先掛最小公倍數，不要混到最大公因數。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的四個主題頁。整理時先抓公因數，再往 gcd / lcm 的求法與應用延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "common-factors-gcd-coprime",
                "title": "公因數、最大公因數與互質",
                "pageStart": 22,
                "pageEnd": 22,
                "mainThemeId": "j1-2-2-main-theme-common-factors-gcd-coprime",
                "wrapperId": "j1-2-2-main-theme-common-factors-gcd-coprime-core",
                "summary": "整理公因數、最大公因數與互質的基本觀念。",
                "rows": [
                    ["公因數", "幾個整數共同擁有的因數，叫做公因數。"],
                    ["最大公因數", "公因數中最大的那個，叫做最大公因數。"],
                    ["互質", "若兩個正整數的最大公因數是 1，就稱這兩數互質。"],
                    ["基本判斷", "兩個相異質數一定互質；互質不代表兩個數都一定是質數。"],
                ],
                "branchIds": [
                    "j1-2-2-gcd-lcm-main",
                    "j1-2-2-gcd-coprime",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "gcd-methods-applications",
                "title": "最大公因數的求法與應用",
                "pageStart": 23,
                "pageEnd": 23,
                "mainThemeId": "j1-2-2-main-theme-gcd-methods-applications",
                "wrapperId": "j1-2-2-main-theme-gcd-methods-applications-core",
                "summary": "整理 gcd 的羅列法、分解法、短除法、輾轉相除法與切割分組應用。",
                "rows": [
                    ["常用求法", "羅列法、質因數分解法、短除法、輾轉相除法。"],
                    ["選法提醒", "數字小可用羅列法；題目已有標準分解式時，直接用分解法最順；兩個大數時輾轉相除法通常最快。"],
                    ["應用情境", "像最多能分幾組、最大的正方形邊長、每盒一樣多而且盒數最多，通常都在找最大公因數。"],
                    ["讀題提醒", "先判斷題目是在求最大公因數還是最小公倍數，不然方法會整個用反。"],
                ],
                "branchIds": [
                    "j1-2-1-factor-multiple-application",
                    "j1-2-2-gcd-methods",
                    "j1-2-2-gcd-application",
                    "factor-application-separate-grouping-drill",
                    "factor-application-mixed-grouping-drill",
                    "factor-road-planting-single-drill",
                    "factor-road-planting-double-drill",
                    "factor-road-keep-position-drill",
                    "factor-rectangle-equal-square-drill",
                    "factor-rectangle-max-square-mixed-drill",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "common-multiples-lcm-properties",
                "title": "公倍數、最小公倍數與性質",
                "pageStart": 24,
                "pageEnd": 24,
                "mainThemeId": "j1-2-2-main-theme-common-multiples-lcm-properties",
                "wrapperId": "j1-2-2-main-theme-common-multiples-lcm-properties-core",
                "summary": "整理公倍數、最小公倍數與 gcd × lcm 的性質。",
                "rows": [
                    ["公倍數", "幾個整數共同擁有的倍數，叫做公倍數。"],
                    ["最小公倍數", "公倍數中最小的那個，叫做最小公倍數。"],
                    ["互質時", "若 \\(a,b\\) 互質，則 \\([a,b]=ab\\)。"],
                    ["倍數關係", "若 \\(a\\) 是 \\(b\\) 的因數，則 \\([a,b]=b\\)。"],
                    ["重要性質", "對正整數 \\(a,b\\) 而言，有 \\((a,b)\\times [a,b]=a\\times b\\)。"],
                ],
                "branchIds": [
                    "j1-2-2-lcm-concept",
                    "j1-2-2-lcm-methods-relation",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "lcm-methods-applications",
                "title": "最小公倍數的求法與應用",
                "pageStart": 25,
                "pageEnd": 25,
                "mainThemeId": "j1-2-2-main-theme-lcm-methods-applications",
                "wrapperId": "j1-2-2-main-theme-lcm-methods-applications-core",
                "summary": "整理 lcm 的羅列法、分解法、短除法與同時發生、餘數題應用。",
                "rows": [
                    ["常用求法", "羅列法、質因數分解法、短除法。"],
                    ["選法提醒", "題目數字小可用羅列法；已有標準分解式時，直接比最高次方最快。"],
                    ["應用情境", "像多久會再同時發生一次、同時是幾個數的倍數、餘數題先移掉同餘餘數，再找最小公倍數。"],
                    ["讀題提醒", "如果題目是在看週期重合或同時出現，通常不是 gcd，而是 lcm。"],
                ],
                "branchIds": [
                    "j1-2-2-lcm-application",
                    "factor-application-circular-track-drill",
                ],
            },
        ],
    },
    {
        "chapterCode": "j1-2-3",
        "groupName": "分數的加減乘除",
        "meta": {
            "stage": "國中",
            "grade": "國一",
            "term": "上學期",
            "gradeLabel": "國一上",
            "chapter": "因數倍數",
            "section": "分數的加減乘除",
            "domain": "數與量",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 1,
            "termOrder": 1,
            "chapterOrder": 7,
        },
        "rootId": "junior-fraction-operations-main-j123",
        "rootTitle": "分數的加減乘除",
        "rootManualOrder": 500,
        "paragraphEditable": (
            "1. 這章正式改以兩個主題當主軸：分數的擴分、約分、最簡分數與通分；分數的加減乘除與應用。\n"
            "2. 這章很多錯誤不是觀念錯，而是步驟順序錯，所以一定先分清楚什麼時候先通分、什麼時候先化假分數、什麼時候先取倒數。\n"
            "3. `分數的加減乘除與應用` 這個主題是跨兩頁的，原稿版要把第 27-28 頁一起收進去。\n"
            "4. 舊的 `分數運算核心概念` 這次先掛到第一個主題，當作整章入口分支。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的兩個主題區塊。整理時先抓擴分約分與通分，再往分數四則與應用延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "fraction-simplify-common-denominator",
                "title": "分數的擴分、約分、最簡分數與通分",
                "pageStart": 26,
                "pageEnd": 26,
                "mainThemeId": "j1-2-3-main-theme-fraction-simplify-common-denominator",
                "wrapperId": "j1-2-3-main-theme-fraction-simplify-common-denominator-core",
                "summary": "整理擴分、約分、最簡分數、通分與分數比大小。",
                "rows": [
                    ["擴分", "分子和分母同乘一個大於 1 的整數，叫做擴分。"],
                    ["約分", "分子和分母同除一個大於 1 的公因數，叫做約分。"],
                    ["最簡分數", "約到分子分母互質時，得到的就是最簡分數。"],
                    ["通分", "不同分母要拿來比較或相加減時，常先通分成同分母。"],
                    ["讀題提醒", "題目要比大小或做加減時，先看分母能不能直接找到最小公倍數。"],
                ],
                "branchIds": [
                    "j1-2-3-fraction-ops-main",
                    "j1-2-3-simplify-expand",
                    "j1-2-3-common-denominator-compare",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "fraction-arithmetic-applications",
                "title": "分數的加減乘除與應用",
                "pageStart": 27,
                "pageEnd": 28,
                "mainThemeId": "j1-2-3-main-theme-fraction-arithmetic-applications",
                "wrapperId": "j1-2-3-main-theme-fraction-arithmetic-applications-core",
                "summary": "整理分數加減乘除、帶分數、繁分數與應用題的步驟順序。",
                "rows": [
                    ["同分母加減", "分母不變，分子相加減。"],
                    ["異分母加減", "先通分，再相加減。"],
                    ["分數乘法", "分子乘分子，分母乘分母。"],
                    ["分數除法", "乘上除數的倒數。"],
                    ["帶分數處理", "帶分數做乘除前，先化成假分數。"],
                    ["讀題提醒", "先通分、先化假分數、先取倒數，這三件事如果順序對了，大多數題目都會穩很多。"],
                ],
                "branchIds": [
                    "j1-2-3-add-sub-fractions",
                    "j1-2-3-mul-div-fractions",
                    "j1-2-3-mixed-complex-fractions",
                    "j1-2-3-fraction-application",
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

