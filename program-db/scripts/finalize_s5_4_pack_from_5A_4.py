import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


BASE_DIR = Path(__file__).resolve().parents[2]
PACKS_DIR = BASE_DIR / "program-db" / "imports" / "packs"
MEDIA_DIR = BASE_DIR / "program-db" / "assets" / "question-media"

SOURCE_PACK = "_inspect-5A-4"
CHAPTER_CODE = "s5-4"
CHAPTER_TITLE = "複數的幾何意涵"
SOURCE_REF = "source/5A-4轉.docx"
MARKER_RE = re.compile(r"\*\*(範例\d+|隨堂練習)\*\*")
TOPIC_RE = re.compile(r"\*\*主題\s*(\d+)\s*：\s*(.+?)\*\*")
SOURCE_LINE_RE = re.compile(r"^【[^】]+】$")
KEEP_SOURCE_LINE = {"【解析】", "【另解】", "【詳解】", "【證明】"}
TABLE_BORDER_RE = re.compile(r"^[+:|\-=\s]+$")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
WRAPPED_MEDIA_BLOCK_RE = re.compile(
    r"!\[(?P<alt>[\s\S]*)\]\((?P<path>\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-4[\\/]+assets[\\/]+media[\\/][^)]+)\)\{[^{}]*\}",
    re.S,
)
MD_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[([^\]]+)\]\{\.underline\}")
EMPTY_UNDERLINE_RE = re.compile(r"\[\s*[　 ]*\]\{\.underline\}")
RAW_MEDIA_RE = re.compile(
    r"\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-4[\\/]+assets[\\/]+media[\\/][^)\]\s]+",
    re.I,
)
WHITESPACE_RE = re.compile(r"[ \t]{2,}")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def clean_table_line(line: str) -> str:
    text = str(line or "").rstrip()
    stripped = text.strip()
    if TABLE_BORDER_RE.fullmatch(stripped):
        return ""
    if stripped.startswith("|"):
        stripped = stripped[1:].strip()
    if stripped.endswith("|"):
        stripped = stripped[:-1].strip()
    return stripped


def detect_topic(line: str) -> str | None:
    text = clean_table_line(line)
    match = TOPIC_RE.search(text)
    if not match:
        return None
    title = cleanup_import_artifacts(match.group(2)).strip()
    return f"主題{match.group(1)}：{title}"


def detect_marker(line: str) -> str | None:
    text = clean_table_line(line)
    match = MARKER_RE.search(text)
    if not match:
        return None
    return match.group(1)


def parse_blocks(markdown_text: str) -> list[dict]:
    lines = markdown_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    current_topic = ""
    current_marker = ""
    buffer: list[str] = []
    blocks: list[dict] = []

    def flush():
        nonlocal buffer
        if not current_marker:
            buffer = []
            return
        raw = "\n".join(buffer).strip()
        if raw:
            blocks.append({"topic": current_topic, "marker": current_marker, "raw_text": raw})
        buffer = []

    for line in lines:
        topic = detect_topic(line)
        marker = detect_marker(line)
        if topic:
            flush()
            current_topic = topic
            current_marker = ""
            continue
        if marker:
            flush()
            current_marker = marker
            buffer = []
            continue
        if current_marker:
            buffer.append(line)

    flush()
    return blocks


def normalize_asset_name(raw_path: str) -> str:
    name = Path(str(raw_path or "").replace("\\", "/")).name
    if not name:
        return ""
    suffix = Path(name).suffix.lower()
    if suffix in {".wmf", ".emf"}:
        return f"{Path(name).stem}.png"
    return name


