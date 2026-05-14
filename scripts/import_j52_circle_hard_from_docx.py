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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J52圓困難題題目答案卷.docx")
WORK_DIR = ROOT / "exports" / "j52-circle-hard"
MEDIA_DIR = WORK_DIR / "media"
MARKDOWN_PATH = WORK_DIR / "j52-pandoc.md"
OUT_DIR = ROOT / "program-db" / "imports"

SOURCE_REF = "J52圓困難題題目答案卷.docx"
ID_PREFIX = "q-j52-circle-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j52-circle-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j52-circle-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j52-circle-hard.preview.json"

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
    "circle_language": ("j5-2-1", "j5-2-1-circle-basic-language", "圓的基本語言：圓心、半徑、弦、切線、割線"),
    "point_position": ("j5-2-1", "j5-2-1-point-circle-position", "點與圓位置：比較 OP 與 r"),
    "line_position": ("j5-2-1", "j5-2-1-line-circle-position", "直線與圓位置：比較 d 與 r"),
    "tangent_property": ("j5-2-1", "j5-2-1-tangent-property-criterion", "切線性質與判別：半徑垂直切線"),
    "tangent_construction": ("j5-2-1", "j5-2-1-tangent-construction", "切線作圖與切線長計算"),
    "coordinate_tangent": ("j5-2-1", "j5-2-1-coordinate-tangent-area", "座標切線與面積題：先找直角再拆面積"),
    "chord_center_distance": ("j5-2-1", "j5-2-1-chord-center-distance", "弦心距與垂徑定理"),
    "equal_chords": ("j5-2-1", "j5-2-1-equal-chords-distance-order", "等弦等距、弦長比較與距心遠近"),
    "chord_length": ("j5-2-1", "j5-2-1-chord-length-pythagorean", "弦長計算：半徑、弦心距、半弦畢氏"),
    "concentric_area": ("j5-2-1", "j5-2-1-concentric-circle-area-diff", "同心圓面積差與弦長連動"),
    "two_circles_threshold": ("j5-2-1", "j5-2-1-two-circles-thresholds", "兩圓位置總想法：比較 d、r1+r2、|r1-r2|"),
    "five_position": ("j5-2-1", "j5-2-1-five-position-cases", "兩圓五種位置關係總表"),
    "position_judge": ("j5-2-1", "j5-2-1-position-judge-procedure", "兩圓位置判斷題流程"),
    "common_chord": ("j5-2-1", "j5-2-1-common-chord-property", "相交兩圓公共弦：連心線垂直平分"),
    "common_chord_calc": ("j5-2-1", "j5-2-1-common-chord-calculation", "公共弦計算：兩半徑共用同一半弦"),
    "tangent_centers": ("j5-2-1", "j5-2-1-tangent-point-centers-line", "兩圓相切：切點在連心線上"),
    "multi_circle": ("j5-2-1", "j5-2-1-multi-circle-tangent-models", "三圓外切與內切組合模型"),
    "common_tangent_count": ("j5-2-1", "j5-2-1-common-tangent-language-count", "公切線語言與條數判斷"),
    "external_tangent": ("j5-2-1", "j5-2-1-external-common-tangent-length", "外公切線長公式：用半徑差"),
    "internal_tangent": ("j5-2-1", "j5-2-1-internal-common-tangent-length", "內公切線長公式：用半徑和"),
    "tangent_compare": ("j5-2-1", "j5-2-1-tangent-length-comparison", "同數據比較外公切線與內公切線"),
    "checklist_1": ("j5-2-1", "j5-2-1-chapter-checklist", "本章解題檢查表"),
    "arc_chord": ("j5-2-2", "j5-2-2-arc-chord-basics", "弧與弦基本辨識"),
    "central_angle": ("j5-2-2", "j5-2-2-central-angle-arc-degree", "圓心角與弧度數"),
    "arc_length": ("j5-2-2", "j5-2-2-arc-length-radian", "弧長公式與徑度觀念"),
    "concentric_order": ("j5-2-2", "j5-2-2-concentric-arc-chord-order", "同心圓與角弧弦大小對應"),
    "rolling_arc": ("j5-2-2", "j5-2-2-rolling-arc-distance", "扇形滾動與弧長位移"),
    "inscribed_angle": ("j5-2-2", "j5-2-2-inscribed-angle-basics", "圓周角基本性質"),
    "tangent_chord_angle": ("j5-2-2", "j5-2-2-tangent-chord-angle", "弦切角與圓周角對應"),
    "interior_exterior_angle": ("j5-2-2", "j5-2-2-interior-exterior-angle", "圓內角與圓外角"),
    "angle_formula_map": ("j5-2-2", "j5-2-2-angle-formula-map", "圓中角公式地圖：先看頂點位置"),
    "arc_ratio": ("j5-2-2", "j5-2-2-arc-ratio-partition", "弧比例分配題"),
    "power_inside": ("j5-2-2", "j5-2-2-power-inside", "內冪性質：兩弦交於圓內"),
    "power_outside": ("j5-2-2", "j5-2-2-power-outside", "外冪性質：兩割線從圓外一點出發"),
    "tangent_secant": ("j5-2-2", "j5-2-2-tangent-secant-theorem", "切割線性質：切線平方"),
    "power_similarity": ("j5-2-2", "j5-2-2-power-from-similarity", "乘冪來源：相似三角形"),
    "diameter_circumcircle": ("j5-2-2", "j5-2-2-diameter-circumcircle-integration", "直徑與外接圓綜合"),
    "sector_area": ("j5-2-2", "j5-2-2-sector-triangle-area-integration", "圓與角面積綜合：扇形減三角形"),
    "checklist_2": ("j5-2-2", "j5-2-2-chapter-checklist", "本章解題檢查表"),
}

