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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J23比與比例式困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j23-ratio-proportion-hard"
MARKDOWN_PATH = WORK_DIR / "j23-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"

SOURCE_REF = "J23比與比例式困難題題目答案卷.docx"
ID_PREFIX = "q-j23-ratio-proportion-hard"
OUT_QUESTIONS = OUT_DIR / "q-j23-ratio-proportion-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j23-ratio-proportion-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j23-ratio-proportion-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


TOPICS = {
    "ratio_simplify": ("j2-3-1", "j2-3-1-simplify-integer-ratio", "最簡整數比化簡"),
    "equal_ratio": ("j2-3-1", "j2-3-1-equal-ratio-judge", "相等的比判斷"),
    "proportion": ("j2-3-1", "j2-3-1-proportion-main", "比例式與性質"),
    "distribution": ("j2-3-1", "j2-3-1-ratio-distribution", "按比分配與總份數法"),
    "compound_ratio": ("j2-3-1", "j2-3-1-compound-ratio", "連比與連比例式"),
    "concentration": ("j2-3-1", "concentration-solution-basic", "濃度、溶質、溶液、溶劑"),
    "price": ("j2-3-1", "cost-list-sale-price", "成本、定價、售價"),
    "speed": ("j2-3-1", "distance-time-speed-basic", "距離、時間、速度"),
    "direct": ("j2-3-2", "j2-3-2-direct-proportion", "正比例關係式"),
    "inverse": ("j2-3-2", "j2-3-2-inverse-proportion", "反比例關係式"),
    "graph": ("j2-3-2", "j2-3-2-judgement-and-validation", "正比反比綜合判斷"),
    "direct_inverse_app": ("j2-3-2", "j2-3-2-direct-inverse-application", "正反比應用題"),
}


BRANCHES = {
    "ratio_simplify": [("j2-3-1-simplify-integer-ratio", "最簡整數比化簡"), ("proportion-scale-expand", "放大縮小與約分擴分")],
    "equal_ratio": [("j2-3-1-equal-ratio-judge", "相等的比判斷")],
    "proportion": [("j2-3-1-proportion-main", "比例式與性質"), ("proportion-cross-product", "內內 = 外外"), ("proportion-constant-r", "比例常數 r")],
    "distribution": [("j2-3-1-ratio-distribution", "按比分配與總份數法"), ("proportion-distribution", "比例分配")],
    "compound_ratio": [("j2-3-1-compound-ratio", "連比與連比例式"), ("j2-3-1-minimal-compound-ratio", "最簡整數連比")],
    "concentration": [("concentration-solution-basic", "濃度、溶質、溶液、溶劑")],
    "price": [("cost-list-sale-price", "成本、定價、售價"), ("discount-price-difference", "打折與價差列式")],
    "speed": [("distance-time-speed-basic", "距離、時間、速度")],
    "direct": [("j2-3-2-direct-proportion", "正比例關係式"), ("direct-proportion-basic", "正比")],
    "inverse": [("j2-3-2-inverse-proportion", "反比例關係式"), ("inverse-proportion-graph", "反比")],
    "graph": [("j2-3-2-judgement-and-validation", "正比反比綜合判斷"), ("j2-3-2-direct-graph", "正比圖形"), ("j2-3-2-inverse-graph", "反比圖形判讀")],
    "direct_inverse_app": [("j2-3-2-direct-inverse-application", "正反比應用題")],
}


SECTION_LABELS = {"一、選擇": "選擇", "二、填充": "填充", "三、配合題": "配合題", "四、應用": "應用", "五、題組": "題組", "六、計算": "計算", "七、是非": "是非"}


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
    if has_any(text, ["正比", "成正比"]) and has_any(text, ["反比", "成反比"]):
        return "graph"
    if has_any(text, ["成正比", "正比例", "正比"]):
        return "direct"
    if has_any(text, ["成反比", "反比例", "反比"]):
        return "inverse"
    if has_any(text, ["圖形", "函數圖形", "關係圖"]):
        return "graph"
    if has_any(text, ["濃度", "糖水", "溶液", "溶質", "溶劑", "公克的水", "加多少水"]):
        return "concentration"
    if has_any(text, ["成本", "定價", "售價", "打折", "價差", "獲利", "虧損"]):
        return "price"
    if has_any(text, ["速率", "速度", "距離", "時間", "每分鐘", "每小時", "公里", "公尺"]):
        return "speed"
    if has_any(text, ["連比", "a：b：c", "a:b:c", "：：", "(b＋c)：", "a＋b＋c"]):
        return "compound_ratio"
    if has_any(text, ["分配", "總份", "共有", "花片", "各", "分成"]) and "：" in text:
        return "distribution"
    if has_any(text, ["比例式", "內項", "外項", "內內", "外外", "比例常數", "＝"]):
        return "proportion"
    if has_any(text, ["可能用了多少", "相等", "比與", "比為"]):
        return "equal_ratio"
    if "：" in text or ":" in text or "比" in text:
        return "ratio_simplify"
    return "direct_inverse_app"


