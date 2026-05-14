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
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三上8_三角形的外心_整理\改國三上8_三角形的外心_易讀版.md"
)
SOURCE_MD_2 = (
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三上9_三角形的內心_整理\改國三上9_三角形的內心_易讀版.md"
)
SOURCE_MD_3 = (
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三上10_三角形的重心_整理\改國三上10_三角形的重心_易讀版.md"
)
SOURCE_REF = (
    f"{Path(SOURCE_MD_1).name} + {Path(SOURCE_MD_2).name} + "
    f"{Path(SOURCE_MD_3).name}（重點整理匯入）"
)

CHAPTER_CODE = "j5-3-3"
CHAPTER_NAME = "三角形的外心、內心與重心"

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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j5-3-3-{ts}{path.suffix}"
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
        "tags": ["word匯入", "三檔整併", CHAPTER_CODE, CHAPTER_NAME, "三心"],
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
        "tags": ["word匯入", "三檔整併", CHAPTER_CODE, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    return [
        topic_row(
            id_="j5-3-3-circumcenter-definition",
            title="外心定義與外接圓",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("外心", r"$O=\text{三邊中垂線交點}$"),
                ("等距", r"$OA=OB=OC$"),
            ],
            usage=["判斷與作圖外心。", "建立外接圓。"],
            examples=["任兩邊中垂線交點即可決定外心。"],
            tips=["外心關鍵字是『中垂線』與『到頂點等距』。"],
            notes=["外接圓通過三個頂點。"],
            mistakes=["把外心誤認為角平分線交點。"],
        ),
        topic_row(
            id_="j5-3-3-circumcenter-position",
            title="外心位置：銳內、直邊、鈍外",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("銳角三角形", r"$O\text{ 在三角形內}$"),
                ("直角三角形", r"$O\text{ 在斜邊中點}$"),
                ("鈍角三角形", r"$O\text{ 在三角形外}$"),
            ],
            usage=["快速定位外心位置。", "檢查作圖合理性。"],
            examples=["直角三角形外心在斜邊中點。"],
            tips=["先判三角形角型，再找外心。"],
            notes=["位置判斷在選擇題很高頻。"],
            mistakes=["鈍角三角形仍把外心畫在內部。"],
        ),
        topic_row(
            id_="j5-3-3-circumcenter-angle-formula",
            title="外心角公式",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("銳角情況", r"$\angle BOC=2\angle A$"),
                ("鈍角情況", r"$\angle BOC=360^\circ-2\angle A$"),
            ],
            usage=["外心角求值。", "角度綜合題。"],
            examples=[r"若 $\angle A=35^\circ$（銳角情況），則 $\angle BOC=70^\circ$。"],
            tips=["先判是銳角模型還鈍角模型。"],
            notes=["公式選錯常導致差 180°。"],
            mistakes=["不分角型直接套 $2A$。"],
        ),
        topic_row(
            id_="j5-3-3-circumcenter-coordinate",
            title="座標求外心：等距方程",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[("等距式", r"$OA=OB,\ OA=OC$")],
            usage=["座標幾何外心。", "求外接圓圓心。"],
            examples=["由兩組距離平方相等可消去根號。"],
            tips=["通常用平方距離比較會更乾淨。"],
            notes=["常和中點、斜率垂直關係連用。"],
            mistakes=["用開根號式直接硬算造成代數錯。"],
        ),
        topic_row(
            id_="j5-3-3-incenter-definition-incircle",
            title="內心定義與內切圓",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("內心", r"$I=\text{三內角平分線交點}$"),
                ("等距", r"$d(I,AB)=d(I,BC)=d(I,CA)=r$"),
            ],
            usage=["判斷內心與作內切圓。", "內切圓半徑題。"],
            examples=["作兩條角平分線即可定位內心。"],
            tips=["內心關鍵字是『到三邊等距』。"],
            notes=["內心永遠在三角形內。"],
            mistakes=["把到邊等距誤寫成到頂點等距。"],
        ),
        topic_row(
            id_="j5-3-3-incenter-angle-formula",
            title="內心角公式",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[("公式", r"$\angle BIC=90^\circ+\frac{1}{2}\angle A$")],
            usage=["內心角求值。", "角度綜合題。"],
            examples=[r"若 $\angle A=50^\circ$，則 $\angle BIC=115^\circ$。"],
            tips=["公式中的 A 是與 BIC 對應的不相鄰角。"],
            notes=["常和角平分線條件一起出現。"],
            mistakes=["誤用減號而非加號。"],
        ),
        topic_row(
            id_="j5-3-3-incenter-tangent-length",
            title="內切圓切線長相等",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[("同點引切線", r"$PA=PB$")],
            usage=["內切圓邊長拆分。", "直角三角形內切圓題。"],
            examples=["同一頂點對應兩條切線段長度相等。"],
            tips=["先標每個頂點引出的成對切線段。"],
            notes=["線段代換非常常用。"],
            mistakes=["把不同頂點切線段誤判為相等。"],
        ),
        topic_row(
            id_="j5-3-3-incenter-area-formula",
            title="內心面積公式與比例",
            chapter_role="公式與性質",
            difficulty="進階",
            formula_lines=[
                ("面積公式", r"$[\triangle ABC]=\frac{1}{2}\cdot P\cdot r=s\cdot r$"),
                ("比例", r"$[\triangle AIB]:[\triangle BIC]:[\triangle CIA]=a:b:c$"),
            ],
            usage=["由面積求內切圓半徑。", "面積比題。"],
            examples=[r"已知面積與周長可直接求 $r$。"],
            tips=["確認 P 是周長、s 是半周長。"],
            notes=["與切線長分段題可互補。"],
            mistakes=["把周長與半周長混淆。"],
        ),
        topic_row(
            id_="j5-3-3-centroid-definition-medians",
            title="重心定義與中線",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("中線", r"$\text{頂點連到對邊中點}$"),
                ("重心", r"$G=\text{三中線交點}$"),
            ],
            usage=["辨識重心題型。", "中線作圖與判斷。"],
            examples=["三條中線必共點於重心。"],
            tips=["看到平衡點通常就是重心。"],
            notes=["重心永遠在三角形內。"],
            mistakes=["把中垂線當中線。"],
        ),
        topic_row(
            id_="j5-3-3-centroid-ratio-2-1",
            title="重心 2:1 性質",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[("比例", r"$AG:GD=2:1$")],
            usage=["長度換算題。", "快速求中線相關長度。"],
            examples=[r"若 $AD=12$，則 $AG=8,GD=4$。"],
            tips=["頂點到重心是較長的 2 份。"],
            notes=["2:1 是重心最核心數值特徵。"],
            mistakes=["把 2:1 倒成 1:2。"],
        ),
        topic_row(
            id_="j5-3-3-centroid-area-partition",
            title="重心與面積分割",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("一中線", r"$\text{把三角形面積平分成兩半}$"),
                ("三中線", r"$\text{分成六個等面積小三角形}$"),
            ],
            usage=["面積比例題。", "幾何分割驗算。"],
            examples=[r"若總面積 60，六小塊各 10。"],
            tips=["先判是用一中線還三中線模型。"],
            notes=["常與 2:1 長度比例合併考。"],
            mistakes=["把六等分誤看成三等分。"],
        ),
        topic_row(
            id_="j5-3-3-centroid-coordinate",
            title="座標重心：平均座標",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[("座標", r"$G\left(\frac{x_1+x_2+x_3}{3},\frac{y_1+y_2+y_3}{3}\right)$")],
            usage=["座標求重心。", "反推頂點座標。"],
            examples=[r"$A(0,0),B(6,0),C(0,3)\Rightarrow G(2,1)$。"],
            tips=["公式最快，但要先確認三個頂點都正確。"],
            notes=["也可用兩條中線聯立求交點驗證。"],
            mistakes=["分母誤寫成 2。"],
        ),
        topic_row(
            id_="j5-3-3-centers-comparison",
            title="三心比較：外心、內心、重心",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("外心", r"$\text{到三頂點等距}$"),
                ("內心", r"$\text{到三邊等距}$"),
                ("重心", r"$\text{中線交點，2:1}$"),
            ],
            usage=["快速判別要用哪個中心。", "整合題方向選擇。"],
            examples=["題目問等距到頂點，多半是外心。"],
            tips=["先看『等距對象』是點還是邊。"],
            notes=["三心混題常靠這一步解鎖。"],
            mistakes=["外心與內心條件混用。"],
        ),
        topic_row(
            id_="j5-3-3-equilateral-special-case",
            title="正三角形特例：三心共點",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[("共點", r"$O=I=G$")],
            usage=["特例快速判斷。", "簡化計算。"],
            examples=["正三角形中外心、內心、重心重合。"],
            tips=["一旦判定正三角形，可大幅簡化。"],
            notes=["也常包含垂心共點。"],
            mistakes=["把等腰三角形也當三心共點。"],
        ),
        topic_row(
            id_="j5-3-3-proof-and-construction-strategy",
            title="證明與作圖策略：先找線再找等距",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[("流程", r"$\text{判中心類型}\rightarrow\text{作核心線}\rightarrow\text{用等距性質}$")],
            usage=["綜合證題與作圖題。", "降低三心混題失誤。"],
            examples=["外心先作中垂線；內心先作角平分線；重心先作中線。"],
            tips=["不要同時開三條路，先鎖定中心類型。"],
            notes=["此流程能快速選到正確工具。"],
            mistakes=["中心類型未判定就開始計算。"],
        ),
        topic_row(
            id_="j5-3-3-chapter-checklist",
            title="本章檢查表：中心類型、等距對象、比例關係",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[("終檢", r"$\text{中心判定}\rightarrow\text{公式適配}\rightarrow\text{回代驗算}$")],
            usage=["段考前與作答後檢核。", "防止混用公式。"],
            examples=["先確認『到點等距』或『到邊等距』。"],
            tips=["最後 20 秒做一次三心對照。"],
            notes=["大部分錯誤是中心混淆。"],
            mistakes=["未檢查就交卷，導致型別錯用。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j5-3-3-center-001",
            title="外心定義（基礎01）",
            difficulty="基礎",
            question_text="外心是哪些線的交點？",
            answer_text="三邊中垂線的交點。",
            explanation_text="外心定義直接給出作圖方向。",
            topic_id="j5-3-3-circumcenter-definition",
        ),
        question_row(
            id_="q-j5-3-3-center-002",
            title="外心等距（基礎02）",
            difficulty="基礎",
            question_text=r"若 O 是外心，$OA,OB,OC$ 有何關係？",
            answer_text=r"$OA=OB=OC$。",
            explanation_text="外心到三頂點等距。",
            topic_id="j5-3-3-circumcenter-definition",
        ),
        question_row(
            id_="q-j5-3-3-center-003",
            title="外心位置（基礎01）",
            difficulty="基礎",
            question_text="直角三角形的外心在哪裡？",
            answer_text="斜邊中點。",
            explanation_text="直角三角形外接圓直徑是斜邊。",
            topic_id="j5-3-3-circumcenter-position",
        ),
        question_row(
            id_="q-j5-3-3-center-004",
            title="外心位置（基礎02）",
            difficulty="基礎",
            question_text="鈍角三角形外心在三角形內還外？",
            answer_text="在外部。",
            explanation_text="鈍角情況中垂線交點落於外部。",
            topic_id="j5-3-3-circumcenter-position",
        ),
        question_row(
            id_="q-j5-3-3-center-005",
            title="外心角公式（中等01）",
            difficulty="中等",
            question_text=r"銳角情況下，若 $\angle A=40^\circ$，求 $\angle BOC$。",
            answer_text=r"$80^\circ$。",
            explanation_text=r"$\angle BOC=2\angle A=80^\circ$。",
            topic_id="j5-3-3-circumcenter-angle-formula",
        ),
        question_row(
            id_="q-j5-3-3-center-006",
            title="外心角公式（中等02）",
            difficulty="中等",
            question_text=r"鈍角情況下，若 $\angle A=110^\circ$，求 $\angle BOC$。",
            answer_text=r"$140^\circ$。",
            explanation_text=r"$\angle BOC=360^\circ-2\angle A=360^\circ-220^\circ=140^\circ$。",
            topic_id="j5-3-3-circumcenter-angle-formula",
        ),
        question_row(
            id_="q-j5-3-3-center-007",
            title="座標外心（進階01）",
            difficulty="進階",
            question_text="座標求外心時，最常用哪兩組方程？",
            answer_text=r"$OA=OB$ 與 $OA=OC$。",
            explanation_text="兩組等距即可求交點。",
            topic_id="j5-3-3-circumcenter-coordinate",
        ),
        question_row(
            id_="q-j5-3-3-center-008",
            title="座標外心（進階02）",
            difficulty="進階",
            question_text="為何座標外心題常先比較平方距離？",
            answer_text="可消去根號、計算更穩定。",
            explanation_text="代數化簡更直接。",
            topic_id="j5-3-3-circumcenter-coordinate",
        ),
        question_row(
            id_="q-j5-3-3-center-009",
            title="內心定義（基礎01）",
            difficulty="基礎",
            question_text="內心是哪些線的交點？",
            answer_text="三內角角平分線交點。",
            explanation_text="內心定義直接對應作圖。",
            topic_id="j5-3-3-incenter-definition-incircle",
        ),
        question_row(
            id_="q-j5-3-3-center-010",
            title="內心等距（基礎02）",
            difficulty="基礎",
            question_text="內心到三邊距離有何關係？",
            answer_text="相等。",
            explanation_text="內切圓半徑就是此共同距離。",
            topic_id="j5-3-3-incenter-definition-incircle",
        ),
        question_row(
            id_="q-j5-3-3-center-011",
            title="內心角公式（中等01）",
            difficulty="中等",
            question_text=r"若 $\angle A=50^\circ$，求 $\angle BIC$。",
            answer_text=r"$115^\circ$。",
            explanation_text=r"$\angle BIC=90^\circ+\frac{1}{2}\angle A=115^\circ$。",
            topic_id="j5-3-3-incenter-angle-formula",
        ),
        question_row(
            id_="q-j5-3-3-center-012",
            title="內心角公式（中等02）",
            difficulty="中等",
            question_text=r"若 $\angle BIC=130^\circ$，求 $\angle A$。",
            answer_text=r"$80^\circ$。",
            explanation_text=r"$130=90+\frac{1}{2}A\Rightarrow A=80$。",
            topic_id="j5-3-3-incenter-angle-formula",
        ),
        question_row(
            id_="q-j5-3-3-center-013",
            title="切線長相等（中等01）",
            difficulty="中等",
            question_text="同一點引圓兩切線段長度關係？",
            answer_text="相等。",
            explanation_text="切線長相等定理。",
            topic_id="j5-3-3-incenter-tangent-length",
        ),
        question_row(
            id_="q-j5-3-3-center-014",
            title="切線長相等（中等02）",
            difficulty="中等",
            question_text="內切圓邊長分段題常用哪個關鍵代換？",
            answer_text="同頂點引出的兩條切線段相等。",
            explanation_text="可把未知數數量大幅降低。",
            topic_id="j5-3-3-incenter-tangent-length",
        ),
        question_row(
            id_="q-j5-3-3-center-015",
            title="內心面積公式（進階01）",
            difficulty="進階",
            question_text=r"若三角形面積 $S=30$，半周長 $s=10$，求內切圓半徑 r。",
            answer_text="3。",
            explanation_text=r"$S=s\cdot r\Rightarrow r=30/10=3$。",
            topic_id="j5-3-3-incenter-area-formula",
        ),
        question_row(
            id_="q-j5-3-3-center-016",
            title="內心面積比例（進階02）",
            difficulty="進階",
            question_text="AIB、BIC、CIA 面積比通常對應什麼比？",
            answer_text="三邊長比。",
            explanation_text="共用到邊距離後可轉為底邊比。",
            topic_id="j5-3-3-incenter-area-formula",
        ),
        question_row(
            id_="q-j5-3-3-center-017",
            title="重心定義（基礎01）",
            difficulty="基礎",
            question_text="重心是哪些線的交點？",
            answer_text="三條中線交點。",
            explanation_text="重心定義直接對應中線。",
            topic_id="j5-3-3-centroid-definition-medians",
        ),
        question_row(
            id_="q-j5-3-3-center-018",
            title="重心位置（基礎02）",
            difficulty="基礎",
            question_text="重心在三角形內還外？",
            answer_text="永遠在內部。",
            explanation_text="三中線交點必位於內部。",
            topic_id="j5-3-3-centroid-definition-medians",
        ),
        question_row(
            id_="q-j5-3-3-center-019",
            title="2:1 比例（中等01）",
            difficulty="中等",
            question_text=r"若中線長 $AD=15$，求 $AG$ 與 $GD$。",
            answer_text=r"$AG=10,\ GD=5$。",
            explanation_text=r"$AG:GD=2:1$，總長 15 分成 3 份。",
            topic_id="j5-3-3-centroid-ratio-2-1",
        ),
        question_row(
            id_="q-j5-3-3-center-020",
            title="2:1 比例（中等02）",
            difficulty="中等",
            question_text=r"若 $AG=12$，中線全長 $AD$ 為何？",
            answer_text="18。",
            explanation_text=r"$AG=\frac{2}{3}AD\Rightarrow AD=18$。",
            topic_id="j5-3-3-centroid-ratio-2-1",
        ),
        question_row(
            id_="q-j5-3-3-center-021",
            title="重心面積（中等01）",
            difficulty="中等",
            question_text="三中線把三角形切成幾個等面積小三角形？",
            answer_text="6 個。",
            explanation_text="重心分割經典結果。",
            topic_id="j5-3-3-centroid-area-partition",
        ),
        question_row(
            id_="q-j5-3-3-center-022",
            title="重心面積（中等02）",
            difficulty="中等",
            question_text=r"若全三角形面積為 48，六小塊每塊面積？",
            answer_text="8。",
            explanation_text=r"$48\div 6=8$。",
            topic_id="j5-3-3-centroid-area-partition",
        ),
        question_row(
            id_="q-j5-3-3-center-023",
            title="座標重心（中等01）",
            difficulty="中等",
            question_text=r"$A(0,0),B(6,0),C(0,9)$ 的重心座標？",
            answer_text=r"$(2,3)$。",
            explanation_text=r"$G\left(\frac{0+6+0}{3},\frac{0+0+9}{3}\right)=(2,3)$。",
            topic_id="j5-3-3-centroid-coordinate",
        ),
        question_row(
            id_="q-j5-3-3-center-024",
            title="座標重心（中等02）",
            difficulty="中等",
            question_text="重心平均座標公式分母是幾？",
            answer_text="3。",
            explanation_text="三個頂點取平均。",
            topic_id="j5-3-3-centroid-coordinate",
        ),
        question_row(
            id_="q-j5-3-3-center-025",
            title="三心比較（中等01）",
            difficulty="中等",
            question_text="題目說「到三頂點等距」，應先想到哪個中心？",
            answer_text="外心。",
            explanation_text="外心定義即到三頂點等距。",
            topic_id="j5-3-3-centers-comparison",
        ),
        question_row(
            id_="q-j5-3-3-center-026",
            title="三心比較（中等02）",
            difficulty="中等",
            question_text="題目說「到三邊等距」，應先想到哪個中心？",
            answer_text="內心。",
            explanation_text="內心是角平分線交點且到三邊等距。",
            topic_id="j5-3-3-centers-comparison",
        ),
        question_row(
            id_="q-j5-3-3-center-027",
            title="正三角形特例（基礎01）",
            difficulty="基礎",
            question_text="正三角形中外心、內心、重心關係？",
            answer_text="三者共點。",
            explanation_text="正三角形對稱性最高。",
            topic_id="j5-3-3-equilateral-special-case",
        ),
        question_row(
            id_="q-j5-3-3-center-028",
            title="正三角形特例（基礎02）",
            difficulty="基礎",
            question_text="等腰三角形也一定三心共點嗎？",
            answer_text="不一定。",
            explanation_text="三心共點是正三角形特例。",
            topic_id="j5-3-3-equilateral-special-case",
        ),
        question_row(
            id_="q-j5-3-3-center-029",
            title="作圖策略（進階01）",
            difficulty="進階",
            question_text="外心、內心、重心三類題，第一步策略是什麼？",
            answer_text="先判中心類型，再作對應核心線。",
            explanation_text="外心-中垂線、內心-角平分線、重心-中線。",
            topic_id="j5-3-3-proof-and-construction-strategy",
        ),
        question_row(
            id_="q-j5-3-3-center-030",
            title="作圖策略（進階02）",
            difficulty="進階",
            question_text="若先判不出中心類型就直接算，常見問題是什麼？",
            answer_text="容易套錯公式或作錯線。",
            explanation_text="三心條件彼此不同，混用會失真。",
            topic_id="j5-3-3-proof-and-construction-strategy",
        ),
        question_row(
            id_="q-j5-3-3-center-031",
            title="章節檢查（進階01）",
            difficulty="進階",
            question_text="本章最後檢查三步是什麼？",
            answer_text="中心判定、公式適配、回代驗算。",
            explanation_text="可快速排除型別錯誤。",
            topic_id="j5-3-3-chapter-checklist",
        ),
        question_row(
            id_="q-j5-3-3-center-032",
            title="章節檢查（進階02）",
            difficulty="進階",
            question_text="三心題最常見失誤來源？",
            answer_text="外心、內心、重心條件混用。",
            explanation_text="先辨識等距對象可避免這類錯誤。",
            topic_id="j5-3-3-chapter-checklist",
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

