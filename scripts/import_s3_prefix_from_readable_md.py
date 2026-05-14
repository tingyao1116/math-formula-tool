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
    r"C:/Users/user/OneDrive/文件/張快自製講義/codex白話講義/高中數學哈特利重點版/高二上數A全重點_整理/高二上數A全重點_易讀版.md"
)
SOURCE_REF = "高二上數A全重點_易讀版.md（重點整理匯入）"

S3_CODES = [
    "s3-1-1",
    "s3-1-2",
    "s3-1-3",
    "s3-1-4",
    "s3-2-1",
    "s3-2-2",
    "s3-2-3",
    "s3-3-1",
    "s3-3-2",
    "s3-3-3",
    "s3-x",
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
    "s3-1-1": "三角函數：弧度、弧長",
    "s3-1-2": "三角函數：三角函數的圖形",
    "s3-1-3": "三角函數：和差角公式",
    "s3-1-4": "三角函數：正餘弦函數的疊合",
    "s3-2-1": "指數對數：指數函數",
    "s3-2-2": "指數對數：對數",
    "s3-2-3": "指數對數：對數函數",
    "s3-3-1": "平面向量：平面向量",
    "s3-3-2": "平面向量的內積：平面向量的內積",
    "s3-3-3": "面積與二階行列式：面積與二階行列式",
    "s3-x": "高二上補充",
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
        "term": "高二上",
        "chapter": chapter,
        "chapterCode": chapter_code,
        "domain": "高中數學",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", chapter_code, chapter, "高二上"],
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
        {
            "id_": "s3-1-1-radian-arc-core",
            "title": "弧度、弧長與扇形面積",
            "chapter_code": "s3-1-1",
            "chapter_role": "核心概念",
            "difficulty": "基礎",
            "formula_lines": [("弧長", r"$s=r\theta$"), ("扇形面積", r"$A=\frac12 r^2\theta$"), ("角度轉弧度", r"$180^\circ=\pi$ rad")],
            "usage": ["遇到圓周長比例與扇形問題時，先把角度統一成弧度。"],
            "examples": [r"若 $r=6,\theta=\frac{\pi}{3}$，則 $s=2\pi$。"],
            "tips": ["先確認角度單位是度數還是弧度。"],
            "notes": ["弧度是三角函數微分與極限的基礎。"],
            "mistakes": ["把 $s=r\theta$ 的 $\\theta$ 直接代度數。"],
        },
        {
            "id_": "s3-1-2-trig-graph-core",
            "title": "三角函數圖形與變換",
            "chapter_code": "s3-1-2",
            "chapter_role": "核心概念",
            "difficulty": "基礎",
            "formula_lines": [("平移縮放", r"$y=A\sin(Bx+C)+D$"), ("週期", r"$T=\frac{2\pi}{|B|}$"), ("振幅", r"$|A|$")],
            "usage": ["分析正弦、餘弦圖形的振幅、週期、位移。"],
            "examples": [r"$y=2\sin(3x)$ 週期為 $\frac{2\pi}{3}$。"],
            "tips": ["先抽出 $A,B,C,D$ 四個參數再讀圖。"],
            "notes": ["週期與振幅是最常考的兩個量。"],
            "mistakes": ["把水平位移與垂直位移方向看反。"],
        },
        {
            "id_": "s3-1-3-sum-difference-core",
            "title": "和差角公式與化簡",
            "chapter_code": "s3-1-3",
            "chapter_role": "核心概念",
            "difficulty": "中等",
            "formula_lines": [("正弦和角", r"$\sin(\alpha+\beta)=\sin\alpha\cos\beta+\cos\alpha\sin\beta$"), ("餘弦和角", r"$\cos(\alpha+\beta)=\cos\alpha\cos\beta-\sin\alpha\sin\beta$")],
            "usage": ["用在特殊角計算、恆等式化簡與反推角度。"],
            "examples": [r"$\sin 75^\circ=\sin(45^\circ+30^\circ)$。"],
            "tips": ["先選能拆成特殊角的角度組合。"],
            "notes": ["和角、差角符號要分清楚。"],
            "mistakes": ["正弦與餘弦公式符號混用。"],
        },
        {
            "id_": "s3-1-4-sine-cosine-superposition-core",
            "title": "正餘弦疊合與振幅相位",
            "chapter_code": "s3-1-4",
            "chapter_role": "核心概念",
            "difficulty": "中等",
            "formula_lines": [("疊合", r"$a\sin x+b\cos x=R\sin(x+\varphi)$"), ("振幅", r"$R=\sqrt{a^2+b^2}$")],
            "usage": ["將線性組合轉成單一三角函數便於求值與求最值。"],
            "examples": [r"$3\sin x+4\cos x=5\sin(x+\varphi)$。"],
            "tips": ["先找 $R$，再由係數比求相位角。"],
            "notes": ["常搭配最大最小值題型。"],
            "mistakes": ["只算出 $R$ 卻漏掉相位條件。"],
        },
        {
            "id_": "s3-2-1-exponential-function-core",
            "title": "指數函數性質與圖形",
            "chapter_code": "s3-2-1",
            "chapter_role": "核心概念",
            "difficulty": "基礎",
            "formula_lines": [("函數型式", r"$y=a^x\ (a>0,a\ne1)$"), ("單調性", r"$a>1$ 遞增，$0<a<1$ 遞減"), ("值域", r"$y>0$")],
            "usage": ["用在成長衰減模型、指數方程不等式。"],
            "examples": [r"$2^x$ 遞增，$\left(\frac12\right)^x$ 遞減。"],
            "tips": ["先判斷底數區間再決定不等號方向。"],
            "notes": ["指數函數永遠不會等於 0。"],
            "mistakes": ["解指數不等式時方向判錯。"],
        },
        {
            "id_": "s3-2-2-logarithm-core",
            "title": "對數定義與運算律",
            "chapter_code": "s3-2-2",
            "chapter_role": "核心概念",
            "difficulty": "基礎",
            "formula_lines": [("定義", r"$a^x=b\iff x=\log_a b$"), ("乘法", r"$\log_a(MN)=\log_aM+\log_aN$"), ("換底", r"$\log_a b=\frac{\log_c b}{\log_c a}$")],
            "usage": ["用在指數轉換、對數化簡與方程求解。"],
            "examples": [r"$\log_2 8=3$。"],
            "tips": ["先檢查真數與底數條件。"],
            "notes": [r"對數條件：$a>0,a\ne1,b>0$。"],
            "mistakes": ["把 $\\log(M+N)$ 誤寫成 $\\log M+\\log N$。"],
        },
        {
            "id_": "s3-2-3-log-function-graph-core",
            "title": "對數函數圖形與反函數",
            "chapter_code": "s3-2-3",
            "chapter_role": "核心概念",
            "difficulty": "中等",
            "formula_lines": [("對數函數", r"$y=\log_a x$"), ("與指數互反", r"$y=a^x$ 與 $y=\log_a x$ 對稱於 $y=x$")],
            "usage": ["用在圖形判讀、函數交點與定義域判斷。"],
            "examples": [r"$y=\log_2 x$ 經過 $(1,0),(2,1)$。"],
            "tips": ["先寫出定義域 $x>0$ 再討論圖形。"],
            "notes": ["與指數函數互為反函數。"],
            "mistakes": ["忽略對數函數的定義域限制。"],
        },
        {
            "id_": "s3-3-1-plane-vector-core",
            "title": "平面向量基本運算",
            "chapter_code": "s3-3-1",
            "chapter_role": "核心概念",
            "difficulty": "基礎",
            "formula_lines": [("向量長度", r"$|\vec a|=\sqrt{x^2+y^2}$"), ("線性組合", r"$\vec r=s\vec a+t\vec b$"), ("中點向量", r"$\overrightarrow{OM}=\frac{\overrightarrow{OA}+\overrightarrow{OB}}{2}$")],
            "usage": ["用在位移表示、平行判斷與座標幾何轉換。"],
            "examples": [r"若 $\vec a=(1,2),\vec b=(3,-1)$，則 $\vec a+\vec b=(4,1)$。"],
            "tips": ["先把幾何敘述轉成座標向量。"],
            "notes": ["向量是解析幾何與線代的橋樑。"],
            "mistakes": ["把向量長度與向量本身混淆。"],
        },
        {
            "id_": "s3-3-2-dot-product-core",
            "title": "內積、夾角與投影",
            "chapter_code": "s3-3-2",
            "chapter_role": "核心概念",
            "difficulty": "中等",
            "formula_lines": [("內積定義", r"$\vec a\cdot\vec b=|\vec a||\vec b|\cos\theta$"), ("座標式", r"$\vec a\cdot\vec b=x_1x_2+y_1y_2$"), ("垂直條件", r"$\vec a\cdot\vec b=0$")],
            "usage": ["用在垂直判斷、夾角求值與向量投影。"],
            "examples": [r"若 $\vec a=(1,2),\vec b=(2,-1)$，則 $\vec a\cdot\vec b=0$。"],
            "tips": ["判斷垂直先試內積是否為 0。"],
            "notes": ["夾角題常需搭配長度公式。"],
            "mistakes": ["把內積與外積概念混淆。"],
        },
        {
            "id_": "s3-3-3-area-determinant-core",
            "title": "二階行列式與平面面積",
            "chapter_code": "s3-3-3",
            "chapter_role": "核心概念",
            "difficulty": "中等",
            "formula_lines": [("行列式", r"$\begin{vmatrix}a&b\\c&d\end{vmatrix}=ad-bc$"), ("平行四邊形面積", r"$S=|ad-bc|$"), ("三角形面積", r"$\Delta=\frac12|ad-bc|$")],
            "usage": ["用在座標幾何面積與共線判斷。"],
            "examples": [r"兩向量 $(2,1),(3,4)$ 夾成平行四邊形面積為 $|8-3|=5$。"],
            "tips": ["注意面積要取絕對值。"],
            "notes": ["三點共線時行列式為 0。"],
            "mistakes": ["忘記對行列式結果取絕對值。"],
        },
        {
            "id_": "s3-x-integrated-checklist",
            "title": "高二上整合檢核與選式流程",
            "chapter_code": "s3-x",
            "chapter_role": "統整",
            "difficulty": "基礎",
            "formula_lines": [("流程", r"$\text{先判章節類型}\rightarrow\text{再選核心公式}\rightarrow\text{最後檢查條件}$")],
            "usage": ["跨章題先分成三角、指對、向量三類再解。"],
            "examples": ["先判斷是否需角度單位轉換，再代入公式。"],
            "tips": ["每題先寫『已知、所求、限制條件』。"],
            "notes": ["整合流程可降低公式誤用率。"],
            "mistakes": ["未判題型就直接代入常見公式。"],
        },
    ]
    return [topic_row(chapter_names=chapter_names, **seed) for seed in seeds]


