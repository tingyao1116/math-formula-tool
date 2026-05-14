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
INSPECT_PACK = PACKS_DIR / "_inspect-4A-9"
SOURCE_DOC = "4A-9轉.docx"
SOURCE_MD = "4A-9轉.md"

MERGE_PACK = "s4-4-2"
NEW_PACK = "s4-4-3"
MERGE_CHAPTER_TITLE = "矩陣運算與逆矩陣"
NEW_CHAPTER_TITLE = "變換矩陣的應用"
MERGE_ASSET_PREFIX = "4A-9_"

TOPIC_RE = re.compile(r"主題\s*(\d+)\s*[:：]\s*(.+)")
MARKER_RE = re.compile(r"^(範例\s*\d+|隨堂練習)\s*$")
EXPLANATION_RE = re.compile(r"【解析】|【解答】|解析：|解答：")
INLINE_IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
IMAGE_ATTR_RE = re.compile(r"\{[^{}]*?(?:width|height|alt)=\"[^\"]*\"[^{}]*\}")
EMPTY_UNDERLINE_RE = re.compile(r"\[\s*[\u3000 ]*\]\{\.underline\}")
TEXT_UNDERLINE_RE = re.compile(r"\[([^\]]+)\]\{\.underline\}")
RAW_MEDIA_RE = re.compile(
    r"\(?\.?[\\/]+program-db[\\/]+imports[\\/]+packs[\\/]+_inspect-4A-9[\\/]+assets[\\/]+media[\\/][^)\]\s]+(?:\.(?:png|jpg|jpeg|emf|wmf))\)?",
    re.I,
)
EDITORIAL_RE = re.compile(r"【(?:康熹|龍騰)自命題】|【強棒出擊】")
HTML_COMMENT_RE = re.compile(r"`<!-- -->`\{=html\}|<!-- -->\{=html\}")
DECORATIVE_RE = re.compile(r"^[\s|:+\-_=]+$")
VECTOR_EXT_RE = re.compile(r"(?i)\.(emf|wmf)$")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def plain_line(line: str) -> str:
    text = str(line or "").rstrip()
    stripped = text.strip()
    if stripped.startswith("|"):
        stripped = stripped[1:].strip()
    if stripped.endswith("|"):
        stripped = stripped[:-1].strip()
    return stripped.replace("**", "").strip()


def is_decorative_line(line: str) -> bool:
    stripped = str(line or "").strip()
    if not stripped:
        return True
    return bool(DECORATIVE_RE.fullmatch(stripped))


def detect_topic(line: str) -> str | None:
    stripped = plain_line(line)
    match = TOPIC_RE.search(stripped)
    if not match:
        return None
    return f"主題{match.group(1)}：{match.group(2).strip()}"


def detect_marker(line: str) -> str | None:
    stripped = plain_line(line)
    match = MARKER_RE.fullmatch(stripped)
    if not match:
        return None
    return re.sub(r"\s+", "", match.group(1))


def parse_blocks(markdown_text: str) -> list[dict]:
    lines = markdown_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    current_topic = ""
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
                    "topic": current_topic,
                    "marker": current_marker,
                    "raw_text": raw_text,
                }
            )
        buffer = []

    for line in lines:
        topic = detect_topic(line)
        marker = detect_marker(line)
        if topic:
            flush()
            current_topic = topic
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


def split_question_and_explanation(raw_text: str) -> tuple[str, str]:
    raw = str(raw_text or "")
    match = EXPLANATION_RE.search(raw)
    if not match:
        return raw, ""
    return raw[: match.start()], raw[match.end() :]


def renamed_asset_name(raw_path: str, prefix: str) -> str:
    name = Path(str(raw_path or "").replace("\\", "/")).name
    if not name:
        return ""
    if VECTOR_EXT_RE.search(name):
        name = f"{name}.png"
    return f"{prefix}{name}" if prefix else name


def asset_marker_path(target_pack: str, raw_path: str, prefix: str = "") -> str:
    name = renamed_asset_name(raw_path, prefix)
    if not name:
        return ""
    return f"program-db/imports/packs/{target_pack}/assets/media/{name}"


def replace_inline_images(text: str, target_pack: str, asset_prefix: str = "") -> str:
    value = str(text or "")

    def repl_html(match: re.Match[str]) -> str:
        path = asset_marker_path(target_pack, match.group(1), asset_prefix)
        return f"\n[圖:{path}]\n" if path else ""

    def repl_md(match: re.Match[str]) -> str:
        alt = cleanup_import_artifacts(match.group(1)).strip()
        path = asset_marker_path(target_pack, match.group(2), asset_prefix)
        parts: list[str] = []
        if alt and (re.search(r"[\u4e00-\u9fff]", alt) or any(tok in alt for tok in ("=", r"\frac", r"\sqrt"))):
            parts.append(alt)
        if path:
            parts.append(f"[圖:{path}]")
        return "\n".join(parts)

    value = HTML_IMAGE_RE.sub(repl_html, value)
    value = INLINE_IMAGE_RE.sub(repl_md, value)
    return value


