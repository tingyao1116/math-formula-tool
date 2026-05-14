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
SOURCE_DOCX = Path(r"C:\張快數學\張快數學總整理\a考古題整理\康軒題庫困難題\J32平方根與畢氏定理困難題題目答案卷.docx")
OUT_DIR = ROOT / "program-db" / "imports"
WORK_DIR = ROOT / "exports" / "j32-square-root-pythagorean-hard"
MARKDOWN_PATH = WORK_DIR / "j32-pandoc.md"
MEDIA_DIR = WORK_DIR / "media"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
LINK_DB = ROOT / "program-db" / "database" / "topic-question-link-db.json"

SOURCE_REF = "J32平方根與畢氏定理困難題題目答案卷.docx"
ID_PREFIX = "q-j32-square-root-pythagorean-hard"
OUT_QUESTIONS = OUT_DIR / "question" / "q-j32-square-root-pythagorean-hard.questions.jsonl"
OUT_LINKS = OUT_DIR / "link" / "q-j32-square-root-pythagorean-hard.links.jsonl"
OUT_PREVIEW = OUT_DIR / "q-j32-square-root-pythagorean-hard.preview.json"

J11_SCRIPT = ROOT / "scripts" / "import_j11_integer_hard_from_docx.py"
spec = importlib.util.spec_from_file_location("j11_import_helpers", J11_SCRIPT)
j11_helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(j11_helpers)


TOPICS = {
    "root_definition": ("j3-2-1", "j3-2-1-square-root-definition", "平方根與正平方根"),
    "root_existence": ("j3-2-1", "j3-2-1-root-existence", "平方根存在條件"),
    "prime_factor_root": ("j3-2-1", "j3-2-1-prime-factor-root", "質因數分解求平方根"),
    "fractional_root": ("j3-2-1", "j3-2-1-fractional-root", "分數與小數的平方根"),
    "absolute_root": ("j3-2-1", "j3-2-1-absolute-root", "絕對值與根號"),
    "approximation": ("j3-2-1", "j3-2-1-approximation", "平方根近似值與區間"),
    "simplest_radical": ("j3-2-2", "j3-2-2-simplest-radical", "最簡根式判斷"),
    "like_radicals": ("j3-2-2", "j3-2-2-like-radicals", "同類根式加減"),
    "radical_mul_div": ("j3-2-2", "j3-2-2-radical-mul-div", "根式乘除運算"),
    "rationalization": ("j3-2-2", "j3-2-2-rationalization", "分母有理化"),
    "cube_root": ("j3-2-2", "j3-2-2-cube-root-basics", "立方根與最簡立方根式"),
    "pythagorean_main": ("j3-2-3", "j3-2-3-pythagorean-main", "畢氏定理核心"),
    "find_hypotenuse": ("j3-2-3", "j3-2-3-find-hypotenuse", "已知兩股求斜邊"),
    "find_leg": ("j3-2-3", "j3-2-3-find-leg", "已知斜邊求股長"),
    "right_triangle_check": ("j3-2-3", "j3-2-3-right-triangle-check", "三邊是否為直角三角形"),
    "area_square_model": ("j3-2-3", "j3-2-3-area-square-model", "正方形面積模型"),
    "height_application": ("j3-2-3", "j3-2-3-height-application", "斜邊高與綜合應用"),
    "spatial_pythagorean": ("j3-2-3", "spatial-pythagorean-guest", "空間中的畢氏定理"),
}


BRANCHES = {
    "root_definition": [("j3-2-1-square-root-definition", "平方根與正平方根"), ("principal-square-root-and-symbol", "主平方根與根號符號")],
    "root_existence": [("j3-2-1-root-existence", "平方根存在條件"), ("perfect-square-and-square-root", "平方數與平方根")],
    "prime_factor_root": [("j3-2-1-prime-factor-root", "質因數分解求平方根")],
    "fractional_root": [("j3-2-1-fractional-root", "分數與小數的平方根")],
    "absolute_root": [("j3-2-1-absolute-root", "絕對值與根號")],
    "approximation": [("j3-2-1-approximation", "平方根近似值與區間"), ("square-root-estimation", "平方根估值")],
    "simplest_radical": [("j3-2-2-simplest-radical", "最簡根式判斷"), ("simplest-radical-form-junior", "最簡根式")],
    "like_radicals": [("j3-2-2-like-radicals", "同類根式加減"), ("radical-add-subtract-like-terms", "加減不可拆")],
    "radical_mul_div": [("j3-2-2-radical-mul-div", "根式乘除運算"), ("radical-mul-div-split-rule", "乘除可拆")],
    "rationalization": [("j3-2-2-rationalization", "分母有理化"), ("rationalize-denominator-monomial-junior", "單項有理化分母"), ("rationalize-denominator-binomial-junior", "多項有理化分母")],
    "cube_root": [("j3-2-2-cube-root-basics", "立方根與最簡立方根式")],
    "pythagorean_main": [("j3-2-3-pythagorean-main", "畢氏定理核心"), ("pythagorean", "畢氏定理")],
    "find_hypotenuse": [("j3-2-3-find-hypotenuse", "已知兩股求斜邊"), ("pythagorean-triples-345", "畢氏數 3:4:5")],
    "find_leg": [("j3-2-3-find-leg", "已知斜邊求股長"), ("pythagorean-scaling-similarity", "畢氏定理中的放大縮小")],
    "right_triangle_check": [("j3-2-3-right-triangle-check", "三邊是否為直角三角形"), ("pythagorean-converse", "畢氏定理逆定理")],
    "area_square_model": [("j3-2-3-area-square-model", "正方形面積模型"), ("right-triangle-altitude-to-hypotenuse", "直角三角形斜邊上的高")],
    "height_application": [("j3-2-3-height-application", "斜邊高與綜合應用"), ("special-right-triangles-45-30", "特殊直角三角形")],
    "spatial_pythagorean": [("spatial-pythagorean-guest", "空間中的畢氏定理"), ("bee-fly-ant-crawl-pythagorean", "蜜蜂飛與螞蟻爬")],
}


