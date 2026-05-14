#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import re
import subprocess
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J11整數的運算困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j11-integer-hard"
MARKDOWN_PATH = WORK_DIR / "j11-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"

SOURCE_REF = "J11整數的運算困難題題目答案卷.docx"
ID_PREFIX = "q-j11-integer-hard"

OUT_QUESTIONS = OUT_DIR / "q-j11-integer-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j11-integer-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j11-integer-hard.preview.json"


TOPICS = {
    "number_line": {
        "chapter": "j1-1-1",
        "topic": "j1-1-1-distance-midpoint",
        "title": "數線兩點距離與中點",
    },
    "absolute_value": {
        "chapter": "j1-1-1",
        "topic": "j1-1-1-absolute-value-definition",
        "title": "絕對值的定義與幾何意義",
    },
    "absolute_equation": {
        "chapter": "j1-1-1",
        "topic": "j1-1-1-absolute-value-equation",
        "title": "絕對值方程與不等式入門",
    },
    "order": {
        "chapter": "j1-1-1",
        "topic": "j1-1-1-order-and-interval",
        "title": "數線大小比較與區間",
    },
    "signed_operation": {
        "chapter": "j1-1-2",
        "topic": "j1-1-2-operation-order",
        "title": "四則混合運算順序",
    },
    "distributive": {
        "chapter": "j1-1-2",
        "topic": "j1-1-2-comm-assoc-distrib",
        "title": "交換律、結合律、分配律",
    },
    "factor": {
        "chapter": "j1-1-2",
        "topic": "j1-1-2-factor-common-factor",
        "title": "提出公因式",
    },
    "symbol": {
        "chapter": "j1-1-2",
        "topic": "weird-symbol-calc",
        "title": "奇怪的符號計算",
    },
    "exponent": {
        "chapter": "j1-1-3",
        "topic": "j1-1-3-exponent-laws-main",
        "title": "指數律核心概念",
    },
    "scientific": {
        "chapter": "j1-1-4",
        "topic": "j1-1-4-scientific-notation-main",
        "title": "科學記號核心概念",
    },
}


