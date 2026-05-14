from __future__ import annotations

import json
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
CHAPTER_OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
SOURCE_PDF = ROOT / "exports" / "s4-source" / "s4-readable-paged.pdf"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "fourth-volume-topic-pdfs.json"

TZ = timezone(timedelta(hours=8))
SOURCE_REF = "高二下數A全重點_易讀版分頁版.docx"

TOPIC_PLAN = [
    {
        "chapterCode": "s4-3-1",
        "groupName": "條件機率與貝氏定理",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "條件機率與獨立",
            "section": "條件機率與貝氏定理",
            "domain": "機率與統計",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 11,
        },
        "rootId": "senior-conditional-probability-main-s431",
        "paragraphEditable": (
            "1. 這章正式改以兩個主題當主軸：條件機率、全機率與貝氏定理。\n"
            "2. 看到已知某件事已發生時，先判斷它是不是在縮小樣本空間；如果是，就先回到條件機率。\n"
            "3. 看到反推來源、檢驗結果、分類判斷時，通常要走全機率與貝氏定理這條線，不要只背單一路徑。\n"
            "4. 樹狀圖、列聯表、醫療檢測模板都還是掛在這兩個主題下面，先用主題把方向抓穩。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的兩個主題頁。整理時先抓條件機率，再往全機率與貝氏定理延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "conditional-probability",
                "title": "條件機率",
                "page": 41,
                "mainThemeId": "s4-3-1-main-theme-conditional-probability",
                "wrapperId": "s4-3-1-main-theme-conditional-probability-core",
                "summary": "整理條件機率定義、乘法公式、多事件連乘與樹狀圖、列聯表的判讀。",
                "rows": [
                    ["定義", "若 \\(P(B)>0\\)，則在事件 \\(B\\) 已發生的條件下，事件 \\(A\\) 發生的機率記作 \\(P(A\\mid B)\\)。"],
                    ["公式", "\\(P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}\\)。"],
                    ["乘法公式", "\\(P(A\\cap B)=P(B)P(A\\mid B)=P(A)P(B\\mid A)\\)。"],
                    ["多事件連乘", "多個事件可一步步套條件機率，寫成連乘形式。"],
                    ["觀念重點", "條件機率不是換樣本空間，而是把注意力限制在事件 \\(B\\) 內重新計算比例。"],
                    ["讀題提醒", "公式分母一定是條件那件事的機率；樹狀圖和列聯表都只是把這件事看得更清楚。"],
                ],
                "branchIds": [
                    "s4-3-1-conditional-bayes-core",
                    "senior-conditional-probability-tree-table-s431",
                    "senior-subjective-vs-objective-probability-s431",
                    "senior-probability-simulation-law-large-numbers-s431",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "total-probability-bayes",
                "title": "全機率與貝氏定理",
                "page": 42,
                "mainThemeId": "s4-3-1-main-theme-total-probability-bayes",
                "wrapperId": "s4-3-1-main-theme-total-probability-bayes-core",
                "summary": "整理分割、全機率公式、貝氏定理與常見反推來源的應用。",
                "rows": [
                    ["分割觀念", "若事件 \\(A_1,A_2,\\ldots,A_n\\) 兩兩互斥且聯集為整個樣本空間，就構成一個分割。"],
                    ["全機率公式", "若 \\(A_1,\\ldots,A_n\\) 是分割，則 \\(P(B)=\\sum P(A_i)P(B\\mid A_i)\\)。"],
                    ["貝氏定理", "\\(P(A_k\\mid B)=\\dfrac{P(A_k)P(B\\mid A_k)}{\\sum P(A_i)P(B\\mid A_i)}\\)。"],
                    ["用途", "已知結果 \\(B\\) 發生後，反推它來自哪一類原因的機率。"],
                    ["常見情境", "醫學檢驗、良率判斷、抽樣來源判斷、分類問題。"],
                    ["讀題提醒", "分母是整體看到 \\(B\\) 的總機率，不是只看其中一條路徑。"],
                ],
                "branchIds": [
                    "senior-bayes-total-probability-s431",
                    "senior-bayes-medical-testing-template-s431",
                ],
            },
        ],
    },
    {
        "chapterCode": "s4-3-2",
        "groupName": "獨立事件",
        "meta": {
            "stage": "高中",
            "grade": "高二",
            "term": "下學期",
            "gradeLabel": "高二下",
            "chapter": "條件機率與獨立",
            "section": "獨立事件",
            "domain": "機率與統計",
            "domainSub": "",
            "stageOrder": 2,
            "gradeOrder": 5,
            "termOrder": 2,
            "chapterOrder": 12,
        },
        "rootId": "senior-independent-events-main-s432",
        "rootTitle": "獨立事件",
        "rootManualOrder": 616,
        "paragraphEditable": (
            "1. 這章正式改以一個主題當主軸：獨立事件。\n"
            "2. 這章最容易和互斥搞混，先抓住「不影響機率」和「不能同時發生」是兩件完全不同的事。\n"
            "3. 看題目時先算交集，再拿去和機率乘積比較，通常比直接猜是否獨立穩很多。\n"
            "4. 三事件獨立不能只看兩兩獨立，這個提醒在主題整理裡要先看清楚。"
        ),
        "paragraphOriginal": "這章的原稿版直接對應分頁 PDF 的一個主題頁。整理時先抓獨立事件的定義，再往兩兩獨立與三事件獨立延伸。",
        "topics": [
            {
                "topicNumber": 1,
                "slug": "independent-events",
                "title": "獨立事件",
                "page": 43,
                "mainThemeId": "s4-3-2-main-theme-independent-events",
                "wrapperId": "s4-3-2-main-theme-independent-events-core",
                "summary": "整理獨立事件定義、條件機率觀點、互斥與獨立的差別，以及三事件獨立。",
                "rows": [
                    ["定義", "若 \\(P(A\\cap B)=P(A)P(B)\\)，則稱 \\(A\\) 與 \\(B\\) 獨立。"],
                    ["條件機率觀點", "若 \\(P(B)>0\\) 且 \\(P(A\\mid B)=P(A)\\)，也表示 \\(A\\) 和 \\(B\\) 獨立。"],
                    ["互斥不等於獨立", "兩個非空互斥事件通常不是獨立事件，因為其中一件發生會直接排除另一件。"],
                    ["三事件獨立", "不只要兩兩獨立，還要滿足三者交集的機率等於三個機率相乘。"],
                    ["常見判斷方式", "先算交集機率，再和乘積比較，是最直接的檢查法。"],
                    ["讀題提醒", "獨立是在說不影響機率，互斥是在說不能同時發生，兩者完全不同。"],
                ],
                "branchIds": [
                    "s4-3-2-independent-events-core",
                ],
            },
        ],
    },
]


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def find_topic(topics: list[dict], topic_id: str) -> dict:
    for topic in topics:
        if topic.get("id") == topic_id:
            return topic
    raise KeyError(f"Topic not found: {topic_id}")