def canonical_asset_path(raw_path: str) -> str:
    filename = normalize_asset_name(raw_path)
    if not filename:
        return ""
    return f"program-db/assets/question-media/{CHAPTER_CODE}/{filename}"


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def repl_html(match: re.Match[str]) -> str:
        path = canonical_asset_path(match.group(1))
        return f"\n[圖:{path}]\n" if path else ""

    def repl_md(match: re.Match[str]) -> str:
        alt = cleanup_import_artifacts(match.group(1)).strip()
        path = canonical_asset_path(match.group(2))
        parts: list[str] = []
        if alt and alt not in {"1", "0-01", "≒"} and "自命題" not in alt and "解析" not in alt:
            parts.append(alt)
        if path:
            parts.append(f"[圖:{path}]")
        return "\n".join(parts)

    value = HTML_IMAGE_RE.sub(repl_html, value)
    value = MD_IMAGE_RE.sub(repl_md, value)
    return value


def unwrap_wrapped_media_block(text: str) -> str:
    value = str(text or "")
    if "![【" not in value:
        return value

    def repl(match: re.Match[str]) -> str:
        alt = cleanup_import_artifacts(match.group("alt")).strip()
        path = canonical_asset_path(match.group("path"))
        parts: list[str] = []
        if alt:
            parts.append(alt)
        if path:
            parts.append(f"[圖:{path}]")
        return "\n".join(parts)

    return WRAPPED_MEDIA_BLOCK_RE.sub(repl, value)


def strip_source_lines(lines: list[str]) -> list[str]:
    output: list[str] = []
    for raw_line in lines:
        line = clean_table_line(raw_line)
        if not line:
            output.append("")
            continue
        if SOURCE_LINE_RE.fullmatch(line) and line not in KEEP_SOURCE_LINE:
            continue
        output.append(line)
    return output


def split_question_and_explanation(raw_text: str) -> tuple[str, str]:
    unwrapped_text = unwrap_wrapped_media_block(raw_text)
    lines = strip_source_lines(str(unwrapped_text or "").split("\n"))
    parsed_lines: list[str] = []
    explanation_index: int | None = None

    for line in lines:
        if "【解析】" in line and explanation_index is None:
            prefix, _, suffix = line.partition("【解析】")
            if prefix.strip():
                parsed_lines.append(prefix.strip())
            explanation_index = len(parsed_lines)
            parsed_lines.append("【解析】")
            if suffix.strip():
                parsed_lines.append(suffix.strip())
            continue
        parsed_lines.append(line)

    if explanation_index is None:
        return "\n".join(parsed_lines).strip(), ""
    question_lines = parsed_lines[:explanation_index]
    explanation_lines = parsed_lines[explanation_index:]
    return "\n".join(question_lines).strip(), "\n".join(explanation_lines).strip()


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = value.replace("[隨堂練習.]{.underline}", "")
    value = EMPTY_UNDERLINE_RE.sub("_____ ", value)
    value = UNDERLINE_RE.sub(r"\1", value)
    value = RAW_MEDIA_RE.sub("", value)
    value = value.replace("\\mspace{6mu}", " ")
    value = value.replace("\\bullet", "．")
    value = value.replace("\\|", "|")
    value = value.replace("\\<", "<")
    value = value.replace("\\>", ">")
    value = value.replace("﹐", "，")
    value = value.replace("﹒", "。")
    value = value.replace("﹖", "？")
    value = value.replace("∴ ", "∴")
    value = value.replace("∵ ", "∵")
    value = value.replace("。。", "。")
    value = value.replace("$﹒", "$。")
    value = value.replace("= \\leq", "\\leq")
    value = value.replace("故選((", "故選(")
    value = value.replace("　", " ")

    cleaned_lines: list[str] = []
    for raw_line in value.split("\n"):
        line = clean_table_line(raw_line)
        if not line:
            cleaned_lines.append("")
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = WHITESPACE_RE.sub(" ", value)
    value = re.sub(r"(?<=\d)。(?=\d)", ".", value)
    value = cleanup_import_artifacts(value)
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value).strip()
    return value


