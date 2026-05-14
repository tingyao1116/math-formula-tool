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
SOURCE_DOCX = Path(r"E:\備份資料\張快數學\哈特例高中數學講義\108課綱\教材重點\1-10轉.docx")
SOURCE_REF = "1-10轉.docx"
CHAPTER_CODE = "s1-3-2"
ID_PREFIX = "q-s1-3-2-polynomial-graph-word01"

OUT_DIR = ROOT / "program-db" / "imports"
OUT_QUESTIONS = OUT_DIR / "question" / f"{ID_PREFIX}.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / f"{ID_PREFIX}.links.jsonl"
OUT_PREVIEW = OUT_DIR / f"{ID_PREFIX}.preview.json"
WORK_DIR = ROOT / "exports" / "s1-3-2-polynomial-graph-word"
PLAIN_PATH = WORK_DIR / "1-10轉.plain.txt"

QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"

TOPIC_TITLES = {
    "s1-3-2-polynomial-graph-core": "多項式函數圖形與平移",
    "senior-polynomial-function-graphs-basic": "簡單多項式函數及其圖形",
    "senior-function-concept-domain-range": "函數基本概念、定義域與值域",
    "senior-linear-function-graph-meaning": "一次函數圖形與斜率意義",
    "senior-quadratic-function-graph-core": "二次函數圖形核心判讀",
    "senior-quadratic-transformations": "二次函數平移、伸縮與對稱",
    "senior-quadratic-extrema-on-interval": "二次函數有範圍極值",
    "senior-cubic-function-graph-features": "三次函數圖形特徵與變形",
    "senior-polynomial-end-local-behavior": "端行為與局部一次近似（客串）",
    "senior-function-vertical-line-test-s132": "函數圖形的垂直線測試",
    "senior-quadratic-extremum-three-point-decision-s132": "二次函數極值三點決策（頂點與端點）",
    "senior-quadratic-sign-conditions-s132": "二次函數恆正恆負條件",
    "senior-cubic-center-shift-normal-form-s132": "三次函數平移到中心標準形",
    "senior-cubic-end-behavior-ratio-test-s132": "三次函數大域近似與比值判準",
    "senior-polynomial-function-even-odd-end-behavior-s132": "偶奇性與端行為判讀",
    "senior-polynomial-function-parameter-graph-reading-s132": "參數型圖形判讀",
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def normalize_for_match(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text or "")
    return (
        normalized.replace("離", "離")
        .replace("－", "-")
        .replace("＋", "+")
        .replace("：", ":")
        .replace("﹕", ":")
        .replace("﹐", ",")
        .replace("，", ",")
    )


def compact_for_match(text: str) -> str:
    return re.sub(r"\s+", "", normalize_for_match(text))


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
    if stripped in {"隨堂練習.", "隨堂練習。"}:
        return ""
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
    text = compact_for_match(line)
    if "線型函數" in text:
        return "linear"
    if "二次函數" in text:
        return "quadratic"
    if "單項函數" in text:
        return "monomial"
    if "多項式函數" in text:
        return "polynomial"
    return "polynomial"


def split_question_explanation(lines: List[str]) -> Tuple[str, str]:
    split_at = None
    for i, line in enumerate(lines):
        if re.search(r"【(解析|證明|解)[^】]*】", line):
            split_at = i
            break
    if split_at is None:
        for i, line in enumerate(lines[:-1]):
            if re.fullmatch(r"(【[^】]+】|\[[^\]]+\])+", line.strip()):
                return "\n".join(lines[: i + 1]).strip(), "\n".join(lines[i + 1 :]).strip()
        return "\n".join(lines).strip(), ""

    marker_match = re.search(r"【(解析|證明|解)[^】]*】", lines[split_at])
    prefix = lines[split_at][: marker_match.start()].strip() if marker_match else ""
    question_lines = lines[:split_at]
    if prefix and not re.fullmatch(r"(【[^】]+】|\[[^\]]+\])+", prefix):
        question_lines.append(prefix)
    question = "\n".join(question_lines).strip()

    explanation_lines = lines[split_at:]
    if explanation_lines:
        explanation_lines[0] = re.sub(r"^.*?【(解析|證明|解)[^】]*】\s*", "", explanation_lines[0]).strip()
    explanation = "\n".join(line for line in explanation_lines if line).strip()
    return question, explanation


def classify_topic(theme: str, question: str, explanation: str) -> str:
    blob = compact_for_match(f"{question}\n{explanation}")

    if "垂直線測試" in blob or "是否為函數" in blob:
        return "senior-function-vertical-line-test-s132"

    if theme == "linear":
        if any(word in blob for word in ["氣溫", "調分", "等速", "速度", "斜率", "截距", "一次函數", "線型函數", "直線"]):
            return "senior-linear-function-graph-meaning"
        return "senior-function-concept-domain-range"

    if theme == "quadratic":
        if any(word in blob for word in ["恆正", "恆負", "必不", "不通過", "b²-4ac", "b²−4ac", "判別", "正確", "a<0", "a>0"]):
            return "senior-quadratic-sign-conditions-s132"
        if any(word in blob for word in ["最大值", "最小值", "極值", "範圍", "≤x≤", "定義域", "面積最大", "最短", "最高", "最低"]):
            return "senior-quadratic-extremum-three-point-decision-s132"
        if any(word in blob for word in ["平移", "頂點", "對稱軸", "開口", "(x-", "(x+", "伸縮"]):
            return "senior-quadratic-transformations"
        return "senior-quadratic-function-graph-core"

    if theme == "monomial":
        if any(word in blob for word in ["奇函數", "偶函數", "對稱於原點", "對稱於y軸", "x⁴", "四次"]):
            return "senior-polynomial-function-even-odd-end-behavior-s132"
        if any(word in blob for word in ["平移", "三次", "x³", "單項函數", "中心"]):
            return "senior-cubic-center-shift-normal-form-s132"
        return "senior-cubic-function-graph-features"

    if theme == "polynomial":
        if any(word in blob for word in ["最右方", "上升", "下降", "正無限", "負無限", "首項", "端行為"]):
            return "senior-polynomial-end-local-behavior"
        if any(word in blob for word in ["f(x+2)", "f(x-1)", "平移", "圖形往", "向左", "向右", "向上", "向下"]):
            return "s1-3-2-polynomial-graph-core"
        if any(word in blob for word in ["奇函數", "偶函數", "對稱"]):
            return "senior-polynomial-function-even-odd-end-behavior-s132"
        if any(word in blob for word in ["有多少個", "實根", "正實根", "f(x)>0", "f(x)<0", "不等式", "與x軸"]):
            return "senior-polynomial-function-graphs-basic"
        return "s1-3-2-polynomial-graph-core"

    return "senior-polynomial-function-graphs-basic"


def difficulty_for(role: str, question: str) -> str:
    text = compact_for_match(question)
    if any(word in text for word in ["最大", "最小", "範圍", "不等式", "參數", "圖形", "恰", "所有", "應用", "面積"]):
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
    current_topic = "主題1：線型函數"
    current_theme = "linear"
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

        if line == "隨堂練習":
            practice_counter_by_topic[current_topic] += 1
        role, source_number, role_slug = marker_info(line, practice_counter_by_topic[current_topic])

        start = i + 1
        end = start
        while end < len(lines) and not is_marker(lines[end]) and not is_topic_heading(lines[end]):
            end += 1

        question_text, explanation_text = split_question_explanation(lines[start:end])
        if not question_text and explanation_text:
            question_text = f"（題幹未能由 Word 純文字抽出，可能為圖片題；請參照原檔「{current_topic} {role}{source_number}」。）"
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
                        "簡單多項式函數及其圖形",
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
    by_difficulty = Counter(q["difficulty"] for q in questions)
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
            "by_difficulty": dict(by_difficulty),
            "by_target": dict(by_target),
        },
        "targets": [
            {"topic_id": topic_id, "topic_title": TOPIC_TITLES.get(topic_id, topic_id), "count": count}
            for topic_id, count in sorted(by_target.items())
        ],
        "sample_questions": questions[:5],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert 1-10 polynomial-graph DOCX into question/link JSONL import files.")
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
    if any(not q["question_text"].strip() for q in questions):
        raise ValueError("Generated an empty question_text")

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
