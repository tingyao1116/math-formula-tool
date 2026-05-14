import json
import re
import shutil
from collections import Counter
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


SOURCE_PACK = "_inspect-4A-2"
CHAPTER_CODE = "s4-1-2"
CHAPTER_TITLE = "空間向量的坐標表示法"

TOPIC_RE = re.compile(r"主題\s*(\d+)\s*[:：]\s*(.+)")
MARKER_RE = re.compile(r"^(範例\s*\d+|隨堂練習)\s*$")
EXPLANATION_RE = re.compile(r"(?:【解析】|【詳解】|【解】|【證明】|解析：|解：)")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]*\]\{\.underline\}")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
SOURCE_NOTE_RE = re.compile(r"^【[^】]*(?:自命題|期中考|期末考|段考|模擬考|女中|高中|中學)[^】]*】$")
RAW_INSPECT_MEDIA_RE = re.compile(
    r"\(?\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-4A-2[\\/]+assets[\\/]+media[\\/][^)\]\s]+(?:\.(?:png|jpg|jpeg|emf|wmf))\)?",
    re.I,
)
SECTION_FALLBACK = "主題1：空間坐標"


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
    if stripped in {"![", "]![", "](", "![1", "\\", "\\\\", "]", "["}:
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
            blocks.append(
                {
                    "marker": current_marker,
                    "section": current_section or SECTION_FALLBACK,
                    "raw_text": raw_text,
                }
            )
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
    value = value.replace("﹐", "，").replace("﹒", "。")
    value = value.replace("╳", "×")

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
    value = re.sub(r"\+\-+\+", "", value)
    value = re.sub(r"^[\]\).,，。；﹒\s]+", "", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。；﹒")
    if len(seed) > 36:
        seed = seed[:36].rstrip(" ：，。；﹒")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(section: str, marker: str, title: str, question_text: str, explanation_text: str) -> str:
    text = "\n".join([section, marker, title, question_text, explanation_text])

    if section.startswith("主題1"):
        if has_any(text, ["重心", "質心", "加權平均"]):
            return "senior-space-vector-centroid-weighted-average-s412"
        if has_any(text, ["中點", "分點", "內分", "外分", "角平分線", "AP：PB", "AP:PB", "BP：PC", "BP:PC"]):
            return "senior-space-vector-midpoint-section-s412"
        return "senior-space-vector-coordinate-main-s412"

    if has_any(text, ["方向角", "方向餘弦", "cosα", "cosβ", "cosγ", "alpha", "beta", "gamma"]):
        return "senior-space-vector-direction-cosines-s412"

    if has_any(text, ["重心", "質心", "加權平均"]):
        return "senior-space-vector-centroid-weighted-average-s412"

    if has_any(text, ["中點", "分點", "內分", "外分", "角平分線", "AP：PB", "AP:PB", "BP：PC", "BP:PC"]):
        return "senior-space-vector-midpoint-section-s412"

    if has_any(text, ["線性獨立", "共平面", "平面H", "三向量", "唯一表示", "平行六面體", "O、K、P", "O,K,P"]):
        return "senior-space-vector-independence-coplanarity-s412"

    if section.startswith("主題2"):
        if has_any(text, ["OQ", "OP", "OA", "OB", "OC", "OD", "共線", "夾角", "平分", "線性組合"]):
            return "senior-space-vector-linear-combination-s412"
        return "senior-space-vector-coordinate-main-s412"

    if has_any(text, ["重心", "質心", "加權平均"]):
        return "senior-space-vector-centroid-weighted-average-s412"

    if has_any(text, ["平分∠", "平分∠AOB", "u =", "v =", "w =", "p(", "q(", "OA + tOB", "線性組合", "t\\overset", "t值"]):
        return "senior-space-vector-linear-combination-s412"

    return "senior-space-vector-coordinate-main-s412"


def apply_manual_fixes(record: dict):
    qid = record["id"]

    if qid == "q-s4-1-2-0007":
        record["title"] = "隨堂練習：由三軸距離反求第一卦限坐標"
        record["question_text"] = (
            "設P點在第一卦限，而且與x軸、y軸、z軸的距離分別為$\\sqrt{52}$、$\\sqrt{45}$、5，"
            "則P點的坐標為＿＿＿＿。"
        )
        record["explanation_text"] = (
            "設P點坐標為$(x,y,z)$，則\n"
            "$\\sqrt{y^{2}+z^{2}}=\\sqrt{52}$、$\\sqrt{z^{2}+x^{2}}=\\sqrt{45}$、$\\sqrt{x^{2}+y^{2}}=5$。\n"
            "平方後得\n"
            "$y^{2}+z^{2}=52$、$z^{2}+x^{2}=45$、$x^{2}+y^{2}=25$。\n"
            "三式相加得$2x^{2}+2y^{2}+2z^{2}=122$，所以$x^{2}+y^{2}+z^{2}=61$。\n"
            "再分別相減可得$x^{2}=9$、$y^{2}=16$、$z^{2}=36$。\n"
            "因P在第一卦限，所以$x=3$、$y=4$、$z=6$，故P點坐標為$(3,4,6)$。"
        )

    if qid == "q-s4-1-2-0015":
        record["title"] = "隨堂練習：x軸上等距點坐標"

    if qid == "q-s4-1-2-0016":
        record["title"] = "範例6：zx平面上作正三角形第三點"
        record["question_text"] = "設A$(3,-1,2)$，B$(2,1,1)$，若點P在zx平面上使$\\triangle ABP$為正三角形，則P點坐標為何？"
        record["explanation_text"] = (
            "∵ P在zx平面上，∴ 設$P(x,0,z)$。\n"
            "由$\\overline{PA}=\\overline{PB}=\\overline{AB}$得\n"
            "$(x-3)^2+1+(z-2)^2=6$，$(x-2)^2+1+(z-1)^2=6$。\n"
            "整理為$x^{2}+z^{2}-6x-4z+8=0$，$x^{2}+z^{2}-4x-2z=0$。\n"
            "兩式相減得$x+z=4$，代回可得$x^{2}-5x+4=0$，所以$x=1$或$4$。\n"
            "因此$z=3$或$0$，故$P=(1,0,3)$或$(4,0,0)$。"
        )

    if qid == "q-s4-1-2-0024":
        record["question_text"] = record["question_text"].replace(
            "其中向量", "若其終點坐標為$P(a,b,c)$，則其中向量"
        )

    if qid == "q-s4-1-2-0026":
        record["title"] = "隨堂練習：由坐標求空間向量方向角"
        record["question_text"] = (
            "設$A(2,1,-2)$，$B(2+3\\sqrt{2},-2,1)$，則$\\overrightarrow{AB}$的方向角為＿＿＿＿。"
        )
        record["explanation_text"] = (
            "∵ $\\overrightarrow{AB}=(3\\sqrt{2},-3,3)=3(\\sqrt{2},-1,1)$，且$|\\overrightarrow{AB}|=6$。\n"
            "所以$\\cos\\alpha=\\frac{3\\sqrt{2}}{6}=\\frac{\\sqrt{2}}{2}$，故$\\alpha=\\frac{\\pi}{4}$；\n"
            "$\\cos\\beta=\\frac{-3}{6}=-\\frac{1}{2}$，故$\\beta=\\frac{2\\pi}{3}$；\n"
            "$\\cos\\gamma=\\frac{3}{6}=\\frac{1}{2}$，故$\\gamma=\\frac{\\pi}{3}$。\n"
            "因此$\\overrightarrow{AB}$的方向角為$\\left(\\frac{\\pi}{4},\\frac{2\\pi}{3},\\frac{\\pi}{3}\\right)$。"
        )
        record["formula_id"] = "senior-space-vector-direction-cosines-s412"

    if qid == "q-s4-1-2-0027":
        record["title"] = "範例3：由方向角與長度求終點坐標"
        record["question_text"] = (
            "有一向量$\\vec a$，始點在$(1,-5\\sqrt{2},0)$，$|\\vec a|=10$，"
            "方向角為$\\frac{\\pi}{3}$、$\\frac{\\pi}{4}$、$\\frac{2\\pi}{3}$，試求其終點坐標。"
        )
        record["explanation_text"] = (
            "設終點坐標為$(x,y,z)$，則$\\vec a=(x-1,y+5\\sqrt{2},z)$。\n"
            "由方向餘弦得\n"
            "$\\frac{x-1}{10}=\\cos\\frac{\\pi}{3}=\\frac{1}{2}$，所以$x=6$；\n"
            "$\\frac{y+5\\sqrt{2}}{10}=\\cos\\frac{\\pi}{4}=\\frac{\\sqrt{2}}{2}$，所以$y=0$；\n"
            "$\\frac{z}{10}=\\cos\\frac{2\\pi}{3}=-\\frac{1}{2}$，所以$z=-5$。\n"
            "故終點坐標為$(6,0,-5)$。"
        )
        record["formula_id"] = "senior-space-vector-direction-cosines-s412"

    if qid == "q-s4-1-2-0028":
        record["title"] = "隨堂練習：由終點與方向角反求始點坐標"
        record["question_text"] = (
            "有一向量$\\overrightarrow{AB}$，其終點B坐標為$(7,6,-5)$，"
            "$\\overrightarrow{AB}$與x軸、y軸、z軸正向的夾角分別為45°、60°、$\\gamma$"
            "（其中$90^\\circ<\\gamma<180^\\circ$），若$|\\overrightarrow{AB}|=9$，"
            "則$\\overrightarrow{AB}$始點A的坐標為＿＿＿＿。"
        )
        record["explanation_text"] = (
            "設A點坐標為$(x,y,z)$，則$\\overrightarrow{AB}=(7-x,6-y,-5-z)$。\n"
            "又$|\\overrightarrow{AB}|=9$，且方向角為$45^\\circ,60^\\circ,\\gamma$，所以\n"
            "$\\cos^245^\\circ+\\cos^260^\\circ+\\cos^2\\gamma=1$，得$\\cos^2\\gamma=\\frac{1}{4}$。\n"
            "因$90^\\circ<\\gamma<180^\\circ$，故$\\cos\\gamma=-\\frac{1}{2}$。\n"
            "因此$\\overrightarrow{AB}=(9\\cos45^\\circ,9\\cos60^\\circ,9\\cos\\gamma)"
            "=\\left(\\frac{9}{\\sqrt{2}},\\frac{9}{2},-\\frac{9}{2}\\right)$。\n"
            "比較分量得$7-x=\\frac{9}{\\sqrt{2}}$，$6-y=\\frac{9}{2}$，$-5-z=-\\frac{9}{2}$。\n"
            "所以$A=\\left(7-\\frac{9}{\\sqrt{2}},\\frac{3}{2},-\\frac{1}{2}\\right)$。"
        )
        record["formula_id"] = "senior-space-vector-direction-cosines-s412"

    if qid == "q-s4-1-2-0029":
        record["title"] = "範例3：共線內分點再交共平面求坐標"
        record["question_text"] = (
            "如圖，$OABC-DEFG$為一平行六面體，$P$在$\\overline{DE}$上且"
            "$\\overline{DP}:\\overline{PE}=3:2$。若$O,Q,P$共線，且$Q$在平面$ABC$上，\n"
            "試求$\\overrightarrow{OQ}=x\\overrightarrow{OA}+y\\overrightarrow{OB}+z\\overrightarrow{OC}$中的$x,y,z$。"
        )
        record["formula_id"] = "senior-space-vector-linear-combination-s412"

    if qid == "q-s4-1-2-0030":
        record["title"] = "範例4：長方體對角線夾角"
        record["question_text"] = "試求$\\overline{AG}$與$\\overline{FD}$的夾角度量$\\theta$=＿＿＿＿。"
        record["explanation_text"] = (
            "如圖，將圖形坐標化，得$\\overrightarrow{AG}=(4,5,3)$，$\\overrightarrow{FD}=(-4,5,-3)$。\n"
            "所以$\\cos\\theta=\\pm\\frac{\\overrightarrow{AG}\\cdot\\overrightarrow{FD}}{|\\overrightarrow{AG}|\\,|\\overrightarrow{FD}|}"
            "=\\pm\\frac{-16+25-9}{\\sqrt{50}\\cdot\\sqrt{50}}=0$。\n"
            "故$\\overline{AG}$與$\\overline{FD}$的夾角度量為$\\theta=\\frac{\\pi}{2}$。"
        )
        record["formula_id"] = "senior-space-vector-coordinate-main-s412"

    if qid == "q-s4-1-2-0034":
        record["title"] = "範例3：線段內分與伸長點坐標"

    if qid == "q-s4-1-2-0043":
        record["title"] = "隨堂練習：角平分向量係數"

    record["question_text"] = clean_question_body(record["question_text"])
    record["explanation_text"] = clean_question_body(record["explanation_text"])
    record["title"] = clean_question_title(record["title"])


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = record.get("source_section") or SECTION_FALLBACK
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
            "  - q-s4-1-2-0007：三軸距離反求坐標，已手動整理聯立格式。",
            "  - q-s4-1-2-0016：zx 平面正三角形，已手動整理聯立與結論。",
            "  - q-s4-1-2-0028：平行六面體與共平面係數題，推導較長。",
            "  - q-s4-1-2-0030：正四面體與正射影，含多小題。",
            "  - q-s4-1-2-0041：線性獨立方程組題，建議看前端長公式排版。",
        ]
    )


def copy_support_files(base_dir: Path, pack_dir: Path) -> tuple[str, str]:
    source_pack = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    source_doc = first_match(source_pack / "source", "4A-2*.docx")
    source_md = first_match(source_pack / "extracted", "4A-2*.md")

    target_doc = pack_dir / "source" / source_doc.name
    target_md = pack_dir / "extracted" / source_md.name
    shutil.copy2(source_doc, target_doc)
    shutil.copy2(source_md, target_md)

    media_src = source_pack / "assets" / "media"
    media_dst = pack_dir / "assets" / "media"
    media_dst.mkdir(parents=True, exist_ok=True)
    shutil.copytree(media_src, media_dst, dirs_exist_ok=True)
    return target_doc.name, target_md.name


def build_pack(base_dir: Path):
    source_pack = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    markdown_path = first_match(source_pack / "extracted", "4A-2*.md")
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
        section = block["section"] or SECTION_FALLBACK
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
    print(Counter(row["source_section"] for row in output_records))
    print(Counter(row["formula_id"] for row in output_records))


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parents[2]
    build_pack(base_dir)
