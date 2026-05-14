import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body


FORMULA_BY_ORDER = {
    1: "s1-1-5-log-definition-evaluation",
    2: "s1-1-5-log-definition-evaluation",
    3: "s1-1-5-log-definition-evaluation",
    4: "s1-1-5-log-definition-evaluation",
    5: "s1-1-5-log-power-swap-computation",
    6: "s1-1-5-log-power-swap-computation",
    7: "s1-1-5-log-power-swap-computation",
    8: "s1-1-5-log-power-swap-computation",
    9: "s1-1-5-log-power-swap-computation",
    10: "s1-1-5-log-definition-evaluation",
    11: "s1-1-5-log-power-swap-computation",
    12: "s1-1-5-log-power-swap-computation",
    13: "s1-1-5-log-power-swap-computation",
    14: "s1-1-5-log-power-swap-computation",
    15: "s1-1-5-log-power-swap-computation",
    16: "s1-1-5-log-power-swap-computation",
    17: "s1-1-5-log-scale-models",
    18: "s1-1-5-log-scale-models",
    19: "s1-1-5-log-scale-models",
    20: "s1-1-5-log-scale-models",
    21: "s1-1-5-log-scale-models",
    22: "s1-1-5-log-scale-models",
    23: "s1-1-5-log-growth-models",
    24: "s1-1-5-log-growth-models",
    25: "s1-1-5-log-growth-models",
    26: "s1-1-5-log-growth-models",
    27: "s1-1-5-log-growth-models",
    28: "s1-1-5-log-growth-models",
    29: "s1-1-5-scientific-notation-basics",
    30: "s1-1-5-scientific-notation-basics",
    31: "s1-1-5-scientific-notation-basics",
    32: "s1-1-5-digit-leading-estimation",
    33: "s1-1-5-digit-leading-estimation",
    34: "s1-1-5-digit-leading-estimation",
    35: "s1-1-5-digit-leading-estimation",
    36: "s1-1-5-digit-leading-estimation",
    37: "s1-1-5-digit-leading-estimation",
    38: "s1-1-5-digit-leading-estimation",
    39: "s1-1-5-digit-leading-estimation",
    40: "s1-1-5-digit-leading-estimation",
    41: "s1-1-5-digit-leading-estimation",
    42: "s1-1-5-digit-leading-estimation",
    43: "s1-1-5-log-growth-models",
    44: "s1-1-5-log-growth-models",
    45: "s1-1-5-log-growth-models",
    46: "s1-1-5-log-growth-models",
    47: "s1-1-5-log-scale-models",
    48: "s1-1-5-log-scale-models",
    49: "s1-1-5-log-scale-models",
    50: "s1-1-5-log-scale-models",
    51: "s1-1-5-log-growth-models",
    52: "s1-1-5-log-growth-models",
}


QUESTION_OVERRIDES = {
    1: (
        "求下列式子的值：\n"
        "(1)① 2^{x}＝12 ⇔ x＝____________。 ② log_{3}x＝5 ⇔ x＝____________。\n"
        "(2)① log_{3}1＝____________。 ② log_{7}7＝____________。\n"
        "③ log_{2}64＝____________。 ④ log_{125}5＝____________。"
    ),
    2: (
        "求下列式子的值：\n"
        "(1)①5^{a}＝20 ⇔ a＝____________。 ② log_{a}10＝3 ⇔ 10＝____________。\n"
        "(2)① log_{a}5＝$\\frac{1}{2}$ ⇔ a＝____________。 ② log_{10}1000＝____________。\n"
        "③ log_{25}x＝－1.5 ⇔ x＝____________。 ④ log_{27}9＝____________。"
    ),
    11: (
        "已知 log6＝0.7782，求：\n"
        "(1) $10^{0.7782} =$____________。\n"
        "再已知 log2.45 ≈ 0.3892，求：\n"
        "(2) $10^{2.3892}$。\n"
        "(3) $10^{-2.6108}$。"
    ),
}


