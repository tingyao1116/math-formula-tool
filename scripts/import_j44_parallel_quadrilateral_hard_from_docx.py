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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J44平行與四邊形困難題題目答案卷.docx")
WORK_DIR = ROOT / "exports" / "j44-parallel-quadrilateral-hard"
MEDIA_DIR = WORK_DIR / "media"
MARKDOWN_PATH = WORK_DIR / "j44-pandoc.md"
OUT_DIR = ROOT / "program-db" / "imports"

SOURCE_REF = "J44平行與四邊形困難題題目答案卷.docx"
ID_PREFIX = "q-j44-parallel-quadrilateral-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j44-parallel-quadrilateral-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j44-parallel-quadrilateral-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j44-parallel-quadrilateral-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、題組": "題組",
    "四、證明": "證明",
    "五、作圖": "作圖",
    "六、計算": "計算",
    "七、是非": "是非",
}

TOPICS = {
    "parallelogram_definition": ("j4-4-1", "j4-4-1-parallelogram-definition", "平行四邊形的定義與記號"),
    "diagonal_congruence": ("j4-4-1", "j4-4-1-diagonal-congruence", "對角線分成兩個全等三角形"),
    "opposite_sides": ("j4-4-1", "j4-4-1-opposite-sides-equal", "性質：兩組對邊分別相等"),
    "opposite_angles": ("j4-4-1", "j4-4-1-opposite-angles-supplementary", "性質：對角相等、鄰角互補"),
    "diagonal_bisect": ("j4-4-1", "j4-4-1-diagonal-bisect-property", "性質：兩條對角線互相平分"),
    "criterion_onepair": ("j4-4-1", "j4-4-1-criterion-onepair-parallel-equal", "判別：一組對邊平行且相等"),
    "criterion_sides": ("j4-4-1", "j4-4-1-criterion-two-pairs-sides", "判別：兩組對邊分別相等"),
    "criterion_angles": ("j4-4-1", "j4-4-1-criterion-two-pairs-angles", "判別：兩組對角分別相等"),
    "criterion_diagonal": ("j4-4-1", "j4-4-1-criterion-diagonal-bisect", "判別：兩對角線互相平分"),
    "midpoint_theorem": ("j4-4-2", "j4-4-2-midpoint-theorem", "三角形兩邊中點連線性質"),
    "midpoint_extension": ("j4-4-2", "j4-4-2-midpoint-extension-proof", "中點連線延長證明法"),
    "interior_area": ("j4-4-2", "j4-4-2-interior-point-area-relation", "平行四邊形內一點的面積關係"),
    "angle_perimeter": ("j4-4-2", "j4-4-2-angle-perimeter-routine", "角度與周長計算基本套路"),
    "midpoint_area": ("j4-4-2", "j4-4-2-midpoint-area-allocation", "中點切割與面積分配"),
    "area_height": ("j4-4-2", "j4-4-2-area-height-diagonal", "由面積求高，再用畢氏求對角線"),
    "overlap_angle": ("j4-4-2", "j4-4-2-overlap-angle-chasing", "重疊圖形角度追蹤"),
    "sector_area": ("j4-4-2", "j4-4-2-sector-area-application", "雨刷面積：平行四邊形與扇形面積"),
    "coordinate_midpoint": ("j4-4-2", "j4-4-2-coordinate-midpoint-parallelogram", "座標中的平行四邊形：對角線中點法"),
    "folding_angle": ("j4-4-2", "j4-4-2-folding-angle-bisector-composite", "長方形摺疊與角平分線綜合"),
}

