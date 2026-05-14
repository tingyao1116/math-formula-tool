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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J41等差數列及等差級數困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j41-arithmetic-sequence-series-hard"
MARKDOWN_PATH = WORK_DIR / "j41-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"

SOURCE_REF = "J41等差數列及等差級數困難題題目答案卷.docx"
ID_PREFIX = "q-j41-arithmetic-sequence-series-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j41-arithmetic-sequence-series-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j41-arithmetic-sequence-series-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j41-arithmetic-sequence-series-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、題組": "題組",
    "四、計算": "計算",
    "五、是非": "是非",
}


TOPICS = {
    "seq_definition": ("j4-1-1", "arithmetic-sequence-identify-common-difference", "判別等差數列與公差", "arithmetic-sequence-junior", "等差數列"),
    "seq_first_terms": ("j4-1-1", "arithmetic-sequence-first-terms", "寫出等差數列的前幾項", "arithmetic-sequence-junior", "等差數列"),
    "seq_nth_term": ("j4-1-1", "arithmetic-sequence-nth-term", "等差數列的第 n 項", "arithmetic-sequence-junior", "等差數列"),
    "seq_find_first_index": ("j4-1-1", "arithmetic-sequence-find-first-or-index", "求首項、項數與末項", "arithmetic-sequence-junior", "等差數列"),
    "seq_index_sign": ("j4-1-1", "arithmetic-sequence-index-positive-negative", "第幾項開始為正或負", "arithmetic-sequence-junior", "等差數列"),
    "seq_mean": ("j4-1-1", "arithmetic-mean-basic", "等差中項", "arithmetic-sequence-junior", "等差數列"),
    "seq_properties": ("j4-1-1", "arithmetic-sequence-properties", "等差數列的特性", "arithmetic-sequence-junior", "等差數列"),
    "seq_applications": ("j4-1-1", "arithmetic-sequence-applications", "等差數列的應用", "arithmetic-sequence-junior", "等差數列"),
    "seq_three_numbers": ("j4-1-1", "arithmetic-three-numbers", "三數成等差數列", "arithmetic-sequence-junior", "等差數列"),
    "seq_common_terms": ("j4-1-1", "arithmetic-common-terms", "共同項", "arithmetic-sequence-junior", "等差數列"),
    "series_basic": ("j4-1-3", "arithmetic-series-basic-sum", "等差級數和公式", "arithmetic-series-junior", "等差級數"),
    "series_find_count": ("j4-1-3", "arithmetic-series-find-term-count-first", "先求項數再求等差級數", "arithmetic-series-junior", "等差級數"),
    "series_applications": ("j4-1-3", "arithmetic-series-applications", "等差級數應用", "arithmetic-series-junior", "等差級數"),
    "series_residue": ("j4-1-3", "arithmetic-series-residue-multiples", "餘數與倍數的等差級數", "arithmetic-series-junior", "等差級數"),
    "series_partial": ("j4-1-3", "arithmetic-series-partial-sum-difference", "由前 n 項和反推單項", "arithmetic-series-junior", "等差級數"),
    "series_middle_sum": ("j4-1-3", "arithmetic-series-insert-middle-sum", "等差中間項的和", "arithmetic-series-junior", "等差級數"),
    "series_square_difference": ("j4-1-3", "arithmetic-series-square-difference", "平方差 vs 等差級數", "arithmetic-series-junior", "等差級數"),
}

PARENT_TITLES = {
    "arithmetic-sequence-junior": ("j4-1-1", "等差數列"),
    "arithmetic-series-junior": ("j4-1-3", "等差級數"),
}

