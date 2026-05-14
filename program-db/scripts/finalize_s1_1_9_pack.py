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


CHAPTER_CODE = "s1-1-9"
CHAPTER_TITLE = "多項式及其運算"
ROOT_TOPIC_ID = "s1-1-9-polynomial-core"

FORMULA_BY_ORDER = {}
for order in range(1, 4):
    FORMULA_BY_ORDER[order] = "s1-1-9-polynomial-definition"
for order in range(4, 7):
    FORMULA_BY_ORDER[order] = "s1-1-9-degree-parameter-judgment"
for order in range(7, 12):
    FORMULA_BY_ORDER[order] = "s1-1-9-degree-properties-equality"
for order in range(12, 20):
    FORMULA_BY_ORDER[order] = "s1-1-9-coefficient-sum-substitution"
for order in range(20, 28):
    FORMULA_BY_ORDER[order] = "s1-1-9-division-factorization-basic"
for order in range(28, 36):
    FORMULA_BY_ORDER[order] = "s1-1-9-linear-divisor-remainder"
for order in range(36, 49):
    FORMULA_BY_ORDER[order] = "s1-1-9-synthetic-division-transform"
for order in range(49, 59):
    FORMULA_BY_ORDER[order] = "s1-1-9-remainder-factor-basic"
for order in range(59, 66):
    FORMULA_BY_ORDER[order] = "s1-1-9-high-power-remainder"
for order in range(66, 69):
    FORMULA_BY_ORDER[order] = "s1-1-9-constant-ratio-identity"
for order in range(69, 72):
    FORMULA_BY_ORDER[order] = "s1-1-9-factor-theorem-parameter"


REVIEW_OVERRIDES = {
    4: "此題解析依賴兩張圖輔助判讀，建議在前端確認圖片轉成 PNG 後是否清楚。",
    38: "這題解析含綜合除法圖，建議在前端確認圖文排列與可讀性。",
}


GENERIC_IMAGE_RE = re.compile(r"\[圖:\s*([^\]]+)\]", re.IGNORECASE)
VECTOR_IMAGE_RE = re.compile(r"(\[圖:\s*)([^\]]+\.(?:emf|wmf))(?!\.png)(\])", re.IGNORECASE)
MARKDOWN_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.IGNORECASE)
ABSOLUTE_PREFIX_RE = re.compile(r"^[A-Za-z]:/.*?/program-db/", re.IGNORECASE)
BLANK_RE = re.compile(r"(?:\\_){4,}|_{6,}")
EMBEDDED_SOLUTION_RE = re.compile(r"(【解析】|【證明】|【詳解】|【解1】)")
SYSTEM_BLOCK_RE = re.compile(
    r"\$?\\left\\\\\s*\\begin\{(?:array|matrix)\}(?:\{[^}]*\})?\s*(.*?)\s*\\end\{(?:array|matrix)\}\s*\\right\.\s*\\\\?\$?",
    re.S,
)
SOURCE_LABEL_RE = re.compile(r"【[^】]*(?:段考|期中考|期末考|模擬考|自命題)[^】]*】")


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
    value = VECTOR_IMAGE_RE.sub(lambda m: f"{m.group(1)}{normalize_asset_path(m.group(2))}{m.group(3)}", value)
    value = GENERIC_IMAGE_RE.sub(lambda m: f"[圖:{normalize_asset_path(m.group(1))}]", value)
    return value


