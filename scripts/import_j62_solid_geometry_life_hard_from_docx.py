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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J62生活中的立體圖形困難題題目答案卷.docx")
WORK_DIR = ROOT / "exports" / "j62-solid-geometry-life-hard"
MEDIA_DIR = WORK_DIR / "media"
MARKDOWN_PATH = WORK_DIR / "j62-pandoc.md"
OUT_DIR = ROOT / "program-db" / "imports"

SOURCE_REF = "J62生活中的立體圖形困難題題目答案卷.docx"
ID_PREFIX = "q-j62-solid-geometry-life-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j62-solid-geometry-life-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j62-solid-geometry-life-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j62-solid-geometry-life-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、作圖": "作圖",
    "四、計算": "計算",
    "五、是非": "是非",
}

CHAPTER_CODE = "j6-2"
CHAPTER_TITLE = "立體圖形"

BRANCH_TITLES = {
    "net_folding": "展開圖與折合判斷",
    "volume_surface": "柱體、錐體體積與表面積",
    "sphere_section": "球、截面與空間距離",
    "rotation_solid": "旋轉體與掃掠體積",
    "shortest_path": "立體表面展開最短路徑",
    "view_drawing": "三視圖、作圖與空間判讀",
    "polyhedron_count": "多面體頂點邊面與角度",
    "composite": "生活立體圖形綜合應用",
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


def classify_branch(row: Dict) -> str:
    section = row["source_section"]
    compact = compact_text(row["raw_question_text"] + "\n" + row.get("answer_text", "") + "\n" + row.get("explanation_text", ""))
    if section == "作圖" or has_any(compact, ["三視圖", "俯視圖", "前視圖", "右視圖", "左視圖", "繪出", "試繪", "作圖"]):
        return "view_drawing"
    if has_any(compact, ["展開圖", "合成", "折合", "重合", "對應的點", "對應的邊", "圓錐體之展開圖"]):
        return "net_folding"
    if has_any(compact, ["最短距離", "最短路徑", "繞圓錐一圈", "表面", "展開後"]):
        return "shortest_path"
    if has_any(compact, ["旋轉一圈", "掃過", "繞旗桿", "旋轉體"]):
        return "rotation_solid"
    if has_any(compact, ["球", "截圓", "截面", "球心", "半徑為", "牆角", "彈珠", "兩球", "圓心距離"]):
        return "sphere_section"
    if has_any(compact, ["幾角錐", "頂點", "邊數", "面數", "稜", "歐拉", "正立方體", "長方體", "角度"]):
        return "polyhedron_count"
    if has_any(compact, ["體積", "表面積", "側面積", "圓柱", "圓錐", "柱體", "錐體", "四角錐", "平臺", "底面積", "高為", "立方公分"]):
        return "volume_surface"
    return "composite"


def score_for_role(row: Dict) -> Tuple[int, int, int]:
    section_score = {"計算": 7, "作圖": 6, "填充": 5, "選擇": 3, "是非": 1}.get(row["source_section"], 2)
    images = len(re.findall(r"\[圖:", row["raw_question_text"]))
    length_penalty = -abs(len(row["raw_question_text"]) - 180) // 90
    return (section_score + length_penalty - min(images, 3), -images, -row["source_order"])


def assign_roles(rows: List[Dict]) -> None:
    for row in rows:
        branch = classify_branch(row)
        row.update(
            {
                "chapter_code": CHAPTER_CODE,
                "branch_key": branch,
                "branch_title": BRANCH_TITLES[branch],
                "role": "",
                "target_level": "",
                "target_id": "",
                "target_title": "",
            }
        )

    for row in sorted(rows, key=score_for_role, reverse=True)[:5]:
        row.update({"role": "範例", "target_level": "chapter", "target_id": CHAPTER_CODE, "target_title": CHAPTER_TITLE})

    by_branch: Dict[str, List[Dict]] = defaultdict(list)
    for row in rows:
        by_branch[row["branch_key"]].append(row)

    for _branch, items in by_branch.items():
        available = [row for row in sorted(items, key=score_for_role, reverse=True) if not row["role"]]
        for row in available[:2]:
            row.update({"role": "範例", "target_level": "chapter", "target_id": CHAPTER_CODE, "target_title": CHAPTER_TITLE})
        available = [row for row in sorted(items, key=score_for_role, reverse=True) if not row["role"]]
        for row in available[:3]:
            row.update({"role": "練習", "target_level": "chapter", "target_id": CHAPTER_CODE, "target_title": CHAPTER_TITLE})

    for row in rows:
        if not row["role"]:
            row["role"] = "題庫" if row["source_section"] in {"選擇", "是非"} else "習題"
            row["target_level"] = "chapter"
            row["target_id"] = CHAPTER_CODE
            row["target_title"] = CHAPTER_TITLE


def difficulty_for(row: Dict) -> str:
    if row["role"] == "練習" or row["source_section"] in {"計算", "作圖"}:
        return "偏難"
    return "中等"


def make_question(row: Dict, seq: int) -> Dict:
    qid = f"{ID_PREFIX}-{seq:03d}"
    role_tag = {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[row["role"]]
    return {
        "id": qid,
        "title": f"J62 {row['source_section']}第{row['source_number']:02d}題",
        "question_text": row["raw_question_text"],
        "answer_text": row["answer_text"].strip(),
        "explanation_text": row["explanation_text"].strip(),
        "stage": "國中",
        "grade": "國三",
        "chapter": CHAPTER_CODE,
        "chapter_code": CHAPTER_CODE,
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
        "source_branch": row["branch_key"],
        "source_branch_title": row["branch_title"],
        "tags": [
            "J62",
            CHAPTER_CODE,
            "立體圖形",
            f"role:{role_tag}",
            f"group:chapter-{role_tag}",
            f"source-section:{row['source_section']}",
            f"branch:{row['branch_title']}",
        ],
    }


def make_link(question: Dict, row: Dict) -> Dict:
    now = now_iso()
    return {
        "id": f"link-{question['id']}-{CHAPTER_CODE}",
        "title": f"{question['id']} -> {CHAPTER_CODE}",
        "question_id": question["id"],
        "question_title": question["title"],
        "topic_id": "",
        "chapter_code": CHAPTER_CODE,
        "link_level": "chapter",
        "source_type": "manual-docx-structured-pack",
        "source_ref": SOURCE_REF,
        "confidence": 0.82,
        "created_at": now,
        "updated_at": now,
        "tags": [row["role"], row["source_section"], row["branch_title"]],
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
        "by_branch": dict(Counter(q["source_branch"] for q in questions)),
        "by_target_level": dict(Counter(q["target_level"] for q in questions)),
        "answer_marker_policy": "選擇題與是非題題幹開頭的（ ）作答括號已移除。",
        "role_policy": {
            "範例": "章節保留 5 題示範題；內部分支再保留 2 題示範題。",
            "練習": "內部分支保留最多 3 題中等或偏難練習。",
            "習題": "剩餘填充、作圖、計算題放回章節代號。",
            "題庫": "剩餘選擇、是非題放回章節代號。",
        },
        "topic_note": "目前正式資料庫未建立 j6-2 的 topic/branch id，因此 links 皆為 chapter-level；題目另保留 source_branch/source_branch_title。",
        "samples": questions[:5],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force-pandoc", action="store_true")
    args = parser.parse_args()

    run_pandoc(force=args.force_pandoc)
    markdown = MARKDOWN_PATH.read_text(encoding="utf-8")
    rows = parse_markdown(markdown)
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
                "topic_note": "j6-2 目前無正式 topic id，連結以 chapter-level 輸出。",
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
                "by_branch": dict(Counter(q["source_branch"] for q in questions)),
                "by_target_level": dict(Counter(q["target_level"] for q in questions)),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
