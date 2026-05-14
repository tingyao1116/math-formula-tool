#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

from text_safety import file_has_replacement_char, run_utf8_command


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
BACKUP_DIR = ROOT / "backups"

SOURCE_MD = (
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三下2_統計一_整理\改國三下2_統計一_易讀版.md"
)
SOURCE_REF = "改國三下2_統計一_易讀版.md（重點整理匯入）"

CHAPTER_CODE = "j6-3-1"
CHAPTER_NAME = "統計（一）"

TOPIC_REQUIRED_FIELDS = [
    "id",
    "title",
    "formula",
    "stage",
    "grade",
    "chapter",
    "difficulty",
    "tags",
    "usage",
    "examples",
    "tips",
    "notes",
    "mistakes",
]

QUESTION_REQUIRED_FIELDS = [
    "id",
    "title",
    "question_text",
    "answer_text",
    "explanation_text",
    "stage",
    "grade",
    "chapter",
    "difficulty",
    "source_type",
    "source_ref",
    "tags",
]


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def backup_file(path: Path) -> str:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j6-3-1-{ts}{path.suffix}"
    shutil.copy2(path, backup_path)
    return str(backup_path)


def upsert_records(records: List[Dict], additions: List[Dict]) -> Tuple[List[Dict], int, int, int]:
    index = {str(item.get("id", "")).strip(): i for i, item in enumerate(records)}
    created = 0
    updated = 0
    skipped = 0
    for row in additions:
        rid = str(row.get("id", "")).strip()
        if not rid:
            skipped += 1
            continue
        if rid in index:
            records[index[rid]] = row
            updated += 1
        else:
            records.append(row)
            index[rid] = len(records) - 1
            created += 1
    return records, created, updated, skipped


def validate_unique_ids(rows: List[Dict]) -> Tuple[bool, List[str]]:
    seen = set()
    dups = []
    for row in rows:
        rid = str(row.get("id", "")).strip()
        if not rid:
            continue
        if rid in seen:
            dups.append(rid)
        seen.add(rid)
    return (len(dups) == 0, sorted(set(dups)))


def validate_required(rows: List[Dict], fields: List[str], target_ids: List[str]) -> List[Dict]:
    target = set(target_ids)
    issues = []
    for row in rows:
        rid = str(row.get("id", "")).strip()
        if rid not in target:
            continue
        missing = []
        for field in fields:
            value = row.get(field)
            if value is None:
                missing.append(field)
                continue
            if isinstance(value, str) and not value.strip():
                missing.append(field)
                continue
            if isinstance(value, list) and len(value) == 0:
                missing.append(field)
        if missing:
            issues.append({"id": rid, "missing": missing})
    return issues


def check_replacement_char(path: Path) -> bool:
    return file_has_replacement_char(path)


def run_cmd(cmd: List[str]) -> Tuple[int, str]:
    return run_utf8_command(cmd, cwd=ROOT)


def make_formula(lines: List[Tuple[str, str]]) -> Dict:
    return {
        "type": "labeled-lines",
        "lines": [{"label": label, "values": [value]} for label, value in lines],
    }


def topic_row(
    *,
    id_: str,
    title: str,
    chapter_role: str,
    difficulty: str,
    formula_lines: List[Tuple[str, str]],
    usage: List[str],
    examples: List[str],
    tips: List[str],
    notes: List[str],
    mistakes: List[str],
) -> Dict:
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "國中",
        "grade": "國三",
        "term": "國三下",
        "chapter": CHAPTER_NAME,
        "chapterCode": CHAPTER_CODE,
        "domain": "資料與不確定性",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", CHAPTER_CODE, CHAPTER_NAME, "統計"],
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes + [f"來源：{SOURCE_REF}"],
        "mistakes": mistakes,
        "contentTypes": ["教學核心", "重點公式", "題型策略", "易錯提醒"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": now_iso(),
    }


