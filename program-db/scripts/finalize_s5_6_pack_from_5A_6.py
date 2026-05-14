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

SOURCE_PACK = "_inspect-5A-6"
CHAPTER_CODE = "s5-6"
CHAPTER_TITLE = "函數的概念"
SOURCE_REF = "source/5A-6轉.docx"
MARKER_RE = re.compile(r"\*\*(範例\s*\d+|範例\d+|隨堂練習)\*\*")
TOPIC_RE = re.compile(r"\*\*主題\s*(\d+)\s*：\s*(.+?)\*\*")
SOURCE_LINE_RE = re.compile(r"^【[^】]+】$")
KEEP_SOURCE_LINE = {"【解析】", "【另解】", "【詳解】", "【證明】"}
TABLE_BORDER_RE = re.compile(r"^[+:|\-=\s]+$")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
NESTED_MD_IMAGE_RE = re.compile(
    r"!\[!\[(?P<inner_alt>[^\]]*)\]\((?P<inner_path>[^)]+)\)\{[^{}]*\}\]"
    r"\((?P<outer_path>[^)]+)\)\{[^{}]*alt=\"(?P<outer_alt>[^\"]*)\"[^{}]*\}",
    re.S,
)
WRAPPED_MEDIA_BLOCK_RE = re.compile(
    r"!\[(?P<alt>[\s\S]*?)\]\((?P<path>\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-6[\\/]+assets[\\/]+media[\\/][^)]+)\)\{[^{}]*\}",
    re.S,
)
MD_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[([^\]]+)\]\{\.underline\}")
EMPTY_UNDERLINE_RE = re.compile(r"\[\s*[　 ]*\]\{\.underline\}")
RAW_MEDIA_RE = re.compile(
    r"\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-6[\\/]+assets[\\/]+media[\\/][^)\]\s]+",
    re.I,
)
WHITESPACE_RE = re.compile(r"[ \t]{2,}")
SPECIAL_INLINE_TEXT = {
    "image22.jpeg": "≠",
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
    title = cleanup_import_artifacts(match.group(2)).strip()
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
    if not text or text in {"1", "Image19", "Image20", "Image21", "不等號"}:
        return ""
    if re.fullmatch(r"(?:Image|image)\d+", text):
        return ""
    if re.fullmatch(r"0?\d+(?:-\d+)*", text):
        return ""
    if re.fullmatch(r"[甲乙丙丁][A-Z]?\d(?:-\d+)*", text):
        return ""
    paren_match = re.search(r"\(([A-Za-z0-9])\)\s*$", text)
    if paren_match:
        return f"({paren_match.group(1)})"
    if re.fullmatch(r"[\w-]+", text):
        return ""
    return text


def replace_nested_images(text: str) -> str:
    value = str(text or "")

    def repl(match: re.Match[str]) -> str:
        parts: list[str] = []
        inner_label = image_label_from_alt(match.group("inner_alt"))
        outer_label = image_label_from_alt(match.group("outer_alt"))
        inner_path = canonical_asset_path(match.group("inner_path"))
        outer_path = canonical_asset_path(match.group("outer_path"))
        if inner_label:
            parts.append(inner_label)
        if inner_path:
            parts.append(f"[圖:{inner_path}]")
        if outer_label:
            parts.append(outer_label)
        if outer_path:
            parts.append(f"[圖:{outer_path}]")
        return "\n".join(parts)

    return NESTED_MD_IMAGE_RE.sub(repl, value)


def replace_inline_images(text: str) -> str:
    value = replace_nested_images(text)

    def repl_html(match: re.Match[str]) -> str:
        inline_text = inline_text_for_asset(match.group(1))
        if inline_text:
            return inline_text
        path = canonical_asset_path(match.group(1))
        return f"\n[圖:{path}]\n" if path else ""

    def repl_md(match: re.Match[str]) -> str:
        raw_path = match.group(2)
        alt = match.group(1)
        inline_text = inline_text_for_asset(raw_path)
        if alt == "不等號":
            return "≠"
        if inline_text:
            return inline_text
        path = canonical_asset_path(raw_path)
        label = image_label_from_alt(alt)
        parts: list[str] = []
        if label:
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
        if alt and alt not in {"1"}:
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
    value = value.replace("｛", "{")
    value = value.replace("｝", "}")
    value = value.replace("，∞）", "，∞)")
    value = value.replace("（－∞，", "(-∞，")
    value = value.replace("）。", ")。")
    value = value.replace(r"\mathbb{\in N}", r"\in \mathbb{N}")
    value = value.replace(r"\mathbb{\in R}", r"\in \mathbb{R}")
    value = value.replace(r"\mathbb{\in Z}", r"\in \mathbb{Z}")
    value = value.replace(r"\mathbb{\in Q}", r"\in \mathbb{Q}")
    value = re.sub(r"([A-Za-zxyabcdnmkDMy])\\mathbb\{\\in\s*([RNZQ])\|", r"\1 \\in \\mathbb{\2} |", value)
    value = re.sub(r"\{\$\s*([xyabcdnmkDMy])\s+\\in\s+R\|", r"{$\1 \\in \\mathbb{R} |", value)
    value = re.sub(r"\{\$\s*([xyabcdnmkDMy])\s+\\in\s+N\|", r"{$\1 \\in \\mathbb{N} |", value)
    value = value.replace("圖**（一） **圖**（二） **圖**（三）", "圖（一） 圖（二） 圖（三）")
    value = value.replace("故選((A)(C)(E)", "故選(A)(C)(E)。")
    value = value.replace("故選(A)(C)(D)", "故選(A)(C)(D)。")
    value = value.replace("故選(A)(B)(C)", "故選(A)(B)(C)。")
    value = value.replace("故選(A)(B)(D)", "故選(A)(B)(D)。")
    value = value.replace("故選(A)(D).", "故選(A)(D)。")
    value = value.replace("故選(A)(B)(D).", "故選(A)(B)(D)。")
    value = value.replace("由函數的定義知. 選", "由函數的定義知，選")
    value = value.replace("圖形是斜率為$- \\frac{a}{b}$的直線.", "圖形是斜率為$- \\frac{a}{b}$的直線。")
    value = value.replace("[\\] = *n*", "[x] = n")
    value = value.replace("![", "")

    cleaned_lines: list[str] = []
    for raw_line in value.split("\n"):
        line = clean_table_line(raw_line)
        if not line:
            cleaned_lines.append("")
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = WHITESPACE_RE.sub(" ", value)
    value = re.sub(r"(?<=\d)。(?=\d)", ".", value)
    value = cleanup_import_artifacts(value)
    value = value.replace("{ $", "{$")
    value = value.replace("$ }", "$}")
    value = value.replace("{*", "{")
    value = value.replace("*}", "}")
    value = value.replace("| -}", "| - ")
    value = value.replace("|}", "| ")
    value = value.replace("{$ y \\in R|", "{$ y \\in \\mathbb{R} |")
    value = value.replace("{$ x \\in R|", "{$ x \\in \\mathbb{R} |")
    value = value.replace("(如圖(a))", "(如圖(a))")
    value = value.replace("(如圖(b))", "(如圖(b))")
    value = value.replace("。.", "。")
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
    definition_tokens = (
        "定義域",
        "值域",
        "合成函數",
        "g \\circ f",
        "g(f(x))",
        "f(2)",
        "f(15)",
        "函數關係",
        "對應",
        "不是函數",
        "函數圖形",
    )
    domain_priority_tokens = (
        "定義域",
        "值域",
        "\\sqrt",
        "\\frac",
        "分母",
        "不存在",
        "x ≠ 0",
        "y ≠ 0",
        "不等號",
        "區間",
        "合成函數",
    )
    graph_tokens = (
        "圖形",
        "作圖",
        "描繪",
        "畫出",
        "平移",
        "向上",
        "向下",
        "向左",
        "向右",
        "拋物線",
        "週期函數",
        "高斯函數",
        "絕對值函數",
        "對稱軸",
        "頂點",
    )
    transform_tokens = (
        "平移",
        "向上",
        "向下",
        "向左",
        "向右",
        "圖形如下",
        "作圖如下",
        "描繪",
        "畫出",
        "週期函數",
        "對稱軸",
        "頂點",
        "最大值",
        "最小值",
        "交點",
    )

    if section.startswith("主題2"):
        if any(token in text for token in transform_tokens):
            return "s5-6-function-graph-branch-transform-order"
        return "s5-6-function-graph"

    if any(token in text for token in domain_priority_tokens):
        return "s5-6-function-definition-branch-domain-priority"
    if any(token in text for token in graph_tokens) and not any(token in text for token in definition_tokens):
        return "s5-6-function-graph"
    if any(token in text for token in definition_tokens):
        return "s5-6-function-definition"
    return "s5-6-function-definition"


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
                "tags": [CHAPTER_CODE, f"section:{section}", f"marker:{marker}", "source:5A-6轉.docx"],
            }
        )
    return records


