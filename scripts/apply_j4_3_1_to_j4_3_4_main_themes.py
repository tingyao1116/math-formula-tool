from __future__ import annotations

import json
import re
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "junior-fourth-semester-topic-pdfs.json"
BUILD_DIR = PDF_EXPORT_DIR / "_generated-j4-3"
SOURCE_ROOT = ROOT / "exports" / "j2-second-volume-outline"
TZ = timezone(timedelta(hours=8))


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def find_chapter_dir(prefix: str) -> Path:
    matches = sorted(SOURCE_ROOT.glob(f"{prefix}*"))
    if not matches:
        raise RuntimeError(f"找不到來源資料夾：{prefix}")
    return matches[0]


def make_formula_lines(title: str, summary: str) -> dict:
    return {
        "type": "labeled-lines",
        "lines": [
            {"label": "定位", "values": [f"\\text{{{title}}}"]},
            {"label": "摘要", "values": [f"\\text{{{summary}}}"]},
        ],
    }


def make_core_formula_lines(rows: list[list[str]]) -> dict:
    return {
        "type": "labeled-lines",
        "lines": [
            {"label": f"重點{idx}", "values": [row[0]]}
            for idx, row in enumerate(rows[:3], start=1)
        ],
    }


def upsert_topic(topic_map: dict[str, dict], topic: dict) -> None:
    existing = topic_map.get(topic["id"], {})
    merged = dict(existing)
    merged.update(topic)
    topic_map[topic["id"]] = merged


def next_original_index(topic_map: dict[str, dict]) -> int:
    return max((int(topic.get("originalIndex", 0) or 0) for topic in topic_map.values()), default=0) + 1


def assign_original_index(topic_map: dict[str, dict], topic: dict, counter: list[int]) -> None:
    existing = topic_map.get(topic["id"])
    if existing and existing.get("originalIndex"):
        topic["originalIndex"] = existing["originalIndex"]
    else:
        topic["originalIndex"] = counter[0]
        counter[0] += 1


def derive_meta(existing_topics: list[dict], chapter_code: str, updated_at: str) -> dict:
    for topic in existing_topics:
        if topic.get("chapterCode") == chapter_code:
            meta = {
                "stage": topic.get("stage", "國中"),
                "grade": topic.get("grade", "國二"),
                "term": topic.get("term", "下學期"),
                "gradeLabel": topic.get("gradeLabel", "國二下"),
                "chapter": topic.get("chapter", topic.get("section", chapter_code)),
                "section": topic.get("section", topic.get("chapter", chapter_code)),
                "domain": topic.get("domain", "幾何"),
                "domainSub": topic.get("domainSub", ""),
                "stageOrder": topic.get("stageOrder", 1),
                "gradeOrder": topic.get("gradeOrder", 2),
                "termOrder": topic.get("termOrder", 2),
                "chapterOrder": topic.get("chapterOrder", 0),
                "chapterCode": chapter_code,
                "updatedAt": updated_at,
            }
            return meta
    raise RuntimeError(f"找不到章節既有資料：{chapter_code}")


def build_root(meta: dict, root_id: str, title: str, manual_order: int) -> dict:
    return {
        "id": root_id,
        "title": title,
        "formula": make_formula_lines(title, title),
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
        "tags": [meta["chapterCode"], title],
        "usage": [title],
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


def build_wrapper(meta: dict, theme: dict) -> dict:
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
        "notes": [f"來源：{theme['sourceLabel']}"],
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


def upsert_main_topic_entry(store: dict, topic: dict, updated_at: str) -> None:
    store[topic["mainThemeId"]] = {
        "id": topic["mainThemeId"],
        "title": topic["title"],
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {"type": "table", "headers": ["重點", "整理"], "rows": topic["rows"]},
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "pdf-page",
                        "src": f"exports/main-theme-overviews/{topic['pdfFile']}",
                        "note": topic["title"],
                    },
                ],
            },
        ],
    }


