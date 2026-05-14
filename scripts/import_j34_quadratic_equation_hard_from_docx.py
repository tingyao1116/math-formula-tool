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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J34一元二次方程式困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j34-quadratic-equation-hard"
MARKDOWN_PATH = WORK_DIR / "j34-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"

SOURCE_REF = "J34一元二次方程式困難題題目答案卷.docx"
ID_PREFIX = "q-j34-quadratic-equation-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j34-quadratic-equation-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j34-quadratic-equation-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j34-quadratic-equation-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


TOPICS = {
    "standard_form": ("j3-4-1", "j3-4-1-standard-form", "一元二次方程式標準形"),
    "factorization_solve": ("j3-4-1", "j3-4-1-factorization-solve", "因式分解解一元二次"),
    "square_root_method": ("j3-4-1", "j3-4-1-square-root-method", "平方法（直接開根號）"),
    "root_check": ("j3-4-1", "j3-4-1-root-check", "代回驗根與增解檢查"),
    "vieta_basic": ("j3-4-1", "j3-4-1-vieta-basic", "根與係數基本關係"),
    "double_root": ("j3-4-1", "j3-4-1-double-root-case", "重根與無實根情況"),
    "completing_square": ("j3-4-2", "j3-4-2-completing-square-main", "配方法核心流程"),
    "quadratic_formula": ("j3-4-2", "j3-4-2-quadratic-formula", "公式解法"),
    "discriminant": ("j3-4-2", "j3-4-2-discriminant", "判別式與根的個數"),
    "parameter_equation": ("j3-4-2", "j3-4-2-parameter-equation", "含參數方程式判斷"),
    "method_selection": ("j3-4-2", "j3-4-2-method-selection", "解法選擇策略"),
    "word_modeling": ("j3-4-3", "j3-4-3-word-problem-modeling", "文字題建模"),
    "geometry_area": ("j3-4-3", "j3-4-3-geometry-area", "幾何面積應用"),
    "rate_time": ("j3-4-3", "j3-4-3-rate-time", "速率時間應用"),
    "integer_sequence": ("j3-4-3", "j3-4-3-integer-sequence", "連續整數與數列應用"),
    "fractional_equation": ("j3-4-3", "j3-4-3-fractional-equation", "分式情境與驗根"),
    "reasonable_answer": ("j3-4-3", "j3-4-3-reasonable-answer", "答案合理性與單位檢核"),
}


BRANCHES = {
    key: [(chapter_topic[1], chapter_topic[2])] for key, chapter_topic in TOPICS.items()
}
BRANCHES["factorization_solve"].extend([
    ("quadratic-zero-product-principle", "基本原理：AB = 0"),
    ("quadratic-cross-method-solving", "十字交乘解一元二次方程式"),
])
BRANCHES["square_root_method"].append(("quadratic-square-root-method", "利用平方根解一元二次方程式"))
BRANCHES["vieta_basic"].extend([
    ("quadratic-vieta-root-relations-junior", "根與係數的關係"),
    ("quadratic-restore-from-roots", "兩根還原"),
])
BRANCHES["double_root"].append(("quadratic-double-root-perfect-square", "重根 vs 完全平方"))
BRANCHES["completing_square"].extend([
    ("quadratic-complete-square-leading-one", "完全平方式（二次項係數為 1）"),
    ("quadratic-completing-square-full", "完整的配方法"),
])
BRANCHES["quadratic_formula"].append(("quadratic-formula-discriminant-junior", "公式解與判別式"))
BRANCHES["word_modeling"].append(("quadratic-application-problems-junior", "一元二次方程式應用問題"))
BRANCHES["geometry_area"].append(("quadratic-application-area", "面積問題"))
BRANCHES["integer_sequence"].append(("quadratic-application-consecutive-numbers", "連續數問題"))
BRANCHES["rate_time"].append(("quadratic-application-change-rate", "動態增減問題"))


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、計算": "計算",
    "四、是非": "是非",
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
        ref = match.group(1).replace("−", "-")
        if Path(ref).suffix.lower() in {".wmf", ".emf"}:
            ref = f"{ref}.png"
        return f"[圖:{ref}]"

    return re.sub(r"\[圖:([^\]]+)\]", repl, text or "")


def clean_question_text(text: str, section: str) -> str:
    cleaned = j11_helpers.clean_markup(text)
    if section in {"選擇", "是非"}:
        cleaned = strip_answer_marker(cleaned)
    return normalize_image_refs(cleaned)


