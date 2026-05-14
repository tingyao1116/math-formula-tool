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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J25一元一次不等式困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j25-linear-inequality-hard"
MARKDOWN_PATH = WORK_DIR / "j25-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"

SOURCE_REF = "J25一元一次不等式困難題題目答案卷.docx"
ID_PREFIX = "q-j25-linear-inequality-hard"
OUT_QUESTIONS = OUT_DIR / "q-j25-linear-inequality-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j25-linear-inequality-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j25-linear-inequality-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


TOPICS = {
    "inequality_main": ("j2-4-1", "j2-4-1-inequality-main", "一元一次不等式基本型"),
    "symbol_language": ("j2-4-1", "j2-4-1-symbol-language", "不等號語意與敘述轉換"),
    "add_sub_property": ("j2-4-1", "j2-4-1-add-sub-property", "同加同減性質"),
    "mul_div_sign_flip": ("j2-4-1", "j2-4-1-mul-div-sign-flip", "同乘同除與翻號規則"),
    "transpose_collect": ("j2-4-1", "j2-4-1-transpose-collect", "移項與合併同類項"),
    "number_line_interval": ("j2-4-1", "j2-4-1-number-line-interval", "數線與區間表示"),
    "chain_inequality": ("j2-4-1", "j2-4-1-chain-inequality", "連鎖不等式解法"),
    "abs_inequality": ("j2-4-1", "j2-4-1-abs-inequality-basic", "絕對值不等式入門"),
    "word_to_inequality": ("j2-4-2", "j2-4-2-word-to-inequality", "文字題列不等式"),
    "budget_limit": ("j2-4-2", "j2-4-2-budget-limit", "預算與總價限制"),
    "distance_time": ("j2-4-2", "j2-4-2-distance-time", "速度時間距離限制"),
    "integer_filter": ("j2-4-2", "j2-4-2-integer-filter", "整數解篩選"),
    "condition_intersection": ("j2-4-2", "j2-4-2-condition-intersection", "多條件交集與範圍"),
    "answer_check": ("j2-4-2", "j2-4-2-answer-check", "答案檢核與情境合理性"),
}


BRANCHES = {
    key: [(chapter_topic[1], chapter_topic[2])] for key, chapter_topic in TOPICS.items()
}
BRANCHES["inequality_main"].extend(
    [
        ("j2-4-1-transpose-collect", "移項與合併同類項"),
        ("j2-4-1-number-line-interval", "數線與區間表示"),
    ]
)
BRANCHES["word_to_inequality"].extend(
    [
        ("j2-4-2-budget-limit", "預算與總價限制"),
        ("j2-4-2-integer-filter", "整數解篩選"),
    ]
)
BRANCHES["condition_intersection"].extend(
    [
        ("j2-4-1-chain-inequality", "連鎖不等式解法"),
        ("j2-4-2-answer-check", "答案檢核與情境合理性"),
    ]
)


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、應用": "應用",
    "四、題組": "題組",
    "五、作圖": "作圖",
    "六、計算": "計算",
    "七、是非": "是非",
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
    return text.replace(" ", "").replace("\n", "")


def looks_like_word_problem(text: str, section: str) -> bool:
    if section in {"應用", "題組"}:
        return True
    return has_any(
        text,
        [
            "元",
            "公斤",
            "公克",
            "公里",
            "公尺",
            "分鐘",
            "小時",
            "分數",
            "平均",
            "百貨",
            "計程車",
            "商品",
            "成本",
            "定價",
            "打折",
            "車資",
            "買",
            "票",
            "濃度",
            "食鹽水",
            "杯",
            "體積",
            "身高",
            "電梯",
            "測驗",
        ],
    )


