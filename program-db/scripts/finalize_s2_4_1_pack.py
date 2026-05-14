import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


CHAPTER_CODE = "s2-4-1"
CHAPTER_TITLE = "三角比定義與基本關係"

FORMULA_BY_ORDER = {}
for order in range(1, 6):
    FORMULA_BY_ORDER[order] = "senior-directed-angle-quadrant-signs"
for order in range(6, 17):
    FORMULA_BY_ORDER[order] = "senior-right-triangle-trig-definition"
for order in range(17, 24):
    FORMULA_BY_ORDER[order] = "senior-special-right-triangles-values"
for order in range(24, 31):
    FORMULA_BY_ORDER[order] = "senior-unit-circle-coordinate-definition"
for order in range(31, 40):
    FORMULA_BY_ORDER[order] = "senior-trig-reference-angle-sign-workflow-s241"
for order in range(40, 46):
    FORMULA_BY_ORDER[order] = "senior-trig-quadrantal-conversion-rules-s241"
for order in range(46, 54):
    FORMULA_BY_ORDER[order] = "senior-trig-ratio-reduction-formulas-s241"
FORMULA_BY_ORDER[54] = "senior-trig-measurement-modeling"
for order in range(55, 62):
    FORMULA_BY_ORDER[order] = "senior-unit-circle-coordinate-definition"
FORMULA_BY_ORDER[62] = "senior-trig-measurement-modeling"
for order in range(63, 68):
    FORMULA_BY_ORDER[order] = "senior-trig-identities-and-transform-rules"
for order in range(68, 81):
    FORMULA_BY_ORDER[order] = "senior-trig-identity-solving-s241"
FORMULA_BY_ORDER[81] = "senior-trig-measurement-modeling"


QUESTION_OVERRIDES = {
    3: "設 $S=\\{\\theta_n\\mid \\theta_n=45^\\circ\\times n,\\ n\\in\\mathbb{Z},\\ 1\\le n\\le 100\\}$，則 $S$ 中有多少個角為第二象限角？",
    15: "在 $\\overline{AD}$ 上取二點 $B,C$，使 $\\overline{AB}:\\overline{BC}:\\overline{CD}=1:2:3$。以 $\\overline{BC}$ 為直徑作半圓，圖中記 $\\alpha,\\beta$ 如圖所示，求 $\\tan\\alpha\\cdot\\tan\\beta$。",
    16: "如圖所示：□ABGH、□BCFG、□CDEF 皆為正方形，設 $\\angle BHC=\\alpha$，試求：\n(1) $\\tan\\alpha$\n(2) $\\angle CHE$",
    62: "沙漠旅行中，有一駱駝客告訴旅行者：離此最近的兩綠洲，一是在面對太陽向右轉 $50^\\circ$，前進 5 公里處；另一是在面對太陽向左轉 $40^\\circ$，前進 12 公里處。試問兩綠洲的距離。",
}


