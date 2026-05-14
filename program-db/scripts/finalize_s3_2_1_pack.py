import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


SOURCE_PACK = "_inspect-3A-1"
SOURCE_DOC = "3A-1轉.docx"
SOURCE_MD = "3A-1轉.md"
CHAPTER_CODE = "s3-2-1"
CHAPTER_TITLE = "指數函數"

TOPIC_RE = re.compile(r"主題\s*([0-9０-９]+)\s*[:：]\s*(.+)")
MARKER_RE = re.compile(r"範例\s*([0-9０-９]+)|隨堂練習")
EXPLANATION_RE = re.compile(r"(【解析】|【詳解】)")
INLINE_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
GENERIC_IMAGE_RE = re.compile(r"\[圖:\s*([^\]]+)\]")
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[(?:\\)?\s*[\]＿_　 ]*\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
SOURCE_LINE_RE = re.compile(
    r"(?m)^【[^】]*(?:自命題|段考|期中|期末|模擬|講義|女中|高中|一中|附中|學測|北一女|龍騰|康熹|南一|翰林)[^】]*】\s*$"
)
DECORATIVE_RE = re.compile(r"^[\s|:+\-─=]+$")
PAGE_ARTIFACT_RE = re.compile(r"^\*\\\*$")
MATH_BACKTICK_RE = re.compile(r"\$`(.*?)`\$", re.S)
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
TEXT_WRAPPER_RE = re.compile(r"\\text\{([^}]*)\}")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


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


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def repl(match: re.Match[str]) -> str:
        normalized = normalize_asset_path(match.group(1))
        return f"\n[圖:{normalized}]\n" if normalized else ""

    value = HTML_IMAGE_RE.sub(repl, value)
    value = INLINE_IMAGE_RE.sub(repl, value)
    value = GENERIC_IMAGE_RE.sub(
        lambda match: f"[圖:{normalize_asset_path(match.group(1))}]",
        value,
    )
    return value


def is_decorative_line(line: str) -> bool:
    stripped = str(line or "").strip()
    if not stripped:
        return True
    if PAGE_ARTIFACT_RE.fullmatch(stripped):
        return True
    return bool(DECORATIVE_RE.fullmatch(stripped))


def plain_line(line: str) -> str:
    value = str(line or "").rstrip()
    stripped = value.strip()
    if stripped.startswith("|") and stripped.endswith("|"):
        stripped = stripped[1:-1].strip()
    stripped = stripped.replace("**", "").strip()
    return stripped


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
    if match.group(1):
        return f"範例{match.group(1)}"
    return "隨堂練習"


