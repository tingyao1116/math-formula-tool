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
UNIT_RE = re.compile(r"^#\s+(單元\d+\s+.+?)\s*$", re.MULTILINE)

TOPIC_PLAN = [
    {
        "chapterCode": "s2-1-1",
        "rootId": "senior-sequence-recursion-main",
        "topicNumber": 1,
        "slug": "sequence-meaning",
        "title": "數列的意義",
        "page": 2,
        "mainThemeId": "s2-1-1-main-theme-sequence-meaning",
        "wrapperId": "s2-1-1-sequence-meaning-core",
        "summary": "先抓數列記號、通項、等差等比數列與中項判斷，再往下接規律題。",
        "branchIds": [
            "s2-1-1-sequence-recursion-core",
            "senior-sequence-notation-general-term",
            "senior-arithmetic-geometric-core",
        ],
    },
    {
        "chapterCode": "s2-1-1",
        "rootId": "senior-sequence-recursion-main",
        "topicNumber": 2,
        "slug": "recursion",
        "title": "遞迴關係",
        "page": 3,
        "mainThemeId": "s2-1-1-main-theme-recursion",
        "wrapperId": "s2-1-1-recursion-core",
        "summary": "先抓起始值、遞迴式、展開法與常見型態，再往下接應用題。",
        "branchIds": [
            "senior-sequence-recursion-first-order",
            "senior-fibonacci-sequence",
            "senior-recursion-application-hanoi",
            "senior-sequence-recursion-pattern-classification-s211",
            "senior-recursion-hanoi-proof-link-s211",
            "senior-sequence-recursion-transform-method-s211",
        ],
    },
    {
        "chapterCode": "s2-1-1",
        "rootId": "senior-sequence-recursion-main",
        "topicNumber": 3,
        "slug": "math-induction",
        "title": "數學歸納法",
        "page": 4,
        "mainThemeId": "s2-1-1-main-theme-math-induction",
        "wrapperId": "s2-1-1-math-induction-core",
        "summary": "先抓起始成立、歸納假設與推到下一步，再往下接寫法與常見失誤。",
        "branchIds": [
            "senior-math-induction-principle",
            "senior-induction-common-mistakes-s211",
            "senior-sequence-induction-template-s211",
        ],
    },
    {
        "chapterCode": "s2-1-2",
        "rootId": "senior-series-main",
        "topicNumber": 1,
        "slug": "arithmetic-geometric-series",
        "title": "等差級數與等比級數",
        "page": 6,
        "mainThemeId": "s2-1-2-main-theme-arithmetic-geometric-series",
        "wrapperId": "s2-1-2-arithmetic-geometric-series-core",
        "summary": "先分清第 n 項和前 n 項和，再整理等差級數、等比級數與利息連結。",
        "branchIds": [
            "senior-arithmetic-geometric-series",
            "senior-series-partial-sum-difference-method-s212",
            "senior-geometric-series-subtraction-trick-s212",
            "senior-series-geometric-convergence-s212",
            "senior-sequence-application-interest",
            "senior-sequence-interest-period-conversion-s211",
            "senior-sequence-sum-transform-sn-difference-s211",
        ],
    },
    {
        "chapterCode": "s2-1-2",
        "rootId": "senior-series-main",
        "topicNumber": 2,
        "slug": "series-sum-formulas",
        "title": "級數和公式",
        "page": 7,
        "mainThemeId": "s2-1-2-main-theme-series-sum-formulas",
        "wrapperId": "s2-1-2-series-sum-formulas-core",
        "summary": "先分清自然數和、平方和、立方和，再接 Sigma 建模與求和技巧。",
        "branchIds": [
            "s2-1-2-series-sigma-core",
            "senior-common-summation-formulas",
            "senior-series-induction-proofs",
            "senior-sigma-notation-conversion",
            "senior-series-sigma-modeling-workflow-s212",
            "senior-power-sums-link-square-cube-s212",
            "senior-series-telescoping-s212",
            "senior-series-index-shift-s212",
            "senior-series-weighted-sum-trick-s212",
        ],
    },
]