TOPIC_EXAMPLE_LIMIT = {
    "arithmetic-sequence-junior": 5,
    "arithmetic-series-junior": 5,
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def run_pandoc(source: Path, markdown_path: Path, force: bool = False) -> None:
    if markdown_path.exists() and not force:
        return
    markdown_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["pandoc", str(source), "-t", "gfm", f"--extract-media={MEDIA_DIR}", "-o", str(markdown_path)],
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
        ref_str = str(path)
        if Path(ref_str).suffix.lower() in {".wmf", ".emf"}:
            ref_str = f"{ref_str}.png"
        return f"[圖:{ref_str}]"

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
    if has_any(compact, ["平方", "100^(2)", "99^(2)", "平方差"]):
        return "series_square_difference"
    if has_any(compact, ["倍數", "被2或3整除", "被2", "被3", "被7", "自然數中", "正整數1到100", "奇數的和", "餘數"]):
        return "series_residue"
    if has_any(compact, ["共同項", "兩數列第", "兩個等差數列"]):
        return "seq_common_terms"
    if has_any(compact, ["前n項和", "前n項之和", "S_(n)", "S_n", "前10項", "前20項", "前30項", "前50項", "第31項至", "由前", "前2n項", "前3n項", "前4n項"]):
        return "series_partial"
    if has_any(compact, ["第13項到第41項的和", "奇數項的和", "偶數項的和", "中間項", "a_(1)＋a_(23)", "a_(2)＋a_(22)"]):
        return "series_middle_sum"
    if has_any(compact, ["級數", "總和", "的和", "求和", "加到", "敲了", "共付", "所有數字的和", "魔術方陣", "每行", "每列"]):
        if has_any(compact, ["項數", "末項", "共有", "最小值", "最大值", "第幾項"]):
            return "series_find_count"
        if has_any(compact, ["掛鐘", "炸彈", "樓梯", "磁磚", "方格", "棋子", "積木", "內角", "多邊形", "相機", "儲蓄", "公司", "老師", "計程車", "班車", "客運", "值班"]):
            return "series_applications"
        return "series_basic"
    if has_any(compact, ["開始為正", "開始為負", "出現負數", "公差小於0"]):
        return "seq_index_sign"
    if has_any(compact, ["等差中項", "中項", "兩數的積", "a、b兩正數"]):
        return "seq_mean"
    if has_any(compact, ["三數成等差", "三邊長", "三位數", "內角度數恰好成一等差", "五數成等差"]):
        return "seq_three_numbers"
    if has_any(compact, ["第n項為m", "第m項為n", "第7項", "第19項", "第6項", "第3項", "第9項", "首項", "公差", "末項", "a_(n)＝", "項數有"]):
        return "seq_find_first_index"
    if has_any(compact, ["第", "項", "a_(1)", "a_(2)", "a_(n)", "坐標", "向右", "向下", "跳第", "第20個"]):
        return "seq_nth_term"
    if has_any(compact, ["規律", "判斷", "不是數列", "不是一個等差", "公差為", "填入適當的數"]):
        return "seq_definition"
    if has_any(compact, ["圖", "排列", "值班", "週", "圓", "機器狗", "保全", "警衛", "燈", "跑道", "箱子", "洗牌", "樓梯", "棋子", "積木", "正方形"]):
        return "seq_applications"
    return "seq_properties"


def score_for_role(row: Dict) -> Tuple[int, int, int]:
    section_score = {"填充": 5, "計算": 5, "題組": 4, "選擇": 3, "是非": 1}.get(row["source_section"], 2)
    text = row["raw_question_text"]
    length = len(text)
    image_penalty = len(re.findall(r"\[圖:", text))
    ideal_length_score = -abs(length - 120) // 40
    return (section_score + ideal_length_score - image_penalty, -image_penalty, -row["source_order"])


def assign_topics(rows: List[Dict]) -> None:
    for row in rows:
        key = classify_topic(row["raw_question_text"], row["source_section"])
        chapter, topic_id, topic_title, parent_id, parent_title = TOPICS[key]
        row.update(
            {
                "topic_key": key,
                "chapter_code": chapter,
                "topic_id": topic_id,
                "topic_title": topic_title,
                "parent_id": parent_id,
                "parent_title": parent_title,
                "role": "",
                "target_level": "",
                "target_id": "",
                "target_title": "",
            }
        )


def assign_roles(rows: List[Dict]) -> None:
    by_parent: Dict[str, List[Dict]] = defaultdict(list)
    by_topic: Dict[str, List[Dict]] = defaultdict(list)
    for row in rows:
        by_parent[row["parent_id"]].append(row)
        by_topic[row["topic_id"]].append(row)

    for parent_id, items in by_parent.items():
        limit = TOPIC_EXAMPLE_LIMIT.get(parent_id, 4)
        preferred = sorted(items, key=score_for_role, reverse=True)
        for row in preferred[:limit]:
            row.update({"role": "範例", "target_level": "topic", "target_id": parent_id, "target_title": PARENT_TITLES[parent_id][1]})

    for topic_id, items in by_topic.items():
        available = [row for row in sorted(items, key=score_for_role, reverse=True) if not row["role"]]
        for row in available[:2]:
            row.update({"role": "範例", "target_level": "branch", "target_id": row["topic_id"], "target_title": row["topic_title"]})
        for row in available[2:5]:
            row.update({"role": "練習", "target_level": "branch", "target_id": row["topic_id"], "target_title": row["topic_title"]})

    for row in rows:
        if row["role"]:
            continue
        row["role"] = "習題" if row["source_section"] in {"填充", "題組", "計算"} else "題庫"
        row["target_level"] = "chapter"
        row["target_id"] = row["chapter_code"]
        row["target_title"] = row["chapter_code"]


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["source_section"] in {"題組", "計算"}:
        return "偏難"
    if row["role"] in {"範例", "練習"}:
        return "中等偏難"
    if row["source_section"] == "是非":
        return "中等"
    return "中等"


def make_question(row: Dict) -> Dict:
    qid = f"{ID_PREFIX}-{row['source_order']:03d}"
    role = row["role"]
    group = {
        ("範例", "topic"): "topic-example",
        ("範例", "branch"): "branch-example",
        ("練習", "branch"): "branch-practice",
        ("習題", "chapter"): "chapter-exercise",
        ("題庫", "chapter"): "chapter-bank",
    }.get((role, row["target_level"]), f"chapter-{role_slug(role)}")
    tags = [
        "J41",
        row["chapter_code"],
        "等差數列及等差級數",
        f"role:{role_slug(role)}",
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
        "title": f"J41 {row['source_section']}第{row['source_number']:02d}題",
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
        "question_role": role,
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
    if level in {"topic", "branch"}:
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

    run_pandoc(SOURCE_DOCX, MARKDOWN_PATH, force=args.force_pandoc)
    markdown = MARKDOWN_PATH.read_text(encoding="utf-8")
    rows = parse_markdown(markdown)
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
            "習題": "剩餘填充、題組、計算題放回章節代號。",
            "題庫": "剩餘選擇、是非題放回章節代號。",
        },
        "by_role": dict(Counter(q["question_role"] for q in questions)),
        "by_chapter": dict(Counter(q["chapter_code"] for q in questions)),
        "by_section": dict(Counter(q["source_section"] for q in questions)),
        "by_target_level": dict(Counter(q["target_level"] for q in questions)),
        "samples": questions[:12],
    }
    OUT_PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    OUT_PREVIEW.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: preview[k] for k in ["source_docx", "source_ref", "question_count", "link_count", "output_questions", "output_links", "answer_marker_policy", "role_policy"]}, ensure_ascii=False, indent=2))
    print(json.dumps({k: preview[k] for k in ["by_role", "by_chapter", "by_section", "by_target_level"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
