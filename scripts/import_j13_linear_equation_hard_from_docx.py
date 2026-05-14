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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J13一元一次方程式困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j13-linear-equation-hard"
MARKDOWN_PATH = WORK_DIR / "j13-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"

SOURCE_REF = "J13一元一次方程式困難題題目答案卷.docx"
ID_PREFIX = "q-j13-linear-equation-hard"

OUT_QUESTIONS = OUT_DIR / "q-j13-linear-equation-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j13-linear-equation-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j13-linear-equation-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


TOPICS = {
    "symbolize": ("j1-3-1", "j1-3-1-symbolize-quantity", "用符號代表數與量"),
    "consecutive": ("j1-3-1", "j1-3-1-consecutive-numbers", "連續整數列式"),
    "expression_value": ("j1-3-1", "j1-3-1-substitution-value", "代入求值與符號意義"),
    "word_expression": ("j1-3-1", "j1-3-1-word-to-expression", "文字敘述轉代數式"),
    "basic_equation": ("j1-3-2", "j1-3-2-equation-main", "一元一次方程式核心觀念"),
    "clear_denominator": ("j1-3-2", "j1-3-2-clear-denominator", "含分數方程式與去分母"),
    "remove_brackets": ("j1-3-2", "j1-3-2-distributive-remove-brackets", "分配律與去括號"),
    "solution_types": ("j1-3-2", "j1-3-2-solution-types", "解的型態：唯一解、無解、無限多解"),
    "age": ("j1-3-3", "j1-3-3-age-problems", "年齡題建模"),
    "distance": ("j1-3-3", "j1-3-3-distance-rate-time", "行程問題（距離、速度、時間）"),
    "mixture_ratio": ("j1-3-3", "j1-3-3-mixture-ratio", "混合與比例應用"),
    "profit_budget": ("j1-3-3", "j1-3-3-profit-budget", "金額與收支題"),
    "word_problem": ("j1-3-3", "j1-3-3-word-problem-main", "應用問題建模總流程"),
}


BRANCHES = {
    "symbolize": [("j1-3-1-symbolize-quantity", "用符號代表數與量"), ("j1-3-1-multiply-divide-notation", "乘除簡記與代數式整理")],
    "consecutive": [("j1-3-1-consecutive-numbers", "連續整數列式"), ("j1-3-1-odd-even-sequences", "連續奇偶數列式")],
    "expression_value": [("j1-3-1-substitution-value", "代入求值與符號意義"), ("j1-3-1-multiply-divide-notation", "乘除簡記與代數式整理")],
    "word_expression": [("j1-3-1-word-to-expression", "文字敘述轉代數式"), ("j1-3-1-symbolize-quantity", "用符號代表數與量")],
    "basic_equation": [("j1-3-2-equality-axiom-transpose", "等量公理與移項法則"), ("j1-3-2-combine-like-terms", "合併同類項"), ("linear-move-terms-solve-drill", "移項求解")],
    "clear_denominator": [("j1-3-2-clear-denominator", "含分數方程式與去分母"), ("linear-lcm-multiply-move-solve-drill", "同乘公倍數後整理移項求解")],
    "remove_brackets": [("j1-3-2-distributive-remove-brackets", "分配律與去括號"), ("linear-remove-parentheses-drill", "去括號（一元一次）"), ("linear-multiply-parentheses-drill", "有乘法的去括號（一元一次）")],
    "solution_types": [("j1-3-2-solution-types", "解的型態：唯一解、無解、無限多解"), ("j1-3-2-check-solution", "驗算與合理性檢查")],
    "age": [("j1-3-3-age-problems", "年齡題建模")],
    "distance": [("j1-3-3-distance-rate-time", "行程問題（距離、速度、時間）")],
    "mixture_ratio": [("j1-3-3-mixture-ratio", "混合與比例應用")],
    "profit_budget": [("j1-3-3-profit-budget", "金額與收支題")],
    "word_problem": [("j1-3-3-word-problem-main", "應用問題建模總流程"), ("j1-3-3-chicken-rabbit", "雞兔同籠與頭腳關係"), ("j1-3-3-consecutive-number-app", "連續數應用題")],
}


