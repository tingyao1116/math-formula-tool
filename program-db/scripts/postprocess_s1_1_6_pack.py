import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from question_data_utils import clean_question_body


QUESTION_OVERRIDES = {
    1: "設 $A(-3,-1)$，$B(1,3)$，$P\\in\\overleftrightarrow{AB}$ 且 $P\\notin\\overline{AB}$，已知 $\\overline{AP}:\\overline{BP}=3:2$，則點 $P$ 之坐標為____________。",
    59: (
        "在坐標平面上，滿足聯立不等式\n"
        "[圖:program-db/imports/packs/s1-1-6/assets/media/image49.wmf.png] 的格子點共有____________個。\n"
        "[圖:program-db/imports/packs/s1-1-6/assets/media/image50.jpeg]"
    ),
    69: (
        "試作不等式 $|x|\\le y\\le 11-|x-6|$ 的圖形，並求其面積。\n"
        "[圖:program-db/imports/packs/s1-1-6/assets/media/image65.wmf.png]\n"
        "[圖:program-db/imports/packs/s1-1-6/assets/media/image64.png]"
    ),
}


EXPLANATION_OVERRIDES = {
    54: (
        "【解析】(1)兩圖形均與 $x$ 軸、$y$ 軸成對稱，先作 $x\\ge 0$、$y\\ge 0$ 之圖形\n"
        "$\\left\\{ \\begin{array}{r} x+y\\le 4 \\\\ x+4y\\ge 4 \\end{array} \\right.$，"
        "為圖形中 $A$ 區域，故 "
        "$\\left\\{ \\begin{array}{r} |x|+|y|\\le 4 \\\\ |x|+4|y|\\ge 4 \\end{array} \\right.$ "
        "的圖形為圖中整個鋪色區域。\n"
        "(2)面積為 "
        "$\\frac{1}{2}\\times 8\\times 8-\\frac{1}{2}\\times 8\\times 2=24$。"
    ),
    68: (
        "【解析】"
        "$\\left\\{ \\begin{matrix} |4x+y|\\le 2 \\\\ |x-y|\\le 2 \\end{matrix} \\right.$ "
        "⇒ "
        "$\\left\\{ \\begin{matrix} -2\\le 4x+y\\le 2 \\\\ -2\\le x-y\\le 2 \\end{matrix} \\right.$。\n"
        "圖形為平行四邊形區域，面積分成二個三角形計算得 "
        "$2\\times\\frac{1}{2}(2+2)\\times\\frac{4}{5}=\\frac{16}{5}$。"
    ),
    59: (
        "【解析】如圖統計格子點：\n"
        "$y=0$ 時，$x=2\\sim 8$，共 $7$ 個；\n"
        "$y=1$ 時，$x=1\\sim 6$，共 $6$ 個；\n"
        "$y=2$ 時，$x=0\\sim 5$，共 $6$ 個；\n"
        "$y=3$ 時，$x=0\\sim 3$，共 $4$ 個；\n"
        "$y=4$ 時，$x=0\\sim 1$，共 $2$ 個；\n"
        "$y=5$ 時，$x=0$，共 $1$ 個。\n"
        "所以共有 $7+6+6+4+2+1=26$ 個格子點。"
    ),
    69: (
        "【解析】$|x|\\le y\\le 11-|x-6|$\n"
        "⇒ $\\left\\{ \\begin{matrix} |x|\\le y \\\\ y\\le 11-|x-6| \\end{matrix} \\right.$\n"
        "⇒ $\\left\\{ \\begin{matrix} -y\\le x\\le y \\\\ y\\le x+5,\\ x<6 \\\\ y\\le -x+17,\\ x\\ge 6 \\end{matrix} \\right.$。\n"
        "如圖可得頂點為 $(0,0)$、$\\left(\\frac{17}{2},\\frac{17}{2}\\right)$、$(6,11)$、"
        "$\\left(-\\frac{5}{2},\\frac{5}{2}\\right)$，故面積為 "
        "$\\frac{1}{2}\\left|0-0+\\frac{187}{2}-51+15+\\frac{55}{2}+0-0\\right|=\\frac{85}{2}$。"
    ),
}