def parse_markdown(markdown: str) -> List[Dict]:
    heading_re = re.compile(r"^\*\*(" + "|".join(re.escape(k) for k in SECTION_LABELS) + r")\*\*\s*$", re.M)
    headings = list(heading_re.finditer(markdown))
    rows: List[Dict] = []
    order = 0
    for h_idx, h in enumerate(headings):
        section_label = SECTION_LABELS[h.group(1)]
        start = h.end()
        end = headings[h_idx + 1].start() if h_idx + 1 < len(headings) else len(markdown)
        section_text = markdown[start:end]
        starts = list(re.finditer(r"(?m)^(\d+)\.\s", section_text))
        for idx, q_start in enumerate(starts):
            q_end = starts[idx + 1].start() if idx + 1 < len(starts) else len(section_text)
            raw = section_text[q_start.start():q_end].strip()
            m = re.match(r"^(\d+)\.\s*(.*)$", raw, flags=re.S)
            if not m or "《答案》" not in m.group(2):
                continue
            number = int(m.group(1))
            q_part, rest = m.group(2).split("《答案》", 1)
            answer_part, explain_part = rest.split("詳解：", 1) if "詳解：" in rest else (rest, "")
            question_text = clean_question_text(q_part, section_label)
            if not question_text:
                continue
            order += 1
            rows.append(
                {
                    "source_section": section_label,
                    "source_number": number,
                    "source_order": order,
                    "raw_question_text": question_text,
                    "answer_text": normalize_image_refs(j11_helpers.clean_markup(answer_part)),
                    "explanation_text": normalize_image_refs(j11_helpers.clean_markup(explain_part)),
                }
            )
    return rows


def has_any(text: str, words: List[str]) -> bool:
    return any(word in text for word in words)


def compact_text(text: str) -> str:
    return re.sub(r"\s+", "", text or "")


def looks_like_word_problem(compact: str, section: str) -> bool:
    return section == "計算" and has_any(
        compact,
        ["公分", "平方公分", "面積", "長方形", "正方形", "鐵絲", "工程", "天", "蘋果", "人", "班", "比賽", "連續", "整數", "偶數", "奇數", "二位數", "工作", "地磚", "公園", "馬路", "速率"],
    )


def classify_topic(text: str, section: str) -> str:
    compact = compact_text(text)
    if looks_like_word_problem(compact, section) or has_any(compact, ["蘋果", "正方形", "長方形", "面積", "鐵絲", "工程", "班遊", "比賽", "公園", "馬路", "二位數"]):
        if has_any(compact, ["面積", "正方形", "長方形", "地磚", "公園", "馬路", "鐵絲", "對角線", "直角三角形"]):
            return "geometry_area"
        if has_any(compact, ["工程", "工作天", "速率", "時間"]):
            return "rate_time"
        if has_any(compact, ["連續", "整數", "偶數", "奇數", "二位數"]):
            return "integer_sequence"
        if has_any(compact, ["分擔", "平均分", "倒數", "分式"]):
            return "fractional_equation"
        return "word_modeling"
    if has_any(compact, ["公式解", "利用公式", "ax2＋bx＋c", "ax^(2)＋bx＋c", "配方法證明", "x＝"]):
        return "quadratic_formula"
    if has_any(compact, ["判別式", "無解", "兩根", "根的個數", "b2－4ac", "b^(2)－4ac"]):
        if has_any(compact, ["無解", "兩根互為相反數", "解皆為質數", "m", "k", "a＝", "b＝", "c＝"]):
            return "parameter_equation"
        return "discriminant"
    if has_any(compact, ["配方", "完全平方式", "(x＋", "(x－", "化成", "平方"]) and not has_any(compact, ["兩根", "根與係數"]):
        return "completing_square"
    if has_any(compact, ["平方根", "直接開根號", "x2＝", "x^(2)＝"]):
        return "square_root_method"
    if has_any(compact, ["根與係數", "兩根和", "兩根積", "α", "β", "m＋n", "mn", "p×q", "另一個解", "兩根相差", "兩根為", "解得答案"]):
        return "vieta_basic"
    if has_any(compact, ["重根", "互為相反數", "無實根", "相同的解"]):
        return "double_root"
    if has_any(compact, ["代回", "驗根", "增解", "合理", "不合", "看錯", "正確解"]):
        return "root_check"
    if has_any(compact, ["十字交乘", "因式分解", "(x", ")(x", "AB＝0", "AB=0"]):
        return "factorization_solve"
    if has_any(compact, ["標準形", "一元二次方程式", "二次方程式"]):
        return "standard_form"
    return "method_selection" if section in {"填充", "計算"} else "factorization_solve"


