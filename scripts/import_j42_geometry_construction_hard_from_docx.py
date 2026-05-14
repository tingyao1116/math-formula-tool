#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import importlib.util
import json
import re
import subprocess
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J42幾何圖形與尺規作圖困難題題目答案卷.docx")
WORK_DIR = ROOT / "exports" / "j42-geometry-construction-hard"
MEDIA_DIR = WORK_DIR / "media"
MARKDOWN_PATH = WORK_DIR / "j42-pandoc.md"
OUT_DIR = ROOT / "program-db" / "imports"

SOURCE_REF = "J42幾何圖形與尺規作圖困難題題目答案卷.docx"
ID_PREFIX = "q-j42-geometry-construction-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j42-geometry-construction-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j42-geometry-construction-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j42-geometry-construction-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、證明": "證明",
    "四、作圖": "作圖",
    "五、計算": "計算",
    "六、是非": "是非",
}

TOPICS = {
    "line_ray_segment": ("j4-3-1", "j4-3-1-line-ray-segment", "直線、射線與線段"),
    "angle_basic": ("j4-3-1", "j4-3-1-angle-basic-type", "角的分類與度數"),
    "complement_supplement": ("j4-3-1", "j4-3-1-complement-supplement", "餘角與補角"),
    "polygon_sum": ("j4-3-1", "j4-3-1-polygon-interior-sum", "多邊形內角和"),
    "polygon_diagonal": ("j4-3-1", "j4-3-1-polygon-diagonal", "多邊形對角線數"),
    "regular_polygon": ("j4-3-1", "j4-3-1-regular-polygon-angle", "正多邊形內角與外角"),
    "triangle_sum": ("j4-3-1", "j4-3-1-triangle-interior-sum", "三角形內角和"),
    "triangle_exterior": ("j4-3-1", "j4-3-1-triangle-exterior-theorem", "三角形外角定理"),
    "isosceles": ("j4-3-1", "j4-3-1-isosceles-triangle-angle", "等腰三角形角度關係"),
    "equilateral": ("j4-3-1", "j4-3-1-equilateral-triangle-angle", "等邊三角形角度性質"),
    "angle_chasing": ("j4-3-1", "j4-3-1-angle-chasing-strategy", "角度追蹤解題策略"),
    "geometry_application": ("j4-3-1", "j4-3-1-geometry-word-application", "幾何情境應用"),
    "tools_rules": ("j4-3-2", "j4-3-2-tools-and-rules", "尺規作圖工具與規則"),
    "copy_segment": ("j4-3-2", "j4-3-2-copy-segment", "複製線段長度"),
    "midpoint_bisector": ("j4-3-2", "j4-3-2-midpoint-bisector", "線段中點與中垂線"),
    "perpendicular": ("j4-3-2", "j4-3-2-perpendicular-construction", "過點作垂線"),
    "parallel": ("j4-3-2", "j4-3-2-parallel-construction", "過點作平行線"),
    "angle_bisector": ("j4-3-2", "j4-3-2-angle-bisector-construction", "角平分線作圖"),
    "triangle_sss": ("j4-3-2", "j4-3-2-triangle-sss", "三邊已知作三角形（SSS）"),
    "triangle_sas": ("j4-3-2", "j4-3-2-triangle-sas", "兩邊夾角作三角形（SAS）"),
    "triangle_asa": ("j4-3-2", "j4-3-2-triangle-asa", "兩角一邊作三角形（ASA）"),
    "construction_check": ("j4-3-2", "j4-3-2-construction-check", "作圖驗證與書寫"),
}

CHAPTER_TITLES = {
    "j4-3-1": "三角形與多邊形",
    "j4-3-2": "尺規作圖",
}

TOPIC_EXAMPLE_LIMIT = {
    "j4-3-1": 5,
    "j4-3-2": 5,
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def run_pandoc(force: bool = False) -> None:
    if MARKDOWN_PATH.exists() and not force:
        return
    MARKDOWN_PATH.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["pandoc", str(SOURCE_DOCX), "-t", "gfm", f"--extract-media={MEDIA_DIR}", "-o", str(MARKDOWN_PATH)],
        cwd=ROOT,
        check=True,
    )


