from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
QUESTION_DB = ROOT / "program-db" / "database" / "question-db.json"
CHAPTER_CODE_DB = ROOT / "program-db" / "database" / "chapter-code-db.json"
CHAPTER_OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
CHAPTER_OVERVIEW_BODY_DB = ROOT / "program-db" / "database" / "chapter-overview-body-db.json"
CHAPTER_CLOSING_DB = ROOT / "program-db" / "database" / "chapter-closing-db.json"
MAIN_TOPIC_OVERVIEW_DB = ROOT / "program-db" / "database" / "main-topic-overview-db.json"
TZ = timezone(timedelta(hours=8))

CHAPTER_CODE = "s1-1-2"
ROOT_ID = "s1-1-2-unit-absolute-value"
MAIN_THEME_ID = "s1-1-2-main-theme-absolute-value"
WRAPPER_ID = "s1-1-2-absolute-value-core"
BRANCH_IDS = [
    "absolute-value-definition-properties-high-school",
    "absolute-value-distance-view-high-school",
    "absolute-value-symbolic-simplification-high-school",
    "absolute-value-equation-inequality-high-school",
    "absolute-value-function-graph-high-school",
    "absolute-value-parameter-range-high-school",
]


def now_iso() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def set_topic_basics(topic: dict, updated_at: str) -> None:
    topic["chapter"] = "絕對值"
    topic["section"] = "絕對值"
    topic["chapter_code"] = CHAPTER_CODE
    topic["chapterCode"] = CHAPTER_CODE
    topic["modifiedAt"] = updated_at


def update_main_topic_overview(data: dict, updated_at: str) -> None:
    record = data["byId"][MAIN_THEME_ID]
    record["title"] = "絕對值"
    record["updatedAt"] = updated_at
    for variant in record.get("variants", []):
        if variant.get("id") != "editable":
            continue
        for section in variant.get("sections", []):
            if section.get("type") != "table":
                continue
            section["headers"] = ["分支", "學習重點"]
            section["rows"] = [
                [
                    "絕對值的定義與性質",
                    "先建立絕對值就是距離的直覺，再整理非負性、平方性質、乘除性質與三角不等式。",
                ],
                [
                    "距離觀點與反向表達",
                    "把數線區間、中點與半徑的語言翻成絕對值不等式，反向題也從距離模型切入。",
                ],
                [
                    "絕對值的符號化簡",
                    "學會先判斷絕對值內部正負，再做去絕對值與根號平方型的化簡。",
                ],
                [
                    "絕對值方程式與不等式",
                    "掌握標準型、分段討論與平方消絕對值的基本策略。",
                ],
                [
                    "絕對值函數圖形與最值",
                    "從折線圖形、折點與距離總和切入，連到最小值與有解判別。",
                ],
                [
                    "參數與反向問題",
                    "由解集反推中心、半徑與參數，整理區間與絕對值模型的互譯。 ",
                ],
            ]
            return


def update_chapter_overview(data: dict, updated_at: str) -> None:
    record = data["overviews"][CHAPTER_CODE]
    record["groupName"] = "高中・高一上・絕對值"
    record["updatedAt"] = updated_at
    editable_text = (
        "這章把絕對值整理成一條清楚的主題線：先從定義與基本性質出發，"
        "再接到數線上的距離觀點、代數化簡、方程與不等式、函數圖形與最值，"
        "最後收斂到參數與反向問題。學習時要一直抓住一個核心想法：絕對值代表距離，"
        "很多規則其實都是距離觀念的代數寫法。"
    )
    original_text = (
        "本章原稿重點集中在六個分支：定義與性質、距離觀點、符號化簡、"
        "方程與不等式、函數圖形與最值、參數與反向問題。"
    )
    for variant in record.get("variants", []):
        for section in variant.get("sections", []):
            if section.get("type") == "paragraph":
                section["text"] = editable_text if variant.get("id") == "editable" else original_text
            elif section.get("type") == "table":
                section["headers"] = ["主題", "層級", "說明"]
                section["rows"] = [[
                    "絕對值",
                    "主題",
                    "本章採一個主題、六個分支的資料結構，避免主題下再疊同名包裝層。",
                ]]


def update_chapter_overview_body(data: dict, updated_at: str) -> None:
    record = data["bodies"][CHAPTER_CODE]
    record["groupName"] = "高中・高一上・絕對值"
    record["updatedAt"] = updated_at
    for variant in record.get("variants", []):
        if variant.get("id") != "original":
            continue
        for section in variant.get("sections", []):
            if section.get("type") == "image":
                section["caption"] = "1-2 絕對值原稿截圖"


def update_chapter_closing(data: dict, updated_at: str) -> None:
    record = data["closings"][CHAPTER_CODE]
    record["groupName"] = "高中・高一上・絕對值"
    record["updatedAt"] = updated_at
    summary = (
        "學完這章後，學生應能把絕對值穩定地看成距離，而不是只背去絕對值的口訣。"
        "遇到方程、不等式、圖形與最值題時，要先判斷題目是在問距離、區間、折點還是參數。"
        "如果題目看起來很複雜，就回到數線或圖形，把中心、半徑與折點先找出來，再做代數整理。"
    )
    for variant in record.get("variants", []):
        for section in variant.get("sections", []):
            if section.get("type") == "paragraph":
                section["text"] = summary


