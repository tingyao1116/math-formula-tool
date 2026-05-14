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
    r"C:/Users/user/OneDrive/文件/張快自製講義/codex白話講義/高中數學哈特利重點版/高三數全重點_整理/高三數全重點_易讀版.md"
)
SOURCE_REF = "高三數全重點_易讀版.md（重點整理匯入）"

S5_CODES = [
    "s5-2",
    "s5-3",
    "s5-4",
    "s5-5",
    "s5-6",
    "s5-7",
    "s5-8",
    "s5-9",
    "s5-10",
    "s5-11",
    "s5-x",
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
    "s5-2": "隨機變數",
    "s5-3": "二項分布與幾何分布",
    "s5-4": "複數的幾何意涵",
    "s5-5": "數列及其極限",
    "s5-6": "函數的概念",
    "s5-7": "函數的極限",
    "s5-8": "微分",
    "s5-9": "函數性質的判定",
    "s5-10": "積分的意義",
    "s5-11": "積分的應用",
    "s5-x": "高三補充",
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
        "grade": "高三",
        "term": "高三",
        "chapter": chapter,
        "chapterCode": chapter_code,
        "domain": "高中數學",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", chapter_code, chapter, "高三"],
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
        "grade": "高三",
        "chapter": chapter,
        "chapter_code": chapter_code,
        "difficulty": difficulty,
        "source_type": "md_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics(chapter_names: Dict[str, str]) -> List[Dict]:
    seeds = [
        {"id_": "s5-2-random-meaning", "title": "隨機變數的意義", "chapter_code": "s5-2", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("離散型", r"$X:\Omega\to\mathbb{R}$"), ("分配表", r"$\sum_i P(X=x_i)=1$")], "usage": ["先定義隨機變數才能做後續計算。"], "examples": ["擲骰子點數可視為離散隨機變數。"], "tips": ["先確認樣本空間與取值集合。"], "notes": ["隨機變數是把事件轉成數值。"], "mistakes": ["把事件本身當成隨機變數。"]},
        {"id_": "s5-2-expectation-variance", "title": "期望值、變異數與標準差", "chapter_code": "s5-2", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("期望值", r"$E(X)=\sum x_i p_i$"), ("變異數", r"$\mathrm{Var}(X)=E(X^2)-[E(X)]^2$"), ("標準差", r"$\sigma=\sqrt{\mathrm{Var}(X)}$")], "usage": ["衡量機率分配的中心與離散程度。"], "examples": [r"伯努利分配有 $E(X)=p,\ \mathrm{Var}(X)=p(1-p)$。"], "tips": ["可先算 $E(X^2)$ 再求變異數。"], "notes": ["標準差單位與原變數相同。"], "mistakes": ["把變異數和標準差數值混用。"]},
        {"id_": "s5-3-independent-events", "title": "獨立事件觀念", "chapter_code": "s5-3", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("獨立條件", r"$P(A\cap B)=P(A)P(B)$")], "usage": ["做分布題前先確認試驗是否獨立。"], "examples": ["重複擲硬幣為獨立試驗。"], "tips": ["事件互斥通常不獨立（除特例）。"], "notes": ["二項分布依賴獨立同分布試驗。"], "mistakes": ["把互斥誤判為獨立。"]},
        {"id_": "s5-3-binomial-distribution", "title": "二項分布", "chapter_code": "s5-3", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("機率質量函數", r"$P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}$"), ("期望值", r"$E(X)=np$"), ("變異數", r"$\mathrm{Var}(X)=np(1-p)$")], "usage": ["固定次數重複試驗中，計算成功次數機率。"], "examples": [r"拋硬幣 $n$ 次，正面次數服從二項分布。"], "tips": ["辨識關鍵字：固定次數、成功次數。"], "notes": ["參數為 $n,p$。"], "mistakes": ["把成功次數和首次成功次序搞混。"]},
        {"id_": "s5-3-geometric-distribution", "title": "幾何分布", "chapter_code": "s5-3", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("機率質量函數", r"$P(X=k)=(1-p)^{k-1}p$"), ("期望值", r"$E(X)=\frac{1}{p}$")], "usage": ["計算首次成功發生在第幾次試驗。"], "examples": ["重複擲骰直到出現 6 點。"], "tips": ["注意從第 1 次開始計數。"], "notes": ["具備無記憶性。"], "mistakes": ["指數寫成 $k$ 而不是 $k-1$。"]},
        {"id_": "s5-4-complex-basic", "title": "虛數定義與複數基本性質", "chapter_code": "s5-4", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("虛數單位", r"$i^2=-1$"), ("共軛", r"$\overline{a+bi}=a-bi$")], "usage": ["先建立代數運算規則。"], "examples": [r"$(a+bi)(a-bi)=a^2+b^2$。"], "tips": ["先整理實部與虛部再計算。"], "notes": ["共軛在分母有虛數時特別重要。"], "mistakes": ["把 $i^2$ 寫成 $+1$。"]},
        {"id_": "s5-4-complex-plane", "title": "複數平面與幾何對應", "chapter_code": "s5-4", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("平面對應", r"$z=a+bi\leftrightarrow(a,b)$"), ("模長", r"$|z|=\sqrt{a^2+b^2}$")], "usage": ["把複數運算轉成幾何問題。"], "examples": ["加法對應向量平移。"], "tips": ["畫阿岡圖有助於判讀。"], "notes": ["模長代表到原點距離。"], "mistakes": ["把實部與虛部座標順序寫反。"]},
        {"id_": "s5-4-polar-form", "title": "複數極式表示", "chapter_code": "s5-4", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("極式", r"$z=r(\cos\theta+i\sin\theta)$"), ("乘法", r"$r_1r_2\mathrm{cis}(\theta_1+\theta_2)$")], "usage": ["乘除與冪次運算更有效率。"], "examples": [r"$z^n=r^n(\cos n\theta+i\sin n\theta)$。"], "tips": ["角度要考慮同終邊角。"], "notes": [r"可用 $\mathrm{cis}\,\theta$ 簡寫。"], "mistakes": [r"忽略角度的 $2\pi$ 週期。"]},
        {"id_": "s5-4-de-moivre", "title": "棣美弗定理", "chapter_code": "s5-4", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("棣美弗", r"$(\cos\theta+i\sin\theta)^n=\cos n\theta+i\sin n\theta$")], "usage": ["快速求複數冪次與展開。"], "examples": [r"可推導三角倍角公式。"], "tips": ["先轉成極式再套公式。"], "notes": ["通常搭配整數次方。"], "mistakes": ["直接在直角式硬展開導致錯誤。"]},
        {"id_": "s5-4-nth-roots", "title": "複數 n 次方根", "chapter_code": "s5-4", "chapter_role": "核心概念", "difficulty": "進階", "formula_lines": [("根公式", r"$w_k=r^{1/n}\left(\cos\frac{\theta+2k\pi}{n}+i\sin\frac{\theta+2k\pi}{n}\right)$")], "usage": ["找所有複數根並判讀其幾何分布。"], "examples": [r"$n$ 個根在圓上等角分布。"], "tips": [r"$k=0,1,\ldots,n-1$ 剛好給完全部根。"], "notes": ["根常形成正多邊形頂點。"], "mistakes": ["只列出主值根漏掉其他根。"]},
        {"id_": "s5-4-fundamental-theorem", "title": "代數基本定理", "chapter_code": "s5-4", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("定理敘述", r"$n$ 次多項式在複數域有 $n$ 個根（重根計次）")], "usage": ["判斷多項式根的存在與個數。"], "examples": ["實係數多項式的非實根成共軛對。"], "tips": ["重根要計重數。"], "notes": ["複數域在代數上封閉。"], "mistakes": ["把不同重根誤當成同一個根數量。"]},
        {"id_": "s5-5-seq-limit", "title": "數列極限", "chapter_code": "s5-5", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("極限記號", r"$\lim_{n\to\infty}a_n=L$"), ("常見型", r"$\lim_{n\to\infty}\frac{an+b}{cn+d}=\frac{a}{c}$")], "usage": ["判斷收斂發散與求極限。"], "examples": [r"$\frac{2n+5}{3n-1}\to\frac23$。"], "tips": ["先抓最高次項。"], "notes": ["極限不存在常見於震盪。"], "mistakes": ["低次項處理錯導致結果偏差。"]},
        {"id_": "s5-5-infinite-series", "title": "無窮級數的和", "chapter_code": "s5-5", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("等比級數", r"$\sum_{k=0}^{\infty}ar^k=\frac{a}{1-r}\ (|r|<1)$")], "usage": ["求收斂級數和與判斷收斂條件。"], "examples": [r"$1+\frac12+\frac14+\cdots=2$。"], "tips": ["先看公比是否滿足 $|r|<1$。"], "notes": ["發散級數不可套收斂和公式。"], "mistakes": ["未檢查收斂條件就直接求和。"]},
        {"id_": "s5-5-squeeze-theorem", "title": "夾擠定理", "chapter_code": "s5-5", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("夾擠", r"$a_n\le b_n\le c_n,\ \lim a_n=\lim c_n=L\Rightarrow \lim b_n=L$")], "usage": ["處理難直接求極限的數列或函數。"], "examples": [r"$-\frac1n\le\frac{\sin n}{n}\le\frac1n$。"], "tips": ["關鍵是找到可比較上下界。"], "notes": ["上下界極限需相同。"], "mistakes": ["只找到單邊界就硬用夾擠。"]},
        {"id_": "s5-6-function-definition", "title": "函數概念與定義域", "chapter_code": "s5-6", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("組合函數", r"$(f\circ g)(x)=f(g(x))$"), ("反函數", r"$f(f^{-1}(x))=x$")], "usage": ["處理函數對應、組合與反函數。"], "examples": [r"$f(x)=3x+1\Rightarrow f^{-1}(x)=\frac{x-1}{3}$。"], "tips": ["反函數先交換變數再解。"], "notes": ["先檢查一對一條件。"], "mistakes": ["忽略組合後定義域縮小。"]},
        {"id_": "s5-6-function-graph", "title": "函數圖形與變換", "chapter_code": "s5-6", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("平移", r"$y=f(x-h)+k$"), ("伸縮", r"$y=af(bx)$")], "usage": ["由母函數快速判讀圖形。"], "examples": [r"$y=(x-2)^2+1$ 為右移 2、上移 1。"], "tips": ["先判斷水平再判斷垂直變換。"], "notes": ["水平變換方向容易搞反。"], "mistakes": ["把 $x-h$ 誤判成左移。"]},
        {"id_": "s5-7-limit-concept", "title": "函數極限概念", "chapter_code": "s5-7", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("極限", r"$\lim_{x\to a}f(x)=L$"), ("左右極限", r"$\lim_{x\to a^-}f(x),\ \lim_{x\to a^+}f(x)$")], "usage": ["判定函數在某點附近行為。"], "examples": [r"左右極限不等則整體極限不存在。"], "tips": ["先拆左右極限。"], "notes": ["極限與函數值可不同。"], "mistakes": ["把極限值直接當作函數值。"]},
        {"id_": "s5-7-continuity", "title": "連續函數判定", "chapter_code": "s5-7", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("連續條件", r"$\lim_{x\to a}f(x)=f(a)$")], "usage": ["判斷間斷點類型與可去間斷。"], "examples": [r"分母為 0 的點需特別檢查。"], "tips": ["三步檢查：有定義、有極限、兩者相等。"], "notes": ["多項式在全實數連續。"], "mistakes": ["只看函數值，不看極限。"]},
        {"id_": "s5-7-intermediate-value", "title": "介值（堪根）定理", "chapter_code": "s5-7", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("介值定理", r"$f$ 連續於 $[a,b]$ 且 $f(a)f(b)<0\Rightarrow\exists c\in(a,b),f(c)=0$")], "usage": ["證明方程在區間內有根。"], "examples": [r"若 $f(1)<0,f(2)>0$，則 $(1,2)$ 內至少一根。"], "tips": ["先檢查連續，再檢查端點異號。"], "notes": ["只能保證存在，不保證唯一。"], "mistakes": ["未確認連續就直接套定理。"]},
        {"id_": "s5-8-derivative-tangent", "title": "導數與切線", "chapter_code": "s5-8", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("導數定義", r"$f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}$"), ("切線式", r"$y-f(a)=f'(a)(x-a)$")], "usage": ["求切線方程與瞬時變化率。"], "examples": [r"$f(x)=x^2$ 在 $x=1$ 切線為 $y=2x-1$。"], "tips": ["先求導數再代點。"], "notes": ["切線斜率就是導數值。"], "mistakes": ["把切點座標代錯。"]},
        {"id_": "s5-8-derivative-rules", "title": "導函數運算規則", "chapter_code": "s5-8", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("和差法則", r"$(f\pm g)'=f'\pm g'$"), ("乘法法則", r"$(fg)'=f'g+fg'$"), ("商法則", r"$(\frac{f}{g})'=\frac{f'g-fg'}{g^2}$")], "usage": ["快速微分多項式、分式、乘積函數。"], "examples": [r"$\frac{d}{dx}(x^2\sin x)=2x\sin x+x^2\cos x$。"], "tips": ["先辨識是哪種組合再套法則。"], "notes": ["商法則分母不可為 0。"], "mistakes": ["乘法法則漏一項。"]},
        {"id_": "s5-8-chain-rule", "title": "合成函數導數（鏈鎖律）", "chapter_code": "s5-8", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("鏈鎖律", r"$(f(g(x)))'=f'(g(x))g'(x)$")], "usage": ["處理巢狀函數微分。"], "examples": [r"$\frac{d}{dx}(3x-1)^7=21(3x-1)^6$。"], "tips": ["外層微分後一定乘內層導數。"], "notes": ["與乘法法則常同時出現。"], "mistakes": ["忘記乘內函數導數。"]},
        {"id_": "s5-9-monotonicity", "title": "遞增遞減判定", "chapter_code": "s5-9", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("判定", r"$f'(x)>0$ 遞增，$f'(x)<0$ 遞減")], "usage": ["分析函數走勢與區間。"], "examples": [r"先找臨界點分區間檢查符號。"], "tips": ["用符號表最不易漏區間。"], "notes": ["端點需回原題判斷。"], "mistakes": ["只看單點不看整個區間。"]},
        {"id_": "s5-9-extrema-first-derivative", "title": "極值與一階檢定法", "chapter_code": "s5-9", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("候選點", r"$f'(x)=0$ 或不存在"), ("一階檢定", r"$f'$ 由正轉負為極大，由負轉正為極小")], "usage": ["判斷局部極值點。"], "examples": [r"$f'(x)=x(x-2)$ 在 $x=0,2$ 需判符號變化。"], "tips": ["候選點找完一定做符號變化。"], "notes": ["候選點不一定是極值。"], "mistakes": ["只解到臨界點就停。"]},
        {"id_": "s5-9-concavity-inflection", "title": "凹向與反曲點", "chapter_code": "s5-9", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("凹凸", r"$f''(x)>0$ 向上凹，$f''(x)<0$ 向下凹"), ("反曲點", r"$f''$ 變號點")], "usage": ["精細描述圖形彎曲方向。"], "examples": [r"$f(x)=x^3$ 在 $x=0$ 有反曲點。"], "tips": ["反曲點必須檢查變號，不是只看 $f''=0$。"], "notes": ["可與一階分析搭配畫圖。"], "mistakes": ["把二階導數為 0 直接當反曲點。"]},
        {"id_": "s5-9-cubic-sketch", "title": "三次函數圖形描繪", "chapter_code": "s5-9", "chapter_role": "核心概念", "difficulty": "進階", "formula_lines": [("流程", r"$f\rightarrow f'\rightarrow f''\rightarrow\text{綜合圖形}$")], "usage": ["整合單調、極值、凹凸來畫圖。"], "examples": ["先找截距，再補臨界點與反曲點。"], "tips": ["圖形草稿先標關鍵點再連線。"], "notes": ["三次函數端行為由最高次項決定。"], "mistakes": ["忽略端行為導致整體方向錯誤。"]},
        {"id_": "s5-10-area-concept", "title": "面積概念與黎曼和", "chapter_code": "s5-10", "chapter_role": "核心概念", "difficulty": "基礎", "formula_lines": [("黎曼和", r"$\sum f(x_i^*)\Delta x$"), ("極限", r"$\int_a^b f(x)\,dx=\lim_{\max\Delta x\to0}\sum f(x_i^*)\Delta x$")], "usage": ["理解定積分作為面積極限。"], "examples": ["矩形近似越細，面積越精確。"], "tips": ["先理解幾何意義再背公式。"], "notes": ["定積分值可正可負。"], "mistakes": ["把定積分永遠當成正面積。"]},
        {"id_": "s5-10-definite-integral-definition", "title": "定積分定義與基本定理", "chapter_code": "s5-10", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("牛頓萊布尼茲", r"$\int_a^b f(x)\,dx=F(b)-F(a)$"), ("不定積分", r"$\int f(x)\,dx=F(x)+C$")], "usage": ["快速計算定積分與不定積分。"], "examples": [r"$\int_0^1 2x\,dx=1$。"], "tips": ["定積分先找原函數再代上下限。"], "notes": ["不定積分要加常數項。"], "mistakes": ["把定積分也加上 $C$。"]},
        {"id_": "s5-10-definite-integral-properties", "title": "定積分性質", "chapter_code": "s5-10", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("可加性", r"$\int_a^b f+\int_b^c f=\int_a^c f$"), ("交換上下限", r"$\int_a^b f(x)\,dx=-\int_b^a f(x)\,dx$")], "usage": ["拆區間與轉換積分方向。"], "examples": ["對稱區間奇偶性可簡化計算。"], "tips": ["先看區間是否可拆、是否對稱。"], "notes": ["性質題常用在計算技巧。"], "mistakes": ["上下限交換時漏掉負號。"]},
        {"id_": "s5-11-area-between-curves", "title": "兩曲線夾區域面積", "chapter_code": "s5-11", "chapter_role": "核心概念", "difficulty": "中等", "formula_lines": [("面積公式", r"$A=\int_a^b[\text{上}-\text{下}]\,dx$")], "usage": ["計算兩函數間包圍面積。"], "examples": ["先解交點作為積分上下限。"], "tips": ["先畫圖判斷上下函數。"], "notes": ["必要時分段積分。"], "mistakes": ["把上下函數順序寫反。"]},
        {"id_": "s5-11-solid-volume", "title": "立體體積（旋轉體）", "chapter_code": "s5-11", "chapter_role": "核心概念", "difficulty": "進階", "formula_lines": [("圓盤法", r"$V=\pi\int_a^b [R(x)]^2\,dx$"), ("環形法", r"$V=\pi\int_a^b ([R(x)]^2-[r(x)]^2)\,dx$")], "usage": ["求繞軸旋轉後的立體體積。"], "examples": [r"$y=x$ 在 $[0,1]$ 繞 $x$ 軸旋轉體積為 $\pi/3$。"], "tips": ["先釐清外半徑與內半徑。"], "notes": ["單位是立方單位。"], "mistakes": ["半徑函數設錯導致整題錯。"]},
        {"id_": "s5-11-physics-application", "title": "定積分在物理上的應用", "chapter_code": "s5-11", "chapter_role": "核心概念", "difficulty": "進階", "formula_lines": [("位移", r"$s=\int v(t)\,dt$"), ("作功", r"$W=\int_a^b F(x)\,dx$")], "usage": ["速度、力學等連續變化量計算。"], "examples": ["速度函數積分可得位移。"], "tips": ["先確認自變數與單位一致。"], "notes": ["物理題重視單位檢查。"], "mistakes": ["變數與積分區間對錯。"]},
        {"id_": "s5-x-integrated-checklist", "title": "高三整合檢核與解題流程", "chapter_code": "s5-x", "chapter_role": "統整", "difficulty": "基礎", "formula_lines": [("流程", r"$\text{判章節}\rightarrow\text{選模型}\rightarrow\text{代入計算}\rightarrow\text{檢查條件}$")], "usage": ["高三新舊單元混合題的穩定流程。"], "examples": ["先分機率、複數、微積分三類。"], "tips": ["先寫已知條件與目標。"], "notes": ["流程化可降低錯誤率。"], "mistakes": ["未判題型就直接代公式。"]},
    ]
    return [topic_row(chapter_names=chapter_names, **seed) for seed in seeds]


