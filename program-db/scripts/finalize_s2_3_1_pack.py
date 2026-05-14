import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


SOURCE_PACK = "_inspect-2-9"
SOURCE_DOC = "2-9轉.docx"
SOURCE_MD = "2-9轉.md"
CHAPTER_CODE = "s2-3-1"
CHAPTER_TITLE = "一維數據分析"

REVIEW_NOTES = {
    17: "三個直方圖都依賴圖片，請先檢查前端圖文順序與清晰度。",
    18: "累積次數分配曲線題含圖與多敘述選項，建議確認題幹換行。",
    29: "班排身高題同時比較平均、中位數、標準差與機率，建議再看數學排版。",
    34: "這題原始抽取時題幹被切開，已重組；請再確認前端閱讀感受。",
    42: "調分題涉及平均與標準差聯動，建議看一次公式段落是否太擠。",
    45: "不同科目 z 分數比較是本章核心題型，請確認標準化公式顯示。",
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
        "〜": "~",
        "　": " ",
        "╳": "×",
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
    if len(value) <= 8:
        return True
    if value.endswith(("=", "＝", "：", "(", "（")):
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
        merged = "\n".join(part for part in [question, extra] if part).strip()
        return normalize_text(merged)
    if not question.endswith(("。", "？", "!", "﹒", "﹖")):
        return normalize_text("\n".join([question, extra]).strip())
    if question.endswith(("如圖", "如下", "則", "求", "問", "如下表", "如下圖")):
        return normalize_text("\n".join([question, extra]).strip())
    if len(question) < 30:
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
    if order <= 13:
        return "主題1：集中趨勢量數"
    if order <= 19:
        return "主題2：統計圖表判讀"
    if order <= 29:
        return "主題3：離散量數與分組資料"
    if order <= 42:
        return "主題4：平移縮放對統計量的影響"
    return "主題5：資料標準化與 z 分數"


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(order: int, title: str, question_text: str, explanation_text: str) -> str:
    text = f"{title}\n{question_text}\n{explanation_text}"

    if order in {45, 46, 47, 48} or has_any(text, ["哪一科表現較好", "就全班而言", "哪科表現較好", "比較", "高出1個標準差"]):
        return "senior-univariate-zscore-comparison-s231"
    if order in {17, 18} or has_any(text, ["直方圖", "累積次數分配曲線", "次數分配曲線", "圖表", "如圖"]):
        return "senior-statistical-charts-overview"
    if order in {29} or has_any(text, ["盒鬚圖", "Q1", "Q3", "四分位", "百分位"]):
        return "senior-percentile-quartile"
    if order in {30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42} or has_any(
        text,
        ["y = ", "Y = ", "調整", "每人加", "平移", "縮放", "ax + b", "原始分數", "調整後"],
    ):
        return "senior-univariate-linear-transform-effects-s231"
    if order in {43, 44} or has_any(text, ["標準化數據", "z =", "z分數"]):
        return "senior-standardization-zscore"
    if order in {24, 25, 26} or has_any(text, ["甲組學生30人", "乙組學生20人", "兩組", "合併", "甲班50位", "乙班40位"]):
        return "senior-univariate-grouped-data-mean-var-s231"
    if order in {14, 15, 16, 19, 20, 21, 22, 23, 27, 28} or has_any(
        text,
        ["標準差", "變異數", "全距", "分散程度", "離均差", "平均分數為51分", "標準差為"],
    ):
        return "senior-dispersion-measures"
    if order in {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13} or has_any(
        text,
        ["算術平均數", "幾何平均數", "加權平均數", "中位數", "眾數", "平均成長率"],
    ):
        return "senior-central-tendency-measures"
    return "s2-3-1-one-dimensional-data-core"


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
            "- 這章的 Word 主題標記不穩，已改用題型重建 `source_section`。",
            "- 圖表題、平移縮放題與 z 分數比較題已分開附掛，不混成同一支線。",
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
