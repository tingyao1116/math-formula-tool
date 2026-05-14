from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
OVERVIEW_DB = ROOT / "program-db" / "database" / "chapter-overview-db.json"
UPDATED_AT = "2026-05-08T16:35:00+08:00"


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
        "term": root.get("term", "上學期"),
        "chapter": root.get("chapter", ""),
        "domain": root.get("domain", ""),
        "difficulty": "基礎",
        "chapterRole": "主題",
        "conceptRole": "主題",
        "parentId": root["id"],
        "tags": [chapter_code, "主題", title],
        "usage": [summary],
        "examples": ["先看這個主題整理，再往下展開分支。"],
        "tips": ["題目太雜時，先判斷它屬於哪個主題，再往下找對應分支。"],
        "notes": ["這一層是固定主軸，之後主題頁會優先掛在這裡。"],
        "mistakes": ["不要把章節根節點和主題層混成同一層。"],
        "contentTypes": ["重點整理", "觀念主題", "分類導覽", "可修改摘要"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": UPDATED_AT,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": root.get("gradeLabel", "高一上"),
        "manualOrder": order,
    }


def build_point_relation_branch(root: dict) -> dict:
    return {
        "id": "s1-2-3-circle-point-relation-core",
        "title": "圓與點之關係",
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "判別", "values": ["$d<r,\\ d=r,\\ d>r$"]},
            ],
        },
        "stage": root.get("stage", "高中"),
        "grade": root.get("grade", "高一"),
        "term": root.get("term", "上學期"),
        "chapter": root.get("chapter", ""),
        "domain": root.get("domain", ""),
        "difficulty": "基礎",
        "chapterRole": "分支",
        "conceptRole": "核心概念",
        "parentId": "s1-2-3-main-theme-circle-point-relation",
        "tags": ["s1-2-3", "圓與點", "位置關係"],
        "usage": ["先算點到圓心距離，再和半徑比較。"],
        "examples": ["點在圓內、圓上、圓外三種情況都由 d 和 r 的大小關係決定。"],
        "tips": ["很多題目直接比較 d^2 和 r^2 就夠了，不一定要開根號。"],
        "notes": ["這一筆是主題下的入口分支，方便後續再往下補題型。"],
        "mistakes": ["不要把距離和距離平方混在同一步比較。"],
        "contentTypes": ["核心概念", "判別流程", "易錯提醒"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": UPDATED_AT,
        "chapter_code": "s1-2-3",
        "chapterCode": "s1-2-3",
        "gradeLabel": root.get("gradeLabel", "高一上"),
    }


def build_overview_entry(group_name: str, editable_text: str, editable_rows: list[list[str]], original_intro: str, original_rows: list[list[str]]) -> dict:
    return {
        "groupName": group_name,
        "title": "章節重點大綱",
        "updatedAt": UPDATED_AT,
        "variants": [
            {
                "id": "editable",
                "label": "可修改版",
                "sections": [
                    {"type": "paragraph", "text": editable_text},
                    {
                        "type": "table",
                        "headers": ["主題", "角色", "下一層 / 提醒"],
                        "rows": editable_rows,
                    },
                ],
            },
            {
                "id": "original",
                "label": "原稿版",
                "sections": [
                    {"type": "paragraph", "text": original_intro},
                    {
                        "type": "table",
                        "headers": ["Word 主題", "定位", "內容焦點"],
                        "rows": original_rows,
                    },
                ],
            },
        ],
    }


