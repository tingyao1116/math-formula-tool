import json
import re
from pathlib import Path


TITLE_PREFIX_RE = re.compile(
    r"^\s*(?:【(?:主題|分支)範例】\s*|(?:範例|隨堂練習)\s*[0-9０-９]+(?:\s*[-－–—]\s*[0-9０-９]+)?\s*[：:、.．]?\s*)+"
)
SOURCE_BLOCK_RE = re.compile(r"【([^】]+)】")
LEADING_EMPTY_CHOICE_RE = re.compile(r"(^|\n)\s*[（(]\s*(?:\n\s*)*[）)]\s*")
LINE_LEADING_WHITESPACE_RE = re.compile(r"\n[ \t]+")
IMAGE_MARKER_RE = re.compile(r"\[圖:\s*([^\]]+)\]")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.IGNORECASE | re.S)
MARKDOWN_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
MATH_BACKTICK_RE = re.compile(r"\$`(.*?)`\$", re.S)
CODE_FENCE_RE = re.compile(r"```\s*(?:\w+)?\s*\n(.*?)\n```", re.S)
HTML_WRAPPER_RE = re.compile(r"</?(?:u|span|div|p)[^>]*>", re.IGNORECASE)
TRAILING_CONTINUATION_RE = re.compile(r"[ \t]*\\[ \t]*(?:\n|$)")
SOFT_BREAK_RE = re.compile(r"(?<![。﹒？！：:])\n(?![（(【\[圖①②③④⑤⑥⑦⑧⑨⑩《∵∴⇒⇔])")
MULTISPACE_RE = re.compile(r"[^\S\n]{2,}")
SOURCE_KEYWORDS = (
    "出處",
    "學測",
    "會考",
    "基測",
    "統測",
    "指考",
    "模擬",
    "北北基",
    "教育會考",
)


def normalize_image_marker_path(raw_path: str) -> str:
    text = str(raw_path or "").strip().replace("\\", "/")
    if not text:
        return ""
    text = re.sub(r"(?i)\.(emf|wmf)(?:\.png)+$", r".\1.png", text)
    text = re.sub(r"(?i)\.png(?:\.png)+$", ".png", text)
    lowered = text.lower()
    exports_index = lowered.rfind("/exports/")
    if exports_index >= 0:
        return text[exports_index + 1 :]
    exports_index = lowered.find("exports/")
    if exports_index >= 0:
        return text[exports_index:]
    return text


def normalize_image_markers(text: str) -> str:
    source = str(text or "")

    def repl(match: re.Match[str]) -> str:
        normalized = normalize_image_marker_path(match.group(1))
        return f"[圖:{normalized}]" if normalized else ""

    return IMAGE_MARKER_RE.sub(repl, source)


def replace_inline_images(text: str) -> str:
    source = str(text or "")

    def repl(match: re.Match[str]) -> str:
        normalized = normalize_image_marker_path(match.group(1))
        return f"\n[圖:{normalized}]\n" if normalized else ""

    source = HTML_IMAGE_RE.sub(repl, source)
    source = MARKDOWN_IMAGE_RE.sub(repl, source)
    return normalize_image_markers(source)


def collapse_duplicate_halves(text: str) -> str:
    source = str(text or "").strip()
    if len(source) < 20:
        return source

    midpoint = len(source) // 2
    for delta in range(-8, 9):
        cut = midpoint + delta
        if cut <= 8 or cut >= len(source) - 8:
            continue
        left = source[:cut].strip()
        right = source[cut:].strip()
        if not left or not right:
            continue
        if re.sub(r"\s+", "", left) == re.sub(r"\s+", "", right):
            return left
    return source


def cleanup_import_artifacts(text: str) -> str:
    source = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    if not source.strip():
        return ""

    source = source.replace("\xa0", " ").replace("\u2004", " ").replace("\u3000", " ")
    source = replace_inline_images(source)
    source = MATH_BACKTICK_RE.sub(lambda match: f"${match.group(1).strip()}$", source)
    source = CODE_FENCE_RE.sub(lambda match: match.group(1).strip(), source)
    source = HTML_WRAPPER_RE.sub("", source)
    source = source.replace("\\mspace{6mu}", "")
    source = source.replace("*", "")
    source = source.replace("\\|", "|").replace("\\<", "<").replace("\\>", ">")
    source = source.replace("\\$", "$")
    source = source.replace("。。", "。")
    source = re.sub(r"\n{3,}", "\n\n", source)
    source = TRAILING_CONTINUATION_RE.sub("\n", source)
    source = re.sub(r"```+\s*(?:math)?", "", source, flags=re.IGNORECASE)
    source = re.sub(r"[ \t]+\n", "\n", source)
    source = re.sub(r"\n[ \t]+", "\n", source)
    source = re.sub(r"(?<!\n)\[圖:([^\]]+)\](?!\n)", r"\n[圖:\1]\n", source)
    source = SOFT_BREAK_RE.sub(" ", source)
    source = MULTISPACE_RE.sub(" ", source)
    source = re.sub(r"\s+([。﹒，、；：？！])", r"\1", source)
    source = re.sub(r"\n{3,}", "\n\n", source)
    source = collapse_duplicate_halves(source)
    source = re.sub(r"^[.．、]+\s*", "", source.strip())
    return source.strip()


def strip_known_source_blocks(text: str) -> str:
    source = str(text or "")

    def repl(match: re.Match[str]) -> str:
        inner = match.group(1).strip()
        if any(keyword in inner for keyword in SOURCE_KEYWORDS):
            return ""
        if re.search(r"\d{2,3}\.", inner) and ("年" in inner or "學" in inner):
            return ""
        return match.group(0)

    return SOURCE_BLOCK_RE.sub(repl, source)


def clean_question_title(text: str) -> str:
    source = cleanup_import_artifacts(str(text or "").strip())
    source = normalize_image_markers(source)
    cleaned = TITLE_PREFIX_RE.sub("", source).strip()
    return cleaned or source


def clean_question_body(text: str) -> str:
    source = cleanup_import_artifacts(str(text or ""))
    source = normalize_image_markers(source)
    source = strip_known_source_blocks(source)
    source = LEADING_EMPTY_CHOICE_RE.sub(lambda match: "\n" if match.group(1) == "\n" else "", source)
    source = LINE_LEADING_WHITESPACE_RE.sub("\n", source)
    source = re.sub(r"\n{3,}", "\n\n", source)
    return source.strip()


def normalize_question_record(record: dict) -> tuple[dict, bool]:
    row = dict(record or {})
    changed = False

    title = clean_question_title(row.get("title", ""))
    if title != row.get("title", ""):
        row["title"] = title
        changed = True

    for field in ("question_text", "answer_text", "explanation_text"):
        cleaned = clean_question_body(row.get(field, ""))
        if cleaned != row.get(field, ""):
            row[field] = cleaned
            changed = True

    return row, changed


def normalize_question_records(records: list[dict]) -> tuple[list[dict], int]:
    normalized = []
    changed = 0
    for record in records or []:
        row, row_changed = normalize_question_record(record)
        normalized.append(row)
        if row_changed:
            changed += 1
    return normalized, changed


def save_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
