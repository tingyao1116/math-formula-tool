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

SOURCE_WORD = r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國一上2  指數律與科學記號.docx"
SUMMARY_WORD = str(ROOT / "exports" / "word-j1-1-3-4" / "改國一上2_指數律與科學記號_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"


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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j1-1-3-4-{ts}{path.suffix}"
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
    chapter: str,
    chapter_code: str,
    chapter_order: int,
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
    return {
        "id": id_,
        "title": title,
        "formula": make_formula(formula_lines),
        "stage": "國中",
        "grade": "國一",
        "term": "上學期",
        "chapter": chapter,
        "section": chapter,
        "chapterCode": chapter_code,
        "chapterOrder": chapter_order,
        "stageOrder": 1,
        "gradeOrder": 1,
        "termOrder": 1,
        "gradeLabel": "國一上",
        "domain": "數與量",
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
        "originalIndex": 999000,
        "modifiedAt": now_iso(),
    }


def question_row(
    *,
    id_: str,
    title: str,
    chapter: str,
    difficulty: str,
    question_text: str,
    answer_text: str,
    explanation_text: str,
    topic_id: str,
    chapter_code: str,
) -> Dict:
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
    topics = []

    topics.append(
        topic_row(
            id_="j1-1-3-exponent-laws-main",
            title="指數律核心概念",
            chapter="指數律",
            chapter_code="j1-1-3",
            chapter_order=3,
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("次方意義", r"$a^n=\underbrace{a\times a\times\cdots\times a}_{n\text{ 個}}$"),
                ("同底數乘除", r"$a^m\cdot a^n=a^{m+n},\quad a^m\div a^n=a^{m-n}\ (a\neq0)$"),
                ("冪的運算", r"$(a^m)^n=a^{mn}$"),
            ],
            usage=["用來統整指數律全章，先建立規則圖，再做題型分流。"],
            examples=[r"例如：$5^3\div5^2=5^{3-2}=5$。"],
            tips=["先看底數是否相同，再決定要加指數或減指數。"],
            notes=["本主題為 j1-1-3 的總覽主題。"],
            mistakes=["把 $a^m+a^n$ 誤寫成 $a^{m+n}$。"],
        )
    )

    topics.append(
        topic_row(
            id_="j1-1-3-exponent-meaning-and-sign",
            title="次方意義與符號判讀",
            chapter="指數律",
            chapter_code="j1-1-3",
            chapter_order=3,
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j1-1-3-exponent-laws-main",
            is_branch=True,
            formula_lines=[
                ("負號與括號", r"$(-2)^4=16,\quad -2^4=-16$"),
                ("次方讀法", r"$a^n$ 的 $n$ 是「乘幾次」"),
            ],
            usage=["用在先釐清括號、負號、次方順序的題目。"],
            examples=[r"比較 $(-3)^2$ 與 $-3^2$。"],
            tips=["只要看到負號，第一步先看有沒有括號。"],
            notes=["對應原講義前段次方定義題。"],
            mistakes=["把 $-a^2$ 當成 $(-a)^2$。"],
        )
    )

    topics.append(
        topic_row(
            id_="j1-1-3-exponent-laws-mul-div",
            title="同底數乘除法則",
            chapter="指數律",
            chapter_code="j1-1-3",
            chapter_order=3,
            chapter_role="分支題型",
            difficulty="基礎",
            parent_id="j1-1-3-exponent-laws-main",
            is_branch=True,
            formula_lines=[
                ("乘法", r"$a^m\cdot a^n=a^{m+n}$"),
                ("除法", r"$a^m\div a^n=a^{m-n}\ (a\neq0)$"),
            ],
            usage=["同底數連乘連除、整數指數化簡。"],
            examples=[r"$(\frac23)^3\cdot(\frac23)^2=(\frac23)^5$。"],
            tips=["同底數才可直接合併，不同底數不可硬併。"],
            notes=["對應原講義『指數律運算規則 1,2』。"],
            mistakes=["不同底數也直接加減指數。"],
        )
    )

    topics.append(
        topic_row(
            id_="j1-1-3-exponent-laws-power-rules",
            title="冪的冪與積商次方",
            chapter="指數律",
            chapter_code="j1-1-3",
            chapter_order=3,
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-1-3-exponent-laws-main",
            is_branch=True,
            formula_lines=[
                ("冪的冪", r"$(a^m)^n=a^{mn}$"),
                ("積的次方", r"$(ab)^n=a^n b^n$"),
                ("商的次方", r"$(\frac ab)^n=\frac{a^n}{b^n}\ (b\neq0)$"),
            ],
            usage=["多層括號與分數底數的次方題。"],
            examples=[r"$(6^3)^2=6^6$，$(\frac47)^3=\frac{4^3}{7^3}$。"],
            tips=["先處理最內層括號，再往外層走。"],
            notes=["對應原講義『規則 4,5』與例題群。"],
            mistakes=["把 $(a^m)^n$ 寫成 $a^{m+n}$。"],
        )
    )

    topics.append(
        topic_row(
            id_="j1-1-3-zero-and-negative-exponents",
            title="零次方與負次方",
            chapter="指數律",
            chapter_code="j1-1-3",
            chapter_order=3,
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-1-3-exponent-laws-main",
            is_branch=True,
            formula_lines=[
                ("零次方", r"$a^0=1\ (a\neq0)$"),
                ("負次方", r"$a^{-n}=\frac{1}{a^n}\ (a\neq0)$"),
            ],
            usage=["零次方、倒數、負指數混合化簡。"],
            examples=[r"$2^{-4}=\frac1{2^4}=\frac1{16}$。"],
            tips=["看到負次方先改寫成分數，錯誤率最低。"],
            notes=["對應原講義中段零次方與負次方練習。"],
            mistakes=["把 $a^0$ 算成 0。"],
        )
    )

    topics.append(
        topic_row(
            id_="j1-1-3-exponent-mixed-application",
            title="指數律綜合應用",
            chapter="指數律",
            chapter_code="j1-1-3",
            chapter_order=3,
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j1-1-3-exponent-laws-main",
            is_branch=True,
            formula_lines=[
                ("綜合策略", r"先括號 $\to$ 再乘除 $\to$ 再整體化簡"),
                ("檢查", r"最後確認是否可改成正指數與最簡分數"),
            ],
            usage=["混合題、代數式、應用情境題。"],
            examples=[r"$(2^3\cdot3^{-1})^2\div(2\cdot3^{-2})$。"],
            tips=["每一步只做一種規則，避免跳步失誤。"],
            notes=["對應原講義後段綜合演練。"],
            mistakes=["同一步同時套多條規則導致指數抄錯。"],
        )
    )

    topics.append(
        topic_row(
            id_="j1-1-4-scientific-notation-main",
            title="科學記號核心概念",
            chapter="科學記號",
            chapter_code="j1-1-4",
            chapter_order=4,
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("標準型", r"$a\times10^n,\quad 1\le |a|<10,\ n\in\mathbb{Z}$"),
                ("大數", r"小數點左移 $k$ 位 $\Rightarrow \times10^k$"),
                ("小數", r"小數點右移 $k$ 位 $\Rightarrow \times10^{-k}$"),
            ],
            usage=["科學記號全章總整理。"],
            examples=[r"$13{,}500{,}000=1.35\times10^7$。"],
            tips=["先把係數調進 $[1,10)$，再決定指數。"],
            notes=["本主題為 j1-1-4 的總覽主題。"],
            mistakes=["係數超過 10 卻沒再調整。"],
        )
    )

    topics.append(
        topic_row(
            id_="j1-1-4-convert-between-forms",
            title="一般數與科學記號互換",
            chapter="科學記號",
            chapter_code="j1-1-4",
            chapter_order=4,
            chapter_role="分支題型",
            difficulty="基礎",
            parent_id="j1-1-4-scientific-notation-main",
            is_branch=True,
            formula_lines=[
                ("一般數轉換", r"$N=a\times10^n$"),
                ("還原一般數", r"$a\times10^n$ 依 $n$ 正負移動小數點"),
            ],
            usage=["純轉換題與位值題。"],
            examples=[r"$0.00052=5.2\times10^{-4}$。"],
            tips=["先估數量級，快速檢查正負指數是否合理。"],
            notes=["對應原講義科學記號定義、例題 1~4。"],
            mistakes=["把 $10^{-4}$ 寫成把小數點左移 4 位。"],
        )
    )

    topics.append(
        topic_row(
            id_="j1-1-4-scientific-mul-div",
            title="科學記號乘除運算",
            chapter="科學記號",
            chapter_code="j1-1-4",
            chapter_order=4,
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-1-4-scientific-notation-main",
            is_branch=True,
            formula_lines=[
                ("乘法", r"$(a\times10^m)(b\times10^n)=(ab)\times10^{m+n}$"),
                ("除法", r"$(a\times10^m)\div(b\times10^n)=\frac ab\times10^{m-n}$"),
            ],
            usage=["跨位值乘除、大數小數混合題。"],
            examples=[r"$(3\times10^5)(2\times10^{-3})=6\times10^2$。"],
            tips=["係數若不在標準範圍，最後一定要重整一次。"],
            notes=["對應原講義科學記號運算（乘、除）。"],
            mistakes=["只算係數，不處理 $10$ 的指數。"],
        )
    )

    topics.append(
        topic_row(
            id_="j1-1-4-scientific-add-sub",
            title="科學記號加減運算",
            chapter="科學記號",
            chapter_code="j1-1-4",
            chapter_order=4,
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-1-4-scientific-notation-main",
            is_branch=True,
            formula_lines=[
                ("同次方先加減", r"$a\times10^n\pm b\times10^n=(a\pm b)\times10^n$"),
                ("不同次方先對齊", r"先改寫成同一個 $10^n$ 再做係數加減"),
            ],
            usage=["科學記號加減、估算與誤差題。"],
            examples=[r"$8.9\times10^6-4.3\times10^5=8.47\times10^6$。"],
            tips=["先對齊次方再加減，不能直接把係數硬加。"],
            notes=["對應原講義例題 21、22 型。"],
            mistakes=["次方不同卻直接算係數。"],
        )
    )

    topics.append(
        topic_row(
            id_="j1-1-4-scientific-application",
            title="科學記號應用題",
            chapter="科學記號",
            chapter_code="j1-1-4",
            chapter_order=4,
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j1-1-4-scientific-notation-main",
            is_branch=True,
            formula_lines=[
                ("應用流程", r"先列式 $\to$ 再轉科學記號 $\to$ 再重整係數"),
                ("量級判斷", r"結果量級是否符合題意（公尺、公里、秒等）"),
            ],
            usage=["距離、速度、金額、組合數等應用題。"],
            examples=[r"光速約 $3\times10^5$ km/s，1 光年約 $9.46\times10^{12}$ km。"],
            tips=["應用題最後一定要檢查單位與量級。"],
            notes=["對應原講義應用計算題區。"],
            mistakes=["計算完成後忘記寫回標準科學記號。"],
        )
    )

    return topics


