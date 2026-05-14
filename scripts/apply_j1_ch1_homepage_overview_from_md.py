from __future__ import annotations

import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import ListFlowable, ListItem, PageBreak, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
SOURCE_MD = ROOT / "exports" / "chapter-overviews" / "j1-ch1-homepage-source" / "j1-ch1-source-original.md"
OUTPUT_DIR = ROOT / "exports" / "chapter-overviews" / "j1-ch1-homepage-source"
OUTPUT_MD = OUTPUT_DIR / "國一上第一章_j1-1-1到j1-1-5_原文章節大綱可修改版.md"
OUTPUT_PDF = OUTPUT_DIR / "國一上第一章_j1-1-1到j1-1-5_原文章節大綱原版.pdf"
FONT_PATH = Path(r"C:\Windows\Fonts\kaiu.ttf")
OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
TZ = timezone(timedelta(hours=8))

SITE_MAPPING = {
    "j1-1-1": ["1-1"],
    "j1-1-2": ["1-2", "1-3"],
    "j1-1-3": ["1-4"],
    "j1-1-4": ["1-5"],
}


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def clean_math_content(value: str) -> str:
    math = value.strip()
    math = math.replace("\\\\", "\\")
    replacements = {
        r"\>": ">",
        r"\<": "<",
        r"\=": "=",
        r"\+": "+",
        r"\-": "-",
        r"\(": "(",
        r"\)": ")",
    }
    for old, new in replacements.items():
        math = math.replace(old, new)
    return math


