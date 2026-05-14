import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body, clean_question_title


CHAPTER_CODE = "s2-1-2"
CHAPTER_TITLE = "級數"

FORMULA_BY_ORDER = {}
for order in range(1, 24):
    FORMULA_BY_ORDER[order] = "senior-arithmetic-geometric-series"
for order in range(24, 27):
    FORMULA_BY_ORDER[order] = "senior-series-partial-sum-difference-method-s212"
for order in range(27, 33):
    FORMULA_BY_ORDER[order] = "senior-arithmetic-geometric-series"
for order in range(33, 39):
    FORMULA_BY_ORDER[order] = "senior-series-weighted-sum-trick-s212"
for order in range(39, 53):
    FORMULA_BY_ORDER[order] = "senior-series-geometric-convergence-s212"
for order in range(53, 60):
    FORMULA_BY_ORDER[order] = "senior-series-partial-sum-difference-method-s212"
for order in range(60, 64):
    FORMULA_BY_ORDER[order] = "senior-series-sigma-modeling-workflow-s212"
for order in range(64, 67):
    FORMULA_BY_ORDER[order] = "senior-common-summation-formulas"
FORMULA_BY_ORDER[67] = "senior-power-sums-link-square-cube-s212"
for order in range(68, 75):
    FORMULA_BY_ORDER[order] = "senior-series-induction-proofs"


QUESTION_TEXT_OVERRIDES = {
    14: "若數列〈a_n〉為一等差數列，且 a_4 = 7，a_10 = 5，則下列何者正確？\n(A) a_1 = 8\n(B) a_20 = \\frac{5}{3}\n(C) 自第24項開始為負\n(D) 前 n 項總和為最大時，n = 24\n(E) 前 n 項總和為 60 時，n = 40。",
    15: "設〈a_n〉是一等差數列，a_2 = 65 且 a_8 = 11。若前 n 項總和為 S_n，當 S_n 有最大值時，n = ______。",
    39: "一個球從 81 公尺自由落下，每次著地後又跳回原高度的 \\frac{1}{3} 再落下。當它第五次著地時，共經過 ______ 公尺。",
    44: "一正方形的邊長為 10 公分，以各邊中點為頂點依序作出圖中的 6 個正方形，求這 6 個正方形周長的總和。\n[圖: program-db/imports/packs/s2-1-2/assets/media/image50.png]",
    49: "阿財每年年初存入銀行 10000 元，年利率 2%，每年計息一次。\n(1) 若依單利計息，則第 10 年年底的本利和多少？\n(2) 若依複利計息，則第 10 年年底的本利和多少？（近似值：1.02^{10} \\approx 1.22）",
    58: "已知數列〈a_n〉定義為\n$a_1 = 3$\n$a_{n+1} = a_n + 2n$（n 為正整數）\n求 a_100。",
    59: "已知數列〈a_n〉，若\n$\\sum_{k=1}^{n} a_k = n^2 + 3n + 1$\n則 a_n = ______。",
    66: "桃花島島主黃藥師要郭靖證明\n$1^2 + 2^2 + 3^2 + \\cdots + n^2 = \\frac{1}{6}n(n+1)(2n+1)$。\n黃蓉偷偷遞給郭靖一張小抄，如下圖所示。請你觀察圖形後，以面積觀點證明上式正確。\n[圖: program-db/imports/packs/s2-1-2/assets/media/image30.png]",
    73: "一數列〈a_n〉的遞迴定義式為\n$a_1 = 1$\n$a_{n+1} = 3a_n - 8$（n 為正整數）\n(1) 求實數 \\alpha，使得對任意正整數 n，$a_{n+1}-\\alpha = 3(a_n-\\alpha)$。\n(2) 承第(1)小題，試以 n 表示一般項 a_n。\n(3) 請以數學歸納法證明：對任意正整數 n，a_n 的一般項恆成立。",
}


