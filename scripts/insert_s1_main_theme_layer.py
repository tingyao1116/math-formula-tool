import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
NOW = "2026-05-07T16:45:00+08:00"


MAIN_THEME_CONFIG = {
    "s1-1-1": {
        "root_id": "senior-real-number-overview",
        "themes": [
            {
                "id": "s1-1-1-main-theme-rational",
                "title": "主要主題1：有理數的定義與性質",
                "old_topic_id": "senior-rational-number-definition",
                "old_topic_title": "有理數的定義與性質",
                "summary": "整理有理數的定義、分類、有限小數與循環小數、化分數與稠密性。",
            },
            {
                "id": "s1-1-1-main-theme-irrational",
                "title": "主要主題2：無理數",
                "old_topic_id": "senior-irrational-number-basics",
                "old_topic_title": "無理數",
                "summary": "整理無理數判斷、根號觀念、封閉性陷阱與常見反證法。",
            },
            {
                "id": "s1-1-1-main-theme-real-line",
                "title": "主要主題3：實數與數線",
                "old_topic_id": "senior-real-line-interval-notation",
                "old_topic_title": "實數與數線",
                "summary": "整理數線、區間、大小比較、夾值與絕對值距離觀念。",
            },
            {
                "id": "s1-1-1-main-theme-distance",
                "title": "主要主題4：距離與分點公式",
                "old_topic_id": "senior-distance-midpoint-section-formulas",
                "old_topic_title": "距離與分點公式",
                "summary": "整理距離、中點、內分、外分與位置判斷。",
            },
        ],
        "extra_reparent": {
            "s1-1-1-real-number-core": "s1-1-1-main-theme-real-line",
        },
    },
    "s1-2-1": {
        "root_id": "senior-line-equation",
        "themes": [
            {
                "id": "s1-2-1-main-theme-coordinate",
                "title": "主要主題1：坐標系",
                "old_topic_id": "senior-coordinate-system-s121",
                "old_topic_title": "坐標系",
                "summary": "整理平面坐標、兩點距離、中點與分點的座標表達。",
            },
            {
                "id": "s1-2-1-main-theme-slope",
                "title": "主要主題2：直線斜率",
                "old_topic_id": "senior-line-slope-basics",
                "old_topic_title": "直線斜率",
                "summary": "整理斜率意義、方向判斷與兩點斜率公式。",
            },
            {
                "id": "s1-2-1-main-theme-line-form",
                "title": "主要主題3：直線方程式",
                "old_topic_id": "senior-line-equation-forms",
                "old_topic_title": "直線方程式",
                "summary": "整理點斜式、截距式、一般式、參數式與常見選式策略。",
            },
            {
                "id": "s1-2-1-main-theme-inequality",
                "title": "主要主題4：二元一次不等式",
                "old_topic_id": "senior-line-linear-inequality-half-plane",
                "old_topic_title": "二元一次不等式",
                "summary": "整理半平面判別、同側異側與符號判讀。",
            },
        ],
        "extra_reparent": {
            "s1-2-1-line-equations-core": "s1-2-1-main-theme-line-form",
            "senior-line-triangle-centers-guest": "s1-2-1-main-theme-line-form",
        },
    },
    "s1-3-1": {
        "root_id": "senior-polynomial-function-overview-s131",
        "themes": [
            {
                "id": "s1-3-1-main-theme-basic",
                "title": "主要主題1：多項式基本概念",
                "old_topic_id": "senior-polynomial-basic-concepts-s131",
                "old_topic_title": "多項式基本概念",
                "summary": "整理項、次數、係數與多項式的基礎語言。",
            },
            {
                "id": "s1-3-1-main-theme-arithmetic",
                "title": "主要主題2：多項式四則運算",
                "old_topic_id": "senior-polynomial-arithmetic-s131",
                "old_topic_title": "多項式四則運算",
                "summary": "整理多項式加減乘除與除法原理。",
            },
            {
                "id": "s1-3-1-main-theme-remainder",
                "title": "主要主題3：餘式定理與因式定理",
                "old_topic_id": "s1-3-1-polynomial-function-core",
                "old_topic_title": "餘式定理與因式定理",
                "summary": "整理餘式定理、因式定理與代值判斷。",
            },
        ],
        "extra_reparent": {},
    },
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def find_topic(topics, topic_id):
    for topic in topics:
        if str(topic.get("id", "")).strip() == topic_id:
            return topic
    return None


def build_theme_topic(*, chapter_code, root, theme_id, title, summary, order):
    grade_label = root.get("gradeLabel") or "高一上"
    return {
        "id": theme_id,
        "title": title,
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {
                    "label": "定位",
                    "values": [f"\\text{{{title}}}"],
                },
                {
                    "label": "摘要",
                    "values": [f"\\text{{{summary}}}"],
                },
            ],
        },
        "stage": root.get("stage", "高中"),
        "grade": root.get("grade", "高一"),
        "term": root.get("term", "上學期"),
        "chapter": root.get("chapter", ""),
        "domain": root.get("domain", ""),
        "difficulty": "基礎",
        "chapterRole": "主題",
        "parentId": root["id"],
        "tags": [chapter_code, "主要主題", title],
        "usage": [summary],
        "examples": ["這一層是固定主軸，用來承接後面的原有主題與分支。"],
        "tips": ["先看這層主要主題，再往下展開原本的主題與分支。"],
        "notes": ["這筆是新增的穩定主軸層，目的是固定章節中的主要教學路線。"],
        "mistakes": ["不要把這層主要主題和底下原本的主題混成同一層。"],
        "contentTypes": ["定義", "題型", "使用技巧", "注意事項"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": NOW,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": grade_label,
        "manualOrder": order,
    }


