#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import re
import subprocess
import unicodedata
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DOCX = Path(r"E:\備份資料\張快數學\哈特例高中數學講義\108課綱\教材重點\1-1轉.docx")
SOURCE_REF = "1-1轉.docx"
CHAPTER_CODE = "s1-1-1"
ID_PREFIX = "q-s1-1-1-real-number-word01"

OUT_DIR = ROOT / "program-db" / "imports"
OUT_QUESTIONS = OUT_DIR / "question" / f"{ID_PREFIX}.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / f"{ID_PREFIX}.links.jsonl"
OUT_PREVIEW = OUT_DIR / f"{ID_PREFIX}.preview.json"
WORK_DIR = ROOT / "exports" / "s1-1-real-number-word"
PLAIN_PATH = WORK_DIR / "1-1轉.plain.txt"

QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"

TOPIC_TITLES = {
    "senior-rational-number-definition": "有理數的定義與性質",
    "senior-decimal-type-rational": "有限小數與循環小數",
    "senior-repeating-decimal-to-fraction": "循環小數化分數",
    "senior-terminating-decimal-denominator-test": "有限小數的分母判斷",
    "senior-rational-density": "有理數的稠密性",
    "senior-rounding-rational-constraints": "四捨五入反推分數",
    "senior-irrational-number-basics": "無理數",
    "senior-irrational-operations": "無理數四則與封閉性陷阱",
    "senior-proof-irrational-square-root-two": "根號 2 為無理數的反證法",
    "senior-real-line-interval-notation": "實數與數線",
    "senior-real-number-interval-compare": "實數大小比較與夾值",
    "senior-arithmetic-geometric-mean": "算術平均與幾何平均",
    "senior-square-root-perfect-square": "平方根與完全平方數",
    "senior-radical-comparison-methods": "根式大小比較方法",
    "senior-distance-midpoint-section-formulas": "距離與分點公式",
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def normalize_for_match(text: str) -> str:
    return unicodedata.normalize("NFKC", text or "").replace("離", "離")


def run_pandoc(source: Path, output: Path, force: bool = False) -> None:
    if output.exists() and not force:
        return
    output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["pandoc", str(source), "-t", "plain", "-o", str(output)],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )


def clean_plain_line(line: str) -> str:
    text = line.rstrip()
    if not text.strip():
        return ""
    if re.fullmatch(r"[+\-:|=\s]+", text):
        return ""
    stripped = text.strip()
    if stripped.startswith("|"):
        stripped = stripped[1:]
        if stripped.endswith("|"):
            stripped = stripped[:-1]
        text = stripped
    return re.sub(r"\s+", " ", text).strip()


def load_clean_lines(path: Path) -> List[str]:
    raw = path.read_text(encoding="utf-8").splitlines()
    return [line for raw_line in raw if (line := clean_plain_line(raw_line))]


def is_marker(line: str) -> bool:
    return bool(re.fullmatch(r"範例\d+|隨堂練習", line.strip()))


def marker_info(line: str, practice_count: int) -> Tuple[str, int, str]:
    if line.startswith("範例"):
        number = int(re.search(r"\d+", line).group(0))
        return "範例", number, "example"
    return "隨堂練習", practice_count, "classwork"


def is_topic_heading(line: str) -> bool:
    return bool(re.match(r"^主題\d+[：:]?.+", normalize_for_match(line)))


def topic_theme(line: str) -> str:
    text = normalize_for_match(line)
    if "有理數" in text:
        return "rational"
    if "無理數" in text:
        return "irrational"
    if "距離" in text and "分點" in text:
        return "distance"
    if "實數" in text and "數線" in text:
        return "real_line"
    return "real"


def split_question_explanation(lines: List[str]) -> Tuple[str, str]:
    split_at = None
    for i, line in enumerate(lines):
        if re.match(r"^【(解析|證明)】", line):
            split_at = i
            break
    if split_at is None:
        return "\n".join(lines).strip(), ""

    question = "\n".join(lines[:split_at]).strip()
    explanation_lines = lines[split_at:]
    if explanation_lines:
        explanation_lines[0] = re.sub(r"^【(解析|證明)】\s*", "", explanation_lines[0]).strip()
    return question, "\n".join(line for line in explanation_lines if line).strip()


