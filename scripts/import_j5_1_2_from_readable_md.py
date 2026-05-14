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
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三上1_比例線段_整理\改國三上1_比例線段_易讀版.md"
)
SOURCE_REF = f"{Path(SOURCE_MD).name}（重點整理匯入）"

CHAPTER_CODE = "j5-1-2"
CHAPTER_NAME = "比例線段"

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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j5-1-2-{ts}{path.suffix}"
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
    chapter_role: str,
    difficulty: str,
    formula_lines: List[Tuple[str, str]],
    usage: List[str],
    examples: List[str],
    tips: List[str],
    notes: List[str],
    mistakes: List[str],
) -> Dict:
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "國中",
        "grade": "國三",
        "term": "上學期",
        "chapter": CHAPTER_NAME,
        "chapterCode": CHAPTER_CODE,
        "domain": "幾何",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", CHAPTER_CODE, CHAPTER_NAME, "比例"],
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes + [f"來源：{SOURCE_REF}"],
        "mistakes": mistakes,
        "contentTypes": ["核心觀念", "重點式", "教學目標", "分支"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": now_iso(),
    }


def question_row(
    *,
    id_: str,
    title: str,
    difficulty: str,
    question_text: str,
    answer_text: str,
    explanation_text: str,
    topic_id: str,
) -> Dict:
    return {
        "id": id_,
        "title": title,
        "question_text": question_text,
        "answer_text": answer_text,
        "explanation_text": explanation_text,
        "stage": "國中",
        "grade": "國三",
        "chapter": CHAPTER_NAME,
        "chapter_code": CHAPTER_CODE,
        "difficulty": difficulty,
        "source_type": "md_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", CHAPTER_CODE, CHAPTER_NAME, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    return [
        topic_row(
            id_="j5-1-2-ratio-language",
            title="比例線段語言：同類量配對",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("基本型", r"$\frac{a}{b}=\frac{c}{d}$"),
                ("交叉乘", r"$ad=bc\ (b,d\ne 0)$"),
            ],
            usage=["先把題目中的長度整理成同一種比。", "確認分子分母對應位置正確。"],
            examples=[r"$AB:BC=DE:EF \Leftrightarrow \frac{AB}{BC}=\frac{DE}{EF}$。"],
            tips=["先標同方向、同性質的線段再寫比例。", "比例式只在分母不為 0 時成立。"],
            notes=["比例線段題最常錯在配對順序。"],
            mistakes=["把對應邊上下顛倒卻仍直接交叉乘。"],
        ),
        topic_row(
            id_="j5-1-2-parallel-intercept-theorem",
            title="平行線截比例線段性質",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("截比定理", r"$\frac{AB}{BC}=\frac{DE}{EF}$"),
                ("條件", r"$\ell_1\parallel \ell_2\parallel \ell_3$"),
            ],
            usage=["多條平行線切兩條截線時求比例。", "由平行推出線段比。"],
            examples=[r"三條平行線切兩截線可得對應小段比相等。"],
            tips=["先確認是『對應小段』不是任意兩段。"],
            notes=["是後續三角形截比例的母定理。"],
            mistakes=["將不同區間的線段混在同一比例。"],
        ),
        topic_row(
            id_="j5-1-2-triangle-intercept-forward",
            title="三角形截比例：平行推出比例",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("平行推出", r"$DE\parallel BC\Rightarrow \frac{AD}{DB}=\frac{AE}{EC}$"),
                ("相似延伸", r"$\frac{AD}{AB}=\frac{AE}{AC}=\frac{DE}{BC}$"),
            ],
            usage=["三角形中有平行線時快速列比例。", "由分點資訊求其他線段。"],
            examples=[r"若 $D\in AB,\ E\in AC,\ DE\parallel BC$，可寫兩側分段比相等。"],
            tips=["先寫出平行條件，再列對應兩側。"],
            notes=["此主題是計算題與證明題共同核心。"],
            mistakes=["把 $AD/DB$ 寫成 $AD/AB$ 卻拿去對應 $AE/EC$。"],
        ),
        topic_row(
            id_="j5-1-2-area-view",
            title="用面積理解截比例",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("同高比", r"$\frac{[\triangle A_1]}{[\triangle A_2]}=\frac{\text{底}_1}{\text{底}_2}$"),
                ("比例連結", r"$\text{邊比}\rightarrow\text{面積比}$"),
            ],
            usage=["把抽象比例改成可視化面積關係。", "檢查比例推導是否合理。"],
            examples=[r"同高三角形面積比等於底邊比，可反推分點比例。"],
            tips=["先找同高或同底，再比較面積。"],
            notes=["對理解反性質有幫助。"],
            mistakes=["未確認同高就直接比面積。"],
        ),
        topic_row(
            id_="j5-1-2-triangle-intercept-converse",
            title="三角形截比例反性質：比例推出平行",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("反性質", r"$\frac{AD}{DB}=\frac{AE}{EC}\Rightarrow DE\parallel BC$"),
                ("使用條件", r"$D\in AB,\ E\in AC$"),
            ],
            usage=["證明題中由比例反推平行。", "補足幾何結論鏈。"],
            examples=[r"已知兩側分段比相等，可判連線與第三邊平行。"],
            tips=["先確認點在正確邊上，再使用反性質。"],
            notes=["常與正向性質成對考。"],
            mistakes=["比例成立但點不在同一三角形對應邊上。"],
        ),
        topic_row(
            id_="j5-1-2-solve-unknown-length",
            title="用比例線段求未知長度",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("列比例", r"$\frac{x}{a}=\frac{b}{c}$"),
                ("解未知", r"$x=\frac{ab}{c}$"),
            ],
            usage=["比例式一元一次求值。", "幾何條件轉代數求長度。"],
            examples=[r"$\frac{AD}{DB}=\frac{2}{3},\ AB=25\Rightarrow AD=10$。"],
            tips=["先用全長關係把變數數量降到 1 個。"],
            notes=["算完要回代檢查比例是否成立。"],
            mistakes=["交叉乘法號或括號處理錯。"],
        ),
        topic_row(
            id_="j5-1-2-multi-parallel-transfer",
            title="多條平行線轉接證明",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("分段轉接", r"$\frac{a}{b}=\frac{c}{d},\ \frac{c}{d}=\frac{e}{f}\Rightarrow \frac{a}{b}=\frac{e}{f}$"),
                ("策略", r"$\text{先局部比例，再串接全局}$"),
            ],
            usage=["多層平行線證明題。", "把複雜圖拆成小比例關係。"],
            examples=["先在上半部求比例，再帶到下半部完成證明。"],
            tips=["每一步都寫明依據哪組平行線。"],
            notes=["中等難度證明題高頻。"],
            mistakes=["跳步導致比例來源不清。"],
        ),
        topic_row(
            id_="j5-1-2-trapezoid-ratio",
            title="梯形中的分點比例",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("平行基底", r"$AB\parallel CD$"),
                ("分點比", r"$\frac{AE}{EC}=\frac{AB}{CD}\ (\text{在對角線截點模型})$"),
            ],
            usage=["梯形對角線、平行線切割比例。", "幾何應用題常見模型。"],
            examples=[r"由梯形平行底邊可轉成截比關係求分點。"],
            tips=["先確認是哪一組平行邊當基準。"],
            notes=["與相似三角形模型常同時出現。"],
            mistakes=["把梯形兩腰當成平行邊套公式。"],
        ),
        topic_row(
            id_="j5-1-2-partition-auxiliary-lines",
            title="等分輔助線法：把 2:3 變成可數份數",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("份數法", r"$2:3\Rightarrow 2k:3k$"),
                ("等分點", r"$\text{用平行輔助線把線段切成 }n\text{ 等分}$"),
            ],
            usage=["作圖題與比例求長題。", "把比例轉為整數份數。"],
            examples=[r"$AB$ 分成 $2:3$ 可先切成 5 等分再取 2 與 3。"],
            tips=["先找總份數，再決定每一份長度。"],
            notes=["可降低分數運算負擔。"],
            mistakes=["總份數算錯，後面全盤錯。"],
        ),
        topic_row(
            id_="j5-1-2-ratio-types-check",
            title="先分清長度比、周長比、面積比",
            chapter_role="易錯陷阱",
            difficulty="中等",
            formula_lines=[
                ("長度比", r"$k$"),
                ("周長比", r"$k$"),
                ("面積比", r"$k^2$"),
            ],
            usage=["內部平行圖形、相似圖形綜合題。", "避免把比例種類混用。"],
            examples=[r"若線性尺度比為 $2:3$，面積比為 $4:9$。"],
            tips=["先判斷題目問的是長度、周長還是面積。"],
            notes=["本章常見失分點之一。"],
            mistakes=["把面積比誤當長度比直接套。"],
        ),
        topic_row(
            id_="j5-1-2-construction-6-5",
            title="比例線段尺規作圖：把 AB 分成 6:5",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("目標", r"$AP:PB=6:5$"),
                ("作圖核心", r"$\text{利用平行線保持對應比例}$"),
            ],
            usage=["尺規作圖題。", "實作比例分點。"],
            examples=[r"由端點作輔助射線等分後連平行線回主線段。"],
            tips=["作圖步驟要明確：等分、連結、作平行。"],
            notes=["結果需用比例式回驗。"],
            mistakes=["等分射線長度不一致，導致比例失真。"],
        ),
        topic_row(
            id_="j5-1-2-checklist-strategy",
            title="比例線段解題檢查表",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[
                ("流程", r"$\text{找平行}\rightarrow\text{定對應}\rightarrow\text{列比例}\rightarrow\text{驗答案}$"),
                ("驗算", r"$\text{代回比值與幾何條件雙檢查}$"),
            ],
            usage=["綜合題流程控管。", "避免跳步和對應錯誤。"],
            examples=["先框出對應邊，再列比例，最後檢查單位與大小合理性。"],
            tips=["比例題一定要寫『對應依據』。"],
            notes=["考場可當快速自我檢查模板。"],
            mistakes=["只算數值，不檢查是否符合原幾何條件。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j5-1-2-ratio-001",
            title="比例語言轉換（基礎01）",
            difficulty="基礎",
            question_text=r"把 $AB:BC=2:5$ 改寫成分數比例式。",
            answer_text=r"$\dfrac{AB}{BC}=\dfrac{2}{5}$。",
            explanation_text="比值可直接寫為分數形式，方便後續運算。",
            topic_id="j5-1-2-ratio-language",
        ),
        question_row(
            id_="q-j5-1-2-ratio-002",
            title="交叉乘檢查（基礎02）",
            difficulty="基礎",
            question_text=r"若 $\dfrac{a}{b}=\dfrac{3}{4}$（$b\ne0$），寫出交叉乘關係。",
            answer_text=r"$4a=3b$。",
            explanation_text=r"由 $\dfrac{a}{b}=\dfrac{3}{4}$ 得 $4a=3b$。",
            topic_id="j5-1-2-ratio-language",
        ),
        question_row(
            id_="q-j5-1-2-ratio-003",
            title="平行截比判斷（基礎01）",
            difficulty="基礎",
            question_text="三條平行線切兩截線時，對應小段比有何關係？",
            answer_text="對應小段比相等。",
            explanation_text="這是平行線截比例線段性質的核心結論。",
            topic_id="j5-1-2-parallel-intercept-theorem",
        ),
        question_row(
            id_="q-j5-1-2-ratio-004",
            title="平行截比應用（基礎02）",
            difficulty="基礎",
            question_text=r"若平行線模型中一截線分段為 $4,6$，另一截線對應前段為 $8$，求後段。",
            answer_text="12。",
            explanation_text=r"由對應比相等，$\frac{4}{6}=\frac{8}{x}\Rightarrow x=12$。",
            topic_id="j5-1-2-parallel-intercept-theorem",
        ),
        question_row(
            id_="q-j5-1-2-ratio-005",
            title="三角形截比例（基礎01）",
            difficulty="基礎",
            question_text=r"在 $\triangle ABC$ 中，若 $DE\parallel BC$，可得哪個分段比例？",
            answer_text=r"$\dfrac{AD}{DB}=\dfrac{AE}{EC}$。",
            explanation_text="平行推出兩側被截線段成比例。",
            topic_id="j5-1-2-triangle-intercept-forward",
        ),
        question_row(
            id_="q-j5-1-2-ratio-006",
            title="三角形截比例（基礎02）",
            difficulty="基礎",
            question_text=r"若 $DE\parallel BC$ 且 $AD=3,DB=2,AE=6$，求 $EC$。",
            answer_text="4。",
            explanation_text=r"$\frac{AD}{DB}=\frac{AE}{EC}\Rightarrow \frac{3}{2}=\frac{6}{EC}$，得 $EC=4$。",
            topic_id="j5-1-2-triangle-intercept-forward",
        ),
        question_row(
            id_="q-j5-1-2-ratio-007",
            title="面積理解（中等01）",
            difficulty="中等",
            question_text="同高三角形的面積比等於什麼比？",
            answer_text="底邊比。",
            explanation_text="同高下，面積與底邊成正比。",
            topic_id="j5-1-2-area-view",
        ),
        question_row(
            id_="q-j5-1-2-ratio-008",
            title="面積轉比例（中等02）",
            difficulty="中等",
            question_text=r"兩個同高三角形面積比為 $5:3$，其底邊比為何？",
            answer_text=r"$5:3$。",
            explanation_text="同高模型下，面積比與底邊比相同。",
            topic_id="j5-1-2-area-view",
        ),
        question_row(
            id_="q-j5-1-2-ratio-009",
            title="反性質判斷（中等01）",
            difficulty="中等",
            question_text=r"若 $\dfrac{AD}{DB}=\dfrac{AE}{EC}$，可推出哪個平行結論？",
            answer_text=r"$DE\parallel BC$。",
            explanation_text="三角形截比例反性質：比例可反推平行。",
            topic_id="j5-1-2-triangle-intercept-converse",
        ),
        question_row(
            id_="q-j5-1-2-ratio-010",
            title="反性質前提（中等02）",
            difficulty="中等",
            question_text="使用截比例反性質前，最重要要先確認什麼？",
            answer_text="分點在同一三角形對應兩邊上。",
            explanation_text="若點位置不對，比例成立也不能推出平行。",
            topic_id="j5-1-2-triangle-intercept-converse",
        ),
        question_row(
            id_="q-j5-1-2-ratio-011",
            title="比例求長（中等01）",
            difficulty="中等",
            question_text=r"若 $\dfrac{x}{9}=\dfrac{4}{3}$，求 $x$。",
            answer_text="12。",
            explanation_text=r"$x=9\cdot \frac{4}{3}=12$。",
            topic_id="j5-1-2-solve-unknown-length",
        ),
        question_row(
            id_="q-j5-1-2-ratio-012",
            title="分點求長（中等02）",
            difficulty="中等",
            question_text=r"$AD:DB=2:3,\ AB=25$，求 $AD,DB$。",
            answer_text=r"$AD=10,\ DB=15$。",
            explanation_text=r"總份數 $=5$，每份 $=25/5=5$，故 $AD=2\times5,\ DB=3\times5$。",
            topic_id="j5-1-2-solve-unknown-length",
        ),
        question_row(
            id_="q-j5-1-2-ratio-013",
            title="多平行串接（中等01）",
            difficulty="中等",
            question_text="多條平行線證明題的穩定策略是什麼？",
            answer_text="先局部列比例，再逐步轉接成目標比例。",
            explanation_text="可避免一次寫太大式子造成對應混亂。",
            topic_id="j5-1-2-multi-parallel-transfer",
        ),
        question_row(
            id_="q-j5-1-2-ratio-014",
            title="多平行串接（中等02）",
            difficulty="中等",
            question_text=r"若 $\frac{a}{b}=\frac{c}{d}$ 且 $\frac{c}{d}=\frac{5}{7}$，則 $\frac{a}{b}=$？",
            answer_text=r"$\frac{5}{7}$。",
            explanation_text="由等量替換可直接轉接到目標比。",
            topic_id="j5-1-2-multi-parallel-transfer",
        ),
        question_row(
            id_="q-j5-1-2-ratio-015",
            title="梯形分點（中等01）",
            difficulty="中等",
            question_text="梯形比例題最先要確認哪一組邊？",
            answer_text="哪一組是平行底邊。",
            explanation_text="平行底邊決定可用的截比模型。",
            topic_id="j5-1-2-trapezoid-ratio",
        ),
        question_row(
            id_="q-j5-1-2-ratio-016",
            title="梯形比例（中等02）",
            difficulty="中等",
            question_text=r"在某梯形模型中，若 $\frac{AB}{CD}= \frac{2}{3}$，且對角線分點比 $\frac{AE}{EC}$ 與其對應，求 $\frac{AE}{EC}$。",
            answer_text=r"$\frac{2}{3}$。",
            explanation_text="在該模型下分點比對應於平行底邊比。",
            topic_id="j5-1-2-trapezoid-ratio",
        ),
        question_row(
            id_="q-j5-1-2-ratio-017",
            title="等分份數法（基礎01）",
            difficulty="基礎",
            question_text=r"把線段分成 $2:3$，總共要先切成幾等分？",
            answer_text="5 等分。",
            explanation_text=r"總份數為 $2+3=5$。",
            topic_id="j5-1-2-partition-auxiliary-lines",
        ),
        question_row(
            id_="q-j5-1-2-ratio-018",
            title="等分份數法（基礎02）",
            difficulty="基礎",
            question_text=r"若一線段長 30，要分成 $2:3$，兩段各長多少？",
            answer_text="12 與 18。",
            explanation_text=r"每份 $=30/5=6$，故兩段為 $2\times6$、$3\times6$。",
            topic_id="j5-1-2-partition-auxiliary-lines",
        ),
        question_row(
            id_="q-j5-1-2-ratio-019",
            title="比例種類辨識（中等01）",
            difficulty="中等",
            question_text=r"若相似圖形長度比為 $3:5$，面積比為何？",
            answer_text=r"$9:25$。",
            explanation_text="面積比是長度比平方。",
            topic_id="j5-1-2-ratio-types-check",
        ),
        question_row(
            id_="q-j5-1-2-ratio-020",
            title="比例種類辨識（中等02）",
            difficulty="中等",
            question_text="長度比、周長比、面積比三者最容易混淆的是哪一個？",
            answer_text="面積比。",
            explanation_text="面積比是平方關係，不是線性比例。",
            topic_id="j5-1-2-ratio-types-check",
        ),
        question_row(
            id_="q-j5-1-2-ratio-021",
            title="尺規作圖核心（進階01）",
            difficulty="進階",
            question_text=r"將 $AB$ 分成 $6:5$ 的作圖關鍵工具是什麼？",
            answer_text="平行線保持比例的性質。",
            explanation_text="等分輔助射線後，透過平行線可把份數映回 $AB$。",
            topic_id="j5-1-2-construction-6-5",
        ),
        question_row(
            id_="q-j5-1-2-ratio-022",
            title="尺規作圖驗算（進階02）",
            difficulty="進階",
            question_text=r"作圖分點完成後，應如何驗證是否為 $6:5$？",
            answer_text=r"量測或列比例檢查是否滿足 $AP:PB=6:5$。",
            explanation_text="作圖題最後一定要回到比例式驗證。",
            topic_id="j5-1-2-construction-6-5",
        ),
        question_row(
            id_="q-j5-1-2-ratio-023",
            title="解題檢查流程（進階01）",
            difficulty="進階",
            question_text="比例線段題最建議的四步流程是什麼？",
            answer_text="找平行、定對應、列比例、驗答案。",
            explanation_text="先有對應才有正確比例，最後需驗回題意。",
            topic_id="j5-1-2-checklist-strategy",
        ),
        question_row(
            id_="q-j5-1-2-ratio-024",
            title="驗算重點（進階02）",
            difficulty="進階",
            question_text="比例題算出數值後，至少要做哪兩種檢查？",
            answer_text="代回比例式檢查、代回幾何條件檢查。",
            explanation_text="同時通過代數與幾何檢查才算完整正確。",
            topic_id="j5-1-2-checklist-strategy",
        ),
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

