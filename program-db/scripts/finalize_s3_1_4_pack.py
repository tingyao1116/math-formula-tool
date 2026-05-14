import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


SOURCE_PACK = "_inspect-3A-7"
CHAPTER_CODE = "s3-1-4"
CHAPTER_TITLE = "正餘弦函數的疊合"

TOPIC_RE = re.compile(r"主題\s*(\d+)\s*[:：]\s*(.+)")
MARKER_RE = re.compile(r"(範例\s*\d+|隨堂練習)")
EXPLANATION_RE = re.compile(r"(?:【解析】|【解】|【詳解】|解析：|解：)")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]+\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
DANGLING_IMAGE_RE = re.compile(r"\]\(\.\\program-db\\imports\\packs\\_inspect-3A-7\\assets\\media\\[^)]+\)")
SOURCE_NOTE_RE = re.compile(r"^【[^】]*(?:自命題|期中考|期末考|模擬考|聯考|學測|指考|建國中學|高中|女中|附中)[^】]*】$")
INLINE_SYMBOL_MAP = {
    "image13.wmf": "≤",
    "image13.wmf.png": "≤",
    "image14.wmf": r"\sqrt{2}",
    "image14.wmf.png": r"\sqrt{2}",
}


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
    if "解析" in text or "解" in text:
        return True
    if re.search(r"[\u4e00-\u9fff]", text):
        return True
    if any(token in text for token in (r"\frac", r"\sin", r"\cos", r"\theta", "=")):
        return True
    return len(text) >= 12


def inline_symbol_for_path(path: str) -> str:
    lowered = str(path or "").lower()
    for suffix, value in INLINE_SYMBOL_MAP.items():
        if lowered.endswith(suffix):
            return value
    return ""


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def repl_html(match: re.Match[str]) -> str:
        normalized = normalize_asset_path(match.group(1))
        symbol = inline_symbol_for_path(normalized)
        if symbol:
            return symbol
        return f"\n[圖:{normalized}]\n" if normalized else ""

    def repl_markdown(match: re.Match[str]) -> str:
        alt = cleanup_import_artifacts(match.group(1))
        normalized = normalize_asset_path(match.group(2))
        symbol = inline_symbol_for_path(normalized)
        if symbol:
            return symbol
        parts: list[str] = []
        if keep_alt_text(alt):
            parts.append(alt)
        if normalized:
            parts.append(f"[圖:{normalized}]")
        return "\n".join(parts)

    value = HTML_IMAGE_RE.sub(repl_html, value)
    value = INLINE_IMAGE_RE.sub(repl_markdown, value)
    return value


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
    if stripped in {"![", "]![", "](", "![1", "!["}:
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


def detect_topic(line: str) -> str | None:
    stripped = plain_line(line)
    match = TOPIC_RE.search(stripped)
    if not match:
        return None
    return f"主題{match.group(1)}：{match.group(2).strip()}"


def detect_marker(line: str) -> str | None:
    stripped = plain_line(line)
    match = MARKER_RE.search(stripped)
    if not match:
        return None
    return re.sub(r"\s+", "", match.group(1))


def parse_markdown_blocks(markdown_text: str) -> list[dict]:
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
                    "section": current_section or "主題1：正餘弦函數的疊合",
                    "raw_text": raw_text,
                }
            )
        buffer = []

    for line in lines:
        topic = detect_topic(line)
        marker = detect_marker(line)

        if topic:
            flush()
            current_section = topic
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


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = UNDERLINE_RE.sub("＿＿＿＿", value)
    value = HTML_COMMENT_RE.sub("", value)
    value = DANGLING_IMAGE_RE.sub("", value)
    value = value.replace("`", "")
    value = value.replace("*", "")
    value = value.replace("\\mspace{6mu}", " ")
    value = value.replace("\\left(", "(").replace("\\right)", ")")
    value = value.replace("\\left[", "[").replace("\\right]", "]")
    value = value.replace("\\left\\{", "{").replace("\\right\\}", "}")
    value = value.replace("\\(", "(").replace("\\)", ")")
    value = value.replace("\\[", "[").replace("\\]", "]")
    value = value.replace("\\|", "|")
    value = value.replace("\\<", "<").replace("\\>", ">")
    value = value.replace("\\$", "$")

    cleaned_lines = []
    for raw_line in value.split("\n"):
        line = plain_line(raw_line)
        if is_decorative_line(line) or should_drop_line(line):
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = cleanup_import_artifacts(value)
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"^\.+", "", value).strip()
    return value


