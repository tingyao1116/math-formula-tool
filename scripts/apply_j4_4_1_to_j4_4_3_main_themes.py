from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
PDF_EXPORT_DIR = ROOT / "exports" / "main-theme-overviews"
PDF_MANIFEST = PDF_EXPORT_DIR / "junior-fourth-semester-topic-pdfs.json"
SOURCE_PDF = ROOT / "exports" / "j2-second-volume-outline" / "國二下全重點_易讀版分頁版_Word公式版.pdf"
SOURCE_REF = "國二下全重點_易讀版分頁版.md"
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
    return {
        "type": "labeled-lines",
        "lines": [
            {"label": f"重點{idx}", "values": [row[0]]}
            for idx, row in enumerate(rows[:3], start=1)
        ],
    }


def upsert_topic(topic_map: dict[str, dict], topic: dict) -> None:
    existing = topic_map.get(topic["id"], {})
    merged = dict(existing)
    merged.update(topic)
    topic_map[topic["id"]] = merged


def next_original_index(topic_map: dict[str, dict]) -> int:
    return max((int(topic.get("originalIndex", 0) or 0) for topic in topic_map.values()), default=0) + 1


def assign_original_index(topic_map: dict[str, dict], topic: dict, counter: list[int]) -> None:
    existing = topic_map.get(topic["id"])
    if existing and existing.get("originalIndex"):
        topic["originalIndex"] = existing["originalIndex"]
    else:
        topic["originalIndex"] = counter[0]
        counter[0] += 1


def build_root(meta: dict, root_id: str, title: str, manual_order: int) -> dict:
    return {
        "id": root_id,
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
        "manualOrder": manual_order,
    }


def build_main_theme(meta: dict, theme: dict, root_id: str) -> dict:
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
        "parentId": root_id,
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


def build_wrapper(meta: dict, theme: dict) -> dict:
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
    file_name = f"{topic['chapterCode']}-topic-{topic['topicNumber']}-{topic['slug']}.pdf"
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
                "sections": [{"type": "table", "headers": ["重點", "整理"], "rows": topic["rows"]}],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [{"type": "pdf-page", "src": f"data/main-theme-overviews/{pdf_file}", "note": topic["title"]}],
            },
        ],
    }


def retarget(topic: dict, meta: dict, parent_id: str) -> None:
    topic["parentId"] = parent_id
    topic["stage"] = meta["stage"]
    topic["grade"] = meta["grade"]
    topic["term"] = meta["term"]
    topic["gradeLabel"] = meta["gradeLabel"]
    topic["chapter"] = meta["chapter"]
    topic["section"] = meta["section"]
    topic["domain"] = meta["domain"]
    topic["domainSub"] = meta["domainSub"]
    topic["chapterCode"] = meta["chapterCode"]
    topic["chapter_code"] = meta["chapterCode"]
    topic["chapterOrder"] = meta["chapterOrder"]
    topic["stageOrder"] = meta["stageOrder"]
    topic["gradeOrder"] = meta["gradeOrder"]
    topic["termOrder"] = meta["termOrder"]
    topic["chapterRole"] = "分支"
    topic["isBranch"] = True
    topic["modifiedAt"] = meta["updatedAt"]


