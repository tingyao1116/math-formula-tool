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

SOURCE_MD_1 = (
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三上6_幾何推理_整理\改國三上6_幾何推理_易讀版.md"
)
SOURCE_MD_2 = (
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三上7_綜合證題法_整理\改國三上7_綜合證題法_易讀版.md"
)
SOURCE_REF = f"{Path(SOURCE_MD_1).name} + {Path(SOURCE_MD_2).name}（重點整理匯入）"

CHAPTER_CODE = "j5-3-2"
CHAPTER_NAME = "幾何推理與綜合證題法"

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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j5-3-2-{ts}{path.suffix}"
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
        "tags": ["word匯入", "雙檔整併", CHAPTER_CODE, CHAPTER_NAME, "證明"],
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
        "tags": ["word匯入", "雙檔整併", CHAPTER_CODE, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    return [
        topic_row(
            id_="j5-3-2-what-is-geometric-reasoning",
            title="幾何推理是什麼：由規則推出新結論",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[("核心", r"$\text{已知}\Rightarrow\text{推理}\Rightarrow\text{結論}$")],
            usage=["建立證明題思維。", "理解為何需要理由鏈。"],
            examples=["由平行可推角相等，再推三角形全等。"],
            tips=["每一步都要能回答「依據是什麼」。"],
            notes=["幾何推理重點是可追溯。"],
            mistakes=["只寫答案，不寫推理依據。"],
        ),
        topic_row(
            id_="j5-3-2-postulates-and-toolbox",
            title="公設與可用幾何工具箱",
            chapter_role="核心觀念",
            difficulty="基礎",
            formula_lines=[("工具箱", r"$\text{平行線角、全等、相似、中垂線、角平分線…}$")],
            usage=["選擇可用理由。", "整理常見可引用性質。"],
            examples=["已知垂直可用直角；已知等距可考慮中垂線。"],
            tips=["先掃描題目給了哪些條件，再選工具。"],
            notes=["工具箱完整性決定證明效率。"],
            mistakes=["有條件卻選錯工具。"],
        ),
        topic_row(
            id_="j5-3-2-proof-language-format",
            title="證明語言與格式：已知、求證、證明",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[("格式", r"$\text{已知}\ /\ \text{求證}\ /\ \text{證明}$")],
            usage=["書寫完整證明。", "讓推理脈絡清晰。"],
            examples=["每一行包含「結論＋理由」。"],
            tips=["「因為…所以…」可以強迫自己補齊理由。"],
            notes=["格式正確可大幅降低跳步錯。"],
            mistakes=["結論與理由分離不清。"],
        ),
        topic_row(
            id_="j5-3-2-angle-sum-theorems",
            title="角和定理：三角形、外角、四邊形",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("三角形內角和", r"$\angle A+\angle B+\angle C=180^\circ$"),
                ("外角定理", r"$\angle \text{外}=\angle \text{不相鄰內角和}$"),
                ("四邊形內角和", r"$360^\circ$"),
            ],
            usage=["角度推理與證明題起手式。", "多邊形角度題。"],
            examples=["連對角線把四邊形拆成兩三角形。"],
            tips=["外角題先找不相鄰內角。"],
            notes=["角和定理是證明題高頻理由。"],
            mistakes=["外角定理誤用成相鄰內角和。"],
        ),
        topic_row(
            id_="j5-3-2-complementary-angle-elimination",
            title="同角的餘角相等：等式消去法",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[("消去", r"$\alpha+\theta=\beta+\theta\Rightarrow \alpha=\beta$")],
            usage=["角度代數化簡。", "證明角相等常用。"],
            examples=["兩角都與同一角互餘，可推出兩角相等。"],
            tips=["先把共同角整理到同一邊。"],
            notes=["這是代數與幾何的橋樑技巧。"],
            mistakes=["共同角不一致卻強行消去。"],
        ),
        topic_row(
            id_="j5-3-2-analysis-draw-backward",
            title="證明三步：分析、畫圖、倒推",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[("流程", r"$\text{目標}\leftarrow\text{需要條件}\leftarrow\text{已知可供條件}$")],
            usage=["卡題時重啟思路。", "降低盲算機率。"],
            examples=["想證邊相等，先倒推可否證全等。"],
            tips=["先問「為了證 A，我需要先證什麼」。"],
            notes=["倒推可快速定位輔助線需求。"],
            mistakes=["從頭暴力推，忽略目標導向。"],
        ),
        topic_row(
            id_="j5-3-2-congruence-template-rhs",
            title="全等模板：先對應再判別（含 RHS）",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("模板", r"$\text{對應點}\rightarrow\text{判別條件}\rightarrow\text{全等結論}$"),
                ("RHS", r"$\text{直角}+\text{斜邊}+\text{一股}$"),
            ],
            usage=["求證邊角相等。", "RHS 題型快速判別。"],
            examples=[r"RHS 可證兩直角三角形全等，進而得 $CA=CD$。"],
            tips=["全等前一定先寫對應順序。"],
            notes=["不寫對應常導致 CPCTC 用錯。"],
            mistakes=["條件足夠前就宣告全等。"],
        ),
        topic_row(
            id_="j5-3-2-perpendicular-bisector-property-converse",
            title="中垂線性質與判別",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("性質", r"$P\in\text{中垂線}\Rightarrow PA=PB$"),
                ("判別", r"$PA=PB\Rightarrow P\in\text{中垂線}$"),
            ],
            usage=["等距點軌跡題。", "證明點在線上題。"],
            examples=["到端點等距可反推在中垂線上。"],
            tips=["先分清是用性質還是判別。"],
            notes=["方向不同，結論不同。"],
            mistakes=["把性質與判別反向誤用。"],
        ),
        topic_row(
            id_="j5-3-2-angle-bisector-distance-property",
            title="角平分線性質：到兩邊等距",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[("性質", r"$P\in\text{角平分線}\Leftrightarrow d(P,\ell_1)=d(P,\ell_2)$")],
            usage=["證明點在角平分線上。", "垂距比較題。"],
            examples=["到角兩邊垂距相等可判定角平分線。"],
            tips=["比較的是到『邊』的距離，不是到頂點。"],
            notes=["與中垂線的『點到點等距』要分清。"],
            mistakes=["把點到邊等距誤寫成點到頂點等距。"],
        ),
        topic_row(
            id_="j5-3-2-isosceles-triangle-properties",
            title="等腰三角形性質整合",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("頂角平分線", r"$\text{同時為中線與高}$"),
                ("底邊中線", r"$\text{同時垂直底邊並平分頂角}$"),
                ("對稱量", r"$\text{兩腰上的高相等；兩腰上的中線相等}$"),
            ],
            usage=["等腰證明與計算。", "多結論聯動題。"],
            examples=["先證等腰，可一次打開多個可用結論。"],
            tips=["確認是『等腰』後再啟用整包性質。"],
            notes=["是綜合證題法中的高效工具。"],
            mistakes=["未證等腰就先使用等腰性質。"],
        ),
        topic_row(
            id_="j5-3-2-parallelogram-diagonal-congruence",
            title="平行四邊形對角線分全等",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[("結論", r"$\triangle ABC\cong\triangle CDA$")],
            usage=["平行四邊形證明題。", "推邊角相等。"],
            examples=["由平行線角關係搭配共邊可證全等。"],
            tips=["先抓一條對角線拆成兩三角形。"],
            notes=["可快速推出對邊相等與對角相等。"],
            mistakes=["拆錯三角形導致對應混亂。"],
        ),
        topic_row(
            id_="j5-3-2-auxiliary-line-toolbox",
            title="輔助線工具箱：作線為了補條件",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[("原則", r"$\text{每一條輔助線都要有明確目的}$")],
            usage=["補全等條件。", "補平行或垂直關係。"],
            examples=["作平行線補同位角；作中線補比例。"],
            tips=["先列缺少的條件，再決定要作哪條線。"],
            notes=["輔助線不是越多越好。"],
            mistakes=["為了作線而作線，無助於目標。"],
        ),
        topic_row(
            id_="j5-3-2-composite-proof-overview",
            title="綜合證題法總覽：先看目標再選工具",
            chapter_role="教學核心",
            difficulty="進階",
            formula_lines=[("路線", r"$\text{目標}\rightarrow\text{中介結論}\rightarrow\text{可用工具}$")],
            usage=["多性質混合證明題。", "提升作答穩定性。"],
            examples=["要證平行可先證內錯角相等；要證等長可先證全等。"],
            tips=["先選主路線，再補次路線。"],
            notes=["能避免證明散亂。"],
            mistakes=["同時開多條路線卻都沒走完。"],
        ),
        topic_row(
            id_="j5-3-2-proof-writing-demo",
            title="證明寫法示範：每行都有理由",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[("格式", r"$\text{結論}\quad(\text{理由})$")],
            usage=["提升證明可讀性與可評分性。", "避免口語化跳步。"],
            examples=["由 AB∥CD（已知）得 ∠1=∠2（內錯角）。"],
            tips=["每行結尾標註理由來源。"],
            notes=["這是拿分關鍵，不只是數學正確。"],
            mistakes=["理由寫『可知』但未指明根據。"],
        ),
        topic_row(
            id_="j5-3-2-common-failures",
            title="常見失誤：方向錯、理由斷、結論跳",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[("檢核", r"$\text{方向}\ /\ \text{理由}\ /\ \text{結論}$")],
            usage=["自我檢查證明品質。", "修正失分點。"],
            examples=["有結論無理由、或有理由但非該結論。"],
            tips=["寫完後逆向讀一次，檢查每步是否可追溯。"],
            notes=["多數失分發生在表達而非觀念。"],
            mistakes=["把『看起來合理』當成『已證明』。"],
        ),
        topic_row(
            id_="j5-3-2-chapter-checklist",
            title="本章檢查表：方向、理由、結論",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[("終檢流程", r"$\text{目標對齊}\rightarrow\text{理由完整}\rightarrow\text{符號一致}$")],
            usage=["考前與考場快速檢核。", "降低粗心跳步。"],
            examples=["確認每個『所以』前面都有『因為』。"],
            tips=["最後 30 秒做一次理由掃描。"],
            notes=["這一步常決定是否拿到完整分。"],
            mistakes=["只檢查算式，不檢查論證鏈。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j5-3-2-proof-001",
            title="推理本質（基礎01）",
            difficulty="基礎",
            question_text="幾何推理的核心流程是什麼？",
            answer_text="由已知條件，透過可用性質，推出目標結論。",
            explanation_text="重點是過程可追溯，不是只給答案。",
            topic_id="j5-3-2-what-is-geometric-reasoning",
        ),
        question_row(
            id_="q-j5-3-2-proof-002",
            title="推理本質（基礎02）",
            difficulty="基礎",
            question_text="證明題中「看起來對」能算證明嗎？",
            answer_text="不能。",
            explanation_text="每一步都需要明確理由。",
            topic_id="j5-3-2-what-is-geometric-reasoning",
        ),
        question_row(
            id_="q-j5-3-2-proof-003",
            title="工具箱選擇（基礎01）",
            difficulty="基礎",
            question_text="看到「等距」條件時，常優先聯想到哪個工具？",
            answer_text="中垂線性質或判別。",
            explanation_text="等距是中垂線模型核心訊號。",
            topic_id="j5-3-2-postulates-and-toolbox",
        ),
        question_row(
            id_="q-j5-3-2-proof-004",
            title="工具箱選擇（基礎02）",
            difficulty="基礎",
            question_text="選工具前應先做什麼？",
            answer_text="先整理題目已知條件。",
            explanation_text="條件決定可用工具，不可反過來硬套。",
            topic_id="j5-3-2-postulates-and-toolbox",
        ),
        question_row(
            id_="q-j5-3-2-proof-005",
            title="證明格式（基礎01）",
            difficulty="基礎",
            question_text="標準證明格式三部分是什麼？",
            answer_text="已知、求證、證明。",
            explanation_text="這是國中證明書寫基本框架。",
            topic_id="j5-3-2-proof-language-format",
        ),
        question_row(
            id_="q-j5-3-2-proof-006",
            title="證明格式（基礎02）",
            difficulty="基礎",
            question_text="證明中的每一行至少要包含哪兩件事？",
            answer_text="結論與理由。",
            explanation_text="沒有理由的結論不算完整證明。",
            topic_id="j5-3-2-proof-language-format",
        ),
        question_row(
            id_="q-j5-3-2-proof-007",
            title="角和定理（基礎01）",
            difficulty="基礎",
            question_text="四邊形內角和是多少度？",
            answer_text="360 度。",
            explanation_text="可拆成兩個三角形，各 180 度。",
            topic_id="j5-3-2-angle-sum-theorems",
        ),
        question_row(
            id_="q-j5-3-2-proof-008",
            title="外角定理（基礎02）",
            difficulty="基礎",
            question_text="三角形外角等於哪兩個角的和？",
            answer_text="兩個不相鄰內角和。",
            explanation_text="這是外角定理標準敘述。",
            topic_id="j5-3-2-angle-sum-theorems",
        ),
        question_row(
            id_="q-j5-3-2-proof-009",
            title="餘角消去（中等01）",
            difficulty="中等",
            question_text=r"若 $\alpha+\theta=\beta+\theta$，可得什麼？",
            answer_text=r"$\alpha=\beta$。",
            explanation_text="同項消去後得到目標角相等。",
            topic_id="j5-3-2-complementary-angle-elimination",
        ),
        question_row(
            id_="q-j5-3-2-proof-010",
            title="餘角消去（中等02）",
            difficulty="中等",
            question_text="使用同角消去前，最重要的檢查是什麼？",
            answer_text="共同角是否真的相同。",
            explanation_text="共同角不一致就不能消去。",
            topic_id="j5-3-2-complementary-angle-elimination",
        ),
        question_row(
            id_="q-j5-3-2-proof-011",
            title="倒推流程（中等01）",
            difficulty="中等",
            question_text="要證兩線段相等，常見倒推中介結論是什麼？",
            answer_text="先證兩三角形全等。",
            explanation_text="全等後可用對應邊相等。",
            topic_id="j5-3-2-analysis-draw-backward",
        ),
        question_row(
            id_="q-j5-3-2-proof-012",
            title="倒推流程（中等02）",
            difficulty="中等",
            question_text="分析、畫圖、證明三步中，畫圖的目的為何？",
            answer_text="把條件可視化並找出可連結的中介量。",
            explanation_text="圖是推理載體，不只是美觀。",
            topic_id="j5-3-2-analysis-draw-backward",
        ),
        question_row(
            id_="q-j5-3-2-proof-013",
            title="全等模板（中等01）",
            difficulty="中等",
            question_text="全等證明中，為何要先寫對應順序？",
            answer_text="避免後續對應邊角引用錯誤。",
            explanation_text="對應錯，CPCTC 就會錯。",
            topic_id="j5-3-2-congruence-template-rhs",
        ),
        question_row(
            id_="q-j5-3-2-proof-014",
            title="RHS 條件（中等02）",
            difficulty="中等",
            question_text="RHS 判別需要哪三個條件？",
            answer_text="直角、斜邊相等、一股相等。",
            explanation_text="這是直角三角形專用全等判別。",
            topic_id="j5-3-2-congruence-template-rhs",
        ),
        question_row(
            id_="q-j5-3-2-proof-015",
            title="中垂線性質（中等01）",
            difficulty="中等",
            question_text=r"若點 P 在 AB 的中垂線上，可推出什麼？",
            answer_text=r"$PA=PB$。",
            explanation_text="中垂線性質：線上點到端點等距。",
            topic_id="j5-3-2-perpendicular-bisector-property-converse",
        ),
        question_row(
            id_="q-j5-3-2-proof-016",
            title="中垂線判別（中等02）",
            difficulty="中等",
            question_text=r"若 $PA=PB$，點 P 一定在哪裡？",
            answer_text="在線段 AB 的中垂線上。",
            explanation_text="這是中垂線判別。",
            topic_id="j5-3-2-perpendicular-bisector-property-converse",
        ),
        question_row(
            id_="q-j5-3-2-proof-017",
            title="角平分線性質（中等01）",
            difficulty="中等",
            question_text="角平分線上的點，對角兩邊距離有何關係？",
            answer_text="相等。",
            explanation_text="是角平分線距離性質。",
            topic_id="j5-3-2-angle-bisector-distance-property",
        ),
        question_row(
            id_="q-j5-3-2-proof-018",
            title="角平分線辨識（中等02）",
            difficulty="中等",
            question_text="若點到角兩邊垂距相等，可推得什麼？",
            answer_text="該點在角平分線上。",
            explanation_text="由角平分線性質逆向判別。",
            topic_id="j5-3-2-angle-bisector-distance-property",
        ),
        question_row(
            id_="q-j5-3-2-proof-019",
            title="等腰性質（中等01）",
            difficulty="中等",
            question_text="等腰三角形頂角平分線同時具備哪兩種身分？",
            answer_text="中線與高。",
            explanation_text="在等腰三角形中三線合一現象成立。",
            topic_id="j5-3-2-isosceles-triangle-properties",
        ),
        question_row(
            id_="q-j5-3-2-proof-020",
            title="等腰性質（中等02）",
            difficulty="中等",
            question_text="等腰三角形兩腰上的高與中線有何對稱性？",
            answer_text="兩腰上的高相等、兩腰上的中線相等。",
            explanation_text="來自等腰圖形對稱。",
            topic_id="j5-3-2-isosceles-triangle-properties",
        ),
        question_row(
            id_="q-j5-3-2-proof-021",
            title="平行四邊形全等（中等01）",
            difficulty="中等",
            question_text="平行四邊形一條對角線可把圖形分成什麼？",
            answer_text="兩個全等三角形。",
            explanation_text="可由平行線角關係與共邊建立全等。",
            topic_id="j5-3-2-parallelogram-diagonal-congruence",
        ),
        question_row(
            id_="q-j5-3-2-proof-022",
            title="平行四邊形全等（中等02）",
            difficulty="中等",
            question_text="由對角線分全等後，可常見推出哪些量相等？",
            answer_text="對邊相等與對角相等。",
            explanation_text="全等後用對應邊角相等可得。",
            topic_id="j5-3-2-parallelogram-diagonal-congruence",
        ),
        question_row(
            id_="q-j5-3-2-proof-023",
            title="輔助線策略（進階01）",
            difficulty="進階",
            question_text="作輔助線前最先要做什麼？",
            answer_text="先確認缺少哪個可證明條件。",
            explanation_text="輔助線要服務目標，不是隨機新增。",
            topic_id="j5-3-2-auxiliary-line-toolbox",
        ),
        question_row(
            id_="q-j5-3-2-proof-024",
            title="輔助線策略（進階02）",
            difficulty="進階",
            question_text="「輔助線越多越好」這句話正確嗎？",
            answer_text="不正確。",
            explanation_text="無目的作線會增加混亂與錯誤。",
            topic_id="j5-3-2-auxiliary-line-toolbox",
        ),
        question_row(
            id_="q-j5-3-2-proof-025",
            title="綜合證題法（進階01）",
            difficulty="進階",
            question_text="綜合證題法起手動作是什麼？",
            answer_text="先看目標，再選可達成目標的工具。",
            explanation_text="目標導向可避免證明發散。",
            topic_id="j5-3-2-composite-proof-overview",
        ),
        question_row(
            id_="q-j5-3-2-proof-026",
            title="綜合證題法（進階02）",
            difficulty="進階",
            question_text="若目標是證平行，常見中介結論是什麼？",
            answer_text="證內錯角（或同位角）相等。",
            explanation_text="角相等是平行判別常用入口。",
            topic_id="j5-3-2-composite-proof-overview",
        ),
        question_row(
            id_="q-j5-3-2-proof-027",
            title="證明寫法（中等01）",
            difficulty="中等",
            question_text="證明每一行建議怎麼寫才好評分？",
            answer_text="寫出結論並在同一行標明理由。",
            explanation_text="可讀性高、易檢查、較不失分。",
            topic_id="j5-3-2-proof-writing-demo",
        ),
        question_row(
            id_="q-j5-3-2-proof-028",
            title="證明寫法（中等02）",
            difficulty="中等",
            question_text="理由只寫「可知」為什麼不夠？",
            answer_text="因為未指出具體依據，推理鏈不完整。",
            explanation_text="證明需要可追溯來源。",
            topic_id="j5-3-2-proof-writing-demo",
        ),
        question_row(
            id_="q-j5-3-2-proof-029",
            title="常見失誤（進階01）",
            difficulty="進階",
            question_text="證明題最常見三種結構性錯誤是什麼？",
            answer_text="方向錯、理由斷、結論跳。",
            explanation_text="多數扣分都集中在這三類。",
            topic_id="j5-3-2-common-failures",
        ),
        question_row(
            id_="q-j5-3-2-proof-030",
            title="常見失誤（進階02）",
            difficulty="進階",
            question_text="寫完證明後，建議做哪個高效檢查？",
            answer_text="逆向讀一次，看每步是否都有明確理由來源。",
            explanation_text="可快速抓到跳步與理由缺漏。",
            topic_id="j5-3-2-common-failures",
        ),
        question_row(
            id_="q-j5-3-2-proof-031",
            title="章節檢查表（進階01）",
            difficulty="進階",
            question_text="本章終檢流程建議順序是什麼？",
            answer_text="目標對齊、理由完整、符號一致。",
            explanation_text="這三步可覆蓋大部分失誤。",
            topic_id="j5-3-2-chapter-checklist",
        ),
        question_row(
            id_="q-j5-3-2-proof-032",
            title="章節檢查表（進階02）",
            difficulty="進階",
            question_text="只檢查算式不檢查理由，會有什麼風險？",
            answer_text="容易出現結論正確但證明不成立的失分。",
            explanation_text="幾何證明評分重視推理鏈完整。",
            topic_id="j5-3-2-chapter-checklist",
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

