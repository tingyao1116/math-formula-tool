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

SOURCE_PACK = "_inspect-5A-8"
CHAPTER_CODE = "s5-8"
CHAPTER_TITLE = "微分"
SOURCE_REF = "source/5A-8轉.docx"
MARKER_RE = re.compile(r"\*\*(範例\s*\d+|範例\d+|隨堂練習)\*\*")
TOPIC_RE = re.compile(r"\*{2,3}\s*主題\s*(\d+)\s*：\s*(.+?)\*{2,3}")
SOURCE_LINE_RE = re.compile(r"^【[^】]+】$")
KEEP_SOURCE_LINE = {"【解析】", "【另解】", "【詳解】", "【證明】"}
TABLE_BORDER_RE = re.compile(r"^[+:|\-=\s]+$")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
WRAPPED_MEDIA_BLOCK_RE = re.compile(
    r"!\[(?P<alt>[\s\S]*?)\]\((?P<path>\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-8[\\/]+assets[\\/]+media[\\/][^)]+)\)\{[^{}]*\}",
    re.S,
)
MD_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[([^\]]+)\]\{\.underline\}")
EMPTY_UNDERLINE_RE = re.compile(r"\[\s*[　 ]*\]\{\.underline\}")
RAW_MEDIA_RE = re.compile(
    r"\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-8[\\/]+assets[\\/]+media[\\/][^)\]\s]+",
    re.I,
)
WHITESPACE_RE = re.compile(r"[ \t]{2,}")
SPECIAL_INLINE_TEXT = {
    "image6.jpeg": "≠",
    "image7.wmf": "2a + b = 4",
    "image10.wmf": r"$\lim_{h \rightarrow 0}$",
    "image11.wmf": r"$\frac{d}{dx}$",
    "image12.wmf": "∴",
    "image15.wmf": r"$\frac{d}{dx}$",
    "image16.wmf": "⇒",
}


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
    match = MARKER_RE.search(text)
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


def inline_text_for_asset(raw_path: str) -> str:
    filename = Path(str(raw_path or "").replace("\\", "/")).name.lower()
    return SPECIAL_INLINE_TEXT.get(filename, "")


def image_label_from_alt(alt: str) -> str:
    text = cleanup_import_artifacts(str(alt or "")).strip()
    if not text or text in {"1", "不等號"}:
        return ""
    if re.fullmatch(r"(?:Image|image)\d+", text):
        return ""
    if re.fullmatch(r"0?\d+(?:-\d+)*", text):
        return ""
    if re.fullmatch(r"[\w-]+", text):
        return ""
    return text


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def repl_html(match: re.Match[str]) -> str:
        inline_text = inline_text_for_asset(match.group(1))
        if inline_text:
            return inline_text
        path = canonical_asset_path(match.group(1))
        return f"\n[圖:{path}]\n" if path else ""

    def repl_md(match: re.Match[str]) -> str:
        raw_path = match.group(2)
        inline_text = inline_text_for_asset(raw_path)
        if match.group(1) == "不等號":
            return "≠"
        if inline_text:
            return inline_text
        path = canonical_asset_path(raw_path)
        label = image_label_from_alt(match.group(1))
        parts: list[str] = []
        if label and label != "【龍騰自命題】":
            parts.append(label)
        if path:
            parts.append(f"[圖:{path}]")
        return "\n".join(parts)

    value = HTML_IMAGE_RE.sub(repl_html, value)
    value = MD_IMAGE_RE.sub(repl_md, value)
    return value


def unwrap_wrapped_media_block(text: str) -> str:
    value = str(text or "")
    if "![【" not in value:
        return value

    def repl(match: re.Match[str]) -> str:
        alt = cleanup_import_artifacts(match.group("alt")).strip()
        raw_path = match.group("path")
        inline_text = inline_text_for_asset(raw_path)
        path = canonical_asset_path(raw_path)
        parts: list[str] = []
        if alt and alt not in {"1", "【龍騰自命題】"}:
            parts.append(alt)
        if inline_text:
            parts.append(inline_text)
        elif path:
            parts.append(f"[圖:{path}]")
        return "\n".join(parts)

    return WRAPPED_MEDIA_BLOCK_RE.sub(repl, value)


