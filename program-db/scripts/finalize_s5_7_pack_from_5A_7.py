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

SOURCE_PACK = "_inspect-5A-7"
CHAPTER_CODE = "s5-7"
CHAPTER_TITLE = "函數的極限"
SOURCE_REF = "source/5A-7轉.docx"
MARKER_RE = re.compile(r"\*\*(範例\s*\d+|範例\d+|隨堂練習)\*\*")
TOPIC_RE = re.compile(r"\*\*主題\s*(\d+)\s*：\s*(.+?)\*\*")
SOURCE_LINE_RE = re.compile(r"^【[^】]+】$")
KEEP_SOURCE_LINE = {"【解析】", "【另解】", "【詳解】", "【證明】"}
TABLE_BORDER_RE = re.compile(r"^[+:|\-=\s]+$")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
WRAPPED_MEDIA_BLOCK_RE = re.compile(
    r"!\[(?P<alt>[\s\S]*?)\]\((?P<path>\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-7[\\/]+assets[\\/]+media[\\/][^)]+)\)\{[^{}]*\}",
    re.S,
)
MD_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[([^\]]+)\]\{\.underline\}")
EMPTY_UNDERLINE_RE = re.compile(r"\[\s*[　 ]*\]\{\.underline\}")
RAW_MEDIA_RE = re.compile(
    r"\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-5A-7[\\/]+assets[\\/]+media[\\/][^)\]\s]+",
    re.I,
)
WHITESPACE_RE = re.compile(r"[ \t]{2,}")
SPECIAL_INLINE_TEXT = {
    "image2.wmf": " ⇒ ",
    "image7.wmf": " = ",
    "image8.wmf": " = ",
    "image9.wmf": " = ",
    "image19.wmf": " = ",
    "image20.wmf": " = ",
    "image25.wmf": " ",
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
    if not text or text in {"1"}:
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
        if inline_text:
            return inline_text
        path = canonical_asset_path(raw_path)
        label = image_label_from_alt(match.group(1))
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
    value = value.replace("..", ".")
    value = value.replace("$﹒", "$。")
    value = value.replace("　", " ")
    value = value.replace("│", "|")
    value = value.replace("＝", "=")
    value = value.replace("＜", "<")
    value = value.replace("＞", ">")
    value = value.replace("｛", "{")
    value = value.replace("｝", "}")
    value = value.replace(" ⇒ $", " ⇒ ")
    value = value.replace(" = $", " = ")
    value = value.replace("原式⇒", "原式 ⇒ ")
    value = value.replace("原式=", "原式 = ")
    value = value.replace("原式 =", "原式 = ")
    value = value.replace("故選(B).", "故選(B)。")
    value = value.replace("故選(E).", "故選(E)。")
    value = value.replace("故選(3).", "故選(3)。")
    value = value.replace("故選(4).", "故選(4)。")
    value = value.replace("故選(2).", "故選(2)。")
    value = value.replace(r"\mathbb{\in N}", r"\in \mathbb{N}")
    value = value.replace(r"\mathbb{\in R}", r"\in \mathbb{R}")
    value = value.replace(r"\mathbb{\in Z}", r"\in \mathbb{Z}")
    value = value.replace(r"\mathbb{\in Q}", r"\in \mathbb{Q}")
    value = value.replace("⥂", "")
    value = value.replace("tanx", "tan x")
    value = value.replace("log~2~*x*", "log_2 x")
    value = value.replace("sin*x*", "sin x")
    value = value.replace("cos*x*", "cos x")
    value = value.replace("3*^x^*", "3^x")
    value = value.replace("2*^x^*", "2^x")
    value = value.replace("$$", "\n")
    value = value.replace("| x |", "|x|")
    value = re.sub(r"\b([fghkmnpq])\s*\n\s*\((x|a|b|c)\)", r"\1(\2)", value)
    value = re.sub(r"\b([fghkmnpq])\s+\((x|a|b|c)\)", r"\1(\2)", value)

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
    left_right_tokens = ("左極限", "右極限", "1^{-}", "1^{+}", "a^{-}", "a^{+}", "分段函數", "x < 1", "x > 0", "x < 0")
    continuity_tokens = ("連續", "不連續", "閉區間", "函數值", "連續函數")
    removable_tokens = ("為連續函數", "在x = 1是連續", "在x = 2是連續", "在x = 1連續", "在x = 2連續", "a =", "b =", "k =", "求a", "求b", "求k")
    intermediate_tokens = ("堪根", "中間值", "至少有一實根", "有實數解", "有一根", "實根在", "奇數個實根")
    proof_tokens = ("令f(x)", "f(a)f(b) < 0", "f(0)", "f(1)", "f(2)", "f(3)", "之間至少有一實根", "之間有一實根")

    if section.startswith("主題3") or any(token in text for token in intermediate_tokens):
        if any(token in text for token in proof_tokens):
            return "s5-7-intermediate-value-branch-existence-proof-template"
        return "s5-7-intermediate-value"

    if section.startswith("主題2") or any(token in text for token in continuity_tokens):
        if any(token in text for token in removable_tokens):
            return "s5-7-continuity-branch-removable-discontinuity"
        return "s5-7-continuity"

    if any(token in text for token in left_right_tokens):
        return "s5-7-limit-concept-branch-left-right-split"
    return "s5-7-limit-concept"


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
                "tags": [CHAPTER_CODE, f"section:{section}", f"marker:{marker}", "source:5A-7轉.docx"],
            }
        )
    return records