def normalize_system_blocks(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        body = match.group(1).replace("\n", " ")
        body = re.sub(r"\s*\\\\\s*|\s*\\\s*", "；", body)
        body = re.sub(r"\s{2,}", " ", body).strip("； ")
        return body

    return SYSTEM_BLOCK_RE.sub(repl, text)


def normalize_text(text: str) -> str:
    value = replace_inline_images(str(text or ""))
    replacements = {
        "\r\n": "\n",
        "\r": "\n",
        "\u3000": " ",
        "\xa0": " ",
        "\u2005": " ",
        "\u2006": " ",
        "\u2009": " ",
        "\u200a": " ",
        "\u200b": "",
        "\u200c": "",
        "\u200d": "",
        "\u205f": " ",
        "﹕": "：",
        "﹐": "，",
        "﹒": "。",
        "﹖": "？",
        "∈ R": "∈ R",
        "∈R": "∈ R",
        "f (x)": "f(x)",
        "g (x)": "g(x)",
        "h(x)": "h(x)",
        "Q (x)": "Q(x)",
        "q (x)": "q(x)",
        "q_{1}(x)": "q_{1}(x)",
        "q_{2}(x)": "q_{2}(x)",
        "q_{3}(x)": "q_{3}(x)",
        "deg (": "deg(",
        "deg f (x)": "deg f(x)",
        "deg g (x)": "deg g(x)",
        "− ": "− ",
        " + ": " + ",
        " − ": " − ",
        " ": " ",
        "隨堂練習.": "",
        "【龍騰自命題】": "",
        "【康熹自命題】": "",
        "$\\Rightarrow": "⇒",
        "$\\Leftarrow": "⇐",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = normalize_system_blocks(value)
    value = SOURCE_LABEL_RE.sub("", value)
    value = value.replace("；_{", "_{")
    value = BLANK_RE.sub("____________", value)
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
    match = EMBEDDED_SOLUTION_RE.search(q_text)
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
    if marker.startswith("範例"):
        return "基本"
    if marker.startswith("隨堂練習"):
        return "重要"
    return current or "綜合"


def rebuild_title(marker: str, question_text: str, fallback: str) -> str:
    seed = re.sub(r"\[圖:[^\]]+\]", "", str(question_text or ""))
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed)
    seed = seed.strip(" ：，。；！？")
    if len(seed) > 26:
        seed = seed[:26].rstrip(" ：，。；！？")
    if marker:
        return f"{marker}：{seed}" if seed else marker
    return fallback


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
            "source_ref": "source/1-9轉.docx",
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
        "# s1-1-9 Review Needed",
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
            "- `範例 -> 基本`、`隨堂練習 -> 重要` 已保留。",
            "- `emf/wmf` 圖片已轉成 `.png` sidecar 並更新引用。",
            "- 題幹內嵌的 `【解析】`、`【證明】`、`【解1】`、`【解2】` 已拆回 `explanation_text`。",
        ]
    )
    return "\n".join(lines) + "\n"


def build_manifest_payload() -> dict:
    return {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "source_files": [
            {"path": "source/1-9轉.docx", "role": "primary_docx", "note": "原始 Word 檔"}
        ],
        "extracted_files": [
            {"path": "extracted/1-9轉.md", "role": "pandoc_markdown"},
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
            "high_confidence_formula_id": "掛到對應分支",
            "unmatched_formula_id": "章節綜合",
        },
        "status": "review_ready",
    }


