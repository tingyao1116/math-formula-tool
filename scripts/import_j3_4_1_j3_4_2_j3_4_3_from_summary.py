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
    r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國二上4 一元二次方程式.docx"
)
SUMMARY_WORD = str(ROOT / "exports" / "word-j3-4-1-2-3" / "改國二上4_一元二次方程式_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j3-4-1": "一元二次方程式",
    "j3-4-2": "配方法與公式解",
    "j3-4-3": "一元二次方程式應用問題",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j3-4-1-2-3-{ts}{path.suffix}"
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
                id_="j3-4-1-standard-form",
                title="一元二次方程式標準形",
                chapter_code="j3-4-1",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("標準形", r"$ax^2+bx+c=0\ (a\neq0)$"),
                    ("定義", r"$\text{最高次項為 }x^2$"),
                ],
                usage=["先把題目整理成可選解法的標準形式。"],
                examples=[r"$2x^2-3x=5\Rightarrow2x^2-3x-5=0$"],
                tips=["解題第一步固定做：移項 + 合併同類項。"],
                notes=["未整理成標準形容易套錯公式。"],
                mistakes=["把一次式誤判成二次式。"],
            ),
            topic_row(
                id_="j3-4-1-factorization-solve",
                title="因式分解解一元二次",
                chapter_code="j3-4-1",
                chapter_role="公式與性質",
                difficulty="基礎",
                formula_lines=[
                    ("零積性質", r"$AB=0\Rightarrow A=0\ \text{或}\ B=0$"),
                    ("應用", r"$(x-p)(x-q)=0\Rightarrow x=p,q$"),
                ],
                usage=["可分解成兩個一次因式時最快。"],
                examples=[r"$x^2-5x+6=(x-2)(x-3)=0$"],
                tips=["先提公因式，再看能否十字交乘。"],
                notes=["分解後要把每個因式都設為 0。"],
                mistakes=["只解其中一個因式。"],
            ),
            topic_row(
                id_="j3-4-1-square-root-method",
                title="平方法（直接開根號）",
                chapter_code="j3-4-1",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("型態", r"$(x-p)^2=k$"),
                    ("解", r"$x-p=\pm\sqrt{k}$"),
                ],
                usage=["已整理成平方形式時快速求解。"],
                examples=[r"$(x-3)^2=16\Rightarrow x=3\pm4$"],
                tips=["開根號時別忘記正負兩值。"],
                notes=["需先確認右側 $k$ 的符號。"],
                mistakes=[r"把 $\pm$ 漏寫成單一值。"],
            ),
            topic_row(
                id_="j3-4-1-root-check",
                title="代回驗根與增解檢查",
                chapter_code="j3-4-1",
                chapter_role="易錯陷阱",
                difficulty="中等",
                formula_lines=[
                    ("驗證", r"$x=\alpha\Rightarrow \text{代回原式}$"),
                    ("分式題", r"$\text{分母}\neq0$"),
                ],
                usage=["避免計算過程引入不合法解。"],
                examples=[r"分式方程式解後需排除使分母為 0 的值。"],
                tips=["最後一步固定做：代回 + 條件檢查。"],
                notes=["特別適用於分式與開根號過程。"],
                mistakes=["只看化簡後方程式，不看原式。"],
            ),
            topic_row(
                id_="j3-4-1-vieta-basic",
                title="根與係數基本關係",
                chapter_code="j3-4-1",
                chapter_role="核心概念",
                difficulty="進階",
                formula_lines=[
                    ("和", r"$x_1+x_2=-\frac{b}{a}$"),
                    ("積", r"$x_1x_2=\frac{c}{a}$"),
                ],
                usage=["已知方程式快速求根和、根積。"],
                examples=[r"$x^2-7x+10=0\Rightarrow x_1+x_2=7,\ x_1x_2=10$"],
                tips=["必須先確認是標準形。"],
                notes=["不需先求根也可算根和根積。"],
                mistakes=["忘記和有負號。"],
            ),
            topic_row(
                id_="j3-4-1-double-root-case",
                title="重根與無實根情況",
                chapter_code="j3-4-1",
                chapter_role="典型題型",
                difficulty="進階",
                formula_lines=[
                    ("重根", r"$\Delta=0$"),
                    ("無實根", r"$\Delta<0$"),
                ],
                usage=["判斷方程式在實數範圍解的型態。"],
                examples=[r"$x^2-6x+9=0$ 有重根 $x=3$"],
                tips=["可先算判別式再決定是否繼續求值。"],
                notes=["與公式解配合最有效率。"],
                mistakes=["判別式負仍硬求實根。"],
            ),
        ]
    )

    rows.extend(
        [
            topic_row(
                id_="j3-4-2-completing-square-main",
                title="配方法核心流程",
                chapter_code="j3-4-2",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("關鍵", r"$x^2+bx=\left(x+\frac{b}{2}\right)^2-\left(\frac{b}{2}\right)^2$"),
                    ("流程", r"$\text{先除 }a\rightarrow\text{配平方}\rightarrow\text{開根號}$"),
                ],
                usage=["不能直接分解的二次方程式。"],
                examples=[r"$x^2+6x+5=0\Rightarrow(x+3)^2=4$"],
                tips=["先讓 $x^2$ 係數變成 1 再配平方。"],
                notes=["配平方需左右同時補值。"],
                mistakes=["只在左邊加值，右邊忘記補。"],
            ),
            topic_row(
                id_="j3-4-2-quadratic-formula",
                title="公式解法",
                chapter_code="j3-4-2",
                chapter_role="公式與性質",
                difficulty="中等",
                formula_lines=[
                    ("公式", r"$x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$"),
                    ("條件", r"$a\neq0$"),
                ],
                usage=["任何一元二次方程式都可使用。"],
                examples=[r"$2x^2-x-3=0$ 套公式求根"],
                tips=["代入前先寫清楚 $a,b,c$。"],
                notes=["注意分母是整體 $2a$。"],
                mistakes=[r"把 $\pm$ 寫成單一符號。"],
            ),
            topic_row(
                id_="j3-4-2-discriminant",
                title="判別式與根的個數",
                chapter_code="j3-4-2",
                chapter_role="核心概念",
                difficulty="中等",
                formula_lines=[
                    ("判別式", r"$\Delta=b^2-4ac$"),
                    ("規則", r"$\Delta>0$ 兩實根，$\Delta=0$ 重根，$\Delta<0$ 無實根"),
                ],
                usage=["先判斷根型，再決定是否求值。"],
                examples=[r"$x^2+2x+5=0,\ \Delta=-16$"],
                tips=[r"算 $\Delta$ 可快速排除無解題。"],
                notes=["判別式常和參數題結合。"],
                mistakes=["符號計算錯導致根型誤判。"],
            ),
            topic_row(
                id_="j3-4-2-parameter-equation",
                title="含參數方程式判斷",
                chapter_code="j3-4-2",
                chapter_role="典型題型",
                difficulty="進階",
                formula_lines=[
                    ("條件題", r"$\Delta\gtrless0$ 轉成參數不等式"),
                    ("重根題", r"$\Delta=0$"),
                ],
                usage=["求參數範圍、重根條件。"],
                examples=[r"$x^2+(k-2)x+1=0$ 的根型判斷"],
                tips=[r"先寫完整 $\Delta(k)$ 再解不等式。"],
                notes=["注意參數範圍可能受題意限制。"],
                mistakes=["把參數當常數直接帶數。"],
            ),
            topic_row(
                id_="j3-4-2-method-selection",
                title="解法選擇策略",
                chapter_code="j3-4-2",
                chapter_role="易錯陷阱",
                difficulty="進階",
                formula_lines=[
                    ("優先序", r"$\text{可分解}\rightarrow\text{因式分解；否則公式}$"),
                    ("效率", r"$\text{特殊型可用配方法快速處理}$"),
                ],
                usage=["同一題選最穩定的方法降低失誤。"],
                examples=[r"$x^2-10x+25=0$ 用平方法最直觀"],
                tips=["先觀察型態再決定，不必硬套同一方法。"],
                notes=["解法不同，答案必須一致。"],
                mistakes=["複雜題硬用不適合方法。"],
            ),
        ]
    )

    rows.extend(
        [
            topic_row(
                id_="j3-4-3-word-problem-modeling",
                title="文字題建模",
                chapter_code="j3-4-3",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("步驟", r"$\text{設未知數}\rightarrow\text{列方程}\rightarrow\text{求解}\rightarrow\text{驗證}$"),
                    ("形式", r"$ax^2+bx+c=0$"),
                ],
                usage=["任何應用題的共同起手式。"],
                examples=[r"矩形面積題列成 $x(x+3)=28$"],
                tips=["先寫一句話說明未知數代表什麼。"],
                notes=["建模正確比計算更重要。"],
                mistakes=["未定義未知數就直接列式。"],
            ),
            topic_row(
                id_="j3-4-3-geometry-area",
                title="幾何面積應用",
                chapter_code="j3-4-3",
                chapter_role="典型題型",
                difficulty="基礎",
                formula_lines=[
                    ("矩形", r"$\text{長}\times\text{寬}=\text{面積}$"),
                    ("轉二次", r"$x(x+p)=A$"),
                ],
                usage=["長寬、邊長、面積關係題。"],
                examples=[r"$x(x+5)=84$"],
                tips=["幾何題常需排除負根。"],
                notes=["答案要回到長度或面積語意。"],
                mistakes=["保留負邊長作答案。"],
            ),
            topic_row(
                id_="j3-4-3-rate-time",
                title="速率時間應用",
                chapter_code="j3-4-3",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("基本式", r"$\text{路程}=\text{速率}\times\text{時間}$"),
                    ("變速題", r"$\frac{d}{v_1}+\frac{d}{v_2}=T$"),
                ],
                usage=["往返、提速減速、工時問題。"],
                examples=[r"$\frac{1800}{x}+\frac{1800}{x+10}=45$"],
                tips=["分式方程先記得限制 $x\neq0$。"],
                notes=["解完要檢查速率是否正。"],
                mistakes=["忽略分母不可為零。"],
            ),
            topic_row(
                id_="j3-4-3-integer-sequence",
                title="連續整數與數列應用",
                chapter_code="j3-4-3",
                chapter_role="公式與性質",
                difficulty="中等",
                formula_lines=[
                    ("連續數", r"$x,\ x+1,\ x+2$"),
                    ("平方和", r"$x(x+1)=N$"),
                ],
                usage=["連續整數乘積、和差題。"],
                examples=[r"$x(x+1)=56$ 求連續兩整數"],
                tips=["先解代數，再判斷是否需整數解。"],
                notes=["有時需取符合條件的一組。"],
                mistakes=["忽略整數條件直接給小數根。"],
            ),
            topic_row(
                id_="j3-4-3-fractional-equation",
                title="分式情境與驗根",
                chapter_code="j3-4-3",
                chapter_role="核心概念",
                difficulty="進階",
                formula_lines=[
                    ("限制", r"$x\neq a,b,\dots$"),
                    ("清分母", r"$\text{同乘最小公倍式}$"),
                ],
                usage=["工程、速率、比例類分式題。"],
                examples=[r"$\frac{1}{x-1}+\frac{1}{x-9}=\frac{1}{x-3}+\frac{1}{x-7}$"],
                tips=["先寫限制，再清分母。"],
                notes=["分式題最需要檢查增解。"],
                mistakes=["求得答案未檢查分母是否為 0。"],
            ),
            topic_row(
                id_="j3-4-3-reasonable-answer",
                title="答案合理性與單位檢核",
                chapter_code="j3-4-3",
                chapter_role="易錯陷阱",
                difficulty="進階",
                formula_lines=[
                    ("合理性", r"$\text{時間}>0,\ \text{長度}>0$"),
                    ("回題意", r"$\text{符合條件者才保留}$"),
                ],
                usage=["應用題最終答案篩選。"],
                examples=[r"兩根中只取正且符合情境的解"],
                tips=["最後一步固定寫：檢核條件與單位。"],
                notes=["代數正確不代表情境合理。"],
                mistakes=["兩個根全部照抄當答案。"],
            ),
        ]
    )

    return rows


