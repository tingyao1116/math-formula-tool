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

SOURCE_DOCX = (
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三下6_機率_整理\改國三下6機率_易讀版.docx"
)
SOURCE_REF = "改國三下6機率_易讀版.docx（重點整理匯入）"

CHAPTER_CODE = "j6-3-3"
CHAPTER_NAME = "機率"

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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j6-3-3-{ts}{path.suffix}"
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
        "domain": "機率與統計",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", CHAPTER_CODE, CHAPTER_NAME, "機率"],
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
        "source_type": "docx_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", CHAPTER_CODE, CHAPTER_NAME, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    return [
        topic_row(
            id_="j6-3-3-sample-space-and-event",
            title="樣本空間與事件",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("樣本空間", r"$S$"),
                ("事件", r"$A\subseteq S$"),
            ],
            usage=["先列出所有可能結果，再定義事件。"],
            examples=["擲一顆骰子：$S=\\{1,2,3,4,5,6\\}$。"],
            tips=["樣本空間不能漏情況、也不能重複。"],
            notes=["事件就是樣本空間中的子集合。"],
            mistakes=["把事件當成單一結果，忽略事件可含多個結果。"],
        ),
        topic_row(
            id_="j6-3-3-probability-definition",
            title="機率定義與基本範圍",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("古典機率", r"$P(A)=\frac{n(A)}{n(S)}$"),
                ("範圍", r"$0\le P(A)\le 1$"),
            ],
            usage=["等可能模型下直接計算事件機率。"],
            examples=["擲骰子得偶數：$P=\\frac{3}{6}=\\frac12$。"],
            tips=["分母一定是樣本空間總數，不是事件數。"],
            notes=["機率不能是負數，也不能大於 1。"],
            mistakes=["把事件數放錯位置，寫成 $\\frac{n(S)}{n(A)}$。"],
        ),
        topic_row(
            id_="j6-3-3-complement-rule",
            title="補事件與至少一個",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("補事件", r"$P(A^c)=1-P(A)$"),
                ("至少一個", r"$P(\text{至少一個})=1-P(\text{一個都沒有})$"),
            ],
            usage=["『至少』『至多』題型常用反面思考。"],
            examples=["至少中一次通常先算全部失敗。"],
            tips=["遇到『至少』先想補事件通常更快。"],
            notes=["補事件法常比直接列舉簡單。"],
            mistakes=["把補事件寫成 $P(A^c)=P(A)-1$。"],
        ),
        topic_row(
            id_="j6-3-3-addition-rule",
            title="加法公式與互斥事件",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("一般加法", r"$P(A\cup B)=P(A)+P(B)-P(A\cap B)$"),
                ("互斥", r"$A\cap B=\varnothing\Rightarrow P(A\cup B)=P(A)+P(B)$"),
            ],
            usage=["求 A 或 B 發生機率。"],
            examples=["抽牌是紅心或 A。"],
            tips=["先判斷是否互斥，再決定要不要扣交集。"],
            notes=["互斥與獨立是不同概念。"],
            mistakes=["互斥題仍扣交集，或非互斥題忘記扣交集。"],
        ),
        topic_row(
            id_="j6-3-3-multiplication-rule",
            title="乘法公式與獨立事件",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("乘法公式", r"$P(A\cap B)=P(A)\times P(B\mid A)$"),
                ("獨立事件", r"$P(A\cap B)=P(A)\times P(B)$"),
            ],
            usage=["連續兩步以上事件的機率計算。"],
            examples=["連擲兩次硬幣都正面。"],
            tips=["先看第二步機率是否受第一步影響。"],
            notes=["不放回抽樣通常不是獨立。"],
            mistakes=["所有連續事件都直接相乘，忽略條件改變。"],
        ),
        topic_row(
            id_="j6-3-3-counting-with-tree",
            title="樹狀圖與計數法",
            chapter_role="典型題型",
            difficulty="基礎",
            formula_lines=[
                ("乘法原理", r"$m\times n$"),
                ("葉節點計數", r"$\text{總結果數}= \text{葉節點數}$"),
            ],
            usage=["多步驟題先用樹狀圖列完整結果。"],
            examples=["兩次擲硬幣共有 4 種結果。"],
            tips=["每一層分支標清楚，避免重複與遺漏。"],
            notes=["樹狀圖可同時呈現順序與條件。"],
            mistakes=["只列部分分支就開始算機率。"],
        ),
        topic_row(
            id_="j6-3-3-replacement-vs-no-replacement",
            title="放回與不放回抽樣",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("放回", r"$\text{每次分母相同}$"),
                ("不放回", r"$\text{每次分母遞減}$"),
            ],
            usage=["抽球、抽籤、抽卡片題。"],
            examples=["袋中抽球是否放回會改變第二次機率。"],
            tips=["先圈題目關鍵詞：『放回』或『不放回』。"],
            notes=["不放回多用條件機率觀念。"],
            mistakes=["不放回題仍用固定分母。"],
        ),
        topic_row(
            id_="j6-3-3-fair-game-expectation",
            title="簡單期望值與公平遊戲",
            chapter_role="進階題型",
            difficulty="進階",
            formula_lines=[
                ("期望值", r"$E=\sum x_iP_i$"),
                ("公平", r"$E(\text{淨得})=0$"),
            ],
            usage=["判斷遊戲是否公平。"],
            examples=["抽獎收費題常用期望值判斷。"],
            tips=["先算淨得（獎金減成本）再取期望。"],
            notes=["國中常見離散型簡單期望題。"],
            mistakes=["直接平均獎金，沒有乘上機率。"],
        ),
        topic_row(
            id_="j6-3-3-conditional-probability-intro",
            title="條件機率入門",
            chapter_role="進階題型",
            difficulty="進階",
            formula_lines=[
                ("條件機率", r"$P(B\mid A)=\frac{P(A\cap B)}{P(A)}$"),
                ("限制", r"$P(A)>0$"),
            ],
            usage=["已知一個條件成立後，重算另一事件機率。"],
            examples=["已知抽到紅球，求是 1 號球的機率。"],
            tips=["先把樣本空間縮小到已知條件下。"],
            notes=["條件機率是『在 A 內看 B』。"],
            mistakes=["條件機率分母仍用原本全體樣本數。"],
        ),
        topic_row(
            id_="j6-3-3-common-traps-and-checklist",
            title="機率常見陷阱與檢核流程",
            chapter_role="易錯陷阱",
            difficulty="中等",
            formula_lines=[
                ("檢核 1", r"$0\le P \le 1$"),
                ("檢核 2", r"$\text{分子}\le\text{分母}$"),
            ],
            usage=["段考前快速檢查計算結果合理性。"],
            examples=["算出機率大於 1，代表前面列舉一定有錯。"],
            tips=["最後 10 秒做『範圍檢查 + 分母檢查』。"],
            notes=["機率題錯誤多半來自樣本空間定義錯。"],
            mistakes=["急著套公式，沒先確認事件是否互斥/獨立。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j6-3-3-prob-001",
            title="樣本空間（基礎01）",
            difficulty="基礎",
            question_text="擲一顆骰子的樣本空間 $S$ 為何？",
            answer_text="$\\{1,2,3,4,5,6\\}$。",
            explanation_text="骰子六面且各結果互斥。",
            topic_id="j6-3-3-sample-space-and-event",
        ),
        question_row(
            id_="q-j6-3-3-prob-002",
            title="事件定義（基礎02）",
            difficulty="基礎",
            question_text="擲骰事件 A =「點數大於 4」，請列出 A。",
            answer_text="$\\{5,6\\}$。",
            explanation_text="由樣本空間中挑出符合條件的結果。",
            topic_id="j6-3-3-sample-space-and-event",
        ),
        question_row(
            id_="q-j6-3-3-prob-003",
            title="古典機率（基礎01）",
            difficulty="基礎",
            question_text="擲骰得到偶數的機率是多少？",
            answer_text="$\\frac{1}{2}$。",
            explanation_text="偶數有 3 個結果，總結果 6 個。",
            topic_id="j6-3-3-probability-definition",
        ),
        question_row(
            id_="q-j6-3-3-prob-004",
            title="機率範圍（基礎02）",
            difficulty="基礎",
            question_text="機率值可以是 $1.2$ 嗎？",
            answer_text="不可以。",
            explanation_text="機率必在 $[0,1]$ 範圍內。",
            topic_id="j6-3-3-probability-definition",
        ),
        question_row(
            id_="q-j6-3-3-prob-005",
            title="補事件（中等01）",
            difficulty="中等",
            question_text="若 $P(A)=0.3$，則 $P(A^c)$ 為何？",
            answer_text="$0.7$。",
            explanation_text="$P(A^c)=1-P(A)=0.7$。",
            topic_id="j6-3-3-complement-rule",
        ),
        question_row(
            id_="q-j6-3-3-prob-006",
            title="至少一個（中等02）",
            difficulty="中等",
            question_text="連擲兩次硬幣，至少一次正面的機率？",
            answer_text="$\\frac{3}{4}$。",
            explanation_text="補事件為都反面，機率 $\\frac14$，故答案 $1-\\frac14$。",
            topic_id="j6-3-3-complement-rule",
        ),
        question_row(
            id_="q-j6-3-3-prob-007",
            title="加法公式（中等01）",
            difficulty="中等",
            question_text="若 $P(A)=0.5,P(B)=0.4,P(A\\cap B)=0.2$，則 $P(A\\cup B)$？",
            answer_text="$0.7$。",
            explanation_text="$0.5+0.4-0.2=0.7$。",
            topic_id="j6-3-3-addition-rule",
        ),
        question_row(
            id_="q-j6-3-3-prob-008",
            title="互斥事件（中等02）",
            difficulty="中等",
            question_text="若 A、B 互斥且 $P(A)=0.3,P(B)=0.4$，則 $P(A\\cup B)$？",
            answer_text="$0.7$。",
            explanation_text="互斥時交集為 0，直接相加。",
            topic_id="j6-3-3-addition-rule",
        ),
        question_row(
            id_="q-j6-3-3-prob-009",
            title="獨立相乘（中等01）",
            difficulty="中等",
            question_text="連擲兩次硬幣都正面的機率？",
            answer_text="$\\frac14$。",
            explanation_text="每次正面機率 $\\frac12$，獨立相乘得 $\\frac14$。",
            topic_id="j6-3-3-multiplication-rule",
        ),
        question_row(
            id_="q-j6-3-3-prob-010",
            title="條件乘法（進階01）",
            difficulty="進階",
            question_text="若 $P(A)=0.6,P(B\\mid A)=0.5$，則 $P(A\\cap B)$？",
            answer_text="$0.3$。",
            explanation_text="$P(A\\cap B)=P(A)P(B\\mid A)=0.6\\times0.5$。",
            topic_id="j6-3-3-multiplication-rule",
        ),
        question_row(
            id_="q-j6-3-3-prob-011",
            title="樹狀圖計數（基礎01）",
            difficulty="基礎",
            question_text="擲兩次硬幣共有幾種等可能結果？",
            answer_text="4 種。",
            explanation_text="$2\\times2=4$，可用樹狀圖列出 HH,HT,TH,TT。",
            topic_id="j6-3-3-counting-with-tree",
        ),
        question_row(
            id_="q-j6-3-3-prob-012",
            title="樹狀圖應用（基礎02）",
            difficulty="基礎",
            question_text="兩次擲骰，樣本點總數是多少？",
            answer_text="36。",
            explanation_text="每次 6 種，總數 $6\\times6=36$。",
            topic_id="j6-3-3-counting-with-tree",
        ),
        question_row(
            id_="q-j6-3-3-prob-013",
            title="放回抽樣（中等01）",
            difficulty="中等",
            question_text="袋中 3 紅 2 藍，放回抽兩次都紅的機率？",
            answer_text="$\\frac{9}{25}$。",
            explanation_text="每次紅球機率都 $\\frac35$，相乘得 $\\frac{9}{25}$。",
            topic_id="j6-3-3-replacement-vs-no-replacement",
        ),
        question_row(
            id_="q-j6-3-3-prob-014",
            title="不放回抽樣（中等02）",
            difficulty="中等",
            question_text="袋中 3 紅 2 藍，不放回抽兩次都紅的機率？",
            answer_text="$\\frac{3}{10}$。",
            explanation_text="第一次 $\\frac35$，第二次 $\\frac24$，相乘得 $\\frac{3}{10}$。",
            topic_id="j6-3-3-replacement-vs-no-replacement",
        ),
        question_row(
            id_="q-j6-3-3-prob-015",
            title="期望值（進階01）",
            difficulty="進階",
            question_text="遊戲得分：以 $0.4$ 機率得 10 分、以 $0.6$ 機率得 0 分，期望得分？",
            answer_text="4 分。",
            explanation_text="$E=10\\times0.4+0\\times0.6=4$。",
            topic_id="j6-3-3-fair-game-expectation",
        ),
        question_row(
            id_="q-j6-3-3-prob-016",
            title="公平遊戲（進階02）",
            difficulty="進階",
            question_text="若某遊戲淨得期望值為 $-2$，此遊戲對玩家公平嗎？",
            answer_text="不公平。",
            explanation_text="公平需期望淨得為 0，負值表示長期吃虧。",
            topic_id="j6-3-3-fair-game-expectation",
        ),
        question_row(
            id_="q-j6-3-3-prob-017",
            title="條件機率（進階01）",
            difficulty="進階",
            question_text="若 $P(A\\cap B)=0.2,P(A)=0.5$，求 $P(B\\mid A)$。",
            answer_text="$0.4$。",
            explanation_text="$P(B\\mid A)=\\frac{0.2}{0.5}=0.4$。",
            topic_id="j6-3-3-conditional-probability-intro",
        ),
        question_row(
            id_="q-j6-3-3-prob-018",
            title="條件樣本空間（進階02）",
            difficulty="進階",
            question_text="條件機率中，分母為什麼要用 $P(A)$？",
            answer_text="因為已知 A 發生，樣本空間縮小到 A。",
            explanation_text="條件機率是在 A 的範圍內重新計算機率。",
            topic_id="j6-3-3-conditional-probability-intro",
        ),
        question_row(
            id_="q-j6-3-3-prob-019",
            title="結果合理性檢查（中等01）",
            difficulty="中等",
            question_text="若你算到某事件機率為 $1.3$，最可能代表什麼？",
            answer_text="計算或列舉有錯。",
            explanation_text="機率不可能超過 1，需回頭檢查樣本空間與公式。",
            topic_id="j6-3-3-common-traps-and-checklist",
        ),
        question_row(
            id_="q-j6-3-3-prob-020",
            title="互斥與獨立辨識（中等02）",
            difficulty="中等",
            question_text="A、B 互斥時，一定獨立嗎？",
            answer_text="不一定（通常不是）。",
            explanation_text="互斥代表不會同時發生，與獨立概念不同。",
            topic_id="j6-3-3-common-traps-and-checklist",
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
            "source_docx": SOURCE_DOCX,
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