BRANCHES = {
    "number_line": [
        ("distance-formula", "距離公式"),
        ("j1-1-1-distance-midpoint", "數線兩點距離與中點"),
        ("midpoint-distance-combined-drill", "中點與距離問題"),
    ],
    "absolute_value": [
        ("j1-1-1-absolute-value-definition", "絕對值的定義與幾何意義"),
        ("absolute-value-removal", "去絕對值公式與使用"),
        ("abs-count-basic-drill", "絕對值個數問題"),
    ],
    "absolute_equation": [
        ("j1-1-1-absolute-value-equation", "絕對值方程與不等式入門"),
        ("abs-count-reverse-drill", "絕對值個數問題反向"),
        ("abs-count-two-sided-drill", "絕對值個數問題二邊範圍"),
    ],
    "order": [
        ("comparison-reversal-rules", "比大小三反向"),
        ("j1-1-1-order-and-interval", "數線大小比較與區間"),
        ("j1-1-1-opposite-number", "相反數與對稱"),
    ],
    "signed_operation": [
        ("j1-1-2-integer-addition", "正負數加法規則"),
        ("j1-1-2-multiply-divide-sign", "正負數乘除法符號法則"),
        ("j1-1-2-operation-order", "四則混合運算順序"),
        ("j1-1-2-signed-fraction-operations", "正負分數四則運算"),
    ],
    "distributive": [
        ("j1-distributive-law-drill", "分配律"),
        ("j1-1-2-remove-parentheses", "去括號法則"),
        ("j1-variable-distributive-eval-drill", "利用分配律與未知數求值"),
    ],
    "factor": [
        ("j1-1-2-factor-common-factor", "提出公因式"),
        ("j1-common-factor-drill", "提出公因數"),
        ("j1-common-factor-four-terms-drill", "4項提出公因數"),
    ],
    "symbol": [
        ("weird-symbol-calc", "奇怪的符號計算"),
        ("weird-symbol-calc-three-layer", "奇怪的符號計算三層版"),
    ],
    "exponent": [
        ("j1-1-3-exponent-meaning-and-sign", "次方意義與符號判讀"),
        ("j1-1-3-exponent-laws-mul-div", "同底數乘除法則"),
        ("j1-1-3-exponent-laws-power-rules", "冪的冪與積商次方"),
        ("j1-1-3-zero-and-negative-exponents", "零次方與負次方"),
        ("j1-1-3-exponent-mixed-application", "指數律綜合應用"),
    ],
    "scientific": [
        ("j1-1-4-convert-between-forms", "一般數與科學記號互換"),
        ("j1-1-4-scientific-mul-div", "科學記號乘除運算"),
        ("j1-1-4-scientific-add-sub", "科學記號加減運算"),
        ("j1-1-4-scientific-application", "科學記號應用題"),
    ],
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
    cmd = [
        "pandoc",
        str(source),
        "-t",
        "gfm",
        f"--extract-media={MEDIA_DIR}",
        "-o",
        str(markdown_path),
    ]
    subprocess.run(cmd, cwd=ROOT, check=True)


def clean_markup(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\\\n", "\n", text)
    text = re.sub(r"<sup>\s*([^<]+?)\s*</sup>", lambda m: "^(" + cleanup_inline(m.group(1)) + ")", text)
    text = re.sub(r"<sub>\s*([^<]+?)\s*</sub>", lambda m: "_(" + cleanup_inline(m.group(1)) + ")", text)
    text = re.sub(r"<img\b[^>]*\bsrc=[\"']([^\"']+)[\"'][^>]*>", lambda m: f"[圖:{m.group(1)}]", text, flags=re.I)
    text = re.sub(r"</?u>", "", text)
    text = re.sub(r"!\[\]\(([^)]+)\)", lambda m: f"[圖:{m.group(1)}]", text)
    text = re.sub(r"</?[^>]+>", "", text)
    text = text.replace("**", "").replace("*", "")
    text = text.replace("\\_", "_")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def cleanup_inline(text: str) -> str:
    text = text.replace("*", "").replace("\\", "")
    return re.sub(r"\s+", "", text)


def strip_question_number(block: str) -> Tuple[int, str]:
    m = re.match(r"^(\d+)\.\s*(.*)$", block.strip(), flags=re.S)
    if not m:
        return 0, block.strip()
    return int(m.group(1)), m.group(2).strip()


def parse_markdown(markdown: str) -> List[Dict]:
    heading_re = re.compile(r"^\*\*(一、選擇|二、填充|三、計算|四、是非|五、仿會考非選擇題)\*\*\s*$", re.M)
    headings = list(heading_re.finditer(markdown))
    records: List[Dict] = []
    global_index = 0

    for h_idx, heading in enumerate(headings):
        section_title = heading.group(1)
        section_label = SECTION_LABELS[section_title]
        section_start = heading.end()
        section_end = headings[h_idx + 1].start() if h_idx + 1 < len(headings) else len(markdown)
        section_text = markdown[section_start:section_end]

        starts = list(re.finditer(r"(?m)^(\d+)\.\s", section_text))
        for idx, start in enumerate(starts):
            end = starts[idx + 1].start() if idx + 1 < len(starts) else len(section_text)
            raw_block = section_text[start.start():end].strip()
            source_number, block = strip_question_number(raw_block)
            if "《答案》" not in block:
                continue

            q_part, after_answer = block.split("《答案》", 1)
            if "詳解：" in after_answer:
                answer_part, explain_part = after_answer.split("詳解：", 1)
            else:
                answer_part, explain_part = after_answer, ""

            question_text = clean_markup(q_part)
            answer_text = clean_markup(answer_part)
            explanation_text = clean_markup(explain_part)
            if not question_text:
                continue

            global_index += 1
            records.append(
                {
                    "source_section": section_label,
                    "source_number": source_number,
                    "source_order": global_index,
                    "raw_question_text": question_text,
                    "answer_text": answer_text,
                    "explanation_text": explanation_text,
                }
            )
    return records


def has_any(text: str, words: List[str]) -> bool:
    return any(word in text for word in words)


def classify_topic(question_text: str) -> str:
    text = question_text
    if "科學記號" in text or "×10" in text or re.search(r"10\^\([－\-]?\d+\)", text):
        return "scientific"
    if has_any(text, ["路徑", "上山", "下山", "禮物", "服飾", "水槽", "開關", "蘋果", "水果店"]):
        return "signed_operation"
    if (
        "指數" in text
        or "0^(0)" in text
        or ("次方" in text and "方程式" not in text)
        or re.search(r"\d\^\([－\-]?\d+\)", text)
    ) and not "平方公分" in text:
        return "exponent"
    if has_any(text, ["│", "｜", "∣", "絕對值"]):
        if has_any(text, ["不等式", "整數解", "可能為", "不可能", "個"]):
            return "absolute_equation"
        return "absolute_value"
    if has_any(text, ["數線", "中點", "離原點", "座標", "坐標", "距離", "原點"]):
        return "number_line"
    if has_any(text, ["提出", "公因", "因數", "倍數", "相同長度", "剪成"]):
        return "factor"
    if has_any(text, ["分配律", "去括號", "展開"]):
        return "distributive"
    if has_any(text, ["定義", "新運算", "符號", "△", "□", "☆", "◎"]):
        return "symbol"
    if has_any(text, ["比大小", "最大", "最小", "大於", "小於"]):
        return "order"
    return "signed_operation"


def classify_branch(topic_key: str, question_text: str) -> Tuple[str, str]:
    text = question_text
    branches = dict(BRANCHES[topic_key])

    if topic_key == "scientific":
        if has_any(text, ["市價", "口罩", "耳溫槍", "奈米", "公里", "應用", "表示此次", "買入"]):
            key = "j1-1-4-scientific-application"
        elif "＋" in text or "加" in text or "總" in text:
            key = "j1-1-4-scientific-add-sub"
        elif "÷" in text or "×" in text or "乘" in text or "除" in text:
            key = "j1-1-4-scientific-mul-div"
        else:
            key = "j1-1-4-convert-between-forms"
    elif topic_key == "exponent":
        if "－" in text and "^(" in text or "0^(0)" in text or "負次方" in text:
            key = "j1-1-3-zero-and-negative-exponents"
        elif has_any(text, ["×", "÷", "乘", "除"]):
            key = "j1-1-3-exponent-laws-mul-div"
        elif has_any(text, ["括號", ")^(", "冪"]):
            key = "j1-1-3-exponent-laws-power-rules"
        elif has_any(text, ["應用", "比較", "最大", "最小"]):
            key = "j1-1-3-exponent-mixed-application"
        else:
            key = "j1-1-3-exponent-meaning-and-sign"
    elif topic_key == "absolute_value":
        if has_any(text, ["去", "若│", "若｜", "a－", "b－"]):
            key = "absolute-value-removal"
        elif "個" in text:
            key = "abs-count-basic-drill"
        else:
            key = "j1-1-1-absolute-value-definition"
    elif topic_key == "absolute_equation":
        if has_any(text, ["範圍", "二邊", "兩邊"]):
            key = "abs-count-two-sided-drill"
        elif "反向" in text or "不可能" in text:
            key = "abs-count-reverse-drill"
        else:
            key = "j1-1-1-absolute-value-equation"
    elif topic_key == "number_line":
        if "中點" in text:
            key = "midpoint-distance-combined-drill"
        elif has_any(text, ["距離", "離原點"]):
            key = "distance-formula"
        else:
            key = "j1-1-1-distance-midpoint"
    elif topic_key == "signed_operation":
        if has_any(text, ["分數", "＝", "÷"]) and has_any(text, ["＋", "－"]):
            key = "j1-1-2-signed-fraction-operations"
        elif has_any(text, ["×", "÷", "乘", "除"]):
            key = "j1-1-2-multiply-divide-sign"
        elif has_any(text, ["＋", "－"]):
            key = "j1-1-2-integer-addition"
        else:
            key = "j1-1-2-operation-order"
    elif topic_key == "distributive":
        if "去括號" in text:
            key = "j1-1-2-remove-parentheses"
        elif has_any(text, ["x", "未知數", "求值"]):
            key = "j1-variable-distributive-eval-drill"
        else:
            key = "j1-distributive-law-drill"
    elif topic_key == "factor":
        if "4項" in text or "四項" in text:
            key = "j1-common-factor-four-terms-drill"
        elif "公因數" in text or "最大公因" in text:
            key = "j1-common-factor-drill"
        else:
            key = "j1-1-2-factor-common-factor"
    elif topic_key == "symbol":
        if has_any(text, ["三層", "連續", "多層"]):
            key = "weird-symbol-calc-three-layer"
        else:
            key = "weird-symbol-calc"
    else:
        if "相反" in text:
            key = "j1-1-1-opposite-number"
        elif has_any(text, ["大於", "小於", "區間"]):
            key = "j1-1-1-order-and-interval"
        else:
            key = "comparison-reversal-rules"

    return key, branches.get(key, key)


def importance_score(row: Dict) -> Tuple[int, int, int]:
    text = row["raw_question_text"]
    section_weight = {
        "計算": 5,
        "仿會考非選擇題": 5,
        "填充": 4,
        "選擇": 3,
        "是非": 2,
    }.get(row["source_section"], 1)
    length_weight = min(len(text) // 80, 5)
    source_order = -int(row["source_order"])
    return (section_weight, length_weight, source_order)


def assign_roles(rows: List[Dict]) -> None:
    topic_groups: Dict[str, List[Dict]] = defaultdict(list)
    branch_groups: Dict[str, List[Dict]] = defaultdict(list)

    for row in rows:
        topic_key = classify_topic(row["raw_question_text"])
        branch_id, branch_title = classify_branch(topic_key, row["raw_question_text"])
        topic_info = TOPICS[topic_key]
        row.update(
            {
                "topic_key": topic_key,
                "chapter_code": topic_info["chapter"],
                "topic_id": topic_info["topic"],
                "topic_title": topic_info["title"],
                "branch_id": branch_id,
                "branch_title": branch_title,
                "role": "",
                "target_level": "chapter",
                "target_id": "",
                "target_title": "",
            }
        )
        topic_groups[topic_info["topic"]].append(row)
        branch_groups[branch_id].append(row)

    used = set()

    for topic_id, candidates in topic_groups.items():
        ranked = sorted(candidates, key=importance_score, reverse=True)
        take = min(5, max(3, len(ranked) // 7)) if len(ranked) >= 3 else len(ranked)
        for row in ranked[:take]:
            used.add(row["source_order"])
            row["role"] = "範例"
            row["target_level"] = "topic"
            row["target_id"] = row["topic_id"]
            row["target_title"] = row["topic_title"]

    for branch_id, candidates in branch_groups.items():
        remaining = [row for row in sorted(candidates, key=importance_score, reverse=True) if row["source_order"] not in used]
        for row in remaining[:2]:
            used.add(row["source_order"])
            row["role"] = "範例"
            row["target_level"] = "branch"
            row["target_id"] = row["branch_id"]
            row["target_title"] = row["branch_title"]
        for row in remaining[2:5]:
            used.add(row["source_order"])
            row["role"] = "練習"
            row["target_level"] = "branch"
            row["target_id"] = row["branch_id"]
            row["target_title"] = row["branch_title"]

    for row in rows:
        if row["role"]:
            continue
        if row["source_section"] in {"填充", "計算", "仿會考非選擇題"}:
            row["role"] = "習題"
        else:
            row["role"] = "題庫"
        row["target_level"] = "chapter"
        row["target_id"] = row["chapter_code"]
        row["target_title"] = row["chapter_code"]


def difficulty_for(row: Dict) -> str:
    if row["role"] in {"範例", "練習"}:
        return "中等" if row["source_section"] in {"選擇", "是非"} else "偏難"
    if row["source_section"] in {"計算", "仿會考非選擇題"}:
        return "挑戰"
    return "偏難"


def role_slug(role: str) -> str:
    return {
        "範例": "example",
        "練習": "practice",
        "習題": "exercise",
        "題庫": "bank",
    }[role]


def make_question(row: Dict) -> Dict:
    qid = f"{ID_PREFIX}-{int(row['source_order']):03d}"
    title = f"J11 {row['source_section']}第{int(row['source_number']):02d}題"
    role = row["role"]
    role_en = role_slug(role)
    group = {
        ("範例", "topic"): "topic-example",
        ("範例", "branch"): "branch-example",
        ("練習", "branch"): "branch-practice",
        ("習題", "chapter"): "chapter-exercise",
        ("題庫", "chapter"): "chapter-bank",
    }.get((role, row["target_level"]), f"chapter-{role_en}")

    tags = [
        "J11",
        row["chapter_code"],
        f"role:{role_en}",
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
        "title": title,
        "question_text": row["raw_question_text"],
        "answer_text": row["answer_text"],
        "explanation_text": row["explanation_text"],
        "stage": "國中",
        "grade": "國一",
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
    question_id = question["id"]
    if level in {"topic", "branch"}:
        topic_id = question["target_id"]
        link_level = "topic"
        target = topic_id
    else:
        topic_id = ""
        link_level = "chapter"
        target = chapter_code

    now = now_iso()
    return {
        "id": re.sub(r"[^A-Za-z0-9_-]+", "-", f"link-{question_id}-{link_level}-{target}").strip("-").lower(),
        "title": f"{question_id} -> {target}",
        "question_id": question_id,
        "question_title": question.get("title", ""),
        "topic_id": topic_id,
        "chapter_code": chapter_code,
        "link_level": link_level,
        "source_type": "manual-docx-structured-pack",
        "source_ref": SOURCE_REF,
        "confidence": 1.0 if topic_id else 0.9,
        "created_at": now,
        "updated_at": now,
    }


def write_jsonl(path: Path, rows: List[Dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def load_json(path: Path) -> Dict:
    if not path.exists():
        return {"meta": {"count": 0}, "questions": []} if path == QUESTION_DB else {"meta": {"count": 0}, "links": []}
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: Dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def upsert(target: List[Dict], rows: List[Dict]) -> Tuple[int, int]:
    index = {row.get("id"): i for i, row in enumerate(target)}
    created = 0
    updated = 0
    for row in rows:
        rid = row["id"]
        if rid in index:
            target[index[rid]] = row
            updated += 1
        else:
            target.append(row)
            index[rid] = len(target) - 1
            created += 1
    return created, updated


def apply_to_db(questions: List[Dict], links: List[Dict]) -> Dict:
    q_payload = load_json(QUESTION_DB)
    q_rows = q_payload.get("questions", []) if isinstance(q_payload.get("questions"), list) else []
    q_created, q_updated = upsert(q_rows, questions)
    q_payload["questions"] = q_rows
    q_payload.setdefault("meta", {})
    q_payload["meta"]["count"] = len(q_rows)
    q_payload["meta"]["updatedAt"] = datetime.now().isoformat(timespec="seconds")
    q_payload["meta"]["lastImportSource"] = SOURCE_REF
    save_json(QUESTION_DB, q_payload)

    l_payload = load_json(LINK_DB)
    l_rows = l_payload.get("links", []) if isinstance(l_payload.get("links"), list) else []
    l_created, l_updated = upsert(l_rows, links)
    l_payload["links"] = l_rows
    l_payload.setdefault("meta", {})
    l_payload["meta"]["count"] = len(l_rows)
    l_payload["meta"]["updatedAt"] = datetime.now().isoformat(timespec="seconds")
    l_payload["meta"]["lastImportSource"] = SOURCE_REF
    save_json(LINK_DB, l_payload)

    return {
        "questions_created": q_created,
        "questions_updated": q_updated,
        "links_created": l_created,
        "links_updated": l_updated,
    }


def build_preview(questions: List[Dict], links: List[Dict], applied: Dict = None) -> Dict:
    role_counts = Counter(q["question_role"] for q in questions)
    chapter_counts = Counter(q["chapter_code"] for q in questions)
    target_counts = Counter((q["target_level"], q["target_id"], q["target_title"]) for q in questions)
    section_counts = Counter(q["source_section"] for q in questions)

    return {
        "meta": {
            "source_docx": str(SOURCE_DOCX),
            "source_ref": SOURCE_REF,
            "question_count": len(questions),
            "link_count": len(links),
            "output_questions": str(OUT_QUESTIONS.relative_to(ROOT)).replace("\\", "/"),
            "output_links": str(OUT_LINKS.relative_to(ROOT)).replace("\\", "/"),
            "role_policy": {
                "範例": "每個主題優先挑 3-5 題中等示範題；每個分支再挑 2 題。",
                "練習": "每個分支挑 3 題中等或偏難練習。",
                "習題": "剩餘非選、填充、計算題以章節代號收納。",
                "題庫": "剩餘選擇/是非題以章節代號收納。",
            },
            "applied": applied or {},
        },
        "counts": {
            "by_role": dict(role_counts),
            "by_chapter": dict(chapter_counts),
            "by_section": dict(section_counts),
        },
        "targets": [
            {
                "target_level": level,
                "target_id": target_id,
                "target_title": title,
                "count": count,
            }
            for (level, target_id, title), count in sorted(target_counts.items(), key=lambda item: (item[0][0], item[0][1]))
        ],
        "sample_questions": questions[:5],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert J11 integer hard DOCX into question-bank import JSONL.")
    parser.add_argument("--source-docx", default=str(SOURCE_DOCX))
    parser.add_argument("--force-pandoc", action="store_true")
    parser.add_argument("--apply", action="store_true", help="Upsert generated questions and links into database JSON files.")
    args = parser.parse_args()

    source = Path(args.source_docx)
    if not source.exists():
        raise FileNotFoundError(source)

    run_pandoc(source, MARKDOWN_PATH, force=args.force_pandoc)
    markdown = MARKDOWN_PATH.read_text(encoding="utf-8")
    extracted = parse_markdown(markdown)
    assign_roles(extracted)

    questions = [make_question(row) for row in extracted]
    links = [make_link(q) for q in questions]
    write_jsonl(OUT_QUESTIONS, questions)
    write_jsonl(OUT_LINKS, links)

    applied = apply_to_db(questions, links) if args.apply else {}
    preview = build_preview(questions, links, applied=applied)
    OUT_PREVIEW.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")

    ids = [q["id"] for q in questions]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate question IDs generated")
    link_ids = [l["id"] for l in links]
    if len(link_ids) != len(set(link_ids)):
        raise ValueError("Duplicate link IDs generated")

    print(json.dumps(preview["meta"], ensure_ascii=False, indent=2))
    print(json.dumps(preview["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
