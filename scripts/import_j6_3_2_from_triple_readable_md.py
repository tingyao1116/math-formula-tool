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
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三下3_統計二_整理\改國三下3_統計二_易讀版.md"
)
SOURCE_MD_2 = (
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三下4_統計三_整理\改國三下4_統計三_易讀版.md"
)
SOURCE_MD_3 = (
    r"C:\Users\user\OneDrive\文件\張快自製講義\codex白話講義\國中數學華興完整版+MD資料夾\改國三下5_統計四_整理\改國三下5_統計四_易讀版.md"
)
SOURCE_REF = (
    f"{Path(SOURCE_MD_1).name} + {Path(SOURCE_MD_2).name} + "
    f"{Path(SOURCE_MD_3).name}（重點整理匯入）"
)

CHAPTER_CODE = "j6-3-2"
CHAPTER_NAME = "統計（二）"

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
    backup_path = BACKUP_DIR / f"{path.stem}.pre-j6-3-2-{ts}{path.suffix}"
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
        "term": "國三下",
        "chapter": CHAPTER_NAME,
        "chapterCode": CHAPTER_CODE,
        "domain": "資料與不確定性",
        "difficulty": difficulty,
        "chapterRole": chapter_role,
        "parentId": "",
        "tags": ["word匯入", "教學核心", CHAPTER_CODE, CHAPTER_NAME, "統計"],
        "usage": usage,
        "examples": examples,
        "tips": tips,
        "notes": notes + [f"來源：{SOURCE_REF}"],
        "mistakes": mistakes,
        "contentTypes": ["教學核心", "重點公式", "題型策略", "易錯提醒"],
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
            id_="j6-3-2-grouped-frequency-table",
            title="組距、組界與次數分配表",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("組距", r"$\text{組距}= \text{上限}-\text{下限}$"),
                ("總次數", r"$N=\sum f_i$"),
            ],
            usage=["資料很多時先分組，提升閱讀與比較效率。"],
            examples=["分數 0 到 100 可用組距 10 分組。"],
            tips=["先決定組距，再統一組界格式，避免重疊。"],
            notes=["分組後可配合圖表做趨勢判讀。"],
            mistakes=["各組寬度不一致卻直接比較高度。"],
        ),
        topic_row(
            id_="j6-3-2-cumulative-frequency",
            title="累積次數與累積相對次數",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("累積次數", r"$F_k=\sum_{i=1}^{k} f_i$"),
                ("累積相對次數", r"$\frac{F_k}{N}$"),
            ],
            usage=["找中位數位置、判斷某門檻以下人數。"],
            examples=["累積次數達到 $N/2$ 的位置可定位中位數。"],
            tips=["累積表最後一列必須等於總樣本數。"],
            notes=["累積資訊常見於統計三與統計四題型。"],
            mistakes=["把單組次數誤當累積次數。"],
        ),
        topic_row(
            id_="j6-3-2-histogram-and-shape",
            title="直方圖判讀與分布形狀",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("面積觀念", r"$\text{組寬相同時，高度}\propto \text{次數}$"),
                ("偏態", r"$\text{左偏 / 右偏}$"),
            ],
            usage=["從圖快速判讀資料集中區與離散情況。"],
            examples=["右側尾巴較長時通常是右偏分布。"],
            tips=["先看最高柱，再看尾巴方向。"],
            notes=["直方圖相鄰長條不留空隙。"],
            mistakes=["把直方圖當長條圖解讀。"],
        ),
        topic_row(
            id_="j6-3-2-quartiles-and-boxplot",
            title="四分位數與盒狀圖",
            chapter_role="核心概念",
            difficulty="中等",
            formula_lines=[
                ("四分位數", r"$Q_1,\ Q_2,\ Q_3$"),
                ("四分位距", r"$IQR=Q_3-Q_1$"),
            ],
            usage=["比較兩組資料的集中與離散程度。"],
            examples=["盒長越大通常表示中段資料越分散。"],
            tips=["盒狀圖要先抓五數摘要：最小、$Q_1$、中位、$Q_3$、最大。"],
            notes=["$Q_2$ 就是中位數。"],
            mistakes=["把盒子的中線誤認成平均數。"],
        ),
        topic_row(
            id_="j6-3-2-outlier-rule",
            title="離群值判斷（1.5IQR 規則）",
            chapter_role="進階題型",
            difficulty="進階",
            formula_lines=[
                ("下界", r"$Q_1-1.5IQR$"),
                ("上界", r"$Q_3+1.5IQR$"),
            ],
            usage=["判斷是否存在極端資料點。"],
            examples=["超出界線的值可標記為疑似離群值。"],
            tips=["先算 $IQR$，再算上下界。"],
            notes=["離群值不一定要刪除，需看情境。"],
            mistakes=["把最大值直接當離群值而不計算界線。"],
        ),
        topic_row(
            id_="j6-3-2-mean-median-robustness",
            title="平均數與中位數的抗極端值比較",
            chapter_role="公式與性質",
            difficulty="中等",
            formula_lines=[
                ("平均數", r"$\bar{x}$"),
                ("中位數", r"$Q_2$"),
            ],
            usage=["資料有極端值時選擇較合適代表值。"],
            examples=["薪資資料常用中位數描述典型狀況。"],
            tips=["看到極端值先檢查平均與中位是否差很大。"],
            notes=["平均數對極端值較敏感。"],
            mistakes=["任何情況都只報平均數。"],
        ),
        topic_row(
            id_="j6-3-2-combined-mean",
            title="合併平均與分組加權",
            chapter_role="典型題型",
            difficulty="中等",
            formula_lines=[
                ("合併平均", r"$\bar{x}=\frac{n_1\bar{x}_1+n_2\bar{x}_2}{n_1+n_2}$"),
                ("加權", r"$\bar{x}=\frac{\sum x_if_i}{\sum f_i}$"),
            ],
            usage=["兩班、兩組資料合併時快速求新平均。"],
            examples=["甲乙兩班平均與人數已知時求全體平均。"],
            tips=["分母一定是總人數，不是組數。"],
            notes=["本質都是加權平均。"],
            mistakes=["直接把兩個平均數再平均。"],
        ),
        topic_row(
            id_="j6-3-2-scatter-trend-correlation",
            title="散佈圖趨勢與相關判讀",
            chapter_role="核心概念",
            difficulty="基礎",
            formula_lines=[
                ("正相關", r"$x\uparrow,\ y\uparrow$"),
                ("負相關", r"$x\uparrow,\ y\downarrow$"),
            ],
            usage=["判讀兩變數是否同向或反向變動。"],
            examples=["讀書時間與成績常呈正相關。"],
            tips=["先看點群整體方向，不要只看單一點。"],
            notes=["相關不代表因果。"],
            mistakes=["看到同時變化就直接下因果結論。"],
        ),
        topic_row(
            id_="j6-3-2-time-series-trend",
            title="時間序列圖的趨勢與波動",
            chapter_role="典型題型",
            difficulty="基礎",
            formula_lines=[
                ("趨勢", r"$\text{長期上升 / 下降}$"),
                ("波動", r"$\text{短期震盪幅度}$"),
            ],
            usage=["讀氣溫、銷量、出席率等隨時間變化資料。"],
            examples=["先看長期趨勢，再看局部異常點。"],
            tips=["比較兩時段時，先對齊時間尺度。"],
            notes=["折線圖重點在變化，不只是單點大小。"],
            mistakes=["把短期波動誤判為長期趨勢反轉。"],
        ),
        topic_row(
            id_="j6-3-2-percentile-and-ranking",
            title="百分位與排名判讀",
            chapter_role="進階題型",
            difficulty="進階",
            formula_lines=[
                ("百分位", r"$P_k$"),
                ("相對位置", r"$\frac{\text{低於該值人數}}{N}$"),
            ],
            usage=["解讀成績百分位與相對名次。"],
            examples=["第 75 百分位代表約有 75% 的資料不高於該值。"],
            tips=["先分清楚『不高於』與『高於』描述方向。"],
            notes=["百分位是位置概念，不是百分比成績。"],
            mistakes=["把第 80 百分位誤解為拿 80 分。"],
        ),
        topic_row(
            id_="j6-3-2-graph-misleading-check",
            title="圖表誤導與尺度陷阱",
            chapter_role="易錯陷阱",
            difficulty="中等",
            formula_lines=[
                ("比例軸檢查", r"$\text{起點是否為 }0$"),
                ("視覺誤差", r"$\text{面積/長度是否與數值一致}$"),
            ],
            usage=["判斷新聞圖表或報告圖表是否誤導。"],
            examples=["截斷縱軸會放大差異視覺效果。"],
            tips=["先看座標軸範圍，再看資料。"],
            notes=["同一資料可因尺度不同呈現不同觀感。"],
            mistakes=["只看圖形高低，不看座標刻度。"],
        ),
        topic_row(
            id_="j6-3-2-summary-comparison-strategy",
            title="兩組資料比較的完整策略",
            chapter_role="教學核心",
            difficulty="中等",
            formula_lines=[
                ("中心", r"$\bar{x},\ Q_2$"),
                ("分散", r"$R,\ IQR$"),
            ],
            usage=["綜合題：要求比較『誰比較好』或『誰比較穩定』。"],
            examples=["先比中心再比分散，最後回到題目語境。"],
            tips=["結論至少含兩句：中心結論 + 分散結論。"],
            notes=["只用單一指標容易失真。"],
            mistakes=["中心與分散指標混用，造成矛盾結論。"],
        ),
    ]


