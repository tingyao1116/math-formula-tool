import json
from pathlib import Path

from sync_practice_bridge import sync_practice_assignment_js_from_db


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent.parent

DB_DIR = ROOT / "program-db" / "database"
DATA_DIR = ROOT / "data"

CHAPTER_DB = DB_DIR / "chapter-code-db.json"
OVERVIEW_DB = DB_DIR / "chapter-overview-db.json"
OVERVIEW_BODY_DB = DB_DIR / "chapter-overview-body-db.json"
CLOSING_DB = DB_DIR / "chapter-closing-db.json"
MAIN_TOPIC_OVERVIEW_DB = DB_DIR / "main-topic-overview-db.json"
FORMULA_DB = DB_DIR / "formula-db.json"

CHAPTER_JS = DATA_DIR / "chapter-code-config.js"
OVERVIEW_JS = ROOT / "chapter-overviews.js"
OVERVIEW_BODY_JS = ROOT / "chapter-overview-bodies.js"
CLOSING_JS = ROOT / "chapter-closings.js"
MAIN_TOPIC_OVERVIEW_JS = DATA_DIR / "main-topic-overviews.js"
MANAGED_JSON = DATA_DIR / "managed-structure.auto.json"


def read_json(path: Path, fallback):
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_js_store(path: Path, global_name: str, groups: dict, by_code: dict):
    text = (
        f"window.{global_name} = {{\n"
        f"  groups: {json.dumps(groups, ensure_ascii=False, indent=2)}\n"
        "};\n\n"
        "(function () {\n"
        f"  const byCode = {json.dumps(by_code, ensure_ascii=False, indent=2)};\n"
        f"  window.{global_name}.byCode = byCode;\n"
        "})();\n"
    )
    path.write_text(text, encoding="utf-8")


def sync_chapter_js_from_db(chapter_db_path: Path = CHAPTER_DB):
    payload = read_json(chapter_db_path, {"meta": {"count": 0}, "catalog": {}})
    catalog = payload.get("catalog", {})
    text = "window.chapterCodeCatalog = " + json.dumps(catalog, ensure_ascii=False, indent=2) + ";\n"
    CHAPTER_JS.write_text(text, encoding="utf-8")
    return len(catalog)


def infer_meta_from_code(code: str):
    key = str(code or "").strip().lower()
    if key.startswith("j1-"):
        return ("國中", "國一", "上")
    if key.startswith("j2-"):
        return ("國中", "國一", "下")
    if key.startswith("j3-"):
        return ("國中", "國二", "上")
    if key.startswith("j4-"):
        return ("國中", "國二", "下")
    if key.startswith("j5-"):
        return ("國中", "國三", "上")
    if key.startswith("j6-"):
        return ("國中", "國三", "下")
    if key.startswith("s1-"):
        return ("高中", "高一", "上")
    if key.startswith("s2-"):
        return ("高中", "高一", "下")
    if key.startswith("s3-"):
        return ("高中", "高二", "上")
    if key.startswith("s4-"):
        return ("高中", "高二", "下")
    if key.startswith("s5-"):
        return ("高中", "高三", "")
    return ("其他", "", "")


def build_group_name(code: str, chapter_meta: dict, fallback_group_name: str = ""):
    group_name = str(fallback_group_name or "").strip()
    if group_name:
        return group_name
    section = str(chapter_meta.get("section", "")).strip()
    chapter = str(chapter_meta.get("chapter", "")).strip()
    stage, grade, term = infer_meta_from_code(code)
    tail = section or chapter or str(code).strip()
    term_label = f"{grade}{term}" if term else grade
    return "・".join(part for part in [stage, term_label, tail] if part)


def build_store_groups(entries: dict, catalog: dict, default_title: str):
    groups = {}
    by_code = {}
    for code, entry in entries.items():
        if not isinstance(entry, dict):
            continue
        chapter_meta = catalog.get(code, {}) if isinstance(catalog, dict) else {}
        if not isinstance(chapter_meta, dict):
            chapter_meta = {}
        payload = {
            "code": str(code).strip(),
            "title": str(entry.get("title", "")).strip() or default_title,
            "updatedAt": str(entry.get("updatedAt", "")).strip(),
            "variants": entry.get("variants", []) if isinstance(entry.get("variants", []), list) else [],
            "appendGeneratedOutline": bool(entry.get("appendGeneratedOutline")),
        }
        group_name = build_group_name(code, chapter_meta, entry.get("groupName"))
        unique_group_name = group_name
        if unique_group_name in groups:
            unique_group_name = f"{group_name}（{code}）"
        groups[unique_group_name] = payload
        by_code[str(code).strip()] = payload
    return groups, by_code