def build_title(marker: str, question_text: str) -> str:
    text = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    text = text.replace("\n", " ")
    title_seed = re.sub(r"\$[^$]*\$", "", text)
    title_seed = re.sub(r"[，﹐]{2,}", "，", title_seed)
    title_seed = re.sub(r"[。﹒]{2,}", "。", title_seed)
    title_seed = re.sub(r"[，﹐][。﹒]", "。", title_seed)
    title_seed = re.sub(r"\(\d+\)", "", title_seed)
    title_seed = re.sub(r"\s+", " ", title_seed).strip()
    snippet = title_seed[:30].rstrip("，。；：、 ")
    return clean_question_title(f"{marker}：{snippet}") if snippet else marker


def difficulty_from_marker(marker: str) -> str:
    return "易" if marker.startswith("範例") else "中"


def category_from_marker(marker: str) -> str:
    return "基本" if marker.startswith("範例") else "重要"


def assign_formula_id(section: str, question_text: str, explanation_text: str) -> str:
    text = f"{question_text}\n{explanation_text}"

    if section.startswith("主題1"):
        if any(keyword in text for keyword in ("共軛", "\\overline", "有理化", "z\\overline{z}", "z \\times \\overline{z}")):
            return "s5-4-complex-basic-branch-conjugate-rationalize"
        return "s5-4-complex-basic"

    if section.startswith("主題2"):
        if any(keyword in text for keyword in ("距離", "中點", "直線", "圓", "垂直平分", "軌跡", "|z_{1} - z_{2}|", "|z-a|")):
            return "s5-4-complex-plane-branch-distance-geometry"
        return "s5-4-complex-plane"

    if section.startswith("主題3"):
        if any(keyword in text for keyword in ("乘積", "商", "乘法", "除法", "幅角", "主幅角", "\\arg", "\\theta + \\phi", "\\theta - \\phi")):
            return "s5-4-polar-form-branch-mul-div-angle"
        return "s5-4-polar-form"

    if section.startswith("主題4"):
        if any(keyword in text for keyword in ("三角恆等式", "cos", "sin", "展開", "倍角", "降冪")):
            return "s5-4-de-moivre-branch-trig-identity-derive"
        return "s5-4-de-moivre"

    if section.startswith("主題5"):
        if any(keyword in text for keyword in ("正五邊形", "正六邊形", "等分", "等角", "圓周", "單位圓", "根的分布", "方根的分布")):
            return "s5-4-nth-roots-branch-equal-angle-distribution"
        return "s5-4-nth-roots"

    if any(keyword in text for keyword in ("共軛虛根", "共軛複數根", "實係數", "成共軛對")):
        return "s5-4-fundamental-theorem-branch-conjugate-pair"
    return "s5-4-fundamental-theorem"


def build_records(blocks: list[dict]) -> list[dict]:
    records: list[dict] = []
    for index, block in enumerate(blocks, start=1):
        question_text, explanation_text = split_question_and_explanation(block["raw_text"])
        question_text = normalize_text(question_text)
        explanation_text = normalize_text(explanation_text)
        if not question_text:
            continue
        marker = block["marker"]
        section = block["topic"] or "未分類"
        records.append(
            {
                "id": f"q-{CHAPTER_CODE}-{index:04d}",
                "title": build_title(marker, question_text),
                "question_text": question_text,
                "answer_text": "",
                "explanation_text": explanation_text,
                "chapter_code": CHAPTER_CODE,
                "formula_id": assign_formula_id(section, question_text, explanation_text),
                "difficulty": difficulty_from_marker(marker),
                "question_category": category_from_marker(marker),
                "source_type": "docx_pack_markdown",
                "source_ref": SOURCE_REF,
                "source_section": section,
                "source_order": index,
                "tags": [CHAPTER_CODE, f"section:{section}", f"marker:{marker}", "source:5A-4轉.docx"],
            }
        )
    return records


