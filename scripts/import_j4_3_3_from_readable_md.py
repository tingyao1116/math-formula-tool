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
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國二下6_三角形的全等_整理\改國二下6_三角形的全等_易讀版.md"
)
SUMMARY_DOCX = str(ROOT / "exports" / "word-j4-3-3" / "改國二下6_三角形的全等_易讀版.docx")
SOURCE_REF = f"{Path(SOURCE_MD).name} -> {Path(SUMMARY_DOCX).name}"

CHAPTER_NAME = {
    "j4-3-3": "三角形的基本性質",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j4-3-3-{ts}{path.suffix}"
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
        "grade": "國二",
        "term": "下學期",
        "chapter": chapter,
        "domain": "幾何",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["md匯入", "教學核心", chapter_code, chapter, "三角形全等"],
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
        "grade": "國二",
        "chapter": chapter,
        "difficulty": difficulty,
        "source_type": "md_summary",
        "source_ref": SOURCE_REF,
        "tags": ["md匯入", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    return [
        topic_row(
            id_="j4-3-3-congruence-correspondence",
            title="全等與對應關係",
            chapter_code="j4-3-3",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("全等式", r"$\triangle ABC\cong\triangle DEF$"),
                ("對應", r"$A\leftrightarrow D,\ B\leftrightarrow E,\ C\leftrightarrow F$"),
            ],
            usage=["由頂點順序判斷對應邊角。"],
            examples=[r"$AB=DE,\ BC=EF,\ AC=DF$。"],
            tips=["順序就是對應表，不能亂換。"],
            notes=["對應錯，後面整題都會錯。"],
            mistakes=["憑圖左右位置判斷對應。"],
        ),
        topic_row(
            id_="j4-3-3-five-criteria-overview",
            title="五種全等判定總覽",
            chapter_code="j4-3-3",
            chapter_role="核心公式",
            difficulty="基礎",
            formula_lines=[
                ("判定", r"$\text{SSS, SAS, ASA, AAS, RHS(HL)}$"),
                ("注意", r"$\text{SSA 不足以判定全等}$"),
            ],
            usage=["判斷題目條件可套哪一種全等。"],
            examples=["先判斷是幾邊幾角、是否夾角、是否直角。"],
            tips=["兩邊一角先問：角是不是夾角？"],
            notes=["RHS 只用在直角三角形。"],
            mistakes=["把 SSA 當成 SAS。"],
        ),
        topic_row(
            id_="j4-3-3-sss-sas-core",
            title="SSS 與 SAS 重點",
            chapter_code="j4-3-3",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("SSS", r"$\text{三組對應邊相等}$"),
                ("SAS", r"$\text{兩邊及夾角相等}$"),
            ],
            usage=["處理邊長主導或夾角明確的題目。"],
            examples=[r"若 $AB=DE,BC=EF,\angle B=\angle E$，可用 SAS。"],
            tips=["SAS 的角要被兩條已知邊夾住。"],
            notes=["SSS 無需先知道角。"],
            mistakes=["非夾角也硬套 SAS。"],
        ),
        topic_row(
            id_="j4-3-3-asa-aas-core",
            title="ASA 與 AAS 重點",
            chapter_code="j4-3-3",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("ASA", r"$\text{兩角夾邊}$"),
                ("AAS", r"$\text{兩角加一對應邊}$"),
            ],
            usage=["角度條件主導題型，常見於折疊和平行線。"],
            examples=[r"兩角已知時，可先用內角和補出第三角。"],
            tips=["AAS 常可轉成 ASA 理解。"],
            notes=["先確認對應邊是不是同一位置。"],
            mistakes=["把夾邊與非夾邊混淆。"],
        ),
        topic_row(
            id_="j4-3-3-rhs-hl-right-triangle",
            title="RHS(HL) 直角三角形判定",
            chapter_code="j4-3-3",
            chapter_role="核心公式",
            difficulty="中等",
            formula_lines=[
                ("RHS", r"$\text{直角}+\text{斜邊}+\text{一股}$"),
                ("限制", r"$\text{僅適用直角三角形}$"),
            ],
            usage=["快速判定兩直角三角形是否全等。"],
            examples=[r"斜邊與一股相等即可用 RHS。"],
            tips=["先確認兩三角形都直角。"],
            notes=["RHS 又稱 HL。"],
            mistakes=["非直角三角形誤用 RHS。"],
        ),
        topic_row(
            id_="j4-3-3-ssa-counterexample",
            title="SSA 非全等反例",
            chapter_code="j4-3-3",
            chapter_role="易錯陷阱",
            difficulty="中等",
            formula_lines=[
                ("陷阱", r"$\text{兩邊與非夾角相等}\not\Rightarrow\text{全等}$"),
                ("結論", r"$\text{SSA 可能有兩個不同三角形}$"),
            ],
            usage=["辨識不可直接下全等結論的情況。"],
            examples=["同樣兩邊與非夾角，可能構成兩種形狀。"],
            tips=["遇到兩邊一角先定位角的位置。"],
            notes=["判定題最常見錯點之一。"],
            mistakes=["看到兩邊一角就直接寫全等。"],
        ),
        topic_row(
            id_="j4-3-3-proof-structure",
            title="全等證明標準流程",
            chapter_code="j4-3-3",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("流程", r"$\text{列條件}\rightarrow\text{判定}\rightarrow\text{得全等}\rightarrow\text{推對應}$"),
                ("常用", r"$\text{CPCTC：對應邊角相等}$"),
            ],
            usage=["證明題與幾何推理題通用。"],
            examples=["先列三個條件再寫 SSS/SAS/ASA。"],
            tips=["不要跳步，判定名稱要明寫。"],
            notes=["格式清楚可大幅降低失分。"],
            mistakes=["只寫結論不寫判定依據。"],
        ),
        topic_row(
            id_="j4-3-3-cpctc-application",
            title="全等後的對應推論（CPCTC）",
            chapter_code="j4-3-3",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("CPCTC", r"$\triangle A\cong\triangle B\Rightarrow\text{對應邊角相等}$"),
                ("應用", r"$\text{可解未知長度、角度、周長、面積}$"),
            ],
            usage=["由全等結果解代數式與角度。"],
            examples=[r"若 $BC=y+3,EF=3y-1$ 且對應，則可列方程。"],
            tips=["必須先證全等，才能用對應相等。"],
            notes=["CPCTC 是證明後半段核心。"],
            mistakes=["未證全等先用對應相等。"],
        ),
        topic_row(
            id_="j4-3-3-regular-shape-congruence",
            title="正圖形中的全等判定",
            chapter_code="j4-3-3",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("正方形", r"$\text{邊相等、角 }90^\circ$"),
                ("正三角形", r"$\text{邊相等、角 }60^\circ$"),
            ],
            usage=["把正圖形條件轉成 SSS/SAS 可用資訊。"],
            examples=["正方形題常可抽出兩邊相等加直角。"],
            tips=["先標出圖中自然相等邊角。"],
            notes=["競試題常把已知藏在圖形定義裡。"],
            mistakes=["忘記使用正圖形固有性質。"],
        ),
        topic_row(
            id_="j4-3-3-folding-and-right-triangle",
            title="摺疊與直角題型",
            chapter_code="j4-3-3",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("摺痕", r"$\text{常形成等距或角平分}$"),
                ("直角", r"$\text{可搭配 RHS 或畢氏關係}$"),
            ],
            usage=["處理摺紙、垂直、對稱混合題。"],
            examples=["摺疊後重合邊常代表長度相等。"],
            tips=["先找不變量：等距、共邊、直角。"],
            notes=["這類題常需要圖形重建。"],
            mistakes=["忽略摺疊對應關係。"],
        ),
        topic_row(
            id_="j4-3-3-area-perimeter-application",
            title="周長與面積應用",
            chapter_code="j4-3-3",
            chapter_role="應用建模",
            difficulty="進階",
            formula_lines=[
                ("全等", r"$\text{周長相等，面積相等}$"),
                ("推論", r"$\text{對應高、底可互換使用}$"),
            ],
            usage=["全等後延伸到面積與周長計算。"],
            examples=["先證全等，再比較兩區域面積。"],
            tips=["面積比題先確認是否真的全等。"],
            notes=["應用題中常與代數聯立。"],
            mistakes=["把全等與相似的面積關係混用。"],
        ),
        topic_row(
            id_="j4-3-3-criteria-selection-strategy",
            title="判定選擇策略",
            chapter_code="j4-3-3",
            chapter_role="易錯陷阱",
            difficulty="中等",
            formula_lines=[
                ("判定順序", r"$\text{先看直角，再看夾角，再看邊角數量}$"),
                ("禁忌", r"$\text{SSA 不可直接判定}$"),
            ],
            usage=["考場快速挑選正確判定法。"],
            examples=["有直角+斜邊+一股優先選 RHS。"],
            tips=["先分類題型，可大幅減少誤判。"],
            notes=["判定選錯等於整題作廢。"],
            mistakes=["看見角就優先用 ASA，忽略位置。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j4-3-3-cong-001",
            title="對應邊判讀（基礎01）",
            chapter_code="j4-3-3",
            difficulty="基礎",
            question_text=r"若 $\triangle ABC\cong\triangle DEF$，則邊 $BC$ 對應哪一邊？",
            answer_text=r"$EF$",
            explanation_text=r"由順序可知 $B\leftrightarrow E,\ C\leftrightarrow F$，所以 $BC\leftrightarrow EF$。",
            topic_id="j4-3-3-congruence-correspondence",
        ),
        question_row(
            id_="q-j4-3-3-cong-002",
            title="對應角判讀（基礎02）",
            chapter_code="j4-3-3",
            difficulty="基礎",
            question_text=r"若 $\triangle ABC\cong\triangle PQR$，則 $\angle C$ 對應哪一角？",
            answer_text=r"$\angle R$",
            explanation_text=r"第三個頂點對第三個頂點，故 $\angle C\leftrightarrow\angle R$。",
            topic_id="j4-3-3-congruence-correspondence",
        ),
        question_row(
            id_="q-j4-3-3-cong-003",
            title="判定識別（基礎03）",
            chapter_code="j4-3-3",
            difficulty="基礎",
            question_text="三組對應邊相等，應使用哪種全等判定？",
            answer_text="SSS",
            explanation_text="SSS 即三邊對應相等。",
            topic_id="j4-3-3-five-criteria-overview",
        ),
        question_row(
            id_="q-j4-3-3-cong-004",
            title="夾角判斷（基礎04）",
            chapter_code="j4-3-3",
            difficulty="基礎",
            question_text="SAS 的角必須是什麼位置的角？",
            answer_text="兩條已知邊之間的夾角。",
            explanation_text="若不是夾角，就不是 SAS。",
            topic_id="j4-3-3-sss-sas-core",
        ),
        question_row(
            id_="q-j4-3-3-cong-005",
            title="RHS 條件（基礎05）",
            chapter_code="j4-3-3",
            difficulty="基礎",
            question_text="RHS（HL）判定只適用於哪一類三角形？",
            answer_text="直角三角形。",
            explanation_text="RHS 的 R 就是直角條件。",
            topic_id="j4-3-3-rhs-hl-right-triangle",
        ),
        question_row(
            id_="q-j4-3-3-cong-006",
            title="SSA 陷阱（中等01）",
            chapter_code="j4-3-3",
            difficulty="中等",
            question_text="只知道兩邊與一個非夾角相等（SSA），可以直接判定全等嗎？",
            answer_text="不可以。",
            explanation_text="SSA 可能對應多個不同三角形。",
            topic_id="j4-3-3-ssa-counterexample",
        ),
        question_row(
            id_="q-j4-3-3-cong-007",
            title="AAS 應用（中等02）",
            chapter_code="j4-3-3",
            difficulty="中等",
            question_text="若兩角與其中一邊對應相等，常用哪種判定？",
            answer_text="AAS",
            explanation_text="AAS 是兩角加一邊（非必夾邊）。",
            topic_id="j4-3-3-asa-aas-core",
        ),
        question_row(
            id_="q-j4-3-3-cong-008",
            title="全等後代數（中等03）",
            chapter_code="j4-3-3",
            difficulty="中等",
            question_text=r"若 $\triangle ABC\cong\triangle DEF$ 且 $BC=y+3,\ EF=3y-1$，求 $y$。",
            answer_text=r"$2$",
            explanation_text=r"對應邊相等：$y+3=3y-1\Rightarrow2y=4\Rightarrow y=2$。",
            topic_id="j4-3-3-cpctc-application",
        ),
        question_row(
            id_="q-j4-3-3-cong-009",
            title="SAS 例題（中等04）",
            chapter_code="j4-3-3",
            difficulty="中等",
            question_text=r"已知 $AB=DE,\ BC=EF,\ \angle B=\angle E$ 且角為夾角，應用哪種判定？",
            answer_text="SAS",
            explanation_text="兩邊與夾角對應相等，符合 SAS。",
            topic_id="j4-3-3-sss-sas-core",
        ),
        question_row(
            id_="q-j4-3-3-cong-010",
            title="ASA 轉換（中等05）",
            chapter_code="j4-3-3",
            difficulty="中等",
            question_text="已知兩角相等與一對應邊相等，且可補出第三角，最終可導向哪類判定？",
            answer_text="ASA（或 AAS 轉 ASA）。",
            explanation_text="利用內角和補角後，常可整理成 ASA 結構。",
            topic_id="j4-3-3-asa-aas-core",
        ),
        question_row(
            id_="q-j4-3-3-cong-011",
            title="RHS 實作（中等06）",
            chapter_code="j4-3-3",
            difficulty="中等",
            question_text="兩個直角三角形斜邊相等且一股相等，是否可判定全等？",
            answer_text="可以，RHS。",
            explanation_text="直角條件 + 斜邊 + 一股即 RHS。",
            topic_id="j4-3-3-rhs-hl-right-triangle",
        ),
        question_row(
            id_="q-j4-3-3-cong-012",
            title="證明流程（中等07）",
            chapter_code="j4-3-3",
            difficulty="中等",
            question_text="證明題中，寫出全等後下一步最常做什麼？",
            answer_text="使用 CPCTC 推對應邊角相等。",
            explanation_text="全等結論是推後續長度角度關係的起點。",
            topic_id="j4-3-3-proof-structure",
        ),
        question_row(
            id_="q-j4-3-3-cong-013",
            title="順序陷阱（進階01）",
            chapter_code="j4-3-3",
            difficulty="進階",
            question_text=r"若誤把 $\triangle ABC\cong\triangle DEF$ 寫成 $\triangle ABC\cong\triangle EFD$，最可能造成什麼問題？",
            answer_text="對應關係錯誤，後續等式全錯。",
            explanation_text="全等式順序改變會改變邊角對應。",
            topic_id="j4-3-3-congruence-correspondence",
        ),
        question_row(
            id_="q-j4-3-3-cong-014",
            title="正圖形條件（進階02）",
            chapter_code="j4-3-3",
            difficulty="進階",
            question_text="正方形題要做全等證明時，最常直接拿來用的兩種資訊是什麼？",
            answer_text="邊相等與直角（90°）。",
            explanation_text="正方形定義同時提供邊長與角度條件。",
            topic_id="j4-3-3-regular-shape-congruence",
        ),
        question_row(
            id_="q-j4-3-3-cong-015",
            title="摺疊判讀（進階03）",
            chapter_code="j4-3-3",
            difficulty="進階",
            question_text="摺疊後重合的兩線段通常可推得什麼關係？",
            answer_text="兩線段等長（或兩角相等）。",
            explanation_text="摺疊是對應重合，保距離與角度。",
            topic_id="j4-3-3-folding-and-right-triangle",
        ),
        question_row(
            id_="q-j4-3-3-cong-016",
            title="判定選擇（進階04）",
            chapter_code="j4-3-3",
            difficulty="進階",
            question_text="考場上遇到判定不確定時，第一個優先檢查點是什麼？",
            answer_text="是否是直角三角形（可先考慮 RHS）。",
            explanation_text="先分流可快速縮小判定範圍。",
            topic_id="j4-3-3-criteria-selection-strategy",
        ),
        question_row(
            id_="q-j4-3-3-cong-017",
            title="全等與周長（進階05）",
            chapter_code="j4-3-3",
            difficulty="進階",
            question_text="兩三角形全等時，周長與面積有何關係？",
            answer_text="周長相等、面積相等。",
            explanation_text="全等代表形狀與大小完全一致。",
            topic_id="j4-3-3-area-perimeter-application",
        ),
        question_row(
            id_="q-j4-3-3-cong-018",
            title="CPCTC 先後（進階06）",
            chapter_code="j4-3-3",
            difficulty="進階",
            question_text="可否在尚未證全等前直接使用對應邊角相等？",
            answer_text="不可。",
            explanation_text="必須先有全等結論，才能用 CPCTC。",
            topic_id="j4-3-3-cpctc-application",
        ),
        question_row(
            id_="q-j4-3-3-cong-019",
            title="SSA 反例觀念（中等08）",
            chapter_code="j4-3-3",
            difficulty="中等",
            question_text="SSA 為什麼常被稱為全等判定陷阱？",
            answer_text="因為可能對應兩個不同三角形。",
            explanation_text="同條件不一定唯一決定形狀。",
            topic_id="j4-3-3-ssa-counterexample",
        ),
        question_row(
            id_="q-j4-3-3-cong-020",
            title="流程填空（中等09）",
            chapter_code="j4-3-3",
            difficulty="中等",
            question_text="全等證明四步驟：列條件→____→得全等→推對應。",
            answer_text="選判定（SSS/SAS/ASA/AAS/RHS）",
            explanation_text="判定步驟是從條件到全等的橋樑。",
            topic_id="j4-3-3-proof-structure",
        ),
        question_row(
            id_="q-j4-3-3-cong-021",
            title="SAS/SSA 區分（中等10）",
            chapter_code="j4-3-3",
            difficulty="中等",
            question_text="兩邊與一角相等時，若角不在兩邊中間，屬於 SAS 還是 SSA？",
            answer_text="SSA。",
            explanation_text="非夾角就是 SSA，不能直接判全等。",
            topic_id="j4-3-3-criteria-selection-strategy",
        ),
        question_row(
            id_="q-j4-3-3-cong-022",
            title="AAS 小題（基礎06）",
            chapter_code="j4-3-3",
            difficulty="基礎",
            question_text="AAS 中的邊一定是夾在兩角中間嗎？",
            answer_text="不一定。",
            explanation_text="若是夾邊就屬 ASA，不是夾邊才是 AAS 特徵。",
            topic_id="j4-3-3-asa-aas-core",
        ),
        question_row(
            id_="q-j4-3-3-cong-023",
            title="RHS 檢查（基礎07）",
            chapter_code="j4-3-3",
            difficulty="基礎",
            question_text="RHS 的 H 代表哪一條邊？",
            answer_text="斜邊（Hypotenuse）。",
            explanation_text="HL 的 H 即斜邊，L 即一股。",
            topic_id="j4-3-3-rhs-hl-right-triangle",
        ),
        question_row(
            id_="q-j4-3-3-cong-024",
            title="判定策略收斂（進階07）",
            chapter_code="j4-3-3",
            difficulty="進階",
            question_text="若題目給兩邊與一角，且同時標示直角，優先嘗試哪一判定？",
            answer_text="先試 RHS，再檢查是否也可整理成 SAS。",
            explanation_text="直角資訊通常可直接啟用 RHS，速度最快。",
            topic_id="j4-3-3-criteria-selection-strategy",
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
    formula_payload["meta"]["lastImportSource"] = f"{Path(SOURCE_MD).name}（重點整理匯入）"

    question_payload["questions"] = questions
    question_payload.setdefault("meta", {})
    question_payload["meta"]["count"] = len(questions)
    question_payload["meta"]["updatedAt"] = now
    question_payload["meta"]["lastImportSource"] = f"{Path(SOURCE_MD).name}（重點整理匯入）"

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
