import argparse
import json
import re
from collections import Counter
from pathlib import Path

from question_data_utils import clean_question_body


TOPIC_RE = re.compile(r"主題\s*(\d+)\s*：\s*([^\n|]+)")
MARKER_RE = re.compile(r"^(範例\s*\d+|隨堂練習)\s*$")
IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)(?:\{[^}]*\})?")
UNDERLINE_BLANK_RE = re.compile(r"\[(?:\s|　)*\]\{\.underline\}")
UNDERLINE_TEXT_RE = re.compile(r"\[([^\[\]\n]+)\]\{\.underline\}")
PIPE_BORDER_RE = re.compile(r"^[\s:+\-|.]+$")
HTML_COMMENT_RE = re.compile(r"`<!--.*?-->`\{=html\}", re.S)
WIDTH_ATTR_RE = re.compile(r"\{[^}]*?(?:width|height|\.underline)[^}]*\}")
EMPHASIS_RE = re.compile(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)")
SIMPLE_SUP_RE = re.compile(r"\^([0-9A-Za-z+\-]+)\^")


def convert_simple_superscripts(text: str) -> str:
    parts = re.split(r"(\$[^$]*\$)", str(text or ""))
    converted: list[str] = []
    for part in parts:
        if not part:
            continue
        if part.startswith("$") and part.endswith("$"):
            converted.append(SIMPLE_SUP_RE.sub(lambda m: f"^{{{m.group(1)}}}", part))
        else:
            converted.append(SIMPLE_SUP_RE.sub(lambda m: f"^{{{m.group(1)}}}", part))
    return "".join(converted)


def normalize_source_line(line: str) -> str:
    text = str(line or "").replace("\r", "").rstrip()
    text = text.replace("\u00a0", " ").replace("\u2004", " ").replace("\u3000", "　")
    stripped = text.strip()
    if not stripped:
        return ""
    if stripped == r"[\]{.underline}":
        return ""
    if PIPE_BORDER_RE.fullmatch(stripped):
        return ""
    if stripped in {">", "|"}:
        return ""
    if stripped.startswith(">"):
        stripped = stripped[1:].strip()
    if stripped.startswith("|"):
        stripped = stripped[1:].strip()
    if stripped.endswith("|"):
        stripped = stripped[:-1].strip()
    return stripped


def replace_images(text: str) -> tuple[str, list[str]]:
    image_paths: list[str] = []

    def repl(match: re.Match[str]) -> str:
        raw_path = match.group(1).strip().replace("\\", "/")
        normalized = raw_path[2:] if raw_path.startswith("./") else raw_path
        image_paths.append(normalized)
        return f"[圖:{normalized}]"

    return IMAGE_RE.sub(repl, text), image_paths


def cleanup_fragment(text: str) -> str:
    source = str(text or "")
    source = HTML_COMMENT_RE.sub("", source)
    source = UNDERLINE_TEXT_RE.sub(lambda m: m.group(1).strip(), source)
    source = UNDERLINE_BLANK_RE.sub("＿＿＿＿＿＿＿＿＿＿＿＿", source)
    source = WIDTH_ATTR_RE.sub("", source)
    source = source.replace("\\_", "_")
    source = source.replace("\\>", ">").replace("\\<", "<").replace("\\|", "|")
    source = source.replace("\\(", "(").replace("\\)", ")")
    source = source.replace("\\[", "[").replace("\\]", "]")
    source = source.replace("\\lbrack", "[").replace("\\rbrack", "]")
    source = source.replace("\\mspace{6mu}", " ")
    source = source.replace("***", "")
    source = source.replace("\\\n", "\n")
    source = re.sub(r"\\\s*$", "", source, flags=re.M)
    source = EMPHASIS_RE.sub(lambda m: m.group(1), source)
    source = convert_simple_superscripts(source)
    source = re.sub(r"\n{3,}", "\n\n", source)
    source = re.sub(r"[ \t]+\n", "\n", source)
    source = re.sub(r"\n[ \t]+", "\n", source)
    source = re.sub(r"[ \t]{2,}", " ", source)
    return source.strip()


def build_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：:。﹒")
    if not seed:
        return marker
    return f"{marker}：{seed[:28]}"


def parse_blocks(lines: list[str]) -> tuple[list[dict], list[str]]:
    blocks: list[dict] = []
    current_topic = ""
    current_marker = ""
    current_lines: list[str] = []
    notes: list[str] = []

    def flush_current():
        nonlocal current_marker, current_lines
        if not current_marker:
            current_lines = []
            return
        blocks.append(
            {
                "topic": current_topic,
                "marker": current_marker,
                "lines": list(current_lines),
            }
        )
        current_marker = ""
        current_lines = []

    for raw_line in lines:
        line = normalize_source_line(raw_line)
        if not line:
            continue

        topic_match = TOPIC_RE.search(line)
        if topic_match:
            flush_current()
            topic_tail = topic_match.group(2).replace("*", "").strip(" ：:")
            current_topic = f"主題{topic_match.group(1)}：{topic_tail}"
            continue

        marker_match = MARKER_RE.match(line.replace("**", "").strip())
        if marker_match:
            flush_current()
            current_marker = marker_match.group(1)
            continue

        if not current_marker:
            if line not in {"【課本題】", "單元3 式的運算"}:
                notes.append(line)
            continue

        current_lines.append(line)

    flush_current()
    return blocks, notes


