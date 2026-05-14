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
    r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國一下4  函數與其圖形.docx"
)
SUMMARY_WORD = str(ROOT / "exports" / "word-j4-2" / "改國一下4_函數與其圖形_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j4-2": "線型函數",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j4-2-{ts}{path.suffix}"
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
    chapter = CHAPTER_NAME[chapter_code]
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "國中",
        "grade": "國一",
        "term": "下學期",
        "chapter": chapter,
        "domain": "函數與圖形",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", chapter_code, chapter],
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes + [f"來源：{SOURCE_REF}"],
        "mistakes": mistakes,
        "contentTypes": ["觀念", "公式", "例題", "練習"],
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
        "grade": "國一",
        "chapter": chapter,
        "difficulty": difficulty,
        "source_type": "word_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    return [
        topic_row(
            id_="j4-2-function-definition",
            title="函數基本定義",
            chapter_code="j4-2",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("函數", r"$y=f(x)$"),
                ("判斷", r"$\forall x,\ \text{最多對應一個 }y$"),
            ],
            usage=["用來判斷一組對應是否符合函數定義。"],
            examples=[r"$x=1$ 只能對應一個 $y$ 才是函數。"],
            tips=["先檢查是否有同一個輸入對應兩個輸出。"],
            notes=["函數定義是後續圖形與方程的基礎。"],
            mistakes=["把一對多對應誤判為函數。"],
        ),
        topic_row(
            id_="j4-2-domain-range",
            title="定義域與值域",
            chapter_code="j4-2",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("定義域", r"$D_f=\{x\mid f(x)\ \text{有意義}\}$"),
                ("值域", r"$R_f=\{f(x)\mid x\in D_f\}$"),
            ],
            usage=["求函數可代入範圍與輸出範圍。"],
            examples=[r"$f(x)=\frac{1}{x}$ 的定義域是 $x\neq0$。"],
            tips=["分母不能為零，偶次根號內要非負。"],
            notes=["定義域錯誤會讓後面整題失效。"],
            mistakes=["只看式子不檢查限制條件。"],
        ),
        topic_row(
            id_="j4-2-function-evaluation",
            title="函數值與代入",
            chapter_code="j4-2",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[
                ("代入", r"$f(a)$ 表示把 $x=a$ 代入"),
                ("多層代入", r"$f(f(a))$"),
            ],
            usage=["計算指定輸入對應的輸出。"],
            examples=[r"$f(x)=2x-3,\ f(4)=5$。"],
            tips=["代入負數要加括號，例如 $f(-2)$。"],
            notes=["符號運算正確比心算快更重要。"],
            mistakes=["少括號造成正負號錯誤。"],
        ),
        topic_row(
            id_="j4-2-linear-form",
            title="線型函數標準式",
            chapter_code="j4-2",
            chapter_role="核心公式",
            difficulty="基礎",
            formula_lines=[
                ("標準式", r"$y=ax+b$"),
                ("參數", r"$a:\text{斜率},\ b:\text{y 截距}$"),
            ],
            usage=["判斷是否為線型函數並讀出參數。"],
            examples=[r"$y=-3x+5$ 的斜率是 $-3$，$y$ 截距是 $5$。"],
            tips=["先看是否能化成 $y=ax+b$。"],
            notes=["線型函數圖形是一直線。"],
            mistakes=["把常數項誤當斜率。"],
        ),
        topic_row(
            id_="j4-2-slope-change",
            title="斜率與增減性",
            chapter_code="j4-2",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("斜率", r"$m=\dfrac{\Delta y}{\Delta x}$"),
                ("增減", r"$a>0\Rightarrow\text{遞增},\ a<0\Rightarrow\text{遞減}$"),
            ],
            usage=["從函數式或圖形判斷上升下降。"],
            examples=[r"$y=2x-1$ 遞增，$y=-\frac{1}{2}x+3$ 遞減。"],
            tips=["斜率絕對值越大，線越陡。"],
            notes=["斜率是圖形判讀關鍵。"],
            mistakes=["誤以為斜率負就不能有正截距。"],
        ),
        topic_row(
            id_="j4-2-intercepts",
            title="x 截距與 y 截距",
            chapter_code="j4-2",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("y 截距", r"$x=0\Rightarrow y=b$"),
                ("x 截距", r"$y=0\Rightarrow x=-\dfrac{b}{a}\ (a\neq0)$"),
            ],
            usage=["快速由方程式找與座標軸交點。"],
            examples=[r"$y=2x-6$ 的截距為 $(3,0)$ 與 $(0,-6)$。"],
            tips=["先分清楚是在 x 軸上還是 y 軸上。"],
            notes=["截距在畫圖時可當兩個定位點。"],
            mistakes=["把 x 截距寫成 $b$。"],
        ),
        topic_row(
            id_="j4-2-two-point-line",
            title="兩點求線型函數",
            chapter_code="j4-2",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("斜率", r"$m=\dfrac{y_2-y_1}{x_2-x_1}$"),
                ("點斜式", r"$y-y_1=m(x-x_1)$"),
            ],
            usage=["由兩個已知點反推函數式。"],
            examples=[r"經過 $(1,2),(3,6)$ 的直線為 $y=2x$。"],
            tips=["先求斜率，再用一點求常數。"],
            notes=["兩點法是段考高頻題。"],
            mistakes=["斜率分子分母顛倒。"],
        ),
        topic_row(
            id_="j4-2-line-intersection",
            title="兩直線交點與聯立",
            chapter_code="j4-2",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("交點", r"$\begin{cases}y=a_1x+b_1\\y=a_2x+b_2\end{cases}$"),
                ("意義", r"$\text{交點座標}=\text{聯立解}$"),
            ],
            usage=["由圖形或方程找兩線相交位置。"],
            examples=[r"$y=2x+1$ 與 $y=-x+7$ 交於 $(2,5)$。"],
            tips=["先令右邊相等求 $x$，再回代求 $y$。"],
            notes=["平行線斜率相同、無交點。"],
            mistakes=["解出 $x$ 後忘記回代求 $y$。"],
        ),
        topic_row(
            id_="j4-2-graph-reading",
            title="圖形判讀與比較",
            chapter_code="j4-2",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("比較", r"$|a|\ \text{越大，圖形越陡}$"),
                ("平移", r"$y=ax+b\Rightarrow b\ \text{改變上下位置}$"),
            ],
            usage=["不完整方程時，用圖形比較斜率與截距。"],
            examples=[r"兩條線同斜率代表平行。"],
            tips=["先看方向（升降），再看陡度與截距。"],
            notes=["圖形閱讀是應用題轉譯能力。"],
            mistakes=["只看截距不看斜率。"],
        ),
        topic_row(
            id_="j4-2-word-model-linear",
            title="線型函數文字建模",
            chapter_code="j4-2",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("建模", r"$\text{固定費}+(\text{單價})x$"),
                ("線型", r"$y=ax+b$"),
            ],
            usage=["處理計程費、電費、距離時間等一次關係。"],
            examples=[r"起跳價 $b$，每公里加收 $a$，可寫成 $y=ax+b$。"],
            tips=["先找『固定量』與『每單位變化量』。"],
            notes=["最後要回到情境確認答案合理。"],
            mistakes=["把固定費放到斜率位置。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j4-2-word04-001",
            title="函數判斷（基礎01）",
            chapter_code="j4-2",
            difficulty="基礎",
            question_text="對應關係中，若同一個 x 對應兩個不同 y，是否為函數？",
            answer_text="不是函數。",
            explanation_text="函數要求每個輸入最多只能對應一個輸出。",
            topic_id="j4-2-function-definition",
        ),
        question_row(
            id_="q-j4-2-word04-002",
            title="定義域（基礎02）",
            chapter_code="j4-2",
            difficulty="基礎",
            question_text=r"求函數 $f(x)=\dfrac{5}{x-2}$ 的定義域。",
            answer_text=r"$x\neq2$",
            explanation_text=r"分母不可為 $0$，所以 $x-2\neq0$。",
            topic_id="j4-2-domain-range",
        ),
        question_row(
            id_="q-j4-2-word04-003",
            title="函數值（基礎03）",
            chapter_code="j4-2",
            difficulty="基礎",
            question_text=r"若 $f(x)=3x-4$，求 $f(5)$。",
            answer_text=r"$11$",
            explanation_text=r"$f(5)=3\cdot5-4=11$。",
            topic_id="j4-2-function-evaluation",
        ),
        question_row(
            id_="q-j4-2-word04-004",
            title="線型判讀（基礎04）",
            chapter_code="j4-2",
            difficulty="基礎",
            question_text=r"函數 $y=-2x+7$ 的斜率與 $y$ 截距各是多少？",
            answer_text=r"斜率 $-2$，$y$ 截距 $7$。",
            explanation_text=r"對照 $y=ax+b$，$a=-2,b=7$。",
            topic_id="j4-2-linear-form",
        ),
        question_row(
            id_="q-j4-2-word04-005",
            title="增減判斷（基礎05）",
            chapter_code="j4-2",
            difficulty="基礎",
            question_text=r"函數 $y=\frac{1}{2}x-3$ 是遞增還是遞減？",
            answer_text="遞增。",
            explanation_text=r"斜率 $a=\frac{1}{2}>0$，所以遞增。",
            topic_id="j4-2-slope-change",
        ),
        question_row(
            id_="q-j4-2-word04-006",
            title="x 截距（中等01）",
            chapter_code="j4-2",
            difficulty="中等",
            question_text=r"求直線 $y=3x-12$ 的 $x$ 截距。",
            answer_text=r"$4$",
            explanation_text=r"令 $y=0$，得 $3x-12=0\Rightarrow x=4$。",
            topic_id="j4-2-intercepts",
        ),
        question_row(
            id_="q-j4-2-word04-007",
            title="兩點求式（中等02）",
            chapter_code="j4-2",
            difficulty="中等",
            question_text=r"通過點 $(1,2)$、$(3,6)$ 的線型函數為何？",
            answer_text=r"$y=2x$",
            explanation_text=r"斜率 $m=\frac{6-2}{3-1}=2$，代入 $(1,2)$ 得 $b=0$。",
            topic_id="j4-2-two-point-line",
        ),
        question_row(
            id_="q-j4-2-word04-008",
            title="交點求解（中等03）",
            chapter_code="j4-2",
            difficulty="中等",
            question_text=r"求直線 $y=2x+1$ 與 $y=-x+7$ 的交點。",
            answer_text=r"$(2,5)$",
            explanation_text=r"令 $2x+1=-x+7$ 得 $x=2$，回代得 $y=5$。",
            topic_id="j4-2-line-intersection",
        ),
        question_row(
            id_="q-j4-2-word04-009",
            title="代入與比較（中等04）",
            chapter_code="j4-2",
            difficulty="中等",
            question_text=r"若 $f(x)=2x+3$，求 $f(-2)$ 與 $f(4)$ 的大小關係。",
            answer_text=r"$f(-2)<f(4)$",
            explanation_text=r"$f(-2)=-1,\ f(4)=11$，所以 $-1<11$。",
            topic_id="j4-2-function-evaluation",
        ),
        question_row(
            id_="q-j4-2-word04-010",
            title="斜率比較（中等05）",
            chapter_code="j4-2",
            difficulty="中等",
            question_text=r"比較直線 $y=4x+1$ 與 $y=\frac{1}{2}x+1$，哪一條較陡？",
            answer_text=r"$y=4x+1$ 較陡。",
            explanation_text=r"因為斜率絕對值 $|4|>|1/2|$。",
            topic_id="j4-2-graph-reading",
        ),
        question_row(
            id_="q-j4-2-word04-011",
            title="平行情況（中等06）",
            chapter_code="j4-2",
            difficulty="中等",
            question_text=r"直線 $y=3x-2$ 與 $y=3x+5$ 是否相交？",
            answer_text="不相交（平行）。",
            explanation_text="兩線斜率相同、截距不同，所以平行。",
            topic_id="j4-2-line-intersection",
        ),
        question_row(
            id_="q-j4-2-word04-012",
            title="y 截距（中等07）",
            chapter_code="j4-2",
            difficulty="中等",
            question_text=r"直線 $y=-5x+9$ 的 $y$ 截距是什麼？",
            answer_text=r"$9$",
            explanation_text=r"令 $x=0$，得到 $y=9$。",
            topic_id="j4-2-intercepts",
        ),
        question_row(
            id_="q-j4-2-word04-013",
            title="由條件求式（中等08）",
            chapter_code="j4-2",
            difficulty="中等",
            question_text=r"已知直線斜率為 $-2$ 且通過點 $(0,4)$，求方程式。",
            answer_text=r"$y=-2x+4$",
            explanation_text=r"由 $y=ax+b$，$a=-2$ 且 $(0,4)$ 得 $b=4$。",
            topic_id="j4-2-linear-form",
        ),
        question_row(
            id_="q-j4-2-word04-014",
            title="兩點斜率（中等09）",
            chapter_code="j4-2",
            difficulty="中等",
            question_text=r"求通過 $(2,-1)$ 與 $(6,7)$ 直線的斜率。",
            answer_text=r"$2$",
            explanation_text=r"$m=\dfrac{7-(-1)}{6-2}=\dfrac{8}{4}=2$。",
            topic_id="j4-2-two-point-line",
        ),
        question_row(
            id_="q-j4-2-word04-015",
            title="值域判讀（中等10）",
            chapter_code="j4-2",
            difficulty="中等",
            question_text=r"函數 $y=2x-1$，當 $x\ge0$ 時，$y$ 的最小值是多少？",
            answer_text=r"$-1$",
            explanation_text=r"$x=0$ 時最小，故 $y=-1$。",
            topic_id="j4-2-domain-range",
        ),
        question_row(
            id_="q-j4-2-word04-016",
            title="計程費建模（進階01）",
            chapter_code="j4-2",
            difficulty="進階",
            question_text="某車資起跳 85 元，每公里加收 20 元，行駛 x 公里費用 y 為何？",
            answer_text=r"$y=20x+85$",
            explanation_text="固定費是截距 85，每公里增加量是斜率 20。",
            topic_id="j4-2-word-model-linear",
        ),
        question_row(
            id_="q-j4-2-word04-017",
            title="成本函數（進階02）",
            chapter_code="j4-2",
            difficulty="進階",
            question_text="生產成本固定 300 元，每件增加 12 元，生產 x 件總成本 C(x) 為何？",
            answer_text=r"$C(x)=12x+300$",
            explanation_text="固定成本放常數項，變動成本放 x 的係數。",
            topic_id="j4-2-word-model-linear",
        ),
        question_row(
            id_="q-j4-2-word04-018",
            title="交點情境（進階03）",
            chapter_code="j4-2",
            difficulty="進階",
            question_text="甲方案費用 y=15x+100，乙方案費用 y=25x+40，何時費用相同？",
            answer_text=r"$x=6$",
            explanation_text=r"令 $15x+100=25x+40$，解得 $x=6$。",
            topic_id="j4-2-line-intersection",
        ),
        question_row(
            id_="q-j4-2-word04-019",
            title="逆向求參數（進階04）",
            chapter_code="j4-2",
            difficulty="進階",
            question_text=r"函數 $y=ax+4$ 經過點 $(3,10)$，求 $a$。",
            answer_text=r"$2$",
            explanation_text=r"$10=3a+4\Rightarrow a=2$。",
            topic_id="j4-2-linear-form",
        ),
        question_row(
            id_="q-j4-2-word04-020",
            title="圖形推理（進階05）",
            chapter_code="j4-2",
            difficulty="進階",
            question_text=r"兩直線分別為 $y=-x+6$、$y=2x-3$，交點座標為何？",
            answer_text=r"$(3,3)$",
            explanation_text=r"令 $-x+6=2x-3$ 得 $x=3$，回代得 $y=3$。",
            topic_id="j4-2-line-intersection",
        ),
    ]


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
            "topic_question_link_output": link_out.splitlines()[-8:],
            "web_sync_code": sync_code,
            "web_sync_output": sync_out.splitlines()[-8:],
        },
        "sample": {
            "topic_ids": topic_ids[:3],
            "question_ids": question_ids[:3],
        },
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