def normalize_text(text: str, target_pack: str, asset_prefix: str = "") -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value, target_pack, asset_prefix)
    value = IMAGE_ATTR_RE.sub("", value)
    value = EMPTY_UNDERLINE_RE.sub("＿＿＿＿", value)
    value = TEXT_UNDERLINE_RE.sub(r"\1", value)
    value = RAW_MEDIA_RE.sub("", value)
    value = EDITORIAL_RE.sub("", value)
    value = HTML_COMMENT_RE.sub("", value)
    value = value.replace("`", "")
    value = value.replace("\\mspace{6mu}", " ")
    value = value.replace("<br />", "\n").replace("<br/>", "\n")

    cleaned_lines: list[str] = []
    for raw_line in value.split("\n"):
        line = plain_line(raw_line)
        if not line or is_decorative_line(line):
            continue
        cleaned_lines.append(line)

    value = "\n".join(cleaned_lines)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = cleanup_import_artifacts(value)
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。；、")
    if len(seed) > 34:
        seed = seed[:34].rstrip(" ：，。；、")
    title = f"{marker}：{seed}" if seed else marker
    return clean_question_title(title)


def category_from_marker(marker: str) -> str:
    return "基本" if marker.startswith("範例") else "重要"


def difficulty_from_marker(marker: str) -> str:
    return "易" if marker.startswith("範例") else "中"


def formula_for_topic2(local_order: int) -> str:
    if local_order in {3, 5, 6}:
        return "senior-matrix-operation-common-pitfalls-s442"
    return "senior-inverse-matrix-and-determinant-s442"


def build_topic1_records(blocks: list[dict]) -> list[dict]:
    records: list[dict] = []
    for index, block in enumerate(blocks, start=1):
        question_text, explanation_text = split_question_and_explanation(block["raw_text"])
        question_text = normalize_text(question_text, NEW_PACK)
        explanation_text = normalize_text(explanation_text, NEW_PACK)
        marker = block["marker"]
        section = block["topic"] or "主題1：轉移矩陣"
        records.append(
            {
                "id": f"q-{NEW_PACK}-{index:04d}",
                "title": rebuild_title(marker, question_text),
                "question_text": question_text,
                "answer_text": "",
                "explanation_text": explanation_text,
                "chapter_code": NEW_PACK,
                "formula_id": "senior-transformation-matrix-main-s443",
                "difficulty": difficulty_from_marker(marker),
                "question_category": category_from_marker(marker),
                "source_type": "docx_pack_markdown",
                "source_ref": f"source/{SOURCE_DOC}",
                "source_section": section,
                "source_order": index,
                "tags": [NEW_PACK, f"section:{section}", f"marker:{marker}"],
            }
        )
    return records


def build_topic2_records(blocks: list[dict], start_order: int) -> list[dict]:
    records: list[dict] = []
    for local_index, block in enumerate(blocks, start=1):
        order = start_order + local_index - 1
        question_text, explanation_text = split_question_and_explanation(block["raw_text"])
        question_text = normalize_text(question_text, MERGE_PACK, MERGE_ASSET_PREFIX)
        explanation_text = normalize_text(explanation_text, MERGE_PACK, MERGE_ASSET_PREFIX)
        marker = block["marker"]
        section = block["topic"] or "主題2：乘法反矩陣"
        records.append(
            {
                "id": f"q-{MERGE_PACK}-{order:04d}",
                "title": rebuild_title(marker, question_text),
                "question_text": question_text,
                "answer_text": "",
                "explanation_text": explanation_text,
                "chapter_code": MERGE_PACK,
                "formula_id": formula_for_topic2(local_index),
                "difficulty": difficulty_from_marker(marker),
                "question_category": category_from_marker(marker),
                "source_type": "docx_pack_markdown",
                "source_ref": f"source/{SOURCE_DOC}",
                "source_section": section,
                "source_order": order,
                "tags": [MERGE_PACK, f"section:{section}", f"marker:{marker}", "source:4A-9轉.docx"],
            }
        )
    return records


def build_preview(records: list[dict], chapter_code: str, source_ref: str) -> dict:
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
            "source_ref": source_ref,
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(Counter(row["question_category"] for row in records)),
        "by_section": by_section,
    }


def build_manifest(chapter_code: str, chapter_title: str, source_files: list[str], extracted_files: list[str]) -> dict:
    return {
        "chapter_code": chapter_code,
        "chapter_title": chapter_title,
        "source_files": [{"path": path, "role": "primary_docx"} for path in source_files],
        "extracted_files": [{"path": path, "role": "pandoc_markdown"} for path in extracted_files]
        + [
            {"path": "questions.json", "role": "question_pack"},
            {"path": "preview.json", "role": "assignment_preview"},
            {"path": "review-needed.md", "role": "manual_review_notes"},
        ],
        "asset_roots": [{"path": "assets/media", "role": "pandoc_extracted_media"}],
        "status": "review_ready",
        "updated_at": datetime.now().astimezone().isoformat(),
    }


def write_review(path: Path, chapter_code: str, lines: list[str]):
    content = [f"# {chapter_code} review notes", ""]
    content.extend(lines)
    path.write_text("\n".join(content).rstrip() + "\n", encoding="utf-8")


