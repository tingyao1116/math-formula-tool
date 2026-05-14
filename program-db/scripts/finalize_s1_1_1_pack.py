import argparse
import json
from collections import Counter
from pathlib import Path


SECTION_DEFAULTS = {
    "主題1：有理數的定義與性質": "senior-rational-number-definition",
    "主題2：無理數": "senior-irrational-number-basics",
    "主題3實數與數線": "senior-real-line-interval-notation",
    "主題4：距離與分點公式": "senior-distance-midpoint-section-formulas",
}


ORDER_RULES = {
    1: {"formula_id": "senior-rational-density"},
    2: {"formula_id": "senior-rounding-rational-constraints"},
    3: {"formula_id": "senior-rounding-rational-constraints"},
    4: {"formula_id": "senior-terminating-decimal-denominator-test"},
    5: {"formula_id": "senior-terminating-decimal-denominator-test"},
    6: {"formula_id": "senior-rational-number-definition"},
    7: {"formula_id": "senior-repeating-decimal-to-fraction"},
    8: {"formula_id": "senior-repeating-decimal-to-fraction"},
    9: {"formula_id": "senior-repeating-decimal-to-fraction"},
    10: {"formula_id": "senior-decimal-type-rational"},
    11: {"formula_id": "senior-terminating-decimal-denominator-test"},
    12: {"formula_id": "senior-repeating-decimal-to-fraction"},
    13: {"formula_id": "senior-irrational-number-basics"},
    14: {"formula_id": "senior-irrational-operations"},
    15: {"formula_id": "senior-irrational-operations"},
    16: {"formula_id": "senior-irrational-operations"},
    17: {"formula_id": "senior-irrational-operations"},
    18: {"formula_id": "senior-proof-irrational-square-root-two"},
    19: {"formula_id": "senior-proof-irrational-square-root-two"},
    20: {"formula_id": "senior-irrational-number-basics"},
    21: {"formula_id": "senior-irrational-number-basics"},
    22: {"formula_id": "senior-irrational-number-basics"},
    23: {"formula_id": "senior-irrational-number-basics"},
    24: {"formula_id": "senior-irrational-number-basics"},
    25: {"formula_id": "senior-irrational-number-basics"},
    26: {"formula_id": "senior-square-root-perfect-square"},
    27: {"formula_id": "senior-square-root-perfect-square"},
    28: {"formula_id": "senior-square-root-perfect-square"},
    29: {"formula_id": "senior-square-root-perfect-square"},
    30: {"formula_id": "", "question_category": "綜合"},
    31: {"formula_id": "", "question_category": "綜合"},
    32: {"formula_id": "", "question_category": "綜合"},
    33: {"formula_id": "", "question_category": "綜合"},
    34: {"formula_id": "", "question_category": "綜合"},
    35: {"formula_id": "", "question_category": "綜合"},
    36: {"formula_id": "senior-square-root-perfect-square"},
    37: {"formula_id": "senior-radical-comparison-methods"},
    38: {"formula_id": "senior-real-number-interval-compare"},
    39: {"formula_id": "senior-real-number-interval-compare"},
    40: {
        "formula_id": "",
        "question_category": "綜合",
        "clear_explanation": True,
        "add_tags": ["needs-review", "broken-explanation"],
    },
    41: {"formula_id": "senior-real-number-interval-compare"},
    42: {"formula_id": "senior-real-number-interval-compare"},
    43: {"formula_id": "", "question_category": "綜合"},
    44: {"formula_id": "senior-distance-midpoint-section-formulas"},
    45: {"formula_id": "senior-distance-midpoint-section-formulas"},
    46: {"formula_id": "senior-distance-midpoint-section-formulas"},
    47: {"formula_id": "senior-distance-midpoint-section-formulas"},
    48: {"formula_id": "senior-distance-midpoint-section-formulas"},
    49: {"formula_id": "", "question_category": "綜合"},
    50: {"formula_id": "senior-distance-midpoint-section-formulas"},
}


def update_preview(preview_path: Path, records: list[dict]):
    by_category = Counter(record.get("question_category", "") for record in records)
    by_section = {}
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
            "chapter_code": "s1-1-1",
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(by_category),
        "by_section": by_section,
        "review_ids": [row["id"] for row in records if "needs-review" in (row.get("tags") or [])],
    }
    preview_path.write_text(json.dumps(preview, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Finalize formula_id assignment for s1-1-1 pack.")
    parser.add_argument("--questions", required=True)
    parser.add_argument("--preview", required=True)
    args = parser.parse_args()

    questions_path = Path(args.questions)
    preview_path = Path(args.preview)
    payload = json.loads(questions_path.read_text(encoding="utf-8"))
    records = payload.get("questions", [])

    for row in records:
        order = int(row.get("source_order", 0) or 0)
        default_formula = SECTION_DEFAULTS.get(row.get("source_section", ""), "")
        if default_formula:
            row["formula_id"] = default_formula

        rule = ORDER_RULES.get(order, {})
        if "formula_id" in rule:
            row["formula_id"] = rule["formula_id"]
        if "question_category" in rule:
            row["question_category"] = rule["question_category"]
        if rule.get("clear_explanation"):
            row["explanation_text"] = ""
        if rule.get("add_tags"):
            tags = list(row.get("tags") or [])
            for tag in rule["add_tags"]:
                if tag not in tags:
                    tags.append(tag)
            row["tags"] = tags
        tags = list(row.get("tags") or [])
        if row.get("formula_id") or row.get("question_category") == "綜合":
            tags = [tag for tag in tags if tag != "needs-formula-id"]
        row["tags"] = tags

    payload["meta"]["count"] = len(records)
    payload["meta"]["finalized"] = True
    payload["meta"]["finalizedBy"] = "finalize_s1_1_1_pack.py"
    questions_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    update_preview(preview_path, records)

    assigned = sum(1 for row in records if row.get("formula_id"))
    review = [row["id"] for row in records if "needs-review" in (row.get("tags") or [])]
    print(f"records={len(records)}")
    print(f"assigned={assigned}")
    print(f"review={len(review)}")
    for item in review:
        print(item)


if __name__ == "__main__":
    main()
