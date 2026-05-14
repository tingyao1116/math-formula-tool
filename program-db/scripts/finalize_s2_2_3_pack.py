import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


SOURCE_PACK = "_inspect-2-7"
SOURCE_DOC = "2-7轉.docx"
SOURCE_MD = "2-7轉.md"
CHAPTER_CODE = "s2-2-3"
CHAPTER_TITLE = "二項式定理"

REVIEW_NOTES = {
    15: "和式展開題跨多層括號，建議匯入後先看公式換行。",
    24: "高次式除以 (x-1)^3 的餘式題常受數學渲染影響，建議前端確認。",
    34: "原稿在這題前混入題圖殘渣，這版已清理，但建議再檢查一次題幹。",
    41: "交錯和題若前端字型較擠，指數與上下標可再檢一次。",
    45: "平方和恆等式證明題公式較長，建議優先確認版面。",
    46: "雙邊不等式證明題完全靠公式閱讀，建議前端檢查體驗。",
}

MATH_BACKTICK_RE = re.compile(r"\$`(.*?)`\$", re.S)
INLINE_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
GENERIC_IMAGE_RE = re.compile(r"\[圖:\s*([^\]]+)\]", re.I)
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
MATH_FENCE_RE = re.compile(r"```(?:\s*math)?\s*(.*?)```", re.S)
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
TEXT_WRAPPER_RE = re.compile(r"\\text\{([^}]*)\}")


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
        text = VECTOR_PATH_RE.sub(lambda m: f"{m.group(0)}.png", text)
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
    value = GENERIC_IMAGE_RE.sub(lambda m: f"[圖: {normalize_asset_path(m.group(1))}]", value)
    return value


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = HTML_COMMENT_RE.sub("", value)
    value = value.replace("【龍騰自命題】", "")
    value = MATH_BACKTICK_RE.sub(lambda m: f"${m.group(1).strip()}$", value)
    value = MATH_FENCE_RE.sub(lambda m: m.group(1).strip(), value)
    value = TEXT_WRAPPER_RE.sub(lambda m: m.group(1), value)
    value = value.replace("`", "")
    value = value.replace("<br />", "\n").replace("<br/>", "\n")
    replacements = {
        "\\mspace{6mu}": " ",
        "\\cdots": "⋯",
        "\\leq": "\\le",
        "\\geq": "\\ge",
        "\\ne": "≠",
        "\\Rightarrow": "⇒",
        "\\left(": "(",
        "\\right)": ")",
        "\\left[": "[",
        "\\right]": "]",
        "\\left\\{": "{",
        "\\right\\}": "}",
        "\\lbrack": "[",
        "\\rbrack": "]",
        "\\mathbb{R}": "ℝ",
        "\\in": "∈",
        "\\times": "×",
        "\\cdot": "·",
        "\\therefore": "∴",
        "\\because": "∵",
        "\\rightarrow": "→",
        "\\sum": "∑",
        "\\frac": "\\frac",
        "\\|": "|",
        "{^\\circ}": "°",
        "^{。}": "°",
        "＋": "+",
        "－": "-",
        "＝": "=",
        "．": "·",
        "﹐": "，",
        "﹒": "。",
        "⇨": "⇒",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = re.sub(r"\[圖:\s*[^\]]+\]\s*N且", "n∈N且", value)
    value = value.replace("nn∈N且", "n∈N且")
    value = re.sub(r"\[圖:\s*[^\]]+\]", "", value)
    value = re.sub(r"(?m)^>\s*", "", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def infer_marker(category: str, title: str) -> str:
    if title.startswith("範例"):
        return title.split("：", 1)[0]
    if title.startswith("隨堂練習"):
        return "隨堂練習"
    return "範例" if category == "基本" else "隨堂練習"


def rebuild_title(marker: str, question_text: str) -> str:
    seed = question_text.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ，。；：")
    if len(seed) > 30:
        seed = seed[:30].rstrip(" ，。；：")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def formula_id_for(order: int, title: str, question_text: str) -> str:
    text = f"{title}\n{question_text}"
    if order <= 4:
        return "senior-binomial-theorem-main-s223"
    if 5 <= order <= 10:
        return "senior-binomial-specific-term-s223"
    if 11 <= order <= 14:
        return "senior-binomial-numeric-substitution-s223"
    if 15 <= order <= 19:
        return "senior-binomial-rising-falling-s223"
    if 20 <= order <= 25:
        return "senior-binomial-numeric-substitution-s223"
    if 26 <= order <= 28:
        return "senior-binomial-coefficient-properties-s223"
    if 29 <= order <= 31:
        return "senior-binomial-term-finding-techniques-s223"
    if 32 <= order <= 40:
        if any(key in text for key in ["1/2", "\\frac{1}{2}", "11264", "127", "1000 <", "2000 <", "1 −", "1-", "最小正整數n"]):
            return "senior-binomial-sum-identities-s223"
        return "senior-binomial-numeric-substitution-s223"
    if order == 41:
        return "senior-binomial-complex-substitution-cycle-s223"
    if 42 <= order <= 46:
        return "senior-binomial-vandermonde-identity-s223"
    return "s2-2-3-binomial-theorem-core"


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
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已保留。",
            "- 本章以二項式定理題型做細分附掛，不只掛章節核心。",
            "- `wmf/emf` 圖片已轉成 `.png` sidecar 並更新引用。",
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
        question_text = normalize_text(raw.get("question_text", ""))
        explanation_text = normalize_text(raw.get("explanation_text", ""))
        answer_text = normalize_text(raw.get("answer_text", ""))
        title = rebuild_title(marker, question_text or raw.get("title", ""))
        formula_id = formula_id_for(int(raw.get("source_order") or index), title, question_text)
        tags = [
            CHAPTER_CODE,
            f"section:{raw.get('source_section') or '未分類'}",
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
