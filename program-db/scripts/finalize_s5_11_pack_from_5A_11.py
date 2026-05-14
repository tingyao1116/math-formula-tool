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

SOURCE_PACK = "_inspect-5A-11"
CHAPTER_CODE = "s5-11"
CHAPTER_TITLE = "積分的應用"
SOURCE_REF = "source/5A-11轉.docx"

MARKER_RE = re.compile(r"\*\*(隨堂練習|範例\s*\d+|範例\d+)\*\*")
UNDERLINE_MARKER_RE = re.compile(r"\[(隨堂練習)\]\{\.underline\}")
TOPIC_RE = re.compile(r"\*{2,3}\s*主題\s*(\d+)\s*：\s*(.+?)\*{2,3}")
EXPLANATION_START_RE = re.compile(r"^(【(?:解析|說明|證明)】)")
TABLE_BORDER_RE = re.compile(r"^[+:|\-=\s]+$")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
MD_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[([^\]]+)\]\{\.underline\}")
RAW_MEDIA_RE = re.compile(
    r"\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-11[\\/]+assets[\\/]+media[\\/][^)\]\s]+",
    re.I,
)
WRAPPED_MEDIA_BLOCK_RE = re.compile(
    r"!\[(?P<alt>[\s\S]*?)\]\((?P<path>\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-11[\\/]+assets[\\/]+media[\\/][^)]+)\)(?:\{[^{}]*\})?",
    re.S,
)

SPECIAL_INLINE_TEXT = {
    "image23.wmf": r"$\lim_{\max \Delta x \to 0}$",
}
SKIP_MEDIA = {"image9.wmf", "image34.wmf", "image35.wmf"}


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
    title = cleanup_import_artifacts(match.group(2)).strip("* ").strip()
    return f"主題{match.group(1)}：{title}"


def detect_marker(line: str) -> str | None:
    text = clean_table_line(line)
    if not text:
        return None
    match = MARKER_RE.search(text)
    if match:
        return re.sub(r"\s+", "", match.group(1))
    match = UNDERLINE_MARKER_RE.search(text)
    if match:
        return re.sub(r"\s+", "", match.group(1))
    return None


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


def inline_text_for_asset(raw_path: str) -> str | None:
    filename = Path(str(raw_path or "").replace("\\", "/")).name.lower()
    return SPECIAL_INLINE_TEXT.get(filename)


def should_skip_media(raw_path: str) -> bool:
    filename = Path(str(raw_path or "").replace("\\", "/")).name.lower()
    return filename in SKIP_MEDIA


def unique_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    output: list[str] = []
    for item in items:
        value = str(item or "").strip()
        if not value or value in seen:
            continue
        seen.add(value)
        output.append(value)
    return output


def image_label_from_alt(alt: str) -> str:
    text = cleanup_import_artifacts(str(alt or "")).strip()
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return ""
    if text in {"1", "【解析】", "【龍騰自命題】", "解析", "龍騰自命題"}:
        return ""
    if re.fullmatch(r"(?:Image|image)\d+", text):
        return ""
    if re.fullmatch(r"0?\d+(?:-\d+)*", text):
        return ""
    return text


def emit_media(raw_path: str) -> list[str]:
    if should_skip_media(raw_path):
        return []
    inline = inline_text_for_asset(raw_path)
    if inline is not None:
        return [inline]
    canonical = canonical_asset_path(raw_path)
    return [f"[圖:{canonical}]"] if canonical else []


def unwrap_nested_media_blocks(text: str) -> str:
    value = str(text or "")

    def repl(match: re.Match[str]) -> str:
        alt = match.group("alt")
        if "![" not in alt:
            return match.group(0)
        inner_paths = re.findall(r"!\[[^\]]*\]\(([^)]+)\)", alt)
        outer_path = match.group("path")
        parts: list[str] = []
        for raw_path in [outer_path, *inner_paths]:
            parts.extend(emit_media(raw_path))
        return "\n".join(unique_preserve_order(parts))

    return WRAPPED_MEDIA_BLOCK_RE.sub(repl, value)


def unwrap_wrapped_media_blocks(text: str) -> str:
    value = str(text or "")

    def repl(match: re.Match[str]) -> str:
        alt = match.group("alt")
        if "![" in alt:
            return match.group(0)
        raw_path = match.group("path")
        parts: list[str] = []
        label = image_label_from_alt(alt)
        if label:
            parts.append(label)
        parts.extend(emit_media(raw_path))
        return "\n".join(unique_preserve_order(parts))

    return WRAPPED_MEDIA_BLOCK_RE.sub(repl, value)


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def repl_html(match: re.Match[str]) -> str:
        parts = emit_media(match.group(1))
        return "\n".join(parts) if parts else ""

    def repl_md(match: re.Match[str]) -> str:
        alt = match.group(1)
        raw_path = match.group(2)
        parts: list[str] = []
        label = image_label_from_alt(alt)
        if label:
            parts.append(label)
        parts.extend(emit_media(raw_path))
        return "\n".join(unique_preserve_order(parts))

    value = HTML_IMAGE_RE.sub(repl_html, value)
    value = MD_IMAGE_RE.sub(repl_md, value)
    return value


