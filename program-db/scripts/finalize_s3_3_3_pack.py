import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


SOURCE_PACK = "_inspect-3A-10"
CHAPTER_CODE = "s3-3-3"
CHAPTER_TITLE = "面積與二階行列式"

TOPIC_RE = re.compile(r"主題\s*(\d+)\s*[:：]\s*(.+)")
MARKER_RE = re.compile(r"(範例\s*\d+|隨堂練習|重要範例)")
EXPLANATION_RE = re.compile(r"(?:【解析】|【詳解】|【解】|解析：|解：)")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]+\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
DANGLING_IMAGE_RE = re.compile(r"\]\(\.\\program-db\\imports\\packs\\_inspect-3A-10\\assets\\media\\[^)]+\)")
RAW_INSPECT_MEDIA_RE = re.compile(
    r"\]?[\(\[]\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-3A-10[\\/]+assets[\\/]+media[\\/][^)\\]]+[)\]]"
)
SOURCE_NOTE_RE = re.compile(r"^【[^】]*(?:自命題|期中考|期末考|模擬考|聯考|學測|指考|高中|女中|附中|建國中學)[^】]*】$")
ARRAY_OPEN_RE = re.compile(r"\$?\{?\s*\\begin\{array\}(?:\{[^}]*\})?")
ARRAY_CLOSE_RE = re.compile(r"\\end\{array\}\s*\\right\.\$?")
SYSTEM_BLOCK_RE = re.compile(
    r"\$?\\left\\\{\s*\\begin\{(?:array|matrix)\}(?:\{[^}]*\})?\s*(.*?)\s*\\end\{(?:array|matrix)\}\s*\\right\.\$?",
    re.S,
)
DET_MATRIX_OPEN_RE = re.compile(r"\\left\|\s*\\begin\{matrix\}")
DET_MATRIX_CLOSE_RE = re.compile(r"\\end\{matrix\}\s*\\right\|")
DET_MATRIX_BLOCK_RE = re.compile(r"\\left\|\s*\\begin\{matrix\}(.*?)\\end\{matrix\}\s*\\right\|", re.S)
PRACTICE_MARK_RE = re.compile(r"\[\s*隨堂練習\]\{\.underline\}\.?|隨堂練習\]\{\.underline\}\.?")
SPLIT_PRACTICE_RE = re.compile(r"\[\s*\\?\s*\n\s*隨堂練習\]\{\.underline\}\.?")


def write_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def first_match(directory: Path, pattern: str) -> Path:
    matches = sorted(directory.glob(pattern))
    if not matches:
        raise FileNotFoundError(f"No file matched {pattern} in {directory}")
    return matches[0]


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
    if "解析" in text or "詳解" in text or "解" in text:
        return True
    if re.search(r"[\u4e00-\u9fff]", text):
        return True
    if any(token in text for token in (r"\frac", r"\sqrt", r"\vec", r"\overline", r"\angle", "=")):
        return True
    return len(text) >= 12


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