def classify_topic(theme: str, question: str, explanation: str) -> str:
    blob = normalize_for_match(f"{question}\n{explanation}")
    compact = re.sub(r"\s+", "", blob)

    if theme == "rational":
        if "四捨五入" in compact:
            return "senior-rounding-rational-constraints"
        if "有限小數" in compact or "質因數" in compact or "分母" in compact:
            return "senior-terminating-decimal-denominator-test"
        if "循環小數" in compact or "overline" in compact or "小數點" in compact:
            return "senior-repeating-decimal-to-fraction"
        if "介於" in compact or "稠密" in compact:
            return "senior-rational-density"
        return "senior-rational-number-definition"

    if theme == "irrational":
        if "證明" in compact or "反證" in compact:
            return "senior-proof-irrational-square-root-two"
        if "何者" in compact or "恆真" in compact or "四則" in compact:
            return "senior-irrational-operations"
        return "senior-irrational-number-basics"

    if theme == "real_line":
        if "黃金" in compact or "算幾" in compact or "平均" in compact:
            return "senior-arithmetic-geometric-mean"
        if "尺規" in compact or "作圖" in compact or "半圓" in compact or "單位長" in compact:
            return "senior-real-line-interval-notation"
        if "sqrt" in compact and ("大小" in compact or "平方" in compact):
            return "senior-radical-comparison-methods"
        if "sqrt[n]" in compact or "sqrt[3]" in compact or "可以尺規" in compact:
            return "senior-square-root-perfect-square"
        if "範圍" in compact or "何者" in compact or "≤" in compact or "<" in compact:
            return "senior-real-number-interval-compare"
        return "senior-real-line-interval-notation"

    if theme == "distance":
        return "senior-distance-midpoint-section-formulas"

    return "senior-real-number-overview"


def difficulty_for(role: str, question: str) -> str:
    text = normalize_for_match(question)
    if any(word in text for word in ["證明", "恆真", "黃金", "範圍", "寶可夢"]):
        return "進階"
    if role == "隨堂練習":
        return "中等"
    return "基礎"


def compact_title_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text or "").strip()
    cleaned = cleaned.replace("____________", "")
    return cleaned.strip(" ：:。")


def make_title(role: str, source_number: int, question_text: str) -> str:
    lead = compact_title_text(question_text)
    return f"{role}{source_number:02d}：{lead[:36]}" if lead else f"{role}{source_number:02d}"


def parse_records(lines: List[str]) -> List[Dict]:
    rows: List[Dict] = []
    current_topic = ""
    current_theme = ""
    practice_counter_by_topic: Counter[str] = Counter()
    i = 0
    source_order = 0

    while i < len(lines):
        line = lines[i]
        if is_topic_heading(line):
            current_topic = line
            current_theme = topic_theme(line)
            i += 1
            continue
        if not is_marker(line):
            i += 1
            continue

        practice_counter_by_topic[current_topic] += 1 if line == "隨堂練習" else 0
        role, source_number, role_slug = marker_info(line, practice_counter_by_topic[current_topic])

        start = i + 1
        end = start
        while end < len(lines) and not is_marker(lines[end]) and not is_topic_heading(lines[end]):
            end += 1

        block = lines[start:end]
        question_text, explanation_text = split_question_explanation(block)
        if question_text:
            source_order += 1
            topic_id = classify_topic(current_theme, question_text, explanation_text)
            topic_title = TOPIC_TITLES.get(topic_id, topic_id)
            qid = f"{ID_PREFIX}-{source_order:03d}"
            tags = [
                CHAPTER_CODE,
                "實數",
                f"topic:{topic_id}",
                f"role:{role_slug}",
                f"source-section:{current_topic or '單元1 實數'}",
                f"module:{topic_title}",
                "word_import",
            ]
            rows.append(
                {
                    "id": qid,
                    "title": make_title(role, source_number, question_text),
                    "question_text": question_text,
                    "answer_text": "",
                    "explanation_text": explanation_text,
                    "stage": "高中",
                    "grade": "高一",
                    "chapter": CHAPTER_CODE,
                    "chapter_code": CHAPTER_CODE,
                    "difficulty": difficulty_for(role, question_text),
                    "source_type": "word_docx_import",
                    "source_ref": SOURCE_REF,
                    "question_role": role,
                    "target_level": "topic",
                    "target_id": topic_id,
                    "target_title": topic_title,
                    "source_section": current_topic or "單元1 實數",
                    "source_number": source_number,
                    "source_order": source_order,
                    "tags": tags,
                }
            )
        i = end

    return rows


def link_id_for(question_id: str, topic_id: str) -> str:
    raw = f"link-{question_id}-topic-{topic_id}"
    return re.sub(r"[^A-Za-z0-9_-]+", "-", raw).strip("-").lower()


def make_links(questions: List[Dict]) -> List[Dict]:
    now = now_iso()
    links = []
    for question in questions:
        qid = question["id"]
        topic_id = question["target_id"]
        links.append(
            {
                "id": link_id_for(qid, topic_id),
                "title": f"{qid} -> {topic_id}",
                "question_id": qid,
                "question_title": question.get("title", ""),
                "topic_id": topic_id,
                "chapter_code": CHAPTER_CODE,
                "link_level": "topic",
                "source_type": "manual-docx-structured-pack",
                "source_ref": SOURCE_REF,
                "confidence": 1.0,
                "created_at": now,
                "updated_at": now,
                "tags": [],
            }
        )
    return links


