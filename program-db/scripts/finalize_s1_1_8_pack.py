import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from PIL import Image

from question_data_utils import clean_question_body
from sync_extra_bridge import sync_extra_web_from_db
from sync_web_data import sync_question_js_from_db
from sync_legacy_bridge import sync_legacy_js_from_db


CHAPTER_CODE = "s1-1-8"
CHAPTER_TITLE = "直線與圓"
ROOT_TOPIC_ID = "s1-1-8-line-circle-core"

FORMULA_BY_ORDER = {}
for order in range(1, 9):
    FORMULA_BY_ORDER[order] = "s1-1-8-point-circle-position-distance"
for order in range(9, 12):
    FORMULA_BY_ORDER[order] = "s1-1-8-external-point-tangent-chord"
for order in range(12, 20):
    FORMULA_BY_ORDER[order] = "s1-1-8-line-circle-distance-chord"
for order in range(20, 28):
    FORMULA_BY_ORDER[order] = "s1-1-8-line-circle-parameter-range"
for order in range(28, 36):
    FORMULA_BY_ORDER[order] = "s1-1-8-tangent-equation-basic"
for order in range(36, 42):
    FORMULA_BY_ORDER[order] = "s1-1-8-external-point-tangent-advanced"
for order in range(42, 47):
    FORMULA_BY_ORDER[order] = "s1-1-8-semicircle-function-extrema"
for order in range(47, 50):
    FORMULA_BY_ORDER[order] = "s1-1-8-tangent-locus-application"
for order in range(50, 56):
    FORMULA_BY_ORDER[order] = "s1-1-8-circle-pencil-root-axis"


QUESTION_OVERRIDES = {
    20: {
        "question_text": (
            "已知一圓方程式為x^{2} + y^{2} − 2x − 4y + k = 0，"
            "若一直線3x + 4y − 1 = 0與該圓無交點，試問k的範圍為____________。"
        )
    },
    21: {
        "question_text": (
            "已知一直線4x + 3y = 20與圓x^{2} + y^{2} + 6x + 8y + k = 0沒有交點，"
            "則k的範圍為____________。"
        )
    },
    22: {
        "question_text": (
            "若一直線x + y = 4與圓x^{2} + y^{2} + 4x + 2y + k = 0沒有交點，"
            "試求k的範圍為____________。"
        )
    },
    23: {
        "question_text": (
            "點P在直線L：3x − 4y + 14 = 0上，點Q在圓C：x^{2} + y^{2} − 2x + 4y + 1 = 0上，"
            "則\\overline{PQ}的最小值為____________。"
        )
    },
    41: {
        "question_text": (
            "在坐標平面上A(7,8)有一光源，將圓C：x^{2} + y^{2} − 4x − 6y + 12 = 0"
            "投射到x軸的影長為何？\n【92師大附中期中考】\n"
            "[圖:program-db/imports/packs/s1-1-8/assets/media/image26.emf.png]"
        )
    },
    48: {
        "question_text": (
            "如圖所示，已知\\overline{AB}//\\overline{CD}且A、B兩點所在的直線方程式為"
            "2x − y + 1 = 0，圓Γ的方程式為(x − 4)^{2} + (y − 4)^{2} = 1，"
            "求C、D兩點所在的直線方程式為____________。\n"
            "[圖:program-db/imports/packs/s1-1-8/assets/media/image33.emf.png]"
        )
    },
}


REVIEW_OVERRIDES = {
    41: "光源投影題高度依賴題圖，請在前端確認投影線與答案閱讀順序是否自然。",
    55: "題幹前文明顯承接題圖與前置敘述，建議以前端檢查圖文是否足以獨立作答。",
}


VECTOR_IMAGE_RE = re.compile(r"(\[圖:\s*)([^\]]+\.(?:emf|wmf))(?!\.png)(\])", re.IGNORECASE)
GENERIC_IMAGE_RE = re.compile(r"\[圖:\s*([^\]]+)\]", re.IGNORECASE)
MARKDOWN_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>', re.IGNORECASE)
ABSOLUTE_PREFIX_RE = re.compile(r"^[A-Za-z]:/.*?/program-db/", re.IGNORECASE)
BLANK_RE = re.compile(r"(?:\\_){4,}|_{6,}")
EMBEDDED_SOLUTION_RE = re.compile(r"(【解析】|【證明】)")
VECTOR_ARROW_RE = re.compile(r"\\overset\{\\overleftrightarrow\{\}\}\{([A-Za-z]+)\}")
TEXT_SPACE_RE = re.compile(r"\\text\{\s*\}")


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
    text = ABSOLUTE_PREFIX_RE.sub("program-db/", text)
    marker = text.lower().find("program-db/")
    if marker >= 0:
        text = text[marker:]
    text = re.sub(r"(?i)\.(emf|wmf)(?:\.png)+$", r".\1.png", text)
    text = re.sub(r"(?i)\.(emf|wmf)$", lambda m: f"{m.group(0)}.png", text)
    text = re.sub(r"(?i)\.png(?:\.png)+$", ".png", text)
    return text


