from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
CHAPTER_CODE_DB = ROOT / "program-db" / "database" / "chapter-code-db.json"
MANIFEST = ROOT / "exports" / "main-theme-overviews" / "first-volume-topic-pdfs.json"
PDF_DIR = ROOT / "exports" / "main-theme-overviews"
DOWNLOADS = Path(r"C:\Users\user\Downloads")
TZ = timezone(timedelta(hours=8))


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def find_download(name_options: list[str]) -> Path:
    names = {p.name: p for p in DOWNLOADS.iterdir()}
    for name in name_options:
        if name in names:
            return names[name]
    raise FileNotFoundError(", ".join(name_options))


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
        "lines": [{"label": f"重點{idx}", "values": [row[0]]} for idx, row in enumerate(rows[:3], start=1)],
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


def build_main_theme(meta: dict, theme: dict, parent_id: str) -> dict:
    return {
        "id": theme["id"],
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
        "parentId": parent_id,
        "contentTypes": ["重點整理", "觀念", "公式與性質", "常見錯誤"],
        "tags": [meta["chapterCode"], "主題", theme["title"]],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": [f"先看 {theme['title']} 的整理表，再往下看附掛分支。"],
        "notes": [f"這筆是 {meta['chapterCode']} 的主題整理。"],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "chapterCode": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": theme["topicNumber"],
        "orderIndex": theme["topicNumber"],
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "isBranch": False,
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
        "parentId": theme["id"],
        "contentTypes": ["分支", "重點整理", "觀念", "公式與性質", "常見錯誤", "無限練習"],
        "tags": [meta["chapterCode"], theme["title"], "分支整理"],
        "usage": [theme["summary"]],
        "examples": [],
        "tips": [f"這一層整理 {theme['title']} 對應的分支。"],
        "notes": [],
        "mistakes": [],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": meta["updatedAt"],
        "chapter_code": meta["chapterCode"],
        "chapterCode": meta["chapterCode"],
        "gradeLabel": meta["gradeLabel"],
        "relatedChapters": [],
        "relatedTopicIds": [],
        "manualOrder": theme["topicNumber"] * 100,
        "orderIndex": theme["topicNumber"] * 100,
        "stageOrder": meta["stageOrder"],
        "gradeOrder": meta["gradeOrder"],
        "termOrder": meta["termOrder"],
        "chapterOrder": meta["chapterOrder"],
        "isBranch": False,
    }


def build_variants(theme: dict) -> list[dict]:
    variants = [
        {
            "id": "editable",
            "label": "可修改版",
            "sections": [{"type": "table", "headers": ["重點", "整理"], "rows": theme["rows"]}],
        }
    ]
    if theme.get("pdf"):
        variants.append(
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {"type": "pdf-page", "src": f"data/main-theme-overviews/{theme['pdf']}", "note": theme["title"]}
                ],
            }
        )
    return variants


def derive_meta(root_topic: dict, chapter_catalog: dict, chapter_code: str, updated_at: str) -> dict:
    catalog = chapter_catalog[chapter_code]
    return {
        "stage": root_topic.get("stage", "高中"),
        "grade": root_topic.get("grade", "高一"),
        "term": root_topic.get("term", "上學期"),
        "gradeLabel": root_topic.get("gradeLabel", "高一上"),
        "chapter": catalog["chapter"],
        "section": catalog["section"],
        "domain": catalog["domainMain"],
        "domainSub": catalog.get("domainSub", "") or "",
        "chapterCode": chapter_code,
        "stageOrder": root_topic.get("stageOrder", 1) or 1,
        "gradeOrder": root_topic.get("gradeOrder", 1) or 1,
        "termOrder": root_topic.get("termOrder", 1) or 1,
        "chapterOrder": root_topic.get("chapterOrder", 0) or 0,
        "updatedAt": updated_at,
    }


