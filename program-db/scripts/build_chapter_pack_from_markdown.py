import argparse
import html
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


TOPIC_RE = re.compile(r"<td[^>]*><strong>(主題\s*\d+\s*[:：]?\s*[^<]+|主題\d+[^<]+)</strong></td>")
MARKER_HTML_RE = re.compile(r"<td[^>]*><strong>(範例\s*\d+|範例\d+|隨堂練習)</strong></td>")
MARKER_PIPE_RE = re.compile(r"^\|\s*\*\*(範例\s*\d+|範例\d+|隨堂練習)\*\*\s*\|")
CELL_RE = re.compile(r"<td[^>]*>(.*?)</td>", re.S)
FIGCAPTION_RE = re.compile(r"<figcaption><p>(.*?)</p></figcaption>", re.S)
IMG_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>')
TAG_RE = re.compile(r"</?(?:p|span|em|strong|figure|figcaption|table|tbody|tr|td|colgroup|col|u)[^>]*>")
REMAINING_TAG_RE = re.compile(r"</?[A-Za-z][^>]*>")
BREAK_RE = re.compile(r"<br\s*/?>", re.IGNORECASE)
HTML_WRAPPER_RE = re.compile(r"^</?(?:table|tbody|tr|td|colgroup|col|figure)[^>]*>$", re.IGNORECASE)
SUP_RE = re.compile(r"<sup>(.*?)</sup>", re.IGNORECASE | re.S)
SUB_RE = re.compile(r"<sub>(.*?)</sub>", re.IGNORECASE | re.S)
PIPE_SEPARATOR_RE = re.compile(r"^\|\s*[-:| ]+\|\s*$")


def normalize_image_path(raw_path: str, workspace_root: Path) -> str:
    value = str(raw_path or "").strip().replace("\\", "/")
    if not value:
        return ""

    absolute = Path(value)
    try:
        if absolute.is_absolute():
            return absolute.relative_to(workspace_root).as_posix()
    except ValueError:
        pass

    marker = "/program-db/"
    idx = value.lower().find(marker)
    if idx >= 0:
        return value[idx + 1 :]
    return value


def replace_images(fragment: str, workspace_root: Path) -> str:
    def repl(match: re.Match[str]) -> str:
        normalized = normalize_image_path(match.group(1), workspace_root)
        return f"[圖: {normalized}]" if normalized else ""

    return IMG_RE.sub(repl, fragment)


def clean_html_fragment(fragment: str, workspace_root: Path) -> str:
    text = str(fragment or "")
    text = replace_images(text, workspace_root)
    text = SUP_RE.sub(lambda m: f"^{m.group(1).strip()}", text)
    text = SUB_RE.sub(lambda m: f"_{m.group(1).strip()}", text)
    text = BREAK_RE.sub("\n", text)
    text = TAG_RE.sub("", text)
    text = html.unescape(text)
    text = REMAINING_TAG_RE.sub("", text)
    text = text.replace("\xa0", " ").replace("\u2004", " ").replace("\u3000", " ")
    text = text.replace("*", "")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def clean_pipe_fragment(fragment: str, workspace_root: Path) -> str:
    lines = []
    for raw_line in str(fragment or "").splitlines():
        line = raw_line.strip()
        if not line or PIPE_SEPARATOR_RE.fullmatch(line):
            continue
        if line.startswith("|"):
            line = line[1:]
        if line.endswith("|"):
            line = line[:-1]
        line = line.strip()
        if line.startswith("**") and line.endswith("**") and len(line) >= 4:
            line = line[2:-2].strip()
        if line:
            lines.append(line)
    joined = "\n".join(lines).strip()
    return clean_html_fragment(joined, workspace_root)


def clean_line(line: str, workspace_root: Path) -> str:
    raw = str(line or "").strip()
    if not raw or HTML_WRAPPER_RE.fullmatch(raw):
        return ""

    if raw.startswith("|"):
        return clean_pipe_fragment(raw, workspace_root)

    fig_match = FIGCAPTION_RE.search(raw)
    if fig_match:
        return clean_html_fragment(fig_match.group(1), workspace_root)

    cell_match = CELL_RE.search(raw)
    if cell_match:
        return clean_html_fragment(cell_match.group(1), workspace_root)

    return clean_html_fragment(raw, workspace_root)