EXPLANATION_OVERRIDES = {
    3: "【解析】設 $\\theta_n=45^\\circ n$。\n若 $\\theta_n$ 為第二象限角，則存在整數 $t$ 使得\n$90^\\circ+360^\\circ t<45^\\circ n<180^\\circ+360^\\circ t$。\n兩邊同除以 $45^\\circ$，得\n$2+8t<n<4+8t$。\n因此只有 $n=8t+3$ 可能成立。\n再由 $1\\le n\\le 100$，得\n$1\\le 8t+3\\le 100$，故 $0\\le t\\le 12$。\n共有 $13$ 個整數解，所以第二象限角共有 13 個。",
    7: "【龍騰自命題】\n【解析】由 $\\sin A=\\frac{8}{17}=\\frac{\\overline{BC}}{\\overline{AB}}$，可設 $\\overline{BC}=8k$、$\\overline{AB}=17k$。\n又已知 $\\overline{AC}=10$，利用畢氏定理：\n$(17k)^2=10^2+(8k)^2$，\n得 $225k^2=100$，所以 $k=\\frac{2}{3}$。\n因此 $\\overline{BC}=\\frac{16}{3}$，$\\overline{AB}=\\frac{34}{3}$。\n故\n$\\cos A=\\frac{\\overline{AC}}{\\overline{AB}}=\\frac{10}{34/3}=\\frac{15}{17}$，\n$\\tan A=\\frac{\\overline{BC}}{\\overline{AC}}=\\frac{16/3}{10}=\\frac{8}{15}$。\n所以正確選項為 (1)(4)。",
    8: "【解析】(1) 在 $\\triangle ABD$ 中，$\\overline{AD}=7$，$\\overline{BD}=24$，故\n$\\overline{AB}=\\sqrt{7^2+24^2}=25$。\n因此 $\\sin A=\\frac{\\overline{BD}}{\\overline{AB}}=\\frac{24}{25}$。\n(2) 在 $\\triangle BCD$ 中，已知 $\\tan C=\\frac{12}{5}=\\frac{\\overline{BD}}{\\overline{CD}}=\\frac{24}{\\overline{CD}}$，\n所以 $\\overline{CD}=10$。\n故 $\\overline{BC}=\\sqrt{10^2+24^2}=26$。",
    10: "【龍騰自命題】\n【解析】在 $\\triangle ACD$ 中，\n$\\cos A=\\frac{\\overline{AD}}{\\overline{CA}}=\\frac{\\overline{AD}}{b}$，\n所以 $\\overline{AD}=b\\cos A$。\n又在 $\\triangle AHD$ 中，$\\angle AHD=\\angle B$，因此\n$\\sin B=\\frac{\\overline{AD}}{\\overline{AH}}$。\n故\n$\\overline{AH}=\\frac{\\overline{AD}}{\\sin B}=\\frac{b\\cos A}{\\sin B}=b\\cos A\\csc B$。\n所以正確選項為 (3)。",
    11: "【解析】由 $\\sin B=\\frac{3}{5}=\\frac{\\overline{AD}}{\\overline{AB}}$，且 $\\overline{AB}=25$，得 $\\overline{AD}=15$，所以 (A) 正確。\n又 $\\sin C=\\frac{15}{17}$，故可取對邊與斜邊比為 $15:17$，得到 $\\cos C=\\frac{8}{17}$、$\\tan C=\\frac{15}{8}$。\n因此 $\\frac{\\overline{AD}}{\\overline{CD}}=\\frac{15}{8}$，得 $\\overline{CD}=8$，所以 (B) 正確。\n再由 $\\cos B=\\frac{4}{5}=\\frac{\\overline{BD}}{\\overline{AB}}$，得 $\\overline{BD}=20$，故 $\\overline{BC}=20+8=28$，所以 (D) 正確。\n而 $\\sin C=\\frac{\\overline{AD}}{\\overline{AC}}=\\frac{15}{17}$，得 $\\overline{AC}=17$，所以 (C) 正確。\n最後 $A=180^\\circ-B-C$，並不會使 $\\sin A=\\frac{15}{17}$，故 (E) 錯。\n因此正確選項為 (A)(B)(C)(D)。",
    14: "【解析】如圖作輔助線，使 $\\overline{BE}\\parallel\\overline{CP}$、$\\overline{CF}\\parallel\\overline{BP}$。\n由相似比可得\n$\\frac{\\overline{BE}}{\\overline{CP}}=\\frac{\\overline{AB}}{\\overline{AC}}=\\frac{2}{5}$，\n$\\frac{\\overline{CF}}{\\overline{BP}}=\\frac{\\overline{CD}}{\\overline{BD}}=\\frac{1}{4}$。\n又\n$\\tan\\angle APB=\\frac{\\overline{BE}}{\\overline{BP}}$，\n$\\tan\\angle CPD=\\frac{\\overline{CF}}{\\overline{CP}}$。\n所以\n$(\\tan\\angle APB)(\\tan\\angle CPD)\n=\\frac{\\overline{BE}}{\\overline{BP}}\\cdot\\frac{\\overline{CF}}{\\overline{CP}}\n=\\frac{\\overline{BE}}{\\overline{CP}}\\cdot\\frac{\\overline{CF}}{\\overline{BP}}\n=\\frac{2}{5}\\cdot\\frac{1}{4}=\\frac{1}{10}$。",
    15: "【解析】由圖中的相似三角形可得\n$\\triangle PBC\\sim\\triangle QBA\\sim\\triangle RDC$。\n因此\n$\\frac{\\overline{PB}}{\\overline{QB}}=\\frac{\\overline{BC}}{\\overline{BA}}=\\frac{2}{1}$，\n故 $\\overline{PB}=2\\overline{QB}$；\n又\n$\\frac{\\overline{PB}}{\\overline{RD}}=\\frac{\\overline{BC}}{\\overline{CD}}=\\frac{2}{3}$，\n所以 $\\overline{RD}=\\frac{3}{2}\\overline{PB}$。\n配合圖中的線段分割，可整理出\n$\\overline{PQ}=\\frac{3}{2}\\overline{PB}$，$\\overline{PR}=\\frac{5}{2}\\overline{PC}$，且 $\\overline{AQ}=\\frac{1}{2}\\overline{PC}$。\n因此\n$\\tan\\alpha\\cdot\\tan\\beta\n=\\frac{\\overline{AQ}}{\\overline{PQ}}\\cdot\\frac{\\overline{RD}}{\\overline{PR}}\n=\\frac{\\frac12\\overline{PC}}{\\frac32\\overline{PB}}\\cdot\\frac{\\frac32\\overline{PB}}{\\frac52\\overline{PC}}\n=\\frac{1}{5}$。",
    16: "【解析】(1) 過 $C$ 作 $\\overline{CK}\\perp\\overline{HB}$ 於 $K$，並令三個正方形的邊長依圖取值。由圖形關係可得\n$\\overline{BK}=\\overline{CK}=\\frac{\\sqrt2}{2}$，\n$\\overline{HK}=\\sqrt2+\\frac{\\sqrt2}{2}=\\frac{3\\sqrt2}{2}$。\n因此\n$\\tan\\alpha=\\frac{\\overline{CK}}{\\overline{HK}}=\\frac{\\frac{\\sqrt2}{2}}{\\frac{3\\sqrt2}{2}}=\\frac{1}{3}$。\n(2) 由圖可得 $\\angle CDH=\\alpha$，且 $\\angle BHE=45^\\circ$，所以\n$\\alpha+\\angle CHE=45^\\circ$。\n故\n$\\angle CHE=45^\\circ-\\alpha$。\n若進一步用正切差角公式，因 $\\tan\\alpha=\\frac13$，可得 $\\tan\\angle CHE=\\frac12$。",
    62: "【解析】設旅行者所在位置為 $O$，兩綠洲分別為 $A,B$。\n若以面向太陽的方向作為基準，則可視為極座標中的\n$A=[5,-50^\\circ]$，$B=[12,40^\\circ]$。\n因此兩條方向線的夾角為\n$40^\\circ-(-50^\\circ)=90^\\circ$。\n所以 $\\triangle AOB$ 為直角三角形，兩股長分別為 5 與 12。\n故兩綠洲距離\n$\\overline{AB}=\\sqrt{5^2+12^2}=13$（公里）。",
    65: "【解析】\n$\\frac{\\sin\\theta}{1+\\cos\\theta}+\\frac{\\sin\\theta}{1-\\cos\\theta}\n=\\frac{\\sin\\theta(1-\\cos\\theta)+\\sin\\theta(1+\\cos\\theta)}{(1+\\cos\\theta)(1-\\cos\\theta)}\n=\\frac{2\\sin\\theta}{1-\\cos^2\\theta}\n=\\frac{2\\sin\\theta}{\\sin^2\\theta}\n=\\frac{2}{\\sin\\theta}$。",
    69: "【解析】由根與係數關係，\n$\\sin\\theta+\\cos\\theta=\\frac{1+a}{2}$，\n$\\sin\\theta\\cos\\theta=\\frac{a}{4}$。\n將第一式平方，得\n$1+2\\sin\\theta\\cos\\theta=\\frac{(1+a)^2}{4}$。\n代入第二式，可得\n$1+\\frac{a}{2}=\\frac{1+2a+a^2}{4}$，\n化簡得 $a^2=3$。\n又已知 $a>0$，故 $a=\\sqrt3$。",
    74: "【解析】由 $\\cos\\theta=\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}$，得\n$\\cos^2\\theta=\\sin\\theta$。\n再由 $\\sin^2\\theta+\\cos^2\\theta=1$，可得\n$\\sin^2\\theta+\\sin\\theta-1=0$。\n因為 $\\sin\\theta$ 需介於 $-1$ 與 $1$ 之間，所以\n$\\sin\\theta=\\frac{-1+\\sqrt5}{2}$。\n因此\n$\\frac{1}{1-\\sin\\theta}+\\frac{1}{1+\\sin\\theta}\n=\\frac{2}{1-\\sin^2\\theta}\n=\\frac{2}{\\cos^2\\theta}\n=\\frac{2}{\\sin\\theta}\n=\\frac{4}{\\sqrt5-1}\n=\\sqrt5+1$。",
    81: "【解析】設半圓圓心為 $O$，並令右上頂點為 $C$。因半徑為 1，可設\n$\\overline{OB}=\\cos\\theta$，$\\overline{BC}=\\sin\\theta$。\n矩形的底邊 $\\overline{AB}=2\\cos\\theta$，高為 $\\sin\\theta$。\n又已知周長為 4，所以\n$2(2\\cos\\theta+\\sin\\theta)=4$，\n即 $2\\cos\\theta+\\sin\\theta=2$。\n移項得 $\\sin\\theta=2(1-\\cos\\theta)$。\n平方並用 $\\sin^2\\theta=1-\\cos^2\\theta$ 代入：\n$1-\\cos^2\\theta=4-8\\cos\\theta+4\\cos^2\\theta$，\n整理得\n$5\\cos^2\\theta-8\\cos\\theta+3=0$，\n故 $(5\\cos\\theta-3)(\\cos\\theta-1)=0$。\n由圖形可知 $\\theta\\ne 0$，所以 $\\cos\\theta=\\frac35$，進而 $\\sin\\theta=\\frac45$。\n因此矩形面積為\n$\\overline{AB}\\cdot\\overline{BC}=2\\cos\\theta\\sin\\theta=2\\cdot\\frac35\\cdot\\frac45=\\frac{24}{25}$。",
}


