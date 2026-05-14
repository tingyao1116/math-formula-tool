import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


CHAPTER_CODE = "s2-1-1"
CHAPTER_TITLE = "數列與遞迴"

FORMULA_BY_ORDER = {}
for order in range(1, 7):
    FORMULA_BY_ORDER[order] = "senior-sequence-notation-general-term"
for order in range(7, 33):
    FORMULA_BY_ORDER[order] = "senior-arithmetic-geometric-core"
for order in range(33, 36):
    FORMULA_BY_ORDER[order] = "senior-sequence-recursion-first-order"
for order in range(36, 39):
    FORMULA_BY_ORDER[order] = "senior-sequence-sum-transform-sn-difference-s211"
for order in range(39, 46):
    FORMULA_BY_ORDER[order] = "senior-sequence-recursion-transform-method-s211"
for order in range(46, 52):
    FORMULA_BY_ORDER[order] = "senior-sequence-recursion-pattern-classification-s211"
for order in range(52, 64):
    FORMULA_BY_ORDER[order] = "senior-sequence-induction-template-s211"
for order in range(64, 74):
    FORMULA_BY_ORDER[order] = "senior-math-induction-principle"
FORMULA_BY_ORDER[74] = "senior-recursion-hanoi-proof-link-s211"
FORMULA_BY_ORDER[75] = "senior-induction-common-mistakes-s211"

QUESTION_OVERRIDES = {
    12: "如圖是某年三月的月曆，其中黑線所圍的4天的日期和為84，問該年的四月1日是星期幾？\n[圖: program-db/imports/packs/s2-1-1/assets/media/image2.emf.png]",
    13: "某年二月有四天是星期三，而且這四天日期的數字和為50，問這四天中最後一天是幾號？",
    15: "有一等差數列〈a_n〉，已知 a_m = n^2，a_n = m^2，且 m ≠ n，則 a_{m+n} = ______。",
    27: "在2與12之間插入兩正數 a、b，使得2、a、b三數為等比數列，且 a、b、12 三數為等差數列，求 a、b 兩數。",
    31: "瓶內裝滿酒精，用去 $\\frac{1}{4}$ 後用水加滿；再用去 $\\frac{1}{4}$ 後再用水加滿；如此反覆進行。若重複 5 次後，瓶內酒精還剩多少？",
    33: "設數列〈a_n〉滿足 a_1 = 1，且 a_n = \\frac{4-a_{n-1}}{3-a_{n-1}}（n\\ge 2），求 a_2、a_3，並推測 a_n（以 n 表示）。",
    34: "數列〈a_n〉的遞迴關係式為\n$a_1 = 3$\n$a_n + 2a_{n-1} = 0$（n 為正整數且 n\\ge 2）\n求一般項 a_n。",
    35: "數列〈a_n〉的遞迴關係式為\n$a_1 = 3$\n$a_n = 2a_{n-1} - 1$（n 為正整數且 n\\ge 2）\n求\n(1) a_4。\n(2) 若 a_n = 2a_{n-1} - 1 可化成 a_n - p = 2(a_{n-1} - p)，則 p 的值為何？\n(3) 一般項 a_n。",
    40: "設數列〈a_n〉滿足\n$a_1 = 1$\n$a_{n+1} = 2a_n + (n+1)$（n\\ge 1）\n求一般項 a_n。",
    41: "一數列 {a_n} 的遞迴定義式為：a_1 = 2，a_{n+1} = a_n + (\\frac{1}{3})^n，n∈N，試求這個數列的一般項 a_n（以 n 的式子表示）。",
    44: "設數列〈a_n〉中滿足 a_1 = 2 且 a_{n+1} = 2 - \\frac{1}{a_n}，n 為正整數，由此可推得下列何者為真？\n(1) a_2 = \\frac{3}{2}\n(2) a_3 = \\frac{4}{3}\n(3) a_4 = \\frac{5}{4}\n(4) a_{100} = 1\\frac{1}{100}\n(5) a_n = \\frac{n+1}{n}。",
    54: "設數列〈a_n〉的遞迴關係式為\n$a_1 = 1$\n$a_n = a_{n-1} + (2n-1)$（n\\ge 2）。\n(1) 寫出 a_2、a_3。\n(2) 猜測一般項 a_n。\n(3) 使用數學歸納法證明：你的猜測是正確的。",
    56: "設數列〈a_n〉的遞迴關係式為\n$a_1 = 2$\n$a_n = 3a_{n-1} + 2$（n\\ge 2）。\n(1) 寫出 a_2、a_3。\n(2) 猜測一般項 a_n。\n(3) 使用數學歸納法證明你的猜測是正確的。",
    60: "設數列〈a_n〉的遞迴關係式為\n$a_1 = \\frac{1}{2}$\n$a_n = \\frac{n}{n+1}a_{n-1}$（n 為自然數，n\\ge 2）。\n(1) 寫出 a_2、a_3。\n(2) 猜測一般項 a_n。\n(3) 使用數學歸納法驗證你的猜測。",
    61: "數列〈a_n〉中，\n$a_1 = 0$\n$a_{n+1} = \\frac{1+a_n}{5-4a_n}$，n\\ge 1。\n(1) 寫出 a_2、a_3、a_4、a_5。\n(2) 歸納 a_n 與 n 的關係式。\n(3) 證明(2)中所歸納的關係式正確。",
    62: "已知一數列的遞迴定義式為\n$a_1 = 3$\n$a_{n+1} - a_n = 4n + 3$（n∈N）。\n(1) 試求此數列的一般項 a_n。\n(2) 利用數學歸納法證明第(1)題的結果。",
    63: "已知一數列〈a_n〉定義為 a_1 = 1，a_{n+1} = \\frac{3a_n-1}{4a_n-1}，n = 1,2,3,…。\n(1) 求 a_2、a_3、a_4。\n(2) 觀察(1)的規則性，並推測第 n 項 a_n（以 n 表示）。\n(3) 證明在(2)中所推測的結果。",
    74: "如下圖，A柱中有 n 個大小不同的圓盤由大而小往上堆疊，若要從 A 柱全部搬移至 B 柱，每次只能搬動一圓盤，且每次都必須先經中間柱（不可由 A 直接放入 B），且大盤不可放在小盤之上。設共要搬動 a_n 次，若 a_{n+1} = pa_n + k，求數對 (p,k) = ______。\n[圖: program-db/imports/packs/s2-1-1/assets/media/image39.png]",
    75: "請用若干個「L 形骨牌」將下列圖形蓋滿（但所用骨牌不得重疊，亦不得出格）。\n(a) [圖: program-db/imports/packs/s2-1-1/assets/media/image40.png]\n(b) [圖: program-db/imports/packs/s2-1-1/assets/media/image41.png]\n(c) [圖: program-db/imports/packs/s2-1-1/assets/media/image42.png]\n(d) [圖: program-db/imports/packs/s2-1-1/assets/media/image43.png]\n(e) [圖: program-db/imports/packs/s2-1-1/assets/media/image44.png]\n(2) 做完(1)中各圖後，請仔細地想一想：處理這些問題有沒有一定的準則？\n(3) 你能否歸納出下列結論：任意每邊 $2^n$ 格的正方格棋盤圖，如果其中缺空一格，那麼便可用若干個「L 形骨牌」不重疊地將其蓋滿。\n(4) 請利用數學歸納法證明(3)的結論。",
}

