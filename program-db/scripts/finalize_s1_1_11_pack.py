import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body
from sync_extra_bridge import sync_extra_web_from_db
from sync_legacy_bridge import sync_legacy_js_from_db
from sync_web_data import sync_question_js_from_db


CHAPTER_CODE = "s1-1-11"
CHAPTER_TITLE = "多項式不等式"
ROOT_TOPIC_ID = "s1-1-11-polynomial-inequality-core"
SOURCE_REF = "source/1-11轉.docx"
SOURCE_MD = "extracted/1-11轉.md"

SECTION_LINEAR = "主題1：一元一次不等式的解法"
SECTION_QUADRATIC = "主題2：二次不等式的解法"
SECTION_HIGHER = "主題3：高次不等式的解法"


FORMULA_BY_ORDER: dict[int, str] = {}
for order in range(1, 5):
    FORMULA_BY_ORDER[order] = "s1-1-11-linear-inequality-basic"
for order in range(5, 9):
    FORMULA_BY_ORDER[order] = "s1-1-11-linear-inequality-application"
for order in range(9, 14):
    FORMULA_BY_ORDER[order] = "s1-1-11-quadratic-solution-interval"
for order in range(14, 22):
    FORMULA_BY_ORDER[order] = "s1-1-11-quadratic-parameter-sign"
for order in range(22, 32):
    FORMULA_BY_ORDER[order] = "s1-1-11-quadratic-transform-model"
for order in range(32, 41):
    FORMULA_BY_ORDER[order] = "s1-1-11-higher-degree-sign-chart"
for order in range(41, 50):
    FORMULA_BY_ORDER[order] = "s1-1-11-rational-inequality"
for order in range(50, 54):
    FORMULA_BY_ORDER[order] = "s1-1-11-radical-absolute-inequality"
for order in range(54, 57):
    FORMULA_BY_ORDER[order] = "s1-1-11-parameter-application-inequality"


