import argparse
import json
import re
from collections import Counter
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body


FORMULA_BY_ORDER = {
    1: "s1-1-4-exponent-operations",
    2: "s1-1-4-exponent-operations",
    3: "s1-1-4-exponent-operations",
    4: "s1-1-4-exponent-operations",
    5: "s1-1-4-exponent-operations",
    6: "s1-1-4-exponent-operations",
    7: "s1-1-4-exponent-operations",
    8: "s1-1-4-exponent-domain",
    9: "s1-1-4-exponent-domain",
    10: "s1-1-4-exponent-domain",
    11: "s1-1-4-exponent-domain",
    12: "s1-1-4-decimal-exponents",
    13: "s1-1-4-decimal-exponents",
    14: "s1-1-4-exponent-substitution",
    15: "s1-1-4-exponent-substitution",
    16: "s1-1-4-exponent-substitution",
    17: "s1-1-4-exponent-substitution",
    18: "s1-1-4-exponent-substitution",
    19: "s1-1-4-exponent-substitution",
    20: "s1-1-4-exponent-substitution",
    21: "s1-1-4-exponent-substitution",
    22: "s1-1-4-exponent-substitution",
    23: "s1-1-4-base-conversion",
    24: "s1-1-4-base-conversion",
    25: "s1-1-4-base-conversion",
    26: "s1-1-4-base-conversion",
    27: "s1-1-4-base-conversion",
    28: "s1-1-4-base-conversion",
    29: "s1-1-4-exponential-modeling",
    30: "s1-1-4-exponential-modeling",
    31: "s1-1-4-exponential-modeling",
    32: "s1-1-4-exponential-modeling",
    33: "s1-1-4-exponential-modeling",
    34: "s1-1-4-exponential-modeling",
    35: "s1-1-4-exponential-modeling",
    36: "s1-1-4-exponential-modeling",
    37: "s1-1-4-exponential-modeling",
    38: "s1-1-4-exponential-modeling",
}


QUESTION_OVERRIDES = {
    8: (
        "下列敘述，何者正確？\n"
        "(A)設a，b$\\in$R，則$a^{\\frac{1}{2}} \\cdot b^{\\frac{1}{2}} = (ab)^{\\frac{1}{2}}$\n"
        "(B)設a，b$\\in$R，b $\\neq$ 0，則$\\frac{a^{\\frac{1}{2}}}{b^{\\frac{1}{2}}} = (\\frac{a}{b})^{\\frac{1}{2}}$\n"
        "(C)設a$\\in$R，則$(\\sqrt{a})^{2} = a$\n"
        "(D)設a$\\in$R，則$\\sqrt{a^{2}} = |a|$\n"
        "(E)若$a^{m} = a^{n}$，則$m = n$。"
    ),
    10: (
        "設a$\\in$R − {0}，m，n$\\in$N，下列等式何者正確？\n"
        "(A) $a^{0} = 1$\n"
        "(B) $a^{-n} = \\frac{1}{a^{n}}$\n"
        "(C) $x = \\sqrt[n]{a}$與$x^{n} = a$意義相同\n"
        "(D) $a^{\\frac{1}{n}} = \\sqrt[n]{a}$\n"
        "(E) $(a^{m})^{n} = a^{mn}$"
    ),
    15: (
        "設$x^{\\frac{1}{2}} + x^{-\\frac{1}{2}} = 3$﹐則"
        "(1) $x + x^{-1} = $____________﹒"
        "(2) $\\frac{x^{\\frac{3}{2}} + x^{-\\frac{3}{2}} - 3}{x^{2} + x^{-2} - 2} = $____________﹒"
    ),
    16: (
        "設$x + x^{-1} = \\sqrt{31}$，則"
        "$\\left[(x^{2} + x^{-2})^{2} - 4(x + x^{-1})^{2} + 12\\right]^{\\frac{1}{6}}$之值為____________。"
    ),
    20: (
        "若a > 0且$a^{3x} + a^{-3x} = 18$，則"
        "(1) $a^{x} + a^{-x} = $____________。"
        "(2) $a^{x} = $____________。"
    ),
    23: "若已知$3388^{x} = (33.88)^{y} = 1000$，求$\\frac{1}{x} - \\frac{1}{y}$之值 = ____________。",
    25: "$(3.5)^{x} = (0.035)^{y} = 100$，則$\\frac{1}{x} - \\frac{1}{y} =$____________。",
    28: (
        "（　　　）電腦中的運算採用二進位處理﹐所謂二進位就是「滿二進一」﹐"
        "例如$(1011)_{2}$表示二進位的數﹐若將它轉為十進位的數﹐"
        "則為$1 \\times 2^{3} + 0 \\times 2^{2} + 1 \\times 2^{1} + 1 \\times 2^{0}$﹐"
        "試問二進位的六位數$(111111)_{2}$轉換為十進位數為："
        "(1)31 (2)63 (3)127 (4)255﹒"
    ),
    38: (
        "某放射性元素的質量隨時間逐漸衰減﹐且無論從何時算起﹐經過相同時間後的衰變速率皆相同﹐"
        "今該元素物質在1年後﹐質量剩下128公克﹐而10年後﹐質量剩下16公克﹒"
        "試問該放射性元素半衰期（即衰變成原來的一半所需的時間）為____________年﹒"
    ),
}


