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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J43三角形基本性質困難題題目答案卷.docx")
WORK_DIR = ROOT / "exports" / "j43-triangle-properties-hard"
MEDIA_DIR = WORK_DIR / "media"
MARKDOWN_PATH = WORK_DIR / "j43-pandoc.md"
OUT_DIR = ROOT / "program-db" / "imports"

SOURCE_REF = "J43三角形基本性質困難題題目答案卷.docx"
ID_PREFIX = "q-j43-triangle-properties-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j43-triangle-properties-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j43-triangle-properties-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j43-triangle-properties-hard.preview.json"

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
    "congruence_correspondence": ("j4-3-3", "j4-3-3-congruence-correspondence", "全等與對應關係"),
    "five_criteria": ("j4-3-3", "j4-3-3-five-criteria-overview", "五種全等判定總覽"),
    "sss_sas": ("j4-3-3", "j4-3-3-sss-sas-core", "SSS 與 SAS 重點"),
    "asa_aas": ("j4-3-3", "j4-3-3-asa-aas-core", "ASA 與 AAS 重點"),
    "rhs_hl": ("j4-3-3", "j4-3-3-rhs-hl-right-triangle", "RHS(HL) 直角三角形判定"),
    "ssa_counter": ("j4-3-3", "j4-3-3-ssa-counterexample", "SSA 非全等反例"),
    "proof_structure": ("j4-3-3", "j4-3-3-proof-structure", "全等證明標準流程"),
    "cpctc": ("j4-3-3", "j4-3-3-cpctc-application", "全等後的對應推論（CPCTC）"),
    "regular_congruence": ("j4-3-3", "j4-3-3-regular-shape-congruence", "正圖形中的全等判定"),
    "folding_right": ("j4-3-3", "j4-3-3-folding-and-right-triangle", "摺疊與直角題型"),
    "area_perimeter": ("j4-3-3", "j4-3-3-area-perimeter-application", "周長與面積應用"),
    "criteria_strategy": ("j4-3-3", "j4-3-3-criteria-selection-strategy", "判定選擇策略"),
    "inequality": ("j4-3-4", "j4-3-4-triangle-inequality-basic", "三角形成立條件：兩邊和大於第三邊"),
    "third_side_range": ("j4-3-4", "j4-3-4-third-side-range", "第三邊範圍：兩邊差與兩邊和"),
    "abs_range": ("j4-3-4", "j4-3-4-abs-simplify-by-range", "利用範圍化簡絕對值"),
    "side_angle": ("j4-3-4", "j4-3-4-side-angle-monotonic", "大邊對大角，大角對大邊"),
    "coordinate_distance": ("j4-3-4", "j4-3-4-coordinate-distance-compare", "座標距離與邊角比較"),
    "hinge": ("j4-3-4", "j4-3-4-hinge-theorem-basic", "樞紐定理：夾角大，對邊長"),
    "hinge_converse": ("j4-3-4", "j4-3-4-hinge-theorem-converse", "樞紐定理逆敘：第三邊長，夾角大"),
    "special_30_60": ("j4-3-4", "j4-3-4-special-30-60-90", "特殊直角三角形：30-60-90"),
    "special_45": ("j4-3-4", "j4-3-4-special-45-45-90", "特殊直角三角形：45-45-90"),
    "special_right_area": ("j4-3-4", "j4-3-4-special-right-area", "特殊直角三角形與面積"),
    "fold_bisector": ("j4-3-4", "j4-3-4-fold-perpendicular-bisector", "摺疊與中垂線：等距判斷"),
    "angle_bisector_distance": ("j4-3-4", "j4-3-4-angle-bisector-distance", "角平分線與點到邊距離"),
    "reflection_shortest": ("j4-3-4", "j4-3-4-reflection-shortest-path", "反射最短路徑與三角形不等式"),
    "integrated": ("j4-3-4", "j4-3-4-integrated-strategy", "邊角關係綜合解題策略"),
}

CHAPTER_TITLES = {
    "j4-3-3": "三角形全等",
    "j4-3-4": "邊角關係",
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
    if has_any(compact, ["30°", "60°", "30-60", "30，60", "含30", "半個正三角形"]):
        return "special_30_60"
    if has_any(compact, ["45°", "45-45", "等腰直角", "直角等腰"]):
        return "special_45"
    if has_any(compact, ["斜邊", "直角邊", "HL", "RHS", "直角三角形全等"]):
        return "rhs_hl"
    if has_any(compact, ["SSA", "兩邊一角", "不能判定全等", "不一定全等"]):
        return "ssa_counter"
    if has_any(compact, ["SSS", "三邊", "邊邊邊", "SAS", "兩邊夾角", "邊角邊"]):
        return "sss_sas"
    if has_any(compact, ["ASA", "AAS", "兩角", "角邊角", "角角邊"]):
        return "asa_aas"
    if section == "證明" or has_any(compact, ["求證", "證明", "可證", "試證"]):
        if has_any(compact, ["對應", "全等後", "因此", "推出"]):
            return "cpctc"
        return "proof_structure"
    if has_any(compact, ["全等", "≅", "對應邊", "對應角"]):
        if has_any(compact, ["正方形", "正三角形", "正五邊形", "正多邊形"]):
            return "regular_congruence"
        if has_any(compact, ["判定", "何者", "選出", "條件"]):
            return "criteria_strategy"
        return "congruence_correspondence"
    if has_any(compact, ["摺", "摺疊", "翻折", "摺痕"]):
        if has_any(compact, ["中垂線", "垂直平分", "等距"]):
            return "fold_bisector"
        return "folding_right"
    if has_any(compact, ["角平分線", "到兩邊距離", "點到邊"]):
        return "angle_bisector_distance"
    if has_any(compact, ["最短", "反射", "路徑"]):
        return "reflection_shortest"
    if has_any(compact, ["三角形成立", "能構成三角形", "可作成三角形", "兩邊和", "兩邊差"]):
        return "inequality"
    if has_any(compact, ["第三邊", "範圍", "最長邊", "最短邊"]):
        return "third_side_range"
    if has_any(compact, ["絕對值", "|"]):
        return "abs_range"
    if has_any(compact, ["大邊", "大角", "小邊", "小角", "邊長大小", "角度大小", "對邊", "對角"]):
        return "side_angle"
    if has_any(compact, ["樞紐", "夾角較大", "夾角大", "第三邊較長"]):
        return "hinge_converse" if has_any(compact, ["第三邊", "邊長較長"]) else "hinge"
    if has_any(compact, ["座標", "距離", "坐標"]):
        return "coordinate_distance"
    if has_any(compact, ["周長", "面積", "斜線部分", "陰影", "等面積"]):
        return "area_perimeter"
    if has_any(compact, ["直角", "30", "45", "60", "高", "面積"]):
        return "special_right_area"
    if has_any(compact, ["作圖", "畫出", "尺規"]):
        return "criteria_strategy"
    return "integrated"


def score_for_role(row: Dict) -> Tuple[int, int, int]:
    section_score = {"證明": 6, "計算": 6, "題組": 5, "作圖": 5, "填充": 4, "選擇": 3, "是非": 1}.get(row["source_section"], 2)
    images = len(re.findall(r"\[圖:", row["raw_question_text"]))
    ideal = -abs(len(row["raw_question_text"]) - 160) // 70
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
        "J43",
        row["chapter_code"],
        "三角形基本性質",
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
        "title": f"J43 {row['source_section']}第{row['source_number']:02d}題",
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
