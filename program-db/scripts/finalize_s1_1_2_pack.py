import argparse
import json
import re
from collections import Counter
from pathlib import Path

from question_data_utils import clean_question_body


FORMULA_IDS = {
    "definition": "absolute-value-definition-properties-high-school",
    "distance": "absolute-value-distance-view-high-school",
    "removal": "absolute-value-removal",
    "simplify": "absolute-value-symbolic-simplification-high-school",
    "equation_inequality": "absolute-value-equation-inequality-high-school",
    "graph_min": "absolute-value-function-graph-high-school",
    "parameter": "absolute-value-parameter-range-high-school",
    "core": "s1-1-2-absolute-value-core",
}


ORDER_OVERRIDES = {
    4: "simplify",
    7: "equation_inequality",
    13: "equation_inequality",
    14: "equation_inequality",
    31: "parameter",
    34: "parameter",
}


VECTOR_REF_RE = re.compile(r"(\[圖:\s*([^\]]+\.(?:emf|wmf))(?!\.png)\])", re.IGNORECASE)
VECTOR_PATH_RE = re.compile(r"([A-Za-z0-9_./\\-]+\.(?:emf|wmf))(?!\.png)", re.IGNORECASE)


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", "", (text or "").replace("離", "離"))


def maybe_png_sidecar(path_text: str, workspace_root: Path) -> str:
    candidate = Path(path_text.replace("\\", "/"))
    absolute = candidate if candidate.is_absolute() else (workspace_root / candidate)
    png_path = absolute.with_name(absolute.name + ".png")
    if png_path.exists():
        try:
            return png_path.relative_to(workspace_root).as_posix()
        except ValueError:
            pass
        if absolute.is_absolute():
            return png_path.as_posix()
        return png_path.relative_to(workspace_root).as_posix()
    return candidate.as_posix()


def rewrite_vector_refs(text: str, workspace_root: Path) -> str:
    updated = text or ""
    updated = re.sub(r"(?i)\.(emf|wmf)(?:\.png)+", r".\1.png", updated)
    updated = re.sub(r"(?i)\.png(?:\.png)+", ".png", updated)

    def replace_tag(match: re.Match[str]) -> str:
        whole = match.group(1)
        raw_path = match.group(2)
        return whole.replace(raw_path.replace("\\", "/"), maybe_png_sidecar(raw_path, workspace_root))

    updated = VECTOR_REF_RE.sub(replace_tag, updated)

    def replace_path(match: re.Match[str]) -> str:
        raw_path = match.group(1)
        return maybe_png_sidecar(raw_path, workspace_root)

    updated = VECTOR_PATH_RE.sub(replace_path, updated)
    root_posix = workspace_root.as_posix().rstrip("/")
    root_windows = str(workspace_root).rstrip("\\")
    updated = updated.replace(root_posix + "/", "")
    updated = updated.replace(root_windows + "\\", "")
    updated = updated.replace(root_windows.replace("\\", "/") + "/", "")
    return updated


def classify_formula(question_text: str, explanation_text: str, source_order: int) -> tuple[str, str]:
    blob = normalize_text(f"{question_text}\n{explanation_text}")

    override = ORDER_OVERRIDES.get(source_order)
    if override:
        return FORMULA_IDS[override], "high"

    if any(key in blob for key in ["|a|>|b|", "|a−2|+3|b+5|", "基本性質", "|a|^2=a^2", "|a+b|≤|a|+|b|", "ab≥0"]):
        return FORMULA_IDS["definition"], "high"

    if any(key in blob for key in ["最小整數k", "最小k值", "充分條件", "若|ax", "若實數x滿足", "解為x>", "解為−2≤x≤5", "求a，b之值", "a+b=", "ax+1|≤b之解為", "ax+2|>b的解為"]):
        return FORMULA_IDS["parameter"], "high"

    if any(key in blob for key in ["最小值", "電路線長", "l=|", "y=|x−5|+|x+3|", "基本費不超過", "最短"]):
        return FORMULA_IDS["graph_min"], "high"

    if any(key in blob for key in ["解下列各式", "解下列各不等式", "不等式", "|x−2|<6", "|x|>3", "聯立不等式", "解方程式", "解集合", "≤|", "<|", ">|", "|2x+5|+|2x−1|=6", "|x+1|+|2x−3|=4", "|x−1|+|x−2|=5", "整數x共有幾個", "0.8x=100+0.7|x−100|"]):
        return FORMULA_IDS["equation_inequality"], "high"

    if any(key in blob for key in ["化簡", "√(a^2", "√{a^2", "sqrt{(x+y", "sqrt{(y+4)", "x+y−6", "x−y+8", "2x+7", "|2x+9|−|x+8|+|x+y−10|"]):
        return FORMULA_IDS["simplify"], "high"

    if any(key in blob for key in ["距離a村4公里", "距離b村3.2公里", "公路", "村", "公車站牌", "紅色警戒", "紅色路段", "|x−8|≤4", "|x−13|≤3.2", "坐標平面上的原點o", "aa'+bb'", "距離的2倍加上"]):
        return FORMULA_IDS["distance"], "high"

    if any(key in blob for key in ["|x+y−15|", "|x+1|+|x−2|", "|2x+1|+|x−3|", "|2x+1|+|x−3|=5", "|x−3|+|x+8|"]):
        return FORMULA_IDS["removal"], "medium"

    if source_order <= 2:
        return FORMULA_IDS["core"], "medium"

    return "", "low"


