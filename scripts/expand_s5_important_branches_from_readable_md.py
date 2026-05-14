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
BACKUP_DIR = ROOT / "backups"
SOURCE_REF = "高三數全重點_易讀版.md（重要分支擴展）"

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


def build_branch(parent: Dict, branch: Dict) -> Dict:
    pid = parent["id"]
    bid = f"{pid}-branch-{branch['suffix']}"
    role = branch.get("role", "教學補充")
    parent_tags = parent.get("tags", [])
    if not isinstance(parent_tags, list):
        parent_tags = []
    return {
        "id": bid,
        "title": f"{parent.get('title', '')}：{branch['title']}",
        "formula": make_formula(branch.get("formula_lines", [])),
        "stage": parent.get("stage", "高中"),
        "grade": parent.get("grade", "高三"),
        "term": parent.get("term", "高三"),
        "chapter": parent.get("chapter", ""),
        "chapterCode": parent.get("chapterCode", ""),
        "domain": parent.get("domain", "高中數學"),
        "difficulty": branch.get("difficulty", parent.get("difficulty", "中等")),
        "chapterRole": role,
        "parentId": pid,
        "tags": list(dict.fromkeys(parent_tags + ["分支細節", role, f"parent:{pid}"])),
        "usage": branch.get("usage", ["針對母主題補強關鍵解題節點。"]),
        "examples": branch.get("examples", ["以母主題典型情境做強化練習。"]),
        "tips": branch.get("tips", ["先判條件，再套公式，最後檢查合理性。"]),
        "notes": branch.get("notes", []) + [f"來源：{SOURCE_REF}"],
        "mistakes": branch.get("mistakes", ["未判條件就直接代公式。"]),
        "contentTypes": parent.get("contentTypes", ["教學核心", "公式重點", "常見題型", "易錯陷阱"]),
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": now_iso(),
    }


