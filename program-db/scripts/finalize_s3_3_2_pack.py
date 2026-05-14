import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


SOURCE_PACK = "_inspect-3A-9"
CHAPTER_CODE = "s3-3-2"
CHAPTER_TITLE = "平面向量的內積"

TOPIC_RE = re.compile(r"主題\s*(\d+)\s*[:：]\s*(.+)")
MARKER_RE = re.compile(r"(範例\s*\d+|隨堂練習|重要範例)")
EXPLANATION_RE = re.compile(r"(?:【解析】|【詳解】|【解】|解析：|解：)")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]+\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
DANGLING_IMAGE_RE = re.compile(r"\]\(\.\\program-db\\imports\\packs\\_inspect-3A-9\\assets\\media\\[^)]+\)")
RAW_INSPECT_MEDIA_RE = re.compile(
    r"\]?[\(\[]\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-3A-9[\\/]+assets[\\/]+media[\\/][^)\\]]+[)\]]"
)
SOURCE_NOTE_RE = re.compile(r"^【[^】]*(?:自命題|期中考|期末考|模擬考|聯考|學測|指考|高中|女中|附中|建國中學)[^】]*】$")
ARRAY_OPEN_RE = re.compile(r"\$?\{?\s*\\begin\{(?:array|matrix)\}(?:\{[^}]*\})?")
ARRAY_CLOSE_RE = re.compile(r"\\end\{(?:array|matrix)\}\s*\\right\.\$?")
PRACTICE_MARK_RE = re.compile(r"\[\s*隨堂練習\]\{\.underline\}\.?|隨堂練習\]\{\.underline\}\.?")
SPLIT_PRACTICE_RE = re.compile(r"\[\s*\\?\s*\n\s*隨堂練習\]\{\.underline\}\.?")


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
    if "解析" in text or "詳解" in text or "解" in text:
        return True
    if re.search(r"[\u4e00-\u9fff]", text):
        return True
    if any(token in text for token in (r"\frac", r"\sqrt", r"\vec", r"\overline", r"\angle", "=")):
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


def is_decorative_line(line: str) -> bool:
    stripped = str(line or "").strip()
    if not stripped:
        return True
    if DECORATIVE_RE.fullmatch(stripped):
        return True
    if stripped in {"**", "*\\*", "※重要範例"}:
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


def plain_line(line: str) -> str:
    value = str(line or "").rstrip()
    stripped = value.strip()
    if stripped.startswith("|") and stripped.endswith("|"):
        stripped = stripped[1:-1].strip()
    return stripped.replace("**", "").strip()


def normalize_section_name(raw: str) -> str:
    text = plain_line(raw)
    match = TOPIC_RE.search(text)
    if not match:
        return text
    return f"主題{match.group(1)}：{match.group(2).strip()}"


def detect_topic(line: str) -> str | None:
    stripped = plain_line(line)
    match = TOPIC_RE.search(stripped)
    if not match:
        return None
    return f"主題{match.group(1)}：{match.group(2).strip()}"


def detect_standard_marker(line: str) -> str | None:
    stripped = plain_line(line).replace(",", "").replace("，", "")
    match = MARKER_RE.search(stripped)
    if not match:
        return None
    marker = re.sub(r"\s+", "", match.group(1))
    return marker if marker != "重要範例" else None


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

        if topic:
            flush()
            current_section = topic
            current_marker = ""
            continue

        if current_section and current_section.startswith(("主題5", "主題6")):
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


def topic_sections(markdown_text: str) -> dict[str, str]:
    matches = list(TOPIC_RE.finditer(markdown_text))
    sections: dict[str, str] = {}
    for idx, match in enumerate(matches):
        topic = f"主題{match.group(1)}：{match.group(2).strip()}"
        start = match.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown_text)
        sections[topic] = markdown_text[start:end]
    return sections


