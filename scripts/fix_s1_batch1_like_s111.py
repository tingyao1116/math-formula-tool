from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FORMULA_DB = ROOT / "program-db" / "database" / "formula-db.json"
UPDATED_AT = "2026-05-08T13:45:00+08:00"


def load_db() -> dict:
    return json.loads(FORMULA_DB.read_text(encoding="utf-8"))


def save_db(payload: dict) -> None:
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


def build_unit_root(source: dict, *, topic_id: str, title: str, chapter_code: str, order: int) -> dict:
    return {
        "id": topic_id,
        "title": title,
        "formula": {
            "type": "labeled-lines",
            "lines": [
                {"label": "定位", "values": [f"\\text{{{title}}}"]},
                {"label": "摘要", "values": ["\\text{先看本單元主題，再往下展開各主題底下的分支。}"]},
            ],
        },
        "stage": source.get("stage", "高中"),
        "grade": source.get("grade", "高一"),
        "term": source.get("term", "上學期"),
        "chapter": source.get("chapter", title.replace("單元 ", "")),
        "domain": source.get("domain", ""),
        "difficulty": "基礎",
        "chapterRole": "主角",
        "conceptRole": "章節",
        "parentId": "",
        "tags": [chapter_code, title, "單元主軸"],
        "usage": ["先看這個單元底下有哪些主題，再進入每個主題頁。"],
        "examples": ["這一層固定放單元主軸。"],
        "tips": ["單元 root 不直接展示零碎分支，先交給主題頁整理。"],
        "notes": ["這一層是比主題更上面的固定層。"],
        "mistakes": ["不要把單元 root 和主題混成同一層。"],
        "contentTypes": ["單元主軸", "章節導覽"],
        "contentTypesLocked": True,
        "mathNotationLocked": True,
        "modifiedAt": UPDATED_AT,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": source.get("gradeLabel", "高一上"),
        "manualOrder": order,
    }


def build_anchor(source: dict, *, topic_id: str, title: str, parent_id: str, chapter_code: str, order: int) -> dict:
    return {
        "id": topic_id,
        "title": title,
        "formula": source.get("formula") or {
            "type": "labeled-lines",
            "lines": [
                {"label": "定位", "values": [f"\\text{{{title}}}"]},
            ],
        },
        "stage": source.get("stage", "高中"),
        "grade": source.get("grade", "高一"),
        "term": source.get("term", "上學期"),
        "chapter": source.get("chapter", ""),
        "domain": source.get("domain", ""),
        "difficulty": source.get("difficulty", "基礎"),
        "chapterRole": "分支",
        "conceptRole": "主題分支",
        "parentId": parent_id,
        "tags": source.get("tags", []),
        "usage": source.get("usage", []),
        "examples": source.get("examples", []),
        "tips": source.get("tips", []),
        "notes": source.get("notes", []),
        "mistakes": source.get("mistakes", []),
        "contentTypes": source.get("contentTypes", []),
        "contentTypesLocked": source.get("contentTypesLocked", False),
        "mathNotationLocked": source.get("mathNotationLocked", False),
        "modifiedAt": UPDATED_AT,
        "chapter_code": chapter_code,
        "chapterCode": chapter_code,
        "gradeLabel": source.get("gradeLabel", "高一上"),
        "manualOrder": order,
    }


def reparent(topic: dict | None, *, parent_id: str, chapter_code: str, title: str | None = None) -> None:
    if not topic:
        return
    topic["parentId"] = parent_id
    topic["chapterCode"] = chapter_code
    topic["chapter_code"] = chapter_code
    topic["modifiedAt"] = UPDATED_AT
    if title is not None:
        topic["title"] = title


def move_subtree(topics: list[dict], root_id: str, *, parent_id: str, chapter_code: str) -> None:
    root = find_topic(topics, root_id)
    if not root:
        return
    stack = [root]
    first = True
    while stack:
        current = stack.pop()
        current["chapterCode"] = chapter_code
        current["chapter_code"] = chapter_code
        current["modifiedAt"] = UPDATED_AT
        if first:
            current["parentId"] = parent_id
            first = False
        children = [topic for topic in topics if topic.get("parentId") == current.get("id")]
        stack.extend(children)


