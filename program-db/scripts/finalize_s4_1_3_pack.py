import json
import re
import shutil
from collections import Counter
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


SOURCE_PACK = "_inspect-4A-3"
CHAPTER_CODE = "s4-1-3"
CHAPTER_TITLE = "空間向量的內積"

TOPIC_RE = re.compile(r"主題\s*(\d+)\s*[:：]\s*(.+)")
MARKER_RE = re.compile(r"^(範例\s*\d+|隨堂練習)\s*$")
EXPLANATION_RE = re.compile(r"(?:【解析】|【詳解】|【解】|【證明】|解析：|解：)")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]*\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
SOURCE_NOTE_RE = re.compile(r"^【[^】]*(?:自命題|期中考|期末考|段考|模擬考|女中|高中|中學)[^】]*】$")
RAW_INSPECT_MEDIA_RE = re.compile(
    r"\(?\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-4A-3[\\/]+assets[\\/]+media[\\/][^)\]\s]+(?:\.(?:png|jpg|jpeg|emf|wmf))\)?",
    re.I,
)
SECTION_FALLBACK = "主題1：向量內積與柯西不等式"


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
    if re.search(r"[\u4e00-\u9fff]", text):
        return True
    if any(token in text for token in (r"\frac", r"\sqrt", r"\overline", r"\angle", "=")):
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
    if SOURCE_NOTE_RE.fullmatch(stripped):
        return True
    return False


