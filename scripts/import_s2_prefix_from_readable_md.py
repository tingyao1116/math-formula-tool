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
CHAPTER_DB = ROOT / "program-db" / "database" / "chapter-code-db.json"
BACKUP_DIR = ROOT / "backups"

SOURCE_MD = (
    r"C:/Users/user/OneDrive/文件/張快自製講義/codex白話講義/高中數學哈特利重點版/高一下全重點_整理/高一下全重點_易讀版.md"
)
SOURCE_REF = "高一下全重點_易讀版.md（重點整理匯入）"

S2_CODES = [
    "s2-1-1",
    "s2-1-2",
    "s2-2-1",
    "s2-2-2",
    "s2-2-3",
    "s2-2-4",
    "s2-3-1",
    "s2-3-2",
    "s2-4-1",
    "s2-4-2",
    "s2-4-3",
    "s2-x",
]

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

CHAPTER_NAME_FALLBACK = {
    "s2-1-1": "數列與遞迴與級數：數列與遞迴",
    "s2-1-2": "數列與遞迴與級數：級數",
    "s2-2-1": "排列組合：邏輯、集合與計數原理",
    "s2-2-2": "排列組合：排列組合",
    "s2-2-3": "排列組合：二項式定理",
    "s2-2-4": "排列組合：古典機率",
    "s2-3-1": "數據分析：一維數據分析",
    "s2-3-2": "數據分析：二維數據分析",
    "s2-4-1": "三角比：三角比定義與關係",
    "s2-4-2": "三角比：正弦定理與餘弦定理",
    "s2-4-3": "三角比：三角測量",
    "s2-x": "高一下補充",
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def backup_file(path: Path, tag: str) -> str:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"{path.stem}.{tag}-{ts}{path.suffix}"
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
    chapter_names: Dict[str, str],
) -> Dict:
    chapter = chapter_names[chapter_code]
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "高中",
        "grade": "高一",
        "term": "高一下",
        "chapter": chapter,
        "chapterCode": chapter_code,
        "domain": "高中數學",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", chapter_code, chapter, "高一下"],
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes + [f"來源：{SOURCE_REF}"],
        "mistakes": mistakes,
        "contentTypes": ["教學核心", "公式重點", "常見題型", "易錯陷阱"],
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
    chapter_names: Dict[str, str],
) -> Dict:
    chapter = chapter_names[chapter_code]
    return {
        "id": id_,
        "title": title,
        "question_text": question_text,
        "answer_text": answer_text,
        "explanation_text": explanation_text,
        "stage": "高中",
        "grade": "高一",
        "chapter": chapter,
        "chapter_code": chapter_code,
        "difficulty": difficulty,
        "source_type": "md_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics(chapter_names: Dict[str, str]) -> List[Dict]:
    return [
        topic_row(
            id_="s2-1-1-sequence-recursion-core",
            title="數列與遞迴核心觀念",
            chapter_code="s2-1-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[("等差數列", r"$a_n=a_1+(n-1)d$"), ("等比數列", r"$a_n=a_1r^{n-1}$"), ("遞迴關係", r"$a_n=a_{n-1}+d$ 或 $a_n=ra_{n-1}$")],
            usage=["判斷題目屬於等差、等比或遞迴定義後，再選對應公式。"],
            examples=["已知 $a_1=3,d=2$，則 $a_5=11$。"],
            tips=["先找固定差或固定比，再代入通項。"],
            notes=["重點是辨識數列規律，不只背公式。"],
            mistakes=["把等差公差 $d$ 與等比公比 $r$ 混用。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-1-2-series-sigma-core",
            title="級數求和與 $\\Sigma$ 記號",
            chapter_code="s2-1-2",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[("等差級數", r"$S_n=\frac{n(a_1+a_n)}{2}$"), ("等比級數", r"$S_n=\frac{a_1(1-r^n)}{1-r}\ (r\ne1)$"), ("與數列關係", r"$a_n=S_n-S_{n-1}$")],
            usage=["用在前 $n$ 項和、由級數反推數列項。"],
            examples=["若 $S_n=n^2$，則 $a_n=2n-1$。"],
            tips=["先確認是求單項 $a_n$ 還是總和 $S_n$。"],
            notes=["$r=1$ 時等比級數改用 $S_n=na_1$。"],
            mistakes=["忘記檢查 $r=1$ 的特例。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-2-1-logic-set-counting-core",
            title="邏輯、集合與計數原理",
            chapter_code="s2-2-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[("德摩根律", r"$\neg(p\land q)=\neg p\lor\neg q$"), ("加法原理", r"$n(A\cup B)=n(A)+n(B)-n(A\cap B)$")],
            usage=["用在條件判斷、集合運算與分類計數。"],
            examples=["若 $|A|=10,|B|=8,|A\\cap B|=3$，則 $|A\\cup B|=15$。"],
            tips=["先畫文氏圖可快速避免重複計數。"],
            notes=["邏輯與集合是後續排列組合的基礎。"],
            mistakes=["把『且』與『或』判斷寫反。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-2-2-permutation-combination-core",
            title="排列組合核心公式",
            chapter_code="s2-2-2",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[("排列", r"$P_m^n=\frac{n!}{(n-m)!}$"), ("組合", r"$C_k^n=\frac{n!}{k!(n-k)!}$"), ("重複組合", r"$H_m^n=C_{m+n-1}^m$")],
            usage=["用在選取、排序、分組、重複取法。"],
            examples=["從 5 人選 2 人：$C_2^5=10$。"],
            tips=["先判斷『有無順序』再決定用排列或組合。"],
            notes=["題目若分步驟，常要乘法原理搭配。"],
            mistakes=["有順序問題卻誤用組合。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-2-3-binomial-theorem-core",
            title="二項式定理與係數判讀",
            chapter_code="s2-2-3",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[("二項式定理", r"$(x+y)^n=\sum_{r=0}^{n}C_r^n x^{n-r}y^r$"), ("一般項", r"$T_{r+1}=C_r^n x^{n-r}y^r$"), ("係數和", r"$\sum_{r=0}^{n}C_r^n=2^n$")],
            usage=["用在展開式特定項、係數和與交錯和。"],
            examples=["$(x+y)^5$ 的 $x^2y^3$ 係數是 $C_3^5=10$。"],
            tips=["找指定項時先解次方條件，再取對應組合數。"],
            notes=["交錯和常用 $x=1,y=-1$。"],
            mistakes=["把一般項中的次方配錯。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-2-4-classical-probability-core",
            title="古典機率與事件運算",
            chapter_code="s2-2-4",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[("古典機率", r"$P(A)=\frac{n(A)}{n(S)}$"), ("補事件", r"$P(A^c)=1-P(A)$"), ("聯集機率", r"$P(A\cup B)=P(A)+P(B)-P(A\cap B)$")],
            usage=["用在等可能樣本空間的機率計算。"],
            examples=["擲一顆骰子，偶數機率為 $3/6=1/2$。"],
            tips=["先定義樣本空間與事件，再代公式。"],
            notes=["先確認題目是否符合等可能。"],
            mistakes=["把事件交集與聯集混淆。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-3-1-one-dimensional-data-core",
            title="一維數據分析指標",
            chapter_code="s2-3-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[("平均數", r"$\mu=\frac{1}{n}\sum_{i=1}^n x_i$"), ("標準差", r"$\sigma=\sqrt{\frac{1}{n}\sum_{i=1}^n(x_i-\mu)^2}$"), ("標準化", r"$z=\frac{x-\mu}{\sigma}$")],
            usage=["用在描述集中趨勢與離散程度。"],
            examples=["資料平移 $+5$ 不改變標準差。"],
            tips=["比較不同量綱資料時，先轉成 $z$ 分數。"],
            notes=["極端值會影響平均數與標準差。"],
            mistakes=["把變異數與標準差當成同一個量。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-3-2-two-dimensional-data-core",
            title="二維數據分析與線性關聯",
            chapter_code="s2-3-2",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[("相關係數", r"$r=\frac{\sum (x_i-\mu_x)(y_i-\mu_y)}{\sqrt{\sum (x_i-\mu_x)^2}\sqrt{\sum (y_i-\mu_y)^2}}$"), ("最小平方法", r"$\hat y=a+bx$"), ("性質", r"$-1\le r\le 1$")],
            usage=["用在判斷散佈圖線性趨勢與預測。"],
            examples=["若點幾乎落在上升直線，則 $r$ 接近 $1$。"],
            tips=["$r$ 只反映線性關聯，不代表因果關係。"],
            notes=["需搭配散佈圖一起解讀。"],
            mistakes=["把 $r=0$ 誤解為完全無關。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-4-1-trigonometric-ratio-core",
            title="三角比定義與基本關係",
            chapter_code="s2-4-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[("定義", r"$\sin A=\frac{\text{對邊}}{\text{斜邊}},\ \cos A=\frac{\text{鄰邊}}{\text{斜邊}},\ \tan A=\frac{\sin A}{\cos A}$"), ("畢氏恆等式", r"$\sin^2\theta+\cos^2\theta=1$"), ("互餘關係", r"$\sin(90^\circ-\theta)=\cos\theta$")],
            usage=["用在直角三角形邊角轉換與值化簡。"],
            examples=["若 $\\sin\\theta=\\frac35$，則 $\\cos\\theta=\\frac45$（第一象限）。"],
            tips=["先判斷象限再決定正負號。"],
            notes=["熟記特殊角可提升解題速度。"],
            mistakes=["未判斷象限就直接給正值。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-4-2-sine-cosine-law-core",
            title="正弦定理與餘弦定理",
            chapter_code="s2-4-2",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[("正弦定理", r"$\frac{a}{\sin A}=\frac{b}{\sin B}=\frac{c}{\sin C}$"), ("餘弦定理", r"$a^2=b^2+c^2-2bc\cos A$")],
            usage=["用在非直角三角形的解三角形問題。"],
            examples=["已知兩邊夾角求第三邊，優先用餘弦定理。"],
            tips=["先辨識已知條件屬於哪一型（SAS、ASA、SSS）。"],
            notes=["正弦定理可能出現兩解情形，需檢查。"],
            mistakes=["條件不足時硬套公式。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-4-3-triangle-measurement-core",
            title="三角測量與面積公式",
            chapter_code="s2-4-3",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[("面積（夾角）", r"$\Delta=\frac12 ab\sin C$"), ("海龍公式", r"$\Delta=\sqrt{s(s-a)(s-b)(s-c)},\ s=\frac{a+b+c}{2}$"), ("內切圓半徑", r"$\Delta=rs$")],
            usage=["用在已知邊角資訊的實際測量題。"],
            examples=["已知三邊可先求半周長 $s$ 再用海龍公式。"],
            tips=["面積題先看資料型態：三邊型、兩邊夾角型。"],
            notes=["計算中注意單位一致。"],
            mistakes=["把半周長 $s$ 寫成周長。"],
            chapter_names=chapter_names,
        ),
        topic_row(
            id_="s2-x-integrated-checklist",
            title="高一下整合檢核與選式流程",
            chapter_code="s2-x",
            chapter_role="統整",
            difficulty="基礎",
            formula_lines=[("流程", r"$\text{先判題型}\rightarrow\text{再選公式}\rightarrow\text{最後檢查條件}$")],
            usage=["跨章綜合題：先分類再計算，降低公式誤用。"],
            examples=["先判斷是計數、機率、數列或三角題，再進入主公式。"],
            tips=["每步都寫出條件，避免漏掉限制。"],
            notes=["整合檢核可用於段考前快速複習。"],
            mistakes=["未判題型就直接代公式。"],
            chapter_names=chapter_names,
        ),
    ]


def build_questions(chapter_names: Dict[str, str]) -> List[Dict]:
    return [
        question_row(id_="q-s2-full-001", title="等差通項（基礎01）", chapter_code="s2-1-1", difficulty="基礎", question_text="已知等差數列 $a_1=5,d=3$，求 $a_6$。", answer_text="$a_6=20$。", explanation_text="$a_n=a_1+(n-1)d=5+5\\cdot3=20$。", topic_id="s2-1-1-sequence-recursion-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-002", title="遞迴轉通項（中等01）", chapter_code="s2-1-1", difficulty="中等", question_text="若 $a_1=2,a_n=2a_{n-1}$，求 $a_5$。", answer_text="$a_5=32$。", explanation_text="此為等比數列，公比 $r=2$，故 $a_5=2\\cdot2^{4}=32$。", topic_id="s2-1-1-sequence-recursion-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-003", title="等差級數（基礎01）", chapter_code="s2-1-2", difficulty="基礎", question_text="等差數列 $3,5,7,\\ldots$ 前 $10$ 項和為何？", answer_text="$S_{10}=120$。", explanation_text="$a_1=3,a_{10}=21$，$S_{10}=\\frac{10(3+21)}{2}=120$。", topic_id="s2-1-2-series-sigma-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-004", title="由和反推項（中等01）", chapter_code="s2-1-2", difficulty="中等", question_text="若 $S_n=n^2+2n$，求 $a_n$。", answer_text="$a_n=2n+1$。", explanation_text="$a_n=S_n-S_{n-1}=(n^2+2n)-[(n-1)^2+2(n-1)]=2n+1$。", topic_id="s2-1-2-series-sigma-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-005", title="德摩根律（基礎01）", chapter_code="s2-2-1", difficulty="基礎", question_text="化簡 $\\neg(p\\land q)$。", answer_text="$\\neg p\\lor\\neg q$。", explanation_text="直接套用德摩根律。", topic_id="s2-2-1-logic-set-counting-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-006", title="集合計數（中等01）", chapter_code="s2-2-1", difficulty="中等", question_text="已知 $|A|=18,|B|=12,|A\\cap B|=5$，求 $|A\\cup B|$。", answer_text="$25$。", explanation_text="$|A\\cup B|=|A|+|B|-|A\\cap B|=18+12-5=25$。", topic_id="s2-2-1-logic-set-counting-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-007", title="排列計算（基礎01）", chapter_code="s2-2-2", difficulty="基礎", question_text="求 $P_3^7$。", answer_text="$210$。", explanation_text="$P_3^7=\\frac{7!}{4!}=7\\cdot6\\cdot5=210$。", topic_id="s2-2-2-permutation-combination-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-008", title="組合計算（中等01）", chapter_code="s2-2-2", difficulty="中等", question_text="求 $C_4^8$。", answer_text="$70$。", explanation_text="$C_4^8=\\frac{8!}{4!4!}=70$。", topic_id="s2-2-2-permutation-combination-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-009", title="指定項係數（中等01）", chapter_code="s2-2-3", difficulty="中等", question_text="$(x+y)^6$ 中 $x^2y^4$ 的係數為何？", answer_text="$15$。", explanation_text="$x^2y^4$ 對應 $r=4$，係數為 $C_4^6=15$。", topic_id="s2-2-3-binomial-theorem-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-010", title="係數和（基礎01）", chapter_code="s2-2-3", difficulty="基礎", question_text="$(x+y)^8$ 的所有係數和為何？", answer_text="$256$。", explanation_text="令 $x=y=1$，得 $(1+1)^8=2^8=256$。", topic_id="s2-2-3-binomial-theorem-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-011", title="補事件機率（基礎01）", chapter_code="s2-2-4", difficulty="基礎", question_text="若 $P(A)=0.37$，求 $P(A^c)$。", answer_text="$0.63$。", explanation_text="$P(A^c)=1-P(A)=1-0.37=0.63$。", topic_id="s2-2-4-classical-probability-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-012", title="聯集機率（中等01）", chapter_code="s2-2-4", difficulty="中等", question_text="若 $P(A)=0.6,P(B)=0.5,P(A\\cap B)=0.2$，求 $P(A\\cup B)$。", answer_text="$0.9$。", explanation_text="$P(A\\cup B)=0.6+0.5-0.2=0.9$。", topic_id="s2-2-4-classical-probability-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-013", title="平均數（基礎01）", chapter_code="s2-3-1", difficulty="基礎", question_text="資料 $2,4,6,8$ 的平均數為何？", answer_text="$5$。", explanation_text="$\\mu=\\frac{2+4+6+8}{4}=5$。", topic_id="s2-3-1-one-dimensional-data-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-014", title="標準化（中等01）", chapter_code="s2-3-1", difficulty="中等", question_text="若某生分數 $x=78$，全班平均 $\\mu=70$，標準差 $\\sigma=8$，求 $z$。", answer_text="$z=1$。", explanation_text="$z=\\frac{x-\\mu}{\\sigma}=\\frac{78-70}{8}=1$。", topic_id="s2-3-1-one-dimensional-data-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-015", title="相關方向判讀（基礎01）", chapter_code="s2-3-2", difficulty="基礎", question_text="若散佈圖呈明顯右上趨勢，則 $r$ 的正負為何？", answer_text="$r>0$。", explanation_text="右上趨勢代表正相關。", topic_id="s2-3-2-two-dimensional-data-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-016", title="回歸線斜率（中等01）", chapter_code="s2-3-2", difficulty="中等", question_text="若每當 $x$ 增加 $1$，$y$ 平均增加 $2$，回歸線斜率 $b$ 為何？", answer_text="$b=2$。", explanation_text="斜率即單位 $x$ 增量對應的 $y$ 平均改變量。", topic_id="s2-3-2-two-dimensional-data-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-017", title="三角比定義（基礎01）", chapter_code="s2-4-1", difficulty="基礎", question_text="直角三角形兩股為 $3,4$，斜邊為 $5$，取對邊為 $3$ 的銳角 $A$，求 $\\sin A$。", answer_text="$\\frac{3}{5}$。", explanation_text="$\\sin A=\\frac{\\text{對邊}}{\\text{斜邊}}=\\frac35$。", topic_id="s2-4-1-trigonometric-ratio-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-018", title="恆等式化簡（中等01）", chapter_code="s2-4-1", difficulty="中等", question_text="已知 $\\sin\\theta=\\frac35$（第一象限），求 $\\cos\\theta$。", answer_text="$\\frac45$。", explanation_text="由 $\\sin^2\\theta+\\cos^2\\theta=1$，得 $\\cos\\theta=\\sqrt{1-\\left(\\frac35\\right)^2}=\\frac45$。", topic_id="s2-4-1-trigonometric-ratio-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-019", title="正弦定理（中等01）", chapter_code="s2-4-2", difficulty="中等", question_text="在 $\\triangle ABC$ 中，$a=8,\\ A=30^\\circ,\\ B=45^\\circ$，求 $b$。", answer_text="$b=8\\sqrt2$。", explanation_text="$\\frac{a}{\\sin A}=\\frac{b}{\\sin B}\\Rightarrow b=\\frac{8\\sin45^\\circ}{\\sin30^\\circ}=8\\sqrt2$。", topic_id="s2-4-2-sine-cosine-law-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-020", title="餘弦定理（中等02）", chapter_code="s2-4-2", difficulty="中等", question_text="若兩邊 $b=5,c=7$，夾角 $A=60^\\circ$，求 $a$。", answer_text="$\\sqrt{39}$。", explanation_text="$a^2=5^2+7^2-2\\cdot5\\cdot7\\cos60^\\circ=39$，故 $a=\\sqrt{39}$。", topic_id="s2-4-2-sine-cosine-law-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-021", title="三角形面積（基礎01）", chapter_code="s2-4-3", difficulty="基礎", question_text="若兩邊長為 $6,8$，夾角為 $30^\\circ$，求面積。", answer_text="$12$。", explanation_text="$\\Delta=\\frac12\\cdot6\\cdot8\\cdot\\sin30^\\circ=12$。", topic_id="s2-4-3-triangle-measurement-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-022", title="海龍公式（中等01）", chapter_code="s2-4-3", difficulty="中等", question_text="三角形三邊為 $13,14,15$，求面積。", answer_text="$84$。", explanation_text="$s=\\frac{13+14+15}{2}=21$，$\\Delta=\\sqrt{21\\cdot8\\cdot7\\cdot6}=84$。", topic_id="s2-4-3-triangle-measurement-core", chapter_names=chapter_names),
        question_row(id_="q-s2-full-023", title="整合選式（基礎01）", chapter_code="s2-x", difficulty="基礎", question_text="已知題目要求『前 $n$ 項總和』，第一步應先判斷哪一類型？", answer_text="先判斷是等差級數、等比級數或其他遞迴級數。", explanation_text="先分類再選公式可避免誤用。", topic_id="s2-x-integrated-checklist", chapter_names=chapter_names),
        question_row(id_="q-s2-full-024", title="綜合檢核（中等01）", chapter_code="s2-x", difficulty="中等", question_text="一題同時出現『計數』與『機率』，應如何解題？", answer_text="先用計數原理求樣本空間與事件數，再代入機率公式。", explanation_text="機率題常以前段計數作為基礎。", topic_id="s2-x-integrated-checklist", chapter_names=chapter_names),
    ]


def main():
    chapter_names = build_chapter_names()
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

    new_topics = build_topics(chapter_names)
    new_questions = build_questions(chapter_names)
    target_topic_ids = [t["id"] for t in new_topics]
    target_question_ids = [q["id"] for q in new_questions]

    try:
        backups.append(backup_file(FORMULA_DB, "pre-s2-prefix"))
        backups.append(backup_file(QUESTION_DB, "pre-s2-prefix"))

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
