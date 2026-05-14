from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "junior-third-semester-topic-pdfs.json"
SOURCE_PDF = ROOT / "exports" / "j2-first-volume-outline" / "國二上全重點_易讀版分頁版_Word公式版.pdf"
SOURCE_REF = "國二上全重點_易讀版分頁版.md"
TZ = timezone(timedelta(hours=8))


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def make_formula_lines(title: str, summary: str) -> dict:
    return {
        "type": "labeled-lines",
        "lines": [
            {"label": "定位", "values": [f"\\text{{{title}}}"]},
            {"label": "摘要", "values": [f"\\text{{{summary}}}"]},
        ],
    }


def make_core_formula_lines(rows: list[list[str]]) -> dict:
    lines = []
    for idx, row in enumerate(rows[:3], start=1):
        lines.append({"label": f"重點{idx}", "values": [row[0]]})
    return {"type": "labeled-lines", "lines": lines}


def upsert_topic(topic_map: dict[str, dict], topic: dict) -> None:
    existing = topic_map.get(topic["id"], {})
    merged = dict(existing)
    merged.update(topic)
    topic_map[topic["id"]] = merged


def build_root(meta: dict) -> dict:
    title = "利用十字交乘因式分解"
    return {
        "id": "junior-factorization-cross-main-j333",
        "title": title,
        "formula": make_formula_lines(title, title),
        "stage": meta["stage"],
        "grade": meta["grade"],
        "term": meta["term"],
        "chapter": meta["chapter"],
        "section": meta["section"],
        "domain": meta["domain"],
        "domainSub": meta["domainSub"],
        "difficulty": "基礎",
        "chapterRole": "主角",
        "parentId": "",
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "tags": [meta["chapterCode"], title],
        "usage": [title],
        "examples": [],
        "tips": ["先看主題，再往下展開原本的分支內容。"],
        "notes": ["這一層是章節穩定主軸。"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "chapterCode": meta["chapterCode"],
        "isBranch": False,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "manualOrder": 1333,
    }


def build_main_theme(meta: dict, theme: dict) -> dict:
    return {
        "id": theme["mainThemeId"],
        "title": theme["title"],
        "formula": make_formula_lines(theme["title"], theme["summary"]),
        "stage": meta["stage"],
        "grade": meta["grade"],
        "term": meta["term"],
        "chapter": meta["chapter"],
        "section": meta["section"],
        "domain": meta["domain"],
        "domainSub": meta["domainSub"],
        "difficulty": "基礎",
        "chapterRole": "主題",
        "parentId": "junior-factorization-cross-main-j333",
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "tags": [meta["chapterCode"], "主題", theme["title"]],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": ["如果題目太雜，先判斷它屬於哪個主題，再決定往哪組分支看。"],
        "notes": ["這一層是固定主軸，之後章節大綱和主題頁都會先看這裡。"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "chapterCode": meta["chapterCode"],
        "isBranch": False,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "manualOrder": theme["topicNumber"],
    }


def build_main_theme_core(meta: dict, theme: dict) -> dict:
    return {
        "id": theme["wrapperId"],
        "title": theme["title"],
        "formula": make_core_formula_lines(theme["rows"]),
        "stage": meta["stage"],
        "grade": meta["grade"],
        "term": meta["term"],
        "chapter": meta["chapter"],
        "section": meta["section"],
        "domain": meta["domain"],
        "domainSub": meta["domainSub"],
        "difficulty": "基礎",
        "chapterRole": "主題",
        "parentId": theme["mainThemeId"],
        "contentTypes": ["公式", "定義", "題型", "使用技巧", "注意事項", "常見錯誤"],
        "tags": [meta["chapterCode"], theme["title"], "重點整理"],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": ["先看主題整理，再往下接既有分支。"],
        "notes": [f"來源：{SOURCE_REF}"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "chapterCode": meta["chapterCode"],
        "isBranch": False,
        "relatedChapters": [],
        "relatedTopicIds": [],
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "manualOrder": theme["topicNumber"] * 100,
    }


def export_topic_pdf(reader: PdfReader, topic: dict) -> str:
    file_name = f"j3-3-3-topic-{topic['topicNumber']}-{topic['slug']}.pdf"
    output_path = PDF_EXPORT_DIR / file_name
    writer = PdfWriter()
    for page_number in range(topic["pageStart"] - 1, topic["pageEnd"]):
        writer.add_page(reader.pages[page_number])
    with output_path.open("wb") as fh:
        writer.write(fh)
    return file_name


def upsert_main_topic_entry(store: dict, topic: dict, updated_at: str, pdf_file: str) -> None:
    store[topic["mainThemeId"]] = {
        "id": topic["mainThemeId"],
        "title": topic["title"],
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "table",
                        "headers": ["重點", "整理"],
                        "rows": topic["rows"],
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
                        "note": topic["title"],
                    }
                ],
            },
        ],
    }


