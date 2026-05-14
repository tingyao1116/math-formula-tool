from __future__ import annotations

import json
import re
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
CHAPTER_OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"

SOURCE_MD = ROOT / "exports" / "s2-source" / "s2-readable.md"
SOURCE_PDF = ROOT / "exports" / "s2-source" / "s2-readable-paged.pdf"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "second-volume-topic-pdfs.json"

TZ = timezone(timedelta(hours=8))
TITLE_PREFIX_RE = re.compile(r"^主題\s*\d+\s*：\s*")
INLINE_MATH_RE = re.compile(r"\$(.+?)\$")
SECTION_RE = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)

TOPIC_PLAN = [
    {
        "chapterCode": "s2-4-1",
        "rootId": "senior-trigonometric-ratios-main",
        "topicNumber": 1,
        "slug": "directed-angle",
        "title": "有向角",
        "page": 9,
        "mainThemeId": "s2-4-1-main-theme-directed-angle",
        "wrapperId": "s2-4-1-directed-angle-core",
        "summary": "先抓同終邊角、標準位置角與象限，再往下接角度整理與判號。",
        "branchIds": [
            "senior-directed-angle-quadrant-signs",
        ],
    },
    {
        "chapterCode": "s2-4-1",
        "rootId": "senior-trigonometric-ratios-main",
        "topicNumber": 2,
        "slug": "acute-trig-definition",
        "title": "銳角三角函數的定義",
        "page": 10,
        "mainThemeId": "s2-4-1-main-theme-acute-trig-definition",
        "wrapperId": "s2-4-1-acute-trig-definition-core",
        "summary": "先分清對邊、鄰邊、斜邊，再往下接六個三角比與特殊角。",
        "branchIds": [
            "s2-4-1-trigonometric-ratio-core",
            "senior-right-triangle-trig-definition",
            "senior-special-right-triangles-values",
        ],
    },
    {
        "chapterCode": "s2-4-1",
        "rootId": "senior-trigonometric-ratios-main",
        "topicNumber": 3,
        "slug": "general-angle-trig-definition",
        "title": "廣義角三角函數的定義",
        "page": 11,
        "mainThemeId": "s2-4-1-main-theme-general-angle-trig-definition",
        "wrapperId": "s2-4-1-general-angle-trig-definition-core",
        "summary": "先抓座標定義、單位圓與象限判號，再往下接參考角與軸上特殊角。",
        "branchIds": [
            "senior-unit-circle-coordinate-definition",
            "senior-trig-reference-angle-sign-workflow-s241",
            "senior-trig-quadrantal-conversion-rules-s241",
        ],
    },
    {
        "chapterCode": "s2-4-1",
        "rootId": "senior-trigonometric-ratios-main",
        "topicNumber": 4,
        "slug": "polar-coordinate",
        "title": "極座標",
        "page": 12,
        "mainThemeId": "s2-4-1-main-theme-polar-coordinate",
        "wrapperId": "s2-4-1-polar-coordinate-core",
        "summary": "先抓複數極式、模長與幅角，再往下接直角式和極式的互換。",
        "branchIds": [],
    },
    {
        "chapterCode": "s2-4-1",
        "rootId": "senior-trigonometric-ratios-main",
        "topicNumber": 5,
        "slug": "trig-identities",
        "title": "三角關係式",
        "page": 13,
        "mainThemeId": "s2-4-1-main-theme-trig-identities",
        "wrapperId": "s2-4-1-trig-identities-core",
        "summary": "先抓倒數、商數與平方關係，再往下接換角、化簡與基礎方程。",
        "branchIds": [
            "senior-trig-identities-and-transform-rules",
            "senior-trig-ratio-reduction-formulas-s241",
            "senior-trig-identity-solving-s241",
        ],
    },
    {
        "chapterCode": "s2-4-2",
        "rootId": "senior-sine-cosine-laws-main",
        "topicNumber": 1,
        "slug": "triangle-area-formulas",
        "title": "三角形的面積公式",
        "page": 15,
        "mainThemeId": "s2-4-2-main-theme-triangle-area-formulas",
        "wrapperId": "s2-4-2-triangle-area-formulas-core",
        "summary": "先抓夾角面積、海龍公式與半周長，再往下接內外接圓半徑關係。",
        "branchIds": [
            "senior-triangle-area-formulas-extended",
            "senior-heron-proof-and-usage",
            "senior-triangle-radius-area-relations-s242",
            "senior-triangle-half-angle-by-sides-s242",
            "senior-triangle-inradius-altitude-reciprocal-s242",
        ],
    },
    {
        "chapterCode": "s2-4-2",
        "rootId": "senior-sine-cosine-laws-main",
        "topicNumber": 2,
        "slug": "law-of-sines",
        "title": "正弦定理",
        "page": 16,
        "mainThemeId": "s2-4-2-main-theme-law-of-sines",
        "wrapperId": "s2-4-2-law-of-sines-core",
        "summary": "先抓邊角對應與比例式，再往下接兩解情況與定理選用。",
        "branchIds": [
            "s2-4-2-sine-cosine-law-core",
            "senior-law-of-sines-forms",
            "senior-ssa-ambiguous-case",
            "senior-sine-cosine-law-selection-s242",
        ],
    },
    {
        "chapterCode": "s2-4-2",
        "rootId": "senior-sine-cosine-laws-main",
        "topicNumber": 3,
        "slug": "law-of-cosines",
        "title": "餘弦定理",
        "page": 17,
        "mainThemeId": "s2-4-2-main-theme-law-of-cosines",
        "wrapperId": "s2-4-2-law-of-cosines-core",
        "summary": "先抓夾角求邊與三邊求角，再往下接角邊大小判斷。",
        "branchIds": [
            "senior-law-of-cosines-forms",
        ],
    },
    {
        "chapterCode": "s2-4-2",
        "rootId": "senior-sine-cosine-laws-main",
        "topicNumber": 4,
        "slug": "triangle-side-angle-relations",
        "title": "三角形的邊角關係",
        "page": 18,
        "mainThemeId": "s2-4-2-main-theme-triangle-side-angle-relations",
        "wrapperId": "s2-4-2-triangle-side-angle-relations-core",
        "summary": "先抓投影、中線與角平分線，再往下接常見分線長與幾何延伸。",
        "branchIds": [
            "senior-median-anglebisector-length",
        ],
    },
    {
        "chapterCode": "s2-4-3",
        "rootId": "s2-4-3-triangle-measurement-core",
        "topicNumber": 1,
        "slug": "triangle-measurement",
        "title": "三角測量",
        "page": 19,
        "mainThemeId": "s2-4-3-main-theme-triangle-measurement",
        "wrapperId": "s2-4-3-triangle-measurement-wrapper",
        "summary": "先畫圖、標方向與已知量，再決定是用直角三角比還是正餘弦定理。",
        "branchIds": [
            "senior-trig-measurement-modeling",
            "senior-triangle-surveying-applications",
        ],
    },
]