def build_topic_rows(existing_topics: list[dict]) -> list[dict]:
    now = datetime.now().astimezone().isoformat()
    max_index = max(
        [
            int(topic.get("manualOrder", 0) or 0)
            for topic in existing_topics
        ]
        + [
            int(topic.get("originalIndex", 0) or 0)
            for topic in existing_topics
        ]
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
        "contentTypes": ["公式主題", "例題整理", "運算技巧", "應用問題"],
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
        "chapterOrder": 9,
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
                    {"label": "一般式", "values": ["$p(x)=a_nx^n+a_{n-1}x^{n-1}+\\cdots+a_0$"]},
                    {"label": "次數", "values": ["$a_n\\neq 0\\Rightarrow \\deg p(x)=n$"]},
                    {"label": "除法", "values": ["$f(x)=g(x)Q(x)+r(x),\\ \\deg r<\\deg g$"]},
                ],
            },
            "chapterRole": "核心主題",
            "parentId": "",
            "tags": ["word匯入", "主題核心", CHAPTER_CODE, "高一上", "多項式"],
            "usage": ["統整多項式定義、除法、餘式定理與因式定理。"],
            "examples": ["看到固定餘式、整除或恆為定值時，通常都能轉成多項式恆等式。"],
            "tips": ["先分清楚題目是在問次數、係數關係，還是商餘與因式。"],
            "notes": ["這章很多題目都靠『代入特殊點』或『比較係數』來快速解決。"],
            "mistakes": ["把多項式恆等於、整除、餘式是常數這三種條件混在一起。"],
            "isBranch": False,
            "originalIndex": root_index,
            "manualOrder": root_index,
        }
    ]

    branch_specs = [
        (
            "s1-1-9-polynomial-definition",
            "多項式定義與判別",
            [
                ("多項式", "指數為非負整數，文字符號不在分母、根號、絕對值中"),
                ("係數", "$a_k$ 可為整數、有理數、實數或複數"),
                ("零多項式", "特別處理，沒有次數"),
            ],
            "判斷一個式子是否是多項式或多項式函數。",
            "先看指數、分母、根號與絕對值，通常立刻能排除。",
            "把有分式限制或分段函數誤當成多項式，是這類題常見錯誤。",
        ),
        (
            "s1-1-9-degree-parameter-judgment",
            "次數與參數判定",
            [
                ("一次式", "高次項係數要同時為 0"),
                ("常數式", "只剩常數項"),
                ("條件式", "比較各次項係數"),
            ],
            "用係數條件判定多項式次數或反求參數。",
            "看到『為一次』或『為常數』就改寫成高次項係數為 0。",
            "常漏掉首項係數不能同時變成 0 的附加限制。",
        ),
        (
            "s1-1-9-degree-properties-equality",
            "次數性質與多項式相等",
            [
                ("和差", "$\\deg(f\\pm g)$ 不一定等於較大次數"),
                ("乘積", "$\\deg(fg)=\\deg f+\\deg g$"),
                ("恆等", "對應次項係數相等"),
            ],
            "判斷多項式和差乘積的次數，或用恆等式比較係數。",
            "若是乘積看首項最穩；若是和差，要注意高次項可能消掉。",
            "把『可能的次數』誤判成『一定的次數』是這段最常見的錯。",
        ),
        (
            "s1-1-9-coefficient-sum-substitution",
            "係數和與代值技巧",
            [
                ("常數項", "$a_0=f(0)$"),
                ("係數和", "$a_0+a_1+\\cdots+a_n=f(1)$"),
                ("奇偶項", "可用 $f(1)$ 與 $f(-1)$ 拆分"),
            ],
            "用代入 0、1、-1 或特殊值，抓常數項、係數和與奇偶項和。",
            "看到係數和或交錯和，先想到代入 1、-1。",
            "只記公式卻忘了題目可能已先對變數做平移或代換。",
        ),
        (
            "s1-1-9-division-factorization-basic",
            "多項式除法與整除條件",
            [
                ("除法定理", "$f(x)=g(x)Q(x)+r(x)$"),
                ("整除", "餘式為 0"),
                ("因式", "$x-a$ 為因式 $\\Leftrightarrow f(a)=0$"),
            ],
            "處理已知商餘反求除式，或用整除條件求參數。",
            "題目若已知商與餘式，先把完整除法恆等式寫出來。",
            "把除式次數和餘式次數的限制忘掉，常會多設未知數。",
        ),
        (
            "s1-1-9-linear-divisor-remainder",
            "一次式除法與餘式推廣",
            [
                ("一次除式", "$f(x)=(ax-b)Q(x)+r$"),
                ("餘式", "$r=f(\\frac ba)$"),
                ("變形", "可改寫成對其他除式的商餘"),
            ],
            "把一次式除法延伸到變數代換、餘式關係與數值計算。",
            "見到 $ax-b$ 時，直接想 $x=\\frac ba$。",
            "這類題最容易把 $x-b$ 與 $ax-b$ 的餘式定理混掉。",
        ),
        (
            "s1-1-9-synthetic-division-transform",
            "綜合除法與代換運算",
            [
                ("綜合除法", "快速求商與餘式"),
                ("平移", "由 $f(x-c)$ 反推 $f(x)$"),
                ("特殊根", "利用有理根或已知因式簡化運算"),
            ],
            "用綜合除法、變數平移與特殊代換處理高次多項式。",
            "先決定是在做『除法』還是『平移回原函數』，方向要清楚。",
            "有些題目圖只是輔助，核心還是商餘與代換恆等式。",
        ),
        (
            "s1-1-9-remainder-factor-basic",
            "餘式定理與因式定理基礎",
            [
                ("餘式定理", "$f(a)$ 是除以 $x-a$ 的餘式"),
                ("二次除式", "餘式設成一次式"),
                ("多條件", "代入多個根建立聯立"),
            ],
            "用餘式定理處理多重除式、二次除式與已知餘式重建問題。",
            "除式若是二次式，餘式最多只能設一次。",
            "最常見錯誤是已知多個餘式卻沒有善用共同根去代值。",
        ),
        (
            "s1-1-9-high-power-remainder",
            "高次冪餘式與循環化簡",
            [
                ("模多項式", "把高次幂降到低次餘式"),
                ("代換", "利用 $x^n\\equiv ...$"),
                ("重因式", "可再對一次除式取餘"),
            ],
            "把高次冪或大型數值題化成低次多項式餘式。",
            "先找出在除式條件下的等價替換，再逐步降次。",
            "只顧著展開大次方，反而會把原本能快速化簡的結構弄丟。",
        ),
        (
            "s1-1-9-constant-ratio-identity",
            "恆為定值與恆等式比較",
            [
                ("恆為定值", "分子與分母對應成比例"),
                ("比較係數", "把等式展開後逐項比較"),
                ("低次特例", "次數不夠時可能直接是常數"),
            ],
            "處理分式恆為定值、同時滿足多個取值的低次多項式。",
            "若對任意 x 恆成立，優先用比較係數最直接。",
            "不要只看首項比，其他係數也必須一致才行。",
        ),
        (
            "s1-1-9-factor-theorem-parameter",
            "因式定理與參數反求",
            [
                ("重根", "$(x-a)^2$ 整除代表可再除一次"),
                ("多因式", "用各根代值建立方程"),
                ("反求", "由餘式條件反推出參數"),
            ],
            "由整除、重因式與多個餘式條件反求參數或重建原多項式。",
            "把每個因式都翻成對應的代值條件，再系統整理。",
            "看到 $(x-a)^2$ 時，別只代一次就停住。",
        ),
    ]

    for branch_id, title, formula_lines, usage, tip, mistake in branch_specs:
        index = allocate()
        rows.append(
            {
                **common,
                "id": branch_id,
                "title": title,
                "formula": {
                    "type": "labeled-lines",
                    "lines": [{"label": label, "values": [value]} for label, value in formula_lines],
                },
                "chapterRole": "分支重點",
                "parentId": ROOT_TOPIC_ID,
                "tags": ["word匯入", "分支重點", CHAPTER_CODE, "高一上", "多項式"],
                "usage": [usage],
                "examples": [usage],
                "tips": [tip],
                "notes": ["這章很多題目只要換一個觀點，就能從繁雜運算變成代值或比較係數。"],
                "mistakes": [mistake],
                "isBranch": True,
                "originalIndex": index,
                "manualOrder": index,
            }
        )
    return rows