EXPLANATION_OVERRIDES = {
    4: (
        "【解析】原式"
        "$=((\\frac{3}{2})^{4})^{-\\frac{1}{4}} \\cdot ((\\frac{2}{3})^{3})^{-\\frac{2}{3}} \\cdot ((\\frac{1}{2})^{2})^{-\\frac{1}{2}}$"
        "$=(\\frac{3}{2})^{-1} \\cdot (\\frac{2}{3})^{-2} \\cdot (\\frac{1}{2})^{-1}$"
        "$=\\frac{2}{3} \\cdot \\frac{9}{4} \\cdot 2 = 3$。"
    ),
    5: (
        "【解析】原式"
        "$=\\left((2^{6})^{-0.2}\\right)^{\\frac{1}{8}\\cdot\\frac{1}{3}}"
        "\\cdot (2^{5})^{\\frac{1}{2}\\cdot\\frac{1}{3}}"
        "\\cdot ((2^{3})^{-3})^{\\frac{1}{3}}"
        "\\cdot \\left(((2^{-4})^{\\frac{1}{3}})^{\\frac{1}{4}}\\right)^{-2}$\n"
        "$=2^{-\\frac{1}{20}} \\cdot 2^{\\frac{5}{6}} \\cdot 2^{-3} \\cdot 2^{\\frac{2}{3}}"
        "= 2^{-\\frac{1}{20} + \\frac{5}{6} - 3 + \\frac{2}{3}}"
        "= 2^{-\\frac{31}{20}}$，故$k=-\\frac{31}{20}$。"
    ),
    8: (
        "【解析】"
        "(A)當$a<0$，$b<0$時，$\\sqrt{a}\\sqrt{b}=-\\sqrt{ab}$，"
        "即$a^{\\frac{1}{2}} \\cdot b^{\\frac{1}{2}} \\neq (ab)^{\\frac{1}{2}}$。\n"
        "(B)當$a>0$，$b<0$時，$\\frac{\\sqrt{a}}{\\sqrt{b}}=-\\sqrt{\\frac{a}{b}}$，"
        "故$\\frac{a^{\\frac{1}{2}}}{b^{\\frac{1}{2}}} \\neq (\\frac{a}{b})^{\\frac{1}{2}}$。\n"
        "(C)當$a\\ge 0$時，$(\\sqrt{a})^{2}=a$顯然成立；"
        "當$a<0$時，$(\\sqrt{a})^{2}=(\\sqrt{a})(\\sqrt{a})=-\\sqrt{a\\cdot a}"
        "=-\\sqrt{(-a)^{2}}=-(-a)=a$。\n"
        "(D)當$a\\ge 0$時，$\\sqrt{a^{2}}=|a|$顯然成立；"
        "當$a<0$時，$\\sqrt{a^{2}}=\\sqrt{(-a)^{2}}=|-a|=|a|$。\n"
        "(E)當$a=0,1,-1$時，可能有$a^{m}=a^{n}$但$m\\neq n$。\n"
        "故選(C)(D)。"
    ),
    12: (
        "【解析】"
        "(1) $2^{1.63} = 2^{1+0.6+0.03} = 2^{1} \\cdot 2^{0.6} \\cdot 2^{0.03}"
        "= 2 \\times 1.516 \\times 1.021 = 3.095672$\n"
        "(2) $2^{-0.37} = 2^{0.63-1} = 2^{0.6+0.03-1}"
        "= 2^{0.6} \\cdot 2^{0.03} \\cdot 2^{-1}"
        "= \\frac{1.516 \\times 1.021}{2} = 0.773918$"
    ),
    15: (
        "【解析】(1) $(x^{\\frac{1}{2}} + x^{-\\frac{1}{2}})^{2} = 9$"
        " $\\Rightarrow x + 2 + x^{-1} = 9$"
        " $\\Rightarrow x + x^{-1} = 7$\n"
        "(2) $x^{2} + x^{-2} = (x + x^{-1})^{2} - 2 = 47$；"
        "$x^{\\frac{3}{2}} + x^{-\\frac{3}{2}}"
        " = (x^{\\frac{1}{2}} + x^{-\\frac{1}{2}})^{3}"
        " - 3 \\cdot x^{\\frac{1}{2}} \\cdot x^{-\\frac{1}{2}}"
        " (x^{\\frac{1}{2}} + x^{-\\frac{1}{2}})"
        " = 3^{3} - 3 \\cdot 1 \\cdot 3 = 18$，\n"
        "故原式$=\\frac{18 - 3}{47 - 2}=\\frac{1}{3}$。"
    ),
    16: (
        "【解析】1. $x + x^{-1} = \\sqrt{31}$"
        " $\\Rightarrow x^{2} + 2 + x^{-2} = 31$"
        " $\\Rightarrow x^{2} + x^{-2} = 29$\n"
        "2. $\\left[(x^{2} + x^{-2})^{2} - 4(x + x^{-1})^{2} + 12\\right]^{\\frac{1}{6}}"
        " = (29^{2} - 4 \\times 31 + 12)^{\\frac{1}{6}}"
        " = 729^{\\frac{1}{6}} = (3^{6})^{\\frac{1}{6}} = 3$。"
    ),
    21: (
        "【解析】"
        "∵ $f(a)=3$"
        " $\\Rightarrow \\frac{2^{a}+2^{-a}}{2}=3$"
        " $\\Rightarrow 2^{a}+2^{-a}=6$\n"
        "∴ $f(2a)=\\frac{2^{2a}+2^{-2a}}{2}"
        "=\\frac{(2^{a}+2^{-a})^{2}-2\\cdot 2^{a}\\cdot 2^{-a}}{2}"
        "=\\frac{6^{2}-2}{2}=17$。"
    ),
    23: (
        "【解析】由$3388^{x}=1000$可得$3388=1000^{\\frac{1}{x}}=10^{\\frac{3}{x}}$；\n"
        "由$(33.88)^{y}=1000$可得$33.88=1000^{\\frac{1}{y}}=10^{\\frac{3}{y}}$。\n"
        "因此$100=\\frac{3388}{33.88}=10^{\\frac{3}{x}-\\frac{3}{y}}$，"
        "故$\\frac{3}{x}-\\frac{3}{y}=2$，"
        "即$\\frac{1}{x}-\\frac{1}{y}=\\frac{2}{3}$。"
    ),
    25: (
        "【解析】由$(3.5)^{x}=100$可得$3.5=100^{\\frac{1}{x}}$；\n"
        "由$(0.035)^{y}=100$可得$0.035=100^{\\frac{1}{y}}$。\n"
        "因此$100=\\frac{3.5}{0.035}=100^{\\frac{1}{x}-\\frac{1}{y}}$，"
        "故$\\frac{1}{x}-\\frac{1}{y}=1$。"
    ),
    29: (
        "【解析】設實驗開始時，細菌數為$m$個，則\n"
        "$m\\cdot a^{3}=200000$ ......①\n"
        "$m\\cdot a^{\\frac{9}{2}}=1600000$ ......②\n"
        "由②÷①得$a^{\\frac{3}{2}}=8$，故$a=4$。\n"
        "(2) 由①得$m\\cdot 4^{3}=200000$，所以$m=3125$。\n"
        "令細菌數變成3200000所需日數為$k$日，則"
        "$3125\\cdot 4^{k}=3200000$，"
        "故$4^{k}=1024=4^{5}$，所以$k=5$。"
    ),
    38: (
        "【解析】設原來質量為$m_{0}$，半衰期為$t_{0}$，"
        "則$ m(t)=m_{0}\\times (\\frac{1}{2})^{\\frac{t}{t_{0}}}$。\n"
        "依題意可得\n"
        "$128 = m_{0}\\times (\\frac{1}{2})^{\\frac{1}{t_{0}}}$，\n"
        "$16 = m_{0}\\times (\\frac{1}{2})^{\\frac{10}{t_{0}}}$。\n"
        "兩式相除得"
        "$\\frac{128}{16}"
        "=(\\frac{1}{2})^{\\frac{1}{t_{0}}-\\frac{10}{t_{0}}}"
        "=8$，\n"
        "即$2^{\\frac{9}{t_{0}}}=2^{3}$，故$t_{0}=3$。"
    ),
}