CHAPTER_TITLES = {
    "j4-4-1": "平行",
    "j4-4-2": "平行四邊形",
    "j4-4-3": "梯形及其他四邊形關係",
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


def classify_topic(text: str, section: str) -> str:
    compact = compact_text(text)
    if has_any(compact, ["梯形", "等腰梯形", "菱形", "箏形", "鳶形", "矩形", "長方形", "正方形"]) and not has_any(compact, ["平行四邊形"]):
        return "chapter:j4-4-3"
    if has_any(compact, ["摺", "摺疊", "翻折", "角平分線", "平分∠", "平分角"]):
        return "folding_angle"
    if has_any(compact, ["座標", "坐標", "中點公式", "對角線中點"]):
        return "coordinate_midpoint"
    if has_any(compact, ["扇形", "雨刷", "圓弧", "弧", "圓心角"]):
        return "sector_area"
    if has_any(compact, ["面積", "陰影", "斜線", "高", "底", "面積比"]):
        if has_any(compact, ["內一點", "內部一點", "P點在平行四邊形內"]):
            return "interior_area"
        if has_any(compact, ["中點", "連線", "分割"]):
            return "midpoint_area"
        return "area_height"
    if has_any(compact, ["中點連線", "中位線", "兩邊中點", "中點"]):
        if section == "證明" or has_any(compact, ["延長", "證明", "求證"]):
            return "midpoint_extension"
        return "midpoint_theorem"
    if has_any(compact, ["重疊", "旋轉", "平移", "角度追蹤"]):
        return "overlap_angle"
    if has_any(compact, ["對角線互相平分", "互相平分", "對角線的中點"]):
        return "criterion_diagonal" if has_any(compact, ["判別", "可得", "證明是", "為平行四邊形"]) else "diagonal_bisect"
    if has_any(compact, ["一組對邊平行且相等", "一組對邊平行又相等"]):
        return "criterion_onepair"
    if has_any(compact, ["兩組對邊", "對邊分別相等"]):
        return "criterion_sides" if has_any(compact, ["判別", "證明是", "可得"]) else "opposite_sides"
    if has_any(compact, ["兩組對角", "對角相等"]):
        return "criterion_angles" if has_any(compact, ["判別", "證明是", "可得"]) else "opposite_angles"
    if has_any(compact, ["全等", "對角線分成", "△ABC", "△CDA"]):
        return "diagonal_congruence"
    if has_any(compact, ["周長", "邊長", "∠", "角", "鄰角", "對角"]):
        return "angle_perimeter"
    if has_any(compact, ["平行四邊形", "ABCD"]):
        return "parallelogram_definition"
    return "chapter:j4-4-1"


def score_for_role(row: Dict) -> Tuple[int, int, int]:
    section_score = {"證明": 6, "計算": 6, "題組": 5, "作圖": 5, "填充": 4, "選擇": 3, "是非": 1}.get(row["source_section"], 2)
    images = len(re.findall(r"\[圖:", row["raw_question_text"]))
    ideal = -abs(len(row["raw_question_text"]) - 150) // 70
    return (section_score + ideal - images, -images, -row["source_order"])


def assign_topics(rows: List[Dict]) -> None:
    for row in rows:
        key = classify_topic(row["raw_question_text"], row["source_section"])
        if key.startswith("chapter:"):
            chapter = key.split(":", 1)[1]
            row.update({"topic_key": key, "chapter_code": chapter, "topic_id": "", "topic_title": ""})
        else:
            chapter, topic_id, topic_title = TOPICS[key]
            row.update({"topic_key": key, "chapter_code": chapter, "topic_id": topic_id, "topic_title": topic_title})
        row.update({"role": "", "target_level": "", "target_id": "", "target_title": ""})


def assign_roles(rows: List[Dict]) -> None:
    by_chapter: Dict[str, List[Dict]] = defaultdict(list)
    by_topic: Dict[str, List[Dict]] = defaultdict(list)
    for row in rows:
        by_chapter[row["chapter_code"]].append(row)
        if row["topic_id"]:
            by_topic[row["topic_id"]].append(row)

    for chapter_code, items in by_chapter.items():
        for row in sorted(items, key=score_for_role, reverse=True)[:5]:
            row.update({"role": "範例", "target_level": "chapter", "target_id": chapter_code, "target_title": CHAPTER_TITLES[chapter_code]})

    for topic_id, items in by_topic.items():
        available = [row for row in sorted(items, key=score_for_role, reverse=True) if not row["role"]]
        for row in available[:2]:
            row.update({"role": "範例", "target_level": "branch", "target_id": row["topic_id"], "target_title": row["topic_title"]})
        for row in available[2:5]:
            row.update({"role": "練習", "target_level": "branch", "target_id": row["topic_id"], "target_title": row["topic_title"]})

    for row in rows:
        if row["role"]:
            continue
        row["role"] = "習題" if row["source_section"] in {"填充", "題組", "證明", "作圖", "計算"} else "題庫"
        row["target_level"] = "chapter"
        row["target_id"] = row["chapter_code"]
        row["target_title"] = CHAPTER_TITLES[row["chapter_code"]]


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["source_section"] in {"題組", "證明", "作圖", "計算"}:
        return "偏難"
    if row["role"] in {"範例", "練習"}:
        return "中等偏難"
    return "中等"


def make_question(row: Dict) -> Dict:
    qid = f"{ID_PREFIX}-{row['source_order']:03d}"
    group = {
        ("範例", "chapter"): "chapter-example",
        ("範例", "branch"): "branch-example",
        ("練習", "branch"): "branch-practice",
        ("習題", "chapter"): "chapter-exercise",
        ("題庫", "chapter"): "chapter-bank",
    }.get((row["role"], row["target_level"]), f"chapter-{role_slug(row['role'])}")
    tags = [
        "J44",
        row["chapter_code"],
        "平行與四邊形",
        f"role:{role_slug(row['role'])}",
        f"group:{group}",
        f"source-section:{row['source_section']}",
    ]
    if row["topic_id"]:
        tags.extend([f"topic:{row['topic_id']}", f"branch:{row['topic_title']}"])
    if row["target_level"] == "branch":
        tags.append(f"branch-topic:{row['topic_id']}")
    if row["target_level"] == "chapter":
        tags.append("chapter-only")
    return {
        "id": qid,
        "title": f"J44 {row['source_section']}第{row['source_number']:02d}題",
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
        "question_role": row["role"],
        "target_level": row["target_level"],
        "target_id": row["target_id"],
        "target_title": row["target_title"],
        "source_section": row["source_section"],
        "source_number": row["source_number"],
        "source_order": row["source_order"],
        "tags": tags,
    }


def make_link(question: Dict) -> Dict:
    chapter_code = question["chapter_code"]
    qid = question["id"]
    if question.get("target_level") == "branch":
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


def write_jsonl(path: Path, records: List[Dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(json.dumps(record, ensure_ascii=False) for record in records) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force-pandoc", action="store_true")
    args = parser.parse_args()

    run_pandoc(force=args.force_pandoc)
    rows = parse_markdown(MARKDOWN_PATH.read_text(encoding="utf-8"))
    assign_topics(rows)
    assign_roles(rows)
    questions = [make_question(row) for row in rows]
    links = [make_link(question) for question in questions]

    write_jsonl(OUT_QUESTIONS, questions)
    write_jsonl(OUT_LINKS, links)

    preview = {
        "source_docx": str(SOURCE_DOCX),
        "source_ref": SOURCE_REF,
        "question_count": len(questions),
        "link_count": len(links),
        "output_questions": str(OUT_QUESTIONS.relative_to(ROOT)).replace("\\", "/"),
        "output_links": str(OUT_LINKS.relative_to(ROOT)).replace("\\", "/"),
        "answer_marker_policy": "選擇題與是非題題幹開頭的（ ）作答括號已移除。",
        "role_policy": {
            "範例": "章節主題保留 3-5 題中等示範題；現有分支再保留 2 題示範題。",
            "練習": "現有分支保留最多 3 題中等或偏難練習。",
            "習題": "剩餘填充、題組、證明、作圖、計算題放回章節代號。",
            "題庫": "剩餘選擇、是非題放回章節代號。",
        },
        "by_role": dict(Counter(q["question_role"] for q in questions)),
        "by_chapter": dict(Counter(q["chapter_code"] for q in questions)),
        "by_section": dict(Counter(q["source_section"] for q in questions)),
        "by_target_level": dict(Counter(q["target_level"] for q in questions)),
        "samples": questions[:12],
    }
    OUT_PREVIEW.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: preview[k] for k in ["source_docx", "source_ref", "question_count", "link_count", "output_questions", "output_links", "answer_marker_policy", "role_policy"]}, ensure_ascii=False, indent=2))
    print(json.dumps({k: preview[k] for k in ["by_role", "by_chapter", "by_section", "by_target_level"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