def strip_source_lines(lines: list[str]) -> list[str]:
    output: list[str] = []
    for raw_line in lines:
        line = clean_table_line(raw_line)
        if not line:
            output.append("")
            continue
        if SOURCE_LINE_RE.fullmatch(line) and line not in KEEP_SOURCE_LINE:
            continue
        output.append(line)
    return output


def split_question_and_explanation(raw_text: str) -> tuple[str, str]:
    unwrapped_text = unwrap_wrapped_media_block(raw_text)
    lines = strip_source_lines(str(unwrapped_text or "").split("\n"))
    parsed_lines: list[str] = []
    explanation_index: int | None = None

    for line in lines:
        if "【解析】" in line and explanation_index is None:
            prefix, _, suffix = line.partition("【解析】")
            if prefix.strip():
                parsed_lines.append(prefix.strip())
            explanation_index = len(parsed_lines)
            parsed_lines.append("【解析】")
            if suffix.strip():
                parsed_lines.append(suffix.strip())
            continue
        parsed_lines.append(line)

    if explanation_index is None:
        return "\n".join(parsed_lines).strip(), ""
    question_lines = parsed_lines[:explanation_index]
    explanation_lines = parsed_lines[explanation_index:]
    return "\n".join(question_lines).strip(), "\n".join(explanation_lines).strip()


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = EMPTY_UNDERLINE_RE.sub("_____ ", value)
    value = UNDERLINE_RE.sub(r"\1", value)
    value = RAW_MEDIA_RE.sub("", value)
    value = value.replace("<!-- -->", "")
    value = value.replace("\\mspace{6mu}", " ")
    value = value.replace("\\bullet", "．")
    value = value.replace("\\|", "|")
    value = value.replace("\\<", "<")
    value = value.replace("\\>", ">")
    value = value.replace("\\(", "(")
    value = value.replace("\\)", ")")
    value = value.replace("\\lbrack", "[")
    value = value.replace("\\rbrack", "]")
    value = value.replace("﹐", "，")
    value = value.replace("﹒", "。")
    value = value.replace("﹖", "？")
    value = value.replace("﹕", "：")
    value = value.replace("∴ ", "∴")
    value = value.replace("∵ ", "∵")
    value = value.replace("。。", "。")
    value = value.replace("$﹒", "$。")
    value = value.replace("　", " ")
    value = value.replace("│", "|")
    value = value.replace("＝", "=")
    value = value.replace("＜", "<")
    value = value.replace("＞", ">")
    value = value.replace("〔", "[")
    value = value.replace("〕", "]")
    value = value.replace("‧", "·")
    value = value.replace("‚", "，")
    value = value.replace("L\\'", "L'")
    value = value.replace("f \\'（a）", "f'(a)")
    value = value.replace("f ′", "f'")
    value = value.replace("g ′", "g'")
    value = value.replace("f ″", "f''")
    value = value.replace("·", "·")
    value = value.replace(" !=", " ≠ ")
    value = value.replace("≠0，。", "≠0。")
    value = value.replace("⇒", " ⇒ ")
    value = value.replace("∴", " ∴ ")
    value = value.replace(r"\mathbb{\in N}", r"\in \mathbb{N}")
    value = value.replace(r"\mathbb{\in R}", r"\in \mathbb{R}")
    value = value.replace("x ^−\\ 2^", "x^{-2}")
    value = value.replace("___", "_____")

    cleaned_lines: list[str] = []
    for raw_line in value.split("\n"):
        line = clean_table_line(raw_line)
        if not line:
            cleaned_lines.append("")
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"\*{1,3}", "", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = WHITESPACE_RE.sub(" ", value)
    value = re.sub(r"(?<=\d)。(?=\d)", ".", value)
    value = re.sub(r"([fghyx])\s+\(([^)]+)\)", r"\1(\2)", value)
    value = re.sub(r"([fghyx])\s+'\(([^)]+)\)", r"\1'(\2)", value)
    value = cleanup_import_artifacts(value)
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value).strip()
    return value


