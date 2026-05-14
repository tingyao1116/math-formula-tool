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
    r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國一下5 一元一次不等式.docx"
)
SUMMARY_WORD = str(ROOT / "exports" / "word-j2-4-1-2" / "改國一下5_一元一次不等式_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j2-4-1": "解一元一次不等式",
    "j2-4-2": "一元一次不等式應用問題",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j2-4-1-j2-4-2-{ts}{path.suffix}"
    shutil.copy2(path, backup_path)
    return str(backup_path)


def upsert_records(records: List[Dict], additions: List[Dict]) -> Tuple[List[Dict], int, int, int]:
    idx = {str(item.get("id", "")).strip(): i for i, item in enumerate(records)}
    created = 0
    updated = 0
    skipped = 0
    for row in additions:
        rid = str(row.get("id", "")).strip()
        if not rid:
            skipped += 1
            continue
        if rid in idx:
            records[idx[rid]] = row
            updated += 1
        else:
            records.append(row)
            idx[rid] = len(records) - 1
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
    wanted = set(target_ids)
    issues = []
    for row in rows:
        rid = str(row.get("id", "")).strip()
        if rid not in wanted:
            continue
        missing = []
        for field in fields:
            value = row.get(field, None)
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
    parent_id: str = "",
) -> Dict:
    chapter = CHAPTER_NAME[chapter_code]
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "國中",
        "grade": "國一",
        "term": "下學期",
        "chapter": chapter,
        "domain": "代數",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": parent_id,
        "tags": ["word匯入", "教學核心", chapter_code, chapter],
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes + [f"來源：{SOURCE_REF}"],
        "mistakes": mistakes,
        "contentTypes": ["主題", "公式與性質", "學習提醒", "常見錯誤"],
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
        "grade": "國一",
        "chapter": chapter,
        "difficulty": difficulty,
        "source_type": "word_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word題庫", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    rows = []

    rows.append(
        topic_row(
            id_="j2-4-1-inequality-main",
            title="一元一次不等式基本型",
            chapter_code="j2-4-1",
            chapter_role="主題",
            difficulty="基礎",
            formula_lines=[
                ("基本型", r"$ax+b>c,\ ax+b\ge c,\ ax+b<c,\ ax+b\le c\ (a\neq0)$"),
                ("解集型態", r"$x>k,\ x\ge k,\ x<k,\ x\le k$"),
            ],
            usage=["建立不等式解題流程：化簡、求解、表達範圍。"],
            examples=[r"$3x-5>7\Rightarrow x>4$"],
            tips=["不等式答案通常是一段範圍，不是單一數值。"],
            notes=["先看未知數在左或右，再決定移項順序。"],
            mistakes=["把不等式當等式解完後只寫一個數。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-1-symbol-language",
            title="不等號語意與敘述轉換",
            chapter_code="j2-4-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("語意", r"$x\ge a$：至少 $a$；$x<a$：未滿 $a$"),
                ("區間", r"$a<x\le b \iff x\in(a,b]$"),
            ],
            usage=["把文字敘述轉成正確不等號，是應用題第一步。"],
            examples=[r"「不超過 10」$\Rightarrow x\le10$"],
            tips=["先圈關鍵詞：至少、至多、未滿、不少於。"],
            notes=["同一句話常可用多種寫法，但不等號方向必須一致。"],
            mistakes=["把「至少」誤寫成 $<$。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-1-add-sub-property",
            title="同加同減性質",
            chapter_code="j2-4-1",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[
                ("同加同減", r"$a>b\Rightarrow a+c>b+c$"),
                ("移項觀念", r"$ax+b>c\Rightarrow ax>c-b$"),
            ],
            usage=["整理不等式時，先做同加同減再進入乘除。"],
            examples=[r"$2x+7>15\Rightarrow 2x>8$"],
            tips=["移項就是兩邊做同加同減。"],
            notes=["此步驟不會改變不等號方向。"],
            mistakes=["移項時數字符號改錯。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-1-mul-div-sign-flip",
            title="同乘同除與翻號規則",
            chapter_code="j2-4-1",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("正數", r"$a>b,\ c>0\Rightarrow ac>bc$"),
                ("負數", r"$a>b,\ c<0\Rightarrow ac<bc$"),
            ],
            usage=["處理係數為負的情況，避免翻號遺漏。"],
            examples=[r"$-2x\le8\Rightarrow x\ge-4$"],
            tips=["看到「除以負數」就先提醒自己翻號。"],
            notes=["翻號是本章最常見失誤點。"],
            mistakes=["除以負數後不翻號。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-1-transpose-collect",
            title="移項與合併同類項",
            chapter_code="j2-4-1",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("雙邊含未知數", r"$ax+b>cx+d\Rightarrow (a-c)x>d-b$"),
                ("整理順序", r"$\text{移項}\rightarrow\text{合併}\rightarrow\text{化為 }x\text{ 的範圍}$"),
            ],
            usage=["解兩邊都有 $x$ 的不等式。"],
            examples=[r"$2x+7>5x-2\Rightarrow x<3$"],
            tips=["先把 $x$ 集中同一邊，常可減少算錯。"],
            notes=["整理後再判斷是否要翻號。"],
            mistakes=["同類項合併時係數計算錯。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-1-number-line-interval",
            title="數線與區間表示",
            chapter_code="j2-4-1",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[
                ("開區間", r"$a<x<b$ 對應區間 $(a,b)$。"),
                ("閉區間", r"$a\le x\le b$ 對應區間 $[a,b]$。"),
            ],
            usage=["把代數答案轉成圖形與區間，方便檢查。"],
            examples=[r"$x<3$ 對應 $(-\infty,3)$"],
            tips=["看見等號就用實心點，沒有等號用空心點。"],
            notes=["數線方向固定向右變大。"],
            mistakes=["端點開閉畫反。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-1-chain-inequality",
            title="連鎖不等式解法",
            chapter_code="j2-4-1",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("基本型", r"$a<mx+b\le c$"),
                ("流程", r"$\text{同時解兩個不等式，再取交集}$"),
            ],
            usage=["一次處理上下界同時限制。"],
            examples=[r"$-2<3x+1\le10\Rightarrow -1<x\le3$"],
            tips=[r"可先拆成兩式：$a<mx+b$ 與 $mx+b\le c$。"],
            notes=["最後一定要寫交集結果。"],
            mistakes=["只解其中一邊就結束。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-1-abs-inequality-basic",
            title="絕對值不等式入門",
            chapter_code="j2-4-1",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("小於型", r"$|x-p|<r\iff p-r<x<p+r$"),
                ("大於型", r"$|x-p|\ge r\iff x\le p-r\ \text{或}\ x\ge p+r$"),
            ],
            usage=["把距離概念轉成區間或兩端外側。"],
            examples=[r"$|x-4|<3\Rightarrow 1<x<7$"],
            tips=["先判斷是「中間一段」還是「兩邊外側」。"],
            notes=[r"$r$ 代表距離，需滿足 $r\ge0$。"],
            mistakes=[r"把 $\ge$ 型誤寫成區間交集。"],
        )
    )

    rows.append(
        topic_row(
            id_="j2-4-2-word-to-inequality",
            title="文字題列不等式",
            chapter_code="j2-4-2",
            chapter_role="主題",
            difficulty="基礎",
            formula_lines=[
                ("列式", r"$\text{設未知數}\rightarrow\text{翻成不等號}\rightarrow\text{求範圍}$"),
                ("關鍵詞", r"$\text{至少}\Rightarrow \ge,\ \text{至多}\Rightarrow \le$"),
            ],
            usage=["把應用題轉成可計算的不等式。"],
            examples=[r"「總價不超過 300 元」$\Rightarrow 45x\le300$"],
            tips=["先寫一句中文算式，再轉成符號。"],
            notes=["未知數需含單位意義（人數、分鐘、頁數）。"],
            mistakes=["沒有定義未知數就直接列式。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-2-budget-limit",
            title="預算與總價限制",
            chapter_code="j2-4-2",
            chapter_role="典型題型",
            difficulty="基礎",
            formula_lines=[
                ("總價模型", r"$\text{固定費}+(\text{單價})x\le\text{預算}$"),
                ("整數條件", r"$x\in\mathbb{Z}$ 且常有 $x\ge0$"),
            ],
            usage=["購買、票價、方案費用比較題。"],
            examples=[r"$85+25k\le260\Rightarrow k\le7$"],
            tips=["先處理不等式，再套整數條件。"],
            notes=["實務題常需要最大可行整數。"],
            mistakes=["得到小數後未取整。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-2-distance-time",
            title="速度時間距離限制",
            chapter_code="j2-4-2",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("基本關係", r"$d=vt$"),
                ("不等式", r"$vt\ge d_0,\ vt\le d_1$"),
            ],
            usage=["至少到達、不得超過、時間區間題。"],
            examples=[r"$80t\ge1200\Rightarrow t\ge15$"],
            tips=["先確認單位一致（分、時、公里）。"],
            notes=["必要時可轉成連鎖不等式。"],
            mistakes=["單位不同直接代入。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-2-integer-filter",
            title="整數解篩選",
            chapter_code="j2-4-2",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("範圍", r"$a\le x\le b$"),
                ("整數化", r"$x\in\mathbb{Z}\Rightarrow x=\lceil a\rceil,\ldots,\lfloor b\rfloor$"),
            ],
            usage=["題目要求人數、件數、天數時。"],
            examples=[r"$32x\ge1000\Rightarrow x\ge31.25\Rightarrow x\ge32$"],
            tips=["判斷是求最小可行值還是可行個數。"],
            notes=["整數條件常寫在最後一句。"],
            mistakes=["直接把小數解當成答案。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-2-condition-intersection",
            title="多條件交集與範圍",
            chapter_code="j2-4-2",
            chapter_role="核心概念",
            difficulty="進階",
            formula_lines=[
                ("同時滿足", r"$x>a,\ x\le b\Rightarrow a<x\le b$"),
                ("幾何條件", r"$|p-q|<x<p+q\ (\text{三角形邊長})$"),
            ],
            usage=["同時有上限與下限、或多來源限制題。"],
            examples=[r"$200<x\le300$ 為兩條件交集"],
            tips=["先各自求解，再取共同區間。"],
            notes=["空集合代表題目無可行解。"],
            mistakes=["把交集誤做聯集。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-4-2-answer-check",
            title="答案檢核與情境合理性",
            chapter_code="j2-4-2",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[
                ("檢核", r"$\text{代回原條件確認是否成立}$"),
                ("合理性", r"$\text{人數、長度、時間通常需 }x>0$"),
            ],
            usage=["避免只算代數、不看情境。"],
            examples=[r"$x\ge20$ 時最小整數解為 $20$"],
            tips=["最後一步固定做：代回 + 單位檢查。"],
            notes=["若題目要求最大/最小，需從可行解集合挑值。"],
            mistakes=["求出範圍後忘記挑題目要的答案型態。"],
        )
    )

    return rows


def build_questions() -> List[Dict]:
    rows = []

    rows.extend(
        [
            question_row(
                id_="q-j2-4-1-word05-001",
                title="語意轉不等式（基礎01）",
                chapter_code="j2-4-1",
                difficulty="基礎",
                question_text="把「$x$ 不小於 $-2$」寫成不等式。",
                answer_text=r"$x\ge-2$",
                explanation_text="「不小於」就是大於或等於。",
                topic_id="j2-4-1-symbol-language",
            ),
            question_row(
                id_="q-j2-4-1-word05-002",
                title="基本解題（基礎02）",
                chapter_code="j2-4-1",
                difficulty="基礎",
                question_text=r"解不等式：$3x-5>7$。",
                answer_text=r"$x>4$",
                explanation_text=r"$3x>12\Rightarrow x>4$。",
                topic_id="j2-4-1-inequality-main",
            ),
            question_row(
                id_="q-j2-4-1-word05-003",
                title="翻號判斷（基礎03）",
                chapter_code="j2-4-1",
                difficulty="基礎",
                question_text=r"解不等式：$-2x+1\le9$。",
                answer_text=r"$x\ge-4$",
                explanation_text=r"$-2x\le8$，兩邊同除以 $-2$ 要翻號，得 $x\ge-4$。",
                topic_id="j2-4-1-mul-div-sign-flip",
            ),
            question_row(
                id_="q-j2-4-1-word05-004",
                title="區間表示（基礎04）",
                chapter_code="j2-4-1",
                difficulty="基礎",
                question_text=r"把 $x<3$ 寫成區間表示。",
                answer_text=r"$(-\infty,3)$",
                explanation_text="小於 3 不含 3，所以是左開右開到 3 的區間。",
                topic_id="j2-4-1-number-line-interval",
            ),
            question_row(
                id_="q-j2-4-1-word05-005",
                title="雙邊含未知數（中等01）",
                chapter_code="j2-4-1",
                difficulty="中等",
                question_text=r"解不等式：$2x+7>5x-2$。",
                answer_text=r"$x<3$",
                explanation_text=r"$9>3x\Rightarrow x<3$。",
                topic_id="j2-4-1-transpose-collect",
            ),
            question_row(
                id_="q-j2-4-1-word05-006",
                title="含括號不等式（中等02）",
                chapter_code="j2-4-1",
                difficulty="中等",
                question_text=r"解不等式：$5(x-1)\le2x+4$。",
                answer_text=r"$x\le3$",
                explanation_text=r"$5x-5\le2x+4\Rightarrow3x\le9\Rightarrow x\le3$。",
                topic_id="j2-4-1-transpose-collect",
            ),
            question_row(
                id_="q-j2-4-1-word05-007",
                title="分式不等式（中等03）",
                chapter_code="j2-4-1",
                difficulty="中等",
                question_text=r"解不等式：$\frac{x-3}{2}>\frac{x+1}{3}$。",
                answer_text=r"$x>11$",
                explanation_text=r"同乘以 6（正數）得 $3(x-3)>2(x+1)$，整理得 $x>11$。",
                topic_id="j2-4-1-mul-div-sign-flip",
            ),
            question_row(
                id_="q-j2-4-1-word05-008",
                title="負係數整理（中等04）",
                chapter_code="j2-4-1",
                difficulty="中等",
                question_text=r"解不等式：$-3(2x-1)<9$。",
                answer_text=r"$x>-1$",
                explanation_text=r"$-6x+3<9\Rightarrow -6x<6$，同除以 $-6$ 翻號得 $x>-1$。",
                topic_id="j2-4-1-mul-div-sign-flip",
            ),
            question_row(
                id_="q-j2-4-1-word05-009",
                title="連鎖不等式（進階01）",
                chapter_code="j2-4-1",
                difficulty="進階",
                question_text=r"解連鎖不等式：$-2<3x+1\le10$。",
                answer_text=r"$-1<x\le3$",
                explanation_text=r"由 $-2<3x+1$ 得 $x>-1$，由 $3x+1\le10$ 得 $x\le3$，取交集。",
                topic_id="j2-4-1-chain-inequality",
            ),
            question_row(
                id_="q-j2-4-1-word05-010",
                title="絕對值區間（進階02）",
                chapter_code="j2-4-1",
                difficulty="進階",
                question_text=r"解不等式：$|x-4|<3$。",
                answer_text=r"$1<x<7$",
                explanation_text=r"$|x-4|<3\iff -3<x-4<3\iff1<x<7$。",
                topic_id="j2-4-1-abs-inequality-basic",
            ),
            question_row(
                id_="q-j2-4-1-word05-011",
                title="絕對值外側（進階03）",
                chapter_code="j2-4-1",
                difficulty="進階",
                question_text=r"解不等式：$|2x+1|\ge5$。",
                answer_text=r"$x\le-3$ 或 $x\ge2$",
                explanation_text=r"$2x+1\le-5$ 或 $2x+1\ge5$，解得 $x\le-3$ 或 $x\ge2$。",
                topic_id="j2-4-1-abs-inequality-basic",
            ),
            question_row(
                id_="q-j2-4-1-word05-012",
                title="整數解個數（進階04）",
                chapter_code="j2-4-1",
                difficulty="進階",
                question_text=r"若 $-1<\frac{x-2}{3}\le2$，求整數解共有幾個。",
                answer_text="9 個",
                explanation_text=r"化簡得 $-1<x\le8$，整數為 $0,1,\ldots,8$ 共 9 個。",
                topic_id="j2-4-1-chain-inequality",
            ),
        ]
    )

    rows.extend(
        [
            question_row(
                id_="q-j2-4-2-word05-013",
                title="預算列式（基礎01）",
                chapter_code="j2-4-2",
                difficulty="基礎",
                question_text="一本筆記本 45 元，預算 300 元，最多可買 $x$ 本，列出並求 $x$。",
                answer_text=r"$x\le6$",
                explanation_text=r"$45x\le300\Rightarrow x\le\frac{20}{3}$，取整數最大值為 6。",
                topic_id="j2-4-2-budget-limit",
            ),
            question_row(
                id_="q-j2-4-2-word05-014",
                title="時間下限（基礎02）",
                chapter_code="j2-4-2",
                difficulty="基礎",
                question_text="每分鐘走 80 公尺，至少要走 1200 公尺，需走 $t$ 分鐘，求 $t$ 範圍。",
                answer_text=r"$t\ge15$",
                explanation_text=r"$80t\ge1200\Rightarrow t\ge15$。",
                topic_id="j2-4-2-distance-time",
            ),
            question_row(
                id_="q-j2-4-2-word05-015",
                title="周長限制（基礎03）",
                chapter_code="j2-4-2",
                difficulty="基礎",
                question_text=r"長方形長為 $x$、寬為 7，若周長不超過 40，求 $x$ 範圍。",
                answer_text=r"$x\le13$",
                explanation_text=r"$2(x+7)\le40\Rightarrow x+7\le20\Rightarrow x\le13$。",
                topic_id="j2-4-2-word-to-inequality",
            ),
            question_row(
                id_="q-j2-4-2-word05-016",
                title="平均成績（基礎04）",
                chapter_code="j2-4-2",
                difficulty="基礎",
                question_text="三次測驗平均至少 75 分，前兩次為 70、80，第三次為 $x$，求 $x$ 範圍。",
                answer_text=r"$x\ge75$",
                explanation_text=r"$\frac{70+80+x}{3}\ge75\Rightarrow150+x\ge225\Rightarrow x\ge75$。",
                topic_id="j2-4-2-word-to-inequality",
            ),
            question_row(
                id_="q-j2-4-2-word05-017",
                title="方案費用上限（中等01）",
                chapter_code="j2-4-2",
                difficulty="中等",
                question_text="計程車資為起跳 85 元加每公里 25 元，預算 260 元，最多可搭 $k$ 公里，求 $k$。",
                answer_text=r"$k\le7$",
                explanation_text=r"$85+25k\le260\Rightarrow25k\le175\Rightarrow k\le7$。",
                topic_id="j2-4-2-budget-limit",
            ),
            question_row(
                id_="q-j2-4-2-word05-018",
                title="週數下限（中等02）",
                chapter_code="j2-4-2",
                difficulty="中等",
                question_text="原有 350 元，每週存 120 元，至少達到 1190 元需 $w$ 週，求 $w$ 範圍。",
                answer_text=r"$w\ge7$",
                explanation_text=r"$350+120w\ge1190\Rightarrow120w\ge840\Rightarrow w\ge7$。",
                topic_id="j2-4-2-distance-time",
            ),
            question_row(
                id_="q-j2-4-2-word05-019",
                title="每人金額（中等03）",
                chapter_code="j2-4-2",
                difficulty="中等",
                question_text="32 人分攤班費至少 1000 元，每人繳 $x$ 元，求最小整數 $x$。",
                answer_text="32",
                explanation_text=r"$32x\ge1000\Rightarrow x\ge31.25$，故最小整數為 32。",
                topic_id="j2-4-2-integer-filter",
            ),
            question_row(
                id_="q-j2-4-2-word05-020",
                title="三角形邊長範圍（中等04）",
                chapter_code="j2-4-2",
                difficulty="中等",
                question_text=r"三角形三邊為 8、13、$x$，求 $x$ 的範圍。",
                answer_text=r"$5<x<21$",
                explanation_text=r"由三角形不等式得 $|13-8|<x<13+8$，所以 $5<x<21$。",
                topic_id="j2-4-2-condition-intersection",
            ),
            question_row(
                id_="q-j2-4-2-word05-021",
                title="雙條件交集（進階01）",
                chapter_code="j2-4-2",
                difficulty="進階",
                question_text=r"某商品折後價 $x$ 元需同時滿足 $x>200$ 與 $3x\le900$，求 $x$ 範圍。",
                answer_text=r"$200<x\le300$",
                explanation_text=r"由第二式得 $x\le300$，與 $x>200$ 取交集。",
                topic_id="j2-4-2-condition-intersection",
            ),
            question_row(
                id_="q-j2-4-2-word05-022",
                title="整數區間（進階02）",
                chapter_code="j2-4-2",
                difficulty="進階",
                question_text=r"每天讀 $x$ 頁，12 天共讀頁數至少 150 且不超過 210，求整數 $x$ 範圍。",
                answer_text=r"$13\le x\le17$",
                explanation_text=r"$150\le12x\le210\Rightarrow12.5\le x\le17.5$，整數解為 $13$ 到 $17$。",
                topic_id="j2-4-2-integer-filter",
            ),
            question_row(
                id_="q-j2-4-2-word05-023",
                title="量測區間反推（進階03）",
                chapter_code="j2-4-2",
                difficulty="進階",
                question_text=r"若 $2t-3$ 介於 5 到 17（含端點），求 $t$ 範圍。",
                answer_text=r"$4\le t\le10$",
                explanation_text=r"$5\le2t-3\le17\Rightarrow8\le2t\le20\Rightarrow4\le t\le10$。",
                topic_id="j2-4-2-condition-intersection",
            ),
            question_row(
                id_="q-j2-4-2-word05-024",
                title="方案比較最小值（進階04）",
                chapter_code="j2-4-2",
                difficulty="進階",
                question_text=r"若方案 A：$5x+40$，方案 B：$8x-20$，且要滿足 A 不貴於 B，求最小正整數 $x$。",
                answer_text="20",
                explanation_text=r"$5x+40\le8x-20\Rightarrow60\le3x\Rightarrow x\ge20$，最小正整數為 20。",
                topic_id="j2-4-2-answer-check",
            ),
        ]
    )

    return rows


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
            "topic_question_link_output": link_out,
            "web_sync_code": sync_code,
            "web_sync_output": sync_out,
        },
        "samples": {
            "topics": [x for x in topic_rows if x.get("id") in topic_ids][:3],
            "questions": [x for x in question_rows if x.get("id") in question_ids][:3],
        },
    }

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