def classify_branch(topic_key: str, text: str) -> Tuple[str, str]:
    branches = dict(BRANCHES[topic_key])
    if topic_key == "proportion":
        key = "proportion-cross-product" if has_any(text, ["內", "外", "交叉", "比例式"]) else ("proportion-constant-r" if "比例常數" in text else "j2-3-1-proportion-main")
    elif topic_key == "compound_ratio":
        key = "j2-3-1-minimal-compound-ratio" if has_any(text, ["最簡", "整數連比"]) else "j2-3-1-compound-ratio"
    elif topic_key == "price":
        key = "discount-price-difference" if has_any(text, ["打折", "價差"]) else "cost-list-sale-price"
    elif topic_key == "graph":
        key = "j2-3-2-inverse-graph" if "反比" in text else ("j2-3-2-direct-graph" if "正比" in text else "j2-3-2-judgement-and-validation")
    elif topic_key == "direct":
        key = "direct-proportion-basic"
    elif topic_key == "inverse":
        key = "inverse-proportion-graph"
    else:
        key = BRANCHES[topic_key][0][0]
    return key, branches.get(key, key)


def importance_score(row: Dict) -> Tuple[int, int, int]:
    weight = {"計算": 5, "題組": 5, "應用": 5, "配合題": 4, "填充": 4, "選擇": 3, "是非": 2}.get(row["source_section"], 1)
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
        row["role"] = "習題" if row["source_section"] in {"填充", "配合題", "應用", "題組", "計算"} else "題庫"
        row.update({"target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})
    exercise_count = sum(1 for row in rows if row["role"] == "習題")
    if exercise_count < 8:
        candidates = [row for row in rows if row["source_section"] in {"填充", "配合題", "應用", "題組", "計算"} and row["role"] in {"範例", "練習"}]
        candidates.sort(key=importance_score)
        for row in candidates[: 8 - exercise_count]:
            row.update({"role": "習題", "target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})


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
    tags = ["J23", row["chapter_code"], f"role:{role_slug(role)}", f"group:{group}", f"source-section:{row['source_section']}", f"topic:{row['topic_id']}", f"branch:{row['branch_title']}"]
    if row["target_level"] == "branch":
        tags.append(f"branch-topic:{row['branch_id']}")
    if row["target_level"] == "chapter":
        tags.append("chapter-only")
    return {"id": qid, "title": f"J23 {row['source_section']}第{int(row['source_number']):02d}題", "question_text": row["raw_question_text"], "answer_text": row["answer_text"], "explanation_text": row["explanation_text"], "stage": "國中", "grade": "國二", "chapter": row["chapter_code"], "chapter_code": row["chapter_code"], "difficulty": difficulty_for(row), "source_type": "word_docx_import", "source_ref": SOURCE_REF, "question_role": role, "target_level": row["target_level"], "target_id": row["target_id"], "target_title": row["target_title"], "source_section": row["source_section"], "source_number": row["source_number"], "source_order": row["source_order"], "tags": tags}


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
    return {"meta": {"source_docx": str(SOURCE_DOCX), "source_ref": SOURCE_REF, "question_count": len(questions), "link_count": len(links), "output_questions": str(OUT_QUESTIONS.relative_to(ROOT)).replace("\\", "/"), "output_links": str(OUT_LINKS.relative_to(ROOT)).replace("\\", "/"), "role_policy": {"範例": "每個主題優先挑 3-5 題中等示範題；每個分支再挑 2 題。", "練習": "每個分支挑 3 題中等或偏難練習。", "習題": "剩餘填充、配合題、應用、題組、計算題以章節代號收納。", "題庫": "剩餘選擇/是非題以章節代號收納。"}, "applied": applied or {}}, "counts": {"by_role": dict(Counter(q["question_role"] for q in questions)), "by_chapter": dict(Counter(q["chapter_code"] for q in questions)), "by_section": dict(Counter(q["source_section"] for q in questions))}, "targets": [{"target_level": level, "target_id": target_id, "target_title": title, "count": count} for (level, target_id, title), count in sorted(targets.items(), key=lambda item: (item[0][0], item[0][1]))], "sample_questions": questions[:5]}


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert J23 ratio proportion hard DOCX into question-bank import JSONL.")
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
