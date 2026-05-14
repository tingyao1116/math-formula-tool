import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body


FORMULA_BY_ORDER = {
    1: "s1-1-6-coordinate-section-distance",
    2: "s1-1-6-coordinate-section-distance",
    3: "s1-1-6-coordinate-triangle-area-centers",
    4: "s1-1-6-coordinate-triangle-area-centers",
    5: "s1-1-6-coordinate-triangle-area-centers",
    6: "s1-1-6-coordinate-triangle-area-centers",
    7: "s1-1-6-slope-judgment",
    8: "s1-1-6-slope-judgment",
    9: "s1-1-6-slope-judgment",
    10: "s1-1-6-slope-collinearity-range",
    11: "s1-1-6-slope-collinearity-range",
    12: "s1-1-6-slope-collinearity-range",
    13: "s1-1-6-slope-collinearity-range",
    14: "s1-1-6-slope-collinearity-range",
    15: "s1-1-6-slope-collinearity-range",
    16: "s1-1-6-slope-collinearity-range",
    17: "s1-1-6-slope-collinearity-range",
    18: "s1-1-6-line-equation-intercept",
    19: "s1-1-6-line-equation-intercept",
    20: "s1-1-6-line-equation-intercept",
    21: "s1-1-6-line-equation-intercept",
    22: "s1-1-6-line-equation-intercept",
    23: "s1-1-6-line-equation-intercept",
    24: "s1-1-6-line-equation-intercept",
    25: "s1-1-6-line-equation-intercept",
    26: "s1-1-6-line-equation-intercept",
    27: "s1-1-6-line-equation-intercept",
    28: "s1-1-6-coordinate-geometry-comprehensive",
    29: "s1-1-6-coordinate-geometry-comprehensive",
    30: "s1-1-6-coordinate-geometry-comprehensive",
    31: "s1-1-6-point-line-distance-reflection",
    32: "s1-1-6-point-line-distance-reflection",
    33: "s1-1-6-point-line-distance-reflection",
    34: "s1-1-6-point-line-distance-reflection",
    35: "s1-1-6-point-line-distance-reflection",
    36: "s1-1-6-point-line-distance-reflection",
    37: "s1-1-6-point-line-distance-reflection",
    38: "s1-1-6-point-line-distance-reflection",
    39: "s1-1-6-point-line-distance-reflection",
    40: "s1-1-6-point-line-distance-reflection",
    41: "s1-1-6-point-line-distance-reflection",
    42: "s1-1-6-point-line-distance-reflection",
    43: "s1-1-6-point-line-distance-reflection",
    44: "s1-1-6-half-plane-side-test",
    45: "s1-1-6-half-plane-side-test",
    46: "s1-1-6-half-plane-side-test",
    47: "s1-1-6-half-plane-side-test",
    48: "s1-1-6-half-plane-side-test",
    49: "s1-1-6-half-plane-side-test",
    50: "s1-1-6-inequality-graph-feasible",
    51: "s1-1-6-inequality-graph-feasible",
    52: "s1-1-6-inequality-graph-feasible",
    53: "s1-1-6-inequality-graph-feasible",
    54: "s1-1-6-inequality-graph-feasible",
    55: "s1-1-6-inequality-graph-feasible",
    56: "s1-1-6-inequality-graph-feasible",
    57: "s1-1-6-inequality-graph-feasible",
    58: "s1-1-6-inequality-graph-feasible",
    59: "s1-1-6-inequality-lattice-area-parameter",
    60: "s1-1-6-inequality-lattice-area-parameter",
    61: "s1-1-6-inequality-lattice-area-parameter",
    62: "s1-1-6-inequality-lattice-area-parameter",
    63: "s1-1-6-inequality-lattice-area-parameter",
    64: "s1-1-6-inequality-lattice-area-parameter",
    65: "s1-1-6-inequality-lattice-area-parameter",
    66: "s1-1-6-inequality-lattice-area-parameter",
    67: "s1-1-6-inequality-lattice-area-parameter",
    68: "s1-1-6-inequality-lattice-area-parameter",
    69: "s1-1-6-inequality-lattice-area-parameter",
}


