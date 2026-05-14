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
    r"C:/Users/user/OneDrive/文件/張快自製講義/codex白話講義/高中數學哈特利重點版/高二下數A全重點_整理/高二下數A全重點_易讀版.md"
)
SOURCE_REF = "高二下數A全重點_易讀版.md（重點整理匯入）"

S4_CODES = [
    "s4-1-1",
    "s4-1-2",
    "s4-1-3",
    "s4-1-4",
    "s4-2-1",
    "s4-2-2",
    "s4-3-1",
    "s4-3-2",
    "s4-4-1",
    "s4-4-2",
    "s4-4-3",
    "s4-4-4",
    "s4-x",
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
    "s4-1-1": "空間向量：空間概念",
    "s4-1-2": "空間向量：空間向量的坐標表示法",
    "s4-1-3": "空間向量：空間向量的內積",
    "s4-1-4": "空間向量：外積、體積與行列式",
    "s4-2-1": "空間中的平面與直線：空間中的平面方程式",
    "s4-2-2": "空間中的平面與直線：空間中的直線方程式",
    "s4-3-1": "條件機率與獨立：條件機率與貝氏定理",
    "s4-3-2": "條件機率與獨立：獨立事件",
    "s4-4-1": "矩陣：線性方程組與矩陣",
    "s4-4-2": "矩陣：矩陣的運算",
    "s4-4-3": "矩陣：變換矩陣的應用",
    "s4-4-4": "矩陣：平面上的線性變換與二階方陣",
    "s4-x": "高二下補充",
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
        "grade": "高二",
        "term": "高二下",
        "chapter": chapter,
        "chapterCode": chapter_code,
        "domain": "高中數學",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", chapter_code, chapter, "高二下"],
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
        "grade": "高二",
        "chapter": chapter,
        "chapter_code": chapter_code,
        "difficulty": difficulty,
        "source_type": "md_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics(chapter_names: Dict[str, str]) -> List[Dict]:
    seeds = [
        {"id_": "s4-1-1-space-concept-core", "title": "空間概念與座標基礎", "chapter_code": "s4-1-1", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("距離公式", r"$d=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2+(z_2-z_1)^2}$")], "usage": ["三維幾何題先建立座標與方向。"], "examples": ["兩點距離可視為三維畢氏定理。"], "tips": ["先固定座標系可降低計算錯誤。"], "notes": ["空間概念是向量與平面方程的基礎。"], "mistakes": ["忽略第三個坐標分量。"]},
        {"id_": "s4-1-2-space-vector-coordinate-core", "title": "空間向量的坐標表示", "chapter_code": "s4-1-2", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("向量表示", r"$\vec a=(a_1,a_2,a_3)$"), ("長度", r"$|\vec a|=\sqrt{a_1^2+a_2^2+a_3^2}$")], "usage": ["把幾何問題轉成分量運算。"], "examples": [r"$\overrightarrow{AB}=(x_B-x_A,\ y_B-y_A,\ z_B-z_A)$。"], "tips": ["先寫出起點到終點再做相減。"], "notes": ["分量法可直接套線代工具。"], "mistakes": ["向量方向寫反。"]},
        {"id_": "s4-1-3-space-dot-product-core", "title": "空間向量內積與夾角", "chapter_code": "s4-1-3", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("內積", r"$\vec a\cdot\vec b=a_1b_1+a_2b_2+a_3b_3$"), ("夾角", r"$\cos\theta=\frac{\vec a\cdot\vec b}{|\vec a||\vec b|}$")], "usage": ["判斷垂直、求夾角與投影長。"], "examples": [r"$\vec a\cdot\vec b=0$ 可判斷兩向量垂直。"], "tips": ["先算內積再判符號與大小。"], "notes": [r"夾角範圍通常取 $[0,\pi]$。"], "mistakes": ["把內積當成向量。"]},
        {"id_": "s4-1-4-cross-volume-determinant-core", "title": "外積、體積與行列式", "chapter_code": "s4-1-4", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("外積長度", r"$|\vec a\times\vec b|=|\vec a||\vec b|\sin\theta$"), ("混合積", r"$V=|\vec a\cdot(\vec b\times\vec c)|$")], "usage": ["求平行四邊形面積與平行六面體體積。"], "examples": ["三向量共平面時混合積為 0。"], "tips": ["幾何量要取絕對值。"], "notes": ["行列式與向量外積密切相關。"], "mistakes": ["忘記體積取絕對值。"]},
        {"id_": "s4-2-1-plane-equation-core", "title": "空間平面方程式", "chapter_code": "s4-2-1", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("一般式", r"$ax+by+cz+d=0$"), ("法向量", r"$\vec n=(a,b,c)$")], "usage": ["用法向量建立平面方程與夾角。"], "examples": [r"過點 $P_0(x_0,y_0,z_0)$ 的平面：$a(x-x_0)+b(y-y_0)+c(z-z_0)=0$。"], "tips": ["先找法向量再代點。"], "notes": ["平面夾角可轉為法向量夾角。"], "mistakes": ["把方向向量誤當法向量。"]},
        {"id_": "s4-2-2-line-equation-space-core", "title": "空間直線方程式", "chapter_code": "s4-2-2", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("參數式", r"$\begin{cases}x=x_0+at\\y=y_0+bt\\z=z_0+ct\end{cases}$"), ("對稱式", r"$\frac{x-x_0}{a}=\frac{y-y_0}{b}=\frac{z-z_0}{c}$")], "usage": ["用在直線交平面、異面直線距離。"], "examples": ["方向向量決定直線方向。"], "tips": ["先找過點與方向向量兩要素。"], "notes": ["參數式最穩定，對稱式需分母不為 0。"], "mistakes": ["分量為 0 時硬寫對稱式。"]},
        {"id_": "s4-3-1-conditional-bayes-core", "title": "條件機率與貝氏定理", "chapter_code": "s4-3-1", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("條件機率", r"$P(A\mid B)=\frac{P(A\cap B)}{P(B)}$"), ("貝氏定理", r"$P(A_i\mid B)=\frac{P(B\mid A_i)P(A_i)}{\sum_j P(B\mid A_j)P(A_j)}$")], "usage": ["用在反向推論與檢驗題型。"], "examples": ["陽性率與真實患病率要分清楚。"], "tips": ["先畫事件樹狀圖最不容易錯。"], "notes": ["分母常用全機率公式。"], "mistakes": [r"把 $P(A\mid B)$ 與 $P(B\mid A)$ 混為一談。"]},
        {"id_": "s4-3-2-independent-events-core", "title": "獨立事件與乘法法則", "chapter_code": "s4-3-2", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("獨立定義", r"$P(A\cap B)=P(A)P(B)$"), ("互斥比較", r"互斥不等於獨立（除非機率特殊）")], "usage": ["判斷事件關係與計算聯合機率。"], "examples": ["擲硬幣兩次屬獨立事件。"], "tips": ["先看是否彼此影響，再判斷是否獨立。"], "notes": ["獨立與互斥是不同概念。"], "mistakes": ["把互斥當成獨立。"]},
        {"id_": "s4-4-1-linear-system-matrix-core", "title": "線性方程組與矩陣表示", "chapter_code": "s4-4-1", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("矩陣式", r"$A\mathbf{x}=\mathbf{b}$"), ("增廣矩陣", r"$[A\mid \mathbf b]$")], "usage": ["把方程組轉成矩陣做消去。"], "examples": ["列運算可用來判斷解的型態。"], "tips": ["先寫增廣矩陣再做列簡化。"], "notes": ["解的存在性與秩有關。"], "mistakes": ["列運算時左右欄位不同步。"]},
        {"id_": "s4-4-2-matrix-operations-core", "title": "矩陣運算與逆矩陣", "chapter_code": "s4-4-2", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("乘法條件", r"$(m\times n)(n\times p)\to m\times p$"), ("逆矩陣", r"$AA^{-1}=I$"), ("二階逆矩陣", r"$A^{-1}=\frac1{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$")], "usage": ["用在聯立方程、變換與遞推。"], "examples": ["先檢查 $ad-bc\neq0$ 才有逆矩陣。"], "tips": ["矩陣乘法不具交換律。"], "notes": ["單位矩陣是乘法單位元。"], "mistakes": ["把 $AB$ 與 $BA$ 視為相同。"]},
        {"id_": "s4-4-3-transformation-matrix-application-core", "title": "變換矩陣的應用", "chapter_code": "s4-4-3", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("旋轉矩陣", r"$R_\theta=\begin{bmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{bmatrix}$"), ("縮放矩陣", r"$S=\begin{bmatrix}k_x&0\\0&k_y\end{bmatrix}$")], "usage": ["用在座標點旋轉、縮放與資料轉換。"], "examples": [r"點 $(x,y)$ 旋轉後可寫成矩陣乘積。"], "tips": ["先確定是作用在向量還是座標軸。"], "notes": ["多步變換可用矩陣連乘表示。"], "mistakes": ["矩陣乘法順序寫反。"]},
        {"id_": "s4-4-4-linear-transform-2x2-core", "title": "平面線性變換與二階方陣", "chapter_code": "s4-4-4", "chapter_role": "核心概念", "difficulty": "進階", "formula_lines": [("線性變換", r"$T(\mathbf x)=A\mathbf x$"), ("面積倍率", r"$|\det(A)|$"), ("特徵方程", r"$\det(A-\lambda I)=0$")], "usage": ["用在變換後幾何量變化與矩陣性質分析。"], "examples": [r"若 $|\det(A)|=2$，面積放大 2 倍。"], "tips": ["先看行列式再看方向是否反轉。"], "notes": ["特徵值可反映主方向。"], "mistakes": ["把長度倍率誤當面積倍率。"]},
        {"id_": "s4-x-integrated-checklist", "title": "高二下整合檢核與解題流程", "chapter_code": "s4-x", "chapter_role": "統整", "difficulty": "基礎", "formula_lines": [("流程", r"$\text{判章節}\rightarrow\text{選模型}\rightarrow\text{代公式}\rightarrow\text{檢查條件}$")], "usage": ["空間、機率、矩陣混合題的解題順序指引。"], "examples": ["先判是幾何向量、機率模型或矩陣運算。"], "tips": ["列出已知/未知/限制條件再下手。"], "notes": ["整合流程能明顯降低錯題率。"], "mistakes": ["未判型就直接套用熟悉公式。"]},
    ]
    return [topic_row(chapter_names=chapter_names, **seed) for seed in seeds]