def split_question_and_explanation(lines: list[str]) -> tuple[str, str]:
    question_lines: list[str] = []
    explanation_lines: list[str] = []
    in_explanation = False

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
        if line == "【課本題】":
            continue
        if "【解析】" in line and not in_explanation:
            before, after = line.split("【解析】", 1)
            if before.strip():
                question_lines.append(before.strip())
            explanation_lines.append(f"【解析】{after.strip()}".strip())
            in_explanation = True
            continue
        if in_explanation:
            explanation_lines.append(line)
        else:
            question_lines.append(line)

    return "\n".join(question_lines).strip(), "\n".join(explanation_lines).strip()


def main():
    parser = argparse.ArgumentParser(description="Build s1-1-3 question pack from extracted markdown.")
    parser.add_argument("--markdown", required=True)
    parser.add_argument("--chapter-code", default="s1-1-3")
    parser.add_argument("--source-ref", default="source/1-3轉.docx")
    parser.add_argument("--output-json", required=True)
    parser.add_argument("--output-preview", required=True)
    parser.add_argument("--output-manifest", required=True)
    parser.add_argument("--output-notes", required=True)
    args = parser.parse_args()

    markdown_path = Path(args.markdown)
    lines = markdown_path.read_text(encoding="utf-8").splitlines()
    blocks, notes = parse_blocks(lines)

    records: list[dict] = []
    section_counts: Counter[str] = Counter()
    image_references: set[str] = set()

    for source_order, block in enumerate(blocks, start=1):
        question_text, explanation_text = split_question_and_explanation(block["lines"])
        question_text, q_images = replace_images(question_text)
        explanation_text, e_images = replace_images(explanation_text)

        question_text = clean_question_body(cleanup_fragment(question_text))
        explanation_text = clean_question_body(cleanup_fragment(explanation_text))

        marker = block["marker"]
        category = "基本" if marker.startswith("範例") else "重要"
        difficulty = "易" if category == "基本" else "中"
        tags = [
            args.chapter_code,
            f"section:{block['topic']}" if block["topic"] else "section:",
            f"marker:{marker}",
            "needs-formula-id",
        ]

        record = {
            "id": f"q-{args.chapter_code}-{source_order:04d}",
            "title": build_title(marker, question_text),
            "question_text": question_text,
            "answer_text": "",
            "explanation_text": explanation_text,
            "chapter_code": args.chapter_code,
            "formula_id": "",
            "difficulty": difficulty,
            "question_category": category,
            "source_type": "docx_pack_markdown",
            "source_ref": args.source_ref,
            "source_section": block["topic"],
            "source_order": source_order,
            "tags": tags,
        }
        records.append(record)
        section_counts[block["topic"] or "未分類"] += 1
        image_references.update(q_images)
        image_references.update(e_images)

    payload = {
        "meta": {
            "chapter_code": args.chapter_code,
            "source_ref": args.source_ref,
            "count": len(records),
            "schema": "question-import-pack-v1-preview",
        },
        "summary": {
            "count": len(records),
            "sections": dict(section_counts),
            "image_references": sorted(image_references),
            "notes": notes,
        },
        "questions": records,
    }

    preview = {
        "meta": {
            "chapter_code": args.chapter_code,
            "count": len(records),
            "unassigned_formula_id_count": len(records),
        },
        "by_category": dict(Counter(row["question_category"] for row in records)),
        "by_section": {},
        "summary": payload["summary"],
    }
    for row in records:
        section = row.get("source_section") or "未分類"
        preview["by_section"].setdefault(section, []).append(
            {
                "id": row["id"],
                "title": row["title"],
                "question_category": row["question_category"],
                "difficulty": row["difficulty"],
                "formula_id": row.get("formula_id", ""),
            }
        )

    manifest = {
        "chapter_code": args.chapter_code,
        "chapter_title": "式的運算",
        "source_files": [
            {
                "path": args.source_ref,
                "role": "primary_docx",
                "note": "原始 Word 題源",
            }
        ],
        "extracted_files": [
            {"path": markdown_path.relative_to(markdown_path.parent.parent).as_posix(), "role": "pandoc_markdown"},
            {"path": Path(args.output_json).name, "role": "question_pack_preview"},
            {"path": Path(args.output_preview).name, "role": "assignment_preview"},
        ],
        "asset_roots": [
            {"path": "assets/media", "role": "pandoc_extracted_media"},
        ],
        "question_schema": {
            "id": "string",
            "title": "string",
            "question_text": "string",
            "answer_text": "string",
            "explanation_text": "string",
            "chapter_code": "string",
            "formula_id": "string",
            "difficulty": "易|中|難",
            "question_category": "基本|重要|綜合",
            "source_type": "string",
            "source_ref": "string",
            "source_section": "string",
            "source_order": "number",
            "tags": [],
        },
        "default_mapping_rules": {
            "範例": "基本",
            "隨堂練習": "重要",
            "high_confidence_formula_id": "掛到對應重點或分支",
            "unmatched_formula_id": "綜合",
        },
        "status": "review_ready",
    }

    notes_text = "\n".join(
        [
            "# s1-1-3 Notes",
            "",
            f"- Parsed records: {len(records)}",
            f"- Sections: {dict(section_counts)}",
            f"- Unattached notes above first marker: {len(notes)}",
        ]
    ) + "\n"

    Path(args.output_json).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    Path(args.output_preview).write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")
    Path(args.output_manifest).write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    Path(args.output_notes).write_text(notes_text, encoding="utf-8")

    print(f"records={len(records)}")
    print(args.output_json)
    print(args.output_preview)


if __name__ == "__main__":
    main()