def sync_chapter_overview_js_from_db(
    overview_db_path: Path = OVERVIEW_DB,
    chapter_db_path: Path = CHAPTER_DB,
):
    overview_payload = read_json(overview_db_path, {"meta": {"count": 0}, "overviews": {}})
    chapter_payload = read_json(chapter_db_path, {"meta": {"count": 0}, "catalog": {}})
    groups, by_code = build_store_groups(
        overview_payload.get("overviews", {}),
        chapter_payload.get("catalog", {}),
        "章節重點大綱",
    )
    write_js_store(OVERVIEW_JS, "chapterOverviewStore", groups, by_code)
    return len(groups)


def sync_chapter_overview_body_js_from_db(
    overview_body_db_path: Path = OVERVIEW_BODY_DB,
    chapter_db_path: Path = CHAPTER_DB,
):
    body_payload = read_json(overview_body_db_path, {"meta": {"count": 0}, "bodies": {}})
    chapter_payload = read_json(chapter_db_path, {"meta": {"count": 0}, "catalog": {}})
    groups, by_code = build_store_groups(
        body_payload.get("bodies", {}),
        chapter_payload.get("catalog", {}),
        "章節正文",
    )
    write_js_store(OVERVIEW_BODY_JS, "chapterOverviewBodyStore", groups, by_code)
    return len(groups)


def sync_chapter_closing_js_from_db(
    closing_db_path: Path = CLOSING_DB,
    chapter_db_path: Path = CHAPTER_DB,
):
    closing_payload = read_json(closing_db_path, {"meta": {"count": 0}, "closings": {}})
    chapter_payload = read_json(chapter_db_path, {"meta": {"count": 0}, "catalog": {}})
    groups, by_code = build_store_groups(
        closing_payload.get("closings", {}),
        chapter_payload.get("catalog", {}),
        "章節後話",
    )
    write_js_store(CLOSING_JS, "chapterClosingStore", groups, by_code)
    return len(groups)


def sync_main_topic_overview_js_from_db(main_topic_overview_db_path: Path = MAIN_TOPIC_OVERVIEW_DB):
    payload = read_json(main_topic_overview_db_path, {"meta": {"count": 0}, "byId": {}})
    by_id = payload.get("byId", {})
    if not isinstance(by_id, dict):
        by_id = {}
    store = {
        "meta": payload.get("meta", {}) if isinstance(payload.get("meta", {}), dict) else {},
        "byId": by_id,
    }
    MAIN_TOPIC_OVERVIEW_JS.write_text(
        "window.mainTopicOverviewStore = " + json.dumps(store, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    return len(by_id)


def sync_managed_json_from_topics_db(formula_db_path: Path = FORMULA_DB):
    payload = read_json(formula_db_path, {"topics": [], "meta": {}})
    topics = payload.get("topics", [])
    state = {
        "schema": "math-formula-structure-state-v1",
        "savedAt": payload.get("meta", {}).get("updatedAt") or payload.get("meta", {}).get("generatedAt"),
        "items": topics,
    }
    MANAGED_JSON.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    return len(state.get("items", []))


def sync_extra_web_from_db():
    overview_count = sync_chapter_overview_js_from_db()
    overview_body_count = sync_chapter_overview_body_js_from_db()
    chapter_count = sync_chapter_js_from_db()
    closing_count = sync_chapter_closing_js_from_db()
    sync_main_topic_overview_js_from_db()
    managed_count = sync_managed_json_from_topics_db()
    practice_count = sync_practice_assignment_js_from_db()
    return overview_count, overview_body_count, chapter_count, closing_count, managed_count, practice_count


if __name__ == "__main__":
    print(sync_extra_web_from_db())