def question_row(
    *,
    id_: str,
    title: str,
    difficulty: str,
    question_text: str,
    answer_text: str,
    explanation_text: str,
    topic_id: str,
) -> Dict:
    return {
        "id": id_,
        "title": title,
        "question_text": question_text,
        "answer_text": answer_text,
        "explanation_text": explanation_text,
        "stage": "國中",
        "grade": "國三",
        "chapter": CHAPTER_NAME,
        "chapter_code": CHAPTER_CODE,
        "difficulty": difficulty,
        "source_type": "md_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", CHAPTER_CODE, CHAPTER_NAME, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    return [
        topic_row(
            id_="j6-3-1-data-type-and-scope",
            title="資料型態與統計範圍",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("類別資料", r"$\text{如：血型、科目偏好}$"),
                ("數值資料", r"$\text{如：身高、分數、時間}$"),
            ],
            usage=["先判斷資料型態，才能選對整理方式與圖表。"],
            examples=["班上最愛運動是類別資料，身高是數值資料。"],
            tips=["題目先看『要不要算平均』，可快速判斷是否為數值資料。"],
            notes=["統計第一步是定義資料範圍與樣本。"],
            mistakes=["把類別資料拿去直接算平均。"],
        ),
        topic_row(
            id_="j6-3-1-tally-and-frequency-table",
            title="畫記表與次數分配表",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("次數", r"$f_i$"),
                ("總次數", r"$N=\sum f_i$"),
            ],
            usage=["整理原始資料為可讀的統計表。"],
            examples=["將測驗分數分組後填入各組次數。"],
            tips=["先畫記再抄次數，能減少漏計與重算。"],
            notes=["次數分配表是後續畫圖與算平均的基礎。"],
            mistakes=["次數加總不等於樣本數仍未檢查。"],
        ),
        topic_row(
            id_="j6-3-1-relative-frequency-percent",
            title="相對次數與百分率",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[
                ("相對次數", r"$\frac{f_i}{N}$"),
                ("百分率", r"$\frac{f_i}{N}\times 100\%$"),
            ],
            usage=["比較不同班級或不同樣本規模的資料。"],
            examples=["某組 8 人、全體 40 人，百分率為 $20\\%$。"],
            tips=["百分率題最後要附上單位 $\\%$。"],
            notes=["相對次數總和應接近 1，百分率總和應接近 $100\\%$。"],
            mistakes=["把分母誤用成分組數而不是總人數。"],
        ),
        topic_row(
            id_="j6-3-1-bar-line-and-pie-chart",
            title="長條圖、折線圖與圓形圖判讀",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("圓心角", r"$\theta=\frac{\text{該類次數}}{N}\times 360^\circ$"),
                ("比例判讀", r"$\frac{a}{b}$"),
            ],
            usage=["從圖表快速讀出最大值、趨勢與比例。"],
            examples=["圓形圖某類角度 $72^\\circ$ 代表占 $20\\%$。"],
            tips=["看圓形圖先把角度換成百分率再比較。"],
            notes=["折線圖擅長看變化，長條圖擅長看量大小。"],
            mistakes=["把圓形圖角度直接當成人數。"],
        ),
        topic_row(
            id_="j6-3-1-mean-calculation-basic",
            title="平均數計算（未分組）",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("平均數", r"$\bar{x}=\frac{x_1+x_2+\cdots+x_n}{n}$"),
                ("總和", r"$\sum x_i$"),
            ],
            usage=["求整體代表值，常見於成績與時間資料。"],
            examples=["資料 $2,4,6$ 的平均為 $4$。"],
            tips=["先算總和再除以筆數，避免心算跳步錯誤。"],
            notes=["平均數會受極端值影響。"],
            mistakes=["除錯分母，誤用成最大值或最小值。"],
        ),
        topic_row(
            id_="j6-3-1-mean-with-frequency",
            title="有次數資料的平均數",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("加權平均", r"$\bar{x}=\frac{\sum (x_i f_i)}{\sum f_i}$"),
                ("總次數", r"$N=\sum f_i$"),
            ],
            usage=["題目給的是分數與人數表時使用。"],
            examples=["分數 $60,70$ 對應人數 $2,3$，平均為 $66$。"],
            tips=["先做 $x_if_i$ 欄，再一次加總最穩。"],
            notes=["本質是加權平均，權重就是次數。"],
            mistakes=["只把分數平均，忽略各分數人數不同。"],
        ),
        topic_row(
            id_="j6-3-1-median-and-mode",
            title="中位數與眾數",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("中位數位置", r"$\frac{n+1}{2}$（奇數筆）"),
                ("中間兩數平均", r"$\frac{x_{(n/2)}+x_{(n/2+1)}}{2}$（偶數筆）"),
            ],
            usage=["資料有極端值時，常用中位數輔助判讀。"],
            examples=["$1,2,2,9$ 的眾數為 $2$，中位數為 $2$。"],
            tips=["中位數前要先排序，這是最常漏掉的一步。"],
            notes=["眾數可不只一個，也可能不存在。"],
            mistakes=["未排序就直接取中間位置。"],
        ),
        topic_row(
            id_="j6-3-1-range-and-summary-strategy",
            title="全距與代表值綜合判斷",
            chapter_role="易錯陷阱",
            difficulty="中等",
            formula_lines=[
                ("全距", r"$R=x_{\max}-x_{\min}$"),
                ("比較指標", r"$\bar{x},\ \text{中位數},\ \text{眾數},\ R$"),
            ],
            usage=["比較兩組資料穩定性與集中趨勢。"],
            examples=["兩班平均相同時，可再比較全距判斷穩定度。"],
            tips=["平均看『中心』，全距看『分散』，不要混為一談。"],
            notes=["教學上建議同時報告至少兩種指標。"],
            mistakes=["只看平均就下結論，忽略分散程度。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j6-3-1-stat-001",
            title="資料型態判別（基礎01）",
            difficulty="基礎",
            question_text="下列何者屬於類別資料：身高、體重、血型？",
            answer_text="血型。",
            explanation_text="血型是分類標籤，不是可直接做四則運算的數值。",
            topic_id="j6-3-1-data-type-and-scope",
        ),
        question_row(
            id_="q-j6-3-1-stat-002",
            title="資料型態判別（基礎02）",
            difficulty="基礎",
            question_text="班上 5 次小考分數屬於哪一種資料？",
            answer_text="數值資料。",
            explanation_text="分數可比較大小並可計算平均。",
            topic_id="j6-3-1-data-type-and-scope",
        ),
        question_row(
            id_="q-j6-3-1-stat-003",
            title="次數表檢查（基礎01）",
            difficulty="基礎",
            question_text="若各組次數為 $3,5,4$，總次數 $N$ 為多少？",
            answer_text="$12$。",
            explanation_text="$N=3+5+4=12$。",
            topic_id="j6-3-1-tally-and-frequency-table",
        ),
        question_row(
            id_="q-j6-3-1-stat-004",
            title="次數表檢查（中等01）",
            difficulty="中等",
            question_text="樣本數為 30 人，已記錄次數為 $8,7,6$，最後一組次數是多少？",
            answer_text="$9$。",
            explanation_text="最後一組次數 $=30-(8+7+6)=9$。",
            topic_id="j6-3-1-tally-and-frequency-table",
        ),
        question_row(
            id_="q-j6-3-1-stat-005",
            title="相對次數（基礎01）",
            difficulty="基礎",
            question_text="某組次數為 6，總次數為 24，相對次數是多少？",
            answer_text="$\\frac{1}{4}$。",
            explanation_text="$\\frac{6}{24}=\\frac{1}{4}$。",
            topic_id="j6-3-1-relative-frequency-percent",
        ),
        question_row(
            id_="q-j6-3-1-stat-006",
            title="百分率（基礎02）",
            difficulty="基礎",
            question_text="某組次數為 9，總次數為 45，百分率是多少？",
            answer_text="$20\\%$。",
            explanation_text="$\\frac{9}{45}=0.2=20\\%$。",
            topic_id="j6-3-1-relative-frequency-percent",
        ),
        question_row(
            id_="q-j6-3-1-stat-007",
            title="圓形圖角度（中等01）",
            difficulty="中等",
            question_text="某類占全體 $25\\%$，在圓形圖中的圓心角為幾度？",
            answer_text="$90^\\circ$。",
            explanation_text="$25\\%\\times 360^\\circ=90^\\circ$。",
            topic_id="j6-3-1-bar-line-and-pie-chart",
        ),
        question_row(
            id_="q-j6-3-1-stat-008",
            title="圓形圖百分率（中等02）",
            difficulty="中等",
            question_text="圓形圖某扇形角度為 $72^\\circ$，約占全體百分之幾？",
            answer_text="$20\\%$。",
            explanation_text="$\\frac{72}{360}=0.2=20\\%$。",
            topic_id="j6-3-1-bar-line-and-pie-chart",
        ),
        question_row(
            id_="q-j6-3-1-stat-009",
            title="平均數（基礎01）",
            difficulty="基礎",
            question_text="資料 $4,6,8$ 的平均數為何？",
            answer_text="$6$。",
            explanation_text="$\\bar{x}=\\frac{4+6+8}{3}=6$。",
            topic_id="j6-3-1-mean-calculation-basic",
        ),
        question_row(
            id_="q-j6-3-1-stat-010",
            title="平均數（基礎02）",
            difficulty="基礎",
            question_text="資料 $2,3,5,10$ 的平均數是多少？",
            answer_text="$5$。",
            explanation_text="$\\bar{x}=\\frac{2+3+5+10}{4}=5$。",
            topic_id="j6-3-1-mean-calculation-basic",
        ),
        question_row(
            id_="q-j6-3-1-stat-011",
            title="加權平均（中等01）",
            difficulty="中等",
            question_text="分數 $60,80$ 的人數分別為 $3,2$，平均分數是多少？",
            answer_text="$68$。",
            explanation_text="$\\bar{x}=\\frac{60\\times3+80\\times2}{3+2}=68$。",
            topic_id="j6-3-1-mean-with-frequency",
        ),
        question_row(
            id_="q-j6-3-1-stat-012",
            title="加權平均（中等02）",
            difficulty="中等",
            question_text="某表的 $\\sum(x_if_i)=420$，總次數 $N=7$，平均數為何？",
            answer_text="$60$。",
            explanation_text="$\\bar{x}=\\frac{420}{7}=60$。",
            topic_id="j6-3-1-mean-with-frequency",
        ),
        question_row(
            id_="q-j6-3-1-stat-013",
            title="中位數（基礎01）",
            difficulty="基礎",
            question_text="資料 $1,3,5,7,9$ 的中位數是？",
            answer_text="$5$。",
            explanation_text="共 5 筆，排序後第 3 筆即中位數。",
            topic_id="j6-3-1-median-and-mode",
        ),
        question_row(
            id_="q-j6-3-1-stat-014",
            title="眾數（基礎02）",
            difficulty="基礎",
            question_text="資料 $2,2,3,4,4,4,5$ 的眾數是？",
            answer_text="$4$。",
            explanation_text="出現次數最多的是 4。",
            topic_id="j6-3-1-median-and-mode",
        ),
        question_row(
            id_="q-j6-3-1-stat-015",
            title="全距（基礎01）",
            difficulty="基礎",
            question_text="資料最大值為 18、最小值為 6，全距是多少？",
            answer_text="$12$。",
            explanation_text="$R=18-6=12$。",
            topic_id="j6-3-1-range-and-summary-strategy",
        ),
        question_row(
            id_="q-j6-3-1-stat-016",
            title="綜合判讀（中等01）",
            difficulty="中等",
            question_text="兩班平均都為 70 分，甲班全距 30、乙班全距 12，哪班分數較集中？",
            answer_text="乙班較集中。",
            explanation_text="平均相同時，全距較小代表分散程度較低。",
            topic_id="j6-3-1-range-and-summary-strategy",
        ),
    ]