def upsert_questions(question_db_path: Path, records: list[dict]):
    payload = read_json(question_db_path)
    rows = [row for row in payload.get("questions", []) if str(row.get("chapter_code")) != CHAPTER_CODE]
    rows.extend(records)
    payload["questions"] = rows
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(rows)
    payload["meta"]["updatedAt"] = datetime.now().astimezone().isoformat()
    write_json(question_db_path, payload)


def upsert_topics(formula_db_path: Path):
    payload = read_json(formula_db_path)
    topics = payload.get("topics", [])
    existing = [
        topic for topic in topics
        if str(topic.get("chapterCode") or topic.get("chapter_code")) != CHAPTER_CODE
    ]
    new_topics = build_topic_rows(existing)
    payload["topics"] = existing + new_topics
    payload.setdefault("meta", {})
    payload["meta"]["count"] = len(payload["topics"])
    payload["meta"]["updatedAt"] = datetime.now().astimezone().isoformat()
    payload["meta"]["lastImportSource"] = "1-9轉.docx"
    write_json(formula_db_path, payload)


def finalize_records(records: list[dict]) -> list[dict]:
    finalized = []
    for record in sorted(records, key=lambda item: int(item.get("source_order", 0) or 0)):
        row = dict(record)
        order = int(row.get("source_order", 0) or 0)
        marker = extract_marker(row.get("tags", []))
        question_text, explanation_text = split_embedded_explanation(
            row.get("question_text", ""),
            row.get("explanation_text", ""),
        )
        row["question_text"] = normalize_text(question_text)
        row["answer_text"] = normalize_text(row.get("answer_text", ""))
        row["explanation_text"] = normalize_text(explanation_text)
        row["formula_id"] = FORMULA_BY_ORDER.get(order, "")
        row["question_category"] = normalize_category(row.get("question_category", ""), marker)
        row["title"] = rebuild_title(marker, row["question_text"], row.get("title", ""))
        finalized.append(row)
    return finalized


def main():
    parser = argparse.ArgumentParser(description="Finalize s1-1-9 question pack and sync databases.")
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