QUESTION_OVERRIDES: dict[int, dict[str, str]] = {
    3: {
        "question_text": (
            "求聯立不等式組\n"
            "$\\left\\{ \\begin{aligned} 5x + 1 &> 3x - 5 \\\\ 3 - 2x &\\leq 7 - 3x \\end{aligned} \\right.$\n"
            "的解。"
        ),
        "explanation_text": (
            "【解析】由5x + 1 > 3x − 5，可得2x > − 6，所以x > − 3；\n"
            "由3 − 2x ≤ 7 − 3x，可得x ≤ 4。\n"
            "兩者取交集，得− 3 < x ≤ 4。\n"
            "圖示：\n"
            "[圖:program-db/imports/packs/s1-1-11/assets/media/image2.emf.png]"
        ),
    },
    9: {
        "question_text": (
            "設不等式ax^{2} + bx + c > 0的解為 − 2 < x < 5，則下列哪些敘述正確？\n"
            "(1) a = − 1\n"
            "(2) b = 3\n"
            "(3) c = 10\n"
            "(4) $\\frac{ax - c}{ax - b} \\geq 0$的解為x > − 3或x ≤ − 10\n"
            "(5) ax^{2} − bx + c < 0的解為x > 2或x < − 5\n"
            "【康熹自命題】"
        )
    },
    10: {
        "question_text": (
            "若不等式ax^{2} + bx + c < 0的解為1 < x < 2，則不等式bx^{2} + cx + a > 0的解為何？\n"
            "【龍騰自命題】"
        )
    },
    12: {
        "question_text": (
            "設f(x)=ax^{2}+bx+c，且不等式f(x) > 0之解為−4 < x < 2，則f(2x) < 0的解為何？\n"
            "【98中山女中期中考】"
        ),
        "explanation_text": (
            "【解析】因− 4 < x < 2是f(x) > 0的解，"
            "可設f(x)=−(x + 4)(x − 2)= −x^{2} − 2x + 8。\n"
            "則f(2x) < 0\n"
            "⇔ −(2x + 4)(2x − 2) < 0\n"
            "⇔ (x + 2)(x − 1) > 0\n"
            "⇔ x < − 2或x > 1。"
        ),
    },
    15: {
        "question_text": (
            "下列不等式，何者無實解？\n"
            "(A) x^{2} − x + 2 < 0\n"
            "(B) − x^{2} + 2x − 3 ≤ 0\n"
            "(C) x^{2} + 3x − 1 > 0\n"
            "(D) − x^{2} + 3x − 5 > 0\n"
            "(E) − x^{2} − 2x + 3 > 0。"
        )
    },
    16: {
        "explanation_text": (
            "【解析】二次不等式(2a − 3)x^{2} − 2ax + (a + 2) < 0沒有實數解，"
            "等價於(2a − 3)x^{2} − 2ax + (a + 2) ≥ 0對所有實數x恆成立。\n"
            "因此必須同時滿足：\n"
            "(1) 2a − 3 > 0\n"
            "(2) D = (−2a)^{2} − 4(2a − 3)(a + 2) ≤ 0\n"
            "由(1)得a > $\\frac{3}{2}$；由(2)整理得a ≤ − 3或a ≥ 2。\n"
            "取交集可得a ≥ 2。"
        )
    },
    18: {
        "explanation_text": (
            "【解析】原式等價於下列兩個不等式都對所有實數x恆成立：\n"
            "(1) − (x + 1)^{2} < (a − 2)x − a\n"
            "(2) (a − 2)x − a < (x − 1)^{2} − 1\n"
            "由(1)得x^{2} + ax + (1 − a) > 0恆成立，"
            "所以a^{2} − 4(1 − a) < 0，故 − 2 − 2$\\sqrt{2}$ < a < − 2 + 2$\\sqrt{2}$。\n"
            "由(2)得x^{2} − ax + a > 0恆成立，所以a^{2} − 4a < 0，故0 < a < 4。\n"
            "兩者交集為0 < a < − 2 + 2$\\sqrt{2}$。"
        )
    },
    23: {
        "question_text": (
            "若不等式ax^{2} + 3x + b > 0之解為 − 1 < x < 4，"
            "則不等式bx^{2} + 2ax − 12 > 0之解為。"
        )
    },
    25: {
        "explanation_text": (
            "【解析】\n"
            "(1) 若∀x∈R，f(x) > 0恆成立，則判別式D < 0。\n"
            "a^{2} − 4(a + 2) < 0 ⇒ a^{2} − 4a − 8 < 0 ⇒ 2 − 2$\\sqrt{3}$ < a < 2 + 2$\\sqrt{3}$。\n"
            "(2) 若∀x > 0，f(x) > 0恆成立，分兩種情況討論：\n"
            "① 當$\\frac{a}{2} \\geq 0$時，拋物線頂點落在x > 0區域內，"
            "需有f($\\frac{a}{2}$) > 0，仍得a^{2} − 4a − 8 < 0，"
            "所以2 − 2$\\sqrt{3}$ < a < 2 + 2$\\sqrt{3}$。\n"
            "② 當$\\frac{a}{2} < 0$時，f(x)在x > 0上遞增，其下確界由x趨近0^{+}決定，"
            "故需a + 2 ≥ 0，即a ≥ − 2。\n"
            "綜合可得 − 2 ≤ a < 2 + 2$\\sqrt{3}$。"
        )
    },
    32: {
        "explanation_text": (
            "【解析】\n"
            "(1) 由零點1、3、5作號線分析，可得(x − 1)(x − 3)(x − 5) > 0的解為1 < x < 3或x > 5。\n"
            "(2) 因x^{2} + 2x + 5 > 0恆成立，"
            "所以原式等價於(x − 1)(x − 3)(x − 5) < 0，解為x < 1或3 < x < 5。"
        )
    },
    45: {
        "explanation_text": (
            "【解析】$\\frac{2x}{x - 1} \\leq x + 2"
            " ⇒ (x + 2) - \\frac{2x}{x - 1} \\geq 0"
            " ⇒ \\frac{(x + 2)(x - 1) - 2x}{x - 1} \\geq 0$\n"
            "⇒ $\\frac{x^{2} - x - 2}{x - 1} \\geq 0"
            " ⇒ (x^{2} − x − 2)(x − 1) \\geq 0$，且x ≠ 1\n"
            "⇒ (x − 2)(x + 1)(x − 1) ≥ 0，且x ≠ 1\n"
            "故解為− 1 ≤ x < 1或x ≥ 2。"
        )
    },
    47: {
        "explanation_text": (
            "【解析】$\\frac{1}{x + 1} + \\frac{1}{x + 4} \\geq \\frac{1}{x + 3} + \\frac{1}{x + 2}$\n"
            "⇒ $\\frac{2x + 5}{(x + 1)(x + 4)} \\geq \\frac{2x + 5}{(x + 3)(x + 2)}$\n"
            "⇒ $(2x + 5)\\left[\\frac{1}{(x + 1)(x + 4)} - \\frac{1}{(x + 2)(x + 3)}\\right] \\geq 0$\n"
            "⇒ $(2x + 5)\\cdot\\frac{(x + 2)(x + 3) - (x + 1)(x + 4)}{(x + 1)(x + 2)(x + 3)(x + 4)} \\geq 0$\n"
            "⇒ $\\frac{-(2x + 5)}{(x + 1)(x + 2)(x + 3)(x + 4)} \\geq 0$\n"
            "⇒ $\\frac{2x + 5}{(x + 1)(x + 2)(x + 3)(x + 4)} \\leq 0$。\n"
            "作號線分析後，可得解為− 4 < x < − 3，或− $\\frac{5}{2}$ ≤ x < − 2，或x > − 1。"
        )
    },
    49: {
        "explanation_text": (
            "【解析】由0 < y得\n"
            "$\\frac{x^{2} - 5x + 6}{x^{2} + 5x + 4} > 0"
            " ⇒ (x^{2} − 5x + 6)(x^{2} + 5x + 4) > 0$\n"
            "⇒ (x − 2)(x − 3)(x + 1)(x + 4) > 0\n"
            "⇒ x < − 4，或− 1 < x < 2，或x > 3。……①\n"
            "再由y < 1得\n"
            "$\\frac{x^{2} - 5x + 6}{x^{2} + 5x + 4} < 1"
            " ⇒ \\frac{-10x + 2}{x^{2} + 5x + 4} < 0$\n"
            "⇒ $\\frac{-10x + 2}{(x + 1)(x + 4)} < 0"
            " ⇒ - 4 < x < - 1$，或x > $\\frac{1}{5}$。……②\n"
            "由①∩②可得$\\frac{1}{5}$ < x < 2，或x > 3。"
        )
    },
    50: {
        "question_text": (
            "解下列不等式：\n"
            "(1) $\\sqrt{x - 1} < 7 - x$。\n"
            "(2) $\\sqrt{x - 1} > 7 - x$。\n"
            "(3) $\\sqrt{x - 1} > \\sqrt{7 - x}$。\n"
            "【康熹自命題】"
        ),
        "explanation_text": (
            "【解析】\n"
            "(1) $\\sqrt{x - 1} < 7 - x$時，必須先有x − 1 ≥ 0且7 − x > 0，"
            "所以1 ≤ x < 7。兩邊平方得x − 1 < (7 − x)^{2}，"
            "整理為(x − 5)(x − 10) > 0。與1 ≤ x < 7合併，可得1 ≤ x < 5。\n"
            "(2) $\\sqrt{x - 1} > 7 - x$時，若1 ≤ x ≤ 7，平方後得x − 1 > (7 − x)^{2}，"
            "整理得(x − 5)(x − 10) < 0，所以5 < x ≤ 7；若x > 7，則7 − x < 0，"
            "而左邊為非負數，因此也成立。故第(2)題解為x > 5。\n"
            "(3) $\\sqrt{x - 1} > \\sqrt{7 - x}$時，需同時有x − 1 ≥ 0且7 − x ≥ 0，"
            "故1 ≤ x ≤ 7。兩邊平方得x − 1 > 7 − x，即x > 4。"
            "與定義域合併，可得4 < x ≤ 7。"
        )
    },
    52: {
        "explanation_text": (
            "【解析】分三段討論：\n"
            "(1) 當x ≥ 3時，|x + 2| − |x − 3| = (x + 2) − (x − 3) = 5，故5 < x，所以x > 5。\n"
            "(2) 當− 2 ≤ x < 3時，|x + 2| − |x − 3| = (x + 2) − (3 − x) = 2x − 1，"
            "故2x − 1 < x，得x < 1，所以此段解為− 2 ≤ x < 1。\n"
            "(3) 當x < − 2時，|x + 2| − |x − 3| = −(x + 2) − (3 − x) = −5，"
            "故− 5 < x，所以此段解為− 5 < x < − 2。\n"
            "綜合可得原不等式的解為− 5 < x < 1，或x > 5。"
        )
    },
    53: {
        "explanation_text": (
            "【解析】設P點的坐標為x。因為$\\overline{PA} = |x + 1|$，"
            "$\\overline{PB} = |x − 4|$，所以\n"
            "$|x + 1|\\cdot|x − 4| < 6"
            " ⇔ |x^{2} − 3x − 4| < 6$。\n"
            "兩邊平方得$(x^{2} − 3x − 4)^{2} < 36$\n"
            "⇔ $(x^{2} − 3x − 10)(x^{2} − 3x + 2) < 0$\n"
            "⇔ $(x − 5)(x + 2)(x − 1)(x − 2) < 0$。\n"
            "配合號線分析，可得− 2 < x < 1，或2 < x < 5。\n"
            "[圖:program-db/imports/packs/s1-1-11/assets/media/image39.emf.png]"
        )
    },
}


