import json
import re
import shutil
from collections import Counter
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


SOURCE_PACK = "_inspect-4A-8"
CHAPTER_CODE = "s4-4-2"
CHAPTER_TITLE = "矩陣的運算"
SOURCE_DOC_NAME = "4A-8轉.docx"
EXTRACTED_MD_NAME = "4A-8轉.md"

TOPIC_RE = re.compile(r"^主題\s*(\d+)\s*[：:]\s*(.+)$")
MARKER_RE = re.compile(r"^(範例\s*\d+|隨堂練習)\s*$")
EXPLANATION_RE = re.compile(r"(【解析】|【解】|【解答】|解析：|解：|解答：)")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
EMPTY_UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]*\]\{\.underline\}")
TEXT_UNDERLINE_RE = re.compile(r"\[([^\]]+)\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
RAW_INSPECT_MEDIA_RE = re.compile(
    r"\(?\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-4A-8[\\/]+assets[\\/]+media[\\/][^)\]\s]+(?:\.(?:png|jpg|jpeg|emf|wmf))\)?",
    re.I,
)
EDITORIAL_RE = re.compile(r"【龍騰自命題】|【觀念補充】|【進階補充】|【例題】")
EXAM_SOURCE_RE = re.compile(r"【[^】]*(?:期中考|段考|模擬考|學測|聯考|指考|會考|統測)[^】]*】")
SECTION_FALLBACK = "主題1：矩陣的定義"


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
    return any(token in text for token in (r"\frac", r"\sqrt", r"\overline", r"\angle", "=", r"\times"))


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
    if stripped.startswith("|"):
        stripped = stripped[1:].strip()
    if stripped.endswith("|"):
        stripped = stripped[:-1].strip()
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
    if stripped in {"[隨堂練習]{.underline}.", "[隨堂練習]{.underline}"}:
        return True
    return False


def detect_topic(line: str) -> str | None:
    stripped = plain_line(line)
    match = TOPIC_RE.fullmatch(stripped)
    if not match:
        return None
    topic_title = cleanup_import_artifacts(TEXT_UNDERLINE_RE.sub(r"\1", match.group(2).strip()))
    topic_title = topic_title.replace("係數積", "數乘")
    return f"主題{match.group(1)}：{topic_title}"


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


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = EMPTY_UNDERLINE_RE.sub("＿＿＿＿＿＿", value)
    value = TEXT_UNDERLINE_RE.sub(r"\1", value)
    value = HTML_COMMENT_RE.sub("", value)
    value = RAW_INSPECT_MEDIA_RE.sub("", value)
    value = EDITORIAL_RE.sub("", value)
    value = EXAM_SOURCE_RE.sub("", value)
    value = value.replace("`", "")
    value = value.replace("\\mspace{6mu}", " ")
    value = value.replace("\\times", "×")
    value = value.replace("\\cdot", "·")
    value = value.replace("\\therefore", "∴")
    value = value.replace("\\because", "∵")
    value = value.replace("\\Rightarrow", "⇒")
    value = value.replace("\\Leftrightarrow", "⇔")
    value = value.replace("\\neq", "≠")
    value = value.replace("\\geq", "≥")
    value = value.replace("\\leq", "≤")
    value = value.replace("\\pi", "π")
    value = value.replace("\\sin", "sin")
    value = value.replace("\\cos", "cos")
    value = value.replace("\\tan", "tan")
    value = value.replace("\\cot", "cot")
    value = value.replace("\\left(", "(").replace("\\right)", ")")
    value = value.replace("\\left[", "[").replace("\\right]", "]")
    value = value.replace("\\left\\{", "{").replace("\\right\\}", "}")
    value = value.replace("\\(", "(").replace("\\)", ")")
    value = value.replace("\\[", "[").replace("\\]", "]")
    value = value.replace("\\$", "$")
    value = value.replace("⥂", "")
    value = value.replace("~\\~", "")
    value = re.sub(r"[·.]s[·.]s", "……", value)

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
    value = value.replace("。。", "。")
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def infer_missing_question_text(marker: str, section: str, explanation_text: str) -> str:
    if section.startswith("主題3") and marker.startswith("範例8") and "AB" in explanation_text:
        return "設矩陣 A、B，求乘積 AB。"
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

    if "何者恆成立" in question_text and any(token in question_text for token in ("AB = BA", "AB = O", "(AB)C = A(BC)", "A + B = B + A")):
        return "senior-matrix-operation-common-pitfalls-s442"
    if any(token in blob for token in ("逆矩陣", "A^{-1}", "det", "可逆")):
        return "senior-inverse-matrix-and-determinant-s442"
    if any(token in blob for token in ("初等矩陣", "列運算", "交換兩列", "消去法")):
        return "senior-matrix-elementary-matrix-s442"
    if any(token in blob for token in ("A^", "A²", "A^2", "A^3", "A^4", "A^5", "A^77", "A² = ", "A^2 =", "Cayley", "A^m", "A^n")):
        return "senior-matrix-power-pattern-fast-compute-s442"
    if any(token in blob for token in ("AB≠BA", "AB = O", "BA = O", "交換律", "消去律", "恆成立", "何者正確", "何者不真", "性質")):
        return "senior-matrix-operation-common-pitfalls-s442"
    if any(token in blob for token in ("乘積AB", "矩陣的乘法", "可乘", "AB", "BA", "方陣", "單位方陣")) and section.startswith("主題3"):
        return "senior-matrix-operations-main-s442"
    return "senior-matrix-operations-main-s442"


def apply_targeted_fixes(row: dict) -> dict:
    question_text = row["question_text"]
    explanation_text = row["explanation_text"]

    if "若$A$不為零矩陣且$AB = AC$" in question_text:
        question_text = re.sub(
            r"若\$A\$不為零矩陣且\$AB = AC\$﹐則.*?(?=\n\(4\)| \(4\)|\n\(5\)| \(5\)|$)",
            "若$A$不為零矩陣且$AB = AC$，則$B = C$",
            question_text,
            count=1,
            flags=re.S,
        )
    if question_text.startswith("設$A$﹐$B$﹐$C = "):
        question_text = (
            "設$A$﹐$B$﹐$C$均為$n$階方陣﹐則下列敘述何者恆成立？\n"
            "(1)$AB = BA$ (2)若$AB = O$﹐則$A = O$或$B = O$\n"
            "(3)若$A$不為零矩陣且$AB = AC$，則$B = C$\n"
            "(4)若$A^{2} = B^{2}$﹐則$A = B$或$A = - B$\n"
            "(5)$(AB)C = A(BC)$﹒"
        )
        row["title"] = "範例10：設 A、B、C 均為 n 階方陣，判斷何者恆成立"

    explanation_text = explanation_text.replace("$A\\begin{bmatrix}", "$A = \\begin{bmatrix}")
    question_text = question_text.replace("$A\\begin{bmatrix}", "$A = \\begin{bmatrix}")

    row["question_text"] = question_text
    row["explanation_text"] = explanation_text
    return row


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

        row = apply_targeted_fixes(
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
        if row["title"] == rebuild_title(marker, question_text):
            row["title"] = rebuild_title(marker, row["question_text"])
        records.append(row)

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
        if image_count >= 2 or any(token in row["question_text"] for token in ("AB", "BA", "A^", "矩陣", "方陣")):
            review_rows.append(f"- `{row['id']}`：建議前端確認圖文搭配與數學排版。")

    lines = [
        f"# {CHAPTER_CODE} review notes",
        "",
        f"- 題數：{len(records)}",
        "- 重點清理：矩陣定義、加減與數乘、矩陣乘法與冪次。",
        "- 圖片：已補 `wmf/emf -> png` sidecar。",
        "",
        "## 建議人工複核",
    ]
    if review_rows:
        lines.extend(review_rows[:16])
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