TOPICS = [
    {
        "topicNumber": 1,
        "slug": "cross-method-leading-one",
        "title": "十字交乘法：首項係數為 1",
        "summary": "先用係數為 1 的二次式練熟『兩數和、兩數積』，再往一般型推。",
        "pageStart": 32,
        "pageEnd": 32,
        "mainThemeId": "j3-3-3-main-theme-cross-method-leading-one",
        "wrapperId": "j3-3-3-main-theme-cross-method-leading-one-core",
        "rows": [
            ["先找兩數和與兩數積", "若二次式是 \\(x^2+bx+c\\)，可嘗試寫成 \\((x+m)(x+n)\\)，並找出 \\(m+n=b\\)、\\(mn=c\\)。"],
            ["\\(c>0\\) 與 \\(c<0\\) 的符號判斷", "當 \\(c>0\\) 時兩數同號；當 \\(c<0\\) 時兩數異號。"],
            ["先從首項係數為 1 練熟", "這一型最能看出十字交乘本質是在反向還原二項式相乘。"],
            ["展開驗算很重要", "分解完最好再展開一次，確認和中間項、常數項都對。"],
            ["先看能不能更簡單", "如果原式還有公因式，應先提出來，再做十字交乘。"],
        ],
        "branchIds": [
            "factorization-cross-method-junior",
            "cross-warmup-leading-one",
            "cross-change-sign-first",
            "j3-3-3-cross-main",
            "j3-3-3-ac-pair-selection",
        ],
    },
    {
        "topicNumber": 2,
        "slug": "cross-method-general-and-substitution",
        "title": "十字交乘法：一般二次式與換元",
        "summary": "一般二次式要同時顧到首項、常數項和交叉和；高次但像二次的題目則要會換元。",
        "pageStart": 33,
        "pageEnd": 33,
        "mainThemeId": "j3-3-3-main-theme-cross-method-general-and-substitution",
        "wrapperId": "j3-3-3-main-theme-cross-method-general-and-substitution-core",
        "rows": [
            ["一般二次式條件", "若 \\(ax^2+bx+c\\) 要分成 \\((px+q)(rx+s)\\)，則要同時滿足 \\(pr=a\\)、\\(qs=c\\)、\\(ps+qr=b\\)。"],
            ["先整理再交乘", "若原式三項有公因式，應先提出來，否則交乘會看不清楚。"],
            ["結構像二次就換元", "遇到高次但外形像二次的式子，可把 \\(x^3\\) 或其他整塊先看成新未知量。"],
            ["分完一層還要再看", "若分解出來後又露出平方差或立方和差，還要繼續做，不能只停第一層。"],
            ["最容易錯在交叉和", "一般型十字交乘最容易錯在中間項，所以最後展開檢查是必要的。"],
        ],
        "branchIds": [
            "cross-simplify-first",
            "cross-two-symbols",
            "cross-leading-not-one",
            "j3-3-3-split-middle-term",
            "j3-3-3-leading-coef-not-one",
            "j3-3-3-pre-cleaning",
            "j3-3-3-cross-validation",
        ],
    },
]


def main() -> None:
    updated_at = now_iso()
    meta = {
        "stage": "國中",
        "grade": "國二",
        "term": "上學期",
        "gradeLabel": "國二冊",
        "chapter": "因式分解",
        "section": "利用十字交乘因式分解",
        "domain": "代數",
        "domainSub": "",
        "stageOrder": 1,
        "gradeOrder": 2,
        "termOrder": 1,
        "chapterOrder": 9,
        "chapterCode": "j3-3-3",
        "updatedAt": updated_at,
    }
    formula_payload = load_json(FORMULA_DB)
    main_topic_payload = load_json(MAIN_TOPIC_DB)
    original_topics = formula_payload.get("topics", [])
    topic_map = {topic["id"]: topic for topic in original_topics}
    main_topic_store = main_topic_payload.setdefault("byId", {})
    manifest = load_json(PDF_MANIFEST)
    reader = PdfReader(str(SOURCE_PDF))

    upsert_topic(topic_map, build_root(meta))
    manifest_entries: list[dict] = []

    for topic in TOPICS:
        pdf_file = export_topic_pdf(reader, topic)
        manifest_entries.append(
            {
                "chapterCode": "j3-3-3",
                "topicNumber": topic["topicNumber"],
                "slug": topic["slug"],
                "title": topic["title"],
                "pageStart": topic["pageStart"],
                "pageEnd": topic["pageEnd"],
                "file": pdf_file,
            }
        )
        upsert_topic(topic_map, build_main_theme(meta, topic))
        upsert_topic(topic_map, build_main_theme_core(meta, topic))
        upsert_main_topic_entry(main_topic_store, topic, updated_at, pdf_file)
        for branch_id in topic["branchIds"]:
            branch = topic_map.get(branch_id)
            if not branch:
                continue
            branch["parentId"] = topic["wrapperId"]
            branch["chapterCode"] = "j3-3-3"
            branch["chapter_code"] = "j3-3-3"
            branch["chapter"] = meta["chapter"]
            branch["section"] = meta["section"]
            branch["domain"] = meta["domain"]
            branch["domainSub"] = meta["domainSub"]
            branch["modifiedAt"] = updated_at

    keep = [entry for entry in manifest.get("topics", []) if entry.get("chapterCode") != "j3-3-3"]
    keep.extend(manifest_entries)
    keep.sort(key=lambda item: (item["chapterCode"], item["topicNumber"]))
    manifest["topics"] = keep
    manifest["count"] = len(keep)
    manifest["sourcePdf"] = str(SOURCE_PDF)

    ordered_topics: list[dict] = []
    seen_ids: set[str] = set()
    for topic in original_topics:
        current = topic_map.get(topic["id"])
        if not current:
            continue
        ordered_topics.append(current)
        seen_ids.add(topic["id"])
    next_original_index = len(ordered_topics)
    for topic_id, topic in topic_map.items():
        if topic_id in seen_ids:
            continue
        topic.setdefault("originalIndex", next_original_index)
        next_original_index += 1
        ordered_topics.append(topic)

    formula_payload["topics"] = ordered_topics
    formula_payload.setdefault("meta", {})
    formula_payload["meta"]["updatedAt"] = updated_at
    main_topic_payload.setdefault("meta", {})
    main_topic_payload["meta"]["updatedAt"] = updated_at

    save_json(FORMULA_DB, formula_payload)
    save_json(MAIN_TOPIC_DB, main_topic_payload)
    save_json(PDF_MANIFEST, manifest)
    print("Updated j3-3-3 main themes.")


if __name__ == "__main__":
    main()