SECTION_LABELS = {
    "一、選擇": "選擇",
    "二、填充": "填充",
    "三、計算": "計算",
    "四、是非": "是非",
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


def strip_answer_marker(text: str) -> str:
    return re.sub(r"^\s*[（(]\s*\n?\s*[）)](?!\^)\s*", "", text or "").strip()


def clean_question_text(text: str, section: str) -> str:
    cleaned = j11_helpers.clean_markup(text)
    if section in {"選擇", "是非"}:
        cleaned = strip_answer_marker(cleaned)
    return cleaned


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
            question_text = clean_question_text(q_part, section_label)
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
    return re.sub(r"\s+", "", text or "")


def classify_topic(text: str, section: str) -> str:
    compact = compact_text(text)
    if has_any(compact, ["長方體", "正立方體", "水族箱", "空間", "表面", "矩形ACFE", "A、E兩點"]):
        return "spatial_pythagorean"
    if has_any(compact, ["梯子", "東南", "西南", "最短距離", "摺疊", "折疊", "斜邊上的高", "隔板"]):
        return "height_application"
    if has_any(compact, ["正方形面積", "面積模型", "以、為邊長之正方形", "鋪色", "拼成", "正方形DEFG"]):
        return "area_square_model"
    if has_any(compact, ["三邊", "直角三角形", "畢氏定理逆", "是否為直角", "可利用畢氏定理"]) and not has_any(compact, ["求", "長", "面積"]):
        return "right_triangle_check"
    if has_any(compact, ["斜邊長", "斜邊", "對角線", "最長", "距離", "邊長幾公分"]):
        return "find_hypotenuse"
    if has_any(compact, ["一股", "股長", "高度", "上移", "求圖中x", "求x之值"]):
        return "find_leg"
    if has_any(compact, ["畢氏", "直角三角形", "等腰直角", "30平方公分", "45", "60", "方格紙", "坐標"]):
        return "pythagorean_main"
    if has_any(compact, ["有理化", "分母", "x＝", "平方差"]):
        return "rationalization"
    if has_any(compact, ["立方根", "最簡立方根"]):
        return "cube_root"
    if has_any(compact, ["化簡", "最簡根式", "可得一整數", "為整數", "根式"]) and has_any(compact, ["×", "÷", "乘", "除"]):
        return "radical_mul_div"
    if has_any(compact, ["加減運算", "同類", "＋＋", "方根的加減", "相加", "相減"]):
        return "like_radicals"
    if has_any(compact, ["化簡", "最簡根式", "計算", "方根的運算"]):
        return "simplest_radical"
    if has_any(compact, ["整數部分", "小數部分", "近似值", "十分逼近", "比較", "大小關係", "數線", "大於1", "介於", "＜x＜"]):
        return "approximation"
    if has_any(compact, ["｜", "|", "a＜0", "b＜0", "絕對值"]):
        return "absolute_root"
    if has_any(compact, ["分數", "小數", "0.2", "π", "3.1416"]):
        return "fractional_root"
    if has_any(compact, ["質因數", "最小正整數", "互質", "平方根為整數", "完全平方數", "正整數"]):
        return "prime_factor_root"
    if has_any(compact, ["沒有平方根", "任意數", "所有正數", "平方根都", "存在"]):
        return "root_existence"
    if has_any(compact, ["平方根", "正平方根", "主平方根", "根號符號"]):
        return "root_definition"
    return "pythagorean_main" if section in {"填充", "計算"} else "root_definition"


def classify_branch(topic_key: str, text: str, section: str) -> Tuple[str, str]:
    branches = dict(BRANCHES[topic_key])
    compact = compact_text(text)
    if topic_key == "root_definition":
        key = "principal-square-root-and-symbol" if has_any(compact, ["正平方根", "根號", "√"]) else "j3-2-1-square-root-definition"
    elif topic_key == "root_existence":
        key = "perfect-square-and-square-root" if has_any(compact, ["平方數", "完全平方"]) else "j3-2-1-root-existence"
    elif topic_key == "approximation":
        key = "square-root-estimation" if has_any(compact, ["近似", "十分逼近", "整數部分", "小數部分"]) else "j3-2-1-approximation"
    elif topic_key == "simplest_radical":
        key = "simplest-radical-form-junior" if has_any(compact, ["最簡"]) else "j3-2-2-simplest-radical"
    elif topic_key == "like_radicals":
        key = "radical-add-subtract-like-terms" if has_any(compact, ["加減", "同類"]) else "j3-2-2-like-radicals"
    elif topic_key == "radical_mul_div":
        key = "radical-mul-div-split-rule" if has_any(compact, ["乘", "除", "×", "÷"]) else "j3-2-2-radical-mul-div"
    elif topic_key == "rationalization":
        key = "rationalize-denominator-binomial-junior" if has_any(compact, ["＋", "－", "平方差"]) else "j3-2-2-rationalization"
    elif topic_key == "find_hypotenuse":
        key = "pythagorean-triples-345" if has_any(compact, ["3", "4", "5", "5公尺", "連續三偶數"]) else "j3-2-3-find-hypotenuse"
    elif topic_key == "find_leg":
        key = "pythagorean-scaling-similarity" if has_any(compact, ["比例", "放大", "縮小"]) else "j3-2-3-find-leg"
    elif topic_key == "right_triangle_check":
        key = "pythagorean-converse" if has_any(compact, ["逆", "判斷", "是否"]) else "j3-2-3-right-triangle-check"
    elif topic_key == "area_square_model":
        key = "right-triangle-altitude-to-hypotenuse" if has_any(compact, ["高", "斜邊"]) else "j3-2-3-area-square-model"
    elif topic_key == "height_application":
        key = "special-right-triangles-45-30" if has_any(compact, ["等腰直角", "30", "60", "45"]) else "j3-2-3-height-application"
    elif topic_key == "spatial_pythagorean":
        key = "bee-fly-ant-crawl-pythagorean" if has_any(compact, ["表面", "爬", "最短"]) else "spatial-pythagorean-guest"
    else:
        key = BRANCHES[topic_key][0][0]
    return key, branches.get(key, key)


def importance_score(row: Dict) -> Tuple[int, int, int, int]:
    weight = {"計算": 6, "填充": 5, "選擇": 3, "是非": 2}.get(row["source_section"], 1)
    text = row["raw_question_text"]
    conceptual = int(has_any(text, ["求", "比較", "化簡", "說明", "畢氏", "平方根", "近似", "圖"]))
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
        row["role"] = "習題" if row["source_section"] in {"填充", "計算"} else "題庫"
        row.update({"target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})

    exercise_count = sum(1 for row in rows if row["role"] == "習題")
    if exercise_count < 8:
        candidates = [
            row
            for row in rows
            if row["source_section"] in {"填充", "計算"} and row["role"] in {"範例", "練習"}
        ]
        candidates.sort(key=importance_score)
        for row in candidates[: 8 - exercise_count]:
            row.update({"role": "習題", "target_level": "chapter", "target_id": row["chapter_code"], "target_title": row["chapter_code"]})


def role_slug(role: str) -> str:
    return {"範例": "example", "練習": "practice", "習題": "exercise", "題庫": "bank"}[role]


def difficulty_for(row: Dict) -> str:
    if row["role"] in {"範例", "練習"}:
        return "中等" if row["source_section"] in {"選擇", "是非"} else "偏難"
    return "挑戰" if row["source_section"] == "計算" else "偏難"


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
        "J32",
        row["chapter_code"],
        "平方根與畢氏定理",
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
        "title": f"J32 {row['source_section']}第{int(row['source_number']):02d}題",
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
        "tags": [],
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
            "answer_marker_policy": "選擇題與是非題題幹開頭的（ ）作答括號已移除。",
            "role_policy": {
                "範例": "每個主題優先挑 3-5 題中等示範題；每個分支再挑 2 題。",
                "練習": "每個分支挑 3 題中等或偏難練習。",
                "習題": "剩餘填充、計算題以章節代號收納。",
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
    parser = argparse.ArgumentParser(description="Convert J32 square root and Pythagorean hard DOCX into question-bank import JSONL.")
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
    bad_markers = [
        q["id"]
        for q in questions
        if q["source_section"] in {"選擇", "是非"} and re.match(r"^\s*[（(]\s*\n?\s*[）)](?!\^)", q["question_text"])
    ]
    if bad_markers:
        raise ValueError(f"Answer markers were not stripped: {bad_markers[:5]}")
    print(json.dumps(preview["meta"], ensure_ascii=False, indent=2))
    print(json.dumps(preview["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
