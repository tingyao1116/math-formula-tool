import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


SOURCE_PACK = "_inspect-3A-5"
CHAPTER_CODE = "s3-1-2"
CHAPTER_TITLE = "三角函數的圖形"

TOPIC_RE = re.compile(r"主題\s*(\d+)\s*[:：]\s*(.+)")
MARKER_RE = re.compile(r"(範例\s*\d+|隨堂練習)")
EXPLANATION_RE = re.compile(r"(?:【解析】|【證明】|【解答】|【解】)")
INLINE_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]+\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
SOURCE_LINE_RE = re.compile(r"^【龍騰自命題】$", re.M)


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


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def repl(match: re.Match[str]) -> str:
        normalized = normalize_asset_path(match.group(1))
        return f"\n[圖:{normalized}]\n" if normalized else ""

    value = HTML_IMAGE_RE.sub(repl, value)
    value = INLINE_IMAGE_RE.sub(repl, value)
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
                    "section": current_section or "主題1：三角函數的圖形",
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
    value = SOURCE_LINE_RE.sub("", value)

    cleaned_lines = []
    for raw_line in value.split("\n"):
        line = plain_line(raw_line)
        if is_decorative_line(line):
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
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
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。")
    if len(seed) > 32:
        seed = seed[:32].rstrip(" ：，。")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(section: str, title: str, question_text: str, explanation_text: str) -> str:
    text = "\n".join([section, title, question_text, explanation_text])

    if has_any(text, ["交點", "解的個數", "logx", "log|", "x/10", "x/π", "直線", "對數", "方程", "圖解", "實根", "共有幾個實根"]):
        return "senior-trig-graph-symmetry-extrema-s312"

    if has_any(text, ["無意義", "漸近線", "定義域", "值域", "奇函數", "偶函數", "遞增", "遞減", "對稱中心", "對稱軸"]):
        if has_any(text, ["sin", "正弦"]):
            return "senior-sine-graph-properties-s312"
        if has_any(text, ["cos", "餘弦"]):
            return "senior-cosine-graph-properties-s312"
        if has_any(text, ["tan", "正切", "cot", "餘切", "sec", "csc"]):
            return "senior-tangent-graph-properties-s312"

    if has_any(text, ["如圖", "由圖", "圖形如", "圖上", "一個週期之圖形", "求 a", "求 b", "求 c", "求 d", "(a,b)", "通過點", "在圖形上"]) and has_any(
        text, ["sin", "cos", "tan", "a + bcos", "週期", "振幅", "平移"]
    ):
        return "senior-trig-graph-phase-shift-reading-s312"

    if has_any(text, ["定義域", "值域", "奇函數", "偶函數", "漸近線", "遞增", "遞減", "對稱中心", "對稱軸"]):
        if has_any(text, ["sin", "正弦"]):
            return "senior-sine-graph-properties-s312"
        if has_any(text, ["cos", "餘弦"]):
            return "senior-cosine-graph-properties-s312"
        if has_any(text, ["tan", "正切", "cot", "餘切", "sec", "csc"]):
            return "senior-tangent-graph-properties-s312"

    if has_any(text, ["最大值", "最小值", "最值", "對稱", "奇函數", "偶函數"]) and has_any(text, ["sin", "cos", "tan", "cot", "sec", "csc"]):
        return "senior-trig-graph-symmetry-extrema-s312"

    if has_any(text, ["週期"]) or ("望" in text and has_any(text, ["f(x)", "函數", "sin", "cos", "tan", "cot", "sec", "csc"])):
        if has_any(text, ["|sin", "|cos", "|tan", "|cot", "|sec", "|csc", "sin|x|", "cos|x|", "tan|x|", "cot|x|", "sec|x|", "csc|x|", "絕對值"]):
            return "senior-trig-abs-special-period-s312"
        if has_any(text, ["+", "log", "secx", "sec x", "複合", "最小正週期", "P/|k|", "lcm", "公倍數", "f(kx)", "鐘擺", "交流電", "時間t", "位移y"]):
            return "senior-trig-composite-period-lcm-s312"
        return "senior-trig-period-summary-s312"

    if has_any(text, ["平移", "伸縮", "振幅", "相位", "向左", "向右", "振動", "擺動", "參數", "a + bcos", "asin", "acos", "圖形向"]) or has_any(
        text, ["2sin", "3sin", "sin(", "cos(", "tan("]
    ) and has_any(text, ["圖形", "作圖", "平移", "伸長", "壓縮"]):
        if has_any(text, ["圖上", "由圖", "求 a", "求 b", "求 c", "求 d", "通過", "已知點", "如圖", "從圖判讀", "x 軸", "y 軸"]):
            return "senior-trig-graph-phase-shift-reading-s312"
        return "senior-trig-transformations-s312"

    return "s3-1-2-trig-graph-core"


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = record.get("source_section") or "主題1：三角函數的圖形"
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
    image_heavy = []
    for record in records:
        total_images = record["question_text"].count("[圖:") + record["explanation_text"].count("[圖:")
        if total_images >= 2:
            image_heavy.append((record["id"], total_images, record["title"]))
    image_heavy = image_heavy[:10]

    lines = [
        f"# {CHAPTER_CODE} Review Needed",
        "",
        "## Current extraction status",
        "",
        f"- Parsed question records: {len(records)}",
        f"- Assigned `formula_id`: {sum(1 for row in records if row.get('formula_id'))}",
        f"- Image-heavy review items: {len(image_heavy)}",
        "",
        "## Manual review items",
        "",
    ]
    for record_id, image_count, title in image_heavy:
        lines.append(f"- `{record_id}`")
        lines.append(f"  - 含 {image_count} 張圖片，建議以前端確認圖文排列：{title}")
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- 本章以 `主題1 / 範例 / 隨堂練習` marker 重新切題，不沿用通用 builder 的 12 題結果。",
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已保留。",
            "- 題目依性質分流到圖形性質、平移伸縮、週期、相位判讀、絕對值週期特例等分支。",
            "- `wmf/emf` 已轉成 `.png` sidecar 供顯示層使用。",
        ]
    )
    return "\n".join(lines).strip() + "\n"


def copy_support_files(base_dir: Path, pack_dir: Path) -> tuple[str, str]:
    source_dir = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    source_doc = first_match(source_dir / "source", "3A-5*.docx")
    source_md = first_match(source_dir / "extracted", "3A-5*.md")

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
    markdown_path = first_match(source_pack / "extracted", "3A-5*.md")
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
        formula_id = formula_id_for(section, title, question_text, explanation_text)
        output_records.append(
            {
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
        )

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
