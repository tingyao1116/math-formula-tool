import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


SOURCE_PACK = "_inspect-2-4"
SOURCE_DOC = "2-4轉.docx"
SOURCE_MD = "2-4轉.md"

PACK_CONFIGS = {
    "s2-4-2": {
        "chapter_title": "正弦定理與餘弦定理",
        "source_orders": set(range(1, 73)),
        "review_notes": {
            5: "海龍公式題常含較長推導，匯入後建議確認換行。",
            22: "SSA 判斷題型較依賴選項排版，建議前端看一次。",
            43: "梯形與圓內接四邊形綜合題圖文較密，建議確認圖片位置。",
            61: "分角線題屬長題幹題型，建議先看題幹是否有被截斷。",
            69: "三中線面積題如果前端字級偏大，算式可能較擠。",
        },
    },
    "s2-4-3": {
        "chapter_title": "三角測量與面積公式",
        "source_orders": set(range(73, 122)),
        "review_notes": {
            73: "竹竿靠牆題是三角測量起始題，建議先看圖文銜接。",
            83: "塔與旗竿題通常帶多段幾何關係，建議確認公式換行。",
            92: "方位角題的方向敘述較長，建議在前端核對閱讀節奏。",
            104: "河寬量測題高度依賴題圖，建議確認圖片清晰度。",
            119: "燈塔與航向題是後段綜合題，建議優先看版面。",
        },
    },
}


FORMULA_BY_ORDER_S242 = {}
for order in range(1, 5):
    FORMULA_BY_ORDER_S242[order] = "senior-triangle-area-formulas-extended"
for order in range(5, 7):
    FORMULA_BY_ORDER_S242[order] = "senior-heron-proof-and-usage"
for order in range(7, 10):
    FORMULA_BY_ORDER_S242[order] = "senior-triangle-area-formulas-extended"
for order in range(10, 22):
    FORMULA_BY_ORDER_S242[order] = "senior-law-of-sines-forms"
for order in range(22, 25):
    FORMULA_BY_ORDER_S242[order] = "senior-ssa-ambiguous-case"
for order in range(25, 32):
    FORMULA_BY_ORDER_S242[order] = "senior-triangle-radius-area-relations-s242"
for order in range(32, 56):
    FORMULA_BY_ORDER_S242[order] = "senior-law-of-cosines-forms"
for order in range(56, 61):
    FORMULA_BY_ORDER_S242[order] = "senior-sine-cosine-law-selection-s242"
FORMULA_BY_ORDER_S242[61] = "senior-median-anglebisector-length"
for order in range(62, 65):
    FORMULA_BY_ORDER_S242[order] = "senior-sine-cosine-law-selection-s242"
FORMULA_BY_ORDER_S242[65] = "senior-law-of-cosines-forms"
FORMULA_BY_ORDER_S242[66] = "senior-sine-cosine-law-selection-s242"
FORMULA_BY_ORDER_S242[67] = "senior-triangle-radius-area-relations-s242"
FORMULA_BY_ORDER_S242[68] = "senior-triangle-radius-area-relations-s242"
FORMULA_BY_ORDER_S242[69] = "senior-median-anglebisector-length"
FORMULA_BY_ORDER_S242[70] = "senior-triangle-radius-area-relations-s242"
FORMULA_BY_ORDER_S242[71] = "senior-median-anglebisector-length"
FORMULA_BY_ORDER_S242[72] = "senior-median-anglebisector-length"


QUESTION_OVERRIDES = {
    ("s2-4-3", 73): "將一長為 5 公尺之竹竿，斜靠在垂直地面而高為 3 公尺的牆頭，求竹竿與地面的夾角。",
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


def normalize_asset_path(raw: str, chapter_code: str) -> str:
    text = str(raw or "").strip().replace("\\", "/")
    if not text:
        return ""
    if text.startswith("./"):
        text = text[2:]
    marker = text.lower().find("program-db/")
    if marker >= 0:
        text = text[marker:]
    text = text.replace(f"/{SOURCE_PACK}/", f"/{chapter_code}/")
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


def replace_inline_images(text: str, chapter_code: str) -> str:
    value = str(text or "")

    def repl(match: re.Match[str]) -> str:
        normalized = normalize_asset_path(match.group(1), chapter_code)
        return f"\n[圖: {normalized}]\n" if normalized else ""

    value = HTML_IMAGE_RE.sub(repl, value)
    value = INLINE_IMAGE_RE.sub(repl, value)
    value = GENERIC_IMAGE_RE.sub(lambda m: f"[圖: {normalize_asset_path(m.group(1), chapter_code)}]", value)
    return value


def normalize_text(text: str, chapter_code: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value, chapter_code)
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
        "\\[": "[",
        "\\]": "]",
        "\\langle": "〈",
        "\\rangle": "〉",
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
    if len(seed) > 28:
        seed = seed[:28].rstrip(" ，。；：")
    return f"{marker}：{seed}" if seed else marker


def build_preview(records: list[dict], chapter_code: str) -> dict:
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
            "chapter_code": chapter_code,
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(Counter(record["question_category"] for record in records)),
        "by_section": by_section,
    }