def postprocess_records(records: list[dict]) -> list[dict]:
    by_id = {row["id"]: row for row in records}

    row = by_id.get("q-s5-6-0032")
    if row:
        row["explanation_text"] = row["explanation_text"].replace(
            "【解析】\n( − 6) = 2，f (4) = 3 × 4 − 2 = 10，f (2) = 2^2^ − 3 = 1，",
            "【解析】\n$f(-6) = 2$，$f(4) = 3 \\times 4 - 2 = 10$，$f(2) = 2^2 - 3 = 1$，",
        )

    row = by_id.get("q-s5-6-0047")
    if row:
        row["question_text"] = (
            "設$f(x) = x - 2$，$g(x) = x^2 - 4$，若函數$h(x) = |g(f(x))|$的定義域為"
            "{$x \\in \\mathbb{R} | -2 \\leq x \\leq 5$}，作$y = h(x)$的圖形及值域。"
        )
        row["explanation_text"] = (
            "【解析】 $g(f(x)) = g(x - 2) = (x - 2)^2 - 4$，"
            "$h(x) = |(x - 2)^2 - 4|$。\n"
            f"[圖:program-db/assets/question-media/{CHAPTER_CODE}/image45.png]\n"
            "值域為{$y \\in \\mathbb{R} | 0 \\leq y \\leq 12$}。"
        )

    row = by_id.get("q-s5-6-0048")
    if row:
        row["question_text"] = (
            "設$f(x) = \\left| x^{2} - 3x \\right| + x - 2$，(1)試作$y = f(x)$之圖形。\n\n"
            "(2)方程式$\\left| x^{2} - 3x \\right| + x - 2 = k$有四相異解時，$k$之範圍為何？\n\n"
            f"(a)\n[圖:program-db/assets/question-media/{CHAPTER_CODE}/image49.png]\n"
            f"(b)\n[圖:program-db/assets/question-media/{CHAPTER_CODE}/image46.png]\n"
            f"(c)\n[圖:program-db/assets/question-media/{CHAPTER_CODE}/image47.png]\n"
            f"(d)\n[圖:program-db/assets/question-media/{CHAPTER_CODE}/image48.png]"
        )
        row["explanation_text"] = row["explanation_text"].replace("（如圖(a))。", "（如圖(a)）。")
        row["explanation_text"] = row["explanation_text"].replace("（如圖(b))。", "（如圖(b)）。")

    row = by_id.get("q-s5-6-0051")
    if row:
        row["explanation_text"] = (
            "【解析】 $15 - 2x - x^{2} \\geq 0 \\Rightarrow x^{2} + 2x - 15 \\leq 0 "
            "\\Rightarrow (x + 5)(x - 3) \\leq 0 \\Rightarrow -5 \\leq x \\leq 3$，"
            "$0 \\leq \\sqrt{15 - 2x - x^{2}} = \\sqrt{-(x + 1)^{2} + 16} \\leq 4 "
            "\\Rightarrow 0 \\leq f(x) \\leq 4$，所以$f(x) = \\sqrt{15 - 2x - x^{2}}$的"
            "定義域為{$x \\in \\mathbb{R} | -5 \\leq x \\leq 3$}，值域為"
            "{$y \\in \\mathbb{R} | 0 \\leq y \\leq 4$}。\n"
            "$y = \\sqrt{15 - 2x - x^{2}} \\geq 0 \\Rightarrow y^{2} = 15 - 2x - x^{2} "
            "\\Rightarrow (x + 1)^{2} + y^{2} = 16 = 4^{2}$，可作圖如下。\n"
            f"[圖:program-db/assets/question-media/{CHAPTER_CODE}/image52.png]"
        )

    row = by_id.get("q-s5-6-0053")
    if row:
        row["question_text"] = "試作函數$f(x) = \\frac{x}{|x|}$的圖形，並寫出值域。"
        row["explanation_text"] = (
            "【解析】 $f(x) = \\frac{x}{|x|}$的定義域為{$x \\in \\mathbb{R} | x \\neq 0$}。\n"
            "$y = f(x) = \\frac{x}{|x|} = \\left\\{ \\begin{array}{r}"
            "1，x > 0 \\\\ -1，x < 0"
            "\\end{array} \\right.$，可作圖如下。值域為{$y \\in \\mathbb{R} | y = 1$或$y = -1$}。\n"
            f"[圖:program-db/assets/question-media/{CHAPTER_CODE}/image54.png]"
        )

    return records