EXPLANATION_OVERRIDES = {
    14: "【解析】設首項為 a_1，公差為 d，則\n$a_1+3d=7$\n$a_1+9d=5$\n解得 $a_1=8$，$d=-\\frac{1}{3}$。\n(B) $a_{20}=8+19\\left(-\\frac{1}{3}\\right)=\\frac{5}{3}$。\n(C) $a_n=8+(n-1)\\left(-\\frac{1}{3}\\right)<0 \\Rightarrow n>25$，所以自第 26 項開始為負。\n(D) $a_{25}=0$，因此前 n 項和在 $S_{24}$ 與 $S_{25}$ 取得最大值。\n(E) $S_n=\\frac{n}{2}[2a_1+(n-1)d]=\\frac{n}{2}\\left[16-(n-1)\\frac{1}{3}\\right]=60$，解得 $n=9$ 或 $40$。\n故正確選項為 (A)(B)。",
    15: "【解析】設首項為 a_1，公差為 d，則\n$a_1+d=65$\n$a_1+7d=11$\n解得 $a_1=74$，$d=-9$。\n因此 $a_n=74+(n-1)(-9)$。\n當 $a_n\\ge 0$ 時，前 n 項和仍在增加；由\n$74-9(n-1)\\ge 0 \\Rightarrow n\\le \\frac{83}{9}$，\n可知 $a_1,a_2,\\ldots,a_9>0$，而 $a_{10}<0$。\n所以前 n 項總和在 $n=9$ 時最大。",
    24: "【解析】已知 $S_n=a_1+a_2+\\cdots+a_n=n^2+3$。\n先得 $a_1=S_1=4$。\n當 $n\\ge 2$ 時，\n$a_n=S_n-S_{n-1}=(n^2+3)-[(n-1)^2+3]=2n-1$。\n因此\n$a_n=\n\\begin{cases}\n4, & n=1 \\\\\n2n-1, & n\\ge 2\n\\end{cases}$",
    25: "【解析】已知 $S_n=\\frac{n}{2n+1}$。\n先得 $a_1=S_1=\\frac{1}{3}$。\n當 $n\\ge 2$ 時，\n$a_n=S_n-S_{n-1}=\\frac{n}{2n+1}-\\frac{n-1}{2n-1}=\\frac{1}{4n^2-1}$。\n而當 $n=1$ 時，$\\frac{1}{4n^2-1}=\\frac{1}{3}$，與 $a_1$ 相同。\n故 $a_n=\\frac{1}{4n^2-1}$。",
    38: "【解析】設\n$S=1+2i+3i^2+4i^3+\\cdots+100i^{99}$。\n因為\n$iS=i+2i^2+3i^3+\\cdots+100i^{100}$，\n所以\n$(1-i)S=(1+i+i^2+\\cdots+i^{99})-100$。\n又 $i^4=1$，且 $100$ 為 $4$ 的倍數，因此\n$1+i+i^2+\\cdots+i^{99}=0$。\n故 $(1-i)S=-100$，\n$S=\\frac{-100}{1-i}=\\frac{-100(1+i)}{2}=-50(1+i)$。",
    44: "【解析】由畢氏定理可知，以正方形各邊中點為頂點所形成的新正方形，其邊長為原來的 $\\frac{\\sqrt{2}}{2}$ 倍，因此周長也乘上同樣的比值。\n六個正方形周長形成首項 40、公比 $\\frac{\\sqrt{2}}{2}$ 的等比級數。\n故周長總和為\n$40\\cdot\\frac{1-(\\frac{\\sqrt{2}}{2})^6}{1-\\frac{\\sqrt{2}}{2}}\n=40\\cdot\\frac{1-\\frac{1}{8}}{1-\\frac{\\sqrt{2}}{2}}\n=\\frac{70}{2-\\sqrt{2}}\n=35(2+\\sqrt{2})\n=70+35\\sqrt{2}$。",
    47: "【解析】已知圓 $S_1$ 面積為 $64\\pi$，所以半徑 $r_1=8$。\n(1) 設圓 $S_2$ 半徑為 $r_2$。由圖中的 $30^\\circ$ 幾何關係可得 $3r_2=r_1$，因此\n$r_2=\\frac{8}{3}$，\n故 $S_2$ 面積為 $\\pi\\left(\\frac{8}{3}\\right)^2=\\frac{64\\pi}{9}$。\n(2) 同理可得 $r_1,r_2,r_3,\\ldots$ 為公比 $\\frac{1}{3}$ 的等比數列，所以面積 $S_1,S_2,S_3,\\ldots$ 形成公比 $\\frac{1}{9}$ 的等比數列。\n(3) 前 6 個圓的面積和為\n$64\\pi\\cdot\\frac{1-(\\frac{1}{9})^6}{1-\\frac{1}{9}}=72\\pi\\left(1-\\frac{1}{9^6}\\right)$。",
    50: "【97台中一中期中考】\n【解析】設每年年底還款 x 元。\n到第 4 年年底時，原借款累積為 $185640(1.1)^4$；四次還款累積到同一時點則為\n$x[(1.1)^3+(1.1)^2+1.1+1]$。\n所以\n$185640(1.1)^4=x\\cdot\\frac{(1.1)^4-1}{1.1-1}$。\n代入 $(1.1)^4=1.4641$，得\n$185640\\times1.4641=x\\times4.641$，\n故 $x=58564$。",
    53: "【龍騰自命題】\n【解析】已知 $a_1=1$，且 $a_{n+1}=a_n+n$。\n(1) 依序可得\n$a_2=1+1=2$，$a_3=2+2=4$，$a_4=4+3=7$，$a_5=7+4=11$。\n(2) 將遞迴式逐步相加：\n$a_2-a_1=1$\n$a_3-a_2=2$\n$\\cdots$\n$a_n-a_{n-1}=n-1$\n相加得\n$a_n-a_1=1+2+\\cdots+(n-1)=\\frac{(n-1)n}{2}$。\n因為 $a_1=1$，所以\n$a_n=1+\\frac{(n-1)n}{2}=\\frac{n^2-n+2}{2}$。",
    54: "【龍騰自命題】\n【解析】(1) 由 $a_1=1$ 且 $a_{n+1}=2a_n+1$，可得\n$a_2=3$，$a_3=7$，$a_4=15$，$a_5=31$。\n(2) 觀察可猜測 $a_n=2^n-1$。\n驗算：若 $a_n=2^n-1$，則\n$a_{n+1}=2a_n+1=2(2^n-1)+1=2^{n+1}-1$，\n與猜測一致，因此 $a_n=2^n-1$。",
    58: "【龍騰自命題】\n【解析】由遞迴式\n$a_{n+1}-a_n=2n$。\n將 $n=1$ 到 $99$ 的式子相加，可得\n$a_{100}-a_1=2(1+2+\\cdots+99)$。\n因為 $a_1=3$，所以\n$a_{100}=3+2\\cdot\\frac{99\\cdot100}{2}=3+9900=9903$。",
    59: "【解析】由題意知\n$S_n=\\sum_{k=1}^n a_k=n^2+3n+1$。\n先得 $a_1=S_1=5$。\n當 $n\\ge 2$ 時，\n$a_n=S_n-S_{n-1}=(n^2+3n+1)-[(n-1)^2+3(n-1)+1]=2n+2$。\n因此\n$a_n=\n\\begin{cases}\n5, & n=1 \\\\\n2n+2, & n\\ge 2\n\\end{cases}$",
    65: "【龍騰自命題】\n【解析】第 1 層、第 2 層、第 3 層所用積木數分別為\n$1^2,3^2,5^2,\\ldots,(2n-1)^2$。\n所以堆高 10 層時，總數為\n$\\sum_{k=1}^{10}(2k-1)^2=\\sum_{k=1}^{10}(4k^2-4k+1)$\n$=4\\sum_{k=1}^{10}k^2-4\\sum_{k=1}^{10}k+\\sum_{k=1}^{10}1$\n$=4\\cdot\\frac{10\\cdot11\\cdot21}{6}-4\\cdot\\frac{10\\cdot11}{2}+10$\n$=1330$。\n故共用 1330 個積木。",
    66: "【證明】由圖可知，左下圖空白部分面積為 $2(1^2+2^2+\\cdots+n^2)$；而右下圖五個正方形的總面積，等於整個長方形面積減去這些空白部分，因此可得\n$(1+2+\\cdots+n)(2n+1)=3(1^2+2^2+\\cdots+n^2)$。\n再代入 $1+2+\\cdots+n=\\frac{n(n+1)}{2}$，得到\n$1^2+2^2+\\cdots+n^2\n=\\frac{1}{3}\\cdot\\frac{n(n+1)}{2}(2n+1)\n=\\frac{1}{6}n(n+1)(2n+1)$。\n故證。",
    73: "【99師大附中期中考】\n【解析】(1) 由\n$a_{n+1}-\\alpha=3(a_n-\\alpha)$\n可得 $a_{n+1}=3a_n-2\\alpha$。\n與原遞迴式 $a_{n+1}=3a_n-8$ 比較，得 $-2\\alpha=-8$，所以 $\\alpha=4$。\n(2) 因為 $a_{n+1}-4=3(a_n-4)$，所以數列 $\\{a_n-4\\}$ 為首項 $a_1-4=-3$、公比 $3$ 的等比數列。\n因此\n$a_n-4=(-3)\\cdot3^{n-1}=-3^n$，\n故 $a_n=4-3^n$。\n(3) 歸納證明：\n當 $n=1$ 時，$a_1=1=4-3$，成立。\n假設 $n=k$ 時成立，即 $a_k=4-3^k$。\n則\n$a_{k+1}=3a_k-8=3(4-3^k)-8=4-3^{k+1}$，\n故 $n=k+1$ 時亦成立。\n因此對所有正整數 n，皆有 $a_n=4-3^n$。",
}