REVIEW_NOTES = {
    6: "數對序列題的解析依賴圖像分群，建議前端再確認圖片與文字的相對位置。",
    50: "黑點圖形題含多張圖，建議匯入後確認多圖在同題幹中的排列。",
    62: "第(1)小題解析使用圖像疊加式推導，若要更正式可再手修一次解答文字。",
    74: "河內塔題高度依賴題圖與敘述一起閱讀，建議匯入後先看版面。",
    75: "L 形骨牌題屬圖形歸納題，建議優先檢查圖片在不同裝置上的顯示。"
}

MATH_BACKTICK_RE = re.compile(r"\$`(.*?)`\$", re.S)
INLINE_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
GENERIC_IMAGE_RE = re.compile(r"\[圖:\s*([^\]]+)\]", re.I)
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
SYSTEM_RE = re.compile(
    r"\$\\left\\\{\s*\\begin\{(?:array|matrix)\}(?:\{[^}]*\})?\s*(.*?)\s*\\end\{(?:array|matrix)\}\s*\\right\.\s*\\?\$",
    re.S,
)


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def normalize_asset_path(raw: str) -> str:
    text = str(raw or "").strip().replace("\\", "/")
    if not text:
        return ""
    if text.startswith("./"):
        text = text[2:]
    marker = text.lower().find("program-db/")
    if marker >= 0:
        text = text[marker:]
    text = re.sub(r"(?i)\.(emf|wmf)(?:\.png)+$", r".\1.png", text)
    text = re.sub(r"(?i)\.png(?:\.png)+$", ".png", text)
    if VECTOR_PATH_RE.search(text):
        text = VECTOR_PATH_RE.sub(lambda m: f"{m.group(0)}.png", text)
    return text