def export_pdf_pages(reader: PdfReader, page_start: int, page_end: int, destination: Path) -> None:
    writer = PdfWriter()
    for page_number in range(page_start - 1, page_end):
        writer.add_page(reader.pages[page_number])
    with destination.open("wb") as fh:
        writer.write(fh)


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    overview_db = load_json(OVERVIEW_DB)
    chapter_code_db = load_json(CHAPTER_CODE_DB)
    manifest = load_json(MANIFEST)
    topic_map = {topic["id"]: topic for topic in formula_db["topics"]}

    exponent_pdf = find_download(["高中數學：指數定義、運算法則與應用指南.pdf"])
    exponent_reader = PdfReader(str(exponent_pdf))
    _combined_md = find_download(["高中數學：指數與對數運算指南 (1).md", "高中數學：指數與對數運算指南.md"])

    meta_14 = derive_meta(topic_map["s1-1-4-unit-exponent"], chapter_code_db["catalog"], "s1-1-4", updated_at)
    meta_15 = derive_meta(topic_map["s1-1-5-unit-logarithm"], chapter_code_db["catalog"], "s1-1-5", updated_at)

    s114_themes = [
        {
            "id": "s1-1-4-main-theme-exponent-definition-extension",
            "wrapperId": "s1-1-4-main-theme-exponent-definition-extension-branches",
            "topicNumber": 1,
            "title": "指數的定義與擴充",
            "summary": "整數指數的定義、零指數與負整數指數、有理數指數",
            "pdf": "s1-1-4-topic-1-exponent-definition-extension.pdf",
            "pageStart": 2,
            "pageEnd": 2,
            "rows": [
                ["整數指數的定義", "正整數指數的 \(a^n\) 表示 \(n\) 個 \(a\) 連乘；\(a^0=1\)；\(a^{-n}=\\frac{1}{a^n}\)。"],
                ["有理數指數", "\(a^{\\frac{1}{n}}=\\sqrt[n]{a}\)，\(a^{\\frac{m}{n}}=\\sqrt[n]{a^m}=(\\sqrt[n]{a})^m\)。"],
                ["實數指數與底數限制", "討論有理數或實數指數時，底數需滿足 \(a>0\) 才能確保運算結果唯一且為實數。"],
                ["定義判定", "像 \(0^{-2}\) 無意義；處理負底數的分數指數時，要先判斷在實數系中是否有定義。"],
            ],
            "oldIds": [],
            "reminder": "整數指數的定義、有理數指數、實數指數與底數限制、定義判定 等重點",
        },
        {
            "id": "s1-1-4-main-theme-exponent-laws",
            "wrapperId": "s1-1-4-main-theme-exponent-laws-branches",
            "topicNumber": 2,
            "title": "指數律",
            "summary": "同底數相乘與相除、次方的次方、乘積與分式的次方",
            "pdf": "s1-1-4-topic-2-exponent-laws.pdf",
            "pageStart": 3,
            "pageEnd": 3,
            "rows": [
                ["同底數相乘與相除", "\(a^r\\cdot a^s=a^{r+s}\)，\\(\\frac{a^r}{a^s}=a^{r-s}\\)。"],
                ["次方的次方", "\((a^r)^s=a^{rs}\)，處理內外指數時要先看底數是否允許這樣運算。"],
                ["乘積與分式的次方", "\((ab)^r=a^r\\cdot b^r\)，\\(\\left(\\frac{a}{b}\\right)^r=\\frac{a^r}{b^r}\\)。"],
                ["條件求值", "已知 \(a^{2x}\) 或 \(a^x+a^{-x}\) 的值時，可配合指數律和乘法公式化簡。"],
            ],
            "oldIds": ["s1-1-4-exponent-rules"],
            "reminder": "同底數相乘與相除、次方的次方、乘積與分式的次方、條件求值 等重點",
        },
        {
            "id": "s1-1-4-main-theme-exponential-equations-inequalities",
            "wrapperId": "s1-1-4-main-theme-exponential-equations-inequalities-branches",
            "topicNumber": 3,
            "title": "指數方程式與不等式",
            "summary": "同底數法、代換法、底數大於 1 與介於 0 和 1 之間的比較",
            "pdf": "s1-1-4-topic-3-exponential-equations-inequalities.pdf",
            "pageStart": 4,
            "pageEnd": 4,
            "rows": [
                ["同底數法", "若 \(a^x=a^y\) 且 \(a>0, a\\neq 1\)，則可直接推出 \(x=y\)。"],
                ["代換法", "遇到 \(a^x\) 與 \(a^{2x}\) 時，可令 \(t=a^x\) 並注意 \(t>0\)。"],
                ["單調性判定", "當 \(a>1\) 時函數遞增；當 \(0<a<1\) 時函數遞減，不等號方向要反向。"],
                ["大小比較策略", "先化成相同底數或相同指數，再用單調性判斷大小與範圍。"],
            ],
            "oldIds": [],
            "reminder": "同底數法、代換法、單調性判定、大小比較策略 等重點",
        },
        {
            "id": "s1-1-4-main-theme-exponent-applications",
            "wrapperId": "s1-1-4-main-theme-exponent-applications-branches",
            "topicNumber": 4,
            "title": "指數的應用",
            "summary": "單利與複利、生長與衰退模型、半衰期",
            "pdf": "s1-1-4-topic-4-exponent-applications.pdf",
            "pageStart": 5,
            "pageEnd": 5,
            "rows": [
                ["單利與複利", "單利本利和 \(S=P(1+rt)\)，複利本利和 \(S=P(1+r)^t\)。"],
                ["生長與衰退模型", "數量以固定倍率成長或衰退時，可用指數模型描述長期變化。"],
                ["半衰期", "\(M(t)=M_0\\left(\\frac{1}{2}\\right)^{\\frac{t}{h}}\)，重點是看懂剩餘量與時間的關係。"],
                ["應用判讀", "看到複利、藥物殘留、人口成長等情境，先判斷是生長還是衰退，再選模型。"],
            ],
            "oldIds": [],
            "reminder": "單利與複利、生長與衰退模型、半衰期、應用判讀 等重點",
        },
    ]

    s115_themes = [
        {
            "id": "s1-1-5-main-theme-common-log",
            "wrapperId": "s1-1-5-main-theme-common-log-branches",
            "topicNumber": 1,
            "title": "常用對數",
            "summary": "對數的定義與限制、對數律、換底公式",
            "pdf": "s1-1-5-topic-1-common-logarithm.pdf",
            "rows": [
                ["對數的定義與限制", "當 \(a>0, a\\neq 1, b>0\) 時，\(a^x=b \\iff x=\\log_a b\)；真數必須大於 0。"],
                ["常用對數", "以 10 為底的對數記作 \(\\log x\)，處理大數與小數時特別常用。"],
                ["對數律", "\(\\log(rs)=\\log r+\\log s\)，\(\\log\\left(\\frac{r}{s}\\right)=\\log r-\\log s\)，\(\\log r^k=k\\log r\)。"],
                ["換底公式", "\(\\log_a b=\\frac{\\log_c b}{\\log_c a}\)，在改換底數時特別重要。"],
            ],
            "reminder": "對數的定義與限制、常用對數、對數律、換底公式 等重點",
        },
        {
            "id": "s1-1-5-main-theme-scientific-notation",
            "wrapperId": "s1-1-5-main-theme-scientific-notation-branches",
            "topicNumber": 2,
            "title": "科學記號",
            "summary": "科學記號、首數與尾數、位數與首位數估計",
            "pdf": "s1-1-5-topic-2-scientific-notation.pdf",
            "rows": [
                ["科學記號與首尾數", "將 \(x\) 寫成 \(x=b\\times 10^n\) 後，\(\\log x=n+\\log b\)，其中首數是整數、尾數滿足 \(0\\le \\log b<1\)。"],
                ["位數判定", "若首數 \(n\\ge 0\)，則 \(x\) 是 \(n+1\) 位數；若 \(n<0\)，可判斷小數點後第幾位開始出現非 0。"],
                ["首位數估計", "利用 \(\\log 2\\approx 0.3010\\)、\(\\log 3\\approx 0.4771\) 等尾數範圍估計最高位數字。"],
                ["素養應用", "地震規模、分貝與 \(pH\) 等模型，本質都是對數與科學記號的綜合判讀。"],
            ],
            "reminder": "科學記號與首尾數、位數判定、首位數估計、素養應用 等重點",
        },
    ]

    # remove / rebuild s1-1-4 themes
    remove_ids = {
        "s1-1-4-main-theme-exponent-laws",
        "s1-1-4-main-theme-exponent-laws-branches",
    }
    remove_ids.update(theme["id"] for theme in s114_themes)
    remove_ids.update(theme["wrapperId"] for theme in s114_themes)
    formula_db["topics"] = [t for t in formula_db["topics"] if t["id"] not in remove_ids]

    for theme in s114_themes:
        formula_db["topics"].append(build_main_theme(meta_14, theme, "s1-1-4-unit-exponent"))
        formula_db["topics"].append(build_wrapper(meta_14, theme))
        for old_id in theme["oldIds"]:
            if old_id in topic_map:
                retarget(topic_map[old_id], meta_14, theme["wrapperId"])
        main_topic_db["byId"][theme["id"]] = {
            "id": theme["id"],
            "title": theme["title"],
            "updatedAt": updated_at,
            "variants": build_variants(theme),
        }
        export_pdf_pages(exponent_reader, theme["pageStart"], theme["pageEnd"], PDF_DIR / theme["pdf"])

    # update s1-1-5 themes in place
    for theme in s115_themes:
        if theme["id"] in topic_map:
            topic_map[theme["id"]]["title"] = theme["title"]
            topic_map[theme["id"]]["formula"] = make_formula_lines(theme["title"], theme["summary"])
            topic_map[theme["id"]]["usage"] = [theme["summary"]]
            topic_map[theme["id"]]["tips"] = [f"先看 {theme['title']} 的整理表，再往下看附掛分支。"]
            topic_map[theme["id"]]["modifiedAt"] = updated_at
        wrapper_id = theme["wrapperId"]
        if wrapper_id in topic_map:
            topic_map[wrapper_id]["title"] = theme["title"]
            topic_map[wrapper_id]["formula"] = make_core_formula_lines(theme["rows"])
            topic_map[wrapper_id]["usage"] = [theme["summary"]]
            topic_map[wrapper_id]["modifiedAt"] = updated_at
        main_topic_db["byId"][theme["id"]] = {
            "id": theme["id"],
            "title": theme["title"],
            "updatedAt": updated_at,
            "variants": build_variants(theme),
        }

    overview_db["overviews"]["s1-1-4"] = {
        "groupName": "高中・高一上・指數律",
        "title": "章節重點大綱",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "這一章現在改成四個主題：先理解指數的定義與擴充，再熟練指數律，接著處理指數方程式與不等式，最後回到複利、半衰期等應用模型。看到題目時，先分清楚它是在考定義、運算、解方程式，還是情境模型。",
                    },
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": [[theme["title"], "主題", theme["reminder"]] for theme in s114_themes],
                    },
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "這一章的原稿版也依照新的四個主題拆開，先對照主題，再往下看分支。",
                    },
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": [[theme["title"], "主題", theme["reminder"]] for theme in s114_themes],
                    },
                ],
            },
        ],
    }

    overview_db["overviews"]["s1-1-5"] = {
        "groupName": "高中・高一上・常用對數",
        "title": "章節重點大綱",
        "updatedAt": updated_at,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "這一章以兩個主題整理：先掌握常用對數的定義、限制與對數律，再利用科學記號、首數與尾數去處理位數和首位數估計。看到題目時，要先分清楚它是在考對數運算，還是考科學記號與位值判讀。",
                    },
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": [[theme["title"], "主題", theme["reminder"]] for theme in s115_themes],
                    },
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {
                        "type": "paragraph",
                        "text": "這一章的原稿版沿用目前既有 PDF，先對照主題，再往下看分支。",
                    },
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": [[theme["title"], "主題", theme["reminder"]] for theme in s115_themes],
                    },
                ],
            },
        ],
    }

    manifest_topics = [
        topic
        for topic in manifest["topics"]
        if topic.get("chapterCode") not in {"s1-1-4", "s1-1-5"}
    ]
    manifest_topics.extend(
        {
            "chapterCode": "s1-1-4",
            "topicNumber": theme["topicNumber"],
            "slug": theme["id"].split("main-theme-")[1],
            "title": theme["title"],
            "page": theme["pageStart"],
            "file": theme["pdf"],
        }
        for theme in s114_themes
    )
    manifest_topics.extend(
        {
            "chapterCode": "s1-1-5",
            "topicNumber": theme["topicNumber"],
            "slug": "common-logarithm" if theme["topicNumber"] == 1 else "scientific-notation",
            "title": theme["title"],
            "page": 14 if theme["topicNumber"] == 1 else 15,
            "file": theme["pdf"],
        }
        for theme in s115_themes
    )
    manifest["topics"] = sorted(manifest_topics, key=lambda item: (item["chapterCode"], item["topicNumber"]))

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(OVERVIEW_DB, overview_db)
    save_json(MANIFEST, manifest)


if __name__ == "__main__":
    main()