QUESTION_OVERRIDES = {
    1: "設 $A(-3,-1)$，$B(1,3)$，$P\\in\\overleftrightarrow{AB}$ 且 $P\\notin\\overline{AB}$，已知 $\\overline{AP}:\\overline{BP}=3:2$，則點 $P$ 之坐標為____________。",
    2: "坐標平面上，若 $A(-2,1)$，$B(8,6)$，$P$ 為直線 $AB$ 上的點，且滿足 $\\overline{AP}:\\overline{PB}=3:2$，求 $P$ 的坐標為____________。",
    9: "下圖中：(1) 斜率為最大的直線是____________。(2) 斜率為最小的直線是____________。\n[圖:program-db/imports/packs/s1-1-6/assets/media/image6.png]",
    13: (
        "二直線 $L_{1}: ax-6y=5a-3$，$L_{2}: 2x+(a-7)y=29-7a$。\n"
        "(1) 當 $a=$____________ 時，則 $L_{1}//L_{2}$。\n"
        "(2) 當 $a=$____________ 時，則 $L_{1}\\perp L_{2}$。"
    ),
    42: (
        "設 $A(5,-1)$，$B(0,1)$，直線 $L:x-y-2=0$。\n"
        "(1) 求 $B$ 關於 $L$ 的對稱點 $B'$ 坐標。\n"
        "(2) 求直線 $AB'$ 的方程式。\n"
        "(3) 在 $L$ 上找一點 $P$ 的坐標，使 $|\\overline{PA}-\\overline{PB}|$ 有最大值。"
    ),
    48: "設直線 $L$ 恆過點 $(0,3)$，其中 $A(-2,1)$，$B(1,2)$，則直線的斜率 $m$ 之範圍為____________。",
    54: (
        "(1) 在坐標平面上作出 $\\left\\{\\begin{array}{r}|x|+|y|\\le 4 \\\\ |x|+4|y|\\ge 4\\end{array}\\right.$ 的圖形。\n"
        "(2) 並求其面積。"
    ),
    58: (
        "試問圖中鋪色部分（包含邊界）為下列哪一個不等式組之解？\n"
        "(1) $\\left\\{\\begin{array}{r}3x\\ge y \\\\ 4x-3y\\ge 12 \\\\ 2x+3y\\le 6\\end{array}\\right.$\n"
        "(2) $\\left\\{\\begin{array}{r}3x\\ge y \\\\ 4x-3y\\le 12 \\\\ 2x+3y\\le 6\\end{array}\\right.$\n"
        "(3) $\\left\\{\\begin{array}{r}3x\\le y \\\\ 4x-3y\\ge 12 \\\\ 2x+3y\\ge 6\\end{array}\\right.$\n"
        "(4) $\\left\\{\\begin{array}{r}3x\\le y \\\\ 4x-3y\\ge 12 \\\\ 2x+3y\\le 6\\end{array}\\right.$\n"
        "(5) $\\left\\{\\begin{array}{r}3x\\le y \\\\ 4x-3y\\le 12 \\\\ 2x+3y\\ge 6\\end{array}\\right.$\n"
        "[圖:program-db/imports/packs/s1-1-6/assets/media/image48.emf]"
    ),
    68: "在直角坐標平面上，作不等式組 $\\left\\{\\begin{matrix}|4x+y|\\le 2 \\\\ |x-y|\\le 2\\end{matrix}\\right.$ 的圖形；並求其面積。",
}


