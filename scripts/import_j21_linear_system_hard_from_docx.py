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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J21二元一次聯立方程式困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j21-linear-system-hard"
MARKDOWN_PATH = WORK_DIR / "j21-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"

SOURCE_REF = "J21二元一次聯立方程式困難題題目答案卷.docx"
ID_PREFIX = "q-j21-linear-system-hard"

OUT_QUESTIONS = OUT_DIR / "q-j21-linear-system-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j21-linear-system-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j21-linear-system-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


TOPICS = {
    "two_variable_equation": ("j2-1-1", "j2-1-1-two-variable-equation-main", "二元一次方程式核心觀念"),
    "ordered_pair_check": ("j2-1-1", "j2-1-1-ordered-pair-check", "數對代入與成立判斷"),
    "context_equation": ("j2-1-1", "j2-1-1-context-to-equation", "情境轉二元一次方程式"),
    "parameter": ("j2-1-1", "j2-1-1-parameter-substitution", "參數題代入求係數"),
    "system_main": ("j2-1-2", "j2-1-2-system-main", "二元一次聯立方程式核心觀念"),
    "substitution": ("j2-1-2", "j2-1-2-substitution-method", "代入消去法"),
    "elimination": ("j2-1-2", "j2-1-2-elimination-method", "加減消去法"),
    "fraction_system": ("j2-1-2", "j2-1-2-fraction-coefficients", "分數與小數係數聯立"),
    "solution_types": ("j2-1-2", "j2-1-2-solution-types", "解的型態判斷"),
    "integer_solution": ("j2-1-2", "positive-integer-solution-discussion", "正整數解的討論"),
    "price_quantity": ("j2-1-3", "j2-1-3-price-quantity-model", "價格與數量模型"),
    "chicken_rabbit": ("j2-1-3", "j2-1-3-chicken-rabbit-model", "雞兔同籠與頭腳模型"),
    "age_money": ("j2-1-3", "j2-1-3-age-money-model", "年齡與收支模型"),
    "digit_number": ("j2-1-3", "j2-1-3-digit-number-model", "數字與位值模型"),
    "rate_distance": ("j2-1-3", "j2-1-3-rate-distance-model", "速率與距離模型"),
    "word_problem": ("j2-1-3", "j2-1-3-word-problem-main", "應用題建模總流程"),
}


BRANCHES = {
    "two_variable_equation": [("j2-1-1-two-variable-equation-main", "二元一次方程式核心觀念"), ("j2-1-1-equivalent-transform", "等值變形與標準型")],
    "ordered_pair_check": [("j2-1-1-ordered-pair-check", "數對代入與成立判斷")],
    "context_equation": [("j2-1-1-context-to-equation", "情境轉二元一次方程式"), ("j2-1-1-integer-constraint", "整數解與情境限制")],
    "parameter": [("j2-1-1-parameter-substitution", "參數題代入求係數")],
    "system_main": [("j2-1-2-system-main", "二元一次聯立方程式核心觀念"), ("j2-1-2-method-selection", "解法選擇策略")],
    "substitution": [("j2-1-2-substitution-method", "代入消去法"), ("substitution-elimination", "代入消去法")],
    "elimination": [("j2-1-2-elimination-method", "加減消去法"), ("addition-subtraction-elimination", "加減消去法")],
    "fraction_system": [("j2-1-2-fraction-coefficients", "分數與小數係數聯立")],
    "solution_types": [("j2-1-2-solution-types", "解的型態判斷"), ("linear-system-inconsistent", "矛盾方程式"), ("linear-system-dependent", "相依方程式")],
    "integer_solution": [("positive-integer-solution-discussion", "正整數解的討論"), ("nonnegative-system", "非負整數型")],
    "price_quantity": [("j2-1-3-price-quantity-model", "價格與數量模型")],
    "chicken_rabbit": [("j2-1-3-chicken-rabbit-model", "雞兔同籠與頭腳模型")],
    "age_money": [("j2-1-3-age-money-model", "年齡與收支模型")],
    "digit_number": [("j2-1-3-digit-number-model", "數字與位值模型")],
    "rate_distance": [("j2-1-3-rate-distance-model", "速率與距離模型")],
    "word_problem": [("j2-1-3-word-problem-main", "應用題建模總流程"), ("j2-1-3-validate-answer", "答案合理性檢核")],
}


SECTION_LABELS = {"一、選擇": "選擇", "二、填充": "填充", "三、應用": "應用", "四、題組": "題組", "五、計算": "計算", "六、是非": "是非"}


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
            question_text = j11_helpers.clean_markup(q_part)
            if not question_text:
                continue
            order += 1
            rows.append({"source_section": section_label, "source_number": number, "source_order": order, "raw_question_text": question_text, "answer_text": j11_helpers.clean_markup(answer_part), "explanation_text": j11_helpers.clean_markup(explain_part)})
    return rows


def has_any(text: str, words: List[str]) -> bool:
    return any(word in text for word in words)