EXPLANATION_OVERRIDES = {
    1: (
        "【解析】(1)① $2^{x}=12$，所以 $x=\\log_{2}12$。\n"
        "② $\\log_{3}x=5$，所以 $x=3^{5}=243$。\n"
        "(2)① $\\log_{3}1=0$。\n"
        "② $\\log_{7}7=1$。\n"
        "③ $\\log_{2}64=6$。\n"
        "④ $\\log_{125}5=\\frac{1}{3}$。"
    ),
    2: (
        "【解析】(1)① $5^{a}=20$，所以 $a=\\log_{5}20$。\n"
        "② $\\log_{a}10=3$，所以 $10=a^{3}$。\n"
        "(2)① $\\log_{a}5=\\frac{1}{2}$，所以 $a^{\\frac{1}{2}}=5$，故 $a=25$。\n"
        "② $\\log_{10}1000=3$。\n"
        "③ $\\log_{25}x=-1.5$，所以 $x=25^{-\\frac{3}{2}}=(5^{2})^{-\\frac{3}{2}}=5^{-3}=\\frac{1}{125}$。\n"
        "④ 若 $\\log_{27}9=t$，則 $27^{t}=9$，即 $3^{3t}=3^{2}$，所以 $t=\\frac{2}{3}$。"
    ),
    11: (
        "【解析】(1) 因為 $\\log 6 = 0.7782$，所以 $10^{0.7782}=6$。\n"
        "(2) 因為 $\\log 2.45 \\approx 0.3892$，所以 $10^{0.3892}\\approx 2.45$，\n"
        "故 $10^{2.3892}=10^{2}\\cdot 10^{0.3892}\\approx 100\\times 2.45=245$。\n"
        "(3) $10^{-2.6108}=10^{-3}\\cdot 10^{0.3892}\\approx \\frac{1}{1000}\\times 2.45=0.00245$。"
    ),
    42: (
        "【解析】由題意得\n"
        "$\\left(\\frac{3}{4}\\right)^{n}<0.001$。\n"
        "兩邊取常用對數：\n"
        "$n\\log\\left(\\frac{3}{4}\\right)<\\log 0.001=-3$。\n"
        "又 $\\log\\left(\\frac{3}{4}\\right)=\\log 3-\\log 4\\approx 0.4771-0.6020=-0.1249$，\n"
        "所以 $n(-0.1249)<-3$，即 $n>\\frac{3}{0.1249}\\approx 24.0$。\n"
        "故 $n$ 的最小值為 25。"
    ),
}


TITLE_OVERRIDES = {
    5: "範例3：由 $x=\\log_{2}3$ 求值",
    11: "範例7：由常用對數反求原數",
    15: "範例9：由 $x=\\log_{3}5$ 求值",
    17: "範例11：芮氏規模與能量倍數",
    23: "範例14：人口成長與計算機估值",
    25: "範例15：對摺紙張的厚度估計",
    31: "範例2：由首數尾數反求數值",
    32: "範例3：由對數估計位數與首位",
    33: "範例4：由對數估計個位、首位與位數",
    34: "隨堂練習：整數部分為三位數的範圍",
    36: "範例5：由已知位數反推另一冪次位數",
    42: "隨堂練習：指數衰減的最小整數",
    43: "範例7：年金複利求本利和",
    44: "範例8：複利比較與銀行利率表",
    47: "範例9：pH 值與濃度倍數",
    48: "範例10：分貝與強度倍數",
    52: "隨堂練習：謠言散播模型",
}


REVIEW_OVERRIDES = {
    44: "銀行利率表題保留圖片，建議前端再實際檢查一次版面。",
}


FALLBACK_TITLE_BY_FORMULA = {
    "s1-1-5-log-definition-evaluation": "對數定義與值計算",
    "s1-1-5-log-power-swap-computation": "指對數互換與求值",
    "s1-1-5-log-scale-models": "對數尺度模型",
    "s1-1-5-log-growth-models": "成長衰減與複利模型",
    "s1-1-5-scientific-notation-basics": "科學記號與首尾數",
    "s1-1-5-digit-leading-estimation": "位數與首位數估計",
}