REVIEW_OVERRIDES = {
    31: "題目與解析同時依賴兩張池塘外圍示意圖，建議在前端確認圖文排版與圖片清晰度。",
    38: "解析使用長除法／因式分解輔助圖，建議檢查圖片在題庫介面的可讀性。",
    53: "題幹與解析都靠數線圖判讀區間，建議前端直接檢查圖片大小與位置。",
}


GENERIC_IMAGE_RE = re.compile(r"\[圖:\s*([^\]]+)\]")
MARKDOWN_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.IGNORECASE)
ABSOLUTE_PREFIX_RE = re.compile(r"^[A-Za-z]:/.*?/program-db/", re.IGNORECASE)
BLANK_RE = re.compile(r"(?:\\_){4,}|_{6,}")
CASE_BLOCK_RE = re.compile(
    r"\$?\\left(?:\\\\)?\s*\{?\s*\\begin\{(?:array|matrix)\}(?:\{[^}]*\})?\s*(.*?)\s*\\end\{(?:array|matrix)\}\s*\\right\.?\s*(?:\\\\)?\$?",
    re.S,
)
SOURCE_LABEL_RE = re.compile(r"【[^】]*(?:自命題|期中考|模擬考|段考|學測|指考)[^】]*】")
EMBEDDED_EXPLANATION_RE = re.compile(r"(【解析】|【解】|【解1】|【解2】|【證明】)")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


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


