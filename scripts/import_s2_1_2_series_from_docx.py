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
SOURCE_DOCX = Path(r"E:\備份資料\張快數學\哈特例高中數學講義\108課綱\教材重點\2-2轉.docx")
SOURCE_REF = "2-2轉.docx"
CHAPTER_CODE = "s2-1-2"
ID_PREFIX = "q-s2-1-2-series-word01"

OUT_DIR = ROOT / "program-db" / "imports"
OUT_QUESTIONS = OUT_DIR / "question" / f"{ID_PREFIX}.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / f"{ID_PREFIX}.links.jsonl"
OUT_PREVIEW = OUT_DIR / f"{ID_PREFIX}.preview.json"
WORK_DIR = ROOT / "exports" / "s2-1-2-series-word"
PLAIN_PATH = WORK_DIR / "2-2轉.plain.txt"

QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"

TOPIC_TITLES = {
    "s2-1-2-series-sigma-core": "級數求和與 $\\Sigma$ 記號",
    "senior-series-main": "級數",
    "senior-arithmetic-geometric-series": "等差、等比級數公式",
    "senior-common-summation-formulas": "常見求和公式",
    "senior-power-sums-link-square-cube-s212": "平方和與立方和關聯",
    "senior-series-geometric-convergence-s212": "等比級數收斂條件",
    "senior-series-index-shift-s212": "Sigma 指標平移與合併",
    "senior-series-induction-proofs": "級數公式的歸納法驗證",
    "senior-series-partial-sum-difference-method-s212": "部分和差分法（由 Sn 求 an）",
    "senior-series-sigma-modeling-workflow-s212": "文字級數轉 Sigma 的建模流程",
    "senior-series-telescoping-s212": "裂項求和（望遠鏡級數）",
    "senior-series-weighted-sum-trick-s212": "加權級數求和技巧",
    "senior-sigma-notation-conversion": "Sigma 記號轉換與建模",
    "senior-geometric-series-subtraction-trick-s212": "等比級數首尾相減法",
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
        .replace("（", "(")
        .replace("）", ")")
        .replace("≤", "<=")
        .replace("≥", ">=")
        .replace("Σ", "\\sum")
    )


def compact_for_match(text: str) -> str:
    return re.sub(r"\s+", "", normalize_for_match(text))


def run_pandoc(source: Path, output: Path, force: bool = False) -> None:
    if output.exists() and not force:
        return
    output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["pandoc", str(source), "-t", "plain", "--wrap=none", "-o", str(output)],
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
    if "級數和公式" in text:
        return "formula"
    return "arith_geo"


def split_question_explanation(lines: List[str]) -> Tuple[str, str]:
    split_at = None
    for i, line in enumerate(lines):
        if re.search(r"【(解析|證明|詳解|解)[^】]*】", line):
            split_at = i
            break
    if split_at is None:
        for i, line in enumerate(lines[:-1]):
            if re.fullmatch(r"(【[^】]+】|\[[^\]]+\])+", line.strip()):
                return "\n".join(lines[: i + 1]).strip(), "\n".join(lines[i + 1 :]).strip()
        return "\n".join(lines).strip(), ""

    marker_match = re.search(r"【(解析|證明|詳解|解)[^】]*】", lines[split_at])
    prefix = lines[split_at][: marker_match.start()].strip() if marker_match else ""
    question_lines = lines[:split_at]
    if prefix and not re.fullmatch(r"(【[^】]+】|\[[^\]]+\])+", prefix):
        question_lines.append(prefix)
    question = "\n".join(question_lines).strip()

    explanation_lines = lines[split_at:]
    if explanation_lines:
        explanation_lines[0] = re.sub(r"^.*?【(解析|證明|詳解|解)[^】]*】\s*", "", explanation_lines[0]).strip()
    explanation = "\n".join(line for line in explanation_lines if line).strip()
    return question, explanation


def source_only_question(text: str) -> bool:
    stripped = re.sub(r"【[^】]+】", "", text or "")
    stripped = re.sub(r"\[[^\]]+\]", "", stripped)
    stripped = re.sub(r"\s+", "", stripped)
    return not stripped


def placeholder_question(section: str, role: str, number: int) -> str:
    return f"（題幹未能由 Word 純文字抽出，可能為圖片題；請參照原檔「{SOURCE_REF}」{section}的{role}{number:02d}。）"