def build_questions(chapter_names: Dict[str, str]) -> List[Dict]:
    seeds = [
        ("q-s3-full-001", "弧長計算（基礎01）", "s3-1-1", "基礎", r"半徑 $r=4$、圓心角 $\theta=\frac{\pi}{2}$，求弧長。", r"$2\pi$。", r"$s=r\theta=4\cdot\frac{\pi}{2}=2\pi$。", "s3-1-1-radian-arc-core"),
        ("q-s3-full-002", "扇形面積（中等01）", "s3-1-1", "中等", r"半徑 $r=3$、圓心角 $\theta=\frac{2\pi}{3}$，求扇形面積。", r"$3\pi$。", r"$A=\frac12 r^2\theta=\frac12\cdot9\cdot\frac{2\pi}{3}=3\pi$。", "s3-1-1-radian-arc-core"),
        ("q-s3-full-003", "週期判讀（基礎01）", "s3-1-2", "基礎", r"$y=\sin(2x)$ 的週期為何？", r"$\pi$。", r"$T=\frac{2\pi}{|2|}=\pi$。", "s3-1-2-trig-graph-core"),
        ("q-s3-full-004", "振幅判讀（中等01）", "s3-1-2", "中等", r"$y=-3\cos\left(x-\frac{\pi}{4}\right)+2$ 的振幅為何？", r"$3$。", r"振幅為係數絕對值 $|A|=3$。", "s3-1-2-trig-graph-core"),
        ("q-s3-full-005", "和角公式（基礎01）", "s3-1-3", "基礎", r"化簡 $\sin(45^\circ+30^\circ)$。", r"$\frac{\sqrt6+\sqrt2}{4}$。", r"套用和角公式即可。", "s3-1-3-sum-difference-core"),
        ("q-s3-full-006", "差角公式（中等01）", "s3-1-3", "中等", r"化簡 $\cos(75^\circ-45^\circ)$。", r"$\cos30^\circ=\frac{\sqrt3}{2}$。", r"先算角度差，再代入值。", "s3-1-3-sum-difference-core"),
        ("q-s3-full-007", "疊合振幅（基礎01）", "s3-1-4", "基礎", r"$3\sin x+4\cos x$ 可寫成 $R\sin(x+\varphi)$，求 $R$。", r"$5$。", r"$R=\sqrt{3^2+4^2}=5$。", "s3-1-4-sine-cosine-superposition-core"),
        ("q-s3-full-008", "最值判斷（中等01）", "s3-1-4", "中等", r"求 $3\sin x+4\cos x$ 的最大值。", r"$5$。", r"疊合後為 $5\sin(x+\varphi)$，最大值為 5。", "s3-1-4-sine-cosine-superposition-core"),
        ("q-s3-full-009", "指數單調性（基礎01）", "s3-2-1", "基礎", r"比較 $2^3$ 與 $2^4$ 大小。", r"$2^4>2^3$。", r"$a>1$ 時指數函數遞增。", "s3-2-1-exponential-function-core"),
        ("q-s3-full-010", "指數不等式（中等01）", "s3-2-1", "中等", r"解不等式 $\left(\frac12\right)^x>4$。", r"$x<-2$。", r"$\left(\frac12\right)^x=2^{-x}>2^2\Rightarrow -x>2\Rightarrow x<-2$。", "s3-2-1-exponential-function-core"),
        ("q-s3-full-011", "對數定義（基礎01）", "s3-2-2", "基礎", r"$\log_3 81$ 的值為何？", r"$4$。", r"$3^4=81$。", "s3-2-2-logarithm-core"),
        ("q-s3-full-012", "對數運算（中等01）", "s3-2-2", "中等", r"化簡 $\log_2 8+\log_2 4$。", r"$5$。", r"$3+2=5$；或先合併成 $\log_2 32$。", "s3-2-2-logarithm-core"),
        ("q-s3-full-013", "對數函數點（基礎01）", "s3-2-3", "基礎", r"$y=\log_2 x$ 是否經過 $(4,2)$？", r"是。", r"$\log_2 4=2$。", "s3-2-3-log-function-graph-core"),
        ("q-s3-full-014", "定義域判斷（中等01）", "s3-2-3", "中等", r"函數 $y=\log_5(x-1)$ 的定義域為何？", r"$x>1$。", r"真數需大於 0，故 $x-1>0$。", "s3-2-3-log-function-graph-core"),
        ("q-s3-full-015", "向量加法（基礎01）", "s3-3-1", "基礎", r"若 $\vec a=(2,-1),\vec b=(3,4)$，求 $\vec a+\vec b$。", r"$(5,3)$。", r"分量相加。", "s3-3-1-plane-vector-core"),
        ("q-s3-full-016", "向量長度（中等01）", "s3-3-1", "中等", r"求向量 $(6,8)$ 的長度。", r"$10$。", r"$\sqrt{6^2+8^2}=10$。", "s3-3-1-plane-vector-core"),
        ("q-s3-full-017", "內積計算（基礎01）", "s3-3-2", "基礎", r"若 $\vec a=(1,2),\vec b=(3,4)$，求 $\vec a\cdot\vec b$。", r"$11$。", r"$1\cdot3+2\cdot4=11$。", "s3-3-2-dot-product-core"),
        ("q-s3-full-018", "垂直判斷（中等01）", "s3-3-2", "中等", r"向量 $\vec a=(2,1),\vec b=(1,-2)$ 是否垂直？", r"是。", r"$\vec a\cdot\vec b=2\cdot1+1\cdot(-2)=0$。", "s3-3-2-dot-product-core"),
        ("q-s3-full-019", "二階行列式（基礎01）", "s3-3-3", "基礎", r"計算 $\begin{vmatrix}2&5\\1&4\end{vmatrix}$。", r"$3$。", r"$2\cdot4-5\cdot1=3$。", "s3-3-3-area-determinant-core"),
        ("q-s3-full-020", "三角形面積（中等01）", "s3-3-3", "中等", r"向量 $(4,1),(2,5)$ 張成三角形面積為何？", r"$9$。", r"平行四邊形面積 $|4\cdot5-1\cdot2|=18$，三角形取一半得 9。", "s3-3-3-area-determinant-core"),
        ("q-s3-full-021", "章節判型（基礎01）", "s3-x", "基礎", r"題目同時出現 $\sin$ 與向量內積，第一步該做什麼？", r"先分段：三角化簡與向量計算分開處理。", r"先判型可避免公式亂套。", "s3-x-integrated-checklist"),
        ("q-s3-full-022", "整合流程（中等01）", "s3-x", "中等", r"跨章題最穩定的流程是什麼？", r"先判章節類型，再選公式，最後檢查條件與單位。", r"尤其三角題要檢查角度單位，指對題要檢查定義域。", "s3-x-integrated-checklist"),
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
        backups.append(backup_file(FORMULA_DB, "pre-s3-prefix"))
        backups.append(backup_file(QUESTION_DB, "pre-s3-prefix"))

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
