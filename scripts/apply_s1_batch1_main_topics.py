from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
UPDATED_AT = "2026-05-08T12:40:00+08:00"


CONFIG = {
    "s1-1-2": {
        "root_id": "s1-1-2-absolute-value-core",
        "themes": [
            {
                "id": "s1-1-2-main-theme-absolute-value",
                "title": "主要主題1：絕對值",
                "summary": "先抓絕對值的定義、距離觀點、圖形與方程不等式，再回頭整理參數題。",
                "branch_ids": [
                    "absolute-value-definition-properties-high-school",
                    "absolute-value-distance-view-high-school",
                    "absolute-value-symbolic-simplification-high-school",
                    "absolute-value-function-graph-high-school",
                    "absolute-value-parameter-range-high-school",
                    "absolute-value-equation-inequality-high-school",
                ],
            }
        ],
    },
    "s1-1-3": {
        "root_id": "senior-expression-operations",
        "themes": [
            {
                "id": "s1-1-3-main-theme-formula-radical",
                "title": "主要主題1：乘法公式、分式與根式的運算",
                "summary": "先分清乘法公式、分式化簡、根式運算與有理化，看到題目先判斷該用哪一類整理。",
                "branch_ids": [
                    "s1-1-3-algebraic-operations",
                    "senior-multiplication-identities-expansion-s113",
                    "senior-rational-expression-operations-s113",
                    "senior-radical-operations-rationalization-s113",
                    "senior-radical-estimation-comparison-s113",
                    "senior-formula-selection-flow",
                ],
            },
            {
                "id": "s1-1-3-main-theme-am-gm",
                "title": "主要主題2：算幾不等式",
                "summary": "先確認題目是否符合非負條件，再看是直接套公式還是要先配成兩項。",
                "branch_ids": [
                    "senior-arithmetic-geometric-mean-s113",
                ],
            },
        ],
    },
    "s1-1-4": {
        "root_id": "s1-1-4-exponent-rules",
        "themes": [
            {
                "id": "s1-1-4-main-theme-exponent-laws",
                "title": "主要主題1：指數律",
                "summary": "先熟同底數乘除、冪的冪、零次方與負指數，再接分數指數與同底化簡。",
                "branch_ids": [],
            }
        ],
    },
    "s1-1-5": {
        "root_id": "senior-logarithm-main-s322",
        "themes": [
            {
                "id": "s1-1-5-main-theme-common-log",
                "title": "主要主題1：常用對數",
                "summary": "先抓對數定義、常用對數與對數律，再整理換底與模型題的使用時機。",
                "branch_ids": [
                    "s1-1-5-logarithm-core",
                    "senior-logarithm-basic-facts-s322",
                    "senior-logarithm-laws-s322",
                    "senior-logarithm-change-base-s322",
                    "senior-logarithm-application-models-s322",
                    "senior-logarithm-power-swap-identity-s322",
                    "senior-logarithm-domain-and-evaluation-s322",
                    "senior-logarithm-word-problem-setup-s322",
                    "senior-logarithm-chain-cancellation-s322",
                    "senior-logarithm-inequality-strategy-s322",
                    "senior-logarithm-mixed-base-computation-s322",
                ],
            },
            {
                "id": "s1-1-5-main-theme-scientific-notation",
                "title": "主要主題2：科學記號",
                "summary": "把科學記號、位數估計、首位數判斷放在同一題型中看，題目才不會拆散。",
                "branch_ids": [
                    "senior-logarithm-scientific-notation-s322",
                    "senior-logarithm-digit-leading-estimation-s322",
                    "s1-1-5-scientific-notation-basics",
                    "s1-1-5-digit-leading-estimation",
                ],
            },
        ],
    },
}


def load_formula_db() -> dict:
    return json.loads(FORMULA_DB.read_text(encoding="utf-8"))


def save_formula_db(payload: dict) -> None:
    FORMULA_DB.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def find_topic(topics: list[dict], topic_id: str) -> dict | None:
    for topic in topics:
        if str(topic.get("id", "")).strip() == topic_id:
            return topic
    return None


def upsert_topic(topics: list[dict], topic: dict) -> None:
    for index, current in enumerate(topics):
        if str(current.get("id", "")).strip() == topic["id"]:
            topics[index] = {**current, **topic}
            return
    topics.append(topic)


def build_main_theme_topic(root: dict, chapter_code: str, spec: dict, order: int) -> dict:
    grade_label = root.get("gradeLabel") or "高一上"
    return {
        "id": spec["id"],
        "title": spec["title"],
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "定位", "values": [f"\\text{{{spec['title']}}}"]},
                {"label": "摘要", "values": [f"\\text{{{spec['summary']}}}"]},
            ],
        },
        "stage": root.get("stage", "高中"),
        "grade": root.get("grade", "高一"),
        "term": root.get("term", "上學期"),
        "chapter": root.get("chapter", ""),
        "domain": root.get("domain", ""),
        "difficulty": "基礎",
        "chapterRole": "主要主題",
        "conceptRole": "主題",
        "parentId": root["id"],
        "tags": [chapter_code, "主要主題", spec["title"]],
        "usage": [spec["summary"]],
        "examples": ["先看這一層主題整理，再往下展開原本的分支內容。"],
        "tips": ["如果題目太雜，先判斷它屬於哪個主要主題，再決定往哪組分支看。"],
        "notes": ["這一層是固定主軸，之後主題頁會優先掛在這裡。"],
        "mistakes": ["不要把章節根節點和主要主題當成同一層。"],
        "contentTypes": ["重點整理", "觀念主題", "分類導覽", "可修改摘要"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": UPDATED_AT,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": grade_label,
        "manualOrder": order,
    }


def apply() -> None:
    payload = load_formula_db()
    topics = payload.get("topics", [])

    for chapter_code, chapter_spec in CONFIG.items():
        root = find_topic(topics, chapter_spec["root_id"])
        if not root:
            continue

        root["chapterCode"] = chapter_code
        root["modifiedAt"] = UPDATED_AT

        for order, theme_spec in enumerate(chapter_spec["themes"], start=1):
            upsert_topic(topics, build_main_theme_topic(root, chapter_code, theme_spec, order))
            for branch_id in theme_spec["branch_ids"]:
                branch = find_topic(topics, branch_id)
                if not branch:
                    continue
                branch["parentId"] = theme_spec["id"]
                branch["chapterCode"] = chapter_code
                branch["modifiedAt"] = UPDATED_AT

    payload.setdefault("meta", {})["updatedAt"] = UPDATED_AT
    save_formula_db(payload)


if __name__ == "__main__":
    apply()
