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
SOURCE_DOCX = Path(r"E:\備份資料\張快數學\哈特例高中數學講義\108課綱\教材重點\1-3轉.docx")
SOURCE_REF = "1-3轉.docx"
CHAPTER_CODE = "s1-1-3"
ID_PREFIX = "q-s1-1-3-expression-operations-word01"

OUT_DIR = ROOT / "program-db" / "imports"
OUT_QUESTIONS = OUT_DIR / "question" / f"{ID_PREFIX}.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / f"{ID_PREFIX}.links.jsonl"
OUT_PREVIEW = OUT_DIR / f"{ID_PREFIX}.preview.json"
WORK_DIR = ROOT / "exports" / "s1-3-expression-operations-word"
PLAIN_PATH = WORK_DIR / "1-3轉.plain.txt"

QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"

TOPIC_TITLES = {
    "s1-1-3-algebraic-operations": "式的運算與乘法公式",
    "senior-binomial-formulas-pascal": "二項展開與巴斯卡三角形",
    "senior-cube-sum-difference-factorization": "立方和與立方差",
    "senior-three-variable-identities": "三項公式與對稱式",
    "senior-completing-square-factorization": "補項後再因式分解",
    "senior-reciprocal-power-identities": "倒數型冪次求值",
    "senior-expression-substitution-evaluation": "代換整理與公式求值",
    "senior-radical-expression-identities": "根式型乘法公式",
    "senior-integer-bounds-from-expansion": "展開式估值與整數夾值",
    "senior-high-degree-factorization-patterns": "高次式因式分解樣式",
    "senior-symmetric-polynomial-abc": "a+b+c、ab+bc+ca、abc 的互推",
    "senior-arithmetic-geometric-mean": "算術平均與幾何平均",
}

RECOVERED_QUESTION_TEXT = {
    ("主題2：算幾不等式", "隨堂練習", 5): (
        "一農夫想用65公尺長之竹籬圍成一長方形菜圃﹐並在其中兩邊各留著寬2公尺及1公尺的出入口﹐"
        "如圖所示﹒此農夫所能圍成的最大面積為____________平方公尺﹒"
    ),
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def normalize_for_match(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text or "")
    return normalized.replace("離", "離").replace("－", "-").replace("＋", "+")


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
    if "算幾" in text or "不等式" in text:
        return "am_gm"
    return "operations"


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

    if theme == "am_gm":
        return "senior-arithmetic-geometric-mean"

    if (
        "1/a" in compact
        or "1/x" in compact
        or "倒數" in compact
        or re.search(r"\\frac\{1\}\{[ax]\}", compact)
    ):
        return "senior-reciprocal-power-identities"

    if "sqrt" in compact or "根號" in compact or "雙重根號" in compact or "有理化" in compact:
        if any(word in compact for word in ["整數部分", "小數部分", "介於", "比較大小", "排列"]):
            return "senior-integer-bounds-from-expansion"
        return "senior-radical-expression-identities"

    if any(word in compact for word in ["a+b+c", "ab+bc+ca", "abc", "a+b=4", "a×b", "對稱"]):
        return "senior-symmetric-polynomial-abc"

    if any(word in compact for word in ["立方和", "立方差", "x3+8", "x3+8y3", "a3+b3", "a3-b3", "8a3", "27b3"]):
        return "senior-cube-sum-difference-factorization"

    if "因式分解" in compact:
        if any(word in compact for word in ["補項", "高次"]) or re.search(r"[xyab]\^?[468]", compact):
            return "senior-high-degree-factorization-patterns"
        return "senior-completing-square-factorization"

    if any(word in compact for word in ["展開", "二項式", "巴斯卡"]):
        return "senior-binomial-formulas-pascal"

    if any(word in compact for word in ["若", "已知", "求", "值"]):
        return "senior-expression-substitution-evaluation"

    return "s1-1-3-algebraic-operations"


def difficulty_for(role: str, question: str) -> str:
    text = normalize_for_match(question)
    if any(word in text for word in ["最大", "最小", "範圍", "證明", "整數部分", "小數部分", "面積"]):
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
    current_topic = "主題1：乘法公式、分式與根式的運算"
    current_theme = "operations"
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

        question_text, explanation_text = split_question_explanation(lines[start:end])
        if not question_text and explanation_text:
            question_text = RECOVERED_QUESTION_TEXT.get((current_topic, role, source_number), "")
        if question_text:
            source_order += 1
            topic_id = classify_topic(current_theme, question_text, explanation_text)
            topic_title = TOPIC_TITLES.get(topic_id, topic_id)
            qid = f"{ID_PREFIX}-{source_order:03d}"
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
                    "source_section": current_topic,
                    "source_number": source_number,
                    "source_order": source_order,
                    "tags": [
                        CHAPTER_CODE,
                        "式的運算",
                        f"topic:{topic_id}",
                        f"role:{role_slug}",
                        f"source-section:{current_topic}",
                        f"module:{topic_title}",
                        "word_import",
                    ],
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
            "missing_target_ids": validate_targets(questions),
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
    parser = argparse.ArgumentParser(description="Convert 1-3 expression-operations DOCX into question/link JSONL import files.")
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