def split_question_and_explanation(raw_text: str) -> tuple[str, str]:
    raw = str(raw_text or "")
    match = EXPLANATION_RE.search(raw)
    if not match:
        return raw, ""
    return raw[: match.start()], raw[match.end() :]


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。；﹒")
    if len(seed) > 32:
        seed = seed[:32].rstrip(" ：，。；﹒")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(section: str, marker: str, title: str, question_text: str, explanation_text: str, index: int) -> str:
    text = "\n".join([section, marker, title, question_text, explanation_text])

    if has_any(text, ["木橋", "矩形", "圓心角", "內接矩形", "周長", "面積有最大值", "T型"]):
        return "senior-trig-superposition-wave-model-s314"

    if has_any(text, ["如圖", "圖形", "與x軸", "與y軸", "波峰", "波谷", "交點", "對稱軸", "對稱於直線"]):
        if has_any(text, ["週期", "頻率", "振幅", "相位", "平移"]):
            return "senior-trig-superposition-graph-reading-s314"
        if marker == "隨堂練習" and has_any(text, ["錯誤", "正確", "選項"]):
            return "senior-trig-superposition-graph-reading-s314"

    if has_any(text, ["週期", "振幅", "頻率", "最大值", "最小值", "對稱軸"]) and has_any(text, ["sin", "cos", "a", "b", "c"]):
        if has_any(text, ["a", "b", "c", "A", "θ"]) and has_any(text, ["求", "為何", "數對", "三元組"]):
            return "senior-trig-superposition-maxmin-parameter-s314"
        if has_any(text, ["ax", "cx", "2x", "3x", "ω", "週期"]):
            return "senior-trig-superposition-frequency-reading-s314"

    if has_any(text, ["0 ≤", "0<", "≤ x ≤", "θ ≤", "−", "≤ x <", "≤ θ ≤"]) and has_any(text, ["最大值", "最小值", "有最大值", "有最小值"]):
        return "senior-trig-superposition-interval-extrema-s314"

    if has_any(text, ["值域", "範圍", "滿足不等式", "實數解", "最大值", "最小值"]) and has_any(
        text, ["sin x", "cos x", "sinx", "cosx", "t =", "令y =", "令k =", "令t ="]
    ):
        if has_any(text, ["y =", "k =", "實數解", "不等式", "值域", "範圍"]) and has_any(text, ["分式", "1 - sin", "2 + sin", "3 + sin", "2 + cos"]):
            return "senior-trig-superposition-equation-solving-s314"

    if has_any(text, ["0 < θ < ", "0 < b <", "sinθ", "cosθ", "α", "β"]) and has_any(text, ["a", "b", "R", "cosα", "sinα", "象限"]):
        return "senior-trig-superposition-phase-quadrant-selection-s314"

    if has_any(text, ["a^2", "b^2", "sqrt", "√", "R ="]) and has_any(text, ["asinx + bcosx", "sinx + cosx", "a sin", "b cos"]):
        return "senior-trig-superposition-parameter-s314"

    if has_any(text, ["最大值", "最小值", "值域", "振幅", "範圍"]):
        return "senior-trig-superposition-range-s314"

    if has_any(text, ["週期", "頻率"]):
        return "senior-trig-superposition-frequency-reading-s314"

    if index in {1, 2, 19, 20}:
        return "senior-trig-superposition-maxmin-parameter-s314"
    if index in {5, 17, 21, 28, 29}:
        return "senior-trig-superposition-interval-extrema-s314"
    if index in {16, 18, 25, 26, 27}:
        return "senior-trig-superposition-equation-solving-s314"
    if index in {31, 32, 33}:
        return "senior-trig-superposition-wave-model-s314"

    return "s3-1-4-sine-cosine-superposition-core"