CHAPTER_PARAGRAPHS = {
    "s2-4-1": {
        "editable": (
            "1. 這章正式改成五個主題主軸：有向角、銳角三角函數的定義、廣義角三角函數的定義、極座標、三角關係式。\n\n"
            "2. 看到題目時，先分清楚它是在考角度整理、三角比定義、單位圓判號，還是恆等式化簡。\n\n"
            "3. 這章建議先把角度與象限觀念看穩，再進到銳角與廣義角定義，最後再整理極式與三角關係式。\n\n"
            "4. 這章最容易錯的是角度範圍沒整理、象限判號看反，或把定義、化簡與方程混成同一件事。 "
        ),
        "original": "先把角度、象限和三角比定義分清楚，再往下看單位圓、極式與恆等式會比較穩。",
    },
    "s2-4-2": {
        "editable": (
            "1. 這章正式改成四個主題主軸：三角形的面積公式、正弦定理、餘弦定理、三角形的邊角關係。\n\n"
            "2. 看到題目時，先判斷已知的是邊、角、面積還是分線，再決定要用面積公式、正弦定理或餘弦定理。\n\n"
            "3. 這章建議先把面積公式和半周長看穩，再整理正弦定理與餘弦定理的選用，最後再接邊角關係和特殊分線。\n\n"
            "4. 這章最容易錯的是邊角對應抓錯、兩解情況沒檢查，或明明知道三邊卻還硬用正弦定理。"
        ),
        "original": "先把面積、正弦定理和餘弦定理分開，再回頭整理邊角關係，整章會更清楚。",
    },
    "s2-4-3": {
        "editable": (
            "1. 這章正式改成一個主題主軸：三角測量。\n\n"
            "2. 看到題目時，第一步永遠先畫圖、標方向、標角度，再決定是用直角三角比還是正餘弦定理。\n\n"
            "3. 這章真正的核心不是公式多，而是建模要穩；仰角、俯角、方位角和高差都要先轉成圖上的關係。\n\n"
            "4. 這章最容易錯的是沒有先畫圖、把方位角看反，或單位沒統一就開始代數值。"
        ),
        "original": "先把圖畫對，再決定用哪條三角關係；三角測量最怕的是建模方向錯，不是算式太難。",
    },
}


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def clean_title(title: str) -> str:
    return TITLE_PREFIX_RE.sub("", title.strip())


