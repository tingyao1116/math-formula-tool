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

SOURCE_WORD = r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國二上3 因式分解.docx"
SUMMARY_WORD = str(ROOT / "exports" / "word-j3-3-1-2-3" / "改國二上3_因式分解_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j3-3-1": "利用提公因式因式分解",
    "j3-3-2": "利用乘法公式因式分解",
    "j3-3-3": "利用十字交乘因式分解",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j3-3-1-2-3-{ts}{path.suffix}"
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
        "parentId": "",
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
                id_="j3-3-1-common-factor-main",
                title="提公因式基本法",
                chapter_code="j3-3-1",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("核心", r"$ab+ac=a(b+c)$"),
                    ("逆向", r"$a(b+c)\Rightarrow ab+ac$"),
                ],
                usage=["先找每一項共同因式，快速完成第一步分解。"],
                examples=[r"$6x^2+9x=3x(2x+3)$"],
                tips=["先找最大公因數，再看字母最低次方。"],
                notes=["提完後括號內應無共同因式可再提。"],
                mistakes=["提因式後括號內係數算錯。"],
            ),
            topic_row(
                id_="j3-3-1-number-letter-gcf",
                title="數字與字母公因式",
                chapter_code="j3-3-1",
                chapter_role="公式與性質",
                difficulty="基礎",
                formula_lines=[
                    ("數字", r"$\gcd(12,18)=6$"),
                    ("字母", r"$x^3,x^2\Rightarrow x^2$"),
                ],
                usage=["含係數與次方的提公因式題。"],
                examples=[r"$12x^3-18x^2=6x^2(2x-3)$"],
                tips=["字母次方取最小次方，不是最大。"],
                notes=["數字與字母要同時考慮。"],
                mistakes=["把 $x^3$ 與 $x^2$ 誤提成 $x^3$。"],
            ),
            topic_row(
                id_="j3-3-1-grouping-factor",
                title="分組提公因式",
                chapter_code="j3-3-1",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("分組", r"$ax+ay+bx+by=a(x+y)+b(x+y)$"),
                    ("再提", r"$(x+y)(a+b)$"),
                ],
                usage=["各項無整體公因式時，先分組再提。"],
                examples=[r"$x^2+3x+2x+6=(x+3)(x+2)$"],
                tips=["分組目標是做出相同括號。"],
                notes=["分組方式不只一種，可多嘗試。"],
                mistakes=["兩組括號不同卻硬合併。"],
            ),
            topic_row(
                id_="j3-3-1-sign-adjust-factor",
                title="提負號與變號整理",
                chapter_code="j3-3-1",
                chapter_role="易錯陷阱",
                difficulty="中等",
                formula_lines=[
                    ("提負號", r"$-(a-b)=(-1)(a-b)=b-a$"),
                    ("常見", r"$-ax-ab=-a(x+b)$"),
                ],
                usage=["避免首項負號造成後續判斷失誤。"],
                examples=[r"$-3x^2+6x=-3x(x-2)$"],
                tips=["必要時先提 $-1$，讓括號首項正。"],
                notes=["提負號時括號內每項都要變號。"],
                mistakes=["只改第一項符號。"],
            ),
            topic_row(
                id_="j3-3-1-bracket-common-factor",
                title="整塊括號視為公因式",
                chapter_code="j3-3-1",
                chapter_role="核心概念",
                difficulty="進階",
                formula_lines=[
                    ("整塊", r"$(a+b)c+(a+b)d=(a+b)(c+d)$"),
                    ("辨識", r"先把重複括號視為一個字母"),
                ],
                usage=["複合表達式與多層括號題。"],
                examples=[r"$(x-2)(x+3)+2(x-2)=(x-2)(x+5)$"],
                tips=["重複括號可設 $A$，簡化觀察。"],
                notes=["括號一致性要完全相同（順序與符號）。"],
                mistakes=["把 $(x-2)$ 與 $(2-x)$ 當同一公因式。"],
            ),
            topic_row(
                id_="j3-3-1-multiply-back-check",
                title="回乘驗證策略",
                chapter_code="j3-3-1",
                chapter_role="典型題型",
                difficulty="進階",
                formula_lines=[
                    ("驗證", r"$\text{分解後回乘}= \text{原式}$"),
                    ("流程", r"$\text{分解}\rightarrow\text{回乘}\rightarrow\text{比對}$"),
                ],
                usage=["檢查分解是否正確與是否分解完全。"],
                examples=[r"$(x+1)(x+2)=x^2+3x+2$"],
                tips=["最後一步固定回乘，降低粗心失誤。"],
                notes=["可順便檢查是否還能再分解。"],
                mistakes=["不驗算就直接交卷。"],
            ),
        ]
    )

    rows.extend(
        [
            topic_row(
                id_="j3-3-2-diff-square-factor",
                title="平方差公式因式分解",
                chapter_code="j3-3-2",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("公式", r"$a^2-b^2=(a+b)(a-b)$"),
                    ("逆用", r"$\text{兩項且皆平方，符號減}$"),
                ],
                usage=["快速分解二項式。"],
                examples=[r"$9x^2-25=(3x+5)(3x-5)$"],
                tips=["先確認兩項都能寫成平方。"],
                notes=["平方差通常可再搭配提公因式。"],
                mistakes=[r"誤寫成 $(a-b)^2$。"],
            ),
            topic_row(
                id_="j3-3-2-perfect-square-factor",
                title="完全平方公式因式分解",
                chapter_code="j3-3-2",
                chapter_role="公式與性質",
                difficulty="基礎",
                formula_lines=[
                    ("正型", r"$a^2+2ab+b^2=(a+b)^2$"),
                    ("負型", r"$a^2-2ab+b^2=(a-b)^2$"),
                ],
                usage=["三項式快速判型與分解。"],
                examples=[r"$x^2+10x+25=(x+5)^2$"],
                tips=[r"中間項必須是 $\pm2ab$。"],
                notes=["先找首尾平方，再驗中項。"],
                mistakes=["中間項係數對不上卻硬配。"],
            ),
            topic_row(
                id_="j3-3-2-formula-recognition",
                title="公式辨識與套用順序",
                chapter_code="j3-3-2",
                chapter_role="核心概念",
                difficulty="中等",
                formula_lines=[
                    ("判型", r"$\text{先看項數，再看符號與平方型態}$"),
                    ("順序", r"$\text{提公因式}\rightarrow\text{再套公式}$"),
                ],
                usage=["混合題決定最佳分解路徑。"],
                examples=[r"$2x^2-18=2(x^2-9)=2(x+3)(x-3)$"],
                tips=["不是所有三項式都能用完全平方。"],
                notes=["先整理成標準形再判型。"],
                mistakes=["忽略先提公因式導致卡住。"],
            ),
            topic_row(
                id_="j3-3-2-recursive-factor",
                title="連續分解到最終形",
                chapter_code="j3-3-2",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("持續分解", r"$a^4-b^4=(a^2-b^2)(a^2+b^2)$"),
                    ("停止條件", r"$\text{每一因式不可再分}$"),
                ],
                usage=["高次式多步分解。"],
                examples=[r"$x^4-16=(x^2-4)(x^2+4)=(x-2)(x+2)(x^2+4)$"],
                tips=["每一步都問：是否還能再分解？"],
                notes=["二次和式多半在國中範圍不可再分。"],
                mistakes=["分解到一半就停。"],
            ),
            topic_row(
                id_="j3-3-2-formula-value",
                title="因式分解與代值運算",
                chapter_code="j3-3-2",
                chapter_role="典型題型",
                difficulty="進階",
                formula_lines=[
                    ("心算", r"$(n+a)(n-a)=n^2-a^2$"),
                    ("平方", r"$(n\pm a)^2=n^2\pm2na+a^2$"),
                ],
                usage=["搭配公式求值與簡化計算。"],
                examples=[r"$9998^2-4=(9998+2)(9998-2)$"],
                tips=["先配成公式型再代入。"],
                notes=["公式求值可大幅減少筆算量。"],
                mistakes=["公式配型錯誤導致數值偏差。"],
            ),
        ]
    )

    rows.extend(
        [
            topic_row(
                id_="j3-3-3-cross-main",
                title="十字交乘基本法",
                chapter_code="j3-3-3",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("型態", r"$ax^2+bx+c$"),
                    ("目標", r"$ac\text{ 的因數配對，和為 }b$"),
                ],
                usage=["二次三項式標準分解。"],
                examples=[r"$x^2+5x+6=(x+2)(x+3)$"],
                tips=["先列出 $ac$ 所有因數配對。"],
                notes=["符號決定因數正負。"],
                mistakes=["只看乘積不看中間項和。"],
            ),
            topic_row(
                id_="j3-3-3-ac-pair-selection",
                title="ac 配對與符號判斷",
                chapter_code="j3-3-3",
                chapter_role="公式與性質",
                difficulty="基礎",
                formula_lines=[
                    ("配對", r"$m\cdot n=ac,\ m+n=b$"),
                    ("符號", r"$c>0\Rightarrow m,n\text{ 同號};\ c<0\Rightarrow 異號$"),
                ],
                usage=["快速縮小可能因數組合。"],
                examples=[r"$x^2-x-6$ 配到 $-3,2$。"],
                tips=["先用符號判斷，再看數值大小。"],
                notes=["符號判斷可省去大量試誤。"],
                mistakes=["忽略負號造成全錯。"],
            ),
            topic_row(
                id_="j3-3-3-split-middle-term",
                title="拆中項再分組",
                chapter_code="j3-3-3",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("拆項", r"$ax^2+bx+c=ax^2+mx+nx+c$"),
                    ("分組", r"$=x(ax+m)+n(ax+m)$"),
                ],
                usage=["首項係數不為 1 的交乘題。"],
                examples=[r"$6x^2+11x+3=6x^2+9x+2x+3=(3x+1)(2x+3)$"],
                tips=["拆中項兩數乘積必為 $ac$。"],
                notes=["拆完後應可分組提公因式。"],
                mistakes=["拆中項乘積算錯。"],
            ),
            topic_row(
                id_="j3-3-3-leading-coef-not-one",
                title="首項係數不為 1",
                chapter_code="j3-3-3",
                chapter_role="核心概念",
                difficulty="中等",
                formula_lines=[
                    ("一般型", r"$ax^2+bx+c=(px+q)(rx+s)$"),
                    ("條件", r"$pr=a,\ qs=c,\ ps+qr=b$"),
                ],
                usage=["中高階二次三項式分解。"],
                examples=[r"$8x^2-2x-3=(4x-3)(2x+1)$"],
                tips=["先分配首尾係數，再交叉檢查中項。"],
                notes=["可與拆中項法互相驗證。"],
                mistakes=["只試常數項，忽略首項分配。"],
            ),
            topic_row(
                id_="j3-3-3-pre-cleaning",
                title="先整理再十字交乘",
                chapter_code="j3-3-3",
                chapter_role="典型題型",
                difficulty="進階",
                formula_lines=[
                    ("前處理", r"$\text{先移項、合併同類項、提公因式}$"),
                    ("再交乘", r"$\text{整理成 }ax^2+bx+c$ 再做十字交乘"),
                ],
                usage=["複合題與非標準形題目。"],
                examples=[r"$2x^2-2x-12=2(x^2-x-6)=2(x-3)(x+2)$"],
                tips=["不標準形先整理，交乘才不會混亂。"],
                notes=["有公因式時先提可大幅降難度。"],
                mistakes=["未整理直接交乘導致配對失敗。"],
            ),
            topic_row(
                id_="j3-3-3-cross-validation",
                title="展開回驗與完整分解",
                chapter_code="j3-3-3",
                chapter_role="易錯陷阱",
                difficulty="進階",
                formula_lines=[
                    ("回驗", r"$(px+q)(rx+s)\Rightarrow ax^2+bx+c$"),
                    ("完整", r"$\text{所有因式皆不可再分}$"),
                ],
                usage=["確保十字交乘結果正確。"],
                examples=[r"$(3x+1)(2x-5)=6x^2-13x-5$"],
                tips=["最後固定展開回驗一遍。"],
                notes=["可同時檢查是否還有公因式。"],
                mistakes=["配到一組就結束不回驗。"],
            ),
        ]
    )

    return rows