def postprocess_records(records: list[dict]) -> list[dict]:
    by_id = {row["id"]: row for row in records}

    for row in records:
        row["question_text"] = row["question_text"].replace("試求_____ 。", "試求_____。")
        row["explanation_text"] = row["explanation_text"].replace("故選(B).", "故選(B)。")
        row["explanation_text"] = row["explanation_text"].replace("故選(E).", "故選(E)。")
        row["explanation_text"] = row["explanation_text"].replace("故選(4).", "故選(4)。")
        row["explanation_text"] = row["explanation_text"].replace("故選(3).", "故選(3)。")
        row["explanation_text"] = row["explanation_text"].replace("故選(2).", "故選(2)。")
        row["explanation_text"] = row["explanation_text"].replace("原式 = =", "原式 =")
        row["explanation_text"] = row["explanation_text"].replace("原式 ⇒ ⇒", "原式 ⇒")
        for field in ("title", "question_text", "explanation_text"):
            row[field] = re.sub(r"([fghkmnpq])\n\((x|a|b|c)\)", r"\1(\2)", row[field])
            row[field] = re.sub(r"([fghkmnpq])\s+\((x|a|b|c)\)", r"\1(\2)", row[field])
            row[field] = row[field].replace("[ x]", "[x]")

    row = by_id.get("q-s5-7-0007")
    if row:
        row["explanation_text"] = (
            "【解析】 "
            "$\\lim_{x \\rightarrow 1}\\left[\\frac{1}{x - 1}\\left(\\frac{x^{10} - 1}{x - 1} - 10\\right)\\right]$"
            " $= \\lim_{x \\rightarrow 1}\\left[\\frac{1}{x - 1}\\left(\\frac{(x - 1)(x^{9} + x^{8} + \\cdots + x + 1)}{x - 1} - 10\\right)\\right]$"
            " $= \\lim_{x \\rightarrow 1}\\left[\\frac{x^{9} + x^{8} + \\cdots + x - 9}{x - 1}\\right]$"
            " $= \\lim_{x \\rightarrow 1}\\frac{(x^{9} - 1) + (x^{8} - 1) + \\cdots + (x - 1)}{x - 1}$"
            " $= \\lim_{x \\rightarrow 1}\\left[(x^{8} + x^{7} + \\cdots + x + 1) + (x^{7} + x^{6} + \\cdots + x + 1) + \\cdots + (x + 1) + 1\\right]$"
            " $= 9 + 8 + \\cdots + 2 + 1 = \\frac{9 \\times 10}{2} = 45$。"
        )

    row = by_id.get("q-s5-7-0019")
    if row:
        row["explanation_text"] = (
            "【解析】 "
            "$\\lim_{x \\rightarrow 8}\\frac{\\sqrt{2 + \\sqrt[3]{x}} - 2}{x - 8}$"
            " $= \\lim_{x \\rightarrow 8}\\frac{(\\sqrt{2 + \\sqrt[3]{x}} - 2)(\\sqrt{2 + \\sqrt[3]{x}} + 2)}{(x - 8)(\\sqrt{2 + \\sqrt[3]{x}} + 2)}$"
            " $= \\lim_{x \\rightarrow 8}\\frac{\\sqrt[3]{x} - 2}{(x - 8)(\\sqrt{2 + \\sqrt[3]{x}} + 2)}$"
            " $= \\lim_{x \\rightarrow 8}\\frac{1}{(\\sqrt[3]{x^{2}} + 2\\sqrt[3]{x} + 4)(\\sqrt{2 + \\sqrt[3]{x}} + 2)}$"
            " $= \\frac{1}{(4 + 4 + 4)(2 + 2)} = \\frac{1}{48}$。"
        )

    row = by_id.get("q-s5-7-0040")
    if row:
        row["explanation_text"] = (
            "【解析】 $x - 1 | ax^{2} + x + b \\Rightarrow a + 1 + b = 0 \\Rightarrow b = -1 - a$。\n"
            "$\\lim_{x \\rightarrow 1}\\frac{ax^{2} + x + (-1 - a)}{x - 1}"
            " = \\lim_{x \\rightarrow 1}\\frac{a(x^{2} - 1) + (x - 1)}{x - 1}"
            " = \\lim_{x \\rightarrow 1}[a(x + 1) + 1] = 2a + 1 = 2$，"
            "所以$a = \\frac{1}{2}$，$b = -\\frac{3}{2}$，故$2a + 4b = 1 - 6 = -5$。"
        )

    row = by_id.get("q-s5-7-0041")
    if row:
        row["explanation_text"] = (
            "【解析】 $x - 1 | x^{3} + ax^{2} + b$，則$1 + a + b = 0 \\Rightarrow b = -1 - a$。\n"
            "$\\lim_{x \\rightarrow 1}\\frac{x^{3} + ax^{2} + b}{x - 1}"
            " = \\lim_{x \\rightarrow 1}\\frac{x^{3} + ax^{2} - 1 - a}{x - 1}"
            " = \\lim_{x \\rightarrow 1}\\frac{(x^{3} - 1) + a(x^{2} - 1)}{x - 1}"
            " = \\lim_{x \\rightarrow 1}[(x^{2} + x + 1) + a(x + 1)] = 3 + 2a = 5$，"
            "故$a = 1$，$b = -2$。"
        )

    row = by_id.get("q-s5-7-0043")
    if row:
        row["explanation_text"] = (
            "【解析】 $x = 2$代入分子$\\sqrt{x} - \\sqrt{2} = 0$，"
            "即$x = 2$代入分母$\\sqrt{x + a} - b = 0 \\Rightarrow \\sqrt{2 + a} - b = 0 \\Rightarrow b = \\sqrt{2 + a}$。\n"
            "$\\lim_{x \\rightarrow 2}\\frac{\\sqrt{x} - \\sqrt{2}}{\\sqrt{x + a} - b}"
            " = \\lim_{x \\rightarrow 2}\\frac{\\sqrt{x} - \\sqrt{2}}{\\sqrt{x + a} - \\sqrt{2 + a}}"
            " = \\lim_{x \\rightarrow 2}\\frac{(\\sqrt{x} - \\sqrt{2})(\\sqrt{x} + \\sqrt{2})(\\sqrt{x + a} + \\sqrt{2 + a})}{[(x + a) - (2 + a)](\\sqrt{x} + \\sqrt{2})}"
            " = \\lim_{x \\rightarrow 2}\\frac{\\sqrt{x + a} + \\sqrt{2 + a}}{\\sqrt{x} + \\sqrt{2}}"
            " = \\frac{2\\sqrt{2 + a}}{2\\sqrt{2}} = \\frac{\\sqrt{2 + a}}{\\sqrt{2}} = \\sqrt{2}$。\n"
            "所以$\\sqrt{2 + a} = 2 \\Rightarrow a = 2$，代入$b = \\sqrt{2 + a} = 2$，故$a = 2$，$b = 2$。"
        )

    row = by_id.get("q-s5-7-0056")
    if row:
        row["question_text"] = (
            "下列哪些函數在$x = 0$處連續？（其中$[\\ ]$表示高斯函數）"
            " (1)$f_1(x) = x \\cdot |x|$"
            " (2)$f_2(x) = x \\cdot [x]$"
            " (3)$f_3(x) = \\frac{|x|}{1 + |x|}$"
            " (4)$f_4(x) = \\sin x$"
            " (5)$f_5(x) = |x|^5$。"
        )

    row = by_id.get("q-s5-7-0057")
    if row:
        row["question_text"] = (
            "下列函數中，何者在所有實數上皆為連續？"
            " (1)$f(x) = |x^2 - 1|$"
            " (2)$g(x) = \\sqrt{x^{2} - 1}$"
            " (3)$k(x) = \\frac{x + 2}{x^{2} + x + 1}$"
            " (4)$m(x) = \\sin(x^2 - 1)$"
            " (5)$h(x) = \\frac{x^{2} - 1}{x + 1}$。"
        )

    row = by_id.get("q-s5-7-0067")
    if row:
        row["question_text"] = (
            "設$f(x) = \\left\\{ \\begin{array}{r}"
            "\\frac{\\sqrt{x} - \\sqrt{2}}{\\sqrt{x + 6} - \\sqrt{8}}，x \\geq 0$且$x \\neq 2 \\\\ "
            "k + 2，x = 2"
            "\\end{array} \\right.$，則使$f(x)$在{$x \\in \\mathbb{R} | x \\geq 0$}"
            "為連續函數之$k$值為_____。"
        )
        row["explanation_text"] = (
            "【解析】 $f(x)$在$x = 2$連續，則"
            "$\\lim_{x \\rightarrow 2}\\frac{\\sqrt{x} - \\sqrt{2}}{\\sqrt{x + 6} - \\sqrt{8}} = f(2) = k + 2$。\n"
            "$\\lim_{x \\rightarrow 2}\\left(\\frac{\\sqrt{x} - \\sqrt{2}}{\\sqrt{x + 6} - \\sqrt{8}}"
            " \\times \\frac{\\sqrt{x} + \\sqrt{2}}{\\sqrt{x} + \\sqrt{2}}"
            " \\times \\frac{\\sqrt{x + 6} + \\sqrt{8}}{\\sqrt{x + 6} + \\sqrt{8}}\\right)"
            " = \\lim_{x \\rightarrow 2}\\left(\\frac{x - 2}{x - 2} \\times \\frac{\\sqrt{x + 6} + \\sqrt{8}}{\\sqrt{x} + \\sqrt{2}}\\right)"
            " = \\frac{2\\sqrt{8}}{2\\sqrt{2}} = 2$。\n"
            "所以$k + 2 = 2 \\Rightarrow k = 0$。"
        )

    return records


