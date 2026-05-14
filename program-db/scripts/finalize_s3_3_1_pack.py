import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


SOURCE_PACK = "_inspect-3A-8"
CHAPTER_CODE = "s3-3-1"
CHAPTER_TITLE = "平面向量"

TOPIC_RE = re.compile(r"主題\s*(\d+)\s*[:：]\s*(.+)")
MARKER_RE = re.compile(r"(範例\s*\d+|隨堂練習)")
EXPLANATION_RE = re.compile(r"(?:【解析】|【詳解】|【解】|解析：|解：|【龍騰自命題】)")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]+\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
DANGLING_IMAGE_RE = re.compile(r"\]\(\.\\program-db\\imports\\packs\\_inspect-3A-8\\assets\\media\\[^)]+\)")
RAW_INSPECT_MEDIA_RE = re.compile(
    r"\]?[\(\[]\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-3A-8[\\/]+assets[\\/]+media[\\/][^)\\]]+[)\]]"
)
SOURCE_NOTE_RE = re.compile(r"^【[^】]*(?:自命題|期中考|期末考|模擬考|聯考|學測|指考|高中|女中|附中|建國中學)[^】]*】$")
ARRAY_OPEN_RE = re.compile(r"\$?\{?\s*\\begin\{(?:array|matrix)\}(?:\{[^}]*\})?")
ARRAY_CLOSE_RE = re.compile(r"\\end\{(?:array|matrix)\}\s*\\right\.\$?")


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
    if stripped in {"**", "*\\*"}:
        return True
    return False


def should_drop_line(line: str) -> bool:
    stripped = str(line or "").strip()
    if not stripped:
        return True
    if stripped in {"![", "]![", "](", "![1", "![", "\\", "\\\\", "]"}:
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
                    "section": current_section or "主題1：有向線段與向量",
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
    value = value.replace("\\<", "<").replace("\\>", ">")
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
    value = re.sub(r"[\]\).,，。\s]+$", "", value)
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

    if section.startswith("主題5"):
        return "senior-plane-vector-line-param-form-s331"

    if section.startswith("主題4"):
        if has_any(text, ["面積比", "PAB", "PBC", "PCA", "lPA", "mPB", "nPC"]):
            return "senior-plane-vector-area-ratio-barycentric-s331"
        if has_any(text, ["內分點", "外分點", "PR", "QR", "AP", "PB", "分點公式", "坐標為＿＿＿＿"]):
            return "senior-plane-vector-linear-combination-s331"
        return "senior-plane-vector-triangle-centers-s331"

    if section.startswith("主題3"):
        if has_any(text, ["Menelaus", "梅涅勞斯", "AF/FB", "BD/DC", "CE/EA"]):
            return "senior-plane-vector-ceva-menelaus-s331"
        if has_any(text, ["區域", "軌跡", "α ≤", "β ≤", "alpha", "beta", "點集合", "係數限制"]):
            return "senior-plane-vector-locus-constraints-s331"
        if has_any(text, ["面積比", "PAB", "PBC", "PCA", "係數條件判定點的位置區域"]):
            return "senior-plane-vector-area-ratio-barycentric-s331"
        if has_any(text, ["面積", "平行四邊形", "三角形面積", "det", "內積", "外積", "共線", "△ABC"]):
            return "senior-plane-vector-area-by-components-s331"
        return "senior-plane-vector-linear-combination-s331"

    if section.startswith("主題2"):
        if has_any(text, ["坐標", "方向角", "分量", "x分量", "y分量", "(a,b)", "向量長度"]):
            return "senior-plane-vector-coordinate-representation-s331"
        return "senior-plane-vector-coordinate-representation-s331"

    if section.startswith("主題1"):
        if has_any(text, ["坐標", "(a,b)", "方向角", "單位向量"]):
            return "senior-plane-vector-coordinate-representation-s331"
        return "senior-plane-vector-operations-s331"

    if has_any(text, ["參數方程式", "等速直線", "颱風", "t ∈ R", "線段AB", "射線AB"]):
        return "senior-plane-vector-line-param-form-s331"
    if has_any(text, ["重心", "內心", "外分角平分線", "徬心"]):
        return "senior-plane-vector-triangle-centers-s331"
    if has_any(text, ["面積比", "Menelaus", "線性組合係數"]):
        return "senior-plane-vector-area-ratio-barycentric-s331"
    if has_any(text, ["分點", "內分", "外分", "中點", "線性組合"]):
        return "senior-plane-vector-linear-combination-s331"
    if has_any(text, ["坐標向量", "方向角", "分量", "向量長度"]):
        return "senior-plane-vector-coordinate-representation-s331"
    if has_any(text, ["平行四邊形", "三角形面積", "面積", "共線", "det"]):
        return "senior-plane-vector-area-by-components-s331"
    return "s3-3-1-plane-vector-core"


