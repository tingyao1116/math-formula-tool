import argparse
import json
import re
from collections import Counter
from pathlib import Path

from question_data_utils import clean_question_body


TOPIC_RE = re.compile(r"主題\s*(\d+)\s*[：:]\s*(.+)")
MARKER_RE = re.compile(r"(範例\s*\d+|隨堂練習)")
IMG_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
FIGCAPTION_RE = re.compile(r"</?figcaption[^>]*>", re.I)
FIGURE_RE = re.compile(r"</?figure[^>]*>", re.I)
MATH_SPAN_RE = re.compile(r'<span class="math inline">([\s\S]*?)</span>', re.I)
TAG_RE = re.compile(r"</?(?:table|tbody|tr|td|colgroup|col|p|br)[^>]*>", re.I)
STRONG_RE = re.compile(r"</?strong>", re.I)
EM_RE = re.compile(r"</?em>", re.I)
U_RE = re.compile(r"</?u>", re.I)
SUP_RE = re.compile(r"<sup>([\s\S]*?)</sup>", re.I)
SUB_RE = re.compile(r"<sub>([\s\S]*?)</sub>", re.I)
BACKTICK_MATH_RE = re.compile(r"\$`([\s\S]*?)`\$")
PIPE_BORDER_RE = re.compile(r"^[\s:+\-|.]+$")
BLANK_RE = re.compile(r"(?:\u3000|\s)*_{6,}(?:\u3000|\s)*|(?:\u3000|\s)*﹍{4,}(?:\u3000|\s)*|(?:\u3000|\s)*　　　+(?:\u3000|\s)*")

HTML_ENTITY_REPLACEMENTS = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&nbsp;": " ",
}

IGNORE_NOTE_LINES = {
    "**\\**",
    "\\",
}


def normalize_image_path(raw_path: str) -> str:
    text = str(raw_path or "").strip().replace("\\", "/")
    if not text:
        return ""
    lower = text.lower()
    anchor = lower.find("/program-db/")
    if anchor >= 0:
        return text[anchor + 1 :]
    anchor = lower.find("program-db/")
    if anchor >= 0:
        return text[anchor:]
    if text.startswith("./"):
        return text[2:]
    return text


def cleanup_html(text: str) -> str:
    source = str(text or "")

    def img_repl(match: re.Match[str]) -> str:
        path = normalize_image_path(match.group(1))
        return f"\n[圖:{path}]\n" if path else ""

    source = IMG_RE.sub(img_repl, source)
    source = FIGCAPTION_RE.sub("\n", source)
    source = FIGURE_RE.sub("\n", source)
    source = MATH_SPAN_RE.sub(lambda m: m.group(1), source)
    source = SUP_RE.sub(lambda m: f"^{{{m.group(1).strip()}}}", source)
    source = SUB_RE.sub(lambda m: f"_{{{m.group(1).strip()}}}", source)
    source = STRONG_RE.sub("", source)
    source = EM_RE.sub("", source)
    source = U_RE.sub("", source)
    source = TAG_RE.sub("\n", source)
    for key, value in HTML_ENTITY_REPLACEMENTS.items():
        source = source.replace(key, value)
    source = source.replace("\u00a0", " ").replace("\u2003", " ").replace("\u2004", " ").replace("\u3000", " ")
    source = BACKTICK_MATH_RE.sub(lambda m: f"${m.group(1).strip()}$", source)
    source = source.replace("**", "")
    source = source.replace("\\[", "[").replace("\\]", "]").replace("\\(", "(").replace("\\)", ")")
    source = source.replace("\\lbrack", "[").replace("\\rbrack", "]")
    source = BLANK_RE.sub("____________", source)
    source = re.sub(r"<[^>]+>", "", source)
    source = re.sub(r"[ \t]+\n", "\n", source)
    source = re.sub(r"\n[ \t]+", "\n", source)
    source = re.sub(r"\n{3,}", "\n\n", source)
    source = re.sub(r"[ \t]{2,}", " ", source)
    return source.strip()


def normalize_source_line(line: str) -> str:
    text = cleanup_html(str(line or "").replace("\r", "").rstrip())
    stripped = text.strip()
    if not stripped:
        return ""
    if PIPE_BORDER_RE.fullmatch(stripped):
        return ""
    if stripped in {">", "|"}:
        return ""
    if stripped.startswith("|"):
        stripped = stripped[1:].strip()
    if stripped.endswith("|"):
        stripped = stripped[:-1].strip()
    return stripped


def parse_blocks(lines: list[str]) -> tuple[list[dict], list[str]]:
    blocks: list[dict] = []
    notes: list[str] = []
    current_topic = ""
    current_marker = ""
    current_lines: list[str] = []

    def flush_current():
        nonlocal current_marker, current_lines
        if not current_marker:
            current_lines = []
            return
        blocks.append({"topic": current_topic, "marker": current_marker, "lines": list(current_lines)})
        current_marker = ""
        current_lines = []

    for raw_line in lines:
        line = normalize_source_line(raw_line)
        if not line:
            continue

        topic_match = TOPIC_RE.search(line)
        if topic_match:
            flush_current()
            current_topic = f"主題{topic_match.group(1)}：{topic_match.group(2).strip()}"
            continue

        if "【解析】" not in line:
            marker_match = MARKER_RE.fullmatch(line)
            if marker_match:
                flush_current()
                current_marker = marker_match.group(1).strip()
                continue

        if not current_marker:
            if line not in IGNORE_NOTE_LINES:
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


def build_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：:。﹒")
    seed = re.split(r"[（(]1[）)]", seed, maxsplit=1)[0].strip(" ：:。﹒")
    if len(seed) > 28:
        seed = seed[:28].rstrip(" ：:。﹒")
    return f"{marker}：{seed}" if seed else marker


def main():
    parser = argparse.ArgumentParser(description="Build s1-1-7 question pack from extracted markdown.")
    parser.add_argument("--markdown", required=True)
    parser.add_argument("--chapter-code", default="s1-1-7")
    parser.add_argument("--source-ref", default="source/1-6轉.docx")
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
        question_text = clean_question_body(question_text)
        explanation_text = clean_question_body(explanation_text)

        for field_text in (question_text, explanation_text):
            for ref in re.findall(r"\[圖:([^\]]+)\]", field_text):
                image_references.add(ref)

        marker = block["marker"]
        category = "基本" if marker.startswith("範例") else "重要"
        difficulty = "易" if category == "基本" else "中"

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
            "tags": [
                args.chapter_code,
                f"section:{block['topic']}" if block["topic"] else "section:",
                f"marker:{marker}",
                "needs-formula-id",
            ],
        }
        records.append(record)
        section_counts[block["topic"] or "未分類"] += 1

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
        "chapter_title": "直線方程式",
        "source_files": [{"path": args.source_ref, "role": "primary_docx", "note": "原始 Word 檔"}],
        "extracted_files": [
            {"path": markdown_path.relative_to(markdown_path.parent.parent).as_posix(), "role": "pandoc_markdown"},
            {"path": Path(args.output_json).name, "role": "question_pack_preview"},
            {"path": Path(args.output_preview).name, "role": "assignment_preview"},
        ],
        "asset_roots": [{"path": "assets/media", "role": "pandoc_extracted_media"}],
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
            "high_confidence_formula_id": "掛到對應分支",
            "unmatched_formula_id": "章節綜合",
        },
        "status": "review_ready",
    }

    notes_text = "\n".join(
        [
            "# s1-1-6 Notes",
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
    print(f"sections={dict(section_counts)}")
    print(f"categories={dict(Counter(row['question_category'] for row in records))}")


if __name__ == "__main__":
    main()
