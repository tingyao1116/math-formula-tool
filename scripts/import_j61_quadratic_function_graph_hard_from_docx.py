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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J61二次函數與圖形困難題題目答案卷.docx")
WORK_DIR = ROOT / "exports" / "j61-quadratic-function-graph-hard"
MEDIA_DIR = WORK_DIR / "media"
MARKDOWN_PATH = WORK_DIR / "j61-pandoc.md"
OUT_DIR = ROOT / "program-db" / "imports"

SOURCE_REF = "J61二次函數與圖形困難題題目答案卷.docx"
ID_PREFIX = "q-j61-quadratic-function-graph-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j61-quadratic-function-graph-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j61-quadratic-function-graph-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j61-quadratic-function-graph-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、應用": "應用",
    "四、作圖": "作圖",
    "五、計算": "計算",
    "六、是非": "是非",
}

TOPICS = {
    "function_relation": ("j6-1-1", "j6-1-1-function-relation-and-fx", "函數關係與 $y=f(x)$ 表示"),
    "definition": ("j6-1-1", "j6-1-1-quadratic-definition", "二次函數的判別"),
    "general_form": ("j6-1-1", "j6-1-1-general-form-ax2-bx-c", "一般式 $ax^2+bx+c$ 的係數意義"),
    "linear_vs_quadratic": ("j6-1-1", "j6-1-1-linear-vs-quadratic", "一次函數與二次函數差異"),
    "evaluate_domain": ("j6-1-1", "j6-1-1-evaluate-and-domain-basic", "函數值計算與定義域基本判斷"),
    "opening_axis": ("j6-1-2", "j6-1-2-parabola-opening-and-axis", "拋物線開口方向與對稱軸"),
    "vertex": ("j6-1-2", "j6-1-2-vertex-formula", "頂點座標公式與求法"),
    "symmetric_intercept": ("j6-1-2", "j6-1-2-symmetric-points-and-y-intercept", "對稱點、$y$-截距與圖形讀值"),
    "max_min_range": ("j6-1-2", "j6-1-2-max-min-and-range", "最大值、最小值與值域"),
    "plotting": ("j6-1-2", "j6-1-2-table-plotting-procedure", "列表法畫二次函數圖形"),
    "x_intercept": ("j6-1-3", "j6-1-3-x-intercept-and-root-count", "與 $x$ 軸交點與解的個數"),
    "find_function": ("j6-1-3", "j6-1-3-find-function-from-conditions", "由條件反求二次函數"),
    "parameter_a": ("j6-1-3", "j6-1-3-parameter-a-effect", "參數 $a$ 對圖形寬窄與方向的影響"),
    "optimization": ("j6-1-3", "j6-1-3-word-problem-optimization", "情境應用：面積與最佳化"),
    "checklist": ("j6-1-3", "j6-1-3-exam-checklist-and-traps", "綜合檢核：作圖與計算常見陷阱"),
}

CHAPTER_TITLES = {
    "j6-1-1": "二次函數圖形",
    "j6-1-2": "二次函數配方法",
    "j6-1-3": "二次函數應用問題",
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def run_pandoc(force: bool = False) -> None:
    if MARKDOWN_PATH.exists() and not force:
        return
    MARKDOWN_PATH.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["pandoc", str(SOURCE_DOCX), "-t", "gfm", f"--extract-media={MEDIA_DIR}", "-o", str(MARKDOWN_PATH)],
        cwd=ROOT,
        check=True,
    )


def strip_answer_marker(text: str) -> str:
    return re.sub(r"^\s*[（(]\s*\n?\s*[）)](?!\^)\s*", "", text or "").strip()


def normalize_image_refs(text: str) -> str:
    def repl(match: re.Match) -> str:
        ref = match.group(1).replace("−", "-").replace("\\", "/")
        path = Path(ref)
        if not path.is_absolute():
            path = (ROOT / ref).resolve()
        out = str(path)
        if Path(out).suffix.lower() in {".wmf", ".emf"}:
            out = f"{out}.png"
        return f"[圖:{out}]"

    return re.sub(r"\[圖:([^\]]+)\]", repl, text or "")


