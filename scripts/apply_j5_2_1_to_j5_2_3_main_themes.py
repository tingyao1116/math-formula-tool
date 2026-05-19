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
    donor = next(topic for topic in topic_map.values() if topic.get("chapterCode") in {"j5-2-1", "j5-2-2"})
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


def upsert_chapter_overview(overview_store: dict, chapter_code: str, group_name: str, rows: list[list[str]], updated_at: str) -> None:
    entry = overview_store.setdefault(
        chapter_code,
        {"groupName": group_name, "title": "章節重點大綱", "variants": []},
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
            "1. 這一章正式改以目前主題整理為主軸，先抓每個主題在處理哪一種圓的關係。\n\n"
            "2. 看到題目時，先分清楚它是屬於位置、角度，還是乘冪與綜合應用，再往下看分支。\n\n"
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
        "chapterCode": "j5-2-1",
        "rootId": "j5-2-1-main-root-basic-circle-and-length",
        "rootTitle": "基本圓與長度關係",
        "themes": [
            {
                "title": "點、直線與圓的位置關係",
                "sourceSection": "點、直線與圓的位置關係",
                "mainThemeId": "j5-2-1-main-theme-point-line-circle-position",
                "wrapperId": "j5-2-1-main-core-point-line-circle-position",
                "topicNumber": 1,
                "slug": "point-line-circle-position",
                "pageStart": 13,
                "pageEnd": 13,
                "retargetIds": [
                    "j5-2-1-circle-basic-language",
                    "j5-2-1-point-circle-position",
                    "j5-2-1-line-circle-position",
                ],
            },
            {
                "title": "切線與弦心距",
                "sourceSection": "切線與弦心距",
                "mainThemeId": "j5-2-1-main-theme-tangent-and-chord-center-distance",
                "wrapperId": "j5-2-1-main-core-tangent-and-chord-center-distance",
                "topicNumber": 2,
                "slug": "tangent-and-chord-center-distance",
                "pageStart": 14,
                "pageEnd": 14,
                "retargetIds": [
                    "j5-2-1-tangent-property-criterion",
                    "j5-2-1-tangent-construction",
                    "j5-2-1-coordinate-tangent-area",
                    "j5-2-1-chord-center-distance",
                    "j5-2-1-equal-chords-distance-order",
                    "j5-2-1-chord-length-pythagorean",
                    "j5-2-1-concentric-circle-area-diff",
                ],
            },
            {
                "title": "兩圓的位置關係與公切線",
                "sourceSection": "兩圓的位置關係與公切線",
                "mainThemeId": "j5-2-1-main-theme-two-circles-position-and-common-tangent",
                "wrapperId": "j5-2-1-main-core-two-circles-position-and-common-tangent",
                "topicNumber": 3,
                "slug": "two-circles-position-and-common-tangent",
                "pageStart": 15,
                "pageEnd": 15,
                "retargetIds": [
                    "j5-2-1-two-circles-thresholds",
                    "j5-2-1-five-position-cases",
                    "j5-2-1-position-judge-procedure",
                    "j5-2-1-common-chord-property",
                    "j5-2-1-common-chord-calculation",
                    "j5-2-1-tangent-point-centers-line",
                    "j5-2-1-multi-circle-tangent-models",
                    "j5-2-1-common-tangent-language-count",
                    "j5-2-1-external-common-tangent-length",
                    "j5-2-1-internal-common-tangent-length",
                    "j5-2-1-tangent-length-comparison",
                    "j5-2-1-chapter-checklist",
                ],
            },
        ],
    },
    {
        "chapterCode": "j5-2-2",
        "rootId": "j5-2-2-main-root-circle-angle-relations",
        "rootTitle": "圓的角度關係",
        "themes": [
            {
                "title": "弧、弦、圓心角與弧長",
                "sourceSection": "弧、弦、圓心角與弧長",
                "mainThemeId": "j5-2-2-main-theme-arc-chord-central-angle-and-arc-length",
                "wrapperId": "j5-2-2-main-core-arc-chord-central-angle-and-arc-length",
                "topicNumber": 1,
                "slug": "arc-chord-central-angle-and-arc-length",
                "pageStart": 16,
                "pageEnd": 16,
                "retargetIds": [
                    "j5-2-2-arc-chord-basics",
                    "j5-2-2-central-angle-arc-degree",
                    "j5-2-2-arc-length-radian",
                    "j5-2-2-concentric-arc-chord-order",
                    "j5-2-2-rolling-arc-distance",
                ],
            },
            {
                "title": "圓周角、弦切角、圓內角與圓外角",
                "sourceSection": "圓周角、弦切角、圓內角與圓外角",
                "mainThemeId": "j5-2-2-main-theme-inscribed-tangent-chord-interior-exterior-angles",
                "wrapperId": "j5-2-2-main-core-inscribed-tangent-chord-interior-exterior-angles",
                "topicNumber": 2,
                "slug": "inscribed-tangent-chord-interior-exterior-angles",
                "pageStart": 17,
                "pageEnd": 17,
                "retargetIds": [
                    "j5-2-2-inscribed-angle-basics",
                    "j5-2-2-tangent-chord-angle",
                    "j5-2-2-interior-exterior-angle",
                ],
            },
            {
                "title": "圓與角的綜合判斷",
                "sourceSection": "圓與角的綜合判斷",
                "mainThemeId": "j5-2-2-main-theme-circle-and-angle-integration",
                "wrapperId": "j5-2-2-main-core-circle-and-angle-integration",
                "topicNumber": 3,
                "slug": "circle-and-angle-integration",
                "pageStart": 18,
                "pageEnd": 18,
                "retargetIds": [
                    "j5-2-2-angle-formula-map",
                    "j5-2-2-arc-ratio-partition",
                ],
            },
        ],
    },
    {
        "chapterCode": "j5-2-3",
        "rootId": "j5-2-3-main-root-power-and-circle-applications",
        "rootTitle": "乘冪與圓的綜合應用",
        "themes": [
            {
                "title": "乘冪性質與線段乘積",
                "sourceSection": "乘冪性質與線段乘積",
                "mainThemeId": "j5-2-3-main-theme-power-of-a-point-and-segment-products",
                "wrapperId": "j5-2-3-main-core-power-of-a-point-and-segment-products",
                "topicNumber": 1,
                "slug": "power-of-a-point-and-segment-products",
                "pageStart": 19,
                "pageEnd": 19,
                "retargetIds": [
                    "j5-2-2-power-inside",
                    "j5-2-2-power-outside",
                    "j5-2-2-tangent-secant-theorem",
                    "j5-2-2-power-from-similarity",
                ],
            },
            {
                "title": "圓的綜合應用",
                "sourceSection": "圓的綜合應用",
                "mainThemeId": "j5-2-3-main-theme-circle-applications",
                "wrapperId": "j5-2-3-main-core-circle-applications",
                "topicNumber": 2,
                "slug": "circle-applications",
                "pageStart": 20,
                "pageEnd": 20,
                "retargetIds": [
                    "j5-2-2-diameter-circumcircle-integration",
                    "j5-2-2-sector-triangle-area-integration",
                    "j5-2-2-chapter-checklist",
                ],
            },
        ],
    },
]