def classify_topic(text: str, section: str) -> str:
    compact = compact_text(text)
    if has_any(compact, ["｜", "|", "絕對值"]):
        return "abs_inequality"
    if section == "作圖" or has_any(compact, ["數線", "圖示", "區間", "實心", "空心"]):
        return "number_line_interval"
    if has_any(compact, ["依題意可列出", "根據以上敘述", "可列出下列", "列出不等式"]):
        if looks_like_word_problem(compact, section):
            if has_any(compact, ["計程車", "元", "錢", "買", "售", "成本", "定價", "打折", "票", "車資", "商品", "預算", "付", "價"]):
                return "budget_limit"
            if has_any(compact, ["速率", "速度", "距離", "時間", "分鐘", "小時", "公里", "公尺", "步行", "騎"]):
                return "distance_time"
            if has_any(compact, ["整數", "最多", "至少", "最大", "最小", "個數", "可能是哪些", "幾個"]):
                return "integer_filter"
            if has_any(compact, ["不低於", "不高於", "範圍", "不超過", "未滿", "以上", "以下", "至少", "至多"]):
                return "condition_intersection"
            return "word_to_inequality"
        return "symbol_language"
    if has_any(compact, ["＜", "<", "≦", "≤", "≧", "≥"]) and (
        re.search(r"[＜<≦≤].*[＜<≦≤]", compact) or re.search(r"[＞>≧≥].*[＞>≧≥]", compact)
    ):
        if looks_like_word_problem(compact, section):
            return "condition_intersection"
        return "chain_inequality"
    if looks_like_word_problem(compact, section):
        if has_any(compact, ["計程車", "元", "錢", "買", "售", "成本", "定價", "打折", "票", "車資", "商品", "預算", "付", "價"]):
            return "budget_limit"
        if has_any(compact, ["速率", "速度", "距離", "時間", "分鐘", "小時", "公里", "公尺", "步行", "騎"]):
            return "distance_time"
        if has_any(compact, ["整數", "最多", "至少", "最大", "最小", "個數", "可能是哪些", "幾個"]):
            return "integer_filter"
        if has_any(compact, ["不低於", "不高於", "範圍", "不超過", "未滿", "以上", "以下", "至少", "至多"]):
            return "condition_intersection"
        return "word_to_inequality"
    if has_any(compact, ["填入正確的不等號", "不等號", "不小於", "不大於", "至少", "至多", "未滿", "超過", "以上", "以下"]):
        return "symbol_language"
    if has_any(compact, ["同乘", "同除", "負數", "翻號", "－x", "-x", "乘以(－", "除以(－"]):
        return "mul_div_sign_flip"
    if has_any(compact, ["同加", "同減", "扣掉", "加上", "減去", "天平", "磅秤", "比", "重"]):
        return "add_sub_property"
    if has_any(compact, ["兩邊都有", "移項", "合併", "化簡", "解不等式"]):
        return "transpose_collect"
    if has_any(compact, ["整數解", "整數", "最大解", "最小解", "有幾個"]):
        return "integer_filter"
    return "inequality_main"


def classify_branch(topic_key: str, text: str, section: str) -> Tuple[str, str]:
    branches = dict(BRANCHES[topic_key])
    compact = compact_text(text)
    if topic_key == "inequality_main":
        if has_any(compact, ["移項", "兩邊都有", "合併"]):
            key = "j2-4-1-transpose-collect"
        elif has_any(compact, ["數線", "解集", "範圍"]):
            key = "j2-4-1-number-line-interval"
        else:
            key = "j2-4-1-inequality-main"
    elif topic_key == "word_to_inequality":
        if has_any(compact, ["元", "買", "費", "票", "成本", "售", "預算"]):
            key = "j2-4-2-budget-limit"
        elif has_any(compact, ["整數", "最多", "至少", "最大", "最小"]):
            key = "j2-4-2-integer-filter"
        else:
            key = "j2-4-2-word-to-inequality"
    elif topic_key == "condition_intersection":
        if has_any(compact, ["＜", "<", "≤", "≦"]) and has_any(compact, ["＜", "<", "≤", "≦"]) and not looks_like_word_problem(compact, section):
            key = "j2-4-1-chain-inequality"
        elif has_any(compact, ["檢查", "是否", "足夠", "可能"]):
            key = "j2-4-2-answer-check"
        else:
            key = "j2-4-2-condition-intersection"
    else:
        key = BRANCHES[topic_key][0][0]
    return key, branches.get(key, key)


def importance_score(row: Dict) -> Tuple[int, int, int, int]:
    weight = {"計算": 6, "題組": 6, "應用": 5, "作圖": 5, "填充": 4, "選擇": 3, "是非": 2}.get(row["source_section"], 1)
    text = row["raw_question_text"]
    conceptual = int(has_any(text, ["列出", "範圍", "解", "最大", "最小", "數線", "至少", "不超過", "不低於"]))
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
        row["role"] = "習題" if row["source_section"] in {"填充", "應用", "題組", "作圖", "計算"} else "題庫"
        row.update({"target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})

    exercise_count = sum(1 for row in rows if row["role"] == "習題")
    if exercise_count < 8:
        candidates = [
            row
            for row in rows
            if row["source_section"] in {"填充", "應用", "題組", "作圖", "計算"} and row["role"] in {"範例", "練習"}
        ]
        candidates.sort(key=importance_score)
        for row in candidates[: 8 - exercise_count]:
            row.update({"role": "習題", "target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["role"] in {"範例", "練習"}:
        return "中等" if row["source_section"] in {"選擇", "是非"} else "偏難"
    return "挑戰" if row["source_section"] in {"應用", "題組", "作圖", "計算"} else "偏難"


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
        "J25",
        row["chapter_code"],
        "一元一次不等式",
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
        "title": f"J25 {row['source_section']}第{int(row['source_number']):02d}題",
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
            "role_policy": {
                "範例": "每個主題優先挑 3-5 題中等示範題；每個分支再挑 2 題。",
                "練習": "每個分支挑 3 題中等或偏難練習。",
                "習題": "剩餘填充、應用、題組、作圖、計算題以章節代號收納。",
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
    parser = argparse.ArgumentParser(description="Convert J25 linear inequality hard DOCX into question-bank import JSONL.")
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