IMAGE_INLINE_REPLACEMENTS = {
    "image6.png": "≈",
}


VECTOR_REF_RE = re.compile(r"\[圖:\s*([^\]]+\.(?:emf|wmf))(?!\.png)\]", re.IGNORECASE)
GENERIC_IMAGE_REF_RE = re.compile(r"\[圖:\s*([^\]]+)\]", re.IGNORECASE)
ABSOLUTE_PATH_RE = re.compile(rf"{re.escape(str(Path.cwd()).replace('\\', '/'))}/", re.IGNORECASE)
SOURCE_BLOCK_RE = re.compile(r"【(?!解析】)[^】]+】")


def normalize_vector_refs(text: str) -> str:
    updated = str(text or "")
    updated = re.sub(r"(?i)\.(emf|wmf)(?:\.png)+", r".\1.png", updated)
    updated = VECTOR_REF_RE.sub(lambda m: f"[圖:{m.group(1)}.png]", updated)
    return updated


def normalize_image_paths(text: str, workspace_root: Path) -> str:
    updated = normalize_vector_refs(text)

    def repl(match: re.Match[str]) -> str:
        raw = match.group(1).strip().replace("\\", "/")
        lower = raw.lower()
        if "/program-db/" in lower:
            raw = raw[lower.find("/program-db/") + 1 :]
        elif "program-db/" in lower:
            raw = raw[lower.find("program-db/") :]
        else:
            raw = ABSOLUTE_PATH_RE.sub("", raw)
        raw = re.sub(r"(?i)\.(emf|wmf)(?!\.png$)", lambda m: f"{m.group(0)}.png", raw)
        return f"[圖:{raw}]"

    updated = GENERIC_IMAGE_REF_RE.sub(repl, updated)
    for image_name, replacement in IMAGE_INLINE_REPLACEMENTS.items():
        updated = re.sub(rf"\n?\[圖:[^\]\n]*{re.escape(image_name)}\]\n?", replacement, updated, flags=re.IGNORECASE)
    updated = re.sub(r"\s+≈", " ≈", updated)
    updated = re.sub(r"≈\s+", " ≈ ", updated)
    updated = re.sub(r"[ ]{2,}", " ", updated)
    return updated.strip()


def strip_source_blocks(text: str) -> str:
    return SOURCE_BLOCK_RE.sub("", str(text or "")).strip()


def ensure_png_sidecars(asset_dir: Path) -> int:
    count = 0
    for path in asset_dir.iterdir():
        if path.suffix.lower() not in {".wmf", ".emf"}:
            continue
        png_path = Path(f"{path}.png")
        if png_path.exists():
            continue
        with Image.open(path) as image:
            image.save(png_path, format="PNG")
        count += 1
    return count


def extract_marker(tags: list[str]) -> str:
    for tag in tags or []:
        if str(tag).startswith("marker:"):
            return str(tag).split(":", 1)[1].strip()
    return ""


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", str(question_text or ""))
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：:。﹒")
    seed = re.split(r"[（(]1[）)]", seed, maxsplit=1)[0].strip(" ：:。﹒")
    if len(seed) > 30:
        seed = seed[:30].rstrip(" ：:。﹒")
    return f"{marker}：{seed}" if seed else marker


def needs_fallback_title(title: str) -> bool:
    text = str(title or "")
    if text.count("$") % 2 == 1:
        return True
    if len(text) > 34:
        return True
    if text.endswith(("{", "(", "（", "=", "－", "-", "﹕", "：")):
        return True
    return False


