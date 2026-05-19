from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
MAIN_TOPIC_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
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
        "lines": [{"label": f"重點{idx}", "values": [row[0]]} for idx, row in enumerate(rows[:3], start=1)],
    }


def main() -> None:
    updated_at = now_iso()
    formula_db = load_json(FORMULA_DB)
    main_topic_db = load_json(MAIN_TOPIC_DB)
    overview_db = load_json(OVERVIEW_DB)
    topic_map = {topic["id"]: topic for topic in formula_db["topics"]}
    root = topic_map["s1-1-4-unit-exponent"]
    meta = {
        "stage": root.get("stage", "高中"),
        "grade": root.get("grade", "高一"),
        "term": root.get("term", "上學期"),
        "gradeLabel": root.get("gradeLabel", "高一上"),
        "chapter": "數與式",
        "section": "指數律",
        "domain": "代數",
        "domainSub": "",
        "chapterCode": "s1-1-4",
        "stageOrder": root.get("stageOrder", 1) or 1,
        "gradeOrder": root.get("gradeOrder", 1) or 1,
        "termOrder": root.get("termOrder", 1) or 1,
        "chapterOrder": root.get("chapterOrder", 0) or 0,
        "updatedAt": updated_at,
    }

    themes = [
        {
            "id": "s1-1-4-main-theme-exponent-definition-extension",
            "wrapperId": "s1-1-4-main-theme-exponent-definition-extension-branches",
            "topicNumber": 1,
            "title": "指數的定義與擴充",
            "summary": "整數指數的定義、零指數與負整數指數、有理數指數",
            "pdf": "s1-1-4-topic-1-exponent-definition-extension.pdf",
            "rows": [
                ["整數指數的定義", "正整數指數、零指數與負整數指數的基本意義。"],
                ["有理數指數", "把根式和分數指數互相轉換。"],
                ["實數指數與底數限制", "處理有理數或實數指數時，底數需滿足 \(a>0\)。"],
                ["定義判定", "先檢查式子在實數系中是否有意義。"],
            ],
            "reminder": "整數指數的定義、有理數指數、實數指數與底數限制、定義判定 等重點",
        },
        {
            "id": "s1-1-4-main-theme-exponent-laws",
            "wrapperId": "s1-1-4-main-theme-exponent-laws-branches",
            "topicNumber": 2,
            "title": "指數律",
            "summary": "同底數相乘與相除、次方的次方、乘積與分式的次方",
            "pdf": "s1-1-4-topic-2-exponent-laws.pdf",
            "rows": [
                ["同底數相乘與相除", "同底數時外乘內加、外除內減。"],
                ["次方的次方", "處理內外相乘前先確認底數條件。"],
                ["乘積與分式的次方", "把乘積或分式拆開後再整理。"],
                ["條件求值", "配合乘法公式與指數律做化簡。"],
            ],
            "reminder": "同底數相乘與相除、次方的次方、乘積與分式的次方、條件求值 等重點",
        },
        {
            "id": "s1-1-4-main-theme-exponential-equations-inequalities",
            "wrapperId": "s1-1-4-main-theme-exponential-equations-inequalities-branches",
            "topicNumber": 3,
            "title": "指數方程式與不等式",
            "summary": "同底數法、代換法、底數大於 1 與介於 0 和 1 之間的比較",
            "pdf": "s1-1-4-topic-3-exponential-equations-inequalities.pdf",
            "rows": [
                ["同底數法", "相同底數時，直接比較指數。"],
                ["代換法", "遇到 \(a^x\) 和 \(a^{2x}\) 時，可令 \(t=a^x\) 並注意 \(t>0\)。"],
                ["單調性判定", "底數大於 1 與介於 0 和 1 之間時，不等號方向不同。"],
                ["大小比較策略", "先化為相同底數或相同指數。"],
            ],
            "reminder": "同底數法、代換法、單調性判定、大小比較策略 等重點",
        },
        {
            "id": "s1-1-4-main-theme-exponent-applications",
            "wrapperId": "s1-1-4-main-theme-exponent-applications-branches",
            "topicNumber": 4,
            "title": "指數的應用",
            "summary": "單利與複利、生長與衰退模型、半衰期",
            "pdf": "s1-1-4-topic-4-exponent-applications.pdf",
            "rows": [
                ["單利與複利", "先分清楚利息是否滾入本金。"],
                ["生長與衰退模型", "固定倍率變化可用指數模型描述。"],
                ["半衰期", "看懂剩餘量與時間的關係。"],
                ["應用判讀", "先判斷是成長還是衰退，再選模型。"],
            ],
            "reminder": "單利與複利、生長與衰退模型、半衰期、應用判讀 等重點",
        },
    ]

    stale_formula_ids = {
        "s1-1-4-main-theme-exponent",
        "s1-1-4-main-theme-exponent-branches",
        "s1-1-4-main-theme-exponent-laws",
        "s1-1-4-main-theme-exponent-laws-branches",
        *(theme["id"] for theme in themes),
        *(theme["wrapperId"] for theme in themes),
    }
    formula_db["topics"] = [t for t in formula_db["topics"] if t["id"] not in stale_formula_ids]

    for theme in themes:
        formula_db["topics"].append(
            {
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
                "parentId": "s1-1-4-unit-exponent",
                "contentTypes": ["重點整理", "觀念", "公式與性質", "常見錯誤"],
                "tags": [meta["chapterCode"], "主題", theme["title"]],
                "usage": [theme["summary"]],
                "examples": [],
                "tips": [f"先看 {theme['title']} 的整理表，再往下看附掛分支。"],
                "notes": [f"這筆是 {meta['chapterCode']} 的主題整理。"],
                "mistakes": [],
                "contentTypesLocked": True,
                "mathNotationLocked": True,
                "modifiedAt": updated_at,
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
        )
        formula_db["topics"].append(
            {
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
                "modifiedAt": updated_at,
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
        )
        main_topic_db["byId"][theme["id"]] = {
            "id": theme["id"],
            "title": theme["title"],
            "updatedAt": updated_at,
            "variants": [
                {"id": "editable", "label": "可修改版", "sections": [{"type": "table", "headers": ["重點", "整理"], "rows": theme["rows"]}]},
                {"id": "original", "label": "原稿版", "sections": [{"type": "pdf-page", "src": f"data/main-theme-overviews/{theme['pdf']}", "note": theme["title"]}]},
            ],
            "chapter_code": "s1-1-4",
        }

    if "s1-1-4-main-theme-exponent" in main_topic_db["byId"]:
        del main_topic_db["byId"]["s1-1-4-main-theme-exponent"]

    overview_db["overviews"]["s1-1-4"]["updatedAt"] = updated_at
    overview_db["overviews"]["s1-1-4"]["variants"][0]["sections"][1]["rows"] = [[t["title"], "主題", t["reminder"]] for t in themes]
    overview_db["overviews"]["s1-1-4"]["variants"][1]["sections"][1]["rows"] = [[t["title"], "主題", t["reminder"]] for t in themes]

    save_json(FORMULA_DB, formula_db)
    save_json(MAIN_TOPIC_DB, main_topic_db)
    save_json(OVERVIEW_DB, overview_db)


if __name__ == "__main__":
    main()