def ensure_png_sidecars(asset_dir: Path) -> int:
    created = 0
    for path in sorted(asset_dir.iterdir()):
        if path.suffix.lower() not in {".emf", ".wmf"}:
            continue
        png_path = Path(f"{path}.png")
        if png_path.exists():
            continue
        with Image.open(path) as image:
            image.save(png_path, format="PNG")
        created += 1
    return created


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def repl(match: re.Match[str]) -> str:
        normalized = normalize_asset_path(match.group(1))
        return f"\n[圖: {normalized}]\n" if normalized else ""

    value = HTML_IMAGE_RE.sub(repl, value)
    value = INLINE_IMAGE_RE.sub(repl, value)
    value = GENERIC_IMAGE_RE.sub(lambda m: f"[圖: {normalize_asset_path(m.group(1))}]", value)
    return value


def normalize_system_block(match: re.Match[str]) -> str:
    body = match.group(1)
    body = body.replace("\\\\", "\n")
    body = body.replace("\\mspace{6mu}", " ")
    body = body.replace("﹐", "，")
    rows = []
    for part in body.splitlines():
        row = part.strip()
        if not row:
            continue
        row = re.sub(r"\s{2,}", " ", row)
        rows.append(row)
    return "\n".join(rows)


def normalize_subscript_artifacts(text: str) -> str:
    value = str(text or "")
    value = re.sub(r"([A-Za-z])_([A-Za-z0-9]+)\s*_\+\s*([A-Za-z0-9]+)", r"\1_{\2+\3}", value)
    value = re.sub(r"([A-Za-z])_([A-Za-z0-9]+)\s*_−\s*([A-Za-z0-9]+)", r"\1_{\2-\3}", value)
    value = re.sub(r"([A-Za-z])_([A-Za-z0-9]+)\+\s*([A-Za-z0-9]+)", r"\1_{\2+\3}", value)
    value = re.sub(r"([A-Za-z])_([A-Za-z0-9]+)−\s*([A-Za-z0-9]+)", r"\1_{\2-\3}", value)
    return value


