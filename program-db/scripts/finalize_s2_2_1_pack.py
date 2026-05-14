import argparse
import json
import os
import re
import shutil
import stat
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


SOURCE_PACK = "_inspect-2-5"
SOURCE_DOC = "2-5轉.docx"
SOURCE_MD = "2-5轉.md"
CHAPTER_CODE = "s2-2-1"
CHAPTER_TITLE = "邏輯、集合與計數原理"

REVIEW_NOTES = {
    39: "分數型容斥題解析原始轉出有公式殘渣，這版已手修，建議匯入後再看一次。",
    45: "此題題幹在原始 Word 幾乎依附圖面，Pandoc 抽出不完整，建議優先人工確認。",
    49: "七堂課排課題解析主要靠題圖，建議前端確認圖片清晰度。",
    59: "五色塗色題題幹原始圖未完整抽出，建議匯入後核對圖文是否足夠作答。",
    61: "三色塗法題題幹同樣高度依賴圖面，建議前端檢查體驗。",
}

QUESTION_OVERRIDES = {
    10: {
        "question_text": (
            "設x是實數，則下列敘述何者是正確的？\n"
            "(A) x^2 = 9的否定敘述為x ≠ 3且x ≠ −3\n"
            "(B) |x| = −x的否定敘述為x > 0\n"
            "(C) |x| ≥ 1的否定敘述為|x| < 1\n"
            "(D) 0 < x < 1的否定敘述為x ≤ 0或x ≥ 1\n"
            "(E)「∃x ∈ ℝ使f(x) = 3」的否定敘述為「∀x ∈ ℝ使f(x) ≠ 3」。"
        )
    },
    39: {
        "explanation_text": (
            "【解析】設全部題數為x，則兩人做錯的總題數為"
            "$\\frac{x}{4}+9-\\frac{x}{6}=\\frac{x}{12}+9$。\n"
            "所以兩人同時做對的題數為"
            "$x-\\left(\\frac{x}{12}+9\\right)=\\frac{11}{12}x-9$。\n"
            "又因兩人同時做錯的題數為全部試題的$\\frac{1}{6}$，且乙共錯9題，"
            "可得$\\frac{x}{6} \\le 9$，所以$x \\le 54$；"
            "再因$\\frac{11}{12}x-9$須為正整數，故x只能是12的倍數。\n"
            "因此x = 12、24、36、48時，兩人同時做對的題數依序為2、13、24、35。"
        )
    },
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
        "\\[": "[",
        "\\]": "]",
        "\\lbrack": "[",
        "\\rbrack": "]",
        "\\mathbb{R}": "ℝ",
        "\\in": "∈",
        "\\cup": "∪",
        "\\cap": "∩",
        "\\subseteq": "⊆",
        "\\subset": "⊂",
        "\\supseteq": "⊇",
        "\\supset": "⊃",
        "\\varnothing": "∅",
        "\\emptyset": "∅",
        "\\|": "|",
        "{^\\circ}": "°",
        "^{。}": "°",
        "<sup>2</sup>": "^2",
        "<sup>3</sup>": "^3",
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
    value = value.replace("$\\overset{\\not{}}{<}$", "≮")
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
    seed = re.sub(r"\[圖:\s*[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ，。；：")
    if len(seed) > 30:
        seed = seed[:30].rstrip(" ，。；：")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def formula_id_for(order: int) -> str:
    if 1 <= order <= 7:
        return "senior-proposition-truth-table"
    if order == 8:
        return "senior-equivalence-and-negation-rules"
    if order == 9:
        return "senior-logic-condition-language-s221"
    if order == 10:
        return "senior-logic-contrapositive-quantifiers-s221"
    if order == 11:
        return "senior-logic-condition-language-s221"
    if order == 12:
        return "senior-logic-contrapositive-quantifiers-s221"
    if order == 13:
        return "senior-logic-condition-language-s221"
    if 14 <= order <= 20:
        return "senior-set-operations-and-laws"
    if 21 <= order <= 38:
        return "senior-set-operation-algebra-s221"
    if 39 <= order <= 40:
        return "senior-inclusion-exclusion-principle"
    if order == 41:
        return "senior-inclusion-exclusion-three-set-s221"
    if 42 <= order <= 58:
        return "senior-counting-principles-tree-merge-s221"
    if 59 <= order <= 65:
        return "senior-basic-counting-principles"
    if 66 <= order <= 69:
        return "senior-counting-complement-principle-s221"
    if 70 <= order <= 76:
        return "senior-basic-counting-principles"
    if 77 <= order <= 78:
        return "senior-inclusion-exclusion-principle"
    if order == 79:
        return "senior-inclusion-exclusion-three-set-s221"
    if 80 <= order <= 81:
        return "senior-counting-complement-principle-s221"
    if 82 <= order <= 84:
        return "senior-inclusion-exclusion-three-set-s221"
    return "s2-2-1-logic-set-counting-core"


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
            "- `wmf/emf` 圖片已轉成 `.png` sidecar 並更新引用。",
            "- 本章依網站現有 `s2-2-1` 主題樹做附掛，沒有硬拆成不存在的章節。",
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


def remove_tree(path: Path):
    def handle_remove_readonly(func, target, exc_info):
        os.chmod(target, stat.S_IWRITE)
        func(target)

    shutil.rmtree(path, onexc=handle_remove_readonly)


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
        order = int(raw.get("source_order") or index)
        marker = infer_marker(raw.get("question_category", ""), raw.get("title", ""))
        question_text = normalize_text(raw.get("question_text", ""))
        explanation_text = normalize_text(raw.get("explanation_text", ""))
        answer_text = normalize_text(raw.get("answer_text", ""))

        override = QUESTION_OVERRIDES.get(order, {})
        if "question_text" in override:
            question_text = normalize_text(override["question_text"])
        if "explanation_text" in override:
            explanation_text = normalize_text(override["explanation_text"])
        if "answer_text" in override:
            answer_text = normalize_text(override["answer_text"])

        title = rebuild_title(marker, question_text or raw.get("title", ""))
        formula_id = formula_id_for(order)
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