def retarget(topic: dict, meta: dict, parent_id: str) -> None:
    topic["parentId"] = parent_id
    topic["stage"] = meta["stage"]
    topic["grade"] = meta["grade"]
    topic["term"] = meta["term"]
    topic["gradeLabel"] = meta["gradeLabel"]
    topic["chapter"] = meta["chapter"]
    topic["section"] = meta["section"]
    topic["domain"] = meta["domain"]
    topic["domainSub"] = meta["domainSub"]
    topic["chapterCode"] = meta["chapterCode"]
    topic["chapter_code"] = meta["chapterCode"]
    topic["chapterOrder"] = meta["chapterOrder"]
    topic["stageOrder"] = meta["stageOrder"]
    topic["gradeOrder"] = meta["gradeOrder"]
    topic["termOrder"] = meta["termOrder"]
    topic["chapterRole"] = "分支"
    topic["isBranch"] = True
    topic["modifiedAt"] = meta["updatedAt"]


def clean_source_markdown(text: str) -> str:
    text = text.replace("\r\n", "\n")
    text = re.sub(r"^##\s+\d+\.\s*", "## ", text, flags=re.MULTILINE)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = text.replace("\\<", "<").replace("\\>", ">").replace("\\|", "|")
    text = text.replace("\\(", "(").replace("\\)", ")")
    text = text.replace("^\\circ", "°")
    text = text.replace("Δ", "△")
    return text.strip() + "\n"


def ensure_print_css() -> Path:
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    css_path = BUILD_DIR / "j4-3-source-print.css"
    css_path.write_text(
        """
@page { size: A4; margin: 16mm; }
body {
  font-family: "Microsoft JhengHei", "PingFang TC", "Noto Sans CJK TC", sans-serif;
  color: #1f2937;
  line-height: 1.75;
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
}
h1 { color: #0f3d63; font-size: 28px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #d7e6f3; }
h2 { color: #155a84; font-size: 22px; margin-top: 28px; }
h3 { color: #234; font-size: 17px; margin-top: 18px; }
blockquote {
  margin: 12px 0 16px;
  padding: 10px 14px;
  border-left: 4px solid #8fb8d8;
  background: #f6fbff;
}
ul, ol { padding-left: 1.4em; }
img { max-width: 100%; page-break-inside: avoid; }
code { font-family: "Consolas", "Courier New", monospace; background: #f4f7fa; padding: 0 2px; }
        """.strip()
        + "\n",
        encoding="utf-8",
    )
    return css_path


def build_source_html(chapter_dir: Path, theme: dict, css_path: Path) -> Path:
    md_path = BUILD_DIR / f"{theme['pdfStem']}.md"
    html_path = BUILD_DIR / f"{theme['pdfStem']}.html"
    parts = [f"# {theme['title']}", "", f"> 來源整理：{theme['sourceLabel']}", ""]
    for filename in theme["sourceSections"]:
        section_path = chapter_dir / "raw_sections_clean" / filename
        parts.append(clean_source_markdown(section_path.read_text(encoding="utf-8")))
    md_path.write_text("\n".join(parts).strip() + "\n", encoding="utf-8")
    subprocess.run(
        [
            "pandoc",
            "-f",
            "markdown",
            "-t",
            "html5",
            "--embed-resources",
            "-s",
            "--resource-path",
            str(chapter_dir),
            "--css",
            str(css_path),
            str(md_path),
            "-o",
            str(html_path),
        ],
        check=True,
        cwd=BUILD_DIR,
    )
    return html_path