def maybe_find_topic(topics: list[dict], topic_id: str) -> dict | None:
    for topic in topics:
        if topic.get("id") == topic_id:
            return topic
    return None


def set_chapter_fields(topic: dict, chapter_code: str) -> None:
    topic["chapter_code"] = chapter_code
    topic["chapterCode"] = chapter_code


def chapter_root_template(chapter_plan: dict, updated_at: str) -> dict:
    meta = chapter_plan["meta"]
    chapter_code = chapter_plan["chapterCode"]
    title = chapter_plan["rootTitle"]
    return {
        "id": chapter_plan["rootId"],
        "title": title,
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "定位", "values": [rf"\text{{{title}}}"]},
                {"label": "摘要", "values": [rf"\text{{{chapter_plan['groupName']}}}"]},
            ],
        },
        "stage": meta["stage"],
        "grade": meta["grade"],
        "term": meta["term"],
        "chapter": meta["chapter"],
        "domain": meta["domain"],
        "difficulty": "基礎",
        "chapterRole": "主角",
        "parentId": "",
        "tags": [chapter_code, title],
        "usage": [chapter_plan["groupName"]],
        "examples": [],
        "tips": ["先看主題，再往下展開原本的分支內容。"],
        "notes": ["這一層是章節穩定主軸。"],
        "mistakes": ["不要把舊核心主題直接當成章節 root。"],
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": meta["gradeLabel"],
        "section": meta["section"],
        "domainSub": meta["domainSub"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": chapter_plan.get("rootManualOrder", 0),
        "orderIndex": None,
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
    }