def parse_markdown_blocks(markdown_text: str) -> list[dict]:
    lines = markdown_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    current_section = ""
    current_marker = ""
    buffer: list[str] = []
    blocks: list[dict] = []

    def flush():
        nonlocal buffer, current_marker, current_section
        if not current_marker:
            buffer = []
            return
        raw_lines = [line for line in buffer if not is_decorative_line(line)]
        raw_text = "\n".join(raw_lines).strip()
        if raw_text:
            blocks.append(
                {
                    "marker": current_marker,
                    "section": current_section or "未分類",
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
    value = HTML_COMMENT_RE.sub("", value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = UNDERLINE_RE.sub("＿＿＿＿＿＿", value)
    value = MATH_BACKTICK_RE.sub(lambda match: f"${match.group(1).strip()}$", value)
    value = TEXT_WRAPPER_RE.sub(lambda match: match.group(1), value)
    value = value.replace("``{=html}", "")
    value = value.replace("{=html}", "")
    value = value.replace("*", "")
    replacements = {
        "\\mspace{6mu}": " ",
        "\\cdots": "…",
        "\\times": "×",
        "\\cdot": "·",
        "\\Rightarrow": "⇒",
        "\\Leftrightarrow": "⇔",
        "\\therefore": "∴",
        "\\because": "∵",
        "\\left(": "(",
        "\\right)": ")",
        "\\left[": "[",
        "\\right]": "]",
        "\\left\\{": "{",
        "\\right\\}": "}",
        "\\(": "(",
        "\\)": ")",
        "\\[": "[",
        "\\]": "]",
        "\\|": "|",
        "\\<": "<",
        "\\>": ">",
        "\\$": "$",
        "﹐": "，",
        "﹒": "。",
        "﹕": "：",
        "﹖": "？",
        "　": " ",
        "⥂": "⇒",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = SOURCE_LINE_RE.sub("", value)
    cleaned_lines = []
    for raw_line in value.split("\n"):
        line = raw_line.rstrip()
        if is_decorative_line(line):
            continue
        stripped = line.strip()
        if stripped.startswith("|") and stripped.endswith("|"):
            stripped = stripped[1:-1].strip()
        cleaned_lines.append(stripped)
    value = "\n".join(cleaned_lines)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def split_question_and_explanation(raw_text: str) -> tuple[str, str]:
    raw = str(raw_text or "")
    match = EXPLANATION_RE.search(raw)
    if not match:
        return raw, ""
    question = raw[: match.start()]
    explanation = raw[match.end() :]
    return question, explanation


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。")
    if len(seed) > 30:
        seed = seed[:30].rstrip(" ：，。")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(section: str, title: str, question_text: str, explanation_text: str) -> str:
    text = f"{section}\n{title}\n{question_text}\n{explanation_text}"

    if has_any(text, ["複利", "本利和", "年利率", "計息", "存款", "銀行"]):
        return "senior-compound-interest-exponential-s321"

    if has_any(text, ["冷卻", "解凍", "細菌", "果蠅", "保鮮", "培養容器", "病毒", "濃度", "細胞", "每隔", "倍增", "衰退", "布袋蓮"]):
        if has_any(text, ["關係圖", "資料", "觀察", "回推", "圖"]):
            return "senior-exponential-linearization-s321"
        return "senior-exponential-growth-decay-model-s321"

    if has_any(text, ["由圖形求方程式實根", "水平線", "恰有一交點", "一對一", "a^{α} = a^{β}", "a^α = a^β"]):
        return "senior-exponential-horizontal-line-test-s321"

    if has_any(text, ["分數次方", "負次方", "指數律"]):
        return "senior-exponent-laws-overview-s321"

    if section == "主題1：指數函數的圖形":
        if has_any(text, ["圖形", "對稱", "遞增", "遞減", "漸近線", "交點", "斜率", "|x|", "絕對值"]):
            return "senior-exponential-graph-properties-s321"
        if has_any(text, ["倍率", "每隔", "固定比例"]):
            return "senior-exponential-ratio-growth-interpretation-s321"
        if has_any(text, ["大小", "由大而小", "比較", "順序", "何者正確", "哪個較大"]):
            return "senior-exponential-base-comparison-s321"
        return "s3-2-1-exponential-function-core"

    if section == "主題2：指數方程式":
        if has_any(text, ["令t =", "代換", "2^x + 2^{-x}", "2^x + 2^−x", "a^x = t", "設t =", "x+y"]):
            return "senior-exponential-substitution-techniques-s321"
        return "senior-exponential-equations-inequalities-s321"

    if section.startswith("主題3："):
        if has_any(text, ["令t =", "代換", "最大值", "最小值", "極值", "範圍", "2^x + 2^{-x}", "2^x + 2^−x"]):
            return "senior-exponential-substitution-techniques-s321"
        return "senior-exponential-equations-inequalities-s321"

    if has_any(text, ["大小", "由大而小", "比較", "順序", "何者正確", "哪個較大"]) and not has_any(
        text, ["方程式", "不等式", "解為", "實根", "範圍", "最大值", "最小值"]
    ):
        return "senior-exponential-base-comparison-s321"

    return "senior-exponential-function-main-s321"


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = record.get("source_section") or "未分類"
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


def build_manifest() -> dict:
    return {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "source_files": [
            {"path": f"source/{SOURCE_DOC}", "role": "primary_docx"},
        ],
        "extracted_files": [
            {"path": f"extracted/{SOURCE_MD}", "role": "pandoc_markdown"},
            {"path": "questions.json", "role": "question_pack_preview"},
            {"path": "preview.json", "role": "assignment_preview"},
            {"path": "review-needed.md", "role": "manual_review_notes"},
        ],
        "asset_roots": [
            {"path": "assets/media", "role": "pandoc_extracted_media"},
        ],
        "status": "review_ready",
        "updated_at": datetime.now().astimezone().isoformat(),
    }


def build_review(records: list[dict]) -> str:
    image_heavy = []
    for record in records:
        total_images = record["question_text"].count("[圖:") + record["explanation_text"].count("[圖:")
        if total_images >= 2:
            image_heavy.append((record["id"], total_images, record["title"]))
    image_heavy = image_heavy[:8]

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
        lines.append(f"  - 題目或解析含 {image_count} 張圖，建議前端檢查圖文搭配：{title}")
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- 這章改用章節專用 parser，直接依 `主題1/2/3` 與 `範例/隨堂練習` 重建切題。",
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已沿用既有規則。",
            "- `wmf/emf` 已補成對應的 `.png` sidecar，供前端顯示。",
        ]
    )
    return "\n".join(lines).strip() + "\n"


def copy_support_files(base_dir: Path, pack_dir: Path):
    source_dir = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    shutil.copy2(source_dir / "source" / SOURCE_DOC, pack_dir / "source" / SOURCE_DOC)
    shutil.copy2(source_dir / "extracted" / SOURCE_MD, pack_dir / "extracted" / SOURCE_MD)
    asset_source = source_dir / "assets" / "media"
    asset_target = pack_dir / "assets" / "media"
    asset_target.mkdir(parents=True, exist_ok=True)
    for item in asset_source.iterdir():
        if item.is_file():
            shutil.copy2(item, asset_target / item.name)
    ensure_png_sidecars(asset_target)


def build_pack(base_dir: Path):
    source_pack = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    markdown_path = source_pack / "extracted" / SOURCE_MD
    markdown_text = markdown_path.read_text(encoding="utf-8")
    blocks = parse_markdown_blocks(markdown_text)

    pack_dir = base_dir / "program-db" / "imports" / "packs" / CHAPTER_CODE
    (pack_dir / "source").mkdir(parents=True, exist_ok=True)
    (pack_dir / "extracted").mkdir(parents=True, exist_ok=True)
    (pack_dir / "assets" / "media").mkdir(parents=True, exist_ok=True)

    copy_support_files(base_dir, pack_dir)

    output_records = []
    for index, block in enumerate(blocks, start=1):
        marker = block["marker"]
        raw_question, raw_explanation = split_question_and_explanation(block["raw_text"])
        question_text = normalize_text(raw_question)
        explanation_text = normalize_text(raw_explanation)
        answer_text = ""
        title = rebuild_title(marker, question_text)
        category = "基本" if marker.startswith("範例") else "重要"
        difficulty = "易" if category == "基本" else "中"
        section = block["section"]
        formula_id = formula_id_for(section, title, question_text, explanation_text)
        tags = [
            CHAPTER_CODE,
            f"section:{section}",
            f"marker:{marker}",
        ]
        output_records.append(
            {
                "id": f"q-{CHAPTER_CODE}-{index:04d}",
                "title": title,
                "question_text": question_text,
                "answer_text": answer_text,
                "explanation_text": explanation_text,
                "chapter_code": CHAPTER_CODE,
                "formula_id": formula_id,
                "difficulty": difficulty,
                "question_category": category,
                "source_type": "docx_pack_markdown",
                "source_ref": f"source/{SOURCE_DOC}",
                "source_section": section,
                "source_order": index,
                "tags": tags,
            }
        )

    questions_payload = {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "questions": output_records,
    }
    write_json(pack_dir / "questions.json", questions_payload)
    write_json(pack_dir / "preview.json", build_preview(output_records))
    write_json(pack_dir / "manifest.json", build_manifest())
    (pack_dir / "review-needed.md").write_text(build_review(output_records), encoding="utf-8")

    print(
        f"{CHAPTER_CODE}: questions={len(output_records)}, "
        f"assigned={sum(1 for row in output_records if row.get('formula_id'))}"
    )
    print(Counter(row["source_section"] for row in output_records))
    print(Counter(row["formula_id"] for row in output_records))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-dir", default=".", help="Workspace root")
    args = parser.parse_args()
    base_dir = Path(args.base_dir).resolve()
    build_pack(base_dir)


if __name__ == "__main__":
    main()
