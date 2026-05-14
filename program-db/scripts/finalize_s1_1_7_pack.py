import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body


FORMULA_BY_ORDER = {}
for order in (1, 2):
    FORMULA_BY_ORDER[order] = "s1-1-7-circle-standard-general"
for order in (3, 4, 5):
    FORMULA_BY_ORDER[order] = "s1-1-7-circle-from-center-radius"
for order in range(6, 18):
    FORMULA_BY_ORDER[order] = "s1-1-7-circle-judgment-parameter"
for order in range(18, 25):
    FORMULA_BY_ORDER[order] = "s1-1-7-three-point-circumcircle"
for order in range(25, 32):
    FORMULA_BY_ORDER[order] = "s1-1-7-center-constraint-tangent"
for order in range(32, 38):
    FORMULA_BY_ORDER[order] = "s1-1-7-circle-locus-transform"
for order in range(38, 41):
    FORMULA_BY_ORDER[order] = "s1-1-7-circle-arch-application"
for order in (41, 42):
    FORMULA_BY_ORDER[order] = "s1-1-7-apollonius-circle"
for order in (43, 44, 45):
    FORMULA_BY_ORDER[order] = "s1-1-7-absolute-circle-region"


REVIEW_OVERRIDES = {
    38: "圓拱橋題的圖與數值步驟很多，建議以前端畫面確認圖片大小與解析是否順手。",
    40: "橋拱題主要依賴附圖定位 A2、A3、B3，建議以前端再核對一次圖文對照。",
}


TITLE_OVERRIDES = {
    1: "範例1：由一般式求圓心與半徑",
    2: "隨堂練習：由一般式求圓心半徑",
    3: "範例2：依圓心半徑與過點寫方程式",
    6: "範例3：判斷是否為圓與讀取半徑",
    7: "範例4：判斷圓、點與虛圓",
    8: "範例5：圓方程係數條件判斷",
    9: "範例6：參數改變時的最大圓面積",
    10: "範例7：參數範圍與與 x 軸相切",
    11: "範例8：依 k 討論圖形型態",
    18: "範例10：通過兩點且圓心在直線上",
    19: "範例11：通過三點作圓",
    24: "範例12：三直線三角形的外接圓",
    25: "範例13：通過兩點且圓心在直線上",
    30: "範例14：過定點且與兩軸相切",
    32: "範例15：已知弦與圓心距求圓",
    33: "範例16：圓上動點中點軌跡",
    35: "範例17：參數圓恆過兩定點",
    37: "範例18：動點三角形重心軌跡",
    38: "範例19：圓拱橋支柱長度",
    41: "範例20：定比距離軌跡",
    43: "範例21：絕對值圓形與面積",
}


FALLBACK_TITLE_BY_FORMULA = {
    "s1-1-7-circle-standard-general": "圓一般式與標準式互換",
    "s1-1-7-circle-from-center-radius": "由圓心半徑與條件點求圓",
    "s1-1-7-circle-judgment-parameter": "圓、點、虛圓與參數判斷",
    "s1-1-7-three-point-circumcircle": "三點定圓與外接圓",
    "s1-1-7-center-constraint-tangent": "圓心限制與相切定圓",
    "s1-1-7-circle-locus-transform": "圓上動點與軌跡轉換",
    "s1-1-7-circle-arch-application": "圓拱與實際模型",
    "s1-1-7-apollonius-circle": "定比距離與 Apollonius 圓",
    "s1-1-7-absolute-circle-region": "絕對值圓形與區域面積",
}


VECTOR_REF_RE = re.compile(r"\[圖:\s*([^\]]+\.(?:emf|wmf))(?!\.png)\]", re.IGNORECASE)
GENERIC_IMAGE_REF_RE = re.compile(r"\[圖:\s*([^\]]+)\]", re.IGNORECASE)
ABSOLUTE_PATH_RE = re.compile(rf"{re.escape(str(Path.cwd()).replace('\\', '/'))}/", re.IGNORECASE)


def normalize_vector_refs(text: str) -> str:
    updated = str(text or "")
    updated = re.sub(r"(?i)\.(emf|wmf)(?:\.png)+", r".\1.png", updated)
    updated = VECTOR_REF_RE.sub(lambda m: f"[圖:{m.group(1)}.png]", updated)
    return updated


def normalize_image_paths(text: str) -> str:
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
    updated = re.sub(r"\n{3,}", "\n\n", updated)
    return updated.strip()