PLAN = [
    {
        "chapterCode": "j4-3-1",
        "rootId": "junior-triangle-angle-main-j431",
        "rootTitle": "三角形的角度",
        "rootManualOrder": 1431,
        "chapterDirPrefix": "改國二下5_",
        "sourceLabel": "改國二下5_三角形的內角與外角_易讀版.md",
        "themes": [
            {
                "topicNumber": 1,
                "slug": "triangle-angles-and-exterior-angle-theorem",
                "title": "三角形記法、內角外角與外角定理",
                "summary": "先認清內角、外角與內對角，再用內角和與外角定理處理基本角度題。",
                "rows": [
                    ["平角、周角與內外角", "平角是 \(180^\circ\)，周角是 \(360^\circ\)；內角與相鄰外角互補。"],
                    ["三角形內角和", "任意三角形都有 \(\angle A+\angle B+\angle C=180^\circ\)。"],
                    ["外角定理", "一個外角等於另外兩個內對角之和。"],
                ],
                "sourceSections": [
                    "01_triangle-angle-language.md",
                    "02_triangle-interior-sum.md",
                    "03_exterior-angle-sum.md",
                    "04_exterior-angle-theorem.md",
                ],
                "retargetIds": [
                    "j4-3-1-line-ray-segment",
                    "j4-3-1-angle-basic-type",
                    "j4-3-1-complement-supplement",
                    "j4-3-1-triangle-interior-sum",
                    "j4-3-1-triangle-exterior-theorem",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "angle-chasing-parallel-eight-arrow-turning",
                "title": "角度追蹤：平行線、8字型、飛鏢型、轉角",
                "summary": "遇到複合角度題，先找平行線、8字型、飛鏢型或轉角，再回到外角與內角和。",
                "rows": [
                    ["平行線配三角形", "先用同位角或內錯角搬角，再接三角形內角和。"],
                    ["8字型與飛鏢型", "8字型常得到兩端角和相等；飛鏢型常把大角拆成兩個小角。"],
                    ["轉角轉外角", "路線轉彎與外角和常用 \(360^\circ\) 或 \(180^\circ-\text{內角}\) 來整理。"],
                ],
                "sourceSections": [
                    "05_basic-angle-chasing.md",
                    "06_parallel-and-triangle-angles.md",
                    "07_eight-shape-theorem.md",
                    "08_arrow-theorem.md",
                    "09_multi-angle-sums.md",
                    "11_folding-and-exterior-sum.md",
                ],
                "retargetIds": [
                    "j4-3-1-angle-chasing-strategy",
                    "j4-3-1-geometry-word-application",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "polygon-angle-sums-exterior-sums-and-diagonals",
                "title": "多邊形內角和、外角和與對角線個數",
                "summary": "把三角形角度推廣到多邊形，掌握內角和、外角和與對角線公式。",
                "rows": [
                    ["\(n\) 邊形內角和", "\(n\) 邊形內角和是 \((n-2)180^\circ\)。"],
                    ["外角和", "任意凸多邊形的一組外角和都是 \(360^\circ\)。"],
                    ["對角線個數", "\(n\) 邊形對角線個數是 \(\dfrac{n(n-3)}{2}\)。"],
                ],
                "sourceSections": [
                    "09_multi-angle-sums.md",
                    "10_regular-shape-angle-problems.md",
                ],
                "retargetIds": [
                    "j4-3-1-polygon-interior-sum",
                    "j4-3-1-polygon-diagonal",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "regular-polygons-isosceles-equilateral-and-angle-bisectors",
                "title": "正多邊形、等腰等邊與角平分線綜合",
                "summary": "把正多邊形、等腰等邊三角形與內外角平分線的性質整理在同一條主線上。",
                "rows": [
                    ["正多邊形", "每一外角是 \(\dfrac{360^\circ}{n}\)，每一內角是 \(180^\circ-\dfrac{360^\circ}{n}\)。"],
                    ["等腰與等邊", "等腰三角形底角相等；等邊三角形三角都是 \(60^\circ\)。"],
                    ["內外角平分線", "先拆半角，再接內角和、外角定理或平角 \(180^\circ\) 來整理。"],
                ],
                "sourceSections": [
                    "10_regular-shape-angle-problems.md",
                    "12_isosceles-composite.md",
                    "13_internal-angle-bisectors.md",
                    "14_external-angle-bisectors.md",
                    "15_mixed-angle-bisectors.md",
                ],
                "retargetIds": [
                    "j4-3-1-regular-polygon-angle",
                    "j4-3-1-isosceles-triangle-angle",
                    "j4-3-1-equilateral-triangle-angle",
                ],
            },
        ],
    },
    {
        "chapterCode": "j4-3-2",
        "rootId": "junior-compass-straightedge-main-j432",
        "rootTitle": "尺規作圖",
        "rootManualOrder": 1432,
        "chapterDirPrefix": "改國二下3_",
        "sourceLabel": "改國二下3_尺規作圖_易讀版.md",
        "themes": [
            {
                "topicNumber": 1,
                "slug": "tools-equal-segments-equal-angles",
                "title": "尺規作圖的工具與等線段、等角",
                "summary": "先把直尺、圓規和等線段、等角的核心操作穩定下來。",
                "rows": [
                    ["直尺與圓規", "直尺只能畫直線；圓規負責保留距離與畫圓弧。"],
                    ["等線段", "固定圓規開口，就能把已知長度搬到新的位置。"],
                    ["等角與角和差", "先複製弧，再複製弦，角和與角差都是延伸。"],
                ],
                "sourceSections": [
                    "01_ruler-compass-rules.md",
                    "02_copy-segment.md",
                    "03_segment-sum-difference.md",
                    "04_copy-angle.md",
                    "05_angle-sum-difference.md",
                ],
                "retargetIds": [
                    "j4-3-2-tools-and-rules",
                    "j4-3-2-copy-segment",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "perpendicular-bisector-perpendicular-and-angle-bisector-constructions",
                "title": "中垂線、垂線與角平分線作圖",
                "summary": "等距觀念是這一塊的主軸：中垂線、垂線和角平分線都靠它完成。",
                "rows": [
                    ["中垂線", "在線段兩端畫等半徑圓弧，可得到過中點且垂直的直線。"],
                    ["過點作垂線", "在線上點與線外點作垂線，都在製造等距。"],
                    ["角平分線", "角平分線上點到角的兩邊距離相等。"],
                ],
                "sourceSections": [
                    "06_perpendicular-bisector-angle-bisector.md",
                    "07_perpendicular-through-point-on-line.md",
                    "08_perpendicular-from-external-point.md",
                    "09_perpendicular-bisector-and-four-parts.md",
                    "10_angle-bisector-construction.md",
                ],
                "retargetIds": [
                    "j4-3-2-midpoint-bisector",
                    "j4-3-2-perpendicular-construction",
                    "j4-3-2-angle-bisector-construction",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "parallel-line-construction-and-parallel-angle-reading",
                "title": "平行線作圖與平行角關係",
                "summary": "作平行線不是獨立技巧，而是同位角、內錯角與角度追蹤的延伸。",
                "rows": [
                    ["過點作平行線", "常用同位角或內錯角相等，把方向搬到指定位置。"],
                    ["平行線角名", "同位角、內錯角、同側內角是判讀的基本語言。"],
                    ["作圖與理由", "每一步都要能說明平行、垂直、等距或角相等的依據。"],
                ],
                "sourceSections": [
                    "11_parallel-line-construction.md",
                    "12_parallel-angle-names.md",
                    "13_parallel-properties-tests.md",
                    "14_parallel-angle-chasing.md",
                    "15_parallel-area-folding-reflection.md",
                ],
                "retargetIds": [
                    "j4-3-2-parallel-construction",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "constructing-triangles-and-construction-checking",
                "title": "作三角形與作圖驗證",
                "summary": "把 SSS、SAS、ASA 這些條件帶回作圖，最後再用驗證語言收束。",
                "rows": [
                    ["SSS、SAS、ASA 作圖", "三邊、兩邊夾角、兩角一邊都能固定一個三角形。"],
                    ["作圖驗證", "完成後要回頭檢查等距、垂直、平分和平行條件是否真的成立。"],
                    ["綜合作圖", "希臘題或組合題通常是多個基本作圖的串接。"],
                ],
                "sourceSections": [
                    "16_greek-construction-problems.md",
                ],
                "retargetIds": [
                    "j4-3-2-triangle-sss",
                    "j4-3-2-triangle-sas",
                    "j4-3-2-triangle-asa",
                    "j4-3-2-construction-check",
                ],
            },
        ],
    },
    {
        "chapterCode": "j4-3-3",
        "rootId": "junior-congruence-main-j433",
        "rootTitle": "三角形的全等",
        "rootManualOrder": 1433,
        "chapterDirPrefix": "改國二下6_",
        "sourceLabel": "改國二下6_三角形的全等_易讀版.md",
        "themes": [
            {
                "topicNumber": 1,
                "slug": "congruence-meaning-and-correspondence",
                "title": "全等的意義與對應關係",
                "summary": "先把全等、對應頂點、對應邊角的語言固定，後面的判定才不會寫錯順序。",
                "rows": [
                    ["全等的意思", "全等表示兩個圖形大小與形狀都一樣，重疊後能完全吻合。"],
                    ["對應關係", "寫全等時順序不能亂，因為順序就是對應頂點的配對。"],
                    ["全等後可推", "全等後可直接得到對應邊相等、對應角相等。"],
                ],
                "sourceSections": [
                    "01_congruence-correspondence.md",
                ],
                "retargetIds": [
                    "j4-3-3-congruence-correspondence",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "valid-congruence-tests",
                "title": "可用的全等判定",
                "summary": "把 SSS、SAS、ASA、AAS、RHS 這五種真正能判定全等的條件整理在一起。",
                "rows": [
                    ["SSS 與 SAS", "三邊對應相等，或兩邊及其夾角對應相等，都能判定全等。"],
                    ["ASA 與 AAS", "兩角加上一條對應邊相等時，第三角也被固定。"],
                    ["RHS", "直角三角形若斜邊和一股對應相等，也能判定全等。"],
                ],
                "sourceSections": [
                    "02_five-congruence-tests.md",
                    "03_sss-sas.md",
                    "04_asa-aas.md",
                    "05_rhs-right-triangle.md",
                ],
                "retargetIds": [
                    "j4-3-3-five-criteria-overview",
                    "j4-3-3-sss-sas-core",
                    "j4-3-3-asa-aas-core",
                    "j4-3-3-rhs-hl-right-triangle",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "non-congruence-cases",
                "title": "不能直接判定全等的情形",
                "summary": "SSA 與 AAA 是最容易誤判的兩組條件，要先分清楚不能直接推出全等。",
                "rows": [
                    ["SSA 不是全等", "兩邊與一個非夾角相等時，可能對應到不同圖形。"],
                    ["AAA 不是全等", "三角相等只保證形狀相同，通常是相似，不保證大小相同。"],
                    ["條件不足怎麼辦", "先找公共邊、對頂角或平行線角，再補成真正足夠的判定。"],
                ],
                "sourceSections": [
                    "06_non-congruence-ssa-aaa.md",
                ],
                "retargetIds": [
                    "j4-3-3-ssa-counterexample",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "congruence-applications-proof-and-construction-link",
                "title": "全等的應用、證明與作圖連結",
                "summary": "全等不只拿來判定，還要能回到證明流程、對應推論和作圖應用。",
                "rows": [
                    ["證明流程", "先列已知，再補公共邊或角關係，判定全等後回到題目結論。"],
                    ["對應推論", "全等後可用對應邊角去求 \(x\)、角度、長度與面積。"],
                    ["作圖與摺疊", "作圖、摺紙、正方形或等邊題常把全等條件藏在圖中。"],
                ],
                "sourceSections": [
                    "07_construction-sss-sas.md",
                    "08_construction-asa-aas.md",
                    "09_algebra-with-corresponding-parts.md",
                    "10_prove-congruence-workflow.md",
                    "11_squares-and-equilateral-applications.md",
                    "12_folding-congruence.md",
                    "13_pythagorean-after-congruence.md",
                    "14_congruence-and-area-ratio.md",
                    "15_rotated-square-and-final-strategy.md",
                ],
                "retargetIds": [
                    "j4-3-3-proof-structure",
                    "j4-3-3-cpctc-application",
                    "j4-3-3-regular-shape-congruence",
                    "j4-3-3-folding-and-right-triangle",
                    "j4-3-3-area-perimeter-application",
                    "j4-3-3-criteria-selection-strategy",
                ],
            },
        ],
    },
    {
        "chapterCode": "j4-3-4",
        "rootId": "junior-triangle-side-angle-relation-main-j434",
        "rootTitle": "邊角關係",
        "rootManualOrder": 1434,
        "chapterDirPrefix": "改國二下7_",
        "sourceLabel": "改國二下7_三角形的邊角關係_易讀版.md",
        "themes": [
            {
                "topicNumber": 1,
                "slug": "triangle-inequality-and-third-side-range",
                "title": "三角形成立條件與第三邊範圍",
                "summary": "先確定三邊能不能組成三角形，再進一步用第三邊範圍和絕對值做整理。",
                "rows": [
                    ["三角形成立條件", "任兩邊和都要大於第三邊。"],
                    ["第三邊範圍", "若已知兩邊 \(a,b\)，則第三邊 \(x\) 滿足 \(|a-b|<x<a+b\)。"],
                    ["範圍化簡絕對值", "先由範圍判斷正負，再拆絕對值或根號平方。"],
                ],
                "sourceSections": [
                    "01_triangle-inequality-existence.md",
                    "02_third-side-range.md",
                    "03_range-absolute-value.md",
                ],
                "retargetIds": [
                    "j4-3-4-triangle-inequality-basic",
                    "j4-3-4-third-side-range",
                    "j4-3-4-abs-simplify-by-range",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "larger-side-larger-angle-and-converse",
                "title": "大邊對大角、大角對大邊",
                "summary": "同一個三角形裡，邊長與對角大小是同步變化的，座標和路線題也常回到這件事。",
                "rows": [
                    ["大邊對大角", "同一三角形中，邊越長，對角越大。"],
                    ["大角對大邊", "同一三角形中，角越大，對邊越長。"],
                    ["座標與路線比較", "可先把距離轉成邊長，再回到對邊對角的大小判斷。"],
                ],
                "sourceSections": [
                    "04_larger-side-larger-angle.md",
                    "05_coordinate-distance-angle.md",
                    "06_routes-and-angle-comparison.md",
                ],
                "retargetIds": [
                    "j4-3-4-side-angle-monotonic",
                    "j4-3-4-coordinate-distance-compare",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "hinge-theorem-and-converse",
                "title": "樞紐定理與逆樞紐定理",
                "summary": "兩邊固定時，夾角越大第三邊越長；反過來也能用第三邊長短判斷夾角大小。",
                "rows": [
                    ["樞紐定理", "兩組對應邊相等時，夾角較大的一邊，其第三邊較長。"],
                    ["逆樞紐定理", "若兩組對應邊相等，第三邊較長，則它的夾角也較大。"],
                    ["使用前先檢查", "比較的角一定要是兩條已知邊夾住的角。"],
                ],
                "sourceSections": [
                    "10_hinge-theorem.md",
                    "11_median-and-inequality.md",
                ],
                "retargetIds": [
                    "j4-3-4-hinge-theorem-basic",
                    "j4-3-4-hinge-theorem-converse",
                ],
            },
            {
                "topicNumber": 4,
                "slug": "special-right-triangles-and-area",
                "title": "特殊直角三角形與面積",
                "summary": "30-60-90 與 45-45-90 的邊比，常和面積公式一起出現在綜合題。",
                "rows": [
                    ["30-60-90", "邊比是 \(1:\sqrt{3}:2\)。"],
                    ["45-45-90", "邊比是 \(1:1:\sqrt{2}\)。"],
                    ["面積連結", "直角三角形面積可用 \(\dfrac{\text{底}\times\text{高}}{2}\) 搭配邊比整理。"],
                ],
                "sourceSections": [
                    "12_special-right-triangles.md",
                    "13_special-right-area.md",
                    "16_solid-diagonal-special-right.md",
                ],
                "retargetIds": [
                    "j4-3-4-special-30-60-90",
                    "j4-3-4-special-45-45-90",
                    "j4-3-4-special-right-area",
                ],
            },
            {
                "topicNumber": 5,
                "slug": "perpendicular-bisector-angle-bisector-and-shortest-path",
                "title": "中垂線、角平分線與最短路徑綜合",
                "summary": "這一組題常把等距、最短路徑、反射和三角形不等式綁在一起。",
                "rows": [
                    ["中垂線等距", "在線段中垂線上的點，到兩端點距離相等。"],
                    ["角平分線等距", "在角平分線上的點，到角兩邊的距離相等。"],
                    ["反射最短路徑", "先把折線問題轉成直線，再配三角形不等式與邊角關係。"],
                ],
                "sourceSections": [
                    "07_angle-bisector-distance-comparison.md",
                    "08_reflection-shortest-path.md",
                    "09_angle-sum-and-grid.md",
                    "14_folding-perpendicular-bisector.md",
                    "15_angle-bisector-area.md",
                    "17_parallelogram-angle-synthesis.md",
                ],
                "retargetIds": [
                    "j4-3-4-fold-perpendicular-bisector",
                    "j4-3-4-angle-bisector-distance",
                    "j4-3-4-reflection-shortest-path",
                    "j4-3-4-integrated-strategy",
                ],
            },
        ],
    },
]


def prepare_themes() -> list[dict]:
    css_path = ensure_print_css()
    prepared: list[dict] = []
    for chapter in PLAN:
        chapter_dir = find_chapter_dir(chapter["chapterDirPrefix"])
        for theme in chapter["themes"]:
            pdf_stem = f"{chapter['chapterCode']}-topic-{theme['topicNumber']}-{theme['slug']}"
            theme["mainThemeId"] = f"{chapter['chapterCode']}-main-theme-{theme['slug']}"
            theme["wrapperId"] = f"{theme['mainThemeId']}-core"
            theme["pdfStem"] = pdf_stem
            theme["pdfFile"] = f"{pdf_stem}.pdf"
            theme["htmlFile"] = f"{pdf_stem}.html"
            theme["sourceLabel"] = chapter["sourceLabel"]
            build_source_html(chapter_dir, theme, css_path)
            prepared.append(theme)
    return prepared


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    manifest = load_json(PDF_MANIFEST)

    topics = formula_db["topics"]
    topic_map = {topic["id"]: topic for topic in topics}
    original_counter = [next_original_index(topic_map)]

    existing_root_ids_by_code: dict[str, set[str]] = {}
    for chapter in PLAN:
        code = chapter["chapterCode"]
        existing_root_ids_by_code[code] = {
            topic["id"]
            for topic in topics
            if topic.get("chapterCode") == code and not topic.get("parentId")
        }

    prepared_themes = prepare_themes()
    themes_by_code: dict[str, list[dict]] = {}
    for theme in prepared_themes:
        code = theme["mainThemeId"].split("-main-theme-")[0]
        themes_by_code.setdefault(code, []).append(theme)

    by_id = main_topic_db.setdefault("byId", {})
    manifest_topics = manifest.setdefault("topics", [])

    for chapter in PLAN:
        code = chapter["chapterCode"]
        meta = derive_meta(topics, code, updated_at)
        mapped_ids = {rid for theme in chapter["themes"] for rid in theme["retargetIds"]}
        generated_ids = {chapter["rootId"]}
        for theme in chapter["themes"]:
            generated_ids.add(f"{code}-main-theme-{theme['slug']}")
            generated_ids.add(f"{code}-main-theme-{theme['slug']}-core")
        missing = existing_root_ids_by_code[code] - mapped_ids - generated_ids
        if missing:
            raise RuntimeError(f"{code} 還有未分配的舊 root：{sorted(missing)}")

        root = build_root(meta, chapter["rootId"], chapter["rootTitle"], chapter["rootManualOrder"])
        assign_original_index(topic_map, root, original_counter)
        upsert_topic(topic_map, root)

        for theme in themes_by_code[code]:
            main_theme = build_main_theme(meta, theme, chapter["rootId"])
            wrapper = build_wrapper(meta, theme)
            assign_original_index(topic_map, main_theme, original_counter)
            assign_original_index(topic_map, wrapper, original_counter)
            upsert_topic(topic_map, main_theme)
            upsert_topic(topic_map, wrapper)
            upsert_main_topic_entry(by_id, theme, updated_at)
            for old_id in theme["retargetIds"]:
                old_topic = topic_map.get(old_id)
                if old_topic:
                    retarget(old_topic, meta, theme["wrapperId"])

        manifest_topics = [entry for entry in manifest_topics if entry.get("chapterCode") != code]
        for theme in themes_by_code[code]:
            manifest_topics.append(
                {
                    "chapterCode": code,
                    "topicNumber": theme["topicNumber"],
                    "slug": theme["slug"],
                    "title": theme["title"],
                    "pageStart": None,
                    "pageEnd": None,
                    "file": theme["pdfFile"],
                    "sourceKind": "generated-from-markdown",
                    "sourceMd": theme["sourceLabel"],
                    "htmlFile": f"_generated-j4-3/{theme['htmlFile']}",
                }
            )

    formula_db["topics"] = list(topic_map.values())
    main_topic_db["byId"] = by_id
    manifest["topics"] = sorted(manifest_topics, key=lambda x: (x["chapterCode"], x["topicNumber"]))
    manifest["count"] = len(manifest["topics"])
    manifest["sourceNotes"] = [
        "j4-3-1 到 j4-3-4 使用分章 Markdown 來源重建主題與原稿版。",
        "因為整冊 Word公式版 PDF 只完整涵蓋尺規作圖與三角形全等，所以 j4-3 原稿版改由分章來源輸出。",
    ]

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(PDF_MANIFEST, manifest)
    print("Applied j4-3-1 ~ j4-3-4 main themes and prepared source HTML.")


if __name__ == "__main__":
    main()
