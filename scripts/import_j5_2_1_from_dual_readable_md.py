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
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三上3_點直線與圓的關係_整理\改國三上3_點直線與圓的關係_易讀版.md"
)
SOURCE_MD_2 = (
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三上4_兩圓的位置關係與公切圓_整理\改國三上4_兩圓的位置關係與公切圓_易讀版.md"
)
SOURCE_REF = f"{Path(SOURCE_MD_1).name} + {Path(SOURCE_MD_2).name}（重點整理匯入）"

CHAPTER_CODE = "j5-2-1"
CHAPTER_NAME = "點、直線與圓；兩圓位置與公切線"

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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j5-2-1-{ts}{path.suffix}"
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
        "tags": ["word匯入", "雙檔整併", "教學核心", CHAPTER_CODE, "圓"],
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
            id_="j5-2-1-circle-basic-language",
            title="圓的基本語言：圓心、半徑、弦、切線、割線",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("半徑", r"$OA=OB=r$"),
                ("弦與割線", r"$\text{弦是連圓上兩點線段；割線與圓有兩交點}$"),
            ],
            usage=["辨識圖形元素與題目敘述。", "作為後續性質判斷前置。"],
            examples=["同一圓上任意半徑相等。"],
            tips=["先標圓心與半徑，圖會清楚很多。"],
            notes=["本章所有結論都依賴基本名詞。"],
            mistakes=["把弦與割線概念混用。"],
        ),
        topic_row(
            id_="j5-2-1-point-circle-position",
            title="點與圓位置：比較 OP 與 r",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("圓外", r"$OP>r$"),
                ("圓上", r"$OP=r$"),
                ("圓內", r"$OP<r$"),
            ],
            usage=["座標與幾何混合判斷。", "分類題快速作答。"],
            examples=[r"若 $OP=13,r=5$，則點在圓外。"],
            tips=["先算距離再分類，避免目測誤判。"],
            notes=["這是最穩定的判斷標準。"],
            mistakes=["未開根號就直接比較。"],
        ),
        topic_row(
            id_="j5-2-1-line-circle-position",
            title="直線與圓位置：比較 d 與 r",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("相交兩點", r"$d<r$"),
                ("相切", r"$d=r$"),
                ("相離", r"$d>r$"),
            ],
            usage=["判斷切線、割線、不相交。", "解析幾何直線圓位置題。"],
            examples=[r"若圓心到直線距離 $d=4,r=4$，則為相切。"],
            tips=["距離 d 一定是圓心到直線的垂直距離。"],
            notes=["很多題目會先要你求 d。"],
            mistakes=["把任意斜線段長當 d。"],
        ),
        topic_row(
            id_="j5-2-1-tangent-property-criterion",
            title="切線性質與判別：半徑垂直切線",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("性質", r"$OT\perp \ell\ (\ell\text{ 為 }T\text{ 點切線})$"),
                ("判別", r"$\text{過圓上點 }T,\ OT\perp \ell\Rightarrow \ell\text{ 是切線}$"),
            ],
            usage=["判斷一條線是否為切線。", "證明題核心依據。"],
            examples=[r"過圓上點作半徑垂線可得切線。"],
            tips=["先確認該點在圓上，再用垂直判別。"],
            notes=["性質與判別方向不同，要分清楚。"],
            mistakes=["點不在圓上就直接套判別。"],
        ),
        topic_row(
            id_="j5-2-1-tangent-construction",
            title="切線作圖與切線長計算",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("切線長", r"$PT=\sqrt{PO^2-r^2}$"),
                ("直角模型", r"$\triangle POT\text{ 為直角三角形}$"),
            ],
            usage=["外點引切線、切線長求值。", "作圖題與計算題聯動。"],
            examples=[r"若 $PO=13,r=5$，則 $PT=12$。"],
            tips=["先畫出半徑到切點，建立直角。"],
            notes=["切線長題本質是畢氏。"],
            mistakes=["把 $PO$ 誤當切線長。"],
        ),
        topic_row(
            id_="j5-2-1-coordinate-tangent-area",
            title="座標切線與面積題：先找直角再拆面積",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("面積", r"$S=\frac{1}{2}\times \text{底}\times \text{高}$"),
                ("切線半徑", r"$OT\perp PT$"),
            ],
            usage=["坐標圖形中的切線面積。", "把圓題轉直角三角形。"],
            examples=["球碰杯壁模型可抽象成半徑垂直切線。"],
            tips=["先找垂直關係，再決定要拆哪幾塊面積。"],
            notes=["生活情境題常藏在這個模型。"],
            mistakes=["直接代面積公式但底高不垂直。"],
        ),
        topic_row(
            id_="j5-2-1-chord-center-distance",
            title="弦心距與垂徑定理",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("垂徑定理", r"$OM\perp AB\Rightarrow AM=MB$"),
                ("逆向", r"$AM=MB\Rightarrow OM\perp AB\ (\text{在圓內})$"),
            ],
            usage=["弦長、弦心距、垂直關係判斷。", "證明題高頻。"],
            examples=[r"圓心到弦的垂線會平分該弦。"],
            tips=["弦心距一定是圓心到弦的垂直距離。"],
            notes=["是弦長比較與計算基礎。"],
            mistakes=["忘記要先在同一圓內。"],
        ),
        topic_row(
            id_="j5-2-1-equal-chords-distance-order",
            title="等弦等距、弦長比較與距心遠近",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("等弦等距", r"$AB=CD\Rightarrow d_{AB}=d_{CD}$"),
                ("長弦近心", r"$AB>CD\Rightarrow d_{AB}<d_{CD}$"),
            ],
            usage=["比較兩條弦長或弦心距。", "判斷題快速決策。"],
            examples=[r"同圓內較長弦離圓心較近。"],
            tips=["比較長度時一定要同圓或等圓。"],
            notes=["方向常被搞反：長弦近心。"],
            mistakes=["把『長弦近心』記成『長弦遠心』。"],
        ),
        topic_row(
            id_="j5-2-1-chord-length-pythagorean",
            title="弦長計算：半徑、弦心距、半弦畢氏",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("半弦", r"$\left(\frac{AB}{2}\right)^2=r^2-d^2$"),
                ("弦長", r"$AB=2\sqrt{r^2-d^2}$"),
            ],
            usage=["已知半徑與弦心距求弦長。", "反推弦心距。"],
            examples=[r"$r=10,d=6\Rightarrow AB=16$。"],
            tips=["先算半弦再乘 2。"],
            notes=["計算時注意根號與平方。"],
            mistakes=["忘記最後要乘 2。"],
        ),
        topic_row(
            id_="j5-2-1-concentric-circle-area-diff",
            title="同心圓面積差與弦長連動",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("面積差", r"$\Delta S=\pi(R^2-r^2)$"),
                ("弦長連動", r"$L=2\sqrt{R^2-d^2}\ (\text{可反推 }R^2-d^2)$"),
            ],
            usage=["同心圓差面積題。", "由弦長回推半徑關係。"],
            examples=[r"利用同一條弦在不同圓上的資訊求面積差。"],
            tips=["先把幾何條件轉成平方量再代入面積差。"],
            notes=["平方差結構要保留到最後。"],
            mistakes=["太早開根號導致運算複雜。"],
        ),
        topic_row(
            id_="j5-2-1-two-circles-thresholds",
            title="兩圓位置總想法：比較 d、r1+r2、|r1-r2|",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("外判斷門檻", r"$r_1+r_2$"),
                ("內判斷門檻", r"$|r_1-r_2|$"),
            ],
            usage=["兩圓位置分類起手式。", "避免直接背分類表。"],
            examples=[r"先算兩門檻，再把 d 放進區間判斷。"],
            tips=["所有分類只看三個量的大小關係。"],
            notes=["是兩圓章節最核心骨架。"],
            mistakes=["忘記取絕對值。"],
        ),
        topic_row(
            id_="j5-2-1-five-position-cases",
            title="兩圓五種位置關係總表",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("外離", r"$d>r_1+r_2$"),
                ("外切", r"$d=r_1+r_2$"),
                ("相交", r"$|r_1-r_2|<d<r_1+r_2$"),
                ("內切", r"$d=|r_1-r_2|$"),
                ("內離", r"$d<|r_1-r_2|$"),
            ],
            usage=["兩圓分類題直接對照。", "公切線條數判斷前置。"],
            examples=[r"$d=|r_1-r_2|$ 時為內切。"],
            tips=["外離與內離要看 d 在哪個門檻外側。"],
            notes=["相交一定是兩門檻之間。"],
            mistakes=["把內切與外切條件對調。"],
        ),
        topic_row(
            id_="j5-2-1-position-judge-procedure",
            title="兩圓位置判斷題流程",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("流程", r"$\text{算 }d\rightarrow\text{算兩門檻}\rightarrow\text{比較分類}$"),
                ("距離", r"$d=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$"),
            ],
            usage=["座標兩圓分類題。", "文字題快速結構化。"],
            examples=["先比較平方值也可避免多次開根號。"],
            tips=["先用平方比較可減少計算錯誤。"],
            notes=["流程固定能大幅降低失誤。"],
            mistakes=["沒算 d 就直接猜分類。"],
        ),
        topic_row(
            id_="j5-2-1-common-chord-property",
            title="相交兩圓公共弦：連心線垂直平分",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("性質", r"$O_1O_2\perp AB$"),
                ("平分", r"$AM=MB\ (\text{M為垂足})$"),
            ],
            usage=["公共弦幾何關係判斷。", "公共弦計算前置。"],
            examples=[r"相交兩圓的連心線會垂直公共弦。"],
            tips=["先找連心線再找公共弦中點。"],
            notes=["連心線在兩圓題幾乎必畫。"],
            mistakes=["把公共弦當成一定過兩圓心。"],
        ),
        topic_row(
            id_="j5-2-1-common-chord-calculation",
            title="公共弦計算：兩半徑共用同一半弦",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("半弦共用", r"$\left(\frac{AB}{2}\right)^2=r_1^2-d_1^2=r_2^2-d_2^2$"),
                ("連心分段", r"$d_1+d_2=O_1O_2$"),
            ],
            usage=["公共弦長與圓心距分段求解。", "聯立兩圓資訊。"],
            examples=[r"先以兩個直角三角形建立同一半弦方程。"],
            tips=["先設定半弦未知量會更簡潔。"],
            notes=["常與連心線分段聯立。"],
            mistakes=["兩圓的 d 值誤用同一個。"],
        ),
        topic_row(
            id_="j5-2-1-tangent-point-centers-line",
            title="兩圓相切：切點在連心線上",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("外切", r"$O_1T+TO_2=O_1O_2$"),
                ("內切", r"$|O_1T-TO_2|=O_1O_2$"),
            ],
            usage=["兩圓相切結構推理。", "證明題與計算題。"],
            examples=[r"外切點把連心線分成兩段半徑。"],
            tips=["先判內切或外切再列關係。"],
            notes=["切點一定落在連心線上。"],
            mistakes=["把外切的加法寫成減法。"],
        ),
        topic_row(
            id_="j5-2-1-multi-circle-tangent-models",
            title="三圓外切與內切組合模型",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("外切距", r"$d=r_i+r_j$"),
                ("內切距", r"$d=|R-r|$"),
            ],
            usage=["三圓兩兩外切、大小圓內切題。", "半徑聯立方程。"],
            examples=[r"三圓兩兩外切時，圓心連線邊長為半徑和。"],
            tips=["先把每條圓心距寫成半徑式。"],
            notes=["圖形化方程是解題核心。"],
            mistakes=["忽略哪一對是內切哪一對是外切。"],
        ),
        topic_row(
            id_="j5-2-1-common-tangent-language-count",
            title="公切線語言與條數判斷",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("外公切線", r"$\text{兩圓在切線同側}$"),
                ("內公切線", r"$\text{兩圓在切線異側}$"),
                ("條數總覽", r"$\text{外離4、外切3、相交2、內切1、內離0}$"),
            ],
            usage=["先判條數再做長度計算。", "選擇題快速判斷。"],
            examples=[r"相交兩圓只有 2 條外公切線。"],
            tips=["條數完全由位置關係決定。"],
            notes=["此處最容易記錯外切與內切條數。"],
            mistakes=["把內切條數誤記為 2。"],
        ),
        topic_row(
            id_="j5-2-1-external-common-tangent-length",
            title="外公切線長公式：用半徑差",
            chapter_role="公式與性質",
            difficulty="進階",
            formula_lines=[
                ("公式", r"$L_{\text{外}}=\sqrt{d^2-(r_1-r_2)^2}$"),
                ("前提", r"$d\ge |r_1-r_2|$"),
            ],
            usage=["外公切線長計算。", "比較內外公切線長。"],
            examples=[r"$d=13,r_1=8,r_2=3\Rightarrow L_{\text{外}}=12$。"],
            tips=["先檢查位置是否允許外公切線。"],
            notes=["本質是直角三角形畢氏。"],
            mistakes=["誤用半徑和。"],
        ),
        topic_row(
            id_="j5-2-1-internal-common-tangent-length",
            title="內公切線長公式：用半徑和",
            chapter_role="公式與性質",
            difficulty="進階",
            formula_lines=[
                ("公式", r"$L_{\text{內}}=\sqrt{d^2-(r_1+r_2)^2}$"),
                ("前提", r"$d\ge r_1+r_2$"),
            ],
            usage=["內公切線長計算。", "外離與外切情況判斷。"],
            examples=[r"$d=17,r_1=8,r_2=3\Rightarrow L_{\text{內}}=12$。"],
            tips=["內公切線一定看半徑和。"],
            notes=["若兩圓相交則無內公切線。"],
            mistakes=["在相交情況仍硬算內公切線長。"],
        ),
        topic_row(
            id_="j5-2-1-tangent-length-comparison",
            title="同數據比較外公切線與內公切線",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("比較", r"$L_{\text{外}}^2=d^2-(r_1-r_2)^2$"),
                ("比較", r"$L_{\text{內}}^2=d^2-(r_1+r_2)^2$"),
            ],
            usage=["觀察題與比較題。", "驗證公式敏感度。"],
            examples=[r"同 d 下通常 $L_{\text{外}}>L_{\text{內}}$（若兩者都存在）。"],
            tips=["可先比較平方避免根號。"],
            notes=["判斷存在性永遠先於比較。"],
            mistakes=["忽略內公切線是否存在。"],
        ),
        topic_row(
            id_="j5-2-1-chapter-checklist",
            title="本章解題檢查表",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[
                ("流程", r"$\text{先分類}\rightarrow\text{選性質}\rightarrow\text{列式}\rightarrow\text{驗算}$"),
                ("核心量", r"$d,\ r,\ |r_1-r_2|,\ r_1+r_2$"),
            ],
            usage=["段考綜合題流程控管。", "避免公式套錯。"],
            examples=["題目同時有位置分類與長度計算時先分類。"],
            tips=["先畫連心線與垂足，多數題目就解開一半。"],
            notes=["是本章最實用的檢核模板。"],
            mistakes=["未分類就直接帶公式。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j5-2-1-circle-001",
            title="圓基本語言（基礎01）",
            difficulty="基礎",
            question_text="弦與割線有何差別？",
            answer_text="弦是連圓上兩點的線段；割線是與圓有兩交點的整條直線。",
            explanation_text="弦是線段概念，割線是直線概念。",
            topic_id="j5-2-1-circle-basic-language",
        ),
        question_row(
            id_="q-j5-2-1-circle-002",
            title="圓基本語言（基礎02）",
            difficulty="基礎",
            question_text=r"同一圓中兩條半徑一定有什麼關係？",
            answer_text="長度相等。",
            explanation_text=r"半徑定義即圓心到圓上點距離，皆為 $r$。",
            topic_id="j5-2-1-circle-basic-language",
        ),
        question_row(
            id_="q-j5-2-1-circle-003",
            title="點與圓位置（基礎01）",
            difficulty="基礎",
            question_text=r"若 $OP=7,r=5$，點 P 在圓內、圓上還是圓外？",
            answer_text="圓外。",
            explanation_text=r"$OP>r$，故在圓外。",
            topic_id="j5-2-1-point-circle-position",
        ),
        question_row(
            id_="q-j5-2-1-circle-004",
            title="點與圓位置（基礎02）",
            difficulty="基礎",
            question_text=r"若 $OP=r$，點 P 與圓的關係是什麼？",
            answer_text="點在圓上。",
            explanation_text=r"$OP=r$ 正是圓上點定義。",
            topic_id="j5-2-1-point-circle-position",
        ),
        question_row(
            id_="q-j5-2-1-circle-005",
            title="直線與圓位置（基礎01）",
            difficulty="基礎",
            question_text=r"若圓心到直線距離 $d=3$、半徑 $r=5$，直線與圓關係為何？",
            answer_text="相交兩點。",
            explanation_text=r"$d<r$，直線會割圓。",
            topic_id="j5-2-1-line-circle-position",
        ),
        question_row(
            id_="q-j5-2-1-circle-006",
            title="直線與圓位置（基礎02）",
            difficulty="基礎",
            question_text=r"若 $d=r$，這條直線稱為什麼？",
            answer_text="切線。",
            explanation_text=r"圓心到直線距離等於半徑即相切。",
            topic_id="j5-2-1-line-circle-position",
        ),
        question_row(
            id_="q-j5-2-1-circle-007",
            title="切線性質（基礎01）",
            difficulty="基礎",
            question_text="切點半徑與切線有何夾角關係？",
            answer_text="垂直（90 度）。",
            explanation_text="切線性質：切點半徑垂直切線。",
            topic_id="j5-2-1-tangent-property-criterion",
        ),
        question_row(
            id_="q-j5-2-1-circle-008",
            title="切線判別（基礎02）",
            difficulty="基礎",
            question_text="過圓上點 T 的直線若垂直 OT，可判為切線嗎？",
            answer_text="可以。",
            explanation_text="符合切線判別條件。",
            topic_id="j5-2-1-tangent-property-criterion",
        ),
        question_row(
            id_="q-j5-2-1-circle-009",
            title="切線長計算（中等01）",
            difficulty="中等",
            question_text=r"若外點到圓心 $PO=10$、半徑 $r=6$，求切線長 $PT$。",
            answer_text="8。",
            explanation_text=r"$PT=\sqrt{PO^2-r^2}=\sqrt{100-36}=8$。",
            topic_id="j5-2-1-tangent-construction",
        ),
        question_row(
            id_="q-j5-2-1-circle-010",
            title="切線作圖（中等02）",
            difficulty="中等",
            question_text="過圓上一點作切線，最關鍵步驟是什麼？",
            answer_text="連該點與圓心，再作其垂線。",
            explanation_text="半徑垂直切線是作圖核心。",
            topic_id="j5-2-1-tangent-construction",
        ),
        question_row(
            id_="q-j5-2-1-circle-011",
            title="座標切線面積（中等01）",
            difficulty="中等",
            question_text="切線面積題為何常先找直角？",
            answer_text="因為切點半徑與切線垂直，可直接用直角三角形面積或畢氏。",
            explanation_text="先找 90 度可把問題變可計算。",
            topic_id="j5-2-1-coordinate-tangent-area",
        ),
        question_row(
            id_="q-j5-2-1-circle-012",
            title="生活模型（中等02）",
            difficulty="中等",
            question_text="球碰杯壁時，為何接觸半徑會垂直杯壁？",
            answer_text="因為杯壁在接觸點可視為圓的切線。",
            explanation_text="切線與切點半徑垂直。",
            topic_id="j5-2-1-coordinate-tangent-area",
        ),
        question_row(
            id_="q-j5-2-1-circle-013",
            title="垂徑定理（基礎01）",
            difficulty="基礎",
            question_text=r"若 $OM\perp AB$ 且 O 為圓心，能推得什麼？",
            answer_text=r"$AM=MB$。",
            explanation_text="圓心到弦的垂線平分弦。",
            topic_id="j5-2-1-chord-center-distance",
        ),
        question_row(
            id_="q-j5-2-1-circle-014",
            title="弦心距（基礎02）",
            difficulty="基礎",
            question_text="弦心距是什麼長度？",
            answer_text="圓心到弦的垂直距離。",
            explanation_text="弦心距定義即垂直距離。",
            topic_id="j5-2-1-chord-center-distance",
        ),
        question_row(
            id_="q-j5-2-1-circle-015",
            title="等弦等距（中等01）",
            difficulty="中等",
            question_text="同圓中兩弦等長，弦心距有何關係？",
            answer_text="相等。",
            explanation_text="等弦等距性質。",
            topic_id="j5-2-1-equal-chords-distance-order",
        ),
        question_row(
            id_="q-j5-2-1-circle-016",
            title="長弦近心（中等02）",
            difficulty="中等",
            question_text="同圓內弦 AB 比弦 CD 長，哪一條離圓心較近？",
            answer_text="AB 較近。",
            explanation_text="長弦近心。",
            topic_id="j5-2-1-equal-chords-distance-order",
        ),
        question_row(
            id_="q-j5-2-1-circle-017",
            title="弦長計算（中等01）",
            difficulty="中等",
            question_text=r"若 $r=13,d=5$，求弦長 $AB$。",
            answer_text="24。",
            explanation_text=r"$AB=2\sqrt{13^2-5^2}=2\sqrt{144}=24$。",
            topic_id="j5-2-1-chord-length-pythagorean",
        ),
        question_row(
            id_="q-j5-2-1-circle-018",
            title="弦長反推（中等02）",
            difficulty="中等",
            question_text=r"若 $r=10,AB=12$，求弦心距 d。",
            answer_text="8。",
            explanation_text=r"半弦 6，$d=\sqrt{10^2-6^2}=8$。",
            topic_id="j5-2-1-chord-length-pythagorean",
        ),
        question_row(
            id_="q-j5-2-1-circle-019",
            title="同心圓面積差（進階01）",
            difficulty="進階",
            question_text=r"同心圓半徑分別為 7、3，面積差為何？",
            answer_text=r"$40\pi$。",
            explanation_text=r"$\pi(7^2-3^2)=\pi(49-9)=40\pi$。",
            topic_id="j5-2-1-concentric-circle-area-diff",
        ),
        question_row(
            id_="q-j5-2-1-circle-020",
            title="同心圓策略（進階02）",
            difficulty="進階",
            question_text="同心圓差面積題為何常保留平方量到最後？",
            answer_text="因為公式本身是平方差，保留平方量更穩定。",
            explanation_text="可減少不必要開根號與運算誤差。",
            topic_id="j5-2-1-concentric-circle-area-diff",
        ),
        question_row(
            id_="q-j5-2-1-circle-021",
            title="兩圓門檻（基礎01）",
            difficulty="基礎",
            question_text="判斷兩圓位置前，必算哪兩個門檻？",
            answer_text=r"$r_1+r_2$ 與 $|r_1-r_2|$。",
            explanation_text="所有分類都由 d 與這兩門檻比較得出。",
            topic_id="j5-2-1-two-circles-thresholds",
        ),
        question_row(
            id_="q-j5-2-1-circle-022",
            title="兩圓門檻（基礎02）",
            difficulty="基礎",
            question_text=r"若 $r_1=9,r_2=4$，兩個門檻數值各是多少？",
            answer_text=r"$r_1+r_2=13,\ |r_1-r_2|=5$。",
            explanation_text="直接代入半徑和與半徑差絕對值。",
            topic_id="j5-2-1-two-circles-thresholds",
        ),
        question_row(
            id_="q-j5-2-1-circle-023",
            title="五種位置（基礎01）",
            difficulty="基礎",
            question_text=r"若 $d>r_1+r_2$，兩圓位置為何？",
            answer_text="外離。",
            explanation_text="圓心距大於半徑和代表兩圓分離。",
            topic_id="j5-2-1-five-position-cases",
        ),
        question_row(
            id_="q-j5-2-1-circle-024",
            title="五種位置（基礎02）",
            difficulty="基礎",
            question_text=r"若 $d=|r_1-r_2|$，兩圓位置為何？",
            answer_text="內切。",
            explanation_text="圓內側相切的判準。",
            topic_id="j5-2-1-five-position-cases",
        ),
        question_row(
            id_="q-j5-2-1-circle-025",
            title="位置流程（中等01）",
            difficulty="中等",
            question_text="座標兩圓分類題最穩定流程是什麼？",
            answer_text="先算 d，再算兩門檻，最後比較分類。",
            explanation_text="流程化可避免漏判或誤判。",
            topic_id="j5-2-1-position-judge-procedure",
        ),
        question_row(
            id_="q-j5-2-1-circle-026",
            title="位置流程（中等02）",
            difficulty="中等",
            question_text="比較 d 時為何常先比較平方？",
            answer_text="可避免重複開根號，運算更穩定。",
            explanation_text="若皆非負，平方比較等價於原值比較。",
            topic_id="j5-2-1-position-judge-procedure",
        ),
        question_row(
            id_="q-j5-2-1-circle-027",
            title="公共弦性質（中等01）",
            difficulty="中等",
            question_text="相交兩圓的連心線與公共弦有何關係？",
            answer_text="連心線垂直公共弦並平分它。",
            explanation_text="公共弦是兩圓對稱結構的軸向結果。",
            topic_id="j5-2-1-common-chord-property",
        ),
        question_row(
            id_="q-j5-2-1-circle-028",
            title="公共弦性質（中等02）",
            difficulty="中等",
            question_text="公共弦會通過兩圓圓心嗎？",
            answer_text="不會（一般情況下）。",
            explanation_text="它垂直於連心線，不是連心線本身。",
            topic_id="j5-2-1-common-chord-property",
        ),
        question_row(
            id_="q-j5-2-1-circle-029",
            title="公共弦計算（進階01）",
            difficulty="進階",
            question_text="公共弦計算時，兩圓會共用哪個未知量？",
            answer_text="同一個半弦長。",
            explanation_text="半弦在兩個直角三角形中是同一段。",
            topic_id="j5-2-1-common-chord-calculation",
        ),
        question_row(
            id_="q-j5-2-1-circle-030",
            title="公共弦計算（進階02）",
            difficulty="進階",
            question_text=r"若公共弦長為 16，半弦長是多少？",
            answer_text="8。",
            explanation_text="半弦就是弦長的一半。",
            topic_id="j5-2-1-common-chord-calculation",
        ),
        question_row(
            id_="q-j5-2-1-circle-031",
            title="相切點性質（中等01）",
            difficulty="中等",
            question_text="兩圓相切時，切點一定落在哪條線上？",
            answer_text="連心線上。",
            explanation_text="內切與外切皆成立。",
            topic_id="j5-2-1-tangent-point-centers-line",
        ),
        question_row(
            id_="q-j5-2-1-circle-032",
            title="相切點性質（中等02）",
            difficulty="中等",
            question_text="外切與內切在連心線上的半徑關係差異是什麼？",
            answer_text="外切用半徑和，內切用半徑差。",
            explanation_text="外切兩圓向外分離，內切一圓包在另一圓內。",            
            topic_id="j5-2-1-tangent-point-centers-line",
        ),
        question_row(
            id_="q-j5-2-1-circle-033",
            title="三圓模型（進階01）",
            difficulty="進階",
            question_text="三圓兩兩外切時，圓心距如何表示？",
            answer_text="任兩圓心距都等於對應半徑和。",
            explanation_text="外切圓心距定義直接成立。",
            topic_id="j5-2-1-multi-circle-tangent-models",
        ),
        question_row(
            id_="q-j5-2-1-circle-034",
            title="內外切混合（進階02）",
            difficulty="進階",
            question_text="大圓與小圓內切時，圓心距如何表示？",
            answer_text=r"$|R-r|$。",
            explanation_text="內切是半徑差模型。",
            topic_id="j5-2-1-multi-circle-tangent-models",
        ),
        question_row(
            id_="q-j5-2-1-circle-035",
            title="公切線條數（中等01）",
            difficulty="中等",
            question_text="兩圓相交時共有幾條公切線？",
            answer_text="2 條。",
            explanation_text="相交情況只有兩條外公切線。",
            topic_id="j5-2-1-common-tangent-language-count",
        ),
        question_row(
            id_="q-j5-2-1-circle-036",
            title="公切線條數（中等02）",
            difficulty="中等",
            question_text="兩圓外切時共有幾條公切線？",
            answer_text="3 條。",
            explanation_text="外公切線 2 條，內公切線 1 條。",
            topic_id="j5-2-1-common-tangent-language-count",
        ),
        question_row(
            id_="q-j5-2-1-circle-037",
            title="外公切線長（進階01）",
            difficulty="進階",
            question_text=r"若 $d=13,r_1=8,r_2=3$，求外公切線長。",
            answer_text="12。",
            explanation_text=r"$L_{\text{外}}=\sqrt{13^2-(8-3)^2}=\sqrt{169-25}=12$。",
            topic_id="j5-2-1-external-common-tangent-length",
        ),
        question_row(
            id_="q-j5-2-1-circle-038",
            title="外公切線長（進階02）",
            difficulty="進階",
            question_text="外公切線長公式中要用半徑和還半徑差？",
            answer_text="半徑差。",
            explanation_text="外公切線是差模型。",
            topic_id="j5-2-1-external-common-tangent-length",
        ),
        question_row(
            id_="q-j5-2-1-circle-039",
            title="內公切線長（進階01）",
            difficulty="進階",
            question_text=r"若 $d=17,r_1=8,r_2=3$，求內公切線長。",
            answer_text="12。",
            explanation_text=r"$L_{\text{內}}=\sqrt{17^2-(8+3)^2}=\sqrt{289-121}=12$。",
            topic_id="j5-2-1-internal-common-tangent-length",
        ),
        question_row(
            id_="q-j5-2-1-circle-040",
            title="內公切線存在性（進階02）",
            difficulty="進階",
            question_text="兩圓相交時是否有內公切線？",
            answer_text="沒有。",
            explanation_text=r"相交時 $d<r_1+r_2$，內公切線長根號內為負。",
            topic_id="j5-2-1-internal-common-tangent-length",
        ),
        question_row(
            id_="q-j5-2-1-circle-041",
            title="內外比較（進階01）",
            difficulty="進階",
            question_text="同一組 d、r1、r2 下，若兩種公切線都存在，通常哪個較長？",
            answer_text="外公切線較長。",
            explanation_text="外公切線減的是 $(r_1-r_2)^2$，內公切線減的是較大的 $(r_1+r_2)^2$。",
            topic_id="j5-2-1-tangent-length-comparison",
        ),
        question_row(
            id_="q-j5-2-1-circle-042",
            title="內外比較（進階02）",
            difficulty="進階",
            question_text="比較內外公切線長前，第一步應做什麼？",
            answer_text="先檢查兩者是否都存在。",
            explanation_text="不存在就不能比較長度。",
            topic_id="j5-2-1-tangent-length-comparison",
        ),
        question_row(
            id_="q-j5-2-1-circle-043",
            title="檢查表流程（進階01）",
            difficulty="進階",
            question_text="本章綜合題最穩定的四步是什麼？",
            answer_text="先分類、再選性質、再列式、最後驗算。",
            explanation_text="流程化可減少套錯公式與漏條件。",
            topic_id="j5-2-1-chapter-checklist",
        ),
        question_row(
            id_="q-j5-2-1-circle-044",
            title="檢查表重點（進階02）",
            difficulty="進階",
            question_text="遇到兩圓題，最先要寫下哪三個關鍵量？",
            answer_text=r"$d,\ r_1+r_2,\ |r_1-r_2|$。",
            explanation_text="這三個量決定位置與後續公切線判斷。",
            topic_id="j5-2-1-chapter-checklist",
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

