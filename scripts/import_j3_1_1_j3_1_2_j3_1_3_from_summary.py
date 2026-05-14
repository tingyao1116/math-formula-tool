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
    r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國二上1  乘法公式與多項式.docx"
)
SUMMARY_WORD = str(ROOT / "exports" / "word-j3-1-1-2-3" / "改國二上1_乘法公式與多項式_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j3-1-1": "乘法公式",
    "j3-1-2": "多項式的加減",
    "j3-1-3": "多項式的乘除",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j3-1-1-2-3-{ts}{path.suffix}"
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
        "grade": "國二",
        "term": "上學期",
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
        "grade": "國二",
        "chapter": chapter,
        "difficulty": difficulty,
        "source_type": "word_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word題庫", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    rows = []

    rows.extend(
        [
            topic_row(
                id_="j3-1-1-square-formulas",
                title="平方公式總覽",
                chapter_code="j3-1-1",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("平方和", r"$(a+b)^2=a^2+2ab+b^2$"),
                    ("平方差", r"$(a-b)^2=a^2-2ab+b^2$"),
                ],
                usage=["判斷展開與因式回推時的核心模板。"],
                examples=[r"$(x+5)^2=x^2+10x+25$"],
                tips=["看到平方先看中間項是否為 $2ab$。"],
                notes=["平方題通常先辨識正負號，再決定中間項符號。"],
                mistakes=["把 $(a-b)^2$ 展成 $a^2-b^2$。"],
            ),
            topic_row(
                id_="j3-1-1-sum-diff-product",
                title="和差積與平方差",
                chapter_code="j3-1-1",
                chapter_role="公式與性質",
                difficulty="基礎",
                formula_lines=[
                    ("和差積", r"$(a+b)(a-b)=a^2-b^2$"),
                    ("逆向辨識", r"$a^2-b^2=(a+b)(a-b)$"),
                ],
                usage=["快速計算與因式分解前置判斷。"],
                examples=[r"$103\times97=(100+3)(100-3)=10000-9$"],
                tips=["兩括號只有中間符號不同，多半可用平方差。"],
                notes=["心算題很常用此公式減少乘法量。"],
                mistakes=["把和差積錯寫成 $a^2+b^2$。"],
            ),
            topic_row(
                id_="j3-1-1-cubic-formulas",
                title="立方公式與係數規律",
                chapter_code="j3-1-1",
                chapter_role="核心概念",
                difficulty="中等",
                formula_lines=[
                    ("立方和", r"$(a+b)^3=a^3+3a^2b+3ab^2+b^3$"),
                    ("立方差", r"$(a-b)^3=a^3-3a^2b+3ab^2-b^3$"),
                ],
                usage=["展開四項式或比對係數時。"],
                examples=[r"$(2x-1)^3=8x^3-12x^2+6x-1$"],
                tips=[r"係數順序可記成 $1,3,3,1$。"],
                notes=["符號會跟著括號正負交替變化。"],
                mistakes=["漏寫中間兩項之一。"],
            ),
            topic_row(
                id_="j3-1-1-formula-reverse",
                title="公式逆用與配型",
                chapter_code="j3-1-1",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("完全平方型", r"$a^2\pm2ab+b^2=(a\pm b)^2$"),
                    ("平方差型", r"$a^2-b^2=(a+b)(a-b)$"),
                ],
                usage=["由展開式回推原式、估算或簡化算式。"],
                examples=[r"$x^2+14x+49=(x+7)^2$"],
                tips=["先看首尾項是否為平方，再檢查中間項。"],
                notes=["逆用時要小心常數項與中間項是否匹配。"],
                mistakes=["看到三項就直接判斷為完全平方。"],
            ),
            topic_row(
                id_="j3-1-1-mental-arithmetic",
                title="乘法公式心算應用",
                chapter_code="j3-1-1",
                chapter_role="典型題型",
                difficulty="進階",
                formula_lines=[
                    ("近百數乘積", r"$(n+a)(n-a)=n^2-a^2$"),
                    ("平方近似", r"$(n\pm a)^2=n^2\pm2na+a^2$"),
                ],
                usage=["計算接近整百、整千的數值題。"],
                examples=[r"$998^2=(1000-2)^2=1000000-4000+4$"],
                tips=["先抓中心數 $n$，再找偏差 $a$。"],
                notes=["可先估大概範圍，再精算。"],
                mistakes=["忘記加回 $a^2$。"],
            ),
            topic_row(
                id_="j3-1-1-sign-check",
                title="公式符號檢查策略",
                chapter_code="j3-1-1",
                chapter_role="易錯陷阱",
                difficulty="進階",
                formula_lines=[
                    ("平方差", r"$(a-b)^2$ 的中間項是 $-2ab$"),
                    ("立方差", r"$(a-b)^3$ 的符號為 $+,-,+,-$"),
                ],
                usage=["避免公式套用時符號錯誤。"],
                examples=[r"$(x-3)^2=x^2-6x+9$"],
                tips=["展開後先代入簡單數（如 $a=2,b=1$）檢查。"],
                notes=["檢查符號比重算更快。"],
                mistakes=["把所有中間項都寫成正號。"],
            ),
        ]
    )

    rows.extend(
        [
            topic_row(
                id_="j3-1-2-poly-terms-degree",
                title="多項式、項與次數",
                chapter_code="j3-1-2",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("多項式", r"$a_nx^n+\cdots+a_1x+a_0$"),
                    ("次數", r"$\deg(P)=\text{最高次方}$"),
                ],
                usage=["判斷式子類型與整理前置。"],
                examples=[r"$5x^3-2x+1$ 為三次多項式"],
                tips=["項包含前面的正負號。"],
                notes=["先分項再談同類項。"],
                mistakes=["把係數當次數。"],
            ),
            topic_row(
                id_="j3-1-2-like-terms",
                title="同類項合併",
                chapter_code="j3-1-2",
                chapter_role="公式與性質",
                difficulty="基礎",
                formula_lines=[
                    ("同類項", r"$ax^k+bx^k=(a+b)x^k$"),
                    ("不同類項", r"$x^2,\ x,\ 常數\ \text{不可互加}$"),
                ],
                usage=["多項式加減核心運算。"],
                examples=[r"$3x^2-5x^2=-2x^2$"],
                tips=["先按次方分類，再算係數。"],
                notes=["同類項只看變數與次方，不看係數。"],
                mistakes=["把 $x^2$ 與 $x$ 合併。"],
            ),
            topic_row(
                id_="j3-1-2-remove-parentheses",
                title="去括號與負號分配",
                chapter_code="j3-1-2",
                chapter_role="核心概念",
                difficulty="中等",
                formula_lines=[
                    ("正號括號", r"$+(a-b+c)=a-b+c$"),
                    ("負號括號", r"$-(a-b+c)=-a+b-c$"),
                ],
                usage=["處理橫式加減題必備。"],
                examples=[r"$3x-(2x-5)=x+5$"],
                tips=["負號在前就整包變號。"],
                notes=["可先用顏色標記變號項。"],
                mistakes=["只變第一項符號。"],
            ),
            topic_row(
                id_="j3-1-2-add-sub-vertical",
                title="多項式加減直式",
                chapter_code="j3-1-2",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("對齊原則", r"同次項上下對齊後相加減"),
                    ("缺項補零", r"$x^3+2x\equiv x^3+0x^2+2x+0$"),
                ],
                usage=["高次多項式較長時降低漏算。"],
                examples=[r"$(x^3+2x)-(3x^3-x^2+1)$"],
                tips=["先補缺次項再列直式。"],
                notes=["直式常比橫式不易錯。"],
                mistakes=["未對齊次數直接相減。"],
            ),
            topic_row(
                id_="j3-1-2-standard-form",
                title="升冪降冪與標準形",
                chapter_code="j3-1-2",
                chapter_role="易錯陷阱",
                difficulty="進階",
                formula_lines=[
                    ("降冪", r"$x^4,\ x^3,\ x^2,\ x,\ 1$"),
                    ("標準形", r"$P(x)=a_nx^n+\cdots+a_0$"),
                ],
                usage=["整理答案與比對題目標準格式。"],
                examples=[r"$-2+3x^2-x$ 可寫成 $3x^2-x-2$"],
                tips=["算完最後一步固定改成降冪。"],
                notes=["標準形有助於判斷次數與係數。"],
                mistakes=["答案次序混亂造成誤判。"],
            ),
        ]
    )

    rows.extend(
        [
            topic_row(
                id_="j3-1-3-distributive-mul",
                title="分配律與乘法展開",
                chapter_code="j3-1-3",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("分配律", r"$a(b+c)=ab+ac$"),
                    ("雙括號", r"$(a+b)(c+d)=ac+ad+bc+bd$"),
                ],
                usage=["多項式乘法最基本步驟。"],
                examples=[r"$(2x+3)(x-4)=2x^2-5x-12$"],
                tips=["每一項都要乘到，建議畫箭頭。"],
                notes=["先展開再合併同類項。"],
                mistakes=["漏乘某一項。"],
            ),
            topic_row(
                id_="j3-1-3-vertical-mul",
                title="多項式直式乘法",
                chapter_code="j3-1-3",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("逐項相乘", r"$P(x)\times Q(x)$ 逐列計算"),
                    ("對齊次數", r"同次項最後再相加"),
                ],
                usage=["高次式乘法避免遺漏。"],
                examples=[r"$(x^2+x+1)(x+2)$"],
                tips=["每列對應乘數的一項。"],
                notes=["直式適合三項以上相乘。"],
                mistakes=["列與列相加時次數對錯。"],
            ),
            topic_row(
                id_="j3-1-3-long-division",
                title="多項式長除法",
                chapter_code="j3-1-3",
                chapter_role="核心概念",
                difficulty="中等",
                formula_lines=[
                    ("步驟", r"最高次項相除 $\rightarrow$ 回乘 $\rightarrow$ 相減"),
                    ("停止條件", r"$\deg(R)<\deg(D)$"),
                ],
                usage=["求商式與餘式。"],
                examples=[r"$(x^3-1)\div(x-1)=x^2+x+1$"],
                tips=["每一步先看最高次項。"],
                notes=["相減前先補缺項。"],
                mistakes=["停止條件判斷錯誤。"],
            ),
            topic_row(
                id_="j3-1-3-division-check",
                title="商式餘式驗算",
                chapter_code="j3-1-3",
                chapter_role="公式與性質",
                difficulty="進階",
                formula_lines=[
                    ("驗算式", r"$P(x)=D(x)\cdot Q(x)+R(x)$"),
                    ("餘式條件", r"$\deg(R)<\deg(D)$"),
                ],
                usage=["檢核長除法是否正確。"],
                examples=[r"$x^2+3x+2=(x+1)(x+2)+0$"],
                tips=["做完長除法一定回代驗算。"],
                notes=["有餘式時特別要檢查次數。"],
                mistakes=["驗算只看常數項不看全式。"],
            ),
            topic_row(
                id_="j3-1-3-mixed-operation",
                title="乘除混合運算順序",
                chapter_code="j3-1-3",
                chapter_role="典型題型",
                difficulty="進階",
                formula_lines=[
                    ("先乘除後加減", r"先完成括號與乘除，再做加減"),
                    ("化簡策略", r"能先因式分解則先分解再約簡"),
                ],
                usage=["多步驟題目避免混算。"],
                examples=[r"$(x+1)(x-1)+2x=x^2+2x-1$"],
                tips=["每一步只做一件事，避免心算跳步。"],
                notes=["中間結果盡量保留標準形。"],
                mistakes=["先加減後乘除。"],
            ),
            topic_row(
                id_="j3-1-3-sign-missing-term",
                title="缺項與符號錯誤防呆",
                chapter_code="j3-1-3",
                chapter_role="易錯陷阱",
                difficulty="進階",
                formula_lines=[
                    ("缺項補零", r"$x^3+1=x^3+0x^2+0x+1$"),
                    ("符號檢查", r"每次相減視為加上相反數"),
                ],
                usage=["長除法、直式乘法的錯誤預防。"],
                examples=[r"$(x^2-1)-(x^2+2x-3)=-2x+2$"],
                tips=["用括號保護整列再去括號。"],
                notes=["補零可以大幅降低遺漏次方。"],
                mistakes=["相減時符號整列翻錯。"],
            ),
        ]
    )

    return rows