def strip_answer_marker(text: str) -> str:
    return re.sub(r"^\s*[（(]\s*\n?\s*[）)](?!\^)\s*", "", text or "").strip()


def normalize_image_refs(text: str) -> str:
    def repl(match: re.Match) -> str:
        ref = match.group(1).replace("−", "-").replace("\\", "/")
        path = Path(ref)
        if not path.is_absolute():
            path = (ROOT / ref).resolve()
        out = str(path)
        if Path(out).suffix.lower() in {".wmf", ".emf"}:
            out = f"{out}.png"
        return f"[圖:{out}]"

    return re.sub(r"\[圖:([^\]]+)\]", repl, text or "")


def clean_text(text: str, section: str) -> str:
    cleaned = normalize_image_refs(j11_helpers.clean_markup(text))
    cleaned = cleaned.replace("\U0001F7A8", "□")
    if section in {"選擇", "是非"}:
        cleaned = strip_answer_marker(cleaned)
    return cleaned


def parse_markdown(markdown: str) -> List[Dict]:
    heading_re = re.compile(r"^\*\*(" + "|".join(re.escape(k) for k in SECTION_LABELS) + r")\*\*\s*$", re.M)
    headings = list(heading_re.finditer(markdown))
    rows: List[Dict] = []
    order = 0
    for h_idx, heading in enumerate(headings):
        section_label = SECTION_LABELS[heading.group(1)]
        start = heading.end()
        end = headings[h_idx + 1].start() if h_idx + 1 < len(headings) else len(markdown)
        section_text = markdown[start:end]
        starts = list(re.finditer(r"(?m)^(\d+)\.\s", section_text))
        for idx, q_start in enumerate(starts):
            q_end = starts[idx + 1].start() if idx + 1 < len(starts) else len(section_text)
            raw = section_text[q_start.start():q_end].strip()
            number, block = j11_helpers.strip_question_number(raw)
            if "《答案》" not in block:
                continue
            q_part, after_answer = block.split("《答案》", 1)
            answer_part, explain_part = after_answer.split("詳解：", 1) if "詳解：" in after_answer else (after_answer, "")
            question_text = clean_text(q_part, section_label)
            if not question_text:
                continue
            order += 1
            rows.append(
                {
                    "source_section": section_label,
                    "source_number": number,
                    "source_order": order,
                    "raw_question_text": question_text,
                    "answer_text": normalize_image_refs(j11_helpers.clean_markup(answer_part)).replace("\U0001F7A8", "□"),
                    "explanation_text": normalize_image_refs(j11_helpers.clean_markup(explain_part)).replace("\U0001F7A8", "□"),
                }
            )
    return rows


def compact_text(text: str) -> str:
    return re.sub(r"\s+", "", text or "")


def has_any(text: str, words: List[str]) -> bool:
    return any(word in text for word in words)


def classify_topic(text: str, section: str) -> str:
    compact = compact_text(text)
    if section == "作圖" or has_any(compact, ["尺規", "作圖", "畫出", "作一", "作出", "步驟"]):
        if has_any(compact, ["角平分", "平分角"]):
            return "angle_bisector"
        if has_any(compact, ["垂直平分", "中垂線", "中點"]):
            return "midpoint_bisector"
        if has_any(compact, ["垂線", "垂直"]):
            return "perpendicular"
        if has_any(compact, ["平行線", "平行"]):
            return "parallel"
        if has_any(compact, ["三邊", "SSS"]):
            return "triangle_sss"
        if has_any(compact, ["兩邊夾角", "SAS"]):
            return "triangle_sas"
        if has_any(compact, ["兩角一邊", "一邊兩角", "ASA", "AAS"]):
            return "triangle_asa"
        if has_any(compact, ["複製", "等長", "線段"]):
            return "copy_segment"
        if has_any(compact, ["理由", "驗證", "是否合法", "正確"]):
            return "construction_check"
        return "tools_rules"

    if has_any(compact, ["弧長", "扇形", "圓周", "滾動", "軌跡", "圓心角"]):
        return "geometry_application"
    if has_any(compact, ["正多邊形", "正三角形", "正方形", "正五邊形", "正六邊形", "正八邊形", "每個內角", "每一外角"]):
        if has_any(compact, ["正三角形", "等邊"]):
            return "equilateral"
        return "regular_polygon"
    if has_any(compact, ["對角線"]):
        return "polygon_diagonal"
    if has_any(compact, ["多邊形", "內角和", "外角和", "n邊形", "邊形"]):
        return "polygon_sum"
    if has_any(compact, ["餘角", "補角", "互餘", "互補"]):
        return "complement_supplement"
    if has_any(compact, ["等腰", "腰", "底角"]):
        return "isosceles"
    if has_any(compact, ["等邊", "正三角形"]):
        return "equilateral"
    if has_any(compact, ["外角", "延長"]):
        return "triangle_exterior"
    if has_any(compact, ["三角形", "∠A", "∠B", "∠C", "內角"]):
        if has_any(compact, ["證明", "求證"]):
            return "triangle_sum"
        return "angle_chasing"
    if has_any(compact, ["直線", "射線", "線段", "交於", "相交"]):
        return "line_ray_segment"
    if has_any(compact, ["銳角", "直角", "鈍角", "平角", "周角", "角度", "度"]):
        return "angle_basic"
    return "angle_chasing"


