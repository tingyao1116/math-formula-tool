import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


BASE_DIR = Path(__file__).resolve().parents[2]
PACKS_DIR = BASE_DIR / "program-db" / "imports" / "packs"
SOURCE_PACK = "_inspect-5A-1"
CHAPTER_CODE = "B-2"
CHAPTER_TITLE = "圓錐曲線"

TOPIC_RE = re.compile(r"主題\s*(\d+)\s*：\s*(.+)")
MARKER_RE = re.compile(r"^(範例\s*\d+|隨堂練習)\s*$")
EXPLANATION_RE = re.compile(r"【解析】|【解答】|解析：|解答：")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
EMPTY_UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]*\]\{\.underline\}")
TEXT_UNDERLINE_RE = re.compile(r"\[([^\]]+)\]\{\.underline\}")
RAW_MEDIA_RE = re.compile(
    r"\(?\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-1[\\/]+assets[\\/]+media[\\/][^)\]\s]+(?:\.(?:png|jpg|jpeg|emf|wmf))\)?",
    re.I,
)
EDITORIAL_RE = re.compile(r"【(?:康熹|龍騰)自命題】|【教冊題】")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
VECTOR_EXT_RE = re.compile(r"(?i)\.(emf|wmf)$")
DANGLING_IMAGE_TOKEN_RE = re.compile(r"(?:!\[\s*)+$")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def plain_line(line: str) -> str:
    text = str(line or "").rstrip()
    stripped = text.strip()
    if stripped.startswith("|"):
        stripped = stripped[1:].strip()
    if stripped.endswith("|"):
        stripped = stripped[:-1].strip()
    return stripped.replace("**", "").strip()


def is_decorative_line(line: str) -> bool:
    stripped = str(line or "").strip()
    if not stripped:
        return True
    return bool(DECORATIVE_RE.fullmatch(stripped))


def detect_topic(line: str) -> str | None:
    stripped = plain_line(line)
    match = TOPIC_RE.search(stripped)
    if not match:
        return None
    return f"主題{match.group(1)}：{match.group(2).strip()}"


def detect_marker(line: str) -> str | None:
    stripped = plain_line(line)
    match = MARKER_RE.fullmatch(stripped)
    if not match:
        return None
    return re.sub(r"\s+", "", match.group(1))


def parse_blocks(markdown_text: str) -> list[dict]:
    lines = markdown_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    current_topic = ""
    current_marker = ""
    buffer: list[str] = []
    blocks: list[dict] = []

    def flush():
        nonlocal buffer, current_marker
        if not current_marker:
            buffer = []
            return
        raw_lines = [line for line in buffer if not is_decorative_line(line)]
        raw_text = "\n".join(raw_lines).strip()
        if raw_text:
            blocks.append({"topic": current_topic, "marker": current_marker, "raw_text": raw_text})
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


def split_question_and_explanation(raw_text: str) -> tuple[str, str]:
    raw = str(raw_text or "")
    match = EXPLANATION_RE.search(raw)
    if not match:
        return raw, ""
    return raw[: match.start()], raw[match.end() :]