def normalize_determinant_blocks(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        inner = match.group(1)
        rows = []
        for raw in inner.splitlines():
            line = raw.strip()
            if not line:
                continue
            if line.startswith("|"):
                line = line[1:].strip()
            if line.endswith("|"):
                line = line[:-1].rstrip()
            line = re.sub(r"^\\\\\s*", "", line)
            if line.endswith("\\\\"):
                line = line[:-2].rstrip()
            if line == r"\\":
                continue
            rows.append(line)
        if not rows:
            return match.group(0)
        body = r" \\ ".join(rows)
        return f"\\begin{{vmatrix}}{body}\\end{{vmatrix}}"

    return DET_MATRIX_BLOCK_RE.sub(repl, text)


def normalize_system_blocks(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        inner = match.group(1)
        inner = re.sub(r"\s*\\\\\s*", "\n", inner)
        parts = []
        for raw in inner.splitlines():
            line = plain_line(raw)
            if not line:
                continue
            parts.append(line)
        if not parts:
            return ""
        return f"（{'；'.join(parts)}）"

    return SYSTEM_BLOCK_RE.sub(repl, text)


def is_decorative_line(line: str) -> bool:
    stripped = str(line or "").strip()
    if not stripped:
        return True
    if DECORATIVE_RE.fullmatch(stripped):
        return True
    if stripped in {"**", "*\\*", "※重要範例"}:
        return True
    return False


def should_drop_line(line: str) -> bool:
    stripped = str(line or "").strip()
    if not stripped:
        return True
    if stripped in {"![", "]![", "](", "![1", "![", "\\", "\\\\", "]", "["}:
        return True
    if SOURCE_NOTE_RE.fullmatch(stripped):
        return True
    return False


def plain_line(line: str) -> str:
    value = str(line or "").rstrip()
    stripped = value.strip()
    if stripped.startswith("|") and stripped.endswith("|"):
        stripped = stripped[1:-1].strip()
    return stripped.replace("**", "").strip()


def normalize_section_name(raw: str) -> str:
    text = plain_line(raw)
    match = TOPIC_RE.search(text)
    if not match:
        return text
    return f"主題{match.group(1)}：{match.group(2).strip()}"


def detect_topic(line: str) -> str | None:
    stripped = plain_line(line)
    match = TOPIC_RE.search(stripped)
    if not match:
        return None
    return f"主題{match.group(1)}：{match.group(2).strip()}"


def detect_standard_marker(line: str) -> str | None:
    stripped = plain_line(line).replace(",", "").replace("，", "")
    match = MARKER_RE.search(stripped)
    if not match:
        return None
    marker = re.sub(r"\s+", "", match.group(1))
    return marker if marker != "重要範例" else None


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
        raw_text = "\n".join(raw_lines).strip()
        if raw_text:
            blocks.append({"marker": current_marker, "section": current_section, "raw_text": raw_text})
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


def topic_sections(markdown_text: str) -> dict[str, str]:
    matches = list(TOPIC_RE.finditer(markdown_text))
    sections: dict[str, str] = {}
    for idx, match in enumerate(matches):
        topic = f"主題{match.group(1)}：{match.group(2).strip()}"
        start = match.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown_text)
        sections[topic] = markdown_text[start:end]
    return sections


def parse_inline_topic_blocks(markdown_text: str, topic: str) -> list[dict]:
    section_text = topic_sections(markdown_text).get(topic, "")
    if not section_text:
        return []
    marker_pos = section_text.find("※重要範例")
    if marker_pos >= 0:
        section_text = section_text[marker_pos + len("※重要範例") :]
    section_text = SPLIT_PRACTICE_RE.sub("\n<<PRACTICE>>\n", section_text)
    section_text = PRACTICE_MARK_RE.sub("\n<<PRACTICE>>\n", section_text)
    lines = section_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")

    blocks: list[dict] = []
    current_marker = ""
    buffer: list[str] = []

    def flush():
        nonlocal current_marker, buffer
        if not current_marker:
            buffer = []
            return
        raw_text = "\n".join(line for line in buffer if not is_decorative_line(line)).strip()
        if raw_text:
            blocks.append({"marker": current_marker, "section": topic, "raw_text": raw_text})
        buffer = []

    for raw in lines:
        stripped = plain_line(raw)
        if not stripped:
            if current_marker:
                buffer.append(raw)
            continue

        if stripped == "<<PRACTICE>>":
            flush()
            current_marker = "隨堂練習"
            buffer = []
            continue

        number_match = re.match(r"^(\d+)\.(.*)$", stripped)
        if number_match:
            flush()
            current_marker = f"範例{number_match.group(1)}"
            remainder = number_match.group(2).strip()
            buffer = [remainder] if remainder else []
            continue

        if current_marker:
            buffer.append(raw)

    flush()
    return blocks


SYSTEM_BLOCK_RE = re.compile(
    r"\$?\\left\\\{\s*\\begin\{(?:array|matrix)\}(?:\{[^}]*\})?\s*(.*?)\s*\\end\{(?:array|matrix)\}\s*\\right\.(?:\\\$|\$)?",
    re.S,
)
VMATRIX_RE = re.compile(r"\\begin\{vmatrix\}(.*?)\\end\{vmatrix\}", re.S)


def normalize_system_blocks(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        inner = re.sub(r"\s*\\\\\s*", "\n", match.group(1))
        parts = []
        for raw in inner.splitlines():
            line = plain_line(raw)
            if line:
                parts.append(line)
        if not parts:
            return ""
        return f"({'; '.join(parts)})"

    return SYSTEM_BLOCK_RE.sub(repl, text)


def cleanup_vmatrix_tokens(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        inner = match.group(1)
        parts = [part.strip() for part in re.split(r"\\\\", inner) if part.strip()]
        if not parts:
            return match.group(0)
        return f"\\begin{{vmatrix}}{r' \\\\ '.join(parts)}\\end{{vmatrix}}"

    return VMATRIX_RE.sub(repl, text)


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = UNDERLINE_RE.sub("＿＿＿＿", value)
    value = HTML_COMMENT_RE.sub("", value)
    value = DANGLING_IMAGE_RE.sub("", value)
    value = RAW_INSPECT_MEDIA_RE.sub("", value)
    value = PRACTICE_MARK_RE.sub("", value)
    value = normalize_system_blocks(value)
    value = ARRAY_OPEN_RE.sub("", value)
    value = ARRAY_CLOSE_RE.sub("", value)
    value = re.sub(r"\s*\\\\\s*", "\n", value)
    value = normalize_determinant_blocks(value)
    value = DET_MATRIX_OPEN_RE.sub(r"\\begin{vmatrix}", value)
    value = DET_MATRIX_CLOSE_RE.sub(r"\\end{vmatrix}", value)
    value = cleanup_vmatrix_tokens(value)
    value = value.replace("`", "")
    value = value.replace("*", "")
    value = value.replace("\\mspace{6mu}", " ")
    value = value.replace("\\left(", "(").replace("\\right)", ")")
    value = value.replace("\\left[", "[").replace("\\right]", "]")
    value = value.replace("\\left\\{", "{").replace("\\right\\}", "}")
    value = value.replace("\\(", "(").replace("\\)", ")")
    value = value.replace("\\[", "[").replace("\\]", "]")
    value = value.replace("\\|", "|")
    value = value.replace("\\$", "$")
    value = value.replace("}}", "}")
    value = value.replace("{{", "{")

    cleaned_lines = []
    for raw_line in value.split("\n"):
        line = plain_line(raw_line)
        if is_decorative_line(line) or should_drop_line(line):
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"\[圖:[^\]]+\]\]+", lambda m: m.group(0).rstrip("]"), value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = re.sub(r"^[\]\).,，。\s]+", "", value)
    value = cleanup_import_artifacts(value)
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def split_question_and_explanation(raw_text: str) -> tuple[str, str]:
    raw = str(raw_text or "")
    match = EXPLANATION_RE.search(raw)
    if not match:
        return raw, ""
    return raw[: match.start()], raw[match.end() :]


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = re.sub(r"\$\\begin\{vmatrix\}.*?\\end\{vmatrix\}\$", "二階行列式", seed)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。；﹒")
    if len(seed) > 34:
        seed = seed[:34].rstrip(" ：，。；﹒")
    title = f"{marker}：{seed}" if seed else marker
    title = title.replace("範例重要", "範例")
    return clean_question_title(title)


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(section: str, marker: str, title: str, question_text: str, explanation_text: str) -> str:
    text = "\n".join([section, marker, title, question_text, explanation_text])

    if section.startswith("主題2"):
        if has_any(text, ["無解", "無窮多解", "相異直線", "重合", "平行", "幾何意義", "第二象限"]):
            return "senior-determinant-linear-system-geometry-s333"
        return "senior-cramers-rule-2x2-s333"

    if section.startswith("主題1"):
        if has_any(text, ["下列何者正確", "性質", "變號", "值不變", "乘以k", "行與列"]):
            return "senior-determinant-properties-s333"
        return "senior-determinant-linearity-fast-expand-s333"

    if section.startswith("主題3"):
        if has_any(text, ["面積", "共線", "三角形", "平行四邊形"]):
            if has_any(text, ["共線", "=0", "為零"]):
                return "senior-determinant-collinearity-s333"
            if has_any(text, ["有向", "左右側", "旋轉方向", "正負"]):
                return "senior-determinant-oriented-area-sign-s333"
            return "senior-parallelogram-triangle-area-s333"
        return "senior-cramers-rule-2x2-s333"

    return "s3-3-3-area-determinant-core"


def apply_manual_fixes(record: dict):
    if record["id"] == "q-s3-3-3-0017":
        record["title"] = "隨堂練習：看錯係數反推原方程組"

    if record["id"] == "q-s3-3-3-0018":
        record["title"] = "隨堂練習：參數方程組的幾何意義"

    if record["id"] == "q-s3-3-3-0023":
        record["title"] = "範例1：工作效率的二元方程組應用"

    if record["id"] == "q-s3-3-3-0024":
        record["title"] = "隨堂練習：橋寬與水流速率"

    if record["id"] == "q-s3-3-3-0025":
        record["title"] = "範例2：相遇問題的二元方程組應用"

    record["question_text"] = clean_question_body(record["question_text"])
    record["explanation_text"] = clean_question_body(record["explanation_text"])
    record["title"] = clean_question_title(record["title"])


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = record.get("source_section") or "主題1：二階行列式"
        by_section.setdefault(section, []).append(
            {
                "id": record["id"],
                "title": record["title"],
                "question_category": record["question_category"],
                "difficulty": record["difficulty"],
                "formula_id": record["formula_id"],
            }
        )
    return {
        "meta": {
            "chapter_code": CHAPTER_CODE,
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(Counter(record["question_category"] for record in records)),
        "by_section": by_section,
    }


def build_manifest(doc_name: str, md_name: str) -> dict:
    return {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "source_files": [{"path": f"source/{doc_name}", "role": "primary_docx"}],
        "extracted_files": [
            {"path": f"extracted/{md_name}", "role": "pandoc_markdown"},
            {"path": "questions.json", "role": "question_pack_preview"},
            {"path": "preview.json", "role": "assignment_preview"},
            {"path": "review-needed.md", "role": "manual_review_notes"},
        ],
        "asset_roots": [{"path": "assets/media", "role": "pandoc_extracted_media"}],
        "status": "review_ready",
        "updated_at": datetime.now().astimezone().isoformat(),
    }


def build_review(records: list[dict]) -> str:
    lines = [
        f"# {CHAPTER_CODE} Review Needed",
        "",
        "## Current extraction status",
        "",
        f"- Parsed question records: {len(records)}",
        f"- Assigned `formula_id`: {sum(1 for row in records if row.get('formula_id'))}",
        f"- Image-heavy review items: {sum(1 for row in records if (row['question_text'] + row['explanation_text']).count('[圖:') >= 2)}",
        "",
        "## Manual review items",
        "",
        "- `q-s3-3-3-0001`",
        "  - 二階行列式性質判斷題含多個小矩陣，建議看前端數學排版。",
        "- `q-s3-3-3-0017`",
        "  - 這題原始稿把 `隨堂練習` 和解析黏在同一行，我已拆開，建議再看一次版面。",
        "- `q-s3-3-3-0023`",
        "  - 工作效率題含分式聯立，建議檢查公式換行。",
        "- `q-s3-3-3-0024`",
        "  - 橋寬與水流速率題有文字情境與聯立式，建議檢查題幹段落。",
        "- `q-s3-3-3-0025`",
        "  - 相遇問題含題圖與三式聯立，建議看前端圖文搭配。",
        "",
        "## Notes",
        "",
        "- 這章主要使用標準 `主題 / 範例 / 隨堂練習`，但有一題把 `隨堂練習` 與 `【解析】` 寫在同一行，已在 parser 內特別處理。",
        "- 已依網站 `s3-3-3` 既有主題附掛，不是只掛章節核心。",
        "- `範例 -> 基本`、`隨堂練習 -> 重要` 已套回正式匯入格式。",
        "- `wmf/emf` 會自動補成 `.png` sidecar 供前端顯示。",
    ]
    return "\n".join(lines).strip() + "\n"


def copy_support_files(base_dir: Path, pack_dir: Path) -> tuple[str, str]:
    source_dir = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    source_doc = first_match(source_dir / "source", "3A-10*.docx")
    source_md = first_match(source_dir / "extracted", "3A-10*.md")

    shutil.copy2(source_doc, pack_dir / "source" / source_doc.name)
    shutil.copy2(source_md, pack_dir / "extracted" / source_md.name)

    asset_source = source_dir / "assets" / "media"
    asset_target = pack_dir / "assets" / "media"
    asset_target.mkdir(parents=True, exist_ok=True)
    for item in asset_source.iterdir():
        if item.is_file():
            shutil.copy2(item, asset_target / item.name)
    ensure_png_sidecars(asset_target)
    return source_doc.name, source_md.name


def build_pack(base_dir: Path):
    source_pack = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    markdown_path = first_match(source_pack / "extracted", "3A-10*.md")
    markdown_text = markdown_path.read_text(encoding="utf-8")

    blocks = parse_standard_blocks(markdown_text)

    pack_dir = base_dir / "program-db" / "imports" / "packs" / CHAPTER_CODE
    (pack_dir / "source").mkdir(parents=True, exist_ok=True)
    (pack_dir / "extracted").mkdir(parents=True, exist_ok=True)
    (pack_dir / "assets" / "media").mkdir(parents=True, exist_ok=True)

    doc_name, md_name = copy_support_files(base_dir, pack_dir)

    output_records = []
    for index, block in enumerate(blocks, start=1):
        marker = block["marker"]
        raw_question, raw_explanation = split_question_and_explanation(block["raw_text"])
        question_text = normalize_text(raw_question)
        explanation_text = normalize_text(raw_explanation)
        title = rebuild_title(marker, question_text)
        category = "基本" if marker.startswith("範例") else "重要"
        difficulty = "易" if category == "基本" else "中"
        section = normalize_section_name(block["section"])
        formula_id = formula_id_for(section, marker, title, question_text, explanation_text)
        record = {
            "id": f"q-{CHAPTER_CODE}-{index:04d}",
            "title": title,
            "question_text": question_text,
            "answer_text": "",
            "explanation_text": explanation_text,
            "chapter_code": CHAPTER_CODE,
            "formula_id": formula_id,
            "difficulty": difficulty,
            "question_category": category,
            "source_type": "docx_pack_markdown",
            "source_ref": f"source/{doc_name}",
            "source_section": section,
            "source_order": index,
            "tags": [CHAPTER_CODE, f"section:{section}", f"marker:{marker}"],
        }
        apply_manual_fixes(record)
        output_records.append(record)

    output_records.sort(key=lambda row: row["id"])
    payload = {"chapter_code": CHAPTER_CODE, "chapter_title": CHAPTER_TITLE, "questions": output_records}
    write_json(pack_dir / "questions.json", payload)
    write_json(pack_dir / "preview.json", build_preview(output_records))
    write_json(pack_dir / "manifest.json", build_manifest(doc_name, md_name))
    (pack_dir / "review-needed.md").write_text(build_review(output_records), encoding="utf-8")

    print(
        f"{CHAPTER_CODE}: questions={len(output_records)}, "
        f"assigned={sum(1 for row in output_records if row.get('formula_id'))}"
    )
    print(Counter(row["question_category"] for row in output_records))
    print(Counter(row["formula_id"] for row in output_records))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-dir", default=".", help="Workspace root")
    args = parser.parse_args()
    build_pack(Path(args.base_dir).resolve())


if __name__ == "__main__":
    main()