def build_title(marker: str, question_text: str) -> str:
    text = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    text = text.replace("\n", " ")
    title_seed = re.sub(r"\$[^$]*\$", "", text)
    title_seed = re.sub(r"[，﹐]{2,}", "，", title_seed)
    title_seed = re.sub(r"[。﹒]{2,}", "。", title_seed)
    title_seed = re.sub(r"[，﹐][。﹒]", "。", title_seed)
    title_seed = re.sub(r"\(\d+\)", "", title_seed)
    title_seed = re.sub(r"\s+", " ", title_seed).strip()
    snippet = title_seed[:30].rstrip("，。；：、 ")
    return clean_question_title(f"{marker}：{snippet}") if snippet else marker


def difficulty_from_marker(marker: str) -> str:
    return "易" if marker.startswith("範例") else "中"


def category_from_marker(marker: str) -> str:
    return "基本" if marker.startswith("範例") else "重要"


def assign_formula_id(section: str, question_text: str, explanation_text: str) -> str:
    text = f"{question_text}\n{explanation_text}"
    tangent_tokens = ("切線", "切點", "斜率", "導數", "瞬時速度", "平均速度", "法線")
    normal_tokens = ("法線", "normal", "垂直", "法線方程式")
    rules_tokens = ("導函數", "可微分", "商法則", "乘法則", "導函數及其性質", "f'(x)", "g'(x)")
    quotient_tokens = ("商法則", "x - 1)^2", "x^{-", "\\frac{f(x)}{g(x)}", "\\frac{1}{g", "(x - 1)^{2}")
    chain_tokens = ("合成函數", "鏈鎖", "u(x)", "高階導函數", "Taylor", "泰勒", "(2x + 1)", "(x^{2} + x - 1)^5", "|2x - 1| + |3x + 1|")
    nested_tokens = ("(2x + 1)^10", "(x^{2} + x - 1)^5", "(2x^3", "sqrt{x^{2} + 1}", "x^{3}) = x^{2}", "f(x^{2})", "三層")

    if section.startswith("主題3") or any(token in text for token in chain_tokens):
        if any(token in text for token in nested_tokens):
            return "s5-8-chain-rule-branch-nested-composition"
        return "s5-8-chain-rule"

    if section.startswith("主題2") or any(token in text for token in rules_tokens):
        if any(token in text for token in quotient_tokens):
            return "s5-8-derivative-rules-branch-quotient-sign-trap"
        return "s5-8-derivative-rules"

    if any(token in text for token in tangent_tokens):
        if any(token in text for token in normal_tokens):
            return "s5-8-derivative-tangent-branch-normal-line"
        return "s5-8-derivative-tangent"

    return "s5-8-derivative-tangent"


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
                "tags": [CHAPTER_CODE, f"section:{section}", f"marker:{marker}", "source:5A-8轉.docx"],
            }
        )
    return records


