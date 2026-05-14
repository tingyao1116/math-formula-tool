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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J33因式分解困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j33-factorization-hard"
MARKDOWN_PATH = WORK_DIR / "j33-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"

SOURCE_REF = "J33因式分解困難題題目答案卷.docx"
ID_PREFIX = "q-j33-factorization-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j33-factorization-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j33-factorization-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j33-factorization-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


TOPICS = {
    "common_factor": ("j3-3-1", "j3-3-1-common-factor-main", "提公因式基本法"),
    "number_letter_gcf": ("j3-3-1", "j3-3-1-number-letter-gcf", "數字與字母公因式"),
    "grouping_factor": ("j3-3-1", "j3-3-1-grouping-factor", "分組提公因式"),
    "sign_adjust": ("j3-3-1", "j3-3-1-sign-adjust-factor", "提負號與變號整理"),
    "bracket_factor": ("j3-3-1", "j3-3-1-bracket-common-factor", "整塊括號視為公因式"),
    "multiply_check": ("j3-3-1", "j3-3-1-multiply-back-check", "回乘驗證策略"),
    "diff_square": ("j3-3-2", "j3-3-2-diff-square-factor", "平方差公式因式分解"),
    "perfect_square": ("j3-3-2", "j3-3-2-perfect-square-factor", "完全平方公式因式分解"),
    "formula_recognition": ("j3-3-2", "j3-3-2-formula-recognition", "公式辨識與套用順序"),
    "recursive_factor": ("j3-3-2", "j3-3-2-recursive-factor", "連續分解到最終形"),
    "formula_value": ("j3-3-2", "j3-3-2-formula-value", "因式分解與代值運算"),
    "cross_main": ("j3-3-3", "j3-3-3-cross-main", "十字交乘基本法"),
    "ac_pair": ("j3-3-3", "j3-3-3-ac-pair-selection", "ac 配對與符號判斷"),
    "split_middle": ("j3-3-3", "j3-3-3-split-middle-term", "拆中項再分組"),
    "leading_not_one": ("j3-3-3", "j3-3-3-leading-coef-not-one", "首項係數不為 1"),
    "pre_cleaning": ("j3-3-3", "j3-3-3-pre-cleaning", "先整理再十字交乘"),
    "cross_validation": ("j3-3-3", "j3-3-3-cross-validation", "展開回驗與完整分解"),
}


BRANCHES = {
    key: [(chapter_topic[1], chapter_topic[2])] for key, chapter_topic in TOPICS.items()
}
BRANCHES["common_factor"].extend([
    ("factor-common-basic-examples", "提公因式範例"),
    ("factor-repeated-common-factor", "連續提公因式"),
])
BRANCHES["grouping_factor"].extend([
    ("factor-grouping-common-factor", "分組提公因式"),
    ("factor-six-terms-common-factor", "六項提公因式"),
])
BRANCHES["sign_adjust"].append(("factor-change-sign-first", "先變號再提公因式"))
BRANCHES["diff_square"].append(("factor-identity-difference-of-squares", "平方差"))
BRANCHES["perfect_square"].append(("factor-perfect-square-trinomial", "和差平方"))
BRANCHES["formula_recognition"].extend([
    ("factor-group-then-difference-of-squares", "分組提公因式後再平方差"),
    ("factor-group-then-perfect-square", "分組提公因式後再和差平方"),
])
BRANCHES["cross_main"].append(("cross-warmup-leading-one", "二次項係數為 1 的十字交乘"))
BRANCHES["leading_not_one"].append(("cross-leading-not-one", "二次項係數不為 1 的十字交乘"))
BRANCHES["pre_cleaning"].append(("cross-simplify-first", "先整理再十字交乘"))
BRANCHES["cross_validation"].append(("j3-3-3-cross-validation", "展開回驗與完整分解"))


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、題組": "題組",
    "四、計算": "計算",
    "五、是非": "是非",
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


def clean_question_text(text: str, section: str) -> str:
    cleaned = j11_helpers.clean_markup(text)
    if section in {"選擇", "是非"}:
        cleaned = strip_answer_marker(cleaned)
    return cleaned


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
                    "answer_text": j11_helpers.clean_markup(answer_part),
                    "explanation_text": j11_helpers.clean_markup(explain_part),
                }
            )
    return rows


def has_any(text: str, words: List[str]) -> bool:
    return any(word in text for word in words)


def compact_text(text: str) -> str:
    return re.sub(r"\s+", "", text or "")


