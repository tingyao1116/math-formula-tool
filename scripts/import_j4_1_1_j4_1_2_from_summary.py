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
    r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國二下1 等差, 等比數列與級數.docx"
)
SUMMARY_WORD = str(
    ROOT / "exports" / "word-j4-1-1-2" / "改國二下1_等差等比數列與級數_重點整理.docx"
)
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j4-1-1": "等差數列",
    "j4-1-2": "等比數列",
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
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def backup_file(path: Path) -> str:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j4-1-1-2-{ts}{path.suffix}"
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
        "domain": "數與量",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", chapter_code, chapter, "數列與級數"],
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
            id_="j4-1-1-arithmetic-definition",
            title="等差數列基本定義",
            chapter_code="j4-1-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("定義", r"$a_{n+1}-a_n=d$"),
                ("判斷", r"$d$ 為常數"),
            ],
            usage=["先判斷數列是否為等差，再決定是否使用等差公式。"],
            examples=[r"$3,7,11,15,\dots$ 的公差為 $4$。"],
            tips=["不要把「相鄰兩項的差」看成「任兩項的差」。"],
            notes=["等差數列重點是固定差值。"],
            mistakes=["只看前兩項就下結論，未檢查後續項。"],
        ),
        topic_row(
            id_="j4-1-1-an-formula",
            title="等差數列通項公式",
            chapter_code="j4-1-1",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[
                ("通項", r"$a_n=a_1+(n-1)d$"),
                ("逆推", r"$a_1=a_n-(n-1)d$"),
            ],
            usage=["已知首項與公差時，快速求任意第 $n$ 項。"],
            examples=[r"$a_1=5,d=3 \Rightarrow a_8=5+7\cdot3=26$。"],
            tips=["題目的第幾項要明確寫成下標，例如第 8 項是 $a_8$。"],
            notes=["通項公式是等差題最常用入口。"],
            mistakes=["把 $(n-1)$ 寫成 $n$。"],
        ),
        topic_row(
            id_="j4-1-1-find-a1-d",
            title="由兩項反求首項與公差",
            chapter_code="j4-1-1",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("公差", r"$d=\dfrac{a_n-a_m}{n-m}$"),
                ("首項", r"$a_1=a_n-(n-1)d$"),
            ],
            usage=["已知兩個位置的項值時，建立二元一次關係求未知。"],
            examples=[r"$a_4=10,a_{10}=28 \Rightarrow d=3,a_1=1$。"],
            tips=["先用兩式相減求 $d$，再回代求 $a_1$。"],
            notes=["這類題型常出在題組第一題。"],
            mistakes=["下標差寫錯，導致分母用成 $n$。"],
        ),
        topic_row(
            id_="j4-1-1-arithmetic-mean",
            title="等差中項與三數關係",
            chapter_code="j4-1-1",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("等差中項", r"$2b=a+c$"),
                ("中項", r"$b=\dfrac{a+c}{2}$"),
            ],
            usage=["三數成等差時，可快速找中間值或兩端和。"],
            examples=[r"$4,b,20$ 成等差 $\Rightarrow b=12$。"],
            tips=["題目若要「插入一個數」，通常就是等差中項。"],
            notes=["等差中項是很多文字題建模核心。"],
            mistakes=["把中項誤寫成幾何平均。"],
        ),
        topic_row(
            id_="j4-1-1-arithmetic-series-sum",
            title="等差級數求和",
            chapter_code="j4-1-1",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("前 $n$ 項和", r"$S_n=\dfrac{n(a_1+a_n)}{2}$"),
                ("改寫", r"$S_n=\dfrac{n\bigl(2a_1+(n-1)d\bigr)}{2}$"),
            ],
            usage=["當題目要『前幾項總和』時使用。"],
            examples=[r"$a_1=2,d=5 \Rightarrow S_{20}=990$。"],
            tips=["先分清楚要求的是 $a_n$ 還是 $S_n$。"],
            notes=["等差級數在校內段考很常出現。"],
            mistakes=["把 $S_n$ 當作單一項去代。"],
        ),
        topic_row(
            id_="j4-1-1-word-model",
            title="等差情境建模",
            chapter_code="j4-1-1",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("建模流程", r"$\text{找首項}\rightarrow\text{找公差}\rightarrow\text{求項或求和}$"),
                ("列式", r"$a_n=a_1+(n-1)d,\ S_n=\dfrac{n(a_1+a_n)}{2}$"),
            ],
            usage=["處理座位、樓層、階梯、分組遞增等情境。"],
            examples=["某禮堂每排比前一排多 2 人，可用等差模型表示。"],
            tips=["先把文字中的『第幾個』轉成下標，再套公式。"],
            notes=["應用題重點是正確定義未知數。"],
            mistakes=["直接代公式，未先對應情境與變數。"],
        ),
        topic_row(
            id_="j4-1-2-geometric-definition",
            title="等比數列基本定義",
            chapter_code="j4-1-2",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("定義", r"$\dfrac{a_{n+1}}{a_n}=r\ (a_n\neq0)$"),
                ("判斷", r"$r$ 為常數"),
            ],
            usage=["先確認是否為固定倍數，再用等比公式。"],
            examples=[r"$2,6,18,54,\dots$ 的公比為 $3$。"],
            tips=["公比可能是負數或分數，不能只看整數倍。"],
            notes=["等比重點是固定比值。"],
            mistakes=["把固定差誤判成固定比。"],
        ),
        topic_row(
            id_="j4-1-2-an-formula",
            title="等比數列通項公式",
            chapter_code="j4-1-2",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[
                ("通項", r"$a_n=a_1r^{n-1}$"),
                ("逆推", r"$a_1=\dfrac{a_n}{r^{n-1}}$"),
            ],
            usage=["已知首項與公比時，求指定項最直接。"],
            examples=[r"$a_1=3,r=2 \Rightarrow a_7=192$。"],
            tips=["注意次方是 $n-1$，不是 $n$。"],
            notes=["等比通項常搭配指數概念。"],
            mistakes=[r"把 $r^{n-1}$ 寫成 $r^n$。"],
        ),
        topic_row(
            id_="j4-1-2-find-a1-r",
            title="由兩項反求首項與公比",
            chapter_code="j4-1-2",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("關係", r"$\dfrac{a_n}{a_m}=r^{n-m}$"),
                ("回代", r"$a_1=\dfrac{a_n}{r^{n-1}}$"),
            ],
            usage=["已知兩項值時，先求公比再回推首項。"],
            examples=[r"$a_2=6,a_5=162 \Rightarrow r=3,a_1=2$。"],
            tips=["先檢查題目是否允許負公比。"],
            notes=["等比逆推容易在次方處出錯。"],
            mistakes=["把 $n-m$ 寫成 $m-n$。"],
        ),
        topic_row(
            id_="j4-1-2-geometric-mean",
            title="等比中項與三數關係",
            chapter_code="j4-1-2",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("等比中項", r"$b^2=ac$"),
                ("中項", r"$b=\pm\sqrt{ac}$"),
            ],
            usage=["三數成等比時，可快速建立平方關係。"],
            examples=[r"$4,b,36$ 成等比 $\Rightarrow b=\pm12$。"],
            tips=["若題目限定正數，才取正根。"],
            notes=["等比中項常和根號題一起出。"],
            mistakes=["忘記考慮負根。"],
        ),
        topic_row(
            id_="j4-1-2-geometric-series-sum",
            title="等比級數求和",
            chapter_code="j4-1-2",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("$r\\neq1$", r"$S_n=\dfrac{a_1(1-r^n)}{1-r}$"),
                ("$r=1$", r"$S_n=na_1$"),
            ],
            usage=["處理倍數成長或等比累加問題。"],
            examples=[r"$a_1=2,r=3 \Rightarrow S_6=728$。"],
            tips=["套公式前先判斷 $r=1$ 或 $r\neq1$。"],
            notes=["等比級數常和通項聯合考。"],
            mistakes=["把等差求和公式誤用到等比。"],
        ),
        topic_row(
            id_="j4-1-2-growth-decay-model",
            title="等比成長與衰減模型",
            chapter_code="j4-1-2",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("成長/衰減", r"$a_n=a_1r^{n-1}$"),
                ("累積", r"$S_n=\dfrac{a_1(1-r^n)}{1-r}$"),
            ],
            usage=["處理折舊、細菌增殖、人口成長等問題。"],
            examples=[r"每日保留 $80\%$ 可用 $r=0.8$ 建模。"],
            tips=["看清楚第 1 天是否就是首項。"],
            notes=["應用題要回到情境檢查答案是否合理。"],
            mistakes=["天數與項數對應錯位。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j4-1-1-word01-001",
            title="等差判斷（基礎01）",
            chapter_code="j4-1-1",
            difficulty="基礎",
            question_text=r"判斷數列 $3,7,11,15,\dots$ 是否為等差數列，並求公差。",
            answer_text=r"是，$d=4$。",
            explanation_text=r"相鄰兩項差皆為 $4$，所以是等差數列。",
            topic_id="j4-1-1-arithmetic-definition",
        ),
        question_row(
            id_="q-j4-1-1-word01-002",
            title="通項代入（基礎02）",
            chapter_code="j4-1-1",
            difficulty="基礎",
            question_text=r"已知等差數列 $a_1=5,d=3$，求 $a_8$。",
            answer_text=r"$26$",
            explanation_text=r"$a_8=5+(8-1)\cdot3=26$。",
            topic_id="j4-1-1-an-formula",
        ),
        question_row(
            id_="q-j4-1-1-word01-003",
            title="通項表示（基礎03）",
            chapter_code="j4-1-1",
            difficulty="基礎",
            question_text=r"已知等差數列 $a_1=-2,d=4$，寫出 $a_n$。",
            answer_text=r"$a_n=4n-6$",
            explanation_text=r"$a_n=-2+(n-1)\cdot4=4n-6$。",
            topic_id="j4-1-1-an-formula",
        ),
        question_row(
            id_="q-j4-1-1-word01-004",
            title="由兩項求公差（基礎04）",
            chapter_code="j4-1-1",
            difficulty="基礎",
            question_text=r"已知等差數列 $a_4=10,a_{10}=28$，求公差 $d$。",
            answer_text=r"$3$",
            explanation_text=r"$d=\dfrac{28-10}{10-4}=3$。",
            topic_id="j4-1-1-find-a1-d",
        ),
        question_row(
            id_="q-j4-1-1-word01-005",
            title="由通項回推（中等01）",
            chapter_code="j4-1-1",
            difficulty="中等",
            question_text=r"若 $a_n=4n-1$，求 $a_1$ 與 $d$。",
            answer_text=r"$a_1=3,\ d=4$",
            explanation_text=r"$a_1=a_n|_{n=1}=3$，且公差為係數差 $4$。",
            topic_id="j4-1-1-an-formula",
        ),
        question_row(
            id_="q-j4-1-1-word01-006",
            title="兩式聯立（中等02）",
            chapter_code="j4-1-1",
            difficulty="中等",
            question_text=r"已知等差數列 $a_3=7,a_9=25$，求 $a_1,d$。",
            answer_text=r"$a_1=1,\ d=3$",
            explanation_text=r"$a_3=a_1+2d=7,\ a_9=a_1+8d=25$，相減得 $d=3$，回代得 $a_1=1$。",
            topic_id="j4-1-1-find-a1-d",
        ),
        question_row(
            id_="q-j4-1-1-word01-007",
            title="等差級數（中等03）",
            chapter_code="j4-1-1",
            difficulty="中等",
            question_text=r"已知等差數列 $a_1=2,d=5$，求 $S_{20}$。",
            answer_text=r"$990$",
            explanation_text=r"$a_{20}=2+19\cdot5=97$，$S_{20}=\dfrac{20(2+97)}{2}=990$。",
            topic_id="j4-1-1-arithmetic-series-sum",
        ),
        question_row(
            id_="q-j4-1-1-word01-008",
            title="等差中項（中等04）",
            chapter_code="j4-1-1",
            difficulty="中等",
            question_text=r"若 $4,b,20$ 成等差數列，求 $b$。",
            answer_text=r"$12$",
            explanation_text=r"$b=\dfrac{4+20}{2}=12$。",
            topic_id="j4-1-1-arithmetic-mean",
        ),
        question_row(
            id_="q-j4-1-1-word01-009",
            title="跨項推算（進階01）",
            chapter_code="j4-1-1",
            difficulty="進階",
            question_text=r"已知等差數列 $a_5=18,a_{12}=39$，求 $a_{30}$。",
            answer_text=r"$93$",
            explanation_text=r"$d=\dfrac{39-18}{12-5}=3$，$a_1=18-4\cdot3=6$，故 $a_{30}=6+29\cdot3=93$。",
            topic_id="j4-1-1-find-a1-d",
        ),
        question_row(
            id_="q-j4-1-1-word01-010",
            title="插入項數（進階02）",
            chapter_code="j4-1-1",
            difficulty="進階",
            question_text=r"在 $4$ 與 $20$ 之間插入三個數，使五個數成等差，求這三個數。",
            answer_text=r"$8,12,16$",
            explanation_text=r"共 5 項，公差 $d=\dfrac{20-4}{4}=4$，依序為 $4,8,12,16,20$。",
            topic_id="j4-1-1-arithmetic-mean",
        ),
        question_row(
            id_="q-j4-1-1-word01-011",
            title="情境總和（進階03）",
            chapter_code="j4-1-1",
            difficulty="進階",
            question_text="禮堂第一排 18 人，每排比前一排多 2 人，共 15 排，總人數多少？",
            answer_text=r"$480$",
            explanation_text=r"$a_1=18,d=2,a_{15}=46$，$S_{15}=\dfrac{15(18+46)}{2}=480$。",
            topic_id="j4-1-1-word-model",
        ),
        question_row(
            id_="q-j4-1-1-word01-012",
            title="由總和求項數（進階04）",
            chapter_code="j4-1-1",
            difficulty="進階",
            question_text=r"等差數列 $a_1=7,d=2$，若 $S_n=247$，求 $n$。",
            answer_text=r"$13$",
            explanation_text=r"$S_n=\dfrac{n(2\cdot7+(n-1)\cdot2)}{2}=n(n+6)=247$，解得 $n=13$。",
            topic_id="j4-1-1-arithmetic-series-sum",
        ),
        question_row(
            id_="q-j4-1-2-word01-013",
            title="等比判斷（基礎01）",
            chapter_code="j4-1-2",
            difficulty="基礎",
            question_text=r"判斷數列 $2,6,18,54,\dots$ 是否為等比數列，並求公比。",
            answer_text=r"是，$r=3$。",
            explanation_text=r"相鄰兩項比值皆為 $3$，所以是等比數列。",
            topic_id="j4-1-2-geometric-definition",
        ),
        question_row(
            id_="q-j4-1-2-word01-014",
            title="通項代入（基礎02）",
            chapter_code="j4-1-2",
            difficulty="基礎",
            question_text=r"已知等比數列 $a_1=3,r=2$，求 $a_7$。",
            answer_text=r"$192$",
            explanation_text=r"$a_7=3\cdot2^{6}=192$。",
            topic_id="j4-1-2-an-formula",
        ),
        question_row(
            id_="q-j4-1-2-word01-015",
            title="回推首項（基礎03）",
            chapter_code="j4-1-2",
            difficulty="基礎",
            question_text=r"已知等比數列 $a_3=12,r=2$，求首項 $a_1$。",
            answer_text=r"$3$",
            explanation_text=r"$a_3=a_1\cdot2^2=12$，所以 $a_1=3$。",
            topic_id="j4-1-2-find-a1-r",
        ),
        question_row(
            id_="q-j4-1-2-word01-016",
            title="由通項求值（基礎04）",
            chapter_code="j4-1-2",
            difficulty="基礎",
            question_text=r"若 $a_n=5\cdot3^{n-1}$，求 $a_5$。",
            answer_text=r"$405$",
            explanation_text=r"$a_5=5\cdot3^4=405$。",
            topic_id="j4-1-2-an-formula",
        ),
        question_row(
            id_="q-j4-1-2-word01-017",
            title="兩式聯立（中等01）",
            chapter_code="j4-1-2",
            difficulty="中等",
            question_text=r"已知等比數列 $a_2=6,a_5=162$，求 $a_1,r$。",
            answer_text=r"$a_1=2,\ r=3$",
            explanation_text=r"$\dfrac{a_5}{a_2}=r^3=\dfrac{162}{6}=27$，得 $r=3$，再由 $a_2=a_1r$ 得 $a_1=2$。",
            topic_id="j4-1-2-find-a1-r",
        ),
        question_row(
            id_="q-j4-1-2-word01-018",
            title="等比中項（中等02）",
            chapter_code="j4-1-2",
            difficulty="中等",
            question_text=r"若 $4,b,36$ 成等比數列，求 $b$。",
            answer_text=r"$\pm12$",
            explanation_text=r"$b^2=4\cdot36=144$，所以 $b=\pm12$。",
            topic_id="j4-1-2-geometric-mean",
        ),
        question_row(
            id_="q-j4-1-2-word01-019",
            title="等比級數（中等03）",
            chapter_code="j4-1-2",
            difficulty="中等",
            question_text=r"已知等比數列 $a_1=2,r=3$，求 $S_6$。",
            answer_text=r"$728$",
            explanation_text=r"$S_6=\dfrac{2(1-3^6)}{1-3}=728$。",
            topic_id="j4-1-2-geometric-series-sum",
        ),
        question_row(
            id_="q-j4-1-2-word01-020",
            title="公比為 1（中等04）",
            chapter_code="j4-1-2",
            difficulty="中等",
            question_text=r"等比數列若 $a_1=5,r=1$，求 $S_8$。",
            answer_text=r"$40$",
            explanation_text=r"$r=1$ 時 $S_n=na_1$，故 $S_8=8\cdot5=40$。",
            topic_id="j4-1-2-geometric-series-sum",
        ),
        question_row(
            id_="q-j4-1-2-word01-021",
            title="最小項數（進階01）",
            chapter_code="j4-1-2",
            difficulty="進階",
            question_text=r"等比級數 $a_1=8,r=\dfrac{1}{2}$，求最小正整數 $n$ 使得 $S_n>15$。",
            answer_text=r"$5$",
            explanation_text=r"$S_n=16\left(1-\left(\dfrac12\right)^n\right)>15$，得 $\left(\dfrac12\right)^n<\dfrac1{16}$，故最小 $n=5$。",
            topic_id="j4-1-2-geometric-series-sum",
        ),
        question_row(
            id_="q-j4-1-2-word01-022",
            title="衰減模型（進階02）",
            chapter_code="j4-1-2",
            difficulty="進階",
            question_text="某菌量第 1 天為 1000，每天保留前一天的 80%，求第 6 天菌量。",
            answer_text=r"$327.68$（約 $328$）",
            explanation_text=r"$a_6=1000\cdot0.8^{5}=327.68$。",
            topic_id="j4-1-2-growth-decay-model",
        ),
        question_row(
            id_="q-j4-1-2-word01-023",
            title="由總和反推項數（進階03）",
            chapter_code="j4-1-2",
            difficulty="進階",
            question_text=r"若等比級數 $a_1=1,r=2$，且 $S_n=1023$，求 $n$。",
            answer_text=r"$10$",
            explanation_text=r"$S_n=\dfrac{1(1-2^n)}{1-2}=2^n-1=1023$，所以 $2^n=1024$，得 $n=10$。",
            topic_id="j4-1-2-geometric-series-sum",
        ),
        question_row(
            id_="q-j4-1-2-word01-024",
            title="兩項反推並求和（進階04）",
            chapter_code="j4-1-2",
            difficulty="進階",
            question_text=r"已知等比數列 $a_2=3,a_5=81$，求 $S_5$。",
            answer_text=r"$121$",
            explanation_text=r"$r^3=\dfrac{81}{3}=27\Rightarrow r=3$，$a_1=\dfrac{a_2}{r}=1$，故 $S_5=\dfrac{1(1-3^5)}{1-3}=121$。",
            topic_id="j4-1-2-find-a1-r",
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
    question_required_issues = validate_required(
        question_rows, QUESTION_REQUIRED_FIELDS, question_ids
    )
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