def update_formula_db() -> None:
    payload = load_json(FORMULA_DB)
    topics = payload.get("topics", [])

    # s1-2-1: ensure the chapter root only holds the four main themes plus the guide node structure already in place.
    root_121 = find_topic(topics, "senior-line-equation")
    if root_121:
        root_121["modifiedAt"] = UPDATED_AT
        for order, topic_id in enumerate(
            [
                "s1-2-1-main-theme-coordinate",
                "s1-2-1-main-theme-slope",
                "s1-2-1-main-theme-line-form",
                "s1-2-1-main-theme-inequality",
            ],
            start=1,
        ):
            topic = find_topic(topics, topic_id)
            if topic:
                topic["parentId"] = root_121["id"]
                topic["chapterRole"] = "主題"
                topic["manualOrder"] = order
                topic["modifiedAt"] = UPDATED_AT

    # s1-2-2: add one main theme below the chapter root.
    root_122 = find_topic(topics, "senior-circle-equation")
    if root_122:
        root_122["modifiedAt"] = UPDATED_AT
        theme_122 = upsert_topic(
            topics,
            build_main_theme(
                root_122,
                "s1-2-2",
                "s1-2-2-main-theme-circle-equation",
                "圓的方程式",
                "先抓圓心、半徑、標準式與一般式，再往下接半圓、特殊軌跡與圓系。",
                1,
            ),
        )
        core_122 = find_topic(topics, "s1-2-2-circle-equation-core")
        if core_122:
            core_122["parentId"] = theme_122["id"]
            core_122["modifiedAt"] = UPDATED_AT
        for topic in topics:
            if str(topic.get("chapterCode", "")).strip() != "s1-2-2":
                continue
            if topic["id"] in {root_122["id"], theme_122["id"], "s1-2-2-circle-equation-core"}:
                continue
            if str(topic.get("parentId", "")).strip() == root_122["id"]:
                topic["parentId"] = theme_122["id"]
                topic["modifiedAt"] = UPDATED_AT

    # s1-2-3: add four main themes and re-hang direct branches.
    root_123 = find_topic(topics, "senior-circle-line-relation")
    if root_123:
        root_123["modifiedAt"] = UPDATED_AT
        theme_specs = [
            ("s1-2-3-main-theme-circle-point-relation", "圓與點之關係", "先比較點到圓心距離和半徑，再決定點在圓內、圓上還是圓外。"),
            ("s1-2-3-main-theme-circle-line-relation", "圓與直線的關係", "先判斷相交、相切、相離，再往下接距離法、判別式與弦長。"),
            ("s1-2-3-main-theme-circle-tangent", "圓之切線", "把切線垂直半徑、外點作切線與切線方程放在同一主題中看。"),
            ("s1-2-3-main-theme-circle-family", "圓系", "先抓共同交點、根軸與參數式，再往下整理圓系建立流程。"),
        ]
        for order, (topic_id, title, summary) in enumerate(theme_specs, start=1):
            upsert_topic(topics, build_main_theme(root_123, "s1-2-3", topic_id, title, summary, order))

        upsert_topic(topics, build_point_relation_branch(root_123))

        reparent_map = {
            "s1-2-3-main-theme-circle-line-relation": [
                "senior-circle-line-three-cases",
                "senior-circle-line-distance-discriminant-s123",
                "senior-circle-line-relation-workflow-s123",
                "s1-2-3-line-circle-relation-core",
            ],
            "s1-2-3-main-theme-circle-tangent": [
                "senior-circle-tangent-formulas",
                "senior-circle-tangent-from-external-point",
                "senior-circle-tangent-at-point-formula-s123",
                "senior-circle-tangent-construction-two-methods-s123",
                "senior-circle-chord-of-contact-equation-s123",
                "senior-circle-chord-tangent-power-s123",
            ],
            "s1-2-3-main-theme-circle-family": [
                "senior-circle-family-and-radical-axis-advanced",
                "senior-circle-pencil-through-intersections-s123",
            ],
        }
        for parent_id, child_ids in reparent_map.items():
            for child_id in child_ids:
                topic = find_topic(topics, child_id)
                if topic:
                    topic["parentId"] = parent_id
                    topic["modifiedAt"] = UPDATED_AT

    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = UPDATED_AT
    save_json(FORMULA_DB, payload)


