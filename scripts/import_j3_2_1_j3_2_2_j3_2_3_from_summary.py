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
    r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國二上2 平方根與立方根.docx"
)
SUMMARY_WORD = str(ROOT / "exports" / "word-j3-2-1-2-3" / "改國二上2_平方根與立方根_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j3-2-1": "二次方根",
    "j3-2-2": "根式的運算",
    "j3-2-3": "畢氏定理",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j3-2-1-2-3-{ts}{path.suffix}"
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
                id_="j3-2-1-square-root-definition",
                title="平方根與正平方根",
                chapter_code="j3-2-1",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("平方根", r"$x^2=a\Rightarrow x=\pm\sqrt{a}\ (a>0)$"),
                    ("正平方根", r"$\sqrt{a}\ge0$"),
                ],
                usage=["建立平方根的基本定義與符號意義。"],
                examples=[r"$49$ 的平方根是 $\pm7$，正平方根是 $7$。"],
                tips=[r"題目若寫「平方根」通常要寫 $\pm$；寫「正平方根」才只取 $\sqrt{a}$。"],
                notes=["先看題目用詞再決定是否加上正負號。"],
                mistakes=[r"把 $\sqrt{a}$ 誤當成「全部平方根」。"],
            ),
            topic_row(
                id_="j3-2-1-root-existence",
                title="平方根存在條件",
                chapter_code="j3-2-1",
                chapter_role="核心概念",
                difficulty="基礎",
                formula_lines=[
                    ("存在性", r"$a<0$ 時，$\sqrt{a}$ 在實數中不存在。"),
                    ("零值", r"$\sqrt{0}=0$"),
                ],
                usage=["判斷根號題是否有實數解。"],
                examples=[r"$\sqrt{-4}$ 無實數意義。"],
                tips=["先檢查被開方數符號。"],
                notes=["本單元以實數範圍為主。"],
                mistakes=["負數直接開平方。"],
            ),
            topic_row(
                id_="j3-2-1-prime-factor-root",
                title="質因數分解求平方根",
                chapter_code="j3-2-1",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("因式拆解", r"$a=p_1^{\alpha_1}p_2^{\alpha_2}\cdots$"),
                    ("開根規則", r"$\sqrt{p^{2k}}=p^k$"),
                ],
                usage=["大數平方根與根號化簡。"],
                examples=[r"$\sqrt{72}=\sqrt{36\times2}=6\sqrt{2}$"],
                tips=["先找最大完全平方因數。"],
                notes=["分解時可先試除小質數。"],
                mistakes=["未提出可開方的平方因數。"],
            ),
            topic_row(
                id_="j3-2-1-fractional-root",
                title="分數與小數的平方根",
                chapter_code="j3-2-1",
                chapter_role="公式與性質",
                difficulty="中等",
                formula_lines=[
                    ("分數開根", r"$\sqrt{\frac{a}{b}}=\frac{\sqrt{a}}{\sqrt{b}}\ (a\ge0,b>0)$"),
                    ("有限小數", r"$0.81=\frac{81}{100}\Rightarrow \sqrt{0.81}=0.9$"),
                ],
                usage=["處理分數、小數與百分比題。"],
                examples=[r"$\sqrt{\frac{121}{144}}=\frac{11}{12}$"],
                tips=["先把小數改成分數再開根。"],
                notes=["最後再決定是否要寫正負。"],
                mistakes=["分子分母分別開根時條件沒檢查。"],
            ),
            topic_row(
                id_="j3-2-1-absolute-root",
                title="絕對值與根號",
                chapter_code="j3-2-1",
                chapter_role="易錯陷阱",
                difficulty="進階",
                formula_lines=[
                    ("核心", r"$\sqrt{a^2}=|a|$"),
                    ("延伸", r"$\sqrt{(x-k)^2}=|x-k|$"),
                ],
                usage=["方程式與代數化簡。"],
                examples=[r"$\sqrt{(-5)^2}=5$，不是 $-5$。"],
                tips=["看到平方再開根，先轉成絕對值。"],
                notes=["此規則是本章常考重點。"],
                mistakes=[r"把 $\sqrt{a^2}$ 直接寫成 $a$。"],
            ),
            topic_row(
                id_="j3-2-1-approximation",
                title="平方根近似值與區間",
                chapter_code="j3-2-1",
                chapter_role="典型題型",
                difficulty="進階",
                formula_lines=[
                    ("夾擠", r"$m^2<a<(m+1)^2\Rightarrow m<\sqrt{a}<m+1$"),
                    ("估算", r"$\sqrt{50}\approx7.07$"),
                ],
                usage=["比較大小與估算計算。"],
                examples=[r"$7^2<50<8^2\Rightarrow 7<\sqrt{50}<8$"],
                tips=["先定位整數範圍，再做小數估算。"],
                notes=["可配合計算機做四捨五入。"],
                mistakes=["直接猜值不先夾範圍。"],
            ),
        ]
    )

    rows.extend(
        [
            topic_row(
                id_="j3-2-2-simplest-radical",
                title="最簡根式判斷",
                chapter_code="j3-2-2",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("最簡根式", r"$\sqrt{ab}=k\sqrt{n}$，其中 $n$ 不含平方因數"),
                    ("分母條件", r"分母不含根號"),
                ],
                usage=["所有根式運算前的標準化步驟。"],
                examples=[r"$\sqrt{18}=3\sqrt{2}$"],
                tips=["先提平方因數、再檢查分母。"],
                notes=["最簡化是後續加減的前置條件。"],
                mistakes=["只做部分化簡就停止。"],
            ),
            topic_row(
                id_="j3-2-2-like-radicals",
                title="同類根式加減",
                chapter_code="j3-2-2",
                chapter_role="公式與性質",
                difficulty="基礎",
                formula_lines=[
                    ("同類根式", r"$m\sqrt{k}\pm n\sqrt{k}=(m\pm n)\sqrt{k}$"),
                    ("不同類", r"$\sqrt{2}+\sqrt{3}$ 不能合併"),
                ],
                usage=["加減運算與整理答案。"],
                examples=[r"$2\sqrt{5}-\sqrt{5}=\sqrt{5}$"],
                tips=["先化成最簡根式再判斷同類。"],
                notes=["同類判斷看根號內數字與次方是否一致。"],
                mistakes=["不同根號硬合併。"],
            ),
            topic_row(
                id_="j3-2-2-radical-mul-div",
                title="根式乘除運算",
                chapter_code="j3-2-2",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("乘法", r"$\sqrt{a}\sqrt{b}=\sqrt{ab}$"),
                    ("除法", r"$\frac{\sqrt{a}}{\sqrt{b}}=\sqrt{\frac{a}{b}}$"),
                ],
                usage=["處理根式分式與比例題。"],
                examples=[r"$\sqrt{6}\cdot\sqrt{2}=\sqrt{12}=2\sqrt{3}$"],
                tips=["可先拆因數再約簡。"],
                notes=["除法需保證分母正且不為零。"],
                mistakes=["乘除後忘記再化最簡。"],
            ),
            topic_row(
                id_="j3-2-2-rationalization",
                title="分母有理化",
                chapter_code="j3-2-2",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("單根號分母", r"$\frac{1}{\sqrt{a}}=\frac{\sqrt{a}}{a}$"),
                    ("共軛", r"$\frac{1}{a+\sqrt{b}}\cdot\frac{a-\sqrt{b}}{a-\sqrt{b}}$"),
                ],
                usage=["讓分母不含根號，便於後續運算。"],
                examples=[r"$\frac{\sqrt{2}}{\sqrt{7}}=\frac{\sqrt{14}}{7}$"],
                tips=["有兩項時用共軛最穩定。"],
                notes=["答案要同時檢查是否最簡。"],
                mistakes=["只乘分子不乘分母。"],
            ),
            topic_row(
                id_="j3-2-2-cube-root-basics",
                title="立方根與最簡立方根式",
                chapter_code="j3-2-2",
                chapter_role="核心概念",
                difficulty="進階",
                formula_lines=[
                    ("立方根", r"$x=\sqrt[3]{a}\iff x^3=a$"),
                    ("化簡", r"$\sqrt[3]{a^3b}=a\sqrt[3]{b}$"),
                ],
                usage=["比較平方根與立方根差異，並做立方根化簡。"],
                examples=[r"$\sqrt[3]{54}=\sqrt[3]{27\cdot2}=3\sqrt[3]{2}$"],
                tips=["立方根可開負數且只有一個實數值。"],
                notes=["立方根題先找完全立方因數。"],
                mistakes=["沿用平方根的正負兩值觀念。"],
            ),
        ]
    )

    rows.extend(
        [
            topic_row(
                id_="j3-2-3-pythagorean-main",
                title="畢氏定理核心",
                chapter_code="j3-2-3",
                chapter_role="主題",
                difficulty="基礎",
                formula_lines=[
                    ("公式", r"$a^2+b^2=c^2$"),
                    ("條件", r"$c$ 是斜邊（最長邊）"),
                ],
                usage=["直角三角形邊長關係計算。"],
                examples=[r"$3^2+4^2=5^2$"],
                tips=["先找最大邊再代入。"],
                notes=["兩股平方和等於斜邊平方。"],
                mistakes=["把非最大邊當斜邊。"],
            ),
            topic_row(
                id_="j3-2-3-find-hypotenuse",
                title="已知兩股求斜邊",
                chapter_code="j3-2-3",
                chapter_role="典型題型",
                difficulty="基礎",
                formula_lines=[
                    ("斜邊", r"$c=\sqrt{a^2+b^2}$"),
                    ("合理性", r"$c>\max(a,b)$"),
                ],
                usage=["求最短距離與對角線。"],
                examples=[r"$a=6,b=8\Rightarrow c=10$"],
                tips=["開根號前先算平方和。"],
                notes=["答案要帶長度單位。"],
                mistakes=["算到 $c^2$ 就停。"],
            ),
            topic_row(
                id_="j3-2-3-find-leg",
                title="已知斜邊求股長",
                chapter_code="j3-2-3",
                chapter_role="典型題型",
                difficulty="中等",
                formula_lines=[
                    ("股長", r"$a=\sqrt{c^2-b^2}$"),
                    ("限制", r"$c>b$"),
                ],
                usage=["反推缺少的一股長。"],
                examples=[r"$c=13,b=5\Rightarrow a=12$"],
                tips=["先檢查斜邊是否最大。"],
                notes=["平方差後再開根號。"],
                mistakes=[r"誤寫成 $a=\sqrt{b^2-c^2}$。"],
            ),
            topic_row(
                id_="j3-2-3-right-triangle-check",
                title="三邊是否為直角三角形",
                chapter_code="j3-2-3",
                chapter_role="公式與性質",
                difficulty="中等",
                formula_lines=[
                    ("判斷", r"$a^2+b^2\stackrel{?}{=}c^2$"),
                    ("流程", r"排序邊長 $\rightarrow$ 代入檢查"),
                ],
                usage=["快速判斷邊長組是否直角。"],
                examples=[r"$8,15,17$ 是；$4,5,6$ 否。"],
                tips=["務必先排序再判斷。"],
                notes=["常見整數組：$3,4,5$、$5,12,13$。"],
                mistakes=["未排序直接套公式。"],
            ),
            topic_row(
                id_="j3-2-3-area-square-model",
                title="正方形面積模型",
                chapter_code="j3-2-3",
                chapter_role="核心概念",
                difficulty="進階",
                formula_lines=[
                    ("面積觀點", r"$\text{兩股正方形面積和}=\text{斜邊正方形面積}$"),
                    ("對應", r"$a^2+b^2=c^2$"),
                ],
                usage=["面積敘述題與幾何轉代數。"],
                examples=[r"兩股面積為 $64,49$，則斜邊面積為 $113$。"],
                tips=["先把「面積」還原成邊長平方關係。"],
                notes=["面積值本身就是對應邊長平方。"],
                mistakes=["把面積當邊長直接相加。"],
            ),
            topic_row(
                id_="j3-2-3-height-application",
                title="斜邊高與綜合應用",
                chapter_code="j3-2-3",
                chapter_role="典型題型",
                difficulty="進階",
                formula_lines=[
                    ("斜邊高", r"$h=\frac{ab}{c}$"),
                    ("面積一致", r"$\frac{ab}{2}=\frac{ch}{2}$"),
                ],
                usage=["實際測量、幾何綜合題。"],
                examples=[r"$a=15,b=20,c=25\Rightarrow h=12$"],
                tips=["先求斜邊再代高公式。"],
                notes=["兩種面積寫法相等是推導關鍵。"],
                mistakes=["把 $h=\frac{c}{ab}$ 寫反。"],
            ),
        ]
    )

    return rows