def apply_manual_fixes(index: int, record: dict):
    # 範例6 / 範例6 duplicated numbering at topic 5 are both retained; only clean some noisy cases.
    if record["id"] == "q-s3-3-1-0002":
        record["explanation_text"] = (
            "(1)所求為$\\overset{⃑}{AG}$，$\\overset{⃑}{GA}$，$\\overset{⃑}{EC}$，$\\overset{⃑}{CE}$，"
            "$\\overset{⃑}{BH}$，$\\overset{⃑}{HB}$，$\\overset{⃑}{DF}$及$\\overset{⃑}{FD}$，故共 8 個。\n"
            "(2)長度為 1 的向量可取為$\\overset{⃑}{AB}$，$\\overset{⃑}{BA}$，"
            "$\\overset{⃑}{AD}$，$\\overset{⃑}{DA}$，$\\overset{⃑}{AH}$，$\\overset{⃑}{HA}$，故共有 6 個。"
        )

    if "範例9" in record["title"] and "PR" in record["question_text"] and "QR" in record["question_text"]:
        record["question_text"] = record["question_text"].replace("[圖:program-db/imports/packs/s3-3-1/assets/media/image161.png]", "")
        record["question_text"] = record["question_text"].replace("[圖:program-db/imports/packs/s3-3-1/assets/media/image162.png]", "")

    if record["id"] == "q-s3-3-1-0007":
        record["explanation_text"] = (
            "如圖，向量可作任意平行移動。\n"
            "已知$\\overset{⃑}{AB}=\\overset{⃑}{DC}=\\overset{⃑}{EF}=\\overset{⃑}{HG}=\\overset{⃑}{a}$，"
            "$\\overset{⃑}{AD}=\\overset{⃑}{BC}=\\overset{⃑}{EH}=\\overset{⃑}{FG}=\\overset{⃑}{b}$，"
            "$\\overset{⃑}{AE}=\\overset{⃑}{BF}=\\overset{⃑}{DH}=\\overset{⃑}{CG}=\\overset{⃑}{c}$。\n"
            "(1)$\\overset{⃑}{AG}=\\overset{⃑}{a}+\\overset{⃑}{b}+\\overset{⃑}{c}$\n"
            "(2)$\\overset{⃑}{BH}=-\\overset{⃑}{a}+\\overset{⃑}{b}+\\overset{⃑}{c}$\n"
            "(3)$\\overset{⃑}{CE}=-\\overset{⃑}{a}-\\overset{⃑}{b}+\\overset{⃑}{c}$\n"
            "(4)$\\overset{⃑}{DF}=\\overset{⃑}{a}-\\overset{⃑}{b}+\\overset{⃑}{c}$\n"
            "(5)$\\overset{⃑}{EG}=\\overset{⃑}{a}+\\overset{⃑}{b}$"
        )

    if record["id"] == "q-s3-3-1-0008":
        record["title"] = "範例5：如圖判斷各敘述何者正確"
        record["question_text"] = (
            "如圖，請依各圖中的船速與水流速度判斷下列敘述何者正確：\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image20.png]\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image21.png]\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image22.png]\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image23.png]\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image24.png]\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image25.png]"
        )

    if record["id"] == "q-s3-3-1-0020":
        record["title"] = "隨堂練習：試以向量AB、BC表示AE"
        record["question_text"] = "試以$\\overset{⃑}{AB}$、$\\overset{⃑}{BC}$表示$\\overset{⃑}{AE}$。"

    if record["id"] == "q-s3-3-1-0021":
        record["explanation_text"] = (
            "$\\overset{⃑}{DE}=\\overset{⃑}{AE}-\\overset{⃑}{AD}$，\n"
            "又$\\overset{⃑}{AE}=3\\overset{⃑}{AB}$，$\\overset{⃑}{AD}=\\frac{2}{3}\\overset{⃑}{AC}$，\n"
            "故$\\overset{⃑}{DE}=3\\overset{⃑}{AB}-\\frac{2}{3}\\overset{⃑}{AC}$。"
        )

    if record["id"] == "q-s3-3-1-0046":
        record["title"] = "隨堂練習：已知△ABC面積為7，求點集合表示區域的面積"
        record["question_text"] = record["question_text"].replace("- ABC", "△ABC")
        record["explanation_text"] = (
            "點集合{P |$\\overset{⃑}{AP}=\\alpha\\overset{⃑}{AB}+\\beta\\overset{⃑}{AC}$，"
            "$-1\\leq\\alpha\\leq3$，$-2\\leq\\beta\\leq1$} 所表示的區域為一個平行四邊形。\n"
            "其面積為[3-(-1)][1-(-2)]\\times(2\\triangle ABC)=4\\times3\\times(2\\times7)=168。"
        )

    if record["id"] == "q-s3-3-1-0057":
        record["question_text"] = (
            "已知P(1，3)，Q(4，9)，若R在直線PQ上，$\\overline{PR}$：$\\overline{QR}$= 3：2，"
            "則R之坐標為＿＿＿＿。\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image161.png]\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image162.png]\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image163.wmf.png]\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image164.wmf.png]\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image165.wmf.png]\n"
            "[圖:program-db/imports/packs/s3-3-1/assets/media/image166.wmf.png]"
        )
        record["explanation_text"] = (
            "(1)由分點公式，若 R 為內分點，\n"
            "$\\overset{⃑}{OR}=\\frac{2}{5}\\overset{⃑}{OP}+\\frac{3}{5}\\overset{⃑}{OQ}$，\n"
            "故$(x,y)=\\frac{2}{5}(1,3)+\\frac{3}{5}(4,9)=\\left(\\frac{14}{5},\\frac{33}{5}\\right)$。\n"
            "(2)若依圖為外分情形，則$\\overline{PQ}$：$\\overline{QR}$=1：2，\n"
            "$\\overset{⃑}{OQ}=\\frac{2}{3}\\overset{⃑}{OP}+\\frac{1}{3}\\overset{⃑}{OR}$，\n"
            "故$(4,9)=\\frac{2}{3}(1,3)+\\frac{1}{3}(x,y)$，解得$(x,y)=(10,1)$。"
        )

    if record["id"] == "q-s3-3-1-0058":
        record["explanation_text"] = (
            "設P(x,y)。\n"
            "① 若 P 為內分點，$\\overline{AP}$：$\\overline{PB}$=1：2$，則\n"
            "$x=\\frac{1\\times4+2\\times(-2)}{3}=0$，"
            "$y=\\frac{1\\times3+2\\times5}{3}=\\frac{13}{3}$。\n"
            "② 若 P 為外分點，$\\overline{AP}$：$\\overline{PB}$=1：2$，則$\\overline{AP}$：$\\overline{AB}$=1：1$，\n"
            "故$-2=\\frac{4+x}{2}$，$5=\\frac{3+y}{2}$，解得$x=-8$，$y=7$。\n"
            "因此 P 點坐標為$(0,\\frac{13}{3})$或$(-8,7)$。"
        )

    if "範例6" in record["title"] and "周長有最小值" in record["question_text"]:
        record["explanation_text"] = (
            "設 C 點在直線 L：x - y = 1 上，因此可寫成 C(t + 1, t)。\n"
            "求 △ABC 周長最小，只需使 CA + CB 最小。\n"
            "將 A(1,1) 對直線 L：x - y - 1 = 0 做對稱，得 A′(2,0)。\n"
            "則 CA + CB = CA′ + CB ≥ A′B。\n"
            "聯立直線 A′B 與 L：\n"
            "{4x - y - 8 = 0, x - y - 1 = 0}\n"
            "得 C(7/3, 4/3) = (t + 1, t)，故 t = 4/3 時周長最小。"
        )

    if "範例6" in record["title"] and "颱風中心" in record["question_text"]:
        record["explanation_text"] = (
            "由 A(3,-1) 到 B(2,1) 的方向向量為 (-1,2)，\n"
            "故颱風中心位置可寫成 P(3 - t, -1 + 2t)。\n"
            "清晨 6 時對應 t = 6，故 P = (-3,11)。\n"
            "若甲地 (-1,5) 在暴風半徑 2 內，則\n"
            "(4 - t)^2 + (6 - 2t)^2 < 4。\n"
            "解得 12/5 < t < 4，\n"
            "因此甲地在清晨 2 時 24 分進入暴風圈，清晨 4 時 0 分脫離。"
        )

    if record["id"] == "q-s3-3-1-0072":
        record["explanation_text"] = (
            "設 C 點在直線 L：x - y = 1 上，因此可寫成 C(t + 1, t)。\n"
            "求 △ABC 周長最小，只需使 CA + CB 最小。\n"
            "將 A(1,1) 對直線 L：x - y - 1 = 0 做對稱，得 A′(2,0)。\n"
            "則 CA + CB = CA′ + CB \\ge A′B。\n"
            "聯立 A′B 與 L：\n"
            "4x - y - 8 = 0\n"
            "x - y - 1 = 0\n"
            "得 C(7/3,4/3)=(t+1,t)，故 t=4/3。"
        )

    if "主題4" in "".join(record.get("tags", [])) and "內⼼" in record["question_text"]:
        record["question_text"] = record["question_text"].replace("內⼼", "內心")

    record["question_text"] = clean_question_body(record["question_text"])
    record["explanation_text"] = clean_question_body(record["explanation_text"])
    record["title"] = clean_question_title(record["title"])


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = record.get("source_section") or "主題1：有向線段與向量"
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
        "- `q-s3-3-1-0008`",
        "  - 題幹原本幾乎全由圖片構成，這題已改成圖題形式，建議前端確認閱讀順序。",
        "- `q-s3-3-1-0020`",
        "  - 原始題幹未成功抽成文字，已依解析補成『以 AB、BC 表示 AE』，建議日後若有空再對原始 Word 圖稿。",
        "- `q-s3-3-1-0042`",
        "  - 分點與區域面積題的解析主要從圖片 alt 重建，建議前端看圖文搭配。",
        "- `q-s3-3-1-0068`",
        "  - 直線參數式最小周長題原始解析塞在圖片 alt 中，這題已人工清理，建議再檢查版面。",
        "- `q-s3-3-1-0073`",
        "  - 颱風等速直線題依賴文字與時間換算，建議前端確認換行與數學式顯示。",
        "",
        "## Notes",
        "",
        "- 這章使用 `主題1-5 + 範例/隨堂練習` 重新切題，實際共 73 題。",
        "- 已依網站 `s3-3-1` 既有分支附掛，不是只掛章節核心。",
        "- `範例 -> 基本`、`隨堂練習 -> 重要` 已套回正式匯入格式。",
        "- `wmf/emf` 會自動補成 `.png` sidecar 供前端顯示。",
    ]
    return "\n".join(lines).strip() + "\n"


def copy_support_files(base_dir: Path, pack_dir: Path) -> tuple[str, str]:
    source_dir = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    source_doc = first_match(source_dir / "source", "3A-8*.docx")
    source_md = first_match(source_dir / "extracted", "3A-8*.md")

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
    markdown_path = first_match(source_pack / "extracted", "3A-8*.md")
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
