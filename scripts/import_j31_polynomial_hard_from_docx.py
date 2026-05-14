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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J31乘法公式與多項式困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j31-polynomial-hard"
MARKDOWN_PATH = WORK_DIR / "j31-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"

SOURCE_REF = "J31乘法公式與多項式困難題題目答案卷.docx"
ID_PREFIX = "q-j31-polynomial-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j31-polynomial-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j31-polynomial-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j31-polynomial-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


TOPICS = {
    "square_formula": ("j3-1-1", "j3-1-1-square-formulas", "平方公式總覽"),
    "sum_diff_product": ("j3-1-1", "j3-1-1-sum-diff-product", "和差積與平方差"),
    "cubic_formula": ("j3-1-1", "j3-1-1-cubic-formulas", "立方公式與係數規律"),
    "formula_reverse": ("j3-1-1", "j3-1-1-formula-reverse", "公式逆用與配型"),
    "mental_arithmetic": ("j3-1-1", "j3-1-1-mental-arithmetic", "乘法公式心算應用"),
    "sign_check": ("j3-1-1", "j3-1-1-sign-check", "公式符號檢查策略"),
    "terms_degree": ("j3-1-2", "j3-1-2-poly-terms-degree", "多項式、項與次數"),
    "like_terms": ("j3-1-2", "j3-1-2-like-terms", "同類項合併"),
    "remove_parentheses": ("j3-1-2", "j3-1-2-remove-parentheses", "去括號與負號分配"),
    "add_sub_vertical": ("j3-1-2", "j3-1-2-add-sub-vertical", "多項式加減直式"),
    "standard_form": ("j3-1-2", "j3-1-2-standard-form", "升冪降冪與標準形"),
    "distributive_mul": ("j3-1-3", "j3-1-3-distributive-mul", "分配律與乘法展開"),
    "vertical_mul": ("j3-1-3", "j3-1-3-vertical-mul", "多項式直式乘法"),
    "long_division": ("j3-1-3", "j3-1-3-long-division", "多項式長除法"),
    "division_check": ("j3-1-3", "j3-1-3-division-check", "商式餘式驗算"),
    "mixed_operation": ("j3-1-3", "j3-1-3-mixed-operation", "乘除混合運算順序"),
    "sign_missing_term": ("j3-1-3", "j3-1-3-sign-missing-term", "缺項與符號錯誤防呆"),
}


BRANCHES = {
    "square_formula": [("j3-1-1-square-formulas", "平方公式總覽"), ("perfect-square", "完全平方公式")],
    "sum_diff_product": [("j3-1-1-sum-diff-product", "和差積與平方差"), ("factorization-diff-square", "平方差公式")],
    "cubic_formula": [("j3-1-1-cubic-formulas", "立方公式與係數規律"), ("cube-identities-guest", "和立方、差立方、立方和差")],
    "formula_reverse": [("j3-1-1-formula-reverse", "公式逆用與配型"), ("three-sum-square-guest", "三數和的平方")],
    "mental_arithmetic": [("j3-1-1-mental-arithmetic", "乘法公式心算應用"), ("square-difference-number-drill", "整數共軛乘法")],
    "sign_check": [("j3-1-1-sign-check", "公式符號檢查策略")],
    "terms_degree": [("j3-1-2-poly-terms-degree", "多項式、項與次數"), ("constant-vs-zero-degree-polynomial", "常數多項式與零次多項式")],
    "like_terms": [("j3-1-2-like-terms", "同類項合併"), ("like-terms-combine-junior", "同類項合併")],
    "remove_parentheses": [("j3-1-2-remove-parentheses", "去括號與負號分配"), ("polynomial-subtraction-sign-distribution", "減法去括號與變號")],
    "add_sub_vertical": [("j3-1-2-add-sub-vertical", "多項式加減直式"), ("polynomial-add-subtract-vertical-alignment", "多項式加減直式對齊")],
    "standard_form": [("j3-1-2-standard-form", "升冪降冪與標準形"), ("polynomial-terminology-junior", "多項式名詞整理")],
    "distributive_mul": [("j3-1-3-distributive-mul", "分配律與乘法展開"), ("distributive-like-terms-mul", "分配律展開後合併同類項")],
    "vertical_mul": [("j3-1-3-vertical-mul", "多項式直式乘法"), ("quadratic-times-quadratic-main", "二次 × 二次")],
    "long_division": [("j3-1-3-long-division", "多項式長除法"), ("cubic-divide-linear", "三次多項式 ÷ 一次多項式"), ("cubic-divide-quadratic", "三次多項式 ÷ 二次多項式")],
    "division_check": [("j3-1-3-division-check", "商式餘式驗算")],
    "mixed_operation": [("j3-1-3-mixed-operation", "乘除混合運算順序")],
    "sign_missing_term": [("j3-1-3-sign-missing-term", "缺項與符號錯誤防呆"), ("monomial-divide-monomial", "單項式 ÷ 單項式")],
}


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、計算": "計算",
    "四、是非": "是非",
    "五、仿會考非選擇題": "仿會考非選擇題",
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