def build_questions() -> List[Dict]:
    return [
        question_row(
            id_="q-j6-3-2-stat-001",
            title="組距判斷（基礎01）",
            difficulty="基礎",
            question_text="區間 $30\\sim39$ 與 $40\\sim49$ 的組距各是多少？",
            answer_text="皆為 10。",
            explanation_text="每組寬度固定為 10。",
            topic_id="j6-3-2-grouped-frequency-table",
        ),
        question_row(
            id_="q-j6-3-2-stat-002",
            title="總次數檢查（基礎02）",
            difficulty="基礎",
            question_text="次數為 $4,7,9,5$，總次數 $N$ 為何？",
            answer_text="$25$。",
            explanation_text="$N=4+7+9+5=25$。",
            topic_id="j6-3-2-grouped-frequency-table",
        ),
        question_row(
            id_="q-j6-3-2-stat-003",
            title="累積次數（中等01）",
            difficulty="中等",
            question_text="次數為 $3,5,4,8$，到第 3 組的累積次數是？",
            answer_text="$12$。",
            explanation_text="$3+5+4=12$。",
            topic_id="j6-3-2-cumulative-frequency",
        ),
        question_row(
            id_="q-j6-3-2-stat-004",
            title="累積相對次數（中等02）",
            difficulty="中等",
            question_text="若 $N=40$，到某組累積次數 $F_k=30$，累積相對次數是多少？",
            answer_text="$0.75$（$75\\%$）。",
            explanation_text="$\\frac{F_k}{N}=\\frac{30}{40}=0.75$。",
            topic_id="j6-3-2-cumulative-frequency",
        ),
        question_row(
            id_="q-j6-3-2-stat-005",
            title="直方圖判讀（基礎01）",
            difficulty="基礎",
            question_text="組寬相同時，哪一組柱高最高通常代表什麼？",
            answer_text="該組次數最多。",
            explanation_text="同組寬下，柱高與次數成正比。",
            topic_id="j6-3-2-histogram-and-shape",
        ),
        question_row(
            id_="q-j6-3-2-stat-006",
            title="偏態判讀（中等01）",
            difficulty="中等",
            question_text="資料右側尾巴較長，通常稱為哪一種偏態？",
            answer_text="右偏（正偏）。",
            explanation_text="長尾方向決定偏態名稱。",
            topic_id="j6-3-2-histogram-and-shape",
        ),
        question_row(
            id_="q-j6-3-2-stat-007",
            title="四分位距計算（中等01）",
            difficulty="中等",
            question_text="若 $Q_1=48, Q_3=72$，則 $IQR$ 為多少？",
            answer_text="$24$。",
            explanation_text="$IQR=Q_3-Q_1=72-48=24$。",
            topic_id="j6-3-2-quartiles-and-boxplot",
        ),
        question_row(
            id_="q-j6-3-2-stat-008",
            title="盒狀圖中線（基礎01）",
            difficulty="基礎",
            question_text="盒狀圖盒內的中線代表哪個統計量？",
            answer_text="中位數（$Q_2$）。",
            explanation_text="中線位置即第 2 四分位數。",
            topic_id="j6-3-2-quartiles-and-boxplot",
        ),
        question_row(
            id_="q-j6-3-2-stat-009",
            title="離群值上界（進階01）",
            difficulty="進階",
            question_text="若 $Q_1=10, Q_3=22$，離群值上界是多少？",
            answer_text="$40$。",
            explanation_text="$IQR=12$，上界 $=Q_3+1.5IQR=22+18=40$。",
            topic_id="j6-3-2-outlier-rule",
        ),
        question_row(
            id_="q-j6-3-2-stat-010",
            title="離群判斷（進階02）",
            difficulty="進階",
            question_text="承上題，資料值 45 是否可視為疑似離群值？",
            answer_text="是。",
            explanation_text="45 大於上界 40，符合疑似離群值條件。",
            topic_id="j6-3-2-outlier-rule",
        ),
        question_row(
            id_="q-j6-3-2-stat-011",
            title="代表值選擇（中等01）",
            difficulty="中等",
            question_text="資料含極端高值時，代表中心位置通常優先看平均還是中位？",
            answer_text="中位數。",
            explanation_text="中位數對極端值較不敏感。",
            topic_id="j6-3-2-mean-median-robustness",
        ),
        question_row(
            id_="q-j6-3-2-stat-012",
            title="抗極端值比較（中等02）",
            difficulty="中等",
            question_text="極端值加入後，通常哪個量變動較大：$\\bar{x}$ 或 $Q_2$？",
            answer_text="$\\bar{x}$。",
            explanation_text="平均數會被極端值拉動較明顯。",
            topic_id="j6-3-2-mean-median-robustness",
        ),
        question_row(
            id_="q-j6-3-2-stat-013",
            title="合併平均（中等01）",
            difficulty="中等",
            question_text="甲班 20 人平均 70，乙班 30 人平均 80，全體平均為何？",
            answer_text="$76$。",
            explanation_text="$\\bar{x}=\\frac{20\\times70+30\\times80}{50}=76$。",
            topic_id="j6-3-2-combined-mean",
        ),
        question_row(
            id_="q-j6-3-2-stat-014",
            title="平均陷阱（基礎01）",
            difficulty="基礎",
            question_text="兩組平均 70 與 80，可直接算 $(70+80)/2$ 作全體平均嗎？",
            answer_text="不一定，需看兩組人數。",
            explanation_text="合併平均必須用人數加權。",
            topic_id="j6-3-2-combined-mean",
        ),
        question_row(
            id_="q-j6-3-2-stat-015",
            title="散佈圖趨勢（基礎01）",
            difficulty="基礎",
            question_text="若點群大致往右上分布，表示何種相關？",
            answer_text="正相關。",
            explanation_text="$x$ 增加時 $y$ 傾向增加。",
            topic_id="j6-3-2-scatter-trend-correlation",
        ),
        question_row(
            id_="q-j6-3-2-stat-016",
            title="相關與因果（基礎02）",
            difficulty="基礎",
            question_text="有相關就一定有因果嗎？",
            answer_text="不一定。",
            explanation_text="相關只表示共同變動，不保證因果關係。",
            topic_id="j6-3-2-scatter-trend-correlation",
        ),
        question_row(
            id_="q-j6-3-2-stat-017",
            title="時間序列判讀（基礎01）",
            difficulty="基礎",
            question_text="折線圖整體向上但有小幅震盪，該如何描述？",
            answer_text="長期上升趨勢，伴隨短期波動。",
            explanation_text="趨勢看長期方向，波動看局部起伏。",
            topic_id="j6-3-2-time-series-trend",
        ),
        question_row(
            id_="q-j6-3-2-stat-018",
            title="時間序列比較（中等01）",
            difficulty="中等",
            question_text="比較兩折線圖時第一步應先確認什麼？",
            answer_text="時間尺度與座標刻度是否一致。",
            explanation_text="尺度不同會導致錯誤比較。",
            topic_id="j6-3-2-time-series-trend",
        ),
        question_row(
            id_="q-j6-3-2-stat-019",
            title="百分位解讀（進階01）",
            difficulty="進階",
            question_text="第 80 百分位的意義是什麼？",
            answer_text="約有 80% 的資料不高於此值。",
            explanation_text="百分位描述相對位置，不是原始分數。",
            topic_id="j6-3-2-percentile-and-ranking",
        ),
        question_row(
            id_="q-j6-3-2-stat-020",
            title="百分位迷思（進階02）",
            difficulty="進階",
            question_text="某生在第 90 百分位，是否代表他得 90 分？",
            answer_text="不代表。",
            explanation_text="百分位是排名位置，與分數數值不同。",
            topic_id="j6-3-2-percentile-and-ranking",
        ),
        question_row(
            id_="q-j6-3-2-stat-021",
            title="圖表尺度陷阱（中等01）",
            difficulty="中等",
            question_text="縱軸不從 0 開始，可能造成什麼問題？",
            answer_text="視覺上誇大差異。",
            explanation_text="截斷座標軸會放大長條高度差。",
            topic_id="j6-3-2-graph-misleading-check",
        ),
        question_row(
            id_="q-j6-3-2-stat-022",
            title="圖表誤導檢查（中等02）",
            difficulty="中等",
            question_text="判讀圖表前最先要檢查哪兩件事？",
            answer_text="座標刻度與資料單位。",
            explanation_text="先確認尺度與單位才能正確比較。",
            topic_id="j6-3-2-graph-misleading-check",
        ),
        question_row(
            id_="q-j6-3-2-stat-023",
            title="兩組比較流程（中等01）",
            difficulty="中等",
            question_text="比較兩組資料時，建議至少比較哪兩類指標？",
            answer_text="中心指標與分散指標。",
            explanation_text="例如先比 $\\bar{x}$ 或中位，再比全距或 $IQR$。",
            topic_id="j6-3-2-summary-comparison-strategy",
        ),
        question_row(
            id_="q-j6-3-2-stat-024",
            title="完整結論（中等02）",
            difficulty="中等",
            question_text="若甲組平均較高但全距較大，結論要如何寫才完整？",
            answer_text="甲組表現較高，但穩定度較低（較分散）。",
            explanation_text="同時回應中心與分散，避免單一面向結論。",
            topic_id="j6-3-2-summary-comparison-strategy",
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
            "source_refs": [SOURCE_MD_1, SOURCE_MD_2, SOURCE_MD_3],
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