def classify_topic(text: str) -> str:
    if has_any(text, ["無解", "無限多", "相依", "矛盾", "平行", "重合"]):
        return "solution_types"
    if has_any(text, ["二元一次聯立方程式", "聯立方程式", "方程組", "解為x", "解為", "求x", "求y", "代入", "消去"]):
        if has_any(text, ["代入"]):
            return "substitution"
        return "elimination"
    if has_any(text, ["買", "賣", "價錢", "價格", "每個", "每杯", "花的錢", "元", "票", "費用"]):
        return "price_quantity"
    if has_any(text, ["雞", "兔", "頭", "腳", "乳牛", "牛", "瓶", "酒", "成人"]):
        return "chicken_rabbit"
    if has_any(text, ["歲", "年齡", "校長", "收支", "錢", "甲給乙", "乙給甲"]):
        return "age_money"
    if has_any(text, ["十位", "個位", "二位數", "三位數", "數字", "被加數", "加數"]):
        return "digit_number"
    if has_any(text, ["速度", "速率", "距離", "公里", "公尺", "分鐘", "小時", "追", "相遇", "水流"]):
        return "rate_distance"
    if has_any(text, ["整數解", "正整數", "非負", "最大公因數", "x＞y"]):
        return "integer_solution"
    if has_any(text, ["分數", "小數", "去分母"]):
        return "fraction_system"
    if has_any(text, ["k", "參數", "a、b", "a、b、c", "係數"]):
        return "parameter"
    if has_any(text, ["關係式", "二元一次方程式", "數對", "代入"]):
        return "ordered_pair_check"
    if has_any(text, ["設", "依題意", "列"]):
        return "context_equation"
    return "word_problem"


def classify_branch(topic_key: str, text: str) -> Tuple[str, str]:
    branches = dict(BRANCHES[topic_key])
    if topic_key == "solution_types":
        key = "linear-system-inconsistent" if has_any(text, ["無解", "矛盾", "平行"]) else ("linear-system-dependent" if has_any(text, ["無限", "相依", "重合"]) else "j2-1-2-solution-types")
    elif topic_key == "integer_solution":
        key = "nonnegative-system" if has_any(text, ["非負", "絕對值"]) else "positive-integer-solution-discussion"
    elif topic_key == "elimination":
        key = "addition-subtraction-elimination"
    elif topic_key == "substitution":
        key = "substitution-elimination"
    else:
        key = BRANCHES[topic_key][0][0]
    return key, branches.get(key, key)


def importance_score(row: Dict) -> Tuple[int, int, int]:
    weight = {"計算": 5, "題組": 5, "應用": 5, "填充": 4, "選擇": 3, "是非": 2}.get(row["source_section"], 1)
    return (weight, min(len(row["raw_question_text"]) // 80, 5), -int(row["source_order"]))


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
        row["role"] = "習題" if row["source_section"] in {"填充", "應用", "題組", "計算"} else "題庫"
        row.update({"target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["role"] in {"範例", "練習"}:
        return "中等" if row["source_section"] in {"選擇", "是非"} else "偏難"
    return "挑戰" if row["source_section"] in {"應用", "題組", "計算"} else "偏難"


def make_question(row: Dict) -> Dict:
    qid = f"{ID_PREFIX}-{int(row['source_order']):03d}"
    role = row["role"]
    group = {("範例", "topic"): "topic-example", ("範例", "branch"): "branch-example", ("練習", "branch"): "branch-practice", ("習題", "chapter"): "chapter-exercise", ("題庫", "chapter"): "chapter-bank"}.get((role, row["target_level"]), f"chapter-{role_slug(role)}")
    tags = ["J21", row["chapter_code"], f"role:{role_slug(role)}", f"group:{group}", f"source-section:{row['source_section']}", f"topic:{row['topic_id']}", f"branch:{row['branch_title']}"]
    if row["target_level"] == "branch":
        tags.append(f"branch-topic:{row['branch_id']}")
    if row["target_level"] == "chapter":
        tags.append("chapter-only")
    return {"id": qid, "title": f"J21 {row['source_section']}第{int(row['source_number']):02d}題", "question_text": row["raw_question_text"], "answer_text": row["answer_text"], "explanation_text": row["explanation_text"], "stage": "國中", "grade": "國二", "chapter": row["chapter_code"], "chapter_code": row["chapter_code"], "difficulty": difficulty_for(row), "source_type": "word_docx_import", "source_ref": SOURCE_REF, "question_role": role, "target_level": row["target_level"], "target_id": row["target_id"], "target_title": row["target_title"], "source_section": row["source_section"], "source_number": row["source_number"], "source_order": row["source_order"], "tags": tags}


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
    return {"meta": {"source_docx": str(SOURCE_DOCX), "source_ref": SOURCE_REF, "question_count": len(questions), "link_count": len(links), "output_questions": str(OUT_QUESTIONS.relative_to(ROOT)).replace("\\", "/"), "output_links": str(OUT_LINKS.relative_to(ROOT)).replace("\\", "/"), "role_policy": {"範例": "每個主題優先挑 3-5 題中等示範題；每個分支再挑 2 題。", "練習": "每個分支挑 3 題中等或偏難練習。", "習題": "剩餘填充、應用、題組、計算題以章節代號收納。", "題庫": "剩餘選擇/是非題以章節代號收納。"}, "applied": applied or {}}, "counts": {"by_role": dict(Counter(q["question_role"] for q in questions)), "by_chapter": dict(Counter(q["chapter_code"] for q in questions)), "by_section": dict(Counter(q["source_section"] for q in questions))}, "targets": [{"target_level": level, "target_id": target_id, "target_title": title, "count": count} for (level, target_id, title), count in sorted(targets.items(), key=lambda item: (item[0][0], item[0][1]))], "sample_questions": questions[:5]}


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert J21 linear system hard DOCX into question-bank import JSONL.")
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