def parse_inline_topic_blocks(markdown_text: str, topic: str) -> list[dict]:
    section_text = topic_sections(markdown_text).get(topic, "")
    if not section_text:
        return []
    marker_pos = section_text.find("※重要範例")
    if marker_pos >= 0:
        section_text = section_text[marker_pos + len("※重要範例") :]
    section_text = SPLIT_PRACTICE_RE.sub("\n<<PRACTICE>>\n", section_text)
    section_text = PRACTICE_MARK_RE.sub("\n<<PRACTICE>>\n", section_text)
    lines = section_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")

    blocks: list[dict] = []
    current_marker = ""
    buffer: list[str] = []

    def flush():
        nonlocal current_marker, buffer
        if not current_marker:
            buffer = []
            return
        raw_text = "\n".join(line for line in buffer if not is_decorative_line(line)).strip()
        if raw_text:
            blocks.append({"marker": current_marker, "section": topic, "raw_text": raw_text})
        buffer = []

    for raw in lines:
        stripped = plain_line(raw)
        if not stripped:
            if current_marker:
                buffer.append(raw)
            continue

        if stripped == "<<PRACTICE>>":
            flush()
            current_marker = "隨堂練習"
            buffer = []
            continue

        number_match = re.match(r"^(\d+)\.(.*)$", stripped)
        if number_match:
            flush()
            current_marker = f"範例{number_match.group(1)}"
            remainder = number_match.group(2).strip()
            buffer = [remainder] if remainder else []
            continue

        if current_marker:
            buffer.append(raw)

    flush()
    return blocks


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = UNDERLINE_RE.sub("＿＿＿＿", value)
    value = HTML_COMMENT_RE.sub("", value)
    value = DANGLING_IMAGE_RE.sub("", value)
    value = RAW_INSPECT_MEDIA_RE.sub("", value)
    value = ARRAY_OPEN_RE.sub("", value)
    value = ARRAY_CLOSE_RE.sub("", value)
    value = re.sub(r"\s*\\\\\s*", "\n", value)
    value = value.replace("`", "")
    value = value.replace("*", "")
    value = value.replace("\\mspace{6mu}", " ")
    value = value.replace("\\left(", "(").replace("\\right)", ")")
    value = value.replace("\\left[", "[").replace("\\right]", "]")
    value = value.replace("\\left\\{", "{").replace("\\right\\}", "}")
    value = value.replace("\\(", "(").replace("\\)", ")")
    value = value.replace("\\[", "[").replace("\\]", "]")
    value = value.replace("\\|", "|")
    value = value.replace("\\$", "$")
    value = value.replace("}}", "}")
    value = value.replace("{{", "{")

    cleaned_lines = []
    for raw_line in value.split("\n"):
        line = plain_line(raw_line)
        if is_decorative_line(line) or should_drop_line(line):
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"\[圖:[^\]]+\]\]+", lambda m: m.group(0).rstrip("]"), value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = re.sub(r"^[\]\).,，。\s]+", "", value)
    value = cleanup_import_artifacts(value)
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
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。；﹒")
    if len(seed) > 34:
        seed = seed[:34].rstrip(" ：，。；﹒")
    title = f"{marker}：{seed}" if seed else marker
    title = title.replace("範例重要", "範例")
    return clean_question_title(title)


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(section: str, marker: str, title: str, question_text: str, explanation_text: str) -> str:
    text = "\n".join([section, marker, title, question_text, explanation_text])

    if section.startswith("主題6"):
        return "senior-vector-dot-product-inequalities-s332"

    if section.startswith("主題5"):
        if has_any(text, ["面積", "平行四邊形", "AQ", "BQ", "距離", "最近", "最近之距離", "角平分線"]):
            return "senior-vector-dot-product-distance-formula-s332"
        return "senior-vector-dot-product-applications-s332"

    if section.startswith("主題4"):
        if has_any(text, ["正射影", "投影", "投影量", "分向量", "分量"]):
            return "senior-vector-projection-s332"
        return "senior-vector-dot-product-signed-projection-s332"

    if section.startswith("主題3"):
        return "senior-vector-dot-product-angle-between-lines-s332"

    if section.startswith("主題2"):
        return "senior-vector-dot-product-applications-s332"

    if section.startswith("主題1"):
        if has_any(text, ["最小值", "最大值", "垂直", "平行", "夾角", "cos", "直角"]):
            return "senior-vector-dot-product-angle-s332"
        return "senior-vector-dot-product-main-s332"

    return "s3-3-2-dot-product-core"