def score_for_role(row: Dict) -> Tuple[int, int, int]:
    section_score = {"計算": 6, "證明": 6, "作圖": 5, "填充": 4, "選擇": 3, "是非": 1}.get(row["source_section"], 2)
    image_penalty = len(re.findall(r"\[圖:", row["raw_question_text"]))
    ideal = -abs(len(row["raw_question_text"]) - 150) // 60
    return (section_score + ideal - image_penalty, -image_penalty, -row["source_order"])


def assign_topics(rows: List[Dict]) -> None:
    for row in rows:
        key = classify_topic(row["raw_question_text"], row["source_section"])
        chapter, topic_id, topic_title = TOPICS[key]
        row.update(
            {
                "topic_key": key,
                "chapter_code": chapter,
                "topic_id": topic_id,
                "topic_title": topic_title,
                "role": "",
                "target_level": "",
                "target_id": "",
                "target_title": "",
            }
        )


def assign_roles(rows: List[Dict]) -> None:
    by_chapter: Dict[str, List[Dict]] = defaultdict(list)
    by_topic: Dict[str, List[Dict]] = defaultdict(list)
    for row in rows:
        by_chapter[row["chapter_code"]].append(row)
        by_topic[row["topic_id"]].append(row)

    for chapter_code, items in by_chapter.items():
        for row in sorted(items, key=score_for_role, reverse=True)[: TOPIC_EXAMPLE_LIMIT.get(chapter_code, 4)]:
            row.update({"role": "範例", "target_level": "chapter", "target_id": chapter_code, "target_title": CHAPTER_TITLES[chapter_code]})

    for topic_id, items in by_topic.items():
        available = [row for row in sorted(items, key=score_for_role, reverse=True) if not row["role"]]
        for row in available[:2]:
            row.update({"role": "範例", "target_level": "branch", "target_id": row["topic_id"], "target_title": row["topic_title"]})
        for row in available[2:5]:
            row.update({"role": "練習", "target_level": "branch", "target_id": row["topic_id"], "target_title": row["topic_title"]})

    for row in rows:
        if row["role"]:
            continue
        row["role"] = "習題" if row["source_section"] in {"填充", "證明", "作圖", "計算"} else "題庫"
        row["target_level"] = "chapter"
        row["target_id"] = row["chapter_code"]
        row["target_title"] = CHAPTER_TITLES[row["chapter_code"]]


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["source_section"] in {"證明", "作圖", "計算"}:
        return "偏難"
    if row["role"] in {"範例", "練習"}:
        return "中等偏難"
    return "中等"