def replace_inline_images(text: str) -> str:
    value = str(text or "")

    def inline_repl(match: re.Match[str]) -> str:
        normalized = normalize_asset_path(match.group(1))
        return f"\n[圖:{normalized}]\n" if normalized else ""

    value = HTML_IMAGE_RE.sub(inline_repl, value)
    value = MARKDOWN_IMAGE_RE.sub(inline_repl, value)
    value = VECTOR_IMAGE_RE.sub(lambda m: f"{m.group(1)}{normalize_asset_path(m.group(2))}{m.group(3)}", value)
    value = GENERIC_IMAGE_RE.sub(lambda m: f"[圖:{normalize_asset_path(m.group(1))}]", value)
    return value


def normalize_text(text: str) -> str:
    value = replace_inline_images(str(text or ""))
    replacements = {
        "\r\n": "\n",
        "\r": "\n",
        "\u3000": " ",
        "\xa0": " ",
        "﹕": "：",
        "﹐": "，",
        "﹒": "。",
        "﹖": "？",
        "（ ": "（",
        " ）": "）",
        "【龍騰自命題】": "",
        "隨堂練習.": "",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    value = TEXT_SPACE_RE.sub(" ", value)
    value = VECTOR_ARROW_RE.sub(r"\\overleftrightarrow{\1}", value)
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
    seed = re.sub(r"【[^】]+】", "", seed)
    seed = seed.replace("\n", " ")
    seed = re.sub(r"\s+", " ", seed).strip(" ：，。；！？")
    if len(seed) > 24:
        seed = seed[:24].rstrip(" ：，。；！？")
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
            "source_ref": "source/1-8轉.docx",
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
        "# s1-1-8 Review Needed",
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
            "- 題幹內嵌的 `【解析】`、`【證明】` 已拆回 `explanation_text`。",
        ]
    )
    return "\n".join(lines) + "\n"