def to_tex_text(value: str) -> str:
    escaped = value.replace("\\", r"\\").replace("{", r"\{").replace("}", r"\}")
    return rf"\text{{{escaped}}}"


def convert_inline_math(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        return r"\(" + match.group(1).strip() + r"\)"

    return INLINE_MATH_RE.sub(repl, text).replace("**", "").strip()


def parse_markdown_topics(markdown_text: str) -> dict[str, list[list[str]]]:
    matches = list(SECTION_RE.finditer(markdown_text))
    result: dict[str, list[list[str]]] = {}
    for idx, match in enumerate(matches):
        title = clean_title(match.group(1).strip())
        body_start = match.end()
        body_end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown_text)
        body = markdown_text[body_start:body_end]
        rows: list[list[str]] = []
        for raw_line in body.splitlines():
            line = raw_line.strip()
            if not line.startswith("- "):
                continue
            item = line[2:].strip()
            bold_match = re.match(r"\*\*(.+?)\*\*：(.*)", item)
            if bold_match:
                key = bold_match.group(1).strip()
                value = convert_inline_math(bold_match.group(2).strip())
            else:
                parts = item.split("：", 1)
                key = parts[0].strip()
                value = convert_inline_math(parts[1].strip() if len(parts) > 1 else "")
            rows.append([key, value])
        result[title] = rows
    return result


def split_topic_pdfs() -> None:
    reader = PdfReader(str(SOURCE_PDF))
    new_topics = []
    for plan in TOPIC_PLAN:
        writer = PdfWriter()
        writer.add_page(reader.pages[plan["page"] - 1])
        filename = f"{plan['chapterCode']}-topic-{plan['topicNumber']}-{plan['slug']}.pdf"
        output_path = PDF_EXPORT_DIR / filename
        with output_path.open("wb") as f:
            writer.write(f)
        new_topics.append(
            {
                "chapterCode": plan["chapterCode"],
                "topicNumber": plan["topicNumber"],
                "slug": plan["slug"],
                "title": plan["title"],
                "page": plan["page"],
                "file": filename,
            }
        )

    manifest = {"sourcePdf": str(SOURCE_PDF), "count": 0, "topics": []}
    if PDF_MANIFEST.exists():
        manifest = load_json(PDF_MANIFEST)
        if not isinstance(manifest.get("topics"), list):
            manifest["topics"] = []
    handled_codes = {plan["chapterCode"] for plan in TOPIC_PLAN}
    kept = [item for item in manifest.get("topics", []) if item.get("chapterCode") not in handled_codes]
    merged = kept + new_topics
    merged.sort(key=lambda item: (item.get("page") is None, item.get("page") or 0, item.get("file", "")))
    manifest["topics"] = merged
    manifest["count"] = len(merged)
    manifest["sourcePdf"] = str(SOURCE_PDF)
    save_json(PDF_MANIFEST, manifest)