def strip_choice_marker(text: str) -> str:
    return re.sub(r"^\s*[（(]\s*\n?\s*[）)]\s*", "", text or "").strip()


def clean_question_text(text: str, section: str) -> str:
    cleaned = j11_helpers.clean_markup(text)
    if section == "選擇":
        cleaned = strip_choice_marker(cleaned)
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
    if section == "是非":
        if has_any(compact, ["餘式", "除式", "整除", "商式"]):
            return "division_check"
        if has_any(compact, ["二次多項式", "零次", "單項式", "係數", "次數"]):
            return "terms_degree"
        return "standard_form"
    if has_any(compact, ["餘式", "商式", "除以", "÷", "整除", "除式", "被除式"]):
        if has_any(compact, ["驗算", "餘式為0", "看成A＋B", "看成A－B", "將題目看成"]):
            return "division_check"
        return "long_division"
    if has_any(compact, ["乘積", "乘以", "展開", "分配律", "ac＋ad", "係數和", "係數為", "平方項的係數", "x2的係數"]):
        if has_any(compact, ["直式", "擦拭", "過程"]):
            return "vertical_mul"
        return "distributive_mul"
    if has_any(compact, ["三數和", "a2＋b2＋c2", "三數", "x－2y－3", "a＋b＋c"]):
        return "formula_reverse"
    if has_any(compact, ["立方", "3×5×17×257", "2^", "5＋1)(5", "和立方", "差立方"]):
        return "cubic_formula"
    if has_any(compact, ["平方差", "共軛", "兩數和乘以兩數差"]) or (has_any(compact, ["2－"]) and has_any(compact, ["＋", "－"])):
        return "sum_diff_product"
    if has_any(compact, ["和的平方", "差的平方", "平方公式", "完全平方", "(a＋b)2", "(a－b)2", "x2＋2", "x2－2"]):
        return "square_formula"
    if has_any(compact, ["99.5", "199.5", "8998.999", "101.25", "153", "19.7", "2.99", "個位數", "心算"]):
        return "mental_arithmetic"
    if has_any(compact, ["錯誤", "正確", "不相等", "符號", "代入公式", "負號"]):
        return "sign_check"
    if has_any(compact, ["零次多項式", "常數多項式", "單項式", "多項式", "最高次", "次數", "係數", "項"]):
        if has_any(compact, ["合併", "同類項", "加減運算", "加上", "相加", "減去"]):
            return "like_terms"
        if has_any(compact, ["降冪", "升冪", "標準", "排列"]):
            return "standard_form"
        return "terms_degree"
    if has_any(compact, ["A－B", "A＋B", "加減", "相減", "相加", "誤將", "只做對", "正確答案"]):
        if has_any(compact, ["去括號", "減法", "誤將"]):
            return "remove_parentheses"
        return "add_sub_vertical"
    if has_any(compact, ["面積", "周長", "長方形", "正方形", "紙板", "圖形", "斜線", "田地", "小路"]):
        return "formula_reverse"
    if section in {"填充", "計算", "仿會考非選擇題"}:
        return "mixed_operation"
    return "square_formula"


