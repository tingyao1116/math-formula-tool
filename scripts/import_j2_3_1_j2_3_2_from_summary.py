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

SOURCE_WORD = r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國一下3  比與比例式.docx"
SUMMARY_WORD = str(ROOT / "exports" / "word-j2-3-1-2" / "改國一下3_比與比例式_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j2-3-1": "比例式",
    "j2-3-2": "正比反比",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j2-3-1-2-{ts}{path.suffix}"
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
    chapter_order = {"j2-3-1": 1, "j2-3-2": 2}[chapter_code]
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "國中",
        "grade": "國二",
        "term": "下學期",
        "chapter": chapter,
        "section": chapter,
        "chapterCode": chapter_code,
        "chapterOrder": chapter_order,
        "stageOrder": 1,
        "gradeOrder": 2,
        "termOrder": 2,
        "gradeLabel": "國二下",
        "domain": "代數",
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
        "originalIndex": 999230,
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
        "tags": ["word匯入", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    rows = []

    # j2-3-1
    rows.append(
        topic_row(
            id_="j2-3-1-ratio-main",
            title="比與比值核心觀念",
            chapter_code="j2-3-1",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("比", r"$a:b$（$b\neq 0$）"),
                ("比值", r"$a:b=\frac{a}{b}$"),
            ],
            usage=["本章入口：先分清楚比與比值。"],
            examples=[r"$5:4$ 的比值是 $\frac{5}{4}$。"],
            tips=["比是關係；比值才是可直接計算的數。"],
            notes=["對應講義：比與比值。"],
            mistakes=["把後項寫成 0。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-1-simplify-integer-ratio",
            title="最簡整數比化簡",
            chapter_code="j2-3-1",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j2-3-1-ratio-main",
            is_branch=True,
            formula_lines=[
                ("流程", r"先統一單位，去分母或小數，再約成互質整數"),
                ("性質", r"$a:b=(an):(bn)$（$n\neq0$）"),
            ],
            usage=["分數比、小數比轉最簡整數比。"],
            examples=[r"$15:4.5=10:3$。"],
            tips=["小數先同乘 $10^n$，分數先同乘最小公倍數。"],
            notes=["對應講義：最簡整數比。"],
            mistakes=["單位不同直接化簡。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-1-equal-ratio-judge",
            title="相等的比判斷",
            chapter_code="j2-3-1",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j2-3-1-ratio-main",
            is_branch=True,
            formula_lines=[
                ("判斷法", r"$a:b=c:d\iff \frac{a}{b}=\frac{c}{d}$"),
                ("交叉法", r"$a:b=c:d\iff ad=bc$"),
            ],
            usage=["快速判斷兩個比是否相等。"],
            examples=[r"$100:10=500:50$。"],
            tips=["先約分再比，通常最快。"],
            notes=["對應講義：相等的比。"],
            mistakes=["只看前項大小，不看比值。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-1-proportion-main",
            title="比例式與性質",
            chapter_code="j2-3-1",
            chapter_role="重要配角",
            difficulty="中等",
            parent_id="j2-3-1-ratio-main",
            is_branch=True,
            formula_lines=[
                ("比例式", r"$a:b=c:d$"),
                ("性質", r"$a:b=c:d\Rightarrow ad=bc$"),
            ],
            usage=["比例式求未知數。"],
            examples=[r"$6:(x+2)=3:5$。"],
            tips=["用交叉相乘前先確認分母不為 0。"],
            notes=["對應講義：比例式定義與性質。"],
            mistakes=["內項外項乘錯位置。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-1-ratio-distribution",
            title="按比分配與總份數法",
            chapter_code="j2-3-1",
            chapter_role="典型題型",
            difficulty="中等",
            parent_id="j2-3-1-ratio-main",
            is_branch=True,
            formula_lines=[
                ("總份數", r"$a:b\Rightarrow \text{總份數}=a+b$"),
                ("分配", r"\text{各部分}=\text{總量}\times \frac{\text{該份數}}{\text{總份數}}"),
            ],
            usage=["金額、人數按比例分配。"],
            examples=[r"$3500$ 按 $4:3$ 分為 $2000$ 與 $1500$。"],
            tips=["先畫份數條圖，分配最直觀。"],
            notes=["對應講義：比的應用。"],
            mistakes=["份數比與實際數值混用。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-1-compound-ratio",
            title="連比與連比例式",
            chapter_code="j2-3-1",
            chapter_role="分支題型",
            difficulty="進階",
            parent_id="j2-3-1-ratio-main",
            is_branch=True,
            formula_lines=[
                ("連比", r"$x:y:z=a:b:c$"),
                ("等價", r"$x:y=a:b,\ y:z=b:c$"),
            ],
            usage=["多對比值整合成三數以上連比。"],
            examples=[r"$a:b=2:3,\ b:c=4:5\Rightarrow a:b:c=8:12:15$。"],
            tips=["先把中間項對齊到相同數量。"],
            notes=["對應講義：連比。"],
            mistakes=["直接把兩個比首尾接上，未對齊中間項。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-1-minimal-compound-ratio",
            title="最簡整數連比",
            chapter_code="j2-3-1",
            chapter_role="進階題型",
            difficulty="進階",
            parent_id="j2-3-1-ratio-main",
            is_branch=True,
            formula_lines=[
                ("化簡", r"$x:y:z=a:b:c$ 後再以 $\gcd(a,b,c)$ 約分"),
                ("條件", r"最簡整數連比需互質"),
            ],
            usage=["多變數題收尾答案。"],
            examples=[r"$2:8:10\Rightarrow 1:4:5$。"],
            tips=["最後一定檢查三項是否仍有公因數。"],
            notes=["對應講義：最簡整數連比。"],
            mistakes=["只約兩項，第三項忘記約。"],
        )
    )

    # j2-3-2
    rows.append(
        topic_row(
            id_="j2-3-2-direct-inverse-main",
            title="正比反比核心觀念",
            chapter_code="j2-3-2",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("正比", r"$y=kx$，$\frac{y}{x}=k$"),
                ("反比", r"$y=\frac{k}{x}$，$xy=k$（$x\neq0$）"),
            ],
            usage=["本章入口：先判斷正比還是反比。"],
            examples=[r"$y=3x$ 是正比；$y=\frac{12}{x}$ 是反比。"],
            tips=["正比看『比值固定』，反比看『乘積固定』。"],
            notes=["對應講義：正比與反比定義。"],
            mistakes=["把正比、反比公式混用。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-2-direct-proportion",
            title="正比例關係式",
            chapter_code="j2-3-2",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j2-3-2-direct-inverse-main",
            is_branch=True,
            formula_lines=[
                ("關係式", r"$y=kx$"),
                ("求常數", r"$k=\frac{y}{x}$"),
            ],
            usage=["由一組資料推得正比例式。"],
            examples=[r"$x=5,y=20\Rightarrow y=4x$。"],
            tips=["先代入已知點求 $k$ 再寫關係式。"],
            notes=["對應講義：正比關係式。"],
            mistakes=["忘記關係式需通過原點。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-2-direct-graph",
            title="正比圖形",
            chapter_code="j2-3-2",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j2-3-2-direct-inverse-main",
            is_branch=True,
            formula_lines=[
                ("圖形", r"$y=kx$ 為過原點直線"),
                ("斜率", r"$k$ 決定上升或下降方向"),
            ],
            usage=["由圖形判斷是否正比。"],
            examples=[r"$k>0$ 時直線上升，$k<0$ 時直線下降。"],
            tips=["不過原點就不是正比圖形。"],
            notes=["對應講義：正比圖形。"],
            mistakes=["只看直線就判正比，忽略是否過原點。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-2-inverse-proportion",
            title="反比例關係式",
            chapter_code="j2-3-2",
            chapter_role="重要配角",
            difficulty="中等",
            parent_id="j2-3-2-direct-inverse-main",
            is_branch=True,
            formula_lines=[
                ("關係式", r"$y=\frac{k}{x}$"),
                ("常數積", r"$xy=k$"),
            ],
            usage=["由一組資料推得反比例式。"],
            examples=[r"$x=4,y=6\Rightarrow xy=24,\ y=\frac{24}{x}$。"],
            tips=["反比題一定檢查 $x\neq 0$。"],
            notes=["對應講義：反比關係式。"],
            mistakes=["把反比寫成 $y=kx$。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-2-inverse-graph",
            title="反比圖形判讀",
            chapter_code="j2-3-2",
            chapter_role="分支題型",
            difficulty="進階",
            parent_id="j2-3-2-direct-inverse-main",
            is_branch=True,
            formula_lines=[
                ("圖形", r"$xy=k$ 為雙曲線"),
                ("象限", r"$k>0$ 在第一、三象限；$k<0$ 在第二、四象限"),
            ],
            usage=["由圖判斷反比例與常數正負。"],
            examples=[r"$xy=30$ 在第一、三象限。"],
            tips=["反比圖形不會通過座標軸。"],
            notes=["對應講義：反比圖形。"],
            mistakes=["把雙曲線誤看成折線或直線。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-2-direct-inverse-application",
            title="正反比應用題",
            chapter_code="j2-3-2",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j2-3-2-direct-inverse-main",
            is_branch=True,
            formula_lines=[
                ("工程反比", r"人數與天數常呈反比（工作量固定）"),
                ("速率反比", r"速率與時間常呈反比（距離固定）"),
            ],
            usage=["工程、流量、速率與密度題。"],
            examples=[r"固定工作量下，人數加倍，所需天數減半。"],
            tips=["先確認哪個量固定，再判斷正比或反比。"],
            notes=["對應講義：正反比應用。"],
            mistakes=["題意未固定條件就直接判正反比。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-3-2-judgement-and-validation",
            title="正比反比綜合判斷",
            chapter_code="j2-3-2",
            chapter_role="易錯陷阱",
            difficulty="中等",
            parent_id="j2-3-2-direct-inverse-main",
            is_branch=True,
            formula_lines=[
                ("判斷流程", r"先看關係式，再檢查比值/乘積是否固定"),
                ("驗算", r"抽兩組資料重算以避免誤判"),
            ],
            usage=["混合敘述題與多選題。"],
            examples=[r"$y-3=2x$ 不是正比（不過原點）。"],
            tips=["含常數平移通常不是標準正比/反比。"],
            notes=["對應講義：判斷題。"],
            mistakes=["看到線性式就誤判成正比。"],
        )
    )

    return rows


def build_questions() -> List[Dict]:
    rows = []

    # j2-3-1 (12)
    rows.extend(
        [
            question_row(
                id_="q-j2-3-1-word03-001",
                title="比值計算（基礎01）",
                chapter_code="j2-3-1",
                difficulty="基礎",
                question_text=r"求 $5:4$ 的比值。",
                answer_text=r"$\frac{5}{4}$",
                explanation_text=r"前項除以後項：$\frac{5}{4}$。",
                topic_id="j2-3-1-ratio-main",
            ),
            question_row(
                id_="q-j2-3-1-word03-002",
                title="小數比化簡（基礎02）",
                chapter_code="j2-3-1",
                difficulty="基礎",
                question_text=r"將 $15:4.5$ 化為最簡整數比。",
                answer_text=r"$10:3$",
                explanation_text=r"同乘 10 得 $150:45$，再約為 $10:3$。",
                topic_id="j2-3-1-simplify-integer-ratio",
            ),
            question_row(
                id_="q-j2-3-1-word03-003",
                title="分數比化簡（基礎03）",
                chapter_code="j2-3-1",
                difficulty="基礎",
                question_text=r"將 $\frac{1}{2}:\frac{3}{4}$ 化為最簡整數比。",
                answer_text=r"$2:3$",
                explanation_text=r"同乘 4 得 $2:3$。",
                topic_id="j2-3-1-simplify-integer-ratio",
            ),
            question_row(
                id_="q-j2-3-1-word03-004",
                title="相等比判斷（基礎04）",
                chapter_code="j2-3-1",
                difficulty="基礎",
                question_text=r"判斷 $100:10$ 與 $500:50$ 是否相等。",
                answer_text="相等",
                explanation_text=r"兩者比值皆為 10。",
                topic_id="j2-3-1-equal-ratio-judge",
            ),
            question_row(
                id_="q-j2-3-1-word03-005",
                title="比例式求值（中等01）",
                chapter_code="j2-3-1",
                difficulty="中等",
                question_text=r"解比例式：$6:(x+2)=3:5$。",
                answer_text=r"$x=8$",
                explanation_text=r"$6\times5=3(x+2)\Rightarrow x+2=10$。",
                topic_id="j2-3-1-proportion-main",
            ),
            question_row(
                id_="q-j2-3-1-word03-006",
                title="比例式求值（中等02）",
                chapter_code="j2-3-1",
                difficulty="中等",
                question_text=r"解比例式：$(x-1):7=5:14$。",
                answer_text=r"$x=\frac{7}{2}$",
                explanation_text=r"$(x-1)\times14=7\times5\Rightarrow x-1=\frac{5}{2}$。",
                topic_id="j2-3-1-proportion-main",
            ),
            question_row(
                id_="q-j2-3-1-word03-007",
                title="按比分配（中等03）",
                chapter_code="j2-3-1",
                difficulty="中等",
                question_text=r"兄弟共有 3500 元，金額比 $4:3$，各有多少元？",
                answer_text=r"2000 元、1500 元",
                explanation_text=r"總份數 7 份，每份 500 元。",
                topic_id="j2-3-1-ratio-distribution",
            ),
            question_row(
                id_="q-j2-3-1-word03-008",
                title="按比分配（中等04）",
                chapter_code="j2-3-1",
                difficulty="中等",
                question_text=r"三人共有 4500 元，金額比 $4:3:2$，求三人各有多少元。",
                answer_text=r"2000 元、1500 元、1000 元",
                explanation_text=r"總份數 9 份，每份 500 元。",
                topic_id="j2-3-1-ratio-distribution",
            ),
            question_row(
                id_="q-j2-3-1-word03-009",
                title="連比轉換（進階01）",
                chapter_code="j2-3-1",
                difficulty="進階",
                question_text=r"已知 $a:b=2:3,\ b:c=4:5$，求 $a:b:c$。",
                answer_text=r"$8:12:15$",
                explanation_text=r"把中間項 $b$ 對齊為 12。",
                topic_id="j2-3-1-compound-ratio",
            ),
            question_row(
                id_="q-j2-3-1-word03-010",
                title="最簡連比（進階02）",
                chapter_code="j2-3-1",
                difficulty="進階",
                question_text=r"將連比 $2.5:0.25:\frac{1}{3}$ 化為最簡整數連比。",
                answer_text=r"$30:3:4$",
                explanation_text=r"同乘 12 得 $30:3:4$，三數互質。",
                topic_id="j2-3-1-minimal-compound-ratio",
            ),
            question_row(
                id_="q-j2-3-1-word03-011",
                title="比值綜合（進階03）",
                chapter_code="j2-3-1",
                difficulty="進階",
                question_text=r"若 $2x:3y=10:9$，求 $(x-y):(x+y)$ 的比值。",
                answer_text=r"$\frac{1}{4}$",
                explanation_text=r"由 $2x:3y=10:9$ 得 $x:y=5:3$，代入可得比值 $\frac{2}{8}$。",
                topic_id="j2-3-1-equal-ratio-judge",
            ),
            question_row(
                id_="q-j2-3-1-word03-012",
                title="單位一致（進階04）",
                chapter_code="j2-3-1",
                difficulty="進階",
                question_text=r"把 2 公尺：50 公分 化成最簡整數比。",
                answer_text=r"$4:1$",
                explanation_text=r"先統一單位：200 公分：50 公分。",
                topic_id="j2-3-1-simplify-integer-ratio",
            ),
        ]
    )

    # j2-3-2 (12)
    rows.extend(
        [
            question_row(
                id_="q-j2-3-2-word03-013",
                title="正比判斷（基礎01）",
                chapter_code="j2-3-2",
                difficulty="基礎",
                question_text=r"判斷 $y=4x$ 是否為正比關係。",
                answer_text="是",
                explanation_text=r"符合 $y=kx$ 形式。",
                topic_id="j2-3-2-direct-proportion",
            ),
            question_row(
                id_="q-j2-3-2-word03-014",
                title="反比判斷（基礎02）",
                chapter_code="j2-3-2",
                difficulty="基礎",
                question_text=r"判斷 $xy=30$ 是否為反比關係。",
                answer_text="是",
                explanation_text=r"乘積固定，符合反比。",
                topic_id="j2-3-2-inverse-proportion",
            ),
            question_row(
                id_="q-j2-3-2-word03-015",
                title="非正比判斷（基礎03）",
                chapter_code="j2-3-2",
                difficulty="基礎",
                question_text=r"判斷 $y=2x+3$ 是否為正比關係。",
                answer_text="否",
                explanation_text=r"不符合 $y=kx$（不通過原點）。",
                topic_id="j2-3-2-judgement-and-validation",
            ),
            question_row(
                id_="q-j2-3-2-word03-016",
                title="求正比常數（基礎04）",
                chapter_code="j2-3-2",
                difficulty="基礎",
                question_text=r"已知 $y$ 與 $x$ 成正比，且 $x=5,y=20$，求關係式。",
                answer_text=r"$y=4x$",
                explanation_text=r"$k=\frac{20}{5}=4$。",
                topic_id="j2-3-2-direct-proportion",
            ),
            question_row(
                id_="q-j2-3-2-word03-017",
                title="正比補值（中等01）",
                chapter_code="j2-3-2",
                difficulty="中等",
                question_text=r"若 $y=4x$，當 $x=7$ 時，$y$ 為何？",
                answer_text=r"$28$",
                explanation_text=r"直接代入 $y=4\times7$。",
                topic_id="j2-3-2-direct-proportion",
            ),
            question_row(
                id_="q-j2-3-2-word03-018",
                title="求反比常數（中等02）",
                chapter_code="j2-3-2",
                difficulty="中等",
                question_text=r"已知 $y$ 與 $x$ 成反比，且 $x=4,y=6$，求關係式。",
                answer_text=r"$y=\frac{24}{x}$",
                explanation_text=r"$k=xy=24$。",
                topic_id="j2-3-2-inverse-proportion",
            ),
            question_row(
                id_="q-j2-3-2-word03-019",
                title="反比補值（中等03）",
                chapter_code="j2-3-2",
                difficulty="中等",
                question_text=r"若 $xy=24$，當 $x=8$ 時，$y$ 為何？",
                answer_text=r"$3$",
                explanation_text=r"$y=\frac{24}{8}=3$。",
                topic_id="j2-3-2-inverse-proportion",
            ),
            question_row(
                id_="q-j2-3-2-word03-020",
                title="圖形判讀（中等04）",
                chapter_code="j2-3-2",
                difficulty="中等",
                question_text=r"正比例圖形一定通過哪一個點？",
                answer_text=r"原點 $(0,0)$",
                explanation_text=r"$y=kx$ 代入 $x=0$ 得 $y=0$。",
                topic_id="j2-3-2-direct-graph",
            ),
            question_row(
                id_="q-j2-3-2-word03-021",
                title="反比象限（進階01）",
                chapter_code="j2-3-2",
                difficulty="進階",
                question_text=r"若 $xy=-12$，其圖形主要落在哪兩象限？",
                answer_text=r"第二、第四象限",
                explanation_text=r"$k<0$ 時反比圖形在第二、四象限。",
                topic_id="j2-3-2-inverse-graph",
            ),
            question_row(
                id_="q-j2-3-2-word03-022",
                title="工程反比（進階02）",
                chapter_code="j2-3-2",
                difficulty="進階",
                question_text=r"同一工程 6 人做 10 天完成。若改成 15 人做，需幾天？",
                answer_text=r"4 天",
                explanation_text=r"人數與天數反比，$6\times10=15\times t$。",
                topic_id="j2-3-2-direct-inverse-application",
            ),
            question_row(
                id_="q-j2-3-2-word03-023",
                title="速率反比（進階03）",
                chapter_code="j2-3-2",
                difficulty="進階",
                question_text=r"固定距離下，甲速率是乙的 5:4，則甲、乙所花時間比為何？",
                answer_text=r"$4:5$",
                explanation_text=r"固定距離時時間與速率成反比。",
                topic_id="j2-3-2-direct-inverse-application",
            ),
            question_row(
                id_="q-j2-3-2-word03-024",
                title="綜合判斷（進階04）",
                chapter_code="j2-3-2",
                difficulty="進階",
                question_text=r"判斷下列敘述：$y-3$ 與 $x$ 成正比，則 $y$ 與 $x$ 成正比（對/錯）。",
                answer_text="錯",
                explanation_text=r"$y-3=kx\Rightarrow y=kx+3$，不符合 $y=kx$。",
                topic_id="j2-3-2-judgement-and-validation",
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