def consume_td_fragment(lines: list[str], start_index: int) -> tuple[str, int]:
    line = lines[start_index]
    if "<td" not in line:
        return "", start_index

    parts = [line]
    index = start_index
    while "</td>" not in parts[-1] and index + 1 < len(lines):
        index += 1
        parts.append(lines[index])
    return "\n".join(parts), index + 1


def consume_pipe_fragment(lines: list[str], start_index: int) -> tuple[str, int]:
    line = lines[start_index]
    if not line.lstrip().startswith("|"):
        return "", start_index

    parts = [line]
    index = start_index
    while not parts[-1].rstrip().endswith("|") and index + 1 < len(lines):
        index += 1
        parts.append(lines[index])
    return "\n".join(parts), index + 1


def extract_marker(line: str, workspace_root: Path) -> str:
    html_match = MARKER_HTML_RE.search(line)
    if html_match:
        return clean_html_fragment(html_match.group(1), workspace_root)

    pipe_match = MARKER_PIPE_RE.search(line.strip())
    if pipe_match:
        return clean_pipe_fragment(pipe_match.group(1), workspace_root)
    return ""


def extract_question_cell(lines: list[str], start_index: int, marker: str, workspace_root: Path) -> tuple[str, int]:
    index = start_index
    while index < len(lines):
        line = lines[index]
        if TOPIC_RE.search(line) or extract_marker(line, workspace_root):
            break
        if "<td" in line:
            fragment, next_index = consume_td_fragment(lines, index)
            cell_match = CELL_RE.search(fragment)
            candidate = clean_html_fragment(cell_match.group(1), workspace_root) if cell_match else ""
            if candidate and candidate != marker:
                return candidate, next_index
        elif line.lstrip().startswith("|"):
            fragment, next_index = consume_pipe_fragment(lines, index)
            candidate = clean_pipe_fragment(fragment, workspace_root)
            if candidate and candidate != marker:
                return candidate, next_index
        index += 1
    return "", start_index


