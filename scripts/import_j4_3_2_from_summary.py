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

SOURCE_WORD = (
    r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國二下3 尺規作圖.docx"
)
SUMMARY_WORD = str(ROOT / "exports" / "word-j4-3-2" / "改國二下3_尺規作圖_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j4-3-2": "三角形的基本性質",
}

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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j4-3-2-{ts}{path.suffix}"
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
    chapter_code: str,
    chapter_role: str,
    difficulty: str,
    formula_lines: List[Tuple[str, str]],
    usage: List[str],
    examples: List[str],
    tips: List[str],
    notes: List[str],
    mistakes: List[str],
) -> Dict:
    chapter = CHAPTER_NAME[chapter_code]
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "國中",
        "grade": "國二",
        "term": "下學期",
        "chapter": chapter,
        "domain": "幾何",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", chapter_code, chapter, "尺規作圖"],
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes + [f"來源：{SOURCE_REF}"],
        "mistakes": mistakes,
        "contentTypes": ["觀念", "公式", "例題", "練習"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": now_iso(),
    }


def question_row(
    *,
    id_: str,
    title: str,
    chapter_code: str,
    difficulty: str,
    question_text: str,
    answer_text: str,
    explanation_text: str,
    topic_id: str,
) -> Dict:
    chapter = CHAPTER_NAME[chapter_code]
    return {
        "id": id_,
        "title": title,
        "question_text": question_text,
        "answer_text": answer_text,
        "explanation_text": explanation_text,
        "stage": "國中",
        "grade": "國二",
        "chapter": chapter,
        "difficulty": difficulty,
        "source_type": "word_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    return [
        topic_row(
            id_="j4-3-2-tools-and-rules",
            title="尺規作圖工具與規則",
            chapter_code="j4-3-2",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("尺", r"$\text{只能畫直線，不量長度}$"),
                ("圓規", r"$\text{可轉移長度、畫弧找交點}$"),
            ],
            usage=["建立正確作圖習慣，避免不合法操作。"],
            examples=["先畫基準線，再用圓規做等長轉移。"],
            tips=["每一步都寫作圖理由：等距、垂直、平行。"],
            notes=["工具規則是作圖題評分重點。"],
            mistakes=["用尺直接量長度或憑目測取點。"],
        ),
        topic_row(
            id_="j4-3-2-copy-segment",
            title="複製線段長度",
            chapter_code="j4-3-2",
            chapter_role="典型題型",
            difficulty="基礎",
            formula_lines=[
                ("目標", r"$\overline{CD}=\overline{AB}$"),
                ("方法", r"$\text{圓規取 }AB\text{ 長，從 }C\text{ 截點 }D$"),
            ],
            usage=["作指定長度線段或三角形邊長。"],
            examples=[r"已知 $\overline{AB}=5$，作出長度為 5 的新線段。"],
            tips=["圓規開口固定後不要改變。"],
            notes=["是很多複合作圖的第一步。"],
            mistakes=["轉移長度時圓規半徑改變。"],
        ),
        topic_row(
            id_="j4-3-2-midpoint-bisector",
            title="線段中點與中垂線",
            chapter_code="j4-3-2",
            chapter_role="核心公式",
            difficulty="中等",
            formula_lines=[
                ("性質", r"$M\text{ 為中點}\Rightarrow AM=MB$"),
                ("中垂線", r"$\ell\perp\overline{AB}\ \text{且過中點 }M$"),
            ],
            usage=["求中點、作垂直平分線、建構對稱。"],
            examples=[r"作 $\overline{AB}$ 的中垂線可同時得到中點。"],
            tips=["兩端點同半徑畫弧，連弧交點。"],
            notes=["中垂線上的點到兩端點等距。"],
            mistakes=["兩側圓弧半徑畫成不同。"],
        ),
        topic_row(
            id_="j4-3-2-perpendicular-construction",
            title="過點作垂線",
            chapter_code="j4-3-2",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("在線上點", r"$P\in\ell,\ \text{作 }m\perp\ell$"),
                ("線外點", r"$P\notin\ell,\ \text{作 }m\perp\ell$"),
            ],
            usage=["高度、最短距離、垂足問題。"],
            examples=["由點 P 向直線 l 作垂線得到垂足 H。"],
            tips=["先判斷點在不在線上，流程不同。"],
            notes=["垂線常和三角形高連動。"],
            mistakes=["把中垂線步驟誤套到過點垂線。"],
        ),
        topic_row(
            id_="j4-3-2-parallel-construction",
            title="過點作平行線",
            chapter_code="j4-3-2",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("目標", r"$m\parallel \ell$"),
                ("方法", r"$\text{對應角相等或雙垂線法}$"),
            ],
            usage=["平行四邊形、比例線段與截線角關係。"],
            examples=["經線外一點 P 作與直線 l 平行線。"],
            tips=["先作垂線再作垂線可得平行。"],
            notes=["平行線作圖在綜合題出現率高。"],
            mistakes=["只讓線看起來平行，未用幾何條件保證。"],
        ),
        topic_row(
            id_="j4-3-2-angle-bisector-construction",
            title="角平分線作圖",
            chapter_code="j4-3-2",
            chapter_role="核心公式",
            difficulty="中等",
            formula_lines=[
                ("性質", r"$\angle 1=\angle 2$"),
                ("等距", r"$\text{角平分線上點到兩邊距離相等}$"),
            ],
            usage=["等角分割、內心相關作圖。"],
            examples=[r"將 $\angle A$ 尺規平分。"],
            tips=["先截兩邊同半徑弧，再找交點。"],
            notes=["角平分線是內心基礎。"],
            mistakes=["第二次畫弧半徑不同造成不平分。"],
        ),
        topic_row(
            id_="j4-3-2-triangle-sss",
            title="三邊已知作三角形（SSS）",
            chapter_code="j4-3-2",
            chapter_role="應用建模",
            difficulty="中等",
            formula_lines=[
                ("條件", r"$AB,\ BC,\ CA\ \text{已知}$"),
                ("作法", r"$\text{以 }A,C\text{ 為圓心畫弧交於 }B$"),
            ],
            usage=["依三邊長構造唯一三角形。"],
            examples=[r"$AB=5,BC=4,CA=3$ 的三角形作圖。"],
            tips=["先選最穩定底邊，再定位第三點。"],
            notes=["需滿足三角不等式才可作。"],
            mistakes=["忽略邊長條件導致無解仍強作。"],
        ),
        topic_row(
            id_="j4-3-2-triangle-sas",
            title="兩邊夾角作三角形（SAS）",
            chapter_code="j4-3-2",
            chapter_role="應用建模",
            difficulty="中等",
            formula_lines=[
                ("條件", r"$AB,\ AC,\ \angle A\ \text{已知}$"),
                ("作法", r"$\text{先作角，再取兩邊長定位 }B,C$"),
            ],
            usage=["已知兩邊與夾角的建構題。"],
            examples=[r"$AB=6,AC=4,\angle A=50^\circ$ 作三角形。"],
            tips=["夾角一定是兩已知邊之間的角。"],
            notes=["SAS 作圖相對穩定不易歧義。"],
            mistakes=["把非夾角誤當夾角使用。"],
        ),
        topic_row(
            id_="j4-3-2-triangle-asa",
            title="兩角一邊作三角形（ASA）",
            chapter_code="j4-3-2",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("條件", r"$\angle A,\ \angle B,\ AB\ \text{已知}$"),
                ("補角", r"$\angle C=180^\circ-\angle A-\angle B$"),
            ],
            usage=["由角度條件建立三角形。"],
            examples=[r"$AB=7,\angle A=40^\circ,\angle B=70^\circ$。"],
            tips=["先畫已知邊，再在兩端作角。"],
            notes=["兩角確定後第三角自動確定。"],
            mistakes=["兩端角開錯方向導致交點偏移。"],
        ),
        topic_row(
            id_="j4-3-2-construction-check",
            title="作圖驗證與書寫",
            chapter_code="j4-3-2",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("驗證", r"$\text{等長、垂直、平行、角度條件逐一檢查}$"),
                ("書寫", r"$\text{步驟+理由+結論}$"),
            ],
            usage=["提升作圖題得分與可讀性。"],
            examples=["完成圖形後回頭檢查是否符合所有已知。"],
            tips=["每一步都標示『為什麼』，不要只有『怎麼做』。"],
            notes=["驗證是區分滿分與部分分關鍵。"],
            mistakes=["畫完即停，未做條件回檢。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j4-3-2-draft-001",
            title="工具判斷（基礎01）",
            chapter_code="j4-3-2",
            difficulty="基礎",
            question_text="尺規作圖中，哪個工具負責轉移長度？",
            answer_text="圓規。",
            explanation_text="圓規可固定半徑並轉移等長；尺只畫直線。",
            topic_id="j4-3-2-tools-and-rules",
        ),
        question_row(
            id_="q-j4-3-2-draft-002",
            title="複製線段（基礎02）",
            chapter_code="j4-3-2",
            difficulty="基礎",
            question_text=r"已知 $\overline{AB}$，在點 C 出發作一線段 $\overline{CD}$ 使 $\overline{CD}=\overline{AB}$，核心步驟是什麼？",
            answer_text="以圓規取 AB 長，從 C 截出 D。",
            explanation_text="保持圓規開口不變，從 C 畫弧與射線交點即為 D。",
            topic_id="j4-3-2-copy-segment",
        ),
        question_row(
            id_="q-j4-3-2-draft-003",
            title="中點性質（基礎03）",
            chapter_code="j4-3-2",
            difficulty="基礎",
            question_text=r"若 M 為線段 $\overline{AB}$ 的中點，寫出長度關係。",
            answer_text=r"$AM=MB$",
            explanation_text="中點定義即把線段分成兩段等長。",
            topic_id="j4-3-2-midpoint-bisector",
        ),
        question_row(
            id_="q-j4-3-2-draft-004",
            title="中垂線判斷（基礎04）",
            chapter_code="j4-3-2",
            difficulty="基礎",
            question_text=r"中垂線必須同時滿足哪兩個條件？",
            answer_text=r"通過中點且垂直該線段。",
            explanation_text=r"中垂線定義：過中點 M，且與 $\overline{AB}$ 垂直。",
            topic_id="j4-3-2-midpoint-bisector",
        ),
        question_row(
            id_="q-j4-3-2-draft-005",
            title="垂線作圖（中等01）",
            chapter_code="j4-3-2",
            difficulty="中等",
            question_text="過線外一點 P 向直線 l 作垂線時，第一個關鍵動作是什麼？",
            answer_text="先以 P 為中心作弧，與 l 相交兩點。",
            explanation_text="取得 l 上兩點後，才能利用等距作出垂直方向。",
            topic_id="j4-3-2-perpendicular-construction",
        ),
        question_row(
            id_="q-j4-3-2-draft-006",
            title="平行線作法（中等02）",
            chapter_code="j4-3-2",
            difficulty="中等",
            question_text="過點 P 作直線 l 的平行線，可用哪個穩定策略？",
            answer_text="先作一條垂線，再對該垂線作垂線（雙垂線法）。",
            explanation_text="同垂於一線的兩線互相平行。",
            topic_id="j4-3-2-parallel-construction",
        ),
        question_row(
            id_="q-j4-3-2-draft-007",
            title="角平分步驟（中等03）",
            chapter_code="j4-3-2",
            difficulty="中等",
            question_text=r"尺規平分 $\angle A$ 時，為何要在角的兩邊先截得兩點？",
            answer_text="為了用同半徑畫弧找等距交點，確保兩側角度相等。",
            explanation_text="兩截點是第二次作弧的圓心，交點連 A 即為角平分線。",
            topic_id="j4-3-2-angle-bisector-construction",
        ),
        question_row(
            id_="q-j4-3-2-draft-008",
            title="SSS 作圖（中等04）",
            chapter_code="j4-3-2",
            difficulty="中等",
            question_text=r"已知 $AB=5,AC=4,BC=3$，作圖時第三點 C（或 B）如何定位？",
            answer_text="以兩端點為圓心畫對應半徑圓弧，交點即第三點。",
            explanation_text="兩個距離條件同時滿足的位置是兩圓交點。",
            topic_id="j4-3-2-triangle-sss",
        ),
        question_row(
            id_="q-j4-3-2-draft-009",
            title="SAS 作圖（中等05）",
            chapter_code="j4-3-2",
            difficulty="中等",
            question_text=r"SAS 作圖為何必須先畫已知夾角？",
            answer_text="因為兩已知邊必須夾在該角兩側，方向先決定後長度才能正確放置。",
            explanation_text="若先放邊再找角，容易把非夾角誤用。",
            topic_id="j4-3-2-triangle-sas",
        ),
        question_row(
            id_="q-j4-3-2-draft-010",
            title="ASA 補角（中等06）",
            chapter_code="j4-3-2",
            difficulty="中等",
            question_text=r"ASA 條件下若 $\angle A=50^\circ,\angle B=60^\circ$，則 $\angle C$ 為多少？",
            answer_text=r"$70^\circ$",
            explanation_text=r"$\angle C=180^\circ-50^\circ-60^\circ=70^\circ$。",
            topic_id="j4-3-2-triangle-asa",
        ),
        question_row(
            id_="q-j4-3-2-draft-011",
            title="驗證重點（中等07）",
            chapter_code="j4-3-2",
            difficulty="中等",
            question_text="尺規作圖完成後至少要檢查哪三類條件？",
            answer_text="等長、角度/垂直平行、點位關係。",
            explanation_text="不檢查就可能畫對外形卻不符合題目條件。",
            topic_id="j4-3-2-construction-check",
        ),
        question_row(
            id_="q-j4-3-2-draft-012",
            title="中垂線應用（中等08）",
            chapter_code="j4-3-2",
            difficulty="中等",
            question_text=r"若點 P 在 $\overline{AB}$ 的中垂線上，則 PA 與 PB 有何關係？",
            answer_text=r"$PA=PB$",
            explanation_text="中垂線上的點到兩端點等距。",
            topic_id="j4-3-2-midpoint-bisector",
        ),
        question_row(
            id_="q-j4-3-2-draft-013",
            title="步驟排序（進階01）",
            chapter_code="j4-3-2",
            difficulty="進階",
            question_text="作角平分線時，先連交點到頂點，還是先找弧交點？",
            answer_text="先找弧交點，再連到頂點。",
            explanation_text="沒有交點就無法決定平分線方向。",
            topic_id="j4-3-2-angle-bisector-construction",
        ),
        question_row(
            id_="q-j4-3-2-draft-014",
            title="無解判斷（進階02）",
            chapter_code="j4-3-2",
            difficulty="進階",
            question_text=r"若給定三邊長為 2、3、6，能否用 SSS 作三角形？",
            answer_text="不能。",
            explanation_text="不符三角不等式（2+3<6），圓弧不會相交。",
            topic_id="j4-3-2-triangle-sss",
        ),
        question_row(
            id_="q-j4-3-2-draft-015",
            title="平行與角（進階03）",
            chapter_code="j4-3-2",
            difficulty="進階",
            question_text="過點作平行線時，為何常用對應角相等？",
            answer_text="因為對應角相等是判斷兩線平行的充分條件之一。",
            explanation_text="作出相等對應角即可保證新線與原線平行。",
            topic_id="j4-3-2-parallel-construction",
        ),
        question_row(
            id_="q-j4-3-2-draft-016",
            title="垂足概念（進階04）",
            chapter_code="j4-3-2",
            difficulty="進階",
            question_text=r"從點 P 向直線 l 作垂線交於 H，H 稱為什麼？",
            answer_text="垂足。",
            explanation_text=r"垂線與原線的交點稱垂足。",
            topic_id="j4-3-2-perpendicular-construction",
        ),
        question_row(
            id_="q-j4-3-2-draft-017",
            title="作圖文字化（進階05）",
            chapter_code="j4-3-2",
            difficulty="進階",
            question_text="在作圖書寫中，為什麼要同時寫『步驟』與『理由』？",
            answer_text="因為理由證明該步驟合法且符合幾何性質。",
            explanation_text="僅有步驟沒有理由，無法確認幾何正當性。",
            topic_id="j4-3-2-construction-check",
        ),
        question_row(
            id_="q-j4-3-2-draft-018",
            title="等長轉移失敗（進階06）",
            chapter_code="j4-3-2",
            difficulty="進階",
            question_text="複製線段時若圓規半徑改變，最直接的後果是什麼？",
            answer_text="新線段不再與原線段等長。",
            explanation_text="等長條件依賴圓規開口保持不變。",
            topic_id="j4-3-2-copy-segment",
        ),
        question_row(
            id_="q-j4-3-2-draft-019",
            title="SAS/ASA 辨識（進階07）",
            chapter_code="j4-3-2",
            difficulty="進階",
            question_text="已知一邊與其兩端角，屬於 SAS 還是 ASA？",
            answer_text="ASA。",
            explanation_text="條件是兩角一邊，不是兩邊夾角。",
            topic_id="j4-3-2-triangle-asa",
        ),
        question_row(
            id_="q-j4-3-2-draft-020",
            title="流程總結（進階08）",
            chapter_code="j4-3-2",
            difficulty="進階",
            question_text="尺規作圖通用流程的正確順序是什麼？",
            answer_text="畫基準、作軌跡、取交點、連線、驗證。",
            explanation_text="先定基準才能建立限制，再由交點決定唯一位置。",
            topic_id="j4-3-2-construction-check",
        ),
    ]


