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


CHAPTER_CODE = "s1-1-10"
CHAPTER_TITLE = "函數及其圖形"
ROOT_TOPIC_ID = "s1-1-10-function-graph-core"

FORMULA_BY_ORDER = {}
for order in range(1, 9):
    FORMULA_BY_ORDER[order] = "s1-1-10-linear-slope-equation"
for order in range(9, 20):
    FORMULA_BY_ORDER[order] = "s1-1-10-linear-model-application"
for order in range(20, 29):
    FORMULA_BY_ORDER[order] = "s1-1-10-quadratic-coefficient-graph"
for order in range(29, 36):
    FORMULA_BY_ORDER[order] = "s1-1-10-quadratic-roots-vertex"
for order in range(36, 43):
    FORMULA_BY_ORDER[order] = "s1-1-10-quadratic-inequality-parameter"
for order in range(43, 56):
    FORMULA_BY_ORDER[order] = "s1-1-10-quadratic-extrema-transform"
for order in range(56, 68):
    FORMULA_BY_ORDER[order] = "s1-1-10-quadratic-optimization-model"
for order in range(68, 75):
    FORMULA_BY_ORDER[order] = "s1-1-10-monomial-function-graph"
for order in range(75, 79):
    FORMULA_BY_ORDER[order] = "s1-1-10-polynomial-factor-graphing"
for order in range(79, 87):
    FORMULA_BY_ORDER[order] = "s1-1-10-polynomial-graph-sign-shift"


QUESTION_OVERRIDES = {
    54: {
        "title": "隨堂練習：作 |x^{2} − 2x| + 4 圖形並求兩實根範圍",
    },
    83: {
        "question_text": (
            "已知函數f(x)的圖形如圖，求不等式f(x + 2) > 0的解。\n"
            "[圖:program-db/imports/packs/s1-1-10/assets/media/image78.png]"
        ),
        "title": "範例6：由圖形求 f(x + 2) > 0 的解",
    },
    86: {
        "question_text": (
            "已知三次函數f(x)的圖形與x軸交於(-2,0)、(3,0)兩點，且f(0) = -2、f(1) = \\frac{4}{3}，"
            "求f(6)的值。"
        ),
        "title": "範例7：由零點與條件值反求三次函數",
    },
}


REVIEW_OVERRIDES = {
    14: "航空公司行李費題依賴原圖讀點，建議在前端確認圖表清晰度。",
    60: "玩具工廠報價題含表格圖，建議在前端確認圖文與公式排列是否順。",
    67: "折疊面積極值題高度依賴多張示意圖，建議直接以前端檢查閱讀體驗。",
    83: "這題題幹是依解析與圖形補回，建議對照前端圖形再看一次。",
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
        "∵": "∵",
        "∴": "∴",
        "f (x)": "f(x)",
        "g (x)": "g(x)",
        "h (x)": "h(x)",
        "f（x）": "f(x)",
        "g（x）": "g(x)",
        "h（x）": "h(x)",
        "Q (x)": "Q(x)",
        "q (x)": "q(x)",
        "− ": "− ",
        " + ": " + ",
        " − ": " − ",
        " ": " ",
        "【龍騰自命題】": "",
        "【康熹自命題】": "",
        "$\\Rightarrow": "⇒",
        "$\\Leftarrow": "⇐",
        "隨堂練習.": "",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = normalize_system_blocks(value)
    value = SOURCE_LABEL_RE.sub("", value)
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
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。；！？")
    if len(seed) > 28:
        seed = seed[:28].rstrip(" ：，。；！？")
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
            "source_ref": "source/1-10轉.docx",
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
        "# s1-1-10 Review Needed",
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
            "- 題幹內嵌的 `【解析】`、`【證明】`、`【詳解】` 已拆回 `explanation_text`。",
        ]
    )
    return "\n".join(lines) + "\n"