def postprocess_records(records: list[dict]) -> list[dict]:
    by_id = {row["id"]: row for row in records}

    for row in records:
        row["question_text"] = row["question_text"].replace("，。", "。")
        row["explanation_text"] = row["explanation_text"].replace("，。", "。")
        row["explanation_text"] = row["explanation_text"].replace("故選(4)", "故選(4)")
        for field in ("title", "question_text", "explanation_text"):
            row[field] = row[field].replace("f(x) =", "f(x) =")
            row[field] = row[field].replace("g(x) =", "g(x) =")
            row[field] = row[field].replace("= =", "=")
            row[field] = row[field].replace("f \\'", "f'")
            row[field] = row[field].replace("g \\'", "g'")
            row[field] = row[field].replace("f ′", "f'")
            row[field] = row[field].replace("g ′", "g'")
            row[field] = row[field].replace("f' (", "f'(")
            row[field] = row[field].replace("g' (", "g'(")
            row[field] = row[field].replace("^+^", "^{+}")
            row[field] = row[field].replace("^−^", "^{-}")
            row[field] = row[field].replace("$$", "")
            row[field] = row[field].replace("=\n(", "= (")

    row = by_id.get("q-s5-8-0005")
    if row and "2a + b = 4" not in row["explanation_text"]:
        row["explanation_text"] = row["explanation_text"].replace("由(1)知", "由(1)知 2a + b = 4，")

    row = by_id.get("q-s5-8-0011")
    if row:
        row["question_text"] = "函數定義如下：$f(x) = \\left\\{ \\begin{array}{r} ax + b，x \\geq 1 \\\\ x^{2} - x，x < 1 \\end{array} \\right.$﹔若$f(x)$在$x = 1$處可微分，則$a =$ (1)0 (2)1 (3)2 (4) − 1 (5) − 2。"
        row["explanation_text"] = "【解析】 ∵$f(x)$在$x = 1$可微分，則左右導數相等。$f'(x) = \\left\\{ \\begin{array}{r} a，x \\geq 1 \\\\ 2x - 1，x < 1 \\end{array} \\right.$，所以$f'(1) = a = 2 - 1 = 1$，故選(2)。"

    row = by_id.get("q-s5-8-0013")
    if row:
        row["explanation_text"] = "【解析】 ∵可微必連續，∴$f(1^{+}) = f(1^{-}) \\Rightarrow a + b = 1 - 1 = 0$，且$f'(x) = \\left\\{ \\begin{array}{r} a，x \\geq 1 \\\\ 2x - 1，x < 1 \\end{array} \\right.$，所以$f'(1^{+}) = f'(1^{-}) \\Rightarrow a = 2 - 1 = 1$，故選(2)。"

    row = by_id.get("q-s5-8-0020")
    if row:
        row["question_text"] = "下列哪些函數在$x = 1$是可微分的？ (1)$f(x) = [x + 0.1]$ (2)$f(x) = |x - 1|$ (3)$f(x) = \\left\\{ \\begin{array}{r} x + 2，x \\geq 1 \\\\ 0，x < 1 \\end{array} \\right.$ (4)$f(x) = \\left\\{ \\begin{array}{r} x + 2，x \\neq 1 \\\\ 0，x = 1 \\end{array} \\right.$ (5)$f(x) = \\left\\{ \\begin{array}{r} x^{2} - 1，x \\geq 1 \\\\ 2x - 2，x < 1 \\end{array} \\right.$。"

    row = by_id.get("q-s5-8-0022")
    if row:
        row["question_text"] = row["question_text"].replace("f \\'(0)", "f'(0)")
        row["question_text"] = row["question_text"].replace("f \\' (0)", "f'(0)")
        row["explanation_text"] = row["explanation_text"].replace("f \\' (0)", "f'(0)")

    row = by_id.get("q-s5-8-0023")
    if row:
        row["question_text"] = row["question_text"].replace("f \\' (0)", "f'(0)")
        row["explanation_text"] = row["explanation_text"].replace("f \\' (0)", "f'(0)")

    row = by_id.get("q-s5-8-0041")
    if row:
        row["explanation_text"] = "【解析】 $f'(1) = \\lim_{x \\rightarrow 1}\\frac{f(x) - f(1)}{x - 1} = \\lim_{x \\rightarrow 1}\\frac{f(x) - 2}{x - 1} = 3$。令$f(x) = 3(x - 1) \\cdot g(x) + 2$且$\\lim_{x \\rightarrow 1}g(x) = 1$，則$f(x^{2}) = 3(x^{2} - 1)g(x^{2}) + 2$，故$\\lim_{x \\rightarrow 1}\\frac{f(x^{2}) - f(1)}{x - 1} = \\lim_{x \\rightarrow 1}\\frac{3(x^{2} - 1)g(x^{2})}{x - 1} = \\lim_{x \\rightarrow 1}3(x + 1)g(x^{2}) = 3 \\times 2 \\times 1 = 6$。"

    for target in ("q-s5-8-0072", "q-s5-8-0073", "q-s5-8-0074", "q-s5-8-0075"):
        row = by_id.get(target)
        if row:
            row["explanation_text"] = row["explanation_text"].replace("f \\'", "f'")

    row = by_id.get("q-s5-8-0072")
    if row:
        row["question_text"] = "求$f(x) = (x^3 + x + 3)^{15}$除以$(x + 1)^2$的餘式。"
        row["title"] = "求f(x) = (x^3 + x + 3)^15^除以(x + 1)^2^的餘式"

    row = by_id.get("q-s5-8-0073")
    if row:
        row["question_text"] = "求$f(x) = x^{100} + 3x - 5$除以$(x - 1)^2$的餘式。"
        row["title"] = "求f(x) = x^100^ + 3x − 5除以(x − 1)^2^的餘式"

    row = by_id.get("q-s5-8-0074")
    if row:
        row["title"] = "若(x + 1)^2^可整除多項式，求實數a，b的值"

    row = by_id.get("q-s5-8-0075")
    if row:
        row["title"] = "已知f(x) = x^3^ + ax + b有(x − 1)^2^的因式"

    row = by_id.get("q-s5-8-0080")
    if row:
        row["question_text"] = "設$a，b \\in \\mathbb{N}$，若方程式$x^5 - 5x^4 + ax - b = 0$有一個三重根，求$a，b$之值。"

    return records


