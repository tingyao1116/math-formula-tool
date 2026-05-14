import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


SOURCE_PACK = "_inspect-2-10"
SOURCE_DOC = "2-10轉.docx"
SOURCE_MD = "2-10轉.md"
CHAPTER_CODE = "s2-3-2"
CHAPTER_TITLE = "二維數據分析"

REVIEW_NOTES = {
    3: "這題是多張散布圖比較，請確認前端圖片順序與選項閱讀感。",
    5: "去掉哪一點後相關係數最大，題意高度依賴圖，建議看前端清晰度。",
    17: "最小平方法題含較長推導，請確認題幹與解析的段落分隔。",
    24: "毒藥份量與死亡數題包含表格、迴歸線與預測，建議檢查版面。",
    34: "人氣指數與彈跳高度題有表格、散布圖和迴歸預測，建議看圖文搭配。",
    36: "公告地價與市價題屬完整應用題，建議前端再看一次數學與表格排版。",
}

MATH_BACKTICK_RE = re.compile(r"\$`(.*?)`\$", re.S)
INLINE_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
GENERIC_IMAGE_RE = re.compile(r"\[圖:\s*([^\]]+)\]")
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
MATH_FENCE_RE = re.compile(r"```(?:\s*math)?\s*(.*?)```", re.S)
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
TEXT_WRAPPER_RE = re.compile(r"\\text\{([^}]*)\}")
UNDERLINE_RE = re.compile(r"\[([^\]]+)\]\{\.underline\}")
IMAGE_ATTR_RE = re.compile(r"\{width=\"[^\"]*\"[^}]*\}")
PARTIAL_WIDTH_RE = re.compile(r'\{width=\"[^\n]*')
SOURCE_LINE_RE = re.compile(
    r"(?m)^【[^】]*(?:自命題|期中考|期末考|段考|講義|附中|女中|一中|高中|新突破)[^】]*】\s*$"
)
EXPLANATION_SPLIT_RE = re.compile(r"(【解析】|【解答】|【證明】)")
STRAY_HEIGHT_LINE_RE = re.compile(r'(?m)^height=\"[^\"]*\"\}\s*')
BOX_LINE_RE = re.compile(r"(?m)^\+-{3,}\+\s*$")


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
        return f"\n[圖: {normalized}]\n" if normalized else ""

    value = HTML_IMAGE_RE.sub(repl, value)
    value = INLINE_IMAGE_RE.sub(repl, value)
    value = GENERIC_IMAGE_RE.sub(
        lambda match: f"[圖: {normalize_asset_path(match.group(1))}]",
        value,
    )
    return value


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = HTML_COMMENT_RE.sub("", value)
    value = UNDERLINE_RE.sub(lambda match: match.group(1), value)
    value = IMAGE_ATTR_RE.sub("", value)
    value = PARTIAL_WIDTH_RE.sub("", value)
    value = MATH_BACKTICK_RE.sub(lambda match: f"${match.group(1).strip()}$", value)
    value = MATH_FENCE_RE.sub(lambda match: match.group(1).strip(), value)
    value = TEXT_WRAPPER_RE.sub(lambda match: match.group(1), value)
    value = value.replace("`", "")
    value = value.replace("<br />", "\n").replace("<br/>", "\n")
    replacements = {
        "\\mspace{6mu}": " ",
        "\\cdots": "…",
        "\\times": "×",
        "\\cdot": "·",
        "\\Rightarrow": "⇒",
        "\\left(": "(",
        "\\right)": ")",
        "\\left[": "[",
        "\\right]": "]",
        "\\left\\{": "{",
        "\\right\\}": "}",
        "\\varnothing": "∅",
        "\\emptyset": "∅",
        "﹐": "，",
        "﹒": "。",
        "﹖": "？",
        "﹕": "：",
        "　": " ",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = SOURCE_LINE_RE.sub("", value)
    value = STRAY_HEIGHT_LINE_RE.sub("", value)
    value = BOX_LINE_RE.sub("", value)
    value = re.sub(r"(?m)^【(?:解析|解答|證明)】\s*", "", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def split_preface_and_explanation(text: str) -> tuple[str, str]:
    raw = str(text or "")
    match = EXPLANATION_SPLIT_RE.search(raw)
    if not match:
        return raw, ""
    return raw[: match.start()], raw[match.end() :]


def question_looks_truncated(text: str) -> bool:
    value = re.sub(r"\[圖:\s*[^\]]+\]", "", str(text or "")).strip()
    if not value:
        return True
    if value in {"（", "(", "）", ")"}:
        return True
    if len(value) <= 10:
        return True
    if value.endswith(("=", "＝", "：", "(", "（", "﹕")):
        return True
    return False


def merge_question_parts(question_text: str, preface: str) -> str:
    question = normalize_text(question_text)
    extra = normalize_text(preface)
    if not extra:
        return question
    if extra in question:
        return question
    if question_looks_truncated(question):
        return normalize_text("\n".join(part for part in [question, extra] if part).strip())
    if not question.endswith(("。", "？", "!", "﹒", "﹖")):
        return normalize_text("\n".join([question, extra]).strip())
    if question.endswith(("如圖", "如下", "則", "求", "問", "如下表", "如下圖")):
        return normalize_text("\n".join([question, extra]).strip())
    return question


def infer_marker(category: str, title: str) -> str:
    title = str(title or "")
    if title.startswith("範例"):
        return title.split("：", 1)[0]
    if title.startswith("隨堂練習"):
        return "隨堂練習"
    return "範例" if category == "基本" else "隨堂練習"


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:\s*[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。")
    if len(seed) > 30:
        seed = seed[:30].rstrip(" ：，。")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def section_for(order: int) -> str:
    if order <= 9:
        return "主題1：散佈圖與相關型態"
    if order <= 16:
        return "主題2：相關係數公式與性質"
    if order <= 26:
        return "主題3：迴歸直線與最小平方法"
    return "主題4：迴歸預測與綜合應用"


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(order: int, title: str, question_text: str, explanation_text: str) -> str:
    text = f"{title}\n{question_text}\n{explanation_text}"

    if has_any(text, ["最小平方法", "鉛直距離", "D為最小", "求兩實數a與b", "試找一直線y = a +", "平方和最小"]):
        return "senior-regression-line-least-squares"
    if has_any(text, ["預測", "最適合直線方程式", "y對x的迴歸直線", "迴歸直線方程式", "斜率為何", "死亡數", "血壓", "市價", "彈跳高度"]):
        return "senior-bivariate-regression-prediction-s232"
    if has_any(text, ["x' =", "y' =", "平移和伸縮", "負號會使得斜率變化", "線性調整", "相關係數為0.83", "r(x,y)"]):
        return "senior-correlation-properties-transform"
    if has_any(text, ["Σ", "\\sum", "x_{i}y_{i}", "相關係數", "共變異數", "σ", "μ", "原始資料速算", "相關係數公式"]) and not has_any(text, ["迴歸直線", "最適合直線"]):
        if has_any(text, ["x_{i}y_{i}", "原始資料", "\\sum_{i = 1}", "速算"]):
            return "senior-bivariate-correlation-raw-sum-shortcut-s232"
        if has_any(text, ["共變異數"]):
            return "senior-bivariate-covariance-r-s232"
        return "senior-correlation-coefficient-definitions"
    if has_any(text, ["高度正相關", "低度正相關", "中度正相關", "中度負相關", "完全正相關", "完全負相關", "零相關", "散布圖", "相關型態", "去掉哪一筆", "哪一點", "圖（一）", "圖（二）"]):
        if has_any(text, ["高度正相關", "低度正相關", "中度正相關", "中度負相關"]):
            return "senior-bivariate-correlation-strength-bands-s232"
        if has_any(text, ["去掉哪一筆", "哪一點", "離此直線最遠", "外點", "誤區"]):
            return "senior-correlation-cautions-outliers"
        return "senior-scatterplot-correlation-patterns"
    if has_any(text, ["標準化後", "u_i", "v_i", "Y = aX + b", "標準化"]) and has_any(text, ["迴歸線", "相關係數"]):
        return "senior-standardized-regression-r"

    if order <= 9:
        return "senior-scatterplot-correlation-patterns"
    if order <= 16:
        return "senior-correlation-coefficient-definitions"
    if order <= 26:
        return "senior-regression-line-least-squares"
    return "senior-bivariate-regression-prediction-s232"


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
    lines = [
        f"# {CHAPTER_CODE} Review Needed",
        "",
        "## Current extraction status",
        "",
        f"- Parsed question records: {len(records)}",
        f"- Assigned `formula_id`: {sum(1 for row in records if row.get('formula_id'))}",
        f"- Needs manual review: {len(REVIEW_NOTES)}",
        "",
        "## Manual review items",
        "",
    ]
    for order, note in REVIEW_NOTES.items():
        record = next((row for row in records if row["source_order"] == order), None)
        if not record:
            continue
        lines.append(f"- `{record['id']}`")
        lines.append(f"  - {note}")
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已沿用既有規則。",
            "- 這章按題型重建 `source_section`，分成散佈圖判讀、相關係數、迴歸直線、迴歸預測四塊。",
            "- 圖片型散布圖題、表格型迴歸題、線性變換下相關係數題已分開附掛。",
            "- `wmf/emf` 已補成對應 `.png` sidecar，供前端顯示。",
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
    payload = read_json(source_pack / "questions.json")
    records = payload.get("questions", [])

    pack_dir = base_dir / "program-db" / "imports" / "packs" / CHAPTER_CODE
    (pack_dir / "source").mkdir(parents=True, exist_ok=True)
    (pack_dir / "extracted").mkdir(parents=True, exist_ok=True)
    (pack_dir / "assets" / "media").mkdir(parents=True, exist_ok=True)

    copy_support_files(base_dir, pack_dir)

    output_records = []
    for index, raw in enumerate(records, start=1):
        marker = infer_marker(raw.get("question_category", ""), raw.get("title", ""))
        raw_question = raw.get("question_text", "")
        raw_explanation = raw.get("explanation_text", "")
        preface, solution = split_preface_and_explanation(raw_explanation)
        question_text = merge_question_parts(raw_question, preface)
        explanation_text = normalize_text(solution)
        answer_text = normalize_text(raw.get("answer_text", ""))
        title = rebuild_title(marker, question_text or raw.get("title", ""))
        order = int(raw.get("source_order") or index)
        formula_id = formula_id_for(order, title, question_text, explanation_text)
        section = section_for(order)
        tags = [
            CHAPTER_CODE,
            f"section:{section}",
            f"marker:{marker}",
        ]
        record = {
            **raw,
            "id": f"q-{CHAPTER_CODE}-{index:04d}",
            "title": title,
            "question_text": question_text,
            "answer_text": answer_text,
            "explanation_text": explanation_text,
            "chapter_code": CHAPTER_CODE,
            "formula_id": formula_id,
            "source_section": section,
            "source_type": "docx_pack_markdown",
            "source_ref": f"source/{SOURCE_DOC}",
            "tags": tags,
        }
        output_records.append(record)

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


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-dir", default=".", help="Workspace root")
    args = parser.parse_args()
    base_dir = Path(args.base_dir).resolve()
    build_pack(base_dir)


if __name__ == "__main__":
    main()