def normalize_text(text: str) -> str:
    value = normalize_image_paths(str(text or ""))
    replacements = {
        "【龍騰自命題】": "",
        "\\_": "_",
        "﹕": "：",
        "﹐": "，",
        "﹒": "。",
        "＝": "=",
        "＋": "+",
        "－": "−",
        "（": "(",
        "）": ")",
        "。 / ": "。\n",
        "， / ": "，\n",
        " / ": "\n",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = re.sub(r"\s+/\s+", "\n", value)
    value = re.sub(r"_{6,}", "____________", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r" {2,}", " ", value)
    value = clean_question_body(value).strip()
    value = re.sub(r"\s+/\s+", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


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
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。")
    if len(seed) > 30:
        seed = seed[:30].rstrip(" ：，。")
    return f"{marker}：{seed}" if seed else marker


def local_topic_rows() -> list[dict]:
    now = datetime.now().astimezone().isoformat()
    root = {
        "id": "s1-1-7-circle-equation-core",
        "title": "圓的方程式",
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "標準式", "values": ["$(x-h)^2+(y-k)^2=r^2$"]},
                {"label": "一般式", "values": ["$x^2+y^2+dx+ey+f=0$"]},
                {"label": "圓心半徑", "values": ["$\\left(-\\frac d2,-\\frac e2\\right),\\ r=\\frac12\\sqrt{d^2+e^2-4f}$"]},
            ],
        },
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "圓的方程式",
        "domain": "數學",
        "difficulty": "中等",
        "chapterRole": "核心主題",
        "parentId": "",
        "tags": ["word匯入", "主題核心", "s1-1-7", "高一上", "圓"],
        "usage": ["統整圓的一般式、標準式、定圓條件與圓形區域題。"],
        "examples": ["由一般式配方回標準式，讀出圓心與半徑。"],
        "tips": ["先判斷是不是圓，再談圓心、半徑或圖形。"],
        "notes": ["這章很多題會把幾何條件轉回代數方程。"],
        "mistakes": ["忘記檢查 $d^2+e^2-4f$ 的正負，直接當成實圓。"],
        "contentTypes": ["公式主題", "例題整理", "圖形判讀", "應用問題"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": now,
        "chapter_code": "s1-1-7",
        "gradeLabel": "高一上",
        "chapterCode": "s1-1-7",
        "section": "圓的方程式",
        "domainSub": "",
        "isBranch": False,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "originalIndex": 1248,
        "stageOrder": 2,
        "gradeOrder": 4,
        "termOrder": 1,
        "chapterOrder": 7,
        "manualOrder": 1248,
    }

    def branch(branch_id: str, title: str, formula_lines: list[tuple[str, str]], usage: str, example: str, tip: str, mistake: str, manual_order: int) -> dict:
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
            "chapter": "圓的方程式",
            "domain": "數學",
            "difficulty": "中等",
            "chapterRole": "分支重點",
            "parentId": "s1-1-7-circle-equation-core",
            "tags": ["word匯入", "分支重點", "s1-1-7", "高一上", "圓"],
            "usage": [usage],
            "examples": [example],
            "tips": [tip],
            "notes": ["很多題目會把幾何條件翻成圓心、半徑或距離式。"],
            "mistakes": [mistake],
            "contentTypes": ["公式主題", "例題整理", "圖形判讀", "應用問題"],
            "contentTypesLocked": True,
            "mathNotationLocked": True,
            "modifiedAt": now,
            "chapter_code": "s1-1-7",
            "gradeLabel": "高一上",
            "chapterCode": "s1-1-7",
            "section": "圓的方程式",
            "domainSub": "",
            "isBranch": True,
            "relatedChapters": [],
            "relatedTopicIds": [],
            "originalIndex": manual_order,
            "stageOrder": 2,
            "gradeOrder": 4,
            "termOrder": 1,
            "chapterOrder": 7,
            "manualOrder": manual_order,
        }

    branches = [
        branch(
            "s1-1-7-circle-standard-general",
            "圓一般式與標準式互換",
            [("標準式", "$(x-h)^2+(y-k)^2=r^2$"), ("一般式", "$x^2+y^2+dx+ey+f=0$"), ("配方", "$\\left(x+\\frac d2\\right)^2+\\left(y+\\frac e2\\right)^2=\\frac{d^2+e^2-4f}{4}$")],
            "由一般式配方回標準式，讀出圓心與半徑。",
            "看到 $x^2+y^2$ 同次項且沒有 $xy$ 項時，先想配方。",
            "配方後右邊若是 $r^2$，就能直接讀出圖形。",
            "把右邊是 0 或負數的情況也直接當成實圓。",
            1249,
        ),
        branch(
            "s1-1-7-circle-from-center-radius",
            "由圓心、半徑與條件點求圓",
            [("圓心半徑", "$(x-h)^2+(y-k)^2=r^2$"), ("過點", "$r^2=(x_1-h)^2+(y_1-k)^2$"), ("直徑端點", "$M\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)$")],
            "已知圓心、半徑、直徑端點或過點條件時直接建立方程。",
            "圓心已知且過一點時，先用距離公式求半徑。",
            "直徑題先找中點，再求半徑，通常最穩。",
            "過點條件代錯符號，導致半徑平方算反。",
            1250,
        ),
        branch(
            "s1-1-7-circle-judgment-parameter",
            "圓、點、虛圓與參數判斷",
            [("實圓", "$d^2+e^2-4f>0$"), ("一點", "$d^2+e^2-4f=0$"), ("虛圓", "$d^2+e^2-4f<0$")],
            "用判別量快速分辨圖形是圓、一點還是無實點。",
            "參數題常先整理出 $d^2+e^2-4f$ 再討論範圍。",
            "圓方程含參數時，先別急著配方，先看判別量更快。",
            "忘了題目可能要求最大面積或與座標軸相切等附加條件。",
            1251,
        ),
        branch(
            "s1-1-7-three-point-circumcircle",
            "三點定圓與外接圓",
            [("三點定圓", "$x^2+y^2+dx+ey+f=0$ 代入三點"), ("外接圓", "三頂點都在同一圓上"), ("同圓", "四點同圓可用同一方程驗證")],
            "處理三點作圓、外接圓與四點同圓問題。",
            "三直線圍成三角形時，先求三頂點，再帶入圓方程。",
            "帶三點求 $d,e,f$ 時，建三元一次方程組最直接。",
            "三點共線時仍硬要求外接圓。",
            1252,
        ),
        branch(
            "s1-1-7-center-constraint-tangent",
            "圓心限制與相切定圓",
            [("等距", "$OA=OB$"), ("軸切圓", "圓心到座標軸距離 = 半徑"), ("內切圓", "圓心到三邊距離相等")],
            "圓心落在線上、與座標軸相切或為三角形內切圓時，用距離條件定圓。",
            "圓心在某直線上時，通常會和兩點等距條件一起出現。",
            "看到相切先改成『距離 = 半徑』，通常最省步驟。",
            "把圓心在直線上和圓過兩點混在一起卻少列一條方程。",
            1253,
        ),
        branch(
            "s1-1-7-circle-locus-transform",
            "圓上動點與軌跡轉換",
            [("中點", "$M=\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)$"), ("重心", "$G=\\left(\\frac{x_A+x_B+x_P}{3},\\frac{y_A+y_B+y_P}{3}\\right)$"), ("恆過兩點", "消去參數後找共同解")],
            "把圓上動點、弦中點、重心等條件轉成新的軌跡方程。",
            "先設動點座標，再把新點坐標用代數關係改寫回圓方程。",
            "這類題目本質是座標轉換，先找線性關係再代回。",
            "直接硬猜新軌跡而沒有先寫出座標對應。",
            1254,
        ),
        branch(
            "s1-1-7-circle-arch-application",
            "圓拱與實際模型",
            [("拱形圓", "$x^2+(y-k)^2=r^2$"), ("跨距", "端點在橋面上"), ("拱高", "最高點坐標已知")],
            "把圓拱、橋面與支柱長度轉成圓方程模型。",
            "跨距與拱高題通常先把橋面放在 $x$ 軸上，再設圓心在對稱軸。",
            "利用對稱性選座標系，計算會乾淨很多。",
            "忘記只取上半圓或實際長度的正值。",
            1255,
        ),
        branch(
            "s1-1-7-apollonius-circle",
            "定比距離與 Apollonius 圓",
            [("定比", "$PA=\\alpha PB$"), ("平方", "兩邊平方後整理"), ("特例", "$\\alpha\\neq1$ 時多半為圓")],
            "處理到兩定點距離成固定比的軌跡。",
            "先寫距離公式，再平方展開成一般式，最後整理成圓。",
            "若比值不是 1，最後通常會得到一個圓。",
            "平方後漏掉交叉項或比例係數乘錯。",
            1256,
        ),
        branch(
            "s1-1-7-absolute-circle-region",
            "絕對值圓形與區域面積",
            [("對稱", "|x|、|y| 先按象限拆"), ("區域", "常先畫第一象限再對稱"), ("面積", "分塊後乘對稱倍數")],
            "處理含絕對值的圓形圖形與面積題。",
            "這類題通常先拆第一象限或固定號別，再用對稱補全。",
            "先想對稱，再想積分或面積分塊，會快很多。",
            "直接把 |x|、|y| 當成普通變數而沒有分情況。", 
            1257,
        ),
    ]
    return [root, *branches]