def formula_topic_template(root: dict, chapter_meta: dict, topic_id: str, title: str, parent_id: str, summary: str, updated_at: str, order_index: int) -> dict:
    chapter_code = root.get("chapterCode", root.get("chapter_code", ""))
    return {
        "id": topic_id,
        "title": title,
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "定位", "values": [rf"\text{{{title}}}"]},
                {"label": "摘要", "values": [rf"\text{{{summary}}}"]},
            ],
        },
        "stage": chapter_meta["stage"],
        "grade": chapter_meta["grade"],
        "term": chapter_meta["term"],
        "chapter": chapter_meta["chapter"],
        "domain": chapter_meta["domain"],
        "difficulty": root.get("difficulty", "基礎"),
        "chapterRole": "主題",
        "parentId": parent_id,
        "tags": [chapter_code, "主題", title],
        "usage": [summary],
        "examples": ["先看這一層主題整理，再往下展開原本的分支內容。"],
        "tips": ["如果題目太雜，先判斷它屬於哪個主題，再決定要往哪組分支看。"],
        "notes": ["這一層是固定主軸，之後章節大綱和主題頁都會先看這裡。"],
        "mistakes": ["不要把章節根節點和主題層當成同一層。"],
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": chapter_meta["gradeLabel"],
        "section": chapter_meta["section"],
        "domainSub": chapter_meta["domainSub"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": order_index,
        "orderIndex": order_index,
        "stageOrder": chapter_meta["stageOrder"],
        "gradeOrder": chapter_meta["gradeOrder"],
        "termOrder": chapter_meta["termOrder"],
        "chapterOrder": chapter_meta["chapterOrder"],
    }


def wrapper_topic_template(root: dict, chapter_meta: dict, wrapper_id: str, title: str, parent_id: str, summary: str, rows: list[list[str]], updated_at: str) -> dict:
    chapter_code = root.get("chapterCode", root.get("chapter_code", ""))
    top_lines = []
    for index, row in enumerate(rows[:3], start=1):
        top_lines.append({"label": f"重點{index}", "values": [row[0]]})
    return {
        "id": wrapper_id,
        "title": title,
        "formula": {"type": "labeled-lines", "lines": top_lines},
        "stage": chapter_meta["stage"],
        "grade": chapter_meta["grade"],
        "term": chapter_meta["term"],
        "chapter": chapter_meta["chapter"],
        "domain": chapter_meta["domain"],
        "difficulty": root.get("difficulty", "基礎"),
        "chapterRole": "主題",
        "parentId": parent_id,
        "contentTypes": ["公式", "定義", "題型", "使用技巧", "注意事項", "常見錯誤"],
        "contentTypesLocked": True,
        "tags": [chapter_code, title, "重點整理"],
        "usage": [summary],
        "examples": [],
        "tips": ["先看主題整理，再往下接既有分支。"],
        "notes": [f"來源：{SOURCE_REF}"],
        "mistakes": ["不要跳過主題整理就直接往下看分支。"],
        "mathNotationLocked": True,
        "modifiedAt": updated_at,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": chapter_meta["gradeLabel"],
        "section": chapter_meta["section"],
        "domainSub": chapter_meta["domainSub"],
        "isBranch": True,
        "stageOrder": chapter_meta["stageOrder"],
        "gradeOrder": chapter_meta["gradeOrder"],
        "termOrder": chapter_meta["termOrder"],
        "chapterOrder": chapter_meta["chapterOrder"],
        "manualOrder": 100,
        "orderIndex": 1,
    }


