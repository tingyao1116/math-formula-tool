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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J12分數的運算困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j12-fraction-hard"
MARKDOWN_PATH = WORK_DIR / "j12-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"

SOURCE_REF = "J12分數的運算困難題題目答案卷.docx"
ID_PREFIX = "q-j12-fraction-hard"

OUT_QUESTIONS = OUT_DIR / "q-j12-fraction-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "q-j12-fraction-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j12-fraction-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


TOPICS = {
    "divisibility": {
        "chapter": "j1-2-1",
        "topic": "j1-2-1-divisibility-basic",
        "title": "2、3、5 的整除判別",
    },
    "prime_factor": {
        "chapter": "j1-2-1",
        "topic": "j1-2-1-prime-factorization",
        "title": "質因數分解與標準分解式",
    },
    "divisor_count": {
        "chapter": "j1-2-1",
        "topic": "j1-2-1-divisor-count-sum",
        "title": "正因數個數與總和",
    },
    "factor_application": {
        "chapter": "j1-2-1",
        "topic": "j1-2-1-factor-multiple-application",
        "title": "因數倍數應用題",
    },
    "gcd": {
        "chapter": "j1-2-2",
        "topic": "j1-2-2-gcd-coprime",
        "title": "公因數、最大公因數與互質",
    },
    "lcm": {
        "chapter": "j1-2-2",
        "topic": "j1-2-2-lcm-concept",
        "title": "公倍數與最小公倍數概念",
    },
    "gcd_lcm_application": {
        "chapter": "j1-2-2",
        "topic": "j1-2-2-gcd-application",
        "title": "最大公因數應用（切割、分組）",
    },
    "fraction_compare": {
        "chapter": "j1-2-3",
        "topic": "j1-2-3-common-denominator-compare",
        "title": "通分與分數比大小",
    },
    "fraction_add_sub": {
        "chapter": "j1-2-3",
        "topic": "j1-2-3-add-sub-fractions",
        "title": "分數加減法",
    },
    "fraction_mul_div": {
        "chapter": "j1-2-3",
        "topic": "j1-2-3-mul-div-fractions",
        "title": "分數乘除法",
    },
    "mixed_fraction": {
        "chapter": "j1-2-3",
        "topic": "j1-2-3-mixed-complex-fractions",
        "title": "帶分數與繁分數處理",
    },
    "fraction_application": {
        "chapter": "j1-2-3",
        "topic": "j1-2-3-fraction-application",
        "title": "分數應用題",
    },
}


BRANCHES = {
    "divisibility": [
        ("j1-2-1-divisibility-basic", "2、3、5 的整除判別"),
        ("j1-2-1-divisibility-advanced", "4、8、9、11 的整除判別"),
        ("divisibility-rules", "3、9、11 倍數判斷法"),
    ],
    "prime_factor": [
        ("j1-2-1-prime-composite", "質數、合數與 1 的判斷"),
        ("j1-2-1-prime-factorization", "質因數分解與標準分解式"),
    ],
    "divisor_count": [
        ("j1-2-1-divisor-count-sum", "正因數個數與總和"),
        ("j1-2-1-prime-factorization", "質因數分解與標準分解式"),
    ],
    "factor_application": [
        ("j1-2-1-factor-multiple-application", "因數倍數應用題"),
        ("factor-rectangle-equal-square-drill", "長方形裁成大小相同正方形最少幾塊"),
        ("factor-application-mixed-grouping-drill", "男女混合分組"),
    ],
    "gcd": [
        ("j1-2-2-gcd-coprime", "公因數、最大公因數與互質"),
        ("j1-2-2-gcd-methods", "最大公因數求法"),
    ],
    "lcm": [
        ("j1-2-2-lcm-concept", "公倍數與最小公倍數概念"),
        ("j1-2-2-lcm-methods-relation", "最小公倍數求法與 gcd 關係"),
    ],
    "gcd_lcm_application": [
        ("j1-2-2-gcd-application", "最大公因數應用（切割、分組）"),
        ("j1-2-2-lcm-application", "最小公倍數應用（同時發生、至少多少）"),
    ],
    "fraction_compare": [
        ("j1-2-3-simplify-expand", "擴分、約分與最簡分數"),
        ("j1-2-3-common-denominator-compare", "通分與分數比大小"),
    ],
    "fraction_add_sub": [
        ("j1-2-3-add-sub-fractions", "分數加減法"),
        ("j1-2-3-common-denominator-compare", "通分與分數比大小"),
    ],
    "fraction_mul_div": [
        ("j1-2-3-mul-div-fractions", "分數乘除法"),
        ("j1-2-3-simplify-expand", "擴分、約分與最簡分數"),
    ],
    "mixed_fraction": [
        ("j1-2-3-mixed-complex-fractions", "帶分數與繁分數處理"),
        ("j1-2-3-mul-div-fractions", "分數乘除法"),
    ],
    "fraction_application": [
        ("j1-2-3-fraction-application", "分數應用題"),
        ("j1-2-3-add-sub-fractions", "分數加減法"),
        ("j1-2-3-mul-div-fractions", "分數乘除法"),
    ],
}


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、題組": "題組",
    "四、計算": "計算",
    "五、是非": "是非",
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def run_pandoc(source: Path, markdown_path: Path, force: bool = False) -> None:
    if markdown_path.exists() and not force:
        return
    markdown_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "pandoc",
            str(source),
            "-t",
            "gfm",
            f"--extract-media={MEDIA_DIR}",
            "-o",
            str(markdown_path),
        ],
        cwd=ROOT,
        check=True,
    )


