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


def derive_meta(topic_map: dict[str, dict], chapter_catalog: dict, chapter_code: str, updated_at: str) -> dict:
    donor = next(
        topic
        for topic in topic_map.values()
        if topic.get("chapterCode") in {"j5-1-2", "j5-1-3"}
    )
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


def next_original_index(topic_map: dict[str, dict]) -> int:
    return max((int(topic.get("originalIndex", 0) or 0) for topic in topic_map.values()), default=0) + 1


def export_topic_pdf(reader: PdfReader, page_start: int, page_end: int, file_name: str) -> None:
    writer = PdfWriter()
    for page_number in range(page_start - 1, page_end):
        writer.add_page(reader.pages[page_number])
    out_path = PDF_EXPORT_DIR / file_name
    with out_path.open("wb") as fh:
        writer.write(fh)


def theme_summary(rows: list[list[str]]) -> str:
    labels = [row[0] for row in rows[:3]]
    return "、".join(labels)


def build_reminder(rows: list[list[str]]) -> str:
    labels = [row[0] for row in rows[:4]]
    if not labels:
        return "待補主題提醒"
    if len(labels) == 1:
        return f"{labels[0]} 等重點"
    return "、".join(labels) + " 等重點"


def upsert_chapter_overview(overview_store: dict, chapter_code: str, group_name: str, rows: list[list[str]], updated_at: str) -> None:
    entry = overview_store.setdefault(
        chapter_code,
        {
            "groupName": group_name,
            "title": "章節重點大綱",
            "variants": [],
        },
    )
    entry["groupName"] = group_name
    entry["title"] = "章節重點大綱"
    entry["updatedAt"] = updated_at

    variants = {variant.get("id"): variant for variant in entry.setdefault("variants", [])}
    for variant_id, label in [("editable", "可修改版"), ("original", "原稿版")]:
        if variant_id not in variants:
            variant = {"id": variant_id, "label": label, "sections": []}
            entry["variants"].append(variant)
            variants[variant_id] = variant
        variant = variants[variant_id]
        sections = variant.setdefault("sections", [])
        paragraph = next((s for s in sections if s.get("type") == "paragraph"), None)
        if paragraph is None:
            paragraph = {"type": "paragraph", "text": ""}
            sections.insert(0, paragraph)
        paragraph["text"] = (
            "1. 這一章正式改以目前主題整理為主軸，先抓每個主題在處理哪一種比例或相似關係。\n\n"
            "2. 看到題目時，先分清楚它是屬於這一章的哪個主題，再往下看主題底下的分支與提醒。\n\n"
            f"3. 這章建議先從 {rows[0][0]} 開始，再依序往下。"
        )
        table = next((s for s in sections if s.get("type") == "table"), None)
        if table is None:
            table = {"type": "table", "headers": ["主題", "角色", "下一層 / 提醒"], "rows": []}
            sections.append(table)
        table["headers"] = ["主題", "角色", "下一層 / 提醒"]
        table["rows"] = rows