CHAPTER_PARAGRAPHS = {
    "s2-1-1": {
        "editable": (
            "1. 這章正式改成三個主題主軸：數列的意義、遞迴關係、數學歸納法。\n\n"
            "2. 看到題目時，先分清楚它是在考通項與規律、遞迴展開，還是歸納法證明，不要一開始就把所有公式混在一起。\n\n"
            "3. 這章建議先把數列記號和等差等比規律看穩，再進到遞迴與歸納法；後面級數才不會和這章混掉。\n\n"
            "4. 這章最容易錯的是項數與位置搞混、起始值沒看清楚，或歸納法只寫假設卻沒有真的推到下一步。"
        ),
        "original": "先把規律、起始值與證明步驟分清楚，後面的數列與級數題目會穩很多。",
    },
    "s2-1-2": {
        "editable": (
            "1. 這章正式改成兩個主題主軸：等差級數與等比級數、級數和公式。\n\n"
            "2. 看到題目時，先分清楚它是在考第 n 項還是前 n 項和，再決定要用通項、求和公式，還是常見求和型態。\n\n"
            "3. 這章建議先把等差級數與等比級數的求和想法看穩，再接自然數和、平方和、立方和與 Sigma 建模。\n\n"
            "4. 這章最容易錯的是把數列公式和級數公式混用，或看到連加就直接套錯一種求和公式。"
        ),
        "original": "先把通項和總和分開，再回頭看等差等比級數與常見求和公式，整章會清楚很多。",
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

    text = INLINE_MATH_RE.sub(repl, text)
    return text.replace("**", "").strip()


def parse_markdown_topics(markdown_text: str) -> dict[str, list[list[str]]]:
    matches = list(SECTION_RE.finditer(markdown_text))
    result: dict[str, list[list[str]]] = {}
    for idx, match in enumerate(matches):
        raw_title = match.group(1).strip()
        title = clean_title(raw_title)
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


def parse_unit_intros(markdown_text: str) -> dict[str, str]:
    matches = list(UNIT_RE.finditer(markdown_text))
    result: dict[str, str] = {}
    for idx, match in enumerate(matches):
        unit_title = match.group(1).strip()
        body_start = match.end()
        body_end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown_text)
        body = markdown_text[body_start:body_end]
        quote_lines = []
        for raw_line in body.splitlines():
            line = raw_line.strip()
            if line.startswith("> "):
                quote_lines.append(line[2:].strip())
            elif quote_lines:
                break
        result[unit_title] = " ".join(quote_lines).strip()
    return result


def split_topic_pdfs() -> list[dict]:
    reader = PdfReader(str(SOURCE_PDF))
    topics = []
    for plan in TOPIC_PLAN:
        writer = PdfWriter()
        writer.add_page(reader.pages[plan["page"] - 1])
        filename = f"{plan['chapterCode']}-topic-{plan['topicNumber']}-{plan['slug']}.pdf"
        output_path = PDF_EXPORT_DIR / filename
        with output_path.open("wb") as f:
            writer.write(f)
        topics.append(
            {
                "chapterCode": plan["chapterCode"],
                "topicNumber": plan["topicNumber"],
                "slug": plan["slug"],
                "title": plan["title"],
                "page": plan["page"],
                "file": filename,
            }
        )
    manifest = {
        "sourcePdf": str(SOURCE_PDF),
        "count": len(topics),
        "topics": topics,
    }
    PDF_MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return topics


def ensure_main_theme_topic(
    topics_by_id: dict[str, dict],
    root_topic: dict,
    plan: dict,
    modified_at: str,
) -> None:
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
            "domain": root_topic.get("domain", "代數"),
            "difficulty": root_topic.get("difficulty", "基礎"),
            "chapterRole": "主題",
            "parentId": plan["rootId"],
            "tags": [plan["chapterCode"], "主題", plan["title"]],
            "usage": [plan["summary"]],
            "examples": ["先看這一層主題整理，再往下展開原本的分支內容。"],
            "tips": ["如果題目太雜，先判斷它屬於哪個主題，再決定往哪組分支看。"],
            "notes": ["這一層是固定主軸，之後章節大綱和主題頁都以這一層為準。"],
            "mistakes": ["不要把章節根節點和主題層當成同一層。"],
            "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
            "contentTypesLocked": True,
            "mathNotationLocked": True,
            "modifiedAt": modified_at,
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
    modified_at: str,
) -> None:
    existing = topics_by_id.get(plan["wrapperId"], {})
    topic = deepcopy(existing)
    top_rows = rows[:3]
    lines = []
    for row_idx, row in enumerate(top_rows, start=1):
        lines.append({"label": f"重點{row_idx}", "values": [row[0]]})
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
            "domain": root_topic.get("domain", "代數"),
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
            "modifiedAt": modified_at,
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


def upsert_main_topic_overview(
    payload: dict,
    plan: dict,
    rows: list[list[str]],
    filename: str,
    updated_at: str,
) -> None:
    by_id = payload.setdefault("byId", {})
    by_id[plan["mainThemeId"]] = {
        "id": plan["mainThemeId"],
        "title": plan["title"],
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
                        "src": f"data/main-theme-overviews/{filename}",
                        "note": plan["title"],
                    }
                ],
            },
        ],
    }


def update_chapter_overview_paragraphs(payload: dict, updated_at: str) -> None:
    overviews = payload.setdefault("overviews", {})
    for chapter_code, paragraphs in CHAPTER_PARAGRAPHS.items():
        entry = overviews.setdefault(
            chapter_code,
            {
                "groupName": "章節重點大綱",
                "title": "章節重點大綱",
                "variants": [],
            },
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


def apply_formula_updates(markdown_topics: dict[str, list[list[str]]], updated_at: str) -> None:
    payload = load_json(FORMULA_DB)
    topics = payload.get("topics", [])
    topics_by_id = {topic["id"]: topic for topic in topics}

    root_by_id = {}
    for plan in TOPIC_PLAN:
        root_topic = topics_by_id[plan["rootId"]]
        root_by_id[plan["rootId"]] = root_topic
        rows = markdown_topics[plan["title"]]
        ensure_main_theme_topic(topics_by_id, root_topic, plan, updated_at)
        ensure_wrapper_topic(topics_by_id, root_topic, plan, rows, updated_at)

    for plan in TOPIC_PLAN:
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


def apply_main_topic_overviews(markdown_topics: dict[str, list[list[str]]], updated_at: str) -> None:
    payload = load_json(MAIN_TOPIC_DB)
    for plan in TOPIC_PLAN:
        filename = f"{plan['chapterCode']}-topic-{plan['topicNumber']}-{plan['slug']}.pdf"
        upsert_main_topic_overview(payload, plan, markdown_topics[plan["title"]], filename, updated_at)
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(payload.get("byId", {}))
    payload["meta"]["updatedAt"] = updated_at
    payload["meta"]["source"] = "data/main-theme-overviews"
    save_json(MAIN_TOPIC_DB, payload)


def apply_chapter_overview_paragraphs(updated_at: str) -> None:
    payload = load_json(CHAPTER_OVERVIEW_DB)
    update_chapter_overview_paragraphs(payload, updated_at)
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
    apply_chapter_overview_paragraphs(updated_at)
    print("Updated s2-1 main themes, overviews, and original PDFs.")


if __name__ == "__main__":
    main()