def build_manifest_payload() -> dict:
    return {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "source_files": [
            {"path": "source/1-10轉.docx", "role": "primary_docx", "note": "原始 Word 檔"}
        ],
        "extracted_files": [
            {"path": "extracted/1-10轉.md", "role": "pandoc_markdown"},
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
        "contentTypes": ["公式主題", "例題整理", "圖形判讀", "應用問題"],
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
        "chapterOrder": 10,
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
                    {"label": "線型函數", "values": ["$y=ax+b$"]},
                    {"label": "二次函數", "values": ["$y=ax^2+bx+c=a(x-h)^2+k$"]},
                    {"label": "平移", "values": ["$y=f(x-h)+k$"]},
                ],
            },
            "chapterRole": "核心主題",
            "parentId": "",
            "tags": ["word匯入", "主題核心", CHAPTER_CODE, "高一上", "函數圖形"],
            "usage": ["統整線型函數、二次函數、單項函數與多項式圖形題。"],
            "examples": ["很多題目都能從圖形特徵轉回係數、根、頂點或平移資訊。"],
            "tips": ["先判斷是代數條件題、圖形判讀題，還是最值應用題。"],
            "notes": ["這章常把函數式、圖形位置與應用模型三種表示互相轉換。"],
            "mistakes": ["只看圖形直覺，卻沒有把條件改寫成方程或頂點形式。"],
            "isBranch": False,
            "originalIndex": root_index,
            "manualOrder": root_index,
        }
    ]

    branch_specs = [
        (
            "s1-1-10-linear-slope-equation",
            "線型函數斜率與方程式",
            [
                ("斜率", "$m=\\frac{y_2-y_1}{x_2-x_1}$"),
                ("點斜式", "$y-y_1=m(x-x_1)$"),
                ("一般式", "$ax+by+c=0$"),
            ],
            "由兩點、斜率與截距建立線型函數或直線方程式。",
            "先抓斜率，再決定用點斜式還是截距式會最順。",
            "常把 x 截距、y 截距和斜率的符號搞反。",
        ),
        (
            "s1-1-10-linear-model-application",
            "線型模型與應用",
            [
                ("線性成長", "固定增量對應固定斜率"),
                ("換算", "兩組對應值決定線型函數"),
                ("交點", "聯立或從圖形讀解"),
            ],
            "處理溫標換算、調分、計程車、費率與幾何等線型應用題。",
            "把真實情境先翻成兩組對應值，通常就能立出模型。",
            "題目寫『每增加』或『每減少』時，單位轉換最容易出錯。",
        ),
        (
            "s1-1-10-quadratic-coefficient-graph",
            "二次函數係數與圖形判讀",
            [
                ("開口", "$a>0$ 向上，$a<0$ 向下"),
                ("截距", "$f(0)=c$"),
                ("判別式", "$b^2-4ac$ 判斷與 x 軸交點"),
            ],
            "由拋物線圖形判斷係數符號、截距與根的情況。",
            "看圖先抓開口方向、對稱軸與 x 軸交點個數。",
            "不要把『交於兩點』和『恰好相切』混為一談。",
        ),
        (
            "s1-1-10-quadratic-roots-vertex",
            "二次函數零點與頂點式",
            [
                ("根式", "$a(x-r_1)(x-r_2)$"),
                ("頂點式", "$a(x-h)^2+k$"),
                ("對稱軸", "$x=-\\frac b{2a}$"),
            ],
            "由根、頂點或通過點反求二次函數式。",
            "若已知根最適合用因式分解式，若已知最值則先用頂點式。",
            "設式子後別忘了把剩下的點帶回去解出參數。",
        ),
        (
            "s1-1-10-quadratic-inequality-parameter",
            "二次函數恆正恆負與參數",
            [
                ("恆大於零", "$a>0$ 且 $\\Delta\\le 0$"),
                ("恆小於零", "$a<0$ 且 $\\Delta\\le 0$"),
                ("特定區間", "還要結合頂點位置判斷"),
            ],
            "求二次式對所有實數或特定範圍恆成立時的參數條件。",
            "這類題幾乎都要同時看開口方向和判別式。",
            "只檢查判別式、不檢查首項係數，是最常見失誤。",
        ),
        (
            "s1-1-10-quadratic-extrema-transform",
            "二次函數最值與圖形平移",
            [
                ("區間最值", "比較頂點與端點"),
                ("平移", "$y=f(x-h)+k$"),
                ("絕對值", "先分段再討論"),
            ],
            "處理區間最值、絕對值二次函數與圖形平移變換。",
            "若有區間限制，先判斷頂點是否落在區間內。",
            "含絕對值時若沒先拆成分段，後面最值很容易判斷錯。",
        ),
        (
            "s1-1-10-quadratic-optimization-model",
            "二次函數最佳化模型",
            [
                ("收入", "單價 × 數量"),
                ("面積", "用一個變數表示全部邊長"),
                ("頂點", "最大最小值通常落在頂點"),
            ],
            "處理票價、產量、成本、拋物線水柱與幾何面積極值問題。",
            "把情境先化成單一變數的二次函數，再進頂點。",
            "若變數受整數或範圍限制，頂點算完還要回頭檢查。",
        ),
        (
            "s1-1-10-monomial-function-graph",
            "單項函數圖形與平移",
            [
                ("奇函數", "對稱原點"),
                ("偶函數", "對稱 y 軸"),
                ("平移", "可和基本單項函數互相對應"),
            ],
            "描圖並判斷三次、四次單項函數的對稱性與平移關係。",
            "先看奇偶次與係數正負，就能大致掌握圖形方向。",
            "平移不會改變基本開口方向，但會改變對稱中心或頂點位置。",
        ),
        (
            "s1-1-10-polynomial-factor-graphing",
            "多項式因式分解描圖",
            [
                ("零點", "由因式直接讀出"),
                ("首項", "決定左右端行為"),
                ("重根", "決定穿越或相切"),
            ],
            "利用因式分解快速描出三次、四次多項式圖形。",
            "先看根、重數和首項係數，再決定整體走向。",
            "只找到零點不夠，還要看重根和左右端朝向。",
        ),
        (
            "s1-1-10-polynomial-graph-sign-shift",
            "多項式圖形平移與號別判斷",
            [
                ("平移", "$f(x\\pm h)$ 對應左右平移"),
                ("號別", "由圖形判讀正負區間"),
                ("微調", "上下平移會改變實根個數"),
            ],
            "由圖形判斷根的個數、正負區間，以及平移後的不等式解。",
            "看到 $f(x\\pm h)$ 先把圖形左右平移方向想清楚。",
            "上下平移 0.01 這類小改動，也可能改變根的個數。",
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
                "tags": ["word匯入", "分支重點", CHAPTER_CODE, "高一上", "函數圖形"],
                "usage": [usage],
                "examples": [usage],
                "tips": [tip],
                "notes": ["函數圖形題常要在『代數式』『圖形』『情境』三者之間切換。"],
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
    payload["meta"]["lastImportSource"] = "1-10轉.docx"
    write_json(formula_db_path, payload)


def finalize_records(records: list[dict]) -> list[dict]:
    finalized = []
    for record in sorted(records, key=lambda item: int(item.get("source_order", 0) or 0)):
        row = dict(record)
        order = int(row.get("source_order", 0) or 0)
        marker = extract_marker(row.get("tags", []))

        if order in QUESTION_OVERRIDES:
            row.update(QUESTION_OVERRIDES[order])

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
    parser = argparse.ArgumentParser(description="Finalize s1-1-10 question pack and sync databases.")
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
