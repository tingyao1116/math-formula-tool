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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J63統計與機率困難題題目答案卷.docx")
WORK_DIR = ROOT / "exports" / "j63-statistics-probability-hard"
MEDIA_DIR = WORK_DIR / "media"
MARKDOWN_PATH = WORK_DIR / "j63-pandoc.md"
OUT_DIR = ROOT / "program-db" / "imports"

SOURCE_REF = "J63統計與機率困難題題目答案卷.docx"
ID_PREFIX = "q-j63-statistics-probability-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j63-statistics-probability-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j63-statistics-probability-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j63-statistics-probability-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、題組": "題組",
    "四、計算": "計算",
    "五、是非": "是非",
}

TOPICS = {
    "data_type": ("j6-3-1", "j6-3-1-data-type-and-scope", "資料型態與統計範圍"),
    "frequency_table": ("j6-3-1", "j6-3-1-tally-and-frequency-table", "畫記表與次數分配表"),
    "relative_frequency": ("j6-3-1", "j6-3-1-relative-frequency-percent", "相對次數與百分率"),
    "chart_reading": ("j6-3-1", "j6-3-1-bar-line-and-pie-chart", "長條圖、折線圖與圓形圖判讀"),
    "mean_basic": ("j6-3-1", "j6-3-1-mean-calculation-basic", "平均數計算（未分組）"),
    "mean_frequency": ("j6-3-1", "j6-3-1-mean-with-frequency", "有次數資料的平均數"),
    "median_mode": ("j6-3-1", "j6-3-1-median-and-mode", "中位數與眾數"),
    "range_summary": ("j6-3-1", "j6-3-1-range-and-summary-strategy", "全距與代表值綜合判斷"),
    "grouped_table": ("j6-3-2", "j6-3-2-grouped-frequency-table", "組距、組界與次數分配表"),
    "cumulative": ("j6-3-2", "j6-3-2-cumulative-frequency", "累積次數與累積相對次數"),
    "histogram": ("j6-3-2", "j6-3-2-histogram-and-shape", "直方圖判讀與分布形狀"),
    "quartiles": ("j6-3-2", "j6-3-2-quartiles-and-boxplot", "四分位數與盒狀圖"),
    "outlier": ("j6-3-2", "j6-3-2-outlier-rule", "離群值判斷（1.5IQR 規則）"),
    "robustness": ("j6-3-2", "j6-3-2-mean-median-robustness", "平均數與中位數的抗極端值比較"),
    "combined_mean": ("j6-3-2", "j6-3-2-combined-mean", "合併平均與分組加權"),
    "scatter": ("j6-3-2", "j6-3-2-scatter-trend-correlation", "散佈圖趨勢與相關判讀"),
    "time_series": ("j6-3-2", "j6-3-2-time-series-trend", "時間序列圖的趨勢與波動"),
    "percentile": ("j6-3-2", "j6-3-2-percentile-and-ranking", "百分位與排名判讀"),
    "misleading": ("j6-3-2", "j6-3-2-graph-misleading-check", "圖表誤導與尺度陷阱"),
    "comparison": ("j6-3-2", "j6-3-2-summary-comparison-strategy", "兩組資料比較的完整策略"),
    "sample_space": ("j6-3-3", "j6-3-3-sample-space-and-event", "樣本空間與事件"),
    "probability_definition": ("j6-3-3", "j6-3-3-probability-definition", "機率定義與基本範圍"),
    "complement": ("j6-3-3", "j6-3-3-complement-rule", "補事件與至少一個"),
    "addition": ("j6-3-3", "j6-3-3-addition-rule", "加法公式與互斥事件"),
    "multiplication": ("j6-3-3", "j6-3-3-multiplication-rule", "乘法公式與獨立事件"),
    "counting_tree": ("j6-3-3", "j6-3-3-counting-with-tree", "樹狀圖與計數法"),
    "replacement": ("j6-3-3", "j6-3-3-replacement-vs-no-replacement", "放回與不放回抽樣"),
    "expectation": ("j6-3-3", "j6-3-3-fair-game-expectation", "簡單期望值與公平遊戲"),
    "conditional": ("j6-3-3", "j6-3-3-conditional-probability-intro", "條件機率入門"),
    "probability_checklist": ("j6-3-3", "j6-3-3-common-traps-and-checklist", "機率常見陷阱與檢核流程"),
}

