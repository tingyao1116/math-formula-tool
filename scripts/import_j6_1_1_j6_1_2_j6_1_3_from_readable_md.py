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
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三下1_二次函數與其圖形_整理\改國三下1_二次函數與其圖形_易讀版.md"
)
SOURCE_REF = "改國三下1_二次函數與其圖形_易讀版.md（重點整理匯入）"

CHAPTER_NAMES = {
    "j6-1-1": "二次函數與其圖形：二次函數定義",
    "j6-1-2": "二次函數與其圖形：二次函數圖形",
    "j6-1-3": "二次函數與其圖形：二次函數應用",
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


def backup_file(path: Path, suffix: str) -> str:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"{path.stem}.pre-{suffix}-{ts}{path.suffix}"
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
        "stage": "國中",
        "grade": "國三",
        "term": "國三下",
        "chapter": chapter,
        "chapterCode": chapter_code,
        "domain": "代數與函數",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", chapter_code, chapter, "二次函數"],
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
        "stage": "國中",
        "grade": "國三",
        "chapter": chapter,
        "chapter_code": chapter_code,
        "difficulty": difficulty,
        "source_type": "md_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    specs = [
        {
            "id_": "j6-1-1-function-relation-and-fx",
            "title": "函數關係與 $y=f(x)$ 表示",
            "chapter_code": "j6-1-1",
            "chapter_role": "核心概念",
            "difficulty": "基礎",
            "formula_lines": [("函數記號", r"$y=f(x)$"), ("對應關係", r"$x\mapsto y$")],
            "usage": ["先釐清題目是否在談輸入與輸出的唯一對應關係。"],
            "examples": ["已知 $f(2)=5$，代表當 $x=2$ 時，$y=5$。"],
            "tips": ["看到 $f(a)$ 就先代入 $x=a$ 計算。"],
            "notes": ["這是後續判斷一次、二次函數的入口。"],
            "mistakes": ["把 $f(x)$ 誤解成 $f\\times x$。"],
        },
        {
            "id_": "j6-1-1-quadratic-definition",
            "title": "二次函數的判別",
            "chapter_code": "j6-1-1",
            "chapter_role": "核心概念",
            "difficulty": "基礎",
            "formula_lines": [("二次函數", r"$y=ax^2+bx+c,\ a\ne0$"), ("關鍵次方", r"$x^2$")],
            "usage": ["快速判斷某式是否屬於二次函數。"],
            "examples": ["$y=2x^2-3x+1$ 是二次函數；$y=3x+2$ 不是。"],
            "tips": ["先看最高次是否為 2，再檢查 $a\neq0$。"],
            "notes": ["不要被常數項或一次項有無影響判斷。"],
            "mistakes": ["把 $a=0$ 的式子仍當成二次函數。"],
        },
        {
            "id_": "j6-1-1-general-form-ax2-bx-c",
            "title": "一般式 $ax^2+bx+c$ 的係數意義",
            "chapter_code": "j6-1-1",
            "chapter_role": "公式與性質",
            "difficulty": "基礎",
            "formula_lines": [("一般式", r"$y=ax^2+bx+c$"), ("條件", r"$a\ne0$")],
            "usage": ["拆解題目給的函數，掌握三個係數角色。"],
            "examples": ["在 $y=-x^2+4x-3$ 中，$a=-1,b=4,c=-3$。"],
            "tips": ["先整理成標準順序再讀係數。"],
            "notes": ["$c$ 同時是 $y$-截距（令 $x=0$）。"],
            "mistakes": ["整理前直接讀係數導致正負號看錯。"],
        },
        {
            "id_": "j6-1-1-linear-vs-quadratic",
            "title": "一次函數與二次函數差異",
            "chapter_code": "j6-1-1",
            "chapter_role": "典型題型",
            "difficulty": "中等",
            "formula_lines": [("一次函數", r"$y=mx+b$"), ("二次函數", r"$y=ax^2+bx+c$")],
            "usage": ["比較題與分類題常出現。"],
            "examples": ["看圖形：直線對應一次函數，拋物線對應二次函數。"],
            "tips": ["代入兩組 $x$ 比較差分，二次函數的差分不固定。"],
            "notes": ["圖形與代數表示可互相驗證。"],
            "mistakes": ["只看是否有 $x$ 而忽略 $x^2$。"],
        },
        {
            "id_": "j6-1-1-evaluate-and-domain-basic",
            "title": "函數值計算與定義域基本判斷",
            "chapter_code": "j6-1-1",
            "chapter_role": "典型題型",
            "difficulty": "中等",
            "formula_lines": [("代值", r"$f(a)$"), ("二次多項式", r"$\text{定義域通常為全體實數}$")],
            "usage": ["求值題、文字題前置計算。"],
            "examples": ["若 $f(x)=x^2-2x$，則 $f(3)=3$。"],
            "tips": ["先加括號再代數，避免符號錯誤。"],
            "notes": ["國中常見二次函數定義域為所有實數。"],
            "mistakes": ["把 $f(-2)$ 算成 $-2^2$ 而非 $( -2 )^2$。"],
        },
        {
            "id_": "j6-1-2-parabola-opening-and-axis",
            "title": "拋物線開口方向與對稱軸",
            "chapter_code": "j6-1-2",
            "chapter_role": "核心概念",
            "difficulty": "基礎",
            "formula_lines": [("開口判斷", r"$a>0\Rightarrow \text{開口向上},\ a<0\Rightarrow \text{開口向下}$"), ("對稱軸", r"$x=-\frac{b}{2a}$")],
            "usage": ["讀圖與速判題最常用。"],
            "examples": ["$y=-2x^2+4x+1$ 開口向下。"],
            "tips": ["先看 $a$ 的正負，再找對稱軸。"],
            "notes": ["開口與最大最小值方向一致。"],
            "mistakes": ["把對稱軸寫成 $y=-\\frac{b}{2a}$。"],
        },
        {
            "id_": "j6-1-2-vertex-formula",
            "title": "頂點座標公式與求法",
            "chapter_code": "j6-1-2",
            "chapter_role": "公式與性質",
            "difficulty": "中等",
            "formula_lines": [("頂點 $x$", r"$x_v=-\frac{b}{2a}$"), ("頂點 $y$", r"$y_v=f(x_v)$")],
            "usage": ["求圖形關鍵點與極值。"],
            "examples": [r"若 $y=x^2-4x+1$，則頂點 $x_v=2$，$y_v=-3$。"],
            "tips": ["先算 $x_v$ 再代回原式。"],
            "notes": ["配方法可作為驗算。"],
            "mistakes": ["把 $y_v$ 誤算成 $-\\frac{b}{2a}$。"],
        },
        {
            "id_": "j6-1-2-symmetric-points-and-y-intercept",
            "title": "對稱點、$y$-截距與圖形讀值",
            "chapter_code": "j6-1-2",
            "chapter_role": "典型題型",
            "difficulty": "中等",
            "formula_lines": [("截距", r"$x=0\Rightarrow y=c$"), ("對稱", r"$x_v-h\ \text{與}\ x_v+h\ \text{函數值相等}$")],
            "usage": ["快速補點畫圖與讀圖。"],
            "examples": ["頂點在 $x=1$ 時，$x=0$ 與 $x=2$ 的函數值相等。"],
            "tips": ["先找軸，再左右配對點。"],
            "notes": ["少算點時，對稱點可大幅提升準確度。"],
            "mistakes": ["只算單側點，導致圖形偏斜。"],
        },
        {
            "id_": "j6-1-2-max-min-and-range",
            "title": "最大值、最小值與值域",
            "chapter_code": "j6-1-2",
            "chapter_role": "公式與性質",
            "difficulty": "中等",
            "formula_lines": [("極值點", r"$(x_v,y_v)$"), ("值域", r"$a>0\Rightarrow y\ge y_v,\ a<0\Rightarrow y\le y_v$")],
            "usage": ["應用題與不等式題的核心。"],
            "examples": ["$y=2x^2-8x+3$ 最小值為 $-5$。"],
            "tips": ["先看開口方向，再下結論。"],
            "notes": ["值域敘述要帶不等號方向。"],
            "mistakes": ["把最大值與最小值方向寫反。"],
        },
        {
            "id_": "j6-1-2-table-plotting-procedure",
            "title": "列表法畫二次函數圖形",
            "chapter_code": "j6-1-2",
            "chapter_role": "典型題型",
            "difficulty": "基礎",
            "formula_lines": [("步驟", r"$\text{選 }x\to\text{算 }y\to\text{描點連線}$"), ("對稱補點", r"$x_v\pm h$")],
            "usage": ["沒有計算機時的穩定作圖流程。"],
            "examples": ["取 $x=-1,0,1,2,3$ 算出對應 $y$ 後描點。"],
            "tips": ["以對稱軸為中心選點，計算量最少。"],
            "notes": ["點太少會失真，至少取 5 點。"],
            "mistakes": ["用折線連點而非平滑曲線。"],
        },
        {
            "id_": "j6-1-3-x-intercept-and-root-count",
            "title": "與 $x$ 軸交點與解的個數",
            "chapter_code": "j6-1-3",
            "chapter_role": "核心概念",
            "difficulty": "中等",
            "formula_lines": [("交點條件", r"$y=0$"), ("個數判斷", r"$\text{看拋物線與 }x\text{ 軸相交情形}$")],
            "usage": ["圖形題與方程式題的橋接。"],
            "examples": ["若頂點在 $x$ 軸上，通常只有一個交點。"],
            "tips": ["先畫概形再判交點數。"],
            "notes": ["國中可先用圖形直觀，不必強制用判別式。"],
            "mistakes": ["把切於 $x$ 軸誤判成兩個不同解。"],
        },
        {
            "id_": "j6-1-3-find-function-from-conditions",
            "title": "由條件反求二次函數",
            "chapter_code": "j6-1-3",
            "chapter_role": "典型題型",
            "difficulty": "進階",
            "formula_lines": [("未知係數", r"$y=ax^2+bx+c$"), ("代入條件", r"$\text{點在圖上}\Rightarrow \text{可列方程}$")],
            "usage": ["已知三點、頂點與一點等反求題。"],
            "examples": ["通過 $(0,1),(1,0),(2,1)$ 可求得 $y=x^2-2x+1$。"],
            "tips": ["先用簡單點（如 $x=0$）優先求 $c$。"],
            "notes": ["條件不足時可能有多解，需檢查題目限制。"],
            "mistakes": ["列式後漏解聯立方程。"],
        },
        {
            "id_": "j6-1-3-parameter-a-effect",
            "title": "參數 $a$ 對圖形寬窄與方向的影響",
            "chapter_code": "j6-1-3",
            "chapter_role": "公式與性質",
            "difficulty": "中等",
            "formula_lines": [("比較", r"$|a|\uparrow \Rightarrow \text{圖形較窄}$"), ("方向", r"$a\text{ 的正負決定開口}$")],
            "usage": ["比較圖形、選圖題、參數題。"],
            "examples": ["$y=3x^2$ 比 $y=x^2$ 更窄。"],
            "tips": ["比較時先固定頂點再看 $a$。"],
            "notes": ["寬窄比較要看 $|a|$ 不是只看 $a$。"],
            "mistakes": ["把 $a=-3$ 誤認為比 $a=1$ 更寬。"],
        },
        {
            "id_": "j6-1-3-word-problem-optimization",
            "title": "情境應用：面積與最佳化",
            "chapter_code": "j6-1-3",
            "chapter_role": "典型題型",
            "difficulty": "進階",
            "formula_lines": [("模型", r"$A(x)=ax^2+bx+c$"), ("最佳值", r"$x_v=-\frac{b}{2a}$")],
            "usage": ["面積最大、利潤最大等文字題。"],
            "examples": ["固定周長長方形的面積模型常形成二次函數。"],
            "tips": ["先設變數、寫限制，再建模。"],
            "notes": ["答案要回到題目語境（單位、範圍）。"],
            "mistakes": ["只算到頂點，不檢查變數可行範圍。"],
        },
        {
            "id_": "j6-1-3-exam-checklist-and-traps",
            "title": "綜合檢核：作圖與計算常見陷阱",
            "chapter_code": "j6-1-3",
            "chapter_role": "易錯陷阱",
            "difficulty": "基礎",
            "formula_lines": [("必檢", r"$a\text{ 正負、}x_v=-\frac{b}{2a},\ y_v=f(x_v)$"), ("交點", r"$\text{先代 }x=0,\ y=0$")],
            "usage": ["段考前總複習與錯題回顧。"],
            "examples": ["畫圖前先列：開口、軸、頂點、截距。"],
            "tips": ["每題最後做『符號檢查』與『合理性檢查』。"],
            "notes": ["作圖題以關鍵點為主，不要盲算大量點。"],
            "mistakes": ["把代數答案與圖形結論互相矛盾仍未發現。"],
        },
    ]
    return [topic_row(**item) for item in specs]