def clean_text(text: str, section: str) -> str:
    cleaned = normalize_image_refs(j11_helpers.clean_markup(text)).replace("\U0001F7A8", "□")
    if section in {"選擇", "是非"}:
        cleaned = strip_answer_marker(cleaned)
    return cleaned


def parse_markdown(markdown: str) -> List[Dict]:
    heading_re = re.compile(r"^\*\*(" + "|".join(re.escape(k) for k in SECTION_LABELS) + r")\*\*\s*$", re.M)
    headings = list(heading_re.finditer(markdown))
    rows: List[Dict] = []
    order = 0
    for h_idx, heading in enumerate(headings):
        section_label = SECTION_LABELS[heading.group(1)]
        start = heading.end()
        end = headings[h_idx + 1].start() if h_idx + 1 < len(headings) else len(markdown)
        section_text = markdown[start:end]
        starts = list(re.finditer(r"(?m)^(\d+)\.\s", section_text))
        for idx, q_start in enumerate(starts):
            q_end = starts[idx + 1].start() if idx + 1 < len(starts) else len(section_text)
            raw = section_text[q_start.start():q_end].strip()
            number, block = j11_helpers.strip_question_number(raw)
            if "《答案》" not in block:
                continue
            q_part, after_answer = block.split("《答案》", 1)
            answer_part, explain_part = after_answer.split("詳解：", 1) if "詳解：" in after_answer else (after_answer, "")
            question_text = clean_text(q_part, section_label)
            if not question_text:
                continue
            order += 1
            rows.append(
                {
                    "source_section": section_label,
                    "source_number": number,
                    "source_order": order,
                    "raw_question_text": question_text,
                    "answer_text": normalize_image_refs(j11_helpers.clean_markup(answer_part)).replace("\U0001F7A8", "□"),
                    "explanation_text": normalize_image_refs(j11_helpers.clean_markup(explain_part)).replace("\U0001F7A8", "□"),
                }
            )
    return rows


def compact_text(text: str) -> str:
    return re.sub(r"\s+", "", text or "")


def has_any(text: str, words: List[str]) -> bool:
    return any(word in text for word in words)


def classify_topic(row: Dict) -> str:
    section = row["source_section"]
    compact = compact_text(row["raw_question_text"] + "\n" + row.get("answer_text", "") + "\n" + row.get("explanation_text", ""))

    if section == "應用" or has_any(compact, ["最大總面積", "面積為最大", "面積的最大", "乘積", "圍成", "花園", "草皮", "棒球", "離地面", "落到地面", "數線上找一點", "平方和的值為最小"]):
        return "optimization"
    if has_any(compact, ["與x軸", "x軸只", "x軸有", "x軸相交", "判別式", "實數解", "交點個數", "解的個數", "有一個交點", "兩個交點", "沒有交點"]):
        return "x_intercept"
    if section == "作圖" or has_any(compact, ["描繪", "列表", "標示出", "座標平面上"]):
        return "plotting"
    if has_any(compact, ["何者為二次函數", "是否為二次函數", "不是二次函數", "二次函數的條件", "k≠", "a≠0"]):
        return "definition"
    if has_any(compact, ["一次函數", "直線"]) and has_any(compact, ["二次函數", "拋物線"]):
        return "linear_vs_quadratic"
    if has_any(compact, ["f(", "函數值", "定義域", "值域為所有實數"]):
        return "evaluate_domain"
    if has_any(compact, ["通過", "經過", "過(", "頂點為", "求a、b、c", "求a,b,c", "b＋c", "a－b－c", "a+b+c", "反求"]):
        if has_any(compact, ["最大", "最小", "面積", "圍"]):
            return "optimization"
        return "find_function"
    if has_any(compact, ["平行移動", "重疊", "伸縮", "寬窄", "|a|", "開口大小", "參數a", "a的值", "可能為圖形"]):
        return "parameter_a"
    if has_any(compact, ["最大值", "最小值", "最高點", "最低點", "最高", "最低", "值域", "範圍", "最大面積", "最小面積"]):
        return "max_min_range"
    if has_any(compact, ["頂點", "對稱軸", "配方", "x=-", "x＝"]):
        return "vertex"
    if has_any(compact, ["對稱點", "y軸", "y截距", "截距", "圖形讀值", "座標為何"]):
        return "symmetric_intercept"
    if has_any(compact, ["開口", "向上", "向下", "拋物線"]):
        return "opening_axis"
    if has_any(compact, ["y=f(x)", "函數關係"]):
        return "function_relation"
    if has_any(compact, ["係數", "一般式", "ax^(2)＋bx＋c", "ax^(2)+bx+c"]):
        return "general_form"
    return "checklist"