def ensure_main_theme_topic(topics_by_id: dict[str, dict], root_topic: dict, plan: dict, updated_at: str) -> None:
    existing = topics_by_id.get(plan["mainThemeId"], {})
    topic = deepcopy(existing)
    topic.update(
        {
            "id": plan["mainThemeId"],
            "title": plan["title"],
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "定位", "values": [to_tex_text(plan["title"])]},
                    {"label": "摘要", "values": [to_tex_text(plan["summary"])]},
                ],
            },
            "stage": root_topic.get("stage", "高中"),
            "grade": root_topic.get("grade", "高一"),
            "term": root_topic.get("term", "下學期"),
            "chapter": root_topic.get("chapter", root_topic.get("title", "")),
            "domain": root_topic.get("domain", root_topic.get("domainMain", "數學")),
            "difficulty": root_topic.get("difficulty", "基礎"),
            "chapterRole": "主題",
            "parentId": plan["rootId"],
            "tags": [plan["chapterCode"], "主題", plan["title"]],
            "usage": [plan["summary"]],
            "examples": ["先看這一層主題整理，再往下展開原本的分支內容。"],
            "tips": ["如果題目太雜，先判斷它屬於哪個主題，再決定往哪組分支看。"],
            "notes": ["這一層是固定主軸，之後章節大綱和主題頁都會先看這裡。"],
            "mistakes": ["不要把章節根節點和主題層當成同一層。"],
            "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
            "contentTypesLocked": True,
            "mathNotationLocked": True,
            "modifiedAt": updated_at,
            "chapter_code": plan["chapterCode"],
            "chapterCode": plan["chapterCode"],
            "gradeLabel": "高一下",
            "manualOrder": plan["topicNumber"],
            "orderIndex": plan["topicNumber"],
        }
    )
    topics_by_id[plan["mainThemeId"]] = topic


def ensure_wrapper_topic(
    topics_by_id: dict[str, dict],
    root_topic: dict,
    plan: dict,
    rows: list[list[str]],
    updated_at: str,
) -> None:
    existing = topics_by_id.get(plan["wrapperId"], {})
    topic = deepcopy(existing)
    top_rows = rows[:3]
    lines = [{"label": f"重點{idx}", "values": [row[0]]} for idx, row in enumerate(top_rows, start=1)]
    if not lines:
        lines = [{"label": "整理", "values": [to_tex_text(plan["summary"])]}]
    topic.update(
        {
            "id": plan["wrapperId"],
            "title": plan["title"],
            "formula": {"type": "labeled-lines", "lines": lines},
            "stage": root_topic.get("stage", "高中"),
            "grade": root_topic.get("grade", "高一"),
            "term": root_topic.get("term", "下學期"),
            "chapter": root_topic.get("chapter", root_topic.get("title", "")),
            "domain": root_topic.get("domain", root_topic.get("domainMain", "數學")),
            "difficulty": root_topic.get("difficulty", "基礎"),
            "chapterRole": "主題",
            "parentId": plan["mainThemeId"],
            "contentTypes": ["公式", "定義", "題型", "使用技巧", "注意事項", "常見錯誤"],
            "contentTypesLocked": True,
            "tags": [plan["chapterCode"], plan["title"], "重點整理"],
            "usage": [plan["summary"]],
            "examples": [],
            "tips": ["先看主題整理，再往下接既有分支。"],
            "notes": ["來源：高一下全重點_易讀版分頁版.docx（主題整理匯入）"],
            "mistakes": ["不要跳過主題整理就直接往下看分支。"],
            "mathNotationLocked": True,
            "modifiedAt": updated_at,
            "relatedChapters": [],
            "relatedTopicIds": [],
            "chapter_code": plan["chapterCode"],
            "gradeLabel": "高一下",
            "chapterCode": plan["chapterCode"],
            "section": root_topic.get("chapter", root_topic.get("title", "")),
            "domainSub": root_topic.get("domainSub", ""),
            "isBranch": True,
            "stageOrder": root_topic.get("stageOrder", 2),
            "gradeOrder": root_topic.get("gradeOrder", 4),
            "termOrder": root_topic.get("termOrder", 2),
            "chapterOrder": root_topic.get("chapterOrder", 1),
            "manualOrder": plan["topicNumber"] * 100,
            "orderIndex": 1,
        }
    )
    topics_by_id[plan["wrapperId"]] = topic