TITLE_OVERRIDES = {
    4: "隨堂練習：有理指數化簡",
    5: "隨堂練習：複合根式指數化簡",
    6: "隨堂練習：根式與分數指數化簡",
    7: "隨堂練習：有理指數化簡",
    8: "範例4：指數定義與限制判斷",
    9: "隨堂練習：根式符號判斷",
    10: "隨堂練習：指數敘述真假",
    11: "隨堂練習：指數敘述真假",
    12: "範例5：小數指數估值",
    13: "隨堂練習：小數指數估值",
    14: "範例6：由4^{x}=5求相關值",
    15: "範例7：由$x^{1/2}+x^{-1/2}$求值",
    16: "範例8：由$x+x^{-1}$求值",
    17: "範例9：由$a^{3x}+a^{-3x}$求值",
    18: "隨堂練習：已知$a^{2x}$求對稱式",
    19: "隨堂練習：指數方程與分式求值",
    20: "隨堂練習：由$a^{3x}+a^{-3x}$求值",
    21: "範例10：對稱函數求值",
    22: "隨堂練習：對稱函數最小值",
    23: "範例11：底數轉換求指數差",
    24: "隨堂練習：同值指數聯立",
    25: "隨堂練習：換底求指數差",
    26: "範例12：同值冪次換底",
    27: "隨堂練習：正數指數聯立",
    28: "範例13：二進位轉十進位",
    29: "範例14：細菌倍增模型",
    30: "隨堂練習：草履蟲倍增模型",
    31: "範例15：布袋蓮面積成長",
    32: "隨堂練習：十二平均律模型",
    33: "範例16：照度與反平方律",
    34: "範例17：蒲福風級估算",
    35: "範例18：世界人口成長",
    36: "範例19：重複平方反推初值",
    37: "隨堂練習：藥量衰減",
    38: "隨堂練習：半衰期求法",
}