def build_branches(parent_map: Dict[str, Dict]) -> Tuple[List[Dict], int]:
    plan = {
        "s5-2-random-meaning": [
            {"suffix": "distribution-validity", "title": "分配表合法性檢查", "role": "公式與性質", "difficulty": "基礎", "formula_lines": [("必要條件", r"$0\le P(X=x_i)\le1,\ \sum_i P(X=x_i)=1$")], "usage": ["先檢查分配表合法，再做期望與變異數計算。"], "examples": [r"若機率和不為 1，該分配不可用。"], "tips": ["先驗證分配，再代公式。"], "mistakes": ["直接計算期望值卻未檢查機率和。"]},
        ],
        "s5-2-expectation-variance": [
            {"suffix": "linearity", "title": "期望值線性性質", "role": "公式與性質", "difficulty": "中等", "formula_lines": [("線性", r"$E(aX+b)=aE(X)+b$")], "usage": ["快速計算線性轉換後的期望值。"], "examples": [r"$E(2X-3)=2E(X)-3$。"], "tips": ["遇到線性轉換先用性質，不必重建分配表。"], "mistakes": ["把變異數也當成線性。"]},
            {"suffix": "variance-transform", "title": "變異數轉換規則", "role": "公式與性質", "difficulty": "中等", "formula_lines": [("縮放平移", r"$\mathrm{Var}(aX+b)=a^2\mathrm{Var}(X)$")], "usage": ["比較不同尺度資料時快速換算變異數。"], "examples": [r"$\mathrm{Var}(3X+1)=9\mathrm{Var}(X)$。"], "tips": ["平移不改變變異數。"], "mistakes": ["把平移項也平方進去。"]},
        ],
        "s5-3-independent-events": [
            {"suffix": "independent-vs-mutual", "title": "獨立與互斥的差異", "role": "易錯陷阱", "difficulty": "基礎", "formula_lines": [("獨立", r"$P(A\cap B)=P(A)P(B)$"), ("互斥", r"$P(A\cap B)=0$")], "usage": ["避免機率題最常見觀念混淆。"], "examples": ["兩事件互斥且機率皆非 0 時，不會獨立。"], "tips": ["先看交集，再看乘積。"], "mistakes": ["看到互斥就判獨立。"]},
        ],
        "s5-3-binomial-distribution": [
            {"suffix": "model-check", "title": "二項模型四條件", "role": "典型題型", "difficulty": "中等", "formula_lines": [("條件", r"$n\ \text{固定、獨立、兩結果、成功率固定}$")], "usage": ["先判斷是否可套二項分布。"], "examples": ["抽樣若不放回且比例大，未必可視為獨立。"], "tips": ["題幹先檢查四條件。"], "mistakes": ["條件不符仍硬套二項公式。"]},
        ],
        "s5-3-geometric-distribution": [
            {"suffix": "memoryless", "title": "無記憶性", "role": "公式與性質", "difficulty": "中等", "formula_lines": [("性質", r"$P(X>m+n\mid X>m)=P(X>n)$")], "usage": ["處理等待型機率題的條件機率。"], "examples": [r"已失敗 3 次後，後續等待分布不變。"], "tips": ["先寫成『超過次數』形式再代性質。"], "mistakes": ["把二項分布也當成無記憶。"]},
        ],
        "s5-4-complex-basic": [
            {"suffix": "conjugate-rationalize", "title": "共軛有理化", "role": "典型題型", "difficulty": "基礎", "formula_lines": [("有理化", r"$\frac{1}{a+bi}=\frac{a-bi}{a^2+b^2}$")], "usage": ["複數分式化簡成標準型。"], "examples": [r"$\frac1{1+i}=\frac{1-i}{2}$。"], "tips": ["分母乘共軛。"], "mistakes": ["分子分母未同乘共軛。"]},
        ],
        "s5-4-complex-plane": [
            {"suffix": "distance-geometry", "title": "模長與距離幾何", "role": "典型題型", "difficulty": "基礎", "formula_lines": [("距離", r"$|z-z_0|=r$")], "usage": ["將複數條件轉成圓或直線幾何圖形。"], "examples": [r"$|z-1|=2$ 對應圓心 $(1,0)$ 半徑 2。"], "tips": ["先改寫成 $|z-z_0|$ 形式。"], "mistakes": ["把模長方程看成一次方程。"]},
        ],
        "s5-4-polar-form": [
            {"suffix": "mul-div-angle", "title": "乘除法角度規則", "role": "公式與性質", "difficulty": "中等", "formula_lines": [("乘法", r"$r_1\mathrm{cis}\theta_1\cdot r_2\mathrm{cis}\theta_2=(r_1r_2)\mathrm{cis}(\theta_1+\theta_2)$"), ("除法", r"$\frac{r_1\mathrm{cis}\theta_1}{r_2\mathrm{cis}\theta_2}=\frac{r_1}{r_2}\mathrm{cis}(\theta_1-\theta_2)$")]},
        ],
        "s5-4-de-moivre": [
            {"suffix": "trig-identity-derive", "title": "由棣美弗推導倍角", "role": "教學補充", "difficulty": "中等", "formula_lines": [("示例", r"$(\cos\theta+i\sin\theta)^2=\cos2\theta+i\sin2\theta$")], "usage": ["用代數方式理解三角恆等式來源。"], "examples": [r"比較實虛部可得二倍角公式。"], "tips": ["先展開再比係數。"], "mistakes": ["實部虛部對應錯誤。"]},
        ],
        "s5-4-nth-roots": [
            {"suffix": "equal-angle-distribution", "title": "根的等角分布", "role": "公式與性質", "difficulty": "進階", "formula_lines": [("角度差", r"$\Delta\theta=\frac{2\pi}{n}$")], "usage": ["快速判斷根在複數平面的位置。"], "examples": [r"$z^6=1$ 的六根形成正六邊形。"], "tips": ["先找主值，再均分角度。"], "mistakes": ["只算主值根。"]},
        ],
        "s5-4-fundamental-theorem": [
            {"suffix": "conjugate-pair", "title": "實係數多項式共軛根", "role": "公式與性質", "difficulty": "中等", "formula_lines": [("性質", r"$a+bi\ \text{為根}\Rightarrow a-bi\ \text{亦為根}$")], "usage": ["配對找根與構造多項式。"], "examples": [r"若有根 $2+i$，則 $2-i$ 也必是根。"], "tips": ["看到實係數先想共軛成對。"], "mistakes": ["只列一個複根。"]},
        ],
        "s5-5-seq-limit": [
            {"suffix": "recursive-limit", "title": "遞推數列極限求法", "role": "典型題型", "difficulty": "中等", "formula_lines": [("不動點法", r"$a_{n+1}=f(a_n),\ a_n\to L\Rightarrow L=f(L)$")], "usage": ["常見於遞推收斂題。"], "examples": [r"$a_{n+1}=\frac{a_n+3}{2}\Rightarrow L=3$。"], "tips": ["先驗證收斂條件再解不動點。"], "mistakes": ["未證收斂直接求 $L$。"]},
        ],
        "s5-5-infinite-series": [
            {"suffix": "convergence-check", "title": "收斂條件先檢查", "role": "易錯陷阱", "difficulty": "中等", "formula_lines": [("必要條件", r"$|r|<1$ 才能套等比無窮和")], "usage": ["避免對發散級數誤求和。"], "examples": [r"$1+2+4+\cdots$ 發散，不可套公式。"], "tips": ["先看公比大小。"], "mistakes": ["忽略收斂條件直接代入。"]},
        ],
        "s5-5-squeeze-theorem": [
            {"suffix": "bound-construction", "title": "上下界構造技巧", "role": "典型題型", "difficulty": "中等", "formula_lines": [("常用夾擠", r"$-1\le\sin t\le1$")], "usage": ["找不到直接極限時用基礎不等式夾擠。"], "examples": [r"將 $\frac{\sin n}{n}$ 夾在 $\pm\frac1n$ 之間。"], "tips": ["把難項拆成『有界×趨零』。"], "mistakes": ["上下界極限不一致。"]},
        ],
        "s5-6-function-definition": [
            {"suffix": "domain-priority", "title": "定義域優先檢查", "role": "易錯陷阱", "difficulty": "基礎", "formula_lines": [("根式條件", r"$\sqrt{g(x)}\Rightarrow g(x)\ge0$"), ("對數條件", r"$\log g(x)\Rightarrow g(x)>0$")], "usage": ["組合函數題先確認可代入範圍。"], "examples": [r"$f(g(x))$ 需同時滿足 $x\in D_g$ 且 $g(x)\in D_f$。"], "tips": ["先做定義域，再做代數化簡。"], "mistakes": ["化簡後才回頭補條件。"]},
        ],
        "s5-6-function-graph": [
            {"suffix": "transform-order", "title": "圖形變換順序", "role": "教學補充", "difficulty": "基礎", "formula_lines": [("順序", r"$x\ \text{方向變換先讀括號，}y\ \text{方向後讀外係數}$")], "usage": ["避免平移與伸縮方向錯誤。"], "examples": [r"$y=2f(x-1)+3$：右移 1、縱向放大 2、上移 3。"], "tips": ["先內後外。"], "mistakes": ["把水平變換方向看反。"]},
        ],
        "s5-7-limit-concept": [
            {"suffix": "left-right-split", "title": "左右極限拆解法", "role": "典型題型", "difficulty": "基礎", "formula_lines": [("判定", r"$\lim_{x\to a}f(x)\ \text{存在}\iff \lim_{x\to a^-}f(x)=\lim_{x\to a^+}f(x)$")], "usage": ["分段函數極限必做左右拆解。"], "examples": [r"斷點處先算兩側再整合。"], "tips": ["先列左右值，再判是否相等。"], "mistakes": ["直接帶入斷點。"]},
        ],
        "s5-7-continuity": [
            {"suffix": "removable-discontinuity", "title": "可去間斷修補", "role": "典型題型", "difficulty": "中等", "formula_lines": [("修補原理", r"$f(a)\ \text{改為}\ \lim_{x\to a}f(x)\Rightarrow \text{連續}$")], "usage": ["求使函數連續的參數。"], "examples": [r"先求極限，再令函數值等於該極限。"], "tips": ["連續題多半在斷點補值。"], "mistakes": ["只讓左右極限相等，忘記函數值。"]},
        ],
        "s5-7-intermediate-value": [
            {"suffix": "existence-proof-template", "title": "存在性證明模板", "role": "典型題型", "difficulty": "中等", "formula_lines": [("模板", r"$\text{連續}+f(a)f(b)<0\Rightarrow\exists c,\ f(c)=0$")], "usage": ["標準化根存在證明書寫。"], "examples": [r"先寫連續性，再寫異號，最後下結論。"], "tips": ["順序不可省略。"], "mistakes": ["漏寫連續條件。"]},
        ],
        "s5-8-derivative-tangent": [
            {"suffix": "normal-line", "title": "法線方程", "role": "教學補充", "difficulty": "中等", "formula_lines": [("法線斜率", r"$m_n=-\frac{1}{f'(a)}$（$f'(a)\ne0$）")], "usage": ["切線題常延伸到法線題。"], "examples": [r"先求切線斜率，再取負倒數。"], "tips": ["切線水平時法線垂直。"], "mistakes": ["法線斜率未取負倒數。"]},
        ],
        "s5-8-derivative-rules": [
            {"suffix": "quotient-sign-trap", "title": "商法則符號陷阱", "role": "易錯陷阱", "difficulty": "中等", "formula_lines": [("商法則", r"$(\frac{f}{g})'=\frac{f'g-fg'}{g^2}$")], "usage": ["避免商法則前後順序寫錯。"], "examples": [r"分子是 $f'g-fg'$ 不是反過來。"], "tips": ["口訣：上微下不動減上不動下微。"], "mistakes": ["把減號寫成加號。"]},
        ],
        "s5-8-chain-rule": [
            {"suffix": "nested-composition", "title": "多層鏈鎖律", "role": "典型題型", "difficulty": "中等", "formula_lines": [("多層", r"$\frac{d}{dx}f(g(h(x)))=f'(g(h(x)))g'(h(x))h'(x)$")], "usage": ["處理三層以上合成函數。"], "examples": [r"先最外層，再逐層往內乘。"], "tips": ["分層標記可避免漏乘。"], "mistakes": ["中間層導數遺漏。"]},
        ],
        "s5-9-monotonicity": [
            {"suffix": "sign-chart-method", "title": "符號表法", "role": "典型題型", "difficulty": "基礎", "formula_lines": [("流程", r"$f'(x)=0\Rightarrow\text{分區間}\Rightarrow\text{判符號}$")], "usage": ["系統判定遞增遞減區間。"], "examples": ["臨界點通常作為分段邊界。"], "tips": ["每區間任取一點檢符號。"], "mistakes": ["漏掉某個區間。"]},
        ],
        "s5-9-extrema-first-derivative": [
            {"suffix": "endpoint-check", "title": "端點與邊界檢查", "role": "易錯陷阱", "difficulty": "中等", "formula_lines": [("最大最小", r"$\text{閉區間最值需比較端點與臨界點}$")], "usage": ["最值題避免只看內點。"], "examples": [r"區間 $[a,b]$ 要比較 $f(a),f(b)$。"], "tips": ["極值與最值要分清楚。"], "mistakes": ["忽略端點導致答案錯誤。"]},
        ],
        "s5-9-concavity-inflection": [
            {"suffix": "second-derivative-test", "title": "二階導數檢定", "role": "公式與性質", "difficulty": "中等", "formula_lines": [("二階檢定", r"$f'(c)=0,\ f''(c)>0\Rightarrow\text{局部極小};\ f''(c)<0\Rightarrow\text{局部極大}$")], "usage": ["在一階檢定外提供快速判定。"], "examples": [r"當 $f''(c)=0$ 時需回到一階檢定。"], "tips": ["二階檢定失效時不要硬判。"], "mistakes": ["$f''=0$ 直接下結論。"]},
        ],
        "s5-9-cubic-sketch": [
            {"suffix": "sketch-checklist", "title": "描圖檢核清單", "role": "教學補充", "difficulty": "進階", "formula_lines": [("檢核", r"$\text{截距、臨界點、反曲點、端行為}$")], "usage": ["快速自查三次函數圖形完整度。"], "examples": ["先標關鍵點再連線。"], "tips": ["最後回代幾個點驗證方向。"], "mistakes": ["只畫局部、不看端行為。"]},
        ],
        "s5-10-area-concept": [
            {"suffix": "signed-area", "title": "定積分與有號面積", "role": "公式與性質", "difficulty": "基礎", "formula_lines": [("有號面積", r"$\int_a^b f(x)\,dx=\text{上方面積}-\text{下方面積}$")], "usage": ["解釋為何定積分值可能為負。"], "examples": [r"若曲線主要在 $x$ 軸下方，積分值可能為負。"], "tips": ["面積題通常取絕對值或分段。"], "mistakes": ["把定積分永遠視為正值。"]},
        ],
        "s5-10-definite-integral-definition": [
            {"suffix": "ftc-application", "title": "基本定理套用步驟", "role": "典型題型", "difficulty": "中等", "formula_lines": [("步驟", r"$\int_a^b f(x)\,dx\Rightarrow\text{找原函數 }F\Rightarrow F(b)-F(a)$")], "usage": ["標準化定積分計算流程。"], "examples": [r"$\int_1^3 2x\,dx=[x^2]_1^3=8$。"], "tips": ["先做不定積分，再代上下限。"], "mistakes": ["上下限代值順序顛倒。"]},
        ],
        "s5-10-definite-integral-properties": [
            {"suffix": "symmetry", "title": "對稱性技巧", "role": "典型題型", "difficulty": "中等", "formula_lines": [("奇偶性", r"$f\ \text{奇}\Rightarrow\int_{-a}^{a}f(x)\,dx=0,\quad f\ \text{偶}\Rightarrow\int_{-a}^{a}f(x)\,dx=2\int_0^a f(x)\,dx$")]},
        ],
        "s5-11-area-between-curves": [
            {"suffix": "split-interval", "title": "分段積分策略", "role": "典型題型", "difficulty": "中等", "formula_lines": [("分段", r"$A=\sum \int (\text{上}-\text{下})$")], "usage": ["上下函數交換時必須分段。"], "examples": [r"交點把區間切成多段再積分。"], "tips": ["每段重新判定上函數。"], "mistakes": ["整段用同一個上下順序。"]},
        ],
        "s5-11-solid-volume": [
            {"suffix": "disk-vs-washer", "title": "圓盤法與環形法選擇", "role": "典型題型", "difficulty": "進階", "formula_lines": [("圓盤", r"$V=\pi\int R^2$"), ("環形", r"$V=\pi\int (R^2-r^2)$")], "usage": ["判斷是否有內孔。"], "examples": ["繞軸後若中空，必用環形法。"], "tips": ["先畫橫截面再選公式。"], "mistakes": ["有內半徑卻用圓盤法。"]},
        ],
        "s5-11-physics-application": [
            {"suffix": "unit-check", "title": "物理量單位檢查", "role": "易錯陷阱", "difficulty": "進階", "formula_lines": [("位移", r"$\int v(t)\,dt$"), ("作功", r"$\int F(x)\,dx$")], "usage": ["避免物理積分題單位錯誤。"], "examples": ["速度（m/s）對時間積分得到 m。"], "tips": ["寫出每一步單位。"], "mistakes": ["變數與單位不一致。"]},
        ],
        "s5-x-integrated-checklist": [
            {"suffix": "decision-tree", "title": "跨章選式決策樹", "role": "教學補充", "difficulty": "基礎", "formula_lines": [("路徑", r"$\text{機率}\mid\text{複數}\mid\text{極限微積分}$")], "usage": ["高三綜合題先選路徑再解。"], "examples": ["先判主題可避免公式誤用。"], "tips": ["題幹關鍵字先圈起來。"], "mistakes": ["題型未分流就計算。"]},
        ],
    }

    rows: List[Dict] = []
    missing_parent = 0
    for pid, branches in plan.items():
        parent = parent_map.get(pid)
        if not parent:
            missing_parent += len(branches)
            continue
        for b in branches:
            rows.append(build_branch(parent, b))
    return rows, missing_parent


