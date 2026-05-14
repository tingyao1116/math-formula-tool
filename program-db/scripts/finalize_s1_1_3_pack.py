import argparse
import json
import re
from collections import Counter
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body


FORMULA_BY_ORDER = {
    1: "senior-multiplication-identities-expansion-s113",
    2: "senior-multiplication-identities-expansion-s113",
    3: "senior-multiplication-identities-expansion-s113",
    4: "senior-expression-substitution-evaluation",
    5: "senior-reciprocal-power-identities",
    6: "senior-reciprocal-power-identities",
    7: "senior-high-degree-factorization-patterns",
    8: "senior-cube-sum-difference-factorization",
    9: "senior-cube-sum-difference-factorization",
    10: "senior-high-degree-factorization-patterns",
    11: "senior-expression-substitution-evaluation",
    12: "senior-expression-substitution-evaluation",
    13: "senior-reciprocal-power-identities",
    14: "senior-rational-expression-operations-s113",
    15: "senior-rational-expression-operations-s113",
    16: "senior-rational-expression-operations-s113",
    17: "senior-radical-operations-rationalization-s113",
    18: "senior-radical-operations-rationalization-s113",
    19: "senior-radical-operations-rationalization-s113",
    20: "senior-radical-operations-rationalization-s113",
    21: "senior-radical-estimation-comparison-s113",
    22: "senior-radical-estimation-comparison-s113",
    23: "senior-radical-operations-rationalization-s113",
    24: "senior-radical-operations-rationalization-s113",
    25: "senior-radical-operations-rationalization-s113",
    26: "senior-radical-operations-rationalization-s113",
    27: "senior-radical-operations-rationalization-s113",
    28: "senior-radical-operations-rationalization-s113",
    29: "senior-radical-estimation-comparison-s113",
    30: "senior-radical-estimation-comparison-s113",
    31: "senior-radical-estimation-comparison-s113",
    32: "senior-radical-estimation-comparison-s113",
    33: "senior-radical-estimation-comparison-s113",
    34: "senior-radical-estimation-comparison-s113",
    35: "senior-arithmetic-geometric-mean-s113",
    36: "senior-arithmetic-geometric-mean-s113",
    37: "senior-arithmetic-geometric-mean-s113",
    38: "senior-arithmetic-geometric-mean-s113",
    39: "senior-arithmetic-geometric-mean-s113",
    40: "senior-arithmetic-geometric-mean-s113",
    41: "senior-arithmetic-geometric-mean-s113",
    42: "senior-arithmetic-geometric-mean-s113",
    43: "senior-arithmetic-geometric-mean-s113",
}


QUESTION_OVERRIDES = {
    31: "試比較a=$\\sqrt{5} + \\sqrt{10}$，b=$\\sqrt{6} + 3$，c=$\\sqrt{7} + 2\\sqrt{2}$之大小關係。",
    35: (
        "(1)設a﹐b是正實數﹐試證：$\\frac{a + b}{2} \\geq \\sqrt{ab} \\geq \\frac{2ab}{a + b}$﹒\n"
        "(2)設a，b ≥ 0且a＋2b＝8，則ab之最大值為____________，此時a＝____________，b＝____________。\n"
        "(3)設a，b＞0且ab＝25，則$\\frac{4}{a}$＋$\\frac{9}{b}$的最小值為____________，此時a＝____________，b＝____________。"
    ),
    36: "設a，b ≥ 0且2a＋3b＝10，則ab之最大值為____________，此時a＝____________，b＝____________。",
    37: "設a，b＞0且ab＝9，則$\\frac{1}{a}$＋$\\frac{4}{b}$的最小值為____________，此時a＝____________，b＝____________。",
    41: "用一條長度60公尺的繩子在河邊圍成一矩形菜圃﹐且河邊不圍繩﹐則其可圍成的面積之最大值為____________平方公尺﹒\n[圖:program-db/imports/packs/s1-1-3/assets/media/image3.png]",
    42: "一農夫想用長65公尺之竹籬圍成一長方形菜圃﹐並在其中兩邊各留著寬1公尺及2公尺的出入口﹐如圖所示﹒此農夫所能圍成的最大面積為____________平方公尺﹒",
}


