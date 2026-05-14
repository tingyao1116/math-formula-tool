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

SOURCE_WORD = r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國一下2  二元一次方程式的圖形.docx"
SUMMARY_WORD = str(ROOT / "exports" / "word-j2-2-1-2" / "改國一下2_二元一次方程式的圖形_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j2-2-1": "座標概念",
    "j2-2-2": "二元一次方程式圖形",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j2-2-1-2-{ts}{path.suffix}"
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
    chapter_order = {"j2-2-1": 1, "j2-2-2": 2}[chapter_code]
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
        "domain": "函數與圖形",
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
        "originalIndex": 999220,
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

    # j2-2-1
    rows.append(
        topic_row(
            id_="j2-2-1-coordinate-main",
            title="直角座標平面核心觀念",
            chapter_code="j2-2-1",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("平面構成", r"$x$ 軸與 $y$ 軸交於原點 $O(0,0)$"),
                ("座標表示", r"$P(a,b)$ 中，$a$ 是 $x$ 座標、$b$ 是 $y$ 座標"),
            ],
            usage=["本章入口：座標判讀與畫點。"],
            examples=[r"$A(2,-3)$ 代表先往右 2，再往下 3。"],
            tips=["先看 $x$ 再看 $y$，順序不可交換。"],
            notes=["對應講義：平面座標系與座標表示法。"],
            mistakes=["把 $(a,b)$ 與 $(b,a)$ 當同一點。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-1-quadrant-sign-rules",
            title="象限與正負號判斷",
            chapter_code="j2-2-1",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j2-2-1-coordinate-main",
            is_branch=True,
            formula_lines=[
                ("四象限", r"I:(+,+),\ II:(-,+),\ III:(-,-),\ IV:(+,-)"),
                ("座標軸", r"$x$ 軸點 $(a,0)$、$y$ 軸點 $(0,b)$ 不屬於任何象限"),
            ],
            usage=["快速判定點所在區域。"],
            examples=[r"$(-3,4)$ 在第二象限；$(3,0)$ 在 $x$ 軸。"],
            tips=["只看正負號就能判象限，不需算距離。"],
            notes=["對應講義：象限章節。"],
            mistakes=["把座標軸上的點誤判成第一或第四象限。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-1-axis-distance",
            title="點到座標軸距離",
            chapter_code="j2-2-1",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j2-2-1-coordinate-main",
            is_branch=True,
            formula_lines=[
                ("到 $x$ 軸距離", r"$|y|$"),
                ("到 $y$ 軸距離", r"$|x|$"),
            ],
            usage=["條件反推座標與象限。"],
            examples=[r"$P(-4,6)$ 到 $x$ 軸距離為 6、到 $y$ 軸距離為 4。"],
            tips=["距離一定非負，記得用絕對值。"],
            notes=["對應講義：距離與象限綜合題。"],
            mistakes=["距離直接用座標值，忽略負號。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-1-midpoint-formula",
            title="中點座標公式",
            chapter_code="j2-2-1",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j2-2-1-coordinate-main",
            is_branch=True,
            formula_lines=[
                ("數線中點", r"$\left(\frac{a+b}{2}\right)$"),
                ("平面中點", r"$M\left(\frac{x_1+x_2}{2},\frac{y_1+y_2}{2}\right)$"),
            ],
            usage=["兩點中間位置與分點前置題。"],
            examples=[r"$A(-2,4),B(6,-2)$ 的中點是 $(2,1)$。"],
            tips=["分別對 $x$、$y$ 坐標取平均。"],
            notes=["對應講義：中點公式。"],
            mistakes=["只平均一個座標或分母寫錯。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-1-axis-parallel-distance",
            title="同軸平行距離",
            chapter_code="j2-2-1",
            chapter_role="分支題型",
            difficulty="基礎",
            parent_id="j2-2-1-coordinate-main",
            is_branch=True,
            formula_lines=[
                ("同 $x$ 座標", r"$|y_1-y_2|$"),
                ("同 $y$ 座標", r"$|x_1-x_2|$"),
            ],
            usage=["垂直或水平線段長度。"],
            examples=[r"$(5,3)$ 與 $(5,-4)$ 距離是 $|3-(-4)|=7$。"],
            tips=["先確認兩點是否同 $x$ 或同 $y$。"],
            notes=["對應講義：座標距離應用。"],
            mistakes=["誤用一般距離公式，計算複雜化。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-1-coordinate-transform",
            title="座標平移與位移應用",
            chapter_code="j2-2-1",
            chapter_role="典型題型",
            difficulty="中等",
            parent_id="j2-2-1-coordinate-main",
            is_branch=True,
            formula_lines=[
                ("平移規則", r"右 $h$、上 $k$：$(x,y)\to(x+h,y+k)$"),
                ("反向平移", r"左/下以減法處理"),
            ],
            usage=["路徑位移與棋盤座標應用。"],
            examples=[r"$A(-5,2)$ 先上 5 再左 6 到 $( -11,7)$。"],
            tips=["按題目順序逐步更新座標。"],
            notes=["對應講義：座標應用題。"],
            mistakes=["把左右與上下方向加減弄反。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-1-parameter-quadrant",
            title="參數與象限限制題",
            chapter_code="j2-2-1",
            chapter_role="進階題型",
            difficulty="進階",
            parent_id="j2-2-1-coordinate-main",
            is_branch=True,
            formula_lines=[
                ("不在象限", r"表示點在座標軸上：$x=0$ 或 $y=0$"),
                ("象限限制", r"依正負號條件聯立參數不等式"),
            ],
            usage=["條件反求參數。"],
            examples=[r"$P(2a+1,3a-1)$ 不在象限內 $\Rightarrow 2a+1=0$ 或 $3a-1=0$。"],
            tips=["先把語句轉成『等於 0』或『大於小於 0』。"],
            notes=["對應講義：參數象限題。"],
            mistakes=["把『不在任何象限』誤解成『在四象限都可』。"],
        )
    )

    # j2-2-2
    rows.append(
        topic_row(
            id_="j2-2-2-line-graph-main",
            title="二元一次方程式圖形核心觀念",
            chapter_code="j2-2-2",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("直線形式", r"$ax+by=c$ 的圖形是一直線"),
                ("作圖原則", r"兩點可決定一直線"),
            ],
            usage=["本章入口：方程與圖形對應。"],
            examples=[r"$2x+y=4$ 可先找截距點作圖。"],
            tips=["先取簡單點（截距）再連線。"],
            notes=["對應講義：二元一次方程式圖形。"],
            mistakes=["只取一點就直接畫線。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-2-intercepts-plotting",
            title="截距法作圖",
            chapter_code="j2-2-2",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j2-2-2-line-graph-main",
            is_branch=True,
            formula_lines=[
                ("$x$ 截距", r"令 $y=0$"),
                ("$y$ 截距", r"令 $x=0$"),
            ],
            usage=["快速畫出二元一次方程式直線。"],
            examples=[r"$2x+y=4$ 截距為 $(2,0)$ 與 $(0,4)$。"],
            tips=["先解出兩個截距，再檢查是否同點。"],
            notes=["對應講義：作圖步驟。"],
            mistakes=["把 $x$ 截距和 $y$ 截距代值顛倒。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-2-special-lines",
            title="特殊直線（平行座標軸）",
            chapter_code="j2-2-2",
            chapter_role="分支題型",
            difficulty="基礎",
            parent_id="j2-2-2-line-graph-main",
            is_branch=True,
            formula_lines=[
                ("垂直線", r"$x=k$，平行 $y$ 軸"),
                ("水平線", r"$y=k$，平行 $x$ 軸"),
            ],
            usage=["判讀圖形方向與快速寫式。"],
            examples=[r"通過 $(-5,30)$ 且平行 $y$ 軸的直線為 $x=-5$。"],
            tips=["看是固定 $x$ 還是固定 $y$。"],
            notes=["對應講義：特殊直線題。"],
            mistakes=["把 $x=k$ 與 $y=k$ 搞反。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-2-system-graph-solution",
            title="聯立方程式圖解法",
            chapter_code="j2-2-2",
            chapter_role="重要配角",
            difficulty="中等",
            parent_id="j2-2-2-line-graph-main",
            is_branch=True,
            formula_lines=[
                ("圖解意義", r"兩條直線交點即聯立方程式解"),
                ("驗算", r"交點需代回兩式皆成立"),
            ],
            usage=["視覺化理解聯立解。"],
            examples=[r"$y=2x-4$ 與 $y=-x+5$ 交於 $(3,2)$。"],
            tips=["畫圖粗估後再用代數精算交點。"],
            notes=["對應講義：二元一次聯立圖解。"],
            mistakes=["只看圖估點未代回驗算。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-2-line-relations",
            title="兩直線關係判斷",
            chapter_code="j2-2-2",
            chapter_role="分支題型",
            difficulty="進階",
            parent_id="j2-2-2-line-graph-main",
            is_branch=True,
            formula_lines=[
                ("相交", r"$\frac{a_1}{a_2}\neq\frac{b_1}{b_2}$"),
                ("重合", r"$\frac{a_1}{a_2}=\frac{b_1}{b_2}=\frac{c_1}{c_2}$"),
                ("平行", r"$\frac{a_1}{a_2}=\frac{b_1}{b_2}\neq\frac{c_1}{c_2}$"),
            ],
            usage=["快速判斷解的個數。"],
            examples=[r"$2x+3y=6$ 與 $2x+3y=-6$ 平行，無解。"],
            tips=["判斷前先整理成標準型 $ax+by=c$。"],
            notes=["對應講義：相交/平行/重合。"],
            mistakes=["只比前兩項係數，忘記常數項比例。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-2-intersection-parameter",
            title="交點條件反求參數",
            chapter_code="j2-2-2",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j2-2-2-line-graph-main",
            is_branch=True,
            formula_lines=[
                ("交點已知", r"把交點 $(x_0,y_0)$ 代入兩式求參數"),
                ("同解條件", r"兩式有相同交點可聯立求係數"),
            ],
            usage=["已知交點與條件求 $a,b,k$。"],
            examples=[r"若交點在 $x=1$ 上，可先由一式求 $y$ 再代另一式。"],
            tips=["分兩步：先求完整交點，再求參數。"],
            notes=["對應講義：交點與係數題。"],
            mistakes=["代入時只用一條式子導致條件不足。"],
        )
    )
    rows.append(
        topic_row(
            id_="j2-2-2-graph-validation",
            title="圖形結果檢核",
            chapter_code="j2-2-2",
            chapter_role="易錯陷阱",
            difficulty="基礎",
            parent_id="j2-2-2-line-graph-main",
            is_branch=True,
            formula_lines=[
                ("雙重檢查", r"作圖觀察 + 代數代回"),
                ("合理性", r"截距、交點、平行性三者需一致"),
            ],
            usage=["減少畫圖誤差造成錯判。"],
            examples=[r"判成平行時，代數也應算出無解。"],
            tips=["先算關係再畫圖，檢查更穩。"],
            notes=["本章收尾檢核。"],
            mistakes=["只相信草圖，不做代數確認。"],
        )
    )

    return rows


def build_questions() -> List[Dict]:
    rows = []

    # j2-2-1 (12)
    rows.extend(
        [
            question_row(
                id_="q-j2-2-1-word02-001",
                title="象限判斷（基礎01）",
                chapter_code="j2-2-1",
                difficulty="基礎",
                question_text=r"點 $A(2,-3)$ 在哪一象限？",
                answer_text="第四象限",
                explanation_text=r"$x>0,\ y<0$，故在第四象限。",
                topic_id="j2-2-1-quadrant-sign-rules",
            ),
            question_row(
                id_="q-j2-2-1-word02-002",
                title="象限判斷（基礎02）",
                chapter_code="j2-2-1",
                difficulty="基礎",
                question_text=r"點 $B(-4,5)$ 在哪一象限？",
                answer_text="第二象限",
                explanation_text=r"$x<0,\ y>0$，故在第二象限。",
                topic_id="j2-2-1-quadrant-sign-rules",
            ),
            question_row(
                id_="q-j2-2-1-word02-003",
                title="座標軸判斷（基礎03）",
                chapter_code="j2-2-1",
                difficulty="基礎",
                question_text=r"點 $(3,0)$ 在哪裡？是否屬於象限？",
                answer_text=r"在 $x$ 軸上，不屬於任何象限",
                explanation_text=r"$y=0$ 代表在 $x$ 軸。",
                topic_id="j2-2-1-quadrant-sign-rules",
            ),
            question_row(
                id_="q-j2-2-1-word02-004",
                title="到座標軸距離（基礎04）",
                chapter_code="j2-2-1",
                difficulty="基礎",
                question_text=r"點 $P(-4,6)$ 到 $x$ 軸、$y$ 軸的距離分別是多少？",
                answer_text=r"6、4",
                explanation_text=r"到 $x$ 軸是 $|y|=6$，到 $y$ 軸是 $|x|=4$。",
                topic_id="j2-2-1-axis-distance",
            ),
            question_row(
                id_="q-j2-2-1-word02-005",
                title="平面中點（中等01）",
                chapter_code="j2-2-1",
                difficulty="中等",
                question_text=r"求 $A(2,4)$ 與 $B(6,-2)$ 的中點座標。",
                answer_text=r"$(4,1)$",
                explanation_text=r"$M=\left(\frac{2+6}{2},\frac{4+(-2)}{2}\right)=(4,1)$。",
                topic_id="j2-2-1-midpoint-formula",
            ),
            question_row(
                id_="q-j2-2-1-word02-006",
                title="數線中點（中等02）",
                chapter_code="j2-2-1",
                difficulty="中等",
                question_text=r"數線上點 $A(-3)$、$B(11)$ 的中點座標為何？",
                answer_text=r"4",
                explanation_text=r"$\frac{-3+11}{2}=4$。",
                topic_id="j2-2-1-midpoint-formula",
            ),
            question_row(
                id_="q-j2-2-1-word02-007",
                title="同 $x$ 座標距離（中等03）",
                chapter_code="j2-2-1",
                difficulty="中等",
                question_text=r"兩點 $(5,3)$ 與 $(5,-4)$ 的距離是多少？",
                answer_text=r"7",
                explanation_text=r"同 $x$ 座標，距離為 $|3-(-4)|=7$。",
                topic_id="j2-2-1-axis-parallel-distance",
            ),
            question_row(
                id_="q-j2-2-1-word02-008",
                title="同 $y$ 座標距離（中等04）",
                chapter_code="j2-2-1",
                difficulty="中等",
                question_text=r"兩點 $(-2,1)$ 與 $(4,1)$ 的距離是多少？",
                answer_text=r"6",
                explanation_text=r"同 $y$ 座標，距離為 $|4-(-2)|=6$。",
                topic_id="j2-2-1-axis-parallel-distance",
            ),
            question_row(
                id_="q-j2-2-1-word02-009",
                title="距離反推座標（進階01）",
                chapter_code="j2-2-1",
                difficulty="進階",
                question_text=r"點 $P$ 在第二象限，且到 $x$ 軸距離為 6、到 $y$ 軸距離為 4，求 $P$。",
                answer_text=r"$(-4,6)$",
                explanation_text=r"第二象限代表 $x<0,y>0$，配合距離得 $(x,y)=(-4,6)$。",
                topic_id="j2-2-1-axis-distance",
            ),
            question_row(
                id_="q-j2-2-1-word02-010",
                title="不在象限（進階02）",
                chapter_code="j2-2-1",
                difficulty="進階",
                question_text=r"若點 $P(-3,y)$ 不在任何象限，求 $y$。",
                answer_text=r"$y=0$",
                explanation_text=r"不在象限代表在座標軸上；因 $x\neq 0$，故必在 $x$ 軸上，所以 $y=0$。",
                topic_id="j2-2-1-parameter-quadrant",
            ),
            question_row(
                id_="q-j2-2-1-word02-011",
                title="參數象限題（進階03）",
                chapter_code="j2-2-1",
                difficulty="進階",
                question_text=r"點 $P(2a+1,3a-1)$ 不在任何象限，求 $a$。",
                answer_text=r"$a=-\frac{1}{2}$ 或 $a=\frac{1}{3}$",
                explanation_text=r"不在象限 $\Rightarrow x=0$ 或 $y=0$，故 $2a+1=0$ 或 $3a-1=0$。",
                topic_id="j2-2-1-parameter-quadrant",
            ),
            question_row(
                id_="q-j2-2-1-word02-012",
                title="座標順序（進階04）",
                chapter_code="j2-2-1",
                difficulty="進階",
                question_text=r"比較 $A(2,3)$ 與 $B(3,2)$：兩點是否相同？",
                answer_text=r"不同點",
                explanation_text=r"座標有序，$(2,3)\neq(3,2)$。",
                topic_id="j2-2-1-coordinate-main",
            ),
        ]
    )

    # j2-2-2 (12)
    rows.extend(
        [
            question_row(
                id_="q-j2-2-2-word02-013",
                title="截距作圖（基礎01）",
                chapter_code="j2-2-2",
                difficulty="基礎",
                question_text=r"求直線 $2x+y=4$ 的 $x$ 截距與 $y$ 截距。",
                answer_text=r"$(2,0)$、$(0,4)$",
                explanation_text=r"令 $y=0$ 得 $x=2$；令 $x=0$ 得 $y=4$。",
                topic_id="j2-2-2-intercepts-plotting",
            ),
            question_row(
                id_="q-j2-2-2-word02-014",
                title="特殊直線（基礎02）",
                chapter_code="j2-2-2",
                difficulty="基礎",
                question_text=r"直線 $x=3$ 平行哪一條座標軸？",
                answer_text=r"$y$ 軸",
                explanation_text=r"$x$ 固定不變，故是垂直線，平行 $y$ 軸。",
                topic_id="j2-2-2-special-lines",
            ),
            question_row(
                id_="q-j2-2-2-word02-015",
                title="特殊直線（基礎03）",
                chapter_code="j2-2-2",
                difficulty="基礎",
                question_text=r"直線 $y=-2$ 平行哪一條座標軸？",
                answer_text=r"$x$ 軸",
                explanation_text=r"$y$ 固定不變，故是水平線，平行 $x$ 軸。",
                topic_id="j2-2-2-special-lines",
            ),
            question_row(
                id_="q-j2-2-2-word02-016",
                title="關係判斷（中等01）",
                chapter_code="j2-2-2",
                difficulty="中等",
                question_text=r"判斷聯立 $\begin{cases}x+y=2\\x-y=0\end{cases}$ 的解型態。",
                answer_text=r"一組解",
                explanation_text=r"$\frac{1}{1}\neq\frac{1}{-1}$，兩線相交。",
                topic_id="j2-2-2-line-relations",
            ),
            question_row(
                id_="q-j2-2-2-word02-017",
                title="重合判斷（中等02）",
                chapter_code="j2-2-2",
                difficulty="中等",
                question_text=r"判斷聯立 $\begin{cases}2x+3y=6\\4x+6y=12\end{cases}$ 的解型態。",
                answer_text=r"無限多解",
                explanation_text=r"三組比例相同，兩線重合。",
                topic_id="j2-2-2-line-relations",
            ),
            question_row(
                id_="q-j2-2-2-word02-018",
                title="平行判斷（中等03）",
                chapter_code="j2-2-2",
                difficulty="中等",
                question_text=r"判斷聯立 $\begin{cases}2x+3y=6\\2x+3y=-6\end{cases}$ 的解型態。",
                answer_text=r"無解",
                explanation_text=r"前兩項比例相同但常數不同，兩線平行。",
                topic_id="j2-2-2-line-relations",
            ),
            question_row(
                id_="q-j2-2-2-word02-019",
                title="圖解交點（中等04）",
                chapter_code="j2-2-2",
                difficulty="中等",
                question_text=r"求直線 $y=2x-4$ 與 $y=-x+5$ 的交點。",
                answer_text=r"$(3,2)$",
                explanation_text=r"令 $2x-4=-x+5$ 得 $x=3$，代回得 $y=2$。",
                topic_id="j2-2-2-system-graph-solution",
            ),
            question_row(
                id_="q-j2-2-2-word02-020",
                title="交點驗算（中等05）",
                chapter_code="j2-2-2",
                difficulty="中等",
                question_text=r"判斷點 $(1,1)$ 是否為聯立 $\begin{cases}2x-3y=-1\\x+y=2\end{cases}$ 的解。",
                answer_text=r"是",
                explanation_text=r"代入兩式皆成立：$2(1)-3(1)=-1,\ 1+1=2$。",
                topic_id="j2-2-2-system-graph-solution",
            ),
            question_row(
                id_="q-j2-2-2-word02-021",
                title="交點反求係數（進階01）",
                chapter_code="j2-2-2",
                difficulty="進階",
                question_text=r"兩線 $3x-2y=5$ 與 $ax+y=7$ 的交點在 $x=1$ 上，求 $a$。",
                answer_text=r"$a=8$",
                explanation_text=r"先由第一式得交點 $y=-1$，代入第二式：$a-1=7$。",
                topic_id="j2-2-2-intersection-parameter",
            ),
            question_row(
                id_="q-j2-2-2-word02-022",
                title="截距綜合（進階02）",
                chapter_code="j2-2-2",
                difficulty="進階",
                question_text=r"直線 $4x-3y=-12$ 與 $x$ 軸交於 $(a,0)$、與 $y$ 軸交於 $(0,b)$，求 $a+b$。",
                answer_text=r"1",
                explanation_text=r"$y=0\Rightarrow a=-3$；$x=0\Rightarrow b=4$，故 $a+b=1$。",
                topic_id="j2-2-2-intercepts-plotting",
            ),
            question_row(
                id_="q-j2-2-2-word02-023",
                title="平行 $y$ 軸（進階03）",
                chapter_code="j2-2-2",
                difficulty="進階",
                question_text=r"通過點 $(-5,30)$ 且平行 $y$ 軸的直線方程式為何？",
                answer_text=r"$x=-5$",
                explanation_text=r"平行 $y$ 軸的直線是 $x=\text{常數}$，代入點得常數為 $-5$。",
                topic_id="j2-2-2-special-lines",
            ),
            question_row(
                id_="q-j2-2-2-word02-024",
                title="同解判斷（進階04）",
                chapter_code="j2-2-2",
                difficulty="進階",
                question_text=r"判斷聯立 $\begin{cases}3x-6y=9\\x-2y=3\end{cases}$ 的解型態。",
                answer_text=r"無限多解",
                explanation_text=r"第一式為第二式乘 3，兩線重合。",
                topic_id="j2-2-2-graph-validation",
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