def build_questions() -> List[Dict]:
    rows = []

    rows.extend(
        [
            question_row(
                id_="q-j3-4-1-word04-001",
                title="標準形整理（基礎01）",
                chapter_code="j3-4-1",
                difficulty="基礎",
                question_text=r"將方程式 $2x^2-3x=5$ 整理成標準形。",
                answer_text=r"$2x^2-3x-5=0$",
                explanation_text="把右邊移到左邊並合併同類項。",
                topic_id="j3-4-1-standard-form",
            ),
            question_row(
                id_="q-j3-4-1-word04-002",
                title="因式分解解法（基礎02）",
                chapter_code="j3-4-1",
                difficulty="基礎",
                question_text=r"解：$x^2-5x+6=0$。",
                answer_text=r"$x=2,\ 3$",
                explanation_text=r"$(x-2)(x-3)=0$。",
                topic_id="j3-4-1-factorization-solve",
            ),
            question_row(
                id_="q-j3-4-1-word04-003",
                title="因式分解解法（基礎03）",
                chapter_code="j3-4-1",
                difficulty="基礎",
                question_text=r"解：$2x^2+7x+3=0$。",
                answer_text=r"$x=-3,\ -\frac{1}{2}$",
                explanation_text=r"$(2x+1)(x+3)=0$。",
                topic_id="j3-4-1-factorization-solve",
            ),
            question_row(
                id_="q-j3-4-1-word04-004",
                title="平方法（基礎04）",
                chapter_code="j3-4-1",
                difficulty="基礎",
                question_text=r"解：$(x-4)^2=9$。",
                answer_text=r"$x=1,\ 7$",
                explanation_text=r"$x-4=\pm3$。",
                topic_id="j3-4-1-square-root-method",
            ),
            question_row(
                id_="q-j3-4-1-word04-005",
                title="提公因式後解（中等01）",
                chapter_code="j3-4-1",
                difficulty="中等",
                question_text=r"解：$3x^2-12x=0$。",
                answer_text=r"$x=0,\ 4$",
                explanation_text=r"$3x(x-4)=0$。",
                topic_id="j3-4-1-factorization-solve",
            ),
            question_row(
                id_="q-j3-4-1-word04-006",
                title="重根判斷（中等02）",
                chapter_code="j3-4-1",
                difficulty="中等",
                question_text=r"解：$x^2-6x+9=0$。",
                answer_text=r"$x=3$（重根）",
                explanation_text=r"$(x-3)^2=0$。",
                topic_id="j3-4-1-double-root-case",
            ),
            question_row(
                id_="q-j3-4-1-word04-007",
                title="根與係數（中等03）",
                chapter_code="j3-4-1",
                difficulty="中等",
                question_text=r"方程式 $x^2-7x+10=0$ 的兩根和與積為何？",
                answer_text=r"和 $7$，積 $10$",
                explanation_text=r"用 $-\frac{b}{a},\ \frac{c}{a}$。",
                topic_id="j3-4-1-vieta-basic",
            ),
            question_row(
                id_="q-j3-4-1-word04-008",
                title="無實根判斷（中等04）",
                chapter_code="j3-4-1",
                difficulty="中等",
                question_text=r"$x^2+4x+8=0$ 是否有實根？",
                answer_text="沒有",
                explanation_text=r"$\Delta=16-32=-16<0$。",
                topic_id="j3-4-1-double-root-case",
            ),
            question_row(
                id_="q-j3-4-1-word04-009",
                title="驗根（進階01）",
                chapter_code="j3-4-1",
                difficulty="進階",
                question_text=r"解得 $x=2,-1$，檢查是否皆為 $\frac{x+1}{x-2}=3$ 的解。",
                answer_text=r"只有 $x=-1$",
                explanation_text=r"$x=2$ 使分母為 0，不合法。",
                topic_id="j3-4-1-root-check",
            ),
            question_row(
                id_="q-j3-4-1-word04-010",
                title="平方法進階（進階02）",
                chapter_code="j3-4-1",
                difficulty="進階",
                question_text=r"解：$(2x+1)^2=45$。",
                answer_text=r"$x=\frac{-1\pm3\sqrt{5}}{2}$",
                explanation_text=r"$2x+1=\pm3\sqrt{5}$。",
                topic_id="j3-4-1-square-root-method",
            ),
            question_row(
                id_="q-j3-4-1-word04-011",
                title="根和根積反推（進階03）",
                chapter_code="j3-4-1",
                difficulty="進階",
                question_text=r"若某二次方程式兩根為 $2,5$，寫出首項係數為 1 的方程式。",
                answer_text=r"$x^2-7x+10=0$",
                explanation_text=r"由 $(x-2)(x-5)=0$ 展開。",
                topic_id="j3-4-1-vieta-basic",
            ),
            question_row(
                id_="q-j3-4-1-word04-012",
                title="解型態判斷（進階04）",
                chapter_code="j3-4-1",
                difficulty="進階",
                question_text=r"判斷：$4x^2+4x+1=0$ 的根型。",
                answer_text="一個重根",
                explanation_text=r"$\Delta=4^2-4\cdot4\cdot1=0$。",
                topic_id="j3-4-1-double-root-case",
            ),
        ]
    )

    rows.extend(
        [
            question_row(
                id_="q-j3-4-2-word04-013",
                title="配方法（基礎01）",
                chapter_code="j3-4-2",
                difficulty="基礎",
                question_text=r"用配方法解：$x^2+6x+5=0$。",
                answer_text=r"$x=-1,\ -5$",
                explanation_text=r"$(x+3)^2=4$。",
                topic_id="j3-4-2-completing-square-main",
            ),
            question_row(
                id_="q-j3-4-2-word04-014",
                title="配方法（基礎02）",
                chapter_code="j3-4-2",
                difficulty="基礎",
                question_text=r"把 $x^2-8x$ 配成完全平方形式。",
                answer_text=r"$(x-4)^2-16$",
                explanation_text=r"加減 $\left(\frac{8}{2}\right)^2$。",
                topic_id="j3-4-2-completing-square-main",
            ),
            question_row(
                id_="q-j3-4-2-word04-015",
                title="公式解（基礎03）",
                chapter_code="j3-4-2",
                difficulty="基礎",
                question_text=r"用公式解：$x^2-3x-4=0$。",
                answer_text=r"$x=4,\ -1$",
                explanation_text=r"$a=1,b=-3,c=-4$ 代入公式。",
                topic_id="j3-4-2-quadratic-formula",
            ),
            question_row(
                id_="q-j3-4-2-word04-016",
                title="判別式（基礎04）",
                chapter_code="j3-4-2",
                difficulty="基礎",
                question_text=r"$2x^2+x+3=0$ 的判別式為何？",
                answer_text=r"$-23$",
                explanation_text=r"$\Delta=1-24=-23$。",
                topic_id="j3-4-2-discriminant",
            ),
            question_row(
                id_="q-j3-4-2-word04-017",
                title="根的個數（中等01）",
                chapter_code="j3-4-2",
                difficulty="中等",
                question_text=r"$x^2-2x+1=0$ 有幾個實根？",
                answer_text="一個（重根）",
                explanation_text=r"$\Delta=0$。",
                topic_id="j3-4-2-discriminant",
            ),
            question_row(
                id_="q-j3-4-2-word04-018",
                title="公式解（中等02）",
                chapter_code="j3-4-2",
                difficulty="中等",
                question_text=r"用公式解：$3x^2-2x-1=0$。",
                answer_text=r"$x=1,\ -\frac{1}{3}$",
                explanation_text=r"$\Delta=16$，代入公式。",
                topic_id="j3-4-2-quadratic-formula",
            ),
            question_row(
                id_="q-j3-4-2-word04-019",
                title="參數重根（中等03）",
                chapter_code="j3-4-2",
                difficulty="中等",
                question_text=r"若 $x^2+kx+9=0$ 有重根，求 $k$。",
                answer_text=r"$k=\pm6$",
                explanation_text=r"$\Delta=k^2-36=0$。",
                topic_id="j3-4-2-parameter-equation",
            ),
            question_row(
                id_="q-j3-4-2-word04-020",
                title="根型判斷（中等04）",
                chapter_code="j3-4-2",
                difficulty="中等",
                question_text=r"$x^2+4x+k=0$ 有兩相異實根時，$k$ 的範圍為何？",
                answer_text=r"$k<4$",
                explanation_text=r"$\Delta=16-4k>0$。",
                topic_id="j3-4-2-parameter-equation",
            ),
            question_row(
                id_="q-j3-4-2-word04-021",
                title="方法選擇（進階01）",
                chapter_code="j3-4-2",
                difficulty="進階",
                question_text=r"解：$x^2-10x+25=0$，請選最簡方法。",
                answer_text=r"$x=5$（重根）",
                explanation_text=r"此式為完全平方，平方法最快。",
                topic_id="j3-4-2-method-selection",
            ),
            question_row(
                id_="q-j3-4-2-word04-022",
                title="配方法進階（進階02）",
                chapter_code="j3-4-2",
                difficulty="進階",
                question_text=r"用配方法解：$2x^2-4x-3=0$。",
                answer_text=r"$x=1\pm\frac{\sqrt{10}}{2}$",
                explanation_text=r"先除以 2，再配平方。",
                topic_id="j3-4-2-completing-square-main",
            ),
            question_row(
                id_="q-j3-4-2-word04-023",
                title="參數無實根（進階03）",
                chapter_code="j3-4-2",
                difficulty="進階",
                question_text=r"$x^2+(k-1)x+4=0$ 無實根，求 $k$ 範圍。",
                answer_text=r"$-3<k<5$",
                explanation_text=r"$\Delta=(k-1)^2-16<0$。",
                topic_id="j3-4-2-parameter-equation",
            ),
            question_row(
                id_="q-j3-4-2-word04-024",
                title="公式代入細節（進階04）",
                chapter_code="j3-4-2",
                difficulty="進階",
                question_text=r"判斷對錯：$ax^2+bx+c=0$ 的解為 $x=\frac{-b\pm\sqrt{b^2-4ac}}{a}$。",
                answer_text="錯",
                explanation_text=r"分母應為 $2a$。",
                topic_id="j3-4-2-quadratic-formula",
            ),
        ]
    )

    rows.extend(
        [
            question_row(
                id_="q-j3-4-3-word04-025",
                title="面積建模（基礎01）",
                chapter_code="j3-4-3",
                difficulty="基礎",
                question_text="矩形長比寬多 3，面積為 28，求寬。",
                answer_text="4",
                explanation_text=r"設寬 $x$，則 $x(x+3)=28$，解得 $x=4,-7$ 取正。",
                topic_id="j3-4-3-geometry-area",
            ),
            question_row(
                id_="q-j3-4-3-word04-026",
                title="連續整數（基礎02）",
                chapter_code="j3-4-3",
                difficulty="基礎",
                question_text="兩連續正整數乘積為 72，求較小者。",
                answer_text="8",
                explanation_text=r"設 $x(x+1)=72$，得 $x=8,-9$ 取正。",
                topic_id="j3-4-3-integer-sequence",
            ),
            question_row(
                id_="q-j3-4-3-word04-027",
                title="速率題（基礎03）",
                chapter_code="j3-4-3",
                difficulty="基礎",
                question_text="某人跑 1800 公尺，速度由每分鐘 $x$ 公尺提升到 $x+10$ 公尺，時間共 45 分鐘，列式後求 $x$。",
                answer_text="40",
                explanation_text=r"$\frac{1800}{x}+\frac{1800}{x+10}=45$，解得 $x=40$。",
                topic_id="j3-4-3-rate-time",
            ),
            question_row(
                id_="q-j3-4-3-word04-028",
                title="情境篩根（基礎04）",
                chapter_code="j3-4-3",
                difficulty="基礎",
                question_text=r"方程式 $x^2-6x+8=0$ 在「長度」情境下，哪個根不合理？",
                answer_text="沒有不合理，2 與 4 都合理",
                explanation_text="兩根皆為正值且可作長度。",
                topic_id="j3-4-3-reasonable-answer",
            ),
            question_row(
                id_="q-j3-4-3-word04-029",
                title="分式應用（中等01）",
                chapter_code="j3-4-3",
                difficulty="中等",
                question_text=r"解分式方程：$\frac{1}{x-1}+\frac{1}{x-9}=\frac{1}{x-3}+\frac{1}{x-7}$。",
                answer_text=r"$x=5$",
                explanation_text=r"整理後得二次方程並檢查限制 $x\neq1,3,7,9$。",
                topic_id="j3-4-3-fractional-equation",
            ),
            question_row(
                id_="q-j3-4-3-word04-030",
                title="幾何應用（中等02）",
                chapter_code="j3-4-3",
                difficulty="中等",
                question_text="一正方形面積比另一正方形多 45，邊長相差 3，求較大正方形邊長。",
                answer_text="9",
                explanation_text=r"設小邊長 $x$，列 $(x+3)^2-x^2=45$ 得 $x=6$。",
                topic_id="j3-4-3-geometry-area",
            ),
            question_row(
                id_="q-j3-4-3-word04-031",
                title="速率分式（中等03）",
                chapter_code="j3-4-3",
                difficulty="中等",
                question_text="某車行 1600 公尺，去程每秒 $x$，回程每秒 $x+10$，總時 90 秒，求 $x$。",
                answer_text="20",
                explanation_text=r"$\frac{1600}{x}+\frac{1600}{x+10}=90$，解得正解 $x=20$。",
                topic_id="j3-4-3-rate-time",
            ),
            question_row(
                id_="q-j3-4-3-word04-032",
                title="整數條件（中等04）",
                chapter_code="j3-4-3",
                difficulty="中等",
                question_text="三個連續整數平方和為 365，求中間數。",
                answer_text="11",
                explanation_text=r"設中間為 $x$，則 $(x-1)^2+x^2+(x+1)^2=365$。",
                topic_id="j3-4-3-integer-sequence",
            ),
            question_row(
                id_="q-j3-4-3-word04-033",
                title="雙根篩選（進階01）",
                chapter_code="j3-4-3",
                difficulty="進階",
                question_text="某長方形周長 26，面積 40，求長與寬。",
                answer_text="長 8、寬 5",
                explanation_text=r"設寬 $x$，長 $13-x$，得 $x(13-x)=40$。",
                topic_id="j3-4-3-geometry-area",
            ),
            question_row(
                id_="q-j3-4-3-word04-034",
                title="分式增解檢查（進階02）",
                chapter_code="j3-4-3",
                difficulty="進階",
                question_text=r"解：$\frac{x-2}{x+1}=3-\frac{4(x+1)}{x-2}$，並檢查增解。",
                answer_text=r"$x=1,\ -5$",
                explanation_text=r"限制 $x\neq2,-1$，兩根皆合法。",
                topic_id="j3-4-3-fractional-equation",
            ),
            question_row(
                id_="q-j3-4-3-word04-035",
                title="合理性檢核（進階03）",
                chapter_code="j3-4-3",
                difficulty="進階",
                question_text="一物體高度模型為 $h=t^2-6t+8$，何時高度為 0？哪些時間合理？",
                answer_text=r"$t=2,\ 4$（兩者皆合理）",
                explanation_text=r"解 $t^2-6t+8=0$，且時間需 $t\ge0$。",
                topic_id="j3-4-3-reasonable-answer",
            ),
            question_row(
                id_="q-j3-4-3-word04-036",
                title="綜合建模（進階04）",
                chapter_code="j3-4-3",
                difficulty="進階",
                question_text="某數與其倒數和為 $\\frac{5}{2}$，求此數。",
                answer_text=r"$2,\ \frac{1}{2}$",
                explanation_text=r"設 $x+\frac{1}{x}=\frac{5}{2}$，化為 $2x^2-5x+2=0$。",
                topic_id="j3-4-3-word-problem-modeling",
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