def ensure_chapter_codes(chapter_catalog: dict) -> None:
    if "j5-2-3" not in chapter_catalog:
        chapter_catalog["j5-2-3"] = {
            "chapter": "圓形",
            "section": "乘冪與圓的綜合應用",
            "domainMain": "幾何",
            "domainSub": "",
        }


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    topic_map = {topic["id"]: topic for topic in formula_db["topics"]}
    topic_counter = next_original_index(topic_map)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    main_topic_store = main_topic_db.setdefault("byId", {})
    overview_db = load_json(OVERVIEW_DB)
    overview_store = overview_db.setdefault("overviews", {})
    chapter_code_db = load_json(CHAPTER_CODE_DB)
    chapter_catalog = chapter_code_db["catalog"]
    ensure_chapter_codes(chapter_catalog)
    manifest = load_json(PDF_MANIFEST)
    manifest["sourcePdf"] = SOURCE_PDF.name
    manifest_topics = [item for item in manifest.get("topics", []) if not item.get("chapterCode", "").startswith("j5-2-")]
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
    chapter_code_db.setdefault("meta", {})
    chapter_code_db["meta"]["updatedAt"] = updated_at
    save_json(CHAPTER_CODE_DB, chapter_code_db)
    manifest["topics"] = sorted(manifest_topics, key=lambda item: (item["chapterCode"], item["topicNumber"], item["file"]))
    manifest["count"] = len(manifest["topics"])
    save_json(PDF_MANIFEST, manifest)


if __name__ == "__main__":
    main()