def apply_manual_fixes(index: int, record: dict):
    if index == 21:
        record["explanation_text"] = record["explanation_text"].replace("其中 −√2≤ t ≤√2", "其中 1 ≤ t ≤√2")

    if index == 30:
        record["explanation_text"] = (
            "sec80° − √3csc80° = 1/cos80° − √3/sin80°\n"
            "= (sin80° − √3cos80°)/(sin80°cos80°)\n"
            "= 2(sin80°cos60° − cos80°sin60°)/(1/2·sin160°)\n"
            "= 4sin20°/sin160° = 4。"
        )

    if index == 31:
        record["question_text"] = (
            "一座「T」型的木橋（如圖），\n"
            "試問此木橋總長$\\overline{AB}+\\overline{CD}$之最大值為＿＿＿＿。\n"
            "[圖:program-db/imports/packs/s3-1-4/assets/media/image17.png]"
        )
        record["explanation_text"] = (
            "設 θ 為圖中的角，則\n"
            "AB = 2BC = 2×(100cosθ) = 200cosθ，CD = OC + OD = 100sinθ + 100。\n"
            "因此 AB + CD = 100(2cosθ + sinθ) + 100 = 100√5·sin(θ + α) + 100，\n"
            "故最大值為 100 + 100√5。\n"
            "[圖:program-db/imports/packs/s3-1-4/assets/media/image17.png]"
        )

    if index == 32:
        record["question_text"] = (
            "若$\\overline{AB}=3$，$\\overline{BC}=7$，且$\\overline{AB}$與$\\overline{AQ}$的夾角為 x，\n"
            "則當 x 為多少弧度時，矩形 PQRS 的周長最大？\n"
            "[圖:program-db/imports/packs/s3-1-4/assets/media/image19.emf.png]"
        )

    if index == 33:
        record["question_text"] = (
            "且圓心角∠AOB = 60°，內接矩形 PQRS 以 ∠AOB 的角平分線 $\\overline{OC}$ 為對稱軸，\n"
            "若連接 $\\overline{OR}$，並令 ∠COR = θ，則下列哪些選項是正確的？\n"
            "(1)$\\overline{SR}=2\\sin\\theta$\n"
            "(2)$\\overline{PS}=\\cos\\theta-\\sqrt{3}\\sin\\theta$\n"
            "(3)矩形 PQRS 的面積為 $\\sin(2\\theta)+\\sqrt{3}\\cos(2\\theta)-\\sqrt{3}$\n"
            "(4)當 θ = 15° 時，矩形 PQRS 的面積有最大值\n"
            "(5)矩形 PQRS 的面積最大值為 $2-\\sqrt{3}$。"
        )
        record["explanation_text"] = (
            "∵矩形 PQRS 以 OC 為對稱軸，故 ∠COR = ∠COS = θ，且 ∠AOC = ∠BOC = 30°。\n"
            "[圖:program-db/imports/packs/s3-1-4/assets/media/image21.emf.png]\n"
            "[圖:program-db/imports/packs/s3-1-4/assets/media/image22.emf.png]\n"
            "(1) SR = 2sinθ。\n"
            "(2) PS = cosθ − √3sinθ。\n"
            "(3) 矩形面積 = PS·PQ = (cosθ − √3sinθ)(2sinθ) = sin2θ + √3cos2θ − √3。\n"
            "(4)(5) 又 0° < θ < 30°，當 2θ + 60° = 90°，即 θ = 15° 時，面積有最大值 2 − √3。\n"
            "故選(1)(2)(3)(4)(5)。"
        )

    record["question_text"] = clean_question_body(record["question_text"])
    record["explanation_text"] = clean_question_body(record["explanation_text"])
    record["title"] = clean_question_title(record["title"])


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = record.get("source_section") or "主題1：正餘弦函數的疊合"
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
        "- `q-s3-1-4-0031`",
        "  - 木橋題的解析原始來源是圖片 alt 夾帶文字，這題已人工重建，建議前端再看一次圖文搭配。",
        "- `q-s3-1-4-0032`",
        "  - 矩形周長最大題依賴附圖，建議確認圖片清晰度與行動版排版。",
        "- `q-s3-1-4-0033`",
        "  - 末題有兩張圖與較長推導，建議前端檢查數學式斷行。",
        "",
        "## Notes",
        "",
        "- 這章使用 `主題1 + 範例/隨堂練習` 重新切題，避免 builder 只抓到 20 題。",
        "- 已將 `範例 -> 基本`、`隨堂練習 -> 重要` 套回正式匯入格式。",
        "- 小圖符號中 `≤`、`√2` 已依章節內容補回文字，不再保留成壞掉圖片片段。",
        "- `wmf/emf` 會自動補成 `.png` sidecar 供前端顯示。",
    ]
    return "\n".join(lines).strip() + "\n"


def copy_support_files(base_dir: Path, pack_dir: Path) -> tuple[str, str]:
    source_dir = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    source_doc = first_match(source_dir / "source", "3A-7*.docx")
    source_md = first_match(source_dir / "extracted", "3A-7*.md")

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
    markdown_path = first_match(source_pack / "extracted", "3A-7*.md")
    markdown_text = markdown_path.read_text(encoding="utf-8")
    blocks = parse_markdown_blocks(markdown_text)

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
        section = block["section"]
        formula_id = formula_id_for(section, marker, title, question_text, explanation_text, index)
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
            "tags": [
                CHAPTER_CODE,
                f"section:{section}",
                f"marker:{marker}",
            ],
        }
        apply_manual_fixes(index, record)
        output_records.append(record)

    questions_payload = {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "questions": output_records,
    }
    write_json(pack_dir / "questions.json", questions_payload)
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