PLAN = [
    {
        "chapterCode": "j4-4-1",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "下學期",
            "gradeLabel": "國二下",
            "chapter": "平行與四邊形",
            "section": "平行",
            "domain": "幾何",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 2,
            "chapterOrder": 5,
        },
        "rootId": "junior-parallel-lines-main-j441",
        "rootTitle": "平行",
        "rootManualOrder": 1441,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "parallel-lines-transversal-and-angle-positions",
                "title": "平行線、截線與角的位置",
                "summary": "先辨認角在內部還是外部、在截線哪一側，後面同位角與內錯角才不會全部看錯。",
                "pageStart": 28,
                "pageEnd": 28,
                "mainThemeId": "j4-4-1-main-theme-parallel-lines-transversal-and-angle-positions",
                "wrapperId": "j4-4-1-main-theme-parallel-lines-transversal-and-angle-positions-core",
                "rows": [
                    ["平行線與截線的基本名詞", "同一平面內兩直線若永不相交，就稱為平行線；穿過兩條直線的第三條線稱為截線。"],
                    ["先看角的位置", "要先分辨角在兩平行線的內部還是外部，再看它在截線的哪一側。"],
                    ["位置看錯後面全錯", "若位置判錯，後面的同位角、內錯角、同側內角就會全判錯。"],
                    ["角度題先分類", "不要一開始就硬算，先辨認是哪一類角的位置關係。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 2,
                "slug": "parallel-lines-properties-and-criteria",
                "title": "平行線的性質與判別",
                "summary": "要分清楚自己現在在用平行線的性質，還是在用反過來的判別。",
                "pageStart": 29,
                "pageEnd": 29,
                "mainThemeId": "j4-4-1-main-theme-parallel-lines-properties-and-criteria",
                "wrapperId": "j4-4-1-main-theme-parallel-lines-properties-and-criteria-core",
                "rows": [
                    ["三個基本性質", "兩線平行時，同位角相等、內錯角相等、同側內角互補。"],
                    ["三個反向判別", "若同位角相等、內錯角相等，或同側內角互補，就能判定兩線平行。"],
                    ["平行線距離看垂直距離", "不是看斜斜的線段長。"],
                    ["性質和判別方向不同", "做題時要分清楚自己現在用的是性質還是判別。"],
                    ["常和三角形內角和一起用", "角度追蹤題很常把平行線性質和三角形內角和連在一起。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 3,
                "slug": "parallel-lines-angle-chasing",
                "title": "平行線與角度追蹤",
                "summary": "先搬角、再補角、最後代回題目問的量，是平行線角度題最穩的順序。",
                "pageStart": 30,
                "pageEnd": 30,
                "mainThemeId": "j4-4-1-main-theme-parallel-lines-angle-chasing",
                "wrapperId": "j4-4-1-main-theme-parallel-lines-angle-chasing-core",
                "rows": [
                    ["搬角先用同位角與內錯角", "看到平行線時，最常用的搬角工具是同位角與內錯角相等。"],
                    ["補角常用平角與同側內角", "看到平角或同側內角時，最常用的補角工具是和為 \\(180^\\circ\\)。"],
                    ["圖中有三角形就納入內角和", "若圖中同時有三角形，就要把三角形內角和 \\(180^\\circ\\) 一起考慮。"],
                    ["解題順序要穩", "通常是先搬角，再合角，再代回題目問的量。"],
                    ["平行輔助線常能簡化題目", "若一條輔助線能做出平行，就往往能讓複雜角度題突然變簡單。"],
                ],
                "branchIds": [],
            },
        ],
    },
    {
        "chapterCode": "j4-4-2",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "下學期",
            "gradeLabel": "國二下",
            "chapter": "平行與四邊形",
            "section": "平行四邊形",
            "domain": "幾何",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 2,
            "chapterOrder": 6,
        },
        "rootId": "junior-parallelogram-main-j442",
        "rootTitle": "平行四邊形",
        "rootManualOrder": 1442,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "parallelogram-definition-and-basic-figure",
                "title": "平行四邊形的定義與基本圖形",
                "summary": "先從兩組對邊分別平行的定義出發，再連對角線看出全等三角形是後面性質的來源。",
                "pageStart": 31,
                "pageEnd": 31,
                "mainThemeId": "j4-4-2-main-theme-parallelogram-definition-and-basic-figure",
                "wrapperId": "j4-4-2-main-theme-parallelogram-definition-and-basic-figure-core",
                "rows": [
                    ["平行四邊形的定義", "兩組對邊分別平行的四邊形，才叫平行四邊形。"],
                    ["一組對邊平行還不夠", "只知道一組對邊平行，仍可能只是梯形。"],
                    ["畫對角線常得到全等三角形", "畫對角線後，平行四邊形常會被分成兩個全等三角形。"],
                    ["先想到對邊、對角、對角線", "看到平行四邊形時，先整理這三類資訊。"],
                ],
                "branchIds": [
                    "j4-4-1-parallelogram-definition",
                    "j4-4-1-diagonal-congruence",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "parallelogram-properties",
                "title": "平行四邊形的性質",
                "summary": "對邊相等、對角相等、鄰角互補、對角線互相平分，是最常用的四組性質。",
                "pageStart": 32,
                "pageEnd": 32,
                "mainThemeId": "j4-4-2-main-theme-parallelogram-properties",
                "wrapperId": "j4-4-2-main-theme-parallelogram-properties-core",
                "rows": [
                    ["兩組對邊分別相等", "所以周長常可寫成 \\(2(\\text{一邊}+\\text{鄰邊})\\)。"],
                    ["對角相等、鄰角互補", "知道一個角，就能推另外三個角。"],
                    ["兩條對角線互相平分", "若交點為 \\(O\\)，則常有 \\(AO=OC\\)、\\(BO=OD\\)。"],
                    ["對角線不一定相等", "一般平行四邊形的對角線不一定相等，這點常和長方形混淆。"],
                    ["很多證明先連一條對角線", "再用全等推出這些性質。"],
                ],
                "branchIds": [
                    "j4-4-1-opposite-sides-equal",
                    "j4-4-1-opposite-angles-supplementary",
                    "j4-4-1-diagonal-bisect-property",
                ],
            },
            {
                "topicNumber": 3,
                "slug": "parallelogram-criteria",
                "title": "平行四邊形的判別",
                "summary": "做判別題時，先分清楚題目給的是邊、角還是對角線資訊，再選最快的判別方式。",
                "pageStart": 33,
                "pageEnd": 33,
                "mainThemeId": "j4-4-2-main-theme-parallelogram-criteria",
                "wrapperId": "j4-4-2-main-theme-parallelogram-criteria-core",
                "rows": [
                    ["一組對邊平行且相等", "若一組對邊同時平行且相等，就能判定是平行四邊形。"],
                    ["兩組對邊分別相等", "也能判定是平行四邊形。"],
                    ["兩組對角分別相等", "通常要搭配四邊形內角和來思考，也能判定是平行四邊形。"],
                    ["兩條對角線互相平分", "在座標題裡很常見，也能直接判別。"],
                    ["先看資訊類型再選方法", "邊、角、對角線的判別路徑不同。"],
                ],
                "branchIds": [
                    "j4-4-1-criterion-onepair-parallel-equal",
                    "j4-4-1-criterion-two-pairs-sides",
                    "j4-4-1-criterion-two-pairs-angles",
                    "j4-4-1-criterion-diagonal-bisect",
                ],
            },
        ],
    },
    {
        "chapterCode": "j4-4-3",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "下學期",
            "gradeLabel": "國二下",
            "chapter": "平行與四邊形",
            "section": "梯形及其他四邊形關係",
            "domain": "幾何",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 2,
            "chapterOrder": 7,
        },
        "rootId": "junior-special-quadrilateral-main-j443",
        "rootTitle": "梯形及其他四邊形關係",
        "rootManualOrder": 1443,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "special-parallelograms-and-integrated-applications",
                "title": "特殊平行四邊形與綜合應用",
                "summary": "把長方形、菱形、正方形的特殊性質，和角度、面積、座標、摺疊等綜合題連起來看。",
                "pageStart": 34,
                "pageEnd": 34,
                "mainThemeId": "j4-4-3-main-theme-special-parallelograms-and-integrated-applications",
                "wrapperId": "j4-4-3-main-theme-special-parallelograms-and-integrated-applications-core",
                "rows": [
                    ["長方形", "是四個角都為直角的平行四邊形，所以對角線還會相等。"],
                    ["菱形", "是四邊都相等的平行四邊形，所以對角線常互相垂直。"],
                    ["正方形", "同時具有長方形與菱形的性質，因此是最完整的特殊平行四邊形。"],
                    ["綜合題常混用角度、全等和平四性質", "不能只背單一結論，要會切換工具。"],
                    ["先標清楚記號再算", "哪些邊平行、哪些邊相等、對角線交點在哪裡，都先標出來。"],
                ],
                "branchIds": [
                    "j4-4-2-midpoint-theorem",
                    "j4-4-2-midpoint-extension-proof",
                    "j4-4-2-interior-point-area-relation",
                    "j4-4-2-angle-perimeter-routine",
                    "j4-4-2-midpoint-area-allocation",
                    "j4-4-2-area-height-diagonal",
                    "j4-4-2-overlap-angle-chasing",
                    "j4-4-2-sector-area-application",
                    "j4-4-2-coordinate-midpoint-parallelogram",
                    "j4-4-2-folding-angle-bisector-composite",
                ],
            }
        ],
    },
]