def apply_manual_fixes(record: dict):
    if record["id"] == "q-s3-3-2-0005":
        record["explanation_text"] = (
            "$\\overset{⃑}{c}=\\overset{⃑}{a}+t\\overset{⃑}{b}=(2,-4)+t(-1,1)=(2-t,t-4)$。\n"
            "故$|\\overset{⃑}{c}|=\\sqrt{(2-t)^2+(t-4)^2}=\\sqrt{2t^2-12t+20}"
            "=\\sqrt{2(t-3)^2+2}$。\n"
            "所以當$t=3$時，$|\\overset{⃑}{c}|$有最小值$\\sqrt{2}$。"
        )

    if record["id"] == "q-s3-3-2-0008":
        record["explanation_text"] = (
            "設$\\overset{⃑}{a}=(x,y)$，則\n"
            "$x^2+y^2=64$，且\n"
            "$\\sqrt{3}x+y=\\overset{⃑}{a}\\cdot\\overset{⃑}{b}"
            "=|\\overset{⃑}{a}|\\,|\\overset{⃑}{b}|\\cos120^\\circ=8\\cdot2\\cdot\\left(-\\frac12\\right)=-8$。\n"
            "聯立"
            "$x^2+y^2=64$與$\\sqrt{3}x+y=-8$，"
            "可得$(x,y)=(0,-8)$或$(-4\\sqrt{3},4)$。\n"
            "故$\\overset{⃑}{a}=(0,-8)$或$(-4\\sqrt{3},4)$。"
        )

    if record["id"] == "q-s3-3-2-0010":
        record["explanation_text"] = (
            "如圖，由餘弦定理可得 cos∠ABC = "
            "$\\frac{6^{2}+7^{2}-5^{2}}{2\\cdot6\\cdot7}=\\frac{5}{7}$。\n"
            "故$\\overset{⃑}{AB}\\cdot\\overset{⃑}{BC}=|\\overset{⃑}{AB}|\\,|\\overset{⃑}{BC}|\\cos(180^\\circ-\\angle ABC)"
            "=6\\cdot7\\cdot\\left(-\\frac{5}{7}\\right)=-30$。"
        )

    if record["id"] == "q-s3-3-2-0013":
        record["title"] = "範例3：由內積條件反求向量係數"
        record["question_text"] = (
            "如圖，在△ABC中，E為圖示點，且"
            "$\\overset{⃑}{AE}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，$x,y\\in\\mathbb{R}$。\n"
            "[圖:program-db/imports/packs/s3-3-2/assets/media/image8.wmf.png]\n"
            "(1)求$\\overset{⃑}{AB}\\cdot\\overset{⃑}{AC}$。\n"
            "(2)證明$\\overset{⃑}{AE}\\cdot\\overset{⃑}{AB}=\\frac12\\overline{AB}^{2}$。\n"
            "(3)求$x,y$之值。"
        )
        record["explanation_text"] = (
            "(1)由餘弦定理，"
            "$\\overset{⃑}{AB}\\cdot\\overset{⃑}{AC}"
            "=\\frac12\\left(\\overline{AB}^{2}+\\overline{AC}^{2}-\\overline{BC}^{2}\\right)=12$。\n"
            "(2)設M為圖中E在$\\overline{AB}$上的垂足，則"
            "$\\overset{⃑}{AE}\\cdot\\overset{⃑}{AB}"
            "=\\overline{AE}\\cdot\\overline{AB}\\cos\\theta"
            "=\\overline{AB}\\cdot\\overline{AM}"
            "=\\overline{AB}\\cdot\\frac12\\overline{AB}"
            "=\\frac12\\overline{AB}^{2}$。\n"
            "(3)由"
            "$\\overset{⃑}{AE}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，\n"
            "$\\overset{⃑}{AB}\\cdot\\overset{⃑}{AE}"
            "=x\\overline{AB}^{2}+y\\left(\\overset{⃑}{AB}\\cdot\\overset{⃑}{AC}\\right)$，\n"
            "$\\overset{⃑}{AC}\\cdot\\overset{⃑}{AE}"
            "=x\\left(\\overset{⃑}{AB}\\cdot\\overset{⃑}{AC}\\right)+y\\overline{AC}^{2}$。\n"
            "又由題圖可得"
            "$\\overset{⃑}{AB}\\cdot\\overset{⃑}{AE}=18$、"
            "$\\overset{⃑}{AC}\\cdot\\overset{⃑}{AE}=8$，"
            "因此\n"
            "$36x+12y=18$，$12x+16y=8$，解得$x=\\frac49$，$y=\\frac16$。"
        )

    if record["id"] == "q-s3-3-2-0018":
        record["question_text"] = (
            "△ABC中，已知$\\overline{AB}=6$，$\\overline{BC}=7$，$\\overline{AC}=5$，則\n"
            "(1)$\\overset{⃑}{AB}\\cdot\\overset{⃑}{AC}=＿＿＿＿。\n"
            "(2)G為△ABC之重心，且$\\overset{⃑}{AG}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，則$(x,y)=＿＿＿＿$。\n"
            "(3)I為△ABC之內心，且$\\overset{⃑}{AI}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，則$x+y=＿＿＿＿$。\n"
            "(4)H為△ABC之垂心，且$\\overset{⃑}{AH}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，則$(x,y)=＿＿＿＿$。\n"
            "(5)T為△ABC之外心，且$\\overset{⃑}{AT}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，則$(x,y)=＿＿＿＿$。"
        )
        record["explanation_text"] = (
            "(1)$\\overline{AB}=6$，$\\overline{BC}=7$，$\\overline{AC}=5$，"
            "故$\\overset{⃑}{AB}\\cdot\\overset{⃑}{AC}=|\\overset{⃑}{AB}|\\,|\\overset{⃑}{AC}|\\cos A"
            "=6\\cdot5\\cdot\\frac{36+25-49}{2\\cdot6\\cdot5}=6$。\n"
            "(2)G為重心，故$\\overset{⃑}{AG}=\\frac{1}{3}\\overset{⃑}{AB}+\\frac{1}{3}\\overset{⃑}{AC}$，"
            "所以$(x,y)=\\left(\\frac{1}{3},\\frac{1}{3}\\right)$。\n"
            "(3)a=7,b=5,c=6，內心公式得"
            "$\\overset{⃑}{AI}=\\frac{5}{18}\\overset{⃑}{AB}+\\frac{6}{18}\\overset{⃑}{AC}$，"
            "故$x+y=\\frac{11}{18}$。\n"
            "(4)設$\\overset{⃑}{AH}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，"
            "由$\\overset{⃑}{AH}\\cdot\\overset{⃑}{AB}=\\overset{⃑}{AC}\\cdot\\overset{⃑}{AB}$與"
            "$\\overset{⃑}{AH}\\cdot\\overset{⃑}{AC}=\\overset{⃑}{AB}\\cdot\\overset{⃑}{AC}$，"
            "得$36x+6y=6$、$6x+25y=6$，解得$x=\\frac{19}{144}$，$y=\\frac{5}{24}$。\n"
            "(5)設$\\overset{⃑}{AT}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，"
            "由外心性質$\\overset{⃑}{AT}\\cdot\\overset{⃑}{AB}=\\frac12|\\overset{⃑}{AB}|^2$、"
            "$\\overset{⃑}{AT}\\cdot\\overset{⃑}{AC}=\\frac12|\\overset{⃑}{AC}|^2$，"
            "得$36x+6y=18$、$6x+25y=\\frac{25}{2}$，解得$x=\\frac{125}{288}$，$y=\\frac{19}{48}$。"
        )

    if record["id"] == "q-s3-3-2-0019":
        record["title"] = "範例6：由邊長求內積、垂心與外心向量係數"
        record["question_text"] = (
            "△ABC中，已知$\\overline{BC}=6$，$\\overline{AC}=7$，$\\overline{AB}=5$。\n"
            "(1)求$\\overset{⃑}{AB}\\cdot\\overset{⃑}{AC}$。\n"
            "(2)若H為垂心，且$\\overset{⃑}{AH}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，求$x,y$。\n"
            "(3)若T為外心，且$\\overset{⃑}{AT}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，求$x,y$。"
        )
        record["explanation_text"] = (
            "(1)a=6，b=7，c=5，故"
            "$\\overset{⃑}{AB}\\cdot\\overset{⃑}{AC}=|\\overset{⃑}{AB}|\\,|\\overset{⃑}{AC}|\\cos A"
            "=5\\cdot7\\cdot\\frac{49+25-36}{2\\cdot7\\cdot5}=19$。\n"
            "(2)設$\\overset{⃑}{AH}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，"
            "由$\\overset{⃑}{AH}\\cdot\\overset{⃑}{AB}=\\overset{⃑}{AC}\\cdot\\overset{⃑}{AB}$與"
            "$\\overset{⃑}{AH}\\cdot\\overset{⃑}{AC}=\\overset{⃑}{AB}\\cdot\\overset{⃑}{AC}$，"
            "得$25x+19y=19$、$19x+49y=19$，解得$x=\\frac{95}{144}$，$y=\\frac{19}{144}$。\n"
            "(3)設$\\overset{⃑}{AT}=x\\overset{⃑}{AB}+y\\overset{⃑}{AC}$，"
            "由$\\overset{⃑}{AT}\\cdot\\overset{⃑}{AB}=\\frac12|\\overset{⃑}{AB}|^2$、"
            "$\\overset{⃑}{AT}\\cdot\\overset{⃑}{AC}=\\frac12|\\overset{⃑}{AC}|^2$，"
            "得$25x+19y=\\frac{25}{2}$、$19x+49y=\\frac{49}{2}$，解得$x=\\frac{49}{288}$，$y=\\frac{125}{288}$。"
        )

    if record["id"] == "q-s3-3-2-0021":
        record["title"] = "範例1：由一般式判讀直線性質"
        record["question_text"] = (
            "有一直線$L:3x+4y=12$，則下列敘述何者為真？\n"
            "(A) $L$之斜率為$-\\frac34$。\n"
            "(B) $L$之法向量可取為$(3,4)$。\n"
            "(C) $L$之方向向量可取為$(-4,3)$。\n"
            "(D) $L$之方向向量可取為$\\left(\\frac45,-\\frac35\\right)$。\n"
            "(E) $L$的參數式可寫成$\\begin{cases}x=4t\\\\ y=3-3t\\end{cases}$，$t\\in\\mathbb{R}$。"
        )
        record["explanation_text"] = (
            "由$L:3x+4y=12$可得斜率為$-\\frac34$，故(A)正確。\n"
            "直線一般式$ax+by+c=0$的法向量可取為$(a,b)$，故(B)正確。\n"
            "與$(3,4)$垂直的向量可取為$(-4,3)$，故(C)正確；"
            "$\\left(\\frac45,-\\frac35\\right)$與$(-4,3)$平行，故(D)也正確。\n"
            "又點$(0,3)$在直線$L$上，配合方向向量$(4,-3)$，"
            "可得參數式$\\begin{cases}x=4t\\\\ y=3-3t\\end{cases}$，故(E)正確。\n"
            "因此答案為(A)(B)(C)(D)(E)。"
        )

    if record["id"] == "q-s3-3-2-0027":
        record["explanation_text"] = (
            "如圖，銳角平分線滿足\n"
            "$\\frac{3x-4y-5}{5}=\\frac{-(4x-3y+10)}{5}$。\n"
            "故$3x-4y-5=-(4x-3y+10)$，整理得$7x-7y+5=0$。"
        )

    if record["id"] == "q-s3-3-2-0028":
        record["explanation_text"] = (
            "設P(x,y)在兩直線$L_1:4x-3y=0$、$L_2:5x-12y=0$的角平分線上，\n"
            "則$d(P,L_1)=d(P,L_2)$，故"
            "$\\frac{|4x-3y|}{5}=\\frac{|5x-12y|}{13}$。\n"
            "化簡得兩條角平分線為$9x+7y=0$及$7x-9y=0$。\n"
            "由圖可知鈍角平分線為$9x+7y=0$。"
        )

    if record["id"] == "q-s3-3-2-0023":
        record["title"] = "範例3：由參數式求斜率、夾角與距離"
        record["question_text"] = (
            "平面上二直線\n"
            "$L_1:\\begin{cases}x=-1+t\\\\ y=1+2t\\end{cases},\\ t\\in\\mathbb{R}$，\n"
            "$L_2:\\begin{cases}x=2-s\\\\ y=3s\\end{cases},\\ s\\in\\mathbb{R}$。\n"
            "(1)求$L_1$的斜率。\n"
            "(2)求$L_1$和$L_2$的夾角。\n"
            "(3)若原點到$L_1,L_2$的距離分別為$d_1,d_2$，求$d_1^2+d_2^2$。"
        )
        record["explanation_text"] = (
            "(1)$L_1$上可取兩點$A(-1,1)$、$B(0,3)$，"
            "故斜率$m=\\frac{3-1}{0-(-1)}=2$。\n"
            "(2)$L_1,L_2$的方向向量可分別取為$(1,2)$、$(-1,3)$，"
            "因此\n"
            "$\\cos\\theta=\\pm\\frac{(1,2)\\cdot(-1,3)}{\\sqrt5\\cdot\\sqrt{10}}"
            "=\\pm\\frac{5}{\\sqrt{50}}=\\pm\\frac{1}{\\sqrt2}$，\n"
            "故夾角為$45^\\circ$或$135^\\circ$。\n"
            "(3)消去參數可得$L_1:2x-y+3=0$，$L_2:3x+y-6=0$。\n"
            "所以$d_1=\\frac{|3|}{\\sqrt5}$，$d_2=\\frac{|{-6}|}{\\sqrt{10}}$，\n"
            "故$d_1^2+d_2^2=\\frac95+\\frac{36}{10}=\\frac{27}{5}$。"
        )

    if record["id"] == "q-s3-3-2-0026":
        record["title"] = "隨堂練習：由參數式求交點與角平分線"
        record["question_text"] = (
            "兩直線的參數方程式分別為\n"
            "$L_1:\\begin{cases}x=6+2t\\\\ y=-t\\end{cases},\\ t\\in\\mathbb{R}$，\n"
            "$L_2:\\begin{cases}x=2+s\\\\ y=2-2s\\end{cases},\\ s\\in\\mathbb{R}$。\n"
            "試求兩直線\n"
            "(1)交點坐標。\n"
            "(2)交角平分線的方程式。"
        )
        record["explanation_text"] = (
            "(1)由$L_1$消去$t$得$x+2y-6=0$；由$L_2$消去$s$得$2x+y-6=0$。\n"
            "聯立$\\begin{cases}x+2y-6=0\\\\ 2x+y-6=0\\end{cases}$，"
            "解得交點為$(2,2)$。\n"
            "(2)設$P(x,y)$在角平分線上，則它到兩直線的距離相等，故\n"
            "$\\frac{|x+2y-6|}{\\sqrt5}=\\frac{|2x+y-6|}{\\sqrt5}$。\n"
            "因此$|x+2y-6|=|2x+y-6|$，\n"
            "化簡得角平分線為$x-y=0$及$x+y-4=0$。"
        )

    if record["id"] == "q-s3-3-2-0032":
        record["explanation_text"] = (
            "直線$\\mathcal{l}:x+\\sqrt{3}y=3$的方向向量可取為$(\\sqrt{3},-1)$，其方向角為330°。\n"
            "與它夾角60°的直線，其斜角可為30°或90°，\n"
            "故斜率為$\\frac{1}{\\sqrt{3}}$或不存在。\n"
            "又直線L過點A(3,1)，所以所求直線為$x=3$或$x-\\sqrt{3}y=3-\\sqrt{3}$。"
        )

    if record["id"] == "q-s3-3-2-0033":
        record["explanation_text"] = (
            "由圖可取$L_2$、$L_3$的交角平分線為"
            "$\\mathcal{l}_1: \\frac{2x-9y+16}{\\sqrt{85}}=-\\frac{9x-2y-5}{\\sqrt{85}}$，"
            "整理得$\\mathcal{l}_1:x-y+1=0$。\n"
            "再取$L_1$、$L_3$的交角平分線為"
            "$\\mathcal{l}_2: \\frac{7x+6y-59}{\\sqrt{85}}=-\\frac{9x-2y-5}{\\sqrt{85}}$，"
            "整理得$\\mathcal{l}_2:4x+y-16=0$。\n"
            "聯立可得內心坐標為$(3,4)$。"
        )

    if record["id"] == "q-s3-3-2-0034":
        record["explanation_text"] = (
            "(1)由"
            "$\\frac{|3x+4y-7|}{5}=\\frac{|4x+3y+2|}{5}$，"
            "得角平分線為$(3x+4y-7)=\\pm(4x+3y+2)$。\n"
            "銳角平分線位於兩直線異號區，故取"
            "$(3x+4y-7)=-(4x+3y+2)$，得$7x+7y=5$。\n"
            "(2)再由$L_1$與$L_3:4x-3y=18$之角平分線位於同號區，"
            "取$(3x+4y-7)=(4x-3y-18)$，得$x-7y=11$。\n"
            "聯立$7x+7y=5$與$x-7y=11$，得內心$I=(2,-\\frac{9}{7})$。"
        )

    if record["id"] == "q-s3-3-2-0035":
        record["explanation_text"] = (
            "(1)$L_2:2x-y=-9$與$L_3:x-2y=-3$的角平分線滿足\n"
            "$\\frac{2x-y+9}{\\sqrt{5}}=\\pm\\frac{x-2y+3}{\\sqrt{5}}$，"
            "故得$x+y+6=0$及$x-y+4=0$。\n"
            "(2)由圖可知內角平分線取$\\mathcal{l}_1:x-y+4=0$。\n"
            "而$L_1:2x+y=13$與$L_3$的內角平分線位於同號區，"
            "故$\\frac{2x+y-13}{\\sqrt{5}}=\\frac{x-2y+3}{\\sqrt{5}}$，"
            "整理得$\\mathcal{l}_2:x+3y-16=0$。\n"
            "聯立可得內心$I=(1,5)$。"
        )

    if record["id"] == "q-s3-3-2-0049":
        record["explanation_text"] = (
            "設$y=\\sqrt{(t-4)^2+25}+\\sqrt{(t+4)^2+1}$。\n"
            "令$P(t,0)$，則$A(4,5)$、$B(-4,1)$，有$y=\\overline{PA}+\\overline{PB}$。\n"
            "點P的軌跡為x軸，將B對x軸對稱得$B'(-4,-1)$，\n"
            "則$\\overline{PA}+\\overline{PB}=\\overline{PA}+\\overline{PB'}\\ge \\overline{AB'}$。\n"
            "而$\\overline{AB'}=10$，故最小值為10。"
        )

    if record["id"] == "q-s3-3-2-0050":
        record["title"] = "隨堂練習：在線上取點使距離差最大"
        record["explanation_text"] = (
            "作點$A(0,1)$關於直線$L:x+y-4=0$的對稱點$A'$。\n"
            "對於$L$上任一點$Q$，都有$QA=QA'$，因此\n"
            "$|QA-QB|=|QA'-QB|\\le A'B$。\n"
            "當$Q$取為直線$\\overleftrightarrow{A'B}$與$L$的交點時等號成立，故此時距離差最大。\n"
            "由對稱可得$A'=(3,4)$，而$B=(6,4)$，所以直線$\\overleftrightarrow{A'B}$為$y=4$。\n"
            "再與$L:x+y-4=0$聯立，得$x=0,y=4$，故所求點為$P(0,4)$。"
        )

    if record["id"] == "q-s3-3-2-0051":
        record["title"] = "隨堂練習：線段上二次式的最大值"
        record["explanation_text"] = (
            "線段$\\overline{AB}$可參數化為\n"
            "$\\begin{cases}x=2-t\\\\ y=3-2t\\end{cases}$，其中$0\\le t\\le1$。\n"
            "因此\n"
            "$x^2+2y^2=(2-t)^2+2(3-2t)^2=9\\left(t-\\frac{14}{9}\\right)^2+\\frac29$。\n"
            "因為$0\\le t\\le1$，而拋物線開口向上，區間內最大值出現在端點。\n"
            "代入$t=0$得$22$，代入$t=1$得$3$，故最大值為$22$。"
        )

    if "設平面上有三條直線" in record["question_text"]:
        record["title"] = "隨堂練習：已知角平分線反求另一條直線"

    if "三直線L1" in record["question_text"] or "三直線 L1" in record["question_text"]:
        record["formula_id"] = "senior-vector-dot-product-distance-formula-s332"

    record["question_text"] = clean_question_body(record["question_text"])
    record["explanation_text"] = clean_question_body(record["explanation_text"])
    record["title"] = clean_question_title(record["title"])


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = record.get("source_section") or "主題1：向量的內積"
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
        "- `q-s3-3-2-0020`",
        "  - 外心與垂心題含多張圖與公式小圖，建議看前端圖文順序。",
        "- `q-s3-3-2-0040`",
        "  - 角平分線與內心題主要依賴圖判斷正負區域，建議看版面。",
        "- `q-s3-3-2-0051`",
        "  - 點到直線距離主題切成內嵌式範例，這題建議檢查換行。",
        "- `q-s3-3-2-0057`",
        "  - 含反射法與圖像幾何，建議前端確認圖片顯示。",
        "- `q-s3-3-2-0061`",
        "  - 柯西不等式題含大量根號與分式，建議檢查數學排版。",
        "",
        "## Notes",
        "",
        "- 這章前四個主題使用一般 `範例/隨堂練習` 解析；主題五、六另外解析 `※重要範例` 與內嵌 `隨堂練習`。",
        "- 已依網站 `s3-3-2` 既有主題附掛，不是只掛章節核心。",
        "- `範例 -> 基本`、`隨堂練習 -> 重要` 已套回正式匯入格式。",
        "- `wmf/emf` 會自動補成 `.png` sidecar 供前端顯示。",
    ]
    return "\n".join(lines).strip() + "\n"


def copy_support_files(base_dir: Path, pack_dir: Path) -> tuple[str, str]:
    source_dir = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    source_doc = first_match(source_dir / "source", "3A-9*.docx")
    source_md = first_match(source_dir / "extracted", "3A-9*.md")

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
    markdown_path = first_match(source_pack / "extracted", "3A-9*.md")
    markdown_text = markdown_path.read_text(encoding="utf-8")

    blocks = parse_standard_blocks(markdown_text)
    blocks.extend(parse_inline_topic_blocks(markdown_text, "主題5：點到直線的距離"))
    blocks.extend(parse_inline_topic_blocks(markdown_text, "主題6：柯西不等式"))

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
        section = normalize_section_name(block["section"])
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

    output_records.sort(key=lambda row: row["id"])
    payload = {"chapter_code": CHAPTER_CODE, "chapter_title": CHAPTER_TITLE, "questions": output_records}
    write_json(pack_dir / "questions.json", payload)
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