def strip_question_number(block: str) -> Tuple[int, str]:
    match = re.match(r"^(\d+)\.\s*(.*)$", block.strip(), flags=re.S)
    if not match:
        return 0, block.strip()
    return int(match.group(1)), match.group(2).strip()


def parse_markdown(markdown: str) -> List[Dict]:
    heading_re = re.compile(r"^\*\*(" + "|".join(re.escape(k) for k in SECTION_LABELS) + r")\*\*\s*$", re.M)
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

            question_text = j11_helpers.clean_markup(q_part)
            answer_text = j11_helpers.clean_markup(answer_part)
            explanation_text = j11_helpers.clean_markup(explain_part)
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
    if has_any(text, ["質數", "合數", "質因數", "標準分解"]):
        return "prime_factor"
    if has_any(text, ["正因數", "因數個數", "因數由小到大", "a_("]):
        return "divisor_count"
    if has_any(text, ["增加原來", "占", "促銷", "價格", "容量", "飲料", "面積增加", "百分"]):
        return "fraction_application"
    if has_any(text, ["公倍數", "最小公倍", "[", "同時", "週期", "每隔", "至少"]):
        if has_any(text, ["應用", "相遇", "同時", "每隔", "至少", "排成", "分段"]):
            return "gcd_lcm_application"
        return "lcm"
    if has_any(text, ["公因數", "最大公因", "互質", "(甲", "(A , B)", "(60", "切成", "正方體", "正方形"]):
        if has_any(text, ["箱子", "長方體", "正方體", "切", "剪", "分組", "隊伍"]):
            return "gcd_lcm_application"
        return "gcd"
    if has_any(text, ["倍數", "整除", "除以", "餘數", "因數"]) and not has_any(text, ["分數", "分母", "分子"]):
        return "divisibility"
    if has_any(text, ["分子", "分母", "最簡分數", "約分", "擴分", "通分", "化為最簡"]):
        return "fraction_compare"
    if has_any(text, ["帶分數", "繁分數", "連分數"]):
        return "mixed_fraction"
    if has_any(text, ["幾分之", "占", "剩下", "原有", "用了", "比", "甲", "乙"]) and has_any(text, ["多少", "幾", "比例"]):
        return "fraction_application"
    if has_any(text, ["÷", "倒數", "乘以", "相乘", "除以"]):
        return "fraction_mul_div"
    if has_any(text, ["＋", "－", "加", "減"]):
        return "fraction_add_sub"
    return "fraction_application"


