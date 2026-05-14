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

SOURCE_WORD = r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國一下1  二元一次聯立方程式.docx"
SUMMARY_WORD = str(ROOT / "exports" / "word-j2-1-1-2-3" / "改國一下1_二元一次聯立方程式_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j2-1-1": "二元一次方程式",
    "j2-1-2": "二元一次聯立方程式",
    "j2-1-3": "二元一次方程式應用問題",
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


def load_json(path: Path) -> Dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: Dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def backup_file(path: Path) -> str:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j2-1-1-2-3-{ts}{path.suffix}"
    shutil.copy2(path, backup_path)
    return str(backup_path)


def upsert_records(records: List[Dict], additions: List[Dict]) -> Tuple[List[Dict], int, int]:
    idx = {str(item.get("id", "")).strip(): i for i, item in enumerate(records)}
    created = 0
    updated = 0
    for row in additions:
        rid = str(row.get("id", "")).strip()
        if not rid:
            continue
        if rid in idx:
            records[idx[rid]] = row
            updated += 1
        else:
            records.append(row)
            idx[rid] = len(records) - 1
            created += 1
    return records, created, updated


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
        for f in fields:
            v = row.get(f, None)
            if v is None:
                missing.append(f)
                continue
            if isinstance(v, str) and not v.strip():
                missing.append(f)
                continue
            if isinstance(v, list) and len(v) == 0:
                missing.append(f)
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
    is_branch: bool = False,
) -> Dict:
    chapter = CHAPTER_NAME[chapter_code]
    chapter_order = {"j2-1-1": 1, "j2-1-2": 2, "j2-1-3": 3}[chapter_code]
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "國中",
        "grade": "國二",
        "term": "下學期",
        "chapter": chapter,
        "section": chapter,
        "chapterCode": chapter_code,
        "chapterOrder": chapter_order,
        "stageOrder": 1,
        "gradeOrder": 2,
        "termOrder": 2,
        "gradeLabel": "國二下",
        "domain": "代數",
        "domainSub": "",
        "chapterRole": chapter_role,
        "difficulty": difficulty,
        "parentId": parent_id,
        "isBranch": is_branch,
        "contentTypes": ["重點式", "公式與性質", "典型題型", "易錯陷阱"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "tags": ["word匯入", "教學核心", chapter_code, chapter],
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes + [f"來源：{SOURCE_REF}"],
        "mistakes": mistakes,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "originalIndex": 999210,
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
    rows = []

    # j2-1-1
    rows.append(
        topic_row(
            id_="j2-1-1-two-variable-equation-main",
            title="二元一次方程式核心觀念",
            chapter_code="j2-1-1",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("標準形式", r"$ax+by=c$（$a,b$ 不同時為 0）"),
                ("解的意義", r"數對 $(x,y)$ 代入後使等式成立"),
            ],
            usage=["本章入口：先學會列式與檢查。"],
            examples=[r"$5x-4y+2=0$ 是二元一次方程式。"],
            tips=["二元一次方程式通常不是找唯一答案，而是理解數對關係。"],
            notes=["對應講義：二元一次式列式與定義。"],
            mistakes=["把一元一次方程式觀念硬套成只會有一組解。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-1-ordered-pair-check",
            title="數對代入與成立判斷",
            chapter_code="j2-1-1",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j2-1-1-two-variable-equation-main",
            is_branch=True,
            formula_lines=[
                ("判斷", r"把 $(x,y)$ 同時代入左右兩邊比較是否相等"),
                ("注意", r"必須同時滿足完整方程式"),
            ],
            usage=["判斷數對是否為方程式解。"],
            examples=[r"檢查 $(2,3)$ 是否滿足 $4x-y=5$。"],
            tips=["先分開算左右兩邊，可減少抄錯。"],
            notes=["對應講義：代入檢查練習。"],
            mistakes=["只代一個未知數就判定成立。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-1-context-to-equation",
            title="情境轉二元一次方程式",
            chapter_code="j2-1-1",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j2-1-1-two-variable-equation-main",
            is_branch=True,
            formula_lines=[
                ("單價模型", r"$p_1x+p_2y=\text{總價}$"),
                ("數字模型", r"十位 $x$、個位 $y$ 時，原數 $=10x+y$"),
            ],
            usage=["硬幣、商品、數字題列式。"],
            examples=[r"5 元與 10 元硬幣共 225 元可列 $5x+10y=225$。"],
            tips=["先定義未知數，再把每句中文逐句翻成數學式。"],
            notes=["對應講義：大量列式題。"],
            mistakes=["把未知數意義寫反。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-1-expression-simplify",
            title="二元一次式化簡",
            chapter_code="j2-1-1",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j2-1-1-two-variable-equation-main",
            is_branch=True,
            formula_lines=[
                ("合併同類項", r"$ax+bx=(a+b)x,\ ay+by=(a+b)y$"),
                ("分配律", r"$k(ax+by+c)=kax+kby+kc$"),
            ],
            usage=["列式後整理成標準型。"],
            examples=[r"$3(2x-y)-2(x+4y)+5=4x-11y+5$。"],
            tips=["先展開括號，再分別整理 $x$ 項、$y$ 項與常數。"],
            notes=["對應講義：化簡題組。"],
            mistakes=["把 $x$ 項與 $y$ 項混在一起合併。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-1-parameter-substitution",
            title="參數題代入求係數",
            chapter_code="j2-1-1",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j2-1-1-two-variable-equation-main",
            is_branch=True,
            formula_lines=[
                ("概念", r"已知解代入方程可得到含參數的一元方程"),
                ("流程", r"先代入 $x,y$，再解出參數 $a,b,\ldots$"),
            ],
            usage=["已知數對為解，反求係數。"],
            examples=[r"若 $(-1,2)$ 是 $6x=ay+4$ 的解，可求 $a=-5$。"],
            tips=["代入後先做整數運算，再移項。"],
            notes=["對應講義：代參數題。"],
            mistakes=["代入時遺漏負號。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-1-equivalent-transform",
            title="等值變形與標準型",
            chapter_code="j2-1-1",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j2-1-1-two-variable-equation-main",
            is_branch=True,
            formula_lines=[
                ("等值變形", r"方程兩邊同乘（除）非零常數，解集合不變"),
                ("標準型", r"整理為 $Ax+By=C$ 方便比較"),
            ],
            usage=["判斷同解方程式、化簡方程式。"],
            examples=[r"$-3x+6y=12 \Rightarrow x-2y=-4$。"],
            tips=["除法前先確認係數有共同因數。"],
            notes=["對應講義：同解與化簡段。"],
            mistakes=["把兩邊只除到部分項。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-1-integer-constraint",
            title="整數解與情境限制",
            chapter_code="j2-1-1",
            chapter_role="易錯陷阱",
            difficulty="進階",
            parent_id="j2-1-1-two-variable-equation-main",
            is_branch=True,
            formula_lines=[
                ("整數限制", r"$x,y\in\mathbb{Z}$ 或 $x,y\in\mathbb{N}$"),
                ("情境限制", r"人數、件數、金額通常需非負"),
            ],
            usage=["從無限多組解中篩選可行答案。"],
            examples=[r"$5x+10y=40$ 的非負整數解需另外篩選。"],
            tips=["先找代數通解，再套題意限制。"],
            notes=["對應講義：郵票、硬幣限制題。"],
            mistakes=["算出負數件數仍當答案。"],
        )
    )

    # j2-1-2
    rows.append(
        topic_row(
            id_="j2-1-2-system-main",
            title="二元一次聯立方程式核心觀念",
            chapter_code="j2-1-2",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("形式", r"$\begin{cases}a_1x+b_1y=c_1\\a_2x+b_2y=c_2\end{cases}$"),
                ("解", r"同時使兩式成立的 $(x,y)$"),
            ],
            usage=["本章入口：理解『同時成立』。"],
            examples=[r"$\begin{cases}x+y=9\\x-y=1\end{cases}$ 有唯一解。"],
            tips=["聯立的答案一定要回代兩式都成立。"],
            notes=["對應講義：聯立方程式定義。"],
            mistakes=["只驗算其中一條方程。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-2-substitution-method",
            title="代入消去法",
            chapter_code="j2-1-2",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j2-1-2-system-main",
            is_branch=True,
            formula_lines=[
                ("步驟", r"由一式解出一變數，再代入另一式"),
                ("適用", r"當某式已接近 $x=\cdots$ 或 $y=\cdots$ 時"),
            ],
            usage=["快速處理可直接表達單一未知數的題目。"],
            examples=[r"$\begin{cases}y=2x+1\\3x-y=5\end{cases}$。"],
            tips=["代入前先加括號，避免負號錯誤。"],
            notes=["對應講義：代入消去法題組。"],
            mistakes=["代入時只代入部分項。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-2-elimination-method",
            title="加減消去法",
            chapter_code="j2-1-2",
            chapter_role="重要配角",
            difficulty="中等",
            parent_id="j2-1-2-system-main",
            is_branch=True,
            formula_lines=[
                ("步驟", r"先調整係數，再相加/相減消去一未知數"),
                ("技巧", r"先找最小公倍數可減少計算量"),
            ],
            usage=["兩式都不易直接代入時。"],
            examples=[r"$\begin{cases}2x+3y=12\\4x-3y=6\end{cases}$。"],
            tips=["決定加或減前，先看同號或異號。"],
            notes=["對應講義：加減消去法題組。"],
            mistakes=["倍數放大後忘記每一項都乘到。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-2-method-selection",
            title="解法選擇策略",
            chapter_code="j2-1-2",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j2-1-2-system-main",
            is_branch=True,
            formula_lines=[
                ("代入優先", r"某式已是 $x=\cdots$ 或係數為 $\pm1$"),
                ("消去優先", r"係數接近或可快速倍乘後相消"),
            ],
            usage=["考場中加速判斷解題路線。"],
            examples=[r"$\begin{cases}x+2y=7\\3x-y=5\end{cases}$ 適合先代入或先消去。"],
            tips=["先看式子形狀，再決定方法，不必固定只用一種。"],
            notes=["教學用決策主題。"],
            mistakes=["強迫用不順手方法導致計算爆量。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-2-fraction-coefficients",
            title="分數與小數係數聯立",
            chapter_code="j2-1-2",
            chapter_role="分支題型",
            difficulty="進階",
            parent_id="j2-1-2-system-main",
            is_branch=True,
            formula_lines=[
                ("去分母", r"兩式可同乘最小公倍數化為整係數"),
                ("去小數", r"可同乘 $10^n$ 消除小數點"),
            ],
            usage=["分數/小數係數題穩定化。"],
            examples=[r"$\frac{x}{2}+\frac{y}{3}=3,\ \frac{x}{2}-\frac{y}{3}=1$。"],
            tips=["先整理係數，再做消去，容易保持正確。"],
            notes=["對應講義：分數聯立題。"],
            mistakes=["只對一式去分母，另一式忘記同步處理。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-2-solution-types",
            title="解的型態判斷",
            chapter_code="j2-1-2",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j2-1-2-system-main",
            is_branch=True,
            formula_lines=[
                ("唯一解", r"兩直線相交於一點"),
                ("無解", r"係數比例相同但常數比例不同"),
                ("無限多解", r"三組比例都相同"),
            ],
            usage=["不用完整求解也能快速判型。"],
            examples=[r"$\begin{cases}x+y=2\\2x+2y=5\end{cases}$ 為無解。"],
            tips=["先比對係數比例可快速篩型。"],
            notes=["對應講義：唯一/無解/無限多解。"],
            mistakes=["把無限多解誤判成無解。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-2-gaussian-intro",
            title="高斯消去法入門",
            chapter_code="j2-1-2",
            chapter_role="分支題型",
            difficulty="進階",
            parent_id="j2-1-2-system-main",
            is_branch=True,
            formula_lines=[
                ("核心", r"列運算把方程組化成較容易回代的形式"),
                ("關係", r"本質與加減消去法一致"),
            ],
            usage=["係數複雜或三元延伸前的準備。"],
            examples=[r"$\begin{cases}x+y=3\\2x-y=0\end{cases}$ 可視為 2×2 列運算。"],
            tips=["保持每一步等價變形，可避免失去原解。"],
            notes=["對應講義：高斯消去法段落。"],
            mistakes=["任意交換或倍乘時忘記同步記錄。"],
        )
    )

    # j2-1-3
    rows.append(
        topic_row(
            id_="j2-1-3-word-problem-main",
            title="應用題建模總流程",
            chapter_code="j2-1-3",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("四步驟", r"設未知數 $\to$ 列兩式 $\to$ 聯立求解 $\to$ 驗算"),
                ("檢核", r"答案需符合數量、範圍、單位限制"),
            ],
            usage=["所有文字題統一解題骨架。"],
            examples=[r"先設汽水單價 $x$、果汁單價 $y$。"],
            tips=["每句條件都應該在方程式中找到對應位置。"],
            notes=["對應講義：解題方法總整。"],
            mistakes=["沒有先定義未知數就直接計算。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-3-price-quantity-model",
            title="價格與數量模型",
            chapter_code="j2-1-3",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j2-1-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("基本式", r"件數方程 + 金額方程"),
                ("範式", r"$\begin{cases}ax+by=T_1\\cx+dy=T_2\end{cases}$"),
            ],
            usage=["購物、票價、套餐題。"],
            examples=[r"$3x+2y=210,\ 2x+3y=190$。"],
            tips=["先看兩次購買中係數交換，常可快速消去。"],
            notes=["對應講義：餅乾飲料與商品題。"],
            mistakes=["把數量與單價對錯商品。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-3-chicken-rabbit-model",
            title="雞兔同籠與頭腳模型",
            chapter_code="j2-1-3",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j2-1-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("頭數", r"$x+y=H$"),
                ("腳數", r"$2x+4y=L$"),
            ],
            usage=["頭腳、桌椅腳等結構相同的應用題。"],
            examples=[r"頭 35、腳 110。"],
            tips=["先寫頭數再寫腳數，式子最不易錯。"],
            notes=["對應講義：雞兔同籠。"],
            mistakes=["把兔腳寫成 2。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-3-age-money-model",
            title="年齡與收支模型",
            chapter_code="j2-1-3",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j2-1-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("年齡差", r"兩人年齡差固定"),
                ("收支式", r"收入-支出=結餘"),
            ],
            usage=["年齡對話題、金錢分配題。"],
            examples=[r"$\begin{cases}x-y=8\\x+y=40\end{cases}$。"],
            tips=["先抓『差』再抓『和』，常可直接聯立。"],
            notes=["對應講義：年齡與金錢題。"],
            mistakes=["把『幾年後』條件錯套在兩人之一。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-3-digit-number-model",
            title="數字與位值模型",
            chapter_code="j2-1-3",
            chapter_role="分支題型",
            difficulty="進階",
            parent_id="j2-1-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("位值", r"十位 $x$、個位 $y$，原數 $10x+y$"),
                ("倒序", r"倒序數 $10y+x$"),
            ],
            usage=["兩位數交換、數字和差題。"],
            examples=[r"$x+y=11,\ (10x+y)-(10y+x)=45$。"],
            tips=["先寫位值式，再代題目關係。"],
            notes=["對應講義：數字題。"],
            mistakes=["把原數寫成 $x+y$。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-3-rate-distance-model",
            title="速率與距離模型",
            chapter_code="j2-1-3",
            chapter_role="分支題型",
            difficulty="進階",
            parent_id="j2-1-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("基本式", r"$\text{距離}=\text{速率}\times\text{時間}$"),
                ("順逆流", r"順流 $=v+u$，逆流 $=v-u$"),
            ],
            usage=["水流、追及、相遇題。"],
            examples=[r"$\begin{cases}v+u=18\\v-u=6\end{cases}$。"],
            tips=["先統一時間與距離單位。"],
            notes=["對應講義：速率應用題。"],
            mistakes=["分鐘與小時混算未換單位。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-1-3-validate-answer",
            title="答案合理性檢核",
            chapter_code="j2-1-3",
            chapter_role="易錯陷阱",
            difficulty="基礎",
            parent_id="j2-1-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("代回檢查", r"解得 $(x,y)$ 要代回兩式"),
                ("情境檢查", r"人數、價格、長度通常不可為負"),
            ],
            usage=["避免算對方程卻答錯題意。"],
            examples=[r"若解得 $y=-14$（人），需判為不合理。"],
            tips=["最後 10 秒一定做『代回 + 語意』雙檢查。"],
            notes=["對應講義：應用題收尾檢核。"],
            mistakes=["看到代數可解就直接交卷。"],
        )
    )

    return rows


def build_questions() -> List[Dict]:
    rows = []

    # j2-1-1 (12)
    rows.extend(
        [
            question_row(
                id_="q-j2-1-1-word01-001",
                title="數對判斷（基礎01）",
                chapter_code="j2-1-1",
                difficulty="基礎",
                question_text=r"判斷數對 $(2,3)$ 是否為方程式 $4x-y=5$ 的解。",
                answer_text="是",
                explanation_text=r"代入得 $4(2)-3=5$，成立。",
                topic_id="j2-1-1-ordered-pair-check",
            ),
            question_row(
                id_="q-j2-1-1-word01-002",
                title="數對判斷（基礎02）",
                chapter_code="j2-1-1",
                difficulty="基礎",
                question_text=r"判斷數對 $(2,2)$ 是否為方程式 $3x+2y=12$ 的解。",
                answer_text="不是",
                explanation_text=r"代入得 $3(2)+2(2)=10\neq 12$。",
                topic_id="j2-1-1-ordered-pair-check",
            ),
            question_row(
                id_="q-j2-1-1-word01-003",
                title="情境列式（基礎03）",
                chapter_code="j2-1-1",
                difficulty="基礎",
                question_text="5 元硬幣有 $x$ 個、10 元硬幣有 $y$ 個，共 225 元，列出方程式。",
                answer_text=r"$5x+10y=225$",
                explanation_text="總金額 = 各面額乘數量後相加。",
                topic_id="j2-1-1-context-to-equation",
            ),
            question_row(
                id_="q-j2-1-1-word01-004",
                title="位值列式（基礎04）",
                chapter_code="j2-1-1",
                difficulty="基礎",
                question_text="若十位數字為 $x$、個位數字為 $y$，原兩位數應如何表示？",
                answer_text=r"$10x+y$",
                explanation_text="十位權重為 10、個位權重為 1。",
                topic_id="j2-1-1-context-to-equation",
            ),
            question_row(
                id_="q-j2-1-1-word01-005",
                title="化簡運算（中等01）",
                chapter_code="j2-1-1",
                difficulty="中等",
                question_text=r"化簡：$3(2x-y)-2(x+4y)+5$。",
                answer_text=r"$4x-11y+5$",
                explanation_text=r"展開後合併同類項：$6x-3y-2x-8y+5$。",
                topic_id="j2-1-1-expression-simplify",
            ),
            question_row(
                id_="q-j2-1-1-word01-006",
                title="化簡運算（中等02）",
                chapter_code="j2-1-1",
                difficulty="中等",
                question_text=r"化簡：$-2(3x-4y+5)+3(x-y-2)$。",
                answer_text=r"$-3x+5y-16$",
                explanation_text=r"展開後得 $-6x+8y-10+3x-3y-6$。",
                topic_id="j2-1-1-expression-simplify",
            ),
            question_row(
                id_="q-j2-1-1-word01-007",
                title="參數代入（中等03）",
                chapter_code="j2-1-1",
                difficulty="中等",
                question_text=r"若 $(-1,2)$ 是方程式 $6x=ay+4$ 的解，求 $a$。",
                answer_text=r"$a=-5$",
                explanation_text=r"$6(-1)=2a+4\Rightarrow -6=2a+4\Rightarrow a=-5$。",
                topic_id="j2-1-1-parameter-substitution",
            ),
            question_row(
                id_="q-j2-1-1-word01-008",
                title="參數聯立（中等04）",
                chapter_code="j2-1-1",
                difficulty="中等",
                question_text=r"若 $(2,3)$ 是 $ax+by=13$ 的解，且 $a+b=5$，求 $(a,b)$。",
                answer_text=r"$(2,3)$",
                explanation_text=r"代入得 $2a+3b=13$，再與 $a+b=5$ 聯立得 $a=2,b=3$。",
                topic_id="j2-1-1-parameter-substitution",
            ),
            question_row(
                id_="q-j2-1-1-word01-009",
                title="整數限制（進階01）",
                chapter_code="j2-1-1",
                difficulty="進階",
                question_text=r"求 $5x+10y=40$ 的所有非負整數解 $(x,y)$。",
                answer_text=r"$(8,0),(6,1),(4,2),(2,3),(0,4)$",
                explanation_text=r"化為 $x+2y=8$，令 $y=0,1,2,3,4$ 即可。",
                topic_id="j2-1-1-integer-constraint",
            ),
            question_row(
                id_="q-j2-1-1-word01-010",
                title="等值變形（進階02）",
                chapter_code="j2-1-1",
                difficulty="進階",
                question_text=r"將方程式 $-3x+6y=12$ 化為較簡標準型。",
                answer_text=r"$x-2y=-4$",
                explanation_text=r"兩邊同除以 $-3$。",
                topic_id="j2-1-1-equivalent-transform",
            ),
            question_row(
                id_="q-j2-1-1-word01-011",
                title="多組解列舉（進階03）",
                chapter_code="j2-1-1",
                difficulty="進階",
                question_text=r"請寫出三組滿足 $2x+3y=12$ 的整數解。",
                answer_text=r"例如 $(6,0),(3,2),(0,4)$",
                explanation_text=r"代入檢查皆滿足 $2x+3y=12$。",
                topic_id="j2-1-1-two-variable-equation-main",
            ),
            question_row(
                id_="q-j2-1-1-word01-012",
                title="代值求未知（進階04）",
                chapter_code="j2-1-1",
                difficulty="進階",
                question_text=r"若方程式 $4x+2y=10$ 中 $x=\frac{1}{2}$，求 $y$。",
                answer_text=r"$y=4$",
                explanation_text=r"$4\cdot\frac{1}{2}+2y=10\Rightarrow 2+2y=10\Rightarrow y=4$。",
                topic_id="j2-1-1-ordered-pair-check",
            ),
        ]
    )

    # j2-1-2 (12)
    rows.extend(
        [
            question_row(
                id_="q-j2-1-2-word01-013",
                title="代入消去（基礎01）",
                chapter_code="j2-1-2",
                difficulty="基礎",
                question_text=r"解聯立：$\begin{cases}x+y=9\\x-y=1\end{cases}$。",
                answer_text=r"$x=5,\ y=4$",
                explanation_text=r"兩式相加得 $2x=10$，回代得 $y=4$。",
                topic_id="j2-1-2-substitution-method",
            ),
            question_row(
                id_="q-j2-1-2-word01-014",
                title="代入消去（基礎02）",
                chapter_code="j2-1-2",
                difficulty="基礎",
                question_text=r"解聯立：$\begin{cases}y=2x+1\\3x-y=5\end{cases}$。",
                answer_text=r"$x=6,\ y=13$",
                explanation_text=r"代入得 $3x-(2x+1)=5\Rightarrow x=6$，再得 $y=13$。",
                topic_id="j2-1-2-substitution-method",
            ),
            question_row(
                id_="q-j2-1-2-word01-015",
                title="加減消去（基礎03）",
                chapter_code="j2-1-2",
                difficulty="基礎",
                question_text=r"解聯立：$\begin{cases}2x+3y=12\\4x-3y=6\end{cases}$。",
                answer_text=r"$x=3,\ y=2$",
                explanation_text=r"兩式相加得 $6x=18$，回代得 $y=2$。",
                topic_id="j2-1-2-elimination-method",
            ),
            question_row(
                id_="q-j2-1-2-word01-016",
                title="加減消去（中等01）",
                chapter_code="j2-1-2",
                difficulty="中等",
                question_text=r"解聯立：$\begin{cases}5x+2y=19\\3x-2y=5\end{cases}$。",
                answer_text=r"$x=3,\ y=2$",
                explanation_text=r"相加得 $8x=24$，再回代得 $y=2$。",
                topic_id="j2-1-2-elimination-method",
            ),
            question_row(
                id_="q-j2-1-2-word01-017",
                title="分數係數（中等02）",
                chapter_code="j2-1-2",
                difficulty="中等",
                question_text=r"解聯立：$\begin{cases}\frac{x}{2}+\frac{y}{3}=3\\\frac{x}{2}-\frac{y}{3}=1\end{cases}$。",
                answer_text=r"$x=4,\ y=3$",
                explanation_text=r"相加得 $x=4$，回代 $\frac{4}{2}+\frac{y}{3}=3$ 得 $y=3$。",
                topic_id="j2-1-2-fraction-coefficients",
            ),
            question_row(
                id_="q-j2-1-2-word01-018",
                title="小數係數（中等03）",
                chapter_code="j2-1-2",
                difficulty="中等",
                question_text=r"解聯立：$\begin{cases}0.2x+0.1y=1.3\\0.3x-0.1y=0.2\end{cases}$。",
                answer_text=r"$x=3,\ y=7$",
                explanation_text=r"可同乘 10 化為 $\begin{cases}2x+y=13\\3x-y=2\end{cases}$，相加得 $x=3$。",
                topic_id="j2-1-2-fraction-coefficients",
            ),
            question_row(
                id_="q-j2-1-2-word01-019",
                title="解型態判斷（中等04）",
                chapter_code="j2-1-2",
                difficulty="中等",
                question_text=r"判斷聯立 $\begin{cases}x+y=2\\2x+2y=5\end{cases}$ 的解型態。",
                answer_text="無解",
                explanation_text=r"前式乘 2 得 $2x+2y=4$，與第二式矛盾。",
                topic_id="j2-1-2-solution-types",
            ),
            question_row(
                id_="q-j2-1-2-word01-020",
                title="解型態判斷（中等05）",
                chapter_code="j2-1-2",
                difficulty="中等",
                question_text=r"判斷聯立 $\begin{cases}x-2y=4\\2x-4y=8\end{cases}$ 的解型態。",
                answer_text="無限多組解",
                explanation_text=r"第二式為第一式的 2 倍，兩式同一直線。",
                topic_id="j2-1-2-solution-types",
            ),
            question_row(
                id_="q-j2-1-2-word01-021",
                title="解型態判斷（進階01）",
                chapter_code="j2-1-2",
                difficulty="進階",
                question_text=r"聯立 $\begin{cases}x+2y=7\\3x-y=5\end{cases}$ 屬於哪一種解型態？",
                answer_text="唯一解",
                explanation_text=r"兩式係數比例不相同，故相交於一點。",
                topic_id="j2-1-2-solution-types",
            ),
            question_row(
                id_="q-j2-1-2-word01-022",
                title="參數聯立（進階02）",
                chapter_code="j2-1-2",
                difficulty="進階",
                question_text=r"若 $(3,2)$ 是聯立 $\begin{cases}x+my=5\\x-y=1\end{cases}$ 的解，求 $m$。",
                answer_text=r"$m=1$",
                explanation_text=r"代入第一式：$3+2m=5\Rightarrow m=1$。",
                topic_id="j2-1-2-system-main",
            ),
            question_row(
                id_="q-j2-1-2-word01-023",
                title="高斯入門（進階03）",
                chapter_code="j2-1-2",
                difficulty="進階",
                question_text=r"用消去觀念解聯立：$\begin{cases}x+y=3\\2x-y=0\end{cases}$。",
                answer_text=r"$x=1,\ y=2$",
                explanation_text=r"兩式相加得 $3x=3$，回代得 $y=2$。",
                topic_id="j2-1-2-gaussian-intro",
            ),
            question_row(
                id_="q-j2-1-2-word01-024",
                title="方法選擇（進階04）",
                chapter_code="j2-1-2",
                difficulty="進階",
                question_text=r"聯立 $\begin{cases}x=4-2y\\3x-y=5\end{cases}$ 較適合先用哪種方法？並求解。",
                answer_text=r"代入消去法；$x=2,\ y=1$",
                explanation_text=r"第一式已寫成 $x=\cdots$，代入第二式可快速求得。",
                topic_id="j2-1-2-method-selection",
            ),
        ]
    )

    # j2-1-3 (12)
    rows.extend(
        [
            question_row(
                id_="q-j2-1-3-word01-025",
                title="價格模型（基礎01）",
                chapter_code="j2-1-3",
                difficulty="基礎",
                question_text="汽水單價 $x$ 元、綠茶單價 $y$ 元。若 3 瓶汽水與 2 瓶綠茶共 210 元，2 瓶汽水與 3 瓶綠茶共 190 元，求 $(x,y)$。",
                answer_text=r"$x=50,\ y=30$",
                explanation_text=r"聯立 $\begin{cases}3x+2y=210\\2x+3y=190\end{cases}$ 解得。",
                topic_id="j2-1-3-price-quantity-model",
            ),
            question_row(
                id_="q-j2-1-3-word01-026",
                title="雞兔同籠（基礎02）",
                chapter_code="j2-1-3",
                difficulty="基礎",
                question_text="雞兔同籠，頭共 35、腳共 110，求雞兔各幾隻。",
                answer_text="雞 15 隻，兔 20 隻",
                explanation_text=r"$\begin{cases}x+y=35\\2x+4y=110\end{cases}$，解得 $(x,y)=(15,20)$。",
                topic_id="j2-1-3-chicken-rabbit-model",
            ),
            question_row(
                id_="q-j2-1-3-word01-027",
                title="年齡模型（中等01）",
                chapter_code="j2-1-3",
                difficulty="中等",
                question_text="甲比乙大 8 歲，兩人年齡和為 40 歲，求甲乙年齡。",
                answer_text="甲 24 歲，乙 16 歲",
                explanation_text=r"$\begin{cases}x-y=8\\x+y=40\end{cases}$ 解得。",
                topic_id="j2-1-3-age-money-model",
            ),
            question_row(
                id_="q-j2-1-3-word01-028",
                title="數字模型（中等02）",
                chapter_code="j2-1-3",
                difficulty="中等",
                question_text="某兩位數十位與個位和為 11，且原數比倒序數大 45，求原數。",
                answer_text="83",
                explanation_text=r"$\begin{cases}x+y=11\\(10x+y)-(10y+x)=45\end{cases}$ 得 $x=8,y=3$。",
                topic_id="j2-1-3-digit-number-model",
            ),
            question_row(
                id_="q-j2-1-3-word01-029",
                title="速率模型（中等03）",
                chapter_code="j2-1-3",
                difficulty="中等",
                question_text="某船順流速率每小時 18 公里、逆流速率每小時 6 公里，求靜水船速與水流速率。",
                answer_text="船速 12 公里/時，水流 6 公里/時",
                explanation_text=r"$\begin{cases}v+u=18\\v-u=6\end{cases}$ 解得 $(v,u)=(12,6)$。",
                topic_id="j2-1-3-rate-distance-model",
            ),
            question_row(
                id_="q-j2-1-3-word01-030",
                title="長寬模型（中等04）",
                chapter_code="j2-1-3",
                difficulty="中等",
                question_text="長方形長與寬和為 25 公分，長比寬多 7 公分，求長寬。",
                answer_text="長 16 公分，寬 9 公分",
                explanation_text=r"$\begin{cases}x+y=25\\x-y=7\end{cases}$ 解得。",
                topic_id="j2-1-3-word-problem-main",
            ),
            question_row(
                id_="q-j2-1-3-word01-031",
                title="硬幣模型（中等05）",
                chapter_code="j2-1-3",
                difficulty="中等",
                question_text="5 元與 10 元硬幣共 30 枚、總額 220 元，求兩種硬幣各幾枚。",
                answer_text="5 元 16 枚，10 元 14 枚",
                explanation_text=r"$\begin{cases}x+y=30\\5x+10y=220\end{cases}$ 解得 $(x,y)=(16,14)$。",
                topic_id="j2-1-3-price-quantity-model",
            ),
            question_row(
                id_="q-j2-1-3-word01-032",
                title="濃度模型（進階01）",
                chapter_code="j2-1-3",
                difficulty="進階",
                question_text=r"混合 30% 溶液 $x$ 公升與 60% 溶液 $y$ 公升共 20 公升，若混合後有 9 公升純液，求 $(x,y)$。",
                answer_text=r"$x=10,\ y=10$",
                explanation_text=r"$\begin{cases}x+y=20\\0.3x+0.6y=9\end{cases}$ 解得。",
                topic_id="j2-1-3-price-quantity-model",
            ),
            question_row(
                id_="q-j2-1-3-word01-033",
                title="票價模型（進階02）",
                chapter_code="j2-1-3",
                difficulty="進階",
                question_text="某活動成人票 80 元、學生票 60 元。共售 50 張、收入 3600 元，求成人與學生票張數。",
                answer_text="成人 30 張，學生 20 張",
                explanation_text=r"$\begin{cases}x+y=50\\80x+60y=3600\end{cases}$ 解得。",
                topic_id="j2-1-3-price-quantity-model",
            ),
            question_row(
                id_="q-j2-1-3-word01-034",
                title="合理性判斷（進階03）",
                chapter_code="j2-1-3",
                difficulty="進階",
                question_text=r"某人數題聯立後得到 $(x,y)=(26,-14)$。就題意（兩者都是人數）此解是否可接受？",
                answer_text="不可接受",
                explanation_text="人數不能是負數，需判定模型或條件不符情境。",
                topic_id="j2-1-3-validate-answer",
            ),
            question_row(
                id_="q-j2-1-3-word01-035",
                title="列聯立式（基礎03）",
                chapter_code="j2-1-3",
                difficulty="基礎",
                question_text="餅乾每包 $x$ 元、飲料每瓶 $y$ 元。若買 2 包餅乾與 1 瓶飲料共 85 元，買 1 包餅乾與 3 瓶飲料共 135 元，請列出聯立方程式。",
                answer_text=r"$\begin{cases}2x+y=85\\x+3y=135\end{cases}$",
                explanation_text="依兩次購買資料各寫一式。",
                topic_id="j2-1-3-word-problem-main",
            ),
            question_row(
                id_="q-j2-1-3-word01-036",
                title="大數小數（進階04）",
                chapter_code="j2-1-3",
                difficulty="進階",
                question_text="大數比小數大 12，且 2 倍大數比 3 倍小數大 6，求兩數。",
                answer_text="大數 30，小數 18",
                explanation_text=r"$\begin{cases}x-y=12\\2x-3y=6\end{cases}$ 解得 $(x,y)=(30,18)$。",
                topic_id="j2-1-3-age-money-model",
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

    topics, topic_created, topic_updated = upsert_records(topics, new_topics)
    questions, q_created, q_updated = upsert_records(questions, new_questions)

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
            "topics_skipped": 0,
            "questions_created": q_created,
            "questions_updated": q_updated,
            "questions_skipped": 0,
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