REVIEW_NOTES = {
    40: "折線坐標題依賴題圖方向判讀，建議匯入後確認圖片與公式的相對位置。",
    45: "圓內接正方形題的圖與兩小題同時出現，建議前端確認換行是否自然。",
    47: "60 度扇形切圓題高度依賴題圖，建議先看圖片清晰度。",
    51: "複利表格題保留題圖，建議檢查表格圖片在卡片內的縮放。",
    74: "立方和幾何拼接題依賴圖像與文字一起閱讀，建議優先檢查版面。",
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
MATH_FENCE_RE = re.compile(r"```(?:\s*math)?\s*(.*?)```", re.S)
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.S)


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
        if normalized.endswith("/image1.png"):
            return "≈"
        return f"\n[圖: {normalized}]\n" if normalized else ""

    value = HTML_IMAGE_RE.sub(repl, value)
    value = INLINE_IMAGE_RE.sub(repl, value)
    value = GENERIC_IMAGE_RE.sub(lambda m: f"[圖: {normalize_asset_path(m.group(1))}]", value)
    return value


def normalize_system_block(match: re.Match[str]) -> str:
    body = match.group(1)
    body = body.replace("\\\\", "\n")
    body = body.replace("\\mspace{6mu}", " ")
    rows = []
    for part in body.splitlines():
        row = part.strip()
        if not row:
            continue
        row = re.sub(r"\s{2,}", " ", row)
        rows.append(row)
    return "\n".join(rows)


