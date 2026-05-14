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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J53幾何與證明困難題題目答案卷.docx")
WORK_DIR = ROOT / "exports" / "j53-geometry-proof-centers-hard"
MEDIA_DIR = WORK_DIR / "media"
MARKDOWN_PATH = WORK_DIR / "j53-pandoc.md"
OUT_DIR = ROOT / "program-db" / "imports"

SOURCE_REF = "J53幾何與證明困難題題目答案卷.docx"
ID_PREFIX = "q-j53-geometry-proof-centers-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j53-geometry-proof-centers-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j53-geometry-proof-centers-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j53-geometry-proof-centers-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、證明": "證明",
    "四、作圖": "作圖",
    "五、計算": "計算",
    "六、是非": "是非",
}

TOPICS = {
    "reasoning": ("j5-3-2", "j5-3-2-what-is-geometric-reasoning", "幾何推理是什麼：由規則推出新結論"),
    "toolbox": ("j5-3-2", "j5-3-2-postulates-and-toolbox", "公設與可用幾何工具箱"),
    "proof_format": ("j5-3-2", "j5-3-2-proof-language-format", "證明語言與格式：已知、求證、證明"),
    "angle_sum": ("j5-3-2", "j5-3-2-angle-sum-theorems", "角和定理：三角形、外角、四邊形"),
    "complement": ("j5-3-2", "j5-3-2-complementary-angle-elimination", "同角的餘角相等：等式消去法"),
    "analysis_backward": ("j5-3-2", "j5-3-2-analysis-draw-backward", "證明三步：分析、畫圖、倒推"),
    "congruence_template": ("j5-3-2", "j5-3-2-congruence-template-rhs", "全等模板：先對應再判別（含 RHS）"),
    "perp_bisector": ("j5-3-2", "j5-3-2-perpendicular-bisector-property-converse", "中垂線性質與判別"),
    "angle_bisector": ("j5-3-2", "j5-3-2-angle-bisector-distance-property", "角平分線性質：到兩邊等距"),
    "isosceles": ("j5-3-2", "j5-3-2-isosceles-triangle-properties", "等腰三角形性質整合"),
    "parallelogram": ("j5-3-2", "j5-3-2-parallelogram-diagonal-congruence", "平行四邊形對角線分全等"),
    "auxiliary": ("j5-3-2", "j5-3-2-auxiliary-line-toolbox", "輔助線工具箱：作線為了補條件"),
    "composite": ("j5-3-2", "j5-3-2-composite-proof-overview", "綜合證題法總覽：先看目標再選工具"),
    "writing_demo": ("j5-3-2", "j5-3-2-proof-writing-demo", "證明寫法示範：每行都有理由"),
    "failures": ("j5-3-2", "j5-3-2-common-failures", "常見失誤：方向錯、理由斷、結論跳"),
    "checklist_2": ("j5-3-2", "j5-3-2-chapter-checklist", "本章檢查表：方向、理由、結論"),
    "circum_def": ("j5-3-3", "j5-3-3-circumcenter-definition", "外心定義與外接圓"),
    "circum_pos": ("j5-3-3", "j5-3-3-circumcenter-position", "外心位置：銳內、直邊、鈍外"),
    "circum_angle": ("j5-3-3", "j5-3-3-circumcenter-angle-formula", "外心角公式"),
    "circum_coord": ("j5-3-3", "j5-3-3-circumcenter-coordinate", "座標求外心：等距方程"),
    "incenter_def": ("j5-3-3", "j5-3-3-incenter-definition-incircle", "內心定義與內切圓"),
    "incenter_angle": ("j5-3-3", "j5-3-3-incenter-angle-formula", "內心角公式"),
    "incenter_tangent": ("j5-3-3", "j5-3-3-incenter-tangent-length", "內切圓切線長相等"),
    "incenter_area": ("j5-3-3", "j5-3-3-incenter-area-formula", "內心面積公式與比例"),
    "centroid_def": ("j5-3-3", "j5-3-3-centroid-definition-medians", "重心定義與中線"),
    "centroid_ratio": ("j5-3-3", "j5-3-3-centroid-ratio-2-1", "重心 2:1 性質"),
    "centroid_area": ("j5-3-3", "j5-3-3-centroid-area-partition", "重心與面積分割"),
    "centroid_coord": ("j5-3-3", "j5-3-3-centroid-coordinate", "座標重心：平均座標"),
    "centers_compare": ("j5-3-3", "j5-3-3-centers-comparison", "三心比較：外心、內心、重心"),
    "equilateral": ("j5-3-3", "j5-3-3-equilateral-special-case", "正三角形特例：三心共點"),
    "centers_strategy": ("j5-3-3", "j5-3-3-proof-and-construction-strategy", "證明與作圖策略：先找線再找等距"),
    "checklist_3": ("j5-3-3", "j5-3-3-chapter-checklist", "本章檢查表：中心類型、等距對象、比例關係"),
}