def build_questions() -> List[Dict]:
    rows = []

    rows.extend(
        [
            question_row(
                id_="q-j3-2-1-word02-001",
                title="平方根定義（基礎01）",
                chapter_code="j3-2-1",
                difficulty="基礎",
                question_text=r"寫出 $36$ 的所有平方根。",
                answer_text=r"$\pm 6$",
                explanation_text=r"因為 $6^2=36$ 且 $(-6)^2=36$。",
                topic_id="j3-2-1-square-root-definition",
            ),
            question_row(
                id_="q-j3-2-1-word02-002",
                title="正平方根（基礎02）",
                chapter_code="j3-2-1",
                difficulty="基礎",
                question_text=r"求 $49$ 的正平方根。",
                answer_text="7",
                explanation_text=r"$\sqrt{49}=7$，正平方根只取非負值。",
                topic_id="j3-2-1-square-root-definition",
            ),
            question_row(
                id_="q-j3-2-1-word02-003",
                title="存在性判斷（基礎03）",
                chapter_code="j3-2-1",
                difficulty="基礎",
                question_text=r"$\sqrt{-9}$ 在實數中是否存在？",
                answer_text="不存在",
                explanation_text="負數沒有實數平方根。",
                topic_id="j3-2-1-root-existence",
            ),
            question_row(
                id_="q-j3-2-1-word02-004",
                title="絕對值根號（基礎04）",
                chapter_code="j3-2-1",
                difficulty="基礎",
                question_text=r"化簡：$\sqrt{(-8)^2}$。",
                answer_text="8",
                explanation_text=r"$\sqrt{a^2}=|a|$，故為 $|-8|=8$。",
                topic_id="j3-2-1-absolute-root",
            ),
            question_row(
                id_="q-j3-2-1-word02-005",
                title="質因數分解（中等01）",
                chapter_code="j3-2-1",
                difficulty="中等",
                question_text=r"化簡：$\sqrt{98}$。",
                answer_text=r"$7\sqrt{2}$",
                explanation_text=r"$98=49\cdot2$，故 $\sqrt{98}=7\sqrt{2}$。",
                topic_id="j3-2-1-prime-factor-root",
            ),
            question_row(
                id_="q-j3-2-1-word02-006",
                title="質因數分解（中等02）",
                chapter_code="j3-2-1",
                difficulty="中等",
                question_text=r"化簡：$\sqrt{180}$。",
                answer_text=r"$6\sqrt{5}$",
                explanation_text=r"$180=36\cdot5$，故 $\sqrt{180}=6\sqrt{5}$。",
                topic_id="j3-2-1-prime-factor-root",
            ),
            question_row(
                id_="q-j3-2-1-word02-007",
                title="分數平方根（中等03）",
                chapter_code="j3-2-1",
                difficulty="中等",
                question_text=r"求 $\frac{121}{144}$ 的正平方根。",
                answer_text=r"$\frac{11}{12}$",
                explanation_text=r"$\sqrt{\frac{121}{144}}=\frac{11}{12}$。",
                topic_id="j3-2-1-fractional-root",
            ),
            question_row(
                id_="q-j3-2-1-word02-008",
                title="小數平方根（中等04）",
                chapter_code="j3-2-1",
                difficulty="中等",
                question_text=r"求 $0.0081$ 的所有平方根。",
                answer_text=r"$\pm0.09$",
                explanation_text=r"$0.09^2=0.0081$，故有正負兩值。",
                topic_id="j3-2-1-fractional-root",
            ),
            question_row(
                id_="q-j3-2-1-word02-009",
                title="近似值區間（進階01）",
                chapter_code="j3-2-1",
                difficulty="進階",
                question_text=r"判斷 $\sqrt{50}$ 介於哪兩個整數之間。",
                answer_text=r"$7<\sqrt{50}<8$",
                explanation_text=r"$49<50<64$，故介於 7 與 8 之間。",
                topic_id="j3-2-1-approximation",
            ),
            question_row(
                id_="q-j3-2-1-word02-010",
                title="絕對值化簡（進階02）",
                chapter_code="j3-2-1",
                difficulty="進階",
                question_text=r"化簡：$\sqrt{(x-3)^2}$。",
                answer_text=r"$|x-3|$",
                explanation_text=r"套用 $\sqrt{a^2}=|a|$。",
                topic_id="j3-2-1-absolute-root",
            ),
            question_row(
                id_="q-j3-2-1-word02-011",
                title="符號判斷（進階03）",
                chapter_code="j3-2-1",
                difficulty="進階",
                question_text=r"判斷對錯：$\sqrt{a^2}=a$（任意實數 $a$）。",
                answer_text="錯",
                explanation_text=r"應為 $\sqrt{a^2}=|a|$。",
                topic_id="j3-2-1-absolute-root",
            ),
            question_row(
                id_="q-j3-2-1-word02-012",
                title="綜合運算（進階04）",
                chapter_code="j3-2-1",
                difficulty="進階",
                question_text=r"若 $x$ 是 $225$ 的負平方根，求 $x+20$。",
                answer_text="5",
                explanation_text=r"$x=-15$，故 $x+20=5$。",
                topic_id="j3-2-1-root-existence",
            ),
        ]
    )

    rows.extend(
        [
            question_row(
                id_="q-j3-2-2-word02-013",
                title="最簡根式（基礎01）",
                chapter_code="j3-2-2",
                difficulty="基礎",
                question_text=r"化簡：$\sqrt{72}$。",
                answer_text=r"$6\sqrt{2}$",
                explanation_text=r"$72=36\cdot2$。",
                topic_id="j3-2-2-simplest-radical",
            ),
            question_row(
                id_="q-j3-2-2-word02-014",
                title="同類根式（基礎02）",
                chapter_code="j3-2-2",
                difficulty="基礎",
                question_text=r"計算：$3\sqrt{5}-\sqrt{5}$。",
                answer_text=r"$2\sqrt{5}$",
                explanation_text="同類根式係數相減。",
                topic_id="j3-2-2-like-radicals",
            ),
            question_row(
                id_="q-j3-2-2-word02-015",
                title="同類判斷（基礎03）",
                chapter_code="j3-2-2",
                difficulty="基礎",
                question_text=r"$2\sqrt{3}$ 與 $\sqrt{12}$ 是否同類根式？",
                answer_text="是",
                explanation_text=r"$\sqrt{12}=2\sqrt{3}$，化簡後同類。",
                topic_id="j3-2-2-like-radicals",
            ),
            question_row(
                id_="q-j3-2-2-word02-016",
                title="乘法運算（基礎04）",
                chapter_code="j3-2-2",
                difficulty="基礎",
                question_text=r"計算：$\sqrt{6}\cdot\sqrt{15}$。",
                answer_text=r"$3\sqrt{10}$",
                explanation_text=r"$\sqrt{90}=\sqrt{9\cdot10}=3\sqrt{10}$。",
                topic_id="j3-2-2-radical-mul-div",
            ),
            question_row(
                id_="q-j3-2-2-word02-017",
                title="除法運算（中等01）",
                chapter_code="j3-2-2",
                difficulty="中等",
                question_text=r"化簡：$\frac{\sqrt{50}}{\sqrt{2}}$。",
                answer_text="5",
                explanation_text=r"$\sqrt{\frac{50}{2}}=\sqrt{25}=5$。",
                topic_id="j3-2-2-radical-mul-div",
            ),
            question_row(
                id_="q-j3-2-2-word02-018",
                title="有理化（中等02）",
                chapter_code="j3-2-2",
                difficulty="中等",
                question_text=r"有理化：$\frac{1}{\sqrt{3}}$。",
                answer_text=r"$\frac{\sqrt{3}}{3}$",
                explanation_text=r"分子分母同乘 $\sqrt{3}$。",
                topic_id="j3-2-2-rationalization",
            ),
            question_row(
                id_="q-j3-2-2-word02-019",
                title="有理化（中等03）",
                chapter_code="j3-2-2",
                difficulty="中等",
                question_text=r"有理化：$\frac{\sqrt{2}}{\sqrt{7}}$。",
                answer_text=r"$\frac{\sqrt{14}}{7}$",
                explanation_text=r"同乘 $\sqrt{7}$。",
                topic_id="j3-2-2-rationalization",
            ),
            question_row(
                id_="q-j3-2-2-word02-020",
                title="混合化簡（中等04）",
                chapter_code="j3-2-2",
                difficulty="中等",
                question_text=r"化簡：$\sqrt{48}-\sqrt{12}$。",
                answer_text=r"$2\sqrt{3}$",
                explanation_text=r"$\sqrt{48}=4\sqrt{3},\ \sqrt{12}=2\sqrt{3}$。",
                topic_id="j3-2-2-like-radicals",
            ),
            question_row(
                id_="q-j3-2-2-word02-021",
                title="立方根基礎（進階01）",
                chapter_code="j3-2-2",
                difficulty="進階",
                question_text=r"求 $\sqrt[3]{-216}$。",
                answer_text="-6",
                explanation_text=r"$(-6)^3=-216$。",
                topic_id="j3-2-2-cube-root-basics",
            ),
            question_row(
                id_="q-j3-2-2-word02-022",
                title="立方根化簡（進階02）",
                chapter_code="j3-2-2",
                difficulty="進階",
                question_text=r"化簡：$\sqrt[3]{432}$。",
                answer_text=r"$6\sqrt[3]{2}$",
                explanation_text=r"$432=216\cdot2=6^3\cdot2$。",
                topic_id="j3-2-2-cube-root-basics",
            ),
            question_row(
                id_="q-j3-2-2-word02-023",
                title="比較觀念（進階03）",
                chapter_code="j3-2-2",
                difficulty="進階",
                question_text=r"判斷對錯：正數一定有兩個立方根。",
                answer_text="錯",
                explanation_text="任一實數只有一個實數立方根。",
                topic_id="j3-2-2-cube-root-basics",
            ),
            question_row(
                id_="q-j3-2-2-word02-024",
                title="綜合運算（進階04）",
                chapter_code="j3-2-2",
                difficulty="進階",
                question_text=r"計算：$\frac{2}{\sqrt{5}}+\sqrt{20}$（化成最簡根式）。",
                answer_text=r"$\frac{22\sqrt{5}}{5}$",
                explanation_text=r"$\frac{2}{\sqrt{5}}=\frac{2\sqrt{5}}{5},\ \sqrt{20}=2\sqrt{5}$，合併得 $\frac{22\sqrt{5}}{5}$。",
                topic_id="j3-2-2-rationalization",
            ),
        ]
    )

    rows.extend(
        [
            question_row(
                id_="q-j3-2-3-word02-025",
                title="基本求斜邊（基礎01）",
                chapter_code="j3-2-3",
                difficulty="基礎",
                question_text=r"直角三角形兩股為 $3,4$，求斜邊。",
                answer_text="5",
                explanation_text=r"$3^2+4^2=5^2$。",
                topic_id="j3-2-3-find-hypotenuse",
            ),
            question_row(
                id_="q-j3-2-3-word02-026",
                title="基本求股長（基礎02）",
                chapter_code="j3-2-3",
                difficulty="基礎",
                question_text=r"直角三角形斜邊 $13$，一股 $5$，求另一股。",
                answer_text="12",
                explanation_text=r"$a=\sqrt{13^2-5^2}=\sqrt{144}=12$。",
                topic_id="j3-2-3-find-leg",
            ),
            question_row(
                id_="q-j3-2-3-word02-027",
                title="是否直角（基礎03）",
                chapter_code="j3-2-3",
                difficulty="基礎",
                question_text=r"判斷 $6,8,10$ 是否為直角三角形三邊。",
                answer_text="是",
                explanation_text=r"$6^2+8^2=36+64=100=10^2$。",
                topic_id="j3-2-3-right-triangle-check",
            ),
            question_row(
                id_="q-j3-2-3-word02-028",
                title="是否直角（基礎04）",
                chapter_code="j3-2-3",
                difficulty="基礎",
                question_text=r"判斷 $4,5,6$ 是否為直角三角形三邊。",
                answer_text="否",
                explanation_text=r"$4^2+5^2=41\ne36$。",
                topic_id="j3-2-3-right-triangle-check",
            ),
            question_row(
                id_="q-j3-2-3-word02-029",
                title="面積模型（中等01）",
                chapter_code="j3-2-3",
                difficulty="中等",
                question_text="若兩股上的正方形面積分別為 64、49，求斜邊上的正方形面積。",
                answer_text="113",
                explanation_text=r"面積即邊長平方，故 $c^2=64+49=113$。",
                topic_id="j3-2-3-area-square-model",
            ),
            question_row(
                id_="q-j3-2-3-word02-030",
                title="對角線應用（中等02）",
                chapter_code="j3-2-3",
                difficulty="中等",
                question_text="長方形長 9、寬 12，求對角線長。",
                answer_text="15",
                explanation_text=r"$d=\sqrt{9^2+12^2}=\sqrt{225}=15$。",
                topic_id="j3-2-3-find-hypotenuse",
            ),
            question_row(
                id_="q-j3-2-3-word02-031",
                title="整數邊判斷（中等03）",
                chapter_code="j3-2-3",
                difficulty="中等",
                question_text=r"若三邊為 $8,n,17$ 且為直角三角形，求 $n$。",
                answer_text="15",
                explanation_text=r"$n^2=17^2-8^2=225$，故 $n=15$。",
                topic_id="j3-2-3-find-leg",
            ),
            question_row(
                id_="q-j3-2-3-word02-032",
                title="斜邊高（中等04）",
                chapter_code="j3-2-3",
                difficulty="中等",
                question_text=r"直角三角形兩股為 $15,20$，斜邊為 $25$，求斜邊上的高 $h$。",
                answer_text="12",
                explanation_text=r"$h=\frac{ab}{c}=\frac{15\cdot20}{25}=12$。",
                topic_id="j3-2-3-height-application",
            ),
            question_row(
                id_="q-j3-2-3-word02-033",
                title="混合根式（進階01）",
                chapter_code="j3-2-3",
                difficulty="進階",
                question_text=r"等腰直角三角形一股為 $3$，求斜邊。",
                answer_text=r"$3\sqrt{2}$",
                explanation_text=r"$c=\sqrt{3^2+3^2}=\sqrt{18}=3\sqrt{2}$。",
                topic_id="j3-2-3-find-hypotenuse",
            ),
            question_row(
                id_="q-j3-2-3-word02-034",
                title="反推邊長（進階02）",
                chapter_code="j3-2-3",
                difficulty="進階",
                question_text=r"若直角三角形一股為 $12$，斜邊為 $37$，求另一股。",
                answer_text="35",
                explanation_text=r"$a=\sqrt{37^2-12^2}=\sqrt{1225}=35$。",
                topic_id="j3-2-3-find-leg",
            ),
            question_row(
                id_="q-j3-2-3-word02-035",
                title="周長條件（進階03）",
                chapter_code="j3-2-3",
                difficulty="進階",
                question_text="一直角三角形三邊比為 $3:4:5$，周長為 24，求面積。",
                answer_text="24",
                explanation_text=r"邊長為 $6,8,10$，面積 $=\frac{1}{2}\cdot6\cdot8=24$。",
                topic_id="j3-2-3-pythagorean-main",
            ),
            question_row(
                id_="q-j3-2-3-word02-036",
                title="綜合驗算（進階04）",
                chapter_code="j3-2-3",
                difficulty="進階",
                question_text=r"若三邊長為 $1,\sqrt{2},\sqrt{3}$，是否為直角三角形？",
                answer_text="是",
                explanation_text=r"$1^2+(\sqrt{2})^2=1+2=3=(\sqrt{3})^2$。",
                topic_id="j3-2-3-right-triangle-check",
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