def apply_s1_1_2(topics: list[dict]) -> None:
    old_root = find_topic(topics, "s1-1-2-absolute-value-core")
    theme = find_topic(topics, "s1-1-2-main-theme-absolute-value")
    if not old_root or not theme:
        return
    unit_root = build_unit_root(old_root, topic_id="s1-1-2-unit-absolute-value", title="單元 2 絕對值", chapter_code="s1-1-2", order=1)
    upsert_topic(topics, unit_root)
    reparent(theme, parent_id=unit_root["id"], chapter_code="s1-1-2")
    reparent(old_root, parent_id=theme["id"], chapter_code="s1-1-2", title="絕對值")
    for branch_id in [
        "absolute-value-definition-properties-high-school",
        "absolute-value-distance-view-high-school",
        "absolute-value-symbolic-simplification-high-school",
        "absolute-value-function-graph-high-school",
        "absolute-value-parameter-range-high-school",
        "absolute-value-equation-inequality-high-school",
    ]:
        reparent(find_topic(topics, branch_id), parent_id=old_root["id"], chapter_code="s1-1-2")


def apply_s1_1_3(topics: list[dict]) -> None:
    root = find_topic(topics, "senior-expression-operations")
    theme1 = find_topic(topics, "s1-1-3-main-theme-formula-radical")
    theme2 = find_topic(topics, "s1-1-3-main-theme-am-gm")
    anchor = find_topic(topics, "s1-1-3-algebraic-operations")
    if not root or not theme1 or not theme2 or not anchor:
        return

    root["title"] = "單元 3 式的運算"
    root["chapterCode"] = "s1-1-3"
    root["chapter_code"] = "s1-1-3"
    root["modifiedAt"] = UPDATED_AT
    reparent(theme1, parent_id=root["id"], chapter_code="s1-1-3")
    reparent(theme2, parent_id=root["id"], chapter_code="s1-1-3")
    reparent(anchor, parent_id=theme1["id"], chapter_code="s1-1-3", title="乘法公式、分式與根式的運算")

    am_gm_source = find_topic(topics, "senior-arithmetic-geometric-mean-s113") or theme2
    am_gm_anchor = build_anchor(
        am_gm_source,
        topic_id="s1-1-3-am-gm-core",
        title="算幾不等式",
        parent_id=theme2["id"],
        chapter_code="s1-1-3",
        order=1,
    )
    upsert_topic(topics, am_gm_anchor)
    reparent(find_topic(topics, "senior-arithmetic-geometric-mean-s113"), parent_id=am_gm_anchor["id"], chapter_code="s1-1-3")

    for branch_id in [
        "senior-binomial-formulas-pascal",
        "senior-cube-sum-difference-factorization",
        "senior-three-variable-identities",
        "senior-completing-square-factorization",
        "senior-reciprocal-power-identities",
        "senior-expression-substitution-evaluation",
        "senior-radical-expression-identities",
        "senior-integer-bounds-from-expansion",
        "senior-high-degree-factorization-patterns",
        "senior-formula-selection-flow",
        "senior-multiplication-identities-expansion-s113",
        "senior-rational-expression-operations-s113",
        "senior-radical-operations-rationalization-s113",
        "senior-radical-estimation-comparison-s113",
    ]:
        reparent(find_topic(topics, branch_id), parent_id=anchor["id"], chapter_code="s1-1-3")

    move_map = {
        "s1-3-1-main-theme-basic": [
            "senior-polynomial-definition-and-terminology",
            "senior-polynomial-interpolation-basics-s131",
        ],
        "s1-3-1-main-theme-arithmetic": [
            "senior-polynomial-add-mul-degree-rules",
            "senior-polynomial-special-coefficient-methods",
            "senior-polynomial-newton-lagrange-forms",
        ],
        "s1-3-1-main-theme-remainder": [
            "senior-polynomial-division-principle",
            "senior-polynomial-coefficient-sum-parity-s131",
            "senior-polynomial-nearby-value-expansion-s131",
            "senior-polynomial-equation-link-s131",
        ],
    }
    for parent_id, ids in move_map.items():
        for topic_id in ids:
            move_subtree(topics, topic_id, parent_id=parent_id, chapter_code="s1-3-1")