def normalize_index_artifacts(text: str) -> str:
    value = str(text or "")
    patterns = [
        (r"([A-Za-z])_([A-Za-z0-9]+)\s*_\+\s*([A-Za-z0-9]+)", r"\1_{\2+\3}"),
        (r"([A-Za-z])_([A-Za-z0-9]+)\s*_−\s*([A-Za-z0-9]+)", r"\1_{\2-\3}"),
        (r"([A-Za-z])_([A-Za-z0-9]+)\s*_\-\s*([A-Za-z0-9]+)", r"\1_{\2-\3}"),
        (r"([A-Za-z])\s*<sub>\s*([+\-−])\s*([0-9A-Za-z]+)\s*</sub>", lambda m: f"{m.group(1)}_{{n{m.group(2).replace('−','-')}{m.group(3)}}}"),
    ]
    for pattern, repl in patterns:
        value = re.sub(pattern, repl, value)
    return value


def normalize_sequence_notation(text: str) -> str:
    value = str(text or "")
    replacements = {
        "\\< a_n \\>": "〈a_n〉",
        "\\<a_n\\>": "〈a_n〉",
        "< a_n >": "〈a_n〉",
        "<a_n>": "〈a_n〉",
        "{a_n}": "〈a_n〉",
        "\\langle": "〈",
        "\\rangle": "〉",
        "〈 a_n 〉": "〈a_n〉",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    return value


def normalize_text(text: str) -> str:
    value = str(text or "").replace("\r\n", "\n").replace("\r", "\n")
    value = replace_inline_images(value)
    value = HTML_COMMENT_RE.sub("", value)
    value = MATH_BACKTICK_RE.sub(lambda m: f"${m.group(1).strip()}$", value)
    value = MATH_FENCE_RE.sub(lambda m: m.group(1).strip(), value)
    value = value.replace("<br />", "\n").replace("<br/>", "\n")
    value = value.replace("`", "")
    value = SYSTEM_RE.sub(normalize_system_block, value)
    value = normalize_index_artifacts(value)
    value = normalize_sequence_notation(value)
    replacements = {
        "\\mspace{6mu}": " ",
        "\\cdots": "⋯",
        "\\overline": "",
        "\\lbrack": "[",
        "\\rbrack": "]",
        "\\left[": "[",
        "\\right]": "]",
        "\\left(": "(",
        "\\right)": ")",
        "\\Rightarrow": "⇒",
        "\\Rightarrow ": "⇒ ",
        "\\geq": "\\ge",
        "\\leq": "\\le",
        "\\,": " ",
        "‚": "，",
        "﹐": "，",
        "﹒": "。",
        "．": "．",
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
    value = re.sub(r"^\s*1\\\.\s*$", "", value, flags=re.M)
    value = value.replace("[圖: program-db/imports/packs/s2-1-2/assets/media/image1.png]", "≈")
    value = value.replace("≈ 9.…", "≈ 9.22")
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
            {"path": "source/2-2轉.docx", "role": "primary_docx"},
        ],
        "extracted_files": [
            {"path": "extracted/2-2轉.md", "role": "pandoc_markdown"},
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
            "- 這章另外手修了 `S_n` 反推 `a_n`、遞迴轉求和、平方和 / 立方和、複利模型等易亂掉題型。",
        ]
    )
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Finalize s2-1-2 question pack.")
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
        if source_order in QUESTION_TEXT_OVERRIDES:
            row["question_text"] = QUESTION_TEXT_OVERRIDES[source_order]
        if source_order in EXPLANATION_OVERRIDES:
            row["explanation_text"] = EXPLANATION_OVERRIDES[source_order]
        row["question_text"] = normalize_text(row.get("question_text", ""))
        row["explanation_text"] = normalize_text(row.get("explanation_text", ""))
        row["answer_text"] = normalize_text(row.get("answer_text", ""))
        row["formula_id"] = FORMULA_BY_ORDER.get(source_order, "s2-1-2-series-sigma-core")
        marker = infer_marker(row.get("question_category", ""), row.get("title", ""))
        row["title"] = clean_question_title(rebuild_title(marker, row["question_text"]))
        row["tags"] = [
            CHAPTER_CODE if not str(tag).startswith("s2-1-2") and tag != "needs-formula-id" else tag
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
