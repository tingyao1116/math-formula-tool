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
SOURCE_DOCX = Path(r"E:\備份資料\張快數學\哈特例高中數學講義\108課綱\教材重點\1-5轉.docx")
SOURCE_REF = "1-5轉.docx"
CHAPTER_CODE = "s1-1-5"
ID_PREFIX = "q-s1-1-5-logarithm-word01"

OUT_DIR = ROOT / "program-db" / "imports"
OUT_QUESTIONS = OUT_DIR / "question" / f"{ID_PREFIX}.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / f"{ID_PREFIX}.links.jsonl"
OUT_PREVIEW = OUT_DIR / f"{ID_PREFIX}.preview.json"
WORK_DIR = ROOT / "exports" / "s1-5-logarithm-word"
PLAIN_PATH = WORK_DIR / "1-5轉.plain.txt"

QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"

TOPIC_TITLES = {
    "s1-1-5-logarithm-core": "對數定義與運算律",
    "senior-logarithm-main-s322": "對數",
    "senior-logarithm-basic-facts-s322": "對數基本性質與互換",
    "senior-logarithm-laws-s322": "對數律（加減與係數）",
    "senior-logarithm-change-base-s322": "換底公式與連鎖關係",
    "senior-logarithm-scientific-notation-s322": "科學記號、首數尾數與位數估計",
    "senior-logarithm-application-models-s322": "對數應用模型（規模與等級）",
    "senior-logarithm-power-swap-identity-s322": "對數指冪互換恆等式",
    "senior-logarithm-digit-leading-estimation-s322": "位數與首位數估計流程",
    "senior-logarithm-domain-and-evaluation-s322": "對數定義域與值計算",
    "senior-logarithm-word-problem-setup-s322": "對數文字題建模步驟",
    "senior-logarithm-chain-cancellation-s322": "連鎖對數消去技巧",
    "senior-logarithm-inequality-strategy-s322": "對數不等式策略",
    "senior-logarithm-mixed-base-computation-s322": "異底對數混合計算",
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def normalize_for_match(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text or "")
    return (
        normalized.replace("離", "離")
        .replace("－", "-")
        .replace("＋", "+")
        .replace("％", "%")
    )


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
    if "科學記號" in text:
        return "scientific"
    return "common_log"


def split_question_explanation(lines: List[str]) -> Tuple[str, str]:
    split_at = None
    for i, line in enumerate(lines):
        if re.search(r"【(解析|證明)】", line):
            split_at = i
            break
    if split_at is None:
        return "\n".join(lines).strip(), ""

    marker_match = re.search(r"【(解析|證明)】", lines[split_at])
    prefix = lines[split_at][: marker_match.start()].strip() if marker_match else ""
    question_lines = lines[:split_at]
    if prefix and not re.fullmatch(r"(【[^】]+】)+", prefix):
        question_lines.append(prefix)
    question = "\n".join(question_lines).strip()
    explanation_lines = lines[split_at:]
    if explanation_lines:
        explanation_lines[0] = re.sub(r"^.*?【(解析|證明)】\s*", "", explanation_lines[0]).strip()
    return question, "\n".join(line for line in explanation_lines if line).strip()


def classify_topic(theme: str, question: str, explanation: str) -> str:
    blob = normalize_for_match(f"{question}\n{explanation}")
    compact = re.sub(r"\s+", "", blob)

    application_words = [
        "地震",
        "芮氏",
        "規模",
        "能量",
        "分貝",
        "音量",
        "pH",
        "星等",
        "星",
        "人口",
        "利率",
        "本利和",
        "儲蓄",
        "複利",
        "銀行",
        "保險",
        "布袋蓮",
        "細菌",
        "菌",
        "藥物",
        "濃度",
        "碳14",
        "颱風",
        "輻射",
        "白報紙",
        "厚度",
        "摩爾",
        "謠言",
        "網路",
    ]
    digit_words = ["位數", "首數", "尾數", "科學記號", "首位數", "第", "個位數字"]

    if any(word in compact for word in application_words):
        if any(word in compact for word in ["求幾年", "至少", "超過", "不足", ">", "<", "幾次", "幾天"]):
            return "senior-logarithm-word-problem-setup-s322"
        return "senior-logarithm-application-models-s322"

    if theme == "scientific":
        if any(word in compact for word in ["至少", "不小於", "大於", "小於", ">", "<", "範圍"]):
            return "senior-logarithm-inequality-strategy-s322"
        if any(word in compact for word in digit_words):
            return "senior-logarithm-digit-leading-estimation-s322"
        return "senior-logarithm-scientific-notation-s322"

    if any(word in compact for word in ["沒有意義", "有意義", "定義域", "底數", "真數", "a>0", "a≠1"]):
        return "senior-logarithm-domain-and-evaluation-s322"

    if any(word in compact for word in ["αβ", "alpha", "beta", "log_{a}\\alpha", "log_{b}\\beta", "log_{\\sqrt"]):
        return "senior-logarithm-change-base-s322"

    if any(word in compact for word in ["3388", "33.88", "3.5", "0.035"]):
        return "senior-logarithm-chain-cancellation-s322"

    if any(word in compact for word in ["設x=log", "設x=log₂", "設x=log₃", "2^(log", "3^(log", "a^(log"]):
        return "senior-logarithm-power-swap-identity-s322"

    if "求下列式子的值" in compact or "求下列各式中x的值" in compact:
        return "senior-logarithm-basic-facts-s322"

    if any(word in compact for word in ["log", "對數律", "化簡", "+", "-"]):
        return "senior-logarithm-laws-s322"

    if any(word in compact for word in ["⇔", "求下列式子的值", "x=", "log₁₀", "log₂", "log₃"]):
        return "senior-logarithm-basic-facts-s322"

    return "s1-1-5-logarithm-core"


def difficulty_for(role: str, question: str) -> str:
    text = normalize_for_match(question)
    if any(word in text for word in ["地震", "分貝", "人口", "複利", "至少", "範圍", "位數", "首數", "尾數", "應用", "濃度"]):
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
    current_topic = "主題1：常用對數"
    current_theme = "common_log"
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
                        "對數",
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
    parser = argparse.ArgumentParser(description="Convert 1-5 logarithm DOCX into question/link JSONL import files.")
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