def build_questions() -> List[Dict]:
    rows = []

    rows.extend(
        [
            question_row(
                id_="q-j3-3-1-word03-001",
                title="提公因式（基礎01）",
                chapter_code="j3-3-1",
                difficulty="基礎",
                question_text=r"因式分解：$8x+12$。",
                answer_text=r"$4(2x+3)$",
                explanation_text=r"各項最大公因數為 4。",
                topic_id="j3-3-1-common-factor-main",
            ),
            question_row(
                id_="q-j3-3-1-word03-002",
                title="提公因式（基礎02）",
                chapter_code="j3-3-1",
                difficulty="基礎",
                question_text=r"因式分解：$15x^2y-20xy^2$。",
                answer_text=r"$5xy(3x-4y)$",
                explanation_text=r"提 $5xy$ 後括號內剩 $3x-4y$。",
                topic_id="j3-3-1-number-letter-gcf",
            ),
            question_row(
                id_="q-j3-3-1-word03-003",
                title="分組提公因式（基礎03）",
                chapter_code="j3-3-1",
                difficulty="基礎",
                question_text=r"因式分解：$x^2+5x+2x+10$。",
                answer_text=r"$(x+5)(x+2)$",
                explanation_text=r"分組：$x(x+5)+2(x+5)$。",
                topic_id="j3-3-1-grouping-factor",
            ),
            question_row(
                id_="q-j3-3-1-word03-004",
                title="提負號（基礎04）",
                chapter_code="j3-3-1",
                difficulty="基礎",
                question_text=r"因式分解：$-6x^2+9x$。",
                answer_text=r"$-3x(2x-3)$",
                explanation_text=r"先提 $-3x$ 可使括號首項為正。",
                topic_id="j3-3-1-sign-adjust-factor",
            ),
            question_row(
                id_="q-j3-3-1-word03-005",
                title="括號公因式（中等01）",
                chapter_code="j3-3-1",
                difficulty="中等",
                question_text=r"因式分解：$(x-1)(x+4)+3(x-1)$。",
                answer_text=r"$(x-1)(x+7)$",
                explanation_text=r"整塊 $(x-1)$ 為公因式。",
                topic_id="j3-3-1-bracket-common-factor",
            ),
            question_row(
                id_="q-j3-3-1-word03-006",
                title="分組提公因式（中等02）",
                chapter_code="j3-3-1",
                difficulty="中等",
                question_text=r"因式分解：$3x^2-6x+2x-4$。",
                answer_text=r"$(3x+2)(x-2)$",
                explanation_text=r"$3x(x-2)+2(x-2)$。",
                topic_id="j3-3-1-grouping-factor",
            ),
            question_row(
                id_="q-j3-3-1-word03-007",
                title="高次公因式（中等03）",
                chapter_code="j3-3-1",
                difficulty="中等",
                question_text=r"因式分解：$18x^4-12x^3+6x^2$。",
                answer_text=r"$6x^2(3x^2-2x+1)$",
                explanation_text=r"最大公因式為 $6x^2$。",
                topic_id="j3-3-1-number-letter-gcf",
            ),
            question_row(
                id_="q-j3-3-1-word03-008",
                title="先變號再提（中等04）",
                chapter_code="j3-3-1",
                difficulty="中等",
                question_text=r"因式分解：$x-x^2$。",
                answer_text=r"$x(1-x)$",
                explanation_text=r"可先提 $x$，也可寫成 $-x(x-1)$。",
                topic_id="j3-3-1-sign-adjust-factor",
            ),
            question_row(
                id_="q-j3-3-1-word03-009",
                title="複合分組（進階01）",
                chapter_code="j3-3-1",
                difficulty="進階",
                question_text=r"因式分解：$ax+ay+bx+by$。",
                answer_text=r"$(a+b)(x+y)$",
                explanation_text=r"$a(x+y)+b(x+y)$。",
                topic_id="j3-3-1-grouping-factor",
            ),
            question_row(
                id_="q-j3-3-1-word03-010",
                title="拆項分組（進階02）",
                chapter_code="j3-3-1",
                difficulty="進階",
                question_text=r"因式分解：$x^2-x-6$（提示：先拆中項）。",
                answer_text=r"$(x-3)(x+2)$",
                explanation_text=r"$x^2-3x+2x-6$ 後分組。",
                topic_id="j3-3-1-multiply-back-check",
            ),
            question_row(
                id_="q-j3-3-1-word03-011",
                title="括號一致性（進階03）",
                chapter_code="j3-3-1",
                difficulty="進階",
                question_text=r"因式分解：$(2x-3)(x+1)-(3-2x)$。",
                answer_text=r"$(2x-3)(x+2)$",
                explanation_text=r"$-(3-2x)=2x-3$，可提同因式。",
                topic_id="j3-3-1-bracket-common-factor",
            ),
            question_row(
                id_="q-j3-3-1-word03-012",
                title="回乘驗證（進階04）",
                chapter_code="j3-3-1",
                difficulty="進階",
                question_text=r"分解後驗證：$2x^2+7x+3=(2x+1)(x+3)$ 是否正確？",
                answer_text="正確",
                explanation_text=r"回乘得 $2x^2+6x+x+3=2x^2+7x+3$。",
                topic_id="j3-3-1-multiply-back-check",
            ),
        ]
    )

    rows.extend(
        [
            question_row(
                id_="q-j3-3-2-word03-013",
                title="平方差（基礎01）",
                chapter_code="j3-3-2",
                difficulty="基礎",
                question_text=r"因式分解：$x^2-16$。",
                answer_text=r"$(x+4)(x-4)$",
                explanation_text=r"$x^2-4^2$ 套平方差。",
                topic_id="j3-3-2-diff-square-factor",
            ),
            question_row(
                id_="q-j3-3-2-word03-014",
                title="平方差（基礎02）",
                chapter_code="j3-3-2",
                difficulty="基礎",
                question_text=r"因式分解：$49a^2-b^2$。",
                answer_text=r"$(7a+b)(7a-b)$",
                explanation_text=r"$(7a)^2-b^2$。",
                topic_id="j3-3-2-diff-square-factor",
            ),
            question_row(
                id_="q-j3-3-2-word03-015",
                title="完全平方（基礎03）",
                chapter_code="j3-3-2",
                difficulty="基礎",
                question_text=r"因式分解：$x^2+6x+9$。",
                answer_text=r"$(x+3)^2$",
                explanation_text=r"$x^2+2\cdot x\cdot3+3^2$。",
                topic_id="j3-3-2-perfect-square-factor",
            ),
            question_row(
                id_="q-j3-3-2-word03-016",
                title="完全平方（基礎04）",
                chapter_code="j3-3-2",
                difficulty="基礎",
                question_text=r"因式分解：$4x^2-12x+9$。",
                answer_text=r"$(2x-3)^2$",
                explanation_text=r"$(2x)^2-2(2x)(3)+3^2$。",
                topic_id="j3-3-2-perfect-square-factor",
            ),
            question_row(
                id_="q-j3-3-2-word03-017",
                title="先提再公式（中等01）",
                chapter_code="j3-3-2",
                difficulty="中等",
                question_text=r"因式分解：$3x^2-27$。",
                answer_text=r"$3(x+3)(x-3)$",
                explanation_text=r"先提 3，再用平方差。",
                topic_id="j3-3-2-formula-recognition",
            ),
            question_row(
                id_="q-j3-3-2-word03-018",
                title="判型選公式（中等02）",
                chapter_code="j3-3-2",
                difficulty="中等",
                question_text=r"因式分解：$9x^2+12x+4$。",
                answer_text=r"$(3x+2)^2$",
                explanation_text=r"首尾平方且中項為 $2ab$。",
                topic_id="j3-3-2-formula-recognition",
            ),
            question_row(
                id_="q-j3-3-2-word03-019",
                title="連續分解（中等03）",
                chapter_code="j3-3-2",
                difficulty="中等",
                question_text=r"因式分解：$x^4-81$。",
                answer_text=r"$(x-3)(x+3)(x^2+9)$",
                explanation_text=r"$x^4-9^2=(x^2-9)(x^2+9)$ 再分解 $x^2-9$。",
                topic_id="j3-3-2-recursive-factor",
            ),
            question_row(
                id_="q-j3-3-2-word03-020",
                title="連續分解（中等04）",
                chapter_code="j3-3-2",
                difficulty="中等",
                question_text=r"因式分解：$16x^4-1$。",
                answer_text=r"$(2x-1)(2x+1)(4x^2+1)$",
                explanation_text=r"先平方差，再次平方差。",
                topic_id="j3-3-2-recursive-factor",
            ),
            question_row(
                id_="q-j3-3-2-word03-021",
                title="公式求值（進階01）",
                chapter_code="j3-3-2",
                difficulty="進階",
                question_text=r"利用公式計算：$9998^2-4$。",
                answer_text="99960000",
                explanation_text=r"$9998^2-2^2=(9998-2)(9998+2)=9996\times10000=99960000$。",
                topic_id="j3-3-2-formula-value",
            ),
            question_row(
                id_="q-j3-3-2-word03-022",
                title="公式求值（進階02）",
                chapter_code="j3-3-2",
                difficulty="進階",
                question_text=r"計算：$59\frac{1}{3}\times60\frac{2}{3}$。",
                answer_text=r"$3599\frac{5}{9}$",
                explanation_text=r"寫成 $(60-\frac{2}{3})(60+\frac{2}{3})=60^2-(\frac{2}{3})^2$。",
                topic_id="j3-3-2-formula-value",
            ),
            question_row(
                id_="q-j3-3-2-word03-023",
                title="混合判型（進階03）",
                chapter_code="j3-3-2",
                difficulty="進階",
                question_text=r"判斷：$4x^2-9+6x$ 能否直接用乘法公式因式分解？",
                answer_text="不能",
                explanation_text=r"整理為 $4x^2+6x-9$，不屬於平方差或完全平方型。",
                topic_id="j3-3-2-formula-recognition",
            ),
            question_row(
                id_="q-j3-3-2-word03-024",
                title="可否再分（進階04）",
                chapter_code="j3-3-2",
                difficulty="進階",
                question_text=r"判斷：$x^2+4$ 在國中範圍能否再因式分解？",
                answer_text="不能",
                explanation_text="在實係數國中範圍內，二次和式通常不可再分。",
                topic_id="j3-3-2-recursive-factor",
            ),
        ]
    )

    rows.extend(
        [
            question_row(
                id_="q-j3-3-3-word03-025",
                title="十字交乘（基礎01）",
                chapter_code="j3-3-3",
                difficulty="基礎",
                question_text=r"因式分解：$x^2+7x+12$。",
                answer_text=r"$(x+3)(x+4)$",
                explanation_text=r"$3\cdot4=12,\ 3+4=7$。",
                topic_id="j3-3-3-cross-main",
            ),
            question_row(
                id_="q-j3-3-3-word03-026",
                title="十字交乘（基礎02）",
                chapter_code="j3-3-3",
                difficulty="基礎",
                question_text=r"因式分解：$x^2-x-6$。",
                answer_text=r"$(x-3)(x+2)$",
                explanation_text=r"$(-3)\cdot2=-6,\ -3+2=-1$。",
                topic_id="j3-3-3-ac-pair-selection",
            ),
            question_row(
                id_="q-j3-3-3-word03-027",
                title="十字交乘（基礎03）",
                chapter_code="j3-3-3",
                difficulty="基礎",
                question_text=r"因式分解：$2x^2+5x+2$。",
                answer_text=r"$(2x+1)(x+2)$",
                explanation_text=r"$ac=4$，配對後中項為 5。",
                topic_id="j3-3-3-leading-coef-not-one",
            ),
            question_row(
                id_="q-j3-3-3-word03-028",
                title="十字交乘（基礎04）",
                chapter_code="j3-3-3",
                difficulty="基礎",
                question_text=r"因式分解：$3x^2-8x+4$。",
                answer_text=r"$(3x-2)(x-2)$",
                explanation_text=r"$ac=12$，找兩數和為 $-8$。",
                topic_id="j3-3-3-leading-coef-not-one",
            ),
            question_row(
                id_="q-j3-3-3-word03-029",
                title="拆中項法（中等01）",
                chapter_code="j3-3-3",
                difficulty="中等",
                question_text=r"因式分解：$6x^2+11x+3$。",
                answer_text=r"$(3x+1)(2x+3)$",
                explanation_text=r"拆中項為 $9x+2x$ 再分組。",
                topic_id="j3-3-3-split-middle-term",
            ),
            question_row(
                id_="q-j3-3-3-word03-030",
                title="拆中項法（中等02）",
                chapter_code="j3-3-3",
                difficulty="中等",
                question_text=r"因式分解：$8x^2-2x-3$。",
                answer_text=r"$(4x-3)(2x+1)$",
                explanation_text=r"$ac=-24$，和為 $-2$ 可配 $-6,4$。",
                topic_id="j3-3-3-split-middle-term",
            ),
            question_row(
                id_="q-j3-3-3-word03-031",
                title="先整理再交乘（中等03）",
                chapter_code="j3-3-3",
                difficulty="中等",
                question_text=r"因式分解：$2x^2-2x-12$。",
                answer_text=r"$2(x-3)(x+2)$",
                explanation_text=r"先提 2，再交乘分解。",
                topic_id="j3-3-3-pre-cleaning",
            ),
            question_row(
                id_="q-j3-3-3-word03-032",
                title="先整理再交乘（中等04）",
                chapter_code="j3-3-3",
                difficulty="中等",
                question_text=r"因式分解：$x^2+6x+5$。",
                answer_text=r"$(x+1)(x+5)$",
                explanation_text=r"標準形後直接配對 $1,5$。",
                topic_id="j3-3-3-cross-main",
            ),
            question_row(
                id_="q-j3-3-3-word03-033",
                title="符號判斷（進階01）",
                chapter_code="j3-3-3",
                difficulty="進階",
                question_text=r"因式分解：$12x^2-11x-5$。",
                answer_text=r"$(4x-5)(3x+1)$",
                explanation_text=r"$ac=-60$，配對後中項 $-11x$。",
                topic_id="j3-3-3-ac-pair-selection",
            ),
            question_row(
                id_="q-j3-3-3-word03-034",
                title="驗證展開（進階02）",
                chapter_code="j3-3-3",
                difficulty="進階",
                question_text=r"判斷：$(2x-1)(3x+4)$ 是否為 $6x^2+5x-4$ 的分解式？",
                answer_text="是",
                explanation_text=r"展開得 $6x^2+8x-3x-4=6x^2+5x-4$。",
                topic_id="j3-3-3-cross-validation",
            ),
            question_row(
                id_="q-j3-3-3-word03-035",
                title="不可分判斷（進階03）",
                chapter_code="j3-3-3",
                difficulty="進階",
                question_text=r"判斷：$x^2+x+1$ 是否可在整數係數下因式分解？",
                answer_text="不可",
                explanation_text=r"找不到整數 $m,n$ 使 $mn=1,\ m+n=1$。",
                topic_id="j3-3-3-cross-validation",
            ),
            question_row(
                id_="q-j3-3-3-word03-036",
                title="綜合題（進階04）",
                chapter_code="j3-3-3",
                difficulty="進階",
                question_text=r"因式分解：$3x^2+2x-8$。",
                answer_text=r"$(3x-4)(x+2)$",
                explanation_text=r"$ac=-24$，配對 $6,-4$，拆中項分組。",
                topic_id="j3-3-3-leading-coef-not-one",
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
