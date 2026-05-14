import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


SOURCE_PACK = "_inspect-2-8"
SOURCE_DOC = "2-8轉.docx"
SOURCE_MD = "2-8轉.md"
CHAPTER_CODE = "s2-2-4"
CHAPTER_TITLE = "古典機率"

REVIEW_NOTES = {
    32: "第 3 次抽到紅球這題屬於位置不變性，建議在前端再看一次題幹與解析的行距。",
    39: "兩箱換球是遞迴型機率題，請確認分點與公式換行是否好讀。",
    44: "大富翁回到起點這題仰賴計數模型，建議檢查公式顯示與選項斷行。",
    57: "撲克牌 Full house / Two pairs 英文術語有保留，建議確認前端混排效果。",
    63: "直線與圓不相交的幾何機率題公式較密，建議檢查數學渲染。",
    64: "圍棋盤與鈕釦題高度依賴情境，建議看前端版面是否容易讀。",
    65: "三層三角塔題依賴附圖，請確認圖片清晰度與題幹間距。",
    66: "青蛙跳石頭題是遞迴機率，建議再看一次長題幹在前端的閱讀感受。",
}

MATH_BACKTICK_RE = re.compile(r"\$`(.*?)`\$", re.S)
INLINE_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
MATH_FENCE_RE = re.compile(r"```(?:\s*math)?\s*(.*?)```", re.S)
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
TEXT_WRAPPER_RE = re.compile(r"\\text\{([^}]*)\}")
GENERIC_IMAGE_RE = re.compile(r"\[圖:\s*([^\]]+)\]")
LEADING_TEST_NUMBER_RE = re.compile(r"^[（(]\s*[）)]\s*\d+[.．]\s*")
SOURCE_LINE_RE = re.compile(
    r"(?m)^【[^】]*(?:自命題|期中考|期末考|段考|模擬考|試題|學測|指考)[^】]*】\s*$"
)


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


def strip_source_noise(value: str) -> str:
    value = SOURCE_LINE_RE.sub("", value)
    value = re.sub(r"^【解析】\s*", "", value)
    value = re.sub(r"^【解答】\s*", "", value)
    value = re.sub(r"^【證明】\s*", "", value)
    value = LEADING_TEST_NUMBER_RE.sub("", value)
    value = re.sub(r"^[.、]\s*", "", value)
    return value


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = HTML_COMMENT_RE.sub("", value)
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
        "\\leq": "\\le",
        "\\geq": "\\ge",
        "\\left(": "(",
        "\\right)": ")",
        "\\left[": "[",
        "\\right]": "]",
        "\\left\\{": "{",
        "\\right\\}": "}",
        "\\varnothing": "∅",
        "\\emptyset": "∅",
        "\\|": "|",
        "φ": "∅",
        "A": "A′",
        "B": "B′",
        "C": "C′",
        "﹐": "，",
        "﹒": "。",
        "﹖": "？",
        "﹕": "：",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = re.sub(r"\$?x\\mathbb\{\\in N\}\$?", r"x \\in \\mathbb{N}", value)
    value = re.sub(r"\$?y\\in\\mathbb\{N\}\$?", r"y \\in \\mathbb{N}", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = strip_source_noise(value.strip())
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


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


def has_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def formula_id_for(order: int, section: str, title: str, question_text: str, explanation_text: str) -> str:
    text = f"{section}\n{title}\n{question_text}\n{explanation_text}"

    if section == "主題1：樣本空間":
        return "senior-sample-space-events-s224"

    if section == "主題2：事件":
        if order >= 21 or has_any(text, ["考國文", "考數學", "考英文", "三科", "50人", "沒有參加考試"]):
            return "senior-probability-properties-addition-s224"
        return "senior-probability-event-operations-s224"

    if has_any(text, ["期望值", "公平遊戲"]):
        return "senior-probability-expected-value-fair-game-s224"

    if has_any(text, ["第3次取到", "第二次取到紅球", "第三次取到白球", "第二次取到的是白球"]):
        return "senior-probability-kth-draw-invariance-s224"

    if has_any(text, ["至少有一", "至少一件", "至少一黑桃", "至少出現二次"]):
        return "senior-probability-at-least-one-template-s224"

    if has_any(text, ["獨立事件", "P(A ∩ B) = P(A)P(B)", "P(B′ | A′)", "取後放回，再取一球", "兩球都是紅球"]):
        return "senior-probability-complement-multiplication-s224"

    if order in {23, 24, 25, 26, 34, 35, 53}:
        return "senior-equiprobable-counting-s224"

    if order in {28, 29, 31}:
        return "senior-probability-properties-addition-s224"

    if order == 30:
        return "senior-probability-complement-multiplication-s224"

    if order in {32, 36, 38, 41}:
        return "senior-probability-kth-draw-invariance-s224"

    if order in {27, 33, 37, 40, 42, 43, 44, 46, 47, 48, 49, 50, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65}:
        return "senior-probability-counting-template-s224"

    if order in {39, 45, 51, 52, 66}:
        return "s2-2-4-classical-probability-core"

    return "s2-2-4-classical-probability-core"


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
            "- 這章採章節客製化附掛，樣本空間、事件運算、加法公式、等可能模型、至少一個事件、位置不變性都有分開處理。",
            "- `wmf/emf` 已補成對應的 `.png` sidecar，供前端顯示。",
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
        section = raw.get("source_section") or "未分類"
        formula_id = formula_id_for(
            int(raw.get("source_order") or index),
            section,
            title,
            question_text,
            explanation_text,
        )
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
