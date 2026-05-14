from __future__ import annotations

import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
CHAPTER_CODE_DB = ROOT / "program-db" / "database" / "chapter-code-db.json"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "junior-third-semester-topic-pdfs.json"
SOURCE_MD = ROOT / "exports" / "j3-first-volume-outline" / "國三上全重點_易讀版分頁版.md"
SOURCE_PDF = ROOT / "exports" / "j3-first-volume-outline" / "國三上全重點_易讀版分頁版_Word公式版.pdf"
TZ = timezone(timedelta(hours=8))


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def inline_math_to_tex(text: str) -> str:
    return re.sub(r"\$(.+?)\$", lambda m: f"\\({m.group(1)}\\)", text)


def parse_sections(markdown_text: str) -> dict[str, list[list[str]]]:
    sections: dict[str, list[list[str]]] = {}
    current_title = ""
    current_rows: list[list[str]] = []
    for raw_line in markdown_text.splitlines():
        line = raw_line.strip()
        if line.startswith("## "):
            if current_title:
                sections[current_title] = current_rows
            current_title = line[3:].strip()
            current_rows = []
            continue
        if not line.startswith("- "):
            continue
        content = inline_math_to_tex(line[2:].strip())
        match = re.match(r"\*\*(.+?)\*\*：\s*(.+)", content)
        if match:
            current_rows.append([match.group(1).strip(), match.group(2).strip()])
            continue
        match = re.match(r"\*\*(.+?)\*\*", content)
        if match:
            label = match.group(1).strip()
            rest = content[match.end() :].lstrip("：: ").strip()
            current_rows.append([label, rest or label])
            continue
        parts = re.split(r"[：:]", content, maxsplit=1)
        if len(parts) == 2:
            current_rows.append([parts[0].strip(), parts[1].strip()])
        else:
            current_rows.append([content, content])
    if current_title:
        sections[current_title] = current_rows
    return sections


def make_formula_lines(title: str, summary: str) -> dict:
    return {
        "type": "labeled-lines",
        "lines": [
            {"label": "主題", "values": [f"\\text{{{title}}}"]},
            {"label": "摘要", "values": [f"\\text{{{summary}}}"]},
        ],
    }


def make_core_formula_lines(rows: list[list[str]]) -> dict:
    return {
        "type": "labeled-lines",
        "lines": [{"label": f"重點{idx}", "values": [row[0]]} for idx, row in enumerate(rows[:3], start=1)],
    }


def theme_summary(rows: list[list[str]]) -> str:
    return "、".join(row[0] for row in rows[:3])


def build_reminder(rows: list[list[str]]) -> str:
    labels = [row[0] for row in rows[:4]]
    if not labels:
        return "待補主題提醒"
    return "、".join(labels) + " 等重點"