def apply_formula_updates(markdown_topics: dict[str, list[list[str]]], updated_at: str) -> None:
    payload = load_json(FORMULA_DB)
    topics = payload.get("topics", [])
    topics_by_id = {topic["id"]: topic for topic in topics}

    # Fix roots first so later branch moves can safely point across chapters.
    triangle_measurement_root = topics_by_id["s2-4-3-triangle-measurement-core"]
    triangle_measurement_root["chapter"] = "三角測量"
    triangle_measurement_root["chapterCode"] = "s2-4-3"
    triangle_measurement_root["chapter_code"] = "s2-4-3"
    triangle_measurement_root["modifiedAt"] = updated_at

    for plan in TOPIC_PLAN:
        root_topic = topics_by_id[plan["rootId"]]
        rows = markdown_topics[plan["title"]]
        ensure_main_theme_topic(topics_by_id, root_topic, plan, updated_at)
        ensure_wrapper_topic(topics_by_id, root_topic, plan, rows, updated_at)
        for order, branch_id in enumerate(plan["branchIds"], start=2):
            branch = topics_by_id[branch_id]
            branch["parentId"] = plan["wrapperId"]
            branch["chapterCode"] = plan["chapterCode"]
            branch["chapter_code"] = plan["chapterCode"]
            branch["modifiedAt"] = updated_at
            branch["orderIndex"] = order

    payload["topics"] = list(topics_by_id.values())
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    save_json(FORMULA_DB, payload)


def upsert_main_topic_overview(payload: dict, plan: dict, rows: list[list[str]], filename: str, updated_at: str) -> None:
    by_id = payload.setdefault("byId", {})
    by_id[plan["mainThemeId"]] = {
        "id": plan["mainThemeId"],
        "title": plan["title"],
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [{"type": "table", "headers": ["重點", "整理"], "rows": rows}],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "pdf-page",
                        "src": f"exports/main-theme-overviews/{filename}",
                        "note": plan["title"],
                    }
                ],
            },
        ],
    }


def apply_main_topic_overviews(markdown_topics: dict[str, list[list[str]]], updated_at: str) -> None:
    payload = load_json(MAIN_TOPIC_DB)
    for plan in TOPIC_PLAN:
        filename = f"{plan['chapterCode']}-topic-{plan['topicNumber']}-{plan['slug']}.pdf"
        upsert_main_topic_overview(payload, plan, markdown_topics[plan["title"]], filename, updated_at)
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(payload.get("byId", {}))
    payload["meta"]["updatedAt"] = updated_at
    payload["meta"]["source"] = "exports/main-theme-overviews"
    save_json(MAIN_TOPIC_DB, payload)


def update_chapter_overview_paragraphs(updated_at: str) -> None:
    payload = load_json(CHAPTER_OVERVIEW_DB)
    overviews = payload.setdefault("overviews", {})
    for chapter_code, paragraphs in CHAPTER_PARAGRAPHS.items():
        entry = overviews.setdefault(
            chapter_code,
            {"groupName": "章節重點大綱", "title": "章節重點大綱", "variants": []},
        )
        entry["updatedAt"] = updated_at
        variants = entry.setdefault("variants", [])
        for variant_id, label in [("editable", "可修改版"), ("original", "原稿版")]:
            variant = next((v for v in variants if v.get("id") == variant_id), None)
            if variant is None:
                variant = {"id": variant_id, "label": label, "sections": []}
                variants.append(variant)
            sections = variant.setdefault("sections", [])
            paragraph = next((s for s in sections if s.get("type") == "paragraph"), None)
            if paragraph is None:
                sections.insert(0, {"type": "paragraph", "text": paragraphs[variant_id]})
            else:
                paragraph["text"] = paragraphs[variant_id]
    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = updated_at
    save_json(CHAPTER_OVERVIEW_DB, payload)


def main() -> None:
    markdown_text = SOURCE_MD.read_text(encoding="utf-8")
    markdown_topics = parse_markdown_topics(markdown_text)
    missing = [plan["title"] for plan in TOPIC_PLAN if plan["title"] not in markdown_topics]
    if missing:
        raise SystemExit(f"Missing topic sections in markdown: {missing}")

    PDF_EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    split_topic_pdfs()
    updated_at = now_iso()
    apply_formula_updates(markdown_topics, updated_at)
    apply_main_topic_overviews(markdown_topics, updated_at)
    update_chapter_overview_paragraphs(updated_at)
    print("Updated s2-4 main themes, overviews, and original PDFs.")


if __name__ == "__main__":
    main()
