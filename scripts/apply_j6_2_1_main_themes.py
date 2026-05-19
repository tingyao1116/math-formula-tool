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
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "junior-sixth-semester-topic-pdfs.json"
SOURCE_DIR = ROOT / "exports" / "j3-second-volume-outline"
TZ = timezone(timedelta(hours=8))


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def find_source_file(suffix: str) -> Path:
    matches = [path for path in SOURCE_DIR.iterdir() if path.name.endswith(suffix)]
    if not matches:
        raise FileNotFoundError(suffix)
    return matches[0]


SOURCE_MD = find_source_file("國三下全重點_易讀版分頁版.md")
SOURCE_PDF = find_source_file("國三下全重點_易讀版分頁版_Word公式版.pdf")


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
        match = re.match(r"\*\*(.+?)\*\*[:：]?\s*(.+)", content)
        if match:
            current_rows.append([match.group(1).strip(), match.group(2).strip()])
        else:
            current_rows.append([content, content])
    if current_title:
        sections[current_title] = current_rows
    return sections


def summary_from_rows(rows: list[list[str]], limit: int = 3) -> str:
    return "、".join(row[0] for row in rows[:limit])


def reminder_from_rows(rows: list[list[str]], limit: int = 4) -> str:
    labels = [row[0] for row in rows[:limit]]
    if not labels:
        return "整理這個主題的核心重點。"
    return "、".join(labels) + " 等重點"


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
        "lines": [{"label": f"重點{idx}", "values": [row[0]]} for idx, row in enumerate(rows[:3], start=1)],
    }


def derive_meta(topic_map: dict[str, dict], updated_at: str) -> dict:
    donor = next(
        topic
        for topic in topic_map.values()
        if topic.get("chapterCode") == "j6-1-1" and not topic.get("parentId")
    )
    return {
        "stage": donor.get("stage", "國中"),
        "grade": donor.get("grade", "國三"),
        "term": donor.get("term", "下學期"),
        "gradeLabel": donor.get("gradeLabel", "國中・國三"),
        "chapter": "空間中的垂直與形體",
        "section": "空間中的垂直與形體",
        "domain": "空間與形體",
        "domainSub": "幾何",
        "stageOrder": donor.get("stageOrder", 1),
        "gradeOrder": donor.get("gradeOrder", 3),
        "termOrder": donor.get("termOrder", 2),
        "chapterOrder": donor.get("chapterOrder", 0),
        "chapterCode": "j6-2-1",
        "updatedAt": updated_at,
    }


def build_root(meta: dict, root_id: str, title: str) -> dict:
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
        "contentTypes": ["重點整理", "觀念", "公式與性質", "常見錯誤"],
        "tags": [meta["chapterCode"], title],
        "usage": [title],
        "examples": [],
        "tips": [f"先看 {title} 的主題整理，再依需要展開下層分支。"],
        "notes": [f"這筆是 {meta['chapterCode']} 的正式章節主軸。"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "chapterCode": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": 1,
        "orderIndex": 1,
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
        "contentTypes": ["重點整理", "觀念", "公式與性質", "常見錯誤"],
        "tags": [meta["chapterCode"], "主題", theme["title"]],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": [f"先看 {theme['title']} 的整理表，再往下看附掛內容。"],
        "notes": [f"這筆是 {meta['chapterCode']} 的主題整理。"],
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
        "contentTypes": ["分支", "重點整理", "觀念", "公式與性質", "常見錯誤", "無限練習"],
        "tags": [meta["chapterCode"], theme["title"], "分支整理"],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": [f"這一層保留 {theme['title']} 之後可再往下掛的分支。"],
        "notes": [f"靜態來源：{SOURCE_MD.name}"],
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


def export_pdf_pages(reader: PdfReader, page_start: int, page_end: int, destination: Path) -> None:
    writer = PdfWriter()
    for page_number in range(page_start - 1, page_end):
        writer.add_page(reader.pages[page_number])
    with destination.open("wb") as fh:
        writer.write(fh)


def build_variants(theme: dict) -> list[dict]:
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
                    "src": f"data/main-theme-overviews/{theme['pdfFile']}",
                    "note": theme["title"],
                }
            ],
        },
    ]