def derive_meta(topic_map: dict[str, dict], chapter_catalog: dict, chapter_code: str, updated_at: str) -> dict:
    donor = next(topic for topic in topic_map.values() if topic.get("chapterCode") == "j5-2-1")
    catalog = chapter_catalog[chapter_code]
    return {
        "stage": donor.get("stage", "國中"),
        "grade": donor.get("grade", "國三上"),
        "term": donor.get("term", "上學期"),
        "gradeLabel": donor.get("gradeLabel", "國三上"),
        "chapter": catalog["chapter"],
        "section": catalog["section"],
        "domain": catalog["domainMain"],
        "domainSub": catalog.get("domainSub", ""),
        "stageOrder": donor.get("stageOrder", 1),
        "gradeOrder": donor.get("gradeOrder", 3),
        "termOrder": donor.get("termOrder", 1),
        "chapterOrder": donor.get("chapterOrder", 0),
        "chapterCode": chapter_code,
        "updatedAt": updated_at,
    }


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
        "contentTypes": ["重點整理", "例題", "無限練習", "常見錯誤"],
        "tags": [meta["chapterCode"], title],
        "usage": [title],
        "examples": [],
        "tips": [f"先看 {title} 這章的主題主線，再往下展開分支。"],
        "notes": [f"這層是 {meta['chapterCode']} 的正式章節主軸。"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "chapterCode": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": manual_order,
        "orderIndex": manual_order,
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "isBranch": False,
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
        "contentTypes": ["重點整理", "例題", "無限練習", "常見錯誤"],
        "tags": [meta["chapterCode"], "主題", theme["title"]],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": [f"先讀 {theme['title']} 的整理，再往下看原本舊分支。"],
        "notes": [f"這層對應來源主題：{theme['title']}"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "chapterCode": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": theme["topicNumber"],
        "orderIndex": theme["topicNumber"],
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "isBranch": False,
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
        "contentTypes": ["公式", "重點整理", "例題", "無限練習", "常見錯誤", "觀念釐清"],
        "tags": [meta["chapterCode"], theme["title"], "主題整理"],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": [f"這一層保留 {theme['title']} 的重點整理入口。"],
        "notes": [f"來源：{SOURCE_MD.name}"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "chapterCode": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": theme["topicNumber"] * 100,
        "orderIndex": theme["topicNumber"] * 100,
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "isBranch": False,
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


def export_pdf_pages(reader: PdfReader, page_start: int, page_end: int, destination: Path) -> None:
    writer = PdfWriter()
    for page_number in range(page_start - 1, page_end):
        writer.add_page(reader.pages[page_number])
    with destination.open("wb") as fh:
        writer.write(fh)


def build_variant_payload(theme: dict) -> list[dict]:
    return [
        {
            "id": "editable",
            "label": "可修改版",
            "sections": [
                {"type": "table", "headers": ["重點", "整理"], "rows": theme["rows"]},
            ],
        },
        {
            "id": "original",
            "label": "原稿版",
            "sections": [
                {
                    "type": "pdf-page",
                    "src": f"exports/main-theme-overviews/{theme['pdfFile']}",
                    "note": theme["title"],
                }
            ],
        },
    ]


def update_chapter_overview(overviews: dict, chapter_code: str, group_name: str, paragraph: str, rows: list[list[str]], updated_at: str) -> None:
    overviews[chapter_code] = {
        "groupName": group_name,
        "title": "章節重點大綱",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {"type": "paragraph", "text": paragraph},
                    {"type": "table", "headers": ["主題", "角色", "下一層 / 提醒"], "rows": rows},
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {"type": "paragraph", "text": paragraph},
                    {"type": "table", "headers": ["主題", "角色", "下一層 / 提醒"], "rows": rows},
                ],
            },
        ],
    }


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    overview_db = load_json(OVERVIEW_DB)
    chapter_code_db = load_json(CHAPTER_CODE_DB)
    manifest = load_json(PDF_MANIFEST)
    sections = parse_sections(SOURCE_MD.read_text(encoding="utf-8"))
    reader = PdfReader(str(SOURCE_PDF))

    chapter_code_db["catalog"]["j5-3-1"] = {
        "chapter": "證明與三心",
        "section": "證明的基本想法",
        "domainMain": "幾何",
        "domainSub": "",
    }
    chapter_code_db["catalog"]["j5-3-2"] = {
        "chapter": "證明與三心",
        "section": "幾何證明的常用工具",
        "domainMain": "幾何",
        "domainSub": "",
    }
    chapter_code_db["catalog"]["j5-3-3"] = {
        "chapter": "證明與三心",
        "section": "外心、內心、重心",
        "domainMain": "幾何",
        "domainSub": "",
    }

    themes = [
        {
            "chapterCode": "j5-3-1",
            "chapterRootId": "j5-3-1-main-root-proof-basics",
            "chapterTitle": "證明的基本想法",
            "topicNumber": 1,
            "title": "幾何推理與證明的基本想法",
            "sectionTitle": "幾何推理與證明的基本想法",
            "slug": "geometric-reasoning-and-proof-basics",
            "pageStart": 21,
            "pageEnd": 21,
            "existingIds": [
                "j5-3-2-what-is-geometric-reasoning",
                "j5-3-2-proof-language-format",
                "j5-3-2-analysis-draw-backward",
                "j5-3-2-proof-writing-demo",
                "j5-3-2-common-failures",
            ],
        },
        {
            "chapterCode": "j5-3-2",
            "chapterRootId": "j5-3-2-main-root-proof-toolkit",
            "chapterTitle": "幾何證明的常用工具",
            "topicNumber": 1,
            "title": "證明題的常用工具",
            "sectionTitle": "證明題的常用工具",
            "slug": "proof-toolkit",
            "pageStart": 22,
            "pageEnd": 22,
            "existingIds": [
                "j5-3-2-postulates-and-toolbox",
                "j5-3-2-angle-sum-theorems",
                "j5-3-2-complementary-angle-elimination",
                "j5-3-2-congruence-template-rhs",
                "j5-3-2-perpendicular-bisector-property-converse",
                "j5-3-2-angle-bisector-distance-property",
                "j5-3-2-isosceles-triangle-properties",
                "j5-3-2-parallelogram-diagonal-congruence",
                "j5-3-2-auxiliary-line-toolbox",
                "j5-3-2-composite-proof-overview",
                "j5-3-2-chapter-checklist",
            ],
        },
        {
            "chapterCode": "j5-3-3",
            "chapterRootId": "j5-3-3-main-root-triangle-centers",
            "chapterTitle": "外心、內心、重心",
            "topicNumber": 1,
            "title": "外心與外接圓",
            "sectionTitle": "外心與外接圓",
            "slug": "circumcenter-and-circumcircle",
            "pageStart": 23,
            "pageEnd": 23,
            "existingIds": [
                "j5-3-3-circumcenter-definition",
                "j5-3-3-circumcenter-position",
                "j5-3-3-circumcenter-angle-formula",
                "j5-3-3-circumcenter-coordinate",
            ],
        },
        {
            "chapterCode": "j5-3-3",
            "chapterRootId": "j5-3-3-main-root-triangle-centers",
            "chapterTitle": "外心、內心、重心",
            "topicNumber": 2,
            "title": "內心與內切圓",
            "sectionTitle": "內心與內切圓",
            "slug": "incenter-and-incircle",
            "pageStart": 24,
            "pageEnd": 24,
            "existingIds": [
                "j5-3-3-incenter-definition-incircle",
                "j5-3-3-incenter-angle-formula",
                "j5-3-3-incenter-tangent-length",
                "j5-3-3-incenter-area-formula",
            ],
        },
        {
            "chapterCode": "j5-3-3",
            "chapterRootId": "j5-3-3-main-root-triangle-centers",
            "chapterTitle": "外心、內心、重心",
            "topicNumber": 3,
            "title": "重心與中線",
            "sectionTitle": "重心與中線",
            "slug": "centroid-and-medians",
            "pageStart": 25,
            "pageEnd": 25,
            "existingIds": [
                "j5-3-3-centroid-definition-medians",
                "j5-3-3-centroid-ratio-2-1",
                "j5-3-3-centroid-area-partition",
                "j5-3-3-centroid-coordinate",
            ],
        },
        {
            "chapterCode": "j5-3-3",
            "chapterRootId": "j5-3-3-main-root-triangle-centers",
            "chapterTitle": "外心、內心、重心",
            "topicNumber": 4,
            "title": "三心的比較",
            "sectionTitle": "三心的比較",
            "slug": "comparison-of-three-centers",
            "pageStart": 26,
            "pageEnd": 26,
            "existingIds": [
                "j5-3-3-centers-comparison",
                "j5-3-3-equilateral-special-case",
            ],
        },
        {
            "chapterCode": "j5-3-3",
            "chapterRootId": "j5-3-3-main-root-triangle-centers",
            "chapterTitle": "外心、內心、重心",
            "topicNumber": 5,
            "title": "三心的常見應用",
            "sectionTitle": "三心的常見應用",
            "slug": "applications-of-three-centers",
            "pageStart": 27,
            "pageEnd": 27,
            "existingIds": [
                "j5-3-3-proof-and-construction-strategy",
                "j5-3-3-chapter-checklist",
            ],
        },
    ]

    for theme in themes:
        rows = sections[theme["sectionTitle"]]
        theme["rows"] = rows
        theme["summary"] = theme_summary(rows)
        theme["mainThemeId"] = f"{theme['chapterCode']}-main-theme-{theme['slug']}"
        theme["wrapperId"] = f"{theme['chapterCode']}-main-core-{theme['slug']}"
        theme["pdfFile"] = f"{theme['chapterCode']}-topic-{theme['topicNumber']}-{theme['slug']}.pdf"

    topics = formula_db["topics"]
    topic_map = {topic["id"]: topic for topic in topics}

    generated_ids = {
        theme["chapterRootId"]
        for theme in themes
    } | {theme["mainThemeId"] for theme in themes} | {theme["wrapperId"] for theme in themes}
    topics = [topic for topic in topics if topic["id"] not in generated_ids]
    formula_db["topics"] = topics
    topic_map = {topic["id"]: topic for topic in topics}

    root_titles: dict[str, str] = {}
    for theme in themes:
        root_titles[theme["chapterCode"]] = theme["chapterTitle"]

    metas = {
        code: derive_meta(topic_map, chapter_code_db["catalog"], code, updated_at)
        for code in root_titles
    }

    roots_added: set[str] = set()
    for code, title in root_titles.items():
        meta = metas[code]
        root_id = next(theme["chapterRootId"] for theme in themes if theme["chapterCode"] == code)
        if root_id not in roots_added:
            formula_db["topics"].append(build_root(meta, root_id, title, manual_order=1))
            roots_added.add(root_id)

    for theme in themes:
        meta = metas[theme["chapterCode"]]
        formula_db["topics"].append(build_main_theme(meta, theme, theme["chapterRootId"]))
        formula_db["topics"].append(build_wrapper(meta, theme))
        for old_id in theme["existingIds"]:
            topic = topic_map.get(old_id)
            if topic:
                retarget(topic, meta, theme["wrapperId"])

    main_topic_by_id = main_topic_db.setdefault("byId", {})
    for theme in themes:
        main_topic_by_id[theme["mainThemeId"]] = {
            "id": theme["mainThemeId"],
            "title": theme["title"],
            "updatedAt": updated_at,
            "variants": build_variant_payload(theme),
        }

    PDF_EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    for theme in themes:
        export_pdf_pages(reader, theme["pageStart"], theme["pageEnd"], PDF_EXPORT_DIR / theme["pdfFile"])

    manifest_topics = [item for item in manifest.get("topics", []) if not str(item.get("chapterCode", "")).startswith("j5-3-")]
    for theme in themes:
        manifest_topics.append(
            {
                "chapterCode": theme["chapterCode"],
                "topicNumber": theme["topicNumber"],
                "slug": theme["slug"],
                "title": theme["title"],
                "pageStart": theme["pageStart"],
                "pageEnd": theme["pageEnd"],
                "file": theme["pdfFile"],
            }
        )
    manifest["sourcePdf"] = SOURCE_PDF.name
    manifest["topics"] = sorted(manifest_topics, key=lambda item: (item["chapterCode"], int(item["topicNumber"])))
    manifest["count"] = len(manifest["topics"])

    overviews = overview_db.setdefault("overviews", {})
    update_chapter_overview(
        overviews,
        "j5-3-1",
        "國中・國三上・證明的基本想法",
        "1. 這一章先抓幾何推理與證明最核心的觀念：證明不是看起來像，而是從已知條件一步一步推出結論。\n\n2. 看到證明題時，先分清楚已知、求證和中間還缺哪一步，再決定要不要補圖、補角或補輔助線。\n\n3. 這章建議先從 幾何推理與證明的基本想法 開始，再往下展開原本的證明分支。",
        [[themes[0]["title"], "主題", build_reminder(themes[0]["rows"])]],
        updated_at,
    )
    update_chapter_overview(
        overviews,
        "j5-3-2",
        "國中・國三上・幾何證明的常用工具",
        "1. 這一章要把常見證明工具分清楚，像角和、全等、垂直平分線、角平分線、等腰三角形與輔助線，避免題目一複雜就亂套性質。\n\n2. 做題時先看求證是邊、角、平行、垂直還是共點，再回頭挑最合適的工具。\n\n3. 這章建議先從 證明題的常用工具 開始，再往下看原本的舊分支。",
        [[themes[1]["title"], "主題", build_reminder(themes[1]["rows"])]],
        updated_at,
    )
    update_chapter_overview(
        overviews,
        "j5-3-3",
        "國中・國三上・外心、內心、重心",
        "1. 這一章正式改以三心主題整理為主軸，先分清楚外心、內心、重心各自在看什麼等距關係，再往下看分支。\n\n2. 看到題目時，要先判斷它在考哪一個中心，還是在比較三心或做綜合應用。\n\n3. 這章建議先從 外心與外接圓 開始，再依序往下。",
        [
            [themes[2]["title"], "主題", build_reminder(themes[2]["rows"])],
            [themes[3]["title"], "主題", build_reminder(themes[3]["rows"])],
            [themes[4]["title"], "主題", build_reminder(themes[4]["rows"])],
            [themes[5]["title"], "主題", build_reminder(themes[5]["rows"])],
            [themes[6]["title"], "主題", build_reminder(themes[6]["rows"])],
        ],
        updated_at,
    )

    formula_db["meta"]["updatedAt"] = updated_at
    main_topic_db["meta"]["updatedAt"] = updated_at
    overview_db["meta"]["updatedAt"] = updated_at
    chapter_code_db["meta"]["updatedAt"] = updated_at

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(OVERVIEW_DB, overview_db)
    save_json(CHAPTER_CODE_DB, chapter_code_db)
    save_json(PDF_MANIFEST, manifest)


if __name__ == "__main__":
    main()