def main():
    backups = []
    stats = {
        "topics_created": 0,
        "topics_updated": 0,
        "topics_skipped": 0,
        "questions_created": 0,
        "questions_updated": 0,
        "questions_skipped": 0,
        "errors": 0,
        "actual_source_hit": str(FORMULA_DB),
    }

    new_topics = build_topics()
    new_questions = build_questions()
    target_topic_ids = [t["id"] for t in new_topics]
    target_question_ids = [q["id"] for q in new_questions]

    try:
        backups.append(backup_file(FORMULA_DB))
        backups.append(backup_file(QUESTION_DB))

        formula_payload = load_json(FORMULA_DB)
        question_payload = load_json(QUESTION_DB)

        topics = formula_payload.get("topics", []) if isinstance(formula_payload, dict) else []
        questions = question_payload.get("questions", []) if isinstance(question_payload, dict) else []
        if not isinstance(topics, list):
            topics = []
        if not isinstance(questions, list):
            questions = []

        topics, tc, tu, ts = upsert_records(topics, new_topics)
        questions, qc, qu, qs = upsert_records(questions, new_questions)

        stats["topics_created"] = tc
        stats["topics_updated"] = tu
        stats["topics_skipped"] = ts
        stats["questions_created"] = qc
        stats["questions_updated"] = qu
        stats["questions_skipped"] = qs

        formula_payload["topics"] = topics
        formula_payload.setdefault("meta", {})
        formula_payload["meta"]["count"] = len(topics)
        formula_payload["meta"]["updatedAt"] = now_iso()
        formula_payload["meta"]["lastImportSource"] = SOURCE_REF

        question_payload["questions"] = questions
        question_payload.setdefault("meta", {})
        question_payload["meta"]["count"] = len(questions)
        question_payload["meta"]["updatedAt"] = now_iso()
        question_payload["meta"]["lastImportSource"] = SOURCE_REF

        save_json(FORMULA_DB, formula_payload)
        save_json(QUESTION_DB, question_payload)

        link_code, link_output = run_cmd(["python", "scripts/build_topic_question_links.py"])
        sync_code, sync_output = run_cmd(["python", "program-db/scripts/sync_web_data.py"])

        formula_check = load_json(FORMULA_DB)
        question_check = load_json(QUESTION_DB)
        topic_rows = formula_check.get("topics", [])
        question_rows = question_check.get("questions", [])

        topic_unique_ok, topic_dups = validate_unique_ids(topic_rows)
        question_unique_ok, question_dups = validate_unique_ids(question_rows)
        topic_required_issues = validate_required(topic_rows, TOPIC_REQUIRED_FIELDS, target_topic_ids)
        question_required_issues = validate_required(
            question_rows, QUESTION_REQUIRED_FIELDS, target_question_ids
        )

        result = {
            "source_md": SOURCE_MD,
            "source_ref": SOURCE_REF,
            "actual_source_hit": str(FORMULA_DB),
            "backups": backups,
            "stats": stats,
            "validation": {
                "topic_id_unique": topic_unique_ok,
                "topic_duplicate_ids": topic_dups,
                "question_id_unique": question_unique_ok,
                "question_duplicate_ids": question_dups,
                "topic_required_issues": topic_required_issues,
                "question_required_issues": question_required_issues,
                "formula_json_parse_ok": True,
                "question_json_parse_ok": True,
                "formula_utf8_has_replacement_char": check_replacement_char(FORMULA_DB),
                "question_utf8_has_replacement_char": check_replacement_char(QUESTION_DB),
            },
            "sync": {
                "topic_question_link_code": link_code,
                "topic_question_link_output": link_output,
                "web_sync_code": sync_code,
                "web_sync_output": sync_output,
            },
            "samples": {
                "topics": [t for t in topic_rows if t.get("id") in target_topic_ids][:3],
                "questions": [q for q in question_rows if q.get("id") in target_question_ids][:3],
            },
        }

        print(json.dumps(result, ensure_ascii=False, indent=2))
        if link_code != 0 or sync_code != 0:
            raise SystemExit(1)
    except Exception as exc:
        stats["errors"] += 1
        print(json.dumps({"error": str(exc), "stats": stats, "backups": backups}, ensure_ascii=False, indent=2))
        raise


if __name__ == "__main__":
    main()