def classify_branch(topic_key: str, text: str, section: str) -> Tuple[str, str]:
    branches = dict(BRANCHES[topic_key])
    compact = compact_text(text)
    if topic_key == "factorization_solve":
        key = "quadratic-cross-method-solving" if has_any(compact, ["十字交乘", ")(x", "因式分解"]) else "j3-4-1-factorization-solve"
    elif topic_key == "vieta_basic":
        key = "quadratic-restore-from-roots" if has_any(compact, ["看錯", "還原", "另一個解", "兩根為"]) else "quadratic-vieta-root-relations-junior"
    elif topic_key == "completing_square":
        key = "quadratic-completing-square-full" if has_any(compact, ["ax", "3x", "2x", "完整", "公式"]) else "j3-4-2-completing-square-main"
    elif topic_key == "quadratic_formula":
        key = "quadratic-formula-discriminant-junior" if has_any(compact, ["判別式", "b2", "4ac"]) else "j3-4-2-quadratic-formula"
    elif topic_key == "word_modeling":
        key = "quadratic-application-problems-junior"
    elif topic_key == "geometry_area":
        key = "quadratic-application-area"
    elif topic_key == "integer_sequence":
        key = "quadratic-application-consecutive-numbers"
    elif topic_key == "rate_time":
        key = "quadratic-application-change-rate"
    else:
        key = BRANCHES[topic_key][0][0]
    return key, branches.get(key, key)