def ensure_png_sidecars(asset_dir: Path):
    for file in sorted(asset_dir.iterdir()):
        if file.suffix.lower() not in {".wmf", ".emf"}:
            continue
        png_path = Path(f"{file}.png")
        if png_path.exists():
            continue
        with Image.open(file) as image:
            image.save(png_path, format="PNG")


def copy_assets(source_dir: Path, target_dir: Path, prefix: str = ""):
    ensure_dir(target_dir)
    for file in sorted(source_dir.iterdir()):
        if not file.is_file():
            continue
        name = f"{prefix}{file.name}" if prefix else file.name
        shutil.copy2(file, target_dir / name)
    ensure_png_sidecars(target_dir)


def copy_doc_and_md(target_root: Path):
    ensure_dir(target_root / "source")
    ensure_dir(target_root / "extracted")
    shutil.copy2(INSPECT_PACK / "source" / SOURCE_DOC, target_root / "source" / SOURCE_DOC)
    shutil.copy2(INSPECT_PACK / "extracted" / SOURCE_MD, target_root / "extracted" / SOURCE_MD)


def main():
    markdown = (INSPECT_PACK / "extracted" / SOURCE_MD).read_text(encoding="utf-8")
    blocks = parse_blocks(markdown)
    topic1_blocks = [block for block in blocks if block["topic"].startswith("主題1")]
    topic2_blocks = [block for block in blocks if block["topic"].startswith("主題2")]

    if len(topic1_blocks) != 22 or len(topic2_blocks) != 24:
        raise RuntimeError(f"Unexpected block counts: topic1={len(topic1_blocks)}, topic2={len(topic2_blocks)}")

    s443_root = PACKS_DIR / NEW_PACK
    ensure_dir(s443_root / "assets" / "media")
    copy_doc_and_md(s443_root)
    copy_assets(INSPECT_PACK / "assets" / "media", s443_root / "assets" / "media")
    s443_records = build_topic1_records(topic1_blocks)
    write_json(
        s443_root / "questions.json",
        {
            "chapter_code": NEW_PACK,
            "chapter_title": NEW_CHAPTER_TITLE,
            "questions": s443_records,
        },
    )
    write_json(s443_root / "preview.json", build_preview(s443_records, NEW_PACK, f"source/{SOURCE_DOC}"))
    write_json(
        s443_root / "manifest.json",
        build_manifest(NEW_PACK, NEW_CHAPTER_TITLE, [f"source/{SOURCE_DOC}"], [f"extracted/{SOURCE_MD}"]),
    )
    write_review(
        s443_root / "review-needed.md",
        NEW_PACK,
        [
            "- 目前共 22 題，全部來自 `4A-9` 的 `主題1：轉移矩陣`。",
            "- 由於網站現有 `s4-4-3` 分支偏向幾何變換矩陣，這 22 題先統一掛在 `senior-transformation-matrix-main-s443`。",
            "- 若之後網站補出 `轉移矩陣 / 穩定分布` 分支，可再細分重掛。",
        ],
    )

    s442_root = PACKS_DIR / MERGE_PACK
    existing_payload = read_json(s442_root / "questions.json")
    existing_records = [
        row for row in existing_payload["questions"] if row.get("source_ref") != f"source/{SOURCE_DOC}"
    ]
    start_order = len(existing_records) + 1
    copy_doc_and_md(s442_root)
    copy_assets(INSPECT_PACK / "assets" / "media", s442_root / "assets" / "media", MERGE_ASSET_PREFIX)
    topic2_records = build_topic2_records(topic2_blocks, start_order)
    merged_records = existing_records + topic2_records
    write_json(
        s442_root / "questions.json",
        {
            "chapter_code": MERGE_PACK,
            "chapter_title": MERGE_CHAPTER_TITLE,
            "questions": merged_records,
        },
    )
    write_json(s442_root / "preview.json", build_preview(merged_records, MERGE_PACK, "source/4A-8轉.docx + source/4A-9轉.docx"))
    write_json(
        s442_root / "manifest.json",
        build_manifest(
            MERGE_PACK,
            MERGE_CHAPTER_TITLE,
            ["source/4A-8轉.docx", "source/4A-9轉.docx"],
            ["extracted/4A-8轉.md", "extracted/4A-9轉.md"],
        ),
    )
    write_review(
        s442_root / "review-needed.md",
        MERGE_PACK,
        [
            f"- 目前共 {len(merged_records)} 題，其中後 24 題為 `4A-9` 的 `主題2：乘法反矩陣`。",
            "- 已保留原本 `4A-8` 題目，並以 `4A-9_` 前綴搬移新圖片，避免覆蓋舊資產。",
            "- `4A-9` 這批新增題目大多掛到 `senior-inverse-matrix-and-determinant-s442`；純性質判斷題掛到 `senior-matrix-operation-common-pitfalls-s442`。",
            "- 如果你之前已經匯入過 `s4-4-2`，這次需要用更新後的 pack 重新匯一次。",
        ],
    )

    print(f"s4-4-3={len(s443_records)}")
    print(f"s4-4-2={len(merged_records)}")


if __name__ == "__main__":
    main()