def update_formula_db(formula_db_path: Path):
    payload = json.loads(formula_db_path.read_text(encoding="utf-8"))
    topics = payload.get("topics", [])
    local_ids = {row["id"] for row in local_topic_rows()}
    topics = [row for row in topics if row.get("id") not in local_ids]
    topics.extend(local_topic_rows())
    payload["topics"] = topics
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(topics)
    payload["meta"]["updatedAt"] = datetime.now().astimezone().isoformat()
    formula_db_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def update_question_db(question_db_path: Path, records: list[dict]):
    payload = json.loads(question_db_path.read_text(encoding="utf-8"))
    questions = [row for row in payload.get("questions", []) if row.get("chapter_code") != "s1-1-7"]
    questions.extend(records)
    payload["questions"] = questions
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(questions)
    payload["meta"]["updatedAt"] = datetime.now().astimezone().isoformat()
    question_db_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def update_preview(preview_path: Path, records: list[dict]):
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
            "chapter_code": "s1-1-7",
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(by_category),
        "by_section": by_section,
        "review_ids": [row["id"] for row in records if "needs-review" in (row.get("tags") or [])],
    }
    preview_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_review(review_path: Path, records: list[dict], png_count: int):
    review_rows = [row for row in records if "needs-review" in (row.get("tags") or [])]
    lines = [
        "# s1-1-7 Review Needed",
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
            lines.append(f"  - {row.get('review_note', '請再人工確認。')}")
    else:
        lines.append("- 目前沒有保留人工複核題。")
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已保留。",
            "- `emf/wmf` 題圖會補成 `.png` sidecar 供前端顯示。",
            "- 這章的主要分支包含定圓、外接圓、軌跡圓、Apollonius 圓與含絕對值圓形區域。",
        ]
    )
    review_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Finalize s1-1-7 pack.")
    parser.add_argument("--questions", required=True)
    parser.add_argument("--preview", required=True)
    parser.add_argument("--review", required=True)
    parser.add_argument("--asset-dir", required=True)
    parser.add_argument("--formula-db", required=True)
    parser.add_argument("--question-db", required=True)
    args = parser.parse_args()

    questions_path = Path(args.questions)
    preview_path = Path(args.preview)
    review_path = Path(args.review)
    asset_dir = Path(args.asset_dir)
    formula_db_path = Path(args.formula_db)
    question_db_path = Path(args.question_db)

    png_count = ensure_png_sidecars(asset_dir)

    payload = json.loads(questions_path.read_text(encoding="utf-8"))
    records = payload.get("questions", [])

    for row in records:
        order = int(row.get("source_order", 0) or 0)
        row["formula_id"] = FORMULA_BY_ORDER.get(order, "")
        row["question_text"] = normalize_text(row.get("question_text", ""))
        row["answer_text"] = normalize_text(row.get("answer_text", ""))
        row["explanation_text"] = normalize_text(row.get("explanation_text", ""))

        marker = extract_marker(row.get("tags") or [])
        if marker:
            row["title"] = rebuild_title(marker, row.get("question_text", ""))
        if order in TITLE_OVERRIDES:
            row["title"] = TITLE_OVERRIDES[order]
        if len(str(row.get("title", ""))) > 36:
            fallback = FALLBACK_TITLE_BY_FORMULA.get(row["formula_id"], "")
            if marker and fallback:
                row["title"] = f"{marker}：{fallback}"

        tags = [tag for tag in (row.get("tags") or []) if tag != "needs-formula-id"]
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
    payload["meta"]["finalizedBy"] = "finalize_s1_1_7_pack.py"
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