def classify_branch(topic_key: str, text: str, section: str) -> Tuple[str, str]:
    branches = dict(BRANCHES[topic_key])
    compact = compact_text(text)
    if topic_key == "square_formula":
        key = "perfect-square" if has_any(compact, ["完全平方", "和的平方", "差的平方", "(a＋b)", "(a－b)"]) else "j3-1-1-square-formulas"
    elif topic_key == "sum_diff_product":
        key = "factorization-diff-square" if has_any(compact, ["平方差", "因式分解"]) else "j3-1-1-sum-diff-product"
    elif topic_key == "cubic_formula":
        key = "cube-identities-guest" if has_any(compact, ["立方", "3×5×17×257"]) else "j3-1-1-cubic-formulas"
    elif topic_key == "formula_reverse":
        key = "three-sum-square-guest" if has_any(compact, ["三數和", "a2＋b2＋c2"]) else "j3-1-1-formula-reverse"
    elif topic_key == "mental_arithmetic":
        key = "square-difference-number-drill" if has_any(compact, ["平方差", "153", "47", "147"]) else "j3-1-1-mental-arithmetic"
    elif topic_key == "terms_degree":
        key = "constant-vs-zero-degree-polynomial" if has_any(compact, ["零次", "常數多項式"]) else "j3-1-2-poly-terms-degree"
    elif topic_key == "like_terms":
        key = "like-terms-combine-junior" if has_any(compact, ["同類項", "合併"]) else "j3-1-2-like-terms"
    elif topic_key == "remove_parentheses":
        key = "polynomial-subtraction-sign-distribution" if has_any(compact, ["A－B", "減法", "誤將"]) else "j3-1-2-remove-parentheses"
    elif topic_key == "add_sub_vertical":
        key = "polynomial-add-subtract-vertical-alignment" if has_any(compact, ["直式", "對齊", "擦拭"]) else "j3-1-2-add-sub-vertical"
    elif topic_key == "standard_form":
        key = "polynomial-terminology-junior" if has_any(compact, ["名詞", "係數", "次數"]) else "j3-1-2-standard-form"
    elif topic_key == "distributive_mul":
        key = "quadratic-times-quadratic-main" if has_any(compact, ["二次", "x2", "乘積"]) else "j3-1-3-distributive-mul"
    elif topic_key == "vertical_mul":
        key = "quadratic-times-quadratic-main" if has_any(compact, ["二次"]) else "j3-1-3-vertical-mul"
    elif topic_key == "long_division":
        key = "cubic-divide-quadratic" if has_any(compact, ["二次多項式"]) else ("cubic-divide-linear" if has_any(compact, ["一次多項式"]) else "j3-1-3-long-division")
    elif topic_key == "sign_missing_term":
        key = "monomial-divide-monomial" if has_any(compact, ["單項式"]) else "j3-1-3-sign-missing-term"
    else:
        key = BRANCHES[topic_key][0][0]
    return key, branches.get(key, key)


def importance_score(row: Dict) -> Tuple[int, int, int, int]:
    weight = {"計算": 6, "仿會考非選擇題": 6, "填充": 5, "選擇": 3, "是非": 2}.get(row["source_section"], 1)
    text = row["raw_question_text"]
    conceptual = int(has_any(text, ["求", "寫出", "表示", "說明", "證明", "面積", "周長", "係數", "餘式", "商式"]))
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
        row["role"] = "習題" if row["source_section"] in {"填充", "計算", "仿會考非選擇題"} else "題庫"
        row.update({"target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["role"] in {"範例", "練習"}:
        return "中等" if row["source_section"] in {"選擇", "是非"} else "偏難"
    return "挑戰" if row["source_section"] in {"計算", "仿會考非選擇題"} else "偏難"


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
        "J31",
        row["chapter_code"],
        "乘法公式與多項式",
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
        "title": f"J31 {row['source_section']}第{int(row['source_number']):02d}題",
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
            "choice_marker_policy": "選擇題題幹開頭的（ ）作答括號已移除。",
            "role_policy": {
                "範例": "每個主題優先挑 3-5 題中等示範題；每個分支再挑 2 題。",
                "練習": "每個分支挑 3 題中等或偏難練習。",
                "習題": "剩餘填充、計算、仿會考非選擇題以章節代號收納。",
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
    parser = argparse.ArgumentParser(description="Convert J31 polynomial hard DOCX into question-bank import JSONL.")
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
    bad_choice_markers = [q["id"] for q in questions if q["source_section"] == "選擇" and re.match(r"^\s*[（(]\s*\n?\s*[）)]", q["question_text"])]
    if bad_choice_markers:
        raise ValueError(f"Choice markers were not stripped: {bad_choice_markers[:5]}")
    print(json.dumps(preview["meta"], ensure_ascii=False, indent=2))
    print(json.dumps(preview["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
