import csv
import html
import json
import os
import re


BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FORMULA_DATA_PATH = os.path.join(BASE, "formula-data.js")
FORMULAS_PATH = os.path.join(BASE, "formulas.js")
EXPORT_DIR = os.path.join(BASE, "exports")


def extract_object(src, name):
    match = re.search(rf"const\s+{re.escape(name)}\s*=\s*\{{", src)
    if not match:
        return {}
    index = match.end() - 1
    depth = 0
    start = index
    body = ""
    for pos in range(index, len(src)):
        char = src[pos]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                body = src[start + 1 : pos]
                break
    result = {}
    for line in body.splitlines():
        line = line.strip().rstrip(",")
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip().strip("\"'")
        value = value.strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            result[key] = value[1:-1]
    return result


def extract_array_map(src, name):
    match = re.search(rf"const\s+{re.escape(name)}\s*=\s*\{{", src)
    if not match:
        return {}
    index = match.end() - 1
    depth = 0
    start = index
    body = ""
    for pos in range(index, len(src)):
        char = src[pos]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                body = src[start + 1 : pos]
                break
    result = {}
    key = None
    collecting = False
    items = []
    for raw in body.splitlines():
        line = raw.strip()
        if not line:
            continue
        if not collecting:
            open_match = re.match(r"""["'](.+?)["']\s*:\s*\[""", line)
            if open_match:
                key = open_match.group(1)
                items = []
                if "]" in line:
                    result[key] = re.findall(r"""["']([^"']+)["']""", line.split("[", 1)[1])
                    key = None
                else:
                    collecting = True
        else:
            items.extend(re.findall(r"""["']([^"']+)["']""", line))
            if "]" in line:
                result[key] = items[:]
                key = None
                items = []
                collecting = False
    return result


def extract_curriculum_overrides(src):
    match = re.search(r"const\s+curriculumOverrides\s*=\s*\{", src)
    if not match:
        return {}
    index = match.end() - 1
    depth = 0
    start = index
    body = ""
    for pos in range(index, len(src)):
        char = src[pos]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                body = src[start + 1 : pos]
                break
    result = {}
    entry_pattern = re.compile(r'"([^"]+)"\s*:\s*\{(.*?)\}\s*,?', re.S)
    for item_id, object_body in entry_pattern.findall(body):
        item = {}
        for field in ("stage", "grade", "term", "chapter", "domain"):
            field_match = re.search(rf'\b{field}\s*:\s*"([^"]*)"', object_body)
            if field_match:
                item[field] = field_match.group(1)
        result[item_id] = item
    return result


def split_seq_key(key):
    parts = key.split("-")
    if len(parts) >= 4:
        return parts[0], parts[1], parts[2], "-".join(parts[3:])
    if len(parts) == 3:
        return parts[0], parts[1], "", parts[2]
    return "", "", "", key


