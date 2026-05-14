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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J51相似形困難題題目答案卷.docx")
WORK_DIR = ROOT / "exports" / "j51-similarity-hard"
MEDIA_DIR = WORK_DIR / "media"
MARKDOWN_PATH = WORK_DIR / "j51-pandoc.md"
OUT_DIR = ROOT / "program-db" / "imports"

SOURCE_REF = "J51相似形困難題題目答案卷.docx"
ID_PREFIX = "q-j51-similarity-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j51-similarity-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j51-similarity-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j51-similarity-hard.preview.json"

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
    "八、仿會考非選擇題": "仿會考非選擇題",
}

TOPICS = {
    "ratio_language": ("j5-1-2", "j5-1-2-ratio-language", "比例線段語言：同類量配對"),
    "parallel_intercept": ("j5-1-2", "j5-1-2-parallel-intercept-theorem", "平行線截比例線段性質"),
    "triangle_intercept_forward": ("j5-1-2", "j5-1-2-triangle-intercept-forward", "三角形截比例：平行推出比例"),
    "area_view": ("j5-1-2", "j5-1-2-area-view", "用面積理解截比例"),
    "triangle_intercept_converse": ("j5-1-2", "j5-1-2-triangle-intercept-converse", "三角形截比例反性質：比例推出平行"),
    "solve_unknown_length": ("j5-1-2", "j5-1-2-solve-unknown-length", "用比例線段求未知長度"),
    "multi_parallel_transfer": ("j5-1-2", "j5-1-2-multi-parallel-transfer", "多條平行線轉接證明"),
    "trapezoid_ratio": ("j5-1-2", "j5-1-2-trapezoid-ratio", "梯形中的分點比例"),
    "partition_aux": ("j5-1-2", "j5-1-2-partition-auxiliary-lines", "等分輔助線法：把 2:3 變成可數份數"),
    "ratio_types": ("j5-1-2", "j5-1-2-ratio-types-check", "先分清長度比、周長比、面積比"),
    "construction_ratio": ("j5-1-2", "j5-1-2-construction-6-5", "比例線段尺規作圖：把 AB 分成 6:5"),
    "checklist": ("j5-1-2", "j5-1-2-checklist-strategy", "比例線段解題檢查表"),
    "sim_language": ("j5-1-3", "j5-1-3-sim-language", "相似語言：角相等、邊成比例"),
    "criteria_overview": ("j5-1-3", "j5-1-3-criteria-overview", "相似判別總表：AA、SSS、SAS"),
    "aa": ("j5-1-3", "j5-1-3-aa-criterion", "AA 相似：兩角相等就夠"),
    "sss": ("j5-1-3", "j5-1-3-sss-criterion", "SSS 相似：三組邊成比例"),
    "sas": ("j5-1-3", "j5-1-3-sas-criterion", "SAS 相似：夾角相等、夾邊成比例"),
    "parallel_de": ("j5-1-3", "j5-1-3-parallel-de-bc", "平行線造成相似：DE 平行 BC"),
    "basic_computation": ("j5-1-3", "j5-1-3-basic-computation", "相似計算基本題：判斷後再跨乘"),
    "indirect_measurement": ("j5-1-3", "j5-1-3-indirect-measurement", "間接測量：湖泊距離與樹高"),
    "trapezoid_parallel_segment": ("j5-1-3", "j5-1-3-trapezoid-parallel-segment", "梯形中的平行線段長"),
    "self_similarity": ("j5-1-3", "j5-1-3-self-similarity", "共角加等角：三角形內自我相似"),
    "corresponding_elements": ("j5-1-3", "j5-1-3-corresponding-elements", "相似三角形的對應高、周長、角平分線、中線"),
    "area_ratio": ("j5-1-3", "j5-1-3-area-ratio-square", "相似面積比：邊長比要平方"),
    "parallel_height": ("j5-1-3", "j5-1-3-parallel-height-base-ratio", "平行截線中的高與底比例"),
    "right_altitude": ("j5-1-3", "j5-1-3-right-altitude-similarity", "直角三角形斜邊高：三個三角形都相似"),
    "altitude_product": ("j5-1-3", "j5-1-3-altitude-product-formulas", "斜邊高三個乘積公式"),
    "right_altitude_calc": ("j5-1-3", "j5-1-3-right-altitude-calculation", "直角三角形斜邊高計算"),
    "shadow": ("j5-1-3", "j5-1-3-shadow-projection", "影子與投影測量"),
    "river": ("j5-1-3", "j5-1-3-river-island-measurement", "河寬與海島測量：兩次標尺法"),
}