def convert_inline_math(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        return rf"\({clean_math_content(match.group(1))}\)"

    return re.sub(r"\$([^$\n]+)\$", repl, text)


def strip_citations(text: str) -> str:
    match = re.search(r"\s+(\d+(?:\s*[-,]\s*\d+)*)\s*([。；，]?)$", text)
    if not match:
        return text
    start = match.start()
    punctuation = match.group(2) or ""
    return (text[:start] + punctuation).rstrip()


def normalize_text(text: str) -> str:
    value = text.strip().replace("  ", " ")
    value = value.replace("\\*", "*")
    value = value.replace("**", "")
    value = strip_citations(value)
    value = convert_inline_math(value)
    value = re.sub(r"\s+\n", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def extract_sections(text: str) -> dict[str, dict]:
    pattern = re.compile(r"^##\s+(1-\d)\s+(.+?)\n([\s\S]*?)(?=^##\s+1-\d\s+|\Z)", re.M)
    sections: dict[str, dict] = {}
    for match in pattern.finditer(text):
        code = match.group(1).strip()
        title = match.group(2).strip()
        body = match.group(3)
        sections[code] = {
            "code": code,
            "title": title,
            "focus": parse_bullets(extract_subsection(body, "重點歸納")),
            "types": parse_bullets(extract_subsection(body, "重要題型")),
        }
    return sections


def extract_subsection(body: str, heading: str) -> str:
    marker = f"### {heading}"
    start = body.find(marker)
    if start < 0:
        return ""
    start += len(marker)
    tail = body[start:]
    next_heading = tail.find("### ")
    if next_heading >= 0:
        tail = tail[:next_heading]
    return tail.strip()


def parse_bullets(text: str) -> list[str]:
    raw_lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("* "):
            raw_lines.append(normalize_text(stripped[2:]))

    items: list[str] = []
    pending_label = ""
    for line in raw_lines:
        if not line:
            continue
        label_only = re.match(r"^(.+?)：$", line)
        if label_only:
            pending_label = label_only.group(1).strip()
            continue
        if pending_label:
            items.append(f"{pending_label}：{line}")
            pending_label = ""
            continue
        items.append(line)
    if pending_label:
        items.append(pending_label)
    return items


def item_label(item: str) -> str:
    return item.split("：", 1)[0].strip()


def build_outline_labels(items: list[str]) -> list[str]:
    labels: list[str] = []
    for item in items:
        label = item_label(item)
        if "：" in item and 1 <= len(label) <= 20:
            labels.append(label)
            continue
        plain = item.rstrip("。；，")
        if 1 <= len(plain) <= 20:
            labels.append(plain)
    deduped: list[str] = []
    seen: set[str] = set()
    for label in labels:
        if label in seen:
            continue
        seen.add(label)
        deduped.append(label)
    return deduped


def build_paragraph(section_titles: list[str], focus_items: list[str], type_items: list[str]) -> str:
    lines = []
    if section_titles:
        lines.append("原文段落")
        for title in section_titles:
            lines.append(f"- {title}")
        lines.append("")
    lines.append("重點歸納")
    for label in build_outline_labels(focus_items):
        lines.append(f"- {label}")
    lines.append("")
    lines.append("重要題型")
    for label in build_outline_labels(type_items):
        lines.append(f"- {label}")
    return "\n".join(lines).strip()


def join_items(items: list[str]) -> str:
    return "\n".join(items)


def build_site_rows(section: dict) -> list[list[str]]:
    return [
        [f"{section['title']}｜重點歸納", "原文", join_items(section["focus"])],
        [f"{section['title']}｜重要題型", "原文", join_items(section["types"])],
    ]


def build_markdown(sections: dict[str, dict]) -> str:
    pages = ["# 國一上第一章｜j1-1-1 到 j1-1-5 原文章節大綱", "", "這份版本保留原文詞句，只整理成主頁與後續排版都能直接使用的格式。"]
    for code in ["1-1", "1-2", "1-3", "1-4", "1-5"]:
        section = sections[code]
        pages.extend(
            [
                "",
                "```{=openxml}",
                '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
                "```",
                "",
                f"## {code} {section['title']}",
                "",
                "### 重點歸納",
                "",
            ]
        )
        pages.extend([f"- {item}" for item in section["focus"]])
        pages.extend(["", "### 重要題型", ""])
        pages.extend([f"- {item}" for item in section["types"]])
    return "\n".join(pages).strip() + "\n"


def register_font() -> str:
    font_name = "KaiHomepageOverview"
    pdfmetrics.registerFont(TTFont(font_name, str(FONT_PATH)))
    return font_name


def escape_para(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def tex_to_pdf_text(text: str) -> str:
    value = text
    replacements = {
        r"\times": "×",
        r"\div": "÷",
        r"\pm": "±",
        r"\le": "≤",
        r"\ge": "≥",
        r"\neq": "≠",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    value = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"(\1)/(\2)", value)
    value = value.replace(r"\(", "").replace(r"\)", "")
    value = value.replace(r"\[", "").replace(r"\]", "")
    value = value.replace("\\", "")
    return value


def build_pdf(sections: dict[str, dict]) -> None:
    font_name = register_font()
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=12 * mm,
        bottomMargin=12 * mm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Heading1"],
        fontName=font_name,
        fontSize=18,
        leading=21,
        textColor=HexColor("#1f4e79"),
        alignment=TA_LEFT,
        spaceAfter=3 * mm,
    )
    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Heading2"],
        fontName=font_name,
        fontSize=11.5,
        leading=14,
        textColor=HexColor("#1f4e79"),
        spaceAfter=2 * mm,
    )
    bullet_style = ParagraphStyle(
        "BulletStyle",
        parent=styles["BodyText"],
        fontName=font_name,
        fontSize=9.3,
        leading=11.8,
        textColor=HexColor("#222222"),
        spaceAfter=0.8 * mm,
    )

    story = []
    ordered_codes = ["1-1", "1-2", "1-3", "1-4", "1-5"]
    for index, code in enumerate(ordered_codes):
        section = sections[code]
        story.append(Paragraph(escape_para(f"{code} {section['title']}"), title_style))
        story.append(Paragraph("重點歸納", subtitle_style))
        story.append(
            ListFlowable(
                [
                    ListItem(Paragraph(escape_para(tex_to_pdf_text(item)), bullet_style))
                    for item in section["focus"]
                ],
                bulletType="bullet",
                leftIndent=8,
                bulletFontName=font_name,
                bulletFontSize=8.5,
            )
        )
        story.append(Spacer(1, 1.5 * mm))
        story.append(Paragraph("重要題型", subtitle_style))
        story.append(
            ListFlowable(
                [
                    ListItem(Paragraph(escape_para(tex_to_pdf_text(item)), bullet_style))
                    for item in section["types"]
                ],
                bulletType="bullet",
                leftIndent=8,
                bulletFontName=font_name,
                bulletFontSize=8.5,
            )
        )
        if index != len(ordered_codes) - 1:
            story.append(PageBreak())
    doc.build(story)


def update_overview_db(sections: dict[str, dict]) -> None:
    payload = load_json(OVERVIEW_DB)
    overviews = payload.setdefault("overviews", {})
    updated_at = now_iso()

    for chapter_code, source_codes in SITE_MAPPING.items():
        source_sections = [sections[source_code] for source_code in source_codes]
        focus_items = [item for section in source_sections for item in section["focus"]]
        type_items = [item for section in source_sections for item in section["types"]]
        rows = [row for section in source_sections for row in build_site_rows(section)]
        paragraph = build_paragraph([section["title"] for section in source_sections], focus_items, type_items)

        entry = overviews.get(chapter_code, {})
        entry["updatedAt"] = updated_at
        entry["variants"] = [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {"type": "paragraph", "text": paragraph},
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": rows,
                    },
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {"type": "paragraph", "text": paragraph},
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": rows,
                    },
                ],
            },
        ]
        overviews[chapter_code] = entry

    save_json(OVERVIEW_DB, payload)


def main() -> None:
    text = SOURCE_MD.read_text(encoding="utf-8")
    sections = extract_sections(text)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_MD.write_text(build_markdown(sections), encoding="utf-8")
    build_pdf(sections)
    update_overview_db(sections)
    print("Updated chapter overview DB and exports for j1 first chapter.")


if __name__ == "__main__":
    main()