REVIEW_NOTES = {
    42: "題幹前文依解析補回 A、B 與直線 L，建議之後再用原始 Word 對一次符號與敘述。",
    59: "聯立不等式本體主要在題圖中，這題建議以前端畫面確認圖片大小與清晰度。",
    63: "題意高度依賴附圖上的半平面與係數標示，建議以前端畫面再核對一次判讀體驗。",
}


def normalize_text(text: str) -> str:
    value = str(text or "")
    replacements = {
        "/ otin": "\\notin ",
        "| x |": "|x|",
        "| x - 6 |": "|x-6|",
        "x| + |y|": "|x|+|y|",
        "x| + 4|y|": "|x|+4|y|",
        "4x + y|": "|4x+y|",
        "x - y|": "|x-y|",
        "x| \\leq y": "|x| \\leq y",
        "11 - |x - 6": "11-|x-6|",
        "x軸﹐y軸": "$x$軸、$y$軸",
        "﹐": "，",
        "﹒": "。",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return clean_question_body(value).strip()


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
            "chapter_code": "s1-1-6",
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(by_category),
        "by_section": by_section,
        "review_ids": [row["id"] for row in records if "needs-review" in (row.get("tags") or [])],
    }
    preview_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_review(review_path: Path, records: list[dict]):
    review_rows = [row for row in records if "needs-review" in (row.get("tags") or [])]
    lines = [
        "# s1-1-6 Review Needed",
        "",
        "## Current extraction status",
        "",
        f"- Parsed question records: {len(records)}",
        f"- Assigned `formula_id`: {sum(1 for row in records if row.get('formula_id'))}",
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
            "- `emf/wmf` 題圖已轉成 `.png` sidecar 供前端顯示。",
            "- 圖片依賴較高的題目保留 review 標記，避免過度猜補原題。",
        ]
    )
    review_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def update_question_db(question_db_path: Path, records: list[dict]):
    payload = json.loads(question_db_path.read_text(encoding="utf-8"))
    questions = [row for row in payload.get("questions", []) if row.get("chapter_code") != "s1-1-6"]
    questions.extend(records)
    payload["questions"] = questions
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(questions)
    payload["meta"]["updatedAt"] = datetime.now().astimezone().isoformat()
    question_db_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Post-process s1-1-6 pack.")
    parser.add_argument("--questions", required=True)
    parser.add_argument("--preview", required=True)
    parser.add_argument("--review", required=True)
    parser.add_argument("--question-db", required=True)
    args = parser.parse_args()

    questions_path = Path(args.questions)
    preview_path = Path(args.preview)
    review_path = Path(args.review)
    question_db_path = Path(args.question_db)

    payload = json.loads(questions_path.read_text(encoding="utf-8"))
    records = payload.get("questions", [])

    for row in records:
        order = int(row.get("source_order", 0) or 0)
        if order in QUESTION_OVERRIDES:
            row["question_text"] = QUESTION_OVERRIDES[order]
        if order in EXPLANATION_OVERRIDES:
            row["explanation_text"] = EXPLANATION_OVERRIDES[order]

        row["question_text"] = normalize_text(row.get("question_text", ""))
        row["answer_text"] = normalize_text(row.get("answer_text", ""))
        row["explanation_text"] = normalize_text(row.get("explanation_text", ""))

        if order in REVIEW_NOTES:
            row["review_note"] = REVIEW_NOTES[order]
            tags = [tag for tag in (row.get("tags") or []) if tag != "needs-formula-id"]
            if "needs-review" not in tags:
                tags.append("needs-review")
            row["tags"] = tags

    payload.setdefault("meta", {})
    payload["meta"]["postprocessed"] = True
    payload["meta"]["postprocessedBy"] = "postprocess_s1_1_6_pack.py"
    questions_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    update_preview(preview_path, records)
    write_review(review_path, records)
    update_question_db(question_db_path, records)

    print(f"records={len(records)}")
    print(f"review={sum(1 for row in records if 'needs-review' in (row.get('tags') or []))}")


if __name__ == "__main__":
    main()
