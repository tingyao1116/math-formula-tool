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


def find_source_file(filename: str) -> Path:
    path = SOURCE_DIR / filename
    if path.exists():
        return path
    matches = list(SOURCE_DIR.glob(filename))
    if matches:
        return matches[0]
    raise FileNotFoundError(filename)


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
    donor = next(topic for topic in topic_map.values() if topic.get("chapterCode") == "j6-1-1")
    catalog = chapter_catalog[chapter_code]
    return {
        "stage": donor.get("stage", "國中"),
        "grade": donor.get("grade", "國三下"),
        "term": donor.get("term", "下學期"),
        "gradeLabel": donor.get("gradeLabel", "國三下"),
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
                    "src": f"data/main-theme-overviews/{theme['pdfFile']}",
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
    manifest = load_json(PDF_MANIFEST) if PDF_MANIFEST.exists() else {"sourcePdf": SOURCE_PDF.name, "count": 0, "topics": []}
    sections = parse_sections(SOURCE_MD.read_text(encoding="utf-8"))
    reader = PdfReader(str(SOURCE_PDF))

    chapter_code_db["catalog"]["j6-1-1"] = {
        "chapter": "二次函數",
        "section": "二次函數的基本形式與圖形",
        "domainMain": "函數與圖形",
        "domainSub": "代數",
    }
    chapter_code_db["catalog"]["j6-1-2"] = {
        "chapter": "二次函數",
        "section": "配方法、平移與最值",
        "domainMain": "函數與圖形",
        "domainSub": "代數",
    }
    chapter_code_db["catalog"]["j6-1-3"] = {
        "chapter": "二次函數",
        "section": "交點、方程式與應用",
        "domainMain": "函數與圖形",
        "domainSub": "代數",
    }

    themes = [
        {
            "chapterCode": "j6-1-1",
            "chapterRootId": "j6-1-1-main-root-basic-form-and-graph",
            "chapterTitle": "二次函數的基本形式與圖形",
            "topicNumber": 1,
            "title": "二次函數的基本形式",
            "sectionTitle": "二次函數的基本形式",
            "slug": "quadratic-basic-form",
            "pageStart": 2,
            "pageEnd": 2,
            "existingIds": [
                "j6-1-1-function-relation-and-fx",
                "j6-1-1-quadratic-definition",
                "j6-1-1-general-form-ax2-bx-c",
                "j6-1-1-linear-vs-quadratic",
                "j6-1-1-evaluate-and-domain-basic",
                "j6-1-3-parameter-a-effect",
            ],
        },
        {
            "chapterCode": "j6-1-1",
            "chapterRootId": "j6-1-1-main-root-basic-form-and-graph",
            "chapterTitle": "二次函數的基本形式與圖形",
            "topicNumber": 2,
            "title": "二次函數的圖形與對稱軸",
            "sectionTitle": "二次函數的圖形與對稱軸",
            "slug": "quadratic-graph-and-axis",
            "pageStart": 3,
            "pageEnd": 3,
            "existingIds": [
                "j6-1-2-parabola-opening-and-axis",
                "j6-1-2-table-plotting-procedure",
            ],
        },
        {
            "chapterCode": "j6-1-1",
            "chapterRootId": "j6-1-1-main-root-basic-form-and-graph",
            "chapterTitle": "二次函數的基本形式與圖形",
            "topicNumber": 3,
            "title": "頂點式與頂點意義",
            "sectionTitle": "頂點式與頂點意義",
            "slug": "vertex-form-and-meaning",
            "pageStart": 4,
            "pageEnd": 4,
            "existingIds": [
                "j6-1-2-vertex-formula",
                "j6-1-2-symmetric-points-and-y-intercept",
            ],
        },
        {
            "chapterCode": "j6-1-2",
            "chapterRootId": "j6-1-2-main-root-completing-square-and-shift",
            "chapterTitle": "配方法、平移與最值",
            "topicNumber": 1,
            "title": "配方法與一般式轉頂點式",
            "sectionTitle": "配方法與一般式轉頂點式",
            "slug": "completing-square-to-vertex-form",
            "pageStart": 5,
            "pageEnd": 5,
            "existingIds": [],
        },
        {
            "chapterCode": "j6-1-2",
            "chapterRootId": "j6-1-2-main-root-completing-square-and-shift",
            "chapterTitle": "配方法、平移與最值",
            "topicNumber": 2,
            "title": "圖形平移",
            "sectionTitle": "圖形平移",
            "slug": "graph-translation",
            "pageStart": 6,
            "pageEnd": 6,
            "existingIds": [],
        },
        {
            "chapterCode": "j6-1-2",
            "chapterRootId": "j6-1-2-main-root-completing-square-and-shift",
            "chapterTitle": "配方法、平移與最值",
            "topicNumber": 3,
            "title": "最大值、最小值與值域",
            "sectionTitle": "最大值、最小值與值域",
            "slug": "extremum-and-range",
            "pageStart": 7,
            "pageEnd": 7,
            "existingIds": [
                "j6-1-2-max-min-and-range",
            ],
        },
        {
            "chapterCode": "j6-1-3",
            "chapterRootId": "j6-1-3-main-root-intercepts-and-applications",
            "chapterTitle": "交點、方程式與應用",
            "topicNumber": 1,
            "title": "與座標軸的交點",
            "sectionTitle": "與座標軸的交點",
            "slug": "intercepts-with-axes",
            "pageStart": 8,
            "pageEnd": 8,
            "existingIds": [
                "j6-1-3-x-intercept-and-root-count",
            ],
        },
        {
            "chapterCode": "j6-1-3",
            "chapterRootId": "j6-1-3-main-root-intercepts-and-applications",
            "chapterTitle": "交點、方程式與應用",
            "topicNumber": 2,
            "title": "二次函數與一元二次方程式的關係",
            "sectionTitle": "二次函數與一元二次方程式的關係",
            "slug": "quadratic-function-and-equation-relation",
            "pageStart": 9,
            "pageEnd": 9,
            "existingIds": [],
        },
        {
            "chapterCode": "j6-1-3",
            "chapterRootId": "j6-1-3-main-root-intercepts-and-applications",
            "chapterTitle": "交點、方程式與應用",
            "topicNumber": 3,
            "title": "用判別式判斷交點情形",
            "sectionTitle": "用判別式判斷交點情形",
            "slug": "discriminant-and-intersection-cases",
            "pageStart": 10,
            "pageEnd": 10,
            "existingIds": [],
        },
        {
            "chapterCode": "j6-1-3",
            "chapterRootId": "j6-1-3-main-root-intercepts-and-applications",
            "chapterTitle": "交點、方程式與應用",
            "topicNumber": 4,
            "title": "已知交點求函數式",
            "sectionTitle": "已知交點求函數式",
            "slug": "find-function-from-intercepts",
            "pageStart": 11,
            "pageEnd": 11,
            "existingIds": [
                "j6-1-3-find-function-from-conditions",
            ],
        },
        {
            "chapterCode": "j6-1-3",
            "chapterRootId": "j6-1-3-main-root-intercepts-and-applications",
            "chapterTitle": "交點、方程式與應用",
            "topicNumber": 5,
            "title": "圖形判讀與解題提醒",
            "sectionTitle": "圖形判讀與解題提醒",
            "slug": "graph-interpretation-and-reminders",
            "pageStart": 12,
            "pageEnd": 12,
            "existingIds": [
                "j6-1-3-word-problem-optimization",
                "j6-1-3-exam-checklist-and-traps",
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
    generated_ids = (
        {theme["chapterRootId"] for theme in themes}
        | {theme["mainThemeId"] for theme in themes}
        | {theme["wrapperId"] for theme in themes}
    )
    formula_db["topics"] = [topic for topic in topics if topic["id"] not in generated_ids]
    topics = formula_db["topics"]
    topic_map = {topic["id"]: topic for topic in topics}

    root_titles = {}
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

    manifest_topics = [item for item in manifest.get("topics", []) if not str(item.get("chapterCode", "")).startswith("j6-1-")]
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
        "j6-1-1",
        "國中・國三下・二次函數的基本形式與圖形",
        "1. 這一章先抓二次函數最基本的式子、圖形和對稱軸，知道拋物線的開口、胖瘦、對稱軸和頂點在說什麼。\n\n2. 看到題目時，先分清楚它是在問式子的形式、圖形特徵，還是頂點與對稱關係。\n\n3. 這章建議先從 二次函數的基本形式 開始，再往下看圖形與頂點。",
        [
            [themes[0]["title"], "主題", build_reminder(themes[0]["rows"])],
            [themes[1]["title"], "主題", build_reminder(themes[1]["rows"])],
            [themes[2]["title"], "主題", build_reminder(themes[2]["rows"])],
        ],
        updated_at,
    )
    update_chapter_overview(
        overviews,
        "j6-1-2",
        "國中・國三下・配方法、平移與最值",
        "1. 這一章核心是把一般式整理成頂點式，再用圖形去看平移、最大最小值和值域。\n\n2. 做題時先想要不要配方，若題目在問頂點、最值或值域，通常就值得先整理成頂點式。\n\n3. 這章建議先從 配方法與一般式轉頂點式 開始，再往下看平移與最值。",
        [
            [themes[3]["title"], "主題", build_reminder(themes[3]["rows"])],
            [themes[4]["title"], "主題", build_reminder(themes[4]["rows"])],
            [themes[5]["title"], "主題", build_reminder(themes[5]["rows"])],
        ],
        updated_at,
    )
    update_chapter_overview(
        overviews,
        "j6-1-3",
        "國中・國三下・交點、方程式與應用",
        "1. 這一章把二次函數和一元二次方程式、交點、判別式和建式應用連在一起，看到題目時要先判斷是在看交點、根，還是在反求函數式。\n\n2. 若題目同時有圖形和方程式，就把交點和根互相對照；若題目給條件反求式子，就先判斷該用頂點式、交點式還是一般式。\n\n3. 這章建議先從 與座標軸的交點 開始，再往下看判別式、建式與圖形判讀。",
        [
            [themes[6]["title"], "主題", build_reminder(themes[6]["rows"])],
            [themes[7]["title"], "主題", build_reminder(themes[7]["rows"])],
            [themes[8]["title"], "主題", build_reminder(themes[8]["rows"])],
            [themes[9]["title"], "主題", build_reminder(themes[9]["rows"])],
            [themes[10]["title"], "主題", build_reminder(themes[10]["rows"])],
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