def normalize_sequence_notation(text: str) -> str:
    value = str(text or "")
    value = value.replace("\\< a_n \\>", "〈a_n〉")
    value = value.replace("\\<a_n\\>", "〈a_n〉")
    value = value.replace("< a_n >", "〈a_n〉")
    value = value.replace("<a_n>", "〈a_n〉")
    value = value.replace("{a_n}", "〈a_n〉")
    return value


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = MATH_BACKTICK_RE.sub(lambda m: f"${m.group(1).strip()}$", value)
    value = value.replace("`", "")
    value = SYSTEM_RE.sub(normalize_system_block, value)
    value = normalize_subscript_artifacts(value)
    value = normalize_sequence_notation(value)
    replacements = {
        "\\mspace{6mu}": " ",
        "\\cdots": "⋯",
        "\\langle": "〈",
        "\\rangle": "〉",
        "\\left\\lbrack": "[",
        "\\right\\rbrack": "]",
        "\\left[": "[",
        "\\right]": "]",
        "\\left(": "(",
        "\\right)": ")",
        "\\,": " ",
        "‚": "，",
        "﹐": "，",
        "﹒": "。",
        "．．": "…",
        "……①": "①",
        "……②": "②",
        "……③": "③",
        "……④": "④",
        "……": "…",
        "\\[": "[",
        "\\]": "]",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = clean_question_body(value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def rebuild_title(marker: str, question_text: str) -> str:
    seed = re.sub(r"\[圖:\s*[^\]]+\]", "", question_text)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ，。；：")
    if len(seed) > 28:
        seed = seed[:28].rstrip(" ，。；：")
    return f"{marker}：{seed}" if seed else marker


def infer_marker(category: str, title: str) -> str:
    if title.startswith("範例"):
        return title.split("：", 1)[0]
    if title.startswith("隨堂練習"):
        return "隨堂練習"
    return "範例" if category == "基本" else "隨堂練習"


def build_preview(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = record.get("source_section") or "未分類"
        by_section.setdefault(section, []).append(
            {
                "id": record["id"],
                "title": record["title"],
                "question_category": record["question_category"],
                "difficulty": record["difficulty"],
                "formula_id": record["formula_id"],
            }
        )
    return {
        "meta": {
            "chapter_code": CHAPTER_CODE,
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for row in records if not row.get("formula_id")),
        },
        "by_category": dict(Counter(record["question_category"] for record in records)),
        "by_section": by_section,
    }


def build_manifest() -> dict:
    return {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "source_files": [
            {"path": "source/2-1轉.docx", "role": "primary_docx"},
        ],
        "extracted_files": [
            {"path": "extracted/2-1轉.md", "role": "pandoc_markdown"},
            {"path": "questions.json", "role": "question_pack_preview"},
            {"path": "preview.json", "role": "assignment_preview"},
            {"path": "review-needed.md", "role": "manual_review_notes"},
        ],
        "asset_roots": [
            {"path": "assets/media", "role": "pandoc_extracted_media"},
        ],
        "status": "review_ready",
        "updated_at": datetime.now().astimezone().isoformat(),
    }


def build_review(records: list[dict]) -> str:
    lines = [
        f"# {CHAPTER_CODE} Review Needed",
        "",
        "## Current extraction status",
        "",
        f"- Parsed question records: {len(records)}",
        f"- Assigned `formula_id`: {sum(1 for row in records if row.get('formula_id'))}",
        f"- Needs manual review: {len(REVIEW_NOTES)}",
        "",
        "## Manual review items",
        "",
    ]
    for order, note in REVIEW_NOTES.items():
        qid = f"q-{CHAPTER_CODE}-{order:04d}"
        lines.append(f"- `{qid}`")
        lines.append(f"  - {note}")
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已保留。",
            "- `wmf/emf` 圖片已轉成 `.png` sidecar 並更新引用。",
            "- 遞迴關係與聯立樣式已盡量改成穩定的分行文字版，避免匯入後直接露出 `array/matrix` 原始碼。",
        ]
    )
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Finalize s2-1-1 question pack.")
    parser.add_argument("--base-dir", default=".")
    args = parser.parse_args()

    base_dir = Path(args.base_dir).resolve()
    pack_dir = base_dir / "program-db" / "imports" / "packs" / CHAPTER_CODE
    questions_path = pack_dir / "questions.json"
    preview_path = pack_dir / "preview.json"
    manifest_path = pack_dir / "manifest.json"
    review_path = pack_dir / "review-needed.md"
    asset_dir = pack_dir / "assets" / "media"

    png_created = ensure_png_sidecars(asset_dir)

    payload = read_json(questions_path)
    records = payload.get("questions", [])

    for index, row in enumerate(records, start=1):
        source_order = int(row.get("source_order", index))
        if source_order in QUESTION_OVERRIDES:
            row["question_text"] = QUESTION_OVERRIDES[source_order]
        row["question_text"] = normalize_text(row.get("question_text", ""))
        row["explanation_text"] = normalize_text(row.get("explanation_text", ""))
        row["answer_text"] = normalize_text(row.get("answer_text", ""))
        row["formula_id"] = FORMULA_BY_ORDER.get(source_order, "s2-1-1-sequence-recursion-core")
        marker = infer_marker(row.get("question_category", ""), row.get("title", ""))
        row["title"] = clean_question_title(rebuild_title(marker, row["question_text"],))
        row["tags"] = [
            CHAPTER_CODE if not str(tag).startswith("s2-1-1") and tag != "needs-formula-id" else tag
            for tag in row.get("tags", [])
            if tag != "needs-formula-id"
        ]
        if CHAPTER_CODE not in row["tags"]:
            row["tags"].insert(0, CHAPTER_CODE)

    payload["meta"]["chapter_code"] = CHAPTER_CODE
    payload["summary"]["count"] = len(records)
    payload["summary"]["sections"] = dict(Counter(row.get("source_section", "") for row in records))
    payload["summary"]["image_references"] = sorted(
        {
            match
            for row in records
            for field in ("question_text", "explanation_text")
            for match in re.findall(r"\[圖:\s*([^\]]+)\]", row.get(field, ""))
        }
    )
    payload["questions"] = records

    write_json(questions_path, payload)
    write_json(preview_path, build_preview(records))
    write_json(manifest_path, build_manifest())
    review_path.write_text(build_review(records), encoding="utf-8")

    print(f"questions={len(records)}")
    print(f"png_sidecars_created={png_created}")
    print(questions_path)


if __name__ == "__main__":
    main()