CHAPTER_TITLES = {
    "j5-3-1": "代數證明",
    "j5-3-2": "幾何證明",
    "j5-3-3": "外心、內心、重心",
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
    if has_any(compact, ["代數證明", "奇數", "偶數", "整除", "倍數", "因數"]) and not has_any(compact, ["三角形", "外心", "內心", "重心"]):
        return "chapter:j5-3-1"
    if has_any(compact, ["外心", "外接圓", "到三頂點", "中垂線交點"]):
        if has_any(compact, ["位置", "銳角", "直角", "鈍角"]):
            return "circum_pos"
        if has_any(compact, ["座標", "坐標"]):
            return "circum_coord"
        if has_any(compact, ["角", "∠"]):
            return "circum_angle"
        return "circum_def"
    if has_any(compact, ["內心", "內切圓", "到三邊", "角平分線交點"]):
        if has_any(compact, ["切線長", "切點", "半周長"]):
            return "incenter_tangent"
        if has_any(compact, ["面積", "內切圓半徑", "r"]):
            return "incenter_area"
        if has_any(compact, ["角", "∠"]):
            return "incenter_angle"
        return "incenter_def"
    if has_any(compact, ["重心", "中線交點", "三中線"]):
        if has_any(compact, ["座標", "坐標"]):
            return "centroid_coord"
        if has_any(compact, ["2:1", "2：1", "二比一", "比例"]):
            return "centroid_ratio"
        if has_any(compact, ["面積", "六等分", "分割"]):
            return "centroid_area"
        return "centroid_def"
    if has_any(compact, ["三心", "外心、內心、重心", "外心內心重心"]):
        if has_any(compact, ["正三角形", "等邊"]):
            return "equilateral"
        return "centers_compare"
    if section == "作圖" and has_any(compact, ["外心", "內心", "重心", "中垂線", "角平分線", "中線"]):
        return "centers_strategy"
    if has_any(compact, ["RHS", "HL", "SSS", "SAS", "ASA", "AAS", "全等"]):
        return "congruence_template"
    if has_any(compact, ["中垂線", "垂直平分線", "到兩端點等距"]):
        return "perp_bisector"
    if has_any(compact, ["角平分線", "到兩邊等距"]):
        return "angle_bisector"
    if has_any(compact, ["等腰", "底角", "頂角"]):
        return "isosceles"
    if has_any(compact, ["平行四邊形", "對角線"]):
        return "parallelogram"
    if has_any(compact, ["餘角", "補角", "同角", "等式消去"]):
        return "complement"
    if has_any(compact, ["外角", "內角和", "四邊形", "角和"]):
        return "angle_sum"
    if has_any(compact, ["輔助線", "作", "延長", "連接"]):
        return "auxiliary"
    if section == "證明" or has_any(compact, ["求證", "證明", "已知"]):
        if has_any(compact, ["格式", "理由", "寫法"]):
            return "proof_format"
        if has_any(compact, ["錯誤", "不正確", "何者錯"]):
            return "failures"
        return "composite"
    if has_any(compact, ["公設", "定理", "工具"]):
        return "toolbox"
    if has_any(compact, ["推理", "結論", "根據"]):
        return "reasoning"
    return "checklist_3" if has_any(compact, ["心", "圓"]) else "checklist_2"


def score_for_role(row: Dict) -> Tuple[int, int, int]:
    section_score = {"證明": 6, "計算": 6, "作圖": 5, "填充": 4, "選擇": 3, "是非": 1}.get(row["source_section"], 2)
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
        row["role"] = "習題" if row["source_section"] in {"填充", "證明", "作圖", "計算"} else "題庫"
        row["target_level"] = "chapter"
        row["target_id"] = row["chapter_code"]
        row["target_title"] = CHAPTER_TITLES[row["chapter_code"]]


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["source_section"] in {"證明", "作圖", "計算"}:
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
    tags = ["J53", row["chapter_code"], "幾何與證明", f"role:{role_slug(row['role'])}", f"group:{group}", f"source-section:{row['source_section']}"]
    if row["topic_id"]:
        tags.extend([f"topic:{row['topic_id']}", f"branch:{row['topic_title']}"])
    if row["target_level"] == "branch":
        tags.append(f"branch-topic:{row['topic_id']}")
    if row["target_level"] == "chapter":
        tags.append("chapter-only")
    return {
        "id": qid,
        "title": f"J53 {row['source_section']}第{row['source_number']:02d}題",
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
            "習題": "剩餘填充、證明、作圖、計算題放回章節代號。",
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