SECTION_LABELS = {"一、選擇": "選擇", "二、填充": "填充", "三、計算": "計算", "四、是非": "是非"}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def run_pandoc(source: Path, markdown_path: Path, force: bool = False) -> None:
    if markdown_path.exists() and not force:
        return
    markdown_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["pandoc", str(source), "-t", "gfm", f"--extract-media={MEDIA_DIR}", "-o", str(markdown_path)], cwd=ROOT, check=True)


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
        q_starts = list(re.finditer(r"(?m)^(\d+)\.\s", section_text))
        for idx, q_start in enumerate(q_starts):
            q_end = q_starts[idx + 1].start() if idx + 1 < len(q_starts) else len(section_text)
            raw = section_text[q_start.start():q_end].strip()
            m = re.match(r"^(\d+)\.\s*(.*)$", raw, flags=re.S)
            if not m or "《答案》" not in m.group(2):
                continue
            number = int(m.group(1))
            block = m.group(2)
            q_part, rest = block.split("《答案》", 1)
            answer_part, explain_part = rest.split("詳解：", 1) if "詳解：" in rest else (rest, "")
            question_text = j11_helpers.clean_markup(q_part)
            if not question_text:
                continue
            order += 1
            rows.append({
                "source_section": section_label,
                "source_number": number,
                "source_order": order,
                "raw_question_text": question_text,
                "answer_text": j11_helpers.clean_markup(answer_part),
                "explanation_text": j11_helpers.clean_markup(explain_part),
            })
    return rows


def has_any(text: str, words: List[str]) -> bool:
    return any(word in text for word in words)


def classify_topic(text: str) -> str:
    if has_any(text, ["年齡", "現年", "歲", "父", "母", "兒子", "女兒"]):
        return "age"
    if has_any(text, ["速度", "速率", "公里", "公尺/秒", "分鐘", "小時", "相遇", "追上", "時針", "分針", "鐘面", "上網"]):
        return "distance"
    if has_any(text, ["濃度", "混合", "比例", "比值", "折", "百分", "%", "％", "面積", "體積", "花圃", "土地"]):
        return "mixture_ratio"
    if has_any(text, ["元", "錢", "價格", "單價", "費用", "收費", "買", "賣", "借", "剩下"]):
        return "profit_budget"
    if has_any(text, ["連續", "奇數", "偶數", "整數"]):
        return "consecutive"
    if has_any(text, ["無解", "無限多解", "唯一解"]):
        return "solution_types"
    if has_any(text, ["分母", "分數", "去分母"]) or re.search(r"\\\[|＝.*／", text):
        return "clear_denominator"
    if has_any(text, ["括號", "展開", "分配律"]):
        return "remove_brackets"
    if has_any(text, ["方程式", "解為", "解是", "求x", "x＝", "y＝"]) or ("＝" in text and "x" in text and has_any(text, ["值為何", "求", "已知"])):
        return "basic_equation"
    if "表示" in text and "x" in text:
        return "symbolize"
    if has_any(text, ["代入", "算式", "表中", "a＝", "b＝", "c＝", "值為何"]):
        return "expression_value"
    if has_any(text, ["列方程式", "依題意", "設", "x元", "x公尺", "x分鐘"]):
        return "word_expression"
    return "word_problem"


def classify_branch(topic_key: str, text: str) -> Tuple[str, str]:
    branches = dict(BRANCHES[topic_key])
    if topic_key == "basic_equation":
        if has_any(text, ["同類項", "合併"]):
            key = "j1-3-2-combine-like-terms"
        else:
            key = "linear-move-terms-solve-drill"
    elif topic_key == "remove_brackets":
        if has_any(text, ["乘", "×"]):
            key = "linear-multiply-parentheses-drill"
        elif "括號" in text:
            key = "linear-remove-parentheses-drill"
        else:
            key = "j1-3-2-distributive-remove-brackets"
    elif topic_key == "clear_denominator":
        key = "linear-lcm-multiply-move-solve-drill" if has_any(text, ["公倍", "分母"]) else "j1-3-2-clear-denominator"
    elif topic_key == "word_problem":
        if has_any(text, ["雞", "兔", "頭", "腳"]):
            key = "j1-3-3-chicken-rabbit"
        elif has_any(text, ["連續", "整數"]):
            key = "j1-3-3-consecutive-number-app"
        else:
            key = "j1-3-3-word-problem-main"
    else:
        key = BRANCHES[topic_key][0][0]
    return key, branches.get(key, key)