TITLE_OVERRIDES = {
    1: "範例1：分點公式求外分點",
    2: "隨堂練習：分點公式求內分點",
    3: "範例2：兩點距離和為定值的軌跡",
    4: "範例3：分點與重心",
    5: "範例4：矩形第四點座標",
    6: "範例5：三角形面積行列式",
    7: "範例1：斜率與截距判斷",
    8: "範例2：由圖判斜率大小",
    9: "隨堂練習：圖形斜率判讀",
    10: "範例3：過定點直線與三角形相交",
    11: "隨堂練習：直線與菱形不相交的斜率",
    12: "範例4：平行垂直的斜率條件",
    13: "範例5：由參數判平行與垂直",
    14: "隨堂練習：參數直線的平行垂直",
    15: "範例6：三點共線求參數",
    16: "隨堂練習：表情線段的斜率和",
    17: "範例7：由圖判參數正負",
    18: "範例1：已知斜率與面積求直線",
    19: "範例2：最小截距三角形",
    20: "隨堂練習：第二象限最小截距三角形",
    21: "隨堂練習：已知斜率與面積求係數",
    22: "範例3：過定點且面積固定的直線",
    23: "隨堂練習：截距絕對值相等的直線",
    24: "範例4：平行與垂線方程式",
    25: "範例5：三直線共點條件",
    26: "隨堂練習：三直線共點求參數",
    27: "隨堂練習：直線束與共點問題",
    28: "範例6：線上等距點",
    29: "範例7：三角形五心綜合",
    30: "隨堂練習：重心與共線",
    31: "範例8：垂心座標",
    32: "範例9：點到直線距離求常數",
    33: "隨堂練習：線性條件下的距離最小值",
    34: "範例10：點到邊距離與面積",
    35: "範例11：平行線距離",
    36: "隨堂練習：與已知直線平行且定距",
    37: "範例12：直線上垂足與對稱點",
    38: "範例13：反射法求最短路徑",
    39: "範例14：距離和的最小值",
    40: "隨堂練習：距離差的最大值",
    41: "隨堂練習：線段上二次式最值",
    42: "範例15：反射法求距離差最大值",
    43: "隨堂練習：平方距離和與最短路徑",
    44: "範例1：同側判定",
    45: "隨堂練習：異側判定",
    46: "隨堂練習：半平面同側判讀",
    47: "範例2：線段與直線相交條件",
    48: "隨堂練習：過定點直線與線段相交",
    49: "隨堂練習：與線段相交的斜率範圍",
    50: "範例3：單一二元一次不等式作圖",
    51: "範例4：聯立不等式作圖",
    52: "隨堂練習：聯立不等式圖解",
    53: "隨堂練習：含乘積與夾擠不等式圖形",
    54: "範例5：絕對值不等式區域與面積",
    55: "範例6：由圖反推不等式組",
    56: "隨堂練習：點在三角形內部的參數範圍",
    57: "隨堂練習：三角形區域與參數範圍",
    58: "範例7：由圖判可行域",
    59: "範例8：格子點計數",
    60: "隨堂練習：聯立不等式的格子點",
    61: "範例9：可行域面積",
    62: "範例10：以參數平面表示相交條件",
    63: "範例11：由圖判係數正負",
    64: "範例12：三角形區域的不等式組",
    65: "隨堂練習：三直線圍成三角形的內點",
    66: "範例13：不等式組與圖形對應",
    67: "隨堂練習：不等式與圖形配對",
    68: "範例14：含絕對值的可行域面積",
    69: "隨堂練習：含絕對值的區域與面積",
}


REVIEW_OVERRIDES = {
    42: "原始題幹前置條件可能有圖片或前文遺漏，已依解析補寫，建議再對原始 Word 抽查。",
    59: "聯立不等式本身保留在題圖中，請前端確認圖片顯示是否清楚。",
    63: "題目判讀依附圖較重，建議前端確認圖片與文字一起看是否順手。",
}


FALLBACK_TITLE_BY_FORMULA = {
    "s1-1-6-coordinate-section-distance": "坐標、距離與分點",
    "s1-1-6-coordinate-triangle-area-centers": "三角形重心與面積",
    "s1-1-6-slope-judgment": "斜率與圖形判讀",
    "s1-1-6-slope-collinearity-range": "斜率、共線與範圍",
    "s1-1-6-line-equation-intercept": "直線方程式與截距",
    "s1-1-6-coordinate-geometry-comprehensive": "坐標幾何綜合",
    "s1-1-6-point-line-distance-reflection": "點到直線距離與對稱",
    "s1-1-6-half-plane-side-test": "同側異側與半平面",
    "s1-1-6-inequality-graph-feasible": "聯立不等式與可行域",
    "s1-1-6-inequality-lattice-area-parameter": "格點、面積與參數範圍",
}


