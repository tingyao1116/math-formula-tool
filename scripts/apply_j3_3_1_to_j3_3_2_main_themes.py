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


def build_root(meta: dict, root_id: str, root_title: str, manual_order: int) -> dict:
    return {
        "id": root_id,
        "title": root_title,
        "formula": make_formula_lines(root_title, root_title),
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
        "tags": [meta["chapterCode"], root_title],
        "usage": [root_title],
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


def append_manifest_entries(manifest: dict, topics: list[dict]) -> None:
    keep = [entry for entry in manifest.get("topics", []) if entry.get("chapterCode") not in {"j3-3-1", "j3-3-2"}]
    keep.extend(topics)
    keep.sort(key=lambda item: (item["chapterCode"], item["topicNumber"]))
    manifest["topics"] = keep
    manifest["count"] = len(keep)


TOPIC_PLAN = [
    {
        "chapterCode": "j3-3-1",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二冊",
            "chapter": "因式分解",
            "section": "利用提公因式因式分解",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 7,
        },
        "rootId": "junior-factorization-common-factor-main-j331",
        "rootTitle": "利用提公因式因式分解",
        "rootManualOrder": 1331,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "meaning-of-factorization",
                "title": "因式分解的意義",
                "summary": "先分清楚展開和因式分解是在做相反方向的整理，後面各種方法才不會混在一起。",
                "pageStart": 24,
                "pageEnd": 24,
                "mainThemeId": "j3-3-1-main-theme-meaning-of-factorization",
                "wrapperId": "j3-3-1-main-theme-meaning-of-factorization-core",
                "rows": [
                    ["展開與因式分解相反", "展開是把乘積寫成多項式，例如 \\((x+1)(x-2)=x^2-x-2\\)；因式分解則是反過來。"],
                    ["因式與倍式的觀念", "能相乘得到原多項式的每個部分，都叫原多項式的因式。"],
                    ["目標是分到不能再分", "通常要分到一次式或基本公式型為止，不能太早停。"],
                    ["和下一章緊密連動", "因式分解常用來解一元二次方程式，所以這章和第四章會一路串起來。"],
                    ["先看懂意義再學方法", "如果只記招式而不懂目的，後面很容易不知道該用哪一種拆法。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 2,
                "slug": "factors-multiples-and-divisibility",
                "title": "因式、倍式與整除判別",
                "summary": "先知道什麼叫因式、什麼叫整除，後面才知道為什麼某個拆法算成功。",
                "pageStart": 25,
                "pageEnd": 25,
                "mainThemeId": "j3-3-1-main-theme-factors-multiples-and-divisibility",
                "wrapperId": "j3-3-1-main-theme-factors-multiples-and-divisibility-core",
                "rows": [
                    ["因式與倍式", "若 \\(f(x)=g(x)h(x)\\)，且 \\(g(x),h(x)\\) 不是零多項式，則 \\(g(x)\\)、\\(h(x)\\) 都是 \\(f(x)\\) 的因式。"],
                    ["整除判別", "若 \\(f(x)\\div g(x)\\) 的餘式為 \\(0\\)，就表示 \\(g(x)\\) 可以整除 \\(f(x)\\)。"],
                    ["不能整除就不是因式", "這是最直接的判準，不要把『看起來像』當成真的因式。"],
                    ["整除判別穩但可能長", "遇到一次因式時，之後常可改用因式定理更快。"],
                    ["因式和倍式是相對關係", "同一個式子，站在不同角度描述時，會分別叫因式或倍式。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 3,
                "slug": "factor-and-remainder-theorems",
                "title": "因式定理與餘式定理",
                "summary": "這一頁是把『是不是因式』和『代值結果』直接連起來，之後判斷會快很多。",
                "pageStart": 26,
                "pageEnd": 26,
                "mainThemeId": "j3-3-1-main-theme-factor-and-remainder-theorems",
                "wrapperId": "j3-3-1-main-theme-factor-and-remainder-theorems-core",
                "rows": [
                    ["因式定理", "若 \\(x-c\\) 是 \\(f(x)\\) 的因式，則 \\(f(c)=0\\)；反過來也成立。"],
                    ["餘式定理", "\\(f(x)\\) 除以 \\(x-c\\) 的餘式就是 \\(f(c)\\)。"],
                    ["候選因式是 \\(ax+b\\) 時", "要先令 \\(ax+b=0\\)，得到 \\(x=-\\frac{b}{a}\\) 再代回檢查。"],
                    ["判斷比整除更快", "遇到一次因式時，直接代值通常比長除法更快。"],
                    ["同一條思路", "不管是判斷因式還是求餘式，本質都在看代入之後的數值。"],
                ],
                "branchIds": [],
            },
            {
                "topicNumber": 4,
                "slug": "common-factor-method",
                "title": "提公因式法",
                "summary": "看到因式分解題，第一眼先找公因式，很多題目其實先提掉就簡單很多。",
                "pageStart": 27,
                "pageEnd": 27,
                "mainThemeId": "j3-3-1-main-theme-common-factor-method",
                "wrapperId": "j3-3-1-main-theme-common-factor-method-core",
                "rows": [
                    ["第一眼先找公因式", "很多題目表面複雜，其實只是還沒先把共同部分提出來。"],
                    ["公因式不只是一個數", "公因式可能是數字、文字，也可能是一整個括號。"],
                    ["提出後每項都要除乾淨", "括號內每一項都要是原式對應項除過後的結果，不能漏。"],
                    ["互為相反數要先調整", "像 \\((2y-x)\\) 與 \\((x-2y)\\) 要先變成同一種形式才好提。"],
                    ["很多題提完才露出外形", "提完公因式後，後面才常會露出平方差或十字交乘的形狀。"],
                ],
                "branchIds": [
                    "factorization-common-factor-junior",
                    "factor-common-basic-examples",
                    "j3-3-1-common-factor-main",
                    "j3-3-1-number-letter-gcf",
                ],
            },
            {
                "topicNumber": 5,
                "slug": "grouping-common-factor",
                "title": "分組提公因式",
                "summary": "四項式或項數較多時，先分組做出共同括號，通常是最穩的方向。",
                "pageStart": 28,
                "pageEnd": 28,
                "mainThemeId": "j3-3-1-main-theme-grouping-common-factor",
                "wrapperId": "j3-3-1-main-theme-grouping-common-factor-core",
                "rows": [
                    ["分組的目的", "先分成兩組或多組，各自提公因式，最後做出共同括號。"],
                    ["出現相同括號就成功", "若提完後出現相同括號，就表示可以再把那個括號提到外面。"],
                    ["分組方式不只一種", "要選最容易做出共同括號的分法，不是任意切兩半就好。"],
                    ["本質還是分配律反向", "分組提公因式不是新規則，仍然是在反向利用分配律。"],
                    ["先看括號能不能對齊", "分組前先觀察每一組提出後，能不能長成同一個括號。"],
                ],
                "branchIds": [
                    "factor-grouping-common-factor",
                    "factor-six-terms-common-factor",
                    "j3-3-1-grouping-factor",
                    "j3-3-1-bracket-common-factor",
                ],
            },
            {
                "topicNumber": 6,
                "slug": "split-and-grouping",
                "title": "拆項後分組",
                "summary": "有些題不能直接分組，要先拆中間項，再把它改寫成更容易分組的樣子。",
                "pageStart": 29,
                "pageEnd": 29,
                "mainThemeId": "j3-3-1-main-theme-split-and-grouping",
                "wrapperId": "j3-3-1-main-theme-split-and-grouping-core",
                "rows": [
                    ["先拆中間項", "有些式子表面上不能直接分組，所以要先把中間項拆成兩部分。"],
                    ["拆項時原式不能變", "拆項只是改寫，不是換題，所以和與積條件都要顧到。"],
                    ["拆完再做分組", "拆項後項數變多，接著要立刻連到分組提公因式。"],
                    ["和十字交乘思路相近", "很多拆項題其實也在看兩數和與兩數積。"],
                    ["最後記得回乘驗證", "如果拆完還是分不出共同括號，就要回頭檢查拆法。"],
                ],
                "branchIds": [
                    "factor-change-sign-first",
                    "factor-remove-parentheses-regroup",
                    "factor-repeated-common-factor",
                    "j3-3-1-sign-adjust-factor",
                    "j3-3-1-multiply-back-check",
                ],
            },
        ],
    },
    {
        "chapterCode": "j3-3-2",
        "meta": {
            "stage": "國中",
            "grade": "國二",
            "term": "上學期",
            "gradeLabel": "國二冊",
            "chapter": "因式分解",
            "section": "利用乘法公式因式分解",
            "domain": "代數",
            "domainSub": "",
            "stageOrder": 1,
            "gradeOrder": 2,
            "termOrder": 1,
            "chapterOrder": 8,
        },
        "rootId": "junior-factorization-identities-main-j332",
        "rootTitle": "利用乘法公式因式分解",
        "rootManualOrder": 1332,
        "topics": [
            {
                "topicNumber": 1,
                "slug": "perfect-square-and-difference-of-squares-factorization",
                "title": "完全平方與平方差因式分解",
                "summary": "看到三項式先判斷是不是完全平方，看到兩平方相減再判斷是不是平方差。",
                "pageStart": 30,
                "pageEnd": 30,
                "mainThemeId": "j3-3-2-main-theme-perfect-square-and-difference-of-squares-factorization",
                "wrapperId": "j3-3-2-main-theme-perfect-square-and-difference-of-squares-factorization-core",
                "rows": [
                    ["完全平方和與差", "\\(a^2+2ab+b^2=(a+b)^2\\)，\\(a^2-2ab+b^2=(a-b)^2\\)。"],
                    ["平方差公式", "\\(a^2-b^2=(a+b)(a-b)\\)。"],
                    ["判斷完全平方", "要同時看首項、末項和中間項是否剛好對應 \\(2ab\\)。"],
                    ["判斷平方差", "要確認是兩個平方相減，而且中間沒有其他多餘項。"],
                    ["先辨識型再下手", "不要一看到平方就套公式，先判斷它是哪一種外形。"],
                ],
                "branchIds": [
                    "factorization-identities-junior",
                    "factor-identity-difference-of-squares",
                    "factor-group-then-difference-of-squares",
                    "factor-perfect-square-trinomial",
                    "factor-group-then-perfect-square",
                    "factor-perfect-square-find-coefficient",
                    "j3-3-2-diff-square-factor",
                    "j3-3-2-perfect-square-factor",
                    "j3-3-2-formula-recognition",
                    "j3-3-2-formula-value",
                ],
            },
            {
                "topicNumber": 2,
                "slug": "sum-difference-of-cubes-and-higher-degree-factorization",
                "title": "立方和、立方差與高次式分解",
                "summary": "高次式常常不是直接硬拆，而是先換角度，把它看成平方差或立方和差再一路往下分。",
                "pageStart": 31,
                "pageEnd": 31,
                "mainThemeId": "j3-3-2-main-theme-sum-difference-of-cubes-and-higher-degree-factorization",
                "wrapperId": "j3-3-2-main-theme-sum-difference-of-cubes-and-higher-degree-factorization-core",
                "rows": [
                    ["立方和公式", "\\(a^3+b^3=(a+b)(a^2-ab+b^2)\\)。"],
                    ["立方差公式", "\\(a^3-b^3=(a-b)(a^2+ab+b^2)\\)。"],
                    ["高次式先換角度", "像 \\(x^6-1\\) 可以看成 \\((x^3)^2-1^2\\) 或 \\((x^2)^3-1^3\\)。"],
                    ["常要連續分解", "同一題可能先做平方差，再做立方差，不能只分第一層。"],
                    ["最後檢查能不能再分", "分解完成後，要再看一次是否已經分到不能再分為止。"],
                ],
                "branchIds": [
                    "j3-3-2-recursive-factor",
                ],
            },
        ],
    },
]

MOVE_TO_J333 = [
    "factorization-cross-method-junior",
    "cross-warmup-leading-one",
    "cross-simplify-first",
    "cross-change-sign-first",
    "cross-two-symbols",
    "cross-leading-not-one",
]


def main() -> None:
    updated_at = now_iso()
    formula_payload = load_json(FORMULA_DB)
    main_topic_payload = load_json(MAIN_TOPIC_DB)
    original_topics = formula_payload.get("topics", [])
    topic_map = {topic["id"]: topic for topic in original_topics}
    main_topic_store = main_topic_payload.setdefault("byId", {})
    manifest = load_json(PDF_MANIFEST)
    reader = PdfReader(str(SOURCE_PDF))
    manifest_entries: list[dict] = []

    for chapter_plan in TOPIC_PLAN:
        meta = dict(chapter_plan["meta"])
        meta["chapterCode"] = chapter_plan["chapterCode"]
        meta["updatedAt"] = updated_at

        upsert_topic(
            topic_map,
            build_root(meta, chapter_plan["rootId"], chapter_plan["rootTitle"], chapter_plan["rootManualOrder"]),
        )

        for topic in chapter_plan["topics"]:
            topic["chapterCode"] = chapter_plan["chapterCode"]
            pdf_file = export_topic_pdf(reader, topic)
            manifest_entries.append(
                {
                    "chapterCode": chapter_plan["chapterCode"],
                    "topicNumber": topic["topicNumber"],
                    "slug": topic["slug"],
                    "title": topic["title"],
                    "pageStart": topic["pageStart"],
                    "pageEnd": topic["pageEnd"],
                    "file": pdf_file,
                }
            )
            upsert_topic(topic_map, build_main_theme(meta, topic, chapter_plan["rootId"]))
            upsert_topic(topic_map, build_main_theme_core(meta, topic))
            upsert_main_topic_entry(main_topic_store, topic, updated_at, pdf_file)

            for branch_id in topic["branchIds"]:
                branch = topic_map.get(branch_id)
                if not branch:
                    continue
                branch["parentId"] = topic["wrapperId"]
                branch["chapterCode"] = chapter_plan["chapterCode"]
                branch["chapter_code"] = chapter_plan["chapterCode"]
                branch["modifiedAt"] = updated_at

    for branch_id in MOVE_TO_J333:
        branch = topic_map.get(branch_id)
        if not branch:
            continue
        branch["chapterCode"] = "j3-3-3"
        branch["chapter_code"] = "j3-3-3"
        branch["chapter"] = "因式分解"
        branch["section"] = "利用十字交乘因式分解"
        branch["domain"] = "代數"
        branch["domainSub"] = ""
        branch["modifiedAt"] = updated_at

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
    manifest["sourcePdf"] = str(SOURCE_PDF)
    append_manifest_entries(manifest, manifest_entries)

    save_json(FORMULA_DB, formula_payload)
    save_json(MAIN_TOPIC_DB, main_topic_payload)
    save_json(PDF_MANIFEST, manifest)
    print("Updated j3-3-1 ~ j3-3-2 main themes.")


if __name__ == "__main__":
    main()