def update_preview(path: Path, records: list[dict]):
    by_category = Counter(row.get("question_category", "") for row in records)
    by_section: dict[str, list[dict]] = {}
    for row in records:
        section = row.get("source_section") or "未分類"
        by_section.setdefault(section, []).append(
            {
                "id": row["id"],
                "title": row["title"],
                "question_category": row["question_category"],
                "difficulty": row["difficulty"],
                "formula_id": row.get("formula_id", ""),
            }
        )
    payload = {
        "meta": {
            "chapter_code": "s1-1-5",
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(by_category),
        "by_section": by_section,
        "review_ids": [row["id"] for row in records if "needs-review" in (row.get("tags") or [])],
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_review(path: Path, records: list[dict], png_count: int):
    review_rows = [row for row in records if "needs-review" in (row.get("tags") or [])]
    lines = [
        "# s1-1-5 Review Needed",
        "",
        "## Current extraction status",
        "",
        f"- Parsed question records: {len(records)}",
        f"- Assigned `formula_id`: {sum(1 for row in records if row.get('formula_id'))}",
        f"- PNG sidecars created this run: {png_count}",
        f"- Needs manual review: {len(review_rows)}",
        "",
        "## Manual review items",
        "",
    ]
    if review_rows:
        for row in review_rows:
            lines.append(f"- `{row['id']}`")
            lines.append(f"  - {row.get('review_note', '待人工確認')}")
    else:
        lines.append("- 目前沒有保留人工確認題。")
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已保留。",
            "- 已把 `emf/wmf` 圖片引用改成 `.png` sidecar，供前端顯示。",
            "- 少數 Pandoc 抽壞的題幹與解析，已在 finalize 階段人工修正。",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def update_question_db(question_db_path: Path, records: list[dict]):
    payload = json.loads(question_db_path.read_text(encoding="utf-8"))
    questions = [row for row in payload.get("questions", []) if row.get("chapter_code") != "s1-1-5"]
    questions.extend(records)
    payload["questions"] = questions
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(questions)
    payload["meta"]["updatedAt"] = datetime.now().astimezone().isoformat()
    question_db_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def make_branch(
    *,
    branch_id: str,
    title: str,
    formula_lines: list[tuple[str, str]],
    usage: str,
    example: str,
    tip: str,
    note: str,
    mistake: str,
    manual_order: int,
) -> dict:
    return {
        "id": branch_id,
        "title": title,
        "formula": {
            "type": "labeled-lines",
            "lines": [{"label": label, "values": [value]} for label, value in formula_lines],
        },
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "對數",
        "domain": "代數",
        "difficulty": "基礎",
        "chapterRole": "重點分支",
        "parentId": "s1-1-5-logarithm-core",
        "tags": ["word匯入", "題型分支", "s1-1-5", "數與式：對數", "高一上"],
        "usage": [usage],
        "examples": [example],
        "tips": [tip],
        "notes": [note],
        "mistakes": [mistake],
        "contentTypes": ["教學核心", "重點公式", "題型策略", "易錯提醒"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": datetime.now().astimezone().isoformat(),
        "chapter_code": "s1-1-5",
        "gradeLabel": "高一上",
        "chapterCode": "s1-1-5",
        "section": "對數",
        "domainSub": "",
        "isBranch": True,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "originalIndex": manual_order,
        "stageOrder": 2,
        "gradeOrder": 4,
        "termOrder": 1,
        "chapterOrder": 5,
        "manualOrder": manual_order,
    }


def local_branch_rows() -> list[dict]:
    return [
        make_branch(
            branch_id="s1-1-5-log-definition-evaluation",
            title="對數定義、存在條件與值計算",
            formula_lines=[
                ("定義", "$a^x=b\\iff x=\\log_a b$"),
                ("條件", "$a>0,\\ a\\neq 1,\\ b>0$"),
                ("基本值", "$\\log_a 1=0,\\ \\log_a a=1$"),
            ],
            usage="處理對數存在條件與基本值計算。",
            example="$\\log_{2}64=6$，$\\log_{125}5=\\frac13$。",
            tip="先看底數與真數是否合法，再把對數改回指數式。",
            note="對應 1-5 前段的定義題與真假判斷題。",
            mistake="忽略底數不能等於 1，或真數必須大於 0。",
            manual_order=1231,
        ),
        make_branch(
            branch_id="s1-1-5-log-power-swap-computation",
            title="指對數互換與求值",
            formula_lines=[
                ("互換", "$a^{\\log_a b}=b$"),
                ("反推", "$\\log_a b=x\\Rightarrow a^x=b$"),
                ("代換", "$2^{\\log_2 3}=3$"),
            ],
            usage="把對數改寫成指數式，或把指數式改寫成對數式求值。",
            example="$x=\\log_2 3\\Rightarrow 4^x+2^{-x}=\\frac{28}{3}$。",
            tip="看到 $\\log_a b$ 和 $a^x$ 同時出現時，優先做互換。",
            note="包含常用對數反求原數與含參數的對數求值。",
            mistake="把 $\\log_a b$ 誤當成 $\\frac{\\log a}{\\log b}$。",
            manual_order=1232,
        ),
        make_branch(
            branch_id="s1-1-5-log-scale-models",
            title="對數尺度模型",
            formula_lines=[
                ("地震", "$r=\\log I$"),
                ("分貝", "$dB=10\\log\\frac{I}{I_0}$"),
                ("酸鹼值", "$pH=-\\log[H^+]$"),
            ],
            usage="處理芮氏規模、分貝、pH 值、星等等對數尺度問題。",
            example="兩個地震規模差 0.9，能量比約為 $10^{0.9}\\approx 8$。",
            tip="這類題目常先相減，把兩個對數相減改成比值的對數。",
            note="對應 1-5 中後段的尺度模型題。",
            mistake="只看規模差值，忘記最後要轉回倍數。",
            manual_order=1233,
        ),
        make_branch(
            branch_id="s1-1-5-log-growth-models",
            title="成長衰減與複利模型",
            formula_lines=[
                ("指數模型", "$N=N_0a^t$"),
                ("複利", "$A=P(1+r)^n$"),
                ("取對數", "$a^x=b\\Rightarrow x=\\frac{\\log b}{\\log a}$"),
            ],
            usage="處理複利、人口成長、衰減、紙張對摺、謠言散播等模型。",
            example="$(1.06)^n>2.5$ 時，可取對數求最小整數 $n$。",
            tip="先列出指數模型，再用對數把指數拉下來。",
            note="整章後半常見應用題主要落在此分支。",
            mistake="把『至少幾年』直接四捨五入，忽略要往上取整。",
            manual_order=1234,
        ),
        make_branch(
            branch_id="s1-1-5-scientific-notation-basics",
            title="科學記號與首尾數",
            formula_lines=[
                ("科學記號", "$a=b\\times 10^n,\\ 1\\le b<10$"),
                ("首尾數", "$\\log a=n+\\log b$"),
                ("位數", "若 $\\log a$ 首數為 $n$，則 $a$ 為 $n+1$ 位數"),
            ],
            usage="判讀首數、尾數與科學記號的基本意義。",
            example="$\\log a=1+\\frac23$，表示 $a=10^{5/3}$。",
            tip="先把數寫成 $b\\times 10^n$，再區分首數與尾數。",
            note="對應主題 2 開頭的概念題。",
            mistake="把尾數誤認成小數點後的數字，而不是對數中的小數部分。",
            manual_order=1235,
        ),
        make_branch(
            branch_id="s1-1-5-digit-leading-estimation",
            title="位數與首位數估計",
            formula_lines=[
                ("位數", "$k=\\lfloor \\log N \\rfloor +1$"),
                ("首位", "看 $\\log N$ 的尾數落在哪個 $\\log m$ 區間"),
                ("估算", "$\\log(a^n)=n\\log a$"),
            ],
            usage="估算大數的位數、首位數、整數部分範圍與最小整數解。",
            example="$\\log 2^{1998}=1998\\log 2=601.398$，所以是 602 位數。",
            tip="先求首數判位數，再用尾數和已知對數表判首位。",
            note="對應主題 2 中段的大數位數估計題。",
            mistake="把首數 $n$ 直接當成位數，少加 1。",
            manual_order=1236,
        ),
    ]


def update_formula_db(formula_db_path: Path):
    payload = json.loads(formula_db_path.read_text(encoding="utf-8"))
    topics = payload.get("topics", [])
    branch_ids = {row["id"] for row in local_branch_rows()}
    topics = [row for row in topics if row.get("id") not in branch_ids]
    topics.extend(local_branch_rows())
    payload["topics"] = topics
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(topics)
    payload["meta"]["updatedAt"] = datetime.now().astimezone().isoformat()
    formula_db_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Finalize s1-1-5 pack.")
    parser.add_argument("--questions", required=True)
    parser.add_argument("--preview", required=True)
    parser.add_argument("--review", required=True)
    parser.add_argument("--asset-dir", required=True)
    parser.add_argument("--formula-db", required=True)
    parser.add_argument("--question-db", required=True)
    parser.add_argument("--workspace-root", required=True)
    args = parser.parse_args()

    questions_path = Path(args.questions)
    preview_path = Path(args.preview)
    review_path = Path(args.review)
    asset_dir = Path(args.asset_dir)
    formula_db_path = Path(args.formula_db)
    question_db_path = Path(args.question_db)
    workspace_root = Path(args.workspace_root)

    png_count = ensure_png_sidecars(asset_dir)

    payload = json.loads(questions_path.read_text(encoding="utf-8"))
    records = payload.get("questions", [])

    for row in records:
        order = int(row.get("source_order", 0) or 0)
        tags = [tag for tag in (row.get("tags") or []) if tag != "needs-formula-id"]

        if order in QUESTION_OVERRIDES:
            row["question_text"] = QUESTION_OVERRIDES[order]
        if order in EXPLANATION_OVERRIDES:
            row["explanation_text"] = EXPLANATION_OVERRIDES[order]

        row["question_text"] = clean_question_body(
            strip_source_blocks(normalize_image_paths(row.get("question_text", ""), workspace_root))
        )
        row["answer_text"] = clean_question_body(
            strip_source_blocks(normalize_image_paths(row.get("answer_text", ""), workspace_root))
        )
        row["explanation_text"] = clean_question_body(
            strip_source_blocks(normalize_image_paths(row.get("explanation_text", ""), workspace_root))
        )
        row["formula_id"] = FORMULA_BY_ORDER.get(order, "")

        marker = extract_marker(row.get("tags") or [])
        if marker:
            row["title"] = rebuild_title(marker, row.get("question_text", ""))
            if order in TITLE_OVERRIDES:
                row["title"] = TITLE_OVERRIDES[order]
            if needs_fallback_title(row["title"]):
                fallback = FALLBACK_TITLE_BY_FORMULA.get(row["formula_id"], "")
                if fallback:
                    row["title"] = f"{marker}：{fallback}"

        if order in REVIEW_OVERRIDES:
            if "needs-review" not in tags:
                tags.append("needs-review")
            row["review_note"] = REVIEW_OVERRIDES[order]
        else:
            tags = [tag for tag in tags if tag != "needs-review"]
            row.pop("review_note", None)

        row["tags"] = tags

    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(records)
    payload["meta"]["finalized"] = True
    payload["meta"]["finalizedBy"] = "finalize_s1_1_5_pack.py"
    payload.setdefault("summary", {})
    payload["summary"]["image_references"] = sorted(
        {
            re.sub(r"^\[圖:|\]$", "", normalize_image_paths(f"[圖:{path}]", workspace_root))
            for path in payload.get("summary", {}).get("image_references", [])
        }
    )

    questions_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    update_preview(preview_path, records)
    write_review(review_path, records, png_count)
    update_formula_db(formula_db_path)
    update_question_db(question_db_path, records)

    print(f"records={len(records)}")
    print(f"assigned={sum(1 for row in records if row.get('formula_id'))}")
    print(f"review={sum(1 for row in records if 'needs-review' in (row.get('tags') or []))}")


if __name__ == "__main__":
    main()