def build_questions() -> List[Dict]:
    rows = []

    rows.extend(
        [
            question_row(
                id_="q-j3-1-1-word01-001",
                title="平方展開（基礎01）",
                chapter_code="j3-1-1",
                difficulty="基礎",
                question_text=r"展開：$(x+4)^2$。",
                answer_text=r"$x^2+8x+16$",
                explanation_text=r"套用 $(a+b)^2=a^2+2ab+b^2$。",
                topic_id="j3-1-1-square-formulas",
            ),
            question_row(
                id_="q-j3-1-1-word01-002",
                title="平方展開（基礎02）",
                chapter_code="j3-1-1",
                difficulty="基礎",
                question_text=r"展開：$(2x-3)^2$。",
                answer_text=r"$4x^2-12x+9$",
                explanation_text=r"套用 $(a-b)^2=a^2-2ab+b^2$。",
                topic_id="j3-1-1-square-formulas",
            ),
            question_row(
                id_="q-j3-1-1-word01-003",
                title="和差積（基礎03）",
                chapter_code="j3-1-1",
                difficulty="基礎",
                question_text=r"化簡：$(x+7)(x-7)$。",
                answer_text=r"$x^2-49$",
                explanation_text=r"和差積公式 $(a+b)(a-b)=a^2-b^2$。",
                topic_id="j3-1-1-sum-diff-product",
            ),
            question_row(
                id_="q-j3-1-1-word01-004",
                title="逆向配型（基礎04）",
                chapter_code="j3-1-1",
                difficulty="基礎",
                question_text=r"將 $x^2+10x+25$ 寫成平方形式。",
                answer_text=r"$(x+5)^2$",
                explanation_text=r"首尾為平方，中間項為 $2\cdot x\cdot 5$。",
                topic_id="j3-1-1-formula-reverse",
            ),
            question_row(
                id_="q-j3-1-1-word01-005",
                title="立方展開（中等01）",
                chapter_code="j3-1-1",
                difficulty="中等",
                question_text=r"展開：$(x+2)^3$。",
                answer_text=r"$x^3+6x^2+12x+8$",
                explanation_text=r"套用 $(a+b)^3$ 公式。",
                topic_id="j3-1-1-cubic-formulas",
            ),
            question_row(
                id_="q-j3-1-1-word01-006",
                title="立方展開（中等02）",
                chapter_code="j3-1-1",
                difficulty="中等",
                question_text=r"展開：$(2x-1)^3$。",
                answer_text=r"$8x^3-12x^2+6x-1$",
                explanation_text=r"依 $(a-b)^3$ 展開並留意符號。",
                topic_id="j3-1-1-cubic-formulas",
            ),
            question_row(
                id_="q-j3-1-1-word01-007",
                title="公式逆用（中等03）",
                chapter_code="j3-1-1",
                difficulty="中等",
                question_text=r"因式分解：$9x^2-25$。",
                answer_text=r"$(3x+5)(3x-5)$",
                explanation_text=r"$9x^2-25=(3x)^2-5^2$。",
                topic_id="j3-1-1-formula-reverse",
            ),
            question_row(
                id_="q-j3-1-1-word01-008",
                title="係數判斷（中等04）",
                chapter_code="j3-1-1",
                difficulty="中等",
                question_text=r"若 $(x+a)^2=x^2+14x+b$，求 $a,b$。",
                answer_text=r"$a=7,\ b=49$",
                explanation_text=r"比對中間項 $2a=14$ 得 $a=7$，再得 $b=a^2$。",
                topic_id="j3-1-1-sign-check",
            ),
            question_row(
                id_="q-j3-1-1-word01-009",
                title="心算應用（進階01）",
                chapter_code="j3-1-1",
                difficulty="進階",
                question_text=r"利用公式計算：$998^2$。",
                answer_text=r"$996004$",
                explanation_text=r"$(1000-2)^2=1000000-4000+4=996004$。",
                topic_id="j3-1-1-mental-arithmetic",
            ),
            question_row(
                id_="q-j3-1-1-word01-010",
                title="心算應用（進階02）",
                chapter_code="j3-1-1",
                difficulty="進階",
                question_text=r"利用公式計算：$1003\times997$。",
                answer_text=r"$999991$",
                explanation_text=r"$(1000+3)(1000-3)=1000^2-3^2$。",
                topic_id="j3-1-1-mental-arithmetic",
            ),
            question_row(
                id_="q-j3-1-1-word01-011",
                title="符號判斷（進階03）",
                chapter_code="j3-1-1",
                difficulty="進階",
                question_text=r"判斷並改正：$(x-4)^2=x^2-16$。",
                answer_text=r"錯，應為 $x^2-8x+16$",
                explanation_text=r"平方差不是平方公式；$(a-b)^2$ 有三項。",
                topic_id="j3-1-1-sign-check",
            ),
            question_row(
                id_="q-j3-1-1-word01-012",
                title="綜合化簡（進階04）",
                chapter_code="j3-1-1",
                difficulty="進階",
                question_text=r"化簡：$(x+3)^2-(x-3)^2$。",
                answer_text=r"$12x$",
                explanation_text=r"展開相減或用 $(A^2-B^2)=(A+B)(A-B)$。",
                topic_id="j3-1-1-sum-diff-product",
            ),
        ]
    )

    rows.extend(
        [
            question_row(
                id_="q-j3-1-2-word01-013",
                title="次數判斷（基礎01）",
                chapter_code="j3-1-2",
                difficulty="基礎",
                question_text=r"$5x^3-2x+1$ 是幾次多項式？",
                answer_text="三次",
                explanation_text="最高次方是 3。",
                topic_id="j3-1-2-poly-terms-degree",
            ),
            question_row(
                id_="q-j3-1-2-word01-014",
                title="同類項合併（基礎02）",
                chapter_code="j3-1-2",
                difficulty="基礎",
                question_text=r"化簡：$3x^2-5x^2+2x$。",
                answer_text=r"$-2x^2+2x$",
                explanation_text=r"$3x^2-5x^2=-2x^2$，$2x$ 不能再合併。",
                topic_id="j3-1-2-like-terms",
            ),
            question_row(
                id_="q-j3-1-2-word01-015",
                title="同類項合併（基礎03）",
                chapter_code="j3-1-2",
                difficulty="基礎",
                question_text=r"化簡：$4a-7+3a+2$。",
                answer_text=r"$7a-5$",
                explanation_text=r"同類項 $4a+3a=7a$，常數 $-7+2=-5$。",
                topic_id="j3-1-2-like-terms",
            ),
            question_row(
                id_="q-j3-1-2-word01-016",
                title="去括號（基礎04）",
                chapter_code="j3-1-2",
                difficulty="基礎",
                question_text=r"化簡：$x-(2x-5)$。",
                answer_text=r"$-x+5$",
                explanation_text=r"負號分配：$x-2x+5$。",
                topic_id="j3-1-2-remove-parentheses",
            ),
            question_row(
                id_="q-j3-1-2-word01-017",
                title="多項式加法（中等01）",
                chapter_code="j3-1-2",
                difficulty="中等",
                question_text=r"計算：$(2x^2-3x+1)+(x^2+5x-4)$。",
                answer_text=r"$3x^2+2x-3$",
                explanation_text=r"同次項係數相加。",
                topic_id="j3-1-2-add-sub-vertical",
            ),
            question_row(
                id_="q-j3-1-2-word01-018",
                title="多項式減法（中等02）",
                chapter_code="j3-1-2",
                difficulty="中等",
                question_text=r"計算：$(3x^2-x+7)-(x^2+4x-2)$。",
                answer_text=r"$2x^2-5x+9$",
                explanation_text=r"先去括號：$3x^2-x+7-x^2-4x+2$。",
                topic_id="j3-1-2-remove-parentheses",
            ),
            question_row(
                id_="q-j3-1-2-word01-019",
                title="缺項補零（中等03）",
                chapter_code="j3-1-2",
                difficulty="中等",
                question_text=r"計算：$(x^3+2x)-(3x^3-x^2+1)$。",
                answer_text=r"$-2x^3+x^2+2x-1$",
                explanation_text=r"$x^3+0x^2+2x+0-(3x^3-x^2+0x+1)$。",
                topic_id="j3-1-2-add-sub-vertical",
            ),
            question_row(
                id_="q-j3-1-2-word01-020",
                title="標準形改寫（中等04）",
                chapter_code="j3-1-2",
                difficulty="中等",
                question_text=r"把 $-2+3x^2-x$ 改寫成降冪標準形。",
                answer_text=r"$3x^2-x-2$",
                explanation_text="依次數由大到小排列。",
                topic_id="j3-1-2-standard-form",
            ),
            question_row(
                id_="q-j3-1-2-word01-021",
                title="係數求值（進階01）",
                chapter_code="j3-1-2",
                difficulty="進階",
                question_text=r"若 $(ax^2+bx+1)+(2x^2-3x+4)=5x^2+x+5$，求 $a,b$。",
                answer_text=r"$a=3,\ b=4$",
                explanation_text=r"比對同次項係數：$a+2=5,\ b-3=1$。",
                topic_id="j3-1-2-like-terms",
            ),
            question_row(
                id_="q-j3-1-2-word01-022",
                title="雙重去括號（進階02）",
                chapter_code="j3-1-2",
                difficulty="進階",
                question_text=r"化簡：$2(x^2-3x+1)-3(2x^2-x-4)$。",
                answer_text=r"$-4x^2-3x+14$",
                explanation_text=r"分配後合併同類項。",
                topic_id="j3-1-2-remove-parentheses",
            ),
            question_row(
                id_="q-j3-1-2-word01-023",
                title="常數項判斷（進階03）",
                chapter_code="j3-1-2",
                difficulty="進階",
                question_text=r"多項式 $P(x)=4x^3-2x+7$ 與 $Q(x)=-x^3+3x^2-5$，求 $P-Q$ 的常數項。",
                answer_text="12",
                explanation_text=r"$7-(-5)=12$。",
                topic_id="j3-1-2-standard-form",
            ),
            question_row(
                id_="q-j3-1-2-word01-024",
                title="綜合整理（進階04）",
                chapter_code="j3-1-2",
                difficulty="進階",
                question_text=r"化簡：$(x^2-2x+1)+(3x^2+x-4)-(2x^2-5x+6)$。",
                answer_text=r"$2x^2+4x-9$",
                explanation_text=r"先去括號再合併同類項。",
                topic_id="j3-1-2-add-sub-vertical",
            ),
        ]
    )

    rows.extend(
        [
            question_row(
                id_="q-j3-1-3-word01-025",
                title="分配律展開（基礎01）",
                chapter_code="j3-1-3",
                difficulty="基礎",
                question_text=r"展開：$x(2x-5)$。",
                answer_text=r"$2x^2-5x$",
                explanation_text=r"分配律：$x\cdot2x+x\cdot(-5)$。",
                topic_id="j3-1-3-distributive-mul",
            ),
            question_row(
                id_="q-j3-1-3-word01-026",
                title="雙括號展開（基礎02）",
                chapter_code="j3-1-3",
                difficulty="基礎",
                question_text=r"展開：$(x+3)(x+2)$。",
                answer_text=r"$x^2+5x+6$",
                explanation_text=r"四項相乘後合併同類項。",
                topic_id="j3-1-3-distributive-mul",
            ),
            question_row(
                id_="q-j3-1-3-word01-027",
                title="乘法化簡（基礎03）",
                chapter_code="j3-1-3",
                difficulty="基礎",
                question_text=r"化簡：$(2x-1)(x+4)$。",
                answer_text=r"$2x^2+7x-4$",
                explanation_text=r"$2x^2+8x-x-4$。",
                topic_id="j3-1-3-distributive-mul",
            ),
            question_row(
                id_="q-j3-1-3-word01-028",
                title="基本除法（基礎04）",
                chapter_code="j3-1-3",
                difficulty="基礎",
                question_text=r"計算：$(x^2+5x+6)\div(x+2)$。",
                answer_text=r"$x+3$",
                explanation_text=r"可因式分解成 $(x+2)(x+3)$。",
                topic_id="j3-1-3-long-division",
            ),
            question_row(
                id_="q-j3-1-3-word01-029",
                title="直式乘法（中等01）",
                chapter_code="j3-1-3",
                difficulty="中等",
                question_text=r"計算：$(x^2+x+1)(x+2)$。",
                answer_text=r"$x^3+3x^2+3x+2$",
                explanation_text=r"逐項相乘後合併同類項。",
                topic_id="j3-1-3-vertical-mul",
            ),
            question_row(
                id_="q-j3-1-3-word01-030",
                title="直式乘法（中等02）",
                chapter_code="j3-1-3",
                difficulty="中等",
                question_text=r"計算：$(2x^2-3x+1)(x-2)$。",
                answer_text=r"$2x^3-7x^2+7x-2$",
                explanation_text=r"分別乘上 $x$ 與 $-2$ 再相加。",
                topic_id="j3-1-3-vertical-mul",
            ),
            question_row(
                id_="q-j3-1-3-word01-031",
                title="長除法（中等03）",
                chapter_code="j3-1-3",
                difficulty="中等",
                question_text=r"計算：$(x^3-1)\div(x-1)$。",
                answer_text=r"$x^2+x+1$",
                explanation_text=r"長除法或公式 $x^3-1=(x-1)(x^2+x+1)$。",
                topic_id="j3-1-3-long-division",
            ),
            question_row(
                id_="q-j3-1-3-word01-032",
                title="長除法（中等04）",
                chapter_code="j3-1-3",
                difficulty="中等",
                question_text=r"計算：$(2x^2+3x-5)\div(x+2)$ 的商與餘式。",
                answer_text=r"商 $2x-1$，餘式 $-3$",
                explanation_text=r"回代驗算：$(x+2)(2x-1)-3=2x^2+3x-5$。",
                topic_id="j3-1-3-division-check",
            ),
            question_row(
                id_="q-j3-1-3-word01-033",
                title="驗算判斷（進階01）",
                chapter_code="j3-1-3",
                difficulty="進階",
                question_text=r"若 $P(x)\div(x-1)$ 得商 $x+2$、餘式 $3$，寫出 $P(x)$。",
                answer_text=r"$x^2+x+1$",
                explanation_text=r"$P=(x-1)(x+2)+3=x^2+x+1$。",
                topic_id="j3-1-3-division-check",
            ),
            question_row(
                id_="q-j3-1-3-word01-034",
                title="運算順序（進階02）",
                chapter_code="j3-1-3",
                difficulty="進階",
                question_text=r"化簡：$(x+1)(x-1)+2x-(x^2-3)$。",
                answer_text=r"$2x+2$",
                explanation_text=r"先乘法得 $x^2-1+2x-x^2+3=2x+2$。",
                topic_id="j3-1-3-mixed-operation",
            ),
            question_row(
                id_="q-j3-1-3-word01-035",
                title="缺項防呆（進階03）",
                chapter_code="j3-1-3",
                difficulty="進階",
                question_text=r"化簡：$(x^2-1)-(x^2+2x-3)$。",
                answer_text=r"$-2x+2$",
                explanation_text=r"相減視為加相反數：$x^2-1-x^2-2x+3$。",
                topic_id="j3-1-3-sign-missing-term",
            ),
            question_row(
                id_="q-j3-1-3-word01-036",
                title="綜合乘除（進階04）",
                chapter_code="j3-1-3",
                difficulty="進階",
                question_text=r"若 $(x^2+5x+6)\div(x+2)=Q(x)$，再求 $Q(x)(x-1)$。",
                answer_text=r"$x^2+2x-3$",
                explanation_text=r"先得 $Q(x)=x+3$，再乘 $(x-1)$ 得 $x^2+2x-3$。",
                topic_id="j3-1-3-mixed-operation",
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