def importance_score(row: Dict) -> Tuple[int, int, int]:
    section_weight = {"計算": 5, "填充": 4, "選擇": 3, "是非": 2}.get(row["source_section"], 1)
    return (section_weight, min(len(row["raw_question_text"]) // 80, 5), -int(row["source_order"]))


def assign_roles(rows: List[Dict]) -> None:
    topic_groups: Dict[str, List[Dict]] = defaultdict(list)
    branch_groups: Dict[str, List[Dict]] = defaultdict(list)
    for row in rows:
        topic_key = classify_topic(row["raw_question_text"])
        chapter, topic_id, topic_title = TOPICS[topic_key]
        branch_id, branch_title = classify_branch(topic_key, row["raw_question_text"])
        row.update({"topic_key": topic_key, "chapter_code": chapter, "topic_id": topic_id, "topic_title": topic_title, "branch_id": branch_id, "branch_title": branch_title, "role": "", "target_level": "chapter", "target_id": "", "target_title": ""})
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


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["role"] in {"範例", "練習"}:
        return "中等" if row["source_section"] in {"選擇", "是非"} else "偏難"
    return "挑戰" if row["source_section"] == "計算" else "偏難"


def make_question(row: Dict) -> Dict:
    qid = f"{ID_PREFIX}-{int(row['source_order']):03d}"
    role = row["role"]
    group = {("範例", "topic"): "topic-example", ("範例", "branch"): "branch-example", ("練習", "branch"): "branch-practice", ("習題", "chapter"): "chapter-exercise", ("題庫", "chapter"): "chapter-bank"}.get((role, row["target_level"]), f"chapter-{role_slug(role)}")
    tags = ["J13", row["chapter_code"], f"role:{role_slug(role)}", f"group:{group}", f"source-section:{row['source_section']}", f"topic:{row['topic_id']}", f"branch:{row['branch_title']}"]
    if row["target_level"] == "branch":
        tags.append(f"branch-topic:{row['branch_id']}")
    if row["target_level"] == "chapter":
        tags.append("chapter-only")
    return {"id": qid, "title": f"J13 {row['source_section']}第{int(row['source_number']):02d}題", "question_text": row["raw_question_text"], "answer_text": row["answer_text"], "explanation_text": row["explanation_text"], "stage": "國中", "grade": "國一", "chapter": row["chapter_code"], "chapter_code": row["chapter_code"], "difficulty": difficulty_for(row), "source_type": "word_docx_import", "source_ref": SOURCE_REF, "question_role": role, "target_level": row["target_level"], "target_id": row["target_id"], "target_title": row["target_title"], "source_section": row["source_section"], "source_number": row["source_number"], "source_order": row["source_order"], "tags": tags}


def make_link(question: Dict) -> Dict:
    level = question.get("target_level", "chapter")
    chapter_code = question["chapter_code"]
    qid = question["id"]
    if level in {"topic", "branch"}:
        topic_id, link_level, target = question["target_id"], "topic", question["target_id"]
    else:
        topic_id, link_level, target = "", "chapter", chapter_code
    return {"id": re.sub(r"[^A-Za-z0-9_-]+", "-", f"link-{qid}-{link_level}-{target}").strip("-").lower(), "title": f"{qid} -> {target}", "question_id": qid, "question_title": question.get("title", ""), "topic_id": topic_id, "chapter_code": chapter_code, "link_level": link_level, "source_type": "manual-docx-structured-pack", "source_ref": SOURCE_REF, "confidence": 1.0 if topic_id else 0.9, "created_at": now_iso(), "updated_at": now_iso()}


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
    return {"meta": {"source_docx": str(SOURCE_DOCX), "source_ref": SOURCE_REF, "question_count": len(questions), "link_count": len(links), "output_questions": str(OUT_QUESTIONS.relative_to(ROOT)).replace("\\", "/"), "output_links": str(OUT_LINKS.relative_to(ROOT)).replace("\\", "/"), "role_policy": {"範例": "每個主題優先挑 3-5 題中等示範題；每個分支再挑 2 題。", "練習": "每個分支挑 3 題中等或偏難練習。", "習題": "剩餘填充、計算題以章節代號收納。", "題庫": "剩餘選擇/是非題以章節代號收納。"}, "applied": applied or {}}, "counts": {"by_role": dict(Counter(q["question_role"] for q in questions)), "by_chapter": dict(Counter(q["chapter_code"] for q in questions)), "by_section": dict(Counter(q["source_section"] for q in questions))}, "targets": [{"target_level": level, "target_id": target_id, "target_title": title, "count": count} for (level, target_id, title), count in sorted(targets.items(), key=lambda item: (item[0][0], item[0][1]))], "sample_questions": questions[:5]}


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert J13 linear equation hard DOCX into question-bank import JSONL.")
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
    print(json.dumps(preview["meta"], ensure_ascii=False, indent=2))
    print(json.dumps(preview["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