VECTOR_REF_RE = re.compile(r"\[圖:\s*([^\]]+\.(?:emf|wmf))(?!\.png)\]", re.IGNORECASE)
GENERIC_IMAGE_REF_RE = re.compile(r"\[圖:\s*([^\]]+)\]", re.IGNORECASE)
SOURCE_BLOCK_RE = re.compile(r"【(?!解析[12]*】)[^】]+】")
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
            "chapter_code": "s1-1-6",
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
        "# s1-1-6 Review Needed",
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
            "- 坐標幾何與可行域題內若大量依賴圖，會保留圖片引用而不硬轉成文字。",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def update_question_db(question_db_path: Path, records: list[dict]):
    payload = json.loads(question_db_path.read_text(encoding="utf-8"))
    questions = [row for row in payload.get("questions", []) if row.get("chapter_code") != "s1-1-6"]
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
        "chapter": "直線方程式",
        "domain": "代數",
        "difficulty": "基礎",
        "chapterRole": "重點分支",
        "parentId": "s1-1-6-line-equation-core",
        "tags": ["word匯入", "題型分支", "s1-1-6", "坐標幾何：直線", "高一上"],
        "usage": [usage],
        "examples": [example],
        "tips": [tip],
        "notes": [note],
        "mistakes": [mistake],
        "contentTypes": ["教學核心", "重點公式", "題型策略", "易錯提醒"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": datetime.now().astimezone().isoformat(),
        "chapter_code": "s1-1-6",
        "gradeLabel": "高一上",
        "chapterCode": "s1-1-6",
        "section": "直線方程式",
        "domainSub": "",
        "isBranch": True,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "originalIndex": manual_order,
        "stageOrder": 2,
        "gradeOrder": 4,
        "termOrder": 1,
        "chapterOrder": 6,
        "manualOrder": manual_order,
    }