def update_overview_db() -> None:
    payload = load_json(OVERVIEW_DB)
    overviews = payload.setdefault("overviews", {})

    overviews["s1-2-1"] = build_overview_entry(
        "高中・高一上・直線方程式",
        "1. 這章正式改以四個主題當主軸：坐標系、直線斜率、直線方程式、二元一次不等式。\n\n2. 看到題目時，先分清楚它是在考位置與距離、斜率、方程式表示法，還是半平面判斷；這樣選公式會穩很多。\n\n3. 這章建議先從直線方程式這個章級主軸進來，再依序展開四個主題；原本的「直線方程式與斜率」保留為導覽節點。\n\n4. 這章最容易錯的是把斜率分母寫反、距離公式漏絕對值，或把不等式邊界線和塗色側看反。",
        [
            ["坐標系", "主題", "點、距離、中點、內分、外分先在這裡建立"],
            ["直線斜率", "主題", "斜率定義、方向判斷、平行垂直先抓穩"],
            ["直線方程式", "主題", "點斜式、截距式、一般式、參數式與距離公式"],
            ["二元一次不等式", "主題", "半平面判別、測試點法、同側異側"],
            ["直線方程式與斜率", "教學補充", "保留為導覽節點，先抓整章讀題方向"],
        ],
        "坐標幾何的核心是把圖形和代數式連起來看。公式很多，但都圍繞著距離、斜率與位置關係。",
        [
            ["坐標系", "正式主題", "點、距離、中點、分點與位置關係"],
            ["直線斜率", "正式主題", "斜率定義、平行垂直、讀圖方向"],
            ["直線方程式", "正式主題", "多種表示法、距離、對稱與角平分線"],
            ["二元一次不等式", "正式主題", "邊界線、半平面、同側異側與交集"],
        ],
    )

    overviews["s1-2-2"] = build_overview_entry(
        "高中・高一上・圓的方程式",
        "1. 這章先抓圓心和半徑，很多題目都只是把條件翻成圓心、半徑，再回到圓的方程式。\n\n2. 看到題目時，先分清楚它是在考標準式、一般式、條件列式，還是半圓、特殊軌跡與圓系，不要全部混著算。\n\n3. 這章目前主軸集中成一個主題：圓的方程式；底下再往下掛圓內外判別、一般式互換、半圓、Apollonius 圓與根軸。\n\n4. 這章最容易錯的是配方少一項、圓心半徑抄錯號，或把圓系和根軸的用途搞混。",
        [
            ["圓的方程式", "主題", "標準式與一般式\n由條件列方程\n半圓與特殊軌跡\n圓系與根軸"],
            ["圓的方程式與幾何參數", "教學補充", "保留為核心概念節點，先抓圓心與半徑觀念"],
        ],
        "圓的題目雖然公式不少，但骨架很單純：圓心、半徑、以及點到圓心的距離。",
        [
            ["圓的方程式", "正式主題", "標準式、一般式、半圓、特殊軌跡與圓系"],
        ],
    )

    overviews["s1-2-3"] = build_overview_entry(
        "高中・高一上・直線與圓的關係",
        "1. 這章改成四個主題來看：圓與點之關係、圓與直線的關係、圓之切線、圓系。\n\n2. 看到題目時，先分清楚它是在比距離和半徑、判斷交點個數、求切線，還是在做根軸與圓系；不要一開始就把所有式子一起展開。\n\n3. 這章建議先從『比距離和半徑』這條主線抓起，再往下接切線和圓系，整體會順很多。\n\n4. 這章最容易錯的是把相交、相切、相離判別條件看反，或把切線垂直半徑、根軸等性質漏掉。",
        [
            ["圓與點之關係", "主題", "先用點到圓心距離和半徑比較位置"],
            ["圓與直線的關係", "主題", "相交、相切、相離判別\n距離法與判別式"],
            ["圓之切線", "主題", "切線垂直半徑\n已知切點\n外點作切線"],
            ["圓系", "主題", "共同交點\n根軸\n參數式整理"],
            ["直線與圓的位置關係", "教學補充", "保留為典型題型節點，方便串接舊分支"],
        ],
        "這章最穩的讀法就是反覆比較距離和半徑，再把切線、根軸都視為距離觀點的延伸。",
        [
            ["圓與點之關係", "正式主題", "圓內、圓上、圓外判別與平方比較"],
            ["圓與直線的關係", "正式主題", "距離法、判別式、交點個數與弦"],
            ["圓之切線", "正式主題", "切線條件、切線方程與外點作切線"],
            ["圓系", "正式主題", "根軸、共同交點與圓系建立法"],
        ],
    )

    payload.setdefault("meta", {})
    payload["meta"]["updatedAt"] = UPDATED_AT
    save_json(OVERVIEW_DB, payload)


def main() -> None:
    update_formula_db()
    update_overview_db()
    print("Updated s1-2-1 ~ s1-2-3 main themes and overviews.")


if __name__ == "__main__":
    main()