EXPLANATION_OVERRIDES = {
    20: (
        "【解析】(1)$\\sqrt{\\frac{1}{3}} + \\sqrt{\\frac{1}{27}} - \\sqrt{\\frac{1}{48}}"
        " = \\frac{1}{\\sqrt{3}} + \\frac{1}{3\\sqrt{3}} - \\frac{1}{4\\sqrt{3}}"
        " = \\frac{\\sqrt{3}}{3} + \\frac{\\sqrt{3}}{9} - \\frac{\\sqrt{3}}{12}"
        " = (\\frac{1}{3} + \\frac{1}{9} - \\frac{1}{12})\\sqrt{3} = \\frac{13}{36}\\sqrt{3}$\n"
        "(2)$\\frac{\\sqrt{5} - \\sqrt{3}}{\\sqrt{5} + \\sqrt{3}}"
        " = \\frac{(\\sqrt{5} - \\sqrt{3})^{2}}{(\\sqrt{5} + \\sqrt{3})(\\sqrt{5} - \\sqrt{3})}"
        " = \\frac{5 - 2\\sqrt{15} + 3}{5 - 3} = 4 - \\sqrt{15}$\n"
        "(3)$\\frac{2}{\\sqrt{7} - \\sqrt{5}} - \\frac{4}{\\sqrt{7} + \\sqrt{5}}"
        " = \\frac{2(\\sqrt{7} + \\sqrt{5})}{7 - 5} - \\frac{4(\\sqrt{7} - \\sqrt{5})}{7 - 5}"
        " = \\sqrt{7} + \\sqrt{5} - 2(\\sqrt{7} - \\sqrt{5}) = -\\sqrt{7} + 3\\sqrt{5}$\n"
        "(4)$\\sqrt{\\frac{11}{7}} + \\sqrt{\\frac{7}{11}} + \\frac{\\sqrt{11} + \\sqrt{7}}{\\sqrt{11} - \\sqrt{7}}"
        " = \\frac{\\sqrt{77}}{7} + \\frac{\\sqrt{77}}{11} + \\frac{(\\sqrt{11} + \\sqrt{7})^{2}}{11 - 7}"
        " = \\frac{\\sqrt{77}}{7} + \\frac{\\sqrt{77}}{11} + \\frac{11 + 2\\sqrt{77} + 7}{4}"
        " = \\frac{113}{154}\\sqrt{77} + \\frac{9}{2}$"
    ),
    31: (
        "【解析】$a^{2} = (\\sqrt{5} + \\sqrt{10})^{2} = 15 + 2\\sqrt{50}$，"
        "$b^{2} = (\\sqrt{6} + 3)^{2} = 15 + 2\\sqrt{54}$，"
        "$c^{2} = (\\sqrt{7} + 2\\sqrt{2})^{2} = 15 + 2\\sqrt{56}$。\n"
        "因為$\\sqrt{56} > \\sqrt{54} > \\sqrt{50}$，所以$c^{2} > b^{2} > a^{2}$，故$c > b > a$。"
    ),
    38: (
        "【解析】(1)$\\frac{2a + 3b}{2} \\geq \\sqrt{(2a)(3b)}"
        " \\Rightarrow \\frac{6}{2} \\geq \\sqrt{6ab}"
        " \\Rightarrow 9 \\geq 6ab"
        " \\Rightarrow ab \\leq \\frac{3}{2}$，故$ab$的最大值為$\\frac{3}{2}$。\n"
        "(2)$\\frac{3a + 2b}{2} \\geq \\sqrt{(3a)(2b)}"
        " = \\sqrt{6ab} = \\sqrt{6 \\times 6} = 6"
        " \\Rightarrow 3a + 2b \\geq 12$，故$3a + 2b$的最小值為12。"
    ),
}


