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
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國二下7_三角形的邊角關係_整理\改國二下7_三角形的邊角關係_易讀版.md"
)
SOURCE_REF = f"{Path(SOURCE_MD).name}（重點整理匯入）"

CHAPTER_CODE = "j4-3-4"
CHAPTER_NAME = "三角形的邊角關係"

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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j4-3-4-{ts}{path.suffix}"
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
        "grade": "國二",
        "term": "下學期",
        "chapter": CHAPTER_NAME,
        "chapterCode": CHAPTER_CODE,
        "domain": "幾何",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", CHAPTER_CODE, CHAPTER_NAME, "邊角關係"],
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
        "grade": "國二",
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
            id_="j4-3-4-triangle-inequality-basic",
            title="三角形成立條件：兩邊和大於第三邊",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("成立條件", r"$a+b>c,\ a+c>b,\ b+c>a$"),
                ("判斷速記", r"$\text{最長邊} < \text{另外兩邊和}$"),
            ],
            usage=["判斷三個長度能不能圍成三角形。", "遇到尺規作圖或幾何構圖時先做可行性檢查。"],
            examples=[r"$2,2,4$ 不成立，因為 $2+2=4$。", r"$0.4,0.8,1.1$ 成立，因為 $0.4+0.8>1.1$。"],
            tips=["先找最長邊再比對，速度最快。", "等號不成立，必須是嚴格大於。"],
            notes=["這一條是後續邊角比較、最短路徑題目的共同前提。"],
            mistakes=["只檢查一組不等式就下結論。", r"把 $>$ 誤寫成 $\ge$。"],
        ),
        topic_row(
            id_="j4-3-4-third-side-range",
            title="第三邊範圍：兩邊差與兩邊和",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("範圍公式", r"$|a-b|<x<a+b$"),
                ("整數個數", r"$\text{可行整數}=\{n\in\mathbb{Z}\mid |a-b|<n<a+b\}$"),
            ],
            usage=["已知兩邊長，求第三邊可行範圍。", "求第三邊可能的整數值個數。"],
            examples=[r"$a=8,b=4 \Rightarrow 4<x<12$。", r"$3<x<17$ 與 $11<x<21$ 交集為 $11<x<17$。"],
            tips=["先畫不等式交集，再數整數。", "記得是開區間，不含端點。"],
            notes=["第三邊範圍常與絕對值化簡同題出現。"],
            mistakes=[r"把 $|a-b|<x$ 寫成 $x<|a-b|$。", "忘記同時滿足兩個不等式。"],
        ),
        topic_row(
            id_="j4-3-4-abs-simplify-by-range",
            title="利用範圍化簡絕對值",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("絕對值分段", r"$|u|=\begin{cases}u,&u\ge 0\\-u,&u<0\end{cases}$"),
                ("平方根等價", r"$\sqrt{u^2}=|u|$"),
            ],
            usage=["已知變數範圍時，快速去掉絕對值。", "把幾何長度式化為代數可計算式。"],
            examples=[r"$3<x<7 \Rightarrow |x-2|=x-2,\ |x-9|=9-x$。", r"$\sqrt{(x-2)^2}=|x-2|$。"],
            tips=["先判斷每一段符號，再代入分段。", "所有含絕對值項都要逐一判斷。"],
            notes=["這是邊長比較、最值題常見中介技巧。"],
            mistakes=[r"直接把 $\sqrt{(x-2)^2}$ 當成 $x-2$。", "忽略區間造成符號判斷錯誤。"],
        ),
        topic_row(
            id_="j4-3-4-side-angle-monotonic",
            title="大邊對大角，大角對大邊",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("邊推角", r"$AB>BC>CA \Rightarrow \angle C>\angle A>\angle B$"),
                ("角推邊", r"$\angle C>\angle A>\angle B \Rightarrow AB>BC>CA$"),
            ],
            usage=["已知邊長排序求角度排序。", "已知角度排序推回邊長排序。"],
            examples=["若最長邊是 $AB$，則最大角是 $\angle C$。", "若 $\angle A$ 最小，則對邊 $BC$ 最短。"],
            tips=["一定要用『對邊』關係，不要看相鄰邊。", "先標記每個角對應哪條邊再排序。"],
            notes=["此關係可與距離公式合併使用。"],
            mistakes=["把邊與同名角直接對應。", "只比一組大小就推全部排序。"],
        ),
        topic_row(
            id_="j4-3-4-coordinate-distance-compare",
            title="座標距離與邊角比較",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("距離公式", r"$d=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$"),
                ("比較技巧", r"$d_1>d_2 \Leftrightarrow d_1^2>d_2^2$"),
            ],
            usage=["座標幾何中比較三邊長短。", "不開根號也能完成大小比較。"],
            examples=[r"$AB=\sqrt{53},BC=\sqrt{82},CA=\sqrt{113}$ 可直接看被開方數。", r"$113>82>53 \Rightarrow CA>BC>AB$。"],
            tips=["比較大小時優先比較平方值。", "最後再用大邊對大角推角度。"],
            notes=["座標題常把計算與幾何性質綁在一起。"],
            mistakes=["算距離時把符號帶錯。", "忘記平方後已可判大小，還硬算近似值。"],
        ),
        topic_row(
            id_="j4-3-4-hinge-theorem-basic",
            title="樞紐定理：夾角大，對邊長",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("樞紐定理", r"$AB=DE,\ AC=DF,\ \angle A>\angle D \Rightarrow BC>EF$"),
                ("直觀", r"$\text{兩邊固定時，張得越開，第三邊越長}$"),
            ],
            usage=["兩三角形有兩邊對應相等時比較第三邊。", "不用完整求邊長也可判斷大小。"],
            examples=[r"$6,8$ 固定，夾角 $70^\circ$ 的第三邊大於夾角 $40^\circ$ 的第三邊。", "把兩邊想成鉸鏈兩桿，開口越大距離越長。"],
            tips=["先確認是『兩邊相等』再比夾角。", "比的是夾在兩邊之間的角，不是任一角。"],
            notes=["樞紐定理是邊角關係章節核心之一。"],
            mistakes=["誤把非夾角拿來比較。", "沒先對齊對應邊就直接比。"],
        ),
        topic_row(
            id_="j4-3-4-hinge-theorem-converse",
            title="樞紐定理逆敘：第三邊長，夾角大",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("逆敘", r"$AB=DE,\ AC=DF,\ BC>EF \Rightarrow \angle A>\angle D$"),
                ("對應原則", r"$\text{先對齊兩條相等邊，再比剩餘邊與夾角}$"),
            ],
            usage=["已知第三邊大小，反推夾角大小。", "證明題與選擇題常見比較方向。"],
            examples=["若兩組固定邊相同，第三邊較長者其夾角較大。", "可用於判斷路徑轉折角度大小。"],
            tips=["逆向推理前，先確認兩邊真的對應相等。", "夾角必須位於那兩條相等邊之間。"],
            notes=["正敘與逆敘方向要分清楚。"],
            mistakes=["把『邊大角大』套在不同三角形卻沒固定兩邊。", "忽略對應關係。"],
        ),
        topic_row(
            id_="j4-3-4-special-30-60-90",
            title="特殊直角三角形：30-60-90",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("邊長比", r"$1:\sqrt{3}:2$"),
                ("對應", r"$\text{短股}:\text{長股}:\text{斜邊}=1:\sqrt{3}:2$"),
            ],
            usage=["已知一邊快速求另外兩邊。", "與面積、周長題混合出題。"],
            examples=[r"斜邊 $10$，短股 $5$，長股 $5\sqrt{3}$。", r"短股 $4$，則長股 $4\sqrt{3}$，斜邊 $8$。"],
            tips=["先找已知邊對應比值中的哪一項。", "再整體等比放大或縮小。"],
            notes=["常與直角坐標、梯形高、面積題連動。"],
            mistakes=[r"把 $1:\sqrt{3}:2$ 記成 $1:2:\sqrt{3}$。"],
        ),
        topic_row(
            id_="j4-3-4-special-45-45-90",
            title="特殊直角三角形：45-45-90",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("邊長比", r"$1:1:\sqrt{2}$"),
                ("對應", r"$\text{股}:\text{股}:\text{斜邊}=1:1:\sqrt{2}$"),
            ],
            usage=["等腰直角三角形的快速計算。", "平方對角線與幾何拼圖題常用。"],
            examples=[r"股長 $6$，斜邊 $6\sqrt{2}$。", r"斜邊 $8\sqrt{2}$，每股為 $8$。"],
            tips=[r"先認出兩個銳角都為 $45^\circ$。", "看到正方形對角線可立即聯想此比值。"],
            notes=["可與座標距離公式相互驗證。"],
            mistakes=["把斜邊誤算成 $2$ 倍股長。"],
        ),
        topic_row(
            id_="j4-3-4-special-right-area",
            title="特殊直角三角形與面積",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("直角三角形面積", r"$A=\frac{1}{2}\times \text{股}_1\times \text{股}_2$"),
                ("比值搭配", r"$\text{先用特殊角求邊，再代入面積}$"),
            ],
            usage=["特殊角題中求面積、周長。", "把比例資訊轉成具體長度。"],
            examples=[r"$30^\circ\!-\!60^\circ\!-\!90^\circ$ 且短股 $3$，面積 $=\frac{9\sqrt{3}}{2}$。", r"$45^\circ\!-\!45^\circ\!-\!90^\circ$ 且斜邊 $10$，面積 $=25$。"],
            tips=["先解邊長，最後一步再算面積。", "避免一開始就帶根號展開。"],
            notes=["面積題很適合檢查比值是否套對。"],
            mistakes=["把斜邊直接拿去當面積底或高。"],
        ),
        topic_row(
            id_="j4-3-4-fold-perpendicular-bisector",
            title="摺疊與中垂線：等距判斷",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("中垂線性質", r"$P\in \text{中垂線} \Leftrightarrow PA=PB$"),
                ("摺線意義", r"$\text{摺線上的點到兩對應點距離相等}$"),
            ],
            usage=["摺紙、對稱、最短路徑前置判斷。", "幾何作圖題的等距證明。"],
            examples=[r"若 $P$ 在 $\overline{AB}$ 中垂線上，則 $PA=PB$。", r"反之若 $PA=PB$，則 $P$ 在 $\overline{AB}$ 中垂線上。"],
            tips=["看到『到兩點距離相等』就想中垂線。", "先畫出對稱軸再整理關係。"],
            notes=["與反射最短路徑方法高度相關。"],
            mistakes=["把中垂線與角平分線混用。"],
        ),
        topic_row(
            id_="j4-3-4-angle-bisector-distance",
            title="角平分線與點到邊距離",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("角平分線性質", r"$P\in \text{角平分線} \Leftrightarrow d(P,AB)=d(P,AC)$"),
                ("距離定義", r"$d(P,\ell)=\text{點 }P\text{ 到直線 }\ell\text{ 的垂直距離}$"),
            ],
            usage=["判斷點是否在角平分線上。", "內心、切圓、等距問題常用。"],
            examples=[r"若 $P$ 在 $\angle BAC$ 角平分線上，則到 $AB,AC$ 的距離相等。", r"若到兩邊距離相等，可反推點在角平分線上。"],
            tips=["這裡比較的是『到邊距離』不是到頂點距離。", "要畫垂線段才是距離。"],
            notes=["容易和中垂線性質混淆，要分清楚『點-點』與『點-邊』。"],
            mistakes=["把 $PA=PB$ 當成角平分線條件。"],
        ),
        topic_row(
            id_="j4-3-4-reflection-shortest-path",
            title="反射最短路徑與三角形不等式",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("最短路徑", r"$AP+PB \ge AB$"),
                ("反射法", r"$AP+PB = AP + PB' \ge AB' \ (\text{當 }B'\text{ 為 }B\text{ 的鏡射點})$"),
            ],
            usage=["河岸、牆面反彈、折線最短路徑。", "設計最省距離行走路線。"],
            examples=[r"點 $A$ 到直線上點 $P$ 再到 $B$，最短值用 $B$ 的鏡射點 $B'$ 直線求。", r"最短時路徑在反射後變一直線。"],
            tips=["先做鏡射，再走直線。", "最後把交點拉回原圖檢查可行性。"],
            notes=["三角形不等式是反射法的理論底層。"],
            mistakes=["直接猜交點而不做鏡射。", "忽略路徑必須經過指定直線。"],
        ),
        topic_row(
            id_="j4-3-4-integrated-strategy",
            title="邊角關係綜合解題策略",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[
                ("流程", r"$\text{條件整理}\rightarrow\text{選定性質}\rightarrow\text{代數化}\rightarrow\text{回圖檢查}$"),
                ("工具箱", r"$\text{不等式、邊角對應、樞紐定理、特殊角比值}$"),
            ],
            usage=["多概念混合題的作答框架。", "段考壓軸題拆解與驗算。"],
            examples=["先判斷是否可成三角形，再做邊角比較，最後代入數值驗證。", "座標題先比平方距離，再回推角度排序。"],
            tips=["先定義要比較的對象與對應關係。", "不要同時展開太多式，分步驟驗算。"],
            notes=["本主題是把本章核心觀念整合成可重複使用的流程。"],
            mistakes=["沒有先判斷適用條件就套公式。", "對應關係沒對齊就開始比較。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j4-3-4-rel-001",
            title="三角形成立判斷（基礎01）",
            difficulty="基礎",
            question_text=r"判斷長度 $2,3,4$ 是否可組成三角形。",
            answer_text="可以。",
            explanation_text=r"最長邊為 $4$，且 $2+3=5>4$，其餘兩式也成立，所以可組成三角形。",
            topic_id="j4-3-4-triangle-inequality-basic",
        ),
        question_row(
            id_="q-j4-3-4-rel-002",
            title="三角形成立判斷（基礎02）",
            difficulty="基礎",
            question_text=r"判斷長度 $5,9,3$ 是否可組成三角形。",
            answer_text="不可以。",
            explanation_text=r"最長邊為 $9$，但 $5+3=8<9$，違反三角形不等式。",
            topic_id="j4-3-4-triangle-inequality-basic",
        ),
        question_row(
            id_="q-j4-3-4-rel-003",
            title="第三邊範圍（基礎01）",
            difficulty="基礎",
            question_text=r"若三角形兩邊長為 $8,4$，第三邊 $x$ 的範圍為何？",
            answer_text=r"$4<x<12$。",
            explanation_text=r"套用公式 $|a-b|<x<a+b$，得 $|8-4|<x<8+4$，即 $4<x<12$。",
            topic_id="j4-3-4-third-side-range",
        ),
        question_row(
            id_="q-j4-3-4-rel-004",
            title="第三邊整數個數（中等01）",
            difficulty="中等",
            question_text=r"若兩邊為 $6,9$，第三邊 $x$ 為整數，問有幾個可能值？",
            answer_text="11 個。",
            explanation_text=r"$|9-6|<x<9+6 \Rightarrow 3<x<15$，整數為 $4$ 到 $14$，共 $11$ 個。",
            topic_id="j4-3-4-third-side-range",
        ),
        question_row(
            id_="q-j4-3-4-rel-005",
            title="絕對值化簡（中等01）",
            difficulty="中等",
            question_text=r"已知 $3<x<7$，化簡 $|x-2|+|x-9|$。",
            answer_text="7。",
            explanation_text=r"由區間得 $x-2>0,\ x-9<0$，所以 $|x-2|=x-2,\ |x-9|=9-x$，相加得 $7$。",
            topic_id="j4-3-4-abs-simplify-by-range",
        ),
        question_row(
            id_="q-j4-3-4-rel-006",
            title="平方根與絕對值（中等02）",
            difficulty="中等",
            question_text=r"已知 $2<x<5$，化簡 $\sqrt{(x-2)^2}+\sqrt{(5-x)^2}$。",
            answer_text="3。",
            explanation_text=r"$2<x<5$ 時，$x-2>0,\ 5-x>0$，故原式 $=|x-2|+|5-x|=(x-2)+(5-x)=3$。",
            topic_id="j4-3-4-abs-simplify-by-range",
        ),
        question_row(
            id_="q-j4-3-4-rel-007",
            title="邊推角排序（基礎01）",
            difficulty="基礎",
            question_text=r"在 $\triangle ABC$ 中，若 $AB=10,\ BC=7,\ AC=5$，請比較 $\angle A,\angle B,\angle C$ 大小。",
            answer_text=r"$\angle C>\angle A>\angle B$。",
            explanation_text=r"邊長排序為 $AB>BC>AC$，對應角排序為 $\angle C>\angle A>\angle B$。",
            topic_id="j4-3-4-side-angle-monotonic",
        ),
        question_row(
            id_="q-j4-3-4-rel-008",
            title="角推邊排序（基礎02）",
            difficulty="基礎",
            question_text=r"若 $\angle A>\angle B>\angle C$，則三邊 $BC,CA,AB$ 的大小關係為何？",
            answer_text=r"$BC>CA>AB$。",
            explanation_text=r"大角對大邊，故 $\angle A,\angle B,\angle C$ 對應邊分別為 $BC,CA,AB$。",
            topic_id="j4-3-4-side-angle-monotonic",
        ),
        question_row(
            id_="q-j4-3-4-rel-009",
            title="座標邊長比較（中等01）",
            difficulty="中等",
            question_text=r"已知 $A(5,6),B(7,-1),C(-2,-2)$，比較 $AB,BC,CA$ 大小。",
            answer_text=r"$CA>BC>AB$。",
            explanation_text=r"$AB^2=53,\ BC^2=82,\ CA^2=113$，比較平方得 $CA>BC>AB$。",
            topic_id="j4-3-4-coordinate-distance-compare",
        ),
        question_row(
            id_="q-j4-3-4-rel-010",
            title="座標角度推論（中等02）",
            difficulty="中等",
            question_text=r"承上題，最大角是哪一個？",
            answer_text=r"$\angle B$ 最大。",
            explanation_text=r"最大邊是 $CA$，其對角為 $\angle B$，所以 $\angle B$ 最大。",
            topic_id="j4-3-4-coordinate-distance-compare",
        ),
        question_row(
            id_="q-j4-3-4-rel-011",
            title="樞紐定理判斷（中等01）",
            difficulty="中等",
            question_text=r"若 $AB=DE,\ AC=DF$ 且 $\angle A>\angle D$，比較 $BC$ 與 $EF$。",
            answer_text=r"$BC>EF$。",
            explanation_text=r"兩邊固定下，夾角越大第三邊越長，依樞紐定理得 $BC>EF$。",
            topic_id="j4-3-4-hinge-theorem-basic",
        ),
        question_row(
            id_="q-j4-3-4-rel-012",
            title="樞紐定理數值題（中等02）",
            difficulty="中等",
            question_text=r"兩三角形中 $AB=DE=6,\ AC=DF=8$，若 $\angle A=70^\circ,\ \angle D=40^\circ$，比較 $BC,EF$。",
            answer_text=r"$BC>EF$。",
            explanation_text=r"因為固定兩邊且 $70^\circ>40^\circ$，故對邊 $BC$ 較長。",
            topic_id="j4-3-4-hinge-theorem-basic",
        ),
        question_row(
            id_="q-j4-3-4-rel-013",
            title="樞紐逆敘判斷（中等01）",
            difficulty="中等",
            question_text=r"若 $AB=DE,\ AC=DF$ 且 $BC>EF$，比較 $\angle A,\angle D$。",
            answer_text=r"$\angle A>\angle D$。",
            explanation_text=r"在兩邊固定條件下，第三邊較長者夾角較大。",
            topic_id="j4-3-4-hinge-theorem-converse",
        ),
        question_row(
            id_="q-j4-3-4-rel-014",
            title="樞紐逆敘應用（中等02）",
            difficulty="中等",
            question_text=r"已知 $PQ=UV,\ PR=UW$ 且 $QR<UW$。可否推出 $\angle P>\angle U$？",
            answer_text="不可。",
            explanation_text=r"要比較的是固定兩邊後的第三邊；題目中第三邊應為 $QR$ 與 $VW$ 才能比較，條件對應不完整。",
            topic_id="j4-3-4-hinge-theorem-converse",
        ),
        question_row(
            id_="q-j4-3-4-rel-015",
            title="30-60-90 比值（基礎01）",
            difficulty="基礎",
            question_text=r"在 $30^\circ\!-\!60^\circ\!-\!90^\circ$ 三角形中，若斜邊為 $10$，求另外兩邊。",
            answer_text=r"短股 $5$，長股 $5\sqrt{3}$。",
            explanation_text=r"比值為 $1:\sqrt{3}:2$，斜邊 $10=2\times 5$，故短股 $5$、長股 $5\sqrt{3}$。",
            topic_id="j4-3-4-special-30-60-90",
        ),
        question_row(
            id_="q-j4-3-4-rel-016",
            title="30-60-90 比值（基礎02）",
            difficulty="基礎",
            question_text=r"在 $30^\circ\!-\!60^\circ\!-\!90^\circ$ 三角形中，若短股為 $4$，求長股與斜邊。",
            answer_text=r"長股 $4\sqrt{3}$，斜邊 $8$。",
            explanation_text=r"依 $1:\sqrt{3}:2$，短股乘上 $\sqrt{3}$ 得長股，乘上 $2$ 得斜邊。",
            topic_id="j4-3-4-special-30-60-90",
        ),
        question_row(
            id_="q-j4-3-4-rel-017",
            title="45-45-90 比值（基礎01）",
            difficulty="基礎",
            question_text=r"在 $45^\circ\!-\!45^\circ\!-\!90^\circ$ 三角形中，若股長為 $6$，求斜邊。",
            answer_text=r"$6\sqrt{2}$。",
            explanation_text=r"比值為 $1:1:\sqrt{2}$，斜邊 $=6\sqrt{2}$。",
            topic_id="j4-3-4-special-45-45-90",
        ),
        question_row(
            id_="q-j4-3-4-rel-018",
            title="45-45-90 比值（基礎02）",
            difficulty="基礎",
            question_text=r"在 $45^\circ\!-\!45^\circ\!-\!90^\circ$ 三角形中，若斜邊為 $8\sqrt{2}$，求每一股。",
            answer_text="每股為 8。",
            explanation_text=r"由 $1:1:\sqrt{2}$，股長 $=\dfrac{8\sqrt{2}}{\sqrt{2}}=8$。",
            topic_id="j4-3-4-special-45-45-90",
        ),
        question_row(
            id_="q-j4-3-4-rel-019",
            title="特殊角面積（中等01）",
            difficulty="中等",
            question_text=r"一個 $30^\circ\!-\!60^\circ\!-\!90^\circ$ 直角三角形短股為 $3$，求面積。",
            answer_text=r"$\dfrac{9\sqrt{3}}{2}$。",
            explanation_text=r"長股 $=3\sqrt{3}$，面積 $=\dfrac{1}{2}\cdot 3\cdot 3\sqrt{3}=\dfrac{9\sqrt{3}}{2}$。",
            topic_id="j4-3-4-special-right-area",
        ),
        question_row(
            id_="q-j4-3-4-rel-020",
            title="特殊角面積（中等02）",
            difficulty="中等",
            question_text=r"一個 $45^\circ\!-\!45^\circ\!-\!90^\circ$ 三角形斜邊為 $10$，求面積。",
            answer_text="25。",
            explanation_text=r"每股 $=10/\sqrt{2}=5\sqrt{2}$，面積 $=\dfrac{1}{2}\cdot (5\sqrt{2})^2=25$。",
            topic_id="j4-3-4-special-right-area",
        ),
        question_row(
            id_="q-j4-3-4-rel-021",
            title="中垂線等距（中等01）",
            difficulty="中等",
            question_text=r"若點 $P$ 在 $\overline{AB}$ 的中垂線上，則 $PA$ 與 $PB$ 的關係為何？",
            answer_text=r"$PA=PB$。",
            explanation_text="中垂線上的任一點到線段兩端點距離相等。",
            topic_id="j4-3-4-fold-perpendicular-bisector",
        ),
        question_row(
            id_="q-j4-3-4-rel-022",
            title="中垂線逆向判斷（中等02）",
            difficulty="中等",
            question_text=r"若 $PA=PB$，可推出 $P$ 在哪一條幾何軌跡上？",
            answer_text=r"$\overline{AB}$ 的中垂線。",
            explanation_text="到兩定點距離相等的點軌跡是該線段的中垂線。",
            topic_id="j4-3-4-fold-perpendicular-bisector",
        ),
        question_row(
            id_="q-j4-3-4-rel-023",
            title="角平分線性質（中等01）",
            difficulty="中等",
            question_text=r"若點 $P$ 在 $\angle BAC$ 的角平分線上，則 $d(P,AB)$ 與 $d(P,AC)$ 關係為何？",
            answer_text=r"$d(P,AB)=d(P,AC)$。",
            explanation_text="角平分線上點到角兩邊的垂直距離相等。",
            topic_id="j4-3-4-angle-bisector-distance",
        ),
        question_row(
            id_="q-j4-3-4-rel-024",
            title="角平分線逆向判斷（中等02）",
            difficulty="中等",
            question_text=r"若點 $P$ 到直線 $AB,AC$ 的距離都為 $3$，可推得 $P$ 在哪裡？",
            answer_text=r"在 $\angle BAC$ 的角平分線上。",
            explanation_text="到角兩邊距離相等，可反推該點在角平分線上。",
            topic_id="j4-3-4-angle-bisector-distance",
        ),
        question_row(
            id_="q-j4-3-4-rel-025",
            title="反射最短路徑（進階01）",
            difficulty="進階",
            question_text="點 A 要到直線 l 上某點 P 再到點 B，如何找最短路徑？",
            answer_text="先把 B 對直線 l 鏡射成 B'，連 AB' 與 l 交點即為最短路徑的 P。",
            explanation_text="反射後折線長轉為一直線長，最短值可由直線距離取得。",
            topic_id="j4-3-4-reflection-shortest-path",
        ),
        question_row(
            id_="q-j4-3-4-rel-026",
            title="三角形不等式最短路徑（進階02）",
            difficulty="進階",
            question_text=r"為什麼任意點 $P$ 都有 $AP+PB\ge AB$？",
            answer_text="因為三角形不等式。",
            explanation_text=r"在 $\triangle APB$ 中，任兩邊和大於等於第三邊，故 $AP+PB\ge AB$，等號只在共線特例。",
            topic_id="j4-3-4-reflection-shortest-path",
        ),
        question_row(
            id_="q-j4-3-4-rel-027",
            title="綜合策略（進階01）",
            difficulty="進階",
            question_text="解邊角綜合題時，第一步最穩定的檢查是什麼？",
            answer_text="先檢查條件是否可成三角形，以及對應關係是否完整。",
            explanation_text="若基本條件不成立，後續公式全部失效；先做成立性與對應性檢查可避免錯用公式。",
            topic_id="j4-3-4-integrated-strategy",
        ),
        question_row(
            id_="q-j4-3-4-rel-028",
            title="綜合策略（進階02）",
            difficulty="進階",
            question_text="座標邊角題常見的穩定流程為何？",
            answer_text="先算或比較邊長平方，再用大邊對大角推角度，最後回圖檢查。",
            explanation_text="這個流程可減少開根號運算錯誤，也能避免角邊對應混淆。",
            topic_id="j4-3-4-integrated-strategy",
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