PLAN = [
    {
        "chapterCode": "j5-1-1",
        "rootId": "j5-1-1-main-root-ratio-chain",
        "rootTitle": "連比",
        "themes": [
            {
                "title": "比例線段的基本語言",
                "sourceSection": "比例線段的基本語言",
                "mainThemeId": "j5-1-1-main-theme-ratio-language",
                "wrapperId": "j5-1-1-main-core-ratio-language",
                "topicNumber": 1,
                "slug": "ratio-language",
                "pageStart": 2,
                "pageEnd": 2,
                "retargetIds": ["j5-1-2-ratio-language"],
            }
        ],
    },
    {
        "chapterCode": "j5-1-2",
        "rootId": "j5-1-2-main-root-parallel-intercept",
        "rootTitle": "平行線截比例線段",
        "themes": [
            {
                "title": "平行線截比例線段性質",
                "sourceSection": "平行線截比例線段性質",
                "mainThemeId": "j5-1-2-main-theme-parallel-intercept-theorem",
                "wrapperId": "j5-1-2-main-core-parallel-intercept-theorem",
                "topicNumber": 1,
                "slug": "parallel-intercept-theorem",
                "pageStart": 3,
                "pageEnd": 3,
                "retargetIds": ["j5-1-2-parallel-intercept-theorem"],
            },
            {
                "title": "三角形截比例性質與反性質",
                "sourceSection": "三角形截比例性質與反性質",
                "mainThemeId": "j5-1-2-main-theme-triangle-intercept-forward-and-converse",
                "wrapperId": "j5-1-2-main-core-triangle-intercept-forward-and-converse",
                "topicNumber": 2,
                "slug": "triangle-intercept-forward-and-converse",
                "pageStart": 4,
                "pageEnd": 4,
                "retargetIds": [
                    "j5-1-2-triangle-intercept-forward",
                    "j5-1-2-area-view",
                    "j5-1-2-triangle-intercept-converse",
                ],
            },
            {
                "title": "用比例線段求未知長度",
                "sourceSection": "用比例線段求未知長度",
                "mainThemeId": "j5-1-2-main-theme-solve-unknown-length",
                "wrapperId": "j5-1-2-main-core-solve-unknown-length",
                "topicNumber": 3,
                "slug": "solve-unknown-length",
                "pageStart": 5,
                "pageEnd": 5,
                "retargetIds": [
                    "j5-1-2-solve-unknown-length",
                    "j5-1-2-multi-parallel-transfer",
                    "j5-1-2-trapezoid-ratio",
                    "j5-1-2-partition-auxiliary-lines",
                    "j5-1-2-ratio-types-check",
                    "j5-1-2-construction-6-5",
                    "j5-1-2-checklist-strategy",
                ],
            },
        ],
    },
    {
        "chapterCode": "j5-1-3",
        "rootId": "j5-1-3-main-root-scale-similarity",
        "rootTitle": "縮放與相似",
        "themes": [
            {
                "title": "相似三角形的意義與對應順序",
                "sourceSection": "相似三角形的意義與對應順序",
                "mainThemeId": "j5-1-3-main-theme-similarity-meaning-and-correspondence",
                "wrapperId": "j5-1-3-main-core-similarity-meaning-and-correspondence",
                "topicNumber": 1,
                "slug": "similarity-meaning-and-correspondence",
                "pageStart": 6,
                "pageEnd": 6,
                "retargetIds": ["j5-1-3-sim-language"],
            },
            {
                "title": "相似三角形的判別",
                "sourceSection": "相似三角形的判別",
                "mainThemeId": "j5-1-3-main-theme-similarity-tests",
                "wrapperId": "j5-1-3-main-core-similarity-tests",
                "topicNumber": 2,
                "slug": "similarity-tests",
                "pageStart": 7,
                "pageEnd": 7,
                "retargetIds": [
                    "j5-1-3-criteria-overview",
                    "j5-1-3-aa-criterion",
                    "j5-1-3-sss-criterion",
                    "j5-1-3-sas-criterion",
                ],
            },
            {
                "title": "平行線造成的小大三角形相似",
                "sourceSection": "平行線造成的小大三角形相似",
                "mainThemeId": "j5-1-3-main-theme-parallel-line-small-large-similarity",
                "wrapperId": "j5-1-3-main-core-parallel-line-small-large-similarity",
                "topicNumber": 3,
                "slug": "parallel-line-small-large-similarity",
                "pageStart": 8,
                "pageEnd": 8,
                "retargetIds": [
                    "j5-1-3-parallel-de-bc",
                    "j5-1-3-basic-computation",
                ],
            },
            {
                "title": "相似比、周長比、面積比",
                "sourceSection": "相似比、周長比、面積比",
                "mainThemeId": "j5-1-3-main-theme-scale-perimeter-and-area-ratios",
                "wrapperId": "j5-1-3-main-core-scale-perimeter-and-area-ratios",
                "topicNumber": 4,
                "slug": "scale-perimeter-and-area-ratios",
                "pageStart": 9,
                "pageEnd": 9,
                "retargetIds": [
                    "j5-1-3-corresponding-elements",
                    "j5-1-3-area-ratio-square",
                    "j5-1-3-parallel-height-base-ratio",
                    "j5-1-3-trapezoid-parallel-segment",
                ],
            },
            {
                "title": "直角三角形中的相似",
                "sourceSection": "直角三角形中的相似",
                "mainThemeId": "j5-1-3-main-theme-right-triangle-similarity",
                "wrapperId": "j5-1-3-main-core-right-triangle-similarity",
                "topicNumber": 5,
                "slug": "right-triangle-similarity",
                "pageStart": 10,
                "pageEnd": 10,
                "retargetIds": [
                    "j5-1-3-self-similarity",
                    "j5-1-3-right-altitude-similarity",
                    "j5-1-3-altitude-product-formulas",
                    "j5-1-3-right-altitude-calculation",
                    "j5-1-3-indirect-measurement",
                    "j5-1-3-shadow-projection",
                    "j5-1-3-river-island-measurement",
                ],
            },
        ],
    },
]


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    topic_map = {topic["id"]: topic for topic in formula_db["topics"]}
    topic_counter = next_original_index(topic_map)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    main_topic_store = main_topic_db.setdefault("byId", {})
    overview_db = load_json(OVERVIEW_DB)
    overview_store = overview_db.setdefault("overviews", {})
    manifest = load_json(PDF_MANIFEST)
    manifest_topics: list[dict] = manifest.setdefault("topics", [])
    manifest["sourcePdf"] = SOURCE_PDF.name
    manifest_topics = [item for item in manifest_topics if not item.get("chapterCode", "").startswith("j5-1-")]

    chapter_catalog = load_json(CHAPTER_CODE_DB)["catalog"]
    parsed_sections = parse_sections(SOURCE_MD.read_text(encoding="utf-8"))
    reader = PdfReader(str(SOURCE_PDF))

    for chapter in PLAN:
        meta = derive_meta(topic_map, chapter_catalog, chapter["chapterCode"], updated_at)
        overview_rows: list[list[str]] = []
        root = build_root(meta, chapter["rootId"], chapter["rootTitle"], 1)
        root["originalIndex"] = topic_counter
        topic_counter += 1
        topic_map[root["id"]] = root

        for theme in chapter["themes"]:
            rows = parsed_sections[theme["sourceSection"]]
            summary = theme_summary(rows)
            theme["rows"] = rows
            theme["summary"] = summary
            theme["chapterCode"] = chapter["chapterCode"]

            main_theme = build_main_theme(meta, theme, chapter["rootId"])
            main_theme["originalIndex"] = topic_counter
            topic_counter += 1
            topic_map[main_theme["id"]] = main_theme

            wrapper = build_wrapper(meta, theme)
            wrapper["originalIndex"] = topic_counter
            topic_counter += 1
            topic_map[wrapper["id"]] = wrapper

            pdf_file = f"{chapter['chapterCode']}-topic-{theme['topicNumber']}-{theme['slug']}.pdf"
            export_topic_pdf(reader, theme["pageStart"], theme["pageEnd"], pdf_file)

            main_topic_store[theme["mainThemeId"]] = {
                "id": theme["mainThemeId"],
                "title": theme["title"],
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
                                "note": theme["title"],
                            }
                        ],
                    },
                ],
            }

            manifest_topics.append(
                {
                    "chapterCode": chapter["chapterCode"],
                    "topicNumber": theme["topicNumber"],
                    "slug": theme["slug"],
                    "title": theme["title"],
                    "pageStart": theme["pageStart"],
                    "pageEnd": theme["pageEnd"],
                    "file": pdf_file,
                }
            )
            overview_rows.append([theme["title"], "主題", build_reminder(rows)])

            for topic_id in theme["retargetIds"]:
                if topic_id in topic_map:
                    retarget(topic_map[topic_id], meta, theme["wrapperId"])

        upsert_chapter_overview(
            overview_store,
            chapter["chapterCode"],
            f"{meta['stage']}・{meta['gradeLabel']}・{chapter['rootTitle']}",
            overview_rows,
            updated_at,
        )

    formula_db["topics"] = sorted(topic_map.values(), key=lambda item: (item.get("originalIndex", 0), item["id"]))
    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    overview_db.setdefault("meta", {})
    overview_db["meta"]["updatedAt"] = updated_at
    save_json(OVERVIEW_DB, overview_db)
    manifest["topics"] = sorted(
        manifest_topics,
        key=lambda item: (item["chapterCode"], int(item["topicNumber"]), item["file"]),
    )
    manifest["count"] = len(manifest["topics"])
    save_json(PDF_MANIFEST, manifest)


if __name__ == "__main__":
    main()