def apply_s1_1_4(topics: list[dict]) -> None:
    old_root = find_topic(topics, "s1-1-4-exponent-rules")
    theme = find_topic(topics, "s1-1-4-main-theme-exponent-laws")
    if not old_root or not theme:
        return
    unit_root = build_unit_root(old_root, topic_id="s1-1-4-unit-exponent", title="單元 4 指數", chapter_code="s1-1-4", order=1)
    upsert_topic(topics, unit_root)
    reparent(theme, parent_id=unit_root["id"], chapter_code="s1-1-4")
    reparent(old_root, parent_id=theme["id"], chapter_code="s1-1-4", title="指數律")


def apply_s1_1_5(topics: list[dict]) -> None:
    theme1 = find_topic(topics, "s1-1-5-main-theme-common-log")
    theme2 = find_topic(topics, "s1-1-5-main-theme-scientific-notation")
    log_anchor = find_topic(topics, "s1-1-5-logarithm-core")
    s322_root = find_topic(topics, "senior-logarithm-main-s322")
    s322_target_root = find_topic(topics, "s3-2-2-logarithm-core")
    if not theme1 or not theme2 or not log_anchor:
        return

    source = log_anchor or theme1
    unit_root = build_unit_root(source, topic_id="s1-1-5-unit-logarithm", title="單元 5 對數", chapter_code="s1-1-5", order=1)
    upsert_topic(topics, unit_root)
    reparent(theme1, parent_id=unit_root["id"], chapter_code="s1-1-5")
    reparent(theme2, parent_id=unit_root["id"], chapter_code="s1-1-5")
    reparent(log_anchor, parent_id=theme1["id"], chapter_code="s1-1-5", title="常用對數")

    sci_anchor = build_anchor(
        find_topic(topics, "s1-1-5-scientific-notation-basics") or theme2,
        topic_id="s1-1-5-scientific-notation-core",
        title="科學記號",
        parent_id=theme2["id"],
        chapter_code="s1-1-5",
        order=1,
    )
    upsert_topic(topics, sci_anchor)
    reparent(find_topic(topics, "s1-1-5-scientific-notation-basics"), parent_id=sci_anchor["id"], chapter_code="s1-1-5")
    reparent(find_topic(topics, "s1-1-5-digit-leading-estimation"), parent_id=sci_anchor["id"], chapter_code="s1-1-5")

    s322_ids = [
        "senior-logarithm-basic-facts-s322",
        "senior-logarithm-laws-s322",
        "senior-logarithm-change-base-s322",
        "senior-logarithm-scientific-notation-s322",
        "senior-logarithm-application-models-s322",
        "senior-logarithm-power-swap-identity-s322",
        "senior-logarithm-digit-leading-estimation-s322",
        "senior-logarithm-domain-and-evaluation-s322",
        "senior-logarithm-word-problem-setup-s322",
        "senior-logarithm-chain-cancellation-s322",
        "senior-logarithm-inequality-strategy-s322",
        "senior-logarithm-mixed-base-computation-s322",
    ]
    if s322_target_root:
        for topic_id in s322_ids:
            move_subtree(topics, topic_id, parent_id=s322_target_root["id"], chapter_code="s3-2-2")
    if s322_root:
        s322_root["chapterCode"] = "s3-2-2"
        s322_root["chapter_code"] = "s3-2-2"
        s322_root["modifiedAt"] = UPDATED_AT


def main() -> None:
    payload = load_db()
    topics = payload.get("topics", [])
    apply_s1_1_2(topics)
    apply_s1_1_3(topics)
    apply_s1_1_4(topics)
    apply_s1_1_5(topics)
    payload.setdefault("meta", {})["updatedAt"] = UPDATED_AT
    save_db(payload)


if __name__ == "__main__":
    main()
