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


def append_manifest_entries(manifest: dict, topics: list[dict]) -> None:
    existing = [entry for entry in manifest.get("topics", []) if entry.get("chapterCode") not in {"j3-2-1", "j3-2-2", "j3-2-3"}]
    existing.extend(topics)
    existing.sort(key=lambda item: (item["chapterCode"], item["topicNumber"]))
    manifest["topics"] = existing
    manifest["count"] = len(existing)


TOPIC_PLAN = [
    {
        "chapterCode": "j3-2-1",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二冊",
            "chapter": "二次方根與畢氏定理",
            "section": "二次方根",
            "domain": "數與量",
            "domainSub": "代數",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 4,
        },
        "rootId": "junior-square-root-main-j321",
        "rootTitle": "二次方根",
        "rootManualOrder": 1321,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "square-root-meaning",
                "title": "平方根與根號的意義",
                "summary": "先分清楚平方根、正平方根和根號記號，這是後面所有根式運算的起點。",
                "pageStart": 14,
                "pageEnd": 14,
                "mainThemeId": "j3-2-1-main-theme-square-root-meaning",
                "wrapperId": "j3-2-1-main-theme-square-root-meaning-core",
                "rows": [
                    ["平方根的定義", "若 \\(x^2=a\\)，則 \\(x\\) 稱為 \\(a\\) 的平方根。"],
                    ["正平方根與根號記號", "當 \\(a>0\\) 時，\\(a\\) 的平方根是 \\(\\pm\\sqrt{a}\\)，而 \\(\\sqrt{a}\\) 只表示正的那一個。"],
                    ["零的平方根", "\\(\\sqrt{0}=0\\)，所以 \\(0\\) 的平方根只有一個。"],
                    ["被開方數限制", "在國中實數範圍中，\\(\\sqrt{x}\\) 的被開方數必須滿足 \\(x\\ge 0\\)。"],
                    ["先分清楚再運算", "看到根號題時，先判斷它是在問平方根、正平方根，還是單純的根號值。"],
                ],
                "branchIds": [
                    "square-root-junior",
                    "square-root-basic-junior",
                    "j3-2-1-square-root-definition",
                    "j3-2-1-root-existence",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "perfect-squares-and-prime-factorization",
                "title": "完全平方數與質因數分解",
                "summary": "看到平方根先判斷能不能整開；不能整開時，再用質因數分解整理成根號形式。",
                "pageStart": 15,
                "pageEnd": 15,
                "mainThemeId": "j3-2-1-main-theme-perfect-squares-and-prime-factorization",
                "wrapperId": "j3-2-1-main-theme-perfect-squares-and-prime-factorization-core",
                "rows": [
                    ["完全平方數", "如果 \\(\\sqrt{a}\\) 是整數，則 \\(a\\) 是完全平方數，例如 \\(1,4,9,16,25\\)。"],
                    ["先看能不能寫成平方", "像 \\(169=13^2\\)，所以 \\(\\sqrt{169}=13\\)。"],
                    ["質因數分解成對", "用質因數分解時，每個質因數都要兩兩成對，才可以完整開平方。"],
                    ["不是完全平方數就保留根號", "若不能整開，就改寫成最簡根號形式，不要硬寫成整數。"],
                    ["分數與小數也能先整理", "像 \\(\\sqrt{\\frac{9}{16}}=\\frac{3}{4}\\)，先把數值整理乾淨再開根號通常更穩。"],
                ],
                "branchIds": [
                    "perfect-square-and-square-root",
                    "j3-2-1-prime-factor-root",
                    "j3-2-1-fractional-root",
                    "long-division-square-root-guest",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "radical-and-absolute-value",
                "title": "根號與絕對值",
                "summary": "最常錯的是把 \\(\\sqrt{a^2}\\) 直接寫成 \\(a\\)；這裡一定要回到絕對值觀念。",
                "pageStart": 16,
                "pageEnd": 16,
                "mainThemeId": "j3-2-1-main-theme-radical-and-absolute-value",
                "wrapperId": "j3-2-1-main-theme-radical-and-absolute-value-core",
                "rows": [
                    ["核心關係", "\\(\\sqrt{a^2}=|a|\\)，不能直接寫成 \\(a\\)。"],
                    ["當 \\(a>0\\) 時", "\\(\\sqrt{a^2}=a\\)，因為絕對值不改變它。"],
                    ["當 \\(a<0\\) 時", "\\(\\sqrt{a^2}=-a\\)，因為平方根表示的是非負值。"],
                    ["當 \\(a=0\\) 時", "\\(\\sqrt{a^2}=0\\)。"],
                    ["化簡時先想正負", "遇到含根號的式子時，絕對值常是判斷正負與整理結果的關鍵。"],
                ],
                "branchIds": [
                    "j3-2-1-absolute-root",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "root-comparison-and-approximation",
                "title": "根號比較大小與近似值",
                "summary": "比較根號大小時先統一形式；估近似值時先找夾住它的完全平方數。",
                "pageStart": 22,
                "pageEnd": 22,
                "mainThemeId": "j3-2-1-main-theme-root-comparison-and-approximation",
                "wrapperId": "j3-2-1-main-theme-root-comparison-and-approximation-core",
                "rows": [
                    ["同次根號比較大小", "同次根號比較大小時，只要比較被開方數大小。"],
                    ["係數移入根號", "比較 \\(a\\sqrt{b}\\) 時，可先改寫成 \\(\\sqrt{a^2b}\\) 再比大小。"],
                    ["完全平方夾住估值", "像 \\(4^2<18<5^2\\)，所以 \\(4<\\sqrt{18}<5\\)。"],
                    ["逐位逼近近似值", "先找整數範圍，再往小數第一位、第二位逐步逼近。"],
                    ["查表前先整理形式", "若題目有查表或換算需求，先把根號內改成容易對應的形式。"],
                ],
                "branchIds": [
                    "j3-2-1-approximation",
                ],
            },
        ],
    },
    {
        "chapterCode": "j3-2-2",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二冊",
            "chapter": "二次方根與畢氏定理",
            "section": "根式的運算",
            "domain": "數與量",
            "domainSub": "代數",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 5,
        },
        "rootId": "junior-radical-operation-main-j322",
        "rootTitle": "根式的運算",
        "rootManualOrder": 1322,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "radical-operations-and-rationalization",
                "title": "根號運算與分母有理化",
                "summary": "先熟悉根號乘除，再理解有理化是在把分母中的根號消掉。",
                "pageStart": 17,
                "pageEnd": 17,
                "mainThemeId": "j3-2-2-main-theme-radical-operations-and-rationalization",
                "wrapperId": "j3-2-2-main-theme-radical-operations-and-rationalization-core",
                "rows": [
                    ["平方根乘法", "\\(\\sqrt{a}\\sqrt{b}=\\sqrt{ab}\\)，其中 \\(a\\ge 0\\)、\\(b\\ge 0\\)。"],
                    ["平方根除法", "\\(\\dfrac{\\sqrt{a}}{\\sqrt{b}}=\\sqrt{\\dfrac{a}{b}}\\)，其中 \\(a\\ge 0\\)、\\(b>0\\)。"],
                    ["分母有理化的目的", "把分母中的根號消掉，讓式子更容易整理與比較。"],
                    ["分母是二項時乘共軛", "像 \\(\\dfrac{1}{\\sqrt{2}-1}\\) 常要乘上 \\(\\sqrt{2}+1\\)。"],
                    ["先分清楚乘除與加減", "根號的乘除可合併，但加減不能直接拆成一個根號。"],
                ],
                "branchIds": [
                    "j3-2-2-rationalization",
                    "rationalize-denominator-monomial-junior",
                    "rationalize-denominator-binomial-junior",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "simplest-radicals-and-like-radicals",
                "title": "最簡根式與同類根號",
                "summary": "根號加減前先化成最簡根式，再判斷是不是同類根號。",
                "pageStart": 18,
                "pageEnd": 18,
                "mainThemeId": "j3-2-2-main-theme-simplest-radicals-and-like-radicals",
                "wrapperId": "j3-2-2-main-theme-simplest-radicals-and-like-radicals-core",
                "rows": [
                    ["最簡平方根式", "根號內不能再提出大於 \\(1\\) 的完全平方因數，例如 \\(\\sqrt{12}=2\\sqrt{3}\\)。"],
                    ["分母不能再含根號", "若分母還有根號，就要再做一次有理化。"],
                    ["同類根號的判斷", "化簡後根號內相同、開方次數也相同，才叫同類根號。"],
                    ["同類根號加減", "只加減前面的係數，根號部分保留不動。"],
                    ["立方根也要先化簡", "像 \\(\\sqrt[3]{54}=3\\sqrt[3]{2}\\)，最簡立方根式同樣是先把可提出的因數提出來。"],
                ],
                "branchIds": [
                    "simplest-radical-form-junior",
                    "radical-add-subtract-like-terms",
                    "j3-2-2-simplest-radical",
                    "j3-2-2-like-radicals",
                    "j3-2-2-cube-root-basics",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "radical-arithmetic",
                "title": "根號四則運算",
                "summary": "根號四則最怕順序亂掉，所以要先化簡，再決定能不能合併或是否要有理化。",
                "pageStart": 19,
                "pageEnd": 19,
                "mainThemeId": "j3-2-2-main-theme-radical-arithmetic",
                "wrapperId": "j3-2-2-main-theme-radical-arithmetic-core",
                "rows": [
                    ["加減先化簡再合併", "先把每個根號化成最簡，再判斷能不能合併同類根號。"],
                    ["乘法先乘係數再乘根號", "做乘法時，先整理係數，再整理根號內部，最後別忘了再化簡。"],
                    ["除法留意分母限制", "做除法時要檢查分母不能含根號，必要時再有理化。"],
                    ["分數與小數先整理數值", "把分數、小數先整理乾淨再開根號，通常比較不容易出錯。"],
                    ["最常錯的是順序", "根號運算不難，最容易錯的是化簡順序和同類根號判斷。"],
                ],
                "branchIds": [
                    "radical-operation-junior",
                    "radical-operations-junior",
                    "radical-mul-div-split-rule",
                    "j3-2-2-radical-mul-div",
                ],
            },
        ],
    },
    {
        "chapterCode": "j3-2-3",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二冊",
            "chapter": "二次方根與畢氏定理",
            "section": "畢氏定理",
            "domain": "代數",
            "domainSub": "幾何",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 6,
        },
        "rootId": "junior-pythagorean-main-j323",
        "rootTitle": "畢氏定理",
        "rootManualOrder": 1323,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "pythagorean-theorem-and-radical-applications",
                "title": "畢氏定理與根號應用",
                "summary": "先把 \\(a^2+b^2=c^2\\) 用熟，再把求邊長、判斷直角和根號應用一起串起來。",
                "pageStart": 20,
                "pageEnd": 20,
                "mainThemeId": "j3-2-3-main-theme-pythagorean-theorem-and-radical-applications",
                "wrapperId": "j3-2-3-main-theme-pythagorean-theorem-and-radical-applications-core",
                "rows": [
                    ["畢氏定理", "直角三角形兩股為 \\(a,b\\)，斜邊為 \\(c\\) 時，滿足 \\(a^2+b^2=c^2\\)。"],
                    ["已知兩股求斜邊", "可寫成 \\(c=\\sqrt{a^2+b^2}\\)。"],
                    ["已知斜邊求股長", "可寫成 \\(a=\\sqrt{c^2-b^2}\\) 或 \\(b=\\sqrt{c^2-a^2}\\)，要用大平方減小平方。"],
                    ["判斷是否為直角三角形", "若最大邊平方等於另外兩邊平方和，就能判斷它是直角三角形。"],
                    ["只能用在直角三角形", "題目若不是直角三角形，就不能直接套畢氏定理。"],
                ],
                "branchIds": [
                    "pythagorean",
                    "pythagorean-converse",
                    "j3-2-3-pythagorean-main",
                    "j3-2-3-find-hypotenuse",
                    "j3-2-3-find-leg",
                    "j3-2-3-right-triangle-check",
                    "j3-2-3-area-square-model",
                    "j3-2-3-height-application",
                    "pythagorean-triples-345",
                    "pythagorean-scaling-similarity",
                    "special-right-triangles-45-30",
                    "right-triangle-altitude-to-hypotenuse",
                    "bee-fly-ant-crawl-pythagorean",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "coordinate-plane-distance",
                "title": "座標平面兩點距離",
                "summary": "兩點距離公式其實就是把畢氏定理搬到座標平面上使用。",
                "pageStart": 21,
                "pageEnd": 21,
                "mainThemeId": "j3-2-3-main-theme-coordinate-plane-distance",
                "wrapperId": "j3-2-3-main-theme-coordinate-plane-distance-core",
                "rows": [
                    ["數線上的距離", "兩點 \\(P(a)\\)、\\(Q(b)\\) 的距離是 \\(|b-a|\\)。"],
                    ["平面兩點距離公式", "若 \\(A(x_1,y_1)\\)、\\(B(x_2,y_2)\\)，則距離是 \\(\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}\\)。"],
                    ["水平差與垂直差", "\\(x_2-x_1\\) 是水平差，\\(y_2-y_1\\) 是垂直差，兩者剛好形成直角三角形的兩股。"],
                    ["順序不影響答案", "因為差平方後正負會消失，所以交換順序不影響最後距離。"],
                    ["同一直線也適用", "若兩點在同一直線上，公式仍成立，只是其中一個差會變成 \\(0\\)。"],
                ],
                "branchIds": [],
            },
        ],
    },
]


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

    for chapter_plan in TOPIC_PLAN:
        meta = dict(chapter_plan["meta"])
        meta["chapterCode"] = chapter_plan["chapterCode"]
        meta["updatedAt"] = updated_at

        upsert_topic(
            topic_map,
            build_root(meta, chapter_plan["rootId"], chapter_plan["rootTitle"], chapter_plan["rootManualOrder"]),
        )

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
                branch["modifiedAt"] = updated_at

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
    manifest["sourcePdf"] = str(SOURCE_PDF)
    append_manifest_entries(manifest, manifest_entries)

    save_json(FORMULA_DB, formula_payload)
    save_json(MAIN_TOPIC_DB, main_topic_payload)
    save_json(PDF_MANIFEST, manifest)
    print("Updated j3-2-1 ~ j3-2-3 main themes.")


if __name__ == "__main__":
    main()

