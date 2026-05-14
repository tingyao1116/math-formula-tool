import json
import re
import shutil
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title, cleanup_import_artifacts


BASE_DIR = Path(__file__).resolve().parents[2]
PACKS_DIR = BASE_DIR / "program-db" / "imports" / "packs"
SOURCE_PACK = "_inspect-4A-11"
SOURCE_DOC = "4A-11轉.docx"
SOURCE_MD = "4A-11轉.md"

PACK_A = "s4-3-1"
PACK_B = "s4-3-2"

TITLE_A = "條件機率與貝氏定理"
TITLE_B = "獨立事件與乘法法則"

EXPLANATION_RE = re.compile(r"【解析】|【解答】|解析：|解答：")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
EMPTY_UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]*\]\{\.underline\}")
TEXT_UNDERLINE_RE = re.compile(r"\[([^\]]+)\]\{\.underline\}")
TRAILING_TOPIC_NOTES_RE = re.compile(r"\n\+[:\-]{10,}.*$", re.S)
RAW_MEDIA_RE = re.compile(
    r"\(?\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-4A-11[\\/]+assets[\\/]+media[\\/][^)\]\s]+(?:\.(?:png|jpg|jpeg|emf|wmf))\)?",
    re.I,
)
TABLE_LINE_RE = re.compile(r"^[+\-|]{3,}$")
EDITORIAL_RE = re.compile(r"【(?:康熹|龍騰)自命題】|【教冊題】")
VECTOR_EXT_RE = re.compile(r"(?i)\.(emf|wmf)$")


TOPIC_RANGES = {
    "主題1：條件機率": range(1, 27),
    "主題2：貝氏定理": range(27, 45),
    "主題3：獨立事件": range(45, 68),
}


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def asset_marker_path(target_pack: str, raw_path: str) -> str:
    name = Path(str(raw_path or "").replace("\\", "/")).name
    if not name:
        return ""
    if VECTOR_EXT_RE.search(name):
        name = f"{name}.png"
    return f"program-db/imports/packs/{target_pack}/assets/media/{name}"


def replace_inline_images(text: str, target_pack: str) -> str:
    value = str(text or "")

    def repl_html(match: re.Match[str]) -> str:
        path = asset_marker_path(target_pack, match.group(1))
        return f"\n[圖:{path}]\n" if path else ""

    def repl_md(match: re.Match[str]) -> str:
        alt = cleanup_import_artifacts(match.group(1)).strip()
        path = asset_marker_path(target_pack, match.group(2))
        parts: list[str] = []
        if alt and (re.search(r"[\u4e00-\u9fff]", alt) or any(tok in alt for tok in ("=", r"\frac", r"\sqrt"))):
            parts.append(alt)
        if path:
            parts.append(f"[圖:{path}]")
        return "\n".join(parts)

    value = HTML_IMAGE_RE.sub(repl_html, value)
    value = INLINE_IMAGE_RE.sub(repl_md, value)
    return value


def split_question_and_explanation(question_text: str, explanation_text: str) -> tuple[str, str]:
    merged = "\n".join(part for part in [question_text or "", explanation_text or ""] if part)
    match = EXPLANATION_RE.search(merged)
    if not match:
        return question_text or "", explanation_text or ""
    return merged[: match.start()], merged[match.end() :]


def normalize_text(text: str, target_pack: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value, target_pack)
    value = IMAGE_ATTR_RE.sub("", value)
    value = EMPTY_UNDERLINE_RE.sub("＿＿＿＿", value)
    value = TEXT_UNDERLINE_RE.sub(r"\1", value)
    value = TRAILING_TOPIC_NOTES_RE.sub("", value)
    value = RAW_MEDIA_RE.sub("", value)
    value = EDITORIAL_RE.sub("", value)
    value = value.replace("`", "")
    lines: list[str] = []
    for raw in value.split("\n"):
        line = raw.strip()
        if not line or TABLE_LINE_RE.fullmatch(line):
            continue
        line = line.strip("|").strip()
        if not line:
            continue
        lines.append(line)
    value = "\n".join(lines)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = cleanup_import_artifacts(value)
    value = clean_question_body(value)
    return re.sub(r"\n{3,}", "\n\n", value).strip()


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。；、")
    if len(seed) > 36:
        seed = seed[:36].rstrip(" ：，。；、")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def category_from_marker(title: str) -> str:
    return "基本" if title.startswith("範例") else "重要"