def asset_marker_path(raw_path: str) -> str:
    name = Path(str(raw_path or "").replace("\\", "/")).name
    if not name:
        return ""
    if VECTOR_EXT_RE.search(name):
        name = f"{name}.png"
    return f"program-db/imports/packs/{CHAPTER_CODE}/assets/media/{name}"


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def repl_html(match: re.Match[str]) -> str:
        path = asset_marker_path(match.group(1))
        return f"\n[圖:{path}]\n" if path else ""

    def repl_md(match: re.Match[str]) -> str:
        alt = cleanup_import_artifacts(match.group(1)).strip()
        path = asset_marker_path(match.group(2))
        parts: list[str] = []
        if alt and (re.search(r"[\u4e00-\u9fff]", alt) or any(tok in alt for tok in ("=", r"\frac", r"\sqrt"))):
            parts.append(alt)
        if path:
            parts.append(f"[圖:{path}]")
        return "\n".join(parts)

    value = HTML_IMAGE_RE.sub(repl_html, value)
    value = INLINE_IMAGE_RE.sub(repl_md, value)
    return value


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = EMPTY_UNDERLINE_RE.sub("＿＿＿＿", value)
    value = TEXT_UNDERLINE_RE.sub(r"\1", value)
    value = RAW_MEDIA_RE.sub("", value)
    value = EDITORIAL_RE.sub("", value)
    value = HTML_COMMENT_RE.sub("", value)
    value = value.replace("`", "")
    value = value.replace("\\mspace{6mu}", " ")
    value = value.replace("<br />", "\n").replace("<br/>", "\n")

    cleaned_lines: list[str] = []
    for raw_line in value.split("\n"):
        line = plain_line(raw_line)
        if not line or is_decorative_line(line):
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = cleanup_import_artifacts(value)
    value = clean_question_body(value)
    value = DANGLING_IMAGE_TOKEN_RE.sub("", value).rstrip()
    value = re.sub(r"(\[圖:[^\]]+\])\]+", r"\1", value)
    value = re.sub(r"^\]\s*\n?", "", value)
    value = re.sub(r"\n\]\s*$", "", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，、。.；;")
    if len(seed) > 36:
        seed = seed[:36].rstrip(" ：，、。.；;")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def category_from_marker(marker: str) -> str:
    return "基本" if marker.startswith("範例") else "重要"


def difficulty_from_marker(marker: str) -> str:
    return "易" if marker.startswith("範例") else "中"


def build_records(blocks: list[dict]) -> list[dict]:
    records: list[dict] = []
    for index, block in enumerate(blocks, start=1):
        question_text, explanation_text = split_question_and_explanation(block["raw_text"])
        question_text = normalize_text(question_text)
        explanation_text = normalize_text(explanation_text)
        question_text = re.sub(r"\n\[[^\]]*assets/media/[^\]]+\]\s*$", "", question_text)
        marker = block["marker"]
        section = block["topic"] or "圓錐曲線"
        if not question_text:
            if section == "主題1：拋物線" and marker == "範例1":
                question_text = "坐標平面上，下列敘述何者為真？"
            else:
                question_text = "題幹依附原始圖文，請參照原始資料。"
        explanation_text = explanation_text.replace("= 1]", "= 1")
        explanation_text = explanation_text.replace(
            "$\\frac{x^{2}}{\\frac{25}{4}}\\text{ } - \\text{ }\\frac{y^{2}}{\\frac{75}{4}}$ 1即為所求",
            "$\\frac{x^{2}}{\\frac{25}{4}}\\text{ } - \\text{ }\\frac{y^{2}}{\\frac{75}{4}}$= 1即為所求",
        )
        records.append(
            {
                "id": f"q-{CHAPTER_CODE}-{index:04d}",
                "title": rebuild_title(marker, question_text),
                "question_text": question_text,
                "answer_text": "",
                "explanation_text": explanation_text,
                "chapter_code": CHAPTER_CODE,
                "formula_id": "",
                "difficulty": difficulty_from_marker(marker),
                "question_category": category_from_marker(marker),
                "source_type": "docx_pack_markdown",
                "source_ref": "source/5A-1轉.docx",
                "source_section": section,
                "source_order": index,
                "tags": [CHAPTER_CODE, f"section:{section}", f"marker:{marker}", "source:5A-1轉.docx"],
            }
        )
    return records


def ensure_png_sidecars(asset_dir: Path):
    for file in sorted(asset_dir.iterdir()):
        if file.suffix.lower() not in {".wmf", ".emf"}:
            continue
        png_path = Path(f"{file}.png")
        if png_path.exists():
            continue
        with Image.open(file) as image:
            image.save(png_path, format="PNG")


def copy_support_files(target_root: Path):
    source_root = PACKS_DIR / SOURCE_PACK
    ensure_dir(target_root / "source")
    ensure_dir(target_root / "extracted")
    ensure_dir(target_root / "assets" / "media")
    shutil.copy2(next((source_root / "source").glob("5A-1*.docx")), target_root / "source" / "5A-1轉.docx")
    shutil.copy2(next((source_root / "extracted").glob("5A-1*.md")), target_root / "extracted" / "5A-1轉.md")
    for file in sorted((source_root / "assets" / "media").iterdir()):
        if file.is_file():
            dest = target_root / "assets" / "media" / file.name
            if dest.exists():
                continue
            shutil.copy2(file, dest)
    ensure_png_sidecars(target_root / "assets" / "media")


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for row in records:
        section = row["source_section"]
        by_section.setdefault(section, []).append(
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
            "source_ref": "source/5A-1轉.docx",
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(Counter(row["question_category"] for row in records)),
        "by_section": by_section,
    }


def build_manifest() -> dict:
    return {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "source_files": [{"path": "source/5A-1轉.docx", "role": "primary_docx"}],
        "extracted_files": [
            {"path": "extracted/5A-1轉.md", "role": "pandoc_markdown"},
            {"path": "questions.json", "role": "question_pack"},
            {"path": "preview.json", "role": "assignment_preview"},
            {"path": "review-needed.md", "role": "manual_review_notes"},
        ],
        "asset_roots": [{"path": "assets/media", "role": "pandoc_extracted_media"}],
        "status": "review_ready",
        "updated_at": datetime.now().astimezone().isoformat(),
    }


def write_review(path: Path, records: list[dict]):
    lines = ["# B-2 review notes", ""]
    lines.append(f"- 目前共 {len(records)} 題。")
    for section, count in Counter(row["source_section"] for row in records).items():
        lines.append(f"- `{section}`：{count} 題")
    lines.extend(
        [
            "",
            "- 目前網站 `B-2` 只有章節代碼，尚未建立更細的主題樹，所以這包先保留空白 `formula_id`，不強行誤掛。",
            "- 若後續網站補出 `拋物線 / 橢圓 / 雙曲線` 主題，可再依 `source_section` 快速重掛。",
            "- 建議先以前端檢查含多張圖、表格與長解析的題目版面。",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    source_root = PACKS_DIR / SOURCE_PACK
    markdown_path = next((source_root / "extracted").glob("5A-1*.md"))
    markdown_text = read_text(markdown_path)
    blocks = parse_blocks(markdown_text)
    records = build_records(blocks)

    target_root = PACKS_DIR / CHAPTER_CODE
    copy_support_files(target_root)
    write_json(target_root / "questions.json", {"chapter_code": CHAPTER_CODE, "chapter_title": CHAPTER_TITLE, "questions": records})
    write_json(target_root / "preview.json", build_preview(records))
    write_json(target_root / "manifest.json", build_manifest())
    write_review(target_root / "review-needed.md", records)
    print(f"{CHAPTER_CODE}={len(records)}")


if __name__ == "__main__":
    main()