def copy_support_files(target_root: Path):
    source_root = PACKS_DIR / SOURCE_PACK
    ensure_dir(target_root / "source")
    ensure_dir(target_root / "extracted")
    shutil.copy2(source_root / "source" / "5A-7轉.docx", target_root / "source" / "5A-7轉.docx")
    shutil.copy2(source_root / "extracted" / "5A-7轉.md", target_root / "extracted" / "5A-7轉.md")


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
            {"path": "extracted/5A-7轉.md", "role": "pandoc_markdown"},
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
        "# s5-7 review notes",
        "",
        f"- 題數：{len(records)} 題",
        "- 只收錄 `範例` 與 `隨堂練習`；主題說明文字未匯入題庫。",
        "- 向量圖 (`.wmf` / `.emf`) 已轉成正式引用的 `.png`，並統一指到 `program-db/assets/question-media/s5-7/`。",
        "- 純符號小圖已優先還原成文字（如 `⇒`、`=`）；圖形題選項與示意圖則保留正式圖片引用。",
        "- `主題3` 原講義標題寫作 `堪根定理`，本 pack 依原文保留 section 名稱，但 `formula_id` 對應到介值／堪根定理相關條目。",
        "",
    ]
    for section, count in Counter(row["source_section"] for row in records).items():
        lines.append(f"- `{section}`：{count} 題")
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    source_root = PACKS_DIR / SOURCE_PACK
    markdown_text = read_text(source_root / "extracted" / "5A-7轉.md")
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