def topic_for_order(order: int) -> str:
    for topic, rng in TOPIC_RANGES.items():
        if order in rng:
            return topic
    raise KeyError(order)


def formula_id_for_s431(text: str, source_order: int) -> str:
    merged = text
    if any(keyword in merged for keyword in ("工廠", "機器", "袋", "箱", "路線", "燈泡", "類組", "競試", "射擊", "學生", "投保")):
        return "senior-bayes-total-probability-s431" if source_order >= 27 else "senior-conditional-probability-main-s431"
    if any(keyword in merged for keyword in ("X光", "檢驗", "檢測", "陽性", "陰性", "口蹄疫", "DEHP", "癌症", "結核病")):
        return "senior-bayes-medical-testing-template-s431"
    if any(keyword in merged for keyword in ("樹狀", "列聯", "表格")):
        return "senior-conditional-probability-tree-table-s431"
    if source_order >= 27:
        return "senior-bayes-total-probability-s431"
    return "senior-conditional-probability-main-s431"


def copy_support_files(target_pack: str):
    source_root = PACKS_DIR / SOURCE_PACK
    target_root = PACKS_DIR / target_pack
    ensure_dir(target_root / "source")
    ensure_dir(target_root / "extracted")
    ensure_dir(target_root / "assets" / "media")
    shutil.copy2(source_root / "source" / SOURCE_DOC, target_root / "source" / SOURCE_DOC)
    shutil.copy2(source_root / "extracted" / SOURCE_MD, target_root / "extracted" / SOURCE_MD)
    for file in sorted((source_root / "assets" / "media").iterdir()):
        if file.is_file():
            shutil.copy2(file, target_root / "assets" / "media" / file.name)
    ensure_png_sidecars(target_root / "assets" / "media")


def ensure_png_sidecars(asset_dir: Path):
    for file in sorted(asset_dir.iterdir()):
        if file.suffix.lower() not in {".wmf", ".emf"}:
            continue
        png_path = Path(f"{file}.png")
        if png_path.exists():
            continue
        with Image.open(file) as image:
            image.save(png_path, format="PNG")