def main():
    backups = []
    stats = {
        "branches_created": 0,
        "branches_updated": 0,
        "branches_skipped": 0,
        "errors": 0,
        "missing_parent_specs": 0,
        "actual_source_hit": str(FORMULA_DB),
    }

    try:
        backups.append(backup_file(FORMULA_DB, "pre-s5-branches"))
        payload = load_json(FORMULA_DB)
        topics = payload.get("topics", []) if isinstance(payload, dict) else []
        if not isinstance(topics, list):
            topics = []

        parent_map = {
            t["id"]: t
            for t in topics
            if str(t.get("id", "")).startswith("s5-")
            and not str(t.get("parentId", "")).strip()
        }
        new_rows, missing_parent = build_branches(parent_map)
        target_ids = [r["id"] for r in new_rows]

        topics, c, u, s = upsert_records(topics, new_rows)
        stats["branches_created"] = c
        stats["branches_updated"] = u
        stats["branches_skipped"] = s
        stats["missing_parent_specs"] = missing_parent

        payload["topics"] = topics
        payload.setdefault("meta", {})
        payload["meta"]["count"] = len(topics)
        payload["meta"]["updatedAt"] = now_iso()
        payload["meta"]["lastImportSource"] = SOURCE_REF
        save_json(FORMULA_DB, payload)

        sync_code, sync_output = run_cmd(["python", "program-db/scripts/sync_web_data.py"])

        check = load_json(FORMULA_DB)
        rows = check.get("topics", [])
        unique_ok, dup_ids = validate_unique_ids(rows)
        required_issues = validate_required(rows, TOPIC_REQUIRED_FIELDS, target_ids)

        result = {
            "actual_source_hit": str(FORMULA_DB),
            "source_ref": SOURCE_REF,
            "backups": backups,
            "stats": stats,
            "validation": {
                "topic_id_unique": unique_ok,
                "topic_duplicate_ids": dup_ids,
                "topic_required_issues": required_issues,
                "formula_json_parse_ok": True,
                "formula_utf8_has_replacement_char": check_replacement_char(FORMULA_DB),
            },
            "sync": {
                "web_sync_code": sync_code,
                "web_sync_output": sync_output,
            },
            "samples": [r for r in rows if r.get("id") in target_ids][:5],
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
        if sync_code != 0:
            raise SystemExit(1)
    except Exception as exc:
        stats["errors"] += 1
        print(json.dumps({"error": str(exc), "stats": stats, "backups": backups}, ensure_ascii=False, indent=2))
        raise


if __name__ == "__main__":
    main()