def make_question(row: Dict) -> Dict:
    qid = f"{ID_PREFIX}-{row['source_order']:03d}"
    group = {
        ("範例", "chapter"): "chapter-example",
        ("範例", "branch"): "branch-example",
        ("練習", "branch"): "branch-practice",
        ("習題", "chapter"): "chapter-exercise",
        ("題庫", "chapter"): "chapter-bank",
    }.get((row["role"], row["target_level"]), f"chapter-{role_slug(row['role'])}")
    tags = [
        "J42",
        row["chapter_code"],
        "幾何圖形與尺規作圖",
        f"role:{role_slug(row['role'])}",
        f"group:{group}",
        f"source-section:{row['source_section']}",
        f"topic:{row['topic_id']}",
        f"branch:{row['topic_title']}",
    ]
    if row["target_level"] == "branch":
        tags.append(f"branch-topic:{row['topic_id']}")
    if row["target_level"] == "chapter":
        tags.append("chapter-only")
    return {
        "id": qid,
        "title": f"J42 {row['source_section']}第{row['source_number']:02d}題",
        "question_text": row["raw_question_text"],
        "answer_text": row["answer_text"],
        "explanation_text": row["explanation_text"],
        "stage": "國中",
        "grade": "國二",
        "chapter": row["chapter_code"],
        "chapter_code": row["chapter_code"],
        "difficulty": difficulty_for(row),
        "source_type": "word_docx_import",
        "source_ref": SOURCE_REF,
        "question_role": row["role"],
        "target_level": row["target_level"],
        "target_id": row["target_id"],
        "target_title": row["target_title"],
        "source_section": row["source_section"],
        "source_number": row["source_number"],
        "source_order": row["source_order"],
        "tags": tags,
    }


def make_link(question: Dict) -> Dict:
    level = question.get("target_level", "chapter")
    chapter_code = question["chapter_code"]
    qid = question["id"]
    if level == "branch":
        topic_id, link_level, target = question["target_id"], "topic", question["target_id"]
    else:
        topic_id, link_level, target = "", "chapter", chapter_code
    return {
        "id": re.sub(r"[^A-Za-z0-9_-]+", "-", f"link-{qid}-{link_level}-{target}").strip("-").lower(),
        "title": f"{qid} -> {target}",
        "question_id": qid,
        "question_title": question.get("title", ""),
        "topic_id": topic_id,
        "chapter_code": chapter_code,
        "link_level": link_level,
        "source_type": "manual-docx-structured-pack",
        "source_ref": SOURCE_REF,
        "confidence": 1.0 if topic_id else 0.9,
        "created_at": now_iso(),
        "updated_at": now_iso(),
        "tags": [],
    }


def write_jsonl(path: Path, records: List[Dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(json.dumps(record, ensure_ascii=False) for record in records) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force-pandoc", action="store_true")
    args = parser.parse_args()

    run_pandoc(force=args.force_pandoc)
    rows = parse_markdown(MARKDOWN_PATH.read_text(encoding="utf-8"))
    assign_topics(rows)
    assign_roles(rows)
    questions = [make_question(row) for row in rows]
    links = [make_link(question) for question in questions]

    write_jsonl(OUT_QUESTIONS, questions)
    write_jsonl(OUT_LINKS, links)

    preview = {
        "source_docx": str(SOURCE_DOCX),
        "source_ref": SOURCE_REF,
        "question_count": len(questions),
        "link_count": len(links),
        "output_questions": str(OUT_QUESTIONS.relative_to(ROOT)).replace("\\", "/"),
        "output_links": str(OUT_LINKS.relative_to(ROOT)).replace("\\", "/"),
        "answer_marker_policy": "選擇題與是非題題幹開頭的（ ）作答括號已移除。",
        "role_policy": {
            "範例": "章節主題保留 3-5 題中等示範題；分支再保留 2 題示範題。",
            "練習": "各分支保留最多 3 題中等或偏難練習。",
            "習題": "剩餘填充、證明、作圖、計算題放回章節代號。",
            "題庫": "剩餘選擇、是非題放回章節代號。",
        },
        "by_role": dict(Counter(q["question_role"] for q in questions)),
        "by_chapter": dict(Counter(q["chapter_code"] for q in questions)),
        "by_section": dict(Counter(q["source_section"] for q in questions)),
        "by_target_level": dict(Counter(q["target_level"] for q in questions)),
        "samples": questions[:12],
    }
    OUT_PREVIEW.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: preview[k] for k in ["source_docx", "source_ref", "question_count", "link_count", "output_questions", "output_links", "answer_marker_policy", "role_policy"]}, ensure_ascii=False, indent=2))
    print(json.dumps({k: preview[k] for k in ["by_role", "by_chapter", "by_section", "by_target_level"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