def upsert_topic(topics, topic):
    for index, current in enumerate(topics):
        if str(current.get("id", "")).strip() == topic["id"]:
            topics[index] = {**current, **topic}
            return
    topics.append(topic)


def apply_structure(formula_db, overview_db):
    topics = formula_db.get("topics", [])
    overviews = overview_db.get("overviews", {})

    for chapter_code, config in MAIN_THEME_CONFIG.items():
        root = find_topic(topics, config["root_id"])
        if not root:
            continue
        root["chapterCode"] = chapter_code
        root["modifiedAt"] = NOW

        for order, theme in enumerate(config["themes"], start=1):
            theme_topic = build_theme_topic(
                chapter_code=chapter_code,
                root=root,
                theme_id=theme["id"],
                title=theme["title"],
                summary=theme["summary"],
                order=order,
            )
            upsert_topic(topics, theme_topic)

            old_topic = find_topic(topics, theme["old_topic_id"])
            if old_topic:
                old_topic["title"] = theme["old_topic_title"]
                old_topic["parentId"] = theme["id"]
                old_topic["chapterCode"] = chapter_code
                old_topic["modifiedAt"] = NOW

        for topic_id, parent_id in config.get("extra_reparent", {}).items():
            topic = find_topic(topics, topic_id)
            if topic:
                topic["parentId"] = parent_id
                topic["chapterCode"] = chapter_code
                topic["modifiedAt"] = NOW

        entry = overviews.get(chapter_code)
        if entry:
            for variant in entry.get("variants", []):
                for section in variant.get("sections", []):
                    if section.get("type") != "table":
                        continue
                    rows = []
                    for order, theme in enumerate(config["themes"], start=1):
                        rows.append([theme["title"], "主要主題", theme["summary"]])
                    section["rows"] = rows

    formula_db.setdefault("meta", {})["updatedAt"] = NOW
    overview_db.setdefault("meta", {})["updatedAt"] = NOW


def main():
    formula_db = load_json(FORMULA_DB)
    overview_db = load_json(OVERVIEW_DB)
    apply_structure(formula_db, overview_db)
    save_json(FORMULA_DB, formula_db)
    save_json(OVERVIEW_DB, overview_db)


if __name__ == "__main__":
    main()