def write_jsonl(path: Path, rows: List[Dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def load_json(path: Path, key: str) -> Dict:
    if not path.exists():
        return {"meta": {"count": 0}, key: []}
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: Dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def upsert(target: List[Dict], rows: List[Dict]) -> Tuple[int, int]:
    index = {row.get("id"): i for i, row in enumerate(target)}
    created = updated = 0
    for row in rows:
        if row["id"] in index:
            target[index[row["id"]]] = row
            updated += 1
        else:
            target.append(row)
            index[row["id"]] = len(target) - 1
            created += 1
    return created, updated


def apply_to_db(questions: List[Dict], links: List[Dict]) -> Dict:
    q_payload = load_json(QUESTION_DB, "questions")
    q_rows = q_payload.get("questions", []) if isinstance(q_payload.get("questions"), list) else []
    qc, qu = upsert(q_rows, questions)
    q_payload["questions"] = q_rows
    q_payload.setdefault("meta", {})
    q_payload["meta"].update({"count": len(q_rows), "updatedAt": now_iso(), "lastImportSource": SOURCE_REF})
    save_json(QUESTION_DB, q_payload)

    l_payload = load_json(LINK_DB, "links")
    l_rows = l_payload.get("links", []) if isinstance(l_payload.get("links"), list) else []
    lc, lu = upsert(l_rows, links)
    l_payload["links"] = l_rows
    l_payload.setdefault("meta", {})
    l_payload["meta"].update({"count": len(l_rows), "updatedAt": now_iso(), "lastImportSource": SOURCE_REF})
    save_json(LINK_DB, l_payload)
    return {"questions_created": qc, "questions_updated": qu, "links_created": lc, "links_updated": lu}


def validate_targets(questions: List[Dict]) -> List[str]:
    if not FORMULA_DB.exists():
        return []
    payload = json.loads(FORMULA_DB.read_text(encoding="utf-8-sig"))
    topic_ids = {str(row.get("id", "")).strip() for row in payload.get("topics", [])}
    return sorted({q["target_id"] for q in questions if q["target_id"] not in topic_ids})


def build_preview(questions: List[Dict], links: List[Dict], applied: Dict | None = None) -> Dict:
    by_section = Counter(q["source_section"] for q in questions)
    by_role = Counter(q["question_role"] for q in questions)
    by_target = Counter(q["target_id"] for q in questions)
    missing_targets = validate_targets(questions)
    return {
        "meta": {
            "source_docx": str(SOURCE_DOCX),
            "source_ref": SOURCE_REF,
            "chapter_code": CHAPTER_CODE,
            "question_count": len(questions),
            "link_count": len(links),
            "output_questions": str(OUT_QUESTIONS.relative_to(ROOT)).replace("\\", "/"),
            "output_links": str(OUT_LINKS.relative_to(ROOT)).replace("\\", "/"),
            "plain_text_cache": str(PLAIN_PATH.relative_to(ROOT)).replace("\\", "/"),
            "applied": applied or {},
            "missing_target_ids": missing_targets,
        },
        "counts": {
            "by_section": dict(by_section),
            "by_role": dict(by_role),
            "by_target": dict(by_target),
        },
        "targets": [
            {"topic_id": topic_id, "topic_title": TOPIC_TITLES.get(topic_id, topic_id), "count": count}
            for topic_id, count in sorted(by_target.items())
        ],
        "sample_questions": questions[:5],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert 1-1 real-number DOCX into question/link JSONL import files.")
    parser.add_argument("--source-docx", default=str(SOURCE_DOCX))
    parser.add_argument("--force-pandoc", action="store_true")
    parser.add_argument("--apply", action="store_true", help="Upsert generated question/link rows into database JSON files.")
    args = parser.parse_args()

    source = Path(args.source_docx)
    if not source.exists():
        raise FileNotFoundError(source)

    run_pandoc(source, PLAIN_PATH, force=args.force_pandoc)
    questions = parse_records(load_clean_lines(PLAIN_PATH))
    links = make_links(questions)

    if len({q["id"] for q in questions}) != len(questions):
        raise ValueError("Duplicate question IDs generated")
    if len({l["id"] for l in links}) != len(links):
        raise ValueError("Duplicate link IDs generated")

    missing_targets = validate_targets(questions)
    if missing_targets:
        raise ValueError(f"Generated links reference missing topic IDs: {missing_targets}")

    write_jsonl(OUT_QUESTIONS, questions)
    write_jsonl(OUT_LINKS, links)
    applied = apply_to_db(questions, links) if args.apply else {}
    preview = build_preview(questions, links, applied)
    OUT_PREVIEW.write_text(json.dumps(preview, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(preview["meta"], ensure_ascii=False, indent=2))
    print(json.dumps(preview["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
