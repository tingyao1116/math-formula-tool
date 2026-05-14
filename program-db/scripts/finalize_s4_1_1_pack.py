import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


SOURCE_PACK = "_inspect-4A-1"
CHAPTER_CODE = "s4-1-1"
CHAPTER_TITLE = "空間概念"

TOPIC_RE = re.compile(r"主題\s*(\d+)\s*[:：]\s*(.+)")
MARKER_RE = re.compile(r"^(範例\s*\d+|隨堂練習)\s*$")
EXPLANATION_RE = re.compile(r"(?:【解析】|【詳解】|【解】|解析：|解：)")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[\s*[　 ]*\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
SOURCE_NOTE_RE = re.compile(r"^【[^】]*(?:自命題|期中考|期末考|段考|模擬考|女中|高中|中學)[^】]*】$")
RAW_INSPECT_MEDIA_RE = re.compile(
    r"\(?\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-4A-1[\\/]+assets[\\/]+media[\\/][^)\]\s]+(?:\.(?:png|jpg|jpeg|emf|wmf))\)?",
    re.I,
)


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
    if stripped in {"![", "]![", "](", "![1", "![", "\\", "\\\\", "]", "["}:
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
    value = value.replace("﹐", "，").replace("﹒", "。").replace("╳", "×").replace("○", "○")
    value = re.sub(r"\+\-+\+", "", value)
    value = re.sub(r"^[\]\).,，。；﹒\s]+", "", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。；﹒")
    if len(seed) > 34:
        seed = seed[:34].rstrip(" ：，。；﹒")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(section: str, marker: str, title: str, question_text: str, explanation_text: str) -> str:
    text = "\n".join([section, marker, title, question_text, explanation_text])

    if section.startswith("主題2"):
        return "senior-space-three-perpendicular-theorem-s411"

    if has_any(text, ["正射影", "投影", "射影", "歪斜線在平面上之射影"]):
        return "senior-space-concepts-projection-workflow-s411"

    if has_any(
        text,
        [
            "兩面角",
            "二面角",
            "體積",
            "最短距離",
            "距離",
            "長方體",
            "四面體",
            "正四面體",
            "金字塔",
            "cos",
            "sin",
            "tan",
        ],
    ):
        return "senior-space-concepts-distance-angle-s411"

    if has_any(text, ["決定一平面", "歪斜", "共面", "不共線", "相交之兩相異直線", "兩平行線決定一平面"]):
        return "senior-space-concepts-coplanar-test-s411"

    return "senior-space-line-plane-position-cases-s411"


def apply_manual_fixes(record: dict):
    if record["id"] == "q-s4-1-1-0018":
        record["title"] = "隨堂練習：正四面體的高、體積與球半徑"
        record["question_text"] = (
            "設一正四面體A－BCD的稜長為a，求：\n"
            "(1)正四面體的高。\n"
            "(2)正四面體的體積。\n"
            "(3)內切球半徑。\n"
            "(4)外接球半徑。\n"
            "(5)若平面ABC與平面BCD之夾角為θ，則cosθ＝＿＿＿＿。\n"
            "(6)$\\overline{AD}$與$\\overline{BC}$之距離為＿＿＿＿。"
        )
        record["explanation_text"] = record["explanation_text"].replace(
            "$$\\overline{MN} = \\sqrt{{\\overline{AM}}^{2} - {\\overline{AN}}^{2}} = "
            "\\sqrt{(\\frac{\\sqrt{3}}{2}a)^{2} - (\\frac{a}{2})^{2}} = \\frac{\\sqrt{2}}{2}a$$]",
            "$\\overline{MN} = \\sqrt{{\\overline{AM}}^{2} - {\\overline{AN}}^{2}} = "
            "\\sqrt{(\\frac{\\sqrt{3}}{2}a)^{2} - (\\frac{a}{2})^{2}} = \\frac{\\sqrt{2}}{2}a$",
        )

    if record["id"] == "q-s4-1-1-0028":
        record["title"] = "範例6：三垂線定理的證明與應用"
        record["question_text"] = record["question_text"].replace(
            "[圖:program-db/imports/packs/s4-1-1/assets/media/image41.png",
            "[圖:program-db/imports/packs/s4-1-1/assets/media/image41.png]\n[圖:program-db/imports/packs/s4-1-1/assets/media/image42.wmf.png]",
        )
        record["question_text"] = record["question_text"].replace("(.\n", "").replace("(.", "")
        record["explanation_text"] = record["explanation_text"].replace("==", "=")

    if record["id"] == "q-s4-1-1-0020":
        record["title"] = "範例14：球內接正八面體的邊長、對角線與體積"
        record["explanation_text"] = record["explanation_text"].replace(
            "(.\\program-db\\imports\\packs\\_inspect-4A-1\\assets\\media\\image30.png)",
            "[圖:program-db/imports/packs/s4-1-1/assets/media/image30.png]",
        )

    if record["id"] == "q-s4-1-1-0025":
        record["title"] = "範例3：三垂線定理求線段長"
        record["question_text"] = (
            "已知$\\overline{AB}$⊥平面E，$\\overline{CB}$⊥直線L，B、C為垂足，"
            "若$\\overline{AB}$= 8，$\\overline{BC}$= 6，$\\overline{CD}$= 2$\\sqrt{11}$，"
            "則$\\overline{AD}$=＿＿＿＿。\n"
            "[圖:program-db/imports/packs/s4-1-1/assets/media/image37.png]\n"
            "[圖:program-db/imports/packs/s4-1-1/assets/media/image38.png]"
        )

    if record["id"] == "q-s4-1-1-0026":
        record["question_text"] = "若$\\overline{PA}$= 3，$\\overline{AB}$= 4，$\\overline{BC}$=12，則$\\overline{PC}$=＿＿＿＿。"
        record["explanation_text"] = record["explanation_text"].replace(
            "$\\overline{PB}$=$\\sqrt{{\\overline{PA}}^{2} + {\\overline{PB}}^{2}}$",
            "$\\overline{PB}$=$\\sqrt{{\\overline{PA}}^{2} + {\\overline{AB}}^{2}}$",
        )

    if record["id"] == "q-s4-1-1-0027":
        record["explanation_text"] = record["explanation_text"].replace(
            "(.\\program-db\\imports\\packs\\_inspect-4A-1\\assets\\media\\image40.png)",
            "[圖:program-db/imports/packs/s4-1-1/assets/media/image40.png]",
        )

    if record["id"] == "q-s4-1-1-0022":
        record["title"] = "範例15：正三角錐的面角與高"
        record["explanation_text"] = record["explanation_text"].replace(
            r"\frac{1^{2} + (\frac{\sqrt{3}}{2})^{2} - (\frac{\sqrt{3}}{2})^{2}}{2 \rightleftharpoons ． \rightleftharpoons 1 \rightleftharpoons ．\frac{\sqrt{3}}{2}}",
            r"\frac{1^{2} + (\frac{\sqrt{3}}{2})^{2} - (\frac{\sqrt{3}}{2})^{2}}{2\cdot 1 \cdot \frac{\sqrt{3}}{2}}",
        )
        record["explanation_text"] = record["explanation_text"].replace(
            r"\frac{(\frac{\sqrt{3}}{2})^{2} + (\frac{\sqrt{3}}{2})^{2} - (\sqrt{2})^{2}}{2 \rightleftharpoons ． \rightleftharpoons \frac{\sqrt{3}}{2} \rightleftharpoons ． \rightleftharpoons \frac{\sqrt{3}}{2}}",
            r"\frac{(\frac{\sqrt{3}}{2})^{2} + (\frac{\sqrt{3}}{2})^{2} - (\sqrt{2})^{2}}{2\cdot \frac{\sqrt{3}}{2}\cdot \frac{\sqrt{3}}{2}}",
        )
        record["explanation_text"] = record["explanation_text"].replace(
            r"−$\sqrt{\frac{1}{( - \frac{1}{3})^{2}} \rightleftharpoons - \rightleftharpoons 1}$",
            r"2\sqrt{2}",
        )
        record["explanation_text"] = record["explanation_text"].replace(
            r"tanβ = tan∠BHD = 2\sqrt{2}= − 2$\sqrt{2}$。",
            r"tanβ = tan∠BHD = 2$\sqrt{2}$。",
        )

    record["question_text"] = clean_question_body(record["question_text"])
    record["explanation_text"] = clean_question_body(record["explanation_text"])
    record["title"] = clean_question_title(record["title"])


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = record.get("source_section") or "主題1：空間概念"
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
            "  - q-s4-1-1-0012：多張投影圖，請看前端版面是否順。",
            "  - q-s4-1-1-0018：正四面體綜合題，含多小題與圖片解析。",
            "  - q-s4-1-1-0024：題圖由兩張圖片組成，請確認顯示順序。",
            "  - q-s4-1-1-0028：三垂線定理證明題，公式與推導較長。",
            "  - q-s4-1-1-0030：點到直線最短距離題，圖文依賴高。",
        ]
    )


def copy_support_files(base_dir: Path, pack_dir: Path) -> tuple[str, str]:
    source_pack = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    source_doc = first_match(source_pack / "source", "4A-1*.docx")
    source_md = first_match(source_pack / "extracted", "4A-1*.md")

    target_doc = pack_dir / "source" / source_doc.name
    target_md = pack_dir / "extracted" / source_md.name.replace("4A-1轉", "4A-1轉")
    shutil.copy2(source_doc, target_doc)
    shutil.copy2(source_md, target_md)

    media_src = source_pack / "assets" / "media"
    media_dst = pack_dir / "assets" / "media"
    media_dst.mkdir(parents=True, exist_ok=True)
    shutil.copytree(media_src, media_dst, dirs_exist_ok=True)
    return target_doc.name, target_md.name


def build_pack(base_dir: Path):
    source_pack = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    markdown_path = first_match(source_pack / "extracted", "4A-1*.md")
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
        section = block["section"] or ("主題1：空間概念" if index <= 21 else "主題2：三垂線定理")
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
    print(Counter(row["formula_id"] for row in output_records))


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parents[2]
    build_pack(base_dir)
