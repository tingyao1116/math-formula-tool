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
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國二下8_平行四邊形_整理\改國二下8_平行四邊形_易讀版.md"
)
SOURCE_REF = f"{Path(SOURCE_MD).name}（重點整理匯入）"

CHAPTER_NAMES = {
    "j4-4-1": "平行四邊形",
    "j4-4-2": "平行四邊形",
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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j4-4-1-j4-4-2-{ts}{path.suffix}"
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
    chapter = CHAPTER_NAMES[chapter_code]
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "國中",
        "grade": "國二",
        "term": "下學期",
        "chapter": chapter,
        "chapterCode": chapter_code,
        "domain": "幾何",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", chapter_code, chapter, "平行四邊形", "教學核心"],
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
    chapter_code: str,
    difficulty: str,
    question_text: str,
    answer_text: str,
    explanation_text: str,
    topic_id: str,
) -> Dict:
    chapter = CHAPTER_NAMES[chapter_code]
    return {
        "id": id_,
        "title": title,
        "question_text": question_text,
        "answer_text": answer_text,
        "explanation_text": explanation_text,
        "stage": "國中",
        "grade": "國二",
        "chapter": chapter,
        "chapter_code": chapter_code,
        "difficulty": difficulty,
        "source_type": "md_summary",
        "source_ref": SOURCE_REF,
        "tags": ["word匯入", chapter_code, chapter, f"topic:{topic_id}", f"難度:{difficulty}"],
    }