CHAPTER_TITLES = {
    "j6-3-1": "統計圖表",
    "j6-3-2": "資料的分析",
    "j6-3-3": "機率",
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


def is_probability(text: str) -> bool:
    return has_any(
        text,
        ["機率", "骰", "撲克牌", "抽", "籤", "硬幣", "公正", "樣本空間", "事件", "可能發生", "不可能", "必然", "球", "牌", "勝"],
    )


def classify_topic(row: Dict) -> str:
    section = row["source_section"]
    compact = compact_text(row["raw_question_text"] + "\n" + row.get("answer_text", "") + "\n" + row.get("explanation_text", ""))

    if is_probability(compact):
        if has_any(compact, ["條件機率", "已知", "在已", "若已"]):
            return "conditional"
        if has_any(compact, ["放回", "不放回"]):
            return "replacement"
        if has_any(compact, ["至少", "至多", "補事件", "都不是", "沒有"]):
            return "complement"
        if has_any(compact, ["或", "互斥", "聯集", "黑桃或", "紅心或"]):
            return "addition"
        if has_any(compact, ["期望", "公平", "獎金", "得分", "賭", "淨利"]):
            return "expectation"
        if has_any(compact, ["樹狀圖", "路線", "捷徑", "所有情形", "幾種", "排列", "組合"]):
            return "counting_tree"
        if has_any(compact, ["兩球皆", "都", "連續", "同時", "各自", "乘積", "獨立"]):
            return "multiplication"
        if has_any(compact, ["不可能", "必然", "0", "1", "範圍"]):
            return "probability_definition"
        return "sample_space"

    if has_any(compact, ["累積次數", "累積相對次數", "低於", "高於", "累積"]):
        return "cumulative"
    if has_any(compact, ["四分位", "盒狀", "Q1", "Q3", "四分位距"]):
        return "quartiles"
    if has_any(compact, ["離群", "1.5IQR", "極端值"]):
        return "outlier"
    if has_any(compact, ["百分位", "PR", "排名"]):
        return "percentile"
    if has_any(compact, ["散佈圖", "相關", "正相關", "負相關"]):
        return "scatter"
    if has_any(compact, ["每月", "逐年", "年份", "趨勢", "增加速度", "折線圖"]) and not has_any(compact, ["次數分配折線圖"]):
        return "time_series"
    if has_any(compact, ["誤導", "尺度", "縱軸", "橫軸", "是否可以看出"]):
        return "misleading"
    if has_any(compact, ["直方圖"]):
        return "histogram"
    if has_any(compact, ["組距", "組界", "組中點", "次數分配表", "分配表", "次數分配折線圖"]):
        if has_any(compact, ["平均", "中位數", "眾數"]):
            return "mean_frequency"
        return "grouped_table"
    if has_any(compact, ["相對次數", "百分比", "百分率", "%"]):
        return "relative_frequency"
    if has_any(compact, ["長條圖", "圓形圖", "折線圖", "統計圖", "圖表", "附圖"]):
        return "chart_reading"
    if has_any(compact, ["合併平均", "兩班", "甲班", "乙班", "第一名至", "加權", "全校"]):
        return "combined_mean"
    if has_any(compact, ["極端值", "登記錯誤", "每人加", "每人都", "平移", "縮放"]):
        return "robustness"
    if has_any(compact, ["平均數", "算術平均數", "總分", "平均分數"]):
        return "mean_basic"
    if has_any(compact, ["中位數", "眾數"]):
        return "median_mode"
    if has_any(compact, ["全距", "最高", "最低", "代表值", "比較"]):
        return "range_summary"
    if has_any(compact, ["資料型態", "母體", "樣本", "統計範圍"]):
        return "data_type"
    if section == "題組":
        return "chart_reading"
    return "comparison"


def score_for_role(row: Dict) -> Tuple[int, int, int]:
    section_score = {"計算": 7, "題組": 6, "填充": 5, "選擇": 3, "是非": 1}.get(row["source_section"], 2)
    images = len(re.findall(r"\[圖:", row["raw_question_text"]))
    length_penalty = -abs(len(row["raw_question_text"]) - 220) // 110
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
    if row["role"] == "練習" or row["source_section"] in {"計算", "題組"}:
        return "偏難"
    return "中等"


def make_question(row: Dict, seq: int) -> Dict:
    qid = f"{ID_PREFIX}-{seq:03d}"
    role_tag = {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[row["role"]]
    target_tag = "chapter" if row["target_level"] == "chapter" else "branch"
    return {
        "id": qid,
        "title": f"J63 {row['source_section']}第{row['source_number']:02d}題",
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
            "J63",
            row["chapter_code"],
            "統計與機率",
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
            "習題": "剩餘填充、題組、計算題放回章節代號。",
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
