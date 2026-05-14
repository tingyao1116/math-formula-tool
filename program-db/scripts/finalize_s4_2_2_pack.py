import json
import re
import shutil
from collections import Counter
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


SOURCE_PACK = "_inspect-4A-6"
CHAPTER_CODE = "s4-2-2"
CHAPTER_TITLE = "空間直線方程式"
SOURCE_DOC_NAME = "4A-6轉.docx"
EXTRACTED_MD_NAME = "4A-6轉.md"

TOPIC_RE = re.compile(r"^主題\s*(\d+)\s*[：:]\s*(.+)$")
MARKER_RE = re.compile(r"^(範例\s*\d+|隨堂練習)\s*$")
EXPLANATION_RE = re.compile(r"(【解析】|【解】|【解答】|解析：|解：|解答：)")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]*\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
RAW_INSPECT_MEDIA_RE = re.compile(
    r"\(?\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-4A-6[\\/]+assets[\\/]+media[\\/][^)\]\s]+(?:\.(?:png|jpg|jpeg|emf|wmf))\)?",
    re.I,
)
EDITORIAL_RE = re.compile(r"【龍騰自命題】|【觀念補充】|【進階補充】")
MATRIX_ENV_RE = re.compile(r"\\begin\{([a-z]*matrix|array)\}(.*?)\\end\{\1\}", re.S)
SECTION_FALLBACK = "主題1：直線方程式"


def write_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def normalize_asset_path(raw: str) -> str:
    text = str(raw or "").strip().replace("\\", "/")
    if not text:
        return ""
    if text.startswith("./"):
        text = text[2:]
    marker = text.lower().find("program-db/")
    if marker >= 0:
        text = text[marker:]
    text = text.replace(f"/{SOURCE_PACK}/", f"/{CHAPTER_CODE}/")
    text = re.sub(r"(?i)\.(emf|wmf)(?:\.png)+$", r".\1.png", text)
    text = re.sub(r"(?i)\.png(?:\.png)+$", ".png", text)
    if VECTOR_PATH_RE.search(text):
        text = VECTOR_PATH_RE.sub(lambda match: f"{match.group(0)}.png", text)
    return text


def ensure_png_sidecars(asset_dir: Path) -> int:
    created = 0
    for path in sorted(asset_dir.iterdir()):
        if path.suffix.lower() not in {".emf", ".wmf"}:
            continue
        png_path = Path(f"{path}.png")
        if png_path.exists():
            continue
        with Image.open(path) as image:
            image.save(png_path, format="PNG")
        created += 1
    return created


def keep_alt_text(alt_text: str) -> bool:
    text = cleanup_import_artifacts(alt_text).strip()
    if not text:
        return False
    if re.search(r"[\u4e00-\u9fff]", text):
        return True
    if any(token in text for token in (r"\frac", r"\sqrt", r"\overline", r"\angle", "=")):
        return True
    return len(text) >= 10


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def repl_html(match: re.Match[str]) -> str:
        normalized = normalize_asset_path(match.group(1))
        return f"\n[圖:{normalized}]\n" if normalized else ""

    def repl_markdown(match: re.Match[str]) -> str:
        alt = cleanup_import_artifacts(match.group(1))
        normalized = normalize_asset_path(match.group(2))
        parts: list[str] = []
        if keep_alt_text(alt):
            parts.append(alt)
        if normalized:
            parts.append(f"[圖:{normalized}]")
        return "\n".join(parts)

    value = HTML_IMAGE_RE.sub(repl_html, value)
    value = INLINE_IMAGE_RE.sub(repl_markdown, value)
    return value


def plain_line(line: str) -> str:
    value = str(line or "").rstrip()
    stripped = value.strip()
    if stripped.startswith("|") and stripped.endswith("|"):
        stripped = stripped[1:-1].strip()
    return stripped.replace("**", "").strip()


def is_decorative_line(line: str) -> bool:
    stripped = str(line or "").strip()
    if not stripped:
        return True
    if DECORATIVE_RE.fullmatch(stripped):
        return True
    if stripped in {"**", "*\\*"}:
        return True
    return False


def should_drop_line(line: str) -> bool:
    stripped = str(line or "").strip()
    if not stripped:
        return True
    if stripped in {"![", "]![", "](", "![1", "\\", "\\\\", "]", "["}:
        return True
    return False


def detect_topic(line: str) -> str | None:
    stripped = plain_line(line)
    match = TOPIC_RE.fullmatch(stripped)
    if not match:
        return None
    return f"主題{match.group(1)}：{match.group(2).strip()}"


def detect_standard_marker(line: str) -> str | None:
    stripped = plain_line(line)
    match = MARKER_RE.fullmatch(stripped)
    if not match:
        return None
    return re.sub(r"\s+", "", match.group(1))


