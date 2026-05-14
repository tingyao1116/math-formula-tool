import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


SOURCE_PACK = "_inspect-2-6"
SOURCE_DOC = "2-6轉.docx"
SOURCE_MD = "2-6轉.md"
CHAPTER_CODE = "s2-2-2"
CHAPTER_TITLE = "排列組合"

REVIEW_NOTES = {
    15: "走法題通常高度依賴題圖，匯入後建議先看圖片與題幹是否對得上。",
    49: "重複字母排列題的原始解法較長，建議確認前端換行是否舒服。",
    61: "著色題依賴圖形本身，建議前端確認圖片清晰度。",
    68: "多圖著色題圖比較多，建議優先檢查圖文順序。",
    105: "三粒相同骰子題用到重複組合記號，建議確認顯示樣式。",
    119: "格線圖形計數題題幹有截斷風險，建議人工複核。",
    147: "展開式題屬組合與多項式交界題，建議再看一次公式顯示。",
    149: "一筆畫題幾乎完全依賴題圖，建議匯入後直接看前端體驗。",
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
        "\\lbrack": "[",
        "\\rbrack": "]",
        "\\mathbb{R}": "ℝ",
        "\\in": "∈",
        "\\times": "×",
        "\\cdot": "·",
        "\\cup": "∪",
        "\\cap": "∩",
        "\\subseteq": "⊆",
        "\\subset": "⊂",
        "\\supseteq": "⊇",
        "\\supset": "⊃",
        "\\varnothing": "∅",
        "\\emptyset": "∅",
        "\\therefore": "∴",
        "\\because": "∵",
        "\\rightarrow": "→",
        "\\Rightarrow": "⇒",
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


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(order: int, section: str, title: str, question_text: str) -> str:
    text = f"{title}\n{question_text}"

    if has_any(text, ["方程式x + y", "非負整數解", "正整數解", "自然數解", "每人至少一球", "可不全部分完", "H_", "球分給", "蘋果全部分給", "酒杯", "投票", "廢票"]):
        return "senior-combination-with-repetition-stars-bars-s222"
    if has_any(text, ["有6個球投入4個箱子", "球相同，箱子", "球不同，箱子", "箱子不同", "球盒"]):
        return "senior-balls-and-boxes-model-map-s222"
    if has_any(text, ["平分成三堆", "分成三組", "平分給甲、乙、丙", "分給A，B，C三人", "按4，3，2分成三堆", "平分給三人", "分組", "分堆"]):
        return "senior-group-vs-pile-distinction-s222"
    if has_any(text, ["玩具", "書，分給", "分給甲", "分給A，B，C，D", "渡船", "安插三個人", "乘坐A，B，C三車", "至少得一本", "甲得2件"]):
        return "senior-distribution-grouping-models"
    if has_any(text, ["同字母", "重排", "庭院深深深幾許", "tennessee", "ACCESS", "aabbcc", "pallmall", "missippi", "mississippi", "同字不相鄰"]):
        return "senior-multiset-permutation"
    if has_any(text, ["不相鄰", "完全不相鄰", "不完全相鄰", "相鄰", "排奇數位", "空位", "間隔"]):
        return "senior-permutation-gap-method-s222"
    if has_any(text, ["翻轉", "正方體", "正四面體", "長方體", "塗法", "著色法", "各面均異色", "旗桿上"]):
        return "senior-circular-permutation-s222"
    if has_any(text, ["頂點", "三角形", "直線", "平面", "鈍角三角形", "銳角三角形", "正方形", "向量", "歪斜線", "一筆畫", "捷徑", "走法", "矩形"]):
        return "senior-geometry-counting-template-s222"
    if has_any(text, ["(x + y + z + t)^10", "(a + b + c + d)^6", "展開式", "同型項", "係數"]):
        return "senior-combination-and-properties"
    if has_any(text, ["C_", "C_{", "選修", "任取", "恰有一對夫婦", "和為奇數", "積為3的倍數", "3的倍數", "選法"]):
        return "senior-combination-and-properties"
    if has_any(text, ["a_1", "b_1", "甲須排在乙", "甲須排在乙、丙、丁之左", "不與丁相鄰", "至少一個為偶數", "(1 − b_1)", "(5 − b_3)"]):
        return "senior-derangement-inclusion-exclusion-form-s222"
    if has_any(text, ["四位數", "三位數", "數字可重複", "重複選取", "作成四位數", "作三位數", "樓梯有12階", "長音", "短音", "旗子", "信號"]):
        return "senior-repeated-permutation-mnk"
    if has_any(text, ["P_", "P_{", "排成一列", "排列", "7人排成一列", "十個座位"]):
        return "senior-factorial-permutation-basics"
    if section == "主題1：加法原理與乘法原理":
        if has_any(text, ["球", "硬幣", "砝碼"]):
            return "senior-balls-and-boxes-model-map-s222"
        if has_any(text, ["走法", "捷徑", "路線", "一筆畫"]):
            return "senior-bijection-counting-tricks"
        return "senior-factorial-permutation-basics"
    if section == "主題2：排列":
        return "senior-factorial-permutation-basics"
    if section == "主題3：組合":
        return "senior-combination-and-properties"
    return "s2-2-2-permutation-combination-core"


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
            "- 本章依網站現有 `s2-2-2` 主題樹附掛，沒有硬拆到其他章節。",
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
        formula_id = formula_id_for(
            int(raw.get("source_order") or index),
            raw.get("source_section", ""),
            title,
            question_text,
        )
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
