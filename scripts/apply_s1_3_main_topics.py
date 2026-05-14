from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
UPDATED_AT = "2026-05-08T17:45:00+08:00"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def find_topic(topics: list[dict], topic_id: str) -> dict | None:
    for topic in topics:
        if str(topic.get("id", "")).strip() == topic_id:
            return topic
    return None


def upsert_topic(topics: list[dict], topic: dict) -> dict:
    for index, current in enumerate(topics):
        if str(current.get("id", "")).strip() == topic["id"]:
            merged = {**current, **topic}
            topics[index] = merged
            return merged
    topics.append(topic)
    return topic


def build_main_theme(root: dict, chapter_code: str, topic_id: str, title: str, summary: str, order: int) -> dict:
    return {
        "id": topic_id,
        "title": title,
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "定位", "values": [f"\\text{{{title}}}"]},
                {"label": "摘要", "values": [f"\\text{{{summary}}}"]},
            ],
        },
        "stage": root.get("stage", "高中"),
        "grade": root.get("grade", "高一"),
        "term": root.get("term", "上"),
        "chapter": root.get("chapter", ""),
        "domain": root.get("domain", ""),
        "difficulty": "基礎",
        "chapterRole": "主題",
        "conceptRole": "主題",
        "parentId": root["id"],
        "tags": [chapter_code, "主題", title],
        "usage": [summary],
        "examples": ["先看這個主題的可修改版，再往下展開對應分支。"],
        "tips": ["先分清楚這題是在考哪一個主題，再往下接對應分支。"],
        "notes": ["這一層是固定主軸，之後再把主題重點逐步拆成分支。"],
        "mistakes": ["不要把章節 root、主題和後面分支混成同一層。"],
        "contentTypes": ["重點整理", "章節導覽", "主題索引", "可修改版"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": UPDATED_AT,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": root.get("gradeLabel", "高一"),
        "manualOrder": order,
    }


def reparent_children(topics: list[dict], parent_id: str, child_ids: list[str]) -> None:
    for child_id in child_ids:
        topic = find_topic(topics, child_id)
        if topic:
            topic["parentId"] = parent_id
            topic["modifiedAt"] = UPDATED_AT


def update_formula_db() -> None:
    payload = load_json(FORMULA_DB)
    topics = payload.get("topics", [])

    # s1-3-1 already has main themes; just normalize metadata/order.
    root_131 = find_topic(topics, "senior-polynomial-function-overview-s131")
    if root_131:
        for order, topic_id in enumerate(
            [
                "s1-3-1-main-theme-basic",
                "s1-3-1-main-theme-arithmetic",
                "s1-3-1-main-theme-remainder",
            ],
            start=1,
        ):
            topic = find_topic(topics, topic_id)
            if topic:
                topic["parentId"] = root_131["id"]
                topic["chapterRole"] = "主題"
                topic["conceptRole"] = "主題"
                topic["manualOrder"] = order
                topic["modifiedAt"] = UPDATED_AT

    # s1-3-2 add four main themes and hang existing branches underneath.
    root_132 = find_topic(topics, "senior-polynomial-function-graphs-basic")
    if root_132:
        theme_specs_132 = [
            (
                "s1-3-2-main-theme-linear-function",
                "線型函數",
                "先看函數基本概念、直線圖形、斜率意義與基本判讀。",
            ),
            (
                "s1-3-2-main-theme-quadratic-function",
                "二次函數",
                "先抓開口、頂點、對稱軸與極值，再往下看圖形平移與條件判讀。",
            ),
            (
                "s1-3-2-main-theme-monomial-function",
                "單項函數",
                "把奇偶次、三次函數圖形、中心平移與端行為放在一起看。",
            ),
            (
                "s1-3-2-main-theme-polynomial-function-graph",
                "多項式函數圖形",
                "整理端行為、局部變化、參數型圖形與整體判讀節奏。",
            ),
        ]
        for order, (topic_id, title, summary) in enumerate(theme_specs_132, start=1):
            upsert_topic(topics, build_main_theme(root_132, "s1-3-2", topic_id, title, summary, order))

        reparent_children(
            topics,
            "s1-3-2-main-theme-linear-function",
            [
                "senior-function-concept-domain-range",
                "senior-linear-function-graph-meaning",
                "senior-function-vertical-line-test-s132",
            ],
        )
        reparent_children(
            topics,
            "s1-3-2-main-theme-quadratic-function",
            [
                "senior-quadratic-function-graph-core",
                "senior-quadratic-sign-conditions-s132",
                "senior-quadratic-extremum-three-point-decision-s132",
            ],
        )
        reparent_children(
            topics,
            "s1-3-2-main-theme-monomial-function",
            [
                "senior-cubic-function-graph-features",
                "senior-cubic-end-behavior-ratio-test-s132",
                "senior-cubic-center-shift-normal-form-s132",
                "senior-polynomial-function-even-odd-end-behavior-s132",
            ],
        )
        reparent_children(
            topics,
            "s1-3-2-main-theme-polynomial-function-graph",
            [
                "senior-polynomial-function-parameter-graph-reading-s132",
                "senior-polynomial-end-local-behavior",
            ],
        )

    # s1-3-3 add three main themes and hang existing branches underneath.
    root_133 = find_topic(topics, "senior-polynomial-inequality-main")
    if root_133:
        theme_specs_133 = [
            (
                "s1-3-3-main-theme-linear-inequality-solving",
                "一元一次不等式的解法",
                "先抓移項、反向、區間表示與邊界點納入判斷。",
            ),
            (
                "s1-3-3-main-theme-quadratic-inequality-solving",
                "二次不等式的解法",
                "先抓開口、根、判號區間，再整理恆正恆負與整體正負條件。",
            ),
            (
                "s1-3-3-main-theme-higher-order-inequality-solving",
                "高次不等式的解法",
                "整理數線判號表、重根奇偶、分式與根式不等式、參數分類。 ",
            ),
        ]
        for order, (topic_id, title, summary) in enumerate(theme_specs_133, start=1):
            upsert_topic(topics, build_main_theme(root_133, "s1-3-3", topic_id, title, summary.strip(), order))

        reparent_children(
            topics,
            "s1-3-3-main-theme-linear-inequality-solving",
            [
                "senior-polynomial-inequality-boundary-inclusion-s133",
            ],
        )
        reparent_children(
            topics,
            "s1-3-3-main-theme-quadratic-inequality-solving",
            [
                "senior-polynomial-inequality-linear-quadratic",
                "senior-polynomial-inequality-quadratic-sign-conditions",
                "senior-quadratic-global-sign-criteria-s133",
            ],
        )
        reparent_children(
            topics,
            "s1-3-3-main-theme-higher-order-inequality-solving",
            [
                "senior-rational-inequality-excluded-values-s133",
                "senior-polynomial-rational-radical-inequality",
                "senior-polynomial-inequality-parameter-cases-s133",
                "senior-polynomial-inequality-sign-chart-workflow-s133",
                "senior-polynomial-inequality-sign-chart-s133",
                "senior-polynomial-inequality-root-multiplicity-s133",
                "senior-polynomial-inequality-higher-order",
            ],
        )

    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = UPDATED_AT
    save_json(FORMULA_DB, payload)


def main() -> None:
    update_formula_db()
    print("Updated s1-3-1 ~ s1-3-3 main themes in formula-db.")


if __name__ == "__main__":
    main()
