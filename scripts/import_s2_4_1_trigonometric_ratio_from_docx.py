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
SOURCE_DOCX = Path(r"E:\備份資料\張快數學\哈特例高中數學講義\108課綱\教材重點\2-3轉.docx")
SOURCE_REF = "2-3轉.docx"
CHAPTER_CODE = "s2-4-1"
ID_PREFIX = "q-s2-4-1-trigonometric-ratio-word01"

OUT_DIR = ROOT / "program-db" / "imports"
OUT_QUESTIONS = OUT_DIR / "question" / f"{ID_PREFIX}.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / f"{ID_PREFIX}.links.jsonl"
OUT_PREVIEW = OUT_DIR / f"{ID_PREFIX}.preview.json"
WORK_DIR = ROOT / "exports" / "s2-4-1-trigonometric-ratio-word"
PLAIN_PATH = WORK_DIR / "2-3轉.plain.txt"

QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"

TOPIC_TITLES = {
    "s2-4-1-trigonometric-ratio-core": "三角比定義與基本關係",
    "senior-trigonometric-ratios-main": "三角比定義與關係",
    "senior-directed-angle-quadrant-signs": "有向角、同界角與象限正負",
    "senior-right-triangle-trig-definition": "直角三角形三角比定義",
    "senior-special-right-triangles-values": "特殊直角三角形與特角值",
    "senior-trig-identities-and-transform-rules": "商數、平方與換角公式",
    "senior-trig-identity-solving-s241": "三角恆等式與基礎方程",
    "senior-trig-measurement-modeling": "三角測量基本建模",
    "senior-trig-quadrantal-conversion-rules-s241": "90、180、270 度換角速則",
    "senior-trig-ratio-reduction-formulas-s241": "化簡與誘導公式",
    "senior-trig-reference-angle-sign-workflow-s241": "參考角與象限判號流程",
    "senior-unit-circle-coordinate-definition": "單位圓與座標定義三角比",
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
        .replace("。", ".")
        .replace("≤", "<=")
        .replace("≥", ">=")
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
    if "有向角" in text:
        return "directed"
    if "銳角" in text:
        return "right_triangle"
    if "廣義角" in text:
        return "general_angle"
    if "極座標" in text:
        return "polar"
    if "關係式" in text:
        return "identity"
    return "core"


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
    stripped = stripped.replace("[", "").replace("]", "")
    stripped = re.sub(r"[\s。．.、,，:：;；_-]+", "", stripped)
    return not stripped


def likely_incomplete_question(text: str) -> bool:
    compact = compact_for_match(text)
    return compact.endswith("在此半")


def placeholder_question(section: str, role: str, number: int) -> str:
    return f"（題幹未能由 Word 純文字抽出，可能為圖片題；請參照原檔「{SOURCE_REF}」{section}的{role}{number:02d}。）"


def incomplete_question_note(section: str, role: str, number: int) -> str:
    return f"（題幹可能未能由 Word 純文字完整抽出，請參照原檔「{SOURCE_REF}」{section}的{role}{number:02d}。）"


def classify_topic(theme: str, question: str, explanation: str) -> str:
    qblob = compact_for_match(question)
    blob = compact_for_match(f"{question}\n{explanation}")

    if theme == "directed":
        return "senior-directed-angle-quadrant-signs"

    if any(word in qblob for word in ["仰角", "俯角", "測量", "高度", "距離", "綠洲", "駱駝", "沙漠", "半圓", "矩形", "面積", "周長"]):
        return "senior-trig-measurement-modeling"

    if theme == "polar":
        return "senior-unit-circle-coordinate-definition"

    if any(word in qblob for word in ["極坐標", "極座標", "直角坐標", "直角座標", "幅角", "Arg", "複數"]):
        return "senior-unit-circle-coordinate-definition"

    if theme == "right_triangle":
        if any(word in qblob for word in ["30°", "45°", "60°", "15°", "18°", "36°", "54°", "72°"]):
            return "senior-special-right-triangles-values"
        if any(word in qblob for word in ["如圖", "三角形", "△", "四邊形", "正方形", "線段", "垂直", "半圓"]):
            return "senior-trig-measurement-modeling"
        return "senior-right-triangle-trig-definition"

    if any(word in qblob for word in ["同界角", "象限角", "第幾象限", "第幾象限角", "最大負", "最小正"]):
        return "senior-directed-angle-quadrant-signs"

    if any(word in qblob for word in ["無意義", "sin0", "tan90", "cot(", "sec", "csc"]):
        return "senior-trig-ratio-reduction-formulas-s241"

    if any(word in qblob for word in ["90°", "180°", "270°", "360°", "420°", "540°", "585°", "660°", "750°", "930°", "1980°", "1590°", "1860°"]):
        if any(word in qblob for word in ["化簡", "計算", "求", "比較"]):
            return "senior-trig-quadrantal-conversion-rules-s241"
        return "senior-trig-reference-angle-sign-workflow-s241"

    if any(word in qblob for word in ["sinθ<", "cosθ>", "tanθ>", "tanθ<", "第三象限", "第四象限", "第一象限", "第二象限", "參考角"]):
        return "senior-trig-reference-angle-sign-workflow-s241"

    if theme == "general_angle":
        if any(word in qblob for word in ["30°", "45°", "60°", "15°", "375°", "225°", "315°", "300°"]):
            return "senior-special-right-triangles-values"
        return "senior-unit-circle-coordinate-definition"

    if theme == "identity":
        if any(word in qblob for word in ["方程式", "根", "tanθ=", "tan θ =", "求tan", "求a", "解", "滿足"]):
            return "senior-trig-identity-solving-s241"
        return "senior-trig-identities-and-transform-rules"

    if any(word in qblob for word in ["證明", "求證", "化簡", "恆等式", "sin²", "cos²", "tan²"]):
        return "senior-trig-identities-and-transform-rules"

    if any(word in blob for word in ["sin", "cos", "tan", "cot", "sec", "csc"]):
        return "senior-trigonometric-ratios-main"

    return "s2-4-1-trigonometric-ratio-core"


def difficulty_for(role: str, question: str) -> str:
    text = compact_for_match(question)
    if any(word in text for word in ["證明", "求證", "化簡", "方程式", "極坐標", "極座標", "複數", "測量", "面積", "周長", "比較", "所有", "象限"]):
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
    current_topic = "主題1：有向角"
    current_theme = "directed"
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
        elif likely_incomplete_question(question_text):
            question_text = f"{incomplete_question_note(current_topic, role, source_number)}\n{question_text}"

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
                        "三角函數的定義及關係式",
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
    placeholder_count = sum(1 for q in questions if q["question_text"].startswith("（題幹未能由 Word 純文字抽出") or q["question_text"].startswith("（題幹可能未能由 Word 純文字完整抽出"))
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
    parser = argparse.ArgumentParser(description="Convert 2-3 trigonometric-ratio DOCX into question/link JSONL import files.")
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