CHAPTER_TITLES = {
    "j5-2-1": "基本圓與長度關係",
    "j5-2-2": "圓的角度關係",
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
    if has_any(compact, ["扇形", "面積", "陰影", "弓形"]):
        if has_any(compact, ["滾動", "位移", "移動"]):
            return "rolling_arc"
        return "sector_area"
    if has_any(compact, ["滾動", "弧長", "弧的長", "圓周長", "徑度"]):
        return "rolling_arc" if has_any(compact, ["滾動", "位移"]) else "arc_length"
    if has_any(compact, ["圓心角", "弧度數", "弧度", "度數"]):
        return "central_angle"
    if has_any(compact, ["弦切角"]):
        return "tangent_chord_angle"
    if has_any(compact, ["圓周角", "同弧", "半圓所對", "直徑所對"]):
        return "inscribed_angle"
    if has_any(compact, ["圓內角", "圓外角", "交於圓內", "交於圓外", "外角"]):
        return "interior_exterior_angle"
    if has_any(compact, ["弧", "弦"]) and has_any(compact, ["比例", "分成", "比"]):
        return "arc_ratio"
    if has_any(compact, ["內冪", "兩弦相交", "弦交於", "交於圓內"]) or (has_any(compact, ["PA×PB", "PC×PD"]) and not has_any(compact, ["切線"])):
        return "power_inside"
    if has_any(compact, ["外冪", "兩割線", "割線"]) and not has_any(compact, ["切線平方", "切割線"]):
        return "power_outside"
    if has_any(compact, ["切割線", "切線平方", "切線長平方", "切線與割線"]):
        return "tangent_secant"
    if has_any(compact, ["相似", "乘冪來源", "證明乘冪"]):
        return "power_similarity"
    if has_any(compact, ["直徑", "外接圓", "圓內接", "內接三角形"]):
        return "diameter_circumcircle"
    if has_any(compact, ["角", "∠", "度"]):
        return "angle_formula_map"
    if has_any(compact, ["同心圓"]) and has_any(compact, ["面積", "弦長"]):
        return "concentric_area"
    if has_any(compact, ["同心圓"]) and has_any(compact, ["弧", "弦", "大小"]):
        return "concentric_order"
    if has_any(compact, ["公共弦"]):
        return "common_chord_calc" if has_any(compact, ["求", "長", "半徑"]) else "common_chord"
    if has_any(compact, ["三圓", "三個圓", "外切", "內切"]) and has_any(compact, ["圓"]):
        return "multi_circle"
    if has_any(compact, ["外公切線"]):
        return "external_tangent"
    if has_any(compact, ["內公切線"]):
        return "internal_tangent"
    if has_any(compact, ["公切線"]) and has_any(compact, ["條", "條數", "幾條"]):
        return "common_tangent_count"
    if has_any(compact, ["外公切線", "內公切線", "比較"]):
        return "tangent_compare"
    if has_any(compact, ["兩圓", "圓O", "圓P"]) and has_any(compact, ["位置", "外離", "外切", "相交", "內切", "內含"]):
        return "position_judge" if has_any(compact, ["判斷", "何者", "下列"]) else "five_position"
    if has_any(compact, ["切點在連心線", "連心線", "兩圓相切"]):
        return "tangent_centers"
    if has_any(compact, ["切線作圖", "作切線", "尺規"]):
        return "tangent_construction"
    if has_any(compact, ["切線", "半徑垂直", "垂直切線", "切於"]):
        if has_any(compact, ["座標", "坐標", "面積"]):
            return "coordinate_tangent"
        if has_any(compact, ["切線長", "求長", "長度"]):
            return "tangent_construction"
        return "tangent_property"
    if has_any(compact, ["弦心距", "垂徑", "垂直平分", "圓心到弦"]):
        return "chord_center_distance"
    if has_any(compact, ["等弦", "弦長比較", "距心", "較長的弦"]):
        return "equal_chords"
    if has_any(compact, ["弦長", "半弦", "半徑", "畢氏"]):
        return "chord_length"
    if has_any(compact, ["點", "圓內", "圓外", "圓上"]) and has_any(compact, ["距離", "OP", "圓心"]):
        return "point_position"
    if has_any(compact, ["直線與圓", "相離", "相切", "相交"]) and has_any(compact, ["距離", "d", "r"]):
        return "line_position"
    if has_any(compact, ["圓心", "半徑", "弦", "割線", "切線"]):
        return "circle_language"
    return "checklist_2" if has_any(compact, ["角", "弧"]) else "checklist_1"


def score_for_role(row: Dict) -> Tuple[int, int, int]:
    section_score = {"證明": 6, "計算": 6, "題組": 5, "作圖": 5, "填充": 4, "選擇": 3, "是非": 1}.get(row["source_section"], 2)
    images = len(re.findall(r"\[圖:", row["raw_question_text"]))
    ideal = -abs(len(row["raw_question_text"]) - 150) // 70
    return (section_score + ideal - images, -images, -row["source_order"])


def assign_topics(rows: List[Dict]) -> None:
    for row in rows:
        key = classify_topic(row["raw_question_text"], row["source_section"])
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
        "J52",
        row["chapter_code"],
        "圓",
        f"role:{role_slug(row['role'])}",
        f"group:{group}",
        f"source-section:{row['source_section']}",
        f"topic:{row['topic_id']}",
        f"branch:{row['topic_title']}",
    ]
    if row["target_level"] == "branch":
        tags.append(f"branch-topic:{row['topic_id']}")
    if row["target_level"] == "chapter":
        tags.append("chapter-only")
    return {
        "id": qid,
        "title": f"J52 {row['source_section']}第{row['source_number']:02d}題",
        "question_text": row["raw_question_text"],
        "answer_text": row["answer_text"],
        "explanation_text": row["explanation_text"],
        "stage": "國中",
        "grade": "國三",
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
            "範例": "章節主題保留 3-5 題中等示範題；分支再保留 2 題示範題。",
            "練習": "各分支保留最多 3 題中等或偏難練習。",
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