VECTOR_REF_RE = re.compile(r"\[圖:([^\]]+\.(?:emf|wmf))\]", re.IGNORECASE)
VECTOR_PATH_RE = re.compile(r"([A-Za-z0-9_./\\-]+\.(?:emf|wmf))(?!\.png)", re.IGNORECASE)

FALLBACK_TITLE_BY_FORMULA = {
    "s1-1-4-exponent-operations": "指數與根式運算",
    "s1-1-4-exponent-domain": "指數定義與限制判斷",
    "s1-1-4-decimal-exponents": "小數指數估值",
    "s1-1-4-exponent-substitution": "指數代換求值",
    "s1-1-4-base-conversion": "底數轉換與冪次表示",
    "s1-1-4-exponential-modeling": "指數模型應用",
}


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
    if text.endswith(("{", "(", "（", "=", "．", "﹕", "：")):
        return True
    if len(text) > 36:
        return True
    if len(text) >= 24 and "$" in text:
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
            "chapter_code": "s1-1-4",
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
        "# s1-1-4 Review Needed",
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
            "- 已把 `wmf/emf` 題圖引用改為對應 `.png` 供前端顯示。",
            "- 針對 Pandoc 轉壞的上下標題目，已在 finalize 階段做人工修正。",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Finalize s1-1-4 pack.")
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
            if order in TITLE_OVERRIDES:
                row["title"] = TITLE_OVERRIDES[order]
            if needs_fallback_title(row["title"]):
                fallback = FALLBACK_TITLE_BY_FORMULA.get(row["formula_id"], "")
                if fallback:
                    row["title"] = f"{marker}：{fallback}"

        row.pop("review_note", None)
        tags = [tag for tag in tags if tag != "needs-review"]
        row["tags"] = tags

    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(records)
    payload["meta"]["finalized"] = True
    payload["meta"]["finalizedBy"] = "finalize_s1_1_4_pack.py"
    payload.setdefault("summary", {})
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