def reorder_formula_topics(formula_db: dict, chapter_block: list[dict]) -> None:
    remove_ids = {ROOT_ID, WRAPPER_ID, MAIN_THEME_ID, *BRANCH_IDS}
    remaining = [topic for topic in formula_db["topics"] if str(topic.get("id", "")).strip() not in remove_ids]
    insert_at = next(
        (
            index
            for index, topic in enumerate(formula_db["topics"])
            if str(topic.get("chapterCode", "")).strip() == CHAPTER_CODE
        ),
        len(remaining),
    )
    formula_db["topics"] = remaining[:insert_at] + chapter_block + remaining[insert_at:]


def main() -> None:
    updated_at = now_iso()

    formula_db = load_json(FORMULA_DB)
    question_db = load_json(QUESTION_DB)
    chapter_code_db = load_json(CHAPTER_CODE_DB)
    chapter_overview_db = load_json(CHAPTER_OVERVIEW_DB)
    chapter_overview_body_db = load_json(CHAPTER_OVERVIEW_BODY_DB)
    chapter_closing_db = load_json(CHAPTER_CLOSING_DB)
    main_topic_overview_db = load_json(MAIN_TOPIC_OVERVIEW_DB)

    topics_by_id = {
        str(topic.get("id", "")).strip(): topic
        for topic in formula_db["topics"]
    }

    main_theme = topics_by_id[MAIN_THEME_ID]
    main_theme["title"] = "絕對值"
    main_theme["parentId"] = ""
    main_theme["chapterRole"] = "主題"
    main_theme["conceptRole"] = "主題"
    main_theme["formula"] = {
        "type": "labeled-lines",
        "lines": [
            {"label": "主軸", "values": [r"\text{從距離觀點統整絕對值的性質、化簡、方程不等式與圖形最值}"]},
            {"label": "學習路線", "values": [r"\text{定義與性質}\rightarrow\text{距離模型}\rightarrow\text{化簡}\rightarrow\text{方程不等式}\rightarrow\text{圖形最值}\rightarrow\text{參數反推}"]},
        ],
    }
    main_theme["usage"] = ["這一層只保留主題定位，實際教學內容往下分成六個分支展開。"]
    main_theme["examples"] = ["先確定題目屬於哪一類，再往對應分支看解題策略與易錯點。"]
    main_theme["tips"] = ["若學生對規則記不住，先回到『絕對值就是距離』這個核心概念。"]
    main_theme["notes"] = ["本章資料結構固定採一個主題加六個分支，不再額外保留同名包裝層。"]
    main_theme["mistakes"] = ["不要把章節名稱、主題名稱與分支名稱混成三層重複結構。"]
    main_theme["tags"] = ["s1-1-2", "主題", "絕對值"]
    main_theme["contentTypes"] = ["重點整理", "觀念主題", "分類導覽", "可修改摘要"]
    main_theme["contentTypesLocked"] = True
    main_theme["mathNotationLocked"] = True
    set_topic_basics(main_theme, updated_at)

    chapter_block = [main_theme]
    for branch_id in BRANCH_IDS:
        topic = topics_by_id[branch_id]
        topic["parentId"] = MAIN_THEME_ID
        topic["chapterRole"] = "分支題型"
        topic["conceptRole"] = "分支"
        set_topic_basics(topic, updated_at)
        chapter_block.append(topic)

    reorder_formula_topics(formula_db, chapter_block)
    formula_db["meta"]["updatedAt"] = updated_at

    question_records = question_db.get("questions", question_db)
    for question in question_records:
        if str(question.get("formula_id", "")).strip() == WRAPPER_ID:
            question["formula_id"] = "absolute-value-definition-properties-high-school"

    chapter_code_db["catalog"][CHAPTER_CODE]["section"] = "絕對值"
    chapter_code_db["meta"]["updatedAt"] = updated_at

    update_chapter_overview(chapter_overview_db, updated_at)
    chapter_overview_db["meta"]["updatedAt"] = updated_at

    update_chapter_overview_body(chapter_overview_body_db, updated_at)
    chapter_overview_body_db["meta"]["updatedAt"] = updated_at

    update_chapter_closing(chapter_closing_db, updated_at)
    chapter_closing_db["meta"]["updatedAt"] = updated_at

    update_main_topic_overview(main_topic_overview_db, updated_at)
    main_topic_overview_db["meta"]["updatedAt"] = updated_at

    save_json(FORMULA_DB, formula_db)
    save_json(QUESTION_DB, question_db)
    save_json(CHAPTER_CODE_DB, chapter_code_db)
    save_json(CHAPTER_OVERVIEW_DB, chapter_overview_db)
    save_json(CHAPTER_OVERVIEW_BODY_DB, chapter_overview_body_db)
    save_json(CHAPTER_CLOSING_DB, chapter_closing_db)
    save_json(MAIN_TOPIC_OVERVIEW_DB, main_topic_overview_db)

    print("Updated s1-1-2 to a true one-theme, six-branch data structure.")


if __name__ == "__main__":
    main()