def build_questions(chapter_names: Dict[str, str]) -> List[Dict]:
    seeds = [
        ("q-s5-full-001", "隨機變數判讀（基礎01）", "s5-2", "基礎", "下列何者可作為離散隨機變數？", "擲骰子點數。", "點數是樣本空間到實數的對應。", "s5-2-random-meaning"),
        ("q-s5-full-002", "期望值計算（中等01）", "s5-2", "中等", r"若 $P(X=1)=0.3,P(X=3)=0.7$，求 $E(X)$。", r"$2.4$。", r"$E(X)=1\cdot0.3+3\cdot0.7=2.4$。", "s5-2-expectation-variance"),
        ("q-s5-full-003", "獨立事件判斷（基礎01）", "s5-3", "基礎", r"若 $P(A)=0.5,P(B)=0.4,P(A\cap B)=0.2$，是否獨立？", "是。", r"$P(A)P(B)=0.2$，符合獨立定義。", "s5-3-independent-events"),
        ("q-s5-full-004", "二項分布機率（中等01）", "s5-3", "中等", r"拋硬幣 5 次，恰有 2 次正面機率？", r"$\binom52(\frac12)^5=\frac{5}{16}$。", "代入二項分布公式。", "s5-3-binomial-distribution"),
        ("q-s5-full-005", "幾何分布機率（中等02）", "s5-3", "中等", r"成功率 $p=0.25$，第 4 次才首次成功機率？", r"$(0.75)^3\cdot0.25$。", r"套用 $P(X=k)=(1-p)^{k-1}p$。", "s5-3-geometric-distribution"),
        ("q-s5-full-006", "虛數運算（基礎01）", "s5-4", "基礎", r"化簡 $i^{10}$。", r"$-1$。", r"$i^4=1$，故 $i^{10}=i^8i^2=-1$。", "s5-4-complex-basic"),
        ("q-s5-full-007", "複數平面座標（基礎02）", "s5-4", "基礎", r"複數 $-2+3i$ 對應平面點為何？", r"$(-2,3)$。", "實部為 $x$，虛部為 $y$。", "s5-4-complex-plane"),
        ("q-s5-full-008", "極式轉換（中等01）", "s5-4", "中等", r"若 $z=1+i$，其模長 $r$ 為何？", r"$\sqrt2$。", r"$r=\sqrt{1^2+1^2}=\sqrt2$。", "s5-4-polar-form"),
        ("q-s5-full-009", "棣美弗套用（中等02）", "s5-4", "中等", r"$(\cos\theta+i\sin\theta)^3$ 可化為？", r"$\cos3\theta+i\sin3\theta$。", "直接套棣美弗定理。", "s5-4-de-moivre"),
        ("q-s5-full-010", "n 次方根個數（進階01）", "s5-4", "進階", r"方程 $z^5=1$ 有幾個不同複數根？", r"$5$ 個。", "五次方根在單位圓上等角分布 5 點。", "s5-4-nth-roots"),
        ("q-s5-full-011", "代數基本定理（基礎03）", "s5-4", "基礎", "三次多項式在複數域有幾個根（含重根）？", "3 個。", "依代數基本定理，次數即根數（計重數）。", "s5-4-fundamental-theorem"),
        ("q-s5-full-012", "數列極限（基礎01）", "s5-5", "基礎", r"求 $\lim_{n\to\infty}\frac{4n-1}{2n+3}$。", r"$2$。", "同除以 $n$，取最高次係數比。", "s5-5-seq-limit"),
        ("q-s5-full-013", "無窮級數和（中等01）", "s5-5", "中等", r"求 $\sum_{k=0}^{\infty}(\frac13)^k$。", r"$\frac{3}{2}$。", r"$a=1,r=\frac13$，故和為 $\frac{1}{1-\frac13}$。", "s5-5-infinite-series"),
        ("q-s5-full-014", "夾擠定理（中等02）", "s5-5", "中等", r"已知 $-\frac1n\le b_n\le\frac1n$，求 $\lim b_n$。", r"$0$。", "上下界都趨近 0，故中間也趨近 0。", "s5-5-squeeze-theorem"),
        ("q-s5-full-015", "反函數求法（基礎01）", "s5-6", "基礎", r"若 $f(x)=2x+5$，求 $f^{-1}(x)$。", r"$\frac{x-5}{2}$。", "交換變數後解 $x$。", "s5-6-function-definition"),
        ("q-s5-full-016", "圖形平移（基礎02）", "s5-6", "基礎", r"$y=f(x-3)+2$ 相較 $y=f(x)$ 如何平移？", "右移 3、上移 2。", "由平移規則直接判讀。", "s5-6-function-graph"),
        ("q-s5-full-017", "左右極限（基礎01）", "s5-7", "基礎", r"若左極限 1、右極限 2，則整體極限為何？", "不存在。", "左右極限不同。", "s5-7-limit-concept"),
        ("q-s5-full-018", "連續判定（中等01）", "s5-7", "中等", r"函數在 $x=a$ 連續需滿足哪三件事？", "有定義、有極限、且極限等於函數值。", "連續三條件缺一不可。", "s5-7-continuity"),
        ("q-s5-full-019", "介值定理（中等02）", "s5-7", "中等", r"若 $f$ 連續於 $[1,2]$ 且 $f(1)f(2)<0$，可推得？", "在 $(1,2)$ 至少有一根。", "依介值（堪根）定理。", "s5-7-intermediate-value"),
        ("q-s5-full-020", "切線方程（基礎01）", "s5-8", "基礎", r"$f(x)=x^2$ 在 $x=1$ 的切線方程？", r"$y=2x-1$。", r"$f'(x)=2x,f'(1)=2$，再代點 $(1,1)$。", "s5-8-derivative-tangent"),
        ("q-s5-full-021", "乘法法則（中等01）", "s5-8", "中等", r"求 $\frac{d}{dx}(x^2\sin x)$。", r"$2x\sin x+x^2\cos x$。", "套乘法法則。", "s5-8-derivative-rules"),
        ("q-s5-full-022", "鏈鎖律（中等02）", "s5-8", "中等", r"求 $\frac{d}{dx}(3x-1)^4$。", r"$12(3x-1)^3$。", r"$4(3x-1)^3\cdot3$。", "s5-8-chain-rule"),
        ("q-s5-full-023", "單調性（基礎01）", "s5-9", "基礎", r"若 $f'(x)=x-2$，何處遞減？", r"$x<2$。", r"$f'(x)<0$ 時遞減。", "s5-9-monotonicity"),
        ("q-s5-full-024", "一階檢定（中等01）", "s5-9", "中等", r"$f'(x)$ 由正轉負代表什麼？", "局部極大值點。", "一階檢定法。", "s5-9-extrema-first-derivative"),
        ("q-s5-full-025", "反曲點判斷（中等02）", "s5-9", "中等", r"$f''(x)$ 在某點前後變號可推得？", "該點為反曲點。", "反曲點需二階導數變號。", "s5-9-concavity-inflection"),
        ("q-s5-full-026", "三次函數描圖（進階01）", "s5-9", "進階", "描圖前最少要掌握哪三類資訊？", "截距、臨界點、凹凸與反曲點。", "三次函數描圖需整合一二階導數資訊。", "s5-9-cubic-sketch"),
        ("q-s5-full-027", "黎曼和概念（基礎01）", "s5-10", "基礎", "定積分最核心的幾何意義是？", "面積的極限。", "由分割區間與矩形和取極限得到。", "s5-10-area-concept"),
        ("q-s5-full-028", "定積分計算（中等01）", "s5-10", "中等", r"求 $\int_0^1 (2x+1)\,dx$。", r"$2$。", r"$[x^2+x]_0^1=2$。", "s5-10-definite-integral-definition"),
        ("q-s5-full-029", "定積分性質（中等02）", "s5-10", "中等", r"$\int_2^5 f(x)\,dx+\int_5^8 f(x)\,dx=$？", r"$\int_2^8 f(x)\,dx$。", "套可加性。", "s5-10-definite-integral-properties"),
        ("q-s5-full-030", "兩曲線面積（中等01）", "s5-11", "中等", "兩曲線夾面積解題第一步是什麼？", "先求交點決定積分區間。", "區間錯誤會使整題失敗。", "s5-11-area-between-curves"),
        ("q-s5-full-031", "旋轉體體積（進階01）", "s5-11", "進階", r"$y=x$ 在 $[0,1]$ 繞 $x$ 軸旋轉體積？", r"$\frac{\pi}{3}$。", r"$V=\pi\int_0^1 x^2\,dx=\frac{\pi}{3}$。", "s5-11-solid-volume"),
        ("q-s5-full-032", "物理積分（進階02）", "s5-11", "進階", "速度函數積分可得到什麼量？", "位移。", "位移是速度對時間的積分。", "s5-11-physics-application"),
        ("q-s5-full-033", "整合判型（基礎01）", "s5-x", "基礎", "高三綜合題第一步該做什麼？", "先判章節與題型。", "先判型再選公式可以避免亂套。", "s5-x-integrated-checklist"),
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
        backups.append(backup_file(FORMULA_DB, "pre-s5-prefix"))
        backups.append(backup_file(QUESTION_DB, "pre-s5-prefix"))

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
