from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "junior-third-semester-topic-pdfs.json"
SOURCE_PDF = ROOT / "exports" / "j2-first-volume-outline" / "國二上全重點_易讀版分頁版_Word公式版.pdf"
SOURCE_REF = "國二上全重點_易讀版分頁版.md"
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


PLAN = [
    {
        "chapterCode": "j3-4-1",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二冊",
            "chapter": "一元二次方程式",
            "section": "一元二次方程式",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 10,
        },
        "rootId": "junior-quadratic-equation-main-j341",
        "rootTitle": "一元二次方程式",
        "rootManualOrder": 1341,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "quadratic-equation-and-roots",
                "title": "一元二次方程式與根",
                "summary": "先分清楚二次式和二次方程式，再理解什麼叫根，以及根還要不要回頭檢查題意。",
                "pageStart": 35,
                "pageEnd": 35,
                "mainThemeId": "j3-4-1-main-theme-quadratic-equation-and-roots",
                "wrapperId": "j3-4-1-main-theme-quadratic-equation-and-roots-core",
                "rows": [
                    ["二次式和二次方程式不同", "\\(x^2+3x+2\\) 是一元二次式，但 \\(x^2+3x+2=0\\) 才是一元二次方程式。"],
                    ["標準形式", "一元二次方程式的標準形式是 \\(ax^2+bx+c=0\\)，其中 \\(a\\ne 0\\)。"],
                    ["根的意義", "若把 \\(x=x_0\\) 代入後左右相等，則 \\(x_0\\) 是它的根。"],
                    ["根的數量", "一元二次方程式最多有兩個實根，也可能兩根相同，或沒有實根。"],
                    ["最後還要檢查題意", "若題目有額外限制，例如 \\(x>0\\) 或長度不能為負，最後要回頭檢查。"],
                ],
                "branchIds": [
                    "j3-4-1-root-check",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "standard-form-and-coefficients",
                "title": "整理成標準式與係數判讀",
                "summary": "後面所有方法都建立在標準式整理正確，所以右邊是 0、符號有沒有看對非常重要。",
                "pageStart": 36,
                "pageEnd": 36,
                "mainThemeId": "j3-4-1-main-theme-standard-form-and-coefficients",
                "wrapperId": "j3-4-1-main-theme-standard-form-and-coefficients-core",
                "rows": [
                    ["標準式右邊一定要是 0", "先整理成 \\(ax^2+bx+c=0\\)，後面的方法才能直接使用。"],
                    ["係數要連同正負號看", "在 \\(x^2-6x-2=0\\) 中，\\(b=-6\\)、\\(c=-2\\)。"],
                    ["首項係數可先變正", "若首項係數是負的，可把整式同乘 \\(-1\\)，通常比較順。"],
                    ["整理錯後面會全錯", "標準式一旦整理錯，因式分解、判別式、公式法都會跟著錯。"],
                    ["先整理再選方法", "不要還沒整理成標準式就急著套解法。"],
                ],
                "branchIds": [
                    "j3-4-1-standard-form",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "zero-product-and-factorization",
                "title": "零乘積法與因式分解法",
                "summary": "能分解時，先用零乘積法通常最快；關鍵是先整理成標準式，再把左邊因式分解。",
                "pageStart": 37,
                "pageEnd": 37,
                "mainThemeId": "j3-4-1-main-theme-zero-product-and-factorization",
                "wrapperId": "j3-4-1-main-theme-zero-product-and-factorization-core",
                "rows": [
                    ["零乘積法核心", "若 \\(AB=0\\)，則 \\(A=0\\) 或 \\(B=0\\)。"],
                    ["標準流程", "先整理成標準式，再把左邊因式分解，最後分別解兩個一次方程式。"],
                    ["分解錯會整組錯", "若因式分解做錯，根通常會整組錯掉，所以最好展開檢查。"],
                    ["能分解就先分解", "若看得出來能整齊分解，通常比公式法更快也更直觀。"],
                    ["看見乘積等於 0 就要想到它", "這是最常見也最實用的一條路。"],
                ],
                "branchIds": [
                    "quadratic-factor-solving-junior",
                    "quadratic-zero-product-principle",
                    "quadratic-expand-then-solve",
                    "j3-4-1-factorization-solve",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "special-case-c-zero",
                "title": "特殊型一：c = 0 的提公因式解法",
                "summary": "缺常數項時先提公因式，千萬不要直接除以 \\(x\\) 把一個根除掉。",
                "pageStart": 38,
                "pageEnd": 38,
                "mainThemeId": "j3-4-1-main-theme-special-case-c-zero",
                "wrapperId": "j3-4-1-main-theme-special-case-c-zero-core",
                "rows": [
                    ["先提公因式", "若 \\(ax^2+bx=0\\)，可先寫成 \\(x(ax+b)=0\\)。"],
                    ["再用零乘積法", "接著得到 \\(x=0\\) 或 \\(ax+b=0\\)。"],
                    ["不能直接除以 x", "因為那樣會把 \\(x=0\\) 這個根除掉。"],
                    ["看到缺常數項就想到它", "這一型通常最省力，不需要繞到公式法。"],
                    ["最後仍要把一次式解完", "別只看到一個根就停下來。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 5,
                "slug": "special-case-b-zero",
                "title": "特殊型二：b = 0 的平方根法",
                "summary": "缺一次項時先整理成平方等於常數，再判斷是兩根、一個重根，還是實數無解。",
                "pageStart": 39,
                "pageEnd": 39,
                "mainThemeId": "j3-4-1-main-theme-special-case-b-zero",
                "wrapperId": "j3-4-1-main-theme-special-case-b-zero-core",
                "rows": [
                    ["先整理成 \\(x^2=常數\\)", "若方程式是 \\(ax^2+c=0\\)，可整理成 \\(x^2=-\\frac{c}{a}\\)。"],
                    ["正數有兩個實根", "當 \\(-\\frac{c}{a}>0\\) 時，\\(x=\\pm\\sqrt{-\\frac{c}{a}}\\)。"],
                    ["等於 0 是重根", "當 \\(-\\frac{c}{a}=0\\) 時，只有一個重根 \\(x=0\\)。"],
                    ["負數在實數範圍無解", "因為平方不會得到負數。"],
                    ["平方根法也能處理 \\((mx+n)^2=k\\)", "先開平方，再解回一次方程式。"],
                ],
                "branchIds": [
                    "quadratic-square-root-method",
                    "j3-4-1-square-root-method",
                ],
            },
            {
                "topicNumber": 6,
                "slug": "cross-method-solving-general-quadratics",
                "title": "十字交乘解一般二次式",
                "summary": "能整齊分解的二次方程式，十字交乘通常最快，但中間項要真的核對過。",
                "pageStart": 40,
                "pageEnd": 40,
                "mainThemeId": "j3-4-1-main-theme-cross-method-solving-general-quadratics",
                "wrapperId": "j3-4-1-main-theme-cross-method-solving-general-quadratics-core",
                "rows": [
                    ["首項係數為 1 時", "對 \\(x^2+bx+c=0\\)，要找兩數使和為 \\(b\\)、積為 \\(c\\)。"],
                    ["一般型還要看交叉和", "對 \\(ax^2+bx+c=0\\)，不能只看首尾項，交叉和也要真的等於中間項。"],
                    ["分解後回到兩個一次式", "若分解成 \\((2x+1)(x+3)=0\\)，就分別解兩個一次方程式。"],
                    ["最後展開驗證", "算完最好再展開一次，避免只因看起來像就直接判定。"],
                    ["先確認能不能整齊分解", "不能分解時，就要轉去配方法或公式法。"],
                ],
                "branchIds": [
                    "quadratic-cross-method-solving",
                    "quadratic-substitute-same-term-ab",
                    "quadratic-solve-ratio",
                ],
            },
        ],
    },
    {
        "chapterCode": "j3-4-2",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二冊",
            "chapter": "一元二次方程式",
            "section": "配方法與公式解",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 11,
        },
        "rootId": "junior-quadratic-completing-square-main-j342",
        "rootTitle": "配方法與公式解",
        "rootManualOrder": 1342,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "completing-square-core",
                "title": "配方法核心：補成完全平方式",
                "summary": "配方法最核心的不是步驟背法，而是知道補的是哪一個平方。",
                "pageStart": 41,
                "pageEnd": 41,
                "mainThemeId": "j3-4-2-main-theme-completing-square-core",
                "wrapperId": "j3-4-2-main-theme-completing-square-core-core",
                "rows": [
                    ["核心目標", "把二次式補成 \\((x+m)^2\\) 的形式。"],
                    ["由一次項決定要補什麼", "因為 \\((x+m)^2=x^2+2mx+m^2\\)，若一次項係數是 \\(p\\)，就有 \\(2m=p\\)。"],
                    ["補上的常數", "需要補上的常數是 \\(\\left(\\frac{p}{2}\\right)^2\\)。"],
                    ["首項係數不是 1 要先處理", "若 \\(x^2\\) 的係數不是 1，要先整體除以 \\(a\\)，否則不能直接補平方。"],
                    ["等號兩邊要同步變化", "補平方時，等號兩邊都要做同樣的調整。"],
                ],
                "branchIds": [
                    "quadratic-completing-square-formula-junior",
                    "quadratic-complete-square-leading-one",
                    "quadratic-complete-perfect-square",
                    "j3-4-2-completing-square-main",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "completing-square-solving",
                "title": "配方法解一元二次方程式",
                "summary": "不能分解時，配方法雖然步驟多，但很穩定，也能幫你看懂公式法從哪裡來。",
                "pageStart": 42,
                "pageEnd": 42,
                "mainThemeId": "j3-4-2-main-theme-completing-square-solving",
                "wrapperId": "j3-4-2-main-theme-completing-square-solving-core",
                "rows": [
                    ["先整理成標準式", "必要時再把 \\(x^2\\) 的係數化成 1。"],
                    ["常數移到右邊", "左邊補成完全平方式，結構會比較清楚。"],
                    ["配成平方後再開平方", "最後就會回到一次方程式。"],
                    ["步驟多但很穩", "不容易分解的題目，用配方法通常比亂猜更穩。"],
                    ["它也是公式法來源", "理解配方法後，公式法就不只是死背。"],
                ],
                "branchIds": [
                    "quadratic-completing-square-full",
                    "quadratic-completing-square-vertex-form",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "quadratic-formula-and-discriminant",
                "title": "公式解與判別式",
                "summary": "公式法是通用解法，判別式則是在告訴你根的型態和個數。",
                "pageStart": 43,
                "pageEnd": 43,
                "mainThemeId": "j3-4-2-main-theme-quadratic-formula-and-discriminant",
                "wrapperId": "j3-4-2-main-theme-quadratic-formula-and-discriminant-core",
                "rows": [
                    ["公式解", "對任意一元二次方程式 \\(ax^2+bx+c=0\\)，公式解是 \\(x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\)。"],
                    ["判別式", "記為 \\(D=b^2-4ac\\)，它決定根的型態。"],
                    ["\\(D>0\\)", "有兩個相異實根。"],
                    ["\\(D=0\\)", "有兩個相同的實根，也叫重根。"],
                    ["\\(D<0\\)", "在實數範圍內沒有根。"],
                ],
                "branchIds": [
                    "quadratic-formula-discriminant-junior",
                    "quadratic-double-root-perfect-square",
                    "j3-4-1-double-root-case",
                    "j3-4-2-quadratic-formula",
                    "j3-4-2-discriminant",
                    "j3-4-2-parameter-equation",
                    "j3-4-2-method-selection",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "roots-and-coefficients",
                "title": "根與係數、已知兩根求方程式",
                "summary": "這一頁是把兩根和、兩根積和方程式係數直接連起來，之後還原方程式會很快。",
                "pageStart": 44,
                "pageEnd": 44,
                "mainThemeId": "j3-4-2-main-theme-roots-and-coefficients",
                "wrapperId": "j3-4-2-main-theme-roots-and-coefficients-core",
                "rows": [
                    ["根與係數關係", "若方程式是 \\(ax^2+bx+c=0\\)，兩根為 \\(\\alpha,\\beta\\)，則 \\(\\alpha+\\beta=-\\frac{b}{a}\\)、\\(\\alpha\\beta=\\frac{c}{a}\\)。"],
                    ["首項係數為 1 更簡潔", "像 \\(x^2+px+q=0\\) 的兩根和為 \\(-p\\)，積為 \\(q\\)。"],
                    ["已知兩根可先寫因式", "若已知兩根是 \\(\\alpha,\\beta\\)，可先寫成 \\((x-\\alpha)(x-\\beta)=0\\)。"],
                    ["展開後就回到標準式", "\\(x^2-(\\alpha+\\beta)x+\\alpha\\beta=0\\)。"],
                    ["首項係數不是 1 時", "可再把整個式子乘上需要的係數。"],
                ],
                "branchIds": [
                    "quadratic-vieta-root-relations-junior",
                    "quadratic-irrational-roots-restore-equation",
                    "quadratic-restore-from-roots",
                    "j3-4-1-vieta-basic",
                ],
            },
        ],
    },
    {
        "chapterCode": "j3-4-3",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二冊",
            "chapter": "一元二次方程式",
            "section": "一元二次方程式應用問題",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 12,
        },
        "rootId": "junior-quadratic-application-main-j343",
        "rootTitle": "一元二次方程式應用問題",
        "rootManualOrder": 1343,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "fractional-equations-and-extraneous-roots",
                "title": "分式方程式與增根檢查",
                "summary": "這一頁最重要的不是去分母，而是先列限制條件，最後一定要檢查增根。",
                "pageStart": 45,
                "pageEnd": 45,
                "mainThemeId": "j3-4-3-main-theme-fractional-equations-and-extraneous-roots",
                "wrapperId": "j3-4-3-main-theme-fractional-equations-and-extraneous-roots-core",
                "rows": [
                    ["先列限制條件", "只要分母含未知數，就一定要先列限制條件，因為分母不能為 0。"],
                    ["去分母要同乘最小公倍式", "不能只乘其中一部分，要整個方程式兩邊一起乘。"],
                    ["去分母後再用熟悉方法解", "常會化成一元一次或一元二次方程式。"],
                    ["最後一定要代回檢查", "若會讓原分母為 0，那就是增根。"],
                    ["很多錯不是算錯", "而是忘了限制條件與增根檢查。"],
                ],
                "branchIds": [
                    "j3-4-3-fractional-equation",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "modeling-and-application-checking",
                "title": "應用題建模與檢驗",
                "summary": "應用題最核心的是先把未知數設對，再回到原題把不合理的根剔掉。",
                "pageStart": 46,
                "pageEnd": 46,
                "mainThemeId": "j3-4-3-main-theme-modeling-and-application-checking",
                "wrapperId": "j3-4-3-main-theme-modeling-and-application-checking-core",
                "rows": [
                    ["先選未知數", "通常設最直接、最容易表示其他量的那一個。"],
                    ["其他量都用同一未知數表示", "這樣最後才能列出一個方程式。"],
                    ["常見關鍵字要翻成代數式", "像面積、乘積、連續整數、和差、長寬關係，都要轉成式子。"],
                    ["解出後要回到情境檢查", "像長度、面積、數量通常不能是負數。"],
                    ["兩個根不一定都能用", "要依題意捨去不合理的那一個。"],
                ],
                "branchIds": [
                    "quadratic-applications-junior",
                    "quadratic-application-problems-junior",
                    "quadratic-application-buy-sell",
                    "quadratic-application-area",
                    "quadratic-application-consecutive-numbers",
                    "quadratic-application-geometric-length",
                    "quadratic-application-change-rate",
                    "j3-4-3-word-problem-modeling",
                    "j3-4-3-geometry-area",
                    "j3-4-3-rate-time",
                    "j3-4-3-integer-sequence",
                    "j3-4-3-reasonable-answer",
                ],
            },
        ],
    },
]