def update_preview(preview_path: Path, records: list[dict]):
    by_category = Counter(record.get("question_category", "") for record in records)
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

    preview = {
        "meta": {
            "chapter_code": "s1-1-2",
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(by_category),
        "by_section": by_section,
        "review_ids": [row["id"] for row in records if "needs-review" in (row.get("tags") or [])],
    }
    preview_path.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")


def write_review(review_path: Path, records: list[dict], image_updates: int):
    comprehensive = [row for row in records if row.get("question_category") == "綜合"]
    review = [row for row in records if "needs-review" in (row.get("tags") or [])]
    lines = [
        "# s1-1-2 Review Needed",
        "",
        "## Current extraction status",
        "",
        f"- Parsed question records: {len(records)}",
        f"- Assigned `formula_id`: {sum(1 for row in records if row.get('formula_id'))}",
        f"- Left as chapter-level `綜合`: {len(comprehensive)}",
        f"- PNG image reference rewrites applied: {image_updates}",
        "",
        "## Manual review items",
        "",
    ]
    if review:
        for row in review:
            lines.append(f"- `{row['id']}`")
            lines.append(f"  - {row.get('review_note', '需要回頭核對原始 Word。')}")
    else:
        lines.append("- 目前沒有必須人工修正的題目，但仍建議抽查含圖題與參數題。")

    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 的原則已保留。",
            "- 能高信心判定到絕對值分支的題目已掛上對應 `formula_id`。",
            "- 其餘若只確定屬於本章、但無法穩定判到分支，會改放章節級 `綜合`。",
            "- `emf/wmf` 圖片引用已改寫成 `.png` 伴生檔，方便前端顯示。",
        ]
    )
    review_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def update_markdown(markdown_path: Path, workspace_root: Path) -> int:
    original = markdown_path.read_text(encoding="utf-8")
    updated = rewrite_vector_refs(original, workspace_root)
    if updated != original:
        markdown_path.write_text(updated, encoding="utf-8")
        return 1
    return 0


def extract_marker(tags: list[str]) -> str:
    for tag in tags or []:
        if str(tag).startswith("marker:"):
            return str(tag).split(":", 1)[1].strip()
    return ""


def rebuild_title(row: dict) -> str:
    marker = extract_marker(row.get("tags") or [])
    question_text = clean_question_body(row.get("question_text", ""))
    seed = re.sub(r"\[圖:\s*[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：:。﹒")
    if not marker:
        return seed[:28] if seed else row.get("title", "")
    if not seed:
        return marker
    return f"{marker}：{seed[:28]}"


def main():
    parser = argparse.ArgumentParser(description="Finalize formula assignment for s1-1-2 pack.")
    parser.add_argument("--questions", required=True)
    parser.add_argument("--preview", required=True)
    parser.add_argument("--markdown", required=True)
    parser.add_argument("--review", required=True)
    parser.add_argument("--workspace-root", required=True)
    args = parser.parse_args()

    workspace_root = Path(args.workspace_root)
    questions_path = Path(args.questions)
    preview_path = Path(args.preview)
    markdown_path = Path(args.markdown)
    review_path = Path(args.review)

    payload = json.loads(questions_path.read_text(encoding="utf-8"))
    records = payload.get("questions", [])

    image_updates = update_markdown(markdown_path, workspace_root)

    for row in records:
        default_category = "重要" if "marker:隨堂練習" in (row.get("tags") or []) else "基本"
        row["question_text"] = clean_question_body(
            rewrite_vector_refs(row.get("question_text", ""), workspace_root)
        )
        row["answer_text"] = clean_question_body(
            rewrite_vector_refs(row.get("answer_text", ""), workspace_root)
        )
        row["explanation_text"] = clean_question_body(
            rewrite_vector_refs(row.get("explanation_text", ""), workspace_root)
        )
        row["title"] = rebuild_title(row)

        formula_id, confidence = classify_formula(
            row.get("question_text", ""),
            row.get("explanation_text", ""),
            int(row.get("source_order", 0) or 0),
        )

        tags = list(row.get("tags") or [])
        if formula_id:
            row["formula_id"] = formula_id
            row["question_category"] = default_category
            tags = [tag for tag in tags if tag not in {"needs-formula-id", "chapter-comprehensive"}]
        else:
            row["formula_id"] = ""
            row["question_category"] = "綜合"
            tags = [tag for tag in tags if tag != "needs-formula-id"]
            if "chapter-comprehensive" not in tags:
                tags.append("chapter-comprehensive")

        if confidence == "low":
            if "needs-review" not in tags:
                tags.append("needs-review")
            row["review_note"] = "分支判定信心不足，先放章節綜合。"
        else:
            tags = [tag for tag in tags if tag != "needs-review"]
            row.pop("review_note", None)

        row["tags"] = tags

    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(records)
    payload["meta"]["finalized"] = True
    payload["meta"]["finalizedBy"] = "finalize_s1_1_2_pack.py"
    payload["summary"]["image_references"] = [
        rewrite_vector_refs(f"[圖: {path}]", workspace_root)[4:-1]
        for path in payload.get("summary", {}).get("image_references", [])
    ]
    questions_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    update_preview(preview_path, records)
    write_review(review_path, records, image_updates)

    assigned = sum(1 for row in records if row.get("formula_id"))
    review_count = sum(1 for row in records if "needs-review" in (row.get("tags") or []))
    print(f"records={len(records)}")
    print(f"assigned={assigned}")
    print(f"review={review_count}")


if __name__ == "__main__":
    main()