VECTOR_REF_RE = re.compile(r"\[圖:([^\]]+\.(?:emf|wmf))\]", re.IGNORECASE)
VECTOR_PATH_RE = re.compile(r"([A-Za-z0-9_./\\-]+\.(?:emf|wmf))(?!\.png)", re.IGNORECASE)


def normalize_vector_refs(text: str) -> str:
    updated = str(text or "")
    updated = re.sub(r"(?i)\.(emf|wmf)(?:\.png)+", r".\1.png", updated)
    updated = VECTOR_REF_RE.sub(lambda m: f"[圖:{m.group(1)}.png]", updated)
    updated = VECTOR_PATH_RE.sub(lambda m: f"{m.group(1)}.png", updated)
    return updated


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


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：:。﹒")
    return f"{marker}：{seed[:28]}" if seed else marker


def extract_marker(tags: list[str]) -> str:
    for tag in tags or []:
        if str(tag).startswith("marker:"):
            return str(tag).split(":", 1)[1].strip()
    return ""


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
            "chapter_code": "s1-1-3",
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(by_category),
        "by_section": by_section,
        "review_ids": [row["id"] for row in records if "needs-review" in (row.get("tags") or [])],
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_review(path: Path, records: list[dict], png_count: int):
    lines = [
        "# s1-1-3 Review Needed",
        "",
        "## Current extraction status",
        "",
        f"- Parsed question records: {len(records)}",
        f"- Assigned `formula_id`: {sum(1 for row in records if row.get('formula_id'))}",
        f"- PNG sidecars created this run: {png_count}",
        f"- Needs manual review: {sum(1 for row in records if 'needs-review' in (row.get('tags') or []))}",
        "",
        "## Manual review items",
        "",
    ]
    review_rows = [row for row in records if "needs-review" in (row.get("tags") or [])]
    if review_rows:
        for row in review_rows:
            lines.append(f"- `{row['id']}`")
            lines.append(f"  - {row.get('review_note', '待人工確認')}")
    else:
        lines.append("- 目前沒有保留人工確認項。")
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已保留。",
            "- 缺失或顯示異常的數學段落已在 finalize 階段改寫。",
            "- `emf/wmf` 連結已改成對應 `.png` 供前端顯示。",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Finalize s1-1-3 pack.")
    parser.add_argument("--questions", required=True)
    parser.add_argument("--preview", required=True)
    parser.add_argument("--review", required=True)
    parser.add_argument("--asset-dir", required=True)
    args = parser.parse_args()

    questions_path = Path(args.questions)
    preview_path = Path(args.preview)
    review_path = Path(args.review)
    asset_dir = Path(args.asset_dir)

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

        row["question_text"] = clean_question_body(normalize_vector_refs(row.get("question_text", "")))
        row["answer_text"] = clean_question_body(normalize_vector_refs(row.get("answer_text", "")))
        row["explanation_text"] = clean_question_body(normalize_vector_refs(row.get("explanation_text", "")))

        row["formula_id"] = FORMULA_BY_ORDER.get(order, "")

        marker = extract_marker(row.get("tags") or [])
        if marker:
            row["title"] = rebuild_title(marker, row.get("question_text", ""))

        if order == 42:
            if "needs-review" not in tags:
                tags.append("needs-review")
            row["review_note"] = "題幹中的數字由解答反推補寫，建議再對原始 Word 校對一次。"
        else:
            tags = [tag for tag in tags if tag != "needs-review"]
            row.pop("review_note", None)

        row["tags"] = tags

    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(records)
    payload["meta"]["finalized"] = True
    payload["meta"]["finalizedBy"] = "finalize_s1_1_3_pack.py"
    payload["summary"]["image_references"] = [
        normalize_vector_refs(f"[圖:{path}]")[3:-1]
        for path in payload.get("summary", {}).get("image_references", [])
    ]

    questions_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    update_preview(preview_path, records)
    write_review(review_path, records, png_count)

    print(f"records={len(records)}")
    print(f"assigned={sum(1 for row in records if row.get('formula_id'))}")
    print(f"review={sum(1 for row in records if 'needs-review' in (row.get('tags') or []))}")


if __name__ == "__main__":
    main()