def score_for_role(row: Dict) -> Tuple[int, int, int]:
    section_score = {"計算": 7, "應用": 7, "作圖": 6, "填充": 5, "選擇": 3, "是非": 1}.get(row["source_section"], 2)
    images = len(re.findall(r"\[圖:", row["raw_question_text"]))
    length_penalty = -abs(len(row["raw_question_text"]) - 180) // 80
    return (section_score + length_penalty - min(images, 3), -images, -row["source_order"])


def assign_topics(rows: List[Dict]) -> None:
    for row in rows:
        key = classify_topic(row)
        chapter, topic_id, topic_title = TOPICS[key]
        row.update(
            {
                "topic_key": key,
                "chapter_code": chapter,
                "topic_id": topic_id,
                "topic_title": topic_title,
                "role": "",
                "target_level": "",
                "target_id": "",
                "target_title": "",
            }
        )


def assign_roles(rows: List[Dict]) -> None:
    by_chapter: Dict[str, List[Dict]] = defaultdict(list)
    by_topic: Dict[str, List[Dict]] = defaultdict(list)
    for row in rows:
        by_chapter[row["chapter_code"]].append(row)
        by_topic[row["topic_id"]].append(row)

    for chapter_code, items in by_chapter.items():
        desired = min(5, max(3, len(items) // 15)) if len(items) >= 3 else len(items)
        for row in sorted(items, key=score_for_role, reverse=True)[:desired]:
            row.update({"role": "範例", "target_level": "chapter", "target_id": chapter_code, "target_title": CHAPTER_TITLES[chapter_code]})

    for topic_id, items in by_topic.items():
        available = [row for row in sorted(items, key=score_for_role, reverse=True) if not row["role"]]
        for row in available[:2]:
            row.update({"role": "範例", "target_level": "branch", "target_id": topic_id, "target_title": row["topic_title"]})
        available = [row for row in sorted(items, key=score_for_role, reverse=True) if not row["role"]]
        for row in available[:3]:
            row.update({"role": "練習", "target_level": "branch", "target_id": topic_id, "target_title": row["topic_title"]})

    for row in rows:
        if not row["role"]:
            row["role"] = "題庫" if row["source_section"] in {"選擇", "是非"} else "習題"
            row["target_level"] = "chapter"
            row["target_id"] = row["chapter_code"]
            row["target_title"] = CHAPTER_TITLES[row["chapter_code"]]


def difficulty_for(row: Dict) -> str:
    if row["role"] == "練習" or row["source_section"] in {"計算", "應用", "作圖"}:
        return "偏難"
    return "中等"


def make_question(row: Dict, seq: int) -> Dict:
    qid = f"{ID_PREFIX}-{seq:03d}"
    role_tag = {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[row["role"]]
    target_tag = "chapter" if row["target_level"] == "chapter" else "branch"
    return {
        "id": qid,
        "title": f"J61 {row['source_section']}第{row['source_number']:02d}題",
        "question_text": row["raw_question_text"],
        "answer_text": row["answer_text"].strip(),
        "explanation_text": row["explanation_text"].strip(),
        "stage": "國中",
        "grade": "國三",
        "chapter": row["chapter_code"],
        "chapter_code": row["chapter_code"],
        "difficulty": difficulty_for(row),
        "source_type": "manual-docx-structured-pack",
        "source_ref": SOURCE_REF,
        "question_role": row["role"],
        "target_level": row["target_level"],
        "target_id": row["target_id"],
        "target_title": row["target_title"],
        "source_section": row["source_section"],
        "source_number": row["source_number"],
        "source_order": row["source_order"],
        "tags": [
            "J61",
            row["chapter_code"],
            "二次函數",
            f"role:{role_tag}",
            f"group:{target_tag}-{role_tag}",
            f"source-section:{row['source_section']}",
            f"topic:{row['topic_id']}",
        ],
    }


def make_link(question: Dict, row: Dict) -> Dict:
    now = now_iso()
    level = "chapter" if row["target_level"] == "chapter" else "topic"
    target = row["target_id"]
    return {
        "id": f"link-{question['id']}-{target}",
        "title": f"{question['id']} -> {target}",
        "question_id": question["id"],
        "question_title": question["title"],
        "topic_id": target if level == "topic" else "",
        "chapter_code": row["chapter_code"],
        "link_level": level,
        "source_type": "manual-docx-structured-pack",
        "source_ref": SOURCE_REF,
        "confidence": 0.88 if level == "topic" else 0.82,
        "created_at": now,
        "updated_at": now,
        "tags": [row["role"], row["source_section"], row["target_title"]],
    }


def write_jsonl(path: Path, records: List[Dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(json.dumps(record, ensure_ascii=False) for record in records) + "\n", encoding="utf-8")


def build_preview(questions: List[Dict], links: List[Dict]) -> Dict:
    return {
        "source_docx": str(SOURCE_DOCX),
        "source_ref": SOURCE_REF,
        "generated_at": now_iso(),
        "question_count": len(questions),
        "link_count": len(links),
        "by_role": dict(Counter(q["question_role"] for q in questions)),
        "by_chapter": dict(Counter(q["chapter_code"] for q in questions)),
        "by_section": dict(Counter(q["source_section"] for q in questions)),
        "by_target_level": dict(Counter(q["target_level"] for q in questions)),
        "answer_marker_policy": "選擇題與是非題題幹開頭的（ ）作答括號已移除。",
        "role_policy": {
            "範例": "章節保留 3-5 題示範題；各主題再保留 2 題示範題。",
            "練習": "各主題保留最多 3 題中等或偏難練習。",
            "習題": "剩餘填充、應用、作圖、計算題放回章節代號。",
            "題庫": "剩餘選擇、是非題放回章節代號。",
        },
        "samples": questions[:5],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force-pandoc", action="store_true")
    args = parser.parse_args()

    run_pandoc(force=args.force_pandoc)
    markdown = MARKDOWN_PATH.read_text(encoding="utf-8")
    rows = parse_markdown(markdown)
    assign_topics(rows)
    assign_roles(rows)

    questions = [make_question(row, idx) for idx, row in enumerate(rows, 1)]
    links = [make_link(question, row) for question, row in zip(questions, rows)]

    write_jsonl(OUT_QUESTIONS, questions)
    write_jsonl(OUT_LINKS, links)
    OUT_PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    OUT_PREVIEW.write_text(json.dumps(build_preview(questions, links), ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        json.dumps(
            {
                "source_docx": str(SOURCE_DOCX),
                "source_ref": SOURCE_REF,
                "question_count": len(questions),
                "link_count": len(links),
                "output_questions": str(OUT_QUESTIONS.relative_to(ROOT)),
                "output_links": str(OUT_LINKS.relative_to(ROOT)),
                "answer_marker_policy": "選擇題與是非題題幹開頭的（ ）作答括號已移除。",
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    print(
        json.dumps(
            {
                "by_role": dict(Counter(q["question_role"] for q in questions)),
                "by_chapter": dict(Counter(q["chapter_code"] for q in questions)),
                "by_section": dict(Counter(q["source_section"] for q in questions)),
                "by_target_level": dict(Counter(q["target_level"] for q in questions)),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