def parse_standard_blocks(markdown_text: str) -> list[dict]:
    lines = markdown_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    current_section = ""
    current_marker = ""
    buffer: list[str] = []
    blocks: list[dict] = []

    def flush():
        nonlocal buffer, current_marker
        if not current_marker:
            buffer = []
            return
        raw_lines = [line for line in buffer if not is_decorative_line(line)]
        blocks.append(
            {
                "marker": current_marker,
                "section": current_section or SECTION_FALLBACK,
                "raw_text": "\n".join(raw_lines).strip(),
            }
        )
        buffer = []

    for line in lines:
        topic = detect_topic(line)
        marker = detect_standard_marker(line)
        stripped = plain_line(line)

        if topic:
            flush()
            current_section = topic
            current_marker = ""
            continue

        if marker and EXPLANATION_RE.search(stripped):
            marker = None

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
    return raw[: match.start()], raw[match.start() :]


def repair_matrix_block(match: re.Match[str]) -> str:
    env = match.group(1)
    body = match.group(2)
    body = re.sub(r"(?<!\\)\\(?![A-Za-z])", r"\\\\", body)
    body = re.sub(r"\s{2,}", " ", body)
    return f"\\begin{{{env}}}{body}\\end{{{env}}}"


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = UNDERLINE_RE.sub("＿＿＿＿＿＿", value)
    value = HTML_COMMENT_RE.sub("", value)
    value = RAW_INSPECT_MEDIA_RE.sub("", value)
    value = EDITORIAL_RE.sub("", value)
    value = value.replace("`", "")
    value = value.replace("\\mspace{6mu}", " ")
    value = value.replace("\\times", "×")
    value = value.replace("\\cdot", "·")
    value = value.replace("\\therefore", "∴")
    value = value.replace("\\because", "∵")
    value = value.replace("\\Rightarrow", "⇒")
    value = value.replace("\\Leftrightarrow", "⇔")
    value = value.replace("\\left(", "(").replace("\\right)", ")")
    value = value.replace("\\left[", "[").replace("\\right]", "]")
    value = value.replace("\\left\\{", "{").replace("\\right\\}", "}")
    value = value.replace("\\(", "(").replace("\\)", ")")
    value = value.replace("\\[", "[").replace("\\]", "]")
    value = value.replace("\\$", "$")

    cleaned_lines = []
    for raw_line in value.split("\n"):
        line = plain_line(raw_line)
        if is_decorative_line(line) or should_drop_line(line):
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = cleanup_import_artifacts(value)
    value = clean_question_body(value)
    value = MATRIX_ENV_RE.sub(repair_matrix_block, value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def infer_missing_question_text(marker: str, section: str, explanation_text: str) -> str:
    if section.startswith("主題1") and marker.startswith("範例5"):
        return "若平面 E1 與 E2 的交線為 L，試求 L 的參數方程式。"
    if section.startswith("主題4") and marker.startswith("範例4"):
        return "空間中 A、B 在平面 E 異側，求 A 對 E 的對稱點，並求反射後光線路徑的直線對稱比例式。"
    if explanation_text:
        return "【待複核】原題幹高度依賴附圖或 Word 版面，請對原始 Word 檢查。"
    return ""


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：:，。")
    seed = clean_question_title(seed)
    if not seed:
        return marker
    return f"{marker}：{seed[:34]}"


def infer_formula_id(section: str, question_text: str, explanation_text: str) -> str:
    blob = f"{section}\n{question_text}\n{explanation_text}"

    if section.startswith("主題1"):
        if any(token in blob for token in ("兩點", "A(", "B(", "對稱比例式", "參數式", "交線為L", "平行於")):
            return "senior-space-line-two-point-form-s422"
        return "senior-space-line-equation-main-s422"

    if section.startswith("主題2"):
        return "senior-space-line-plane-relationship-s422"

    if section.startswith("主題3"):
        if any(token in blob for token in ("公垂線", "歪斜線", "最短距離", "兩螞蟻", "短距離")):
            return "senior-skew-lines-common-perpendicular-s422"
        return "senior-space-lines-relationship-s422"

    if any(token in blob for token in ("垂足", "投影坐標", "點到直線", "最短距離", "對稱點", "正射影")):
        return "senior-space-point-to-line-distance-s422"
    return "senior-space-point-to-line-distance-s422"


def build_records(markdown_text: str, source_ref: str) -> list[dict]:
    blocks = parse_standard_blocks(markdown_text)
    records: list[dict] = []

    for idx, block in enumerate(blocks, start=1):
        question_raw, explanation_raw = split_question_and_explanation(block["raw_text"])
        question_text = normalize_text(question_raw)
        explanation_text = normalize_text(explanation_raw)
        if not question_text:
            question_text = infer_missing_question_text(block["marker"], block["section"], explanation_text)
        if not question_text:
            continue

        marker = block["marker"]
        category = "基本" if marker.startswith("範例") else "重要"
        difficulty = "易" if category == "基本" else "中"
        formula_id = infer_formula_id(block["section"], question_text, explanation_text)

        records.append(
            {
                "id": f"q-{CHAPTER_CODE}-{idx:04d}",
                "title": rebuild_title(marker, question_text),
                "question_text": question_text,
                "answer_text": "",
                "explanation_text": explanation_text,
                "chapter_code": CHAPTER_CODE,
                "formula_id": formula_id,
                "difficulty": difficulty,
                "question_category": category,
                "source_type": "docx_pack_markdown",
                "source_ref": source_ref,
                "source_section": block["section"],
                "source_order": idx,
                "tags": [
                    CHAPTER_CODE,
                    f"section:{block['section']}",
                    f"marker:{marker}",
                ],
            }
        )

    return records


def make_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    category_counter = Counter()
    unassigned = 0

    for row in records:
        category_counter[row["question_category"]] += 1
        if not row.get("formula_id"):
            unassigned += 1
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
            "count": len(records),
            "unassigned_formula_id_count": unassigned,
        },
        "by_category": dict(category_counter),
        "by_section": by_section,
    }


