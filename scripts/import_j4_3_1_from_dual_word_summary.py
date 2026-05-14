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

SOURCE_WORD_1 = (
    r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國二下2 簡單的幾何圖形.docx"
)
SOURCE_WORD_2 = (
    r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國二下5  三角形的內角與外角.docx"
)
SUMMARY_WORD = str(
    ROOT / "exports" / "word-j4-3-1" / "改國二下2_改國二下5_j4-3-1_重點整理.docx"
)
SOURCE_REF = (
    f"{Path(SOURCE_WORD_1).name} + {Path(SOURCE_WORD_2).name} -> {Path(SUMMARY_WORD).name}"
)

CHAPTER_NAME = {
    "j4-3-1": "三角形的基本性質",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j4-3-1-{ts}{path.suffix}"
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
        "tags": ["word匯入", "教學核心", chapter_code, chapter, "三角形與多邊形"],
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
            id_="j4-3-1-line-ray-segment",
            title="直線、射線與線段",
            chapter_code="j4-3-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("線段", r"$\overline{AB}$"),
                ("直線", r"$\overleftrightarrow{AB}$"),
            ],
            usage=["辨識圖形元素與基本符號。"],
            examples=["線段有兩端點；射線有一端點；直線兩端無限延伸。"],
            tips=["先辨識端點數，再判斷是線段、射線或直線。"],
            notes=["符號判讀常是後續證題前置。"],
            mistakes=["把射線與線段混淆。"],
        ),
        topic_row(
            id_="j4-3-1-angle-basic-type",
            title="角的分類與度數",
            chapter_code="j4-3-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("分類", r"$\text{銳角}<90^\circ,\ \text{直角}=90^\circ,\ \text{鈍角}>90^\circ$"),
                ("平角", r"$180^\circ$"),
            ],
            usage=["快速判斷角度是否合理。"],
            examples=[r"$120^\circ$ 是鈍角。"],
            tips=["畫圖後標註角度，避免內外角看錯。"],
            notes=["角分類是角度題起點。"],
            mistakes=[r"誤把 $90^\circ$ 歸類成銳角。"],
        ),
        topic_row(
            id_="j4-3-1-complement-supplement",
            title="餘角與補角",
            chapter_code="j4-3-1",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[
                ("餘角", r"$\alpha+\beta=90^\circ$"),
                ("補角", r"$\alpha+\beta=180^\circ$"),
            ],
            usage=["處理直角、平角拆分題型。"],
            examples=[r"若一角為 $35^\circ$，其餘角為 $55^\circ$。"],
            tips=["先確認題目是餘角還是補角。"],
            notes=["最常出現在第一題暖身題。"],
            mistakes=["把 90 與 180 公式互用。"],
        ),
        topic_row(
            id_="j4-3-1-polygon-interior-sum",
            title="多邊形內角和",
            chapter_code="j4-3-1",
            chapter_role="核心公式",
            difficulty="中等",
            formula_lines=[
                ("內角和", r"$(n-2)\times180^\circ$"),
                ("三角剖分", r"$n\text{ 邊形可分成 }n-2\text{ 個三角形}$"),
            ],
            usage=["已知邊數求內角和，或反求邊數。"],
            examples=[r"八邊形內角和為 $6\times180^\circ=1080^\circ$。"],
            tips=["先確認是『內角和』不是『每一內角』。"],
            notes=["常搭配正多邊形題。"],
            mistakes=[r"誤寫成 $n\times180^\circ$。"],
        ),
        topic_row(
            id_="j4-3-1-polygon-diagonal",
            title="多邊形對角線數",
            chapter_code="j4-3-1",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("對角線數", r"$\dfrac{n(n-3)}{2}$"),
                ("思路", r"$\dfrac{n(n-1)}{2}-n$"),
            ],
            usage=["求頂點連線中不是邊的線段數。"],
            examples=[r"十邊形對角線數為 $\dfrac{10\times7}{2}=35$。"],
            tips=["先分清楚『邊』與『對角線』。"],
            notes=["組合計數與幾何交會題常用。"],
            mistakes=[r"把公式寫成 $\dfrac{n(n-1)}{2}$。"],
        ),
        topic_row(
            id_="j4-3-1-regular-polygon-angle",
            title="正多邊形內角與外角",
            chapter_code="j4-3-1",
            chapter_role="核心公式",
            difficulty="中等",
            formula_lines=[
                ("每一外角", r"$\dfrac{360^\circ}{n}$"),
                ("每一內角", r"$180^\circ-\dfrac{360^\circ}{n}$"),
            ],
            usage=["由邊數求內外角，或由角度反推邊數。"],
            examples=[r"正六邊形每一外角為 $60^\circ$。"],
            tips=["先求外角通常比較快。"],
            notes=[r"外角總和永遠是 $360^\circ$。"],
            mistakes=["把每一內角與內角和混淆。"],
        ),
        topic_row(
            id_="j4-3-1-triangle-interior-sum",
            title="三角形內角和",
            chapter_code="j4-3-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("內角和", r"$\angle A+\angle B+\angle C=180^\circ$"),
                ("求角", r"$\angle C=180^\circ-\angle A-\angle B$"),
            ],
            usage=["已知兩角求第三角，或檢查角度合理性。"],
            examples=[r"若兩角為 $45^\circ,65^\circ$，第三角為 $70^\circ$。"],
            tips=["任何三角形都可用，先用這條再做延伸。"],
            notes=["角度追蹤題最穩定起點。"],
            mistakes=["把外角拿來直接代內角和。"],
        ),
        topic_row(
            id_="j4-3-1-triangle-exterior-theorem",
            title="三角形外角定理",
            chapter_code="j4-3-1",
            chapter_role="核心公式",
            difficulty="中等",
            formula_lines=[
                ("外角", r"$\angle \text{外角}=\angle \text{遠內角}_1+\angle \text{遠內角}_2$"),
                ("延長線", r"$\text{外角由邊的延長線形成}$"),
            ],
            usage=["由外角快速求不相鄰內角總和。"],
            examples=[r"若外角 $120^\circ$，一遠內角 $50^\circ$，另一遠內角 $70^\circ$。"],
            tips=["先找『相鄰內角』與『遠內角』位置。"],
            notes=["外角定理常和內角和聯合使用。"],
            mistakes=["把相鄰內角誤當遠內角。"],
        ),
        topic_row(
            id_="j4-3-1-isosceles-triangle-angle",
            title="等腰三角形角度關係",
            chapter_code="j4-3-1",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("底角", r"$\angle B=\angle C$"),
                ("頂角", r"$\angle A=180^\circ-2\angle B$"),
            ],
            usage=["由一角推其餘兩角。"],
            examples=[r"若頂角 $40^\circ$，底角各 $70^\circ$。"],
            tips=["先確認哪兩邊相等，底角才會相等。"],
            notes=["圖形標示邊長相等符號很重要。"],
            mistakes=["把等腰與等邊條件混用。"],
        ),
        topic_row(
            id_="j4-3-1-equilateral-triangle-angle",
            title="等邊三角形角度性質",
            chapter_code="j4-3-1",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[
                ("每角", r"$60^\circ$"),
                ("三邊", r"$a=b=c$"),
            ],
            usage=["遇到等邊條件時快速鎖定角度。"],
            examples=[r"等邊三角形任一角皆為 $60^\circ$。"],
            tips=[r"看到三邊相等可直接帶入 $60^\circ$。"],
            notes=["常做為複合圖形中的局部突破。"],
            mistakes=[r"只設一角 $60^\circ$，忘記三角都相同。"],
        ),
        topic_row(
            id_="j4-3-1-angle-chasing-strategy",
            title="角度追蹤解題策略",
            chapter_code="j4-3-1",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("流程", r"$\text{標已知}\rightarrow\text{找定理}\rightarrow\text{連續代入}$"),
                ("常用", r"$180^\circ,\ 90^\circ,\ \text{外角定理}$"),
            ],
            usage=["處理多步驟角度推理題。"],
            examples=["先找能直接算出的角，再逐層傳遞。"],
            tips=["每一步都標註理由，避免跳步失誤。"],
            notes=["競試題與段考壓軸常見。"],
            mistakes=["一次列太多未知角，造成聯立混亂。"],
        ),
        topic_row(
            id_="j4-3-1-geometry-word-application",
            title="幾何情境應用",
            chapter_code="j4-3-1",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("角度建模", r"$\text{依條件設角度式，再用內外角定理}$"),
                ("檢查", r"$0^\circ<\text{角度}<180^\circ$"),
            ],
            usage=["文字敘述轉換為幾何角度方程。"],
            examples=["路口轉角、折線、看板傾斜等都可轉為角度模型。"],
            tips=["先畫示意圖，文字資訊就不容易遺漏。"],
            notes=["最後一定要做角度合理性檢查。"],
            mistakes=["未畫圖直接列式導致關係用錯。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j4-3-1-combo-001",
            title="角度分類（基礎01）",
            chapter_code="j4-3-1",
            difficulty="基礎",
            question_text=r"$125^\circ$ 是銳角、直角還是鈍角？",
            answer_text="鈍角",
            explanation_text=r"$125^\circ>90^\circ$ 且小於 $180^\circ$，所以是鈍角。",
            topic_id="j4-3-1-angle-basic-type",
        ),
        question_row(
            id_="q-j4-3-1-combo-002",
            title="餘角計算（基礎02）",
            chapter_code="j4-3-1",
            difficulty="基礎",
            question_text=r"某角為 $38^\circ$，求其餘角。",
            answer_text=r"$52^\circ$",
            explanation_text=r"$90^\circ-38^\circ=52^\circ$。",
            topic_id="j4-3-1-complement-supplement",
        ),
        question_row(
            id_="q-j4-3-1-combo-003",
            title="補角計算（基礎03）",
            chapter_code="j4-3-1",
            difficulty="基礎",
            question_text=r"某角為 $117^\circ$，求其補角。",
            answer_text=r"$63^\circ$",
            explanation_text=r"$180^\circ-117^\circ=63^\circ$。",
            topic_id="j4-3-1-complement-supplement",
        ),
        question_row(
            id_="q-j4-3-1-combo-004",
            title="三角形第三角（基礎04）",
            chapter_code="j4-3-1",
            difficulty="基礎",
            question_text=r"三角形兩角為 $55^\circ$ 與 $75^\circ$，求第三角。",
            answer_text=r"$50^\circ$",
            explanation_text=r"$180^\circ-55^\circ-75^\circ=50^\circ$。",
            topic_id="j4-3-1-triangle-interior-sum",
        ),
        question_row(
            id_="q-j4-3-1-combo-005",
            title="外角定理（基礎05）",
            chapter_code="j4-3-1",
            difficulty="基礎",
            question_text=r"三角形一外角為 $130^\circ$，其中一個遠內角為 $48^\circ$，求另一個遠內角。",
            answer_text=r"$82^\circ$",
            explanation_text=r"$130^\circ-48^\circ=82^\circ$。",
            topic_id="j4-3-1-triangle-exterior-theorem",
        ),
        question_row(
            id_="q-j4-3-1-combo-006",
            title="等腰三角形（中等01）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text=r"等腰三角形頂角為 $44^\circ$，求底角。",
            answer_text=r"$68^\circ$",
            explanation_text=r"兩底角相等，故每個底角為 $(180^\circ-44^\circ)/2=68^\circ$。",
            topic_id="j4-3-1-isosceles-triangle-angle",
        ),
        question_row(
            id_="q-j4-3-1-combo-007",
            title="等邊三角形（基礎06）",
            chapter_code="j4-3-1",
            difficulty="基礎",
            question_text="等邊三角形任一內角是多少度？",
            answer_text=r"$60^\circ$",
            explanation_text=r"等邊三角形三角相等且內角和為 $180^\circ$，故每角 $60^\circ$。",
            topic_id="j4-3-1-equilateral-triangle-angle",
        ),
        question_row(
            id_="q-j4-3-1-combo-008",
            title="五邊形內角和（中等02）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text="求五邊形內角和。",
            answer_text=r"$540^\circ$",
            explanation_text=r"$(5-2)\times180^\circ=540^\circ$。",
            topic_id="j4-3-1-polygon-interior-sum",
        ),
        question_row(
            id_="q-j4-3-1-combo-009",
            title="反求邊數（中等03）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text=r"某多邊形內角和為 $1260^\circ$，求邊數。",
            answer_text=r"$9$",
            explanation_text=r"$(n-2)\times180^\circ=1260^\circ\Rightarrow n-2=7\Rightarrow n=9$。",
            topic_id="j4-3-1-polygon-interior-sum",
        ),
        question_row(
            id_="q-j4-3-1-combo-010",
            title="對角線數（中等04）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text="十邊形有幾條對角線？",
            answer_text=r"$35$",
            explanation_text=r"$\dfrac{10(10-3)}{2}=35$。",
            topic_id="j4-3-1-polygon-diagonal",
        ),
        question_row(
            id_="q-j4-3-1-combo-011",
            title="正多邊形外角（中等05）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text=r"正十二邊形每一外角多少度？",
            answer_text=r"$30^\circ$",
            explanation_text=r"$360^\circ/12=30^\circ$。",
            topic_id="j4-3-1-regular-polygon-angle",
        ),
        question_row(
            id_="q-j4-3-1-combo-012",
            title="外角反推邊數（中等06）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text=r"正多邊形每一外角為 $24^\circ$，求邊數。",
            answer_text=r"$15$",
            explanation_text=r"$n=360^\circ/24^\circ=15$。",
            topic_id="j4-3-1-regular-polygon-angle",
        ),
        question_row(
            id_="q-j4-3-1-combo-013",
            title="兩角與外角（中等07）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text=r"三角形中一外角為 $112^\circ$，其相鄰內角為多少度？",
            answer_text=r"$68^\circ$",
            explanation_text=r"外角與相鄰內角互為補角，故為 $180^\circ-112^\circ=68^\circ$。",
            topic_id="j4-3-1-triangle-exterior-theorem",
        ),
        question_row(
            id_="q-j4-3-1-combo-014",
            title="等腰外角（中等08）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text=r"等腰三角形一底角為 $72^\circ$，求頂角與其中一個外角（在頂角處延長邊形成）。",
            answer_text=r"頂角 $36^\circ$，該外角 $144^\circ$",
            explanation_text=r"頂角 $=180^\circ-72^\circ-72^\circ=36^\circ$，外角與頂角互補為 $144^\circ$。",
            topic_id="j4-3-1-isosceles-triangle-angle",
        ),
        question_row(
            id_="q-j4-3-1-combo-015",
            title="內角和檢查（中等09）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text=r"三角形三角分別為 $2x^\circ,3x^\circ,4x^\circ$，求 $x$。",
            answer_text=r"$20$",
            explanation_text=r"$2x+3x+4x=180\Rightarrow9x=180\Rightarrow x=20$。",
            topic_id="j4-3-1-triangle-interior-sum",
        ),
        question_row(
            id_="q-j4-3-1-combo-016",
            title="外角追蹤（進階01）",
            chapter_code="j4-3-1",
            difficulty="進階",
            question_text=r"三角形兩個遠內角分別為 $(x+10)^\circ$ 與 $(2x-5)^\circ$，外角為 $95^\circ$，求 $x$。",
            answer_text=r"$30$",
            explanation_text=r"$(x+10)+(2x-5)=95\Rightarrow3x+5=95\Rightarrow x=30$。",
            topic_id="j4-3-1-triangle-exterior-theorem",
        ),
        question_row(
            id_="q-j4-3-1-combo-017",
            title="角度鏈結（進階02）",
            chapter_code="j4-3-1",
            difficulty="進階",
            question_text=r"若三角形一角是另一角的 2 倍，第三角為 $40^\circ$，求其餘兩角。",
            answer_text=r"$\dfrac{140}{3}^\circ,\ \dfrac{280}{3}^\circ$",
            explanation_text=r"設兩角為 $x,2x$，則 $x+2x+40=180\Rightarrow x=\dfrac{140}{3}$。",
            topic_id="j4-3-1-angle-chasing-strategy",
        ),
        question_row(
            id_="q-j4-3-1-combo-018",
            title="多邊形每角（進階03）",
            chapter_code="j4-3-1",
            difficulty="進階",
            question_text=r"正多邊形每一內角為 $156^\circ$，求邊數。",
            answer_text=r"$15$",
            explanation_text=r"每一外角 $=180^\circ-156^\circ=24^\circ$，邊數 $=360^\circ/24^\circ=15$。",
            topic_id="j4-3-1-regular-polygon-angle",
        ),
        question_row(
            id_="q-j4-3-1-combo-019",
            title="對角線反推（進階04）",
            chapter_code="j4-3-1",
            difficulty="進階",
            question_text=r"某多邊形對角線數為 44，求邊數 $n$。",
            answer_text=r"$11$",
            explanation_text=r"$\dfrac{n(n-3)}{2}=44\Rightarrow n^2-3n-88=0\Rightarrow n=11$（取正整數）。",
            topic_id="j4-3-1-polygon-diagonal",
        ),
        question_row(
            id_="q-j4-3-1-combo-020",
            title="圖形推理（進階05）",
            chapter_code="j4-3-1",
            difficulty="進階",
            question_text=r"三角形一外角為 $x^\circ$，兩遠內角為 $(x-30)^\circ$ 與 $50^\circ$，求 $x$。",
            answer_text=r"$80$",
            explanation_text=r"$x=(x-30)+50\Rightarrow x=80$。",
            topic_id="j4-3-1-angle-chasing-strategy",
        ),
        question_row(
            id_="q-j4-3-1-combo-021",
            title="幾何情境（進階06）",
            chapter_code="j4-3-1",
            difficulty="進階",
            question_text="某三角形看板兩底角皆為 65°，求頂角並判斷是否鈍角。",
            answer_text=r"頂角 $50^\circ$，不是鈍角。",
            explanation_text=r"頂角 $=180^\circ-65^\circ-65^\circ=50^\circ$，小於 $90^\circ$。",
            topic_id="j4-3-1-geometry-word-application",
        ),
        question_row(
            id_="q-j4-3-1-combo-022",
            title="內角和平均（中等10）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text=r"正九邊形每一內角是多少？",
            answer_text=r"$140^\circ$",
            explanation_text=r"內角和 $(9-2)\times180^\circ=1260^\circ$，每角 $=1260^\circ/9=140^\circ$。",
            topic_id="j4-3-1-regular-polygon-angle",
        ),
        question_row(
            id_="q-j4-3-1-combo-023",
            title="三角形角平分（中等11）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text=r"三角形一角為 $80^\circ$，其餘兩角相等，求每個其餘角與其平分後角度。",
            answer_text=r"其餘角各 $50^\circ$，平分後各 $25^\circ$",
            explanation_text=r"其餘兩角和 $100^\circ$ 且相等，故各 $50^\circ$，再平分為 $25^\circ$。",
            topic_id="j4-3-1-angle-chasing-strategy",
        ),
        question_row(
            id_="q-j4-3-1-combo-024",
            title="外角總和（中等12）",
            chapter_code="j4-3-1",
            difficulty="中等",
            question_text="任意凸多邊形外角和是多少度？",
            answer_text=r"$360^\circ$",
            explanation_text=r"沿圖形繞行一圈總轉角固定為 $360^\circ$。",
            topic_id="j4-3-1-regular-polygon-angle",
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
    formula_payload["meta"]["lastImportSource"] = (
        f"{Path(SOURCE_WORD_1).name} + {Path(SOURCE_WORD_2).name}（重點整理匯入）"
    )

    question_payload["questions"] = questions
    question_payload.setdefault("meta", {})
    question_payload["meta"]["count"] = len(questions)
    question_payload["meta"]["updatedAt"] = now
    question_payload["meta"]["lastImportSource"] = (
        f"{Path(SOURCE_WORD_1).name} + {Path(SOURCE_WORD_2).name}（重點整理匯入）"
    )

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