def build_preview(records: list[dict], chapter_code: str) -> dict:
    by_section: dict[str, list[dict]] = {}
    for row in records:
        section = row.get("source_section") or "未分類"
        by_section.setdefault(section, []).append(
            {
                "id": row["id"],
                "title": row["title"],
                "question_category": row["question_category"],
                "difficulty": row["difficulty"],
                "formula_id": row["formula_id"],
            }
        )
    return {
        "meta": {
            "chapter_code": chapter_code,
            "source_ref": f"source/{SOURCE_DOC}",
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(Counter(row["question_category"] for row in records)),
        "by_section": by_section,
    }


def build_manifest(chapter_code: str, chapter_title: str) -> dict:
    return {
        "chapter_code": chapter_code,
        "chapter_title": chapter_title,
        "source_files": [{"path": f"source/{SOURCE_DOC}", "role": "primary_docx"}],
        "extracted_files": [
            {"path": f"extracted/{SOURCE_MD}", "role": "pandoc_markdown"},
            {"path": "questions.json", "role": "question_pack"},
            {"path": "preview.json", "role": "assignment_preview"},
            {"path": "review-needed.md", "role": "manual_review_notes"},
        ],
        "asset_roots": [{"path": "assets/media", "role": "pandoc_extracted_media"}],
        "status": "review_ready",
        "updated_at": datetime.now().astimezone().isoformat(),
    }


def build_records(source_rows: list[dict], target_pack: str) -> list[dict]:
    rows: list[dict] = []
    if target_pack == PACK_A:
        selected = [row for row in source_rows if row["source_order"] <= 44]
    else:
        selected = [row for row in source_rows if row["source_order"] >= 45]
    for index, row in enumerate(selected, start=1):
        topic = topic_for_order(int(row["source_order"]))
        question_text, explanation_text = split_question_and_explanation(row.get("question_text", ""), row.get("explanation_text", ""))
        question_text = normalize_text(question_text, target_pack)
        explanation_text = normalize_text(explanation_text, target_pack)
        title_seed = row.get("title", "")
        marker = "範例" if "範例" in title_seed else "隨堂練習"
        formula_id = (
            formula_id_for_s431("\n".join([title_seed, question_text, explanation_text]), int(row["source_order"]))
            if target_pack == PACK_A
            else "s4-3-2-independent-events-core"
        )
        rows.append(
            {
                "id": f"q-{target_pack}-{index:04d}",
                "title": rebuild_title(marker, question_text),
                "question_text": question_text,
                "answer_text": "",
                "explanation_text": explanation_text,
                "chapter_code": target_pack,
                "formula_id": formula_id,
                "difficulty": "易" if marker == "範例" else "中",
                "question_category": category_from_marker(marker),
                "source_type": "docx_pack_markdown",
                "source_ref": f"source/{SOURCE_DOC}",
                "source_section": topic,
                "source_order": index,
                "tags": [target_pack, f"section:{topic}", f"marker:{marker}", "source:4A-11轉.docx"],
            }
        )
    return rows


def write_review(path: Path, chapter_code: str, records: list[dict], extra: list[str]):
    lines = [f"# {chapter_code} review notes", ""]
    lines.append(f"- 目前共 {len(records)} 題。")
    for section, count in Counter(row["source_section"] for row in records).items():
        lines.append(f"- `{section}`：{count} 題")
    lines.extend(["", *extra, ""])
    path.write_text("\n".join(lines), encoding="utf-8")


def write_pack(target_pack: str, title: str, rows: list[dict], extra_review: list[str]):
    root = PACKS_DIR / target_pack
    copy_support_files(target_pack)
    write_json(root / "questions.json", {"chapter_code": target_pack, "chapter_title": title, "questions": rows})
    write_json(root / "preview.json", build_preview(rows, target_pack))
    write_json(root / "manifest.json", build_manifest(target_pack, title))
    write_review(root / "review-needed.md", target_pack, rows, extra_review)


def main():
    source_rows = read_json(PACKS_DIR / SOURCE_PACK / "questions.json")["questions"]
    if len(source_rows) != 67:
        raise RuntimeError(f"Unexpected source row count: {len(source_rows)}")

    s431_rows = build_records(source_rows, PACK_A)
    s432_rows = build_records(source_rows, PACK_B)

    write_pack(
        PACK_A,
        TITLE_A,
        s431_rows,
        [
            "- `主題1：條件機率` 與 `主題2：貝氏定理` 已合併到 `s4-3-1`。",
            "- 醫療檢測 / 陽性陰性類題優先掛到 `senior-bayes-medical-testing-template-s431`。",
            "- 其餘貝氏反推題多掛到 `senior-bayes-total-probability-s431`。",
        ],
    )
    write_pack(
        PACK_B,
        TITLE_B,
        s432_rows,
        [
            "- `主題3：獨立事件` 已拆成 `s4-3-2`。",
            "- 目前網站 `s4-3-2` 只有核心主題，因此這 23 題先統一掛在 `s4-3-2-independent-events-core`。",
        ],
    )
    print(f"{PACK_A}={len(s431_rows)}")
    print(f"{PACK_B}={len(s432_rows)}")


if __name__ == "__main__":
    main()