def update_chapter_overview(overviews: dict, updated_at: str, rows: list[list[str]]) -> None:
    overviews["j6-2-1"] = {
        "groupName": "國中・國三下・空間中的垂直與形體",
        "title": "章節重點大綱",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "這一章把平面圖形往空間延伸，重點分成形體辨認、視圖與展開圖，再到表面積與體積。看到題目時，要先分清楚它在考位置關係、展開圖，還是外表面積和內部容量。",
                    },
                    {"type": "table", "headers": ["主題", "角色", "下一層 / 提醒"], "rows": rows},
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "這一章把平面圖形往空間延伸，重點分成形體辨認、視圖與展開圖，再到表面積與體積。看到題目時，要先分清楚它在考位置關係、展開圖，還是外表面積和內部容量。",
                    },
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
    manifest = load_json(PDF_MANIFEST) if PDF_MANIFEST.exists() else {"sourcePdf": SOURCE_PDF.name, "count": 0, "topics": []}
    sections = parse_sections(SOURCE_MD.read_text(encoding="utf-8"))
    reader = PdfReader(str(SOURCE_PDF))

    topic_map = {topic["id"]: topic for topic in formula_db["topics"]}
    meta = derive_meta(topic_map, updated_at)

    theme_defs = [
        ("立體圖形的基本辨認", "solid-figure-identification", 14),
        ("視圖與空間想像", "orthographic-views-and-spatial-imagination", 15),
        ("展開圖的判讀", "nets-and-folding-interpretation", 16),
        ("表面積與體積的差別", "surface-area-vs-volume", 17),
        ("角柱與圓柱的體積", "prism-and-cylinder-volume", 18),
        ("角錐與圓錐的體積", "pyramid-and-cone-volume", 19),
        ("球的表面積與體積", "sphere-surface-area-and-volume", 20),
        ("立體圖形的表面積計算", "surface-area-calculation-of-solids", 21),
        ("複合立體與切割問題", "composite-solids-and-cutting", 22),
        ("單位換算與應用提醒", "unit-conversion-and-application-reminders", 23),
    ]

    themes = []
    for idx, (title, slug, page) in enumerate(theme_defs, start=1):
        rows = sections[title]
        themes.append(
            {
                "topicNumber": idx,
                "title": title,
                "slug": slug,
                "pageStart": page,
                "pageEnd": page,
                "rows": rows,
                "summary": summary_from_rows(rows),
                "reminder": reminder_from_rows(rows),
                "mainThemeId": f"j6-2-1-main-theme-{slug}",
                "wrapperId": f"j6-2-1-main-theme-{slug}-branches",
                "pdfFile": f"j6-2-1-topic-{idx}-{slug}.pdf",
            }
        )

    root_id = "j6-2-1-main-root-solid-geometry"
    managed_ids = {root_id}
    for theme in themes:
        managed_ids.add(theme["mainThemeId"])
        managed_ids.add(theme["wrapperId"])

    formula_db["topics"] = [topic for topic in formula_db["topics"] if topic["id"] not in managed_ids]
    formula_db["topics"].append(build_root(meta, root_id, "空間中的垂直與形體"))

    main_topic_db.setdefault("byId", {})

    for theme in themes:
        formula_db["topics"].append(build_main_theme(meta, theme, root_id))
        formula_db["topics"].append(build_wrapper(meta, theme))
        main_topic_db["byId"][theme["mainThemeId"]] = {
            "id": theme["mainThemeId"],
            "title": theme["title"],
            "updatedAt": updated_at,
            "variants": build_variants(theme),
        }
        export_pdf_pages(reader, theme["pageStart"], theme["pageEnd"], PDF_EXPORT_DIR / theme["pdfFile"])

    overview_rows = [[theme["title"], "主題", theme["reminder"]] for theme in themes]
    update_chapter_overview(overview_db["overviews"], updated_at, overview_rows)

    manifest_topics = [topic for topic in manifest.get("topics", []) if topic.get("chapterCode") != "j6-2-1"]
    manifest_topics.extend(
        {
            "chapterCode": "j6-2-1",
            "topicNumber": theme["topicNumber"],
            "slug": theme["slug"],
            "title": theme["title"],
            "pageStart": theme["pageStart"],
            "pageEnd": theme["pageEnd"],
            "file": theme["pdfFile"],
        }
        for theme in themes
    )
    manifest["sourcePdf"] = SOURCE_PDF.name
    manifest["count"] = len(manifest_topics)
    manifest["topics"] = sorted(manifest_topics, key=lambda item: (item["chapterCode"], item["topicNumber"]))

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(OVERVIEW_DB, overview_db)
    save_json(PDF_MANIFEST, manifest)


if __name__ == "__main__":
    main()

