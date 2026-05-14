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

SOURCE_WORD = r"C:\codex資料夾\新增題庫\WORD檔資料\word華興中學數學講義\改國一上4 一元一次方程式.docx"
SUMMARY_WORD = str(ROOT / "exports" / "word-j1-3-1-2-3" / "改國一上4_一元一次方程式_重點整理.docx")
SOURCE_REF = f"{Path(SOURCE_WORD).name} -> {Path(SUMMARY_WORD).name}"

CHAPTER_NAME = {
    "j1-3-1": "一元一次式",
    "j1-3-2": "一元一次方程式",
    "j1-3-3": "一元一次方程式應用問題",
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


def load_json(path: Path) -> Dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: Dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def backup_file(path: Path) -> str:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j1-3-1-2-3-{ts}{path.suffix}"
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
    chapter_code: str,
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
    chapter = CHAPTER_NAME[chapter_code]
    chapter_order = {"j1-3-1": 1, "j1-3-2": 2, "j1-3-3": 3}[chapter_code]
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
        "domain": "代數",
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
        "originalIndex": 999130,
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
    rows = []

    # j1-3-1
    rows.append(
        topic_row(
            id_="j1-3-1-expression-main",
            title="一元一次式核心觀念",
            chapter_code="j1-3-1",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("形式", r"$ax+b$（$a,b$ 為數，$x$ 為未知數）"),
                ("代入", r"若 $x=k$，則 $ax+b=ak+b$"),
            ],
            usage=["本章入口：先辨認題目是『列式』還是『求值』。"],
            examples=[r"若 $x=4$，則 $3x-5=7$。"],
            tips=["先讀句意決定未知數代表什麼，再下筆列式。"],
            notes=["對應原始講義：用符號代表數與求算式的值。"],
            mistakes=["把一元一次式誤當成方程式，直接開始解 $x$。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-1-symbolize-quantity",
            title="用符號代表數與量",
            chapter_code="j1-3-1",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j1-3-1-expression-main",
            is_branch=True,
            formula_lines=[
                ("多與少", r"比 $x$ 多 3：$x+3$；比 $x$ 少 3：$x-3$"),
                ("倍數", r"$x$ 的 5 倍：$5x$；$x$ 的一半：$\frac{x}{2}$"),
            ],
            usage=["年齡、金額、數量比較題。"],
            examples=[r"弟弟比哥哥小 3 歲，可寫成 $x-3$。"],
            tips=["『比誰多/少』先找基準量，再寫加減。"],
            notes=["強化語意翻譯能力。"],
            mistakes=["把『比哥哥小 3』寫成 $3-x$。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-1-consecutive-numbers",
            title="連續整數列式",
            chapter_code="j1-3-1",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-3-1-expression-main",
            is_branch=True,
            formula_lines=[
                ("三個連續整數", r"$x-1,\ x,\ x+1$"),
                ("五個連續整數", r"$x-2,\ x-1,\ x,\ x+1,\ x+2$"),
            ],
            usage=["整數和、平均數、條件方程式前置列式。"],
            examples=[r"三個連續整數和為 60，可列 $(x-1)+x+(x+1)=60$。"],
            tips=["以中間數當未知數，式子通常最對稱好算。"],
            notes=["對應講義連續整數例題。"],
            mistakes=["連續整數誤寫成差 2。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-1-odd-even-sequences",
            title="連續奇偶數列式",
            chapter_code="j1-3-1",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-3-1-expression-main",
            is_branch=True,
            formula_lines=[
                ("連續偶數", r"$x,\ x+2,\ x+4,\ldots$"),
                ("連續奇數", r"$x,\ x+2,\ x+4,\ldots$（$x$ 為奇數）"),
            ],
            usage=["奇偶數和、最大最小值題。"],
            examples=[r"五個連續偶數（中間 $x$）可寫 $x-4,x-2,x,x+2,x+4$。"],
            tips=["奇偶數都以 2 為步長。"],
            notes=["對應講義連續偶數/奇數段落。"],
            mistakes=["最大數與最小數相差誤算。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-1-multiply-divide-notation",
            title="乘除簡記與代數式整理",
            chapter_code="j1-3-1",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-3-1-expression-main",
            is_branch=True,
            formula_lines=[
                ("乘法簡記", r"$3\times x=3x$，$a\times b=ab$"),
                ("除法改寫", r"$x\div 3=\frac{x}{3}$，$a\div b=\frac{a}{b}$"),
            ],
            usage=["將口語式改寫成標準代數式。"],
            examples=[r"$a\times 5\div 7\times b=\frac{5ab}{7}$。"],
            tips=["遇到加減時，不可把正負號省略。"],
            notes=["對應講義『乘法的簡記』。"],
            mistakes=[r"把 $x\div y\div z$ 誤寫成 $\frac{x}{y}+z$。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-1-substitution-value",
            title="代入求值與符號意義",
            chapter_code="j1-3-1",
            chapter_role="典型題型",
            difficulty="基礎",
            parent_id="j1-3-1-expression-main",
            is_branch=True,
            formula_lines=[
                ("代入原則", r"先代入，再依運算順序計算"),
                ("括號", r"若 $x<0$，代入時務必加括號，如 $-2x+1=-2(-3)+1$"),
            ],
            usage=["算式值、情境代入題。"],
            examples=[r"若 $x=10$，則 $20x=200$。"],
            tips=["負值代入要先括號，避免符號錯誤。"],
            notes=["對應講義『求算式的值』。"],
            mistakes=["代入時漏括號導致正負錯誤。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-1-word-to-expression",
            title="文字敘述轉代數式",
            chapter_code="j1-3-1",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j1-3-1-expression-main",
            is_branch=True,
            formula_lines=[
                ("常見語句", r"『總共』常用加法，『剩下』常用減法，『平均』常用除法"),
                ("翻譯策略", r"先定義未知數，再把每句條件轉成式子"),
            ],
            usage=["一元一次方程式應用題的前置能力。"],
            examples=[r"班上 $x$ 人，每人 50 元，總費用 $50x$ 元。"],
            tips=["先寫『設』，再逐句翻譯，最後整合。"],
            notes=["銜接 j1-3-3 應用題。"],
            mistakes=["句意還沒翻清楚就硬列方程。"],
        )
    )

    # j1-3-2
    rows.append(
        topic_row(
            id_="j1-3-2-equation-main",
            title="一元一次方程式核心觀念",
            chapter_code="j1-3-2",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("標準型", r"$ax+b=c$（$a\neq 0$）"),
                ("目標", r"把方程變形成 $x=\text{常數}$"),
            ],
            usage=["解方程式的總流程與判斷基礎。"],
            examples=[r"$2x-5=11\Rightarrow x=8$。"],
            tips=["每一步只做一個明確操作，減少抄錯。"],
            notes=["對應講義『解一元一次方程式』主軸。"],
            mistakes=["把未知數與常數混在同一邊未整理。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-2-equality-axiom-transpose",
            title="等量公理與移項法則",
            chapter_code="j1-3-2",
            chapter_role="重要配角",
            difficulty="基礎",
            parent_id="j1-3-2-equation-main",
            is_branch=True,
            formula_lines=[
                ("等量公理", r"等式兩邊同加減乘除（除數不為 0）仍相等"),
                ("移項", r"移到另一邊等價於兩邊同加或同減，符號會改變"),
            ],
            usage=["解任何一元一次方程式的必要觀念。"],
            examples=[r"$x-7=12\Rightarrow x=12+7$。"],
            tips=["把移項想成『兩邊做同一件事』，不容易錯。"],
            notes=["對應講義等量公理與移項法則。"],
            mistakes=["移項不改號。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-2-combine-like-terms",
            title="合併同類項",
            chapter_code="j1-3-2",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-3-2-equation-main",
            is_branch=True,
            formula_lines=[
                ("同類項", r"$ax+bx=(a+b)x$"),
                ("常數項", r"$m+n$ 直接合併"),
            ],
            usage=["解方程式中段整理。"],
            examples=[r"$5x-3x+2=18\Rightarrow 2x+2=18$。"],
            tips=["先圈出含 $x$ 的項，再處理常數。"],
            notes=["對應講義整式整理例題。"],
            mistakes=["把 $x^2$ 與 $x$ 當同類項。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-2-distributive-remove-brackets",
            title="分配律與去括號",
            chapter_code="j1-3-2",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-3-2-equation-main",
            is_branch=True,
            formula_lines=[
                ("分配律", r"$a(b\pm c)=ab\pm ac$"),
                ("負號括號", r"$-(b-c)=-b+c$"),
            ],
            usage=["含括號方程式。"],
            examples=[r"$3(x-2)-2(x+1)=7\Rightarrow x=15$。"],
            tips=["括號前有負號時，內部每一項都要變號。"],
            notes=["對應講義去括號運算。"],
            mistakes=["只改第一項符號，漏改其他項。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-2-clear-denominator",
            title="含分數方程式與去分母",
            chapter_code="j1-3-2",
            chapter_role="分支題型",
            difficulty="進階",
            parent_id="j1-3-2-equation-main",
            is_branch=True,
            formula_lines=[
                ("去分母", r"方程兩邊同乘分母最小公倍數"),
                ("步驟", r"先去分母，再去括號，再移項"),
            ],
            usage=["係數是分數或有分母的方程題。"],
            examples=[r"$\frac{x}{3}+\frac{x-1}{2}=5$，兩邊同乘 6。"],
            tips=["每一項都要乘到，不可漏乘。"],
            notes=["對應講義分數方程式題組。"],
            mistakes=["只乘分母，不乘分子前的整項。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-2-solution-types",
            title="解的型態：唯一解、無解、無限多解",
            chapter_code="j1-3-2",
            chapter_role="典型題型",
            difficulty="進階",
            parent_id="j1-3-2-equation-main",
            is_branch=True,
            formula_lines=[
                ("唯一解", r"可化為 $x=k$"),
                ("無解", r"可化為矛盾式，如 $0=5$"),
                ("無限多解", r"可化為恆真式，如 $0=0$"),
            ],
            usage=["判斷參數題與方程型態題。"],
            examples=[r"$2(x+1)=2x+5\Rightarrow 2=5$，故無解。"],
            tips=["整理到最後看『是否還有 $x$』最快。"],
            notes=["補足講義進階判斷。"],
            mistakes=["看到 $0=0$ 以為無解。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-2-check-solution",
            title="驗算與合理性檢查",
            chapter_code="j1-3-2",
            chapter_role="易錯陷阱",
            difficulty="基礎",
            parent_id="j1-3-2-equation-main",
            is_branch=True,
            formula_lines=[
                ("驗算", r"將求得的 $x$ 代回原方程左右是否相等"),
                ("合理性", r"情境題需再檢查單位、範圍、正負"),
            ],
            usage=["避免計算正確但情境答案錯誤。"],
            examples=[r"解得 $x=-3$ 仍需看題目是否允許負數。"],
            tips=["最後 10 秒一定做代回檢查。"],
            notes=["強化解題收尾習慣。"],
            mistakes=["算完不檢查直接作答。"],
        )
    )

    # j1-3-3
    rows.append(
        topic_row(
            id_="j1-3-3-word-problem-main",
            title="應用問題建模總流程",
            chapter_code="j1-3-3",
            chapter_role="主角",
            difficulty="基礎",
            formula_lines=[
                ("四步驟", r"設未知數 $\to$ 寫關係式 $\to$ 列方程 $\to$ 驗算"),
                ("檢核", r"答案要符合語意與現實條件"),
            ],
            usage=["所有文字題統一流程。"],
            examples=[r"先設『雞有 $x$ 隻』再把兔數用 $x$ 表示。"],
            tips=["先選最好表達的未知數，不要硬設複雜量。"],
            notes=["對應講義『解題方法』段落。"],
            mistakes=["沒有先設未知數就直接列式。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-3-age-problems",
            title="年齡題建模",
            chapter_code="j1-3-3",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-3-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("固定差", r"兩人年齡差不隨時間改變"),
                ("時間位移", r"$t$ 年後為 $x+t$，$t$ 年前為 $x-t$"),
            ],
            usage=["父子年齡、現在與過去比較題。"],
            examples=[r"父親比兒子大 23 歲，設兒子 $x$ 歲，父親 $x+23$ 歲。"],
            tips=["先抓『差固定』，再套時間前後。"],
            notes=["對應講義父子年齡題。"],
            mistakes=["把年齡差也加上時間。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-3-chicken-rabbit",
            title="雞兔同籠與頭腳關係",
            chapter_code="j1-3-3",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-3-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("頭數", r"$雞+兔=總頭數$"),
                ("腳數", r"$2\times雞+4\times兔=總腳數$"),
            ],
            usage=["動物頭腳、桌椅腳數題。"],
            examples=[r"頭 35、腳 110：設雞 $x$，可列 $2x+4(35-x)=110$。"],
            tips=["先選較容易代換的變數（通常雞或兔都可）。"],
            notes=["對應講義雞兔同籠例題。"],
            mistakes=["兔腳誤用 2 隻。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-3-distance-rate-time",
            title="行程問題（距離、速度、時間）",
            chapter_code="j1-3-3",
            chapter_role="分支題型",
            difficulty="進階",
            parent_id="j1-3-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("基本式", r"$\text{距離}=\text{速度}\times\text{時間}$"),
                ("追及/相遇", r"同向追及用速差，反向相遇用速和"),
            ],
            usage=["鄉村道路、甲乙地相距、追趕問題。"],
            examples=[r"若距離 120 公里，速度 40 公里/時，則時間 3 小時。"],
            tips=["全部先換同一單位再列式。"],
            notes=["對應講義行程應用題。"],
            mistakes=["速度單位不一致仍直接計算。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-3-mixture-ratio",
            title="混合與比例應用",
            chapter_code="j1-3-3",
            chapter_role="分支題型",
            difficulty="進階",
            parent_id="j1-3-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("守恆", r"混合前後的有效成分總量不變"),
                ("比例", r"酒精量 $=$ 溶液體積 $\times$ 酒精濃度"),
            ],
            usage=["酒水混合、濃度配置題。"],
            examples=[r"$\frac{3}{4}x+\frac{1}{6}(14-x)=7$。"],
            tips=["先寫『成分量』再寫總量，不易混亂。"],
            notes=["對應講義混合液題。"],
            mistakes=["直接拿體積相加當成分量。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-3-consecutive-number-app",
            title="連續數應用題",
            chapter_code="j1-3-3",
            chapter_role="分支題型",
            difficulty="中等",
            parent_id="j1-3-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("中間數法", r"連續三數可設為 $x-1,x,x+1$"),
                ("奇偶法", r"連續偶/奇數差固定為 2"),
            ],
            usage=["和差條件、最大最小題。"],
            examples=[r"三個連續偶數和為 78：$(x-2)+x+(x+2)=78$。"],
            tips=["用中間數設未知數，移項最簡潔。"],
            notes=["銜接 j1-3-1 列式技巧。"],
            mistakes=["條件是連續偶數卻寫成差 1。"],
        )
    )
    rows.append(
        topic_row(
            id_="j1-3-3-profit-budget",
            title="金額與收支題",
            chapter_code="j1-3-3",
            chapter_role="典型題型",
            difficulty="中等",
            parent_id="j1-3-3-word-problem-main",
            is_branch=True,
            formula_lines=[
                ("收支關係", r"收入-支出=結餘"),
                ("單價總價", r"$\text{總價}=\text{單價}\times\text{數量}$"),
            ],
            usage=["零用錢、購物、套餐價格題。"],
            examples=[r"設套餐單價 $x$ 元，總金額可列 $3x+2(x+5)=110$。"],
            tips=["先把固定費用與變動費用分開。"],
            notes=["對應講義金額應用題組。"],
            mistakes=["單價與數量對錯對象。"],
        )
    )

    return rows


def build_questions() -> List[Dict]:
    rows = []

    # j1-3-1 (12)
    rows.extend(
        [
            question_row(
                id_="q-j1-3-1-word04-001",
                title="語句列式（基礎01）",
                chapter_code="j1-3-1",
                difficulty="基礎",
                question_text="設哥哥年齡為 $x$，弟弟比哥哥小 3 歲。請用 $x$ 表示弟弟年齡。",
                answer_text="$x-3$",
                explanation_text="『比哥哥小 3』表示從哥哥年齡減 3。",
                topic_id="j1-3-1-symbolize-quantity",
            ),
            question_row(
                id_="q-j1-3-1-word04-002",
                title="總費用列式（基礎02）",
                chapter_code="j1-3-1",
                difficulty="基礎",
                question_text="每人材料費 50 元，班上有 $x$ 人，總費用是多少？",
                answer_text="$50x$",
                explanation_text="單價乘人數。",
                topic_id="j1-3-1-word-to-expression",
            ),
            question_row(
                id_="q-j1-3-1-word04-003",
                title="連續整數（基礎03）",
                chapter_code="j1-3-1",
                difficulty="基礎",
                question_text="設中間整數為 $x$，三個連續整數為何？",
                answer_text="$x-1,\\ x,\\ x+1$",
                explanation_text="連續整數相差 1。",
                topic_id="j1-3-1-consecutive-numbers",
            ),
            question_row(
                id_="q-j1-3-1-word04-004",
                title="連續偶數（基礎04）",
                chapter_code="j1-3-1",
                difficulty="基礎",
                question_text="設最小偶數為 $x$，五個連續偶數可如何表示？",
                answer_text="$x,\\ x+2,\\ x+4,\\ x+6,\\ x+8$",
                explanation_text="連續偶數公差為 2。",
                topic_id="j1-3-1-odd-even-sequences",
            ),
            question_row(
                id_="q-j1-3-1-word04-005",
                title="乘除簡記（中等01）",
                chapter_code="j1-3-1",
                difficulty="中等",
                question_text="將 $a\\times 5\\div 7\\times b$ 化為簡記。",
                answer_text="$\\frac{5ab}{7}$",
                explanation_text="依序改成分數乘法並合併。",
                topic_id="j1-3-1-multiply-divide-notation",
            ),
            question_row(
                id_="q-j1-3-1-word04-006",
                title="除法改寫（中等02）",
                chapter_code="j1-3-1",
                difficulty="中等",
                question_text="將 $x\\div y\\div z$ 改寫成分數形式。",
                answer_text="$\\frac{x}{yz}$",
                explanation_text="$x\\div y\\div z=x\\div (yz)=\\frac{x}{yz}$。",
                topic_id="j1-3-1-multiply-divide-notation",
            ),
            question_row(
                id_="q-j1-3-1-word04-007",
                title="代入求值（中等03）",
                chapter_code="j1-3-1",
                difficulty="中等",
                question_text="若 $x=-3$，求 $-2x+5$ 的值。",
                answer_text="11",
                explanation_text="$-2(-3)+5=6+5=11$。",
                topic_id="j1-3-1-substitution-value",
            ),
            question_row(
                id_="q-j1-3-1-word04-008",
                title="代入求值（中等04）",
                chapter_code="j1-3-1",
                difficulty="中等",
                question_text="若 $a=1,b=2,c=-3$，求 $a-b+c$。",
                answer_text="-4",
                explanation_text="$1-2+(-3)=-4$。",
                topic_id="j1-3-1-substitution-value",
            ),
            question_row(
                id_="q-j1-3-1-word04-009",
                title="語句翻譯（進階01）",
                chapter_code="j1-3-1",
                difficulty="進階",
                question_text="某數的 3 倍減 7 等於 20。若某數設為 $x$，請先寫出對應方程式。",
                answer_text="$3x-7=20$",
                explanation_text="『3 倍減 7』對應 $3x-7$。",
                topic_id="j1-3-1-word-to-expression",
            ),
            question_row(
                id_="q-j1-3-1-word04-010",
                title="連續奇數應用（進階02）",
                chapter_code="j1-3-1",
                difficulty="進階",
                question_text="設中央奇數為 $x$，三個連續奇數和為 75，請列方程式。",
                answer_text="$(x-2)+x+(x+2)=75$",
                explanation_text="奇數步長為 2。",
                topic_id="j1-3-1-odd-even-sequences",
            ),
            question_row(
                id_="q-j1-3-1-word04-011",
                title="中間數法（進階03）",
                chapter_code="j1-3-1",
                difficulty="進階",
                question_text="五個連續整數中最大數是 $z$，請用 $z$ 表示最小數。",
                answer_text="$z-4$",
                explanation_text="五個連續整數相差 4。",
                topic_id="j1-3-1-consecutive-numbers",
            ),
            question_row(
                id_="q-j1-3-1-word04-012",
                title="混合符號整理（進階04）",
                chapter_code="j1-3-1",
                difficulty="進階",
                question_text="化簡：$x\\times 7+2-x\\div \\frac{1}{3}-5$。",
                answer_text="$4x-3$",
                explanation_text="$x\\div\\frac{1}{3}=3x$，故原式 $=7x+2-3x-5=4x-3$。",
                topic_id="j1-3-1-multiply-divide-notation",
            ),
        ]
    )

    # j1-3-2 (12)
    rows.extend(
        [
            question_row(
                id_="q-j1-3-2-word04-013",
                title="移項基礎（基礎01）",
                chapter_code="j1-3-2",
                difficulty="基礎",
                question_text="解方程式：$x-7=12$。",
                answer_text="$x=19$",
                explanation_text="兩邊同加 7。",
                topic_id="j1-3-2-equality-axiom-transpose",
            ),
            question_row(
                id_="q-j1-3-2-word04-014",
                title="移項基礎（基礎02）",
                chapter_code="j1-3-2",
                difficulty="基礎",
                question_text="解方程式：$5x=35$。",
                answer_text="$x=7$",
                explanation_text="兩邊同除以 5。",
                topic_id="j1-3-2-equation-main",
            ),
            question_row(
                id_="q-j1-3-2-word04-015",
                title="同類項整理（中等01）",
                chapter_code="j1-3-2",
                difficulty="中等",
                question_text="解方程式：$5x-3x+2=18$。",
                answer_text="$x=8$",
                explanation_text="$2x+2=18\\Rightarrow 2x=16\\Rightarrow x=8$。",
                topic_id="j1-3-2-combine-like-terms",
            ),
            question_row(
                id_="q-j1-3-2-word04-016",
                title="同類項整理（中等02）",
                chapter_code="j1-3-2",
                difficulty="中等",
                question_text="解方程式：$4x-9=3x+6$。",
                answer_text="$x=15$",
                explanation_text="移項得 $x=15$。",
                topic_id="j1-3-2-equality-axiom-transpose",
            ),
            question_row(
                id_="q-j1-3-2-word04-017",
                title="去括號（中等03）",
                chapter_code="j1-3-2",
                difficulty="中等",
                question_text="解方程式：$3(x-2)-2(x+1)=7$。",
                answer_text="$x=15$",
                explanation_text="$3x-6-2x-2=7\\Rightarrow x-8=7\\Rightarrow x=15$。",
                topic_id="j1-3-2-distributive-remove-brackets",
            ),
            question_row(
                id_="q-j1-3-2-word04-018",
                title="負號括號（中等04）",
                chapter_code="j1-3-2",
                difficulty="中等",
                question_text="解方程式：$-(2x-7)-3(x-1)=4$。",
                answer_text="$x=\\frac{6}{5}$",
                explanation_text="$-2x+7-3x+3=4\\Rightarrow -5x=-6\\Rightarrow x=\\frac{6}{5}$。",
                topic_id="j1-3-2-distributive-remove-brackets",
            ),
            question_row(
                id_="q-j1-3-2-word04-019",
                title="去分母（進階01）",
                chapter_code="j1-3-2",
                difficulty="進階",
                question_text="解方程式：$\\frac{x}{3}+\\frac{x-1}{2}=5$。",
                answer_text="$x=\\frac{33}{5}$",
                explanation_text="同乘 6：$2x+3(x-1)=30\\Rightarrow 5x=33$。",
                topic_id="j1-3-2-clear-denominator",
            ),
            question_row(
                id_="q-j1-3-2-word04-020",
                title="去分母（進階02）",
                chapter_code="j1-3-2",
                difficulty="進階",
                question_text="解方程式：$\\frac{2x+1}{4}-\\frac{x-3}{2}=1$。",
                answer_text="無解",
                explanation_text="同乘 4：$2x+1-2(x-3)=4\\Rightarrow 7=4$，矛盾。",
                topic_id="j1-3-2-clear-denominator",
            ),
            question_row(
                id_="q-j1-3-2-word04-021",
                title="解的型態（基礎03）",
                chapter_code="j1-3-2",
                difficulty="基礎",
                question_text="判斷方程式 $2(x+1)=2x+5$ 的解型態。",
                answer_text="無解",
                explanation_text="化簡得 $2=5$，矛盾。",
                topic_id="j1-3-2-solution-types",
            ),
            question_row(
                id_="q-j1-3-2-word04-022",
                title="解的型態（基礎04）",
                chapter_code="j1-3-2",
                difficulty="基礎",
                question_text="判斷方程式 $3(x-2)=3x-6$ 的解型態。",
                answer_text="無限多解",
                explanation_text="化簡得 $-6=-6$，恆成立。",
                topic_id="j1-3-2-solution-types",
            ),
            question_row(
                id_="q-j1-3-2-word04-023",
                title="驗算（中等05）",
                chapter_code="j1-3-2",
                difficulty="中等",
                question_text="方程式 $2x+3=13$ 的解為何？並驗算。",
                answer_text="$x=5$",
                explanation_text="代回左邊 $2(5)+3=13$，與右邊相等。",
                topic_id="j1-3-2-check-solution",
            ),
            question_row(
                id_="q-j1-3-2-word04-024",
                title="綜合方程（進階03）",
                chapter_code="j1-3-2",
                difficulty="進階",
                question_text="解方程式：$2[3-(x-4)]-(x+1)=9$。",
                answer_text="$x=\\frac{4}{3}$",
                explanation_text="$2(7-x)-x-1=9\\Rightarrow 13-3x=9\\Rightarrow x=\\frac{4}{3}$。",
                topic_id="j1-3-2-distributive-remove-brackets",
            ),
        ]
    )

    # j1-3-3 (12)
    rows.extend(
        [
            question_row(
                id_="q-j1-3-3-word04-025",
                title="建模步驟（基礎01）",
                chapter_code="j1-3-3",
                difficulty="基礎",
                question_text="文字題建模的四步驟為何？",
                answer_text="設未知數、寫關係式、列方程、驗算與檢核",
                explanation_text="先把語句翻成式子，再解與檢查。",
                topic_id="j1-3-3-word-problem-main",
            ),
            question_row(
                id_="q-j1-3-3-word04-026",
                title="雞兔同籠（基礎02）",
                chapter_code="j1-3-3",
                difficulty="基礎",
                question_text="雞兔同籠，頭共 35、腳共 110。設雞有 $x$ 隻，列出方程式。",
                answer_text="$2x+4(35-x)=110$",
                explanation_text="兔有 $35-x$ 隻，每隻 4 腳。",
                topic_id="j1-3-3-chicken-rabbit",
            ),
            question_row(
                id_="q-j1-3-3-word04-027",
                title="雞兔同籠求解（中等01）",
                chapter_code="j1-3-3",
                difficulty="中等",
                question_text="承上題，求雞與兔各幾隻。",
                answer_text="雞 15 隻，兔 20 隻",
                explanation_text="$2x+140-4x=110\\Rightarrow x=15$。",
                topic_id="j1-3-3-chicken-rabbit",
            ),
            question_row(
                id_="q-j1-3-3-word04-028",
                title="年齡題（中等02）",
                chapter_code="j1-3-3",
                difficulty="中等",
                question_text="父親比兒子大 23 歲，且 3 年後父親年齡是兒子的 2 倍少 3。求兒子現年。",
                answer_text="23 歲",
                explanation_text="設兒子 $x$ 歲：$x+23+3=2(x+3)-3$，解得 $x=23$。",
                topic_id="j1-3-3-age-problems",
            ),
            question_row(
                id_="q-j1-3-3-word04-029",
                title="行程題（中等03）",
                chapter_code="j1-3-3",
                difficulty="中等",
                question_text="某車速每小時 40 公里，行駛 3 小時，距離為多少？",
                answer_text="120 公里",
                explanation_text="$d=vt=40\\times 3=120$。",
                topic_id="j1-3-3-distance-rate-time",
            ),
            question_row(
                id_="q-j1-3-3-word04-030",
                title="行程差速（進階01）",
                chapter_code="j1-3-3",
                difficulty="進階",
                question_text="甲速 60、乙速 45（公里/時），同向而行 4 小時後相差幾公里？",
                answer_text="60 公里",
                explanation_text="速差 $15$，距離差 $15\\times 4=60$。",
                topic_id="j1-3-3-distance-rate-time",
            ),
            question_row(
                id_="q-j1-3-3-word04-031",
                title="混合液列式（進階02）",
                chapter_code="j1-3-3",
                difficulty="進階",
                question_text="甲液酒精占 $\\frac{3}{4}$，乙液酒精占 $\\frac{1}{6}$，混成 14 公升半酒精溶液。設甲取 $x$ 公升，列方程式。",
                answer_text="$\\frac{3}{4}x+\\frac{1}{6}(14-x)=7$",
                explanation_text="半酒精表示酒精量 7 公升。",
                topic_id="j1-3-3-mixture-ratio",
            ),
            question_row(
                id_="q-j1-3-3-word04-032",
                title="混合液求解（進階03）",
                chapter_code="j1-3-3",
                difficulty="進階",
                question_text="承上題，求甲、乙各取幾公升。",
                answer_text="甲 8 公升，乙 6 公升",
                explanation_text="解得 $x=8$，乙為 $14-x=6$。",
                topic_id="j1-3-3-mixture-ratio",
            ),
            question_row(
                id_="q-j1-3-3-word04-033",
                title="連續偶數應用（基礎03）",
                chapter_code="j1-3-3",
                difficulty="基礎",
                question_text="三個連續偶數和為 78，求這三個偶數。",
                answer_text="24、26、28",
                explanation_text="設中間為 $x$，$(x-2)+x+(x+2)=78$，得 $x=26$。",
                topic_id="j1-3-3-consecutive-number-app",
            ),
            question_row(
                id_="q-j1-3-3-word04-034",
                title="連續奇數應用（中等04）",
                chapter_code="j1-3-3",
                difficulty="中等",
                question_text="五個連續奇數的中間數是 17，求最大數與最小數。",
                answer_text="最大 21，最小 13",
                explanation_text="五個數為 $13,15,17,19,21$。",
                topic_id="j1-3-3-consecutive-number-app",
            ),
            question_row(
                id_="q-j1-3-3-word04-035",
                title="收支題（中等05）",
                chapter_code="j1-3-3",
                difficulty="中等",
                question_text="一份套餐 $x$ 元，買 3 份再加買 2 份每份多 5 元，共 110 元。列方程式並求 $x$。",
                answer_text="$3x+2(x+5)=110,\\ x=20$",
                explanation_text="$5x+10=110\\Rightarrow x=20$。",
                topic_id="j1-3-3-profit-budget",
            ),
            question_row(
                id_="q-j1-3-3-word04-036",
                title="範圍檢核（進階04）",
                chapter_code="j1-3-3",
                difficulty="進階",
                question_text="某題解得人數 $x=-4$，是否可作為答案？",
                answer_text="不可",
                explanation_text="人數不可為負，需回頭檢查列式或題意。",
                topic_id="j1-3-3-word-problem-main",
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