def classify_topic(theme: str, question: str, explanation: str) -> str:
    qblob = compact_for_match(question)
    blob = compact_for_match(f"{question}\n{explanation}")

    if any(word in qblob for word in ["無窮", "收斂", "極限", "趨近", "infty", "\\infty"]):
        return "senior-series-geometric-convergence-s212"

    if any(word in qblob for word in ["單利", "複利", "本金", "本利和", "利率", "期利率"]):
        return "senior-arithmetic-geometric-series"

    if any(word in qblob for word in ["裂項", "望遠鏡", "相消", "部分分式"]) or re.search(r"\\frac\{1\}\{[^}]+\}\\+\\frac\{1\}\{[^}]+\}", qblob):
        return "senior-series-telescoping-s212"

    if any(word in qblob for word in ["首尾相減", "錯位相減"]):
        return "senior-geometric-series-subtraction-trick-s212"

    if "\\sum" in qblob:
        if any(word in qblob for word in ["k=11", "k=0", "k=2", "指標", "平移", "合併"]):
            return "senior-series-index-shift-s212"
        if any(word in qblob for word in ["表示", "寫成", "改寫", "展開"]):
            return "senior-sigma-notation-conversion"
        if any(word in qblob for word in ["k2", "k^2", "k^{2}", "k3", "k^3", "k^{3}", "平方", "立方"]):
            return "senior-common-summation-formulas"
        return "senior-sigma-notation-conversion"

    if any(word in qblob for word in ["證明", "試證", "數學歸納法", "預測"]) and theme == "formula":
        return "senior-series-induction-proofs"

    if any(word in qblob for word in ["S_(n)", "S_{n}", "前n項和", "部分和"]) and any(word in qblob for word in ["a_(n)", "a_{n}", "第n項"]):
        return "senior-series-partial-sum-difference-method-s212"

    if any(word in qblob for word in ["1²", "2²", "3²", "1^2", "2^2", "平方和", "立方和", "1³", "2³", "3³", "1^3", "2^3", "3^3"]):
        return "senior-power-sums-link-square-cube-s212"

    if any(word in qblob for word in ["n²", "n^2", "2^(n)", "2^n", "2^{n", "x^", "i²", "i^", "加權", "微分", "乘以", "n(n+1)", "n(n + 1)"]):
        return "senior-series-weighted-sum-trick-s212"

    if any(word in qblob for word in ["圖形", "如下圖", "如圖", "面積", "坐標", "座標", "線段", "積木", "高腳杯", "正方形", "三角形", "圓", "邊長", "小積木", "紙片", "落下", "跳回", "螞蟻", "移動"]):
        if theme == "formula":
            return "senior-series-sigma-modeling-workflow-s212"
        return "senior-arithmetic-geometric-series"

    if any(word in qblob for word in ["等差級數", "等比級數", "等差數列", "等比數列", "公差", "公比", "首項", "前13項", "前n項", "倍數總和", "各數之和", "所有", "之和"]):
        return "senior-arithmetic-geometric-series"

    if theme == "formula":
        if any(word in blob for word in ["\\sum", "1+2+3", "1 + 2 + 3", "k(k+1)", "k(k + 1)"]):
            return "senior-common-summation-formulas"
        return "senior-common-summation-formulas"

    if theme == "arith_geo":
        return "senior-arithmetic-geometric-series"

    return "s2-1-2-series-sigma-core"


def difficulty_for(role: str, question: str) -> str:
    text = compact_for_match(question)
    if any(word in text for word in ["證明", "試證", "數學歸納法", "無窮", "收斂", "複利", "利率", "圖形", "面積", "最大", "最小", "推測"]):
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
    current_topic = "主題1：等差級數與等比級數"
    current_theme = "arith_geo"
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
        if source_only_question(question_text):
            original_source = question_text.strip()
            question_text = placeholder_question(current_topic, role, source_number)
            if original_source:
                question_text = f"{question_text}\n{original_source}"

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
                        "級數",
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


def collect_ids(payload) -> set[str]:
    ids: set[str] = set()
    if isinstance(payload, dict):
        if isinstance(payload.get("id"), str):
            ids.add(payload["id"])
        for value in payload.values():
            ids.update(collect_ids(value))
    elif isinstance(payload, list):
        for item in payload:
            ids.update(collect_ids(item))
    return ids


def validate_targets(questions: List[Dict]) -> List[str]:
    if not FORMULA_DB.exists():
        return []
    payload = json.loads(FORMULA_DB.read_text(encoding="utf-8-sig"))
    topic_ids = collect_ids(payload)
    return sorted({q["target_id"] for q in questions if q["target_id"] not in topic_ids})


def build_preview(questions: List[Dict], links: List[Dict], applied: Dict | None = None) -> Dict:
    by_section = Counter(q["source_section"] for q in questions)
    by_role = Counter(q["question_role"] for q in questions)
    by_target = Counter(q["target_id"] for q in questions)
    by_difficulty = Counter(q["difficulty"] for q in questions)
    placeholder_count = sum(1 for q in questions if q["question_text"].startswith("（題幹未能由 Word 純文字抽出"))
    return {
        "meta": {
            "source_docx": str(SOURCE_DOCX),
            "source_ref": SOURCE_REF,
            "chapter_code": CHAPTER_CODE,
            "question_count": len(questions),
            "link_count": len(links),
            "placeholder_question_count": placeholder_count,
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
    parser = argparse.ArgumentParser(description="Convert 2-2 series DOCX into question/link JSONL import files.")
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