REVIEW_NOTES = {
    15: "圖中 α、β 的位置依賴附圖判讀，匯入後建議先看題幹與圖是否靠得夠近。",
    16: "這題原始 Word 的小題在抽取時遺失過一次，已依解析補回，建議前端再確認一次。",
    21: "22.5° 題高度依賴附圖，建議確認圖片清晰度與題幹換行。",
    62: "沙漠綠洲題已重寫解析，但仍建議在前端確認題圖位置。",
    81: "半圓內矩形題已重算面積，建議匯入後優先核對最終答案顯示。",
}


MATH_BACKTICK_RE = re.compile(r"\$`(.*?)`\$", re.S)
INLINE_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.I)
GENERIC_IMAGE_RE = re.compile(r"\[圖:\s*([^\]]+)\]", re.I)
VECTOR_PATH_RE = re.compile(r"(?i)\.(emf|wmf)(?!\.png)")
MATH_FENCE_RE = re.compile(r"```(?:\s*math)?\s*(.*?)```", re.S)
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
TEXT_WRAPPER_RE = re.compile(r"\\text\{([^}]*)\}")


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
    text = text.replace("/s2-2-1/", f"/{CHAPTER_CODE}/")
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


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = HTML_COMMENT_RE.sub("", value)
    value = MATH_BACKTICK_RE.sub(lambda m: f"${m.group(1).strip()}$", value)
    value = MATH_FENCE_RE.sub(lambda m: m.group(1).strip(), value)
    value = TEXT_WRAPPER_RE.sub(lambda m: m.group(1), value)
    value = value.replace("`", "")
    value = value.replace("<br />", "\n").replace("<br/>", "\n")
    value = re.sub(r"(?m)^>\s*", "", value)
    replacements = {
        "\\mspace{6mu}": " ",
        "\\cdots": "⋯",
        "\\leq": "\\le",
        "\\geq": "\\ge",
        "\\ne": "≠",
        "\\in": "\\in",
        "\\bot": "\\bot",
        "\\Rightarrow": "⇒",
        "\\sqrt": "\\sqrt",
        "\\[": "[",
        "\\]": "]",
        "\\left(": "(",
        "\\right)": ")",
        "\\left[": "[",
        "\\right]": "]",
        "\\langle": "〈",
        "\\rangle": "〉",
        "\\|": "|",
        "{^\\circ}": "°",
        "^{。}": "°",
        "＋": "+",
        "－": "-",
        "＝": "=",
        "．": "·",
        "﹐": "，",
        "﹒": "。",
        "⇨": "⇒",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = value.replace("sinθ", "sinθ")
    value = value.replace("cosθ", "cosθ")
    value = value.replace("tanθ", "tanθ")
    value = re.sub(r"\[圖:\s*([^\]]+?)\]", lambda m: f"[圖: {normalize_asset_path(m.group(1))}]", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]{2,}", " ", value)
    value = value.replace("隨堂練習.", "")
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
            {"path": "source/2-3轉.docx", "role": "primary_docx"},
        ],
        "extracted_files": [
            {"path": "extracted/2-3轉.md", "role": "pandoc_markdown"},
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
            "- 這章另外手修了有向角、特殊角、極座標、三角關係式與圖形應用題中最容易碎掉的題目。",
        ]
    )
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Finalize s2-4-1 question pack.")
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
        if source_order in EXPLANATION_OVERRIDES:
            row["explanation_text"] = EXPLANATION_OVERRIDES[source_order]
        row["question_text"] = normalize_text(row.get("question_text", ""))
        row["explanation_text"] = normalize_text(row.get("explanation_text", ""))
        row["answer_text"] = normalize_text(row.get("answer_text", ""))
        row["formula_id"] = FORMULA_BY_ORDER.get(source_order, "s2-4-1-trigonometric-ratio-core")
        marker = infer_marker(row.get("question_category", ""), row.get("title", ""))
        row["title"] = clean_question_title(rebuild_title(marker, row["question_text"]))
        row["tags"] = [
            CHAPTER_CODE if not str(tag).startswith("s2-4-1") and tag != "needs-formula-id" else tag
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