def build_rows():
    with open(FORMULA_DATA_PATH, "r", encoding="utf-8") as file:
        formula_data_source = file.read()
    with open(FORMULAS_PATH, "r", encoding="utf-8") as file:
        formulas_source = file.read()

    chapter_sequence = extract_array_map(formula_data_source, "chapterSequence")
    chapter_code_map = extract_object(formula_data_source, "chapterCodeMap")
    topic_parent_overrides = extract_object(formula_data_source, "topicParentOverrides")
    curriculum_overrides = extract_curriculum_overrides(formula_data_source)

    id_to_title = {}
    current_id = None
    for line in formulas_source.splitlines():
        id_match = re.search(r'\bid:\s*"([^"]+)"', line)
        if id_match:
            current_id = id_match.group(1)
            continue
        if current_id:
            title_match = re.search(r'\btitle:\s*"([^"]+)"', line)
            if title_match:
                id_to_title[current_id] = title_match.group(1)
                current_id = None

    children_by_parent = {}
    for child_id, parent_id in topic_parent_overrides.items():
        children_by_parent.setdefault(parent_id, []).append(child_id)
    for parent_id in children_by_parent:
        children_by_parent[parent_id].sort(key=lambda item_id: id_to_title.get(item_id, item_id))

    chapter_topics = {}
    for item_id, meta in curriculum_overrides.items():
        full_key = "-".join(
            [
                part
                for part in [
                    meta.get("stage", ""),
                    meta.get("grade", ""),
                    meta.get("term", ""),
                    meta.get("chapter", ""),
                ]
                if part
            ]
        )
        chapter_topics.setdefault(full_key, []).append(item_id)
    for full_key in chapter_topics:
        chapter_topics[full_key].sort(key=lambda item_id: id_to_title.get(item_id, item_id))

    grade_order = ["國小", "國一", "國二", "國三", "高一", "高二", "高三", "其他"]
    term_order = {"上學期": 1, "下學期": 2, "": 3}

    sorted_seq_keys = sorted(
        chapter_sequence.keys(),
        key=lambda key: (
            grade_order.index(split_seq_key(key)[1])
            if split_seq_key(key)[1] in grade_order
            else 99,
            term_order.get(split_seq_key(key)[2], 99),
            key,
        ),
    )

    rows = []
    markdown_lines = ["# 章節 → 主題 → 分支", ""]

    for seq_key in sorted_seq_keys:
        stage, grade, term, _ = split_seq_key(seq_key)
        markdown_lines.append(f"## {stage}・{grade}{('・' + term) if term else ''}")
        for chapter in chapter_sequence.get(seq_key, []):
            full_key = "-".join([part for part in [stage, grade, term, chapter] if part])
            code = chapter_code_map.get(full_key, "")
            topic_ids = chapter_topics.get(full_key, [])
            top_topic_ids = [item_id for item_id in topic_ids if item_id not in topic_parent_overrides]
            markdown_lines.append(f"- {code} {chapter}".strip())

            if not top_topic_ids:
                rows.append(
                    {
                        "學層": stage,
                        "年級": grade,
                        "學期": term,
                        "章碼": code,
                        "章節名稱": chapter,
                        "主題": "",
                        "主題id": "",
                        "分支": "",
                        "分支id": "",
                    }
                )
                continue

            for topic_id in top_topic_ids:
                topic_title = id_to_title.get(topic_id, topic_id)
                branch_ids = children_by_parent.get(topic_id, [])
                markdown_lines.append(f"  - 主題：{topic_title} ({topic_id})")
                if not branch_ids:
                    rows.append(
                        {
                            "學層": stage,
                            "年級": grade,
                            "學期": term,
                            "章碼": code,
                            "章節名稱": chapter,
                            "主題": topic_title,
                            "主題id": topic_id,
                            "分支": "",
                            "分支id": "",
                        }
                    )
                else:
                    first_branch = True
                    for branch_id in branch_ids:
                        branch_title = id_to_title.get(branch_id, branch_id)
                        markdown_lines.append(f"    - 分支：{branch_title} ({branch_id})")
                        rows.append(
                            {
                                "學層": stage if first_branch else "",
                                "年級": grade if first_branch else "",
                                "學期": term if first_branch else "",
                                "章碼": code if first_branch else "",
                                "章節名稱": chapter if first_branch else "",
                                "主題": topic_title if first_branch else "",
                                "主題id": topic_id if first_branch else "",
                                "分支": branch_title,
                                "分支id": branch_id,
                            }
                        )
                        first_branch = False
        markdown_lines.append("")

    return rows, markdown_lines