def copy_support_files(target_root: Path):
    source_root = PACKS_DIR / SOURCE_PACK
    ensure_dir(target_root / "source")
    ensure_dir(target_root / "extracted")
    shutil.copy2(source_root / "source" / "5A-4轉.docx", target_root / "source" / "5A-4轉.docx")
    shutil.copy2(source_root / "extracted" / "5A-4轉.md", target_root / "extracted" / "5A-4轉.md")


def copy_canonical_assets():
    source_root = PACKS_DIR / SOURCE_PACK / "assets" / "media"
    target_root = MEDIA_DIR / CHAPTER_CODE
    ensure_dir(target_root)
    for file in sorted(source_root.iterdir()):
        if not file.is_file():
            continue
        name_lower = file.name.lower()
        if name_lower.endswith(".wmf.png") or name_lower.endswith(".emf.png"):
            continue
        suffix = file.suffix.lower()
        if suffix in {".wmf", ".emf"}:
            converted = file.with_name(f"{file.name}.png")
            if converted.exists():
                shutil.copy2(converted, target_root / f"{file.stem}.png")
            continue
        if suffix in {".jpg", ".jpeg", ".png"}:
            shutil.copy2(file, target_root / file.name)


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for row in records:
        by_section.setdefault(row["source_section"], []).append(
            {
                "id": row["id"],
                "title": row["title"],
                "question_category": row["question_category"],
                "difficulty": row["difficulty"],
                "formula_id": row["formula_id"],
            }
        )
    return {
        "meta": {
            "chapter_code": CHAPTER_CODE,
            "source_ref": SOURCE_REF,
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(Counter(row["question_category"] for row in records)),
        "by_formula_id": dict(Counter(row["formula_id"] for row in records)),
        "by_section": by_section,
    }


def build_manifest() -> dict:
    return {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "source_files": [{"path": SOURCE_REF, "role": "primary_docx"}],
        "extracted_files": [
            {"path": "extracted/5A-4轉.md", "role": "pandoc_markdown"},
            {"path": "questions.json", "role": "question_pack"},
            {"path": "preview.json", "role": "assignment_preview"},
            {"path": "review-needed.md", "role": "manual_review_notes"},
        ],
        "asset_roots": [{"path": f"program-db/assets/question-media/{CHAPTER_CODE}", "role": "canonical_question_media"}],
        "status": "review_ready",
        "updated_at": datetime.now().astimezone().isoformat(),
    }


def write_review(path: Path, records: list[dict]):
    lines = [
        "# s5-4 review notes",
        "",
        f"- 題數：{len(records)} 題",
        "- 只收錄 `範例` 與 `隨堂練習`；主題說明文字未匯入題庫。",
        "- 向量圖 (`.wmf` / `.emf`) 已轉成正式引用的 `.png`，並統一指到 `program-db/assets/question-media/s5-4/`。",
        "- 已特別清理 Word 匯出造成的 `underline` 標記、重複題幹、以及 `_inspect-5A-4` 暫存圖片路徑。",
        "",
    ]
    for section, count in Counter(row["source_section"] for row in records).items():
        lines.append(f"- `{section}`：{count} 題")
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    source_root = PACKS_DIR / SOURCE_PACK
    markdown_text = read_text(source_root / "extracted" / "5A-4轉.md")
    blocks = parse_blocks(markdown_text)
    records = build_records(blocks)

    target_root = PACKS_DIR / CHAPTER_CODE
    ensure_dir(target_root)
    copy_support_files(target_root)
    copy_canonical_assets()
    write_json(target_root / "questions.json", {"chapter_code": CHAPTER_CODE, "chapter_title": CHAPTER_TITLE, "questions": records})
    write_json(target_root / "preview.json", build_preview(records))
    write_json(target_root / "manifest.json", build_manifest())
    write_review(target_root / "review-needed.md", records)
    print(f"{CHAPTER_CODE}={len(records)}")


if __name__ == "__main__":
    main()