def classify_branch(topic_key: str, question_text: str) -> Tuple[str, str]:
    branches = dict(BRANCHES[topic_key])
    text = question_text

    if topic_key == "divisibility":
        if has_any(text, ["9", "11"]):
            key = "divisibility-rules"
        elif has_any(text, ["4", "8"]):
            key = "j1-2-1-divisibility-advanced"
        else:
            key = "j1-2-1-divisibility-basic"
    elif topic_key == "factor_application":
        if has_any(text, ["長方形", "正方形", "長方體", "正方體"]):
            key = "factor-rectangle-equal-square-drill"
        elif has_any(text, ["分組", "男女"]):
            key = "factor-application-mixed-grouping-drill"
        else:
            key = "j1-2-1-factor-multiple-application"
    elif topic_key == "gcd_lcm_application":
        if has_any(text, ["同時", "每隔", "至少", "公倍"]):
            key = "j1-2-2-lcm-application"
        else:
            key = "j1-2-2-gcd-application"
    elif topic_key == "fraction_compare":
        if has_any(text, ["比大小", "大小", "大於", "小於", "通分"]):
            key = "j1-2-3-common-denominator-compare"
        else:
            key = "j1-2-3-simplify-expand"
    elif topic_key == "fraction_application":
        if "乘" in text or "倍" in text:
            key = "j1-2-3-mul-div-fractions"
        elif "加" in text or "減" in text or "剩" in text:
            key = "j1-2-3-add-sub-fractions"
        else:
            key = "j1-2-3-fraction-application"
    else:
        key = BRANCHES[topic_key][0][0]

    return key, branches.get(key, key)


def importance_score(row: Dict) -> Tuple[int, int, int]:
    text = row["raw_question_text"]
    section_weight = {"題組": 5, "計算": 5, "填充": 4, "選擇": 3, "是非": 2}.get(row["source_section"], 1)
    length_weight = min(len(text) // 80, 5)
    return (section_weight, length_weight, -int(row["source_order"]))


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
        row["role"] = "習題" if row["source_section"] in {"填充", "題組", "計算"} else "題庫"
        row["target_level"] = "chapter"
        row["target_id"] = row["chapter_code"]
        row["target_title"] = row["chapter_code"]


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["role"] in {"範例", "練習"}:
        return "中等" if row["source_section"] in {"選擇", "是非"} else "偏難"
    if row["source_section"] in {"題組", "計算"}:
        return "挑戰"
    return "偏難"


def make_question(row: Dict) -> Dict:
    qid = f"{ID_PREFIX}-{int(row['source_order']):03d}"
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
        "J12",
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
        "title": f"J12 {row['source_section']}第{int(row['source_number']):02d}題",
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
    q_payload = load_json(QUESTION_DB, "questions")
    q_rows = q_payload.get("questions", []) if isinstance(q_payload.get("questions"), list) else []
    q_created, q_updated = upsert(q_rows, questions)
    q_payload["questions"] = q_rows
    q_payload.setdefault("meta", {})
    q_payload["meta"]["count"] = len(q_rows)
    q_payload["meta"]["updatedAt"] = datetime.now().isoformat(timespec="seconds")
    q_payload["meta"]["lastImportSource"] = SOURCE_REF
    save_json(QUESTION_DB, q_payload)

    l_payload = load_json(LINK_DB, "links")
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
    section_counts = Counter(q["source_section"] for q in questions)
    target_counts = Counter((q["target_level"], q["target_id"], q["target_title"]) for q in questions)
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
                "習題": "剩餘題組、填充、計算題以章節代號收納。",
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
            {"target_level": level, "target_id": target_id, "target_title": title, "count": count}
            for (level, target_id, title), count in sorted(target_counts.items(), key=lambda item: (item[0][0], item[0][1]))
        ],
        "sample_questions": questions[:5],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert J12 fraction hard DOCX into question-bank import JSONL.")
    parser.add_argument("--source-docx", default=str(SOURCE_DOCX))
    parser.add_argument("--force-pandoc", action="store_true")
    parser.add_argument("--apply", action="store_true", help="Upsert generated questions and links into database JSON files.")
    args = parser.parse_args()

    source = Path(args.source_docx)
    if not source.exists():
        raise FileNotFoundError(source)

    run_pandoc(source, MARKDOWN_PATH, force=args.force_pandoc)
    extracted = parse_markdown(MARKDOWN_PATH.read_text(encoding="utf-8"))
    assign_roles(extracted)
    questions = [make_question(row) for row in extracted]
    links = [make_link(q) for q in questions]

    write_jsonl(OUT_QUESTIONS, questions)
    write_jsonl(OUT_LINKS, links)
    applied = apply_to_db(questions, links) if args.apply else {}
    preview = build_preview(questions, links, applied=applied)
    OUT_PREVIEW.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")

    if len({q["id"] for q in questions}) != len(questions):
        raise ValueError("Duplicate question IDs generated")
    if len({l["id"] for l in links}) != len(links):
        raise ValueError("Duplicate link IDs generated")

    print(json.dumps(preview["meta"], ensure_ascii=False, indent=2))
    print(json.dumps(preview["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