def local_topic_rows() -> list[dict]:
    root = {
        "id": "s1-1-6-line-equation-core",
        "title": "直線方程式與二元一次不等式",
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "斜率", "values": ["$m=\\frac{y_2-y_1}{x_2-x_1}$"]},
                {"label": "直線式", "values": ["$ax+by+c=0$"]},
                {"label": "距離", "values": ["$d=\\frac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}$"]},
            ],
        },
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": "直線方程式",
        "domain": "代數",
        "difficulty": "基礎",
        "chapterRole": "核心概念",
        "parentId": "",
        "tags": ["word匯入", "教學核心", "s1-1-6", "坐標幾何：直線", "高一上"],
        "usage": ["處理坐標平面中的直線、距離與半平面問題。"],
        "examples": ["$L_1//L_2\\iff m_1=m_2$，$L_1\\perp L_2\\iff m_1m_2=-1$。"],
        "tips": ["先判題目是坐標、直線，還是不等式可行域。"],
        "notes": ["本章混合坐標幾何、直線方程式與二元一次不等式。"],
        "mistakes": ["把斜率、截距、法向量混用。"],
        "contentTypes": ["教學核心", "重點公式", "題型策略", "易錯提醒"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": datetime.now().astimezone().isoformat(),
        "chapter_code": "s1-1-6",
        "gradeLabel": "高一上",
        "chapterCode": "s1-1-6",
        "section": "直線方程式",
        "domainSub": "",
        "isBranch": False,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "originalIndex": 1237,
        "stageOrder": 2,
        "gradeOrder": 4,
        "termOrder": 1,
        "chapterOrder": 6,
        "manualOrder": 1237,
    }
    branches = [
        make_branch(
            branch_id="s1-1-6-coordinate-section-distance",
            title="坐標、距離與分點",
            formula_lines=[
                ("距離", "$PQ=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$"),
                ("中點", "$M(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2})$"),
                ("分點", "$S(\\frac{nx_1+mx_2}{m+n},\\frac{ny_1+my_2}{m+n})$"),
            ],
            usage="處理兩點距離、中點、內分與外分點問題。",
            example="已知 $\\overline{AP}:\\overline{PB}=3:2$ 求分點座標。",
            tip="先判斷是內分還是外分，再代入分點公式。",
            note="對應主題 1 前半的基本坐標題。",
            mistake="把內分與外分公式的符號用反。",
            manual_order=1238,
        ),
        make_branch(
            branch_id="s1-1-6-coordinate-triangle-area-centers",
            title="三角形重心與面積",
            formula_lines=[
                ("重心", "$G(\\frac{x_1+x_2+x_3}{3},\\frac{y_1+y_2+y_3}{3})$"),
                ("面積", "$\\Delta ABC=\\frac12\\left|\\begin{matrix}x_1&x_2&x_3\\\\y_1&y_2&y_3\\end{matrix}\\right|$"),
                ("平行四邊形", "$D=(x_1+x_3-x_2,\\ y_1+y_3-y_2)$"),
            ],
            usage="處理重心、面積與簡單坐標圖形綜合問題。",
            example="由三頂點座標直接求三角形面積與重心。",
            tip="先把頂點座標整理好，再用公式整體代入。",
            note="對應主題 1 後半的三角形與矩形題。",
            mistake="面積公式忘記取絕對值或忘了乘 $\u00bd$。",
            manual_order=1239,
        ),
        make_branch(
            branch_id="s1-1-6-slope-judgment",
            title="斜率與圖形判讀",
            formula_lines=[
                ("斜率", "$m=\\frac{y_1-y_2}{x_1-x_2}$"),
                ("斜率式", "$y=mx+c$ 的斜率為 $m$"),
                ("一般式", "$ax+by+c=0$ 的斜率為 $-\\frac{a}{b}$"),
            ],
            usage="由方程式或圖形判斷斜率大小與正負。",
            example="比較多條線段的斜率大小，或由圖判最大最小斜率。",
            tip="圖形題先分正負，再比陡峭程度。",
            note="對應主題 2 前段。",
            mistake="把直線一般式的斜率誤寫成 $-\\frac{b}{a}$。",
            manual_order=1240,
        ),
        make_branch(
            branch_id="s1-1-6-slope-collinearity-range",
            title="斜率、共線與範圍",
            formula_lines=[
                ("平行", "$L_1//L_2\\iff m_1=m_2$"),
                ("垂直", "$L_1\\perp L_2\\iff m_1m_2=-1$"),
                ("共線", "三點共線可用斜率相等判定"),
            ],
            usage="處理參數直線、共線、交三角形與斜率範圍題。",
            example="直線與三角形相交時，常轉成過定點的斜率範圍。",
            tip="先找定點或極端邊界線，再比較斜率。",
            note="對應主題 2 後段的參數與應用題。",
            mistake="忘記鉛直線斜率不存在，仍硬套乘積為 −1。",
            manual_order=1241,
        ),
        make_branch(
            branch_id="s1-1-6-line-equation-intercept",
            title="直線方程式與截距",
            formula_lines=[
                ("點斜式", "$y-y_0=m(x-x_0)$"),
                ("兩點式", "$\\frac{y-y_1}{x-x_1}=\\frac{y_2-y_1}{x_2-x_1}$"),
                ("截距式", "$\\frac{x}{a}+\\frac{y}{b}=1$"),
            ],
            usage="處理過定點、截距、面積與直線束問題。",
            example="已知斜率與截距三角形面積求直線方程式。",
            tip="遇到和兩軸圍面積時，優先想截距式。",
            note="對應主題 3 前段。",
            mistake="只找到一條直線，漏掉符號不同的另一條可能解。",
            manual_order=1242,
        ),
        make_branch(
            branch_id="s1-1-6-coordinate-geometry-comprehensive",
            title="坐標幾何綜合",
            formula_lines=[
                ("五心", "重心、垂心、外心可由方程式或幾何條件求"),
                ("等距", "$PA=PB$ 可轉成垂直平分線"),
                ("共線", "交點可由聯立直線方程式求出"),
            ],
            usage="處理三角形五心、等距點與綜合坐標幾何題。",
            example="由三邊方程式求三角形的重心、垂心與外心。",
            tip="先把邊線或垂直平分線方程式寫出來，再聯立。",
            note="這些題通常不只一個公式，重在串聯。",
            mistake="把邊的斜率和高的斜率混淆。",
            manual_order=1243,
        ),
        make_branch(
            branch_id="s1-1-6-point-line-distance-reflection",
            title="點到直線距離與對稱",
            formula_lines=[
                ("點到線距離", "$d=\\frac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}$"),
                ("對稱點", "先求垂足或中點，再反推對稱點"),
                ("反射法", "最短路徑常改作對稱點後連線"),
            ],
            usage="處理點到直線距離、對稱點、最短路徑與最值問題。",
            example="在線上找點 $P$，使 $PA+PB$ 最小或 $|PA-PB|$ 最大。",
            tip="同側求和最小、異側求差最大時，先畫對稱點。",
            note="對應主題 3 中後段。",
            mistake="反射後仍直接用原點計算，沒有改成對稱點。",
            manual_order=1244,
        ),
        make_branch(
            branch_id="s1-1-6-half-plane-side-test",
            title="同側異側與半平面",
            formula_lines=[
                ("同側", "$(ax_1+by_1+c)(ax_2+by_2+c)>0$"),
                ("異側", "$(ax_1+by_1+c)(ax_2+by_2+c)<0$"),
                ("線段相交", "端點異側或在線上表示有交點"),
            ],
            usage="判斷兩點是否同側、異側，或直線是否與線段相交。",
            example="由兩端點代入直線式，決定參數範圍。",
            tip="不要急著畫圖，先做代點乘積判號。",
            note="對應主題 4 開頭。",
            mistake="把乘積 = 0 的邊界情況漏掉。",
            manual_order=1245,
        ),
        make_branch(
            branch_id="s1-1-6-inequality-graph-feasible",
            title="聯立不等式與可行域",
            formula_lines=[
                ("半平面", "$ax+by+c\\gtrless 0$ 對應某一側半平面"),
                ("聯立", "多條直線交集形成可行域"),
                ("絕對值", "$|u|\\le k$ 常拆成 $-k\\le u\\le k$"),
            ],
            usage="作二元一次不等式圖形、判斷可行域與從圖反推不等式組。",
            example="由著色區域判斷每條邊界線的左右側。",
            tip="每畫一條邊界線後，用測試點決定保留哪一側。",
            note="對應主題 4 中段。",
            mistake="邊界是否包含沒有跟不等號嚴格/非嚴格同步。",
            manual_order=1246,
        ),
        make_branch(
            branch_id="s1-1-6-inequality-lattice-area-parameter",
            title="格點、面積與參數範圍",
            formula_lines=[
                ("格點", "按列或按行分層計數"),
                ("面積", "可拆成三角形、平行四邊形或多邊形面積"),
                ("參數", "把點代入區域不等式組求參數範圍"),
            ],
            usage="處理格子點個數、可行域面積與參數平面問題。",
            example="先畫出區域，再逐列數整點或找頂點算面積。",
            tip="複雜區域先找頂點座標，再決定要分割還是列表。",
            note="對應主題 4 後段。",
            mistake="只看圖大致估計，沒有把邊界與整點條件分開處理。",
            manual_order=1247,
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


def main():
    parser = argparse.ArgumentParser(description="Finalize s1-1-6 pack.")
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
        tags = [tag for tag in (row.get("tags") or []) if tag != "needs-formula-id"]

        if order in QUESTION_OVERRIDES:
            row["question_text"] = QUESTION_OVERRIDES[order]

        row["question_text"] = clean_question_body(strip_source_blocks(normalize_image_paths(row.get("question_text", ""))))
        row["answer_text"] = clean_question_body(strip_source_blocks(normalize_image_paths(row.get("answer_text", ""))))
        row["explanation_text"] = clean_question_body(strip_source_blocks(normalize_image_paths(row.get("explanation_text", ""))))
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
    payload["meta"]["finalizedBy"] = "finalize_s1_1_6_pack.py"
    payload.setdefault("summary", {})
    payload["summary"]["image_references"] = sorted(
        {
            re.sub(r"^\[圖:|\]$", "", normalize_image_paths(f"[圖:{path}]"))
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