def importance_score(row: Dict) -> Tuple[int, int, int, int]:
    weight = {"計算": 6, "填充": 5, "選擇": 3, "是非": 2}.get(row["source_section"], 1)
    text = row["raw_question_text"]
    conceptual = int(has_any(text, ["解", "方程式", "兩根", "配方法", "公式", "面積", "工程", "連續", "已知"]))
    return (weight, conceptual, min(len(text) // 90, 5), -int(row["source_order"]))


def assign_roles(rows: List[Dict]) -> None:
    topic_groups: Dict[str, List[Dict]] = defaultdict(list)
    branch_groups: Dict[str, List[Dict]] = defaultdict(list)
    for row in rows:
        topic_key = classify_topic(row["raw_question_text"], row["source_section"])
        chapter, topic_id, topic_title = TOPICS[topic_key]
        branch_id, branch_title = classify_branch(topic_key, row["raw_question_text"], row["source_section"])
        row.update(
            {
                "topic_key": topic_key,
                "chapter_code": chapter,
                "topic_id": topic_id,
                "topic_title": topic_title,
                "branch_id": branch_id,
                "branch_title": branch_title,
                "role": "",
                "target_level": "chapter",
                "target_id": "",
                "target_title": "",
            }
        )
        topic_groups[topic_id].append(row)
        branch_groups[branch_id].append(row)

    used = set()
    for topic_id, candidates in topic_groups.items():
        ranked = sorted(candidates, key=importance_score, reverse=True)
        take = min(5, max(3, len(ranked) // 7)) if len(ranked) >= 3 else len(ranked)
        for row in ranked[:take]:
            used.add(row["source_order"])
            row.update({"role": "範例", "target_level": "topic", "target_id": row["topic_id"], "target_title": row["topic_title"]})

    for branch_id, candidates in branch_groups.items():
        remaining = [row for row in sorted(candidates, key=importance_score, reverse=True) if row["source_order"] not in used]
        for row in remaining[:2]:
            used.add(row["source_order"])
            row.update({"role": "範例", "target_level": "branch", "target_id": row["branch_id"], "target_title": row["branch_title"]})
        for row in remaining[2:5]:
            used.add(row["source_order"])
            row.update({"role": "練習", "target_level": "branch", "target_id": row["branch_id"], "target_title": row["branch_title"]})

    for row in rows:
        if row["role"]:
            continue
        row["role"] = "習題" if row["source_section"] in {"填充", "計算"} else "題庫"
        row.update({"target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})

    exercise_count = sum(1 for row in rows if row["role"] == "習題")
    if exercise_count < 8:
        candidates = [row for row in rows if row["source_section"] in {"填充", "計算"} and row["role"] in {"範例", "練習"}]
        candidates.sort(key=importance_score)
        for row in candidates[: 8 - exercise_count]:
            row.update({"role": "習題", "target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["role"] in {"範例", "練習"}:
        return "中等" if row["source_section"] in {"選擇", "是非"} else "偏難"
    return "挑戰" if row["source_section"] == "計算" else "偏難"


def make_question(row: Dict) -> Dict:
    qid = f"{ID_PREFIX}-{int(row['source_order']):03d}"
    role = row["role"]
    group = {
        ("範例", "topic"): "topic-example",
        ("範例", "branch"): "branch-example",
        ("練習", "branch"): "branch-practice",
        ("習題", "chapter"): "chapter-exercise",
        ("題庫", "chapter"): "chapter-bank",
    }.get((role, row["target_level"]), f"chapter-{role_slug(role)}")
    tags = [
        "J34",
        row["chapter_code"],
        "一元二次方程式",
        f"role:{role_slug(role)}",
        f"group:{group}",
        f"source-section:{row['source_section']}",
        f"topic:{row['topic_id']}",
        f"branch:{row['branch_title']}",
    ]
    if row["target_level"] == "branch":
        tags.append(f"branch-topic:{row['branch_id']}")
    if row["target_level"] == "chapter":
        tags.append("chapter-only")
    return {
        "id": qid,
        "title": f"J34 {row['source_section']}第{int(row['source_number']):02d}題",
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
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


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
    q_payload["meta"].update({"count": len(q_rows), "updatedAt": datetime.now().isoformat(timespec="seconds"), "lastImportSource": SOURCE_REF})
    save_json(QUESTION_DB, q_payload)

    l_payload = load_json(LINK_DB, "links")
    l_rows = l_payload.get("links", []) if isinstance(l_payload.get("links"), list) else []
    lc, lu = upsert(l_rows, links)
    l_payload["links"] = l_rows
    l_payload.setdefault("meta", {})
    l_payload["meta"].update({"count": len(l_rows), "updatedAt": datetime.now().isoformat(timespec="seconds"), "lastImportSource": SOURCE_REF})
    save_json(LINK_DB, l_payload)
    return {"questions_created": qc, "questions_updated": qu, "links_created": lc, "links_updated": lu}


def build_preview(questions: List[Dict], links: List[Dict], applied: Dict = None) -> Dict:
    targets = Counter((q["target_level"], q["target_id"], q["target_title"]) for q in questions)
    return {
        "meta": {
            "source_docx": str(SOURCE_DOCX),
            "source_ref": SOURCE_REF,
            "question_count": len(questions),
            "link_count": len(links),
            "output_questions": str(OUT_QUESTIONS.relative_to(ROOT)).replace("\\", "/"),
            "output_links": str(OUT_LINKS.relative_to(ROOT)).replace("\\", "/"),
            "answer_marker_policy": "選擇題與是非題題幹開頭的（ ）作答括號已移除。",
            "role_policy": {
                "範例": "每個主題優先挑 3-5 題中等示範題；每個分支再挑 2 題。",
                "練習": "每個分支挑 3 題中等或偏難練習。",
                "習題": "剩餘填充、計算題以章節代號收納。",
                "題庫": "剩餘選擇/是非題以章節代號收納。",
            },
            "applied": applied or {},
        },
        "counts": {
            "by_role": dict(Counter(q["question_role"] for q in questions)),
            "by_chapter": dict(Counter(q["chapter_code"] for q in questions)),
            "by_section": dict(Counter(q["source_section"] for q in questions)),
        },
        "targets": [
            {"target_level": level, "target_id": target_id, "target_title": title, "count": count}
            for (level, target_id, title), count in sorted(targets.items(), key=lambda item: (item[0][0], item[0][1]))
        ],
        "sample_questions": questions[:5],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert J34 quadratic equation hard DOCX into question-bank import JSONL.")
    parser.add_argument("--source-docx", default=str(SOURCE_DOCX))
    parser.add_argument("--force-pandoc", action="store_true")
    parser.add_argument("--apply", action="store_true", help="Upsert generated questions and links into database JSON files.")
    args = parser.parse_args()

    source = Path(args.source_docx)
    if not source.exists():
        raise FileNotFoundError(source)
    run_pandoc(source, MARKDOWN_PATH, force=args.force_pandoc)
    rows = parse_markdown(MARKDOWN_PATH.read_text(encoding="utf-8"))
    assign_roles(rows)
    questions = [make_question(row) for row in rows]
    links = [make_link(q) for q in questions]
    write_jsonl(OUT_QUESTIONS, questions)
    write_jsonl(OUT_LINKS, links)
    applied = apply_to_db(questions, links) if args.apply else {}
    preview = build_preview(questions, links, applied)
    OUT_PREVIEW.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")
    if len({q["id"] for q in questions}) != len(questions):
        raise ValueError("Duplicate question IDs generated")
    if len({l["id"] for l in links}) != len(links):
        raise ValueError("Duplicate link IDs generated")
    bad_markers = [
        q["id"]
        for q in questions
        if q["source_section"] in {"選擇", "是非"} and re.match(r"^\s*[（(]\s*\n?\s*[）)](?!\^)", q["question_text"])
    ]
    if bad_markers:
        raise ValueError(f"Answer markers were not stripped: {bad_markers[:5]}")
    print(json.dumps(preview["meta"], ensure_ascii=False, indent=2))
    print(json.dumps(preview["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