CHAPTER_TITLES = {
    "j5-1-1": "連比",
    "j5-1-2": "平行線截比例線段",
    "j5-1-3": "縮放與相似",
    "j5-1-4": "相似三角形應用",
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
    if has_any(compact, ["連比", "：：", "a:b:c", "a：b：c"]) and not has_any(compact, ["相似", "比例線段"]):
        return "chapter:j5-1-1"
    if section == "作圖" or has_any(compact, ["尺規", "作圖", "分成6:5", "分成6：5"]):
        return "construction_ratio"
    if has_any(compact, ["影子", "投影", "樹高", "旗桿", "身高"]):
        return "shadow"
    if has_any(compact, ["河寬", "海島", "湖泊", "測量", "無法直接測量", "間接測量"]):
        return "river" if has_any(compact, ["河", "海島"]) else "indirect_measurement"
    if has_any(compact, ["斜邊高", "斜邊上的高", "直角三角形"]):
        if has_any(compact, ["乘積", "平方", "AD×DB", "CD^(2)"]):
            return "altitude_product"
        if has_any(compact, ["求", "長", "計算"]):
            return "right_altitude_calc"
        return "right_altitude"
    if has_any(compact, ["面積比", "面積為", "面積", "平方"]):
        if has_any(compact, ["比例線段", "截比例"]):
            return "area_view"
        return "area_ratio"
    if has_any(compact, ["周長比", "高之比", "對應高", "中線", "角平分線", "對應"]):
        return "corresponding_elements"
    if has_any(compact, ["梯形"]):
        return "trapezoid_parallel_segment" if has_any(compact, ["中位線", "平行線段", "線段長"]) else "trapezoid_ratio"
    if has_any(compact, ["多條平行", "三條平行", "平行線截", "截比例線段"]):
        return "multi_parallel_transfer" if section == "證明" else "parallel_intercept"
    if has_any(compact, ["比例推出平行", "證明", "求證", "判斷是否平行"]) and has_any(compact, ["比例", "平行"]):
        return "triangle_intercept_converse"
    if has_any(compact, ["DE∥BC", "DE//BC", "平行於", "平行"]) and has_any(compact, ["△", "三角形", "比例"]):
        return "triangle_intercept_forward"
    if has_any(compact, ["未知長", "求x", "x＝", "求", "比例式"]) and has_any(compact, ["比例", "線段", "相似"]):
        return "solve_unknown_length"
    if has_any(compact, ["等分", "輔助線", "分點", "2:3", "2：3", "份"]):
        return "partition_aux"
    if has_any(compact, ["長度比", "周長比", "面積比"]):
        return "ratio_types"
    if has_any(compact, ["AA", "兩角", "角相等"]):
        return "aa"
    if has_any(compact, ["SSS", "三邊成比例"]):
        return "sss"
    if has_any(compact, ["SAS", "夾角", "兩邊成比例"]):
        return "sas"
    if has_any(compact, ["判別", "判定", "何者相似", "可判斷相似"]):
        return "criteria_overview"
    if has_any(compact, ["DE", "BC", "平行"]) and has_any(compact, ["相似", "∼", "~"]):
        return "parallel_de"
    if has_any(compact, ["共角", "自我相似", "母子相似", "∠A共用"]):
        return "self_similarity"
    if has_any(compact, ["相似", "∼", "~"]):
        return "basic_computation" if has_any(compact, ["求", "長", "x", "面積", "周長"]) else "sim_language"
    if has_any(compact, ["應用", "實測", "模型", "比例尺"]):
        return "chapter:j5-1-4"
    return "checklist"


def score_for_role(row: Dict) -> Tuple[int, int, int]:
    section_score = {"仿會考非選擇題": 6, "證明": 6, "計算": 6, "題組": 5, "作圖": 5, "填充": 4, "選擇": 3, "是非": 1}.get(row["source_section"], 2)
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
        row["role"] = "習題" if row["source_section"] in {"填充", "題組", "證明", "作圖", "計算", "仿會考非選擇題"} else "題庫"
        row["target_level"] = "chapter"
        row["target_id"] = row["chapter_code"]
        row["target_title"] = CHAPTER_TITLES[row["chapter_code"]]


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["source_section"] in {"題組", "證明", "作圖", "計算", "仿會考非選擇題"}:
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
        "J51",
        row["chapter_code"],
        "相似形",
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
        "title": f"J51 {row['source_section']}第{row['source_number']:02d}題",
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
            "範例": "章節主題保留 3-5 題中等示範題；現有分支再保留 2 題示範題。",
            "練習": "現有分支保留最多 3 題中等或偏難練習。",
            "習題": "剩餘填充、題組、證明、作圖、計算、仿會考非選擇題放回章節代號。",
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