def upsert_topic(topics: list[dict], payload: dict) -> None:
    for index, topic in enumerate(topics):
        if topic.get("id") == payload["id"]:
            topics[index] = payload
            return
    topics.append(payload)


def reparent_branch(topics: list[dict], topic_id: str, parent_id: str, chapter_code: str) -> None:
    topic = find_topic(topics, topic_id)
    topic["parentId"] = parent_id
    set_chapter_fields(topic, chapter_code)


def normalize_chapter_topics(topics: list[dict], chapter_code: str, chapter_meta: dict) -> None:
    for topic in topics:
        topic_chapter_code = topic.get("chapterCode", topic.get("chapter_code", ""))
        if topic_chapter_code != chapter_code:
            continue
        topic["stage"] = chapter_meta["stage"]
        topic["grade"] = chapter_meta["grade"]
        topic["term"] = chapter_meta["term"]
        topic["gradeLabel"] = chapter_meta["gradeLabel"]
        topic["chapter"] = chapter_meta["chapter"]
        topic["section"] = chapter_meta["section"]
        topic["domain"] = chapter_meta["domain"]
        topic["domainSub"] = chapter_meta["domainSub"]
        topic["stageOrder"] = chapter_meta["stageOrder"]
        topic["gradeOrder"] = chapter_meta["gradeOrder"]
        topic["termOrder"] = chapter_meta["termOrder"]
        topic["chapterOrder"] = chapter_meta["chapterOrder"]
        set_chapter_fields(topic, chapter_code)


def build_main_topic_entry(topic_id: str, title: str, rows: list[list[str]], pdf_file: str, updated_at: str) -> dict:
    return {
        "id": topic_id,
        "title": title,
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "table",
                        "headers": ["重點", "整理"],
                        "rows": rows,
                    }
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "pdf-page",
                        "src": f"exports/main-theme-overviews/{pdf_file}",
                        "note": title,
                    }
                ],
            },
        ],
    }


def write_pdf_page(reader: PdfReader, page_number: int, destination: Path) -> None:
    writer = PdfWriter()
    writer.add_page(reader.pages[page_number - 1])
    with destination.open("wb") as handle:
        writer.write(handle)


def reminder_from_rows(rows: list[list[str]]) -> str:
    heads = [row[0] for row in rows[:4]]
    if not heads:
        return ""
    if len(heads) == 1:
        return heads[0]
    return "、".join(heads) + " 等重點"


def ensure_chapter_variant(entry: dict, variant_id: str, label: str, paragraph: str) -> dict:
    variants = entry.setdefault("variants", [])
    for variant in variants:
        if variant.get("id") == variant_id:
            break
    else:
        variant = {"id": variant_id, "label": label, "sections": []}
        variants.append(variant)

    variant["sections"] = [
        {"type": "paragraph", "text": paragraph},
        {"type": "table", "headers": ["主題", "角色", "下一層 / 提醒"], "rows": []},
    ]
    return variant


def update_chapter_overview(chapter_overview_db: dict, chapter_plan: dict, updated_at: str) -> None:
    rows = []
    for topic_plan in chapter_plan["topics"]:
        rows.append([topic_plan["title"], "主題", reminder_from_rows(topic_plan["rows"])])

    overviews = chapter_overview_db.setdefault("overviews", {})
    entry = overviews.setdefault(
        chapter_plan["chapterCode"],
        {
            "groupName": chapter_plan["groupName"],
            "title": "章節重點大綱",
            "variants": [],
        },
    )
    entry["groupName"] = chapter_plan["groupName"]
    entry["title"] = "章節重點大綱"
    entry["updatedAt"] = updated_at

    editable = ensure_chapter_variant(entry, "editable", "可修改版", chapter_plan["paragraphEditable"])
    original = ensure_chapter_variant(entry, "original", "原稿版", chapter_plan["paragraphOriginal"])

    for variant in [editable, original]:
        variant["sections"][1]["rows"] = deepcopy(rows)