def section_for_order(order: int) -> str:
    if order <= 8:
        return SECTION_LINEAR
    if order <= 31:
        return SECTION_QUADRATIC
    return SECTION_HIGHER


def normalize_asset_path(raw: str) -> str:
    text = str(raw or "").strip().replace("\\", "/")
    if not text:
        return ""
    if text.startswith("./"):
        text = text[2:]
    text = ABSOLUTE_PREFIX_RE.sub("program-db/", text)
    marker = text.lower().find("program-db/")
    if marker >= 0:
        text = text[marker:]
    text = re.sub(r"(?i)\.(emf|wmf)(?:\.png)+$", r".\1.png", text)
    text = re.sub(r"(?i)\.(emf|wmf)$", lambda match: f"{match.group(0)}.png", text)
    text = re.sub(r"(?i)\.png(?:\.png)+$", ".png", text)
    return text


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def image_repl(match: re.Match[str]) -> str:
        normalized = normalize_asset_path(match.group(1))
        return f"\n[圖:{normalized}]\n" if normalized else ""

    value = HTML_IMAGE_RE.sub(image_repl, value)
    value = MARKDOWN_IMAGE_RE.sub(image_repl, value)
    value = GENERIC_IMAGE_RE.sub(
        lambda match: f"[圖:{normalize_asset_path(match.group(1))}]",
        value,
    )
    return value


