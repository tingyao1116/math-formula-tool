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

SOURCE_MD = (
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\高中數學哈特利重點版\高一上全重點_整理\高一上全重點_易讀版.md"
)
SOURCE_REF = "高一上全重點_易讀版.md（重點整理匯入）"

CHAPTER_NAMES = {
    "s1-1-1": "數與式：實數",
    "s1-1-2": "數與式：絕對值",
    "s1-1-3": "數與式：式的運算",
    "s1-1-4": "數與式：指數",
    "s1-1-5": "數與式：對數",
    "s1-2-1": "直線與圓：直線方程式",
    "s1-2-2": "直線與圓：圓的方程式",
    "s1-2-3": "直線與圓：直線與圓的關係",
    "s1-3-1": "多項式：多項式函數",
    "s1-3-2": "多項式：簡單多項式函數及其圖形",
    "s1-3-3": "多項式：多項式不等式",
    "s1-x": "高一上補充",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-s1-prefix-{ts}{path.suffix}"
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
    chapter = CHAPTER_NAMES[chapter_code]
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "高中",
        "grade": "高一",
        "term": "高一上",
        "chapter": chapter,
        "chapterCode": chapter_code,
        "domain": "高中數學",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", chapter_code, chapter, "高一上"],
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
    chapter_code: str,
    difficulty: str,
    question_text: str,
    answer_text: str,
    explanation_text: str,
    topic_id: str,
) -> Dict:
    chapter = CHAPTER_NAMES[chapter_code]
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