def build_questions() -> List[Dict]:
    specs = [
        {
            "id_": "q-j6-1-quad-001",
            "title": "函數記號判讀（基礎01）",
            "chapter_code": "j6-1-1",
            "difficulty": "基礎",
            "question_text": "若 $f(3)=7$，代表輸入與輸出分別是多少？",
            "answer_text": "輸入 $x=3$，輸出 $y=7$。",
            "explanation_text": "$f(3)$ 的 3 是輸入值，結果是對應輸出值。",
            "topic_id": "j6-1-1-function-relation-and-fx",
        },
        {
            "id_": "q-j6-1-quad-002",
            "title": "函數代值（基礎02）",
            "chapter_code": "j6-1-1",
            "difficulty": "基礎",
            "question_text": "已知 $f(x)=2x+1$，求 $f(-2)$。",
            "answer_text": "$-3$。",
            "explanation_text": "代入得 $f(-2)=2(-2)+1=-3$。",
            "topic_id": "j6-1-1-function-relation-and-fx",
        },
        {
            "id_": "q-j6-1-quad-003",
            "title": "二次函數判別（基礎01）",
            "chapter_code": "j6-1-1",
            "difficulty": "基礎",
            "question_text": "下列何者為二次函數：$y=3x^2-2x+5$、$y=4x-1$、$y=7$？",
            "answer_text": "只有 $y=3x^2-2x+5$。",
            "explanation_text": "二次函數需有 $x^2$ 且二次項係數不為 0。",
            "topic_id": "j6-1-1-quadratic-definition",
        },
        {
            "id_": "q-j6-1-quad-004",
            "title": "二次係數條件（基礎02）",
            "chapter_code": "j6-1-1",
            "difficulty": "基礎",
            "question_text": "若 $y=ax^2+bx+c$ 且 $a=0$，此式是否為二次函數？",
            "answer_text": "不是。",
            "explanation_text": "二次函數必要條件為 $a\ne0$。",
            "topic_id": "j6-1-1-quadratic-definition",
        },
        {
            "id_": "q-j6-1-quad-005",
            "title": "讀取係數（基礎01）",
            "chapter_code": "j6-1-1",
            "difficulty": "基礎",
            "question_text": "在 $y=-2x^2+3x-4$ 中，$a,b,c$ 各是多少？",
            "answer_text": "$a=-2,b=3,c=-4$。",
            "explanation_text": "對照 $ax^2+bx+c$ 逐項讀取。",
            "topic_id": "j6-1-1-general-form-ax2-bx-c",
        },
        {
            "id_": "q-j6-1-quad-006",
            "title": "整理後讀係數（中等01）",
            "chapter_code": "j6-1-1",
            "difficulty": "中等",
            "question_text": "將 $y=5-2x+x^2$ 寫成一般式並找 $a,b,c$。",
            "answer_text": "$y=x^2-2x+5$，$a=1,b=-2,c=5$。",
            "explanation_text": "先依次方降冪排列再讀係數。",
            "topic_id": "j6-1-1-general-form-ax2-bx-c",
        },
        {
            "id_": "q-j6-1-quad-007",
            "title": "一次與二次分類（基礎01）",
            "chapter_code": "j6-1-1",
            "difficulty": "基礎",
            "question_text": "$y=2x+3$ 與 $y=2x^2+3$ 的圖形分別是什麼？",
            "answer_text": "前者直線，後者拋物線。",
            "explanation_text": "一次函數對應直線；二次函數對應拋物線。",
            "topic_id": "j6-1-1-linear-vs-quadratic",
        },
        {
            "id_": "q-j6-1-quad-008",
            "title": "差分判斷（中等01）",
            "chapter_code": "j6-1-1",
            "difficulty": "中等",
            "question_text": "若某函數等距 $x$ 的一次差分不固定，較可能是一次還是二次函數？",
            "answer_text": "較可能是二次函數。",
            "explanation_text": "一次函數一次差分固定，二次函數通常不固定。",
            "topic_id": "j6-1-1-linear-vs-quadratic",
        },
        {
            "id_": "q-j6-1-quad-009",
            "title": "函數值計算（基礎01）",
            "chapter_code": "j6-1-1",
            "difficulty": "基礎",
            "question_text": "若 $f(x)=x^2-2x$，求 $f(4)$。",
            "answer_text": "8。",
            "explanation_text": "$f(4)=16-8=8$。",
            "topic_id": "j6-1-1-evaluate-and-domain-basic",
        },
        {
            "id_": "q-j6-1-quad-010",
            "title": "負值代入（中等01）",
            "chapter_code": "j6-1-1",
            "difficulty": "中等",
            "question_text": "若 $f(x)=x^2+1$，求 $f(-3)$。",
            "answer_text": "10。",
            "explanation_text": "$f(-3)=(-3)^2+1=10$。",
            "topic_id": "j6-1-1-evaluate-and-domain-basic",
        },
        {
            "id_": "q-j6-1-quad-011",
            "title": "開口方向（基礎01）",
            "chapter_code": "j6-1-2",
            "difficulty": "基礎",
            "question_text": "函數 $y=-x^2+2x$ 的開口方向為何？",
            "answer_text": "向下。",
            "explanation_text": "二次項係數 $a=-1<0$，開口向下。",
            "topic_id": "j6-1-2-parabola-opening-and-axis",
        },
        {
            "id_": "q-j6-1-quad-012",
            "title": "對稱軸計算（中等01）",
            "chapter_code": "j6-1-2",
            "difficulty": "中等",
            "question_text": "求 $y=2x^2-8x+1$ 的對稱軸。",
            "answer_text": "$x=2$。",
            "explanation_text": "$x=-\\frac{b}{2a}=-\\frac{-8}{4}=2$。",
            "topic_id": "j6-1-2-parabola-opening-and-axis",
        },
        {
            "id_": "q-j6-1-quad-013",
            "title": "頂點座標（中等01）",
            "chapter_code": "j6-1-2",
            "difficulty": "中等",
            "question_text": "求 $y=x^2-6x+5$ 的頂點座標。",
            "answer_text": "$(3,-4)$。",
            "explanation_text": "$x_v=3$，再代入得 $y_v=9-18+5=-4$。",
            "topic_id": "j6-1-2-vertex-formula",
        },
        {
            "id_": "q-j6-1-quad-014",
            "title": "頂點公式辨識（基礎01）",
            "chapter_code": "j6-1-2",
            "difficulty": "基礎",
            "question_text": "二次函數頂點 $x$ 座標的公式是？",
            "answer_text": "$x_v=-\\frac{b}{2a}$。",
            "explanation_text": "這是一般式 $ax^2+bx+c$ 的標準公式。",
            "topic_id": "j6-1-2-vertex-formula",
        },
        {
            "id_": "q-j6-1-quad-015",
            "title": "對稱點讀值（基礎01）",
            "chapter_code": "j6-1-2",
            "difficulty": "基礎",
            "question_text": "若對稱軸為 $x=1$，且點 $(0,3)$ 在圖上，則 $(2,\\,?)$ 的 $y$ 值為何？",
            "answer_text": "3。",
            "explanation_text": "$x=0$ 與 $x=2$ 對稱於 $x=1$，函數值相等。",
            "topic_id": "j6-1-2-symmetric-points-and-y-intercept",
        },
        {
            "id_": "q-j6-1-quad-016",
            "title": "$y$-截距判讀（基礎02）",
            "chapter_code": "j6-1-2",
            "difficulty": "基礎",
            "question_text": "函數 $y=2x^2-3x+4$ 的 $y$-截距是多少？",
            "answer_text": "4。",
            "explanation_text": "令 $x=0$ 可得 $y=c=4$。",
            "topic_id": "j6-1-2-symmetric-points-and-y-intercept",
        },
        {
            "id_": "q-j6-1-quad-017",
            "title": "最小值判斷（中等01）",
            "chapter_code": "j6-1-2",
            "difficulty": "中等",
            "question_text": "若 $y=(x-2)^2-5$，此函數最小值為何？",
            "answer_text": "$-5$。",
            "explanation_text": "開口向上，頂點 $y$ 值即最小值。",
            "topic_id": "j6-1-2-max-min-and-range",
        },
        {
            "id_": "q-j6-1-quad-018",
            "title": "值域表示（中等02）",
            "chapter_code": "j6-1-2",
            "difficulty": "中等",
            "question_text": "若 $y=-(x+1)^2+3$，其值域為何？",
            "answer_text": "$y\\le 3$。",
            "explanation_text": "開口向下，最大值為 3。",
            "topic_id": "j6-1-2-max-min-and-range",
        },
        {
            "id_": "q-j6-1-quad-019",
            "title": "列表作圖（基礎01）",
            "chapter_code": "j6-1-2",
            "difficulty": "基礎",
            "question_text": "畫 $y=x^2$ 時，請給出 $x=-1,0,1$ 對應的 $y$ 值。",
            "answer_text": "分別為 $1,0,1$。",
            "explanation_text": "直接代入可得對稱點。",
            "topic_id": "j6-1-2-table-plotting-procedure",
        },
        {
            "id_": "q-j6-1-quad-020",
            "title": "作圖流程（基礎02）",
            "chapter_code": "j6-1-2",
            "difficulty": "基礎",
            "question_text": "列表法畫圖的正確順序為何？",
            "answer_text": "選 $x$ 值、計算 $y$、描點、平滑連線。",
            "explanation_text": "依流程操作可降低畫圖錯誤。",
            "topic_id": "j6-1-2-table-plotting-procedure",
        },
        {
            "id_": "q-j6-1-quad-021",
            "title": "交點個數判斷（中等01）",
            "chapter_code": "j6-1-3",
            "difficulty": "中等",
            "question_text": "若拋物線頂點在 $x$ 軸上，與 $x$ 軸有幾個交點？",
            "answer_text": "1 個（重根）。",
            "explanation_text": "切於 $x$ 軸時只接觸一點。",
            "topic_id": "j6-1-3-x-intercept-and-root-count",
        },
        {
            "id_": "q-j6-1-quad-022",
            "title": "由圖判解數（基礎01）",
            "chapter_code": "j6-1-3",
            "difficulty": "基礎",
            "question_text": "若拋物線完全在 $x$ 軸上方，方程 $ax^2+bx+c=0$ 有幾個實數解？",
            "answer_text": "0 個。",
            "explanation_text": "與 $x$ 軸無交點即無實根。",
            "topic_id": "j6-1-3-x-intercept-and-root-count",
        },
        {
            "id_": "q-j6-1-quad-023",
            "title": "三點求式（進階01）",
            "chapter_code": "j6-1-3",
            "difficulty": "進階",
            "question_text": "通過 $(0,1),(1,0),(2,1)$ 的二次函數為何？",
            "answer_text": "$y=x^2-2x+1$。",
            "explanation_text": "設 $y=ax^2+bx+c$，代三點聯立可得。",
            "topic_id": "j6-1-3-find-function-from-conditions",
        },
        {
            "id_": "q-j6-1-quad-024",
            "title": "由頂點與一點求式（進階02）",
            "chapter_code": "j6-1-3",
            "difficulty": "進階",
            "question_text": "頂點為 $(1,-2)$，且通過 $(3,6)$ 的二次函數可設為哪一種形式？",
            "answer_text": "可設 $y=a(x-1)^2-2$，再代入求 $a$。",
            "explanation_text": "有頂點時先用頂點式最省步驟。",
            "topic_id": "j6-1-3-find-function-from-conditions",
        },
        {
            "id_": "q-j6-1-quad-025",
            "title": "參數比較（中等01）",
            "chapter_code": "j6-1-3",
            "difficulty": "中等",
            "question_text": "$y=x^2$ 與 $y=4x^2$ 哪個圖形較窄？",
            "answer_text": "$y=4x^2$ 較窄。",
            "explanation_text": "$|a|$ 較大時圖形較窄。",
            "topic_id": "j6-1-3-parameter-a-effect",
        },
        {
            "id_": "q-j6-1-quad-026",
            "title": "參數正負（基礎01）",
            "chapter_code": "j6-1-3",
            "difficulty": "基礎",
            "question_text": "$a<0$ 時，拋物線開口方向為何？",
            "answer_text": "向下。",
            "explanation_text": "二次項係數正負決定開口方向。",
            "topic_id": "j6-1-3-parameter-a-effect",
        },
        {
            "id_": "q-j6-1-quad-027",
            "title": "面積最佳化（進階01）",
            "chapter_code": "j6-1-3",
            "difficulty": "進階",
            "question_text": "文字題建成二次函數後，要找最大面積通常先找哪個點？",
            "answer_text": "頂點。",
            "explanation_text": "拋物線最大或最小值發生在頂點。",
            "topic_id": "j6-1-3-word-problem-optimization",
        },
        {
            "id_": "q-j6-1-quad-028",
            "title": "最佳化流程（中等01）",
            "chapter_code": "j6-1-3",
            "difficulty": "中等",
            "question_text": "最佳化文字題最合理的流程為何？",
            "answer_text": "設變數、列限制、寫成二次函數、找頂點、回到情境檢查。",
            "explanation_text": "少一步都容易失分，尤其最後的情境檢查。",
            "topic_id": "j6-1-3-word-problem-optimization",
        },
        {
            "id_": "q-j6-1-quad-029",
            "title": "作圖檢核（基礎01）",
            "chapter_code": "j6-1-3",
            "difficulty": "基礎",
            "question_text": "二次函數作圖前至少要先確認哪三件事？",
            "answer_text": "開口方向、對稱軸、頂點。",
            "explanation_text": "這三項可決定圖形骨架，再補截距與對稱點。",
            "topic_id": "j6-1-3-exam-checklist-and-traps",
        },
        {
            "id_": "q-j6-1-quad-030",
            "title": "易錯點辨識（基礎02）",
            "chapter_code": "j6-1-3",
            "difficulty": "基礎",
            "question_text": "學生把對稱軸寫成 $y=-\\frac{b}{2a}$，錯在哪裡？",
            "answer_text": "對稱軸是直線 $x=-\\frac{b}{2a}$，不是 $y=\\dots$。",
            "explanation_text": "對稱軸與 $y$ 軸平行，方程應為 $x=\\text{常數}$。",
            "topic_id": "j6-1-3-exam-checklist-and-traps",
        },
    ]
    return [question_row(**item) for item in specs]


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
        backups.append(backup_file(FORMULA_DB, "j6-1-1-j6-1-2-j6-1-3"))
        backups.append(backup_file(QUESTION_DB, "j6-1-1-j6-1-2-j6-1-3"))

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