def export_manifest_entries(manifest: dict, entries: list[dict]) -> None:
    keep = [
        entry
        for entry in manifest.get("topics", [])
        if entry.get("chapterCode") not in {"j3-4-1", "j3-4-2", "j3-4-3"}
    ]
    keep.extend(entries)
    keep.sort(key=lambda item: (item["chapterCode"], item["topicNumber"]))
    manifest["topics"] = keep
    manifest["count"] = len(keep)


def main() -> None:
    updated_at = now_iso()
    formula_payload = load_json(FORMULA_DB)
    main_topic_payload = load_json(MAIN_TOPIC_DB)
    original_topics = formula_payload.get("topics", [])
    topic_map = {topic["id"]: topic for topic in original_topics}
    main_topic_store = main_topic_payload.setdefault("byId", {})
    manifest = load_json(PDF_MANIFEST)
    reader = PdfReader(str(SOURCE_PDF))
    manifest_entries: list[dict] = []

    for chapter_plan in PLAN:
        meta = dict(chapter_plan["meta"])
        meta["chapterCode"] = chapter_plan["chapterCode"]
        meta["updatedAt"] = updated_at
        upsert_topic(topic_map, build_root(meta, chapter_plan["rootId"], chapter_plan["rootTitle"], chapter_plan["rootManualOrder"]))

        for topic in chapter_plan["topics"]:
            topic["chapterCode"] = chapter_plan["chapterCode"]
            pdf_file = export_topic_pdf(reader, topic)
            manifest_entries.append(
                {
                    "chapterCode": chapter_plan["chapterCode"],
                    "topicNumber": topic["topicNumber"],
                    "slug": topic["slug"],
                    "title": topic["title"],
                    "pageStart": topic["pageStart"],
                    "pageEnd": topic["pageEnd"],
                    "file": pdf_file,
                }
            )
            upsert_topic(topic_map, build_main_theme(meta, topic, chapter_plan["rootId"]))
            upsert_topic(topic_map, build_main_theme_core(meta, topic))
            upsert_main_topic_entry(main_topic_store, topic, updated_at, pdf_file)
            for branch_id in topic["branchIds"]:
                branch = topic_map.get(branch_id)
                if not branch:
                    continue
                branch["parentId"] = topic["wrapperId"]
                branch["chapterCode"] = chapter_plan["chapterCode"]
                branch["chapter_code"] = chapter_plan["chapterCode"]
                branch["chapter"] = meta["chapter"]
                branch["section"] = meta["section"]
                branch["domain"] = meta["domain"]
                branch["domainSub"] = meta["domainSub"]
                branch["modifiedAt"] = updated_at

    export_manifest_entries(manifest, manifest_entries)
    manifest["sourcePdf"] = str(SOURCE_PDF)

    ordered_topics: list[dict] = []
    seen_ids: set[str] = set()
    for topic in original_topics:
        current = topic_map.get(topic["id"])
        if not current:
            continue
        ordered_topics.append(current)
        seen_ids.add(topic["id"])
    next_original_index = len(ordered_topics)
    for topic_id, topic in topic_map.items():
        if topic_id in seen_ids:
            continue
        topic.setdefault("originalIndex", next_original_index)
        next_original_index += 1
        ordered_topics.append(topic)

    formula_payload["topics"] = ordered_topics
    formula_payload.setdefault("meta", {})
    formula_payload["meta"]["updatedAt"] = updated_at
    main_topic_payload.setdefault("meta", {})
    main_topic_payload["meta"]["updatedAt"] = updated_at

    save_json(FORMULA_DB, formula_payload)
    save_json(MAIN_TOPIC_DB, main_topic_payload)
    save_json(PDF_MANIFEST, manifest)
    print("Updated j3-4-1 ~ j3-4-3 main themes.")


if __name__ == "__main__":
    main()