def build_topics() -> List[Dict]:
    return [
        topic_row(
            id_="s1-1-1-real-number-core",
            title="實數分類與基本性質",
            chapter_code="s1-1-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[("集合關係", r"$\mathbb{N}\subset\mathbb{Z}\subset\mathbb{Q}\subset\mathbb{R}$"), ("稠密性", r"$a<b\Rightarrow \exists r\in\mathbb{Q}:a<r<b$")],
            usage=["整理實數系統，建立後續代數運算基礎。"],
            examples=["有理數與無理數共同構成實數。"],
            tips=["先判斷題目是分類題還是運算題。"],
            notes=["0 屬於整數但不是正整數。"],
            mistakes=["把無理數誤判為有理數。"],
        ),
        topic_row(
            id_="s1-1-2-absolute-value-core",
            title="絕對值定義與距離觀念",
            chapter_code="s1-1-2",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[("分段定義", r"$|x|=\begin{cases}x,&x\ge0\\-x,&x<0\end{cases}$"), ("距離", r"$|a-b|$")],
            usage=["解釋數線距離與絕對值方程、不等式。"],
            examples=["$|x-3|=2$ 表示 x 到 3 的距離為 2。"],
            tips=["先轉成距離語言再解題。"],
            notes=["絕對值永不為負。"],
            mistakes=["去絕對值時漏掉負號分支。"],
        ),
        topic_row(
            id_="s1-1-3-algebraic-operations",
            title="式的運算與乘法公式",
            chapter_code="s1-1-3",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[("乘法公式", r"$(a+b)^2=a^2+2ab+b^2$"), ("平方差", r"$a^2-b^2=(a-b)(a+b)$")],
            usage=["化簡、展開、因式分解與恆等變形。"],
            examples=["先展開再合併同類項可降低錯誤。"],
            tips=["每一步保留括號到最後。"],
            notes=["同類項係數才可相加。"],
            mistakes=["平方差誤寫成 $a^2+b^2$。"],
        ),
        topic_row(
            id_="s1-1-4-exponent-rules",
            title="指數律與分數指數",
            chapter_code="s1-1-4",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[("基本律", r"$a^m a^n=a^{m+n},\ \frac{a^m}{a^n}=a^{m-n}$"), ("分數指數", r"$a^{m/n}=\sqrt[n]{a^m}$")],
            usage=["處理冪次化簡與科學記號轉換。"],
            examples=["$a^{-2}=\frac1{a^2}$。"],
            tips=["先檢查底數限制再套指數律。"],
            notes=["分數指數與根號可互換。"],
            mistakes=["負指數當成負數而非倒數。"],
        ),
        topic_row(
            id_="s1-1-5-logarithm-core",
            title="對數定義與運算律",
            chapter_code="s1-1-5",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[("定義", r"$a^x=b\iff x=\log_a b$"), ("運算律", r"$\log_a(MN)=\log_aM+\log_aN$")],
            usage=["轉換指數與對數方程式。"],
            examples=["$\\log_a1=0,\\ \\log_aa=1$。"],
            tips=["先檢查條件：$a>0,a\ne1,b>0$。"],
            notes=["對數就是求指數。"],
            mistakes=["忽略真數必須大於 0。"],
        ),
        topic_row(
            id_="s1-2-1-line-equations-core",
            title="直線方程式與斜率",
            chapter_code="s1-2-1",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[("斜率", r"$m=\frac{y_2-y_1}{x_2-x_1}$"), ("點斜式", r"$y-y_1=m(x-x_1)$")],
            usage=["建立直線方程，判斷平行與垂直。"],
            examples=["平行線斜率相等，垂直線斜率乘積為 $-1$（非垂直線）。"],
            tips=["先找已知點與斜率再選公式。"],
            notes=["垂直線可寫成 $x=c$。"],
            mistakes=["分母寫反導致斜率符號錯誤。"],
        ),
        topic_row(
            id_="s1-2-2-circle-equation-core",
            title="圓的方程式與幾何參數",
            chapter_code="s1-2-2",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[("標準式", r"$(x-h)^2+(y-k)^2=r^2$"), ("一般式", r"$x^2+y^2+Dx+Ey+F=0$")],
            usage=["由圓心半徑或條件點求圓方程。"],
            examples=["一般式可配方還原成標準式。"],
            tips=["配方後要檢查半徑是否為正。"],
            notes=["圓心為 $(h,k)$。"],
            mistakes=["配方常數補錯造成半徑錯誤。"],
        ),
        topic_row(
            id_="s1-2-3-line-circle-relation-core",
            title="直線與圓的位置關係",
            chapter_code="s1-2-3",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[("判別", r"$d\ \text{與}\ r\ \text{比較}$"), ("切線條件", r"$d=r$")],
            usage=["判斷相交、相切、相離與切線方程。"],
            examples=["點到直線距離可用來判斷與圓關係。"],
            tips=["先算圓心到直線距離 d。"],
            notes=["$d<r$ 相交兩點，$d>r$ 相離。"],
            mistakes=["忘記距離要取絕對值。"],
        ),
        topic_row(
            id_="s1-3-1-polynomial-function-core",
            title="多項式函數與餘式定理",
            chapter_code="s1-3-1",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[("餘式定理", r"$f(x)\div(x-a)\Rightarrow \text{餘式 }f(a)$"), ("因式定理", r"$f(a)=0\iff (x-a)\text{ 為因式}$")],
            usage=["快速判斷根與因式、簡化除法計算。"],
            examples=["若 $f(2)=0$，則 $(x-2)$ 是因式。"],
            tips=["代值可先驗證候選根。"],
            notes=["餘式定理是因式定理的基礎。"],
            mistakes=["把除式係數誤代成根。"],
        ),
        topic_row(
            id_="s1-3-2-polynomial-graph-core",
            title="多項式函數圖形與平移",
            chapter_code="s1-3-2",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[("水平平移", r"$y=f(x-h)$"), ("垂直平移", r"$y=f(x)+k$")],
            usage=["由基準圖形快速畫出變形圖。"],
            examples=["$y=(x-2)^2+1$ 為拋物線右移 2、上移 1。"],
            tips=["先看括號內，再看括號外。"],
            notes=["偶次與奇次圖形端點行為不同。"],
            mistakes=["把 $x-h$ 的方向看反。"],
        ),
        topic_row(
            id_="s1-3-3-polynomial-inequality-core",
            title="多項式不等式解法（符號表）",
            chapter_code="s1-3-3",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[("流程", r"$\text{因式分解}\to\text{臨界點}\to\text{符號表}$"), ("解集", r"$(-\infty,a)\cup(b,\infty)$")],
            usage=["一次、二次與可分解高次不等式。"],
            examples=["利用臨界點分區間測試正負。"],
            tips=["重根穿越時符號可能不變。"],
            notes=["答案通常是區間聯集。"],
            mistakes=["只測一個區間就下結論。"],
        ),
        topic_row(
            id_="s1-x-integrated-checklist",
            title="高一上整合檢核與解題流程",
            chapter_code="s1-x",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[("先判章節", r"$\text{代數/幾何/函數}$"), ("後選工具", r"$\text{公式}\to\text{條件}\to\text{驗算}$")],
            usage=["跨章題先定位主題再決定解法。"],
            examples=["直線圓題先用幾何關係，再回到代數計算。"],
            tips=["每題收尾做條件與單位檢查。"],
            notes=["減少盲算與無效步驟。"],
            mistakes=["看到公式就套，未先判斷題型條件。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(id_="q-s1-full-001", title="實數分類（基礎01）", chapter_code="s1-1-1", difficulty="基礎", question_text="下列何者是無理數：$\\sqrt{2},\\frac{3}{4},-2$？", answer_text="$\\sqrt{2}$。", explanation_text="不能表示成整數比的為無理數。", topic_id="s1-1-1-real-number-core"),
        question_row(id_="q-s1-full-002", title="稠密性（中等01）", chapter_code="s1-1-1", difficulty="中等", question_text="在 $2$ 與 $3$ 之間是否存在有理數？", answer_text="存在，且無限多個。", explanation_text="如 $\\frac52$，有理數在實數中具稠密性。", topic_id="s1-1-1-real-number-core"),
        question_row(id_="q-s1-full-003", title="絕對值計算（基礎01）", chapter_code="s1-1-2", difficulty="基礎", question_text="$|-7|$ 等於多少？", answer_text="$7$。", explanation_text="絕對值表示到 0 的距離。", topic_id="s1-1-2-absolute-value-core"),
        question_row(id_="q-s1-full-004", title="絕對值方程（中等01）", chapter_code="s1-1-2", difficulty="中等", question_text="解 $|x-3|=2$。", answer_text="$x=1$ 或 $x=5$。", explanation_text="距離 3 為 2 的點有左右兩個。", topic_id="s1-1-2-absolute-value-core"),
        question_row(id_="q-s1-full-005", title="乘法公式（基礎01）", chapter_code="s1-1-3", difficulty="基礎", question_text="展開 $(x+2)^2$。", answer_text="$x^2+4x+4$。", explanation_text="套用 $(a+b)^2=a^2+2ab+b^2$。", topic_id="s1-1-3-algebraic-operations"),
        question_row(id_="q-s1-full-006", title="平方差（基礎02）", chapter_code="s1-1-3", difficulty="基礎", question_text="因式分解 $x^2-9$。", answer_text="$(x-3)(x+3)$。", explanation_text="平方差公式。", topic_id="s1-1-3-algebraic-operations"),
        question_row(id_="q-s1-full-007", title="指數律（基礎01）", chapter_code="s1-1-4", difficulty="基礎", question_text="化簡 $a^3\\cdot a^5$。", answer_text="$a^8$。", explanation_text="同底相乘，指數相加。", topic_id="s1-1-4-exponent-rules"),
        question_row(id_="q-s1-full-008", title="負指數（中等01）", chapter_code="s1-1-4", difficulty="中等", question_text="化簡 $x^{-2}$。", answer_text="$\\frac{1}{x^2}$。", explanation_text="負指數代表倒數。", topic_id="s1-1-4-exponent-rules"),
        question_row(id_="q-s1-full-009", title="對數定義（基礎01）", chapter_code="s1-1-5", difficulty="基礎", question_text="$\\log_2 8$ 的值為何？", answer_text="$3$。", explanation_text="$2^3=8$。", topic_id="s1-1-5-logarithm-core"),
        question_row(id_="q-s1-full-010", title="對數運算（中等01）", chapter_code="s1-1-5", difficulty="中等", question_text="化簡 $\\log_a (MN)$。", answer_text="$\\log_a M+\\log_a N$。", explanation_text="對數乘法公式。", topic_id="s1-1-5-logarithm-core"),
        question_row(id_="q-s1-full-011", title="斜率（基礎01）", chapter_code="s1-2-1", difficulty="基礎", question_text="點 $(1,2)$、$(3,8)$ 的斜率？", answer_text="$3$。", explanation_text="$m=\\frac{8-2}{3-1}=3$。", topic_id="s1-2-1-line-equations-core"),
        question_row(id_="q-s1-full-012", title="點斜式（中等01）", chapter_code="s1-2-1", difficulty="中等", question_text="過點 $(2,-1)$ 且斜率 $4$ 的直線方程式？", answer_text="$y+1=4(x-2)$。", explanation_text="直接代入點斜式。", topic_id="s1-2-1-line-equations-core"),
        question_row(id_="q-s1-full-013", title="圓方程（基礎01）", chapter_code="s1-2-2", difficulty="基礎", question_text="圓心 $(0,0)$、半徑 $5$ 的方程式？", answer_text="$x^2+y^2=25$。", explanation_text="標準式 $(x-h)^2+(y-k)^2=r^2$。", topic_id="s1-2-2-circle-equation-core"),
        question_row(id_="q-s1-full-014", title="圓心半徑（中等01）", chapter_code="s1-2-2", difficulty="中等", question_text="$x^2+y^2-4x+6y-12=0$ 的圓心與半徑？", answer_text="圓心 $(2,-3)$，半徑 $5$。", explanation_text="配方得 $(x-2)^2+(y+3)^2=25$。", topic_id="s1-2-2-circle-equation-core"),
        question_row(id_="q-s1-full-015", title="位置關係（基礎01）", chapter_code="s1-2-3", difficulty="基礎", question_text="若圓心到直線距離 $d$ 大於半徑 $r$，直線與圓關係？", answer_text="相離。", explanation_text="$d>r$ 時無交點。", topic_id="s1-2-3-line-circle-relation-core"),
        question_row(id_="q-s1-full-016", title="切線條件（中等01）", chapter_code="s1-2-3", difficulty="中等", question_text="圓與直線相切時，圓心到直線距離與半徑關係？", answer_text="$d=r$。", explanation_text="相切等價於僅一交點。", topic_id="s1-2-3-line-circle-relation-core"),
        question_row(id_="q-s1-full-017", title="餘式定理（基礎01）", chapter_code="s1-3-1", difficulty="基礎", question_text="$f(x)=x^2-5x+6$ 除以 $(x-2)$ 的餘式？", answer_text="$0$。", explanation_text="餘式為 $f(2)=0$。", topic_id="s1-3-1-polynomial-function-core"),
        question_row(id_="q-s1-full-018", title="因式判斷（中等01）", chapter_code="s1-3-1", difficulty="中等", question_text="若 $f(3)=0$，可判斷哪個因式？", answer_text="$(x-3)$ 是因式。", explanation_text="因式定理。", topic_id="s1-3-1-polynomial-function-core"),
        question_row(id_="q-s1-full-019", title="平移判讀（基礎01）", chapter_code="s1-3-2", difficulty="基礎", question_text="$y=(x-1)^2+4$ 相對於 $y=x^2$ 如何平移？", answer_text="右移 1，上移 4。", explanation_text="括號內反向、括號外同向。", topic_id="s1-3-2-polynomial-graph-core"),
        question_row(id_="q-s1-full-020", title="圖形方向（中等01）", chapter_code="s1-3-2", difficulty="中等", question_text="$y=-x^4$ 兩端趨勢為何？", answer_text="$x\\to\\pm\\infty$ 時 $y\\to-\\infty$。", explanation_text="偶次且首項係數為負。", topic_id="s1-3-2-polynomial-graph-core"),
        question_row(id_="q-s1-full-021", title="不等式解集（中等01）", chapter_code="s1-3-3", difficulty="中等", question_text="解 $(x-1)(x-3)>0$。", answer_text="$x<1$ 或 $x>3$。", explanation_text="符號表判斷外側區間為正。", topic_id="s1-3-3-polynomial-inequality-core"),
        question_row(id_="q-s1-full-022", title="不等式含等號（中等02）", chapter_code="s1-3-3", difficulty="中等", question_text="解 $x(x-2)\\le0$。", answer_text="$0\\le x\\le2$。", explanation_text="兩根間（含端點）為非正。", topic_id="s1-3-3-polynomial-inequality-core"),
        question_row(id_="q-s1-full-023", title="跨章判題（基礎01）", chapter_code="s1-x", difficulty="基礎", question_text="遇到綜合題第一步最建議做什麼？", answer_text="先判斷章節類型與已知條件。", explanation_text="先定位題型可避免錯套公式。", topic_id="s1-x-integrated-checklist"),
        question_row(id_="q-s1-full-024", title="收尾檢核（基礎02）", chapter_code="s1-x", difficulty="基礎", question_text="算完答案後，至少要做哪兩個檢查？", answer_text="條件檢查與結果合理性檢查。", explanation_text="可過濾符號錯與不合情境答案。", topic_id="s1-x-integrated-checklist"),
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