def write_outputs(rows, markdown_lines):
    os.makedirs(EXPORT_DIR, exist_ok=True)
    json_path = os.path.join(EXPORT_DIR, "structure-tree-full.json")
    md_path = os.path.join(EXPORT_DIR, "structure-tree-full-fixed.md")
    tsv_path = os.path.join(EXPORT_DIR, "structure-tree-full.tsv")
    html_path = os.path.join(EXPORT_DIR, "structure-tree-full.html")

    with open(json_path, "w", encoding="utf-8") as file:
        json.dump(rows, file, ensure_ascii=False, indent=2)

    with open(md_path, "w", encoding="utf-8") as file:
        file.write("\n".join(markdown_lines))

    with open(tsv_path, "w", encoding="utf-16", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["學層", "年級", "學期", "章碼", "章節名稱", "主題", "主題id", "分支", "分支id"],
            delimiter="\t",
        )
        writer.writeheader()
        writer.writerows(rows)

    sections = []
    for row in rows:
        stage = row["學層"]
        grade = row["年級"]
        term = row["學期"]
        code = row["章碼"]
        chapter = row["章節名稱"]
        topic = row["主題"]
        topic_id = row["主題id"]
        branch = row["分支"]
        branch_id = row["分支id"]

        key = (stage, grade, term, code, chapter)
        if not sections or sections[-1]["key"] != key:
            sections.append(
                {
                    "key": key,
                    "學層": stage,
                    "年級": grade,
                    "學期": term,
                    "章碼": code,
                    "章節名稱": chapter,
                    "topics": [],
                }
            )
        section = sections[-1]
        if topic:
            section["topics"].append({"title": topic, "id": topic_id, "branches": []})
        if branch:
            if not section["topics"]:
                section["topics"].append({"title": "", "id": "", "branches": []})
            section["topics"][-1]["branches"].append({"title": branch, "id": branch_id})

    html_parts = [
        '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        "<title>章節主題分支結構</title>",
        """<style>
body{font-family:"Microsoft JhengHei","Noto Sans TC",sans-serif;margin:24px;background:#fbf6ee;color:#3d2a1a}
h1{font-size:28px;margin:0 0 16px}
.note{color:#6f5b4b;margin-bottom:20px}
.section{background:#fffaf4;border:1px solid #eadfce;border-radius:18px;padding:18px 20px;margin:0 0 18px;box-shadow:0 8px 20px rgba(120,90,50,.06)}
.sec-head{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:10px}
.code{font-weight:700;color:#8a4d12}
.chapter{font-size:22px;font-weight:700}
.meta{color:#7b6a58;font-size:14px}
ul{margin:8px 0 0 20px;padding:0}
li{margin:6px 0}
.topic{font-weight:700}
.topic-id,.branch-id{color:#8a7d6f;font-size:13px}
.branch-list{margin-top:4px}
.empty{color:#a08f7d}
</style></head><body>""",
        "<h1>章節 → 主題 → 分支</h1>",
        '<div class="note">這份是目前網站資料的結構快照，先拿來確認架構是不是你要的。</div>',
    ]

    for section in sections:
        term_text = f"・{html.escape(section['學期'])}" if section["學期"] else ""
        html_parts.append('<section class="section">')
        html_parts.append(
            f'<div class="sec-head"><div class="code">{html.escape(section["章碼"] or "")}</div>'
            f'<div class="chapter">{html.escape(section["章節名稱"] or "")}</div></div>'
        )
        html_parts.append(
            f'<div class="meta">{html.escape(section["學層"])}・{html.escape(section["年級"])}{term_text}</div>'
        )
        if not section["topics"]:
            html_parts.append('<div class="empty">目前這一章還沒有主題。</div>')
        else:
            html_parts.append("<ul>")
            for topic in section["topics"]:
                html_parts.append(
                    f'<li><span class="topic">{html.escape(topic["title"] or "未命名主題")}</span> '
                    f'<span class="topic-id">{html.escape(topic["id"] or "")}</span>'
                )
                if topic["branches"]:
                    html_parts.append('<ul class="branch-list">')
                    for branch in topic["branches"]:
                        html_parts.append(
                            f'<li>{html.escape(branch["title"])} '
                            f'<span class="branch-id">{html.escape(branch["id"] or "")}</span></li>'
                        )
                    html_parts.append("</ul>")
                html_parts.append("</li>")
            html_parts.append("</ul>")
        html_parts.append("</section>")

    html_parts.append("</body></html>")
    with open(html_path, "w", encoding="utf-8") as file:
        file.write("".join(html_parts))

    return json_path, md_path, tsv_path, html_path


if __name__ == "__main__":
    rows, markdown_lines = build_rows()
    outputs = write_outputs(rows, markdown_lines)
    for path in outputs:
        print(path)
    print(f"rows={len(rows)}")
