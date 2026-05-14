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
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三上5_圓與角_整理\改國三上5_圓與角_易讀版.md"
)
SOURCE_REF = f"{Path(SOURCE_MD).name}（重點整理匯入）"

CHAPTER_CODE = "j5-2-2"
CHAPTER_NAME = "圓與角"

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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j5-2-2-{ts}{path.suffix}"
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
        "tags": ["word匯入", "教學核心", CHAPTER_CODE, CHAPTER_NAME, "圓角"],
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
            id_="j5-2-2-arc-chord-basics",
            title="弧與弦基本辨識",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("弧", r"$\overset{\frown}{AB}$"),
                ("弦", r"$AB\ (\text{連圓上兩點的線段})$"),
            ],
            usage=["先分清圓上的弧與圓內的弦。", "避免公式套錯對象。"],
            examples=["同一對端點有弧長與弦長兩種不同量。"],
            tips=["題目說角度通常對弧，說長度通常對弦。"],
            notes=["基本名詞分清，後面角度題才穩。"],
            mistakes=["把弧長當成弦長直接代。"],
        ),
        topic_row(
            id_="j5-2-2-central-angle-arc-degree",
            title="圓心角與弧度數",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[("對應", r"$m\overset{\frown}{AB}=m\angle AOB$")],
            usage=["由圓心角直接得到所對弧度數。", "角弧對應的起點。"],
            examples=[r"若 $\angle AOB=72^\circ$，則弧 AB 度數也是 $72^\circ$。"],
            tips=["圓心角幾度，對弧就幾度。"],
            notes=["這是圓與角章最根本對應。"],
            mistakes=["把圓周角也當成同值。"],
        ),
        topic_row(
            id_="j5-2-2-arc-length-radian",
            title="弧長公式與徑度觀念",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("角度制", r"$s=\frac{\theta}{360^\circ}\cdot 2\pi r$"),
                ("徑度制", r"$s=r\theta$"),
            ],
            usage=["弧長計算與單位轉換。", "滾動距離題。"],
            examples=[r"$r=6,\theta=60^\circ\Rightarrow s=2\pi$。"],
            tips=["先確認題目角度是度還是徑度。"],
            notes=["徑度在單位圓題很常用。"],
            mistakes=[r"度數直接代進 $s=r\theta$。"],
        ),
        topic_row(
            id_="j5-2-2-concentric-arc-chord-order",
            title="同心圓與角弧弦大小對應",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("同心圓提醒", r"$\theta\text{ 相同}\Rightarrow m\overset{\frown}{AB}\text{ 相同，弧長不一定相同}$"),
                ("同圓對應", r"$\angle\text{ 大}\Rightarrow \overset{\frown}{}\text{ 大}\Rightarrow \text{弦長大}$"),
            ],
            usage=["比較角、弧、弦大小。", "同心圓誤解排除。"],
            examples=["同角在大圓對應弧長會更長。"],
            tips=["度數與長度是不同層次概念。"],
            notes=["同心圓題最常在這裡失分。"],
            mistakes=["把弧度數相同誤認為弧長相同。"],
        ),
        topic_row(
            id_="j5-2-2-rolling-arc-distance",
            title="扇形滾動與弧長位移",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[("無滑動", r"$\text{位移}=s$")],
            usage=["滾輪、扇形移動距離題。", "把物理敘述轉幾何。"],
            examples=["輪子無滑動前進距離等於滾過弧長。"],
            tips=["先確認題目是否『無滑動』。"],
            notes=["本質是弧長公式應用。"],
            mistakes=["把直徑或半徑當位移。"],
        ),
        topic_row(
            id_="j5-2-2-inscribed-angle-basics",
            title="圓周角基本性質",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("圓周角", r"$m\angle APB=\frac{1}{2}m\overset{\frown}{AB}$"),
                ("直徑對角", r"$\overset{\frown}{AB}=180^\circ\Rightarrow \angle APB=90^\circ$"),
                ("同弧", r"$\overset{\frown}{AB}\text{ 相同}\Rightarrow \angle ACB=\angle ADB$"),
            ],
            usage=["圓周角求值與角度追蹤。", "半圓直角判斷。"],
            examples=[r"若弧 AB 為 $80^\circ$，圓周角為 $40^\circ$。"],
            tips=["先找頂點是否在圓上。"],
            notes=["圓周角題通常先找所對弧。"],
            mistakes=["忘記除以 2。"],
        ),
        topic_row(
            id_="j5-2-2-tangent-chord-angle",
            title="弦切角與圓周角對應",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[("弦切角", r"$m\angle(\text{切線,弦})=\frac{1}{2}m\overset{\frown}{AB}$")],
            usage=["切線角與弧度數計算。", "與圓周角互轉。"],
            examples=["同一段弧給出的弦切角與圓周角相等。"],
            tips=["弦切角先找『切點』再找『所對弧』。"],
            notes=["很多題目會混合圓周角與弦切角。"],
            mistakes=["把弦切角當圓心角。"],
        ),
        topic_row(
            id_="j5-2-2-interior-exterior-angle",
            title="圓內角與圓外角",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("圓內角", r"$m\angle=\frac{1}{2}(\text{兩對弧和})$"),
                ("圓外角", r"$m\angle=\frac{1}{2}(\text{大弧}-\text{小弧})$"),
            ],
            usage=["兩弦交圓內、割線交圓外題。", "選公式判斷。"],
            examples=["同圖形頂點換位置，公式就會變。"],
            tips=["先看頂點在圓內還圓外。"],
            notes=["是本章公式選擇分水嶺。"],
            mistakes=["把圓外角也用『和的一半』。"],
        ),
        topic_row(
            id_="j5-2-2-angle-formula-map",
            title="圓中角公式地圖：先看頂點位置",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[
                ("圓心", r"$\text{角}=\text{弧}$"),
                ("圓周/弦切", r"$\text{角}=\frac{1}{2}\text{弧}$"),
                ("圓內", r"$\text{角}=\frac{1}{2}(\text{弧和})$"),
                ("圓外", r"$\text{角}=\frac{1}{2}(\text{弧差})$"),
            ],
            usage=["混合角度題快速選公式。", "考前總整理。"],
            examples=["先判位置再選公式，幾乎不會用錯。"],
            tips=["永遠先問：角的頂點在哪裡？"],
            notes=["這張地圖可對應整章 80% 題型。"],
            mistakes=["先算再判位置，常會走錯。"],
        ),
        topic_row(
            id_="j5-2-2-arc-ratio-partition",
            title="弧比例分配題",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[("整圓", r"$m\overset{\frown}{}_{\text{全}}=360^\circ$"), ("半圓", r"$180^\circ$")],
            usage=["多弧比例與角度分配。", "半圓、整圓分段題。"],
            examples=[r"若弧比為 $2:3$ 且總為 $180^\circ$，則分別為 $72^\circ,108^\circ$。"],
            tips=["先轉成份數，再乘每份角度。"],
            notes=["常與圓周角連用。"],
            mistakes=["份數總和算錯。"],
        ),
        topic_row(
            id_="j5-2-2-power-inside",
            title="內冪性質：兩弦交於圓內",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[("內冪", r"$PA\cdot PB=PC\cdot PD$")],
            usage=["圓內交點線段乘積題。", "快速求未知段長。"],
            examples=[r"$PA=2,PB=6,PC=3\Rightarrow PD=4$。"],
            tips=["先確認交點在圓內。"],
            notes=["內冪公式左右各是一條弦的兩段。"],
            mistakes=["把外段全段模型套進來。"],
        ),
        topic_row(
            id_="j5-2-2-power-outside",
            title="外冪性質：兩割線從圓外一點出發",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[("外冪", r"$PA\cdot PB=PC\cdot PD$"), ("等價", r"$\text{外段}\times\text{全段}=\text{外段}\times\text{全段}$")],
            usage=["圓外兩割線長度計算。", "與切割線定理銜接。"],
            examples=[r"$\text{外段 }4,\text{全段 }10\Rightarrow \text{另一組乘積也為 }40$。"],
            tips=["外冪題畫圖把『外段/全段』標清。"],
            notes=["形式看似相同，但幾何位置不同。"],
            mistakes=["把圓內段誤標成外段。"],
        ),
        topic_row(
            id_="j5-2-2-tangent-secant-theorem",
            title="切割線性質：切線平方",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[("切割線", r"$PT^2=PA\cdot PB$")],
            usage=["外點一切線一割線題。", "切線長與割線長互求。"],
            examples=[r"$PA=3,PB=12\Rightarrow PT=6$。"],
            tips=["切線長是平方型，別漏開根號。"],
            notes=["是外冪的特殊情況。"],
            mistakes=[r"寫成 $PT=PA\cdot PB$。"],
        ),
        topic_row(
            id_="j5-2-2-power-from-similarity",
            title="乘冪來源：相似三角形",
            chapter_role="公式與性質",
            difficulty="進階",
            formula_lines=[("來源", r"$\triangle \sim \triangle \Rightarrow \text{對應邊比例}\Rightarrow \text{乘積式}$")],
            usage=["證明乘冪定理。", "理解而非硬背。"],
            examples=["畫出輔助角後以 AA 相似導出乘積關係。"],
            tips=["先證角相等再列比例。"],
            notes=["理解來源可避免公式記混。"],
            mistakes=["直接背式不看適用圖形。"],
        ),
        topic_row(
            id_="j5-2-2-diameter-circumcircle-integration",
            title="直徑與外接圓綜合",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[("半圓直角", r"$\text{直徑所對圓周角}=90^\circ$"), ("綜合", r"$\text{同弧角}+\text{相似}$")],
            usage=["直角、同弧角、相似混合題。", "證明與計算整合。"],
            examples=["常見於四點共圓與直角判斷。"],
            tips=["看到直徑先想 90 度。"],
            notes=["是本章跨單元整合核心。"],
            mistakes=["沒先抓 90 度就展開複雜計算。"],
        ),
        topic_row(
            id_="j5-2-2-sector-triangle-area-integration",
            title="圓與角面積綜合：扇形減三角形",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("扇形", r"$S_{\text{sector}}=\frac{\theta}{360^\circ}\pi r^2$"),
                ("圓弓形", r"$S_{\text{segment}}=S_{\text{sector}}-S_{\triangle}$"),
            ],
            usage=["弧形區域面積題。", "角度先行的面積計算。"],
            examples=[r"先求中心角，再分別算扇形與三角形面積。"],
            tips=["流程固定：先角度、再扇形、後三角形。"],
            notes=["面積題最常因角度錯誤而全盤錯。"],
            mistakes=["跳過角度直接套面積公式。"],
        ),
        topic_row(
            id_="j5-2-2-chapter-checklist",
            title="本章解題檢查表",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[
                ("步驟", r"$\text{先看頂點位置}\rightarrow\text{選公式}\rightarrow\text{列式}\rightarrow\text{驗算}$"),
                ("重點", r"$\text{弧、弦、角、線段位置要同時核對}$"),
            ],
            usage=["綜合題與複合圖形檢核。", "考場防呆流程。"],
            examples=["頂點位置判錯，整題公式會錯。"],
            tips=["每次列式前先寫『此角屬於哪一類』。"],
            notes=["能顯著降低粗心錯。"],
            mistakes=["直接代公式不標角類型。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j5-2-2-angle-001",
            title="弧弦辨識（基礎01）",
            difficulty="基礎",
            question_text="弧與弦最大的差別是什麼？",
            answer_text="弧在圓周上，弦在圓內是線段。",
            explanation_text="兩者端點可同，但幾何對象不同。",
            topic_id="j5-2-2-arc-chord-basics",
        ),
        question_row(
            id_="q-j5-2-2-angle-002",
            title="弧弦辨識（基礎02）",
            difficulty="基礎",
            question_text="同一對端點 A、B，弧 AB 與弦 AB 可以直接視為同一數值嗎？",
            answer_text="不行。",
            explanation_text="弧長與弦長一般不相等。",
            topic_id="j5-2-2-arc-chord-basics",
        ),
        question_row(
            id_="q-j5-2-2-angle-003",
            title="圓心角對弧（基礎01）",
            difficulty="基礎",
            question_text=r"若圓心角 $\angle AOB=96^\circ$，弧 AB 度數為何？",
            answer_text=r"$96^\circ$。",
            explanation_text="圓心角度數等於所對弧度數。",
            topic_id="j5-2-2-central-angle-arc-degree",
        ),
        question_row(
            id_="q-j5-2-2-angle-004",
            title="圓心角對弧（基礎02）",
            difficulty="基礎",
            question_text="圓心角與圓周角，哪一個與所對弧同值？",
            answer_text="圓心角。",
            explanation_text="圓周角是所對弧的一半。",
            topic_id="j5-2-2-central-angle-arc-degree",
        ),
        question_row(
            id_="q-j5-2-2-angle-005",
            title="弧長公式（中等01）",
            difficulty="中等",
            question_text=r"半徑 9、圓心角 $80^\circ$ 的弧長為何？",
            answer_text=r"$4\pi$。",
            explanation_text=r"$s=\frac{80}{360}\cdot 2\pi\cdot 9=4\pi$。",
            topic_id="j5-2-2-arc-length-radian",
        ),
        question_row(
            id_="q-j5-2-2-angle-006",
            title="徑度公式（中等02）",
            difficulty="中等",
            question_text=r"若 $r=5,\theta=1.2$（徑度），弧長 s 為何？",
            answer_text="6。",
            explanation_text=r"$s=r\theta=5\times1.2=6$。",
            topic_id="j5-2-2-arc-length-radian",
        ),
        question_row(
            id_="q-j5-2-2-angle-007",
            title="同心圓提醒（中等01）",
            difficulty="中等",
            question_text="同心圓中圓心角相同時，弧度數與弧長何者一定相同？",
            answer_text="弧度數一定相同，弧長不一定。",
            explanation_text="弧長還受半徑影響。",
            topic_id="j5-2-2-concentric-arc-chord-order",
        ),
        question_row(
            id_="q-j5-2-2-angle-008",
            title="角弧弦排序（中等02）",
            difficulty="中等",
            question_text="同一圓中若圓心角 A 大於圓心角 B，則對應弦長如何比較？",
            answer_text="A 對應弦較長。",
            explanation_text="同圓內角大弧大弦也大。",
            topic_id="j5-2-2-concentric-arc-chord-order",
        ),
        question_row(
            id_="q-j5-2-2-angle-009",
            title="滾動距離（中等01）",
            difficulty="中等",
            question_text="無滑動滾動時，輪子前進距離與什麼量相等？",
            answer_text="滾過的弧長。",
            explanation_text="無滑動條件給出位移=弧長。",
            topic_id="j5-2-2-rolling-arc-distance",
        ),
        question_row(
            id_="q-j5-2-2-angle-010",
            title="滾動距離（中等02）",
            difficulty="中等",
            question_text=r"半徑 2 的輪子轉過 $3\pi$ 徑度，前進多少？",
            answer_text=r"$6\pi$。",
            explanation_text=r"$s=r\theta=2\cdot3\pi=6\pi$。",
            topic_id="j5-2-2-rolling-arc-distance",
        ),
        question_row(
            id_="q-j5-2-2-angle-011",
            title="圓周角（基礎01）",
            difficulty="基礎",
            question_text=r"若弧 AB 為 $110^\circ$，其圓周角為何？",
            answer_text=r"$55^\circ$。",
            explanation_text="圓周角是所對弧的一半。",
            topic_id="j5-2-2-inscribed-angle-basics",
        ),
        question_row(
            id_="q-j5-2-2-angle-012",
            title="半圓直角（基礎02）",
            difficulty="基礎",
            question_text="直徑所對圓周角固定為多少度？",
            answer_text="90 度。",
            explanation_text="所對弧是半圓 180 度，取一半即 90 度。",
            topic_id="j5-2-2-inscribed-angle-basics",
        ),
        question_row(
            id_="q-j5-2-2-angle-013",
            title="弦切角（中等01）",
            difficulty="中等",
            question_text=r"若弦切角所對弧為 $84^\circ$，弦切角為何？",
            answer_text=r"$42^\circ$。",
            explanation_text="弦切角等於所對弧的一半。",
            topic_id="j5-2-2-tangent-chord-angle",
        ),
        question_row(
            id_="q-j5-2-2-angle-014",
            title="弦切角比較（中等02）",
            difficulty="中等",
            question_text="同一段弧所對的弦切角與圓周角大小關係為何？",
            answer_text="相等。",
            explanation_text="兩者都等於該弧的一半。",
            topic_id="j5-2-2-tangent-chord-angle",
        ),
        question_row(
            id_="q-j5-2-2-angle-015",
            title="圓內角（中等01）",
            difficulty="中等",
            question_text="圓內兩弦交角公式是弧和還弧差？",
            answer_text="弧和的一半。",
            explanation_text="圓內角看兩對弧相加。",
            topic_id="j5-2-2-interior-exterior-angle",
        ),
        question_row(
            id_="q-j5-2-2-angle-016",
            title="圓外角（中等02）",
            difficulty="中等",
            question_text="圓外割線角公式是弧和還弧差？",
            answer_text="大弧減小弧的一半。",
            explanation_text="圓外角看弧差。",
            topic_id="j5-2-2-interior-exterior-angle",
        ),
        question_row(
            id_="q-j5-2-2-angle-017",
            title="公式地圖（進階01）",
            difficulty="進階",
            question_text="圓中角題第一步最關鍵判斷是什麼？",
            answer_text="角的頂點位置。",
            explanation_text="位置決定公式類型。",
            topic_id="j5-2-2-angle-formula-map",
        ),
        question_row(
            id_="q-j5-2-2-angle-018",
            title="公式地圖（進階02）",
            difficulty="進階",
            question_text="若頂點在圓外，應優先使用哪類公式？",
            answer_text="弧差的一半（圓外角公式）。",
            explanation_text="圓外角與其他位置公式不同。",
            topic_id="j5-2-2-angle-formula-map",
        ),
        question_row(
            id_="q-j5-2-2-angle-019",
            title="弧比例分配（中等01）",
            difficulty="中等",
            question_text=r"半圓內兩段弧比為 $1:2$，兩弧各為多少度？",
            answer_text=r"$60^\circ,\ 120^\circ$。",
            explanation_text=r"半圓總 $180^\circ$，三份各 $60^\circ$。",
            topic_id="j5-2-2-arc-ratio-partition",
        ),
        question_row(
            id_="q-j5-2-2-angle-020",
            title="弧比例分配（中等02）",
            difficulty="中等",
            question_text=r"整圓分成比 $2:3:4$ 三弧，各弧度數最小那段是多少？",
            answer_text=r"$80^\circ$。",
            explanation_text=r"共 9 份，每份 $40^\circ$，最小段 2 份為 $80^\circ$。",
            topic_id="j5-2-2-arc-ratio-partition",
        ),
        question_row(
            id_="q-j5-2-2-angle-021",
            title="內冪計算（中等01）",
            difficulty="中等",
            question_text=r"若圓內交點滿足 $PA=3,PB=8,PC=4$，求 $PD$。",
            answer_text="6。",
            explanation_text=r"$PA\cdot PB=PC\cdot PD\Rightarrow 24=4PD\Rightarrow PD=6$。",
            topic_id="j5-2-2-power-inside",
        ),
        question_row(
            id_="q-j5-2-2-angle-022",
            title="內冪判斷（中等02）",
            difficulty="中等",
            question_text="內冪題中的交點要在圓內還圓外？",
            answer_text="圓內。",
            explanation_text="這是內冪性質成立條件。",
            topic_id="j5-2-2-power-inside",
        ),
        question_row(
            id_="q-j5-2-2-angle-023",
            title="外冪判斷（中等01）",
            difficulty="中等",
            question_text="兩割線外冪題的共同起點位置在哪裡？",
            answer_text="圓外同一點。",
            explanation_text="外冪模型核心是圓外同點出發。",
            topic_id="j5-2-2-power-outside",
        ),
        question_row(
            id_="q-j5-2-2-angle-024",
            title="外冪乘積（中等02）",
            difficulty="中等",
            question_text=r"若一割線外段與全段為 $5,12$，另一割線外段為 3，求其全段。",
            answer_text="20。",
            explanation_text=r"$5\cdot12=3\cdot x\Rightarrow x=20$。",
            topic_id="j5-2-2-power-outside",
        ),
        question_row(
            id_="q-j5-2-2-angle-025",
            title="切割線定理（中等01）",
            difficulty="中等",
            question_text=r"若 $PA=4,PB=9$，求切線長 $PT$。",
            answer_text="6。",
            explanation_text=r"$PT^2=PA\cdot PB=36\Rightarrow PT=6$。",
            topic_id="j5-2-2-tangent-secant-theorem",
        ),
        question_row(
            id_="q-j5-2-2-angle-026",
            title="切割線定理（中等02）",
            difficulty="中等",
            question_text="切割線定理中的切線長要不要平方？",
            answer_text="要，公式是切線長平方。",
            explanation_text=r"$PT^2=PA\cdot PB$。",
            topic_id="j5-2-2-tangent-secant-theorem",
        ),
        question_row(
            id_="q-j5-2-2-angle-027",
            title="乘冪來源（進階01）",
            difficulty="進階",
            question_text="乘冪公式為何可以從相似三角形推出？",
            answer_text="因為可由角相等建立相似，再由對應邊比推成乘積等式。",
            explanation_text="本質是比例轉換，不是獨立公式。",
            topic_id="j5-2-2-power-from-similarity",
        ),
        question_row(
            id_="q-j5-2-2-angle-028",
            title="乘冪來源（進階02）",
            difficulty="進階",
            question_text="理解乘冪來源對解題有何幫助？",
            answer_text="可辨識適用條件，避免亂套公式。",
            explanation_text="看懂圖形結構比死背更穩。",
            topic_id="j5-2-2-power-from-similarity",
        ),
        question_row(
            id_="q-j5-2-2-angle-029",
            title="直徑綜合（進階01）",
            difficulty="進階",
            question_text="看到直徑跨過圓周角時，第一個應聯想到什麼？",
            answer_text="90 度直角。",
            explanation_text="半圓所對圓周角必為直角。",
            topic_id="j5-2-2-diameter-circumcircle-integration",
        ),
        question_row(
            id_="q-j5-2-2-angle-030",
            title="外接圓綜合（進階02）",
            difficulty="進階",
            question_text="直徑、同弧角、相似常一起出現時，建議先抓哪個條件？",
            answer_text="先抓直角或同弧角的角度關係。",
            explanation_text="先有角度結構才容易判相似。",
            topic_id="j5-2-2-diameter-circumcircle-integration",
        ),
        question_row(
            id_="q-j5-2-2-angle-031",
            title="面積綜合（進階01）",
            difficulty="進階",
            question_text=r"圓弓形面積通常如何求？",
            answer_text="扇形面積減三角形面積。",
            explanation_text=r"$S_{\text{segment}}=S_{\text{sector}}-S_{\triangle}$。",
            topic_id="j5-2-2-sector-triangle-area-integration",
        ),
        question_row(
            id_="q-j5-2-2-angle-032",
            title="面積綜合（進階02）",
            difficulty="進階",
            question_text="圓與角面積題最常見第一步是什麼？",
            answer_text="先求中心角或相關角度。",
            explanation_text="角度錯，後面面積會全錯。",
            topic_id="j5-2-2-sector-triangle-area-integration",
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