def build_manifest(chapter_code: str, chapter_title: str) -> dict:
    return {
        "chapter_code": chapter_code,
        "chapter_title": chapter_title,
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


def build_review(chapter_code: str, records: list[dict], review_notes: dict[int, str]) -> str:
    lines = [
        f"# {chapter_code} Review Needed",
        "",
        "## Current extraction status",
        "",
        f"- Parsed question records: {len(records)}",
        f"- Assigned `formula_id`: {sum(1 for row in records if row.get('formula_id'))}",
        f"- Needs manual review: {len(review_notes)}",
        "",
        "## Manual review items",
        "",
    ]
    local_index = {row["source_order"]: row["id"] for row in records}
    for order, note in review_notes.items():
        qid = local_index.get(order, f"source-order-{order}")
        lines.append(f"- `{qid}`")
        lines.append(f"  - {note}")
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已保留。",
            "- `wmf/emf` 圖片已轉成 `.png` sidecar 並更新引用。",
            "- `2-4轉.docx` 依目前網站架構拆成兩包：`s2-4-2` 與 `s2-4-3`。",
        ]
    )
    return "\n".join(lines) + "\n"


def formula_id_for(chapter_code: str, source_order: int) -> str:
    if chapter_code == "s2-4-2":
        return FORMULA_BY_ORDER_S242.get(source_order, "s2-4-2-sine-cosine-law-core")
    return "s2-4-3-triangle-measurement-core"


def copy_support_files(base_dir: Path, chapter_code: str):
    source_root = base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK
    target_root = base_dir / "program-db" / "imports" / "packs" / chapter_code
    (target_root / "source").mkdir(parents=True, exist_ok=True)
    (target_root / "extracted").mkdir(parents=True, exist_ok=True)
    (target_root / "assets" / "media").mkdir(parents=True, exist_ok=True)

    shutil.copy2(source_root / "source" / SOURCE_DOC, target_root / "source" / SOURCE_DOC)
    shutil.copy2(source_root / "extracted" / SOURCE_MD, target_root / "extracted" / SOURCE_MD)

    for path in (source_root / "assets" / "media").iterdir():
        if path.is_file():
            shutil.copy2(path, target_root / "assets" / "media" / path.name)


def build_pack(base_dir: Path, source_records: list[dict], chapter_code: str, config: dict):
    pack_root = base_dir / "program-db" / "imports" / "packs" / chapter_code
    copy_support_files(base_dir, chapter_code)
    asset_dir = pack_root / "assets" / "media"
    png_created = ensure_png_sidecars(asset_dir)

    selected = [row for row in source_records if row.get("source_order") in config["source_orders"]]
    records = []
    for local_index, row in enumerate(selected, start=1):
        cloned = dict(row)
        source_order = int(cloned["source_order"])
        cloned["id"] = f"q-{chapter_code}-{local_index:04d}"
        cloned["chapter_code"] = chapter_code
        override_key = (chapter_code, source_order)
        if override_key in QUESTION_OVERRIDES:
            cloned["question_text"] = QUESTION_OVERRIDES[override_key]
        cloned["question_text"] = normalize_text(cloned.get("question_text", ""), chapter_code)
        cloned["explanation_text"] = normalize_text(cloned.get("explanation_text", ""), chapter_code)
        cloned["answer_text"] = normalize_text(cloned.get("answer_text", ""), chapter_code)
        cloned["formula_id"] = formula_id_for(chapter_code, source_order)
        marker = infer_marker(cloned.get("question_category", ""), cloned.get("title", ""))
        cloned["title"] = clean_question_title(rebuild_title(marker, cloned["question_text"]))
        tags = [tag for tag in cloned.get("tags", []) if tag != "needs-formula-id"]
        cloned["tags"] = [chapter_code] + [tag for tag in tags if not str(tag).startswith("s2-4-")]
        records.append(cloned)

    payload = {
        "meta": {"chapter_code": chapter_code},
        "summary": {
            "count": len(records),
            "sections": dict(Counter(row.get("source_section", "") for row in records)),
            "image_references": sorted(
                {
                    match
                    for row in records
                    for field in ("question_text", "explanation_text")
                    for match in re.findall(r"\[圖:\s*([^\]]+)\]", row.get(field, ""))
                }
            ),
        },
        "questions": records,
    }

    write_json(pack_root / "questions.json", payload)
    write_json(pack_root / "preview.json", build_preview(records, chapter_code))
    write_json(pack_root / "manifest.json", build_manifest(chapter_code, config["chapter_title"]))
    (pack_root / "review-needed.md").write_text(
        build_review(chapter_code, records, config["review_notes"]),
        encoding="utf-8",
    )
    return len(records), png_created


def main():
    parser = argparse.ArgumentParser(description="Split and finalize 2-4 unit packs.")
    parser.add_argument("--base-dir", default=".")
    args = parser.parse_args()

    base_dir = Path(args.base_dir).resolve()
    source_payload = read_json(base_dir / "program-db" / "imports" / "packs" / SOURCE_PACK / "questions.json")
    source_records = source_payload.get("questions", [])

    for chapter_code, config in PACK_CONFIGS.items():
        count, png_created = build_pack(base_dir, source_records, chapter_code, config)
        print(f"{chapter_code}: questions={count}, png_sidecars_created={png_created}")


if __name__ == "__main__":
    main()