def merge_manifest(existing_topics: list[dict], new_topics: list[dict], chapter_codes: set[str]) -> list[dict]:
    merged = [topic for topic in existing_topics if topic.get("chapterCode") not in chapter_codes]
    merged.extend(new_topics)
    return sorted(merged, key=lambda item: (item.get("chapterCode", ""), int(item.get("topicNumber", 0))))


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    chapter_overview_db = load_json(CHAPTER_OVERVIEW_DB)
    topics = formula_db.get("topics", [])
    main_topic_by_id = main_topic_db.setdefault("byId", {})
    ensure_dir(PDF_EXPORT_DIR)
    reader = PdfReader(str(SOURCE_PDF))

    existing_manifest = {"topics": []}
    if PDF_MANIFEST.exists():
        existing_manifest = load_json(PDF_MANIFEST)

    new_manifest_topics: list[dict] = []
    chapter_codes = {plan["chapterCode"] for plan in TOPIC_PLAN}

    for chapter_plan in TOPIC_PLAN:
        chapter_code = chapter_plan["chapterCode"]
        root = maybe_find_topic(topics, chapter_plan["rootId"])
        if root is None:
            root = chapter_root_template(chapter_plan, updated_at)
            upsert_topic(topics, root)
        chapter_meta = chapter_plan["meta"]

        for topic_plan in chapter_plan["topics"]:
            topic_number = topic_plan["topicNumber"]
            pdf_file = f"{chapter_code}-topic-{topic_number}-{topic_plan['slug']}.pdf"
            pdf_path = PDF_EXPORT_DIR / pdf_file
            write_pdf_page(reader, topic_plan["page"], pdf_path)

            main_theme_payload = formula_topic_template(
                root,
                chapter_meta,
                topic_plan["mainThemeId"],
                topic_plan["title"],
                chapter_plan["rootId"],
                topic_plan["summary"],
                updated_at,
                topic_number,
            )
            wrapper_payload = wrapper_topic_template(
                root,
                chapter_meta,
                topic_plan["wrapperId"],
                topic_plan["title"],
                topic_plan["mainThemeId"],
                topic_plan["summary"],
                topic_plan["rows"],
                updated_at,
            )
            upsert_topic(topics, main_theme_payload)
            upsert_topic(topics, wrapper_payload)

            for branch_id in topic_plan["branchIds"]:
                reparent_branch(topics, branch_id, topic_plan["wrapperId"], chapter_code)

            main_topic_by_id[topic_plan["mainThemeId"]] = build_main_topic_entry(
                topic_plan["mainThemeId"],
                topic_plan["title"],
                topic_plan["rows"],
                pdf_file,
                updated_at,
            )

            new_manifest_topics.append(
                {
                    "chapterCode": chapter_code,
                    "topicNumber": topic_number,
                    "slug": topic_plan["slug"],
                    "title": topic_plan["title"],
                    "page": topic_plan["page"],
                    "file": pdf_file,
                }
            )

        normalize_chapter_topics(topics, chapter_code, chapter_meta)
        update_chapter_overview(chapter_overview_db, chapter_plan, updated_at)

    formula_db.setdefault("meta", {})
    formula_db["meta"]["count"] = len(topics)
    formula_db["meta"]["updatedAt"] = updated_at
    main_topic_db.setdefault("meta", {})
    main_topic_db["meta"]["count"] = len(main_topic_by_id)
    main_topic_db["meta"]["updatedAt"] = updated_at
    chapter_overview_db.setdefault("meta", {})
    chapter_overview_db["meta"]["count"] = len(chapter_overview_db.get("overviews", {}))
    chapter_overview_db["meta"]["updatedAt"] = updated_at

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(CHAPTER_OVERVIEW_DB, chapter_overview_db)

    merged_topics = merge_manifest(existing_manifest.get("topics", []), new_manifest_topics, chapter_codes)
    PDF_MANIFEST.write_text(
        json.dumps(
            {
                "sourcePdf": str(SOURCE_PDF.resolve()),
                "count": len(merged_topics),
                "topics": merged_topics,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print("Updated chapters:", ", ".join(plan["chapterCode"] for plan in TOPIC_PLAN))
    print("Generated PDFs:", len(new_manifest_topics))


if __name__ == "__main__":
    main()
