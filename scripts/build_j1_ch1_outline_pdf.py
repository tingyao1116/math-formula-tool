from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import ListFlowable, ListItem, PageBreak, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(r"C:\codex資料夾\數學公式使用工具\exports\chapter-overviews\j1-ch1-outline-pages")
SOURCE = ROOT / "國一上第一章_j1-1-1到j1-1-5_章節大綱可修改版.md"
OUTPUT = ROOT / "國一上第一章_j1-1-1到j1-1-5_章節大綱原版.pdf"
FONT_PATH = Path(r"C:\Windows\Fonts\kaiu.ttf")


def register_font() -> str:
    font_name = "KaiOutline"
    pdfmetrics.registerFont(TTFont(font_name, str(FONT_PATH)))
    return font_name


def simplify_math(text: str) -> str:
    text = text.replace("$", "")
    text = text.replace(r"\times", "×")
    text = text.replace(r"\le", "≤")
    text = text.replace(r"\ge", "≥")
    text = text.replace(r"\pm", "±")

    def frac_replace(match: re.Match[str]) -> str:
        numerator = match.group(1)
        denominator = match.group(2)
        return f"({numerator})/({denominator})"

    text = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", frac_replace, text)
    return text


def parse_sections(text: str) -> list[tuple[str, list[str]]]:
    sections: list[tuple[str, list[str]]] = []
    pattern = re.compile(r"^##\s+(.+?)\n([\s\S]*?)(?=^##\s+|\Z)", re.M)

    for match in pattern.finditer(text):
      title = match.group(1).strip()
      body = match.group(2)
      bullets = []
      for line in body.splitlines():
          stripped = line.strip()
          if stripped.startswith("- "):
              bullets.append(simplify_math(stripped[2:].strip()))
      if bullets:
          sections.append((title, bullets))

    return sections


def build_pdf(sections: list[tuple[str, list[str]]], font_name: str) -> None:
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=15 * mm,
        bottomMargin=14 * mm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ChapterTitle",
        parent=styles["Heading1"],
        fontName=font_name,
        fontSize=20,
        leading=24,
        textColor=HexColor("#1f4e79"),
        spaceAfter=5 * mm,
        alignment=TA_LEFT,
    )
    subtitle_style = ParagraphStyle(
        "SectionLabel",
        parent=styles["Heading2"],
        fontName=font_name,
        fontSize=12.5,
        leading=15,
        textColor=HexColor("#1f4e79"),
        spaceAfter=3 * mm,
    )
    bullet_style = ParagraphStyle(
        "BulletBody",
        parent=styles["BodyText"],
        fontName=font_name,
        fontSize=10.8,
        leading=14.2,
        textColor=HexColor("#222222"),
        leftIndent=0,
        firstLineIndent=0,
        spaceAfter=1.4 * mm,
    )

    story = []

    for index, (title, bullets) in enumerate(sections):
        story.append(Paragraph(title, title_style))
        story.append(Paragraph("章節大綱", subtitle_style))
        items = [
            ListItem(Paragraph(item.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"), bullet_style))
            for item in bullets
        ]
        story.append(
            ListFlowable(
                items,
                bulletType="bullet",
                start="circle",
                bulletFontName=font_name,
                bulletFontSize=10,
                leftIndent=10,
            )
        )
        story.append(Spacer(1, 2 * mm))
        if index != len(sections) - 1:
            story.append(PageBreak())

    doc.build(story)


def main() -> None:
    text = SOURCE.read_text(encoding="utf-8")
    sections = parse_sections(text)
    font_name = register_font()
    build_pdf(sections, font_name)


if __name__ == "__main__":
    main()