def detect_topic(line: str) -> str | None:
    stripped = plain_line(line)
    match = TOPIC_RE.search(stripped)
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
        raw_text = "\n".join(raw_lines).strip()
        if raw_text:
            blocks.append(
                {
                    "marker": current_marker,
                    "section": current_section or SECTION_FALLBACK,
                    "raw_text": raw_text,
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
    return raw[: match.start()], raw[match.end() :]


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = UNDERLINE_RE.sub("＿＿＿＿", value)
    value = HTML_COMMENT_RE.sub("", value)
    value = RAW_INSPECT_MEDIA_RE.sub("", value)
    value = value.replace("`", "")
    value = value.replace("*", "")
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
    value = value.replace("\\<", "<").replace("\\>", ">")
    value = value.replace("\\$", "$")
    value = value.replace("﹐", "，").replace("﹒", "。")

    cleaned_lines = []
    for raw_line in value.split("\n"):
        line = plain_line(raw_line)
        if is_decorative_line(line) or should_drop_line(line):
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"\[圖:[^\]]+\]\]+", lambda m: m.group(0).rstrip("]"), value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = cleanup_import_artifacts(value)
    value = clean_question_body(value)
    value = re.sub(r"\+\-+\+", "", value)
    value = re.sub(r"^[\]\).,，。；﹒\s]+", "", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。；﹒")
    if len(seed) > 36:
        seed = seed[:36].rstrip(" ：，。；﹒")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(section: str, marker: str, title: str, question_text: str, explanation_text: str) -> str:
    text = "\n".join([marker, title, question_text, explanation_text])

    if has_any(text, ["正射影", "投影", "垂足", "投影點", "投影長", "正射影長"]):
        return "senior-space-dot-product-projection-s413"

    if has_any(text, ["柯西"]):
        return "senior-space-dot-product-cauchy-s413"

    if has_any(text, ["最小值", "最大值", "等號成立", "≤", "≦", "≥", "≧"]):
        if has_any(text, ["最小值", "最大值", "等號成立"]):
            return "senior-space-dot-product-extreme-equality-s413"
        return "senior-space-dot-product-cauchy-s413"

    if has_any(text, ["線面角", "面面角", "法向量"]):
        return "senior-space-dot-product-line-plane-angle-s413"

    if has_any(text, ["夾角", "角度", "cos∠", "sin∠", "∠", "垂直", "平行"]) and has_any(text, ["直線", "平面", "XOY", "YOZ"]):
        return "senior-space-dot-product-angle-unification-s413"

    return "senior-space-dot-product-main-s413"


def apply_manual_fixes(record: dict):
    qid = record["id"]

    if qid == "q-s4-1-3-0002":
        record["title"] = "範例2：長方體內兩線垂直判定"

    if qid == "q-s4-1-3-0018":
        record["title"] = "範例18：三角形內點的距離平方和最小值"

    if qid == "q-s4-1-3-0019":
        record["question_text"] = record["question_text"].replace(
            "設a在b上的正射影", "設向量a在向量b上的正射影"
        )

    record["question_text"] = clean_question_body(record["question_text"])
    record["explanation_text"] = clean_question_body(record["explanation_text"])
    record["title"] = clean_question_title(record["title"])


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = record.get("source_section") or SECTION_FALLBACK
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
    }


def build_review(records: list[dict], png_created: int) -> str:
    return "\n".join(
        [
            f"# {CHAPTER_CODE} Review Notes",
            "",
            f"- 來源章節：{CHAPTER_TITLE}",
            f"- 題目數：{len(records)}",
            f"- 新增向量圖轉檔：{png_created} 個 sidecar PNG",
            "- 建議優先檢查題號：",
            "  - q-s4-1-3-0018：柯西最值題，圖文依賴高。",
            "  - q-s4-1-3-0020：正射影定義頁後的第一題，請看圖片順序。",
            "  - q-s4-1-3-0024：重心與垂心混合投影題，推導較長。",
            "  - q-s4-1-3-0027：平行六面體與投影長題，圖片依賴高。",
        ]
    )


def copy_support_files(base_dir: Path, pack_dir: Path) -> tuple[str, str]:
    source_pack = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    source_doc = first_match(source_pack / "source", "4A-3*.docx")
    source_md = first_match(source_pack / "extracted", "4A-3*.md")

    target_doc = pack_dir / "source" / source_doc.name
    target_md = pack_dir / "extracted" / source_md.name
    shutil.copy2(source_doc, target_doc)
    shutil.copy2(source_md, target_md)

    media_src = source_pack / "assets" / "media"
    media_dst = pack_dir / "assets" / "media"
    media_dst.mkdir(parents=True, exist_ok=True)
    shutil.copytree(media_src, media_dst, dirs_exist_ok=True)
    return target_doc.name, target_md.name


def build_pack(base_dir: Path):
    source_pack = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    markdown_path = first_match(source_pack / "extracted", "4A-3*.md")
    markdown_text = markdown_path.read_text(encoding="utf-8")
    blocks = parse_standard_blocks(markdown_text)

    pack_dir = base_dir / "program-db" / "imports" / "packs" / CHAPTER_CODE
    (pack_dir / "source").mkdir(parents=True, exist_ok=True)
    (pack_dir / "extracted").mkdir(parents=True, exist_ok=True)
    (pack_dir / "assets" / "media").mkdir(parents=True, exist_ok=True)

    doc_name, md_name = copy_support_files(base_dir, pack_dir)
    png_created = ensure_png_sidecars(pack_dir / "assets" / "media")

    output_records = []
    for index, block in enumerate(blocks, start=1):
        marker = block["marker"]
        raw_question, raw_explanation = split_question_and_explanation(block["raw_text"])
        question_text = normalize_text(raw_question)
        explanation_text = normalize_text(raw_explanation)
        title = rebuild_title(marker, question_text)
        category = "基本" if marker.startswith("範例") else "重要"
        difficulty = "易" if category == "基本" else "中"
        section = block["section"] or SECTION_FALLBACK
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

    questions_payload = {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "questions": output_records,
    }
    preview_payload = build_preview(output_records)
    manifest_payload = build_manifest(doc_name, md_name)
    review_text = build_review(output_records, png_created)

    write_json(pack_dir / "questions.json", questions_payload)
    write_json(pack_dir / "preview.json", preview_payload)
    write_json(pack_dir / "manifest.json", manifest_payload)
    (pack_dir / "review-needed.md").write_text(review_text, encoding="utf-8")

    assigned = sum(1 for row in output_records if row.get("formula_id"))
    print(f"{CHAPTER_CODE}: questions={len(output_records)}, assigned={assigned}")
    print(Counter(row["question_category"] for row in output_records))
    print(Counter(row["source_section"] for row in output_records))
    print(Counter(row["formula_id"] for row in output_records))


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parents[2]
    build_pack(base_dir)