def split_question_and_explanation(raw_text: str) -> tuple[str, str]:
    prepared = unwrap_nested_media_blocks(raw_text)
    prepared = unwrap_wrapped_media_blocks(prepared)
    lines = prepared.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    cleaned_lines = [clean_table_line(line) for line in lines]

    question_lines: list[str] = []
    explanation_lines: list[str] = []
    in_explanation = False

    for line in cleaned_lines:
        stripped = line.strip()
        if not stripped and not in_explanation:
            question_lines.append("")
            continue
        if EXPLANATION_START_RE.match(stripped):
            in_explanation = True
        if in_explanation:
            explanation_lines.append(stripped)
        else:
            question_lines.append(stripped)

    return "\n".join(question_lines).strip(), "\n".join(explanation_lines).strip()


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = UNDERLINE_RE.sub(r"\1", value)
    value = RAW_MEDIA_RE.sub("", value)
    value = value.replace("<!-- -->", "")
    value = value.replace("【龍騰自命題】", "")
    value = value.replace("＝", "=")
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = cleanup_import_artifacts(value)
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value).strip()
    return value


def build_title(marker: str, question_text: str) -> str:
    text = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    text = text.replace("\n", " ")
    text = re.sub(r"\$[^$]*\$", "", text)
    text = re.sub(r"\(\d+\)", "", text)
    text = re.sub(r"\s+", " ", text).strip(" ，。；：,:")
    snippet = text[:36].strip(" ，。；：,:")
    if marker == "隨堂練習" and snippet:
        return clean_question_title(f"隨堂練習：{snippet}")
    return clean_question_title(snippet or marker)


def difficulty_from_marker(marker: str) -> str:
    return "中" if marker == "隨堂練習" else "易"


def category_from_marker(marker: str) -> str:
    return "重要" if marker == "隨堂練習" else "基本"


def assign_formula_id(section: str, question_text: str, explanation_text: str) -> str:
    text = f"{question_text}\n{explanation_text}"

    if section.startswith("主題1"):
        branch_tokens = ("第一象限", "絕對值", "分成", "交於", "交點為", "y^{2}", "x = y", "兩部分")
        if any(token in text for token in branch_tokens):
            return "s5-11-area-between-curves-branch-split-interval"
        return "s5-11-area-between-curves"

    if section.startswith("主題2"):
        branch_tokens = ("繞x軸旋轉", "繞y軸旋轉", "旋轉體", "外旋轉體", "內旋轉體", "π[", "π(", "半徑")
        if any(token in text for token in branch_tokens):
            return "s5-11-solid-volume-branch-disk-vs-washer"
        return "s5-11-solid-volume"

    if section.startswith("主題3"):
        branch_tokens = ("焦耳", "牛頓", "公尺", "9.8", "彈簧", "虎克", "功", "拉上", "錨", "鍊", "抽水")
        if any(token in text for token in branch_tokens):
            return "s5-11-physics-application-branch-unit-check"
        return "s5-11-physics-application"

    return "s5-11-physics-application"


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
                "tags": [CHAPTER_CODE, f"section:{section}", f"marker:{marker}", "source:5A-11轉.docx"],
            }
        )
    return records


def dedupe_media_lines(text: str) -> str:
    lines = str(text or "").split("\n")
    output: list[str] = []
    for line in lines:
        if output and output[-1] == line and line.startswith("[圖:"):
            continue
        output.append(line)
    return "\n".join(output).strip()


def postprocess_records(records: list[dict]) -> list[dict]:
    for row in records:
        for field in ("title", "question_text", "explanation_text"):
            value = str(row[field] or "")
            value = value.replace("]]()", "]")
            value = value.replace("  ", " ")
            value = value.replace("∆x", "Δx")
            value = value.replace("$\\lim_{\\max \\Delta x \\to 0}$$", "$\\lim_{\\max \\Delta x \\to 0}$")
            value = dedupe_media_lines(value)
            value = re.sub(r"\n{3,}", "\n\n", value).strip()
            row[field] = value
    return records


def copy_support_files(target_root: Path):
    source_root = PACKS_DIR / SOURCE_PACK
    ensure_dir(target_root / "source")
    ensure_dir(target_root / "extracted")
    shutil.copy2(source_root / "source" / "5A-11轉.docx", target_root / "source" / "5A-11轉.docx")
    shutil.copy2(source_root / "extracted" / "5A-11轉.md", target_root / "extracted" / "5A-11轉.md")


def copy_canonical_assets():
    source_root = PACKS_DIR / SOURCE_PACK / "assets" / "media"
    target_root = MEDIA_DIR / CHAPTER_CODE
    ensure_dir(target_root)
    for file in sorted(source_root.iterdir()):
        if not file.is_file():
            continue
        name_lower = file.name.lower()
        if name_lower in SPECIAL_INLINE_TEXT or name_lower in SKIP_MEDIA:
            continue
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
            {"path": "extracted/5A-11轉.md", "role": "pandoc_markdown"},
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
        "# s5-11 review notes",
        "",
        f"- 總題數：{len(records)} 題。",
        "- `image23.wmf` 已人工判定為極限符號並內聯為文字。",
        "- 巢狀圖塊中的 `image9.wmf`、`image34.wmf`、`image35.wmf` 為重複公式小圖，正式題庫中不保留；主圖仍保留。",
        "- 兩曲線面積圖、旋轉體截面圖、水面與容器示意圖、物理應用示意圖均保留為正式圖片引用。",
        "- 所有正式圖片均統一指向 `program-db/assets/question-media/s5-11/`。",
        "",
    ]
    for section, count in Counter(row["source_section"] for row in records).items():
        lines.append(f"- `{section}`：{count} 題")
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    source_root = PACKS_DIR / SOURCE_PACK
    markdown_text = read_text(source_root / "extracted" / "5A-11轉.md")
    blocks = parse_blocks(markdown_text)
    records = build_records(blocks)
    records = postprocess_records(records)

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