def normalize_case_blocks(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        body = match.group(1).replace("\n", " ")
        body = re.sub(r"\s*\\\\\s*", "\n", body)
        body = re.sub(r"\s*\\\s*", " ", body)
        parts = [re.sub(r"\s{2,}", " ", part).strip(" ，；") for part in body.split("\n")]
        parts = [part for part in parts if part]
        return "；".join(parts)

    return CASE_BLOCK_RE.sub(repl, text)


def normalize_text(text: str) -> str:
    value = replace_inline_images(str(text or ""))
    replacements = {
        "\r\n": "\n",
        "\r": "\n",
        "\u3000": " ",
        "\xa0": " ",
        "\u2002": " ",
        "\u2003": " ",
        "\u2004": " ",
        "\u2005": " ",
        "\u2006": " ",
        "\u2007": " ",
        "\u2008": " ",
        "\u2009": " ",
        "\u200a": " ",
        "\u200b": "",
        "\u200c": "",
        "\u200d": "",
        "\u205f": " ",
        "﹐": "，",
        "﹒": "。",
        "﹕": "：",
        "﹖": "？",
        "．": "．",
        "【解析】 ": "【解析】",
        "【解】 ": "【解】",
        "[圖:./program-db/": "[圖:program-db/",
        "f (x)": "f(x)",
        "g (x)": "g(x)",
        "h (x)": "h(x)",
        "x 0": "x > 0",
        "x 2": "x < 2",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = normalize_case_blocks(value)
    value = BLANK_RE.sub("____________", value)
    value = re.sub(r"\b([fgh])\s+\(", r"\1(", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = clean_question_body(value).strip()
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def split_embedded_explanation(question_text: str, explanation_text: str) -> tuple[str, str]:
    q_text = str(question_text or "")
    e_text = str(explanation_text or "")
    match = EMBEDDED_EXPLANATION_RE.search(q_text)
    if not match:
        return q_text, e_text
    head = q_text[: match.start()].strip()
    tail = q_text[match.start() :].strip()
    if e_text.strip():
        tail = f"{tail}\n{e_text.strip()}"
    return head, tail


def extract_marker(tags: list[str]) -> str:
    for tag in tags or []:
        if str(tag).startswith("marker:"):
            return str(tag).split(":", 1)[1].strip()
    return ""


def normalize_category(current: str, marker: str) -> str:
    if marker.startswith("隨堂練習"):
        return "重要"
    if marker.startswith("範例"):
        return "基本"
    return current if current in {"基本", "重要", "綜合"} else "綜合"


def normalize_difficulty(current: str) -> str:
    return current if current in {"易", "中", "難"} else "易"


def rebuild_title(marker: str, question_text: str, fallback: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", str(question_text or ""))
    seed = SOURCE_LABEL_RE.sub("", seed)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ，。；：")
    if len(seed) > 28:
        seed = seed[:28].rstrip(" ，。；：")
    if marker:
        return f"{marker}：{seed}" if seed else marker
    return fallback


def rebuild_tags(existing_tags: list[str], section: str, marker: str) -> list[str]:
    tags = [CHAPTER_CODE, f"section:{section}"]
    if marker:
        tags.append(f"marker:{marker}")
    if "needs-formula-id" in [str(tag) for tag in existing_tags or []]:
        tags.append("needs-formula-id")
    return tags


def build_questions_payload(records: list[dict]) -> dict:
    image_refs = sorted(
        {
            match.group(1)
            for record in records
            for field in ("question_text", "explanation_text")
            for match in GENERIC_IMAGE_RE.finditer(str(record.get(field, "")))
        }
    )
    return {
        "meta": {
            "chapter_code": CHAPTER_CODE,
            "source_ref": SOURCE_REF,
            "count": len(records),
            "schema": "question-import-pack-v1-preview",
        },
        "summary": {
            "count": len(records),
            "sections": dict(Counter(record.get("source_section", "") for record in records)),
            "categories": dict(Counter(record.get("question_category", "") for record in records)),
            "image_references": image_refs,
        },
        "questions": records,
    }


def build_preview_payload(records: list[dict]) -> dict:
    by_section: dict[str, list[dict]] = {}
    for record in records:
        section = str(record.get("source_section", "")).strip() or "未分類"
        by_section.setdefault(section, []).append(
            {
                "id": record.get("id", ""),
                "title": record.get("title", ""),
                "question_category": record.get("question_category", ""),
                "difficulty": record.get("difficulty", ""),
                "formula_id": record.get("formula_id", ""),
            }
        )
    return {
        "meta": {
            "chapter_code": CHAPTER_CODE,
            "count": len(records),
            "unassigned_formula_id_count": sum(1 for record in records if not record.get("formula_id")),
        },
        "by_category": dict(Counter(record.get("question_category", "") for record in records)),
        "by_section": by_section,
    }


def build_review_markdown(records: list[dict], png_created: int) -> str:
    review_ids = [record["id"] for record in records if REVIEW_OVERRIDES.get(record.get("source_order"))]
    lines = [
        "# s1-1-11 Review Needed",
        "",
        "## Current extraction status",
        "",
        f"- Parsed question records: {len(records)}",
        f"- Assigned `formula_id`: {sum(1 for record in records if record.get('formula_id'))}",
        f"- PNG sidecars created this run: {png_created}",
        f"- Needs manual review: {len(review_ids)}",
        "",
        "## Manual review items",
        "",
    ]
    if review_ids:
        for record in records:
            note = REVIEW_OVERRIDES.get(record.get("source_order"))
            if not note:
                continue
            lines.append(f"- `{record['id']}`")
            lines.append(f"  - {note}")
    else:
        lines.append("- None")
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已套用。",
            "- `emf/wmf` 會補成 `.png` sidecar，題目與解析中的圖片引用一律改成 `[圖:...]`。",
            "- `1-11` 的主題分支已依一次、二次、高次、分式、根式與應用類型重建。",
        ]
    )
    return "\n".join(lines) + "\n"


def build_manifest_payload() -> dict:
    return {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "source_files": [
            {"path": SOURCE_REF, "role": "primary_docx", "note": "原始 Word 題庫來源"}
        ],
        "extracted_files": [
            {"path": SOURCE_MD, "role": "pandoc_markdown"},
            {"path": "questions.json", "role": "question_pack_preview"},
            {"path": "preview.json", "role": "assignment_preview"},
            {"path": "review-needed.md", "role": "manual_review_notes"},
        ],
        "asset_roots": [
            {"path": "assets/media", "role": "pandoc_extracted_media"}
        ],
        "question_schema": {
            "id": "string",
            "title": "string",
            "question_text": "string",
            "answer_text": "string",
            "explanation_text": "string",
            "chapter_code": "string",
            "formula_id": "string",
            "difficulty": "易|中|難",
            "question_category": "基本|重要|綜合",
            "source_type": "string",
            "source_ref": "string",
            "source_section": "string",
            "source_order": "number",
            "tags": [],
        },
        "default_mapping_rules": {
            "範例": "基本",
            "隨堂練習": "重要",
            "high_confidence_formula_id": "直接掛到分支重點",
            "unmatched_formula_id": "保留章節綜合",
        },
        "status": "review_ready",
    }


def build_topic_rows(existing_topics: list[dict]) -> list[dict]:
    now = datetime.now().astimezone().isoformat()
    max_index = max(
        [int(topic.get("manualOrder", 0) or 0) for topic in existing_topics]
        + [int(topic.get("originalIndex", 0) or 0) for topic in existing_topics]
        + [0]
    )
    next_index = max_index + 1

    common = {
        "stage": "高中",
        "grade": "高一",
        "term": "上學期",
        "chapter": CHAPTER_TITLE,
        "domain": "數學",
        "difficulty": "中等",
        "contentTypes": ["公式主題", "例題整理", "不等式判斷", "應用問題"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": now,
        "chapter_code": CHAPTER_CODE,
        "gradeLabel": "高一上",
        "chapterCode": CHAPTER_CODE,
        "section": CHAPTER_TITLE,
        "domainSub": "",
        "relatedChapters": [],
        "relatedTopicIds": [],
        "stageOrder": 2,
        "gradeOrder": 4,
        "termOrder": 1,
        "chapterOrder": 11,
    }

    def allocate() -> int:
        nonlocal next_index
        value = next_index
        next_index += 1
        return value

    root_index = allocate()
    rows = [
        {
            **common,
            "id": ROOT_TOPIC_ID,
            "title": CHAPTER_TITLE,
            "formula": {
                "type": "labeled-lines",
                "lines": [
                    {"label": "一次不等式", "values": ["$ax+b\\gtrless 0$"]},
                    {"label": "二次不等式", "values": ["$ax^2+bx+c\\gtrless 0$"]},
                    {"label": "分式不等式", "values": ["$\\frac{f(x)}{g(x)}\\gtrless 0$"]},
                ],
            },
            "chapterRole": "核心主題",
            "parentId": "",
            "tags": ["word匯入", "主題核心", CHAPTER_CODE, "高一上", "不等式"],
            "usage": ["統整一次、二次、高次與分式不等式的判號與求解方法。"],
            "examples": ["先找零點或臨界點，再做區間判號，是這章最核心的共通流程。"],
            "tips": ["先確認定義域，再看是否能因式分解、配方或改寫成同義不等式。"],
            "notes": ["圖像題、應用題最後仍會回到不等式的區間條件。"],
            "mistakes": ["常忽略分母不為0、平方後增添條件，或把開區間與閉區間寫錯。"],
            "isBranch": False,
            "originalIndex": root_index,
            "manualOrder": root_index,
        }
    ]

    branch_specs = [
        (
            "s1-1-11-linear-inequality-basic",
            "一次不等式基本解法",
            [
                {"label": "標準型", "values": ["$ax+b\\gtrless 0$"]},
                {"label": "聯立條件", "values": ["$\\{a_1x+b_1\\gtrless 0,\\ a_2x+b_2\\gtrless 0\\}$"]},
            ],
            "處理通分、移項與聯立一次不等式的基本題。",
            "注意乘除負數時不等號方向要反轉。",
        ),
        (
            "s1-1-11-linear-inequality-application",
            "一次不等式參數與應用",
            [
                {"label": "參數判定", "values": ["$ax+b\\gtrless cx+d$"]},
                {"label": "情境模型", "values": ["$f(x)\\gtrless k$"]},
            ],
            "把文字情境或參數條件改寫成一次不等式後求範圍。",
            "先分清未知量是參數還是題目中的自變數。",
        ),
        (
            "s1-1-11-quadratic-solution-interval",
            "二次不等式解集反推",
            [
                {"label": "因式型", "values": ["$(x-r_1)(x-r_2)\\gtrless 0$"]},
                {"label": "代換", "values": ["$f(kx+h)\\gtrless 0$"]},
            ],
            "由已知解區間反推二次式係數關係，或改寫輸入變數後重新求解。",
            "看到『解為某區間』時，先寫成同解的因式型最穩。",
        ),
        (
            "s1-1-11-quadratic-parameter-sign",
            "二次不等式恆正恆負與參數",
            [
                {"label": "判別式", "values": ["$D=b^2-4ac$"]},
                {"label": "恆成立", "values": ["$a>0,\\ D\\leq 0$ 或 $a<0,\\ D\\leq 0$"]},
            ],
            "判斷二次式對所有實數是否恆正或恆負，並據此求參數範圍。",
            "除了判別式，也要同時檢查二次項係數方向。",
        ),
        (
            "s1-1-11-quadratic-transform-model",
            "二次不等式變形與條件建模",
            [
                {"label": "配方", "values": ["$ax^2+bx+c=a(x-h)^2+k$"]},
                {"label": "條件建模", "values": ["$u=x^2+px+q$"]},
            ],
            "把幾何、面積、體積或複合條件改寫成二次不等式處理。",
            "遇到複合條件時，先拆成幾個基本不等式再取交集。",
        ),
        (
            "s1-1-11-higher-degree-sign-chart",
            "高次不等式與號線分析",
            [
                {"label": "因式分解", "values": ["$f(x)=a\\prod (x-r_i)^{m_i}$"]},
                {"label": "號線", "values": ["奇重根換號，偶重根不換號"]},
            ],
            "利用根的重數與號線圖解高次多項式不等式。",
            "先找所有實根，再看重數決定是否換號。",
        ),
        (
            "s1-1-11-rational-inequality",
            "分式不等式",
            [
                {"label": "基本型", "values": ["$\\frac{f(x)}{g(x)}\\gtrless 0$"]},
                {"label": "條件", "values": ["$g(x)\\neq 0$"]},
            ],
            "把分式不等式轉成零點與分母禁值的區間判號問題。",
            "不能只看分子分母乘起來的號，還要把分母不可為零保留下來。",
        ),
        (
            "s1-1-11-radical-absolute-inequality",
            "根式與絕對值不等式",
            [
                {"label": "根式", "values": ["$\\sqrt{f(x)}\\gtrless g(x)$"]},
                {"label": "絕對值", "values": ["$|f(x)|\\gtrless c$"]},
            ],
            "處理平方根、絕對值與距離觀念的不等式。",
            "平方前先補齊定義域與左右兩邊正負條件。",
        ),
        (
            "s1-1-11-parameter-application-inequality",
            "參數極值與應用不等式",
            [
                {"label": "參數極值", "values": ["$\\frac{ax^2+bx+c}{x^2+1}=k$"]},
                {"label": "應用模型", "values": ["$f(t)\\gtrless k$"]},
            ],
            "把最值、溫度、速度等情境轉成不等式並求臨界範圍。",
            "先整理成標準二次或分式形式，再判斷可行區間。",
        ),
    ]

    for topic_id, title, lines, usage, mistake in branch_specs:
        index = allocate()
        rows.append(
            {
                **common,
                "id": topic_id,
                "title": title,
                "formula": {"type": "labeled-lines", "lines": lines},
                "chapterRole": "分支重點",
                "parentId": ROOT_TOPIC_ID,
                "tags": ["word匯入", "分支重點", CHAPTER_CODE, "高一上", "不等式"],
                "usage": [usage],
                "examples": [usage],
                "tips": ["先把題目化成標準型，再做區間分析會穩很多。"],
                "notes": ["這類題目常需要同時處理等號能不能取到。"],
                "mistakes": [mistake],
                "isBranch": True,
                "originalIndex": index,
                "manualOrder": index,
            }
        )

    return rows


def upsert_questions(question_db_path: Path, rows: list[dict]):
    payload = read_json(question_db_path)
    questions = payload.get("questions", [])
    existing = [row for row in questions if str(row.get("chapter_code")) != CHAPTER_CODE]
    payload["questions"] = existing + rows
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(payload["questions"])
    payload["meta"]["updatedAt"] = datetime.now().astimezone().isoformat()
    write_json(question_db_path, payload)


def upsert_topics(formula_db_path: Path):
    payload = read_json(formula_db_path)
    topics = payload.get("topics", [])
    existing = [
        topic
        for topic in topics
        if str(topic.get("chapterCode") or topic.get("chapter_code")) != CHAPTER_CODE
    ]
    new_topics = build_topic_rows(existing)
    payload["topics"] = existing + new_topics
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(payload["topics"])
    payload["meta"]["updatedAt"] = datetime.now().astimezone().isoformat()
    payload["meta"]["lastImportSource"] = "1-11轉.docx"
    write_json(formula_db_path, payload)


def finalize_records(records: list[dict]) -> list[dict]:
    finalized = []
    for record in sorted(records, key=lambda item: int(item.get("source_order", 0) or 0)):
        row = dict(record)
        order = int(row.get("source_order", 0) or 0)
        marker = extract_marker(row.get("tags", []))
        section = section_for_order(order)

        if order in QUESTION_OVERRIDES:
            row.update(QUESTION_OVERRIDES[order])

        question_text, explanation_text = split_embedded_explanation(
            row.get("question_text", ""),
            row.get("explanation_text", ""),
        )

        row["question_text"] = normalize_text(question_text)
        row["answer_text"] = normalize_text(row.get("answer_text", ""))
        row["explanation_text"] = normalize_text(explanation_text)
        row["chapter_code"] = CHAPTER_CODE
        row["formula_id"] = FORMULA_BY_ORDER.get(order, "")
        row["difficulty"] = normalize_difficulty(str(row.get("difficulty", "")).strip())
        row["question_category"] = normalize_category(str(row.get("question_category", "")).strip(), marker)
        row["source_ref"] = SOURCE_REF
        row["source_section"] = section
        row["tags"] = rebuild_tags(row.get("tags", []), section, marker)
        row["title"] = rebuild_title(marker, row["question_text"], row.get("title", ""))
        finalized.append(row)
    return finalized


def main():
    parser = argparse.ArgumentParser(description="Finalize s1-1-11 question pack and sync databases.")
    parser.add_argument("--questions", required=True)
    parser.add_argument("--preview", required=True)
    parser.add_argument("--review", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--asset-dir", required=True)
    parser.add_argument("--formula-db", required=True)
    parser.add_argument("--question-db", required=True)
    args = parser.parse_args()

    questions_path = Path(args.questions)
    preview_path = Path(args.preview)
    review_path = Path(args.review)
    manifest_path = Path(args.manifest)
    asset_dir = Path(args.asset_dir)
    formula_db_path = Path(args.formula_db)
    question_db_path = Path(args.question_db)

    payload = read_json(questions_path)
    records = finalize_records(payload.get("questions", []))
    png_created = ensure_png_sidecars(asset_dir)

    write_json(questions_path, build_questions_payload(records))
    write_json(preview_path, build_preview_payload(records))
    write_json(manifest_path, build_manifest_payload())
    review_path.write_text(build_review_markdown(records, png_created), encoding="utf-8")

    upsert_questions(question_db_path, records)
    upsert_topics(formula_db_path)

    topic_count = sync_legacy_js_from_db(formula_db_path)
    question_count = sync_question_js_from_db(question_db_path)
    sync_extra_web_from_db()

    print(f"questions finalized: {len(records)}")
    print(f"png sidecars created: {png_created}")
    print(f"topics synced: {topic_count}")
    print(f"questions synced: {question_count}")


if __name__ == "__main__":
    main()
