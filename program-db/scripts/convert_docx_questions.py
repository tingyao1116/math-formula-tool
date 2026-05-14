import argparse
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import deque
from pathlib import Path

NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}


def read_docx_paragraphs(path: Path):
    with zipfile.ZipFile(path) as z:
        xml_bytes = z.read('word/document.xml')
    root = ET.fromstring(xml_bytes)
    lines = []
    for pnode in root.findall('.//w:p', NS):
        text = ''.join((t.text or '') for t in pnode.findall('.//w:t', NS)).replace('\u3000', ' ').strip()
        if text:
            lines.append(text)
    return lines


def is_marker(line: str):
    m = re.fullmatch(r'【例題\s*(\d+)】', line.strip())
    return int(m.group(1)) if m else None


def _norm(s: str):
    return re.sub(r'\s+', '', s or '')


def split_lines_for_markers(lines, marker_count):
    if marker_count <= 1:
        return [lines]
    if not lines:
        return [[] for _ in range(marker_count)]

    # Preferred split points: sentence boundary with likely new-question starter.
    starter = re.compile(r'^(若|若以|在|在數線上|在下列|求|求下列|回答下列|設|方向|中午|判斷|下列|數線|數線上|已知|\(?\d+\)|甲|乙|丙|丁)')
    candidates = []
    for i in range(1, len(lines)):
        prev = lines[i - 1].strip()
        curr = lines[i].strip()
        if (prev.endswith('。') or prev.endswith('？') or prev.endswith('?')) and starter.match(curr):
            candidates.append(i)

    # Special handling for two-column layout (very common in this worksheet):
    # when two markers appear first, two questions are usually interleaved in one chunk.
    if marker_count == 2 and len(lines) >= 4:
        first = _norm(lines[0])
        repeat_idx = None
        if len(first) >= 4:
            head = first[:6]
            for i in range(1, len(lines)):
                if _norm(lines[i]).startswith(head):
                    repeat_idx = i
                    break
        if repeat_idx:
            return [lines[:repeat_idx], lines[repeat_idx:]]

    if len(candidates) >= marker_count - 1:
        split_points = candidates[: marker_count - 1]
    else:
        # Fallback: even split by line count.
        split_points = [round(len(lines) * k / marker_count) for k in range(1, marker_count)]

    parts = []
    start = 0
    for p in split_points:
        parts.append(lines[start:p])
        start = p
    parts.append(lines[start:])

    while len(parts) < marker_count:
        parts.append([])
    return parts[:marker_count]


def build_records(paragraphs, chapter_code, source_ref, id_prefix, stage='國中', grade='國一', difficulty='基礎', topic_tag=''):
    clusters = []
    i = 0
    n = len(paragraphs)
    while i < n:
        mk = is_marker(paragraphs[i])
        if not mk:
            i += 1
            continue

        markers = [mk]
        i += 1
        while i < n:
            nxt = is_marker(paragraphs[i])
            if nxt:
                markers.append(nxt)
                i += 1
            else:
                break

        chunk = []
        while i < n and not is_marker(paragraphs[i]):
            chunk.append(paragraphs[i])
            i += 1

        # Guardrail: in this kind of lecture DOCX, marker blocks can be followed by
        # long non-example sections. Keep a practical window per marker.
        max_lines = max(8, len(markers) * 14)
        if len(chunk) > max_lines:
            chunk = chunk[:max_lines]

        clusters.append((markers, chunk))

    records = []
    for markers, chunk in clusters:
        parts = split_lines_for_markers(chunk, len(markers))
        for idx, ex_num in enumerate(markers):
            lines = [x.strip() for x in parts[idx] if x.strip()]
            if not lines:
                continue

            q_lines = []
            e_lines = []
            in_explain = False
            for line in lines:
                if line.startswith('解') or line.startswith('解：') or line.startswith('解  ：'):
                    in_explain = True
                if in_explain:
                    e_lines.append(line)
                else:
                    q_lines.append(line)

            question_text = '\n'.join(q_lines).strip()
            explanation_text = '\n'.join(e_lines).strip()
            if not question_text:
                continue

            title_base = re.sub(r'[\s_]+', ' ', q_lines[0]).strip(' ：:。')
            title = f'例題{ex_num:02d}：{title_base[:20]}' if title_base else f'例題{ex_num:02d}'
            qid = f'{id_prefix}-{ex_num:02d}'

            tags = [chapter_code, '數線與正負數']
            if topic_tag:
                tags.append(f'topic:{topic_tag}')

            rec = {
                'id': qid,
                'title': title,
                'question_text': question_text,
                'answer_text': '',
                'explanation_text': explanation_text,
                'stage': stage,
                'grade': grade,
                'chapter': chapter_code,
                'chapter_code': chapter_code,
                'difficulty': difficulty,
                'source_type': 'word_import',
                'source_ref': source_ref,
                'tags': tags,
            }
            records.append(rec)

    # De-duplicate by id, keep first.
    seen = set()
    deduped = []
    for r in records:
        if r['id'] in seen:
            continue
        seen.add(r['id'])
        deduped.append(r)
    return deduped


def main():
    parser = argparse.ArgumentParser(description='Convert lecture-style DOCX (例題標記) to question JSONL.')
    parser.add_argument('--docx', required=True)
    parser.add_argument('--chapter-code', required=True)
    parser.add_argument('--id-prefix', required=True)
    parser.add_argument('--source-ref', required=True)
    parser.add_argument('--output-jsonl', required=True)
    parser.add_argument('--output-preview-json', required=True)
    parser.add_argument('--topic-tag', default='')
    args = parser.parse_args()

    docx_path = Path(args.docx)
    paragraphs = read_docx_paragraphs(docx_path)
    records = build_records(
        paragraphs,
        chapter_code=args.chapter_code,
        source_ref=args.source_ref,
        id_prefix=args.id_prefix,
        topic_tag=args.topic_tag,
    )

    out_jsonl = Path(args.output_jsonl)
    out_json = Path(args.output_preview_json)
    out_jsonl.parent.mkdir(parents=True, exist_ok=True)

    with out_jsonl.open('w', encoding='utf-8') as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + '\n')

    preview = {
        'meta': {
            'source_docx': str(docx_path),
            'chapter_code': args.chapter_code,
            'count': len(records),
        },
        'questions': records,
    }
    out_json.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f'Wrote {len(records)} records')
    print(str(out_jsonl))
    print(str(out_json))


if __name__ == '__main__':
    main()
