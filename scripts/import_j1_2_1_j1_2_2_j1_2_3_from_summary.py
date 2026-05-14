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

SOURCE_WORD = r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國一上3  因數與倍數.docx"
SUMMARY_WORD = str(ROOT / "exports" / "word-j1-2-1-2-3" / "改國一上3_因數與倍數_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j1-2-1": "質因數分解、因數、倍數",
    "j1-2-2": "公因數、公倍數",
    "j1-2-3": "分數的加減乘除",
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


def load_json(path: Path) -> Dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: Dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def backup_file(path: Path) -> str:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j1-2-1-2-3-{ts}{path.suffix}"
    shutil.copy2(path, backup_path)
    return str(backup_path)


def upsert_records(records: List[Dict], additions: List[Dict]) -> Tuple[List[Dict], int, int]:
    idx = {str(item.get("id", "")).strip(): i for i, item in enumerate(records)}
    created = 0
    updated = 0
    for row in additions:
        rid = str(row.get("id", "")).strip()
        if not rid:
            continue
        if rid in idx:
            records[idx[rid]] = row
            updated += 1
        else:
            records.append(row)
            idx[rid] = len(records) - 1
            created += 1
    return records, created, updated


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
        for f in fields:
            v = row.get(f, None)
            if v is None:
                missing.append(f)
                continue
            if isinstance(v, str) and not v.strip():
                missing.append(f)
                continue
            if isinstance(v, list) and len(v) == 0:
                missing.append(f)
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
    is_branch: bool = False,
) -> Dict:
    chapter = CHAPTER_NAME[chapter_code]
    chapter_order = {"j1-2-1": 1, "j1-2-2": 2, "j1-2-3": 3}[chapter_code]
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "國中",
        "grade": "國一",
        "term": "上學期",
        "chapter": chapter,
        "section": chapter,
        "chapterCode": chapter_code,
        "chapterOrder": chapter_order,
        "stageOrder": 1,
        "gradeOrder": 1,
        "termOrder": 1,
        "gradeLabel": "國一上",
        "domain": "數與量",
        "domainSub": "",
        "chapterRole": chapter_role,
        "difficulty": difficulty,
        "parentId": parent_id,
        "isBranch": is_branch,
        "contentTypes": ["重點式", "公式與性質", "典型題型", "易錯陷阱"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "tags": ["word匯入", "教學核心", chapter_code, chapter],
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes + [f"來源：{SOURCE_REF}"],
        "mistakes": mistakes,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "originalIndex": 999100,
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
        "grade": "國一",
        "chapter": chapter,
        "difficulty": difficulty,
        "source_type": "word_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    rows = []

    # j1-2-1
    rows.append(
        topic_row(
            id_="j1-2-1-factor-multiple-main",
            title="因數與倍數核心概念",
            chapter_code="j1-2-1",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("定義", r"$c=a\times b\Rightarrow a,b\text{ 是 }c\text{ 的因數，}c\text{ 是 }a,b\text{ 的倍數}$"),
                ("基本性質", r"$1\text{ 是任意整數因數，任意整數是 }1\text{ 的倍數}$"),
            ],
            usage=["作為整章入口，先判斷題目是在問因數還是倍數。"],
            examples=[r"若 $18=3\times 6$，則 3、6 是 18 的因數。"],
            tips=["先用「是否能整除」判斷，不要只靠直覺。"],
            notes=["j1-2-1 主題總覽。"],
            mistakes=["把因數與倍數方向寫反。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-1-prime-composite",
            title="質數、合數與 1 的判斷",
            chapter_code="j1-2-1",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j1-2-1-factor-multiple-main",
            is_branch=True,
            formula_lines=[
                ("質數", r"$n>1\text{ 且正因數只有 }1,n$"),
                ("合數", r"$n>1\text{ 且除了 }1,n\text{ 還有其他正因數}$"),
            ],
            usage=["判斷一串整數中的質數與合數。"],
            examples=[r"$2,3,5,7$ 是質數；$4,6,9,10$ 是合數；$1$ 非質非合。"],
            tips=["先排除 1，再看是否只有兩個正因數。"],
            notes=["對應原稿質數/合數基礎。"],
            mistakes=["把 1 當質數。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-1-divisibility-basic",
            title="2、3、5 的整除判別",
            chapter_code="j1-2-1",
            chapter_role="分支題型",
            difficulty="基礎",
            parent_id="j1-2-1-factor-multiple-main",
            is_branch=True,
            formula_lines=[
                ("2 的判別", r"個位數為偶數"),
                ("3 的判別", r"各位數字和可被 3 整除"),
                ("5 的判別", r"個位數為 0 或 5"),
            ],
            usage=["快速判斷整數是否含有 2、3、5 的因數。"],
            examples=[r"$256$ 含因數 2；$567$ 含因數 3；$10987650$ 含因數 5。"],
            tips=["3、9 都看數字和；2、5 看個位。"],
            notes=["對應原稿基本判別法。"],
            mistakes=["把 3 的判別誤用成看個位數。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-1-divisibility-advanced",
            title="4、8、9、11 的整除判別",
            chapter_code="j1-2-1",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-2-1-factor-multiple-main",
            is_branch=True,
            formula_lines=[
                ("4 的判別", r"末兩位可被 4 整除"),
                ("8 的判別", r"末三位可被 8 整除"),
                ("9 的判別", r"各位數字和可被 9 整除"),
                ("11 的判別", r"奇位和與偶位和之差是 11 的倍數（含 0）"),
            ],
            usage=["進階判別題、補空格題。"],
            examples=[r"$1516$ 含因數 4，$1234536$ 含因數 8，$382349$ 含因數 11。"],
            tips=["11 的判別先標奇偶位再計算。"],
            notes=["對應原稿進階判別法。"],
            mistakes=["11 判別時奇偶位順序抄錯。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-1-prime-factorization",
            title="質因數分解與標準分解式",
            chapter_code="j1-2-1",
            chapter_role="主角",
            difficulty="中等",
            parent_id="j1-2-1-factor-multiple-main",
            is_branch=True,
            formula_lines=[
                ("質因數分解", r"$n=p_1^{a_1}p_2^{a_2}\cdots p_k^{a_k}$"),
                ("標準分解式", r"同質因數合併為次方，且依大小順序排列"),
            ],
            usage=["寫標準分解式、找質因數集合。"],
            examples=[r"$180=2^2\times3^2\times5$。"],
            tips=["分解到每個因子都為質數才停止。"],
            notes=["對應原稿質因數分解段。"],
            mistakes=["留有合數因子未再分解。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-1-divisor-count-sum",
            title="正因數個數與總和",
            chapter_code="j1-2-1",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j1-2-1-factor-multiple-main",
            is_branch=True,
            formula_lines=[
                ("因數個數", r"$n=p_1^{a_1}\cdots p_k^{a_k}\Rightarrow d(n)=\prod (a_i+1)$"),
                ("因數總和", r"$\sigma(n)=\prod (1+p_i+p_i^2+\cdots+p_i^{a_i})$"),
            ],
            usage=["求因數個數、因數總和與條件推回。"],
            examples=[r"$24=2^3\times3\Rightarrow d(24)=(3+1)(1+1)=8$。"],
            tips=["先做標準分解式再代公式。"],
            notes=["對應原稿因數個數與總和。"],
            mistakes=["把指數直接相加，不乘 $(a_i+1)$。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-1-factor-multiple-application",
            title="因數倍數應用題",
            chapter_code="j1-2-1",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j1-2-1-factor-multiple-main",
            is_branch=True,
            formula_lines=[
                ("策略", r"先翻譯條件：\text{是因數}/\text{是倍數}/\text{同時滿足}"),
                ("檢查", r"最後檢查範圍條件（如小於 100、介於區間）"),
            ],
            usage=["考試分數、人數、整除條件的文字題。"],
            examples=[r"若分數是 7 與 13 的公倍數且小於 100，唯一可能為 91。"],
            tips=["先列可能集合，再交集。"],
            notes=["對應原稿應用題段。"],
            mistakes=["未檢查題目給的上下限。"],
        )
    )

    # j1-2-2
    rows.append(
        topic_row(
            id_="j1-2-2-gcd-lcm-main",
            title="公因數與公倍數核心概念",
            chapter_code="j1-2-2",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("最大公因數", r"$\gcd(a,b)$"),
                ("最小公倍數", r"$\operatorname{lcm}(a,b)$"),
                ("關係式", r"$ab=\gcd(a,b)\times\operatorname{lcm}(a,b)\ (a,b>0)$"),
            ],
            usage=["公因數、公倍數全部題型總覽。"],
            examples=[r"$\gcd(24,18)=6,\ \operatorname{lcm}(24,18)=72$。"],
            tips=["同時問 gcd 與 lcm 時，先分解最穩。"],
            notes=["j1-2-2 主題總覽。"],
            mistakes=["把 gcd、lcm 概念顛倒。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-2-gcd-coprime",
            title="公因數、最大公因數與互質",
            chapter_code="j1-2-2",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j1-2-2-gcd-lcm-main",
            is_branch=True,
            formula_lines=[
                ("互質", r"$\gcd(a,b)=1$"),
                ("性質", r"任兩相異質數必互質"),
            ],
            usage=["判斷兩數是否互質。"],
            examples=[r"$\gcd(8,9)=1$，所以 8 與 9 互質。"],
            tips=["互質不代表兩數都必須是質數。"],
            notes=["對應原稿互質觀念。"],
            mistakes=["把互質誤解成兩數都是質數。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-2-gcd-methods",
            title="最大公因數求法（羅列、分解、短除、輾轉）",
            chapter_code="j1-2-2",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-2-2-gcd-lcm-main",
            is_branch=True,
            formula_lines=[
                ("分解法", r"共同質因數取\text{較低次方}"),
                ("輾轉相除", r"\gcd(a,b)=\gcd(b,a\bmod b)"),
            ],
            usage=["快速求 gcd。"],
            examples=[r"$56=2^3\times7,\ 90=2\times3^2\times5,\ 294=2\times3\times7^2$。"],
            tips=["三數以上短除法要每次找共同因數。"],
            notes=["對應原稿 gcd 各求法。"],
            mistakes=["分解法取成較高次方。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-2-gcd-application",
            title="最大公因數應用（切割、分組）",
            chapter_code="j1-2-2",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j1-2-2-gcd-lcm-main",
            is_branch=True,
            formula_lines=[
                ("應用句型", r"要\text{最大且可整分}\Rightarrow \gcd"),
                ("檢查", r"答案須同時整除所有條件數"),
            ],
            usage=["磁磚切割、等分題。"],
            examples=[r"長寬 24 與 20 裁最大正方形，邊長為 $\gcd(24,20)=4$。"],
            tips=["看到『最大一樣大小』優先想 gcd。"],
            notes=["對應原稿 gcd 應用段。"],
            mistakes=["只除一個數，沒有同時檢查全部條件。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-2-lcm-concept",
            title="公倍數與最小公倍數概念",
            chapter_code="j1-2-2",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j1-2-2-gcd-lcm-main",
            is_branch=True,
            formula_lines=[
                ("最小公倍數", r"\operatorname{lcm}(a,b)\text{ 為共同倍數中最小正整數}"),
                ("性質", r"a\mid b\Rightarrow \operatorname{lcm}(a,b)=b"),
            ],
            usage=["週期題、對齊題。"],
            examples=[r"$[6,8]=24,\ [8,12,15]=120$。"],
            tips=["lcm 只有一個最小值。"],
            notes=["對應原稿 lcm 概念。"],
            mistakes=["把任意公倍數當成最小公倍數。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-2-lcm-methods-relation",
            title="最小公倍數求法與 gcd 關係",
            chapter_code="j1-2-2",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-2-2-gcd-lcm-main",
            is_branch=True,
            formula_lines=[
                ("分解法", r"共同質因數取\text{較高次方}"),
                ("關係式", r"\operatorname{lcm}(a,b)=\frac{ab}{\gcd(a,b)}"),
            ],
            usage=["由 gcd 反求 lcm、由 lcm 反求未知數。"],
            examples=[r"$\operatorname{lcm}(54,72)=\frac{54\times72}{\gcd(54,72)}$。"],
            tips=["先求 gcd 再帶關係式可減少錯誤。"],
            notes=["對應原稿 lcm 求法與性質。"],
            mistakes=["關係式分子分母放反。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-2-lcm-application",
            title="最小公倍數應用（同時發生、至少多少）",
            chapter_code="j1-2-2",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j1-2-2-gcd-lcm-main",
            is_branch=True,
            formula_lines=[
                ("應用句型", r"若\ (x\pm k)\text{ 為多數公倍數}\Rightarrow x\pm k=\operatorname{lcm}(\cdots)\times t"),
                ("最少", r"\text{最少/至少}\Rightarrow t=1\text{ 或最小可行整數}"),
            ],
            usage=["時間週期、座位編排、數字條件題。"],
            examples=[r"若 $(x-2)$ 為 8、11、15 的公倍數且最少，則 $x=2+[8,11,15]$。"],
            tips=["先處理平移項，再求 lcm。"],
            notes=["對應原稿 lcm 應用段。"],
            mistakes=["忘記最後把平移量加回去。"],
        )
    )

    # j1-2-3
    rows.append(
        topic_row(
            id_="j1-2-3-fraction-ops-main",
            title="分數運算核心概念",
            chapter_code="j1-2-3",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("最簡分數", r"\gcd(\text{分子},\text{分母})=1"),
                ("加減", r"\frac{a}{b}\pm\frac{c}{d}=\frac{ad\pm bc}{bd}"),
                ("除法", r"\frac{a}{b}\div\frac{c}{d}=\frac{a}{b}\times\frac{d}{c}"),
            ],
            usage=["分數加減乘除全章總覽。"],
            examples=[r"$\frac{3}{4}\div\frac{2}{5}=\frac{3}{4}\times\frac{5}{2}$。"],
            tips=["先判斷是同分母、異分母，還是乘除。"],
            notes=["j1-2-3 主題總覽。"],
            mistakes=["除法不換倒數。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-3-simplify-expand",
            title="擴分、約分與最簡分數",
            chapter_code="j1-2-3",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j1-2-3-fraction-ops-main",
            is_branch=True,
            formula_lines=[
                ("擴分", r"\frac{a}{b}=\frac{ak}{bk}\ (k\neq0)"),
                ("約分", r"\frac{a}{b}=\frac{a\div d}{b\div d}\ (d\mid a,b)"),
            ],
            usage=["化簡、判斷是否最簡。"],
            examples=[r"$\frac{18}{48}=\frac{3}{8}$，$\frac{40}{45}=\frac{8}{9}$。"],
            tips=["先找分子分母 gcd 再一次約到底。"],
            notes=["對應原稿約分擴分。"],
            mistakes=["只約一次就停，未約到最簡。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-3-common-denominator-compare",
            title="通分與分數比大小",
            chapter_code="j1-2-3",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-2-3-fraction-ops-main",
            is_branch=True,
            formula_lines=[
                ("通分", r"\text{分母取 lcm 再改寫}"),
                ("比較", r"\text{同分母比分子；同分子比分母}"),
            ],
            usage=["排序題、比較大小題。"],
            examples=[r"$\frac{2}{5}=\frac{4}{10},\ \frac{1}{2}=\frac{5}{10}$。"],
            tips=["異分母先通分最穩定。"],
            notes=["對應原稿比較與通分。"],
            mistakes=["同分子時還把分母大者判成較大。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-3-add-sub-fractions",
            title="分數加減法",
            chapter_code="j1-2-3",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-2-3-fraction-ops-main",
            is_branch=True,
            formula_lines=[
                ("同分母", r"\frac{a}{m}\pm\frac{b}{m}=\frac{a\pm b}{m}"),
                ("異分母", r"\frac{a}{b}\pm\frac{c}{d}=\frac{ad\pm bc}{bd}"),
            ],
            usage=["同分母、異分母與帶分數加減。"],
            examples=[r"$\frac{2}{3}+1\frac{1}{5}=1+\frac{10}{15}+\frac{3}{15}=1\frac{13}{15}$。"],
            tips=["異分母先通分，最後再約分。"],
            notes=["對應原稿分數加減。"],
            mistakes=["異分母直接加分子。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-3-mul-div-fractions",
            title="分數乘除法",
            chapter_code="j1-2-3",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-2-3-fraction-ops-main",
            is_branch=True,
            formula_lines=[
                ("乘法", r"\frac{a}{b}\times\frac{c}{d}=\frac{ac}{bd}"),
                ("除法", r"\frac{a}{b}\div\frac{c}{d}=\frac{ad}{bc}"),
            ],
            usage=["分數乘法、除法與連續運算。"],
            examples=[r"$\frac{5}{8}\div\frac{3}{8}=\frac{5}{8}\times\frac{8}{3}=\frac{5}{3}$。"],
            tips=["可先約分再乘，數字會更小。"],
            notes=["對應原稿分數乘除。"],
            mistakes=["除法忘記翻轉後項。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-3-mixed-complex-fractions",
            title="帶分數與繁分數處理",
            chapter_code="j1-2-3",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j1-2-3-fraction-ops-main",
            is_branch=True,
            formula_lines=[
                ("帶分數轉換", r"a\frac{b}{c}=\frac{ac+b}{c}"),
                ("繁分數", r"\frac{\frac{a}{b}}{\frac{c}{d}}=\frac{a}{b}\times\frac{d}{c}"),
            ],
            usage=["多步分數式與帶分數混合題。"],
            examples=[r"$3\frac{4}{7}\div1\frac{1}{3}=\frac{25}{7}\div\frac{4}{3}$。"],
            tips=["先全部轉假分數再運算。"],
            notes=["對應原稿繁分數表示。"],
            mistakes=["整數部分與分數部分分開算後未合併。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-2-3-fraction-application",
            title="分數應用題",
            chapter_code="j1-2-3",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j1-2-3-fraction-ops-main",
            is_branch=True,
            formula_lines=[
                ("應用流程", r"\text{先定義單位量}\to\text{列分數式}\to\text{通分/約分}\to\text{檢查}"),
                ("大小判斷", r"\text{先轉同分母再比較最穩}"),
            ],
            usage=["份量、比率、工作量等文字題。"],
            examples=[r"比較 $\frac{6}{7},\frac{8}{9},\frac{10}{11}$ 可先交叉或通分。"],
            tips=["答案最好回到最簡分數或帶分數。"],
            notes=["對應原稿分數應用段。"],
            mistakes=["忘記帶回原單位意義。"],
        )
    )

    return rows


def build_questions() -> List[Dict]:
    rows: List[Dict] = []

    # j1-2-1 (12)
    rows.extend(
        [
            question_row(id_="q-j1-2-1-word03-001", title="因數倍數判斷（基礎01）", chapter_code="j1-2-1", difficulty="基礎",
                         question_text=r"已知 $18=3\times6$，請問 3 與 6 和 18 的關係。",
                         answer_text="3、6 是 18 的因數；18 是 3、6 的倍數。",
                         explanation_text="由乘法分解可直接判斷因數與倍數關係。",
                         topic_id="j1-2-1-factor-multiple-main"),
            question_row(id_="q-j1-2-1-word03-002", title="質數判斷（基礎02）", chapter_code="j1-2-1", difficulty="基礎",
                         question_text="下列數中哪些是質數：2、9、11、15、17？",
                         answer_text="2、11、17",
                         explanation_text="質數只有兩個正因數：1 與本身。",
                         topic_id="j1-2-1-prime-composite"),
            question_row(id_="q-j1-2-1-word03-003", title="合數判斷（基礎03）", chapter_code="j1-2-1", difficulty="基礎",
                         question_text="1、21、37、49 中，哪些是合數？",
                         answer_text="21、49",
                         explanation_text="1 非質非合；37 為質數；21、49 有其他因數。",
                         topic_id="j1-2-1-prime-composite"),
            question_row(id_="q-j1-2-1-word03-004", title="2、3、5 判別（基礎04）", chapter_code="j1-2-1", difficulty="基礎",
                         question_text="判斷 256、567、10987650 是否分別含有因數 2、3、5。",
                         answer_text="是、是、是",
                         explanation_text="256 個位偶數；567 各位和 18；10987650 個位 0。",
                         topic_id="j1-2-1-divisibility-basic"),
            question_row(id_="q-j1-2-1-word03-005", title="4、8 判別（中等01）", chapter_code="j1-2-1", difficulty="中等",
                         question_text="1516 是否為 4 的倍數？53686 是否為 8 的倍數？",
                         answer_text="是；否",
                         explanation_text="1516 末兩位 16 可被 4 整除；53686 末三位 686 不可被 8 整除。",
                         topic_id="j1-2-1-divisibility-advanced"),
            question_row(id_="q-j1-2-1-word03-006", title="9、11 判別（中等02）", chapter_code="j1-2-1", difficulty="中等",
                         question_text="3654 是否為 9 的倍數？382349 是否為 11 的倍數？",
                         answer_text="是；是",
                         explanation_text="3654 各位和 18；382349 之奇偶位和差為 11 的倍數。",
                         topic_id="j1-2-1-divisibility-advanced"),
            question_row(id_="q-j1-2-1-word03-007", title="標準分解式（中等03）", chapter_code="j1-2-1", difficulty="中等",
                         question_text="將 180 做質因數分解並寫成標準分解式。",
                         answer_text=r"$180=2^2\times3^2\times5$",
                         explanation_text="180 逐步除以質數 2、2、3、3、5。",
                         topic_id="j1-2-1-prime-factorization"),
            question_row(id_="q-j1-2-1-word03-008", title="正因數個數（中等04）", chapter_code="j1-2-1", difficulty="中等",
                         question_text="求 108 的正因數個數。",
                         answer_text="12",
                         explanation_text=r"$108=2^2\times3^3\Rightarrow(2+1)(3+1)=12$。",
                         topic_id="j1-2-1-divisor-count-sum"),
            question_row(id_="q-j1-2-1-word03-009", title="正因數總和（進階01）", chapter_code="j1-2-1", difficulty="進階",
                         question_text="求 24 的正因數總和。",
                         answer_text="60",
                         explanation_text=r"$24=2^3\times3$，總和為 $(1+2+4+8)(1+3)=15\times4=60$。",
                         topic_id="j1-2-1-divisor-count-sum"),
            question_row(id_="q-j1-2-1-word03-010", title="範圍應用（進階02）", chapter_code="j1-2-1", difficulty="進階",
                         question_text="某分數是 7 與 13 的倍數，且不超過 100，求可能值。",
                         answer_text="91",
                         explanation_text="7 與 13 的公倍數為 91、182...，100 內只有 91。",
                         topic_id="j1-2-1-factor-multiple-application"),
            question_row(id_="q-j1-2-1-word03-011", title="補數字（進階03）", chapter_code="j1-2-1", difficulty="進階",
                         question_text="七位數 432□905 若為 3 的倍數，□ 可填哪些數字？",
                         answer_text="1、4、7",
                         explanation_text="已知和為 23+□，要是 3 的倍數，故 □=1,4,7。",
                         topic_id="j1-2-1-divisibility-basic"),
            question_row(id_="q-j1-2-1-word03-012", title="綜合判別（進階04）", chapter_code="j1-2-1", difficulty="進階",
                         question_text="八位數 1985p63q 是 36 的倍數，求 $(p,q)$ 的可能值。",
                         answer_text="(2,2) 或 (7,6)",
                         explanation_text="36 需同時被 4 與 9 整除；由末兩位與數字和聯立可得。",
                         topic_id="j1-2-1-factor-multiple-application"),
        ]
    )

    # j1-2-2 (12)
    rows.extend(
        [
            question_row(id_="q-j1-2-2-word03-013", title="gcd 基礎（基礎01）", chapter_code="j1-2-2", difficulty="基礎",
                         question_text=r"求 $\gcd(24,18)$。",
                         answer_text="6",
                         explanation_text="列因數或分解法皆可得 6。",
                         topic_id="j1-2-2-gcd-methods"),
            question_row(id_="q-j1-2-2-word03-014", title="互質判斷（基礎02）", chapter_code="j1-2-2", difficulty="基礎",
                         question_text="8 與 9 是否互質？",
                         answer_text="是",
                         explanation_text=r"$\gcd(8,9)=1$，故互質。",
                         topic_id="j1-2-2-gcd-coprime"),
            question_row(id_="q-j1-2-2-word03-015", title="三數 gcd（中等01）", chapter_code="j1-2-2", difficulty="中等",
                         question_text=r"求 $\gcd(56,90,294)$。",
                         answer_text="2",
                         explanation_text=r"分解後共同質因數只有 $2$。",
                         topic_id="j1-2-2-gcd-methods"),
            question_row(id_="q-j1-2-2-word03-016", title="lcm 基礎（基礎03）", chapter_code="j1-2-2", difficulty="基礎",
                         question_text=r"求 $\operatorname{lcm}(6,8)$。",
                         answer_text="24",
                         explanation_text="6、8 的公倍數最小為 24。",
                         topic_id="j1-2-2-lcm-concept"),
            question_row(id_="q-j1-2-2-word03-017", title="三數 lcm（中等02）", chapter_code="j1-2-2", difficulty="中等",
                         question_text=r"求 $\operatorname{lcm}(8,12,15)$。",
                         answer_text="120",
                         explanation_text=r"$8=2^3,12=2^2\cdot3,15=3\cdot5$，取高次方得 $2^3\cdot3\cdot5=120$。",
                         topic_id="j1-2-2-lcm-methods-relation"),
            question_row(id_="q-j1-2-2-word03-018", title="gcd-lcm 關係（中等03）", chapter_code="j1-2-2", difficulty="中等",
                         question_text=r"已知 $\gcd(54,72)=18$，求 $\operatorname{lcm}(54,72)$。",
                         answer_text="216",
                         explanation_text=r"$\operatorname{lcm}=\frac{54\times72}{18}=216$。",
                         topic_id="j1-2-2-lcm-methods-relation"),
            question_row(id_="q-j1-2-2-word03-019", title="切割應用（中等04）", chapter_code="j1-2-2", difficulty="中等",
                         question_text="長 24 公分、寬 20 公分長方形切成最大正方形，邊長幾公分？",
                         answer_text="4 公分",
                         explanation_text=r"求 $\gcd(24,20)=4$。",
                         topic_id="j1-2-2-gcd-application"),
            question_row(id_="q-j1-2-2-word03-020", title="最少次數（進階01）", chapter_code="j1-2-2", difficulty="進階",
                         question_text="甲每 8 分鐘一次、乙每 12 分鐘一次、丙每 15 分鐘一次，同時開始後最早幾分鐘再同時？",
                         answer_text="120 分鐘",
                         explanation_text=r"求 $\operatorname{lcm}(8,12,15)=120$。",
                         topic_id="j1-2-2-lcm-application"),
            question_row(id_="q-j1-2-2-word03-021", title="平移條件（進階02）", chapter_code="j1-2-2", difficulty="進階",
                         question_text=r"若 $(x-2)$ 為 8、11、15 的公倍數，且 $x$ 最小，求 $x$。",
                         answer_text="1322",
                         explanation_text=r"$[8,11,15]=1320$，故最小 $x=1320+2=1322$。",
                         topic_id="j1-2-2-lcm-application"),
            question_row(id_="q-j1-2-2-word03-022", title="同餘條件（進階03）", chapter_code="j1-2-2", difficulty="進階",
                         question_text="某數除以 15、20、25 都餘 5，求最小正整數。",
                         answer_text="305",
                         explanation_text=r"$n-5$ 為三者公倍數，最小為 $[15,20,25]=300$，故 $n=305$。",
                         topic_id="j1-2-2-lcm-application"),
            question_row(id_="q-j1-2-2-word03-023", title="因倍關係（基礎04）", chapter_code="j1-2-2", difficulty="基礎",
                         question_text=r"若 $a\mid b$ 且 $a,b>0$，則 $\gcd(a,b)$ 與 $\operatorname{lcm}(a,b)$ 分別為何？",
                         answer_text=r"$\gcd(a,b)=a,\ \operatorname{lcm}(a,b)=b$",
                         explanation_text="因為 b 是 a 的倍數。",
                         topic_id="j1-2-2-lcm-methods-relation"),
            question_row(id_="q-j1-2-2-word03-024", title="公因數列舉（中等05）", chapter_code="j1-2-2", difficulty="中等",
                         question_text="寫出 18 與 24 的所有正公因數。",
                         answer_text="1、2、3、6",
                         explanation_text="列因數交集即可。",
                         topic_id="j1-2-2-gcd-coprime"),
        ]
    )

    # j1-2-3 (12)
    rows.extend(
        [
            question_row(id_="q-j1-2-3-word03-025", title="最簡分數（基礎01）", chapter_code="j1-2-3", difficulty="基礎",
                         question_text=r"將 $\frac{18}{48}$ 化成最簡分數。",
                         answer_text=r"$\frac{3}{8}$",
                         explanation_text=r"分子分母同除以 $\gcd(18,48)=6$。",
                         topic_id="j1-2-3-simplify-expand"),
            question_row(id_="q-j1-2-3-word03-026", title="最簡分數（基礎02）", chapter_code="j1-2-3", difficulty="基礎",
                         question_text=r"將 $\frac{40}{45}$ 化成最簡分數。",
                         answer_text=r"$\frac{8}{9}$",
                         explanation_text=r"分子分母同除以 5。",
                         topic_id="j1-2-3-simplify-expand"),
            question_row(id_="q-j1-2-3-word03-027", title="通分（中等01）", chapter_code="j1-2-3", difficulty="中等",
                         question_text=r"將 $\frac{2}{3}$ 與 $\frac{3}{4}$ 通分。",
                         answer_text=r"$\frac{8}{12},\ \frac{9}{12}$",
                         explanation_text=r"$[3,4]=12$，各自擴分。",
                         topic_id="j1-2-3-common-denominator-compare"),
            question_row(id_="q-j1-2-3-word03-028", title="比大小（中等02）", chapter_code="j1-2-3", difficulty="中等",
                         question_text=r"比較大小：$\frac{2}{5},\frac{3}{10},\frac{1}{2}$。",
                         answer_text=r"$\frac{1}{2}>\frac{2}{5}>\frac{3}{10}$",
                         explanation_text=r"通分成十分位：$\frac{5}{10}>\frac{4}{10}>\frac{3}{10}$。",
                         topic_id="j1-2-3-common-denominator-compare"),
            question_row(id_="q-j1-2-3-word03-029", title="同分母加減（基礎03）", chapter_code="j1-2-3", difficulty="基礎",
                         question_text=r"計算：$\frac{7}{15}+\frac{3}{15}$。",
                         answer_text=r"$\frac{2}{3}$",
                         explanation_text=r"同分母分子相加得 $\frac{10}{15}$，再約分。",
                         topic_id="j1-2-3-add-sub-fractions"),
            question_row(id_="q-j1-2-3-word03-030", title="異分母加減（中等03）", chapter_code="j1-2-3", difficulty="中等",
                         question_text=r"計算：$\frac{2}{3}+1\frac{1}{5}$。",
                         answer_text=r"$1\frac{13}{15}$",
                         explanation_text=r"$\frac{2}{3}=\frac{10}{15},\ \frac{1}{5}=\frac{3}{15}$。",
                         topic_id="j1-2-3-add-sub-fractions"),
            question_row(id_="q-j1-2-3-word03-031", title="分數乘法（基礎04）", chapter_code="j1-2-3", difficulty="基礎",
                         question_text=r"計算：$\frac{3}{4}\times\frac{8}{5}$。",
                         answer_text=r"$\frac{6}{5}=1\frac{1}{5}$",
                         explanation_text="可先約分 8 與 4。",
                         topic_id="j1-2-3-mul-div-fractions"),
            question_row(id_="q-j1-2-3-word03-032", title="分數除法（中等04）", chapter_code="j1-2-3", difficulty="中等",
                         question_text=r"計算：$\frac{5}{8}\div\frac{3}{8}$。",
                         answer_text=r"$\frac{5}{3}=1\frac{2}{3}$",
                         explanation_text=r"除以分數等於乘倒數。",
                         topic_id="j1-2-3-mul-div-fractions"),
            question_row(id_="q-j1-2-3-word03-033", title="帶分數除法（進階01）", chapter_code="j1-2-3", difficulty="進階",
                         question_text=r"計算：$3\frac{4}{7}\div1\frac{1}{3}$。",
                         answer_text=r"$2\frac{19}{28}$",
                         explanation_text=r"$\frac{25}{7}\div\frac{4}{3}=\frac{75}{28}=2\frac{19}{28}$。",
                         topic_id="j1-2-3-mixed-complex-fractions"),
            question_row(id_="q-j1-2-3-word03-034", title="繁分數（進階02）", chapter_code="j1-2-3", difficulty="進階",
                         question_text=r"化簡：$\frac{\frac{2}{3}}{\frac{5}{6}}$。",
                         answer_text=r"$\frac{4}{5}$",
                         explanation_text=r"$\frac{2}{3}\times\frac{6}{5}=\frac{12}{15}=\frac{4}{5}$。",
                         topic_id="j1-2-3-mixed-complex-fractions"),
            question_row(id_="q-j1-2-3-word03-035", title="分數排序（進階03）", chapter_code="j1-2-3", difficulty="進階",
                         question_text=r"將 $\frac{6}{7},\frac{8}{9},\frac{10}{11}$ 由小到大排序。",
                         answer_text=r"$\frac{6}{7}<\frac{8}{9}<\frac{10}{11}$",
                         explanation_text="可交叉相乘比較相鄰兩項。",
                         topic_id="j1-2-3-fraction-application"),
            question_row(id_="q-j1-2-3-word03-036", title="應用題（進階04）", chapter_code="j1-2-3", difficulty="進階",
                         question_text=r"一桶油先用去 $\frac{1}{4}$，再用去剩下的 $\frac{1}{3}$，最後剩下原來的幾分之幾？",
                         answer_text=r"$\frac{1}{2}$",
                         explanation_text=r"先剩 $\frac{3}{4}$，再用去 $\frac{1}{3}\times\frac{3}{4}=\frac{1}{4}$，故剩 $\frac{1}{2}$。",
                         topic_id="j1-2-3-fraction-application"),
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

    topics, topic_created, topic_updated = upsert_records(topics, new_topics)
    questions, q_created, q_updated = upsert_records(questions, new_questions)

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
            "topics_skipped": 0,
            "questions_created": q_created,
            "questions_updated": q_updated,
            "questions_skipped": 0,
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