def copy_support_files(target_root: Path):
    source_root = PACKS_DIR / SOURCE_PACK
    ensure_dir(target_root / "source")
    ensure_dir(target_root / "extracted")
    shutil.copy2(source_root / "source" / "5A-6轉.docx", target_root / "source" / "5A-6轉.docx")
    shutil.copy2(source_root / "extracted" / "5A-6轉.md", target_root / "extracted" / "5A-6轉.md")


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
            {"path": "extracted/5A-6轉.md", "role": "pandoc_markdown"},
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
        "# s5-6 review notes",
        "",
        f"- 題數：{len(records)} 題",
        "- 只收錄 `範例` 與 `隨堂練習`；主題說明文字未匯入題庫。",
        "- 向量圖 (`.wmf` / `.emf`) 已轉成正式引用的 `.png`，並統一指到 `program-db/assets/question-media/s5-6/`。",
        "- 純符號小圖 `image22.jpeg` 已還原成文字 `≠`。",
        "- 巢狀圖片區塊已拆成獨立圖形引用，保留 `(a)` `(b)` `(c)` `(d)` 圖號順序。",
        "- `主題2 / 範例7` 的曲線圖未出現在轉出的 markdown 與媒體清單中；目前保留原題與解析，但建議後續人工回看原始 Word 補圖。",
        "",
    ]
    for section, count in Counter(row["source_section"] for row in records).items():
        lines.append(f"- `{section}`：{count} 題")
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    source_root = PACKS_DIR / SOURCE_PACK
    markdown_text = read_text(source_root / "extracted" / "5A-6轉.md")
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