def classify_topic(text: str, section: str) -> str:
    compact = compact_text(text)
    if has_any(compact, ["回乘", "展開", "驗證", "不是", "正確", "錯誤", "何者是", "何者不是"]) and section in {"選擇", "是非"}:
        if has_any(compact, ["平方差", "完全平方", "^4", "x4"]):
            return "formula_recognition"
        if has_any(compact, ["x2", "x^(2)", "二次", "px", "q"]):
            return "cross_validation"
        return "multiply_check"
    if has_any(compact, ["倍式", "因式", "可被", "整除", "除法", "餘式", "x＋1", "x－1", "x－2", "2x－3"]):
        if has_any(compact, ["x3", "x^(3)", "三次", "四次", "x4", "x^(4)"]):
            return "recursive_factor"
        return "cross_validation"
    if has_any(compact, ["十字交乘", "係數為整數的一次式", "ac", "拆中項"]):
        return "leading_not_one" if has_any(compact, ["2x", "3x", "4x", "5x", "6x", "8x", "108x"]) else "cross_main"
    if has_any(compact, ["x2", "x^(2)", "二次項", "px", "kx", "mx", "nx"]):
        if has_any(compact, ["先整理", "移項", "加上常數", "看成", "除以", "商式"]):
            return "pre_cleaning"
        if has_any(compact, ["2x2", "3x2", "4x2", "5x2", "6x2", "8x2", "108x2"]):
            return "leading_not_one"
        return "cross_main"
    if has_any(compact, ["完全平方", "平方公式", "平方項", "(x", "4(", "9", "25", "(a－b＋2)2", "2＝"]):
        return "perfect_square"
    if has_any(compact, ["平方差", "差平方", "a2－b2", "x4", "x^(4)", "－y4", "－y^(4)", "立方", "x3", "x^(3)"]):
        return "diff_square" if not has_any(compact, ["倍式", "因式x"]) else "recursive_factor"
    if has_any(compact, ["代值", "求＝", "計算", "0.64", "45", "9987", "2000"]):
        return "formula_value"
    if has_any(compact, ["分組", "六項", "xy", "yz", "xz", "ab", "bc", "ac"]) and len(compact) > 30:
        return "grouping_factor"
    if has_any(compact, ["－(", "-(", "a－b", "b－a", "提負號", "變號"]):
        return "sign_adjust"
    if has_any(compact, ["(", ")"]) and has_any(compact, ["視為", "ax", "by", "括號"]):
        return "bracket_factor"
    if has_any(compact, ["公因式", "提公因式", "共同因式"]):
        return "number_letter_gcf" if has_any(compact, ["x2", "y2", "a2", "係數"]) else "common_factor"
    if section in {"填充", "計算", "題組"}:
        return "formula_recognition"
    return "common_factor"


def classify_branch(topic_key: str, text: str, section: str) -> Tuple[str, str]:
    branches = dict(BRANCHES[topic_key])
    compact = compact_text(text)
    if topic_key == "common_factor":
        key = "factor-repeated-common-factor" if has_any(compact, ["連續", "再", "最終"]) else "j3-3-1-common-factor-main"
    elif topic_key == "grouping_factor":
        key = "factor-six-terms-common-factor" if compact.count("＋") + compact.count("－") >= 5 else "j3-3-1-grouping-factor"
    elif topic_key == "diff_square":
        key = "factor-identity-difference-of-squares" if has_any(compact, ["平方差", "x4", "y4", "a2－b2"]) else "j3-3-2-diff-square-factor"
    elif topic_key == "perfect_square":
        key = "factor-perfect-square-trinomial" if has_any(compact, ["完全平方", "平方"]) else "j3-3-2-perfect-square-factor"
    elif topic_key == "formula_recognition":
        if has_any(compact, ["平方差", "x4", "y4"]):
            key = "factor-group-then-difference-of-squares"
        elif has_any(compact, ["完全平方", "平方"]):
            key = "factor-group-then-perfect-square"
        else:
            key = "j3-3-2-formula-recognition"
    elif topic_key == "cross_main":
        key = "cross-warmup-leading-one" if not has_any(compact, ["2x2", "3x2", "4x2", "5x2", "6x2", "8x2"]) else "j3-3-3-cross-main"
    elif topic_key == "leading_not_one":
        key = "cross-leading-not-one"
    elif topic_key == "pre_cleaning":
        key = "cross-simplify-first"
    else:
        key = BRANCHES[topic_key][0][0]
    return key, branches.get(key, key)


def importance_score(row: Dict) -> Tuple[int, int, int, int]:
    weight = {"計算": 6, "題組": 6, "填充": 5, "選擇": 3, "是非": 2}.get(row["source_section"], 1)
    text = row["raw_question_text"]
    conceptual = int(has_any(text, ["因式分解", "因式", "何者", "已知", "完成", "求", "計算"]))
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
        row["role"] = "習題" if row["source_section"] in {"填充", "題組", "計算"} else "題庫"
        row.update({"target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})

    exercise_count = sum(1 for row in rows if row["role"] == "習題")
    if exercise_count < 8:
        candidates = [
            row
            for row in rows
            if row["source_section"] in {"填充", "題組", "計算"} and row["role"] in {"範例", "練習"}
        ]
        candidates.sort(key=importance_score)
        for row in candidates[: 8 - exercise_count]:
            row.update({"role": "習題", "target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["role"] in {"範例", "練習"}:
        return "中等" if row["source_section"] in {"選擇", "是非"} else "偏難"
    return "挑戰" if row["source_section"] in {"題組", "計算"} else "偏難"


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
        "J33",
        row["chapter_code"],
        "因式分解",
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
        "title": f"J33 {row['source_section']}第{int(row['source_number']):02d}題",
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
                "習題": "剩餘填充、題組、計算題以章節代號收納。",
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
    parser = argparse.ArgumentParser(description="Convert J33 factorization hard DOCX into question-bank import JSONL.")
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