def build_questions(chapter_names: Dict[str, str]) -> List[Dict]:
    seeds = [
        ("q-s4-full-001", "三維距離（基礎01）", "s4-1-1", "基礎", r"兩點 $A(1,2,3),B(4,6,3)$ 的距離為何？", r"$5$。", r"$d=\sqrt{(4-1)^2+(6-2)^2+(3-3)^2}=5$。", "s4-1-1-space-concept-core"),
        ("q-s4-full-002", "空間中點（中等01）", "s4-1-1", "中等", r"求線段連接 $A(2,0,4),B(6,2,8)$ 的中點。", r"$(4,1,6)$。", r"三個坐標分別取平均。", "s4-1-1-space-concept-core"),
        ("q-s4-full-003", "向量分量（基礎01）", "s4-1-2", "基礎", r"若 $A(1,3,2),B(5,0,6)$，求 $\overrightarrow{AB}$。", r"$(4,-3,4)$。", r"終點減起點。", "s4-1-2-space-vector-coordinate-core"),
        ("q-s4-full-004", "向量長度（中等01）", "s4-1-2", "中等", r"求向量 $(2,-1,2)$ 的長度。", r"$3$。", r"$\sqrt{2^2+(-1)^2+2^2}=3$。", "s4-1-2-space-vector-coordinate-core"),
        ("q-s4-full-005", "內積計算（基礎01）", "s4-1-3", "基礎", r"若 $\vec a=(1,2,3),\vec b=(2,0,-1)$，求 $\vec a\cdot\vec b$。", r"$-1$。", r"$1\cdot2+2\cdot0+3\cdot(-1)=-1$。", "s4-1-3-space-dot-product-core"),
        ("q-s4-full-006", "垂直判斷（中等01）", "s4-1-3", "中等", r"向量 $(1,1,0)$ 與 $(1,-1,2)$ 是否垂直？", r"是。", r"內積 $1\cdot1+1\cdot(-1)+0\cdot2=0$。", "s4-1-3-space-dot-product-core"),
        ("q-s4-full-007", "外積幾何意義（基礎01）", "s4-1-4", "基礎", r"若 $|\vec a|=3,|\vec b|=4,\theta=30^\circ$，求 $|\vec a\times\vec b|$。", r"$6$。", r"$|\vec a\times\vec b|=3\cdot4\cdot\sin30^\circ=6$。", "s4-1-4-cross-volume-determinant-core"),
        ("q-s4-full-008", "混合積體積（中等01）", "s4-1-4", "中等", r"若 $\vec a\cdot(\vec b\times\vec c)=12$，平行六面體體積為何？", r"$12$。", r"體積取絕對值。", "s4-1-4-cross-volume-determinant-core"),
        ("q-s4-full-009", "平面法向量（基礎01）", "s4-2-1", "基礎", r"平面 $2x-y+3z-5=0$ 的法向量是什麼？", r"$(2,-1,3)$。", r"一般式係數即法向量。", "s4-2-1-plane-equation-core"),
        ("q-s4-full-010", "過點平面（中等01）", "s4-2-1", "中等", r"過點 $P(1,0,2)$ 且法向量 $\vec n=(2,-1,1)$ 的平面方程式為何？", r"$2x-y+z-4=0$。", r"$2(x-1)-1(y-0)+1(z-2)=0$。", "s4-2-1-plane-equation-core"),
        ("q-s4-full-011", "直線參數式（基礎01）", "s4-2-2", "基礎", r"過點 $(1,2,3)$、方向向量 $(2,-1,4)$ 的直線參數式為何？", r"$x=1+2t,\ y=2-t,\ z=3+4t$。", r"點加上方向向量乘參數。", "s4-2-2-line-equation-space-core"),
        ("q-s4-full-012", "直線與平面（中等01）", "s4-2-2", "中等", r"直線 $x=t,y=t,z=t$ 與平面 $x+y+z=6$ 交於何點？", r"$(2,2,2)$。", r"代入得 $3t=6\Rightarrow t=2$。", "s4-2-2-line-equation-space-core"),
        ("q-s4-full-013", "條件機率（基礎01）", "s4-3-1", "基礎", r"已知 $P(A\cap B)=0.12,P(B)=0.3$，求 $P(A\mid B)$。", r"$0.4$。", r"$P(A\mid B)=0.12/0.3=0.4$。", "s4-3-1-conditional-bayes-core"),
        ("q-s4-full-014", "貝氏定理（中等01）", "s4-3-1", "中等", r"若 $P(D)=0.01,P(+\mid D)=0.9,P(+\mid D^c)=0.05$，求 $P(D\mid +)$。", r"$\frac{0.009}{0.009+0.0495}\approx0.1538$。", r"套用貝氏定理。", "s4-3-1-conditional-bayes-core"),
        ("q-s4-full-015", "獨立判斷（基礎01）", "s4-3-2", "基礎", r"若 $P(A)=0.5,P(B)=0.4,P(A\cap B)=0.2$，$A,B$ 是否獨立？", r"是。", r"$P(A)P(B)=0.2$，符合定義。", "s4-3-2-independent-events-core"),
        ("q-s4-full-016", "互斥與獨立（中等01）", "s4-3-2", "中等", r"兩事件互斥且 $P(A),P(B)>0$，是否可能獨立？", r"不可能。", r"互斥時交集機率為 0，獨立需為乘積正值。", "s4-3-2-independent-events-core"),
        ("q-s4-full-017", "矩陣表示（基礎01）", "s4-4-1", "基礎", r"方程組 $\begin{cases}x+y=3\\2x-y=0\end{cases}$ 的矩陣式為何？", r"$A\mathbf x=\mathbf b$，其中 $A=\begin{bmatrix}1&1\\2&-1\end{bmatrix},\mathbf x=\begin{bmatrix}x\\y\end{bmatrix},\mathbf b=\begin{bmatrix}3\\0\end{bmatrix}$。", r"直接取係數矩陣與常數向量。", "s4-4-1-linear-system-matrix-core"),
        ("q-s4-full-018", "增廣矩陣（中等01）", "s4-4-1", "中等", r"上題的增廣矩陣是什麼？", r"$\left[\begin{array}{cc|c}1&1&3\\2&-1&0\end{array}\right]$。", r"係數矩陣右側併上常數欄。", "s4-4-1-linear-system-matrix-core"),
        ("q-s4-full-019", "矩陣乘法（基礎01）", "s4-4-2", "基礎", r"若 $A=\begin{bmatrix}1&2\\0&1\end{bmatrix},B=\begin{bmatrix}2&1\\3&0\end{bmatrix}$，求 $AB$。", r"$\begin{bmatrix}8&1\\3&0\end{bmatrix}$。", r"逐列逐行內積。", "s4-4-2-matrix-operations-core"),
        ("q-s4-full-020", "逆矩陣（中等01）", "s4-4-2", "中等", r"求 $A=\begin{bmatrix}2&1\\1&1\end{bmatrix}$ 的逆矩陣。", r"$A^{-1}=\begin{bmatrix}1&-1\\-1&2\end{bmatrix}$。", r"行列式為 $1$，套二階逆矩陣公式。", "s4-4-2-matrix-operations-core"),
        ("q-s4-full-021", "旋轉變換（基礎01）", "s4-4-3", "基礎", r"點 $(1,0)$ 逆時針旋轉 $90^\circ$ 後座標為何？", r"$(0,1)$。", r"用旋轉矩陣 $R_{90^\circ}$。", "s4-4-3-transformation-matrix-application-core"),
        ("q-s4-full-022", "組合變換（中等01）", "s4-4-3", "中等", r"先做 $x$ 方向放大 2 倍，再旋轉 $90^\circ$，矩陣順序應如何寫？", r"$R_{90^\circ}S_x$。", r"後做的變換放左邊。", "s4-4-3-transformation-matrix-application-core"),
        ("q-s4-full-023", "行列式倍率（基礎01）", "s4-4-4", "基礎", r"若變換矩陣 $A$ 的 $\det(A)=-3$，面積倍率為何？", r"$3$ 倍，且方向反轉。", r"面積取絕對值，符號反映方向。", "s4-4-4-linear-transform-2x2-core"),
        ("q-s4-full-024", "特徵值方程（進階01）", "s4-4-4", "進階", r"求矩陣 $\begin{bmatrix}2&0\\0&5\end{bmatrix}$ 的特徵值。", r"$2,5$。", r"由 $\det(A-\lambda I)=(2-\lambda)(5-\lambda)=0$。", "s4-4-4-linear-transform-2x2-core"),
        ("q-s4-full-025", "整合判型（基礎01）", "s4-x", "基礎", r"題目同時出現平面方程與矩陣，第一步應做什麼？", r"先分成幾何模型與代數模型兩段處理。", r"先判型再選工具最穩定。", "s4-x-integrated-checklist"),
        ("q-s4-full-026", "流程檢核（中等01）", "s4-x", "中等", r"高二下跨章題的通用流程是？", r"判章節、選模型、代公式、檢查條件。", r"尤其要檢查維度、機率條件、矩陣可逆性。", "s4-x-integrated-checklist"),
    ]
    rows = []
    for s in seeds:
        rows.append(
            question_row(
                id_=s[0],
                title=s[1],
                chapter_code=s[2],
                difficulty=s[3],
                question_text=s[4],
                answer_text=s[5],
                explanation_text=s[6],
                topic_id=s[7],
                chapter_names=chapter_names,
            )
        )
    return rows


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
        backups.append(backup_file(FORMULA_DB, "pre-s4-prefix"))
        backups.append(backup_file(QUESTION_DB, "pre-s4-prefix"))

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