def build_manifest_payload() -> dict:
    return {
        "chapter_code": CHAPTER_CODE,
        "chapter_title": CHAPTER_TITLE,
        "source_files": [
            {"path": "source/1-8轉.docx", "role": "primary_docx", "note": "原始 Word 檔"}
        ],
        "extracted_files": [
            {"path": "extracted/1-8轉.md", "role": "pandoc_markdown"},
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
        "chapterOrder": 8,
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
                    {"label": "點圓關係", "values": ["$OP>r$ 圓外，$OP=r$ 圓上，$OP<r$ 圓內"]},
                    {"label": "直線與圓", "values": ["$d(O,L)>r$ 無交點，$d(O,L)=r$ 相切，$d(O,L)<r$ 相交"]},
                    {"label": "切線與圓系", "values": ["切線距離 = 半徑；過兩圓交點可設圓系"]},
                ],
            },
            "chapterRole": "核心主題",
            "parentId": "",
            "tags": ["word匯入", "主題核心", CHAPTER_CODE, "高一上", "直線與圓"],
            "usage": ["統整點、直線、切線與圓系題型，建立距離與圓方程的轉換。"],
            "examples": ["由點到圓、線到圓的距離條件快速判斷位置關係。"],
            "tips": ["這章常先把幾何敘述翻成『距離 = 半徑』或『過共同交點』。"],
            "notes": ["很多題目看似不同，其實都在用圓心到點或直線的距離。"],
            "mistakes": ["把相切、相交、無交點的判準混用，或忽略外點切線長平方公式。"],
            "isBranch": False,
            "originalIndex": root_index,
            "manualOrder": root_index,
        }
    ]

    branch_specs = [
        (
            "s1-1-8-point-circle-position-distance",
            "圓與點的位置關係與距離",
            [
                ("位置判斷", "$OP>r,\\ OP=r,\\ OP<r$"),
                ("最短距離", "圓外 $OP-r$，圓內 $0$"),
                ("最長距離", "$OP+r$"),
            ],
            "判斷點與圓的內外關係，並求最短、最長距離。",
            "先求圓心與半徑，再和 $OP$ 比較，通常就能快速判斷。",
            "把點代入一般式時，正負號要和配方後的距離觀念對起來。",
        ),
        (
            "s1-1-8-external-point-tangent-chord",
            "圓外點切線與切線長",
            [
                ("切線長", "$PT^{2}=x_{0}^{2}+y_{0}^{2}+dx_{0}+ey_{0}+f$"),
                ("幂定理", "$PA\\cdot PB=PT^{2}$"),
                ("切線", "切點半徑垂直切線"),
            ],
            "處理圓外點引切線、切線長與割線乘積。",
            "看到外點與切線，先想切線長平方公式或幂定理。",
            "證明題常把圖形條件轉成半徑與直角三角形，不必硬背整段推導。",
        ),
        (
            "s1-1-8-line-circle-distance-chord",
            "圓與直線的距離和弦長",
            [
                ("位置判斷", "$d(O,L)$ 與 $r$ 比較"),
                ("弦長", "$2\\sqrt{r^{2}-d^{2}}$"),
                ("切線", "$d(O,L)=r$"),
            ],
            "由圓心到直線距離判斷相交型態，並計算弦長。",
            "弦長題先找圓心到直線距離，再進入直角三角形。",
            "若已知交於兩點，就要記得使用嚴格不等式。"),
        (
            "s1-1-8-line-circle-parameter-range",
            "圓與直線的參數範圍",
            [
                ("無交點", "$d(O,L)>r$"),
                ("相切", "$d(O,L)=r$"),
                ("相交", "$d(O,L)<r$"),
            ],
            "把位置關係改寫成參數不等式，求直線或圓的範圍。",
            "同時檢查半徑平方是否大於零，避免只算到一半。",
            "容易漏掉『本身要是實圓』這個條件。"),
        (
            "s1-1-8-tangent-equation-basic",
            "圓的切線方程式",
            [
                ("已知斜率", "$d(O,L)=r$"),
                ("已知切點", "半徑垂直切線"),
                ("一般式切線", "切點代回並用垂直關係"),
            ],
            "求平行、指定切點或指定外點的切線方程式。",
            "先設直線，再用圓心到直線距離等於半徑，通常最穩。",
            "設斜率時別忘了處理垂直線這種特例。"),
        (
            "s1-1-8-external-point-tangent-advanced",
            "圓外點切線的進階應用",
            [
                ("兩切線", "外點可作兩條切線"),
                ("切點圓", "切點、外點常形成新的圓"),
                ("幂定理", "$PA\\cdot PB=PT^{2}$"),
            ],
            "把外點引切線延伸到外接圓、割線與幾何複合題。",
            "先穩住切線方程式，再處理後面的外接圓或乘積關係。",
            "容易在多步驟題裡把切點與交點符號混掉。"),
        (
            "s1-1-8-semicircle-function-extrema",
            "半圓、函數與最值",
            [
                ("半圓", "只取符合情境的一支"),
                ("切線", "切線條件常轉成斜率或距離"),
                ("最值", "善用對稱與參數表示"),
            ],
            "處理半圓模型、函數圖形和最值問題。",
            "看見半圓應先決定取上半還是下半，再談最值或影長。",
            "只算到整個圓卻忘了題目實際只取半圓，是常見失分點。"),
        (
            "s1-1-8-tangent-locus-application",
            "切線軌跡與應用",
            [
                ("平行弦", "改寫成等距條件"),
                ("軌跡", "把切線條件轉成新直線或新圓"),
                ("圖形題", "善用對稱與圓心位置"),
            ],
            "把切線條件轉成新直線、新圓或實際圖形模型。",
            "若題目提到『如圖』，先抓住平行、對稱與圓心位置。",
            "圖形題最怕先入為主，建議先寫代數條件再判圖。"),
        (
            "s1-1-8-circle-pencil-root-axis",
            "圓系與根軸",
            [
                ("圓系", "$S_{1}+kS_{2}=0$"),
                ("根軸", "$S_{1}-S_{2}=0$"),
                ("最小圓", "可從圓心或半徑條件判斷"),
            ],
            "處理過兩圓公共點的圓系、根軸與最小圓問題。",
            "看到『過兩圓交點』時，通常就能直接設 $S_{1}+kL=0$ 或 $S_{1}+kS_{2}=0$。",
            "圓系題常算對方程式卻漏掉題目還有限制相切、半徑或圓心象限。"),
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
                "tags": ["word匯入", "分支重點", CHAPTER_CODE, "高一上", "直線與圓"],
                "usage": [usage],
                "examples": [usage],
                "tips": [tip],
                "notes": ["本章很多題會在點、直線、切線與圓系之間切換表示方式。"],
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
    payload["meta"]["lastImportSource"] = "1-8轉.docx"
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
    parser = argparse.ArgumentParser(description="Finalize s1-1-8 question pack and sync databases.")
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