def build_topics() -> List[Dict]:
    return [
        topic_row(
            id_="j4-4-1-parallelogram-definition",
            title="平行四邊形的定義與記號",
            chapter_code="j4-4-1",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("定義", r"$AB\parallel CD,\ AD\parallel BC$"),
                ("記號", r"$ABCD\ \text{為平行四邊形}$"),
            ],
            usage=["辨識圖形是否為平行四邊形。", "證明題起手式：先寫出兩組平行。"],
            examples=[r"若四邊形滿足 $AB\parallel CD,\ AD\parallel BC$，可判為平行四邊形。"],
            tips=["先標平行符號，再做角度或邊長推理。"],
            notes=["定義是所有性質與判別的起點。"],
            mistakes=["只看到一組平行就直接判定。"],
        ),
        topic_row(
            id_="j4-4-1-diagonal-congruence",
            title="對角線分成兩個全等三角形",
            chapter_code="j4-4-1",
            chapter_role="核心觀念",
            difficulty="基礎",
            formula_lines=[
                ("全等結論", r"$\triangle ABC\cong\triangle CDA$"),
                ("依據", r"$AB\parallel CD,\ BC\parallel AD$"),
            ],
            usage=["快速推對邊相等、對角相等。", "證明題常用中繼結論。"],
            examples=[r"由 $\triangle ABC\cong\triangle CDA$ 可得 $AB=CD,\ BC=AD$。"],
            tips=["先找對角線，再抓平行線內錯角建立全等。"],
            notes=["這一條可同時推出多個性質。"],
            mistakes=["對應點順序寫錯，導致推錯邊角。"],
        ),
        topic_row(
            id_="j4-4-1-opposite-sides-equal",
            title="性質：兩組對邊分別相等",
            chapter_code="j4-4-1",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[
                ("對邊關係", r"$AB=CD,\ BC=AD$"),
                ("由全等得", r"$\triangle ABC\cong\triangle CDA$"),
            ],
            usage=["邊長計算與周長題。", "與中點、比例題結合。"],
            examples=[r"若 $AB=7,\ BC=5$，則周長 $=2(7+5)=24$。"],
            tips=["看到對邊未知量時，先找另一對邊等量代換。"],
            notes=["常與對角相等同時使用。"],
            mistakes=["把相鄰邊誤認為對邊。"],
        ),
        topic_row(
            id_="j4-4-1-opposite-angles-supplementary",
            title="性質：對角相等、鄰角互補",
            chapter_code="j4-4-1",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[
                ("對角", r"$\angle A=\angle C,\ \angle B=\angle D$"),
                ("鄰角", r"$\angle A+\angle B=180^\circ$"),
            ],
            usage=["角度追蹤與角度方程。", "判斷銳角、鈍角配置。"],
            examples=[r"若 $\angle A=70^\circ$，則 $\angle B=110^\circ,\ \angle C=70^\circ$。"],
            tips=["先用互補求鄰角，再用對角相等補齊。"],
            notes=["角度題最常用的一組性質。"],
            mistakes=["把鄰角寫成相等。"],
        ),
        topic_row(
            id_="j4-4-1-diagonal-bisect-property",
            title="性質：兩條對角線互相平分",
            chapter_code="j4-4-1",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[
                ("交點性質", r"$AO=OC,\ BO=OD$"),
                ("條件", r"$O=AC\cap BD$"),
            ],
            usage=["座標題求第四點。", "線段長度拆解與合併。"],
            examples=[r"若 $AO=6$，則 $AC=12$。"],
            tips=["先標交點 $O$，再把整段拆成兩半。"],
            notes=["判別與應用題都常見。"],
            mistakes=["誤以為對角線一定相等。"],
        ),
        topic_row(
            id_="j4-4-1-criterion-onepair-parallel-equal",
            title="判別：一組對邊平行且相等",
            chapter_code="j4-4-1",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("判別條件", r"$AB\parallel CD,\ AB=CD\Rightarrow ABCD\ \text{是平行四邊形}$"),
                ("本質", r"$\text{方向一致 + 長度一致}$"),
            ],
            usage=["判別題常見最快條件。", "證明四邊形為平行四邊形。"],
            examples=[r"若已知 $AB\parallel CD$ 且 $AB=CD$，可直接結論。"],
            tips=["先檢查是不是『對邊』，不是相鄰邊。"],
            notes=["比兩組平行更省條件。"],
            mistakes=["把一組相鄰邊平行且相等誤用此判別。"],
        ),
        topic_row(
            id_="j4-4-1-criterion-two-pairs-sides",
            title="判別：兩組對邊分別相等",
            chapter_code="j4-4-1",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("判別條件", r"$AB=CD,\ BC=AD\Rightarrow ABCD\ \text{是平行四邊形}$"),
                ("策略", r"$\text{先配對對邊，再檢查是否兩組都成立}$"),
            ],
            usage=["邊長資料充足時的判別。", "段考選擇題高頻。"],
            examples=[r"若 $AB=10,\ CD=10,\ BC=7,\ AD=7$，可判為平行四邊形。"],
            tips=["畫對邊配對箭頭可降低看錯風險。"],
            notes=["與『對角線互相平分』判別可互相替代。"],
            mistakes=["只驗一組邊相等就下結論。"],
        ),
        topic_row(
            id_="j4-4-1-criterion-two-pairs-angles",
            title="判別：兩組對角分別相等",
            chapter_code="j4-4-1",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("判別條件", r"$\angle A=\angle C,\ \angle B=\angle D\Rightarrow ABCD\ \text{是平行四邊形}$"),
                ("角度等價", r"$\angle A+\angle B=180^\circ$"),
            ],
            usage=["角度資訊主導的判別題。", "可轉換成平行線判斷。"],
            examples=[r"若 $\angle A=65^\circ,\ \angle C=65^\circ,\ \angle B=115^\circ,\ \angle D=115^\circ$，可判定。"],
            tips=["先驗對角，再驗鄰角互補會更穩。"],
            notes=["角度判別容易與梯形題混淆。"],
            mistakes=["把一對對角相等誤認為充分條件。"],
        ),
        topic_row(
            id_="j4-4-1-criterion-diagonal-bisect",
            title="判別：兩對角線互相平分",
            chapter_code="j4-4-1",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("判別條件", r"$AO=OC,\ BO=OD\Rightarrow ABCD\ \text{是平行四邊形}$"),
                ("關鍵", r"$O=AC\cap BD$"),
            ],
            usage=["座標幾何和向量題高頻。", "求第四點時可反向判別。"],
            examples=[r"若兩對角線在同一交點皆被平分，直接判平行四邊形。"],
            tips=["先確認是『互相』平分，不是單向平分。"],
            notes=["與中點法互補，計算效率高。"],
            mistakes=["只看到一條對角線被平分就判定。"],
        ),
        topic_row(
            id_="j4-4-2-midpoint-theorem",
            title="三角形兩邊中點連線性質",
            chapter_code="j4-4-2",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("中點連線", r"$DE\parallel BC,\ DE=\frac{1}{2}BC$"),
                ("條件", r"$D,E\ \text{分別為}AB,AC\ \text{中點}$"),
            ],
            usage=["快速求平行與長度比例。", "構造平行四邊形輔助線。"],
            examples=[r"若 $BC=14$，則中點連線 $DE=7$。"],
            tips=["先確認兩個點都在對應邊中點。"],
            notes=["本性質常作為應用題前置工具。"],
            mistakes=["把任意連線都當中點連線。"],
        ),
        topic_row(
            id_="j4-4-2-midpoint-extension-proof",
            title="中點連線延長證明法",
            chapter_code="j4-4-2",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("延長策略", r"$\text{延長中點連線，構造平行四邊形}$"),
                ("常見目標", r"$\text{證平行、證等長、證比例}$"),
            ],
            usage=["證明題中補圖的標準方法。", "把中點題轉為平行四邊形題。"],
            examples=["延長一段到對應位置，利用對邊平行與相等完成證明。"],
            tips=["補圖後先寫出新形成圖形的平行關係。"],
            notes=["補圖要簡潔，避免過度新增線段。"],
            mistakes=["延長方向錯誤，導致無法形成可用圖形。"],
        ),
        topic_row(
            id_="j4-4-2-interior-point-area-relation",
            title="平行四邊形內一點的面積關係",
            chapter_code="j4-4-2",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("面積拆分", r"$[APB]+[CPD]=[BPC]+[DPA]$"),
                ("符號", r"$[\triangle XYZ]\ \text{表示面積}$"),
            ],
            usage=["內點切割面積題。", "由已知兩塊面積推出未知塊。"],
            examples=[r"若兩對對角區塊和相等，可反求另一塊面積。"],
            tips=["先把圖分成四個三角形再配對相加。"],
            notes=["面積平衡關係是段考常考重點。"],
            mistakes=["把相鄰區塊誤當對角區塊相等。"],
        ),
        topic_row(
            id_="j4-4-2-angle-perimeter-routine",
            title="角度與周長計算基本套路",
            chapter_code="j4-4-2",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("周長", r"$P=2(a+b)$"),
                ("角度", r"$\angle A+\angle B=180^\circ,\ \angle A=\angle C$"),
            ],
            usage=["混合題先抓角度再算長度。", "快速建構解題順序。"],
            examples=[r"已知一角與一邊，可依序求其餘角與周長。"],
            tips=["先把已知量標回圖上，避免來回讀題。"],
            notes=["是平行四邊形計算題的基本流程。"],
            mistakes=["跳步運算，導致角度與邊長對應錯。"],
        ),
        topic_row(
            id_="j4-4-2-midpoint-area-allocation",
            title="中點切割與面積分配",
            chapter_code="j4-4-2",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("比例核心", r"$\text{同高三角形面積比}=\text{底邊比}$"),
                ("中點效果", r"$\text{中點常導致 }1:1\text{ 或 }1:2\text{ 比}$"),
            ],
            usage=["中點線切割後的面積比問題。", "與平行線同高模型聯動。"],
            examples=[r"若底邊被中點切成兩半，對應同高三角形面積比為 $1:1$。"],
            tips=["先找同高，再比較底邊。"],
            notes=["先畫高度輔助線通常會更清楚。"],
            mistakes=["忽略是否同高就直接比面積。"],
        ),
        topic_row(
            id_="j4-4-2-area-height-diagonal",
            title="由面積求高，再用畢氏求對角線",
            chapter_code="j4-4-2",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("面積公式", r"$S=\text{底}\times\text{高}$"),
                ("對角線", r"$d=\sqrt{a^2+b^2}\ (\text{在直角構型中})$"),
            ],
            usage=["先由面積反推高度，再求對角線。", "綜合代數與幾何計算。"],
            examples=[r"若 $S=48,\ \text{底}=8$，先得高 $6$，再以畢氏求斜線。"],
            tips=["先確認是否能構成直角三角形再用畢氏。"],
            notes=["此題型常出現在壓軸題。"],
            mistakes=["直接拿平行四邊形邊長去套畢氏。"],
        ),
        topic_row(
            id_="j4-4-2-overlap-angle-chasing",
            title="重疊圖形角度追蹤",
            chapter_code="j4-4-2",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("平行線角", r"$\text{內錯角相等、同側內角互補}$"),
                ("角度策略", r"$\text{先移角，再合角或差角}$"),
            ],
            usage=["重疊、多層輔助線角度題。", "把角搬到容易看的位置。"],
            examples=[r"利用平行線把分散角度搬到同一頂點後計算。"],
            tips=["每一步都寫清楚『依據哪條平行線』。"],
            notes=["角度追蹤重在結構，不在硬算。"],
            mistakes=["搬角時跨錯平行線對應。"],
        ),
        topic_row(
            id_="j4-4-2-sector-area-application",
            title="雨刷面積：平行四邊形與扇形面積",
            chapter_code="j4-4-2",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("平行四邊形", r"$S=bh$"),
                ("扇形", r"$S=\frac{\theta}{360^\circ}\pi r^2$"),
            ],
            usage=["複合圖形面積加減。", "生活情境面積題。"],
            examples=[r"先分區塊計算，再做總和或差值。"],
            tips=["先列分區清單，避免重複加減。"],
            notes=["單位一致很重要（角度、長度）。"],
            mistakes=["扇形角度比例用錯，或忘記扣除重疊區。"],
        ),
        topic_row(
            id_="j4-4-2-coordinate-midpoint-parallelogram",
            title="座標中的平行四邊形：對角線中點法",
            chapter_code="j4-4-2",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("中點公式", r"$M\left(\frac{x_1+x_2}{2},\frac{y_1+y_2}{2}\right)$"),
                ("平行四邊形", r"$\text{兩對角線中點相同}$"),
            ],
            usage=["已知三點求第四點。", "座標判別是否為平行四邊形。"],
            examples=[r"若 $A,C$ 中點與 $B,D$ 中點相同，則四點可成平行四邊形。"],
            tips=["先用中點公式列方程，再解未知座標。"],
            notes=["是座標幾何的穩定解法。"],
            mistakes=["中點公式分子或分母寫錯。"],
        ),
        topic_row(
            id_="j4-4-2-folding-angle-bisector-composite",
            title="長方形摺疊與角平分線綜合",
            chapter_code="j4-4-2",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[
                ("摺疊", r"$\text{摺痕兩側對應角相等}$"),
                ("角平分線", r"$\text{到兩邊距離相等}\Leftrightarrow\text{在角平分線上}$"),
            ],
            usage=["摺紙、反射、角平分線混合題。", "多概念綜合證明。"],
            examples=[r"先用摺疊得到等角，再接平行線角度關係收斂答案。"],
            tips=["分段寫：摺疊結論、平行結論、角平分線結論。"],
            notes=["這類題目步驟多，務必保持結論可追溯。"],
            mistakes=["把摺痕性質與中垂線性質混用。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j4-4-1-para-001",
            title="定義判斷（基礎01）",
            chapter_code="j4-4-1",
            difficulty="基礎",
            question_text=r"若四邊形 $ABCD$ 滿足 $AB\parallel CD$ 且 $AD\parallel BC$，可判為何種圖形？",
            answer_text="平行四邊形。",
            explanation_text="符合平行四邊形定義：兩組對邊分別平行。",
            topic_id="j4-4-1-parallelogram-definition",
        ),
        question_row(
            id_="q-j4-4-1-para-002",
            title="定義反向檢查（基礎02）",
            chapter_code="j4-4-1",
            difficulty="基礎",
            question_text="若只知道一組對邊平行，能直接判斷是平行四邊形嗎？",
            answer_text="不能。",
            explanation_text="定義要求兩組對邊都平行。",
            topic_id="j4-4-1-parallelogram-definition",
        ),
        question_row(
            id_="q-j4-4-1-para-003",
            title="對角線全等（基礎01）",
            chapter_code="j4-4-1",
            difficulty="基礎",
            question_text=r"在平行四邊形 $ABCD$ 中，畫對角線 $AC$，可得到哪兩個全等三角形？",
            answer_text=r"$\triangle ABC$ 與 $\triangle CDA$。",
            explanation_text="由兩組平行線可得對應角相等，再配合公共邊可得全等。",
            topic_id="j4-4-1-diagonal-congruence",
        ),
        question_row(
            id_="q-j4-4-1-para-004",
            title="全等推邊長（基礎02）",
            chapter_code="j4-4-1",
            difficulty="基礎",
            question_text=r"由 $\triangle ABC\cong\triangle CDA$ 可推出哪兩組邊相等？",
            answer_text=r"$AB=CD,\ BC=AD$。",
            explanation_text="依對應邊相等（CPCTC）可直接得到結論。",
            topic_id="j4-4-1-diagonal-congruence",
        ),
        question_row(
            id_="q-j4-4-1-para-005",
            title="對邊相等周長（基礎01）",
            chapter_code="j4-4-1",
            difficulty="基礎",
            question_text=r"平行四邊形中若 $AB=9,\ BC=4$，求周長。",
            answer_text="26。",
            explanation_text=r"對邊相等，周長 $=2(AB+BC)=2(9+4)=26$。",
            topic_id="j4-4-1-opposite-sides-equal",
        ),
        question_row(
            id_="q-j4-4-1-para-006",
            title="對邊代換（基礎02）",
            chapter_code="j4-4-1",
            difficulty="基礎",
            question_text=r"若平行四邊形中 $AD=12$，則 $BC$ 為多少？",
            answer_text="12。",
            explanation_text="平行四邊形對邊相等，故 $BC=AD$。",
            topic_id="j4-4-1-opposite-sides-equal",
        ),
        question_row(
            id_="q-j4-4-1-para-007",
            title="角度關係（基礎01）",
            chapter_code="j4-4-1",
            difficulty="基礎",
            question_text=r"平行四邊形中若 $\angle A=68^\circ$，求 $\angle B,\angle C$。",
            answer_text=r"$\angle B=112^\circ,\ \angle C=68^\circ$。",
            explanation_text=r"鄰角互補：$\angle B=180^\circ-68^\circ=112^\circ$；對角相等：$\angle C=\angle A$。",
            topic_id="j4-4-1-opposite-angles-supplementary",
        ),
        question_row(
            id_="q-j4-4-1-para-008",
            title="鄰角互補檢查（基礎02）",
            chapter_code="j4-4-1",
            difficulty="基礎",
            question_text="平行四邊形的相鄰兩角和是多少？",
            answer_text=r"$180^\circ$。",
            explanation_text="平行線內角關係可得鄰角互補。",
            topic_id="j4-4-1-opposite-angles-supplementary",
        ),
        question_row(
            id_="q-j4-4-1-para-009",
            title="對角線平分（基礎01）",
            chapter_code="j4-4-1",
            difficulty="基礎",
            question_text=r"平行四邊形對角線交於 $O$，若 $AO=7$，求 $AC$。",
            answer_text="14。",
            explanation_text=r"對角線互相平分，故 $AO=OC=7$，所以 $AC=14$。",
            topic_id="j4-4-1-diagonal-bisect-property",
        ),
        question_row(
            id_="q-j4-4-1-para-010",
            title="平分雙線段（基礎02）",
            chapter_code="j4-4-1",
            difficulty="基礎",
            question_text=r"若 $AO=OC,\ BO=OD$，這是平行四邊形哪個核心性質？",
            answer_text="兩對角線互相平分。",
            explanation_text="交點同時平分兩條對角線即為該性質。",
            topic_id="j4-4-1-diagonal-bisect-property",
        ),
        question_row(
            id_="q-j4-4-1-para-011",
            title="判別一組平行且等長（中等01）",
            chapter_code="j4-4-1",
            difficulty="中等",
            question_text=r"若四邊形中 $AB\parallel CD$ 且 $AB=CD$，可否判為平行四邊形？",
            answer_text="可以。",
            explanation_text="符合判別條件：一組對邊平行且相等。",
            topic_id="j4-4-1-criterion-onepair-parallel-equal",
        ),
        question_row(
            id_="q-j4-4-1-para-012",
            title="判別條件辨識（中等02）",
            chapter_code="j4-4-1",
            difficulty="中等",
            question_text="「一組相鄰邊平行且相等」可判平行四邊形嗎？",
            answer_text="不行。",
            explanation_text="判別要求的是一組『對邊』平行且相等。",
            topic_id="j4-4-1-criterion-onepair-parallel-equal",
        ),
        question_row(
            id_="q-j4-4-1-para-013",
            title="判別兩組對邊（中等01）",
            chapter_code="j4-4-1",
            difficulty="中等",
            question_text=r"若 $AB=CD=10,\ BC=AD=6$，可判四邊形為平行四邊形嗎？",
            answer_text="可以。",
            explanation_text="兩組對邊分別相等，符合判別。",
            topic_id="j4-4-1-criterion-two-pairs-sides",
        ),
        question_row(
            id_="q-j4-4-1-para-014",
            title="判別完整性檢查（中等02）",
            chapter_code="j4-4-1",
            difficulty="中等",
            question_text=r"若只知 $AB=CD$，可判平行四邊形嗎？",
            answer_text="不可以。",
            explanation_text="僅一組對邊相等不足以判別。",
            topic_id="j4-4-1-criterion-two-pairs-sides",
        ),
        question_row(
            id_="q-j4-4-1-para-015",
            title="判別兩組對角（中等01）",
            chapter_code="j4-4-1",
            difficulty="中等",
            question_text=r"若 $\angle A=\angle C$ 且 $\angle B=\angle D$，可判平行四邊形嗎？",
            answer_text="可以。",
            explanation_text="兩組對角分別相等，可作為平行四邊形判別條件。",
            topic_id="j4-4-1-criterion-two-pairs-angles",
        ),
        question_row(
            id_="q-j4-4-1-para-016",
            title="角度判別反例（中等02）",
            chapter_code="j4-4-1",
            difficulty="中等",
            question_text=r"若僅有 $\angle A=\angle C$，是否一定是平行四邊形？",
            answer_text="不一定。",
            explanation_text="只一組對角相等條件不足。",
            topic_id="j4-4-1-criterion-two-pairs-angles",
        ),
        question_row(
            id_="q-j4-4-1-para-017",
            title="對角線判別（中等01）",
            chapter_code="j4-4-1",
            difficulty="中等",
            question_text=r"若四邊形對角線交於 $O$ 且 $AO=OC,\ BO=OD$，可判為何圖形？",
            answer_text="平行四邊形。",
            explanation_text="兩對角線互相平分是充分判別條件。",
            topic_id="j4-4-1-criterion-diagonal-bisect",
        ),
        question_row(
            id_="q-j4-4-1-para-018",
            title="對角線判別陷阱（中等02）",
            chapter_code="j4-4-1",
            difficulty="中等",
            question_text=r"若僅有 $AO=OC$，能否判平行四邊形？",
            answer_text="不能。",
            explanation_text="必須兩條對角線都在同一交點被平分。",
            topic_id="j4-4-1-criterion-diagonal-bisect",
        ),
        question_row(
            id_="q-j4-4-2-para-019",
            title="中點連線長度（基礎01）",
            chapter_code="j4-4-2",
            difficulty="基礎",
            question_text=r"在 $\triangle ABC$ 中，$D,E$ 為 $AB,AC$ 中點，若 $BC=18$，求 $DE$。",
            answer_text="9。",
            explanation_text=r"中點連線性質：$DE=\frac{1}{2}BC=\frac{1}{2}\cdot 18=9$。",
            topic_id="j4-4-2-midpoint-theorem",
        ),
        question_row(
            id_="q-j4-4-2-para-020",
            title="中點連線平行（基礎02）",
            chapter_code="j4-4-2",
            difficulty="基礎",
            question_text=r"中點連線 $DE$ 與哪一邊平行？",
            answer_text=r"$DE\parallel BC$。",
            explanation_text="三角形兩邊中點連線平行第三邊。",
            topic_id="j4-4-2-midpoint-theorem",
        ),
        question_row(
            id_="q-j4-4-2-para-021",
            title="延長補圖用途（中等01）",
            chapter_code="j4-4-2",
            difficulty="中等",
            question_text="中點連線延長法最常用來證明哪三種結論？",
            answer_text="平行、等長、比例。",
            explanation_text="補圖後可構造平行四邊形，再由其性質推導。",
            topic_id="j4-4-2-midpoint-extension-proof",
        ),
        question_row(
            id_="q-j4-4-2-para-022",
            title="延長法流程（中等02）",
            chapter_code="j4-4-2",
            difficulty="中等",
            question_text="延長中點連線後，第一步應該先做什麼？",
            answer_text="先整理新形成的平行關係。",
            explanation_text="平行關係是後續全等、比例與等長推理的核心。",            
            topic_id="j4-4-2-midpoint-extension-proof",
        ),
        question_row(
            id_="q-j4-4-2-para-023",
            title="內點面積關係（中等01）",
            chapter_code="j4-4-2",
            difficulty="中等",
            question_text=r"平行四邊形內點面積常用平衡式為何？",
            answer_text=r"$[APB]+[CPD]=[BPC]+[DPA]$。",
            explanation_text="對角區塊面積和相等。",
            topic_id="j4-4-2-interior-point-area-relation",
        ),
        question_row(
            id_="q-j4-4-2-para-024",
            title="面積平衡應用（中等02）",
            chapter_code="j4-4-2",
            difficulty="中等",
            question_text=r"若 $[APB]=12,\ [CPD]=8,\ [BPC]=10$，求 $[DPA]$。",
            answer_text="10。",
            explanation_text=r"由 $[APB]+[CPD]=[BPC]+[DPA]$，得 $12+8=10+[DPA]$，故 $[DPA]=10$。",
            topic_id="j4-4-2-interior-point-area-relation",
        ),
        question_row(
            id_="q-j4-4-2-para-025",
            title="周長套路（中等01）",
            chapter_code="j4-4-2",
            difficulty="中等",
            question_text=r"平行四邊形若兩鄰邊為 $11,7$，周長為何？",
            answer_text="36。",
            explanation_text=r"$P=2(a+b)=2(11+7)=36$。",
            topic_id="j4-4-2-angle-perimeter-routine",
        ),
        question_row(
            id_="q-j4-4-2-para-026",
            title="角度套路（中等02）",
            chapter_code="j4-4-2",
            difficulty="中等",
            question_text=r"若 $\angle D=124^\circ$，求 $\angle A$。",
            answer_text=r"$56^\circ$。",
            explanation_text=r"鄰角互補，$\angle A=180^\circ-124^\circ=56^\circ$。",
            topic_id="j4-4-2-angle-perimeter-routine",
        ),
        question_row(
            id_="q-j4-4-2-para-027",
            title="同高面積比（中等01）",
            chapter_code="j4-4-2",
            difficulty="中等",
            question_text="同高三角形的面積比等於什麼比？",
            answer_text="底邊比。",
            explanation_text="在同高條件下，面積與底邊成正比。",
            topic_id="j4-4-2-midpoint-area-allocation",
        ),
        question_row(
            id_="q-j4-4-2-para-028",
            title="中點切割面積（中等02）",
            chapter_code="j4-4-2",
            difficulty="中等",
            question_text="若底邊被中點切成兩段且同高，兩三角形面積比為何？",
            answer_text="1:1。",
            explanation_text="底邊比為 1:1，所以同高三角形面積比也是 1:1。",
            topic_id="j4-4-2-midpoint-area-allocation",
        ),
        question_row(
            id_="q-j4-4-2-para-029",
            title="面積反推高度（進階01）",
            chapter_code="j4-4-2",
            difficulty="進階",
            question_text=r"平行四邊形面積 $S=72$，底邊 $b=9$，求高 $h$。",
            answer_text="8。",
            explanation_text=r"$h=S/b=72/9=8$。",
            topic_id="j4-4-2-area-height-diagonal",
        ),
        question_row(
            id_="q-j4-4-2-para-030",
            title="直角構型求斜線（進階02）",
            chapter_code="j4-4-2",
            difficulty="進階",
            question_text=r"若直角構型兩股長為 $6,8$，求對角線長。",
            answer_text="10。",
            explanation_text=r"由畢氏定理 $d=\sqrt{6^2+8^2}=\sqrt{100}=10$。",
            topic_id="j4-4-2-area-height-diagonal",
        ),
        question_row(
            id_="q-j4-4-2-para-031",
            title="角度追蹤基礎（進階01）",
            chapter_code="j4-4-2",
            difficulty="進階",
            question_text="平行線角度追蹤時最穩定的第一步是什麼？",
            answer_text="先標出哪幾組線互相平行，再標內錯角或同位角。",
            explanation_text="先固定平行對應，後續搬角才不會錯位。",
            topic_id="j4-4-2-overlap-angle-chasing",
        ),
        question_row(
            id_="q-j4-4-2-para-032",
            title="角度追蹤陷阱（進階02）",
            chapter_code="j4-4-2",
            difficulty="進階",
            question_text="角度搬移最常見錯誤是什麼？",
            answer_text="跨錯平行線對應，導致角度關係不成立。",
            explanation_text="每次搬角都要標註依據哪一組平行線。",
            topic_id="j4-4-2-overlap-angle-chasing",
        ),
        question_row(
            id_="q-j4-4-2-para-033",
            title="扇形面積公式（進階01）",
            chapter_code="j4-4-2",
            difficulty="進階",
            question_text=r"半徑 $r=6$、圓心角 $60^\circ$ 的扇形面積為何？",
            answer_text=r"$6\pi$。",
            explanation_text=r"$S=\dfrac{60^\circ}{360^\circ}\pi r^2=\dfrac{1}{6}\pi\cdot 36=6\pi$。",
            topic_id="j4-4-2-sector-area-application",
        ),
        question_row(
            id_="q-j4-4-2-para-034",
            title="複合面積策略（進階02）",
            chapter_code="j4-4-2",
            difficulty="進階",
            question_text="平行四邊形與扇形重疊面積題，建議先做哪件事？",
            answer_text="先分區塊列清單，再做加減。",
            explanation_text="可避免漏算或重複計算區域。",
            topic_id="j4-4-2-sector-area-application",
        ),
        question_row(
            id_="q-j4-4-2-para-035",
            title="中點法判別（中等01）",
            chapter_code="j4-4-2",
            difficulty="中等",
            question_text="座標中判別平行四邊形常用哪個條件？",
            answer_text="兩條對角線中點相同。",
            explanation_text="這是座標法最直接且穩定的判別條件。",
            topic_id="j4-4-2-coordinate-midpoint-parallelogram",
        ),
        question_row(
            id_="q-j4-4-2-para-036",
            title="中點公式（中等02）",
            chapter_code="j4-4-2",
            difficulty="中等",
            question_text=r"線段端點為 $(2,5),(8,-1)$，其中點座標為何？",
            answer_text=r"$(5,2)$。",
            explanation_text=r"$\left(\dfrac{2+8}{2},\dfrac{5+(-1)}{2}\right)=(5,2)$。",
            topic_id="j4-4-2-coordinate-midpoint-parallelogram",
        ),
        question_row(
            id_="q-j4-4-2-para-037",
            title="摺疊角度核心（進階01）",
            chapter_code="j4-4-2",
            difficulty="進階",
            question_text="摺疊題中最先可用的角度性質是什麼？",
            answer_text="摺痕兩側對應角相等。",
            explanation_text="摺疊本質是鏡射，所以對應角與對應邊關係可先建立。",
            topic_id="j4-4-2-folding-angle-bisector-composite",
        ),
        question_row(
            id_="q-j4-4-2-para-038",
            title="角平分線核心（進階02）",
            chapter_code="j4-4-2",
            difficulty="進階",
            question_text="判斷一點在角平分線上的等價條件是什麼？",
            answer_text="該點到角兩邊的垂直距離相等。",
            explanation_text="角平分線的距離定義是此類綜合題的關鍵。",            
            topic_id="j4-4-2-folding-angle-bisector-composite",
        ),
        question_row(
            id_="q-j4-4-2-para-039",
            title="綜合步驟（進階03）",
            chapter_code="j4-4-2",
            difficulty="進階",
            question_text="面對摺疊＋平行＋角平分線混合題，建議步驟排序為何？",
            answer_text="先摺疊等角，再平行搬角，最後用角平分線距離性質收斂。",
            explanation_text="先建立最穩定的結構，再逐層串接，可避免跳步。",            
            topic_id="j4-4-2-folding-angle-bisector-composite",
        ),
        question_row(
            id_="q-j4-4-2-para-040",
            title="中點與判別整合（進階04）",
            chapter_code="j4-4-2",
            difficulty="進階",
            question_text="座標題若先算到兩條對角線中點相同，下一步最合理結論是什麼？",
            answer_text="先判定為平行四邊形，再套其邊角性質。",
            explanation_text="中點相同已給出圖形類型，後續計算可用平行四邊形工具箱。",            
            topic_id="j4-4-2-coordinate-midpoint-parallelogram",
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