def copy_support_files(target_root: Path):
    source_root = PACKS_DIR / SOURCE_PACK
    ensure_dir(target_root / "source")
    ensure_dir(target_root / "extracted")
    shutil.copy2(source_root / "source" / "5A-8轉.docx", target_root / "source" / "5A-8轉.docx")
    shutil.copy2(source_root / "extracted" / "5A-8轉.md", target_root / "extracted" / "5A-8轉.md")


def copy_canonical_assets():
    source_root = PACKS_DIR / SOURCE_PACK / "assets" / "media"
    target_root = MEDIA_DIR / CHAPTER_CODE
    ensure_dir(target_root)
    for file in sorted(source_root.iterdir()):
        if not file.is_file():
            continue
        name_lower = file.name.lower()
        if name_lower in SPECIAL_INLINE_TEXT:
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
            {"path": "extracted/5A-8轉.md", "role": "pandoc_markdown"},
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
        "# s5-8 review notes",
        "",
        f"- 題數：{len(records)} 題",
        "- 只收錄 `範例` 與 `隨堂練習`；主題說明文字未匯入題庫。",
        "- 向量圖 (`.wmf` / `.emf`) 已轉成正式引用的 `.png`，並統一指到 `program-db/assets/question-media/s5-8/`。",
        "- 純符號小圖已優先還原成文字（如 `≠`、`\\lim_{h\\to0}`、`\\frac{d}{dx}`、`⇒`）；圖形題與曲線圖保留正式圖片引用。",
        "- `主題2` 原講義標題為 `導函數及其性質`，公式對應則歸到 `導函數運算規則` 系列。",
        "",
    ]
    for section, count in Counter(row["source_section"] for row in records).items():
        lines.append(f"- `{section}`：{count} 題")
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    source_root = PACKS_DIR / SOURCE_PACK
    markdown_text = read_text(source_root / "extracted" / "5A-8轉.md")
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
