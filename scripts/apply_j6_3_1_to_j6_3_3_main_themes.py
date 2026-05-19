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


def derive_meta(topic_map: dict[str, dict], chapter_catalog: dict, chapter_code: str, updated_at: str) -> dict:
    donor = next(
        topic
        for topic in topic_map.values()
        if topic.get("chapterCode") == chapter_code and not topic.get("parentId")
    )
    catalog = chapter_catalog[chapter_code]
    return {
        "stage": donor.get("stage", "國中"),
        "grade": donor.get("grade", "國三"),
        "term": donor.get("term", "下學期"),
        "gradeLabel": donor.get("gradeLabel", "國中・國三"),
        "chapter": catalog["chapter"],
        "section": catalog["section"],
        "domain": catalog["domainMain"],
        "domainSub": catalog.get("domainSub", ""),
        "stageOrder": donor.get("stageOrder", 1),
        "gradeOrder": donor.get("gradeOrder", 3),
        "termOrder": donor.get("termOrder", 2),
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
        "contentTypes": ["重點整理", "觀念", "公式與性質", "常見錯誤"],
        "tags": [meta["chapterCode"], title],
        "usage": [title],
        "examples": [],
        "tips": [f"先看 {title} 這一章的新主題，再往下展開舊分支。"],
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
        "contentTypes": ["重點整理", "觀念", "公式與性質", "常見錯誤"],
        "tags": [meta["chapterCode"], "主題", theme["title"]],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": [f"先看 {theme['title']} 的整理表，再往下看附掛分支。"],
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
        "tips": [f"這一層下面整理 {theme['title']} 對應的舊分支。"],
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


def update_chapter_overview(
    overviews: dict,
    chapter_code: str,
    group_name: str,
    paragraph: str,
    rows: list[list[str]],
    updated_at: str,
) -> None:
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
    manifest = load_json(PDF_MANIFEST) if PDF_MANIFEST.exists() else {"sourcePdf": SOURCE_PDF.name, "count": 0, "topics": []}
    sections = parse_sections(SOURCE_MD.read_text(encoding="utf-8"))
    reader = PdfReader(str(SOURCE_PDF))

    topic_map = {topic["id"]: topic for topic in formula_db["topics"]}

    chapter_definitions = [
        {
            "chapterCode": "j6-3-1",
            "rootId": "j6-3-1-main-root-stat-charts",
            "rootTitle": "統計圖表",
            "groupName": "國中・國三下・統計圖表",
            "paragraph": "這一章先把原始資料整理成表格與統計圖，再用平均數、中位數、眾數讀出整體特徵。看到題目時，先分清楚它是在考整理資料，還是在考代表值的判讀。",
            "themes": [
                {
                    "topicNumber": 1,
                    "title": "資料整理與統計圖表",
                    "slug": "data-organization-and-statistical-charts",
                    "pageStart": 25,
                    "pageEnd": 25,
                    "sectionTitle": "資料整理與統計圖表",
                    "oldIds": [
                        "j6-3-1-data-type-and-scope",
                        "j6-3-1-tally-and-frequency-table",
                        "j6-3-1-relative-frequency-percent",
                        "j6-3-1-bar-line-and-pie-chart",
                    ],
                },
                {
                    "topicNumber": 2,
                    "title": "平均數、中位數與眾數",
                    "slug": "mean-median-and-mode",
                    "pageStart": 26,
                    "pageEnd": 26,
                    "sectionTitle": "平均數、中位數與眾數",
                    "oldIds": [
                        "j6-3-1-mean-calculation-basic",
                        "j6-3-1-mean-with-frequency",
                        "j6-3-1-median-and-mode",
                    ],
                },
            ],
        },
        {
            "chapterCode": "j6-3-2",
            "rootId": "j6-3-2-main-root-data-analysis",
            "rootTitle": "資料的分析",
            "groupName": "國中・國三下・資料的分析",
            "paragraph": "這一章重點是把整理好的資料往下分析：先看分組與平均數估計，再看累積次數、四分位數與盒狀圖，最後比較資料的集中、分散與圖表結論。",
            "themes": [
                {
                    "topicNumber": 1,
                    "title": "分組資料與平均數估計",
                    "slug": "grouped-data-and-estimated-mean",
                    "pageStart": 27,
                    "pageEnd": 27,
                    "sectionTitle": "分組資料與平均數估計",
                    "oldIds": [
                        "j6-3-2-grouped-frequency-table",
                        "j6-3-2-combined-mean",
                    ],
                },
                {
                    "topicNumber": 2,
                    "title": "累積次數、四分位數與盒狀圖",
                    "slug": "cumulative-frequency-quartiles-and-boxplot",
                    "pageStart": 28,
                    "pageEnd": 28,
                    "sectionTitle": "累積次數、四分位數與盒狀圖",
                    "oldIds": [
                        "j6-3-2-cumulative-frequency",
                        "j6-3-2-quartiles-and-boxplot",
                        "j6-3-2-percentile-and-ranking",
                        "j6-3-2-outlier-rule",
                    ],
                },
                {
                    "topicNumber": 3,
                    "title": "資料的集中與分散",
                    "slug": "center-and-spread-of-data",
                    "pageStart": 29,
                    "pageEnd": 29,
                    "sectionTitle": "資料的集中與分散",
                    "oldIds": [
                        "j6-3-1-range-and-summary-strategy",
                        "j6-3-2-mean-median-robustness",
                    ],
                },
                {
                    "topicNumber": 4,
                    "title": "圖表判讀與統計結論",
                    "slug": "chart-interpretation-and-statistical-conclusions",
                    "pageStart": 30,
                    "pageEnd": 30,
                    "sectionTitle": "圖表判讀與統計結論",
                    "oldIds": [
                        "j6-3-2-histogram-and-shape",
                        "j6-3-2-scatter-trend-correlation",
                        "j6-3-2-time-series-trend",
                        "j6-3-2-graph-misleading-check",
                        "j6-3-2-summary-comparison-strategy",
                    ],
                },
            ],
        },
        {
            "chapterCode": "j6-3-3",
            "rootId": "j6-3-3-main-root-probability",
            "rootTitle": "機率",
            "groupName": "國中・國三下・機率",
            "paragraph": "這一章先分清楚樣本空間與事件，再用古典機率、樹狀圖、放回與不放回去處理不同題型，最後回到相對次數與統計、機率的綜合應用。",
            "themes": [
                {
                    "topicNumber": 1,
                    "title": "機率的基本概念",
                    "slug": "basic-concepts-of-probability",
                    "pageStart": 31,
                    "pageEnd": 31,
                    "sectionTitle": "機率的基本概念",
                    "oldIds": [
                        "j6-3-3-sample-space-and-event",
                        "j6-3-3-probability-definition",
                        "j6-3-3-complement-rule",
                    ],
                },
                {
                    "topicNumber": 2,
                    "title": "古典機率的求法",
                    "slug": "classical-probability-method",
                    "pageStart": 32,
                    "pageEnd": 32,
                    "sectionTitle": "古典機率的求法",
                    "oldIds": [
                        "j6-3-3-addition-rule",
                        "j6-3-3-multiplication-rule",
                    ],
                },
                {
                    "topicNumber": 3,
                    "title": "樹狀圖與列舉",
                    "slug": "tree-diagrams-and-listing",
                    "pageStart": 33,
                    "pageEnd": 33,
                    "sectionTitle": "樹狀圖與列舉",
                    "oldIds": [
                        "j6-3-3-counting-with-tree",
                    ],
                },
                {
                    "topicNumber": 4,
                    "title": "放回、不放回與事件關聯",
                    "slug": "replacement-no-replacement-and-event-dependence",
                    "pageStart": 34,
                    "pageEnd": 34,
                    "sectionTitle": "放回、不放回與事件關聯",
                    "oldIds": [
                        "j6-3-3-replacement-vs-no-replacement",
                        "j6-3-3-conditional-probability-intro",
                    ],
                },
                {
                    "topicNumber": 5,
                    "title": "相對次數與實驗機率",
                    "slug": "relative-frequency-and-experimental-probability",
                    "pageStart": 35,
                    "pageEnd": 35,
                    "sectionTitle": "相對次數與實驗機率",
                    "oldIds": [
                        "j6-3-3-fair-game-expectation",
                    ],
                },
                {
                    "topicNumber": 6,
                    "title": "統計與機率的綜合應用",
                    "slug": "integrated-statistics-and-probability-applications",
                    "pageStart": 36,
                    "pageEnd": 36,
                    "sectionTitle": "統計與機率的綜合應用",
                    "oldIds": [
                        "j6-3-3-common-traps-and-checklist",
                    ],
                },
            ],
        },
    ]

    for chapter in chapter_definitions:
        meta = derive_meta(topic_map, chapter_code_db["catalog"], chapter["chapterCode"], updated_at)
        chapter["meta"] = meta
        for theme in chapter["themes"]:
            rows = sections[theme["sectionTitle"]]
            theme["rows"] = rows
            theme["summary"] = summary_from_rows(rows)
            theme["reminder"] = reminder_from_rows(rows)
            theme["mainThemeId"] = f"{chapter['chapterCode']}-main-theme-{theme['slug']}"
            theme["wrapperId"] = f"{theme['mainThemeId']}-branches"
            theme["pdfFile"] = f"{chapter['chapterCode']}-topic-{theme['topicNumber']}-{theme['slug']}.pdf"

    managed_ids = set()
    for chapter in chapter_definitions:
        managed_ids.add(chapter["rootId"])
        for theme in chapter["themes"]:
            managed_ids.add(theme["mainThemeId"])
            managed_ids.add(theme["wrapperId"])

    formula_db["topics"] = [topic for topic in formula_db["topics"] if topic["id"] not in managed_ids]

    for chapter in chapter_definitions:
        formula_db["topics"].append(build_root(chapter["meta"], chapter["rootId"], chapter["rootTitle"], 1))
        for theme in chapter["themes"]:
            formula_db["topics"].append(build_main_theme(chapter["meta"], theme, chapter["rootId"]))
            formula_db["topics"].append(build_wrapper(chapter["meta"], theme))
            for old_id in theme["oldIds"]:
                if old_id in topic_map:
                    retarget(topic_map[old_id], chapter["meta"], theme["wrapperId"])

            main_topic_db.setdefault("byId", {})
            main_topic_db["byId"][theme["mainThemeId"]] = {
                "id": theme["mainThemeId"],
                "title": theme["title"],
                "updatedAt": updated_at,
                "variants": build_variants(theme),
            }

            export_pdf_pages(
                reader,
                theme["pageStart"],
                theme["pageEnd"],
                PDF_EXPORT_DIR / theme["pdfFile"],
            )

        overview_rows = [[theme["title"], "主題", theme["reminder"]] for theme in chapter["themes"]]
        update_chapter_overview(
            overview_db["overviews"],
            chapter["chapterCode"],
            chapter["groupName"],
            chapter["paragraph"],
            overview_rows,
            updated_at,
        )

    manifest_topics = [topic for topic in manifest.get("topics", []) if topic.get("chapterCode") not in {"j6-3-1", "j6-3-2", "j6-3-3"}]
    for chapter in chapter_definitions:
        for theme in chapter["themes"]:
            manifest_topics.append(
                {
                    "chapterCode": chapter["chapterCode"],
                    "topicNumber": theme["topicNumber"],
                    "slug": theme["slug"],
                    "title": theme["title"],
                    "pageStart": theme["pageStart"],
                    "pageEnd": theme["pageEnd"],
                    "file": theme["pdfFile"],
                }
            )
    manifest["sourcePdf"] = SOURCE_PDF.name
    manifest["count"] = len(manifest_topics)
    manifest["topics"] = sorted(manifest_topics, key=lambda item: (item["chapterCode"], item["topicNumber"]))

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(OVERVIEW_DB, overview_db)
    save_json(CHAPTER_CODE_DB, chapter_code_db)
    save_json(PDF_MANIFEST, manifest)


if __name__ == "__main__":
    main()