def build_questions() -> List[Dict]:
    rows = []

    rows.extend(
        [
            question_row(
                id_="q-j1-1-3-word02-001",
                title="次方與括號判讀（基礎01）",
                chapter="指數律",
                difficulty="基礎",
                question_text=r"比較下列兩數：$(-3)^2$ 與 $-3^2$，各是多少？",
                answer_text=r"$(-3)^2=9,\ -3^2=-9$",
                explanation_text=r"有括號時底數是 $-3$；無括號時先算 $3^2$ 再加負號。",
                topic_id="j1-1-3-exponent-meaning-and-sign",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-002",
                title="同底數乘法（基礎02）",
                chapter="指數律",
                difficulty="基礎",
                question_text=r"計算：$(\frac{2}{3})^3\cdot(\frac{2}{3})^2$。",
                answer_text=r"$(\frac{2}{3})^5=\frac{32}{243}$",
                explanation_text=r"同底數相乘指數相加：$3+2=5$。",
                topic_id="j1-1-3-exponent-laws-mul-div",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-003",
                title="同底數除法（基礎03）",
                chapter="指數律",
                difficulty="基礎",
                question_text=r"計算：$5^3\div5^2$。",
                answer_text=r"$5$",
                explanation_text=r"同底數相除指數相減：$5^{3-2}=5^1=5$。",
                topic_id="j1-1-3-exponent-laws-mul-div",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-004",
                title="冪的冪（基礎04）",
                chapter="指數律",
                difficulty="基礎",
                question_text=r"計算：$(6^3)^2$。",
                answer_text=r"$6^6$",
                explanation_text=r"冪的冪為指數相乘：$(a^m)^n=a^{mn}$。",
                topic_id="j1-1-3-exponent-laws-power-rules",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-005",
                title="分數底數次方（中等01）",
                chapter="指數律",
                difficulty="中等",
                question_text=r"計算：$(\frac{4}{7})^3$。",
                answer_text=r"$\frac{64}{343}$",
                explanation_text=r"商的次方：$(\frac{a}{b})^n=\frac{a^n}{b^n}$。",
                topic_id="j1-1-3-exponent-laws-power-rules",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-006",
                title="零次方（基礎05）",
                chapter="指數律",
                difficulty="基礎",
                question_text=r"計算：$(4.12)^0\times(\frac{3}{8})^0\times(-3^4)$。",
                answer_text=r"$-81$",
                explanation_text=r"$a^0=1\ (a\neq0)$，前兩項都為 1，故結果為 $-3^4=-81$。",
                topic_id="j1-1-3-zero-and-negative-exponents",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-007",
                title="負次方（中等02）",
                chapter="指數律",
                difficulty="中等",
                question_text=r"計算：$2^{-4}$。",
                answer_text=r"$\frac1{16}$",
                explanation_text=r"$2^{-4}=\frac1{2^4}=\frac1{16}$。",
                topic_id="j1-1-3-zero-and-negative-exponents",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-008",
                title="指數律混合化簡（中等03）",
                chapter="指數律",
                difficulty="中等",
                question_text=r"化簡：$(2^3\cdot3^{-1})^2\div(2\cdot3^{-2})$。",
                answer_text=r"$32$",
                explanation_text=r"先算括號：$(2^3\cdot3^{-1})^2=2^6\cdot3^{-2}$；再除以 $(2\cdot3^{-2})$，得 $2^{6-1}\cdot3^{-2-(-2)}=2^5\cdot3^0=32$。",
                topic_id="j1-1-3-exponent-mixed-application",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-009",
                title="數值比較（進階01）",
                chapter="指數律",
                difficulty="進階",
                question_text=r"比較大小：$(\frac{1}{2})^{24}$、$(\frac{1}{3})^{16}$、$(\frac{1}{10})^8$。",
                answer_text=r"$(\frac{1}{3})^{16}>(\frac{1}{2})^{24}>(\frac{1}{10})^8$",
                explanation_text=r"可化成 $3^{-16},2^{-24},10^{-8}$ 比較，或取對數估算量級。",
                topic_id="j1-1-3-exponent-mixed-application",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-010",
                title="同底數綜合（基礎06）",
                chapter="指數律",
                difficulty="基礎",
                question_text=r"計算：$70\times2^{10}\times5^{10}\div(14\times2^8\times5^9)$。",
                answer_text=r"$100$",
                explanation_text=r"$70\div14=5$，再用 $2^{10-8}\cdot5^{10-9}=2^2\cdot5=20$，最後 $5\cdot20=100$。",
                topic_id="j1-1-3-exponent-mixed-application",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-011",
                title="整數次方符號（中等04）",
                chapter="指數律",
                difficulty="中等",
                question_text=r"計算：$(-1)+(-1)^2+(-1)^3+\cdots+(-1)^{10}$。",
                answer_text=r"$0$",
                explanation_text=r"奇次方為 $-1$、偶次方為 $1$，成對相加為 0。",
                topic_id="j1-1-3-exponent-meaning-and-sign",
                chapter_code="j1-1-3",
            ),
            question_row(
                id_="q-j1-1-3-word02-012",
                title="分數次方運算（進階02）",
                chapter="指數律",
                difficulty="進階",
                question_text=r"已知 $x=\frac45,\ y=\frac53$，求 $(xy)^{-2}$。",
                answer_text=r"$\frac{9}{16}$",
                explanation_text=r"$xy=\frac45\cdot\frac53=\frac43$，故 $(xy)^{-2}=(\frac43)^{-2}=(\frac34)^2=\frac9{16}$。",
                topic_id="j1-1-3-exponent-mixed-application",
                chapter_code="j1-1-3",
            ),
        ]
    )

    rows.extend(
        [
            question_row(
                id_="q-j1-1-4-word02-013",
                title="一般數轉科學記號（基礎01）",
                chapter="科學記號",
                difficulty="基礎",
                question_text=r"將 $13{,}500{,}000$ 以科學記號表示。",
                answer_text=r"$1.35\times10^7$",
                explanation_text=r"小數點左移 7 位，係數為 1.35。",
                topic_id="j1-1-4-convert-between-forms",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-014",
                title="小數轉科學記號（基礎02）",
                chapter="科學記號",
                difficulty="基礎",
                question_text=r"將 $0.00000052$ 以科學記號表示。",
                answer_text=r"$5.2\times10^{-7}$",
                explanation_text=r"小數點右移 7 位，所以指數為 $-7$。",
                topic_id="j1-1-4-convert-between-forms",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-015",
                title="科學記號還原（基礎03）",
                chapter="科學記號",
                difficulty="基礎",
                question_text=r"將 $9.46\times10^{12}$ 還原成一般數。",
                answer_text=r"$9{,}460{,}000{,}000{,}000$",
                explanation_text=r"小數點右移 12 位。",
                topic_id="j1-1-4-convert-between-forms",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-016",
                title="科學記號乘法（中等01）",
                chapter="科學記號",
                difficulty="中等",
                question_text=r"計算：$(3.2\times10^5)(4\times10^{-3})$。",
                answer_text=r"$1.28\times10^3$",
                explanation_text=r"係數 $3.2\times4=12.8$，次方 $10^{5-3}=10^2$，重整得 $1.28\times10^3$。",
                topic_id="j1-1-4-scientific-mul-div",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-017",
                title="科學記號除法（中等02）",
                chapter="科學記號",
                difficulty="中等",
                question_text=r"計算：$(6\times10^{-2})\div(3\times10^4)$。",
                answer_text=r"$2\times10^{-6}$",
                explanation_text=r"係數 $6\div3=2$，次方 $10^{-2-4}=10^{-6}$。",
                topic_id="j1-1-4-scientific-mul-div",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-018",
                title="科學記號加法（中等03）",
                chapter="科學記號",
                difficulty="中等",
                question_text=r"計算：$4.83\times10^7+5.17\times10^6$。",
                answer_text=r"$5.347\times10^7$",
                explanation_text=r"$5.17\times10^6=0.517\times10^7$，故和為 $(4.83+0.517)\times10^7$。",
                topic_id="j1-1-4-scientific-add-sub",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-019",
                title="科學記號減法（中等04）",
                chapter="科學記號",
                difficulty="中等",
                question_text=r"計算：$8.9\times10^6-4.3\times10^5$。",
                answer_text=r"$8.47\times10^6$",
                explanation_text=r"$4.3\times10^5=0.43\times10^6$，再做係數相減。",
                topic_id="j1-1-4-scientific-add-sub",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-020",
                title="負指數加減（進階01）",
                chapter="科學記號",
                difficulty="進階",
                question_text=r"計算：$5.3\times10^{-4}-7.4\times10^{-3}$。",
                answer_text=r"$-6.87\times10^{-3}$",
                explanation_text=r"$5.3\times10^{-4}=0.53\times10^{-3}$，故 $(0.53-7.4)\times10^{-3}$。",
                topic_id="j1-1-4-scientific-add-sub",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-021",
                title="係數範圍判斷（基礎04）",
                chapter="科學記號",
                difficulty="基礎",
                question_text=r"科學記號 $a\times10^n$ 中，$a$ 的範圍是什麼？",
                answer_text=r"$1\le |a|<10$",
                explanation_text=r"係數須介於 1 與 10 之間（含 1 不含 10）。",
                topic_id="j1-1-4-scientific-notation-main",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-022",
                title="量級應用（進階02）",
                chapter="科學記號",
                difficulty="進階",
                question_text=r"光速約 $3\times10^5$ 公里/秒，一年約 $3.156\times10^7$ 秒，求一光年約幾公里（科學記號）。",
                answer_text=r"$9.468\times10^{12}$ 公里",
                explanation_text=r"$(3\times10^5)(3.156\times10^7)=9.468\times10^{12}$。",
                topic_id="j1-1-4-scientific-application",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-023",
                title="奈米換算（進階03）",
                chapter="科學記號",
                difficulty="進階",
                question_text=r"已知 $1$ 奈米 $=10^{-9}$ 公尺，$942$ 奈米為多少公尺（科學記號）？",
                answer_text=r"$9.42\times10^{-7}$ 公尺",
                explanation_text=r"$942\times10^{-9}=9.42\times10^2\times10^{-9}=9.42\times10^{-7}$。",
                topic_id="j1-1-4-scientific-application",
                chapter_code="j1-1-4",
            ),
            question_row(
                id_="q-j1-1-4-word02-024",
                title="綜合運算（進階04）",
                chapter="科學記號",
                difficulty="進階",
                question_text=r"計算並以科學記號表示：$\frac{3015\times0.028}{0.000007\times0.03\times150}$。",
                answer_text=r"$1.34\times10^{10}$（約）",
                explanation_text=r"先把小數轉成科學記號後乘除，再重整係數到標準範圍。",
                topic_id="j1-1-4-scientific-application",
                chapter_code="j1-1-4",
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

    # validations
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