def upsert_main_topic_entry(store: dict, topic: dict, updated_at: str, pdf_file: str) -> None:
    store[topic["mainThemeId"]] = {
        "id": topic["mainThemeId"],
        "title": topic["title"],
        "updatedAt": updated_at,
        "variants": [
            {"id": "editable", "label": "可修改版", "sections": [{"type": "table", "headers": ["重點", "整理"], "rows": topic["rows"]}]},
            {"id": "original", "label": "原稿版", "sections": [{"type": "pdf-page", "src": f"data/main-theme-overviews/{pdf_file}", "note": topic["title"]}]},
        ],
    }


def retarget(topic: dict, meta: dict, parent_id: str) -> None:
    topic["parentId"] = parent_id
    topic["stage"] = meta["stage"]
    topic["grade"] = meta["grade"]
    topic["term"] = meta["term"]
    topic["gradeLabel"] = meta["gradeLabel"]
    topic["chapter"] = meta["chapter"]
    topic["section"] = meta["section"]
    topic["domain"] = meta["domain"]
    topic["domainSub"] = meta["domainSub"]
    topic["chapterCode"] = meta["chapterCode"]
    topic["chapter_code"] = meta["chapterCode"]
    topic["chapterOrder"] = meta["chapterOrder"]
    topic["stageOrder"] = meta["stageOrder"]
    topic["gradeOrder"] = meta["gradeOrder"]
    topic["termOrder"] = meta["termOrder"]
    topic["chapterRole"] = "分支"
    topic["isBranch"] = True
    topic["modifiedAt"] = meta["updatedAt"]


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    topic_map = {topic["id"]: topic for topic in formula_db.get("topics", [])}
    original_index_counter = [next_original_index(topic_map)]
    reader = PdfReader(str(SOURCE_PDF))

    manifest = {"sourcePdf": str(SOURCE_PDF), "count": 0, "topics": []}
    if PDF_MANIFEST.exists():
        manifest = load_json(PDF_MANIFEST)
        manifest["sourcePdf"] = str(SOURCE_PDF)
    manifest_topics = [item for item in manifest.get("topics", []) if item.get("chapterCode") not in {"j4-4-1", "j4-4-2", "j4-4-3"}]

    for chapter in PLAN:
        meta = dict(chapter["meta"])
        meta["chapterCode"] = chapter["chapterCode"]
        meta["updatedAt"] = updated_at

        root = build_root(meta, chapter["rootId"], chapter["rootTitle"], chapter["rootManualOrder"])
        assign_original_index(topic_map, root, original_index_counter)
        upsert_topic(topic_map, root)

        for theme in chapter["topics"]:
            theme_entry = build_main_theme(meta, theme, chapter["rootId"])
            assign_original_index(topic_map, theme_entry, original_index_counter)
            upsert_topic(topic_map, theme_entry)

            wrapper = build_wrapper(meta, theme)
            assign_original_index(topic_map, wrapper, original_index_counter)
            upsert_topic(topic_map, wrapper)

            pdf_file = export_topic_pdf(reader, {"chapterCode": chapter["chapterCode"], **theme})
            manifest_topics.append(
                {
                    "chapterCode": chapter["chapterCode"],
                    "topicNumber": theme["topicNumber"],
                    "slug": theme["slug"],
                    "title": theme["title"],
                    "pageStart": theme["pageStart"],
                    "pageEnd": theme["pageEnd"],
                    "file": pdf_file,
                }
            )
            upsert_main_topic_entry(main_topic_db.setdefault("byId", {}), theme, updated_at, pdf_file)

            for branch_id in theme["branchIds"]:
                branch = topic_map.get(branch_id)
                if branch:
                    retarget(branch, meta, theme["wrapperId"])

    formula_db["topics"] = sorted(
        topic_map.values(),
        key=lambda topic: (
            int(topic.get("stageOrder", 999) or 999),
            int(topic.get("gradeOrder", 999) or 999),
            int(topic.get("termOrder", 999) or 999),
            int(topic.get("chapterOrder", 999) or 999),
            str(topic.get("chapterCode", topic.get("chapter_code", ""))),
            int(topic.get("manualOrder", 99999) or 99999),
            int(topic.get("originalIndex", 999999) or 999999),
            topic["id"],
        ),
    )
    formula_db.setdefault("meta", {})
    formula_db["meta"]["updatedAt"] = updated_at

    main_topic_db.setdefault("meta", {})
    main_topic_db["meta"]["count"] = len(main_topic_db.get("byId", {}))
    main_topic_db["meta"]["updatedAt"] = updated_at
    main_topic_db["meta"]["source"] = "data/main-theme-overviews"

    manifest_topics.sort(key=lambda item: (item["chapterCode"], int(item["topicNumber"]), item["slug"]))
    manifest["topics"] = manifest_topics
    manifest["count"] = len(manifest_topics)

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(PDF_MANIFEST, manifest)
    print("Applied main themes for j4-4-1 ~ j4-4-3")


if __name__ == "__main__":
    main()