def make_manifest() -> dict:
    return {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "source_files": [{"path": f"source/{SOURCE_DOC_NAME}", "role": "primary_docx"}],
        "extracted_files": [
            {"path": f"extracted/{EXTRACTED_MD_NAME}", "role": "pandoc_markdown"},
            {"path": "questions.json", "role": "question_pack_preview"},
            {"path": "preview.json", "role": "assignment_preview"},
            {"path": "review-needed.md", "role": "manual_review_notes"},
        ],
        "asset_roots": [{"path": "assets/media", "role": "pandoc_extracted_media"}],
        "status": "review_ready",
    }


def make_review_needed(records: list[dict]) -> str:
    review_rows = []
    for row in records:
        if "【待複核】" in row["question_text"]:
            review_rows.append(f"- `{row['id']}`：題幹主要依賴附圖或我有做推定補寫，建議對原始 Word。")
            continue
        image_count = row["question_text"].count("[圖:") + row["explanation_text"].count("[圖:")
        if image_count >= 2 or "公垂線" in row["question_text"] or "歪斜線" in row["question_text"]:
            review_rows.append(f"- `{row['id']}`：建議前端確認圖文搭配與數學排版。")

    lines = [
        f"# {CHAPTER_CODE} review notes",
        "",
        f"- 題數：{len(records)}",
        "- 重點清理：空間直線方程式、直線與平面、兩直線關係、點到直線距離。",
        "- 圖片：已補 `wmf/emf -> png` sidecar。",
        "",
        "## 建議人工複核",
    ]
    if review_rows:
        lines.extend(review_rows[:12])
    else:
        lines.append("- 目前沒有特別高風險題。")
    lines.append("")
    return "\n".join(lines)


def sync_media_tree(src: Path, dst: Path):
    dst.mkdir(parents=True, exist_ok=True)
    for item in sorted(src.iterdir()):
        target = dst / item.name
        if item.is_dir():
            sync_media_tree(item, target)
            continue
        try:
            shutil.copy2(item, target)
        except PermissionError:
            if not target.exists():
                raise


def main():
    workspace = Path(__file__).resolve().parents[2]
    inspect_root = workspace / "program-db" / "imports" / "packs" / SOURCE_PACK
    output_root = workspace / "program-db" / "imports" / "packs" / CHAPTER_CODE

    extracted_src = next((inspect_root / "extracted").glob("*.md"))
    markdown_text = extracted_src.read_text(encoding="utf-8")

    (output_root / "source").mkdir(parents=True, exist_ok=True)
    (output_root / "extracted").mkdir(parents=True, exist_ok=True)
    (output_root / "assets").mkdir(parents=True, exist_ok=True)

    source_src = next((inspect_root / "source").glob("*.docx"))
    shutil.copy2(source_src, output_root / "source" / SOURCE_DOC_NAME)
    (output_root / "extracted" / EXTRACTED_MD_NAME).write_text(markdown_text, encoding="utf-8")
    sync_media_tree(inspect_root / "assets" / "media", output_root / "assets" / "media")
    png_created = ensure_png_sidecars(output_root / "assets" / "media")

    records = build_records(markdown_text, f"source/{SOURCE_DOC_NAME}")
    preview = make_preview(records)
    manifest = make_manifest()
    review_needed = make_review_needed(records)

    write_json(
        output_root / "questions.json",
        {
            "chapter_code": CHAPTER_CODE,
            "chapter_title": CHAPTER_TITLE,
            "questions": records,
        },
    )
    write_json(output_root / "preview.json", preview)
    write_json(output_root / "manifest.json", manifest)
    (output_root / "review-needed.md").write_text(review_needed, encoding="utf-8")

    print(
        json.dumps(
            {
                "chapter_code": CHAPTER_CODE,
                "count": len(records),
                "png_created": png_created,
                "formula_counts": dict(Counter(row["formula_id"] for row in records)),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