def normalize_text_block(text: str) -> str:
    source = str(text or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    if not source:
        return ""

    pieces = []
    for line in source.split("\n"):
        cleaned = line.strip()
        if not cleaned:
            continue
        if not pieces or pieces[-1] != cleaned:
            pieces.append(cleaned)

    collapsed = "\n".join(pieces).strip()
    half = len(collapsed) // 2
    if len(collapsed) % 2 == 0 and half > 0 and collapsed[:half] == collapsed[half:]:
        collapsed = collapsed[:half].strip()
    compact = re.sub(r"\s+", " ", collapsed).strip()
    compact_half = len(compact) // 2
    if (
        compact
        and len(compact) % 2 == 0
        and compact_half > 0
        and compact[:compact_half] == compact[compact_half:]
    ):
        collapsed = compact[:compact_half].strip()
    return collapsed


def build_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:\s*[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：:。﹒")
    if not seed:
        return marker
    return f"{marker}：{seed[:28]}"


def build_records(lines: list[str], chapter_code: str, source_ref: str, workspace_root: Path) -> tuple[list[dict], dict]:
    records = []
    current_topic = ""
    current_topic_key = ""
    source_order = 1
    skipped = []
    unresolved_images = set()
    section_counts = Counter()

    index = 0
    while index < len(lines):
        line = lines[index]
        topic_match = TOPIC_RE.search(line)
        if topic_match:
            current_topic = clean_html_fragment(topic_match.group(1), workspace_root)
            current_topic_key = current_topic or ""
            index += 1
            continue

        marker = extract_marker(line, workspace_root)
        if not marker:
            index += 1
            continue

        question_text, next_index = extract_question_cell(lines, index + 1, marker, workspace_root)
        if not question_text:
            skipped.append({
                "line": index + 1,
                "marker": marker,
                "topic": current_topic_key,
                "reason": "question_text_missing",
            })
            index += 1
            continue

        explanation_parts = []
        cursor = next_index
        while cursor < len(lines):
            candidate_line = lines[cursor]
            if TOPIC_RE.search(candidate_line) or extract_marker(candidate_line, workspace_root):
                break
            cleaned = clean_line(candidate_line, workspace_root)
            if cleaned:
                explanation_parts.append(cleaned)
            cursor += 1

        question_text = normalize_text_block(question_text)
        explanation_text = normalize_text_block("\n".join(explanation_parts))
        answer_text = ""

        category = "基本" if marker.startswith("範例") else "重要"
        difficulty = "易" if category == "基本" else "中"
        record = {
            "id": f"q-{chapter_code}-{source_order:04d}",
            "title": build_title(marker, question_text),
            "question_text": question_text,
            "answer_text": answer_text,
            "explanation_text": explanation_text,
            "chapter_code": chapter_code,
            "formula_id": "",
            "difficulty": difficulty,
            "question_category": category,
            "source_type": "docx_pack_markdown",
            "source_ref": source_ref,
            "source_section": current_topic_key,
            "source_order": source_order,
            "tags": [
                chapter_code,
                f"section:{current_topic_key}" if current_topic_key else "section:",
                "needs-formula-id",
                f"marker:{marker}",
            ],
        }

        for field in ("question_text", "explanation_text"):
            for match in re.findall(r"\[圖:\s*([^\]]+)\]", record[field]):
                unresolved_images.add(match)

        records.append(record)
        section_counts[current_topic_key or "未分類"] += 1
        source_order += 1
        index = cursor

    summary = {
        "count": len(records),
        "sections": dict(section_counts),
        "skipped": skipped,
        "image_references": sorted(unresolved_images),
    }
    return records, summary


def write_questions_json(path: Path, chapter_code: str, source_ref: str, records: list[dict], summary: dict):
    payload = {
        "meta": {
            "chapter_code": chapter_code,
            "source_ref": source_ref,
            "count": len(records),
            "schema": "question-import-pack-v1-preview",
        },
        "summary": summary,
        "questions": records,
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_preview(path: Path, chapter_code: str, source_ref: str, records: list[dict], summary: dict):
    sections = {}
    for row in records:
        section = row.get("source_section") or "未分類"
        sections.setdefault(section, []).append(
            {
                "id": row["id"],
                "title": row["title"],
                "question_category": row["question_category"],
                "difficulty": row["difficulty"],
            }
        )

    preview = {
        "meta": {
            "chapter_code": chapter_code,
            "source_ref": source_ref,
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for record in records if not record.get("formula_id")),
        },
        "by_category": Counter(record.get("question_category", "") for record in records),
        "by_section": sections,
        "summary": summary,
    }
    preview["by_category"] = dict(preview["by_category"])
    path.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Build chapter question preview from extracted markdown.")
    parser.add_argument("--markdown", required=True)
    parser.add_argument("--chapter-code", required=True)
    parser.add_argument("--source-ref", required=True)
    parser.add_argument("--workspace-root", required=True)
    parser.add_argument("--output-json", required=True)
    parser.add_argument("--output-preview", required=True)
    args = parser.parse_args()

    markdown_path = Path(args.markdown)
    workspace_root = Path(args.workspace_root)
    lines = markdown_path.read_text(encoding="utf-8").splitlines()
    records, summary = build_records(
        lines=lines,
        chapter_code=args.chapter_code,
        source_ref=args.source_ref,
        workspace_root=workspace_root,
    )

    output_json = Path(args.output_json)
    output_preview = Path(args.output_preview)
    output_json.parent.mkdir(parents=True, exist_ok=True)
    write_questions_json(output_json, args.chapter_code, args.source_ref, records, summary)
    write_preview(output_preview, args.chapter_code, args.source_ref, records, summary)

    print(f"records={len(records)}")
    print(output_json)
    print(output_preview)


if __name__ == "__main__":
    main()
