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
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三上2_相似三角形_整理\改國三上2_相似三角形_易讀版.md"
)
SOURCE_REF = f"{Path(SOURCE_MD).name}（重點整理匯入）"

CHAPTER_CODE = "j5-1-3"
CHAPTER_NAME = "相似三角形"

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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j5-1-3-{ts}{path.suffix}"
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
        "tags": ["word匯入", "教學核心", CHAPTER_CODE, CHAPTER_NAME, "相似"],
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
            id_="j5-1-3-sim-language",
            title="相似語言：角相等、邊成比例",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("相似記號", r"$\triangle ABC\sim\triangle DEF$"),
                ("對應規則", r"$\angle A=\angle D,\ \frac{AB}{DE}=\frac{BC}{EF}=\frac{CA}{FD}$"),
            ],
            usage=["辨識相似題目與對應順序。", "建立後續比例計算基礎。"],
            examples=[r"$\triangle ABC\sim\triangle DEF$ 時，$AB$ 對應 $DE$。"],
            tips=["先排頂點順序再列比例。"],
            notes=["配對順序錯，後面全錯。"],
            mistakes=["把對應邊順序寫反。"],
        ),
        topic_row(
            id_="j5-1-3-criteria-overview",
            title="相似判別總表：AA、SSS、SAS",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("AA", r"$\text{兩角相等}\Rightarrow \text{相似}$"),
                ("SSS", r"$\frac{a_1}{a_2}=\frac{b_1}{b_2}=\frac{c_1}{c_2}\Rightarrow \text{相似}$"),
                ("SAS", r"$\frac{a_1}{a_2}=\frac{b_1}{b_2},\ \angle \text{夾角相等}\Rightarrow \text{相似}$"),
            ],
            usage=["先決定用哪個判別最快。", "避免亂套判別。"],
            examples=["有兩角資料先看 AA；有三邊先看 SSS。"],
            tips=["條件最少優先，通常 AA 最快。"],
            notes=["SAS 一定要是夾角。"],
            mistakes=["把非夾角誤當 SAS。"],
        ),
        topic_row(
            id_="j5-1-3-aa-criterion",
            title="AA 相似：兩角相等就夠",
            chapter_role="公式與性質",
            difficulty="基礎",
            formula_lines=[("AA", r"$\angle A=\angle D,\ \angle B=\angle E\Rightarrow \triangle ABC\sim\triangle DEF$")],
            usage=["角度題與平行線題常見。", "快速判別相似。"],
            examples=[r"同位角、內錯角常提供 AA 條件。"],
            tips=["找到兩角後第三角自然相等。"],
            notes=["最常用相似判別。"],
            mistakes=["只看到一角相等就下結論。"],
        ),
        topic_row(
            id_="j5-1-3-sss-criterion",
            title="SSS 相似：三組邊成比例",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[("SSS", r"$\frac{AB}{DE}=\frac{BC}{EF}=\frac{CA}{FD}\Rightarrow \triangle ABC\sim\triangle DEF$")],
            usage=["邊長資料完整時判別。", "比例化簡題。"],
            examples=[r"$3:6,\ 4:8,\ 5:10$ 可判相似。"],
            tips=["三個比值最好都化到同一倍數。"],
            notes=["要比的是對應邊，不是任意邊。"],
            mistakes=["只驗兩組邊比就當 SSS。"],
        ),
        topic_row(
            id_="j5-1-3-sas-criterion",
            title="SAS 相似：夾角相等、夾邊成比例",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[("SAS", r"$\frac{AB}{DE}=\frac{AC}{DF},\ \angle A=\angle D\Rightarrow \triangle ABC\sim\triangle DEF$")],
            usage=["兩邊一角型題目。", "缺少第三邊時判別。"],
            examples=[r"$\frac{AB}{DE}=\frac{AC}{DF}=2,\ \angle A=\angle D$ 可判相似。"],
            tips=["確認角在兩條已比邊之間。"],
            notes=["SAS 最常錯在角位置。"],
            mistakes=["拿非夾角硬套 SAS。"],
        ),
        topic_row(
            id_="j5-1-3-parallel-de-bc",
            title="平行線造成相似：DE 平行 BC",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("相似結論", r"$DE\parallel BC\Rightarrow \triangle ADE\sim\triangle ABC$"),
                ("比例延伸", r"$\frac{AD}{AB}=\frac{AE}{AC}=\frac{DE}{BC}$"),
            ],
            usage=["三角形內平行線分割題。", "求未知邊長常用。"],
            examples=[r"若 $AD:AB=2:5$，則 $DE:BC=2:5$。"],
            tips=["先畫出對應角，再列比例。"],
            notes=["此模型在段考非常高頻。"],
            mistakes=["把小三角形與大三角形頂點順序配錯。"],
        ),
        topic_row(
            id_="j5-1-3-basic-computation",
            title="相似計算基本題：判斷後再跨乘",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("比例方程", r"$\frac{x}{a}=\frac{b}{c}$"),
                ("解法", r"$x=\frac{ab}{c}$"),
            ],
            usage=["相似後求未知邊。", "一元比例方程。"],
            examples=[r"$\frac{x}{6}=\frac{5}{3}\Rightarrow x=10$。"],
            tips=["先判斷相似再算，別先亂列比例。"],
            notes=["解完要代回比例檢查。"],
            mistakes=["跨乘算錯或比例列錯。"],
        ),
        topic_row(
            id_="j5-1-3-indirect-measurement",
            title="間接測量：湖泊距離與樹高",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("測量模型", r"$\text{利用相似三角形把不可達距離轉為可量距離}$"),
                ("核心比例", r"$\frac{\text{未知}}{\text{已知}}=\frac{\text{已知}}{\text{已知}}$"),
            ],
            usage=["實測應用題。", "無法直接量測時的幾何轉換。"],
            examples=["影子法測樹高、岸邊法測河寬。"],
            tips=["先畫示意圖，標清可量與不可量。"],
            notes=["比例建立比算術更重要。"],
            mistakes=["把不同情境下的高度與長度錯配。"],
        ),
        topic_row(
            id_="j5-1-3-trapezoid-parallel-segment",
            title="梯形中的平行線段長",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("平行基底", r"$AB\parallel CD$"),
                ("中位線", r"$MN=\frac{AB+CD}{2}\ (\text{當 }M,N\text{ 為兩腰中點})$"),
            ],
            usage=["梯形長度與比例計算。", "平行段長問題。"],
            examples=[r"若上底 8、下底 14，梯形中位線長 11。"],
            tips=["先辨識是否中點條件成立。"],
            notes=["梯形常透過相似三角形建立比例。"],
            mistakes=["把中位線公式用到非中點情況。"],
        ),
        topic_row(
            id_="j5-1-3-self-similarity",
            title="共角加等角：三角形內自我相似",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("自我相似", r"$\text{同圖中兩三角形可由共角與等角判 AA 相似}$"),
                ("策略", r"$\text{先找共角，再找平行或外角補充第二角}$"),
            ],
            usage=["複合幾何圖形。", "多段比例連鎖推理。"],
            examples=["一個三角形中畫高、角平分線後常出現自我相似。"],
            tips=["先框出候選兩三角形，再檢查兩角。"],
            notes=["相似常不只一對，需選最有用的一對。"],
            mistakes=["誤把看起來像的三角形當相似。"],
        ),
        topic_row(
            id_="j5-1-3-corresponding-elements",
            title="相似三角形的對應高、周長、角平分線、中線",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("線性量", r"$\frac{h_1}{h_2}=\frac{m_1}{m_2}=\frac{t_1}{t_2}=k$"),
                ("周長比", r"$\frac{P_1}{P_2}=k$"),
            ],
            usage=["非邊長量的比例題。", "綜合題快速換算。"],
            examples=[r"相似比 $k=2$ 時，高比、中線比、角平分線比、周長比都為 2。"],
            tips=["先判斷是線性量還是面積量。"],
            notes=["本章常見觀念整合點。"],
            mistakes=["把線性量與面積量混用。"],
        ),
        topic_row(
            id_="j5-1-3-area-ratio-square",
            title="相似面積比：邊長比要平方",
            chapter_role="教學核心",
            difficulty="基礎",
            formula_lines=[
                ("面積比", r"$\frac{S_1}{S_2}=k^2$"),
                ("反推", r"$k=\sqrt{\frac{S_1}{S_2}}$"),
            ],
            usage=["面積比例與相似比轉換。", "應用題反推邊長比。"],
            examples=[r"若面積比 $9:16$，則邊長比 $3:4$。"],
            tips=["面積比一定要開根號才回到邊長比。"],
            notes=["這是高失分率重點。"],
            mistakes=["把面積比直接當邊長比。"],
        ),
        topic_row(
            id_="j5-1-3-parallel-height-base-ratio",
            title="平行截線中的高與底比例",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("同角相似", r"$\text{平行截線常形成一組相似三角形}$"),
                ("比例連動", r"$\frac{\text{高}_1}{\text{高}_2}=\frac{\text{底}_1}{\text{底}_2}$"),
            ],
            usage=["平行線與高度變化題。", "比例連動求長。"],
            examples=["高度改變可透過相似比推回底邊比例。"],
            tips=["先確認兩三角形夾角相同。"],
            notes=["可與面積比聯動。"],
            mistakes=["忽略三角形是否同角就直接比高。"],
        ),
        topic_row(
            id_="j5-1-3-right-altitude-similarity",
            title="直角三角形斜邊高：三個三角形都相似",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("相似鏈", r"$\triangle ABC\sim\triangle ACD\sim\triangle CBD$"),
                ("條件", r"$\angle C=90^\circ,\ CD\perp AB$"),
            ],
            usage=["直角三角形高分割題。", "乘積公式前置觀念。"],
            examples=[r"由三角形兩兩相似可推多組比例。"],
            tips=["先寫三角形名稱與對應角再列式。"],
            notes=["本主題是壓軸題常見核心。"],
            mistakes=["三個三角形對應順序混亂。"],
        ),
        topic_row(
            id_="j5-1-3-altitude-product-formulas",
            title="斜邊高三個乘積公式",
            chapter_role="公式與性質",
            difficulty="進階",
            formula_lines=[
                ("公式1", r"$CD^2=AD\cdot DB$"),
                ("公式2", r"$AC^2=AB\cdot AD$"),
                ("公式3", r"$BC^2=AB\cdot DB$"),
            ],
            usage=["快速計算斜邊高與股長。", "避免重複列相似比例。"],
            examples=[r"已知 $AD,DB$ 可直接得 $CD$。"],
            tips=["先確認圖形是斜邊上的高模型。"],
            notes=["公式背後來自相似三角形。"],
            mistakes=["把公式用到非直角三角形。"],
        ),
        topic_row(
            id_="j5-1-3-right-altitude-calculation",
            title="直角三角形斜邊高計算",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("計算策略", r"$\text{先判可用哪一個乘積公式，再代入}$"),
                ("檢查", r"$AD+DB=AB$"),
            ],
            usage=["混合已知量求未知。", "段考計算題高頻。"],
            examples=[r"若 $AD=4,DB=9$，則 $CD=\sqrt{36}=6$。"],
            tips=["算完檢查大小：高通常小於兩股。"],
            notes=["可與畢氏定理互相驗算。"],
            mistakes=["把斜邊兩段相加關係忘記。"],
        ),
        topic_row(
            id_="j5-1-3-shadow-projection",
            title="影子與投影測量",
            chapter_role="典型題型",
            difficulty="進階",
            formula_lines=[
                ("日照模型", r"$\frac{\text{物高}_1}{\text{影長}_1}=\frac{\text{物高}_2}{\text{影長}_2}$"),
                ("前提", r"$\text{同一時刻光線平行}$"),
            ],
            usage=["生活情境測高題。", "間接測量應用。"],
            examples=[r"已知竿高與影長可推建物高度。"],
            tips=["先確認同一時刻、同一地面條件。"],
            notes=["本質仍是 AA 相似。"],
            mistakes=["不同時刻影子資料混用。"],
        ),
        topic_row(
            id_="j5-1-3-river-island-measurement",
            title="河寬與海島測量：兩次標尺法",
            chapter_role="易錯陷阱",
            difficulty="進階",
            formula_lines=[
                ("兩次觀測", r"$\text{建立兩組相似三角形後聯立比例}$"),
                ("核心", r"$\text{可量距離} \leftrightarrow \text{不可達距離}$"),
            ],
            usage=["河寬、海島高度與距離估測。", "古典測量題。"],
            examples=["劉徽海島算經題型：兩次立竿觀測推目標高度。"],
            tips=["每次觀測先獨立列比例，再合併方程。"],
            notes=["圖一定要畫，否則容易配錯。"],
            mistakes=["兩次觀測的對應邊混在同一比例。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j5-1-3-sim-001",
            title="相似語言（基礎01）",
            difficulty="基礎",
            question_text=r"若 $\triangle ABC\sim\triangle DEF$，請寫出一組對應角與一組對應邊。",
            answer_text=r"例如：$\angle A=\angle D,\ AB\leftrightarrow DE$。",
            explanation_text="相似記號的頂點順序直接決定對應關係。",
            topic_id="j5-1-3-sim-language",
        ),
        question_row(
            id_="q-j5-1-3-sim-002",
            title="相似語言（基礎02）",
            difficulty="基礎",
            question_text=r"若 $\triangle ABC\sim\triangle DEF$ 且 $AB=6,DE=9$，相似比 $k=\frac{AB}{DE}$ 為何？",
            answer_text=r"$\frac{2}{3}$。",
            explanation_text=r"$k=\frac{AB}{DE}=\frac{6}{9}=\frac{2}{3}$。",
            topic_id="j5-1-3-sim-language",
        ),
        question_row(
            id_="q-j5-1-3-sim-003",
            title="判別總表（基礎01）",
            difficulty="基礎",
            question_text="三角形相似的三種常用判別是哪些？",
            answer_text="AA、SSS、SAS。",
            explanation_text="國中相似判別核心就是這三種。",
            topic_id="j5-1-3-criteria-overview",
        ),
        question_row(
            id_="q-j5-1-3-sim-004",
            title="判別總表（基礎02）",
            difficulty="基礎",
            question_text="若只知道兩邊成比例但夾角未知，可直接用 SAS 判相似嗎？",
            answer_text="不行。",
            explanation_text="SAS 需要夾角相等。",
            topic_id="j5-1-3-criteria-overview",
        ),
        question_row(
            id_="q-j5-1-3-sim-005",
            title="AA 判別（基礎01）",
            difficulty="基礎",
            question_text=r"若兩三角形有兩組角分別相等，可判斷什麼？",
            answer_text="兩三角形相似。",
            explanation_text="AA 判別：兩角相等即足夠。",
            topic_id="j5-1-3-aa-criterion",
        ),
        question_row(
            id_="q-j5-1-3-sim-006",
            title="AA 判別（基礎02）",
            difficulty="基礎",
            question_text=r"在平行線模型中，若得一組內錯角相等再加一組同位角相等，可用哪種判別？",
            answer_text="AA。",
            explanation_text="已具備兩角相等條件。",
            topic_id="j5-1-3-aa-criterion",
        ),
        question_row(
            id_="q-j5-1-3-sim-007",
            title="SSS 判別（中等01）",
            difficulty="中等",
            question_text=r"兩三角形邊長分別為 $(3,4,5)$ 與 $(6,8,10)$，是否相似？",
            answer_text="是。",
            explanation_text=r"三組邊比都為 $1:2$，符合 SSS。",
            topic_id="j5-1-3-sss-criterion",
        ),
        question_row(
            id_="q-j5-1-3-sim-008",
            title="SSS 判別（中等02）",
            difficulty="中等",
            question_text=r"邊長 $(4,6,9)$ 與 $(8,12,16)$ 是否相似？",
            answer_text="否。",
            explanation_text=r"$4:8=6:12=1:2$，但 $9:16\neq 1:2$，不符合 SSS。",
            topic_id="j5-1-3-sss-criterion",
        ),
        question_row(
            id_="q-j5-1-3-sim-009",
            title="SAS 判別（中等01）",
            difficulty="中等",
            question_text=r"若 $\frac{AB}{DE}=\frac{AC}{DF}=2$ 且 $\angle A=\angle D$，能判相似嗎？",
            answer_text="能。",
            explanation_text="兩夾邊成比例且夾角相等，符合 SAS。",
            topic_id="j5-1-3-sas-criterion",
        ),
        question_row(
            id_="q-j5-1-3-sim-010",
            title="SAS 判別（中等02）",
            difficulty="中等",
            question_text="SAS 的角一定要是什麼位置的角？",
            answer_text="被拿來比較那兩邊的夾角。",
            explanation_text="若不是夾角就不能用 SAS。",
            topic_id="j5-1-3-sas-criterion",
        ),
        question_row(
            id_="q-j5-1-3-sim-011",
            title="平行線相似（基礎01）",
            difficulty="基礎",
            question_text=r"在 $\triangle ABC$ 中，若 $DE\parallel BC$，可得哪兩個三角形相似？",
            answer_text=r"$\triangle ADE\sim\triangle ABC$。",
            explanation_text="由平行可得對應角相等，套 AA。",
            topic_id="j5-1-3-parallel-de-bc",
        ),
        question_row(
            id_="q-j5-1-3-sim-012",
            title="平行線相似（基礎02）",
            difficulty="基礎",
            question_text=r"若 $AD:AB=3:5$，則 $DE:BC$ 為何？",
            answer_text=r"$3:5$。",
            explanation_text=r"由 $\triangle ADE\sim\triangle ABC$，對應邊比相同。",
            topic_id="j5-1-3-parallel-de-bc",
        ),
        question_row(
            id_="q-j5-1-3-sim-013",
            title="相似計算（中等01）",
            difficulty="中等",
            question_text=r"若 $\frac{x}{12}=\frac{5}{3}$，求 $x$。",
            answer_text="20。",
            explanation_text=r"$x=12\times\frac{5}{3}=20$。",
            topic_id="j5-1-3-basic-computation",
        ),
        question_row(
            id_="q-j5-1-3-sim-014",
            title="相似計算（中等02）",
            difficulty="中等",
            question_text="相似計算前最重要的步驟是什麼？",
            answer_text="先判斷相似並確認對應邊。",
            explanation_text="若對應錯，再正確運算也會得到錯答案。",
            topic_id="j5-1-3-basic-computation",
        ),
        question_row(
            id_="q-j5-1-3-sim-015",
            title="間接測量（中等01）",
            difficulty="中等",
            question_text="為何湖泊距離、樹高可用相似三角形間接測量？",
            answer_text="因為可構造同角模型，使不可量距離與可量距離成比例。",
            explanation_text="核心是把實際情境轉成兩個相似三角形。",
            topic_id="j5-1-3-indirect-measurement",
        ),
        question_row(
            id_="q-j5-1-3-sim-016",
            title="間接測量（中等02）",
            difficulty="中等",
            question_text=r"若小模型高與底為 $2,5$，大模型底為 $20$，求大模型高。",
            answer_text="8。",
            explanation_text=r"由相似比 $\frac{2}{5}=\frac{H}{20}$，得 $H=8$。",
            topic_id="j5-1-3-indirect-measurement",
        ),
        question_row(
            id_="q-j5-1-3-sim-017",
            title="梯形中位線（中等01）",
            difficulty="中等",
            question_text=r"梯形上、下底為 $10,18$，中位線長為何？",
            answer_text="14。",
            explanation_text=r"$MN=\frac{10+18}{2}=14$。",
            topic_id="j5-1-3-trapezoid-parallel-segment",
        ),
        question_row(
            id_="q-j5-1-3-sim-018",
            title="梯形判斷（中等02）",
            difficulty="中等",
            question_text="使用梯形平行線段公式前，最先要確認什麼？",
            answer_text="兩端點是否為兩腰中點（若用中位線公式）。",
            explanation_text="條件不滿足時不能直接套公式。",
            topic_id="j5-1-3-trapezoid-parallel-segment",
        ),
        question_row(
            id_="q-j5-1-3-sim-019",
            title="自我相似（進階01）",
            difficulty="進階",
            question_text="三角形內出現共角與另一組等角時，通常可做什麼判斷？",
            answer_text="可用 AA 判斷內部兩三角形相似。",
            explanation_text="共角＋等角正好湊齊 AA 條件。",
            topic_id="j5-1-3-self-similarity",
        ),
        question_row(
            id_="q-j5-1-3-sim-020",
            title="自我相似（進階02）",
            difficulty="進階",
            question_text="自我相似題第一步最穩定操作是什麼？",
            answer_text="先框出候選三角形並標記兩角對應。",
            explanation_text="先建立對應可避免後續比例列錯。",
            topic_id="j5-1-3-self-similarity",
        ),
        question_row(
            id_="q-j5-1-3-sim-021",
            title="對應線性量（中等01）",
            difficulty="中等",
            question_text=r"若相似比 $k=3$，則對應高比與周長比各為多少？",
            answer_text="都為 3。",
            explanation_text="高與周長皆屬線性量，比例同為 $k$。",
            topic_id="j5-1-3-corresponding-elements",
        ),
        question_row(
            id_="q-j5-1-3-sim-022",
            title="對應線性量（中等02）",
            difficulty="中等",
            question_text="相似三角形的中線比、角平分線比與邊長比關係為何？",
            answer_text="都等於相似比。",
            explanation_text="這些都屬於線性尺度。",
            topic_id="j5-1-3-corresponding-elements",
        ),
        question_row(
            id_="q-j5-1-3-sim-023",
            title="面積比平方（基礎01）",
            difficulty="基礎",
            question_text=r"若邊長比為 $2:5$，面積比為何？",
            answer_text=r"$4:25$。",
            explanation_text="面積比為邊長比平方。",
            topic_id="j5-1-3-area-ratio-square",
        ),
        question_row(
            id_="q-j5-1-3-sim-024",
            title="面積比反推（基礎02）",
            difficulty="基礎",
            question_text=r"若面積比為 $49:81$，邊長比為何？",
            answer_text=r"$7:9$。",
            explanation_text="邊長比是面積比開根號。",
            topic_id="j5-1-3-area-ratio-square",
        ),
        question_row(
            id_="q-j5-1-3-sim-025",
            title="高底比例（中等01）",
            difficulty="中等",
            question_text="平行截線形成相似三角形時，高比與底比關係為何？",
            answer_text="相等。",
            explanation_text="同一組相似比下，所有線性量同比例。",            
            topic_id="j5-1-3-parallel-height-base-ratio",
        ),
        question_row(
            id_="q-j5-1-3-sim-026",
            title="高底比例（中等02）",
            difficulty="中等",
            question_text=r"若兩相似三角形底比為 $3:4$，則對應高比為何？",
            answer_text=r"$3:4$。",
            explanation_text="高屬線性量，比例與底邊一致。",
            topic_id="j5-1-3-parallel-height-base-ratio",
        ),
        question_row(
            id_="q-j5-1-3-sim-027",
            title="斜邊高相似鏈（中等01）",
            difficulty="中等",
            question_text=r"直角三角形斜邊上作高後，會得到幾個彼此相似的三角形？",
            answer_text="3 個。",
            explanation_text=r"原三角形與分割出的兩個小三角形兩兩相似。",
            topic_id="j5-1-3-right-altitude-similarity",
        ),
        question_row(
            id_="q-j5-1-3-sim-028",
            title="斜邊高相似鏈（中等02）",
            difficulty="中等",
            question_text="斜邊高模型使用前的必要條件是什麼？",
            answer_text="原三角形必須是直角三角形，且高落在斜邊上。",
            explanation_text="這是三相似鏈成立的幾何前提。",
            topic_id="j5-1-3-right-altitude-similarity",
        ),
        question_row(
            id_="q-j5-1-3-sim-029",
            title="乘積公式（進階01）",
            difficulty="進階",
            question_text=r"若斜邊兩段為 $4,9$，求高 $CD$。",
            answer_text="6。",
            explanation_text=r"$CD^2=AD\cdot DB=4\cdot 9=36$，故 $CD=6$。",
            topic_id="j5-1-3-altitude-product-formulas",
        ),
        question_row(
            id_="q-j5-1-3-sim-030",
            title="乘積公式（進階02）",
            difficulty="進階",
            question_text=r"在斜邊高模型中，若 $AB=25,AD=9$，求 $AC$。",
            answer_text="15。",
            explanation_text=r"$AC^2=AB\cdot AD=25\cdot 9=225$，故 $AC=15$。",
            topic_id="j5-1-3-altitude-product-formulas",
        ),
        question_row(
            id_="q-j5-1-3-sim-031",
            title="斜邊高計算（進階01）",
            difficulty="進階",
            question_text=r"若 $AD=16,DB=9$，求 $AB$ 與 $CD$。",
            answer_text=r"$AB=25,\ CD=12$。",
            explanation_text=r"$AB=AD+DB=25$，且 $CD^2=16\cdot 9=144$，故 $CD=12$。",
            topic_id="j5-1-3-right-altitude-calculation",
        ),
        question_row(
            id_="q-j5-1-3-sim-032",
            title="斜邊高計算（進階02）",
            difficulty="進階",
            question_text="斜邊高題算完後，常用哪個關係做快速檢查？",
            answer_text=r"$AD+DB=AB$。",
            explanation_text="斜邊兩段加總必為整條斜邊。",
            topic_id="j5-1-3-right-altitude-calculation",
        ),
        question_row(
            id_="q-j5-1-3-sim-033",
            title="影子測量（進階01）",
            difficulty="進階",
            question_text=r"同時刻某竿高 $1.5$ m、影長 $2$ m；建物影長 $10$ m，建物高多少？",
            answer_text="7.5 m。",
            explanation_text=r"由相似比 $\frac{1.5}{2}=\frac{H}{10}$，得 $H=7.5$。",
            topic_id="j5-1-3-shadow-projection",
        ),
        question_row(
            id_="q-j5-1-3-sim-034",
            title="影子測量（進階02）",
            difficulty="進階",
            question_text="影子測量題最關鍵前提是什麼？",
            answer_text="光線方向一致（可視為平行）。",
            explanation_text="平行光線可保證角度對應，形成相似。",
            topic_id="j5-1-3-shadow-projection",
        ),
        question_row(
            id_="q-j5-1-3-sim-035",
            title="河寬海島測量（進階01）",
            difficulty="進階",
            question_text="兩次標尺測量題建議的解題順序是什麼？",
            answer_text="先分別列兩組相似比例，再聯立求未知。",
            explanation_text="分次建模可避免把不同觀測資料混在一起。",
            topic_id="j5-1-3-river-island-measurement",
        ),
        question_row(
            id_="q-j5-1-3-sim-036",
            title="河寬海島測量（進階02）",
            difficulty="進階",
            question_text="河寬與海島測量題最常見錯誤是什麼？",
            answer_text="兩次觀測的對應邊配對錯誤。",
            explanation_text="觀測場景不同，比例式必須分開建立。",
            topic_id="j5-1-3-river-island-measurement",
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