def main():
    backups = {
        "formula_db": backup_file(FORMULA_DB),
        "question_db": backup_file(QUESTION_DB),
    }

    formula_payload = load_json(FORMULA_DB)
    question_payload = load_json(QUESTION_DB)

    topics = formula_payload.get("topics", []) if isinstance(formula_payload, dict) else []
    questions = question_payload.get("questions", []) if isinstance(question_payload, dict) else []

    new_topics = build_topics()
    new_questions = build_questions()

    topics, topic_created, topic_updated, topic_skipped = upsert_records(topics, new_topics)
    questions, q_created, q_updated, q_skipped = upsert_records(questions, new_questions)

    now = now_iso()
    formula_payload["topics"] = topics
    formula_payload.setdefault("meta", {})
    formula_payload["meta"]["count"] = len(topics)
    formula_payload["meta"]["updatedAt"] = now
    formula_payload["meta"]["lastImportSource"] = f"{Path(SOURCE_WORD).name}（重點整理匯入）"

    question_payload["questions"] = questions
    question_payload.setdefault("meta", {})
    question_payload["meta"]["count"] = len(questions)
    question_payload["meta"]["updatedAt"] = now
    question_payload["meta"]["lastImportSource"] = f"{Path(SOURCE_WORD).name}（重點整理匯入）"

    save_json(FORMULA_DB, formula_payload)
    save_json(QUESTION_DB, question_payload)

    link_code, link_out = run_cmd(["python", "scripts/build_topic_question_links.py"])
    sync_code, sync_out = run_cmd(["python", "program-db/scripts/sync_web_data.py"])

    formula_check = load_json(FORMULA_DB)
    question_check = load_json(QUESTION_DB)
    topic_rows = formula_check.get("topics", [])
    question_rows = question_check.get("questions", [])

    topic_ids = [x["id"] for x in new_topics]
    question_ids = [x["id"] for x in new_questions]

    topic_id_ok, topic_dups = validate_unique_ids(topic_rows)
    question_id_ok, question_dups = validate_unique_ids(question_rows)
    topic_required_issues = validate_required(topic_rows, TOPIC_REQUIRED_FIELDS, topic_ids)
    question_required_issues = validate_required(question_rows, QUESTION_REQUIRED_FIELDS, question_ids)
    formula_has_bad_utf8 = check_replacement_char(FORMULA_DB)
    question_has_bad_utf8 = check_replacement_char(QUESTION_DB)

    summary = {
        "source_hit": "program-db/database/formula-db.json",
        "backups": backups,
        "summary": {
            "topics_created": topic_created,
            "topics_updated": topic_updated,
            "topics_skipped": topic_skipped,
            "questions_created": q_created,
            "questions_updated": q_updated,
            "questions_skipped": q_skipped,
            "errors": len(topic_required_issues)
            + len(question_required_issues)
            + (0 if topic_id_ok else 1)
            + (0 if question_id_ok else 1)
            + (0 if link_code == 0 else 1)
            + (0 if sync_code == 0 else 1)
            + (1 if formula_has_bad_utf8 else 0)
            + (1 if question_has_bad_utf8 else 0),
        },
        "validation": {
            "topic_id_unique": topic_id_ok,
            "question_id_unique": question_id_ok,
            "topic_id_duplicates": topic_dups[:20],
            "question_id_duplicates": question_dups[:20],
            "topic_required_issues": topic_required_issues[:20],
            "question_required_issues": question_required_issues[:20],
            "formula_json_parse": True,
            "question_json_parse": True,
            "formula_utf8_has_replacement_char": formula_has_bad_utf8,
            "question_utf8_has_replacement_char": question_has_bad_utf8,
        },
        "sync": {
            "topic_question_link_code": link_code,
            "topic_question_link_output": link_out.splitlines()[-8:],
            "web_sync_code": sync_code,
            "web_sync_output": sync_out.splitlines()[-8:],
        },
        "sample": {
            "topic_ids": topic_ids[:3],
            "question_ids": question_ids[:3],
        },
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
